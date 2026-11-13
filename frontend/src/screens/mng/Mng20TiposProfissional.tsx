import { useState } from 'react'
import { Icon } from '@iconify/react'
import { MngTopBar } from '../../components/MngTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Sheet } from '../../components/Sheet'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { mngProfissionalService } from '../../services/mng'
import type { MngTipoProfissional, MngCampoCadastro, MngCampoTipo, MngTriagemPergunta, MngTriagemTipo } from '../../types'

const uid = () => Math.random().toString(36).slice(2, 8)
const inputCls = 'w-full rounded border-[1.5px] border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary'

const CAMPO_TIPO_LABEL: Record<MngCampoTipo, string> = {
  text: 'Texto curto', textarea: 'Texto longo', select: 'Seleção única', multiselect: 'Múltipla seleção', number: 'Número', date: 'Data',
}
const CAMPO_COM_OPCOES: MngCampoTipo[] = ['select', 'multiselect']
const TRIAGEM_TIPO_LABEL: Record<MngTriagemTipo, string> = {
  aberta: 'Resposta aberta', escala: 'Escala (0–10)', unica: 'Escolha única', multipla: 'Múltipla escolha',
}
const TRIAGEM_COM_OPCOES: MngTriagemTipo[] = ['unica', 'multipla']

/* MNG-20 — Tipos de profissional. Lista os tipos cadastrados e permite definir,
   por tipo, as perguntas da triagem e os campos do cadastro do profissional. */
export function Mng20TiposProfissional() {
  const tipos = useService(() => mngProfissionalService.tipos(), [])
  const [form, setForm] = useState<{ item?: MngTipoProfissional } | null>(null)

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MngTopBar />
        <PageHeader
          title="Tipos de profissional" subtitle="Triagem e campos de cadastro por tipo." className="mt-2 lg:mt-0"
          action={<Button variant="secondary" iconLeft="ph:plus-bold" onClick={() => setForm({})}><span className="hidden sm:inline">Novo tipo</span></Button>}
        />

        {tipos.status === 'loading' && <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}</div>}
        {tipos.status === 'error' && <ErrorState message={tipos.message} onRetry={tipos.reload} />}
        {tipos.status === 'success' && (
          <div className="flex flex-col gap-2">
            {tipos.data.map((t) => (
              <button key={t.id} onClick={() => setForm({ item: t })} className="rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:border-border-strong">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300"><Icon icon="ph:identification-card-bold" width={20} aria-hidden /></div>
                    <div className="min-w-0">
                      <p className="truncate font-heading text-sm font-semibold text-ink">{t.nome}</p>
                      <p className="truncate text-[12.5px] text-ink-secondary">Conselho {t.conselho} · {t.profissionais} profissional(is)</p>
                    </div>
                  </div>
                  <Badge tone={t.ativo ? 'success' : 'neutral'}>{t.ativo ? 'Ativo' : 'Inativo'}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink-muted">
                  <span><Icon icon="ph:list-checks-bold" width={12} className="mr-1 inline" aria-hidden />{t.triagem.length} pergunta(s) de triagem</span>
                  <span><Icon icon="ph:textbox-bold" width={12} className="mr-1 inline" aria-hidden />{t.campos.length} campo(s) de cadastro</span>
                </div>
              </button>
            ))}
            {tipos.data.length === 0 && <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-sm text-ink-secondary">Nenhum tipo cadastrado.</div>}
          </div>
        )}
      </div>

      <Sheet open={form !== null} onClose={() => setForm(null)} title={form?.item ? 'Editar tipo de profissional' : 'Novo tipo de profissional'} icon="ph:identification-card-bold" size="lg">
        {form && <TipoForm inicial={form.item} onClose={() => setForm(null)} onSaved={() => { setForm(null); tipos.reload() }} />}
      </Sheet>
    </div>
  )
}

/* ── Formulário do tipo ── */
function TipoForm({ inicial, onClose, onSaved }: { inicial?: MngTipoProfissional; onClose: () => void; onSaved: () => void }) {
  const [nome, setNome] = useState(inicial?.nome ?? '')
  const [conselho, setConselho] = useState(inicial?.conselho ?? '')
  const [ativo, setAtivo] = useState(inicial?.ativo ?? true)
  const [campos, setCampos] = useState<MngCampoCadastro[]>(inicial?.campos ?? [])
  const [triagem, setTriagem] = useState<MngTriagemPergunta[]>(inicial?.triagem ?? [])
  const [salvando, setSalvando] = useState(false)
  const valido = nome.trim().length >= 2 && conselho.trim().length >= 2

  const salvar = async () => {
    if (!valido) return
    setSalvando(true)
    await mngProfissionalService.salvarTipo({
      id: inicial?.id ?? '', nome: nome.trim(), conselho: conselho.trim().toUpperCase(),
      ativo, profissionais: inicial?.profissionais ?? 0, campos, triagem,
    })
    onSaved()
  }

  return (
    <div className="flex flex-col gap-5 px-5 py-6 lg:px-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <Campo label="Nome do tipo"><input className={inputCls} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Nutricionista" /></Campo>
        <Campo label="Conselho (sigla)"><input className={`${inputCls} sm:w-40`} value={conselho} onChange={(e) => setConselho(e.target.value)} placeholder="Ex.: CRN" /></Campo>
      </div>
      <button onClick={() => setAtivo((v) => !v)} className="flex items-center gap-3 self-start rounded-lg border border-border bg-surface px-3 py-2.5 text-left transition-colors hover:bg-surface-hover">
        <span className={`flex h-5 w-9 items-center rounded-pill p-0.5 transition-colors ${ativo ? 'bg-primary' : 'bg-surface-2'}`}><span className={`h-4 w-4 rounded-full bg-white transition-transform ${ativo ? 'translate-x-4' : ''}`} /></span>
        <span className="text-[13px] font-medium text-ink">Tipo ativo <span className="font-normal text-ink-secondary">— disponível para cadastro e matching</span></span>
      </button>

      {/* Perguntas da triagem */}
      <Secao titulo="Perguntas da triagem" desc="Compõem a triagem do beneficiário para indicar profissionais deste tipo." icon="ph:list-checks-bold"
        onAdd={() => setTriagem([...triagem, { id: uid(), pergunta: '', tipo: 'aberta', obrigatoria: true }])} addLabel="Adicionar pergunta" vazio={triagem.length === 0} vazioTxt="Nenhuma pergunta.">
        {triagem.map((p, i) => (
          <ItemCard key={p.id} index={i} total={triagem.length} onMove={(d) => setTriagem(mover(triagem, i, d))} onRemove={() => setTriagem(triagem.filter((x) => x.id !== p.id))}>
            <input className={inputCls} value={p.pergunta} onChange={(e) => setTriagem(patch(triagem, p.id, { pergunta: e.target.value }))} placeholder="Texto da pergunta" />
            <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
              <Sel value={p.tipo} onChange={(v) => setTriagem(patch(triagem, p.id, { tipo: v as MngTriagemTipo }))} opcoes={(Object.keys(TRIAGEM_TIPO_LABEL) as MngTriagemTipo[]).map((t) => ({ v: t, l: TRIAGEM_TIPO_LABEL[t] }))} />
              <Obrigatorio on={p.obrigatoria} onToggle={() => setTriagem(patch(triagem, p.id, { obrigatoria: !p.obrigatoria }))} />
            </div>
            {TRIAGEM_COM_OPCOES.includes(p.tipo) && <OpcoesEditor opcoes={p.opcoes ?? []} onChange={(o) => setTriagem(patch(triagem, p.id, { opcoes: o }))} />}
          </ItemCard>
        ))}
      </Secao>

      {/* Campos do cadastro */}
      <Secao titulo="Campos do cadastro" desc="Campos específicos exigidos no cadastro deste tipo de profissional." icon="ph:textbox-bold"
        onAdd={() => setCampos([...campos, { id: uid(), label: '', tipo: 'text', obrigatorio: true }])} addLabel="Adicionar campo" vazio={campos.length === 0} vazioTxt="Nenhum campo.">
        {campos.map((c, i) => (
          <ItemCard key={c.id} index={i} total={campos.length} onMove={(d) => setCampos(mover(campos, i, d))} onRemove={() => setCampos(campos.filter((x) => x.id !== c.id))}>
            <input className={inputCls} value={c.label} onChange={(e) => setCampos(patch(campos, c.id, { label: e.target.value }))} placeholder="Rótulo do campo (ex.: Número do CRP)" />
            <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
              <Sel value={c.tipo} onChange={(v) => setCampos(patch(campos, c.id, { tipo: v as MngCampoTipo }))} opcoes={(Object.keys(CAMPO_TIPO_LABEL) as MngCampoTipo[]).map((t) => ({ v: t, l: CAMPO_TIPO_LABEL[t] }))} />
              <Obrigatorio on={c.obrigatorio} onToggle={() => setCampos(patch(campos, c.id, { obrigatorio: !c.obrigatorio }))} />
            </div>
            <input className={`${inputCls} mt-2`} value={c.ajuda ?? ''} onChange={(e) => setCampos(patch(campos, c.id, { ajuda: e.target.value }))} placeholder="Texto de ajuda / placeholder (opcional)" />
            {CAMPO_COM_OPCOES.includes(c.tipo) && <OpcoesEditor opcoes={c.opcoes ?? []} onChange={(o) => setCampos(patch(campos, c.id, { opcoes: o }))} />}
          </ItemCard>
        ))}
      </Secao>

      <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button iconLeft="ph:check-bold" disabled={!valido || salvando} onClick={salvar}>{salvando ? 'Salvando…' : inicial ? 'Salvar alterações' : 'Criar tipo'}</Button>
      </div>
    </div>
  )
}

/* ── Helpers de lista ── */
function mover<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir
  if (j < 0 || j >= arr.length) return arr
  const out = [...arr]; const tmp = out[i]; out[i] = out[j]; out[j] = tmp; return out
}
function patch<T extends { id: string }>(arr: T[], id: string, p: Partial<T>): T[] {
  return arr.map((x) => (x.id === id ? { ...x, ...p } : x))
}

function Secao({ titulo, desc, icon, onAdd, addLabel, vazio, vazioTxt, children }: { titulo: string; desc: string; icon: string; onAdd: () => void; addLabel: string; vazio: boolean; vazioTxt: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-1 flex items-center gap-1.5">
        <Icon icon={icon} width={16} className="text-primary dark:text-primary-300" aria-hidden />
        <h3 className="font-heading text-[14px] font-semibold text-ink">{titulo}</h3>
      </div>
      <p className="mb-2.5 text-[12px] text-ink-secondary">{desc}</p>
      {vazio
        ? <p className="mb-2.5 rounded-lg border border-dashed border-border px-4 py-4 text-center text-[12.5px] text-ink-muted">{vazioTxt}</p>
        : <div className="mb-2.5 flex flex-col gap-3">{children}</div>}
      <button onClick={onAdd} className="flex w-full items-center justify-center gap-1.5 rounded border-[1.5px] border-dashed border-border bg-surface px-4 py-2.5 text-[12.5px] font-medium text-ink-secondary transition-colors hover:border-primary hover:text-ink"><Icon icon="ph:plus-bold" width={14} aria-hidden /> {addLabel}</button>
    </section>
  )
}

function ItemCard({ index, total, onMove, onRemove, children }: { index: number; total: number; onMove: (dir: -1 | 1) => void; onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-2 font-mono text-[11px] font-bold text-ink-secondary">{index + 1}</span>
        <div className="flex items-center">
          <button onClick={() => onMove(-1)} disabled={index === 0} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-hover disabled:opacity-30" aria-label="Mover para cima"><Icon icon="ph:arrow-up-bold" width={15} aria-hidden /></button>
          <button onClick={() => onMove(1)} disabled={index === total - 1} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-hover disabled:opacity-30" aria-label="Mover para baixo"><Icon icon="ph:arrow-down-bold" width={15} aria-hidden /></button>
          <button onClick={onRemove} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:text-danger-ink" aria-label="Remover"><Icon icon="ph:trash-bold" width={15} aria-hidden /></button>
        </div>
      </div>
      {children}
    </div>
  )
}

function OpcoesEditor({ opcoes, onChange }: { opcoes: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="mt-2 rounded-lg border border-border bg-surface p-2.5">
      <p className="mb-1.5 text-[11.5px] font-medium text-ink-muted">Opções</p>
      <div className="flex flex-col gap-1.5">
        {opcoes.map((o, i) => (
          <div key={i} className="flex items-center gap-2">
            <input className={inputCls} value={o} onChange={(e) => onChange(opcoes.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`Opção ${i + 1}`} />
            <button onClick={() => onChange(opcoes.filter((_, j) => j !== i))} className="shrink-0 text-ink-muted hover:text-danger-ink" aria-label="Remover opção"><Icon icon="ph:x-bold" width={14} aria-hidden /></button>
          </div>
        ))}
      </div>
      <button onClick={() => onChange([...opcoes, ''])} className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline dark:text-primary-300"><Icon icon="ph:plus-bold" width={12} aria-hidden /> Adicionar opção</button>
    </div>
  )
}

function Obrigatorio({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="flex items-center gap-2 rounded border-[1.5px] border-border bg-surface px-3 py-2 text-[13px] text-ink transition-colors hover:bg-surface-hover">
      <span className={`flex h-4 w-4 items-center justify-center rounded-[5px] border-[1.5px] transition-colors ${on ? 'border-primary bg-primary text-white' : 'border-border-strong bg-surface'}`}>{on && <Icon icon="ph:check-bold" width={10} aria-hidden />}</span>
      Obrigatório
    </button>
  )
}

/* ── Helpers de UI ── */
function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[13px] font-semibold text-ink">{label}</span>{children}</label>
}
function Sel({ value, onChange, opcoes }: { value: string; onChange: (v: string) => void; opcoes: { v: string; l: string }[] }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} appearance-none pr-9`}>
        {opcoes.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
      <Icon icon="ph:caret-down-bold" width={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden />
    </div>
  )
}
