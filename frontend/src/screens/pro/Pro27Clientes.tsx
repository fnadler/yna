import { useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { ProTopBar } from '../../components/ProTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Avatar } from '../../components/Avatar'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { proBeneficiarioService } from '../../services/pro'
import { usePro } from '../../contexts/ProContext'
import { BeneficiarioModal } from './Pro14Beneficiario'
import { formatProximaSessao, formatSessaoRecorrente } from './sessionDisplay'
import type { ProBeneficiarioDetail } from '../../types'

/* PRO-27 — Lista de clientes (beneficiários) que o profissional atende, com
   filtro por apelido. Cada item abre o detalhe em modal (abas). */

function ClienteCard({ b, userTz, onOpen }: { b: ProBeneficiarioDetail; userTz: string; onOpen: () => void }) {
  const agenda = b.sessaoRecorrente
    ? formatSessaoRecorrente(b.sessaoRecorrente, userTz)
    : b.proximaSessao
      ? formatProximaSessao(b.proximaSessao, userTz)
      : null
  return (
    <button
      onClick={onOpen}
      className="flex w-full items-center gap-4 rounded-lg border border-border bg-surface p-4 text-left transition-all hover:border-border-strong hover:bg-surface-hover"
    >
      <Avatar initials={b.initials} size={48} palette={b.palette} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-heading text-[15px] font-semibold text-ink">{b.apelido}</p>
        {agenda && (
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-[13px] text-ink-secondary">
            <Icon
              icon={b.sessaoRecorrente ? 'ph:repeat-bold' : 'ph:calendar-bold'}
              width={14}
              className="shrink-0 text-primary dark:text-primary-300"
              aria-hidden
            />
            {agenda}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="hidden text-[13px] text-ink-muted sm:inline">
          {b.totalSessoes} {b.totalSessoes === 1 ? 'sessão' : 'sessões'}
        </span>
        <Icon icon="ph:caret-right-bold" width={16} className="text-ink-muted" aria-hidden />
      </div>
    </button>
  )
}

export function Pro27Clientes() {
  const { profile } = usePro()
  const userTz = profile.fusoHorario
  const query = useService(() => proBeneficiarioService.list(), [])
  const [busca, setBusca] = useState('')
  const [detalheId, setDetalheId] = useState<string | null>(null)

  const filtrados = useMemo(() => {
    if (query.status !== 'success') return []
    const termo = busca.trim().toLowerCase()
    if (!termo) return query.data
    return query.data.filter((b) => b.apelido.toLowerCase().includes(termo))
  }, [query, busca])

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <ProTopBar />
        <PageHeader
          title="Clientes"
          subtitle="Os beneficiários que você atende."
          className="mt-2 lg:mt-0"
        />

        {/* Busca por apelido */}
        <div className="relative mb-4">
          <Icon
            icon="ph:magnifying-glass-bold"
            width={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
            aria-hidden
          />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome…"
            aria-label="Buscar cliente por nome"
            className="w-full rounded-lg border border-border bg-surface py-3 pl-11 pr-4 text-[15px] text-ink placeholder:text-ink-muted transition-colors focus:border-primary focus:outline-none"
          />
        </div>

        {query.status === 'loading' && (
          <div className="flex flex-col gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[76px] w-full rounded-lg" />
            ))}
          </div>
        )}

        {query.status === 'error' && <ErrorState message={query.message} onRetry={query.reload} />}

        {query.status === 'success' && (
          filtrados.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {filtrados.map((b) => (
                <li key={b.id}>
                  <ClienteCard b={b} userTz={userTz} onOpen={() => setDetalheId(b.id)} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-border bg-surface px-4 py-12 text-center">
              <Icon icon="ph:users-three-bold" width={32} className="mx-auto text-ink-muted" aria-hidden />
              <p className="mt-3 text-sm text-ink-secondary">
                {busca.trim()
                  ? `Nenhum cliente encontrado para "${busca.trim()}".`
                  : 'Você ainda não atende nenhum cliente.'}
              </p>
            </div>
          )
        )}
      </div>

      <BeneficiarioModal id={detalheId} onClose={() => setDetalheId(null)} />
    </div>
  )
}
