import { MobileTopBar } from './MobileTopBar'

/* Top-bar mobile do Profissional: reusa o MobileTopBar (logo + tema). Na
   fase 2 ainda não há central de notificações do profissional, então o
   sino fica oculto. */
export function ProTopBar() {
  return <MobileTopBar showBell={false} />
}
