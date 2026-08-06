import type {
  RhEmpresa,
  RhUsuario,
  RhDepartamento,
  RhColaborador,
  RhFunilConvites,
  RhNotificacao,
  RhColaboradorStatus,
} from '../types'

/* Dados mockados do fluxo RH / Empresa B2B. Isolados do colaborador — o RH
   só enxerga dados agregados e anonimizados (LGPD). Para a API real, ver
   src/services/rh.ts. */

/* "Hoje" de referência do protótipo (a empresa-piloto BCP Securities). */
export const RH_TODAY = '2026-06-25'

/* Conta corporativa — criada pelo backoffice YNA no kick-off (RF-RH-01.1).
   `plano`/`colaboradoresContratados`/`contratoInicio`/`contratoFim` são só
   dado cadastral (§12): sem parcelas nem cobrança neste recorte. */
export const rhEmpresa: RhEmpresa = {
  razaoSocial: 'BCP Securities Brasil Ltda.',
  nomeFantasia: 'BCP Securities',
  cnpj: '34.812.097/0001-55',
  segmento: 'Serviços financeiros',
  contatoRh: 'Camila Risi · DHO',
  plano: 'Conformidade NR-1 · Piloto',
  colaboradoresContratados: 200,
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
  { id: 'd-trading', nome: 'Trading & Mercados', colaboradores: 54 },
  { id: 'd-tech', nome: 'Tecnologia', colaboradores: 48 },
  { id: 'd-ops', nome: 'Operações', colaboradores: 41 },
  { id: 'd-compliance', nome: 'Compliance & Risco', colaboradores: 22 },
  { id: 'd-rh', nome: 'Pessoas & DHO', colaboradores: 9 },
  { id: 'd-diretoria', nome: 'Diretoria', colaboradores: 3 }, // < 4 → anonimizado
]

const PALETTES: RhColaborador['palette'][] = ['lavender', 'pink', 'yellow']

/* Gera uma amostra de colaboradores para a lista do RH. A carga real é via
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

const STATUS_CICLO: RhColaboradorStatus[] = [
  'ativo', 'ativo', 'ativo', 'convidado', 'ativo', 'convidado',
  'nao_convidado', 'ativo', 'nao_convidado', 'ativo', 'convidado', 'ativo',
]

export const rhColaboradores: RhColaborador[] = NOMES.map((nome, i) => {
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

/* Funil de convites agregado (RF-RH-05.4) — totais sobre os 200 colaboradores
   contratados. */
export const rhFunilConvites: RhFunilConvites = {
  enviado: 188,
  aberto: 161,
  cadastroIniciado: 142,
  cadastroConcluido: 127,
}

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
    descricao: '127 de 200 colaboradores já estão ativos na plataforma.',
    quando: 'há 3 dias',
    lida: false,
  },
]
