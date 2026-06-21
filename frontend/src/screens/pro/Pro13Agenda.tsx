import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProTopBar } from '../../components/ProTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { Sheet } from '../../components/Sheet'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { proSessionService } from '../../services/pro'
import { ProntuarioForm } from './Pro16Prontuario'
import type { ProSession } from '../../types'

type Tab = 'proximas' | 'realizadas'

function SessionRow({ s, tab, onEnter, onProntuario, onVer }: {
  s: ProSession; tab: Tab; onEnter: () => void; onProntuario: () => void; onVer: () => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
      <Avatar initials={s.beneficiarioInitials} size={40} palette={s.beneficiarioPalette} />
      <button onClick={onVer} className="min-w-0 flex-1 text-left">
        <p className="font-heading text-sm font-semibold text-ink">{s.beneficiarioApelido}</p>
        <p className="text-[13px] text-ink-secondary">{s.weekday}, {s.date.split('-').slice(1).reverse().join('/')} às {s.time}</p>
      </button>
      {tab === 'proximas' ? (
        <Button size="sm" iconLeft="ph:video-camera-bold" onClick={onEnter}>Entrar</Button>
      ) : s.prontuarioPendente ? (
        <Button size="sm" variant="secondary" iconLeft="ph:note-pencil-bold" onClick={onProntuario}>Prontuário</Button>
      ) : (
        <Badge tone="success" icon="ph:check-bold">Concluída</Badge>
      )}
    </div>
  )
}

export function Pro13Agenda() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('proximas')
  const [prontuarioId, setProntuarioId] = useState<string | null>(null)
  const sessions = useService(() => proSessionService.list(), [])

  const all = sessions.status === 'success' ? sessions.data : []
  const proximas = all.filter((s) => s.status === 'scheduled')
  const realizadas = all.filter((s) => s.status === 'completed')
  const lista = tab === 'proximas' ? proximas : realizadas

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <ProTopBar />
        <PageHeader title="Agenda" subtitle="Suas sessões — entre na sala em um clique." className="mt-2 lg:mt-0" />

        {/* Tabs */}
        <div className="mb-5 flex gap-1 rounded-lg bg-surface-2 p-1">
          {([['proximas', 'Próximas'], ['realizadas', 'Realizadas']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 rounded-lg py-2.5 font-heading text-sm font-semibold transition-all ${
                tab === key ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {sessions.status === 'loading' && (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
          </div>
        )}
        {sessions.status === 'error' && <ErrorState message={sessions.message} onRetry={sessions.reload} />}
        {sessions.status === 'success' && (
          lista.length > 0 ? (
            <div className="flex flex-col gap-2">
              {lista.map((s) => (
                <SessionRow
                  key={s.id}
                  s={s}
                  tab={tab}
                  onEnter={() => navigate(`/pro/sessao/${s.id}`)}
                  onProntuario={() => setProntuarioId(s.id)}
                  onVer={() => navigate(`/pro/beneficiario/${s.beneficiarioId}`)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-sm text-ink-secondary">
              {tab === 'proximas' ? 'Nenhuma sessão agendada por enquanto.' : 'Nenhuma sessão realizada ainda.'}
            </div>
          )
        )}
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
    </div>
  )
}
