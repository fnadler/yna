import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { Button } from '../../components/Button'
import { OptionCard } from '../../components/OptionCard'
import { StatTile } from '../../components/StatTile'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { useRh } from '../../contexts/RhContext'
import { rhConviteService, rhDashboardService, rhBeneficiarioService } from '../../services/rh'

/* RH-10 — Visão geral (home do RH). Resumo de adesão, funil de convites,
   alertas NR-1 e atalhos para as ações operacionais. Tudo agregado. */

export function RH10Home() {
  const { empresa, usuario } = useRh()
  const navigate = useNavigate()
  const funil = useService(() => rhConviteService.funil(), [])
  const alertas = useService(() => rhDashboardService.alertas(), [])
  const beneficiarios = useService(() => rhBeneficiarioService.list(), [])

  const firstName = usuario.nome.split(' ')[0]
  const ativos = beneficiarios.status === 'success'
    ? beneficiarios.data.filter((b) => b.status === 'ativo').length
    : 0
  const cadastrados = beneficiarios.status === 'success' ? beneficiarios.data.length : 0
  const adesao = empresa.licencasContratadas > 0
    ? Math.round((funil.status === 'success' ? funil.data.cadastroConcluido : ativos) / empresa.licencasContratadas * 100)
    : 0
  const concluidos = funil.status === 'success' ? funil.data.cadastroConcluido : ativos

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />

        <div className="pt-2 pb-6 lg:pt-9 lg:pb-6">
          <h1 className="text-[26px] lg:text-[32px] font-medium tracking-[-0.02em] text-ink">Oi, {firstName}.</h1>
          <p className="mt-0.5 text-[15px] text-ink-secondary">Veja como está o cuidado na {empresa.nomeFantasia}.</p>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:items-start">
          {/* Coluna principal */}
          <div className="flex flex-col gap-5">
            {/* Adesão — card herói */}
            <section>
              <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
                <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                  Adesão ao benefício
                </span>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[40px] font-bold leading-none tracking-[-0.02em] text-ink">{adesao}%</p>
                    <p className="mt-2 text-[13px] text-ink-secondary">
                      {concluidos} de {empresa.licencasContratadas} licenças ativas
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-pill bg-success-bg px-3 py-1 font-heading text-xs font-medium text-success-ink">
                    <Icon icon="ph:trend-up-bold" width={13} aria-hidden /> +9 p.p. no mês
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-pill bg-surface-2">
                  <div className="h-full rounded-pill bg-primary transition-all" style={{ width: `${adesao}%` }} />
                </div>
                <Button variant="ghost" iconRight="ph:arrow-right-bold" className="self-start" onClick={() => navigate('/rh/indicadores')}>
                  Ver indicadores completos
                </Button>
              </div>
            </section>

            {/* Funil de convites */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-ink">Funil de convites</h2>
                <button onClick={() => navigate('/rh/convites')} className="font-heading text-sm font-medium text-primary transition-colors hover:text-primary-600 dark:text-primary-300">
                  Ver tudo
                </button>
              </div>
              {funil.status === 'loading' && <Skeleton className="h-24 w-full rounded-lg" />}
              {funil.status === 'error' && <ErrorState message={funil.message} onRetry={funil.reload} />}
              {funil.status === 'success' && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <StatTile icon="ph:paper-plane-tilt-bold" value={String(funil.data.enviado)} label="Enviados" />
                  <StatTile icon="ph:envelope-open-bold" value={String(funil.data.aberto)} label="Abertos" />
                  <StatTile icon="ph:user-plus-bold" value={String(funil.data.cadastroIniciado)} label="Iniciaram" />
                  <StatTile icon="ph:user-check-bold" value={String(funil.data.cadastroConcluido)} label="Concluíram" />
                </div>
              )}
            </section>

            {/* Alertas NR-1 */}
            {alertas.status === 'success' && alertas.data.length > 0 && (
              <section>
                <h2 className="mb-3 text-[15px] font-semibold text-ink">Atenção NR-1</h2>
                <div className="flex flex-col gap-2">
                  {alertas.data.map((a) => (
                    <OptionCard
                      key={a.id}
                      variant={a.nivel === 'alto' ? 'danger' : 'warning'}
                      icon="ph:warning-bold"
                      label={`${a.departamento} · ${a.dimensao}`}
                      desc={a.mensagem}
                      onClick={() => navigate('/rh/indicadores')}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Atalhos */}
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-ink">Atalhos</h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <OptionCard layout="shortcut" icon="ph:user-plus-bold" label="Beneficiários" desc="Cadastrar e gerir o quadro" to="/rh/beneficiarios" />
                <OptionCard layout="shortcut" icon="ph:paper-plane-tilt-bold" label="Convites" desc="Disparar e acompanhar" to="/rh/convites" />
                <OptionCard layout="shortcut" icon="ph:tree-structure-bold" label="Departamentos" desc="Estrutura do mapa de calor" to="/rh/departamentos" />
              </div>
            </section>
          </div>

          {/* Coluna lateral */}
          <div className="mt-6 flex flex-col gap-5 lg:mt-0">
            {/* Licenças */}
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-ink">Licenças</h2>
              {beneficiarios.status === 'loading' && <Skeleton className="h-28 w-full rounded-lg" />}
              {beneficiarios.status === 'success' && (
                <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[13px] text-ink-secondary">Em uso</span>
                    <span className="font-mono text-sm font-semibold text-ink">{cadastrados} / {empresa.licencasContratadas}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-pill bg-surface-2">
                    <div className="h-full rounded-pill bg-primary" style={{ width: `${Math.min(100, Math.round(cadastrados / empresa.licencasContratadas * 100))}%` }} />
                  </div>
                  <p className="text-[12px] leading-relaxed text-ink-muted">
                    {empresa.licencasContratadas - cadastrados} licenças disponíveis para novos cadastros.
                  </p>
                </div>
              )}
            </section>

            {/* Contrato + CSM */}
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-ink">Seu plano</h2>
              <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 text-[13px]">
                <div className="flex items-center gap-2 text-ink">
                  <Icon icon="ph:seal-check-bold" width={16} className="text-primary dark:text-primary-300" aria-hidden />
                  <span className="font-semibold">{empresa.plano}</span>
                </div>
                <div className="flex justify-between text-ink-secondary">
                  <span>Vigência</span>
                  <span className="text-ink">até {empresa.contratoFim.split('-').reverse().join('/')}</span>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-ink-muted">Sua CSM na YNA</p>
                  <p className="mt-1 font-semibold text-ink">Fernanda · Customer Success</p>
                  <Button variant="secondary" size="sm" iconLeft="ph:chat-circle-bold" className="mt-2" onClick={() => { window.location.href = 'mailto:fernanda@yna.com.br' }}>
                    Falar com a Fernanda
                  </Button>
                </div>
              </div>
            </section>

            {/* Lembrete LGPD */}
            <section>
              <div className="flex gap-3 rounded-lg border border-border bg-surface-2 p-4">
                <Icon icon="ph:shield-check-bold" width={20} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
                <p className="text-[12px] leading-relaxed text-ink-secondary">
                  Você nunca vê dados clínicos ou de jornada individual. Todos os indicadores são
                  agregados, com anonimato a partir de 4 pessoas por recorte.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
