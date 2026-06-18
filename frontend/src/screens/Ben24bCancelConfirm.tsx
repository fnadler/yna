import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'
import { mockSession } from '../data/mock'
import { sessionService } from '../services'

interface Ben24bCancelConfirmProps {
  sessionId: string
  onCancelled: () => void
  onBack: () => void
}

export function Ben24bCancelConfirm({ sessionId, onCancelled, onBack }: Ben24bCancelConfirmProps) {
  const [cancelling, setCancelling] = useState(false)

  const handleConfirm = async () => {
    setCancelling(true)
    await sessionService.cancel(sessionId)
    setCancelling(false)
    onCancelled()
  }

  return (
    <div className="px-5 pb-6 pt-5 lg:px-6">

      {/* Current session summary */}
      <div className="mb-5 flex items-center gap-3 rounded-lg border border-border bg-surface p-4">
        <Avatar
          initials={mockSession.professionalInitials}
          size={44}
          palette={mockSession.professionalPalette}
        />
        <div>
          <p className="font-semibold text-ink">{mockSession.professional}</p>
          <p className="text-sm text-ink-secondary">
            {mockSession.weekday}, {mockSession.date} às {mockSession.time}
          </p>
        </div>
      </div>

      {/* Policy warning */}
      <div className="mb-5 flex gap-3 rounded-lg border border-warning/40 bg-warning-bg px-4 py-3.5">
        <Icon icon="ph:warning-bold" width={18} className="mt-0.5 shrink-0 text-warning" aria-hidden />
        <p className="text-sm leading-relaxed text-ink-secondary">
          Cancelamentos com <strong className="font-semibold text-ink">mais de 24 horas de antecedência</strong> não têm custo.
          Cancelamentos com menos de 24h podem gerar cobrança conforme a política da profissional.
        </p>
      </div>

      <p className="mb-6 text-sm text-ink-secondary">
        Tem certeza que deseja cancelar esta sessão?
      </p>

      <div className="flex flex-col gap-3">
        <Button
          size="lg"
          fullWidth
          disabled={cancelling}
          onClick={handleConfirm}
          className="!bg-danger !text-white hover:!bg-danger/90"
        >
          {cancelling ? 'Cancelando…' : 'Sim, cancelar sessão'}
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="flex w-full items-center justify-center gap-1.5 py-2 text-sm font-medium text-ink-secondary hover:text-ink"
        >
          <Icon icon="ph:arrow-left-bold" width={13} aria-hidden />
          Voltar ao reagendamento
        </button>
      </div>

    </div>
  )
}
