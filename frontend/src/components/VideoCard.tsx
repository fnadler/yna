import { Icon } from '@iconify/react'
import type { VideoApoio } from '../data/conteudoApoioMock'

/* Card de vídeo da biblioteca de apoio — usado em Meu Espaço e em Apoio,
   mesmo tratamento visual da antiga Academia YNA (capa em destaque, duração,
   selo de destaque). */
export function VideoCard({ video, destaque, onClick }: { video: VideoApoio; destaque?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full flex-col overflow-hidden rounded-lg border border-border bg-surface text-left transition-transform hover:-translate-y-0.5">
      <div
        className={`relative flex items-center justify-center ${destaque ? 'aspect-[16/9]' : 'aspect-video'}`}
        style={{ background: video.capa }}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 transition-transform group-hover:scale-105">
          <Icon icon="ph:play-fill" width={20} className="text-ink" aria-hidden />
        </span>
        <span className="absolute bottom-2 right-2 rounded-pill bg-black/55 px-2 py-0.5 font-mono text-[11px] font-medium text-white">
          {video.duracaoMin} min
        </span>
        {destaque && (
          <span className="absolute left-2 top-2 rounded-pill bg-white/85 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-ink">
            Destaque
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3.5">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-ink-muted">{video.categoria}</span>
        <span className="font-heading text-[14px] font-semibold leading-snug text-ink">{video.titulo}</span>
      </div>
    </button>
  )
}

/* Card "Continue assistindo" (com progresso) — mesmo padrão da antiga
   CursoProgressCard, agora com quanto do vídeo já foi assistido. */
export function VideoProgressCard({ video, onClick }: { video: VideoApoio; onClick: () => void }) {
  const pct = video.assistidoPct ?? 0
  return (
    <button onClick={onClick} className="flex w-full flex-col text-left">
      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg" style={{ background: video.capa }}>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 transition-transform group-hover:scale-105">
          <Icon icon="ph:play-fill" width={20} className="text-ink" aria-hidden />
        </span>
        <span className="absolute bottom-2 right-2 rounded-pill bg-black/55 px-2 py-0.5 font-mono text-[11px] font-medium text-white">
          {video.duracaoMin} min
        </span>
      </div>
      <p className="mt-2.5 line-clamp-1 font-heading text-sm font-semibold text-ink">{video.titulo}</p>
      <p className="mt-0.5 text-[12.5px] text-ink-secondary">{video.categoria}</p>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-pill bg-surface-2">
          <div className="h-full rounded-pill bg-gradient-to-r from-primary to-pink" style={{ width: `${pct}%` }} />
        </div>
        <span className="shrink-0 font-mono text-[11px] text-ink-secondary">{pct}%</span>
      </div>
    </button>
  )
}

/* Linha compacta de vídeo — para listas explaráveis (Apoio › Vídeos). */
export function VideoListRow({ video, onClick }: { video: VideoApoio; onClick: () => void }) {
  return (
    <li>
      <button onClick={onClick} className="flex w-full items-center gap-4 rounded-lg px-2 py-3 text-left transition-colors hover:bg-surface-hover">
        <div className="relative flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg" style={{ background: video.capa }}>
          <Icon icon="ph:play-fill" width={16} className="text-white" aria-hidden />
          <span className="absolute bottom-1 right-1 rounded-pill bg-black/45 px-1.5 py-0.5 font-mono text-[9.5px] font-medium text-white">
            {video.duracaoMin} min
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-sm font-semibold text-ink">{video.titulo}</p>
          <p className="mt-0.5 text-[12.5px] text-ink-secondary">{video.categoria}</p>
        </div>
        <Icon icon="ph:caret-right-bold" width={16} className="shrink-0 text-ink-muted" aria-hidden />
      </button>
    </li>
  )
}
