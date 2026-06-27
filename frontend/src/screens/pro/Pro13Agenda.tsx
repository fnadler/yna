import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { ProTopBar } from '../../components/ProTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { Sheet } from '../../components/Sheet'
import { EntrarSessaoButton } from '../../components/EntrarSessaoButton'
import { SessionStatusBadge } from '../../components/SessionStatusBadge'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { proSessionService } from '../../services/pro'
import { ProntuarioForm } from './Pro16Prontuario'
import { BeneficiarioModal } from './Pro14Beneficiario'
import { EditarSessao } from './EditarSessao'
import { Pro11AgendaContent } from './Pro11Agenda'
import { AgendaCalendario } from './AgendaCalendario'
import { effectiveStatus, sessionInTimezone, nowInTimezone, availableHoursForDay } from './sessionDisplay'
import { timezoneLabel } from '../../lib/timezones'
import { usePro } from '../../contexts/ProContext'
import type { ProSession } from '../../types'

/* ── Helpers de data (ISO YYYY-MM-DD) ── */
const WEEKDAYS_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const WEEKDAYS_ABBR = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

const parseISO = (d: string) => new Date(`${d}T00:00:00`)
const toISO = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
const addDays = (d: string, n: number) => { const dt = parseISO(d); dt.setDate(dt.getDate() + n); return toISO(dt) }
const mondayOf = (d: string) => { const dt = parseISO(d); const dow = (dt.getDay() + 6) % 7; dt.setDate(dt.getDate() - dow); return toISO(dt) }
const formatFullDate = (d: string) => { const dt = parseISO(d); return `${WEEKDAYS_FULL[dt.getDay()]}, ${dt.getDate()} de ${MONTHS[dt.getMonth()]} de ${dt.getFullYear()}` }
const formatWeekRange = (ws: string) => {
  const s = parseISO(ws), e = parseISO(addDays(ws, 6))
  return s.getMonth() === e.getMonth()
    ? `${s.getDate()} a ${e.getDate()} de ${MONTHS[s.getMonth()]} de ${s.getFullYear()}`
    : `${s.getDate()} de ${MONTHS[s.getMonth()]} a ${e.getDate()} de ${MONTHS[e.getMonth()]} de ${e.getFullYear()}`
}

function groupByDate(list: ProSession[]): [string, ProSession[]][] {
  const map = new Map<string, ProSession[]>()
  for (const s of list) {
    const arr = map.get(s.date) ?? []
    arr.push(s)
    map.set(s.date, arr)
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, items]) => [date, items.sort((x, y) => x.time.localeCompare(y.time))] as [string, ProSession[]])
}

// Grade de horas do calendário: 08–20 por padrão, estendida para cobrir sessões
// ou disponibilidade que caiam fora dessa faixa (ex.: fusos bem distantes).
function buildDayHours(daySessions: ProSession[], availableHours: Set<string>): string[] {
  const set = new Set<string>()
  for (let i = 8; i <= 20; i++) set.add(`${String(i).padStart(2, '0')}:00`)
  for (const s of daySessions) set.add(`${s.time.slice(0, 2)}:00`)
  for (const h of availableHours) set.add(h)
  return [...set].sort()
}

/* ── Card de sessão (horário em destaque à esquerda + status + ações) ── */
function SessionCard({ s, now, onEditar, onHistorico, onEntrar, onProntuario }: {
  s: ProSession
  now: string
  onEditar: () => void
  onHistorico: () => void
  onEntrar: () => void
  onProntuario: () => void
}) {
  const eff = effectiveStatus(s, now)
  const actionable = eff === 'scheduled' || eff === 'confirmed'
  const cancelled = eff === 'cancelled'
  const completed = eff === 'completed'
  return (
    <div className={`flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center ${cancelled ? 'opacity-70' : completed ? 'opacity-55' : ''}`}>
      {/* Horário em destaque + beneficiário + status */}
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="w-14 shrink-0 text-center">
          <p className={`text-[22px] font-bold leading-none tracking-[-0.02em] text-ink ${cancelled ? 'line-through decoration-1' : ''}`}>{s.time}</p>
          {s.durationMin && <p className="mt-1 font-mono text-[11px] text-ink-muted">{s.durationMin} min</p>}
        </div>
        <div className="h-10 w-px shrink-0 bg-border" />
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar initials={s.beneficiarioInitials} size={40} palette={s.beneficiarioPalette} />
          <div className="min-w-0">
            <p className="truncate font-heading text-sm font-semibold text-ink">{s.beneficiarioApelido}</p>
            <SessionStatusBadge status={eff} className="mt-0.5" />
          </div>
        </div>
      </div>

      {/* Ações — mobile: tenta uma linha; senão Entrar full-width + 2 secundários divididos */}
      <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:shrink-0 sm:justify-end">
        {actionable ? (
          <>
            <Button size="sm" variant="secondary" iconLeft="ph:pencil-simple-bold" className="flex-1 sm:flex-none" onClick={onEditar}>Editar</Button>
            <Button size="sm" variant="secondary" iconLeft="ph:clock-counter-clockwise-bold" className="flex-1 sm:flex-none" onClick={onHistorico}>Histórico</Button>
            <EntrarSessaoButton size="sm" className="w-full sm:w-auto" onClick={onEntrar} live={s.salaAbertaSeg !== undefined} openedSeconds={s.salaAbertaSeg ?? 0} />
          </>
        ) : eff === 'completed' ? (
          <>
            {s.prontuarioPendente && (
              <Button size="sm" variant="secondary" iconLeft="ph:note-pencil-bold" className="flex-1 sm:flex-none" onClick={onProntuario}>Prontuário</Button>
            )}
            <Button size="sm" variant="secondary" iconLeft="ph:clock-counter-clockwise-bold" className="flex-1 sm:flex-none" onClick={onHistorico}>Histórico</Button>
          </>
        ) : (
          <Button size="sm" variant="secondary" iconLeft="ph:clock-counter-clockwise-bold" className="flex-1 sm:flex-none" onClick={onHistorico}>Histórico</Button>
        )}
      </div>
    </div>
  )
}

/* ── Calendário (mês) para selecionar qualquer data ── */
function MonthCalendar({ value, today, sessionDates, onSelect }: {
  value: string
  today: string
  sessionDates: Set<string>
  onSelect: (d: string) => void
}) {
  const sel = parseISO(value)
  const [cursor, setCursor] = useState(() => new Date(sel.getFullYear(), sel.getMonth(), 1))
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7 // segunda-feira primeiro
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (string | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(toISO(new Date(year, month, d)))
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="px-5 py-6 lg:px-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          aria-label="Mês anterior"
          className="flex h-9 w-9 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover"
        >
          <Icon icon="ph:caret-left-bold" width={15} aria-hidden />
        </button>
        <p className="font-heading text-sm font-semibold capitalize text-ink">{MONTHS[month]} de {year}</p>
        <button
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          aria-label="Próximo mês"
          className="flex h-9 w-9 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover"
        >
          <Icon icon="ph:caret-right-bold" width={15} aria-hidden />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1">
        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((w) => (
          <span key={w} className="text-center font-mono text-[10px] uppercase tracking-wide text-ink-muted">{w}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />
          const isSel = d === value
          const isToday = d === today
          const has = sessionDates.has(d)
          return (
            <button
              key={d}
              onClick={() => onSelect(d)}
              className={`relative flex h-10 items-center justify-center rounded-lg text-sm transition-colors ${
                isSel
                  ? 'bg-primary font-semibold text-white'
                  : `text-ink hover:bg-surface-hover ${isToday ? 'ring-1 ring-inset ring-primary/40' : ''}`
              }`}
            >
              {parseISO(d).getDate()}
              {has && <span className={`absolute bottom-1 h-1 w-1 rounded-full ${isSel ? 'bg-white' : 'bg-primary'}`} aria-hidden />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function Pro13Agenda() {
  const navigate = useNavigate()
  const location = useLocation()
  const { disponibilidade, profile } = usePro()
  const userTz = profile.fusoHorario
  const sessions = useService(() => proSessionService.list(), [])

  // "Hoje" e o dia âncora são expressos no fuso do profissional.
  const nowUser = nowInTimezone(userTz)
  const userToday = nowUser.slice(0, 10)

  const [modo, setModo] = useState<'lista' | 'calendario'>('lista')
  const [anchor, setAnchor] = useState<string>(userToday)
  // Aberto automaticamente quando o usuário vem do perfil ("Gerenciar na agenda").
  const [dispOpen, setDispOpen] = useState(() => Boolean((location.state as { openDisponibilidade?: boolean } | null)?.openDisponibilidade))
  const [calOpen, setCalOpen] = useState(false)
  const [prontuarioId, setProntuarioId] = useState<string | null>(null)
  const [historicoId, setHistoricoId] = useState<string | null>(null)
  const [editar, setEditar] = useState<ProSession | null>(null)

  const all = sessions.status === 'success' ? sessions.data : []
  // Fonte única: todas as sessões convertidas para o fuso do profissional.
  // Lista e calendário consomem isso, mantendo data/hora/dia coerentes no fuso.
  const sessionsUser = all.map((s) => sessionInTimezone(s, userTz))
  const sessionDates = new Set(sessionsUser.map((s) => s.date))
  const weekStart = mondayOf(anchor)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Sessões do dia selecionado (no fuso do usuário).
  const daySessions = sessionsUser.filter((s) => s.date === anchor)
  const groups = groupByDate(daySessions.filter((s) => s.status !== 'cancelled'))

  // Calendário (modo dia): horas disponíveis, bloqueio e grade dinâmica de horas.
  const availableHours = availableHoursForDay(disponibilidade, anchor, userTz)
  const blocked = disponibilidade.bloqueios.find((b) => anchor >= b.inicio && anchor <= (b.fim ?? b.inicio))
  const dayHours = buildDayHours(daySessions, availableHours)

  // O controle de período é sempre semanal (a strip seleciona o dia do calendário).
  const step = 7
  const periodo = formatWeekRange(weekStart)

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <ProTopBar />
        <PageHeader
          title="Agenda"
          subtitle="Suas sessões e a disponibilidade que você oferece."
          className="mt-2 lg:mt-0"
          action={
            <Button variant="secondary" iconLeft="ph:sliders-horizontal-bold" aria-label="Disponibilidade" onClick={() => setDispOpen(true)}>
              <span className="hidden sm:inline">Disponibilidade</span>
            </Button>
          }
        />

        {/* Modo de visualização (Lista × Calendário) + Hoje */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex gap-1 rounded-lg bg-surface-2 p-1">
            {([['lista', 'Lista', 'ph:list-bullets-bold'], ['calendario', 'Calendário', 'ph:calendar-blank-bold']] as const).map(([key, label, icon]) => (
              <button
                key={key}
                onClick={() => setModo(key)}
                aria-label={label}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 font-heading text-sm font-semibold transition-all ${
                  modo === key ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
                }`}
              >
                <Icon icon={icon} width={15} aria-hidden />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setAnchor(userToday)}
            className="rounded-pill border border-border bg-surface px-4 py-2 font-heading text-sm font-medium text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
          >
            Hoje
          </button>
        </div>

        {/* Navegação no tempo */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <button
            onClick={() => setAnchor(addDays(anchor, -step))}
            aria-label="Semana anterior"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover"
          >
            <Icon icon="ph:caret-left-bold" width={16} aria-hidden />
          </button>
          <button
            onClick={() => setCalOpen(true)}
            aria-label="Escolher data no calendário"
            className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-pill border border-border bg-surface px-3 py-2 transition-colors hover:bg-surface-hover"
          >
            <Icon icon="ph:calendar-blank-bold" width={15} className="shrink-0 text-ink-secondary" aria-hidden />
            <span className="truncate font-heading text-sm font-semibold text-ink">{periodo}</span>
            <Icon icon="ph:caret-down-bold" width={12} className="shrink-0 text-ink-secondary" aria-hidden />
          </button>
          <button
            onClick={() => setAnchor(addDays(anchor, step))}
            aria-label="Próxima semana"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover"
          >
            <Icon icon="ph:caret-right-bold" width={16} aria-hidden />
          </button>
        </div>

        {/* Mini-calendário (strip da semana) */}
        <div className="mb-6 grid grid-cols-7 gap-1">
          {weekDays.map((d) => {
            const dt = parseISO(d)
            const isAnchor = d === anchor
            const isToday = d === userToday
            const count = sessionsUser.filter((s) => s.date === d).length
            return (
              <button
                key={d}
                onClick={() => setAnchor(d)}
                aria-pressed={isAnchor}
                className={`flex flex-col items-center gap-1 rounded-lg border py-2 transition-colors ${
                  isAnchor
                    ? 'border-primary bg-primary-50'
                    : `border-border bg-surface hover:bg-surface-hover ${isToday ? 'ring-1 ring-inset ring-primary/30' : ''}`
                }`}
              >
                <span className="font-mono text-[10px] uppercase tracking-wide text-ink-muted">{WEEKDAYS_ABBR[dt.getDay()]}</span>
                <span className={`font-heading text-sm font-semibold ${isAnchor ? 'text-primary dark:text-primary-300' : 'text-ink'}`}>{dt.getDate()}</span>
                <span className={`h-1.5 w-1.5 rounded-full ${count > 0 ? (isAnchor ? 'bg-primary' : 'bg-primary/40') : 'bg-transparent'}`} aria-hidden />
              </button>
            )
          })}
        </div>

        <p className="mb-3 flex items-center gap-1.5 text-[12.5px] text-ink-muted">
          <Icon icon="ph:globe-bold" width={13} className="shrink-0" aria-hidden />
          Horários no seu fuso · {timezoneLabel(userTz)}
        </p>

        {/* Lista agrupada por data */}
        {sessions.status === 'loading' && (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
          </div>
        )}
        {sessions.status === 'error' && <ErrorState message={sessions.message} onRetry={sessions.reload} />}
        {sessions.status === 'success' && (
          modo === 'calendario' ? (
            <div>
              <h2 className="mb-3 font-heading text-[13px] font-semibold uppercase tracking-[0.06em] text-ink-secondary">
                {formatFullDate(anchor)}
              </h2>
              <AgendaCalendario
                date={anchor}
                hours={dayHours}
                sessions={daySessions}
                availableHours={availableHours}
                blocked={blocked ? { motivo: blocked.motivo } : null}
                now={nowUser}
                onEditar={(s) => setEditar(all.find((x) => x.id === s.id) ?? s)}
                onHistorico={(s) => setHistoricoId(s.beneficiarioId)}
                onEntrar={(s) => navigate(`/pro/sessao/${s.id}`)}
              />
            </div>
          ) : groups.length > 0 ? (
            <div className="flex flex-col gap-6">
              {groups.map(([date, items]) => (
                <section key={date}>
                  <h2 className="mb-3 font-heading text-[13px] font-semibold uppercase tracking-[0.06em] text-ink-secondary">
                    {formatFullDate(date)}
                  </h2>
                  <div className="flex flex-col gap-2">
                    {items.map((s) => (
                      <SessionCard
                        key={s.id}
                        s={s}
                        now={nowUser}
                        onEditar={() => setEditar(all.find((x) => x.id === s.id) ?? s)}
                        onHistorico={() => setHistoricoId(s.beneficiarioId)}
                        onEntrar={() => navigate(`/pro/sessao/${s.id}`)}
                        onProntuario={() => setProntuarioId(s.id)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-sm text-ink-secondary">
              Nenhuma sessão neste dia.
            </div>
          )
        )}
      </div>

      {/* Modal: prontuário pendente */}
      <Sheet
        open={prontuarioId !== null}
        onClose={() => setProntuarioId(null)}
        title="Registro de prontuário"
        icon="ph:note-pencil-bold"
        size="md"
      >
        {prontuarioId && (
          <ProntuarioForm
            sessionId={prontuarioId}
            onDone={() => { setProntuarioId(null); sessions.reload() }}
            onCancel={() => setProntuarioId(null)}
          />
        )}
      </Sheet>

      {/* Modal: detalhe do beneficiário (abas) */}
      <BeneficiarioModal id={historicoId} onClose={() => setHistoricoId(null)} />

      {/* Modal: editar/remarcar sessão */}
      <Sheet
        open={editar !== null}
        onClose={() => setEditar(null)}
        title="Editar sessão"
        icon="ph:pencil-simple-bold"
        size="md"
      >
        {editar && <EditarSessao session={editar} onClose={() => setEditar(null)} onChanged={sessions.reload} />}
      </Sheet>

      {/* Modal: disponibilidade (atendimento, plantão, bloqueios) */}
      <Sheet
        open={dispOpen}
        onClose={() => setDispOpen(false)}
        title="Disponibilidade"
        icon="ph:sliders-horizontal-bold"
        size="lg"
      >
        {dispOpen && <Pro11AgendaContent onClose={() => setDispOpen(false)} />}
      </Sheet>

      {/* Modal: calendário para escolher qualquer data */}
      <Sheet
        open={calOpen}
        onClose={() => setCalOpen(false)}
        title="Selecionar data"
        icon="ph:calendar-blank-bold"
        size="md"
      >
        <MonthCalendar
          value={anchor}
          today={userToday}
          sessionDates={sessionDates}
          onSelect={(d) => { setAnchor(d); setCalOpen(false) }}
        />
      </Sheet>
    </div>
  )
}
