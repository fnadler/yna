import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'
import { LogoYna } from '../../components/YnaLogo'

export function Pro02LinkInvalido() {
  return (
    <section className="px-5 lg:px-0 pt-10 lg:pt-16 pb-10">
      <LogoYna className="h-7 text-primary dark:text-lavender" />

      <div className="mt-8 animate-yna-slide-up">
        <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-warning-bg text-warning-ink">
          <Icon icon="ph:link-break-bold" width={24} aria-hidden />
        </span>
        <p className="mt-5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          Convite
        </p>
        <h1 className="mt-2 font-heading text-[24px] font-medium tracking-[-0.02em] text-ink">
          Este link não está mais válido
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
          Pode ter expirado ou já ter sido usado. Sem problema — a equipe da YNA reenvia o seu
          acesso rapidamente. É só pedir.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Button
            size="lg"
            fullWidth
            iconLeft="ph:envelope-simple-bold"
            onClick={() => { window.location.href = 'mailto:profissionais@yna.com.br?subject=Reenvio de convite' }}
          >
            Falar com a YNA
          </Button>
        </div>
      </div>
    </section>
  )
}
