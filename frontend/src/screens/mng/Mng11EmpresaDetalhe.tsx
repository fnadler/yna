import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { MngTopBar } from '../../components/MngTopBar'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Modal } from '../../components/Modal'
import { Sheet } from '../../components/Sheet'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import {
  mngEmpresaService, mngDepartamentoEmpresaService, mngContatoEmpresaService, mngUsuarioRhService,
} from '../../services/mng'
import { EMPRESA_STATUS_LABEL, mngGestores, mngCsms, PLANOS, SEGMENTOS } from '../../data/mngMock'
import type {
  MngEmpresa, MngContrato, MngContatoEmpresa, MngUsuarioRhPerfil,
} from '../../types'

const fmtData = (iso: string) => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}` }
const diasEntre = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000)
const HOJE = '2026-06-26'

/** Andamento do contrato: % decorrido, dias restantes e tom pelo prazo até o
   término — verde (> 180), amarelo (91–180), vermelho (≤ 90 dias). */
function andamento(inicio: string, fim: string) {
  const total = Math.max(1, diasEntre(inicio, fim))
  const decorridos = Math.min(Math.max(0, diasEntre(inicio, HOJE)), total)
  const pct = Math.round((decorridos / total) * 100)
  const restante = diasEntre(HOJE, fim)
  const tone: 'success' | 'warning' | 'danger' = restante <= 90 ? 'danger' : restante <= 180 ? 'warning' : 'success'
  return { pct, restante, tone }
}
const FILL: Record<'success' | 'warning' | 'danger', string> = { success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger' }
const TEXT: Record<'success' | 'warning' | 'danger', string> = { success: 'text-success-ink', warning: 'text-warning-ink', danger: 'text-danger-ink' }

type AbaEmpresa = 'visao-geral' | 'departamentos' | 'contatos' | 'usuarios'

const STATUS_TONE: Record<MngEmpresa['status'], 'success' | 'danger' | 'neutral'> = { ativa: 'success', bloqueada: 'danger', inativa: 'neutral' }
const CONTRATO_TONE: Record<MngContrato['status'], 'success' | 'neutral' | 'danger'> = { vigente: 'success', encerrado: 'neutral', cancelado: 'danger' }
const CONTRATO_LABEL: Record<MngContrato['status'], string> = { vigente: 'Vigente', encerrado: 'Encerrado', cancelado: 'Cancelado' }

/* MNG-11b — Detalhe da empresa: dados cadastrais, contrato (só cadastral,
   sem cobrança — §12), funil de convites, colaboradores e contatos
   (Master + CSM). */
export function Mng11EmpresaDetalhe() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const q = useService(() => mngEmpresaService.get(id), [id])

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MngTopBar />
        <button onClick={() => navigate('/mng/empresas')} className="mb-4 mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary transition-colors hover:text-ink lg:mt-0">
          <Icon icon="ph:arrow-left-bold" width={15} aria-hidden /> Empresas
        </button>

        {q.status === 'loading' && <Skeleton className="h-40 w-full rounded-lg" />}
        {q.status === 'error' && <ErrorState message={q.message} onRetry={q.reload} />}
        {q.status === 'success' && !q.data && (
          <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-sm text-ink-secondary">Empresa não encontrada.</div>
        )}
        {q.status === 'success' && q.data && <EmpresaConteudo empresa={q.data} reload={q.reload} />}
      </div>
    </div>
  )
}

function Linha({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <span className="text-[13px] text-ink-secondary">{label}</span>
      <span className="text-right text-[13px] font-medium text-ink">{value}</span>
    </div>
  )
}

const ABAS: { valor: AbaEmpresa; label: string }[] = [
  { valor: 'visao-geral', label: 'Visão geral' },
  { valor: 'departamentos', label: 'Departamentos' },
  { valor: 'contatos', label: 'Contatos' },
  { valor: 'usuarios', label: 'Usuários' },
]

function EmpresaConteudo({ empresa, reload }: { empresa: MngEmpresa; reload: () => void }) {
  const [aba, setAba] = useState<AbaEmpresa>('visao-geral')
  const [csmId, setCsmId] = useState(empresa.csmId)
  const [verHistorico, setVerHistorico] = useState(false)
  const [novoContrato, setNovoContrato] = useState(false)
  const [editar, setEditar] = useState(false)

  const vigente = empresa.contratos.find((c) => c.status === 'vigente')
  const and = vigente ? andamento(vigente.inicio, vigente.fim) : null
  const usoPct = empresa.colaboradoresContratados > 0 ? Math.round((empresa.colaboradoresAtivos / empresa.colaboradoresContratados) * 100) : 0
  const disponiveis = Math.max(0, empresa.colaboradoresContratados - empresa.colaboradoresAtivos)

  const csms = mngCsms()
  const trocarCsm = (gid: string) => { setCsmId(gid); void mngEmpresaService.setCsm(empresa.id, gid) }

  const funilBase = empresa.funil.enviado || 1
  const ETAPAS = [
    { key: 'enviado', label: 'Enviados', icon: 'ph:paper-plane-tilt-bold' },
    { key: 'aberto', label: 'Abertos', icon: 'ph:envelope-open-bold' },
    { key: 'cadastroIniciado', label: 'Cadastro iniciado', icon: 'ph:user-plus-bold' },
    { key: 'cadastroConcluido', label: 'Cadastro concluído', icon: 'ph:user-check-bold' },
  ] as const

  return (
    <>
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary-50 font-heading text-base font-bold text-primary dark:text-primary-300">{empresa.initials}</div>
          <div className="min-w-0">
            <h1 className="truncate font-heading text-xl font-semibold text-ink">{empresa.nomeFantasia}</h1>
            <p className="truncate text-[13px] text-ink-secondary">{empresa.razaoSocial} · {empresa.cnpj}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge tone={STATUS_TONE[empresa.status]}>{EMPRESA_STATUS_LABEL[empresa.status]}</Badge>
          <Button size="sm" variant="secondary" iconLeft="ph:pencil-simple-bold" onClick={() => setEditar(true)}><span className="hidden sm:inline">Editar</span></Button>
        </div>
      </div>

      {/* Abas — Visão geral / Departamentos / Contatos / Usuários. Quatro
         itens não cabem bem num `flex-1` igualmente dividido em mobile
         ("Visão geral" quebra linha) — mesmo padrão de scroll horizontal
         usado no seletor de ciclo do cockpit NR-1 para mais de 2-3 abas. */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-surface-2 p-1" role="tablist" aria-label="Seções da empresa">
        {ABAS.map((a) => (
          <button
            key={a.valor}
            role="tab"
            aria-selected={aba === a.valor}
            onClick={() => setAba(a.valor)}
            className={`shrink-0 whitespace-nowrap rounded-lg px-3.5 py-2.5 font-heading text-[13.5px] font-semibold transition-all sm:text-sm ${
              aba === a.valor ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {aba === 'departamentos' && <AbaDepartamentos empresaId={empresa.id} />}
      {aba === 'contatos' && <AbaContatos empresaId={empresa.id} />}
      {aba === 'usuarios' && <AbaUsuarios empresaId={empresa.id} />}

      {aba === 'visao-geral' && (
      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6 lg:items-start">
        {/* Coluna esquerda */}
        <div className="flex flex-col gap-6">
          {/* Dados da empresa */}
          <section>
            <h2 className="mb-3 text-[15px] font-semibold text-ink">Dados cadastrais</h2>
            <div className="rounded-lg border border-border bg-surface px-4 py-1">
              <Linha label="Razão social" value={empresa.razaoSocial} />
              <Linha label="Nome fantasia" value={empresa.nomeFantasia} />
              <Linha label="CNPJ" value={empresa.cnpj} />
              <Linha label="Segmento" value={empresa.segmento} />
            </div>
          </section>

          {/* Contrato — só dado cadastral (§12): sem parcelas nem cobrança */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-ink">Contrato</h2>
              <Button size="sm" variant="secondary" iconLeft="ph:plus-bold" onClick={() => setNovoContrato(true)}>Novo contrato</Button>
            </div>
            <div className="rounded-lg border border-border bg-surface px-4 pt-1 pb-4">
              {vigente ? (
                <div>
                  <Linha label="Plano" value={vigente.plano} />
                  <Linha label="Colaboradores contratados" value={String(vigente.colaboradoresContratados)} />
                  <Linha label="Início" value={fmtData(vigente.inicio)} />
                  <Linha label="Término" value={fmtData(vigente.fim)} />
                </div>
              ) : (
                <p className="py-4 text-center text-[13px] text-ink-muted">Sem contrato vigente.</p>
              )}

              <Button variant="secondary" size="sm" fullWidth className="mt-4" iconLeft="ph:clock-counter-clockwise-bold" onClick={() => setVerHistorico(true)}>
                Ver histórico de contratos ({empresa.contratos.length})
              </Button>
            </div>
          </section>

          {/* Funil de convites */}
          <section>
            <h2 className="mb-3 text-[15px] font-semibold text-ink">Funil de convites</h2>
            <div className="flex flex-col rounded-lg border border-border bg-surface p-5">
              <div className="mb-4 flex items-baseline justify-between">
                <span className="text-[13px] text-ink-secondary">Conversão total</span>
                <span className="font-mono text-[15px] font-bold text-ink">{Math.round((empresa.funil.cadastroConcluido / funilBase) * 100)}%</span>
              </div>
              <div className="flex flex-col items-center">
                {ETAPAS.map((e, i) => {
                  const valor = empresa.funil[e.key]
                  const pctTotal = Math.round((valor / funilBase) * 100)
                  const prev = i === 0 ? valor : empresa.funil[ETAPAS[i - 1].key]
                  const conv = i === 0 ? 100 : Math.round((valor / (prev || 1)) * 100)
                  const width = Math.max(42, pctTotal)
                  return (
                    <div key={e.key} className="w-full">
                      {i > 0 && (
                        <div className="flex items-center justify-center py-1.5">
                          <span className="inline-flex items-center gap-1 rounded-pill bg-surface-2 px-2.5 py-0.5 font-mono text-[11px] font-medium text-ink-secondary">
                            <Icon icon="ph:arrow-down-bold" width={11} aria-hidden /> {conv}% avançaram
                          </span>
                        </div>
                      )}
                      <div className="mx-auto flex h-[56px] items-center justify-between gap-3 rounded-lg bg-yna-gradient-button px-4 text-white shadow-sm transition-all duration-500" style={{ width: `${width}%` }}>
                        <span className="flex min-w-0 items-center gap-2 text-[13px] font-semibold">
                          <Icon icon={e.icon} width={16} className="shrink-0" aria-hidden />
                          <span className="truncate">{e.label}</span>
                        </span>
                        <span className="shrink-0 whitespace-nowrap text-right">
                          <span className="font-mono text-[18px] font-bold leading-none">{valor}</span>
                          <span className="ml-1.5 text-[11px] opacity-80">{pctTotal}%</span>
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="mt-4 flex items-center gap-1.5 text-[12px] text-ink-muted">
                <Icon icon="ph:lock-simple-bold" width={13} aria-hidden /> Total agregado — sem identificação individual (LGPD).
              </p>
            </div>
          </section>
        </div>

        {/* Coluna direita */}
        <div className="mt-6 flex flex-col gap-5 lg:mt-0">
          {/* Colaboradores */}
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] text-ink-secondary">Colaboradores ativos</span>
              <Icon icon="ph:seat-bold" width={16} className="text-primary dark:text-primary-300" aria-hidden />
            </div>
            <p className="mt-1 font-heading text-[26px] font-bold leading-none text-ink">{empresa.colaboradoresAtivos}<span className="text-base font-semibold text-ink-muted"> / {empresa.colaboradoresContratados}</span></p>
            <div className="mt-2.5 h-2 overflow-hidden rounded-pill bg-surface-2">
              <div className={`h-full rounded-pill transition-all ${usoPct >= 100 ? 'bg-danger' : 'bg-primary'}`} style={{ width: `${Math.min(usoPct, 100)}%` }} />
            </div>
            <p className="mt-1.5 text-[11.5px] text-ink-muted">{usoPct}% ativos · {disponiveis} disponíveis</p>
          </div>

          {/* Término do contrato */}
          {vigente && and && (
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-ink-secondary">Término do contrato</span>
                <Icon icon="ph:calendar-check-bold" width={16} className="text-primary dark:text-primary-300" aria-hidden />
              </div>
              <p className="mt-1 font-heading text-[22px] font-bold leading-none text-ink">{fmtData(vigente.fim)}</p>
              <p className={`mt-1.5 text-[12.5px] font-medium ${TEXT[and.tone]}`}>
                {and.restante < 0 ? 'Contrato vencido' : `Faltam ${and.restante} dias`}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-pill bg-surface-2">
                <div className={`h-full rounded-pill ${FILL[and.tone]}`} style={{ width: `${and.pct}%` }} />
              </div>
              <p className="mt-1.5 text-[11.5px] text-ink-muted">{and.pct}% do período decorrido</p>
            </div>
          )}

          {/* Relacionamento: CSM responsável da YNA (o contato do RH da
             empresa saiu daqui — agora vive na aba "Contatos", mais
             completa: cargo, departamento e telefone além de nome/e-mail). */}
          <section>
            <h2 className="mb-3 text-[15px] font-semibold text-ink">Relacionamento</h2>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ink-muted">CSM responsável · YNA</p>
              <div className="relative">
                <Icon icon="ph:headset-bold" width={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary dark:text-primary-300" aria-hidden />
                <select value={csmId} onChange={(e) => trocarCsm(e.target.value)}
                  className="w-full appearance-none rounded border-[1.5px] border-border bg-surface py-2.5 pl-9 pr-8 text-sm font-medium text-ink outline-none focus:border-primary">
                  {csms.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
                </select>
                <Icon icon="ph:caret-down-bold" width={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden />
              </div>
              {(() => { const csm = mngGestores.find((g) => g.id === csmId); return csm ? (
                <a href={`mailto:${csm.email}`} className="mt-2 flex items-center gap-1.5 text-[12.5px] text-primary hover:underline dark:text-primary-300">
                  <Icon icon="ph:envelope-bold" width={13} aria-hidden /> {csm.email}
                </a>
              ) : null })()}
            </div>
          </section>
        </div>
      </div>
      )}

      {/* Modal: histórico de contratos */}
      <Modal open={verHistorico} title="Histórico de contratos" onClose={() => setVerHistorico(false)}>
        <p className="mb-3 text-[13px] text-ink-secondary">Apenas um contrato fica vigente; os demais são renovações anteriores ou encerrados.</p>
        <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
          {empresa.contratos.map((c) => (
            <div key={c.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-heading text-sm font-semibold text-ink">{fmtData(c.inicio)} — {fmtData(c.fim)}</p>
                  <p className="mt-0.5 text-[12.5px] text-ink-secondary">{c.plano}</p>
                </div>
                <Badge tone={CONTRATO_TONE[c.status]}>{CONTRATO_LABEL[c.status]}</Badge>
              </div>
              <p className="mt-2 text-[12.5px] text-ink-secondary">{c.colaboradoresContratados} colaboradores contratados</p>
              <div className="mt-2">
                <div className="flex items-center justify-between text-[11.5px] text-ink-muted"><span>Execução</span><span>{c.execucaoPct}%</span></div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-pill bg-surface-2"><div className="h-full rounded-pill bg-primary" style={{ width: `${c.execucaoPct}%` }} /></div>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Sheet: novo contrato (renovação) */}
      <Sheet open={novoContrato} onClose={() => setNovoContrato(false)} title="Novo contrato" icon="ph:file-plus-bold" size="md">
        {novoContrato && <NovoContratoForm empresa={empresa} onClose={() => setNovoContrato(false)} onSaved={() => { setNovoContrato(false); reload() }} />}
      </Sheet>

      {/* Sheet: editar dados cadastrais */}
      <Sheet open={editar} onClose={() => setEditar(false)} title="Editar empresa" icon="ph:pencil-simple-bold" size="md">
        {editar && <EditarEmpresaForm empresa={empresa} onClose={() => setEditar(false)} onSaved={() => { setEditar(false); reload() }} />}
      </Sheet>
    </>
  )
}

/* Formulário de edição dos dados cadastrais da empresa. */
function EditarEmpresaForm({ empresa, onClose, onSaved }: { empresa: MngEmpresa; onClose: () => void; onSaved: () => void }) {
  const [razaoSocial, setRazaoSocial] = useState(empresa.razaoSocial)
  const [nomeFantasia, setNomeFantasia] = useState(empresa.nomeFantasia)
  const [cnpj, setCnpj] = useState(empresa.cnpj)
  const [segmento, setSegmento] = useState(empresa.segmento)
  const [status, setStatus] = useState<MngEmpresa['status']>(empresa.status)
  const [salvando, setSalvando] = useState(false)

  const inputCls = 'w-full rounded border-[1.5px] border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary'
  // Inclui o segmento atual caso não esteja na lista padrão.
  const segmentos = SEGMENTOS.includes(segmento) ? SEGMENTOS : [segmento, ...SEGMENTOS]
  const valido = razaoSocial.trim() && nomeFantasia.trim() && cnpj.trim() && segmento.trim()

  const salvar = async () => {
    if (!valido) return
    setSalvando(true)
    await mngEmpresaService.update(empresa.id, {
      razaoSocial: razaoSocial.trim(), nomeFantasia: nomeFantasia.trim(), cnpj: cnpj.trim(), segmento, status,
    })
    onSaved()
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-ink">Razão social</span>
        <input className={inputCls} value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink">Nome fantasia</span>
          <input className={inputCls} value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink">CNPJ</span>
          <input className={inputCls} value={cnpj} onChange={(e) => setCnpj(e.target.value)} inputMode="numeric" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink">Segmento</span>
          <select className={inputCls} value={segmento} onChange={(e) => setSegmento(e.target.value)}>
            {segmentos.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink">Status</span>
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as MngEmpresa['status'])}>
            {(['ativa', 'bloqueada', 'inativa'] as const).map((s) => <option key={s} value={s}>{EMPRESA_STATUS_LABEL[s]}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button iconLeft="ph:check-bold" disabled={!valido || salvando} onClick={salvar}>{salvando ? 'Salvando…' : 'Salvar alterações'}</Button>
      </div>
    </div>
  )
}

/* Formulário de novo contrato (renovação). Encerra o vigente e cria o novo —
   dado cadastral, sem cobrança (§12). */
function NovoContratoForm({ empresa, onClose, onSaved }: { empresa: MngEmpresa; onClose: () => void; onSaved: () => void }) {
  const vigente = empresa.contratos.find((c) => c.status === 'vigente')
  const nextDay = (iso: string) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10) }
  const anoDepois = (iso: string) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCFullYear(d.getUTCFullYear() + 1); d.setUTCDate(d.getUTCDate() - 1); return d.toISOString().slice(0, 10) }

  const inicioPadrao = vigente ? nextDay(vigente.fim) : ''
  const [plano, setPlano] = useState(vigente?.plano ?? PLANOS[0])
  const [colaboradoresContratados, setColaboradoresContratados] = useState(String(vigente?.colaboradoresContratados ?? empresa.colaboradoresContratados))
  const [inicio, setInicio] = useState(inicioPadrao)
  const [fim, setFim] = useState(inicioPadrao ? anoDepois(inicioPadrao) : '')
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  const onInicio = (v: string) => { setInicio(v); if (v) setFim(anoDepois(v)) }

  const datasOk = Boolean(inicio && fim) && fim > inicio
  const valido = Boolean(plano) && Number(colaboradoresContratados) > 0 && datasOk

  const inputCls = 'w-full rounded border-[1.5px] border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary'

  const salvar = async () => {
    if (!valido) return
    setSalvando(true)
    await mngEmpresaService.novoContrato(empresa.id, {
      plano, inicio, fim, colaboradoresContratados: Number(colaboradoresContratados),
    })
    setSalvando(false)
    setSucesso(true)
  }

  if (sucesso) {
    return (
      <div className="px-5 py-8 text-center lg:px-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-bg">
          <Icon icon="ph:check-circle-bold" width={30} className="text-success" aria-hidden />
        </div>
        <p className="mt-3 font-heading text-lg font-semibold text-ink">Contrato criado</p>
        <p className="mt-1 text-[13px] text-ink-secondary">O novo contrato de {empresa.nomeFantasia} está vigente{vigente ? ' e o anterior foi encerrado' : ''}.</p>

        <div className="mx-auto mt-5 max-w-sm rounded-lg border border-border bg-surface px-4 text-left">
          <Linha label="Plano" value={plano} />
          <Linha label="Vigência" value={`${fmtData(inicio)} — ${fmtData(fim)}`} />
          <Linha label="Colaboradores contratados" value={colaboradoresContratados} />
        </div>

        <Button fullWidth className="mt-6" onClick={onSaved}>Concluir</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
      {vigente && (
        <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-bg px-3 py-2.5 text-[12.5px] text-warning-ink">
          <Icon icon="ph:info-bold" width={15} className="mt-px shrink-0" aria-hidden />
          O contrato vigente (até {vigente.fim.split('-').reverse().join('/')}) será encerrado ao criar o novo.
        </div>
      )}

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-ink">Plano</span>
        <select className={inputCls} value={plano} onChange={(e) => setPlano(e.target.value)}>
          {PLANOS.map((p) => <option key={p}>{p}</option>)}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink">Data de início</span>
          <input type="date" className={inputCls} value={inicio} onChange={(e) => onInicio(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink">Data de término</span>
          <input type="date" className={inputCls} value={fim} min={inicio || undefined} onChange={(e) => setFim(e.target.value)} />
        </label>
      </div>
      {inicio && fim && !datasOk && <p className="-mt-2 text-[12.5px] text-danger-ink">O término deve ser posterior ao início.</p>}

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-ink">Nº de colaboradores contratados</span>
        <input type="number" min={1} className={inputCls} value={colaboradoresContratados} onChange={(e) => setColaboradoresContratados(e.target.value)} />
      </label>

      <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button iconLeft="ph:check-bold" disabled={!valido || salvando} onClick={salvar}>{salvando ? 'Criando…' : 'Criar contrato'}</Button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
   Aba Departamentos — só listagem. Quem cria/edita/exclui é o próprio RH
   da empresa (RH14Departamentos.tsx, do lado de dentro) — o Manager só
   acompanha, para poder referenciar o departamento nas abas Contatos e
   Usuários (dropdown). Sem ações aqui de propósito.
   ------------------------------------------------------------------ */
function AbaDepartamentos({ empresaId }: { empresaId: string }) {
  const deps = useService(() => mngDepartamentoEmpresaService.list(empresaId), [empresaId])

  return (
    <div className="mb-6">
      <div className="mb-3">
        <h2 className="text-[15px] font-semibold text-ink">Departamentos</h2>
        <p className="mt-0.5 text-[12px] text-ink-secondary">Gerenciados pelo RH da empresa — o Manager só acompanha.</p>
      </div>

      {deps.status === 'loading' && (
        <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-[64px] w-full rounded-lg" />)}</div>
      )}
      {deps.status === 'error' && <ErrorState message={deps.message} onRetry={deps.reload} />}
      {deps.status === 'success' && deps.data.length === 0 && (
        <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-8 text-center text-[13px] text-ink-muted">
          Nenhum departamento cadastrado ainda.
        </p>
      )}
      {deps.status === 'success' && deps.data.length > 0 && (
        <ul className="flex flex-col gap-2">
          {deps.data.map((d) => (
            <li key={d.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
                <Icon icon="ph:buildings-bold" width={20} aria-hidden />
              </span>
              <p className="min-w-0 flex-1 truncate font-heading text-sm font-semibold text-ink">{d.nome}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Opções de departamento para os droplists de Contatos e Usuários — a
   mesma lista da aba Departamentos (gerenciada pelo RH), aqui só como
   fonte de opções. `departamento` continua sendo o nome (string), não um
   id: nenhuma das duas telas guarda um vínculo com `MngDepartamentoEmpresa`,
   só reaproveita os nomes já cadastrados como valores possíveis. */
function useDepartamentosOpcoes(empresaId: string) {
  const deps = useService(() => mngDepartamentoEmpresaService.list(empresaId), [empresaId])
  return { opcoes: deps.status === 'success' ? deps.data.map((d) => ({ value: d.nome, label: d.nome })) : [] }
}

/* ------------------------------------------------------------------
   Aba Contatos — pessoas de referência na empresa cliente (não
   necessariamente usuárias da plataforma — isso é a aba Usuários).
   Departamento é droplist (`useDepartamentosOpcoes`, a mesma lista da aba
   Departamentos); os demais campos são texto livre.
   ------------------------------------------------------------------ */
function AbaContatos({ empresaId }: { empresaId: string }) {
  const contatos = useService(() => mngContatoEmpresaService.list(empresaId), [empresaId])
  const [form, setForm] = useState<{ inicial?: MngContatoEmpresa } | null>(null)

  const remover = (id: string) => { void mngContatoEmpresaService.remove(id).then(() => contatos.reload()) }

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-ink">Contatos</h2>
        <Button size="sm" iconLeft="ph:plus-bold" onClick={() => setForm({})}>Novo contato</Button>
      </div>

      {contatos.status === 'loading' && (
        <div className="flex flex-col gap-2">{[0, 1].map((i) => <Skeleton key={i} className="h-[92px] w-full rounded-lg" />)}</div>
      )}
      {contatos.status === 'error' && <ErrorState message={contatos.message} onRetry={contatos.reload} />}
      {contatos.status === 'success' && contatos.data.length === 0 && (
        <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-8 text-center text-[13px] text-ink-muted">
          Nenhum contato cadastrado ainda.
        </p>
      )}
      {contatos.status === 'success' && contatos.data.length > 0 && (
        <ul className="flex flex-col gap-2">
          {contatos.data.map((c) => (
            <li key={c.id} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
                <Icon icon="ph:address-book-bold" width={20} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-sm font-semibold text-ink">{c.nome}</p>
                <p className="truncate text-[12px] text-ink-secondary">{c.cargo}{c.cargo && c.departamento ? ' · ' : ''}{c.departamento}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-[12px] text-primary hover:underline dark:text-primary-300">
                    <Icon icon="ph:envelope-bold" width={12} aria-hidden /> {c.email}
                  </a>
                  {c.telefone && (
                    <a href={`tel:${c.telefone}`} className="flex items-center gap-1.5 text-[12px] text-ink-secondary hover:text-ink">
                      <Icon icon="ph:phone-bold" width={12} className="text-ink-muted" aria-hidden /> {c.telefone}
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={() => setForm({ inicial: c })}
                aria-label={`Editar ${c.nome}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
              >
                <Icon icon="ph:pencil-simple-bold" width={16} aria-hidden />
              </button>
              <button
                onClick={() => remover(c.id)}
                aria-label={`Remover ${c.nome}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill text-ink-muted transition-colors hover:bg-danger-bg hover:text-danger"
              >
                <Icon icon="ph:trash-bold" width={16} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={form !== null} onClose={() => setForm(null)} title={form?.inicial ? 'Editar contato' : 'Novo contato'} icon="ph:address-book-bold" size="md">
        {form && (
          <ContatoForm
            empresaId={empresaId}
            inicial={form.inicial}
            onClose={() => setForm(null)}
            onSaved={() => { setForm(null); contatos.reload() }}
          />
        )}
      </Sheet>
    </div>
  )
}

function ContatoForm({ empresaId, inicial, onClose, onSaved }: {
  empresaId: string; inicial?: MngContatoEmpresa; onClose: () => void; onSaved: () => void
}) {
  const [nome, setNome] = useState(inicial?.nome ?? '')
  const [cargo, setCargo] = useState(inicial?.cargo ?? '')
  const [departamento, setDepartamento] = useState(inicial?.departamento ?? '')
  const [telefone, setTelefone] = useState(inicial?.telefone ?? '')
  const [email, setEmail] = useState(inicial?.email ?? '')
  const [salvando, setSalvando] = useState(false)
  const departamentos = useDepartamentosOpcoes(empresaId)

  const valido = nome.trim().length > 1 && /\S+@\S+\.\S+/.test(email)

  const salvar = async () => {
    if (!valido) return
    setSalvando(true)
    const p = { nome: nome.trim(), cargo: cargo.trim(), departamento, telefone: telefone.trim(), email: email.trim() }
    if (inicial) await mngContatoEmpresaService.update(inicial.id, p)
    else await mngContatoEmpresaService.create(empresaId, p)
    onSaved()
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
      <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ex.: Head de DHO" />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-ink">Departamento</label>
          <Select
            value={departamento}
            onChange={setDepartamento}
            ariaLabel="Departamento"
            options={departamentos.opcoes}
            className={departamentos.opcoes.length === 0 ? 'pointer-events-none opacity-50' : undefined}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 98812-4431" />
        <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button iconLeft="ph:check-bold" disabled={!valido || salvando} onClick={salvar}>
          {salvando ? 'Salvando…' : inicial ? 'Salvar alterações' : 'Adicionar contato'}
        </Button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
   Aba Usuários — só listagem, mesmo critério da aba Departamentos:
   quem acessa a área de RH da empresa (Master/Operador) é cadastrado
   pelo próprio RH, não pelo Manager. Aqui só se acompanha quem tem
   acesso e com qual perfil.
   ------------------------------------------------------------------ */
const PERFIL_RH_LABEL: Record<MngUsuarioRhPerfil, string> = { master: 'Master', operador: 'Operador' }

function AbaUsuarios({ empresaId }: { empresaId: string }) {
  const usuarios = useService(() => mngUsuarioRhService.list(empresaId), [empresaId])

  return (
    <div className="mb-6">
      <div className="mb-3">
        <h2 className="text-[15px] font-semibold text-ink">Usuários</h2>
        <p className="mt-0.5 text-[12px] text-ink-secondary">Gerenciados pelo RH da empresa — o Manager só acompanha.</p>
      </div>

      {usuarios.status === 'loading' && (
        <div className="flex flex-col gap-2">{[0, 1].map((i) => <Skeleton key={i} className="h-[72px] w-full rounded-lg" />)}</div>
      )}
      {usuarios.status === 'error' && <ErrorState message={usuarios.message} onRetry={usuarios.reload} />}
      {usuarios.status === 'success' && usuarios.data.length === 0 && (
        <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-8 text-center text-[13px] text-ink-muted">
          Nenhum usuário cadastrado ainda.
        </p>
      )}
      {usuarios.status === 'success' && usuarios.data.length > 0 && (
        <ul className="flex flex-col gap-2">
          {usuarios.data.map((u) => (
            <li key={u.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
              <Avatar initials={u.initials} size={40} palette={u.palette} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-sm font-semibold text-ink">{u.nome}</p>
                <p className="truncate text-[12px] text-ink-secondary">{u.cargo}{u.cargo && u.departamento ? ' · ' : ''}{u.departamento}</p>
                <p className="truncate text-[12px] text-ink-muted">{u.email}</p>
              </div>
              <Badge tone={u.perfil === 'master' ? 'primary' : 'neutral'} className="shrink-0">{PERFIL_RH_LABEL[u.perfil]}</Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
