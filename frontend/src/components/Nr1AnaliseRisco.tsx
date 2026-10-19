import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { Button } from './Button'
import { Badge } from './Badge'
import { Skeleton } from './Skeleton'
import { ErrorState } from './ErrorState'
import { Modal } from './Modal'
import { Toast } from './Toast'
import { AcaoForm } from './Nr1AcaoForm'
import { PrazoBadge } from './PrazoBadge'
import { Nr1DepartamentosPopover } from './Nr1DepartamentosPopover'
import { useService } from '../hooks/useService'
import { nr1ResultadoService, nr1AcaoService, nr1FatorService } from '../services/nr1'
import { NR1_DIMENSOES, nr1NivelPorMedia } from '../data/nr1Mock'
import { NIVEL_RISCO, ACAO_STATUS, ACAO_RECOMENDADA, STATUS_RISCO, NR1_PROBABILIDADE_ROTULOS, NR1_SEVERIDADE_ROTULOS, NR1_SEVERIDADE_CLS } from '../lib/nr1'
import type {
  Nr1Acao, Nr1DimensaoId, Nr1FatorSituacao, Nr1LinhaMapa, Nr1NivelRisco, Nr1RiscoInventario, Nr1Tendencia, Nr1AcaoSugerida,
} from '../types'

/** De onde a análise foi aberta: um card de domínio (sem `departamentoId`,
   visão da empresa), uma célula do mapa de calor (com a área) ou uma
   pergunta (`itemId`, fica marcada). `linhas` é o mapa de calor já
   carregado do ciclo — as notas por departamento saem dele. */
export interface Nr1AnaliseEscopo {
  campanhaId: string
  cicloLabel: string
  dimensaoId: Nr1DimensaoId
  departamentoId?: string
  itemId?: string
  linhas: Nr1LinhaMapa[]
}

interface DepartamentoNota {
  id: string
  nome: string
  respondentes: number
  protegido: boolean
  media: number | null
  nivel: Nr1NivelRisco | null
}

const SITUACAO: Record<Nr1FatorSituacao, { label: string; cls: string }> = {
  'requer-plano': { label: 'Requer plano de ação', cls: 'bg-danger/15 text-danger-ink' },
  monitorar: { label: 'Monitorar', cls: 'bg-warning/25 text-warning-ink' },
  controlado: { label: 'Controlado', cls: 'bg-success/20 text-success-ink' },
}

/* Análise de um domínio em tela cheia — o resultado do ciclo de um lado e,
   do outro, os fatores de risco que o sistema apontou naquele domínio, no
   recorte escolhido (empresa ou área). Nada é cadastrado aqui: o fator já
   vem identificado; abrir um fator que requer plano leva ao detalhe do
   risco, onde o plano de ação é criado. */
export function Nr1AnaliseRiscoModal({ escopo, onClose, onRiscosAlterados }: {
  escopo: Nr1AnaliseEscopo | null
  onClose: () => void
  onRiscosAlterados?: () => void
}) {
  if (!escopo) return null
  return createPortal(
    <Analise
      key={`${escopo.campanhaId}-${escopo.dimensaoId}-${escopo.departamentoId ?? ''}-${escopo.itemId ?? ''}`}
      escopo={escopo}
      onClose={onClose}
      onRiscosAlterados={onRiscosAlterados}
    />,
    document.body,
  )
}

function Analise({ escopo, onClose, onRiscosAlterados }: {
  escopo: Nr1AnaliseEscopo
  onClose: () => void
  onRiscosAlterados?: () => void
}) {
  const meta = NR1_DIMENSOES.find((d) => d.id === escopo.dimensaoId)
  const [departamentoId, setDepartamentoId] = useState<string | undefined>(escopo.departamentoId)
  const [detalhe, setDetalhe] = useState<Nr1RiscoInventario | null>(null)
  const dimensao = useService(() => nr1ResultadoService.dimensaoDaCampanha(escopo.campanhaId, escopo.dimensaoId), [])
  const itens = useService(
    () => nr1ResultadoService.itensPorDimensao(escopo.campanhaId, escopo.dimensaoId, departamentoId),
    [departamentoId],
  )
  const medias = useService(() => nr1ResultadoService.mediaPorDimensao(escopo.campanhaId), [])
  const avaliados = useService(() => nr1FatorService.avaliar(escopo.campanhaId), [])
  const catalogo = useService(() => nr1FatorService.catalogo(), [])
  const riscos = useService(() => nr1ResultadoService.inventario(escopo.campanhaId), [])
  const acoes = useService(() => nr1AcaoService.list(), [])

  /* Leva a pergunta clicada para a vista — só na primeira vez, não a cada
     troca de área no seletor. */
  const rolou = useRef(false)
  const rolarAteMarcada = useCallback((el: HTMLLIElement | null) => {
    if (!el || rolou.current) return
    rolou.current = true
    el.scrollIntoView({ block: 'center' })
  }, [])

  const departamentos: DepartamentoNota[] = escopo.linhas.map((l) => {
    const celula = l.celulas.find((c) => c.dimensaoId === escopo.dimensaoId)
    return {
      id: l.departamentoId, nome: l.departamento, respondentes: l.respondentes, protegido: l.protegido,
      media: l.protegido ? null : celula?.media ?? null,
      nivel: l.protegido ? null : celula?.nivel ?? null,
    }
  })
  /* Nota da empresa: a mesma dos cards (ponderada, com as áreas ocultas). */
  const mediaEmpresa = medias.status === 'success' ? (medias.data.find((m) => m.dimensaoId === escopo.dimensaoId)?.media ?? 0) : 0
  const depSel = departamentos.find((d) => d.id === departamentoId)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !detalhe) onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  })

  const fatoresDoDominio = catalogo.status === 'success' ? catalogo.data.filter((f) => f.dimensaoId === escopo.dimensaoId) : []
  const recorte = departamentoId ?? null
  const linhasFatores = avaliados.status === 'success'
    ? fatoresDoDominio
      .map((f) => ({ fator: f, av: avaliados.data.find((a) => a.fatorId === f.id && a.departamentoId === recorte) }))
      .sort((a, b) => (b.av?.nivelNum ?? 0) - (a.av?.nivelNum ?? 0))
    : []
  const riscoDe = (fatorId: string) =>
    riscos.status === 'success' ? riscos.data.find((r) => r.fatorRiscoId === fatorId && (recorte === null || r.departamentoIds.includes(recorte))) : undefined
  const acoesDe = (riscoId: string) => {
    if (acoes.status !== 'success') return []
    const superadas = new Set(acoes.data.map((a) => a.versaoAnteriorId).filter(Boolean))
    return acoes.data.filter((a) => a.riscoId === riscoId && !superadas.has(a.id))
  }
  const carregado = [avaliados, catalogo, riscos, acoes].every((x) => x.status === 'success')
  const nomeRecorte = depSel?.nome ?? 'Toda a empresa'

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface-2" role="dialog" aria-modal aria-label={`Análise · ${meta?.nome ?? ''}`}>
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-surface px-5 py-3 lg:px-8">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
          <Icon icon={meta?.icon ?? 'ph:list-bold'} width={20} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
            Resultado do domínio · {escopo.cicloLabel}
          </p>
          <h2 className="truncate font-heading text-[17px] font-semibold text-ink">{meta?.nome ?? escopo.dimensaoId}</h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Fechar análise"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-surface-hover"
        >
          <Icon icon="ph:x-bold" width={18} aria-hidden />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:overflow-hidden">
        {/* ── Resultado da avaliação ── */}
        <section className="border-b border-border bg-surface lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="flex flex-col gap-6 p-5 lg:p-8">
            <div>
              <h3 className="font-heading text-[16px] font-semibold text-ink">Resultado da avaliação</h3>
              <p className="mb-3 mt-0.5 text-[12.5px] leading-relaxed text-ink-secondary">Veja a nota da empresa inteira ou filtre por uma área.</p>
              <SeletorContexto
                departamentos={departamentos}
                mediaEmpresa={mediaEmpresa}
                selecionadoId={departamentoId}
                onSelecionar={setDepartamentoId}
              />
            </div>

            {dimensao.status === 'loading' && <Skeleton className="h-20 w-full rounded-lg" />}
            {dimensao.status === 'success' && dimensao.data && (
              <Bloco titulo="O que é avaliado neste domínio">
                <p className="text-[13px] leading-relaxed text-ink-secondary">{dimensao.data.descricao}</p>
              </Bloco>
            )}

            <Bloco titulo={`Pontuação por pergunta · ${nomeRecorte}`} hint="Da nota mais baixa para a mais alta.">
              {(itens.status === 'idle' || itens.status === 'loading') && (
                <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div>
              )}
              {itens.status === 'error' && <ErrorState message={itens.message} onRetry={itens.reload} />}
              {itens.status === 'success' && itens.data.length === 0 && (
                <p className="text-[12.5px] text-ink-muted">Nenhuma pergunta deste domínio no instrumento aplicado.</p>
              )}
              {itens.status === 'success' && itens.data.length > 0 && (
                <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface">
                  {[...itens.data].sort((a, b) => a.media - b.media).map((i) => {
                    const marcada = i.itemId === escopo.itemId
                    return (
                      <li
                        key={i.itemId}
                        ref={marcada ? rolarAteMarcada : undefined}
                        aria-current={marcada || undefined}
                        className={`relative flex items-start gap-3 px-3.5 py-3 first:rounded-t-lg last:rounded-b-lg ${marcada ? 'bg-primary-50' : ''}`}
                      >
                        {marcada && <span className="absolute inset-y-0 left-0 w-[3px] bg-primary" aria-hidden />}
                        <div className="min-w-0 flex-1">
                          {marcada && (
                            <p className="mb-1 inline-flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-primary dark:text-primary-300">
                              <Icon icon="ph:cursor-click-bold" width={11} aria-hidden />
                              Pergunta selecionada
                            </p>
                          )}
                          <p className={`text-[13px] leading-snug text-ink ${marcada ? 'font-semibold' : ''}`}>{i.texto}</p>
                          <p className="mt-0.5 font-mono text-[10.5px] text-ink-muted">{i.itemId} · {i.referencia}</p>
                        </div>
                        <NotaPill media={i.media} nivel={i.nivel} />
                      </li>
                    )
                  })}
                </ul>
              )}
            </Bloco>
          </div>
        </section>

        {/* ── Fatores de risco identificados ── */}
        <section className="bg-surface-2 lg:overflow-y-auto">
          <div className="flex flex-col gap-4 p-5 lg:p-8">
            <div>
              <h3 className="font-heading text-[16px] font-semibold text-ink">Fatores de risco deste domínio · {nomeRecorte}</h3>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-secondary">
                Identificados pelo sistema a partir das respostas: nível = probabilidade (nota das perguntas) × severidade do fator.
              </p>
            </div>

            {!carregado && <Skeleton className="h-40 w-full rounded-lg" />}
            {carregado && depSel?.protegido && (
              <p className="rounded-lg bg-surface px-4 py-6 text-center text-[12.5px] text-ink-secondary">
                {depSel.nome} tem menos de 4 respondentes: o resultado entra só na visão da empresa.
              </p>
            )}
            {carregado && !depSel?.protegido && linhasFatores.length === 0 && (
              <p className="rounded-lg bg-surface px-4 py-6 text-center text-[12.5px] text-ink-secondary">Nenhum fator de risco do catálogo pertence a este domínio.</p>
            )}
            {carregado && !depSel?.protegido && linhasFatores.length > 0 && (
              <ul className="flex flex-col gap-2.5">
                {linhasFatores.map(({ fator, av }) => {
                  const risco = riscoDe(fator.id)
                  const nAcoes = risco ? acoesDe(risco.id).length : 0
                  const st = av ? NIVEL_RISCO[av.nivel] : null
                  const situacao = risco ? SITUACAO['requer-plano'] : av ? SITUACAO[av.situacao] : null
                  return (
                    <li key={fator.id} className="rounded-lg border border-border bg-surface p-4">
                      <div className="flex items-start gap-3">
                        <span className={`flex w-14 shrink-0 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 ${st ? st.cls : 'bg-surface-2 text-ink-muted'}`}>
                          <span className="font-mono text-[15px] font-bold leading-none">{av ? av.nivelNum : '—'}</span>
                          {av && <span className="font-mono text-[9px] opacity-80">P{av.probabilidade}×S{av.severidade}</span>}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[14px] font-semibold leading-snug text-ink">{fator.nome}</p>
                            {situacao && <span className={`rounded-pill px-2 py-0.5 text-[10.5px] font-semibold ${situacao.cls}`}>{risco?.origem === 'manual' ? 'Incluído pelo RH' : situacao.label}</span>}
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-relaxed text-ink-secondary">{fator.descricao}</p>
                          {av && (
                            <p className="mt-1 text-[11.5px] text-ink-muted">
                              Nota média {av.media.toFixed(1)} em {av.perguntas.length} {av.perguntas.length === 1 ? 'pergunta' : 'perguntas'}
                            </p>
                          )}
                        </div>
                      </div>
                      {risco && (
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                          {nAcoes === 0
                            ? <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-warning-ink"><Icon icon="ph:warning-circle-bold" width={14} aria-hidden />Sem plano de ação</span>
                            : <span className="text-[12.5px] text-ink-secondary"><span className="font-semibold text-ink">{nAcoes} {nAcoes === 1 ? 'ação' : 'ações'}</span> no plano</span>}
                          <Button size="sm" variant={nAcoes === 0 ? 'primary' : 'secondary'} iconRight="ph:arrow-right-bold" onClick={() => setDetalhe(risco)}>
                            {nAcoes === 0 ? 'Criar plano' : 'Ver plano'}
                          </Button>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}

            <Link to={`/rh/nr1/inventario?ciclo=${escopo.campanhaId}`} className="inline-flex w-fit items-center gap-1 text-[12px] font-medium text-primary hover:underline dark:text-primary-300">
              Ver todos os fatores de risco no Inventário
              <Icon icon="ph:arrow-right-bold" width={11} aria-hidden />
            </Link>
          </div>
        </section>
      </div>

      <Nr1RiscoDetalheModal
        risco={detalhe}
        onClose={() => setDetalhe(null)}
        onAlterado={() => { riscos.reload(); acoes.reload(); onRiscosAlterados?.() }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */

/** Card do resultado que também é o seletor: mostra a nota do recorte
   escolhido e, ao clicar, lista a empresa e cada área com sua nota para
   filtrar. */
function SeletorContexto({ departamentos, mediaEmpresa, selecionadoId, onSelecionar }: {
  departamentos: DepartamentoNota[]
  mediaEmpresa: number
  selecionadoId?: string
  onSelecionar: (id: string | undefined) => void
}) {
  const [aberto, setAberto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aberto) return
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false) }
    /* `stopPropagation` — sem isso o Escape também fecharia a análise inteira. */
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setAberto(false) } }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [aberto])

  const sel = departamentos.find((d) => d.id === selecionadoId)
  const media = sel?.media ?? mediaEmpresa
  const escolher = (id: string | undefined) => { onSelecionar(id); setAberto(false) }

  const ordenados = [...departamentos].sort((a, b) => (a.media ?? 99) - (b.media ?? 99))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        className={`flex w-full items-center gap-4 rounded-lg border bg-surface p-4 text-left transition-colors hover:border-border-strong ${aberto ? 'border-primary' : 'border-border'}`}
      >
        <NotaGrande media={media} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-[14px] font-semibold text-ink">{sel?.nome ?? 'Toda a empresa'}</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-ink-secondary">
            {sel
              ? <>{sel.respondentes} respondentes · Toda a empresa: <strong className="font-semibold text-ink">{mediaEmpresa.toFixed(1)}</strong></>
              : 'Média de 1 a 5, onde 5 é a situação desejável.'}
          </p>
        </div>
        <Icon icon="ph:caret-down-bold" width={16} className={`shrink-0 text-ink-muted transition-transform ${aberto ? 'rotate-180' : ''}`} aria-hidden />
      </button>

      {aberto && (
        <ul role="listbox" aria-label="Filtrar por área" className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-80 overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-lg">
          <OpcaoContexto nome="Toda a empresa" media={mediaEmpresa} nivel={nr1NivelPorMedia(mediaEmpresa)} ativo={!selecionadoId} onClick={() => escolher(undefined)} />
          <li className="mx-3 my-1 border-t border-border" aria-hidden />
          {ordenados.map((d) => (
            <OpcaoContexto
              key={d.id}
              nome={d.nome}
              detalhe={`${d.respondentes} respondentes`}
              media={d.media}
              nivel={d.nivel}
              ativo={d.id === selecionadoId}
              onClick={d.protegido ? undefined : () => escolher(d.id)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function OpcaoContexto({ nome, detalhe, media, nivel, ativo, onClick }: {
  nome: string
  detalhe?: string
  media: number | null
  nivel: Nr1NivelRisco | null
  ativo: boolean
  onClick?: () => void
}) {
  return (
    <li>
      <button
        type="button"
        role="option"
        aria-selected={ativo}
        onClick={onClick}
        disabled={!onClick}
        className={`flex w-full items-center gap-3 px-3.5 py-2 text-left transition-colors disabled:cursor-not-allowed ${ativo ? 'bg-primary-50' : 'hover:bg-surface-hover disabled:hover:bg-transparent'}`}
      >
        <Icon icon="ph:check-bold" width={14} className={`shrink-0 ${ativo ? 'text-primary dark:text-primary-300' : 'invisible'}`} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-[13px] text-ink ${ativo ? 'font-semibold' : ''}`}>{nome}</span>
          {detalhe && <span className="block text-[11px] text-ink-muted">{detalhe}</span>}
        </span>
        <NotaPill media={media} nivel={nivel} />
      </button>
    </li>
  )
}

/** Estado vazio do lado direito — explica os dois passos antes de começar. */
function Bloco({ titulo, hint, extra, children }: { titulo: string; hint?: string; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[13px] font-semibold text-ink">{titulo}</p>
        {extra}
      </div>
      {hint && <p className="mt-0.5 text-[11.5px] text-ink-muted">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  )
}

/** Uma decisão do formulário guiado do risco. Aberta: a pergunta com o
   controle e o botão para seguir. Feita: recolhida numa linha com a
   resposta e "Alterar". */
function NotaGrande({ media }: { media: number }) {
  const st = NIVEL_RISCO[nr1NivelPorMedia(media)]
  return (
    <span className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-4 py-2 ${st.cls}`}>
      <span className="font-mono text-[22px] font-bold leading-none">{media.toFixed(1)}</span>
      <span className="text-[10.5px] font-semibold leading-none">{st.label}</span>
    </span>
  )
}

function NotaPill({ media, nivel }: { media: number | null; nivel: Nr1NivelRisco | null }) {
  if (media === null || nivel === null) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-surface-2 px-2 py-1 text-[11px] text-ink-muted" title="Menos de 4 respondentes — oculto por anonimato">
        <Icon icon="ph:lock-simple-bold" width={11} aria-hidden />
        Protegido
      </span>
    )
  }
  return (
    <span className={`shrink-0 rounded-pill px-2 py-1 font-mono text-[11.5px] font-semibold ${NIVEL_RISCO[nivel].cls}`}>
      {media.toFixed(1)}
    </span>
  )
}


/* ------------------------------------------------------------------
   Detalhe de um risco — mesma diagramação em tela cheia da análise de
   risco. À esquerda, o fator como o sistema o apontou: nível (P × S) com a
   explicação de onde vem cada número, o grupo exposto (cada departamento
   com a sua probabilidade e o seu nível), o que é o fator, as lesões/agravos
   (CID) e as fontes típicas — nada disso é editável pelo RH. À direita, o plano de ação, que começa pelas ações
   sugeridas do catálogo.
   ------------------------------------------------------------------ */

export function Nr1RiscoDetalheModal({ risco, onClose, onAlterado }: {
  risco: Nr1RiscoInventario | null
  onClose: () => void
  /** Risco ou ações mudaram (inclusão removida, concluído, ação salva). */
  onAlterado?: () => void
}) {
  if (!risco) return null
  return createPortal(
    <RiscoDetalhe key={risco.id} inicial={risco} onClose={onClose} onAlterado={onAlterado} />,
    document.body,
  )
}

type EditorPlano =
  | { tipo: 'escolher' }
  | { tipo: 'nova'; sugestao?: Nr1AcaoSugerida }
  | { tipo: 'editar'; acao: Nr1Acao }
  | null

function RiscoDetalhe({ inicial, onClose, onAlterado }: {
  inicial: Nr1RiscoInventario
  onClose: () => void
  onAlterado?: () => void
}) {
  const risco = inicial
  const meta = NR1_DIMENSOES.find((d) => d.id === risco.dimensaoId)
  const catalogo = useService(() => nr1FatorService.catalogo(), [])
  const cids = useService(() => nr1FatorService.cids(), [])
  const fontes = useService(() => nr1FatorService.fontes(), [])
  const acoes = useService(() => nr1AcaoService.list(), [])

  const [editor, setEditor] = useState<EditorPlano>(null)
  const [sujo, setSujo] = useState(false)
  const marcarSujo = useCallback((v: boolean) => setSujo(v), [])
  const [confirmarSaida, setConfirmarSaida] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [excluirAcao, setExcluirAcao] = useState<Nr1Acao | null>(null)
  const [removerInclusao, setRemoverInclusao] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [processando, setProcessando] = useState(false)

  const fator = catalogo.status === 'success' ? catalogo.data.find((f) => f.id === risco.fatorRiscoId) : undefined
  const empresa = risco.departamentoIds.length === 0

  /* Ações vigentes do risco — versão substituída por outra não conta. */
  const lista = (() => {
    if (acoes.status !== 'success') return []
    const superadas = new Set(acoes.data.map((a) => a.versaoAnteriorId).filter(Boolean))
    return acoes.data.filter((a) => a.riscoId === risco.id && !superadas.has(a.id))
  })()

  const pedirFechar = () => (editor && editor.tipo !== 'escolher' && sujo ? setConfirmarSaida(true) : onClose())
  const algumModal = confirmarSaida || excluirAcao !== null || removerInclusao || erro !== null

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !algumModal) pedirFechar() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  })

  const abrirEditor = (e: EditorPlano) => { setSujo(false); setEditor(e) }
  const fecharEditor = () => { setSujo(false); setEditor(null) }

  const aoSalvarAcao = (_a: Nr1Acao, nova: boolean) => {
    fecharEditor()
    acoes.reload()
    setFeedback(nova ? 'Ação criada.' : 'Ação atualizada.')
    onAlterado?.()
  }

  const confirmarExclusaoAcao = async () => {
    if (!excluirAcao) return
    setProcessando(true)
    await nr1AcaoService.excluir(excluirAcao.id)
    setProcessando(false)
    setExcluirAcao(null)
    acoes.reload()
    setFeedback('Ação excluída.')
    onAlterado?.()
  }

  /* Fator só incluído pelo RH (o questionário não o apontou): dá para
     desfazer a inclusão, que tira o risco do inventário. Fator apontado pelo
     resultado não sai do inventário. */
  const confirmarRemocaoInclusao = async () => {
    setProcessando(true)
    const r = await nr1ResultadoService.reconsiderarFator(risco.id)
    setProcessando(false)
    setRemoverInclusao(false)
    if (!r.ok) { setErro(r.message ?? 'Não foi possível concluir.'); return }
    onAlterado?.()
    onClose()
  }

  const status = STATUS_RISCO[risco.status]
  const nomeCid = (id: string) => (cids.status === 'success' ? cids.data.find((c) => c.id === id) : undefined)
  const usadas = new Set(lista.map((a) => a.oQue.trim().toLowerCase()))
  /* Sugestões descartadas para este risco — saem da lista; dá para
     mostrar de novo. Registradas no serviço (valem na sessão). */
  const [descartadas, setDescartadas] = useState<string[]>(() => nr1FatorService.sugestoesDescartadas(inicial.id))
  const [verDescartadas, setVerDescartadas] = useState(false)
  const alternarDescarte = (id: string, descartar: boolean) => {
    nr1FatorService.descartarSugestao(risco.id, id, descartar)
    setDescartadas(nr1FatorService.sugestoesDescartadas(risco.id))
  }
  const sugestoes = (fator?.acoesSugeridas ?? []).filter((sg) => verDescartadas || !descartadas.includes(sg.id))
  const ondePadrao = empresa ? ['Toda a empresa'] : risco.grupos.map((g) => g.departamento)
  /* Sugestões ainda não usadas nem descartadas — continuam à vista depois
     que o plano já tem ações, para o RH seguir completando o plano. */
  const restantes = sugestoes.filter((sg) => !usadas.has(sg.oQue.trim().toLowerCase()) && !descartadas.includes(sg.id))

  const itemSugestao = (sg: Nr1AcaoSugerida) => {
    const ja = usadas.has(sg.oQue.trim().toLowerCase())
    const descartada = descartadas.includes(sg.id)
    return (
      <li key={sg.id} className={`flex flex-col gap-3 rounded-lg border border-border p-3.5 sm:flex-row sm:items-start ${descartada ? 'bg-surface opacity-60' : 'bg-surface-2'}`}>
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <Icon icon="ph:lightbulb-bold" width={16} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-semibold leading-snug text-ink">{sg.oQue}</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-ink-secondary">{sg.como}</p>
            {ja && <span className="mt-1.5 inline-block rounded-pill bg-success/20 px-2 py-0.5 text-[10.5px] font-semibold text-success-ink">Já no plano</span>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-start">
          {descartada ? (
            <Button size="sm" variant="ghost" iconLeft="ph:arrow-counter-clockwise-bold" onClick={() => alternarDescarte(sg.id, false)}>Restaurar</Button>
          ) : (
            <>
              <Button size="sm" variant="ghost" iconLeft="ph:x-bold" onClick={() => alternarDescarte(sg.id, true)}>Descartar</Button>
              <Button size="sm" iconLeft="ph:check-bold" onClick={() => abrirEditor({ tipo: 'nova', sugestao: sg })}>Usar</Button>
            </>
          )}
        </div>
      </li>
    )
                  }


  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface-2" role="dialog" aria-modal aria-label={`Risco · ${risco.fator}`}>
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-surface px-5 py-3 lg:px-8">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
          <Icon icon={meta?.icon ?? 'ph:clipboard-text-bold'} width={20} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
            {empresa ? 'Toda a empresa' : `${risco.grupos.length} ${risco.grupos.length === 1 ? 'departamento exposto' : 'departamentos expostos'}`} · {risco.dimensao}
          </p>
          <h2 className="truncate font-heading text-[17px] font-semibold text-ink">{risco.fator}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {risco.origem === 'manual' && lista.length === 0 && acoes.status === 'success' && (
            <Button size="sm" variant="ghost" iconLeft="ph:minus-circle-bold" disabled={editor !== null && editor.tipo !== 'escolher'} onClick={() => setRemoverInclusao(true)}>
              <span className="hidden sm:inline">Remover inclusão</span>
            </Button>
          )}
          <button
            onClick={pedirFechar}
            aria-label="Fechar detalhe do risco"
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-surface-hover"
          >
            <Icon icon="ph:x-bold" width={18} aria-hidden />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:overflow-hidden">
        {/* ── O fator, como o sistema o apontou ── */}
        <section className="border-b border-border bg-surface lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="flex flex-col gap-6 p-5 lg:p-8">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={status.tone} icon={status.icon}>{status.label}</Badge>
                {risco.origem !== 'manual' && <EvolucaoBadges risco={risco} />}
              </div>
              {risco.origem === 'manual' && (
                <p className="mt-2 rounded-lg bg-surface-2 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-ink-secondary">
                  <span className="font-semibold text-ink">Incluído pelo RH</span> — o questionário não apontou este fator aqui.
                  {risco.justificativaInclusao && <> Motivo: {risco.justificativaInclusao}</>}
                </p>
              )}
            </div>

            <Bloco titulo="Nível do risco">
              <NivelDoRisco risco={risco} />
            </Bloco>

            <Bloco
              titulo="O que é este fator"
              extra={(
                <span className={`inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[11px] font-semibold ${NR1_SEVERIDADE_CLS[risco.severidade]}`}>
                  Severidade <span className="font-mono">{risco.severidade}</span> · {NR1_SEVERIDADE_ROTULOS[risco.severidade - 1]}
                </span>
              )}
            >
              {catalogo.status === 'success'
                ? <p className="text-[13.5px] leading-relaxed text-ink">{fator?.descricao || '—'}</p>
                : <Skeleton className="h-12 w-full rounded-lg" />}
            </Bloco>

            <Bloco titulo="Grupo exposto" hint="Departamentos em que as respostas apontaram o fator. Nível = probabilidade da área × severidade do fator.">
              <GrupoExposto risco={risco} />
            </Bloco>

            {fator && fator.cidIds.length > 0 && (
              <Bloco titulo="Possíveis lesões ou agravos à saúde">
                <ul className="flex flex-col gap-1.5">
                  {fator.cidIds.map((id) => {
                    const c = nomeCid(id)
                    return c ? (
                      <li key={id} className="flex items-center gap-2.5 rounded-lg bg-surface-2 px-3.5 py-2">
                        <span className="w-12 shrink-0 font-mono text-[12px] font-semibold text-ink">{c.codigo}</span>
                        <span className="text-[13px] text-ink-secondary">{c.nome}</span>
                      </li>
                    ) : null
                  })}
                </ul>
              </Bloco>
            )}

            {fator && fator.fontesGeradorasIds.length > 0 && (
              <Bloco titulo="O que costuma gerar este fator">
                <div className="flex flex-wrap gap-1.5">
                  {fator.fontesGeradorasIds.map((id) => (
                    <span key={id} className="rounded-pill bg-surface-2 px-2.5 py-1 text-[12px] text-ink-secondary">
                      {fontes.status === 'success' ? (fontes.data.find((f) => f.id === id)?.nome ?? id) : '…'}
                    </span>
                  ))}
                </div>
              </Bloco>
            )}

          </div>
        </section>

        {/* ── Plano de ação ── */}
        <section className="bg-surface-2 lg:overflow-y-auto">
          <div className="flex flex-col gap-4 p-5 lg:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-[16px] font-semibold text-ink">Plano de ação</h3>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-secondary">
                  {acoes.status !== 'success'
                    ? 'Carregando o plano de ação…'
                    : lista.length === 0
                      ? 'Nenhuma ação criada para este risco ainda.'
                      : `${lista.length} ${lista.length === 1 ? 'ação no plano' : 'ações no plano'}.`}
                </p>
              </div>
              {acoes.status === 'success' && lista.length > 0 && editor === null && (
                <Button variant="secondary" iconLeft="ph:plus-bold" onClick={() => abrirEditor({ tipo: 'escolher' })}>
                  Adicionar ação
                </Button>
              )}
            </div>

            {(acoes.status === 'idle' || acoes.status === 'loading') && <Skeleton className="h-40 w-full rounded-lg" />}
            {acoes.status === 'error' && <ErrorState message={acoes.message} onRetry={acoes.reload} />}

            {acoes.status === 'success' && lista.length === 0 && editor === null && (
              <div className="rounded-lg border border-border bg-surface px-5 py-8 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary dark:text-primary-300">
                  <Icon icon="ph:list-checks-bold" width={20} aria-hidden />
                </span>
                <p className="mt-3 font-heading text-[14px] font-semibold text-ink">Este risco ainda não tem plano de ação</p>
                <p className="mx-auto mt-1 max-w-sm text-[12.5px] leading-relaxed text-ink-secondary">
                  Escolha uma das ações sugeridas pela YNA para este fator — ela já vem redigida, e você só completa quem, quando e onde — ou crie a sua.
                </p>
                <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
                  <Button iconLeft="ph:lightbulb-bold" onClick={() => abrirEditor({ tipo: 'escolher' })}>
                    Ver ações sugeridas
                  </Button>
                  <Button variant="secondary" iconLeft="ph:pencil-simple-line-bold" onClick={() => abrirEditor({ tipo: 'nova' })}>
                    Criar ação personalizada
                  </Button>
                </div>
              </div>
            )}

            {editor?.tipo === 'escolher' && (
              <div className="rounded-lg border-[1.5px] border-primary/40 bg-surface p-4 lg:p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-heading text-[14px] font-semibold text-ink">Escolha uma ação sugerida</p>
                    <p className="mt-0.5 text-[12px] text-ink-secondary">Ações recomendadas pela YNA para este fator. Você pode ajustar o texto depois.</p>
                  </div>
                  <button type="button" onClick={fecharEditor} aria-label="Fechar sugestões" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-secondary hover:bg-surface-hover">
                    <Icon icon="ph:x-bold" width={15} aria-hidden />
                  </button>
                </div>
                <ul className="flex flex-col gap-2">
                  {sugestoes.map(itemSugestao)}
                  {fator && fator.acoesSugeridas.length === 0 && (
                    <li className="rounded-lg bg-surface-2 px-3.5 py-3 text-[12.5px] text-ink-secondary">Nenhuma ação sugerida para este fator ainda.</li>
                  )}
                  {fator && fator.acoesSugeridas.length > 0 && sugestoes.length === 0 && (
                    <li className="rounded-lg bg-surface-2 px-3.5 py-3 text-[12.5px] text-ink-secondary">Todas as sugestões foram descartadas.</li>
                  )}
                </ul>
                {descartadas.length > 0 && (
                  <button type="button" onClick={() => setVerDescartadas((v) => !v)} className="mt-2 text-[12px] font-medium text-primary hover:underline dark:text-primary-300">
                    {verDescartadas ? 'Ocultar descartadas' : `Mostrar ${descartadas.length} ${descartadas.length === 1 ? 'descartada' : 'descartadas'}`}
                  </button>
                )}
                <div className="mt-3 border-t border-border pt-3">
                  <Button size="sm" variant="ghost" iconLeft="ph:pencil-simple-line-bold" onClick={() => abrirEditor({ tipo: 'nova' })}>
                    Criar ação personalizada
                  </Button>
                </div>
              </div>
            )}

            {editor?.tipo === 'nova' && (
              <AcaoForm
                key={editor.sugestao?.id ?? 'zero'}
                layout="inline"
                riscoId={risco.id}
                sugestao={editor.sugestao}
                porQuePadrao={`Mitigar: ${risco.fator}`}
                ondePadrao={ondePadrao}
                onSujo={marcarSujo}
                onClose={fecharEditor}
                onSaved={aoSalvarAcao}
              />
            )}

            {acoes.status === 'success' && lista.length > 0 && (
              <ul className="flex flex-col gap-2">
                {lista.map((a) => (editor?.tipo === 'editar' && editor.acao.id === a.id ? (
                  <li key={a.id}>
                    <AcaoForm layout="inline" riscoId={risco.id} inicial={a} onSujo={marcarSujo} onClose={fecharEditor} onSaved={aoSalvarAcao} />
                  </li>
                ) : (
                  <li key={a.id} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-[13.5px] font-semibold leading-snug text-ink">
                        {a.oQue}
                        {a.versao > 1 && <span className="ml-1.5 text-[10.5px] font-normal text-ink-muted">v{a.versao}</span>}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11.5px] text-ink-secondary">
                        <span className="inline-flex items-center gap-1"><Icon icon="ph:user-bold" width={11} aria-hidden />{a.quem}</span>
                        <PrazoBadge acao={a} />
                        <Nr1DepartamentosPopover nomes={a.onde.split(',').map((x) => x.trim()).filter(Boolean)} titulo="Departamentos envolvidos" />
                      </div>
                    </div>
                    <Badge tone={ACAO_STATUS[a.status].tone}>{ACAO_STATUS[a.status].label}</Badge>
                    {a.status !== 'concluida' && (
                      <>
                        <button
                          type="button"
                          onClick={() => abrirEditor({ tipo: 'editar', acao: a })}
                          disabled={editor !== null}
                          aria-label={`Editar ação ${a.oQue}`}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-secondary hover:bg-surface-hover hover:text-ink disabled:opacity-40"
                        >
                          <Icon icon="ph:pencil-simple-bold" width={14} aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => setExcluirAcao(a)}
                          disabled={editor !== null}
                          aria-label={`Excluir ação ${a.oQue}`}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:text-danger-ink disabled:opacity-40"
                        >
                          <Icon icon="ph:trash-bold" width={14} aria-hidden />
                        </button>
                      </>
                    )}
                  </li>
                )))}
              </ul>
            )}

            {acoes.status === 'success' && lista.length > 0 && editor === null && restantes.length > 0 && (
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="font-heading text-[14px] font-semibold text-ink">Outras ações sugeridas para este fator</p>
                <p className="mb-3 mt-0.5 text-[12px] text-ink-secondary">Complemente o plano com as demais recomendações da YNA, ou descarte as que não se aplicam.</p>
                <ul className="flex flex-col gap-2">{restantes.map(itemSugestao)}</ul>
              </div>
            )}

            {acoes.status === 'success' && lista.length > 0 && (
              <Link to={`/rh/nr1/plano-acao?risco=${risco.id}`} className="inline-flex w-fit items-center gap-1 text-[12px] font-medium text-primary hover:underline dark:text-primary-300">
                Ver no Plano de ação (comentários e evidências)
                <Icon icon="ph:arrow-right-bold" width={11} aria-hidden />
              </Link>
            )}
          </div>
        </section>
      </div>

      <Modal open={confirmarSaida} title="Descartar alterações?" onClose={() => setConfirmarSaida(false)}>
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px] leading-relaxed text-ink-secondary">
            Há um formulário preenchido e ainda não salvo. Se sair agora, o que foi preenchido se perde.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setConfirmarSaida(false)}>Continuar editando</Button>
            <Button fullWidth variant="secondary" onClick={onClose}>Descartar e sair</Button>
          </div>
        </div>
      </Modal>

      <Modal open={excluirAcao !== null} title="Excluir ação?" onClose={() => setExcluirAcao(null)}>
        {excluirAcao && (
          <div className="flex flex-col gap-4">
            <p className="text-[13.5px] leading-relaxed text-ink-secondary">
              A ação <strong className="font-semibold text-ink">{excluirAcao.oQue}</strong> sai do plano de ação deste risco,
              junto com o histórico de comentários dela. Não é possível desfazer.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setExcluirAcao(null)}>Cancelar</Button>
              <Button fullWidth variant="secondary" iconLeft="ph:trash-bold" disabled={processando} onClick={confirmarExclusaoAcao}>
                {processando ? 'Excluindo…' : 'Excluir ação'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={removerInclusao} title="Remover a inclusão?" onClose={() => setRemoverInclusao(false)}>
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px] leading-relaxed text-ink-secondary">
            O fator <strong className="font-semibold text-ink">{risco.fator}</strong> foi incluído pelo RH em {risco.grupoExposto}. Removendo a inclusão, ele sai do inventário.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setRemoverInclusao(false)}>Cancelar</Button>
            <Button fullWidth variant="secondary" iconLeft="ph:minus-circle-bold" disabled={processando} onClick={confirmarRemocaoInclusao}>
              {processando ? 'Salvando…' : 'Remover inclusão'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={erro !== null} title="Não foi possível concluir" onClose={() => setErro(null)}>
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px] leading-relaxed text-ink-secondary">{erro}</p>
          <Button fullWidth onClick={() => setErro(null)}>Entendi</Button>
        </div>
      </Modal>

      <Toast message={feedback} onClose={() => setFeedback(null)} />
    </div>
  )
}

/* Status + tendência + sugestão do risco — sempre uma leitura calculada a
   partir da evolução do fator entre ciclos (ver nr1EvolucaoFator), nunca uma
   conclusão. O card mostra a sugestão; quem decide o que fazer com ela é o
   SST/RH. */
const ICONE_NIVEL: Record<Nr1NivelRisco, string> = {
  baixo: 'ph:eye-bold',
  atencao: 'ph:shield-warning-bold',
  risco: 'ph:warning-bold',
  critico: 'ph:siren-bold',
}

/** Card do nível do risco. Em cima, o veredito na cor do nível: o que o
   nível exige (a informação que orienta o RH) e o nível em si. Embaixo, de
   onde ele vem: probabilidade × severidade, cada uma com a sua origem. */
function NivelDoRisco({ risco }: { risco: Nr1RiscoInventario }) {
  const st = NIVEL_RISCO[risco.nivel]
  const av = risco.avaliacao
  const origemP = !av
    ? 'Incluído pelo RH'
    : risco.grupos.length > 1
      ? `A maior entre os departamentos expostos: ${risco.grupos[0]!.departamento} (nota ${av.media.toFixed(1)})`
      : `Nota média ${av.media.toFixed(1)} nas perguntas que indicam o fator`
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className={`flex items-center gap-4 px-4 py-3.5 ${st.cls}`}>
        <span className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg ${risco.nivel === 'critico' ? 'bg-white/15' : 'bg-white/60 dark:bg-black/15'}`}>
          <span className="font-mono text-[22px] font-bold leading-none">{risco.nivelNum}</span>
          <span className="mt-1 text-[10px] font-semibold uppercase leading-none tracking-[0.06em]">{st.label}</span>
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] opacity-80">Conduta exigida</p>
          <p className="mt-0.5 flex items-center gap-1.5 font-heading text-[17px] font-bold leading-tight">
            <Icon icon={ICONE_NIVEL[risco.nivel]} width={18} className="shrink-0" aria-hidden />
            {st.acao}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3 bg-surface px-4 py-3.5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Probabilidade</p>
          <p className="mt-1 text-[14px] font-semibold text-ink"><span className="font-mono">{risco.probabilidade}</span> · {NR1_PROBABILIDADE_ROTULOS[risco.probabilidade - 1]}</p>
          <p className="mt-0.5 text-[11.5px] leading-snug text-ink-muted">{origemP}</p>
        </div>
        <span className="pt-5 font-mono text-[15px] font-semibold text-ink-muted" aria-hidden>×</span>
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Severidade</p>
          <p className="mt-1 text-[14px] font-semibold text-ink"><span className="font-mono">{risco.severidade}</span> · {NR1_SEVERIDADE_ROTULOS[risco.severidade - 1]}</p>
          <p className="mt-0.5 text-[11.5px] leading-snug text-ink-muted">Definida pela YNA para este fator</p>
        </div>
      </div>
    </div>
  )
}

/** Departamentos expostos ao fator, do maior para o menor nível: cada um
   com os respondentes, a probabilidade e o nível (P × S). */
function GrupoExposto({ risco }: { risco: Nr1RiscoInventario }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="grid grid-cols-[minmax(0,1fr)_112px_80px] items-center gap-3 border-b border-border bg-surface-2 px-3.5 py-2">
        {['Departamento', 'Probabilidade', 'Nível'].map((c) => (
          <span key={c} className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{c}</span>
        ))}
      </div>
      <ul className="divide-y divide-border">
        {risco.grupos.map((g) => {
          const st = NIVEL_RISCO[g.nivel]
          return (
            <li key={g.departamentoId ?? 'empresa'} className="grid grid-cols-[minmax(0,1fr)_112px_80px] items-center gap-3 px-3.5 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-ink">{g.departamento}</p>
                <p className="mt-0.5 text-[11px] text-ink-muted">
                  {g.respondentes} respondentes · nota {g.media.toFixed(1)}{g.incluido ? ' · incluído pelo RH' : ''}
                </p>
              </div>
              <p className="text-[12px] leading-snug text-ink-secondary">
                <span className="font-mono font-semibold text-ink">{g.probabilidade}</span> · {NR1_PROBABILIDADE_ROTULOS[g.probabilidade - 1]}
              </p>
              <span className={`flex w-fit min-w-[64px] flex-col items-center gap-0.5 rounded-lg px-2 py-1 ${st.cls}`} title={`Probabilidade ${g.probabilidade} × severidade ${risco.severidade} = ${g.nivelNum}`}>
                <span className="font-heading text-[11.5px] font-bold leading-none">{st.label}</span>
                <span className="font-mono text-[10px] font-medium leading-none opacity-80">{g.nivelNum}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function EvolucaoBadges({ risco }: { risco: Nr1RiscoInventario }) {
  return (
    <>
      {risco.tendencia && <TendenciaTag tendencia={risco.tendencia} variacaoPontos={risco.variacaoPontos} />}
      {risco.acaoRecomendada && (
        <span className="text-[11.5px] text-ink-secondary">
          Sugestão: <span className="font-medium text-ink">{ACAO_RECOMENDADA[risco.acaoRecomendada].label}</span>
        </span>
      )}
    </>
  )
}

const TENDENCIA_VISUAL: Record<Nr1Tendencia, { icon: string; cls: string; label: string }> = {
  melhorando: { icon: 'ph:trend-up-bold', cls: 'text-success-ink', label: 'Melhorando' },
  estavel: { icon: 'ph:minus-bold', cls: 'text-ink-muted', label: 'Estável' },
  piorando: { icon: 'ph:trend-down-bold', cls: 'text-danger-ink', label: 'Piorando' },
}

function TendenciaTag({ tendencia, variacaoPontos }: { tendencia: Nr1Tendencia; variacaoPontos?: number }) {
  const v = TENDENCIA_VISUAL[tendencia]
  return (
    <span className={`inline-flex items-center gap-1 text-[11.5px] font-medium ${v.cls}`}>
      <Icon icon={v.icon} width={13} aria-hidden />
      {v.label}
      {variacaoPontos !== undefined && ` (${variacaoPontos > 0 ? '+' : ''}${variacaoPontos.toFixed(1)})`}
    </span>
  )
}

