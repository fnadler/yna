import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { Textarea } from '../components/Textarea'
import { triagemQuestions } from '../data/mock'
import { triagemService } from '../services'

export function Ben09Triagem() {
  const { passo } = useParams<{ passo: string }>()
  const navigate = useNavigate()
  const questionIndex = Math.max(0, Math.min(4, parseInt(passo ?? '1', 10) - 1))
  const question = triagemQuestions[questionIndex]!
  const [selected, setSelected] = useState<number | null>(null)
  const [openText, setOpenText] = useState('')
  const [saving, setSaving] = useState(false)

  const isLast = questionIndex === triagemQuestions.length - 1

  const handleContinue = async () => {
    setSaving(true)
    await triagemService.saveAnswer(
      question.number,
      question.kind === 'closed' ? selected ?? -1 : openText,
    )
    setSaving(false)
    if (isLast) {
      navigate('/matches/carregando')
    } else {
      navigate(`/triagem/${question.number + 1}`)
    }
  }

  const handleSkip = async () => {
    setSaving(true)
    await triagemService.saveAnswer(question.number, 'preferência não informada')
    setSaving(false)
    if (isLast) {
      navigate('/matches/carregando')
    } else {
      navigate(`/triagem/${question.number + 1}`)
    }
  }

  const handleBack = () => {
    if (questionIndex > 0) navigate(`/triagem/${question.number - 1}`)
    else navigate(-1)
  }

  const canContinue = question.kind === 'closed' ? selected !== null : true

  const renderQuestion = (text: string, highlight?: string) => {
    if (!highlight) return text
    const idx = text.indexOf(highlight)
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">
          {highlight}
        </span>
        {text.slice(idx + highlight.length)}
      </>
    )
  }

  return (
    <>
      {/* Header: back + progress — hidden on desktop (layout provides top bar) */}
      <header className="flex lg:hidden items-center gap-3 px-5 pb-2 pt-8">
        {questionIndex > 0 ? (
          <button
            aria-label="Voltar à pergunta anterior"
            onClick={() => navigate(`/triagem/${question.number - 1}`)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover"
          >
            <Icon icon="ph:arrow-left-bold" width={18} aria-hidden />
          </button>
        ) : (
          <div className="h-11 w-11 shrink-0" />
        )}
        <div className="flex-1">
          <div
            className="h-2 w-full overflow-hidden rounded-pill bg-surface-2"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={question.total}
            aria-valuenow={question.number}
            aria-label={`Pergunta ${question.number} de ${question.total}`}
          >
            <div
              className="h-full rounded-pill bg-gradient-to-r from-primary to-pink transition-all duration-500"
              style={{ width: `${(question.number / question.total) * 100}%` }}
            />
          </div>
        </div>
        <span className="shrink-0 font-mono text-xs font-medium text-ink-secondary">
          {question.number} de {question.total}
        </span>
      </header>

      <main key={questionIndex} className="flex flex-1 flex-col px-5 pb-8 pt-6 lg:pt-10 lg:pb-28 animate-yna-slide-up">
        {question.intro && (
          <p className="mb-2 text-sm font-medium text-primary dark:text-primary-300">
            {question.intro}
          </p>
        )}
        <h1 className="text-[24px] lg:text-[40px] font-extralight leading-[1.15] lg:leading-[1.05] tracking-[-0.02em] text-ink">
          {renderQuestion(question.question, question.highlight)}
        </h1>

        {question.kind === 'closed' && question.options && (
          <div className="mt-6 flex flex-col gap-3" role="radiogroup" aria-label={question.question}>
            {question.options.map((option, i) => {
              const isSelected = selected === i
              return (
                <button
                  key={option}
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelected(i)}
                  className={`flex min-h-[64px] items-center justify-between gap-3 rounded-lg border-[1.5px] px-4 py-4 font-heading text-left text-[15px] leading-snug transition-all ${
                    isSelected
                      ? 'border-primary bg-primary-50 font-semibold text-ink shadow-sm'
                      : 'border-border bg-surface font-medium text-ink-secondary hover:border-border-strong hover:bg-surface-hover'
                  }`}
                >
                  {option}
                  <span
                    aria-hidden
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-pill border-[1.5px] transition-colors ${
                      isSelected ? 'border-primary bg-primary text-white' : 'border-border-strong'
                    }`}
                  >
                    {isSelected && <Icon icon="ph:check-bold" width={13} />}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {question.kind === 'open' && (
          <div className="mt-6 flex flex-col gap-2">
            <Textarea
              placeholder={question.placeholder}
              aria-label={question.question}
              value={openText}
              onChange={(e) => setOpenText(e.target.value)}
            />
            {question.helper && (
              <p className="flex items-start gap-2 text-[13px] leading-snug text-ink-secondary">
                <Icon icon="ph:lock-bold" width={14} className="mt-0.5 shrink-0" aria-hidden />
                {question.helper}
              </p>
            )}
          </div>
        )}

        {/* Mobile action buttons — hidden on desktop */}
        <div className="mt-auto flex flex-col gap-2 pt-8 lg:hidden">
          <Button
            size="lg"
            fullWidth
            iconRight="ph:arrow-right-bold"
            disabled={!canContinue || saving}
            onClick={handleContinue}
          >
            {saving ? 'Salvando…' : isLast ? 'Ver meus matches' : 'Continuar'}
          </Button>
          <Button variant="ghost" fullWidth onClick={handleSkip} disabled={saving}>
            Pular esta pergunta
          </Button>
          <p className="text-center text-xs leading-snug text-ink-secondary">
            Pular não atrapalha nada. Seguimos com o que você quiser contar.
          </p>
        </div>
      </main>

      {/* Desktop bottom nav bar */}
      <div className="hidden lg:flex fixed bottom-0 left-0 right-0 z-20 h-[72px] items-center border-t border-border bg-surface/90 px-10 backdrop-blur-sm">
        <div className="w-40">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 font-heading text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
          >
            <Icon icon="ph:arrow-left-bold" width={16} aria-hidden />
            Voltar
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center gap-1.5">
          <div className="h-1.5 w-52 overflow-hidden rounded-pill bg-surface-2">
            <div
              className="h-full rounded-pill bg-gradient-to-r from-primary to-pink transition-all duration-500"
              style={{ width: `${(question.number / question.total) * 100}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-ink-secondary">
            {question.number} de {question.total}
          </span>
        </div>

        <div className="flex w-40 items-center justify-end gap-3">
          <button
            onClick={handleSkip}
            disabled={saving}
            className="font-heading text-sm font-medium text-ink-secondary transition-colors hover:text-ink disabled:opacity-40"
          >
            Pular
          </button>
          <Button
            onClick={handleContinue}
            disabled={!canContinue || saving}
            iconRight="ph:arrow-right-bold"
          >
            {saving ? 'Salvando…' : isLast ? 'Ver matches' : 'Continuar'}
          </Button>
        </div>
      </div>
    </>
  )
}
