import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'
import { EmergencyModal } from './EmergencyModal'
import type { NavItem } from './BottomNav'

const navItems: NavItem[] = [
  { icon: 'ph:house-bold', label: 'Início', to: '/home' },
  { icon: 'ph:calendar-bold', label: 'Agenda', to: '/agenda' },
  { icon: 'ph:sparkle-bold', ynaIcon: 'chat' as const, label: 'Nyna', to: '/nina', variant: 'highlight' },
  { icon: 'ph:first-aid-bold', label: 'Emergência', to: '/emergencia', variant: 'emergency' },
  { icon: 'ph:user-circle-bold', ynaIcon: 'profile' as const, label: 'Perfil', to: '/meus-dados' },
]

export function AppLayout() {
  const [emergencyOpen, setEmergencyOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="flex h-dvh overflow-hidden bg-page lg:flex-row">
      <Sidebar items={navItems} onEmergencyClick={() => setEmergencyOpen(true)} />
      <EmergencyModal open={emergencyOpen} onClose={() => setEmergencyOpen(false)} />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {/* Subtle per-route load animation, consistent with the onboarding screens.
              Keyed by pathname so it replays on each navigation. Uses animate-yna-enter
              (no `forwards`) so no persistent transform breaks fixed children. */}
          <div key={location.pathname} className="min-h-full animate-yna-enter">
            <Outlet />
          </div>
        </main>
        <BottomNav items={navItems} />
      </div>
    </div>
  )
}
