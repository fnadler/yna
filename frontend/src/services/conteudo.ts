import {
  LANDING_INTROS,
  VIDEOS_LANDING,
  ARTIGOS_LANDING,
  type PublicoConteudo,
  type VideoApoio,
  type ArtigoApoio,
} from '../data/conteudoApoioMock'

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

export interface ConteudoLandingAba {
  intro: string
  videos: VideoApoio[]
  artigos: ArtigoApoio[]
}

export const conteudoService = {
  /** Conteúdos da landing pós-avaliação (`/conhecer-yna`), um bloco por
     público ("Para você" / "Para quem lidera"). O vídeo em destaque vem
     primeiro em cada aba. Rascunho editorial, pendente de curadoria
     clínica (ver `conteudoApoioMock.ts`). */
  landing: async (): Promise<Record<PublicoConteudo, ConteudoLandingAba>> => {
    await delay(rand(250, 500))
    const aba = (publico: PublicoConteudo): ConteudoLandingAba => ({
      intro: LANDING_INTROS[publico],
      videos: VIDEOS_LANDING.filter((v) => v.publico === publico).sort((a, b) => Number(!!b.destaque) - Number(!!a.destaque)),
      artigos: ARTIGOS_LANDING.filter((a) => a.publico === publico),
    })
    return { colaborador: aba('colaborador'), lideranca: aba('lideranca') }
  },
}
