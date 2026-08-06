import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { MngTopBar } from '../../components/MngTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { Sheet } from '../../components/Sheet'
import { Modal } from '../../components/Modal'
import { Select } from '../../components/Select'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { VERSAO_STATUS, fmtData } from '../../lib/nr1'
import { useService } from '../../hooks/useService'
import { nr1ModeloService } from '../../services/nr1'
import { NR1_DIMENSOES } from '../../data/nr1Mock'
import type {
  Nr1QuestionarioModelo, Nr1QuestionarioVersao, Nr1Item, Nr1Dimensao,
  Nr1EscalaId, Nr1Direcao, CampoTipo,
} from '../../types'

/* NR1-MNG-02 — Editor do modelo: dimensões e itens (RF-YN-NR1-01/05).

   Cada item é texto + tipo de campo (união genérica `CampoTipo`) + escala +
   direção + marcação de núcleo.

   Duas travas de governança, ambas aplicadas na UI e no serviço:
   · item de núcleo não pode ser removido — nem pelo operador do backoffice,
     porque a trava é proteção contra erro humano, não contra o cliente;
   · versão publicada é imutável — editar abre uma nova versão em rascunho. */

const inputCls = 'w-full rounded border-[1.5px] border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary'

const TIPOS_CAMPO: { value: CampoTipo; label: string }[] = [
  { value: 'select', label: 'Escala (escolha única)' },
  { value: 'multiselect', label: 'Múltipla escolha' },
  { value: 'text', label: 'Texto curto' },
  { value: 'textarea', label: 'Texto longo' },
  { value: 'number', label: 'Número' },
  { value: 'date', label: 'Data' },
]

export function NR1MngModeloEditor() {
  const { id = '' } = useParams<{ id: string }>()
  const modelo = useService(() => nr1ModeloService.get(id), [id])
  const [versaoSel, setVersaoSel] = useState<string | null>(null)
  /* Fica aqui, e não no conteúdo: recarregar o modelo desmonta o filho, e o
     aviso de "virou uma nova versão" sumiria justamente quando importa. */
  const [aviso, setAviso] = useState<string | null>(null)

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MngTopBar />

        <Link to="/mng/nr1/modelos" className="mt-2 mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary transition-colors hover:text-ink lg:mt-0">
          <Icon icon="ph:arrow-left-bold" width={14} aria-hidden />
          Modelos de avaliação
        </Link>

        {modelo.status === 'loading' && (
          <div className="flex flex-col gap-3"><Skeleton className="h-24 w-full rounded-lg" /><Skeleton className="h-64 w-full rounded-lg" /></div>
        )}
        {modelo.status === 'error' && <ErrorState message={modelo.message} onRetry={modelo.reload} />}
        {modelo.status === 'success' && !modelo.data && (
          <ErrorState message="Modelo não encontrado." onRetry={modelo.reload} />
        )}
        {modelo.status === 'success' && modelo.data && (
          <EditorConteudo
            modelo={modelo.data}
            versaoSel={versaoSel}
            onVersaoSel={setVersaoSel}
            onReload={() => modelo.reload()}
            onAviso={setAviso}
          />
        )}
      </div>

      <Modal open={aviso !== null} title="Nova versão em rascunho" onClose={() => setAviso(null)}>
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px] leading-relaxed text-ink-secondary">{aviso}</p>
          <Button fullWidth onClick={() => setAviso(null)}>Entendi</Button>
        </div>
      </Modal>
    </div>
  )
}

function EditorConteudo({ modelo, versaoSel, onVersaoSel, onReload, onAviso }: {
  modelo: Nr1QuestionarioModelo
  versaoSel: string | null
  onVersaoSel: (v: string) => void
  onReload: () => void
  onAviso: (m: string) => void
}) {
  const editavel = modelo.versoes.find((v) => v.status === 'rascunho') ?? modelo.versoes[0]!
  const versao = modelo.versoes.find((v) => v.versao === versaoSel) ?? editavel
  const bloqueada = versao.status !== 'rascunho'

  const [itemForm, setItemForm] = useState<{ dimensaoId: string; item?: Nr1Item } | null>(null)
  const [remover, setRemover] = useState<{ dimensao: Nr1Dimensao; item: Nr1Item } | null>(null)
  const [escalaOpen, setEscalaOpen] = useState(false)

  const totalItens = versao.dimensoes.reduce((s, d) => s + d.itens.length, 0)
  const totalNucleo = versao.dimensoes.reduce((s, d) => s + d.itens.filter((i) => i.obrigatorioNucleo).length, 0)

  /* Grava no serviço. Se a versão exibida estiver publicada, o serviço cria um
     rascunho novo — devolvemos o usuário para ele em vez de fingir que editou
     a publicada. */
  const gravar = async (mutar: (v: Nr1QuestionarioVersao) => void) => {
    const alvo: Nr1QuestionarioVersao = JSON.parse(JSON.stringify(versao))
    mutar(alvo)
    const salva = await nr1ModeloService.salvarVersao(modelo.id, versao.versao, {
      dimensoes: alvo.dimensoes,
      escala: alvo.escala,
      pontuacao: alvo.pontuacao,
      abertas: alvo.abertas,
    })
    if (salva && salva.versao !== versao.versao) {
      onVersaoSel(salva.versao)
      onAviso(`A versão ${versao.versao} está publicada e é imutável. Suas alterações foram para a nova versão ${salva.versao}, em rascunho.`)
    }
    onReload()
  }

  const salvarItem = async (dimensaoId: string, item: Nr1Item, novo: boolean) => {
    await gravar((v) => {
      const d = v.dimensoes.find((x) => x.id === dimensaoId)
      if (!d) return
      if (novo) d.itens.push(item)
      else {
        const i = d.itens.findIndex((x) => x.id === item.id)
        if (i >= 0) d.itens[i] = item
      }
    })
    setItemForm(null)
  }

  const removerItem = async () => {
    if (!remover) return
    await gravar((v) => {
      const d = v.dimensoes.find((x) => x.id === remover.dimensao.id)
      if (d) d.itens = d.itens.filter((i) => i.id !== remover.item.id)
    })
    setRemover(null)
  }

  return (
    <>
      <PageHeader
        title={modelo.nome}
        subtitle={modelo.escopo === 'yna' ? 'Instrumento base da plataforma.' : `Modelo derivado · ${modelo.clienteNome}`}
        action={
          <Link to={`/mng/nr1/modelos/${modelo.id}/versoes`} className="hidden sm:block">
            <Button variant="ghost" iconLeft="ph:clock-counter-clockwise-bold">Versões</Button>
          </Link>
        }
      />

      {/* Seletor de versão + estado */}
      <div className="mb-6 flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-full sm:w-52">
            <Select
              value={versao.versao}
              onChange={onVersaoSel}
              ariaLabel="Versão em edição"
              options={modelo.versoes.map((v) => ({ value: v.versao, label: `v${v.versao} · ${VERSAO_STATUS[v.status].label}` }))}
            />
          </div>
          <Badge tone={VERSAO_STATUS[versao.status].tone}>{VERSAO_STATUS[versao.status].label}</Badge>
        </div>
        <div className="flex items-center gap-4 text-[12px] text-ink-secondary">
          <span><strong className="font-semibold text-ink">{totalItens}</strong> itens</span>
          <span><strong className="font-semibold text-ink">{totalNucleo}</strong> de núcleo</span>
          <button onClick={() => setEscalaOpen(true)} className="inline-flex items-center gap-1.5 font-medium text-primary transition-colors hover:underline dark:text-primary-300">
            <Icon icon="ph:sliders-horizontal-bold" width={14} aria-hidden />
            Escala e pontuação
          </button>
        </div>
      </div>

      {bloqueada && (
        <div className="mb-6 flex gap-3 rounded-lg border border-warning/30 bg-warning-bg p-4">
          <Icon icon="ph:lock-simple-bold" width={20} className="mt-0.5 shrink-0 text-warning-ink" aria-hidden />
          <p className="text-[12.5px] leading-relaxed text-ink-secondary">
            Esta versão está <strong className="font-semibold text-ink">{VERSAO_STATUS[versao.status].label.toLowerCase()}</strong> e não pode ser alterada.
            Qualquer edição aqui abre automaticamente uma nova versão em rascunho. A publicada
            permanece intacta para as campanhas que a aplicaram.
          </p>
        </div>
      )}

      {/* Dimensões e itens */}
      <div className="flex flex-col gap-4">
        {versao.dimensoes.map((d) => {
          const meta = NR1_DIMENSOES.find((x) => x.id === d.id)
          return (
            <section key={d.id} className="rounded-lg border border-border bg-surface">
              <header className="flex items-start justify-between gap-3 border-b border-border p-4 lg:p-5">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
                    <Icon icon={meta?.icon ?? 'ph:list-bold'} width={20} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-heading text-[15px] font-semibold text-ink">{d.nome}</h2>
                    <p className="mt-0.5 text-[12.5px] text-ink-secondary">{d.descricao}</p>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-[11px] text-ink-muted">{d.itens.length} itens</span>
              </header>

              <ul className="divide-y divide-border">
                {d.itens.map((i) => (
                  <li key={i.id} className="flex items-start gap-3 px-4 py-3 lg:px-5">
                    <span className="mt-0.5 shrink-0 font-mono text-[11px] font-semibold text-ink-muted">{i.id}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] leading-snug text-ink">{i.texto}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {i.obrigatorioNucleo && (
                          <span className="inline-flex items-center gap-1 rounded-pill bg-primary-50 px-2 py-0.5 text-[10.5px] font-semibold text-primary dark:text-primary-300">
                            <Icon icon="ph:shield-check-fill" width={10} aria-hidden />
                            Núcleo
                          </span>
                        )}
                        {i.origemCliente && (
                          <span className="rounded-pill bg-lavender/40 px-2 py-0.5 text-[10.5px] font-semibold text-ink-secondary dark:bg-surface-2">Item do cliente</span>
                        )}
                        {i.sensivel && (
                          <span className="inline-flex items-center gap-1 rounded-pill bg-warning-bg px-2 py-0.5 text-[10.5px] font-semibold text-warning-ink">
                            <Icon icon="ph:warning-bold" width={10} aria-hidden />
                            Sensível
                          </span>
                        )}
                        {i.condicional && (
                          <span className="rounded-pill bg-surface-2 px-2 py-0.5 text-[10.5px] font-medium text-ink-secondary">Condicional</span>
                        )}
                        <span className="text-[11px] text-ink-muted">
                          Escala {i.escala} · {i.direcao === 'reverso' ? 'reverso' : 'positivo'} · {i.referencia}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => setItemForm({ dimensaoId: d.id, item: i })}
                        aria-label={`Editar item ${i.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
                      >
                        <Icon icon="ph:pencil-simple-bold" width={16} aria-hidden />
                      </button>
                      <button
                        onClick={() => !i.obrigatorioNucleo && setRemover({ dimensao: d, item: i })}
                        disabled={i.obrigatorioNucleo}
                        aria-label={i.obrigatorioNucleo ? `${i.id} pertence ao núcleo obrigatório e não pode ser removido` : `Remover item ${i.id}`}
                        title={i.obrigatorioNucleo ? 'Item do núcleo obrigatório, não removível' : undefined}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:text-danger-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:text-ink-muted"
                      >
                        <Icon icon={i.obrigatorioNucleo ? 'ph:lock-simple-bold' : 'ph:trash-bold'} width={16} aria-hidden />
                      </button>
                    </div>
                  </li>
                ))}
                {d.itens.length === 0 && (
                  <li className="px-4 py-8 text-center text-[13px] text-ink-secondary lg:px-5">Nenhum item nesta dimensão ainda.</li>
                )}
              </ul>

              <div className="border-t border-border p-3 lg:px-5">
                <Button size="sm" variant="ghost" iconLeft="ph:plus-bold" onClick={() => setItemForm({ dimensaoId: d.id })}>
                  Acrescentar item
                </Button>
              </div>
            </section>
          )
        })}
      </div>

      {/* Perguntas abertas */}
      <section className="mt-4 rounded-lg border border-border bg-surface p-4 lg:p-5">
        <h2 className="font-heading text-[15px] font-semibold text-ink">Perguntas abertas</h2>
        <p className="mt-0.5 text-[12.5px] text-ink-secondary">Opcionais e anônimas. Complementam os itens fechados com sinal qualitativo.</p>
        <ul className="mt-3 flex flex-col gap-2">
          {versao.abertas.map((q, i) => (
            <li key={i} className="rounded-lg bg-surface-2 px-3.5 py-2.5 text-[13px] leading-snug text-ink-secondary">{q}</li>
          ))}
          {versao.abertas.length === 0 && <li className="text-[13px] text-ink-muted">Nenhuma pergunta aberta nesta versão.</li>}
        </ul>
      </section>

      {/* Editor do item */}
      <Sheet
        open={itemForm !== null}
        onClose={() => setItemForm(null)}
        title={itemForm?.item ? `Editar item ${itemForm.item.id}` : 'Novo item'}
        icon="ph:list-plus-bold"
        size="md"
      >
        {itemForm && (
          <ItemForm
            inicial={itemForm.item}
            dimensaoId={itemForm.dimensaoId}
            escopo={modelo.escopo}
            onClose={() => setItemForm(null)}
            onSave={(item, novo) => salvarItem(itemForm.dimensaoId, item, novo)}
          />
        )}
      </Sheet>

      {/* Escala e pontuação */}
      <Sheet open={escalaOpen} onClose={() => setEscalaOpen(false)} title="Escala e pontuação" icon="ph:sliders-horizontal-bold" size="md">
        <EscalaView versao={versao} />
      </Sheet>

      <Modal open={remover !== null} title="Remover item" onClose={() => setRemover(null)}>
        {remover && (
          <div className="flex flex-col gap-4">
            <p className="text-[13.5px] leading-relaxed text-ink-secondary">
              Remover <span className="font-semibold text-ink">{remover.item.id}</span> de {remover.dimensao.nome}?
              As campanhas que já aplicaram versões anteriores não são afetadas.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setRemover(null)}>Cancelar</Button>
              <Button fullWidth variant="secondary" iconLeft="ph:trash-bold" onClick={removerItem}>Remover item</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

/* Formulário do item — mesmos tipos de campo do formulário flexível. */
function ItemForm({ inicial, dimensaoId, escopo, onClose, onSave }: {
  inicial?: Nr1Item
  dimensaoId: string
  escopo: Nr1QuestionarioModelo['escopo']
  onClose: () => void
  onSave: (item: Nr1Item, novo: boolean) => void
}) {
  const novo = !inicial
  const [texto, setTexto] = useState(inicial?.texto ?? '')
  const [tipoCampo, setTipoCampo] = useState<CampoTipo>(inicial?.tipoCampo ?? 'select')
  const [escala, setEscala] = useState<Nr1EscalaId>(inicial?.escala ?? 'A')
  const [direcao, setDirecao] = useState<Nr1Direcao>(inicial?.direcao ?? 'positivo')
  const [referencia, setReferencia] = useState(inicial?.referencia ?? '')
  const [nucleo, setNucleo] = useState(inicial?.obrigatorioNucleo ?? false)
  const [condicional, setCondicional] = useState(inicial?.condicional ?? false)
  const [sensivel, setSensivel] = useState(inicial?.sensivel ?? false)
  const [salvando, setSalvando] = useState(false)

  /* Só o Modelo YNA define núcleo. Num derivado de cliente o núcleo é herdado
     e a marcação fica travada — o cliente acrescenta, nunca redefine o mínimo. */
  const podeMarcarNucleo = escopo === 'yna'
  const valido = texto.trim().length >= 10

  const salvar = () => {
    if (!valido) return
    setSalvando(true)
    const prefixo = dimensaoId.slice(0, 2).toUpperCase()
    onSave({
      id: inicial?.id ?? `${prefixo}-${Date.now().toString().slice(-5)}`,
      texto: texto.trim(),
      tipoCampo,
      escala,
      direcao,
      referencia: referencia.trim() || 'Item próprio',
      obrigatorioNucleo: podeMarcarNucleo ? nucleo : (inicial?.obrigatorioNucleo ?? false),
      condicional: condicional || undefined,
      sensivel: sensivel || undefined,
      /* A origem é definida no nascimento do item e não muda ao editar: um item
         herdado do Modelo YNA continua sendo do YNA mesmo com o texto ajustado.
         Só item NOVO num modelo derivado nasce como item do cliente. */
      origemCliente: inicial ? inicial.origemCliente : (escopo === 'cliente' ? true : undefined),
      opcoes: inicial?.opcoes,
    }, novo)
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-ink">Afirmação (como o colaborador vê)</span>
        <textarea className={inputCls} rows={3} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Ex.: Tenho autonomia para decidir como realizar o meu trabalho." />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">Tipo de campo</p>
          <Select value={tipoCampo} onChange={(v) => setTipoCampo(v as CampoTipo)} ariaLabel="Tipo de campo" options={TIPOS_CAMPO} />
        </div>
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">Escala</p>
          <Select
            value={escala}
            onChange={(v) => setEscala(v as Nr1EscalaId)}
            ariaLabel="Escala do item"
            options={[{ value: 'A', label: 'A · Frequência' }, { value: 'B', label: 'B · Concordância' }]}
          />
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[13px] font-semibold text-ink">Direção</p>
        <div className="flex gap-1 rounded-lg bg-surface-2 p-1">
          {([['positivo', 'Positivo'], ['reverso', 'Reverso']] as const).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setDirecao(v)}
              className={`flex-1 rounded-lg py-2 font-heading text-[13px] font-semibold transition-all ${direcao === v ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">
          Positivo: concordar indica menor risco. Reverso: a pontuação é invertida antes de somar.
        </p>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-ink">Referência <span className="font-normal text-ink-muted">(instrumento-fonte)</span></span>
        <input className={inputCls} value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Ex.: HSE · Controle" />
      </label>

      <div className="flex flex-col gap-2">
        <Toggle
          checked={podeMarcarNucleo ? nucleo : (inicial?.obrigatorioNucleo ?? false)}
          onChange={setNucleo}
          disabled={!podeMarcarNucleo}
          label="Item do núcleo obrigatório"
          hint={podeMarcarNucleo
            ? 'Não poderá ser removido em nenhum modelo derivado de cliente.'
            : 'O núcleo é definido no Modelo YNA. Modelos de cliente só acrescentam itens.'}
        />
        <Toggle checked={condicional} onChange={setCondicional} label="Item condicional" hint="Só aparece a quem se aplica (ex.: trabalho remoto, atendimento ao público)." />
        <Toggle checked={sensivel} onChange={setSensivel} label="Item sensível" hint="Sinaliza à curadoria clínica temas como assédio, que podem reativar sofrimento." />
      </div>

      <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button iconLeft="ph:check-bold" disabled={!valido || salvando} onClick={salvar}>
          {salvando ? 'Salvando…' : novo ? 'Acrescentar item' : 'Salvar item'}
        </Button>
      </div>
    </div>
  )
}

function Toggle({ checked, onChange, label, hint, disabled }: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  hint: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex items-start gap-3 rounded-lg border-[1.5px] p-3 text-left transition-colors ${
        disabled
          ? 'cursor-not-allowed border-border bg-surface-2 opacity-70'
          : checked
            ? 'border-primary bg-primary-50'
            : 'border-border bg-surface hover:border-border-strong'
      }`}
    >
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-[1.5px] transition-colors ${checked ? 'border-primary bg-primary text-white' : 'border-border-strong'}`}>
        {checked && <Icon icon="ph:check-bold" width={12} aria-hidden />}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-ink">{label}</span>
        <span className="mt-0.5 block text-[11.5px] leading-relaxed text-ink-secondary">{hint}</span>
      </span>
    </button>
  )
}

/* Escalas de resposta e cortes de risco da versão. */
function EscalaView({ versao }: { versao: Nr1QuestionarioVersao }) {
  return (
    <div className="flex flex-col gap-6 px-5 py-6 lg:px-6">
      {(['A', 'B'] as Nr1EscalaId[]).map((k) => (
        <section key={k}>
          <h3 className="font-heading text-[14px] font-semibold text-ink">Escala {k} de {versao.escala[k].nome.toLowerCase()}</h3>
          <ol className="mt-2 flex flex-col gap-1.5">
            {versao.escala[k].opcoes.map((o) => (
              <li key={o.valor} className="flex items-center gap-3 rounded-lg bg-surface-2 px-3.5 py-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-surface font-mono text-[11px] font-semibold text-ink">{o.valor}</span>
                <span className="text-[13px] text-ink-secondary">{o.rotulo}</span>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <section>
        <h3 className="font-heading text-[14px] font-semibold text-ink">Cortes de risco por dimensão</h3>
        <p className="mt-0.5 text-[12px] leading-relaxed text-ink-secondary">
          Pontuação de 1 a 5, onde 5 é a situação desejável. Itens reversos são invertidos antes
          da média.
        </p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {versao.pontuacao.faixas.map((f) => (
            <li key={f.nivel} className="flex items-center justify-between gap-3 rounded-lg bg-surface-2 px-3.5 py-2">
              <span className="font-mono text-[12px] text-ink">{f.min.toFixed(1)} – {f.max.toFixed(1)}</span>
              <span className="text-[13px] font-semibold text-ink">{f.label}</span>
              <span className="text-[11.5px] text-ink-secondary">{f.acao}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex gap-3 rounded-lg border border-border bg-surface-2 p-3.5">
        <Icon icon="ph:lock-simple-bold" width={18} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
        <p className="text-[12px] leading-relaxed text-ink-secondary">
          Anonimato estatístico: nenhum recorte com menos de{' '}
          <strong className="font-semibold text-ink">{versao.pontuacao.kAnonimato} respondentes</strong> é
          exibido ao RH.
        </p>
      </section>

      {versao.notas && (
        <section>
          <h3 className="font-heading text-[14px] font-semibold text-ink">Notas da versão</h3>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-secondary">{versao.notas}</p>
          <p className="mt-1.5 font-mono text-[11px] text-ink-muted">
            criada em {fmtData(versao.criadaEm)}
            {versao.publicadaEm && ` · publicada em ${fmtData(versao.publicadaEm)}`}
          </p>
        </section>
      )}
    </div>
  )
}
