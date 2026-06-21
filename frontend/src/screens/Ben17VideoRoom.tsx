import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Modal } from '../components/Modal'
import { Sheet } from '../components/Sheet'
import { SessionRoom } from '../components/SessionRoom'
import { Ben14Agendamento } from './Ben14Agendamento'
import { Ben15Confirmacao } from './Ben15Confirmacao'
import { Ben18Feedback } from './Ben18Feedback'
import { Ben19Decisao } from './Ben19Decisao'
import { Ben20Rematch } from './Ben20Rematch'

type PostSheet =
  | { type: 'feedback' }
  | { type: 'decision' }
  | { type: 'schedule' }
  | { type: 'schedule-confirmation' }
  | { type: 'rematch' }
  | null

export function Ben17VideoRoom() {
  useParams<{ id: string }>()
  const navigate = useNavigate()
  const [helpOpen, setHelpOpen] = useState(false)
  const [postSheet, setPostSheet] = useState<PostSheet>(null)

  const postSheetTitle =
    postSheet?.type === 'feedback' ? 'Como foi a sessão?'
    : postSheet?.type === 'decision' ? 'E agora?'
    : postSheet?.type === 'schedule' ? 'Agendar próxima sessão'
    : postSheet?.type === 'schedule-confirmation' ? 'Sessão agendada'
    : postSheet?.type === 'rematch' ? 'Conhecer outros profissionais'
    : ''

  const postSheetIcon =
    postSheet?.type === 'feedback' ? 'ph:heart-bold'
    : postSheet?.type === 'decision' ? 'ph:arrows-split-bold'
    : postSheet?.type === 'schedule' ? 'ph:calendar-plus-bold'
    : postSheet?.type === 'schedule-confirmation' ? 'ph:calendar-check-bold'
    : postSheet?.type === 'rematch' ? 'ph:users-bold'
    : undefined

  return (
    <>
      <SessionRoom
        role="beneficiario"
        peer={{ name: 'Dra. Ana Beltrão', initials: 'AB', palette: 'lavender', status: 'Conectada · áudio e vídeo estáveis' }}
        self={{ initials: 'M', palette: 'pink' }}
        onEnd={() => setPostSheet({ type: 'feedback' })}
        onEmergency={() => setHelpOpen(true)}
      />

      {/* Pós-sessão — feedback, decisão, agendamento, rematch */}
      <Sheet
        open={postSheet !== null}
        onClose={() => { setPostSheet(null); navigate('/home') }}
        title={postSheetTitle}
        icon={postSheetIcon}
        iconColor={postSheet?.type === 'schedule-confirmation' ? 'text-success' : undefined}
        size="md"
      >
        {postSheet?.type === 'feedback' && (
          <Ben18Feedback
            onSubmitted={() => setPostSheet({ type: 'decision' })}
            onSkipped={() => setPostSheet({ type: 'decision' })}
          />
        )}
        {postSheet?.type === 'decision' && (
          <Ben19Decisao
            onSchedule={() => setPostSheet({ type: 'schedule' })}
            onRematch={() => setPostSheet({ type: 'rematch' })}
            onDecideLater={() => { setPostSheet(null); navigate('/home') }}
          />
        )}
        {postSheet?.type === 'schedule' && (
          <Ben14Agendamento
            proId="pro-1"
            onConfirm={() => setPostSheet({ type: 'schedule-confirmation' })}
            onBack={() => setPostSheet({ type: 'decision' })}
          />
        )}
        {postSheet?.type === 'schedule-confirmation' && (
          <Ben15Confirmacao onDone={() => { setPostSheet(null); navigate('/home') }} />
        )}
        {postSheet?.type === 'rematch' && (
          <Ben20Rematch
            onConfirm={() => { setPostSheet(null); navigate('/matches/carregando') }}
            onBack={() => setPostSheet({ type: 'decision' })}
          />
        )}
      </Sheet>

      {/* Modal de ajuda / emergência */}
      <Modal open={helpOpen} title="Precisa de ajuda?" onClose={() => setHelpOpen(false)}>
        <p className="mb-4 text-sm leading-relaxed">
          Se algo não estiver bem durante a sessão, você não precisa esperar.
        </p>
        <button
          onClick={() => { setHelpOpen(false); navigate('/emergencia') }}
          className="flex w-full min-h-[52px] items-center gap-3 rounded-lg border-[1.5px] border-danger/40 bg-danger-bg px-4 font-heading text-sm font-semibold text-danger-ink transition-colors hover:border-danger"
        >
          <Icon icon="ph:lifebuoy-bold" width={20} aria-hidden />
          <div className="text-left">
            <p>Acionar suporte de emergência</p>
            <p className="text-xs font-normal text-ink-muted">CVV · SAMU · plantonista YNA</p>
          </div>
        </button>
      </Modal>
    </>
  )
}
