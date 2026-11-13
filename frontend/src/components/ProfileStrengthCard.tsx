import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import type { ProfileStrength } from '../types'

/* "Perfil pronto para match" — card compartilhado (home PRO-12 + perfil PRO-09).
   A completude é a fonte única de verdade (ProContext/computeProfileStrength). */
export function ProfileStrengthCard({ strength, className = '' }: { strength: ProfileStrength; className?: string }) {
  const { percent, items } = strength
  const missing = items.filter((i) => !i.done)
  const complete = percent >= 100

  return (
    <div className={`rounded-lg border border-border bg-surface p-5 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-primary dark:text-primary-300">
            Perfil pronto para match
          </p>
          <p className="mt-1 text-[13px] text-ink-secondary">
            {complete ? 'Seu perfil está completo.' : 'Perfis completos aparecem para mais beneficiários.'}
          </p>
        </div>
        <span className="font-heading text-2xl font-bold text-ink">{percent}%</span>
      </div>

      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-pill bg-surface-2"
        role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}
        aria-label={`Perfil ${percent}% pronto para match`}
      >
        <div
          className={`h-full rounded-pill transition-all duration-500 ${complete ? 'bg-success' : 'bg-gradient-to-r from-primary to-pink'}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {complete ? (
        <p className="mt-4 flex items-center gap-2 text-sm font-medium text-success">
          <Icon icon="ph:seal-check-bold" width={18} aria-hidden />
          Tudo certo — nada pendente.
        </p>
      ) : (
        <div className="mt-4">
          <p className="text-sm font-semibold text-ink">
            {missing.length === 1 ? 'Falta 1 item:' : `Faltam ${missing.length} itens:`}
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {missing.map((item) => (
              <li key={item.key}>
                <Link
                  to={item.href}
                  className="flex items-center gap-2 rounded-sm px-1 py-1.5 text-sm text-ink-secondary transition-colors hover:text-ink"
                >
                  <Icon icon="ph:plus-circle-bold" width={16} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
                  <span className="flex-1">{item.label}</span>
                  <Icon icon="ph:caret-right-bold" width={13} className="shrink-0 text-ink-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
