import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Select } from '../../components/Select'
import { Sheet } from '../../components/Sheet'
import { Modal } from '../../components/Modal'
import { Toast } from '../../components/Toast'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { Nr1DepartamentosPopover } from '../../components/Nr1DepartamentosPopover'
import { Nr1AdicionarRiscoForm } from '../../components/Nr1AdicionarRiscoForm'
import { Nr1AnaliseRiscoModal, Nr1RiscoDetalheModal, type Nr1AnaliseInicio } from '../../components/Nr1AnaliseRisco'
import { cicloLabelCurto } from '../../components/Nr1PainelRiscoMapa'
import { PAGE_MAX_W } from '../../lib/layout'
import { NIVEL_RISCO } from '../../lib/nr1'
import { useService } from '../../hooks/useService'
import { useRh } from '../../contexts/RhContext'
import { nr1ResultadoService, nr1AcaoService, nr1CampanhaService } from '../../services/nr1'
import { rhDepartamentoService } from '../../services/rh'
import { NR1_DIMENSOES, nr1NivelPorProduto } from '../../data/nr1Mock'
import type { Nr1RiscoInventario, Nr1Acao, Nr1DimensaoId, Nr1NivelRisco, Nr1Severidade, RhDepartamento } from '../../types'

/** Colunas da tabela de riscos no desktop: nota, título do risco, dimensão,
   departamentos afetados, ações vinculadas e status — mesmo padrão de
   `LISTA_GRID_COLS` do Plano de ação, uma constante para o cabeçalho e cada
   linha nunca desalinharem entre si. */
const RISCOS_GRID_COLS = 'grid-cols-[1fr_150px_80px_64px_120px_136px_72px]'

/* NR1-RH-03 — Inventário de riscos psicossociais para o PGR (RF-D01/02/03).

   Este é o entregável legal central: o que precisa constar no PGR do cliente.
   Cada linha traz o formato do GRO — fator/perigo, possíveis danos, grupo
   exposto, nível (probabilidade × severidade) e controles recomendados.

   A citação do instrumento (modelo + versão + protocolo) aparece no topo e vai
   junto na exportação: sem ela o inventário não se sustenta em fiscalização.

   "Adicionar risco" abre a mesma análise da Matriz de risco, começando pela
   escolha do domínio. Sem ciclo finalizado, cai no formulário avulso — risco
   identificado fora da pesquisa (auditoria, observação direta do SESMT) —
   que nasce sem histórico de ciclos,
   então aparece como "Identificado", sem tendência/sugestão ainda (essas só
   existem a partir do 2º ciclo com dado, ver `nr1AnalisarEvolucao`). */

export function NR1RhInventario() {
  const { instrumentoNr1 } = useRh()
  const [params] = useSearchParams()
  const detalheParam = params.get('detalhe')
  const inventario = useService(() => nr1ResultadoService.inventario(), [])
  const acoes = useService(() => nr1AcaoService.list(), [])
  const departamentos = useService(() => rhDepartamentoService.list(), [])
  const [detalhe, setDetalhe] = useState<Nr1RiscoInventario | null>(null)
  const [novoRiscoOpen, setNovoRiscoOpen] = useState(false)
  const [analiseInicio, setAnaliseInicio] = useState<Nr1AnaliseInicio | null>(null)
  const [preparandoNovo, setPreparandoNovo] = useState(false)
  const [exportando, setExportando] = useState<'pdf' | 'planilha' | null>(null)
  const [exportado, setExportado] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [dimensaoFiltro, setDimensaoFiltro] = useState<'todas' | Nr1DimensaoId>('todas')
  const [departamentoFiltro, setDepartamentoFiltro] = useState('todos')

  /* Deep-link para abrir o detalhe de um risco específico direto (usado pela
     coluna "Ação" do Plano de ação — clicar na dimensão/risco de uma ação
     leva para aqui já com o detalhe aberto, em vez de deixar a pessoa achar
     o risco na lista de novo). */
  useEffect(() => {
    if (!detalheParam || inventario.status !== 'success') return
    const r = inventario.data.find((x) => x.id === detalheParam)
    if (r) setDetalhe(r)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detalheParam, inventario.status])

  /* "Adicionar risco" abre a mesma análise da Matriz de risco, no último
     ciclo finalizado: primeiro a escolha do domínio (visão da empresa),
     depois o registro guiado. Sem ciclo finalizado não há resultado para
     mostrar ao lado — cai no formulário avulso. */
  const adicionarRisco = async () => {
    setPreparandoNovo(true)
    const campanhas = await nr1CampanhaService.list()
    const ciclo = [...campanhas].filter((c) => c.status === 'encerrada').sort((a, b) => b.inicio.localeCompare(a.inicio))[0]
    if (!ciclo) {
      setPreparandoNovo(false)
      setNovoRiscoOpen(true)
      return
    }
    const linhas = await nr1ResultadoService.mapaCalor(ciclo.id)
    setPreparandoNovo(false)
    setAnaliseInicio({ campanhaId: ciclo.id, cicloLabel: cicloLabelCurto(ciclo), linhas })
  }

  /* Severidade editada direto na lista — o nível (P × S) é recalculado pelo
     inventário e o risco muda de célula na matriz assim que a lista recarrega. */
  const alterarSeveridade = async (r: Nr1RiscoInventario, severidade: Nr1Severidade) => {
    if (severidade === r.severidade) return
    const salvo = await nr1ResultadoService.editarRisco(r.id, {
      dimensaoId: r.dimensaoId,
      departamentoIds: r.departamentoIds,
      fator: r.fator,
      fatorRiscoId: r.fatorRiscoId,
      fontesGeradorasIds: r.fontesGeradorasIds,
      danos: r.danos,
      probabilidade: r.probabilidade,
      severidade,
      controles: r.controles,
    })
    inventario.reload()
    if (salvo) setFeedback(`Severidade atualizada. Nota ${salvo.nivelNum} · ${NIVEL_RISCO[salvo.nivel].label}.`)
  }

  const exportar = async (formato: 'pdf' | 'planilha') => {
    setExportando(formato)
    const r = await nr1ResultadoService.exportarInventario(formato)
    setExportando(null)
    setExportado(r.arquivo)
  }

  const acoesDoRisco = (riscoId: string): Nr1Acao[] =>
    acoes.status === 'success' ? acoes.data.filter((a) => a.riscoId === riscoId) : []

  const listaDepartamentos = departamentos.status === 'success'
    ? [...departamentos.data].sort((a, b) => a.nome.localeCompare(b.nome))
    : []

  const termo = busca.trim().toLowerCase()
  const filtrosAtivos = termo !== '' || dimensaoFiltro !== 'todas' || departamentoFiltro !== 'todos'
  const limparFiltros = () => { setBusca(''); setDimensaoFiltro('todas'); setDepartamentoFiltro('todos') }

  const filtrados = inventario.status === 'success'
    ? inventario.data
      .filter((r) => (dimensaoFiltro === 'todas' ? true : r.dimensaoId === dimensaoFiltro))
      .filter((r) => (departamentoFiltro === 'todos' ? true : r.departamentoIds.includes(departamentoFiltro)))
      .filter((r) => (termo ? r.fator.toLowerCase().includes(termo) || r.grupoExposto.toLowerCase().includes(termo) : true))
    : []

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />

        <PageHeader
          className="mt-2 lg:mt-0"
          title="Inventário de Riscos"
          subtitle="Os fatores de risco psicossocial, prontos para incorporar ao seu PGR."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary" iconLeft="ph:plus-bold" disabled={preparandoNovo} onClick={adicionarRisco}>
                <span className="hidden sm:inline">{preparandoNovo ? 'Abrindo…' : 'Adicionar risco'}</span>
              </Button>
              <div className="hidden gap-2 sm:flex">
                <Button variant="ghost" iconLeft="ph:file-xls-bold" disabled={exportando !== null} onClick={() => exportar('planilha')}>
                  {exportando === 'planilha' ? 'Gerando…' : 'Planilha'}
                </Button>
                <Button variant="secondary" iconLeft="ph:file-pdf-bold" disabled={exportando !== null} onClick={() => exportar('pdf')}>
                  {exportando === 'pdf' ? 'Gerando…' : 'PDF'}
                </Button>
              </div>
            </div>
          }
        />

        {/* Registro metodológico — viaja com o inventário */}
        {instrumentoNr1 && (
          <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-border bg-surface p-4">
            <span className="flex items-center gap-2 text-[12.5px] text-ink-secondary">
              <Icon icon="ph:seal-check-bold" width={15} className="text-primary dark:text-primary-300" aria-hidden />
              {instrumentoNr1.modeloNome} · versão {instrumentoNr1.versao}
            </span>
            <span className="font-mono text-[11.5px] text-ink-muted">protocolo {instrumentoNr1.protocolo}</span>
          </div>
        )}

        {(inventario.status === 'idle' || inventario.status === 'loading') && (
          <div className="flex flex-col gap-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}</div>
        )}
        {inventario.status === 'error' && <ErrorState message={inventario.message} onRetry={inventario.reload} />}

        {inventario.status === 'success' && (
          <>
            {/* Filtros — palavra-chave, dimensão e departamento, combináveis.
               Valem para a matriz e para a lista abaixo dela. */}
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Palavra-chave</p>
                <div className="relative">
                  <Icon icon="ph:magnifying-glass-bold" width={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden />
                  <input
                    type="search"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar por risco ou grupo exposto…"
                    aria-label="Buscar risco"
                    className="w-full rounded-lg border-[1.5px] border-border bg-surface py-2.5 pl-10 pr-3.5 text-[13.5px] text-ink placeholder:text-ink-muted outline-none transition-colors focus:border-primary"
                  />
                </div>
              </div>
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
                  options={[{ value: 'todos', label: 'Todos os departamentos' }, ...listaDepartamentos.map((d) => ({ value: d.id, label: d.nome }))]}
                />
              </div>
            </div>

            {filtrosAtivos && (
              <button onClick={limparFiltros} className="mb-5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-primary hover:underline dark:text-primary-300">
                <Icon icon="ph:x-circle-bold" width={13} aria-hidden />
                Limpar filtros
              </button>
            )}

            {filtrados.length === 0 ? (
              <div className="rounded-lg border border-border bg-surface px-5 py-14 text-center">
                <p className="text-[15px] font-semibold text-ink">Nenhum risco encontrado</p>
                <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-ink-secondary">
                  {filtrosAtivos
                    ? 'Nenhum risco combina com os filtros escolhidos.'
                    : 'Ainda não há riscos registrados no inventário.'}
                </p>
              </div>
            ) : (
              <>
              <div className="mb-5">
                <MatrizProbabilidadeSeveridade riscos={filtrados} onAbrir={setDetalhe} />
              </div>
              <div className="flex flex-col gap-2">
                {/* Cabeçalho das colunas — só no desktop, onde a grade existe de
                   fato; no mobile cada linha já se organiza em pilha. */}
                <div className={`hidden items-center gap-3 px-3.5 lg:grid ${RISCOS_GRID_COLS}`}>
                  <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Risco</span>
                  <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Domínio</span>
                  <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Deptos.</span>
                  <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Ações</span>
                  <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Probabilidade</span>
                  <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Severidade</span>
                  <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Nota</span>
                </div>
                {filtrados.map((r) => (
                  <RiscoLinha
                    key={r.id}
                    risco={r}
                    vinculadas={acoesDoRisco(r.id)}
                    departamentos={listaDepartamentos}
                    onClick={() => setDetalhe(r)}
                    onSeveridade={(sev) => alterarSeveridade(r, sev)}
                  />
                ))}
              </div>
              </>
            )}

            {/* Exportação — mobile */}
            <div className="mt-5 flex gap-2 sm:hidden">
              <Button fullWidth variant="ghost" iconLeft="ph:file-xls-bold" disabled={exportando !== null} onClick={() => exportar('planilha')}>
                {exportando === 'planilha' ? 'Gerando…' : 'Planilha'}
              </Button>
              <Button fullWidth variant="secondary" iconLeft="ph:file-pdf-bold" disabled={exportando !== null} onClick={() => exportar('pdf')}>
                {exportando === 'pdf' ? 'Gerando…' : 'PDF'}
              </Button>
            </div>

            <div className="mt-6 flex gap-3 rounded-lg border border-border bg-surface-2 p-4">
              <Icon icon="ph:info-bold" width={20} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
              <p className="text-[12px] leading-relaxed text-ink-secondary">
                A YNA entrega o inventário no formato do GRO, pronto para ser incorporado ao PGR
                que a sua empresa já mantém. Não substituímos o seu software de SST, nem
                assinamos o documento. A responsabilidade técnica é do SESMT ou da consultoria.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Detalhe do risco — análise em tela cheia: dados à esquerda, ações à direita. */}
      <Nr1RiscoDetalheModal
        risco={detalhe}
        onClose={() => setDetalhe(null)}
        onAlterado={() => { inventario.reload(); acoes.reload() }}
      />

      {/* Adicionar risco */}
      <Sheet open={novoRiscoOpen} onClose={() => setNovoRiscoOpen(false)} title="Adicionar risco" icon="ph:plus-bold" size="md">
        <Nr1AdicionarRiscoForm
          onClose={() => setNovoRiscoOpen(false)}
          onSaved={() => { setNovoRiscoOpen(false); inventario.reload() }}
        />
      </Sheet>

      <Nr1AnaliseRiscoModal
        escopo={analiseInicio}
        onClose={() => setAnaliseInicio(null)}
        onRiscosAlterados={() => { inventario.reload(); acoes.reload() }}
      />

      <Toast message={feedback} onClose={() => setFeedback(null)} />

      <Modal open={exportado !== null} title="Arquivo gerado" onClose={() => setExportado(null)}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-3.5">
            <Icon icon="ph:file-arrow-down-bold" width={20} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
            <span className="min-w-0 truncate font-mono text-[12.5px] text-ink">{exportado}</span>
          </div>
          <p className="text-[12.5px] leading-relaxed text-ink-secondary">
            O arquivo traz o inventário completo com a versão do instrumento e o protocolo do
            ciclo, que é o que o responsável técnico precisa para anexar ao PGR.
          </p>
          <Button fullWidth onClick={() => setExportado(null)}>Fechar</Button>
        </div>
      </Modal>
    </div>
  )
}

/** Linha de um risco — a visualização em tabela do inventário. No desktop,
   sete colunas alinhadas com o cabeçalho (`RISCOS_GRID_COLS`): título do
   risco, domínio, departamentos afetados (contagem, com um popover para ver
   a lista completa — `Nr1DepartamentosPopover`), ações vinculadas,
   probabilidade, severidade (editável) e, por último, a nota P × S.
   Abaixo de `lg`, os mesmos dados em pilha compacta.

   Clicar em qualquer parte da linha abre o detalhe do risco em tela cheia
   (`Nr1RiscoDetalheModal`) — só o botão do popover de departamentos precisa impedir a
   propagação do clique, senão abrir a lista de departamentos também abriria
   o detalhe. */
function RiscoLinha({ risco, vinculadas, departamentos, onClick, onSeveridade }: {
  risco: Nr1RiscoInventario
  vinculadas: Nr1Acao[]
  departamentos: RhDepartamento[]
  onClick: () => void
  onSeveridade: (s: Nr1Severidade) => void
}) {
  const nivel = NIVEL_RISCO[risco.nivel]
  const nomesDeps = risco.departamentoIds.map((id) => departamentos.find((d) => d.id === id)?.nome ?? id)
  const probabilidade = `${risco.probabilidade} · ${PROBABILIDADE_ROTULOS[risco.probabilidade - 1]}`
  /* O droplist fica dentro da linha clicável — clique e teclado nele não
     podem abrir o detalhe. */
  const severidade = (
    <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <Select
        size="sm"
        value={String(risco.severidade)}
        onChange={(v) => onSeveridade(Number(v) as Nr1Severidade)}
        ariaLabel={`Severidade de ${risco.fator}`}
        options={SEVERIDADE_ROTULOS.map((r, i) => ({ value: String(i + 1), label: `${i + 1} · ${r}` }))}
      />
    </div>
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
      <div className={`hidden items-center gap-3 lg:grid ${RISCOS_GRID_COLS}`}>
        <div className="min-w-0">
          <p className="text-[13.5px] leading-snug text-ink">{risco.fator}</p>
          <p className="mt-0.5 text-[11px] text-ink-muted">{risco.respondentes} respondentes</p>
        </div>
        <p className="min-w-0 truncate text-[12.5px] text-ink-secondary">{risco.dimensao}</p>
        <Nr1DepartamentosPopover nomes={nomesDeps} />
        <span className="inline-flex w-fit items-center gap-1 text-[12.5px] text-ink-secondary">
          <Icon icon="ph:list-checks-bold" width={13} className="shrink-0 text-ink-muted" aria-hidden />
          {vinculadas.length}
        </span>
        <p className="text-[12.5px] text-ink-secondary">{probabilidade}</p>
        {severidade}
        <span className={`flex w-fit flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 ${nivel.cls}`}>
          <span className="font-mono text-[14px] font-bold leading-none">{risco.nivelNum}</span>
          <span className="text-[9px] font-semibold leading-none">{nivel.label}</span>
        </span>
      </div>

      {/* Mobile/tablet — pilha compacta */}
      <div className="flex items-start gap-3 lg:hidden">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 text-[13.5px] font-medium leading-snug text-ink">{risco.fator}</p>
            <span className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-2 py-1 ${nivel.cls}`}>
              <span className="font-mono text-[12px] font-bold leading-none">{risco.nivelNum}</span>
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11.5px] text-ink-secondary">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-ink-muted">{risco.dimensao}</span>
            <Nr1DepartamentosPopover nomes={nomesDeps} />
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <Icon icon="ph:list-checks-bold" width={11} aria-hidden />
              {vinculadas.length} {vinculadas.length === 1 ? 'ação' : 'ações'}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11.5px] text-ink-secondary">
            <span>Probabilidade {probabilidade}</span>
            <span className="text-ink-muted">·</span>
            <span>Severidade</span>
            <div className="w-36">{severidade}</div>
          </div>
        </div>
        <Icon icon="ph:caret-right-bold" width={14} className="mt-1 shrink-0 text-ink-muted" aria-hidden />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
   Visualização "Matriz de risco" — probabilidade (eixo Y, de 5 no topo a 1
   embaixo) × severidade (eixo X, de 1 a 5). Cada risco cai na célula da sua
   pontuação; a cor da célula é o nível do produto P × S (mesmos cortes de
   `nr1NivelPorProduto`). Clicar num risco abre o mesmo detalhe da lista.
   ------------------------------------------------------------------ */

const PROBABILIDADE_ROTULOS = ['Rara', 'Improvável', 'Possível', 'Provável', 'Quase certa']
const SEVERIDADE_ROTULOS = ['Leve', 'Menor', 'Moderada', 'Grave', 'Extrema']

/** Fundo de cada célula — tons suaves do nível, para os cards de risco
   continuarem legíveis por cima. */
const CELULA_NIVEL: Record<Nr1NivelRisco, string> = {
  baixo: 'bg-success/20',
  atencao: 'bg-warning/30',
  risco: 'bg-danger/20',
  critico: 'bg-danger/45',
}

/** Cards visíveis por célula antes do "+N". */
const POR_CELULA = 2

function MatrizProbabilidadeSeveridade({ riscos, onAbrir }: {
  riscos: Nr1RiscoInventario[]
  onAbrir: (r: Nr1RiscoInventario) => void
}) {
  const [expandida, setExpandida] = useState<string | null>(null)
  const [dica, setDica] = useState<Dica | null>(null)
  /* A posição é fixa na tela — rolar com o tooltip aberto o descolaria do card. */
  useEffect(() => {
    if (!dica) return
    const fechar = () => setDica(null)
    window.addEventListener('scroll', fechar, true)
    return () => window.removeEventListener('scroll', fechar, true)
  }, [dica])

  return (
    <div className="rounded-lg border border-border bg-surface p-4 lg:p-5">
      {dica && <TooltipRisco dica={dica} />}
      <div className="overflow-x-auto">
        <div className="grid min-w-[680px] grid-cols-[24px_104px_repeat(5,minmax(0,1fr))] gap-1">
          {/* Título do eixo Y, ao longo das 5 linhas */}
          <div className="row-span-5 flex items-center justify-center">
            <span className="-rotate-90 whitespace-nowrap font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Probabilidade
            </span>
          </div>

          {[5, 4, 3, 2, 1].map((p) => (
            <MatrizLinha key={p} p={p} riscos={riscos} expandida={expandida} onExpandir={setExpandida} onAbrir={onAbrir} onDica={setDica} />
          ))}

          {/* Eixo X */}
          <div />
          <div />
          {SEVERIDADE_ROTULOS.map((r, i) => (
            <p key={r} className="pt-0.5 text-center text-[11px] text-ink-secondary">
              <span className="font-mono font-semibold text-ink">{i + 1}</span> · {r}
            </p>
          ))}
          <div />
          <div />
          <p className="col-span-5 text-center font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Severidade</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3 text-[11.5px] text-ink-secondary">
        <span className="font-medium text-ink">Nível (P × S):</span>
        {(['baixo', 'atencao', 'risco', 'critico'] as Nr1NivelRisco[]).map((n) => (
          <span key={n} className="inline-flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded-[3px] ${CELULA_NIVEL[n]} ring-1 ring-inset ring-border`} aria-hidden />
            {NIVEL_RISCO[n].label}
          </span>
        ))}
        <span className="text-ink-muted">· Clique num risco para ver o detalhe.</span>
      </div>
    </div>
  )
}

function MatrizLinha({ p, riscos, expandida, onExpandir, onAbrir, onDica }: {
  p: number
  riscos: Nr1RiscoInventario[]
  expandida: string | null
  onExpandir: (k: string | null) => void
  onAbrir: (r: Nr1RiscoInventario) => void
  onDica: (d: Dica | null) => void
}) {
  const mostrar = (r: Nr1RiscoInventario, el: HTMLElement) => {
    const b = el.getBoundingClientRect()
    onDica({ risco: r, x: b.left + b.width / 2, topo: b.top, base: b.bottom })
  }
  return (
    <>
      <div className="flex flex-col items-end justify-center pr-1 text-right">
        <p className="text-[11px] leading-tight text-ink-secondary"><span className="font-mono font-semibold text-ink">{p}</span> · {PROBABILIDADE_ROTULOS[p - 1]}</p>
      </div>
      {[1, 2, 3, 4, 5].map((sev) => {
        const chave = `${p}-${sev}`
        const produto = p * sev
        const nivel = nr1NivelPorProduto(produto)
        const aqui = riscos.filter((r) => r.probabilidade === p && r.severidade === sev).sort((a, b) => a.fator.localeCompare(b.fator))
        const aberta = expandida === chave
        const visiveis = aberta ? aqui : aqui.slice(0, POR_CELULA)
        return (
          <div
            key={sev}
            className={`flex min-h-[64px] flex-col gap-1 rounded-none p-1 ${CELULA_NIVEL[nivel]}`}
            aria-label={`Probabilidade ${p} × severidade ${sev}: ${aqui.length} ${aqui.length === 1 ? 'risco' : 'riscos'}`}
          >
            <span className="self-end font-mono text-[9.5px] font-semibold leading-none text-ink-muted">{produto}</span>
            {visiveis.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => { onDica(null); onAbrir(r) }}
                onMouseEnter={(e) => mostrar(r, e.currentTarget)}
                onMouseLeave={() => onDica(null)}
                onFocus={(e) => mostrar(r, e.currentTarget)}
                onBlur={() => onDica(null)}
                aria-label={`${r.fator}. Departamentos afetados: ${r.grupoExposto}`}
                className="w-full rounded-md border border-border bg-surface px-2 py-1 text-left shadow-xs transition-colors hover:border-primary/50 hover:bg-surface-hover"
              >
                <p className="truncate text-[11px] font-semibold leading-snug text-ink">{r.fator}</p>
              </button>
            ))}
            {aqui.length > POR_CELULA && (
              <button
                type="button"
                onClick={() => onExpandir(aberta ? null : chave)}
                className="rounded-md px-2 py-0.5 text-[10.5px] font-medium text-primary hover:underline dark:text-primary-300"
              >
                {aberta ? 'Mostrar menos' : `+${aqui.length - POR_CELULA} ${aqui.length - POR_CELULA === 1 ? 'risco' : 'riscos'}`}
              </button>
            )}
          </div>
        )
      })}
    </>
  )
}

/** Risco sob o mouse (ou foco) na matriz, com a posição do card na tela. */
interface Dica {
  risco: Nr1RiscoInventario
  x: number
  topo: number
  base: number
}

/** Tooltip de um card da matriz — nome completo do risco e os departamentos
   afetados. Em portal com posição fixa: dentro da matriz ele seria cortado
   pela rolagem horizontal do container. Abre acima do card; perto do topo
   da tela, abre abaixo. */
function TooltipRisco({ dica }: { dica: Dica }) {
  const acima = dica.topo > 160
  const deps = dica.risco.grupoExposto.split(',').map((x) => x.trim()).filter(Boolean)
  const largura = 260
  const left = Math.min(Math.max(dica.x - largura / 2, 8), window.innerWidth - largura - 8)
  return createPortal(
    <div
      role="tooltip"
      className="pointer-events-none fixed z-[70] rounded-lg border border-border bg-surface p-3 shadow-lg"
      style={{ left, width: largura, ...(acima ? { bottom: window.innerHeight - dica.topo + 8 } : { top: dica.base + 8 }) }}
    >
      <p className="text-[13px] font-semibold leading-snug text-ink">{dica.risco.fator}</p>
      <p className="mt-0.5 text-[11px] text-ink-muted">{dica.risco.dimensao}</p>
      <p className="mt-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
        {deps.length === 1 ? 'Departamento afetado' : 'Departamentos afetados'}
      </p>
      <ul className="mt-1 flex flex-wrap gap-1">
        {deps.map((d) => (
          <li key={d} className="inline-flex items-center gap-1 rounded-pill bg-primary-50 px-2 py-0.5 text-[11.5px] font-medium text-primary dark:text-primary-300">
            <Icon icon="ph:buildings-bold" width={11} aria-hidden />
            {d}
          </li>
        ))}
      </ul>
    </div>,
    document.body,
  )
}

