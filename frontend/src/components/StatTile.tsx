import { Icon } from '@iconify/react'
import type { ReactNode } from 'react'

export interface StatTileProps {
  icon: string
  iconNode?: ReactNode
  value: string
  label: string
  layout?: 'vertical' | 'horizontal'
  className?: string
}

export function StatTile({
  icon,
  iconNode,
  value,
  label,
  layout = 'vertical',
  className = '',
}: StatTileProps) {
  const iconEl = iconNode ?? <Icon icon={icon} width={20} className="text-primary dark:text-primary-300" aria-hidden />

  if (layout === 'horizontal') {
    return (
      <div
        className={`flex items-center gap-4 rounded-lg border border-border bg-surface px-4 py-3 ${className}`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50">
          {iconEl}
        </div>
        <div>
          <p className="text-xl font-bold text-ink">{value}</p>
          <p className="text-xs text-ink-secondary">{label}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-lg border border-border bg-surface p-4 text-center ${className}`}
    >
      {iconEl}
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="text-xs text-ink-secondary">{label}</p>
    </div>
  )
}
