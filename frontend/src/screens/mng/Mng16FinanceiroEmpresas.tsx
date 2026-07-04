import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { SearchSelect } from '../../components/SearchSelect'
import { FiltrosBar } from '../../components/FiltrosBar'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { useService } from '../../hooks/useService'
import { mngParcelaFinService } from '../../services/mng'
import type { MngParcelaFin, MngParcelaFinStatus } from '../../types'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const fmtData = (iso?: string) => { if (!iso) return '—'; const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}` }
const selCls = 'w-full rounded border-[1.5px] border-border bg-surface px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-primary'

const STATUS: Record<MngParcelaFinStatus, { label: string; tone: 'warning' | 'primary' | 'success' | 'danger'; icon: string }> = {
  'pendente-emissao': { label: 'Pendente de emissão', tone: 'warning', icon: 'ph:file-dashed-bold' },
  emitida: { label: 'Emitida', tone: 'primary', icon: 'ph:receipt-bold' },
  paga: { label: 'Paga', tone: 'success', icon: 'ph:check-circle-bold' },
  atrasada: { label: 'Atrasada', tone: 'danger', icon: 'ph:warning-bold' },
}
const CARDS: { st: MngParcelaFinStatus; icon: string; label: string }[] = [
  { st: 'pendente-emissao', icon: 'ph:file-dashed-bold', label: 'Pendentes de emissão' },
  { st: 'emitida', icon: 'ph:receipt-bold', label: 'Emitidas' },
  { st: 'paga', icon: 'ph:check-circle-bold', label: 'Pagas' },
  { st: 'atrasada', icon: 'ph:warning-bold', label: 'Atrasadas' },
]

/* Visão Empresas do Financeiro — parcelas dos contratos, com emissão de NF+boleto
   e baixa de pagamento. */
export function EmpresasFinanceiroView({ initialStatus }: { initialStatus?: string }) {
  const parcelasQ = useService(() => mngParcelaFinService.list(), [])
  const [razao, setRazao] = useState('todos')
  const [cnpj, setCnpj] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [status, setStatus] = useState<MngParcelaFinStatus | 'todos'>(
    initialStatus === 'pendente-emissao' || initialStatus === 'emitida' || initialStatus === 'paga' || initialStatus === 'atrasada' ? initialStatus : 'todos',
  )
  const [emitirP, setEmitirP] = useState<MngParcelaFin | null>(null)
  const [baixaP, setBaixaP] = useState<MngParcelaFin | null>(null)
  const [detalheP, setDetalheP] = useState<MngParcelaFin | null>(null)

  const dados = parcelasQ.status === 'success' ? parcelasQ.data : []
  const razaoOptions = useMemo(() => [
    { value: 'todos', label: 'Todas' },
    ...[...new Set(dados.map((p) => p.razaoSocial))].sort((a, b) => a.localeCompare(b, 'pt-BR')).map((r) => ({ value: r, label: r })),
  ], [dados])

  const baseFiltradas = useMemo(() => dados.filter((p) =>
    (razao === 'todos' || p.razaoSocial === razao) &&
    (!cnpj.trim() || p.cnpj.replace(/\D/g, '').includes(cnpj.replace(/\D/g, ''))) &&
    (!dataInicio || p.vencimento >= dataInicio) &&
    (!dataFim || p.vencimento <= dataFim)
  ), [dados, razao, cnpj, dataInicio, dataFim])

  const lista = useMemo(() => baseFiltradas.filter((p) => status === 'todos' || p.status === status), [baseFiltradas, status])
  const contar = (st: MngParcelaFinStatus) => baseFiltradas.filter((p) => p.status === st).length
  const ativos = [razao !== 'todos', !!cnpj.trim(), !!dataInicio, !!dataFim].filter(Boolean).length
  const limpar = () => { setRazao('todos'); setCnpj(''); setDataInicio(''); setDataFim(''); setStatus('todos') }

  return (
    <>
      {parcelasQ.status === 'loading' && <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}</div>}
      {parcelasQ.status === 'error' && <ErrorState message={parcelasQ.message} onRetry={parcelasQ.reload} />}
      {parcelasQ.status === 'success' && (
        <>
          {/* Filtros */}
          <FiltrosBar ativos={ativos} onLimpar={limpar}>
            <div className="min-w-0 lg:flex-1">
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-muted">Razão social</span>
              <SearchSelect value={razao} onChange={setRazao} options={razaoOptions} placeholder="Todas" searchPlaceholder="Buscar empresa…" />
            </div>
            <Campo label="CNPJ" className="lg:w-44"><input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" className={selCls} /></Campo>
            <Campo label="Vencimento de" className="lg:w-36"><input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className={selCls} /></Campo>
            <Campo label="Até" className="lg:w-36"><input type="date" value={dataFim} min={dataInicio || undefined} onChange={(e) => setDataFim(e.target.value)} className={selCls} /></Campo>
          </FiltrosBar>

          {/* Big numbers clicáveis */}
          <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {CARDS.map((c) => {
              const on = status === c.st
              return (
                <button key={c.st} onClick={() => setStatus((cur) => (cur === c.st ? 'todos' : c.st))} aria-pressed={on}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-4 text-center transition-colors ${on ? 'border-primary bg-primary-50 dark:bg-primary-50/10' : 'border-border bg-surface hover:border-border-strong'}`}>
                  <Icon icon={c.icon} width={20} className="text-primary dark:text-primary-300" aria-hidden />
                  <p className="text-2xl font-bold text-ink">{contar(c.st)}</p>
                  <p className="text-xs text-ink-secondary">{c.label}</p>
                </button>
              )
            })}
          </div>
          {status !== 'todos' && (
            <button onClick={() => setStatus('todos')} className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium text-ink-secondary transition-colors hover:text-ink">
              <Icon icon="ph:x-bold" width={12} aria-hidden /> Filtrando por {STATUS[status].label} · limpar
            </button>
          )}

          {/* Lista de parcelas (vencimento crescente) */}
          <div className="mt-4 flex flex-col gap-2">
            {lista.map((p) => {
              const st = STATUS[p.status]
              return (
                <div key={p.id} className="rounded-lg border border-border bg-surface p-4">
                  {/* Colunas fixas no desktop → dados alinhados, ações à direita */}
                  <div className="grid grid-cols-2 items-center gap-x-4 gap-y-3 lg:grid-cols-[minmax(0,1fr)_116px_156px_272px]">
                    {/* Info */}
                    <div className="col-span-2 min-w-0 lg:col-span-1">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300"><Icon icon="ph:buildings-bold" width={20} aria-hidden /></div>
                        <div className="min-w-0">
                          <p className="truncate font-heading text-sm font-semibold text-ink">{p.razaoSocial}</p>
                          <p className="truncate text-[12.5px] text-ink-secondary">{p.contrato} · Parcela {p.numero}/{p.totalParcelas}</p>
                        </div>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink-muted">
                        <span>CNPJ {p.cnpj}</span>
                        <span><Icon icon="ph:calendar-dot-bold" width={12} className="mr-1 inline" aria-hidden />Venc. {fmtData(p.vencimento)}</span>
                        {p.status === 'paga' && <span className="text-success-ink"><Icon icon="ph:check-bold" width={12} className="mr-1 inline" aria-hidden />Pago em {fmtData(p.dataPagamento)} · {brl(p.valorPago ?? 0)}</span>}
                      </div>
                    </div>

                    {/* Valor */}
                    <p className="font-heading text-sm font-semibold tabular-nums text-ink lg:text-right">{brl(p.valor)}</p>

                    {/* Status */}
                    <div className="flex justify-end lg:justify-start"><Badge tone={st.tone} icon={st.icon}>{st.label}</Badge></div>

                    {/* Ações */}
                    <div className="col-span-2 flex flex-wrap gap-2 lg:col-span-1 lg:justify-end">
                      {p.status === 'pendente-emissao' && (
                        <Button size="sm" className="w-full lg:w-auto" iconLeft="ph:upload-simple-bold" onClick={() => setEmitirP(p)}>Enviar NF e boleto</Button>
                      )}
                      {(p.status === 'emitida' || p.status === 'atrasada') && (
                        <>
                          <Button size="sm" variant="secondary" className="w-full lg:w-auto" iconLeft="ph:pencil-simple-bold" onClick={() => setEmitirP(p)}>Editar arquivos</Button>
                          <Button size="sm" className="w-full lg:w-auto" iconLeft="ph:check-bold" onClick={() => setBaixaP(p)}>Dar baixa</Button>
                        </>
                      )}
                      {p.status === 'paga' && (
                        <Button size="sm" variant="secondary" className="w-full lg:w-auto" iconLeft="ph:eye-bold" onClick={() => setDetalheP(p)}>Ver detalhes</Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {lista.length === 0 && <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-sm text-ink-secondary">Nenhuma parcela para os filtros selecionados.</div>}
          </div>
        </>
      )}

      <EmitirModal parcela={emitirP} onClose={() => setEmitirP(null)} onDone={() => { setEmitirP(null); parcelasQ.reload() }} />
      <BaixaModal parcela={baixaP} onClose={() => setBaixaP(null)} onDone={() => { setBaixaP(null); parcelasQ.reload() }} />
      <DetalhesModal parcela={detalheP} onClose={() => setDetalheP(null)} />
    </>
  )
}

/* ── Modal: enviar/editar NF + boleto ── */
function EmitirModal({ parcela, onClose, onDone }: { parcela: MngParcelaFin | null; onClose: () => void; onDone: () => void }) {
  const [nf, setNf] = useState<string | null>(null)
  const [boleto, setBoleto] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  // Pré-preenche ao abrir (edição).
  useEffect(() => { if (parcela) { setNf(parcela.notaFiscal ?? null); setBoleto(parcela.boleto ?? null); setSalvando(false) } }, [parcela?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const editar = parcela?.status === 'emitida' || parcela?.status === 'atrasada'
  const valido = !!nf && !!boleto

  const enviar = async () => {
    if (!parcela || !valido) return
    setSalvando(true)
    await mngParcelaFinService.emitir(parcela.id, nf!, boleto!)
    onDone()
  }

  return (
    <Modal open={parcela !== null} title={editar ? 'Editar arquivos da parcela' : 'Enviar NF e boleto'} onClose={onClose}>
      {parcela && (
        <div className="flex flex-col gap-4">
          <p className="text-[13px] text-ink-secondary">{parcela.razaoSocial} · {parcela.contrato} · Parcela {parcela.numero}/{parcela.totalParcelas} · {brl(parcela.valor)}</p>
          <Upload label="Nota fiscal (PDF)" arquivo={nf} onSet={() => setNf(`nf-${parcela.id}.pdf`)} onRemove={() => setNf(null)} />
          <Upload label="Boleto de pagamento (PDF)" arquivo={boleto} onSet={() => setBoleto(`boleto-${parcela.id}.pdf`)} onRemove={() => setBoleto(null)} />
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button fullWidth disabled={!valido || salvando} iconLeft="ph:paper-plane-tilt-bold" onClick={enviar}>{salvando ? 'Enviando…' : editar ? 'Reenviar arquivos' : 'Enviar'}</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

/* ── Modal: dar baixa (data + valor pago) ── */
function BaixaModal({ parcela, onClose, onDone }: { parcela: MngParcelaFin | null; onClose: () => void; onDone: () => void }) {
  const [data, setData] = useState('')
  const [valor, setValor] = useState<number>(0)
  const [salvando, setSalvando] = useState(false)
  useEffect(() => { if (parcela) { setData(''); setValor(parcela.valor); setSalvando(false) } }, [parcela?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const valido = !!data && valor > 0

  const confirmar = async () => {
    if (!parcela || !valido) return
    setSalvando(true)
    await mngParcelaFinService.darBaixa(parcela.id, data, valor)
    onDone()
  }

  return (
    <Modal open={parcela !== null} title="Dar baixa no pagamento" onClose={onClose}>
      {parcela && (
        <div className="flex flex-col gap-4">
          <p className="text-[13px] text-ink-secondary">{parcela.razaoSocial} · Parcela {parcela.numero}/{parcela.totalParcelas} · vencimento {fmtData(parcela.vencimento)}</p>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-ink">Data do pagamento</span>
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-full rounded border-[1.5px] border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-ink">Valor pago</span>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-secondary">R$</span>
              <input type="number" value={Number.isFinite(valor) ? valor : ''} onChange={(e) => setValor(e.target.valueAsNumber)} className="w-full rounded border-[1.5px] border-border bg-surface py-2 pl-9 pr-3 text-sm font-semibold text-ink outline-none focus:border-primary" />
            </div>
            <p className="mt-1 text-[12px] text-ink-muted">Valor da parcela: {brl(parcela.valor)}</p>
          </label>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button fullWidth disabled={!valido || salvando} iconLeft="ph:check-bold" onClick={confirmar}>{salvando ? 'Registrando…' : 'Confirmar baixa'}</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

/* ── Modal: detalhes da parcela paga ── */
function DetalhesModal({ parcela, onClose }: { parcela: MngParcelaFin | null; onClose: () => void }) {
  return (
    <Modal open={parcela !== null} title="Detalhes do pagamento" onClose={onClose}>
      {parcela && (
        <div className="flex flex-col gap-4">
          <p className="text-[13px] text-ink-secondary">{parcela.razaoSocial} · {parcela.contrato} · Parcela {parcela.numero}/{parcela.totalParcelas}</p>
          <dl className="flex flex-col divide-y divide-border rounded-lg border border-border">
            <Linha label="Valor da parcela" valor={brl(parcela.valor)} />
            <Linha label="Valor pago" valor={brl(parcela.valorPago ?? 0)} strong />
            <Linha label="Data do pagamento" valor={fmtData(parcela.dataPagamento)} />
            <Linha label="Vencimento" valor={fmtData(parcela.vencimento)} />
          </dl>
          {parcela.notaFiscal && (
            <Button variant="secondary" fullWidth iconLeft="ph:file-text-bold" onClick={() => { /* nota simulada */ }}>Baixar nota fiscal</Button>
          )}
          <Button fullWidth onClick={onClose}>Fechar</Button>
        </div>
      )}
    </Modal>
  )
}

function Linha({ label, valor, strong }: { label: string; valor: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5">
      <dt className="text-[13px] text-ink-secondary">{label}</dt>
      <dd className={`text-sm tabular-nums ${strong ? 'font-bold text-ink' : 'font-medium text-ink'}`}>{valor}</dd>
    </div>
  )
}

/* Upload simples (mock) de um arquivo. */
function Upload({ label, arquivo, onSet, onRemove }: { label: string; arquivo: string | null; onSet: () => void; onRemove: () => void }) {
  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-semibold text-ink">{label}</span>
      {arquivo ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 text-[13px]">
          <span className="flex min-w-0 items-center gap-2"><Icon icon="ph:file-pdf-bold" width={17} className="shrink-0 text-primary dark:text-primary-300" aria-hidden /><span className="truncate">{arquivo}</span></span>
          <button onClick={onRemove} className="shrink-0 text-ink-muted hover:text-ink" aria-label="Remover"><Icon icon="ph:x-bold" width={15} aria-hidden /></button>
        </div>
      ) : (
        <button onClick={onSet} className="flex w-full items-center justify-center gap-2 rounded border-[1.5px] border-dashed border-border bg-surface px-4 py-3 text-[13px] font-medium text-ink-secondary transition-colors hover:border-primary hover:text-ink">
          <Icon icon="ph:upload-simple-bold" width={16} aria-hidden /> Anexar arquivo (PDF)
        </button>
      )}
    </div>
  )
}

function Campo({ label, className = '', children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-muted">{label}</span>
      {children}
    </label>
  )
}
