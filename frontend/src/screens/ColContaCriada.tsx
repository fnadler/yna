import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'

/* Transição "conta criada" — fecha o cadastro (mesmo modelo do
   RH05ContaCriada/ColTransicaoAvaliacao/NR1BenConclusao). Reforça a
   fronteira de sigilo: ter conta não abre nenhuma janela para o RH. */
export function ColContaCriada() {
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
              <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink">Conta criada</p>
              <h1 className="text-[34px] font-heading font-extralight leading-[1.08] tracking-[-0.03em] text-ink">
                Sua conta está<br />
                <span className="font-extrabold text-primary">pronta.</span>
              </h1>
              <p className="text-[15px] leading-relaxed text-ink-secondary">
                A partir daqui você pode acompanhar sua evolução sempre que quiser. O RH da sua
                empresa não vê seus dados de acesso, nem o que você faz aqui dentro — isso continua
                sendo só seu.
              </p>
            </div>

            <div className="w-full animate-yna-slide-up animate-yna-delay-250">
              <Button variant="gradient" size="lg" fullWidth iconRight="ph:arrow-right-bold" onClick={() => navigate('/meu-espaco', { replace: true })}>
                Acessar a plataforma
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
