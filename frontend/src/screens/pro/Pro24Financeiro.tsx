import { useState } from 'react'
import { Icon } from '@iconify/react'
import { ProTopBar } from '../../components/ProTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { StatTile } from '../../components/StatTile'
import { Modal } from '../../components/Modal'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { proFinanceService } from '../../services/pro'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export function Pro24Financeiro() {
  const summary = useService(() => proFinanceService.summary(), [])
  const recebimentos = useService(() => proFinanceService.recebimentos(), [])
  const [antecipar, setAntecipar] = useState(false)
  const [antecipado, setAntecipado] = useState(false)

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <ProTopBar />
        <PageHeader title="Financeiro" subtitle="Seus recebimentos, com clareza." className="mt-2 lg:mt-0" />

        {summary.status === 'loading' && <Skeleton className="h-40 w-full rounded-lg" />}
        {summary.status === 'error' && <ErrorState message={summary.message} onRetry={summary.reload} />}
        {summary.status === 'success' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <StatTile icon="ph:currency-circle-dollar-bold" value={brl(summary.data.aReceber)} label="A receber" />
              <StatTile icon="ph:calendar-check-bold" value={String(summary.data.sessoesNoMes)} label="Sessões no mês" />
            </div>

            {/* Antecipação */}
            <div className="mt-4 rounded-lg border border-primary/30 bg-primary-50 p-5">
              <div className="flex items-center gap-2">
                <Icon icon="ph:lightning-bold" width={18} className="text-primary dark:text-primary-300" aria-hidden />
                <p className="font-heading text-sm font-semibold text-ink">Antecipação disponível</p>
              </div>
              <p className="mt-1 text-2xl font-bold text-ink">{brl(summary.data.antecipacaoDisponivel)}</p>
              <p className="mt-0.5 text-[13px] text-ink-secondary">
                Cadência <span className="font-semibold">{summary.data.cadencia}</span> · taxa {summary.data.taxaAntecipacao.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}%
              </p>
              <Button
                size="sm"
                className="mt-3"
                disabled={antecipado}
                iconLeft={antecipado ? 'ph:check-bold' : 'ph:lightning-bold'}
                onClick={() => setAntecipar(true)}
              >
                {antecipado ? 'Antecipação solicitada' : 'Antecipar recebíveis'}
              </Button>
            </div>
          </>
        )}

        {/* Histórico */}
        <h2 className="mb-3 mt-8 text-[15px] font-semibold text-ink">Histórico</h2>
        {recebimentos.status === 'loading' && (
          <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div>
        )}
        {recebimentos.status === 'error' && <ErrorState message={recebimentos.message} onRetry={recebimentos.reload} />}
        {recebimentos.status === 'success' && (
          <div className="flex flex-col gap-2">
            {recebimentos.data.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
                <div className="flex-1">
                  <p className="font-heading text-sm font-semibold text-ink">{brl(r.valor)}</p>
                  <p className="font-mono text-[12.5px] text-ink-secondary">{r.periodo}</p>
                </div>
                {r.nf && (
                  <button className="flex items-center gap-1 text-[12.5px] font-medium text-primary transition-colors hover:underline dark:text-primary-300">
                    <Icon icon="ph:file-text-bold" width={14} aria-hidden /> NF
                  </button>
                )}
                <Badge tone={r.status === 'pago' ? 'success' : 'neutral'}>{r.status === 'pago' ? 'Pago' : 'Previsto'}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmação de antecipação */}
      <Modal open={antecipar} title="Antecipar recebíveis" onClose={() => setAntecipar(false)}>
        {summary.status === 'success' && (
          <>
            <p className="mb-4 text-sm leading-relaxed">
              Você receberá <span className="font-semibold text-ink">{brl(summary.data.antecipacaoDisponivel)}</span> com taxa de{' '}
              <span className="font-semibold text-ink">{summary.data.taxaAntecipacao.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}%</span>. Quanto menor o prazo, maior a taxa.
            </p>
            <Button fullWidth onClick={() => { setAntecipado(true); setAntecipar(false) }}>
              Confirmar antecipação
            </Button>
          </>
        )}
      </Modal>
    </div>
  )
}
