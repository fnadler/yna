import { Icon } from '@iconify/react'
import { fmtData, nr1DiasEntre } from '../lib/nr1'
import { NR1_TODAY } from '../data/nr1Mock'
import type { Nr1Campanha } from '../types'

/* Card de estado do ciclo — participação, meta e prazo (ciclo em campo) ou
   participação final e data de encerramento (ciclo encerrado). Usado nos
   três lugares que mostram isso: a Visão geral da área logada
   (`NR1RhCockpit.tsx`, sempre o ciclo em campo), a lista de Ciclos de
   avaliação (`NR1RhCiclos.tsx`, um card por ciclo) e a aba "Engajamento" do
   detalhe de um ciclo (mesmo arquivo, o ciclo que estiver aberto — em campo
   ou encerrado). Mesmo componente, não duplicado, para as três telas nunca
   discordarem sobre o mesmo ciclo.

   A linha de meta (75%) aparece nas duas variantes — em campo e encerrado
   — como referência visual de quanto seria preciso para bater a meta. O
   que só faz sentido enquanto o ciclo ainda está correndo é o "faltam N
   respostas" e a contagem de dias: um ciclo encerrado já é passado, não há
   mais o que fazer a respeito. Para efeito de protótipo, todo ciclo
   encerrado é tratado como tendo atingido a meta — não há aqui uma
   variação visual para "encerrado abaixo da meta". */

/** Meta de participação — abaixo disso, o ciclo entra no radar do RH. */
const META_PARTICIPACAO_PCT = 75

/** Dias entre a data mock de "hoje" (`NR1_TODAY`) e o prazo. */
const diasRestantes = (prazoIso: string) => nr1DiasEntre(NR1_TODAY, prazoIso)

export function Nr1CicloStatusCard({ campanha, destaque, onClick }: { campanha: Nr1Campanha; destaque?: boolean; onClick?: () => void }) {
  const emCampo = campanha.status === 'em-campo'

  const conteudo = emCampo ? <ConteudoEmCampo campanha={campanha} /> : <ConteudoEncerrado campanha={campanha} />

  /* Destaque é só a espessura da borda — o fundo continua o mesmo `bg-surface`
     sólido dos demais cards (ver Ciclos de avaliação), por pedido explícito:
     nenhum tingimento de cor para marcar "este é o ciclo ativo". */
  const classeBorda = destaque ? 'border-2 border-primary' : 'border border-border'

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`flex w-full flex-col gap-3 rounded-lg ${classeBorda} bg-surface p-5 text-left transition-colors ${destaque ? 'hover:border-primary-600' : 'hover:border-border-strong'}`}
      >
        {conteudo}
      </button>
    )
  }

  return <div className={`flex w-full flex-col gap-3 rounded-lg ${classeBorda} bg-surface p-5`}>{conteudo}</div>
}

function ConteudoEmCampo({ campanha }: { campanha: Nr1Campanha }) {
  const elegiveis = campanha.elegiveis
  /* Valor fixo pedido para simular um cenário abaixo da meta: o real
     (campanha.respostas) é 132/177 ≈ 75%, em cima da meta, o que não
     demonstra o alerta. Só a contagem de respostas é simulada aqui —
     elegíveis continua o headcount real, e nenhuma outra tela (lista de
     Ciclos, Inventário, mapa de calor, "Participação por área" logo abaixo
     deste card no detalhe) é afetada por este valor. */
  const respostas = Math.round(elegiveis * 0.63)
  const pctAtual = Math.round((respostas / Math.max(1, elegiveis)) * 100)
  const metaRespostas = Math.ceil((META_PARTICIPACAO_PCT / 100) * elegiveis)
  const faltamMeta = Math.max(0, metaRespostas - respostas)
  const abaixoDaMeta = pctAtual < META_PARTICIPACAO_PCT
  const dias = diasRestantes(campanha.fim)

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">Ciclo em andamento</span>
        <span className="inline-flex items-center gap-1 rounded-pill bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary dark:text-primary-300">
          {campanha.modeloNome} · v{campanha.versao}
        </span>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[40px] font-bold leading-none tracking-[-0.02em] text-ink">{pctAtual}%</p>
          <p className="mt-2 text-[13px] text-ink-secondary">{respostas} de {elegiveis} colaboradores responderam</p>
          {abaixoDaMeta && (
            <p className="mt-1 flex items-center gap-1.5 text-[12.5px] font-medium text-warning-ink">
              <Icon icon="ph:trend-down-bold" width={13} aria-hidden />
              Faltam {faltamMeta} {faltamMeta === 1 ? 'resposta' : 'respostas'} para atingir a meta de {META_PARTICIPACAO_PCT}%
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[13px] font-semibold text-ink">Prazo: até {fmtData(campanha.fim)}</p>
          <p className="mt-0.5 text-[12px] text-ink-secondary">
            {dias > 0 ? `${dias} ${dias === 1 ? 'dia' : 'dias'} restantes` : dias === 0 ? 'Encerra hoje' : 'Prazo encerrado'}
          </p>
        </div>
      </div>

      <div>
        <div className="relative">
          <div className="h-2 overflow-hidden rounded-pill bg-surface-2">
            <div
              className={`h-full rounded-pill transition-all ${abaixoDaMeta ? 'bg-warning' : 'bg-success'}`}
              style={{ width: `${pctAtual}%` }}
            />
          </div>
          <div
            className="absolute -top-0.5 -bottom-0.5 w-0.5 -translate-x-1/2 bg-ink-secondary"
            style={{ left: `${META_PARTICIPACAO_PCT}%` }}
            aria-hidden
          />
        </div>
        <div className="relative mt-1.5 h-4">
          <span
            className="absolute -translate-x-1/2 whitespace-nowrap font-mono text-[10px] font-medium text-ink-muted"
            style={{ left: `${META_PARTICIPACAO_PCT}%` }}
          >
            Meta {META_PARTICIPACAO_PCT}%
          </span>
        </div>
      </div>
    </>
  )
}

function ConteudoEncerrado({ campanha }: { campanha: Nr1Campanha }) {
  const pct = Math.round((campanha.respostas / Math.max(1, campanha.elegiveis)) * 100)
  const encerradoEm = campanha.encerradaEm ?? campanha.fim

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">Ciclo encerrado</span>
        <span className="inline-flex items-center gap-1 rounded-pill bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-ink-secondary">
          {campanha.modeloNome} · v{campanha.versao}
        </span>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[40px] font-bold leading-none tracking-[-0.02em] text-ink">{pct}%</p>
          <p className="mt-2 text-[13px] text-ink-secondary">{campanha.respostas} de {campanha.elegiveis} colaboradores responderam</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[13px] font-semibold text-ink">Encerrado em {fmtData(encerradoEm)}</p>
        </div>
      </div>

      <div>
        <div className="relative">
          <div className="h-2 overflow-hidden rounded-pill bg-surface-2">
            <div className="h-full rounded-pill bg-success transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div
            className="absolute -top-0.5 -bottom-0.5 w-0.5 -translate-x-1/2 bg-ink-secondary"
            style={{ left: `${META_PARTICIPACAO_PCT}%` }}
            aria-hidden
          />
        </div>
        <div className="relative mt-1.5 h-4">
          <span
            className="absolute -translate-x-1/2 whitespace-nowrap font-mono text-[10px] font-medium text-ink-muted"
            style={{ left: `${META_PARTICIPACAO_PCT}%` }}
          >
            Meta {META_PARTICIPACAO_PCT}%
          </span>
        </div>
      </div>
    </>
  )
}
