import type { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'sunken'
  padding?: 'md' | 'lg' | 'none'
  children: ReactNode
}

const variantClasses = {
  default: 'bg-surface border border-border',
  gradient: 'bg-yna-gradient border-0 text-[#1F1B2D]',
  sunken: 'bg-surface-2 border border-border',
}

const paddingClasses = { md: 'p-4', lg: 'p-5', none: 'p-0 overflow-hidden' }

export function Card({
  variant = 'default',
  padding = 'lg',
  className = '',
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-lg ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardEyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted ${className}`}
    >
      {children}
    </span>
  )
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={`text-lg font-semibold tracking-[-0.01em] text-ink ${className}`}>{children}</h3>
  )
}
