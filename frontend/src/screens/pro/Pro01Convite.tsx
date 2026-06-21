import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'
import { LogoYna } from '../../components/YnaLogo'
import { proInviteService } from '../../services/pro'

type State = 'loading' | 'valid' | 'invalid'

export function Pro01Convite() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [state, setState] = useState<State>('loading')

  useEffect(() => {
    let active = true
    proInviteService.validate(token ?? '').then((res) => {
      if (!active) return
      if (res.valid) setState('valid')
      else {
        setState('invalid')
        navigate('/pro/convite/invalido', { replace: true })
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
          <span className="text-sm">Validando seu convite…</span>
        </div>
      )}

      {state === 'valid' && (
        <div className="mt-8 animate-yna-slide-up">
          <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-primary-50 text-primary dark:text-primary-300">
            <Icon icon="ph:hand-waving-bold" width={24} aria-hidden />
          </span>
          <p className="mt-5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-primary dark:text-primary-300">
            Convite · Indicação YNA
          </p>
          <h1 className="mt-2 font-heading text-[28px] font-medium leading-[1.1] tracking-[-0.02em] text-ink">
            Você foi indicado(a) para fazer parte da YNA
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-secondary">
            A YNA reconhece o seu trabalho — e nós queremos construir esse cuidado com você.
            Aqui você atende com autonomia, suporte clínico e uma estrutura que respeita o seu ofício.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Button size="lg" fullWidth iconRight="ph:arrow-right-bold" onClick={() => navigate('/pro/boas-vindas')}>
              Começar
            </Button>
            <Button variant="ghost" fullWidth onClick={() => navigate('/pro/home')}>
              Já tenho conta
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
