import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Avatar } from '../components/Avatar'

/**
 * BEN-17 · Sala de vídeo durante a sessão — RF-CO-09.1, RF-CO-09.3, RF-CO-09.4
 * O momento sagrado: vídeo do profissional + self-view, controles essenciais,
 * indicador de privacidade/criptografia, tempo restante discreto (sessão de 50 min),
 * ajuda/emergência ao alcance. Estética calma — não clínica. Apenas visual:
 * fornecedor de vídeo (Daily/Twilio) fica a definir.
 */
export function Ben17VideoRoom() {
  const [muted, setMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)

  return (
    <div className="relative flex h-full flex-col bg-[#14122A]">
      {/* Vídeo principal do profissional — placeholder em gradiente calmo */}
      <div
        className="absolute inset-0"
        role="img"
        aria-label="Vídeo da Dra. Ana Beltrão"
        style={{
          background:
            'radial-gradient(circle at 50% 38%, #3A3C8E 0%, #28265A 45%, #14122A 100%)',
        }}
      >
        <div className="flex h-full flex-col items-center justify-center gap-3 pb-24">
          <Avatar initials="AB" size={104} palette="lavender" />
          <p className="text-base font-semibold text-[#F2EFF8]">Dra. Ana Beltrão</p>
          <p className="flex items-center gap-1.5 text-[13px] text-[#B4AEC9]">
            <span className="h-2 w-2 rounded-pill bg-[#6FC4A8]" aria-hidden />
            Conectada · áudio e vídeo estáveis
          </p>
        </div>
      </div>

      {/* Barra superior: privacidade + tempo restante */}
      <header className="relative z-10 flex items-center justify-between gap-2 px-4 pt-12">
        <span className="flex items-center gap-2 rounded-pill bg-[rgba(20,18,42,0.72)] px-3.5 py-2 text-xs font-medium text-[#DCD4F0] backdrop-blur-sm">
          <Icon icon="ph:lock-bold" width={14} className="text-[#6FC4A8]" aria-hidden />
          Sessão privada e segura · criptografada
        </span>
        <span
          className="rounded-pill bg-[rgba(20,18,42,0.72)] px-3.5 py-2 font-mono text-xs font-medium text-[#B4AEC9] backdrop-blur-sm"
          aria-label="Tempo restante da sessão: 32 minutos"
        >
          32 min restantes
        </span>
      </header>

      {/* Lembrete de não-gravação — confiança em contexto (RN-CO-09.1) */}
      <p className="relative z-10 mt-2 px-4 text-center text-[11.5px] text-[rgba(220,212,240,0.62)]">
        Esta conversa é só de vocês. Nada aqui é gravado.
      </p>

      {/* Self-view (picture-in-picture) */}
      <div
        className="absolute bottom-[150px] right-4 z-10 flex h-[150px] w-[104px] items-center justify-center overflow-hidden rounded-lg border border-[rgba(220,212,240,0.25)] bg-[#221F44] shadow-lg"
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

      {/* Ajuda discreta, sempre ao alcance */}
      <button className="absolute bottom-[110px] left-4 z-10 flex min-h-[44px] items-center gap-2 rounded-pill bg-[rgba(20,18,42,0.72)] px-4 text-[13px] font-medium text-[#DCD4F0] backdrop-blur-sm transition-colors hover:bg-[rgba(42,39,80,0.85)]">
        <Icon icon="ph:lifebuoy-bold" width={16} aria-hidden />
        Precisa de ajuda?
      </button>

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
        <ControlButton icon="ph:chat-circle-text-bold" label="Abrir chat da sessão" />
        <button
          aria-label="Encerrar sessão"
          className="flex h-14 min-w-[72px] items-center justify-center rounded-pill bg-danger text-white shadow-lg transition-colors hover:bg-[#C24A5E]"
        >
          <Icon icon="ph:phone-disconnect-bold" width={24} aria-hidden />
        </button>
      </footer>
    </div>
  )
}

function ControlButton({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: string
  label: string
  active?: boolean
  onClick?: () => void
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
