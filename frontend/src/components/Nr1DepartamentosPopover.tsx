import { useState } from 'react'
import { Icon } from '@iconify/react'

/** Contagem de departamentos (de um risco ou de uma ação), com um popover
   que mostra a lista completa ao clicar — evita abrir o detalhe só para ver
   quais áreas estão envolvidas. Fica dentro de linhas clicáveis, então o
   clique e o teclado não propagam para a linha. "Toda a empresa" (o "Onde"
   de uma ação que vale para todas as áreas) aparece por extenso no lugar da
   contagem. */
export function Nr1DepartamentosPopover({ nomes, titulo = 'Departamentos afetados' }: {
  nomes: string[]
  titulo?: string
}) {
  const [open, setOpen] = useState(false)
  const todaEmpresa = nomes.length === 1 && nomes[0] === 'Toda a empresa'

  if (nomes.length === 0) return <span className="text-[12px] text-ink-muted">—</span>

  return (
    <div className="relative w-fit" onKeyDown={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        aria-expanded={open}
        aria-label={todaEmpresa
          ? 'Toda a empresa, ver detalhe'
          : `${nomes.length} ${nomes.length === 1 ? 'departamento' : 'departamentos'}, ver lista`}
        className="inline-flex items-center gap-1 whitespace-nowrap rounded-pill bg-surface-2 px-2 py-1 text-[12px] font-medium text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
      >
        <Icon icon="ph:buildings-bold" width={12} className="shrink-0" aria-hidden />
        {todaEmpresa ? 'Toda a empresa' : nomes.length}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setOpen(false) }} />
          <div
            role="menu"
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 top-full z-40 mt-1.5 w-56 rounded-lg border border-border bg-surface p-2 shadow-lg"
          >
            <p className="mb-1 px-2 pt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
              {titulo}
            </p>
            <ul className="flex flex-col gap-0.5">
              {nomes.map((nome, i) => (
                <li key={i} className="rounded px-2 py-1.5 text-[12.5px] text-ink">{nome}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
