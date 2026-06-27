import { Icon } from '@iconify/react'
import { Avatar } from './Avatar'
import { Badge } from './Badge'
import { Button } from './Button'
import { Card } from './Card'
import type { Professional } from '../types'

/* Card do profissional na listagem de matches do beneficiário (BEN-12).
   Layout único, reusado também na pré-visualização do profissional (PRO-10),
   onde os botões ficam inativos (`disabled`). */
export function MatchCard({ pro, onViewProfile, onSchedule, disabled = false }: {
  pro: Professional
  onViewProfile?: () => void
  onSchedule?: () => void
  disabled?: boolean
}) {
  return (
    <Card padding="none" className="shadow-sm">
      <div
        className="relative flex aspect-video w-full items-center justify-center bg-yna-gradient-soft dark:bg-none dark:bg-surface-2"
        role="img"
        aria-label={`Vídeo de apresentação de ${pro.name}, duração ${pro.videoLength}`}
      >
        <Avatar initials={pro.initials} size={64} palette={pro.palette} />
        <button
          disabled={disabled}
          aria-label={`Assistir apresentação de ${pro.name}`}
          className="absolute inset-0 flex items-center justify-center disabled:cursor-default"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-[rgba(31,27,45,0.72)] text-white shadow-lg transition-transform hover:scale-105">
            <Icon icon="ph:play-fill" width={22} aria-hidden />
          </span>
        </button>
        <span className="absolute bottom-3 right-3 rounded-pill bg-[rgba(31,27,45,0.72)] px-2.5 py-1 font-mono text-[11px] font-medium text-white">
          {pro.videoLength}
        </span>
        <span className="absolute left-3 top-3">
          <Badge tone="solid" icon="ph:seal-check-bold">Curadoria YNA</Badge>
        </span>
      </div>

      <div className="flex flex-col gap-3 p-5 pt-4">
        <div>
          <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">{pro.name}</h3>
          <p className="mt-0.5 text-[13px] text-ink-secondary">{pro.crp}</p>
        </div>

        <div className="flex w-fit items-center gap-1.5 rounded-sm bg-primary-50 px-2.5 py-1.5 text-[12px] font-medium text-primary dark:text-primary-300">
          <Icon icon="ph:brain-bold" width={13} className="shrink-0" aria-hidden />
          {pro.approachLong}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {pro.specialties.map((s) => (
            <Badge key={s} tone="neutral">{s}</Badge>
          ))}
        </div>

        <p className="rounded-sm border-l-2 border-primary-300 bg-surface-2 px-3 py-2.5 text-[13px] leading-snug text-ink-secondary">
          {pro.whyThisMatch}
        </p>

        <p className="flex items-center gap-2 text-sm font-medium text-ink">
          <Icon icon="ph:calendar-bold" width={16} className="text-success" aria-hidden />
          Próximo horário: {pro.nextSlot}
        </p>

        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="flex-1" disabled={disabled} onClick={onViewProfile}>
            Ver perfil
          </Button>
          <Button size="sm" className="flex-1" disabled={disabled} onClick={onSchedule}>
            Agendar
          </Button>
        </div>
      </div>
    </Card>
  )
}
