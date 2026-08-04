import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { RhEmpresa, RhUsuario } from '../types'
import { rhEmpresa, rhUsuarioAtual, rhNotificacoes } from '../data/rhMock'

/* Estado do fluxo RH / Empresa B2B. Isolado do AppContext (beneficiário) e do
   ProContext (profissional). ThemeContext continua compartilhado.
   O RH nunca acessa dados clínicos/individuais — só agregados (LGPD). */

/** Instrumento aplicado na campanha NR-1 corrente. Fica no contexto porque
   inventário, relatório e mapa de calor precisam CITAR modelo + versão — a
   rastreabilidade metodológica é o que torna a conformidade defensável
   (RF-A04 / RF-F02). O RH seleciona e aplica; nunca edita o questionário. */
export interface RhInstrumentoNr1 {
  campanhaId: string
  protocolo: string
  modeloId: string
  modeloNome: string
  versao: string
}

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
  /** Modelo + versão aplicados na campanha NR-1 corrente (null até carregar). */
  instrumentoNr1: RhInstrumentoNr1 | null
  setInstrumentoNr1: (i: RhInstrumentoNr1) => void
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

  const [instrumentoNr1, setInstrumentoNr1] = useState<RhInstrumentoNr1 | null>(null)

  return (
    <RhContext.Provider
      value={{
        empresa, setEmpresa, updateEmpresa, usuario, isMaster, unreadNotifs,
        instrumentoNr1, setInstrumentoNr1,
      }}
    >
      {children}
    </RhContext.Provider>
  )
}

export function useRh() {
  const ctx = useContext(RhContext)
  if (!ctx) throw new Error('useRh must be inside RhProvider')
  return ctx
}
