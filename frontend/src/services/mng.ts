import type {
  MngGestor, MngEmpresa, MngContatoMaster, MngTipoProfissional, MngProfissional, MngProfissionalDetalhe,
  MngSessao, MngMatch, MngConteudo, MngNota, MngTicket, MngDashboard, MngCockpit, MngParcelaFin, MngModeloDocumento, MngPlano,
} from '../types'
import { modelosDocumento } from '../data/modelosDocumento'
import {
  mngGestores, mngEmpresas, mngTiposProfissional, mngProfissionais, mngProfissionalDetalhe,
  mngSessoes, mngMatches, mngConteudos, mngNotas, mngTickets, mngDashboard, mngCockpit, gerarParcelasPagamento, MNG_TODAY,
  mngParcelasFin, mngPlanos,
} from '../data/mngMock'

/* Camada de serviços do Manager / Backoffice YNA — mockada, com latência
   simulada. As assinaturas espelham a futura API REST; trocar o corpo por
   fetch/axios. Ver Seção 8 do documento de requisitos. */

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

export const mngAuthService = {
  /** Login do gestor no Manager (RF-YN-01.1). */
  login: async (email: string, senha: string): Promise<{ ok: boolean; message?: string }> => {
    await delay(rand(400, 800))
    if (!email || !senha) return { ok: false, message: 'Informe e-mail e senha.' }
    return { ok: true }
  },
  /** Recuperação de senha (RF-YN-01.2). */
  recover: async (email: string): Promise<{ ok: boolean }> => {
    await delay(rand(400, 700))
    return { ok: Boolean(email) }
  },
}

export const mngDashboardService = {
  get: async (): Promise<MngDashboard> => { await delay(rand(300, 600)); return mngDashboard },
  /** Cockpit macro do gestor — indicadores por dimensão (§8.10). */
  cockpit: async (): Promise<MngCockpit> => { await delay(rand(300, 600)); return mngCockpit },
}

export const mngEmpresaService = {
  list: async (): Promise<MngEmpresa[]> => { await delay(rand(300, 600)); return mngEmpresas },
  get: async (id: string): Promise<MngEmpresa | undefined> => { await delay(rand(250, 500)); return mngEmpresas.find((e) => e.id === id) },
  /** Cria a conta corporativa + primeiro contrato + usuário(s) Master + CSM
     (RF-YN-02.1/02.2). A empresa entra como "ativa"; os Masters recebem o link
     de primeiro acesso. Contrato com modelo de pagamento (à vista / parcelado). */
  create: async (p: {
    razaoSocial: string; nomeFantasia: string; cnpj: string; segmento: string
    masters: MngContatoMaster[]; csmId: string
    plano: string; licencas: number; valorTotal: number
    pagamento: 'avista' | 'parcelado'; numParcelas: number; diaVencimento: number
    inicio: string; fim: string; arquivo?: string
  }): Promise<MngEmpresa> => {
    await delay(rand(500, 900))
    const initials = p.nomeFantasia.trim().split(/\s+/).slice(0, 3).map((w) => w[0]).join('').toUpperCase() || 'YN'
    const now = Date.now()
    const parcelas = p.pagamento === 'avista' ? 1 : Math.max(1, p.numParcelas)
    const valorMensal = Math.round(p.valorTotal / parcelas)
    const empresa: MngEmpresa = {
      id: `e-${now}`,
      razaoSocial: p.razaoSocial, nomeFantasia: p.nomeFantasia, cnpj: p.cnpj, segmento: p.segmento,
      contatoRh: `${p.masters[0]?.nome ?? ''} · RH`, status: 'ativa', licencas: p.licencas, beneficiariosAtivos: 0, initials,
      contratos: [{
        id: `c-${now}`, plano: p.plano, valorMensal, valorTotal: p.valorTotal, licencas: p.licencas,
        inicio: p.inicio, fim: p.fim, arquivo: p.arquivo, status: 'vigente', execucaoPct: 0,
      }],
      masters: p.masters,
      csmId: p.csmId,
      funil: { enviado: 0, aberto: 0, cadastroIniciado: 0, cadastroConcluido: 0 },
      parcelas: gerarParcelasPagamento(p.inicio, p.diaVencimento, p.valorTotal, parcelas),
    }
    mngEmpresas.unshift(empresa)
    return empresa
  },
  /** Edita os dados cadastrais da empresa (razão social, nome fantasia, CNPJ, segmento, status). */
  update: async (empresaId: string, patch: Partial<Pick<MngEmpresa, 'razaoSocial' | 'nomeFantasia' | 'cnpj' | 'segmento' | 'status'>>): Promise<{ ok: boolean }> => {
    await delay(rand(300, 600))
    const e = mngEmpresas.find((x) => x.id === empresaId)
    if (e) {
      Object.assign(e, patch)
      if (patch.nomeFantasia) e.initials = patch.nomeFantasia.trim().split(/\s+/).slice(0, 3).map((w) => w[0]).join('').toUpperCase() || e.initials
    }
    return { ok: true }
  },
  /** Novo contrato (renovação): encerra o vigente e ativa o novo. Só um vigente
     por empresa. Gera as parcelas conforme o modelo de pagamento. */
  novoContrato: async (empresaId: string, p: {
    plano: string; inicio: string; fim: string; licencas: number; valorTotal: number
    pagamento: 'avista' | 'parcelado'; numParcelas: number; diaVencimento: number; arquivo?: string
  }): Promise<{ ok: boolean }> => {
    await delay(rand(400, 800))
    const e = mngEmpresas.find((x) => x.id === empresaId)
    if (!e) return { ok: false }
    e.contratos.forEach((c) => { if (c.status === 'vigente') c.status = 'encerrado' })
    const parcelas = p.pagamento === 'avista' ? 1 : Math.max(1, p.numParcelas)
    const valorMensal = Math.round(p.valorTotal / parcelas)
    e.contratos.unshift({
      id: `c-${Date.now()}`, plano: p.plano, valorMensal, valorTotal: p.valorTotal, licencas: p.licencas,
      inicio: p.inicio, fim: p.fim, arquivo: p.arquivo, status: 'vigente', execucaoPct: 0,
    })
    e.licencas = p.licencas
    e.parcelas = gerarParcelasPagamento(p.inicio, p.diaVencimento, p.valorTotal, parcelas)
    return { ok: true }
  },
  /** Altera a CSM responsável (perfil comercial). */
  setCsm: async (empresaId: string, gestorId: string): Promise<{ ok: boolean }> => {
    await delay(rand(200, 450))
    const e = mngEmpresas.find((x) => x.id === empresaId)
    if (e) e.csmId = gestorId
    return { ok: true }
  },
  /** Anexa a NF de uma parcela (mock — grava o nome do arquivo). */
  anexarNota: async (empresaId: string, parcelaId: string, arquivo: string): Promise<{ ok: boolean }> => {
    await delay(rand(200, 450))
    const p = mngEmpresas.find((x) => x.id === empresaId)?.parcelas.find((x) => x.id === parcelaId)
    if (p) p.notaFiscal = arquivo
    return { ok: true }
  },
}

export const mngProfissionalService = {
  tipos: async (): Promise<MngTipoProfissional[]> => { await delay(rand(250, 500)); return mngTiposProfissional },
  list: async (): Promise<MngProfissional[]> => { await delay(rand(300, 650)); return mngProfissionais },
  get: async (id: string): Promise<MngProfissionalDetalhe | undefined> => { await delay(rand(300, 600)); return mngProfissionalDetalhe(id) },
  /** Aprovar / devolver para análise / reprovar cadastro (RF-YN-03.5). */
  decidir: async (id: string, decisao: 'aprovar' | 'ajuste' | 'rejeitar'): Promise<{ ok: boolean }> => {
    await delay(rand(300, 600))
    const p = mngProfissionais.find((x) => x.id === id)
    if (p) p.status = decisao === 'aprovar' ? 'ativo' : decisao === 'ajuste' ? 'para-analise' : 'reprovado'
    return { ok: true }
  },
  /** Upsert de tipo de profissional — triagem + campos do cadastro (RF-YN-03.1). */
  salvarTipo: async (t: MngTipoProfissional): Promise<MngTipoProfissional> => {
    await delay(rand(300, 600))
    const saved: MngTipoProfissional = { ...t, id: t.id || `tipo-${mngTiposProfissional.length + 1}` }
    const i = mngTiposProfissional.findIndex((x) => x.id === saved.id)
    if (i >= 0) mngTiposProfissional[i] = saved
    else mngTiposProfissional.push(saved)
    return saved
  },
}

export const mngPlanoService = {
  /** Lista os planos de contratação (RF-YN-14.1). */
  list: async (): Promise<MngPlano[]> => { await delay(rand(250, 500)); return mngPlanos },
  /** Upsert de plano — cadastro/edição (RF-YN-14.1/14.2). */
  salvar: async (p: MngPlano): Promise<MngPlano> => {
    await delay(rand(300, 600))
    const saved: MngPlano = { ...p, id: p.id || `plano-${mngPlanos.length + 1}` }
    const i = mngPlanos.findIndex((x) => x.id === saved.id)
    if (i >= 0) mngPlanos[i] = saved
    else mngPlanos.push(saved)
    return saved
  },
  /** Ativa / inativa um plano (RF-YN-14.3). */
  toggleAtivo: async (id: string): Promise<{ ok: boolean }> => {
    await delay(rand(200, 400))
    const p = mngPlanos.find((x) => x.id === id)
    if (p) p.ativo = !p.ativo
    return { ok: true }
  },
}

export const mngSessaoService = {
  list: async (): Promise<MngSessao[]> => { await delay(rand(300, 650)); return mngSessoes },
}

export const mngMatchService = {
  list: async (): Promise<MngMatch[]> => { await delay(rand(300, 600)); return mngMatches },
}

export const mngConteudoService = {
  list: async (): Promise<MngConteudo[]> => { await delay(rand(300, 600)); return mngConteudos },
  /** Upsert de conteúdo (curso/live/artigo). Novo se o id não existir. */
  salvar: async (c: MngConteudo): Promise<MngConteudo> => {
    await delay(rand(300, 600))
    const saved: MngConteudo = { ...c, id: c.id || `ct-${mngConteudos.length + 1}`, atualizadoEm: MNG_TODAY }
    const i = mngConteudos.findIndex((x) => x.id === saved.id)
    if (i >= 0) mngConteudos[i] = saved
    else mngConteudos.push(saved)
    return saved
  },
}

export const mngNotaService = {
  list: async (): Promise<MngNota[]> => { await delay(rand(300, 600)); return mngNotas },
  /** Gerar pendência — dispara notificação ao profissional (RF-YN-10.8). */
  retificar: async (id: string, motivo: string): Promise<{ ok: boolean }> => {
    await delay(rand(300, 600))
    const n = mngNotas.find((x) => x.id === id)
    if (n) { n.status = 'requer-ajuste'; n.motivoAjuste = motivo }
    return { ok: true }
  },
  /** Aprovar a conferência — a nota fica aguardando pagamento (RF-YN-10.9). */
  aprovar: async (id: string): Promise<{ ok: boolean }> => {
    await delay(rand(300, 600))
    const n = mngNotas.find((x) => x.id === id)
    if (n) n.status = 'para-pagamento'
    return { ok: true }
  },
  /** Registrar pagamento — anexa comprovante + data e conclui (paga). */
  registrarPagamento: async (id: string, data: string, comprovante = 'comprovante.pdf'): Promise<{ ok: boolean }> => {
    await delay(rand(300, 600))
    const n = mngNotas.find((x) => x.id === id)
    if (n) { n.status = 'paga'; n.pagamento = { em: data, comprovante } }
    return { ok: true }
  },
  /** Simula o reenvio da nota ajustada pelo profissional (volta para análise). */
  reenviar: async (id: string): Promise<{ ok: boolean }> => {
    await delay(rand(300, 600))
    const n = mngNotas.find((x) => x.id === id)
    if (n) { n.status = 'em-analise'; n.motivoAjuste = undefined }
    return { ok: true }
  },
}

export const mngParcelaFinService = {
  /** Parcelas dos contratos das empresas, ordenadas por vencimento crescente. */
  list: async (): Promise<MngParcelaFin[]> => {
    await delay(rand(300, 600))
    return [...mngParcelasFin].sort((a, b) => a.vencimento.localeCompare(b.vencimento))
  },
  /** Enviar/editar nota fiscal + boleto — parcela passa a "emitida". */
  emitir: async (id: string, notaFiscal: string, boleto: string): Promise<{ ok: boolean }> => {
    await delay(rand(300, 600))
    const p = mngParcelasFin.find((x) => x.id === id)
    if (p) { p.notaFiscal = notaFiscal; p.boleto = boleto; if (p.status !== 'atrasada') p.status = 'emitida' }
    return { ok: true }
  },
  /** Dar baixa — registra data e valor pagos; parcela passa a "paga". */
  darBaixa: async (id: string, dataPagamento: string, valorPago: number): Promise<{ ok: boolean }> => {
    await delay(rand(300, 600))
    const p = mngParcelasFin.find((x) => x.id === id)
    if (p) { p.status = 'paga'; p.dataPagamento = dataPagamento; p.valorPago = valorPago }
    return { ok: true }
  },
}

export const mngModeloDocService = {
  list: async (): Promise<MngModeloDocumento[]> => { await delay(rand(250, 500)); return modelosDocumento },
  /** Upsert de modelo de documento. */
  salvar: async (m: MngModeloDocumento): Promise<MngModeloDocumento> => {
    await delay(rand(300, 600))
    const saved: MngModeloDocumento = { ...m, id: m.id || `md-${modelosDocumento.length + 1}`, atualizadoEm: MNG_TODAY }
    const i = modelosDocumento.findIndex((x) => x.id === saved.id)
    if (i >= 0) modelosDocumento[i] = saved
    else modelosDocumento.push(saved)
    return saved
  },
  excluir: async (id: string): Promise<{ ok: boolean }> => {
    await delay(rand(250, 500))
    const i = modelosDocumento.findIndex((x) => x.id === id)
    if (i >= 0) modelosDocumento.splice(i, 1)
    return { ok: true }
  },
}

export const mngTicketService = {
  list: async (): Promise<MngTicket[]> => { await delay(rand(300, 600)); return mngTickets },
  /** Responder um ticket — anexa a resposta e, se concluir, resolve o atendimento. */
  responder: async (id: string, texto: string, concluir: boolean, anexos: string[] = []): Promise<{ ok: boolean }> => {
    await delay(rand(300, 600))
    const t = mngTickets.find((x) => x.id === id)
    if (t) {
      t.respostas = [...(t.respostas ?? []), { id: `tr-${id}-${(t.respostas?.length ?? 0) + 1}`, autor: 'Backoffice YNA', em: `${MNG_TODAY}T09:00`, texto, anexos: anexos.length ? anexos : undefined }]
      t.status = concluir ? 'resolvido' : 'em-andamento'
    }
    return { ok: true }
  },
}

const GESTOR_PALETTES = ['lavender', 'pink', 'yellow'] as const

export const mngGestorService = {
  list: async (): Promise<MngGestor[]> => { await delay(rand(250, 500)); return mngGestores },
  /** Criar usuário — dispara convite por e-mail; entra como "convidado". */
  criar: async (input: { nome: string; email: string; perfil: MngGestor['perfil']; superAdmin: boolean }): Promise<MngGestor> => {
    await delay(rand(300, 600))
    const initials = input.nome.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || '?'
    const g: MngGestor = {
      id: `g-${mngGestores.length + 1}`, nome: input.nome.trim(), email: input.email.trim(), perfil: input.perfil,
      superAdmin: input.superAdmin || undefined, initials, palette: GESTOR_PALETTES[mngGestores.length % 3], status: 'convidado', mfa: false,
    }
    mngGestores.push(g)
    return g
  },
  /** Inativar usuário — revoga o acesso ao backoffice. */
  inativar: async (id: string): Promise<{ ok: boolean }> => {
    await delay(rand(250, 500))
    const g = mngGestores.find((x) => x.id === id)
    if (g) g.status = 'inativo'
    return { ok: true }
  },
}
