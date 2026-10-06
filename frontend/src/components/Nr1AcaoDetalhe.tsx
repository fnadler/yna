import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from './Button'
import { Badge } from './Badge'
import { Avatar } from './Avatar'
import { PrazoBadge } from './PrazoBadge'
import { Textarea } from './Textarea'
import { Modal } from './Modal'
import { Toast } from './Toast'
import { AcaoForm } from './Nr1AcaoForm'
import { useRh } from '../contexts/RhContext'
import { NIVEL_RISCO, ACAO_STATUS, EFETIVIDADE, fmtData, nr1DiasEntre, nr1UrgenciaPrazo } from '../lib/nr1'
import { NR1_TODAY, NR1_DIMENSOES } from '../data/nr1Mock'
import { useService } from '../hooks/useService'
import { nr1AcaoService, nr1FonteGeradoraService, nr1ResultadoService } from '../services/nr1'
import type { Nr1Acao, Nr1AcaoAtividade, Nr1AtividadeTipo, Nr1Comentario, Nr1RiscoInventario } from '../types'

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

type AbaDiario = 'comentarios' | 'atividade'

/** Detalhe de uma ação em tela cheia — mesma diagramação da análise de
   risco e do detalhe do risco (`Nr1AnaliseRisco.tsx`): à esquerda os dados
   da ação no mesmo layout do formulário 5W2H (editáveis ali mesmo); à
   direita o diário, em duas abas — "Comentários" (andamento e evidências,
   com exclusão confirmada) e "Atividade" (o log de tudo que foi feito na
   ação: quem, o quê e quando).

   É autossuficiente: editar, excluir e concluir (com a pergunta de concluir
   sem registro) acontecem aqui dentro; quem abre só recebe `onAlterado`
   para recarregar a própria lista. */
export function Nr1AcaoDetalheModal({ acao, riscos, onClose, onAlterado }: {
  acao: Nr1Acao | null
  /** Inventário carregado — para o risco de origem e o seletor na edição. */
  riscos: Nr1RiscoInventario[]
  onClose: () => void
  onAlterado?: () => void
}) {
  if (!acao) return null
  return createPortal(
    <DetalheAcao key={acao.id} inicial={acao} riscos={riscos} onClose={onClose} onAlterado={onAlterado} />,
    document.body,
  )
}

function DetalheAcao({ inicial, riscos, onClose, onAlterado }: {
  inicial: Nr1Acao
  riscos: Nr1RiscoInventario[]
  onClose: () => void
  onAlterado?: () => void
}) {
  const { usuario } = useRh()
  const [acao, setAcao] = useState(inicial)
  const [editando, setEditando] = useState(false)
  const [sujo, setSujo] = useState(false)
  const marcarSujo = useCallback((v: boolean) => setSujo(v), [])
  const [aba, setAba] = useState<AbaDiario>('comentarios')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [confirmarSaida, setConfirmarSaida] = useState(false)
  const [excluirAcao, setExcluirAcao] = useState(false)
  const [concluirSemRegistro, setConcluirSemRegistro] = useState(false)
  const [excluirComentario, setExcluirComentario] = useState<Nr1Comentario | null>(null)
  const [processando, setProcessando] = useState(false)

  const risco = riscos.find((r) => r.id === acao.riscoId)
  const meta = risco ? NR1_DIMENSOES.find((d) => d.id === risco.dimensaoId) : undefined
  const concluida = acao.status === 'concluida'

  /* O mock muta a ação no lugar — relê do serviço para pegar comentários e
     atividades novos com uma identidade nova (re-render). */
  const recarregar = async () => {
    const lista = await nr1AcaoService.list()
    const atual = lista.find((x) => x.id === acao.id)
    if (atual) setAcao({ ...atual, comentarios: [...atual.comentarios], atividades: [...(atual.atividades ?? [])] })
    onAlterado?.()
  }

  const pedirFechar = () => (editando && sujo ? setConfirmarSaida(true) : onClose())
  const algumModal = confirmarSaida || excluirAcao || concluirSemRegistro || excluirComentario !== null

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !algumModal) pedirFechar() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  })

  const concluir = async () => {
    setProcessando(true)
    const r = await nr1AcaoService.concluir(acao.id)
    setProcessando(false)
    if (r.semRegistro) { setConcluirSemRegistro(true); return }
    if (!r.ok) return
    await recarregar()
    setFeedback('Ação concluída.')
  }

  const confirmarConclusao = async () => {
    setProcessando(true)
    await nr1AcaoService.concluir(acao.id, { semRegistro: true })
    setProcessando(false)
    setConcluirSemRegistro(false)
    await recarregar()
    setFeedback('Ação concluída.')
  }

  const confirmarExclusaoAcao = async () => {
    setProcessando(true)
    await nr1AcaoService.excluir(acao.id)
    setProcessando(false)
    setExcluirAcao(false)
    onAlterado?.()
    onClose()
  }

  const comentar = async (p: { texto?: string; arquivos?: string[] }) => {
    await nr1AcaoService.comentar(acao.id, { autor: usuario.nome, ...p })
    await recarregar()
  }

  const confirmarExclusaoComentario = async () => {
    if (!excluirComentario) return
    setProcessando(true)
    await nr1AcaoService.excluirComentario(acao.id, excluirComentario.id)
    setProcessando(false)
    setExcluirComentario(null)
    await recarregar()
    setFeedback('Comentário excluído.')
  }

  const aoSalvar = async () => {
    setEditando(false)
    setSujo(false)
    await recarregar()
    setFeedback('Ação atualizada.')
  }

  const atividades = [...(acao.atividades ?? [])].reverse()

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface-2" role="dialog" aria-modal aria-label={`Ação · ${acao.oQue}`}>
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-surface px-5 py-3 lg:px-8">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
          <Icon icon={meta?.icon ?? 'ph:list-checks-bold'} width={20} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
            Plano de ação{risco ? ` · ${risco.dimensao}` : ''}
          </p>
          <h2 className="truncate font-heading text-[17px] font-semibold text-ink">
            {acao.oQue}
            {acao.versao > 1 && <span className="ml-1.5 text-[12px] font-normal text-ink-muted">v{acao.versao}</span>}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {!concluida && (
            <button
              onClick={() => setExcluirAcao(true)}
              disabled={editando}
              aria-label="Excluir ação"
              title="Excluir ação"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-danger/10 hover:text-danger-ink disabled:opacity-40"
            >
              <Icon icon="ph:trash-bold" width={17} aria-hidden />
            </button>
          )}
          {!concluida && (
            <Button size="sm" variant="secondary" iconLeft="ph:check-bold" disabled={editando || processando} onClick={concluir}>
              <span className="hidden sm:inline">Concluir ação</span>
            </Button>
          )}
          <button
            onClick={pedirFechar}
            aria-label="Fechar detalhe da ação"
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-surface-hover"
          >
            <Icon icon="ph:x-bold" width={18} aria-hidden />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:overflow-hidden">
        {/* ── Dados da ação ── */}
        <section className="border-b border-border bg-surface lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="flex flex-col gap-5 p-5 lg:p-8">
            {editando ? (
              <AcaoForm
                layout="inline"
                inicial={acao}
                riscoId={acao.riscoId}
                riscos={riscos}
                onSujo={marcarSujo}
                onClose={() => { setEditando(false); setSujo(false) }}
                onSaved={aoSalvar}
              />
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-[16px] font-semibold text-ink">Dados da ação</h3>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-secondary">Modelo 5W2H — o quê, por quê, quem, quando, onde, como e quanto.</p>
                  </div>
                  {!concluida && (
                    <Button size="sm" variant="secondary" iconLeft="ph:pencil-simple-bold" onClick={() => setEditando(true)}>Editar</Button>
                  )}
                </div>
                <AcaoDados acao={acao} risco={risco} />
              </>
            )}
          </div>
        </section>

        {/* ── Diário: comentários e atividade ── */}
        <section className="flex flex-col bg-surface-2 lg:min-h-0">
          <div className="shrink-0 px-5 pt-5 lg:px-8 lg:pt-8">
            <div className="flex gap-1 rounded-lg bg-surface p-1" role="tablist" aria-label="Diário da ação">
              {([
                { valor: 'comentarios', label: 'Comentários', icon: 'ph:chat-circle-text-bold', n: acao.comentarios.length },
                { valor: 'atividade', label: 'Atividade', icon: 'ph:clock-counter-clockwise-bold', n: atividades.length },
              ] as const).map((t) => (
                <button
                  key={t.valor}
                  role="tab"
                  aria-selected={aba === t.valor}
                  onClick={() => setAba(t.valor)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 font-heading text-sm font-semibold transition-all ${
                    aba === t.valor ? 'bg-surface-2 text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
                  }`}
                >
                  <Icon icon={t.icon} width={15} aria-hidden />
                  {t.label}
                  {t.n > 0 && <span className="rounded-pill bg-surface px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink-secondary">{t.n}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 px-5 py-5 lg:min-h-0 lg:overflow-y-auto lg:px-8">
            {aba === 'comentarios' ? (
              <Comentarios acao={acao} onExcluir={setExcluirComentario} />
            ) : (
              <Atividades atividades={atividades} />
            )}
          </div>

          {aba === 'comentarios' && (
            <div className="sticky bottom-0 shrink-0">
              <ComentarioComposer onEnviar={comentar} />
            </div>
          )}
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

      <Modal open={excluirComentario !== null} title="Excluir comentário?" onClose={() => setExcluirComentario(null)}>
        {excluirComentario && (
          <div className="flex flex-col gap-4">
            <p className="text-[13.5px] leading-relaxed text-ink-secondary">
              O comentário de <strong className="font-semibold text-ink">{excluirComentario.autor}</strong>
              {excluirComentario.arquivos?.length ? ', junto com os arquivos anexados a ele,' : ''} sai do diário da ação.
              A exclusão fica registrada na aba Atividade. Não é possível desfazer.
            </p>
            {excluirComentario.texto && (
              <p className="rounded-lg bg-surface-2 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-ink-secondary">“{excluirComentario.texto}”</p>
            )}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setExcluirComentario(null)}>Cancelar</Button>
              <Button fullWidth variant="danger" iconLeft="ph:trash-bold" disabled={processando} onClick={confirmarExclusaoComentario}>
                {processando ? 'Excluindo…' : 'Excluir comentário'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={excluirAcao} title="Excluir ação?" onClose={() => setExcluirAcao(false)}>
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px] leading-relaxed text-ink-secondary">
            A ação <strong className="font-semibold text-ink">{acao.oQue}</strong> sai do plano de ação,
            junto com o histórico de comentários e as versões anteriores dela. Não é possível desfazer.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setExcluirAcao(false)}>Cancelar</Button>
            <Button fullWidth variant="secondary" iconLeft="ph:trash-bold" disabled={processando} onClick={confirmarExclusaoAcao}>
              {processando ? 'Excluindo…' : 'Excluir ação'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={concluirSemRegistro} title="Concluir sem registro?" onClose={() => setConcluirSemRegistro(false)}>
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px] leading-relaxed text-ink-secondary">
            A ação <strong className="font-semibold text-ink">{acao.oQue}</strong> não tem nenhum
            comentário nem evidência anexada. A evidência de execução é o que comprova a ação numa fiscalização.
            Quer concluir mesmo assim?
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" disabled={processando} onClick={() => setConcluirSemRegistro(false)}>Cancelar</Button>
            <Button fullWidth iconLeft="ph:check-bold" disabled={processando} onClick={confirmarConclusao}>
              {processando ? 'Concluindo…' : 'Concluir mesmo assim'}
            </Button>
          </div>
        </div>
      </Modal>

      <Toast message={feedback} onClose={() => setFeedback(null)} />
    </div>
  )
}

/** Os dados da ação em modo leitura — rótulo e valor, na ordem do
   formulário 5W2H (`Nr1AcaoForm`), que continua sendo a visão em campos,
   usada na edição. O risco de origem vem recolhido no topo. */
function AcaoDados({ acao, risco }: { acao: Nr1Acao; risco?: Nr1RiscoInventario }) {
  const areas = acao.onde.split(',').map((x) => x.trim()).filter(Boolean)
  return (
    <div className="flex flex-col gap-5">
      {acao.status === 'concluida' && acao.concluidaEm && (
        <p className="flex items-center gap-2 rounded-lg bg-success-bg px-3.5 py-3 text-[12.5px] text-success-ink">
          <Icon icon="ph:check-circle-bold" width={15} aria-hidden />
          Concluída em {fmtData(acao.concluidaEm)}
        </p>
      )}

      {risco && (
        <Info rotulo="Risco que esta ação responde">
          <RiscoOrigem risco={risco} />
        </Info>
      )}

      <Info rotulo="O quê (a medida de controle)"><Texto valor={acao.oQue} /></Info>
      <Info rotulo="Por quê"><Texto valor={acao.porQue} /></Info>

      <div className="grid gap-5 sm:grid-cols-2">
        <Info rotulo="Quem (responsável)">
          <span className="flex items-center gap-2">
            <Avatar initials={iniciaisResponsavel(acao.quem)} size={22} />
            <span className="min-w-0 text-[13.5px] leading-snug text-ink">{acao.quem}</span>
          </span>
        </Info>
        <Info rotulo="Quando (prazo)">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-[13.5px] text-ink">{fmtData(acao.quando)}</span>
            {/* Selo só quando diz algo além da data (vencida/vencendo). */}
            {acao.status !== 'concluida' && nr1UrgenciaPrazo(nr1DiasEntre(NR1_TODAY, acao.quando)) !== 'no-prazo' && <PrazoBadge acao={acao} />}
          </span>
        </Info>
      </div>

      <Info rotulo="Onde">
        {areas.length === 0 ? <Texto valor="" /> : (
          <span className="flex flex-wrap gap-1.5">
            {areas.map((a) => (
              <span key={a} className="rounded-pill bg-primary-50 px-2.5 py-0.5 text-[12.5px] font-medium text-primary dark:text-primary-300">{a}</span>
            ))}
          </span>
        )}
      </Info>

      <Info rotulo="Como"><Texto valor={acao.como} /></Info>

      <div className="grid gap-5 sm:grid-cols-2">
        <Info rotulo="Quanto (custo estimado)"><Texto valor={acao.quanto} /></Info>
        <Info rotulo="Status">
          <Badge tone={ACAO_STATUS[acao.status].tone}>{ACAO_STATUS[acao.status].label}</Badge>
        </Info>
      </div>

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
    </div>
  )
}

/** Aba "Comentários" — o diário de execução de sempre, com um botão de
   excluir em cada comentário (a confirmação fica no modal do detalhe). */
function Comentarios({ acao, onExcluir }: { acao: Nr1Acao; onExcluir: (c: Nr1Comentario) => void }) {
  const temEvidencia = acao.comentarios.some((c) => c.arquivos && c.arquivos.length > 0)
  return (
    <div className="flex flex-col gap-3">
      {!temEvidencia && acao.status !== 'concluida' && (
        <p className="rounded-lg bg-warning-bg px-3.5 py-2.5 text-[12px] leading-relaxed text-ink-secondary">
          Nenhum arquivo de evidência anexado ainda. Um comentário com arquivo é o que a
          fiscalização verifica para comprovar a execução da ação.
        </p>
      )}
      {acao.comentarios.length === 0 ? (
        <p className="rounded-lg bg-surface px-3.5 py-3 text-[12.5px] text-ink-secondary">
          Nenhum comentário ainda. Use o campo abaixo para registrar o andamento e anexar
          arquivos de evidência.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {acao.comentarios.map((c) => (
            <li key={c.id} className="group rounded-lg border border-border bg-surface p-3.5">
              <div className="flex items-center gap-2">
                <Avatar initials={iniciaisResponsavel(c.autor)} size={22} />
                <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-ink">{c.autor}</span>
                <span className="shrink-0 font-mono text-[11px] text-ink-muted">{fmtData(c.em)}</span>
                <button
                  type="button"
                  onClick={() => onExcluir(c)}
                  aria-label={`Excluir comentário de ${c.autor}`}
                  title="Excluir comentário"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-danger/10 hover:text-danger-ink"
                >
                  <Icon icon="ph:trash-bold" width={14} aria-hidden />
                </button>
              </div>
              {c.texto && <p className="mt-1.5 text-[13px] leading-relaxed text-ink-secondary">{c.texto}</p>}
              {c.arquivos && c.arquivos.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.arquivos.map((nome, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 rounded-pill bg-surface-2 px-2.5 py-1 text-[11.5px] text-ink">
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
  )
}

const ATIVIDADE_VISUAL: Record<Nr1AtividadeTipo, { icon: string; cls: string }> = {
  criada: { icon: 'ph:plus-bold', cls: 'bg-primary-50 text-primary dark:text-primary-300' },
  editada: { icon: 'ph:pencil-simple-bold', cls: 'bg-surface-2 text-ink-secondary' },
  status: { icon: 'ph:arrows-left-right-bold', cls: 'bg-surface-2 text-ink-secondary' },
  comentario: { icon: 'ph:chat-circle-text-bold', cls: 'bg-surface-2 text-ink-secondary' },
  evidencia: { icon: 'ph:paperclip-bold', cls: 'bg-primary-50 text-primary dark:text-primary-300' },
  'comentario-excluido': { icon: 'ph:trash-bold', cls: 'bg-danger/10 text-danger-ink' },
  concluida: { icon: 'ph:check-bold', cls: 'bg-success-bg text-success-ink' },
}

/** "25/06/2026 às 14:32" a partir de `YYYY-MM-DDTHH:mm`. */
const fmtDataHora = (em: string) => {
  const [data, hora] = em.split('T')
  return hora ? `${fmtData(data!)} às ${hora}` : fmtData(data!)
}

/** Aba "Atividade" — o log da ação, do mais recente para o mais antigo. */
function Atividades({ atividades }: { atividades: Nr1AcaoAtividade[] }) {
  if (atividades.length === 0) {
    return <p className="rounded-lg bg-surface px-3.5 py-3 text-[12.5px] text-ink-secondary">Nenhuma atividade registrada ainda.</p>
  }
  return (
    <ol className="relative flex flex-col">
      {atividades.map((a, i) => {
        const v = ATIVIDADE_VISUAL[a.tipo]
        return (
          <li key={a.id} className="relative flex gap-3 pb-4 last:pb-0">
            {i < atividades.length - 1 && <span className="absolute left-[15px] top-8 bottom-0 w-px bg-border" aria-hidden />}
            <span className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${v.cls}`}>
              <Icon icon={v.icon} width={14} aria-hidden />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[13px] leading-snug text-ink">
                <span className="font-semibold">{a.autor}</span> · {a.descricao.charAt(0).toLowerCase() + a.descricao.slice(1)}
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-ink-muted">{fmtDataHora(a.em)}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/** Rótulo e valor — mesma tipografia dos dados do risco no detalhe do
   risco (`Bloco` em `Nr1AnaliseRisco.tsx`). */
function Info({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-ink">{rotulo}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}

function Texto({ valor }: { valor: string }) {
  return valor
    ? <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-ink">{valor}</p>
    : <p className="text-[13.5px] text-ink-muted">—</p>
}

/** O risco de origem, em sanfona: recolhido mostra domínio, fator e nível
   (P × S); aberto, as fontes geradoras, as áreas afetadas (com a nota do
   domínio no ciclo em que o risco foi registrado) e os possíveis danos. */
function RiscoOrigem({ risco }: { risco: Nr1RiscoInventario }) {
  const [aberto, setAberto] = useState(false)
  const fontes = useService(() => nr1FonteGeradoraService.list(), [])
  const mapa = useService(() => nr1ResultadoService.mapaCalor(risco.campanhaId), [risco.campanhaId])
  const meta = NR1_DIMENSOES.find((d) => d.id === risco.dimensaoId)
  const st = NIVEL_RISCO[risco.nivel]
  const nomes = risco.grupoExposto.split(',').map((x) => x.trim())
  const fontesIds = risco.fontesGeradorasIds ?? []

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex w-full items-start gap-3 p-3.5 text-left transition-colors hover:bg-surface-hover"
      >
        <span className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 ${st.cls}`}>
          <span className="font-mono text-[16px] font-bold leading-none">{risco.nivelNum}</span>
          <span className="text-[10px] font-semibold leading-none">{st.label}</span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[11.5px] text-ink-secondary">
            <Icon icon={meta?.icon ?? 'ph:list-bold'} width={12} aria-hidden />
            {risco.dimensao}
          </p>
          <p className="mt-0.5 text-[13.5px] font-semibold leading-snug text-ink">{risco.fator}</p>
          <p className="mt-0.5 text-[11.5px] text-ink-secondary">
            Probabilidade {risco.probabilidade} × severidade {risco.severidade} · {st.acao}
          </p>
        </div>
        <span className="mt-0.5 flex shrink-0 items-center gap-1 text-[11.5px] font-medium text-ink-muted">
          {aberto ? 'Ocultar' : 'Detalhes'}
          <Icon icon="ph:caret-down-bold" width={14} className={`transition-transform ${aberto ? 'rotate-180' : ''}`} aria-hidden />
        </span>
      </button>

      {aberto && (
        <div className="flex flex-col gap-3.5 border-t border-border p-3.5">
          {fontesIds.length > 0 && (
            <div>
              <p className="mb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted">Fontes geradoras</p>
              <div className="flex flex-wrap gap-1.5">
                {fontesIds.map((id) => (
                  <span key={id} className="rounded-pill bg-surface-2 px-2.5 py-1 text-[12px] text-ink-secondary">
                    {fontes.status === 'success' ? (fontes.data.find((f) => f.id === id)?.nome ?? id) : '…'}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted">Áreas afetadas · nota do domínio</p>
            <div className="flex flex-wrap gap-1.5">
              {risco.departamentoIds.map((id, i) => {
                const linha = mapa.status === 'success' ? mapa.data.find((l) => l.departamentoId === id) : undefined
                const celula = linha && !linha.protegido ? linha.celulas.find((c) => c.dimensaoId === risco.dimensaoId) : undefined
                return (
                  <span key={id} className="inline-flex items-center gap-1.5 rounded-pill bg-primary-50 py-1 pl-2.5 pr-1 text-[12px] font-medium text-primary dark:text-primary-300">
                    {linha?.departamento ?? nomes[i] ?? id}
                    {celula?.media != null && celula.nivel && (
                      <span className={`rounded-pill px-1.5 font-mono text-[10.5px] font-semibold ${NIVEL_RISCO[celula.nivel].cls}`}>{celula.media.toFixed(1)}</span>
                    )}
                  </span>
                )
              })}
            </div>
          </div>

          {risco.danos && (
            <p className="text-[12px] leading-relaxed text-ink-secondary">
              <span className="font-medium text-ink">Possíveis danos:</span> {risco.danos}
            </p>
          )}

          <Link
            to={`/rh/nr1/inventario?detalhe=${risco.id}`}
            className="inline-flex w-fit items-center gap-1 text-[11.5px] font-medium text-primary hover:underline dark:text-primary-300"
          >
            Ver no inventário
            <Icon icon="ph:arrow-right-bold" width={10} aria-hidden />
          </Link>
        </div>
      )}
    </div>
  )
}

/** Campo de comentário fixo no rodapé do detalhe da ação — texto livre e
   anexos de arquivo juntos na mesma mensagem, sempre visível (não é preciso
   abrir nada para comentar ou anexar evidência, ao contrário do antigo
   fluxo de um botão só). Fica colado ao fundo da coluna do diário, então
   nunca sai da vista ao rolar os comentários. */
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
