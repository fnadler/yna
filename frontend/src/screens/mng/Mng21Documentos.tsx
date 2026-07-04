import { useState } from 'react'
import { Icon } from '@iconify/react'
import { MngTopBar } from '../../components/MngTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Sheet } from '../../components/Sheet'
import { Modal } from '../../components/Modal'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { mngModeloDocService } from '../../services/mng'
import { mngTiposProfissional } from '../../data/mngMock'
import type { MngModeloDocumento, MngModeloFormato } from '../../types'

const fmtData = (iso: string) => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}` }
const tipoNome = (id: string) => mngTiposProfissional.find((t) => t.id === id)?.nome ?? id
const inputCls = 'w-full rounded border-[1.5px] border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary'
const ICONES = ['ph:file-text-bold', 'ph:first-aid-bold', 'ph:seal-check-bold', 'ph:clipboard-text-bold', 'ph:receipt-bold', 'ph:file-magnifying-glass-bold', 'ph:prescription-bold', 'ph:certificate-bold']

/* MNG-21 — Modelos de documentos. CRUD dos modelos disponibilizados aos
   profissionais, com seleção do público-alvo por tipo de profissional. */
export function Mng21Documentos() {
  const modelos = useService(() => mngModeloDocService.list(), [])
  const [form, setForm] = useState<{ item?: MngModeloDocumento } | null>(null)
  const [excluir, setExcluir] = useState<MngModeloDocumento | null>(null)

  const remover = async () => {
    if (!excluir) return
    await mngModeloDocService.excluir(excluir.id)
    setExcluir(null)
    modelos.reload()
  }

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MngTopBar />
        <PageHeader
          title="Modelos de documentos" subtitle="Modelos disponibilizados aos profissionais." className="mt-2 lg:mt-0"
          action={<Button variant="secondary" iconLeft="ph:plus-bold" onClick={() => setForm({})}><span className="hidden sm:inline">Novo modelo</span></Button>}
        />

        {modelos.status === 'loading' && <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}</div>}
        {modelos.status === 'error' && <ErrorState message={modelos.message} onRetry={modelos.reload} />}
        {modelos.status === 'success' && (
          <div className="flex flex-col gap-2">
            {modelos.data.map((m) => (
              <div key={m.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300"><Icon icon={m.icon} width={20} aria-hidden /></div>
                    <div className="min-w-0">
                      <p className="truncate font-heading text-sm font-semibold text-ink">{m.nome} <span className="ml-1 rounded-pill bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-ink-secondary">{m.formato}</span></p>
                      <p className="truncate text-[12.5px] text-ink-secondary">{m.descricao}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button onClick={() => setForm({ item: m })} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink" aria-label="Editar"><Icon icon="ph:pencil-simple-bold" width={16} aria-hidden /></button>
                    <button onClick={() => setExcluir(m)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:text-danger-ink" aria-label="Excluir"><Icon icon="ph:trash-bold" width={16} aria-hidden /></button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink-muted">
                  <span className="inline-flex items-center gap-1 rounded-pill bg-surface-2 px-2.5 py-1 text-ink-secondary"><Icon icon="ph:users-three-bold" width={12} aria-hidden /> {m.publicoTipos.length === 0 ? 'Todos os tipos' : m.publicoTipos.map(tipoNome).join(', ')}</span>
                  <span>atualizado {fmtData(m.atualizadoEm)}</span>
                </div>
              </div>
            ))}
            {modelos.data.length === 0 && <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-sm text-ink-secondary">Nenhum modelo cadastrado.</div>}
          </div>
        )}
      </div>

      <Sheet open={form !== null} onClose={() => setForm(null)} title={form?.item ? 'Editar modelo' : 'Novo modelo de documento'} icon="ph:files-bold" size="md">
        {form && <ModeloForm inicial={form.item} onClose={() => setForm(null)} onSaved={() => { setForm(null); modelos.reload() }} />}
      </Sheet>

      <Modal open={excluir !== null} title="Excluir modelo" onClose={() => setExcluir(null)}>
        {excluir && (
          <div className="flex flex-col gap-4">
            <p className="text-[13.5px] text-ink-secondary">Tem certeza que deseja excluir <span className="font-semibold text-ink">{excluir.nome}</span>? Os profissionais deixarão de ter acesso a este modelo.</p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setExcluir(null)}>Cancelar</Button>
              <Button fullWidth variant="secondary" iconLeft="ph:trash-bold" onClick={remover}>Excluir modelo</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

/* Formulário de modelo. */
function ModeloForm({ inicial, onClose, onSaved }: { inicial?: MngModeloDocumento; onClose: () => void; onSaved: () => void }) {
  const [nome, setNome] = useState(inicial?.nome ?? '')
  const [descricao, setDescricao] = useState(inicial?.descricao ?? '')
  const [icon, setIcon] = useState(inicial?.icon ?? ICONES[0])
  const [formato, setFormato] = useState<MngModeloFormato>(inicial?.formato ?? 'docx')
  const [arquivo, setArquivo] = useState<string | undefined>(inicial?.arquivo)
  const [publico, setPublico] = useState<string[]>(inicial?.publicoTipos ?? [])
  const [salvando, setSalvando] = useState(false)
  const valido = nome.trim().length >= 3 && descricao.trim().length > 0 && !!arquivo

  const togglePublico = (id: string) => setPublico((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  const salvar = async () => {
    if (!valido) return
    setSalvando(true)
    await mngModeloDocService.salvar({
      id: inicial?.id ?? '', nome: nome.trim(), descricao: descricao.trim(), icon, formato,
      arquivo: arquivo!, publicoTipos: publico, atualizadoEm: inicial?.atualizadoEm ?? '',
    })
    onSaved()
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
      <Campo label="Nome do documento"><input className={inputCls} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Atestado psicológico" /></Campo>
      <Campo label="Descrição"><textarea className={inputCls} rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Para que serve este modelo…" /></Campo>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">Ícone</p>
          <div className="flex flex-wrap gap-1.5">
            {ICONES.map((ic) => (
              <button key={ic} onClick={() => setIcon(ic)} aria-pressed={icon === ic}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border-[1.5px] transition-colors ${icon === ic ? 'border-primary bg-primary-50 text-primary dark:text-primary-300' : 'border-border text-ink-secondary hover:border-border-strong hover:text-ink'}`}>
                <Icon icon={ic} width={18} aria-hidden />
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">Formato</p>
          <div className="flex gap-1 rounded-lg bg-surface-2 p-1 sm:max-w-[200px]">
            {(['docx', 'pdf'] as MngModeloFormato[]).map((f) => (
              <button key={f} onClick={() => setFormato(f)} className={`flex-1 rounded-lg py-2 font-heading text-[13px] font-semibold uppercase transition-all ${formato === f ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'}`}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Arquivo do modelo */}
      <div>
        <p className="mb-1.5 text-[13px] font-semibold text-ink">Arquivo do modelo</p>
        {arquivo ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 text-[13px]">
            <span className="flex min-w-0 items-center gap-2"><Icon icon="ph:file-bold" width={17} className="shrink-0 text-primary dark:text-primary-300" aria-hidden /><span className="truncate">{arquivo}</span></span>
            <button onClick={() => setArquivo(undefined)} className="shrink-0 text-ink-muted hover:text-ink" aria-label="Remover"><Icon icon="ph:x-bold" width={15} aria-hidden /></button>
          </div>
        ) : (
          <button onClick={() => setArquivo(`modelo-${(nome.trim() || 'documento').toLowerCase().replace(/\s+/g, '-')}.${formato}`)} className="flex w-full items-center justify-center gap-2 rounded border-[1.5px] border-dashed border-border bg-surface px-4 py-3 text-[13px] font-medium text-ink-secondary transition-colors hover:border-primary hover:text-ink"><Icon icon="ph:upload-simple-bold" width={16} aria-hidden /> Anexar arquivo do modelo</button>
        )}
      </div>

      {/* Público-alvo por tipo de profissional */}
      <div>
        <p className="mb-1.5 text-[13px] font-semibold text-ink">Disponível para <span className="font-normal text-ink-muted">· vazio = todos os tipos</span></p>
        <div className="flex flex-wrap gap-1.5">
          {mngTiposProfissional.map((t) => {
            const on = publico.includes(t.id)
            return <button key={t.id} onClick={() => togglePublico(t.id)} className={`rounded-pill border-[1.5px] px-3 py-1 text-[12.5px] font-medium transition-colors ${on ? 'border-primary bg-primary-50 text-primary dark:text-primary-300' : 'border-border text-ink-secondary hover:border-border-strong hover:text-ink'}`}>{t.nome}</button>
          })}
        </div>
      </div>

      <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button iconLeft="ph:check-bold" disabled={!valido || salvando} onClick={salvar}>{salvando ? 'Salvando…' : inicial ? 'Salvar alterações' : 'Criar modelo'}</Button>
      </div>
    </div>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[13px] font-semibold text-ink">{label}</span>{children}</label>
}
