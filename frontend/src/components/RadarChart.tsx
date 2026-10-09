import { useState } from 'react'

export interface RadarChartProps {
  values: number[]
  labels: string[]
  previousValues?: number[]
  size?: number
  /** Topo da escala dos valores. Padrão 10 (Roda da Vida); a avaliação
     psicossocial NR-1 usa 5. */
  max?: number
  /** Descrição acessível do gráfico. Sem isso, cai na Roda da Vida. */
  ariaLabel?: string
  /** Tamanho dos rótulos dos eixos (px). Padrão 8.5, o da Roda da Vida. */
  fontSize?: number
  /** Cor de cada nó (mesma ordem de `values`) — ex.: a cor do nível de
     risco da nota. Sem isso, todos com a cor da marca. */
  pointColors?: string[]
  /** Anéis com a escala rotulada (ex.: [1, 2, 3, 4, 5]) — os números saem
     ao longo do eixo de cima, deixando claro que o centro é a nota mais
     baixa e a borda a mais alta. Sem isso, os três anéis neutros de antes. */
  escala?: number[]
  /** Nome completo de cada eixo — liga o card que aparece ao passar o mouse
     num nó (nome e nota, e a anterior quando houver). */
  pointTitles?: string[]
}

export function RadarChart({ values, labels, previousValues, size = 150, max = 10, ariaLabel, fontSize = 8.5, pointColors, escala, pointTitles }: RadarChartProps) {
  const [hover, setHover] = useState<number | null>(null)
  const cx = size / 2
  const cy = size / 2
  const n = values.length

  const cos = (i: number) => Math.cos((Math.PI * 2 * i) / n - Math.PI / 2)
  /* Um rótulo é "lateral" quando o eixo aponta para leste/oeste: ele sai na
     horizontal e precisa de folga na viewBox, senão é cortado. */
  const ehLateral = (i: number) => Math.abs(cos(i)) > 0.3

  /* A margem reservada nasce do rótulo lateral mais longo (≈4.4px por caractere
     a 8.5px) — só os laterais disputam espaço horizontal. Os demais eixos ficam
     com os 26px históricos. */
  const larguraLateral = labels
    .filter((_, i) => ehLateral(i))
    .reduce((m, l) => Math.max(m, l.length * 4.4 * (fontSize / 8.5) + 10), 0)
  const r = size / 2 - Math.max(26, Math.min(size * 0.3, larguraLateral))

  const point = (i: number, scale: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    return [cx + Math.cos(angle) * r * scale, cy + Math.sin(angle) * r * scale] as const
  }

  const ring = (scale: number) =>
    Array.from({ length: n }, (_, i) => point(i, scale).join(',')).join(' ')

  const toPath = (vals: number[]) =>
    vals.map((v, i) => point(i, v / max).join(',')).join(' ')

  const descricao = ariaLabel ?? `Roda da Vida: ${labels.map((l, i) => `${l} ${values[i]} de ${max}`).join(', ')}`

  return (
    <div className="relative inline-block">
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={descricao}
    >
      {(escala ? escala.map((v) => v / max) : [0.33, 0.66, 1]).map((s) => (
        <polygon key={s} points={ring(s)} fill="none" stroke="var(--border)" strokeWidth="1" />
      ))}
      {values.map((_, i) => {
        const [x, y] = point(i, 1)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth="1" />
      })}
      {previousValues && (
        <polygon
          points={toPath(previousValues)}
          fill="rgba(147,149,214,0.12)"
          stroke="#9395D6"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          strokeLinejoin="round"
        />
      )}
      <polygon
        points={toPath(values)}
        fill="rgba(108,111,194,0.25)"
        stroke="#6C6FC2"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {values.map((v, i) => {
        const [x, y] = point(i, v / max)
        return (
          pointColors?.[i]
            ? (
              <g key={i}>
                <circle cx={x} cy={y} r={hover === i ? 7.5 : 5.5} fill={pointColors[i]} stroke="var(--surface)" strokeWidth="2" style={{ transition: 'r 120ms' }} />
                {pointTitles && (
                  <circle
                    cx={x} cy={y} r="13" fill="transparent" style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                    aria-label={`${pointTitles[i]}: ${v.toFixed(1)}`}
                  />
                )}
              </g>
            )
            : <circle key={i} cx={x} cy={y} r="3" fill="#4749A8" className="dark:fill-[#9395D6]" />
        )
      })}
      {labels.map((label, i) => {
        const [x, y] = point(i, 1)
        /* Rótulo lateral ancora pela borda de dentro e sai para fora do
           polígono; só os quase-verticais ficam centrados. */
        const lateral = ehLateral(i)
        const anchor = lateral ? (x > cx ? 'start' : 'end') : 'middle'
        const tx = lateral ? x + (x > cx ? 7 : -7) : x
        const ty = lateral ? y + fontSize * 0.35 : y + (y > cy ? fontSize * 1.4 : -fontSize * 0.6)
        return (
          <text
            key={label}
            x={tx}
            y={ty}
            textAnchor={anchor}
            fontSize={fontSize}
            fontWeight="600"
            fill="var(--text-muted)"
            fontFamily="Inter Variable, Inter, sans-serif"
          >
            {label}
          </text>
        )
      })}
      {/* Números da escala ao longo do eixo de cima (centro = menor). */}
      {escala?.map((v) => {
        const [x, y] = point(0, v / max)
        return (
          <text key={`e${v}`} x={x + 5} y={y + 3.5} fontSize={fontSize - 1.5} fontWeight="600" fill="var(--text-muted)" fontFamily="JetBrains Mono, monospace">
            {v}
          </text>
        )
      })}
    </svg>
    {hover !== null && pointTitles && (() => {
      const [x, y] = point(hover, values[hover]! / max)
      const ant = previousValues?.[hover]
      return (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-10 w-max max-w-[220px] -translate-x-1/2 rounded-lg border border-border bg-surface px-3 py-2 shadow-lg"
          style={{ left: x, top: y + 14 }}
        >
          <p className="text-[12.5px] font-semibold text-ink">{pointTitles[hover]}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-secondary">
            {pointColors?.[hover] && <span className="h-2.5 w-2.5 rounded-full" style={{ background: pointColors[hover] }} aria-hidden />}
            Nota <span className="font-mono font-bold text-ink">{values[hover]!.toFixed(1)}</span>
            {ant !== undefined && ant > 0 && <span className="text-ink-muted">· antes {ant.toFixed(1)}</span>}
          </p>
        </div>
      )
    })()}
    </div>
  )
}
