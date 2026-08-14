import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@iconify/react'
import { Button } from './Button'
import type { VideoApoio } from '../data/conteudoApoioMock'

/* Player de vídeo em "tela cheia", mesma interação da antiga Academia YNA
   (Pro29CursoDetalhe/CursoPlayerModal) — só que para um vídeo avulso, não um
   curso com aulas: sem currículo, progresso ou "concluir aula" (não há
   histórico real por trás disso, ver README). O que sobrevive da referência
   é a hierarquia: barra superior com trilha + fechar, vídeo em destaque, e
   uma lista de outros vídeos para continuar navegando sem sair do modo
   imersivo. */
export function VideoImersivo({
  video,
  videos,
  onClose,
  onSelecionar,
}: {
  video: VideoApoio | null
  videos: VideoApoio[]
  onClose: () => void
  onSelecionar: (v: VideoApoio) => void
}) {
  useEffect(() => {
    if (!video) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [video, onClose])

  if (!video) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col bg-page">
      <VideoImersivoBody video={video} videos={videos} onClose={onClose} onSelecionar={onSelecionar} />
    </div>,
    document.body,
  )
}

function VideoImersivoBody({
  video,
  videos,
  onClose,
  onSelecionar,
}: {
  video: VideoApoio
  videos: VideoApoio[]
  onClose: () => void
  onSelecionar: (v: VideoApoio) => void
}) {
  const idx = videos.findIndex((v) => v.id === video.id)
  const proximo = idx >= 0 && idx < videos.length - 1 ? videos[idx + 1] : undefined
  const outros = videos.filter((v) => v.id !== video.id)

  return (
    <>
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 lg:px-6">
        <div className="flex min-w-0 items-center gap-2 text-[13px] text-ink-secondary">
          <span className="hidden font-medium text-ink-muted sm:inline">Apoio</span>
          <Icon icon="ph:caret-right-bold" width={11} className="hidden shrink-0 text-ink-muted sm:inline" aria-hidden />
          <span className="truncate font-heading font-semibold text-ink">{video.titulo}</span>
        </div>
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
        >
          <Icon icon="ph:x-bold" width={18} aria-hidden />
        </button>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        <div className="min-w-0 flex-1 lg:overflow-y-auto">
          {/* Vídeo — mock, sem player real */}
          <div className="relative flex aspect-video w-full items-center justify-center" style={{ background: video.capa }}>
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/85">
              <Icon icon="ph:play-fill" width={30} className="text-ink" aria-hidden />
            </span>
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/55 to-transparent px-4 py-2.5 text-white">
              <Icon icon="ph:play-fill" width={18} aria-hidden />
              <div className="h-1 flex-1 overflow-hidden rounded-pill bg-white/30">
                <div className="h-full w-1/4 rounded-pill bg-white" />
              </div>
              <span className="font-mono text-[11px] tabular-nums">00:54</span>
              <Icon icon="ph:speaker-high-bold" width={16} aria-hidden />
              <Icon icon="ph:gear-bold" width={16} aria-hidden />
              <Icon icon="ph:corners-out-bold" width={16} aria-hidden />
            </div>
          </div>

          <div className="px-4 py-5 lg:px-6">
            {proximo && (
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" iconRight="ph:skip-forward-bold" onClick={() => onSelecionar(proximo)}>
                  Próximo vídeo
                </Button>
              </div>
            )}

            <div className="mt-5">
              <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-ink-muted">
                {video.categoria} · {video.duracaoMin} min
              </span>
              <h1 className="mt-1 font-heading text-xl font-semibold text-ink">{video.titulo}</h1>

              <h2 className="mt-6 text-[15px] font-semibold text-ink">Sobre o vídeo</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-secondary">{video.resumo}</p>
            </div>
          </div>

          {/* Mais vídeos — mobile (abaixo do conteúdo, sem sidebar fixa) */}
          <div className="border-t border-border px-4 py-4 lg:hidden">
            <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted">
              Mais vídeos
            </p>
            <OutrosVideos videos={outros} onSelecionar={onSelecionar} />
          </div>
        </div>

        {/* Mais vídeos — coluna direita (desktop) */}
        <aside className="hidden w-[340px] shrink-0 flex-col border-l border-border bg-surface lg:flex">
          <p className="shrink-0 border-b border-border px-4 py-4 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted">
            Mais vídeos
          </p>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
            <OutrosVideos videos={outros} onSelecionar={onSelecionar} />
          </div>
        </aside>
      </div>
    </>
  )
}

function OutrosVideos({ videos, onSelecionar }: { videos: VideoApoio[]; onSelecionar: (v: VideoApoio) => void }) {
  return (
    <ul className="flex flex-col gap-1">
      {videos.map((v) => (
        <li key={v.id}>
          <button
            onClick={() => onSelecionar(v)}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-surface-hover"
          >
            <span
              className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md"
              style={{ background: v.capa }}
            >
              <Icon icon="ph:play-fill" width={14} className="text-white" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-ink">{v.titulo}</span>
              <span className="block text-[11.5px] text-ink-muted">
                {v.categoria} · {v.duracaoMin} min
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
