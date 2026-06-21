import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Avatar } from '../../components/Avatar'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { useService } from '../../hooks/useService'
import { proBeneficiarioService } from '../../services/pro'

/* Conteúdo do detalhe do beneficiário (identificação, triagem, histórico de
   prontuários). Usado tanto na tela cheia (PRO-14) quanto em modal a partir
   da home (botão "Ver histórico"). */
export function Pro14BeneficiarioContent({ id }: { id: string }) {
  const query = useService(() => proBeneficiarioService.get(id), [id])

  if (query.status === 'loading') {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
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
            Próxima sessão: {data.proximaSessao}
          </p>
        )}
      </div>

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

      {/* Histórico de prontuários */}
      <div className="rounded-lg border border-border bg-surface p-5">
        <h2 className="text-[15px] font-semibold text-ink">Histórico de prontuários</h2>
        {data.prontuarios.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-3">
            {data.prontuarios.map((p) => (
              <li key={p.id} className="border-l-2 border-primary-200 pl-3">
                <p className="font-mono text-[11px] text-ink-muted">{p.date}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-ink">{p.conteudo}</p>
              </li>
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
    </div>
  )
}

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
