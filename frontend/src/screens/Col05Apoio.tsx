import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { MobileTopBar } from '../components/MobileTopBar'
import { PageHeader } from '../components/PageHeader'
import { Painel, VerTodos } from '../components/Painel'
import { Carrossel } from '../components/Carrossel'
import { VideoCard, VideoListRow, VideoProgressCard } from '../components/VideoCard'
import { ArtigoCard, ArtigoItem } from '../components/ArtigoCard'
import { VideoImersivo } from '../components/VideoImersivo'
import { ArtigoModal } from '../components/ArtigoModal'
import type { AppLayoutContext } from '../components/AppLayout'
import { PAGE_MAX_W } from '../lib/layout'
import { CATEGORIAS, VIDEOS, ARTIGOS, type CategoriaConteudo, type VideoApoio, type ArtigoApoio } from '../data/conteudoApoioMock'

/* COL-05 — Apoio. Mesma estrutura da antiga Academia YNA do profissional
   (Pro21Universidade): abas Todos/Vídeos/Artigos, carrossel de destaque,
   painel explorável com busca e filtro, sidebar de artigos na aba Todos.

   Diferenças deliberadas em relação à referência:
   - Sem aba/conteúdo de Lives (não existe neste recorte).
   - Sem a linha de StatCards de progresso (cursos finalizados, tempo de
     estudo, certificados): não há um "curso" para se formar, nem
     certificado para emitir. "Continue assistindo" foi mantida (o vídeo é
     avulso, mas o progresso de visualização em si é um dado real de UX,
     não uma credencial simulada). */

const TABS = [
  { key: 'todos', label: 'Todos' },
  { key: 'videos', label: 'Vídeos' },
  { key: 'artigos', label: 'Artigos' },
] as const
type TabKey = (typeof TABS)[number]['key']

const pillClass = (active: boolean) =>
  `inline-flex shrink-0 items-center gap-1.5 rounded-pill border-[1.5px] px-3 py-1.5 font-heading text-[12.5px] font-medium transition-colors ${
    active
      ? 'border-primary bg-primary-50 text-primary dark:text-primary-300'
      : 'border-border bg-surface text-ink-secondary hover:bg-surface-hover'
  }`

export function Col05Apoio() {
  const { openNotifications, unread } = useOutletContext<AppLayoutContext>()
  const [tab, setTab] = useState<TabKey>('todos')
  const [videoAberto, setVideoAberto] = useState<VideoApoio | null>(null)
  const [artigoAberto, setArtigoAberto] = useState<ArtigoApoio | null>(null)

  return (
    <div className="flex-1 bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MobileTopBar unread={unread} onBellClick={openNotifications} />
        <PageHeader
          title="Apoio"
          subtitle="Vídeos e artigos curtos sobre saúde mental no trabalho."
          className="mt-2 lg:mt-0"
        />

        {/* Abas */}
        <div className="mb-5 flex gap-1 rounded-lg bg-surface-2 p-1" role="tablist" aria-label="Seções de Apoio">
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

        {tab === 'todos' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
              <VideosSections onOpen={setVideoAberto} onVerTodos={() => setTab('videos')} />
            </div>
            <aside className="flex min-w-0 flex-col gap-6">
              <Painel title="Últimos artigos" action={<VerTodos onClick={() => setTab('artigos')} />}>
                <div className="-my-1">
                  {ARTIGOS.slice(0, 5).map((a) => (
                    <ArtigoItem key={a.id} artigo={a} onClick={() => setArtigoAberto(a)} />
                  ))}
                </div>
              </Painel>
            </aside>
          </div>
        )}

        {tab === 'videos' && (
          <div className="flex min-w-0 flex-col gap-6">
            <VideosSections onOpen={setVideoAberto} />
          </div>
        )}

        {tab === 'artigos' && <ArtigosTab onOpen={setArtigoAberto} />}
      </div>

      <VideoImersivo
        video={videoAberto}
        videos={VIDEOS}
        onClose={() => setVideoAberto(null)}
        onSelecionar={setVideoAberto}
      />

      <ArtigoModal artigo={artigoAberto} onClose={() => setArtigoAberto(null)} />
    </div>
  )
}

/* Carrossel de destaque + painel explorável — reusada na aba "Todos"
   (coluna 2/3) e na aba "Vídeos" (largura cheia). */
function VideosSections({ onOpen, onVerTodos }: { onOpen: (v: VideoApoio) => void; onVerTodos?: () => void }) {
  const destaques = VIDEOS.filter((v) => v.destaque)
  const continuando = VIDEOS.filter((v) => v.assistidoPct != null && v.assistidoPct > 0 && v.assistidoPct < 100)
  return (
    <>
      <Carrossel
        title="Em destaque"
        verTodos={onVerTodos}
        items={destaques}
        keyOf={(v) => v.id}
        renderItem={(v) => <VideoCard video={v} destaque onClick={() => onOpen(v)} />}
      />

      {continuando.length > 0 && (
        <Carrossel
          title="Continue assistindo"
          items={continuando}
          keyOf={(v) => v.id}
          renderItem={(v) => <VideoProgressCard video={v} onClick={() => onOpen(v)} />}
        />
      )}

      <Painel title="Explorar vídeos">
        <VideosExplorar onOpen={onOpen} />
      </Painel>
    </>
  )
}

const PAGE_SIZE = 6

/* Lista explorável de vídeos: busca + filtro por categoria + paginação. */
function VideosExplorar({ onOpen }: { onOpen: (v: VideoApoio) => void }) {
  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState<CategoriaConteudo | 'todas'>('todas')
  const [page, setPage] = useState(1)
  const reset = () => setPage(1)

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return VIDEOS.filter((v) => {
      if (categoria !== 'todas' && v.categoria !== categoria) return false
      if (termo && !v.titulo.toLowerCase().includes(termo)) return false
      return true
    })
  }, [busca, categoria])

  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE))
  const pageSafe = Math.min(page, totalPages)
  const pageItems = filtrados.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE)

  return (
    <>
      <div className="relative mb-3">
        <Icon icon="ph:magnifying-glass-bold" width={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden />
        <input
          type="search"
          value={busca}
          onChange={(e) => { setBusca(e.target.value); reset() }}
          placeholder="Buscar por palavra-chave…"
          aria-label="Buscar vídeo"
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-11 pr-4 text-[15px] text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => { setCategoria('todas'); reset() }} className={pillClass(categoria === 'todas')}>Todas</button>
        {CATEGORIAS.map((c) => (
          <button key={c.id} onClick={() => { setCategoria(c.id); reset() }} className={pillClass(categoria === c.id)}>
            <Icon icon={c.icon} width={13} aria-hidden /> {c.id}
          </button>
        ))}
      </div>

      {pageItems.length > 0 ? (
        <ul className="flex flex-col divide-y divide-border">
          {pageItems.map((v) => (
            <VideoListRow key={v.id} video={v} onClick={() => onOpen(v)} />
          ))}
        </ul>
      ) : (
        <div className="px-4 py-10 text-center text-sm text-ink-secondary">
          Nenhum vídeo encontrado com esses filtros.
        </div>
      )}

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

/* Aba "Artigos": busca + filtro por categoria + grid editorial. */
function ArtigosTab({ onOpen }: { onOpen: (a: ArtigoApoio) => void }) {
  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState<CategoriaConteudo | 'todas'>('todas')

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return ARTIGOS.filter((a) => {
      if (categoria !== 'todas' && a.categoria !== categoria) return false
      if (termo && !a.titulo.toLowerCase().includes(termo) && !a.resumo.toLowerCase().includes(termo)) return false
      return true
    })
  }, [busca, categoria])

  return (
    <div>
      <h2 className="mb-3 text-[15px] font-semibold text-ink">Artigos</h2>

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

      <div className="mb-5 flex flex-wrap gap-2">
        <button onClick={() => setCategoria('todas')} className={pillClass(categoria === 'todas')}>Todas</button>
        {CATEGORIAS.map((c) => (
          <button key={c.id} onClick={() => setCategoria(c.id)} className={pillClass(categoria === c.id)}>
            <Icon icon={c.icon} width={13} aria-hidden /> {c.id}
          </button>
        ))}
      </div>

      {filtrados.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((a) => (
            <ArtigoCard key={a.id} artigo={a} onClick={() => onOpen(a)} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface px-4 py-12 text-center text-sm text-ink-secondary">
          Nenhum artigo encontrado{busca.trim() ? ` para "${busca.trim()}"` : ''}.
        </div>
      )}
    </div>
  )
}
