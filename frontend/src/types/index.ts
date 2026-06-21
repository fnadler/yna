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
  bio: string
  formation: string[]
  yearsExp: number
  sessionDuration: number
}

export type Specialty = 'saude-mental' | 'nutricao' | 'fisioterapia'

export interface Session {
  id: string
  professionalId: string
  professional: string
  professionalInitials: string
  professionalPalette: 'lavender' | 'pink' | 'yellow'
  weekday: string
  date: string
  time: string
  status: 'scheduled' | 'completed' | 'cancelled'
  roomLink: string
  specialty?: Specialty
  startTime?: string
  endTime?: string
  durationMin?: number
  monthGroup?: string
}

export interface TriagemQuestion {
  number: number
  total: number
  kind: 'closed' | 'open'
  intro?: string
  question: string
  highlight?: string
  options?: string[]
  selectedIndex?: number
  placeholder?: string
  helper?: string
}

export interface WheelOfLife {
  labels: string[]
  values: number[]
  previousValues?: number[]
  updatedAt: string
}

export interface CheckInConfig {
  cadence: 'daily' | 'weekly' | 'custom' | 'off'
  mode: 'nina' | 'form'
  customDays?: number[]
  customTime?: string
}

export interface UserProfile {
  id: string
  name: string
  nickname: string
  email: string
  company: string
  department: string
  hasConsented: boolean
  hasCompletedProfile: boolean
  hasCompletedTriagem: boolean
  hasMatches: boolean
  currentProfessionalId: string | null
}

export interface NinaMessage {
  id: string
  role: 'nina' | 'user'
  content: string
  timestamp: string
  isRisk?: boolean
}

export interface Achievement {
  id: string
  title: string
  description: string
  earnedAt: string
  icon: string
}

/* ============================================================
   FLUXO 3 — PROFISSIONAL (psicólogo)
   Tipos isolados do beneficiário. Mockados atrás de src/services/pro.ts.
   ============================================================ */

export type ProCadastroStatus = 'rascunho' | 'em-revisao' | 'aprovado' | 'requer-ajuste'

/** Dados da Pessoa Jurídica (obrigatória para atender — RN-PR-02.1). */
export interface ProPJ {
  cnpj: string
  razaoSocial: string
  banco: string
  agencia: string
  conta: string
  pixChave?: string
}

export interface ProCertificado {
  id: string
  titulo: string
  instituicao: string
  ano: string
  arquivo: string
  validado: boolean
}

export interface ProProfile {
  id: string
  name: string
  initials: string
  palette: 'lavender' | 'pink' | 'yellow'
  crp: string
  crpUf: string
  email: string
  phone?: string
  linhasTeoricas: string[]
  areasAtuacao: string[]
  bio: string
  comoTrabalha: string
  formation: string[]
  certificados: ProCertificado[]
  fotoUrl?: string
  videoUrl?: string
  yearsExp: number
  sessionDuration: number
  pj?: ProPJ
  cadastroStatus: ProCadastroStatus
  integracaoConcluida: boolean
}

/** Item que compõe o indicador "Perfil pronto para match". */
export interface ProfileStrengthItem {
  key: string
  label: string
  peso: number
  done: boolean
  href: string
}

export interface ProfileStrength {
  percent: number
  items: ProfileStrengthItem[]
}

/** Sessão na perspectiva do profissional. */
export interface ProSession {
  id: string
  beneficiarioId: string
  beneficiarioApelido: string
  beneficiarioInitials: string
  beneficiarioPalette: 'lavender' | 'pink' | 'yellow'
  weekday: string
  date: string
  time: string
  status: 'scheduled' | 'completed' | 'cancelled'
  roomLink: string
  prontuarioPendente?: boolean
  durationMin?: number
}

/** Prontuário pós-sessão (obrigatório — RF-PR-07). */
export interface ProntuarioEntry {
  id: string
  sessionId: string
  beneficiarioApelido: string
  date: string
  conteudo: string
  finalizado: boolean
}

export interface TriagemResposta {
  pergunta: string
  resposta: string
}

/** Detalhe do beneficiário visível ao profissional (sigilo: apelido, sem nome real). */
export interface ProBeneficiarioDetail {
  id: string
  apelido: string
  initials: string
  palette: 'lavender' | 'pink' | 'yellow'
  desde: string
  totalSessoes: number
  proximaSessao?: string
  triagem: TriagemResposta[]
  prontuarios: ProntuarioEntry[]
}

export interface PlantaoShift {
  id: string
  dia: string
  inicio: string
  fim: string
  ativo: boolean
}

/** Acionamento de emergência recebido pelo plantonista (lado do profissional). */
export interface ProAcionamento {
  id: string
  apelido: string
  initials: string
  palette: 'lavender' | 'pink' | 'yellow'
  motivo: string
  horario: string
}

export interface FinanceSummary {
  aReceber: number
  antecipacaoDisponivel: number
  cadencia: 'semanal' | 'quinzenal' | 'mensal'
  taxaAntecipacao: number
  sessoesNoMes: number
}

export interface Trilha {
  id: string
  titulo: string
  descricao: string
  categoria: string
  nivel: 'iniciante' | 'intermediario' | 'avancado'
  duracaoMin: number
  progresso: number
}

export interface QualityScore {
  criterio: string
  descricao: string
  score: number
}

export interface ProSupervisao {
  id: string
  tema: string
  data: string
  horario: string
  supervisor: string
  inscrito: boolean
  status: 'agendada' | 'realizada'
}

export interface ProLive {
  id: string
  titulo: string
  data: string
  horario: string
  status: 'agendada' | 'replay'
  inscrito: boolean
}

export interface ProRecebimento {
  id: string
  periodo: string
  valor: number
  status: 'pago' | 'previsto'
  nf: boolean
}

export interface ProNotificacao {
  id: string
  tipo: 'troca' | 'supervisao' | 'plataforma'
  icon: string
  titulo: string
  descricao: string
  quando: string
  lida: boolean
}

/** Estado de sessão/onboarding do profissional (ProContext). */
export interface ProUser {
  hasAccount: boolean
  profile: ProProfile
}
