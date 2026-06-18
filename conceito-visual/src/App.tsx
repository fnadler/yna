import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { PhoneFrame } from './components/PhoneFrame'
import { ThemeToggle } from './components/ThemeToggle'
import { Ben03Lgpd } from './screens/Ben03Lgpd'
import { Ben09Triagem } from './screens/Ben09Triagem'
import { Ben12Matches } from './screens/Ben12Matches'
import { Ben17VideoRoom } from './screens/Ben17VideoRoom'
import { Ben21Home } from './screens/Ben21Home'
import { triagemClosed, triagemOpen } from './data/mock'

export default function App() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1700px] flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary text-white">
              <Icon icon="ph:heart-bold" width={20} aria-hidden />
            </span>
            <div>
              <h1 className="text-base font-semibold tracking-[-0.01em] text-ink">
                YNA Care Hub · Conceito Visual{' '}
                <span className="font-mono text-xs font-medium text-ink-muted">v0.1</span>
              </h1>
              <p className="text-[13px] text-ink-secondary">
                Fluxo do Beneficiário — 5 telas-herói · mobile first (390px) · voz da marca: Cora
              </p>
            </div>
          </div>
          <ThemeToggle dark={dark} onToggle={() => setDark((v) => !v)} />
        </div>
      </header>

      <div className="mx-auto max-w-[1700px] px-6 pt-4">
        <p className="flex items-start gap-2 rounded-sm border border-warning/40 bg-warning-bg px-4 py-3 text-[13px] leading-snug text-warning-ink">
          <Icon icon="ph:warning-bold" width={16} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            <strong className="font-semibold">Conflito de identidade em aberto:</strong> o logo e a
            Branding Persona usam teal/verde/amarelo; o design system define índigo (#4749A8).
            Este protótipo segue o índigo do design system — resolução registrada no README.
          </span>
        </p>
      </div>

      <main className="mx-auto flex max-w-[1700px] flex-wrap items-start justify-center gap-10 px-6 pb-20 pt-10 xl:justify-start">
        <PhoneFrame
          screenId="BEN-03"
          screenName="Sigilo LGPD — gate de confiança"
          caption="RF-CO-02.1 · RF-CO-02.2 — quem vê o quê, k-anonimato, DPO, consentimento sem nudge"
        >
          <Ben03Lgpd />
        </PhoneFrame>

        <PhoneFrame
          screenId="BEN-21"
          screenName="Home do Beneficiário"
          caption="RF-CO-12.1 — próxima sessão, atalhos, Nina, Roda da Vida, botão de pânico"
        >
          <Ben21Home />
        </PhoneFrame>

        <PhoneFrame
          screenId="BEN-09"
          screenName="Triagem · pergunta fechada"
          caption="RF-CO-05.1 · RF-CO-05.2 — conversa, não formulário (1 de 5)"
        >
          <Ben09Triagem question={triagemClosed} />
        </PhoneFrame>

        <PhoneFrame
          screenId="BEN-09"
          screenName="Triagem · pergunta aberta"
          caption="RF-CO-05.1 · RF-CO-05.2 — resposta livre, sigilo em contexto (4 de 5)"
        >
          <Ben09Triagem question={triagemOpen} />
        </PhoneFrame>

        <PhoneFrame
          screenId="BEN-12"
          screenName="3 Matches curados"
          caption="RF-CO-06.1 · RF-CO-06.2 — algoritmo + curadoria Domus, com vídeo"
        >
          <Ben12Matches />
        </PhoneFrame>

        <PhoneFrame
          screenId="BEN-17"
          screenName="Sala de vídeo — durante a sessão"
          caption="RF-CO-09.1 · 09.3 · 09.4 — privacidade visível, tempo discreto, ajuda ao alcance"
        >
          <Ben17VideoRoom />
        </PhoneFrame>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-[1700px] px-6 py-6 text-[13px] leading-relaxed text-ink-secondary">
          <p>
            <strong className="font-semibold text-ink">Nota:</strong> protótipo de conceito visual
            com dados estáticos — sem API, sem fornecedor de vídeo (a definir: Daily/Twilio).
            Tokens portados de <code className="font-mono text-xs">yna-care-hub-design-system.html</code>.
            As outras 6 telas-âncora do beneficiário (BEN-22, 23, 25, 26, 28, 30) ficam para a
            próxima iteração — ver README.
          </p>
        </div>
      </footer>
    </div>
  )
}
