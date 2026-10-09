import { useLayoutEffect, useRef, useState } from 'react'
import { NIVEL_RISCO } from '../lib/nr1'
import { nr1NivelPorMedia } from '../data/nr1Mock'

/* Gráfico de linhas da evolução por ciclos — eixo Y a nota (1 a 5), eixo X
   os ciclos, uma linha por domínio. Passar o mouse numa entrada da legenda
   destaca a linha daquele domínio; passar o mouse sobre um ciclo mostra um
   card com a nota de cada domínio naquele ciclo. SVG próprio (o projeto não
   usa biblioteca de gráficos), redimensionado pela largura do container. */

export interface SerieEvolucao {
  id: string
  nome: string
  cor: string
  /** Uma nota por ciclo (`null` = sem dado). */
  valores: (number | null)[]
}

const ALTURA = 340
/* Margens laterais largas o bastante para os rótulos dos ciclos das pontas. */
const M = { top: 16, right: 72, bottom: 36, left: 88 }

export function Nr1EvolucaoChart({ ciclos, series }: { ciclos: string[]; series: SerieEvolucao[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [largura, setLargura] = useState(800)
  const [destaque, setDestaque] = useState<string | null>(null)
  const [cicloHover, setCicloHover] = useState<number | null>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const medir = () => setLargura(el.clientWidth)
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /* Escala do eixo Y ajustada aos dados (de meio em meio ponto), para as
     diferenças entre domínios aparecerem; sempre dentro de 1 a 5. */
  const todos = series.flatMap((s) => s.valores).filter((v): v is number => v !== null)
  const Y_MIN = todos.length ? Math.max(1, Math.floor((Math.min(...todos) - 0.25) * 2) / 2) : 1
  const Y_MAX = todos.length ? Math.min(5, Math.ceil((Math.max(...todos) + 0.25) * 2) / 2) : 5
  const ticks: number[] = []
  for (let v = Y_MIN; v <= Y_MAX + 1e-9; v += 0.5) ticks.push(Number(v.toFixed(1)))

  const w = Math.max(320, largura)
  const iw = w - M.left - M.right
  const ih = ALTURA - M.top - M.bottom
  const n = ciclos.length
  /* Com um ciclo só, o ponto fica no meio. */
  const x = (i: number) => M.left + (n <= 1 ? iw / 2 : (iw * i) / (n - 1))
  const y = (v: number) => M.top + ih - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * ih

  const caminho = (valores: (number | null)[]) => {
    let d = ''
    let caneta = false
    valores.forEach((v, i) => {
      if (v === null) { caneta = false; return }
      d += `${caneta ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)} `
      caneta = true
    })
    return d
  }

  /* Faixas de nível ao fundo, as mesmas do mapa de calor. */
  const faixas = [
    { de: 4, ate: 5, cls: 'fill-success/[0.07]' },
    { de: 3, ate: 4, cls: 'fill-warning/[0.08]' },
    { de: 1, ate: 3, cls: 'fill-danger/[0.07]' },
  ]
    .map((f) => ({ ...f, de: Math.max(f.de, Y_MIN), ate: Math.min(f.ate, Y_MAX) }))
    .filter((f) => f.ate > f.de)

  const opacidade = (id: string) => (destaque === null || destaque === id ? 1 : 0.12)
  const hoverX = cicloHover !== null ? x(cicloHover) : 0
  const cardEsquerda = cicloHover !== null && hoverX > w / 2

  return (
    <div>
      <div ref={ref} className="relative w-full" onMouseLeave={() => setCicloHover(null)}>
        <svg width={w} height={ALTURA} role="img" aria-label={`Evolução das notas por domínio: ${series.map((s) => `${s.nome} ${s.valores.map((v) => v?.toFixed(1) ?? '—').join(' → ')}`).join('; ')}`}>
          {faixas.map((f) => (
            <rect key={f.de} x={M.left} y={y(f.ate)} width={iw} height={y(f.de) - y(f.ate)} className={f.cls} />
          ))}
          {ticks.map((v) => (
            <g key={v}>
              <line x1={M.left} x2={M.left + iw} y1={y(v)} y2={y(v)} stroke="var(--border)" strokeDasharray={v === Y_MIN || v === Y_MAX ? undefined : '3 4'} />
              <text x={M.left - 10} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--text-muted)" fontFamily="JetBrains Mono, monospace">{v.toFixed(1)}</text>
            </g>
          ))}
          {ciclos.map((c, i) => (
            <text key={c} x={x(i)} y={ALTURA - 12} textAnchor="middle" fontSize="11.5" fontWeight={cicloHover === i ? 700 : 500} fill={cicloHover === i ? 'var(--text-primary)' : 'var(--text-secondary)'} fontFamily="Inter Variable, Inter, sans-serif">{c}</text>
          ))}

          {cicloHover !== null && (
            <line x1={hoverX} x2={hoverX} y1={M.top} y2={M.top + ih} stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="4 3" />
          )}

          {series.map((s) => (
            <g key={s.id} style={{ opacity: opacidade(s.id), transition: 'opacity 150ms' }}>
              <path d={caminho(s.valores)} fill="none" stroke={s.cor} strokeWidth={destaque === s.id ? 3.5 : 2.25} strokeLinejoin="round" strokeLinecap="round" />
              {s.valores.map((v, i) => v !== null && (
                <circle key={i} cx={x(i)} cy={y(v)} r={cicloHover === i || destaque === s.id ? 5 : 3.5} fill={s.cor} stroke="var(--surface)" strokeWidth="1.5" />
              ))}
            </g>
          ))}

          {/* Áreas de hover — uma faixa vertical por ciclo. */}
          {ciclos.map((c, i) => {
            const passo = n <= 1 ? iw : iw / (n - 1)
            const x0 = Math.max(M.left, x(i) - passo / 2)
            const x1 = Math.min(M.left + iw, x(i) + passo / 2)
            return <rect key={c} x={x0} y={M.top} width={x1 - x0} height={ih} fill="transparent" style={{ cursor: 'crosshair' }} onMouseEnter={() => setCicloHover(i)} onMouseMove={() => setCicloHover(i)} />
          })}
        </svg>

        {cicloHover !== null && (
          <div
            role="tooltip"
            className="pointer-events-none absolute top-3 z-10 w-64 rounded-lg border border-border bg-surface p-3 shadow-lg"
            style={cardEsquerda ? { right: w - hoverX + 14 } : { left: hoverX + 14 }}
          >
            <p className="mb-2 font-heading text-[13px] font-semibold text-ink">Ciclo {ciclos[cicloHover]}</p>
            <ul className="flex flex-col gap-1">
              {[...series]
                .sort((a, b) => (a.valores[cicloHover] ?? 9) - (b.valores[cicloHover] ?? 9))
                .map((s) => {
                  const v = s.valores[cicloHover]
                  const ant = cicloHover > 0 ? s.valores[cicloHover - 1] : null
                  const delta = v !== null && ant !== null && ant !== undefined ? v - ant : null
                  return (
                    <li key={s.id} className={`flex items-center gap-2 text-[12px] ${destaque && destaque !== s.id ? 'opacity-40' : ''}`}>
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.cor }} aria-hidden />
                      <span className="min-w-0 flex-1 truncate text-ink-secondary">{s.nome}</span>
                      {delta !== null && Math.abs(delta) >= 0.05 && (
                        <span className={`font-mono text-[10.5px] ${delta > 0 ? 'text-success-ink' : 'text-danger-ink'}`}>{delta > 0 ? '+' : ''}{delta.toFixed(1)}</span>
                      )}
                      <span className={`rounded-pill px-1.5 font-mono text-[11px] font-semibold ${v !== null ? NIVEL_RISCO[nr1NivelPorMedia(v)].cls : 'text-ink-muted'}`}>{v !== null ? v.toFixed(1) : '—'}</span>
                    </li>
                  )
                })}
            </ul>
          </div>
        )}
      </div>

      {/* Legenda — passar o mouse destaca a linha do domínio. */}
      <ul className="mt-3 flex flex-wrap justify-center gap-1.5" onMouseLeave={() => setDestaque(null)}>
        {series.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onMouseEnter={() => setDestaque(s.id)}
              onFocus={() => setDestaque(s.id)}
              onBlur={() => setDestaque(null)}
              className={`inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-[12px] transition-all ${
                destaque === s.id ? 'border-border-strong bg-surface font-semibold text-ink shadow-xs' : destaque ? 'border-transparent text-ink-muted' : 'border-transparent text-ink-secondary'
              }`}
            >
              <span className="h-2.5 w-4 rounded-sm" style={{ background: s.cor }} aria-hidden />
              {s.nome}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
