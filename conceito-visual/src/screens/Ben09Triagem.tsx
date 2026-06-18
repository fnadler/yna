import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { Textarea } from '../components/Textarea'
import type { TriagemQuestion } from '../data/mock'

/**
 * BEN-09 · Triagem — 5 perguntas (RF-CO-05.1, RF-CO-05.2)
 * Triagem como conversa, não formulário clínico. Uma pergunta por vez,
 * progresso suave, voltar sempre possível, pular sem culpa (RF-CO-05.4).
 */
export function Ben09Triagem({ question }: { question: TriagemQuestion }) {
  const [selected, setSelected] = useState<number | null>(question.selectedIndex ?? null)

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 px-5 pb-2 pt-12">
        <button
          aria-label="Voltar à pergunta anterior"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover"
        >
          <Icon icon="ph:arrow-left-bold" width={18} aria-hidden />
        </button>
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
        <span className="shrink-0 font-mono text-xs font-medium text-ink-muted">
          {question.number} de {question.total}
        </span>
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto px-5 pb-8 pt-6">
        {question.intro && (
          <p className="mb-2 text-sm font-medium text-primary dark:text-primary-300">{question.intro}</p>
        )}
        <h1 className="text-[24px] font-medium leading-[1.2] tracking-[-0.02em] text-ink">
          {question.question}
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
                  className={`flex min-h-[64px] items-center justify-between gap-3 rounded-lg border-[1.5px] px-4 py-4 text-left text-[15px] leading-snug transition-all ${
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
            <Textarea placeholder={question.placeholder} aria-label={question.question} />
            {question.helper && (
              <p className="flex items-start gap-2 text-[13px] leading-snug text-ink-muted">
                <Icon icon="ph:lock-bold" width={14} className="mt-0.5 shrink-0" aria-hidden />
                {question.helper}
              </p>
            )}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-8">
          <Button size="lg" fullWidth iconRight="ph:arrow-right-bold">
            Continuar
          </Button>
          <Button variant="ghost" fullWidth>
            Pular esta pergunta
          </Button>
          <p className="text-center text-xs leading-snug text-ink-muted">
            Pular não atrapalha nada — só seguimos com o que você quiser contar.
          </p>
        </div>
      </main>
    </div>
  )
}
