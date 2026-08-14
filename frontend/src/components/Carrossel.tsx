import { useEffect, useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import { VerTodos } from './Painel'

function ArrowBtn({ icon, onClick, label, disabled }: { icon: string; onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink disabled:opacity-40 disabled:hover:bg-surface"
    >
      <Icon icon={icon} width={15} aria-hidden />
    </button>
  )
}

/* Painel com carrossel paginado em uma linha — calcula quantos cards cabem e
   pagina com as setas do cabeçalho. Mesmo padrão da antiga Academia YNA
   (Pro/universidadeParts.CursoCarrossel), genérico para qualquer item. */
export function Carrossel<T>({
  title,
  verTodos,
  items,
  renderItem,
  keyOf,
}: {
  title: string
  verTodos?: () => void
  items: T[]
  renderItem: (item: T) => React.ReactNode
  keyOf: (item: T) => string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [perPage, setPerPage] = useState(3)
  const [page, setPage] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const compute = () => setPerPage(Math.max(1, Math.floor((el.clientWidth + 16) / 216)))
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const totalPages = Math.max(1, Math.ceil(items.length / perPage))
  const pageSafe = Math.min(page, totalPages - 1)
  const slice = items.slice(pageSafe * perPage, pageSafe * perPage + perPage)

  return (
    <section className="min-w-0 rounded-lg border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        <div className="flex items-center gap-2">
          {verTodos && <VerTodos onClick={verTodos} />}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <ArrowBtn icon="ph:caret-left-bold" label="Anterior" disabled={pageSafe === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} />
              <ArrowBtn icon="ph:caret-right-bold" label="Próximo" disabled={pageSafe >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} />
            </div>
          )}
        </div>
      </div>
      <div ref={ref} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${perPage}, minmax(0, 1fr))` }}>
        {slice.map((item) => (
          <div key={keyOf(item)}>{renderItem(item)}</div>
        ))}
      </div>
    </section>
  )
}
