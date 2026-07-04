import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { Select } from '../../components/Select'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { rhFinanceiroService } from '../../services/rh'
import type { RhParcela, RhParcelaStatus } from '../../types'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const fmtData = (iso?: string) => { if (!iso) return '—'; const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}` }
const selCls = 'w-full rounded border-[1.5px] border-border bg-surface px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-primary'

const STATUS: Record<RhParcelaStatus, { label: string; tone: 'success' | 'primary' | 'danger' | 'neutral'; icon: string }> = {
  pago: { label: 'Pago', tone: 'success', icon: 'ph:check-circle-bold' },
  'a-vencer': { label: 'A vencer', tone: 'primary', icon: 'ph:calendar-dot-bold' },
  'em-atraso': { label: 'Em atraso', tone: 'danger', icon: 'ph:warning-bold' },
  futura: { label: 'A vencer', tone: 'neutral', icon: 'ph:calendar-blank-bold' },
}

/* RH-18 — Financeiro da empresa: parcelas dos contratos, com download de NF/boleto
   e registro de pagamento. */
export function RH18Financeiro() {
  const parcelasQ = useService(() => rhFinanceiroService.parcelas(), [])
  const [filtro, setFiltro] = useState<'abertas' | 'pagas'>('abertas')
  const [contrato, setContrato] = useState('todos')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [pagar, setPagar] = useState<RhParcela | null>(null)
  const [detalhe, setDetalhe] = useState<RhParcela | null>(null)

  const dados = parcelasQ.status === 'success' ? parcelasQ.data : []
  const contratoOptions = useMemo(() => [
    { value: 'todos', label: 'Todos os contratos' },
    ...[...new Set(dados.map((p) => p.contrato))].sort().map((c) => ({ value: c, label: c })),
  ], [dados])

  // Filtros de contrato + período (base para os big numbers).
  const baseFiltradas = useMemo(() => dados.filter((p) =>
    (contrato === 'todos' || p.contrato === contrato) &&
    (!dataInicio || p.vencimento >= dataInicio) &&
    (!dataFim || p.vencimento <= dataFim)
  ), [dados, contrato, dataInicio, dataFim])

  const lista = useMemo(() => baseFiltradas.filter((p) => (filtro === 'pagas' ? p.status === 'pago' : p.status !== 'pago')), [baseFiltradas, filtro])
  const nPagas = baseFiltradas.filter((p) => p.status === 'pago').length
  const nAbertas = baseFiltradas.filter((p) => p.status !== 'pago').length

  const CARDS = [
    { key: 'pagas' as const, icon: 'ph:check-circle-bold', label: 'Parcelas pagas', valor: nPagas },
    { key: 'abertas' as const, icon: 'ph:clock-countdown-bold', label: 'Parcelas abertas', valor: nAbertas },
  ]

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />
        <PageHeader title="Financeiro" subtitle="Parcelas e pagamentos dos seus contratos." className="mt-2 lg:mt-0" />

        {parcelasQ.status === 'loading' && <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}</div>}
        {parcelasQ.status === 'error' && <ErrorState message={parcelasQ.message} onRetry={parcelasQ.reload} />}
        {parcelasQ.status === 'success' && (
          <>
            {/* Big numbers clicáveis */}
            <div className="grid grid-cols-2 gap-2.5">
              {CARDS.map((c) => {
                const on = filtro === c.key
                return (
                  <button key={c.key} onClick={() => setFiltro(c.key)} aria-pressed={on}
                    className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${on ? 'border-primary bg-primary-50 dark:bg-primary-50/10' : 'border-border bg-surface hover:border-border-strong'}`}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300"><Icon icon={c.icon} width={20} aria-hidden /></div>
                    <div className="min-w-0">
                      <p className="font-heading text-2xl font-bold leading-none text-ink">{c.valor}</p>
                      <p className="mt-1 text-[12.5px] leading-tight text-ink-secondary">{c.label}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Filtros */}
            <div className="mt-4 flex flex-col gap-2 rounded-lg border border-border bg-surface p-3 sm:flex-row sm:items-end">
              <div className="min-w-0 sm:flex-1">
                <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-muted">Contrato</span>
                <Select value={contrato} options={contratoOptions} onChange={setContrato} ariaLabel="Filtrar por contrato" />
              </div>
              <Campo label="Vencimento de" className="sm:w-36"><input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className={selCls} /></Campo>
              <Campo label="Até" className="sm:w-36"><input type="date" value={dataFim} min={dataInicio || undefined} onChange={(e) => setDataFim(e.target.value)} className={selCls} /></Campo>
              {(contrato !== 'todos' || dataInicio || dataFim) && (
                <button onClick={() => { setContrato('todos'); setDataInicio(''); setDataFim('') }} className="shrink-0 rounded-lg px-2.5 py-1.5 text-left text-[12.5px] font-medium text-ink-secondary transition-colors hover:text-ink sm:self-end sm:pb-2">Limpar</button>
              )}
            </div>

            {/* Lista de parcelas (vencimento crescente) */}
            <div className="mt-4 flex flex-col gap-2">
              {lista.map((p) => {
                const st = STATUS[p.status]
                return (
                  <div key={p.id} className="rounded-lg border border-border bg-surface p-4">
                    <div className="grid grid-cols-2 items-center gap-x-4 gap-y-3 lg:grid-cols-[minmax(0,1fr)_120px_140px_212px]">
                      {/* Info */}
                      <div className="col-span-2 min-w-0 lg:col-span-1">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300"><Icon icon="ph:receipt-bold" width={20} aria-hidden /></div>
                          <div className="min-w-0">
                            <p className="truncate font-heading text-sm font-semibold text-ink">Parcela {p.numero}/{p.totalParcelas}</p>
                            <p className="truncate text-[12.5px] text-ink-secondary">Contrato {p.contrato}</p>
                          </div>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink-muted">
                          <span><Icon icon="ph:calendar-dot-bold" width={12} className="mr-1 inline" aria-hidden />Venc. {fmtData(p.vencimento)}</span>
                          {p.status === 'pago' && <span className="text-success-ink"><Icon icon="ph:check-bold" width={12} className="mr-1 inline" aria-hidden />Pago em {fmtData(p.dataPagamento)}</span>}
                          {p.status === 'futura' && <span>NF e boleto no mês do vencimento</span>}
                        </div>
                      </div>

                      {/* Valor */}
                      <p className="font-heading text-sm font-semibold tabular-nums text-ink lg:text-right">{brl(p.valor)}</p>

                      {/* Status */}
                      <div className="flex justify-end lg:justify-start"><Badge tone={st.tone} icon={st.icon}>{st.label}</Badge></div>

                      {/* Ação */}
                      <div className="col-span-2 flex flex-wrap gap-2 lg:col-span-1 lg:justify-end">
                        {p.status === 'pago' && <Button size="sm" variant="secondary" className="w-full lg:w-auto" iconLeft="ph:eye-bold" onClick={() => setDetalhe(p)}>Ver detalhes</Button>}
                        {(p.status === 'a-vencer' || p.status === 'em-atraso') && <Button size="sm" className="w-full lg:w-auto" iconLeft="ph:money-bold" onClick={() => setPagar(p)}>Informar pagamento</Button>}
                        {p.status === 'futura' && <span className="text-[12px] text-ink-muted lg:text-right">Aguardando geração</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
              {lista.length === 0 && <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-sm text-ink-secondary">Nenhuma parcela {filtro === 'pagas' ? 'paga' : 'aberta'} para os filtros selecionados.</div>}
            </div>
          </>
        )}
      </div>

      <PagarModal parcela={pagar} onClose={() => setPagar(null)} onDone={() => { setPagar(null); parcelasQ.reload() }} />
      <DetalheModal parcela={detalhe} onClose={() => setDetalhe(null)} />
    </div>
  )
}

/* ── Modal: informar pagamento (a-vencer / em-atraso) ── */
function PagarModal({ parcela, onClose, onDone }: { parcela: RhParcela | null; onClose: () => void; onDone: () => void }) {
  const [data, setData] = useState('')
  const [valor, setValor] = useState<number>(0)
  const [comprovante, setComprovante] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  useEffect(() => { if (parcela) { setData(''); setValor(parcela.valor); setComprovante(null); setSalvando(false) } }, [parcela?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const valido = !!data && valor > 0 && !!comprovante

  const confirmar = async () => {
    if (!parcela || !valido) return
    setSalvando(true)
    await rhFinanceiroService.informarPagamento(parcela.id, data, valor, comprovante!)
    onDone()
  }

  return (
    <Modal open={parcela !== null} title="Informar pagamento" onClose={onClose}>
      {parcela && (
        <div className="flex flex-col gap-4">
          <p className="text-[13px] text-ink-secondary">Contrato {parcela.contrato} · Parcela {parcela.numero}/{parcela.totalParcelas} · vencimento {fmtData(parcela.vencimento)}</p>

          {/* Downloads da cobrança */}
          <div className="flex flex-col gap-2">
            {parcela.notaFiscal && <BaixarLinha label="Nota fiscal" arquivo={parcela.notaFiscal} icon="ph:file-text-bold" />}
            {parcela.boleto && <BaixarLinha label="Boleto de pagamento" arquivo={parcela.boleto} icon="ph:barcode-bold" />}
          </div>

          <div className="border-t border-border pt-4">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-ink">Data do pagamento</span>
              <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-full rounded border-[1.5px] border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary" />
            </label>
            <label className="mt-3 block">
              <span className="mb-1.5 block text-[13px] font-semibold text-ink">Valor pago</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-secondary">R$</span>
                <input type="number" value={Number.isFinite(valor) ? valor : ''} onChange={(e) => setValor(e.target.valueAsNumber)} className="w-full rounded border-[1.5px] border-border bg-surface py-2 pl-9 pr-3 text-sm font-semibold text-ink outline-none focus:border-primary" />
              </div>
            </label>
            <div className="mt-3">
              <span className="mb-1.5 block text-[13px] font-semibold text-ink">Comprovante de pagamento</span>
              <Upload arquivo={comprovante} onSet={() => setComprovante(`comprovante-${parcela.id}.pdf`)} onRemove={() => setComprovante(null)} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button fullWidth disabled={!valido || salvando} iconLeft="ph:check-bold" onClick={confirmar}>{salvando ? 'Registrando…' : 'Confirmar pagamento'}</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

/* ── Modal: detalhes da parcela paga ── */
function DetalheModal({ parcela, onClose }: { parcela: RhParcela | null; onClose: () => void }) {
  return (
    <Modal open={parcela !== null} title="Detalhes do pagamento" onClose={onClose}>
      {parcela && (
        <div className="flex flex-col gap-4">
          <p className="text-[13px] text-ink-secondary">Contrato {parcela.contrato} · Parcela {parcela.numero}/{parcela.totalParcelas}</p>
          <dl className="flex flex-col divide-y divide-border rounded-lg border border-border">
            <Linha label="Valor da parcela" valor={brl(parcela.valor)} />
            <Linha label="Valor pago" valor={brl(parcela.valorPago ?? parcela.valor)} strong />
            <Linha label="Data do pagamento" valor={fmtData(parcela.dataPagamento)} />
            <Linha label="Vencimento" valor={fmtData(parcela.vencimento)} />
          </dl>
          <div className="flex flex-col gap-2">
            {parcela.notaFiscal && <BaixarLinha label="Nota fiscal" arquivo={parcela.notaFiscal} icon="ph:file-text-bold" />}
            {parcela.comprovante && <BaixarLinha label="Comprovante de pagamento" arquivo={parcela.comprovante} icon="ph:receipt-bold" />}
          </div>
          <Button fullWidth onClick={onClose}>Fechar</Button>
        </div>
      )}
    </Modal>
  )
}

function Linha({ label, valor, strong }: { label: string; valor: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5">
      <dt className="text-[13px] text-ink-secondary">{label}</dt>
      <dd className={`text-sm tabular-nums ${strong ? 'font-bold text-ink' : 'font-medium text-ink'}`}>{valor}</dd>
    </div>
  )
}

/* Linha de download de um arquivo (mock). */
function BaixarLinha({ label, arquivo, icon }: { label: string; arquivo: string; icon: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2.5">
      <span className="flex min-w-0 items-center gap-2 text-[13px] text-ink">
        <Icon icon={icon} width={17} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
        <span className="min-w-0"><span className="block font-medium">{label}</span><span className="block truncate text-[11.5px] text-ink-muted">{arquivo}</span></span>
      </span>
      <button onClick={() => { /* download simulado */ }} className="shrink-0 rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-primary transition-colors hover:bg-surface-hover dark:text-primary-300">Baixar</button>
    </div>
  )
}

/* Upload simples (mock) de um arquivo. */
function Upload({ arquivo, onSet, onRemove }: { arquivo: string | null; onSet: () => void; onRemove: () => void }) {
  return arquivo ? (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 text-[13px]">
      <span className="flex min-w-0 items-center gap-2"><Icon icon="ph:file-pdf-bold" width={17} className="shrink-0 text-primary dark:text-primary-300" aria-hidden /><span className="truncate">{arquivo}</span></span>
      <button onClick={onRemove} className="shrink-0 text-ink-muted hover:text-ink" aria-label="Remover"><Icon icon="ph:x-bold" width={15} aria-hidden /></button>
    </div>
  ) : (
    <button onClick={onSet} className="flex w-full items-center justify-center gap-2 rounded border-[1.5px] border-dashed border-border bg-surface px-4 py-3 text-[13px] font-medium text-ink-secondary transition-colors hover:border-primary hover:text-ink">
      <Icon icon="ph:upload-simple-bold" width={16} aria-hidden /> Anexar comprovante (PDF)
    </button>
  )
}

function Campo({ label, className = '', children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-muted">{label}</span>
      {children}
    </label>
  )
}
