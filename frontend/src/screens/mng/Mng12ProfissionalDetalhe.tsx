import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { MngTopBar } from '../../components/MngTopBar'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Sheet } from '../../components/Sheet'
import { Modal } from '../../components/Modal'
import { StatTile } from '../../components/StatTile'
import { MatchCard } from '../../components/MatchCard'
import { ProfessionalProfileView } from '../../components/ProfessionalProfileView'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { mngProfissionalService } from '../../services/mng'
import { PROF_STATUS_LABEL, mngTiposProfissional } from '../../data/mngMock'
import { CamposTipoView } from '../../components/CamposTipo'
import { ConferirNota } from './ConferirNota'
import type { MngProfissional, MngProfissionalDetalhe, MngSessaoResumo, MngNota, ExtratoItem, Professional } from '../../types'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const fmtData = (iso: string) => { const [, m, d] = iso.split('-'); return `${d}/${m}` }
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const CANCELADO_POR: Record<'profissional' | 'beneficiario' | 'yna', string> = { profissional: 'Profissional', beneficiario: 'Beneficiário', yna: 'YNA (backoffice)' }
const fmtDataHora = (iso: string) => { const [d, t] = iso.split('T'); const [y, m, dd] = d.split('-'); return `${dd}/${m}/${y}${t ? ` às ${t}` : ''}` }

const NOTA_STATUS: Record<MngNota['status'], { label: string; tone: 'neutral' | 'warning' | 'danger' | 'success' | 'primary' }> = {
  'em-analise': { label: 'Em análise', tone: 'warning' },
  'requer-ajuste': { label: 'Pendência', tone: 'danger' },
  'para-pagamento': { label: 'Para pagamento', tone: 'primary' },
  paga: { label: 'Paga', tone: 'success' },
}

/* Mapeia o profissional do backoffice para o formato que os componentes do
   beneficiário (MatchCard / ProfessionalProfileView) esperam — mesma prévia da
   jornada do profissional. Campos não modelados aqui usam valores ilustrativos. */
function toProfessional(p: MngProfissionalDetalhe): Professional {
  return {
    id: p.id,
    name: p.nome,
    crp: p.conselho,
    approach: p.linhasTeoricas[0] ?? 'Abordagem clínica',
    approachLong: p.linhasTeoricas.join(' · ') || 'Abordagem clínica',
    specialties: p.linhasTeoricas.length ? p.linhasTeoricas : ['Saúde mental'],
    nextSlot: 'Ter, 30/06 · 14h00',
    videoLength: '1:30',
    whyThisMatch: p.bio,
    initials: p.initials,
    palette: p.palette,
    bio: p.bio,
    formation: p.formacao,
    yearsExp: 8,
    sessionDuration: 50,
  }
}

const STATUS_TONE: Record<MngProfissional['status'], 'success' | 'primary' | 'warning' | 'danger' | 'neutral'> = {
  ativo: 'success', 'para-analise': 'primary', 'em-analise': 'warning', reprovado: 'danger', inativo: 'neutral',
}
const SESSAO_TONE: Record<MngSessaoResumo['status'], 'success' | 'danger' | 'neutral'> = {
  realizada: 'success', 'nao-realizada': 'danger', cancelada: 'neutral',
}
const SESSAO_LABEL: Record<MngSessaoResumo['status'], string> = {
  realizada: 'Realizada', 'nao-realizada': 'Não realizada', cancelada: 'Cancelada',
}

/* MNG-12b — Detalhe do profissional (tela): dados, aprovação, sessões e financeiro. */
export function Mng12ProfissionalDetalhe() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const q = useService(() => mngProfissionalService.get(id), [id])

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MngTopBar />
        <button onClick={() => navigate('/mng/profissionais')} className="mb-4 mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary transition-colors hover:text-ink lg:mt-0">
          <Icon icon="ph:arrow-left-bold" width={15} aria-hidden /> Profissionais
        </button>

        {q.status === 'loading' && <Skeleton className="h-40 w-full rounded-lg" />}
        {q.status === 'error' && <ErrorState message={q.message} onRetry={q.reload} />}
        {q.status === 'success' && !q.data && (
          <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-sm text-ink-secondary">Profissional não encontrado.</div>
        )}
        {q.status === 'success' && q.data && <Conteudo p={q.data} reload={q.reload} />}
      </div>
    </div>
  )
}

function Conteudo({ p, reload }: { p: MngProfissionalDetalhe; reload: () => void }) {
  const [aba, setAba] = useState<'dados' | 'sessoes' | 'financeiro'>('dados')
  const [preview, setPreview] = useState(false)
  const [cancelSel, setCancelSel] = useState<MngSessaoResumo | null>(null)
  const [conferir, setConferir] = useState<MngNota | null>(null)
  const [finView, setFinView] = useState<'extrato' | 'nf'>('extrato')
  const pendente = p.status === 'para-analise' || p.status === 'em-analise'
  // Fluxo de análise (para análise / em análise / reprovado): mostra o cadastro
  // completo para aprovação, sem as abas de Sessões e Financeiro.
  const emAnalise = pendente || p.status === 'reprovado'
  const decidir = async (d: 'aprovar' | 'ajuste' | 'rejeitar') => { await mngProfissionalService.decidir(p.id, d); reload() }

  return (
    <>
      {/* Cabeçalho */}
      <div className="mb-4 flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3.5">
          {p.fotoUrl ? <img src={p.fotoUrl} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover" /> : <Avatar initials={p.initials} size={56} palette={p.palette} />}
          <div className="min-w-0">
            <h1 className="truncate font-heading text-xl font-semibold text-ink">{p.nome}</h1>
            <p className="truncate text-[13px] text-ink-secondary">{p.tipoLabel} · {p.conselho} · {p.uf}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
          {!emAnalise && <Button size="sm" variant="secondary" iconLeft="ph:eye-bold" onClick={() => setPreview(true)}>Ver perfil</Button>}
          <Badge tone={STATUS_TONE[p.status]}>{PROF_STATUS_LABEL[p.status]}</Badge>
        </div>
      </div>

      {/* Métricas rápidas — apenas para profissionais em operação */}
      {!emAnalise && (
        <div className="mb-4 grid grid-cols-3 gap-2.5">
          <Metric icon="ph:users-three-bold" value={String(p.clientesRecorrentes)} label="Clientes recorrentes" />
          <Metric icon="ph:calendar-check-bold" value={String(p.sessoesRealizadas)} label="Sessões realizadas" />
          <Metric icon="ph:seal-check-bold" value={p.qualidadeGeral > 0 ? String(p.qualidadeGeral) : '—'} label="Qualidade geral" />
        </div>
      )}

      {/* Aprovação */}
      {emAnalise && (
        p.status === 'reprovado' ? (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-danger/30 bg-danger-bg p-3">
            <p className="w-full text-[13px] font-medium text-danger-ink">Cadastro reprovado. Você pode reconsiderar a decisão.</p>
            <Button size="sm" iconLeft="ph:check-bold" onClick={() => decidir('aprovar')}>Aprovar</Button>
            <Button size="sm" variant="secondary" iconLeft="ph:arrow-counter-clockwise-bold" onClick={() => decidir('ajuste')}>Reabrir análise</Button>
          </div>
        ) : (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-warning/30 bg-warning-bg p-3">
            <p className="w-full text-[13px] font-medium text-warning-ink">Cadastro aguardando decisão do gestor.</p>
            <Button size="sm" iconLeft="ph:check-bold" onClick={() => decidir('aprovar')}>Aprovar</Button>
            <Button size="sm" variant="secondary" iconLeft="ph:pencil-simple-bold" onClick={() => decidir('ajuste')}>Devolver p/ análise</Button>
            <Button size="sm" variant="ghost" iconLeft="ph:x-bold" onClick={() => decidir('rejeitar')}>Reprovar</Button>
          </div>
        )
      )}

      {/* Análise do cadastro (para/em análise/reprovado) OU abas (em operação) */}
      {emAnalise && <CadastroReview p={p} />}
      {!emAnalise && (
      <div className="flex gap-6 border-b border-border">
        {([['dados', 'Dados'], ['sessoes', 'Sessões'], ['financeiro', 'Financeiro']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setAba(k)}
            className={`-mb-px border-b-2 px-0.5 py-2.5 text-sm font-medium transition-colors ${aba === k ? 'border-primary text-primary dark:text-primary-300' : 'border-transparent text-ink-secondary hover:text-ink'}`}>{l}</button>
        ))}
      </div>
      )}

      {!emAnalise && aba === 'dados' && (
        <div className="mt-4 flex flex-col gap-4">
          <p className="text-[13.5px] leading-relaxed text-ink">{p.bio}</p>
          <div className="flex flex-wrap gap-1.5">
            {p.linhasTeoricas.map((l) => <Badge key={l} tone="neutral">{l}</Badge>)}
          </div>
          <div>
            <h4 className="mb-1.5 text-[13px] font-semibold text-ink">Formação</h4>
            <ul className="flex flex-col gap-1">{p.formacao.map((f, i) => <li key={i} className="flex items-center gap-2 text-[13px] text-ink-secondary"><Icon icon="ph:graduation-cap-bold" width={14} className="text-ink-muted" aria-hidden />{f}</li>)}</ul>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border border-border bg-surface p-4 text-[13px]">
            <div><dt className="text-[11px] uppercase tracking-wide text-ink-muted">Conselho</dt><dd className="text-ink">{p.conselho} · {p.uf}</dd></div>
            <div><dt className="text-[11px] uppercase tracking-wide text-ink-muted">E-mail</dt><dd className="truncate text-ink">{p.email}</dd></div>
            <div><dt className="text-[11px] uppercase tracking-wide text-ink-muted">CNPJ (PJ)</dt><dd className="text-ink">{p.cnpj}</dd></div>
            <div><dt className="text-[11px] uppercase tracking-wide text-ink-muted">Dados bancários</dt><dd className="text-ink">{p.banco}</dd></div>
          </dl>
          <div>
            <h4 className="mb-2 text-[13px] font-semibold text-ink">Indicadores de qualidade</h4>
            <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-surface p-4">
              {p.qualidade.map((qi) => (
                <div key={qi.criterio}>
                  <div className="flex justify-between text-[12.5px]"><span className="text-ink">{qi.criterio}</span><span className="font-mono text-ink-secondary">{qi.score}</span></div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-pill bg-surface-2"><div className={`h-full rounded-pill ${qi.score >= 80 ? 'bg-success' : qi.score >= 60 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${qi.score}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!emAnalise && aba === 'sessoes' && (
        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface">
          <ul className="divide-y divide-border">
            {p.historicoSessoes.map((s) => {
              const [, mes, dia] = s.data.split('-')
              const atraso = s.atrasoMin ?? 0
              return (
                <li key={s.id} className="flex items-center gap-3.5 px-4 py-3">
                  {/* Data em destaque */}
                  <div className="w-11 shrink-0 text-center">
                    <p className="font-heading text-[18px] font-bold leading-none text-ink">{dia}</p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-muted">{MESES[Number(mes) - 1]}</p>
                  </div>
                  <div className="h-9 w-px shrink-0 bg-border" />
                  {/* Conteúdo */}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-ink">
                      {s.status === 'realizada' ? <>Entrada {s.entrada} · término {s.termino} · {s.duracaoMin} min</> : <>Horário {s.hora}</>}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {s.status === 'realizada' && (atraso > 0
                        ? <span className="inline-flex items-center gap-1 rounded-pill bg-warning-bg px-2 py-0.5 text-[11px] font-semibold text-warning-ink"><Icon icon="ph:timer-bold" width={11} aria-hidden /> {atraso} min de atraso</span>
                        : <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-success-ink"><Icon icon="ph:check-bold" width={11} aria-hidden /> Sem atraso</span>)}
                      {s.status === 'nao-realizada' && s.ausente && (
                        <span className="inline-flex items-center gap-1 rounded-pill bg-danger-bg px-2 py-0.5 text-[11px] font-semibold text-danger-ink">
                          <Icon icon="ph:user-minus-bold" width={11} aria-hidden /> {s.ausente === 'profissional' ? 'Profissional não entrou' : 'Beneficiário não entrou'}
                        </span>
                      )}
                      {s.status === 'cancelada' && (s.cancelamento
                        ? <button onClick={() => setCancelSel(s)} className="inline-flex items-center gap-1 text-[11.5px] font-medium text-primary transition-colors hover:underline dark:text-primary-300"><Icon icon="ph:info-bold" width={12} aria-hidden /> Ver cancelamento</button>
                        : <span className="text-[11.5px] text-ink-muted">Sessão cancelada</span>)}
                    </div>
                  </div>
                  <Badge tone={SESSAO_TONE[s.status]}>{SESSAO_LABEL[s.status]}</Badge>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {!emAnalise && aba === 'financeiro' && (
        <div className="mt-4 flex flex-col gap-4">
          {/* Big numbers */}
          <div className="grid grid-cols-2 gap-2.5">
            <StatTile icon="ph:wallet-bold" value={brl(p.financeiro.saldoAPagar)} label="Saldo a pagar" />
            <StatTile icon="ph:hand-coins-bold" value={brl(p.financeiro.totalPago)} label="Já recebido pelo profissional" />
          </div>

          {/* Alternância Extrato / Notas Fiscais */}
          <div className="flex gap-1 rounded-lg bg-surface-2 p-1">
            {([['extrato', 'Extrato'], ['nf', 'Notas Fiscais']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setFinView(key)} aria-selected={finView === key}
                className={`flex-1 rounded-lg px-3 py-2.5 font-heading text-sm font-semibold transition-all ${finView === key ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'}`}>
                {label}
              </button>
            ))}
          </div>

          {finView === 'extrato' ? (
            <div className="overflow-hidden rounded-lg border border-border bg-surface">
              <div className="hidden grid-cols-[88px_1fr_110px_110px] gap-3 border-b border-border px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-ink-muted sm:grid">
                <span>Data</span><span>Movimentação</span><span className="text-right">Valor</span><span className="text-right">Saldo</span>
              </div>
              <ul className="divide-y divide-border">
                {p.financeiro.extrato.map((it) => <ExtratoRow key={it.id} it={it} />)}
              </ul>
            </div>
          ) : (
            p.financeiro.notas.length > 0 ? (
              <div className="flex flex-col gap-2">
                {p.financeiro.notas.map((n) => <NotaCard key={n.id} n={n} onConferir={() => setConferir(n)} />)}
              </div>
            ) : (
              <p className="rounded-lg border border-border bg-surface px-4 py-6 text-center text-[13px] text-ink-muted">Nenhuma nota fiscal deste profissional.</p>
            )
          )}
        </div>
      )}

      {/* Prévia do perfil na plataforma (como o beneficiário vê) */}
      <Sheet open={preview} onClose={() => setPreview(false)} title="Perfil na plataforma" icon="ph:eye-bold" size="lg">
        {preview && <PerfilPreview pro={toProfessional(p)} />}
      </Sheet>

      {/* Conferência da nota fiscal (aprovar / gerar pendência) */}
      <Sheet open={conferir !== null} onClose={() => setConferir(null)} title="Conferir nota fiscal" icon="ph:receipt-bold" size="md">
        {conferir && <ConferirNota nota={conferir} onFeito={() => { setConferir(null); reload() }} />}
      </Sheet>

      {/* Informações do cancelamento */}
      <Modal open={cancelSel !== null} title="Cancelamento da sessão" onClose={() => setCancelSel(null)}>
        {cancelSel?.cancelamento && (
          <div className="flex flex-col gap-4">
            <p className="text-[13px] text-ink-secondary">Sessão de {cancelSel.data.split('-').reverse().join('/')} às {cancelSel.hora}.</p>
            <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="text-[13px] text-ink-secondary">Cancelado em</span>
                <span className="text-right text-[13px] font-medium text-ink">{fmtDataHora(cancelSel.cancelamento.em)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="text-[13px] text-ink-secondary">Cancelado por</span>
                <span className="text-right text-[13px] font-medium text-ink">{CANCELADO_POR[cancelSel.cancelamento.por]}</span>
              </div>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-ink-muted">Motivo</p>
              <p className="rounded-lg border border-border bg-surface-2/40 p-3 text-[13.5px] leading-relaxed text-ink">{cancelSel.cancelamento.motivo}</p>
            </div>
            <Button fullWidth onClick={() => setCancelSel(null)}>Fechar</Button>
          </div>
        )}
      </Modal>
    </>
  )
}

/* Prévia: primeiro o card da triagem + botão para o detalhe do perfil. */
function PerfilPreview({ pro }: { pro: Professional }) {
  const [view, setView] = useState<'card' | 'detalhe'>('card')

  if (view === 'detalhe') {
    return (
      <div>
        <button onClick={() => setView('card')} className="mx-5 mb-1 mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary transition-colors hover:text-ink lg:mx-6">
          <Icon icon="ph:arrow-left-bold" width={14} aria-hidden /> Voltar ao card
        </button>
        <ProfessionalProfileView pro={pro} variant="preview" />
      </div>
    )
  }

  return (
    <div className="px-5 py-6 lg:px-6">
      <p className="mb-4 text-[12.5px] text-ink-secondary">É assim que o profissional aparece na indicação (triagem) para o beneficiário.</p>
      <div className="mx-auto max-w-md">
        <MatchCard pro={pro} disabled />
      </div>
      <div className="mx-auto mt-5 max-w-md">
        <Button fullWidth iconRight="ph:arrow-right-bold" onClick={() => setView('detalhe')}>Ver detalhe do perfil</Button>
      </div>
    </div>
  )
}

const fmtMesAno = (s: string) => (s ? s.split('-').reverse().join('/') : '')
const periodo = (ini: string, fim: string, andamento: boolean) => `${fmtMesAno(ini)} — ${andamento ? 'em andamento' : fmtMesAno(fim) || '—'}`

/* Revisão do cadastro do profissional, nos mesmos 5 steps do fluxo de cadastro. */
function CadastroReview({ p }: { p: MngProfissionalDetalhe }) {
  const c = p.cadastro
  return (
    <div className="mt-1 flex flex-col gap-4">
      <p className="text-[12.5px] text-ink-secondary">Cadastro enviado pelo profissional (mesmos passos do fluxo de cadastro) — revise antes de aprovar.</p>

      {/* Step 1 — Dados pessoais */}
      <Secao titulo="1 · Dados pessoais" icon="ph:user-bold">
        <Campos>
          <CampoLinha label="Nome completo" value={c.nomeCompleto} span />
          <CampoLinha label="CPF" value={c.cpf} />
          <CampoLinha label="Conselho (CRP)" value={`${p.conselho} · ${p.uf}`} />
          <CampoLinha label="E-mail" value={c.email} />
          <CampoLinha label="Telefone" value={c.telefone} />
          <CampoLinha label="Instagram" value={c.instagram || '—'} span />
        </Campos>
      </Secao>

      {/* Step 2 — Dados da empresa (PJ) */}
      <Secao titulo="2 · Dados da empresa (PJ)" icon="ph:buildings-bold">
        <Campos>
          <CampoLinha label="CNPJ" value={c.cnpj} />
          <CampoLinha label="Razão social" value={c.razaoSocial} />
          <CampoLinha label="Banco" value={c.banco} />
          <CampoLinha label="Agência" value={c.agencia} />
          <CampoLinha label="Conta" value={c.conta} />
          <CampoLinha label="Chave PIX" value={c.pixChave} />
        </Campos>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2/40 p-3">
          <span className="flex min-w-0 items-center gap-2 text-[13px] text-ink">
            <Icon icon={c.contratoSocial ? 'ph:file-pdf-bold' : 'ph:file-dashed-bold'} width={16} className={c.contratoSocial ? 'text-primary dark:text-primary-300' : 'text-ink-muted'} aria-hidden />
            Contrato social{c.contratoSocial ? ` · ${c.contratoSocial}` : ''}
          </span>
          {c.contratoSocial ? <Button size="sm" variant="secondary" iconLeft="ph:download-simple-bold">Baixar</Button> : <Badge tone="warning">Pendente</Badge>}
        </div>
      </Secao>

      {/* Step 3 — Perfil profissional (campos definidos pelo tipo) */}
      <Secao titulo="3 · Perfil profissional" icon="ph:brain-bold">
        <CamposTipoView campos={mngTiposProfissional.find((t) => t.id === p.tipo)?.campos ?? []} perfil={c.perfil} />
      </Secao>

      {/* Step 4 — Formação */}
      <Secao titulo="4 · Formação" icon="ph:graduation-cap-bold">
        <p className="mb-1.5 text-[11px] uppercase tracking-wide text-ink-muted">Formação acadêmica</p>
        <div className="mb-4 flex flex-col gap-2">
          {c.formacoes.map((f) => (
            <div key={f.id} className="rounded-lg border border-border bg-surface-2/40 p-3">
              <p className="text-[13px] font-medium text-ink">{f.nivel} · {f.curso}</p>
              <p className="text-[12px] text-ink-muted">{f.instituicao} · {periodo(f.inicio, f.fim, f.emAndamento)}</p>
            </div>
          ))}
        </div>
        <p className="mb-1.5 text-[11px] uppercase tracking-wide text-ink-muted">Cursos e certificados</p>
        <div className="mb-4 flex flex-col gap-2">
          {c.cursos.map((cu) => (
            <div key={cu.id} className="rounded-lg border border-border bg-surface-2/40 p-3">
              <p className="text-[13px] font-medium text-ink">{cu.nome}</p>
              <p className="text-[12px] text-ink-muted">{cu.instituicao} · {periodo(cu.inicio, cu.fim, cu.emAndamento)}</p>
            </div>
          ))}
        </div>
        <p className="mb-1.5 text-[11px] uppercase tracking-wide text-ink-muted">Idiomas</p>
        <div className="flex flex-wrap gap-1.5">{c.idiomas.map((i) => <Badge key={i.id} tone="neutral">{i.idioma} · {i.nivel}</Badge>)}</div>
      </Secao>

      {/* Step 5 — Disponibilidade */}
      <Secao titulo="5 · Disponibilidade" icon="ph:calendar-bold">
        <div className="mb-3">
          <p className="mb-1.5 text-[11px] uppercase tracking-wide text-ink-muted">Dias disponíveis</p>
          <div className="flex flex-wrap gap-1.5">{c.disponibilidade.dias.map((d) => <Badge key={d} tone="primary">{d}</Badge>)}</div>
        </div>
        <Campos>
          <CampoLinha label="Horário" value={`${c.disponibilidade.horaInicio} – ${c.disponibilidade.horaFim}`} />
          <CampoLinha label="Plantão" value={c.disponibilidade.plantao ? 'Sim' : 'Não'} />
        </Campos>
      </Secao>
    </div>
  )
}

function Secao({ titulo, icon, children }: { titulo: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <h4 className="mb-3 flex items-center gap-2 font-heading text-[14px] font-semibold text-ink">
        <Icon icon={icon} width={17} className="text-primary dark:text-primary-300" aria-hidden /> {titulo}
      </h4>
      {children}
    </section>
  )
}
function Campos({ children }: { children: React.ReactNode }) {
  return <dl className="grid grid-cols-2 gap-x-4 gap-y-3">{children}</dl>
}
function CampoLinha({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <div className={span ? 'col-span-2' : undefined}>
      <dt className="text-[11px] uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="break-words text-[13.5px] text-ink">{value}</dd>
    </div>
  )
}

function ExtratoRow({ it }: { it: ExtratoItem }) {
  const isResgate = it.tipo === 'resgate'
  return (
    <li className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[88px_1fr_110px_110px]">
      <span className="hidden font-mono text-[12.5px] text-ink-secondary sm:block">{fmtData(it.data)}</span>
      <div className="flex min-w-0 items-center gap-2.5">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isResgate ? 'bg-surface-2' : 'bg-primary-50'}`}>
          <Icon icon={isResgate ? 'ph:bank-bold' : 'ph:video-camera-bold'} width={15} className={isResgate ? 'text-ink-secondary' : 'text-primary dark:text-primary-300'} aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-ink">{isResgate ? 'Resgate' : 'Sessão'}</p>
          <p className="font-mono text-[11px] text-ink-muted sm:hidden">{fmtData(it.data)}</p>
        </div>
      </div>
      <span className={`text-right text-[13px] font-semibold tabular-nums ${isResgate ? 'text-danger-ink' : 'text-success'}`}>{isResgate ? '− ' : '+ '}{brl(it.valor)}</span>
      <span className="text-right font-mono text-[12.5px] tabular-nums text-ink-secondary">{brl(it.saldo)}</span>
    </li>
  )
}

function NotaCard({ n, onConferir }: { n: MngNota; onConferir: () => void }) {
  const st = NOTA_STATUS[n.status]
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-heading text-sm font-semibold text-ink">
            <Icon icon="ph:receipt-bold" width={16} className="text-primary dark:text-primary-300" aria-hidden />
            {n.numero ? `Nota ${n.numero}` : 'A emitir'}
          </p>
          <p className="mt-0.5 text-[12.5px] text-ink-secondary">{n.origem === 'antecipacao' ? 'Antecipação' : 'Fechamento'} · {n.referencia}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-heading text-sm font-semibold text-ink">{brl(n.valor)}</p>
          <Badge tone={st.tone} className="mt-1">{st.label}</Badge>
        </div>
      </div>
      {n.status === 'requer-ajuste' && <p className="mt-2 text-[12px] text-danger-ink">Pendência aberta — aguardando reemissão pelo profissional.</p>}
      {(n.status === 'em-analise' || n.numero) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {n.status === 'em-analise' && <Button size="sm" iconLeft="ph:check-bold" onClick={onConferir}>Conferir</Button>}
          {n.numero && (
            <Button size="sm" variant="secondary" iconLeft="ph:file-pdf-bold" onClick={() => { /* download simulado */ }}>Baixar NF</Button>
          )}
        </div>
      )}
    </div>
  )
}

function Metric({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300"><Icon icon={icon} width={20} aria-hidden /></div>
      <div className="min-w-0">
        <p className="font-heading text-lg font-bold leading-none text-ink">{value}</p>
        <p className="mt-0.5 text-[11.5px] leading-tight text-ink-secondary">{label}</p>
      </div>
    </div>
  )
}
