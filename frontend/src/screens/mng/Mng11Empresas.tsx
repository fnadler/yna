import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { MngTopBar } from '../../components/MngTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { FiltrosBar } from '../../components/FiltrosBar'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { mngEmpresaService } from '../../services/mng'
import { EMPRESA_STATUS_LABEL, MNG_TODAY } from '../../data/mngMock'
import { NovaEmpresaModal } from './NovaEmpresaModal'
import type { MngEmpresa } from '../../types'

const fmtData = (iso: string) => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}` }
const somenteDigitos = (s: string) => s.replace(/\D/g, '')
/** Dias entre hoje (MNG_TODAY) e uma data ISO — negativo se já venceu. */
const diasAte = (iso: string) => Math.round((Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${MNG_TODAY}T00:00:00Z`)) / 86400000)
/** Contrato vigente da empresa (base do vencimento). */
const vigenteDe = (e: MngEmpresa) => e.contratos.find((c) => c.status === 'vigente')
const diasEntre = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000)

/** Andamento do contrato vigente: % decorrido, dias restantes e tom de alerta,
   pelo prazo até o término — verde (> 180 dias), amarelo (91–180 dias) e
   vermelho (≤ 90 dias, necessidade de renovação). */
function andamentoContrato(inicio: string, fim: string) {
  const total = Math.max(1, diasEntre(inicio, fim))
  const decorridos = Math.min(Math.max(0, diasEntre(inicio, MNG_TODAY)), total)
  const pct = Math.round((decorridos / total) * 100)
  const restante = diasAte(fim)
  const tone: 'success' | 'warning' | 'danger' =
    restante <= 90 ? 'danger' : restante <= 180 ? 'warning' : 'success'
  return { pct, restante, tone }
}
const BAR_FILL: Record<'success' | 'warning' | 'danger', string> = { success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger' }
const BAR_TEXT: Record<'success' | 'warning' | 'danger', string> = { success: 'text-ink-secondary', warning: 'text-warning-ink', danger: 'text-danger-ink' }

const STATUS_TONE: Record<MngEmpresa['status'], 'success' | 'danger' | 'neutral'> = {
  ativa: 'success', bloqueada: 'danger', inativa: 'neutral',
}

/** Filtro de vencimento acionado pelos cards (só filtra ao clicar). */
type VencFiltro = 'todos' | 'verde' | 'amarelo' | 'vermelho' | 'mes'

/** Cards de vencimento (verde/amarelo/vermelho) — chave = tom do andamento. */
const VENC_CARDS = [
  { key: 'verde', tone: 'success', filtro: 'verde', icon: 'ph:check-circle-bold', label: 'No prazo (> 180 dias)' },
  { key: 'amarelo', tone: 'warning', filtro: 'amarelo', icon: 'ph:clock-countdown-bold', label: 'Vence em 91–180 dias' },
  { key: 'vermelho', tone: 'danger', filtro: 'vermelho', icon: 'ph:warning-circle-bold', label: 'Vence em ≤ 90 dias' },
] as const
const CARD_ICON: Record<'success' | 'warning' | 'danger', string> = {
  success: 'bg-success-bg text-success-ink', warning: 'bg-warning-bg text-warning-ink', danger: 'bg-danger-bg text-danger-ink',
}
const CARD_ACTIVE: Record<'success' | 'warning' | 'danger', string> = {
  success: 'border-success bg-success-bg', warning: 'border-warning bg-warning-bg', danger: 'border-danger bg-danger-bg',
}

const ORDEM_OPCOES = [
  { key: 'venc', label: 'Vencimento (mais próximo)' },
  { key: 'nome', label: 'Razão social (A–Z)' },
  { key: 'licencas', label: 'Colaboradores contratados (maior)' },
  { key: 'adesao', label: 'Adesão (maior)' },
] as const
type OrdemKey = (typeof ORDEM_OPCOES)[number]['key']

/* MNG-11 — Empresas clientes + controle de contratos (§8.4). */
export function Mng11Empresas() {
  const empresas = useService(() => mngEmpresaService.list(), [])
  const navigate = useNavigate()
  const [nova, setNova] = useState(false)

  // Filtros
  const [nome, setNome] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [status, setStatus] = useState<MngEmpresa['status'] | 'todos'>('todos')
  const [vencFiltro, setVencFiltro] = useState<VencFiltro>('todos')
  const [vencMes, setVencMes] = useState('') // YYYY-MM
  const [ordem, setOrdem] = useState<OrdemKey>('venc')

  // Base: filtros de texto/status (não inclui o vencimento — os cards contam sobre a base).
  const base = useMemo(() => {
    if (empresas.status !== 'success') return []
    const cnpjQ = somenteDigitos(cnpj)
    return empresas.data.filter((e) => {
      if (nome && !e.razaoSocial.toLowerCase().includes(nome.toLowerCase())) return false
      if (cnpjQ && !somenteDigitos(e.cnpj).includes(cnpjQ)) return false
      if (status !== 'todos' && e.status !== status) return false
      return true
    })
  }, [empresas, nome, cnpj, status])

  // Contagem por faixa de vencimento (contratos vigentes) — alimenta os big numbers.
  const counts = useMemo(() => {
    const c = { verde: 0, amarelo: 0, vermelho: 0 }
    for (const e of base) {
      const v = vigenteDe(e); if (!v) continue
      const t = andamentoContrato(v.inicio, v.fim).tone
      if (t === 'success') c.verde++; else if (t === 'warning') c.amarelo++; else c.vermelho++
    }
    return c
  }, [base])

  const lista = useMemo(() => {
    const filtradas = base.filter((e) => {
      if (vencFiltro === 'todos') return true
      const v = vigenteDe(e); if (!v) return false
      if (vencFiltro === 'mes') return Boolean(vencMes) && v.fim.slice(0, 7) === vencMes
      const t = andamentoContrato(v.inicio, v.fim).tone
      return (vencFiltro === 'verde' && t === 'success') || (vencFiltro === 'amarelo' && t === 'warning') || (vencFiltro === 'vermelho' && t === 'danger')
    })
    const adesao = (e: MngEmpresa) => (e.colaboradoresContratados > 0 ? e.colaboradoresAtivos / e.colaboradoresContratados : 0)
    return [...filtradas].sort((a, b) => {
      switch (ordem) {
        case 'nome': return a.razaoSocial.localeCompare(b.razaoSocial, 'pt-BR')
        case 'licencas': return b.colaboradoresContratados - a.colaboradoresContratados
        case 'adesao': return adesao(b) - adesao(a)
        case 'venc':
        default: return (vigenteDe(a)?.fim ?? '9999-99') .localeCompare(vigenteDe(b)?.fim ?? '9999-99')
      }
    })
  }, [base, vencFiltro, vencMes, ordem])

  const totalCarregado = empresas.status === 'success' ? empresas.data.length : 0
  const filtrando = nome !== '' || cnpj !== '' || status !== 'todos' || vencFiltro !== 'todos'
  const limpar = () => { setNome(''); setCnpj(''); setStatus('todos'); setVencFiltro('todos'); setVencMes('') }
  const ativosTexto = [nome !== '', cnpj !== '', status !== 'todos'].filter(Boolean).length
  const limparTexto = () => { setNome(''); setCnpj(''); setStatus('todos') }
  // Alterna um card de faixa (clicar de novo desmarca) e zera o mês.
  const toggleVenc = (f: VencFiltro) => { setVencMes(''); setVencFiltro((cur) => (cur === f ? 'todos' : f)) }

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MngTopBar />
        <PageHeader
          title="Empresas" subtitle="Contas corporativas e contratos." className="mt-2 lg:mt-0"
          action={<Button variant="secondary" iconLeft="ph:plus-bold" onClick={() => setNova(true)}><span className="hidden sm:inline">Nova empresa</span></Button>}
        />

        {/* Big numbers por vencimento — clicáveis (só filtram ao clicar num card) */}
        {empresas.status === 'success' && (
          <div className="mb-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {VENC_CARDS.map((c) => {
              const ativo = vencFiltro === c.filtro
              return (
                <button key={c.key} onClick={() => toggleVenc(c.filtro)} aria-pressed={ativo}
                  className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${ativo ? CARD_ACTIVE[c.tone] : 'border-border bg-surface hover:bg-surface-hover'}`}>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${CARD_ICON[c.tone]}`}>
                    <Icon icon={c.icon} width={20} aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="font-heading text-2xl font-bold leading-none text-ink">{counts[c.key]}</p>
                    <p className="mt-1 text-[12px] leading-tight text-ink-secondary">{c.label}</p>
                  </div>
                </button>
              )
            })}
            {/* Card de mês/ano de vencimento */}
            <div className={`flex flex-col justify-center gap-1.5 rounded-lg border p-4 transition-colors ${vencFiltro === 'mes' ? 'border-primary bg-primary-50' : 'border-border bg-surface'}`}>
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-ink-secondary">
                <Icon icon="ph:calendar-blank-bold" width={14} className="text-ink-muted" aria-hidden /> Mês de vencimento
              </span>
              <input type="month" value={vencMes} onChange={(e) => { setVencMes(e.target.value); setVencFiltro(e.target.value ? 'mes' : 'todos') }}
                className="w-full rounded border-[1.5px] border-border bg-surface px-3 py-1.5 text-[13px] text-ink outline-none focus:border-primary" />
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="mb-4">
          <FiltrosBar ativos={ativosTexto} onLimpar={limparTexto}>
            <div className="relative lg:flex-1">
              <Icon icon="ph:magnifying-glass-bold" width={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden />
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Buscar por razão social…"
                className="w-full rounded border-[1.5px] border-border bg-surface py-2.5 pl-9 pr-4 text-sm text-ink outline-none focus:border-primary" />
            </div>
            <div className="relative lg:w-48">
              <Icon icon="ph:identification-card-bold" width={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden />
              <input value={cnpj} onChange={(e) => setCnpj(e.target.value)} inputMode="numeric" placeholder="CNPJ"
                className="w-full rounded border-[1.5px] border-border bg-surface py-2.5 pl-9 pr-4 text-sm text-ink outline-none focus:border-primary" />
            </div>
            <div className="relative lg:w-52">
              <Icon icon="ph:funnel-bold" width={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden />
              <select value={status} onChange={(e) => setStatus(e.target.value as MngEmpresa['status'] | 'todos')}
                className="w-full appearance-none rounded border-[1.5px] border-border bg-surface py-2.5 pl-9 pr-8 text-sm text-ink outline-none focus:border-primary">
                <option value="todos">Todos os status</option>
                {(['ativa', 'bloqueada', 'inativa'] as const).map((s) => (
                  <option key={s} value={s}>{EMPRESA_STATUS_LABEL[s]}</option>
                ))}
              </select>
              <Icon icon="ph:caret-down-bold" width={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden />
            </div>
          </FiltrosBar>
        </div>

        {empresas.status === 'loading' && <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}</div>}
        {empresas.status === 'error' && <ErrorState message={empresas.message} onRetry={empresas.reload} />}
        {empresas.status === 'success' && (
          <>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
              <span className="text-[12.5px] text-ink-secondary">{lista.length} de {totalCarregado} empresa(s)</span>
              <div className="flex items-center gap-3">
                {filtrando && <button onClick={limpar} className="text-[12.5px] font-medium text-primary hover:underline dark:text-primary-300">Limpar filtros</button>}
                <label className="flex items-center gap-1.5 text-[12.5px] text-ink-secondary">
                  <Icon icon="ph:arrows-down-up-bold" width={14} className="text-ink-muted" aria-hidden />
                  <span className="hidden sm:inline">Ordenar:</span>
                  <select value={ordem} onChange={(e) => setOrdem(e.target.value as OrdemKey)}
                    className="rounded-lg border border-border bg-surface px-2 py-1 text-[12.5px] text-ink outline-none focus:border-primary">
                    {ORDEM_OPCOES.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                  </select>
                </label>
              </div>
            </div>
            {lista.length > 0 ? (
              <div className="flex flex-col gap-2">
                {lista.map((e) => {
                  const vigente = vigenteDe(e)
                  const usoPct = e.colaboradoresContratados > 0 ? Math.round((e.colaboradoresAtivos / e.colaboradoresContratados) * 100) : 0
                  const and = vigente ? andamentoContrato(vigente.inicio, vigente.fim) : null
                  return (
                    <button key={e.id} onClick={() => navigate(`/mng/empresas/${e.id}`)} className="rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-hover">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-50 font-heading text-[13px] font-bold text-primary dark:text-primary-300">{e.initials}</div>
                          <div className="min-w-0">
                            <p className="truncate font-heading text-sm font-semibold text-ink">{e.nomeFantasia}</p>
                            <p className="truncate text-[12.5px] text-ink-secondary">{e.razaoSocial} · {e.cnpj}</p>
                          </div>
                        </div>
                        <Badge tone={STATUS_TONE[e.status]}>{EMPRESA_STATUS_LABEL[e.status]}</Badge>
                      </div>

                      <div className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                        {/* Colaboradores ativos/contratados */}
                        <div>
                          <div className="flex items-center justify-between text-[11.5px]">
                            <span className="flex items-center gap-1 text-ink-secondary"><Icon icon="ph:seat-bold" width={12} className="text-ink-muted" aria-hidden /> Colaboradores</span>
                            <span className="font-mono text-ink-muted">{e.colaboradoresAtivos}/{e.colaboradoresContratados} · {usoPct}%</span>
                          </div>
                          <div className="mt-1 h-2 overflow-hidden rounded-pill bg-surface-2">
                            <div className={`h-full rounded-pill ${usoPct >= 100 ? 'bg-danger' : 'bg-primary'}`} style={{ width: `${Math.min(usoPct, 100)}%` }} />
                          </div>
                        </div>

                        {/* Andamento do contrato */}
                        <div>
                          {vigente && and ? (
                            <>
                              <div className="flex items-center justify-between text-[11.5px]">
                                <span className="flex items-center gap-1 text-ink-secondary"><Icon icon="ph:calendar-blank-bold" width={12} className="text-ink-muted" aria-hidden /> Contrato</span>
                                <span className={`font-mono ${BAR_TEXT[and.tone]}`}>vence {fmtData(vigente.fim)} · {and.restante < 0 ? 'vencido' : `${and.restante}d`}</span>
                              </div>
                              <div className="mt-1 h-2 overflow-hidden rounded-pill bg-surface-2">
                                <div className={`h-full rounded-pill ${BAR_FILL[and.tone]}`} style={{ width: `${and.pct}%` }} />
                              </div>
                            </>
                          ) : (
                            <div className="flex h-full items-end text-[11.5px] text-ink-muted">Sem contrato vigente</div>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-sm text-ink-secondary">Nenhuma empresa para os filtros selecionados.</div>
            )}
          </>
        )}
      </div>

      <NovaEmpresaModal open={nova} onClose={() => { setNova(false); empresas.reload() }} onCreated={(e) => { setNova(false); navigate(`/mng/empresas/${e.id}`) }} />
    </div>
  )
}
