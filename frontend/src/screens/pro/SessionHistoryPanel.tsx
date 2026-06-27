import { useEffect, useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import { Avatar } from '../../components/Avatar'
import { useService } from '../../hooks/useService'
import { proBeneficiarioService } from '../../services/pro'
import {
  COMPARECIMENTO_OPCOES, RISCO_OPCOES, TEMAS, CID_OPCOES,
  riscoOpcao, cidLabel, comparecimentoLabel,
} from '../../lib/prontuario'
import type { ProntuarioDraft } from '../../lib/prontuario'
import type { ProntuarioEntry, ProBeneficiarioDetail, PlanoTerapeutico } from '../../types'

/* Painel do beneficiário dentro da sala de sessão (PRO-15), em abas:
   Perfil (identificação + triagem) · Prontuários (histórico) · Registrar
   (prontuário estruturado enxuto, preenchido ao longo da sessão).
   Tema escuro da sala (hex próprio, não usa os tokens claros do app). */

const TABS = [
  { key: 'perfil', label: 'Perfil' },
  { key: 'prontuarios', label: 'Prontuários' },
  { key: 'registrar', label: 'Registrar' },
] as const
type TabKey = (typeof TABS)[number]['key']

const toggleIn = (arr: string[], v: string) =>
  arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]

export function SessionHistoryPanel({ beneficiarioId, draft, onDraftChange }: {
  beneficiarioId: string
  draft: ProntuarioDraft
  onDraftChange: (patch: Partial<ProntuarioDraft>) => void
}) {
  const q = useService(() => proBeneficiarioService.get(beneficiarioId), [beneficiarioId])
  const [tab, setTab] = useState<TabKey>('perfil')

  return (
    <div className="flex h-full flex-col">
      {/* Abas */}
      <div className="flex shrink-0 gap-1 border-b border-[rgba(255,255,255,0.1)] p-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            aria-selected={tab === t.key}
            className={`flex-1 rounded-md px-2 py-1.5 font-heading text-[13px] font-semibold transition-colors ${
              tab === t.key ? 'bg-[#6C6FC2] text-white' : 'text-[#B4AEC9] hover:text-[#F2EFF8]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {q.status === 'loading' || q.status === 'idle' ? (
          <div className="flex items-center gap-2 px-4 py-6 text-sm text-[#807A99]">
            <Icon icon="ph:spinner-gap-bold" width={16} className="animate-spin" aria-hidden />
            Carregando…
          </div>
        ) : q.status === 'error' || !q.data ? (
          <div className="px-4 py-6 text-sm text-[#B4AEC9]">Não foi possível carregar o histórico.</div>
        ) : tab === 'perfil' ? (
          <PerfilTab data={q.data} />
        ) : tab === 'prontuarios' ? (
          <ProntuariosTab prontuarios={q.data.prontuarios} />
        ) : (
          <RegistrarTab draft={draft} onDraftChange={onDraftChange} />
        )}
      </div>
    </div>
  )
}

/* ── Aba Perfil ── */
function PerfilTab({ data }: { data: ProBeneficiarioDetail }) {
  return (
    <div className="flex flex-col gap-5 px-4 py-4">
      <div className="flex items-center gap-3">
        <Avatar initials={data.initials} size={40} palette={data.palette} />
        <div className="min-w-0">
          <p className="font-heading text-sm font-semibold text-[#F2EFF8]">{data.apelido}</p>
          <p className="text-[12px] text-[#B4AEC9]">Desde {data.desde} · {data.totalSessoes} sessão(ões)</p>
        </div>
      </div>

      {data.plano && <RoomPlano plano={data.plano} />}

      <div>
        <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#807A99]">Triagem</h3>
        <ul className="flex flex-col gap-3">
          {data.triagem.map((t, i) => (
            <li key={i}>
              <p className="text-[12px] font-medium text-[#B4AEC9]">{t.pergunta}</p>
              <p className="mt-0.5 text-[13px] text-[#F2EFF8]">{t.resposta}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* Plano terapêutico em leitura (referência durante a sessão). */
function RoomPlano({ plano }: { plano: PlanoTerapeutico }) {
  const risco = riscoOpcao(plano.riscoAtual)
  return (
    <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 font-heading text-[13px] font-semibold text-[#F2EFF8]">
          <Icon icon="ph:target-bold" width={14} className="text-[#A9ABE6]" aria-hidden />
          Plano terapêutico
        </h3>
        <span className="text-[10px] text-[#807A99]">atualizado {plano.atualizadoEm}</span>
      </div>

      {plano.demanda && <p className="mt-2 text-[13px] text-[#DCD4F0]">{plano.demanda}</p>}

      {plano.objetivos.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1">
          {plano.objetivos.map((o) => (
            <li key={o.id} className="flex items-start gap-1.5">
              <Icon
                icon={o.status === 'alcancado' ? 'ph:check-circle-fill' : 'ph:circle-bold'}
                width={14}
                className={`mt-0.5 shrink-0 ${o.status === 'alcancado' ? 'text-[#6FC4A8]' : 'text-[#807A99]'}`}
                aria-hidden
              />
              <span className={`text-[12.5px] ${o.status === 'alcancado' ? 'text-[#807A99] line-through' : 'text-[#DCD4F0]'}`}>{o.texto}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {plano.hipoteseDiagnostica.map((code) => (
          <span key={code} className="rounded-pill bg-[rgba(255,255,255,0.08)] px-2 py-0.5 text-[10.5px] text-[#B4AEC9]">{cidLabel(code)}</span>
        ))}
        {plano.riscoAtual !== 'sem-risco' && risco && (
          <span className="inline-flex items-center gap-1 rounded-pill bg-[rgba(215,90,110,0.2)] px-2 py-0.5 text-[10.5px] font-semibold text-[#ef93a3]">
            <Icon icon="ph:warning-bold" width={10} aria-hidden /> {risco.label}
          </span>
        )}
      </div>
    </div>
  )
}

/* ── Aba Prontuários ── */
function ProntuariosTab({ prontuarios }: { prontuarios: ProntuarioEntry[] }) {
  return (
    <div className="flex flex-col gap-5 px-4 py-4">
      <div>
        <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#807A99]">Histórico de prontuários</h3>
        {prontuarios.length > 0 ? (
          <ul className="flex flex-col gap-2.5">
            {prontuarios.map((p) => (
              <RoomProntuarioCard key={p.id} entry={p} />
            ))}
          </ul>
        ) : (
          <p className="text-[13px] text-[#807A99]">Sem prontuários registrados ainda.</p>
        )}
      </div>
      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-[#807A99]">
        <Icon icon="ph:lock-simple-bold" width={12} className="mt-0.5 shrink-0" aria-hidden />
        Prontuário privado entre você e a plataforma.
      </p>
    </div>
  )
}

function RoomProntuarioCard({ entry }: { entry: ProntuarioEntry }) {
  const risco = entry.risco && entry.risco !== 'sem-risco' ? riscoOpcao(entry.risco) : null
  return (
    <li className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] text-[#807A99]">{entry.date}</p>
        <div className="flex flex-wrap items-center justify-end gap-1">
          {entry.comparecimento && entry.comparecimento !== 'compareceu' && (
            <span className="rounded-pill bg-[rgba(255,255,255,0.08)] px-2 py-0.5 text-[10px] font-semibold text-[#B4AEC9]">
              {comparecimentoLabel(entry.comparecimento)}
            </span>
          )}
          {risco && (
            <span className="inline-flex items-center gap-1 rounded-pill bg-[rgba(215,90,110,0.2)] px-2 py-0.5 text-[10px] font-semibold text-[#ef93a3]">
              <Icon icon="ph:warning-bold" width={10} aria-hidden />
              {risco.label}
            </span>
          )}
        </div>
      </div>
      {entry.conteudo && <p className="mt-1 text-[13px] leading-relaxed text-[#DCD4F0]">{entry.conteudo}</p>}
      <RoomTagRow label="Temas" items={entry.temas} />
      <RoomTagRow label="Técnicas" items={entry.tecnicas} />
      <RoomTagRow label="CID-10" items={entry.cids?.map(cidLabel)} />
      <RoomTagRow label="Encaminhamentos" items={entry.encaminhamentos} />
      {entry.tarefas && (
        <p className="mt-1.5 text-[12px] text-[#B4AEC9]"><span className="font-semibold text-[#DCD4F0]">Tarefas:</span> {entry.tarefas}</p>
      )}
    </li>
  )
}

function RoomTagRow({ label, items }: { label: string; items?: string[] }) {
  if (!items || items.length === 0) return null
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1">
      <span className="mr-0.5 text-[10px] font-medium text-[#807A99]">{label}:</span>
      {items.map((t) => (
        <span key={t} className="rounded-pill bg-[rgba(255,255,255,0.08)] px-2 py-0.5 text-[10.5px] text-[#B4AEC9]">{t}</span>
      ))}
    </div>
  )
}

/* ── Aba Registrar (formulário enxuto, tema escuro) ── */
function RegistrarTab({ draft, onDraftChange }: {
  draft: ProntuarioDraft
  onDraftChange: (patch: Partial<ProntuarioDraft>) => void
}) {
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved'>('idle')
  const firstRender = useRef(true)
  const snapshot = JSON.stringify(draft)
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    setSaved('saving')
    const t = setTimeout(() => setSaved('saved'), 700)
    return () => clearTimeout(t)
  }, [snapshot])

  return (
    <div className="flex flex-col gap-5 px-4 py-4">
      <RoomField label="Comparecimento">
        <RoomPills
          options={COMPARECIMENTO_OPCOES}
          value={draft.comparecimento}
          onChange={(v) => onDraftChange({ comparecimento: v as ProntuarioDraft['comparecimento'] })}
        />
      </RoomField>

      <RoomField label="Temas trabalhados">
        <RoomChips
          options={TEMAS.map((t) => ({ value: t, label: t }))}
          selected={draft.temas}
          onToggle={(v) => onDraftChange({ temas: toggleIn(draft.temas, v) })}
        />
      </RoomField>

      <RoomField label="Evolução clínica">
        <textarea
          value={draft.evolucao}
          onChange={(e) => onDraftChange({ evolucao: e.target.value })}
          placeholder="Como foi a sessão, respostas às intervenções, avanços e dificuldades…"
          aria-label="Evolução clínica"
          className="min-h-[120px] w-full resize-y rounded-lg bg-[#221F44] px-3 py-2.5 text-[13px] leading-relaxed text-[#F2EFF8] outline-none placeholder:text-[#807A99] focus:ring-1 focus:ring-[#6C6FC2]"
        />
      </RoomField>

      <RoomField label="Avaliação de risco">
        <RoomPills
          options={RISCO_OPCOES}
          value={draft.risco}
          onChange={(v) => onDraftChange({ risco: v as ProntuarioDraft['risco'] })}
        />
      </RoomField>

      <RoomField label="Hipótese diagnóstica (CID-10)" hint="Opcional">
        <RoomChips
          options={CID_OPCOES.map((c) => ({ value: c.code, label: c.code, title: cidLabel(c.code) }))}
          selected={draft.cids}
          onToggle={(v) => onDraftChange({ cids: toggleIn(draft.cids, v) })}
        />
      </RoomField>

      <div className="flex h-5 items-center gap-1.5 text-[12px] text-[#807A99]" aria-live="polite">
        {saved === 'saving' && (<><Icon icon="ph:circle-notch-bold" width={12} className="animate-spin" aria-hidden /> Salvando rascunho…</>)}
        {saved === 'saved' && (<><Icon icon="ph:check-bold" width={12} className="text-[#6FC4A8]" aria-hidden /> Rascunho salvo</>)}
      </div>

      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-[#807A99]">
        <Icon icon="ph:info-bold" width={12} className="mt-0.5 shrink-0" aria-hidden />
        Você poderá finalizar (ou salvar como rascunho) ao encerrar a sessão, com campos adicionais.
      </p>
    </div>
  )
}

/* ── Controles escuros da sala ── */
function RoomField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#807A99]">{label}</h3>
        {hint && <span className="text-[10px] text-[#807A99]">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function RoomPills<T extends string>({ options, value, onChange }: {
  options: { value: T; label: string; danger?: boolean }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = o.value === value
        const danger = o.danger && active
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={`rounded-pill px-3 py-1.5 text-[12px] font-medium transition-colors ${
              danger
                ? 'bg-[rgba(215,90,110,0.9)] text-white'
                : active
                  ? 'bg-[#6C6FC2] text-white'
                  : 'bg-[rgba(255,255,255,0.06)] text-[#B4AEC9] hover:bg-[rgba(255,255,255,0.12)]'
            }`}
          >
            {o.danger && <Icon icon="ph:warning-bold" width={11} className="mr-1 inline -translate-y-px" aria-hidden />}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function RoomChips({ options, selected, onToggle }: {
  options: { value: string; label: string; title?: string }[]
  selected: string[]
  onToggle: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = selected.includes(o.value)
        return (
          <button
            key={o.value}
            type="button"
            title={o.title}
            onClick={() => onToggle(o.value)}
            aria-pressed={active}
            className={`rounded-pill px-3 py-1.5 text-[12px] font-medium transition-colors ${
              active
                ? 'bg-[#6C6FC2] text-white'
                : 'bg-[rgba(255,255,255,0.06)] text-[#B4AEC9] hover:bg-[rgba(255,255,255,0.12)]'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
