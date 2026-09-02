import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import QRCode from 'qrcode'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Sheet } from '../../components/Sheet'
import { Modal } from '../../components/Modal'
import { Select } from '../../components/Select'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { RiscoPorDimensaoGrid, MapaCalorTable } from '../../components/Nr1Resultado'
import { Nr1CicloStatusCard } from '../../components/Nr1CicloStatusCard'
import { Nr1PerguntasSheet, type Nr1PerguntasEscopo } from '../../components/Nr1PerguntasSheet'
import { Nr1RiscosSugeridosTab } from '../../components/Nr1RiscosSugeridos'
import { PAGE_MAX_W } from '../../lib/layout'
import { fmtData, pct } from '../../lib/nr1'
import { useService } from '../../hooks/useService'
import { nr1CampanhaService, nr1ModeloService, nr1ResultadoService } from '../../services/nr1'
import { rhColaboradorService } from '../../services/rh'
import type { Nr1Campanha, Nr1QuestionarioModelo } from '../../types'

/** Link único do ciclo — identifica empresa e ciclo pelo próprio protocolo
   (já único e já no formato "NR1-{empresa}-{ano}-{sequencial}"), sem
   precisar de um campo novo só para isso. Quem acessa por ele entra direto
   na avaliação anônima, sem depender de um convite individual (Convites
   continua existindo, para quem prefere aquele fluxo). */
const nr1LinkAvaliacao = (protocolo: string) => `https://app.yna.com.br/a/${protocolo}`

/* NR1-RH-01/G01 — Ciclos de avaliação (RF-B01/B04, RF-RH-NR1-10, RF-G01/02/03).

   Renomeada de "Campanhas" para "Ciclos de avaliação" — e absorveu a antiga
   tela "Ciclos e reavaliação" (comparação de dimensões entre campanhas, que
   vivia sozinha em `/rh/nr1/ciclos`). As duas eram, na prática, a mesma
   pergunta ("como estamos indo, campanha a campanha?") em dois lugares
   diferentes do menu — exatamente o tipo de navegação cruzada e confusa que
   motivou esta reestruturação.

   Estrutura: lista de todos os ciclos (o em campo em destaque, histórico
   abaixo), cada um com o mesmo card de estado usado na Home e no próprio
   detalhe do ciclo (`components/Nr1CicloStatusCard.tsx`). A "Evolução por
   dimensão" (comparação entre os dois ciclos mais recentes) saiu daqui e
   foi para o Inventário de riscos (`NR1RhInventario.tsx`) — mais perto de
   onde o RH já olha para o risco por dimensão/área, não misturada com a
   lista de ciclos. Ao abrir um ciclo, tela de detalhe com duas abas:
   "Engajamento" (participação total e por área — o que a tela antiga
   sempre mostrava) e "Resultado" (risco por dimensão + mapa de calor
   DAQUELE ciclo, não sempre o retrato mais recente).

   O RH escolhe o modelo + versão a aplicar e acompanha a participação por
   área em tempo real. O que ele NÃO faz aqui: editar o questionário. Toda a
   configuração do instrumento vive no backoffice da YNA.

   Terceira aba "Riscos sugeridos" (`components/Nr1RiscosSugeridos.tsx`): 7
   leituras de padrão psicossocial (triagem assistida, com possível
   enquadramento CID-11) calculadas a partir do mesmo dado do "Risco por
   dimensão"/mapa de calor deste ciclo — nunca um diagnóstico automático.

   Nomenclatura: só a identidade voltada ao RH mudou (rótulo do menu, rota,
   títulos de página). O tipo de dado por trás continua `Nr1Campanha` — não
   há ganho em renomear isso em todo o módulo (inventário, relatório,
   trilha, serviços), só uma reforma cosmética de grande alcance para um
   pedido que era sobre navegação, não sobre o nome do dado. */

/** Abaixo disso a área entra na lista de lembrete sugerido. */
const META_PARTICIPACAO = 60

export function NR1RhCiclos() {
  const { campanhaId } = useParams<{ campanhaId?: string }>()
  return campanhaId ? <CicloDetalheScreen campanhaId={campanhaId} /> : <CicloListaScreen />
}

/* ------------------------------------------------------------------
   Lista de ciclos de avaliação
   ------------------------------------------------------------------ */

function CicloListaScreen() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const campanhas = useService(() => nr1CampanhaService.list(), [])
  const [novoOpen, setNovoOpen] = useState(false)
  const [emCampoAviso, setEmCampoAviso] = useState<Nr1Campanha | null>(null)

  /* Parâmetro só de demonstração — `?cenario=sem-ciclo` mostra a tela como
     se não houvesse ciclo em campo, sem precisar encerrar o ciclo real de
     verdade (útil pra apresentar os dois estados da tela). Sem o
     parâmetro, o padrão é o estado real dos dados: hoje, com um ciclo em
     campo. Não existe `?cenario=com-ciclo` porque esse já é o padrão. */
  const cenarioSemCiclo = params.get('cenario') === 'sem-ciclo'
  const campanhasVisiveis = campanhas.status === 'success'
    ? (cenarioSemCiclo ? campanhas.data.filter((c) => c.status !== 'em-campo') : campanhas.data)
    : []

  const ativa = campanhasVisiveis.find((c) => c.status === 'em-campo')

  /* Só um ciclo em campo por vez — respostas de dois ciclos abertos ao
     mesmo tempo se misturariam, e o mapa de calor/inventário não teriam
     como saber de qual delas cada resposta veio. Por isso o aviso em vez
     de deixar abrir direto. */
  const iniciarNovoCiclo = () => {
    if (ativa) setEmCampoAviso(ativa)
    else setNovoOpen(true)
  }

  const fecharNovoCiclo = () => {
    setNovoOpen(false)
    campanhas.reload()
  }

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />

        <PageHeader
          className="mt-2 lg:mt-0"
          title="Ciclos de avaliação"
          subtitle="Todas as campanhas de avaliação psicossocial, passadas e em campo."
          action={<Button size="sm" iconLeft="ph:calendar-plus-bold" onClick={iniciarNovoCiclo}>Novo ciclo</Button>}
        />

        {(campanhas.status === 'idle' || campanhas.status === 'loading') && (
          <div className="flex flex-col gap-3"><Skeleton className="h-40 w-full rounded-lg" /><Skeleton className="h-24 w-full rounded-lg" /></div>
        )}
        {campanhas.status === 'error' && <ErrorState message={campanhas.message} onRetry={campanhas.reload} />}
        {campanhas.status === 'success' && campanhasVisiveis.length === 0 && (
          <div className="rounded-lg border border-border bg-surface px-5 py-14 text-center">
            <p className="text-[15px] font-semibold text-ink">Nenhum ciclo ainda</p>
            <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-ink-secondary">
              Inicie o primeiro ciclo de avaliação quando estiver pronto.
            </p>
            <Button className="mt-4" iconLeft="ph:calendar-plus-bold" onClick={iniciarNovoCiclo}>Novo ciclo</Button>
          </div>
        )}
        {campanhas.status === 'success' && campanhasVisiveis.length > 0 && (
          <ListaCampanhas campanhas={campanhasVisiveis} onOpen={(id) => navigate(`/rh/nr1/ciclos/${id}`)} />
        )}
      </div>

      <Modal open={emCampoAviso !== null} title="Existe um ciclo em andamento" onClose={() => setEmCampoAviso(null)}>
        {emCampoAviso && (
          <div className="flex flex-col gap-4">
            <p className="text-[13.5px] leading-relaxed text-ink-secondary">
              O ciclo <span className="font-semibold text-ink">{emCampoAviso.nome}</span> ainda está em campo.
              Só um ciclo fica em campo por vez, para as respostas não se misturarem entre janelas diferentes.
              Finalize esse ciclo antes de iniciar um novo.
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => setEmCampoAviso(null)}>Fechar</Button>
              <Button
                iconRight="ph:arrow-right-bold"
                onClick={() => navigate(`/rh/nr1/ciclos/${emCampoAviso.id}`)}
              >
                Ver ciclo em andamento
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <NovoCicloSheet open={novoOpen} onClose={fecharNovoCiclo} />
    </div>
  )
}

function ListaCampanhas({ campanhas, onOpen }: { campanhas: Nr1Campanha[]; onOpen: (id: string) => void }) {
  const ativa = campanhas.find((c) => c.status === 'em-campo')
  const outras = [...campanhas.filter((c) => c.id !== ativa?.id)].sort((a, b) => b.inicio.localeCompare(a.inicio))

  return (
    <div className="flex flex-col gap-6">
      {ativa && (
        <section>
          <h2 className="mb-3 text-[15px] font-semibold text-ink">Ciclo em campo</h2>
          <Nr1CicloStatusCard campanha={ativa} destaque onClick={() => onOpen(ativa.id)} />
        </section>
      )}
      <section>
        <h2 className="mb-3 text-[15px] font-semibold text-ink">Histórico</h2>
        {outras.length > 0 ? (
          <div className="flex flex-col gap-2">
            {outras.map((c) => <Nr1CicloStatusCard key={c.id} campanha={c} onClick={() => onOpen(c.id)} />)}
          </div>
        ) : (
          <p className="rounded-lg border border-border bg-surface px-4 py-8 text-center text-[13px] text-ink-secondary">
            Nenhum ciclo anterior ainda.
          </p>
        )}
      </section>

      <div className="flex gap-3 rounded-lg border border-border bg-surface-2 p-4">
        <Icon icon="ph:arrows-clockwise-bold" width={20} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
        <p className="text-[12px] leading-relaxed text-ink-secondary">
          O PGR é um processo contínuo, não um evento único. Além da cadência regular, vale
          reavaliar após mudanças relevantes como reestruturação, fusão ou novo turno, porque elas
          alteram o risco psicossocial.
        </p>
      </div>
    </div>
  )
}

const NOVO_CICLO_INPUT_CLS = 'w-full rounded border-[1.5px] border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary'

const mais21Dias = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 21)
  return d.toISOString().slice(0, 10)
}

function NovoCicloSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="Novo ciclo de avaliação" icon="ph:calendar-plus-bold" size="md">
      {open && <NovoCicloConteudo onClose={onClose} />}
    </Sheet>
  )
}

/* Cadastro simples de propósito: título, questionário (resolve pra última
   versão publicada, mesmo critério de "Trocar instrumento" — RH não edita
   conteúdo de questionário) e datas. Ao salvar, o ciclo já entra em campo —
   não existe um estado de rascunho neste fluxo simplificado, então não faz
   sentido criar um só pra publicar em seguida. */
function NovoCicloConteudo({ onClose }: { onClose: () => void }) {
  const modelos = useService(() => nr1ModeloService.list(), [])
  const [nome, setNome] = useState('')
  const [modeloId, setModeloId] = useState('')
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [criada, setCriada] = useState<Nr1Campanha | null>(null)

  useEffect(() => {
    if (modelos.status === 'success' && !modeloId && modelos.data.length > 0) setModeloId(modelos.data[0]!.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelos.status])

  const modelo = modelos.status === 'success' ? modelos.data.find((m) => m.id === modeloId) : undefined
  const publicada = modelo?.versoes.find((v) => v.status === 'publicada')

  const onInicio = (v: string) => { setInicio(v); if (v) setFim(mais21Dias(v)) }

  const datasOk = Boolean(inicio) && Boolean(fim) && fim > inicio
  const valido = nome.trim().length > 2 && Boolean(publicada) && datasOk

  const criar = async () => {
    if (!valido || !publicada) return
    setSalvando(true)
    const nova = await nr1CampanhaService.criar({ nome: nome.trim(), modeloId, versao: publicada.versao, inicio, fim })
    setSalvando(false)
    setCriada(nova)
  }

  if (criada) return <CicloCriadoSucesso campanha={criada} onConcluir={onClose} />

  return (
    <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
      <Input
        label="Título do ciclo"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Ex.: Avaliação de riscos psicossociais · 2º semestre 2026"
      />

      <div>
        <p className="mb-1.5 text-[13px] font-semibold text-ink">Questionário</p>
        {(modelos.status === 'idle' || modelos.status === 'loading') && <Skeleton className="h-11 w-full rounded-lg" />}
        {modelos.status === 'error' && <ErrorState message={modelos.message} onRetry={modelos.reload} />}
        {modelos.status === 'success' && (
          <Select
            value={modeloId}
            onChange={setModeloId}
            ariaLabel="Questionário"
            options={modelos.data.map((m) => ({ value: m.id, label: m.escopo === 'yna' ? `${m.nome} (base)` : m.nome }))}
          />
        )}
        {modelo && !publicada && (
          <p className="mt-1.5 text-[12px] leading-relaxed text-warning-ink">
            Este modelo ainda não tem versão publicada e não pode ser aplicado num ciclo.
          </p>
        )}
        {publicada && (
          <p className="mt-1.5 text-[12px] text-ink-secondary">Versão {publicada.versao}, publicada pela YNA.</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink">Data de início</span>
          <input type="date" value={inicio} onChange={(e) => onInicio(e.target.value)} className={NOVO_CICLO_INPUT_CLS} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink">Data de término</span>
          <input type="date" value={fim} min={inicio || undefined} onChange={(e) => setFim(e.target.value)} className={NOVO_CICLO_INPUT_CLS} />
        </label>
      </div>
      {inicio && fim && !datasOk && <p className="-mt-2 text-[12.5px] text-danger-ink">O término deve ser depois do início.</p>}

      <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button iconLeft="ph:check-bold" disabled={!valido || salvando} onClick={criar}>
          {salvando ? 'Iniciando…' : 'Iniciar ciclo'}
        </Button>
      </div>
    </div>
  )
}

/* Tela final do cadastro — o ciclo já está em campo, então divulgar o link
   é a próxima ação natural. Mostra as três opções direto (sem precisar
   abrir o menu "Compartilhar" de novo), reaproveitando os mesmos modais do
   cabeçalho do ciclo. */
function CicloCriadoSucesso({ campanha, onConcluir }: { campanha: Nr1Campanha; onConcluir: () => void }) {
  const link = nr1LinkAvaliacao(campanha.protocolo)

  return (
    <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
      <div className="flex items-start gap-3 rounded-lg bg-success-bg px-4 py-3.5">
        <Icon icon="ph:check-circle-bold" width={20} className="mt-0.5 shrink-0 text-success-ink" aria-hidden />
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold text-success-ink">Ciclo iniciado</p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-secondary">
            {campanha.nome} já está em campo. Protocolo {campanha.protocolo}.
          </p>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[13px] font-semibold text-ink">Link da avaliação</p>
        <p className="break-all rounded-lg border border-border bg-surface-2 px-4 py-3 font-mono text-[13px] text-ink">{link}</p>
      </div>

      <div>
        <p className="mb-1.5 text-[13px] font-semibold text-ink">Compartilhar</p>
        <CompartilharLinkOpcoes link={link} campanhaId={campanha.id} />
      </div>

      <Button fullWidth onClick={onConcluir}>Concluir</Button>
    </div>
  )
}

/* As mesmas três formas de compartilhar do menu "Compartilhar" (cabeçalho
   do ciclo), aqui como botões diretos — o ciclo acabou de entrar em campo,
   então faz sentido já mostrar as opções, em vez de escondê-las atrás de
   mais um clique. */
function CompartilharLinkOpcoes({ link, campanhaId }: { link: string; campanhaId: string }) {
  const [linkAberto, setLinkAberto] = useState(false)
  const [qrAberto, setQrAberto] = useState(false)
  const [convitesAberto, setConvitesAberto] = useState(false)

  const opcoes = [
    { icon: 'ph:copy-bold', label: 'Copiar link', onClick: () => setLinkAberto(true) },
    { icon: 'ph:qr-code-bold', label: 'Mostrar QR Code', onClick: () => setQrAberto(true) },
    { icon: 'ph:paper-plane-tilt-bold', label: 'Enviar convites', onClick: () => setConvitesAberto(true) },
  ]

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {opcoes.map((o) => (
          <button
            key={o.label}
            onClick={o.onClick}
            className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-3.5 text-center transition-colors hover:bg-surface-hover"
          >
            <Icon icon={o.icon} width={20} className="text-primary dark:text-primary-300" aria-hidden />
            <span className="text-[11.5px] font-medium leading-tight text-ink">{o.label}</span>
          </button>
        ))}
      </div>

      <CopiarLinkModal open={linkAberto} link={link} onClose={() => setLinkAberto(false)} />
      <QrCodeModal open={qrAberto} link={link} onClose={() => setQrAberto(false)} />
      <EnviarConvitesModal open={convitesAberto} campanhaId={campanhaId} onClose={() => setConvitesAberto(false)} />
    </>
  )
}

/* ------------------------------------------------------------------
   Detalhe de um ciclo — abas Engajamento / Resultado
   ------------------------------------------------------------------ */

const TABS = [
  { key: 'engajamento', label: 'Engajamento' },
  { key: 'resultado', label: 'Resultado' },
  { key: 'riscos-sugeridos', label: 'Riscos sugeridos' },
] as const
type TabKey = (typeof TABS)[number]['key']

function CicloDetalheScreen({ campanhaId }: { campanhaId: string }) {
  const campanha = useService(() => nr1CampanhaService.get(campanhaId), [campanhaId])
  const [tab, setTab] = useState<TabKey>('engajamento')
  const [trocarOpen, setTrocarOpen] = useState(false)
  const [lembrete, setLembrete] = useState<{ areas: string[]; enviados?: number } | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [encerrarOpen, setEncerrarOpen] = useState(false)
  const [encerrando, setEncerrando] = useState(false)

  const encerrar = async () => {
    setEncerrando(true)
    await nr1CampanhaService.encerrar(campanhaId)
    setEncerrando(false)
    setEncerrarOpen(false)
    campanha.reload()
  }

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />

        <Link to="/rh/nr1/ciclos" className="mt-2 mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary transition-colors hover:text-ink lg:mt-0">
          <Icon icon="ph:arrow-left-bold" width={14} aria-hidden />
          Ciclos de avaliação
        </Link>

        <PageHeader
          title={campanha.status === 'success' && campanha.data ? campanha.data.nome : 'Ciclo de avaliação'}
          subtitle={
            campanha.status === 'success' && campanha.data
              ? `Protocolo ${campanha.data.protocolo} · ${fmtData(campanha.data.inicio)} a ${fmtData(campanha.data.fim)}`
              : 'O ciclo que gera o inventário de riscos psicossociais.'
          }
          action={campanha.status === 'success' && campanha.data && campanha.data.status === 'em-campo' ? (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="danger" iconLeft="ph:stop-circle-bold" onClick={() => setEncerrarOpen(true)}>
                <span className="hidden sm:inline">Encerrar ciclo</span>
              </Button>
              <CompartilharLinkMenu link={nr1LinkAvaliacao(campanha.data.protocolo)} campanhaId={campanha.data.id} />
            </div>
          ) : undefined}
        />

        {(campanha.status === 'idle' || campanha.status === 'loading') && (
          <div className="flex flex-col gap-3"><Skeleton className="h-40 w-full rounded-lg" /><Skeleton className="h-64 w-full rounded-lg" /></div>
        )}
        {campanha.status === 'error' && <ErrorState message={campanha.message} onRetry={campanha.reload} />}
        {campanha.status === 'success' && !campanha.data && (
          <div className="rounded-lg border border-border bg-surface px-5 py-14 text-center">
            <p className="text-[15px] font-semibold text-ink">Ciclo não encontrado</p>
            <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-ink-secondary">
              Ele pode ter sido removido, ou o link está incorreto.
            </p>
          </div>
        )}

        {campanha.status === 'success' && campanha.data && (
          <>
            <div className="mb-5 flex gap-1 rounded-lg bg-surface-2 p-1" role="tablist" aria-label="Seções do ciclo">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-1 rounded-lg px-3 py-2.5 font-heading text-sm font-semibold transition-all ${
                    tab === t.key ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'engajamento' && (
              <CampanhaEngajamento
                campanha={campanha.data}
                onTrocar={() => setTrocarOpen(true)}
                onLembrar={(areas) => setLembrete({ areas })}
              />
            )}
            {tab === 'resultado' && <CampanhaResultado campanhaId={campanha.data.id} />}
            {tab === 'riscos-sugeridos' && <Nr1RiscosSugeridosTab campanhaId={campanha.data.id} />}
          </>
        )}
      </div>

      {/* Seleção de modelo + versão */}
      <TrocarInstrumentoSheet
        open={trocarOpen}
        campanha={campanha.status === 'success' ? campanha.data : undefined}
        onClose={() => setTrocarOpen(false)}
        onSaved={() => { setTrocarOpen(false); campanha.reload() }}
        onErro={(m) => { setTrocarOpen(false); setErro(m) }}
      />

      <Modal open={lembrete !== null} title="Enviar lembrete" onClose={() => setLembrete(null)}>
        {lembrete && (
          <div className="flex flex-col gap-4">
            {lembrete.enviados === undefined ? (
              <>
                <p className="text-[13.5px] leading-relaxed text-ink-secondary">
                  Enviar um lembrete para {lembrete.areas.length === 1 ? 'a área' : 'as áreas'}{' '}
                  <span className="font-semibold text-ink">{lembrete.areas.join(', ')}</span>?
                  O lembrete vai para todos os elegíveis da área, nunca só para quem não respondeu.
                  Saber quem respondeu quebraria o anonimato.
                </p>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setLembrete(null)}>Cancelar</Button>
                  <Button
                    fullWidth
                    iconLeft="ph:paper-plane-tilt-bold"
                    onClick={async () => {
                      const r = await nr1CampanhaService.lembrar(lembrete.areas)
                      setLembrete({ ...lembrete, enviados: r.enviados })
                    }}
                  >
                    Enviar lembrete
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-[13.5px] leading-relaxed text-ink-secondary">
                  Lembrete enviado para {lembrete.enviados} {lembrete.enviados === 1 ? 'área' : 'áreas'}.
                </p>
                <Button fullWidth onClick={() => setLembrete(null)}>Fechar</Button>
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal open={erro !== null} title="Instrumento não alterado" onClose={() => setErro(null)}>
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px] leading-relaxed text-ink-secondary">{erro}</p>
          <Button fullWidth onClick={() => setErro(null)}>Entendi</Button>
        </div>
      </Modal>

      <Modal open={encerrarOpen} title="Encerrar ciclo" onClose={() => setEncerrarOpen(false)}>
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px] leading-relaxed text-ink-secondary">
            O ciclo {campanha.status === 'success' && campanha.data ? <span className="font-semibold text-ink">{campanha.data.nome}</span> : 'atual'} para de coletar respostas a partir de agora. Essa ação não pode ser desfeita.
            As respostas já recebidas continuam valendo para o inventário e o relatório.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setEncerrarOpen(false)}>Cancelar</Button>
            <Button variant="danger" iconLeft="ph:stop-circle-bold" disabled={encerrando} onClick={encerrar}>
              {encerrando ? 'Encerrando…' : 'Encerrar ciclo'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function TrocarInstrumentoSheet({ open, campanha, onClose, onSaved, onErro }: {
  open: boolean
  campanha?: Nr1Campanha
  onClose: () => void
  onSaved: () => void
  onErro: (m: string) => void
}) {
  const modelos = useService(() => nr1ModeloService.list(), [])

  return (
    <Sheet open={open} onClose={onClose} title="Instrumento do ciclo" icon="ph:seal-check-bold" size="md">
      {campanha && modelos.status === 'success' && (
        <SelecionarInstrumento
          campanha={campanha}
          modelos={modelos.data}
          onClose={onClose}
          onSaved={onSaved}
          onErro={onErro}
        />
      )}
      {modelos.status === 'loading' && <div className="px-5 py-6"><Skeleton className="h-40 w-full rounded-lg" /></div>}
    </Sheet>
  )
}

/* Aba "Engajamento" — participação total e por área (a tela original). */
function CampanhaEngajamento({ campanha, onTrocar, onLembrar }: {
  campanha: Nr1Campanha
  onTrocar: () => void
  onLembrar: (areas: string[]) => void
}) {
  const abaixoDaMeta = campanha.participacao.filter((p) => pct(p.respostas, p.elegiveis) < META_PARTICIPACAO)

  return (
    <>
      {/* Estado do ciclo — mesmo card da Visão geral (NR1RhCockpit.tsx),
         para as duas telas nunca discordarem sobre o mesmo ciclo. */}
      <div className="mb-6">
        <Nr1CicloStatusCard campanha={campanha} />
      </div>

      {/* Instrumento aplicado — o registro metodológico */}
      <section className="mb-6 rounded-lg border border-border bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
              <Icon icon="ph:seal-check-bold" width={20} aria-hidden />
            </span>
            <div className="min-w-0">
              <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">Instrumento aplicado</span>
              <p className="mt-1 font-heading text-[15px] font-semibold text-ink">{campanha.modeloNome}</p>
              <p className="mt-0.5 text-[12.5px] text-ink-secondary">Versão {campanha.versao} · registrada no ciclo e em cada resposta</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            iconLeft="ph:swap-bold"
            disabled={campanha.status !== 'rascunho'}
            onClick={onTrocar}
          >
            Trocar
          </Button>
        </div>

        {campanha.status === 'em-campo' && (
          <p className="mt-3 flex items-start gap-2 border-t border-border pt-3 text-[12px] leading-relaxed text-ink-muted">
            <Icon icon="ph:lock-simple-bold" width={13} className="mt-0.5 shrink-0" aria-hidden />
            O ciclo já está em campo. A versão aplicada não muda no meio do ciclo. É assim que
            as respostas seguem comparáveis e a metodologia se sustenta.
          </p>
        )}
        {campanha.status === 'encerrada' && (
          <p className="mt-3 flex items-start gap-2 border-t border-border pt-3 text-[12px] leading-relaxed text-ink-muted">
            <Icon icon="ph:lock-simple-bold" width={13} className="mt-0.5 shrink-0" aria-hidden />
            O ciclo já foi encerrado. A versão aplicada permanece registrada, como parte da
            rastreabilidade deste ciclo.
          </p>
        )}
      </section>

      {/* Participação por área */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[15px] font-semibold text-ink">Participação por área</h2>
          {/* Lembrete só faz sentido enquanto o ciclo ainda está coletando
             respostas — para um ciclo encerrado, não há mais o que lembrar. */}
          {campanha.status === 'em-campo' && abaixoDaMeta.length > 0 && (
            <Button
              size="sm"
              variant="secondary"
              iconLeft="ph:bell-ringing-bold"
              onClick={() => onLembrar(abaixoDaMeta.map((a) => a.departamento))}
            >
              Lembrar {abaixoDaMeta.length} {abaixoDaMeta.length === 1 ? 'área' : 'áreas'}
            </Button>
          )}
        </div>

        <ul className="flex flex-col gap-2">
          {campanha.participacao.map((p) => {
            const taxa = pct(p.respostas, p.elegiveis)
            const baixa = taxa < META_PARTICIPACAO
            return (
              <li key={p.departamentoId} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-heading text-[13.5px] font-semibold text-ink">{p.departamento}</p>
                    <p className="mt-0.5 text-[12px] text-ink-secondary">{p.respostas} de {p.elegiveis} pessoas</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {baixa && (
                      <span className="hidden items-center gap-1 rounded-pill bg-warning-bg px-2.5 py-1 text-[11px] font-semibold text-warning-ink sm:inline-flex">
                        <Icon icon="ph:trend-down-bold" width={11} aria-hidden />
                        Abaixo da meta
                      </span>
                    )}
                    <p className="w-12 text-right font-mono text-[15px] font-bold text-ink">{taxa}%</p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-pill bg-surface-2">
                  <div
                    className={`h-full rounded-pill transition-all duration-500 ${baixa ? 'bg-warning' : 'bg-success'}`}
                    style={{ width: `${taxa}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>

        <div className="mt-4 flex gap-3 rounded-lg border border-border bg-surface-2 p-4">
          <Icon icon="ph:eye-slash-bold" width={20} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
          <p className="text-[12px] leading-relaxed text-ink-secondary">
            Você vê quantas pessoas responderam por área, mas não quem respondeu. Os lembretes vão
            para toda a área: não existe lista de pendentes, e isso é proposital.
          </p>
        </div>
      </section>
    </>
  )
}

/** Botão "Compartilhar" do link da avaliação — menu com três formas de
   repassar o mesmo link (copiar, QR Code, convites por e-mail), sem
   duplicar a lógica de cada uma em botões separados espalhados pela tela. */
function CompartilharLinkMenu({ link, campanhaId }: { link: string; campanhaId: string }) {
  const [aberto, setAberto] = useState(false)
  const [linkAberto, setLinkAberto] = useState(false)
  const [qrAberto, setQrAberto] = useState(false)
  const [convitesAberto, setConvitesAberto] = useState(false)

  return (
    <div className="relative shrink-0">
      <Button size="sm" iconLeft="ph:share-network-bold" onClick={() => setAberto((v) => !v)}>
        <span className="hidden sm:inline">Compartilhar</span>
      </Button>

      {aberto && (
        <>
          <div className="fixed inset-0 z-30" aria-hidden onClick={() => setAberto(false)} />
          <div role="menu" aria-label="Compartilhar link da avaliação" className="absolute right-0 top-full z-40 mt-1.5 w-60 rounded-lg border border-border bg-surface py-1 shadow-lg">
            <button
              role="menuitem"
              onClick={() => { setAberto(false); setLinkAberto(true) }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13.5px] text-ink transition-colors hover:bg-surface-hover"
            >
              <Icon icon="ph:copy-bold" width={16} className="text-ink-secondary" aria-hidden />
              Copiar link
            </button>
            <button
              role="menuitem"
              onClick={() => { setAberto(false); setQrAberto(true) }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13.5px] text-ink transition-colors hover:bg-surface-hover"
            >
              <Icon icon="ph:qr-code-bold" width={16} className="text-ink-secondary" aria-hidden />
              Mostrar QR Code
            </button>
            <button
              role="menuitem"
              onClick={() => { setAberto(false); setConvitesAberto(true) }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13.5px] text-ink transition-colors hover:bg-surface-hover"
            >
              <Icon icon="ph:paper-plane-tilt-bold" width={16} className="text-ink-secondary" aria-hidden />
              Enviar convites
            </button>
          </div>
        </>
      )}

      <CopiarLinkModal open={linkAberto} link={link} onClose={() => setLinkAberto(false)} />
      <QrCodeModal open={qrAberto} link={link} onClose={() => setQrAberto(false)} />
      <EnviarConvitesModal open={convitesAberto} campanhaId={campanhaId} onClose={() => setConvitesAberto(false)} />
    </div>
  )
}

/* Mostra o link por extenso antes de copiar — quem vai usá-lo (colar num
   e-mail, num post interno) costuma querer conferir o que está copiando,
   não só confiar que o clique funcionou. O botão avisa quando a cópia dá
   certo (ícone e rótulo mudam por 2s) e volta ao estado normal depois,
   mesmo padrão já usado pra copiar texto do kit de comunicação. */
function CopiarLinkModal({ open, link, onClose }: { open: boolean; link: string; onClose: () => void }) {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopiado(true)
      window.setTimeout(() => setCopiado(false), 2000)
    } catch {
      /* Sem permissão de área de transferência: o link continua selecionável no campo acima. */
    }
  }

  return (
    <Modal open={open} title="Link da avaliação" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="break-all rounded-lg border border-border bg-surface-2 px-4 py-3 font-mono text-[13px] text-ink">
          {link}
        </p>
        <Button fullWidth iconLeft={copiado ? 'ph:check-bold' : 'ph:copy-bold'} onClick={copiar}>
          {copiado ? 'Copiado' : 'Copiar link'}
        </Button>
      </div>
    </Modal>
  )
}

/* QR Code do link — gerado no cliente (biblioteca `qrcode`), sem chamada de
   rede: o link em si é só texto, não precisa de um serviço externo pra
   virar imagem. Bom pra cartaz e material impresso, onde copiar um link
   longo à mão não é prático. */
function QrCodeModal({ open, link, onClose }: { open: boolean; link: string; onClose: () => void }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!open) { setDataUrl(null); return }
    let cancelado = false
    QRCode.toDataURL(link, { margin: 1, width: 220 }).then((url) => { if (!cancelado) setDataUrl(url) })
    return () => { cancelado = true }
  }, [open, link])

  const baixar = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `qr-code-${link.split('/').pop() ?? 'avaliacao'}.png`
    a.click()
  }

  return (
    <Modal open={open} title="QR Code da avaliação" onClose={onClose}>
      <div className="flex flex-col items-center gap-4">
        {dataUrl ? (
          <img src={dataUrl} alt="QR Code do link da avaliação" width={220} height={220} className="rounded-lg border border-border" />
        ) : (
          <Skeleton className="h-[220px] w-[220px] rounded-lg" />
        )}
        <p className="text-center text-[12.5px] leading-relaxed text-ink-secondary">
          Aponte a câmera do celular para acessar a avaliação. Funciona bem em cartazes e
          materiais impressos.
        </p>
        <div className="flex w-full gap-2">
          <Button variant="secondary" fullWidth iconLeft="ph:download-simple-bold" disabled={!dataUrl} onClick={baixar}>
            Baixar
          </Button>
          <Button fullWidth onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </Modal>
  )
}

/* Envia o link por e-mail a todos os colaboradores com e-mail cadastrado, de
   uma vez — não é um envio pessoa a pessoa, é um disparo só. Mesmo padrão de
   dois estados (pedir confirmação → mostrar resultado) do modal "Enviar
   lembrete", na mesma tela. */
function EnviarConvitesModal({ open, campanhaId, onClose }: { open: boolean; campanhaId: string; onClose: () => void }) {
  const colaboradores = useService(() => rhColaboradorService.list(), [])
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState<number | null>(null)

  const comEmail = colaboradores.status === 'success' ? colaboradores.data.filter((c) => c.emailCorporativo.trim() !== '').length : 0
  const semEmail = colaboradores.status === 'success' ? colaboradores.data.length - comEmail : 0

  const fechar = () => {
    onClose()
    window.setTimeout(() => setEnviado(null), 300)
  }

  const enviar = async () => {
    setEnviando(true)
    const r = await nr1CampanhaService.enviarConvitesLink(campanhaId, comEmail)
    setEnviando(false)
    setEnviado(r.enviados)
  }

  return (
    <Modal open={open} title="Enviar convites" onClose={fechar}>
      {enviado === null ? (
        <div className="flex flex-col gap-4">
          {(colaboradores.status === 'idle' || colaboradores.status === 'loading') && <Skeleton className="h-20 w-full rounded-lg" />}
          {colaboradores.status === 'error' && <ErrorState message={colaboradores.message} onRetry={colaboradores.reload} />}
          {colaboradores.status === 'success' && (
            <div className="rounded-lg bg-surface-2 p-4">
              <p className="text-[13.5px] leading-relaxed text-ink">
                O link vai por e-mail para <span className="font-semibold">{comEmail} {comEmail === 1 ? 'colaborador' : 'colaboradores'}</span> com e-mail cadastrado.
              </p>
              {semEmail > 0 && (
                <p className="mt-2 flex items-start gap-2 text-[12.5px] leading-relaxed text-warning-ink">
                  <Icon icon="ph:warning-bold" width={14} className="mt-0.5 shrink-0" aria-hidden />
                  {semEmail} {semEmail === 1 ? 'colaborador não tem' : 'colaboradores não têm'} e-mail cadastrado. Eles não recebem o link.
                </p>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={fechar}>Cancelar</Button>
            <Button fullWidth iconLeft="ph:paper-plane-tilt-bold" disabled={colaboradores.status !== 'success' || comEmail === 0 || enviando} onClick={enviar}>
              {enviando ? 'Enviando…' : 'Enviar convites'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px] leading-relaxed text-ink-secondary">
            Convites enviados para {enviado} {enviado === 1 ? 'colaborador' : 'colaboradores'}.
          </p>
          <Button fullWidth onClick={fechar}>Fechar</Button>
        </div>
      )}
    </Modal>
  )
}

/* Aba "Resultado" — risco por dimensão (macro) + mapa de calor por área,
   ambos do ciclo selecionado, não sempre o retrato mais recente. */
function CampanhaResultado({ campanhaId }: { campanhaId: string }) {
  const dimensoes = useService(() => nr1ResultadoService.mediaPorDimensao(campanhaId), [campanhaId])
  const mapa = useService(() => nr1ResultadoService.mapaCalor(campanhaId), [campanhaId])
  const [perguntas, setPerguntas] = useState<Nr1PerguntasEscopo | null>(null)

  return (
    <>
      <section className="mb-6">
        <h2 className="mb-3 text-[15px] font-semibold text-ink">Risco por dimensão</h2>
        {(dimensoes.status === 'idle' || dimensoes.status === 'loading') && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}</div>
        )}
        {dimensoes.status === 'error' && <ErrorState message={dimensoes.message} onRetry={dimensoes.reload} />}
        {dimensoes.status === 'success' && (
          <RiscoPorDimensaoGrid
            dimensoes={dimensoes.data}
            onClickDimensao={(dimensaoId) => {
              const d = dimensoes.data.find((x) => x.dimensaoId === dimensaoId)!
              setPerguntas({ campanhaId, dimensaoId, media: d.media })
            }}
          />
        )}
        <p className="mt-2 text-[11px] text-ink-muted">
          Média de 1 a 5, onde 5 é a situação desejável. Áreas com menos de 4 respondentes não
          entram no cálculo. Clique num card para ver a pontuação por pergunta.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-[15px] font-semibold text-ink">Mapa de calor por área</h2>
        {(mapa.status === 'idle' || mapa.status === 'loading') && <Skeleton className="h-80 w-full rounded-lg" />}
        {mapa.status === 'error' && <ErrorState message={mapa.message} onRetry={mapa.reload} />}
        {mapa.status === 'success' && (
          <MapaCalorTable
            linhas={mapa.data}
            onClickCelula={(dimensaoId, departamentoId, departamento) => {
              const linha = mapa.data.find((l) => l.departamentoId === departamentoId)!
              const media = linha.celulas.find((c) => c.dimensaoId === dimensaoId)!.media ?? 0
              setPerguntas({ campanhaId, dimensaoId, departamentoId, departamento, media })
            }}
          />
        )}
        <p className="mt-2 text-[11px] text-ink-muted">Clique numa célula para ver a pontuação por pergunta daquela área.</p>
      </section>

      <Nr1PerguntasSheet escopo={perguntas} onClose={() => setPerguntas(null)} />
    </>
  )
}

/* Seleção de modelo + versão. Só oferece versões publicadas: rascunho não vai
   a campo, e arquivada não entra em ciclo novo. */
function SelecionarInstrumento({ campanha, modelos, onClose, onSaved, onErro }: {
  campanha: Nr1Campanha
  modelos: Nr1QuestionarioModelo[]
  onClose: () => void
  onSaved: () => void
  onErro: (m: string) => void
}) {
  const [modeloId, setModeloId] = useState(campanha.modeloId)
  const [salvando, setSalvando] = useState(false)

  const modelo = modelos.find((m) => m.id === modeloId)
  const publicada = modelo?.versoes.find((v) => v.status === 'publicada')
  const itens = publicada?.dimensoes.reduce((s, d) => s + d.itens.length, 0) ?? 0

  const salvar = async () => {
    if (!publicada) return
    setSalvando(true)
    const r = await nr1CampanhaService.definirInstrumento(campanha.id, modeloId, publicada.versao)
    setSalvando(false)
    if (r.ok) onSaved()
    else onErro(r.message ?? 'Não foi possível alterar o instrumento.')
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
      <div>
        <p className="mb-1.5 text-[13px] font-semibold text-ink">Modelo de avaliação</p>
        <Select
          value={modeloId}
          onChange={setModeloId}
          ariaLabel="Modelo de avaliação"
          options={modelos.map((m) => ({ value: m.id, label: m.escopo === 'yna' ? `${m.nome} (base)` : m.nome }))}
        />
        {modelo && <p className="mt-1.5 text-[12px] leading-relaxed text-ink-secondary">{modelo.descricao}</p>}
      </div>

      {publicada ? (
        <div className="rounded-lg border border-border bg-surface-2 p-4">
          <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">Versão a aplicar</p>
          <p className="mt-1 font-heading text-[15px] font-semibold text-ink">Versão {publicada.versao}</p>
          <p className="mt-1 text-[12.5px] text-ink-secondary">
            {itens} itens · {publicada.dimensoes.length} dimensões
            {publicada.publicadaEm && ` · publicada em ${fmtData(publicada.publicadaEm)}`}
          </p>
          <p className="mt-2 text-[11.5px] leading-relaxed text-ink-muted">
            Sempre a última versão publicada pela YNA. Versões em rascunho não vão a campo.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-warning/30 bg-warning-bg p-4">
          <p className="text-[12.5px] leading-relaxed text-ink-secondary">
            Este modelo ainda não tem versão publicada e não pode ser aplicado num ciclo.
          </p>
        </div>
      )}

      <div className="flex gap-3 rounded-lg border border-border bg-surface p-3.5">
        <Icon icon="ph:info-bold" width={18} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
        <p className="text-[12px] leading-relaxed text-ink-secondary">
          O conteúdo do questionário é definido pela YNA. Se a sua empresa precisa de itens
          específicos, fale com o seu contato. A customização é feita no backoffice, para
          preservar a validade do instrumento.
        </p>
      </div>

      <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button iconLeft="ph:check-bold" disabled={!publicada || salvando} onClick={salvar}>
          {salvando ? 'Aplicando…' : 'Aplicar no ciclo'}
        </Button>
      </div>
    </div>
  )
}
