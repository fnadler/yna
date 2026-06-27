import { useEffect, useRef, useState } from 'react'
import { Icon } from '@iconify/react'

export interface SelectOption {
  value: string
  label: string
}

/* Select customizado no padrão dos menus da plataforma (trigger + dropdown
   com role=listbox). Fecha ao clicar fora, no Escape ou ao escolher. */
export function Select({
  value,
  options,
  onChange,
  id,
  ariaLabel,
  className = '',
}: {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  id?: string
  ariaLabel?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:bg-surface-hover focus:border-primary focus:outline-none"
      >
        <span className="truncate">{selected?.label ?? 'Selecionar…'}</span>
        <Icon
          icon="ph:caret-down-bold"
          width={14}
          className={`shrink-0 text-ink-secondary transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" aria-hidden onClick={() => setOpen(false)} />
          <ul
            role="listbox"
            aria-label={ariaLabel}
            className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-72 overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-lg"
          >
            {options.map((o) => {
              const isSel = o.value === value
              return (
                <li key={o.value} role="option" aria-selected={isSel}>
                  <button
                    type="button"
                    onClick={() => { onChange(o.value); setOpen(false) }}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-hover ${
                      isSel ? 'font-semibold text-primary dark:text-primary-300' : 'text-ink'
                    }`}
                  >
                    <span className="min-w-0 flex-1">{o.label}</span>
                    {isSel && <Icon icon="ph:check-bold" width={14} className="shrink-0" aria-hidden />}
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
