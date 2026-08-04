import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { MngSidebar } from './MngSidebar'
import type { NavItem } from './BottomNav'

/* Layout da área logada do Manager / Backoffice YNA. Mesmo sistema dos demais
   perfis (sidebar desktop + top-bar/bottom-nav mobile + animação de rota). */
const mngSidebarItems: NavItem[] = [
  { icon: 'ph:squares-four-bold', label: 'Visão geral', to: '/mng/home' },
  { icon: 'ph:buildings-bold', label: 'Empresas', to: '/mng/empresas' },
  { icon: 'ph:identification-badge-bold', label: 'Profissionais', to: '/mng/profissionais' },
  { icon: 'ph:calendar-check-bold', label: 'Sessões', to: '/mng/sessoes' },
  { icon: 'ph:receipt-bold', label: 'Financeiro', to: '/mng/financeiro' },
  { icon: 'ph:graduation-cap-bold', label: 'Academia', to: '/mng/universidade' },
  { icon: 'ph:lifebuoy-bold', label: 'Suporte', to: '/mng/suporte' },
  { icon: 'ph:shuffle-bold', label: 'Matches', to: '/mng/matches' },
  { icon: 'ph:files-bold', label: 'Documentos', to: '/mng/documentos' },
  { icon: 'ph:package-bold', label: 'Planos', to: '/mng/planos' },
  { icon: 'ph:identification-card-bold', label: 'Tipos de profissional', to: '/mng/tipos-profissional' },
  { icon: 'ph:shield-check-bold', label: 'Modelos NR-1', to: '/mng/nr1/modelos' },
  { icon: 'ph:users-three-bold', label: 'Usuários', to: '/mng/gestores' },
]

const mngBottomItems: NavItem[] = [
  { icon: 'ph:squares-four-bold', label: 'Visão', to: '/mng/home' },
  { icon: 'ph:buildings-bold', label: 'Empresas', to: '/mng/empresas' },
  { icon: 'ph:identification-badge-bold', label: 'Profis.', to: '/mng/profissionais' },
  { icon: 'ph:calendar-check-bold', label: 'Sessões', to: '/mng/sessoes' },
  { icon: 'ph:dots-three-circle-bold', label: 'Mais', to: '/mng/mais' },
]

export function MngAppLayout() {
  const location = useLocation()
  return (
    <div className="flex h-dvh overflow-hidden bg-page lg:flex-row">
      <MngSidebar items={mngSidebarItems} />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div key={location.pathname} className="h-full animate-yna-enter">
            <Outlet />
          </div>
        </main>
        <BottomNav items={mngBottomItems} />
      </div>
    </div>
  )
}
