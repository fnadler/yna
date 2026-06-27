import { useNavigate } from 'react-router-dom'
import { MobileTopBar } from './MobileTopBar'
import { useRh } from '../contexts/RhContext'

/* Top-bar mobile do RH: reusa o MobileTopBar (logo + tema + sino) já injetando
   o contador de não lidas e a navegação para as notificações. */
export function RhTopBar() {
  const navigate = useNavigate()
  const { unreadNotifs } = useRh()
  return <MobileTopBar unread={unreadNotifs} onBellClick={() => navigate('/rh/conta')} />
}
