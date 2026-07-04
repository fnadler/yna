import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { ProTopBar } from '../../components/ProTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { StatTile } from '../../components/StatTile'
import { Sheet } from '../../components/Sheet'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { proFinanceService } from '../../services/pro'
import { PRO_TODAY, ynaDadosNota } from '../../data/proMock'
import { addDaysISO } from './sessionDisplay'
import type { NotaFiscal, ProFatura } from '../../types'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtData = (iso: string) => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}` }
const mesCurto = (label: string) => { const [m, a] = label.split(' '); return a ? `${m}/${a.slice(2)}` : label }

interface Solicitacao { valor: number; dataISO: string; taxa: number; desconto: number; liquido: number }
type Emissao = { numero: string; arquivoNome: string }

const OPCOES_ANTECIPACAO = [
  { dias: 1, taxa: 3.5 },
  { dias: 7, taxa: 2.4 },
  { dias: 15, taxa: 1.5 },
  { dias: 30, taxa: 0.8 },
]

/* Metadados de exibição por status da nota. */
const NF_STATUS: Record<NotaFiscal['status'], { label: string; tone: 'neutral' | 'warning' | 'danger' | 'success'; icon: string }> = {
  pendente: { label: 'A emitir', tone: 'warning', icon: 'ph:clock-bold' },
  'em-analise': { label: 'Em análise', tone: 'neutral', icon: 'ph:hourglass-medium-bold' },
  'requer-ajuste': { label: 'Requer retificação', tone: 'danger', icon: 'ph:warning-bold' },
  aprovada: { label: 'Paga', tone: 'success', icon: 'ph:check-circle-bold' },
}

/* PRO-24 — Financeiro (modelo "fatura de cartão"): períodos mensais que acumulam
   as sessões realizadas. Aberto → antecipação; fechado → nota fiscal + pagamento. */
export function Pro24Financeiro() {
  const faturasQ = useService(() => proFinanceService.faturas(), [])
  const [sel, setSel] = useState(0)
  const [antecipar, setAntecipar] = useState(false)
  const [solicitacao, setSolicitacao] = useState<Solicitacao | null>(null)
  const [emitir, setEmitir] = useState<NotaFiscal | null>(null)
  // Envios de nota feitos na sessão (protótipo): mes → dados; a nota vira "em análise".
  const [enviadas, setEnviadas] = useState<Record<string, Emissao>>({})

  const faturas = faturasQ.status === 'success' ? faturasQ.data : []

  // Seleciona o período aberto (atual) por padrão.
  useEffect(() => {
    if (faturas.length === 0) return
    const abertoIdx = faturas.findIndex((f) => f.status === 'aberto')
    setSel(abertoIdx >= 0 ? abertoIdx : faturas.length - 1)
  }, [faturasQ.status]) // eslint-disable-line react-hooks/exhaustive-deps

  const paga = (f: ProFatura) => f.nota?.status === 'aprovada'
  const totalResgatado = faturas.filter(paga).reduce((s, f) => s + f.total, 0)
  const totalAResgatar = faturas.filter((f) => !paga(f)).reduce((s, f) => s + f.total, 0)

  // Aplica envios locais por cima da nota do período.
  const notaMerge = (f: ProFatura): NotaFiscal | undefined => {
    if (!f.nota) return undefined
    const e = enviadas[f.mes]
    return e ? { ...f.nota, status: 'em-analise', numero: e.numero, arquivoNome: e.arquivoNome, emitidaEm: PRO_TODAY, motivoRetificacao: undefined } : f.nota
  }

  const fatura = faturas[sel]

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <ProTopBar />
        <PageHeader title="Financeiro" subtitle="Seus recebimentos por período, com clareza." className="mt-2 lg:mt-0" />

        {faturasQ.status === 'loading' && <Skeleton className="h-24 w-full rounded-lg" />}
        {faturasQ.status === 'error' && <ErrorState message={faturasQ.message} onRetry={faturasQ.reload} />}
        {faturasQ.status === 'success' && fatura && (
          <>
            {/* Big numbers */}
            <div className="grid grid-cols-2 gap-2.5">
              <StatTile icon="ph:wallet-bold" value={brl(totalAResgatar)} label="Total a resgatar" />
              <StatTile icon="ph:hand-coins-bold" value={brl(totalResgatado)} label="Total resgatado" />
            </div>

            {/* Navegação de períodos */}
            <div className="mt-5 flex items-center gap-2">
              <NavBtn icon="ph:caret-left-bold" disabled={sel === 0} onClick={() => setSel((s) => Math.max(0, s - 1))} label="Período anterior" />
              <div className="flex flex-1 gap-1 overflow-x-auto rounded-lg bg-surface-2 p-1">
                {faturas.map((f, i) => {
                  const on = i === sel
                  return (
                    <button key={f.mes} onClick={() => setSel(i)} aria-pressed={on}
                      className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 font-heading text-[13px] font-semibold transition-all ${on ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'}`}>
                      {mesCurto(f.label)}
                    </button>
                  )
                })}
              </div>
              <NavBtn icon="ph:caret-right-bold" disabled={sel === faturas.length - 1} onClick={() => setSel((s) => Math.min(faturas.length - 1, s + 1))} label="Próximo período" />
            </div>

            {/* Detalhe do período */}
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {/* Valor do período */}
              <div className="flex flex-col rounded-lg border border-border bg-surface p-4">
                <div className="mb-1 flex items-center justify-between">
                  <Icon icon="ph:calendar-check-bold" width={22} className="text-primary dark:text-primary-300" aria-hidden />
                  <Badge tone={fatura.status === 'aberto' ? 'primary' : 'neutral'}>{fatura.status === 'aberto' ? 'Aberto' : 'Fechado'}</Badge>
                </div>
                <p className="mt-1 text-2xl font-bold text-ink">{brl(fatura.total)}</p>
                <p className="text-[12.5px] text-ink-secondary">{paga(fatura) ? 'Valor recebido' : 'Valor a receber'}</p>
                <p className="mt-1 text-[11.5px] text-ink-muted">{fatura.sessoes.length} sessões realizadas</p>
              </div>

              {/* Ação: antecipação (aberto) ou nota + pagamento (fechado) */}
              {fatura.status === 'aberto' ? (
                <div className="flex flex-col justify-center gap-2 rounded-lg border border-primary/30 bg-primary-50 p-4">
                  <p className="flex items-center gap-1.5 font-heading text-[12.5px] font-semibold text-ink-secondary"><Icon icon="ph:lightning-bold" width={15} className="text-primary dark:text-primary-300" aria-hidden /> Antecipação disponível</p>
                  <p className="text-xl font-bold leading-tight text-ink">{brl(fatura.antecipacaoDisponivel ?? 0)}</p>
                  <Button size="sm" className="mt-1 w-full" iconLeft={solicitacao ? 'ph:check-bold' : 'ph:lightning-bold'} onClick={() => setAntecipar(true)}>
                    {solicitacao ? 'Antecipação solicitada' : 'Antecipar pagamento'}
                  </Button>
                </div>
              ) : (
                <PeriodoFechado fatura={fatura} nota={notaMerge(fatura)!} onEmitir={() => setEmitir(notaMerge(fatura)!)} />
              )}
            </div>

            {/* Sessões do período */}
            <div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface">
              <div className="hidden grid-cols-[110px_1fr_120px] gap-3 border-b border-border px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-ink-muted sm:grid">
                <span>Data</span><span>Movimentação</span><span className="text-right">Valor</span>
              </div>
              <ul className="divide-y divide-border">
                {fatura.sessoes.map((s) => (
                  <li key={s.id} className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[110px_1fr_120px]">
                    <span className="hidden font-mono text-[12.5px] text-ink-secondary sm:block">{fmtData(s.data)}</span>
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50"><Icon icon="ph:video-camera-bold" width={16} className="text-primary dark:text-primary-300" aria-hidden /></div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">Sessão às {s.hora} · {s.beneficiario}</p>
                        <p className="font-mono text-[11.5px] text-ink-muted sm:hidden">{fmtData(s.data)}</p>
                      </div>
                    </div>
                    <span className="text-right text-sm font-semibold tabular-nums text-success">+ {brl(s.valor)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-2/40 px-4 py-2.5 text-[13px] font-semibold text-ink">
                <span>Total do período</span><span className="tabular-nums">{brl(fatura.total)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de antecipação (período aberto) */}
      <AnteciparModal
        open={antecipar}
        onClose={() => setAntecipar(false)}
        disponivel={fatura?.antecipacaoDisponivel ?? 0}
        solicitacao={solicitacao}
        onConfirm={(s) => setSolicitacao(s)}
        onCancelar={() => { setSolicitacao(null); setAntecipar(false) }}
      />

      {/* Sheet: emitir/reenviar nota (período fechado) */}
      <EmitirNotaSheet
        nota={emitir}
        onClose={() => setEmitir(null)}
        onSubmit={(dados) => { if (fatura) setEnviadas((s) => ({ ...s, [fatura.mes]: dados })); setEmitir(null) }}
      />
    </div>
  )
}

function NavBtn({ icon, disabled, onClick, label }: { icon: string; disabled: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={label}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover disabled:opacity-30">
      <Icon icon={icon} width={16} aria-hidden />
    </button>
  )
}

/* ── Período fechado: nota fiscal + status do pagamento ── */
function PeriodoFechado({ fatura, nota, onEmitir }: { fatura: ProFatura; nota: NotaFiscal; onEmitir: () => void }) {
  const st = NF_STATUS[nota.status]
  const paga = nota.status === 'aprovada'
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      {/* Nota fiscal */}
      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 font-heading text-[13px] font-semibold text-ink"><Icon icon="ph:receipt-bold" width={16} className="text-primary dark:text-primary-300" aria-hidden /> Nota fiscal</p>
          <Badge tone={st.tone} icon={st.icon}>{st.label}</Badge>
        </div>
        {nota.status === 'requer-ajuste' && nota.motivoRetificacao && (
          <div className="mb-2 flex gap-2 rounded-lg border border-danger/30 bg-danger-bg px-3 py-2 text-[12px] text-danger-ink">
            <Icon icon="ph:warning-bold" width={14} className="mt-px shrink-0" aria-hidden />
            <span><span className="font-semibold">Observação da YNA:</span> {nota.motivoRetificacao}</span>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {(nota.status === 'pendente' || nota.status === 'requer-ajuste') && (
            <Button size="sm" iconLeft="ph:upload-simple-bold" onClick={onEmitir}>{nota.status === 'requer-ajuste' ? 'Reenviar nota' : 'Enviar nota'}</Button>
          )}
          {(nota.status === 'em-analise' || paga) && nota.arquivoNome && (
            <Button size="sm" variant="secondary" iconLeft="ph:file-text-bold" onClick={() => { /* nota simulada */ }}>Baixar nota</Button>
          )}
          {paga && nota.comprovanteNome && (
            <Button size="sm" variant="secondary" iconLeft="ph:download-simple-bold" onClick={() => { /* comprovante simulado */ }}>Comprovante</Button>
          )}
        </div>
      </div>

      {/* Pagamento */}
      <div className="border-t border-border pt-2.5">
        {paga && nota.dataPagamento ? (
          <p className="flex items-center gap-1.5 text-[12.5px] text-success"><Icon icon="ph:check-circle-bold" width={15} aria-hidden /> Pago em <span className="font-semibold">{fmtData(nota.dataPagamento)}</span></p>
        ) : (
          <p className="flex items-center gap-1.5 text-[12.5px] text-ink-secondary"><Icon icon="ph:calendar-dot-bold" width={15} className="text-ink-muted" aria-hidden /> Pagamento previsto para <span className="font-semibold text-ink">{fmtData(fatura.dataPrevistaPagamento)}</span></p>
        )}
      </div>
    </div>
  )
}

/* ── Modal de antecipação ── */
function AnteciparModal({ open, onClose, disponivel, solicitacao, onConfirm, onCancelar }: {
  open: boolean
  onClose: () => void
  disponivel: number
  solicitacao: Solicitacao | null
  onConfirm: (s: Solicitacao) => void
  onCancelar: () => void
}) {
  const [valor, setValor] = useState(disponivel)
  const [opcaoIdx, setOpcaoIdx] = useState(0)
  const [notaEnviada, setNotaEnviada] = useState(false)

  useEffect(() => {
    if (open && !solicitacao) { setValor(disponivel); setOpcaoIdx(0); setNotaEnviada(false) }
  }, [open, solicitacao, disponivel])

  const opcao = OPCOES_ANTECIPACAO[opcaoIdx]
  const valorNum = Number.isFinite(valor) ? valor : 0
  const valido = valorNum > 0 && valorNum <= disponivel
  const desconto = valorNum * (opcao.taxa / 100)
  const liquido = valorNum - desconto

  return (
    <Sheet open={open} title="Antecipar recebíveis" icon="ph:lightning-bold" onClose={onClose} size="md">
      <div className="px-5 py-6 lg:px-6">
        {solicitacao ? (
          <div className="text-ink">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-bg">
                <Icon icon="ph:check-circle-bold" width={30} className="text-success" aria-hidden />
              </div>
              <p className="mt-3 font-heading text-lg font-semibold text-ink">Antecipação solicitada</p>
              <p className="mt-1 text-sm text-ink-secondary">
                <span className="font-semibold text-ink">{brl(solicitacao.liquido)}</span> serão liberados em <span className="font-semibold text-ink">{fmtData(solicitacao.dataISO)}</span>, após o envio e a aprovação da nota fiscal.
              </p>
            </div>
            <dl className="mt-5 flex flex-col divide-y divide-border rounded-lg border border-border">
              <ResumoLinha label="Valor solicitado" valor={brl(solicitacao.valor)} />
              <ResumoLinha label={`Taxa de antecipação (${solicitacao.taxa.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}%)`} valor={`− ${brl(solicitacao.desconto)}`} tone="danger" />
              <ResumoLinha label="Valor líquido" valor={brl(solicitacao.liquido)} strong />
            </dl>

            <div className="mt-6 border-t border-border pt-5">
              <p className="flex items-center gap-1.5 font-heading text-sm font-semibold text-ink">
                <Icon icon="ph:receipt-bold" width={16} className="text-primary dark:text-primary-300" aria-hidden /> Emita a nota fiscal
              </p>
              {notaEnviada ? (
                <p className="mt-2 flex items-center gap-1.5 rounded-lg border border-success/30 bg-success-bg px-3 py-2.5 text-[13px] text-success">
                  <Icon icon="ph:check-circle-bold" width={15} className="shrink-0" aria-hidden /> Nota enviada. Em análise pela YNA — o valor é liberado após a aprovação.
                </p>
              ) : (
                <>
                  <p className="mb-3 mt-1 text-[12.5px] text-ink-secondary">O pagamento da antecipação depende do envio da nota correspondente.</p>
                  <InstrucoesNota valor={solicitacao.valor} vencimento={solicitacao.dataISO} descricao="Antecipação de recebíveis — prestação de serviços de psicologia clínica via plataforma YNA." />
                  <AnexoNotaForm onSubmit={() => setNotaEnviada(true)} />
                </>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
              <Button fullWidth onClick={onClose}>Fechar</Button>
              <Button variant="ghost" fullWidth iconLeft="ph:x-bold" onClick={onCancelar}>Cancelar solicitação</Button>
            </div>
          </div>
        ) : (
          <div className="text-ink">
            <label htmlFor="ant-valor" className="text-[13px] font-semibold text-ink">Quanto você quer antecipar?</label>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-ink-secondary">R$</span>
              <input id="ant-valor" type="number" min={0} max={disponivel} step={10} value={Number.isFinite(valor) ? valor : ''} onChange={(e) => setValor(e.target.valueAsNumber)}
                className="w-full rounded-lg border-[1.5px] border-border bg-surface py-2.5 pl-10 pr-4 text-base font-semibold text-ink outline-none focus:border-primary" />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[12.5px]">
              <span className="text-ink-muted">Disponível: {brl(disponivel)}</span>
              <button onClick={() => setValor(disponivel)} className="font-heading font-semibold text-primary dark:text-primary-300 hover:underline">Usar tudo</button>
            </div>
            {!valido && valorNum > disponivel && <p className="mt-1 text-[12.5px] text-danger-ink">Acima do disponível para antecipação.</p>}

            <p className="mt-5 text-[13px] font-semibold text-ink">Quando quer receber?</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {OPCOES_ANTECIPACAO.map((o, i) => {
                const ativo = i === opcaoIdx
                return (
                  <button key={o.dias} onClick={() => setOpcaoIdx(i)} aria-pressed={ativo}
                    className={`flex flex-col rounded-lg border-[1.5px] px-3 py-2.5 text-left transition-colors ${ativo ? 'border-primary bg-primary-50' : 'border-border bg-surface hover:border-border-strong'}`}>
                    <span className="text-sm font-semibold text-ink">{o.dias === 1 ? 'Amanhã' : `Em ${o.dias} dias`}</span>
                    <span className="font-mono text-[11.5px] text-ink-muted">{fmtData(addDaysISO(PRO_TODAY, o.dias))}</span>
                    <span className={`mt-1 text-[11.5px] font-medium ${ativo ? 'text-primary dark:text-primary-300' : 'text-ink-secondary'}`}>taxa {o.taxa.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}%</span>
                  </button>
                )
              })}
            </div>

            <dl className="mt-5 flex flex-col divide-y divide-border rounded-lg border border-border bg-surface-2/40">
              <ResumoLinha label="Valor a resgatar" valor={brl(valorNum)} />
              <ResumoLinha label={`Taxa de antecipação (${opcao.taxa.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}%)`} valor={`− ${brl(desconto)}`} tone="danger" />
              <ResumoLinha label="Valor líquido na conta" valor={brl(liquido)} strong />
            </dl>

            <Button fullWidth className="mt-5" disabled={!valido} iconLeft="ph:lightning-bold"
              onClick={() => onConfirm({ valor: valorNum, dataISO: addDaysISO(PRO_TODAY, opcao.dias), taxa: opcao.taxa, desconto, liquido })}>
              Confirmar antecipação
            </Button>
          </div>
        )}
      </div>
    </Sheet>
  )
}

function ResumoLinha({ label, valor, tone, strong }: { label: string; valor: string; tone?: 'danger'; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5">
      <dt className={`text-[13px] ${strong ? 'font-semibold text-ink' : 'text-ink-secondary'}`}>{label}</dt>
      <dd className={`text-sm tabular-nums ${strong ? 'font-bold text-ink' : tone === 'danger' ? 'font-medium text-danger-ink' : 'font-medium text-ink'}`}>{valor}</dd>
    </div>
  )
}

/* Instruções de emissão: o que deve constar na nota. */
function InstrucoesNota({ valor, vencimento, descricao }: { valor: number; vencimento: string; descricao: string }) {
  const copiar = (texto: string) => { navigator.clipboard?.writeText(texto) }
  return (
    <div className="rounded-lg border border-border bg-surface-2/40 p-4">
      <p className="flex items-center gap-1.5 font-heading text-[13px] font-semibold text-ink">
        <Icon icon="ph:info-bold" width={15} className="text-primary dark:text-primary-300" aria-hidden /> O que deve constar na nota
      </p>
      <dl className="mt-3 flex flex-col gap-3">
        <div>
          <dt className="text-[11.5px] font-medium uppercase tracking-wide text-ink-muted">Valor</dt>
          <dd className="text-sm font-semibold text-ink">{brl(valor)}</dd>
        </div>
        <div>
          <dt className="text-[11.5px] font-medium uppercase tracking-wide text-ink-muted">Data de vencimento</dt>
          <dd className="text-sm font-semibold text-ink">{fmtData(vencimento)}</dd>
        </div>
        <div>
          <dt className="text-[11.5px] font-medium uppercase tracking-wide text-ink-muted">Tomador (YNA)</dt>
          <dd className="mt-0.5 text-[13px] leading-relaxed text-ink">
            {ynaDadosNota.razaoSocial}<br />
            <span className="inline-flex items-center gap-1.5">
              CNPJ {ynaDadosNota.cnpj}
              <button onClick={() => copiar(ynaDadosNota.cnpj)} className="text-primary hover:underline dark:text-primary-300" aria-label="Copiar CNPJ"><Icon icon="ph:copy-bold" width={13} aria-hidden /></button>
            </span><br />
            <span className="text-ink-secondary">{ynaDadosNota.endereco}</span>
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-[11.5px] font-medium uppercase tracking-wide text-ink-muted">
            Descrição dos serviços
            <button onClick={() => copiar(descricao)} className="text-primary hover:underline dark:text-primary-300" aria-label="Copiar descrição"><Icon icon="ph:copy-bold" width={13} aria-hidden /></button>
          </dt>
          <dd className="text-[13px] leading-relaxed text-ink">{descricao}</dd>
        </div>
      </dl>
    </div>
  )
}

/* Formulário de anexo: número da nota + arquivo. */
function AnexoNotaForm({ onSubmit, submitLabel = 'Enviar nota' }: { onSubmit: (dados: Emissao) => void; submitLabel?: string }) {
  const [numero, setNumero] = useState('')
  const [arquivo, setArquivo] = useState<string | null>(null)
  const valido = numero.trim().length > 0 && arquivo !== null
  return (
    <div className="mt-4">
      <label htmlFor="nf-numero" className="text-[13px] font-semibold text-ink">Número da nota</label>
      <input id="nf-numero" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="ex.: 2026/051"
        className="mt-1.5 w-full rounded-lg border-[1.5px] border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-primary" />
      <p className="mt-4 text-[13px] font-semibold text-ink">Arquivo da nota fiscal</p>
      {arquivo ? (
        <div className="mt-1.5 flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2.5">
          <span className="flex min-w-0 items-center gap-2 text-[13px] text-ink">
            <Icon icon="ph:file-pdf-bold" width={18} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
            <span className="truncate">{arquivo}</span>
          </span>
          <button onClick={() => setArquivo(null)} className="shrink-0 text-ink-muted hover:text-ink" aria-label="Remover arquivo"><Icon icon="ph:x-bold" width={15} aria-hidden /></button>
        </div>
      ) : (
        <button onClick={() => setArquivo('nota-fiscal.pdf')}
          className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed border-border bg-surface px-4 py-3 text-[13px] font-medium text-ink-secondary transition-colors hover:border-primary hover:text-ink">
          <Icon icon="ph:upload-simple-bold" width={16} aria-hidden /> Anexar nota fiscal (PDF)
        </button>
      )}
      <Button fullWidth className="mt-5" disabled={!valido} iconLeft="ph:paper-plane-tilt-bold" onClick={() => valido && onSubmit({ numero: numero.trim(), arquivoNome: arquivo! })}>
        {submitLabel}
      </Button>
    </div>
  )
}

/* Sheet de emissão: instruções + anexo, com aviso de retificação quando aplicável. */
function EmitirNotaSheet({ nota, onClose, onSubmit }: { nota: NotaFiscal | null; onClose: () => void; onSubmit: (dados: Emissao) => void }) {
  return (
    <Sheet open={nota !== null} title="Emitir nota fiscal" icon="ph:receipt-bold" onClose={onClose} size="md">
      {nota && (
        <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
          {nota.status === 'requer-ajuste' && nota.motivoRetificacao && (
            <div className="flex gap-2 rounded-lg border border-danger/30 bg-danger-bg px-3 py-2.5 text-[13px] text-danger-ink">
              <Icon icon="ph:warning-bold" width={16} className="mt-px shrink-0" aria-hidden />
              <span><span className="font-semibold">Observação da YNA:</span> {nota.motivoRetificacao}</span>
            </div>
          )}
          <InstrucoesNota valor={nota.valorTotal} vencimento={nota.vencimento} descricao={nota.descricaoServico} />
          <AnexoNotaForm onSubmit={onSubmit} submitLabel={nota.status === 'requer-ajuste' ? 'Reenviar nota' : 'Enviar nota'} />
        </div>
      )}
    </Sheet>
  )
}
