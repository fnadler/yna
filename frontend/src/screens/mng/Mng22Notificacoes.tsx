import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { MngTopBar } from '../../components/MngTopBar'
import { PageHeader } from '../../components/PageHeader'
import { PAGE_MAX_W } from '../../lib/layout'
import { useMng } from '../../contexts/MngContext'
import type { MngNotificacao } from '../../types'

/* MNG-22 — Notificações do backoffice. Cada evento leva à tela de detalhe
   correspondente (com o filtro certo) e é marcado como lido ao clicar. */
export function Mng22Notificacoes() {
  const { notificacoes, marcarLida } = useMng()
  const navigate = useNavigate()

  const abrir = (n: MngNotificacao) => { marcarLida(n.id); navigate(n.to) }

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MngTopBar />
        <PageHeader title="Notificações" subtitle="Eventos que precisam da sua atenção." className="mt-2 lg:mt-0" />

        <div className="flex flex-col gap-2">
          {notificacoes.map((n) => (
            <button
              key={n.id}
              onClick={() => abrir(n)}
              className={`flex items-start gap-3 rounded-lg border px-4 py-4 text-left transition-colors hover:border-border-strong ${n.lida ? 'border-border bg-surface' : 'border-primary/30 bg-primary-50 dark:bg-primary-50/10'}`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-pill ${n.tipo === 'nr1' || n.tipo === 'sessao' ? 'bg-danger-bg text-danger-ink' : 'bg-surface text-primary dark:text-primary-300'}`}>
                <Icon icon={n.icon} width={20} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-heading text-sm font-semibold text-ink">{n.titulo}</p>
                  {!n.lida && <span className="h-2 w-2 shrink-0 rounded-pill bg-primary" aria-label="Não lida" />}
                </div>
                <p className="mt-0.5 text-[13px] leading-relaxed text-ink-secondary">{n.descricao}</p>
                <p className="mt-1 font-mono text-[11px] text-ink-muted">{n.quando}</p>
              </div>
              <Icon icon="ph:caret-right-bold" width={16} className="mt-1 shrink-0 text-ink-muted" aria-hidden />
            </button>
          ))}
          {notificacoes.length === 0 && (
            <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-sm text-ink-secondary">Nenhuma notificação.</div>
          )}
        </div>
      </div>
    </div>
  )
}
