import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

export interface OptionCardProps {
  icon: string
  label: string
  desc?: string
  variant?: 'default' | 'danger' | 'warning' | 'success'
  layout?: 'horizontal' | 'shortcut'
  showArrow?: boolean
  href?: string
  to?: string
  onClick?: () => void
  className?: string
}

const variantStyles = {
  default: {
    card: 'border-border bg-surface hover:border-border-strong hover:bg-surface-hover',
    iconBg: 'bg-primary-50',
    iconColor: 'text-primary dark:text-primary-300',
    label: 'text-ink',
  },
  danger: {
    card: 'border-danger/30 bg-danger-bg hover:border-danger',
    iconBg: 'bg-danger/10',
    iconColor: 'text-danger-ink',
    label: 'text-danger-ink',
  },
  warning: {
    card: 'border-warning/30 bg-warning-bg hover:border-warning',
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    label: 'text-ink',
  },
  success: {
    card: 'border-success/30 bg-success-bg hover:border-success',
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    label: 'text-ink',
  },
}

function Inner({
  icon,
  label,
  desc,
  variant = 'default',
  layout = 'horizontal',
  showArrow = false,
}: Omit<OptionCardProps, 'href' | 'to' | 'onClick' | 'className'>) {
  const styles = variantStyles[variant]
  const isShortcut = layout === 'shortcut'

  return (
    <>
      <div
        className={`flex shrink-0 items-center justify-center rounded-sm ${styles.iconBg} ${
          isShortcut ? 'h-10 w-10' : 'h-12 w-12'
        }`}
      >
        <Icon
          icon={icon}
          width={isShortcut ? 20 : 24}
          className={styles.iconColor}
          aria-hidden
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`font-heading font-semibold leading-snug ${isShortcut ? 'text-sm' : ''} ${styles.label}`}>{label}</p>
        {desc && <p className={`mt-0.5 text-ink-secondary ${isShortcut ? 'text-[13px]' : 'text-sm'}`}>{desc}</p>}
      </div>
      {showArrow && (
        <Icon
          icon="ph:caret-right-bold"
          width={16}
          className="ml-auto shrink-0 text-ink-muted"
          aria-hidden
        />
      )}
    </>
  )
}

function resolveClass(
  variant: OptionCardProps['variant'] = 'default',
  layout: OptionCardProps['layout'] = 'horizontal',
  extraClass = ''
) {
  const styles = variantStyles[variant]
  const isShortcut = layout === 'shortcut'

  if (isShortcut) {
    return `flex items-center gap-4 rounded-lg border-[1.5px] px-4 py-4 text-left transition-all hover:-translate-y-px hover:shadow-sm sm:flex-col sm:items-start sm:gap-3 sm:px-5 sm:py-5 ${styles.card} ${extraClass}`
  }

  return `flex min-h-[80px] items-center gap-4 rounded-lg border-[1.5px] px-4 text-left transition-all ${styles.card} ${extraClass}`
}

export function OptionCard({
  href,
  to,
  onClick,
  variant = 'default',
  layout = 'horizontal',
  showArrow,
  className = '',
  ...innerProps
}: OptionCardProps): ReactNode {
  const resolvedArrow = showArrow ?? layout === 'horizontal'
  const cls = resolveClass(variant, layout, className)

  if (href) {
    return (
      <a href={href} className={cls}>
        <Inner {...innerProps} variant={variant} layout={layout} showArrow={resolvedArrow} />
      </a>
    )
  }

  if (to) {
    return (
      <Link to={to} className={cls}>
        <Inner {...innerProps} variant={variant} layout={layout} showArrow={resolvedArrow} />
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={cls}>
      <Inner {...innerProps} variant={variant} layout={layout} showArrow={resolvedArrow} />
    </button>
  )
}
