import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { NIVEL_RISCO, NIVEL_PROTEGIDO } from '../lib/nr1'
import { NR1_DIMENSOES, NR1_PONTUACAO, nr1NivelPorMedia } from '../data/nr1Mock'
import type { Nr1LinhaMapa, Nr1DimensaoId } from '../types'

/* Peças de resultado do módulo de Conformidade NR-1, compartilhadas entre a
   Visão geral (`/rh/nr1`, sempre a campanha em campo) e a aba "Resultado" de
   uma campanha específica (`/rh/nr1/campanha/:id`) — mesmo visual em
   qualquer um dos dois lugares onde o risco (macro e por área) aparece. */

type DimensaoMedia = { dimensaoId: Nr1DimensaoId; nome: string; media: number; nivel: ReturnType<typeof nr1NivelPorMedia> }

/** Risco por dimensão (macro) — grade de 4 cards. */
export function RiscoPorDimensaoGrid({ dimensoes }: { dimensoes: DimensaoMedia[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {dimensoes.map((d) => {
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
  )
}

/** Mapa de calor por dimensão × área, com legenda e nota de anonimato. */
export function MapaCalorTable({ linhas }: { linhas: Nr1LinhaMapa[] }) {
  const K = NR1_PONTUACAO.kAnonimato
  const protegidas = linhas.filter((l) => l.protegido)

  return (
    <>
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

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        {(['baixo', 'atencao', 'risco', 'critico'] as const).map((n) => (
          <span key={n} className="flex items-center gap-1.5 text-[12px] text-ink-secondary">
            <span className={`h-3 w-3 rounded-[4px] ${NIVEL_RISCO[n].dot}`} aria-hidden />
            {NIVEL_RISCO[n].label} · {NIVEL_RISCO[n].acao}
          </span>
        ))}
      </div>

      <div className="mt-5 flex gap-3 rounded-lg border border-border bg-surface p-4">
        <Icon icon="ph:lock-simple-bold" width={20} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
        <div>
          <p className="text-[13px] font-semibold text-ink">Anonimato estatístico</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-ink-secondary">
            Nenhum recorte com menos de {K} respondentes é exibido. Em um time de três pessoas,
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
