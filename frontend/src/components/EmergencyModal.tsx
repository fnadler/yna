import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from './Button'
import { OptionCard } from './OptionCard'

type Step = 'confirm' | 'options'

interface EmergencyModalProps {
  open: boolean
  onClose: () => void
}

export function EmergencyModal({ open, onClose }: EmergencyModalProps) {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('confirm')

  // Reset step whenever modal opens
  useEffect(() => {
    if (open) setStep('confirm')
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const handlePlantonista = () => {
    onClose()
    navigate('/emergencia', { state: { startAtRoom: true } })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(31,27,45,0.55)] backdrop-blur-sm"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Suporte de emergência"
        className="w-full max-w-md overflow-hidden rounded-lg bg-surface shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Icon icon="ph:lifebuoy-bold" width={18} className="text-danger" aria-hidden />
            <h2 className="text-base font-semibold text-ink">Suporte de emergência</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-surface-hover"
          >
            <Icon icon="ph:x-bold" width={16} aria-hidden />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pt-5">
          {step === 'confirm' ? (
            <div className="flex flex-col items-center gap-5 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-danger-bg">
                <Icon icon="ph:lifebuoy-bold" width={28} className="text-danger" aria-hidden />
              </div>
              <div>
                <h3 className="text-[18px] font-medium tracking-[-0.02em] text-ink">
                  Você não está sozinha/o.
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
                  Estou aqui com você agora. Você quer acesso a apoio imediato?
                </p>
              </div>
              <div className="flex w-full flex-col gap-2">
                <Button size="lg" fullWidth variant="danger" onClick={() => setStep('options')}>
                  Sim, quero apoio agora
                </Button>
                <Button variant="ghost" fullWidth onClick={onClose}>
                  Não, estou bem. Só testando
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-[18px] font-medium tracking-[-0.02em] text-ink">
                  Com quem quer falar?
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
                  Todas as opções são gratuitas e confidenciais.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <OptionCard
                  icon="ph:user-circle-gear-bold"
                  label="Plantonista YNA"
                  desc="Profissional disponível agora"
                  variant="danger"
                  onClick={handlePlantonista}
                />
                <OptionCard
                  icon="ph:phone-bold"
                  label="CVV: Centro de Valorização da Vida"
                  desc="Ligue 188 · gratuito · 24h"
                  href="tel:188"
                />
                <OptionCard
                  icon="ph:ambulance-bold"
                  label="SAMU"
                  desc="Ligue 192 · emergência médica"
                  variant="warning"
                  href="tel:192"
                />
              </div>
              <button
                onClick={() => setStep('confirm')}
                className="flex items-center gap-1.5 self-start font-heading text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
              >
                <Icon icon="ph:arrow-left-bold" width={14} aria-hidden />
                Voltar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
