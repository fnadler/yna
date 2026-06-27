import { useState } from 'react'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Sheet } from '../../components/Sheet'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { useRh } from '../../contexts/RhContext'
import { rhEquipeService } from '../../services/rh'
import type { RhPapel } from '../../types'

/* RH-15 — Gestão da equipe de RH: Masters e Operadores (Seção 5.3).
   Apenas Master cria/remove usuários (RN-RH-03.1). Operador tem permissões
   limitadas (CRUD de beneficiários). */

const PAPEL_DESC: Record<RhPapel, string> = {
  master: 'Acesso completo à gestão da empresa, indicadores e equipe.',
  operador: 'Cadastro, edição e exclusão de beneficiários.',
}

export function RH15Equipe() {
  const { isMaster, usuario } = useRh()
  const equipe = useService(() => rhEquipeService.list(), [])
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />
        <PageHeader
          title="Equipe RH"
          subtitle="Quem administra o painel da sua empresa."
          className="mt-2 lg:mt-0"
          action={isMaster ? <Button iconLeft="ph:user-plus-bold" onClick={() => setOpen(true)}>Convidar</Button> : undefined}
        />

        {/* Cartões explicativos de papéis */}
        <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(['master', 'operador'] as RhPapel[]).map((p) => (
            <div key={p} className="flex gap-3 rounded-lg border border-border bg-surface p-4">
              <Icon icon={p === 'master' ? 'ph:crown-bold' : 'ph:user-gear-bold'} width={20} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
              <div>
                <p className="font-heading text-sm font-semibold capitalize text-ink">{p}</p>
                <p className="mt-0.5 text-[12px] text-ink-secondary">{PAPEL_DESC[p]}</p>
              </div>
            </div>
          ))}
        </div>

        {equipe.status === 'loading' && (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-[68px] w-full rounded-lg" />)}
          </div>
        )}
        {equipe.status === 'error' && <ErrorState message={equipe.message} onRetry={equipe.reload} />}

        {equipe.status === 'success' && (
          <ul className="flex flex-col gap-2">
            {equipe.data.map((u) => (
              <li key={u.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
                <Avatar initials={u.initials} size={40} palette={u.palette} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-heading text-sm font-semibold text-ink">
                    {u.nome}
                    {u.id === usuario.id && <span className="ml-2 text-[11px] font-normal text-ink-muted">(você)</span>}
                  </p>
                  <p className="truncate text-[12px] text-ink-secondary">{u.email}</p>
                </div>
                <Badge tone={u.papel === 'master' ? 'primary' : 'neutral'} className="shrink-0 capitalize">{u.papel}</Badge>
                {u.status === 'convidado' && <Badge tone="warning" className="hidden shrink-0 sm:inline-flex">Convidado</Badge>}
                {isMaster && u.id !== usuario.id && (
                  <button
                    onClick={() => rhEquipeService.remove(u.id).then(() => equipe.reload())}
                    aria-label={`Remover ${u.nome}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill text-ink-muted transition-colors hover:bg-danger-bg hover:text-danger"
                  >
                    <Icon icon="ph:trash-bold" width={16} aria-hidden />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {!isMaster && (
          <div className="mt-5 flex gap-3 rounded-lg border border-border bg-surface-2 p-4">
            <Icon icon="ph:lock-simple-bold" width={20} className="mt-0.5 shrink-0 text-ink-muted" aria-hidden />
            <p className="text-[12px] leading-relaxed text-ink-secondary">
              Apenas usuários Master podem convidar ou remover membros da equipe de RH.
            </p>
          </div>
        )}
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Convidar para a equipe" icon="ph:user-plus-bold" size="md">
        <ConvidarForm onDone={() => { setOpen(false); equipe.reload() }} />
      </Sheet>
    </div>
  )
}

function ConvidarForm({ onDone }: { onDone: () => void }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [papel, setPapel] = useState<RhPapel>('operador')
  const [saving, setSaving] = useState(false)
  const valido = nome.trim().length > 2 && /\S+@\S+\.\S+/.test(email)

  const submit = async () => {
    setSaving(true)
    await rhEquipeService.invite({ nome, email, papel })
    setSaving(false)
    onDone()
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
      <p className="text-[13px] leading-relaxed text-ink-secondary">
        A pessoa recebe um e-mail com link de primeiro acesso para definir a própria senha.
      </p>
      <Input label="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} />
      <Input label="E-mail corporativo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@empresa.com" />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-ink">Papel</label>
        <Select value={papel} onChange={(v) => setPapel(v as RhPapel)} ariaLabel="Papel" options={[{ value: 'operador', label: 'Operador' }, { value: 'master', label: 'Master (Admin RH)' }]} />
        <p className="text-xs text-ink-muted">{PAPEL_DESC[papel]}</p>
      </div>
      <Button fullWidth disabled={!valido || saving} iconRight={saving ? undefined : 'ph:paper-plane-tilt-bold'} onClick={submit}>
        {saving ? 'Enviando…' : 'Enviar convite'}
      </Button>
    </div>
  )
}
