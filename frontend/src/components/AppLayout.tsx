import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'
import { NotificationsPanel, INITIAL_NOTIFS, type Notif } from './NotificationsPanel'
import { useTheme } from '../contexts/ThemeContext'
import type { NavItem } from './BottomNav'

const navItems: NavItem[] = [
  { icon: 'ph:house-bold', label: 'Meu espaço', to: '/meu-espaco' },
  { icon: 'ph:chat-teardrop-dots-bold', label: 'Avaliação', to: '/avaliacao' },
  { icon: 'ph:hand-heart-bold', label: 'Apoio', to: '/apoio' },
  { icon: 'ph:user-circle-bold', ynaIcon: 'profile' as const, label: 'Perfil', to: '/meus-dados' },
]

/* Contexto exposto às telas via <Outlet />: permite que o sino mobile
   (MobileTopBar de cada tela) abra o mesmo painel de notificações global. */
export interface AppLayoutContext {
  openNotifications: () => void
  unread: number
}

export function AppLayout() {
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL_NOTIFS)
  const { dark, toggle: toggleTheme } = useTheme()
  const location = useLocation()

  const unread = notifs.filter((n) => !n.read).length
  const markRead = (id: string) => setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))

  const outletContext: AppLayoutContext = {
    openNotifications: () => setNotifOpen(true),
    unread,
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-page lg:flex-row">
      <Sidebar
        items={navItems}
        dark={dark}
        onToggleTheme={toggleTheme}
        unread={unread}
        onNotifClick={() => setNotifOpen(true)}
      />
      <NotificationsPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifs={notifs}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
      />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {/* Subtle per-route load animation, consistent with the onboarding screens.
              Keyed by pathname so it replays on each navigation. Uses animate-yna-enter
              (no `forwards`) so no persistent transform breaks fixed children. */}
          <div key={location.pathname} className="min-h-full animate-yna-enter">
            <Outlet context={outletContext} />
          </div>
        </main>
        <BottomNav items={navItems} />
      </div>
    </div>
  )
}
