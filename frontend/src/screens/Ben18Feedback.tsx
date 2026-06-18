import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { YnaIcon } from '../components/YnaIcons'
import { sessionService } from '../services'

const emojis = [
  { value: 1, icon: '😔', label: 'Difícil' },
  { value: 2, icon: '😐', label: 'Neutro' },
  { value: 3, icon: '🙂', label: 'Bem' },
  { value: 4, icon: '😊', label: 'Muito bem' },
  { value: 5, icon: '✨', label: 'Ótimo' },
]

interface Ben18Props {
  onSubmitted?: () => void
  onSkipped?: () => void
}

export function Ben18Feedback({ onSubmitted, onSkipped }: Ben18Props = {}) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (selected === null) return
    setSaving(true)
    await sessionService.submitFeedback(id ?? 'sess-1', selected, note)
    setSaving(false)
    if (onSubmitted) onSubmitted()
    else navigate(`/sessao/${id}/decisao`)
  }

  const handleSkip = () => {
    if (onSkipped) onSkipped()
    else navigate(`/sessao/${id}/decisao`)
  }

  return (
    <div className="flex flex-col px-5 pb-8 pt-5 lg:pt-10">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
          <YnaIcon name="heart" size={28} className="text-primary dark:text-primary-300" />
        </div>
        <h1 className="text-[24px] font-medium leading-[1.2] tracking-[-0.02em] text-ink">
          Como você saiu dessa sessão?
        </h1>
        <p className="text-sm leading-relaxed text-ink-secondary">
          Não existe resposta certa. Sua percepção ajuda a gente a cuidar melhor de você.
        </p>
      </div>

      <div className="mb-6 flex justify-between gap-2" role="radiogroup" aria-label="Como você saiu dessa sessão">
        {emojis.map((e) => (
          <button
            key={e.value}
            role="radio"
            aria-checked={selected === e.value}
            onClick={() => setSelected(e.value)}
            className={`flex flex-1 flex-col items-center gap-1 rounded-lg border-[1.5px] py-4 text-center transition-all ${
              selected === e.value
                ? 'border-primary bg-primary-50 shadow-sm'
                : 'border-border bg-surface hover:border-border-strong hover:bg-surface-hover'
            }`}
          >
            <span className="text-2xl leading-none">{e.icon}</span>
            <span className="font-heading text-[11px] font-medium text-ink-secondary">{e.label}</span>
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-2">
        <label htmlFor="feedback-note" className="text-sm font-semibold text-ink">
          Algo que queira registrar? <span className="font-normal text-ink-muted">(opcional)</span>
        </label>
        <textarea
          id="feedback-note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Só sua. Não vai para o RH nem para ninguém além de você."
          className="w-full resize-none rounded border-[1.5px] border-border bg-surface px-4 py-3 text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-ink-muted hover:border-border-strong focus:border-primary focus:shadow-[0_0_0_4px_rgba(71,73,168,0.12)]"
        />
        <p className="flex items-center gap-2 text-xs text-ink-muted">
          <Icon icon="ph:lock-bold" width={13} aria-hidden />
          Só você vê isso. Nunca é compartilhado.
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <Button
          size="lg"
          fullWidth
          disabled={selected === null || saving}
          onClick={handleSubmit}
        >
          {saving ? 'Enviando…' : 'Continuar'}
        </Button>
        <Button variant="ghost" fullWidth onClick={handleSkip}>
          Pular
        </Button>
      </div>
    </div>
  )
}
