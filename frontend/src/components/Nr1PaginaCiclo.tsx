import { useEffect, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { RhTopBar } from './RhTopBar'
import { PageHeader } from './PageHeader'
import { Select } from './Select'
import { Skeleton } from './Skeleton'
import { useOpcoesRecorte } from './Nr1Blocos'
import { PAGE_MAX_W } from '../lib/layout'
import { useService } from '../hooks/useService'
import { nr1CampanhaService, nr1ResultadoService } from '../services/nr1'
import type { Nr1Campanha } from '../types'

/* Moldura das telas do menu que mostram um bloco do resultado de um ciclo
   (Inventário de riscos, Planos de ação, Resumo para o PGR): título, barra
   fixa com o ciclo (padrão: o último encerrado, `?ciclo=` também vale) e o
   filtro de departamento — com a mesma altura do menu de âncoras da aba
   Resultado, para o cabeçalho fixo do bloco encaixar logo abaixo. */
export function Nr1PaginaCiclo({ titulo, subtitulo, children, semSeletorCiclo = false, semBarra = false, acao }: {
  titulo: string
  subtitulo: string
  children: (ctx: { campanha: Nr1Campanha; recorte: string; recorteNome: string }) => ReactNode
  /** Sempre o último ciclo encerrado, sem o seletor de ciclo na barra. */
  semSeletorCiclo?: boolean
  /** Sem a barra de filtros: último ciclo encerrado, empresa inteira, e a
     `acao` vai para o cabeçalho da página. */
  semBarra?: boolean
  /** Ação alinhada à direita da barra (ex.: "Adicionar risco"). */
  acao?: ReactNode
}) {
  const [params] = useSearchParams()
  const encerrados = useService(() => nr1ResultadoService.ciclosEncerrados(), [])
  const campanhas = useService(() => nr1CampanhaService.list(), [])
  const [campanhaId, setCampanhaId] = useState<string | undefined>(params.get('ciclo') ?? undefined)
  useEffect(() => {
    if (!campanhaId && encerrados.status === 'success') setCampanhaId(encerrados.data.vigente)
  }, [campanhaId, encerrados])
  const [recorte, setRecorte] = useState('empresa')
  useEffect(() => { setRecorte('empresa') }, [campanhaId])
  const opcoesRecorte = useOpcoesRecorte(campanhaId)

  const campanha = campanhas.status === 'success' ? campanhas.data.find((c) => c.id === campanhaId) : undefined
  const nome = (c: Nr1Campanha) => (c.nome.split('·').pop() ?? c.nome).trim()
  const ciclos = encerrados.status === 'success' && campanhas.status === 'success'
    ? [...encerrados.data.ids].reverse().map((id) => campanhas.data.find((c) => c.id === id)!).filter(Boolean)
    : []

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />
        <PageHeader className="mt-2 lg:mt-0" title={titulo} subtitle={subtitulo} action={semBarra && campanha ? acao : undefined} />

        {(encerrados.status !== 'success' || campanhas.status !== 'success') && <Skeleton className="h-96 w-full rounded-lg" />}
        {encerrados.status === 'success' && !encerrados.data.vigente && (
          <p className="rounded-lg border border-border bg-surface px-5 py-14 text-center text-[13px] text-ink-secondary">
            Nenhum ciclo encerrado ainda. Este conteúdo aparece quando o primeiro ciclo de avaliação for encerrado.
          </p>
        )}

        {campanha && (
          <>
            {semBarra ? null : semSeletorCiclo ? (
              <nav className="sticky top-0 z-[45] -mx-1 mb-6 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface p-1 shadow-xs" aria-label="Seções do resultado">
                <div className="flex w-full items-center gap-2 px-1 sm:w-64">
                  <Icon icon="ph:funnel-simple-bold" width={15} className="shrink-0 text-ink-muted" aria-hidden />
                  <Select size="sm" className="flex-1" value={recorte} onChange={setRecorte} ariaLabel="Ver resultado de" options={opcoesRecorte} />
                </div>
                {acao && <div className="shrink-0 pr-1">{acao}</div>}
              </nav>
            ) : (
            <nav className="sticky top-0 z-[45] -mx-1 mb-6 flex flex-col gap-1 rounded-lg border border-border bg-surface p-1 shadow-xs lg:flex-row lg:items-center" aria-label="Seções do resultado">
              <div className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1">
                <Icon icon="ph:calendar-check-bold" width={15} className="shrink-0 text-ink-muted" aria-hidden />
                <span className="text-[12.5px] font-medium text-ink-secondary">Ciclo</span>
                <Select size="sm" className="w-full max-w-[16rem]" value={campanha.id} onChange={setCampanhaId} ariaLabel="Ciclo" options={ciclos.map((c) => ({ value: c.id, label: nome(c) }))} />
                <span className="hidden truncate font-mono text-[11px] text-ink-muted sm:inline">protocolo {campanha.protocolo}</span>
              </div>
              <div className="flex items-center gap-2 px-1 lg:w-60 lg:shrink-0">
                <Icon icon="ph:funnel-simple-bold" width={15} className="shrink-0 text-ink-muted" aria-hidden />
                <Select size="sm" className="flex-1" value={recorte} onChange={setRecorte} ariaLabel="Ver resultado de" options={opcoesRecorte} />
              </div>
              {acao && <div className="shrink-0 px-1">{acao}</div>}
            </nav>
            )}
            {children({ campanha, recorte, recorteNome: opcoesRecorte.find((o) => o.value === recorte)?.label ?? 'Toda a empresa' })}
          </>
        )}
      </div>
    </div>
  )
}
