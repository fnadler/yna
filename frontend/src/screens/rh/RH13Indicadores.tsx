import { useState } from 'react'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Select } from '../../components/Select'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { rhDashboardService } from '../../services/rh'
import { RH_DIMENSOES } from '../../data/rhMock'
import type { RhKpi } from '../../types'

/* RH-13 — Dashboard de indicadores (Seção 5.6). KPIs macro, mapa de calor
   NR-1 por departamento (k-anonimato ≥ 4) e alertas.
   Sigilo individual inegociável: tudo é agregado. */

const NIVEL_STYLE: Record<number, { bg: string; label: string }> = {
  0: { bg: 'bg-surface-2 text-ink-muted', label: 'Sem dado' },
  1: { bg: 'bg-success/20 text-success', label: 'Baixo' },
  2: { bg: 'bg-warning/25 text-warning-ink', label: 'Médio' },
  3: { bg: 'bg-danger/20 text-danger', label: 'Alto' },
}

const deltaTone = (t?: RhKpi['deltaTone']) =>
  t === 'up' ? 'text-success-ink' : t === 'down' ? 'text-danger' : 'text-ink-muted'

export function RH13Indicadores() {
  const kpis = useService(() => rhDashboardService.kpis(), [])
  const heatmap = useService(() => rhDashboardService.heatmap(), [])
  const alertas = useService(() => rhDashboardService.alertas(), [])
  const [periodo, setPeriodo] = useState('mes')

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />
        <PageHeader
          title="Indicadores"
          subtitle="O termômetro do seu time, com sigilo individual preservado."
          className="mt-2 lg:mt-0"
          action={
            <div className="hidden sm:block">
              <Select
                value={periodo}
                onChange={setPeriodo}
                ariaLabel="Período"
                className="w-40"
                options={[
                  { value: 'semana', label: 'Esta semana' },
                  { value: 'mes', label: 'Este mês' },
                  { value: 'trimestre', label: 'Trimestre' },
                ]}
              />
            </div>
          }
        />

        {/* Filtro de período mobile */}
        <div className="mb-5 sm:hidden">
          <Select
            value={periodo}
            onChange={setPeriodo}
            ariaLabel="Período"
            options={[
              { value: 'semana', label: 'Esta semana' },
              { value: 'mes', label: 'Este mês' },
              { value: 'trimestre', label: 'Trimestre' },
            ]}
          />
        </div>

        {/* KPIs */}
        <section className="mb-8">
          {kpis.status === 'loading' && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}
            </div>
          )}
          {kpis.status === 'error' && <ErrorState message={kpis.message} onRetry={kpis.reload} />}
          {kpis.status === 'success' && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {kpis.data.map((k) => (
                <div key={k.key} className="group relative flex flex-col gap-1 rounded-lg border border-border bg-surface p-4">
                  <div className="flex items-center gap-2">
                    <Icon icon={k.icon} width={18} className="text-primary dark:text-primary-300" aria-hidden />
                    {k.hint && (
                      <span className="group/tip relative ml-auto inline-flex">
                        <Icon icon="ph:info-bold" width={14} className="text-ink-muted" aria-hidden />
                        <span role="tooltip" className="pointer-events-none absolute right-0 top-[calc(100%+6px)] z-20 w-56 rounded-lg border border-border bg-surface p-3 text-left text-[12px] leading-relaxed text-ink-secondary opacity-0 shadow-lg transition-opacity group-hover/tip:opacity-100">
                          {k.hint}
                        </span>
                      </span>
                    )}
                  </div>
                  <p className="text-[28px] font-bold leading-none tracking-[-0.02em] text-ink">{k.value}</p>
                  <p className="text-[12px] text-ink-secondary">{k.label}</p>
                  {k.delta && <p className={`text-[11px] font-medium ${deltaTone(k.deltaTone)}`}>{k.delta}</p>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Mapa de calor NR-1 */}
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <Icon icon="ph:squares-four-bold" width={16} className="text-ink-secondary" aria-hidden />
            <h2 className="text-[15px] font-semibold text-ink">Mapa de calor por departamento</h2>
          </div>
          {heatmap.status === 'loading' && <Skeleton className="h-64 w-full rounded-lg" />}
          {heatmap.status === 'error' && <ErrorState message={heatmap.message} onRetry={heatmap.reload} />}
          {heatmap.status === 'success' && (
            <div className="overflow-x-auto rounded-lg border border-border bg-surface">
              <table className="w-full min-w-[640px] border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-ink-secondary">Departamento</th>
                    {RH_DIMENSOES.map((d) => (
                      <th key={d} className="px-2 py-3 text-center text-[11px] font-semibold text-ink-secondary">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmap.data.map((row) => (
                    <tr key={row.departamentoId} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <p className="text-[13px] font-medium text-ink">{row.departamento}</p>
                        <p className="text-[11px] text-ink-muted">{row.beneficiarios} pessoas</p>
                      </td>
                      {row.anonimizado ? (
                        <td colSpan={RH_DIMENSOES.length} className="px-2 py-3 text-center">
                          <span className="inline-flex items-center gap-1.5 rounded-pill bg-surface-2 px-3 py-1 text-[11px] text-ink-muted">
                            <Icon icon="ph:lock-simple-bold" width={12} aria-hidden />
                            Agrupado por anonimato (&lt; 4 pessoas)
                          </span>
                        </td>
                      ) : (
                        row.celulas.map((c, i) => {
                          const s = NIVEL_STYLE[c.nivel]
                          return (
                            <td key={i} className="px-2 py-2 text-center">
                              <span className={`inline-flex h-9 w-full min-w-[52px] items-center justify-center rounded-md text-[11px] font-semibold ${s.bg}`}>
                                {s.label}
                              </span>
                            </td>
                          )
                        })
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Legenda */}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {[1, 2, 3].map((n) => (
              <span key={n} className="flex items-center gap-1.5 text-[12px] text-ink-secondary">
                <span className={`h-3 w-3 rounded-[4px] ${NIVEL_STYLE[n].bg}`} />
                {NIVEL_STYLE[n].label}
              </span>
            ))}
            <span className="ml-auto text-[11px] text-ink-muted">Recortes com menos de 4 pessoas são agrupados (k-anonimato).</span>
          </div>
        </section>

        {/* Alertas */}
        {alertas.status === 'success' && alertas.data.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-[15px] font-semibold text-ink">Alertas de risco psicossocial</h2>
            <div className="flex flex-col gap-2">
              {alertas.data.map((a) => (
                <div key={a.id} className={`flex items-start gap-3 rounded-lg border p-4 ${a.nivel === 'alto' ? 'border-danger/30 bg-danger-bg' : 'border-warning/30 bg-warning-bg'}`}>
                  <Icon icon="ph:warning-bold" width={20} className={`mt-0.5 shrink-0 ${a.nivel === 'alto' ? 'text-danger' : 'text-warning-ink'}`} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{a.departamento} · {a.dimensao}</p>
                    <p className="mt-0.5 text-[13px] text-ink-secondary">{a.mensagem}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-ink-muted">{a.quando}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
