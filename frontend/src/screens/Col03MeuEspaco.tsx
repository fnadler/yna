import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { MobileTopBar } from '../components/MobileTopBar'
import { VideoImersivo } from '../components/VideoImersivo'
import { VideoCard } from '../components/VideoCard'
import { ArtigoModal } from '../components/ArtigoModal'
import type { AppLayoutContext } from '../components/AppLayout'
import { NR1AvaliacaoCard } from '../components/NR1AvaliacaoCard'
import { useApp } from '../contexts/AppContext'
import { PAGE_MAX_W } from '../lib/layout'
import { CATEGORIAS, VIDEOS, ARTIGOS, type CategoriaConteudo, type VideoApoio, type ArtigoApoio } from '../data/conteudoApoioMock'

/* COL-03 — Meu espaço (absorve o NR1-BEN-01 e o antigo COL-05). Home de
   quem já tem conta: uma biblioteca de conteúdo de apoio sobre saúde
   mental no trabalho — mesma estrutura da antiga "Academia YNA" do
   profissional (destaque + grid filtrável + artigos), conteúdo
   totalmente diferente. Rascunho, pendente de curadoria clínica.

   O convite para a avaliação (NR1AvaliacaoCard) decide sozinho, via
   useAvaliacaoAtiva, se aparece — mesma fonte de verdade usada pela
   página /avaliacao. Para revisar as duas variações, use
   `/meu-espaco?campanha=ativa` ou `?campanha=nenhuma`; sem o parâmetro, é
   o comportamento normal. */

const pillClass = (active: boolean) =>
  `inline-flex shrink-0 items-center gap-1.5 rounded-pill border-[1.5px] px-3 py-1.5 font-heading text-[12.5px] font-medium transition-colors ${
    active
      ? 'border-primary bg-primary-50 text-primary dark:text-primary-300'
      : 'border-border bg-surface text-ink-secondary hover:bg-surface-hover'
  }`

export function Col03MeuEspaco() {
  const { user } = useApp()
  const { openNotifications, unread } = useOutletContext<AppLayoutContext>()

  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState<CategoriaConteudo | 'todas'>('todas')
  const [videoAberto, setVideoAberto] = useState<VideoApoio | null>(null)
  const [artigoAberto, setArtigoAberto] = useState<ArtigoApoio | null>(null)

  const destaques = VIDEOS.filter((v) => v.destaque)
  const listaVideos = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return VIDEOS.filter((v) => {
      if (categoria !== 'todas' && v.categoria !== categoria) return false
      if (termo && !v.titulo.toLowerCase().includes(termo)) return false
      return true
    })
  }, [busca, categoria])

  return (
    <div className="flex-1 bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8`}>
        <MobileTopBar unread={unread} onBellClick={openNotifications} />

        <div className="pt-2 pb-5 lg:pt-9 lg:pb-6">
          <h1 className="text-[26px] lg:text-[32px] font-medium tracking-[-0.02em] text-ink">
            Oi, {user.nickname}.
          </h1>
          <p className="mt-0.5 text-[15px] text-ink-secondary">Que bom ter você por aqui.</p>
        </div>

        <NR1AvaliacaoCard />

        <main className="pb-16 lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-8">
          {/* Coluna central — vídeos */}
          <div className="flex flex-col gap-7">
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-ink">Em destaque</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {destaques.map((v) => (
                  <VideoCard key={v.id} video={v} destaque onClick={() => setVideoAberto(v)} />
                ))}
              </div>
            </section>

            <section>
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-[15px] font-semibold text-ink">Vídeos</h2>
                <div className="relative sm:w-60">
                  <Icon icon="ph:magnifying-glass-bold" width={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden />
                  <input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar por palavra-chave…"
                    className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-[13px] text-ink outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <button onClick={() => setCategoria('todas')} className={pillClass(categoria === 'todas')}>Todas</button>
                {CATEGORIAS.map((c) => (
                  <button key={c.id} onClick={() => setCategoria(c.id)} className={pillClass(categoria === c.id)}>
                    <Icon icon={c.icon} width={13} aria-hidden /> {c.id}
                  </button>
                ))}
              </div>

              {listaVideos.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {listaVideos.map((v) => (
                    <VideoCard key={v.id} video={v} onClick={() => setVideoAberto(v)} />
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-[13px] text-ink-secondary">
                  Nenhum vídeo encontrado com esses filtros.
                </p>
              )}
            </section>
          </div>

          {/* Coluna lateral — artigos */}
          <div className="mt-8 flex flex-col gap-3 lg:mt-0">
            <h2 className="text-[15px] font-semibold text-ink">Artigos</h2>
            {ARTIGOS.map((a) => (
              <button
                key={a.id}
                onClick={() => setArtigoAberto(a)}
                className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-hover"
              >
                <span
                  className="mt-0.5 h-10 w-10 shrink-0 rounded-md"
                  style={{ background: a.capa }}
                  aria-hidden
                />
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-ink-muted">
                    {a.categoria} · {a.tempoLeituraMin} min de leitura
                  </span>
                  <span className="font-heading text-[14px] font-semibold leading-snug text-ink">{a.titulo}</span>
                  <span className="text-[12.5px] leading-relaxed text-ink-secondary">{a.resumo}</span>
                </span>
              </button>
            ))}
          </div>
        </main>
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
