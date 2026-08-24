import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { Sheet } from '../../components/Sheet'
import { Modal } from '../../components/Modal'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { Nr1AdicionarRiscoForm } from '../../components/Nr1AdicionarRiscoForm'
import { PAGE_MAX_W } from '../../lib/layout'
import { NIVEL_RISCO, STATUS_RISCO, ACAO_RECOMENDADA } from '../../lib/nr1'
import { useService } from '../../hooks/useService'
import { useRh } from '../../contexts/RhContext'
import { nr1ResultadoService, nr1AcaoService } from '../../services/nr1'
import type { Nr1RiscoInventario, Nr1Acao, Nr1RiscoCiclo, Nr1Tendencia } from '../../types'

/* NR1-RH-03 — Inventário de riscos psicossociais para o PGR (RF-D01/02/03).

   Este é o entregável legal central: o que precisa constar no PGR do cliente.
   Cada linha traz o formato do GRO — fator/perigo, possíveis danos, grupo
   exposto, nível (probabilidade × severidade) e controles recomendados.

   A citação do instrumento (modelo + versão + protocolo) aparece no topo e vai
   junto na exportação: sem ela o inventário não se sustenta em fiscalização.

   "Adicionar risco" cobre o caso de um risco identificado fora da pesquisa
   (auditoria, observação direta do SESMT) — nasce sem histórico de ciclos,
   então aparece como "Identificado", sem tendência/sugestão ainda (essas só
   existem a partir do 2º ciclo com dado, ver `nr1AnalisarEvolucao`). */

export function NR1RhInventario() {
  const { instrumentoNr1 } = useRh()
  const [params] = useSearchParams()
  const detalheParam = params.get('detalhe')
  const inventario = useService(() => nr1ResultadoService.inventario(), [])
  const acoes = useService(() => nr1AcaoService.list(), [])
  const [detalhe, setDetalhe] = useState<Nr1RiscoInventario | null>(null)
  const [novoRiscoOpen, setNovoRiscoOpen] = useState(false)
  const [exportando, setExportando] = useState<'pdf' | 'planilha' | null>(null)
  const [exportado, setExportado] = useState<string | null>(null)

  /* Deep-link para abrir o detalhe de um risco específico direto (usado pela
     coluna "Ação" do Plano de ação — clicar na dimensão/risco de uma ação
     leva para aqui já com o detalhe aberto, em vez de deixar a pessoa achar
     o risco na lista de novo). */
  useEffect(() => {
    if (!detalheParam || inventario.status !== 'success') return
    const r = inventario.data.find((x) => x.id === detalheParam)
    if (r) setDetalhe(r)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detalheParam, inventario.status])

  const exportar = async (formato: 'pdf' | 'planilha') => {
    setExportando(formato)
    const r = await nr1ResultadoService.exportarInventario(formato)
    setExportando(null)
    setExportado(r.arquivo)
  }

  const acoesDoRisco = (riscoId: string): Nr1Acao[] =>
    acoes.status === 'success' ? acoes.data.filter((a) => a.riscoId === riscoId) : []

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />

        <PageHeader
          className="mt-2 lg:mt-0"
          title="Inventário de Riscos"
          subtitle="Os fatores de risco psicossocial, prontos para incorporar ao seu PGR."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary" iconLeft="ph:plus-bold" onClick={() => setNovoRiscoOpen(true)}>
                <span className="hidden sm:inline">Adicionar risco</span>
              </Button>
              <div className="hidden gap-2 sm:flex">
                <Button variant="ghost" iconLeft="ph:file-xls-bold" disabled={exportando !== null} onClick={() => exportar('planilha')}>
                  {exportando === 'planilha' ? 'Gerando…' : 'Planilha'}
                </Button>
                <Button variant="secondary" iconLeft="ph:file-pdf-bold" disabled={exportando !== null} onClick={() => exportar('pdf')}>
                  {exportando === 'pdf' ? 'Gerando…' : 'PDF'}
                </Button>
              </div>
            </div>
          }
        />

        {/* Registro metodológico — viaja com o inventário */}
        {instrumentoNr1 && (
          <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-border bg-surface p-4">
            <span className="flex items-center gap-2 text-[12.5px] text-ink-secondary">
              <Icon icon="ph:seal-check-bold" width={15} className="text-primary dark:text-primary-300" aria-hidden />
              {instrumentoNr1.modeloNome} · versão {instrumentoNr1.versao}
            </span>
            <span className="font-mono text-[11.5px] text-ink-muted">protocolo {instrumentoNr1.protocolo}</span>
          </div>
        )}

        {(inventario.status === 'idle' || inventario.status === 'loading') && (
          <div className="flex flex-col gap-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}</div>
        )}
        {inventario.status === 'error' && <ErrorState message={inventario.message} onRetry={inventario.reload} />}

        {inventario.status === 'success' && (
          <>
            <div className="flex flex-col gap-3">
              {inventario.data.map((r) => {
                const st = NIVEL_RISCO[r.nivel]
                const vinculadas = acoesDoRisco(r.id)
                return (
                  <article key={r.id} className="rounded-lg border border-border bg-surface p-4 lg:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">{r.dimensao}</span>
                          <span className="text-[11px] text-ink-muted">·</span>
                          <span className="text-[11.5px] font-medium text-ink-secondary">{r.grupoExposto}</span>
                        </div>
                        <p className="mt-2 text-[14px] leading-snug text-ink">{r.fator}</p>
                      </div>
                      <span className={`inline-flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-3 py-2 ${st.cls}`}>
                        <span className="font-mono text-[16px] font-bold leading-none">{r.nivelNum}</span>
                        <span className="text-[10.5px] font-semibold leading-none">{st.label}</span>
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-ink-muted">
                      <span>Probabilidade {r.probabilidade} × severidade {r.severidade}</span>
                      <span>{r.respondentes} respondentes</span>
                      {vinculadas.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-ink-secondary">
                          <Icon icon="ph:list-checks-bold" width={12} aria-hidden />
                          {vinculadas.length} {vinculadas.length === 1 ? 'ação vinculada' : 'ações vinculadas'}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                      <EvolucaoBadges risco={r} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                      <Button size="sm" variant="ghost" iconLeft="ph:eye-bold" onClick={() => setDetalhe(r)}>
                        Ver detalhe
                      </Button>
                      <Link to={`/rh/nr1/plano-acao?risco=${r.id}`}>
                        <Button size="sm" variant="ghost" iconLeft={vinculadas.length > 0 ? 'ph:list-checks-bold' : 'ph:plus-bold'}>
                          {vinculadas.length > 0 ? 'Ver plano de ação' : 'Definir ação'}
                        </Button>
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>

            {/* Exportação — mobile */}
            <div className="mt-5 flex gap-2 sm:hidden">
              <Button fullWidth variant="ghost" iconLeft="ph:file-xls-bold" disabled={exportando !== null} onClick={() => exportar('planilha')}>
                {exportando === 'planilha' ? 'Gerando…' : 'Planilha'}
              </Button>
              <Button fullWidth variant="secondary" iconLeft="ph:file-pdf-bold" disabled={exportando !== null} onClick={() => exportar('pdf')}>
                {exportando === 'pdf' ? 'Gerando…' : 'PDF'}
              </Button>
            </div>

            <div className="mt-6 flex gap-3 rounded-lg border border-border bg-surface-2 p-4">
              <Icon icon="ph:info-bold" width={20} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
              <p className="text-[12px] leading-relaxed text-ink-secondary">
                A YNA entrega o inventário no formato do GRO, pronto para ser incorporado ao PGR
                que a sua empresa já mantém. Não substituímos o seu software de SST, nem
                assinamos o documento. A responsabilidade técnica é do SESMT ou da consultoria.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Detalhe do risco */}
      <Sheet open={detalhe !== null} onClose={() => setDetalhe(null)} title="Detalhe do risco" icon="ph:clipboard-text-bold" size="md">
        {detalhe && <RiscoDetalhe risco={detalhe} acoes={acoesDoRisco(detalhe.id)} />}
      </Sheet>

      {/* Adicionar risco */}
      <Sheet open={novoRiscoOpen} onClose={() => setNovoRiscoOpen(false)} title="Adicionar risco" icon="ph:plus-bold" size="md">
        <Nr1AdicionarRiscoForm
          onClose={() => setNovoRiscoOpen(false)}
          onSaved={() => { setNovoRiscoOpen(false); inventario.reload() }}
        />
      </Sheet>

      <Modal open={exportado !== null} title="Arquivo gerado" onClose={() => setExportado(null)}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-3.5">
            <Icon icon="ph:file-arrow-down-bold" width={20} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
            <span className="min-w-0 truncate font-mono text-[12.5px] text-ink">{exportado}</span>
          </div>
          <p className="text-[12.5px] leading-relaxed text-ink-secondary">
            O arquivo traz o inventário completo com a versão do instrumento e o protocolo do
            ciclo, que é o que o responsável técnico precisa para anexar ao PGR.
          </p>
          <Button fullWidth onClick={() => setExportado(null)}>Fechar</Button>
        </div>
      </Modal>
    </div>
  )
}

function RiscoDetalhe({ risco, acoes }: { risco: Nr1RiscoInventario; acoes: Nr1Acao[] }) {
  const st = NIVEL_RISCO[risco.nivel]
  return (
    <div className="flex flex-col gap-5 px-5 py-6 lg:px-6">
      <Campo label="Descrição do fator / perigo">{risco.fator}</Campo>
      <Campo label="Possíveis danos à saúde">{risco.danos}</Campo>
      <Campo label="Grupo de trabalhadores exposto">
        {risco.grupoExposto} · {risco.respondentes} respondentes
      </Campo>

      <div>
        <p className="mb-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          Nível de risco
        </p>
        <div className="flex items-center gap-3">
          <span className={`flex flex-col items-center gap-0.5 rounded-lg px-4 py-2.5 ${st.cls}`}>
            <span className="font-mono text-[20px] font-bold leading-none">{risco.nivelNum}</span>
            <span className="text-[11px] font-semibold leading-none">{st.label}</span>
          </span>
          <div className="text-[12.5px] text-ink-secondary">
            <p>Probabilidade {risco.probabilidade} × severidade {risco.severidade}</p>
            <p className="mt-0.5 font-medium text-ink">{st.acao}</p>
          </div>
        </div>
      </div>

      <EvolucaoHistorico riscoId={risco.id} />

      <div>
        <p className="mb-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          Controles recomendados
        </p>
        <ul className="flex flex-col gap-1.5">
          {risco.controles.map((c, i) => (
            <li key={i} className="flex items-start gap-2 rounded-lg bg-surface-2 px-3.5 py-2.5 text-[13px] leading-snug text-ink-secondary">
              <Icon icon="ph:check-bold" width={13} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
              {c}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          Ações vinculadas
        </p>
        {acoes.length === 0 ? (
          <p className="rounded-lg bg-surface-2 px-3.5 py-3 text-[12.5px] text-ink-secondary">
            Nenhuma ação definida ainda. Priorizar um risco e não agir sobre ele deixa a cadeia
            pela metade.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {acoes.map((a) => (
              <li key={a.id} className="rounded-lg bg-surface-2 px-3.5 py-2.5">
                <p className="text-[13px] font-medium leading-snug text-ink">{a.oQue}</p>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">{a.quem} · prazo {a.quando}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">{label}</p>
      <p className="text-[13.5px] leading-relaxed text-ink">{children}</p>
    </div>
  )
}

/* Status + tendência + sugestão do risco — sempre uma leitura calculada a
   partir do histórico entre ciclos (ver nr1AnalisarEvolucao), nunca uma
   conclusão. O card mostra a sugestão; quem decide o que fazer com ela é o
   SST/RH. */
function EvolucaoBadges({ risco }: { risco: Nr1RiscoInventario }) {
  const st = STATUS_RISCO[risco.status]
  return (
    <>
      <Badge tone={st.tone} icon={st.icon}>{st.label}</Badge>
      {risco.tendencia && <TendenciaTag tendencia={risco.tendencia} variacaoPontos={risco.variacaoPontos} />}
      {risco.acaoRecomendada && (
        <span className="text-[11.5px] text-ink-secondary">
          Sugestão: <span className="font-medium text-ink">{ACAO_RECOMENDADA[risco.acaoRecomendada].label}</span>
        </span>
      )}
    </>
  )
}

const TENDENCIA_VISUAL: Record<Nr1Tendencia, { icon: string; cls: string; label: string }> = {
  melhorando: { icon: 'ph:trend-up-bold', cls: 'text-success-ink', label: 'Melhorando' },
  estavel: { icon: 'ph:minus-bold', cls: 'text-ink-muted', label: 'Estável' },
  piorando: { icon: 'ph:trend-down-bold', cls: 'text-danger-ink', label: 'Piorando' },
}

function TendenciaTag({ tendencia, variacaoPontos }: { tendencia: Nr1Tendencia; variacaoPontos?: number }) {
  const v = TENDENCIA_VISUAL[tendencia]
  return (
    <span className={`inline-flex items-center gap-1 text-[11.5px] font-medium ${v.cls}`}>
      <Icon icon={v.icon} width={13} aria-hidden />
      {v.label}
      {variacaoPontos !== undefined && ` (${variacaoPontos > 0 ? '+' : ''}${variacaoPontos.toFixed(1)})`}
    </span>
  )
}

/* Histórico ciclo a ciclo do risco — só aparece quando há 2+ pontos (antes
   disso não há "evolução", só o primeiro registro). Cada ponto usa a MESMA
   média/nível da célula correspondente no mapa de calor daquela campanha. */
function EvolucaoHistorico({ riscoId }: { riscoId: string }) {
  const historico = useService(() => nr1ResultadoService.riscoCiclos(riscoId), [riscoId])

  if (historico.status !== 'success' || historico.data.length < 2) return null

  return (
    <div>
      <p className="mb-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
        Evolução entre ciclos
      </p>
      <ul className="flex flex-col gap-1.5">
        {historico.data.map((c: Nr1RiscoCiclo, i: number) => {
          const st = NIVEL_RISCO[c.nivel]
          return (
            <li key={c.campanhaId} className="flex items-center justify-between gap-3 rounded-lg bg-surface-2 px-3.5 py-2.5">
              <div className="min-w-0">
                <p className="text-[12.5px] font-medium text-ink">{i + 1}º ciclo</p>
                {c.acaoRecomendada && (
                  <p className="mt-0.5 text-[11px] text-ink-secondary">Sugestão: {ACAO_RECOMENDADA[c.acaoRecomendada].label}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {c.tendencia && <TendenciaTag tendencia={c.tendencia} variacaoPontos={c.variacaoPontos} />}
                <span className={`rounded-pill px-2 py-0.5 font-mono text-[11px] font-semibold ${st.cls}`}>
                  {c.media.toFixed(1)} · {st.label}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* O formulário "Adicionar risco" foi extraído para
   `components/Nr1AdicionarRiscoForm.tsx` — reaproveitado também pela aba
   "Riscos sugeridos" (`Nr1RiscosSugeridos.tsx`), com valores pré-preenchidos
   a partir da leitura da sugestão. */
