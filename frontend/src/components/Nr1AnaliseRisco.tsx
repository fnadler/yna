import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@iconify/react'
import { Button } from './Button'
import { Badge } from './Badge'
import { Textarea } from './Textarea'
import { Skeleton } from './Skeleton'
import { ErrorState } from './ErrorState'
import { Modal } from './Modal'
import { Toast } from './Toast'
import { AcaoForm } from './Nr1AcaoForm'
import { useService } from '../hooks/useService'
import { nr1ResultadoService, nr1AcaoService, nr1FatorRiscoService, nr1FonteGeradoraService } from '../services/nr1'
import { NR1_DIMENSOES, nr1NivelPorMedia, nr1NivelPorProduto } from '../data/nr1Mock'
import { NIVEL_RISCO, ACAO_STATUS, STATUS_RISCO, fmtData } from '../lib/nr1'
import type {
  Nr1Acao, Nr1Dimensao, Nr1DimensaoId, Nr1FatorRisco, Nr1FonteGeradora,
  Nr1LinhaMapa, Nr1NivelRisco, Nr1RiscoInventario, Nr1Severidade,
} from '../types'

/** De onde a análise foi aberta: um card de domínio (sem `departamentoId`,
   visão da empresa) ou uma célula do mapa de calor (com a área). `linhas` é
   o mapa de calor já carregado do ciclo — as notas por departamento saem
   dele, as mesmas que a pessoa acabou de ver. */
export interface Nr1AnaliseEscopo {
  campanhaId: string
  cicloLabel: string
  dimensaoId: Nr1DimensaoId
  departamentoId?: string
  linhas: Nr1LinhaMapa[]
}

interface DepartamentoNota {
  id: string
  nome: string
  respondentes: number
  protegido: boolean
  media: number | null
  nivel: Nr1NivelRisco | null
}

/** Só um editor aberto por vez — o formulário do risco ou o de uma ação. */
type Editor =
  | { tipo: 'risco'; risco?: Nr1RiscoInventario }
  | { tipo: 'acao'; riscoId: string; acao?: Nr1Acao }
  | null

/* Análise de risco em tela cheia (RF-D01/E01) — o resultado do ciclo num
   lado, o registro de riscos e planos de ação no outro, sem trocar de tela.

   O lado direito é guiado em dois passos: primeiro identificar e registrar
   o risco a partir do resultado ao lado; depois, com o risco já registrado
   (e recolhido), criar as ações 5W2H que o mitigam. Funciona igual com zero
   ou vários riscos já cadastrados no domínio. */
export function Nr1AnaliseRiscoModal({ escopo, onClose, onRiscosAlterados }: {
  escopo: Nr1AnaliseEscopo | null
  onClose: () => void
  onRiscosAlterados?: () => void
}) {
  if (!escopo) return null
  return createPortal(
    <Analise
      key={`${escopo.campanhaId}-${escopo.dimensaoId}-${escopo.departamentoId ?? ''}`}
      escopo={escopo}
      onClose={onClose}
      onRiscosAlterados={onRiscosAlterados}
    />,
    document.body,
  )
}

function Analise({ escopo, onClose, onRiscosAlterados }: {
  escopo: Nr1AnaliseEscopo
  onClose: () => void
  onRiscosAlterados?: () => void
}) {
  const meta = NR1_DIMENSOES.find((d) => d.id === escopo.dimensaoId)
  const [departamentoId, setDepartamentoId] = useState<string | undefined>(escopo.departamentoId)
  const dimensao = useService(() => nr1ResultadoService.dimensaoDaCampanha(escopo.campanhaId, escopo.dimensaoId), [])
  const itens = useService(
    () => nr1ResultadoService.itensPorDimensao(escopo.campanhaId, escopo.dimensaoId, departamentoId),
    [departamentoId],
  )
  const inventario = useService(() => nr1ResultadoService.inventario(), [])
  const acoes = useService(() => nr1AcaoService.list(), [])

  const [fatores, setFatores] = useState<Nr1FatorRisco[]>([])
  const [fontes, setFontes] = useState<Nr1FonteGeradora[]>([])
  useEffect(() => {
    void nr1FatorRiscoService.list().then((l) => setFatores([...l]))
    void nr1FonteGeradoraService.list().then((l) => setFontes([...l]))
  }, [])

  const [editor, setEditor] = useState<Editor>(null)
  const [sujo, setSujo] = useState(false)
  const [abertos, setAbertos] = useState<Set<string>>(new Set())
  /* Risco recém-registrado: fica recolhido, com o passo 2 ("agora crie o
     plano de ação") em destaque até a pessoa dispensar. */
  const [recemCriadoId, setRecemCriadoId] = useState<string | null>(null)
  const [confirmarSaida, setConfirmarSaida] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [excluirAcao, setExcluirAcao] = useState<Nr1Acao | null>(null)
  const [excluindo, setExcluindo] = useState(false)
  const marcarSujo = useCallback((v: boolean) => setSujo(v), [])

  const departamentos: DepartamentoNota[] = escopo.linhas.map((l) => {
    const celula = l.celulas.find((c) => c.dimensaoId === escopo.dimensaoId)
    return {
      id: l.departamentoId, nome: l.departamento, respondentes: l.respondentes, protegido: l.protegido,
      media: l.protegido ? null : celula?.media ?? null,
      nivel: l.protegido ? null : celula?.nivel ?? null,
    }
  })
  const visiveis = departamentos.filter((d) => d.media !== null)
  const mediaEmpresa = visiveis.length
    ? Number((visiveis.reduce((s, d) => s + d.media!, 0) / visiveis.length).toFixed(1))
    : 0
  const depSel = departamentos.find((d) => d.id === departamentoId)

  const riscos = inventario.status === 'success'
    ? inventario.data.filter((r) => r.dimensaoId === escopo.dimensaoId)
    : []

  /* Ações vigentes por risco — uma versão já substituída por outra não conta
     (mesmo critério do Plano de ação). */
  const acoesDoRisco = (riscoId: string) => {
    if (acoes.status !== 'success') return []
    const superadas = new Set(acoes.data.map((a) => a.versaoAnteriorId).filter(Boolean))
    return acoes.data.filter((a) => a.riscoId === riscoId && !superadas.has(a.id))
  }

  const pedirFechar = () => (editor && sujo ? setConfirmarSaida(true) : onClose())

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !confirmarSaida) pedirFechar() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  })

  /* Áreas já sugeridas num risco novo: a da célula/filtro atual ou — na
     visão da empresa — as que estão em Risco/Crítico neste domínio. */
  const departamentosSugeridos = departamentoId
    ? [departamentoId]
    : visiveis.filter((d) => d.nivel === 'risco' || d.nivel === 'critico').map((d) => d.id)

  const abrirEditor = (e: Editor) => { setSujo(false); setEditor(e) }
  const fecharEditor = () => { setSujo(false); setEditor(null) }

  const toggleAberto = (id: string) => setAbertos((s) => {
    const n = new Set(s)
    if (n.has(id)) n.delete(id)
    else n.add(id)
    return n
  })

  const aoSalvarRisco = (risco: Nr1RiscoInventario, novo: boolean) => {
    fecharEditor()
    inventario.reload()
    if (novo) setRecemCriadoId(risco.id)
    setFeedback(novo ? 'Risco registrado. Agora crie o plano de ação.' : 'Risco atualizado.')
    onRiscosAlterados?.()
  }

  const aoSalvarAcao = (_acao: Nr1Acao, nova: boolean) => {
    fecharEditor()
    acoes.reload()
    setFeedback(nova ? 'Ação criada.' : 'Ação atualizada.')
    onRiscosAlterados?.()
  }

  const confirmarExclusaoAcao = async () => {
    if (!excluirAcao) return
    setExcluindo(true)
    await nr1AcaoService.excluir(excluirAcao.id)
    setExcluindo(false)
    setExcluirAcao(null)
    acoes.reload()
    setFeedback('Ação excluída.')
    onRiscosAlterados?.()
  }

  const carregado = inventario.status === 'success' && dimensao.status === 'success'
  const editandoRiscoNovo = editor?.tipo === 'risco' && !editor.risco

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface-2" role="dialog" aria-modal aria-label={`Análise de risco · ${meta?.nome ?? ''}`}>
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-surface px-5 py-3 lg:px-8">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
          <Icon icon={meta?.icon ?? 'ph:list-bold'} width={20} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
            Análise de risco · {escopo.cicloLabel}
          </p>
          <h2 className="truncate font-heading text-[17px] font-semibold text-ink">{meta?.nome ?? escopo.dimensaoId}</h2>
        </div>
        <button
          onClick={pedirFechar}
          aria-label="Fechar análise"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-surface-hover"
        >
          <Icon icon="ph:x-bold" width={18} aria-hidden />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:overflow-hidden">
        {/* ── Resultado da avaliação ── */}
        <section className="border-b border-border bg-surface lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="flex flex-col gap-6 p-5 lg:p-8">
            <div>
              <h3 className="font-heading text-[16px] font-semibold text-ink">Resultado da avaliação deste domínio</h3>
              <p className="mb-3 mt-0.5 text-[12.5px] leading-relaxed text-ink-secondary">Veja a nota da empresa inteira ou filtre por uma área.</p>
              <SeletorContexto
                departamentos={departamentos}
                mediaEmpresa={mediaEmpresa}
                selecionadoId={departamentoId}
                onSelecionar={setDepartamentoId}
              />
            </div>

            {dimensao.status === 'loading' && <Skeleton className="h-40 w-full rounded-lg" />}
            {dimensao.status === 'success' && dimensao.data && (
              <>
                <Bloco titulo="O que é avaliado neste domínio">
                  <p className="text-[13px] leading-relaxed text-ink-secondary">{dimensao.data.descricao}</p>
                </Bloco>
                <Bloco titulo="Fatores de risco que este domínio mede">
                  {dimensao.data.fatoresRiscoIds.length === 0 ? (
                    <p className="text-[12.5px] text-ink-muted">Nenhum fator vinculado a este domínio no modelo.</p>
                  ) : (
                    <ul className="flex flex-col gap-1.5">
                      {dimensao.data.fatoresRiscoIds.map((id) => (
                        <li key={id} className="flex items-start gap-2 text-[13px] leading-snug text-ink">
                          <Icon icon="ph:warning-diamond-bold" width={15} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
                          {fatores.find((f) => f.id === id)?.nome ?? id}
                        </li>
                      ))}
                    </ul>
                  )}
                </Bloco>
                <Bloco titulo="Possíveis fontes geradoras de risco">
                  <div className="flex flex-wrap gap-1.5">
                    {dimensao.data.fontesGeradorasIds.map((id) => (
                      <span key={id} className="rounded-pill bg-surface px-2.5 py-1 text-[12px] text-ink-secondary ring-1 ring-border">
                        {fontes.find((f) => f.id === id)?.nome ?? id}
                      </span>
                    ))}
                    {dimensao.data.fontesGeradorasIds.length === 0 && (
                      <p className="text-[12.5px] text-ink-muted">Nenhuma fonte vinculada a este domínio no modelo.</p>
                    )}
                  </div>
                </Bloco>
              </>
            )}

            <Bloco titulo={`Pontuação por pergunta · ${depSel?.nome ?? 'Toda a empresa'}`} hint="Da nota mais baixa para a mais alta.">
              {(itens.status === 'idle' || itens.status === 'loading') && (
                <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div>
              )}
              {itens.status === 'error' && <ErrorState message={itens.message} onRetry={itens.reload} />}
              {itens.status === 'success' && itens.data.length === 0 && (
                <p className="text-[12.5px] text-ink-muted">Nenhuma pergunta deste domínio no instrumento aplicado.</p>
              )}
              {itens.status === 'success' && itens.data.length > 0 && (
                <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface">
                  {[...itens.data].sort((a, b) => a.media - b.media).map((i) => (
                    <li key={i.itemId} className="flex items-start gap-3 px-3.5 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] leading-snug text-ink">{i.texto}</p>
                        <p className="mt-0.5 font-mono text-[10.5px] text-ink-muted">{i.itemId} · {i.referencia}</p>
                      </div>
                      <NotaPill media={i.media} nivel={i.nivel} />
                    </li>
                  ))}
                </ul>
              )}
            </Bloco>
          </div>
        </section>

        {/* ── Riscos e planos de ação ── */}
        <section className="bg-surface-2 lg:overflow-y-auto">
          <div className="flex flex-col gap-4 p-5 lg:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-[16px] font-semibold text-ink">Riscos e planos de ação</h3>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-secondary">
                  {riscos.length === 0
                    ? 'Nenhum risco identificado neste domínio ainda.'
                    : `${riscos.length} ${riscos.length === 1 ? 'risco identificado' : 'riscos identificados'} neste domínio.`}
                </p>
              </div>
              {carregado && riscos.length > 0 && !editandoRiscoNovo && (
                <Button variant="secondary" iconLeft="ph:plus-bold" disabled={editor !== null} onClick={() => abrirEditor({ tipo: 'risco' })}>
                  Identificar novo risco
                </Button>
              )}
            </div>

            {(inventario.status === 'idle' || inventario.status === 'loading') && <Skeleton className="h-40 w-full rounded-lg" />}
            {inventario.status === 'error' && <ErrorState message={inventario.message} onRetry={inventario.reload} />}

            {carregado && (
              <>
                {riscos.length === 0 && !editandoRiscoNovo && (
                  <ComoFunciona onComecar={() => abrirEditor({ tipo: 'risco' })} />
                )}

                {editandoRiscoNovo && (
                  <RiscoForm
                    dimensao={dimensao.data}
                    dimensaoId={escopo.dimensaoId}
                    campanhaId={escopo.campanhaId}
                    departamentos={departamentos}
                    departamentosSugeridos={departamentosSugeridos}
                    fatores={fatores}
                    fontes={fontes}
                    onFatorCriado={(f) => setFatores((l) => [...l, f])}
                    onFonteCriada={(f) => setFontes((l) => [...l, f])}
                    onSujo={marcarSujo}
                    onCancel={fecharEditor}
                    onSaved={aoSalvarRisco}
                  />
                )}

                {riscos.map((r) => (editor?.tipo === 'risco' && editor.risco?.id === r.id ? (
                  <RiscoForm
                    key={r.id}
                    inicial={r}
                    dimensao={dimensao.data}
                    dimensaoId={escopo.dimensaoId}
                    campanhaId={escopo.campanhaId}
                    departamentos={departamentos}
                    departamentosSugeridos={r.departamentoIds}
                    fatores={fatores}
                    fontes={fontes}
                    onFatorCriado={(f) => setFatores((l) => [...l, f])}
                    onFonteCriada={(f) => setFontes((l) => [...l, f])}
                    onSujo={marcarSujo}
                    onCancel={fecharEditor}
                    onSaved={aoSalvarRisco}
                  />
                ) : (
                  <RiscoCard
                    key={r.id}
                    risco={r}
                    acoes={acoesDoRisco(r.id)}
                    fontes={fontes}
                    aberto={abertos.has(r.id)}
                    recemCriado={recemCriadoId === r.id}
                    destacado={!!departamentoId && r.departamentoIds.includes(departamentoId)}
                    editorAcao={editor?.tipo === 'acao' && editor.riscoId === r.id ? editor : null}
                    bloqueado={editor !== null}
                    onToggle={() => toggleAberto(r.id)}
                    onEditarRisco={() => abrirEditor({ tipo: 'risco', risco: r })}
                    onNovaAcao={() => abrirEditor({ tipo: 'acao', riscoId: r.id })}
                    onEditarAcao={(a) => abrirEditor({ tipo: 'acao', riscoId: r.id, acao: a })}
                    onExcluirAcao={setExcluirAcao}
                    ondePadrao={depSel ? [depSel.nome] : []}
                    onDispensarDestaque={() => setRecemCriadoId(null)}
                    onSujo={marcarSujo}
                    onCancelarAcao={fecharEditor}
                    onAcaoSalva={aoSalvarAcao}
                  />
                )))}
              </>
            )}
          </div>
        </section>
      </div>

      <Modal open={confirmarSaida} title="Descartar alterações?" onClose={() => setConfirmarSaida(false)}>
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px] leading-relaxed text-ink-secondary">
            Há um formulário preenchido e ainda não salvo. Se sair agora, o que foi preenchido se perde.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setConfirmarSaida(false)}>Continuar editando</Button>
            <Button fullWidth variant="secondary" onClick={onClose}>Descartar e sair</Button>
          </div>
        </div>
      </Modal>

      <Modal open={excluirAcao !== null} title="Excluir ação?" onClose={() => setExcluirAcao(null)}>
        {excluirAcao && (
          <div className="flex flex-col gap-4">
            <p className="text-[13.5px] leading-relaxed text-ink-secondary">
              A ação <strong className="font-semibold text-ink">{excluirAcao.oQue}</strong> sai do plano de ação deste risco,
              junto com o histórico de comentários dela. Não é possível desfazer.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setExcluirAcao(null)}>Cancelar</Button>
              <Button fullWidth variant="secondary" iconLeft="ph:trash-bold" disabled={excluindo} onClick={confirmarExclusaoAcao}>
                {excluindo ? 'Excluindo…' : 'Excluir ação'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Toast message={feedback} onClose={() => setFeedback(null)} />
    </div>
  )
}

/* ------------------------------------------------------------------ */

/** Card do resultado que também é o seletor: mostra a nota do recorte
   escolhido e, ao clicar, lista a empresa e cada área com sua nota para
   filtrar. */
function SeletorContexto({ departamentos, mediaEmpresa, selecionadoId, onSelecionar }: {
  departamentos: DepartamentoNota[]
  mediaEmpresa: number
  selecionadoId?: string
  onSelecionar: (id: string | undefined) => void
}) {
  const [aberto, setAberto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aberto) return
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false) }
    /* `stopPropagation` — sem isso o Escape também fecharia a análise inteira. */
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setAberto(false) } }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [aberto])

  const sel = departamentos.find((d) => d.id === selecionadoId)
  const media = sel?.media ?? mediaEmpresa
  const escolher = (id: string | undefined) => { onSelecionar(id); setAberto(false) }

  const ordenados = [...departamentos].sort((a, b) => (a.media ?? 99) - (b.media ?? 99))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        className={`flex w-full items-center gap-4 rounded-lg border bg-surface p-4 text-left transition-colors hover:border-border-strong ${aberto ? 'border-primary' : 'border-border'}`}
      >
        <NotaGrande media={media} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-[14px] font-semibold text-ink">{sel?.nome ?? 'Toda a empresa'}</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-ink-secondary">
            {sel
              ? <>{sel.respondentes} respondentes · Toda a empresa: <strong className="font-semibold text-ink">{mediaEmpresa.toFixed(1)}</strong></>
              : 'Média de 1 a 5, onde 5 é a situação desejável.'}
          </p>
        </div>
        <Icon icon="ph:caret-down-bold" width={16} className={`shrink-0 text-ink-muted transition-transform ${aberto ? 'rotate-180' : ''}`} aria-hidden />
      </button>

      {aberto && (
        <ul role="listbox" aria-label="Filtrar por área" className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-80 overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-lg">
          <OpcaoContexto nome="Toda a empresa" media={mediaEmpresa} nivel={nr1NivelPorMedia(mediaEmpresa)} ativo={!selecionadoId} onClick={() => escolher(undefined)} />
          <li className="mx-3 my-1 border-t border-border" aria-hidden />
          {ordenados.map((d) => (
            <OpcaoContexto
              key={d.id}
              nome={d.nome}
              detalhe={`${d.respondentes} respondentes`}
              media={d.media}
              nivel={d.nivel}
              ativo={d.id === selecionadoId}
              onClick={d.protegido ? undefined : () => escolher(d.id)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function OpcaoContexto({ nome, detalhe, media, nivel, ativo, onClick }: {
  nome: string
  detalhe?: string
  media: number | null
  nivel: Nr1NivelRisco | null
  ativo: boolean
  onClick?: () => void
}) {
  return (
    <li>
      <button
        type="button"
        role="option"
        aria-selected={ativo}
        onClick={onClick}
        disabled={!onClick}
        className={`flex w-full items-center gap-3 px-3.5 py-2 text-left transition-colors disabled:cursor-not-allowed ${ativo ? 'bg-primary-50' : 'hover:bg-surface-hover disabled:hover:bg-transparent'}`}
      >
        <Icon icon="ph:check-bold" width={14} className={`shrink-0 ${ativo ? 'text-primary dark:text-primary-300' : 'invisible'}`} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-[13px] text-ink ${ativo ? 'font-semibold' : ''}`}>{nome}</span>
          {detalhe && <span className="block text-[11px] text-ink-muted">{detalhe}</span>}
        </span>
        <NotaPill media={media} nivel={nivel} />
      </button>
    </li>
  )
}

/** Estado vazio do lado direito — explica os dois passos antes de começar. */
function ComoFunciona({ onComecar }: { onComecar: () => void }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 lg:p-6">
      <div className="mb-5 flex items-center gap-3 border-b border-border pb-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink-muted">
          <Icon icon="ph:clipboard-text-bold" width={22} aria-hidden />
        </span>
        <div>
          <p className="font-heading text-[15px] font-semibold text-ink">Nenhum risco identificado ainda</p>
          <p className="mt-0.5 text-[12.5px] text-ink-secondary">Analise o resultado ao lado e siga os dois passos abaixo.</p>
        </div>
      </div>
      <ol className="flex flex-col gap-4">
        <PassoGuia n={1} titulo="Identifique o risco" texto="Com base no resultado ao lado, registre o fator de risco que explica a nota, o que o gera e as áreas afetadas." />
        <PassoGuia n={2} titulo="Crie os planos de ação" texto="Com o risco registrado, defina as ações para mitigá-lo: o quê, por quê, quem, quando, onde, como e quanto." />
      </ol>
      <div className="mt-5">
        <Button iconLeft="ph:plus-bold" onClick={onComecar}>Identificar risco</Button>
      </div>
    </div>
  )
}

function PassoGuia({ n, titulo, texto }: { n: number; titulo: string; texto: string }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 font-mono text-[12px] font-bold text-primary dark:text-primary-300">{n}</span>
      <div>
        <p className="font-heading text-[14px] font-semibold text-ink">{titulo}</p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-secondary">{texto}</p>
      </div>
    </li>
  )
}

function Bloco({ titulo, hint, children }: { titulo: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-ink">{titulo}</p>
      {hint && <p className="mt-0.5 text-[11.5px] text-ink-muted">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  )
}

/** Pergunta numerada do formulário do risco, com uma linha de orientação. */
function Pergunta({ n, titulo, hint, children }: { n: number; titulo: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-2 font-mono text-[10.5px] font-bold text-ink-secondary">{n}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-ink">{titulo}</p>
        {hint && <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-muted">{hint}</p>}
        <div className="mt-2">{children}</div>
      </div>
    </div>
  )
}

function NotaGrande({ media }: { media: number }) {
  const st = NIVEL_RISCO[nr1NivelPorMedia(media)]
  return (
    <span className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-4 py-2 ${st.cls}`}>
      <span className="font-mono text-[22px] font-bold leading-none">{media.toFixed(1)}</span>
      <span className="text-[10.5px] font-semibold leading-none">{st.label}</span>
    </span>
  )
}

function NotaPill({ media, nivel }: { media: number | null; nivel: Nr1NivelRisco | null }) {
  if (media === null || nivel === null) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-surface-2 px-2 py-1 text-[11px] text-ink-muted" title="Menos de 4 respondentes — oculto por anonimato">
        <Icon icon="ph:lock-simple-bold" width={11} aria-hidden />
        Protegido
      </span>
    )
  }
  return (
    <span className={`shrink-0 rounded-pill px-2 py-1 font-mono text-[11.5px] font-semibold ${NIVEL_RISCO[nivel].cls}`}>
      {media.toFixed(1)}
    </span>
  )
}

function Chip({ selecionado, onClick, children, sufixo }: {
  selecionado: boolean
  onClick: () => void
  children: React.ReactNode
  sufixo?: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={selecionado}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-pill border-[1.5px] px-3 py-1.5 text-left text-[12.5px] font-medium transition-colors ${
        selecionado
          ? 'border-primary bg-primary-50 text-primary dark:text-primary-300'
          : 'border-border-strong bg-surface text-ink-secondary hover:border-primary hover:text-primary dark:hover:text-primary-300'
      }`}
    >
      <Icon icon={selecionado ? 'ph:check-circle-bold' : 'ph:circle-dashed-bold'} width={14} className="shrink-0" aria-hidden />
      {children}
      {sufixo}
    </button>
  )
}

/** "+ Novo fator" / "+ Nova fonte": vira um campo curto na própria linha dos
   chips e cria o cadastro no catálogo ao confirmar (RF-A05). */
function NovoItem({ rotulo, onCriar }: { rotulo: string; onCriar: (nome: string) => Promise<void> }) {
  const [aberto, setAberto] = useState(false)
  const [nome, setNome] = useState('')
  const [criando, setCriando] = useState(false)

  const confirmar = async () => {
    if (nome.trim().length < 3) return
    setCriando(true)
    await onCriar(nome.trim())
    setCriando(false)
    setNome('')
    setAberto(false)
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex items-center gap-1 rounded-pill border-[1.5px] border-dashed border-border-strong px-3 py-1.5 text-[12.5px] font-medium text-primary transition-colors hover:border-primary dark:text-primary-300"
      >
        <Icon icon="ph:plus-bold" width={12} aria-hidden />
        {rotulo}
      </button>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-pill border-[1.5px] border-primary bg-surface py-0.5 pl-3 pr-1">
      <input
        autoFocus
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); void confirmar() }
          if (e.key === 'Escape') { e.stopPropagation(); setAberto(false) }
        }}
        placeholder="Nome"
        className="w-44 bg-transparent text-[12.5px] text-ink outline-none placeholder:text-ink-muted"
      />
      <button type="button" onClick={confirmar} disabled={criando || nome.trim().length < 3} aria-label="Adicionar" className="flex h-6 w-6 items-center justify-center rounded-full text-primary hover:bg-primary-50 disabled:opacity-40 dark:text-primary-300">
        <Icon icon="ph:check-bold" width={13} aria-hidden />
      </button>
      <button type="button" onClick={() => setAberto(false)} aria-label="Cancelar" className="flex h-6 w-6 items-center justify-center rounded-full text-ink-muted hover:bg-surface-hover">
        <Icon icon="ph:x-bold" width={12} aria-hidden />
      </button>
    </span>
  )
}

function Escala({ titulo, valor, onChange, extremos }: {
  titulo: string
  valor: number
  onChange: (v: number) => void
  extremos: [string, string]
}) {
  return (
    <div>
      <p className="mb-1.5 text-[12px] font-medium text-ink-secondary">{titulo}</p>
      <div className="flex gap-1 rounded-lg bg-surface-2 p-1" role="radiogroup" aria-label={titulo}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={valor === n}
            onClick={() => onChange(n)}
            className={`flex-1 rounded-lg py-2 font-mono text-[13px] font-semibold transition-all ${
              valor === n ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10.5px] text-ink-muted">
        <span>{extremos[0]}</span>
        <span>{extremos[1]}</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

/* Risco registrado — recolhido por padrão (nível, fator, áreas e nº de
   ações). Expandido, os detalhes do risco aparecem logo abaixo do título e,
   em seguida, o plano de ação com cada ação listada. Recém-registrado, o
   plano de ação já aparece (mesmo com o risco recolhido), em destaque, como
   o passo 2. */
function RiscoCard({
  risco, acoes, fontes, aberto, recemCriado, destacado, editorAcao, bloqueado,
  onToggle, onEditarRisco, onNovaAcao, onEditarAcao, onExcluirAcao, onDispensarDestaque, onSujo, onCancelarAcao, onAcaoSalva,
  ondePadrao,
}: {
  risco: Nr1RiscoInventario
  acoes: Nr1Acao[]
  fontes: Nr1FonteGeradora[]
  aberto: boolean
  recemCriado: boolean
  destacado: boolean
  editorAcao: { acao?: Nr1Acao } | null
  bloqueado: boolean
  onToggle: () => void
  onEditarRisco: () => void
  onNovaAcao: () => void
  onEditarAcao: (a: Nr1Acao) => void
  onExcluirAcao: (a: Nr1Acao) => void
  /** Área já marcada em "Onde" numa ação nova — a do contexto atual. */
  ondePadrao: string[]
  onDispensarDestaque: () => void
  onSujo: (sujo: boolean) => void
  onCancelarAcao: () => void
  onAcaoSalva: (a: Nr1Acao, nova: boolean) => void
}) {
  const st = NIVEL_RISCO[risco.nivel]
  const semAcao = acoes.length === 0
  const mostrarPlano = aberto || recemCriado || editorAcao !== null

  return (
    <article className={`overflow-hidden rounded-lg border bg-surface ${recemCriado ? 'border-primary/50 ring-1 ring-primary/25' : destacado ? 'border-primary/40' : 'border-border'}`}>
      <button type="button" onClick={onToggle} aria-expanded={aberto} className="flex w-full items-start gap-3 p-4 text-left">
        <span className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 ${st.cls}`}>
          <span className="font-mono text-[16px] font-bold leading-none">{risco.nivelNum}</span>
          <span className="text-[10px] font-semibold leading-none">{st.label}</span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 font-heading text-[14px] font-semibold leading-snug text-ink">{risco.fator}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-ink-secondary">
            <span>{risco.grupoExposto}</span>
            <span aria-hidden>·</span>
            {semAcao
              ? <span className="font-medium text-warning-ink">Sem plano de ação</span>
              : <span>{acoes.length} {acoes.length === 1 ? 'ação' : 'ações'}</span>}
          </p>
        </div>
        <span className="mt-0.5 flex shrink-0 items-center gap-1 text-[11.5px] font-medium text-ink-muted">
          {aberto ? 'Ocultar detalhes' : 'Detalhes'}
          <Icon icon="ph:caret-down-bold" width={14} className={`transition-transform ${aberto ? 'rotate-180' : ''}`} aria-hidden />
        </span>
      </button>

      {/* Detalhes do risco — logo abaixo do título. */}
      {aberto && (
        <div className="flex flex-col gap-2.5 border-t border-border px-4 py-3.5 text-[12.5px] text-ink-secondary">
          <p>
            Probabilidade {risco.probabilidade} × severidade {risco.severidade} · {STATUS_RISCO[risco.status].label}
          </p>
          {risco.fontesGeradorasIds && risco.fontesGeradorasIds.length > 0 && (
            <div>
              <p className="mb-1 font-medium text-ink">Fontes geradoras</p>
              <div className="flex flex-wrap gap-1">
                {risco.fontesGeradorasIds.map((id) => (
                  <span key={id} className="rounded-pill bg-surface-2 px-2 py-0.5 text-[11px] text-ink-secondary">
                    {fontes.find((f) => f.id === id)?.nome ?? id}
                  </span>
                ))}
              </div>
            </div>
          )}
          {risco.danos && <p><span className="font-medium text-ink">Possíveis danos:</span> {risco.danos}</p>}
          <div>
            <Button size="sm" variant="ghost" iconLeft="ph:pencil-simple-bold" disabled={bloqueado} onClick={onEditarRisco}>Editar risco</Button>
          </div>
        </div>
      )}

      {/* Plano de ação — em destaque como passo 2 logo após registrar. */}
      {mostrarPlano && (
        <div className={`flex flex-col gap-3 border-t px-4 py-4 ${recemCriado ? 'border-primary/20 bg-primary-50' : 'border-border'}`}>
          {recemCriado ? (
            <div className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface font-mono text-[12px] font-bold text-primary dark:text-primary-300">2</span>
              <div className="min-w-0 flex-1">
                <p className="font-heading text-[14px] font-semibold text-ink">Agora crie planos de ação para mitigar o risco</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-ink-secondary">
                  Defina o que será feito, por quem e até quando (5W2H). Um risco pode ter quantas ações forem necessárias.
                </p>
              </div>
            </div>
          ) : (
            <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-ink-muted">Plano de ação</p>
          )}

          {semAcao && !editorAcao && !recemCriado && (
            <p className="text-[12.5px] text-ink-muted">Nenhuma ação para este risco ainda.</p>
          )}

          {acoes.length > 0 && (
            <ul className="flex flex-col gap-2">
              {acoes.map((a) => (editorAcao?.acao?.id === a.id ? null : (
                <li key={a.id} className="flex items-start gap-3 rounded-lg border border-border bg-surface px-3 py-2.5">
                  <Icon icon="ph:check-square-offset-bold" width={16} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium leading-snug text-ink">{a.oQue}</p>
                    <p className="mt-0.5 text-[11.5px] text-ink-secondary">{a.quem} · até {fmtData(a.quando)}</p>
                  </div>
                  <Badge tone={ACAO_STATUS[a.status].tone}>{ACAO_STATUS[a.status].label}</Badge>
                  {a.status !== 'concluida' && (
                    <>
                      <button
                        type="button"
                        onClick={() => onEditarAcao(a)}
                        disabled={bloqueado}
                        aria-label={`Editar ação ${a.oQue}`}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-secondary hover:bg-surface-hover hover:text-ink disabled:opacity-40"
                      >
                        <Icon icon="ph:pencil-simple-bold" width={14} aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => onExcluirAcao(a)}
                        disabled={bloqueado}
                        aria-label={`Excluir ação ${a.oQue}`}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:text-danger-ink disabled:opacity-40"
                      >
                        <Icon icon="ph:trash-bold" width={14} aria-hidden />
                      </button>
                    </>
                  )}
                </li>
              )))}
            </ul>
          )}

          {editorAcao && (
            <AcaoForm
              key={editorAcao.acao?.id ?? 'nova'}
              layout="inline"
              riscoId={risco.id}
              inicial={editorAcao.acao}
              porQuePadrao={`Mitigar: ${risco.fator}`}
              ondePadrao={ondePadrao}
              onSujo={onSujo}
              onClose={onCancelarAcao}
              onSaved={onAcaoSalva}
            />
          )}

          {!editorAcao && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={recemCriado && semAcao ? 'primary' : 'secondary'}
                iconLeft="ph:plus-bold"
                disabled={bloqueado}
                onClick={onNovaAcao}
              >
                {semAcao ? 'Criar ação' : 'Adicionar ação'}
              </Button>
              {recemCriado && !semAcao && (
                <Button size="sm" variant="ghost" iconLeft="ph:check-bold" onClick={onDispensarDestaque}>Concluir plano</Button>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  )
}

/* ------------------------------------------------------------------ */

/* Passo 1 — identificar o risco. Só os campos do risco: as ações vêm
   depois, com o risco já registrado. Perguntas numeradas, na ordem em que
   o resultado ao lado ajuda a respondê-las. */
function RiscoForm({
  inicial, dimensao, dimensaoId, campanhaId, departamentos, departamentosSugeridos,
  fatores, fontes, onFatorCriado, onFonteCriada, onSujo, onCancel, onSaved,
}: {
  inicial?: Nr1RiscoInventario
  dimensao?: Nr1Dimensao
  dimensaoId: Nr1DimensaoId
  campanhaId: string
  departamentos: DepartamentoNota[]
  departamentosSugeridos: string[]
  fatores: Nr1FatorRisco[]
  fontes: Nr1FonteGeradora[]
  onFatorCriado: (f: Nr1FatorRisco) => void
  onFonteCriada: (f: Nr1FonteGeradora) => void
  onSujo: (sujo: boolean) => void
  onCancel: () => void
  onSaved: (risco: Nr1RiscoInventario, novo: boolean) => void
}) {
  const [fatorId, setFatorId] = useState<string | undefined>(inicial?.fatorRiscoId)
  const [fontesIds, setFontesIds] = useState<string[]>(inicial?.fontesGeradorasIds ?? [])
  const [probabilidade, setProbabilidade] = useState(inicial?.probabilidade ?? 3)
  const [severidade, setSeveridade] = useState<number>(inicial?.severidade ?? 3)
  const [deps, setDeps] = useState<string[]>(inicial?.departamentoIds ?? departamentosSugeridos)
  const [danos, setDanos] = useState(inicial?.danos ?? '')
  const [salvando, setSalvando] = useState(false)

  const retrato = JSON.stringify({ fatorId, fontesIds, probabilidade, severidade, deps, danos })
  const retratoInicial = useRef(retrato)
  const sujo = retrato !== retratoInicial.current
  useEffect(() => { onSujo(sujo) }, [sujo, onSujo])

  /* Opções = o que o modelo vincula a este domínio + o que já estiver
     selecionado fora dele (um fator criado agora, ou herdado do risco). */
  const idsFator = useMemo(() => {
    const base = dimensao?.fatoresRiscoIds ?? []
    return fatorId && !base.includes(fatorId) ? [...base, fatorId] : base
  }, [dimensao, fatorId])
  const idsFonte = useMemo(() => {
    const base = dimensao?.fontesGeradorasIds ?? []
    return [...base, ...fontesIds.filter((id) => !base.includes(id))]
  }, [dimensao, fontesIds])

  const nomeFator = (id: string) => fatores.find((f) => f.id === id)?.nome ?? id
  const nomeFonte = (id: string) => fontes.find((f) => f.id === id)?.nome ?? id

  const nivelNum = probabilidade * severidade
  const nivel = NIVEL_RISCO[nr1NivelPorProduto(nivelNum)]

  /* Risco antigo, registrado em texto livre antes do catálogo: continua
     salvável como está, mas a UI sugere classificar num fator do domínio. */
  const legado = inicial && !inicial.fatorRiscoId ? inicial.fator : undefined
  const fatorFinal = fatorId ? nomeFator(fatorId) : legado
  const valido = !!fatorFinal && deps.length > 0

  const toggle = (lista: string[], id: string) => (lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id])

  const salvar = async () => {
    if (!valido || !fatorFinal) return
    setSalvando(true)
    const dados = {
      dimensaoId,
      departamentoIds: deps,
      fator: fatorFinal,
      fatorRiscoId: fatorId,
      fontesGeradorasIds: fontesIds,
      danos: danos.trim(),
      probabilidade,
      severidade: severidade as Nr1Severidade,
      controles: inicial?.controles ?? [],
    }
    const risco = inicial
      ? await nr1ResultadoService.editarRisco(inicial.id, dados)
      : await nr1ResultadoService.adicionarRisco({ ...dados, campanhaId })
    setSalvando(false)
    if (risco) onSaved(risco, !inicial)
  }

  return (
    <article className="rounded-lg border-[1.5px] border-primary/40 bg-surface">
      <div className="border-b border-border px-4 py-3.5 lg:px-5">
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-primary dark:text-primary-300">
          {inicial ? 'Editar risco' : 'Passo 1 de 2'}
        </p>
        <p className="mt-0.5 font-heading text-[15px] font-semibold text-ink">{inicial ? 'Ajuste o risco identificado' : 'Identifique o risco'}</p>
        {!inicial && (
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-secondary">
            Use o resultado ao lado — as perguntas com nota mais baixa e as áreas mais críticas —
            para responder às perguntas abaixo. Depois de registrar, você cria os planos de ação.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-5 p-4 lg:p-5">
        <Pergunta n={1} titulo="Qual fator de risco explica este resultado?" hint="Escolha entre os fatores que este domínio mede, ou cadastre outro.">
          {legado && !fatorId && (
            <p className="mb-2 rounded-lg bg-warning-bg px-3 py-2 text-[11.5px] leading-relaxed text-warning-ink">
              Registrado em texto livre: “{legado}”. Selecione um fator do domínio para classificá-lo, ou mantenha como está.
            </p>
          )}
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Fator de risco">
            {idsFator.map((id) => (
              <Chip key={id} selecionado={fatorId === id} onClick={() => setFatorId(fatorId === id ? undefined : id)}>
                {nomeFator(id)}
              </Chip>
            ))}
            <NovoItem
              rotulo="Outro fator"
              onCriar={async (nome) => {
                const f = await nr1FatorRiscoService.criar(nome)
                if (!fatores.some((x) => x.id === f.id)) onFatorCriado(f)
                setFatorId(f.id)
              }}
            />
          </div>
        </Pergunta>

        <Pergunta n={2} titulo="O que está gerando esse risco?" hint="Marque todas as fontes que se aplicam.">
          <div className="flex flex-wrap gap-2">
            {idsFonte.map((id) => (
              <Chip key={id} selecionado={fontesIds.includes(id)} onClick={() => setFontesIds((l) => toggle(l, id))}>
                {nomeFonte(id)}
              </Chip>
            ))}
            <NovoItem
              rotulo="Outra fonte"
              onCriar={async (nome) => {
                const f = await nr1FonteGeradoraService.criar(nome)
                if (!fontes.some((x) => x.id === f.id)) onFonteCriada(f)
                setFontesIds((l) => (l.includes(f.id) ? l : [...l, f.id]))
              }}
            />
          </div>
        </Pergunta>

        <Pergunta n={3} titulo="Quais áreas são afetadas?" hint="A nota de cada área neste domínio aparece ao lado do nome.">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Departamentos afetados">
            {departamentos.map((d) => (
              <Chip
                key={d.id}
                selecionado={deps.includes(d.id)}
                onClick={() => setDeps((l) => toggle(l, d.id))}
                sufixo={d.media !== null && d.nivel && (
                  <span className={`ml-0.5 rounded-pill px-1.5 font-mono text-[10.5px] font-semibold ${NIVEL_RISCO[d.nivel].cls}`}>{d.media.toFixed(1)}</span>
                )}
              >
                {d.nome}
              </Chip>
            ))}
          </div>
        </Pergunta>

        <Pergunta n={4} titulo="Qual a probabilidade e a severidade?" hint="O nível do risco é calculado automaticamente: probabilidade × severidade.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Escala titulo="Probabilidade" valor={probabilidade} onChange={setProbabilidade} extremos={['Rara', 'Quase certa']} />
            <Escala titulo="Severidade" valor={severidade} onChange={setSeveridade} extremos={['Leve', 'Extrema']} />
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-lg bg-surface-2 p-3.5">
            <span className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-4 py-2 ${nivel.cls}`}>
              <span className="font-mono text-[18px] font-bold leading-none">{nivelNum}</span>
              <span className="text-[10.5px] font-semibold leading-none">{nivel.label}</span>
            </span>
            <p className="text-[12px] leading-relaxed text-ink-secondary">
              Nível do risco. <strong className="font-semibold text-ink">{nivel.acao}.</strong>
            </p>
          </div>
        </Pergunta>

        <Pergunta n={5} titulo="Quais os possíveis danos à saúde?" hint="Opcional — aparece no inventário do PGR.">
          <Textarea rows={2} value={danos} onChange={(e) => setDanos(e.target.value)} placeholder="Ex.: Fadiga crônica, esgotamento profissional" />
        </Pergunta>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-end lg:px-5">
        {!valido && <p className="text-[11.5px] text-ink-muted sm:mr-auto">Escolha um fator de risco e ao menos uma área.</p>}
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button iconLeft={inicial ? 'ph:check-bold' : 'ph:arrow-right-bold'} disabled={!valido || salvando} onClick={salvar}>
          {salvando ? 'Salvando…' : inicial ? 'Salvar alterações' : 'Registrar risco'}
        </Button>
      </div>
    </article>
  )
}
