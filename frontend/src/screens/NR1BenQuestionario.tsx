import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { Textarea } from '../components/Textarea'
import { Skeleton } from '../components/Skeleton'
import { ErrorState } from '../components/ErrorState'
import { useService } from '../hooks/useService'
import { useApp } from '../contexts/AppContext'
import { nr1BeneficiarioService } from '../services/nr1'
import type { Nr1Item, Nr1QuestionarioVersao, Nr1EscalaConfig } from '../types'

/* NR1-BEN-03 — Questionário renderizado dinamicamente a partir do
   modelo/versão atribuído à campanha (RF-A01, RF-CO-NR1-01).

   Nada aqui é hardcoded: as dimensões, os itens, as escalas e as perguntas
   abertas vêm da versão registrada na campanha. Trocar o instrumento no
   backoffice muda esta tela sem tocar em código.

   Wizard por dimensão (espelha Ben09Triagem), com salvamento progressivo. */

/** Valor usado quando o respondente marca um item condicional como não
   aplicável — não entra na média da dimensão. */
const NAO_SE_APLICA = 'na'

export function NR1BenQuestionario() {
  const { passo } = useParams<{ passo: string }>()
  const navigate = useNavigate()
  const { nr1, nr1Responder } = useApp()
  const instrumento = useService(() => nr1BeneficiarioService.instrumentoDaCampanha(), [])

  if (instrumento.status === 'idle' || instrumento.status === 'loading') {
    return (
      <main className="flex flex-1 flex-col px-5 pb-10 pt-10">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
          <Skeleton className="h-2 w-full rounded-pill" />
          <Skeleton className="h-10 w-2/3 rounded-lg" />
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}
        </div>
      </main>
    )
  }

  if (instrumento.status === 'error') {
    return (
      <main className="flex flex-1 flex-col justify-center px-5 py-10">
        <div className="mx-auto w-full max-w-xl">
          <ErrorState message={instrumento.message} onRetry={instrumento.reload} />
        </div>
      </main>
    )
  }

  if (!instrumento.data) {
    return (
      <main className="flex flex-1 flex-col justify-center px-5 py-10">
        <div className="mx-auto w-full max-w-xl">
          <ErrorState message="Esta conversa não está mais aberta." onRetry={() => navigate('/home')} />
        </div>
      </main>
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

function Wizard({ versao, passo, respostas, onResponder, campanhaId }: {
  versao: Nr1QuestionarioVersao
  passo?: string
  respostas: Record<string, number | string>
  onResponder: (itemId: string, valor: number | string) => void
  campanhaId: string
}) {
  const navigate = useNavigate()
  const [salvando, setSalvando] = useState(false)

  /* Passos = uma dimensão cada, mais um passo final para as perguntas abertas
     (quando a versão tiver alguma). */
  const passos = useMemo(() => {
    const base = versao.dimensoes.map((d) => ({ tipo: 'dimensao' as const, dimensao: d }))
    return versao.abertas.length > 0 ? [...base, { tipo: 'abertas' as const, dimensao: null }] : base
  }, [versao])

  const total = passos.length
  const idx = Math.max(0, Math.min(total - 1, parseInt(passo ?? '1', 10) - 1))
  const atual = passos[idx]!
  const numero = idx + 1
  const ultimo = idx === total - 1

  /* Rolar ao topo a cada passo — sem isso o usuário cai no meio da lista. */
  useEffect(() => { window.scrollTo({ top: 0 }) }, [idx])

  const itens = atual.tipo === 'dimensao' ? atual.dimensao.itens : []
  const obrigatorios = itens.filter((i) => !i.condicional)
  const completo = atual.tipo === 'abertas' || obrigatorios.every((i) => respostas[i.id] !== undefined)

  const avancar = async () => {
    setSalvando(true)
    await nr1BeneficiarioService.salvarParcial(campanhaId, respostas)
    setSalvando(false)
    if (ultimo) navigate('/avaliacao/conclusao')
    else navigate(`/avaliacao/${numero + 1}`)
  }

  const voltar = () => {
    if (idx > 0) navigate(`/avaliacao/${numero - 1}`)
    else navigate('/avaliacao/intro')
  }

  return (
    <>
      {/* Progresso — no topo, sempre visível */}
      <header className="px-5 pb-2 pt-8 lg:pt-10">
        <div className="mx-auto flex w-full max-w-xl items-center gap-3">
          <button
            onClick={voltar}
            aria-label="Voltar"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover"
          >
            <Icon icon="ph:arrow-left-bold" width={18} aria-hidden />
          </button>
          <div
            className="h-2 flex-1 overflow-hidden rounded-pill bg-surface-2"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={numero}
            aria-label={`Parte ${numero} de ${total}`}
          >
            <div
              className="h-full rounded-pill bg-gradient-to-r from-primary to-pink transition-all duration-500"
              style={{ width: `${(numero / total) * 100}%` }}
            />
          </div>
          <span className="shrink-0 font-mono text-xs font-medium text-ink-secondary">{numero} de {total}</span>
        </div>
      </header>

      <main key={idx} className="flex flex-1 flex-col px-5 pb-10 pt-6 animate-yna-slide-up">
        <div className="mx-auto w-full max-w-xl">
          {atual.tipo === 'dimensao' ? (
            <>
              <h1 className="text-[24px] font-extralight leading-[1.15] tracking-[-0.02em] text-ink lg:text-[32px]">
                {atual.dimensao.nome}
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
                Pensando nas últimas semanas, o quanto cada frase combina com o seu dia a dia?
              </p>

              <div className="mt-7 flex flex-col gap-4">
                {itens.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    escalas={versao.escala}
                    valor={respostas[item.id]}
                    onChange={(v) => onResponder(item.id, v)}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <h1 className="text-[24px] font-extralight leading-[1.15] tracking-[-0.02em] text-ink lg:text-[32px]">
                Quer contar mais alguma coisa?
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
                Estas são opcionais. Escreva só se fizer sentido para você. Continua tudo anônimo.
              </p>

              <div className="mt-7 flex flex-col gap-5">
                {versao.abertas.map((q, i) => {
                  const id = `aberta-${i}`
                  return (
                    <div key={id} className="flex flex-col gap-2">
                      <label htmlFor={id} className="text-[14px] leading-snug text-ink">{q}</label>
                      <Textarea
                        id={id}
                        placeholder="Escreva à vontade…"
                        value={String(respostas[id] ?? '')}
                        onChange={(e) => onResponder(id, e.target.value)}
                      />
                    </div>
                  )
                })}
                <p className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-muted">
                  <Icon icon="ph:lock-bold" width={13} className="mt-0.5 shrink-0" aria-hidden />
                  Evite escrever nomes. Assim garantimos que nada volte para você.
                </p>
              </div>
            </>
          )}

          <div className="mt-9 flex flex-col gap-2">
            <Button size="lg" fullWidth iconRight="ph:arrow-right-bold" disabled={!completo || salvando} onClick={avancar}>
              {salvando ? 'Salvando…' : ultimo ? 'Finalizar' : 'Continuar'}
            </Button>
            {!completo && (
              <p className="text-center text-[12px] text-ink-secondary">
                Faltam {obrigatorios.filter((i) => respostas[i.id] === undefined).length} de {obrigatorios.length} nesta parte.
              </p>
            )}
            <p className="text-center text-[12px] text-ink-secondary">
              Se precisar parar, o que você já respondeu fica guardado.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}

/* Um item do questionário. O controle segue o `tipoCampo` definido no modelo —
   por isso o mesmo componente atende escala, texto livre e número. */
function ItemCard({ item, escalas, valor, onChange }: {
  item: Nr1Item
  escalas: Nr1EscalaConfig
  valor: number | string | undefined
  onChange: (v: number | string) => void
}) {
  const naoSeAplica = valor === NAO_SE_APLICA
  const escala = escalas[item.escala]

  return (
    <fieldset className="rounded-lg border border-border bg-surface p-4">
      <legend className="sr-only">{item.texto}</legend>
      <p className="text-[14.5px] leading-snug text-ink">{item.texto}</p>

      {item.condicional && (
        <p className="mt-1 text-[11.5px] text-ink-muted">Responda só se isso fizer parte do seu trabalho.</p>
      )}

      {(item.tipoCampo === 'select' || item.tipoCampo === 'multiselect') && (
        <>
          <div className="mt-4 flex gap-1.5" role="radiogroup" aria-label={item.texto}>
            {escala.opcoes.map((o) => {
              const on = valor === o.valor
              return (
                <button
                  key={o.valor}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={o.rotulo}
                  title={o.rotulo}
                  onClick={() => onChange(o.valor)}
                  className={`flex min-h-[44px] flex-1 items-center justify-center rounded-lg border-[1.5px] font-heading text-[15px] font-semibold transition-all ${
                    on
                      ? 'border-primary bg-primary text-white shadow-sm'
                      : 'border-border bg-surface text-ink-secondary hover:border-border-strong hover:bg-surface-hover'
                  }`}
                >
                  {o.valor}
                </button>
              )
            })}
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-ink-muted">
            <span>{escala.opcoes[0]?.rotulo}</span>
            <span>{escala.opcoes[escala.opcoes.length - 1]?.rotulo}</span>
          </div>
          {/* Rótulo da opção escolhida — confirma a leitura sem depender da cor */}
          {typeof valor === 'number' && (
            <p className="mt-2 text-[12px] font-medium text-primary dark:text-primary-300">
              {escala.opcoes.find((o) => o.valor === valor)?.rotulo}
            </p>
          )}
        </>
      )}

      {(item.tipoCampo === 'text' || item.tipoCampo === 'textarea') && (
        <div className="mt-3">
          <Textarea
            aria-label={item.texto}
            rows={item.tipoCampo === 'text' ? 2 : 4}
            value={String(valor ?? '')}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Escreva à vontade…"
          />
        </div>
      )}

      {(item.tipoCampo === 'number' || item.tipoCampo === 'date') && (
        <input
          type={item.tipoCampo === 'number' ? 'number' : 'date'}
          aria-label={item.texto}
          value={String(valor ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className="mt-3 w-full rounded border-[1.5px] border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
        />
      )}

      {item.condicional && (
        <button
          type="button"
          aria-pressed={naoSeAplica}
          onClick={() => onChange(naoSeAplica ? '' : NAO_SE_APLICA)}
          className={`mt-3 inline-flex items-center gap-1.5 rounded-pill border-[1.5px] px-3 py-1.5 text-[12px] font-medium transition-colors ${
            naoSeAplica
              ? 'border-primary bg-primary-50 text-primary dark:text-primary-300'
              : 'border-border text-ink-secondary hover:border-border-strong hover:text-ink'
          }`}
        >
          {naoSeAplica && <Icon icon="ph:check-bold" width={11} aria-hidden />}
          Não se aplica a mim
        </button>
      )}
    </fieldset>
  )
}
