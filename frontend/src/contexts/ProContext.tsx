import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { ProProfile, ProfileStrength } from '../types'
import { proProfile, proNotificacoes } from '../data/proMock'
import { computeProfileStrength } from '../services/pro'

/* Estado do fluxo do Profissional. Isolado do AppContext (beneficiário).
   ThemeContext continua compartilhado entre os dois perfis. */

interface ProContextValue {
  profile: ProProfile
  setProfile: (p: ProProfile) => void
  updateProfile: (patch: Partial<ProProfile>) => void
  /** "Perfil pronto para match" — derivado do perfil (fonte única de verdade). */
  strength: ProfileStrength
  /** Notificações não lidas — usado pelo sino (top-bar mobile + sidebar desktop). */
  unreadNotifs: number
}

const ProContext = createContext<ProContextValue | null>(null)

export function ProProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<ProProfile>(proProfile)

  const setProfile = (p: ProProfile) => setProfileState(p)
  const updateProfile = (patch: Partial<ProProfile>) =>
    setProfileState((prev) => ({ ...prev, ...patch }))

  const strength = useMemo(() => computeProfileStrength(profile), [profile])
  const unreadNotifs = useMemo(() => proNotificacoes.filter((n) => !n.lida).length, [])

  return (
    <ProContext.Provider value={{ profile, setProfile, updateProfile, strength, unreadNotifs }}>
      {children}
    </ProContext.Provider>
  )
}

export function usePro() {
  const ctx = useContext(ProContext)
  if (!ctx) throw new Error('usePro must be inside ProProvider')
  return ctx
}
