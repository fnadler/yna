import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { PrazoBadge } from '../../components/PrazoBadge'
import { AcaoLinha, LISTA_GRID_COLS } from '../../components/Nr1AcaoLinha'
import { Nr1AcaoDetalheModal } from '../../components/Nr1AcaoDetalhe'
import { AcaoForm, nr1RotuloRisco } from '../../components/Nr1AcaoForm'
import { Toast } from '../../components/Toast'
import { Sheet } from '../../components/Sheet'
import { Modal } from '../../components/Modal'
import { Select } from '../../components/Select'
import { SearchSelect } from '../../components/SearchSelect'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { nr1AcaoService, nr1ResultadoService } from '../../services/nr1'
import { rhDepartamentoService } from '../../services/rh'
import { NR1_DIMENSOES } from '../../data/nr1Mock'
import type { Nr1Acao, Nr1RiscoInventario, Nr1AcaoStatus, Nr1DimensaoId } from '../../types'

/* NR1-RH-04 — Plano de ação 5W2H (RF-E01/E02).

   Cada ação nasce vinculada a um risco do inventário — é esse vínculo que
   fecha a cadeia risco → ação exigida pela norma.

   Concluir uma ação sem nenhum comentário nem evidência é permitido, mas
   pede confirmação: "evidência de execução registrada" é o que a
   fiscalização verifica, então a pessoa é avisada de que está concluindo
   sem esse registro (botão "Concluir ação" e soltar em "Concluída" no
   Kanban passam pela mesma pergunta).

   Duas visualizações, por pedido explícito — o modelo de card único (uma
   coluna, um card grande por ação) ficava difícil de acompanhar execução
   com muitas ações abertas ao mesmo tempo:
   - "Lista" (padrão): uma linha compacta por ação, com prazo e status
     sempre visíveis, ordenada por urgência (vencidas e vencendo primeiro).
   - "Kanban": as mesmas ações agrupadas em colunas por status. Sem
     arrastar-e-soltar entre colunas — mudar o status de uma ação continua
     sendo feito em "Editar ação" ou "Concluir ação", os mesmos caminhos de
     sempre; o kanban aqui é uma visualização, não um novo mecanismo de
     edição. Se isso vier a fazer falta, é um pedido separado.

   O controle de vencimento (badge de prazo) é
   deliberadamente independente do status manual da ação: um "vencendo"/
   "vencida" é uma leitura objetiva de `quando` vs. hoje (`nr1UrgenciaPrazo`,
   `lib/nr1.ts`), não do status 5W2H que a pessoa escolheu — os dois podem
   discordar (uma ação "em andamento" pode já estar com o prazo vencido), e
   é exatamente por isso que vale a pena mostrar os dois sinais separados,
   não fundir um no outro. */

const STATUS_FILTROS: { value: string; label: string }[] = [
  { value: 'todas', label: 'Todas as ações' },
  { value: 'atrasada', label: 'Atrasadas' },
  { value: 'em-andamento', label: 'Em andamento' },
  { value: 'planejada', label: 'Planejadas' },
  { value: 'concluida', label: 'Concluídas' },
]

type Visualizacao = 'lista' | 'kanban'

export function NR1RhPlanoAcao() {
  const [params] = useSearchParams()
  /* Só para decidir o "voltar" do topo (veio de um deep-link do Inventário
     ou não) — o filtro de risco em si vira estado próprio abaixo, para
     poder ser trocado pela pessoa sem depender da URL. */
  const veioDoInventario = params.get('risco') !== null

  const acoes = useService(() => nr1AcaoService.list(), [])
  const departamentos = useService(() => rhDepartamentoService.list(), [])
  const inventario = useService(() => nr1ResultadoService.inventario(), [])
  const [visualizacao, setVisualizacao] = useState<Visualizacao>('lista')
  const [status, setStatus] = useState('todas')
  const [riscoFiltro, setRiscoFiltro] = useState(params.get('risco') ?? 'todos')
  const [dimensaoFiltro, setDimensaoFiltro] = useState<'todas' | Nr1DimensaoId>('todas')
  const [responsavelFiltro, setResponsavelFiltro] = useState('todos')
  const [departamentoFiltro, setDepartamentoFiltro] = useState('todos')
  const [form, setForm] = useState<{ acao?: Nr1Acao; riscoId: string } | null>(null)
  const [detalhe, setDetalhe] = useState<Nr1Acao | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  /* Conclusão aguardando confirmação (card solto em "Concluída" no Kanban,
     ação sem comentário nem evidência). No detalhe, a mesma pergunta vive
     dentro do próprio modal (`Nr1AcaoDetalheModal`). */
  const [confirmarConclusao, setConfirmarConclusao] = useState<Nr1Acao | null>(null)
  const [concluindo, setConcluindo] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [filtrosMobileOpen, setFiltrosMobileOpen] = useState(false)

  const riscos: Nr1RiscoInventario[] = inventario.status === 'success' ? inventario.data : []
  const risco = (id: string) => riscos.find((r) => r.id === id)

  /* Só a versão vigente de cada plano aparece na lista — uma ação que já
     foi substituída (é `versaoAnteriorId` de outra) some daqui, mas
     continua acessível como histórico no detalhe da versão que a sucedeu. */
  const todas = acoes.status === 'success' ? acoes.data : []
  const idsSuperados = new Set(todas.map((a) => a.versaoAnteriorId).filter((id): id is string => Boolean(id)))
  const acoesVigentes = todas.filter((a) => !idsSuperados.has(a.id))

  const responsaveis = [...new Set(acoesVigentes.map((a) => a.quem))].sort((a, b) => a.localeCompare(b))

  /* Riscos registrados que ainda não têm nenhuma ação — só um aviso, sem
     atalho: a ação pode ser criada por "Nova ação" ou no detalhe do risco. */
  const riscosSemPlano = acoes.status === 'success'
    ? riscos.filter((r) => r.status !== 'eliminado' && !acoesVigentes.some((a) => a.riscoId === r.id))
    : []
  const filtrosAtivos = riscoFiltro !== 'todos' || status !== 'todas' || dimensaoFiltro !== 'todas'
    || responsavelFiltro !== 'todos' || departamentoFiltro !== 'todos'

  /* No mobile/tablet, domínio/departamento/responsável/status ficam dentro do
     modal "Filtrar" (risco é o único sempre visível, na linha de cima) — a
     contagem aqui vira o badge do botão, pra dar pra ver de fora do modal se
     algum deles está ativo sem precisar abrir. */
  const filtrosSecundariosCount = [dimensaoFiltro !== 'todas', departamentoFiltro !== 'todos', responsavelFiltro !== 'todos', status !== 'todas']
    .filter(Boolean).length

  useEffect(() => {
    if (!filtrosMobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFiltrosMobileOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey) }
  }, [filtrosMobileOpen])

  const listaDepartamentos = departamentos.status === 'success'
    ? [...departamentos.data].sort((a, b) => a.nome.localeCompare(b.nome))
    : []

  const filtradas = acoesVigentes
    .filter((a) => (riscoFiltro === 'todos' ? true : a.riscoId === riscoFiltro))
    .filter((a) => (status === 'todas' ? true : a.status === status))
    .filter((a) => (dimensaoFiltro === 'todas' ? true : risco(a.riscoId)?.dimensaoId === dimensaoFiltro))
    .filter((a) => (responsavelFiltro === 'todos' ? true : a.quem === responsavelFiltro))
    .filter((a) => {
      if (departamentoFiltro === 'todos') return true
      /* "Onde" guarda nomes (ver `AcaoForm`); uma ação para toda a empresa
         também envolve o departamento escolhido. */
      const onde = a.onde.split(',').map((x) => x.trim())
      return onde.includes('Toda a empresa') || onde.includes(departamentoFiltro)
    })

  /* Ordenação por urgência de prazo — o que vence primeiro (ou já venceu)
     aparece no topo; concluídas ficam sempre por último, sem competir por
     atenção com o que ainda está aberto. */
  const ordenadas = [...filtradas].sort((a, b) => {
    const aConcluida = a.status === 'concluida'
    const bConcluida = b.status === 'concluida'
    if (aConcluida !== bConcluida) return aConcluida ? 1 : -1
    return a.quando.localeCompare(b.quando)
  })

  const limparFiltros = () => {
    setRiscoFiltro('todos'); setStatus('todas'); setDimensaoFiltro('todas')
    setDepartamentoFiltro('todos'); setResponsavelFiltro('todos')
  }

  const confirmarConclusaoSemRegistro = async () => {
    if (!confirmarConclusao) return
    setConcluindo(true)
    const r = await nr1AcaoService.concluir(confirmarConclusao.id, { semRegistro: true })
    setConcluindo(false)
    setConfirmarConclusao(null)
    if (!r.ok) { setErro(r.message ?? 'Não foi possível concluir a ação.'); return }
    acoes.reload()
    setFeedback('Ação concluída.')
  }

  const cancelarConclusao = () => setConfirmarConclusao(null)

  /* Formulário de "Nova ação" — editar uma ação existente acontece dentro
     do detalhe em tela cheia. */
  const fecharForm = () => setForm(null)

  const salvarForm = (_salvo: Nr1Acao, nova: boolean) => {
    setForm(null)
    acoes.reload()
    setFeedback(nova ? 'Ação criada.' : 'Ação salva.')
  }

  /* Move uma ação para outra coluna do kanban — a mesma regra de negócio do
     botão "Concluir ação" se aplica ao soltar em "Concluída" (sem comentário
     nem evidência, pergunta antes; cancelar deixa o card onde estava); as demais colunas são só o status mudando de lugar. Soltar
     fora de "Concluída" some com `concluidaEm`, para uma ação "des-concluída"
     por engano não ficar com data de conclusão órfã. */
  const moverStatus = async (a: Nr1Acao, novoStatus: Nr1AcaoStatus) => {
    if (a.status === novoStatus) return
    if (novoStatus === 'concluida') {
      const r = await nr1AcaoService.concluir(a.id)
      if (r.semRegistro) { setConfirmarConclusao(a); return }
      if (!r.ok) { setErro(r.message ?? 'Não foi possível concluir a ação.'); return }
      setFeedback('Ação concluída.')
    } else {
      await nr1AcaoService.salvar({ ...a, status: novoStatus, concluidaEm: undefined })
    }
    acoes.reload()
  }

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />

        {veioDoInventario && (
          <Link to="/rh/nr1/inventario" className="mt-2 mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary transition-colors hover:text-ink lg:mt-0">
            <Icon icon="ph:arrow-left-bold" width={14} aria-hidden />
            Inventário
          </Link>
        )}

        <PageHeader
          className={veioDoInventario ? undefined : 'mt-2 lg:mt-0'}
          title="Planos de ação"
          subtitle="O que será feito, por quem, até quando, e a prova de que foi feito."
          action={
            riscos.length > 0 ? (
              <Button variant="secondary" iconLeft="ph:plus-bold" onClick={() => setForm({ riscoId: riscoFiltro !== 'todos' ? riscoFiltro : riscos[0]!.id })}>
                <span className="hidden sm:inline">Nova ação</span>
              </Button>
            ) : undefined
          }
        />

        {/* Alternância Lista/Kanban — mesmo padrão visual das abas de um
           ciclo (Engajamento/Resultado/Riscos sugeridos). */}
        <div className="mb-5 flex gap-1 rounded-lg bg-surface-2 p-1" role="tablist" aria-label="Visualização do plano de ação">
          {([
            { valor: 'lista' as const, label: 'Lista', icon: 'ph:list-bold' },
            { valor: 'kanban' as const, label: 'Kanban', icon: 'ph:kanban-bold' },
          ]).map((v) => (
            <button
              key={v.valor}
              role="tab"
              aria-selected={visualizacao === v.valor}
              onClick={() => setVisualizacao(v.valor)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 font-heading text-sm font-semibold transition-all ${
                visualizacao === v.valor ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
              }`}
            >
              <Icon icon={v.icon} width={15} aria-hidden />
              {v.label}
            </button>
          ))}
        </div>

        {/* Filtros — risco, domínio, departamento, responsável e status,
           todos combináveis, aplicados às duas visualizações. Risco vem
           sempre em linha própria, ocupando a largura toda, com busca por
           palavra-chave (`SearchSelect`) — é o filtro mais usado pra chegar
           num risco específico, e a lista pode ter dezenas de riscos, onde
           rolar um dropdown comum já não ajuda tanto quanto digitar.

           Os outros quatro só aparecem lado a lado no desktop (`lg:grid`);
           abaixo disso ficam escondidos atrás do botão "Filtrar", que abre
           um painel em tela cheia (`filtrosMobileOpen`) — no mobile/tablet
           não cabem quatro selects numa linha sem espremer, e um modal
           dedicado dá mais espaço pra cada filtro do que uma grade apertada. */}
        <div className="mb-3">
          <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Risco</p>
          <SearchSelect
            value={riscoFiltro}
            onChange={setRiscoFiltro}
            size="md"
            options={[
              { value: 'todos', label: 'Todos os riscos' },
              ...[...riscos].sort((a, b) => nr1RotuloRisco(a).localeCompare(nr1RotuloRisco(b))).map((r) => ({ value: r.id, label: nr1RotuloRisco(r) })),
            ]}
            placeholder="Todos os riscos"
            searchPlaceholder="Buscar por domínio ou fator…"
          />
        </div>

        <div className="mb-5 hidden gap-3 lg:grid lg:grid-cols-4">
          <div>
            <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Domínio</p>
            <Select
              value={dimensaoFiltro}
              onChange={(v) => setDimensaoFiltro(v as 'todas' | Nr1DimensaoId)}
              ariaLabel="Filtrar por domínio"
              options={[{ value: 'todas', label: 'Todos os domínios' }, ...NR1_DIMENSOES.map((d) => ({ value: d.id, label: d.nome }))]}
            />
          </div>
          <div>
            <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Departamento</p>
            <Select
              value={departamentoFiltro}
              onChange={setDepartamentoFiltro}
              ariaLabel="Filtrar por departamento"
              options={[{ value: 'todos', label: 'Todos os departamentos' }, ...listaDepartamentos.map((d) => ({ value: d.nome, label: d.nome }))]}
            />
          </div>
          <div>
            <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Responsável</p>
            <SearchSelect
              value={responsavelFiltro}
              onChange={setResponsavelFiltro}
              size="md"
              options={[{ value: 'todos', label: 'Todos os responsáveis' }, ...[...responsaveis].sort((a, b) => a.localeCompare(b)).map((q) => ({ value: q, label: q }))]}
              placeholder="Todos os responsáveis"
              searchPlaceholder="Buscar pelo nome…"
            />
          </div>
          <div>
            <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Status</p>
            <Select value={status} onChange={setStatus} ariaLabel="Filtrar por status" options={STATUS_FILTROS} />
          </div>
        </div>

        <div className="mb-5 lg:hidden">
          <Button variant="secondary" iconLeft="ph:funnel-simple-bold" onClick={() => setFiltrosMobileOpen(true)}>
            Filtrar
            {filtrosSecundariosCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-pill bg-primary px-1.5 font-mono text-[11px] font-semibold text-white">
                {filtrosSecundariosCount}
              </span>
            )}
          </Button>
        </div>

        {filtrosAtivos && (
          <button onClick={limparFiltros} className="mb-5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-primary hover:underline dark:text-primary-300">
            <Icon icon="ph:x-circle-bold" width={13} aria-hidden />
            Limpar filtros
          </button>
        )}

        {riscosSemPlano.length > 0 && (
          <div className="mb-5 flex flex-col gap-3 rounded-lg border border-warning/30 bg-warning-bg p-4 sm:flex-row sm:items-center">
            <Icon icon="ph:warning-circle-bold" width={20} className="shrink-0 text-warning-ink" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-ink">
                {riscosSemPlano.length} {riscosSemPlano.length === 1 ? 'risco registrado ainda não tem' : 'riscos registrados ainda não têm'} plano de ação
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-ink-secondary">
                {riscosSemPlano.slice(0, 3).map(nr1RotuloRisco).join(' · ')}{riscosSemPlano.length > 3 ? ` · e mais ${riscosSemPlano.length - 3}` : ''}
              </p>
            </div>
          </div>
        )}

        {(acoes.status === 'idle' || acoes.status === 'loading') && (
          <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
        )}
        {acoes.status === 'error' && <ErrorState message={acoes.message} onRetry={acoes.reload} />}

        {acoes.status === 'success' && (
          ordenadas.length === 0 ? (
            <div className="rounded-lg border border-border bg-surface px-5 py-14 text-center">
              <p className="text-[15px] font-semibold text-ink">Nenhuma ação por aqui</p>
              <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-ink-secondary">
                {filtrosAtivos
                  ? 'Nenhuma ação combina com os filtros escolhidos.'
                  : 'Nenhuma ação criada ainda. Use "Nova ação" para criar a primeira.'}
              </p>
            </div>
          ) : visualizacao === 'lista' ? (
            <div className="flex flex-col gap-2">
              {/* Cabeçalho das colunas — só no desktop, onde a grade existe de
                 fato; no mobile cada linha já se organiza em pilha. */}
              <div className={`hidden items-center gap-3 px-3.5 lg:grid ${LISTA_GRID_COLS}`}>
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Prazo</span>
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Ação</span>
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Deptos.</span>
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Status</span>
              </div>
              {ordenadas.map((a) => (
                <AcaoLinha key={a.id} acao={a} risco={risco(a.riscoId)} onClick={() => setDetalhe(a)} />
              ))}
            </div>
          ) : (
            <AcoesKanban acoes={ordenadas} risco={risco} onOpen={(a) => setDetalhe(a)} onMoverStatus={moverStatus} />
          )
        )}
      </div>

      <Sheet open={form !== null} onClose={fecharForm} title="Nova ação" icon="ph:list-checks-bold" size="md">
        {form && (
          <AcaoForm
            inicial={form.acao}
            riscoId={form.riscoId}
            riscos={riscos}
            onClose={fecharForm}
            onSaved={salvarForm}
          />
        )}
      </Sheet>

      <Nr1AcaoDetalheModal
        acao={detalhe}
        riscos={riscos}
        onClose={() => setDetalhe(null)}
        onAlterado={() => { acoes.reload(); inventario.reload() }}
      />

      <Toast message={feedback} onClose={() => setFeedback(null)} />

      <Modal open={confirmarConclusao !== null} title="Concluir sem registro?" onClose={cancelarConclusao}>
        {confirmarConclusao && (
          <div className="flex flex-col gap-4">
            <p className="text-[13.5px] leading-relaxed text-ink-secondary">
              A ação <strong className="font-semibold text-ink">{confirmarConclusao.oQue}</strong> não tem nenhum
              comentário nem evidência anexada. A evidência de execução é o que comprova a ação numa fiscalização.
              Quer concluir mesmo assim?
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" disabled={concluindo} onClick={cancelarConclusao}>Cancelar</Button>
              <Button fullWidth iconLeft="ph:check-bold" disabled={concluindo} onClick={confirmarConclusaoSemRegistro}>
                {concluindo ? 'Concluindo…' : 'Concluir mesmo assim'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={erro !== null} title="Ação não concluída" onClose={() => setErro(null)}>
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px] leading-relaxed text-ink-secondary">{erro}</p>
          <Button fullWidth onClick={() => setErro(null)}>Entendi</Button>
        </div>
      </Modal>

      {/* Painel de filtros — mobile/tablet. Em tela cheia (não o bottom-sheet
         do `Modal`, que vira centralizado a partir de `md`): aqui precisa
         continuar em tela cheia até `lg`, o mesmo ponto de corte do botão
         "Filtrar" que abre este painel. Domínio/departamento/responsável/
         status aplicam na hora (mesmo estado da grade do desktop); os
         botões do rodapé só fecham o painel ou limpam tudo. */}
      {filtrosMobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-surface lg:hidden" role="dialog" aria-modal aria-label="Filtros">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4">
            <h2 className="font-heading text-lg font-semibold text-ink">Filtros</h2>
            <button
              onClick={() => setFiltrosMobileOpen(false)}
              aria-label="Fechar"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-surface-hover"
            >
              <Icon icon="ph:x-bold" width={18} aria-hidden />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Domínio</p>
                <Select
                  value={dimensaoFiltro}
                  onChange={(v) => setDimensaoFiltro(v as 'todas' | Nr1DimensaoId)}
                  ariaLabel="Filtrar por domínio"
                  options={[{ value: 'todas', label: 'Todos os domínios' }, ...NR1_DIMENSOES.map((d) => ({ value: d.id, label: d.nome }))]}
                />
              </div>
              <div>
                <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Departamento</p>
                <Select
                  value={departamentoFiltro}
                  onChange={setDepartamentoFiltro}
                  ariaLabel="Filtrar por departamento"
                  options={[{ value: 'todos', label: 'Todos os departamentos' }, ...listaDepartamentos.map((d) => ({ value: d.nome, label: d.nome }))]}
                />
              </div>
              <div>
                <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Responsável</p>
                <SearchSelect
                  value={responsavelFiltro}
                  onChange={setResponsavelFiltro}
                  size="md"
                  options={[{ value: 'todos', label: 'Todos os responsáveis' }, ...[...responsaveis].sort((a, b) => a.localeCompare(b)).map((q) => ({ value: q, label: q }))]}
                  placeholder="Todos os responsáveis"
                  searchPlaceholder="Buscar pelo nome…"
                />
              </div>
              <div>
                <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Status</p>
                <Select value={status} onChange={setStatus} ariaLabel="Filtrar por status" options={STATUS_FILTROS} />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 gap-2 border-t border-border px-5 py-4">
            <Button
              fullWidth
              variant="ghost"
              iconLeft="ph:x-circle-bold"
              disabled={!filtrosAtivos}
              onClick={() => { limparFiltros(); setFiltrosMobileOpen(false) }}
            >
              Limpar filtros
            </Button>
            <Button fullWidth iconLeft="ph:check-bold" onClick={() => setFiltrosMobileOpen(false)}>
              Aplicar filtros
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/** Card compacto de uma ação — a visualização "Kanban", agrupada em colunas
   por status logo abaixo (`AcoesKanban`). Arrastável entre colunas (ver
   `AcoesKanban`) para mudar o status sem precisar abrir o detalhe. */
function AcaoCardKanban({ acao, risco, onClick, onDragStart }: {
  acao: Nr1Acao
  risco?: Nr1RiscoInventario
  onClick: () => void
  onDragStart: (e: React.DragEvent) => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      className="flex w-full cursor-grab flex-col gap-2 rounded-lg border border-border bg-surface p-3 text-left transition-colors hover:border-border-strong hover:bg-surface-hover active:cursor-grabbing"
    >
      <p className="text-[13px] font-semibold leading-snug text-ink">
        {acao.oQue}
        {acao.versao > 1 && <span className="ml-1.5 text-[10.5px] font-normal text-ink-muted">v{acao.versao}</span>}
      </p>
      {risco && (
        <p className="line-clamp-2 text-[11px] text-ink-secondary" title={nr1RotuloRisco(risco)}>
          <span className="font-medium text-ink">{risco.dimensao}</span> · {risco.fator}
        </p>
      )}
      <p className="flex items-center gap-1 text-[11px] text-ink-secondary">
        <Icon icon="ph:user-bold" width={10} aria-hidden />{acao.quem}
      </p>
      <PrazoBadge acao={acao} />
    </div>
  )
}

/** As mesmas ações da lista, agrupadas em colunas por status. Arrastar um
   card para outra coluna muda o status (soltar em "Concluída" passa pela
   mesma regra do botão "Concluir ação": sem comentário nem evidência, pede confirmação). O id da ação
   arrastada viaja pelo próprio `DataTransfer` nativo do navegador — sem
   biblioteca de drag-and-drop, o projeto não tinha nenhuma e o pedido era
   sobre mover cards entre colunas, não sobre uma biblioteca específica. */
function AcoesKanban({ acoes, risco, onOpen, onMoverStatus }: {
  acoes: Nr1Acao[]
  risco: (id: string) => Nr1RiscoInventario | undefined
  onOpen: (acao: Nr1Acao) => void
  onMoverStatus: (acao: Nr1Acao, novoStatus: Nr1AcaoStatus) => void
}) {
  const [colunaAlvo, setColunaAlvo] = useState<Nr1AcaoStatus | null>(null)

  const colunas: { status: Nr1AcaoStatus; titulo: string }[] = [
    { status: 'planejada', titulo: 'Planejada' },
    { status: 'em-andamento', titulo: 'Em andamento' },
    { status: 'atrasada', titulo: 'Atrasada' },
    { status: 'concluida', titulo: 'Concluída' },
  ]

  const soltar = (e: React.DragEvent, status: Nr1AcaoStatus) => {
    e.preventDefault()
    setColunaAlvo(null)
    const id = e.dataTransfer.getData('text/plain')
    const acao = acoes.find((a) => a.id === id)
    if (acao) onMoverStatus(acao, status)
  }

  /* Desktop: as quatro colunas dividem a largura (sem rolagem lateral);
     abaixo de `lg` continuam lado a lado com rolagem horizontal, que é o
     gesto natural no celular. */
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
      {colunas.map((c) => (
        <KanbanColuna
          key={c.status}
          titulo={c.titulo}
          itens={acoes.filter((a) => a.status === c.status)}
          alvo={colunaAlvo === c.status}
          risco={risco}
          onOpen={onOpen}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setColunaAlvo(c.status)}
          onDragLeave={() => setColunaAlvo((atual) => (atual === c.status ? null : atual))}
          onDrop={(e) => soltar(e, c.status)}
        />
      ))}
    </div>
  )
}

/** Cards por "página" de uma coluna do Kanban. */
const KANBAN_PAGINA = 6

/** Uma coluna do Kanban. Os cards rolam dentro da própria coluna (altura
   limitada à tela) e chegam em páginas: ao rolar até o fim, um sentinela
   observado (`IntersectionObserver`, com a coluna como raiz) carrega a
   próxima página. Mudou o conjunto de ações (filtro, status movido) →
   volta para a primeira página. */
function KanbanColuna({ titulo, itens, alvo, risco, onOpen, onDragOver, onDragEnter, onDragLeave, onDrop }: {
  titulo: string
  itens: Nr1Acao[]
  alvo: boolean
  risco: (id: string) => Nr1RiscoInventario | undefined
  onOpen: (acao: Nr1Acao) => void
  onDragOver: (e: React.DragEvent) => void
  onDragEnter: () => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
}) {
  const [visiveis, setVisiveis] = useState(KANBAN_PAGINA)
  const [carregando, setCarregando] = useState(false)
  const rolagemRef = useRef<HTMLDivElement>(null)
  const sentinelaRef = useRef<HTMLDivElement>(null)
  const temMais = visiveis < itens.length

  const assinatura = itens.map((a) => a.id).join('|')
  useEffect(() => { setVisiveis(KANBAN_PAGINA) }, [assinatura])

  useEffect(() => {
    const el = sentinelaRef.current
    if (!el || !temMais || carregando) return
    const obs = new IntersectionObserver((entradas) => {
      if (!entradas[0]?.isIntersecting) return
      setCarregando(true)
    }, { root: rolagemRef.current, rootMargin: '0px 0px 120px 0px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [temMais, carregando, visiveis])

  /* Simula a latência da próxima página (mesmo `delay` dos serviços mock). */
  useEffect(() => {
    if (!carregando) return
    const t = window.setTimeout(() => {
      setVisiveis((v) => v + KANBAN_PAGINA)
      setCarregando(false)
    }, 450)
    return () => window.clearTimeout(t)
  }, [carregando])

  return (
    <div
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`flex w-[280px] shrink-0 flex-col gap-2.5 rounded-lg p-3 transition-colors lg:w-auto lg:min-w-0 ${
        alvo ? 'bg-primary-50 ring-2 ring-primary/40' : 'bg-surface-2'
      }`}
    >
      <div className="flex items-center justify-between px-1">
        <h3 className="font-heading text-[13px] font-semibold text-ink">{titulo}</h3>
        <span className="rounded-pill bg-surface px-2 py-0.5 font-mono text-[11px] font-semibold text-ink-secondary">{itens.length}</span>
      </div>
      <div ref={rolagemRef} className="-mx-1 flex max-h-[70vh] flex-col gap-2 overflow-y-auto px-1 pb-0.5">
        {itens.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-[11.5px] text-ink-muted">
            {alvo ? 'Solte aqui' : 'Nada aqui'}
          </p>
        ) : (
          <>
            {itens.slice(0, visiveis).map((a) => (
              <AcaoCardKanban
                key={a.id}
                acao={a}
                risco={risco(a.riscoId)}
                onClick={() => onOpen(a)}
                onDragStart={(e) => e.dataTransfer.setData('text/plain', a.id)}
              />
            ))}
            {temMais && (
              <div ref={sentinelaRef} className="flex flex-col gap-2" aria-live="polite">
                {carregando ? (
                  <>
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <p className="text-center text-[11px] text-ink-muted">Carregando mais…</p>
                  </>
                ) : (
                  <p className="py-1 text-center text-[11px] text-ink-muted">
                    {visiveis} de {itens.length} · role para ver mais
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

