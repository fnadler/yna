import { useState, type ReactNode } from 'react'
import { Button } from './Button'
import { Sheet } from './Sheet'

/* Bloco de filtros padrão do Manager. No desktop, os campos aparecem inline num
   bloco. No mobile, viram um botão "Filtrar" que abre os mesmos campos num Sheet
   com transição (slide-up). Os `children` (campos) são reaproveitados nos dois
   contextos — passe controles de largura total para funcionarem bem empilhados. */
export function FiltrosBar({ ativos = 0, onLimpar, desktopClassName = '', children }: {
  ativos?: number
  onLimpar?: () => void
  /** Classes extras do container inline no desktop (ex.: "[&>label]:flex-1"). */
  desktopClassName?: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop — bloco de filtros inline */}
      <div className={`hidden items-end gap-2 rounded-lg border border-border bg-surface p-3 lg:flex ${desktopClassName}`}>
        {children}
        {ativos > 0 && onLimpar && (
          <button onClick={onLimpar} className="shrink-0 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-ink-secondary transition-colors hover:text-ink">Limpar</button>
        )}
      </div>

      {/* Mobile — botão que abre os filtros */}
      <div className="flex items-center gap-3 lg:hidden">
        <Button variant="secondary" size="sm" iconLeft="ph:funnel-bold" onClick={() => setOpen(true)}>
          Filtrar{ativos > 0 ? ` (${ativos})` : ''}
        </Button>
        {ativos > 0 && onLimpar && <button onClick={onLimpar} className="text-[12.5px] font-medium text-ink-secondary hover:text-ink">Limpar</button>}
      </div>

      {/* Mobile — Sheet animado com os campos */}
      <Sheet open={open} onClose={() => setOpen(false)} title="Filtros" icon="ph:funnel-bold" size="md">
        <div className="flex flex-col gap-3.5 px-5 py-6">
          {children}
          <div className="mt-1 flex gap-2">
            {onLimpar && <Button variant="ghost" fullWidth onClick={onLimpar}>Limpar</Button>}
            <Button fullWidth onClick={() => setOpen(false)}>Aplicar</Button>
          </div>
        </div>
      </Sheet>
    </>
  )
}
