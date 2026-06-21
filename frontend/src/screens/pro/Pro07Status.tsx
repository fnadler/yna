import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'

const itens = [
  { label: 'Dados pessoais', ok: true },
  { label: 'Pessoa Jurídica', ok: true },
  { label: 'Dados clínicos (CRP, abordagem, áreas)', ok: true },
  { label: 'Formação e certificados', ok: true },
  { label: 'Vídeo de apresentação', ok: false },
  { label: 'Trilha de integração', ok: true },
]

export function Pro07Status() {
  const navigate = useNavigate()

  return (
    <section className="px-5 lg:px-0 pt-8 lg:pt-12 pb-10 animate-yna-slide-up">
      <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-primary-50 text-primary dark:text-primary-300">
        <Icon icon="ph:hourglass-medium-bold" width={24} aria-hidden />
      </span>
      <p className="mt-5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-primary dark:text-primary-300">Status</p>
      <div className="mt-1 flex items-center gap-3">
        <h1 className="font-heading text-[24px] font-medium tracking-[-0.02em] text-ink">Cadastro em análise</h1>
        <Badge tone="warning" icon="ph:clock-bold">Em revisão</Badge>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
        Recebemos tudo. A YNA revisa o seu cadastro e o seu CRP — normalmente em até <span className="font-semibold text-ink">48 horas</span>. Avisamos por e-mail assim que seu perfil estiver ativo.
      </p>

      <div className="mt-6 rounded-lg border border-border bg-surface p-4">
        <p className="text-sm font-semibold text-ink">O que você já enviou</p>
        <ul className="mt-3 flex flex-col gap-2.5">
          {itens.map((it) => (
            <li key={it.label} className="flex items-center gap-2.5 text-sm">
              <Icon
                icon={it.ok ? 'ph:check-circle-bold' : 'ph:warning-circle-bold'}
                width={18}
                className={it.ok ? 'shrink-0 text-success' : 'shrink-0 text-warning'}
                aria-hidden
              />
              <span className={it.ok ? 'text-ink-secondary' : 'text-ink'}>{it.label}</span>
              {!it.ok && <span className="ml-auto font-mono text-[11px] text-warning-ink">pendente</span>}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[13px] text-ink-muted">
          O vídeo pode ser enviado depois — mas perfis completos aparecem para mais beneficiários.
        </p>
      </div>

      <div className="mt-8">
        <Button size="lg" fullWidth iconRight="ph:arrow-right-bold" onClick={() => navigate('/pro/ativado')}>
          Continuar
        </Button>
      </div>
    </section>
  )
}
