import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { PageHeader } from '../components/PageHeader'
import { YnaIcon } from '../components/YnaIcons'
import { PAGE_MAX_W } from '../lib/layout'
import type { CheckInConfig } from '../types'

type Cadence = CheckInConfig['cadence']
type Mode = CheckInConfig['mode']

const cadences: { value: Cadence; label: string; desc: string }[] = [
  { value: 'off', label: 'Sem check-in', desc: 'Você decide quando quer fazer' },
  { value: 'daily', label: 'Diário', desc: 'Breve, todo dia no horário que escolher' },
  { value: 'weekly', label: 'Semanal', desc: 'Uma vez por semana, quando convir' },
  { value: 'custom', label: 'Personalizado', desc: 'Dias e horários que você definir' },
]

interface Ben25Props {
  onStart?: (mode: Mode) => void
  onClose?: () => void
}

export function Ben25CheckInConfig({ onStart, onClose }: Ben25Props = {}) {
  const [cadence, setCadence] = useState<Cadence>('weekly')
  const [mode, setMode] = useState<Mode>('nina')
  const navigate = useNavigate()
  const isSheet = !!onStart

  const handleStart = () => {
    if (isSheet) {
      if (cadence === 'off') { onClose?.(); return }
      onStart(mode)
    } else {
      if (cadence === 'off') { navigate('/home'); return }
      navigate(mode === 'nina' ? '/check-in/nina' : '/check-in/form')
    }
  }

  const handleSkip = () => {
    if (isSheet) onClose?.()
    else navigate('/home')
  }

  const content = (
    <>
      {!isSheet && (
        <PageHeader
          title="Check-in de bem-estar"
          subtitle="Um momento curto para registrar como você está. Totalmente opcional. Sem nota, sem avaliação."
          iconNode={<YnaIcon name="flower" size={24} />}
        />
      )}

      <div className="mb-6">
        <h2 className="mb-3 text-[15px] font-semibold text-ink">Com que frequência?</h2>
        <div className="flex flex-col gap-2">
          {cadences.map((c) => (
            <label
              key={c.value}
              className={`flex cursor-pointer items-center gap-4 rounded-lg border-[1.5px] px-4 py-3 transition-all ${
                cadence === c.value
                  ? 'border-primary bg-primary-50'
                  : 'border-border bg-surface hover:bg-surface-hover'
              }`}
            >
              <input
                type="radio"
                name="cadence"
                value={c.value}
                checked={cadence === c.value}
                onChange={() => setCadence(c.value)}
                className="h-4 w-4 accent-primary"
              />
              <div>
                <p className="text-sm font-semibold text-ink">{c.label}</p>
                <p className="text-xs text-ink-muted">{c.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {cadence !== 'off' && (
        <div className="mb-6">
          <h2 className="mb-3 text-[15px] font-semibold text-ink">Como prefere fazer?</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode('nina')}
              className={`flex min-h-[80px] flex-col items-center justify-center gap-2 rounded-lg border-[1.5px] px-4 font-heading transition-all ${
                mode === 'nina' ? 'border-primary bg-primary-50' : 'border-border bg-surface hover:bg-surface-hover'
              }`}
            >
              <Icon icon="ph:sparkle-bold" width={24} className={mode === 'nina' ? 'text-primary dark:text-primary-300' : 'text-ink-muted'} aria-hidden />
              <span className="text-sm font-semibold text-ink">Com a Nyna</span>
              <span className="text-xs text-ink-muted text-center">Conversa guiada</span>
            </button>
            <button
              onClick={() => setMode('form')}
              className={`flex min-h-[80px] flex-col items-center justify-center gap-2 rounded-lg border-[1.5px] px-4 font-heading transition-all ${
                mode === 'form' ? 'border-primary bg-primary-50' : 'border-border bg-surface hover:bg-surface-hover'
              }`}
            >
              <Icon icon="ph:list-checks-bold" width={24} className={mode === 'form' ? 'text-primary dark:text-primary-300' : 'text-ink-muted'} aria-hidden />
              <span className="text-sm font-semibold text-ink">Formulário rápido</span>
              <span className="text-xs text-ink-muted text-center">3–5 perguntas</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Button
          variant={cadence !== 'off' ? 'gradient' : 'primary'}
          size="lg"
          fullWidth
          onClick={handleStart}
        >
          {cadence === 'off' ? 'Salvar preferência' : 'Fazer check-in agora'}
        </Button>
        {cadence !== 'off' && (
          <Button variant="ghost" fullWidth onClick={handleSkip}>
            Configurar só, sem fazer agora
          </Button>
        )}
      </div>
    </>
  )

  if (isSheet) {
    return <div className="px-5 pb-6 pt-5 lg:px-6">{content}</div>
  }

  return (
    <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-12 lg:pt-10 pb-8 lg:pb-12`}>
      <div className="lg:max-w-xl">
        {content}
      </div>
    </div>
  )
}
