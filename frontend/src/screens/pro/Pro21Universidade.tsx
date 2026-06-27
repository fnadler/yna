import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { ProTopBar } from '../../components/ProTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { proUniversidadeService } from '../../services/pro'
import {
  StatCard, Painel, CursoCarrossel, VerTodos, CursoCard, CursoProgressCard, CursosExplorar,
  LiveSidebarBody, LiveAgendaRow, ArtigoItem, ArtigoCard, LiveCardActions, formatDuracao,
} from './universidadeParts'
import { CursoPlayerModal } from './Pro29CursoDetalhe'
import { ArtigoModal } from './Pro30Artigo'
import { LiveModal } from './LiveModal'
import type { Curso, ProLive } from '../../types'

const TABS = [
  { key: 'todos', label: 'Todos' },
  { key: 'cursos', label: 'Cursos' },
  { key: 'lives', label: 'Lives' },
  { key: 'artigos', label: 'Artigos' },
] as const
type TabKey = (typeof TABS)[number]['key']

export function Pro21Universidade() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabKey>('todos')
  const [cursoId, setCursoId] = useState<string | null>(null)
  const [artigoId, setArtigoId] = useState<string | null>(null)
  const [liveDetalhe, setLiveDetalhe] = useState<ProLive | null>(null)
  const [inscritos, setInscritos] = useState<Record<string, boolean>>({})

  const cursos = useService(() => proUniversidadeService.cursos(), [])
  const artigos = useService(() => proUniversidadeService.artigos(), [])
  const lives = useService(() => proUniversidadeService.lives(), [])
  const stats = useService(() => proUniversidadeService.stats(), [])

  const openCurso = (id: string) => setCursoId(id)
  const openArtigo = (id: string) => setArtigoId(id)
  const isInscrito = (l: ProLive) => inscritos[l.id] ?? l.inscrito
  const toggleInscrito = (l: ProLive) => setInscritos((s) => ({ ...s, [l.id]: !isInscrito(l) }))
  const entrarLive = (l: ProLive) => navigate(`/pro/live/${l.id}`)
  const liveProps = (l: ProLive) => ({
    live: l,
    inscrito: isInscrito(l),
    onToggleInscrito: () => toggleInscrito(l),
    onDetalhe: () => setLiveDetalhe(l),
    onEntrar: () => entrarLive(l),
  })

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <ProTopBar />
        <PageHeader title="Universidade YNA" subtitle="Aprofunde sua prática no seu tempo." className="mt-2 lg:mt-0" />

        {/* Abas */}
        <div className="mb-5 flex gap-1 rounded-lg bg-surface-2 p-1" role="tablist" aria-label="Seções da Universidade">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-lg px-3 py-2.5 font-heading text-sm font-semibold transition-all ${
                tab === t.key ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Dashboard — apenas na aba "Todos" */}
        {tab === 'todos' && (
          <div className="mb-6 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {stats.status === 'success' ? (
              <>
                <StatCard icon="ph:graduation-cap-bold" value={String(stats.data.cursosFinalizados)} label="Cursos finalizados" />
                <StatCard icon="ph:clock-bold" value={formatDuracao(stats.data.tempoEstudoMin)} label="Tempo de estudo" />
                <StatCard icon="ph:certificate-bold" value={String(stats.data.certificados)} label="Certificados" />
                <StatCard icon="ph:broadcast-bold" value={String(stats.data.livesParticipadas)} label="Participações em lives" />
              </>
            ) : (
              [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[76px] w-full rounded-lg" />)
            )}
          </div>
        )}

        {/* Conteúdo conforme a aba */}
        {tab === 'todos' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
              <CursosSections cursos={cursos} onOpen={openCurso} onVerTodos={() => setTab('cursos')} />
            </div>
            <aside className="flex min-w-0 flex-col gap-6">
              {/* Próxima live YNA (conteúdo ou supervisão, a que vier primeiro) */}
              <Painel title="Próxima live YNA" action={<VerTodos label="Ver todas" onClick={() => setTab('lives')} />}>
                {lives.status === 'success'
                  ? (() => {
                      const l = lives.data.find((x) => x.aoVivoSeg != null) ?? lives.data.find((x) => x.status === 'agendada') ?? lives.data[0]
                      return l ? (
                        <div className="flex flex-col gap-3">
                          <LiveSidebarBody live={l} />
                          <LiveCardActions {...liveProps(l)} />
                        </div>
                      ) : <Vazio>Nenhuma live agendada.</Vazio>
                    })()
                  : <Skeleton className="h-20 w-full rounded-lg" />}
              </Painel>

              {/* Artigos */}
              <Painel title="Últimos artigos" action={<VerTodos onClick={() => setTab('artigos')} />}>
                {artigos.status === 'success' ? (
                  <div className="-my-1">
                    {[...artigos.data].slice(0, 5).map((a) => <ArtigoItem key={a.id} artigo={a} onClick={() => openArtigo(a.id)} />)}
                  </div>
                ) : <Skeleton className="h-64 w-full rounded-lg" />}
              </Painel>
            </aside>
          </div>
        )}

        {tab === 'cursos' && (
          <div className="flex min-w-0 flex-col gap-6">
            <CursosSections cursos={cursos} onOpen={openCurso} />
          </div>
        )}

        {tab === 'lives' && <LivesTab lives={lives} liveProps={liveProps} />}

        {tab === 'artigos' && <ArtigosTab artigos={artigos} onOpen={openArtigo} />}
      </div>

      <CursoPlayerModal cursoId={cursoId} onClose={() => setCursoId(null)} />
      <ArtigoModal artigoId={artigoId} onClose={() => setArtigoId(null)} />
      <LiveModal
        live={liveDetalhe}
        inscrito={liveDetalhe ? isInscrito(liveDetalhe) : false}
        onToggleInscrito={() => liveDetalhe && toggleInscrito(liveDetalhe)}
        onEntrar={() => { if (liveDetalhe) { const l = liveDetalhe; setLiveDetalhe(null); entrarLive(l) } }}
        onClose={() => setLiveDetalhe(null)}
      />
    </div>
  )
}

/* Seções de cursos (lançamentos + continue assistindo + explorar) — reusadas
   na aba Todos (coluna 2/3) e na aba Cursos (largura cheia). */
function CursosSections({ cursos, onOpen, onVerTodos }: {
  cursos: ReturnType<typeof useService<Curso[]>>
  onOpen: (id: string) => void
  onVerTodos?: () => void
}) {
  if (cursos.status === 'loading' || cursos.status === 'idle') {
    return <div className="flex flex-col gap-6">{[0, 1].map((i) => <Skeleton key={i} className="h-56 w-full rounded-lg" />)}</div>
  }
  if (cursos.status === 'error') return <ErrorState message={cursos.message} onRetry={cursos.reload} />

  const lancamentos = [...cursos.data].sort((a, b) => b.lancadoEm.localeCompare(a.lancadoEm))
  const continuar = cursos.data.filter((c) => c.progresso > 0 && !c.concluido)

  return (
    <>
      <CursoCarrossel
        title="Últimos lançamentos"
        verTodos={onVerTodos}
        items={lancamentos}
        keyOf={(c) => c.id}
        renderItem={(c) => <CursoCard curso={c} onClick={() => onOpen(c.id)} />}
      />

      {continuar.length > 0 && (
        <CursoCarrossel
          title="Continue assistindo"
          items={continuar}
          keyOf={(c) => c.id}
          renderItem={(c) => <CursoProgressCard curso={c} onClick={() => onOpen(c.id)} />}
        />
      )}

      <Painel title="Explorar cursos">
        <CursosExplorar cursos={cursos.data} onOpen={onOpen} />
      </Painel>
    </>
  )
}

function LivesTab({ lives, liveProps }: {
  lives: ReturnType<typeof useService<ProLive[]>>
  liveProps: (l: ProLive) => React.ComponentProps<typeof LiveCardActions>
}) {
  if (lives.status === 'loading' || lives.status === 'idle') return <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}</div>
  if (lives.status === 'error') return <ErrorState message={lives.message} onRetry={lives.reload} />
  const ordered = [...lives.data].sort((a, b) => {
    const rank = (l: ProLive) => (l.aoVivoSeg != null ? 0 : l.status === 'agendada' ? 1 : 2)
    return rank(a) - rank(b)
  })
  return (
    <div>
      <h2 className="mb-3 text-[15px] font-semibold text-ink">Lives YNA</h2>
      <div className="flex flex-col gap-2">
        {ordered.map((l) => (
          <LiveAgendaRow key={l.id} live={l} actions={<LiveCardActions {...liveProps(l)} />} />
        ))}
      </div>
    </div>
  )
}

function ArtigosTab({ artigos, onOpen }: { artigos: ReturnType<typeof useService<import('../../types').Artigo[]>>; onOpen: (id: string) => void }) {
  const [busca, setBusca] = useState('')
  const [tema, setTema] = useState('Todos')

  if (artigos.status === 'loading' || artigos.status === 'idle') {
    return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-56 w-full rounded-lg" />)}</div>
  }
  if (artigos.status === 'error') return <ErrorState message={artigos.message} onRetry={artigos.reload} />

  const all = artigos.data
  const temas = ['Todos', ...Array.from(new Set(all.map((a) => a.tema)))]
  const termo = busca.trim().toLowerCase()
  const filtrados = all
    .filter((a) =>
      (tema === 'Todos' || a.tema === tema) &&
      (!termo || a.titulo.toLowerCase().includes(termo) || a.subheadline.toLowerCase().includes(termo) || a.autor.toLowerCase().includes(termo) || a.tema.toLowerCase().includes(termo)),
    )
    .sort((a, b) => b.data.localeCompare(a.data))

  return (
    <div>
      <h2 className="mb-3 text-[15px] font-semibold text-ink">Artigos</h2>

      {/* Busca por palavra-chave */}
      <div className="relative mb-3">
        <Icon icon="ph:magnifying-glass-bold" width={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden />
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por palavra-chave…"
          aria-label="Buscar artigo"
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-11 pr-4 text-[15px] text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
        />
      </div>

      {/* Filtro por categoria */}
      <div className="mb-5 flex flex-wrap gap-2">
        {temas.map((t) => (
          <button
            key={t}
            onClick={() => setTema(t)}
            aria-pressed={tema === t}
            className={`rounded-pill border-[1.5px] px-3 py-1.5 font-heading text-[12.5px] font-medium transition-colors ${
              tema === t ? 'border-primary bg-primary-50 text-primary dark:text-primary-300' : 'border-border bg-surface text-ink-secondary hover:border-border-strong hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {filtrados.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((a) => <ArtigoCard key={a.id} artigo={a} onClick={() => onOpen(a.id)} />)}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface px-4 py-12 text-center text-sm text-ink-secondary">
          Nenhum artigo encontrado{busca.trim() ? ` para "${busca.trim()}"` : ''}.
        </div>
      )}
    </div>
  )
}

function Vazio({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-border bg-surface px-4 py-6 text-center text-[13px] text-ink-secondary">{children}</div>
}
