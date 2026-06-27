import { useEffect, useState } from 'react'
import { Button } from './Button'

const fmtTimer = (total: number) => {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/* Botão de entrar na sala da sessão.
   Quando o beneficiário já entrou (`live`), muda de cor (verde "ao vivo") e
   exibe um timer com o tempo desde que a sala foi aberta, contando ao vivo. */
export function EntrarSessaoButton({
  onClick,
  label = 'Entrar',
  size = 'md',
  fullWidth = false,
  className = '',
  live = false,
  openedSeconds = 0,
}: {
  onClick?: () => void
  label?: string
  size?: 'sm' | 'md'
  fullWidth?: boolean
  className?: string
  live?: boolean
  openedSeconds?: number
}) {
  const [elapsed, setElapsed] = useState(openedSeconds)

  useEffect(() => {
    if (!live) return
    setElapsed(openedSeconds)
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [live, openedSeconds])

  if (!live) {
    return (
      <Button size={size} iconLeft="ph:video-camera-bold" fullWidth={fullWidth} className={className} onClick={onClick}>
        {label}
      </Button>
    )
  }

  return (
    <Button
      size={size}
      fullWidth={fullWidth}
      onClick={onClick}
      className={`!bg-success !text-white hover:!shadow-sm ${className}`}
      aria-label={`${label} — beneficiário na sala há ${fmtTimer(elapsed)}`}
    >
      <span className="relative flex h-2 w-2" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
      </span>
      {label}
      <span className="rounded-full bg-white/20 px-1.5 py-0.5 font-mono text-[11px] font-semibold leading-none tabular-nums">
        {fmtTimer(elapsed)}
      </span>
    </Button>
  )
}
