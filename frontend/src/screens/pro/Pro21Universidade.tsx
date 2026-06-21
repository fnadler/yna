import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { ProTopBar } from '../../components/ProTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { proUniversidadeService } from '../../services/pro'

const nivelLabel: Record<string, string> = { iniciante: 'Iniciante', intermediario: 'Intermediário', avancado: 'Avançado' }

export function Pro21Universidade() {
  const navigate = useNavigate()
  const trilhas = useService(() => proUniversidadeService.trilhas(), [])

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <ProTopBar />
        <PageHeader title="Universidade YNA" subtitle="Aprofunde sua prática no seu tempo." className="mt-2 lg:mt-0" />

        {/* Banners: Lives + Supervisão */}
        <div className="mb-6 grid gap-2 sm:grid-cols-2">
          <button
            onClick={() => navigate('/pro/universidade/lives')}
            className="flex w-full items-center gap-3 rounded-lg border border-primary/30 bg-primary-50 px-4 py-4 text-left transition-colors hover:border-primary"
          >
            <Icon icon="ph:broadcast-bold" width={24} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
            <div className="flex-1">
              <p className="font-heading text-sm font-semibold text-ink">Lives Domus</p>
              <p className="text-[13px] text-ink-secondary">Rounds técnicos ao vivo e replays</p>
            </div>
            <Icon icon="ph:caret-right-bold" width={16} className="shrink-0 text-ink-muted" aria-hidden />
          </button>
          <button
            onClick={() => navigate('/pro/supervisao')}
            className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface px-4 py-4 text-left transition-colors hover:border-border-strong"
          >
            <Icon icon="ph:users-three-bold" width={24} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
            <div className="flex-1">
              <p className="font-heading text-sm font-semibold text-ink">Supervisão Domus</p>
              <p className="text-[13px] text-ink-secondary">Encontros clínicos e casos</p>
            </div>
            <Icon icon="ph:caret-right-bold" width={16} className="shrink-0 text-ink-muted" aria-hidden />
          </button>
        </div>

        <h2 className="mb-3 text-[15px] font-semibold text-ink">Trilhas</h2>
        {trilhas.status === 'loading' && (
          <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}</div>
        )}
        {trilhas.status === 'error' && <ErrorState message={trilhas.message} onRetry={trilhas.reload} />}
        {trilhas.status === 'success' && (
          <div className="flex flex-col gap-3">
            {trilhas.data.map((t) => {
              const cta = t.progresso === 0 ? 'Começar' : t.progresso === 100 ? 'Revisar' : 'Continuar'
              return (
                <div key={t.id} className="rounded-lg border border-border bg-surface p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="neutral">{t.categoria}</Badge>
                        <Badge tone="primary">{nivelLabel[t.nivel]}</Badge>
                        {t.progresso === 100 && <Badge tone="success" icon="ph:check-bold">Concluída</Badge>}
                      </div>
                      <h3 className="mt-2 font-heading text-[15px] font-semibold text-ink">{t.titulo}</h3>
                      <p className="mt-0.5 text-[13px] text-ink-secondary">{t.descricao}</p>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-ink-muted">{t.duracaoMin} min</span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-pill bg-surface-2">
                      <div className={`h-full rounded-pill ${t.progresso === 100 ? 'bg-success' : 'bg-gradient-to-r from-primary to-pink'}`} style={{ width: `${t.progresso}%` }} />
                    </div>
                    <span className="font-mono text-xs text-ink-secondary">{t.progresso}%</span>
                  </div>

                  <Button variant="soft" size="sm" className="mt-4" iconRight="ph:play-bold">{cta}</Button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
