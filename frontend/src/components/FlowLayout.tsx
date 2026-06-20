import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Sidebar } from './Sidebar'
import type { NavItem } from './BottomNav'

const navItems: NavItem[] = [
  { icon: 'ph:house-bold', label: 'Início', to: '/home' },
  { icon: 'ph:calendar-bold', label: 'Agenda', to: '/agenda' },
  { icon: 'ph:sparkle-bold', ynaIcon: 'chat' as const, label: 'Nyna', to: '/nina', variant: 'highlight' },
  { icon: 'ph:first-aid-bold', label: 'Emergência', to: '/emergencia', variant: 'emergency' },
  { icon: 'ph:user-circle-bold', ynaIcon: 'profile' as const, label: 'Perfil', to: '/meus-dados' },
]

export function FlowLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="flex h-dvh overflow-hidden bg-page lg:flex-row">
      <Sidebar items={navItems} />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Mobile back bar — hidden on desktop (sidebar takes its role) */}
        <div className="flex shrink-0 items-center border-b border-border bg-surface px-3 py-2 lg:hidden">
          <button
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            className="flex h-10 items-center gap-1.5 rounded-pill px-3 font-heading text-sm font-medium text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
          >
            <Icon icon="ph:arrow-left-bold" width={16} aria-hidden />
            Voltar
          </button>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div key={location.pathname} className="min-h-full animate-yna-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
