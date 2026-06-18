import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { YnaIcon } from '../components/YnaIcons'

export function Ben25bCheckInSucesso({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center px-5 pb-8 pt-6 text-center">

      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-success-bg animate-yna-logo">
        <Icon icon="ph:check-circle-bold" width={32} className="text-success" aria-hidden />
      </div>

      <div className="mb-8 animate-yna-slide-up animate-yna-delay-100">
        <h2 className="text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-ink">
          Check-in registrado!
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-secondary">
          Obrigada por se cuidar. Seu bem-estar foi registrado com sucesso.
        </p>
      </div>

      <div className="mb-4 w-full rounded-lg border border-border bg-surface px-5 py-4 animate-yna-slide-up animate-yna-delay-250">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50">
            <YnaIcon name="flower" size={20} className="text-primary dark:text-primary-300" />
          </div>
          <p className="text-sm text-ink-secondary text-left">
            Continue assim. Cada check-in é um gesto de atenção com você mesma/o.
          </p>
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
