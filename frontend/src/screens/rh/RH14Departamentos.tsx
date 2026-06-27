import { useState } from 'react'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Sheet } from '../../components/Sheet'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { useRh } from '../../contexts/RhContext'
import { rhDepartamentoService } from '../../services/rh'

/* RH-14 — Estrutura de departamentos (RF-RH-03.1). Base dos recortes do mapa
   de calor NR-1. Apenas Master edita a estrutura (RN-RH-03.1). */

const ANON_MIN = 4

export function RH14Departamentos() {
  const { isMaster } = useRh()
  const deps = useService(() => rhDepartamentoService.list(), [])
  const [novoOpen, setNovoOpen] = useState(false)
  const [nome, setNome] = useState('')

  const criar = async () => {
    if (!nome.trim()) return
    await rhDepartamentoService.create(nome.trim())
    setNome('')
    setNovoOpen(false)
    deps.reload()
  }

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />
        <PageHeader
          title="Departamentos"
          subtitle="A árvore que organiza os recortes do mapa de calor."
          className="mt-2 lg:mt-0"
          action={isMaster ? <Button iconLeft="ph:plus-bold" onClick={() => setNovoOpen(true)}>Novo</Button> : undefined}
        />

        {deps.status === 'loading' && (
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[64px] w-full rounded-lg" />)}
          </div>
        )}
        {deps.status === 'error' && <ErrorState message={deps.message} onRetry={deps.reload} />}

        {deps.status === 'success' && (
          <ul className="flex flex-col gap-2">
            {deps.data.map((d) => {
              const anon = d.beneficiarios < ANON_MIN
              return (
                <li key={d.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
                    <Icon icon="ph:buildings-bold" width={20} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-heading text-sm font-semibold text-ink">{d.nome}</p>
                    <p className="text-[12px] text-ink-secondary">{d.beneficiarios} beneficiário(s)</p>
                  </div>
                  {anon && (
                    <span className="hidden items-center gap-1 rounded-pill bg-surface-2 px-2.5 py-1 text-[11px] text-ink-muted sm:inline-flex">
                      <Icon icon="ph:lock-simple-bold" width={11} aria-hidden />
                      Anonimizado
                    </span>
                  )}
                  {isMaster && (
                    <button
                      onClick={() => rhDepartamentoService.remove(d.id).then(() => deps.reload())}
                      aria-label={`Remover ${d.nome}`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill text-ink-muted transition-colors hover:bg-danger-bg hover:text-danger"
                    >
                      <Icon icon="ph:trash-bold" width={16} aria-hidden />
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        <div className="mt-5 flex gap-3 rounded-lg border border-border bg-surface-2 p-4">
          <Icon icon="ph:info-bold" width={20} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
          <p className="text-[12px] leading-relaxed text-ink-secondary">
            Departamentos com menos de {ANON_MIN} beneficiários são automaticamente agrupados nos
            relatórios e no mapa de calor, para que ninguém possa ser individualizado.
          </p>
        </div>
      </div>

      <Sheet open={novoOpen} onClose={() => setNovoOpen(false)} title="Novo departamento" icon="ph:tree-structure-bold" size="md">
        <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
          <Input label="Nome do departamento" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Trading & Mercados" />
          <Button fullWidth disabled={!nome.trim()} iconRight="ph:check-bold" onClick={criar}>Criar departamento</Button>
        </div>
      </Sheet>
    </div>
  )
}
