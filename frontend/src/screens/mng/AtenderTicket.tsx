import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { mngTicketService } from '../../services/mng'
import { TICKET_TIPO_LABEL } from '../../data/mngMock'
import type { MngTicket } from '../../types'

const fmtDataHora = (iso: string) => { const [d, t] = iso.split('T'); const [y, m, dd] = d.split('-'); return `${dd}/${m}/${y}${t ? ` às ${t}` : ''}` }

/* Detalhe do ticket + resposta do backoffice (texto + anexos + concluir). */
export function AtenderTicket({ ticket, atrasada, onFeito }: { ticket: MngTicket; atrasada: boolean; onFeito: () => void }) {
  const [respondendo, setRespondendo] = useState(false)
  const [texto, setTexto] = useState('')
  const [anexos, setAnexos] = useState<string[]>([])
  const [concluir, setConcluir] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const inputCls = 'w-full rounded border-[1.5px] border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary'

  const enviar = async () => {
    setSalvando(true)
    await mngTicketService.responder(ticket.id, texto.trim(), concluir, anexos)
    setSalvando(false)
    onFeito()
  }

  return (
    <div className="px-5 py-6 lg:px-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[12px] font-medium text-ink-secondary">Protocolo {ticket.protocolo}</span>
        {ticket.status !== 'resolvido' && (
          atrasada
            ? <Badge tone="danger" icon="ph:warning-bold">Atrasada</Badge>
            : <Badge tone="success" icon="ph:check-bold">Dentro do prazo</Badge>
        )}
      </div>
      <h2 className="mt-2 font-heading text-lg font-semibold text-ink">{ticket.assunto}</h2>

      {/* Dados */}
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-border bg-surface-2/40 p-4 text-[13px]">
        <div><dt className="text-[11px] uppercase tracking-wide text-ink-muted">Tipo</dt><dd className="text-ink">{TICKET_TIPO_LABEL[ticket.tipo]}</dd></div>
        <div><dt className="text-[11px] uppercase tracking-wide text-ink-muted">Empresa</dt><dd className="text-ink">{ticket.empresa}</dd></div>
        <div><dt className="text-[11px] uppercase tracking-wide text-ink-muted">Solicitante</dt><dd className="text-ink">{ticket.solicitante}</dd></div>
        <div><dt className="text-[11px] uppercase tracking-wide text-ink-muted">Origem</dt><dd className="text-ink">{ticket.origem}</dd></div>
        <div><dt className="text-[11px] uppercase tracking-wide text-ink-muted">Aberta em</dt><dd className="text-ink">{fmtDataHora(ticket.abertoEm)}</dd></div>
        <div><dt className="text-[11px] uppercase tracking-wide text-ink-muted">Prazo (SLA {ticket.sla})</dt><dd className={atrasada && ticket.status !== 'resolvido' ? 'font-medium text-danger-ink' : 'text-ink'}>{fmtDataHora(ticket.prazoEm)}</dd></div>
      </dl>

      {/* Descrição */}
      <div className="mt-4">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-ink-muted">Descrição</p>
        <p className="rounded-lg border border-border bg-surface p-3 text-[13.5px] leading-relaxed text-ink">{ticket.descricao}</p>
      </div>

      {/* Histórico de respostas */}
      {ticket.respostas && ticket.respostas.length > 0 && (
        <div className="mt-4">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-muted">Respostas</p>
          <div className="flex flex-col gap-2">
            {ticket.respostas.map((r) => (
              <div key={r.id} className="rounded-lg border border-border bg-surface p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12.5px] font-semibold text-ink">{r.autor}</span>
                  <span className="font-mono text-[11px] text-ink-muted">{fmtDataHora(r.em)}</span>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">{r.texto}</p>
                {r.anexos && r.anexos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {r.anexos.map((a) => <span key={a} className="inline-flex items-center gap-1 rounded-pill bg-surface-2 px-2 py-0.5 text-[11px] text-ink-secondary"><Icon icon="ph:paperclip-bold" width={11} aria-hidden /> {a}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ação */}
      {ticket.status === 'resolvido' ? (
        <div className="mt-5 flex items-center gap-2 rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-[13px] text-success"><Icon icon="ph:check-circle-bold" width={16} aria-hidden /> Atendimento concluído.</div>
      ) : !respondendo ? (
        <div className="mt-5">
          <Button fullWidth iconLeft="ph:chat-circle-text-bold" onClick={() => setRespondendo(true)}>Responder</Button>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          <div>
            <label htmlFor="resp" className="text-[13px] font-semibold text-ink">Resposta</label>
            <textarea id="resp" value={texto} onChange={(e) => setTexto(e.target.value)} rows={4} placeholder="Escreva a resposta ao solicitante…" className={`mt-1.5 ${inputCls}`} />
          </div>

          <div>
            <p className="mb-1.5 text-[13px] font-semibold text-ink">Anexos</p>
            {anexos.length > 0 && (
              <div className="mb-2 flex flex-col gap-1.5">
                {anexos.map((a, i) => (
                  <div key={a} className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-[13px]">
                    <span className="flex items-center gap-2 truncate"><Icon icon="ph:paperclip-bold" width={15} className="text-primary dark:text-primary-300" aria-hidden /> {a}</span>
                    <button onClick={() => setAnexos((arr) => arr.filter((_, j) => j !== i))} className="text-ink-muted hover:text-ink"><Icon icon="ph:x-bold" width={14} aria-hidden /></button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setAnexos((arr) => [...arr, `anexo-${arr.length + 1}.pdf`])} className="flex w-full items-center justify-center gap-2 rounded border-[1.5px] border-dashed border-border bg-surface px-4 py-3 text-[13px] font-medium text-ink-secondary transition-colors hover:border-primary hover:text-ink"><Icon icon="ph:upload-simple-bold" width={16} aria-hidden /> Adicionar arquivo</button>
          </div>

          <button onClick={() => setConcluir((v) => !v)} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3 text-left transition-colors hover:bg-surface-hover">
            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-[1.5px] transition-colors ${concluir ? 'border-primary bg-primary text-white' : 'border-border-strong bg-surface'}`}>
              {concluir && <Icon icon="ph:check-bold" width={12} aria-hidden />}
            </span>
            <span className="text-[13px] leading-relaxed text-ink-secondary">Concluir o atendimento — marca o ticket como <span className="font-semibold text-ink">Resolvido</span>. Sem isso, fica <span className="font-semibold text-ink">Em andamento</span>.</span>
          </button>

          <div className="flex gap-2">
            <Button fullWidth disabled={texto.trim().length === 0 || salvando} iconLeft="ph:paper-plane-tilt-bold" onClick={enviar}>{salvando ? 'Enviando…' : concluir ? 'Responder e concluir' : 'Enviar resposta'}</Button>
            <Button variant="ghost" onClick={() => setRespondendo(false)}>Voltar</Button>
          </div>
        </div>
      )}
    </div>
  )
}
