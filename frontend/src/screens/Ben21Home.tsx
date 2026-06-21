import { useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { OptionCard } from '../components/OptionCard'
import { Sheet } from '../components/Sheet'
import { MobileTopBar } from '../components/MobileTopBar'
import type { AppLayoutContext } from '../components/AppLayout'
import { upcomingSessions } from '../data/mock'
import { useApp } from '../contexts/AppContext'
import { PAGE_MAX_W } from '../lib/layout'
import { SpecialtyBadge } from '../components/SpecialtyBadge'
import { Ben14Agendamento } from './Ben14Agendamento'
import { Ben15Confirmacao } from './Ben15Confirmacao'
import { Ben24Reagendamento } from './Ben24Reagendamento'
import { Ben24bConfirmacao } from './Ben24bConfirmacao'
import { Ben24bCancelConfirm } from './Ben24bCancelConfirm'
import { Ben24cCancelConfirmacao } from './Ben24cCancelConfirmacao'
import { Ben16PreSessao } from './Ben16PreSessao'
import { Ben28TrocarProfissional } from './Ben28TrocarProfissional'
import { Ben25CheckInConfig } from './Ben25CheckInConfig'
import { Ben25bCheckInSucesso } from './Ben25bCheckInSucesso'
import { Ben26CheckInNina } from './Ben26CheckInNina'
import { Ben27CheckInForm } from './Ben27CheckInForm'
import { EmergencyModal } from '../components/EmergencyModal'
import type { Session } from '../types'

type HomeSheet =
  | { type: 'pre-session'; sessionId: string }
  | { type: 'reschedule'; sessionId: string }
  | { type: 'reschedule-confirmation' }
  | { type: 'cancel-confirm'; sessionId: string }
  | { type: 'cancellation-confirmation' }
  | { type: 'schedule' }
  | { type: 'confirmation' }
  | { type: 'checkin-config' }
  | { type: 'checkin-nina' }
  | { type: 'checkin-form' }
  | { type: 'checkin-success' }
  | { type: 'rematch' }
  | null

const shortcuts = [
  {
    icon: 'ph:calendar-plus-bold',
    label: 'Agendar sessão',
    desc: 'Marque um novo horário com seu profissional',
    variant: 'default' as const,
    action: 'schedule',
  },
  {
    icon: 'ph:flower-tulip-bold',
    label: 'Check-in de bem-estar',
    desc: 'Um momento rápido para registrar como você está',
    variant: 'default' as const,
    action: 'checkin',
  },
  {
    icon: 'ph:first-aid-bold',
    label: 'Emergência',
    desc: 'Acesse suporte imediato em situação de crise',
    variant: 'emergency' as const,
    action: 'emergency',
  },
]

function NextSessionCard({
  session,
  confirmed,
  onReschedule,
  onEnterRoom,
}: {
  session: Session
  confirmed: boolean
  onReschedule: () => void
  onEnterRoom: () => void
}) {
  return (
    <div className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-5">
      {/* Eyebrow + specialty */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          Em breve
        </span>
        <SpecialtyBadge specialty={session.specialty} />
      </div>

      {/* Professional info + time side by side */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            initials={session.professionalInitials}
            size={48}
            palette={session.professionalPalette}
          />
          <div className="min-w-0">
            <p className="truncate text-[17px] font-semibold leading-snug text-ink">
              {session.professional}
            </p>
            <p className="mt-0.5 text-[13px] text-ink-secondary">
              {session.weekday}, {session.date}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[30px] font-bold leading-none tracking-[-0.02em] text-ink">
            {session.time}
          </p>
        </div>
      </div>

      {/* Actions: secondary left, primary right */}
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onReschedule}>
          Editar
        </Button>
        {confirmed ? (
          <div className="flex flex-1 items-center justify-center gap-1.5 rounded-pill bg-success-bg py-2 font-heading text-[13px] font-semibold text-success-ink">
            <Icon icon="ph:check-circle-bold" width={14} aria-hidden />
            Confirmado
          </div>
        ) : (
          <Button
            iconLeft="ph:video-camera-bold"
            className="flex-1"
            onClick={onEnterRoom}
          >
            Entrar na sala
          </Button>
        )}
      </div>
    </div>
  )
}

function SessionCard({
  session,
  isFirst,
  confirmed,
  onConfirm,
  onReschedule,
  onEnterRoom,
}: {
  session: Session
  isFirst: boolean
  confirmed: boolean
  onConfirm: () => void
  onReschedule: () => void
  onEnterRoom: () => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      {/* Eyebrow + specialty */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          {isFirst ? 'Em breve' : 'Próxima'}
        </span>
        <SpecialtyBadge specialty={session.specialty} />
      </div>

      {/* Professional info */}
      <div className="flex items-center gap-3">
        <Avatar
          initials={session.professionalInitials}
          size={38}
          palette={session.professionalPalette}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{session.professional}</p>
          <p className="text-[13px] text-ink-secondary">
            {session.weekday}, {session.date} · {session.time}
          </p>
        </div>
      </div>

      {/* Always two actions: secondary left, primary right */}
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={onReschedule}>
          Editar
        </Button>
        {isFirst ? (
          <Button
            size="sm"
            iconLeft="ph:video-camera-bold"
            className="flex-1"
            onClick={onEnterRoom}
          >
            Entrar na sala
          </Button>
        ) : confirmed ? (
          <div className="flex flex-1 items-center justify-center gap-1.5 rounded-pill bg-success-bg py-2 font-heading text-[13px] font-semibold text-success-ink">
            <Icon icon="ph:check-circle-bold" width={14} aria-hidden />
            Confirmado
          </div>
        ) : (
          <Button
            size="sm"
            iconLeft="ph:check-bold"
            className="flex-1"
            onClick={onConfirm}
          >
            Confirmar
          </Button>
        )}
      </div>
    </div>
  )
}

export function Ben21Home() {
  const navigate = useNavigate()
  const { user } = useApp()
  const { openNotifications, unread } = useOutletContext<AppLayoutContext>()

  const [confirmedSessions, setConfirmedSessions] = useState<Set<string>>(new Set())
  const [sheet, setSheet] = useState<HomeSheet>(null)
  const [emergencyOpen, setEmergencyOpen] = useState(false)
  const nextSession = upcomingSessions[0]

  return (
    <>
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
    <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8`}>

      {/* Mobile top bar — sidebar handles desktop (tema + sino) */}
      <MobileTopBar unread={unread} onBellClick={openNotifications} />

      {/* Page header: greeting */}
      <div className="pt-2 pb-6 lg:pt-9 lg:pb-6">
        <h1 className="text-[26px] lg:text-[32px] font-medium tracking-[-0.02em] text-ink">
          Oi, {user.nickname}.
        </h1>
        <p className="mt-0.5 text-[15px] text-ink-secondary">Que bom ter você por aqui.</p>
      </div>

      {/* Main content */}
      <main className="pb-32 lg:pb-10">

        {/* Mobile: próxima sessão + link para agenda */}
        {nextSession && (
          <div className="mb-6 lg:hidden">
            <SessionCard
              session={nextSession}
              isFirst
              confirmed={confirmedSessions.has(nextSession.id)}
              onConfirm={() => setConfirmedSessions((prev) => new Set(prev).add(nextSession.id))}
              onReschedule={() => setSheet({ type: 'reschedule', sessionId: nextSession.id })}
              onEnterRoom={() => setSheet({ type: 'pre-session', sessionId: nextSession.id })}
            />
            <Link
              to="/agenda"
              className="mt-3 flex items-center gap-1 font-heading text-sm font-medium text-primary transition-colors hover:text-primary-600 dark:text-primary-300"
            >
              Ver toda a agenda
              <Icon icon="ph:arrow-right-bold" width={14} aria-hidden />
            </Link>
          </div>
        )}

        {/* Desktop/tablet: 2 columns */}
        <div className="lg:grid lg:grid-cols-[2fr_1fr] lg:items-start lg:gap-10">

          {/* Left column: featured next session (desktop) + shortcuts + Nina */}
          <div className="flex flex-col gap-4">
            {nextSession && (
              <div className="hidden lg:block">
                <NextSessionCard
                  session={nextSession}
                  confirmed={confirmedSessions.has(nextSession.id)}
                  onReschedule={() => setSheet({ type: 'reschedule', sessionId: nextSession.id })}
                  onEnterRoom={() => setSheet({ type: 'pre-session', sessionId: nextSession.id })}
                />
              </div>
            )}
            <nav aria-label="Atalhos rápidos" className="lg:py-5">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
                {shortcuts.map((s) => (
                  <OptionCard
                    key={s.label}
                    icon={s.icon}
                    label={s.label}
                    desc={s.desc}
                    onClick={
                      s.action === 'schedule' ? () => setSheet({ type: 'schedule' })
                      : s.action === 'checkin' ? () => setSheet({ type: 'checkin-config' })
                      : s.action === 'emergency' ? () => setEmergencyOpen(true)
                      : undefined
                    }
                    variant={s.variant === 'emergency' ? 'danger' : 'default'}
                    layout="shortcut"
                    showArrow={false}
                  />
                ))}
              </div>
            </nav>

            <Card variant="gradient" padding="none" className="relative overflow-hidden shadow-md">
              <div className="flex flex-col gap-5 p-6 md:p-8 md:flex-row md:items-center md:justify-between md:gap-8">
                {/* Text content & header */}
                <div className="flex-1 min-w-0 flex flex-col items-start gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-white/20 dark:bg-primary-50/15 backdrop-blur-sm text-ink-gradient dark:text-primary-300">
                      <Icon icon="ph:sparkle-bold" width={20} aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-heading text-xl md:text-2xl font-bold tracking-tight text-ink-gradient dark:text-ink">
                        Nyna
                      </h3>
                      <p className="text-xs font-semibold text-ink-gradient-secondary dark:text-ink-secondary">
                        Com você, 24 horas por dia
                      </p>
                    </div>
                  </div>
                  <p className="text-sm md:text-[15px] leading-relaxed text-ink-gradient-body dark:text-ink-secondary max-w-xl">
                    Se algo apertar entre uma sessão e outra, você não precisa esperar. Estou aqui pra
                    conversar, sem julgamento e no seu tempo.
                  </p>
                  
                  {/* Button below the text */}
                  <Button
                    variant="primary"
                    size="lg"
                    iconLeft="ph:chat-circle-dots-bold"
                    className="!bg-primary text-white shadow-md hover:!bg-primary-600 hover:-translate-y-px active:translate-y-0 w-full md:w-auto px-6 mt-1"
                    onClick={() => navigate('/nina')}
                  >
                    Conversar com a Nyna
                  </Button>
                </div>

                {/* Avatar / Portrait - Pebble Shape */}
                <div className="hidden md:block shrink-0 relative w-[160px] h-[160px]">
                  {/* Decorative background glass blob */}
                  <div className="absolute inset-0 bg-white/20 dark:bg-white/5 backdrop-blur-sm rounded-[60%_40%_60%_40%_/_50%_60%_40%_50%] scale-105 rotate-12" />
                  
                  {/* Nina Image in Pebble frame */}
                  <div className="absolute inset-0 overflow-hidden border border-white/40 dark:border-white/10 shadow-lg rounded-[50%_50%_40%_60%_/_40%_60%_40%_60%] hover:scale-[1.03] transition-transform duration-500 ease-organic">
                    <img
                      src="/images/nina.png"
                      alt="Nyna"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Floating mini avatar on mobile */}
                <div className="absolute top-6 right-6 md:hidden">
                  <div className="w-12 h-12 overflow-hidden border border-white/40 dark:border-white/10 shadow-sm rounded-[50%_50%_40%_60%_/_40%_60%_40%_60%]">
                    <img
                      src="/images/nina.png"
                      alt="Nyna"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right column: sessions list (desktop/tablet only) */}
          <div className="hidden lg:flex lg:flex-col lg:gap-3">
            <div className="flex items-center gap-2">
              <Icon icon="ph:calendar-bold" width={16} className="text-ink-secondary" aria-hidden />
              <h2 className="text-[15px] font-semibold text-ink">Agenda</h2>
            </div>
            {upcomingSessions.slice(1).map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                isFirst={false}
                confirmed={confirmedSessions.has(session.id)}
                onConfirm={() => setConfirmedSessions((prev) => new Set(prev).add(session.id))}
                onReschedule={() => setSheet({ type: 'reschedule', sessionId: session.id })}
                onEnterRoom={() => setSheet({ type: 'pre-session', sessionId: session.id })}
              />
            ))}
            <Link
              to="/agenda"
              className="flex items-center gap-1 font-heading text-sm font-medium text-primary transition-colors hover:text-primary-600 dark:text-primary-300"
            >
              Ver agenda completa
              <Icon icon="ph:arrow-right-bold" width={14} aria-hidden />
            </Link>
          </div>

        </div>
      </main>
    </div>
    </div>

    <Sheet
      open={sheet !== null}
      onClose={() => setSheet(null)}
      title={
        sheet?.type === 'pre-session' ? 'Preparar para sessão'
          : sheet?.type === 'reschedule' ? 'Editar sessão'
          : sheet?.type === 'reschedule-confirmation' ? 'Sessão reagendada'
          : sheet?.type === 'cancel-confirm' ? 'Cancelar sessão'
          : sheet?.type === 'cancellation-confirmation' ? 'Sessão cancelada'
          : sheet?.type === 'confirmation' ? 'Sessão agendada'
          : sheet?.type === 'checkin-config' ? 'Check-in de bem-estar'
          : sheet?.type === 'checkin-nina' ? 'Check-in com a Nyna'
          : sheet?.type === 'checkin-form' ? 'Check-in rápido'
          : sheet?.type === 'checkin-success' ? 'Check-in registrado'
          : sheet?.type === 'rematch' ? 'Outro profissional'
          : 'Agendar sessão'
      }
      icon={
        sheet?.type === 'pre-session' ? 'ph:monitor-play-bold'
          : sheet?.type === 'reschedule' ? 'ph:pencil-bold'
          : sheet?.type === 'reschedule-confirmation' ? 'ph:check-circle-bold'
          : sheet?.type === 'cancel-confirm' ? 'ph:x-circle-bold'
          : sheet?.type === 'cancellation-confirmation' ? 'ph:calendar-x-bold'
          : sheet?.type === 'confirmation' ? 'ph:calendar-check-bold'
          : sheet?.type === 'checkin-config' ? 'ph:flower-tulip-bold'
          : sheet?.type === 'checkin-nina' ? 'ph:sparkle-bold'
          : sheet?.type === 'checkin-form' ? 'ph:list-checks-bold'
          : sheet?.type === 'checkin-success' ? 'ph:check-circle-bold'
          : sheet?.type === 'rematch' ? 'ph:shuffle-angular-bold'
          : 'ph:calendar-plus-bold'
      }
      iconColor={
        sheet?.type === 'reschedule-confirmation' || sheet?.type === 'confirmation' || sheet?.type === 'checkin-success' ? 'text-success'
          : sheet?.type === 'cancel-confirm' ? 'text-danger'
          : undefined
      }
      size="md"
    >
      {sheet?.type === 'pre-session' && (
        <Ben16PreSessao
          sessionId={sheet.sessionId}
          onEnter={() => { setSheet(null); navigate(`/sessao/${sheet.sessionId}`) }}
        />
      )}
      {sheet?.type === 'checkin-config' && (
        <Ben25CheckInConfig
          onStart={(mode) => setSheet(mode === 'nina' ? { type: 'checkin-nina' } : { type: 'checkin-form' })}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet?.type === 'checkin-nina' && (
        <Ben26CheckInNina onDone={() => setSheet({ type: 'checkin-success' })} />
      )}
      {sheet?.type === 'checkin-form' && (
        <Ben27CheckInForm onDone={() => setSheet({ type: 'checkin-success' })} onCancel={() => setSheet(null)} />
      )}
      {sheet?.type === 'checkin-success' && (
        <Ben25bCheckInSucesso onClose={() => setSheet(null)} />
      )}
      {sheet?.type === 'reschedule' && (
        <Ben24Reagendamento
          sessionId={sheet.sessionId}
          onSaved={() => setSheet({ type: 'reschedule-confirmation' })}
          onCancelRequest={(_scope) => setSheet({ type: 'cancel-confirm', sessionId: sheet.sessionId })}
          onRematch={() => setSheet({ type: 'rematch' })}
        />
      )}
      {sheet?.type === 'reschedule-confirmation' && (
        <Ben24bConfirmacao onClose={() => setSheet(null)} />
      )}
      {sheet?.type === 'cancel-confirm' && (
        <Ben24bCancelConfirm
          sessionId={sheet.sessionId}
          onCancelled={() => setSheet({ type: 'cancellation-confirmation' })}
          onBack={() => setSheet({ type: 'reschedule', sessionId: sheet.sessionId })}
        />
      )}
      {sheet?.type === 'cancellation-confirmation' && (
        <Ben24cCancelConfirmacao onClose={() => setSheet(null)} />
      )}
      {sheet?.type === 'schedule' && (
        <Ben14Agendamento
          proId="pro-1"
          onConfirm={() => setSheet({ type: 'confirmation' })}
          onRematch={() => setSheet({ type: 'rematch' })}
        />
      )}
      {sheet?.type === 'confirmation' && (
        <Ben15Confirmacao />
      )}
      {sheet?.type === 'rematch' && (
        <Ben28TrocarProfissional
          onConfirm={(intent) => { setSheet(null); navigate('/profissionais/novos', { state: { intent } }) }}
          onClose={() => setSheet(null)}
        />
      )}
    </Sheet>

    <EmergencyModal open={emergencyOpen} onClose={() => setEmergencyOpen(false)} />
    </>
  )
}
