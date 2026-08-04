import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { RadarChart } from '../components/RadarChart'
import { MobileTopBar } from '../components/MobileTopBar'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/Button'
import { Skeleton } from '../components/Skeleton'
import { ErrorState } from '../components/ErrorState'
import { PAGE_MAX_W } from '../lib/layout'
import { fmtData } from '../lib/nr1'
import { useService } from '../hooks/useService'
import { nr1BeneficiarioService } from '../services/nr1'
import { NR1_DIMENSOES } from '../data/nr1Mock'
import type { Nr1MinhaAvaliacao } from '../types'

/* NR1-BEN-06 — Minha evolução (RF-G01). P1.

   Só o dado da própria pessoa, comparando ciclos. O RH nunca vê esta tela nem
   os números dela — é a contrapartida de quem respondeu. */

export function NR1BenEvolucao() {
  const avaliacoes = useService(() => nr1BeneficiarioService.minhasAvaliacoes(), [])

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MobileTopBar />
        <PageHeader
          title="A sua evolução"
          subtitle="Como você tem enxergado o seu trabalho ao longo do tempo."
          className="mt-2 lg:mt-0"
        />

        {avaliacoes.status === 'loading' && (
          <div className="flex flex-col gap-3"><Skeleton className="h-72 w-full rounded-lg" /><Skeleton className="h-32 w-full rounded-lg" /></div>
        )}
        {avaliacoes.status === 'error' && <ErrorState message={avaliacoes.message} onRetry={avaliacoes.reload} />}

        {avaliacoes.status === 'success' && avaliacoes.data.length === 0 && (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-surface px-5 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-surface-2 text-ink-secondary">
              <Icon icon="ph:chart-line-bold" width={26} aria-hidden />
            </span>
            <h2 className="text-[18px] font-semibold text-ink">Ainda não há nada para comparar</h2>
            <p className="max-w-sm text-[13.5px] leading-relaxed text-ink-secondary">
              Quando você responder à primeira conversa sobre o ambiente de trabalho, o seu
              retrato aparece aqui — e só você o vê.
            </p>
          </div>
        )}

        {avaliacoes.status === 'success' && avaliacoes.data.length > 0 && (
          <Evolucao avaliacoes={avaliacoes.data} />
        )}
      </div>
    </div>
  )
}

function Evolucao({ avaliacoes }: { avaliacoes: Nr1MinhaAvaliacao[] }) {
  /* A mais recente primeiro; a anterior vira a série de comparação do radar. */
  const ordenadas = [...avaliacoes].sort((a, b) => b.respondidoEm.localeCompare(a.respondidoEm))
  const atual = ordenadas[0]!
  const anterior = ordenadas[1]

  /* Rótulo curto nos eixos: "Organização do trabalho" não cabe no SVG. */
  const labels = atual.scores.map((s) => NR1_DIMENSOES.find((d) => d.id === s.dimensaoId)?.curto ?? s.nome)
  const valores = atual.scores.map((s) => s.media)
  const anteriores = anterior?.scores.map((s) => s.media)

  return (
    <>
      <section className="flex flex-col items-center gap-4 rounded-lg border border-border bg-surface p-5 lg:p-6">
        <RadarChart
          values={valores}
          labels={labels}
          previousValues={anteriores}
          size={220}
          max={5}
          ariaLabel={`A sua avaliação por dimensão: ${atual.scores.map((s) => `${s.nome} ${s.media.toFixed(1)} de 5`).join(', ')}`}
        />
        <p className="text-center text-[12px] text-ink-secondary">
          Respondido em {fmtData(atual.respondidoEm)}
          {anterior && ` · a linha mais clara é ${fmtData(anterior.respondidoEm)}`}
        </p>
      </section>

      <section className="mt-4 flex flex-col gap-2">
        {atual.scores.map((s) => {
          const antes = anterior?.scores.find((x) => x.dimensaoId === s.dimensaoId)?.media
          const delta = antes !== undefined ? Number((s.media - antes).toFixed(1)) : undefined
          return (
            <div key={s.dimensaoId} className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
              <div className="min-w-0 flex-1">
                <p className="font-heading text-[14px] font-semibold text-ink">{s.nome}</p>
                {delta !== undefined && (
                  <p className={`mt-0.5 text-[12px] font-medium ${delta > 0 ? 'text-success-ink' : delta < 0 ? 'text-danger-ink' : 'text-ink-muted'}`}>
                    {delta > 0 ? '↑' : delta < 0 ? '↓' : '→'} {Math.abs(delta).toFixed(1)} desde a última vez
                  </p>
                )}
              </div>
              <p className="shrink-0 font-mono text-[20px] font-bold tracking-tight text-ink">{s.media.toFixed(1)}</p>
            </div>
          )
        })}
      </section>

      <div className="mt-5 flex gap-3 rounded-lg bg-surface-2 p-4">
        <Icon icon="ph:eye-slash-bold" width={19} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
        <p className="text-[12px] leading-relaxed text-ink-secondary">
          Estes números são só seus. Ninguém na sua empresa tem acesso a eles — o que a empresa
          enxerga é o retrato do time inteiro, sem nome.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-2 rounded-lg border border-border bg-surface p-5">
        <p className="font-heading text-[15px] font-semibold text-ink">Quer conversar sobre isso?</p>
        <p className="text-[13px] leading-relaxed text-ink-secondary">
          Um retrato é um ponto de partida, não um diagnóstico. Se algo aqui te chamou a
          atenção, você não precisa lidar com isso sozinho.
        </p>
        <div className="mt-2">
          <Link to="/matches">
            <Button variant="secondary" iconRight="ph:arrow-right-bold">
              Ver profissionais disponíveis
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}
