import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { RhEmpresa, RhUsuario } from '../types'
import { rhEmpresa, rhUsuarioAtual, rhNotificacoes } from '../data/rhMock'

/* Estado do fluxo RH / Empresa B2B. Isolado do AppContext (beneficiário) e do
   ProContext (profissional). ThemeContext continua compartilhado.
   O RH nunca acessa dados clínicos/individuais — só agregados (LGPD). */

interface RhContextValue {
  empresa: RhEmpresa
  setEmpresa: (e: RhEmpresa) => void
  updateEmpresa: (patch: Partial<RhEmpresa>) => void
  /** Usuário corporativo logado (Master ou Operador). */
  usuario: RhUsuario
  /** Conveniência: o usuário logado é Master? (governa permissões RN-RH-03.1). */
  isMaster: boolean
  /** Notificações não lidas — usado pelo sino (top-bar mobile + sidebar). */
  unreadNotifs: number
}

const RhContext = createContext<RhContextValue | null>(null)

export function RhProvider({ children }: { children: ReactNode }) {
  const [empresa, setEmpresaState] = useState<RhEmpresa>(rhEmpresa)
  const [usuario] = useState<RhUsuario>(rhUsuarioAtual)

  const setEmpresa = (e: RhEmpresa) => setEmpresaState(e)
  const updateEmpresa = (patch: Partial<RhEmpresa>) =>
    setEmpresaState((prev) => ({ ...prev, ...patch }))

  const unreadNotifs = useMemo(() => rhNotificacoes.filter((n) => !n.lida).length, [])
  const isMaster = usuario.papel === 'master'

  return (
    <RhContext.Provider value={{ empresa, setEmpresa, updateEmpresa, usuario, isMaster, unreadNotifs }}>
      {children}
    </RhContext.Provider>
  )
}

export function useRh() {
  const ctx = useContext(RhContext)
  if (!ctx) throw new Error('useRh must be inside RhProvider')
  return ctx
}
