import { Icon } from '@iconify/react'
import { Badge } from './Badge'
import type { ArtigoApoio } from '../data/conteudoApoioMock'

/* Card editorial de artigo (grid da aba Artigos em Apoio): capa, categoria,
   tempo de leitura, título, resumo, autor e data — mesmo padrão da antiga
   Academia YNA (Pro/universidadeParts.ArtigoCard). */
export function ArtigoCard({ artigo, onClick }: { artigo: ArtigoApoio; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface text-left transition-colors hover:border-border-strong hover:bg-surface-hover"
    >
      <div className="flex aspect-video items-center justify-center" style={{ background: artigo.capa }}>
        <Icon icon="ph:article-medium-bold" width={38} className="text-white/85" aria-hidden />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{artigo.categoria}</Badge>
          <span className="flex items-center gap-1 text-[11.5px] text-ink-muted">
            <Icon icon="ph:clock-bold" width={12} aria-hidden /> {artigo.tempoLeituraMin} min de leitura
          </span>
        </div>
        <p className="mt-2 font-heading text-[15px] font-semibold leading-snug text-ink">{artigo.titulo}</p>
        <p className="mt-1 line-clamp-2 text-[13px] text-ink-secondary">{artigo.resumo}</p>
        <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-ink-muted">
          <Icon icon="ph:user-bold" width={12} aria-hidden /> {artigo.autor}
          <span aria-hidden>·</span>
          {artigo.publicadoEm}
        </p>
      </div>
    </button>
  )
}

/* Item compacto de artigo (sidebar "Últimos artigos"). */
export function ArtigoItem({ artigo, onClick }: { artigo: ArtigoApoio; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full border-t border-border py-3 text-left first:border-t-0 first:pt-0">
      <p className="font-heading text-[13.5px] font-semibold leading-snug text-ink">{artigo.titulo}</p>
      <p className="mt-0.5 line-clamp-2 text-[12.5px] text-ink-secondary">{artigo.resumo}</p>
      <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-ink-muted">
        {artigo.categoria}
        <span aria-hidden>·</span>
        <span className="flex items-center gap-1">
          <Icon icon="ph:clock-bold" width={11} aria-hidden /> {artigo.tempoLeituraMin} min
        </span>
      </p>
    </button>
  )
}
