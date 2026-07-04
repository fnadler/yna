import { useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { MngTopBar } from '../../components/MngTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { FiltrosBar } from '../../components/FiltrosBar'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { useMng } from '../../contexts/MngContext'
import { mngGestorService } from '../../services/mng'
import { PERFIL_GESTOR_LABEL } from '../../data/mngMock'
import type { MngGestor } from '../../types'

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
const fmtData = (iso?: string) => { if (!iso) return '—'; const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}` }
// Perfis em ordem alfabética (por rótulo). Super-admin é marcado pelo checkbox.
const PERFIS_TODOS = (Object.keys(PERFIL_GESTOR_LABEL) as MngGestor['perfil'][]).sort((a, b) => PERFIL_GESTOR_LABEL[a].localeCompare(PERFIL_GESTOR_LABEL[b], 'pt-BR'))
const PERFIS_FUNCIONAIS = PERFIS_TODOS.filter((p) => p !== 'super-admin')

const STATUS_TONE: Record<MngGestor['status'], 'success' | 'warning' | 'neutral'> = { ativo: 'success', convidado: 'warning', inativo: 'neutral' }
const STATUS_LABEL: Record<MngGestor['status'], string> = { ativo: 'Ativo', convidado: 'Convidado', inativo: 'Inativo' }
const STATUS_OPCOES: MngGestor['status'][] = ['ativo', 'convidado', 'inativo']
const inputCls = 'w-full rounded border-[1.5px] border-border bg-surface px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-primary'

/* MNG-18 — Usuários do backoffice e permissões (§8.3). */
export function Mng18Gestores() {
  const gestores = useService(() => mngGestorService.list(), [])
  const { isSuperAdmin } = useMng()
  const [nome, setNome] = useState('')
  const [perfil, setPerfil] = useState<'todos' | MngGestor['perfil']>('todos')
  const [statusF, setStatusF] = useState<'todos' | MngGestor['status']>('todos')
  const [novo, setNovo] = useState(false)
  const [sel, setSel] = useState<MngGestor | null>(null)

  const dados = gestores.status === 'success' ? gestores.data : []
  const lista = useMemo(() => dados.filter((g) =>
    (!nome.trim() || norm(g.nome).includes(norm(nome.trim()))) &&
    (perfil === 'todos' || g.perfil === perfil) &&
    (statusF === 'todos' || g.status === statusF)
  ), [dados, nome, perfil, statusF])
  const ativos = [nome.trim() !== '', perfil !== 'todos', statusF !== 'todos'].filter(Boolean).length
  const limpar = () => { setNome(''); setPerfil('todos'); setStatusF('todos') }

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MngTopBar />
        <PageHeader
          title="Usuários" subtitle="Perfis, permissões e acesso ao backoffice." className="mt-2 lg:mt-0"
          action={isSuperAdmin ? <Button variant="secondary" iconLeft="ph:plus-bold" onClick={() => setNovo(true)}><span className="hidden sm:inline">Novo usuário</span></Button> : undefined}
        />

        {gestores.status === 'loading' && <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>}
        {gestores.status === 'error' && <ErrorState message={gestores.message} onRetry={gestores.reload} />}
        {gestores.status === 'success' && (
          <>
            {/* Filtros */}
            <FiltrosBar ativos={ativos} onLimpar={limpar}>
              <label className="block min-w-0 lg:flex-1">
                <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-muted">Nome</span>
                <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Buscar por nome…" className={inputCls} />
              </label>
              <label className="block min-w-0 lg:w-56">
                <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-muted">Perfil</span>
                <div className="relative">
                  <select value={perfil} onChange={(e) => setPerfil(e.target.value as typeof perfil)} className={`${inputCls} appearance-none pr-8`}>
                    <option value="todos">Todos os perfis</option>
                    {PERFIS_TODOS.map((p) => <option key={p} value={p}>{PERFIL_GESTOR_LABEL[p]}</option>)}
                  </select>
                  <Icon icon="ph:caret-down-bold" width={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden />
                </div>
              </label>
              <label className="block min-w-0 lg:w-44">
                <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-muted">Status</span>
                <div className="relative">
                  <select value={statusF} onChange={(e) => setStatusF(e.target.value as typeof statusF)} className={`${inputCls} appearance-none pr-8`}>
                    <option value="todos">Todos</option>
                    {STATUS_OPCOES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </select>
                  <Icon icon="ph:caret-down-bold" width={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden />
                </div>
              </label>
            </FiltrosBar>

            {/* Lista */}
            <div className="mt-4 flex flex-col gap-2">
              {lista.map((g) => (
                <button key={g.id} onClick={() => setSel(g)} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 text-left transition-colors hover:border-border-strong">
                  <Avatar initials={g.initials} size={40} palette={g.palette} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate font-heading text-sm font-semibold text-ink">
                      {g.nome}
                      {g.superAdmin && <span className="inline-flex items-center gap-1 rounded-pill bg-primary-50 px-1.5 py-0.5 text-[10px] font-semibold text-primary dark:text-primary-300"><Icon icon="ph:crown-simple-bold" width={10} aria-hidden /> Super</span>}
                    </p>
                    <p className="truncate text-[12.5px] text-ink-secondary">{PERFIL_GESTOR_LABEL[g.perfil]} · {g.email}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {g.mfa && <span title="MFA ativo" className="text-success-ink"><Icon icon="ph:lock-key-bold" width={16} aria-hidden /></span>}
                    <Badge tone={STATUS_TONE[g.status]}>{STATUS_LABEL[g.status]}</Badge>
                  </div>
                </button>
              ))}
              {lista.length === 0 && <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-sm text-ink-secondary">Nenhum usuário para os filtros selecionados.</div>}
            </div>
          </>
        )}

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-surface-2/60 px-4 py-3 text-[12.5px] text-ink-secondary">
          <Icon icon="ph:shield-check-bold" width={16} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
          Apenas Super-Admin cria outros usuários. MFA é obrigatório e todas as ações sensíveis geram log de auditoria (LGPD).
        </div>
      </div>

      <NovoUsuarioModal open={novo} onClose={() => setNovo(false)} onCriado={() => { setNovo(false); gestores.reload() }} />
      <UsuarioDetalheModal gestor={sel} onClose={() => setSel(null)} onInativado={() => { setSel(null); gestores.reload() }} />
    </div>
  )
}

/* ── Modal: novo usuário (convite) ── */
function NovoUsuarioModal({ open, onClose, onCriado }: { open: boolean; onClose: () => void; onCriado: () => void }) {
  const [form, setForm] = useState({ nome: '', email: '', perfil: PERFIS_FUNCIONAIS[0] as MngGestor['perfil'], superAdmin: false })
  const [enviado, setEnviado] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }))
  const valido = form.nome.trim().length >= 3 && /\S+@\S+\.\S+/.test(form.email)

  const fechar = () => { onClose(); setTimeout(() => { setEnviado(false); setForm({ nome: '', email: '', perfil: PERFIS_FUNCIONAIS[0], superAdmin: false }) }, 200) }
  const enviar = async () => {
    if (!valido) return
    setSalvando(true)
    await mngGestorService.criar({ nome: form.nome, email: form.email, perfil: form.perfil, superAdmin: form.superAdmin })
    setSalvando(false)
    setEnviado(true)
  }

  return (
    <Modal open={open} title="Novo usuário" onClose={fechar}>
      {enviado ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-bg"><Icon icon="ph:paper-plane-tilt-bold" width={28} className="text-success" aria-hidden /></div>
          <div>
            <p className="font-heading text-base font-semibold text-ink">Convite enviado</p>
            <p className="mt-1 text-[13px] text-ink-secondary">Enviamos um convite para <span className="font-medium text-ink">{form.email}</span> criar a conta e acessar o sistema.</p>
          </div>
          <Button fullWidth onClick={() => { onCriado(); fechar() }}>Concluir</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Campo label="Nome completo"><input value={form.nome} onChange={(e) => set('nome', e.target.value)} className={fieldCls} placeholder="Nome do usuário" /></Campo>
          <Campo label="E-mail"><input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={fieldCls} placeholder="nome@yna.com.br" /></Campo>
          <Campo label="Perfil">
            <div className="relative">
              <select value={form.perfil} onChange={(e) => set('perfil', e.target.value as MngGestor['perfil'])} className={`${fieldCls} appearance-none pr-9`}>
                {PERFIS_FUNCIONAIS.map((p) => <option key={p} value={p}>{PERFIL_GESTOR_LABEL[p]}</option>)}
              </select>
              <Icon icon="ph:caret-down-bold" width={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden />
            </div>
          </Campo>
          <button onClick={() => set('superAdmin', !form.superAdmin)} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3 text-left transition-colors hover:bg-surface-hover">
            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-[1.5px] transition-colors ${form.superAdmin ? 'border-primary bg-primary text-white' : 'border-border-strong bg-surface'}`}>
              {form.superAdmin && <Icon icon="ph:check-bold" width={12} aria-hidden />}
            </span>
            <span className="text-[13px] leading-relaxed text-ink-secondary">Marcar como <span className="font-semibold text-ink">Super-Admin</span> — acesso total, inclusive à gestão de usuários.</span>
          </button>
          <div className="flex items-center gap-2 rounded-lg bg-surface-2/60 px-3 py-2.5 text-[12px] text-ink-secondary">
            <Icon icon="ph:envelope-simple-bold" width={15} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
            Ao concluir, enviamos um convite por e-mail para a pessoa criar a conta.
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={fechar}>Cancelar</Button>
            <Button fullWidth disabled={!valido || salvando} iconLeft="ph:paper-plane-tilt-bold" onClick={enviar}>{salvando ? 'Enviando…' : 'Enviar convite'}</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

/* ── Modal: detalhe do usuário + inativar ── */
function UsuarioDetalheModal({ gestor, onClose, onInativado }: { gestor: MngGestor | null; onClose: () => void; onInativado: () => void }) {
  const [salvando, setSalvando] = useState(false)
  const inativar = async () => {
    if (!gestor) return
    setSalvando(true)
    await mngGestorService.inativar(gestor.id)
    setSalvando(false)
    onInativado()
  }

  return (
    <Modal open={gestor !== null} title="Usuário" onClose={onClose}>
      {gestor && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Avatar initials={gestor.initials} size={52} palette={gestor.palette} />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 font-heading text-base font-semibold text-ink">
                {gestor.nome}
                {gestor.superAdmin && <span className="inline-flex items-center gap-1 rounded-pill bg-primary-50 px-1.5 py-0.5 text-[10px] font-semibold text-primary dark:text-primary-300"><Icon icon="ph:crown-simple-bold" width={10} aria-hidden /> Super</span>}
              </p>
              <p className="truncate text-[13px] text-ink-secondary">{gestor.email}</p>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-border bg-surface-2/40 p-4 text-[13px]">
            <div><dt className="text-[11px] uppercase tracking-wide text-ink-muted">Perfil</dt><dd className="text-ink">{PERFIL_GESTOR_LABEL[gestor.perfil]}</dd></div>
            <div><dt className="text-[11px] uppercase tracking-wide text-ink-muted">Status</dt><dd><Badge tone={STATUS_TONE[gestor.status]}>{STATUS_LABEL[gestor.status]}</Badge></dd></div>
            <div><dt className="text-[11px] uppercase tracking-wide text-ink-muted">MFA</dt><dd className="text-ink">{gestor.mfa ? 'Ativo' : 'Pendente'}</dd></div>
            <div><dt className="text-[11px] uppercase tracking-wide text-ink-muted">Último acesso</dt><dd className="text-ink">{fmtData(gestor.ultimoAcesso)}</dd></div>
          </dl>

          {gestor.status === 'inativo' ? (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2/40 px-4 py-3 text-[13px] text-ink-secondary"><Icon icon="ph:prohibit-bold" width={16} aria-hidden /> Usuário inativo — sem acesso ao backoffice.</div>
          ) : (
            <Button fullWidth variant="secondary" iconLeft="ph:user-minus-bold" disabled={salvando} onClick={inativar}>{salvando ? 'Inativando…' : 'Inativar usuário'}</Button>
          )}
        </div>
      )}
    </Modal>
  )
}

const fieldCls = 'w-full rounded border-[1.5px] border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary'
function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[13px] font-semibold text-ink">{label}</span>{children}</label>
}
