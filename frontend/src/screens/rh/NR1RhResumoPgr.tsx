import { useState } from 'react'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { Nr1ResumoPgrModal } from '../../components/Nr1ResumoPgr'
import { PAGE_MAX_W } from '../../lib/layout'
import { fmtData, pct } from '../../lib/nr1'
import { useService } from '../../hooks/useService'
import { nr1CampanhaService, nr1ResultadoService } from '../../services/nr1'
import type { Nr1Campanha } from '../../types'

/* NR1-RH — Resumo para o PGR: um card por ciclo de avaliação (do mais
   recente ao mais antigo), cada um com o botão que abre o resumo daquele
   ciclo em tela cheia (exportar e imprimir). O ciclo em campo aparece, mas
   o resumo só fica disponível quando ele encerrar. */
export function NR1RhResumoPgr() {
  const campanhas = useService(() => nr1CampanhaService.list(), [])
  const [aberto, setAberto] = useState<Nr1Campanha | null>(null)

  const ciclos = campanhas.status === 'success'
    ? [...campanhas.data].filter((c) => c.status !== 'rascunho').sort((a, b) => b.inicio.localeCompare(a.inicio))
    : []

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />
        <PageHeader
          className="mt-2 lg:mt-0"
          title="Resumo para o PGR"
          subtitle="O inventário de riscos psicossociais de cada ciclo, por departamento, pronto para exportar ou imprimir e anexar ao PGR."
        />

        {campanhas.status === 'loading' && <div className="flex flex-col gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}</div>}
        {campanhas.status === 'error' && <ErrorState message={campanhas.message} onRetry={campanhas.reload} />}
        {campanhas.status === 'success' && ciclos.length === 0 && (
          <p className="rounded-lg border border-border bg-surface px-5 py-14 text-center text-[13px] text-ink-secondary">Nenhum ciclo de avaliação ainda.</p>
        )}

        <ul className="flex flex-col gap-3">
          {ciclos.map((c) => <CicloCard key={c.id} campanha={c} onVisualizar={() => setAberto(c)} />)}
        </ul>
      </div>

      <Nr1ResumoPgrModal
        aberto={aberto !== null}
        campanha={aberto ?? ciclos[0]!}
        recorte="empresa"
        recorteNome="Toda a empresa"
        onClose={() => setAberto(null)}
      />
    </div>
  )
}

function CicloCard({ campanha, onVisualizar }: { campanha: Nr1Campanha; onVisualizar: () => void }) {
  const encerrado = campanha.status === 'encerrada'
  const riscos = useService(() => (encerrado ? nr1ResultadoService.inventario(campanha.id) : Promise.resolve([])), [campanha.id])
  const nome = (campanha.nome.split('·').pop() ?? campanha.nome).trim()
  const respostas = campanha.participacao.reduce((s, p) => s + p.respostas, 0)
  const lista = riscos.status === 'success' ? riscos.data : []
  const areas = new Set(lista.flatMap((r) => (r.departamentoIds.length ? r.departamentoIds : ['empresa']))).size

  return (
    <li className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 sm:flex-row sm:items-center">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
        <Icon icon="ph:file-text-bold" width={22} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-heading text-[16px] font-semibold text-ink">Ciclo {nome}</h2>
          {encerrado
            ? <Badge tone="neutral">Encerrado em {fmtData(campanha.encerradaEm ?? campanha.fim)}</Badge>
            : <Badge tone="primary">Em andamento</Badge>}
        </div>
        <p className="mt-1 text-[12.5px] text-ink-secondary">
          {fmtData(campanha.inicio)} a {fmtData(campanha.fim)} · {campanha.modeloNome} v{campanha.versao} ·{' '}
          <span className="font-mono text-[11.5px]">{campanha.protocolo}</span>
        </p>
        <p className="mt-1.5 text-[12.5px] text-ink">
          {pct(respostas, campanha.elegiveis)}% de participação ({respostas} de {campanha.elegiveis})
          {encerrado && riscos.status === 'success' && (
            <> · <strong className="font-semibold">{lista.length} {lista.length === 1 ? 'fator de risco' : 'fatores de risco'}</strong> em {areas} {areas === 1 ? 'recorte' : 'recortes'}</>
          )}
        </p>
      </div>
      {encerrado ? (
        <Button iconLeft="ph:eye-bold" className="shrink-0" onClick={onVisualizar}>Visualizar resumo</Button>
      ) : (
        <p className="shrink-0 text-[12px] text-ink-muted sm:max-w-[180px] sm:text-right">Disponível quando o ciclo for encerrado.</p>
      )}
    </li>
  )
}
