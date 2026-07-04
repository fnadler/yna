import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'
import { mngNotaService } from '../../services/mng'
import type { MngNota } from '../../types'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const brl2 = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtDia = (iso: string) => { const [, m, d] = iso.split('-'); return `${d}/${m}` }

/* Conferência da nota fiscal do profissional. Em "em-analise": confere os dados
   + sessões e decide entre aprovar (→ para-pagamento) ou gerar pendência de
   retificação (→ requer-ajuste). Em "para-pagamento": registra o pagamento
   (comprovante + data → paga). Compartilhado entre o painel financeiro e o
   detalhe do profissional para manter o processo idêntico. */
export function ConferirNota({ nota, onFeito }: { nota: MngNota; onFeito: () => void }) {
  const isPagamento = nota.status === 'para-pagamento'
  const [modo, setModo] = useState<'menu' | 'retificar'>('menu')
  const [motivo, setMotivo] = useState('')
  const [dataPg, setDataPg] = useState('')
  const [comprovante, setComprovante] = useState(false)
  const inputCls = 'w-full rounded border-[1.5px] border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary'

  const sessoes = nota.sessoes ?? []
  const retificar = async () => { await mngNotaService.retificar(nota.id, motivo); onFeito() }
  const aprovar = async () => { await mngNotaService.aprovar(nota.id); onFeito() }
  const pagar = async () => { await mngNotaService.registrarPagamento(nota.id, dataPg); onFeito() }

  return (
    <div className="px-5 py-6 lg:px-6">
      {/* Destaque de antecipação */}
      {nota.origem === 'antecipacao' && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning-bg px-3 py-2.5 text-[13px] text-warning-ink">
          <Icon icon="ph:lightning-bold" width={16} className="shrink-0" aria-hidden />
          <span><span className="font-semibold">Solicitação de antecipação de recebíveis.</span>{nota.valorTaxa != null ? ` Taxa de ${brl2(nota.valorTaxa)}${nota.taxaPct != null ? ` (${nota.taxaPct.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}%)` : ''}.` : ''}</span>
        </div>
      )}

      {/* Dados da nota */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-border bg-surface-2/40 p-4 text-[13px]">
        <div><dt className="text-[11px] uppercase tracking-wide text-ink-muted">Profissional</dt><dd className="text-ink">{nota.profissional}</dd></div>
        <div><dt className="text-[11px] uppercase tracking-wide text-ink-muted">Nota</dt><dd className="text-ink">{nota.numero ?? '—'}</dd></div>
        <div><dt className="text-[11px] uppercase tracking-wide text-ink-muted">Referência</dt><dd className="text-ink">{nota.origem === 'antecipacao' ? 'Antecipação' : 'Fechamento'} · {nota.referencia}</dd></div>
        <div><dt className="text-[11px] uppercase tracking-wide text-ink-muted">Valor</dt><dd className="font-semibold text-ink">{brl(nota.valor)}</dd></div>
        {nota.origem === 'antecipacao' && nota.valorTaxa != null && (
          <div><dt className="text-[11px] uppercase tracking-wide text-ink-muted">Taxa de antecipação</dt><dd className="font-medium text-warning-ink">{brl2(nota.valorTaxa)}{nota.taxaPct != null ? ` · ${nota.taxaPct.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}%` : ''}</dd></div>
        )}
      </dl>

      {/* Sessões realizadas */}
      <div className="mt-4">
        <p className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-ink">
          <Icon icon="ph:list-checks-bold" width={16} className="text-primary dark:text-primary-300" aria-hidden />
          Sessões realizadas ({sessoes.length})
        </p>
        {sessoes.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <ul className="divide-y divide-border">
              {sessoes.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 px-3 py-2 text-[12.5px]">
                  <span className="min-w-0 truncate text-ink"><span className="font-mono text-ink-secondary">{fmtDia(s.data)} · {s.hora}</span> · {s.beneficiario}</span>
                  <span className="shrink-0 font-medium text-ink">{brl(s.valor)}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-2/40 px-3 py-2 text-[12.5px] font-semibold text-ink">
              <span>Total</span><span>{brl(sessoes.reduce((t, s) => t + s.valor, 0))}</span>
            </div>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-[12.5px] text-ink-muted">Sem sessões vinculadas.</p>
        )}
      </div>

      {/* ── Conferência (em-analise) ── */}
      {!isPagamento && modo === 'menu' && (
        <div className="mt-5 flex flex-col gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-[13px] text-ink transition-colors hover:bg-surface-hover"><Icon icon="ph:file-pdf-bold" width={16} className="text-primary dark:text-primary-300" aria-hidden /> Baixar arquivo da nota</button>
          <Button fullWidth iconLeft="ph:check-circle-bold" onClick={aprovar}>Aprovar nota</Button>
          <Button fullWidth variant="secondary" iconLeft="ph:warning-bold" onClick={() => setModo('retificar')}>Gerar pendência (retificação)</Button>
        </div>
      )}

      {!isPagamento && modo === 'retificar' && (
        <div className="mt-5">
          <label htmlFor="mtv" className="text-[13px] font-semibold text-ink">Motivo da retificação</label>
          <textarea id="mtv" value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={3} placeholder="Ex.: CNPJ do tomador divergente…" className={`mt-1.5 ${inputCls}`} />
          <p className="mt-2 text-[12px] text-ink-muted">O profissional recebe uma notificação para reemitir a nota. Ela fica em “Requer ajuste” até o reenvio.</p>
          <div className="mt-4 flex gap-2">
            <Button fullWidth disabled={motivo.trim().length === 0} iconLeft="ph:paper-plane-tilt-bold" onClick={retificar}>Enviar pendência</Button>
            <Button variant="ghost" onClick={() => setModo('menu')}>Voltar</Button>
          </div>
        </div>
      )}

      {/* ── Pagamento (para-pagamento) ── */}
      {isPagamento && (
        <div className="mt-5">
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-surface-2/40 px-3 py-2.5 text-[12.5px] text-ink-secondary">
            <Icon icon="ph:info-bold" width={15} className="shrink-0 text-ink-muted" aria-hidden /> Nota aprovada na conferência. Registre o pagamento para concluir.
          </div>
          <label htmlFor="dpg" className="text-[13px] font-semibold text-ink">Data do pagamento</label>
          <input id="dpg" type="date" value={dataPg} onChange={(e) => setDataPg(e.target.value)} className={`mt-1.5 ${inputCls}`} />
          <p className="mt-4 text-[13px] font-semibold text-ink">Comprovante de pagamento</p>
          {comprovante ? (
            <div className="mt-1.5 flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-[13px]"><span className="flex items-center gap-2"><Icon icon="ph:file-pdf-bold" width={16} className="text-primary dark:text-primary-300" aria-hidden /> comprovante.pdf</span><button onClick={() => setComprovante(false)} className="text-ink-muted hover:text-ink"><Icon icon="ph:x-bold" width={14} aria-hidden /></button></div>
          ) : (
            <button onClick={() => setComprovante(true)} className="mt-1.5 flex w-full items-center justify-center gap-2 rounded border-[1.5px] border-dashed border-border bg-surface px-4 py-3 text-[13px] font-medium text-ink-secondary transition-colors hover:border-primary hover:text-ink"><Icon icon="ph:upload-simple-bold" width={16} aria-hidden /> Anexar comprovante (PDF)</button>
          )}
          <div className="mt-4">
            <Button fullWidth disabled={!dataPg || !comprovante} iconLeft="ph:check-bold" onClick={pagar}>Confirmar pagamento</Button>
          </div>
        </div>
      )}
    </div>
  )
}
