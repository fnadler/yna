/** Dados estáticos do conceito visual — camada de API fora do escopo da v0.1. */

export interface Professional {
  id: string
  name: string
  crp: string
  approach: string
  approachLong: string
  specialties: string[]
  nextSlot: string
  videoLength: string
  whyThisMatch: string
  initials: string
  palette: 'lavender' | 'pink' | 'yellow'
}

export const professionals: Professional[] = [
  {
    id: 'pro-1',
    name: 'Dra. Ana Beltrão',
    crp: 'CRP 07/34521',
    approach: 'Terapia Cognitivo-Comportamental',
    approachLong: 'TCC',
    specialties: ['Ansiedade', 'Estresse no trabalho', 'Sono'],
    nextSlot: 'Amanhã · 19h00',
    videoLength: '1:20',
    whyThisMatch:
      'Trabalha há 12 anos com ansiedade ligada ao trabalho — o que você descreveu na triagem.',
    initials: 'AB',
    palette: 'lavender',
  },
  {
    id: 'pro-2',
    name: 'Caio Monteiro',
    crp: 'CRP 07/41187',
    approach: 'Terapia de Aceitação e Compromisso',
    approachLong: 'ACT',
    specialties: ['Ansiedade', 'Transições de vida', 'Autocrítica'],
    nextSlot: 'Quinta · 12h30',
    videoLength: '1:05',
    whyThisMatch:
      'Tem uma escuta prática e direta, do jeito que você disse preferir. Atende em horário de almoço.',
    initials: 'CM',
    palette: 'yellow',
  },
  {
    id: 'pro-3',
    name: 'Dra. Luiza Sarmento',
    crp: 'CRP 07/28903',
    approach: 'Psicologia Humanista',
    approachLong: 'Humanista',
    specialties: ['Esgotamento', 'Relações', 'Autoconhecimento'],
    nextSlot: 'Sexta · 20h00',
    videoLength: '1:34',
    whyThisMatch:
      'Especialista em esgotamento. Você mencionou cansaço constante — ela conhece bem esse terreno.',
    initials: 'LS',
    palette: 'pink',
  },
]

export const nextSession = {
  professional: 'Dra. Ana Beltrão',
  professionalInitials: 'AB',
  weekday: 'Quinta-feira',
  date: '18 de junho',
  time: '19h00',
}

export const wheelOfLife = {
  labels: ['Trabalho', 'Corpo', 'Sono', 'Relações', 'Lazer', 'Propósito'],
  values: [4, 6, 5, 7, 5, 6],
}

export interface TriagemQuestion {
  number: number
  total: number
  kind: 'closed' | 'open'
  intro?: string
  question: string
  options?: string[]
  selectedIndex?: number
  placeholder?: string
  helper?: string
}

export const triagemClosed: TriagemQuestion = {
  number: 1,
  total: 5,
  kind: 'closed',
  intro: 'Sem pressa. Não existe resposta certa aqui.',
  question: 'Pra começar: como tem sido a vida nos últimos tempos?',
  options: [
    'Estou atravessando um momento difícil',
    'Sinto que algo não vai bem, mas ainda não sei nomear',
    'Estou bem, mas quero cuidar de mim',
    'Já faço terapia e quero continuar por aqui',
  ],
  selectedIndex: 1,
}

export const triagemOpen: TriagemQuestion = {
  number: 4,
  total: 5,
  kind: 'open',
  intro: 'Essa é só sua. Use as palavras que vierem.',
  question: 'Se você pudesse contar uma coisa pra quem vai te acompanhar, o que seria?',
  placeholder: 'Escreva do seu jeito. Não precisa estar organizado — a gente entende.',
  helper: 'O que você escrever aqui só é lido pelo profissional que você escolher. Nunca pela sua empresa.',
}
