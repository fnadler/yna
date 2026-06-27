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
  RhImportResult,
} from '../types'
import {
  rhEmpresa,
  rhEquipe,
  rhDepartamentos,
  rhBeneficiarios,
  rhFunilConvites,
  rhKpis,
  rhHeatmap,
  rhAlertas,
  rhNotificacoes,
} from '../data/rhMock'

/* Camada de serviços do RH / Empresa B2B — mockada, com latência simulada.
   Assinaturas espelham a futura API REST; trocar o corpo por fetch/axios.
   Toda saída para o RH é agregada/anonimizada — nunca expõe dado clínico
   ou de jornada individual do beneficiário (RN-RH-04.2 / RN-RH-06.1). */

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

export const rhInviteService = {
  /** Valida o token de primeiro acesso do usuário Master (RF-RH-01.2). */
  validate: async (token: string): Promise<{ valid: boolean; expired?: boolean }> => {
    await delay(rand(300, 600))
    if (token === 'expired') return { valid: false, expired: true }
    if (token === 'invalid') return { valid: false }
    return { valid: true }
  },
}

export const rhEmpresaService = {
  get: async (): Promise<RhEmpresa> => {
    await delay(rand(250, 500))
    return rhEmpresa
  },
  save: async (patch: Partial<RhEmpresa>): Promise<{ success: boolean }> => {
    await delay(rand(300, 600))
    Object.assign(rhEmpresa, patch)
    return { success: true }
  },
}

export const rhEquipeService = {
  list: async (): Promise<RhUsuario[]> => {
    await delay(rand(300, 600))
    return rhEquipe
  },
  /** Apenas Master pode criar Masters/Operadores (RN-RH-03.1). */
  invite: async (u: { nome: string; email: string; papel: RhUsuario['papel'] }): Promise<RhUsuario> => {
    await delay(rand(300, 600))
    const initials = u.nome
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase()
    const novo: RhUsuario = {
      id: `u-${Date.now()}`,
      nome: u.nome,
      email: u.email,
      papel: u.papel,
      initials,
      palette: 'lavender',
      status: 'convidado',
    }
    rhEquipe.push(novo)
    return novo
  },
  remove: async (id: string): Promise<{ success: boolean }> => {
    await delay(rand(200, 400))
    const i = rhEquipe.findIndex((u) => u.id === id)
    if (i >= 0) rhEquipe.splice(i, 1)
    return { success: true }
  },
}

export const rhDepartamentoService = {
  list: async (): Promise<RhDepartamento[]> => {
    await delay(rand(250, 500))
    return rhDepartamentos
  },
  create: async (nome: string): Promise<RhDepartamento> => {
    await delay(rand(300, 600))
    const novo: RhDepartamento = { id: `d-${Date.now()}`, nome, beneficiarios: 0 }
    rhDepartamentos.push(novo)
    return novo
  },
  rename: async (id: string, nome: string): Promise<{ success: boolean }> => {
    await delay(rand(200, 400))
    const d = rhDepartamentos.find((x) => x.id === id)
    if (d) d.nome = nome
    return { success: true }
  },
  remove: async (id: string): Promise<{ success: boolean }> => {
    await delay(rand(200, 400))
    const i = rhDepartamentos.findIndex((x) => x.id === id)
    if (i >= 0) rhDepartamentos.splice(i, 1)
    return { success: true }
  },
}

export const rhBeneficiarioService = {
  list: async (): Promise<RhBeneficiario[]> => {
    await delay(rand(350, 650))
    return rhBeneficiarios
  },
  /** Cadastro individual (RF-RH-04.3). */
  create: async (b: {
    nomeCompleto: string
    cpf: string
    emailCorporativo: string
    departamentoId: string
  }): Promise<RhBeneficiario> => {
    await delay(rand(300, 600))
    const partes = b.nomeCompleto.split(' ')
    const initials = (partes[0][0] + (partes[1]?.[0] ?? '')).toUpperCase()
    const novo: RhBeneficiario = {
      id: `b-${Date.now()}`,
      nomeCompleto: b.nomeCompleto,
      cpfMascarado: `***.***.***-${b.cpf.replace(/\D/g, '').slice(-2) || '00'}`,
      emailCorporativo: b.emailCorporativo,
      departamentoId: b.departamentoId,
      status: 'nao_convidado',
      initials,
      palette: 'lavender',
    }
    rhBeneficiarios.unshift(novo)
    return novo
  },
  /** Edição em massa de departamento (RF-RH-04.5). */
  moverDepartamento: async (ids: string[], departamentoId: string): Promise<{ count: number }> => {
    await delay(rand(300, 600))
    let count = 0
    rhBeneficiarios.forEach((b) => {
      if (ids.includes(b.id)) {
        b.departamentoId = departamentoId
        count++
      }
    })
    return { count }
  },
  /** Exclusão do beneficiário (libera a licença). No backend mantém histórico
     anonimizado para auditoria (RF-RH-04.6 / RN-RH-07.1). */
  remove: async (id: string): Promise<{ success: boolean }> => {
    await delay(rand(250, 500))
    const i = rhBeneficiarios.findIndex((x) => x.id === id)
    if (i >= 0) rhBeneficiarios.splice(i, 1)
    return { success: true }
  },
  /** Simula o processamento de uma planilha (RF-RH-04.2). */
  importar: async (linhas: number): Promise<RhImportResult> => {
    await delay(rand(700, 1300))
    const erros = [
      { linha: 14, nome: 'João  Alves', email: 'joao.alves@', erro: 'E-mail corporativo inválido' },
      { linha: 27, nome: 'Marina Pires', email: 'marina.pires@bcpsecurities.com', erro: 'CPF inválido' },
      { linha: 39, nome: 'Carlos Brito', email: 'carlos.brito@bcpsecurities.com', erro: 'E-mail duplicado (linha 8)' },
    ]
    return {
      total: linhas,
      validos: Math.max(0, linhas - erros.length),
      duplicados: 1,
      erros,
    }
  },
}

export const rhConviteService = {
  funil: async (): Promise<RhFunilConvites> => {
    await delay(rand(300, 600))
    return rhFunilConvites
  },
  /** Dispara/agenda convites em lote (RF-RH-05.1/02/03). */
  disparar: async (ids: string[]): Promise<{ enviados: number }> => {
    await delay(rand(400, 800))
    let enviados = 0
    rhBeneficiarios.forEach((b) => {
      if (ids.includes(b.id) && b.status === 'nao_convidado') {
        b.status = 'convidado'
        b.convidadoEm = new Date().toISOString().slice(0, 10)
        enviados++
      }
    })
    return { enviados }
  },
}

export const rhDashboardService = {
  kpis: async (): Promise<RhKpi[]> => {
    await delay(rand(300, 600))
    return rhKpis
  },
  heatmap: async (): Promise<RhHeatRow[]> => {
    await delay(rand(350, 650))
    return rhHeatmap
  },
  alertas: async (): Promise<RhAlerta[]> => {
    await delay(rand(250, 500))
    return rhAlertas
  },
  /** Exportação assíncrona do one-page (RF-RH-06.4 / RNF-RH-06.2). */
  exportarRelatorio: async (): Promise<{ success: boolean }> => {
    await delay(rand(800, 1400))
    return { success: true }
  },
}

export const rhNotificacaoService = {
  list: async (): Promise<RhNotificacao[]> => {
    await delay(rand(200, 400))
    return rhNotificacoes
  },
}
