import { NavLink, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Avatar } from './Avatar'
import { LogoYna } from './YnaLogo'
import { ViewAsSwitcher } from './ViewAsSwitcher'
import type { NavItem } from './BottomNav'
import { useRh } from '../contexts/RhContext'
import { useTheme } from '../contexts/ThemeContext'

/* Sidebar do RH / Empresa (desktop). Mesmo padrão visual do Sidebar do
   beneficiário e do profissional, com contexto, rotas e itens próprios.
   Sem botão de pânico — o RH não tem fluxo de emergência. */
export function RhSidebar({ items }: { items: NavItem[] }) {
  const { empresa, usuario, unreadNotifs } = useRh()
  const { dark, toggle: toggleTheme } = useTheme()
  const navigate = useNavigate()

  const papelLabel = usuario.papel === 'master' ? 'Admin RH · Master' : 'Operador'

  return (
    <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-border lg:bg-surface">
      <div className="flex items-center justify-between px-6 py-5">
        <LogoYna className="h-7 text-primary dark:text-lavender" />
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            aria-pressed={dark}
            aria-label={dark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            className="flex h-9 w-9 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover"
          >
            <Icon icon={dark ? 'ph:sun-bold' : 'ph:moon-stars-bold'} width={18} aria-hidden />
          </button>
          <button
            onClick={() => navigate('/rh/conta')}
            aria-label={`Notificações${unreadNotifs > 0 ? `: ${unreadNotifs} não lidas` : ''}`}
            className="relative flex h-9 w-9 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover"
          >
            <Icon icon={unreadNotifs > 0 ? 'ph:bell-ringing-bold' : 'ph:bell-bold'} width={18} aria-hidden />
            {unreadNotifs > 0 && (
              <span
                aria-hidden
                className="absolute -right-1 -top-1 flex h-[16px] min-w-[16px] items-center justify-center rounded-pill bg-danger px-1 text-[10px] font-bold text-white ring-2 ring-surface"
              >
                {unreadNotifs}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Bloco da empresa + usuário logado */}
      <div className="border-b border-border px-4 pb-5 pt-1">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full ring-2 ring-border">
            <Avatar initials={usuario.initials} size={52} palette={usuario.palette} />
          </div>
          <p className="mt-3 text-[15px] font-semibold leading-tight text-ink">{usuario.nome}</p>
          <p className="mt-0.5 text-xs text-ink-secondary">{papelLabel}</p>
          <div className="mt-3 flex w-full items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2">
            <Icon icon="ph:buildings-bold" width={16} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
            <span className="min-w-0 truncate text-left text-xs font-medium text-ink">{empresa.nomeFantasia}</span>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 pt-2" aria-label="Navegação principal">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/rh/home'}
            className={({ isActive }) =>
              `relative flex min-h-[44px] items-center gap-3 rounded-sm px-3 py-2.5 font-heading text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary dark:text-primary-300 dark:bg-primary-50'
                  : 'text-ink-secondary hover:bg-surface-hover hover:text-ink'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon icon={item.icon} width={20} aria-hidden />
                {item.label}
                {isActive && <span className="absolute inset-y-0 left-0 w-0.5 rounded-r-pill bg-primary" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col gap-2 border-t border-border px-4 py-4">
        <ViewAsSwitcher current="admin" className="mb-1" />
        <NavLink
          to="/rh/conta"
          className={({ isActive }) =>
            `flex w-full items-center justify-center gap-2 rounded-lg border px-2 py-2 font-heading text-xs font-semibold transition-colors ${
              isActive
                ? 'border-border bg-surface-hover text-ink'
                : 'border-border bg-surface text-ink-secondary hover:bg-surface-hover hover:text-ink'
            }`
          }
        >
          <Icon icon="ph:gear-bold" width={14} aria-hidden />
          Conta da empresa
        </NavLink>
        <button
          onClick={() => navigate('/rh/convite/demo')}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-2 py-2 font-heading text-xs font-semibold text-ink-secondary transition-colors hover:border-danger/30 hover:bg-danger-bg hover:text-danger"
        >
          <Icon icon="ph:sign-out-bold" width={14} aria-hidden />
          Sair da conta
        </button>
      </div>
    </aside>
  )
}
