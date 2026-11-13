/* Opções de fuso horário oferecidas ao usuário. `value` é o ID IANA (estável);
   `label` mostra o offset no padrão UTC com a referência de local;
   `offsetMinutes` é o deslocamento fixo em relação a UTC (usado na conversão
   dos horários das sessões). Foco no Brasil + fusos internacionais comuns.
   Observação: offsets fixos (sem horário de verão), suficiente para o protótipo. */

export interface TimezoneOption {
  value: string
  label: string
  offsetMinutes: number
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  // Brasil
  { value: 'America/Noronha', label: '(UTC−02:00) Fernando de Noronha', offsetMinutes: -120 },
  { value: 'America/Sao_Paulo', label: '(UTC−03:00) Brasília, São Paulo, Rio de Janeiro', offsetMinutes: -180 },
  { value: 'America/Manaus', label: '(UTC−04:00) Manaus, Cuiabá, Porto Velho', offsetMinutes: -240 },
  { value: 'America/Rio_Branco', label: '(UTC−05:00) Rio Branco, Acre', offsetMinutes: -300 },
  // Internacionais
  { value: 'America/New_York', label: '(UTC−05:00) Nova York, Toronto', offsetMinutes: -300 },
  { value: 'America/Los_Angeles', label: '(UTC−08:00) Los Angeles, Vancouver', offsetMinutes: -480 },
  { value: 'Europe/Lisbon', label: '(UTC+00:00) Lisboa, Londres', offsetMinutes: 0 },
  { value: 'Europe/Paris', label: '(UTC+01:00) Paris, Madri, Berlim', offsetMinutes: 60 },
  { value: 'Africa/Johannesburg', label: '(UTC+02:00) Joanesburgo', offsetMinutes: 120 },
  { value: 'Asia/Dubai', label: '(UTC+04:00) Dubai', offsetMinutes: 240 },
  { value: 'Asia/Tokyo', label: '(UTC+09:00) Tóquio', offsetMinutes: 540 },
  { value: 'Australia/Sydney', label: '(UTC+10:00) Sydney', offsetMinutes: 600 },
]

/** Fuso padrão em que os horários das sessões são armazenados (clínica/base). */
export const SESSION_BASE_TZ = 'America/Sao_Paulo'

export function timezoneOffset(value: string): number {
  return TIMEZONE_OPTIONS.find((tz) => tz.value === value)?.offsetMinutes ?? 0
}

export function timezoneLabel(value: string): string {
  return TIMEZONE_OPTIONS.find((tz) => tz.value === value)?.label ?? value
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Converte data (YYYY-MM-DD) + hora (HH:mm) de um fuso para outro, tratando a
   virada de dia. Retorna a data ISO, a hora e o índice do dia da semana (0=Dom). */
export function convertDateTime(
  dateISO: string,
  time: string,
  fromOffsetMin: number,
  toOffsetMin: number,
): { dateISO: string; time: string; weekday: number } {
  const [y, mo, d] = dateISO.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const shifted = new Date(Date.UTC(y, mo - 1, d, hh, mm) + (toOffsetMin - fromOffsetMin) * 60_000)
  return {
    dateISO: `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`,
    time: `${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}`,
    weekday: shifted.getUTCDay(),
  }
}
