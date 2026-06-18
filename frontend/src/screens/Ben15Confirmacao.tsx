import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'
import { mockSession } from '../data/mock'

interface Ben15Props {
  onDone?: () => void
}

export function Ben15Confirmacao({ onDone }: Ben15Props = {}) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center px-5 pb-8 pt-6 lg:pt-10 text-center">

      {/* Ícone de sucesso */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-success-bg animate-yna-logo">
        <Icon icon="ph:check-circle-bold" width={32} className="text-success" aria-hidden />
      </div>

      {/* Título e subtítulo */}
      <div className="mb-8 animate-yna-slide-up animate-yna-delay-100">
        <h1 className="text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-ink">
          Sessão agendada!
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-secondary">
          Você deu um passo importante. Estamos torcendo por você.
        </p>
      </div>

      {/* Card de resumo */}
      <div className="mb-6 w-full rounded-lg border border-border bg-surface p-5 animate-yna-slide-up animate-yna-delay-250">
        <div className="flex items-center gap-3">
          <Avatar
            initials={mockSession.professionalInitials}
            size={56}
            palette={mockSession.professionalPalette}
          />
          <div className="text-left">
            <p className="font-semibold text-ink">{mockSession.professional}</p>
            <p className="text-sm text-ink-secondary">
              {mockSession.weekday}, {mockSession.date}
            </p>
            <p className="text-sm font-semibold text-primary dark:text-primary-300">
              {mockSession.time}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
          <p className="flex items-center gap-2 text-sm text-ink-secondary">
            <Icon icon="ph:video-camera-bold" width={16} className="text-ink-muted" aria-hidden />
            Sessão online · 50 minutos
          </p>
          <p className="flex items-center gap-2 text-sm text-ink-secondary">
            <Icon icon="ph:lock-bold" width={16} className="text-ink-muted" aria-hidden />
            Privada e criptografada
          </p>
          <p className="flex items-center gap-2 text-sm text-ink-secondary">
            <Icon icon="ph:prohibition-bold" width={16} className="text-ink-muted" aria-hidden />
            Não gravada
          </p>
        </div>
      </div>

      {/* Ações secundárias */}
      <div className="mb-4 w-full flex flex-col gap-2 animate-yna-slide-up animate-yna-delay-400">
        <Button variant="secondary" fullWidth iconLeft="ph:calendar-plus-bold">
          Adicionar à minha agenda
        </Button>
        <Button variant="secondary" fullWidth iconLeft="ph:share-network-bold">
          Salvar lembrete
        </Button>
      </div>

      {/* Ação principal */}
      <div className="w-full animate-yna-slide-up animate-yna-delay-550">
        <Button
          size="lg"
          fullWidth
          iconRight="ph:arrow-right-bold"
          onClick={onDone ?? (() => navigate('/home'))}
        >
          Ir para o início
        </Button>
        <p className="mt-4 text-xs leading-snug text-ink-muted">
          Você receberá um lembrete 24h e 1h antes da sessão.
        </p>
      </div>

    </div>
  )
}
