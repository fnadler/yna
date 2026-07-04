import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Icon } from '@iconify/react'
import { MngTopBar } from '../../components/MngTopBar'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { useMng } from '../../contexts/MngContext'
import { mngDashboardService } from '../../services/mng'
import { mngProfissionais, mngNotas, mngParcelasFin, mngTickets } from '../../data/mngMock'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const num = (n: number) => n.toLocaleString('pt-BR')
const pct = (n: number) => `${n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
const horas = (n: number) => `${n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}h`

/* MNG-10 — Cockpit do gestor YNA (§8.10). Organizado por TEMPORALIDADE: um bloco
   de FOTO ATUAL (estoque — o estado de hoje) e um bloco POR PERÍODO (fluxo —
   acumulados no mês navegável ou no consolidado do ano). A dimensão (Empresas/
   Profissionais/Sessões/Financeiro) é o agrupamento interno. Pendências à direita. */
export function Mng10Home() {
  const { gestor } = useMng()
  const navigate = useNavigate()
  const ck = useService(() => mngDashboardService.cockpit(), [])
  const firstName = gestor.nome.split(' ')[0]
  const [modo, setModo] = useState<'mes' | 'ano'>('mes')
  // Índice do mês selecionado; null = mês atual (último da lista).
  const [mesIdx, setMesIdx] = useState<number | null>(null)

  // Pendências acionáveis do backoffice, cada uma com link para o detalhe.
  const pendencias: { icon: string; label: string; count: number; to: string }[] = [
    { icon: 'ph:user-check-bold', label: 'Profissionais para análise', count: mngProfissionais.filter((p) => p.status === 'para-analise' || p.status === 'em-analise').length, to: '/mng/profissionais?status=em-analise' },
    { icon: 'ph:receipt-bold', label: 'Notas fiscais para conferência', count: mngNotas.filter((n) => n.status === 'em-analise').length, to: '/mng/financeiro?view=profissionais&status=em-analise' },
    { icon: 'ph:file-text-bold', label: 'Notas a emitir para empresas', count: mngParcelasFin.filter((p) => p.status === 'pendente-emissao').length, to: '/mng/financeiro?view=empresas&status=pendente-emissao' },
    { icon: 'ph:lifebuoy-bold', label: 'Chamados abertos no suporte', count: mngTickets.filter((t) => t.status === 'aberto').length, to: '/mng/suporte?status=aberto' },
  ]

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MngTopBar />

        <div className="pt-2 pb-6 lg:pt-9 lg:pb-6">
          <h1 className="text-[26px] lg:text-[32px] font-medium tracking-[-0.02em] text-ink">Oi, {firstName}.</h1>
          <p className="mt-0.5 text-[15px] text-ink-secondary">A saúde do negócio YNA num relance.</p>
        </div>

        {ck.status === 'loading' && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        )}
        {ck.status === 'error' && <ErrorState message={ck.message} onRetry={ck.reload} />}
        {ck.status === 'success' && (() => {
          const lastIdx = ck.data.meses.length - 1
          const idx = mesIdx ?? lastIdx
          const mes = ck.data.meses[idx]
          const fx = modo === 'ano' ? ck.data.anoConsolidado.dados : mes.dados
          const periodoLabel = modo === 'ano' ? ck.data.anoConsolidado.label : mes.label
          return (
            <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:items-start">
              {/* ── Cockpit: dois blocos por temporalidade ── */}
              <div className="flex flex-col gap-4">

                {/* BLOCO 1 — FOTO ATUAL */}
                <Painel
                  titulo="Foto atual"
                  descricao="O estado da operação hoje"
                  icon="ph:pulse-bold"
                  selo={<span className="inline-flex items-center gap-1.5 rounded-pill bg-success-bg px-2.5 py-1 text-[11px] font-semibold text-success-ink"><span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden /> Hoje</span>}
                >
                  <DimGroup icon="ph:buildings-bold" titulo="Empresas" onVerTudo={() => navigate('/mng/empresas')}>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                      <Stat value={num(ck.data.empresas.contratoAtivo)} label="Com contrato ativo" />
                      <Stat value={num(ck.data.empresas.bloqueadas)} label="Bloqueadas" tone={ck.data.empresas.bloqueadas > 0 ? 'danger' : 'default'} />
                      <Stat value={brl(ck.data.empresas.inadimplencia)} label="Inadimplência" tone={ck.data.empresas.inadimplencia > 0 ? 'danger' : 'default'} />
                    </div>
                    <UtilizacaoChart media={ck.data.empresas.utilizacaoMediaPct} itens={ck.data.empresas.utilizacao} />
                  </DimGroup>

                  <DimGroup icon="ph:identification-badge-bold" titulo="Profissionais" onVerTudo={() => navigate('/mng/profissionais')}>
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                      <div>
                        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ink-muted">Ativos por tipo</p>
                        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border">
                          {ck.data.profissionais.ativosPorTipo.map((t) => (
                            <div key={t.tipo} className="flex items-center justify-between px-3 py-2 text-[13px]">
                              <span className="text-ink-secondary">{t.tipo}</span>
                              <span className="font-mono font-semibold text-ink">{num(t.total)}</span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between bg-surface-2/40 px-3 py-2 text-[13px] font-semibold text-ink">
                            <span>Total ativos</span><span className="font-mono">{num(ck.data.profissionais.ativosTotal)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 self-start lg:grid-cols-1">
                        <Stat value={horas(ck.data.profissionais.dispSemanalMediaH)} label="Disponibilidade semanal média" />
                        <Stat value={horas(ck.data.profissionais.dispPlantaoMediaH)} label="Disponibilidade média p/ plantão" />
                      </div>
                    </div>
                  </DimGroup>

                  <DimGroup icon="ph:receipt-bold" titulo="Financeiro" onVerTudo={() => navigate('/mng/financeiro?view=profissionais')}>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                      <Stat value={brl(ck.data.saldoAPagar)} label="Saldo a pagar aos profissionais" tone="warning" />
                    </div>
                  </DimGroup>
                </Painel>

                {/* BLOCO 2 — POR PERÍODO */}
                <Painel
                  titulo="Por período"
                  descricao={`Acumulado · ${periodoLabel}`}
                  icon="ph:chart-line-up-bold"
                  selo={
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Toggle Mês / Ano */}
                      <div className="flex gap-1 rounded-lg bg-surface-2 p-1">
                        {(['mes', 'ano'] as const).map((m) => (
                          <button
                            key={m}
                            onClick={() => setModo(m)}
                            className={`rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition-all duration-200 ${
                              modo === m ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
                            }`}
                          >
                            {m === 'mes' ? 'Mês' : 'Ano'}
                          </button>
                        ))}
                      </div>
                      {/* Navegador de mês (some no modo ano) */}
                      {modo === 'mes' ? (
                        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5">
                          <button
                            onClick={() => setMesIdx(Math.max(0, idx - 1))}
                            disabled={idx === 0}
                            aria-label="Mês anterior"
                            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-secondary transition-colors hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-30"
                          >
                            <Icon icon="ph:caret-left-bold" width={15} aria-hidden />
                          </button>
                          <span className="min-w-[128px] text-center text-[13px] font-semibold text-ink">{mes.label}</span>
                          <button
                            onClick={() => setMesIdx(Math.min(lastIdx, idx + 1))}
                            disabled={idx === lastIdx}
                            aria-label="Próximo mês"
                            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-secondary transition-colors hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-30"
                          >
                            <Icon icon="ph:caret-right-bold" width={15} aria-hidden />
                          </button>
                        </div>
                      ) : (
                        <span className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[13px] font-semibold text-ink">{ck.data.anoConsolidado.label}</span>
                      )}
                    </div>
                  }
                >
                  <DimGroup icon="ph:buildings-bold" titulo="Empresas" onVerTudo={() => navigate('/mng/financeiro?view=empresas')}>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                      <Stat value={brl(fx.receitaRecebida)} label="Receita recebida" tone="success" />
                    </div>
                  </DimGroup>

                  <DimGroup icon="ph:calendar-check-bold" titulo="Sessões" onVerTudo={() => navigate('/mng/sessoes')}>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
                      <Stat value={num(fx.sessoesRealizadas)} label="Realizadas" tone="success" />
                      <Stat value={pct(fx.noShowBeneficiarioPct)} label="No-show beneficiário" tone="warning" />
                      <Stat value={pct(fx.noShowProfissionalPct)} label="No-show profissional" tone="warning" />
                      <Stat value={`${fx.atrasoMedioMin} min`} label="Atraso médio" />
                      <Stat value={`${fx.duracaoMediaMin} min`} label="Duração média" />
                    </div>
                  </DimGroup>

                  <DimGroup icon="ph:receipt-bold" titulo="Financeiro" onVerTudo={() => navigate('/mng/financeiro?view=profissionais')}>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
                      <Stat value={brl(fx.valorPago)} label="Valor pago" tone="success" />
                      <Stat value={brl(fx.valorAntecipado)} label="Pago por antecipação" />
                      <Stat value={brl(fx.valorMedioSessao)} label="Valor médio por sessão" />
                      <Stat value={brl(fx.receitaAntecipacao)} label="Receita de antecipação (taxas)" tone="success" />
                    </div>
                  </DimGroup>
                </Painel>
              </div>

              {/* ── Sidebar: pendências ── */}
              <div className="mt-6 flex flex-col gap-5 lg:mt-0">
                <section>
                  <h2 className="mb-3 text-[15px] font-semibold text-ink">Suas pendências</h2>
                  <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-2">
                    {pendencias.map((p) => (
                      <button key={p.label} onClick={() => navigate(p.to)} className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-surface-hover">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300"><Icon icon={p.icon} width={18} aria-hidden /></div>
                        <span className="min-w-0 flex-1 text-[13px] font-medium text-ink">{p.label}</span>
                        <span className={`shrink-0 rounded-pill px-2 py-0.5 font-mono text-[12px] font-bold ${p.count > 0 ? 'bg-primary-50 text-primary dark:text-primary-300' : 'bg-surface-2 text-ink-muted'}`}>{p.count}</span>
                        <Icon icon="ph:caret-right-bold" width={14} className="shrink-0 text-ink-muted" aria-hidden />
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

/* Painel de um bloco temporal (Foto atual / Por período): cabeçalho com título,
   descrição e um "selo" (pílula de hoje ou seletor de período), + o corpo. */
function Painel({ titulo, descricao, icon, selo, children }: {
  titulo: string; descricao: string; icon: string; selo: ReactNode; children: ReactNode
}) {
  return (
    <section className="rounded-lg border border-border bg-surface">
      <header className="flex flex-col gap-3 border-b border-border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
            <Icon icon={icon} width={18} aria-hidden />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold leading-tight text-ink">{titulo}</h2>
            <p className="text-[12.5px] text-ink-secondary">{descricao}</p>
          </div>
        </div>
        <div className="shrink-0">{selo}</div>
      </header>
      <div className="flex flex-col px-4">{children}</div>
    </section>
  )
}

/* Agrupamento por dimensão dentro de um painel: cabeçalho (ícone + nome + atalho)
   e o corpo com os indicadores. Divisor entre grupos. */
function DimGroup({ icon, titulo, onVerTudo, children }: {
  icon: string; titulo: string; onVerTudo: () => void; children: ReactNode
}) {
  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-secondary">
          <Icon icon={icon} width={15} className="text-primary dark:text-primary-300" aria-hidden /> {titulo}
        </h3>
        <button onClick={onVerTudo} className="flex items-center gap-1 text-[12px] font-medium text-primary transition-opacity hover:opacity-80 dark:text-primary-300">
          Ver tudo <Icon icon="ph:arrow-right-bold" width={12} aria-hidden />
        </button>
      </div>
      {children}
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

/* Gráfico de utilização dos planos: média em destaque + barras por empresa. */
function UtilizacaoChart({ media, itens }: { media: number; itens: { nome: string; pct: number }[] }) {
  return (
    <div className="mt-4 border-t border-border pt-3">
      <div className="mb-2.5 flex items-center justify-between">
        <p className="text-[12px] font-medium text-ink-secondary">Utilização média dos planos</p>
        <p className="text-[18px] font-semibold text-ink">{media}%</p>
      </div>
      <div className="flex flex-col gap-1.5">
        {itens.map((e) => (
          <div key={e.nome} className="flex items-center gap-2.5">
            <span className="w-24 shrink-0 truncate text-[11.5px] text-ink-secondary" title={e.nome}>{e.nome}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-pill bg-surface-2">
              <div className="h-full rounded-pill bg-primary transition-all" style={{ width: `${Math.max(e.pct, 2)}%` }} />
            </div>
            <span className="w-9 shrink-0 text-right font-mono text-[11.5px] font-medium text-ink">{e.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
