import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { checkInService } from '../services'

const questions = [
  { id: 'energy', label: 'Energia', question: 'Como está sua energia hoje?', min: 'Baixa', max: 'Alta' },
  { id: 'mood', label: 'Humor', question: 'Como está seu humor?', min: 'Difícil', max: 'Leve' },
  { id: 'stress', label: 'Estresse', question: 'Nível de estresse nos últimos dias?', min: 'Baixo', max: 'Alto' },
]

interface Ben27Props {
  onDone?: () => void
  onCancel?: () => void
}

export function Ben27CheckInForm({ onDone, onCancel }: Ben27Props = {}) {
  const navigate = useNavigate()
  const isSheet = !!onDone
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const update = (id: string, v: number) => setAnswers((a) => ({ ...a, [id]: v }))
  const allAnswered = questions.every((q) => answers[q.id] !== undefined)

  const handleSave = async () => {
    setSaving(true)
    await checkInService.saveCheckIn({ ...answers, note })
    setSaving(false)
    if (onDone) onDone()
    else navigate('/home')
  }

  const handleCancel = () => {
    if (onCancel) onCancel()
    else navigate('/home')
  }

  return (
    <div className={isSheet ? 'px-5 pb-6 pt-5 lg:px-6' : 'mx-auto max-w-xl px-5 pt-12 pb-8'}>
      {!isSheet && (
        <div className="mb-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
            <Icon icon="ph:list-checks-bold" width={24} aria-hidden />
          </div>
          <h1 className="text-[24px] font-medium leading-[1.2] tracking-[-0.02em] text-ink">
            Check-in rápido
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
            Sem certo ou errado. Só você e o que está sentindo agora.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-6 mb-6">
        {questions.map((q) => (
          <div key={q.id}>
            <p className="mb-3 text-sm font-semibold text-ink">{q.question}</p>
            <div className="flex items-center gap-3">
              <span className="shrink-0 text-xs text-ink-muted">{q.min}</span>
              <input
                type="range"
                min={1}
                max={10}
                value={answers[q.id] ?? 5}
                onChange={(e) => update(q.id, parseInt(e.target.value, 10))}
                aria-label={`${q.label}: ${answers[q.id] ?? 5} de 10`}
                className="flex-1 h-2 cursor-pointer appearance-none rounded-pill bg-surface-2 accent-primary"
              />
              <span className="shrink-0 text-xs text-ink-muted">{q.max}</span>
              <span className="shrink-0 w-6 text-center font-mono text-sm font-semibold text-primary dark:text-primary-300">
                {answers[q.id] ?? 5}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-2">
        <label htmlFor="checkin-note" className="text-sm font-semibold text-ink">
          Algo que queira registrar? <span className="font-normal text-ink-muted">(opcional)</span>
        </label>
        <textarea
          id="checkin-note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Só sua. Não vai para o RH."
          className="w-full resize-none rounded border-[1.5px] border-border bg-surface px-4 py-3 text-sm leading-relaxed text-ink outline-none placeholder:text-ink-muted focus:border-primary focus:shadow-[0_0_0_4px_rgba(71,73,168,0.12)]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Button size="lg" fullWidth disabled={!allAnswered || saving} onClick={handleSave}>
          {saving ? 'Salvando…' : 'Registrar check-in'}
        </Button>
        <Button variant="ghost" fullWidth onClick={handleCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
