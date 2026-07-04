import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'
import { Sheet } from '../../components/Sheet'
import { mngEmpresaService } from '../../services/mng'
import { PLANOS, PLANO_LICENCAS, SEGMENTOS, mngCsms, MNG_TODAY } from '../../data/mngMock'
import type { MngContatoMaster, MngEmpresa } from '../../types'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const fmtData = (iso: string) => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}` }
const anoDepois = (iso: string) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCFullYear(d.getUTCFullYear() + 1); d.setUTCDate(d.getUTCDate() - 1); return d.toISOString().slice(0, 10) }
const inputCls = 'w-full rounded border-[1.5px] border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary'

const STEPS = ['Empresa', 'Contrato', 'Acessos'] as const

/* Cadastro de nova empresa em modal, por etapas: dados da empresa → contrato →
   usuário(s) Master + CSM. */
export function NovaEmpresaModal({ open, onClose, onCreated }: {
  open: boolean; onClose: () => void; onCreated: (e: MngEmpresa) => void
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Nova empresa" icon="ph:buildings-bold" size="lg">
      {open && <Wizard onClose={onClose} onCreated={onCreated} />}
    </Sheet>
  )
}

function Wizard({ onClose, onCreated }: { onClose: () => void; onCreated: (e: MngEmpresa) => void }) {
  const [step, setStep] = useState(0)
  const [salvando, setSalvando] = useState(false)
  const [criada, setCriada] = useState<MngEmpresa | null>(null)

  // Step 1 — empresa
  const [razaoSocial, setRazaoSocial] = useState('')
  const [nomeFantasia, setNomeFantasia] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [segmento, setSegmento] = useState('')

  // Step 2 — contrato
  const [plano, setPlano] = useState('Plano Care · Corporativo')
  const [licencas, setLicencas] = useState(String(PLANO_LICENCAS['Plano Care · Corporativo']))
  const [inicio, setInicio] = useState(MNG_TODAY)
  const [fim, setFim] = useState(anoDepois(MNG_TODAY))
  const [valorTotal, setValorTotal] = useState('')
  const [pagamento, setPagamento] = useState<'avista' | 'parcelado'>('parcelado')
  const [numParcelas, setNumParcelas] = useState('12')
  const [diaVenc, setDiaVenc] = useState('5')
  const [arquivo, setArquivo] = useState<string | null>(null)

  // Step 3 — masters + CSM
  const [masters, setMasters] = useState<MngContatoMaster[]>([{ nome: '', email: '', telefone: '' }])
  const [csmId, setCsmId] = useState(mngCsms()[0]?.id ?? '')

  const onPlano = (v: string) => { setPlano(v); setLicencas(String(PLANO_LICENCAS[v] ?? '')) }
  const onInicio = (v: string) => { setInicio(v); if (v) setFim(anoDepois(v)) }
  const setMaster = (i: number, patch: Partial<MngContatoMaster>) => setMasters((ms) => ms.map((m, k) => (k === i ? { ...m, ...patch } : m)))
  const addMaster = () => setMasters((ms) => [...ms, { nome: '', email: '', telefone: '' }])
  const removeMaster = (i: number) => setMasters((ms) => ms.filter((_, k) => k !== i))

  const datasOk = Boolean(inicio && fim) && fim > inicio
  const nParcelas = pagamento === 'avista' ? 1 : Number(numParcelas)
  const valorParcela = nParcelas > 0 && Number(valorTotal) > 0 ? Math.round(Number(valorTotal) / nParcelas) : 0

  const step1Ok = Boolean(razaoSocial.trim() && nomeFantasia.trim() && cnpj.trim() && segmento)
  const step2Ok = Boolean(plano) && Number(licencas) > 0 && datasOk && Number(valorTotal) > 0 &&
    (pagamento === 'avista' || Number(numParcelas) >= 1) && Number(diaVenc) >= 1 && Number(diaVenc) <= 28
  const step3Ok = masters.some((m) => m.nome.trim() && m.email.trim()) && Boolean(csmId)
  const stepOk = [step1Ok, step2Ok, step3Ok][step]

  const mastersValidos = masters.filter((m) => m.nome.trim() && m.email.trim())

  const criar = async () => {
    if (!step3Ok) return
    setSalvando(true)
    const empresa = await mngEmpresaService.create({
      razaoSocial: razaoSocial.trim(), nomeFantasia: nomeFantasia.trim(), cnpj: cnpj.trim(), segmento,
      masters: mastersValidos.map((m) => ({ nome: m.nome.trim(), email: m.email.trim(), telefone: m.telefone.trim() })),
      csmId, plano, licencas: Number(licencas), valorTotal: Number(valorTotal),
      pagamento, numParcelas: nParcelas, diaVencimento: Number(diaVenc),
      inicio, fim, arquivo: arquivo ?? undefined,
    })
    setSalvando(false)
    setCriada(empresa)
  }

  if (criada) {
    const csmNome = mngCsms().find((g) => g.id === csmId)?.nome ?? '—'
    return (
      <div className="px-5 py-8 text-center lg:px-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-bg">
          <Icon icon="ph:check-circle-bold" width={30} className="text-success" aria-hidden />
        </div>
        <p className="mt-3 font-heading text-lg font-semibold text-ink">Empresa cadastrada</p>
        <p className="mt-1 text-[13px] text-ink-secondary"><span className="font-medium text-ink">{criada.nomeFantasia}</span> está ativa. {mastersValidos.length > 1 ? 'Os Masters receberão' : 'O Master receberá'} o link de primeiro acesso por e-mail.</p>

        <div className="mx-auto mt-5 max-w-sm rounded-lg border border-border bg-surface px-4 text-left">
          <Resumo label="Plano" value={plano} />
          <Resumo label="Vigência" value={`${fmtData(inicio)} — ${fmtData(fim)}`} />
          <Resumo label="Licenças" value={`${licencas} beneficiários`} />
          <Resumo label="Pagamento" value={pagamento === 'avista' ? 'À vista' : `${nParcelas}× de ${brl(valorParcela)}`} />
          <Resumo label={mastersValidos.length > 1 ? 'Masters' : 'Master'} value={mastersValidos.length > 1 ? `${mastersValidos.length} usuários` : mastersValidos[0]?.nome ?? '—'} />
          <Resumo label="CSM responsável" value={csmNome} />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
          <Button iconRight="ph:arrow-right-bold" onClick={() => onCreated(criada)}>Ir para a empresa</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 px-5 py-6 lg:px-6">
      {/* Indicador de etapas */}
      <ol className="flex items-center gap-2">
        {STEPS.map((label, i) => {
          const done = i < step
          const atual = i === step
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${atual ? 'bg-primary text-white' : done ? 'bg-primary-50 text-primary dark:text-primary-300' : 'bg-surface-2 text-ink-muted'}`}>
                {done ? <Icon icon="ph:check-bold" width={12} aria-hidden /> : i + 1}
              </span>
              <span className={`text-[12.5px] font-medium ${atual ? 'text-ink' : 'text-ink-muted'}`}>{label}</span>
              {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
            </li>
          )
        })}
      </ol>

      {/* Step 1 — Empresa */}
      {step === 0 && (
        <div className="flex flex-col gap-4">
          <Campo label="Razão social"><input className={inputCls} value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} placeholder="Ex.: Nova Vita Saúde S.A." /></Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Nome fantasia"><input className={inputCls} value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} placeholder="Ex.: Nova Vita" /></Campo>
            <Campo label="CNPJ"><input className={inputCls} value={cnpj} onChange={(e) => setCnpj(e.target.value)} inputMode="numeric" placeholder="00.000.000/0000-00" /></Campo>
          </div>
          <Campo label="Segmento">
            <select className={inputCls} value={segmento} onChange={(e) => setSegmento(e.target.value)}>
              <option value="" disabled>Selecione…</option>
              {SEGMENTOS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Campo>
        </div>
      )}

      {/* Step 2 — Contrato */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <Campo label="Plano contratado">
            <select className={inputCls} value={plano} onChange={(e) => onPlano(e.target.value)}>
              {PLANOS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Data de início"><input type="date" className={inputCls} value={inicio} onChange={(e) => onInicio(e.target.value)} /></Campo>
            <Campo label="Data de término"><input type="date" className={inputCls} value={fim} min={inicio || undefined} onChange={(e) => setFim(e.target.value)} /></Campo>
          </div>
          {inicio && fim && !datasOk && <p className="-mt-2 text-[12.5px] text-danger-ink">O término deve ser posterior ao início.</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Número de licenças"><input type="number" min={1} className={inputCls} value={licencas} onChange={(e) => setLicencas(e.target.value)} /></Campo>
            <Campo label="Valor total do contrato">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted">R$</span>
                <input type="number" min={0} className={`${inputCls} pl-9`} value={valorTotal} onChange={(e) => setValorTotal(e.target.value)} placeholder="90000" />
              </div>
            </Campo>
          </div>

          <div>
            <span className="mb-1.5 block text-[13px] font-semibold text-ink">Modelo de pagamento</span>
            <div className="flex gap-1 rounded-lg bg-surface-2 p-1">
              {([['avista', 'À vista'], ['parcelado', 'Parcelado']] as const).map(([k, l]) => (
                <button key={k} onClick={() => setPagamento(k)} aria-selected={pagamento === k}
                  className={`flex-1 rounded-lg px-3 py-2 font-heading text-sm font-semibold transition-all ${pagamento === k ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'}`}>{l}</button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {pagamento === 'parcelado' && (
              <Campo label="Nº de parcelas"><input type="number" min={1} max={60} className={inputCls} value={numParcelas} onChange={(e) => setNumParcelas(e.target.value)} /></Campo>
            )}
            <Campo label="Dia do vencimento"><input type="number" min={1} max={28} className={inputCls} value={diaVenc} onChange={(e) => setDiaVenc(e.target.value)} /></Campo>
          </div>
          {valorParcela > 0 && (
            <div className="rounded-lg border border-border bg-surface-2/50 px-4 py-3 text-[13px] text-ink-secondary">
              {pagamento === 'avista'
                ? <>Pagamento único de <span className="font-semibold text-ink">{brl(Number(valorTotal))}</span>.</>
                : <><span className="font-semibold text-ink">{nParcelas}×</span> de <span className="font-semibold text-ink">{brl(valorParcela)}</span> · total {brl(Number(valorTotal))}.</>}
            </div>
          )}

          <div>
            <span className="mb-1.5 block text-[13px] font-semibold text-ink">Contrato assinado (PDF)</span>
            {arquivo ? (
              <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-[13px]">
                <span className="flex items-center gap-2"><Icon icon="ph:file-pdf-bold" width={16} className="text-primary dark:text-primary-300" aria-hidden /> {arquivo}</span>
                <button onClick={() => setArquivo(null)} className="text-ink-muted hover:text-ink" aria-label="Remover"><Icon icon="ph:x-bold" width={14} aria-hidden /></button>
              </div>
            ) : (
              <button onClick={() => setArquivo('contrato-assinado.pdf')} className="flex w-full items-center justify-center gap-2 rounded border-[1.5px] border-dashed border-border bg-surface px-4 py-3 text-[13px] font-medium text-ink-secondary transition-colors hover:border-primary hover:text-ink">
                <Icon icon="ph:upload-simple-bold" width={16} aria-hidden /> Anexar contrato (PDF)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 3 — Masters + CSM */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-ink">Usuário(s) Master (RH)</span>
              <button onClick={addMaster} className="inline-flex items-center gap-1 text-[12.5px] font-medium text-primary hover:underline dark:text-primary-300"><Icon icon="ph:plus-bold" width={13} aria-hidden /> Adicionar</button>
            </div>
            <p className="mb-3 text-[12px] text-ink-muted">Cada Master recebe um e-mail com link de primeiro acesso.</p>
            <div className="flex flex-col gap-3">
              {masters.map((m, i) => (
                <div key={i} className="rounded-lg border border-border bg-surface-2/40 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[12px] font-medium text-ink-secondary">Master {i + 1}</span>
                    {masters.length > 1 && <button onClick={() => removeMaster(i)} className="text-ink-muted hover:text-danger-ink" aria-label="Remover"><Icon icon="ph:trash-bold" width={14} aria-hidden /></button>}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input className={inputCls} value={m.nome} onChange={(e) => setMaster(i, { nome: e.target.value })} placeholder="Nome" />
                    <input className={inputCls} value={m.telefone} onChange={(e) => setMaster(i, { telefone: e.target.value })} inputMode="tel" placeholder="Telefone" />
                    <input className={`${inputCls} sm:col-span-2`} value={m.email} onChange={(e) => setMaster(i, { email: e.target.value })} type="email" placeholder="E-mail corporativo" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Campo label="CSM responsável (YNA)">
            <select className={inputCls} value={csmId} onChange={(e) => setCsmId(e.target.value)}>
              {mngCsms().map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
            </select>
          </Campo>
        </div>
      )}

      {/* Navegação */}
      <div className="mt-1 flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={step === 0 ? onClose : () => setStep((s) => s - 1)}>{step === 0 ? 'Cancelar' : 'Voltar'}</Button>
        {step < 2
          ? <Button iconRight="ph:arrow-right-bold" disabled={!stepOk} onClick={() => setStep((s) => s + 1)}>Continuar</Button>
          : <Button iconLeft="ph:check-bold" disabled={!stepOk || salvando} onClick={criar}>{salvando ? 'Criando…' : 'Criar empresa'}</Button>}
      </div>
    </div>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-ink">{label}</span>
      {children}
    </label>
  )
}

function Resumo({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2.5 last:border-0">
      <span className="text-[13px] text-ink-secondary">{label}</span>
      <span className="text-right text-[13px] font-medium text-ink">{value}</span>
    </div>
  )
}
