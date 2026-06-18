import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { Sheet } from '../components/Sheet'
import { YnaIcon } from '../components/YnaIcons'
import { Ben14Agendamento } from './Ben14Agendamento'
import { Ben15Confirmacao } from './Ben15Confirmacao'
import { Ben18Feedback } from './Ben18Feedback'
import { Ben19Decisao } from './Ben19Decisao'
import { Ben20Rematch } from './Ben20Rematch'

const WARN_AT = 5

type PostSheet =
  | { type: 'feedback' }
  | { type: 'decision' }
  | { type: 'schedule' }
  | { type: 'schedule-confirmation' }
  | { type: 'rematch' }
  | null

export function Ben17VideoRoom() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [muted, setMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [minutesLeft] = useState(32)
  const [showWarning, setShowWarning] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [postSheet, setPostSheet] = useState<PostSheet>(null)

  useEffect(() => {
    const t = setTimeout(() => setShowWarning(true), 3000)
    return () => clearTimeout(t)
  }, [])

  const handleEndSession = () => {
    setSessionEnded(true)
    setPostSheet({ type: 'feedback' })
  }

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
    <div className="relative flex h-dvh flex-col bg-[#14122A] lg:flex-row">
      {/* Professional video area */}
      <div
        className="absolute inset-0 lg:static lg:flex-1"
        role="img"
        aria-label="Vídeo da Dra. Ana Beltrão"
        style={{ background: 'radial-gradient(circle at 50% 38%, #3A3C8E 0%, #28265A 45%, #14122A 100%)' }}
      >
        <div className="flex h-full flex-col items-center justify-center gap-3 pb-24 lg:pb-0">
          <Avatar initials="AB" size={104} palette="lavender" />
          <p className="text-base font-semibold text-[#F2EFF8]">Dra. Ana Beltrão</p>
          <p className="flex items-center gap-1.5 text-[13px] text-[#B4AEC9]">
            <span className="h-2 w-2 rounded-pill bg-[#6FC4A8]" aria-hidden />
            Conectada · áudio e vídeo estáveis
          </p>
        </div>

        {/* Session ended overlay */}
        {sessionEnded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[rgba(20,18,42,0.80)]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)]">
              <Icon icon="ph:phone-disconnect-bold" width={28} className="text-[#DCD4F0]" aria-hidden />
            </div>
            <p className="text-[15px] font-medium text-[#DCD4F0]">Sessão encerrada</p>
          </div>
        )}
      </div>

      {/* Top bar */}
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 px-4 pt-12 lg:pt-6">
        <span className="flex items-center gap-2 rounded-pill bg-[rgba(20,18,42,0.72)] px-3.5 py-2 text-xs font-medium text-[#DCD4F0] backdrop-blur-sm">
          <Icon icon="ph:lock-bold" width={14} className="text-[#6FC4A8]" aria-hidden />
          Sessão privada e segura · criptografada
        </span>
        <span
          className={`rounded-pill px-3.5 py-2 font-mono text-xs font-medium backdrop-blur-sm ${
            minutesLeft <= WARN_AT
              ? 'bg-warning-bg text-warning-ink'
              : 'bg-[rgba(20,18,42,0.72)] text-[#B4AEC9]'
          }`}
          aria-label={`Tempo restante da sessão: ${minutesLeft} minutos`}
        >
          {minutesLeft} min restantes
        </span>
      </header>

      <p className="absolute inset-x-0 top-[72px] z-10 hidden px-4 text-center text-[11.5px] text-[rgba(220,212,240,0.62)] lg:block">
        Esta conversa é só de vocês. Nada aqui é gravado.
      </p>

      {showWarning && minutesLeft <= WARN_AT && (
        <div className="absolute inset-x-4 top-24 z-20 rounded-lg bg-warning-bg px-4 py-3 text-center text-sm font-medium text-warning-ink">
          Faltam {minutesLeft} minutos para encerrar. Combine o que precisa agora.
        </div>
      )}

      {/* Self-view */}
      <div
        className="absolute bottom-[150px] right-4 z-10 flex h-[150px] w-[104px] items-center justify-center overflow-hidden rounded-lg border border-[rgba(220,212,240,0.25)] bg-[#221F44] shadow-lg lg:bottom-20"
        role="img"
        aria-label="Sua câmera"
      >
        {cameraOff ? (
          <Icon icon="ph:video-camera-slash-bold" width={24} className="text-[#807A99]" aria-hidden />
        ) : (
          <Avatar initials="M" size={48} palette="pink" />
        )}
        <span className="absolute bottom-1.5 left-1.5 rounded-pill bg-[rgba(20,18,42,0.7)] px-2 py-0.5 text-[10px] font-medium text-[#DCD4F0]">
          Você
        </span>
      </div>

      {/* Help button */}
      <button
        onClick={() => setHelpOpen(true)}
        className="absolute bottom-[110px] left-4 z-10 flex min-h-[44px] items-center gap-2 rounded-pill bg-[rgba(20,18,42,0.72)] px-4 font-heading text-[13px] font-medium text-[#DCD4F0] backdrop-blur-sm transition-colors hover:bg-[rgba(42,39,80,0.85)]"
      >
        <Icon icon="ph:lifebuoy-bold" width={16} aria-hidden />
        Precisa de ajuda?
      </button>

      {/* Controls */}
      <footer className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-3 pb-9 pt-4">
        <ControlButton
          icon={muted ? 'ph:microphone-slash-bold' : 'ph:microphone-bold'}
          label={muted ? 'Reativar microfone' : 'Silenciar microfone'}
          active={muted}
          onClick={() => setMuted((v) => !v)}
        />
        <ControlButton
          icon={cameraOff ? 'ph:video-camera-slash-bold' : 'ph:video-camera-bold'}
          label={cameraOff ? 'Ligar câmera' : 'Desligar câmera'}
          active={cameraOff}
          onClick={() => setCameraOff((v) => !v)}
        />
        <ControlButton
          icon="ph:chat-circle-text-bold"
          label="Abrir chat da sessão"
          active={chatOpen}
          onClick={() => setChatOpen((v) => !v)}
        />
        <button
          aria-label="Encerrar sessão"
          onClick={handleEndSession}
          className="flex h-14 min-w-[72px] items-center justify-center rounded-pill bg-danger text-white shadow-lg transition-colors hover:bg-[#C24A5E]"
        >
          <Icon icon="ph:phone-disconnect-bold" width={24} aria-hidden />
        </button>
      </footer>

      {/* Chat panel */}
      {chatOpen && (
        <div className="absolute inset-y-0 right-0 z-20 flex w-80 flex-col border-l border-[rgba(255,255,255,0.1)] bg-[#1a1828] shadow-xl">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.1)] px-4 py-3">
            <h2 className="text-sm font-semibold text-[#F2EFF8]">Chat da sessão</h2>
            <button onClick={() => setChatOpen(false)} className="text-[#807A99] hover:text-[#F2EFF8]">
              <Icon icon="ph:x-bold" width={18} aria-hidden />
            </button>
          </div>
          <div className="flex-1 px-4 py-4">
            <p className="text-xs text-[#807A99]">O chat está disponível durante a sessão.</p>
          </div>
          <div className="border-t border-[rgba(255,255,255,0.1)] px-4 py-3">
            <input
              type="text"
              placeholder="Escreva uma mensagem…"
              className="w-full rounded-pill bg-[#221F44] px-4 py-2 text-sm text-[#F2EFF8] outline-none placeholder:text-[#807A99] focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      )}

      {/* Post-session Sheet — feedback, decision, schedule, rematch */}
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

      {/* Help modal */}
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
    </div>
  )
}

function ControlButton({
  icon, label, active = false, onClick,
}: {
  icon: string; label: string; active?: boolean; onClick?: () => void
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={onClick ? active : undefined}
      onClick={onClick}
      className={`flex h-14 w-14 items-center justify-center rounded-pill backdrop-blur-sm transition-colors ${
        active
          ? 'bg-[#F2EFF8] text-[#14122A]'
          : 'bg-[rgba(242,239,248,0.14)] text-[#F2EFF8] hover:bg-[rgba(242,239,248,0.24)]'
      }`}
    >
      <Icon icon={icon} width={22} aria-hidden />
    </button>
  )
}
