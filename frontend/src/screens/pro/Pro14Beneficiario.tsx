import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Avatar } from '../../components/Avatar'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { Sheet } from '../../components/Sheet'
import { useService } from '../../hooks/useService'
import { proBeneficiarioService } from '../../services/pro'
import { usePro } from '../../contexts/ProContext'
import { SESSION_BASE_TZ, timezoneOffset, timezoneLabel, convertDateTime } from '../../lib/timezones'
import { formatProximaSessao, formatSessaoRecorrente } from './sessionDisplay'
import { riscoOpcao, comparecimentoLabel, cidLabel } from '../../lib/prontuario'
import { PlanoTerapeuticoCard } from './PlanoTerapeutico'
import type { ProBeneficiarioDetail, ProntuarioEntry } from '../../types'

/* Detalhe do beneficiário em abas: Perfil (dados pessoais + triagem),
   Prontuários (todos) e Sessões. Usado no modal (lista de clientes, agenda,
   home) e na tela cheia (rota /pro/beneficiario/:id, deep-link). */

const TABS = [
  { key: 'perfil', label: 'Perfil' },
  { key: 'prontuarios', label: 'Prontuários' },
  { key: 'sessoes', label: 'Sessões' },
] as const
type TabKey = (typeof TABS)[number]['key']

export function Pro14BeneficiarioContent({ id }: { id: string }) {
  const query = useService(() => proBeneficiarioService.get(id), [id])
  const [tab, setTab] = useState<TabKey>('perfil')

  // Ao trocar de beneficiário, volta para a primeira aba.
  useEffect(() => { setTab('perfil') }, [id])

  if (query.status === 'loading') {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    )
  }
  if (query.status === 'error') return <ErrorState message={query.message} onRetry={query.reload} />
  if (query.status === 'success' && !query.data) {
    return (
      <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-sm text-ink-secondary">
        Beneficiário não encontrado.
      </div>
    )
  }
  if (query.status !== 'success' || !query.data) return null

  const data = query.data
  return (
    <div className="flex flex-col gap-4">
      {/* Abas */}
      <div className="flex gap-1 rounded-lg bg-surface-2 p-1" role="tablist" aria-label="Detalhe do beneficiário">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg px-3 py-2 font-heading text-sm font-semibold transition-all ${
              tab === t.key ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'perfil' && <PerfilTab data={data} />}
      {tab === 'prontuarios' && <ProntuariosTab data={data} />}
      {tab === 'sessoes' && <SessoesTab data={data} />}
    </div>
  )
}

/* ── Aba Perfil: dados pessoais + respostas da triagem ── */
function PerfilTab({ data }: { data: ProBeneficiarioDetail }) {
  const { profile } = usePro()
  const userTz = profile.fusoHorario
  return (
    <div className="flex flex-col gap-4">
      {/* Identificação (sigilo: apelido) */}
      <div className="rounded-lg border border-border bg-surface p-5">
        <div className="flex items-center gap-3">
          <Avatar initials={data.initials} size={52} palette={data.palette} />
          <div className="min-w-0 flex-1">
            <p className="font-heading text-lg font-semibold text-ink">{data.apelido}</p>
            <p className="text-sm text-ink-secondary">Com você desde {data.desde} · {data.totalSessoes} sessão(ões)</p>
          </div>
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-sm bg-surface-2 px-3 py-2 text-[12.5px] text-ink-secondary">
          <Icon icon="ph:shield-check-bold" width={15} className="mt-0.5 shrink-0 text-success" aria-hidden />
          Identificado pelo apelido. O nome real só é exibido em situações legais explícitas.
        </div>
        {data.proximaSessao && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-ink">
            <Icon icon="ph:calendar-bold" width={15} className="text-primary dark:text-primary-300" aria-hidden />
            Próxima sessão: {formatProximaSessao(data.proximaSessao, userTz)}
          </p>
        )}
        {data.sessaoRecorrente && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink">
            <Icon icon="ph:repeat-bold" width={15} className="text-primary dark:text-primary-300" aria-hidden />
            Sessão recorrente: {formatSessaoRecorrente(data.sessaoRecorrente, userTz)}
          </p>
        )}
      </div>

      {/* Plano terapêutico (editável) */}
      <PlanoTerapeuticoCard beneficiarioId={data.id} plano={data.plano} />

      {/* Triagem */}
      <div className="rounded-lg border border-border bg-surface p-5">
        <h2 className="text-[15px] font-semibold text-ink">Respostas da triagem</h2>
        <ul className="mt-3 flex flex-col gap-4">
          {data.triagem.map((t, i) => (
            <li key={i}>
              <p className="text-[13px] font-medium text-ink-secondary">{t.pergunta}</p>
              <p className="mt-0.5 text-sm text-ink">{t.resposta}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ── Aba Prontuários: histórico completo (estruturado por sessão) ── */
function ProntuariosTab({ data }: { data: ProBeneficiarioDetail }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h2 className="text-[15px] font-semibold text-ink">Histórico de prontuários</h2>
      {data.prontuarios.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-3">
          {data.prontuarios.map((p) => (
            <ProntuarioCard key={p.id} entry={p} />
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-ink-secondary">Ainda não há prontuários registrados.</p>
      )}
      <div className="mt-3 flex items-start gap-2 text-[12.5px] text-ink-muted">
        <Icon icon="ph:lock-simple-bold" width={14} className="mt-0.5 shrink-0" aria-hidden />
        Prontuário privado entre você e a plataforma.
      </div>
    </div>
  )
}

/* Cartão de um prontuário com os pontos estruturados registrados na sessão. */
function ProntuarioCard({ entry }: { entry: ProntuarioEntry }) {
  const risco = entry.risco && entry.risco !== 'sem-risco' ? riscoOpcao(entry.risco) : null
  return (
    <li className="rounded-lg border border-border bg-surface-2/50 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[11px] text-ink-muted">{entry.date}</p>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {entry.comparecimento && entry.comparecimento !== 'compareceu' && (
            <span className="rounded-pill bg-surface px-2 py-0.5 text-[10.5px] font-semibold text-ink-secondary">
              {comparecimentoLabel(entry.comparecimento)}
            </span>
          )}
          {risco && (
            <span className="inline-flex items-center gap-1 rounded-pill bg-danger-bg px-2 py-0.5 text-[10.5px] font-semibold text-danger-ink">
              <Icon icon="ph:warning-bold" width={10} aria-hidden />
              {risco.label}
            </span>
          )}
        </div>
      </div>
      {entry.conteudo && <p className="mt-1.5 text-sm leading-relaxed text-ink">{entry.conteudo}</p>}
      <TagRow label="Temas" items={entry.temas} />
      <TagRow label="Técnicas" items={entry.tecnicas} />
      <TagRow label="CID-10" items={entry.cids?.map(cidLabel)} />
      <TagRow label="Encaminhamentos" items={entry.encaminhamentos} />
      {entry.tarefas && (
        <p className="mt-2 text-[12.5px] text-ink-secondary">
          <span className="font-semibold text-ink">Tarefas:</span> {entry.tarefas}
        </p>
      )}
    </li>
  )
}

function TagRow({ label, items }: { label: string; items?: string[] }) {
  if (!items || items.length === 0) return null
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1">
      <span className="mr-0.5 text-[11px] font-medium text-ink-muted">{label}:</span>
      {items.map((t) => (
        <span key={t} className="rounded-pill bg-surface px-2 py-0.5 text-[11px] text-ink-secondary">{t}</span>
      ))}
    </div>
  )
}

/* Converte data (dd/mm/aaaa) + hora do fuso base para o fuso do profissional. */
function historicoNoFuso(dataBR: string, hora: string, userTz: string): { data: string; hora: string } {
  const from = timezoneOffset(SESSION_BASE_TZ)
  const to = timezoneOffset(userTz)
  if (from === to) return { data: dataBR, hora }
  const [d, m, y] = dataBR.split('/')
  const c = convertDateTime(`${y}-${m}-${d}`, hora, from, to)
  const [cy, cm, cd] = c.dateISO.split('-')
  return { data: `${cd}/${cm}/${cy}`, hora: c.time }
}

/* ── Aba Sessões: histórico de sessões (horários no fuso do profissional) ── */
function SessoesTab({ data }: { data: ProBeneficiarioDetail }) {
  const { profile } = usePro()
  const userTz = profile.fusoHorario
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h2 className="text-[15px] font-semibold text-ink">Histórico de sessões</h2>
      {data.historicoSessoes.length > 0 ? (
        <>
          <ul className="mt-3 flex flex-col divide-y divide-border">
            {data.historicoSessoes.map((s) => {
              const conv = historicoNoFuso(s.data, s.hora, userTz)
              return (
                <li key={s.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="flex items-center gap-2 text-sm text-ink">
                    <Icon icon="ph:calendar-blank-bold" width={15} className="text-ink-muted" aria-hidden />
                    {conv.data} · {conv.hora}
                  </span>
                  <SessaoStatusBadge status={s.status} />
                </li>
              )
            })}
          </ul>
          <p className="mt-3 flex items-center gap-1.5 text-[12.5px] text-ink-muted">
            <Icon icon="ph:globe-bold" width={13} className="shrink-0" aria-hidden />
            Horários no seu fuso · {timezoneLabel(userTz)}
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-ink-secondary">Ainda não há sessões registradas.</p>
      )}
    </div>
  )
}

const sessaoStatusConfig = {
  realizada: { label: 'Realizada', icon: 'ph:check-circle-bold', className: 'bg-success-bg text-success' },
  cancelada: { label: 'Cancelada', icon: 'ph:x-circle-bold', className: 'bg-surface-2 text-ink-muted' },
  falta: { label: 'Falta', icon: 'ph:warning-circle-bold', className: 'bg-danger-bg text-danger-ink' },
} as const

function SessaoStatusBadge({ status }: { status: 'realizada' | 'cancelada' | 'falta' }) {
  const cfg = sessaoStatusConfig[status]
  return (
    <span className={`flex shrink-0 items-center gap-1 rounded-pill px-2.5 py-1 text-[12px] font-semibold ${cfg.className}`}>
      <Icon icon={cfg.icon} width={13} aria-hidden />
      {cfg.label}
    </span>
  )
}

/* Modal reutilizável do detalhe do beneficiário (abre nas telas de clientes,
   agenda e home). Abre quando `id` é definido. */
export function BeneficiarioModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  return (
    <Sheet
      open={id !== null}
      onClose={onClose}
      title="Beneficiário"
      icon="ph:user-circle-bold"
      size="md"
    >
      {id && (
        <div className="px-5 py-6 lg:px-6">
          <Pro14BeneficiarioContent id={id} />
        </div>
      )}
    </Sheet>
  )
}

/* Tela cheia (deep-link /pro/beneficiario/:id). */
export function Pro14Beneficiario() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className="mx-auto max-w-2xl px-5 lg:px-8 pt-6 lg:pt-10 pb-10">
        <header className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover"
          >
            <Icon icon="ph:arrow-left-bold" width={18} aria-hidden />
          </button>
          <h1 className="font-heading text-lg font-semibold text-ink">Beneficiário</h1>
        </header>

        <Pro14BeneficiarioContent id={id ?? ''} />
      </div>
    </div>
  )
}
