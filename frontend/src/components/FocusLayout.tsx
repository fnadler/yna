import { Outlet, useNavigate } from 'react-router-dom'
import { LogoYna } from './YnaLogo'

interface Props {
  bgClass?: string
}

export function FocusLayout({ bgClass = 'bg-page' }: Props) {
  const navigate = useNavigate()

  return (
    <div className={`min-h-dvh ${bgClass}`}>
      {/* Desktop-only sticky top bar */}
      <header className="hidden lg:flex sticky top-0 z-20 h-16 shrink-0 items-center justify-between border-b border-border bg-surface/80 px-10 backdrop-blur-sm">
        <LogoYna className="h-7 text-primary dark:text-lavender" />
        <button
          onClick={() => navigate('/bem-vindo')}
          className="font-heading text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
        >
          Sair
        </button>
      </header>

      <div className="mx-auto w-full max-w-xl lg:max-w-[960px]">
        <Outlet />
      </div>
    </div>
  )
}
