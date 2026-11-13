import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'
import { Textarea } from '../../components/Textarea'
import { proBeneficiarioService } from '../../services/pro'
import { CID_OPCOES, RISCO_OPCOES, riscoOpcao, cidLabel } from '../../lib/prontuario'
import type { PlanoTerapeutico, ObjetivoTerapeutico } from '../../types'

const emptyPlano: PlanoTerapeutico = {
  demanda: '', objetivos: [], hipoteseDiagnostica: [], abordagem: '', riscoAtual: 'sem-risco', atualizadoEm: '—',
}

const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

/* Plano terapêutico / acompanhamento — nível do paciente, revisado ao longo do
   tratamento. Objetivos são itens vivos (marcáveis); demais campos editáveis. */
export function PlanoTerapeuticoCard({ beneficiarioId, plano }: {
  beneficiarioId: string
  plano?: PlanoTerapeutico
}) {
  const [p, setP] = useState<PlanoTerapeutico>(plano ?? emptyPlano)
  const [editing, setEditing] = useState(false)
  const [snapshot, setSnapshot] = useState<PlanoTerapeutico | null>(null)
  const [saving, setSaving] = useState(false)

  const persist = async (next: PlanoTerapeutico) => {
    setSaving(true)
    const stamped = await proBeneficiarioService.savePlano(beneficiarioId, next)
    setP(stamped)
    setSaving(false)
    return stamped
  }

  const toggleObjetivo = (id: string) => {
    const next = {
      ...p,
      objetivos: p.objetivos.map((o) =>
        o.id === id ? { ...o, status: o.status === 'alcancado' ? 'em-andamento' : 'alcancado' } as ObjetivoTerapeutico : o,
      ),
    }
    if (editing) setP(next)
    else void persist(next)
  }

  const startEdit = () => { setSnapshot(p); setEditing(true) }
  const cancelEdit = () => { if (snapshot) setP(snapshot); setEditing(false) }
  const salvar = async () => { await persist(p); setEditing(false) }

  const risco = riscoOpcao(p.riscoAtual)

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-[15px] font-semibold text-ink">
          <Icon icon="ph:target-bold" width={16} className="text-primary dark:text-primary-300" aria-hidden />
          Plano terapêutico
        </h2>
        {!editing ? (
          <button onClick={startEdit} className="flex items-center gap-1 font-heading text-xs font-semibold text-primary dark:text-primary-300">
            <Icon icon="ph:pencil-simple-bold" width={13} aria-hidden /> Editar
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={cancelEdit} disabled={saving} className="font-heading text-xs font-semibold text-ink-secondary hover:text-ink">Cancelar</button>
            <Button size="sm" onClick={salvar} disabled={saving} iconLeft="ph:check-bold">{saving ? 'Salvando…' : 'Salvar'}</Button>
          </div>
        )}
      </div>
      <p className="mt-0.5 text-[11px] text-ink-muted">Atualizado em {p.atualizadoEm}</p>

      <div className="mt-4 flex flex-col gap-4">
        {/* Demanda */}
        <Section label="Demanda">
          {editing ? (
            <Textarea value={p.demanda} onChange={(e) => setP({ ...p, demanda: e.target.value })} className="min-h-[64px]" aria-label="Demanda" />
          ) : (
            <p className="text-sm text-ink">{p.demanda || '—'}</p>
          )}
        </Section>

        {/* Objetivos */}
        <Section label="Objetivos terapêuticos" hint={`${p.objetivos.filter((o) => o.status === 'alcancado').length} de ${p.objetivos.length} alcançados`}>
          <ul className="flex flex-col gap-1.5">
            {p.objetivos.map((o) => (
              <li key={o.id} className="flex items-start gap-2">
                <button
                  onClick={() => toggleObjetivo(o.id)}
                  disabled={saving}
                  aria-pressed={o.status === 'alcancado'}
                  className="mt-0.5 shrink-0"
                  aria-label={o.status === 'alcancado' ? 'Marcar como em andamento' : 'Marcar como alcançado'}
                >
                  <Icon
                    icon={o.status === 'alcancado' ? 'ph:check-circle-fill' : 'ph:circle-bold'}
                    width={18}
                    className={o.status === 'alcancado' ? 'text-success' : 'text-ink-muted'}
                    aria-hidden
                  />
                </button>
                {editing ? (
                  <input
                    value={o.texto}
                    onChange={(e) => setP({ ...p, objetivos: p.objetivos.map((x) => x.id === o.id ? { ...x, texto: e.target.value } : x) })}
                    className="min-w-0 flex-1 rounded border-[1.5px] border-border bg-surface px-2 py-1 text-sm text-ink outline-none focus:border-primary"
                    aria-label="Texto do objetivo"
                  />
                ) : (
                  <span className={`text-sm ${o.status === 'alcancado' ? 'text-ink-secondary line-through' : 'text-ink'}`}>{o.texto}</span>
                )}
                {editing && (
                  <button onClick={() => setP({ ...p, objetivos: p.objetivos.filter((x) => x.id !== o.id) })} aria-label="Remover objetivo" className="mt-0.5 shrink-0 text-ink-muted hover:text-danger">
                    <Icon icon="ph:x-bold" width={14} aria-hidden />
                  </button>
                )}
              </li>
            ))}
            {p.objetivos.length === 0 && !editing && <li className="text-sm text-ink-secondary">—</li>}
          </ul>
          {editing && (
            <button
              onClick={() => setP({ ...p, objetivos: [...p.objetivos, { id: `ob-${Date.now()}`, texto: '', status: 'em-andamento' }] })}
              className="mt-2 flex items-center gap-1 font-heading text-xs font-semibold text-primary dark:text-primary-300"
            >
              <Icon icon="ph:plus-bold" width={12} aria-hidden /> Adicionar objetivo
            </button>
          )}
        </Section>

        {/* Hipótese diagnóstica */}
        <Section label="Hipótese diagnóstica (CID-10)">
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {CID_OPCOES.map((c) => {
                const active = p.hipoteseDiagnostica.includes(c.code)
                return (
                  <button
                    key={c.code}
                    type="button"
                    title={cidLabel(c.code)}
                    onClick={() => setP({ ...p, hipoteseDiagnostica: toggle(p.hipoteseDiagnostica, c.code) })}
                    aria-pressed={active}
                    className={`rounded-pill border-[1.5px] px-3 py-1.5 font-heading text-[12.5px] font-medium transition-colors ${
                      active ? 'border-primary bg-primary-50 text-primary dark:text-primary-300' : 'border-border bg-surface text-ink-secondary hover:border-border-strong hover:text-ink'
                    }`}
                  >
                    <span className="font-mono">{c.code}</span> · {c.label}
                  </button>
                )
              })}
            </div>
          ) : p.hipoteseDiagnostica.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {p.hipoteseDiagnostica.map((code) => (
                <span key={code} className="rounded-pill bg-surface-2 px-2 py-0.5 text-[12px] text-ink-secondary">{cidLabel(code)}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-secondary">—</p>
          )}
        </Section>

        {/* Risco atual */}
        <Section label="Risco atual">
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {RISCO_OPCOES.map((o) => {
                const active = o.value === p.riscoAtual
                const danger = o.danger && active
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setP({ ...p, riscoAtual: o.value })}
                    aria-pressed={active}
                    className={`rounded-pill border-[1.5px] px-3 py-1.5 font-heading text-[12.5px] font-medium transition-colors ${
                      danger ? 'border-danger bg-danger text-white'
                        : active ? 'border-primary bg-primary-50 text-primary dark:text-primary-300'
                        : 'border-border bg-surface text-ink-secondary hover:border-border-strong hover:text-ink'
                    }`}
                  >
                    {o.label}
                  </button>
                )
              })}
            </div>
          ) : risco && p.riscoAtual !== 'sem-risco' ? (
            <span className="inline-flex items-center gap-1 rounded-pill bg-danger-bg px-2.5 py-1 text-[12px] font-semibold text-danger-ink">
              <Icon icon="ph:warning-bold" width={12} aria-hidden /> {risco.label}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-pill bg-success-bg px-2.5 py-1 text-[12px] font-semibold text-success">
              <Icon icon="ph:shield-check-bold" width={12} aria-hidden /> {risco?.label ?? 'Sem risco identificado'}
            </span>
          )}
        </Section>

        {/* Abordagem */}
        <Section label="Abordagem / plano">
          {editing ? (
            <Textarea value={p.abordagem} onChange={(e) => setP({ ...p, abordagem: e.target.value })} className="min-h-[64px]" aria-label="Abordagem" />
          ) : (
            <p className="text-sm text-ink">{p.abordagem || '—'}</p>
          )}
        </Section>
      </div>
    </div>
  )
}

function Section({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <h3 className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">{label}</h3>
        {hint && <span className="text-[11px] text-ink-muted">{hint}</span>}
      </div>
      {children}
    </div>
  )
}
