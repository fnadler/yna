import { Icon } from '@iconify/react'
import { ProTopBar } from '../../components/ProTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { proNotificacaoService } from '../../services/pro'

export function Pro26Notificacoes() {
  const notns = useService(() => proNotificacaoService.list(), [])

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <ProTopBar />
        <PageHeader title="Notificações" subtitle="O que aconteceu por aqui." className="mt-2 lg:mt-0" />

        {notns.status === 'loading' && (
          <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}</div>
        )}
        {notns.status === 'error' && <ErrorState message={notns.message} onRetry={notns.reload} />}
        {notns.status === 'success' && (
          <div className="flex flex-col gap-2">
            {notns.data.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 rounded-lg border px-4 py-4 ${
                  n.lida ? 'border-border bg-surface' : 'border-primary/30 bg-primary-50'
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-surface text-primary dark:text-primary-300">
                  <Icon icon={n.icon} width={20} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-heading text-sm font-semibold text-ink">{n.titulo}</p>
                    {!n.lida && <span className="h-2 w-2 shrink-0 rounded-pill bg-primary" aria-label="Não lida" />}
                  </div>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-ink-secondary">{n.descricao}</p>
                  <p className="mt-1 font-mono text-[11px] text-ink-muted">{n.quando}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
