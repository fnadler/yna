import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { MngTopBar } from '../../components/MngTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Sheet } from '../../components/Sheet'
import { Modal } from '../../components/Modal'
import { Select } from '../../components/Select'
import { SearchSelect } from '../../components/SearchSelect'
import { MultiSelect } from '../../components/MultiSelect'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { Toast } from '../../components/Toast'
import { PAGE_MAX_W } from '../../lib/layout'
import { NR1_SEVERIDADE_ROTULOS, NR1_SEVERIDADE_CLS } from '../../lib/nr1'
import { nr1FatorService } from '../../services/nr1'
import { NR1_DIMENSOES } from '../../data/nr1Mock'
import type { Nr1AcaoSugerida, Nr1Cid, Nr1DimensaoId, Nr1FatorRisco, Nr1FonteGeradora, Nr1Severidade } from '../../types'

/* NR1-MNG — Catálogo de fatores de risco (nova estrutura, fase 2).

   É aqui que a YNA define o que o questionário identifica e o que o RH
   recebe pronto: cada fator tem domínio, explicação simples, severidade
   fixa, até 3 lesões/agravos (CID), as perguntas que o indicam, as fontes
   geradoras típicas e as ações sugeridas. CIDs e fontes geradoras são
   tabelas próprias, ligadas aos fatores — um mesmo CID ou fonte serve a
   vários fatores. O RH nunca edita nada disso: é fixo da YNA. */

const inputCls = 'w-full rounded border-[1.5px] border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary'

type Aba = 'fatores' | 'cids' | 'fontes'

const SEVERIDADE_CLS = NR1_SEVERIDADE_CLS

export function NR1MngFatores() {
  const [fatores, setFatores] = useState<Nr1FatorRisco[] | null>(null)
  const [cids, setCids] = useState<Nr1Cid[]>([])
  const [fontes, setFontes] = useState<Nr1FonteGeradora[]>([])
  const [perguntas, setPerguntas] = useState<{ id: string; texto: string; dimensaoId: Nr1DimensaoId }[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [aba, setAba] = useState<Aba>('fatores')
  const [feedback, setFeedback] = useState<string | null>(null)

  const carregar = () => {
    setErro(null)
    Promise.all([nr1FatorService.catalogo(), nr1FatorService.cids(), nr1FatorService.fontes(), nr1FatorService.perguntas()])
      .then(([f, c, fo, p]) => { setFatores([...f]); setCids([...c]); setFontes([...fo]); setPerguntas(p) })
      .catch(() => setErro('Não foi possível carregar o catálogo.'))
  }
  useEffect(carregar, [])

  /* Os serviços mutam os registros no lugar; recarregar devolve cópias novas
     para a tela re-renderizar. */
  const recarregar = async () => {
    const [f, c, fo] = await Promise.all([nr1FatorService.catalogo(), nr1FatorService.cids(), nr1FatorService.fontes()])
    setFatores(f.map((x) => ({ ...x }))); setCids([...c]); setFontes([...fo])
  }

  const abas: { valor: Aba; label: string; icon: string; n: number }[] = [
    { valor: 'fatores', label: 'Fatores de risco', icon: 'ph:warning-diamond-bold', n: fatores?.length ?? 0 },
    { valor: 'cids', label: 'Lesões e agravos (CID)', icon: 'ph:first-aid-kit-bold', n: cids.length },
    { valor: 'fontes', label: 'Fontes geradoras', icon: 'ph:tree-structure-bold', n: fontes.length },
  ]

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MngTopBar />

        <PageHeader
          className="mt-2 lg:mt-0"
          title="Fatores de risco"
          subtitle="O que o questionário identifica e o que o RH recebe pronto para agir."
        />

        <div className="mb-6 flex gap-3 rounded-lg border border-warning/30 bg-warning-bg p-4">
          <Icon icon="ph:flask-bold" width={20} className="mt-0.5 shrink-0 text-warning-ink" aria-hidden />
          <p className="text-[12.5px] leading-relaxed text-ink-secondary">
            <strong className="font-semibold text-ink">Primeira versão para o protótipo.</strong> Severidades, CIDs e
            vínculos com as perguntas estão pendentes de validação da curadoria clínica e de SST da YNA.
            Tudo aqui é fixo para os clientes: o RH não altera nenhum desses dados.
          </p>
        </div>

        <div className="mb-5 flex gap-1 rounded-lg bg-surface-2 p-1" role="tablist" aria-label="Catálogo">
          {abas.map((t) => (
            <button
              key={t.valor}
              role="tab"
              aria-selected={aba === t.valor}
              onClick={() => setAba(t.valor)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 font-heading text-sm font-semibold transition-all ${
                aba === t.valor ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
              }`}
            >
              <Icon icon={t.icon} width={15} aria-hidden />
              <span className="hidden sm:inline">{t.label}</span>
              {t.n > 0 && <span className="rounded-pill bg-surface px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink-secondary">{t.n}</span>}
            </button>
          ))}
        </div>

        {erro && <ErrorState message={erro} onRetry={carregar} />}
        {!erro && !fatores && (
          <div className="flex flex-col gap-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}</div>
        )}

        {fatores && aba === 'fatores' && (
          <AbaFatores fatores={fatores} cids={cids} fontes={fontes} perguntas={perguntas} onAlterado={recarregar} onFeedback={setFeedback} />
        )}
        {fatores && aba === 'cids' && (
          <AbaCadastro
            tipo="cid"
            itens={cids.map((c) => ({ id: c.id, nome: c.nome, codigo: c.codigo }))}
            fatoresQueUsam={(id) => fatores.filter((f) => f.cidIds.includes(id))}
            onSalvar={async (i) => { await nr1FatorService.salvarCid({ id: i.id, codigo: i.codigo ?? '', nome: i.nome }); await recarregar() }}
            onExcluir={async (id) => { await nr1FatorService.excluirCid(id); await recarregar() }}
            onFeedback={setFeedback}
          />
        )}
        {fatores && aba === 'fontes' && (
          <AbaCadastro
            tipo="fonte"
            itens={fontes.map((f) => ({ id: f.id, nome: f.nome }))}
            fatoresQueUsam={(id) => fatores.filter((f) => f.fontesGeradorasIds.includes(id))}
            onSalvar={async (i) => { await nr1FatorService.salvarFonte({ id: i.id, nome: i.nome }); await recarregar() }}
            onExcluir={async (id) => { await nr1FatorService.excluirFonte(id); await recarregar() }}
            onFeedback={setFeedback}
          />
        )}
      </div>

      <Toast message={feedback} onClose={() => setFeedback(null)} />
    </div>
  )
}

/* ------------------------------------------------------------------
   Aba "Fatores de risco" — agrupados por domínio
   ------------------------------------------------------------------ */

function AbaFatores({ fatores, cids, fontes, perguntas, onAlterado, onFeedback }: {
  fatores: Nr1FatorRisco[]
  cids: Nr1Cid[]
  fontes: Nr1FonteGeradora[]
  perguntas: { id: string; texto: string; dimensaoId: Nr1DimensaoId }[]
  onAlterado: () => Promise<void>
  onFeedback: (m: string) => void
}) {
  const [busca, setBusca] = useState('')
  const [dominio, setDominio] = useState<'todos' | Nr1DimensaoId>('todos')
  const [editando, setEditando] = useState<Nr1FatorRisco | 'novo' | null>(null)

  const termo = busca.trim().toLowerCase()
  const filtrados = fatores
    .filter((f) => dominio === 'todos' || f.dimensaoId === dominio)
    .filter((f) => !termo || f.nome.toLowerCase().includes(termo) || f.descricao.toLowerCase().includes(termo))
  const grupos = NR1_DIMENSOES
    .map((d) => ({ dim: d, itens: filtrados.filter((f) => f.dimensaoId === d.id) }))
    .filter((g) => g.itens.length > 0)

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="mb-1 block text-[11.5px] font-medium text-ink-secondary">Palavra-chave</span>
          <span className="relative block">
            <Icon icon="ph:magnifying-glass-bold" width={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden />
            <input className={`${inputCls} pl-9`} value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar fator de risco…" />
          </span>
        </label>
        <div className="sm:w-64">
          <p className="mb-1 text-[11.5px] font-medium text-ink-secondary">Domínio</p>
          <Select
            value={dominio}
            onChange={(v) => setDominio(v as 'todos' | Nr1DimensaoId)}
            ariaLabel="Filtrar por domínio"
            options={[{ value: 'todos', label: 'Todos os domínios' }, ...NR1_DIMENSOES.map((d) => ({ value: d.id, label: d.nome }))]}
          />
        </div>
        <Button iconLeft="ph:plus-bold" onClick={() => setEditando('novo')}>Novo fator</Button>
      </div>

      {grupos.length === 0 && (
        <p className="rounded-lg border border-border bg-surface px-5 py-12 text-center text-[13px] text-ink-secondary">Nenhum fator encontrado.</p>
      )}

      <div className="flex flex-col gap-6">
        {grupos.map(({ dim, itens }) => (
          <section key={dim.id}>
            <h2 className="mb-2 flex items-center gap-2 font-heading text-[14px] font-semibold text-ink">
              <Icon icon={dim.icon} width={16} className="text-primary dark:text-primary-300" aria-hidden />
              {dim.nome}
              <span className="font-mono text-[11px] font-normal text-ink-muted">{itens.length}</span>
            </h2>
            <ul className="flex flex-col gap-2">
              {itens.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => setEditando(f)}
                    className="flex w-full items-start gap-3 rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:border-border-strong hover:bg-surface-hover"
                  >
                    <span className={`flex w-14 shrink-0 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 ${SEVERIDADE_CLS[f.severidade]}`} title="Severidade">
                      <span className="font-mono text-[15px] font-bold leading-none">S{f.severidade}</span>
                      <span className="text-[9px] font-semibold leading-none">{NR1_SEVERIDADE_ROTULOS[f.severidade - 1]}</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold leading-snug text-ink">{f.nome}</p>
                      <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-relaxed text-ink-secondary">{f.descricao || 'Sem explicação para o RH.'}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11.5px] text-ink-secondary">
                        {f.cidIds.map((id) => {
                          const c = cids.find((x) => x.id === id)
                          return c ? (
                            <span key={id} title={c.nome} className="rounded-pill bg-surface-2 px-2 py-0.5 font-mono text-[11px] font-medium text-ink">{c.codigo}</span>
                          ) : null
                        })}
                        {f.cidIds.length === 0 && <span className="text-warning-ink">Sem CID</span>}
                        <span className="text-ink-muted">·</span>
                        <span className={f.itemIds.length === 0 ? 'font-medium text-warning-ink' : ''}>
                          {f.itemIds.length} {f.itemIds.length === 1 ? 'pergunta' : 'perguntas'}
                        </span>
                        <span className="text-ink-muted">·</span>
                        <span>{f.acoesSugeridas.length} {f.acoesSugeridas.length === 1 ? 'ação sugerida' : 'ações sugeridas'}</span>
                      </div>
                    </div>
                    <Icon icon="ph:caret-right-bold" width={14} className="mt-1 shrink-0 text-ink-muted" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <Sheet
        open={editando !== null}
        onClose={() => setEditando(null)}
        title={editando === 'novo' ? 'Novo fator de risco' : editando ? editando.nome : ''}
        icon="ph:warning-diamond-bold"
        size="lg"
      >
        {editando && (
          <FatorForm
            key={editando === 'novo' ? 'novo' : editando.id}
            inicial={editando === 'novo' ? undefined : editando}
            cids={cids}
            fontes={fontes}
            perguntas={perguntas}
            onClose={() => setEditando(null)}
            onSalvo={async (f, novo) => { await onAlterado(); setEditando(null); onFeedback(novo ? `Fator "${f.nome}" criado.` : 'Fator salvo.') }}
            onExcluido={async () => { await onAlterado(); setEditando(null); onFeedback('Fator excluído.') }}
          />
        )}
      </Sheet>
    </>
  )
}

/* Formulário do fator. A confirmação de exclusão é uma sub-view aqui
   dentro, não um `Modal`: este formulário vive num `Sheet` (portal) e um
   `Modal` ficaria atrás dele. */
function FatorForm({ inicial, cids, fontes, perguntas, onClose, onSalvo, onExcluido }: {
  inicial?: Nr1FatorRisco
  cids: Nr1Cid[]
  fontes: Nr1FonteGeradora[]
  perguntas: { id: string; texto: string; dimensaoId: Nr1DimensaoId }[]
  onClose: () => void
  onSalvo: (f: Nr1FatorRisco, novo: boolean) => void
  onExcluido: () => void
}) {
  const [nome, setNome] = useState(inicial?.nome ?? '')
  const [dimensaoId, setDimensaoId] = useState<Nr1DimensaoId>(inicial?.dimensaoId ?? 'demandas')
  const [descricao, setDescricao] = useState(inicial?.descricao ?? '')
  const [severidade, setSeveridade] = useState<Nr1Severidade>(inicial?.severidade ?? 3)
  const [cidIds, setCidIds] = useState<string[]>(inicial?.cidIds ?? [])
  const [itemIds, setItemIds] = useState<string[]>(inicial?.itemIds ?? [])
  const [fonteIds, setFonteIds] = useState<string[]>(inicial?.fontesGeradorasIds ?? [])
  const [acoes, setAcoes] = useState<Nr1AcaoSugerida[]>(inicial?.acoesSugeridas ?? [])
  const [salvando, setSalvando] = useState(false)
  const [confirmarExclusao, setConfirmarExclusao] = useState(false)

  const valido = nome.trim().length >= 3 && descricao.trim().length >= 10 && itemIds.length > 0 && cidIds.length > 0
    && acoes.every((a) => a.oQue.trim().length >= 5)

  const salvar = async () => {
    if (!valido) return
    setSalvando(true)
    const salvo = await nr1FatorService.salvar({
      id: inicial?.id ?? '',
      nome: nome.trim(), dimensaoId, descricao: descricao.trim(), severidade,
      cidIds, itemIds, fontesGeradorasIds: fonteIds,
      acoesSugeridas: acoes.map((a) => ({ ...a, oQue: a.oQue.trim(), porQue: a.porQue.trim(), como: a.como.trim() })),
    })
    setSalvando(false)
    onSalvo(salvo, !inicial)
  }

  const excluir = async () => {
    if (!inicial) return
    setSalvando(true)
    await nr1FatorService.excluir(inicial.id)
    setSalvando(false)
    onExcluido()
  }

  const perguntaPorId = useMemo(() => new Map(perguntas.map((p) => [p.id, p])), [perguntas])
  const dominioNome = (id: Nr1DimensaoId) => NR1_DIMENSOES.find((d) => d.id === id)?.nome ?? id

  if (confirmarExclusao && inicial) {
    return (
      <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
        <p className="text-[13.5px] leading-relaxed text-ink-secondary">
          Excluir o fator <strong className="font-semibold text-ink">{inicial.nome}</strong> do catálogo?
          Ele deixa de ser identificado nos próximos ciclos de todos os clientes. Riscos e planos de ação já
          registrados com ele continuam no histórico.
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setConfirmarExclusao(false)}>Cancelar</Button>
          <Button fullWidth variant="danger" iconLeft="ph:trash-bold" disabled={salvando} onClick={excluir}>
            {salvando ? 'Excluindo…' : 'Excluir fator'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-5 py-6 lg:px-6">
      <Secao titulo="Identificação">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink">Nome do fator</span>
          <input className={inputCls} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Excesso de demandas no trabalho (Sobrecarga)" />
        </label>
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">Domínio</p>
          <Select value={dimensaoId} onChange={(v) => setDimensaoId(v as Nr1DimensaoId)} ariaLabel="Domínio do fator" options={NR1_DIMENSOES.map((d) => ({ value: d.id, label: d.nome }))} />
        </div>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink">Explicação para o RH</span>
          <textarea className={inputCls} rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="O que é e por que importa, em linguagem simples, sem termos técnicos." />
          <span className="mt-1 block text-[11.5px] text-ink-muted">É o texto que o RH lê quando o fator é apontado num departamento.</span>
        </label>
      </Secao>

      <Secao titulo="Severidade" hint="Impacto se o fator ocorrer. Fixa do fator: multiplica a probabilidade que vem do questionário.">
        <div className="flex gap-1 rounded-lg bg-surface-2 p-1" role="radiogroup" aria-label="Severidade">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={severidade === n}
              onClick={() => setSeveridade(n as Nr1Severidade)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 transition-all ${severidade === n ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'}`}
            >
              <span className="font-mono text-[14px] font-semibold">{n}</span>
              <span className="text-[10.5px]">{NR1_SEVERIDADE_ROTULOS[n - 1]}</span>
            </button>
          ))}
        </div>
      </Secao>

      <Secao titulo="Lesões ou agravos à saúde (CID)" hint={`Escolha até 3, da tabela de CIDs. ${cidIds.length}/3 selecionados.`}>
        <div className="flex flex-wrap gap-2">
          {cids.map((c) => {
            const sel = cidIds.includes(c.id)
            const bloqueado = !sel && cidIds.length >= 3
            return (
              <button
                key={c.id}
                type="button"
                disabled={bloqueado}
                onClick={() => setCidIds((l) => (sel ? l.filter((x) => x !== c.id) : [...l, c.id]))}
                aria-pressed={sel}
                className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-[12.5px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  sel ? 'border-primary bg-primary-50 font-medium text-primary dark:text-primary-300' : 'border-border bg-surface text-ink-secondary hover:border-border-strong'
                }`}
              >
                <span className="font-mono text-[11.5px] font-semibold">{c.codigo}</span>
                {c.nome}
              </button>
            )
          })}
        </div>
      </Secao>

      <Secao titulo="Perguntas que indicam o fator" hint="A probabilidade do fator sai da nota média destas perguntas. Uma pergunta pode indicar mais de um fator.">
        {itemIds.length === 0 && <p className="mb-2 rounded-lg bg-warning-bg px-3.5 py-2.5 text-[12px] text-warning-ink">Sem perguntas vinculadas, o fator nunca é identificado.</p>}
        <ul className="mb-2 flex flex-col gap-1.5">
          {itemIds.map((id) => {
            const p = perguntaPorId.get(id)
            return (
              <li key={id} className="flex items-start gap-2.5 rounded-lg border border-border bg-surface px-3 py-2.5">
                <span className="mt-0.5 shrink-0 font-mono text-[11px] font-semibold text-ink-muted">{id}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] leading-snug text-ink">{p?.texto ?? 'Pergunta fora do modelo publicado'}</p>
                  {p && <p className="mt-0.5 text-[11px] text-ink-muted">{dominioNome(p.dimensaoId)}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => setItemIds((l) => l.filter((x) => x !== id))}
                  aria-label={`Desvincular ${id}`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-hover hover:text-danger-ink"
                >
                  <Icon icon="ph:x-bold" width={13} aria-hidden />
                </button>
              </li>
            )
          })}
        </ul>
        <SearchSelect
          value=""
          onChange={(v) => v && setItemIds((l) => (l.includes(v) ? l : [...l, v]))}
          size="md"
          placeholder="Vincular uma pergunta…"
          searchPlaceholder="Buscar pelo código ou texto…"
          options={perguntas.filter((p) => !itemIds.includes(p.id)).map((p) => ({ value: p.id, label: `${p.id} · ${p.texto}` }))}
        />
      </Secao>

      <Secao titulo="Fontes geradoras típicas" hint="O que costuma gerar o fator — ajuda o RH a entender a causa.">
        <MultiSelect
          values={fonteIds}
          onChange={setFonteIds}
          options={fontes.map((f) => ({ value: f.id, label: f.nome }))}
          placeholder="Selecionar fontes geradoras"
          ariaLabel="Fontes geradoras"
        />
      </Secao>

      <Secao titulo="Ações sugeridas" hint="Modelos 5W2H já redigidos. O RH escolhe uma e só completa quem, quando e onde.">
        <ol className="flex flex-col gap-3">
          {acoes.map((a, i) => (
            <li key={a.id || i} className="rounded-lg border border-border bg-surface-2 p-3.5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Ação {i + 1}</span>
                <button
                  type="button"
                  onClick={() => setAcoes((l) => l.filter((_, x) => x !== i))}
                  aria-label={`Remover ação ${i + 1}`}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-hover hover:text-danger-ink"
                >
                  <Icon icon="ph:trash-bold" width={14} aria-hidden />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <input className={inputCls} value={a.oQue} onChange={(e) => setAcoes((l) => l.map((x, j) => (j === i ? { ...x, oQue: e.target.value } : x)))} placeholder="O quê (a medida)" aria-label={`O quê da ação ${i + 1}`} />
                <textarea className={inputCls} rows={2} value={a.porQue} onChange={(e) => setAcoes((l) => l.map((x, j) => (j === i ? { ...x, porQue: e.target.value } : x)))} placeholder="Por quê" aria-label={`Por quê da ação ${i + 1}`} />
                <textarea className={inputCls} rows={2} value={a.como} onChange={(e) => setAcoes((l) => l.map((x, j) => (j === i ? { ...x, como: e.target.value } : x)))} placeholder="Como" aria-label={`Como da ação ${i + 1}`} />
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-2">
          <Button size="sm" variant="ghost" iconLeft="ph:plus-bold" onClick={() => setAcoes((l) => [...l, { id: '', oQue: '', porQue: '', como: '' }])}>
            Adicionar ação sugerida
          </Button>
        </div>
      </Secao>

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:items-center">
        {inicial && (
          <Button variant="ghost" iconLeft="ph:trash-bold" className="sm:mr-auto" onClick={() => setConfirmarExclusao(true)}>Excluir fator</Button>
        )}
        {!valido && <p className="text-[11.5px] text-ink-muted sm:mr-auto">Preencha nome, explicação, ao menos 1 CID e 1 pergunta.</p>}
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button iconLeft="ph:check-bold" disabled={!valido || salvando} onClick={salvar}>
          {salvando ? 'Salvando…' : inicial ? 'Salvar fator' : 'Criar fator'}
        </Button>
      </div>
    </div>
  )
}

function Secao({ titulo, hint, children }: { titulo: string; hint?: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="font-heading text-[14px] font-semibold text-ink">{titulo}</h3>
      {hint && <p className="mt-0.5 text-[12px] leading-relaxed text-ink-secondary">{hint}</p>}
      <div className="mt-2.5 flex flex-col gap-3">{children}</div>
    </section>
  )
}

/* ------------------------------------------------------------------
   Abas "CIDs" e "Fontes geradoras" — tabelas próprias, ligadas aos
   fatores. Mesma mecânica: criar, editar na linha e excluir com a lista
   de fatores que perdem o vínculo.
   ------------------------------------------------------------------ */

interface ItemCadastro { id: string; nome: string; codigo?: string }

function AbaCadastro({ tipo, itens, fatoresQueUsam, onSalvar, onExcluir, onFeedback }: {
  tipo: 'cid' | 'fonte'
  itens: ItemCadastro[]
  fatoresQueUsam: (id: string) => Nr1FatorRisco[]
  onSalvar: (i: ItemCadastro) => Promise<void>
  onExcluir: (id: string) => Promise<void>
  onFeedback: (m: string) => void
}) {
  const ehCid = tipo === 'cid'
  const [busca, setBusca] = useState('')
  const [edicao, setEdicao] = useState<ItemCadastro | null>(null)
  const [excluir, setExcluir] = useState<ItemCadastro | null>(null)
  const [processando, setProcessando] = useState(false)

  const termo = busca.trim().toLowerCase()
  const lista = itens
    .filter((i) => !termo || i.nome.toLowerCase().includes(termo) || i.codigo?.toLowerCase().includes(termo))
    .sort((a, b) => (ehCid ? (a.codigo ?? '').localeCompare(b.codigo ?? '') : a.nome.localeCompare(b.nome)))

  const valida = (i: ItemCadastro) => i.nome.trim().length >= 2 && (!ehCid || (i.codigo ?? '').trim().length >= 2)

  const salvar = async () => {
    if (!edicao || !valida(edicao)) return
    setProcessando(true)
    await onSalvar(edicao)
    setProcessando(false)
    onFeedback(edicao.id ? (ehCid ? 'CID salvo.' : 'Fonte salva.') : (ehCid ? 'CID adicionado.' : 'Fonte adicionada.'))
    setEdicao(null)
  }

  const confirmarExclusao = async () => {
    if (!excluir) return
    setProcessando(true)
    await onExcluir(excluir.id)
    setProcessando(false)
    setExcluir(null)
    onFeedback(ehCid ? 'CID excluído.' : 'Fonte excluída.')
  }

  const linhaEdicao = edicao && (
    <div className="flex flex-col gap-2 rounded-lg border-[1.5px] border-primary/40 bg-surface p-3.5 sm:flex-row sm:items-center">
      {ehCid && (
        <input
          className={`${inputCls} font-mono sm:w-28`}
          value={edicao.codigo ?? ''}
          onChange={(e) => setEdicao({ ...edicao, codigo: e.target.value })}
          placeholder="Código"
          aria-label="Código CID"
          autoFocus
        />
      )}
      <input
        className={inputCls}
        value={edicao.nome}
        onChange={(e) => setEdicao({ ...edicao, nome: e.target.value })}
        placeholder={ehCid ? 'Nome da lesão ou agravo' : 'Nome da fonte geradora'}
        aria-label="Nome"
        autoFocus={!ehCid}
        onKeyDown={(e) => { if (e.key === 'Enter') void salvar(); if (e.key === 'Escape') setEdicao(null) }}
      />
      <div className="flex shrink-0 gap-2">
        <Button variant="ghost" onClick={() => setEdicao(null)}>Cancelar</Button>
        <Button iconLeft="ph:check-bold" disabled={!valida(edicao) || processando} onClick={salvar}>Salvar</Button>
      </div>
    </div>
  )

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="mb-1 block text-[11.5px] font-medium text-ink-secondary">Palavra-chave</span>
          <span className="relative block">
            <Icon icon="ph:magnifying-glass-bold" width={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden />
            <input className={`${inputCls} pl-9`} value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={ehCid ? 'Buscar por código ou nome…' : 'Buscar fonte geradora…'} />
          </span>
        </label>
        <Button iconLeft="ph:plus-bold" disabled={edicao !== null} onClick={() => setEdicao({ id: '', nome: '', codigo: ehCid ? '' : undefined })}>
          {ehCid ? 'Novo CID' : 'Nova fonte'}
        </Button>
      </div>

      {edicao && !edicao.id && <div className="mb-3">{linhaEdicao}</div>}

      <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface">
        {lista.map((i) => {
          if (edicao?.id === i.id) return <li key={i.id} className="p-2">{linhaEdicao}</li>
          const usam = fatoresQueUsam(i.id)
          return (
            <li key={i.id} className="flex items-center gap-3 px-4 py-3">
              {ehCid && <span className="w-16 shrink-0 font-mono text-[12.5px] font-semibold text-ink">{i.codigo}</span>}
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] text-ink">{i.nome}</p>
                <p className="mt-0.5 truncate text-[11.5px] text-ink-muted" title={usam.map((f) => f.nome).join(', ')}>
                  {usam.length === 0 ? 'Nenhum fator vinculado' : `${usam.length} ${usam.length === 1 ? 'fator' : 'fatores'}: ${usam.map((f) => f.nome).join(', ')}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEdicao(i)}
                disabled={edicao !== null}
                aria-label={`Editar ${i.nome}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink disabled:opacity-40"
              >
                <Icon icon="ph:pencil-simple-bold" width={15} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setExcluir(i)}
                disabled={edicao !== null}
                aria-label={`Excluir ${i.nome}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:text-danger-ink disabled:opacity-40"
              >
                <Icon icon="ph:trash-bold" width={15} aria-hidden />
              </button>
            </li>
          )
        })}
        {lista.length === 0 && <li className="px-4 py-10 text-center text-[13px] text-ink-secondary">Nenhum cadastro encontrado.</li>}
      </ul>

      <Modal open={excluir !== null} title={ehCid ? 'Excluir CID?' : 'Excluir fonte geradora?'} onClose={() => setExcluir(null)}>
        {excluir && (
          <div className="flex flex-col gap-4">
            <p className="text-[13.5px] leading-relaxed text-ink-secondary">
              Excluir <strong className="font-semibold text-ink">{ehCid ? `${excluir.codigo} · ` : ''}{excluir.nome}</strong>?
            </p>
            {fatoresQueUsam(excluir.id).length > 0 && (
              <div className="rounded-lg border border-warning/30 bg-warning-bg p-3.5">
                <p className="mb-1.5 text-[12.5px] font-semibold text-ink">
                  Vinculado a {fatoresQueUsam(excluir.id).length} {fatoresQueUsam(excluir.id).length === 1 ? 'fator' : 'fatores'}, que perdem o vínculo:
                </p>
                <ul className="flex flex-col gap-0.5">
                  {fatoresQueUsam(excluir.id).map((f) => <li key={f.id} className="text-[12.5px] text-ink-secondary">{f.nome}</li>)}
                </ul>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setExcluir(null)}>Cancelar</Button>
              <Button fullWidth variant="danger" iconLeft="ph:trash-bold" disabled={processando} onClick={confirmarExclusao}>
                {processando ? 'Excluindo…' : 'Excluir'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
