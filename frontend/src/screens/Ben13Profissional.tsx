import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Avatar } from '../components/Avatar'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { professionals } from '../data/mock'

interface Ben13Props {
  proId?: string
  onClose?: () => void
  onSchedule?: () => void
}

export function Ben13Profissional({ proId, onClose, onSchedule }: Ben13Props = {}) {
  const { id: paramId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const pro = professionals.find((p) => p.id === (proId ?? paramId)) ?? professionals[0]!
  const isSheet = !!onClose

  return (
    <>
      {/* Page header — only in standalone (FlowLayout) mode */}
      {!isSheet && (
        <header className="hidden lg:flex items-center gap-3 px-5 lg:px-8 pb-3 pt-8 lg:pt-10">
          <button
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover"
          >
            <Icon icon="ph:arrow-left-bold" width={18} aria-hidden />
          </button>
          <h1 className="text-base font-semibold text-ink">Perfil do profissional</h1>
        </header>
      )}

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
            className="relative flex h-[180px] items-center justify-center rounded-sm bg-yna-gradient-soft dark:bg-surface-2"
            role="img"
            aria-label={`Vídeo de apresentação de ${pro.name}`}
          >
            <Avatar initials={pro.initials} size={56} palette={pro.palette} />
            <button className="absolute inset-0 flex items-center justify-center">
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
          {isSheet ? (
            <>
              <Button variant="secondary" className="flex-1" onClick={onClose}>
                Fechar
              </Button>
              <Button className="flex-1" onClick={onSchedule}>
                Agendar 1ª sessão
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" className="flex-1" onClick={() => navigate('/matches')}>
                Voltar aos matches
              </Button>
              <Button className="flex-1" onClick={() => navigate(`/agendar/${pro.id}`)}>
                Agendar 1ª sessão
              </Button>
            </>
          )}
        </div>
      </main>
    </>
  )
}
