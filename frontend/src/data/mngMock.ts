import type {
  MngGestor,
  MngEmpresa,
  MngParcela,
  MngParcelaFin,
  MngFunilConvites,
  MngProfissional,
  MngProfissionalDetalhe,
  MngSessao,
  MngMatch,
  MngConteudo,
  MngNota,
  MngTicket,
  MngDashboard,
  MngCockpit,
  MngCockpitFluxo,
  MngCockpitMes,
  MngPlano,
  MngNotificacao,
} from '../types'
import { proCadastroDemo } from './proMock'

/* Dados mockados do Manager / Backoffice YNA (Fluxo 4). Isolados dos demais
   perfis. Para a API real, ver src/services/mng.ts. */

export const MNG_TODAY = '2026-06-26'

/* Gestor logado (Super-Admin). */
export const mngGestorAtual: MngGestor = {
  id: 'g-1', nome: 'Adriana Küster', email: 'adriana@yna.com.br', perfil: 'super-admin',
  initials: 'AK', palette: 'lavender', status: 'ativo', mfa: true, ultimoAcesso: '2026-06-26',
}

export const mngGestores: MngGestor[] = [
  mngGestorAtual,
  { id: 'g-2', nome: 'Fernanda Rocha', email: 'fernanda@yna.com.br', perfil: 'comercial', initials: 'FR', palette: 'pink', status: 'ativo', mfa: true, ultimoAcesso: '2026-06-25' },
  { id: 'g-3', nome: 'Virgínia Sales', email: 'virginia@yna.com.br', perfil: 'clinico', initials: 'VS', palette: 'yellow', status: 'ativo', mfa: true, ultimoAcesso: '2026-06-24' },
  { id: 'g-4', nome: 'Marina Teles', email: 'marina@yna.com.br', perfil: 'conteudo', initials: 'MT', palette: 'lavender', status: 'convidado', mfa: false },
  { id: 'g-5', nome: 'Paulo Reis', email: 'paulo@yna.com.br', perfil: 'suporte', initials: 'PR', palette: 'pink', status: 'ativo', mfa: true, ultimoAcesso: '2026-06-26' },
  { id: 'g-6', nome: 'Rodrigo Salles', email: 'rodrigo@yna.com.br', perfil: 'comercial', initials: 'RS', palette: 'lavender', status: 'ativo', mfa: true, ultimoAcesso: '2026-06-26' },
]

/** Gestores que podem ser CSM de uma empresa (perfil comercial). */
export const mngCsms = () => mngGestores.filter((g) => g.perfil === 'comercial')

/* Gera TODAS as parcelas mensais do contrato (início → fim). Passadas ficam
   pagas com NF; futuras pendentes (link para anexar NF). `atrasadas` marca as N
   parcelas passadas mais recentes como "vencida" (em atraso, sem NF).
   Retorna da mais recente para a mais antiga. */
export function gerarParcelas(inicio: string, fim: string, valorMensal: number, atrasadas = 0): MngParcela[] {
  const [iy, im, idia] = inicio.split('-').map(Number)
  const [fy, fm] = fim.split('-').map(Number)
  const total = (fy - iy) * 12 + (fm - im) + 1
  const dia = String(idia).padStart(2, '0')
  const out: MngParcela[] = []
  for (let idx = 0; idx < total; idx++) {
    const mm = im + idx
    const yy = iy + Math.floor((mm - 1) / 12)
    const month = ((mm - 1) % 12) + 1
    const venc = `${yy}-${String(month).padStart(2, '0')}-${dia}`
    const passada = venc < MNG_TODAY
    out.push({
      id: `${inicio}-${idx}`, numero: idx + 1, vencimento: venc, valor: valorMensal,
      status: passada ? 'paga' : 'pendente',
      notaFiscal: passada ? `nf-${yy}-${String(month).padStart(2, '0')}.pdf` : undefined,
    })
  }
  // Parcela vencida = NF já emitida, porém não paga (mantém a NF para download).
  const passadas = out.filter((p) => p.status === 'paga')
  for (let k = 0; k < atrasadas && k < passadas.length; k++) {
    passadas[passadas.length - 1 - k].status = 'vencida'
  }
  return out.reverse()
}

/* Gera parcelas conforme o modelo de pagamento (à vista = 1 parcela; parcelado
   = N mensais), no dia de vencimento escolhido, a partir do início do contrato. */
export function gerarParcelasPagamento(inicio: string, dia: number, valorTotal: number, num: number): MngParcela[] {
  const [iy, im] = inicio.split('-').map(Number)
  const d = String(Math.min(28, Math.max(1, dia || 1))).padStart(2, '0')
  const valorParcela = Math.round(valorTotal / Math.max(1, num))
  const out: MngParcela[] = []
  for (let idx = 0; idx < num; idx++) {
    const mm = im + idx
    const yy = iy + Math.floor((mm - 1) / 12)
    const month = ((mm - 1) % 12) + 1
    const venc = `${yy}-${String(month).padStart(2, '0')}-${d}`
    const passada = venc < MNG_TODAY
    out.push({
      id: `${inicio}-pg${idx}`, numero: idx + 1, vencimento: venc, valor: valorParcela,
      status: passada ? 'paga' : 'pendente',
      notaFiscal: passada ? `nf-${yy}-${String(month).padStart(2, '0')}.pdf` : undefined,
    })
  }
  return out.reverse()
}

/* Planos disponíveis + nº de licenças sugerido (carregado ao selecionar o plano). */
export const PLANOS = ['Plano Base', 'Plano Base · Piloto', 'Plano Care · Corporativo']
export const PLANO_LICENCAS: Record<string, number> = {
  'Plano Base': 50, 'Plano Base · Piloto': 80, 'Plano Care · Corporativo': 150,
}

/* Funil de convites plausível: afunila de "enviado" até "concluído" (= ativos). */
const funil = (enviado: number, concluido: number): MngFunilConvites => ({
  enviado, aberto: Math.round(enviado * 0.82), cadastroIniciado: Math.round(enviado * 0.72), cadastroConcluido: concluido,
})

export const PERFIL_GESTOR_LABEL: Record<MngGestor['perfil'], string> = {
  'super-admin': 'Super-Admin', comercial: 'Comercial / CSM', profissionais: 'Gestor de Profissionais',
  clinico: 'Gestor Clínico', conteudo: 'Gestor de Conteúdo', suporte: 'Atendente / Suporte', branding: 'Branding',
}

/* Empresas + contratos (§8.4). */
export const mngEmpresas: MngEmpresa[] = [
  {
    id: 'e-1', razaoSocial: 'BCP Securities Brasil Ltda.', nomeFantasia: 'BCP Securities', cnpj: '34.812.097/0001-55',
    segmento: 'Serviços financeiros', contatoRh: 'Camila Risi · DHO', status: 'ativa', licencas: 200, beneficiariosAtivos: 137, initials: 'BCP',
    contratos: [
      { id: 'c-1b', plano: 'Plano Care · Corporativo', valorMensal: 9000, valorTotal: 108000, licencas: 200, inicio: '2026-06-01', fim: '2027-05-31', arquivo: 'contrato-bcp-2026.pdf', status: 'vigente', execucaoPct: 8 },
      { id: 'c-1a', plano: 'Plano Base · Piloto', valorMensal: 6000, valorTotal: 72000, licencas: 120, inicio: '2025-06-01', fim: '2026-05-31', arquivo: 'contrato-bcp-2025.pdf', status: 'encerrado', execucaoPct: 100 },
    ],
    masters: [{ nome: 'Camila Risi', email: 'camila.risi@bcpsecurities.com', telefone: '(11) 98812-4431' }],
    csmId: 'g-2', funil: funil(200, 137), parcelas: gerarParcelas('2026-06-01', '2027-05-31', 9000),
  },
  {
    id: 'e-2', razaoSocial: 'Nova Vita Saúde S.A.', nomeFantasia: 'Nova Vita', cnpj: '12.334.556/0001-08',
    segmento: 'Saúde', contatoRh: 'Rafael Lopes · RH', status: 'ativa', licencas: 80, beneficiariosAtivos: 0, initials: 'NV',
    contratos: [
      { id: 'c-2', plano: 'Plano Base · Piloto', valorMensal: 4000, valorTotal: 48000, licencas: 80, inicio: '2026-06-20', fim: '2027-06-19', arquivo: 'contrato-novavita.pdf', status: 'vigente', execucaoPct: 2 },
    ],
    masters: [{ nome: 'Rafael Lopes', email: 'rafael.lopes@novavita.com.br', telefone: '(21) 99120-8890' }],
    csmId: 'g-6', funil: funil(40, 0), parcelas: gerarParcelas('2026-06-20', '2027-06-19', 4000),
  },
  {
    id: 'e-3', razaoSocial: 'Atlas Engenharia Ltda.', nomeFantasia: 'Atlas', cnpj: '55.201.884/0001-31',
    segmento: 'Engenharia', contatoRh: 'Sandra Muniz · DHO', status: 'bloqueada', licencas: 150, beneficiariosAtivos: 92, initials: 'AT',
    contratos: [
      { id: 'c-3', plano: 'Plano Care · Corporativo', valorMensal: 7500, valorTotal: 90000, licencas: 150, inicio: '2026-02-01', fim: '2027-01-31', arquivo: 'contrato-atlas.pdf', status: 'vigente', execucaoPct: 42 },
    ],
    masters: [{ nome: 'Sandra Muniz', email: 'sandra.muniz@atlaseng.com.br', telefone: '(11) 97654-2201' }],
    csmId: 'g-2', funil: funil(150, 92), parcelas: gerarParcelas('2026-02-01', '2027-01-31', 7500),
  },
  {
    id: 'e-4', razaoSocial: 'Orla Varejo S.A.', nomeFantasia: 'Orla', cnpj: '09.887.120/0001-77',
    segmento: 'Varejo', contatoRh: 'Diego Antunes · RH', status: 'ativa', licencas: 100, beneficiariosAtivos: 41, initials: 'OR',
    contratos: [
      { id: 'c-4', plano: 'Plano Base', valorMensal: 5000, valorTotal: 60000, licencas: 100, inicio: '2025-07-01', fim: '2026-06-30', arquivo: 'contrato-orla.pdf', status: 'vigente', execucaoPct: 97 },
    ],
    masters: [{ nome: 'Diego Antunes', email: 'diego.antunes@orlavarejo.com.br', telefone: '(11) 96543-1120' }],
    csmId: 'g-6', funil: funil(100, 41), parcelas: gerarParcelas('2025-07-01', '2026-06-30', 5000),
  },
  // Exemplo — contrato VERDE (> 180 dias para o término).
  {
    id: 'e-5', razaoSocial: 'Vértice Tecnologia Ltda.', nomeFantasia: 'Vértice Tech', cnpj: '21.554.008/0001-46',
    segmento: 'Tecnologia', contatoRh: 'Helena Marques · RH', status: 'ativa', licencas: 90, beneficiariosAtivos: 21, initials: 'VT',
    contratos: [
      { id: 'c-5', plano: 'Plano Base', valorMensal: 4500, valorTotal: 72000, licencas: 90, inicio: '2026-06-01', fim: '2027-09-30', arquivo: 'contrato-vertice.pdf', status: 'vigente', execucaoPct: 5 },
    ],
    masters: [{ nome: 'Helena Marques', email: 'helena.marques@verticetech.com.br', telefone: '(11) 98330-7742' }],
    csmId: 'g-2', funil: funil(90, 21), parcelas: gerarParcelas('2026-06-01', '2027-09-30', 4500),
  },
  // Exemplo — contrato AMARELO (91–180 dias para o término).
  {
    id: 'e-6', razaoSocial: 'Meridiano Logística S.A.', nomeFantasia: 'Meridiano Log', cnpj: '30.118.472/0001-09',
    segmento: 'Logística', contatoRh: 'Paulo Ferraz · DHO', status: 'ativa', licencas: 120, beneficiariosAtivos: 63, initials: 'ML',
    contratos: [
      { id: 'c-6', plano: 'Plano Care · Corporativo', valorMensal: 6000, valorTotal: 72000, licencas: 120, inicio: '2025-12-06', fim: '2026-12-05', arquivo: 'contrato-meridiano.pdf', status: 'vigente', execucaoPct: 56 },
    ],
    masters: [{ nome: 'Paulo Ferraz', email: 'paulo.ferraz@meridianolog.com.br', telefone: '(11) 99887-3320' }],
    csmId: 'g-6', funil: funil(120, 63), parcelas: gerarParcelas('2025-12-06', '2026-12-05', 6000, 1),
  },
  // Exemplo — contrato VERMELHO (≤ 90 dias para o término).
  {
    id: 'e-7', razaoSocial: 'Solaris Energia S.A.', nomeFantasia: 'Solaris', cnpj: '44.902.318/0001-72',
    segmento: 'Energia', contatoRh: 'Renata Lima · RH', status: 'ativa', licencas: 110, beneficiariosAtivos: 88, initials: 'SO',
    contratos: [
      { id: 'c-7', plano: 'Plano Base', valorMensal: 5500, valorTotal: 66000, licencas: 110, inicio: '2025-08-21', fim: '2026-08-20', arquivo: 'contrato-solaris.pdf', status: 'vigente', execucaoPct: 85 },
    ],
    masters: [{ nome: 'Renata Lima', email: 'renata.lima@solarisenergia.com.br', telefone: '(11) 98221-0099' }],
    csmId: 'g-2', funil: funil(110, 88), parcelas: gerarParcelas('2025-08-21', '2026-08-20', 5500, 1),
  },
]

export const EMPRESA_STATUS_LABEL: Record<MngEmpresa['status'], string> = {
  ativa: 'Ativo', bloqueada: 'Bloqueado', inativa: 'Inativo',
}

/* Segmentos de mercado das empresas (select de cadastro/edição). */
export const SEGMENTOS = [
  'Serviços financeiros', 'Saúde', 'Engenharia', 'Varejo', 'Tecnologia', 'Logística',
  'Energia', 'Indústria', 'Educação', 'Telecomunicações', 'Governo', 'Outro',
]

/* Tipos de profissional (§8.5) — definidos no módulo neutro compartilhado. */
export { mngTiposProfissional } from './tiposProfissional'

/* Profissionais (§8.5). */
export const mngProfissionais: MngProfissional[] = [
  { id: 'p-1', nome: 'Mariana Lopes', tipo: 'psicologo', tipoLabel: 'Psicólogo', conselho: 'CRP 06/128443', uf: 'SP', email: 'mariana@ex.com', status: 'ativo', initials: 'ML', palette: 'lavender', linhasTeoricas: ['TCC'], clientesRecorrentes: 18, sessoesRealizadas: 214, qualidadeGeral: 94, avaliacao: 4.9 },
  { id: 'p-2', nome: 'André Fontes', tipo: 'psicologo', tipoLabel: 'Psicólogo', conselho: 'CRP 04/094112', uf: 'MG', email: 'andre@ex.com', status: 'ativo', initials: 'AF', palette: 'pink', linhasTeoricas: ['TCC', 'ACT'], clientesRecorrentes: 12, sessoesRealizadas: 156, qualidadeGeral: 88, avaliacao: 4.7 },
  { id: 'p-5', nome: 'Sofia Prado', tipo: 'psicologo', tipoLabel: 'Psicólogo', conselho: 'CRP 06/143902', uf: 'SP', email: 'sofia@ex.com', status: 'ativo', initials: 'SP', palette: 'pink', linhasTeoricas: ['Integrativa'], clientesRecorrentes: 9, sessoesRealizadas: 98, qualidadeGeral: 90, avaliacao: 4.8 },
  { id: 'p-3', nome: 'Beatriz Nunes', tipo: 'psicologo', tipoLabel: 'Psicólogo', conselho: 'CRP 05/201880', uf: 'RJ', email: 'beatriz@ex.com', status: 'para-analise', initials: 'BN', palette: 'yellow', linhasTeoricas: ['Psicanálise'], clientesRecorrentes: 0, sessoesRealizadas: 0, qualidadeGeral: 0, avaliacao: 0 },
  { id: 'p-8', nome: 'Lucas Moreira', tipo: 'psicologo', tipoLabel: 'Psicólogo', conselho: 'CRP 07/090233', uf: 'RS', email: 'lucas@ex.com', status: 'para-analise', initials: 'LM', palette: 'lavender', linhasTeoricas: ['Gestalt'], clientesRecorrentes: 0, sessoesRealizadas: 0, qualidadeGeral: 0, avaliacao: 0 },
  { id: 'p-4', nome: 'Carlos Vidal', tipo: 'psicologo', tipoLabel: 'Psicólogo', conselho: 'CRP 08/077231', uf: 'PR', email: 'carlos@ex.com', status: 'em-analise', initials: 'CV', palette: 'lavender', linhasTeoricas: ['Sistêmica'], clientesRecorrentes: 0, sessoesRealizadas: 0, qualidadeGeral: 0, avaliacao: 0 },
  { id: 'p-7', nome: 'Tiago Mota', tipo: 'psicologo', tipoLabel: 'Psicólogo', conselho: 'CRP 04/061200', uf: 'MG', email: 'tiago@ex.com', status: 'reprovado', initials: 'TM', palette: 'yellow', linhasTeoricas: ['TCC'], clientesRecorrentes: 0, sessoesRealizadas: 0, qualidadeGeral: 0, avaliacao: 0 },
  { id: 'p-6', nome: 'Rafael Dias', tipo: 'psicologo', tipoLabel: 'Psicólogo', conselho: 'CRP 09/051220', uf: 'PE', email: 'rafael@ex.com', status: 'inativo', initials: 'RD', palette: 'yellow', linhasTeoricas: ['TCC'], clientesRecorrentes: 0, sessoesRealizadas: 63, qualidadeGeral: 82, avaliacao: 4.5 },
]

/* Linhas teóricas disponíveis (select de cadastro do profissional). */
export const LINHAS_TERAPEUTICAS = ['TCC', 'ACT', 'Psicanálise', 'Gestalt', 'Sistêmica', 'Integrativa', 'Humanista', 'Comportamental']

const detalheBase = (p: MngProfissional): MngProfissionalDetalhe => ({
  ...p, crpUf: p.uf,
  bio: 'Psicóloga clínica com foco em ansiedade e processos de transição de carreira. Abordagem integrativa.',
  formacao: ['Graduação em Psicologia — USP', 'Especialização em TCC — PUC'],
  cnpj: '48.902.115/0001-20', banco: 'Nubank · Ag. 0001 · CC 88213-4',
  // Cadastro completo (mesmos 5 steps do fluxo do profissional), personalizado com os dados do profissional.
  cadastro: { ...proCadastroDemo, nomeCompleto: p.nome, email: p.email },
  historicoSessoes: [
    { id: 's-a', data: '2026-06-24', hora: '09:00', status: 'realizada', entrada: '09:01', termino: '09:52', duracaoMin: 51, atrasoMin: 1 },
    { id: 's-b', data: '2026-06-24', hora: '10:00', status: 'realizada', entrada: '10:07', termino: '10:55', duracaoMin: 48, atrasoMin: 7 },
    { id: 's-c', data: '2026-06-23', hora: '14:00', status: 'nao-realizada', ausente: 'beneficiario' },
    { id: 's-f', data: '2026-06-23', hora: '15:00', status: 'nao-realizada', ausente: 'profissional' },
    { id: 's-d', data: '2026-06-22', hora: '11:00', status: 'cancelada', cancelamento: { em: '2026-06-21T18:32', por: 'beneficiario', motivo: 'Imprevisto de última hora; remarcou para a semana seguinte.' } },
    { id: 's-e', data: '2026-06-22', hora: '16:00', status: 'realizada', entrada: '16:00', termino: '16:50', duracaoMin: 50, atrasoMin: 0 },
  ],
  qualidade: [
    { criterio: 'Assiduidade', score: 96 }, { criterio: 'Pontualidade', score: 88 },
    { criterio: 'Volume de atendimentos', score: 92 }, { criterio: 'Disponibilidade aberta', score: 74 },
  ],
  financeiro: {
    saldoAPagar: 1200,
    totalPago: 18450,
    extrato: [
      { id: `${p.id}-ex1`, data: '2026-06-24', tipo: 'sessao', valor: 150, saldo: 1200 },
      { id: `${p.id}-ex2`, data: '2026-06-22', tipo: 'sessao', valor: 150, saldo: 1050 },
      { id: `${p.id}-ex3`, data: '2026-06-20', tipo: 'resgate', valor: 900, saldo: 900 },
      { id: `${p.id}-ex4`, data: '2026-06-18', tipo: 'sessao', valor: 150, saldo: 1800 },
      { id: `${p.id}-ex5`, data: '2026-06-15', tipo: 'sessao', valor: 150, saldo: 1650 },
      { id: `${p.id}-ex6`, data: '2026-06-12', tipo: 'sessao', valor: 150, saldo: 1500 },
    ],
    notas: mngNotas.filter((n) => n.profissional === p.nome),
  },
})
export const mngProfissionalDetalhe = (id: string): MngProfissionalDetalhe | undefined => {
  const p = mngProfissionais.find((x) => x.id === id)
  return p ? detalheBase(p) : undefined
}

export const PROF_STATUS_LABEL: Record<MngProfissional['status'], string> = {
  ativo: 'Ativo', 'para-analise': 'Para análise', 'em-analise': 'Em análise', reprovado: 'Reprovado', inativo: 'Inativo',
}

/* Painel de sessões (§8.11). */
export const mngSessoes: MngSessao[] = [
  { id: 'ms-1', profissional: 'Mariana Lopes', profissionalInitials: 'ML', palette: 'lavender', tipoLabel: 'Psicólogo', empresa: 'Nova Vita', data: '2026-06-26', inicio: '09:00', fim: '09:52', atrasoMin: 1, duracaoMin: 51, status: 'realizada' },
  { id: 'ms-2', profissional: 'André Fontes', profissionalInitials: 'AF', palette: 'pink', tipoLabel: 'Psicólogo', empresa: 'Atlas', data: '2026-06-26', inicio: '10:00', fim: '10:55', atrasoMin: 7, duracaoMin: 48, status: 'realizada' },
  { id: 'ms-3', profissional: 'Sofia Prado', profissionalInitials: 'SP', palette: 'pink', tipoLabel: 'Psicólogo', empresa: 'Vértice Tech', data: '2026-06-26', inicio: '11:00', atrasoMin: 0, status: 'agendada' },
  { id: 'ms-4', profissional: 'Mariana Lopes', profissionalInitials: 'ML', palette: 'lavender', tipoLabel: 'Psicólogo', empresa: 'Orla', data: '2026-06-26', inicio: '14:00', atrasoMin: 0, status: 'nao-realizada' },
  { id: 'ms-5', profissional: 'André Fontes', profissionalInitials: 'AF', palette: 'pink', tipoLabel: 'Psicólogo', empresa: 'Nova Vita', data: '2026-06-25', inicio: '15:00', atrasoMin: 0, status: 'cancelada', cancelamento: { em: '2026-06-24T21:10', por: 'profissional', motivo: 'Emergência de saúde do profissional; sessão remarcada.' } },
  { id: 'ms-6', profissional: 'Sofia Prado', profissionalInitials: 'SP', palette: 'pink', tipoLabel: 'Psicólogo', empresa: 'Atlas', data: '2026-06-25', inicio: '16:00', fim: '16:49', atrasoMin: 3, duracaoMin: 46, status: 'realizada' },
  { id: 'ms-7', profissional: 'Mariana Lopes', profissionalInitials: 'ML', palette: 'lavender', tipoLabel: 'Psicólogo', empresa: 'Vértice Tech', data: '2026-06-25', inicio: '17:00', fim: '17:50', atrasoMin: 0, duracaoMin: 50, status: 'realizada' },
  { id: 'ms-8', profissional: 'André Fontes', profissionalInitials: 'AF', palette: 'pink', tipoLabel: 'Psicólogo', empresa: 'Orla', data: '2026-06-24', inicio: '09:00', atrasoMin: 0, status: 'agendada' },
]

/* Curadoria informativa de matches (§8.6). */
export const mngMatches: MngMatch[] = [
  {
    id: 'mt-1', beneficiario: 'Beija-flor', quando: 'há 2 horas',
    triagem: [
      { pergunta: 'O que te traz agora?', resposta: 'Ansiedade e sobrecarga no trabalho' },
      { pergunta: 'Preferência de abordagem', resposta: 'Prática, com ferramentas' },
    ],
    sugeridos: [
      { nome: 'Mariana Lopes', abordagem: 'TCC', aderencia: 94 },
      { nome: 'André Fontes', abordagem: 'TCC', aderencia: 88 },
      { nome: 'Sofia Prado', abordagem: 'Integrativa', aderencia: 81 },
    ],
  },
  {
    id: 'mt-2', beneficiario: 'Cedro', quando: 'há 5 horas',
    triagem: [
      { pergunta: 'O que te traz agora?', resposta: 'Luto recente' },
      { pergunta: 'Preferência de abordagem', resposta: 'Acolhimento e escuta' },
    ],
    sugeridos: [
      { nome: 'Sofia Prado', abordagem: 'Integrativa', aderencia: 91 },
      { nome: 'Mariana Lopes', abordagem: 'TCC', aderencia: 79 },
      { nome: 'André Fontes', abordagem: 'TCC', aderencia: 72 },
    ],
  },
]

/* Academia — CMS (§8.7). Cursos, lives e artigos, cada um com cadastro próprio. */
export const ACADEMIA_TEMAS = ['Prática clínica', 'Abordagens', 'Conduta', 'Temas clínicos', 'Segurança do paciente', 'Carreira', 'Integração']
export const ACADEMIA_TRILHAS = ['Atendimento online', 'Segurança do paciente', 'TCC', 'Conduta', 'Temas clínicos', 'Terceira onda', 'Carreira', 'Integração']

export const mngConteudos: MngConteudo[] = [
  { id: 'ct-1', tipo: 'curso', titulo: 'Clínica online com qualidade', status: 'publicado', publicoTipos: [], atualizadoEm: '2026-06-20',
    autor: 'Virgínia Toledo', descricao: 'Boas práticas para conduzir sessões por vídeo com presença e segurança.', tema: 'Prática clínica', trilha: 'Atendimento online', nivel: 'intermediario', cover: 'lavender', capaImagem: 'capa-clinica-online.jpg',
    aulas: [
      { id: 'a1', titulo: 'Setup e enquadre do consultório online', duracaoMin: 12, autor: 'Virgínia Toledo', descricao: 'Câmera, luz, áudio e ambiente reservado.', video: 'aula-1-setup.mp4', materiais: ['checklist-setup.pdf'] },
      { id: 'a2', titulo: 'Presença terapêutica pela tela', duracaoMin: 14, autor: 'Virgínia Toledo', descricao: 'Como sustentar vínculo e presença no vídeo.', video: 'aula-2-presenca.mp4' },
      { id: 'a3', titulo: 'Manejo de silêncios e ruídos', duracaoMin: 10, autor: 'Virgínia Toledo', video: 'aula-3-silencios.mp4' },
    ],
    materiais: ['guia-clinica-online.pdf', 'modelo-contrato-terapeutico.docx'],
    metrics: { visualizacoes: 1840, alcance: 420, conclusaoPct: 63, avaliacao: 4.7, engajamento: 72 } },
  { id: 'ct-2', tipo: 'curso', titulo: 'Manejo de risco e crise', status: 'publicado', publicoTipos: ['psicologo'], atualizadoEm: '2026-06-12',
    autor: 'Andrea Lima', descricao: 'Avaliação de risco, condutas e encaminhamentos em situações de crise.', tema: 'Segurança do paciente', trilha: 'Segurança do paciente', nivel: 'avancado', cover: 'pink',
    aulas: [
      { id: 'a1', titulo: 'Fatores de risco e proteção', duracaoMin: 15 },
      { id: 'a2', titulo: 'Entrevista de avaliação de risco', duracaoMin: 18 },
      { id: 'a3', titulo: 'Plano de segurança e encaminhamento', duracaoMin: 16 },
    ],
    metrics: { visualizacoes: 1220, alcance: 310, conclusaoPct: 58, avaliacao: 4.8, engajamento: 64 } },
  { id: 'ct-3', tipo: 'curso', titulo: 'Escuta ativa', status: 'arquivado', publicoTipos: [], atualizadoEm: '2026-04-30',
    autor: 'Rafael Souza', descricao: 'Fundamentos da escuta terapêutica e validação emocional.', tema: 'Abordagens', trilha: 'Atendimento online', nivel: 'iniciante', cover: 'teal',
    aulas: [{ id: 'a1', titulo: 'Escuta sem julgamento', duracaoMin: 9 }, { id: 'a2', titulo: 'Reflexão e paráfrase', duracaoMin: 11 }],
    metrics: { visualizacoes: 3100, alcance: 640, conclusaoPct: 88, avaliacao: 4.6, engajamento: 88 } },

  { id: 'ct-4', tipo: 'live', titulo: 'Plantão clínico: manejo de ansiedade', status: 'publicado', publicoTipos: ['psicologo'], atualizadoEm: '2026-06-24',
    categoria: 'conteudo', palestrante: 'Virgínia Toledo (YNA)', descricao: 'Discussão ao vivo de condutas no manejo de quadros ansiosos, com espaço para perguntas.', data: '2026-06-25', horario: '19:00', duracaoMin: 60, transmissao: 'agendada',
    metrics: { visualizacoes: 213, alcance: 340, conclusaoPct: 62, espectadoresPico: 213, engajamento: 58 } },
  { id: 'ct-5', tipo: 'live', titulo: 'Supervisão de junho — casos complexos', status: 'rascunho', publicoTipos: ['psicologo'], atualizadoEm: '2026-06-24',
    categoria: 'supervisao', palestrante: 'Andrea (YNA)', descricao: 'Discussão de casos clínicos com troca entre pares.', data: '2026-07-05', horario: '19:00', duracaoMin: 90, transmissao: 'agendada',
    metrics: { visualizacoes: 0, alcance: 0, conclusaoPct: 0, espectadoresPico: 0, engajamento: 0 } },
  { id: 'ct-6', tipo: 'live', titulo: 'Abertura da Academia YNA', status: 'publicado', publicoTipos: [], atualizadoEm: '2026-06-02',
    categoria: 'conteudo', palestrante: 'Equipe YNA', descricao: 'A aula inaugural da Academia YNA.', data: '2026-06-01', horario: '20:00', duracaoMin: 75, transmissao: 'replay',
    metrics: { visualizacoes: 980, alcance: 720, conclusaoPct: 71, espectadoresPico: 512, engajamento: 69 } },

  { id: 'ct-7', tipo: 'artigo', titulo: 'Como estruturar a primeira sessão online', status: 'publicado', publicoTipos: [], atualizadoEm: '2026-06-23',
    subheadline: 'Um roteiro prático para acolher e construir vínculo já no primeiro encontro.', autor: 'Virgínia Toledo', tema: 'Prática clínica', tempoLeituraMin: 6, imagem: 'lavender', capaImagem: 'capa-primeira-sessao.jpg',
    corpo: [
      { id: 'b1', tipo: 'paragrafo', texto: 'A primeira sessão é um dos momentos mais decisivos de todo o processo terapêutico. Mais do que coletar informações, o objetivo central é construir vínculo e oferecer acolhimento.' },
      { id: 'b2', tipo: 'subtitulo', texto: 'Antes de começar: o setup importa' },
      { id: 'b3', tipo: 'imagem', cor: 'teal', arquivo: 'ambiente-reservado.jpg', legenda: 'Um ambiente reservado e bem iluminado transmite segurança.' },
      { id: 'b4', tipo: 'paragrafo', texto: 'Dedique os primeiros minutos a explicar como o trabalho vai funcionar e combine o enquadre: frequência, duração, sigilo e política de faltas.' },
      { id: 'b5', tipo: 'video', titulo: 'Demonstração: conduzindo o acolhimento inicial', arquivo: 'demo-acolhimento.mp4', duracao: '6 min' },
    ],
    metrics: { visualizacoes: 2450, alcance: 2450, conclusaoPct: 74, avaliacao: 4.5, engajamento: 61 } },
  { id: 'ct-8', tipo: 'artigo', titulo: 'CID-10 na prática clínica', status: 'publicado', publicoTipos: ['psicologo'], atualizadoEm: '2026-06-08',
    subheadline: 'Um guia objetivo para navegar os códigos mais frequentes na clínica.', autor: 'Andrea Lima', tema: 'Conduta', tempoLeituraMin: 8, imagem: 'blue',
    corpo: [
      { id: 'b1', tipo: 'paragrafo', texto: 'O CID-10 é uma ferramenta de comunicação entre profissionais e de organização do raciocínio clínico.' },
      { id: 'b2', tipo: 'citacao', texto: 'Use o CID como hipótese, não como rótulo.', fonte: 'Boas práticas clínicas' },
      { id: 'b3', tipo: 'lista', itens: ['Revise a hipótese ao longo do acompanhamento.', 'Registre no prontuário com cautela e sigilo.'] },
    ],
    metrics: { visualizacoes: 1670, alcance: 1670, conclusaoPct: 55, avaliacao: 4.3, engajamento: 55 } },
]

/* Financeiro das empresas — parcelas dos contratos (§8.13). MNG_TODAY = 2026-06-26. */
export const mngParcelasFin: MngParcelaFin[] = [
  { id: 'pf-1', empresaId: 'e-3', razaoSocial: 'Atlas Engenharia Ltda.', nomeFantasia: 'Atlas', cnpj: '55.201.884/0001-31', contrato: 'Plano Care · Corporativo', numero: 5, totalParcelas: 12, valor: 7500, vencimento: '2026-05-10', status: 'atrasada' },
  { id: 'pf-2', empresaId: 'e-1', razaoSocial: 'BCP Securities Brasil Ltda.', nomeFantasia: 'BCP Securities', cnpj: '34.812.097/0001-55', contrato: 'Plano Care · Enterprise', numero: 3, totalParcelas: 12, valor: 12000, vencimento: '2026-05-20', status: 'paga', notaFiscal: 'nf-bcp-003.pdf', dataPagamento: '2026-05-19', valorPago: 12000 },
  { id: 'pf-3', empresaId: 'e-2', razaoSocial: 'Nova Vita Saúde S.A.', nomeFantasia: 'Nova Vita', cnpj: '12.334.556/0001-08', contrato: 'Plano Care · Corporativo', numero: 6, totalParcelas: 12, valor: 9000, vencimento: '2026-06-05', status: 'paga', notaFiscal: 'nf-novavita-006.pdf', dataPagamento: '2026-06-04', valorPago: 9000 },
  { id: 'pf-4', empresaId: 'e-4', razaoSocial: 'Orla Varejo S.A.', nomeFantasia: 'Orla', cnpj: '09.887.120/0001-77', contrato: 'Plano Care · Pro', numero: 2, totalParcelas: 6, valor: 5200, vencimento: '2026-06-15', status: 'atrasada', notaFiscal: 'nf-orla-002.pdf', boleto: 'boleto-orla-002.pdf' },
  { id: 'pf-5', empresaId: 'e-3', razaoSocial: 'Atlas Engenharia Ltda.', nomeFantasia: 'Atlas', cnpj: '55.201.884/0001-31', contrato: 'Plano Care · Corporativo', numero: 6, totalParcelas: 12, valor: 7500, vencimento: '2026-06-10', status: 'emitida', notaFiscal: 'nf-atlas-006.pdf', boleto: 'boleto-atlas-006.pdf' },
  { id: 'pf-6', empresaId: 'e-5', razaoSocial: 'Vértice Tecnologia Ltda.', nomeFantasia: 'Vértice Tech', cnpj: '21.554.008/0001-46', contrato: 'Plano Care · Pro', numero: 4, totalParcelas: 12, valor: 6800, vencimento: '2026-06-30', status: 'emitida', notaFiscal: 'nf-vertice-004.pdf', boleto: 'boleto-vertice-004.pdf' },
  { id: 'pf-7', empresaId: 'e-2', razaoSocial: 'Nova Vita Saúde S.A.', nomeFantasia: 'Nova Vita', cnpj: '12.334.556/0001-08', contrato: 'Plano Care · Corporativo', numero: 7, totalParcelas: 12, valor: 9000, vencimento: '2026-07-05', status: 'pendente-emissao' },
  { id: 'pf-8', empresaId: 'e-6', razaoSocial: 'Meridiano Logística S.A.', nomeFantasia: 'Meridiano Log', cnpj: '30.118.472/0001-09', contrato: 'Plano Care · Pro', numero: 3, totalParcelas: 6, valor: 4000, vencimento: '2026-07-08', status: 'pendente-emissao' },
  { id: 'pf-9', empresaId: 'e-3', razaoSocial: 'Atlas Engenharia Ltda.', nomeFantasia: 'Atlas', cnpj: '55.201.884/0001-31', contrato: 'Plano Care · Corporativo', numero: 7, totalParcelas: 12, valor: 7500, vencimento: '2026-07-10', status: 'pendente-emissao' },
  { id: 'pf-10', empresaId: 'e-7', razaoSocial: 'Solaris Energia S.A.', nomeFantasia: 'Solaris', cnpj: '44.902.318/0001-72', contrato: 'Plano Care · Enterprise', numero: 1, totalParcelas: 12, valor: 15000, vencimento: '2026-07-15', status: 'pendente-emissao' },
]

/* Notas fiscais — controle do backoffice (§8.13). */
export const mngNotas: MngNota[] = [
  { id: 'n-1', profissional: 'Mariana Lopes', origem: 'fechamento', referencia: '16–22 jun', valor: 1050, status: 'em-analise', numero: '2026/051', enviadaEm: '2026-06-24', sessoes: [
    { id: 'ns-1a', data: '2026-06-16', hora: '09:00', beneficiario: 'Beija-flor', valor: 210 },
    { id: 'ns-1b', data: '2026-06-17', hora: '17:00', beneficiario: 'Cedro', valor: 210 },
    { id: 'ns-1c', data: '2026-06-19', hora: '10:00', beneficiario: 'Girassol', valor: 210 },
    { id: 'ns-1d', data: '2026-06-20', hora: '14:00', beneficiario: 'Beija-flor', valor: 210 },
    { id: 'ns-1e', data: '2026-06-22', hora: '11:00', beneficiario: 'Cedro', valor: 210 },
  ] },
  { id: 'n-2', profissional: 'André Fontes', origem: 'antecipacao', referencia: 'Antecipação', valor: 600, status: 'em-analise', numero: '2026/033', enviadaEm: '2026-06-25', taxaPct: 2.4, valorTaxa: 14.4, sessoes: [
    { id: 'ns-2a', data: '2026-06-23', hora: '10:00', beneficiario: 'Ipê', valor: 200 },
    { id: 'ns-2b', data: '2026-06-24', hora: '16:00', beneficiario: 'Jacarandá', valor: 200 },
    { id: 'ns-2c', data: '2026-06-25', hora: '09:00', beneficiario: 'Ipê', valor: 200 },
  ] },
  { id: 'n-3', profissional: 'Sofia Prado', origem: 'fechamento', referencia: '09–15 jun', valor: 750, status: 'requer-ajuste', numero: '2026/050', enviadaEm: '2026-06-16', motivoAjuste: 'CNPJ do tomador divergente — reemitir com o CNPJ da YNA Saúde.', sessoes: [
    { id: 'ns-3a', data: '2026-06-09', hora: '15:00', beneficiario: 'Manacá', valor: 150 },
    { id: 'ns-3b', data: '2026-06-11', hora: '16:00', beneficiario: 'Orquídea', valor: 150 },
    { id: 'ns-3c', data: '2026-06-12', hora: '10:00', beneficiario: 'Manacá', valor: 150 },
    { id: 'ns-3d', data: '2026-06-13', hora: '14:00', beneficiario: 'Perpétua', valor: 150 },
    { id: 'ns-3e', data: '2026-06-15', hora: '11:00', beneficiario: 'Orquídea', valor: 150 },
  ] },
  { id: 'n-4', profissional: 'Mariana Lopes', origem: 'fechamento', referencia: '02–08 jun', valor: 900, status: 'para-pagamento', numero: '2026/044', enviadaEm: '2026-06-09', sessoes: [
    { id: 'ns-4a', data: '2026-06-02', hora: '09:00', beneficiario: 'Beija-flor', valor: 225 },
    { id: 'ns-4b', data: '2026-06-04', hora: '17:00', beneficiario: 'Girassol', valor: 225 },
    { id: 'ns-4c', data: '2026-06-06', hora: '10:00', beneficiario: 'Cedro', valor: 225 },
    { id: 'ns-4d', data: '2026-06-08', hora: '14:00', beneficiario: 'Beija-flor', valor: 225 },
  ] },
  { id: 'n-5', profissional: 'Beatriz Nunes', origem: 'fechamento', referencia: '09–15 jun', valor: 450, status: 'paga', numero: '2026/047', enviadaEm: '2026-06-16', pagamento: { em: '2026-06-20', comprovante: 'comprovante-2026-047.pdf' }, sessoes: [
    { id: 'ns-5a', data: '2026-06-10', hora: '08:00', beneficiario: 'Aroeira', valor: 150 },
    { id: 'ns-5b', data: '2026-06-12', hora: '19:00', beneficiario: 'Buriti', valor: 150 },
    { id: 'ns-5c', data: '2026-06-14', hora: '18:00', beneficiario: 'Aroeira', valor: 150 },
  ] },
]

/* Tickets de suporte (§8.9). */
export const mngTickets: MngTicket[] = [
  { id: 't-1', protocolo: '2026-000481', tipo: 'prontuario', assunto: 'Solicitação de prontuário — beneficiário', descricao: 'Beneficiário solicita cópia do prontuário completo das sessões realizadas no primeiro semestre para acompanhamento com outro profissional.', solicitante: 'Beija-flor', empresa: 'Nova Vita', origem: 'App beneficiário', status: 'aberto', sla: '7 dias úteis', abertoEm: '2026-06-25T10:12', prazoEm: '2026-07-04T18:00' },
  { id: 't-2', protocolo: '2026-000475', tipo: 'lgpd', assunto: 'Exclusão de dados (LGPD)', descricao: 'Titular solicita a exclusão dos seus dados pessoais da plataforma, nos termos da LGPD. Necessário validar retenções legais obrigatórias antes da exclusão.', solicitante: 'Cedro', empresa: 'Atlas', origem: 'Meus dados', status: 'em-andamento', sla: '72h', abertoEm: '2026-06-23T14:30', prazoEm: '2026-06-25T14:30', respostas: [
    { id: 'tr-2a', autor: 'Virgínia Sales', em: '2026-06-24T09:40', texto: 'Solicitação recebida. Estamos validando quais dados podem ser excluídos e quais têm retenção legal obrigatória.' },
  ] },
  { id: 't-3', protocolo: '2026-000489', tipo: 'tecnico', assunto: 'Erro ao entrar na sala de vídeo', descricao: 'Profissional relata que ao clicar em “Entrar na sala” a tela fica carregando e não conecta. Ocorre no navegador Safari.', solicitante: 'André Fontes', empresa: 'Vértice Tech', origem: 'Nyna', status: 'aberto', sla: '24h', abertoEm: '2026-06-26T05:20', prazoEm: '2026-06-27T05:20' },
  { id: 't-4', protocolo: '2026-000460', tipo: 'cadastro', assunto: 'Ajuste de dados bancários', descricao: 'Profissional pediu atualização da conta bancária para recebimento. Dados conferidos e atualizados.', solicitante: 'Sofia Prado', empresa: 'Orla', origem: 'App profissional', status: 'resolvido', sla: '48h', abertoEm: '2026-06-22T11:00', prazoEm: '2026-06-24T11:00', respostas: [
    { id: 'tr-4a', autor: 'Rodrigo Salles', em: '2026-06-23T15:10', texto: 'Dados bancários atualizados com sucesso. Atendimento concluído.', anexos: ['comprovante-atualizacao.pdf'] },
  ] },
  { id: 't-5', protocolo: '2026-000468', tipo: 'queixa', assunto: 'Reclamação sobre atraso recorrente', descricao: 'Beneficiário relata que o profissional atrasou em três das últimas sessões. Solicita providências.', solicitante: 'Girassol', empresa: 'BCP Securities', origem: 'App beneficiário', status: 'aberto', sla: '48h', abertoEm: '2026-06-24T09:00', prazoEm: '2026-06-25T09:00' },
  { id: 't-6', protocolo: '2026-000484', tipo: 'duvida', assunto: 'Dúvida sobre limite de sessões do plano', descricao: 'RH da empresa pergunta qual o limite mensal de sessões por colaborador no plano contratado.', solicitante: 'Helena Marques', empresa: 'Meridiano Log', origem: 'App RH', status: 'em-andamento', sla: '48h', abertoEm: '2026-06-25T16:00', prazoEm: '2026-06-29T16:00', respostas: [
    { id: 'tr-6a', autor: 'Virgínia Sales', em: '2026-06-26T08:15', texto: 'Olá! O plano atual contempla até 4 sessões por colaborador ao mês. Estou levantando o detalhamento por área para te enviar.' },
  ] },
]

export const TICKET_TIPO_LABEL: Record<MngTicket['tipo'], string> = {
  prontuario: 'Prontuário', duvida: 'Dúvida', lgpd: 'LGPD', cadastro: 'Cadastro', tecnico: 'Técnico', queixa: 'Queixa',
}

/* Dashboard macro (§8.10). */
export const mngDashboard: MngDashboard = {
  empresasAtivas: 6, empresasBloqueadas: 1, beneficiariosAtivos: 270, novosBeneficiariosMes: 34,
  profissionaisAtivos: 38, profissionaisFerias: 3, sessoesMes: 1284, noShows: 47, receitaMes: 25500, npsMacro: 74,
}

/* Cockpit do gestor (§8.10). Separa FOTO ATUAL (estoque — estado de hoje) de
   FLUXO (acumulado por período). As métricas de foto atual das EMPRESAS são
   derivadas dos dados reais do mock (empresas + parcelas) para manter coerência
   com as telas de Empresas e Financeiro; as demais usam agregados ilustrativos,
   alinhados aos números macro (38 profissionais ativos). */
const _empresasAtivas = mngEmpresas.filter((e) => e.status === 'ativa')
const _utilizacao = _empresasAtivas
  .map((e) => ({ nome: e.nomeFantasia, pct: e.licencas ? Math.round((e.beneficiariosAtivos / e.licencas) * 100) : 0 }))
  .sort((a, b) => b.pct - a.pct)
const _utilMedia = Math.round(_utilizacao.reduce((s, u) => s + u.pct, 0) / _utilizacao.length)
const _inadimplencia = mngParcelasFin.filter((p) => p.status === 'atrasada').reduce((s, p) => s + p.valor, 0)

const _MES_NOME = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const _mesLabel = (ano: number, mes: number) => `${_MES_NOME[mes - 1][0].toUpperCase()}${_MES_NOME[mes - 1].slice(1)} de ${ano}`
const _mes = (ano: number, mes: number, dados: MngCockpitFluxo): MngCockpitMes => ({ ano, mes, label: _mesLabel(ano, mes), dados })

/* Fluxo mês a mês de 2026 (jan→jun). Volumes crescem ao longo do ano; no-shows e
   atrasos melhoram. Junho é o mês corrente (MNG_TODAY). */
const _mesesCockpit: MngCockpitMes[] = [
  _mes(2026, 1, { receitaRecebida: 15000, sessoesRealizadas: 980, noShowBeneficiarioPct: 3.9, noShowProfissionalPct: 1.2, atrasoMedioMin: 6, duracaoMediaMin: 48, valorPago: 142000, valorAntecipado: 5200, valorMedioSessao: 162, receitaAntecipacao: 190 }),
  _mes(2026, 2, { receitaRecebida: 18000, sessoesRealizadas: 1030, noShowBeneficiarioPct: 3.7, noShowProfissionalPct: 1.0, atrasoMedioMin: 5, duracaoMediaMin: 48, valorPago: 149500, valorAntecipado: 6100, valorMedioSessao: 163, receitaAntecipacao: 214 }),
  _mes(2026, 3, { receitaRecebida: 24000, sessoesRealizadas: 1105, noShowBeneficiarioPct: 3.5, noShowProfissionalPct: 1.0, atrasoMedioMin: 5, duracaoMediaMin: 49, valorPago: 156800, valorAntecipado: 6800, valorMedioSessao: 164, receitaAntecipacao: 240 }),
  _mes(2026, 4, { receitaRecebida: 27500, sessoesRealizadas: 1142, noShowBeneficiarioPct: 3.6, noShowProfissionalPct: 0.9, atrasoMedioMin: 5, duracaoMediaMin: 48, valorPago: 162300, valorAntecipado: 7400, valorMedioSessao: 165, receitaAntecipacao: 258 }),
  _mes(2026, 5, { receitaRecebida: 33000, sessoesRealizadas: 1187, noShowBeneficiarioPct: 3.6, noShowProfissionalPct: 1.1, atrasoMedioMin: 5, duracaoMediaMin: 48, valorPago: 171200, valorAntecipado: 7400, valorMedioSessao: 165, receitaAntecipacao: 268 }),
  _mes(2026, 6, { receitaRecebida: 21000, sessoesRealizadas: 1284, noShowBeneficiarioPct: 3.1, noShowProfissionalPct: 0.8, atrasoMedioMin: 4, duracaoMediaMin: 49, valorPago: 184500, valorAntecipado: 9600, valorMedioSessao: 168, receitaAntecipacao: 340 }),
]

/* Consolida o ano: soma os campos aditivos (valores/contagens) e faz a média
   dos campos de taxa/média (no-show, atraso, duração, valor médio por sessão). */
function _consolidarAno(meses: MngCockpitMes[]): MngCockpitFluxo {
  const n = meses.length
  const soma = (f: (d: MngCockpitFluxo) => number) => meses.reduce((s, m) => s + f(m.dados), 0)
  const media = (f: (d: MngCockpitFluxo) => number) => Math.round((soma(f) / n) * 10) / 10
  return {
    receitaRecebida: soma((d) => d.receitaRecebida),
    sessoesRealizadas: soma((d) => d.sessoesRealizadas),
    valorPago: soma((d) => d.valorPago),
    valorAntecipado: soma((d) => d.valorAntecipado),
    receitaAntecipacao: soma((d) => d.receitaAntecipacao),
    noShowBeneficiarioPct: media((d) => d.noShowBeneficiarioPct),
    noShowProfissionalPct: media((d) => d.noShowProfissionalPct),
    atrasoMedioMin: Math.round(media((d) => d.atrasoMedioMin)),
    duracaoMediaMin: Math.round(media((d) => d.duracaoMediaMin)),
    valorMedioSessao: Math.round(media((d) => d.valorMedioSessao)),
  }
}

export const mngCockpit: MngCockpit = {
  empresas: {
    contratoAtivo: _empresasAtivas.length,
    bloqueadas: mngEmpresas.filter((e) => e.status === 'bloqueada').length,
    utilizacaoMediaPct: _utilMedia,
    utilizacao: _utilizacao,
    inadimplencia: _inadimplencia,
  },
  profissionais: {
    ativosPorTipo: [
      { tipo: 'Psicólogo', total: 30 },
      { tipo: 'Psiquiatra', total: 5 },
      { tipo: 'Nutricionista', total: 3 },
    ],
    ativosTotal: 38,
    dispSemanalMediaH: 18.5,
    dispPlantaoMediaH: 4.2,
  },
  saldoAPagar: 12800,
  // MNG_TODAY = 2026-06-26 → mês atual = junho/2026. Meses em ordem crescente.
  meses: _mesesCockpit,
  anoConsolidado: { label: '2026', dados: _consolidarAno(_mesesCockpit) },
}

/* Planos de contratação (§8.17). Catálogo de features que um plano pode liberar
   + planos cadastrados. `mngPlanos` é mutável (upsert/toggle no serviço). */
export const MNG_PLANO_FEATURES: { id: string; label: string }[] = [
  { id: 'sessoes', label: 'Sessões de terapia 1:1' },
  { id: 'triagem', label: 'Triagem e match inteligente' },
  { id: 'nyna', label: 'Nyna · assistente 24/7' },
  { id: 'checkin', label: 'Check-in de bem-estar' },
  { id: 'emergencia', label: 'Sala de emergência e plantão' },
  { id: 'academia', label: 'Academia YNA (conteúdo)' },
  { id: 'documentos', label: 'Modelos de documentos' },
  { id: 'dashboard-rh', label: 'Dashboard RH e indicadores' },
  { id: 'nr1', label: 'Relatórios NR-1 agregados' },
]

export const PLANO_PUBLICO_LABEL: Record<MngPlano['publico'], string> = {
  empresa: 'Para empresas', pessoa: 'Para pessoas',
}

export const mngPlanos: MngPlano[] = [
  { id: 'plano-base', nome: 'Base · Corporativo', publico: 'empresa', ativo: true, licencas: 100, valorMensalLicenca: 39.9, valorAnualLicenca: 34.9,
    features: ['sessoes', 'triagem', 'nyna', 'checkin', 'academia', 'dashboard-rh'] },
  { id: 'plano-care', nome: 'Care · Corporativo', publico: 'empresa', ativo: true, licencas: 200, valorMensalLicenca: 59.9, valorAnualLicenca: 49.9,
    features: ['sessoes', 'triagem', 'nyna', 'checkin', 'emergencia', 'academia', 'documentos', 'dashboard-rh', 'nr1'] },
  { id: 'plano-individual', nome: 'Individual', publico: 'pessoa', ativo: true, licencas: 1, valorMensalLicenca: 89.9, valorAnualLicenca: 79.9,
    features: ['sessoes', 'triagem', 'nyna', 'checkin', 'academia'] },
  { id: 'plano-piloto', nome: 'Piloto · Legado', publico: 'empresa', ativo: false, licencas: 50, valorMensalLicenca: 29.9, valorAnualLicenca: 24.9,
    features: ['sessoes', 'triagem'] },
]

export const mngNotificacoes: MngNotificacao[] = [
  { id: 'mn-1', tipo: 'nota', icon: 'ph:receipt-bold', titulo: 'Nota fiscal para conferência', descricao: 'Mariana Lopes enviou uma nota fiscal para conferência.', quando: 'há 20 minutos', lida: false, to: '/mng/financeiro?view=profissionais&status=em-analise' },
  { id: 'mn-2', tipo: 'antecipacao', icon: 'ph:lightning-bold', titulo: 'Solicitação de antecipação', descricao: 'André Fontes solicitou a antecipação de recebíveis.', quando: 'há 1 hora', lida: false, to: '/mng/financeiro?view=profissionais&status=em-analise' },
  { id: 'mn-3', tipo: 'pagamento-empresa', icon: 'ph:check-circle-bold', titulo: 'Pagamento de empresa confirmado', descricao: 'A Nova Vita confirmou o pagamento de uma parcela do contrato.', quando: 'há 2 horas', lida: false, to: '/mng/financeiro?view=empresas&status=paga' },
  { id: 'mn-4', tipo: 'aprovacao', icon: 'ph:user-plus-bold', titulo: 'Novo profissional para análise', descricao: 'Beatriz Nunes concluiu o cadastro e aguarda análise.', quando: 'há 3 horas', lida: false, to: '/mng/profissionais?status=para-analise' },
  { id: 'mn-5', tipo: 'ativacao', icon: 'ph:user-check-bold', titulo: 'Profissional ativou a conta', descricao: 'Sofia Prado ativou a conta e está apta a atender.', quando: 'há 5 horas', lida: true, to: '/mng/profissionais?status=ativo' },
  { id: 'mn-6', tipo: 'sessao', icon: 'ph:user-minus-bold', titulo: 'Profissional não entrou na sessão', descricao: 'Uma sessão não foi realizada — o profissional não entrou na sala.', quando: 'há 6 horas', lida: false, to: '/mng/sessoes?status=nao-realizada' },
  { id: 'mn-7', tipo: 'ticket', icon: 'ph:lifebuoy-bold', titulo: 'Novo ticket no suporte', descricao: 'Um novo chamado foi aberto na fila de suporte.', quando: 'há 1 dia', lida: true, to: '/mng/suporte?status=aberto' },
]
