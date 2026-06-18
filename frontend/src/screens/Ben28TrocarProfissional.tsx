import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Avatar } from '../components/Avatar'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { mockSession } from '../data/mock'

type Intent = 'switch' | 'complement' | 'explore'

const intents: { key: Intent; icon: string; title: string; desc: string }[] = [
  {
    key: 'switch',
    icon: 'ph:shuffle-angular-bold',
    title: 'Quero trocar de profissional',
    desc: 'Buscar alguém diferente para o mesmo tipo de cuidado',
  },
  {
    key: 'complement',
    icon: 'ph:plus-circle-bold',
    title: 'Quero cuidado em outra área',
    desc: 'Adicionar nutrição, fisioterapia ou outra especialidade',
  },
  {
    key: 'explore',
    icon: 'ph:binoculars-bold',
    title: 'Só quero explorar as opções',
    desc: 'Ver quem está disponível, sem precisar decidir agora',
  },
]

interface Ben28Props {
  onConfirm?: (intent: Intent) => void
  onClose?: () => void
}

export function Ben28TrocarProfissional({ onConfirm, onClose }: Ben28Props = {}) {
  const navigate = useNavigate()
  const [intent, setIntent] = useState<Intent | null>(null)

  const handleConfirm = () =>
    onConfirm
      ? onConfirm(intent!)
      : navigate('/profissionais/novos', { state: { intent } })
  const handleClose = onClose ?? (() => navigate(-1))

  return (
    <div className="px-5 pb-6 pt-5 lg:px-6">

      {/* Current professional — provides context, reassures continuity */}
      <div className="mb-5 flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
        <Avatar
          initials={mockSession.professionalInitials}
          size={36}
          palette={mockSession.professionalPalette}
        />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-ink-muted">
            Profissional atual
          </p>
          <p className="truncate text-sm font-semibold text-ink">{mockSession.professional}</p>
        </div>
        <Badge tone="success">Ativo</Badge>
      </div>

      <p className="mb-5 text-[15px] leading-relaxed text-ink-secondary">
        Suas preferências de triagem ficam salvas. Diga o que mudou e buscamos as melhores opções para você.
      </p>

      <div className="mb-5 flex flex-col gap-2">
        {intents.map((item) => {
          const active = intent === item.key
          return (
            <button
              key={item.key}
              onClick={() => setIntent(item.key)}
              className={`flex items-start gap-3 rounded-lg border-[1.5px] p-4 text-left transition-all ${
                active
                  ? 'border-primary bg-primary-50'
                  : 'border-border bg-surface hover:bg-surface-hover'
              }`}
            >
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  active ? 'bg-primary text-white' : 'bg-surface-2 text-ink-secondary'
                }`}
              >
                <Icon icon={item.icon} width={18} aria-hidden />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                <p className="mt-0.5 text-xs leading-snug text-ink-secondary">{item.desc}</p>
              </div>
              {active && (
                <Icon
                  icon="ph:check-circle-fill"
                  width={18}
                  className="mt-0.5 shrink-0 text-primary"
                  aria-hidden
                />
              )}
            </button>
          )
        })}
      </div>

      <p className="mb-5 flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
        <Icon icon="ph:shield-check-bold" width={14} className="mt-0.5 shrink-0" aria-hidden />
        Suas sessões atuais continuam normalmente enquanto você avalia as opções.
      </p>

      <Button
        size="lg"
        fullWidth
        disabled={!intent}
        iconRight="ph:arrow-right-bold"
        onClick={() => intent && handleConfirm()}
      >
        Ver profissionais disponíveis
      </Button>

      <button
        type="button"
        onClick={handleClose}
        className="mt-3 w-full py-2 text-center text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
      >
        Agora não
      </button>

    </div>
  )
}
