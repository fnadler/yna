import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { ProSidebar } from './ProSidebar'
import type { NavItem } from './BottomNav'

/* Layout da área logada do Profissional. Mesmo sistema do AppLayout do
   beneficiário (sidebar desktop + bottom-nav mobile + animação de rota),
   com itens próprios e sem botão de pânico. */
const proNavItems: NavItem[] = [
  { icon: 'ph:house-bold', label: 'Início', to: '/pro/home' },
  { icon: 'ph:calendar-bold', label: 'Agenda', to: '/pro/agenda' },
  { icon: 'ph:graduation-cap-bold', label: 'Universidade', to: '/pro/universidade' },
  { icon: 'ph:wallet-bold', label: 'Financeiro', to: '/pro/financeiro' },
  { icon: 'ph:user-circle-bold', ynaIcon: 'profile' as const, label: 'Perfil', to: '/pro/perfil' },
]

export function ProAppLayout() {
  const location = useLocation()

  return (
    <div className="flex h-dvh overflow-hidden bg-page lg:flex-row">
      <ProSidebar items={proNavItems} />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {/* h-full (não min-h-full) dá altura definida ao wrapper, para que o
              min-h-full da tela resolva e o gradiente preencha todo o scroll,
              mesmo quando o conteúdo é curto. */}
          <div key={location.pathname} className="h-full animate-yna-enter">
            <Outlet />
          </div>
        </main>
        <BottomNav items={proNavItems} />
      </div>
    </div>
  )
}
