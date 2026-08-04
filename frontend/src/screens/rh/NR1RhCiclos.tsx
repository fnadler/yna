import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { NIVEL_RISCO, fmtData } from '../../lib/nr1'
import { useService } from '../../hooks/useService'
import { nr1ResultadoService } from '../../services/nr1'
import { NR1_DIMENSOES, nr1NivelPorMedia } from '../../data/nr1Mock'
import type { Nr1Ciclo } from '../../types'

/* NR1-RH-07 — Ciclos e reavaliação (RF-G01/02/03). P1.

   A re-medição é o que prova redução de risco e sustenta a renovação — o
   diferencial que quase ninguém crava. A comparação entre ciclos só é honesta
   quando também mostra QUAL instrumento foi aplicado em cada um: mudar de
   versão entre ciclos afeta a comparabilidade, e isso precisa ficar visível. */

export function NR1RhCiclos() {
  const ciclos = useService(() => nr1ResultadoService.ciclos(), [])

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />

        <Link to="/rh/nr1" className="mt-2 mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary transition-colors hover:text-ink lg:mt-0">
          <Icon icon="ph:arrow-left-bold" width={14} aria-hidden />
          Conformidade NR-1
        </Link>

        <PageHeader title="Ciclos e reavaliação" subtitle="Como o risco evoluiu entre as campanhas." />

        {(ciclos.status === 'idle' || ciclos.status === 'loading') && (
          <div className="flex flex-col gap-3">{[0, 1].map((i) => <Skeleton key={i} className="h-52 w-full rounded-lg" />)}</div>
        )}
        {ciclos.status === 'error' && <ErrorState message={ciclos.message} onRetry={ciclos.reload} />}
        {ciclos.status === 'success' && <Comparacao ciclos={ciclos.data} />}
      </div>
    </div>
  )
}

function Comparacao({ ciclos }: { ciclos: Nr1Ciclo[] }) {
  if (ciclos.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface px-5 py-14 text-center">
        <p className="text-[15px] font-semibold text-ink">Ainda não há ciclos para comparar</p>
        <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-ink-secondary">
          A comparação aparece a partir da segunda campanha encerrada.
        </p>
      </div>
    )
  }

  /* Do mais recente para o mais antigo; o anterior serve de base do delta. */
  const ordenados = [...ciclos].reverse()
  const atual = ordenados[0]!
  const anterior = ordenados[1]
  const instrumentoMudou = anterior && (anterior.modeloNome !== atual.modeloNome || anterior.versao !== atual.versao)

  return (
    <>
      {/* Evolução por dimensão */}
      <section className="mb-6">
        <h2 className="mb-3 text-[15px] font-semibold text-ink">Evolução por dimensão</h2>
        <div className="flex flex-col gap-2">
          {NR1_DIMENSOES.map((dim) => {
            const agora = atual.mediaPorDimensao.find((m) => m.dimensaoId === dim.id)?.media
            const antes = anterior?.mediaPorDimensao.find((m) => m.dimensaoId === dim.id)?.media
            if (agora === undefined) return null
            const delta = antes !== undefined ? Number((agora - antes).toFixed(1)) : undefined
            const st = NIVEL_RISCO[nr1NivelPorMedia(agora)]
            return (
              <div key={dim.id} className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
                <Icon icon={dim.icon} width={20} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-[13.5px] font-semibold text-ink">{dim.nome}</p>
                  {antes !== undefined && anterior && (
                    <p className="mt-0.5 text-[11.5px] text-ink-muted">
                      era {antes.toFixed(1)} em {anterior.nome}
                    </p>
                  )}
                </div>
                {delta !== undefined && (
                  <span className={`shrink-0 text-[12px] font-semibold ${delta > 0 ? 'text-success-ink' : delta < 0 ? 'text-danger-ink' : 'text-ink-muted'}`}>
                    {delta > 0 ? '↑' : delta < 0 ? '↓' : '→'} {Math.abs(delta).toFixed(1)}
                  </span>
                )}
                <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 ${st.cls}`}>
                  <span className="font-mono text-[14px] font-bold leading-none">{agora.toFixed(1)}</span>
                  <span className="text-[10.5px] font-semibold leading-none">{st.label}</span>
                </span>
              </div>
            )
          })}
        </div>
        {delta0Positivo(atual, anterior) && (
          <p className="mt-2 text-[12px] leading-relaxed text-success-ink">
            O risco caiu em todas as dimensões desde o ciclo anterior — é essa a evidência de que
            o plano de ação está funcionando.
          </p>
        )}
      </section>

      {instrumentoMudou && (
        <div className="mb-6 flex gap-3 rounded-lg border border-warning/30 bg-warning-bg p-4">
          <Icon icon="ph:warning-bold" width={20} className="mt-0.5 shrink-0 text-warning-ink" aria-hidden />
          <p className="text-[12px] leading-relaxed text-ink-secondary">
            O instrumento mudou entre os dois ciclos ({anterior!.modeloNome} v{anterior!.versao} →{' '}
            {atual.modeloNome} v{atual.versao}). A comparação continua válida para as dimensões do
            núcleo, mas itens acrescentados ou removidos afetam a média — considere isso ao ler a
            variação.
          </p>
        </div>
      )}

      {/* Histórico */}
      <section>
        <h2 className="mb-3 text-[15px] font-semibold text-ink">Histórico de campanhas</h2>
        <ol className="flex flex-col gap-2">
          {ordenados.map((c) => (
            <li key={c.campanhaId} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-heading text-[14px] font-semibold text-ink">{c.nome}</p>
                  <p className="mt-0.5 text-[12px] text-ink-secondary">
                    {c.modeloNome} · versão {c.versao}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-ink-muted">
                    {c.encerradaEm === '—' ? 'em campo' : `encerrada em ${fmtData(c.encerradaEm)}`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-[20px] font-bold leading-none text-ink">{c.participacaoPct}%</p>
                  <p className="mt-0.5 text-[11px] text-ink-secondary">participação</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-6 flex gap-3 rounded-lg border border-border bg-surface-2 p-4">
        <Icon icon="ph:arrows-clockwise-bold" width={20} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
        <p className="text-[12px] leading-relaxed text-ink-secondary">
          O PGR é um processo contínuo, não um evento único. Além da cadência regular, vale
          reavaliar após mudanças relevantes — reestruturação, fusão, novo turno —, porque elas
          alteram o risco psicossocial.
        </p>
      </div>
    </>
  )
}

/** Verdadeiro quando todas as dimensões melhoraram em relação ao ciclo anterior. */
function delta0Positivo(atual: Nr1Ciclo, anterior?: Nr1Ciclo): boolean {
  if (!anterior) return false
  return atual.mediaPorDimensao.every((m) => {
    const antes = anterior.mediaPorDimensao.find((x) => x.dimensaoId === m.dimensaoId)?.media
    return antes !== undefined && m.media > antes
  })
}
