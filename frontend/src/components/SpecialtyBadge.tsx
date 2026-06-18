import { Icon } from '@iconify/react'
import type { Specialty } from '../types'

export const SPECIALTY_CONFIG: Record<Specialty, { label: string; icon: string; pill: string }> = {
  'saude-mental': {
    label: 'Saúde Mental',
    icon: 'ph:brain-bold',
    pill: 'bg-primary-50 text-primary dark:bg-primary/20 dark:text-primary-300',
  },
  nutricao: {
    label: 'Nutrição',
    icon: 'ph:leaf-bold',
    pill: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  fisioterapia: {
    label: 'Fisioterapia',
    icon: 'ph:person-simple-run-bold',
    pill: 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  },
}

export function SpecialtyBadge({ specialty }: { specialty?: Specialty }) {
  if (!specialty) return null
  const cfg = SPECIALTY_CONFIG[specialty]
  return (
    <span className={`inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[11px] font-medium ${cfg.pill}`}>
      <Icon icon={cfg.icon} width={11} aria-hidden />
      {cfg.label}
    </span>
  )
}
