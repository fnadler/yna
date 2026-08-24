import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Sheet } from './Sheet'
import { Badge } from './Badge'
import { PrazoBadge } from './PrazoBadge'
import { Skeleton } from './Skeleton'
import { ErrorState } from './ErrorState'
import { NIVEL_RISCO, STATUS_RISCO, ACAO_STATUS } from '../lib/nr1'
import { useService } from '../hooks/useService'
import { nr1ResultadoService, nr1AcaoService } from '../services/nr1'
import { NR1_DIMENSOES, nr1NivelPorMedia } from '../data/nr1Mock'
import type { Nr1DimensaoId } from '../types'

/** O que foi clicado — um card de "Risco por dimensão" (sem `departamentoId`,
   visão da empresa inteira) ou uma célula do mapa de calor (com
   `departamentoId`/`departamento`, visão só daquela área). `media` é o
   valor JÁ PUBLICADO ali (card ou célula) — mostrado de novo aqui como
   referência, para confirmar que bate com a média das perguntas abaixo. */
export interface Nr1PerguntasEscopo {
  campanhaId: string
  dimensaoId: Nr1DimensaoId
  departamentoId?: string
  departamento?: string
  media: number
}

type Visualizacao = 'resultados' | 'riscos' | 'acoes'

const VISUALIZACOES: { valor: Visualizacao; label: string; icon: string }[] = [
  { valor: 'resultados', label: 'Resultados', icon: 'ph:chart-bar-bold' },
  { valor: 'riscos', label: 'Riscos', icon: 'ph:warning-bold' },
  { valor: 'acoes', label: 'Ações', icon: 'ph:list-checks-bold' },
]

/** Detalhe de uma dimensão — aberto ao clicar num card de "Risco por
   dimensão" (empresa) ou numa célula do mapa de calor (área). Três
   visualizações do mesmo recorte (dimensão + área, quando houver):
   Resultados (as perguntas do questionário, comportamento original deste
   modal), Riscos (os riscos do inventário vinculados a essa dimensão/área)
   e Ações (os planos de ação vinculados a esses riscos) — a mesma cadeia
   resultado → risco → ação, só que entrando por resultado em vez de por
   risco (o caminho inverso já existe no Inventário e no Plano de ação). */
export function Nr1PerguntasSheet({ escopo, onClose }: { escopo: Nr1PerguntasEscopo | null; onClose: () => void }) {
  const dimensao = escopo && NR1_DIMENSOES.find((d) => d.id === escopo.dimensaoId)
  return (
    <Sheet open={escopo !== null} onClose={onClose} title={dimensao?.nome ?? 'Detalhe da dimensão'} icon="ph:list-magnifying-glass-bold" size="md">
      {escopo && <Conteudo escopo={escopo} />}
    </Sheet>
  )
}

function Conteudo({ escopo }: { escopo: Nr1PerguntasEscopo }) {
  const [visualizacao, setVisualizacao] = useState<Visualizacao>('resultados')
  const dimensao = NR1_DIMENSOES.find((d) => d.id === escopo.dimensaoId)
  const stMedia = NIVEL_RISCO[nr1NivelPorMedia(escopo.media)]

  return (
    <div className="flex flex-col gap-5 px-5 py-6 lg:px-6">
      <div>
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          {escopo.departamento ?? 'Toda a empresa'}
        </p>
        <h3 className="mt-1 font-heading text-[17px] font-semibold text-ink">{dimensao?.nome}</h3>
        {dimensao?.descricao && <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">{dimensao.descricao}</p>}
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-4">
        <span className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-4 py-2 ${stMedia.cls}`}>
          <span className="font-mono text-[18px] font-bold leading-none">{escopo.media.toFixed(1)}</span>
          <span className="text-[10.5px] font-semibold leading-none">{stMedia.label}</span>
        </span>
        <p className="text-[12.5px] leading-relaxed text-ink-secondary">
          Média da dimensão {escopo.departamento ? `em ${escopo.departamento}` : 'na empresa'} — a mesma
          que já aparecia na tela antes de abrir esta lista.
        </p>
      </div>

      {/* Mesmo padrão visual da alternância Lista/Kanban do Plano de ação. */}
      <div className="flex gap-1 rounded-lg bg-surface-2 p-1" role="tablist" aria-label="Visualização da dimensão">
        {VISUALIZACOES.map((v) => (
          <button
            key={v.valor}
            role="tab"
            aria-selected={visualizacao === v.valor}
            onClick={() => setVisualizacao(v.valor)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 font-heading text-sm font-semibold transition-all ${
              visualizacao === v.valor ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
            }`}
          >
            <Icon icon={v.icon} width={15} aria-hidden />
            {v.label}
          </button>
        ))}
      </div>

      {visualizacao === 'resultados' && <AbaResultados escopo={escopo} />}
      {visualizacao === 'riscos' && <AbaRiscos escopo={escopo} />}
      {visualizacao === 'acoes' && <AbaAcoes escopo={escopo} />}
    </div>
  )
}

function AbaResultados({ escopo }: { escopo: Nr1PerguntasEscopo }) {
  const itens = useService(
    () => nr1ResultadoService.itensPorDimensao(escopo.campanhaId, escopo.dimensaoId, escopo.departamentoId),
    [escopo.campanhaId, escopo.dimensaoId, escopo.departamentoId],
  )

  return (
    <>
      {(itens.status === 'idle' || itens.status === 'loading') && (
        <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
      )}
      {itens.status === 'error' && <ErrorState message={itens.message} onRetry={itens.reload} />}
      {itens.status === 'success' && itens.data.length === 0 && (
        <p className="rounded-lg bg-surface-2 px-3.5 py-3 text-[12.5px] text-ink-secondary">
          Nenhuma pergunta encontrada para esta dimensão no instrumento aplicado neste ciclo.
        </p>
      )}
      {itens.status === 'success' && itens.data.length > 0 && (
        <ul className="flex flex-col gap-2">
          {[...itens.data].sort((a, b) => a.media - b.media).map((it) => {
            const st = NIVEL_RISCO[it.nivel]
            return (
              <li key={it.itemId} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface p-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] leading-snug text-ink">{it.texto}</p>
                  <p className="mt-1 text-[11px] text-ink-muted">{it.referencia}</p>
                </div>
                <span className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 ${st.cls}`}>
                  <span className="font-mono text-[14px] font-bold leading-none">{it.media.toFixed(1)}</span>
                  <span className="text-[10px] font-semibold leading-none">{st.label}</span>
                </span>
              </li>
            )
          })}
        </ul>
      )}

      <div className="flex gap-3 rounded-lg border border-border bg-surface-2 p-4">
        <Icon icon="ph:info-bold" width={18} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
        <p className="text-[12px] leading-relaxed text-ink-secondary">
          A pontuação de cada pergunta usa a mesma escala da dimensão (1 a 5, onde 5 é a situação
          desejável) — frequência ou concordância, conforme o item. Não é uma classificação de
          probabilidade × severidade: esse é o método do Inventário de riscos, usado para
          classificar um fator de risco já identificado, não para medir uma resposta de
          questionário.
        </p>
      </div>
    </>
  )
}

/** Riscos do inventário vinculados a esta dimensão — e, quando o recorte é
   de uma área (célula do mapa de calor), só os que expõem aquela área
   (`departamentoIds`). O inventário é um documento vivo (não fica preso a
   uma campanha específica), por isso o filtro é só por dimensão/área, sem
   `campanhaId` — o mesmo critério que Inventário e Plano de ação já usam. */
function AbaRiscos({ escopo }: { escopo: Nr1PerguntasEscopo }) {
  const inventario = useService(() => nr1ResultadoService.inventario(), [])

  if (inventario.status === 'idle' || inventario.status === 'loading') {
    return <div className="flex flex-col gap-2">{[0, 1].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}</div>
  }
  if (inventario.status === 'error') return <ErrorState message={inventario.message} onRetry={inventario.reload} />

  const riscos = inventario.data.filter(
    (r) => r.dimensaoId === escopo.dimensaoId && (!escopo.departamentoId || r.departamentoIds.includes(escopo.departamentoId)),
  )

  if (riscos.length === 0) {
    return (
      <p className="rounded-lg bg-surface-2 px-3.5 py-3 text-[12.5px] text-ink-secondary">
        Nenhum risco do inventário vinculado a esta dimensão{escopo.departamento ? ` em ${escopo.departamento}` : ''} ainda.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {riscos.map((r) => {
        const st = NIVEL_RISCO[r.nivel]
        const stStatus = STATUS_RISCO[r.status]
        return (
          <li key={r.id}>
            <Link
              to={`/rh/nr1/inventario?detalhe=${r.id}`}
              className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3.5 transition-colors hover:border-border-strong hover:bg-surface-hover"
            >
              <span className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 ${st.cls}`}>
                <span className="font-mono text-[13px] font-bold leading-none">{r.nivelNum}</span>
                <span className="text-[9px] font-semibold leading-none">{st.label}</span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-snug text-ink">{r.fator}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-ink-muted">{r.grupoExposto}</span>
                  <Badge tone={stStatus.tone} icon={stStatus.icon} className="!py-0.5 !text-[10.5px]">{stStatus.label}</Badge>
                </div>
              </div>
              <Icon icon="ph:arrow-right-bold" width={13} className="mt-1 shrink-0 text-ink-muted" aria-hidden />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

/** Ações do plano vinculadas aos riscos desta dimensão/área — o mesmo
   recorte de riscos da aba "Riscos", um passo adiante na cadeia risco →
   ação. Só a versão vigente de cada plano (uma ação revisada não aparece
   duas vezes), mesmo critério do Plano de ação. */
function AbaAcoes({ escopo }: { escopo: Nr1PerguntasEscopo }) {
  const inventario = useService(() => nr1ResultadoService.inventario(), [])
  const acoes = useService(() => nr1AcaoService.list(), [])

  if (
    inventario.status === 'idle' || inventario.status === 'loading' ||
    acoes.status === 'idle' || acoes.status === 'loading'
  ) {
    return <div className="flex flex-col gap-2">{[0, 1].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}</div>
  }
  if (inventario.status === 'error') return <ErrorState message={inventario.message} onRetry={inventario.reload} />
  if (acoes.status === 'error') return <ErrorState message={acoes.message} onRetry={acoes.reload} />

  const riscosDaDimensao = inventario.data.filter(
    (r) => r.dimensaoId === escopo.dimensaoId && (!escopo.departamentoId || r.departamentoIds.includes(escopo.departamentoId)),
  )
  const riscoPorId = new Map(inventario.data.map((r) => [r.id, r]))
  const riscoIds = new Set(riscosDaDimensao.map((r) => r.id))

  const idsSuperados = new Set(acoes.data.map((a) => a.versaoAnteriorId).filter((id): id is string => Boolean(id)))
  const vinculadas = acoes.data.filter((a) => !idsSuperados.has(a.id) && riscoIds.has(a.riscoId))

  if (vinculadas.length === 0) {
    return (
      <p className="rounded-lg bg-surface-2 px-3.5 py-3 text-[12.5px] text-ink-secondary">
        Nenhuma ação vinculada aos riscos desta dimensão{escopo.departamento ? ` em ${escopo.departamento}` : ''} ainda.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {vinculadas.map((a) => {
        const risco = riscoPorId.get(a.riscoId)
        const nivel = risco ? NIVEL_RISCO[risco.nivel] : null
        return (
          <li key={a.id}>
            <Link
              to={`/rh/nr1/plano-acao?risco=${a.riscoId}`}
              className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3.5 transition-colors hover:border-border-strong hover:bg-surface-hover"
            >
              <span className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 ${nivel ? nivel.cls : 'bg-surface-2 text-ink-muted'}`}>
                <span className="font-mono text-[13px] font-bold leading-none">{risco ? risco.nivelNum : '—'}</span>
                {nivel && <span className="text-[9px] font-semibold leading-none">{nivel.label}</span>}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium leading-snug text-ink">
                  {a.oQue}
                  {a.versao > 1 && <span className="ml-1.5 text-[10.5px] font-normal text-ink-muted">v{a.versao}</span>}
                </p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-muted">
                  <Icon icon="ph:user-bold" width={10} aria-hidden />{a.quem}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Badge tone={ACAO_STATUS[a.status].tone} className="!py-0.5 !text-[10.5px]">{ACAO_STATUS[a.status].label}</Badge>
                  <PrazoBadge acao={a} />
                </div>
              </div>
              <Icon icon="ph:arrow-right-bold" width={13} className="mt-1 shrink-0 text-ink-muted" aria-hidden />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
