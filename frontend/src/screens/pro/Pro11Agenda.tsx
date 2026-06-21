import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const HORARIOS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']

type DiaState = { active: boolean; times: string[] }

const inicial: Record<string, DiaState> = {
  Seg: { active: true, times: ['09:00', '11:00', '15:00'] },
  Ter: { active: true, times: ['14:00', '16:00'] },
  Qua: { active: true, times: ['09:00', '10:00'] },
  Qui: { active: true, times: ['15:00', '17:00'] },
  Sex: { active: true, times: ['09:00'] },
  Sáb: { active: false, times: [] },
  Dom: { active: false, times: [] },
}

/* PRO-11 — configuração de agenda/disponibilidade.
   Renderizado dentro de um Sheet a partir do PRO-09 (mesma lógica de
   detalhe/ação em modal usada no fluxo do beneficiário). */
export function Pro11AgendaContent({ onClose }: { onClose: () => void }) {
  const [dias, setDias] = useState<Record<string, DiaState>>(inicial)
  const [bloqueios, setBloqueios] = useState<string[]>(['24/06 — feriado', '01/07 a 05/07 — congresso'])
  const [saved, setSaved] = useState(false)

  const toggleDia = (d: string) =>
    setDias((s) => ({ ...s, [d]: { ...s[d]!, active: !s[d]!.active } }))
  const toggleTime = (d: string, t: string) =>
    setDias((s) => {
      const day = s[d]!
      const times = day.times.includes(t) ? day.times.filter((x) => x !== t) : [...day.times, t].sort()
      return { ...s, [d]: { ...day, times } }
    })
  const removeBloqueio = (b: string) => setBloqueios((arr) => arr.filter((x) => x !== b))
  const addBloqueio = () => setBloqueios((arr) => [...arr, 'Novo bloqueio — toque para editar'])

  const totalSlots = Object.values(dias).reduce((n, d) => n + (d.active ? d.times.length : 0), 0)

  const salvar = () => {
    setSaved(true)
    setTimeout(onClose, 700)
  }

  return (
    <div className="px-5 py-6 lg:px-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-ink">Recorrência semanal</h2>
        <Badge tone="neutral">{totalSlots} horários/semana</Badge>
      </div>
      <p className="-mt-2 mb-4 text-[13px] text-ink-secondary">Marque os dias e horários em que você atende. Repete toda semana.</p>

      <div className="flex flex-col gap-3">
        {DIAS.map((d) => {
          const day = dias[d]!
          return (
            <div key={d} className={`rounded-lg border px-4 py-4 transition-colors ${day.active ? 'border-border bg-surface' : 'border-border bg-surface-2'}`}>
              <button
                type="button"
                onClick={() => toggleDia(d)}
                aria-pressed={day.active}
                className="flex w-full items-center gap-3"
              >
                <Icon
                  icon={day.active ? 'ph:toggle-right-fill' : 'ph:toggle-left-bold'}
                  width={28}
                  className={day.active ? 'text-primary dark:text-primary-300' : 'text-ink-muted'}
                  aria-hidden
                />
                <span className={`font-heading text-sm font-semibold ${day.active ? 'text-ink' : 'text-ink-muted'}`}>{d}</span>
                {day.active && <span className="ml-auto font-mono text-xs text-ink-secondary">{day.times.length} horário(s)</span>}
              </button>

              {day.active && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {HORARIOS.map((t) => {
                    const on = day.times.includes(t)
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTime(d, t)}
                        aria-pressed={on}
                        className={`rounded-pill border-[1.5px] px-3 py-1.5 font-mono text-[13px] transition-colors ${
                          on ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-ink-secondary hover:border-border-strong'
                        }`}
                      >
                        {t}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <h2 className="mt-8 text-[15px] font-semibold text-ink">Bloqueios</h2>
      <p className="mt-1 text-[13px] text-ink-secondary">Datas específicas em que você não atende.</p>
      <div className="mt-3 flex flex-col gap-2">
        {bloqueios.map((b) => (
          <div key={b} className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
            <Icon icon="ph:prohibit-bold" width={18} className="shrink-0 text-ink-muted" aria-hidden />
            <span className="flex-1 text-sm text-ink">{b}</span>
            <button onClick={() => removeBloqueio(b)} aria-label="Remover bloqueio" className="text-ink-muted transition-colors hover:text-danger">
              <Icon icon="ph:x-bold" width={16} aria-hidden />
            </button>
          </div>
        ))}
        <button
          onClick={addBloqueio}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-surface px-4 py-3 font-heading text-sm font-medium text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
        >
          <Icon icon="ph:plus-bold" width={15} aria-hidden />
          Adicionar bloqueio
        </button>
      </div>

      <div className="mt-8">
        <Button size="lg" fullWidth iconLeft={saved ? 'ph:check-bold' : undefined} onClick={salvar}>
          {saved ? 'Disponibilidade salva' : 'Salvar disponibilidade'}
        </Button>
      </div>
    </div>
  )
}
