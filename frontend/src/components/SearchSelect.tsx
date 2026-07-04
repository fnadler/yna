import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '@iconify/react'

export interface SearchSelectOption { value: string; label: string }

/* Select com busca (combobox) — padrão "Custom Select" do design system:
   trigger = .input + caret · painel flutuante (shadow-lg) · busca no topo ·
   item ativo em primary-50 + check. Ordene as opções no chamador. */
const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export function SearchSelect({
  value, onChange, options, placeholder = 'Selecionar', searchPlaceholder = 'Buscar…', className = '',
}: {
  value: string
  onChange: (v: string) => void
  options: SearchSelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    const t = setTimeout(() => searchRef.current?.focus(), 0)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); clearTimeout(t) }
  }, [open])

  const filtered = useMemo(() => {
    const nq = norm(q.trim())
    return nq ? options.filter((o) => norm(o.label).includes(nq)) : options
  }, [options, q])

  const pick = (v: string) => { onChange(v); setOpen(false); setQ('') }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded border-[1.5px] border-border bg-surface px-2.5 py-1.5 text-[13px] outline-none transition-colors hover:border-border-strong focus:border-primary"
      >
        <span className={`truncate ${selected ? 'text-ink' : 'text-ink-muted'}`}>{selected ? selected.label : placeholder}</span>
        <Icon icon="ph:caret-down-bold" width={13} className="shrink-0 text-ink-muted" aria-hidden />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded border border-border bg-surface shadow-lg">
          <div className="border-b border-border p-1.5">
            <div className="flex items-center gap-1.5 rounded bg-surface-2 px-2 py-1.5">
              <Icon icon="ph:magnifying-glass-bold" width={14} className="shrink-0 text-ink-muted" aria-hidden />
              <input
                ref={searchRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-muted"
              />
            </div>
          </div>
          <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
            {filtered.length > 0 ? filtered.map((o) => {
              const on = o.value === value
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    onClick={() => pick(o.value)}
                    role="option"
                    aria-selected={on}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] transition-colors ${on ? 'bg-primary-50 text-primary dark:text-primary-300' : 'text-ink hover:bg-surface-hover'}`}
                  >
                    <span className="truncate">{o.label}</span>
                    {on && <Icon icon="ph:check-bold" width={14} className="shrink-0" aria-hidden />}
                  </button>
                </li>
              )
            }) : <li className="px-3 py-4 text-center text-[12.5px] text-ink-muted">Nada encontrado.</li>}
          </ul>
        </div>
      )}
    </div>
  )
}
