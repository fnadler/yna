import type { ReactNode } from 'react'
import { Icon } from '@iconify/react'

export interface BadgeProps {
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'solid'
  icon?: string
  children: ReactNode
  className?: string
}

const toneClasses = {
  primary: 'bg-primary-50 text-primary dark:text-primary-300',
  success: 'bg-success-bg text-success-ink',
  warning: 'bg-warning-bg text-warning-ink',
  danger: 'bg-danger-bg text-danger-ink',
  neutral: 'bg-surface-2 text-ink-secondary',
  solid: 'bg-primary text-white',
}

export function Badge({ tone = 'primary', icon, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 font-heading text-xs font-medium leading-[1.4] ${toneClasses[tone]} ${className}`}
    >
      {icon && <Icon icon={icon} width={13} aria-hidden />}
      {children}
    </span>
  )
}
