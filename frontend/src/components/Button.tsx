import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon } from '@iconify/react'

type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger' | 'link' | 'gradient'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  iconLeft?: string
  iconRight?: string
  fullWidth?: boolean
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-600 hover:-translate-y-px hover:shadow-sm active:translate-y-0',
  secondary:
    'bg-surface text-primary border-[1.5px] border-primary-200 hover:bg-primary-50 hover:border-primary dark:text-primary-300 dark:border-border-strong',
  soft: 'bg-primary-50 text-primary hover:bg-primary-100 dark:text-primary-300',
  ghost: 'bg-transparent text-ink-secondary hover:bg-surface-hover hover:text-ink',
  danger: 'bg-danger text-white hover:bg-[#C24A5E]',
  link: 'bg-transparent text-primary dark:text-primary-300 px-0 hover:underline underline-offset-4',
  gradient:
    'bg-yna-gradient-button text-white bg-[length:200%_100%] hover:bg-[position:100%_0] transition-[background-position] duration-[600ms] ease-organic hover:shadow-sm',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-[44px] px-4 text-[13px] gap-1.5',
  md: 'min-h-[44px] px-[22px] text-sm gap-2',
  lg: 'min-h-[52px] px-7 text-base gap-2',
}

const iconSizes: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 18 }

export function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-pill font-heading font-semibold leading-none tracking-[-0.005em] transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {iconLeft && <Icon icon={iconLeft} width={iconSizes[size]} aria-hidden />}
      {children}
      {iconRight && <Icon icon={iconRight} width={iconSizes[size]} aria-hidden />}
    </button>
  )
}
