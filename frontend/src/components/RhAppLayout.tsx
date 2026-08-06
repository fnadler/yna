import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { RhSidebar, type RhNavItem } from './RhSidebar'
import type { NavItem } from './BottomNav'

/* Layout da área logada do RH / Empresa. Mesmo sistema dos demais perfis
   (sidebar desktop + bottom-nav mobile + animação de rota), com itens
   próprios e sem botão de pânico.

   O módulo de Conformidade NR-1 deixou de ser 1 item de sidebar que abria um
   hub cheio de links (`NR1RhCockpit`) e virou uma seção própria de 6 telas
   de primeira classe — mapeamento, planejamento e controle/rastreabilidade
   com peso equivalente na navegação, em vez de espremidos atrás de um único
   painel. Ciclos e Kit viraram abas dentro de Relatório/Campanha (não somem,
   só não ficam soltos no menu).

   A bottom-nav (mobile) é limitada a 5 itens; as demais seções ficam
   acessíveis pelo item "Mais". */
const rhSidebarItems: RhNavItem[] = [
  { icon: 'ph:squares-four-bold', label: 'Visão geral', to: '/rh/home', section: 'Empresa' },
  { icon: 'ph:users-three-bold', label: 'Colaboradores', to: '/rh/colaboradores', section: 'Empresa' },
  { icon: 'ph:paper-plane-tilt-bold', label: 'Convites', to: '/rh/convites', section: 'Empresa' },
  { icon: 'ph:tree-structure-bold', label: 'Departamentos', to: '/rh/departamentos', section: 'Empresa' },
  { icon: 'ph:user-gear-bold', label: 'Equipe RH', to: '/rh/equipe', section: 'Empresa' },

  { icon: 'ph:squares-four-bold', label: 'Visão geral', to: '/rh/nr1', section: 'Conformidade NR-1' },
  { icon: 'ph:calendar-check-bold', label: 'Campanha de avaliação', to: '/rh/nr1/campanha', section: 'Conformidade NR-1' },
  { icon: 'ph:thermometer-bold', label: 'Mapa de calor', to: '/rh/nr1/mapa-calor', section: 'Conformidade NR-1' },
  { icon: 'ph:clipboard-text-bold', label: 'Inventário de riscos', to: '/rh/nr1/inventario', section: 'Conformidade NR-1' },
  { icon: 'ph:list-checks-bold', label: 'Plano de ação', to: '/rh/nr1/plano-acao', section: 'Conformidade NR-1' },
  { icon: 'ph:file-text-bold', label: 'Relatório e rastreabilidade', to: '/rh/nr1/relatorio', section: 'Conformidade NR-1' },
  { icon: 'ph:megaphone-simple-bold', label: 'Canal de escuta', to: '/rh/nr1/canal', section: 'Conformidade NR-1' },
]

const rhBottomItems: NavItem[] = [
  { icon: 'ph:squares-four-bold', label: 'Visão', to: '/rh/home' },
  { icon: 'ph:users-three-bold', label: 'Equipe', to: '/rh/colaboradores' },
  { icon: 'ph:shield-check-bold', label: 'NR-1', to: '/rh/nr1' },
  { icon: 'ph:paper-plane-tilt-bold', label: 'Convites', to: '/rh/convites' },
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
