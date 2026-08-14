import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'

/* Transição pós-LGPD (mesmo modelo do RH05ContaCriada/antigo Ben08bTransicao).
   Fecha o ciclo de consentimento e abre o ciclo da avaliação: o colaborador
   sai do "aceite" com a confirmação de que aquilo que ele vai responder
   agora é a base da avaliação de riscos psicossociais da empresa — sem
   nomear "NR-1" (jargão de conformidade não é vocabulário do colaborador). */
export function ColTransicaoAvaliacao() {
  const [phase, setPhase] = useState<'celebrating' | 'leaving' | 'content'>('celebrating')
  const navigate = useNavigate()

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('leaving'), 1700)
    const t2 = setTimeout(() => setPhase('content'), 2200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="relative flex h-dvh flex-col items-center justify-center overflow-hidden px-7 text-center bg-yna-gradient">
      {(phase === 'celebrating' || phase === 'leaving') && (
        <div className={`relative flex h-28 w-28 items-center justify-center transition-opacity duration-500 ${phase === 'leaving' ? 'opacity-0' : 'opacity-100'}`}>
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <div className="absolute inset-4 animate-ping rounded-full bg-primary/25" style={{ animationDelay: '0.3s' }} />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <Icon icon="ph:check-bold" width={32} className="text-primary" aria-hidden />
          </div>
        </div>
      )}

      {phase === 'content' && (
        <div className="flex w-full max-w-xs md:max-w-md flex-col items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 animate-yna-logo">
            <Icon icon="ph:check-bold" width={28} className="text-primary" aria-hidden />
          </div>

          <div className="w-full rounded-2xl bg-surface border border-border shadow p-7 md:p-10 flex flex-col items-center gap-6 animate-yna-slide-up">
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink">Tudo certo</p>
              <h1 className="text-[34px] font-heading font-extralight leading-[1.08] tracking-[-0.03em] text-ink">
                Agora vamos<br />
                <span className="font-extrabold text-primary">começar.</span>
              </h1>
              <p className="text-[15px] leading-relaxed text-ink-secondary">
                A partir daqui você responde a uma avaliação sobre o seu dia a dia de trabalho.
                O que você contar, somado ao de todo o time, é a base para a empresa entender e
                agir sobre os riscos do ambiente de trabalho.
              </p>
            </div>

            <div className="w-full animate-yna-slide-up animate-yna-delay-250">
              <Button variant="gradient" size="lg" fullWidth iconRight="ph:arrow-right-bold" onClick={() => navigate('/avaliacao/intro')}>
                Começar avaliação
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
