import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { ProTopBar } from '../../components/ProTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { StatTile } from '../../components/StatTile'
import { Modal } from '../../components/Modal'
import { Sheet } from '../../components/Sheet'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { proFinanceService } from '../../services/pro'
import { PRO_TODAY } from '../../data/proMock'
import { addDaysISO } from './sessionDisplay'
import type { ExtratoItem, NotaFiscal } from '../../types'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtDia = (iso: string) => { const [, m, d] = iso.split('-'); return `${d}/${m}` }
const fmtData = (iso: string) => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}` }

const PERIODOS = [
  { key: '7', label: '7 dias', dias: 7 },
  { key: '15', label: '15 dias', dias: 15 },
  { key: '30', label: '30 dias', dias: 30 },
  { key: '60', label: '60 dias', dias: 60 },
  { key: 'custom', label: 'Personalizado', dias: 0 },
] as const
type PeriodoKey = (typeof PERIODOS)[number]['key']

interface Solicitacao { valor: number; dataISO: string; taxa: number; desconto: number; liquido: number }

/* Opções de antecipação: quanto menor o prazo, maior a taxa. Datas relativas ao "hoje" (PRO_TODAY). */
const OPCOES_ANTECIPACAO = [
  { dias: 1, taxa: 3.5 },
  { dias: 7, taxa: 2.4 },
  { dias: 15, taxa: 1.5 },
  { dias: 30, taxa: 0.8 },
]

export function Pro24Financeiro() {
  const summary = useService(() => proFinanceService.summary(), [])
  const [antecipar, setAntecipar] = useState(false)
  const [solicitacao, setSolicitacao] = useState<Solicitacao | null>(null)
  const [view, setView] = useState<'extrato' | 'nf'>('extrato')

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <ProTopBar />
        <PageHeader title="Financeiro" subtitle="Seus recebimentos, com clareza." className="mt-2 lg:mt-0" />

        {summary.status === 'loading' && <Skeleton className="h-24 w-full rounded-lg" />}
        {summary.status === 'error' && <ErrorState message={summary.message} onRetry={summary.reload} />}
        {summary.status === 'success' && (
          <>
            {/* Big numbers */}
            <div className="grid grid-cols-2 gap-2.5">
              <StatTile icon="ph:wallet-bold" value={brl(summary.data.aReceber)} label="Saldo a receber" />
              <StatTile icon="ph:hand-coins-bold" value={brl(summary.data.totalResgatado)} label="Total resgatado" />
            </div>

            {/* Antecipação */}
            <div className="mt-4 flex flex-col gap-4 rounded-lg border border-primary/30 bg-primary-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                  <Icon icon="ph:lightning-bold" width={22} className="text-primary dark:text-primary-300" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="font-heading text-[12.5px] font-semibold text-ink-secondary">Antecipação disponível</p>
                  <p className="text-2xl font-bold leading-tight text-ink">{brl(summary.data.antecipacaoDisponivel)}</p>
                  <p className="mt-0.5 text-[12.5px] text-ink-secondary">
                    Cadência <span className="font-semibold">{summary.data.cadencia}</span> · taxa {summary.data.taxaAntecipacao.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}%
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="w-full shrink-0 sm:w-auto"
                iconLeft={solicitacao ? 'ph:check-bold' : 'ph:lightning-bold'}
                onClick={() => setAntecipar(true)}
              >
                {solicitacao ? 'Antecipação solicitada' : 'Antecipar recebíveis'}
              </Button>
            </div>
          </>
        )}

        {/* Histórico */}
        <h2 className="mb-3 mt-8 text-[15px] font-semibold text-ink">Histórico</h2>
        <div className="mb-4 flex gap-1 rounded-lg bg-surface-2 p-1">
          {([['extrato', 'Extrato'], ['nf', 'Notas Fiscais']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              aria-selected={view === key}
              className={`flex-1 rounded-lg px-3 py-2.5 font-heading text-sm font-semibold transition-all ${
                view === key ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {view === 'extrato' ? <ExtratoView /> : <NotasFiscaisView />}
      </div>

      {/* Modal de antecipação (valor + data/taxa + resumo → feedback) */}
      <AnteciparModal
        open={antecipar}
        onClose={() => setAntecipar(false)}
        disponivel={summary.status === 'success' ? summary.data.antecipacaoDisponivel : 0}
        solicitacao={solicitacao}
        onConfirm={(s) => setSolicitacao(s)}
        onCancelar={() => { setSolicitacao(null); setAntecipar(false) }}
      />
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

  // Ao abrir o formulário (sem solicitação ativa), pré-preenche com o total.
  useEffect(() => {
    if (open && !solicitacao) { setValor(disponivel); setOpcaoIdx(0) }
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
        /* Feedback */
        <div className="text-ink">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-bg">
              <Icon icon="ph:check-circle-bold" width={30} className="text-success" aria-hidden />
            </div>
            <p className="mt-3 font-heading text-lg font-semibold text-ink">Antecipação solicitada</p>
            <p className="mt-1 text-sm text-ink-secondary">
              <span className="font-semibold text-ink">{brl(solicitacao.liquido)}</span> cairão na sua conta em <span className="font-semibold text-ink">{fmtData(solicitacao.dataISO)}</span>.
            </p>
          </div>
          <dl className="mt-5 flex flex-col divide-y divide-border rounded-lg border border-border">
            <ResumoLinha label="Valor solicitado" valor={brl(solicitacao.valor)} />
            <ResumoLinha label={`Taxa de antecipação (${solicitacao.taxa.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}%)`} valor={`− ${brl(solicitacao.desconto)}`} tone="danger" />
            <ResumoLinha label="Valor líquido" valor={brl(solicitacao.liquido)} strong />
          </dl>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
            <Button fullWidth onClick={onClose}>Fechar</Button>
            <Button variant="ghost" fullWidth iconLeft="ph:x-bold" onClick={onCancelar}>Cancelar solicitação</Button>
          </div>
        </div>
      ) : (
        /* Formulário */
        <div className="text-ink">
          {/* Valor */}
          <label htmlFor="ant-valor" className="text-[13px] font-semibold text-ink">Quanto você quer antecipar?</label>
          <div className="relative mt-2">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-ink-secondary">R$</span>
            <input
              id="ant-valor"
              type="number"
              min={0}
              max={disponivel}
              step={10}
              value={Number.isFinite(valor) ? valor : ''}
              onChange={(e) => setValor(e.target.valueAsNumber)}
              className="w-full rounded-lg border-[1.5px] border-border bg-surface py-2.5 pl-10 pr-4 text-base font-semibold text-ink outline-none focus:border-primary"
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[12.5px]">
            <span className="text-ink-muted">Disponível: {brl(disponivel)}</span>
            <button onClick={() => setValor(disponivel)} className="font-heading font-semibold text-primary dark:text-primary-300 hover:underline">Usar tudo</button>
          </div>
          {!valido && valorNum > disponivel && <p className="mt-1 text-[12.5px] text-danger-ink">Acima do disponível para antecipação.</p>}

          {/* Datas + taxa */}
          <p className="mt-5 text-[13px] font-semibold text-ink">Quando quer receber?</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {OPCOES_ANTECIPACAO.map((o, i) => {
              const ativo = i === opcaoIdx
              return (
                <button
                  key={o.dias}
                  onClick={() => setOpcaoIdx(i)}
                  aria-pressed={ativo}
                  className={`flex flex-col rounded-lg border-[1.5px] px-3 py-2.5 text-left transition-colors ${
                    ativo ? 'border-primary bg-primary-50' : 'border-border bg-surface hover:border-border-strong'
                  }`}
                >
                  <span className="text-sm font-semibold text-ink">{o.dias === 1 ? 'Amanhã' : `Em ${o.dias} dias`}</span>
                  <span className="font-mono text-[11.5px] text-ink-muted">{fmtData(addDaysISO(PRO_TODAY, o.dias))}</span>
                  <span className={`mt-1 text-[11.5px] font-medium ${ativo ? 'text-primary dark:text-primary-300' : 'text-ink-secondary'}`}>taxa {o.taxa.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}%</span>
                </button>
              )
            })}
          </div>

          {/* Resumo */}
          <dl className="mt-5 flex flex-col divide-y divide-border rounded-lg border border-border bg-surface-2/40">
            <ResumoLinha label="Valor a resgatar" valor={brl(valorNum)} />
            <ResumoLinha label={`Taxa de antecipação (${opcao.taxa.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}%)`} valor={`− ${brl(desconto)}`} tone="danger" />
            <ResumoLinha label="Valor líquido na conta" valor={brl(liquido)} strong />
          </dl>

          <Button fullWidth className="mt-5" disabled={!valido} iconLeft="ph:lightning-bold"
            onClick={() => onConfirm({ valor: valorNum, dataISO: addDaysISO(PRO_TODAY, opcao.dias), taxa: opcao.taxa, desconto, liquido })}
          >
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

/* ── Extrato ── */
function ExtratoView() {
  const extrato = useService(() => proFinanceService.extrato(), [])
  const [periodo, setPeriodo] = useState<PeriodoKey>('30')
  const [inicio, setInicio] = useState(addDaysISO(PRO_TODAY, -30))
  const [fim, setFim] = useState(PRO_TODAY)

  const [de, ate] = useMemo(() => {
    if (periodo === 'custom') return [inicio, fim]
    const dias = PERIODOS.find((p) => p.key === periodo)?.dias ?? 30
    return [addDaysISO(PRO_TODAY, -dias), PRO_TODAY]
  }, [periodo, inicio, fim])

  const itens = extrato.status === 'success'
    ? extrato.data.filter((it) => it.data >= de && it.data <= ate)
    : []
  // itens vem do mais recente para o mais antigo: saldo do período = saldo do 1º.
  const saldoPeriodo = itens[0]?.saldo ?? 0
  const entradas = itens.filter((i) => i.tipo === 'sessao').reduce((s, i) => s + i.valor, 0)
  const saidas = itens.filter((i) => i.tipo === 'resgate').reduce((s, i) => s + i.valor, 0)

  return (
    <div>
      {/* Filtro de período */}
      <div className="mb-3 flex flex-wrap gap-2">
        {PERIODOS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriodo(p.key)}
            aria-pressed={periodo === p.key}
            className={`rounded-pill border-[1.5px] px-3 py-1.5 font-heading text-[12.5px] font-medium transition-colors ${
              periodo === p.key ? 'border-primary bg-primary-50 text-primary dark:text-primary-300' : 'border-border bg-surface text-ink-secondary hover:border-border-strong hover:text-ink'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {periodo === 'custom' && (
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-border bg-surface p-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-[12.5px] font-medium text-ink-secondary">
            Início
            <input type="date" value={inicio} max={fim} onChange={(e) => setInicio(e.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none" />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-[12.5px] font-medium text-ink-secondary">
            Fim
            <input type="date" value={fim} min={inicio} onChange={(e) => setFim(e.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none" />
          </label>
        </div>
      )}

      {/* Saldo do período */}
      <div className="mb-4 rounded-lg border border-border bg-surface p-4">
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-ink-muted">Saldo no fim do período</p>
        <p className="mt-1 text-2xl font-bold text-ink">{brl(saldoPeriodo)}</p>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px]">
          <span className="text-ink-secondary">Entradas <span className="font-semibold text-success">+ {brl(entradas)}</span></span>
          <span className="text-ink-secondary">Saídas <span className="font-semibold text-danger-ink">− {brl(saidas)}</span></span>
        </div>
      </div>

      {extrato.status === 'loading' && <div className="flex flex-col gap-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div>}
      {extrato.status === 'error' && <ErrorState message={extrato.message} onRetry={extrato.reload} />}
      {extrato.status === 'success' && (
        itens.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            {/* Cabeçalho da tabela (desktop) */}
            <div className="hidden grid-cols-[88px_1fr_120px_120px] gap-3 border-b border-border px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-ink-muted sm:grid">
              <span>Data</span>
              <span>Movimentação</span>
              <span className="text-right">Valor</span>
              <span className="text-right">Saldo</span>
            </div>
            <ul className="divide-y divide-border">
              {itens.map((it) => <ExtratoRow key={it.id} item={it} />)}
            </ul>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-sm text-ink-secondary">
            Nenhum lançamento no período selecionado.
          </div>
        )
      )}
    </div>
  )
}

function ExtratoRow({ item }: { item: ExtratoItem }) {
  const isResgate = item.tipo === 'resgate'
  return (
    <li className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[88px_1fr_120px_120px]">
      {/* Data (coluna no desktop) */}
      <span className="hidden font-mono text-[12.5px] text-ink-secondary sm:block">{fmtDia(item.data)}</span>
      {/* Movimentação */}
      <div className="flex min-w-0 items-center gap-2.5">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isResgate ? 'bg-surface-2' : 'bg-primary-50'}`}>
          <Icon icon={isResgate ? 'ph:bank-bold' : 'ph:video-camera-bold'} width={16} className={isResgate ? 'text-ink-secondary' : 'text-primary dark:text-primary-300'} aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">{isResgate ? 'Resgate' : 'Sessão'}</p>
          <p className="font-mono text-[11.5px] text-ink-muted sm:hidden">{fmtDia(item.data)}</p>
        </div>
      </div>
      {/* Valor (crédito/débito) */}
      <span className={`text-right text-sm font-semibold tabular-nums ${isResgate ? 'text-danger-ink' : 'text-success'}`}>
        {isResgate ? '− ' : '+ '}{brl(item.valor)}
      </span>
      {/* Saldo atualizado */}
      <span className="text-right font-mono text-[12.5px] tabular-nums text-ink-secondary">{brl(item.saldo)}</span>
    </li>
  )
}

/* ── Notas Fiscais ── */
function NotasFiscaisView() {
  const notas = useService(() => proFinanceService.notasFiscais(), [])
  const [detalhe, setDetalhe] = useState<NotaFiscal | null>(null)

  return (
    <div>
      {notas.status === 'loading' && <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}</div>}
      {notas.status === 'error' && <ErrorState message={notas.message} onRetry={notas.reload} />}
      {notas.status === 'success' && (
        <div className="flex flex-col gap-2">
          {notas.data.map((nf) => (
            <div key={nf.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-heading text-sm font-semibold text-ink">
                    <Icon icon="ph:file-text-bold" width={16} className="text-primary dark:text-primary-300" aria-hidden />
                    Nota {nf.numero}
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-ink-secondary">{fmtData(nf.data)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-heading text-sm font-semibold text-ink">{brl(nf.valorTotal)}</p>
                  <Badge tone="neutral" className="mt-1">{nf.sessoes.length} sessões</Badge>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" iconLeft="ph:list-bullets-bold" onClick={() => setDetalhe(nf)}>Ver sessões</Button>
                <Button size="sm" variant="secondary" iconLeft="ph:download-simple-bold" onClick={() => { /* download simulado */ }}>Baixar</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={detalhe !== null} title={detalhe ? `Nota ${detalhe.numero}` : ''} onClose={() => setDetalhe(null)}>
        {detalhe && (
          <>
            <p className="mb-3 text-sm text-ink-secondary">{fmtData(detalhe.data)} · {brl(detalhe.valorTotal)} · {detalhe.sessoes.length} sessões</p>
            <ul className="flex flex-col divide-y divide-border">
              {detalhe.sessoes.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm text-ink">
                    <Icon icon="ph:calendar-blank-bold" width={15} className="text-ink-muted" aria-hidden />
                    {fmtData(s.data)} · {s.beneficiario}
                  </span>
                  <span className="font-mono text-[13px] text-ink-secondary">{brl(s.valor)}</span>
                </li>
              ))}
            </ul>
            <Button fullWidth className="mt-5" iconLeft="ph:download-simple-bold" onClick={() => setDetalhe(null)}>Baixar nota</Button>
          </>
        )}
      </Modal>
    </div>
  )
}
