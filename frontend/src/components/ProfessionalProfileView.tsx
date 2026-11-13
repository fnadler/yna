import { Icon } from '@iconify/react'
import { Avatar } from './Avatar'
import { Badge } from './Badge'
import { Button } from './Button'
import { Card } from './Card'
import type { Professional } from '../types'

/* Perfil completo do profissional como o beneficiário vê (BEN-13).
   Layout único, reusado na pré-visualização do profissional (PRO-10) com
   `variant="preview"` (botões inativos). */
export function ProfessionalProfileView({ pro, variant = 'sheet', onClose, onSchedule, onBack }: {
  pro: Professional
  variant?: 'standalone' | 'sheet' | 'preview'
  onClose?: () => void
  onSchedule?: () => void
  onBack?: () => void
}) {
  const disabled = variant === 'preview'

  return (
    <main className="mx-auto max-w-2xl flex-1 px-5 lg:px-6 pb-8 lg:pb-10">
      <div className="flex items-center gap-4 py-4">
        <Avatar initials={pro.initials} size={72} palette={pro.palette} />
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.01em] text-ink">{pro.name}</h2>
          <p className="text-sm text-ink-muted">{pro.crp}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Badge tone="primary">{pro.approachLong}</Badge>
          </div>
        </div>
      </div>

      <Card variant="sunken" className="mb-4">
        <p className="text-sm leading-relaxed text-ink-secondary">{pro.bio}</p>
      </Card>

      <div className="mb-4 rounded-lg border border-border bg-surface p-4">
        <div
          className="relative flex aspect-video w-full items-center justify-center rounded-sm bg-yna-gradient-soft dark:bg-surface-2"
          role="img"
          aria-label={`Vídeo de apresentação de ${pro.name}`}
        >
          <Avatar initials={pro.initials} size={56} palette={pro.palette} />
          <button disabled={disabled} className="absolute inset-0 flex items-center justify-center disabled:cursor-default">
            <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-[rgba(31,27,45,0.72)] text-white">
              <Icon icon="ph:play-fill" width={22} aria-hidden />
            </span>
          </button>
          <span className="absolute bottom-3 right-3 rounded-pill bg-[rgba(31,27,45,0.72)] px-2.5 py-1 font-mono text-[11px] font-medium text-white">
            {pro.videoLength}
          </span>
        </div>
        <p className="mt-2 text-center text-xs text-ink-muted">Vídeo de apresentação</p>
      </div>

      <div className="mb-4 flex flex-col gap-4">
        <Card>
          <div className="flex items-center gap-2">
            <Icon icon="ph:graduation-cap-bold" width={18} className="text-primary dark:text-primary-300" aria-hidden />
            <h3 className="text-[15px] font-semibold text-ink">Formação</h3>
          </div>
          <ul className="flex flex-col gap-2">
            {pro.formation.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-ink-secondary">
                <Icon icon="ph:check-circle-bold" width={16} className="mt-0.5 shrink-0 text-success" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Icon icon="ph:sparkle-bold" width={18} className="text-primary dark:text-primary-300" aria-hidden />
            <h3 className="text-[15px] font-semibold text-ink">Especialidades</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {pro.specialties.map((s) => (
              <Badge key={s} tone="neutral">{s}</Badge>
            ))}
          </div>
        </Card>

        <Card variant="sunken">
          <div className="flex items-center gap-2">
            <Icon icon="ph:calendar-bold" width={18} className="text-ink-secondary" aria-hidden />
            <h3 className="text-[15px] font-semibold text-ink">Disponibilidade</h3>
          </div>
          <p className="text-sm text-ink-secondary">
            Próximo horário disponível: <strong className="text-ink">{pro.nextSlot}</strong>
          </p>
          <p className="text-xs text-ink-muted">
            Sessões de {pro.sessionDuration} minutos · Atendimento online
          </p>
        </Card>
      </div>

      <div className="flex gap-2">
        {variant === 'standalone' ? (
          <>
            <Button variant="secondary" className="flex-1" onClick={onBack}>Voltar aos matches</Button>
            <Button className="flex-1" onClick={onSchedule}>Agendar 1ª sessão</Button>
          </>
        ) : (
          <>
            <Button variant="secondary" className="flex-1" disabled={disabled} onClick={onClose}>Fechar</Button>
            <Button className="flex-1" disabled={disabled} onClick={onSchedule}>Agendar 1ª sessão</Button>
          </>
        )}
      </div>
    </main>
  )
}
