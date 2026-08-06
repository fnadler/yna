import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { MngTopBar } from '../../components/MngTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Badge } from '../../components/Badge'
import { Sheet } from '../../components/Sheet'
import { SearchSelect } from '../../components/SearchSelect'
import { FiltrosBar } from '../../components/FiltrosBar'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { mngTicketService } from '../../services/mng'
import { TICKET_TIPO_LABEL, MNG_TODAY } from '../../data/mngMock'
import { AtenderTicket } from './AtenderTicket'
import type { MngTicket, MngTicketStatus } from '../../types'

const NOW = `${MNG_TODAY}T09:00`
const isAtrasada = (t: MngTicket) => t.status !== 'resolvido' && t.prazoEm < NOW
const fmtData = (iso: string) => { const [d] = iso.split('T'); const [, m, dd] = d.split('-'); return `${dd}/${m}` }

const STATUS_TONE: Record<MngTicketStatus, 'primary' | 'warning' | 'success'> = { aberto: 'primary', 'em-andamento': 'warning', resolvido: 'success' }
const STATUS_LABEL: Record<MngTicketStatus, string> = { aberto: 'Aberto', 'em-andamento': 'Em andamento', resolvido: 'Resolvido' }
const TIPO_ICON: Record<MngTicket['tipo'], string> = {
  duvida: 'ph:question-bold', lgpd: 'ph:shield-check-bold', cadastro: 'ph:user-gear-bold', tecnico: 'ph:wrench-bold', queixa: 'ph:warning-bold',
}
const CARDS: { st: MngTicketStatus; icon: string; label: string }[] = [
  { st: 'aberto', icon: 'ph:envelope-open-bold', label: 'Abertos' },
  { st: 'em-andamento', icon: 'ph:hourglass-medium-bold', label: 'Em andamento' },
  { st: 'resolvido', icon: 'ph:check-circle-bold', label: 'Resolvidos' },
]
const selCls = 'w-full rounded border-[1.5px] border-border bg-surface px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-primary'

/* MNG-17 — Suporte e tickets (§8.9). Filtros (empresa, protocolo, período) →
   big numbers por status → lista com destaque de prazo/atraso → atendimento. */
export function Mng17Suporte() {
  const tickets = useService(() => mngTicketService.list(), [])
  const [params] = useSearchParams()
  const [empresa, setEmpresa] = useState('todos')
  const [protocolo, setProtocolo] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [status, setStatus] = useState<MngTicketStatus | 'todos'>(() => {
    const s = params.get('status')
    return s === 'aberto' || s === 'em-andamento' || s === 'resolvido' ? s : 'todos'
  })
  const [aberto, setAberto] = useState<MngTicket | null>(null)

  const dados = tickets.status === 'success' ? tickets.data : []
  const empresaOptions = useMemo(() => [
    { value: 'todos', label: 'Todas' },
    ...[...new Set(dados.map((t) => t.empresa))].sort((a, b) => a.localeCompare(b, 'pt-BR')).map((e) => ({ value: e, label: e })),
  ], [dados])

  // Todos os filtros exceto status — base para os big numbers.
  const baseFiltradas = useMemo(() => dados.filter((t) =>
    (empresa === 'todos' || t.empresa === empresa) &&
    (!protocolo.trim() || t.protocolo.includes(protocolo.trim())) &&
    (!dataInicio || t.abertoEm.slice(0, 10) >= dataInicio) &&
    (!dataFim || t.abertoEm.slice(0, 10) <= dataFim)
  ), [dados, empresa, protocolo, dataInicio, dataFim])

  const lista = useMemo(() => baseFiltradas.filter((t) => status === 'todos' || t.status === status), [baseFiltradas, status])
  const contar = (st: MngTicketStatus) => baseFiltradas.filter((t) => t.status === st).length
  const ativos = [empresa !== 'todos', !!protocolo.trim(), !!dataInicio, !!dataFim].filter(Boolean).length
  const limpar = () => { setEmpresa('todos'); setProtocolo(''); setDataInicio(''); setDataFim(''); setStatus('todos') }

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MngTopBar />
        <PageHeader title="Suporte" subtitle="Tickets técnicos, dúvidas e casos LGPD." className="mt-2 lg:mt-0" />

        {tickets.status === 'loading' && <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}</div>}
        {tickets.status === 'error' && <ErrorState message={tickets.message} onRetry={tickets.reload} />}
        {tickets.status === 'success' && (
          <>
            {/* Filtros */}
            <FiltrosBar ativos={ativos} onLimpar={limpar}>
              <div className="min-w-0 lg:flex-1">
                <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-muted">Empresa</span>
                <SearchSelect value={empresa} onChange={setEmpresa} options={empresaOptions} placeholder="Todas" searchPlaceholder="Buscar empresa…" />
              </div>
              <Campo label="Protocolo" className="lg:w-44">
                <input value={protocolo} onChange={(e) => setProtocolo(e.target.value)} placeholder="Ex.: 2026-000481" className={selCls} />
              </Campo>
              <Campo label="Aberta de" className="lg:w-36">
                <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className={selCls} />
              </Campo>
              <Campo label="Até" className="lg:w-36">
                <input type="date" value={dataFim} min={dataInicio || undefined} onChange={(e) => setDataFim(e.target.value)} className={selCls} />
              </Campo>
            </FiltrosBar>

            {/* Big numbers clicáveis — filtram por status */}
            <div className="mt-4 grid grid-cols-3 gap-2.5">
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
                <Icon icon="ph:x-bold" width={12} aria-hidden /> Filtrando por {STATUS_LABEL[status]} · limpar
              </button>
            )}

            {/* Lista */}
            <div className="mt-4 flex flex-col gap-2">
              {lista.map((t) => {
                const atrasada = isAtrasada(t)
                return (
                  <button key={t.id} onClick={() => setAberto(t)}
                    className={`rounded-lg border bg-surface p-4 text-left transition-colors hover:border-border-strong ${atrasada ? 'border-danger/40' : 'border-border'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300"><Icon icon={TIPO_ICON[t.tipo]} width={18} aria-hidden /></div>
                        <div className="min-w-0">
                          <p className="truncate font-heading text-sm font-semibold text-ink">{t.assunto}</p>
                          <p className="truncate text-[12.5px] text-ink-secondary">{TICKET_TIPO_LABEL[t.tipo]} · {t.solicitante} · {t.empresa}</p>
                        </div>
                      </div>
                      <Badge tone={STATUS_TONE[t.status]}>{STATUS_LABEL[t.status]}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
                      <span className="font-mono text-ink-muted">{t.protocolo}</span>
                      <span className="text-ink-muted"><Icon icon="ph:timer-bold" width={12} className="mr-1 inline" aria-hidden />SLA {t.sla}</span>
                      <span className="text-ink-muted">Aberta {fmtData(t.abertoEm)}</span>
                      {t.status !== 'resolvido' && (
                        atrasada
                          ? <span className="inline-flex items-center gap-1 rounded-pill bg-danger-bg px-2 py-0.5 font-semibold text-danger-ink"><Icon icon="ph:warning-bold" width={11} aria-hidden /> Atrasada · venceu {fmtData(t.prazoEm)}</span>
                          : <span className="inline-flex items-center gap-1 rounded-pill bg-success-bg px-2 py-0.5 font-medium text-success-ink"><Icon icon="ph:check-bold" width={11} aria-hidden /> No prazo · até {fmtData(t.prazoEm)}</span>
                      )}
                    </div>
                  </button>
                )
              })}
              {lista.length === 0 && <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-sm text-ink-secondary">Nenhuma solicitação para os filtros selecionados.</div>}
            </div>
          </>
        )}
      </div>

      <Sheet open={aberto !== null} onClose={() => setAberto(null)} title="Solicitação de suporte" icon="ph:lifebuoy-bold" size="md">
        {aberto && <AtenderTicket ticket={aberto} atrasada={isAtrasada(aberto)} onFeito={() => { setAberto(null); tickets.reload() }} />}
      </Sheet>
    </div>
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
