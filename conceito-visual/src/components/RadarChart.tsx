export interface RadarChartProps {
  /** Valores 0–10 por pilar, na ordem dos rótulos. */
  values: number[]
  labels: string[]
  size?: number
}

/** Roda da Vida condensada — radar SVG com tokens da marca. */
export function RadarChart({ values, labels, size = 150 }: RadarChartProps) {
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 26
  const n = values.length

  const point = (i: number, scale: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    return [cx + Math.cos(angle) * r * scale, cy + Math.sin(angle) * r * scale] as const
  }

  const ring = (scale: number) =>
    Array.from({ length: n }, (_, i) => point(i, scale).join(',')).join(' ')

  const data = values.map((v, i) => point(i, v / 10).join(',')).join(' ')

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Roda da Vida: ${labels.map((l, i) => `${l} ${values[i]} de 10`).join(', ')}`}
    >
      {[0.33, 0.66, 1].map((s) => (
        <polygon
          key={s}
          points={ring(s)}
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
        />
      ))}
      {values.map((_, i) => {
        const [x, y] = point(i, 1)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth="1" />
      })}
      <polygon points={data} fill="rgba(108,111,194,0.25)" stroke="#6C6FC2" strokeWidth="2" strokeLinejoin="round" />
      {values.map((v, i) => {
        const [x, y] = point(i, v / 10)
        return <circle key={i} cx={x} cy={y} r="3" fill="#4749A8" className="dark:fill-[#9395D6]" />
      })}
      {labels.map((label, i) => {
        const [x, y] = point(i, 1.28)
        return (
          <text
            key={label}
            x={x}
            y={y + 3}
            textAnchor="middle"
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
