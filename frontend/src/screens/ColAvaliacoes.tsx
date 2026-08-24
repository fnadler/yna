import { Navigate, useOutletContext } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { MobileTopBar } from '../components/MobileTopBar'
import { PageHeader } from '../components/PageHeader'
import { Skeleton } from '../components/Skeleton'
import { ErrorState } from '../components/ErrorState'
import type { AppLayoutContext } from '../components/AppLayout'
import { PAGE_MAX_W } from '../lib/layout'
import { useAvaliacaoAtiva } from '../hooks/useAvaliacaoAtiva'

/* COL-06 — Item "Avaliação" da navegação principal. Não é uma tela de
   conteúdo próprio: é um portão que decide, a partir do mesmo estado que o
   NR1AvaliacaoCard usa (useAvaliacaoAtiva), para onde a pessoa vai —

   - avaliação ativa e não respondida → segue direto para o questionário
     (/avaliacao/1), sem tela de introdução própria: quem já tem conta já
     passou pela apresentação e pelo sigilo num ciclo anterior, então não
     há por que repetir aqueles argumentos de novo antes de cada reavaliação;
   - sem campanha em campo, ou já respondida → fica aqui, com um estado vazio
     explicando que as avaliações são periódicas e vão aparecer de novo.

   As avaliações NR-1 se repetem em ciclos — não é "preencheu uma vez, nunca
   mais aparece", é "não há nada AGORA". */
export function ColAvaliacoes() {
  const { openNotifications, unread } = useOutletContext<AppLayoutContext>()
  const { status, ativa, message, reload } = useAvaliacaoAtiva()

  if (status === 'success' && ativa) return <Navigate to="/avaliacao/1" replace />

  return (
    <div className="flex-1 bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MobileTopBar unread={unread} onBellClick={openNotifications} />
        <PageHeader
          title="Avaliação"
          subtitle="O convite para contar como tem sido o seu trabalho aparece aqui quando houver um em aberto."
          className="mt-2 lg:mt-0"
        />

        {status === 'loading' && (
          <div className="mx-auto flex w-full max-w-md flex-col gap-4 pt-6">
            <Skeleton className="h-14 w-14 rounded-lg" />
            <Skeleton className="h-6 w-2/3 rounded" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        )}

        {status === 'error' && (
          <div className="pt-6">
            <ErrorState message={message} onRetry={reload} />
          </div>
        )}

        {status === 'success' && !ativa && (
          <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 pt-10 pb-6 text-center animate-yna-slide-up">
            <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-surface-2 text-ink-secondary">
              <Icon icon="ph:coffee-bold" width={26} aria-hidden />
            </span>
            <h1 className="text-[22px] font-extralight leading-tight tracking-[-0.02em] text-ink">
              Nenhuma avaliação por enquanto
            </h1>
            <p className="max-w-sm text-[14px] leading-relaxed text-ink-secondary">
              As conversas sobre o ambiente de trabalho acontecem em ciclos, de tempos em tempos.
              Quando houver uma nova, você vê o convite aqui e na sua home.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
