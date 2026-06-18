import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { YnaIcon } from '../components/YnaIcons'
import type { YnaIconName } from '../components/YnaIcons'

interface OptIn {
  id: 'transacional' | 'marketing'
  title: string
  description: string
  icon: string
  ynaIcon?: YnaIconName
  required: boolean
}

const opts: OptIn[] = [
  {
    id: 'transacional',
    title: 'Lembretes de sessão e atualizações da conta',
    description: 'Confirmações de agendamento, alertas de sessão em 24h e 1h, e notificações de segurança. Essenciais para o serviço funcionar.',
    icon: 'ph:bell-ringing-bold',
    ynaIcon: 'bell' as const,
    required: true,
  },
  {
    id: 'marketing',
    title: 'Dicas de bem-estar e novidades',
    description: 'Conteúdo sobre saúde mental, novos recursos da plataforma e lembretes gentis de autocuidado. Opcional. Você pode mudar a qualquer momento.',
    icon: 'ph:flower-tulip-bold',
    ynaIcon: 'flower' as const,
    required: false,
  },
]

export function Ben08Comunicacoes() {
  const [marketing, setMarketing] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="flex flex-col px-5 pt-12 pb-8 animate-yna-slide-up">
      <div className="mb-8">
        <p className="mb-1 text-sm font-medium text-primary dark:text-primary-300">
          Na sua medida
        </p>
        <h1 className="mt-1 text-[24px] lg:text-[40px] font-extralight leading-[1.15] lg:leading-[1.05] tracking-[-0.02em] text-ink">
          Como quer{' '}
          <span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">receber</span>
          {' '}nossos contatos?
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          Sem spam. Você controla e pode mudar nas configurações a qualquer hora.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {opts.map((opt) => {
          const active = opt.required || marketing
          return (
            <label
              key={opt.id}
              className={`flex cursor-pointer items-start gap-4 rounded-lg border-[1.5px] p-4 transition-all ${
                active ? 'border-primary bg-primary-50/50' : 'border-border bg-surface hover:bg-surface-hover'
              } ${opt.required ? 'cursor-default' : ''}`}
            >
              <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-sm ${active ? 'bg-primary-50' : 'bg-surface-2'}`}>
                {opt.ynaIcon
                  ? <YnaIcon name={opt.ynaIcon} size={20} className={active ? 'text-primary dark:text-primary-300' : 'text-ink-muted'} />
                  : <Icon icon={opt.icon} width={20} className={active ? 'text-primary dark:text-primary-300' : 'text-ink-muted'} aria-hidden />
                }
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">{opt.title}</p>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={opt.required ? true : marketing}
                      onChange={opt.required ? undefined : (e) => setMarketing(e.target.checked)}
                      disabled={opt.required}
                      className="h-5 w-5 appearance-none rounded-xs border-[1.5px] border-border-strong bg-surface transition-colors checked:border-primary checked:bg-primary disabled:cursor-not-allowed"
                      aria-label={opt.title}
                    />
                  </div>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{opt.description}</p>
                {opt.required && (
                  <p className="mt-1 text-xs font-medium text-ink-muted">Obrigatório para o serviço funcionar</p>
                )}
              </div>
            </label>
          )
        })}
      </div>

      <div className="mt-8 flex flex-col gap-2">
        <Button size="lg" fullWidth iconRight="ph:arrow-right-bold" onClick={() => navigate('/pronto')}>
          Salvar e continuar
        </Button>
      </div>
    </div>
  )
}
