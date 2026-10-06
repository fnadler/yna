import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Select } from './Select'
import { Skeleton } from './Skeleton'
import { ErrorState } from './ErrorState'
import { NIVEL_RISCO } from '../lib/nr1'
import { useService } from '../hooks/useService'
import { nr1ResultadoService } from '../services/nr1'
import { NR1_DIMENSOES } from '../data/nr1Mock'
import type { Nr1DimensaoId, Nr1LinhaMapa } from '../types'

/** Pergunta clicada na lista, com o recorte em que ela estava sendo vista. */
export interface Nr1PerguntaClicada {
  dimensaoId: Nr1DimensaoId
  itemId: string
  /** Departamento do filtro (ausente = toda a empresa). */
  departamentoId?: string
  departamento?: string
}

/* Perguntas de um ciclo da mais crítica para a menos crítica, filtráveis
   por domínio e departamento. Usado abaixo do mapa de calor na Matriz de
   risco e na aba "Resultado" do detalhe do ciclo. `linhas` é o mapa de
   calor do ciclo — dele saem as áreas do filtro; as que estão abaixo do
   k-anonimato não têm pontuação por pergunta e ficam fora, com aviso. */
export function Nr1PerguntasCriticas({ campanhaId, cicloLabel, linhas, onClickPergunta, dicaClique }: {
  campanhaId: string | undefined
  cicloLabel?: string
  linhas: Nr1LinhaMapa[]
  onClickPergunta?: (p: Nr1PerguntaClicada) => void
  /** Texto abaixo da lista explicando o clique. */
  dicaClique?: (departamento?: string) => string
}) {
  const [dimensaoFiltro, setDimensaoFiltro] = useState<'todos' | Nr1DimensaoId>('todos')
  const [departamentoFiltro, setDepartamentoFiltro] = useState('todos')

  const areas = linhas.filter((l) => !l.protegido)
  const protegidas = linhas.filter((l) => l.protegido)

  const dims = dimensaoFiltro === 'todos' ? NR1_DIMENSOES.map((d) => d.id) : [dimensaoFiltro]
  const dep = departamentoFiltro === 'todos' ? undefined : departamentoFiltro
  const nomeDep = areas.find((a) => a.departamentoId === dep)?.departamento

  const perguntas = useService(async () => {
    if (!campanhaId) return []
    const porDominio = await Promise.all(dims.map(async (dimensaoId) => {
      const itens = await nr1ResultadoService.itensPorDimensao(campanhaId, dimensaoId, dep)
      return itens.map((i) => ({ ...i, dimensaoId }))
    }))
    return porDominio.flat().sort((a, b) => a.media - b.media)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campanhaId, dimensaoFiltro, departamentoFiltro])

  return (
    <section className="rounded-lg border border-border bg-surface p-4 lg:p-5">
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold text-ink">Perguntas da mais crítica para a menos crítica</h2>
        <p className="mt-0.5 text-[12px] text-ink-secondary">
          {cicloLabel ? `Ciclo ${cicloLabel} · ` : ''}média de 1 a 5, onde 5 é a situação desejável.
        </p>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Domínio</p>
          <Select
            value={dimensaoFiltro}
            onChange={(v) => setDimensaoFiltro(v as 'todos' | Nr1DimensaoId)}
            ariaLabel="Filtrar perguntas por domínio"
            options={[{ value: 'todos', label: 'Todos os domínios' }, ...NR1_DIMENSOES.map((d) => ({ value: d.id, label: d.nome }))]}
          />
        </div>
        <div>
          <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Departamento</p>
          <Select
            value={departamentoFiltro}
            onChange={setDepartamentoFiltro}
            ariaLabel="Filtrar perguntas por departamento"
            options={[{ value: 'todos', label: 'Toda a empresa' }, ...areas.map((a) => ({ value: a.departamentoId, label: a.departamento }))]}
          />
          {protegidas.length > 0 && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-muted">
              <Icon icon="ph:lock-simple-bold" width={11} aria-hidden />
              {protegidas.map((p) => p.departamento).join(', ')}: menos de 4 respondentes, oculto por anonimato.
            </p>
          )}
        </div>
      </div>

      {!campanhaId && (
        <p className="rounded-lg bg-surface-2 px-5 py-8 text-center text-[13px] text-ink-secondary">Nenhum ciclo finalizado ainda.</p>
      )}
      {campanhaId && (perguntas.status === 'idle' || perguntas.status === 'loading') && (
        <div className="flex flex-col gap-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div>
      )}
      {perguntas.status === 'error' && <ErrorState message={perguntas.message} onRetry={perguntas.reload} />}
      {campanhaId && perguntas.status === 'success' && perguntas.data.length === 0 && (
        <p className="rounded-lg bg-surface-2 px-5 py-8 text-center text-[13px] text-ink-secondary">Nenhuma pergunta para este filtro.</p>
      )}
      {campanhaId && perguntas.status === 'success' && perguntas.data.length > 0 && (
        <>
          <ol className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {perguntas.data.map((p, i) => {
              const st = NIVEL_RISCO[p.nivel]
              const dom = NR1_DIMENSOES.find((d) => d.id === p.dimensaoId)
              const conteudo = (
                <>
                  <span className="mt-0.5 w-6 shrink-0 text-right font-mono text-[11px] text-ink-muted">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] leading-snug text-ink">{p.texto}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11.5px] text-ink-secondary">
                      <Icon icon={dom?.icon ?? 'ph:list-bold'} width={12} aria-hidden />
                      <span className="font-medium">{dom?.nome ?? p.dimensaoId}</span>
                      <span className="font-mono text-[10.5px] text-ink-muted">· {p.itemId}</span>
                    </p>
                  </div>
                  <span className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-2.5 py-1 ${st.cls}`}>
                    <span className="font-mono text-[13px] font-bold leading-none">{p.media.toFixed(1)}</span>
                    <span className="text-[9.5px] font-semibold leading-none">{st.label}</span>
                  </span>
                </>
              )
              return (
                <li key={`${p.dimensaoId}-${p.itemId}`}>
                  {onClickPergunta ? (
                    <button
                      type="button"
                      onClick={() => onClickPergunta({ dimensaoId: p.dimensaoId, itemId: p.itemId, departamentoId: dep, departamento: nomeDep })}
                      className="flex w-full items-start gap-3 px-3.5 py-3 text-left transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-surface-hover"
                    >
                      {conteudo}
                    </button>
                  ) : (
                    <div className="flex items-start gap-3 px-3.5 py-3">{conteudo}</div>
                  )}
                </li>
              )
            })}
          </ol>
          {dicaClique && <p className="mt-2 text-[11px] text-ink-muted">{dicaClique(nomeDep)}</p>}
        </>
      )}
    </section>
  )
}
