import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '@iconify/react'

export interface MultiSelectOption { value: string; label: string }

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/* Droplist de múltipla escolha — mesmo trigger do `SearchSelect`/campos de
   formulário (borda 1,5px, painel flutuante shadow-lg), com os itens
   escolhidos como pílulas no próprio campo. Com `searchable`, o painel ganha
   a mesma busca no topo do `SearchSelect` (ignora acentos e caixa). */
export function MultiSelect({ values, onChange, options, placeholder = 'Selecionar', ariaLabel, disabled = false, searchable = false, searchPlaceholder = 'Buscar…' }: {
  values: string[]
  onChange: (v: string[]) => void
  options: MultiSelectOption[]
  placeholder?: string
  ariaLabel?: string
  disabled?: boolean
  searchable?: boolean
  searchPlaceholder?: string
}) {
  const [aberto, setAberto] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (disabled) setAberto(false) }, [disabled])

  useEffect(() => {
    if (!aberto) return
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false) }
    /* `stopPropagation` — sem isso o Escape também fecharia o painel/modal em volta. */
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setAberto(false) } }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    const t = searchable ? setTimeout(() => searchRef.current?.focus(), 0) : undefined
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); clearTimeout(t); setQ('') }
  }, [aberto, searchable])

  const filtradas = useMemo(() => {
    const nq = norm(q.trim())
    return nq ? options.filter((o) => norm(o.label).includes(nq)) : options
  }, [options, q])

  const toggle = (v: string) => onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v])
  const selecionados = options.filter((o) => values.includes(o.value))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-label={ariaLabel}
        className={`flex min-h-[44px] w-full items-center gap-2 rounded border-[1.5px] bg-surface px-2.5 py-1.5 text-left outline-none transition-colors hover:border-border-strong disabled:cursor-not-allowed disabled:bg-surface-2 disabled:hover:border-border ${aberto ? 'border-primary' : 'border-border'}`}
      >
        <span className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {selecionados.length === 0 && <span className="px-1 text-sm text-ink-muted">{placeholder}</span>}
          {selecionados.map((o) => (
            <span key={o.value} className="inline-flex items-center gap-1 rounded-pill bg-primary-50 py-0.5 pl-2.5 pr-1.5 text-[12.5px] font-medium text-primary dark:text-primary-300">
              {o.label}
              <span
                role="button"
                tabIndex={-1}
                aria-label={`Remover ${o.label}`}
                onClick={(e) => { e.stopPropagation(); toggle(o.value) }}
                className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary/20"
              >
                <Icon icon="ph:x-bold" width={10} aria-hidden />
              </span>
            </span>
          ))}
        </span>
        <Icon icon="ph:caret-down-bold" width={13} className={`shrink-0 text-ink-muted transition-transform ${aberto ? 'rotate-180' : ''}`} aria-hidden />
      </button>

      {aberto && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded border border-border bg-surface shadow-lg">
          {searchable && (
            <div className="border-b border-border p-1.5">
              <div className="flex items-center gap-1.5 rounded bg-surface-2 px-2 py-1.5">
                <Icon icon="ph:magnifying-glass-bold" width={14} className="shrink-0 text-ink-muted" aria-hidden />
                <input
                  ref={searchRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-muted"
                />
              </div>
            </div>
          )}
          <ul role="listbox" aria-multiselectable className="max-h-60 overflow-y-auto py-1">
            {filtradas.length === 0 && <li className="px-3 py-4 text-center text-[12.5px] text-ink-muted">Nada encontrado.</li>}
            {filtradas.map((o) => {
              const on = values.includes(o.value)
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={on}
                    onClick={() => toggle(o.value)}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors ${on ? 'bg-primary-50 text-ink' : 'text-ink hover:bg-surface-hover'}`}
                  >
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-xs border-[1.5px] ${on ? 'border-primary bg-primary text-white' : 'border-border-strong'}`}>
                      {on && <Icon icon="ph:check-bold" width={10} aria-hidden />}
                    </span>
                    {o.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
