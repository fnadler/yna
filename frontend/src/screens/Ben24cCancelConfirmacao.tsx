import { Icon } from '@iconify/react'
import { Button } from '../components/Button'

export function Ben24cCancelConfirmacao({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center px-5 pb-8 pt-6 lg:pt-10 text-center">

      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2 animate-yna-logo">
        <Icon icon="ph:calendar-x-bold" width={32} className="text-ink-secondary" aria-hidden />
      </div>

      <div className="mb-8 animate-yna-slide-up animate-yna-delay-100">
        <h2 className="text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-ink">
          Sessão cancelada
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-secondary">
          Sua sessão foi cancelada com sucesso. Você receberá uma confirmação por e-mail.
          Pode agendar uma nova sessão quando quiser.
        </p>
      </div>

      <div className="w-full animate-yna-slide-up animate-yna-delay-250">
        <Button size="lg" fullWidth onClick={onClose}>
          Entendido
        </Button>
      </div>

    </div>
  )
}
