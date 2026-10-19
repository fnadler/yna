import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from './Button'
import { Badge } from './Badge'
import { Sheet } from './Sheet'
import { Modal } from './Modal'
import { Select } from './Select'
import { Skeleton } from './Skeleton'
import { ErrorState } from './ErrorState'
import { SearchSelect } from './SearchSelect'
import { Toast } from './Toast'
import { AcaoForm, TODA_EMPRESA } from './Nr1AcaoForm'
import { CabecalhoBloco, useOpcoesRecorte } from './Nr1Blocos'
import { Nr1MatrizRiscos, Nr1SeveridadeTag } from './Nr1RiscosVisao'
import { Nr1ResumoPgrChamada, Nr1ResumoPgrModal } from './Nr1ResumoPgr'
import { ACAO_STATUS, fmtData, nr1DiasEntre } from '../lib/nr1'
import { useService } from '../hooks/useService'
import { nr1ResultadoService, nr1AcaoService, nr1FatorService } from '../services/nr1'
import { NR1_RECORTE_OUTROS, NR1_TODAY, nr1RiscoNoRecorte } from '../data/nr1Mock'
import type { Nr1Acao, Nr1AcaoStatus, Nr1Campanha, Nr1FatorRisco, Nr1RiscoInventario } from '../types'

/* Blocos de um ciclo usados na aba Resultado do detalhe do ciclo e nas
   telas próprias do menu (Inventário de riscos, Planos de ação e Resumo para
   o PGR): fatores de risco identificados, planos de ação e resumo do PGR. */

/* Bloco 3 — Fatores de risco identificados: a mesma matriz P × S do
   Inventário e, abaixo, a lista dos fatores que as respostas apontaram —
   um por fator, com a severidade, os departamentos expostos e o plano. */
export function FatoresBloco({ campanhaId, recorte, onAbrir, semCabecalho = false, adicionarAberto, onAdicionarChange, filtroMatriz = false }: {
  campanhaId: string
  recorte: string
  onAbrir: (r: Nr1RiscoInventario, sugestoes?: boolean) => void
  /** Sem o cabeçalho do bloco (a página já tem título e o botão "Adicionar risco"). */
  semCabecalho?: boolean
  /** Controle externo do modal "Adicionar risco" (botão fora do bloco). */
  adicionarAberto?: boolean
  onAdicionarChange?: (aberto: boolean) => void
  /** Matriz com título e filtro de departamento próprio (vale só para ela). */
  filtroMatriz?: boolean
}) {
  const [recorteMatriz, setRecorteMatriz] = useState('empresa')
  /* "Outros departamentos" não gera fatores próprios — fica fora do filtro da matriz. */
  const opcoesMatriz = useOpcoesRecorte(campanhaId).filter((o) => o.value !== NR1_RECORTE_OUTROS)
  const riscos = useService(() => nr1ResultadoService.inventario(campanhaId), [campanhaId])
  const acoes = useService(() => nr1AcaoService.list(), [])
  const catalogo = useService(() => nr1FatorService.catalogo(), [])
  const recortes = useService(() => nr1ResultadoService.recortes(campanhaId), [campanhaId])
  const [adicionarInterno, setAdicionarInterno] = useState(false)
  const adicionar = adicionarAberto ?? adicionarInterno
  const setAdicionar = (v: boolean) => { setAdicionarInterno(v); onAdicionarChange?.(v) }
  const [feedback, setFeedback] = useState<string | null>(null)
  /* "Precisam de ação": mostra apenas os fatores que ainda não têm plano. */
  const [soSemPlano, setSoSemPlano] = useState(false)

  const todasAcoes = acoes.status === 'success' ? acoes.data : []
  const acoesDe = (id: string) => todasAcoes.filter((a) => a.riscoId === id && !todasAcoes.some((b) => b.versaoAnteriorId === a.id))
  const todos = riscos.status === 'success' ? riscos.data : []
  /* Com um departamento no filtro, ficam os fatores em que ele está exposto. */
  const doRecorte = todos.filter((r) => nr1RiscoNoRecorte(r, recorte))
  const semPlanoDe = (rs: Nr1RiscoInventario[]) => rs.filter((r) => acoesDe(r.id).length === 0)
  const semPlano = semPlanoDe(doRecorte).length
  /* Os sem plano primeiro; depois do maior para o menor nível. */
  const lista = (soSemPlano ? semPlanoDe(doRecorte) : doRecorte)
    .sort((x, y) => (acoesDe(x.id).length === 0 ? 0 : 1) - (acoesDe(y.id).length === 0 ? 0 : 1) || y.nivelNum - x.nivelNum)
  /* Na matriz, a probabilidade e o nível são os do departamento filtrado. */
  const naMatriz = (rec: string) => doRecorte.map((r) => nr1RiscoNoRecorte(r, rec)).filter((r): r is Nr1RiscoInventario => !!r)
  const abrirOriginal = (r: Nr1RiscoInventario) => onAbrir(todos.find((x) => x.id === r.id) ?? r)

  const visiveis = recortes.status === 'success' ? recortes.data.visiveis : []
  const recarregar = () => { riscos.reload(); acoes.reload() }

  return (
    <>
      {!semCabecalho && <CabecalhoBloco
        titulo="Fatores de risco identificados"
        icon="ph:warning-diamond-bold"
        subtitulo={doRecorte.length === 0
          ? 'Nenhum fator de risco acima do nível que exige plano de ação.'
          : `${doRecorte.length} ${doRecorte.length === 1 ? 'fator requer' : 'fatores requerem'} plano de ação${semPlano > 0 ? ` · ${semPlano} ainda sem plano` : ' · todos com plano'}.`}
        acao={<Button size="sm" variant="secondary" iconLeft="ph:plus-bold" onClick={() => setAdicionar(true)}>Adicionar risco</Button>}
      />}
      {(riscos.status === 'idle' || riscos.status === 'loading') && <Skeleton className="h-80 w-full rounded-lg" />}
      {riscos.status === 'error' && <ErrorState message={riscos.message} onRetry={riscos.reload} />}
      {riscos.status === 'success' && doRecorte.length === 0 && (
        <p className="rounded-lg border border-border bg-surface px-5 py-10 text-center text-[13px] text-ink-secondary">
          {recorte === NR1_RECORTE_OUTROS
            ? 'As áreas reunidas em "Outros departamentos" têm poucos respondentes para gerar fatores por área — elas entram nos fatores apontados na empresa.'
            : 'Nenhum fator de risco requer plano de ação neste recorte.'}
        </p>
      )}
      {riscos.status === 'success' && doRecorte.length > 0 && (
        <div className="flex flex-col gap-6">
          {filtroMatriz ? (
            <Nr1MatrizRiscos
              titulo="Matriz de risco"
              acao={(
                <div className="w-full sm:w-60">
                  <Select size="sm" value={recorteMatriz} onChange={setRecorteMatriz} ariaLabel="Filtrar a matriz por departamento" options={opcoesMatriz} />
                </div>
              )}
              riscos={naMatriz(recorteMatriz)}
              onAbrir={abrirOriginal}
            />
          ) : (
            <Nr1MatrizRiscos riscos={naMatriz(recorte)} onAbrir={abrirOriginal} />
          )}

          {/* Barra da lista: mostrar só o que pede ação. */}
          <div className="flex gap-1 self-start rounded-lg bg-surface-2 p-1" role="radiogroup" aria-label="Fatores exibidos">
            {[
              { v: false, label: `Todos (${doRecorte.length})` },
              { v: true, label: `Precisam de ação (${semPlano})` },
            ].map((o) => (
              <button
                key={String(o.v)}
                type="button"
                role="radio"
                aria-checked={soSemPlano === o.v}
                onClick={() => setSoSemPlano(o.v)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition-all ${
                  soSemPlano === o.v ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
                }`}
              >
                {o.v && <span className="h-2 w-2 rounded-full bg-warning" aria-hidden />}
                {o.label}
              </button>
            ))}
          </div>

          {lista.length === 0
            ? <p className="rounded-lg border border-border bg-surface px-5 py-8 text-center text-[13px] text-ink-secondary">Todos os fatores deste recorte já têm plano de ação.</p>
            : <ListaFatores riscos={lista} acoesDe={acoesDe} onAbrir={(r) => onAbrir(r)} onNovaAcao={(r) => onAbrir(r, true)} />}
        </div>
      )}

      <AdicionarRiscoModal
        aberto={adicionar}
        campanhaId={campanhaId}
        areas={visiveis}
        fatores={catalogo.status === 'success' ? catalogo.data : []}
        riscos={todos}
        onClose={() => setAdicionar(false)}
        onAdicionado={(r) => { setAdicionar(false); recarregar(); setFeedback('Risco adicionado. Agora crie o plano de ação.'); if (r) onAbrir(r, true) }}
      />
      <Toast message={feedback} onClose={() => setFeedback(null)} />
    </>
  )
}

/* Todas as colunas com largura definida (nenhuma `auto`): cabeçalho e linhas
   são grades separadas e só alinham se as trilhas forem idênticas. */
const FATORES_GRID_COLS = 'grid-cols-[minmax(0,1fr)_150px_minmax(0,300px)_170px]'

function ListaFatores({ riscos, acoesDe, onAbrir, onNovaAcao }: {
  riscos: Nr1RiscoInventario[]
  acoesDe: (riscoId: string) => Nr1Acao[]
  onAbrir: (r: Nr1RiscoInventario) => void
  /** Abre o detalhe do risco já na escolha das ações sugeridas. */
  onNovaAcao: (r: Nr1RiscoInventario) => void
}) {
  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className={`hidden items-center gap-4 rounded-t-lg border-b border-border bg-surface-2 px-4 py-2.5 lg:grid ${FATORES_GRID_COLS}`}>
        {['Fator de risco', 'Severidade', 'Departamentos afetados', 'Plano de ação'].map((c) => (
          <span key={c} className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{c}</span>
        ))}
      </div>
      <ul className="divide-y divide-border">
        {riscos.map((r) => {
          const n = acoesDe(r.id).length
          /* Com ações: a contagem, que abre o plano. Sem ações: o botão que
             abre direto nas ações sugeridas. */
          const acoesBtn = n > 0 ? (
            <button
              type="button"
              onClick={() => onAbrir(r)}
              className="inline-flex w-fit items-center gap-1.5 rounded-pill border border-border bg-surface-2 px-3 py-1.5 text-[12.5px] font-semibold text-ink transition-colors hover:border-primary/50 hover:bg-primary-50 hover:text-primary dark:hover:text-primary-300"
              title="Ver o plano de ação"
            >
              <Icon icon="ph:list-checks-bold" width={14} aria-hidden />
              {n} {n === 1 ? 'ação vinculada' : 'ações vinculadas'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNovaAcao(r)}
              className="inline-flex w-fit items-center gap-1 rounded-pill bg-primary px-3 py-1.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-primary-600"
            >
              <Icon icon="ph:plus-bold" width={13} aria-hidden />
              Criar plano de ação
            </button>
          )
          const nome = (
            <button type="button" onClick={() => onAbrir(r)} className="min-w-0 text-left">
              <span className="block text-[13.5px] font-medium leading-snug text-ink hover:text-primary hover:underline dark:hover:text-primary-300">{r.fator}</span>
              <span className="mt-0.5 block text-[11.5px] text-ink-muted">{r.dimensao}{r.origem === 'manual' ? ' · incluído pelo RH' : ''}</span>
            </button>
          )
          return (
            <li key={r.id} className={`relative px-4 py-3.5 last:rounded-b-lg ${n === 0 ? 'bg-warning/[0.07]' : ''}`}>
              {/* Fator sem nenhuma ação: faixa lateral. */}
              {n === 0 && <span className="absolute inset-y-0 left-0 w-1 bg-warning" aria-hidden />}
              {/* Desktop */}
              <div className={`hidden items-center gap-4 lg:grid ${FATORES_GRID_COLS}`}>
                {nome}
                <Nr1SeveridadeTag severidade={r.severidade} />
                <DepartamentosAfetados nomes={departamentosDoRisco(r)} />
                {acoesBtn}
              </div>
              {/* Mobile */}
              <div className="flex flex-col gap-2.5 lg:hidden">
                {nome}
                <div className="flex flex-wrap items-center gap-2">
                  <Nr1SeveridadeTag severidade={r.severidade} />
                  <DepartamentosAfetados nomes={departamentosDoRisco(r)} />
                </div>
                {acoesBtn}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Departamentos expostos a um fator, do pior para o melhor (a ordem de
   `grupos`). Vazio = só a empresa inteira. */
const departamentosDoRisco = (r: Nr1RiscoInventario) =>
  r.grupos.filter((g) => g.departamentoId !== null).map((g) => g.departamento)

/** Departamentos do "Onde" de uma ação (vazio = toda a empresa), na ordem
   do pior para o melhor no fator que ela responde; os que o fator não
   aponta vêm por último. */
const departamentosDaAcao = (a: Nr1Acao, r?: Nr1RiscoInventario) => {
  const ordem = r ? departamentosDoRisco(r) : []
  const pos = (n: string) => (ordem.includes(n) ? ordem.indexOf(n) : ordem.length)
  return a.onde.split(',').map((x) => x.trim()).filter((x) => x && x !== TODA_EMPRESA).sort((x, y) => pos(x) - pos(y))
}

/** Quantas tags de departamento ficam à vista; o resto vai para o "+N". */
const MAX_TAGS_DEPARTAMENTO = 3

/** Tag de departamento — a mesma do card de um risco na matriz P × S. */
function TagDepartamento({ nome }: { nome: string }) {
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-pill bg-primary-50 px-2 py-0.5 text-[11.5px] font-medium text-primary dark:text-primary-300" title={nome}>
      <Icon icon="ph:buildings-bold" width={11} className="shrink-0" aria-hidden />
      <span className="truncate">{nome}</span>
    </span>
  )
}

/** Tags dos departamentos (de um fator ou de uma ação), já ordenados do pior
   para o melhor: as 3 primeiras à vista e, havendo mais, um "+N" que mostra
   as demais ao passar o mouse (ou focar). Sem nenhum, "Toda a empresa". */
function DepartamentosAfetados({ nomes }: { nomes: string[] }) {
  if (nomes.length === 0) {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 text-[12.5px] text-ink-secondary">
        <Icon icon="ph:buildings-bold" width={14} className="text-ink-muted" aria-hidden />
        Toda a empresa
      </span>
    )
  }
  const visiveis = nomes.slice(0, MAX_TAGS_DEPARTAMENTO)
  const demais = nomes.slice(MAX_TAGS_DEPARTAMENTO)
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1">
      {visiveis.map((n) => <TagDepartamento key={n} nome={n} />)}
      {demais.length > 0 && (
        <span className="group relative inline-flex">
          <span
            tabIndex={0}
            aria-label={`Mais ${demais.length} ${demais.length === 1 ? 'departamento' : 'departamentos'}: ${demais.join(', ')}`}
            className="cursor-default rounded-pill border border-primary/30 bg-surface px-2 py-0.5 font-mono text-[11px] font-semibold text-primary outline-none transition-colors hover:border-primary/60 focus-visible:border-primary dark:text-primary-300"
          >
            +{demais.length}
          </span>
          <span role="tooltip" className="pointer-events-none invisible absolute right-0 top-full z-30 mt-1.5 w-max min-w-40 max-w-64 rounded-lg border border-border bg-surface p-3 opacity-0 shadow-lg transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
            <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
              {demais.length === 1 ? 'Mais 1 departamento' : `Mais ${demais.length} departamentos`}
            </span>
            <span className="mt-1.5 flex flex-wrap gap-1">
              {demais.map((n) => <TagDepartamento key={n} nome={n} />)}
            </span>
          </span>
        </span>
      )}
    </div>
  )
}

/* Bloco 4 — Planos de ação do ciclo: as ações que respondem aos fatores
   deste ciclo — criadas nele ou mantidas/revisadas do ciclo anterior —
   numa lista só, com os departamentos onde cada ação acontece ("Onde"). */
const PLANOS_GRID_COLS = 'grid-cols-[minmax(0,1fr)_minmax(0,260px)_130px_180px_116px_88px]'

export function PlanosBloco({ campanha, recorte: recorteExterno, onAbrir, semCabecalho = false, filtroDepartamento = false, novaAcaoAberta, onNovaAcaoChange }: {
  campanha: Nr1Campanha
  recorte: string
  onAbrir: (a: Nr1Acao, editar?: boolean) => void
  /** Sem o cabeçalho do bloco (a página já tem título e o botão). */
  semCabecalho?: boolean
  /** Mostra o filtro de departamento junto aos demais filtros da lista. */
  filtroDepartamento?: boolean
  /** Controle externo do formulário "Adicionar ação" (botão fora do bloco). */
  novaAcaoAberta?: boolean
  onNovaAcaoChange?: (aberto: boolean) => void
}) {
  const [recorteInterno, setRecorteInterno] = useState('empresa')
  const recorte = filtroDepartamento ? recorteInterno : recorteExterno
  const opcoesRecorte = useOpcoesRecorte(campanha.id)
  const [visualizacao, setVisualizacao] = useState<'lista' | 'kanban'>('lista')
  const [confirmarConclusao, setConfirmarConclusao] = useState<Nr1Acao | null>(null)
  const riscos = useService(() => nr1ResultadoService.inventario(campanha.id), [campanha.id])
  const acoes = useService(() => nr1AcaoService.list(), [])
  const recortes = useService(() => nr1ResultadoService.recortes(campanha.id), [campanha.id])
  const [status, setStatus] = useState('todas')
  const [responsavel, setResponsavel] = useState('todos')
  const [novaAcaoInterna, setNovaAcaoInterna] = useState(false)
  const novaAcao = novaAcaoAberta ?? novaAcaoInterna
  const setNovaAcao = (v: boolean) => { setNovaAcaoInterna(v); onNovaAcaoChange?.(v) }
  const [feedback, setFeedback] = useState<string | null>(null)

  /* Kanban: soltar um card em outra coluna muda o status. "Concluída" segue
     a regra do botão Concluir — sem comentário nem evidência, pergunta antes. */
  const moverStatus = async (a: Nr1Acao, novo: Nr1AcaoStatus) => {
    if (a.status === novo) return
    if (novo === 'concluida') {
      const r = await nr1AcaoService.concluir(a.id)
      if (r.semRegistro) { setConfirmarConclusao(a); return }
      setFeedback('Ação concluída.')
    } else {
      await nr1AcaoService.salvar({ ...a, status: novo, concluidaEm: undefined })
    }
    acoes.reload()
  }
  const confirmarSemRegistro = async () => {
    if (!confirmarConclusao) return
    await nr1AcaoService.concluir(confirmarConclusao.id, { semRegistro: true })
    setConfirmarConclusao(null)
    acoes.reload()
    setFeedback('Ação concluída.')
  }

  const lista = riscos.status === 'success' ? riscos.data : []
  const visiveis = recortes.status === 'success' ? recortes.data.visiveis : []
  /* Áreas citadas no "Onde" da ação (gravado como nomes separados por vírgula). */
  const areasDaAcao = (a: Nr1Acao) => {
    const nomes = a.onde.split(',').map((x) => x.trim())
    return visiveis.filter((d) => nomes.includes(d.nome)).map((d) => d.id)
  }
  /* Filtro de departamento: ações daquela área, ou gerais de um fator a que
     ela está exposta. */
  const noRecorte = (a: Nr1Acao) => {
    if (recorte === 'empresa') return true
    const areas = areasDaAcao(a)
    return areas.length > 0 ? areas.includes(recorte) : !!lista.find((r) => r.id === a.riscoId)?.departamentoIds.includes(recorte)
  }
  const todas = acoes.status === 'success' ? acoes.data : []
  const superadas = new Set(todas.map((a) => a.versaoAnteriorId).filter(Boolean))
  const doCiclo = todas.filter((a) => !superadas.has(a.id) && lista.some((r) => r.id === a.riscoId) && noRecorte(a))
  const responsaveis = [...new Set(doCiclo.map((a) => a.quem))].sort((a, b) => a.localeCompare(b))
  /* Abertas por prazo; concluídas no fim. */
  const filtradas = doCiclo
    .filter((a) => status === 'todas' || a.status === status)
    .filter((a) => responsavel === 'todos' || a.quem === responsavel)
    .sort((x, y) => (x.status === 'concluida' ? 1 : 0) - (y.status === 'concluida' ? 1 : 0) || x.quando.localeCompare(y.quando))
  const riscoDe = (a: Nr1Acao) => lista.find((r) => r.id === a.riscoId)
  const contagem = (st: string) => doCiclo.filter((a) => a.status === st).length
  const vencida = (a: Nr1Acao) => a.status !== 'concluida' && nr1DiasEntre(NR1_TODAY, a.quando) < 0

  /* De onde a ação veio: revisão (nova versão de uma ação do ciclo
     anterior), mantida na reavaliação, ou criada neste ciclo. */
  const origem = (a: Nr1Acao) => (a.versaoAnteriorId
    ? { label: `Revisão (v${a.versao}) do ciclo anterior`, cls: 'bg-primary-50 text-primary dark:text-primary-300', icon: 'ph:arrow-clockwise-bold' }
    : a.atividades?.some((x) => x.descricao.startsWith('Manteve a ação no plano'))
      ? { label: 'Mantida do ciclo anterior', cls: 'bg-surface-2 text-ink-secondary', icon: 'ph:arrow-bend-down-right-bold' }
      : { label: 'Criada neste ciclo', cls: 'bg-success/15 text-success-ink', icon: 'ph:sparkle-bold' })

  return (
    <>
      {!semCabecalho && <CabecalhoBloco
        titulo="Planos de ação"
        icon="ph:list-checks-bold"
        subtitulo={doCiclo.length === 0
          ? 'Nenhuma ação criada para os fatores deste ciclo ainda.'
          : `${doCiclo.length} ${doCiclo.length === 1 ? 'ação responde' : 'ações respondem'} aos fatores deste ciclo · ${contagem('concluida')} ${contagem('concluida') === 1 ? 'concluída' : 'concluídas'}${contagem('atrasada') ? ` · ${contagem('atrasada')} ${contagem('atrasada') === 1 ? 'atrasada' : 'atrasadas'}` : ''}.`}
        acao={lista.length > 0 ? <Button size="sm" variant="secondary" iconLeft="ph:plus-bold" onClick={() => setNovaAcao(true)}>Adicionar ação</Button> : undefined}
      />}
      {(riscos.status !== 'success' || acoes.status !== 'success') && <Skeleton className="h-40 w-full rounded-lg" />}
      {riscos.status === 'success' && acoes.status === 'success' && doCiclo.length === 0 && (
        <p className="rounded-lg border border-border bg-surface px-5 py-10 text-center text-[13px] text-ink-secondary">
          Use “+ Ação” na lista de fatores acima para criar o primeiro plano.
        </p>
      )}
      {riscos.status === 'success' && acoes.status === 'success' && doCiclo.length > 0 && (
        <div className="flex flex-col gap-6">
          {/* Filtros e abrir/recolher tudo */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-wrap items-end gap-3">
              {filtroDepartamento && (
                <div className="w-full sm:w-60">
                  <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Departamento</p>
                  <Select value={recorteInterno} onChange={setRecorteInterno} ariaLabel="Filtrar ações por departamento" options={opcoesRecorte} />
                </div>
              )}
              <div className="w-full sm:w-52">
                <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Status</p>
                <Select
                  value={status}
                  onChange={setStatus}
                  ariaLabel="Filtrar ações por status"
                  options={[
                    { value: 'todas', label: 'Todas as ações' },
                    { value: 'planejada', label: 'Planejadas' },
                    { value: 'em-andamento', label: 'Em andamento' },
                    { value: 'atrasada', label: 'Atrasadas' },
                    { value: 'concluida', label: 'Concluídas' },
                  ]}
                />
              </div>
              <div className="w-full sm:w-64">
                <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Responsável</p>
                <SearchSelect
                  value={responsavel}
                  onChange={setResponsavel}
                  size="md"
                  placeholder="Todos os responsáveis"
                  searchPlaceholder="Buscar pelo nome…"
                  options={[{ value: 'todos', label: 'Todos os responsáveis' }, ...responsaveis.map((q) => ({ value: q, label: q }))]}
                />
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
            <div className="flex gap-1 rounded-lg bg-surface-2 p-1" role="tablist" aria-label="Visualização">
              {([['lista', 'Lista', 'ph:list-bold'], ['kanban', 'Kanban', 'ph:kanban-bold']] as const).map(([v, label, icon]) => (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={visualizacao === v}
                  onClick={() => setVisualizacao(v)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition-all ${visualizacao === v ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'}`}
                >
                  <Icon icon={icon} width={14} aria-hidden />{label}
                </button>
              ))}
            </div>
            </div>
          </div>

          {visualizacao === 'kanban' && (
            <KanbanAcoes acoes={filtradas} riscoDe={riscoDe} onAbrir={onAbrir} onMover={moverStatus} />
          )}

          {visualizacao === 'lista' && filtradas.length === 0 && (
            <p className="rounded-lg border border-border bg-surface px-5 py-8 text-center text-[13px] text-ink-secondary">Nenhuma ação com estes filtros.</p>
          )}

          {visualizacao === 'lista' && filtradas.length > 0 && (
            <div className="rounded-lg border border-border bg-surface">
              <div className={`hidden items-center gap-3 rounded-t-lg border-b border-border bg-surface-2 px-4 py-2.5 lg:grid ${PLANOS_GRID_COLS}`}>
                {['Ação', 'Departamentos', 'Prazo', 'Responsável', 'Status', ''].map((c, i) => (
                  <span key={i} className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{c}</span>
                ))}
              </div>
              <ul className="divide-y divide-border">
                {filtradas.map((a) => {
                  const r = riscoDe(a)
                  const o = origem(a)
                  const st = ACAO_STATUS[a.status]
                  const dias = nr1DiasEntre(NR1_TODAY, a.quando)
                  const prazo = (
                    <div className="text-[12.5px]">
                      <p className="font-mono font-semibold text-ink">{fmtData(a.quando)}</p>
                      {a.status === 'concluida' && a.concluidaEm && (
                        <p className="mt-0.5 flex items-center gap-1 text-[11.5px] font-medium text-success-ink"><Icon icon="ph:check-circle-bold" width={12} aria-hidden />Concluída em {fmtData(a.concluidaEm)}</p>
                      )}
                      {vencida(a) && (
                        <p className="mt-0.5 flex items-center gap-1 text-[11.5px] font-semibold text-danger-ink"><Icon icon="ph:warning-bold" width={12} aria-hidden />Vencida há {-dias} {-dias === 1 ? 'dia' : 'dias'}</p>
                      )}
                    </div>
                  )
                  const titulo = (
                    <div className="min-w-0">
                      <p className="font-heading text-[13.5px] font-semibold leading-snug text-ink">{a.oQue}</p>
                      {r && <p className="mt-0.5 truncate text-[11.5px] font-medium text-ink-secondary">{r.fator}</p>}
                      <span className={`mt-1.5 inline-flex w-fit items-center gap-1 rounded-pill px-2 py-0.5 text-[10.5px] font-medium ${o.cls}`}>
                        <Icon icon={o.icon} width={11} aria-hidden />{o.label}
                      </span>
                    </div>
                  )
                  /* `quem` é gravado como "Nome · Departamento". */
                  const [nomeResp, depResp] = a.quem.split(' · ')
                  const quem = (
                    <div className="flex min-w-0 items-start gap-1.5">
                      <Icon icon="ph:user-bold" width={12} className="mt-0.5 shrink-0 text-ink-muted" aria-hidden />
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-medium text-ink" title={nomeResp}>{nomeResp}</p>
                        {depResp && <p className="truncate text-[11.5px] text-ink-muted" title={depResp}>{depResp}</p>}
                      </div>
                    </div>
                  )
                  /* Dentro da linha clicável: o hover/foco do selo não abre a ação. */
                  const departamentos = (
                    <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                      <DepartamentosAfetados nomes={departamentosDaAcao(a, r)} />
                    </div>
                  )
                  const editar = a.status !== 'concluida' ? (
                    <Button size="sm" variant="ghost" iconLeft="ph:pencil-simple-bold" onClick={(e) => { e.stopPropagation(); onAbrir(a, true) }}>Editar</Button>
                  ) : <span />
                  return (
                    <li
                      key={a.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onAbrir(a)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAbrir(a) } }}
                      className={`relative cursor-pointer px-4 py-3.5 transition-colors last:rounded-b-lg hover:bg-surface-hover ${vencida(a) ? 'bg-danger/[0.05]' : ''}`}
                    >
                      {vencida(a) && <span className="absolute inset-y-0 left-0 w-1 bg-danger" aria-hidden />}
                      <div className={`hidden items-center gap-3 lg:grid ${PLANOS_GRID_COLS}`}>
                        {titulo}
                        {departamentos}
                        {prazo}
                        {quem}
                        <Badge tone={st.tone} className="w-fit">{st.label}</Badge>
                        <div className="flex justify-end">{editar}</div>
                      </div>
                      <div className="flex flex-col gap-2 lg:hidden">
                        {titulo}
                        <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
                          {departamentos}
                          {prazo}
                          {quem}
                          <Badge tone={st.tone} className="w-fit">{st.label}</Badge>
                        </div>
                        {a.status !== 'concluida' && <div>{editar}</div>}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      <Modal open={confirmarConclusao !== null} title="Concluir sem registro?" onClose={() => setConfirmarConclusao(null)}>
        {confirmarConclusao && (
          <div className="flex flex-col gap-4">
            <p className="text-[13.5px] leading-relaxed text-ink-secondary">
              A ação <strong className="font-semibold text-ink">{confirmarConclusao.oQue}</strong> não tem nenhum comentário nem evidência anexada.
              A evidência de execução é o que comprova a ação numa fiscalização. Quer concluir mesmo assim?
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setConfirmarConclusao(null)}>Cancelar</Button>
              <Button fullWidth iconLeft="ph:check-bold" onClick={confirmarSemRegistro}>Concluir mesmo assim</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Nova ação — escolhendo o fator (deste ciclo) que ela responde. */}
      <Sheet open={novaAcao} onClose={() => setNovaAcao(false)} title="Adicionar ação" icon="ph:list-checks-bold" size="md">
        {novaAcao && lista[0] && (
          <AcaoForm
            riscoId={lista[0].id}
            riscos={lista}
            onClose={() => setNovaAcao(false)}
            onSaved={() => { setNovaAcao(false); acoes.reload(); setFeedback('Ação criada.') }}
          />
        )}
      </Sheet>
      <Toast message={feedback} onClose={() => setFeedback(null)} />
    </>
  )
}

/* Bloco 5 — Resumo para o PGR: explicação e o botão que abre o documento
   em tela cheia (planilha por departamento, exportar e imprimir). */
export function ResumoPgrBloco({ campanha, recorte, recorteNome }: { campanha: Nr1Campanha; recorte: string; recorteNome: string }) {
  const riscos = useService(() => nr1ResultadoService.inventario(campanha.id), [campanha.id])
  const [aberto, setAberto] = useState(false)
  const total = riscos.status === 'success'
    ? riscos.data.filter((r) => nr1RiscoNoRecorte(r, recorte)).length
    : 0
  return (
    <>
      <CabecalhoBloco
        titulo="Resumo para o PGR"
        icon="ph:file-text-bold"
        subtitulo="O inventário de riscos psicossociais do ciclo, pronto para anexar ao Programa de Gerenciamento de Riscos."
      />
      <Nr1ResumoPgrChamada total={total} onAbrir={() => setAberto(true)} />
      <Nr1ResumoPgrModal aberto={aberto} campanha={campanha} recorte={recorte} recorteNome={recorteNome} onClose={() => setAberto(false)} />
    </>
  )
}

/** Adicionar um risco que o questionário não apontou: área, fator do
   catálogo e o motivo. */
function AdicionarRiscoModal({ aberto, campanhaId, areas, fatores, riscos, onClose, onAdicionado }: {
  aberto: boolean
  campanhaId: string
  areas: { id: string; nome: string }[]
  fatores: Nr1FatorRisco[]
  riscos: Nr1RiscoInventario[]
  onClose: () => void
  onAdicionado: (r?: Nr1RiscoInventario) => void
}) {
  const [area, setArea] = useState('empresa')
  const [fatorId, setFatorId] = useState('')
  const [justificativa, setJustificativa] = useState('')
  const [salvando, setSalvando] = useState(false)
  useEffect(() => { if (aberto) { setArea('empresa'); setFatorId(''); setJustificativa(''); setSalvando(false) } }, [aberto])

  const jaNaArea = (fId: string) => riscos.some((r) => r.fatorRiscoId === fId && r.grupos.some((g) => (g.departamentoId ?? 'empresa') === area))
  const valido = !!fatorId && justificativa.trim().length >= 10

  return (
    <Modal open={aberto} title="Adicionar risco" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-[13px] leading-relaxed text-ink-secondary">
          Para um fator de risco que existe mas o questionário não apontou — por exemplo, identificado por auditoria, pelo SESMT ou pelo canal de escuta.
        </p>
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">Departamento</p>
          <Select
            value={area}
            onChange={(v) => { setArea(v); setFatorId('') }}
            ariaLabel="Departamento do risco"
            options={[{ value: 'empresa', label: 'Toda a empresa (geral)' }, ...areas.map((a) => ({ value: a.id, label: a.nome }))]}
          />
        </div>
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">Fator de risco</p>
          <SearchSelect
            value={fatorId}
            onChange={setFatorId}
            size="md"
            placeholder="Selecionar fator do catálogo"
            searchPlaceholder="Buscar fator…"
            options={fatores.filter((f) => !jaNaArea(f.id)).map((f) => ({ value: f.id, label: f.nome }))}
          />
        </div>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink">Por que adicionar</span>
          <textarea
            className="w-full rounded border-[1.5px] border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
            rows={3}
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            placeholder="Ex.: Relatos recorrentes no canal de escuta sobre metas inalcançáveis na área."
          />
        </label>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button
            fullWidth
            iconLeft="ph:plus-bold"
            disabled={!valido || salvando}
            onClick={async () => {
              setSalvando(true)
              const r = await nr1ResultadoService.incluirFator({ campanhaId, fatorId, departamentoId: area === 'empresa' ? null : area, justificativa })
              onAdicionado(r)
            }}
          >
            {salvando ? 'Adicionando…' : 'Adicionar risco'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

/* Kanban das ações por status — arrastar um card para outra coluna muda o
   status; clicar abre o detalhe. Cada coluna rola por conta própria. */
const COLUNAS_KANBAN: { status: Nr1AcaoStatus; titulo: string }[] = [
  { status: 'planejada', titulo: 'Planejada' },
  { status: 'em-andamento', titulo: 'Em andamento' },
  { status: 'atrasada', titulo: 'Atrasada' },
  { status: 'concluida', titulo: 'Concluída' },
]

function KanbanAcoes({ acoes, riscoDe, onAbrir, onMover }: {
  acoes: Nr1Acao[]
  riscoDe: (a: Nr1Acao) => Nr1RiscoInventario | undefined
  onAbrir: (a: Nr1Acao, editar?: boolean) => void
  onMover: (a: Nr1Acao, status: Nr1AcaoStatus) => void
}) {
  const [alvo, setAlvo] = useState<Nr1AcaoStatus | null>(null)
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
      {COLUNAS_KANBAN.map((c) => {
        const itens = acoes.filter((a) => a.status === c.status).sort((x, y) => x.quando.localeCompare(y.quando))
        return (
          <div
            key={c.status}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setAlvo(c.status)}
            onDragLeave={() => setAlvo((v) => (v === c.status ? null : v))}
            onDrop={(e) => {
              e.preventDefault()
              setAlvo(null)
              const a = acoes.find((x) => x.id === e.dataTransfer.getData('text/plain'))
              if (a) onMover(a, c.status)
            }}
            className={`flex w-[280px] shrink-0 flex-col gap-2.5 rounded-lg p-3 transition-colors lg:w-auto lg:min-w-0 ${alvo === c.status ? 'bg-primary-50 ring-2 ring-primary/40' : 'bg-surface-2'}`}
          >
            <div className="flex items-center justify-between px-1">
              <h3 className="font-heading text-[13px] font-semibold text-ink">{c.titulo}</h3>
              <span className="rounded-pill bg-surface px-2 py-0.5 font-mono text-[11px] font-semibold text-ink-secondary">{itens.length}</span>
            </div>
            <div className="-mx-1 flex max-h-[70vh] flex-col gap-2 overflow-y-auto px-1 pb-0.5">
              {itens.length === 0 && (
                <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-[11.5px] text-ink-muted">{alvo === c.status ? 'Solte aqui' : 'Nada aqui'}</p>
              )}
              {itens.map((a) => {
                const r = riscoDe(a)
                const [nome, dep] = a.quem.split(' · ')
                const dias = nr1DiasEntre(NR1_TODAY, a.quando)
                const vencida = a.status !== 'concluida' && dias < 0
                return (
                  <div
                    key={a.id}
                    role="button"
                    tabIndex={0}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', a.id)}
                    onClick={() => onAbrir(a)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAbrir(a) } }}
                    className={`flex cursor-grab flex-col gap-2 rounded-lg border bg-surface p-3 text-left transition-colors hover:border-border-strong active:cursor-grabbing ${vencida ? 'border-danger/40' : 'border-border'}`}
                  >
                    <p className="text-[13px] font-semibold leading-snug text-ink">{a.oQue}</p>
                    {r && <p className="line-clamp-2 text-[11px] text-ink-secondary"><span className="font-medium text-ink">{r.fator}</span> · {r.grupoExposto}</p>}
                    <p className="flex items-center gap-1 text-[11px] text-ink-secondary"><Icon icon="ph:user-bold" width={10} aria-hidden />{nome}{dep ? <span className="text-ink-muted">· {dep}</span> : null}</p>
                    <div className="text-[11.5px]">
                      <span className="font-mono font-semibold text-ink">{fmtData(a.quando)}</span>
                      {vencida && <span className="ml-1.5 font-semibold text-danger-ink">Vencida há {-dias} {-dias === 1 ? 'dia' : 'dias'}</span>}
                      {a.status === 'concluida' && a.concluidaEm && <span className="ml-1.5 font-medium text-success-ink">Concluída em {fmtData(a.concluidaEm)}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

