import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { Textarea } from '../components/Textarea'
import { Skeleton } from '../components/Skeleton'
import { ErrorState } from '../components/ErrorState'
import { useService } from '../hooks/useService'
import { useApp } from '../contexts/AppContext'
import { nr1ColaboradorService } from '../services/nr1'
import type { Nr1Item, Nr1QuestionarioVersao, Nr1EscalaConfig } from '../types'

/* NR1-BEN-03 — Questionário renderizado dinamicamente a partir do
   modelo/versão atribuído à campanha (RF-A01, RF-CO-NR1-01).

   Nada aqui é hardcoded: as dimensões, os itens, as escalas e as perguntas
   abertas vêm da versão registrada na campanha. Trocar o instrumento no
   backoffice muda esta tela sem tocar em código.

   Uma pergunta por vez, sem agrupar por dimensão — pedido explícito, para
   não expor a estrutura interna do instrumento (dimensão/escala é
   linguagem de conformidade, não do colaborador) e para o formulário
   parecer mais curto: uma pergunta atrás da outra, nunca uma lista inteira
   de uma vez. Mesma base visual da tela "Agora vamos começar"
   (`ColTransicaoAvaliacao.tsx`) que antecede o questionário — full-bleed,
   fundo em gradiente, um único card centralizado — trocando o conteúdo do
   card pela pergunta atual. Por isso esta tela não usa `FocusLayout` como
   as demais do fluxo: tem fundo e composição próprios, como
   `ColTransicaoAvaliacao`/`NR1BenConclusao` (ver App.tsx). */

/** Valor usado quando o respondente marca um item condicional como não
   aplicável — não entra na média da dimensão. */
const NAO_SE_APLICA = 'na'

/** Uma "pergunta" nesta tela é ou um item de escala (dimensão) ou uma das
   perguntas abertas da versão — a mesma sequência, sem distinção visual de
   onde cada uma vem. */
type Pergunta =
  | { tipo: 'item'; item: Nr1Item }
  | { tipo: 'aberta'; id: string; texto: string }

export function NR1BenQuestionario() {
  const { passo } = useParams<{ passo: string }>()
  const navigate = useNavigate()
  const { nr1, nr1Responder, nr1Iniciar } = useApp()
  const instrumento = useService(() => nr1ColaboradorService.instrumentoDaCampanha(), [])

  /* Mantém `nr1.campanhaId` sincronizado com a campanha que está de fato em
     campo. No primeiro ciclo isso já vem setado desde o LGPD (`Ben03Lgpd`),
     mas numa reavaliação (`ColAvaliacoes` manda direto para cá, sem passar
     pelo LGPD de novo) esta é a única chance de trocar da campanha antiga
     para a nova antes do envio em `NR1BenConclusao`. */
  const campanhaAtivaId = instrumento.status === 'success' ? instrumento.data?.campanha.id : undefined
  useEffect(() => {
    if (campanhaAtivaId) nr1Iniciar(campanhaAtivaId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campanhaAtivaId])

  if (instrumento.status === 'idle' || instrumento.status === 'loading') {
    return (
      <PaginaCentralizada>
        <div className="flex w-full flex-col gap-4 rounded-2xl border border-border bg-surface p-7 shadow md:p-10">
          <Skeleton className="h-2 w-full rounded-pill" />
          <Skeleton className="h-8 w-4/5 rounded-lg" />
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
        </div>
      </PaginaCentralizada>
    )
  }

  if (instrumento.status === 'error') {
    return (
      <PaginaCentralizada>
        <div className="w-full rounded-2xl border border-border bg-surface p-7 shadow md:p-10">
          <ErrorState message={instrumento.message} onRetry={instrumento.reload} />
        </div>
      </PaginaCentralizada>
    )
  }

  if (!instrumento.data) {
    return (
      <PaginaCentralizada>
        <div className="w-full rounded-2xl border border-border bg-surface p-7 shadow md:p-10">
          <ErrorState message="Esta conversa não está mais aberta." onRetry={() => navigate('/despedida')} />
        </div>
      </PaginaCentralizada>
    )
  }

  return (
    <Wizard
      versao={instrumento.data.versao}
      passo={passo}
      respostas={nr1?.respostas ?? {}}
      onResponder={nr1Responder}
      campanhaId={instrumento.data.campanha.id}
    />
  )
}

/** Fundo em gradiente + card centralizado — mesma composição da tela
   "Agora vamos começar", reutilizada aqui para o carregamento/erro nunca
   destoarem visualmente da pergunta em si. */
function PaginaCentralizada({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center overflow-x-hidden bg-yna-gradient px-5 py-10">
      <div className="flex w-full max-w-xl flex-col items-center">{children}</div>
    </div>
  )
}

function Wizard({ versao, passo, respostas, onResponder, campanhaId }: {
  versao: Nr1QuestionarioVersao
  passo?: string
  respostas: Record<string, number | string>
  onResponder: (itemId: string, valor: number | string) => void
  campanhaId: string
}) {
  const navigate = useNavigate()

  /* Sequência única de perguntas — todos os itens de todas as dimensões,
     nesta ordem, seguidos das perguntas abertas (quando a versão tiver
     alguma). Sem agrupar por dimensão: essa é a mudança pedida. */
  const perguntas = useMemo<Pergunta[]>(() => {
    const itens = versao.dimensoes.flatMap((d) => d.itens).map((item) => ({ tipo: 'item' as const, item }))
    const abertas = versao.abertas.map((texto, i) => ({ tipo: 'aberta' as const, id: `aberta-${i}`, texto }))
    return [...itens, ...abertas]
  }, [versao])

  const total = perguntas.length
  const idx = Math.max(0, Math.min(total - 1, parseInt(passo ?? '1', 10) - 1))
  const atual = perguntas[idx]!
  const numero = idx + 1
  const ultimo = idx === total - 1
  const pct = Math.round((numero / total) * 100)

  /* Rolar ao topo a cada pergunta — sem isso quem já rolou o card anterior
     cairia no meio da próxima. */
  useEffect(() => { window.scrollTo({ top: 0 }) }, [idx])

  /* Perguntas abertas e itens condicionais são opcionais — não travam o
     avanço se ficarem sem resposta. Um item condicional pode, além disso,
     ser respondido explicitamente como "não se aplica", que grava um valor
     como qualquer outra resposta. */
  const completo = atual.tipo === 'aberta' || atual.item.condicional || respostas[atual.item.id] !== undefined

  const avancar = () => {
    /* Salva em segundo plano, sem travar a navegação nisso — são muito mais
       passos agora (uma pergunta por vez, não uma dimensão inteira), então
       esperar a resposta do mock a cada clique deixaria o fluxo arrastado. */
    void nr1ColaboradorService.salvarParcial(campanhaId, respostas)
    if (ultimo) navigate('/avaliacao/conclusao')
    else navigate(`/avaliacao/${numero + 1}`)
  }

  const voltar = () => {
    if (idx > 0) navigate(`/avaliacao/${numero - 1}`)
    else navigate(-1)
  }

  return (
    <PaginaCentralizada>
      <div key={idx} className="w-full animate-yna-slide-up rounded-2xl border border-border bg-surface p-6 shadow md:p-9">
        {/* Progresso — rótulo + barra + percentual, mesma leitura de sempre
           (bg-gradient-to-r from-primary to-pink), sem depender de cor
           sozinha (o rótulo já diz "Questão X de Y" por extenso). */}
        <div>
          <span className="text-[13px] font-medium text-ink-secondary">Questão {numero} de {total}</span>
          <div
            className="mt-2 h-2 overflow-hidden rounded-pill bg-surface-2"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={numero}
            aria-label={`Questão ${numero} de ${total}`}
          >
            <div
              className="h-full rounded-pill bg-gradient-to-r from-primary to-pink transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1 text-right font-mono text-[12px] font-semibold text-primary dark:text-primary-300">{pct}%</p>
        </div>

        <div className="mt-6">
          {atual.tipo === 'item' ? (
            <PerguntaItem item={atual.item} escalas={versao.escala} valor={respostas[atual.item.id]} onChange={(v) => onResponder(atual.item.id, v)} />
          ) : (
            <PerguntaAberta texto={atual.texto} valor={String(respostas[atual.id] ?? '')} onChange={(v) => onResponder(atual.id, v)} />
          )}
        </div>

        <div className="mt-8 flex gap-3">
          <Button variant="secondary" className="flex-1" iconLeft="ph:arrow-left-bold" onClick={voltar}>
            Anterior
          </Button>
          <Button className="flex-1" disabled={!completo} iconRight={ultimo ? 'ph:check-bold' : 'ph:arrow-right-bold'} onClick={avancar}>
            {ultimo ? 'Concluir' : 'Próximo'}
          </Button>
        </div>
      </div>

      <p className="mt-5 text-center text-[12.5px] leading-relaxed text-ink-secondary/80">
        Se precisar parar, o que você já respondeu fica guardado.
      </p>
    </PaginaCentralizada>
  )
}

/* Uma pergunta de escala — texto + lista vertical de opções, cada uma com
   o próprio rótulo sempre visível (não um número de 1 a 5): é o que muda
   nesta tela em relação à versão anterior, onde só os extremos da escala
   apareciam escritos. */
function PerguntaItem({ item, escalas, valor, onChange }: {
  item: Nr1Item
  escalas: Nr1EscalaConfig
  valor: number | string | undefined
  onChange: (v: number | string) => void
}) {
  const naoSeAplica = valor === NAO_SE_APLICA
  const escala = escalas[item.escala]

  return (
    <fieldset>
      <legend className="text-[19px] font-heading font-semibold leading-snug text-ink md:text-[21px]">
        {item.texto}
      </legend>

      {item.condicional && (
        <p className="mt-1.5 text-[12.5px] text-ink-muted">Responda só se isso fizer parte do seu trabalho.</p>
      )}

      <div className="mt-5 flex flex-col gap-2.5" role="radiogroup" aria-label={item.texto}>
        {escala.opcoes.map((o) => {
          const on = valor === o.valor
          return (
            <button
              key={o.valor}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.valor)}
              className={`flex w-full items-center gap-3 rounded-lg border-[1.5px] px-4 py-3.5 text-left transition-colors ${
                on
                  ? 'border-primary bg-primary-50'
                  : 'border-border bg-surface hover:border-border-strong hover:bg-surface-hover'
              }`}
            >
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${on ? 'border-primary' : 'border-border-strong'}`}>
                {on && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
              </span>
              <span className={`text-[15px] leading-snug text-ink ${on ? 'font-semibold' : ''}`}>{o.rotulo}</span>
            </button>
          )
        })}
      </div>

      {item.condicional && (
        <button
          type="button"
          aria-pressed={naoSeAplica}
          onClick={() => onChange(naoSeAplica ? '' : NAO_SE_APLICA)}
          className={`mt-3 inline-flex items-center gap-2 rounded-pill border-[1.5px] px-4 py-2 text-[13px] font-semibold transition-colors ${
            naoSeAplica
              ? 'border-primary bg-primary-50 text-primary dark:text-primary-300'
              : 'border-border-strong bg-surface-2 text-ink-secondary hover:border-primary hover:text-primary dark:hover:text-primary-300'
          }`}
        >
          <Icon icon={naoSeAplica ? 'ph:check-circle-bold' : 'ph:circle-dashed-bold'} width={15} aria-hidden />
          Não se aplica a mim
        </button>
      )}
    </fieldset>
  )
}

/* Pergunta aberta — texto livre, opcional (ver `completo` no Wizard). */
function PerguntaAberta({ texto, valor, onChange }: { texto: string; valor: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-[19px] font-heading font-semibold leading-snug text-ink md:text-[21px]">{texto}</p>
      <p className="mt-1.5 text-[12.5px] text-ink-muted">Opcional. Escreva só se fizer sentido para você.</p>
      <div className="mt-5">
        <Textarea aria-label={texto} rows={4} value={valor} onChange={(e) => onChange(e.target.value)} placeholder="Escreva à vontade…" />
      </div>
    </div>
  )
}
