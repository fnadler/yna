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
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { usePro } from '../../contexts/ProContext'
import { proSessionService, proFinanceService } from '../../services/pro'
import { ProntuarioForm } from './Pro16Prontuario'
import { Pro14BeneficiarioContent } from './Pro14Beneficiario'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export function Pro12Home() {
  const { profile, strength } = usePro()
  const navigate = useNavigate()
  const [prontuarioId, setProntuarioId] = useState<string | null>(null)
  const [historicoId, setHistoricoId] = useState<string | null>(null)
  const sessions = useService(() => proSessionService.list(), [])
  const finance = useService(() => proFinanceService.summary(), [])

  const firstName = profile.name.replace(/^(Dra?\.|Dr\.)\s*/i, '').split(' ')[0]
  const proximas = sessions.status === 'success' ? sessions.data.filter((s) => s.status === 'scheduled') : []
  const pendentes = sessions.status === 'success' ? sessions.data.filter((s) => s.prontuarioPendente) : []
  const proxima = proximas[0]

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
                          <p className="mt-0.5 text-[13px] text-ink-secondary">{proxima.weekday}, {proxima.date.split('-').slice(1).reverse().join('/')}</p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[30px] font-bold leading-none tracking-[-0.02em] text-ink">{proxima.time}</p>
                      </div>
                    </div>

                    {/* Ações: secundário (Ver histórico) à esquerda, primário (Entrar) à direita */}
                    <div className="flex gap-2">
                      <Button variant="secondary" iconLeft="ph:clock-counter-clockwise-bold" onClick={() => setHistoricoId(proxima.beneficiarioId)}>Ver histórico</Button>
                      <Button iconLeft="ph:video-camera-bold" className="flex-1" onClick={() => navigate(`/pro/sessao/${proxima.id}`)}>Entrar na sala</Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-surface p-5 text-sm text-ink-secondary">
                    Nenhuma sessão agendada. Que tal abrir mais horários na sua agenda?
                  </div>
                )
              )}
            </section>

            {/* Pendências: prontuários em aberto */}
            {pendentes.length > 0 && (
              <section>
                <h2 className="mb-3 text-[15px] font-semibold text-ink">Pendências</h2>
                <div className="flex flex-col gap-2">
                  {pendentes.map((s) => (
                    <OptionCard
                      key={s.id}
                      variant="warning"
                      icon="ph:note-pencil-bold"
                      label={`Prontuário pendente — ${s.beneficiarioApelido}`}
                      desc={`Sessão de ${s.date.split('-').slice(1).reverse().join('/')} · finalize para concluir`}
                      onClick={() => setProntuarioId(s.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Seu mês — financeiro (movido para a coluna principal) */}
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

            {/* Atalhos */}
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-ink">Atalhos</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <OptionCard layout="shortcut" icon="ph:calendar-bold" label="Agenda" desc="Suas sessões" to="/pro/agenda" />
                <OptionCard layout="shortcut" icon="ph:lifebuoy-bold" label="Plantão" desc="Turnos de emergência" to="/pro/plantao" />
                <OptionCard layout="shortcut" icon="ph:graduation-cap-bold" label="Universidade" desc="Trilhas e lives" to="/pro/universidade" />
                <OptionCard layout="shortcut" icon="ph:wallet-bold" label="Financeiro" desc="Recebimentos" to="/pro/financeiro" />
                <OptionCard layout="shortcut" icon="ph:seal-check-bold" label="Qualidade" desc="Seus indicadores" to="/pro/qualidade" />
              </div>
            </section>
          </div>

          {/* Coluna lateral */}
          <div className="mt-6 flex flex-col gap-5 lg:mt-0">
            <ProfileStrengthCard strength={strength} />

            {/* Sessões de hoje (exceto a que está em destaque) */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Icon icon="ph:calendar-bold" width={16} className="text-ink-secondary" aria-hidden />
                <h2 className="text-[15px] font-semibold text-ink">Sessões de hoje</h2>
              </div>
              {sessions.status === 'success' && proximas.length > 1 ? (
                <div className="flex flex-col gap-2">
                  {proximas.slice(1).map((s) => (
                    <div key={s.id} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
                      <div className="flex items-center gap-3">
                        <Avatar initials={s.beneficiarioInitials} size={38} palette={s.beneficiarioPalette} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">{s.beneficiarioApelido}</p>
                          <p className="text-[13px] text-ink-secondary">{s.weekday}, {s.date.split('-').slice(1).reverse().join('/')} · {s.time}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" iconLeft="ph:pencil-simple-bold" className="flex-1" onClick={() => navigate('/pro/agenda')}>Editar</Button>
                        <Button size="sm" variant="secondary" iconLeft="ph:clock-counter-clockwise-bold" className="flex-1" onClick={() => setHistoricoId(s.beneficiarioId)}>Ver histórico</Button>
                      </div>
                    </div>
                  ))}
                  <Link
                    to="/pro/agenda"
                    className="mt-1 flex items-center gap-1 font-heading text-sm font-medium text-primary transition-colors hover:text-primary-600 dark:text-primary-300"
                  >
                    Ver agenda completa
                    <Icon icon="ph:arrow-right-bold" width={14} aria-hidden />
                  </Link>
                </div>
              ) : (
                <p className="rounded-lg border border-border bg-surface px-4 py-5 text-sm text-ink-secondary">
                  Nenhuma outra sessão hoje.
                </p>
              )}
            </section>
          </div>
        </div>
      </div>

      <Sheet
        open={prontuarioId !== null}
        onClose={() => setProntuarioId(null)}
        title="Registro de prontuário"
        icon="ph:note-pencil-bold"
        size="md"
      >
        {prontuarioId && (
          <ProntuarioForm
            sessionId={prontuarioId}
            onDone={() => { setProntuarioId(null); sessions.reload() }}
            onCancel={() => setProntuarioId(null)}
          />
        )}
      </Sheet>

      <Sheet
        open={historicoId !== null}
        onClose={() => setHistoricoId(null)}
        title="Histórico do beneficiário"
        icon="ph:user-circle-bold"
        size="md"
      >
        {historicoId && (
          <div className="px-5 py-6 lg:px-6">
            <Pro14BeneficiarioContent id={historicoId} />
          </div>
        )}
      </Sheet>
    </div>
  )
}
