import { Icon } from '@iconify/react'
import { fmtData, nr1DiasEntre, nr1UrgenciaPrazo, URGENCIA_PRAZO } from '../lib/nr1'
import { NR1_TODAY } from '../data/nr1Mock'
import type { Nr1Acao } from '../types'

/** Badge de vencimento — leitura objetiva de `quando` vs. hoje
   (`nr1UrgenciaPrazo`), independente do status manual da ação. Usado na
   lista, no kanban e no detalhe do plano de ação, e no modal de dimensão
   da Visão Geral, para o mesmo prazo nunca ser lido de jeitos diferentes
   em lugares diferentes. */
export function PrazoBadge({ acao }: { acao: Nr1Acao }) {
  if (acao.status === 'concluida') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-pill bg-success-bg px-2.5 py-1 text-[11px] font-semibold text-success-ink">
        <Icon icon="ph:check-circle-bold" width={12} aria-hidden />
        {acao.concluidaEm ? `Concluída em ${fmtData(acao.concluidaEm)}` : 'Concluída'}
      </span>
    )
  }

  const dias = nr1DiasEntre(NR1_TODAY, acao.quando)
  const urgencia = nr1UrgenciaPrazo(dias)
  const st = URGENCIA_PRAZO[urgencia]
  const texto = urgencia === 'vencida'
    ? `Vencida há ${Math.abs(dias)} ${Math.abs(dias) === 1 ? 'dia' : 'dias'}`
    : dias === 0
      ? 'Vence hoje'
      : urgencia === 'vencendo'
        ? `Vence em ${dias} ${dias === 1 ? 'dia' : 'dias'}`
        : fmtData(acao.quando)

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-[11px] font-semibold ${st.cls}`}>
      <Icon icon={st.icon} width={12} aria-hidden />
      {texto}
    </span>
  )
}
