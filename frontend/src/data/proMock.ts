import type {
  ProProfile,
  ProSession,
  ProntuarioEntry,
  ProBeneficiarioDetail,
  PlantaoShift,
  ProAcionamento,
  FinanceSummary,
  Trilha,
  QualityScore,
  ProSupervisao,
  ProLive,
  ProRecebimento,
  ProNotificacao,
} from '../types'

/* Dados mockados do fluxo do Profissional. Isolados do beneficiário.
   Para a API real, ver src/services/pro.ts. */

export const LINHAS_TEORICAS = ['TCC', 'Psicanálise', 'Humanista', 'Sistêmica', 'ACT', 'Gestalt', 'Junguiana']
export const AREAS_ATUACAO = ['Ansiedade', 'Depressão', 'Burnout', 'Relacionamentos', 'Luto', 'Estresse', 'Autoestima', 'Carreira']

export const proProfile: ProProfile = {
  id: 'pro-self',
  name: 'Dra. Marina Toledo',
  initials: 'MT',
  palette: 'lavender',
  crp: '06/123456',
  crpUf: 'SP',
  email: 'marina.toledo@exemplo.com',
  phone: '(11) 98888-0000',
  linhasTeoricas: ['Terapia Cognitivo-Comportamental', 'ACT'],
  areasAtuacao: ['Ansiedade', 'Burnout', 'Estresse'],
  bio: 'Psicóloga clínica com foco em ansiedade e esgotamento profissional. Acredito em um cuidado prático, com escuta e evidência.',
  comoTrabalha: 'Sessões estruturadas, com combinados claros e exercícios entre encontros quando fizer sentido.',
  formation: [
    'Graduação em Psicologia — PUC-SP',
    'Especialização em TCC — Instituto de Psiquiatria USP',
  ],
  certificados: [
    { id: 'cert-1', titulo: 'Especialização em TCC', instituicao: 'IPq-USP', ano: '2019', arquivo: 'tcc-ipq.pdf', validado: true },
  ],
  fotoUrl: undefined,
  videoUrl: undefined,
  yearsExp: 8,
  sessionDuration: 50,
  pj: {
    cnpj: '12.345.678/0001-90',
    razaoSocial: 'Marina Toledo Psicologia LTDA',
    banco: 'Banco do Brasil',
    agencia: '1234',
    conta: '56789-0',
    pixChave: 'marina.toledo@exemplo.com',
  },
  cadastroStatus: 'aprovado',
  integracaoConcluida: true,
}

export const proSessions: ProSession[] = [
  {
    id: 'pro-sess-1',
    beneficiarioId: 'ben-bruno',
    beneficiarioApelido: 'Bruno',
    beneficiarioInitials: 'B',
    beneficiarioPalette: 'pink',
    weekday: 'Segunda',
    date: '2026-06-22',
    time: '09:00',
    status: 'scheduled',
    roomLink: '/pro/sessao/pro-sess-1',
    durationMin: 50,
  },
  {
    id: 'pro-sess-2',
    beneficiarioId: 'ben-lia',
    beneficiarioApelido: 'Lia',
    beneficiarioInitials: 'L',
    beneficiarioPalette: 'lavender',
    weekday: 'Segunda',
    date: '2026-06-22',
    time: '11:00',
    status: 'scheduled',
    roomLink: '/pro/sessao/pro-sess-2',
    durationMin: 50,
  },
  {
    id: 'pro-sess-3',
    beneficiarioId: 'ben-rafa',
    beneficiarioApelido: 'Rafa',
    beneficiarioInitials: 'R',
    beneficiarioPalette: 'yellow',
    weekday: 'Segunda',
    date: '2026-06-22',
    time: '14:00',
    status: 'scheduled',
    roomLink: '/pro/sessao/pro-sess-3',
    durationMin: 50,
  },
  {
    id: 'pro-sess-4',
    beneficiarioId: 'ben-marcos',
    beneficiarioApelido: 'Marcos',
    beneficiarioInitials: 'M',
    beneficiarioPalette: 'lavender',
    weekday: 'Segunda',
    date: '2026-06-22',
    time: '15:00',
    status: 'scheduled',
    roomLink: '/pro/sessao/pro-sess-4',
    durationMin: 50,
  },
  {
    id: 'pro-sess-5',
    beneficiarioId: 'ben-sofia',
    beneficiarioApelido: 'Sofia',
    beneficiarioInitials: 'S',
    beneficiarioPalette: 'pink',
    weekday: 'Segunda',
    date: '2026-06-22',
    time: '16:30',
    status: 'scheduled',
    roomLink: '/pro/sessao/pro-sess-5',
    durationMin: 50,
  },
  {
    id: 'pro-sess-6',
    beneficiarioId: 'ben-davi',
    beneficiarioApelido: 'Davi',
    beneficiarioInitials: 'D',
    beneficiarioPalette: 'lavender',
    weekday: 'Segunda',
    date: '2026-06-22',
    time: '18:00',
    status: 'scheduled',
    roomLink: '/pro/sessao/pro-sess-6',
    durationMin: 50,
  },
  {
    id: 'pro-sess-0',
    beneficiarioId: 'ben-rafa',
    beneficiarioApelido: 'Rafa',
    beneficiarioInitials: 'R',
    beneficiarioPalette: 'yellow',
    weekday: 'Sexta',
    date: '2026-06-19',
    time: '15:00',
    status: 'completed',
    roomLink: '/pro/sessao/pro-sess-0',
    durationMin: 50,
    prontuarioPendente: true,
  },
]

export const proBeneficiarios: ProBeneficiarioDetail[] = [
  {
    id: 'ben-bruno',
    apelido: 'Bruno',
    initials: 'B',
    palette: 'pink',
    desde: 'maio de 2026',
    totalSessoes: 3,
    proximaSessao: 'seg, 22/06 às 09:00',
    triagem: [
      { pergunta: 'Como tem sido a vida nos últimos tempos?', resposta: 'Sinto que algo não vai bem, mas ainda não sei nomear.' },
      { pergunta: 'O que mais pede atenção agora?', resposta: 'Ansiedade ligada ao trabalho.' },
      { pergunta: 'Preferência de abordagem', resposta: 'Algo prático, com exercícios.' },
      { pergunta: 'Algo que queira me contar?', resposta: 'Tenho dormido mal nas últimas semanas.' },
      { pergunta: 'Restrição de horário', resposta: 'Prefiro manhãs.' },
    ],
    prontuarios: [
      { id: 'pr-b1', sessionId: 'pro-sess-prev', beneficiarioApelido: 'Bruno', date: '15/06/2026', conteudo: 'Primeira sessão. Queixa de ansiedade ligada ao trabalho. Combinamos registro de gatilhos durante a semana.', finalizado: true },
    ],
  },
  {
    id: 'ben-lia',
    apelido: 'Lia',
    initials: 'L',
    palette: 'lavender',
    desde: 'junho de 2026',
    totalSessoes: 1,
    proximaSessao: 'seg, 22/06 às 11:00',
    triagem: [
      { pergunta: 'Como tem sido a vida nos últimos tempos?', resposta: 'Estou bem, mas quero cuidar de mim.' },
      { pergunta: 'O que mais pede atenção agora?', resposta: 'Relacionamentos.' },
      { pergunta: 'Preferência de abordagem', resposta: 'Sem preferência definida.' },
    ],
    prontuarios: [],
  },
  {
    id: 'ben-rafa',
    apelido: 'Rafa',
    initials: 'R',
    palette: 'yellow',
    desde: 'abril de 2026',
    totalSessoes: 5,
    triagem: [
      { pergunta: 'Como tem sido a vida nos últimos tempos?', resposta: 'Estou atravessando um momento difícil.' },
      { pergunta: 'O que mais pede atenção agora?', resposta: 'Esgotamento (burnout).' },
    ],
    prontuarios: [
      { id: 'pr-r1', sessionId: 'pro-sess-r1', beneficiarioApelido: 'Rafa', date: '05/06/2026', conteudo: 'Trabalhamos limites no ambiente de trabalho. Evolução no sono.', finalizado: true },
      { id: 'pr-r2', sessionId: 'pro-sess-r2', beneficiarioApelido: 'Rafa', date: '12/06/2026', conteudo: 'Retomada de atividades de lazer. Segue com cansaço, mas mais esperançoso.', finalizado: true },
    ],
  },
  {
    id: 'ben-marcos',
    apelido: 'Marcos',
    initials: 'M',
    palette: 'lavender',
    desde: 'maio de 2026',
    totalSessoes: 2,
    proximaSessao: 'seg, 22/06 às 15:00',
    triagem: [
      { pergunta: 'Como tem sido a vida nos últimos tempos?', resposta: 'Muita cobrança e pouco descanso.' },
      { pergunta: 'O que mais pede atenção agora?', resposta: 'Estresse e irritabilidade.' },
      { pergunta: 'Preferência de abordagem', resposta: 'Algo que ajude a organizar a rotina.' },
    ],
    prontuarios: [
      { id: 'pr-m1', sessionId: 'pro-sess-m1', beneficiarioApelido: 'Marcos', date: '08/06/2026', conteudo: 'Mapeamos fontes de estresse. Iniciamos higiene do sono.', finalizado: true },
    ],
  },
  {
    id: 'ben-sofia',
    apelido: 'Sofia',
    initials: 'S',
    palette: 'pink',
    desde: 'junho de 2026',
    totalSessoes: 1,
    proximaSessao: 'seg, 22/06 às 16:30',
    triagem: [
      { pergunta: 'Como tem sido a vida nos últimos tempos?', resposta: 'Período de muitas mudanças.' },
      { pergunta: 'O que mais pede atenção agora?', resposta: 'Adaptação a uma nova cidade.' },
    ],
    prontuarios: [],
  },
  {
    id: 'ben-davi',
    apelido: 'Davi',
    initials: 'D',
    palette: 'yellow',
    desde: 'março de 2026',
    totalSessoes: 6,
    proximaSessao: 'seg, 22/06 às 18:00',
    triagem: [
      { pergunta: 'Como tem sido a vida nos últimos tempos?', resposta: 'Mais estável, mas ainda com altos e baixos.' },
      { pergunta: 'O que mais pede atenção agora?', resposta: 'Autoestima e relações.' },
    ],
    prontuarios: [
      { id: 'pr-d1', sessionId: 'pro-sess-d1', beneficiarioApelido: 'Davi', date: '01/06/2026', conteudo: 'Trabalho de autoimagem. Boa adesão às tarefas combinadas.', finalizado: true },
    ],
  },
]

export const proProntuarios: ProntuarioEntry[] = [
  {
    id: 'pront-1',
    sessionId: 'pro-sess-prev',
    beneficiarioApelido: 'Bruno',
    date: '2026-06-15',
    conteudo: 'Primeira sessão. Queixa de ansiedade ligada ao trabalho. Combinamos registro de gatilhos durante a semana.',
    finalizado: true,
  },
]

export const proPlantaoShifts: PlantaoShift[] = [
  { id: 'sh-1', dia: 'Terça', inicio: '18:00', fim: '22:00', ativo: true },
  { id: 'sh-2', dia: 'Quinta', inicio: '18:00', fim: '22:00', ativo: false },
]

export const proAcionamento: ProAcionamento = {
  id: 'pro-emg-1',
  apelido: 'Bruno',
  initials: 'B',
  palette: 'pink',
  motivo: 'Sinais de risco identificados pela Nyna',
  horario: 'agora',
}

export const proFinance: FinanceSummary = {
  aReceber: 4200,
  antecipacaoDisponivel: 3780,
  cadencia: 'semanal',
  taxaAntecipacao: 2.4,
  sessoesNoMes: 32,
}

export const proRecebimentos: ProRecebimento[] = [
  { id: 'rec-1', periodo: '09–15 jun', valor: 1050, status: 'pago', nf: true },
  { id: 'rec-2', periodo: '02–08 jun', valor: 900, status: 'pago', nf: true },
  { id: 'rec-3', periodo: '16–22 jun', valor: 1200, status: 'previsto', nf: false },
]

export const proNotificacoes: ProNotificacao[] = [
  { id: 'n-1', tipo: 'troca', icon: 'ph:shuffle-bold', titulo: 'Um beneficiário seguiu com outro profissional', descricao: 'Faz parte do cuidado. Nenhum dado pessoal é compartilhado nessa transição.', quando: 'há 2 dias', lida: false },
  { id: 'n-2', tipo: 'supervisao', icon: 'ph:users-three-bold', titulo: 'Nova supervisão Domus agendada', descricao: '01/07 às 19:00 — Manejo de risco e encaminhamentos.', quando: 'há 3 dias', lida: true },
  { id: 'n-3', tipo: 'plataforma', icon: 'ph:sparkle-bold', titulo: 'Complete seu vídeo de apresentação', descricao: 'Perfis completos aparecem para mais beneficiários.', quando: 'há 5 dias', lida: true },
]

export const proTrilhas: Trilha[] = [
  { id: 'tr-1', titulo: 'A proposta da YNA', descricao: 'Missão, posicionamento e a persona Cora.', categoria: 'Integração', nivel: 'iniciante', duracaoMin: 25, progresso: 100 },
  { id: 'tr-2', titulo: 'Clínica online com qualidade', descricao: 'Boas práticas para sessões por vídeo.', categoria: 'Prática clínica', nivel: 'intermediario', duracaoMin: 40, progresso: 35 },
  { id: 'tr-3', titulo: 'Conduta e LGPD', descricao: 'Sigilo, CFP e tratamento de dados.', categoria: 'Conduta', nivel: 'iniciante', duracaoMin: 30, progresso: 0 },
]

export const proSupervisoes: ProSupervisao[] = [
  { id: 'sup-1', tema: 'Casos de ansiedade no trabalho', data: '24/06', horario: '19:00', supervisor: 'Virgínia (Domus)', inscrito: false, status: 'agendada' },
  { id: 'sup-2', tema: 'Manejo de risco e encaminhamentos', data: '01/07', horario: '19:00', supervisor: 'Andrea (Domus)', inscrito: true, status: 'agendada' },
  { id: 'sup-0', tema: 'Vínculo terapêutico online', data: '10/06', horario: '19:00', supervisor: 'Virgínia (Domus)', inscrito: true, status: 'realizada' },
]

export const proLives: ProLive[] = [
  { id: 'live-1', titulo: 'Round técnico: burnout corporativo', data: '26/06', horario: '20:00', status: 'agendada', inscrito: false },
  { id: 'live-2', titulo: 'Estudos de caso: luto e perdas', data: '03/07', horario: '20:00', status: 'agendada', inscrito: true },
  { id: 'live-0', titulo: 'Abertura da Universidade YNA', data: '01/06', horario: '20:00', status: 'replay', inscrito: false },
]

export const proQualityScores: QualityScore[] = [
  { criterio: 'Assiduidade', descricao: 'Comparecimento às sessões agendadas.', score: 96 },
  { criterio: 'Pontualidade', descricao: 'Início das sessões no horário combinado.', score: 92 },
  { criterio: 'Horas de atendimento', descricao: 'Volume de sessões realizadas no período.', score: 80 },
  { criterio: 'Disponibilidade', descricao: 'Slots abertos e participação em plantão.', score: 70 },
  { criterio: 'Desenvolvimento', descricao: 'Participação em trilhas e lives da Universidade YNA.', score: 60 },
]
