import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { MngTopBar } from '../../components/MngTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { FiltrosBar } from '../../components/FiltrosBar'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { mngSessaoService } from '../../services/mng'
import type { MngSessao, MngSessaoStatus } from '../../types'

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const CANCELADO_POR: Record<'profissional' | 'beneficiario' | 'yna', string> = { profissional: 'Profissional', beneficiario: 'Beneficiário', yna: 'YNA (backoffice)' }
const fmtDataHora = (iso: string) => { const [d, t] = iso.split('T'); const [y, m, dd] = d.split('-'); return `${dd}/${m}/${y}${t ? ` às ${t}` : ''}` }

const STATUS_TONE: Record<MngSessaoStatus, 'success' | 'primary' | 'danger' | 'neutral'> = {
  realizada: 'success', agendada: 'primary', 'nao-realizada': 'danger', cancelada: 'neutral',
}
const STATUS_LABEL: Record<MngSessaoStatus, string> = {
  realizada: 'Realizada', agendada: 'Agendada', 'nao-realizada': 'Não realizada', cancelada: 'Cancelada',
}
type StatusFiltro = 'todos' | MngSessaoStatus
type AtrasoFiltro = 'todos' | 'com' | 'sem'

/* Big numbers clicáveis — filtram por status. */
const CARDS: { st: MngSessaoStatus; icon: string; label: string }[] = [
  { st: 'agendada', icon: 'ph:calendar-dot-bold', label: 'Agendadas' },
  { st: 'realizada', icon: 'ph:check-circle-bold', label: 'Realizadas' },
  { st: 'cancelada', icon: 'ph:x-circle-bold', label: 'Canceladas' },
  { st: 'nao-realizada', icon: 'ph:warning-circle-bold', label: 'Não realizadas' },
]

const selCls = 'w-full rounded border-[1.5px] border-border bg-surface px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-primary'

/* MNG-13 — Painel de controle de sessões (§8.11). Filtros globais no topo
   (profissional, empresa, status, período e atraso) → big numbers derivados →
   lista em cards (data/profissional/horários/duração/atraso em destaque). */
export function Mng13Sessoes() {
  const sessoes = useService(() => mngSessaoService.list(), [])
  const [params] = useSearchParams()
  const [prof, setProf] = useState('todos')
  const [empresa, setEmpresa] = useState('todos')
  const [status, setStatus] = useState<StatusFiltro>(() => {
    const s = params.get('status')
    return s === 'agendada' || s === 'realizada' || s === 'nao-realizada' || s === 'cancelada' ? s : 'todos'
  })
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [atraso, setAtraso] = useState<AtrasoFiltro>('todos')
  const [cancelSel, setCancelSel] = useState<MngSessao | null>(null)

  const dados = sessoes.status === 'success' ? sessoes.data : []
  const profissionais = useMemo(() => [...new Set(dados.map((s) => s.profissional))], [dados])
  const empresas = useMemo(() => [...new Set(dados.map((s) => s.empresa))], [dados])

  // Conjunto com todos os filtros exceto status — base para os big numbers.
  const baseFiltradas = useMemo(() => dados.filter((s) =>
    (prof === 'todos' || s.profissional === prof) &&
    (empresa === 'todos' || s.empresa === empresa) &&
    (!dataInicio || s.data >= dataInicio) &&
    (!dataFim || s.data <= dataFim) &&
    (atraso === 'todos' || (atraso === 'com' ? s.atrasoMin > 0 : s.atrasoMin === 0))
  ), [dados, prof, empresa, dataInicio, dataFim, atraso])

  const filtradas = useMemo(() => baseFiltradas.filter((s) => status === 'todos' || s.status === status), [baseFiltradas, status])

  const contar = (st: MngSessaoStatus) => baseFiltradas.filter((s) => s.status === st).length
  const ativos = [prof !== 'todos', empresa !== 'todos', !!dataInicio, !!dataFim, atraso !== 'todos'].filter(Boolean).length
  const toggleStatus = (st: MngSessaoStatus) => setStatus((cur) => (cur === st ? 'todos' : st))
  const limpar = () => { setProf('todos'); setEmpresa('todos'); setStatus('todos'); setDataInicio(''); setDataFim(''); setAtraso('todos') }

  const campos = (
    <>
      <Campo label="Profissional">
        <select value={prof} onChange={(e) => setProf(e.target.value)} className={selCls}>
          <option value="todos">Todos</option>
          {profissionais.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </Campo>
      <Campo label="Empresa">
        <select value={empresa} onChange={(e) => setEmpresa(e.target.value)} className={selCls}>
          <option value="todos">Todas</option>
          {empresas.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </Campo>
      <Campo label="De">
        <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className={selCls} />
      </Campo>
      <Campo label="Até">
        <input type="date" value={dataFim} min={dataInicio || undefined} onChange={(e) => setDataFim(e.target.value)} className={selCls} />
      </Campo>
      <Campo label="Atraso">
        <select value={atraso} onChange={(e) => setAtraso(e.target.value as AtrasoFiltro)} className={selCls}>
          <option value="todos">Todos</option>
          <option value="com">Com atraso</option>
          <option value="sem">Sem atraso</option>
        </select>
      </Campo>
    </>
  )

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MngTopBar />
        <PageHeader title="Sessões" subtitle="Monitoramento da operação de atendimentos." className="mt-2 lg:mt-0" />

        {sessoes.status === 'loading' && <Skeleton className="h-24 w-full rounded-lg" />}
        {sessoes.status === 'error' && <ErrorState message={sessoes.message} onRetry={sessoes.reload} />}
        {sessoes.status === 'success' && (
          <>
            {/* Filtros — inline no desktop, botão + Sheet no mobile */}
            <FiltrosBar ativos={ativos} onLimpar={limpar} desktopClassName="[&>label]:flex-1">{campos}</FiltrosBar>

            {/* Big numbers clicáveis — filtram por status */}
            <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              {CARDS.map((c) => {
                const on = status === c.st
                return (
                  <button
                    key={c.st}
                    onClick={() => toggleStatus(c.st)}
                    aria-pressed={on}
                    className={`flex flex-col items-center gap-1 rounded-lg border p-4 text-center transition-colors ${on ? 'border-primary bg-primary-50 dark:bg-primary-50/10' : 'border-border bg-surface hover:border-border-strong'}`}
                  >
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

            {/* Lista em cards */}
            <div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface">
              {filtradas.length > 0 ? (
                <ul className="divide-y divide-border">
                  {filtradas.map((s) => {
                    const [, mes, dia] = s.data.split('-')
                    return (
                      <li key={s.id} className="flex items-center gap-3.5 px-4 py-3">
                        {/* Data em destaque */}
                        <div className="w-11 shrink-0 text-center">
                          <p className="font-heading text-[18px] font-bold leading-none text-ink">{dia}</p>
                          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-muted">{MESES[Number(mes) - 1]}</p>
                        </div>
                        <div className="h-10 w-px shrink-0 bg-border" />
                        {/* Profissional + horários */}
                        <div className="flex min-w-0 flex-1 items-center gap-2.5">
                          <Avatar initials={s.profissionalInitials} size={32} palette={s.palette} />
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-medium text-ink">{s.profissional}</p>
                            <p className="truncate text-[11.5px] text-ink-muted">{s.tipoLabel} · {s.empresa}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px]">
                              <span className="inline-flex items-center gap-1 font-mono text-ink-secondary"><Icon icon="ph:clock-bold" width={12} aria-hidden /> {s.inicio}{s.fim ? `–${s.fim}` : ''}</span>
                              {s.duracaoMin != null && <span className="inline-flex items-center gap-1 font-mono text-ink-secondary"><Icon icon="ph:hourglass-medium-bold" width={12} aria-hidden /> {s.duracaoMin} min</span>}
                              {s.atrasoMin > 0
                                ? <span className="inline-flex items-center gap-1 rounded-pill bg-warning-bg px-2 py-0.5 font-semibold text-warning-ink"><Icon icon="ph:timer-bold" width={11} aria-hidden /> {s.atrasoMin} min de atraso</span>
                                : s.status === 'realizada' && <span className="inline-flex items-center gap-1 font-medium text-success-ink"><Icon icon="ph:check-bold" width={11} aria-hidden /> Sem atraso</span>}
                              {s.status === 'cancelada' && s.cancelamento && (
                                <button onClick={() => setCancelSel(s)} className="inline-flex items-center gap-1 font-medium text-primary transition-colors hover:underline dark:text-primary-300"><Icon icon="ph:info-bold" width={12} aria-hidden /> Ver cancelamento</button>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge tone={STATUS_TONE[s.status]}>{STATUS_LABEL[s.status]}</Badge>
                      </li>
                    )
                  })}
                </ul>
              ) : <div className="px-4 py-10 text-center text-sm text-ink-secondary">Nenhuma sessão para os filtros selecionados.</div>}
            </div>
          </>
        )}
      </div>

      {/* Informações do cancelamento */}
      <Modal open={cancelSel !== null} title="Cancelamento da sessão" onClose={() => setCancelSel(null)}>
        {cancelSel?.cancelamento && (
          <div className="flex flex-col gap-4">
            <p className="text-[13px] text-ink-secondary">{cancelSel.profissional} · sessão de {cancelSel.data.split('-').reverse().join('/')} às {cancelSel.inicio}.</p>
            <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="text-[13px] text-ink-secondary">Cancelado em</span>
                <span className="text-right text-[13px] font-medium text-ink">{fmtDataHora(cancelSel.cancelamento.em)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="text-[13px] text-ink-secondary">Cancelado por</span>
                <span className="text-right text-[13px] font-medium text-ink">{CANCELADO_POR[cancelSel.cancelamento.por]}</span>
              </div>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-ink-muted">Motivo</p>
              <p className="rounded-lg border border-border bg-surface-2/40 p-3 text-[13.5px] leading-relaxed text-ink">{cancelSel.cancelamento.motivo}</p>
            </div>
            <Button fullWidth onClick={() => setCancelSel(null)}>Fechar</Button>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-muted">{label}</span>
      {children}
    </label>
  )
}
