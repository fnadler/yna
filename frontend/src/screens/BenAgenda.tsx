import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Avatar } from '../components/Avatar'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { Sheet } from '../components/Sheet'
import { upcomingSessions, completedSessions } from '../data/mock'
import { PAGE_MAX_W } from '../lib/layout'
import { MobileTopBar } from '../components/MobileTopBar'
import { SPECIALTY_CONFIG, SpecialtyBadge } from '../components/SpecialtyBadge'
import { Ben14Agendamento } from './Ben14Agendamento'
import { Ben15Confirmacao } from './Ben15Confirmacao'
import { Ben24Reagendamento } from './Ben24Reagendamento'
import { Ben24bConfirmacao } from './Ben24bConfirmacao'
import { Ben24bCancelConfirm } from './Ben24bCancelConfirm'
import { Ben24cCancelConfirmacao } from './Ben24cCancelConfirmacao'
import { Ben16PreSessao } from './Ben16PreSessao'
import { Ben28TrocarProfissional } from './Ben28TrocarProfissional'
import type { Session, Specialty } from '../types'

type AgendaSheet =
  | { type: 'pre-session'; sessionId: string }
  | { type: 'reschedule'; sessionId: string }
  | { type: 'reschedule-confirmation' }
  | { type: 'cancel-confirm'; sessionId: string }
  | { type: 'cancellation-confirmation' }
  | { type: 'schedule' }
  | { type: 'confirmation' }
  | { type: 'rematch' }
  | null

type Tab = 'upcoming' | 'completed'
type FilterArea = 'all' | Specialty

const FILTER_OPTIONS: { key: FilterArea; label: string; comingSoon?: boolean }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'saude-mental', label: 'Saúde Mental' },
  { key: 'nutricao', label: 'Nutrição' },
  { key: 'fisioterapia', label: 'Fisioterapia', comingSoon: true },
]

function SpecialtyPickerMenu({
  onSchedule,
  onClose,
  onRematch,
}: {
  onSchedule: () => void
  onClose: () => void
  onRematch?: () => void
}) {
  return (
    <div className="w-56 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
      <div className="px-3 pb-2 pt-3">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted">
          Tipo de sessão
        </p>
      </div>
      {(Object.entries(SPECIALTY_CONFIG) as [Specialty, (typeof SPECIALTY_CONFIG)[Specialty]][]).map(
        ([key, cfg]) => {
          const disabled = key !== 'saude-mental'
          return (
            <button
              key={key}
              disabled={disabled}
              onClick={() => {
                if (!disabled) {
                  onSchedule()
                  onClose()
                }
              }}
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                disabled ? 'cursor-not-allowed opacity-40' : 'hover:bg-surface-hover'
              }`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-sm ${cfg.pill}`}>
                <Icon icon={cfg.icon} width={16} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{cfg.label}</p>
                {disabled && (
                  <p className="text-[11px] text-ink-muted">Em breve</p>
                )}
              </div>
            </button>
          )
        }
      )}
      {onRematch && (
        <>
          <div className="mx-3 border-t border-border" />
          <button
            onClick={() => { onRematch(); onClose() }}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-hover"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-surface-2">
              <Icon icon="ph:shuffle-angular-bold" width={16} className="text-ink-secondary" aria-hidden />
            </div>
            <p className="text-sm font-medium text-ink">Outro profissional</p>
          </button>
        </>
      )}
      <div className="h-2" />
    </div>
  )
}

function UpcomingCard({
  session,
  isNext,
  confirmed,
  onConfirm,
  onReschedule,
  onEnterRoom,
}: {
  session: Session
  isNext: boolean
  confirmed: boolean
  onConfirm: () => void
  onReschedule: () => void
  onEnterRoom: () => void
}) {
  return (
    <Card className="shadow-xs">
      {/* Eyebrow + specialty badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          {isNext ? 'Em breve' : 'Próxima'}
        </span>
        <SpecialtyBadge specialty={session.specialty} />
      </div>

      {/* Info + actions: stacked on mobile, side by side on desktop */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar
            initials={session.professionalInitials}
            size={44}
            palette={session.professionalPalette}
          />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-ink">{session.professional}</p>
            <p className="text-sm text-ink-secondary">
              {session.weekday}, {session.date} · {session.time}
            </p>
          </div>
        </div>

        {/* Actions: secondary left, primary right */}
        <div className="flex shrink-0 gap-2">
          <Button
            variant="secondary"
            className="flex-1 lg:flex-none"
            onClick={onReschedule}
          >
            Editar
          </Button>
          {isNext ? (
            <Button
              iconLeft="ph:video-camera-bold"
              className="flex-1 lg:flex-none"
              onClick={onEnterRoom}
            >
              Entrar na sala
            </Button>
          ) : confirmed ? (
            <div className="flex flex-1 items-center justify-center gap-1.5 rounded-pill bg-success-bg px-4 py-2 font-heading text-[13px] font-semibold text-success-ink lg:flex-none">
              <Icon icon="ph:check-circle-bold" width={14} aria-hidden />
              Confirmado
            </div>
          ) : (
            <Button
              iconLeft="ph:check-bold"
              className="flex-1 lg:flex-none"
              onClick={onConfirm}
            >
              Confirmar
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

function CompletedCard({ session }: { session: Session }) {
  return (
    <Card className="shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            initials={session.professionalInitials}
            size={44}
            palette={session.professionalPalette}
          />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-ink">{session.professional}</p>
            <p className="text-sm text-ink-secondary">
              {session.weekday}, {session.date}
            </p>
            <div className="mt-1">
              <SpecialtyBadge specialty={session.specialty} />
            </div>
          </div>
        </div>
        <Badge tone="success" icon="ph:check-bold">Realizada</Badge>
      </div>

      <div className="flex items-center gap-2 rounded-sm bg-surface-2 px-3 py-2.5">
        <Icon icon="ph:clock-bold" width={14} className="shrink-0 text-ink-secondary" aria-hidden />
        <span className="text-sm text-ink-secondary">
          {session.startTime} → {session.endTime}
        </span>
        <span className="text-border-strong" aria-hidden>·</span>
        <span className="text-sm font-medium text-ink">{session.durationMin} min</span>
      </div>
    </Card>
  )
}

function MonthHeader({ label }: { label: string }) {
  return (
    <p className="pt-2 pb-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-primary dark:text-primary-300">
      {label}
    </p>
  )
}

function EmptyState({ tab }: { tab: Tab }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-2">
        <Icon
          icon={tab === 'upcoming' ? 'ph:calendar-blank-bold' : 'ph:clock-countdown-bold'}
          width={26}
          className="text-ink-secondary"
          aria-hidden
        />
      </div>
      <div>
        <p className="text-[15px] font-semibold text-ink">
          {tab === 'upcoming' ? 'Nenhuma sessão agendada' : 'Nenhuma sessão realizada ainda'}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
          {tab === 'upcoming'
            ? 'Quando você agendar uma sessão, ela vai aparecer aqui.'
            : 'Suas sessões realizadas vão aparecer aqui depois da primeira.'}
        </p>
      </div>
    </div>
  )
}

export function BenAgenda() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('upcoming')
  const [filterArea, setFilterArea] = useState<FilterArea>('all')
  const [addOpen, setAddOpen] = useState(false)
  const [confirmedSessions, setConfirmedSessions] = useState<Set<string>>(new Set())
  const [sheet, setSheet] = useState<AgendaSheet>(null)
  const desktopPickerRef = useRef<HTMLDivElement>(null)
  const fabPickerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside both triggers
  useEffect(() => {
    if (!addOpen) return
    const handler = (e: MouseEvent) => {
      const inDesktop = desktopPickerRef.current?.contains(e.target as Node)
      const inFab = fabPickerRef.current?.contains(e.target as Node)
      if (!inDesktop && !inFab) setAddOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [addOpen])

  const filteredUpcoming = filterArea === 'all'
    ? upcomingSessions
    : upcomingSessions.filter((s) => s.specialty === filterArea)

  const filteredCompleted = filterArea === 'all'
    ? completedSessions
    : completedSessions.filter((s) => s.specialty === filterArea)

  const monthGroups = filteredCompleted.reduce<{ label: string; sessions: Session[] }[]>(
    (acc, session) => {
      const label = session.monthGroup ?? ''
      const group = acc.find((g) => g.label === label)
      if (group) {
        group.sessions.push(session)
      } else {
        acc.push({ label, sessions: [session] })
      }
      return acc
    },
    []
  )

  return (
    <>
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
    <div className={`mx-auto ${PAGE_MAX_W}`}>
      <div className="px-5 lg:px-8 pb-0 pt-0 lg:pt-9">
        <MobileTopBar />
        <PageHeader
          title="Agenda"
          subtitle="Acompanhe suas próximas sessões e o histórico do seu cuidado."
          className="!mb-0 mt-2 lg:mt-0"
        />
      </div>

      {/* Segment control (tab switcher) + desktop Adicionar */}
      <div className="flex items-center gap-4 px-5 lg:px-8 pb-5 pt-3 lg:pt-2">
        <div className="flex w-full gap-1 rounded-lg bg-surface-2 p-1 lg:w-auto">
          {(['upcoming', 'completed'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2.5 px-4 font-heading text-sm font-semibold transition-all duration-200 ${
                tab === t
                  ? 'bg-surface text-ink shadow-xs'
                  : 'text-ink-secondary hover:text-ink-secondary'
              }`}
            >
              {t === 'upcoming' ? 'Próximas' : 'Realizadas'}
            </button>
          ))}
        </div>
        <div ref={desktopPickerRef} className="relative ml-auto hidden lg:block">
          <Button
            iconLeft="ph:plus-bold"
            iconRight={addOpen ? 'ph:caret-up-bold' : 'ph:caret-down-bold'}
            onClick={() => setAddOpen((prev) => !prev)}
          >
            Adicionar
          </Button>
          {addOpen && (
            <div className="absolute right-0 top-full z-20 mt-2">
              <SpecialtyPickerMenu
                onSchedule={() => setSheet({ type: 'schedule' })}
                onClose={() => setAddOpen(false)}
                onRematch={() => setSheet({ type: 'rematch' })}
              />
            </div>
          )}
        </div>
      </div>

      {/* Filter toolbar — visually distinct from the tab control above */}
      <div className="border-y border-border">
        <div className="scrollbar-none flex gap-2 overflow-x-auto px-5 py-3 lg:px-8">
          {FILTER_OPTIONS.map(({ key, label, comingSoon }) => {
            const isActive = filterArea === key
            const cfg = key !== 'all' ? SPECIALTY_CONFIG[key as Specialty] : null
            return (
              <button
                key={key}
                disabled={comingSoon}
                onClick={() => !comingSoon && setFilterArea(key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-pill border px-3 py-1.5 font-heading text-sm font-medium transition-colors ${
                  comingSoon
                    ? 'cursor-not-allowed border-border text-ink-muted opacity-50'
                    : isActive && key === 'all'
                      ? 'border-primary bg-primary text-white'
                      : isActive && cfg
                        ? `border-transparent ${cfg.pill}`
                        : 'border-border bg-surface text-ink-secondary hover:border-border-strong hover:text-ink'
                }`}
              >
                {cfg && (
                  isActive
                    ? <Icon icon={cfg.icon} width={13} aria-hidden />
                    : (
                      <span className={`inline-flex h-[18px] w-[18px] items-center justify-center rounded-full ${cfg.pill}`}>
                        <Icon icon={cfg.icon} width={10} aria-hidden />
                      </span>
                    )
                )}
                {label}
                {comingSoon && (
                  <span className="rounded-pill bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-ink-muted">
                    em breve
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <main className="px-5 lg:px-8 pb-32 pt-5 lg:pb-10">
        {tab === 'upcoming' && (
          filteredUpcoming.length === 0 ? (
            <EmptyState tab="upcoming" />
          ) : (
            <div className="flex flex-col gap-3">
              {filteredUpcoming.map((session, i) => (
                <UpcomingCard
                  key={session.id}
                  session={session}
                  isNext={i === 0}
                  confirmed={confirmedSessions.has(session.id)}
                  onConfirm={() => setConfirmedSessions((prev) => new Set(prev).add(session.id))}
                  onReschedule={() => setSheet({ type: 'reschedule', sessionId: session.id })}
                  onEnterRoom={() => setSheet({ type: 'pre-session', sessionId: session.id })}
                />
              ))}
            </div>
          )
        )}

        {tab === 'completed' && (
          filteredCompleted.length === 0 ? (
            <EmptyState tab="completed" />
          ) : (
            <div className="flex flex-col">
              {monthGroups.map((group) => (
                <div key={group.label}>
                  <MonthHeader label={group.label} />
                  <div className="flex flex-col gap-3">
                    {group.sessions.map((session) => (
                      <CompletedCard key={session.id} session={session} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>

      {/* Mobile FAB */}
      <div ref={fabPickerRef} className="fixed bottom-24 right-5 z-10 lg:hidden">
        <button
          onClick={() => setAddOpen((prev) => !prev)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform active:scale-95"
          aria-label="Adicionar sessão"
        >
          <Icon icon={addOpen ? 'ph:x-bold' : 'ph:plus-bold'} width={22} aria-hidden />
        </button>
        {addOpen && (
          <div className="absolute bottom-full right-0 mb-3">
            <SpecialtyPickerMenu
              onSchedule={() => setSheet({ type: 'schedule' })}
              onClose={() => setAddOpen(false)}
              onRematch={() => setSheet({ type: 'rematch' })}
            />
          </div>
        )}
      </div>
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
          : sheet?.type === 'rematch' ? 'ph:shuffle-angular-bold'
          : 'ph:calendar-plus-bold'
      }
      iconColor={
        sheet?.type === 'reschedule-confirmation' || sheet?.type === 'confirmation' ? 'text-success'
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
    </>
  )
}
