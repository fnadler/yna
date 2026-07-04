import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { MngTopBar } from '../../components/MngTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { FiltrosBar } from '../../components/FiltrosBar'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { mngProfissionalService } from '../../services/mng'
import { PROF_STATUS_LABEL } from '../../data/mngMock'
import type { MngProfissional } from '../../types'

type CardTone = 'success' | 'primary' | 'warning' | 'danger'
const STATUS_TONE: Record<MngProfissional['status'], 'success' | 'primary' | 'warning' | 'danger' | 'neutral'> = {
  ativo: 'success', 'para-analise': 'primary', 'em-analise': 'warning', reprovado: 'danger', inativo: 'neutral',
}

/* Cards de big numbers por status (clicáveis → filtram a lista). */
const STATUS_CARDS = [
  { status: 'ativo', label: 'Ativos', icon: 'ph:check-circle-bold', tone: 'success' },
  { status: 'para-analise', label: 'Para análise', icon: 'ph:tray-bold', tone: 'primary' },
  { status: 'em-analise', label: 'Em análise', icon: 'ph:hourglass-medium-bold', tone: 'warning' },
  { status: 'reprovado', label: 'Reprovados', icon: 'ph:x-circle-bold', tone: 'danger' },
] as const
const CARD_ICON: Record<CardTone, string> = {
  success: 'bg-success-bg text-success-ink', primary: 'bg-primary-50 text-primary dark:text-primary-300',
  warning: 'bg-warning-bg text-warning-ink', danger: 'bg-danger-bg text-danger-ink',
}
const CARD_ACTIVE: Record<CardTone, string> = {
  success: 'border-success bg-success-bg', primary: 'border-primary bg-primary-50',
  warning: 'border-warning bg-warning-bg', danger: 'border-danger bg-danger-bg',
}

type StatusFiltro = 'todos' | MngProfissional['status']

/* MNG-12 — Tipos, aprovação e gestão de profissionais (§8.5). */
export function Mng12Profissionais() {
  const tipos = useService(() => mngProfissionalService.tipos(), [])
  const profs = useService(() => mngProfissionalService.list(), [])
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [tipoSel, setTipoSel] = useState('psicologo')
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>(() => {
    const s = params.get('status')
    return s === 'ativo' || s === 'para-analise' || s === 'em-analise' || s === 'reprovado' ? s : 'todos'
  })
  const [nome, setNome] = useState('')
  const [uf, setUf] = useState('todos')
  const [linha, setLinha] = useState('todos')

  const all = profs.status === 'success' ? profs.data : []
  const doTipo = useMemo(() => all.filter((p) => p.tipo === tipoSel), [all, tipoSel])

  const counts = useMemo(() => {
    const c: Record<string, number> = { ativo: 0, 'para-analise': 0, 'em-analise': 0, reprovado: 0 }
    for (const p of doTipo) if (p.status in c) c[p.status]++
    return c
  }, [doTipo])

  const ufs = useMemo(() => [...new Set(doTipo.map((p) => p.uf))].sort(), [doTipo])
  const linhas = useMemo(() => [...new Set(doTipo.flatMap((p) => p.linhasTeoricas))].sort(), [doTipo])

  const lista = useMemo(() => doTipo.filter((p) =>
    (statusFiltro === 'todos' || p.status === statusFiltro) &&
    (uf === 'todos' || p.uf === uf) &&
    (linha === 'todos' || p.linhasTeoricas.includes(linha)) &&
    (nome === '' || p.nome.toLowerCase().includes(nome.toLowerCase()) || p.conselho.toLowerCase().includes(nome.toLowerCase()))
  ), [doTipo, statusFiltro, uf, linha, nome])

  const ativosFiltro = [nome !== '', uf !== 'todos', linha !== 'todos'].filter(Boolean).length
  const limparFiltros = () => { setNome(''); setUf('todos'); setLinha('todos') }

  const limparStatus = () => setStatusFiltro('todos')

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MngTopBar />
        <PageHeader title="Profissionais" subtitle="Tipos, aprovação e ciclo de vida." className="mt-2 lg:mt-0" />

        {/* Tabs por tipo de profissional + novo tipo */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {tipos.status === 'success' ? tipos.data.map((t) => {
            const ativo = tipoSel === t.id
            const n = all.filter((p) => p.tipo === t.id).length
            return (
              <button key={t.id} onClick={() => { setTipoSel(t.id); setStatusFiltro('todos'); setUf('todos'); setLinha('todos') }} aria-pressed={ativo}
                className={`flex items-center gap-2 rounded-pill border-[1.5px] px-4 py-2 font-heading text-sm font-medium transition-colors ${ativo ? 'border-primary bg-primary-50 text-primary dark:text-primary-300' : 'border-border bg-surface text-ink-secondary hover:border-border-strong hover:text-ink'}`}>
                {t.nome}
                <span className={`rounded-pill px-1.5 text-[11px] font-semibold ${ativo ? 'bg-primary/15' : 'bg-surface-2 text-ink-muted'}`}>{n}</span>
                {!t.ativo && <span className="text-[10px] font-normal text-ink-muted">roadmap</span>}
              </button>
            )
          }) : <Skeleton className="h-10 w-64 rounded-pill" />}
          <Button size="sm" variant="secondary" iconLeft="ph:gear-bold" onClick={() => navigate('/mng/tipos-profissional')}>Gerenciar tipos</Button>
        </div>

        {/* Big numbers do tipo selecionado (clicáveis) */}
        <div className="mb-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {STATUS_CARDS.map((c) => {
            const sel = statusFiltro === c.status
            return (
              <button key={c.status} onClick={() => setStatusFiltro((cur) => (cur === c.status ? 'todos' : c.status))} aria-pressed={sel}
                className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${sel ? CARD_ACTIVE[c.tone] : 'border-border bg-surface hover:bg-surface-hover'}`}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${CARD_ICON[c.tone]}`}><Icon icon={c.icon} width={20} aria-hidden /></div>
                <div className="min-w-0">
                  <p className="font-heading text-2xl font-bold leading-none text-ink">{counts[c.status] ?? 0}</p>
                  <p className="mt-1 text-[12px] leading-tight text-ink-secondary">{c.label}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Filtros: nome, estado, linha terapêutica */}
        <div className="mb-4">
          <FiltrosBar ativos={ativosFiltro} onLimpar={limparFiltros}>
            <div className="relative lg:flex-1">
              <Icon icon="ph:magnifying-glass-bold" width={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden />
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Buscar por nome ou conselho…"
                className="w-full rounded border-[1.5px] border-border bg-surface py-2.5 pl-9 pr-4 text-sm text-ink outline-none focus:border-primary" />
            </div>
            <select value={uf} onChange={(e) => setUf(e.target.value)} className="rounded border-[1.5px] border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-primary lg:w-36">
              <option value="todos">Todos os estados</option>
              {ufs.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            <select value={linha} onChange={(e) => setLinha(e.target.value)} className="rounded border-[1.5px] border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-primary lg:w-52">
              <option value="todos">Todas as linhas</option>
              {linhas.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </FiltrosBar>
        </div>

        {profs.status === 'loading' && <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>}
        {profs.status === 'error' && <ErrorState message={profs.message} onRetry={profs.reload} />}
        {profs.status === 'success' && (
          <>
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[12.5px] text-ink-secondary">{lista.length} profissional(is)</span>
              {statusFiltro !== 'todos' && <button onClick={limparStatus} className="text-[12.5px] font-medium text-primary hover:underline dark:text-primary-300">Limpar filtro de status</button>}
            </div>
            {lista.length > 0 ? (
              <div className="flex flex-col gap-2">
                {lista.map((p) => (
                  <button key={p.id} onClick={() => navigate(`/mng/profissionais/${p.id}`)} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 text-left transition-colors hover:bg-surface-hover">
                    {p.fotoUrl
                      ? <img src={p.fotoUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                      : <Avatar initials={p.initials} size={40} palette={p.palette} />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-heading text-sm font-semibold text-ink">{p.nome}</p>
                      <p className="truncate text-[12.5px] text-ink-secondary">{p.tipoLabel} · {p.conselho}</p>
                    </div>
                    <div className="hidden shrink-0 items-center gap-5 lg:flex">
                      <Stat value={String(p.clientesRecorrentes)} label="recorrentes" />
                      <Stat value={String(p.sessoesRealizadas)} label="sessões" />
                      <Stat value={p.qualidadeGeral > 0 ? String(p.qualidadeGeral) : '—'} label="qualidade" tone={p.qualidadeGeral > 0 ? (p.qualidadeGeral >= 80 ? 'success' : p.qualidadeGeral >= 60 ? 'warning' : 'danger') : undefined} />
                    </div>
                    <Badge tone={STATUS_TONE[p.status]}>{PROF_STATUS_LABEL[p.status]}</Badge>
                  </button>
                ))}
              </div>
            ) : <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-sm text-ink-secondary">Nenhum profissional encontrado.</div>}
          </>
        )}
      </div>

    </div>
  )
}

function Stat({ value, label, tone }: { value: string; label: string; tone?: 'success' | 'warning' | 'danger' }) {
  const c = tone === 'success' ? 'text-success-ink' : tone === 'warning' ? 'text-warning-ink' : tone === 'danger' ? 'text-danger-ink' : 'text-ink'
  return (
    <div className="text-right">
      <p className={`text-[13px] font-semibold tabular-nums ${c}`}>{value}</p>
      <p className="text-[10.5px] text-ink-muted">{label}</p>
    </div>
  )
}
