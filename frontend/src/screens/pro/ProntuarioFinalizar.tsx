import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'
import { Textarea } from '../../components/Textarea'
import { Chips } from '../../components/Chips'
import { useService } from '../../hooks/useService'
import { proSessionService, proProntuarioService } from '../../services/pro'
import {
  COMPARECIMENTO_OPCOES, RISCO_OPCOES, TEMAS, HUMOR, TECNICAS, ENCAMINHAMENTOS, CID_OPCOES,
  riscoOpcao, cidLabel,
} from '../../lib/prontuario'
import type { ProntuarioDraft } from '../../lib/prontuario'

/* Finalização do prontuário ao encerrar a sessão (PRO-15). Modelo progressivo:
   reapresenta o que foi preenchido no painel (editável) e revela os campos
   adicionais opcionais. Finalizar exige a evolução; rascunho não. */
export function ProntuarioFinalizar({ draft, onDraftChange, sessionId, onDone, onCancel }: {
  draft: ProntuarioDraft
  onDraftChange: (patch: Partial<ProntuarioDraft>) => void
  sessionId: string
  onDone: () => void
  onCancel: () => void
}) {
  const session = useService(() => proSessionService.get(sessionId), [sessionId])
  const [submitting, setSubmitting] = useState(false)
  const apelido = session.status === 'success' ? session.data?.beneficiarioApelido ?? 'beneficiário' : 'beneficiário'

  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

  const persist = async (finalizado: boolean) => {
    setSubmitting(true)
    await proProntuarioService.save({
      sessionId,
      beneficiarioApelido: apelido,
      date: new Date().toLocaleDateString('pt-BR'),
      conteudo: draft.evolucao.trim(),
      finalizado,
      comparecimento: draft.comparecimento,
      temas: draft.temas,
      risco: draft.risco,
      cids: draft.cids,
      humor: draft.humor,
      tecnicas: draft.tecnicas,
      encaminhamentos: draft.encaminhamentos,
      tarefas: draft.tarefas.trim() || undefined,
    })
  }

  const finalizar = async () => {
    if (!draft.evolucao.trim()) return
    await persist(true)
    onDone()
  }
  const salvarRascunho = async () => {
    await persist(false)
    onCancel()
  }

  const risco = riscoOpcao(draft.risco)

  return (
    <div className="px-5 py-6 lg:px-6">
      <p className="text-sm leading-relaxed text-ink-secondary">
        Registro da sessão com {apelido}. Revise o que foi anotado durante a sessão e complemente se quiser.
        Fica privado entre você e a plataforma.
      </p>

      {risco && draft.risco !== 'sem-risco' && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-bg px-3 py-2.5 text-[13px] font-medium text-danger-ink">
          <Icon icon="ph:warning-bold" width={16} className="shrink-0" aria-hidden />
          Risco sinalizado: {risco.label}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-5">
        <Field label="Comparecimento">
          <Pills
            options={COMPARECIMENTO_OPCOES}
            value={draft.comparecimento}
            onChange={(v) => onDraftChange({ comparecimento: v as ProntuarioDraft['comparecimento'] })}
          />
        </Field>

        <Field label="Temas trabalhados">
          <Chips options={TEMAS} selected={draft.temas} onToggle={(v) => onDraftChange({ temas: toggle(draft.temas, v) })} />
        </Field>

        <Field label="Evolução clínica" required>
          <Textarea
            value={draft.evolucao}
            onChange={(e) => onDraftChange({ evolucao: e.target.value })}
            placeholder="Como foi a sessão, respostas às intervenções, avanços e dificuldades…"
            className="min-h-[140px]"
            aria-label="Evolução clínica"
          />
        </Field>

        <Field label="Avaliação de risco">
          <Pills
            options={RISCO_OPCOES}
            value={draft.risco}
            onChange={(v) => onDraftChange({ risco: v as ProntuarioDraft['risco'] })}
          />
        </Field>

        <Field label="Hipótese diagnóstica (CID-10)" hint="Opcional">
          <CidChips selected={draft.cids} onToggle={(v) => onDraftChange({ cids: toggle(draft.cids, v) })} />
        </Field>
      </div>

      {/* Complementar — opcional */}
      <div className="mt-6 border-t border-border pt-5">
        <p className="mb-4 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          Complementar (opcional)
        </p>
        <div className="flex flex-col gap-5">
          <Field label="Humor / apresentação">
            <Chips options={HUMOR} selected={draft.humor} onToggle={(v) => onDraftChange({ humor: toggle(draft.humor, v) })} />
          </Field>
          <Field label="Técnicas / intervenções">
            <Chips options={TECNICAS} selected={draft.tecnicas} onToggle={(v) => onDraftChange({ tecnicas: toggle(draft.tecnicas, v) })} />
          </Field>
          <Field label="Encaminhamentos">
            <Chips options={ENCAMINHAMENTOS} selected={draft.encaminhamentos} onToggle={(v) => onDraftChange({ encaminhamentos: toggle(draft.encaminhamentos, v) })} />
          </Field>
          <Field label="Combinações / tarefas para a próxima sessão">
            <Textarea
              value={draft.tarefas}
              onChange={(e) => onDraftChange({ tarefas: e.target.value })}
              placeholder="O que ficou combinado para a próxima sessão…"
              className="min-h-[80px]"
              aria-label="Combinações e tarefas"
            />
          </Field>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Button size="lg" fullWidth disabled={!draft.evolucao.trim() || submitting} iconRight="ph:check-bold" onClick={finalizar}>
          {submitting ? 'Concluindo…' : 'Finalizar e concluir sessão'}
        </Button>
        <Button variant="ghost" fullWidth disabled={submitting} onClick={salvarRascunho}>
          Salvar rascunho e sair
        </Button>
      </div>

      <p className="mt-4 flex items-start gap-2 text-[12.5px] text-ink-muted">
        <Icon icon="ph:info-bold" width={14} className="mt-0.5 shrink-0" aria-hidden />
        Para finalizar é preciso preencher a evolução clínica. Se sair sem finalizar, a sessão fica pendente.
      </p>
    </div>
  )
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label className="text-[13px] font-semibold text-ink">
          {label}{required && <span className="text-danger"> *</span>}
        </label>
        {hint && <span className="text-[11px] text-ink-muted">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function Pills<T extends string>({ options, value, onChange }: {
  options: { value: T; label: string; danger?: boolean }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value
        const danger = o.danger && active
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={`rounded-pill border-[1.5px] px-3.5 py-2 font-heading text-[13px] font-medium transition-colors ${
              danger
                ? 'border-danger bg-danger text-white'
                : active
                  ? 'border-primary bg-primary-50 text-primary dark:text-primary-300'
                  : 'border-border bg-surface text-ink-secondary hover:border-border-strong hover:text-ink'
            }`}
          >
            {o.danger && <Icon icon="ph:warning-bold" width={12} className="mr-1 inline -translate-y-px" aria-hidden />}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function CidChips({ selected, onToggle }: { selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CID_OPCOES.map((c) => {
        const active = selected.includes(c.code)
        return (
          <button
            key={c.code}
            type="button"
            title={cidLabel(c.code)}
            onClick={() => onToggle(c.code)}
            aria-pressed={active}
            className={`rounded-pill border-[1.5px] px-3 py-1.5 font-heading text-[12.5px] font-medium transition-colors ${
              active
                ? 'border-primary bg-primary-50 text-primary dark:text-primary-300'
                : 'border-border bg-surface text-ink-secondary hover:border-border-strong hover:text-ink'
            }`}
          >
            <span className="font-mono">{c.code}</span> · {c.label}
          </button>
        )
      })}
    </div>
  )
}
