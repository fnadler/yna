import { Icon } from '@iconify/react'
import { Badge } from '../../components/Badge'
import { Sheet } from '../../components/Sheet'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { useService } from '../../hooks/useService'
import { proUniversidadeService } from '../../services/pro'
import { coverClass, fmtDataBR } from './universidadeParts'
import type { ArtigoBloco } from '../../types'

/* Detalhe do artigo da Universidade YNA — em modal. */
export function ArtigoModal({ artigoId, onClose }: { artigoId: string | null; onClose: () => void }) {
  return (
    <Sheet open={artigoId !== null} onClose={onClose} title="Artigo" icon="ph:article-bold" size="lg">
      {artigoId && <ArtigoConteudo id={artigoId} />}
    </Sheet>
  )
}

function ArtigoConteudo({ id }: { id: string }) {
  const q = useService(() => proUniversidadeService.artigo(id), [id])

  if (q.status === 'loading' || q.status === 'idle') {
    return <div className="flex flex-col gap-4 px-5 py-6 lg:px-6"><Skeleton className="h-9 w-3/4 rounded" /><Skeleton className="h-32 w-full rounded-lg" /></div>
  }
  if (q.status === 'error') return <div className="px-5 py-6 lg:px-6"><ErrorState message={q.message} onRetry={q.reload} /></div>
  if (q.status === 'success' && !q.data) {
    return <div className="px-5 py-10 text-center text-sm text-ink-secondary">Artigo não encontrado.</div>
  }
  if (q.status !== 'success' || !q.data) return null

  const a = q.data
  return (
    <article className="px-5 py-6 lg:px-6">
      {a.imagem && (
        <div className={`-mx-5 -mt-6 mb-5 flex aspect-video items-center justify-center bg-gradient-to-br ${coverClass[a.imagem]} lg:-mx-6`}>
          <Icon icon="ph:article-medium-bold" width={48} className="text-white/85" aria-hidden />
        </div>
      )}
      <Badge tone="neutral">{a.tema}</Badge>
      <h1 className="mt-3 font-heading text-2xl font-semibold leading-tight tracking-[-0.01em] text-ink">{a.titulo}</h1>
      <p className="mt-2 text-[15px] text-ink-secondary">{a.subheadline}</p>
      <p className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-ink-muted">
        <Icon icon="ph:user-bold" width={14} aria-hidden /> {a.autor}
        <span aria-hidden>·</span>
        <Icon icon="ph:calendar-bold" width={14} aria-hidden /> {fmtDataBR(a.data)}
        <span aria-hidden>·</span>
        <Icon icon="ph:clock-bold" width={14} aria-hidden /> {a.tempoLeituraMin} min de leitura
      </p>
      <div className="mt-5 flex flex-col gap-5">
        {a.conteudo.map((b, i) => <ArtigoBlocoView key={i} bloco={b} />)}
      </div>
    </article>
  )
}

/* Renderiza um bloco de conteúdo do artigo (texto, mídia, citação, lista). */
function ArtigoBlocoView({ bloco }: { bloco: ArtigoBloco }) {
  switch (bloco.tipo) {
    case 'subtitulo':
      return <h2 className="mt-1 font-heading text-lg font-semibold text-ink">{bloco.texto}</h2>
    case 'paragrafo':
      return <p className="text-[15px] leading-relaxed text-ink">{bloco.texto}</p>
    case 'lista':
      return (
        <ul className="list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-ink marker:text-primary">
          {bloco.itens.map((it, i) => <li key={i}>{it}</li>)}
        </ul>
      )
    case 'citacao':
      return (
        <blockquote className="border-l-[3px] border-primary/60 pl-4">
          <p className="text-[15px] italic leading-relaxed text-ink-secondary">“{bloco.texto}”</p>
          {bloco.fonte && <footer className="mt-1 text-[12.5px] text-ink-muted">— {bloco.fonte}</footer>}
        </blockquote>
      )
    case 'imagem':
      return (
        <figure>
          <div className={`flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br ${coverClass[bloco.cor]}`}>
            <Icon icon="ph:image-bold" width={40} className="text-white/80" aria-hidden />
          </div>
          {bloco.legenda && <figcaption className="mt-1.5 text-center text-[12.5px] text-ink-muted">{bloco.legenda}</figcaption>}
        </figure>
      )
    case 'video':
      return (
        <figure>
          <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-[#1a1828]">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white"><Icon icon="ph:play-fill" width={26} aria-hidden /></span>
            <span className="absolute bottom-2 left-3 inline-flex items-center gap-1 rounded-pill bg-black/40 px-2 py-0.5 text-[11px] font-medium text-white">
              <Icon icon="ph:video-camera-bold" width={11} aria-hidden /> Vídeo{bloco.duracao ? ` · ${bloco.duracao}` : ''}
            </span>
          </div>
          {bloco.titulo && <figcaption className="mt-1.5 text-[12.5px] text-ink-muted">{bloco.titulo}</figcaption>}
        </figure>
      )
  }
}
