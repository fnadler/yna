import { useNavigate } from 'react-router-dom'
import { MobileTopBar } from './MobileTopBar'
import { usePro } from '../contexts/ProContext'

/* Top-bar mobile do Profissional: reusa o MobileTopBar (logo + tema + sino)
   já injetando o contador de não lidas e a navegação para as notificações,
   para manter o sino funcional e consistente em todas as telas logadas. */
export function ProTopBar() {
  const navigate = useNavigate()
  const { unreadNotifs } = usePro()
  return <MobileTopBar unread={unreadNotifs} onBellClick={() => navigate('/pro/notificacoes')} />
}
