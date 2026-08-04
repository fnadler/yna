import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { NIVEL_RISCO, fmtData, pct } from '../../lib/nr1'
import { useService } from '../../hooks/useService'
import { useRh } from '../../contexts/RhContext'
import { nr1CampanhaService, nr1ResultadoService, nr1AcaoService, nr1CanalService } from '../../services/nr1'
import { NR1_DIMENSOES } from '../../data/nr1Mock'

/* NR1-RH-06 — Painel de conformidade NR-1 (RF-I01) e porta de entrada do
   cockpit. Estende a lógica do RH-13 com o recorte de conformidade.

   O que o RH precisa enxergar em 10 segundos: se a campanha está de pé, onde
   o risco está concentrado, e se o plano de ação está vivo. Tudo agregado —
   nunca uma resposta individual. */

export function NR1RhCockpit() {
  const { setInstrumentoNr1 } = useRh()
  const campanha = useService(() => nr1CampanhaService.ativa(), [])
  const dimensoes = useService(() => nr1ResultadoService.mediaPorDimensao(), [])
  const acoes = useService(() => nr1AcaoService.list(), [])
  const relatos = useService(() => nr1CanalService.list(), [])

  /* Publica o instrumento aplicado no contexto: inventário e relatório citam
     modelo + versão a partir daqui (RF-F02). */
  const c = campanha.status === 'success' ? campanha.data : undefined
  useEffect(() => {
    if (c) setInstrumentoNr1({ campanhaId: c.id, protocolo: c.protocolo, modeloId: c.modeloId, modeloNome: c.modeloNome, versao: c.versao })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c?.id])

  const acoesAtrasadas = acoes.status === 'success' ? acoes.data.filter((a) => a.status === 'atrasada').length : 0
  const acoesConcluidas = acoes.status === 'success' ? acoes.data.filter((a) => a.status === 'concluida').length : 0
  const totalAcoes = acoes.status === 'success' ? acoes.data.length : 0
  const relatosAbertos = relatos.status === 'success' ? relatos.data.filter((r) => r.status !== 'concluido').length : 0

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />
        <PageHeader
          title="Conformidade NR-1"
          subtitle="Riscos psicossociais: avaliar, documentar no PGR, agir e comprovar."
          className="mt-2 lg:mt-0"
        />

        {/* Estado da campanha */}
        {(campanha.status === 'idle' || campanha.status === 'loading') && <Skeleton className="mb-6 h-32 w-full rounded-lg" />}
        {campanha.status === 'error' && <div className="mb-6"><ErrorState message={campanha.message} onRetry={campanha.reload} /></div>}
        {campanha.status === 'success' && !campanha.data && (
          <div className="mb-6 flex flex-col items-start gap-3 rounded-lg border border-border bg-surface p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2 text-ink-secondary">
              <Icon icon="ph:calendar-plus-bold" width={20} aria-hidden />
            </span>
            <div>
              <p className="font-heading text-[15px] font-semibold text-ink">Nenhuma campanha em campo</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-ink-secondary">
                A avaliação de riscos psicossociais começa por uma campanha. É ela que registra
                qual instrumento foi aplicado — a base da rastreabilidade.
              </p>
            </div>
            <Link to="/rh/nr1/campanha" className="mt-1 inline-flex items-center gap-1.5 font-heading text-[13px] font-semibold text-primary hover:underline dark:text-primary-300">
              Configurar campanha
              <Icon icon="ph:arrow-right-bold" width={13} aria-hidden />
            </Link>
          </div>
        )}

        {campanha.status === 'success' && campanha.data && (
          <Link to="/rh/nr1/campanha" className="mb-6 block rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-hover">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">Campanha em campo</span>
                <p className="mt-1 font-heading text-[16px] font-semibold text-ink">{campanha.data.nome}</p>
                <p className="mt-1 text-[12.5px] text-ink-secondary">
                  {fmtData(campanha.data.inicio)} a {fmtData(campanha.data.fim)} · protocolo {campanha.data.protocolo}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[30px] font-bold leading-none tracking-[-0.02em] text-ink">
                  {pct(campanha.data.respostas, campanha.data.elegiveis)}%
                </p>
                <p className="mt-0.5 text-[12px] text-ink-secondary">
                  {campanha.data.respostas} de {campanha.data.elegiveis} responderam
                </p>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-pill bg-surface-2">
              <div
                className="h-full rounded-pill bg-gradient-to-r from-primary to-pink transition-all duration-500"
                style={{ width: `${pct(campanha.data.respostas, campanha.data.elegiveis)}%` }}
              />
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-ink-muted">
              <Icon icon="ph:seal-check-bold" width={12} aria-hidden />
              Instrumento aplicado: {campanha.data.modeloNome} · versão {campanha.data.versao}
            </p>
          </Link>
        )}

        {/* Risco por dimensão */}
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-[15px] font-semibold text-ink">Risco por dimensão</h2>
            <Link to="/rh/nr1/mapa-calor" className="inline-flex items-center gap-1 text-[12.5px] font-medium text-primary hover:underline dark:text-primary-300">
              Ver por área
              <Icon icon="ph:arrow-right-bold" width={12} aria-hidden />
            </Link>
          </div>

          {(dimensoes.status === 'idle' || dimensoes.status === 'loading') && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}</div>
          )}
          {dimensoes.status === 'error' && <ErrorState message={dimensoes.message} onRetry={dimensoes.reload} />}
          {dimensoes.status === 'success' && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {dimensoes.data.map((d) => {
                const meta = NR1_DIMENSOES.find((x) => x.id === d.dimensaoId)
                const st = NIVEL_RISCO[d.nivel]
                return (
                  <div key={d.dimensaoId} className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4">
                    <Icon icon={meta?.icon ?? 'ph:list-bold'} width={18} className="text-primary dark:text-primary-300" aria-hidden />
                    <p className="text-[12.5px] font-medium leading-snug text-ink">{meta?.nome}</p>
                    <p className="text-[26px] font-bold leading-none tracking-[-0.02em] text-ink">{d.media.toFixed(1)}</p>
                    <span className={`inline-flex w-fit items-center rounded-pill px-2 py-0.5 text-[11px] font-semibold ${st.cls}`}>
                      {st.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
          <p className="mt-2 text-[11px] text-ink-muted">
            Média de 1 a 5, onde 5 é a situação desejável. Áreas com menos de 4 respondentes
            não entram no cálculo.
          </p>
        </section>

        {/* Estado da conformidade — os elos da cadeia */}
        <section className="mb-6">
          <h2 className="mb-3 text-[15px] font-semibold text-ink">A cadeia da conformidade</h2>
          <div className="flex flex-col gap-2">
            <EloCard
              icon="ph:clipboard-text-bold"
              titulo="Inventário para o PGR"
              descricao="Fatores de risco, grupo exposto, nível e controles recomendados — pronto para incorporar ao PGR."
              to="/rh/nr1/inventario"
              estado="pronto"
            />
            <EloCard
              icon="ph:list-checks-bold"
              titulo="Plano de ação 5W2H"
              descricao={totalAcoes > 0
                ? `${acoesConcluidas} de ${totalAcoes} ações concluídas${acoesAtrasadas > 0 ? ` · ${acoesAtrasadas} com prazo vencido` : ''}`
                : 'Nenhuma ação registrada ainda.'}
              to="/rh/nr1/plano-acao"
              estado={acoesAtrasadas > 0 ? 'atencao' : totalAcoes > 0 ? 'pronto' : 'pendente'}
            />
            <EloCard
              icon="ph:seal-check-bold"
              titulo="Relatório de gestão"
              descricao="Trilha risco → avaliação → ação → evidência, com a versão do instrumento e o responsável técnico."
              to="/rh/nr1/relatorio"
              estado="pronto"
            />
            <EloCard
              icon="ph:megaphone-simple-bold"
              titulo="Canal de escuta"
              descricao={relatosAbertos > 0
                ? `${relatosAbertos} ${relatosAbertos === 1 ? 'caso aberto' : 'casos abertos'} em tratamento.`
                : 'Nenhum caso aberto no momento.'}
              to="/rh/nr1/canal"
              estado={relatosAbertos > 0 ? 'atencao' : 'pronto'}
            />
          </div>
        </section>

        {/* Atalhos secundários */}
        <section className="grid gap-2 sm:grid-cols-2">
          <AtalhoCard icon="ph:chart-line-up-bold" titulo="Ciclos e reavaliação" descricao="Comparar resultados entre campanhas." to="/rh/nr1/ciclos" />
          <AtalhoCard icon="ph:megaphone-bold" titulo="Kit de comunicação" descricao="Materiais prontos para engajar o time." to="/rh/nr1/kit" />
        </section>

        <div className="mt-6 flex gap-3 rounded-lg border border-border bg-surface-2 p-4">
          <Icon icon="ph:info-bold" width={20} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
          <p className="text-[12px] leading-relaxed text-ink-secondary">
            A YNA fornece o insumo qualificado — o inventário e o relatório de gestão. A
            responsabilidade técnica pelo PGR permanece com o SESMT ou a consultoria de SST da
            sua empresa.
          </p>
        </div>
      </div>
    </div>
  )
}

const ESTADO_STYLE = {
  pronto: { cls: 'bg-success-bg text-success-ink', icon: 'ph:check-circle-bold', label: 'Em dia' },
  atencao: { cls: 'bg-warning-bg text-warning-ink', icon: 'ph:warning-bold', label: 'Requer atenção' },
  pendente: { cls: 'bg-surface-2 text-ink-secondary', icon: 'ph:circle-dashed-bold', label: 'Pendente' },
} as const

function EloCard({ icon, titulo, descricao, to, estado }: {
  icon: string
  titulo: string
  descricao: string
  to: string
  estado: keyof typeof ESTADO_STYLE
}) {
  const st = ESTADO_STYLE[estado]
  return (
    <Link to={to} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-surface-hover">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
        <Icon icon={icon} width={20} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-heading text-sm font-semibold text-ink">{titulo}</p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-secondary">{descricao}</p>
      </div>
      <span className={`inline-flex shrink-0 items-center gap-1 rounded-pill px-2.5 py-1 text-[11px] font-semibold ${st.cls}`}>
        <Icon icon={st.icon} width={11} aria-hidden />
        <span className="hidden sm:inline">{st.label}</span>
      </span>
    </Link>
  )
}

function AtalhoCard({ icon, titulo, descricao, to }: { icon: string; titulo: string; descricao: string; to: string }) {
  return (
    <Link to={to} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-surface-hover">
      <Icon icon={icon} width={20} className="mt-0.5 shrink-0 text-ink-secondary" aria-hidden />
      <div className="min-w-0">
        <p className="font-heading text-[13.5px] font-semibold text-ink">{titulo}</p>
        <p className="mt-0.5 text-[12px] text-ink-secondary">{descricao}</p>
      </div>
      <Icon icon="ph:caret-right-bold" width={15} className="ml-auto mt-1 shrink-0 text-ink-muted" aria-hidden />
    </Link>
  )
}
