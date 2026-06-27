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
/** Documento da PJ (contrato social, certidões negativas etc.). */
export interface ProPJDocumento {
  id: string
  tipo: string
  /** Nome do arquivo enviado (ausente enquanto pendente). */
  nome?: string
  status: 'pendente' | 'enviado'
}

export interface ProPJ {
  cnpj: string
  razaoSocial: string
  banco: string
  agencia: string
  conta: string
  /** Número da operação (quando aplicável, ex.: Caixa). */
  operacao?: string
  pixChave?: string
  documentos: ProPJDocumento[]
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
  /** Fuso horário do profissional (offset GMT), ex.: "America/Sao_Paulo". */
  fusoHorario: string
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
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  roomLink: string
  prontuarioPendente?: boolean
  durationMin?: number
  /** Segundos desde que o beneficiário abriu a sala (definido = já entrou e aguarda). */
  salaAbertaSeg?: number
}

/* Disponibilidade do profissional (configurada em PRO-11, resumida em PRO-09). */
export type ProDiaDisponibilidade = { active: boolean; times: string[] }
export interface ProBloqueio { id: string; inicio: string; fim?: string; motivo: string }
export interface ProDisponibilidade {
  atendimento: Record<string, ProDiaDisponibilidade>
  plantao: Record<string, ProDiaDisponibilidade>
  bloqueios: ProBloqueio[]
}

/** Prontuário pós-sessão (obrigatório — RF-PR-07).
   `conteudo` é a evolução clínica (texto). Os demais campos são estruturados e
   opcionais (preenchidos no novo registro estruturado da sala de sessão). */
export interface ProntuarioEntry {
  id: string
  sessionId: string
  beneficiarioApelido: string
  date: string
  conteudo: string
  finalizado: boolean
  comparecimento?: 'compareceu' | 'faltou' | 'cancelou' | 'remarcada'
  temas?: string[]
  risco?: 'sem-risco' | 'ideacao-suicida' | 'autolesao' | 'risco-terceiros'
  cids?: string[]
  humor?: string[]
  tecnicas?: string[]
  encaminhamentos?: string[]
  tarefas?: string
}

export interface TriagemResposta {
  pergunta: string
  resposta: string
}

/** Sessão passada (resumo) no histórico do beneficiário. */
export interface ProSessaoResumo {
  id: string
  data: string   // ex.: "15/06/2026"
  hora: string   // ex.: "09:00"
  status: 'realizada' | 'cancelada' | 'falta'
}

/** Objetivo terapêutico — item vivo, revisado/atualizado ao longo do tratamento. */
export interface ObjetivoTerapeutico {
  id: string
  texto: string
  status: 'em-andamento' | 'alcancado'
}

/** Plano terapêutico / acompanhamento do beneficiário (nível do paciente, distinto
   da evolução por sessão). Avaliação de demanda + objetivos do trabalho (CFP 001/2009). */
export interface PlanoTerapeutico {
  demanda: string
  objetivos: ObjetivoTerapeutico[]
  /** Hipótese diagnóstica atual (códigos CID-10). */
  hipoteseDiagnostica: string[]
  abordagem: string
  riscoAtual: 'sem-risco' | 'ideacao-suicida' | 'autolesao' | 'risco-terceiros'
  atualizadoEm: string
}

/** Detalhe do beneficiário visível ao profissional (sigilo: apelido, sem nome real). */
export interface ProBeneficiarioDetail {
  id: string
  apelido: string
  initials: string
  palette: 'lavender' | 'pink' | 'yellow'
  desde: string
  totalSessoes: number
  /** Próxima sessão (data ISO + hora) no fuso base; convertida ao exibir. */
  proximaSessao?: { date: string; time: string }
  /** Sessão recorrente (dia da semana 0=Dom + hora) no fuso base; convertida ao exibir. */
  sessaoRecorrente?: { weekday: number; time: string }
  triagem: TriagemResposta[]
  prontuarios: ProntuarioEntry[]
  historicoSessoes: ProSessaoResumo[]
  plano?: PlanoTerapeutico
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
  totalResgatado: number
  sessoesPagas: number
  sessoesAReceber: number
}

/** Lançamento do extrato financeiro (conta corrente: sessão credita, resgate debita). */
export interface ExtratoItem {
  id: string
  data: string
  tipo: 'sessao' | 'resgate'
  valor: number
  /** Saldo da conta após o lançamento (calculado no serviço). */
  saldo: number
}

/** Sessão contemplada por uma nota fiscal. */
export interface NotaFiscalSessao {
  id: string
  data: string
  beneficiario: string
  valor: number
}

/** Nota fiscal emitida (agrupa sessões de um período). */
export interface NotaFiscal {
  id: string
  numero: string
  data: string
  valorTotal: number
  sessoes: NotaFiscalSessao[]
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

/** Aula de um curso (lista no detalhe). */
export interface CursoAula {
  id: string
  titulo: string
  duracaoMin: number
  concluida: boolean
}

/** Curso da Universidade YNA. */
export interface Curso {
  id: string
  titulo: string
  autor: string
  descricao: string
  tema: string
  trilha: string
  nivel: 'iniciante' | 'intermediario' | 'avancado'
  duracaoMin: number
  totalAulas: number
  aulasConcluidas: number
  progresso: number
  /** Data ISO (YYYY-MM-DD) para ordenar "Últimos lançamentos". */
  lancadoEm: string
  concluido: boolean
  /** Chave de gradiente da capa (sem imagem real no mock). */
  cover: 'lavender' | 'pink' | 'yellow' | 'teal' | 'blue'
  aulas?: CursoAula[]
}

type CoverKey = 'lavender' | 'pink' | 'yellow' | 'teal' | 'blue'

/** Bloco de conteúdo de um artigo (editorial: texto, mídia, citação, lista…). */
export type ArtigoBloco =
  | { tipo: 'paragrafo'; texto: string }
  | { tipo: 'subtitulo'; texto: string }
  | { tipo: 'citacao'; texto: string; fonte?: string }
  | { tipo: 'imagem'; cor: CoverKey; legenda?: string }
  | { tipo: 'video'; titulo?: string; duracao?: string }
  | { tipo: 'lista'; itens: string[] }

/** Artigo da Universidade YNA. */
export interface Artigo {
  id: string
  titulo: string
  subheadline: string
  autor: string
  data: string
  tema: string
  conteudo: ArtigoBloco[]
  /** Tempo estimado de leitura (minutos). */
  tempoLeituraMin: number
  /** Imagem de capa (chave de gradiente). Opcional — artigos podem não ter imagem. */
  imagem?: CoverKey
}

/** Big numbers do dashboard da Universidade. */
export interface UniversidadeStats {
  cursosFinalizados: number
  tempoEstudoMin: number
  certificados: number
  livesParticipadas: number
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
  /** Tipo da live YNA: conteúdo (universidade) ou supervisão clínica. */
  categoria: 'conteudo' | 'supervisao'
  titulo: string
  data: string
  horario: string
  status: 'agendada' | 'replay'
  inscrito: boolean
  descricao?: string
  palestrante?: string
  espectadores?: number
  /** Segundos desde o início da transmissão (definido = ao vivo agora). */
  aoVivoSeg?: number
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

/* ============================================================
   FLUXO 1 — RH / EMPRESA B2B (tipos isolados)
   Jornada do RH/DHO (Master/Operador). Não se conecta aos
   dados de beneficiário/profissional: tudo é agregado e
   anonimizado (k-anonimato ≥ 4). Ver Seção 5 do documento.
   ============================================================ */

/** Status do beneficiário no quadro da empresa (visão RH). */
export type RhBeneficiarioStatus =
  | 'nao_convidado'
  | 'convidado'
  | 'ativo'

/** Papel do usuário corporativo na plataforma. */
export type RhPapel = 'master' | 'operador'

/** Dados da conta corporativa (criada pelo backoffice YNA no kick-off). */
export interface RhEmpresa {
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  segmento: string
  contatoRh: string
  plano: string
  licencasContratadas: number
  contratoInicio: string
  contratoFim: string
  initials: string
}

/** Usuário corporativo (Master ou Operador). */
export interface RhUsuario {
  id: string
  nome: string
  email: string
  papel: RhPapel
  initials: string
  palette: 'lavender' | 'pink' | 'yellow'
  status: 'ativo' | 'convidado'
  ultimoAcesso?: string
}

/** Nó da árvore de departamentos (base do mapa de calor NR-1). */
export interface RhDepartamento {
  id: string
  nome: string
  beneficiarios: number
}

/** Beneficiário na visão do RH — sem nenhum dado clínico/de jornada. */
export interface RhBeneficiario {
  id: string
  nomeCompleto: string
  cpfMascarado: string
  emailCorporativo: string
  departamentoId: string
  status: RhBeneficiarioStatus
  convidadoEm?: string
  initials: string
  palette: 'lavender' | 'pink' | 'yellow'
}

/** Funil de convites (agregado, sem identificação individual). */
export interface RhFunilConvites {
  enviado: number
  aberto: number
  cadastroIniciado: number
  cadastroConcluido: number
}

/** KPI macro do dashboard RH. */
export interface RhKpi {
  key: string
  label: string
  value: string
  delta?: string
  deltaTone?: 'up' | 'down' | 'neutral'
  icon: string
  hint?: string
}

/** Célula do mapa de calor: nível de atenção por dimensão NR-1. */
export interface RhHeatCell {
  /** 0 = sem dado / anonimizado · 1 = baixo · 2 = médio · 3 = alto. */
  nivel: 0 | 1 | 2 | 3
}

/** Linha (departamento) do mapa de calor NR-1. */
export interface RhHeatRow {
  departamentoId: string
  departamento: string
  beneficiarios: number
  /** true quando < 4 beneficiários → bloqueado por k-anonimato. */
  anonimizado: boolean
  celulas: RhHeatCell[]
}

/** Alerta de risco psicossocial agregado (threshold NR-1). */
export interface RhAlerta {
  id: string
  nivel: 'alto' | 'medio'
  departamento: string
  dimensao: string
  mensagem: string
  quando: string
}

/** Linha com erro de validação na importação por planilha. */
export interface RhImportErro {
  linha: number
  nome: string
  email: string
  erro: string
}

/** Resultado do processamento de uma carga via planilha. */
export interface RhImportResult {
  total: number
  validos: number
  duplicados: number
  erros: RhImportErro[]
}

export interface RhNotificacao {
  id: string
  tipo: 'adesao' | 'nr1' | 'plataforma' | 'licenca'
  icon: string
  titulo: string
  descricao: string
  quando: string
  lida: boolean
}
