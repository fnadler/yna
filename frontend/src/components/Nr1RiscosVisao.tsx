import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@iconify/react'
import { NIVEL_RISCO, NR1_PROBABILIDADE_ROTULOS, NR1_SEVERIDADE_ROTULOS, NR1_SEVERIDADE_CLS } from '../lib/nr1'
import { nr1NivelPorProduto } from '../data/nr1Mock'
import type { Nr1Acao, Nr1NivelRisco, Nr1RiscoInventario } from '../types'

/* Matriz probabilidade × severidade e lista dos fatores de risco
   identificados — as mesmas no Inventário de riscos e na aba "Resultado"
   do detalhe de um ciclo. */

/** Colunas da lista no desktop: risco, domínio, área, ações, probabilidade,
   severidade e, por último, a nota. */
const RISCOS_GRID_COLS = 'grid-cols-[1fr_150px_130px_56px_120px_120px_88px]'

/** Nota do risco: o rótulo do nível em destaque e o valor (P × S) menor. */
export function Nr1NotaRisco({ risco, compacta = false }: { risco: Nr1RiscoInventario; compacta?: boolean }) {
  const nivel = NIVEL_RISCO[risco.nivel]
  return (
    <span className={`flex w-fit min-w-[72px] flex-col items-center gap-0.5 rounded-lg ${compacta ? 'px-2 py-1' : 'px-2.5 py-1.5'} ${nivel.cls}`} title={`Probabilidade ${risco.probabilidade} × severidade ${risco.severidade}`}>
      <span className={`font-heading font-bold leading-none ${compacta ? 'text-[11.5px]' : 'text-[12.5px]'}`}>{nivel.label}</span>
      <span className="font-mono text-[10px] font-medium leading-none opacity-80">{risco.nivelNum}</span>
    </span>
  )
}

/** Severidade do fator em destaque visual — a cor sobe com o impacto. */
export function Nr1SeveridadeTag({ severidade }: { severidade: number }) {
  return (
    <span className={`inline-flex w-fit items-center gap-1 rounded-pill px-2 py-0.5 text-[11.5px] font-semibold ${NR1_SEVERIDADE_CLS[severidade]}`}>
      <span className="font-mono">{severidade}</span>
      {NR1_SEVERIDADE_ROTULOS[severidade - 1]}
    </span>
  )
}

export function Nr1ListaRiscos({ riscos, acoes, onAbrir }: {
  riscos: Nr1RiscoInventario[]
  acoes: Nr1Acao[]
  onAbrir: (r: Nr1RiscoInventario) => void
}) {
  /* Ações vigentes do risco — uma versão já substituída por outra não conta. */
  const vinculadas = (riscoId: string) => acoes.filter((a) => a.riscoId === riscoId && !acoes.some((b) => b.versaoAnteriorId === a.id))
  return (
    <div className="flex flex-col gap-2">
      {/* Cabeçalho das colunas — só no desktop. */}
      <div className={`hidden items-center gap-3 px-3.5 lg:grid ${RISCOS_GRID_COLS}`}>
        {['Risco', 'Domínio', 'Área', 'Ações', 'Probabilidade', 'Severidade', 'Nota'].map((c) => (
          <span key={c} className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{c}</span>
        ))}
      </div>
      {riscos.map((r) => <RiscoLinha key={r.id} risco={r} vinculadas={vinculadas(r.id)} onClick={() => onAbrir(r)} />)}
    </div>
  )
}

/** Linha de um risco. Clicar abre o detalhe do risco em tela cheia. */
function RiscoLinha({ risco, vinculadas, onClick }: {
  risco: Nr1RiscoInventario
  vinculadas: Nr1Acao[]
  onClick: () => void
}) {
  const probabilidade = `${risco.probabilidade} · ${NR1_PROBABILIDADE_ROTULOS[risco.probabilidade - 1]}`
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      className="cursor-pointer rounded-lg border border-border bg-surface p-3.5 transition-colors hover:border-border-strong hover:bg-surface-hover"
    >
      {/* Desktop — colunas */}
      <div className={`hidden items-center gap-3 lg:grid ${RISCOS_GRID_COLS}`}>
        <div className="min-w-0">
          <p className="text-[13.5px] leading-snug text-ink">{risco.fator}</p>
          <p className="mt-0.5 text-[11px] text-ink-muted">{risco.respondentes} respondentes</p>
        </div>
        <p className="min-w-0 truncate text-[12.5px] text-ink-secondary">{risco.dimensao}</p>
        <p className="min-w-0 truncate text-[12.5px] text-ink-secondary">{risco.grupoExposto}</p>
        <span className="inline-flex w-fit items-center gap-1 text-[12.5px] text-ink-secondary">
          <Icon icon="ph:list-checks-bold" width={13} className="shrink-0 text-ink-muted" aria-hidden />
          {vinculadas.length}
        </span>
        <p className="text-[12.5px] text-ink-secondary">{probabilidade}</p>
        <Nr1SeveridadeTag severidade={risco.severidade} />
        <Nr1NotaRisco risco={risco} />
      </div>

      {/* Mobile/tablet — pilha compacta */}
      <div className="flex items-start gap-3 lg:hidden">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 text-[13.5px] font-medium leading-snug text-ink">{risco.fator}</p>
            <Nr1NotaRisco risco={risco} compacta />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11.5px] text-ink-secondary">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-ink-muted">{risco.dimensao}</span>
            <span>{risco.grupoExposto}</span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <Icon icon="ph:list-checks-bold" width={11} aria-hidden />
              {vinculadas.length} {vinculadas.length === 1 ? 'ação' : 'ações'}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11.5px] text-ink-secondary">
            <span>Probabilidade {probabilidade}</span>
            <span className="text-ink-muted">·</span>
            <Nr1SeveridadeTag severidade={risco.severidade} />
          </div>
        </div>
        <Icon icon="ph:caret-right-bold" width={14} className="mt-1 shrink-0 text-ink-muted" aria-hidden />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
   Visualização "Matriz de risco" — probabilidade (eixo Y, de 5 no topo a 1
   embaixo) × severidade (eixo X, de 1 a 5). Cada risco cai na célula da sua
   pontuação; a cor da célula é o nível do produto P × S (mesmos cortes de
   `nr1NivelPorProduto`). Clicar num risco abre o mesmo detalhe da lista.
   ------------------------------------------------------------------ */


/** Fundo de cada célula — tons suaves do nível, para os cards de risco
   continuarem legíveis por cima. */
const CELULA_NIVEL: Record<Nr1NivelRisco, string> = {
  baixo: 'bg-success/20',
  atencao: 'bg-warning/30',
  risco: 'bg-danger/20',
  critico: 'bg-critico/30',
}

/** Cards visíveis por célula antes do "+N". */
const POR_CELULA = 2

export function Nr1MatrizRiscos({ riscos, onAbrir, titulo, acao }: {
  riscos: Nr1RiscoInventario[]
  onAbrir: (r: Nr1RiscoInventario) => void
  /** Título no topo do card, com `acao` (ex.: um filtro) à direita. */
  titulo?: string
  acao?: React.ReactNode
}) {
  const [expandida, setExpandida] = useState<string | null>(null)
  const [dica, setDica] = useState<Dica | null>(null)
  /* A posição é fixa na tela — rolar com o tooltip aberto o descolaria do card. */
  useEffect(() => {
    if (!dica) return
    const fechar = () => setDica(null)
    window.addEventListener('scroll', fechar, true)
    return () => window.removeEventListener('scroll', fechar, true)
  }, [dica])

  return (
    <div className="rounded-lg border border-border bg-surface p-4 lg:p-5">
      {dica && <TooltipRisco dica={dica} />}
      {titulo && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-[17px] font-semibold text-ink">{titulo}</h2>
          {acao}
        </div>
      )}
      <div className="overflow-x-auto">
        <div className="grid min-w-[680px] grid-cols-[24px_104px_repeat(5,minmax(0,1fr))] gap-1">
          {/* Título do eixo Y, ao longo das 5 linhas */}
          <div className="row-span-5 flex items-center justify-center">
            <span className="-rotate-90 whitespace-nowrap font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Probabilidade
            </span>
          </div>

          {[5, 4, 3, 2, 1].map((p) => (
            <MatrizLinha key={p} p={p} riscos={riscos} expandida={expandida} onExpandir={setExpandida} onAbrir={onAbrir} onDica={setDica} />
          ))}

          {/* Eixo X */}
          <div />
          <div />
          {NR1_SEVERIDADE_ROTULOS.map((r, i) => (
            <p key={r} className="pt-0.5 text-center text-[11px] text-ink-secondary">
              <span className="font-mono font-semibold text-ink">{i + 1}</span> · {r}
            </p>
          ))}
          <div />
          <div />
          <p className="col-span-5 text-center font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Severidade</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3 text-[11.5px] text-ink-secondary">
        <span className="font-medium text-ink">Nível (P × S):</span>
        {(['baixo', 'atencao', 'risco', 'critico'] as Nr1NivelRisco[]).map((n) => (
          <span key={n} className="inline-flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded-[3px] ${CELULA_NIVEL[n]} ring-1 ring-inset ring-border`} aria-hidden />
            {NIVEL_RISCO[n].label}
          </span>
        ))}
        <span className="text-ink-muted">· Clique num risco para ver o detalhe.</span>
      </div>
    </div>
  )
}

function MatrizLinha({ p, riscos, expandida, onExpandir, onAbrir, onDica }: {
  p: number
  riscos: Nr1RiscoInventario[]
  expandida: string | null
  onExpandir: (k: string | null) => void
  onAbrir: (r: Nr1RiscoInventario) => void
  onDica: (d: Dica | null) => void
}) {
  const mostrar = (r: Nr1RiscoInventario, el: HTMLElement) => {
    const b = el.getBoundingClientRect()
    onDica({ risco: r, x: b.left + b.width / 2, topo: b.top, base: b.bottom })
  }
  return (
    <>
      <div className="flex flex-col items-end justify-center pr-1 text-right">
        <p className="text-[11px] leading-tight text-ink-secondary"><span className="font-mono font-semibold text-ink">{p}</span> · {NR1_PROBABILIDADE_ROTULOS[p - 1]}</p>
      </div>
      {[1, 2, 3, 4, 5].map((sev) => {
        const chave = `${p}-${sev}`
        const produto = p * sev
        const nivel = nr1NivelPorProduto(produto)
        const aqui = riscos.filter((r) => r.probabilidade === p && r.severidade === sev).sort((a, b) => a.fator.localeCompare(b.fator))
        const aberta = expandida === chave
        const visiveis = aberta ? aqui : aqui.slice(0, POR_CELULA)
        return (
          <div
            key={sev}
            className={`flex min-h-[64px] flex-col gap-1 rounded-none p-1 ${CELULA_NIVEL[nivel]}`}
            aria-label={`Probabilidade ${p} × severidade ${sev}: ${aqui.length} ${aqui.length === 1 ? 'risco' : 'riscos'}`}
          >
            <span className="self-end font-mono text-[9.5px] font-semibold leading-none text-ink-muted">{produto}</span>
            {visiveis.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => { onDica(null); onAbrir(r) }}
                onMouseEnter={(e) => mostrar(r, e.currentTarget)}
                onMouseLeave={() => onDica(null)}
                onFocus={(e) => mostrar(r, e.currentTarget)}
                onBlur={() => onDica(null)}
                aria-label={`${r.fator}. Departamentos afetados: ${r.grupoExposto}`}
                className="w-full rounded-md border border-border bg-surface px-2 py-1 text-left shadow-xs transition-colors hover:border-primary/50 hover:bg-surface-hover"
              >
                <p className="truncate text-[11px] font-semibold leading-snug text-ink">{r.fator}</p>
              </button>
            ))}
            {aqui.length > POR_CELULA && (
              <button
                type="button"
                onClick={() => onExpandir(aberta ? null : chave)}
                className="rounded-md px-2 py-0.5 text-[10.5px] font-medium text-primary hover:underline dark:text-primary-300"
              >
                {aberta ? 'Mostrar menos' : `+${aqui.length - POR_CELULA} ${aqui.length - POR_CELULA === 1 ? 'risco' : 'riscos'}`}
              </button>
            )}
          </div>
        )
      })}
    </>
  )
}

/** Risco sob o mouse (ou foco) na matriz, com a posição do card na tela. */
interface Dica {
  risco: Nr1RiscoInventario
  x: number
  topo: number
  base: number
}

/** Tooltip de um card da matriz — nome completo do risco e os departamentos
   afetados. Em portal com posição fixa: dentro da matriz ele seria cortado
   pela rolagem horizontal do container. Abre acima do card; perto do topo
   da tela, abre abaixo. */
function TooltipRisco({ dica }: { dica: Dica }) {
  const acima = dica.topo > 160
  const deps = dica.risco.grupoExposto.split(',').map((x) => x.trim()).filter(Boolean)
  const largura = 260
  const left = Math.min(Math.max(dica.x - largura / 2, 8), window.innerWidth - largura - 8)
  return createPortal(
    <div
      role="tooltip"
      className="pointer-events-none fixed z-[70] rounded-lg border border-border bg-surface p-3 shadow-lg"
      style={{ left, width: largura, ...(acima ? { bottom: window.innerHeight - dica.topo + 8 } : { top: dica.base + 8 }) }}
    >
      <p className="text-[13px] font-semibold leading-snug text-ink">{dica.risco.fator}</p>
      <p className="mt-0.5 text-[11px] text-ink-muted">{dica.risco.dimensao}</p>
      <p className="mt-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
        {deps.length === 1 ? 'Departamento afetado' : 'Departamentos afetados'}
      </p>
      <ul className="mt-1 flex flex-wrap gap-1">
        {deps.map((d) => (
          <li key={d} className="inline-flex items-center gap-1 rounded-pill bg-primary-50 px-2 py-0.5 text-[11.5px] font-medium text-primary dark:text-primary-300">
            <Icon icon="ph:buildings-bold" width={11} aria-hidden />
            {d}
          </li>
        ))}
      </ul>
    </div>,
    document.body,
  )
}

