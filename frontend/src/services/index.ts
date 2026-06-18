import type { Professional, Session, TriagemQuestion, WheelOfLife } from '../types'
import {
  professionals,
  mockSession,
  triagemQuestions,
  wheelOfLife,
  availableSlots,
} from '../data/mock'

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

export const inviteService = {
  validate: async (token: string): Promise<{ valid: boolean; expired?: boolean; used?: boolean }> => {
    await delay(rand(300, 600))
    if (token === 'expired') return { valid: false, expired: true }
    if (token === 'used') return { valid: false, used: true }
    if (token === 'invalid') return { valid: false }
    return { valid: true }
  },
}

export const profileService = {
  prefill: async () => {
    await delay(rand(400, 700))
    return {
      name: 'Mariana Costa',
      email: 'mariana.costa@empresa.com.br',
      company: 'Empresa Parceira S.A.',
      department: 'Tecnologia',
    }
  },
  save: async (data: Record<string, string>) => {
    await delay(rand(300, 600))
    return { success: true, ...data }
  },
}

export const triagemService = {
  getQuestions: async (): Promise<TriagemQuestion[]> => {
    await delay(rand(300, 500))
    return triagemQuestions
  },
  saveAnswer: async (questionNumber: number, answer: string | number) => {
    await delay(rand(150, 300))
    return { saved: true, questionNumber, answer }
  },
}

export const matchService = {
  getMatches: async (): Promise<Professional[]> => {
    await delay(rand(1200, 2000))
    return professionals
  },
  getProfessional: async (id: string): Promise<Professional | null> => {
    await delay(rand(300, 500))
    return professionals.find((p) => p.id === id) ?? null
  },
  recalculate: async (): Promise<Professional[]> => {
    await delay(rand(1500, 2500))
    return [...professionals].reverse()
  },
}

export const sessionService = {
  getNext: async (): Promise<Session | null> => {
    await delay(rand(300, 500))
    return mockSession
  },
  getSlots: async (professionalId: string) => {
    await delay(rand(400, 700))
    return { professionalId, slots: availableSlots }
  },
  book: async (professionalId: string, date: string, time: string): Promise<Session> => {
    await delay(rand(600, 900))
    return {
      ...mockSession,
      professionalId,
      date,
      time,
      status: 'scheduled',
    }
  },
  cancel: async (sessionId: string) => {
    await delay(rand(300, 500))
    return { cancelled: true, sessionId }
  },
  reschedule: async (sessionId: string, date: string, time: string) => {
    await delay(rand(400, 600))
    return { ...mockSession, id: sessionId, date, time }
  },
  submitFeedback: async (sessionId: string, rating: number, note?: string) => {
    await delay(rand(300, 500))
    return { saved: true, sessionId, rating, note }
  },
}

export const checkInService = {
  getWheelOfLife: async (): Promise<WheelOfLife> => {
    await delay(rand(300, 500))
    return wheelOfLife
  },
  saveCheckIn: async (answers: Record<string, number | string>) => {
    await delay(rand(400, 600))
    return { saved: true, answers }
  },
}
