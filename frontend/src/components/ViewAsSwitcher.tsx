import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'

/* Seletor "Visualizando como" — alterna entre as visões de Administrador (RH)
   e Beneficiário. Ao escolher Beneficiário, direciona para o fluxo do
   beneficiário (área logada). Usado na nav do RH (sidebar desktop + "Mais"). */

type Visao = 'admin' | 'beneficiario'

interface Opcao {
  id: Visao
  label: string
  desc: string
  icon: string
  to: string | null
}

const OPCOES: Opcao[] = [
  { id: 'admin', label: 'Administrador', desc: 'Painel do RH', icon: 'ph:buildings-bold', to: null },
  { id: 'beneficiario', label: 'Beneficiário', desc: 'Jornada de cuidado', icon: 'ph:user-bold', to: '/home' },
]

export function ViewAsSwitcher({
  current = 'admin',
  direction = 'up',
  className = '',
}: {
  current?: Visao
  direction?: 'up' | 'down'
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const atual = OPCOES.find((o) => o.id === current) ?? OPCOES[0]

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onClick)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousedown', onClick) }
  }, [open])

  const escolher = (o: Opcao) => {
    setOpen(false)
    if (o.to) navigate(o.to)
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Alternar visualização"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-left transition-colors hover:bg-surface-hover"
      >
        <Icon icon="ph:eye-bold" width={16} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-mono text-[9.5px] font-medium uppercase tracking-[0.12em] text-ink-muted">Visualizando como</span>
          <span className="truncate text-[13px] font-semibold text-ink">{atual.label}</span>
        </span>
        <Icon icon="ph:caret-up-down-bold" width={14} className="shrink-0 text-ink-secondary" aria-hidden />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Visualização"
          className={`absolute left-0 right-0 z-40 overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-lg ${
            direction === 'up' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
        >
          {OPCOES.map((o) => {
            const isSel = o.id === atual.id
            return (
              <li key={o.id} role="option" aria-selected={isSel}>
                <button
                  type="button"
                  onClick={() => escolher(o)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-hover"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
                    <Icon icon={o.icon} width={16} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-[13px] ${isSel ? 'font-semibold text-primary dark:text-primary-300' : 'font-medium text-ink'}`}>{o.label}</span>
                    <span className="block truncate text-[11px] text-ink-secondary">{o.desc}</span>
                  </span>
                  {isSel && <Icon icon="ph:check-bold" width={14} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
