import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Select } from '../../components/Select'
import { EntrarSessaoButton } from '../../components/EntrarSessaoButton'
import type { Curso, Artigo, ProLive } from '../../types'

/* Componentes de apoio da Universidade YNA (cards de curso/artigo, carrossel,
   lista explorável com busca/filtro/paginação, cards da sidebar). */

export const nivelLabel: Record<string, string> = { iniciante: 'Iniciante', intermediario: 'Intermediário', avancado: 'Avançado' }

export const coverClass: Record<Curso['cover'], string> = {
  lavender: 'from-[#6C6FC2] to-[#A9ABE6]',
  pink: 'from-[#D75A6E] to-[#F0A8B4]',
  yellow: 'from-[#E8A640] to-[#F5CD8A]',
  teal: 'from-[#2E7D63] to-[#6FC4A8]',
  blue: 'from-[#4749A8] to-[#6C6FC2]',
}

export function formatDuracao(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

/* ── Dashboard ── */
export function StatCard({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-50">
        <Icon icon={icon} width={22} className="text-primary dark:text-primary-300" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="font-heading text-[22px] font-bold leading-none tracking-[-0.02em] text-ink">{value}</p>
        <p className="mt-1 text-[12.5px] leading-tight text-ink-secondary">{label}</p>
      </div>
    </div>
  )
}

/* ── Painel delimitado (título + ação + corpo) ── */
export function Painel({ title, action, children, className = '' }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-lg border border-border bg-surface p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

/* Link "Ver todos" reutilizável. */
export function VerTodos({ label = 'Ver todos', onClick }: { label?: string; onClick: () => void }) {
  return <button onClick={onClick} className="font-heading text-xs font-semibold text-primary dark:text-primary-300 hover:underline">{label}</button>
}

function ArrowBtn({ icon, onClick, label, disabled }: { icon: string; onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink disabled:opacity-40 disabled:hover:bg-surface"
    >
      <Icon icon={icon} width={15} aria-hidden />
    </button>
  )
}

/* Painel com carrossel paginado em UMA linha: calcula quantos cards cabem e
   pagina com as setas do cabeçalho. */
export function CursoCarrossel<T>({ title, verTodos, items, renderItem, keyOf }: {
  title: string
  verTodos?: () => void
  items: T[]
  renderItem: (item: T) => React.ReactNode
  keyOf: (item: T) => string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [perPage, setPerPage] = useState(3)
  const [page, setPage] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const compute = () => setPerPage(Math.max(1, Math.floor((el.clientWidth + 16) / 216)))
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const totalPages = Math.max(1, Math.ceil(items.length / perPage))
  const pageSafe = Math.min(page, totalPages - 1)
  const slice = items.slice(pageSafe * perPage, pageSafe * perPage + perPage)

  return (
    <section className="min-w-0 rounded-lg border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        <div className="flex items-center gap-2">
          {verTodos && <VerTodos onClick={verTodos} />}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <ArrowBtn icon="ph:caret-left-bold" label="Anterior" disabled={pageSafe === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} />
              <ArrowBtn icon="ph:caret-right-bold" label="Próximo" disabled={pageSafe >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} />
            </div>
          )}
        </div>
      </div>
      <div ref={ref} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${perPage}, minmax(0, 1fr))` }}>
        {slice.map((item) => <div key={keyOf(item)}>{renderItem(item)}</div>)}
      </div>
    </section>
  )
}

function CursoCover({ curso, className = '' }: { curso: Curso; className?: string }) {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br ${coverClass[curso.cover]} ${className}`}>
      <Icon icon="ph:play-circle-fill" width={40} className="text-white/85" aria-hidden />
      <span className="absolute bottom-2 right-2 rounded-pill bg-black/35 px-2 py-0.5 font-mono text-[10.5px] font-medium text-white">
        {formatDuracao(curso.duracaoMin)}
      </span>
      {curso.concluido && (
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-pill bg-black/35 px-2 py-0.5 text-[10.5px] font-semibold text-white">
          <Icon icon="ph:check-bold" width={10} aria-hidden /> Concluído
        </span>
      )}
    </div>
  )
}

/* ── Card de curso ("Últimos lançamentos") ── */
export function CursoCard({ curso, onClick }: { curso: Curso; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full flex-col text-left">
      <CursoCover curso={curso} className="h-32 w-full" />
      <p className="mt-2.5 line-clamp-2 font-heading text-sm font-semibold text-ink">{curso.titulo}</p>
      <p className="mt-0.5 text-[12.5px] text-ink-secondary">{curso.autor}</p>
    </button>
  )
}

/* ── Card "Continue assistindo" (com progresso) ── */
export function CursoProgressCard({ curso, onClick }: { curso: Curso; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full flex-col text-left">
      <CursoCover curso={curso} className="h-32 w-full" />
      <p className="mt-2.5 line-clamp-1 font-heading text-sm font-semibold text-ink">{curso.titulo}</p>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-pill bg-surface-2">
          <div className="h-full rounded-pill bg-gradient-to-r from-primary to-pink" style={{ width: `${curso.progresso}%` }} />
        </div>
        <span className="shrink-0 font-mono text-[11px] text-ink-secondary">{curso.aulasConcluidas}/{curso.totalAulas}</span>
      </div>
    </button>
  )
}

/* ── Lista explorável: busca + filtros + paginação ── */
const PAGE_SIZE = 6

export function CursosExplorar({ cursos, onOpen }: { cursos: Curso[]; onOpen: (id: string) => void }) {
  const [busca, setBusca] = useState('')
  const [tema, setTema] = useState('Todos')
  const [trilha, setTrilha] = useState('Todas')
  const [page, setPage] = useState(1)

  const temas = useMemo(() => ['Todos', ...Array.from(new Set(cursos.map((c) => c.tema)))], [cursos])
  const trilhaOptions = useMemo(
    () => [{ value: 'Todas', label: 'Todas as trilhas' }, ...Array.from(new Set(cursos.map((c) => c.trilha))).map((t) => ({ value: t, label: t }))],
    [cursos],
  )

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return cursos.filter((c) =>
      (tema === 'Todos' || c.tema === tema) &&
      (trilha === 'Todas' || c.trilha === trilha) &&
      (!termo || c.titulo.toLowerCase().includes(termo) || c.autor.toLowerCase().includes(termo)),
    )
  }, [cursos, busca, tema, trilha])

  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE))
  const pageSafe = Math.min(page, totalPages)
  const pageItems = filtrados.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE)
  const reset = () => setPage(1)

  return (
    <>
      {/* Busca */}
      <div className="relative mb-3">
        <Icon icon="ph:magnifying-glass-bold" width={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden />
        <input
          type="search"
          value={busca}
          onChange={(e) => { setBusca(e.target.value); reset() }}
          placeholder="Buscar curso ou autor…"
          aria-label="Buscar curso"
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-11 pr-4 text-[15px] text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
        />
      </div>

      {/* Filtros: temas (pills) + trilha (select) */}
      <div className="mb-4 flex flex-col gap-2.5">
        <div className="flex flex-wrap gap-2">
          {temas.map((t) => (
            <button
              key={t}
              onClick={() => { setTema(t); reset() }}
              aria-pressed={tema === t}
              className={`rounded-pill border-[1.5px] px-3 py-1.5 font-heading text-[12.5px] font-medium transition-colors ${
                tema === t ? 'border-primary bg-primary-50 text-primary dark:text-primary-300' : 'border-border bg-surface text-ink-secondary hover:border-border-strong hover:text-ink'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <Select value={trilha} options={trilhaOptions} onChange={(v) => { setTrilha(v); reset() }} ariaLabel="Filtrar por trilha" className="sm:max-w-xs" />
      </div>

      {/* Lista */}
      {pageItems.length > 0 ? (
        <ul className="flex flex-col divide-y divide-border">
          {pageItems.map((c) => <CursoListRow key={c.id} curso={c} onClick={() => onOpen(c.id)} />)}
        </ul>
      ) : (
        <div className="px-4 py-10 text-center text-sm text-ink-secondary">
          Nenhum curso encontrado com esses filtros.
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={pageSafe === 1}
            className="flex items-center gap-1 rounded-pill border border-border bg-surface px-3 py-1.5 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface-hover disabled:opacity-40"
          >
            <Icon icon="ph:caret-left-bold" width={14} aria-hidden /> Anterior
          </button>
          <span className="font-mono text-xs text-ink-muted">Página {pageSafe} de {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={pageSafe === totalPages}
            className="flex items-center gap-1 rounded-pill border border-border bg-surface px-3 py-1.5 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface-hover disabled:opacity-40"
          >
            Próxima <Icon icon="ph:caret-right-bold" width={14} aria-hidden />
          </button>
        </div>
      )}
    </>
  )
}

export function CursoListRow({ curso, onClick }: { curso: Curso; onClick: () => void }) {
  return (
    <li>
      <button onClick={onClick} className="flex w-full items-center gap-4 rounded-lg px-2 py-3 text-left transition-colors hover:bg-surface-hover">
        <CursoCover curso={curso} className="h-14 w-20 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-sm font-semibold text-ink">{curso.titulo}</p>
          <p className="mt-0.5 text-[12.5px] text-ink-secondary">{curso.autor}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge tone="neutral">{curso.tema}</Badge>
            <Badge tone="primary">{nivelLabel[curso.nivel]}</Badge>
            {curso.progresso > 0 && !curso.concluido && <span className="font-mono text-[11px] text-ink-muted">{curso.progresso}%</span>}
            {curso.concluido && <Badge tone="success" icon="ph:check-bold">Concluído</Badge>}
          </div>
        </div>
        <Icon icon="ph:caret-right-bold" width={16} className="shrink-0 text-ink-muted" aria-hidden />
      </button>
    </li>
  )
}

/* ── Sidebar / Lives ── */
export function LiveSidebarCard({ live }: { live: ProLive }) {
  return (
    <div className="rounded-lg border border-primary/30 bg-primary-50 p-4">
      <div className="flex items-center gap-2">
        <Icon icon="ph:broadcast-bold" width={18} className="text-primary dark:text-primary-300" aria-hidden />
        <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-primary dark:text-primary-300">
          {live.status === 'agendada' ? 'Próxima live' : 'Replay'}
        </span>
      </div>
      <p className="mt-2 font-heading text-sm font-semibold text-ink">{live.titulo}</p>
      <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-ink-secondary">
        <Icon icon="ph:calendar-bold" width={13} aria-hidden /> {live.data} · {live.horario}
      </p>
    </div>
  )
}

/* Ações de uma live: Detalhe + (Entrar ao vivo com timer | Assistir replay | Inscrever). */
export function LiveCardActions({ live, inscrito, onToggleInscrito, onDetalhe, onEntrar }: {
  live: ProLive
  inscrito: boolean
  onToggleInscrito: () => void
  onDetalhe: () => void
  onEntrar: () => void
}) {
  const aoVivo = live.aoVivoSeg != null
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      <Button size="sm" variant="secondary" iconLeft="ph:info-bold" onClick={onDetalhe}>Detalhe</Button>
      {aoVivo ? (
        <EntrarSessaoButton size="sm" live openedSeconds={live.aoVivoSeg} label="Entrar na live" onClick={onEntrar} />
      ) : live.status === 'replay' ? (
        <Button size="sm" variant="secondary" iconLeft="ph:play-bold" onClick={onEntrar}>Assistir</Button>
      ) : (
        <Button size="sm" variant={inscrito ? 'soft' : 'primary'} iconLeft={inscrito ? 'ph:check-bold' : 'ph:bell-bold'} onClick={onToggleInscrito}>
          {inscrito ? 'Inscrito' : 'Inscrever'}
        </Button>
      )}
    </div>
  )
}

/* Selo da categoria da live (conteúdo × supervisão). */
export function CategoriaLiveBadge({ categoria }: { categoria: ProLive['categoria'] }) {
  return categoria === 'supervisao'
    ? <Badge tone="warning" icon="ph:users-three-bold">Supervisão</Badge>
    : <Badge tone="primary" icon="ph:graduation-cap-bold">Conteúdo</Badge>
}

function AoVivoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-danger-bg px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-danger-ink">
      <span className="h-1.5 w-1.5 rounded-full bg-danger" aria-hidden /> Ao vivo
    </span>
  )
}

/* Conteúdo (sem borda própria) da próxima live para a sidebar — vai dentro de um Painel. */
export function LiveSidebarBody({ live }: { live: ProLive }) {
  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
        <CategoriaLiveBadge categoria={live.categoria} />
        {live.aoVivoSeg != null && <AoVivoBadge />}
      </div>
      <p className="font-heading text-sm font-semibold text-ink">{live.titulo}</p>
      {live.palestrante && <p className="mt-0.5 text-[12.5px] text-ink-secondary">{live.palestrante}</p>}
      <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-ink-secondary">
        <Icon icon="ph:calendar-bold" width={13} aria-hidden /> {live.data} · {live.horario}
      </p>
    </div>
  )
}

/* Linha de live no formato da agenda: dia/horário em destaque à esquerda,
   categoria, título e texto de apoio, com ações à direita. */
export function LiveAgendaRow({ live, actions }: { live: ProLive; actions: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="flex w-[68px] shrink-0 flex-col items-center justify-center rounded-lg bg-surface-2 px-2 py-2 text-center">
          <span className="font-mono text-[11px] text-ink-secondary">{live.data}</span>
          <span className="font-heading text-base font-bold leading-tight text-ink">{live.horario}</span>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <CategoriaLiveBadge categoria={live.categoria} />
            {live.aoVivoSeg != null && <AoVivoBadge />}
          </div>
          <p className="mt-1 font-heading text-sm font-semibold text-ink">{live.titulo}</p>
          {live.palestrante && <p className="text-[12.5px] text-ink-secondary">{live.palestrante}</p>}
          {live.descricao && <p className="mt-0.5 line-clamp-2 text-[12.5px] text-ink-secondary">{live.descricao}</p>}
        </div>
      </div>
      <div className="shrink-0 sm:self-center">{actions}</div>
    </div>
  )
}

export const fmtDataBR = (iso: string) => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}` }

/* Item compacto de artigo (sidebar). */
export function ArtigoItem({ artigo, onClick }: { artigo: Artigo; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full border-t border-border py-3 text-left first:border-t-0 first:pt-0">
      <p className="font-heading text-[13.5px] font-semibold leading-snug text-ink">{artigo.titulo}</p>
      <p className="mt-0.5 line-clamp-2 text-[12.5px] text-ink-secondary">{artigo.subheadline}</p>
      <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-ink-muted">
        {artigo.autor}
        <span aria-hidden>·</span>
        <span className="flex items-center gap-1"><Icon icon="ph:clock-bold" width={11} aria-hidden /> {artigo.tempoLeituraMin} min</span>
      </p>
    </button>
  )
}

/* Card editorial de artigo: capa opcional, categoria, tempo de leitura, título,
   chamada, autor e data. */
export function ArtigoCard({ artigo, onClick }: { artigo: Artigo; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface text-left transition-colors hover:border-border-strong hover:bg-surface-hover">
      {artigo.imagem && (
        <div className={`flex aspect-video items-center justify-center bg-gradient-to-br ${coverClass[artigo.imagem]}`}>
          <Icon icon="ph:article-medium-bold" width={38} className="text-white/85" aria-hidden />
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{artigo.tema}</Badge>
          <span className="flex items-center gap-1 text-[11.5px] text-ink-muted"><Icon icon="ph:clock-bold" width={12} aria-hidden /> {artigo.tempoLeituraMin} min de leitura</span>
        </div>
        <p className="mt-2 font-heading text-[15px] font-semibold leading-snug text-ink">{artigo.titulo}</p>
        <p className="mt-1 line-clamp-2 text-[13px] text-ink-secondary">{artigo.subheadline}</p>
        <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-ink-muted">
          <Icon icon="ph:user-bold" width={12} aria-hidden /> {artigo.autor}
          <span aria-hidden>·</span>
          {fmtDataBR(artigo.data)}
        </p>
      </div>
    </button>
  )
}
