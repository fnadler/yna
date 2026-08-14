import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'

/* Ponte entre o fim da avaliação (NR1BenConclusao, tela de sucesso) e a
   criação da conta leve (ColCriarConta). Tela própria — não mistura
   "encerrar o ciclo" com "decidir se quer voltar".

   "Em breve... teleatendimento com profissionais selecionados" é a única
   promessa de atendimento em todo o produto (ver README, "Ajustes desta
   revisão") — existe só aqui, de propósito. */
export function ColConviteConta() {
  const navigate = useNavigate()

  return (
    <main className="flex flex-1 flex-col px-5 pb-10 pt-10 lg:pt-14">
      <div className="mx-auto w-full max-w-xl animate-yna-slide-up">
        <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
          <Icon icon="ph:heart-bold" width={26} aria-hidden />
        </span>

        <h1 className="mt-5 text-[28px] font-extralight leading-[1.15] tracking-[-0.02em] text-ink lg:text-[36px]">
          E você,{' '}
          <span className="bg-yna-gradient-button bg-clip-text font-extrabold text-transparent">como está?</span>
        </h1>

        <p className="mt-4 text-[15px] leading-relaxed text-ink-secondary">
          Se alguma dessas perguntas mexeu com você, a YNA é para você.
        </p>

        <p className="mt-4 text-[15px] leading-relaxed text-ink-secondary">
          Criando uma conta leve, sem senha complexa, você pode voltar aqui para ver como suas
          respostas mudam ao longo do tempo. E em breve, para quem tiver conta, a YNA também vai
          oferecer teleatendimento com profissionais selecionados.
        </p>

        <div className="mt-8 flex flex-col gap-2">
          <Button size="lg" fullWidth iconRight="ph:arrow-right-bold" onClick={() => navigate('/criar-conta')}>
            Criar minha conta
          </Button>
          <Button variant="ghost" fullWidth onClick={() => navigate('/despedida')}>
            Agora não
          </Button>
        </div>
      </div>
    </main>
  )
}
