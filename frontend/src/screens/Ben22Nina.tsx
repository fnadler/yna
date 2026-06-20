import { useState, useRef, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { YnaIcon } from '../components/YnaIcons'
import { ninaMessages, ninaResponses } from '../data/mock'
import type { NinaMessage } from '../types'

const RISK_WORDS = ['suicídio', 'me matar', 'não quero mais viver', 'acabar com tudo', 'me machucar']

function detectRisk(text: string) {
  return RISK_WORDS.some((w) => text.toLowerCase().includes(w))
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

export function Ben22Nina() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<NinaMessage[]>(ninaMessages)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [closeModal, setCloseModal] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const scroll = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  useEffect(scroll, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    const isRisk = detectRisk(text)

    const userMsg: NinaMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((m) => [...m, userMsg])
    setTyping(true)

    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800))

    const response = isRisk ? ninaResponses.risk[0]! : pickRandom(ninaResponses.default)

    const ninaMsg: NinaMessage = {
      id: `nina-${Date.now()}`,
      role: 'nina',
      content: response,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isRisk,
    }
    setMessages((m) => [...m, ninaMsg])
    setTyping(false)

    if (isRisk) {
      setTimeout(() => navigate('/emergencia'), 3000)
    }
  }

  const handleConfirmClose = () => {
    setCloseModal(false)
    navigate('/home')
  }

  return (
    <>
      {/*
        Mobile: fixed overlay cobrindo o bottom nav (z-40 < Modal z-50)
        Desktop: posicionado normalmente dentro do AppLayout
      */}
      <div className="fixed inset-0 z-40 flex flex-col bg-page lg:relative lg:inset-auto lg:z-auto lg:h-dvh">

        {/* Header */}
        <header className="flex shrink-0 items-center gap-3 border-b border-border bg-surface px-5 py-4 pt-12 lg:pt-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-yna-gradient-soft">
            <YnaIcon name="chat" size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink">Nyna</p>
            <p className="text-xs text-ink-secondary">Assistente de bem-estar · disponível 24h</p>
          </div>

          {/* Online badge — desktop only */}
          <Badge tone="success" className="hidden lg:inline-flex">Online</Badge>

          {/* Concluir button */}
          <button
            onClick={() => setCloseModal(true)}
            className="flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 font-heading text-sm font-medium text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
          >
            Concluir
          </button>
        </header>

        {/* Disclaimer */}
        <div className="shrink-0 bg-surface-2 px-4 py-2">
          <p className="text-xs leading-snug text-ink-secondary">
            <Icon icon="ph:info-bold" width={12} className="mr-1 inline" aria-hidden />
            Nyna é uma assistente de apoio. Não substitui consulta com profissional de saúde mental. Em crise, acione o suporte de emergência.
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white'
                      : msg.isRisk
                      ? 'border border-danger/30 bg-danger-bg text-ink'
                      : 'border border-border bg-surface text-ink'
                  }`}
                >
                  {msg.content}
                  {msg.isRisk && (
                    <button
                      onClick={() => navigate('/emergencia')}
                      className="mt-2 flex items-center gap-1.5 font-heading text-xs font-semibold text-danger-ink underline underline-offset-2"
                    >
                      <Icon icon="ph:lifebuoy-bold" width={12} aria-hidden />
                      Ver opções de ajuda agora
                    </button>
                  )}
                  <p className={`mt-1 text-[10px] ${msg.role === 'user' ? 'text-white/60' : 'text-ink-secondary'}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="rounded-lg border border-border bg-surface px-4 py-3">
                  <div className="flex gap-1.5" aria-label="Nyna está digitando">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-2 w-2 rounded-pill bg-ink-muted animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-border bg-surface px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void send()
                }
              }}
              placeholder="Escreva para a Nyna…"
              rows={1}
              className="flex-1 resize-none rounded-pill border-[1.5px] border-border bg-surface-2 px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-secondary hover:border-border-strong focus:border-primary"
            />
            <button
              onClick={() => void send()}
              disabled={!input.trim()}
              aria-label="Enviar mensagem"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-primary text-white transition-colors hover:bg-primary-600 disabled:opacity-40"
            >
              <Icon icon="ph:paper-plane-right-bold" width={18} aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      <Modal
        open={closeModal}
        title="Encerrar a conversa?"
        onClose={() => setCloseModal(false)}
      >
        <p className="text-[15px] leading-relaxed text-ink-secondary">
          Você pode pausar quando precisar. Tudo que você trouxe aqui fica com você, e eu
          estarei aqui do mesmo jeito quando quiser continuar.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button size="lg" fullWidth onClick={handleConfirmClose}>
            Sim, pode encerrar
          </Button>
          <Button variant="ghost" fullWidth onClick={() => setCloseModal(false)}>
            Ficar mais um pouco
          </Button>
        </div>
      </Modal>
    </>
  )
}
