import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from './Button'
import { Badge } from './Badge'
import { Select } from './Select'
import { Sheet } from './Sheet'
import { Skeleton } from './Skeleton'
import { ErrorState } from './ErrorState'
import { Nr1AdicionarRiscoForm } from './Nr1AdicionarRiscoForm'
import { Nr1RiscoAnaliseSheet } from './Nr1RiscoAnaliseSheet'
import { NIVEL_RISCO } from '../lib/nr1'
import { NR1_DIMENSOES, nr1DimensaoNome } from '../data/nr1Mock'
import { useService } from '../hooks/useService'
import { nr1ResultadoService } from '../services/nr1'
import { rhDepartamentoService } from '../services/rh'
import type { Nr1DimensaoId, Nr1NivelRisco, Nr1RiscoSugeridoLeitura } from '../types'

/** Colunas da tabela no desktop: nota (nível/"não identificado"), risco,
   dimensão, departamentos envolvidos e ação (adicionar/já no inventário) —
   mesmo padrão de `RISCOS_GRID_COLS` do Inventário (`NR1RhInventario.tsx`),
   adaptado aos campos que este card já tinha (sem uma coluna de "ações
   vinculadas": aqui o equivalente é "já no inventário" ou o botão de
   adicionar, não um plano de ação). */
const SUGESTOES_GRID_COLS = 'grid-cols-[130px_1fr_140px_110px_190px]'

/* Aba "Riscos sugeridos" (dentro do detalhe de um ciclo) — ⚠️ TRIAGEM
   ASSISTIDA, não diagnóstico. As 7 leituras vêm de `NR1_RISCOS_SUGERIDOS`
   (padrões de literatura, COPSOQ II-Br + possível associação CID-11) mas o
   "disparado"/"não identificado" e os departamentos envolvidos são
   calculados a partir do MESMO dado do "Risco por dimensão"/mapa de calor
   deste ciclo (`nr1ResultadoService.riscosSugeridos`) — nunca um número à
   parte.

   Três camadas de disclaimer, como pedido: aqui no topo da aba (geral +
   por card), e o detalhado dentro de `Nr1RiscoAnaliseSheet`. Em nenhum
   lugar o texto afirma um risco ou um diagnóstico — sempre "possível",
   "sugere", "pode se aplicar". A decisão de investigar, validar com SST e
   agir é sempre da empresa (RH). */
export function Nr1RiscosSugeridosTab({ campanhaId }: { campanhaId: string }) {
  const leituras = useService(() => nr1ResultadoService.riscosSugeridos(campanhaId), [campanhaId])
  const departamentos = useService(() => rhDepartamentoService.list(), [])
  const [analisando, setAnalisando] = useState<Nr1RiscoSugeridoLeitura | null>(null)
  const [adicionando, setAdicionando] = useState<Nr1RiscoSugeridoLeitura | null>(null)
  const [nivelFiltro, setNivelFiltro] = useState<'todos' | Nr1NivelRisco>('todos')
  const [dimensaoFiltro, setDimensaoFiltro] = useState<'todas' | Nr1DimensaoId>('todas')
  const [departamentoFiltro, setDepartamentoFiltro] = useState('todos')

  const listaDepartamentos = departamentos.status === 'success'
    ? [...departamentos.data].sort((a, b) => a.nome.localeCompare(b.nome))
    : []

  const filtrosAtivos = nivelFiltro !== 'todos' || dimensaoFiltro !== 'todas' || departamentoFiltro !== 'todos'
  const limparFiltros = () => { setNivelFiltro('todos'); setDimensaoFiltro('todas'); setDepartamentoFiltro('todos') }

  const filtradas = leituras.status === 'success'
    ? leituras.data
      .filter((l) => (nivelFiltro === 'todos' ? true : l.nivelEmpresa === nivelFiltro))
      .filter((l) => (dimensaoFiltro === 'todas' ? true : l.sugestao.dimensaoId === dimensaoFiltro))
      .filter((l) => (departamentoFiltro === 'todos' ? true : l.departamentosEnvolvidos.some((d) => d.departamentoId === departamentoFiltro)))
    : []

  return (
    <div className="flex flex-col gap-5">
      <DisclaimerGeral />

      <div>
        <h2 className="text-[15px] font-semibold text-ink">7 possíveis riscos psicossociais</h2>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-secondary">
          Leituras de padrão calculadas a partir das respostas deste ciclo. Nenhum risco é
          adicionado ao inventário automaticamente — você escolhe quais investigar e quais levar
          adiante.
        </p>
      </div>

      {/* Filtros — nível de risco, dimensão e departamento, combináveis. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Nível de risco</p>
          <Select
            value={nivelFiltro}
            onChange={(v) => setNivelFiltro(v as 'todos' | Nr1NivelRisco)}
            ariaLabel="Filtrar por nível de risco"
            options={[
              { value: 'todos', label: 'Todos os níveis' },
              ...(['critico', 'risco', 'atencao', 'baixo'] as Nr1NivelRisco[]).map((n) => ({ value: n, label: NIVEL_RISCO[n].label })),
            ]}
          />
        </div>
        <div>
          <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Dimensão</p>
          <Select
            value={dimensaoFiltro}
            onChange={(v) => setDimensaoFiltro(v as 'todas' | Nr1DimensaoId)}
            ariaLabel="Filtrar por dimensão"
            options={[{ value: 'todas', label: 'Todas as dimensões' }, ...NR1_DIMENSOES.map((d) => ({ value: d.id, label: d.nome }))]}
          />
        </div>
        <div>
          <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Departamento</p>
          <Select
            value={departamentoFiltro}
            onChange={setDepartamentoFiltro}
            ariaLabel="Filtrar por departamento"
            options={[{ value: 'todos', label: 'Todos os departamentos' }, ...listaDepartamentos.map((d) => ({ value: d.id, label: d.nome }))]}
          />
        </div>
      </div>

      {filtrosAtivos && (
        <button onClick={limparFiltros} className="-mt-3 inline-flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-primary hover:underline dark:text-primary-300">
          <Icon icon="ph:x-circle-bold" width={13} aria-hidden />
          Limpar filtros
        </button>
      )}

      {(leituras.status === 'idle' || leituras.status === 'loading') && (
        <div className="flex flex-col gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}</div>
      )}
      {leituras.status === 'error' && <ErrorState message={leituras.message} onRetry={leituras.reload} />}
      {leituras.status === 'success' && (
        filtradas.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface px-5 py-14 text-center">
            <p className="text-[15px] font-semibold text-ink">Nenhuma sugestão encontrada</p>
            <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-ink-secondary">
              Nenhuma leitura combina com os filtros escolhidos.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Cabeçalho das colunas — só no desktop; no mobile cada linha já
               se organiza em pilha. */}
            <div className={`hidden items-center gap-3 px-3.5 lg:grid ${SUGESTOES_GRID_COLS}`}>
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Nota</span>
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Risco</span>
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Dimensão</span>
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Deptos.</span>
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Ação</span>
            </div>
            {filtradas.map((leitura) => (
              <RiscoSugeridoLinha
                key={leitura.sugestao.id}
                leitura={leitura}
                onClick={() => setAnalisando(leitura)}
                onAdicionar={() => setAdicionando(leitura)}
              />
            ))}
          </div>
        )
      )}

      <Nr1RiscoAnaliseSheet
        leitura={analisando}
        onClose={() => setAnalisando(null)}
        onAdicionarAoInventario={(l) => { setAnalisando(null); setAdicionando(l) }}
      />

      <Sheet
        open={adicionando !== null}
        onClose={() => setAdicionando(null)}
        title="Adicionar ao inventário"
        icon="ph:plus-bold"
        size="md"
      >
        {adicionando && (
          <Nr1AdicionarRiscoForm
            onClose={() => setAdicionando(null)}
            onSaved={() => { setAdicionando(null); leituras.reload() }}
            prefill={{
              dimensaoId: adicionando.sugestao.dimensaoId,
              departamentoIds: adicionando.departamentosEnvolvidos.map((d) => d.departamentoId),
              fator: `${adicionando.sugestao.nome} — ${adicionando.sugestao.descricao}`,
              danos: `Possíveis danos associados (a validar com SST): ${adicionando.sugestao.cids.map((c) => `${c.codigo} (${c.descricao})`).join('; ')}.`,
              probabilidade: adicionando.departamentosEnvolvidos.length > 0 ? 4 : 3,
              severidade: NIVEL_PARA_SEVERIDADE[adicionando.nivelEmpresa],
              controles: adicionando.sugestao.acoesRecomendadas.join('\n'),
              origemSugestaoId: adicionando.sugestao.id,
            }}
          />
        )}
      </Sheet>
    </div>
  )
}

const NIVEL_PARA_SEVERIDADE = { baixo: 2, atencao: 3, risco: 4, critico: 5 } as const

function DisclaimerGeral() {
  return (
    <div className="rounded-lg border border-warning/30 bg-warning-bg p-4">
      <div className="flex gap-3">
        <Icon icon="ph:warning-bold" width={20} className="mt-0.5 shrink-0 text-warning-ink" aria-hidden />
        <div>
          <p className="font-heading text-[13.5px] font-semibold text-warning-ink">Sobre os riscos sugeridos</p>
          <ul className="mt-2 flex flex-col gap-1.5 text-[12px] leading-relaxed text-warning-ink">
            <li>Estas são <strong>sugestões</strong> baseadas em padrões de literatura — não diagnósticos automáticos.</li>
            <li>Possíveis enquadramentos CID-11 são <strong>apenas indicativos</strong>, nunca diagnósticos médicos.</li>
            <li><strong>Validação com um profissional de SST é obrigatória</strong> antes de qualquer ação organizacional.</li>
            <li>A <strong>responsabilidade</strong> por validar e agir é da empresa contratante (RH), em conjunto com profissionais habilitados.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

/** Linha de uma leitura — a visualização em tabela dos riscos sugeridos. No
   desktop, cinco colunas alinhadas com o cabeçalho (`SUGESTOES_GRID_COLS`):
   nota (nível calculado, ou "Não identificado" quando a sugestão não
   disparou neste ciclo), risco (nome curto + descrição), dimensão,
   departamentos envolvidos (contagem, com popover para a lista completa) e
   ação (adicionar ao inventário, ou a confirmação de que já está lá).
   Abaixo de `lg`, os mesmos dados em pilha, como card.

   Clicar em qualquer parte da linha abre a análise completa da sugestão
   (`Nr1RiscoAnaliseSheet`, mesmo destino do antigo botão "Analisar") — só o
   popover de departamentos e o botão "Adicionar" impedem a propagação do
   clique, senão disputariam o mesmo toque com a abertura da análise. */
function RiscoSugeridoLinha({ leitura, onClick, onAdicionar }: {
  leitura: Nr1RiscoSugeridoLeitura
  onClick: () => void
  onAdicionar: () => void
}) {
  const { sugestao, mediaEmpresa, nivelEmpresa, disparado, departamentosEnvolvidos, jaNoInventario } = leitura
  const nivel = NIVEL_RISCO[nivelEmpresa]

  const nota = disparado ? (
    <span className={`flex w-fit flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 ${nivel.cls}`}>
      <span className="font-mono text-[14px] font-bold leading-none">{mediaEmpresa.toFixed(1)}</span>
      <span className="text-[9px] font-semibold leading-none">{nivel.label}</span>
    </span>
  ) : (
    <Badge tone="neutral" icon="ph:eye-bold" className="w-fit">Não identificado</Badge>
  )

  const acao = jaNoInventario ? (
    <Badge tone="success" icon="ph:check-circle-bold">Já no inventário</Badge>
  ) : (
    <Button
      size="sm"
      variant="secondary"
      iconLeft="ph:plus-bold"
      onClick={(e) => { e.stopPropagation(); onAdicionar() }}
    >
      Adicionar ao inventário
    </Button>
  )

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      className="cursor-pointer rounded-lg border border-border bg-surface p-3.5 transition-colors hover:border-border-strong hover:bg-surface-hover"
    >
      {/* Desktop — colunas */}
      <div className={`hidden items-center gap-3 lg:grid ${SUGESTOES_GRID_COLS}`}>
        {nota}
        <div className="min-w-0">
          <p className="font-heading text-[13.5px] font-semibold text-ink">{sugestao.nomeCurto}</p>
          <p className="mt-0.5 text-[12px] leading-snug text-ink-secondary">{sugestao.descricao}</p>
        </div>
        <p className="min-w-0 truncate text-[12.5px] text-ink-secondary">{nr1DimensaoNome(sugestao.dimensaoId)}</p>
        <DepartamentosEnvolvidosPopover departamentos={departamentosEnvolvidos} />
        <div>{acao}</div>
      </div>

      {/* Mobile/tablet — pilha, como card */}
      <div className="flex flex-col gap-3 lg:hidden">
        <div className="flex items-start gap-3">
          {nota}
          <div className="min-w-0 flex-1">
            <p className="font-heading text-[14px] font-semibold text-ink">{sugestao.nomeCurto}</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-secondary">{sugestao.descricao}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3 text-[11.5px] text-ink-secondary">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-ink-muted">{nr1DimensaoNome(sugestao.dimensaoId)}</span>
          <DepartamentosEnvolvidosPopover departamentos={departamentosEnvolvidos} />
        </div>
        <div className="border-t border-border pt-3">{acao}</div>
      </div>
    </div>
  )
}

/** Contagem de departamentos envolvidos numa leitura, com um popover que
   mostra a lista completa (nome + média) ao clicar — mesmo padrão do
   popover de departamentos do Inventário (`NR1RhInventario.tsx`), mas sem
   precisar de uma lista separada de departamentos: `departamentosEnvolvidos`
   já traz o nome e a média de cada um, calculados do mesmo mapa de calor. */
function DepartamentosEnvolvidosPopover({ departamentos }: {
  departamentos: { departamentoId: string; departamento: string; media: number; nivel: Nr1NivelRisco }[]
}) {
  const [open, setOpen] = useState(false)

  if (departamentos.length === 0) return <span className="text-[12.5px] text-ink-muted">—</span>

  return (
    <div className="relative w-fit">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        aria-expanded={open}
        aria-label={`${departamentos.length} ${departamentos.length === 1 ? 'departamento envolvido' : 'departamentos envolvidos'}, ver lista`}
        className="inline-flex items-center gap-1 rounded-pill bg-surface-2 px-2 py-1 text-[12px] font-medium text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
      >
        <Icon icon="ph:buildings-bold" width={12} className="shrink-0" aria-hidden />
        {departamentos.length}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setOpen(false) }} />
          <div
            role="menu"
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 top-full z-40 mt-1.5 w-60 rounded-lg border border-border bg-surface p-2 shadow-lg"
          >
            <p className="mb-1 px-2 pt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
              Departamentos envolvidos
            </p>
            <ul className="flex flex-col gap-0.5">
              {departamentos.map((d) => {
                const dst = NIVEL_RISCO[d.nivel]
                return (
                  <li key={d.departamentoId} className="flex items-center justify-between gap-2 rounded px-2 py-1.5 text-[12.5px] text-ink">
                    <span className="min-w-0 truncate">{d.departamento}</span>
                    <span className={`shrink-0 rounded-pill px-1.5 py-0.5 font-mono text-[10.5px] font-semibold ${dst.cls}`}>
                      {d.media.toFixed(1)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
