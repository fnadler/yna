import { Icon } from '@iconify/react'
import { LogoYna } from './YnaLogo'
import { useTheme } from '../contexts/ThemeContext'

interface MobileTopBarProps {
  unread?: number
  onBellClick?: () => void
}

export function MobileTopBar({ unread = 0, onBellClick }: MobileTopBarProps) {
  const { dark, toggle: toggleTheme } = useTheme()

  return (
    <div className="flex items-center justify-between pt-5 pb-3 lg:hidden">
      <LogoYna className="h-6 text-primary dark:text-lavender" />
      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          aria-pressed={dark}
          aria-label={dark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          className="flex h-11 w-11 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover"
        >
          <Icon icon={dark ? 'ph:sun-bold' : 'ph:moon-stars-bold'} width={20} aria-hidden />
        </button>
        <button
          onClick={onBellClick}
          aria-label={`Notificações${unread > 0 ? `: ${unread} não lidas` : ''}`}
          className="relative flex h-11 w-11 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover"
        >
          <Icon icon={unread > 0 ? 'ph:bell-ringing-bold' : 'ph:bell-bold'} width={20} aria-hidden />
          {unread > 0 && (
            <span
              aria-hidden
              className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-danger px-1 text-[10px] font-bold text-white ring-2 ring-surface"
            >
              {unread}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
