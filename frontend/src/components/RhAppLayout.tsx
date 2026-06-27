import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { RhSidebar } from './RhSidebar'
import type { NavItem } from './BottomNav'

/* Layout da área logada do RH / Empresa. Mesmo sistema dos demais perfis
   (sidebar desktop + bottom-nav mobile + animação de rota), com itens
   próprios e sem botão de pânico.

   A bottom-nav (mobile) é limitada a 5 itens; as demais seções ficam
   acessíveis pelo item "Mais". */
const rhSidebarItems: NavItem[] = [
  { icon: 'ph:squares-four-bold', label: 'Visão geral', to: '/rh/home' },
  { icon: 'ph:users-three-bold', label: 'Beneficiários', to: '/rh/beneficiarios' },
  { icon: 'ph:paper-plane-tilt-bold', label: 'Convites', to: '/rh/convites' },
  { icon: 'ph:chart-bar-bold', label: 'Indicadores', to: '/rh/indicadores' },
  { icon: 'ph:tree-structure-bold', label: 'Departamentos', to: '/rh/departamentos' },
  { icon: 'ph:user-gear-bold', label: 'Equipe RH', to: '/rh/equipe' },
]

const rhBottomItems: NavItem[] = [
  { icon: 'ph:squares-four-bold', label: 'Visão', to: '/rh/home' },
  { icon: 'ph:users-three-bold', label: 'Beneficiários', to: '/rh/beneficiarios' },
  { icon: 'ph:paper-plane-tilt-bold', label: 'Convites', to: '/rh/convites' },
  { icon: 'ph:chart-bar-bold', label: 'Indicadores', to: '/rh/indicadores' },
  { icon: 'ph:dots-three-circle-bold', label: 'Mais', to: '/rh/mais' },
]

export function RhAppLayout() {
  const location = useLocation()

  return (
    <div className="flex h-dvh overflow-hidden bg-page lg:flex-row">
      <RhSidebar items={rhSidebarItems} />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div key={location.pathname} className="h-full animate-yna-enter">
            <Outlet />
          </div>
        </main>
        <BottomNav items={rhBottomItems} />
      </div>
    </div>
  )
}
