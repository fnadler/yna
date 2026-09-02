import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { PrazoBadge } from '../../components/PrazoBadge'
import { AcaoLinha, LISTA_GRID_COLS } from '../../components/Nr1AcaoLinha'
import { AcaoDetalhe } from '../../components/Nr1AcaoDetalhe'
import { AcaoForm } from '../../components/Nr1AcaoForm'
import { Sheet } from '../../components/Sheet'
import { Modal } from '../../components/Modal'
import { Select } from '../../components/Select'
import { SearchSelect } from '../../components/SearchSelect'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { NIVEL_RISCO, nr1DiasEntre, nr1UrgenciaPrazo } from '../../lib/nr1'
import { useService } from '../../hooks/useService'
import { useRh } from '../../contexts/RhContext'
import { nr1AcaoService, nr1ResultadoService } from '../../services/nr1'
import { NR1_DIMENSOES, NR1_TODAY } from '../../data/nr1Mock'
import type { Nr1Acao, Nr1RiscoInventario, Nr1AcaoStatus, Nr1DimensaoId } from '../../types'

/* NR1-RH-04 — Plano de ação 5W2H (RF-E01/E02).

   Cada ação nasce vinculada a um risco do inventário — é esse vínculo que
   fecha a cadeia risco → ação exigida pela norma.

   Regra que a UI e o serviço aplicam juntos: uma ação só pode ser concluída
   com evidência anexada. "Evidência de execução registrada" é exatamente o
   que a fiscalização verifica; sem ela o plano é só intenção.

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

   O controle de vencimento (badge de prazo, e o filtro correspondente) é
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

const VENCIMENTO_FILTROS: { value: string; label: string }[] = [
  { value: 'todos', label: 'Qualquer prazo' },
  { value: 'vencida', label: 'Vencidas' },
  { value: 'vencendo', label: 'Vencendo em breve' },
  { value: 'no-prazo', label: 'No prazo' },
]

type Visualizacao = 'lista' | 'kanban'

export function NR1RhPlanoAcao() {
  const { usuario } = useRh()
  const [params] = useSearchParams()
  /* Só para decidir o "voltar" do topo (veio de um deep-link do Inventário
     ou não) — o filtro de risco em si vira estado próprio abaixo, para
     poder ser trocado pela pessoa sem depender da URL. */
  const veioDoInventario = params.get('risco') !== null

  const acoes = useService(() => nr1AcaoService.list(), [])
  const inventario = useService(() => nr1ResultadoService.inventario(), [])
  const [visualizacao, setVisualizacao] = useState<Visualizacao>('lista')
  const [status, setStatus] = useState('todas')
  const [riscoFiltro, setRiscoFiltro] = useState(params.get('risco') ?? 'todos')
  const [dimensaoFiltro, setDimensaoFiltro] = useState<'todas' | Nr1DimensaoId>('todas')
  const [responsavelFiltro, setResponsavelFiltro] = useState('todos')
  const [vencimentoFiltro, setVencimentoFiltro] = useState('todos')
  const [form, setForm] = useState<{ acao?: Nr1Acao; riscoId: string } | null>(null)
  const [detalhe, setDetalhe] = useState<Nr1Acao | null>(null)
  const [erro, setErro] = useState<string | null>(null)
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
  const filtrosAtivos = riscoFiltro !== 'todos' || status !== 'todas' || dimensaoFiltro !== 'todas'
    || responsavelFiltro !== 'todos' || vencimentoFiltro !== 'todos'

  /* No mobile/tablet, dimensão/responsável/status/vencimento ficam dentro do
     modal "Filtrar" (risco é o único sempre visível, na linha de cima) — a
     contagem aqui vira o badge do botão, pra dar pra ver de fora do modal se
     algum deles está ativo sem precisar abrir. */
  const filtrosSecundariosCount = [dimensaoFiltro !== 'todas', responsavelFiltro !== 'todos', status !== 'todas', vencimentoFiltro !== 'todos']
    .filter(Boolean).length

  useEffect(() => {
    if (!filtrosMobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFiltrosMobileOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey) }
  }, [filtrosMobileOpen])

  const filtradas = acoesVigentes
    .filter((a) => (riscoFiltro === 'todos' ? true : a.riscoId === riscoFiltro))
    .filter((a) => (status === 'todas' ? true : a.status === status))
    .filter((a) => (dimensaoFiltro === 'todas' ? true : risco(a.riscoId)?.dimensaoId === dimensaoFiltro))
    .filter((a) => (responsavelFiltro === 'todos' ? true : a.quem === responsavelFiltro))
    .filter((a) => {
      if (vencimentoFiltro === 'todos') return true
      if (a.status === 'concluida') return false
      return nr1UrgenciaPrazo(nr1DiasEntre(NR1_TODAY, a.quando)) === vencimentoFiltro
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
    setResponsavelFiltro('todos'); setVencimentoFiltro('todos')
  }

  const concluir = async (a: Nr1Acao) => {
    const r = await nr1AcaoService.concluir(a.id)
    if (!r.ok) { setErro(r.message ?? 'Não foi possível concluir a ação.'); return }
    setDetalhe(null)
    acoes.reload()
  }

  /* Fecha o formulário de edição/criação. Se ele foi aberto a partir do
     detalhe de uma ação existente ("Editar", no cabeçalho do modal — ver
     `form.acao`), volta pro detalhe em vez de fechar tudo; "Nova ação" (sem
     `acao`) não tem detalhe pra voltar, então só fecha, como antes. */
  const fecharForm = () => {
    const editando = form?.acao
    setForm(null)
    if (editando) setDetalhe(editando)
  }

  const salvarForm = (salvo: Nr1Acao) => {
    const editando = form?.acao
    setForm(null)
    acoes.reload()
    if (editando) setDetalhe(salvo)
  }

  const comentar = async (a: Nr1Acao, p: { texto?: string; arquivos?: string[] }) => {
    await nr1AcaoService.comentar(a.id, { autor: usuario.nome, ...p })
    acoes.reload()
    /* `a.comentarios` é a MESMA referência mutada dentro do serviço (o mock
       não devolve uma cópia) — reconstruir o array aqui (`[...a.comentarios,
       novo]`) duplicaria a entrada, já empurrada por lá. Um shallow spread
       de `a` já é suficiente para o React perceber a mudança de identidade
       e re-renderizar com o array (já atualizado) como está. */
    setDetalhe({ ...a })
  }

  /* Move uma ação para outra coluna do kanban — a mesma regra de negócio do
     botão "Concluir ação" se aplica ao soltar em "Concluída" (exige
     evidência); as demais colunas são só o status mudando de lugar. Soltar
     fora de "Concluída" some com `concluidaEm`, para uma ação "des-concluída"
     por engano não ficar com data de conclusão órfã. */
  const moverStatus = async (a: Nr1Acao, novoStatus: Nr1AcaoStatus) => {
    if (a.status === novoStatus) return
    if (novoStatus === 'concluida') {
      const r = await nr1AcaoService.concluir(a.id)
      if (!r.ok) { setErro(r.message ?? 'Não foi possível concluir a ação.'); return }
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

        {/* Filtros — risco, dimensão, responsável, status e vencimento,
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
              ...[...riscos].sort((a, b) => a.fator.localeCompare(b.fator)).map((r) => ({ value: r.id, label: r.fator })),
            ]}
            placeholder="Todos os riscos"
            searchPlaceholder="Buscar por risco ou grupo exposto…"
          />
        </div>

        <div className="mb-5 hidden gap-3 lg:grid lg:grid-cols-4">
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
            <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Responsável</p>
            <Select
              value={responsavelFiltro}
              onChange={setResponsavelFiltro}
              ariaLabel="Filtrar por responsável"
              options={[{ value: 'todos', label: 'Todos os responsáveis' }, ...responsaveis.map((q) => ({ value: q, label: q }))]}
            />
          </div>
          <div>
            <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Status</p>
            <Select value={status} onChange={setStatus} ariaLabel="Filtrar por status" options={STATUS_FILTROS} />
          </div>
          <div>
            <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Vencimento</p>
            <Select value={vencimentoFiltro} onChange={setVencimentoFiltro} ariaLabel="Filtrar por vencimento" options={VENCIMENTO_FILTROS} />
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
                  : 'Risco priorizado sem ação registrada é o primeiro item que um auditor cobra.'}
              </p>
            </div>
          ) : visualizacao === 'lista' ? (
            <div className="flex flex-col gap-2">
              {/* Cabeçalho das colunas — só no desktop, onde a grade existe de
                 fato; no mobile cada linha já se organiza em pilha. */}
              <div className={`hidden items-center gap-3 px-3.5 lg:grid ${LISTA_GRID_COLS}`}>
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Nível</span>
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Prazo</span>
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Ação</span>
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

      <Sheet open={form !== null} onClose={fecharForm} title={form?.acao ? 'Editar ação' : 'Nova ação'} icon="ph:list-checks-bold" size="md">
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

      <Sheet
        open={detalhe !== null}
        onClose={() => setDetalhe(null)}
        title={detalhe?.oQue ?? 'Detalhe da ação'}
        icon="ph:list-checks-bold"
        size="md"
        headerActions={detalhe && (
          <>
            <button
              onClick={() => { setForm({ acao: detalhe, riscoId: detalhe.riscoId }); setDetalhe(null) }}
              aria-label="Editar ação"
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
            >
              <Icon icon="ph:pencil-simple-bold" width={15} aria-hidden />
            </button>
            {detalhe.status !== 'concluida' && (
              <button
                onClick={() => concluir(detalhe)}
                disabled={!detalhe.comentarios.some((c) => c.arquivos && c.arquivos.length > 0)}
                aria-label="Concluir ação"
                title="Concluir ação"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-600 disabled:pointer-events-none disabled:opacity-50"
              >
                <Icon icon="ph:check-bold" width={15} aria-hidden />
              </button>
            )}
          </>
        )}
      >
        {detalhe && (
          <AcaoDetalhe
            acao={detalhe}
            risco={risco(detalhe.riscoId)}
            onComentar={(p) => comentar(detalhe, p)}
          />
        )}
      </Sheet>

      <Modal open={erro !== null} title="Ação não concluída" onClose={() => setErro(null)}>
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px] leading-relaxed text-ink-secondary">{erro}</p>
          <Button fullWidth onClick={() => setErro(null)}>Entendi</Button>
        </div>
      </Modal>

      {/* Painel de filtros — mobile/tablet. Em tela cheia (não o bottom-sheet
         do `Modal`, que vira centralizado a partir de `md`): aqui precisa
         continuar em tela cheia até `lg`, o mesmo ponto de corte do botão
         "Filtrar" que abre este painel. Dimensão/responsável/status/
         vencimento aplicam na hora (mesmo estado da grade do desktop); os
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
                <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Dimensão</p>
                <Select
                  value={dimensaoFiltro}
                  onChange={(v) => setDimensaoFiltro(v as 'todas' | Nr1DimensaoId)}
                  ariaLabel="Filtrar por dimensão"
                  options={[{ value: 'todas', label: 'Todas as dimensões' }, ...NR1_DIMENSOES.map((d) => ({ value: d.id, label: d.nome }))]}
                />
              </div>
              <div>
                <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Responsável</p>
                <Select
                  value={responsavelFiltro}
                  onChange={setResponsavelFiltro}
                  ariaLabel="Filtrar por responsável"
                  options={[{ value: 'todos', label: 'Todos os responsáveis' }, ...responsaveis.map((q) => ({ value: q, label: q }))]}
                />
              </div>
              <div>
                <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Status</p>
                <Select value={status} onChange={setStatus} ariaLabel="Filtrar por status" options={STATUS_FILTROS} />
              </div>
              <div>
                <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Vencimento</p>
                <Select value={vencimentoFiltro} onChange={setVencimentoFiltro} ariaLabel="Filtrar por vencimento" options={VENCIMENTO_FILTROS} />
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
  const nivel = risco ? NIVEL_RISCO[risco.nivel] : null

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
      {nivel && (
        <span className={`inline-flex w-fit items-center gap-1 rounded-pill px-2 py-0.5 text-[10.5px] font-bold ${nivel.cls}`}>
          {risco!.nivelNum}
          <span className="font-normal">{nivel.label}</span>
        </span>
      )}
      <p className="text-[13px] font-semibold leading-snug text-ink">
        {acao.oQue}
        {acao.versao > 1 && <span className="ml-1.5 text-[10.5px] font-normal text-ink-muted">v{acao.versao}</span>}
      </p>
      {risco && (
        <p className="truncate text-[11px] text-ink-secondary" title={risco.fator}>
          {risco.fator}
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
   mesma regra do botão "Concluir ação": exige evidência). O id da ação
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

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {colunas.map((c) => {
        const itens = acoes.filter((a) => a.status === c.status)
        return (
          <div
            key={c.status}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setColunaAlvo(c.status)}
            onDragLeave={() => setColunaAlvo((atual) => (atual === c.status ? null : atual))}
            onDrop={(e) => soltar(e, c.status)}
            className={`flex w-[280px] shrink-0 flex-col gap-2.5 rounded-lg p-3 transition-colors ${
              colunaAlvo === c.status ? 'bg-primary-50 ring-2 ring-primary/40' : 'bg-surface-2'
            }`}
          >
            <div className="flex items-center justify-between px-1">
              <h3 className="font-heading text-[13px] font-semibold text-ink">{c.titulo}</h3>
              <span className="rounded-pill bg-surface px-2 py-0.5 font-mono text-[11px] font-semibold text-ink-secondary">{itens.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {itens.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-[11.5px] text-ink-muted">
                  {colunaAlvo === c.status ? 'Solte aqui' : 'Nada aqui'}
                </p>
              ) : itens.map((a) => (
                <AcaoCardKanban
                  key={a.id}
                  acao={a}
                  risco={risco(a.riscoId)}
                  onClick={() => onOpen(a)}
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', a.id)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

