import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { MngTopBar } from '../../components/MngTopBar'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Sheet } from '../../components/Sheet'
import { MatchCard } from '../../components/MatchCard'
import { ProfessionalProfileView } from '../../components/ProfessionalProfileView'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { mngProfissionalService } from '../../services/mng'
import { PROF_STATUS_LABEL, mngTiposProfissional } from '../../data/mngMock'
import { CamposTipoView } from '../../components/CamposTipo'
import type { MngProfissional, MngProfissionalDetalhe, Professional } from '../../types'

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
/* MNG-12b — Detalhe do profissional (tela): análise do cadastro (aprovar /
   devolver / reprovar) e, em operação, os dados e indicadores de qualidade.
   Na fase 2, as abas Sessões e Financeiro (histórico de sessões, extrato e
   conferência de notas fiscais) ficam de fora: dependem das áreas de
   sessões e pagamentos, que ainda não fazem parte desta fase. */
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
  const [preview, setPreview] = useState(false)
  const pendente = p.status === 'para-analise' || p.status === 'em-analise'
  // Fluxo de análise (para análise / em análise / reprovado): mostra o cadastro
  // completo para aprovação, em vez dos dados de operação.
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

      {/* Análise do cadastro (para/em análise/reprovado) OU dados (em operação) */}
      {emAnalise && <CadastroReview p={p} />}

      {!emAnalise && (
        <div className="flex flex-col gap-4">
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

      {/* Prévia do perfil na plataforma (como o beneficiário vê) */}
      <Sheet open={preview} onClose={() => setPreview(false)} title="Perfil na plataforma" icon="ph:eye-bold" size="lg">
        {preview && <PerfilPreview pro={toProfessional(p)} />}
      </Sheet>
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
