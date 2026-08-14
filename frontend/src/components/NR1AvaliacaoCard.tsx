import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Card, CardEyebrow } from './Card'
import { useAvaliacaoAtiva } from '../hooks/useAvaliacaoAtiva'

/* NR1-BEN-01 — Entrada da avaliação psicossocial na home do colaborador
   (RF-B01, RF-B03).

   Só aparece quando há campanha em campo e a pessoa ainda não concluiu
   (useAvaliacaoAtiva, compartilhado com a página /avaliacao — as duas nunca
   discordam sobre esse estado). O convite é do tamanho do que é: uma
   conversa de 8 minutos, não uma obrigação corporativa. Nenhuma menção a
   "NR-1" — isso é vocabulário de RH.

   Variante "gradient" dos Cards (design system, §6 Cards) — o tratamento
   reservado para momentos de destaque — mais o próprio CTA em pill branco,
   não só uma seta, para pesar mais na hierarquia visual da home. */
export function NR1AvaliacaoCard() {
  const { status, ativa, respondidas } = useAvaliacaoAtiva()

  if (status !== 'success' || !ativa) return null

  const emAndamento = respondidas > 0

  return (
    <Link to="/avaliacao" className="group mb-6 block">
      <Card
        variant="gradient"
        className="relative overflow-hidden p-6 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md lg:p-7"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-pill bg-white/40 backdrop-blur-sm text-ink-gradient dark:bg-primary-50/15 dark:text-primary-300">
            <Icon icon="ph:chat-teardrop-dots-bold" width={26} aria-hidden />
          </span>

          <div className="min-w-0 flex-1">
            <CardEyebrow className="text-ink-gradient-secondary dark:text-ink-muted">
              {emAndamento ? 'Você começou' : 'Um convite para você'}
            </CardEyebrow>
            <p className="mt-1.5 font-heading text-[19px] font-semibold leading-snug text-ink-gradient dark:text-ink lg:text-[21px]">
              {emAndamento ? 'Continue de onde parou' : 'Como tem sido o seu trabalho?'}
            </p>
            <p className="mt-1.5 max-w-md text-[13.5px] leading-relaxed text-ink-gradient-body dark:text-ink-secondary">
              {emAndamento
                ? `Você já respondeu ${respondidas} ${respondidas === 1 ? 'pergunta' : 'perguntas'}. Dá para terminar em poucos minutos.`
                : 'Cerca de 8 minutos, anônimo. O que você contar ajuda a cuidar do ambiente de todo mundo.'}
            </p>
          </div>

          <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-pill bg-white/90 px-5 py-2.5 font-heading text-[13.5px] font-semibold text-ink shadow-sm transition-colors group-hover:bg-white dark:bg-surface dark:text-ink sm:self-center">
            {emAndamento ? 'Continuar' : 'Responder agora'}
            <Icon
              icon="ph:arrow-right-bold"
              width={15}
              className="transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        </div>
      </Card>
    </Link>
  )
}
