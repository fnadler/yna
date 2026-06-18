import { Icon } from '@iconify/react'
import type { ReactNode } from 'react'

interface TopBarIconButtonProps {
  icon: string
  label: string
  onClick?: () => void
  badge?: number
  pressed?: boolean
  expanded?: boolean
  children?: ReactNode
}

export function TopBarIconButton({
  icon,
  label,
  onClick,
  badge,
  pressed,
  expanded,
  children,
}: TopBarIconButtonProps) {
  return (
    <div className="group relative">
      <button
        onClick={onClick}
        aria-label={label}
        aria-pressed={pressed}
        aria-expanded={expanded}
        className="relative flex h-11 w-11 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover"
      >
        <Icon icon={icon} width={20} aria-hidden />
        {badge !== undefined && badge > 0 && (
          <span
            aria-hidden
            className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-danger px-1 text-[10px] font-bold text-white ring-2 ring-surface"
          >
            {badge}
          </span>
        )}
      </button>

      {/* Dropdown panel slot (e.g. notification list) */}
      {children}

      {/* Tooltip — DS pattern: dark bg, arrow pointing up, fade on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] z-50 -translate-x-1/2 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
      >
        <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#1F1B2D] dark:bg-[#F2EFF8]" />
        <p className="relative whitespace-nowrap rounded-[10px] bg-[#1F1B2D] px-2.5 py-1.5 text-[12px] font-medium leading-none text-[#F2EFF8] shadow-sm dark:bg-[#F2EFF8] dark:text-[#1F1B2D]">
          {label}
        </p>
      </div>
    </div>
  )
}
