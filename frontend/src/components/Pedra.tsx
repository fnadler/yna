/* Pedra decorativa da marca — uma das formas orgânicas
   (`public/images/forma-*.svg`) pintada com um dos preenchimentos do design
   system. A forma vem das máscaras `.mask-*` de `index.css` e o
   preenchimento de `backgroundImage`/cores do `tailwind.config.ts`, então a
   pedra é só um `span`: sem `<defs>` de gradiente nem ids para colidir
   quando várias aparecem na mesma tela. Sempre decorativa (`aria-hidden`).

   A largura vem de quem usa (`className`); a altura segue a proporção do
   viewBox original da forma. */

export type PedraForma = 'pedrinha' | 'seixo' | 'pedra' | 'oblongo'
export type PedraPreenchimento = 'sunset' | 'cool' | 'warm' | 'yellow' | 'white'

const FORMAS: Record<PedraForma, { mask: string; ratio: string }> = {
  pedrinha: { mask: 'mask-pedrinha', ratio: '109 / 101' },
  seixo: { mask: 'mask-seixo', ratio: '83 / 28' },
  pedra: { mask: 'mask-pedra', ratio: '139 / 74' },
  oblongo: { mask: 'mask-oblongo', ratio: '49 / 55' },
}

const PREENCHIMENTOS: Record<PedraPreenchimento, string> = {
  sunset: 'bg-yna-pedra-sunset',
  cool: 'bg-yna-pedra-cool',
  warm: 'bg-yna-pedra-warm',
  yellow: 'bg-yellow',
  white: 'bg-white',
}

export function Pedra({
  forma,
  preenchimento,
  className = '',
  style,
}: {
  forma: PedraForma
  preenchimento: PedraPreenchimento
  className?: string
  style?: React.CSSProperties
}) {
  const f = FORMAS[forma]
  return (
    <span
      aria-hidden
      className={`pointer-events-none block ${f.mask} ${PREENCHIMENTOS[preenchimento]} ${className}`}
      style={{ aspectRatio: f.ratio, ...style }}
    />
  )
}
