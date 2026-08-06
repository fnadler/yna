import type { MngGestor, MngEmpresa, MngContatoMaster, MngTicket, MngCockpit } from '../types'
import {
  mngGestores, mngEmpresas, mngTickets, mngCockpit, MNG_TODAY,
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
  /** Cockpit de conformidade (MNG-02, §5.1). */
  cockpit: async (): Promise<MngCockpit> => { await delay(rand(300, 600)); return mngCockpit },
}

export const mngEmpresaService = {
  list: async (): Promise<MngEmpresa[]> => { await delay(rand(300, 600)); return mngEmpresas },
  get: async (id: string): Promise<MngEmpresa | undefined> => { await delay(rand(250, 500)); return mngEmpresas.find((e) => e.id === id) },
  /** Cria a conta corporativa + primeiro contrato + usuário(s) Master + CSM
     (RF-YN-02.1/02.2). A empresa entra como "ativa"; os Masters recebem o link
     de primeiro acesso. Contrato é só dado cadastral (§12): sem parcelas nem
     cobrança neste recorte. */
  create: async (p: {
    razaoSocial: string; nomeFantasia: string; cnpj: string; segmento: string
    masters: MngContatoMaster[]; csmId: string
    plano: string; colaboradoresContratados: number
    inicio: string; fim: string
  }): Promise<MngEmpresa> => {
    await delay(rand(500, 900))
    const initials = p.nomeFantasia.trim().split(/\s+/).slice(0, 3).map((w) => w[0]).join('').toUpperCase() || 'YN'
    const now = Date.now()
    const empresa: MngEmpresa = {
      id: `e-${now}`,
      razaoSocial: p.razaoSocial, nomeFantasia: p.nomeFantasia, cnpj: p.cnpj, segmento: p.segmento,
      contatoRh: `${p.masters[0]?.nome ?? ''} · RH`, status: 'ativa',
      colaboradoresContratados: p.colaboradoresContratados, colaboradoresAtivos: 0, initials,
      contratos: [{
        id: `c-${now}`, plano: p.plano, colaboradoresContratados: p.colaboradoresContratados,
        inicio: p.inicio, fim: p.fim, status: 'vigente', execucaoPct: 0,
      }],
      masters: p.masters,
      csmId: p.csmId,
      funil: { enviado: 0, aberto: 0, cadastroIniciado: 0, cadastroConcluido: 0 },
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
     por empresa — dado cadastral, sem cobrança (§12). */
  novoContrato: async (empresaId: string, p: {
    plano: string; inicio: string; fim: string; colaboradoresContratados: number
  }): Promise<{ ok: boolean }> => {
    await delay(rand(400, 800))
    const e = mngEmpresas.find((x) => x.id === empresaId)
    if (!e) return { ok: false }
    e.contratos.forEach((c) => { if (c.status === 'vigente') c.status = 'encerrado' })
    e.contratos.unshift({
      id: `c-${Date.now()}`, plano: p.plano, colaboradoresContratados: p.colaboradoresContratados,
      inicio: p.inicio, fim: p.fim, status: 'vigente', execucaoPct: 0,
    })
    e.colaboradoresContratados = p.colaboradoresContratados
    return { ok: true }
  },
  /** Altera a CSM responsável (perfil comercial). */
  setCsm: async (empresaId: string, gestorId: string): Promise<{ ok: boolean }> => {
    await delay(rand(200, 450))
    const e = mngEmpresas.find((x) => x.id === empresaId)
    if (e) e.csmId = gestorId
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
