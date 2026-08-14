import { Icon } from '@iconify/react'
import { Badge } from './Badge'
import { Sheet } from './Sheet'
import type { ArtigoApoio, ArtigoBloco } from '../data/conteudoApoioMock'

/* Detalhe do artigo de apoio — em Sheet, mesma interação da antiga Academia
   YNA (Pro30Artigo): imagem de destaque, meta (autor/data/leitura) e corpo
   em blocos (parágrafo, subtítulo, lista, citação, imagem, vídeo), não só
   texto corrido. */
export function ArtigoModal({ artigo, onClose }: { artigo: ArtigoApoio | null; onClose: () => void }) {
  return (
    <Sheet open={artigo !== null} onClose={onClose} title="Artigo" icon="ph:article-bold" size="lg">
      {artigo && <ArtigoConteudo artigo={artigo} />}
    </Sheet>
  )
}

function ArtigoConteudo({ artigo }: { artigo: ArtigoApoio }) {
  return (
    <article className="px-5 py-6 lg:px-6">
      <div
        className="-mx-5 -mt-6 mb-5 flex aspect-[21/9] items-center justify-center lg:-mx-6"
        style={{ background: artigo.capa }}
      >
        <Icon icon="ph:article-medium-bold" width={44} className="text-white/85" aria-hidden />
      </div>

      <Badge tone="neutral">{artigo.categoria}</Badge>
      <h1 className="mt-3 font-heading text-2xl font-semibold leading-tight tracking-[-0.01em] text-ink">
        {artigo.titulo}
      </h1>
      <p className="mt-2 text-[15px] text-ink-secondary">{artigo.resumo}</p>
      <p className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-ink-muted">
        <Icon icon="ph:user-bold" width={14} aria-hidden /> {artigo.autor}
        <span aria-hidden>·</span>
        <Icon icon="ph:calendar-bold" width={14} aria-hidden /> {artigo.publicadoEm}
        <span aria-hidden>·</span>
        <Icon icon="ph:clock-bold" width={14} aria-hidden /> {artigo.tempoLeituraMin} min de leitura
      </p>

      <div className="mt-5 flex flex-col gap-5">
        {artigo.corpo.map((bloco, i) => (
          <ArtigoBlocoView key={i} bloco={bloco} />
        ))}
      </div>
    </article>
  )
}

function ArtigoBlocoView({ bloco }: { bloco: ArtigoBloco }) {
  switch (bloco.tipo) {
    case 'subtitulo':
      return <h2 className="mt-1 font-heading text-lg font-semibold text-ink">{bloco.texto}</h2>
    case 'paragrafo':
      return <p className="text-[15px] leading-relaxed text-ink">{bloco.texto}</p>
    case 'lista':
      return (
        <ul className="list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-ink marker:text-primary">
          {bloco.itens.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      )
    case 'citacao':
      return (
        <blockquote className="border-l-[3px] border-primary/60 pl-4">
          <p className="text-[15px] italic leading-relaxed text-ink-secondary">&ldquo;{bloco.texto}&rdquo;</p>
          {bloco.fonte && <footer className="mt-1 text-[12.5px] text-ink-muted">— {bloco.fonte}</footer>}
        </blockquote>
      )
    case 'imagem':
      return (
        <figure>
          <div className="flex aspect-video items-center justify-center rounded-lg" style={{ background: bloco.cor }}>
            <Icon icon="ph:image-bold" width={40} className="text-white/80" aria-hidden />
          </div>
          {bloco.legenda && <figcaption className="mt-1.5 text-center text-[12.5px] text-ink-muted">{bloco.legenda}</figcaption>}
        </figure>
      )
    case 'video':
      return (
        <figure>
          <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-[#1a1828]">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white">
              <Icon icon="ph:play-fill" width={26} aria-hidden />
            </span>
            <span className="absolute bottom-2 left-3 inline-flex items-center gap-1 rounded-pill bg-black/40 px-2 py-0.5 text-[11px] font-medium text-white">
              <Icon icon="ph:video-camera-bold" width={11} aria-hidden /> Vídeo{bloco.duracao ? ` · ${bloco.duracao}` : ''}
            </span>
          </div>
          {bloco.titulo && <figcaption className="mt-1.5 text-[12.5px] text-ink-muted">{bloco.titulo}</figcaption>}
        </figure>
      )
  }
}
