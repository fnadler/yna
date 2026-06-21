import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'
import { LogoYna } from '../../components/YnaLogo'

const passos = [
  { icon: 'ph:identification-card-bold', label: 'Seu cadastro', desc: 'Dados, PJ, informações clínicas, formação e vídeo.' },
  { icon: 'ph:bank-bold', label: 'Como você recebe', desc: 'Conta da sua PJ e a cadência de recebimento.' },
  { icon: 'ph:graduation-cap-bold', label: 'Integração', desc: 'Conteúdos curtos para começar com tudo combinado.' },
]

export function Pro03BoasVindas() {
  const navigate = useNavigate()

  return (
    <section className="px-5 lg:px-0 pt-10 lg:pt-16 pb-10">
      <LogoYna className="h-7 text-primary dark:text-lavender" />

      <div className="mt-8 animate-yna-slide-up">
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-primary dark:text-primary-300">
          Boas-vindas
        </p>
        <h1 className="mt-2 font-heading text-[28px] font-medium leading-[1.1] tracking-[-0.02em] text-ink">
          Que bom ter você por aqui
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-secondary">
          Vamos preparar o seu espaço para atender — no seu tempo, sem burocracia.
          São três passos curtos até o seu perfil ir para análise.
        </p>

        <ol className="mt-8 flex flex-col gap-3">
          {passos.map((p, i) => (
            <li key={p.label} className="flex items-center gap-4 rounded-lg border border-border bg-surface px-4 py-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-primary-50 text-primary dark:text-primary-300">
                <Icon icon={p.icon} width={20} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-heading text-sm font-semibold text-ink">{p.label}</p>
                <p className="mt-0.5 text-[13px] text-ink-secondary">{p.desc}</p>
              </div>
              <span className="font-mono text-xs text-ink-muted">{i + 1}</span>
            </li>
          ))}
        </ol>

        <div className="mt-8">
          <Button size="lg" fullWidth iconRight="ph:arrow-right-bold" onClick={() => navigate('/pro/cadastro/1')}>
            Criar meu cadastro
          </Button>
        </div>
      </div>
    </section>
  )
}
