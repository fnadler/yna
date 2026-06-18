import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'
import { ProfileRow } from '../components/ProfileRow'
import { availableSlots, mockSession } from '../data/mock'
import { sessionService } from '../services'
import { PAGE_MAX_W } from '../lib/layout'

export type RecurrenceScope = 'this' | 'all'

interface Ben24Props {
  sessionId?: string
  onSaved?: () => void
  onCancelRequest?: (scope: RecurrenceScope) => void
  onRematch?: () => void
}

const SESSION_IS_RECURRING = true

const SCOPE_OPTIONS = [
  {
    key: 'this' as const,
    icon: 'ph:calendar-check-bold',
    title: 'Apenas esta sessão',
    desc: `${mockSession.weekday}, ${mockSession.date}`,
  },
  {
    key: 'all' as const,
    icon: 'ph:repeat-bold',
    title: 'Este e todos os próximos',
    desc: 'Altera o compromisso recorrente completo',
  },
]

// Weekday data (for recurring scope)
const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']

const WEEKDAY_FULL: Record<string, string> = {
  Segunda: 'Segunda-feira',
  Terça: 'Terça-feira',
  Quarta: 'Quarta-feira',
  Quinta: 'Quinta-feira',
  Sexta: 'Sexta-feira',
}

const WEEKDAY_NUM: Record<string, number> = {
  Segunda: 1, Terça: 2, Quarta: 3, Quinta: 4, Sexta: 5,
}

const recurringSlots = availableSlots.reduce<Record<string, string[]>>((acc, s) => {
  const prev = acc[s.weekday] ?? []
  acc[s.weekday] = Array.from(new Set([...prev, ...s.times])).sort()
  return acc
}, {})

function nextOccurrence(weekday: string): string {
  const target = WEEKDAY_NUM[weekday] ?? 1
  const today = new Date()
  let daysAhead = target - today.getDay()
  if (daysAhead <= 0) daysAhead += 7
  const next = new Date(today)
  next.setDate(today.getDate() + daysAhead)
  return next.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

// Calendar helpers (for single-session scope)
const DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

const MONTH_NAMES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

const availableDates = new Set(availableSlots.map((s) => s.date))

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function calFirstDayOffset(year: number, month: number) {
  return (new Date(year, month, 1).getDay() + 6) % 7
}

export function Ben24Reagendamento({ sessionId, onSaved, onCancelRequest, onRematch }: Ben24Props = {}) {
  const navigate = useNavigate()
  const { sessaoId: paramId } = useParams<{ sessaoId?: string }>()
  const resolvedId = sessionId ?? paramId ?? 'sess-1'
  const isSheet = !!onSaved

  const todayStr = new Date().toISOString().split('T')[0]!

  const [scope, setScope] = useState<RecurrenceScope>('this')
  // Single-session state
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date())
  // Recurring state
  const [selectedWeekday, setSelectedWeekday] = useState<string | null>(null)
  // Shared
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const slot = availableSlots.find((s) => s.date === selectedDate)
  const upcomingSlots = availableSlots.filter((s) => s.date >= todayStr).slice(0, 5)
  const recurringTimes = selectedWeekday ? (recurringSlots[selectedWeekday] ?? []) : []

  const handleScopeChange = (s: RecurrenceScope) => {
    setScope(s)
    setSelectedDate(null)
    setSelectedWeekday(null)
    setSelectedTime(null)
    setCalendarOpen(false)
  }

  const handleSelectDate = (date: string) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const canSave =
    scope === 'this'
      ? Boolean(selectedDate && selectedTime)
      : Boolean(selectedWeekday && selectedTime)

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    await sessionService.reschedule(resolvedId, (selectedDate ?? selectedWeekday)!, selectedTime!)
    setSaving(false)
    if (onSaved) onSaved()
    else navigate('/home')
  }

  // Calendar
  const calYear = calendarMonth.getFullYear()
  const calMonthIdx = calendarMonth.getMonth()
  const daysInMonth = new Date(calYear, calMonthIdx + 1, 0).getDate()
  const calOffset = calFirstDayOffset(calYear, calMonthIdx)
  const calCells = [
    ...Array<null>(calOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  const today = new Date()
  const isCurrentMonth = calYear === today.getFullYear() && calMonthIdx === today.getMonth()

  return (
    <>
      {!isSheet && (
        <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-12 lg:pt-10`}>
          <div className="mb-5 flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              aria-label="Voltar"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover"
            >
              <Icon icon="ph:arrow-left-bold" width={18} aria-hidden />
            </button>
            <h1 className="text-base font-semibold text-ink">Reagendar sessão</h1>
          </div>
        </div>
      )}

      <div className={isSheet ? 'px-5 pb-6 pt-5 lg:px-6' : `mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pb-8 lg:pb-12`}>
        <div className={isSheet ? '' : 'lg:max-w-2xl'}>

          {/* Professional */}
          <ProfileRow className="mb-5">
            <Avatar
              initials={mockSession.professionalInitials}
              size={48}
              palette={mockSession.professionalPalette}
            />
            <div>
              <p className="font-semibold text-ink">{mockSession.professional}</p>
              <p className="text-sm text-ink-secondary">
                Atual: {mockSession.weekday}, {mockSession.date} às {mockSession.time}
              </p>
            </div>
          </ProfileRow>

          {/* Scope picker */}
          {SESSION_IS_RECURRING && (
            <div className="mb-5">
              <h2 className="mb-3 text-[15px] font-semibold text-ink">O que deseja alterar?</h2>
              <div className="flex flex-col gap-2">
                {SCOPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => handleScopeChange(opt.key)}
                    className={`flex items-center gap-3 rounded-lg border-[1.5px] p-4 text-left transition-all ${
                      scope === opt.key
                        ? 'border-primary bg-primary-50'
                        : 'border-border bg-surface hover:bg-surface-hover'
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        scope === opt.key ? 'bg-primary text-white' : 'bg-surface-2 text-ink-secondary'
                      }`}
                    >
                      <Icon icon={opt.icon} width={18} aria-hidden />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink">{opt.title}</p>
                      <p className="mt-0.5 text-xs leading-snug text-ink-secondary">{opt.desc}</p>
                    </div>
                    {scope === opt.key && (
                      <Icon icon="ph:check-circle-fill" width={18} className="shrink-0 text-primary" aria-hidden />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Single session: date picker + calendar ── */}
          {scope === 'this' && (
            <>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-ink">Nova data</h2>
                {calendarOpen && (
                  <button
                    onClick={() => setCalendarOpen(false)}
                    className="flex items-center gap-1 font-heading text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
                  >
                    <Icon icon="ph:list-bold" width={14} aria-hidden />
                    Próximas datas
                  </button>
                )}
              </div>

              {!calendarOpen && (
                <>
                  <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {upcomingSlots.map((s) => {
                      const parts = s.date.split('-')
                      const day = parts[2]
                      const month = parts[1]
                      return (
                        <button
                          key={s.date}
                          onClick={() => handleSelectDate(s.date)}
                          className={`flex flex-col items-center rounded-lg border-[1.5px] py-3 font-heading text-sm font-medium transition-all ${
                            selectedDate === s.date
                              ? 'border-primary bg-primary-50 text-ink'
                              : 'border-border bg-surface text-ink-secondary hover:border-border-strong hover:bg-surface-hover'
                          }`}
                        >
                          <span className="text-xs text-ink-muted">{s.weekday}</span>
                          <span className="text-base font-semibold">{day}/{month}</span>
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => setCalendarOpen(true)}
                    className="mb-5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-surface py-2.5 font-heading text-sm font-medium text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
                  >
                    <Icon icon="ph:calendar-bold" width={15} aria-hidden />
                    Mais datas
                  </button>
                </>
              )}

              {calendarOpen && (
                <div className="mb-5 overflow-hidden rounded-lg border border-border bg-surface">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <button
                      onClick={() => setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1))}
                      disabled={isCurrentMonth}
                      aria-label="Mês anterior"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Icon icon="ph:caret-left-bold" width={14} aria-hidden />
                    </button>
                    <span className="font-heading text-sm font-semibold capitalize text-ink">
                      {MONTH_NAMES[calMonthIdx]} {calYear}
                    </span>
                    <button
                      onClick={() => setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1))}
                      aria-label="Próximo mês"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
                    >
                      <Icon icon="ph:caret-right-bold" width={14} aria-hidden />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 border-b border-border px-2 py-2">
                    {DAY_LABELS.map((d) => (
                      <div key={d} className="text-center font-heading text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-y-1 p-2">
                    {calCells.map((day, i) => {
                      if (day === null) return <div key={`empty-${i}`} />
                      const dateStr = toDateStr(calYear, calMonthIdx, day)
                      const isPast = dateStr < todayStr
                      const hasSlots = availableDates.has(dateStr)
                      const isDisabled = isPast || !hasSlots
                      const isSelected = selectedDate === dateStr
                      const isToday = dateStr === todayStr
                      return (
                        <div key={dateStr} className="flex items-center justify-center">
                          <button
                            onClick={() => !isDisabled && handleSelectDate(dateStr)}
                            disabled={isDisabled}
                            aria-label={`${day} de ${MONTH_NAMES[calMonthIdx]}`}
                            aria-pressed={isSelected}
                            className={`relative flex h-9 w-9 items-center justify-center rounded-full font-heading text-sm font-medium transition-all ${
                              isSelected
                                ? 'bg-primary text-white'
                                : isDisabled
                                  ? 'cursor-not-allowed text-ink-muted opacity-30'
                                  : 'text-ink hover:bg-primary-50 hover:text-primary'
                            }`}
                          >
                            {day}
                            {(isToday || (hasSlots && !isPast)) && !isSelected && (
                              <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                            )}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {selectedDate && slot && (
                <>
                  <h2 className="mb-3 text-[15px] font-semibold text-ink">Horários disponíveis</h2>
                  <div className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {slot.times.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`flex min-h-[44px] items-center justify-center rounded-lg border-[1.5px] font-heading text-sm font-semibold transition-all ${
                          selectedTime === t
                            ? 'border-primary bg-primary text-white'
                            : 'border-border bg-surface text-ink-secondary hover:border-border-strong hover:bg-surface-hover'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {selectedDate && selectedTime && (
                <div className="mb-6 rounded-lg border border-primary/30 bg-primary-50 p-4">
                  <p className="text-sm font-semibold text-ink">Resumo do reagendamento</p>
                  <p className="mt-1 text-sm text-ink-secondary">
                    {slot?.weekday}, {selectedDate.split('-').slice(1).reverse().join('/')} às {selectedTime}
                  </p>
                  <p className="text-sm text-ink-secondary">Com {mockSession.professional}</p>
                </div>
              )}
            </>
          )}

          {/* ── Recurring: weekday picker + times ── */}
          {scope === 'all' && (
            <>
              <p className="mb-4 text-[13px] leading-relaxed text-ink-secondary">
                Escolha o novo dia fixo e horário. Todas as sessões futuras serão movidas para este compromisso.
              </p>

              <h2 className="mb-3 text-[15px] font-semibold text-ink">Novo dia da semana</h2>
              <div className="mb-5 flex gap-2">
                {WEEKDAYS.map((wd) => {
                  const available = Boolean(recurringSlots[wd])
                  return (
                    <button
                      key={wd}
                      onClick={() => { setSelectedWeekday(wd); setSelectedTime(null) }}
                      disabled={!available}
                      className={`flex-1 rounded-lg border-[1.5px] py-2.5 font-heading text-xs font-semibold transition-all ${
                        selectedWeekday === wd
                          ? 'border-primary bg-primary-50 text-ink'
                          : available
                            ? 'border-border bg-surface text-ink-secondary hover:border-border-strong hover:bg-surface-hover'
                            : 'cursor-not-allowed border-border bg-surface-2 text-ink-muted opacity-40'
                      }`}
                    >
                      {wd.slice(0, 3)}
                    </button>
                  )
                })}
              </div>

              {selectedWeekday && recurringTimes.length > 0 && (
                <>
                  <h2 className="mb-3 text-[15px] font-semibold text-ink">Horários disponíveis</h2>
                  <div className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {recurringTimes.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`flex min-h-[44px] items-center justify-center rounded-lg border-[1.5px] font-heading text-sm font-semibold transition-all ${
                          selectedTime === t
                            ? 'border-primary bg-primary text-white'
                            : 'border-border bg-surface text-ink-secondary hover:border-border-strong hover:bg-surface-hover'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {selectedWeekday && selectedTime && (
                <div className="mb-6 rounded-lg border border-primary/30 bg-primary-50 p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <Icon icon="ph:repeat-bold" width={14} className="shrink-0 text-primary" aria-hidden />
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Compromisso recorrente</p>
                  </div>
                  <p className="text-sm font-semibold text-ink">Novo horário de todas as próximas sessões</p>
                  <p className="mt-1 text-sm text-ink-secondary">
                    Toda {WEEKDAY_FULL[selectedWeekday]} às {selectedTime} · a partir de {nextOccurrence(selectedWeekday)}
                  </p>
                  <p className="text-sm text-ink-secondary">Com {mockSession.professional}</p>
                </div>
              )}
            </>
          )}

          <Button
            size="lg"
            fullWidth
            disabled={!canSave || saving}
            onClick={handleSave}
          >
            {saving
              ? 'Salvando…'
              : scope === 'all'
                ? 'Confirmar alteração recorrente'
                : 'Confirmar novo horário'}
          </Button>

          {(onRematch || onCancelRequest) && (
            <div className="mt-4 flex flex-col gap-1 border-t border-border pt-4">
              {onRematch && (
                <button
                  type="button"
                  onClick={onRematch}
                  className="flex w-full items-center justify-center gap-1.5 py-2 text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
                >
                  <Icon icon="ph:shuffle-angular-bold" width={15} aria-hidden />
                  Conectar com outros profissionais
                </button>
              )}
              {onCancelRequest && (
                <button
                  type="button"
                  onClick={() => onCancelRequest(scope)}
                  className="flex w-full items-center justify-center gap-1.5 py-2 text-sm font-medium text-danger/80 transition-colors hover:text-danger"
                >
                  <Icon icon="ph:x-circle-bold" width={15} aria-hidden />
                  {scope === 'all'
                    ? 'Cancelar todas as próximas sessões'
                    : 'Cancelar esta sessão'}
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  )
}
