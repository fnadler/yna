import { Icon } from '@iconify/react'
import { YnaIcon } from './YnaIcons'
import type { YnaIconName } from './YnaIcons'

export interface Notif {
  id: string
  icon: string
  ynaIcon?: YnaIconName
  iconBg: string
  iconColor: string
  title: string
  body: string
  time: string
  read: boolean
}

export const INITIAL_NOTIFS: Notif[] = [
  {
    id: 'n1',
    icon: 'ph:calendar-bold',
    iconBg: 'bg-primary-50',
    iconColor: 'text-primary dark:text-primary-300',
    title: 'Sessão amanhã às 19h00',
    body: 'Com Dra. Ana Beltrão. Lembrete automático 1h antes.',
    time: 'há 2h',
    read: false,
  },
  {
    id: 'n2',
    icon: 'ph:flower-tulip-bold',
    ynaIcon: 'flower' as const,
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    title: 'Check-in disponível',
    body: 'Como você está hoje? Leva menos de 1 minuto.',
    time: 'há 5h',
    read: false,
  },
  {
    id: 'n3',
    icon: 'ph:sparkle-bold',
    iconBg: 'bg-lavender/30',
    iconColor: 'text-primary dark:text-primary-300',
    title: 'Uma reflexão da Nyna',
    body: 'Ela preparou algo para você sobre a semana.',
    time: 'ontem',
    read: true,
  },
]

/* Painel de notificações do beneficiário.
   Mobile: full-screen slide-over. Desktop: ancorado à direita da sidebar.
   O gatilho (sino) vive na Sidebar/MobileTopBar; o estado vive no AppLayout. */
export function NotificationsPanel({
  open,
  onClose,
  notifs,
  onMarkRead,
  onMarkAllRead,
}: {
  open: boolean
  onClose: () => void
  notifs: Notif[]
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
}) {
  if (!open) return null
  const unread = notifs.filter((n) => !n.read).length

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-label="Notificações"
        className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-surface lg:inset-auto lg:left-[272px] lg:top-16 lg:max-h-[70dvh] lg:w-[360px] lg:rounded-lg lg:border lg:border-border lg:shadow-xl"
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-border px-5 pb-4 pt-14 lg:pt-4">
          <h2 className="flex-1 text-[15px] font-semibold text-ink">Notificações</h2>
          {unread > 0 && (
            <button
              onClick={onMarkAllRead}
              className="font-heading text-sm font-medium text-primary transition-colors hover:text-primary-600 dark:text-primary-300"
            >
              Marcar como lidas
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Fechar notificações"
            className="flex h-10 w-10 items-center justify-center rounded-pill border border-border text-ink-secondary transition-colors hover:bg-surface-hover lg:hidden"
          >
            <Icon icon="ph:x-bold" width={18} aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto">
          {notifs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Icon icon="ph:bell-slash-bold" width={28} className="text-ink-secondary" aria-hidden />
              <p className="text-sm text-ink-secondary">Nenhuma notificação por enquanto</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifs.map((n) => (
                <button
                  key={n.id}
                  onClick={() => onMarkRead(n.id)}
                  className={`flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-hover ${
                    !n.read ? 'bg-primary-50/50 dark:bg-primary-50/10' : ''
                  }`}
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${n.iconBg}`}>
                    {n.ynaIcon
                      ? <YnaIcon name={n.ynaIcon} size={16} className={n.iconColor} />
                      : <Icon icon={n.icon} width={16} className={n.iconColor} aria-hidden />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-ink' : 'font-medium text-ink-secondary'}`}>
                        {n.title}
                      </p>
                      <span className="shrink-0 text-[11px] text-ink-secondary">{n.time}</span>
                    </div>
                    <p className="mt-0.5 text-xs leading-snug text-ink-secondary">{n.body}</p>
                  </div>
                  {!n.read && (
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
