import { useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { ProTopBar } from '../../components/ProTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { proModeloDocService } from '../../services/pro'

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/* PRO-32 — Modelos de documentos. Lista os modelos disponibilizados pela YNA
   para o tipo do profissional, para download/impressão no dia a dia. */
export function Pro32Documentos() {
  const modelos = useService(() => proModeloDocService.list(), [])
  const [busca, setBusca] = useState('')

  const dados = modelos.status === 'success' ? modelos.data : []
  const lista = useMemo(() => {
    const q = norm(busca.trim())
    return q ? dados.filter((m) => norm(m.nome).includes(q) || norm(m.descricao).includes(q)) : dados
  }, [dados, busca])

  const imprimir = () => window.print()

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <ProTopBar />
        <PageHeader title="Modelos de documentos" subtitle="Modelos prontos para usar no seu dia a dia." className="mt-2 lg:mt-0" />

        {modelos.status === 'loading' && <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}</div>}
        {modelos.status === 'error' && <ErrorState message={modelos.message} onRetry={modelos.reload} />}
        {modelos.status === 'success' && (
          <>
            {/* Busca */}
            <div className="relative">
              <Icon icon="ph:magnifying-glass-bold" width={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden />
              <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar modelo…"
                className="w-full rounded border-[1.5px] border-border bg-surface py-2.5 pl-9 pr-4 text-sm text-ink outline-none focus:border-primary" />
            </div>

            {/* Lista de modelos */}
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {lista.map((m) => (
                <div key={m.id} className="flex flex-col rounded-lg border border-border bg-surface p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300"><Icon icon={m.icon} width={22} aria-hidden /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-heading text-sm font-semibold text-ink">{m.nome}</p>
                        <span className="shrink-0 rounded-pill bg-surface-2 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-ink-secondary">{m.formato}</span>
                      </div>
                      <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-secondary">{m.descricao}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" iconLeft="ph:download-simple-bold" onClick={() => { /* download simulado */ }}>Baixar</Button>
                    <Button size="sm" variant="secondary" iconLeft="ph:printer-bold" onClick={imprimir}>Imprimir</Button>
                  </div>
                </div>
              ))}
              {lista.length === 0 && <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-sm text-ink-secondary sm:col-span-2">Nenhum modelo encontrado.</div>}
            </div>

            <p className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-surface-2/60 px-4 py-3 text-[12.5px] text-ink-secondary">
              <Icon icon="ph:info-bold" width={15} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
              Os modelos são disponibilizados pela YNA. Preencha e adeque cada documento à sua conduta e ao caso do paciente.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
