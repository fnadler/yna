import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { Sheet } from '../../components/Sheet'
import { Modal } from '../../components/Modal'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Textarea } from '../../components/Textarea'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { ACAO_STATUS, NIVEL_RISCO, fmtData } from '../../lib/nr1'
import { useService } from '../../hooks/useService'
import { nr1AcaoService, nr1ResultadoService } from '../../services/nr1'
import type { Nr1Acao, Nr1RiscoInventario, Nr1AcaoStatus } from '../../types'

/* NR1-RH-04 — Plano de ação 5W2H (RF-E01/E02).

   Cada ação nasce vinculada a um risco do inventário — é esse vínculo que
   fecha a cadeia risco → ação exigida pela norma.

   Regra que a UI e o serviço aplicam juntos: uma ação só pode ser concluída
   com evidência anexada. "Evidência de execução registrada" é exatamente o
   que a fiscalização verifica; sem ela o plano é só intenção. */

const STATUS_FILTROS: { value: string; label: string }[] = [
  { value: 'todas', label: 'Todas as ações' },
  { value: 'atrasada', label: 'Atrasadas' },
  { value: 'em-andamento', label: 'Em andamento' },
  { value: 'planejada', label: 'Planejadas' },
  { value: 'concluida', label: 'Concluídas' },
]

export function NR1RhPlanoAcao() {
  const [params] = useSearchParams()
  const riscoFiltro = params.get('risco')

  const acoes = useService(() => nr1AcaoService.list(), [])
  const inventario = useService(() => nr1ResultadoService.inventario(), [])
  const [status, setStatus] = useState('todas')
  const [form, setForm] = useState<{ acao?: Nr1Acao; riscoId: string } | null>(null)
  const [detalhe, setDetalhe] = useState<Nr1Acao | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const riscos: Nr1RiscoInventario[] = inventario.status === 'success' ? inventario.data : []
  const risco = (id: string) => riscos.find((r) => r.id === id)

  const filtradas = (acoes.status === 'success' ? acoes.data : [])
    .filter((a) => (riscoFiltro ? a.riscoId === riscoFiltro : true))
    .filter((a) => (status === 'todas' ? true : a.status === status))

  const concluir = async (a: Nr1Acao) => {
    const r = await nr1AcaoService.concluir(a.id)
    if (!r.ok) setErro(r.message ?? 'Não foi possível concluir a ação.')
    setDetalhe(null)
    acoes.reload()
  }

  const anexar = async (a: Nr1Acao) => {
    const nome = `evidencia-${a.id}-${a.evidencias.length + 1}.pdf`
    await nr1AcaoService.anexarEvidencia(a.id, nome)
    acoes.reload()
    setDetalhe({ ...a, evidencias: [...a.evidencias, { id: nome, nome, em: '' }] })
  }

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />

        <Link to={riscoFiltro ? '/rh/nr1/inventario' : '/rh/nr1'} className="mt-2 mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary transition-colors hover:text-ink lg:mt-0">
          <Icon icon="ph:arrow-left-bold" width={14} aria-hidden />
          {riscoFiltro ? 'Inventário' : 'Conformidade NR-1'}
        </Link>

        <PageHeader
          title="Plano de ação"
          subtitle="O que será feito, por quem, até quando — e a prova de que foi feito."
          action={
            riscos.length > 0 ? (
              <Button variant="secondary" iconLeft="ph:plus-bold" onClick={() => setForm({ riscoId: riscoFiltro ?? riscos[0]!.id })}>
                <span className="hidden sm:inline">Nova ação</span>
              </Button>
            ) : undefined
          }
        />

        {riscoFiltro && risco(riscoFiltro) && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
            <Icon icon="ph:funnel-bold" width={18} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
            <div className="min-w-0">
              <p className="text-[12px] text-ink-secondary">Filtrado pelo risco</p>
              <p className="mt-0.5 text-[13.5px] leading-snug text-ink">{risco(riscoFiltro)!.fator}</p>
            </div>
            <Link to="/rh/nr1/plano-acao" className="ml-auto shrink-0 text-[12px] font-medium text-primary hover:underline dark:text-primary-300">Limpar</Link>
          </div>
        )}

        <div className="mb-5 sm:max-w-[240px]">
          <Select value={status} onChange={setStatus} ariaLabel="Filtrar por status" options={STATUS_FILTROS} />
        </div>

        {(acoes.status === 'idle' || acoes.status === 'loading') && (
          <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}</div>
        )}
        {acoes.status === 'error' && <ErrorState message={acoes.message} onRetry={acoes.reload} />}

        {acoes.status === 'success' && (
          <>
            {filtradas.length === 0 ? (
              <div className="rounded-lg border border-border bg-surface px-5 py-14 text-center">
                <p className="text-[15px] font-semibold text-ink">Nenhuma ação por aqui</p>
                <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-ink-secondary">
                  Um risco priorizado sem ação registrada é a lacuna mais comum em fiscalização.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtradas.map((a) => {
                  const r = risco(a.riscoId)
                  const st = ACAO_STATUS[a.status]
                  return (
                    <article key={a.id} className="rounded-lg border border-border bg-surface p-4 lg:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          {r && (
                            <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                              <span className={`h-2 w-2 rounded-[3px] ${NIVEL_RISCO[r.nivel].dot}`} aria-hidden />
                              {r.dimensao} · {r.grupoExposto}
                            </span>
                          )}
                          <p className="mt-1.5 font-heading text-[15px] font-semibold leading-snug text-ink">{a.oQue}</p>
                        </div>
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink-secondary">
                        <span className="inline-flex items-center gap-1.5">
                          <Icon icon="ph:user-bold" width={12} aria-hidden />{a.quem}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Icon icon="ph:calendar-bold" width={12} aria-hidden />prazo {fmtData(a.quando)}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 ${a.evidencias.length === 0 ? 'text-ink-muted' : ''}`}>
                          <Icon icon="ph:paperclip-bold" width={12} aria-hidden />
                          {a.evidencias.length} {a.evidencias.length === 1 ? 'evidência' : 'evidências'}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                        <Button size="sm" variant="ghost" iconLeft="ph:eye-bold" onClick={() => setDetalhe(a)}>Detalhe</Button>
                        <Button size="sm" variant="ghost" iconLeft="ph:pencil-simple-bold" onClick={() => setForm({ acao: a, riscoId: a.riscoId })}>Editar</Button>
                        {a.status !== 'concluida' && (
                          <Button size="sm" variant="ghost" iconLeft="ph:paperclip-bold" onClick={() => anexar(a)}>Anexar evidência</Button>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      <Sheet open={form !== null} onClose={() => setForm(null)} title={form?.acao ? 'Editar ação' : 'Nova ação'} icon="ph:list-checks-bold" size="md">
        {form && (
          <AcaoForm
            inicial={form.acao}
            riscoId={form.riscoId}
            riscos={riscos}
            onClose={() => setForm(null)}
            onSaved={() => { setForm(null); acoes.reload() }}
          />
        )}
      </Sheet>

      <Sheet open={detalhe !== null} onClose={() => setDetalhe(null)} title="Detalhe da ação" icon="ph:list-checks-bold" size="md">
        {detalhe && (
          <AcaoDetalhe
            acao={detalhe}
            risco={risco(detalhe.riscoId)}
            onAnexar={() => anexar(detalhe)}
            onConcluir={() => concluir(detalhe)}
          />
        )}
      </Sheet>

      <Modal open={erro !== null} title="Ação não concluída" onClose={() => setErro(null)}>
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px] leading-relaxed text-ink-secondary">{erro}</p>
          <Button fullWidth onClick={() => setErro(null)}>Entendi</Button>
        </div>
      </Modal>
    </div>
  )
}

function AcaoDetalhe({ acao, risco, onAnexar, onConcluir }: {
  acao: Nr1Acao
  risco?: Nr1RiscoInventario
  onAnexar: () => void
  onConcluir: () => void
}) {
  const semEvidencia = acao.evidencias.length === 0
  const campos: [string, string, string][] = [
    ['ph:target-bold', 'O quê', acao.oQue],
    ['ph:question-bold', 'Por quê', acao.porQue],
    ['ph:user-bold', 'Quem', acao.quem],
    ['ph:calendar-bold', 'Quando', fmtData(acao.quando)],
    ['ph:map-pin-bold', 'Onde', acao.onde],
    ['ph:gear-bold', 'Como', acao.como],
    ['ph:currency-circle-dollar-bold', 'Quanto', acao.quanto],
  ]

  return (
    <div className="flex flex-col gap-5 px-5 py-6 lg:px-6">
      {risco && (
        <div className="rounded-lg bg-surface-2 p-3.5">
          <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">Risco de origem</p>
          <p className="mt-1 text-[13px] leading-snug text-ink">{risco.fator}</p>
          <p className="mt-1 text-[11.5px] text-ink-muted">{risco.grupoExposto} · nível {risco.nivelNum} ({NIVEL_RISCO[risco.nivel].label})</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {campos.map(([icon, label, valor]) => (
          <div key={label} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
              <Icon icon={icon} width={14} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">{label}</p>
              <p className="mt-0.5 text-[13.5px] leading-relaxed text-ink">{valor}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <p className="mb-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          Evidências de execução
        </p>
        {semEvidencia ? (
          <p className="rounded-lg bg-warning-bg px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-secondary">
            Nenhuma evidência anexada. Sem ela a ação não pode ser concluída — é o registro que
            a fiscalização verifica.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {acao.evidencias.map((e) => (
              <li key={e.id} className="flex items-center gap-2 rounded-lg bg-surface-2 px-3.5 py-2.5">
                <Icon icon="ph:file-bold" width={15} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink">{e.nome}</span>
                {e.em && <span className="shrink-0 font-mono text-[11px] text-ink-muted">{fmtData(e.em)}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {acao.status !== 'concluida' && (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" iconLeft="ph:paperclip-bold" onClick={onAnexar}>Anexar evidência</Button>
          <Button iconLeft="ph:check-bold" disabled={semEvidencia} onClick={onConcluir}>Concluir ação</Button>
        </div>
      )}
      {acao.status === 'concluida' && acao.concluidaEm && (
        <p className="flex items-center gap-2 rounded-lg bg-success-bg px-3.5 py-3 text-[12.5px] text-success-ink">
          <Icon icon="ph:check-circle-bold" width={15} aria-hidden />
          Concluída em {fmtData(acao.concluidaEm)}
        </p>
      )}
    </div>
  )
}

/* Formulário 5W2H. Os sete campos da norma, na ordem em que fazem sentido
   preencher — não em ordem alfabética de sigla. */
function AcaoForm({ inicial, riscoId, riscos, onClose, onSaved }: {
  inicial?: Nr1Acao
  riscoId: string
  riscos: Nr1RiscoInventario[]
  onClose: () => void
  onSaved: () => void
}) {
  const [risco, setRisco] = useState(inicial?.riscoId ?? riscoId)
  const [oQue, setOQue] = useState(inicial?.oQue ?? '')
  const [porQue, setPorQue] = useState(inicial?.porQue ?? '')
  const [quem, setQuem] = useState(inicial?.quem ?? '')
  const [quando, setQuando] = useState(inicial?.quando ?? '')
  const [onde, setOnde] = useState(inicial?.onde ?? '')
  const [como, setComo] = useState(inicial?.como ?? '')
  const [quanto, setQuanto] = useState(inicial?.quanto ?? '')
  const [status, setStatus] = useState<Nr1AcaoStatus>(inicial?.status ?? 'planejada')
  const [salvando, setSalvando] = useState(false)

  const valido = oQue.trim().length >= 5 && quem.trim().length >= 3 && quando.length > 0

  const salvar = async () => {
    if (!valido) return
    setSalvando(true)
    await nr1AcaoService.salvar({
      id: inicial?.id ?? '',
      riscoId: risco,
      oQue: oQue.trim(), porQue: porQue.trim(), quem: quem.trim(), quando,
      onde: onde.trim(), como: como.trim(), quanto: quanto.trim(),
      status,
      evidencias: inicial?.evidencias ?? [],
      concluidaEm: inicial?.concluidaEm,
    })
    onSaved()
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
      <div>
        <p className="mb-1.5 text-[13px] font-semibold text-ink">Risco que esta ação responde</p>
        <Select
          value={risco}
          onChange={setRisco}
          ariaLabel="Risco de origem"
          options={riscos.map((r) => ({ value: r.id, label: `${r.grupoExposto} · ${r.fator.slice(0, 60)}${r.fator.length > 60 ? '…' : ''}` }))}
        />
      </div>

      <Input label="O quê — a medida de controle" value={oQue} onChange={(e) => setOQue(e.target.value)} placeholder="Ex.: Instituir janela de pausa obrigatória" />

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-ink">Por quê</span>
        <Textarea rows={2} value={porQue} onChange={(e) => setPorQue(e.target.value)} placeholder="O que esta medida reduz" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Quem — responsável" value={quem} onChange={(e) => setQuem(e.target.value)} placeholder="Nome · área" />
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink">Quando — prazo</span>
          <input
            type="date"
            value={quando}
            onChange={(e) => setQuando(e.target.value)}
            className="w-full rounded border-[1.5px] border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
          />
        </label>
      </div>

      <Input label="Onde" value={onde} onChange={(e) => setOnde(e.target.value)} placeholder="Área ou unidade" />

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-ink">Como</span>
        <Textarea rows={2} value={como} onChange={(e) => setComo(e.target.value)} placeholder="De que forma a medida será executada" />
      </label>

      <Input label="Quanto — custo estimado" value={quanto} onChange={(e) => setQuanto(e.target.value)} placeholder="Ex.: R$ 18.500 ou sem custo direto" />

      <div>
        <p className="mb-1.5 text-[13px] font-semibold text-ink">Status</p>
        <Select
          value={status}
          onChange={(v) => setStatus(v as Nr1AcaoStatus)}
          ariaLabel="Status da ação"
          options={(['planejada', 'em-andamento', 'atrasada'] as Nr1AcaoStatus[]).map((s) => ({ value: s, label: ACAO_STATUS[s].label }))}
        />
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">
          Concluir a ação exige evidência anexada — isso é feito no detalhe.
        </p>
      </div>

      <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button iconLeft="ph:check-bold" disabled={!valido || salvando} onClick={salvar}>
          {salvando ? 'Salvando…' : inicial ? 'Salvar ação' : 'Criar ação'}
        </Button>
      </div>
    </div>
  )
}
