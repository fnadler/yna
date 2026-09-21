import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { TopoSaida } from '../components/TopoSaida'

/* Mesma composição do questionário (gradiente vívido + card branco
   centralizado, ver Ben03Lgpd/ColConviteConta). Antes usava `FocusLayout`
   com `bg-yna-gradient-soft` — trocado por pedido explícito de
   padronização com o restante do fluxo.

   `TopoSaida` aqui só mostra a logo (sem "Sair"): esta é a própria tela
   de saída, então um link "Sair" apontando pra ela mesma não faria
   sentido. */
export function Ben05Despedida() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-dvh flex-col items-center overflow-x-hidden bg-yna-gradient px-5 py-6 lg:py-10">
      <TopoSaida className="mb-4 max-w-xl lg:mb-6" />

      <div className="flex w-full max-w-xl flex-col items-center gap-8 rounded-2xl border border-border bg-surface p-7 text-center shadow animate-yna-slide-up md:p-10">
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

        <Button variant="secondary" onClick={() => navigate(-1)}>
          Voltar e reconsiderar
        </Button>

        <p className="max-w-xs text-xs leading-snug text-ink-muted">
          Se precisar de apoio imediato, o CVV (Centro de Valorização da Vida) atende 24h:
          ligue <strong>188</strong> ou acesse cvv.org.br.
        </p>
      </div>
    </div>
  )
}
