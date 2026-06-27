import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { ProTopBar } from '../../components/ProTopBar'
import { PageHeader } from '../../components/PageHeader'
import { PAGE_MAX_W } from '../../lib/layout'
import { usePro } from '../../contexts/ProContext'

/* PRO-28 — Menu "Mais" (mobile). Agrupa as seções do profissional que não
   cabem na bottom-nav. Em desktop a navegação é feita pela sidebar; esta
   tela existe sobretudo para o mobile. */

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

export function Pro28Mais() {
  const { unreadNotifs } = usePro()
  const navigate = useNavigate()

  const grupos: { titulo: string; items: MaisItem[] }[] = [
    {
      titulo: 'Conta',
      items: [
        { icon: 'ph:user-circle-bold', label: 'Perfil', to: '/pro/perfil' },
        { icon: 'ph:gear-bold', label: 'Configurações da conta', to: '/pro/conta' },
        { icon: 'ph:bell-bold', label: 'Notificações', to: '/pro/notificacoes', badge: unreadNotifs },
      ],
    },
    {
      titulo: 'Recursos',
      items: [
        { icon: 'ph:wallet-bold', label: 'Financeiro', to: '/pro/financeiro' },
        { icon: 'ph:chats-circle-bold', label: 'Supervisão', to: '/pro/supervisao' },
      ],
    },
  ]

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <ProTopBar />
        <PageHeader title="Mais" subtitle="Todas as seções do seu espaço." className="mt-2 lg:mt-0" />

        <div className="flex flex-col gap-6">
          {grupos.map((g) => (
            <section key={g.titulo}>
              <h2 className="mb-2 px-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
                {g.titulo}
              </h2>
              <div className="flex flex-col gap-2">
                {g.items.map((item) => (
                  <MenuRow key={item.to} item={item} />
                ))}
              </div>
            </section>
          ))}

          <button
            onClick={() => navigate('/pro/convite/demo')}
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
