import { createContext, useContext, useState, type ReactNode } from 'react'
import type { UserProfile } from '../types'
import { mockUser } from '../data/mock'

/** Avaliação psicossocial em andamento (NR-1). Vive no AppContext porque
   atravessa intro → dimensões → conclusão, e o beneficiário pode parar e
   voltar. Nada aqui identifica a pessoa: são só as respostas do formulário
   em memória, enviadas de forma anônima ao concluir. */
export interface Nr1AvaliacaoEmAndamento {
  campanhaId: string
  /** Aceite do texto de anonimato/consentimento (RF-A02 / RNF-01). */
  consentiu: boolean
  /** Respostas por id de item — valor da escala ou texto das perguntas abertas. */
  respostas: Record<string, number | string>
  concluida: boolean
}

interface AppContextValue {
  user: UserProfile
  setUser: (u: UserProfile) => void
  setConsented: (v: boolean) => void
  setProfileComplete: (v: boolean) => void
  setTriagemComplete: (v: boolean) => void
  setHasMatches: (v: boolean) => void
  /** Avaliação NR-1 em andamento (null = não iniciada). */
  nr1: Nr1AvaliacaoEmAndamento | null
  nr1Iniciar: (campanhaId: string) => void
  nr1Consentir: () => void
  nr1Responder: (itemId: string, valor: number | string) => void
  nr1Concluir: () => void
  nr1Limpar: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile>(mockUser)

  const setUser = (u: UserProfile) => setUserState(u)

  const setConsented = (v: boolean) =>
    setUserState((prev) => ({ ...prev, hasConsented: v }))

  const setProfileComplete = (v: boolean) =>
    setUserState((prev) => ({ ...prev, hasCompletedProfile: v }))

  const setTriagemComplete = (v: boolean) =>
    setUserState((prev) => ({ ...prev, hasCompletedTriagem: v }))

  const setHasMatches = (v: boolean) =>
    setUserState((prev) => ({ ...prev, hasMatches: v }))

  const [nr1, setNr1] = useState<Nr1AvaliacaoEmAndamento | null>(null)

  /* Só reinicia se for outra campanha — voltar à intro no meio do
     preenchimento não pode apagar o que a pessoa já respondeu. */
  const nr1Iniciar = (campanhaId: string) =>
    setNr1((prev) =>
      prev && prev.campanhaId === campanhaId && !prev.concluida
        ? prev
        : { campanhaId, consentiu: false, respostas: {}, concluida: false },
    )

  const nr1Consentir = () => setNr1((prev) => (prev ? { ...prev, consentiu: true } : prev))

  const nr1Responder = (itemId: string, valor: number | string) =>
    setNr1((prev) => (prev ? { ...prev, respostas: { ...prev.respostas, [itemId]: valor } } : prev))

  const nr1Concluir = () => setNr1((prev) => (prev ? { ...prev, concluida: true } : prev))

  const nr1Limpar = () => setNr1(null)

  return (
    <AppContext.Provider
      value={{
        user, setUser, setConsented, setProfileComplete, setTriagemComplete, setHasMatches,
        nr1, nr1Iniciar, nr1Consentir, nr1Responder, nr1Concluir, nr1Limpar,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
