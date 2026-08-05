import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { Sheet } from '../../components/Sheet'
import { Modal } from '../../components/Modal'
import { Select } from '../../components/Select'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { fmtData, pct } from '../../lib/nr1'
import { useService } from '../../hooks/useService'
import { nr1CampanhaService, nr1ModeloService } from '../../services/nr1'
import type { Nr1Campanha, Nr1QuestionarioModelo } from '../../types'

/* NR1-RH-01 — Campanha de avaliação (RF-B01/B04, RF-RH-NR1-10).

   O RH escolhe o modelo + versão a aplicar e acompanha a participação por
   área em tempo real. O que ele NÃO faz aqui: editar o questionário. Toda a
   configuração do instrumento vive no backoffice da YNA.

   A versão escolhida fica registrada na campanha e viaja com o inventário e o
   relatório — é o que sustenta a defesa metodológica em fiscalização. */

/** Abaixo disso a área entra na lista de lembrete sugerido. */
const META_PARTICIPACAO = 60

export function NR1RhCampanha() {
  const campanha = useService(() => nr1CampanhaService.ativa(), [])
  const modelos = useService(() => nr1ModeloService.list(), [])
  const [trocarOpen, setTrocarOpen] = useState(false)
  const [lembrete, setLembrete] = useState<{ areas: string[]; enviados?: number } | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />

        <Link to="/rh/nr1" className="mt-2 mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary transition-colors hover:text-ink lg:mt-0">
          <Icon icon="ph:arrow-left-bold" width={14} aria-hidden />
          Conformidade NR-1
        </Link>

        <PageHeader title="Campanha de avaliação" subtitle="O ciclo que gera o inventário de riscos psicossociais." />

        {(campanha.status === 'idle' || campanha.status === 'loading') && (
          <div className="flex flex-col gap-3"><Skeleton className="h-40 w-full rounded-lg" /><Skeleton className="h-64 w-full rounded-lg" /></div>
        )}
        {campanha.status === 'error' && <ErrorState message={campanha.message} onRetry={campanha.reload} />}
        {campanha.status === 'success' && !campanha.data && (
          <div className="rounded-lg border border-border bg-surface px-5 py-14 text-center">
            <p className="text-[15px] font-semibold text-ink">Nenhuma campanha em campo</p>
            <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-ink-secondary">
              Fale com o seu contato na YNA para abrir o próximo ciclo de avaliação.
            </p>
          </div>
        )}

        {campanha.status === 'success' && campanha.data && (
          <CampanhaDetalhe
            campanha={campanha.data}
            onTrocar={() => setTrocarOpen(true)}
            onLembrar={(areas) => setLembrete({ areas })}
          />
        )}
      </div>

      {/* Seleção de modelo + versão */}
      <Sheet open={trocarOpen} onClose={() => setTrocarOpen(false)} title="Instrumento da campanha" icon="ph:seal-check-bold" size="md">
        {campanha.status === 'success' && campanha.data && modelos.status === 'success' && (
          <SelecionarInstrumento
            campanha={campanha.data}
            modelos={modelos.data}
            onClose={() => setTrocarOpen(false)}
            onSaved={() => { setTrocarOpen(false); campanha.reload() }}
            onErro={(m) => { setTrocarOpen(false); setErro(m) }}
          />
        )}
        {modelos.status === 'loading' && <div className="px-5 py-6"><Skeleton className="h-40 w-full rounded-lg" /></div>}
      </Sheet>

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

function CampanhaDetalhe({ campanha, onTrocar, onLembrar }: {
  campanha: Nr1Campanha
  onTrocar: () => void
  onLembrar: (areas: string[]) => void
}) {
  const participacaoGeral = pct(campanha.respostas, campanha.elegiveis)
  const abaixoDaMeta = campanha.participacao.filter((p) => pct(p.respostas, p.elegiveis) < META_PARTICIPACAO)

  return (
    <>
      {/* Cabeçalho da campanha */}
      <section className="mb-6 rounded-lg border border-border bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge tone={campanha.status === 'em-campo' ? 'success' : 'neutral'}>
                {campanha.status === 'em-campo' ? 'Em campo' : campanha.status === 'rascunho' ? 'Rascunho' : 'Encerrada'}
              </Badge>
              <span className="font-mono text-[11px] text-ink-muted">{campanha.protocolo}</span>
            </div>
            <h2 className="mt-2 font-heading text-[17px] font-semibold text-ink">{campanha.nome}</h2>
            <p className="mt-1 text-[13px] text-ink-secondary">
              {fmtData(campanha.inicio)} a {fmtData(campanha.fim)}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[34px] font-bold leading-none tracking-[-0.02em] text-ink">{participacaoGeral}%</p>
            <p className="mt-0.5 text-[12px] text-ink-secondary">{campanha.respostas} de {campanha.elegiveis}</p>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-pill bg-surface-2">
          <div className="h-full rounded-pill bg-gradient-to-r from-primary to-pink transition-all duration-500" style={{ width: `${participacaoGeral}%` }} />
        </div>
      </section>

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
              <p className="mt-0.5 text-[12.5px] text-ink-secondary">Versão {campanha.versao} · registrada na campanha e em cada resposta</p>
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

        {campanha.status !== 'rascunho' && (
          <p className="mt-3 flex items-start gap-2 border-t border-border pt-3 text-[12px] leading-relaxed text-ink-muted">
            <Icon icon="ph:lock-simple-bold" width={13} className="mt-0.5 shrink-0" aria-hidden />
            A campanha já está em campo. A versão aplicada não muda no meio do ciclo. É assim que
            as respostas seguem comparáveis e a metodologia se sustenta.
          </p>
        )}
      </section>

      {/* Participação por área */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[15px] font-semibold text-ink">Participação por área</h2>
          {abaixoDaMeta.length > 0 && (
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

/* Seleção de modelo + versão. Só oferece versões publicadas: rascunho não vai
   a campo, e arquivada não entra em campanha nova. */
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
            Este modelo ainda não tem versão publicada e não pode ser aplicado numa campanha.
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
          {salvando ? 'Aplicando…' : 'Aplicar na campanha'}
        </Button>
      </div>
    </div>
  )
}
