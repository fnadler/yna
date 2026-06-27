import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import { Textarea } from '../../components/Textarea'
import { proSessionService } from '../../services/pro'
import type { ProSession } from '../../types'

const SLOTS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
const fmtData = (d: string, t: string) => `${d.split('-').slice(1).reverse().join('/')} às ${t}`

/* Conteúdo do modal de editar/remarcar uma sessão, com fluxo de cancelamento.
   Reutilizado na Agenda (PRO-13) e na home (PRO-12). */
export function EditarSessao({ session, onClose, onChanged }: {
  session: ProSession
  onClose: () => void
  onChanged?: () => void
}) {
  const [mode, setMode] = useState<'edit' | 'cancel'>('edit')
  const [date, setDate] = useState(session.date)
  const [time, setTime] = useState(session.time)
  const [motivo, setMotivo] = useState('')
  const [saved, setSaved] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const salvar = () => {
    setSaved(true)
    setTimeout(onClose, 700)
  }

  const confirmarCancelamento = async () => {
    setCancelling(true)
    await proSessionService.cancel(session.id)
    onChanged?.()
    onClose()
  }

  /* ── Passo de confirmação do cancelamento ── */
  if (mode === 'cancel') {
    return (
      <div className="flex flex-col gap-5 px-5 py-6 lg:px-6">
        <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger-bg px-4 py-3 text-[13px] text-danger-ink">
          <Icon icon="ph:warning-bold" width={16} className="mt-0.5 shrink-0" aria-hidden />
          O beneficiário será avisado do cancelamento. Esta ação não pode ser desfeita.
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-3">
          <Avatar initials={session.beneficiarioInitials} size={40} palette={session.beneficiarioPalette} />
          <div className="min-w-0">
            <p className="font-heading text-sm font-semibold text-ink">{session.beneficiarioApelido}</p>
            <p className="text-[13px] text-ink-secondary">{fmtData(session.date, session.time)}</p>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block font-heading text-[13px] font-semibold text-ink">Motivo (opcional)</label>
          <Textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Compartilhe o motivo, se quiser." />
        </div>

        <Button variant="danger" size="lg" fullWidth disabled={cancelling} iconLeft="ph:x-circle-bold" onClick={confirmarCancelamento}>
          {cancelling ? 'Cancelando…' : 'Confirmar cancelamento'}
        </Button>
        <button
          onClick={() => setMode('edit')}
          disabled={cancelling}
          className="font-heading text-sm font-medium text-ink-secondary transition-colors hover:text-ink disabled:opacity-50"
        >
          Voltar
        </button>
      </div>
    )
  }

  /* ── Edição / remarcação ── */
  return (
    <div className="flex flex-col gap-5 px-5 py-6 lg:px-6">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-3">
        <Avatar initials={session.beneficiarioInitials} size={40} palette={session.beneficiarioPalette} />
        <div className="min-w-0">
          <p className="font-heading text-sm font-semibold text-ink">{session.beneficiarioApelido}</p>
          <p className="text-[13px] text-ink-secondary">Sessão de {session.durationMin ?? 50} min</p>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block font-heading text-[13px] font-semibold text-ink">Data</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block font-heading text-[13px] font-semibold text-ink">Horário</label>
        <div className="flex flex-wrap gap-2">
          {SLOTS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTime(t)}
              aria-pressed={t === time}
              className={`rounded-pill border-[1.5px] px-3 py-1.5 font-mono text-[13px] transition-colors ${
                t === time ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-ink-secondary hover:border-border-strong'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <Button size="lg" fullWidth iconLeft={saved ? 'ph:check-bold' : undefined} onClick={salvar}>
        {saved ? 'Alteração salva' : 'Salvar alteração'}
      </Button>
      <button
        onClick={() => setMode('cancel')}
        className="flex items-center justify-center gap-1.5 font-heading text-sm font-medium text-ink-secondary transition-colors hover:text-danger"
      >
        <Icon icon="ph:x-circle-bold" width={16} aria-hidden />
        Cancelar sessão
      </button>
    </div>
  )
}
