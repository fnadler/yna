import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Skeleton } from './Skeleton'
import { ErrorState } from './ErrorState'
import { RiscoPorDimensaoGrid, MapaCalorTable } from './Nr1Resultado'
import { Nr1PerguntasSheet, type Nr1PerguntasEscopo } from './Nr1PerguntasSheet'
import { Nr1AnaliseRiscoModal, type Nr1AnaliseEscopo } from './Nr1AnaliseRisco'
import { useService } from '../hooks/useService'
import { nr1CampanhaService, nr1ResultadoService } from '../services/nr1'
import { NR1_DIMENSOES } from '../data/nr1Mock'
import {
  NR1_SIM_MAX_DIMENSOES, NR1_SIM_MAX_DEPARTAMENTOS, lerSimulacaoDaUrl, nr1SimulacaoEhPadrao,
  nr1DimensoesParaSimulacao, nr1DepartamentosParaSimulacao, nr1MapaCalorSimulado, nr1MediaPorDimensaoSimulada,
} from '../lib/nr1Simulacao'
import type { Nr1Campanha } from '../types'

/** Rótulo curto de um ciclo para o seletor — o pedaço depois do "·" no nome
   ("Avaliação de riscos psicossociais · 1º semestre 2026" → "1º semestre
   2026"). */
const cicloLabelCurto = (c: Nr1Campanha) => {
  const partes = c.nome.split('·')
  return (partes.length > 1 ? partes[partes.length - 1] : c.nome)!.trim()
}

/* Bloco "Risco por domínio + mapa de calor" com seletor de ciclo, simulador
   de densidade (`?dims=`/`?deps=`, ver `lib/nr1Simulacao.ts`) e a abertura
   da pontuação por pergunta ao clicar num card ou numa célula. Extraído da
   Visão geral (`NR1RhCockpit`) para o Inventário de riscos mostrar
   exatamente o mesmo comportamento — inclusive as regras de layout para
   mais domínios/departamentos, que moram em `Nr1Resultado`.

   `somenteEncerrados`: o Inventário só olha ciclos finalizados (é a base do
   PGR — um ciclo em campo ainda não fechou o retrato); a Visão geral mostra
   todos, incluindo o em campo. */
export function Nr1PainelRiscoMapa({ titulo, subtitulo, somenteEncerrados = false, analise = false, onRiscosAlterados }: {
  titulo: string
  subtitulo: string
  somenteEncerrados?: boolean
  /** Clicar num card/célula abre a análise de risco em tela cheia
     (`Nr1AnaliseRiscoModal`) em vez da lista de perguntas. */
  analise?: boolean
  onRiscosAlterados?: () => void
}) {
  const [perguntas, setPerguntas] = useState<Nr1PerguntasEscopo | null>(null)
  const [analiseEscopo, setAnaliseEscopo] = useState<Nr1AnaliseEscopo | null>(null)

  const campanhas = useService(() => nr1CampanhaService.list(), [])
  const [cicloEscolhidoId, setCicloEscolhidoId] = useState<string | null>(null)
  const ciclos = campanhas.status === 'success'
    ? [...campanhas.data]
      .filter((c) => (somenteEncerrados ? c.status === 'encerrada' : true))
      .sort((a, b) => b.inicio.localeCompare(a.inicio))
    : []
  const campanhaId = cicloEscolhidoId ?? ciclos[0]?.id

  const dimensoes = useService(() => nr1ResultadoService.mediaPorDimensao(campanhaId), [campanhaId])
  const mapa = useService(() => nr1ResultadoService.mapaCalor(campanhaId), [campanhaId])

  const abrir = (p: Nr1PerguntasEscopo) => {
    if (!analise) { setPerguntas(p); return }
    const ciclo = ciclos.find((c) => c.id === p.campanhaId)
    if (mapa.status !== 'success' || !ciclo) return
    setAnaliseEscopo({
      campanhaId: p.campanhaId,
      cicloLabel: cicloLabelCurto(ciclo),
      dimensaoId: p.dimensaoId,
      departamentoId: p.departamentoId,
      linhas: mapa.data,
    })
  }

  const [searchParams, setSearchParams] = useSearchParams()
  const { nDimensoes, nDepartamentos } = lerSimulacaoDaUrl(searchParams)
  const simulando = !nr1SimulacaoEhPadrao(nDimensoes, nDepartamentos)
  const dimensoesSimuladas = useMemo(() => nr1DimensoesParaSimulacao(nDimensoes), [nDimensoes])
  const departamentosSimulados = useMemo(() => nr1DepartamentosParaSimulacao(nDepartamentos), [nDepartamentos])
  const mapaSimulado = useMemo(
    () => nr1MapaCalorSimulado(dimensoesSimuladas, departamentosSimulados),
    [dimensoesSimuladas, departamentosSimulados],
  )
  const mediaSimulada = useMemo(
    () => nr1MediaPorDimensaoSimulada(dimensoesSimuladas, mapaSimulado),
    [dimensoesSimuladas, mapaSimulado],
  )
  const atualizarSimulacao = (patch: { dims?: string; deps?: string }) => {
    const next = new URLSearchParams(searchParams)
    if (patch.dims !== undefined) next.set('dims', patch.dims)
    if (patch.deps !== undefined) next.set('deps', patch.deps)
    setSearchParams(next, { replace: true })
  }
  const restaurarPadrao = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('dims')
    next.delete('deps')
    setSearchParams(next, { replace: true })
  }

  const semCiclo = campanhas.status === 'success' && ciclos.length === 0

  return (
    <section className="rounded-lg border border-border bg-surface p-4 lg:p-5">
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold text-ink">{titulo}</h2>
        <p className="mt-0.5 text-[12px] text-ink-secondary">{subtitulo}</p>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-surface-2 px-3.5 py-2.5">
        <span className="flex items-center gap-1.5 text-[12px] font-medium text-ink-secondary">
          <Icon icon="ph:flask-bold" width={14} aria-hidden />
          Simular:
        </span>
        <label className="flex items-center gap-1.5 text-[12px] text-ink-secondary">
          domínios
          <input
            type="number"
            min={1}
            max={NR1_SIM_MAX_DIMENSOES}
            value={nDimensoes}
            onChange={(e) => atualizarSimulacao({ dims: e.target.value })}
            className="w-14 rounded border border-border bg-surface px-1.5 py-1 text-center text-[12px] text-ink outline-none focus:border-primary"
            aria-label="Número de domínios a simular"
          />
        </label>
        <span className="text-ink-muted">×</span>
        <label className="flex items-center gap-1.5 text-[12px] text-ink-secondary">
          departamentos
          <input
            type="number"
            min={1}
            max={NR1_SIM_MAX_DEPARTAMENTOS}
            value={nDepartamentos}
            onChange={(e) => atualizarSimulacao({ deps: e.target.value })}
            className="w-14 rounded border border-border bg-surface px-1.5 py-1 text-center text-[12px] text-ink outline-none focus:border-primary"
            aria-label="Número de departamentos a simular"
          />
        </label>
        {simulando && (
          <button onClick={restaurarPadrao} className="font-heading text-[12px] font-semibold text-primary hover:underline dark:text-primary-300">
            Restaurar padrão (8 × 6)
          </button>
        )}
      </div>
      {simulando && (
        <p className="mb-5 flex items-start gap-1.5 rounded-lg bg-warning/15 px-3.5 py-2.5 text-[12px] leading-relaxed text-warning-ink">
          <Icon icon="ph:warning-bold" width={14} className="mt-0.5 shrink-0" aria-hidden />
          Dados fictícios, gerados só para simular o layout com {nDimensoes} domínio{nDimensoes === 1 ? '' : 's'} e {nDepartamentos} departamento{nDepartamentos === 1 ? '' : 's'} — não refletem o ciclo real.
        </p>
      )}

      {!simulando && campanhas.status === 'loading' && <Skeleton className="mb-5 h-11 w-full max-w-md rounded-lg" />}
      {!simulando && campanhas.status === 'error' && <ErrorState message={campanhas.message} onRetry={campanhas.reload} />}
      {!simulando && ciclos.length > 0 && (
        <div className="mb-5 flex gap-1 overflow-x-auto rounded-lg bg-surface-2 p-1" role="tablist" aria-label="Ciclo de referência">
          {ciclos.map((cmp) => (
            <button
              key={cmp.id}
              role="tab"
              aria-selected={cmp.id === campanhaId}
              onClick={() => setCicloEscolhidoId(cmp.id)}
              className={`shrink-0 whitespace-nowrap rounded-lg px-3.5 py-2.5 font-heading text-sm font-semibold transition-all ${
                cmp.id === campanhaId ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
              }`}
            >
              {cicloLabelCurto(cmp)}
              {cmp.status === 'em-campo' && <span className="ml-1.5 text-[11px] font-normal text-primary dark:text-primary-300">· em campo</span>}
            </button>
          ))}
        </div>
      )}

      {!simulando && semCiclo ? (
        <div className="rounded-lg bg-surface-2 px-5 py-8 text-center">
          <p className="text-[13.5px] text-ink-secondary">
            Nenhum ciclo de avaliação finalizado ainda. O mapa de calor aparece aqui quando o primeiro ciclo for encerrado.
          </p>
        </div>
      ) : (
        <>
          <h3 className="mb-3 text-[13px] font-semibold text-ink-secondary">Risco por domínio</h3>
          {simulando && <RiscoPorDimensaoGrid dimensoes={mediaSimulada} />}
          {!simulando && (dimensoes.status === 'idle' || dimensoes.status === 'loading') && (
            <div className="flex flex-col gap-2">
              {NR1_DIMENSOES.map((d) => <Skeleton key={d.id} className="h-10 w-full rounded-lg" />)}
            </div>
          )}
          {!simulando && dimensoes.status === 'error' && <ErrorState message={dimensoes.message} onRetry={dimensoes.reload} />}
          {!simulando && dimensoes.status === 'success' && (
            <RiscoPorDimensaoGrid
              dimensoes={dimensoes.data}
              onClickDimensao={campanhaId ? (dimensaoId) => {
                const d = dimensoes.data.find((x) => x.dimensaoId === dimensaoId)!
                abrir({ campanhaId, dimensaoId, media: d.media })
              } : undefined}
            />
          )}
          <p className="mt-2 text-[11px] text-ink-muted">
            Média de 1 a 5, onde 5 é a situação desejável. Áreas com menos de 4 respondentes não
            entram no cálculo.{!simulando && campanhaId && (analise ? ' Clique num card para analisar o domínio e registrar riscos.' : ' Clique num card para ver a pontuação por pergunta.')}
          </p>

          <div className="my-6 border-t border-border" />

          <h3 className="mb-3 text-[13px] font-semibold text-ink-secondary">Mapa de calor por área</h3>
          {simulando && <MapaCalorTable dimensoes={dimensoesSimuladas} linhas={mapaSimulado} />}
          {!simulando && (mapa.status === 'idle' || mapa.status === 'loading') && <Skeleton className="h-80 w-full rounded-lg" />}
          {!simulando && mapa.status === 'error' && <ErrorState message={mapa.message} onRetry={mapa.reload} />}
          {!simulando && mapa.status === 'success' && (
            <MapaCalorTable
              dimensoes={NR1_DIMENSOES}
              linhas={mapa.data}
              onClickCelula={campanhaId ? (dimensaoId, departamentoId, departamento) => {
                const linha = mapa.data.find((l) => l.departamentoId === departamentoId)!
                const media = linha.celulas.find((c) => c.dimensaoId === dimensaoId)!.media ?? 0
                abrir({ campanhaId, dimensaoId, departamentoId, departamento, media })
              } : undefined}
            />
          )}
          {!simulando && campanhaId && <p className="mt-2 text-[11px] text-ink-muted">{analise ? 'Clique numa célula para analisar o domínio naquela área e registrar riscos.' : 'Clique numa célula para ver a pontuação por pergunta daquela área.'}</p>}
        </>
      )}

      <Nr1PerguntasSheet escopo={perguntas} onClose={() => setPerguntas(null)} />
      <Nr1AnaliseRiscoModal escopo={analiseEscopo} onClose={() => setAnaliseEscopo(null)} onRiscosAlterados={onRiscosAlterados} />
    </section>
  )
}
