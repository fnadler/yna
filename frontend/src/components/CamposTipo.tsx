import { Icon } from '@iconify/react'
import type { MngCampoCadastro } from '../types'

/* Renderiza os campos do cadastro definidos por um tipo de profissional
   (formulário flexível). Editor + visualização + validação, compartilhados
   pelo cadastro do profissional, pela ativação e pela avaliação no Manager. */

const inputCls = 'w-full rounded border-[1.5px] border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary'
const asArray = (v: string | string[] | undefined): string[] => (Array.isArray(v) ? v : v ? [v] : [])
const asStr = (v: string | string[] | undefined): string => (Array.isArray(v) ? v.join(', ') : v ?? '')

type Perfil = Record<string, string | string[]>

export function perfilValido(campos: MngCampoCadastro[], perfil: Perfil): boolean {
  return campos.every((c) => {
    if (!c.obrigatorio) return true
    const v = perfil[c.id]
    return Array.isArray(v) ? v.length > 0 : Boolean((v ?? '').toString().trim())
  })
}

export function CamposTipoEditor({ campos, perfil, onChange }: { campos: MngCampoCadastro[]; perfil: Perfil; onChange: (id: string, v: string | string[]) => void }) {
  return (
    <div className="flex flex-col gap-4">
      {campos.map((c) => (
        <label key={c.id} className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink">{c.label}{!c.obrigatorio && <span className="font-normal text-ink-muted"> (opcional)</span>}</span>
          {c.tipo === 'text' && <input className={inputCls} value={asStr(perfil[c.id])} onChange={(e) => onChange(c.id, e.target.value)} placeholder={c.ajuda} />}
          {c.tipo === 'number' && <input type="number" className={inputCls} value={asStr(perfil[c.id])} onChange={(e) => onChange(c.id, e.target.value)} placeholder={c.ajuda} />}
          {c.tipo === 'date' && <input type="date" className={inputCls} value={asStr(perfil[c.id])} onChange={(e) => onChange(c.id, e.target.value)} />}
          {c.tipo === 'textarea' && <textarea className={inputCls} rows={3} value={asStr(perfil[c.id])} onChange={(e) => onChange(c.id, e.target.value)} placeholder={c.ajuda} />}
          {c.tipo === 'select' && (
            <div className="relative">
              <select className={`${inputCls} appearance-none pr-9`} value={asStr(perfil[c.id])} onChange={(e) => onChange(c.id, e.target.value)}>
                <option value="">Selecionar…</option>
                {(c.opcoes ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <Icon icon="ph:caret-down-bold" width={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden />
            </div>
          )}
          {c.tipo === 'multiselect' && (
            <div className="flex flex-wrap gap-1.5">
              {(c.opcoes ?? []).map((o) => {
                const sel = asArray(perfil[c.id])
                const on = sel.includes(o)
                return (
                  <button key={o} type="button" onClick={() => onChange(c.id, on ? sel.filter((x) => x !== o) : [...sel, o])}
                    className={`rounded-pill border-[1.5px] px-3 py-1 font-heading text-[12.5px] font-medium transition-colors ${on ? 'border-primary bg-primary-50 text-primary dark:text-primary-300' : 'border-border bg-surface text-ink-secondary hover:border-border-strong hover:text-ink'}`}>{o}</button>
                )
              })}
            </div>
          )}
        </label>
      ))}
    </div>
  )
}

export function CamposTipoView({ campos, perfil }: { campos: MngCampoCadastro[]; perfil: Perfil }) {
  return (
    <div className="flex flex-col gap-3">
      {campos.map((c) => {
        const v = perfil[c.id]
        const chips = c.tipo === 'multiselect' || c.tipo === 'select'
        const arr = asArray(v)
        return (
          <div key={c.id}>
            <p className="mb-1 text-[11px] uppercase tracking-wide text-ink-muted">{c.label}</p>
            {chips
              ? (arr.length ? <div className="flex flex-wrap gap-1.5">{arr.map((x) => <span key={x} className="rounded-pill bg-surface-2 px-2.5 py-0.5 text-[11.5px] text-ink-secondary">{x}</span>)}</div> : <p className="text-[13px] text-ink-muted">—</p>)
              : <p className="text-[13px] leading-relaxed text-ink">{asStr(v) || '—'}</p>}
          </div>
        )
      })}
    </div>
  )
}
