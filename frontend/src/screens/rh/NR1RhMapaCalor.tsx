import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { NIVEL_RISCO, NIVEL_PROTEGIDO } from '../../lib/nr1'
import { useService } from '../../hooks/useService'
import { nr1ResultadoService } from '../../services/nr1'
import { NR1_DIMENSOES, NR1_PONTUACAO } from '../../data/nr1Mock'
import type { Nr1LinhaMapa } from '../../types'

/* NR1-RH-02 — Mapa de calor de riscos psicossociais (RF-C01/02/03/05).

   Dimensão × área, no padrão do heatmap do RH-13. Duas escolhas deliberadas:

   · a cor nunca carrega o significado sozinha — cada célula traz a média e o
     rótulo do nível, para leitura sem depender de percepção de cor;
   · recortes abaixo de 4 respondentes aparecem explicitamente como protegidos,
     em vez de sumirem da tabela. Ocultar sem dizer faria o RH achar que a área
     não respondeu. */

const K = NR1_PONTUACAO.kAnonimato

export function NR1RhMapaCalor() {
  const mapa = useService(() => nr1ResultadoService.mapaCalor(), [])

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />

        <Link to="/rh/nr1" className="mt-2 mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary transition-colors hover:text-ink lg:mt-0">
          <Icon icon="ph:arrow-left-bold" width={14} aria-hidden />
          Conformidade NR-1
        </Link>

        <PageHeader
          title="Mapa de calor"
          subtitle="Onde o risco psicossocial está concentrado, por dimensão e por área."
        />

        {(mapa.status === 'idle' || mapa.status === 'loading') && <Skeleton className="h-80 w-full rounded-lg" />}
        {mapa.status === 'error' && <ErrorState message={mapa.message} onRetry={mapa.reload} />}
        {mapa.status === 'success' && <Mapa linhas={mapa.data} />}
      </div>
    </div>
  )
}

function Mapa({ linhas }: { linhas: Nr1LinhaMapa[] }) {
  const protegidas = linhas.filter((l) => l.protegido)

  return (
    <>
      {/* Tabela — rola horizontalmente dentro do próprio container */}
      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full min-w-[680px] border-collapse">
          <caption className="sr-only">
            Nível de risco psicossocial por dimensão e área, em média de 1 a 5, onde 5 é a
            situação desejável.
          </caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="px-4 py-3 text-left text-[12px] font-semibold text-ink-secondary">Área</th>
              {NR1_DIMENSOES.map((d) => (
                <th key={d.id} scope="col" className="px-2 py-3 text-center text-[11px] font-semibold text-ink-secondary">
                  {d.nome}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.departamentoId} className="border-b border-border last:border-0">
                <th scope="row" className="px-4 py-3 text-left">
                  <p className="text-[13px] font-medium text-ink">{l.departamento}</p>
                  <p className="text-[11px] font-normal text-ink-muted">{l.respondentes} respondentes</p>
                </th>

                {l.protegido ? (
                  <td colSpan={NR1_DIMENSOES.length} className="px-2 py-3 text-center">
                    <span className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-[11px] font-medium ${NIVEL_PROTEGIDO.cls}`}>
                      <Icon icon="ph:lock-simple-bold" width={12} aria-hidden />
                      Dados protegidos (menos de {K} respostas)
                    </span>
                  </td>
                ) : (
                  l.celulas.map((c) => {
                    const st = c.nivel ? NIVEL_RISCO[c.nivel] : NIVEL_PROTEGIDO
                    return (
                      <td key={c.dimensaoId} className="px-2 py-2 text-center">
                        <span className={`flex min-h-[52px] min-w-[64px] flex-col items-center justify-center gap-0.5 rounded-md px-2 py-1 ${st.cls}`}>
                          <span className="font-mono text-[15px] font-bold leading-none">{c.media?.toFixed(1) ?? '—'}</span>
                          <span className="text-[10.5px] font-semibold leading-none">{st.label}</span>
                        </span>
                      </td>
                    )
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legenda textual */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        {(['baixo', 'atencao', 'risco', 'critico'] as const).map((n) => (
          <span key={n} className="flex items-center gap-1.5 text-[12px] text-ink-secondary">
            <span className={`h-3 w-3 rounded-[4px] ${NIVEL_RISCO[n].dot}`} aria-hidden />
            {NIVEL_RISCO[n].label} · {NIVEL_RISCO[n].acao}
          </span>
        ))}
      </div>

      {/* Anonimato */}
      <div className="mt-5 flex gap-3 rounded-lg border border-border bg-surface p-4">
        <Icon icon="ph:lock-simple-bold" width={20} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
        <div>
          <p className="text-[13px] font-semibold text-ink">Anonimato estatístico</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-ink-secondary">
            Nenhum recorte com menos de {K} respondentes é exibido — em um time de três pessoas,
            um número já identificaria alguém.
            {protegidas.length > 0 && (
              <> Neste ciclo, {protegidas.length === 1 ? 'a área' : 'as áreas'}{' '}
                <strong className="font-semibold text-ink">{protegidas.map((p) => p.departamento).join(', ')}</strong>{' '}
                {protegidas.length === 1 ? 'está protegida' : 'estão protegidas'}.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 rounded-lg border border-border bg-surface-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12.5px] leading-relaxed text-ink-secondary">
          Os fatores de maior risco já estão consolidados no inventário para o PGR.
        </p>
        <Link
          to="/rh/nr1/inventario"
          className="inline-flex shrink-0 items-center gap-1.5 font-heading text-[13px] font-semibold text-primary hover:underline dark:text-primary-300"
        >
          Ver inventário
          <Icon icon="ph:arrow-right-bold" width={13} aria-hidden />
        </Link>
      </div>
    </>
  )
}
