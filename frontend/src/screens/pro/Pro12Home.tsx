import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { ProTopBar } from '../../components/ProTopBar'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import { OptionCard } from '../../components/OptionCard'
import { StatTile } from '../../components/StatTile'
import { ProfileStrengthCard } from '../../components/ProfileStrengthCard'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { Sheet } from '../../components/Sheet'
import { EntrarSessaoButton } from '../../components/EntrarSessaoButton'
import { SessionStatusBadge } from '../../components/SessionStatusBadge'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { usePro } from '../../contexts/ProContext'
import { proSessionService, proFinanceService, proQualityService } from '../../services/pro'
import { PRO_TODAY } from '../../data/proMock'
import { BeneficiarioModal } from './Pro14Beneficiario'
import { EditarSessao } from './EditarSessao'
import { Pro11AgendaContent } from './Pro11Agenda'
import { UniversidadeHighlights } from './UniversidadeHighlights'
import { ProximaLivePanel } from './ProximaLivePanel'
import { isLive, isPastSession } from './sessionDisplay'
import type { ProSession } from '../../types'

const qColor = (s: number) => (s >= 80 ? 'bg-success' : s >= 60 ? 'bg-warning-ink' : 'bg-danger')

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const ddmm = (d: string) => d.split('-').slice(1).reverse().join('/')
const PT_WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const relativeDay = (d: string) => {
  if (d === PRO_TODAY) return 'Hoje'
  const diff = Math.round((new Date(`${d}T00:00:00`).getTime() - new Date(`${PRO_TODAY}T00:00:00`).getTime()) / 86400000)
  if (diff === 1) return 'Amanhã'
  return PT_WEEKDAYS[new Date(`${d}T00:00:00`).getDay()]
}

export function Pro12Home() {
  const { profile, strength } = usePro()
  const navigate = useNavigate()
  const [historicoId, setHistoricoId] = useState<string | null>(null)
  const [editar, setEditar] = useState<ProSession | null>(null)
  const [dispOpen, setDispOpen] = useState(false)
  const sessions = useService(() => proSessionService.list(), [])
  const finance = useService(() => proFinanceService.summary(), [])
  const quality = useService(() => proQualityService.scores(), [])

  const firstName = profile.name.replace(/^(Dra?\.|Dr\.)\s*/i, '').split(' ')[0]
  // Sessões de hoje em andamento ou futuras (a ao vivo conta como atual), em ordem de horário.
  const proximas = sessions.status === 'success'
    ? sessions.data
        .filter((s) => s.date === PRO_TODAY && (s.status === 'scheduled' || s.status === 'confirmed') && (isLive(s) || !isPastSession(s)))
        .sort((a, b) => a.time.localeCompare(b.time))
    : []
  const proxima = proximas[0]
  const seguinte = proximas[1]

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <ProTopBar />

        <div className="pt-2 pb-6 lg:pt-9 lg:pb-6">
          <h1 className="text-[26px] lg:text-[32px] font-medium tracking-[-0.02em] text-ink">Oi, {firstName}.</h1>
          <p className="mt-0.5 text-[15px] text-ink-secondary">Que bom ter você por aqui.</p>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:items-start">
          {/* Coluna principal */}
          <div className="flex flex-col gap-5">
            {/* Próxima sessão — padrão do card do colaborador */}
            <section>
              {sessions.status === 'loading' && <Skeleton className="h-40 w-full rounded-lg" />}
              {sessions.status === 'error' && <ErrorState message={sessions.message} onRetry={sessions.reload} />}
              {sessions.status === 'success' && (
                proxima ? (
                  <div className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-5">
                    {/* Eyebrow */}
                    <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                      Próxima sessão
                    </span>

                    {/* Beneficiário + horário em destaque à direita */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar initials={proxima.beneficiarioInitials} size={48} palette={proxima.beneficiarioPalette} />
                        <div className="min-w-0">
                          <p className="truncate text-[17px] font-semibold leading-snug text-ink">{proxima.beneficiarioApelido}</p>
                          <p className="mt-0.5 text-[13px] text-ink-secondary">{relativeDay(proxima.date)}, {ddmm(proxima.date)}</p>
                          <SessionStatusBadge status={proxima.status} className="mt-1.5" />
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[30px] font-bold leading-none tracking-[-0.02em] text-ink">{proxima.time}</p>
                      </div>
                    </div>

                    {/* Ações — mobile: Editar+Histórico dividem a largura, Entrar full embaixo */}
                    <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                      <Button variant="secondary" iconLeft="ph:pencil-simple-bold" className="flex-1 sm:flex-none" onClick={() => setEditar(proxima)}>Editar</Button>
                      <Button variant="secondary" iconLeft="ph:clock-counter-clockwise-bold" className="flex-1 sm:flex-none" onClick={() => setHistoricoId(proxima.beneficiarioId)}>Histórico</Button>
                      <EntrarSessaoButton label="Entrar na sala" className="w-full sm:w-auto sm:flex-1" onClick={() => navigate(`/pro/sessao/${proxima.id}`)} live={proxima.salaAbertaSeg !== undefined} openedSeconds={proxima.salaAbertaSeg ?? 0} />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-surface p-5 text-sm text-ink-secondary">
                    Nenhuma sessão agendada. Que tal abrir mais horários na sua agenda?
                  </div>
                )
              )}
            </section>

            {/* Sessão seguinte (menos destaque) + link para a agenda */}
            {sessions.status === 'success' && (
              <section>
                {seguinte && (
                  <div className="rounded-lg border border-border bg-surface px-4 py-3">
                    <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">Sessão seguinte</p>
                    <div className="flex items-center gap-3">
                      <Avatar initials={seguinte.beneficiarioInitials} size={36} palette={seguinte.beneficiarioPalette} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{seguinte.beneficiarioApelido}</p>
                        <p className="text-[13px] text-ink-secondary">{relativeDay(seguinte.date)}, {ddmm(seguinte.date)} · {seguinte.time}</p>
                      </div>
                      <SessionStatusBadge status={seguinte.status} />
                    </div>
                  </div>
                )}
                <Link
                  to="/pro/agenda"
                  className="mt-3 flex items-center gap-1 font-heading text-sm font-medium text-primary transition-colors hover:text-primary-600 dark:text-primary-300"
                >
                  Ver agenda completa
                  <Icon icon="ph:arrow-right-bold" width={14} aria-hidden />
                </Link>
              </section>
            )}

            {/* Atalhos */}
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-ink">Atalhos</h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <OptionCard layout="shortcut" icon="ph:sliders-horizontal-bold" label="Disponibilidade" desc="Defina seus horários de atendimento e plantão" onClick={() => setDispOpen(true)} />
                <OptionCard layout="shortcut" icon="ph:wallet-bold" label="Financeiro" desc="Recebimentos e antecipação" to="/pro/financeiro" />
                <OptionCard layout="shortcut" icon="ph:broadcast-bold" label="Lives YNA" desc="Rounds ao vivo e replays" to="/pro/universidade/lives" />
              </div>
            </section>

            {/* Destaques da Universidade YNA */}
            <UniversidadeHighlights />
          </div>

          {/* Coluna lateral */}
          <div className="mt-6 flex flex-col gap-5 lg:mt-0">
            <ProfileStrengthCard strength={strength} />

            {/* Seu mês — financeiro */}
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-ink">Seu mês</h2>
              {finance.status === 'loading' && <Skeleton className="h-24 w-full rounded-lg" />}
              {finance.status === 'error' && <ErrorState message={finance.message} onRetry={finance.reload} />}
              {finance.status === 'success' && (
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <StatTile icon="ph:currency-circle-dollar-bold" value={brl(finance.data.aReceber)} label="A receber" />
                    <StatTile icon="ph:calendar-check-bold" value={String(finance.data.sessoesNoMes)} label="Sessões no mês" />
                  </div>
                  <Button variant="ghost" fullWidth iconRight="ph:arrow-right-bold" onClick={() => navigate('/pro/financeiro')}>
                    Ver financeiro
                  </Button>
                </div>
              )}
            </section>

            {/* Próxima live YNA */}
            <ProximaLivePanel />

            {/* Indicadores de qualidade */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Icon icon="ph:seal-check-bold" width={16} className="text-ink-secondary" aria-hidden />
                <h2 className="text-[15px] font-semibold text-ink">Qualidade</h2>
                <span className="group relative ml-auto inline-flex">
                  <button
                    type="button"
                    aria-label="Como a qualidade é calculada"
                    className="flex h-6 w-6 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
                  >
                    <Icon icon="ph:question-bold" width={14} aria-hidden />
                  </button>
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute right-0 top-[calc(100%+6px)] z-20 w-64 rounded-lg border border-border bg-surface p-3 text-left text-[12px] leading-relaxed text-ink-secondary opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                  >
                    Cada indicador é uma nota de 0 a 100 calculada pela YNA a partir do seu histórico na plataforma — assiduidade, pontualidade, volume de atendimentos, disponibilidade aberta e participação na Universidade YNA. Atualizado periodicamente.
                  </span>
                </span>
              </div>
              {quality.status === 'loading' && <Skeleton className="h-44 w-full rounded-lg" />}
              {quality.status === 'error' && <ErrorState message={quality.message} onRetry={quality.reload} />}
              {quality.status === 'success' && (
                <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
                  <p className="text-[13px] leading-relaxed text-ink-secondary">
                    Seus indicadores de desempenho como profissional na plataforma YNA.
                  </p>
                  {quality.data.map((q) => (
                    <div key={q.criterio}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] text-ink">{q.criterio}</span>
                        <span className="font-mono text-[12px] font-semibold text-ink-secondary">{q.score}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-pill bg-surface-2">
                        <div className={`h-full rounded-pill ${qColor(q.score)}`} style={{ width: `${q.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <BeneficiarioModal id={historicoId} onClose={() => setHistoricoId(null)} />

      <Sheet
        open={editar !== null}
        onClose={() => setEditar(null)}
        title="Editar sessão"
        icon="ph:pencil-simple-bold"
        size="md"
      >
        {editar && <EditarSessao session={editar} onClose={() => setEditar(null)} onChanged={sessions.reload} />}
      </Sheet>

      <Sheet
        open={dispOpen}
        onClose={() => setDispOpen(false)}
        title="Disponibilidade"
        icon="ph:sliders-horizontal-bold"
        size="lg"
      >
        {dispOpen && <Pro11AgendaContent onClose={() => setDispOpen(false)} />}
      </Sheet>
    </div>
  )
}
