import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { ProProfile, ProfileStrength, ProDisponibilidade, ProCadastro } from '../types'
import { proProfile, disponibilidadeInicial, proCadastroDemo } from '../data/proMock'
import { computeProfileStrength } from '../services/pro'

/* Estado do fluxo do Profissional (onboarding + área logada). Isolado dos
   demais perfis; ThemeContext continua compartilhado. */

interface ProContextValue {
  profile: ProProfile
  setProfile: (p: ProProfile) => void
  updateProfile: (patch: Partial<ProProfile>) => void
  /** "Perfil pronto para match" — derivado do perfil (fonte única de verdade). */
  strength: ProfileStrength
  /** Disponibilidade (atendimento, plantão, bloqueios) — editada na Agenda, resumida no Perfil. */
  disponibilidade: ProDisponibilidade
  setDisponibilidade: (d: ProDisponibilidade) => void
  /** Cadastro do profissional (5 steps) — compartilhado entre cadastro e ativação. */
  cadastro: ProCadastro
  updateCadastro: (patch: Partial<ProCadastro>) => void
}

const ProContext = createContext<ProContextValue | null>(null)

export function ProProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<ProProfile>(proProfile)
  const setProfile = (p: ProProfile) => setProfileState(p)
  const updateProfile = (patch: Partial<ProProfile>) => setProfileState((prev) => ({ ...prev, ...patch }))
  const strength = useMemo(() => computeProfileStrength(profile), [profile])
  const [disponibilidade, setDisponibilidade] = useState<ProDisponibilidade>(disponibilidadeInicial)
  const [cadastro, setCadastro] = useState<ProCadastro>(proCadastroDemo)
  const updateCadastro = (patch: Partial<ProCadastro>) => setCadastro((prev) => ({ ...prev, ...patch }))

  return (
    <ProContext.Provider value={{ profile, setProfile, updateProfile, strength, disponibilidade, setDisponibilidade, cadastro, updateCadastro }}>
      {children}
    </ProContext.Provider>
  )
}

export function usePro() {
  const ctx = useContext(ProContext)
  if (!ctx) throw new Error('usePro must be inside ProProvider')
  return ctx
}
