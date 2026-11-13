import { Icon } from '@iconify/react'
import { PRO_TODAY } from '../data/proMock'
import type { ProBloqueio, ProDisponibilidade } from '../types'

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const ddmm = (d: string) => d.split('-').slice(1).reverse().join('/')
const fmtBloqueio = (b: ProBloqueio) => (b.fim && b.fim !== b.inicio ? `${ddmm(b.inicio)}–${ddmm(b.fim)}` : ddmm(b.inicio))

/* Resumo visual da disponibilidade (calendário da semana) — exibido no perfil
   (PRO-09): atendimento e plantão por dia, mais os bloqueios futuros. */
export function DisponibilidadeResumo({ disponibilidade }: { disponibilidade: ProDisponibilidade }) {
  const { atendimento, plantao, bloqueios } = disponibilidade
  const bloqueiosFuturos = bloqueios
    .filter((b) => (b.fim ?? b.inicio) >= PRO_TODAY)
    .sort((a, b) => a.inicio.localeCompare(b.inicio))

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      {/* Legenda */}
      <div className="mb-3 flex items-center gap-4 text-[12px] text-ink-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden /> Atendimento
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-warning-ink" aria-hidden /> Plantão
        </span>
      </div>

      {/* Semana */}
      <div className="flex flex-col gap-1.5">
        {DIAS.map((d) => {
          const atTimes = atendimento[d]?.active ? atendimento[d]!.times : []
          const plTimes = plantao[d]?.active ? plantao[d]!.times : []
          const vazio = atTimes.length === 0 && plTimes.length === 0
          return (
            <div key={d} className="flex items-start gap-3">
              <span className="w-9 shrink-0 pt-1 font-heading text-[13px] font-semibold text-ink">{d}</span>
              <div className="flex flex-1 flex-wrap gap-1">
                {vazio ? (
                  <span className="pt-1 text-[13px] text-ink-muted">—</span>
                ) : (
                  <>
                    {atTimes.map((t) => (
                      <span key={`a${t}`} className="rounded-pill bg-primary-50 px-2 py-1 font-mono text-[11px] font-medium text-primary dark:text-primary-300">{t}</span>
                    ))}
                    {plTimes.map((t) => (
                      <span key={`p${t}`} className="rounded-pill bg-warning-bg px-2 py-1 font-mono text-[11px] font-medium text-warning-ink">{t}</span>
                    ))}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bloqueios futuros */}
      {bloqueiosFuturos.length > 0 && (
        <div className="mt-3 flex items-start gap-2 border-t border-border pt-3 text-[13px] text-ink-secondary">
          <Icon icon="ph:prohibit-bold" width={15} className="mt-0.5 shrink-0 text-ink-muted" aria-hidden />
          <span>
            {bloqueiosFuturos.length} bloqueio{bloqueiosFuturos.length > 1 ? 's' : ''} à frente —{' '}
            {bloqueiosFuturos.slice(0, 2).map(fmtBloqueio).join(', ')}
            {bloqueiosFuturos.length > 2 ? '…' : ''}
          </span>
        </div>
      )}
    </div>
  )
}
