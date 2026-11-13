import type { ProCadastro, ProDisponibilidade, ProProfile, ProSession, ProntuarioEntry, ProBeneficiarioDetail } from '../types'

/* Dados mockados do perfil Profissional. Na fase 2: onboarding (convite →
   cadastro → ativação), análise do cadastro no Manager e a área logada com
   Perfil, Agenda e Configurações. */

/** Cadastro completo de exemplo, nos mesmos 5 steps do fluxo do
   profissional. As chaves de `perfil` (c1–c6) são os campos do tipo
   "Psicólogo" em `tiposProfissional.ts`. */
export const proCadastroDemo: ProCadastro = {
  nomeCompleto: 'Mariana Lopes', cpf: '123.456.789-00', email: 'mariana@ex.com', telefone: '(11) 98812-4431', instagram: '@marilopes.psi',
  cnpj: '48.902.115/0001-20', razaoSocial: 'ML Psicologia Ltda.', contratoSocial: 'contrato-social.pdf',
  banco: 'Nubank (260)', agencia: '0001', conta: '88213-4', pixChave: 'contato@mlpsicologia.com.br',
  perfil: {
    c1: '06/128443',
    c2: 'SP',
    c3: ['TCC', 'ACT'],
    c4: ['Ansiedade', 'Estresse', 'Transição de carreira'],
    c5: 'Psicóloga clínica com foco em ansiedade e processos de transição de carreira. Abordagem integrativa e baseada em evidências.',
    c6: 'Sessões estruturadas com definição de metas, tarefas entre encontros e revisão contínua do plano terapêutico.',
  },
  formacoes: [
    { id: 'f1', nivel: 'Graduação', curso: 'Psicologia', instituicao: 'USP', inicio: '2011-02', fim: '2015-12', emAndamento: false },
    { id: 'f2', nivel: 'Especialização', curso: 'Terapia Cognitivo-Comportamental', instituicao: 'PUC-SP', inicio: '2016-03', fim: '2018-06', emAndamento: false },
  ],
  cursos: [
    { id: 'c1', nome: 'Terapia do Esquema', instituicao: 'Instituto Beck', inicio: '2020-01', fim: '2021-06', emAndamento: false },
    { id: 'c2', nome: 'Manejo de crises e risco', instituicao: 'YNA', inicio: '2023-02', fim: '', emAndamento: true },
  ],
  idiomas: [
    { id: 'i1', idioma: 'Português', nivel: 'Nativo' },
    { id: 'i2', idioma: 'Inglês', nivel: 'Avançado' },
  ],
  disponibilidade: { dias: ['Seg', 'Ter', 'Qua', 'Qui'], horaInicio: '09:00', horaFim: '18:00', plantao: true },
}

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

/* Opções de selects do cadastro. */
export const PRO_NIVEIS_FORMACAO = ['Graduação', 'Pós-graduação', 'Especialização', 'Mestrado', 'Doutorado']
export const PRO_IDIOMAS = ['Português', 'Inglês', 'Espanhol', 'Francês', 'Italiano', 'Alemão', 'Libras']
export const PRO_NIVEIS_IDIOMA = ['Básico', 'Intermediário', 'Avançado', 'Fluente', 'Nativo']
export const PRO_DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

/* Vídeos de onboarding (ativação da conta) — playlist da Academia YNA. */
export interface ProOnboardingVideo { id: string; titulo: string; duracao: string; descricao: string; cover: 'lavender' | 'pink' | 'yellow' | 'teal' | 'blue' }
export const proOnboardingVideos: ProOnboardingVideo[] = [
  { id: 'ov1', titulo: 'Bem-vindo à YNA', duracao: '3:20', descricao: 'Missão, posicionamento e o que esperar da plataforma.', cover: 'lavender' },
  { id: 'ov2', titulo: 'Agenda, disponibilidade e sala de vídeo', duracao: '5:10', descricao: 'Como abrir horários e conduzir a sessão online.', cover: 'pink' },
  { id: 'ov3', titulo: 'Prontuário e conduta clínica online', duracao: '6:40', descricao: 'Boas práticas e o padrão YNA de registro.', cover: 'blue' },
  { id: 'ov4', titulo: 'Financeiro: repasses, NF e antecipação', duracao: '4:05', descricao: 'Como você recebe e emite suas notas fiscais.', cover: 'yellow' },
  { id: 'ov5', titulo: 'Emergências e plantão', duracao: '3:50', descricao: 'Protocolo de crise e acionamento do plantão.', cover: 'teal' },
]

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
