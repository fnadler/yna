import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
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
import type { Nr1Campanha, Nr1QuestionarioModelo } from '../../types'

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
  const campanhas = useService(() => nr1CampanhaService.list(), [])

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />

        <PageHeader
          className="mt-2 lg:mt-0"
          title="Ciclos de avaliação"
          subtitle="Todas as campanhas de avaliação psicossocial, passadas e em campo."
        />

        {(campanhas.status === 'idle' || campanhas.status === 'loading') && (
          <div className="flex flex-col gap-3"><Skeleton className="h-40 w-full rounded-lg" /><Skeleton className="h-24 w-full rounded-lg" /></div>
        )}
        {campanhas.status === 'error' && <ErrorState message={campanhas.message} onRetry={campanhas.reload} />}
        {campanhas.status === 'success' && campanhas.data.length === 0 && (
          <div className="rounded-lg border border-border bg-surface px-5 py-14 text-center">
            <p className="text-[15px] font-semibold text-ink">Nenhum ciclo ainda</p>
            <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-ink-secondary">
              Fale com o seu contato na YNA para abrir o primeiro ciclo de avaliação.
            </p>
          </div>
        )}
        {campanhas.status === 'success' && campanhas.data.length > 0 && (
          <ListaCampanhas campanhas={campanhas.data} onOpen={(id) => navigate(`/rh/nr1/ciclos/${id}`)} />
        )}
      </div>
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
          action={
            <Link to="/rh/nr1/kit" className="inline-flex items-center gap-1.5 font-heading text-[13px] font-medium text-primary hover:underline dark:text-primary-300">
              <Icon icon="ph:megaphone-bold" width={14} aria-hidden />
              Kit de comunicação
            </Link>
          }
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
      {/* Estado do ciclo — mesmo card da Home da área logada (RH10Home.tsx),
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
