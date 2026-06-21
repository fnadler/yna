import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'

export function Pro08Ativado() {
  const navigate = useNavigate()

  return (
    <section className="px-5 lg:px-0 pt-12 lg:pt-16 pb-10 animate-yna-slide-up">
      <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-success-bg text-success">
        <Icon icon="ph:seal-check-bold" width={28} aria-hidden />
      </span>
      <p className="mt-5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-success-ink">Perfil ativo</p>
      <h1 className="mt-2 font-heading text-[28px] font-medium leading-[1.1] tracking-[-0.02em] text-ink">
        Tudo pronto. Bem-vindo(a) à prática na YNA.
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-secondary">
        Seu perfil foi aprovado e já pode aparecer para beneficiários que procuram alguém com a sua abordagem.
        No seu painel você acompanha o quanto seu perfil está pronto para match — e o que ainda pode fortalecê-lo.
      </p>

      <div className="mt-8">
        <Button size="lg" fullWidth iconRight="ph:arrow-right-bold" onClick={() => navigate('/pro/home')}>
          Ir para o meu painel
        </Button>
      </div>
    </section>
  )
}
