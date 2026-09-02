import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { Select } from '../../components/Select'
import { PrazoBadge } from '../../components/PrazoBadge'
import { Sheet } from '../../components/Sheet'
import { Modal } from '../../components/Modal'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { Nr1AdicionarRiscoForm } from '../../components/Nr1AdicionarRiscoForm'
import { PAGE_MAX_W } from '../../lib/layout'
import { NIVEL_RISCO, STATUS_RISCO, ACAO_RECOMENDADA, ACAO_STATUS } from '../../lib/nr1'
import { useService } from '../../hooks/useService'
import { useRh } from '../../contexts/RhContext'
import { nr1ResultadoService, nr1AcaoService } from '../../services/nr1'
import { rhDepartamentoService } from '../../services/rh'
import { NR1_DIMENSOES } from '../../data/nr1Mock'
import type { Nr1RiscoInventario, Nr1Acao, Nr1Tendencia, Nr1DimensaoId, RhDepartamento } from '../../types'

/** Colunas da tabela de riscos no desktop: nota, título do risco, dimensão,
   departamentos afetados, ações vinculadas e status — mesmo padrão de
   `LISTA_GRID_COLS` do Plano de ação, uma constante para o cabeçalho e cada
   linha nunca desalinharem entre si. */
const RISCOS_GRID_COLS = 'grid-cols-[76px_1fr_150px_120px_100px_140px]'

/* NR1-RH-03 — Inventário de riscos psicossociais para o PGR (RF-D01/02/03).

   Este é o entregável legal central: o que precisa constar no PGR do cliente.
   Cada linha traz o formato do GRO — fator/perigo, possíveis danos, grupo
   exposto, nível (probabilidade × severidade) e controles recomendados.

   A citação do instrumento (modelo + versão + protocolo) aparece no topo e vai
   junto na exportação: sem ela o inventário não se sustenta em fiscalização.

   "Adicionar risco" cobre o caso de um risco identificado fora da pesquisa
   (auditoria, observação direta do SESMT) — nasce sem histórico de ciclos,
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
  const [editando, setEditando] = useState<Nr1RiscoInventario | null>(null)
  const [excluirAlvo, setExcluirAlvo] = useState<Nr1RiscoInventario | null>(null)
  const [excluindo, setExcluindo] = useState(false)
  const [excluirErro, setExcluirErro] = useState<{ risco: Nr1RiscoInventario; message: string } | null>(null)
  const [concluirAlvo, setConcluirAlvo] = useState<Nr1RiscoInventario | null>(null)
  const [concluindo, setConcluindo] = useState(false)
  const [exportando, setExportando] = useState<'pdf' | 'planilha' | null>(null)
  const [exportado, setExportado] = useState<string | null>(null)
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

  const exportar = async (formato: 'pdf' | 'planilha') => {
    setExportando(formato)
    const r = await nr1ResultadoService.exportarInventario(formato)
    setExportando(null)
    setExportado(r.arquivo)
  }

  const acoesDoRisco = (riscoId: string): Nr1Acao[] =>
    acoes.status === 'success' ? acoes.data.filter((a) => a.riscoId === riscoId) : []

  /* Fecha o formulário de edição. Volta para o detalhe do risco que estava
     sendo editado — mesma ideia de `fecharForm` no Plano de ação. */
  const fecharEdicao = () => {
    const r = editando
    setEditando(null)
    if (r) setDetalhe(r)
  }

  const salvarEdicao = (salvo?: Nr1RiscoInventario) => {
    setEditando(null)
    inventario.reload()
    if (salvo) setDetalhe(salvo)
  }

  /* Excluir e concluir fecham o Sheet de detalhe antes de abrir o modal de
     confirmação (em vez de empilhar o modal por cima) — `Modal` não usa
     portal como `Sheet` usa, então um modal aberto com o Sheet ainda de pé
     renderiza visualmente ATRÁS dele. Cancelar reabre o detalhe do mesmo
     risco, igual a `fecharEdicao`. */
  const cancelarExclusao = () => {
    const r = excluirAlvo
    setExcluirAlvo(null)
    if (r) setDetalhe(r)
  }

  const fecharExcluirErro = () => {
    const e = excluirErro
    setExcluirErro(null)
    if (e) setDetalhe(e.risco)
  }

  /* Excluir só é permitido sem ações vinculadas — a checagem de verdade é do
     serviço (`excluirRisco`); aqui só reagimos ao resultado. Se vier
     bloqueado, reabre o detalhe do risco por trás do aviso (ver
     `fecharExcluirErro`), para a pessoa não perder onde estava. */
  const confirmarExclusao = async () => {
    if (!excluirAlvo) return
    const alvo = excluirAlvo
    setExcluindo(true)
    const r = await nr1ResultadoService.excluirRisco(alvo.id)
    setExcluindo(false)
    setExcluirAlvo(null)
    if (!r.ok) { setExcluirErro({ risco: alvo, message: r.message ?? 'Não foi possível excluir o risco.' }); return }
    inventario.reload()
  }

  const cancelarConclusao = () => {
    const r = concluirAlvo
    setConcluirAlvo(null)
    if (r) setDetalhe(r)
  }

  /* "Concluir risco" força o status para "Eliminado" — a única exceção à
     regra de que esse status só vem da evolução entre ciclos (ver
     `RiscoSeed.concluidoManualmente`). Reabre o detalhe já com o status
     atualizado, para o botão "Concluir" sumir do cabeçalho sem precisar um
     segundo clique. */
  const confirmarConclusao = async () => {
    if (!concluirAlvo) return
    const alvo = concluirAlvo
    setConcluindo(true)
    await nr1ResultadoService.concluirRisco(alvo.id)
    setConcluindo(false)
    setConcluirAlvo(null)
    inventario.reload()
    setDetalhe({ ...alvo, status: 'eliminado' })
  }

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
              <Button variant="primary" iconLeft="ph:plus-bold" onClick={() => setNovoRiscoOpen(true)}>
                <span className="hidden sm:inline">Adicionar risco</span>
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
            {/* Filtros — palavra-chave, dimensão e departamento, combináveis. */}
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
              <div className="flex flex-col gap-2">
                {/* Cabeçalho das colunas — só no desktop, onde a grade existe de
                   fato; no mobile cada linha já se organiza em pilha. */}
                <div className={`hidden items-center gap-3 px-3.5 lg:grid ${RISCOS_GRID_COLS}`}>
                  <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Nota</span>
                  <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Risco</span>
                  <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Dimensão</span>
                  <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Deptos.</span>
                  <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Ações</span>
                  <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Status</span>
                </div>
                {filtrados.map((r) => (
                  <RiscoLinha
                    key={r.id}
                    risco={r}
                    vinculadas={acoesDoRisco(r.id)}
                    departamentos={listaDepartamentos}
                    onClick={() => setDetalhe(r)}
                  />
                ))}
              </div>
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

      {/* Detalhe do risco */}
      <Sheet
        open={detalhe !== null}
        onClose={() => setDetalhe(null)}
        title="Detalhe do risco"
        icon="ph:clipboard-text-bold"
        size="md"
        headerActions={detalhe && (
          <>
            <button
              onClick={() => { setEditando(detalhe); setDetalhe(null) }}
              aria-label="Editar risco"
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
            >
              <Icon icon="ph:pencil-simple-bold" width={15} aria-hidden />
            </button>
            <button
              onClick={() => { setExcluirAlvo(detalhe); setDetalhe(null) }}
              aria-label="Excluir risco"
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-danger/10 hover:text-danger-ink"
            >
              <Icon icon="ph:trash-bold" width={15} aria-hidden />
            </button>
            {detalhe.status !== 'eliminado' && (
              <button
                onClick={() => { setConcluirAlvo(detalhe); setDetalhe(null) }}
                aria-label="Concluir risco"
                title="Concluir risco"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-600"
              >
                <Icon icon="ph:check-bold" width={15} aria-hidden />
              </button>
            )}
          </>
        )}
      >
        {detalhe && <RiscoDetalhe key={detalhe.id} risco={detalhe} acoes={acoesDoRisco(detalhe.id)} />}
      </Sheet>

      {/* Adicionar risco */}
      <Sheet open={novoRiscoOpen} onClose={() => setNovoRiscoOpen(false)} title="Adicionar risco" icon="ph:plus-bold" size="md">
        <Nr1AdicionarRiscoForm
          onClose={() => setNovoRiscoOpen(false)}
          onSaved={() => { setNovoRiscoOpen(false); inventario.reload() }}
        />
      </Sheet>

      {/* Editar risco */}
      <Sheet open={editando !== null} onClose={fecharEdicao} title="Editar risco" icon="ph:pencil-simple-bold" size="md">
        {editando && <Nr1AdicionarRiscoForm inicial={editando} onClose={fecharEdicao} onSaved={salvarEdicao} />}
      </Sheet>

      <Modal open={excluirAlvo !== null} title="Excluir risco" onClose={cancelarExclusao}>
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px] leading-relaxed text-ink-secondary">
            Tem certeza que deseja excluir este risco do inventário? Essa ação não pode ser
            desfeita.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={cancelarExclusao}>Cancelar</Button>
            <Button variant="danger" iconLeft="ph:trash-bold" disabled={excluindo} onClick={confirmarExclusao}>
              {excluindo ? 'Excluindo…' : 'Excluir risco'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={excluirErro !== null} title="Risco não excluído" onClose={fecharExcluirErro}>
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px] leading-relaxed text-ink-secondary">{excluirErro?.message}</p>
          <Button fullWidth onClick={fecharExcluirErro}>Entendi</Button>
        </div>
      </Modal>

      <Modal open={concluirAlvo !== null} title="Concluir risco" onClose={cancelarConclusao}>
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px] leading-relaxed text-ink-secondary">
            Concluir marca este risco como <span className="font-medium text-ink">Eliminado</span>,
            indicando que ele foi resolvido, independente do que o próximo ciclo da pesquisa
            mostrar. Use quando o RH/SST já confirmou que o risco não existe mais.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={cancelarConclusao}>Cancelar</Button>
            <Button iconLeft="ph:check-bold" disabled={concluindo} onClick={confirmarConclusao}>
              {concluindo ? 'Concluindo…' : 'Concluir risco'}
            </Button>
          </div>
        </div>
      </Modal>

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
   seis colunas alinhadas com o cabeçalho (`RISCOS_GRID_COLS`): nota, título
   do risco, dimensão, departamentos afetados (contagem, com um popover para
   ver a lista completa — `DepartamentosPopover`), ações vinculadas e status.
   Abaixo de `lg`, os mesmos dados em pilha compacta.

   Clicar em qualquer parte da linha abre o detalhe do risco (mesmo Sheet de
   sempre) — só o botão do popover de departamentos precisa impedir a
   propagação do clique, senão abrir a lista de departamentos também abriria
   o detalhe. */
function RiscoLinha({ risco, vinculadas, departamentos, onClick }: {
  risco: Nr1RiscoInventario
  vinculadas: Nr1Acao[]
  departamentos: RhDepartamento[]
  onClick: () => void
}) {
  const nivel = NIVEL_RISCO[risco.nivel]
  const status = STATUS_RISCO[risco.status]

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
        <span className={`flex w-fit flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 ${nivel.cls}`}>
          <span className="font-mono text-[14px] font-bold leading-none">{risco.nivelNum}</span>
          <span className="text-[9px] font-semibold leading-none">{nivel.label}</span>
        </span>
        <div className="min-w-0">
          <p className="text-[13.5px] leading-snug text-ink">{risco.fator}</p>
          <p className="mt-0.5 text-[11px] text-ink-muted">{risco.respondentes} respondentes</p>
        </div>
        <p className="min-w-0 truncate text-[12.5px] text-ink-secondary">{risco.dimensao}</p>
        <DepartamentosPopover ids={risco.departamentoIds} departamentos={departamentos} />
        <span className="inline-flex w-fit items-center gap-1 text-[12.5px] text-ink-secondary">
          <Icon icon="ph:list-checks-bold" width={13} className="shrink-0 text-ink-muted" aria-hidden />
          {vinculadas.length}
        </span>
        <div><Badge tone={status.tone} icon={status.icon}>{status.label}</Badge></div>
      </div>

      {/* Mobile/tablet — pilha compacta */}
      <div className="flex items-start gap-3 lg:hidden">
        <span className={`mt-0.5 flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-2 py-1 ${nivel.cls}`}>
          <span className="font-mono text-[12px] font-bold leading-none">{risco.nivelNum}</span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="min-w-0 text-[13.5px] font-medium leading-snug text-ink">{risco.fator}</p>
            <Badge tone={status.tone} className="shrink-0">{status.label}</Badge>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11.5px] text-ink-secondary">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-ink-muted">{risco.dimensao}</span>
            <DepartamentosPopover ids={risco.departamentoIds} departamentos={departamentos} />
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <Icon icon="ph:list-checks-bold" width={11} aria-hidden />
              {vinculadas.length} {vinculadas.length === 1 ? 'ação' : 'ações'}
            </span>
          </div>
        </div>
        <Icon icon="ph:caret-right-bold" width={14} className="mt-1 shrink-0 text-ink-muted" aria-hidden />
      </div>
    </div>
  )
}

/** Contagem de departamentos afetados por um risco, com um popover que
   mostra a lista completa ao clicar — evita ter que abrir o detalhe do
   risco só para ver quais departamentos estão expostos. */
function DepartamentosPopover({ ids, departamentos }: { ids: string[]; departamentos: RhDepartamento[] }) {
  const [open, setOpen] = useState(false)
  const nomes = ids.map((id) => departamentos.find((d) => d.id === id)?.nome ?? id)

  return (
    <div className="relative w-fit">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        aria-expanded={open}
        aria-label={`${ids.length} ${ids.length === 1 ? 'departamento afetado' : 'departamentos afetados'}, ver lista`}
        className="inline-flex items-center gap-1 rounded-pill bg-surface-2 px-2 py-1 text-[12px] font-medium text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
      >
        <Icon icon="ph:buildings-bold" width={12} className="shrink-0" aria-hidden />
        {ids.length}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setOpen(false) }} />
          <div
            role="menu"
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 top-full z-40 mt-1.5 w-56 rounded-lg border border-border bg-surface p-2 shadow-lg"
          >
            <p className="mb-1 px-2 pt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
              Departamentos afetados
            </p>
            <ul className="flex flex-col gap-0.5">
              {nomes.map((nome, i) => (
                <li key={i} className="rounded px-2 py-1.5 text-[12.5px] text-ink">{nome}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

type RiscoAba = 'dados' | 'acoes'

/** Detalhe do risco, em duas abas — "Dados do risco" (o que é, o nível, os
   controles recomendados) e "Planos de ação" (as ações vinculadas, ver
   `RiscoAcoesTab`). Separar em abas tirou "Ações vinculadas" de dentro dos
   dados do risco (fazia mais sentido como sua própria aba, do tamanho que
   quiser crescer, do que uma seção a mais no fim de uma lista já longa). */
function RiscoDetalhe({ risco, acoes }: { risco: Nr1RiscoInventario; acoes: Nr1Acao[] }) {
  const [aba, setAba] = useState<RiscoAba>('dados')
  const st = NIVEL_RISCO[risco.nivel]

  const abas: { valor: RiscoAba; label: string; icon: string }[] = [
    { valor: 'dados', label: 'Dados do risco', icon: 'ph:clipboard-text-bold' },
    { valor: 'acoes', label: 'Planos de ação', icon: 'ph:list-checks-bold' },
  ]

  return (
    <>
      <div className="mx-5 mt-5 flex gap-1 rounded-lg bg-surface-2 p-1 lg:mx-6" role="tablist" aria-label="Detalhe do risco">
        {abas.map((t) => (
          <button
            key={t.valor}
            role="tab"
            aria-selected={aba === t.valor}
            onClick={() => setAba(t.valor)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 font-heading text-sm font-semibold transition-all ${
              aba === t.valor ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
            }`}
          >
            <Icon icon={t.icon} width={15} aria-hidden />
            {t.label}
            {t.valor === 'acoes' && acoes.length > 0 && (
              <span className="rounded-pill bg-surface px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink-secondary">{acoes.length}</span>
            )}
          </button>
        ))}
      </div>

      {aba === 'dados' ? (
        <div className="flex flex-col gap-5 px-5 py-6 lg:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <EvolucaoBadges risco={risco} />
          </div>

          <Campo label="Descrição do fator / perigo">{risco.fator}</Campo>
          <Campo label="Possíveis danos à saúde">{risco.danos}</Campo>
          <Campo label="Grupo de trabalhadores exposto">
            {risco.grupoExposto} · {risco.respondentes} respondentes
          </Campo>

          <div>
            <p className="mb-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
              Nível de risco
            </p>
            <div className="flex items-center gap-3">
              <span className={`flex flex-col items-center gap-0.5 rounded-lg px-4 py-2.5 ${st.cls}`}>
                <span className="font-mono text-[20px] font-bold leading-none">{risco.nivelNum}</span>
                <span className="text-[11px] font-semibold leading-none">{st.label}</span>
              </span>
              <div className="text-[12.5px] text-ink-secondary">
                <p>Probabilidade {risco.probabilidade} × severidade {risco.severidade}</p>
                <p className="mt-0.5 font-medium text-ink">{st.acao}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
              Controles recomendados
            </p>
            <ul className="flex flex-col gap-1.5">
              {risco.controles.map((c, i) => (
                <li key={i} className="flex items-start gap-2 rounded-lg bg-surface-2 px-3.5 py-2.5 text-[13px] leading-snug text-ink-secondary">
                  <Icon icon="ph:check-bold" width={13} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <RiscoAcoesTab riscoId={risco.id} acoes={acoes} />
      )}
    </>
  )
}

/** Aba "Planos de ação" do detalhe do risco — as ações vinculadas, numa
   organização parecida com a visualização "Lista" da tela de Planos de ação
   (`NR1RhPlanoAcao.tsx`): prazo, ação (título + responsável) e status, em
   colunas no desktop e empilhado no mobile. Cada linha leva para o Plano de
   ação filtrado por este risco — gerenciar a ação (editar, comentar,
   concluir) continua acontecendo lá, não é duplicado aqui dentro do modal. */
function RiscoAcoesTab({ riscoId, acoes }: { riscoId: string; acoes: Nr1Acao[] }) {
  return (
    <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          {acoes.length} {acoes.length === 1 ? 'ação vinculada' : 'ações vinculadas'}
        </p>
        <Link
          to={`/rh/nr1/plano-acao?risco=${riscoId}`}
          className="inline-flex items-center gap-1 text-[11.5px] font-medium text-primary hover:underline dark:text-primary-300"
        >
          {acoes.length > 0 ? 'Ver no Plano de ação' : 'Definir ação'}
          <Icon icon="ph:arrow-right-bold" width={10} aria-hidden />
        </Link>
      </div>

      {acoes.length === 0 ? (
        <p className="rounded-lg bg-surface-2 px-3.5 py-3 text-[12.5px] text-ink-secondary">
          Nenhuma ação definida ainda. Priorizar um risco e não agir sobre ele deixa a cadeia pela
          metade.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {acoes.map((a) => <RiscoAcaoLinha key={a.id} acao={a} riscoId={riscoId} />)}
        </div>
      )}
    </div>
  )
}

/** Colunas de `RiscoAcaoLinha` no desktop — prazo, ação e status. Sem a
   coluna de nível que `AcaoLinha` (Plano de ação) tem: aqui todas as linhas
   são do mesmo risco, então o nível já apareceu uma vez na aba "Dados do
   risco" e repeti-lo em toda linha só adicionaria ruído. */
const RISCO_ACOES_GRID_COLS = 'grid-cols-[130px_1fr_120px]'

function RiscoAcaoLinha({ acao, riscoId }: { acao: Nr1Acao; riscoId: string }) {
  const st = ACAO_STATUS[acao.status]
  return (
    <Link
      to={`/rh/nr1/plano-acao?risco=${riscoId}`}
      className="block rounded-lg border border-border bg-surface p-3.5 transition-colors hover:border-border-strong hover:bg-surface-hover"
    >
      {/* Desktop — colunas */}
      <div className={`hidden items-center gap-3 lg:grid ${RISCO_ACOES_GRID_COLS}`}>
        <div><PrazoBadge acao={acao} /></div>
        <div className="min-w-0">
          <p className="font-heading text-[13.5px] font-semibold text-ink">
            {acao.oQue}
            {acao.versao > 1 && <span className="ml-1.5 text-[10.5px] font-normal text-ink-muted">v{acao.versao}</span>}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-muted">
            <Icon icon="ph:user-bold" width={10} aria-hidden />{acao.quem}
          </p>
        </div>
        <div><Badge tone={st.tone}>{st.label}</Badge></div>
      </div>

      {/* Mobile/tablet — pilha compacta */}
      <div className="flex items-start gap-3 lg:hidden">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="min-w-0 font-heading text-[13.5px] font-semibold text-ink">
              {acao.oQue}
              {acao.versao > 1 && <span className="ml-1.5 text-[10.5px] font-normal text-ink-muted">v{acao.versao}</span>}
            </p>
            <Badge tone={st.tone} className="shrink-0">{st.label}</Badge>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11.5px] text-ink-secondary">
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <Icon icon="ph:user-bold" width={11} aria-hidden />{acao.quem}
            </span>
            <PrazoBadge acao={acao} />
          </div>
        </div>
        <Icon icon="ph:caret-right-bold" width={14} className="mt-1.5 shrink-0 text-ink-muted" aria-hidden />
      </div>
    </Link>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">{label}</p>
      <p className="text-[13.5px] leading-relaxed text-ink">{children}</p>
    </div>
  )
}

/* Status + tendência + sugestão do risco — sempre uma leitura calculada a
   partir do histórico entre ciclos (ver nr1AnalisarEvolucao), nunca uma
   conclusão. O card mostra a sugestão; quem decide o que fazer com ela é o
   SST/RH. */
function EvolucaoBadges({ risco }: { risco: Nr1RiscoInventario }) {
  const st = STATUS_RISCO[risco.status]
  return (
    <>
      <Badge tone={st.tone} icon={st.icon}>{st.label}</Badge>
      {risco.tendencia && <TendenciaTag tendencia={risco.tendencia} variacaoPontos={risco.variacaoPontos} />}
      {risco.acaoRecomendada && (
        <span className="text-[11.5px] text-ink-secondary">
          Sugestão: <span className="font-medium text-ink">{ACAO_RECOMENDADA[risco.acaoRecomendada].label}</span>
        </span>
      )}
    </>
  )
}

const TENDENCIA_VISUAL: Record<Nr1Tendencia, { icon: string; cls: string; label: string }> = {
  melhorando: { icon: 'ph:trend-up-bold', cls: 'text-success-ink', label: 'Melhorando' },
  estavel: { icon: 'ph:minus-bold', cls: 'text-ink-muted', label: 'Estável' },
  piorando: { icon: 'ph:trend-down-bold', cls: 'text-danger-ink', label: 'Piorando' },
}

function TendenciaTag({ tendencia, variacaoPontos }: { tendencia: Nr1Tendencia; variacaoPontos?: number }) {
  const v = TENDENCIA_VISUAL[tendencia]
  return (
    <span className={`inline-flex items-center gap-1 text-[11.5px] font-medium ${v.cls}`}>
      <Icon icon={v.icon} width={13} aria-hidden />
      {v.label}
      {variacaoPontos !== undefined && ` (${variacaoPontos > 0 ? '+' : ''}${variacaoPontos.toFixed(1)})`}
    </span>
  )
}

/* O formulário "Adicionar risco" foi extraído para
   `components/Nr1AdicionarRiscoForm.tsx` — reaproveitado também pela aba
   "Riscos sugeridos" (`Nr1RiscosSugeridos.tsx`), com valores pré-preenchidos
   a partir da leitura da sugestão. */
