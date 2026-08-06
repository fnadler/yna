import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { MngTopBar } from '../../components/MngTopBar'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { useMng } from '../../contexts/MngContext'
import { mngDashboardService, mngEmpresaService } from '../../services/mng'
import { mngTickets } from '../../data/mngMock'

const num = (n: number) => n.toLocaleString('pt-BR')
const pct = (n: number) => `${n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`

/* MNG-02 — Cockpit de conformidade (§5.1). Depois do recorte NR-1 standalone,
   não há mais dimensão de sessão/profissional/repasse: só o que sustenta a
   operação multiempresa da conformidade (empresas, campanhas, versões do
   instrumento, canal de escuta) e um indicador comercial de potencial de
   adesão futura a cuidado (agregado, opt-in, nunca por pessoa). */
export function Mng10Home() {
  const { gestor } = useMng()
  const navigate = useNavigate()
  const ck = useService(() => mngDashboardService.cockpit(), [])
  const empresasSemInventario = useService(() => mngEmpresaService.list(), [])
  const firstName = gestor.nome.split(' ')[0]

  const pendencias = (count: { empresasSemInventario: number; casosCanalEscutaAbertos: number }) => [
    { icon: 'ph:shield-warning-bold', label: 'Empresas sem inventário gerado', count: count.empresasSemInventario, to: '/mng/empresas' },
    { icon: 'ph:megaphone-simple-bold', label: 'Casos abertos no canal de escuta', count: count.casosCanalEscutaAbertos, to: '/mng/suporte' },
    { icon: 'ph:lifebuoy-bold', label: 'Chamados abertos no suporte', count: mngTickets.filter((t) => t.status === 'aberto').length, to: '/mng/suporte?status=aberto' },
  ]

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MngTopBar />

        <div className="pt-2 pb-6 lg:pt-9 lg:pb-6">
          <h1 className="text-[26px] lg:text-[32px] font-medium tracking-[-0.02em] text-ink">Oi, {firstName}.</h1>
          <p className="mt-0.5 text-[15px] text-ink-secondary">A conformidade NR-1 das empresas clientes, num relance.</p>
        </div>

        {ck.status === 'loading' && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        )}
        {ck.status === 'error' && <ErrorState message={ck.message} onRetry={ck.reload} />}
        {ck.status === 'success' && (
          <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:items-start">
            <div className="flex flex-col gap-4">

              <section className="rounded-lg border border-border bg-surface p-4">
                <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-ink-secondary">
                  <Icon icon="ph:buildings-bold" width={15} className="text-primary dark:text-primary-300" aria-hidden /> Empresas
                </h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
                  <Stat value={num(ck.data.empresasAtivas)} label="Empresas ativas" />
                  <Stat value={num(ck.data.empresasBloqueadas)} label="Bloqueadas" tone={ck.data.empresasBloqueadas > 0 ? 'danger' : 'default'} />
                  <Stat value={num(ck.data.campanhasEmCampo)} label="Campanhas em campo" />
                </div>
              </section>

              <section className="rounded-lg border border-border bg-surface p-4">
                <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-ink-secondary">
                  <Icon icon="ph:shield-check-bold" width={15} className="text-primary dark:text-primary-300" aria-hidden /> Conformidade
                </h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
                  <Stat value={pct(ck.data.adesaoMediaPct)} label="Adesão média" tone="success" />
                  <Stat value={num(ck.data.versoesPublicadas)} label="Versões publicadas do instrumento" />
                  <Stat value={num(ck.data.empresasSemInventario)} label="Empresas sem inventário" tone={ck.data.empresasSemInventario > 0 ? 'warning' : 'default'} />
                </div>
              </section>

              <section className="rounded-lg border border-border bg-surface p-4">
                <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-ink-secondary">
                  <Icon icon="ph:hand-heart-bold" width={15} className="text-primary dark:text-primary-300" aria-hidden /> Potencial de adesão futura a cuidado
                </h2>
                <p className="mb-3 text-[12px] leading-relaxed text-ink-muted">
                  Agregado das respostas opcionais ao final da avaliação (opt-in, nunca por pessoa) —
                  indicador comercial, não faz parte do inventário nem do relatório de nenhuma empresa.
                </p>
                <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                  <Stat value={num(ck.data.interesseCuidado.sim)} label="Interessados" tone="success" />
                  <Stat value={num(ck.data.interesseCuidado.talvez)} label="Talvez" />
                  <Stat value={num(ck.data.interesseCuidado.total)} label="Total de respostas" />
                </div>
              </section>
            </div>

            {/* ── Sidebar: pendências ── */}
            <div className="mt-6 flex flex-col gap-5 lg:mt-0">
              <section>
                <h2 className="mb-3 text-[15px] font-semibold text-ink">Suas pendências</h2>
                <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-2">
                  {pendencias({
                    empresasSemInventario: ck.data.empresasSemInventario,
                    casosCanalEscutaAbertos: ck.data.casosCanalEscutaAbertos,
                  }).map((p) => (
                    <button key={p.label} onClick={() => navigate(p.to)} className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-surface-hover">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300"><Icon icon={p.icon} width={18} aria-hidden /></div>
                      <span className="min-w-0 flex-1 text-[13px] font-medium text-ink">{p.label}</span>
                      <span className={`shrink-0 rounded-pill px-2 py-0.5 font-mono text-[12px] font-bold ${p.count > 0 ? 'bg-primary-50 text-primary dark:text-primary-300' : 'bg-surface-2 text-ink-muted'}`}>{p.count}</span>
                      <Icon icon="ph:caret-right-bold" width={14} className="shrink-0 text-ink-muted" aria-hidden />
                    </button>
                  ))}
                </div>
              </section>
              {empresasSemInventario.status === 'success' && (
                <p className="text-[11.5px] leading-relaxed text-ink-muted">
                  {empresasSemInventario.data.length} empresas cadastradas no total.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* Célula de métrica: valor em destaque + rótulo, com tonalidade semântica. */
function Stat({ value, label, tone = 'default' }: {
  value: string; label: string; tone?: 'default' | 'success' | 'danger' | 'warning'
}) {
  const toneCls = {
    default: 'text-ink', success: 'text-success-ink', danger: 'text-danger-ink', warning: 'text-warning-ink',
  }[tone]
  return (
    <div>
      <p className={`text-[19px] font-semibold tracking-[-0.01em] ${toneCls}`}>{value}</p>
      <p className="mt-0.5 text-[12px] leading-tight text-ink-muted">{label}</p>
    </div>
  )
}
