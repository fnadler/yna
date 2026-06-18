import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'

export function Ben07Agenda() {
  const [connected, setConnected] = useState<'google' | 'ical' | null>(null)
  const navigate = useNavigate()

  return (
    <div className="flex flex-col px-5 pt-12 pb-8 animate-yna-slide-up">
      <div className="mb-8">
        <p className="mb-1 text-sm font-medium text-primary dark:text-primary-300">
          Opcional mas útil
        </p>
        <h1 className="mt-1 text-[24px] lg:text-[40px] font-extralight leading-[1.15] lg:leading-[1.05] tracking-[-0.02em] text-ink">
          Conecte{' '}
          <span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">sua agenda</span>
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          Assim suas sessões aparecem automaticamente no calendário e você recebe lembretes
          no lugar certo. A YNA nunca lê o conteúdo da sua agenda: só verifica disponibilidade.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {(['google', 'ical'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setConnected(connected === type ? null : type)}
            className={`flex min-h-[64px] items-center gap-4 rounded-lg border-[1.5px] px-4 font-heading text-left transition-all ${
              connected === type
                ? 'border-success bg-success-bg'
                : 'border-border bg-surface hover:bg-surface-hover'
            }`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-sm ${type === 'google' ? 'bg-[#4285F4]/10' : 'bg-primary-50'}`}>
              <Icon
                icon={type === 'google' ? 'ph:google-logo-bold' : 'ph:calendar-blank-bold'}
                width={20}
                className={type === 'google' ? 'text-[#4285F4]' : 'text-primary dark:text-primary-300'}
                aria-hidden
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">
                {type === 'google' ? 'Google Calendar' : 'iCal / Apple Calendar'}
              </p>
              <p className="text-xs text-ink-muted">
                {type === 'google' ? 'Sincronização automática' : 'Link de subscrição (iCal)'}
              </p>
            </div>
            {connected === type ? (
              <Badge tone="success" icon="ph:check-bold">Conectada</Badge>
            ) : (
              <Icon icon="ph:plus-bold" width={16} className="text-ink-muted" aria-hidden />
            )}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-2">
        <Button size="lg" fullWidth iconRight="ph:arrow-right-bold" onClick={() => navigate('/cadastro/comunicacoes')}>
          {connected ? 'Continuar' : 'Pular por agora'}
        </Button>
        {connected && (
          <Button variant="ghost" fullWidth onClick={() => navigate('/cadastro/comunicacoes')}>
            Pular por agora
          </Button>
        )}
      </div>
    </div>
  )
}
