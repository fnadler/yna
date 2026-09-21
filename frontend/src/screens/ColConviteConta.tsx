import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { TopoSaida } from '../components/TopoSaida'

/* Ponte entre o fim da avaliação (NR1BenConclusao, tela de sucesso) e o
   convite a conteúdo de apoio. Tela própria — não mistura "encerrar o
   ciclo" com "oferecer um próximo passo de cuidado".

   Antes esta tela pedia pra criar conta (ver histórico do arquivo). Trocado
   por pedido explícito: nada de criação de conta neste ponto do fluxo —
   só o convite a explorar conteúdo de apoio (vídeos e artigos por tema,
   contato do CVV/SAMU e uma apresentação institucional da YNA), numa
   página estática que ainda não existe. O botão abaixo fica sem destino
   por enquanto — de propósito, até essa página ser construída — e "Agora
   não" continua levando pra despedida, sem qualquer conta de por meio.

   Mesma composição do questionário (`NR1BenQuestionario.tsx`): fundo em
   gradiente, um único card branco centralizado, `TopoSaida` (logo + Sair)
   como única coisa fora do card. Antes usava `FocusLayout` — trocado por
   pedido explícito de padronização com o restante do fluxo (ver mesma
   nota em Ben03Lgpd/ColCriarConta). */
export function ColConviteConta() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-dvh flex-col items-center overflow-x-hidden bg-yna-gradient px-5 py-6 lg:py-10">
      <TopoSaida exitTo="/despedida" className="mb-4 max-w-xl lg:mb-6" />

      <div className="w-full max-w-xl animate-yna-slide-up rounded-2xl border border-border bg-surface p-6 shadow md:p-9">
        <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
          <Icon icon="ph:heart-bold" width={26} aria-hidden />
        </span>

        <h1 className="mt-5 text-[28px] font-extralight leading-[1.15] tracking-[-0.02em] text-ink lg:text-[36px]">
          E você,{' '}
          <span className="bg-yna-gradient-button bg-clip-text font-extrabold text-transparent">como está?</span>
        </h1>

        <p className="mt-4 text-[15px] leading-relaxed text-ink-secondary">
          Se alguma dessas perguntas mexeu com você, a YNA separou alguns conteúdos que podem ajudar.
        </p>

        <p className="mt-4 text-[15px] leading-relaxed text-ink-secondary">
          Vídeos e artigos curtos sobre saúde mental no trabalho, organizados por tema, o contato
          direto do CVV e do SAMU para emergências, e um pouco sobre quem é a YNA. Tudo isso sem
          precisar criar conta.
        </p>

        <div className="mt-8 flex flex-col gap-2">
          <Button size="lg" fullWidth iconRight="ph:arrow-right-bold">
            Conhecer a YNA
          </Button>
          <Button variant="ghost" fullWidth onClick={() => navigate('/despedida')}>
            Agora não
          </Button>
        </div>
      </div>
    </div>
  )
}
