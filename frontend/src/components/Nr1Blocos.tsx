import { useEffect, useState, type ReactNode } from 'react'
import { Icon } from '@iconify/react'
import { Select } from './Select'
import { Skeleton } from './Skeleton'
import { ErrorState } from './ErrorState'
import { RadarChart } from './RadarChart'
import { Nr1AnaliseRiscoModal, type Nr1AnaliseEscopo } from './Nr1AnaliseRisco'
import { cicloLabelCurto } from './Nr1PainelRiscoMapa'
import { useService } from '../hooks/useService'
import { nr1CampanhaService, nr1ResultadoService } from '../services/nr1'
import { NIVEL_RISCO, LIMIAR_TENDENCIA } from '../lib/nr1'
import { NR1_DIMENSOES, NR1_RECORTE_OUTROS } from '../data/nr1Mock'
import type { Nr1Campanha, Nr1DimensaoId } from '../types'

/* Peças compartilhadas das telas em blocos (aba Resultado do ciclo e as
   duas Visões gerais do RH): menu de âncoras fixo com o filtro de
   departamento, cabeçalho de bloco fixo, o bloco Visão geral e a seção
   "Resultado do ciclo" pronta (cabeçalho + filtro + bloco + análise). */

export interface SecaoAncora { id: string; label: string; icon: string }

/** Opções do filtro de departamento de um ciclo: empresa, áreas visíveis e
   "Outros departamentos" (quando, somadas, passam do k-anonimato). */
export function useOpcoesRecorte(campanhaId: string | undefined) {
  const recortes = useService(() => (campanhaId ? nr1ResultadoService.recortes(campanhaId) : Promise.resolve(null)), [campanhaId])
  return recortes.status === 'success' && recortes.data
    ? [
      { value: 'empresa', label: 'Toda a empresa' },
      ...recortes.data.visiveis.map((d) => ({ value: d.id, label: d.nome })),
      ...(recortes.data.outros && !recortes.data.outros.protegido ? [{ value: NR1_RECORTE_OUTROS, label: 'Outros departamentos' }] : []),
    ]
    : [{ value: 'empresa', label: 'Toda a empresa' }]
}

/** Menu de âncoras fixo no topo, com a seção ativa acompanhando a rolagem e
   o filtro de departamento à direita. */
export function MenuAncoras({ secoes, recorte, onRecorte, opcoesRecorte }: {
  secoes: readonly SecaoAncora[]
  recorte: string
  onRecorte: (v: string) => void
  opcoesRecorte: { value: string; label: string }[]
}) {
  const [ativa, setAtiva] = useState<string>(secoes[0]!.id)

  /* Seção ativa: a última cujo topo já passou da faixa do menu; no fim da
     página o último bloco não chega ao topo, então vale ele. */
  useEffect(() => {
    const raiz = document.querySelector('main')
    if (!raiz) return
    const onScroll = () => {
      let atual = secoes[0]!.id
      for (const s of secoes) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top <= 140) atual = s.id
      }
      if (raiz.scrollTop + raiz.clientHeight >= raiz.scrollHeight - 4) atual = secoes[secoes.length - 1]!.id
      setAtiva(atual)
    }
    raiz.addEventListener('scroll', onScroll, { passive: true })
    return () => raiz.removeEventListener('scroll', onScroll)
  }, [secoes])

  /* Rola só a área de conteúdo (`<main>`), descontando o menu fixo —
     `scrollIntoView` rolava também o contêiner da aplicação no fim da
     página e a tela aparecia cortada. */
  const irPara = (id: string) => {
    setAtiva(id)
    const main = document.querySelector('main')
    const el = document.getElementById(id)
    if (!main || !el) return
    const menu = document.querySelector<HTMLElement>('nav[aria-label="Seções do resultado"]')?.offsetHeight ?? 0
    const destino = el.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop - menu - 8
    main.scrollTo({ top: Math.max(0, destino), behavior: 'smooth' })
  }

  return (
    <nav className="sticky top-0 z-[45] -mx-1 mb-6 flex flex-col gap-1 rounded-lg border border-border bg-surface p-1 shadow-xs lg:flex-row lg:items-center" aria-label="Seções do resultado">
      <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
        {secoes.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => irPara(s.id)}
            aria-current={ativa === s.id || undefined}
            className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${
              ativa === s.id ? 'bg-primary-50 text-primary dark:text-primary-300' : 'text-ink-secondary hover:text-ink'
            }`}
          >
            <Icon icon={s.icon} width={15} aria-hidden />
            {s.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 px-1 lg:w-60 lg:shrink-0">
        <Icon icon="ph:funnel-simple-bold" width={15} className="shrink-0 text-ink-muted" aria-hidden />
        <Select size="sm" className="flex-1" value={recorte} onChange={onRecorte} ariaLabel="Ver resultado de" options={opcoesRecorte} />
      </div>
    </nav>
  )
}

/* Cabeçalho do bloco — fixo logo abaixo do menu enquanto o bloco está na
   tela, para ficar claro o que está sendo visto. */
export function CabecalhoBloco({ titulo, subtitulo, icon, acao, refEl, simples = false }: {
  titulo: string
  subtitulo: string
  icon: string
  acao?: ReactNode
  refEl?: React.Ref<HTMLDivElement>
  /** Título direto na página — sem card e sem ficar fixo na rolagem. */
  simples?: boolean
}) {
  if (simples) {
    return (
      <div ref={refEl} className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-[22px] font-bold leading-tight tracking-[-0.01em] text-ink">{titulo}</h2>
          <p className="mt-1 text-[13px] text-ink-secondary">{subtitulo}</p>
        </div>
        {acao}
      </div>
    )
  }
  return (
    <div ref={refEl} className="sticky top-[81px] z-[40] mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 shadow-sm lg:top-[44px]">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
          <Icon icon={icon} width={22} aria-hidden />
        </span>
        <div>
          <h2 className="font-heading text-[22px] font-bold leading-tight tracking-[-0.01em] text-ink">{titulo}</h2>
          <p className="mt-1 text-[13px] text-ink-secondary">{subtitulo}</p>
        </div>
      </div>
      {acao}
    </div>
  )
}

/* Bloco 1 — Visão geral: radar com a nota de cada domínio (e a do ciclo
   anterior, tracejada) e os cards dos domínios com a direção da nota. */
export function VisaoGeralBloco({ campanha, recorte, onAbrirDominio, simples = false, semCabecalho = false }: {
  campanha: Nr1Campanha
  recorte: string
  /** Título direto na página (ver `CabecalhoBloco`). */
  simples?: boolean
  /** Sem título nem subtítulo (quando a página já diz o que é). */
  semCabecalho?: boolean
  onAbrirDominio: (dimensaoId: Nr1DimensaoId, departamentoId?: string) => void
}) {
  const visao = useService(() => nr1ResultadoService.visaoGeral(campanha.id, recorte === 'empresa' ? null : recorte), [campanha.id, recorte])
  const campanhas = useService(() => nr1CampanhaService.list(), [])

  const cicloAnterior = visao.status === 'success' && visao.data.cicloAnteriorId && campanhas.status === 'success'
    ? campanhas.data.find((c) => c.id === visao.data.cicloAnteriorId)
    : undefined
  const dominios = visao.status === 'success' ? visao.data.dominios : []
  const temAnterior = dominios.some((d) => d.anterior !== null)
  const curto = (id: Nr1DimensaoId) => NR1_DIMENSOES.find((d) => d.id === id)?.curto ?? id

  return (
    <>
      {!semCabecalho && <CabecalhoBloco
        simples={simples}
        titulo="Visão geral"
        icon="ph:chart-polar-bold"
        subtitulo="Nota de cada domínio, de 1 a 5 (5 é a situação desejável)."
      />}

      {visao.status === 'loading' && <Skeleton className="h-80 w-full rounded-lg" />}
      {visao.status === 'error' && <ErrorState message={visao.message} onRetry={visao.reload} />}
      {visao.status === 'success' && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="flex flex-col items-center rounded-lg border border-border bg-surface p-4">
            <RadarChart
              values={dominios.map((d) => d.media ?? 0)}
              previousValues={temAnterior ? dominios.map((d) => d.anterior ?? 0) : undefined}
              labels={dominios.map((d) => curto(d.dimensaoId))}
              pointColors={dominios.map((d) => (d.nivel ? COR_NIVEL[d.nivel] : '#B8B9E5'))}
              pointTitles={dominios.map((d) => d.nome)}
              escala={[1, 2, 3, 4, 5]}
              max={5}
              size={340}
              fontSize={11}
              ariaLabel={`Nota por domínio: ${dominios.map((d) => `${d.nome} ${d.media?.toFixed(1) ?? 'sem dado'}`).join(', ')}`}
            />
            <p className="mt-1 text-center text-[11.5px] text-ink-muted">
              Escala de 1 (centro, pior) a 5 (borda, melhor) · passe o mouse num ponto para ver a nota
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11.5px] text-ink-secondary">
              {(['baixo', 'atencao', 'risco'] as const).map((n) => (
                <span key={n} className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COR_NIVEL[n] }} aria-hidden />{NIVEL_RISCO[n].label}</span>
              ))}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11.5px] text-ink-secondary">
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm bg-[#6C6FC2]/40 ring-1 ring-[#6C6FC2]" aria-hidden />{cicloLabelCurto(campanha)}</span>
              {temAnterior && cicloAnterior && (
                <span className="inline-flex items-center gap-1.5"><span className="h-0 w-4 border-t-2 border-dashed border-[#9395D6]" aria-hidden />{cicloLabelCurto(cicloAnterior)}</span>
              )}
            </div>
          </div>

          <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {dominios.map((d) => {
              const meta = NR1_DIMENSOES.find((x) => x.id === d.dimensaoId)
              const st = d.nivel ? NIVEL_RISCO[d.nivel] : null
              const delta = d.media !== null && d.anterior !== null ? Number((d.media - d.anterior).toFixed(1)) : null
              const direcao = delta === null ? null : delta > LIMIAR_TENDENCIA ? 'melhorou' : delta < -LIMIAR_TENDENCIA ? 'piorou' : 'igual'
              const clicavel = d.media !== null && recorte !== NR1_RECORTE_OUTROS
              return (
                <li key={d.dimensaoId}>
                  <button
                    type="button"
                    disabled={!clicavel}
                    onClick={() => onAbrirDominio(d.dimensaoId, recorte === 'empresa' ? undefined : recorte)}
                    className="flex h-full w-full flex-col rounded-lg border border-border bg-surface p-3.5 text-left transition-colors enabled:hover:border-border-strong enabled:hover:bg-surface-hover disabled:cursor-default"
                  >
                    <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink">
                      <Icon icon={meta?.icon ?? 'ph:list-bold'} width={14} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
                      <span className="min-w-0 truncate">{d.nome}</span>
                    </span>
                    <span className="mt-2 flex items-end justify-between gap-2">
                      <span className="font-mono text-[24px] font-bold leading-none text-ink">{d.media !== null ? d.media.toFixed(1) : '—'}</span>
                      {st && <span className={`rounded-pill px-2 py-0.5 text-[10.5px] font-semibold ${st.cls}`}>{st.label}</span>}
                    </span>
                    {d.anterior !== null && direcao && (
                      <span className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2 text-[11.5px]">
                        <span className="text-ink-secondary">Ciclo anterior: <span className="font-mono font-semibold text-ink">{d.anterior.toFixed(1)}</span></span>
                        <DirecaoNota direcao={direcao} delta={delta!} />
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </>
  )
}

/** Cor do nó do radar por nível da nota — as mesmas do mapa de calor. */
export const COR_NIVEL: Record<'baixo' | 'atencao' | 'risco' | 'critico', string> = {
  baixo: '#4EA88B',
  atencao: '#E8A640',
  risco: '#D75A6E',
  critico: '#7E3FA6',
}

function DirecaoNota({ direcao, delta }: { direcao: 'melhorou' | 'piorou' | 'igual'; delta: number }) {
  const v = {
    melhorou: { icon: 'ph:arrow-up-right-bold', cls: 'text-success-ink', label: 'Melhorou' },
    piorou: { icon: 'ph:arrow-down-right-bold', cls: 'text-danger-ink', label: 'Piorou' },
    igual: { icon: 'ph:equals-bold', cls: 'text-ink-secondary', label: 'Igual' },
  }[direcao]
  return (
    <span className={`inline-flex items-center gap-1 font-semibold ${v.cls}`} title={`${delta > 0 ? '+' : ''}${delta.toFixed(1)} ponto`}>
      <Icon icon={v.icon} width={11} aria-hidden />
      {v.label}
      {direcao !== 'igual' && <span className="font-mono font-medium">{delta > 0 ? '+' : ''}{delta.toFixed(1)}</span>}
    </span>
  )
}


/** Filtro de departamento ao lado do título de um bloco. */
export function FiltroDepartamento({ value, onChange, opcoes, rotulo }: {
  value: string
  onChange: (v: string) => void
  opcoes: { value: string; label: string }[]
  rotulo: string
}) {
  return (
    <div className="flex w-full items-center gap-2 sm:w-60">
      <Icon icon="ph:funnel-simple-bold" width={15} className="shrink-0 text-ink-muted" aria-hidden />
      <Select size="sm" className="flex-1" value={value} onChange={onChange} ariaLabel={rotulo} options={opcoes} />
    </div>
  )
}

/* "Resultado do ciclo" completo: título, filtro de departamento, o radar
   com a nota de cada domínio e os cards dos domínios. Clicar num domínio
   abre a análise com os fatores apontados. Usado pelas duas Visões gerais
   do RH (`NR1RhCockpit` e `NR1RhVisaoGeral`), para mostrarem o mesmo
   resultado do mesmo jeito. */
export function ResultadoCicloSecao({ campanha }: { campanha: Nr1Campanha }) {
  const [recorte, setRecorte] = useState('empresa')
  const opcoes = useOpcoesRecorte(campanha.id)
  const mapa = useService(() => nr1ResultadoService.mapaCalor(campanha.id), [campanha.id])
  const [analise, setAnalise] = useState<Nr1AnaliseEscopo | null>(null)

  const abrirAnalise = (dimensaoId: Nr1DimensaoId, departamentoId?: string) => {
    if (mapa.status !== 'success' || departamentoId === NR1_RECORTE_OUTROS) return
    setAnalise({ campanhaId: campanha.id, cicloLabel: cicloLabelCurto(campanha), dimensaoId, departamentoId, linhas: mapa.data })
  }

  return (
    <>
      <CabecalhoBloco
        simples
        titulo={`Resultado do ciclo ${cicloLabelCurto(campanha)}`}
        icon="ph:chart-polar-bold"
        subtitulo="Nota de cada domínio, de 1 a 5 (5 é a situação desejável), comparada ao ciclo anterior."
        acao={<FiltroDepartamento value={recorte} onChange={setRecorte} opcoes={opcoes} rotulo="Filtrar o resultado do ciclo por departamento" />}
      />
      <VisaoGeralBloco semCabecalho campanha={campanha} recorte={recorte} onAbrirDominio={abrirAnalise} />
      <Nr1AnaliseRiscoModal escopo={analise} onClose={() => setAnalise(null)} />
    </>
  )
}
