import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'

type ErrorType = 'expired' | 'used' | 'invalid'

const content: Record<ErrorType, { icon: string; title: string; body: string; action: string }> = {
  expired: {
    icon: 'ph:clock-countdown-bold',
    title: 'Convite expirado',
    body: 'Os convites são válidos por 7 dias após o envio. Acontece. É só pedir um novo ao RH da sua empresa.',
    action: 'Solicitar novo convite ao RH',
  },
  used: {
    icon: 'ph:check-circle-bold',
    title: 'Convite já utilizado',
    body: 'Você já criou uma conta com este link. Se não consegue entrar, pode redefinir sua senha.',
    action: 'Redefinir minha senha',
  },
  invalid: {
    icon: 'ph:link-break-bold',
    title: 'Link não reconhecido',
    body: 'Talvez o link tenha sido copiado incompleto. Verifique o e-mail original ou peça ao RH para reenviar.',
    action: 'Pedir novo envio',
  },
}

export function Ben02LinkInvalido() {
  const [selected, setSelected] = useState<ErrorType>('expired')
  const item = content[selected]

  return (
    <div className="flex min-h-dvh flex-col px-5 pt-12 pb-8">
      <div className="mb-8 flex flex-col gap-2">
        {(Object.keys(content) as ErrorType[]).map((type) => (
          <button
            key={type}
            onClick={() => setSelected(type)}
            className={`flex min-h-[52px] items-center gap-3 rounded-lg border-[1.5px] px-4 font-heading text-left text-sm font-medium transition-all ${
              selected === type
                ? 'border-primary bg-primary-50 text-ink'
                : 'border-border bg-surface text-ink-secondary hover:bg-surface-hover'
            }`}
          >
            <Icon icon={content[type].icon} width={18} aria-hidden
              className={selected === type ? 'text-primary dark:text-primary-300' : 'text-ink-muted'} />
            {content[type].title}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
          <Icon icon={item.icon} width={32} className="text-primary dark:text-primary-300" aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-ink">{item.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{item.body}</p>
        </div>
        <Button fullWidth>{item.action}</Button>
        <p className="text-xs leading-snug text-ink-muted">
          Seu convite continua válido quando a situação for resolvida. Sem pressa.
        </p>
      </div>
    </div>
  )
}
