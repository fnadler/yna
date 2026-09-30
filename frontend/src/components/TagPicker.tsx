import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '@iconify/react'

export interface TagOption { id: string; nome: string }

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/** Seletor de múltiplas tags com criação embutida, no mesmo espírito de
   cadastros de tags de outros sistemas: o catálogo (`catalogo`) é um
   recurso à parte, reutilizável por vários "donos" — aqui, dimensões do
   modelo de avaliação (fatores de risco, fontes geradoras). Escolher uma
   opção nova (que ainda não existe) cria o cadastro na hora via
   `onCriar`, sem sair do formulário. */
export function TagPicker({
  catalogo, selecionados, onChange, onCriar, placeholder = 'Buscar ou criar…',
}: {
  catalogo: TagOption[]
  selecionados: string[]
  onChange: (ids: string[]) => void
  onCriar: (nome: string) => Promise<TagOption>
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [criando, setCriando] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    /* `stopPropagation` — sem isso, o Escape também fecha o `Sheet` por
       trás (ele escuta Escape em `window`), quando a intenção era só
       fechar a lista de sugestões. */
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false) } }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [open])

  const tagsSelecionadas = selecionados
    .map((id) => catalogo.find((t) => t.id === id))
    .filter((t): t is TagOption => !!t)

  const filtrado = useMemo(() => {
    const nq = norm(q.trim())
    const disponiveis = catalogo.filter((t) => !selecionados.includes(t.id))
    return nq ? disponiveis.filter((t) => norm(t.nome).includes(nq)) : disponiveis
  }, [catalogo, selecionados, q])

  const existeExato = catalogo.some((t) => norm(t.nome) === norm(q.trim()))

  const adicionar = (id: string) => {
    onChange([...selecionados, id])
    setQ('')
    inputRef.current?.focus()
  }

  const remover = (id: string) => onChange(selecionados.filter((x) => x !== id))

  const criar = async () => {
    const nome = q.trim()
    if (!nome || existeExato) return
    setCriando(true)
    const tag = await onCriar(nome)
    setCriando(false)
    adicionar(tag.id)
  }

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => { setOpen(true); inputRef.current?.focus() }}
        className="flex min-h-[44px] w-full flex-wrap items-center gap-1.5 rounded border-[1.5px] border-border bg-surface px-2.5 py-2 outline-none focus-within:border-primary"
      >
        {tagsSelecionadas.map((t) => (
          <span key={t.id} className="inline-flex items-center gap-1 rounded-pill bg-primary-50 py-1 pl-2.5 pr-1.5 text-[12.5px] font-medium text-primary dark:text-primary-300">
            {t.nome}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); remover(t.id) }}
              aria-label={`Remover ${t.nome}`}
              className="flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-primary/20"
            >
              <Icon icon="ph:x-bold" width={10} aria-hidden />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={tagsSelecionadas.length === 0 ? placeholder : ''}
          className="min-w-[100px] flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
        />
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded border border-border bg-surface shadow-lg">
          <ul role="listbox" className="max-h-52 overflow-y-auto py-1">
            {filtrado.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => adicionar(t.id)}
                  role="option"
                  aria-selected={false}
                  className="flex w-full items-center px-3 py-2 text-left text-[13px] text-ink transition-colors hover:bg-surface-hover"
                >
                  {t.nome}
                </button>
              </li>
            ))}
            {q.trim() && !existeExato && (
              <li>
                <button
                  type="button"
                  onClick={criar}
                  disabled={criando}
                  className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-[13px] font-medium text-primary transition-colors hover:bg-primary-50 disabled:opacity-60 dark:text-primary-300"
                >
                  <Icon icon="ph:plus-bold" width={13} aria-hidden />
                  {criando ? 'Criando…' : `Criar "${q.trim()}"`}
                </button>
              </li>
            )}
            {filtrado.length === 0 && !q.trim() && (
              <li className="px-3 py-4 text-center text-[12.5px] text-ink-muted">Nenhuma outra opção cadastrada.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
