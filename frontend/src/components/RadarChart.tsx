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
}

export function RadarChart({ values, labels, previousValues, size = 150, max = 10, ariaLabel }: RadarChartProps) {
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
    .reduce((m, l) => Math.max(m, l.length * 4.4 + 10), 0)
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
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={descricao}
    >
      {[0.33, 0.66, 1].map((s) => (
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
        const [x, y] = point(i, v / 10)
        return (
          <circle key={i} cx={x} cy={y} r="3" fill="#4749A8" className="dark:fill-[#9395D6]" />
        )
      })}
      {labels.map((label, i) => {
        const [x, y] = point(i, 1)
        /* Rótulo lateral ancora pela borda de dentro e sai para fora do
           polígono; só os quase-verticais ficam centrados. */
        const lateral = ehLateral(i)
        const anchor = lateral ? (x > cx ? 'start' : 'end') : 'middle'
        const tx = lateral ? x + (x > cx ? 7 : -7) : x
        const ty = lateral ? y + 3 : y + (y > cy ? 12 : -5)
        return (
          <text
            key={label}
            x={tx}
            y={ty}
            textAnchor={anchor}
            fontSize="8.5"
            fontWeight="600"
            fill="var(--text-muted)"
            fontFamily="Inter Variable, Inter, sans-serif"
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}
