import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { ProSidebar } from './ProSidebar'
import type { NavItem } from './BottomNav'

/* Layout da área logada do Profissional. Mesmo sistema do AppLayout do
   beneficiário (sidebar desktop + bottom-nav mobile + animação de rota),
   com itens próprios e sem botão de pânico.

   Na fase 2 a área logada tem só Perfil (tela inicial), Agenda e
   Configurações. No desktop, Configurações fica no rodapé da sidebar;
   no celular, vai para a bottom-nav. */
const proSidebarItems: NavItem[] = [
  { icon: 'ph:user-circle-bold', ynaIcon: 'profile' as const, label: 'Perfil', to: '/pro/perfil' },
  { icon: 'ph:calendar-bold', label: 'Agenda', to: '/pro/agenda' },
]

const proBottomItems: NavItem[] = [
  { icon: 'ph:user-circle-bold', ynaIcon: 'profile' as const, label: 'Perfil', to: '/pro/perfil' },
  { icon: 'ph:calendar-bold', label: 'Agenda', to: '/pro/agenda' },
  { icon: 'ph:gear-bold', label: 'Configurações', to: '/pro/conta' },
]

export function ProAppLayout() {
  const location = useLocation()

  return (
    <div className="flex h-dvh overflow-hidden bg-page lg:flex-row">
      <ProSidebar items={proSidebarItems} />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {/* h-full (não min-h-full) dá altura definida ao wrapper, para que o
              min-h-full da tela resolva e o gradiente preencha todo o scroll,
              mesmo quando o conteúdo é curto. */}
          <div key={location.pathname} className="h-full animate-yna-enter">
            <Outlet />
          </div>
        </main>
        <BottomNav items={proBottomItems} />
      </div>
    </div>
  )
}
