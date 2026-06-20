import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { YnaIcon } from '../components/YnaIcons'

interface Msg { role: 'nina' | 'user'; text: string }

const FLOW: { question: string; options?: string[] }[] = [
  {
    question: 'Como você está chegando nesse check-in hoje?',
    options: ['Bem', 'Mais ou menos', 'Cansada/o', 'Difícil de dizer'],
  },
  {
    question: 'O que mais pesou esta semana?',
    options: ['Trabalho', 'Relações', 'Corpo e saúde', 'Pensamentos difíceis', 'Nada em especial'],
  },
  {
    question: 'Tem algo que ajudou você esta semana, mesmo que pequeno?',
  },
]

interface Ben26Props {
  onDone?: () => void
}

export function Ben26CheckInNina({ onDone }: Ben26Props = {}) {
  const navigate = useNavigate()
  const isSheet = !!onDone
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'nina', text: FLOW[0]!.question },
  ])
  const [step, setStep] = useState(0)
  const [openText, setOpenText] = useState('')
  const [done, setDone] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const respond = (answer: string) => {
    const updated = [...messages, { role: 'user' as const, text: answer }]
    const nextStep = step + 1
    if (nextStep < FLOW.length) {
      updated.push({ role: 'nina', text: FLOW[nextStep]!.question })
      setMessages(updated)
      setStep(nextStep)
      setOpenText('')
    } else {
      updated.push({
        role: 'nina',
        text: 'Obrigada por compartilhar. Cada check-in é um gesto de cuidado com você mesma/o.',
      })
      setMessages(updated)
      setDone(true)
    }
  }

  const current = FLOW[step]
  const handleDone = onDone ?? (() => navigate('/home'))

  // ── Sheet mode: flowing layout, Sheet provides its own header ──
  if (isSheet) {
    return (
      <div className="flex flex-col">
        {/* Progress indicator */}
        <div className="flex items-center justify-between border-b border-border px-5 py-2.5">
          <p className="text-xs text-ink-muted">
            {done ? 'Concluído' : `Pergunta ${step + 1} de ${FLOW.length}`}
          </p>
          <div className="flex gap-1">
            {FLOW.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-5 rounded-pill transition-colors ${
                  i < step || done ? 'bg-primary' : i === step ? 'bg-primary/50' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="min-h-[200px] px-5 py-4">
          <div className="flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[82%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white'
                      : 'border border-border bg-surface text-ink'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input / Done */}
        {!done && current && (
          <div className="border-t border-border bg-surface px-5 py-4">
            {current.options ? (
              <div className="flex flex-wrap gap-2">
                {current.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => respond(opt)}
                    className="min-h-[44px] rounded-pill border-[1.5px] border-border bg-surface-2 px-4 font-heading text-sm font-medium text-ink transition-colors hover:border-primary hover:bg-primary-50"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-end gap-2">
                <input
                  type="text"
                  value={openText}
                  onChange={(e) => setOpenText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && openText.trim()) respond(openText.trim())
                  }}
                  placeholder="Escreva aqui…"
                  className="flex-1 min-h-[44px] rounded-pill border-[1.5px] border-border bg-surface-2 px-4 text-sm text-ink outline-none focus:border-primary"
                />
                <button
                  onClick={() => openText.trim() && respond(openText.trim())}
                  disabled={!openText.trim()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-primary text-white disabled:opacity-40"
                >
                  <Icon icon="ph:paper-plane-right-bold" width={18} aria-hidden />
                </button>
              </div>
            )}
          </div>
        )}

        {done && (
          <div className="border-t border-border bg-surface px-5 py-4">
            <Button size="lg" fullWidth onClick={handleDone}>
              Concluir check-in
            </Button>
          </div>
        )}
      </div>
    )
  }

  // ── Standalone mode: full-height layout with fixed header/footer ──
  return (
    <div className="mx-auto flex h-[calc(100dvh-64px)] max-w-xl flex-col lg:h-dvh">
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-surface px-5 py-4 pt-12 lg:pt-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-pill bg-yna-gradient-soft">
          <YnaIcon name="flower" size={20} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Check-in com a Nyna</p>
          <p className="text-xs text-ink-muted">
            {done ? 'Concluído' : `Pergunta ${step + 1} de ${FLOW.length}`}
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[82%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-white'
                    : 'border border-border bg-surface text-ink'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {!done && current && (
        <div className="shrink-0 border-t border-border bg-surface px-4 py-4">
          {current.options ? (
            <div className="flex flex-wrap gap-2">
              {current.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => respond(opt)}
                  className="min-h-[44px] rounded-pill border-[1.5px] border-border bg-surface-2 px-4 font-heading text-sm font-medium text-ink transition-colors hover:border-primary hover:bg-primary-50"
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <input
                type="text"
                value={openText}
                onChange={(e) => setOpenText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && openText.trim()) respond(openText.trim())
                }}
                placeholder="Escreva aqui…"
                className="flex-1 min-h-[44px] rounded-pill border-[1.5px] border-border bg-surface-2 px-4 text-sm text-ink outline-none focus:border-primary"
              />
              <button
                onClick={() => openText.trim() && respond(openText.trim())}
                disabled={!openText.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-primary text-white disabled:opacity-40"
              >
                <Icon icon="ph:paper-plane-right-bold" width={18} aria-hidden />
              </button>
            </div>
          )}
        </div>
      )}

      {done && (
        <div className="shrink-0 border-t border-border bg-surface px-4 py-4">
          <Button size="lg" fullWidth onClick={handleDone}>
            Voltar ao início
          </Button>
        </div>
      )}
    </div>
  )
}
