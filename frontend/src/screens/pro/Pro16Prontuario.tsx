import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'
import { Textarea } from '../../components/Textarea'
import { Skeleton } from '../../components/Skeleton'
import { useService } from '../../hooks/useService'
import { proSessionService, proProntuarioService } from '../../services/pro'

/* PRO-16 — registro de prontuário pós-sessão.
   Conteúdo de Sheet: abre logo após a sessão (PRO-15/PRO-18) e também a
   partir das pendências (PRO-12/PRO-13). Mesma lógica de modal de ação do
   fluxo do beneficiário (ex.: feedback pós-sessão no BEN-17). */
export function ProntuarioForm({ sessionId, onDone, onCancel }: {
  sessionId: string
  onDone: () => void
  onCancel: () => void
}) {
  const session = useService(() => proSessionService.get(sessionId), [sessionId])

  const [conteudo, setConteudo] = useState('')
  const [draft, setDraft] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [submitting, setSubmitting] = useState(false)

  // Salvamento automático de rascunho (RF-PR-07.3)
  useEffect(() => {
    if (!conteudo) { setDraft('idle'); return }
    setDraft('saving')
    const t = setTimeout(() => setDraft('saved'), 800)
    return () => clearTimeout(t)
  }, [conteudo])

  const apelido = session.status === 'success' ? session.data?.beneficiarioApelido ?? 'beneficiário' : ''

  const finalizar = async () => {
    if (!conteudo.trim()) return
    setSubmitting(true)
    await proProntuarioService.save({
      sessionId,
      beneficiarioApelido: apelido,
      date: new Date().toLocaleDateString('pt-BR'),
      conteudo: conteudo.trim(),
      finalizado: true,
    })
    onDone()
  }

  return (
    <div className="px-5 py-6 lg:px-6">
      <p className="text-sm leading-relaxed text-ink-secondary">
        {session.status === 'success' && session.data ? `Sessão com ${session.data.beneficiarioApelido}. ` : ''}
        O registro é obrigatório: a sessão só é concluída depois de preenchido. Fica privado entre você e a plataforma.
      </p>

      <div className="mt-5">
        {session.status === 'loading' ? (
          <Skeleton className="h-[180px] w-full rounded" />
        ) : (
          <Textarea
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            placeholder="Como foi a sessão. Aspectos relevantes do paciente. Encaminhamentos."
            className="min-h-[200px]"
            aria-label="Conteúdo do prontuário"
          />
        )}

        {/* Indicador de rascunho */}
        <div className="mt-2 flex h-5 items-center gap-1.5 text-[12.5px] text-ink-muted" aria-live="polite">
          {draft === 'saving' && (<><Icon icon="ph:circle-notch-bold" width={13} className="animate-spin" aria-hidden /> Salvando rascunho…</>)}
          {draft === 'saved' && (<><Icon icon="ph:check-bold" width={13} className="text-success" aria-hidden /> Rascunho salvo</>)}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Button size="lg" fullWidth disabled={!conteudo.trim() || submitting} iconRight="ph:check-bold" onClick={finalizar}>
          {submitting ? 'Concluindo…' : 'Finalizar e concluir sessão'}
        </Button>
        <Button variant="ghost" fullWidth disabled={submitting} onClick={onCancel}>
          Salvar rascunho e sair
        </Button>
      </div>

      <p className="mt-4 flex items-start gap-2 text-[12.5px] text-ink-muted">
        <Icon icon="ph:info-bold" width={14} className="mt-0.5 shrink-0" aria-hidden />
        Se sair sem finalizar, a sessão fica como pendente no seu painel e na agenda.
      </p>
    </div>
  )
}
