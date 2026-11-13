import { Badge } from './Badge'
import type { ProSession } from '../types'

/* Status da sessão → rótulo, tom e ícone do badge. Fonte única usada na
   Agenda (PRO-13) e na home (PRO-12). */
export const SESSION_STATUS: Record<ProSession['status'], { label: string; tone: 'neutral' | 'primary' | 'success' | 'danger'; icon: string }> = {
  scheduled: { label: 'Agendada', tone: 'neutral', icon: 'ph:calendar-dots-bold' },
  confirmed: { label: 'Confirmada', tone: 'primary', icon: 'ph:check-circle-bold' },
  completed: { label: 'Realizada', tone: 'success', icon: 'ph:check-bold' },
  cancelled: { label: 'Cancelada', tone: 'danger', icon: 'ph:x-circle-bold' },
}

export function SessionStatusBadge({ status, className = '' }: { status: ProSession['status']; className?: string }) {
  const cfg = SESSION_STATUS[status]
  return <Badge tone={cfg.tone} icon={cfg.icon} className={className}>{cfg.label}</Badge>
}
