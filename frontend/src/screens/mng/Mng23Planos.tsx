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
import { mngPlanoService } from '../../services/mng'
import { MNG_PLANO_FEATURES, PLANO_PUBLICO_LABEL } from '../../data/mngMock'
import type { MngPlano, MngPlanoPublico } from '../../types'

const brl2 = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })
const inputCls = 'w-full rounded border-[1.5px] border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary'
const PUBLICO_ICON: Record<MngPlanoPublico, string> = { empresa: 'ph:buildings-bold', pessoa: 'ph:user-bold' }

/* MNG-23 — Planos (§8.17). Gerencia os planos para contratação da plataforma:
   nome, público (empresas/pessoas), features liberadas, número de licenças e
   valores base por licença (mensal e anual). Permite ativar/inativar. */
export function Mng23Planos() {
  const planos = useService(() => mngPlanoService.list(), [])
  const [form, setForm] = useState<{ item?: MngPlano } | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const toggle = async (id: string) => {
    setTogglingId(id)
    await mngPlanoService.toggleAtivo(id)
    setTogglingId(null)
    planos.reload()
  }

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MngTopBar />
        <PageHeader
          title="Planos" subtitle="Planos para contratação da plataforma." className="mt-2 lg:mt-0"
          action={<Button variant="secondary" iconLeft="ph:plus-bold" onClick={() => setForm({})}><span className="hidden sm:inline">Novo plano</span></Button>}
        />

        {planos.status === 'loading' && <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}</div>}
        {planos.status === 'error' && <ErrorState message={planos.message} onRetry={planos.reload} />}
        {planos.status === 'success' && (
          <div className="flex flex-col gap-2">
            {planos.data.map((p) => (
              <div key={p.id} className={`rounded-lg border border-border bg-surface p-4 transition-opacity ${p.ativo ? '' : 'opacity-70'}`}>
                <div className="grid grid-cols-1 items-start gap-x-4 gap-y-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                  {/* Info + abre edição */}
                  <button onClick={() => setForm({ item: p })} className="flex min-w-0 items-start gap-3 text-left">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300"><Icon icon="ph:package-bold" width={20} aria-hidden /></div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="truncate font-heading text-sm font-semibold text-ink">Plano {p.nome}</p>
                        <span className="inline-flex items-center gap-1 rounded-pill bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-ink-secondary"><Icon icon={PUBLICO_ICON[p.publico]} width={11} aria-hidden /> {PLANO_PUBLICO_LABEL[p.publico]}</span>
                      </div>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12.5px] text-ink-secondary">
                        <span><Icon icon="ph:seat-bold" width={12} className="mr-1 inline" aria-hidden />{p.licencas} licença(s)</span>
                        <span><Icon icon="ph:sparkle-bold" width={12} className="mr-1 inline" aria-hidden />{p.features.length} feature(s)</span>
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-4 gap-y-0.5 text-[12.5px]">
                        <span className="text-ink"><span className="font-semibold">{brl2(p.valorMensalLicenca)}</span><span className="text-ink-muted">/licença · mês</span></span>
                        <span className="text-ink"><span className="font-semibold">{brl2(p.valorAnualLicenca)}</span><span className="text-ink-muted">/licença · ano</span></span>
                      </div>
                    </div>
                  </button>

                  {/* Status + toggle ativar/inativar */}
                  <div className="flex items-center gap-3 lg:flex-col lg:items-end lg:gap-2">
                    <Badge tone={p.ativo ? 'success' : 'neutral'}>{p.ativo ? 'Ativo' : 'Inativo'}</Badge>
                    <button
                      onClick={() => toggle(p.id)} disabled={togglingId === p.id}
                      className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] font-medium text-ink-secondary transition-colors hover:bg-surface-hover disabled:opacity-50"
                      aria-label={p.ativo ? 'Inativar plano' : 'Ativar plano'}
                    >
                      <span className={`flex h-5 w-9 items-center rounded-pill p-0.5 transition-colors ${p.ativo ? 'bg-primary' : 'bg-surface-2'}`}><span className={`h-4 w-4 rounded-full bg-white transition-transform ${p.ativo ? 'translate-x-4' : ''}`} /></span>
                      {p.ativo ? 'Inativar' : 'Ativar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {planos.data.length === 0 && <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-sm text-ink-secondary">Nenhum plano cadastrado.</div>}
          </div>
        )}
      </div>

      <Sheet open={form !== null} onClose={() => setForm(null)} title={form?.item ? 'Editar plano' : 'Novo plano'} icon="ph:package-bold" size="lg">
        {form && <PlanoForm inicial={form.item} onClose={() => setForm(null)} onSaved={() => { setForm(null); planos.reload() }} />}
      </Sheet>
    </div>
  )
}

/* ── Formulário do plano ── */
function PlanoForm({ inicial, onClose, onSaved }: { inicial?: MngPlano; onClose: () => void; onSaved: () => void }) {
  const [nome, setNome] = useState(inicial?.nome ?? '')
  const [publico, setPublico] = useState<MngPlanoPublico>(inicial?.publico ?? 'empresa')
  const [features, setFeatures] = useState<string[]>(inicial?.features ?? [])
  const [licencas, setLicencas] = useState(String(inicial?.licencas ?? ''))
  const [mensal, setMensal] = useState(inicial ? String(inicial.valorMensalLicenca) : '')
  const [anual, setAnual] = useState(inicial ? String(inicial.valorAnualLicenca) : '')
  const [ativo, setAtivo] = useState(inicial?.ativo ?? true)
  const [salvando, setSalvando] = useState(false)

  const nLic = Number(licencas)
  const nMensal = Number(mensal.replace(',', '.'))
  const nAnual = Number(anual.replace(',', '.'))
  const valido = nome.trim().length >= 2 && nLic >= 1 && nMensal > 0 && nAnual > 0 && features.length > 0

  const toggleFeature = (id: string) => setFeatures((fs) => (fs.includes(id) ? fs.filter((x) => x !== id) : [...fs, id]))

  const salvar = async () => {
    if (!valido) return
    setSalvando(true)
    await mngPlanoService.salvar({
      id: inicial?.id ?? '', nome: nome.trim(), publico, features,
      licencas: nLic, valorMensalLicenca: nMensal, valorAnualLicenca: nAnual, ativo,
    })
    onSaved()
  }

  return (
    <div className="flex flex-col gap-5 px-5 py-6 lg:px-6">
      <Campo label="Nome do plano"><input className={inputCls} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Care · Corporativo" /></Campo>

      {/* Público */}
      <div>
        <span className="mb-1.5 block text-[13px] font-semibold text-ink">Público</span>
        <div className="flex gap-1 rounded-lg bg-surface-2 p-1">
          {(['empresa', 'pessoa'] as const).map((v) => (
            <button key={v} onClick={() => setPublico(v)} className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-all duration-200 ${publico === v ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'}`}>
              <Icon icon={PUBLICO_ICON[v]} width={15} aria-hidden /> {PLANO_PUBLICO_LABEL[v]}
            </button>
          ))}
        </div>
      </div>

      {/* Licenças + valores */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo label="Número de licenças"><input className={inputCls} type="number" min={1} value={licencas} onChange={(e) => setLicencas(e.target.value)} placeholder="Ex.: 100" /></Campo>
        <Campo label="Valor mensal / licença"><MoedaInput value={mensal} onChange={setMensal} /></Campo>
        <Campo label="Valor anual / licença"><MoedaInput value={anual} onChange={setAnual} /></Campo>
      </div>
      <p className="-mt-2 text-[12px] text-ink-secondary">Valores base por licença. O total do contrato é calculado no fechamento comercial com a empresa (ou na assinatura individual).</p>

      {/* Features liberadas */}
      <section>
        <div className="mb-1 flex items-center gap-1.5">
          <Icon icon="ph:sparkle-bold" width={16} className="text-primary dark:text-primary-300" aria-hidden />
          <h3 className="font-heading text-[14px] font-semibold text-ink">Features liberadas</h3>
        </div>
        <p className="mb-2.5 text-[12px] text-ink-secondary">O que este plano dá acesso na plataforma.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {MNG_PLANO_FEATURES.map((f) => {
            const on = features.includes(f.id)
            return (
              <button key={f.id} onClick={() => toggleFeature(f.id)} className={`flex items-center gap-2.5 rounded-lg border-[1.5px] px-3 py-2.5 text-left text-[13px] transition-colors ${on ? 'border-primary bg-primary-50/50 text-ink' : 'border-border bg-surface text-ink-secondary hover:bg-surface-hover'}`}>
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-colors ${on ? 'border-primary bg-primary text-white' : 'border-border-strong bg-surface'}`}>{on && <Icon icon="ph:check-bold" width={10} aria-hidden />}</span>
                {f.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* Ativo */}
      <button onClick={() => setAtivo((v) => !v)} className="flex items-center gap-3 self-start rounded-lg border border-border bg-surface px-3 py-2.5 text-left transition-colors hover:bg-surface-hover">
        <span className={`flex h-5 w-9 items-center rounded-pill p-0.5 transition-colors ${ativo ? 'bg-primary' : 'bg-surface-2'}`}><span className={`h-4 w-4 rounded-full bg-white transition-transform ${ativo ? 'translate-x-4' : ''}`} /></span>
        <span className="text-[13px] font-medium text-ink">Plano ativo <span className="font-normal text-ink-secondary">— disponível para contratação</span></span>
      </button>

      <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button iconLeft="ph:check-bold" disabled={!valido || salvando} onClick={salvar}>{salvando ? 'Salvando…' : inicial ? 'Salvar alterações' : 'Criar plano'}</Button>
      </div>
    </div>
  )
}

/* ── Helpers de UI ── */
function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[13px] font-semibold text-ink">{label}</span>{children}</label>
}
function MoedaInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted">R$</span>
      <input className={`${inputCls} pl-9`} inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0,00" />
    </div>
  )
}
