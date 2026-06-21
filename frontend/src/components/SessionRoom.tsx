import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { Avatar } from './Avatar'

const WARN_AT = 5

type Palette = 'lavender' | 'pink' | 'yellow'

export interface SessionRoomParticipant {
  name: string
  initials: string
  palette: Palette
  /** Frase de status do par exibida sob o nome. */
  status?: string
}

export interface SessionRoomProps {
  /** Papel de quem está nesta ponta da sala. */
  role: 'beneficiario' | 'profissional'
  /** A outra pessoa na sala (quem aparece em tela cheia). */
  peer: SessionRoomParticipant
  /** Identificação do self-view. */
  self: { initials: string; palette: Palette }
  minutesLeft?: number
  /** Chamado ao encerrar a sessão — o pai decide o próximo passo (feedback × prontuário). */
  onEnd: () => void
  /** Beneficiário: aciona suporte de emergência. Ausente para o profissional. */
  onEmergency?: () => void
}

/* Sala de sessão online — compartilhada entre Beneficiário e Profissional.
   A aparência é idêntica nos dois fluxos; variam o participante, o self-view,
   o botão de ajuda (só beneficiário) e o que acontece ao encerrar (onEnd). */
export function SessionRoom({ role, peer, self, minutesLeft = 32, onEnd, onEmergency }: SessionRoomProps) {
  const [muted, setMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowWarning(true), 3000)
    return () => clearTimeout(t)
  }, [])

  const handleEnd = () => {
    setSessionEnded(true)
    onEnd()
  }

  return (
    <div className="relative flex h-dvh flex-col bg-[#14122A] lg:flex-row">
      {/* Vídeo do participante */}
      <div
        className="absolute inset-0 lg:static lg:flex-1"
        role="img"
        aria-label={`Vídeo de ${peer.name}`}
        style={{ background: 'radial-gradient(circle at 50% 38%, #3A3C8E 0%, #28265A 45%, #14122A 100%)' }}
      >
        <div className="flex h-full flex-col items-center justify-center gap-3 pb-24 lg:pb-0">
          <Avatar initials={peer.initials} size={104} palette={peer.palette} />
          <p className="text-base font-semibold text-[#F2EFF8]">{peer.name}</p>
          <p className="flex items-center gap-1.5 text-[13px] text-[#B4AEC9]">
            <span className="h-2 w-2 rounded-pill bg-[#6FC4A8]" aria-hidden />
            {peer.status ?? 'Conectado · áudio e vídeo estáveis'}
          </p>
        </div>

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
            minutesLeft <= WARN_AT ? 'bg-warning-bg text-warning-ink' : 'bg-[rgba(20,18,42,0.72)] text-[#B4AEC9]'
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
          <Avatar initials={self.initials} size={48} palette={self.palette} />
        )}
        <span className="absolute bottom-1.5 left-1.5 rounded-pill bg-[rgba(20,18,42,0.7)] px-2 py-0.5 text-[10px] font-medium text-[#DCD4F0]">
          Você
        </span>
      </div>

      {/* Botão de ajuda — apenas beneficiário */}
      {role === 'beneficiario' && onEmergency && (
        <button
          onClick={onEmergency}
          className="absolute bottom-[110px] left-4 z-10 flex min-h-[44px] items-center gap-2 rounded-pill bg-[rgba(20,18,42,0.72)] px-4 font-heading text-[13px] font-medium text-[#DCD4F0] backdrop-blur-sm transition-colors hover:bg-[rgba(42,39,80,0.85)]"
        >
          <Icon icon="ph:lifebuoy-bold" width={16} aria-hidden />
          Precisa de ajuda?
        </button>
      )}

      {/* Controles */}
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
          onClick={handleEnd}
          className="flex h-14 min-w-[72px] items-center justify-center rounded-pill bg-danger text-white shadow-lg transition-colors hover:bg-[#C24A5E]"
        >
          <Icon icon="ph:phone-disconnect-bold" width={24} aria-hidden />
        </button>
      </footer>

      {/* Chat */}
      {chatOpen && (
        <div className="absolute inset-y-0 right-0 z-20 flex w-80 flex-col border-l border-[rgba(255,255,255,0.1)] bg-[#1a1828] shadow-xl">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.1)] px-4 py-3">
            <h2 className="text-sm font-semibold text-[#F2EFF8]">Chat da sessão</h2>
            <button onClick={() => setChatOpen(false)} className="text-[#807A99] hover:text-[#F2EFF8]" aria-label="Fechar chat">
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
        active ? 'bg-[#F2EFF8] text-[#14122A]' : 'bg-[rgba(242,239,248,0.14)] text-[#F2EFF8] hover:bg-[rgba(242,239,248,0.24)]'
      }`}
    >
      <Icon icon={icon} width={22} aria-hidden />
    </button>
  )
}
