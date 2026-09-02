import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { RhSidebar, type RhNavItem } from './RhSidebar'
import type { NavItem } from './BottomNav'

/* Layout da área logada do RH / Empresa. Mesmo sistema dos demais perfis
   (sidebar desktop + bottom-nav mobile + animação de rota), com itens
   próprios e sem botão de pânico.

   O módulo de Conformidade NR-1 deixou de ser 1 item de sidebar que abria um
   hub cheio de links (`NR1RhCockpit`) e virou uma seção própria de telas de
   primeira classe — mapeamento, planejamento e controle/rastreabilidade
   com peso equivalente na navegação, em vez de espremidos atrás de um único
   painel. O Kit de comunicação (materiais prontos pra divulgar a campanha)
   foi removido depois — o único link pra ele era um atalho sem uso no
   detalhe do ciclo, substituído pelo link único da avaliação (ver
   `NR1RhCiclos.tsx`).

   "Canal de escuta" saiu da sidebar (item fixo de navegação) por pedido
   explícito, mas a tela (`NR1RhCanal.tsx`, rota `/rh/nr1/canal`) continua
   viva e acessível por deep-link contextual (ex.: a partir de um caso citado
   em outra tela) — não é um item de menu permanente, mas também não foi
   removida do produto.

   "Mapa de calor" também saiu da sidebar como item próprio — deixou de ser
   uma tela isolada e passou a viver dentro de "Visão geral" (sempre o ciclo
   em campo) e na aba "Resultado" de cada ciclo em "Ciclos de avaliação".

   "Campanhas" foi renomeada para "Ciclos de avaliação" e absorveu a antiga
   tela "Ciclos e reavaliação" (comparação de dimensões entre campanhas, que
   vivia sozinha em `/rh/nr1/ciclos`) — as duas eram a mesma pergunta em
   dois lugares do menu. Agora é uma única tela (`NR1RhCiclos.tsx`, rota
   `/rh/nr1/ciclos` → lista; `/rh/nr1/ciclos/:campanhaId` → detalhe com
   abas Engajamento/Resultado) que lista todos os ciclos, não só o ativo.

   A bottom-nav (mobile) é limitada a 5 itens; as demais seções ficam
   acessíveis pelo item "Mais".

   "Visão geral" da Conformidade NR-1 (`/rh/nr1`) é o primeiro item da
   sidebar, sem seção — fora dos agrupamentos, à frente até do agrupamento
   "Conformidade NR-1" a que pertence. É o item mais importante do menu (a
   conformidade NR-1 é o produto), então não fica com o mesmo peso visual de
   Ciclos/Inventário/Planos/Relatório.

   A antiga Home (`RH10Home.tsx`, rota `/rh/home`) foi removida — duplicava
   a Visão geral (saudação + estado do ciclo + risco por dimensão, ambas)
   sem motivo pra existirem as duas. `/rh` agora redireciona direto pra
   `/rh/nr1`, e a bottom-nav mobile perdeu o item solto "Visão" (que
   apontava pra Home): "NR-1" já cobria o mesmo destino, então virou o
   único item, renomeado para "Visão geral" pra bater com o rótulo da
   sidebar. */
const rhSidebarItems: RhNavItem[] = [
  { icon: 'ph:squares-four-bold', label: 'Visão geral', to: '/rh/nr1' },

  { icon: 'ph:calendar-check-bold', label: 'Ciclos de avaliação', to: '/rh/nr1/ciclos', section: 'Conformidade NR-1' },
  { icon: 'ph:clipboard-text-bold', label: 'Inventário de riscos', to: '/rh/nr1/inventario', section: 'Conformidade NR-1' },
  { icon: 'ph:list-checks-bold', label: 'Planos de ação', to: '/rh/nr1/plano-acao', section: 'Conformidade NR-1' },
  { icon: 'ph:file-text-bold', label: 'Relatório e rastreabilidade', to: '/rh/nr1/relatorio', section: 'Conformidade NR-1' },

  { icon: 'ph:users-three-bold', label: 'Colaboradores', to: '/rh/colaboradores', section: 'Empresa' },
  { icon: 'ph:paper-plane-tilt-bold', label: 'Convites', to: '/rh/convites', section: 'Empresa' },
  { icon: 'ph:tree-structure-bold', label: 'Departamentos', to: '/rh/departamentos', section: 'Empresa' },
  { icon: 'ph:user-gear-bold', label: 'Equipe RH', to: '/rh/equipe', section: 'Empresa' },
]

const rhBottomItems: NavItem[] = [
  { icon: 'ph:squares-four-bold', label: 'Visão geral', to: '/rh/nr1' },
  { icon: 'ph:users-three-bold', label: 'Equipe', to: '/rh/colaboradores' },
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
