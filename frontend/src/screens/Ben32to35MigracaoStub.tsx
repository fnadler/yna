import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'

export function Ben32to35MigracaoStub() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
        <Icon icon="ph:path-bold" width={32} className="text-primary dark:text-primary-300" aria-hidden />
      </div>

      <div>
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          Em breve
        </p>
        <h1 className="mt-1 text-[22px] font-medium tracking-[-0.02em] text-ink">
          Planos individuais a caminho
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
          Sua empresa cuida do seu acesso por enquanto. Quando quiser continuar por conta
          própria. O suporte estará aqui, sem interrupção.
        </p>
      </div>

      <Button variant="secondary" onClick={() => navigate('/home')}>
        Voltar ao início
      </Button>
    </div>
  )
}
