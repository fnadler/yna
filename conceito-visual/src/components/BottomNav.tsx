import { Icon } from '@iconify/react'

export interface BottomNavItem {
  icon: string
  label: string
  badge?: number
}

export interface BottomNavProps {
  items: BottomNavItem[]
  activeLabel: string
}

export function BottomNav({ items, activeLabel }: BottomNavProps) {
  return (
    <nav
      aria-label="Navegação principal"
      className="flex shrink-0 items-stretch justify-around border-t border-border bg-surface px-1 pb-4 pt-1"
    >
      {items.map((item) => {
        const active = item.label === activeLabel
        return (
          <button
            key={item.label}
            aria-current={active ? 'page' : undefined}
            className={`relative flex min-h-[52px] min-w-[60px] flex-col items-center justify-center gap-0.5 rounded-sm px-2 transition-colors ${
              active
                ? 'text-primary dark:text-primary-300'
                : 'text-ink-muted hover:text-ink-secondary'
            }`}
          >
            <Icon icon={item.icon} width={22} aria-hidden />
            <span className={`text-[10.5px] ${active ? 'font-semibold' : 'font-medium'}`}>
              {item.label}
            </span>
            {item.badge !== undefined && (
              <span className="absolute right-2 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-danger px-1 text-[10px] font-semibold text-white">
                {item.badge}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
