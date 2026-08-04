import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { MngTopBar } from '../../components/MngTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { Modal } from '../../components/Modal'
import { Sheet } from '../../components/Sheet'
import { Select } from '../../components/Select'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { VERSAO_STATUS, fmtData } from '../../lib/nr1'
import { useService } from '../../hooks/useService'
import { nr1ModeloService } from '../../services/nr1'
import type { Nr1QuestionarioModelo, Nr1QuestionarioVersao, Nr1Campanha } from '../../types'

/* NR1-MNG-03 — Versões do modelo: publicar, arquivar e comparar
   (RF-YN-NR1-02).

   O ciclo é rascunho → publicada → arquivada, e a publicada é imutável. Antes
   de arquivar, a tela mostra QUAIS campanhas aplicaram aquela versão: arquivar
   não apaga o passado, mas o operador precisa enxergar o que está em uso. */

const contarItens = (v: Nr1QuestionarioVersao) => v.dimensoes.reduce((s, d) => s + d.itens.length, 0)

export function NR1MngVersoes() {
  const { id = '' } = useParams<{ id: string }>()
  const modelo = useService(() => nr1ModeloService.get(id), [id])
  const [acao, setAcao] = useState<{ tipo: 'publicar' | 'arquivar'; versao: Nr1QuestionarioVersao } | null>(null)
  const [usos, setUsos] = useState<Nr1Campanha[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [comparar, setComparar] = useState(false)
  const [processando, setProcessando] = useState(false)

  const abrirAcao = async (tipo: 'publicar' | 'arquivar', versao: Nr1QuestionarioVersao) => {
    setAcao({ tipo, versao })
    setUsos(await nr1ModeloService.usoDaVersao(id, versao.versao))
  }

  const confirmar = async () => {
    if (!acao) return
    setProcessando(true)
    const r: { ok: boolean; message?: string } = acao.tipo === 'publicar'
      ? await nr1ModeloService.publicar(id, acao.versao.versao)
      : await nr1ModeloService.arquivar(id, acao.versao.versao)
    setProcessando(false)
    setAcao(null)
    if (!r.ok) setErro(r.message ?? 'Não foi possível concluir a operação.')
    modelo.reload()
  }

  const novaVersao = async () => {
    await nr1ModeloService.novaVersao(id)
    modelo.reload()
  }

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MngTopBar />

        <Link to="/mng/nr1/modelos" className="mt-2 mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary transition-colors hover:text-ink lg:mt-0">
          <Icon icon="ph:arrow-left-bold" width={14} aria-hidden />
          Modelos de avaliação
        </Link>

        {modelo.status === 'loading' && <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}</div>}
        {modelo.status === 'error' && <ErrorState message={modelo.message} onRetry={modelo.reload} />}
        {modelo.status === 'success' && !modelo.data && <ErrorState message="Modelo não encontrado." onRetry={modelo.reload} />}

        {modelo.status === 'success' && modelo.data && (
          <>
            <PageHeader
              title="Versões do instrumento"
              subtitle={modelo.data.nome}
              action={
                <div className="flex gap-2">
                  {modelo.data.versoes.length > 1 && (
                    <Button variant="ghost" iconLeft="ph:git-diff-bold" onClick={() => setComparar(true)}>
                      <span className="hidden sm:inline">Comparar</span>
                    </Button>
                  )}
                  <Button variant="secondary" iconLeft="ph:plus-bold" onClick={novaVersao}>
                    <span className="hidden sm:inline">Nova versão</span>
                  </Button>
                </div>
              }
            />

            <ol className="flex flex-col gap-3">
              {modelo.data.versoes.map((v) => {
                const st = VERSAO_STATUS[v.status]
                return (
                  <li key={v.versao} className="rounded-lg border border-border bg-surface p-4 lg:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 font-mono text-[13px] font-semibold text-ink">
                          {v.versao}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-heading text-sm font-semibold text-ink">Versão {v.versao}</p>
                            <Badge tone={st.tone}>{st.label}</Badge>
                          </div>
                          <p className="mt-0.5 text-[11.5px] text-ink-muted">
                            {contarItens(v)} itens · criada em {fmtData(v.criadaEm)}
                            {v.publicadaEm && ` · publicada em ${fmtData(v.publicadaEm)}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {v.status === 'rascunho' && (
                          <>
                            <Link to={`/mng/nr1/modelos/${modelo.data!.id}`}>
                              <Button size="sm" variant="ghost" iconLeft="ph:pencil-simple-bold">Editar</Button>
                            </Link>
                            <Button size="sm" iconLeft="ph:paper-plane-tilt-bold" onClick={() => abrirAcao('publicar', v)}>Publicar</Button>
                          </>
                        )}
                        {v.status === 'publicada' && (
                          <Button size="sm" variant="ghost" iconLeft="ph:archive-bold" onClick={() => abrirAcao('arquivar', v)}>Arquivar</Button>
                        )}
                      </div>
                    </div>

                    {v.notas && <p className="mt-3 border-t border-border pt-3 text-[12.5px] leading-relaxed text-ink-secondary">{v.notas}</p>}
                  </li>
                )
              })}
            </ol>

            <div className="mt-6 flex gap-3 rounded-lg border border-border bg-surface-2 p-4">
              <Icon icon="ph:seal-check-bold" width={20} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
              <p className="text-[12px] leading-relaxed text-ink-secondary">
                Publicar congela a versão: ela passa a ser aplicável em campanhas e não pode mais
                ser alterada. A versão publicada anterior é arquivada automaticamente — só uma fica
                publicada por vez. Campanhas em curso não mudam de versão no meio do ciclo.
              </p>
            </div>

            <Sheet open={comparar} onClose={() => setComparar(false)} title="Comparar versões" icon="ph:git-diff-bold" size="md">
              <CompararVersoes modelo={modelo.data} />
            </Sheet>
          </>
        )}
      </div>

      <Modal open={acao !== null} title={acao?.tipo === 'publicar' ? 'Publicar versão' : 'Arquivar versão'} onClose={() => setAcao(null)}>
        {acao && (
          <div className="flex flex-col gap-4">
            <p className="text-[13.5px] leading-relaxed text-ink-secondary">
              {acao.tipo === 'publicar' ? (
                <>
                  A versão <span className="font-semibold text-ink">{acao.versao.versao}</span> passa a ser a
                  aplicável nas novas campanhas e não poderá mais ser editada. A publicada atual
                  será arquivada.
                </>
              ) : (
                <>
                  A versão <span className="font-semibold text-ink">{acao.versao.versao}</span> deixa de ser
                  oferecida em novas campanhas. O histórico e as avaliações já respondidas
                  permanecem intactos.
                </>
              )}
            </p>

            {usos.length > 0 && (
              <div className="rounded-lg border border-border bg-surface-2 p-3.5">
                <p className="mb-2 text-[12px] font-semibold text-ink">
                  {usos.length === 1 ? 'Campanha que aplicou esta versão' : 'Campanhas que aplicaram esta versão'}
                </p>
                <ul className="flex flex-col gap-1.5">
                  {usos.map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-2 text-[12px] text-ink-secondary">
                      <span className="min-w-0 truncate">{c.nome}</span>
                      <span className="shrink-0 font-mono text-[11px] text-ink-muted">{c.protocolo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setAcao(null)}>Cancelar</Button>
              <Button
                fullWidth
                iconLeft={acao.tipo === 'publicar' ? 'ph:paper-plane-tilt-bold' : 'ph:archive-bold'}
                disabled={processando}
                onClick={confirmar}
              >
                {processando ? 'Processando…' : acao.tipo === 'publicar' ? 'Publicar versão' : 'Arquivar versão'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={erro !== null} title="Não foi possível concluir" onClose={() => setErro(null)}>
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px] leading-relaxed text-ink-secondary">{erro}</p>
          <Button fullWidth onClick={() => setErro(null)}>Entendi</Button>
        </div>
      </Modal>
    </div>
  )
}

/* Diff entre duas versões — itens acrescentados e removidos. */
function CompararVersoes({ modelo }: { modelo: Nr1QuestionarioModelo }) {
  const [a, setA] = useState(modelo.versoes[1]?.versao ?? modelo.versoes[0]!.versao)
  const [b, setB] = useState(modelo.versoes[0]!.versao)
  const diff = useService(() => nr1ModeloService.comparar(modelo.id, a, b), [modelo.id, a, b])

  const opcoes = modelo.versoes.map((v) => ({ value: v.versao, label: `v${v.versao} · ${VERSAO_STATUS[v.status].label}` }))
  const textoDoItem = (id: string) =>
    modelo.versoes.flatMap((v) => v.dimensoes).flatMap((d) => d.itens).find((i) => i.id === id)?.texto ?? ''

  return (
    <div className="flex flex-col gap-5 px-5 py-6 lg:px-6">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1.5 text-[12px] font-semibold text-ink">De</p>
          <Select value={a} onChange={setA} ariaLabel="Versão base da comparação" options={opcoes} />
        </div>
        <div>
          <p className="mb-1.5 text-[12px] font-semibold text-ink">Para</p>
          <Select value={b} onChange={setB} ariaLabel="Versão comparada" options={opcoes} />
        </div>
      </div>

      {diff.status === 'loading' && <Skeleton className="h-32 w-full rounded-lg" />}
      {diff.status === 'error' && <ErrorState message={diff.message} onRetry={diff.reload} />}
      {diff.status === 'success' && diff.data && (
        <>
          {diff.data.adicionados.length === 0 && diff.data.removidos.length === 0 && (
            <p className="rounded-lg bg-surface-2 px-4 py-6 text-center text-[13px] text-ink-secondary">
              As duas versões têm exatamente os mesmos itens.
            </p>
          )}

          {diff.data.adicionados.length > 0 && (
            <section>
              <h3 className="mb-2 flex items-center gap-1.5 font-heading text-[13px] font-semibold text-success-ink">
                <Icon icon="ph:plus-circle-bold" width={14} aria-hidden />
                {diff.data.adicionados.length} {diff.data.adicionados.length === 1 ? 'item acrescentado' : 'itens acrescentados'}
              </h3>
              <ul className="flex flex-col gap-1.5">
                {diff.data.adicionados.map((id) => (
                  <li key={id} className="rounded-lg bg-success-bg px-3.5 py-2">
                    <span className="font-mono text-[11px] font-semibold text-success-ink">{id}</span>
                    <p className="mt-0.5 text-[12.5px] leading-snug text-ink-secondary">{textoDoItem(id)}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {diff.data.removidos.length > 0 && (
            <section>
              <h3 className="mb-2 flex items-center gap-1.5 font-heading text-[13px] font-semibold text-danger-ink">
                <Icon icon="ph:minus-circle-bold" width={14} aria-hidden />
                {diff.data.removidos.length} {diff.data.removidos.length === 1 ? 'item removido' : 'itens removidos'}
              </h3>
              <ul className="flex flex-col gap-1.5">
                {diff.data.removidos.map((id) => (
                  <li key={id} className="rounded-lg bg-danger-bg px-3.5 py-2">
                    <span className="font-mono text-[11px] font-semibold text-danger-ink">{id}</span>
                    <p className="mt-0.5 text-[12.5px] leading-snug text-ink-secondary">{textoDoItem(id)}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}
