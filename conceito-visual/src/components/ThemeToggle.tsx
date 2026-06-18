import { Icon } from '@iconify/react'

export interface ThemeToggleProps {
  dark: boolean
  onToggle: () => void
}

export function ThemeToggle({ dark, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={dark}
      aria-label={dark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      className="inline-flex min-h-[44px] items-center gap-2 rounded-pill border-[1.5px] border-border bg-surface px-4 text-sm font-semibold text-ink-secondary shadow-xs transition-colors hover:border-border-strong hover:text-ink"
    >
      <Icon icon={dark ? 'ph:sun-bold' : 'ph:moon-stars-bold'} width={17} aria-hidden />
      {dark ? 'Light mode' : 'Dark mode'}
    </button>
  )
}
