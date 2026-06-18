import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'
import { professionals, availableSlots } from '../data/mock'
import { sessionService } from '../services'

interface Ben14Props {
  proId?: string
  onConfirm?: () => void
  onBack?: () => void
  onRematch?: () => void
}

type BookingMode = 'single' | 'recurring'

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

// Aggregate unique times per weekday across all slots
const recurringSlots = availableSlots.reduce<Record<string, string[]>>((acc, s) => {
  const prev = acc[s.weekday] ?? []
  acc[s.weekday] = Array.from(new Set([...prev, ...s.times])).sort()
  return acc
}, {})

// Set of dates that have availability, for O(1) calendar lookup
const availableDates = new Set(availableSlots.map((s) => s.date))

const DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

const MONTH_NAMES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function firstDayOffset(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return (day + 6) % 7 // Monday = 0
}

function nextOccurrence(weekday: string): string {
  const target = WEEKDAY_NUM[weekday] ?? 1
  const today = new Date()
  let daysAhead = target - today.getDay()
  if (daysAhead <= 0) daysAhead += 7
  const next = new Date(today)
  next.setDate(today.getDate() + daysAhead)
  return next.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function Ben14Agendamento({ proId, onConfirm, onBack, onRematch }: Ben14Props = {}) {
  const { id: paramId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const pro = professionals.find((p) => p.id === (proId ?? paramId)) ?? professionals[0]!

  const todayStr = new Date().toISOString().split('T')[0]!

  const [mode, setMode] = useState<BookingMode>('single')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedWeekday, setSelectedWeekday] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [booking, setBooking] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date())

  const slot = availableSlots.find((s) => s.date === selectedDate)
  const recurringTimes = selectedWeekday ? (recurringSlots[selectedWeekday] ?? []) : []

  // Upcoming slots for the compact quick-pick row
  const upcomingSlots = availableSlots.filter((s) => s.date >= todayStr).slice(0, 5)

  const handleModeChange = (m: BookingMode) => {
    setMode(m)
    setSelectedDate(null)
    setSelectedWeekday(null)
    setSelectedTime(null)
    setCalendarOpen(false)
  }

  const handleSelectDate = (date: string) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const canBook =
    mode === 'single'
      ? Boolean(selectedDate && selectedTime)
      : Boolean(selectedWeekday && selectedTime)

  const handleBook = async () => {
    if (!canBook) return
    setBooking(true)
    await sessionService.book(pro.id, (selectedDate ?? selectedWeekday)!, selectedTime!)
    setBooking(false)
    if (onConfirm) onConfirm()
    else navigate('/confirmacao')
  }

  // Calendar helpers
  const calYear = calendarMonth.getFullYear()
  const calMonthIdx = calendarMonth.getMonth()
  const daysInMonth = new Date(calYear, calMonthIdx + 1, 0).getDate()
  const offset = firstDayOffset(calYear, calMonthIdx)
  const calCells = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const today = new Date()
  const isCurrentMonth =
    calYear === today.getFullYear() && calMonthIdx === today.getMonth()

  const prevCalMonth = () =>
    setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1))
  const nextCalMonth = () =>
    setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1))

  return (
    <>
      {!proId && (
        <header className="hidden lg:flex items-center gap-3 px-5 lg:px-8 pb-3 pt-8 lg:pt-10">
          <button
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover"
          >
            <Icon icon="ph:arrow-left-bold" width={18} aria-hidden />
          </button>
          <h1 className="text-base font-semibold text-ink">Agendar sessão</h1>
        </header>
      )}

      <main className="mx-auto max-w-xl flex-1 px-5 lg:px-8 pb-8 lg:pb-12 pt-5 lg:pt-6">
        {/* Professional */}
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-border bg-surface p-4">
          <Avatar initials={pro.initials} size={48} palette={pro.palette} />
          <div>
            <p className="font-semibold text-ink">{pro.name}</p>
            <p className="text-sm text-ink-muted">{pro.approach} · {pro.sessionDuration} min</p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="mb-5 flex gap-1 rounded-lg bg-surface-2 p-1">
          {(['single', 'recurring'] as const).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 px-4 font-heading text-sm font-semibold transition-all duration-200 ${
                mode === m ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
              }`}
            >
              <Icon
                icon={m === 'single' ? 'ph:calendar-check-bold' : 'ph:repeat-bold'}
                width={15}
                aria-hidden
              />
              {m === 'single' ? 'Sessão única' : 'Recorrente'}
            </button>
          ))}
        </div>

        {/* ── Single mode ── */}
        {mode === 'single' && (
          <>
            {/* Header row */}
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-ink">Escolha uma data</h2>
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

            {/* Compact date cards */}
            {!calendarOpen && (
              <>
                <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {upcomingSlots.map((s) => {
                    const [month, day] = s.date.split('-').slice(1)
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

            {/* Inline calendar */}
            {calendarOpen && (
              <div className="mb-5 overflow-hidden rounded-lg border border-border bg-surface">
                {/* Month navigation */}
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <button
                    onClick={prevCalMonth}
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
                    onClick={nextCalMonth}
                    aria-label="Próximo mês"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
                  >
                    <Icon icon="ph:caret-right-bold" width={14} aria-hidden />
                  </button>
                </div>

                {/* Day-of-week headers */}
                <div className="grid grid-cols-7 border-b border-border px-2 py-2">
                  {DAY_LABELS.map((d) => (
                    <div
                      key={d}
                      className="text-center font-heading text-[11px] font-semibold uppercase tracking-wide text-ink-muted"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Day cells */}
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
                          {/* Today indicator dot */}
                          {isToday && !isSelected && (
                            <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                          )}
                          {/* Available slot indicator */}
                          {hasSlots && !isPast && !isSelected && (
                            <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Time slots */}
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

            {/* Summary */}
            {selectedDate && selectedTime && (
              <div className="mb-6 rounded-lg border border-primary/30 bg-primary-50 p-4">
                <p className="text-sm font-semibold text-ink">Resumo do agendamento</p>
                <p className="mt-1 text-sm text-ink-secondary">
                  {slot?.weekday}, {selectedDate.split('-').slice(1).reverse().join('/')} às {selectedTime}
                </p>
                <p className="text-sm text-ink-secondary">Com {pro.name} · {pro.sessionDuration} min online</p>
              </div>
            )}
          </>
        )}

        {/* ── Recurring mode ── */}
        {mode === 'recurring' && (
          <>
            <p className="mb-4 text-[13px] leading-relaxed text-ink-secondary">
              Escolha um dia fixo na semana. A sessão se repete toda semana nesse horário e pode ser cancelada a qualquer momento.
            </p>

            <h2 className="mb-3 text-[15px] font-semibold text-ink">Dia da semana</h2>
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
                  <p className="text-sm font-semibold text-ink">Compromisso recorrente</p>
                </div>
                <p className="text-sm text-ink-secondary">
                  Toda {WEEKDAY_FULL[selectedWeekday]} às {selectedTime} · a partir de {nextOccurrence(selectedWeekday)}
                </p>
                <p className="text-sm text-ink-secondary">Com {pro.name} · {pro.sessionDuration} min online</p>
              </div>
            )}
          </>
        )}

        <Button
          size="lg"
          fullWidth
          disabled={!canBook || booking}
          onClick={handleBook}
        >
          {booking
            ? 'Agendando…'
            : mode === 'recurring'
              ? 'Confirmar compromisso recorrente'
              : 'Confirmar agendamento'}
        </Button>

        {onRematch && (
          <button
            type="button"
            onClick={onRematch}
            className="mt-3 flex w-full items-center justify-center gap-1.5 py-2 text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
          >
            <Icon icon="ph:shuffle-angular-bold" width={14} aria-hidden />
            Conectar com outros profissionais
          </button>
        )}

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mt-1 flex w-full items-center justify-center gap-1.5 py-2 text-sm font-medium text-ink-secondary hover:text-ink"
          >
            <Icon icon="ph:arrow-left-bold" width={13} aria-hidden />
            Voltar
          </button>
        )}
      </main>
    </>
  )
}
