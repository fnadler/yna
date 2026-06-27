import type {
  ProProfile,
  ProSession,
  ProntuarioEntry,
  ProBeneficiarioDetail,
  PlantaoShift,
  ProAcionamento,
  FinanceSummary,
  Trilha,
  Curso,
  Artigo,
  UniversidadeStats,
  QualityScore,
  ProSupervisao,
  ProLive,
  ProRecebimento,
  ExtratoItem,
  NotaFiscal,
  ProNotificacao,
  ProDisponibilidade,
} from '../types'

/* Dados mockados do fluxo do Profissional. Isolados do beneficiário.
   Para a API real, ver src/services/pro.ts. */

/* "Hoje" de referência do protótipo (as sessões giram em torno desta data). */
export const PRO_TODAY = '2026-06-22'
/* "Agora" de referência (ISO local) — usado para marcar horários já passados. */
export const PRO_NOW = '2026-06-22T11:10:00'

/* Disponibilidade inicial do profissional (atendimento, plantão e bloqueios). */
export const disponibilidadeInicial: ProDisponibilidade = {
  atendimento: {
    Seg: { active: true, times: ['09:00', '11:00', '15:00'] },
    Ter: { active: true, times: ['14:00', '16:00'] },
    Qua: { active: true, times: ['09:00', '10:00'] },
    Qui: { active: true, times: ['15:00', '17:00'] },
    Sex: { active: true, times: ['09:00'] },
    Sáb: { active: false, times: [] },
    Dom: { active: false, times: [] },
  },
  plantao: {
    Seg: { active: false, times: [] },
    Ter: { active: false, times: [] },
    Qua: { active: false, times: [] },
    Qui: { active: false, times: [] },
    Sex: { active: true, times: ['19:00'] },
    Sáb: { active: true, times: ['09:00', '14:00'] },
    Dom: { active: true, times: ['10:00'] },
  },
  bloqueios: [
    { id: 'b0', inicio: '2026-06-10', motivo: 'Recesso' }, // passado — não aparece no resumo
    { id: 'b1', inicio: '2026-06-24', motivo: 'Feriado municipal' },
    { id: 'b2', inicio: '2026-07-01', fim: '2026-07-05', motivo: 'Congresso de Psicologia' },
  ],
}

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
  fusoHorario: 'America/Sao_Paulo',
  pj: {
    cnpj: '12.345.678/0001-90',
    razaoSocial: 'Marina Toledo Psicologia LTDA',
    banco: 'Banco do Brasil',
    agencia: '1234',
    conta: '56789-0',
    operacao: undefined,
    pixChave: 'marina.toledo@exemplo.com',
    documentos: [
      { id: 'doc-contrato', tipo: 'Contrato social', nome: 'contrato-social.pdf', status: 'enviado' },
      { id: 'doc-cnd-federal', tipo: 'Certidão negativa de débitos federais', status: 'pendente' },
      { id: 'doc-cnd-trabalhista', tipo: 'Certidão negativa de débitos trabalhistas (CNDT)', status: 'pendente' },
    ],
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
    time: '11:00',
    status: 'scheduled',
    roomLink: '/pro/sessao/pro-sess-1',
    durationMin: 50,
    salaAbertaSeg: 184,
  },
  {
    id: 'pro-sess-2',
    beneficiarioId: 'ben-lia',
    beneficiarioApelido: 'Lia',
    beneficiarioInitials: 'L',
    beneficiarioPalette: 'lavender',
    weekday: 'Segunda',
    date: '2026-06-22',
    time: '09:00',
    status: 'confirmed',
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
    status: 'confirmed',
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
    id: 'pro-sess-11',
    beneficiarioId: 'ben-sofia',
    beneficiarioApelido: 'Sofia',
    beneficiarioInitials: 'S',
    beneficiarioPalette: 'pink',
    weekday: 'Segunda',
    date: '2026-06-22',
    time: '13:00',
    status: 'cancelled',
    roomLink: '/pro/sessao/pro-sess-11',
    durationMin: 50,
  },
  {
    id: 'pro-sess-7',
    beneficiarioId: 'ben-lia',
    beneficiarioApelido: 'Lia',
    beneficiarioInitials: 'L',
    beneficiarioPalette: 'lavender',
    weekday: 'Terça',
    date: '2026-06-23',
    time: '10:00',
    status: 'scheduled',
    roomLink: '/pro/sessao/pro-sess-7',
    durationMin: 50,
  },
  {
    id: 'pro-sess-8',
    beneficiarioId: 'ben-marcos',
    beneficiarioApelido: 'Marcos',
    beneficiarioInitials: 'M',
    beneficiarioPalette: 'lavender',
    weekday: 'Quarta',
    date: '2026-06-24',
    time: '09:00',
    status: 'scheduled',
    roomLink: '/pro/sessao/pro-sess-8',
    durationMin: 50,
  },
  {
    id: 'pro-sess-9',
    beneficiarioId: 'ben-davi',
    beneficiarioApelido: 'Davi',
    beneficiarioInitials: 'D',
    beneficiarioPalette: 'yellow',
    weekday: 'Quarta',
    date: '2026-06-24',
    time: '14:00',
    status: 'scheduled',
    roomLink: '/pro/sessao/pro-sess-9',
    durationMin: 50,
  },
  {
    id: 'pro-sess-10',
    beneficiarioId: 'ben-sofia',
    beneficiarioApelido: 'Sofia',
    beneficiarioInitials: 'S',
    beneficiarioPalette: 'pink',
    weekday: 'Quinta',
    date: '2026-06-25',
    time: '16:00',
    status: 'scheduled',
    roomLink: '/pro/sessao/pro-sess-10',
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
    proximaSessao: { date: '2026-06-22', time: '09:00' },
    sessaoRecorrente: { weekday: 1, time: '09:00' },
    triagem: [
      { pergunta: 'Como tem sido a vida nos últimos tempos?', resposta: 'Sinto que algo não vai bem, mas ainda não sei nomear.' },
      { pergunta: 'O que mais pede atenção agora?', resposta: 'Ansiedade ligada ao trabalho.' },
      { pergunta: 'Preferência de abordagem', resposta: 'Algo prático, com exercícios.' },
      { pergunta: 'Algo que queira me contar?', resposta: 'Tenho dormido mal nas últimas semanas.' },
      { pergunta: 'Restrição de horário', resposta: 'Prefiro manhãs.' },
    ],
    prontuarios: [
      { id: 'pr-b1', sessionId: 'pro-sess-prev', beneficiarioApelido: 'Bruno', date: '15/06/2026', conteudo: 'Primeira sessão. Queixa de ansiedade ligada ao trabalho. Combinamos registro de gatilhos durante a semana.', finalizado: true, comparecimento: 'compareceu', temas: ['Ansiedade', 'Trabalho/Carreira', 'Sono'], risco: 'sem-risco', cids: ['F41.1'], tecnicas: ['Psicoeducação'] },
    ],
    historicoSessoes: [
      { id: 'hs-b3', data: '15/06/2026', hora: '09:00', status: 'realizada' },
      { id: 'hs-b2', data: '08/06/2026', hora: '09:00', status: 'realizada' },
      { id: 'hs-b1', data: '01/06/2026', hora: '09:00', status: 'realizada' },
    ],
    plano: {
      demanda: 'Ansiedade ligada ao trabalho, com impacto no sono.',
      objetivos: [
        { id: 'ob-b1', texto: 'Identificar gatilhos de ansiedade no trabalho', status: 'alcancado' },
        { id: 'ob-b2', texto: 'Reduzir frequência das crises de ansiedade', status: 'em-andamento' },
        { id: 'ob-b3', texto: 'Melhorar a higiene do sono', status: 'em-andamento' },
      ],
      hipoteseDiagnostica: ['F41.1'],
      abordagem: 'TCC — reestruturação cognitiva e psicoeducação sobre ansiedade.',
      riscoAtual: 'sem-risco',
      atualizadoEm: '15/06/2026',
    },
  },
  {
    id: 'ben-lia',
    apelido: 'Lia',
    initials: 'L',
    palette: 'lavender',
    desde: 'junho de 2026',
    totalSessoes: 1,
    proximaSessao: { date: '2026-06-22', time: '11:00' },
    sessaoRecorrente: { weekday: 1, time: '11:00' },
    triagem: [
      { pergunta: 'Como tem sido a vida nos últimos tempos?', resposta: 'Estou bem, mas quero cuidar de mim.' },
      { pergunta: 'O que mais pede atenção agora?', resposta: 'Relacionamentos.' },
      { pergunta: 'Preferência de abordagem', resposta: 'Sem preferência definida.' },
    ],
    prontuarios: [],
    historicoSessoes: [
      { id: 'hs-l1', data: '15/06/2026', hora: '11:00', status: 'realizada' },
    ],
    plano: {
      demanda: 'Autocuidado e questões de relacionamento.',
      objetivos: [
        { id: 'ob-l1', texto: 'Ampliar repertório de autocuidado', status: 'em-andamento' },
        { id: 'ob-l2', texto: 'Reconhecer padrões nos relacionamentos', status: 'em-andamento' },
      ],
      hipoteseDiagnostica: [],
      abordagem: 'Escuta e acolhimento; abordagem a definir conforme evolução.',
      riscoAtual: 'sem-risco',
      atualizadoEm: '12/06/2026',
    },
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
      { id: 'pr-r1', sessionId: 'pro-sess-r1', beneficiarioApelido: 'Rafa', date: '05/06/2026', conteudo: 'Trabalhamos limites no ambiente de trabalho. Evolução no sono.', finalizado: true, comparecimento: 'compareceu', temas: ['Estresse/Burnout', 'Trabalho/Carreira'], risco: 'sem-risco', cids: ['F43.2'], tecnicas: ['Reestruturação cognitiva', 'Resolução de problemas'], encaminhamentos: ['Psiquiatria'] },
      { id: 'pr-r2', sessionId: 'pro-sess-r2', beneficiarioApelido: 'Rafa', date: '12/06/2026', conteudo: 'Retomada de atividades de lazer. Segue com cansaço, mas mais esperançoso.', finalizado: true, comparecimento: 'compareceu', temas: ['Estresse/Burnout', 'Autoestima'], risco: 'sem-risco', cids: ['F43.2'] },
    ],
    historicoSessoes: [
      { id: 'hs-r5', data: '12/06/2026', hora: '14:00', status: 'realizada' },
      { id: 'hs-r4', data: '05/06/2026', hora: '14:00', status: 'realizada' },
      { id: 'hs-r3', data: '29/05/2026', hora: '14:00', status: 'falta' },
      { id: 'hs-r2', data: '22/05/2026', hora: '14:00', status: 'realizada' },
      { id: 'hs-r1', data: '15/05/2026', hora: '14:00', status: 'realizada' },
    ],
    plano: {
      demanda: 'Esgotamento profissional (burnout).',
      objetivos: [
        { id: 'ob-r1', texto: 'Estabelecer limites no ambiente de trabalho', status: 'alcancado' },
        { id: 'ob-r2', texto: 'Recuperar a qualidade do sono', status: 'alcancado' },
        { id: 'ob-r3', texto: 'Retomar atividades de lazer', status: 'em-andamento' },
      ],
      hipoteseDiagnostica: ['F43.2'],
      abordagem: 'TCC e resolução de problemas; encaminhado à psiquiatria.',
      riscoAtual: 'sem-risco',
      atualizadoEm: '12/06/2026',
    },
  },
  {
    id: 'ben-marcos',
    apelido: 'Marcos',
    initials: 'M',
    palette: 'lavender',
    desde: 'maio de 2026',
    totalSessoes: 2,
    proximaSessao: { date: '2026-06-22', time: '15:00' },
    sessaoRecorrente: { weekday: 1, time: '15:00' },
    triagem: [
      { pergunta: 'Como tem sido a vida nos últimos tempos?', resposta: 'Muita cobrança e pouco descanso.' },
      { pergunta: 'O que mais pede atenção agora?', resposta: 'Estresse e irritabilidade.' },
      { pergunta: 'Preferência de abordagem', resposta: 'Algo que ajude a organizar a rotina.' },
    ],
    prontuarios: [
      { id: 'pr-m1', sessionId: 'pro-sess-m1', beneficiarioApelido: 'Marcos', date: '08/06/2026', conteudo: 'Mapeamos fontes de estresse. Iniciamos higiene do sono.', finalizado: true },
    ],
    historicoSessoes: [
      { id: 'hs-m2', data: '15/06/2026', hora: '15:00', status: 'cancelada' },
      { id: 'hs-m1', data: '08/06/2026', hora: '15:00', status: 'realizada' },
    ],
    plano: {
      demanda: 'Estresse e irritabilidade por sobrecarga.',
      objetivos: [
        { id: 'ob-m1', texto: 'Organizar a rotina e reduzir a sobrecarga', status: 'em-andamento' },
        { id: 'ob-m2', texto: 'Aprender técnicas de regulação emocional', status: 'em-andamento' },
      ],
      hipoteseDiagnostica: ['F43.2'],
      abordagem: 'Psicoeducação e regulação emocional.',
      riscoAtual: 'sem-risco',
      atualizadoEm: '08/06/2026',
    },
  },
  {
    id: 'ben-sofia',
    apelido: 'Sofia',
    initials: 'S',
    palette: 'pink',
    desde: 'junho de 2026',
    totalSessoes: 1,
    proximaSessao: { date: '2026-06-22', time: '16:30' },
    sessaoRecorrente: { weekday: 1, time: '16:30' },
    triagem: [
      { pergunta: 'Como tem sido a vida nos últimos tempos?', resposta: 'Período de muitas mudanças.' },
      { pergunta: 'O que mais pede atenção agora?', resposta: 'Adaptação a uma nova cidade.' },
    ],
    prontuarios: [],
    historicoSessoes: [
      { id: 'hs-s1', data: '15/06/2026', hora: '16:30', status: 'realizada' },
    ],
    plano: {
      demanda: 'Adaptação a mudança de cidade.',
      objetivos: [
        { id: 'ob-s1', texto: 'Construir rede de apoio na nova cidade', status: 'em-andamento' },
        { id: 'ob-s2', texto: 'Manejar a ansiedade da transição', status: 'em-andamento' },
      ],
      hipoteseDiagnostica: ['F43.2'],
      abordagem: 'Acolhimento e estratégias de enfrentamento.',
      riscoAtual: 'sem-risco',
      atualizadoEm: '10/06/2026',
    },
  },
  {
    id: 'ben-davi',
    apelido: 'Davi',
    initials: 'D',
    palette: 'yellow',
    desde: 'março de 2026',
    totalSessoes: 6,
    proximaSessao: { date: '2026-06-22', time: '18:00' },
    sessaoRecorrente: { weekday: 1, time: '18:00' },
    triagem: [
      { pergunta: 'Como tem sido a vida nos últimos tempos?', resposta: 'Mais estável, mas ainda com altos e baixos.' },
      { pergunta: 'O que mais pede atenção agora?', resposta: 'Autoestima e relações.' },
    ],
    prontuarios: [
      { id: 'pr-d1', sessionId: 'pro-sess-d1', beneficiarioApelido: 'Davi', date: '01/06/2026', conteudo: 'Trabalho de autoimagem. Boa adesão às tarefas combinadas.', finalizado: true },
    ],
    historicoSessoes: [
      { id: 'hs-d6', data: '15/06/2026', hora: '18:00', status: 'realizada' },
      { id: 'hs-d5', data: '08/06/2026', hora: '18:00', status: 'realizada' },
      { id: 'hs-d4', data: '01/06/2026', hora: '18:00', status: 'realizada' },
      { id: 'hs-d3', data: '25/05/2026', hora: '18:00', status: 'falta' },
      { id: 'hs-d2', data: '18/05/2026', hora: '18:00', status: 'realizada' },
      { id: 'hs-d1', data: '11/05/2026', hora: '18:00', status: 'realizada' },
    ],
    plano: {
      demanda: 'Autoestima e relacionamentos.',
      objetivos: [
        { id: 'ob-d1', texto: 'Fortalecer a autoimagem', status: 'em-andamento' },
        { id: 'ob-d2', texto: 'Revisar padrões relacionais', status: 'em-andamento' },
        { id: 'ob-d3', texto: 'Manter adesão às tarefas combinadas', status: 'alcancado' },
      ],
      hipoteseDiagnostica: [],
      abordagem: 'TCC — trabalho de autoimagem e habilidades sociais.',
      riscoAtual: 'sem-risco',
      atualizadoEm: '01/06/2026',
    },
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
  aReceber: 1200,
  antecipacaoDisponivel: 1080,
  cadencia: 'semanal',
  taxaAntecipacao: 2.4,
  sessoesNoMes: 32,
  totalResgatado: 1350,
  sessoesPagas: 17,
  sessoesAReceber: 0,
}

export const proRecebimentos: ProRecebimento[] = [
  { id: 'rec-1', periodo: '09–15 jun', valor: 1050, status: 'pago', nf: true },
  { id: 'rec-2', periodo: '02–08 jun', valor: 900, status: 'pago', nf: true },
  { id: 'rec-3', periodo: '16–22 jun', valor: 1200, status: 'previsto', nf: false },
]

/* Extrato financeiro / conta corrente (histórico completo). `saldo` é calculado
   no serviço: sessão credita (+), resgate debita (−). */
export const proExtratoRaw: Omit<ExtratoItem, 'saldo'>[] = [
  { id: 'ex-01', data: '2026-04-24', tipo: 'sessao', valor: 150 },
  { id: 'ex-02', data: '2026-04-28', tipo: 'sessao', valor: 150 },
  { id: 'ex-03', data: '2026-04-30', tipo: 'resgate', valor: 300 },
  { id: 'ex-04', data: '2026-05-05', tipo: 'sessao', valor: 150 },
  { id: 'ex-05', data: '2026-05-08', tipo: 'sessao', valor: 150 },
  { id: 'ex-06', data: '2026-05-12', tipo: 'sessao', valor: 150 },
  { id: 'ex-07', data: '2026-05-15', tipo: 'sessao', valor: 150 },
  { id: 'ex-08', data: '2026-05-20', tipo: 'resgate', valor: 600 },
  { id: 'ex-09', data: '2026-05-26', tipo: 'sessao', valor: 150 },
  { id: 'ex-10', data: '2026-05-29', tipo: 'sessao', valor: 150 },
  { id: 'ex-11', data: '2026-06-02', tipo: 'sessao', valor: 150 },
  { id: 'ex-12', data: '2026-06-05', tipo: 'sessao', valor: 150 },
  { id: 'ex-13', data: '2026-06-08', tipo: 'resgate', valor: 450 },
  { id: 'ex-14', data: '2026-06-10', tipo: 'sessao', valor: 150 },
  { id: 'ex-15', data: '2026-06-12', tipo: 'sessao', valor: 150 },
  { id: 'ex-16', data: '2026-06-15', tipo: 'sessao', valor: 150 },
  { id: 'ex-17', data: '2026-06-17', tipo: 'sessao', valor: 150 },
  { id: 'ex-18', data: '2026-06-19', tipo: 'sessao', valor: 150 },
  { id: 'ex-19', data: '2026-06-21', tipo: 'sessao', valor: 150 },
  { id: 'ex-20', data: '2026-06-22', tipo: 'sessao', valor: 150 },
]

export const proNotasFiscais: NotaFiscal[] = [
  {
    id: 'nf-2026-050', numero: '2026/050', data: '2026-06-16', valorTotal: 600,
    sessoes: [
      { id: 's-50a', data: '2026-06-10', beneficiario: 'Bruno', valor: 150 },
      { id: 's-50b', data: '2026-06-12', beneficiario: 'Lia', valor: 150 },
      { id: 's-50c', data: '2026-06-15', beneficiario: 'Rafa', valor: 150 },
      { id: 's-50d', data: '2026-06-15', beneficiario: 'Marcos', valor: 150 },
    ],
  },
  {
    id: 'nf-2026-044', numero: '2026/044', data: '2026-06-01', valorTotal: 600,
    sessoes: [
      { id: 's-44a', data: '2026-05-26', beneficiario: 'Bruno', valor: 150 },
      { id: 's-44b', data: '2026-05-29', beneficiario: 'Sofia', valor: 150 },
      { id: 's-44c', data: '2026-06-02', beneficiario: 'Davi', valor: 150 },
      { id: 's-44d', data: '2026-06-05', beneficiario: 'Lia', valor: 150 },
    ],
  },
  {
    id: 'nf-2026-039', numero: '2026/039', data: '2026-05-16', valorTotal: 600,
    sessoes: [
      { id: 's-39a', data: '2026-05-05', beneficiario: 'Rafa', valor: 150 },
      { id: 's-39b', data: '2026-05-08', beneficiario: 'Marcos', valor: 150 },
      { id: 's-39c', data: '2026-05-12', beneficiario: 'Davi', valor: 150 },
      { id: 's-39d', data: '2026-05-15', beneficiario: 'Bruno', valor: 150 },
    ],
  },
  {
    id: 'nf-2026-031', numero: '2026/031', data: '2026-05-01', valorTotal: 300,
    sessoes: [
      { id: 's-31a', data: '2026-04-24', beneficiario: 'Sofia', valor: 150 },
      { id: 's-31b', data: '2026-04-28', beneficiario: 'Rafa', valor: 150 },
    ],
  },
]

export const proNotificacoes: ProNotificacao[] = [
  { id: 'n-1', tipo: 'troca', icon: 'ph:shuffle-bold', titulo: 'Um beneficiário seguiu com outro profissional', descricao: 'Faz parte do cuidado. Nenhum dado pessoal é compartilhado nessa transição.', quando: 'há 2 dias', lida: false },
  { id: 'n-2', tipo: 'supervisao', icon: 'ph:users-three-bold', titulo: 'Nova supervisão YNA agendada', descricao: '01/07 às 19:00 — Manejo de risco e encaminhamentos.', quando: 'há 3 dias', lida: true },
  { id: 'n-3', tipo: 'plataforma', icon: 'ph:sparkle-bold', titulo: 'Complete seu vídeo de apresentação', descricao: 'Perfis completos aparecem para mais beneficiários.', quando: 'há 5 dias', lida: true },
]

export const proTrilhas: Trilha[] = [
  { id: 'tr-1', titulo: 'A proposta da YNA', descricao: 'Missão, posicionamento e a persona Cora.', categoria: 'Integração', nivel: 'iniciante', duracaoMin: 25, progresso: 100 },
  { id: 'tr-2', titulo: 'Clínica online com qualidade', descricao: 'Boas práticas para sessões por vídeo.', categoria: 'Prática clínica', nivel: 'intermediario', duracaoMin: 40, progresso: 35 },
  { id: 'tr-3', titulo: 'Conduta e LGPD', descricao: 'Sigilo, CFP e tratamento de dados.', categoria: 'Conduta', nivel: 'iniciante', duracaoMin: 30, progresso: 0 },
]

export const proSupervisoes: ProSupervisao[] = [
  { id: 'sup-1', tema: 'Casos de ansiedade no trabalho', data: '24/06', horario: '19:00', supervisor: 'Virgínia (YNA)', inscrito: false, status: 'agendada' },
  { id: 'sup-2', tema: 'Manejo de risco e encaminhamentos', data: '01/07', horario: '19:00', supervisor: 'Andrea (YNA)', inscrito: true, status: 'agendada' },
  { id: 'sup-0', tema: 'Vínculo terapêutico online', data: '10/06', horario: '19:00', supervisor: 'Virgínia (YNA)', inscrito: true, status: 'realizada' },
]

export const proLives: ProLive[] = [
  { id: 'live-now', categoria: 'conteudo', titulo: 'Plantão clínico ao vivo: manejo de ansiedade', data: '25/06', horario: '19:00', status: 'agendada', inscrito: true, palestrante: 'Virgínia Toledo (YNA)', espectadores: 213, aoVivoSeg: 742, descricao: 'Discussão ao vivo de condutas no manejo de quadros ansiosos, com espaço para perguntas.' },
  { id: 'live-1', categoria: 'conteudo', titulo: 'Round técnico: burnout corporativo', data: '26/06', horario: '20:00', status: 'agendada', inscrito: false, palestrante: 'Lucas Petry', descricao: 'Identificação e manejo do esgotamento profissional na clínica.' },
  { id: 'sup-1', categoria: 'supervisao', titulo: 'Casos de ansiedade no trabalho', data: '27/06', horario: '19:00', status: 'agendada', inscrito: false, palestrante: 'Virgínia (YNA)', descricao: 'Discussão de casos clínicos de ansiedade laboral, com troca entre pares.' },
  { id: 'sup-2', categoria: 'supervisao', titulo: 'Manejo de risco e encaminhamentos', data: '01/07', horario: '19:00', status: 'agendada', inscrito: true, palestrante: 'Andrea (YNA)', descricao: 'Condutas em situações de risco e a rede de encaminhamento.' },
  { id: 'live-2', categoria: 'conteudo', titulo: 'Estudos de caso: luto e perdas', data: '03/07', horario: '20:00', status: 'agendada', inscrito: true, palestrante: 'Virgínia Toledo (YNA)', descricao: 'Casos reais (anonimizados) sobre acompanhamento do luto.' },
  { id: 'live-0', categoria: 'conteudo', titulo: 'Abertura da Universidade YNA', data: '01/06', horario: '20:00', status: 'replay', inscrito: false, palestrante: 'Equipe YNA', descricao: 'A aula inaugural da Universidade YNA.' },
]

export const proUniversidadeStats: UniversidadeStats = {
  cursosFinalizados: 8,
  tempoEstudoMin: 1840,
  certificados: 5,
  livesParticipadas: 12,
}

export const proCursos: Curso[] = [
  { id: 'cur-1', titulo: 'Clínica online com qualidade', autor: 'Virgínia Toledo', descricao: 'Boas práticas para conduzir sessões por vídeo com presença e segurança.', tema: 'Prática clínica', trilha: 'Atendimento online', nivel: 'intermediario', duracaoMin: 95, totalAulas: 8, aulasConcluidas: 3, progresso: 38, lancadoEm: '2026-06-20', concluido: false, cover: 'lavender' },
  { id: 'cur-2', titulo: 'Manejo de risco e crise', autor: 'Andrea Lima', descricao: 'Avaliação de risco, condutas e encaminhamentos em situações de crise.', tema: 'Prática clínica', trilha: 'Segurança do paciente', nivel: 'avancado', duracaoMin: 120, totalAulas: 10, aulasConcluidas: 0, progresso: 0, lancadoEm: '2026-06-18', concluido: false, cover: 'pink' },
  { id: 'cur-3', titulo: 'TCC na prática', autor: 'Rafael Souza', descricao: 'Reestruturação cognitiva, tarefas e protocolos passo a passo.', tema: 'Abordagens', trilha: 'TCC', nivel: 'intermediario', duracaoMin: 140, totalAulas: 12, aulasConcluidas: 12, progresso: 100, lancadoEm: '2026-06-10', concluido: true, cover: 'teal' },
  { id: 'cur-4', titulo: 'Conduta, ética e LGPD', autor: 'Marina Toledo', descricao: 'Sigilo, código de ética do CFP e tratamento de dados na prática.', tema: 'Conduta', trilha: 'Conduta', nivel: 'iniciante', duracaoMin: 60, totalAulas: 6, aulasConcluidas: 2, progresso: 33, lancadoEm: '2026-06-15', concluido: false, cover: 'blue' },
  { id: 'cur-5', titulo: 'Prontuário e registro documental', autor: 'Andrea Lima', descricao: 'Como registrar evolução, plano terapêutico e documentos conforme o CFP.', tema: 'Conduta', trilha: 'Conduta', nivel: 'iniciante', duracaoMin: 45, totalAulas: 5, aulasConcluidas: 0, progresso: 0, lancadoEm: '2026-06-22', concluido: false, cover: 'yellow' },
  { id: 'cur-6', titulo: 'Burnout e saúde do trabalho', autor: 'Lucas Petry', descricao: 'Identificação, manejo e prevenção do esgotamento profissional.', tema: 'Temas clínicos', trilha: 'Temas clínicos', nivel: 'intermediario', duracaoMin: 80, totalAulas: 7, aulasConcluidas: 5, progresso: 71, lancadoEm: '2026-06-05', concluido: false, cover: 'lavender' },
  { id: 'cur-7', titulo: 'Luto e perdas', autor: 'Virgínia Toledo', descricao: 'Acompanhamento do processo de luto em diferentes contextos.', tema: 'Temas clínicos', trilha: 'Temas clínicos', nivel: 'avancado', duracaoMin: 100, totalAulas: 9, aulasConcluidas: 0, progresso: 0, lancadoEm: '2026-06-12', concluido: false, cover: 'pink' },
  { id: 'cur-8', titulo: 'A proposta da YNA', autor: 'Equipe YNA', descricao: 'Missão, posicionamento e a persona Nyna — comece por aqui.', tema: 'Integração', trilha: 'Integração', nivel: 'iniciante', duracaoMin: 25, totalAulas: 3, aulasConcluidas: 3, progresso: 100, lancadoEm: '2026-05-28', concluido: true, cover: 'teal' },
  { id: 'cur-9', titulo: 'Primeira sessão e vínculo', autor: 'Rafael Souza', descricao: 'Construção de aliança terapêutica e contrato de trabalho.', tema: 'Prática clínica', trilha: 'Atendimento online', nivel: 'iniciante', duracaoMin: 55, totalAulas: 5, aulasConcluidas: 1, progresso: 20, lancadoEm: '2026-06-08', concluido: false, cover: 'blue' },
  { id: 'cur-10', titulo: 'Mindfulness e regulação emocional', autor: 'Lucas Petry', descricao: 'Técnicas de atenção plena aplicadas à clínica.', tema: 'Abordagens', trilha: 'Terceira onda', nivel: 'intermediario', duracaoMin: 70, totalAulas: 6, aulasConcluidas: 0, progresso: 0, lancadoEm: '2026-06-01', concluido: false, cover: 'yellow' },
  { id: 'cur-11', titulo: 'Carreira e marca pessoal', autor: 'Marina Toledo', descricao: 'Como se posicionar e atrair os pacientes certos.', tema: 'Carreira', trilha: 'Carreira', nivel: 'iniciante', duracaoMin: 50, totalAulas: 5, aulasConcluidas: 0, progresso: 0, lancadoEm: '2026-05-20', concluido: false, cover: 'lavender' },
  { id: 'cur-12', titulo: 'Relacionamentos e terapia de casal', autor: 'Andrea Lima', descricao: 'Fundamentos para atender demandas de relacionamento.', tema: 'Temas clínicos', trilha: 'Temas clínicos', nivel: 'avancado', duracaoMin: 110, totalAulas: 9, aulasConcluidas: 0, progresso: 0, lancadoEm: '2026-05-15', concluido: false, cover: 'pink' },
]

export const proArtigos: Artigo[] = [
  {
    id: 'art-1', titulo: 'Como estruturar a primeira sessão online', subheadline: 'Um roteiro prático para acolher e construir vínculo já no primeiro encontro.', autor: 'Virgínia Toledo', data: '2026-06-23', tema: 'Prática clínica', tempoLeituraMin: 6, imagem: 'lavender',
    conteudo: [
      { tipo: 'paragrafo', texto: 'A primeira sessão é um dos momentos mais decisivos de todo o processo terapêutico. É nela que o paciente decide, muitas vezes de forma não verbalizada, se vai confiar em você e seguir adiante. Por isso, mais do que coletar informações, o objetivo central do primeiro encontro é construir vínculo e oferecer uma experiência de acolhimento que faça a pessoa querer voltar.' },
      { tipo: 'subtitulo', texto: 'Antes de começar: o setup importa' },
      { tipo: 'paragrafo', texto: 'No atendimento online, parte do enquadre que antes era dado pelo consultório físico passa a depender de você. Uma conexão estável, boa iluminação, áudio limpo e um ambiente reservado comunicam profissionalismo e segurança — e reduzem ruídos que poderiam atrapalhar a escuta.' },
      { tipo: 'imagem', cor: 'teal', legenda: 'Um ambiente reservado e bem iluminado transmite segurança e cuidado ao paciente.' },
      { tipo: 'subtitulo', texto: 'Os primeiros minutos' },
      { tipo: 'paragrafo', texto: 'Comece acolhendo e reduzindo a ansiedade natural do primeiro contato. Antes de mergulhar na queixa, dedique alguns minutos para explicar como o trabalho vai funcionar. Esse cuidado inicial costuma se traduzir em maior adesão ao longo do tratamento.' },
      { tipo: 'lista', itens: [
        'Apresente-se e explique brevemente sua abordagem e como serão as sessões.',
        'Combine o enquadre: frequência, duração, valores, sigilo e política de faltas (contrato terapêutico).',
        'Pergunte, com calma, o que trouxe a pessoa à terapia neste momento da vida.',
        'Acolha a história sem pressa de interpretar — escutar é, aqui, a principal intervenção.',
      ] },
      { tipo: 'citacao', texto: 'As pessoas talvez não lembrem exatamente o que você disse, mas lembram como se sentiram acolhidas.', fonte: 'Sabedoria clínica' },
      { tipo: 'video', titulo: 'Demonstração: conduzindo o acolhimento inicial', duracao: '6 min' },
      { tipo: 'paragrafo', texto: 'Ao final, retome os principais combinados, valide o que a pessoa trouxe e deixe claro o próximo passo. Um fechamento organizado dá ao paciente a sensação de que existe um caminho — e de que ele não está sozinho nele.' },
    ],
  },
  {
    id: 'art-2', titulo: 'Sinais de risco que não podem passar', subheadline: 'O que observar e como conduzir quando há sinais de ideação suicida.', autor: 'Andrea Lima', data: '2026-06-21', tema: 'Segurança do paciente', tempoLeituraMin: 8, imagem: 'pink',
    conteudo: [
      { tipo: 'paragrafo', texto: 'Avaliar risco é uma das responsabilidades mais sérias da clínica — e uma das que mais geram insegurança em profissionais em início de carreira. A boa notícia é que existe método: a avaliação de risco não é um palpite, é um processo estruturado que pode (e deve) ser treinado.' },
      { tipo: 'subtitulo', texto: 'A avaliação é contínua, não pontual' },
      { tipo: 'paragrafo', texto: 'O risco não é uma fotografia, é um filme. Ele varia ao longo do tratamento e pode se intensificar entre as sessões. Por isso, mantenha a escuta atenta a mudanças no discurso, no humor e no comportamento, especialmente em momentos de perda, humilhação ou desesperança.' },
      { tipo: 'lista', itens: [
        'Falas de desesperança ("nada vai melhorar", "seria melhor não estar aqui").',
        'Mudança brusca de humor — inclusive uma calma súbita após período de angústia.',
        'Isolamento, despedidas, doação de pertences ou "organização" da própria ausência.',
        'Acesso a meios e existência de um plano.',
      ] },
      { tipo: 'citacao', texto: 'Perguntar diretamente sobre suicídio não induz o comportamento — ao contrário, costuma aliviar quem carrega a dor em silêncio.' },
      { tipo: 'imagem', cor: 'pink', legenda: 'Nomear o risco em voz alta abre espaço para o cuidado.' },
      { tipo: 'subtitulo', texto: 'Como conduzir' },
      { tipo: 'paragrafo', texto: 'Pergunte de forma clara e sem rodeios sobre ideação, plano e meios. Construa, junto com o paciente, um plano de segurança: pessoas de confiança, recursos de emergência (como o CVV — 188) e estratégias de manejo. Tenha sua rede de encaminhamento mapeada antes de precisar dela.' },
      { tipo: 'video', titulo: 'Estudo de caso: conduzindo a avaliação de risco', duracao: '11 min' },
      { tipo: 'paragrafo', texto: 'Registre tudo com objetividade no prontuário. O registro protege o paciente, orienta a continuidade do cuidado e ampara você do ponto de vista ético e legal.' },
    ],
  },
  {
    id: 'art-3', titulo: 'Prontuário: o que registrar (e o que não)', subheadline: 'Boas práticas de registro à luz da Resolução CFP 001/2009.', autor: 'Marina Toledo', data: '2026-06-19', tema: 'Conduta', tempoLeituraMin: 4,
    conteudo: [
      { tipo: 'paragrafo', texto: 'O prontuário psicológico é um documento técnico, e não um diário da sessão. Ele registra a evolução do trabalho de forma objetiva, permitindo o acompanhamento do caso sem expor detalhes desnecessários da intimidade do paciente.' },
      { tipo: 'subtitulo', texto: 'O que registrar' },
      { tipo: 'lista', itens: [
        'Identificação, demanda e objetivos do trabalho.',
        'Evolução por sessão e os procedimentos técnico-científicos adotados.',
        'Encaminhamentos e, ao final, a síntese de encerramento.',
      ] },
      { tipo: 'citacao', texto: 'Objetividade e foco clínico protegem você e o paciente.', fonte: 'Resolução CFP 001/2009' },
      { tipo: 'paragrafo', texto: 'Evite transcrições literais e juízos de valor. Pergunte-se sempre: este registro contribui para o cumprimento dos objetivos do trabalho? Se não, provavelmente ele não precisa estar ali.' },
    ],
  },
  {
    id: 'art-4', titulo: 'Burnout: além do cansaço', subheadline: 'Diferenciando esgotamento de depressão na avaliação inicial.', autor: 'Lucas Petry', data: '2026-06-16', tema: 'Temas clínicos', tempoLeituraMin: 6, imagem: 'teal',
    conteudo: [
      { tipo: 'paragrafo', texto: 'O burnout é frequentemente confundido com depressão, mas tem uma marca distintiva: a relação direta com o contexto de trabalho. Reconhecer essa diferença orienta a conduta e evita intervenções que tratam o sintoma sem tocar na fonte do sofrimento.' },
      { tipo: 'subtitulo', texto: 'Três dimensões clássicas' },
      { tipo: 'lista', itens: [
        'Exaustão emocional — a sensação de estar "no limite".',
        'Despersonalização — distanciamento e cinismo em relação ao trabalho.',
        'Redução da realização — sentir que nada do que faz tem valor.',
      ] },
      { tipo: 'imagem', cor: 'teal', legenda: 'O esgotamento profissional se constrói ao longo do tempo, não da noite para o dia.' },
      { tipo: 'paragrafo', texto: 'Na avaliação inicial, investigue se o sofrimento se circunscreve ao trabalho ou se invade todas as áreas da vida de forma persistente. Essa leitura ajuda a diferenciar burnout de um quadro depressivo e a planejar o cuidado.' },
    ],
  },
  {
    id: 'art-5', titulo: 'LGPD na clínica: um guia rápido', subheadline: 'Como tratar dados sensíveis dos seus pacientes com segurança.', autor: 'Marina Toledo', data: '2026-06-13', tema: 'Conduta', tempoLeituraMin: 4,
    conteudo: [
      { tipo: 'paragrafo', texto: 'Dados de saúde são classificados pela LGPD como sensíveis e exigem cuidado redobrado. Na clínica, isso significa repensar como você coleta, armazena e compartilha informações dos seus pacientes.' },
      { tipo: 'subtitulo', texto: 'Princípios práticos' },
      { tipo: 'lista', itens: [
        'Minimize: colete apenas o necessário para o trabalho.',
        'Proteja: use ferramentas seguras e senhas fortes; evite anotações soltas.',
        'Tenha base legal e seja transparente sobre como os dados são usados.',
      ] },
      { tipo: 'paragrafo', texto: 'O sigilo profissional e a LGPD caminham juntos: ambos existem para preservar a confiança que sustenta o vínculo terapêutico.' },
    ],
  },
  {
    id: 'art-6', titulo: 'Tarefas de casa que funcionam', subheadline: 'Como prescrever tarefas que aumentam a adesão ao tratamento.', autor: 'Rafael Souza', data: '2026-06-09', tema: 'Abordagens', tempoLeituraMin: 4, imagem: 'yellow',
    conteudo: [
      { tipo: 'paragrafo', texto: 'Tarefas entre sessões ampliam o trabalho terapêutico para a vida real. Bem prescritas, elas aumentam o engajamento e aceleram os ganhos; mal prescritas, viram fonte de culpa e abandono.' },
      { tipo: 'lista', itens: [
        'Combine a tarefa junto com o paciente — não a imponha.',
        'Deixe-a clara, concreta e do tamanho da semana dele.',
        'Antecipe obstáculos: o que pode atrapalhar e como contornar.',
      ] },
      { tipo: 'video', titulo: 'Como combinar e revisar tarefas de casa', duracao: '8 min' },
      { tipo: 'paragrafo', texto: 'E o passo mais esquecido: revise a tarefa na sessão seguinte. Revisar comunica que aquilo importa — e transforma a tarefa em parte viva do processo, não em lição de casa.' },
    ],
  },
  {
    id: 'art-7', titulo: 'Encerramento terapêutico com cuidado', subheadline: 'Quando e como conduzir o término do processo.', autor: 'Virgínia Toledo', data: '2026-06-04', tema: 'Prática clínica', tempoLeituraMin: 5,
    conteudo: [
      { tipo: 'paragrafo', texto: 'O encerramento é parte do trabalho clínico, não o seu fim acidental. Um término bem conduzido consolida os ganhos e oferece ao paciente uma experiência de despedida saudável — algo que muitas pessoas nunca tiveram.' },
      { tipo: 'subtitulo', texto: 'Sinais de que é hora' },
      { tipo: 'paragrafo', texto: 'Objetivos alcançados, maior autonomia e recursos próprios para lidar com as demandas da vida são bons indicadores. O ideal é que a alta seja planejada em conjunto, e não uma interrupção abrupta.' },
      { tipo: 'citacao', texto: 'Encerrar bem é devolver ao paciente a autoria da própria história.' },
      { tipo: 'paragrafo', texto: 'Reserve as últimas sessões para revisar a trajetória, nomear conquistas e deixar a porta aberta para um eventual retorno. O cuidado no fim é tão terapêutico quanto o cuidado no começo.' },
    ],
  },
]

export const proQualityScores: QualityScore[] = [
  { criterio: 'Assiduidade', descricao: 'Comparecimento às sessões agendadas.', score: 96 },
  { criterio: 'Pontualidade', descricao: 'Início das sessões no horário combinado.', score: 92 },
  { criterio: 'Horas de atendimento', descricao: 'Volume de sessões realizadas no período.', score: 80 },
  { criterio: 'Disponibilidade', descricao: 'Slots abertos e participação em plantão.', score: 70 },
  { criterio: 'Desenvolvimento', descricao: 'Participação em trilhas e lives da Universidade YNA.', score: 60 },
]
