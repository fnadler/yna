import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { OptionCard } from '../components/OptionCard'
import { YnaIcon } from '../components/YnaIcons'

type Step = 'confirm' | 'options' | 'emergency-room'

interface NinaMsg {
  role: 'nina' | 'user'
  text: string
}

const STAGES = [
  {
    progress: 15,
    message: 'Estamos localizando um plantonista disponível para você.',
    sub: 'Nossa equipe está de plantão agora.',
  },
  {
    progress: 42,
    message: 'Encontramos alguém. Verificando disponibilidade do profissional.',
    sub: 'Só mais um instante.',
  },
  {
    progress: 68,
    message: 'Plantonista selecionado.',
    sub: 'Estamos preparando sua sala de atendimento.',
  },
  {
    progress: 86,
    message: 'O plantonista está se preparando para entrar.',
    sub: 'Você será atendida/o em breve.',
  },
  {
    progress: 95,
    message: 'O plantonista está chegando…',
    sub: 'Mais alguns segundos.',
  },
] as const

const NINA_RESPONSES: Record<string, string> = {
  'Com medo':
    'Faz todo sentido. Você fez a coisa certa ao pedir ajuda. Respira fundo comigo: inspire por 4 segundos, segure 4, expire devagar. Estou aqui.',
  'Muito agitada/o':
    'Entendo. O que você está sentindo é real. Tente notar algo que você pode ver agora — algo ao seu redor, qualquer coisa. Eu fico aqui com você.',
  'Um pouco melhor':
    'Que bom. Você está indo bem. Continue aqui comigo, o plantonista já está a caminho.',
}

function EmergencyRoom() {
  const navigate = useNavigate()
  const [stageIdx, setStageIdx] = useState(0)
  const [ninaVisible, setNinaVisible] = useState(false)
  const [ninaMessages, setNinaMessages] = useState<NinaMsg[]>([])
  const [awaitingChoice, setAwaitingChoice] = useState(false)
  const [connected, setConnected] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const goodNewsSent = useRef(false)

  // Stage + connection timer cascade
  useEffect(() => {
    const ts = [
      setTimeout(() => setStageIdx(1), 3000),
      setTimeout(() => setNinaVisible(true), 4000),
      setTimeout(() => setStageIdx(2), 7000),
      setTimeout(() => setStageIdx(3), 11000),
      setTimeout(() => setStageIdx(4), 14000),
      setTimeout(() => setConnected(true), 18000),
    ]
    return () => ts.forEach(clearTimeout)
  }, [])

  // Nina opening messages
  useEffect(() => {
    if (!ninaVisible) return
    const t1 = setTimeout(() => {
      setNinaMessages([
        { role: 'nina', text: 'Oi. Enquanto o plantonista chega, estou aqui com você. Você não está sozinha/o.' },
      ])
    }, 500)
    const t2 = setTimeout(() => {
      setNinaMessages((prev) => [
        ...prev,
        { role: 'nina', text: 'Como você está se sentindo agora?' },
      ])
      setAwaitingChoice(true)
    }, 2200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [ninaVisible])

  // "Boas notícias" at stage 3
  useEffect(() => {
    if (stageIdx >= 3 && ninaVisible && !goodNewsSent.current) {
      goodNewsSent.current = true
      const t = setTimeout(() => {
        setNinaMessages((prev) => [
          ...prev,
          { role: 'nina', text: 'Boas notícias: o plantonista está quase pronto para te receber.' },
        ])
        setAwaitingChoice(false)
      }, 800)
      return () => clearTimeout(t)
    }
  }, [stageIdx, ninaVisible])

  // Connected message
  useEffect(() => {
    if (!connected) return
    const t = setTimeout(() => {
      setNinaMessages((prev) => [
        ...prev,
        { role: 'nina', text: 'O plantonista chegou. Você está em boas mãos agora.' },
      ])
      setAwaitingChoice(false)
    }, 400)
    return () => clearTimeout(t)
  }, [connected])

  // Auto-scroll chat to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ninaMessages, awaitingChoice])

  const handleChoice = (choice: string) => {
    setAwaitingChoice(false)
    setNinaMessages((prev) => [...prev, { role: 'user', text: choice }])
    const reply = NINA_RESPONSES[choice] ?? ''
    setTimeout(() => {
      setNinaMessages((prev) => [...prev, { role: 'nina', text: reply }])
    }, 800)
  }

  const stage = STAGES[stageIdx]!

  return (
    <div className="dark flex h-dvh flex-col" style={{ backgroundColor: '#14122A' }}>
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between px-5 pt-12 pb-4">
        <span className="flex items-center gap-2 rounded-pill bg-white/10 px-4 py-2 text-sm font-medium text-lavender">
          <Icon icon="ph:shield-check-bold" width={16} className="text-success" aria-hidden />
          Sala segura · 100% confidencial
        </span>
        <button
          onClick={() => navigate('/home')}
          className="flex h-9 items-center gap-1.5 rounded-pill bg-white/10 px-4 font-heading text-sm font-medium text-lavender/70 transition-colors hover:bg-white/20 hover:text-lavender"
        >
          <Icon icon="ph:x-bold" width={14} aria-hidden />
          Cancelar
        </button>
      </header>

      {/* Connection progress */}
      <div className="shrink-0 px-5 pb-5">
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-pill bg-white/10">
          <div
            className="h-full rounded-pill bg-gradient-to-r from-primary to-pink transition-all duration-1000 ease-in-out"
            style={{ width: `${connected ? 100 : stage.progress}%` }}
          />
        </div>

        {connected ? (
          <div key="connected" className="flex items-center gap-2 animate-yna-slide-up">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success">
              <Icon icon="ph:check-bold" width={11} className="text-white" aria-hidden />
            </div>
            <p className="text-[15px] font-semibold text-white">Plantonista conectado.</p>
          </div>
        ) : (
          <div key={stageIdx} className="animate-yna-slide-up">
            <p className="text-[15px] font-semibold text-white">{stage.message}</p>
            <p className="mt-0.5 text-[13px] text-lavender/60">{stage.sub}</p>
          </div>
        )}
      </div>

      {/* Main area: loading dots or Nina chat */}
      {!ninaVisible ? (
        <div className="flex flex-1 items-center justify-center pb-10">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-2 w-2 animate-bounce rounded-full bg-primary/50"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
            <p className="text-sm text-lavender/40">Estamos com você.</p>
          </div>
        </div>
      ) : (
        <div className="mx-5 mb-5 flex flex-1 flex-col overflow-hidden rounded-lg border border-white/10 bg-white/5 animate-yna-slide-up">
          {/* Nina header */}
          <div className="flex shrink-0 items-center gap-2.5 border-b border-white/10 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
              <YnaIcon name="flower" size={16} className="text-primary-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Nyna</p>
              <p className="text-xs text-lavender/50">Suporte enquanto você espera</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
            {ninaMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white'
                      : 'border border-white/10 bg-white/10 text-white/90'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick reply choices */}
          {awaitingChoice && !connected && (
            <div className="shrink-0 border-t border-white/10 px-4 py-3">
              <div className="flex flex-wrap gap-2">
                {['Com medo', 'Muito agitada/o', 'Um pouco melhor'].map((choice) => (
                  <button
                    key={choice}
                    onClick={() => handleChoice(choice)}
                    className="min-h-[36px] rounded-pill border border-white/20 bg-white/5 px-4 font-heading text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Connected CTA */}
          {connected && (
            <div className="shrink-0 border-t border-white/10 px-4 py-3">
              <Button
                variant="gradient"
                size="lg"
                fullWidth
                iconLeft="ph:video-camera-bold"
                onClick={() => navigate('/sessao/emergency-1')}
              >
                Entrar na sala com o plantonista
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="shrink-0 px-5 pb-8 text-center">
        <p className="text-xs text-lavender/30">
          Se precisar encerrar agora: ligue{' '}
          <a href="tel:188" className="text-lavender/50 underline">188</a>{' '}
          (CVV) ou{' '}
          <a href="tel:192" className="text-lavender/50 underline">192</a>{' '}
          (SAMU)
        </p>
      </footer>
    </div>
  )
}

export function Ben23Emergencia() {
  const location = useLocation()
  const [step, setStep] = useState<Step>(
    (location.state as { startAtRoom?: boolean } | null)?.startAtRoom ? 'emergency-room' : 'confirm'
  )
  const navigate = useNavigate()

  if (step === 'confirm') {
    return (
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-danger-bg">
          <Icon icon="ph:lifebuoy-bold" width={32} className="text-danger" aria-hidden />
        </div>
        <div>
          <h1 className="text-[22px] font-medium tracking-[-0.02em] text-ink">
            Você não está sozinha/o.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
            Estou aqui com você agora. Você quer acesso a apoio imediato?
          </p>
        </div>
        <div className="flex w-full flex-col gap-3">
          <Button size="lg" fullWidth variant="danger" onClick={() => setStep('options')}>
            Sim, quero apoio agora
          </Button>
          <Button variant="ghost" fullWidth onClick={() => navigate(-1)}>
            Não, estou bem. Só testando
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'options') {
    return (
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-5 pt-12 pb-8">
        <div className="mb-8">
          <h1 className="text-[22px] font-medium tracking-[-0.02em] text-ink">
            Com quem quer falar?
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
            Escolha o que faz mais sentido agora. Todas as opções são gratuitas e confidenciais.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <OptionCard
            icon="ph:user-circle-gear-bold"
            label="Plantonista YNA"
            desc="Profissional disponível agora"
            variant="danger"
            onClick={() => setStep('emergency-room')}
          />
          <OptionCard
            icon="ph:phone-bold"
            label="CVV: Centro de Valorização da Vida"
            desc="Ligue 188 · gratuito · 24h"
            href="tel:188"
          />
          <OptionCard
            icon="ph:ambulance-bold"
            label="SAMU"
            desc="Ligue 192 · emergência médica"
            variant="warning"
            href="tel:192"
          />
        </div>

        <div className="mt-auto pt-8">
          <Button variant="ghost" fullWidth onClick={() => navigate('/home')}>
            Voltar ao início
          </Button>
        </div>
      </div>
    )
  }

  return <EmergencyRoom />
}
