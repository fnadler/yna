import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'
import { mockSession } from '../data/mock'

interface Ben19Props {
  onSchedule?: () => void
  onRematch?: () => void
  onDecideLater?: () => void
}

export function Ben19Decisao({ onSchedule, onRematch, onDecideLater }: Ben19Props = {}) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col px-5 pb-8 pt-5 lg:pt-10">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <Avatar
          initials={mockSession.professionalInitials}
          size={72}
          palette={mockSession.professionalPalette}
        />
        <div>
          <h1 className="text-[22px] font-medium leading-[1.2] tracking-[-0.02em] text-ink">
            Quer continuar com {mockSession.professional.split(' ').slice(1).join(' ')}?
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
            A primeira sessão é um começo, não um contrato. Se sentiu algo bom, vale continuar.
            Se quiser explorar outra pessoa, tudo certo, sem julgamento.
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3">
        <button
          onClick={onSchedule ?? (() => navigate('/agendar/pro-1'))}
          className="flex min-h-[80px] items-center gap-4 rounded-lg border-[1.5px] border-border bg-surface px-4 font-heading text-left transition-all hover:border-primary hover:bg-primary-50"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary-50">
            <Icon icon="ph:calendar-plus-bold" width={20} className="text-primary dark:text-primary-300" aria-hidden />
          </div>
          <div>
            <p className="font-semibold text-ink">Agendar próxima sessão</p>
            <p className="text-sm text-ink-secondary">Continuar com {mockSession.professional}</p>
          </div>
          <Icon icon="ph:caret-right-bold" width={16} className="ml-auto text-ink-muted" aria-hidden />
        </button>

        <button
          onClick={onRematch ?? (() => navigate(`/sessao/${id}/rematch`))}
          className="flex min-h-[80px] items-center gap-4 rounded-lg border-[1.5px] border-border bg-surface px-4 font-heading text-left transition-all hover:border-border-strong hover:bg-surface-hover"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-surface-2">
            <Icon icon="ph:users-bold" width={20} className="text-ink-secondary" aria-hidden />
          </div>
          <div>
            <p className="font-semibold text-ink">Conhecer outras opções</p>
            <p className="text-sm text-ink-secondary">Explorar outros profissionais é normal</p>
          </div>
          <Icon icon="ph:caret-right-bold" width={16} className="ml-auto text-ink-muted" aria-hidden />
        </button>
      </div>

      <p className="mb-6 rounded-lg bg-surface-2 px-4 py-3 text-xs leading-relaxed text-ink-secondary">
        <strong className="font-semibold text-ink">Um lembrete:</strong> a relação terapêutica leva tempo para se construir.
        Se a primeira sessão foi boa mas não transformadora, isso é completamente normal.
      </p>

      <Button variant="ghost" fullWidth onClick={onDecideLater ?? (() => navigate('/home'))}>
        Decidir depois
      </Button>
    </div>
  )
}
