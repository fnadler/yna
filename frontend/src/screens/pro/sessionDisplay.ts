import { PRO_NOW } from '../../data/proMock'
import type { ProSession, ProDisponibilidade } from '../../types'
import { SESSION_BASE_TZ, timezoneOffset, convertDateTime } from '../../lib/timezones'

/* Status efetivo de exibição da sessão, coerente entre lista e calendário.
   - Cancelada continua cancelada.
   - Sessão já iniciada pelo beneficiário (`salaAbertaSeg`) é "ao vivo": mantém o
     comportamento atual e não vira realizada.
   - Sessão cujo horário já passou vira "realizada" (completed).
   `now` permite passar um "agora" no mesmo fuso da sessão exibida (default: base). */
export const isLive = (s: ProSession) => s.salaAbertaSeg != null
export const isPastSession = (s: ProSession, now: string = PRO_NOW) => `${s.date}T${s.time}:00` < now

export function effectiveStatus(s: ProSession, now: string = PRO_NOW): ProSession['status'] {
  if (s.status === 'cancelled') return 'cancelled'
  if (isLive(s)) return s.status
  if (s.status === 'completed') return 'completed'
  if (isPastSession(s, now)) return 'completed'
  return s.status
}

const WEEKDAYS_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

/** Converte uma sessão (armazenada em SESSION_BASE_TZ) para o fuso do usuário,
   ajustando data, hora e dia da semana. No fuso base, retorna a sessão intacta. */
export function sessionInTimezone(s: ProSession, userTz: string): ProSession {
  const from = timezoneOffset(SESSION_BASE_TZ)
  const to = timezoneOffset(userTz)
  if (from === to) return s
  const c = convertDateTime(s.date, s.time, from, to)
  return { ...s, date: c.dateISO, time: c.time, weekday: WEEKDAYS_FULL[c.weekday] }
}

/** Converte o "agora" base (PRO_NOW) para o fuso do usuário, para manter o
   cálculo de status coerente com os horários de sessão já convertidos. */
export function nowInTimezone(userTz: string, now: string = PRO_NOW): string {
  const from = timezoneOffset(SESSION_BASE_TZ)
  const to = timezoneOffset(userTz)
  if (from === to) return now
  const [date, time] = now.split('T')
  const c = convertDateTime(date, time.slice(0, 5), from, to)
  return `${c.dateISO}T${c.time}:00`
}

/* ── Utilidades de data em UTC (independentes do fuso do runtime) ── */
const pad = (n: number) => String(n).padStart(2, '0')
/** Dia da semana (0=Dom) de uma data ISO, calculado em UTC. */
export function isoWeekday(dateISO: string): number {
  const [y, m, d] = dateISO.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}
/** Soma `n` dias a uma data ISO (UTC). */
export function addDaysISO(dateISO: string, n: number): string {
  const [y, m, d] = dateISO.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d) + n * 86_400_000)
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`
}

const WEEKDAY_KEY = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

/** Horas (HH:00) em que o profissional está disponível num dia do fuso do usuário.
   A disponibilidade é semanal recorrente em fuso base; convertemos as ocorrências
   dos dias base vizinhos (±1) para capturar slots que cruzam a meia-noite. */
export function availableHoursForDay(
  disp: ProDisponibilidade,
  dayISO: string,
  userTz: string,
): Set<string> {
  const from = timezoneOffset(SESSION_BASE_TZ)
  const to = timezoneOffset(userTz)
  const hours = new Set<string>()
  for (const delta of [-1, 0, 1]) {
    const baseDate = addDaysISO(dayISO, delta)
    const slot = disp.atendimento[WEEKDAY_KEY[isoWeekday(baseDate)]]
    if (!slot?.active) continue
    for (const t of slot.times) {
      const c = convertDateTime(baseDate, t, from, to)
      if (c.dateISO === dayISO) hours.add(`${c.time.slice(0, 2)}:00`)
    }
  }
  return hours
}

/* ── Formatação de campos estruturados (próxima/recorrente) no fuso do usuário ── */
const WD_ABBR = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const WD_PLURAL = ['Domingos', 'Segundas-feiras', 'Terças-feiras', 'Quartas-feiras', 'Quintas-feiras', 'Sextas-feiras', 'Sábados']
// Domingo de referência (2026-06-21 é domingo em UTC) para resolver recorrências.
const REF_SUNDAY = '2026-06-21'

/** "seg, 22/06 às 09:00" — próxima sessão (data+hora base) no fuso do usuário. */
export function formatProximaSessao(p: { date: string; time: string }, userTz: string): string {
  const c = convertDateTime(p.date, p.time, timezoneOffset(SESSION_BASE_TZ), timezoneOffset(userTz))
  const [, m, d] = c.dateISO.split('-')
  return `${WD_ABBR[c.weekday]}, ${d}/${m} às ${c.time}`
}

/** "Segundas-feiras às 09:00" — recorrência (dia da semana+hora base) no fuso do usuário. */
export function formatSessaoRecorrente(r: { weekday: number; time: string }, userTz: string): string {
  const ref = addDaysISO(REF_SUNDAY, r.weekday)
  const c = convertDateTime(ref, r.time, timezoneOffset(SESSION_BASE_TZ), timezoneOffset(userTz))
  return `${WD_PLURAL[c.weekday]} às ${c.time}`
}
