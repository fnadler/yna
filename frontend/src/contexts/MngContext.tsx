import { createContext, useContext, useState, type ReactNode } from 'react'
import type { MngGestor, MngNotificacao } from '../types'
import { mngGestorAtual, mngNotificacoes } from '../data/mngMock'

/* Estado do Manager / Backoffice YNA (Fluxo 4). Isolado dos demais perfis.
   ThemeContext continua compartilhado. */

interface MngContextValue {
  gestor: MngGestor
  isSuperAdmin: boolean
  notificacoes: MngNotificacao[]
  unreadNotifs: number
  marcarLida: (id: string) => void
}

const MngContext = createContext<MngContextValue | null>(null)

export function MngProvider({ children }: { children: ReactNode }) {
  const [gestor] = useState<MngGestor>(mngGestorAtual)
  const [notificacoes, setNotificacoes] = useState<MngNotificacao[]>(mngNotificacoes)
  const unreadNotifs = notificacoes.filter((n) => !n.lida).length
  const marcarLida = (id: string) => setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)))
  const isSuperAdmin = gestor.perfil === 'super-admin' || !!gestor.superAdmin

  return (
    <MngContext.Provider value={{ gestor, isSuperAdmin, notificacoes, unreadNotifs, marcarLida }}>
      {children}
    </MngContext.Provider>
  )
}

export function useMng() {
  const ctx = useContext(MngContext)
  if (!ctx) throw new Error('useMng must be inside MngProvider')
  return ctx
}
