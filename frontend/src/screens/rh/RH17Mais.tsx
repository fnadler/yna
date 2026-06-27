import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { ViewAsSwitcher } from '../../components/ViewAsSwitcher'
import { PAGE_MAX_W } from '../../lib/layout'
import { useRh } from '../../contexts/RhContext'

/* RH-17 — Menu "Mais" (mobile). Agrupa as seções do RH que não cabem na
   bottom-nav. Em desktop a navegação é feita pela sidebar. */

type MaisItem = { icon: string; label: string; to: string; badge?: number }

function MenuRow({ item }: { item: MaisItem }) {
  return (
    <Link
      to={item.to}
      className="flex min-h-[52px] items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:bg-surface-hover"
    >
      <Icon icon={item.icon} width={20} className="shrink-0 text-ink-secondary" aria-hidden />
      <span className="flex-1 font-heading text-[15px] font-medium text-ink">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-danger px-1 text-[10px] font-semibold text-white">
          {item.badge}
        </span>
      )}
      <Icon icon="ph:caret-right-bold" width={16} className="shrink-0 text-ink-muted" aria-hidden />
    </Link>
  )
}

export function RH17Mais() {
  const { unreadNotifs } = useRh()
  const navigate = useNavigate()

  const grupos: { titulo: string; items: MaisItem[] }[] = [
    {
      titulo: 'Gestão',
      items: [
        { icon: 'ph:tree-structure-bold', label: 'Departamentos', to: '/rh/departamentos' },
        { icon: 'ph:user-gear-bold', label: 'Equipe RH', to: '/rh/equipe' },
      ],
    },
    {
      titulo: 'Conta',
      items: [
        { icon: 'ph:buildings-bold', label: 'Conta da empresa', to: '/rh/conta' },
        { icon: 'ph:bell-bold', label: 'Avisos', to: '/rh/conta', badge: unreadNotifs },
      ],
    },
  ]

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />
        <PageHeader title="Mais" subtitle="Todas as seções do painel." className="mt-2 lg:mt-0" />

        <div className="flex flex-col gap-6">
          <section>
            <h2 className="mb-2 px-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
              Visualização
            </h2>
            <ViewAsSwitcher current="admin" direction="down" />
          </section>

          {grupos.map((g) => (
            <section key={g.titulo}>
              <h2 className="mb-2 px-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
                {g.titulo}
              </h2>
              <div className="flex flex-col gap-2">
                {g.items.map((item) => (
                  <MenuRow key={item.label} item={item} />
                ))}
              </div>
            </section>
          ))}

          <button
            onClick={() => navigate('/rh/convite/demo')}
            className="mt-2 flex min-h-[52px] items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-3 font-heading text-sm font-semibold text-ink-secondary transition-colors hover:border-danger/30 hover:bg-danger-bg hover:text-danger-ink"
          >
            <Icon icon="ph:sign-out-bold" width={16} aria-hidden />
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  )
}
