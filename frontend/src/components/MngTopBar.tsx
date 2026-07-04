import { useNavigate } from 'react-router-dom'
import { MobileTopBar } from './MobileTopBar'
import { useMng } from '../contexts/MngContext'

/* Top-bar mobile do Manager: reusa o MobileTopBar (logo + tema + sino). */
export function MngTopBar() {
  const navigate = useNavigate()
  const { unreadNotifs } = useMng()
  return <MobileTopBar unread={unreadNotifs} onBellClick={() => navigate('/mng/notificacoes')} />
}
