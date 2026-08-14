import { createContext, useContext, useState, type ReactNode } from 'react'
import type { UserProfile } from '../types'
import { mockUser } from '../data/mock'

/** Avaliação psicossocial em andamento (NR-1). Vive no AppContext porque
   atravessa intro → dimensões → conclusão, e o colaborador pode parar e
   voltar. Nada aqui identifica a pessoa: são só as respostas do formulário
   em memória, enviadas de forma anônima ao concluir — inclusive o
   consentimento LGPD (RF-A02/RNF-01) mora aqui, não no perfil, porque hoje
   a avaliação acontece antes de existir qualquer conta. */
export interface Nr1AvaliacaoEmAndamento {
  campanhaId: string
  consentiu: boolean
  respostas: Record<string, number | string>
  concluida: boolean
}

/** Respostas opcionais coletadas na criação da conta (não fazem parte do
   instrumento NR-1: não entram no inventário nem no relatório do RH — só
   alimentam um agregado comercial que o backoffice YNA usa para estimar
   adesão futura a um serviço de cuidado que ainda não existe no produto). */
export interface PerfilInteresseCuidado {
  interesseCuidado?: 'sim' | 'nao' | 'talvez'
  emTratamento?: 'sim' | 'nao' | 'prefiro-nao-informar'
}

interface AppContextValue {
  user: UserProfile
  setUser: (u: UserProfile) => void
  /** Token do convite, guardado desde /convite/:token até a criação da conta
     em /criar-conta — nunca lido por services/rh.ts nem exposto ao RH. */
  sessaoToken: string | null
  setSessaoToken: (token: string) => void
  contaCriada: boolean
  perfilInteresse: PerfilInteresseCuidado | null
  criarConta: (dados: { nome: string; apelido: string; email?: string } & PerfilInteresseCuidado) => void
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

  const [sessaoToken, setSessaoToken] = useState<string | null>(null)
  const [contaCriada, setContaCriada] = useState(false)
  const [perfilInteresse, setPerfilInteresse] = useState<PerfilInteresseCuidado | null>(null)

  const criarConta: AppContextValue['criarConta'] = ({ nome, apelido, email, interesseCuidado, emTratamento }) => {
    setUserState((prev) => ({ ...prev, name: nome, nickname: apelido, email: email ?? prev.email }))
    setPerfilInteresse({ interesseCuidado, emTratamento })
    setContaCriada(true)
  }

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
        user, setUser, sessaoToken, setSessaoToken, contaCriada, perfilInteresse, criarConta,
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
