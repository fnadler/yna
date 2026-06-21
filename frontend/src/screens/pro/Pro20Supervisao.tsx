import { useState } from 'react'
import { Icon } from '@iconify/react'
import { ProTopBar } from '../../components/ProTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { proSupervisaoService } from '../../services/pro'

export function Pro20Supervisao() {
  const sup = useService(() => proSupervisaoService.list(), [])
  const [inscritos, setInscritos] = useState<Record<string, boolean>>({})

  const data = sup.status === 'success' ? sup.data : []
  const agendadas = data.filter((s) => s.status === 'agendada')
  const realizadas = data.filter((s) => s.status === 'realizada')

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <ProTopBar />
        <PageHeader title="Supervisão YNA" subtitle="Rounds técnicos para discutir casos com pares e supervisores." className="mt-2 lg:mt-0" />

        {sup.status === 'loading' && (
          <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}</div>
        )}
        {sup.status === 'error' && <ErrorState message={sup.message} onRetry={sup.reload} />}
        {sup.status === 'success' && (
          <>
            <h2 className="mb-3 text-[15px] font-semibold text-ink">Próximas</h2>
            <div className="flex flex-col gap-2">
              {agendadas.map((s) => {
                const isOn = inscritos[s.id] ?? s.inscrito
                return (
                  <div key={s.id} className="rounded-lg border border-border bg-surface p-5">
                    <div className="flex items-start gap-3">
                      <Icon icon="ph:users-three-bold" width={22} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <p className="font-heading text-sm font-semibold text-ink">{s.tema}</p>
                        <p className="mt-0.5 font-mono text-[13px] text-ink-secondary">{s.data} · {s.horario}</p>
                        <p className="mt-0.5 text-[13px] text-ink-secondary">com {s.supervisor}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant={isOn ? 'soft' : 'primary'}
                        iconLeft={isOn ? 'ph:check-bold' : undefined}
                        onClick={() => setInscritos((m) => ({ ...m, [s.id]: !isOn }))}
                      >
                        {isOn ? 'Inscrito' : 'Inscrever'}
                      </Button>
                      {isOn && <Button size="sm" variant="secondary" iconLeft="ph:video-camera-bold">Entrar na sala</Button>}
                    </div>
                  </div>
                )
              })}
            </div>

            <h2 className="mb-3 mt-8 text-[15px] font-semibold text-ink">Histórico</h2>
            <div className="flex flex-col gap-2">
              {realizadas.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-4">
                  <Icon icon="ph:check-circle-bold" width={20} className="shrink-0 text-success" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-sm font-semibold text-ink">{s.tema}</p>
                    <p className="font-mono text-[13px] text-ink-secondary">{s.data} · com {s.supervisor}</p>
                  </div>
                  <Badge tone="neutral">Replay</Badge>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
