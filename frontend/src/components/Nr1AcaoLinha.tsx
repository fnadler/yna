import { Icon } from '@iconify/react'
import { Badge } from './Badge'
import { PrazoBadge } from './PrazoBadge'
import { Nr1DepartamentosPopover } from './Nr1DepartamentosPopover'
import { ACAO_STATUS } from '../lib/nr1'
import { nr1RotuloRisco } from './Nr1AcaoForm'
import type { Nr1Acao, Nr1RiscoInventario } from '../types'

/** Colunas da linha de uma ação no desktop: prazo, a ação em si (título +
   risco + responsável), os departamentos envolvidos (o "Onde", com a lista
   num popover, como no Inventário) e status. Extraído de
   `NR1RhPlanoAcao.tsx` (visualização "Lista") para ser reaproveitado onde
   mais alguém precisar mostrar ações no mesmo formato — hoje, o bloco "Seus
   planos de ação" da Visão geral (`NR1RhCockpit.tsx`), que antes usava um
   `OptionCard` genérico, sem prazo ou risco de origem visíveis. */
export const LISTA_GRID_COLS = 'grid-cols-[140px_1fr_130px_120px]'

/** Departamentos do "Onde" da ação — gravado como nomes separados por
   vírgula (ver `AcaoForm`). */
const departamentosDaAcao = (acao: Nr1Acao) => acao.onde.split(',').map((x) => x.trim()).filter(Boolean)

/** Linha de uma ação — prazo, a ação em si (título em destaque e, menor, o
   domínio + risco de origem, e o responsável), departamentos e status. No desktop, colunas alinhadas com
   `LISTA_GRID_COLS`; abaixo de `lg`, os mesmos dados em pilha compacta. */
export function AcaoLinha({ acao, risco, onClick }: {
  acao: Nr1Acao
  risco?: Nr1RiscoInventario
  onClick: () => void
}) {
  const st = ACAO_STATUS[acao.status]
  const departamentos = departamentosDaAcao(acao)

  const riscoTexto = risco && (
    <p className="min-w-0 truncate text-[11.5px] text-ink-secondary" title={nr1RotuloRisco(risco)}>
      <span className="font-medium text-ink">{risco.dimensao}</span> · {risco.fator}
    </p>
  )

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      className="cursor-pointer rounded-lg border border-border bg-surface p-3.5 transition-colors hover:border-border-strong hover:bg-surface-hover"
    >
      {/* Desktop — colunas */}
      <div className={`hidden items-center gap-3 lg:grid ${LISTA_GRID_COLS}`}>
        <div><PrazoBadge acao={acao} /></div>
        <div className="min-w-0">
          <p className="truncate font-heading text-[13.5px] font-semibold text-ink">
            {acao.oQue}
            {acao.versao > 1 && <span className="ml-1.5 text-[10.5px] font-normal text-ink-muted">v{acao.versao}</span>}
          </p>
          {riscoTexto}
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-muted">
            <Icon icon="ph:user-bold" width={10} aria-hidden />{acao.quem}
          </p>
        </div>
        <Nr1DepartamentosPopover nomes={departamentos} titulo="Departamentos envolvidos" />
        <div><Badge tone={st.tone}>{st.label}</Badge></div>
      </div>

      {/* Mobile/tablet — pilha compacta */}
      <div className="flex items-start gap-3 lg:hidden">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="min-w-0 truncate font-heading text-[13.5px] font-semibold text-ink">
              {acao.oQue}
              {acao.versao > 1 && <span className="ml-1.5 text-[10.5px] font-normal text-ink-muted">v{acao.versao}</span>}
            </p>
            <Badge tone={st.tone} className="shrink-0">{st.label}</Badge>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11.5px] text-ink-secondary">
            {riscoTexto}
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <Icon icon="ph:user-bold" width={11} aria-hidden />{acao.quem}
            </span>
            <PrazoBadge acao={acao} />
            <Nr1DepartamentosPopover nomes={departamentos} titulo="Departamentos envolvidos" />
          </div>
        </div>
        <Icon icon="ph:caret-right-bold" width={14} className="mt-1.5 shrink-0 text-ink-muted" aria-hidden />
      </div>
    </div>
  )
}
