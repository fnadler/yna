import { Icon } from '@iconify/react'
import { NavLink } from 'react-router-dom'
import { YnaIcon } from './YnaIcons'
import type { YnaIconName } from './YnaIcons'

export interface NavItem {
  icon: string
  ynaIcon?: YnaIconName
  label: string
  to: string
  badge?: number
  variant?: 'emergency' | 'highlight'
}

export function BottomNav({ items }: { items: NavItem[] }) {
  return (
    <nav
      aria-label="Navegação principal"
      className="relative flex shrink-0 items-end justify-around overflow-visible border-t border-border bg-surface px-1 pb-4 pt-1 lg:hidden"
    >
      {items.map((item) => {
        if (item.variant === 'highlight') {
          return (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.label}
              className="mb-1 flex flex-col items-center gap-1.5 px-2 text-ink-secondary hover:text-ink"
            >
              <div className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-surface bg-primary text-white shadow-lg shadow-primary/25 transition-transform active:scale-95">
                {item.ynaIcon
                  ? <YnaIcon name={item.ynaIcon} size={28} />
                  : <Icon icon={item.icon} width={26} aria-hidden />
                }
              </div>
              <span className="font-heading text-[10.5px] font-semibold">{item.label}</span>
            </NavLink>
          )
        }

        if (item.variant === 'emergency') {
          return (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label="Emergência: preciso de ajuda agora"
              className={({ isActive }) =>
                `relative flex min-h-[52px] min-w-[60px] flex-col items-center justify-center gap-0.5 rounded-sm px-2 text-danger transition-colors ${
                  isActive ? 'text-danger' : 'hover:text-danger'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon icon="ph:first-aid-bold" width={22} aria-hidden />
                  <span className={`font-heading text-[10.5px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          )
        }

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/home'}
            className={({ isActive }) =>
              `relative flex min-h-[52px] min-w-[60px] flex-col items-center justify-center gap-0.5 rounded-sm px-2 transition-colors ${
                isActive
                  ? 'text-primary dark:text-primary-300'
                  : 'text-ink-secondary hover:text-ink'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {item.ynaIcon
                  ? <YnaIcon name={item.ynaIcon} size={26} />
                  : <Icon icon={item.icon} width={22} aria-hidden />
                }
                <span className={`font-heading text-[10.5px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
                {item.badge !== undefined && (
                  <span className="absolute right-2 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-danger px-1 text-[10px] font-semibold text-white">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
