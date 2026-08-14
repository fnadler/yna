import type { ReactNode } from 'react'

/* Painel delimitado (título + ação + corpo) — mesmo padrão da antiga
   Academia YNA (Pro/universidadeParts.Painel), reaproveitado em Apoio. */
export function Painel({
  title,
  action,
  children,
  className = '',
}: {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`min-w-0 rounded-lg border border-border bg-surface p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

/* Link "Ver todos" reutilizável. */
export function VerTodos({ label = 'Ver todos', onClick }: { label?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="font-heading text-xs font-semibold text-primary dark:text-primary-300 hover:underline">
      {label}
    </button>
  )
}
