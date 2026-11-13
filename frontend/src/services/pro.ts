import type {
  ProProfile,
  ProSession,
  ProntuarioEntry,
  ProBeneficiarioDetail,
  PlanoTerapeutico,
  ProfileStrength,
} from '../types'
import { proProfile, proSessions, proProntuarios, proBeneficiarios } from '../data/proMock'

/* Camada de serviços do Profissional — mockada, com latência simulada.
   Na fase 2: onboarding + área logada com Perfil, Agenda e Configurações.
   Assinaturas espelham a futura API REST; trocar o corpo por fetch/axios. */
const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

/** Calcula o indicador "Perfil pronto para match" a partir do perfil.
   Fonte única de verdade — consumido pela home (PRO-12) e pelo perfil (PRO-09). */
export function computeProfileStrength(p: ProProfile): ProfileStrength {
  const items = [
    { key: 'foto', label: 'Foto de perfil', peso: 10, done: Boolean(p.fotoUrl), href: '/pro/perfil#foto' },
    { key: 'video', label: 'Vídeo de apresentação', peso: 25, done: Boolean(p.videoUrl), href: '/pro/perfil#video' },
    { key: 'bio', label: 'Bio', peso: 10, done: p.bio.trim().length > 0, href: '/pro/perfil#bio' },
    { key: 'comoTrabalha', label: '"Como trabalha"', peso: 10, done: p.comoTrabalha.trim().length > 0, href: '/pro/perfil#como-trabalha' },
    { key: 'abordagem', label: 'Linha teórica', peso: 15, done: p.linhasTeoricas.length > 0, href: '/pro/perfil#abordagem' },
    { key: 'areas', label: 'Áreas de atuação', peso: 15, done: p.areasAtuacao.length > 0, href: '/pro/perfil#areas' },
    { key: 'formacao', label: 'Formação e certificados', peso: 10, done: p.formation.length > 0, href: '/pro/perfil#formacao' },
    { key: 'agenda', label: 'Agenda configurada', peso: 5, done: true, href: '/pro/perfil#agenda' },
  ]
  const total = items.reduce((s, i) => s + i.peso, 0)
  const earned = items.reduce((s, i) => s + (i.done ? i.peso : 0), 0)
  return { percent: Math.round((earned / total) * 100), items }
}

export const proInviteService = {
  validate: async (token: string): Promise<{ valid: boolean; expired?: boolean }> => {
    await delay(rand(300, 600))
    if (token === 'expired') return { valid: false, expired: true }
    if (token === 'invalid') return { valid: false }
    return { valid: true }
  },
}

export const proProfileService = {
  get: async (): Promise<ProProfile> => {
    await delay(rand(300, 600))
    return proProfile
  },
  save: async (patch: Partial<ProProfile>): Promise<{ success: boolean }> => {
    await delay(rand(300, 600))
    Object.assign(proProfile, patch)
    return { success: true }
  },
  strength: async (): Promise<ProfileStrength> => {
    await delay(rand(150, 300))
    return computeProfileStrength(proProfile)
  },
}

export const proSessionService = {
  list: async (): Promise<ProSession[]> => {
    await delay(rand(300, 600))
    return proSessions
  },
  get: async (id: string): Promise<ProSession | undefined> => {
    await delay(rand(200, 400))
    return proSessions.find((s) => s.id === id)
  },
  cancel: async (id: string): Promise<void> => {
    await delay(rand(300, 500))
    const s = proSessions.find((x) => x.id === id)
    if (s) { s.status = 'cancelled'; s.salaAbertaSeg = undefined }
  },
}

export const proBeneficiarioService = {
  list: async (): Promise<ProBeneficiarioDetail[]> => {
    await delay(rand(300, 600))
    return proBeneficiarios
  },
  get: async (id: string): Promise<ProBeneficiarioDetail | undefined> => {
    await delay(rand(300, 600))
    return proBeneficiarios.find((b) => b.id === id)
  },
  /** Salva o plano terapêutico (carimba a data de atualização). */
  savePlano: async (id: string, plano: PlanoTerapeutico): Promise<PlanoTerapeutico> => {
    await delay(rand(200, 400))
    const stamped: PlanoTerapeutico = { ...plano, atualizadoEm: new Date().toLocaleDateString('pt-BR') }
    const b = proBeneficiarios.find((x) => x.id === id)
    if (b) b.plano = stamped
    return stamped
  },
}

export const proProntuarioService = {
  history: async (): Promise<ProntuarioEntry[]> => {
    await delay(rand(300, 500))
    return proProntuarios
  },
  save: async (entry: Omit<ProntuarioEntry, 'id'>): Promise<{ success: boolean }> => {
    await delay(rand(300, 600))
    proProntuarios.push({ id: `pront-${Date.now()}`, ...entry })
    return { success: true }
  },
}

