import type {
  RhEmpresa,
  RhUsuario,
  RhDepartamento,
  RhBeneficiario,
  RhFunilConvites,
  RhKpi,
  RhHeatRow,
  RhAlerta,
  RhNotificacao,
  RhBeneficiarioStatus,
} from '../types'

/* Dados mockados do fluxo RH / Empresa B2B. Isolados do beneficiário e do
   profissional — o RH só enxerga dados agregados e anonimizados (LGPD).
   Para a API real, ver src/services/rh.ts. */

/* "Hoje" de referência do protótipo (a empresa-piloto BCP Securities). */
export const RH_TODAY = '2026-06-25'

/* Conta corporativa — criada pelo backoffice YNA no kick-off (RF-RH-01.1). */
export const rhEmpresa: RhEmpresa = {
  razaoSocial: 'BCP Securities Brasil Ltda.',
  nomeFantasia: 'BCP Securities',
  cnpj: '34.812.097/0001-55',
  segmento: 'Serviços financeiros',
  contatoRh: 'Camila Risi · DHO',
  plano: 'Plano Base · Piloto',
  licencasContratadas: 200,
  contratoInicio: '2026-06-01',
  contratoFim: '2027-05-31',
  initials: 'BCP',
}

/* Usuário Master logado (RF-RH-01.2). */
export const rhUsuarioAtual: RhUsuario = {
  id: 'u-master',
  nome: 'Camila Risi',
  email: 'camila.risi@bcpsecurities.com',
  papel: 'master',
  initials: 'CR',
  palette: 'lavender',
  status: 'ativo',
  ultimoAcesso: '2026-06-25',
}

/* Equipe corporativa: Masters e Operadores (RF-RH-03.2). */
export const rhEquipe: RhUsuario[] = [
  rhUsuarioAtual,
  {
    id: 'u-master-2',
    nome: 'Eduardo Lemos',
    email: 'eduardo.lemos@bcpsecurities.com',
    papel: 'master',
    initials: 'EL',
    palette: 'pink',
    status: 'ativo',
    ultimoAcesso: '2026-06-24',
  },
  {
    id: 'u-op-1',
    nome: 'Patrícia Gomes',
    email: 'patricia.gomes@bcpsecurities.com',
    papel: 'operador',
    initials: 'PG',
    palette: 'yellow',
    status: 'ativo',
    ultimoAcesso: '2026-06-23',
  },
  {
    id: 'u-op-2',
    nome: 'Rafael Antunes',
    email: 'rafael.antunes@bcpsecurities.com',
    papel: 'operador',
    initials: 'RA',
    palette: 'lavender',
    status: 'convidado',
  },
]

/* Estrutura de departamentos (RF-RH-03.1) — base do mapa de calor NR-1. */
export const rhDepartamentos: RhDepartamento[] = [
  { id: 'd-trading', nome: 'Trading & Mercados', beneficiarios: 54 },
  { id: 'd-tech', nome: 'Tecnologia', beneficiarios: 48 },
  { id: 'd-ops', nome: 'Operações', beneficiarios: 41 },
  { id: 'd-compliance', nome: 'Compliance & Risco', beneficiarios: 22 },
  { id: 'd-rh', nome: 'Pessoas & DHO', beneficiarios: 9 },
  { id: 'd-diretoria', nome: 'Diretoria', beneficiarios: 3 }, // < 4 → anonimizado
]

const PALETTES: RhBeneficiario['palette'][] = ['lavender', 'pink', 'yellow']

/* Gera uma amostra de beneficiários para a lista do RH. A carga real é via
   planilha; aqui mockamos ~32 para a tela de gestão funcionar com filtros. */
const NOMES = [
  'Ana Beatriz Souza', 'Bruno Carvalho', 'Carla Menezes', 'Diego Ferreira',
  'Eduarda Lima', 'Felipe Ramos', 'Gabriela Nunes', 'Henrique Dias',
  'Isabela Castro', 'João Pedro Alves', 'Karina Tavares', 'Lucas Moreira',
  'Mariana Pires', 'Natália Rocha', 'Otávio Barros', 'Paula Andrade',
  'Quésia Martins', 'Rodrigo Vieira', 'Sofia Cardoso', 'Thiago Lopes',
  'Úrsula Freitas', 'Vinícius Melo', 'Wesley Pinto', 'Yasmin Costa',
  'Zé Carlos Brito', 'Amanda Reis', 'Bernardo Cunha', 'Clarice Sá',
  'Daniel Teixeira', 'Elaine Borges', 'Fábio Nogueira', 'Giovana Lacerda',
]

const STATUS_CICLO: RhBeneficiarioStatus[] = [
  'ativo', 'ativo', 'ativo', 'convidado', 'ativo', 'convidado',
  'nao_convidado', 'ativo', 'nao_convidado', 'ativo', 'convidado', 'ativo',
]

export const rhBeneficiarios: RhBeneficiario[] = NOMES.map((nome, i) => {
  const partes = nome.split(' ')
  const initials = (partes[0][0] + (partes[1]?.[0] ?? '')).toUpperCase()
  const dep = rhDepartamentos[i % rhDepartamentos.length]
  const status = STATUS_CICLO[i % STATUS_CICLO.length]
  const primeiroNome = partes[0].toLowerCase()
  const sobrenome = (partes[1] ?? 'bcp').toLowerCase().replace(/[^a-z]/g, '')
  return {
    id: `b-${i + 1}`,
    nomeCompleto: nome,
    cpfMascarado: `***.***.${String(100 + i).slice(-3)}-${String(10 + (i % 89)).slice(-2)}`,
    emailCorporativo: `${primeiroNome}.${sobrenome}@bcpsecurities.com`,
    departamentoId: dep.id,
    status,
    convidadoEm: status === 'nao_convidado' ? undefined : '2026-06-12',
    initials,
    palette: PALETTES[i % PALETTES.length],
  }
})

/* Funil de convites agregado (RF-RH-05.4) — totais sobre as 200 licenças. */
export const rhFunilConvites: RhFunilConvites = {
  enviado: 188,
  aberto: 161,
  cadastroIniciado: 142,
  cadastroConcluido: 127,
}

/* KPIs macro do dashboard (RF-RH-06.1). Todos agregados, sem identificação. */
export const rhKpis: RhKpi[] = [
  {
    key: 'adesao',
    label: 'Adesão ao benefício',
    value: '64%',
    delta: '+9 p.p. no mês',
    deltaTone: 'up',
    icon: 'ph:users-three-bold',
    hint: 'Beneficiários ativos sobre o total de licenças contratadas (127 de 200).',
  },
  {
    key: 'ativos',
    label: 'Beneficiários ativos',
    value: '127',
    delta: 'de 200 licenças',
    deltaTone: 'neutral',
    icon: 'ph:user-check-bold',
    hint: 'Quem concluiu o cadastro e tem acesso ativo à plataforma.',
  },
  {
    key: 'checkins',
    label: 'Check-ins respondidos',
    value: '58%',
    delta: '+4 p.p. no mês',
    deltaTone: 'up',
    icon: 'ph:heartbeat-bold',
    hint: 'Percentual agregado de beneficiários que respondem check-ins de bem-estar. Nunca individualizado.',
  },
  {
    key: 'bemestar',
    label: 'Índice de bem-estar',
    value: '7,1',
    delta: '+0,3 no mês',
    deltaTone: 'up',
    icon: 'ph:smiley-bold',
    hint: 'Média agregada (0–10) dos check-ins respondidos, com k-anonimato ≥ 4.',
  },
  {
    key: 'sessoes',
    label: 'Sessões realizadas',
    value: '342',
    delta: 'no trimestre',
    deltaTone: 'neutral',
    icon: 'ph:calendar-check-bold',
    hint: 'Volume total agregado de sessões concluídas pelos beneficiários.',
  },
  {
    key: 'nps',
    label: 'NPS da plataforma',
    value: '72',
    delta: '+5 no trimestre',
    deltaTone: 'up',
    icon: 'ph:star-bold',
    hint: 'Net Promoter Score agregado das avaliações da plataforma (YNA).',
  },
]

/* Mapa de calor por departamento × dimensão NR-1 (RF-RH-06.3).
   Dimensões na ordem das colunas de RH_DIMENSOES. nivel: 0 anonimizado,
   1 baixo, 2 médio, 3 alto. */
export const RH_DIMENSOES = ['Estresse', 'Burnout', 'Ansiedade', 'Sono', 'Carga de trabalho'] as const

export const rhHeatmap: RhHeatRow[] = [
  {
    departamentoId: 'd-trading',
    departamento: 'Trading & Mercados',
    beneficiarios: 54,
    anonimizado: false,
    celulas: [{ nivel: 3 }, { nivel: 3 }, { nivel: 2 }, { nivel: 2 }, { nivel: 3 }],
  },
  {
    departamentoId: 'd-tech',
    departamento: 'Tecnologia',
    beneficiarios: 48,
    anonimizado: false,
    celulas: [{ nivel: 2 }, { nivel: 2 }, { nivel: 2 }, { nivel: 1 }, { nivel: 2 }],
  },
  {
    departamentoId: 'd-ops',
    departamento: 'Operações',
    beneficiarios: 41,
    anonimizado: false,
    celulas: [{ nivel: 2 }, { nivel: 1 }, { nivel: 2 }, { nivel: 2 }, { nivel: 1 }],
  },
  {
    departamentoId: 'd-compliance',
    departamento: 'Compliance & Risco',
    beneficiarios: 22,
    anonimizado: false,
    celulas: [{ nivel: 1 }, { nivel: 1 }, { nivel: 2 }, { nivel: 1 }, { nivel: 1 }],
  },
  {
    departamentoId: 'd-rh',
    departamento: 'Pessoas & DHO',
    beneficiarios: 9,
    anonimizado: false,
    celulas: [{ nivel: 1 }, { nivel: 1 }, { nivel: 1 }, { nivel: 1 }, { nivel: 1 }],
  },
  {
    departamentoId: 'd-diretoria',
    departamento: 'Diretoria',
    beneficiarios: 3,
    anonimizado: true, // < 4 → bloqueado por k-anonimato
    celulas: [{ nivel: 0 }, { nivel: 0 }, { nivel: 0 }, { nivel: 0 }, { nivel: 0 }],
  },
]

/* Alertas de risco psicossocial (RF-RH-06.5). */
export const rhAlertas: RhAlerta[] = [
  {
    id: 'a-1',
    nivel: 'alto',
    departamento: 'Trading & Mercados',
    dimensao: 'Estresse / Burnout',
    mensagem: 'Indicadores agregados de estresse e burnout acima do limite no trimestre.',
    quando: 'há 2 dias',
  },
  {
    id: 'a-2',
    nivel: 'medio',
    departamento: 'Tecnologia',
    dimensao: 'Carga de trabalho',
    mensagem: 'Carga de trabalho percebida em tendência de alta nas últimas 4 semanas.',
    quando: 'há 5 dias',
  },
]

export const rhNotificacoes: RhNotificacao[] = [
  {
    id: 'n-1',
    tipo: 'nr1',
    icon: 'ph:warning-bold',
    titulo: 'Alerta NR-1 — Trading & Mercados',
    descricao: 'Risco psicossocial agregado elevado neste departamento.',
    quando: 'há 2 dias',
    lida: false,
  },
  {
    id: 'n-2',
    tipo: 'adesao',
    icon: 'ph:trend-up-bold',
    titulo: 'Adesão passou de 60%',
    descricao: '127 de 200 beneficiários já estão ativos na plataforma.',
    quando: 'há 3 dias',
    lida: false,
  },
]
