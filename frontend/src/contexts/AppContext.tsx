import { createContext, useContext, useState, type ReactNode } from 'react'
import type { UserProfile } from '../types'
import { mockUser } from '../data/mock'

interface AppContextValue {
  user: UserProfile
  setUser: (u: UserProfile) => void
  setConsented: (v: boolean) => void
  setProfileComplete: (v: boolean) => void
  setTriagemComplete: (v: boolean) => void
  setHasMatches: (v: boolean) => void
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

  return (
    <AppContext.Provider
      value={{ user, setUser, setConsented, setProfileComplete, setTriagemComplete, setHasMatches }}
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
