import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import { EntrarSessaoButton } from '../../components/EntrarSessaoButton'
import { SessionStatusBadge } from '../../components/SessionStatusBadge'
import { effectiveStatus, isLive, isPastSession } from './sessionDisplay'
import type { ProSession } from '../../types'

/* Indicador "ao vivo" (beneficiário já na sala). */
function AoVivo() {
  return (
    <span className="inline-flex items-center gap-1 rounded-pill bg-success-bg px-2 py-0.5 text-[11px] font-semibold text-success-ink">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
      </span>
      Ao vivo
    </span>
  )
}

/* Slot de sessão no calendário. Sessão ao vivo tem botão Entrar.
   Desktop: botões de histórico/editar com texto (como na lista).
   Mobile: menu "…". Sessões realizadas não têm "Editar". */
function SessionSlot({ s, now, open, onToggleMenu, onClose, onEditar, onHistorico, onEntrar }: {
  s: ProSession
  now: string
  open: boolean
  onToggleMenu: () => void
  onClose: () => void
  onEditar: () => void
  onHistorico: () => void
  onEntrar: () => void
}) {
  const eff = effectiveStatus(s, now)
  const completed = eff === 'completed'
  const live = isLive(s)

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <Avatar initials={s.beneficiarioInitials} size={32} palette={s.beneficiarioPalette} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{s.beneficiarioApelido}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[11px] text-ink-secondary">{s.time}</span>
            {live ? <AoVivo /> : <SessionStatusBadge status={eff} />}
            {completed && s.durationMin && <span className="font-mono text-[11px] text-ink-muted">· {s.durationMin} min</span>}
          </div>
        </div>

        {/* Mobile: Entrar (se ao vivo) + menu "…" */}
        <div className="flex shrink-0 items-center gap-1.5 sm:hidden">
          {live && <EntrarSessaoButton size="sm" live openedSeconds={s.salaAbertaSeg ?? 0} onClick={onEntrar} />}
          <div className="relative">
            <button
              onClick={onToggleMenu}
              aria-label="Ações da sessão"
              aria-haspopup="menu"
              aria-expanded={open}
              className="flex h-8 w-8 items-center justify-center rounded-pill text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
            >
              <Icon icon="ph:dots-three-bold" width={18} aria-hidden />
            </button>
            {open && (
              <>
                <div className="fixed inset-0 z-10" aria-hidden onClick={onClose} />
                <div role="menu" className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-lg">
                  <button role="menuitem" onClick={onHistorico} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-surface-hover">
                    <Icon icon="ph:clock-counter-clockwise-bold" width={16} className="text-ink-secondary" aria-hidden />
                    Ver histórico
                  </button>
                  {!completed && (
                    <button role="menuitem" onClick={onEditar} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-surface-hover">
                      <Icon icon="ph:pencil-simple-bold" width={16} className="text-ink-secondary" aria-hidden />
                      Editar
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Desktop: ações com texto, como no card da lista */}
      <div className="hidden shrink-0 items-center gap-1.5 sm:flex sm:justify-end">
        {live && <EntrarSessaoButton size="sm" live openedSeconds={s.salaAbertaSeg ?? 0} onClick={onEntrar} />}
        <Button size="sm" variant="secondary" iconLeft="ph:clock-counter-clockwise-bold" onClick={onHistorico}>Histórico</Button>
        {!completed && <Button size="sm" variant="secondary" iconLeft="ph:pencil-simple-bold" onClick={onEditar}>Editar</Button>}
      </div>
    </div>
  )
}

const Disponivel = () => (
  <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success-bg/50 px-3 py-2.5 text-[13px] font-medium text-success-ink">
    <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
    Disponível
  </div>
)

/* Visão de calendário do dia: slots de hora em hora sinalizando disponível,
   bloqueado, indisponível, encerrado e com sessão. Recebe dados já resolvidos
   no fuso do usuário (sessões, horas disponíveis, "agora" e a grade de horas). */
export function AgendaCalendario({ date, hours, sessions, availableHours, blocked, now, onEditar, onHistorico, onEntrar }: {
  date: string
  hours: string[]
  sessions: ProSession[]
  availableHours: Set<string>
  blocked: { motivo: string } | null
  now: string
  onEditar: (s: ProSession) => void
  onHistorico: (s: ProSession) => void
  onEntrar: (s: ProSession) => void
}) {
  const [menuFor, setMenuFor] = useState<string | null>(null)

  const sessionsAtHour = (h: string) =>
    sessions.filter((s) => s.time.slice(0, 2) === h.slice(0, 2)).sort((a, b) => a.time.localeCompare(b.time))
  const availableAtHour = (h: string) => availableHours.has(h)

  return (
    <div>
      {/* Legenda */}
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink-secondary">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden /> Sessão</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-success" aria-hidden /> Disponível</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-ink-muted/40" aria-hidden /> Não disponibilizado</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-danger" aria-hidden /> Bloqueado</span>
      </div>

      {blocked && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-bg px-3 py-2 text-[13px] text-danger-ink">
          <Icon icon="ph:prohibit-bold" width={15} className="shrink-0" aria-hidden />
          Dia bloqueado{blocked.motivo ? ` — ${blocked.motivo}` : ''}
        </div>
      )}

      <div className="flex flex-col">
        {hours.map((h) => {
          const sessAll = sessionsAtHour(h)
          const active = sessAll.filter((s) => s.status !== 'cancelled')
          const cancelledFuture = sessAll.some((s) => s.status === 'cancelled' && !isPastSession(s, now))
          const hasLive = active.some(isLive)
          const available = availableAtHour(h)
          const past = `${date}T${h}:00` < now
          const dim = past && !hasLive
          return (
            <div key={h} className={`flex gap-3 border-t border-border py-2 first:border-t-0 ${dim ? 'opacity-55' : ''}`}>
              <span className="w-12 shrink-0 pt-2 font-mono text-[12px] text-ink-muted">{h}</span>
              <div className="min-w-0 flex-1">
                {active.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {active.map((s) => (
                      <SessionSlot
                        key={s.id}
                        s={s}
                        now={now}
                        open={menuFor === s.id}
                        onToggleMenu={() => setMenuFor((m) => (m === s.id ? null : s.id))}
                        onClose={() => setMenuFor(null)}
                        onEditar={() => { setMenuFor(null); onEditar(s) }}
                        onHistorico={() => { setMenuFor(null); onHistorico(s) }}
                        onEntrar={() => onEntrar(s)}
                      />
                    ))}
                  </div>
                ) : blocked ? (
                  <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-bg/50 px-3 py-2.5 text-[13px] font-medium text-danger-ink">
                    <span className="h-2 w-2 rounded-full bg-danger" aria-hidden />
                    Bloqueado
                  </div>
                ) : cancelledFuture ? (
                  <Disponivel />
                ) : past ? (
                  <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-surface-2 px-3 py-2.5 text-[13px] text-ink-muted">
                    <Icon icon="ph:clock-bold" width={14} className="shrink-0" aria-hidden />
                    Encerrado
                  </div>
                ) : available ? (
                  <Disponivel />
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-surface-2 px-3 py-2.5 text-[13px] text-ink-muted/80">
                    <Icon icon="ph:prohibit-bold" width={14} className="shrink-0 text-ink-muted/60" aria-hidden />
                    Não disponibilizado
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
