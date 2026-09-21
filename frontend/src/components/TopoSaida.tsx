import { useNavigate } from 'react-router-dom'
import { LogoYna } from './YnaLogo'

/** Barra mínima de topo — logo (esquerda) + "Sair" (direita) — para telas
   do fluxo do colaborador que precisam de uma saída explícita mas não
   usam `FocusLayout` (o card branco centralizado é o resto da
   composição, como no questionário — ver Ben03Lgpd/ColCriarConta).
   Compacta de propósito: só uma linha, sem borda nem fundo próprio, para
   não empurrar o card pra baixo.

   Sem `exitTo`, mostra só a logo (sem botão "Sair") — usado na própria
   tela de despedida, onde um link "Sair" apontando pra ela mesma não faz
   sentido. */
export function TopoSaida({ exitTo, className = '' }: { exitTo?: string; className?: string }) {
  const navigate = useNavigate()

  return (
    <div className={`flex w-full items-center justify-between ${className}`}>
      <LogoYna className="h-6 text-primary dark:text-lavender" />
      {exitTo && (
        <button
          onClick={() => navigate(exitTo)}
          className="font-heading text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
        >
          Sair
        </button>
      )}
    </div>
  )
}
