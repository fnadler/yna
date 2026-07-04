import { Icon } from '@iconify/react'
import { MngTopBar } from '../../components/MngTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { mngMatchService } from '../../services/mng'

/* MNG-14 — Curadoria informativa de matches (§8.6). Somente leitura: a YNA
   acompanha o output do algoritmo; não há aprovação — os matches seguem
   automaticamente ao beneficiário. */
export function Mng14Matches() {
  const matches = useService(() => mngMatchService.list(), [])

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MngTopBar />
        <PageHeader title="Curadoria de matches" subtitle="Acompanhamento do algoritmo — informativo." className="mt-2 lg:mt-0" />

        <div className="mb-4 flex items-start gap-2 rounded-lg border border-border bg-surface-2/60 px-4 py-3 text-[13px] text-ink-secondary">
          <Icon icon="ph:info-bold" width={16} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
          Visão apenas informativa para avaliar se o algoritmo indica o perfil correto. Os 3 matches já seguem automaticamente ao beneficiário.
        </div>

        {matches.status === 'loading' && <div className="flex flex-col gap-3">{[0, 1].map((i) => <Skeleton key={i} className="h-40 w-full rounded-lg" />)}</div>}
        {matches.status === 'error' && <ErrorState message={matches.message} onRetry={matches.reload} />}
        {matches.status === 'success' && (
          <div className="flex flex-col gap-3">
            {matches.data.map((m) => (
              <div key={m.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-heading text-sm font-semibold text-ink"><Icon icon="ph:user-bold" width={15} className="mr-1 inline text-primary dark:text-primary-300" aria-hidden />{m.beneficiario}</p>
                  <span className="text-[12px] text-ink-muted">{m.quando}</span>
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <div className="rounded-lg bg-surface-2/50 p-3">
                    <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-muted">Triagem</p>
                    <ul className="flex flex-col gap-1.5">
                      {m.triagem.map((t, i) => <li key={i} className="text-[12.5px] text-ink"><span className="text-ink-secondary">{t.pergunta}:</span> {t.resposta}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-muted">3 perfis sugeridos</p>
                    <ul className="flex flex-col gap-1.5">
                      {m.sugeridos.map((s, i) => (
                        <li key={i} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2">
                          <span className="text-[13px] text-ink">{s.nome} <span className="text-ink-muted">· {s.abordagem}</span></span>
                          <span className="font-mono text-[12px] font-semibold text-success-ink">{s.aderencia}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
