import { Icon } from '@iconify/react'
import type { ReactNode } from 'react'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: string
  iconNode?: ReactNode
  iconTone?: 'primary' | 'success' | 'warning' | 'danger'
  action?: ReactNode
  className?: string
}

const iconToneClasses = {
  primary: 'bg-primary-50 text-primary dark:text-primary-300',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
}

export function PageHeader({
  title,
  subtitle,
  icon,
  iconNode,
  iconTone = 'primary',
  action,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`mb-8 lg:mb-10 ${className}`}>
      {(icon || iconNode) && (
        <div
          className={`mb-3 flex h-12 w-12 items-center justify-center rounded-lg ${iconToneClasses[iconTone]}`}
        >
          {iconNode ?? <Icon icon={icon!} width={24} aria-hidden />}
        </div>
      )}
      <div className={action ? 'flex items-center justify-between gap-4' : undefined}>
        <div>
          <h1 className="text-[26px] lg:text-[32px] font-medium tracking-[-0.02em] text-ink">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-[15px] text-ink-secondary">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  )
}
