import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'

export function Ben05Despedida() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lavender-soft">
        <Icon icon="ph:door-bold" width={32} className="text-primary dark:text-primary-300" aria-hidden />
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-medium tracking-[-0.02em] text-ink">
          A porta fica aberta.
        </h1>
        <p className="text-[15px] leading-relaxed text-ink-secondary">
          Não precisamos de uma razão para você não continuar agora. Quando fizer sentido,
          o convite ainda vai funcionar.
        </p>
        <p className="text-sm leading-relaxed text-ink-secondary">
          Cuide-se.
        </p>
      </div>

      <Button variant="secondary" onClick={() => navigate('/sigilo')}>
        Voltar e reconsiderar
      </Button>

      <p className="text-xs leading-snug text-ink-muted max-w-xs">
        Se precisar de apoio imediato, o CVV (Centro de Valorização da Vida) atende 24h:
        ligue <strong>188</strong> ou acesse cvv.org.br.
      </p>
    </div>
  )
}
