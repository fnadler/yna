const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

export type InteressePerfil = 'colaborador' | 'lideranca' | 'rh'
export type InteresseServico = 'teleatendimento' | 'acompanhamento' | 'conteudos'

/** Cadastro na lista de interesse da landing pós-avaliação
   (`/conhecer-yna`). Só os campos do formulário + o nome da empresa. */
export interface InteresseCadastro {
  nome: string
  email: string
  whatsapp?: string
  perfil: InteressePerfil
  interesses: InteresseServico[]
  consentimento: true
  /** Ausente quando a página não sabe o nome (fallback "sua empresa"). */
  empresa?: string
}

export const interesseService = {
  /** Registra o interesse nos serviços "em breve" (teleatendimento,
     acompanhamento, novos conteúdos).

     REGRA DE PRIVACIDADE (não negociável): este cadastro é separado da
     avaliação NR-1. O payload leva APENAS os campos do formulário e o nome
     da empresa — nunca `campanhaId`, protocolo, respostas, nada de
     `AppContext.nr1` nem qualquer identificador que permita ligar o
     contato às respostas da avaliação. A página promete isso a quem
     preenche ("o que você preencher aqui não é ligado às suas respostas, e
     a sua empresa não recebe seus dados de contato"). Pelo mesmo motivo:
     não gravar em `localStorage`, não logar (`console.*`) e, na API real,
     não repassar os contatos à empresa contratante.

     Mock: não envia nem guarda nada. Na API real: `POST /interesse`. */
  registrar: async (_payload: InteresseCadastro): Promise<{ ok: true }> => {
    await delay(rand(600, 1000))
    return { ok: true }
  },
}
