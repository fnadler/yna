import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@iconify/react'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { useService } from '../../hooks/useService'
import { proUniversidadeService } from '../../services/pro'
import { coverClass, nivelLabel, formatDuracao } from './universidadeParts'
import type { Curso, CursoAula } from '../../types'

/* Player de curso em "modal full-screen": coluna principal com vídeo + dados da
   aula e coluna direita fixa (rolagem interna) com o currículo. */
export function CursoPlayerModal({ cursoId, onClose }: { cursoId: string | null; onClose: () => void }) {
  useEffect(() => {
    if (cursoId === null) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [cursoId, onClose])

  if (cursoId === null) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col bg-page">
      <PlayerContent cursoId={cursoId} onClose={onClose} />
    </div>,
    document.body,
  )
}

function PlayerContent({ cursoId, onClose }: { cursoId: string; onClose: () => void }) {
  const q = useService(() => proUniversidadeService.curso(cursoId), [cursoId])

  return (
    <>
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 lg:px-6">
        <div className="flex min-w-0 items-center gap-2 text-[13px] text-ink-secondary">
          <span className="hidden font-medium text-ink-muted sm:inline">Universidade YNA</span>
          <Icon icon="ph:caret-right-bold" width={11} className="hidden shrink-0 text-ink-muted sm:inline" aria-hidden />
          <span className="truncate font-heading font-semibold text-ink">
            {q.status === 'success' && q.data ? q.data.titulo : 'Curso'}
          </span>
        </div>
        <button onClick={onClose} aria-label="Fechar" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink">
          <Icon icon="ph:x-bold" width={18} aria-hidden />
        </button>
      </header>

      {(q.status === 'loading' || q.status === 'idle') && (
        <div className="flex-1 p-6"><Skeleton className="h-full w-full rounded-lg" /></div>
      )}
      {q.status === 'error' && <div className="p-6"><ErrorState message={q.message} onRetry={q.reload} /></div>}
      {q.status === 'success' && !q.data && (
        <div className="p-10 text-center text-sm text-ink-secondary">Curso não encontrado.</div>
      )}
      {q.status === 'success' && q.data && <PlayerBody curso={q.data} />}
    </>
  )
}

function PlayerBody({ curso }: { curso: Curso }) {
  const aulas: CursoAula[] = useMemo(
    () => curso.aulas ?? Array.from({ length: curso.totalAulas }, (_, i) => ({
      id: `${curso.id}-a${i + 1}`,
      titulo: `Aula ${i + 1}`,
      duracaoMin: Math.max(5, Math.round(curso.duracaoMin / curso.totalAulas)),
      concluida: i < curso.aulasConcluidas,
    })),
    [curso],
  )
  const [done, setDone] = useState<Set<string>>(() => new Set(aulas.filter((a) => a.concluida).map((a) => a.id)))
  const [currentId, setCurrentId] = useState<string>(() => aulas.find((a) => !a.concluida)?.id ?? aulas[0]?.id ?? '')
  const [tab, setTab] = useState<'sobre' | 'anotacoes'>('sobre')

  const current = aulas.find((a) => a.id === currentId) ?? aulas[0]
  const currentIdx = aulas.findIndex((a) => a.id === currentId)
  const progresso = Math.round((done.size / aulas.length) * 100)

  const toggleDone = (id: string) => setDone((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const proxima = () => { if (currentIdx < aulas.length - 1) setCurrentId(aulas[currentIdx + 1].id) }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
      {/* Coluna principal (pb extra no mobile para a playlist minimizada) */}
      <div className="min-w-0 flex-1 overflow-y-auto pb-32 lg:pb-0">
        {/* Vídeo */}
        <div className={`relative flex aspect-video w-full items-center justify-center bg-gradient-to-br ${coverClass[curso.cover]}`}>
          <Icon icon="ph:play-circle-fill" width={72} className="text-white/90" aria-hidden />
          {/* PiP instrutor */}
          <div className="absolute bottom-14 right-4 flex h-20 w-28 items-center justify-center overflow-hidden rounded-lg border border-white/25 bg-black/40 text-white/80 shadow-lg">
            <Icon icon="ph:user-bold" width={22} aria-hidden />
          </div>
          {/* Barra de controles (placeholder) */}
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/55 to-transparent px-4 py-2.5 text-white">
            <Icon icon="ph:play-fill" width={18} aria-hidden />
            <div className="h-1 flex-1 overflow-hidden rounded-pill bg-white/30"><div className="h-full w-1/4 rounded-pill bg-white" /></div>
            <span className="font-mono text-[11px] tabular-nums">00:54</span>
            <Icon icon="ph:speaker-high-bold" width={16} aria-hidden />
            <Icon icon="ph:gear-bold" width={16} aria-hidden />
            <Icon icon="ph:corners-out-bold" width={16} aria-hidden />
          </div>
        </div>

        <div className="px-4 py-5 lg:px-6">
          {/* Ações */}
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" iconRight="ph:skip-forward-bold" onClick={proxima} disabled={currentIdx >= aulas.length - 1}>Próxima aula</Button>
            <Button size="sm" variant="secondary" iconLeft="ph:download-simple-bold">Baixar material</Button>
            <Button size="sm" variant="secondary" iconLeft="ph:star-bold">Avaliar</Button>
            <Button
              size="sm"
              variant={done.has(currentId) ? 'soft' : 'secondary'}
              iconLeft={done.has(currentId) ? 'ph:check-circle-bold' : 'ph:circle-bold'}
              onClick={() => toggleDone(currentId)}
            >
              {done.has(currentId) ? 'Aula concluída' : 'Concluir aula'}
            </Button>
          </div>

          {/* Abas */}
          <div className="mt-5 flex gap-5 border-b border-border">
            {([['sobre', 'Sobre a aula'], ['anotacoes', 'Anotações']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`-mb-px border-b-2 pb-2.5 font-heading text-sm font-semibold transition-colors ${
                  tab === key ? 'border-primary text-ink' : 'border-transparent text-ink-secondary hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'sobre' ? (
            <div className="mt-4">
              <h1 className="font-heading text-xl font-semibold text-ink">{current?.titulo}</h1>
              <p className="mt-1 text-[13px] text-ink-secondary">Por {curso.autor} · {formatDuracao(current?.duracaoMin ?? 0)}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-ink">{curso.descricao}</p>

              {/* Comentários (placeholder) */}
              <div className="mt-8">
                <h2 className="text-[15px] font-semibold text-ink">Tire suas dúvidas com os professores</h2>
                <textarea
                  placeholder="Escreva sua dúvida sobre esta aula…"
                  aria-label="Comentário"
                  className="mt-3 min-h-[90px] w-full resize-y rounded-lg border-[1.5px] border-border bg-surface px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-primary"
                />
                <div className="mt-2 flex justify-end"><Button size="sm">Comentar</Button></div>
              </div>
            </div>
          ) : (
            <textarea
              placeholder="Suas anotações desta aula…"
              aria-label="Anotações"
              className="mt-4 min-h-[180px] w-full resize-y rounded-lg border-[1.5px] border-border bg-surface px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-primary"
            />
          )}
        </div>
      </div>

      {/* Currículo — coluna direita (desktop) */}
      <aside className="hidden w-[340px] shrink-0 flex-col border-l border-border bg-surface lg:flex">
        <div className="shrink-0 border-b border-border px-4 py-4">
          <CurriculoHeader curso={curso} progresso={progresso} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          <CurriculoLista aulas={aulas} currentId={currentId} isDone={(id) => done.has(id)} onSelect={setCurrentId} onToggleDone={toggleDone} />
        </div>
      </aside>

      {/* Playlist — mobile (minimizada na base, expande para cima) */}
      <MobilePlaylist
        curso={curso}
        progresso={progresso}
        aulas={aulas}
        current={current}
        currentIdx={currentIdx}
        currentId={currentId}
        isDone={(id) => done.has(id)}
        onSelect={setCurrentId}
        onToggleDone={toggleDone}
      />
    </div>
  )
}

/* Cabeçalho do currículo (tema/nível + título + progresso). */
function CurriculoHeader({ curso, progresso }: { curso: Curso; progresso: number }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="neutral">{curso.tema}</Badge>
        <Badge tone="primary">{nivelLabel[curso.nivel]}</Badge>
      </div>
      <h2 className="mt-2 font-heading text-sm font-semibold text-ink">{curso.titulo}</h2>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-pill bg-surface-2">
          <div className={`h-full rounded-pill ${progresso === 100 ? 'bg-success' : 'bg-gradient-to-r from-primary to-pink'}`} style={{ width: `${progresso}%` }} />
        </div>
        <span className="font-mono text-[11px] text-ink-secondary">{progresso}%</span>
      </div>
    </div>
  )
}

/* Lista de aulas do curso (reusada no desktop e na playlist mobile). */
function CurriculoLista({ aulas, currentId, isDone, onSelect, onToggleDone }: {
  aulas: CursoAula[]
  currentId: string
  isDone: (id: string) => boolean
  onSelect: (id: string) => void
  onToggleDone: (id: string) => void
}) {
  return (
    <>
      <p className="px-2 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted">Conteúdo do curso</p>
      <ul className="flex flex-col">
        {aulas.map((a, i) => {
          const isCurrent = a.id === currentId
          const concluida = isDone(a.id)
          return (
            <li key={a.id}>
              <button
                onClick={() => onSelect(a.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors ${isCurrent ? 'bg-primary-50' : 'hover:bg-surface-hover'}`}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleDone(a.id) }}
                  aria-label={concluida ? 'Marcar como não concluída' : 'Marcar como concluída'}
                  className="shrink-0"
                >
                  <Icon icon={concluida ? 'ph:check-circle-fill' : 'ph:circle-bold'} width={18} className={concluida ? 'text-success' : 'text-ink-muted'} aria-hidden />
                </button>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-[13px] ${isCurrent ? 'font-semibold text-primary dark:text-primary-300' : 'text-ink'}`}>
                    <span className="font-mono text-ink-muted">{String(i + 1).padStart(2, '0')}</span> · {a.titulo}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[11px] text-ink-muted">{formatDuracao(a.duracaoMin)}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <p className="mt-3 px-2 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted">Conteúdos eletivos</p>
      <div className="mx-2 mb-3 rounded-lg border border-dashed border-border px-3 py-3 text-[12.5px] text-ink-muted">
        Materiais complementares em breve.
      </div>
    </>
  )
}

/* Playlist mobile: barra minimizada na base (progresso + aula atual) que
   expande para cima mostrando todas as aulas. */
function MobilePlaylist({ curso, progresso, aulas, current, currentIdx, currentId, isDone, onSelect, onToggleDone }: {
  curso: Curso
  progresso: number
  aulas: CursoAula[]
  current?: CursoAula
  currentIdx: number
  currentId: string
  isDone: (id: string) => boolean
  onSelect: (id: string) => void
  onToggleDone: (id: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      {/* Minimizada */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir lista de aulas"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface px-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-3 text-left shadow-[0_-6px_22px_rgba(20,18,42,0.12)]"
      >
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-pill bg-surface-2">
            <div className={`h-full rounded-pill ${progresso === 100 ? 'bg-success' : 'bg-gradient-to-r from-primary to-pink'}`} style={{ width: `${progresso}%` }} />
          </div>
          <span className="font-mono text-[11px] text-ink-secondary">{progresso}%</span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <Icon icon="ph:play-circle-fill" width={26} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-ink-muted">Assistindo · aula {currentIdx + 1} de {aulas.length}</p>
            <p className="truncate text-sm font-semibold text-ink">{current?.titulo}</p>
          </div>
          <Icon icon="ph:caret-up-bold" width={16} className="shrink-0 text-ink-secondary" aria-hidden />
        </div>
      </button>

      {/* Expandida */}
      {open && (
        <div className="fixed inset-0 z-40" role="dialog" aria-modal aria-label="Aulas do curso">
          <div className="absolute inset-0 bg-black/40" aria-hidden onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[82vh] flex-col rounded-t-2xl border-t border-border bg-surface">
            <div className="shrink-0 px-4 pt-3">
              <div className="mx-auto mb-3 h-1 w-10 rounded-pill bg-border" aria-hidden />
              <div className="flex items-start justify-between gap-3">
                <CurriculoHeader curso={curso} progresso={progresso} />
                <button onClick={() => setOpen(false)} aria-label="Fechar" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-surface-hover">
                  <Icon icon="ph:x-bold" width={16} aria-hidden />
                </button>
              </div>
            </div>
            <div className="mt-2 min-h-0 flex-1 overflow-y-auto px-2 py-2">
              <CurriculoLista
                aulas={aulas}
                currentId={currentId}
                isDone={isDone}
                onSelect={(id) => { onSelect(id); setOpen(false) }}
                onToggleDone={onToggleDone}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
