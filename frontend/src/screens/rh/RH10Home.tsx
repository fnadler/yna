import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { Button } from '../../components/Button'
import { OptionCard } from '../../components/OptionCard'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { useRh } from '../../contexts/RhContext'
import { rhColaboradorService } from '../../services/rh'
import { nr1CampanhaService, nr1ResultadoService, nr1AcaoService, nr1CanalService } from '../../services/nr1'
import { NIVEL_RISCO } from '../../lib/nr1'

const fmtData = (iso: string) => { const [, m, d] = iso.split('-'); return `${d}/${m}` }

/* RH-02 — Home: estado do ciclo de conformidade (§5.3). Uma pergunta só:
   onde estamos no ciclo? Substitui a antiga home de adesão ao benefício —
   nenhum dado de bem-estar/financeiro daqui pra frente, só o que sustenta a
   NR-1: campanha, pendências acionáveis, risco por dimensão e a cadeia
   inventário → plano de ação → relatório. */
export function RH10Home() {
  const { usuario } = useRh()
  const navigate = useNavigate()
  const campanha = useService(() => nr1CampanhaService.ativa(), [])
  const dimensoes = useService(() => nr1ResultadoService.mediaPorDimensao(), [])
  const acoes = useService(() => nr1AcaoService.list(), [])
  const inventario = useService(() => nr1ResultadoService.inventario(), [])
  const relatos = useService(() => nr1CanalService.list(), [])
  const colaboradores = useService(() => rhColaboradorService.list(), [])

  const firstName = usuario.nome.split(' ')[0]

  const acoesAtrasadas = acoes.status === 'success' ? acoes.data.filter((a) => a.status === 'atrasada').length : 0
  const riscosSemAcao = inventario.status === 'success' && acoes.status === 'success'
    ? inventario.data.filter((r) => !acoes.data.some((a) => a.riscoId === r.id)).length
    : 0
  const casosAbertos = relatos.status === 'success' ? relatos.data.filter((r) => r.status !== 'concluido').length : 0
  const naoConvidados = colaboradores.status === 'success'
    ? colaboradores.data.filter((c) => c.status === 'nao_convidado').length
    : 0

  const pendencias = [
    { icon: 'ph:shield-warning-bold', label: 'Riscos priorizados sem ação', count: riscosSemAcao, to: '/rh/nr1/inventario' },
    { icon: 'ph:clock-countdown-bold', label: 'Ações com prazo vencido', count: acoesAtrasadas, to: '/rh/nr1/plano-acao' },
    { icon: 'ph:megaphone-simple-bold', label: 'Casos abertos no canal de escuta', count: casosAbertos, to: '/rh/nr1/canal' },
    { icon: 'ph:user-plus-bold', label: 'Colaboradores ainda não convidados', count: naoConvidados, to: '/rh/convites' },
  ]

  const acoesConcluidas = acoes.status === 'success' ? acoes.data.filter((a) => a.status === 'concluida').length : 0
  const totalAcoes = acoes.status === 'success' ? acoes.data.length : 0

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />

        <div className="pt-2 pb-6 lg:pt-9 lg:pb-6">
          <h1 className="text-[26px] lg:text-[32px] font-medium tracking-[-0.02em] text-ink">Oi, {firstName}.</h1>
          <p className="mt-0.5 text-[15px] text-ink-secondary">Onde vocês estão no ciclo de conformidade NR-1.</p>
        </div>

        <div className="flex flex-col gap-5">

          {/* 1 — Estado do ciclo */}
          <section>
            {campanha.status === 'loading' && <Skeleton className="h-32 w-full rounded-lg" />}
            {campanha.status === 'error' && <ErrorState message={campanha.message} onRetry={campanha.reload} />}
            {campanha.status === 'success' && campanha.data && (
              <button
                onClick={() => navigate('/rh/nr1/campanha')}
                className="flex w-full flex-col gap-3 rounded-lg border border-border bg-surface p-5 text-left transition-colors hover:border-border-strong"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">Campanha em campo</span>
                  <span className="inline-flex items-center gap-1 rounded-pill bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary dark:text-primary-300">
                    {campanha.data.modeloNome} · v{campanha.data.versao}
                  </span>
                </div>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[40px] font-bold leading-none tracking-[-0.02em] text-ink">
                      {Math.round((campanha.data.respostas / Math.max(1, campanha.data.elegiveis)) * 100)}%
                    </p>
                    <p className="mt-2 text-[13px] text-ink-secondary">
                      {campanha.data.respostas} de {campanha.data.elegiveis} colaboradores responderam
                    </p>
                  </div>
                  <span className="text-right text-[12.5px] text-ink-secondary">até {fmtData(campanha.data.fim)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-pill bg-surface-2">
                  <div className="h-full rounded-pill bg-primary transition-all" style={{ width: `${Math.round((campanha.data.respostas / Math.max(1, campanha.data.elegiveis)) * 100)}%` }} />
                </div>
              </button>
            )}
            {campanha.status === 'success' && !campanha.data && (
              <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-surface px-5 py-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
                  <Icon icon="ph:calendar-plus-bold" width={22} aria-hidden />
                </span>
                <div>
                  <h2 className="font-heading text-[16px] font-semibold text-ink">Nenhuma campanha em campo</h2>
                  <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-ink-secondary">
                    Abra a próxima avaliação para manter o ciclo de conformidade em dia.
                  </p>
                </div>
                <Button iconRight="ph:arrow-right-bold" onClick={() => navigate('/rh/nr1/campanha')}>Abrir campanha</Button>
              </div>
            )}
          </section>

          {/* 2 — Suas pendências */}
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

          {/* 3 — Risco por dimensão */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-ink">Risco por dimensão</h2>
              <button onClick={() => navigate('/rh/nr1/mapa-calor')} className="font-heading text-sm font-medium text-primary transition-colors hover:text-primary-600 dark:text-primary-300">
                Ver mapa de calor
              </button>
            </div>
            {dimensoes.status === 'loading' && <Skeleton className="h-24 w-full rounded-lg" />}
            {dimensoes.status === 'error' && <ErrorState message={dimensoes.message} onRetry={dimensoes.reload} />}
            {dimensoes.status === 'success' && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {dimensoes.data.map((d) => {
                  const meta = NIVEL_RISCO[d.nivel]
                  return (
                    <div key={d.dimensaoId} className="rounded-lg border border-border bg-surface p-3.5">
                      <p className="truncate text-[12px] text-ink-secondary">{d.nome}</p>
                      <p className="mt-1 font-mono text-[20px] font-bold text-ink">{d.media.toFixed(1)}</p>
                      <span className={`mt-1 inline-flex items-center rounded-pill px-2 py-0.5 text-[11px] font-medium ${meta.cls}`}>{meta.label}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* 4 — A cadeia */}
          <section>
            <h2 className="mb-3 text-[15px] font-semibold text-ink">A cadeia</h2>
            <div className="flex flex-col gap-2">
              <OptionCard
                layout="horizontal"
                icon="ph:clipboard-text-bold"
                label="Inventário para o PGR"
                desc={inventario.status === 'success' ? `${inventario.data.length} risco(s) mapeado(s)` : '—'}
                to="/rh/nr1/inventario"
              />
              <OptionCard
                layout="horizontal"
                icon="ph:list-checks-bold"
                label="Plano de ação"
                desc={acoes.status === 'success' ? `${acoesConcluidas} de ${totalAcoes} ações concluídas` : '—'}
                to="/rh/nr1/plano-acao"
              />
              <OptionCard
                layout="horizontal"
                icon="ph:file-text-bold"
                label="Relatório de gestão"
                desc="Rastreabilidade completa, com responsável técnico"
                to="/rh/nr1/relatorio"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
