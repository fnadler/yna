import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { PRO_TODAY } from '../../data/proMock'
import { usePro } from '../../contexts/ProContext'
import type { ProDiaDisponibilidade as DiaState, ProBloqueio as Bloqueio } from '../../types'

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const HORARIOS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']

type EditorState = { id: string | null; tipo: 'dia' | 'periodo'; inicio: string; fim: string; motivo: string }

const inputCls = 'w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none'
const ddmm = (d: string) => d.split('-').slice(1).reverse().join('/')
const fmtBloqueio = (b: Bloqueio) => (b.fim && b.fim !== b.inicio ? `${ddmm(b.inicio)} a ${ddmm(b.fim)}` : ddmm(b.inicio))
const countSlots = (s: Record<string, DiaState>) => Object.values(s).reduce((n, d) => n + (d.active ? d.times.length : 0), 0)

/* Grade semanal de dias × horários, reusada por Atendimento e Plantão.
   `isDisabled` desabilita horários (ex.: plantão não pode coincidir com atendimento). */
function DiaGrid({ state, onToggleDia, onToggleTime, isDisabled }: {
  state: Record<string, DiaState>
  onToggleDia: (d: string) => void
  onToggleTime: (d: string, t: string) => void
  isDisabled?: (d: string, t: string) => boolean
}) {
  return (
    <div className="flex flex-col gap-3">
      {DIAS.map((d) => {
        const day = state[d]!
        return (
          <div key={d} className={`rounded-lg border px-4 py-4 transition-colors ${day.active ? 'border-border bg-surface' : 'border-border bg-surface-2'}`}>
            <button type="button" onClick={() => onToggleDia(d)} aria-pressed={day.active} className="flex w-full items-center gap-3">
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
                  const disabled = isDisabled?.(d, t) ?? false
                  return (
                    <button
                      key={t}
                      type="button"
                      disabled={disabled}
                      onClick={() => onToggleTime(d, t)}
                      aria-pressed={on}
                      title={disabled ? 'Você já atende neste horário' : undefined}
                      className={`rounded-pill border-[1.5px] px-3 py-1.5 font-mono text-[13px] transition-colors ${
                        disabled
                          ? 'cursor-not-allowed border-dashed border-border bg-surface-2 text-ink-muted line-through'
                          : on
                          ? 'border-primary bg-primary text-white'
                          : 'border-border bg-surface text-ink-secondary hover:border-border-strong'
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
  )
}

/* PRO-11 — configuração de agenda/disponibilidade (Atendimento · Plantão · Bloqueios).
   Renderizado dentro de um Sheet a partir do PRO-09. */
export function Pro11AgendaContent({ onClose }: { onClose: () => void }) {
  const { disponibilidade, setDisponibilidade } = usePro()
  const [aba, setAba] = useState<'atendimento' | 'plantao' | 'bloqueios'>('atendimento')
  const [dias, setDias] = useState<Record<string, DiaState>>(disponibilidade.atendimento)
  const [plantao, setPlantao] = useState<Record<string, DiaState>>(disponibilidade.plantao)
  const [bloqueios, setBloqueios] = useState<Bloqueio[]>(disponibilidade.bloqueios)
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [saved, setSaved] = useState(false)

  // Horário já ocupado por atendimento regular (indisponível para plantão).
  const atende = (d: string, t: string) => !!dias[d]?.active && dias[d].times.includes(t)

  // ── Atendimento ──
  const toggleDia = (d: string) => setDias((s) => ({ ...s, [d]: { ...s[d]!, active: !s[d]!.active } }))
  const toggleTime = (d: string, t: string) => {
    const turningOn = !dias[d]!.times.includes(t)
    setDias((s) => {
      const day = s[d]!
      const times = day.times.includes(t) ? day.times.filter((x) => x !== t) : [...day.times, t].sort()
      return { ...s, [d]: { ...day, times } }
    })
    // Ao passar a atender num horário, libera-o do plantão (não podem coincidir).
    if (turningOn) {
      setPlantao((p) => {
        const day = p[d]
        if (!day || !day.times.includes(t)) return p
        return { ...p, [d]: { ...day, times: day.times.filter((x) => x !== t) } }
      })
    }
  }

  // ── Plantão ──
  const togglePlantaoDia = (d: string) => setPlantao((s) => ({ ...s, [d]: { ...s[d]!, active: !s[d]!.active } }))
  const togglePlantaoTime = (d: string, t: string) => {
    if (atende(d, t)) return
    setPlantao((s) => {
      const day = s[d]!
      const times = day.times.includes(t) ? day.times.filter((x) => x !== t) : [...day.times, t].sort()
      return { ...s, [d]: { ...day, times } }
    })
  }

  // ── Bloqueios ──
  const futuros = bloqueios
    .filter((b) => (b.fim ?? b.inicio) >= PRO_TODAY)
    .sort((a, b) => a.inicio.localeCompare(b.inicio))
  const abrirNovo = () => setEditor({ id: null, tipo: 'dia', inicio: PRO_TODAY, fim: PRO_TODAY, motivo: '' })
  const abrirEdicao = (b: Bloqueio) =>
    setEditor({ id: b.id, tipo: b.fim && b.fim !== b.inicio ? 'periodo' : 'dia', inicio: b.inicio, fim: b.fim ?? b.inicio, motivo: b.motivo })
  const removerBloqueio = (id: string) => setBloqueios((arr) => arr.filter((x) => x.id !== id))
  const setField = <K extends keyof EditorState>(k: K, v: EditorState[K]) => setEditor((e) => (e ? { ...e, [k]: v } : e))
  const editorValido = !!editor && editor.motivo.trim() !== '' && (editor.tipo === 'dia' || editor.fim >= editor.inicio)
  const salvarBloqueio = () => {
    if (!editor || !editorValido) return
    const novo: Bloqueio = {
      id: editor.id ?? `b-${Date.now()}`,
      inicio: editor.inicio,
      fim: editor.tipo === 'periodo' ? editor.fim : undefined,
      motivo: editor.motivo.trim(),
    }
    setBloqueios((arr) => (editor.id ? arr.map((x) => (x.id === editor.id ? novo : x)) : [...arr, novo]))
    setEditor(null)
  }

  const salvar = () => {
    setDisponibilidade({ atendimento: dias, plantao, bloqueios })
    setSaved(true)
    setTimeout(onClose, 700)
  }

  return (
    <div className="px-5 py-6 lg:px-6">
      {/* Controle de seção */}
      <div className="mb-5 flex gap-1 rounded-lg bg-surface-2 p-1">
        {([['atendimento', 'Atendimento'], ['plantao', 'Plantão'], ['bloqueios', 'Bloqueios']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setAba(key)}
            className={`flex-1 rounded-lg py-2.5 font-heading text-[13px] font-semibold transition-all ${
              aba === key ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Atendimento ── */}
      {aba === 'atendimento' && (
        <section>
          <div className="mb-1 flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-semibold text-ink">Atendimento</h2>
            <Badge tone="neutral">{countSlots(dias)} horários/semana</Badge>
          </div>
          <p className="mb-4 text-[13px] text-ink-secondary">Marque os dias e horários em que você atende. Repete toda semana.</p>
          <DiaGrid state={dias} onToggleDia={toggleDia} onToggleTime={toggleTime} />
        </section>
      )}

      {/* ── Plantão ── */}
      {aba === 'plantao' && (
        <section>
          <div className="mb-1 flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-semibold text-ink">Plantão</h2>
            <Badge tone="neutral">{countSlots(plantao)} horários/semana</Badge>
          </div>
          <p className="mb-3 text-[13px] text-ink-secondary">Dias e horários em que você fica disponível para emergências.</p>
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[12.5px] text-ink-secondary">
            <Icon icon="ph:info-bold" width={15} className="mt-0.5 shrink-0 text-ink-muted" aria-hidden />
            Os horários do seu atendimento regular ficam indisponíveis para plantão — não podem coincidir.
          </div>
          <DiaGrid state={plantao} onToggleDia={togglePlantaoDia} onToggleTime={togglePlantaoTime} isDisabled={atende} />
        </section>
      )}

      {/* ── Bloqueios ── */}
      {aba === 'bloqueios' && (
        <section>
          <h2 className="text-[15px] font-semibold text-ink">Bloqueios</h2>
          <p className="mt-1 text-[13px] text-ink-secondary">Datas ou períodos futuros em que você não atende.</p>
          <div className="mt-3 flex flex-col gap-2">
            {futuros.map((b) => (
              <div key={b.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
                <Icon icon="ph:prohibit-bold" width={18} className="shrink-0 text-ink-muted" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{fmtBloqueio(b)}</p>
                  <p className="truncate text-[13px] text-ink-secondary">{b.motivo}</p>
                </div>
                <button
                  onClick={() => abrirEdicao(b)}
                  aria-label={`Editar bloqueio de ${fmtBloqueio(b)}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
                >
                  <Icon icon="ph:pencil-simple-bold" width={16} aria-hidden />
                </button>
                <button
                  onClick={() => removerBloqueio(b.id)}
                  aria-label={`Excluir bloqueio de ${fmtBloqueio(b)}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill text-ink-secondary transition-colors hover:bg-danger-bg hover:text-danger"
                >
                  <Icon icon="ph:trash-bold" width={16} aria-hidden />
                </button>
              </div>
            ))}

            {futuros.length === 0 && !editor && (
              <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-4 text-center text-[13px] text-ink-secondary">
                Nenhum bloqueio futuro.
              </p>
            )}

            {editor ? (
              <div className="flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary-50/50 p-4 dark:bg-primary-50/10">
                <p className="font-heading text-sm font-semibold text-ink">{editor.id ? 'Editar bloqueio' : 'Novo bloqueio'}</p>

                <div className="flex gap-1 rounded-lg bg-surface-2 p-1">
                  {([['dia', 'Dia único'], ['periodo', 'Período']] as const).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setField('tipo', key)}
                      className={`flex-1 rounded-lg py-2 font-heading text-[13px] font-semibold transition-all ${
                        editor.tipo === key ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {editor.tipo === 'dia' ? (
                  <div>
                    <label className="mb-1.5 block font-heading text-[12.5px] font-semibold text-ink">Data</label>
                    <input type="date" value={editor.inicio} onChange={(e) => setField('inicio', e.target.value)} className={inputCls} />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1.5 block font-heading text-[12.5px] font-semibold text-ink">Início</label>
                      <input type="date" value={editor.inicio} onChange={(e) => setField('inicio', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className="mb-1.5 block font-heading text-[12.5px] font-semibold text-ink">Fim</label>
                      <input type="date" value={editor.fim} min={editor.inicio} onChange={(e) => setField('fim', e.target.value)} className={inputCls} />
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block font-heading text-[12.5px] font-semibold text-ink">Explicação</label>
                  <input
                    type="text"
                    value={editor.motivo}
                    onChange={(e) => setField('motivo', e.target.value)}
                    placeholder="Ex.: Feriado, congresso, férias…"
                    className={inputCls}
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => setEditor(null)}>Cancelar</Button>
                  <Button size="sm" className="flex-1" disabled={!editorValido} onClick={salvarBloqueio}>Salvar bloqueio</Button>
                </div>
              </div>
            ) : (
              <button
                onClick={abrirNovo}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-surface px-4 py-3 font-heading text-sm font-medium text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
              >
                <Icon icon="ph:plus-bold" width={15} aria-hidden />
                Adicionar bloqueio
              </button>
            )}
          </div>
        </section>
      )}

      <div className="mt-8">
        <Button size="lg" fullWidth iconLeft={saved ? 'ph:check-bold' : undefined} onClick={salvar}>
          {saved ? 'Disponibilidade salva' : 'Salvar disponibilidade'}
        </Button>
      </div>
    </div>
  )
}
