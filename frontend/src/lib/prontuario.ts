/* Catálogo e modelo do prontuário de evolução por sessão (psicologia).
   Baseado na Resolução CFP 001/2009 (registro da evolução, procedimentos
   técnico-científicos, encaminhamentos) e na prática clínica de evolução por
   sessão. CID-10 (categoria F) usado como hipótese diagnóstica. */

export type Comparecimento = 'compareceu' | 'faltou' | 'cancelou' | 'remarcada'
export type Risco = 'sem-risco' | 'ideacao-suicida' | 'autolesao' | 'risco-terceiros'

/** Rascunho do prontuário de uma sessão (enxuto + adicionais opcionais). */
export interface ProntuarioDraft {
  // Enxuto (preenchido durante a sessão)
  comparecimento: Comparecimento
  temas: string[]
  evolucao: string
  risco: Risco
  cids: string[]
  // Adicionais (sobretudo ao finalizar — opcionais)
  humor: string[]
  tecnicas: string[]
  encaminhamentos: string[]
  tarefas: string
}

export const emptyProntuarioDraft = (): ProntuarioDraft => ({
  comparecimento: 'compareceu',
  temas: [],
  evolucao: '',
  risco: 'sem-risco',
  cids: [],
  humor: [],
  tecnicas: [],
  encaminhamentos: [],
  tarefas: '',
})

export const COMPARECIMENTO_OPCOES: { value: Comparecimento; label: string }[] = [
  { value: 'compareceu', label: 'Compareceu' },
  { value: 'faltou', label: 'Faltou' },
  { value: 'cancelou', label: 'Cancelou' },
  { value: 'remarcada', label: 'Remarcada' },
]

export const RISCO_OPCOES: { value: Risco; label: string; danger: boolean }[] = [
  { value: 'sem-risco', label: 'Sem risco identificado', danger: false },
  { value: 'ideacao-suicida', label: 'Ideação suicida', danger: true },
  { value: 'autolesao', label: 'Autolesão', danger: true },
  { value: 'risco-terceiros', label: 'Risco a terceiros', danger: true },
]

export const TEMAS = [
  'Ansiedade', 'Depressão', 'Estresse/Burnout', 'Relacionamentos', 'Família',
  'Trabalho/Carreira', 'Luto', 'Autoestima', 'Sono', 'Trauma', 'Sexualidade', 'Uso de substâncias',
]

export const HUMOR = [
  'Eutímico', 'Ansioso', 'Deprimido', 'Irritado', 'Choroso', 'Apático', 'Agitado', 'Eufórico',
]

export const TECNICAS = [
  'Psicoeducação', 'Reestruturação cognitiva', 'Mindfulness/Relaxamento', 'Exposição',
  'Resolução de problemas', 'Acolhimento/Escuta', 'Regulação emocional', 'Tarefa de casa',
]

export const ENCAMINHAMENTOS = [
  'Psiquiatria', 'Avaliação neuropsicológica', 'Clínico geral', 'Serviço social', 'Exames',
]

/** Hipóteses diagnósticas comuns em psicoterapia (CID-10, sobretudo categoria F). */
export const CID_OPCOES: { code: string; label: string }[] = [
  { code: 'F32', label: 'Episódio depressivo' },
  { code: 'F33', label: 'Transtorno depressivo recorrente' },
  { code: 'F41.1', label: 'Ansiedade generalizada' },
  { code: 'F41.0', label: 'Transtorno de pânico' },
  { code: 'F40', label: 'Transtornos fóbico-ansiosos' },
  { code: 'F43.1', label: 'Estresse pós-traumático (TEPT)' },
  { code: 'F43.2', label: 'Transtornos de adaptação' },
  { code: 'F42', label: 'Transtorno obsessivo-compulsivo' },
  { code: 'F31', label: 'Transtorno afetivo bipolar' },
  { code: 'F50', label: 'Transtornos alimentares' },
  { code: 'F90', label: 'TDAH' },
  { code: 'F60', label: 'Transtornos de personalidade' },
  { code: 'Z63', label: 'Problemas no grupo de apoio (família/relações)' },
  { code: 'Z73', label: 'Problemas na organização do modo de vida' },
]

export const comparecimentoLabel = (v: Comparecimento) =>
  COMPARECIMENTO_OPCOES.find((o) => o.value === v)?.label ?? v
export const riscoOpcao = (v: Risco) => RISCO_OPCOES.find((o) => o.value === v)
export const cidLabel = (code: string) => {
  const o = CID_OPCOES.find((c) => c.code === code)
  return o ? `${o.code} · ${o.label}` : code
}
