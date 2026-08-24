import { useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { Avatar } from '../../components/Avatar'
import { PrazoBadge } from '../../components/PrazoBadge'
import { Sheet } from '../../components/Sheet'
import { Modal } from '../../components/Modal'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { SearchSelect } from '../../components/SearchSelect'
import { Textarea } from '../../components/Textarea'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import {
  ACAO_STATUS, NIVEL_RISCO, ACAO_RECOMENDADA, EFETIVIDADE, fmtData,
  nr1DiasEntre, nr1UrgenciaPrazo,
} from '../../lib/nr1'
import { useService } from '../../hooks/useService'
import { useRh } from '../../contexts/RhContext'
import { nr1AcaoService, nr1ResultadoService } from '../../services/nr1'
import { rhColaboradorService, rhDepartamentoService } from '../../services/rh'
import { NR1_DIMENSOES, NR1_TODAY } from '../../data/nr1Mock'
import type { Nr1Acao, Nr1RiscoInventario, Nr1AcaoStatus, Nr1DimensaoId } from '../../types'

/** Valor sentinela para "o responsável atual não corresponde a nenhum
   colaborador da lista" (ação antiga, texto livre de antes deste campo virar
   busca, ou alguém que já saiu do quadro). Nunca é enviado ao serviço — só
   controla o `SearchSelect` internamente. */
const RESPONSAVEL_LEGADO = '__legado__'

/** Estado do campo "Quem (responsável)" — um `SearchSelect` com busca por
   nome sobre a lista real de colaboradores da empresa (`rhColaboradorService`),
   não mais um texto livre. `Nr1Acao.quem` continua sendo string (não um id):
   isolar a conversão aqui evita duplicar a lógica entre "Nova ação"/"Editar
   ação" (`AcaoForm`) e "Revisar plano" (`RevisarPlanoForm`), os dois lugares
   onde esse campo existe.

   Quando a ação sendo editada já tem um responsável que não é nenhum
   colaborador atual, esse texto aparece como a primeira opção da lista,
   pré-selecionado — a pessoa pode manter ou trocar por um colaborador real,
   nunca perde o que já estava lá. */
function useResponsavelField(quemAtual?: string) {
  const departamentos = useService(() => rhDepartamentoService.list(), [])
  const colaboradores = useService(() => rhColaboradorService.list(), [])
  const [quemId, setQuemId] = useState(quemAtual ? RESPONSAVEL_LEGADO : '')

  const lista = colaboradores.status === 'success' ? colaboradores.data : []
  const depNome = (id: string) => (departamentos.status === 'success' ? departamentos.data.find((d) => d.id === id)?.nome : undefined) ?? id

  const opcoes = useMemo(() => {
    const base = lista.map((c) => ({ value: c.id, label: `${c.nomeCompleto} · ${depNome(c.departamentoId)}` }))
    return quemAtual ? [{ value: RESPONSAVEL_LEGADO, label: quemAtual }, ...base] : base
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista, quemAtual])

  return {
    quemId,
    setQuemId,
    opcoes,
    quemFinal: opcoes.find((o) => o.value === quemId)?.label ?? '',
    carregando: colaboradores.status === 'loading' || departamentos.status === 'loading',
  }
}

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

/** Colunas da visualização "Lista" no desktop: nível do risco, prazo, ação
   (título + dimensão/risco/responsável) e status. Uma constante para o
   cabeçalho e cada linha nunca desalinharem entre si. */
const LISTA_GRID_COLS = 'grid-cols-[84px_140px_1fr_120px]'

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
  const [revisar, setRevisar] = useState<Nr1Acao | null>(null)
  const [detalhe, setDetalhe] = useState<Nr1Acao | null>(null)
  const [erro, setErro] = useState<string | null>(null)

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
           todos combináveis, aplicados às duas visualizações. */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div>
            <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Risco</p>
            <Select
              value={riscoFiltro}
              onChange={setRiscoFiltro}
              ariaLabel="Filtrar por risco"
              options={[{ value: 'todos', label: 'Todos os riscos' }, ...riscos.map((r) => ({ value: r.id, label: `${r.grupoExposto} · ${r.fator.slice(0, 40)}${r.fator.length > 40 ? '…' : ''}` }))]}
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

      <Sheet open={revisar !== null} onClose={() => setRevisar(null)} title="Revisar plano" icon="ph:arrow-clockwise-bold" size="md">
        {revisar && (
          <RevisarPlanoForm
            anterior={revisar}
            risco={risco(revisar.riscoId)}
            onClose={() => setRevisar(null)}
            onSaved={() => { setRevisar(null); acoes.reload() }}
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
            onRevisarPlano={() => { setRevisar(detalhe); setDetalhe(null) }}
          />
        )}
      </Sheet>

      <Modal open={erro !== null} title="Ação não concluída" onClose={() => setErro(null)}>
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px] leading-relaxed text-ink-secondary">{erro}</p>
          <Button fullWidth onClick={() => setErro(null)}>Entendi</Button>
        </div>
      </Modal>
    </div>
  )
}

/** Iniciais para o avatar do responsável (`acao.quem`, formato "Nome
   Sobrenome · Departamento") — usa só a parte do nome, antes do "·". */
function iniciaisResponsavel(quem: string) {
  return quem
    .split(' · ')[0]
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function AcaoDetalhe({ acao, risco, onComentar, onRevisarPlano }: {
  acao: Nr1Acao
  risco?: Nr1RiscoInventario
  onComentar: (p: { texto?: string; arquivos?: string[] }) => Promise<void>
  onRevisarPlano: () => void
}) {
  const temEvidencia = acao.comentarios.some((c) => c.arquivos && c.arquivos.length > 0)
  const sugereRevisar = risco?.acaoRecomendada && (risco.acaoRecomendada === 'revisar-plano' || risco.acaoRecomendada === 'escalar') && acao.status !== 'concluida'
  /* "O quê", "Quem" e "Quando" já aparecem em destaque acima (título do
     modal, avatar do responsável, badge de prazo) — aqui só o resto do
     5W2H, como o corpo/descrição da ação. */
  const detalhes: [string, string, string][] = [
    ['ph:question-bold', 'Por quê', acao.porQue],
    ['ph:map-pin-bold', 'Onde', acao.onde],
    ['ph:gear-bold', 'Como', acao.como],
    ['ph:currency-circle-dollar-bold', 'Quanto', acao.quanto],
  ]

  return (
    <>
      {/* Corpo — rola dentro do container do próprio Sheet (não cria um
         segundo scroll independente: `min-h-full` mais `sticky` no composer
         abaixo já bastam para o rodapé ficar fixo, sem depender de `h-full`
         resolver uma altura definida em cascata, o que falhava aqui dentro
         do `max-h-[88vh]` do Sheet). */}
      <div className="px-5 py-6 lg:px-6">
        <div className="flex flex-col gap-5">
          {/* Propriedades da ação — status, prazo e responsável em destaque,
             como num card de tarefa (Asana/Trello): sempre visíveis, sem
             precisar abrir o formulário de edição pra ver quem/quando.
             Editar e Concluir ficam no cabeçalho do modal (ver Sheet), não
             aqui, para não competir com essas propriedades. */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={ACAO_STATUS[acao.status].tone}>{ACAO_STATUS[acao.status].label}</Badge>
            <PrazoBadge acao={acao} />
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-surface-2 py-1 pl-1 pr-2.5 text-[12px] font-medium text-ink">
              <Avatar initials={iniciaisResponsavel(acao.quem)} size={20} />
              {acao.quem}
            </span>
          </div>

          {risco && (
            <div className="rounded-lg bg-surface-2 p-3.5">
              <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">Risco de origem</p>
              <p className="mt-1 text-[13px] leading-snug text-ink">{risco.fator}</p>
              <p className="mt-1 text-[11.5px] text-ink-muted">{risco.grupoExposto} · nível {risco.nivelNum} ({NIVEL_RISCO[risco.nivel].label})</p>
              <Link
                to={`/rh/nr1/inventario?detalhe=${risco.id}`}
                className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-medium text-primary hover:underline dark:text-primary-300"
              >
                Ver risco no inventário
                <Icon icon="ph:arrow-right-bold" width={10} aria-hidden />
              </Link>
            </div>
          )}

          {!temEvidencia && acao.status !== 'concluida' && (
            <p className="rounded-lg bg-warning-bg px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-secondary">
              Nenhum arquivo de evidência anexado ainda. Um comentário com arquivo é o que a
              fiscalização verifica — sem isso, a ação não pode ser concluída.
            </p>
          )}

          {sugereRevisar && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg bg-warning-bg px-3.5 py-2.5">
              <Icon icon="ph:warning-bold" width={15} className="shrink-0 text-warning-ink" aria-hidden />
              <p className="min-w-0 flex-1 text-[12px] text-ink-secondary">
                O risco de origem sugere <span className="font-medium text-ink">{ACAO_RECOMENDADA[risco!.acaoRecomendada!].label.toLowerCase()}</span>.
              </p>
              <Button size="sm" variant="secondary" iconLeft="ph:arrow-clockwise-bold" onClick={onRevisarPlano}>
                Revisar plano
              </Button>
            </div>
          )}

          {acao.status === 'concluida' && acao.concluidaEm && (
            <p className="flex items-center gap-2 rounded-lg bg-success-bg px-3.5 py-3 text-[12.5px] text-success-ink">
              <Icon icon="ph:check-circle-bold" width={15} aria-hidden />
              Concluída em {fmtData(acao.concluidaEm)}
            </p>
          )}

          {acao.versao > 1 && (
            <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-2 p-3.5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
                <Icon icon="ph:arrow-clockwise-bold" width={14} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold text-ink">Versão {acao.versao}</p>
                {acao.motivoRevisao && <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-secondary">{acao.motivoRevisao}</p>}
              </div>
            </div>
          )}

          <VersoesAnteriores acaoId={acao.id} />

          <div>
            <p className="mb-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">Detalhes</p>
            <div className="flex flex-col gap-3">
              {detalhes.map(([icon, label, valor]) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
                    <Icon icon={icon} width={14} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">{label}</p>
                    <p className="mt-0.5 text-[13.5px] leading-relaxed text-ink">{valor}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
              Diário de execução {acao.comentarios.length > 0 && `(${acao.comentarios.length})`}
            </p>
            {acao.comentarios.length === 0 ? (
              <p className="rounded-lg bg-surface-2 px-3.5 py-3 text-[12.5px] text-ink-secondary">
                Nenhum comentário ainda. Use o campo abaixo para registrar o andamento e anexar
                arquivos de evidência.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-border rounded-lg bg-surface-2">
                {acao.comentarios.map((c) => (
                  <li key={c.id} className="p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12.5px] font-semibold text-ink">{c.autor}</span>
                      <span className="shrink-0 font-mono text-[11px] text-ink-muted">{fmtData(c.em)}</span>
                    </div>
                    {c.texto && <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">{c.texto}</p>}
                    {c.arquivos && c.arquivos.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {c.arquivos.map((nome, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 rounded-pill bg-surface px-2.5 py-1 text-[11.5px] text-ink">
                            <Icon icon="ph:file-bold" width={12} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
                            <span className="max-w-[220px] truncate">{nome}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Composer — `sticky bottom-0` dentro do mesmo container rolável do
         Sheet (não um segundo scroll independente): fica colado ao fundo
         da área visível enquanto há conteúdo acima para rolar. Substitui o
         antigo botão único "Anexar evidência": cada envio é um comentário,
         que pode trazer arquivo(s) ou não. */}
      <div className="sticky bottom-0">
        <ComentarioComposer onEnviar={onComentar} />
      </div>
    </>
  )
}

/** Campo de comentário fixo no rodapé do detalhe da ação — texto livre e
   anexos de arquivo juntos na mesma mensagem, sempre visível (não é preciso
   abrir nada para comentar ou anexar evidência, ao contrário do antigo
   fluxo de um botão só). Fica de fora da área rolável do modal (`AcaoDetalhe`
   acima), então nunca sai da vista ao rolar o resto do conteúdo. */
function ComentarioComposer({ onEnviar }: { onEnviar: (p: { texto?: string; arquivos?: string[] }) => Promise<void> }) {
  const [texto, setTexto] = useState('')
  const [arquivos, setArquivos] = useState<string[]>([])
  const [enviando, setEnviando] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const podeEnviar = (texto.trim().length > 0 || arquivos.length > 0) && !enviando

  const enviar = async () => {
    if (!podeEnviar) return
    setEnviando(true)
    await onEnviar({ texto: texto.trim() || undefined, arquivos: arquivos.length > 0 ? arquivos : undefined })
    setTexto('')
    setArquivos([])
    setEnviando(false)
  }

  return (
    <div className="shrink-0 border-t border-border bg-surface px-5 py-4 lg:px-6">
      {arquivos.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {arquivos.map((nome, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 rounded-pill bg-surface-2 px-2.5 py-1 text-[11.5px] text-ink-secondary">
              <Icon icon="ph:paperclip-bold" width={11} className="shrink-0" aria-hidden />
              <span className="max-w-[140px] truncate">{nome}</span>
              <button
                type="button"
                onClick={() => setArquivos((a) => a.filter((_, x) => x !== i))}
                aria-label={`Remover ${nome}`}
                className="text-ink-muted transition-colors hover:text-ink"
              >
                <Icon icon="ph:x-bold" width={10} aria-hidden />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <Textarea
          rows={1}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Comente o andamento…"
          className="flex-1"
          style={{ minHeight: 44 }}
        />
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const nomes = Array.from(e.target.files ?? []).map((f) => f.name)
            if (nomes.length > 0) setArquivos((a) => [...a, ...nomes])
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label="Anexar arquivo"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-border text-ink-secondary transition-colors hover:border-border-strong hover:bg-surface-hover"
        >
          <Icon icon="ph:paperclip-bold" width={17} aria-hidden />
        </button>
        <Button iconLeft="ph:paper-plane-tilt-bold" disabled={!podeEnviar} onClick={enviar}>
          {enviando ? 'Enviando…' : 'Enviar'}
        </Button>
      </div>
    </div>
  )
}

/** Linha de uma ação — a visualização "Lista". No desktop, quatro colunas
   alinhadas com o cabeçalho (`LISTA_GRID_COLS`): nível do risco (a nota,
   não só a cor — antes só a cor aparecia, mas a cor sozinha não diz o
   quanto), prazo, a ação em si (título em destaque e, menor, a dimensão +
   risco de origem — clicável, abre o detalhe daquele risco no Inventário —
   e o responsável), e status. Abaixo de `lg`, os mesmos dados em pilha
   compacta, sem colunas rígidas (não cabem numa tela estreita).

   Clicar em qualquer parte fora do link de dimensão/risco abre o detalhe da
   ação (editar, anexar evidência e concluir vivem lá, não em botões
   espalhados pela linha — era esse excesso de informação por item que
   tornava o modelo de card antigo difícil de acompanhar com muitas ações
   abertas). O link de dimensão/risco precisa impedir a propagação do
   clique — senão os dois destinos (detalhe da ação, detalhe do risco)
   disputariam o mesmo clique. */
function AcaoLinha({ acao, risco, onClick }: {
  acao: Nr1Acao
  risco?: Nr1RiscoInventario
  onClick: () => void
}) {
  const st = ACAO_STATUS[acao.status]
  const nivel = risco ? NIVEL_RISCO[risco.nivel] : null

  const riscoTexto = risco && (
    <p className="min-w-0 truncate text-[11.5px] text-ink-secondary" title={risco.fator}>
      {risco.fator}
    </p>
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
      <div className={`hidden items-center gap-3 lg:grid ${LISTA_GRID_COLS}`}>
        <span className={`flex w-fit flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 ${nivel ? nivel.cls : 'bg-surface-2 text-ink-muted'}`}>
          <span className="font-mono text-[14px] font-bold leading-none">{risco ? risco.nivelNum : '—'}</span>
          {nivel && <span className="text-[9px] font-semibold leading-none">{nivel.label}</span>}
        </span>
        <div><PrazoBadge acao={acao} /></div>
        <div className="min-w-0">
          <p className="truncate font-heading text-[13.5px] font-semibold text-ink">
            {acao.oQue}
            {acao.versao > 1 && <span className="ml-1.5 text-[10.5px] font-normal text-ink-muted">v{acao.versao}</span>}
          </p>
          {riscoTexto}
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-muted">
            <Icon icon="ph:user-bold" width={10} aria-hidden />{acao.quem}
          </p>
        </div>
        <div><Badge tone={st.tone}>{st.label}</Badge></div>
      </div>

      {/* Mobile/tablet — pilha compacta */}
      <div className="flex items-start gap-3 lg:hidden">
        {nivel && <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-[3px] ${nivel.dot}`} aria-hidden />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="min-w-0 truncate font-heading text-[13.5px] font-semibold text-ink">
              {acao.oQue}
              {acao.versao > 1 && <span className="ml-1.5 text-[10.5px] font-normal text-ink-muted">v{acao.versao}</span>}
            </p>
            <Badge tone={st.tone} className="shrink-0">{st.label}</Badge>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11.5px] text-ink-secondary">
            {riscoTexto}
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <Icon icon="ph:user-bold" width={11} aria-hidden />{acao.quem}
            </span>
            <PrazoBadge acao={acao} />
          </div>
        </div>
        <Icon icon="ph:caret-right-bold" width={14} className="mt-1.5 shrink-0 text-ink-muted" aria-hidden />
      </div>
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

/* Formulário 5W2H. Os sete campos da norma, na ordem em que fazem sentido
   preencher — não em ordem alfabética de sigla. */
function AcaoForm({ inicial, riscoId, riscos, onClose, onSaved }: {
  inicial?: Nr1Acao
  riscoId: string
  riscos: Nr1RiscoInventario[]
  onClose: () => void
  onSaved: (salvo: Nr1Acao) => void
}) {
  const [risco, setRisco] = useState(inicial?.riscoId ?? riscoId)
  const [oQue, setOQue] = useState(inicial?.oQue ?? '')
  const [porQue, setPorQue] = useState(inicial?.porQue ?? '')
  const responsavel = useResponsavelField(inicial?.quem)
  const [quando, setQuando] = useState(inicial?.quando ?? '')
  const [onde, setOnde] = useState(inicial?.onde ?? '')
  const [como, setComo] = useState(inicial?.como ?? '')
  const [quanto, setQuanto] = useState(inicial?.quanto ?? '')
  const [status, setStatus] = useState<Nr1AcaoStatus>(inicial?.status ?? 'planejada')
  const [salvando, setSalvando] = useState(false)

  const valido = oQue.trim().length >= 5 && responsavel.quemId !== '' && quando.length > 0

  const salvar = async () => {
    if (!valido) return
    setSalvando(true)
    const salvo = await nr1AcaoService.salvar({
      id: inicial?.id ?? '',
      riscoId: risco,
      oQue: oQue.trim(), porQue: porQue.trim(), quem: responsavel.quemFinal, quando,
      onde: onde.trim(), como: como.trim(), quanto: quanto.trim(),
      status,
      comentarios: inicial?.comentarios ?? [],
      concluidaEm: inicial?.concluidaEm,
      versao: inicial?.versao ?? 1,
      versaoAnteriorId: inicial?.versaoAnteriorId,
      motivoRevisao: inicial?.motivoRevisao,
      efetividade: inicial?.efetividade,
    })
    onSaved(salvo)
  }

  return (
    <>
      {/* Corpo rolável + rodapé de ações fixo — mesma estrutura do detalhe
         da ação (`sticky bottom-0` dentro do scroll que o Sheet já provê),
         pra não ficar um modal com diagramação diferente dos outros. */}
      <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">Risco que esta ação responde</p>
          <Select
            value={risco}
            onChange={setRisco}
            ariaLabel="Risco de origem"
            options={riscos.map((r) => ({ value: r.id, label: `${r.grupoExposto} · ${r.fator.slice(0, 60)}${r.fator.length > 60 ? '…' : ''}` }))}
          />
        </div>

        <Input label="O quê (a medida de controle)" value={oQue} onChange={(e) => setOQue(e.target.value)} placeholder="Ex.: Instituir janela de pausa obrigatória" />

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink">Por quê</span>
          <Textarea rows={2} value={porQue} onChange={(e) => setPorQue(e.target.value)} placeholder="O que esta medida reduz" />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-[13px] font-semibold text-ink">Quem (responsável)</p>
            <SearchSelect
              value={responsavel.quemId}
              onChange={responsavel.setQuemId}
              options={responsavel.opcoes}
              placeholder={responsavel.carregando ? 'Carregando…' : 'Selecionar colaborador'}
              searchPlaceholder="Buscar por nome…"
            />
          </div>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-ink">Quando (prazo)</span>
            <input
              type="date"
              value={quando}
              onChange={(e) => setQuando(e.target.value)}
              className="w-full rounded border-[1.5px] border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
            />
          </label>
        </div>

        <Input label="Onde" value={onde} onChange={(e) => setOnde(e.target.value)} placeholder="Área ou unidade" />

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink">Como</span>
          <Textarea rows={2} value={como} onChange={(e) => setComo(e.target.value)} placeholder="De que forma a medida será executada" />
        </label>

        <Input label="Quanto (custo estimado)" value={quanto} onChange={(e) => setQuanto(e.target.value)} placeholder="Ex.: R$ 18.500 ou sem custo direto" />

        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">Status</p>
          <Select
            value={status}
            onChange={(v) => setStatus(v as Nr1AcaoStatus)}
            ariaLabel="Status da ação"
            options={(['planejada', 'em-andamento', 'atrasada'] as Nr1AcaoStatus[]).map((s) => ({ value: s, label: ACAO_STATUS[s].label }))}
          />
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">
            Concluir a ação exige evidência anexada, e isso é feito no detalhe.
          </p>
        </div>
      </div>

      <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-border bg-surface px-5 py-4 sm:flex-row sm:justify-end lg:px-6">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button iconLeft="ph:check-bold" disabled={!valido || salvando} onClick={salvar}>
          {salvando ? 'Salvando…' : inicial ? 'Salvar ação' : 'Criar ação'}
        </Button>
      </div>
    </>
  )
}

/* Versões anteriores de um plano — a v1 nunca é editada nem some, só deixa
   de ser "a" versão vigente. Aqui aparecem com o que foi tentado e, quando
   já avaliado, a efetividade percebida. */
function VersoesAnteriores({ acaoId }: { acaoId: string }) {
  const versoes = useService(() => nr1AcaoService.versoes(acaoId), [acaoId])

  if (versoes.status !== 'success') return null
  const anteriores = versoes.data.slice(1) // o primeiro item é a própria ação atual
  if (anteriores.length === 0) return null

  return (
    <div>
      <p className="mb-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
        Versões anteriores
      </p>
      <ul className="flex flex-col gap-1.5">
        {anteriores.map((v) => (
          <li key={v.id} className="rounded-lg bg-surface-2 px-3.5 py-2.5">
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 flex-1 text-[12.5px] font-medium leading-snug text-ink">v{v.versao} · {v.oQue}</p>
              {v.efetividade && (
                <Badge tone={EFETIVIDADE[v.efetividade].tone} className="shrink-0">{EFETIVIDADE[v.efetividade].label}</Badge>
              )}
            </div>
            {v.motivoRevisao && <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">Revisada porque: {v.motivoRevisao}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* Cria uma nova versão do plano a partir da anterior — os campos vêm
   pré-preenchidos (a ideia normalmente é ajustar, não recomeçar do zero),
   e pede o motivo da revisão, que fica registrado com a nova versão. */
function RevisarPlanoForm({ anterior, risco, onClose, onSaved }: {
  anterior: Nr1Acao
  risco?: Nr1RiscoInventario
  onClose: () => void
  onSaved: () => void
}) {
  const [oQue, setOQue] = useState(anterior.oQue)
  const [porQue, setPorQue] = useState(anterior.porQue)
  const responsavel = useResponsavelField(anterior.quem)
  const [quando, setQuando] = useState(anterior.quando)
  const [onde, setOnde] = useState(anterior.onde)
  const [como, setComo] = useState(anterior.como)
  const [quanto, setQuanto] = useState(anterior.quanto)
  const [motivo, setMotivo] = useState('')
  const [salvando, setSalvando] = useState(false)

  const valido = oQue.trim().length >= 5 && responsavel.quemId !== '' && quando.length > 0 && motivo.trim().length >= 10

  const salvar = async () => {
    if (!valido) return
    setSalvando(true)
    await nr1AcaoService.revisar(
      anterior.id,
      { oQue: oQue.trim(), porQue: porQue.trim(), quem: responsavel.quemFinal, quando, onde: onde.trim(), como: como.trim(), quanto: quanto.trim() },
      motivo.trim(),
    )
    onSaved()
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
      {risco?.acaoRecomendada && (
        <div className="flex items-start gap-3 rounded-lg bg-warning-bg p-3.5">
          <Icon icon="ph:warning-bold" width={18} className="mt-0.5 shrink-0 text-warning-ink" aria-hidden />
          <p className="text-[12.5px] leading-relaxed text-ink-secondary">
            O risco de origem sugere <span className="font-medium text-ink">{ACAO_RECOMENDADA[risco.acaoRecomendada].label.toLowerCase()}</span> —
            a versão {anterior.versao} segue como histórico, com sua efetividade preservada.
          </p>
        </div>
      )}

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-ink">Por que revisar</span>
        <Textarea rows={2} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="O que a versão anterior não resolveu, ou o que mudou" />
      </label>

      <Input label="O quê (a medida de controle)" value={oQue} onChange={(e) => setOQue(e.target.value)} />

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-ink">Por quê</span>
        <Textarea rows={2} value={porQue} onChange={(e) => setPorQue(e.target.value)} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">Quem (responsável)</p>
          <SearchSelect
            value={responsavel.quemId}
            onChange={responsavel.setQuemId}
            options={responsavel.opcoes}
            placeholder={responsavel.carregando ? 'Carregando…' : 'Selecionar colaborador'}
            searchPlaceholder="Buscar por nome…"
          />
        </div>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink">Quando (prazo)</span>
          <input
            type="date"
            value={quando}
            onChange={(e) => setQuando(e.target.value)}
            className="w-full rounded border-[1.5px] border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
          />
        </label>
      </div>

      <Input label="Onde" value={onde} onChange={(e) => setOnde(e.target.value)} />

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-ink">Como</span>
        <Textarea rows={2} value={como} onChange={(e) => setComo(e.target.value)} />
      </label>

      <Input label="Quanto (custo estimado)" value={quanto} onChange={(e) => setQuanto(e.target.value)} />

      <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button iconLeft="ph:check-bold" disabled={!valido || salvando} onClick={salvar}>
          {salvando ? 'Salvando…' : `Criar versão ${anterior.versao + 1}`}
        </Button>
      </div>
    </div>
  )
}
