import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { RiscoPorDimensaoGrid, MapaCalorTable } from '../../components/Nr1Resultado'
import { PAGE_MAX_W } from '../../lib/layout'
import { fmtData, pct } from '../../lib/nr1'
import { useService } from '../../hooks/useService'
import { useRh } from '../../contexts/RhContext'
import { nr1CampanhaService, nr1ResultadoService } from '../../services/nr1'

/* NR1-RH-06 — Visão geral da conformidade NR-1 (RF-I01).

   Era o hub que concentrava as outras 8 telas atrás de si (cards + atalhos
   secundários) — o que fazia o módulo parecer improvisado e espremia
   mapeamento, planejamento e controle atrás de um único ponto de entrada.
   Agora cada uma dessas telas tem seu próprio item de primeira classe no
   sidebar (ver RhAppLayout), e esta tela volta a ser só o que o nome promete:
   um resumo de 10 segundos — a campanha está de pé? onde o risco está
   concentrado, no total e por área? — sem virar menu.

   O mapa de calor por área, que antes era uma tela própria (`/rh/nr1/mapa-
   calor`), passou a viver aqui (sempre da campanha em campo) e na aba
   "Resultado" de cada campanha em `/rh/nr1/campanha/:id` — não faz mais
   sentido como item de navegação à parte, já que os dois lugares que
   importam agora o mostram direto. */

export function NR1RhCockpit() {
  const { setInstrumentoNr1 } = useRh()
  const campanha = useService(() => nr1CampanhaService.ativa(), [])
  const dimensoes = useService(() => nr1ResultadoService.mediaPorDimensao(), [])
  const mapa = useService(() => nr1ResultadoService.mapaCalor(), [])

  /* Publica o instrumento aplicado no contexto: inventário e relatório citam
     modelo + versão a partir daqui (RF-F02). */
  const c = campanha.status === 'success' ? campanha.data : undefined
  useEffect(() => {
    if (c) setInstrumentoNr1({ campanhaId: c.id, protocolo: c.protocolo, modeloId: c.modeloId, modeloNome: c.modeloNome, versao: c.versao })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c?.id])

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />
        <PageHeader
          title="Conformidade NR-1"
          subtitle="O estado do ciclo, num relance."
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
                qual instrumento foi aplicado, a base da rastreabilidade.
              </p>
            </div>
            <Link to="/rh/nr1/campanha" className="mt-1 inline-flex items-center gap-1.5 font-heading text-[13px] font-semibold text-primary hover:underline dark:text-primary-300">
              Configurar campanha
              <Icon icon="ph:arrow-right-bold" width={13} aria-hidden />
            </Link>
          </div>
        )}

        {campanha.status === 'success' && campanha.data && (
          <Link to={`/rh/nr1/campanha/${campanha.data.id}`} className="mb-6 block rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-hover">
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

        {/* Risco por dimensão (macro) */}
        <section className="mb-6">
          <h2 className="mb-3 text-[15px] font-semibold text-ink">Risco por dimensão</h2>

          {(dimensoes.status === 'idle' || dimensoes.status === 'loading') && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}</div>
          )}
          {dimensoes.status === 'error' && <ErrorState message={dimensoes.message} onRetry={dimensoes.reload} />}
          {dimensoes.status === 'success' && <RiscoPorDimensaoGrid dimensoes={dimensoes.data} />}
          <p className="mt-2 text-[11px] text-ink-muted">
            Média de 1 a 5, onde 5 é a situação desejável. Áreas com menos de 4 respondentes
            não entram no cálculo.
          </p>
        </section>

        {/* Mapa de calor por área */}
        <section>
          <h2 className="mb-3 text-[15px] font-semibold text-ink">Mapa de calor por área</h2>
          {(mapa.status === 'idle' || mapa.status === 'loading') && <Skeleton className="h-80 w-full rounded-lg" />}
          {mapa.status === 'error' && <ErrorState message={mapa.message} onRetry={mapa.reload} />}
          {mapa.status === 'success' && <MapaCalorTable linhas={mapa.data} />}
        </section>

        <div className="mt-6 flex gap-3 rounded-lg border border-border bg-surface-2 p-4">
          <Icon icon="ph:info-bold" width={20} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
          <p className="text-[12px] leading-relaxed text-ink-secondary">
            A YNA fornece o insumo qualificado: o inventário e o relatório de gestão. A
            responsabilidade técnica pelo PGR permanece com o SESMT ou a consultoria de SST da
            sua empresa.
          </p>
        </div>
      </div>
    </div>
  )
}
