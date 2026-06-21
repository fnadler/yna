import { useState } from 'react'
import { Icon } from '@iconify/react'
import { ProTopBar } from '../../components/ProTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { proQualityService } from '../../services/pro'

function scoreColor(score: number) {
  if (score >= 85) return 'bg-success'
  if (score >= 70) return 'bg-primary'
  return 'bg-warning'
}

export function Pro23Qualidade() {
  const scores = useService(() => proQualityService.scores(), [])
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <ProTopBar />
        <PageHeader title="Qualidade" subtitle="Acompanhe sua evolução por critério. É só para você crescer." className="mt-2 lg:mt-0" />

        {scores.status === 'loading' && (
          <div className="flex flex-col gap-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
        )}
        {scores.status === 'error' && <ErrorState message={scores.message} onRetry={scores.reload} />}
        {scores.status === 'success' && (
          <div className="flex flex-col gap-2">
            {scores.data.map((q) => {
              const isOpen = open === q.criterio
              return (
                <div key={q.criterio} className="rounded-lg border border-border bg-surface p-4">
                  <div className="flex items-center gap-2">
                    <p className="font-heading text-sm font-semibold text-ink">{q.criterio}</p>
                    <button
                      onClick={() => setOpen(isOpen ? null : q.criterio)}
                      aria-expanded={isOpen}
                      aria-label={`Como o critério ${q.criterio} é avaliado`}
                      className="flex h-6 w-6 items-center justify-center rounded-pill text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
                    >
                      <Icon icon="ph:info-bold" width={15} aria-hidden />
                    </button>
                    <span className="ml-auto font-mono text-sm font-semibold text-ink">{q.score}</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-pill bg-surface-2">
                    <div className={`h-full rounded-pill ${scoreColor(q.score)}`} style={{ width: `${q.score}%` }} />
                  </div>
                  {isOpen && (
                    <p className="mt-3 rounded-sm bg-surface-2 px-3 py-2 text-[13px] leading-relaxed text-ink-secondary">
                      {q.descricao}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Transparência sobre o que NÃO é mostrado */}
        <div className="mt-6 flex items-start gap-2 rounded-lg border border-border bg-surface-2 px-4 py-3 text-[13px] text-ink-secondary">
          <Icon icon="ph:eye-slash-bold" width={16} className="mt-0.5 shrink-0 text-ink-muted" aria-hidden />
          Sua posição em relação a outros profissionais e os comentários individuais dos beneficiários não são exibidos aqui — este painel é só sobre o seu desenvolvimento.
        </div>
      </div>
    </div>
  )
}
