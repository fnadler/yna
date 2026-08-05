import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { MngTopBar } from '../../components/MngTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { nr1ModeloService } from '../../services/nr1'
import { NR1_DIMENSOES } from '../../data/nr1Mock'
import type { Nr1QuestionarioModelo } from '../../types'

/* NR1-MNG-04 — Núcleo obrigatório (RF-YN-NR1-03/04).

   O núcleo é o conjunto mínimo de dimensões e itens que garante a
   defensabilidade: sem ele, um modelo customizado poderia sair da
   conformidade sem que ninguém percebesse.

   A marcação de núcleo é feita item a item no editor do Modelo YNA; esta tela
   é a visão consolidada — o que está travado, onde, e quais modelos derivados
   o herdam. */

export function NR1MngNucleo() {
  const modelos = useService(() => nr1ModeloService.list(), [])

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MngTopBar />

        <Link to="/mng/nr1/modelos" className="mt-2 mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary transition-colors hover:text-ink lg:mt-0">
          <Icon icon="ph:arrow-left-bold" width={14} aria-hidden />
          Modelos de avaliação
        </Link>

        <PageHeader
          title="Núcleo obrigatório"
          subtitle="O mínimo que todo modelo precisa manter para ser defensável."
          icon="ph:shield-check-bold"
        />

        <div className="mb-6 flex gap-3 rounded-lg border border-border bg-surface p-4">
          <Icon icon="ph:lock-key-bold" width={20} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
          <p className="text-[12.5px] leading-relaxed text-ink-secondary">
            Um modelo de cliente só <strong className="font-semibold text-ink">acrescenta</strong> itens.
            Os do núcleo ficam travados, e a trava vale inclusive para o operador do backoffice: é
            proteção contra erro humano, não apenas contra o cliente.
          </p>
        </div>

        {modelos.status === 'loading' && (
          <div className="flex flex-col gap-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full rounded-lg" />)}</div>
        )}
        {modelos.status === 'error' && <ErrorState message={modelos.message} onRetry={modelos.reload} />}

        {modelos.status === 'success' && <NucleoConteudo modelos={modelos.data} />}
      </div>
    </div>
  )
}

function NucleoConteudo({ modelos }: { modelos: Nr1QuestionarioModelo[] }) {
  const base = modelos.find((m) => m.escopo === 'yna')
  /* O núcleo é definido na versão publicada do Modelo YNA — é ela que os
     derivados herdam. Sem publicada, cai para a mais recente. */
  const versao = base?.versoes.find((v) => v.status === 'publicada') ?? base?.versoes[0]
  const derivados = modelos.filter((m) => m.escopo === 'cliente')

  if (!base || !versao) {
    return <ErrorState message="Nenhum Modelo YNA base encontrado para derivar o núcleo." />
  }

  const totalNucleo = versao.dimensoes.reduce((s, d) => s + d.itens.filter((i) => i.obrigatorioNucleo).length, 0)
  const totalItens = versao.dimensoes.reduce((s, d) => s + d.itens.length, 0)

  return (
    <>
      {/* Resumo */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: 'ph:shield-check-bold', valor: String(totalNucleo), label: 'Itens de núcleo' },
          { icon: 'ph:list-bold', valor: String(totalItens), label: 'Itens na versão' },
          { icon: 'ph:squares-four-bold', valor: String(versao.dimensoes.length), label: 'Dimensões cobertas' },
          { icon: 'ph:git-branch-bold', valor: String(derivados.length), label: 'Modelos que herdam' },
        ].map((s) => (
          <div key={s.label} className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4">
            <Icon icon={s.icon} width={18} className="text-primary dark:text-primary-300" aria-hidden />
            <p className="text-[26px] font-bold leading-none tracking-[-0.02em] text-ink">{s.valor}</p>
            <p className="text-[12px] text-ink-secondary">{s.label}</p>
          </div>
        ))}
      </div>

      <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
        Núcleo por dimensão · Modelo YNA v{versao.versao}
      </p>

      <div className="flex flex-col gap-3">
        {versao.dimensoes.map((d) => {
          const meta = NR1_DIMENSOES.find((x) => x.id === d.id)
          const nucleo = d.itens.filter((i) => i.obrigatorioNucleo)
          const semNucleo = nucleo.length === 0
          return (
            <section key={d.id} className={`rounded-lg border bg-surface ${semNucleo ? 'border-warning/40' : 'border-border'}`}>
              <header className="flex items-start justify-between gap-3 border-b border-border p-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
                    <Icon icon={meta?.icon ?? 'ph:list-bold'} width={20} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-heading text-[15px] font-semibold text-ink">{d.nome}</h2>
                    <p className="mt-0.5 text-[12px] text-ink-secondary">
                      {nucleo.length} de {d.itens.length} itens no núcleo
                    </p>
                  </div>
                </div>
                {semNucleo && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-warning-bg px-2.5 py-1 text-[11px] font-semibold text-warning-ink">
                    <Icon icon="ph:warning-bold" width={11} aria-hidden />
                    Sem cobertura
                  </span>
                )}
              </header>

              {semNucleo ? (
                <p className="px-4 py-5 text-[12.5px] leading-relaxed text-ink-secondary">
                  Nenhum item desta dimensão está marcado como núcleo. Um modelo de cliente
                  poderia removê-la inteira e sair da cobertura das 4 dimensões do Guia do MTE.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {nucleo.map((i) => (
                    <li key={i.id} className="flex items-start gap-3 px-4 py-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary-50 text-primary dark:text-primary-300">
                        <Icon icon="ph:lock-simple-fill" width={11} aria-hidden />
                      </span>
                      <span className="mt-0.5 shrink-0 font-mono text-[11px] font-semibold text-ink-muted">{i.id}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13.5px] leading-snug text-ink">{i.texto}</p>
                        <p className="mt-1 text-[11px] text-ink-muted">
                          Escala {i.escala} · {i.direcao === 'reverso' ? 'reverso' : 'positivo'} · {i.referencia}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12.5px] leading-relaxed text-ink-secondary">
          A marcação de núcleo é feita item a item, no editor do Modelo YNA.
        </p>
        <Link to={`/mng/nr1/modelos/${base.id}`} className="shrink-0">
          <Button size="sm" variant="secondary" iconLeft="ph:list-checks-bold">Editar itens do Modelo YNA</Button>
        </Link>
      </div>

      {/* Quem herda o núcleo */}
      {derivados.length > 0 && (
        <section className="mt-6">
          <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
            Modelos de cliente que herdam este núcleo
          </p>
          <div className="flex flex-col gap-2">
            {derivados.map((m) => {
              const v = m.versoes[0]
              const herdados = v?.dimensoes.reduce((s, d) => s + d.itens.filter((i) => i.obrigatorioNucleo).length, 0) ?? 0
              const proprios = v?.dimensoes.reduce((s, d) => s + d.itens.filter((i) => i.origemCliente).length, 0) ?? 0
              const intacto = herdados >= totalNucleo
              return (
                <Link
                  key={m.id}
                  to={`/mng/nr1/modelos/${m.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-surface-hover"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink-secondary">
                    <Icon icon="ph:buildings-bold" width={20} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-heading text-sm font-semibold text-ink">{m.nome}</p>
                    <p className="mt-0.5 text-[12px] text-ink-secondary">
                      {herdados} itens de núcleo herdados · {proprios} {proprios === 1 ? 'item próprio' : 'itens próprios'}
                    </p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center gap-1 rounded-pill px-2.5 py-1 text-[11px] font-semibold ${intacto ? 'bg-success-bg text-success-ink' : 'bg-danger-bg text-danger-ink'}`}>
                    <Icon icon={intacto ? 'ph:check-circle-bold' : 'ph:warning-bold'} width={11} aria-hidden />
                    {intacto ? 'Núcleo intacto' : 'Núcleo incompleto'}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <div className="mt-6 flex gap-3 rounded-lg border border-border bg-surface-2 p-4">
        <Icon icon="ph:flask-bold" width={20} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
        <p className="text-[12px] leading-relaxed text-ink-secondary">
          <strong className="font-semibold text-ink">Pendente de validação clínica.</strong> A seleção
          atual do núcleo é a proposta do rascunho v0.3 do questionário. A definição final de
          quais dimensões e itens são não-removíveis depende da curadoria clínica.
        </p>
      </div>
    </>
  )
}
