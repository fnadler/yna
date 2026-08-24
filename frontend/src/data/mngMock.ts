import type {
  MngGestor,
  MngEmpresa,
  MngFunilConvites,
  MngTicket,
  MngCockpit,
  MngNotificacao,
  MngDepartamentoEmpresa,
  MngContatoEmpresa,
  MngUsuarioRh,
} from '../types'

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
  { id: 'g-3', nome: 'Virgínia Sales', email: 'virginia@yna.com.br', perfil: 'suporte', initials: 'VS', palette: 'yellow', status: 'ativo', mfa: true, ultimoAcesso: '2026-06-24' },
  { id: 'g-4', nome: 'Marina Teles', email: 'marina@yna.com.br', perfil: 'branding', initials: 'MT', palette: 'lavender', status: 'convidado', mfa: false },
  { id: 'g-5', nome: 'Paulo Reis', email: 'paulo@yna.com.br', perfil: 'suporte', initials: 'PR', palette: 'pink', status: 'ativo', mfa: true, ultimoAcesso: '2026-06-26' },
  { id: 'g-6', nome: 'Rodrigo Salles', email: 'rodrigo@yna.com.br', perfil: 'comercial', initials: 'RS', palette: 'lavender', status: 'ativo', mfa: true, ultimoAcesso: '2026-06-26' },
]

/** Gestores que podem ser CSM de uma empresa (perfil comercial). */
export const mngCsms = () => mngGestores.filter((g) => g.perfil === 'comercial')

/* Planos de conformidade disponíveis (só cadastral — sem cobrança, §12). */
export const PLANOS = ['Conformidade NR-1 · Base', 'Conformidade NR-1 · Piloto', 'Conformidade NR-1 · Corporativo']

/* Funil de convites plausível: afunila de "enviado" até "concluído" (= ativos). */
const funil = (enviado: number, concluido: number): MngFunilConvites => ({
  enviado, aberto: Math.round(enviado * 0.82), cadastroIniciado: Math.round(enviado * 0.72), cadastroConcluido: concluido,
})

export const PERFIL_GESTOR_LABEL: Record<MngGestor['perfil'], string> = {
  'super-admin': 'Super-Admin', comercial: 'Comercial / CSM', suporte: 'Atendente / Suporte', branding: 'Branding',
}

/* Empresas + contratos (§8.4). Contrato é só dado cadastral (vigência,
   status) — financeiro/parcelas/plano comercial ficaram fora deste
   recorte (§12). */
export const mngEmpresas: MngEmpresa[] = [
  {
    id: 'e-1', razaoSocial: 'BCP Securities Brasil Ltda.', nomeFantasia: 'BCP Securities', cnpj: '34.812.097/0001-55',
    segmento: 'Serviços financeiros', contatoRh: 'Camila Risi · DHO', status: 'ativa', colaboradoresContratados: 200, colaboradoresAtivos: 137, initials: 'BCP',
    contratos: [
      { id: 'c-1b', plano: 'Conformidade NR-1 · Corporativo', colaboradoresContratados: 200, inicio: '2026-06-01', fim: '2027-05-31', status: 'vigente', execucaoPct: 8 },
      { id: 'c-1a', plano: 'Conformidade NR-1 · Piloto', colaboradoresContratados: 120, inicio: '2025-06-01', fim: '2026-05-31', status: 'encerrado', execucaoPct: 100 },
    ],
    masters: [{ nome: 'Camila Risi', email: 'camila.risi@bcpsecurities.com', telefone: '(11) 98812-4431' }],
    csmId: 'g-2', funil: funil(200, 137),
  },
  {
    id: 'e-2', razaoSocial: 'Nova Vita Saúde S.A.', nomeFantasia: 'Nova Vita', cnpj: '12.334.556/0001-08',
    segmento: 'Saúde', contatoRh: 'Rafael Lopes · RH', status: 'ativa', colaboradoresContratados: 80, colaboradoresAtivos: 0, initials: 'NV',
    contratos: [
      { id: 'c-2', plano: 'Conformidade NR-1 · Piloto', colaboradoresContratados: 80, inicio: '2026-06-20', fim: '2027-06-19', status: 'vigente', execucaoPct: 2 },
    ],
    masters: [{ nome: 'Rafael Lopes', email: 'rafael.lopes@novavita.com.br', telefone: '(21) 99120-8890' }],
    csmId: 'g-6', funil: funil(40, 0),
  },
  {
    id: 'e-3', razaoSocial: 'Atlas Engenharia Ltda.', nomeFantasia: 'Atlas', cnpj: '55.201.884/0001-31',
    segmento: 'Engenharia', contatoRh: 'Sandra Muniz · DHO', status: 'bloqueada', colaboradoresContratados: 150, colaboradoresAtivos: 92, initials: 'AT',
    contratos: [
      { id: 'c-3', plano: 'Conformidade NR-1 · Corporativo', colaboradoresContratados: 150, inicio: '2026-02-01', fim: '2027-01-31', status: 'vigente', execucaoPct: 42 },
    ],
    masters: [{ nome: 'Sandra Muniz', email: 'sandra.muniz@atlaseng.com.br', telefone: '(11) 97654-2201' }],
    csmId: 'g-2', funil: funil(150, 92),
  },
  {
    id: 'e-4', razaoSocial: 'Orla Varejo S.A.', nomeFantasia: 'Orla', cnpj: '09.887.120/0001-77',
    segmento: 'Varejo', contatoRh: 'Diego Antunes · RH', status: 'ativa', colaboradoresContratados: 100, colaboradoresAtivos: 41, initials: 'OR',
    contratos: [
      { id: 'c-4', plano: 'Conformidade NR-1 · Base', colaboradoresContratados: 100, inicio: '2025-07-01', fim: '2026-06-30', status: 'vigente', execucaoPct: 97 },
    ],
    masters: [{ nome: 'Diego Antunes', email: 'diego.antunes@orlavarejo.com.br', telefone: '(11) 96543-1120' }],
    csmId: 'g-6', funil: funil(100, 41),
  },
  // Exemplo — contrato VERDE (> 180 dias para o término).
  {
    id: 'e-5', razaoSocial: 'Vértice Tecnologia Ltda.', nomeFantasia: 'Vértice Tech', cnpj: '21.554.008/0001-46',
    segmento: 'Tecnologia', contatoRh: 'Helena Marques · RH', status: 'ativa', colaboradoresContratados: 90, colaboradoresAtivos: 21, initials: 'VT',
    contratos: [
      { id: 'c-5', plano: 'Conformidade NR-1 · Base', colaboradoresContratados: 90, inicio: '2026-06-01', fim: '2027-09-30', status: 'vigente', execucaoPct: 5 },
    ],
    masters: [{ nome: 'Helena Marques', email: 'helena.marques@verticetech.com.br', telefone: '(11) 98330-7742' }],
    csmId: 'g-2', funil: funil(90, 21),
  },
  // Exemplo — contrato AMARELO (91–180 dias para o término).
  {
    id: 'e-6', razaoSocial: 'Meridiano Logística S.A.', nomeFantasia: 'Meridiano Log', cnpj: '30.118.472/0001-09',
    segmento: 'Logística', contatoRh: 'Paulo Ferraz · DHO', status: 'ativa', colaboradoresContratados: 120, colaboradoresAtivos: 63, initials: 'ML',
    contratos: [
      { id: 'c-6', plano: 'Conformidade NR-1 · Corporativo', colaboradoresContratados: 120, inicio: '2025-12-06', fim: '2026-12-05', status: 'vigente', execucaoPct: 56 },
    ],
    masters: [{ nome: 'Paulo Ferraz', email: 'paulo.ferraz@meridianolog.com.br', telefone: '(11) 99887-3320' }],
    csmId: 'g-6', funil: funil(120, 63),
  },
  // Exemplo — contrato VERMELHO (≤ 90 dias para o término).
  {
    id: 'e-7', razaoSocial: 'Solaris Energia S.A.', nomeFantasia: 'Solaris', cnpj: '44.902.318/0001-72',
    segmento: 'Energia', contatoRh: 'Renata Lima · RH', status: 'ativa', colaboradoresContratados: 110, colaboradoresAtivos: 88, initials: 'SO',
    contratos: [
      { id: 'c-7', plano: 'Conformidade NR-1 · Base', colaboradoresContratados: 110, inicio: '2025-08-21', fim: '2026-08-20', status: 'vigente', execucaoPct: 85 },
    ],
    masters: [{ nome: 'Renata Lima', email: 'renata.lima@solarisenergia.com.br', telefone: '(11) 98221-0099' }],
    csmId: 'g-2', funil: funil(110, 88),
  },
]

export const EMPRESA_STATUS_LABEL: Record<MngEmpresa['status'], string> = {
  ativa: 'Ativo', bloqueada: 'Bloqueado', inativa: 'Inativo',
}

/* Departamentos, contatos e usuários RH por empresa (detalhe da empresa no
   Manager, aba a aba) — populado para todas as empresas de `mngEmpresas`,
   pra aba nunca aparecer vazia no protótipo. Os departamentos de 'e-1'
   (BCP Securities) espelham os mesmos nomes de `rhDepartamentos`
   (rhMock.ts) — a mesma empresa, duas pontas (Manager vê de fora, RH vê de
   dentro); as demais empresas têm departamentos plausíveis pro segmento,
   sem uma contraparte no lado RH (só existe mock de colaborador/dept. para
   a empresa "logada", BCP Securities). Master de cada empresa (`masters`
   em `mngEmpresas`) aparece tanto em Contatos quanto em Usuários (perfil
   Master) — a mesma pessoa, dois registros, mesmo critério de 'e-1'/'e-3'. */
export const mngDepartamentosEmpresa: MngDepartamentoEmpresa[] = [
  // e-1 · BCP Securities (Serviços financeiros)
  { id: 'mde-1', empresaId: 'e-1', nome: 'Trading & Mercados' },
  { id: 'mde-2', empresaId: 'e-1', nome: 'Tecnologia' },
  { id: 'mde-3', empresaId: 'e-1', nome: 'Operações' },
  { id: 'mde-4', empresaId: 'e-1', nome: 'Compliance & Risco' },
  { id: 'mde-5', empresaId: 'e-1', nome: 'Pessoas & DHO' },
  // e-2 · Nova Vita (Saúde)
  { id: 'mde-8', empresaId: 'e-2', nome: 'Assistencial' },
  { id: 'mde-9', empresaId: 'e-2', nome: 'Administrativo' },
  { id: 'mde-10', empresaId: 'e-2', nome: 'Pessoas & RH' },
  // e-3 · Atlas (Engenharia)
  { id: 'mde-6', empresaId: 'e-3', nome: 'Engenharia de Obras' },
  { id: 'mde-7', empresaId: 'e-3', nome: 'Segurança do Trabalho' },
  { id: 'mde-11', empresaId: 'e-3', nome: 'Pessoas & DHO' },
  // e-4 · Orla (Varejo)
  { id: 'mde-12', empresaId: 'e-4', nome: 'Loja & Vendas' },
  { id: 'mde-13', empresaId: 'e-4', nome: 'Logística' },
  { id: 'mde-14', empresaId: 'e-4', nome: 'Marketing' },
  { id: 'mde-15', empresaId: 'e-4', nome: 'Pessoas & RH' },
  // e-5 · Vértice Tech (Tecnologia)
  { id: 'mde-16', empresaId: 'e-5', nome: 'Engenharia de Software' },
  { id: 'mde-17', empresaId: 'e-5', nome: 'Produto' },
  { id: 'mde-18', empresaId: 'e-5', nome: 'Customer Success' },
  { id: 'mde-19', empresaId: 'e-5', nome: 'Pessoas & RH' },
  // e-6 · Meridiano Log (Logística)
  { id: 'mde-20', empresaId: 'e-6', nome: 'Operações Logísticas' },
  { id: 'mde-21', empresaId: 'e-6', nome: 'Frota & Manutenção' },
  { id: 'mde-22', empresaId: 'e-6', nome: 'Pessoas & DHO' },
  // e-7 · Solaris (Energia)
  { id: 'mde-23', empresaId: 'e-7', nome: 'Engenharia' },
  { id: 'mde-24', empresaId: 'e-7', nome: 'Operações de Campo' },
  { id: 'mde-25', empresaId: 'e-7', nome: 'Pessoas & RH' },
]

export const mngContatosEmpresa: MngContatoEmpresa[] = [
  { id: 'mce-1', empresaId: 'e-1', nome: 'Camila Risi', cargo: 'Head de DHO', departamento: 'Pessoas & DHO', telefone: '(11) 98812-4431', email: 'camila.risi@bcpsecurities.com' },
  { id: 'mce-2', empresaId: 'e-1', nome: 'Ricardo Alencar', cargo: 'Head de Trading', departamento: 'Trading & Mercados', telefone: '(11) 98221-5567', email: 'ricardo.alencar@bcpsecurities.com' },
  { id: 'mce-4', empresaId: 'e-2', nome: 'Rafael Lopes', cargo: 'Coordenador de RH', departamento: 'Pessoas & RH', telefone: '(21) 99120-8890', email: 'rafael.lopes@novavita.com.br' },
  { id: 'mce-3', empresaId: 'e-3', nome: 'Sandra Muniz', cargo: 'Gerente de DHO', departamento: 'Pessoas & DHO', telefone: '(11) 97654-2201', email: 'sandra.muniz@atlaseng.com.br' },
  { id: 'mce-5', empresaId: 'e-4', nome: 'Diego Antunes', cargo: 'Gerente de RH', departamento: 'Pessoas & RH', telefone: '(11) 96543-1120', email: 'diego.antunes@orlavarejo.com.br' },
  { id: 'mce-6', empresaId: 'e-5', nome: 'Helena Marques', cargo: 'Head de Pessoas', departamento: 'Pessoas & RH', telefone: '(11) 98330-7742', email: 'helena.marques@verticetech.com.br' },
  { id: 'mce-7', empresaId: 'e-6', nome: 'Paulo Ferraz', cargo: 'Head de DHO', departamento: 'Pessoas & DHO', telefone: '(11) 99887-3320', email: 'paulo.ferraz@meridianolog.com.br' },
  { id: 'mce-8', empresaId: 'e-7', nome: 'Renata Lima', cargo: 'Gerente de RH', departamento: 'Pessoas & RH', telefone: '(11) 98221-0099', email: 'renata.lima@solarisenergia.com.br' },
]

export const mngUsuariosRh: MngUsuarioRh[] = [
  { id: 'mur-1', empresaId: 'e-1', nome: 'Camila Risi', departamento: 'Pessoas & DHO', cargo: 'Head de DHO', email: 'camila.risi@bcpsecurities.com', perfil: 'master', initials: 'CR', palette: 'lavender' },
  { id: 'mur-2', empresaId: 'e-1', nome: 'Bruno Salgado', departamento: 'Pessoas & DHO', cargo: 'Analista de RH', email: 'bruno.salgado@bcpsecurities.com', perfil: 'operador', initials: 'BS', palette: 'pink' },
  { id: 'mur-4', empresaId: 'e-2', nome: 'Rafael Lopes', departamento: 'Pessoas & RH', cargo: 'Coordenador de RH', email: 'rafael.lopes@novavita.com.br', perfil: 'master', initials: 'RL', palette: 'lavender' },
  { id: 'mur-3', empresaId: 'e-3', nome: 'Sandra Muniz', departamento: 'Pessoas & DHO', cargo: 'Gerente de DHO', email: 'sandra.muniz@atlaseng.com.br', perfil: 'master', initials: 'SM', palette: 'yellow' },
  { id: 'mur-5', empresaId: 'e-3', nome: 'Tiago Ramos', departamento: 'Segurança do Trabalho', cargo: 'Técnico de Segurança', email: 'tiago.ramos@atlaseng.com.br', perfil: 'operador', initials: 'TR', palette: 'pink' },
  { id: 'mur-6', empresaId: 'e-4', nome: 'Diego Antunes', departamento: 'Pessoas & RH', cargo: 'Gerente de RH', email: 'diego.antunes@orlavarejo.com.br', perfil: 'master', initials: 'DA', palette: 'yellow' },
  { id: 'mur-7', empresaId: 'e-5', nome: 'Helena Marques', departamento: 'Pessoas & RH', cargo: 'Head de Pessoas', email: 'helena.marques@verticetech.com.br', perfil: 'master', initials: 'HM', palette: 'lavender' },
  { id: 'mur-8', empresaId: 'e-5', nome: 'Felipe Costa', departamento: 'Pessoas & RH', cargo: 'Analista de Pessoas', email: 'felipe.costa@verticetech.com.br', perfil: 'operador', initials: 'FC', palette: 'pink' },
  { id: 'mur-9', empresaId: 'e-6', nome: 'Paulo Ferraz', departamento: 'Pessoas & DHO', cargo: 'Head de DHO', email: 'paulo.ferraz@meridianolog.com.br', perfil: 'master', initials: 'PF', palette: 'yellow' },
  { id: 'mur-10', empresaId: 'e-7', nome: 'Renata Lima', departamento: 'Pessoas & RH', cargo: 'Gerente de RH', email: 'renata.lima@solarisenergia.com.br', perfil: 'master', initials: 'RL', palette: 'lavender' },
]

/* Segmentos de mercado das empresas (select de cadastro/edição). */
export const SEGMENTOS = [
  'Serviços financeiros', 'Saúde', 'Engenharia', 'Varejo', 'Tecnologia', 'Logística',
  'Energia', 'Indústria', 'Educação', 'Telecomunicações', 'Governo', 'Outro',
]

/* Tickets de suporte (§8.9). Prontuário/sessão saíram: não há mais dado
   clínico nem sala de vídeo neste produto. */
export const mngTickets: MngTicket[] = [
  { id: 't-2', protocolo: '2026-000475', tipo: 'lgpd', assunto: 'Exclusão de dados (LGPD)', descricao: 'Titular solicita a exclusão dos seus dados pessoais da plataforma, nos termos da LGPD. Necessário validar retenções legais obrigatórias antes da exclusão.', solicitante: 'Colaborador · Atlas', empresa: 'Atlas', origem: 'Meus dados', status: 'em-andamento', sla: '72h', abertoEm: '2026-06-23T14:30', prazoEm: '2026-06-25T14:30', respostas: [
    { id: 'tr-2a', autor: 'Virgínia Sales', em: '2026-06-24T09:40', texto: 'Solicitação recebida. Estamos validando quais dados podem ser excluídos e quais têm retenção legal obrigatória.' },
  ] },
  { id: 't-3', protocolo: '2026-000489', tipo: 'tecnico', assunto: 'Erro ao exportar o inventário em PDF', descricao: 'RH relata que o botão de exportar o inventário para o PGR fica carregando e não gera o arquivo. Ocorre no navegador Safari.', solicitante: 'Helena Marques', empresa: 'Vértice Tech', origem: 'Cockpit NR-1', status: 'aberto', sla: '24h', abertoEm: '2026-06-26T05:20', prazoEm: '2026-06-27T05:20' },
  { id: 't-4', protocolo: '2026-000460', tipo: 'cadastro', assunto: 'Ajuste de área de um colaborador', descricao: 'RH pediu correção do departamento de um colaborador importado com a área errada.', solicitante: 'Diego Antunes', empresa: 'Orla', origem: 'App RH', status: 'resolvido', sla: '48h', abertoEm: '2026-06-22T11:00', prazoEm: '2026-06-24T11:00', respostas: [
    { id: 'tr-4a', autor: 'Rodrigo Salles', em: '2026-06-23T15:10', texto: 'Área corrigida com sucesso. Atendimento concluído.' },
  ] },
  { id: 't-5', protocolo: '2026-000468', tipo: 'queixa', assunto: 'Adesão abaixo do esperado', descricao: 'RH relata que a adesão à campanha está bem abaixo da média e pede orientação sobre como reforçar os lembretes.', solicitante: 'Camila Risi', empresa: 'BCP Securities', origem: 'App RH', status: 'aberto', sla: '48h', abertoEm: '2026-06-24T09:00', prazoEm: '2026-06-25T09:00' },
  { id: 't-6', protocolo: '2026-000484', tipo: 'duvida', assunto: 'Dúvida sobre o núcleo obrigatório', descricao: 'RH pergunta se pode remover um item do núcleo obrigatório do modelo derivado da empresa.', solicitante: 'Paulo Ferraz', empresa: 'Meridiano Log', origem: 'App RH', status: 'em-andamento', sla: '48h', abertoEm: '2026-06-25T16:00', prazoEm: '2026-06-29T16:00', respostas: [
    { id: 'tr-6a', autor: 'Virgínia Sales', em: '2026-06-26T08:15', texto: 'Olá! O núcleo obrigatório não pode ser removido, nem por modelos derivados — é uma trava da governança do instrumento. Posso te explicar melhor por chamada, se ajudar.' },
  ] },
]

export const TICKET_TIPO_LABEL: Record<MngTicket['tipo'], string> = {
  duvida: 'Dúvida', lgpd: 'LGPD', cadastro: 'Cadastro', tecnico: 'Técnico', queixa: 'Queixa',
}

/* Cockpit de conformidade (MNG-02, §5.1). As métricas de empresas são
   derivadas do mock real (empresas ativas/bloqueadas); as demais são
   agregados ilustrativos, coerentes com o módulo NR-1. */
const _empresasAtivas = mngEmpresas.filter((e) => e.status === 'ativa').length
const _empresasBloqueadas = mngEmpresas.filter((e) => e.status === 'bloqueada').length

export const mngCockpit: MngCockpit = {
  empresasAtivas: _empresasAtivas,
  empresasBloqueadas: _empresasBloqueadas,
  campanhasEmCampo: 4,
  adesaoMediaPct: 68,
  versoesPublicadas: 9,
  empresasSemInventario: 2,
  casosCanalEscutaAbertos: 3,
  /** Agregado comercial (opt-in pós-avaliação, §5.4/RF-J01) — nunca por
     pessoa, nunca visível ao RH. */
  interesseCuidado: { sim: 412, talvez: 268, nao: 190, total: 980 },
}

export const mngNotificacoes: MngNotificacao[] = [
  { id: 'mn-1', tipo: 'ticket', icon: 'ph:lifebuoy-bold', titulo: 'Novo ticket no suporte', descricao: 'Um novo chamado foi aberto na fila de suporte.', quando: 'há 1 dia', lida: true, to: '/mng/suporte?status=aberto' },
  { id: 'mn-2', tipo: 'nr1', icon: 'ph:shield-warning-bold', titulo: 'Empresa sem inventário gerado', descricao: 'A campanha da Atlas encerrou e o inventário para o PGR ainda não foi gerado.', quando: 'há 4 horas', lida: false, to: '/mng/empresas/e-3' },
  { id: 'mn-3', tipo: 'nr1', icon: 'ph:file-text-bold', titulo: 'Nova versão publicada', descricao: 'O Modelo YNA base ganhou uma nova versão publicada.', quando: 'há 6 horas', lida: false, to: '/mng/nr1/modelos' },
]
