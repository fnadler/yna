import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'
import { LogoYna } from '../../components/YnaLogo'
import { rhInviteService } from '../../services/rh'

/* RH-01 — Primeiro acesso do usuário Master (RF-RH-01.2).
   A conta corporativa já foi criada pelo backoffice YNA no kick-off; aqui o
   Admin RH chega pelo e-mail de boas-vindas com link assinado.
   Voz Cora — calibragem B2B: Sábio + Herói coletivo. */

type State = 'loading' | 'valid' | 'invalid'

export function RH01Convite() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [state, setState] = useState<State>('loading')

  useEffect(() => {
    let active = true
    rhInviteService.validate(token ?? '').then((res) => {
      if (!active) return
      if (res.valid) setState('valid')
      else {
        setState('invalid')
        navigate('/rh/convite/invalido', { replace: true })
      }
    })
    return () => { active = false }
  }, [token, navigate])

  return (
    <section className="px-5 lg:px-0 pt-10 lg:pt-16 pb-10">
      <LogoYna className="h-7 text-primary dark:text-lavender" />

      {state === 'loading' && (
        <div className="mt-10 flex items-center gap-3 text-ink-secondary">
          <Icon icon="ph:spinner-gap-bold" width={20} className="animate-spin" aria-hidden />
          <span className="text-sm">Validando seu acesso…</span>
        </div>
      )}

      {state === 'valid' && (
        <div className="mt-8 animate-yna-slide-up">
          <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-primary-50 text-primary dark:text-primary-300">
            <Icon icon="ph:buildings-bold" width={24} aria-hidden />
          </span>
          <p className="mt-5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-primary dark:text-primary-300">
            Painel do RH · BCP Securities
          </p>
          <h1 className="mt-2 font-heading text-[28px] font-medium leading-[1.1] tracking-[-0.02em] text-ink">
            Bem-vinda ao cuidado que a sua empresa escolheu construir
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-secondary">
            A partir daqui, você acompanha a saúde mental do seu time com evidência e respeito —
            sempre por dados agregados, nunca individuais. O sigilo de cada pessoa é inegociável,
            e é justamente isso que dá força ao programa.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Button size="lg" fullWidth iconRight="ph:arrow-right-bold" onClick={() => navigate('/rh/bem-vindo')}>
              Conhecer a YNA
            </Button>
            <Button variant="ghost" fullWidth onClick={() => navigate('/rh/home')}>
              Já tenho conta
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
