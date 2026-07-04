import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { MngTopBar } from '../../components/MngTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Sheet } from '../../components/Sheet'
import { SearchSelect } from '../../components/SearchSelect'
import { FiltrosBar } from '../../components/FiltrosBar'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { mngNotaService } from '../../services/mng'
import { ConferirNota } from './ConferirNota'
import { EmpresasFinanceiroView } from './Mng16FinanceiroEmpresas'
import type { MngNota, MngNotaStatus } from '../../types'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const brl2 = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtData = (iso?: string) => { if (!iso) return '—'; const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}` }

const STATUS: Record<MngNotaStatus, { label: string; tone: 'warning' | 'neutral' | 'danger' | 'success' | 'primary' }> = {
  'em-analise': { label: 'Para conferência', tone: 'warning' },
  'requer-ajuste': { label: 'Requer ajuste', tone: 'danger' },
  'para-pagamento': { label: 'Para pagamento', tone: 'primary' },
  paga: { label: 'Paga', tone: 'success' },
}
const CARDS: { st: MngNotaStatus; icon: string; label: string }[] = [
  { st: 'em-analise', icon: 'ph:hourglass-medium-bold', label: 'Para conferência' },
  { st: 'requer-ajuste', icon: 'ph:warning-bold', label: 'Requer ajuste' },
  { st: 'para-pagamento', icon: 'ph:hand-coins-bold', label: 'Para pagamento' },
  { st: 'paga', icon: 'ph:check-circle-bold', label: 'Pagas' },
]
const selCls = 'w-full rounded border-[1.5px] border-border bg-surface px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-primary'

/* MNG-16 — Financeiro do backoffice (§8.13). Duas visões: Profissionais (notas
   fiscais dos profissionais) e Empresas (parcelas dos contratos). */
export function Mng16Financeiro() {
  const [params] = useSearchParams()
  const [aba, setAba] = useState<'profissionais' | 'empresas'>(params.get('view') === 'empresas' ? 'empresas' : 'profissionais')
  const statusInicial = params.get('status') ?? undefined
  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MngTopBar />
        <PageHeader title="Financeiro" subtitle="Notas dos profissionais e parcelas das empresas." className="mt-2 lg:mt-0" />

        {/* Divisão da visão: Profissionais / Empresas */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {([['profissionais', 'Profissionais', 'ph:identification-badge-bold'], ['empresas', 'Empresas', 'ph:buildings-bold']] as const).map(([key, label, icon]) => {
            const ativo = aba === key
            return (
              <button key={key} onClick={() => setAba(key)} aria-pressed={ativo}
                className={`flex items-center gap-2 rounded-pill border-[1.5px] px-4 py-2 font-heading text-sm font-medium transition-colors ${ativo ? 'border-primary bg-primary-50 text-primary dark:text-primary-300' : 'border-border bg-surface text-ink-secondary hover:border-border-strong hover:text-ink'}`}>
                <Icon icon={icon} width={16} aria-hidden /> {label}
              </button>
            )
          })}
        </div>

        {aba === 'profissionais' ? <ProfissionaisView initialStatus={statusInicial} /> : <EmpresasFinanceiroView initialStatus={statusInicial} />}
      </div>
    </div>
  )
}

/* Visão Profissionais — notas fiscais dos profissionais. Filtros (profissional,
   período de recebimento) → big numbers clicáveis por status → lista. */
function ProfissionaisView({ initialStatus }: { initialStatus?: string }) {
  const notas = useService(() => mngNotaService.list(), [])
  const [prof, setProf] = useState('todos')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [status, setStatus] = useState<MngNotaStatus | 'todos'>(
    initialStatus === 'em-analise' || initialStatus === 'requer-ajuste' || initialStatus === 'para-pagamento' || initialStatus === 'paga' ? initialStatus : 'todos',
  )
  const [analisar, setAnalisar] = useState<MngNota | null>(null)

  const dados = notas.status === 'success' ? notas.data : []
  const profOptions = useMemo(() => [
    { value: 'todos', label: 'Todos' },
    ...[...new Set(dados.map((n) => n.profissional))].sort((a, b) => a.localeCompare(b, 'pt-BR')).map((p) => ({ value: p, label: p })),
  ], [dados])

  // Todos os filtros exceto status — base para os big numbers.
  const baseFiltradas = useMemo(() => dados.filter((n) =>
    (prof === 'todos' || n.profissional === prof) &&
    (!dataInicio || (n.enviadaEm ?? '') >= dataInicio) &&
    (!dataFim || (n.enviadaEm ?? '') <= dataFim)
  ), [dados, prof, dataInicio, dataFim])

  const lista = useMemo(() => baseFiltradas.filter((n) => status === 'todos' || n.status === status), [baseFiltradas, status])
  const contar = (st: MngNotaStatus) => baseFiltradas.filter((n) => n.status === st).length
  const ativos = [prof !== 'todos', !!dataInicio, !!dataFim].filter(Boolean).length
  const limpar = () => { setProf('todos'); setDataInicio(''); setDataFim(''); setStatus('todos') }
  const emAnalise = dados.filter((n) => n.status === 'em-analise').length

  const reenviar = async (n: MngNota) => { await mngNotaService.reenviar(n.id); notas.reload() }

  return (
    <>
        {notas.status === 'loading' && <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}</div>}
        {notas.status === 'error' && <ErrorState message={notas.message} onRetry={notas.reload} />}
        {notas.status === 'success' && (
          <>
            {emAnalise > 0 && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning-bg px-4 py-2.5 text-[13px] text-warning-ink">
                <Icon icon="ph:hourglass-medium-bold" width={16} aria-hidden /> {emAnalise} nota(s) aguardando sua conferência.
              </div>
            )}

            {/* Filtros */}
            <FiltrosBar ativos={ativos} onLimpar={limpar}>
              <div className="min-w-0 lg:flex-1">
                <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-muted">Profissional</span>
                <SearchSelect value={prof} onChange={setProf} options={profOptions} placeholder="Todos" searchPlaceholder="Buscar profissional…" />
              </div>
              <Campo label="Recebida de" className="lg:w-40">
                <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className={selCls} />
              </Campo>
              <Campo label="Até" className="lg:w-40">
                <input type="date" value={dataFim} min={dataInicio || undefined} onChange={(e) => setDataFim(e.target.value)} className={selCls} />
              </Campo>
            </FiltrosBar>

            {/* Big numbers clicáveis — filtram por status */}
            <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              {CARDS.map((c) => {
                const on = status === c.st
                return (
                  <button key={c.st} onClick={() => setStatus((cur) => (cur === c.st ? 'todos' : c.st))} aria-pressed={on}
                    className={`flex flex-col items-center gap-1 rounded-lg border p-4 text-center transition-colors ${on ? 'border-primary bg-primary-50 dark:bg-primary-50/10' : 'border-border bg-surface hover:border-border-strong'}`}>
                    <Icon icon={c.icon} width={20} className="text-primary dark:text-primary-300" aria-hidden />
                    <p className="text-2xl font-bold text-ink">{contar(c.st)}</p>
                    <p className="text-xs text-ink-secondary">{c.label}</p>
                  </button>
                )
              })}
            </div>
            {status !== 'todos' && (
              <button onClick={() => setStatus('todos')} className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium text-ink-secondary transition-colors hover:text-ink">
                <Icon icon="ph:x-bold" width={12} aria-hidden /> Filtrando por {STATUS[status].label} · limpar
              </button>
            )}

            {/* Lista */}
            <div className="mt-4 flex flex-col gap-2">
              {lista.map((n) => {
                const st = STATUS[n.status]
                return (
                  <div key={n.id} className="rounded-lg border border-border bg-surface p-4">
                    {/* Colunas fixas no desktop → dados alinhados para escaneio */}
                    <div className="grid grid-cols-2 items-center gap-x-4 gap-y-3 lg:grid-cols-[minmax(0,1fr)_112px_150px_186px]">
                      {/* Info */}
                      <div className="col-span-2 min-w-0 lg:col-span-1">
                        <p className="flex flex-wrap items-center gap-1.5 font-heading text-sm font-semibold text-ink">
                          <Icon icon="ph:receipt-bold" width={16} className="text-primary dark:text-primary-300" aria-hidden />
                          {n.numero ? `Nota ${n.numero}` : 'A emitir'}
                          {n.origem === 'antecipacao' && (
                            <span className="inline-flex items-center gap-1 rounded-pill bg-warning-bg px-2 py-0.5 text-[10.5px] font-semibold text-warning-ink"><Icon icon="ph:lightning-bold" width={11} aria-hidden /> Antecipação</span>
                          )}
                        </p>
                        <p className="mt-0.5 text-[12.5px] text-ink-secondary">{n.profissional} · {n.origem === 'antecipacao' ? 'Antecipação de recebíveis' : 'Fechamento'} · {n.referencia}</p>
                        {n.enviadaEm && <p className="mt-1 text-[12px] text-ink-muted">Recebida em {fmtData(n.enviadaEm)}</p>}
                        {n.status === 'requer-ajuste' && n.motivoAjuste && <p className="mt-1 text-[12px] text-danger-ink">Pendência: {n.motivoAjuste}</p>}
                        {n.status === 'paga' && n.pagamento && <p className="mt-1 text-[12px] text-success-ink">Pago em {fmtData(n.pagamento.em)}</p>}
                      </div>

                      {/* Valor (+ taxa de antecipação) */}
                      <div className="lg:text-right">
                        <p className="font-heading text-sm font-semibold tabular-nums text-ink">{brl(n.valor)}</p>
                        {n.origem === 'antecipacao' && n.valorTaxa != null && (
                          <p className="mt-0.5 text-[11px] font-medium tabular-nums text-warning-ink">taxa {brl2(n.valorTaxa)}{n.taxaPct != null ? ` · ${n.taxaPct.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}%` : ''}</p>
                        )}
                      </div>

                      {/* Status */}
                      <div className="flex justify-end lg:justify-start"><Badge tone={st.tone}>{st.label}</Badge></div>

                      {/* Ação */}
                      <div className="col-span-2 lg:col-span-1 lg:justify-self-end">
                        {n.status === 'em-analise' && <Button size="sm" className="w-full lg:w-auto" iconLeft="ph:magnifying-glass-bold" onClick={() => setAnalisar(n)}>Conferir</Button>}
                        {n.status === 'para-pagamento' && <Button size="sm" className="w-full lg:w-auto" iconLeft="ph:hand-coins-bold" onClick={() => setAnalisar(n)}>Registrar pagamento</Button>}
                        {n.status === 'requer-ajuste' && <Button size="sm" variant="secondary" className="w-full lg:w-auto" iconLeft="ph:arrow-counter-clockwise-bold" onClick={() => reenviar(n)}>Simular reenvio</Button>}
                        {n.status === 'paga' && <Button size="sm" variant="secondary" className="w-full lg:w-auto" iconLeft="ph:file-pdf-bold" onClick={() => { /* download simulado */ }}>Comprovante</Button>}
                      </div>
                    </div>
                  </div>
                )
              })}
              {lista.length === 0 && <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-sm text-ink-secondary">Nenhuma nota para os filtros selecionados.</div>}
            </div>
          </>
        )}

      <Sheet open={analisar !== null} onClose={() => setAnalisar(null)} title={analisar?.status === 'para-pagamento' ? 'Registrar pagamento' : 'Conferir nota fiscal'} icon="ph:receipt-bold" size="md">
        {analisar && <ConferirNota nota={analisar} onFeito={() => { setAnalisar(null); notas.reload() }} />}
      </Sheet>
    </>
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
