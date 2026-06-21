import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { useService } from '../../hooks/useService'
import { proUniversidadeService } from '../../services/pro'

export function Pro22Lives() {
  const navigate = useNavigate()
  const lives = useService(() => proUniversidadeService.lives(), [])
  const [inscritos, setInscritos] = useState<Record<string, boolean>>({})

  const data = lives.status === 'success' ? lives.data : []
  const agendadas = data.filter((l) => l.status === 'agendada')
  const replays = data.filter((l) => l.status === 'replay')

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className="mx-auto max-w-2xl px-5 lg:px-8 pt-6 lg:pt-10 pb-10">
        <header className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate('/pro/universidade')}
            aria-label="Voltar"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover"
          >
            <Icon icon="ph:arrow-left-bold" width={18} aria-hidden />
          </button>
          <div>
            <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-primary dark:text-primary-300">Universidade YNA</p>
            <h1 className="font-heading text-lg font-semibold text-ink">Lives Domus</h1>
          </div>
        </header>

        {lives.status === 'loading' && (
          <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}</div>
        )}
        {lives.status === 'error' && <ErrorState message={lives.message} onRetry={lives.reload} />}
        {lives.status === 'success' && (
          <>
            <h2 className="mb-3 text-[15px] font-semibold text-ink">Próximas</h2>
            <div className="flex flex-col gap-2">
              {agendadas.map((l) => {
                const isOn = inscritos[l.id] ?? l.inscrito
                return (
                  <div key={l.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-4">
                    <Icon icon="ph:broadcast-bold" width={22} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-sm font-semibold text-ink">{l.titulo}</p>
                      <p className="font-mono text-[13px] text-ink-secondary">{l.data} · {l.horario}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={isOn ? 'soft' : 'primary'}
                      iconLeft={isOn ? 'ph:check-bold' : undefined}
                      onClick={() => setInscritos((s) => ({ ...s, [l.id]: !isOn }))}
                    >
                      {isOn ? 'Inscrito' : 'Inscrever'}
                    </Button>
                  </div>
                )
              })}
            </div>

            <h2 className="mb-3 mt-8 text-[15px] font-semibold text-ink">Replays</h2>
            <div className="flex flex-col gap-2">
              {replays.map((l) => (
                <div key={l.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-4">
                  <Icon icon="ph:play-circle-bold" width={22} className="shrink-0 text-ink-secondary" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-sm font-semibold text-ink">{l.titulo}</p>
                    <p className="font-mono text-[13px] text-ink-secondary">{l.data}</p>
                  </div>
                  <Badge tone="neutral">Replay</Badge>
                </div>
              ))}
            </div>

            <p className="mt-6 flex items-start gap-2 text-[12.5px] text-ink-muted">
              <Icon icon="ph:youtube-logo-bold" width={15} className="mt-0.5 shrink-0" aria-hidden />
              As lives acontecem em canal fechado da YNA, com link na plataforma e replay depois.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
