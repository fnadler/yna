import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { Avatar } from '../components/Avatar'
import { mockSession } from '../data/mock'

export function Ben24bConfirmacao({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center px-5 pb-8 pt-6 lg:pt-10 text-center">

      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-success-bg animate-yna-logo">
        <Icon icon="ph:check-circle-bold" width={32} className="text-success" aria-hidden />
      </div>

      <div className="mb-8 animate-yna-slide-up animate-yna-delay-100">
        <h2 className="text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-ink">
          Reagendado!
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-secondary">
          Seu novo horário foi confirmado. Você receberá uma atualização por e-mail.
        </p>
      </div>

      <div className="mb-6 w-full rounded-lg border border-border bg-surface p-5 animate-yna-slide-up animate-yna-delay-250">
        <div className="flex items-center gap-3">
          <Avatar
            initials={mockSession.professionalInitials}
            size={48}
            palette={mockSession.professionalPalette}
          />
          <div className="text-left">
            <p className="font-semibold text-ink">{mockSession.professional}</p>
            <p className="text-sm text-ink-secondary">Novo horário confirmado</p>
          </div>
        </div>
      </div>

      <div className="w-full animate-yna-slide-up animate-yna-delay-400">
        <Button size="lg" fullWidth onClick={onClose}>
          Entendido
        </Button>
      </div>

    </div>
  )
}
