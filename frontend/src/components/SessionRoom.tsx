import { useEffect, useState, type ReactNode } from 'react'
import { Icon } from '@iconify/react'
import { Avatar } from './Avatar'
import type { AvisoProfissional } from '../lib/proximaSessao'

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
  /** Profissional: conteúdo do histórico do beneficiário (abre em painel lateral, como o chat). */
  historyContent?: ReactNode
  /** Profissional: beneficiário da próxima sessão que já entrou na sala (aviso). */
  proximaSessao?: { apelido: string } | null
  onAvisarAtraso?: (minutos: number) => void
  onCancelarProxima?: () => void
  /** Beneficiário: estado do profissional (que está finalizando outra sessão). */
  avisoProfissional?: AvisoProfissional | null
}

/* Sala de sessão online — compartilhada entre Beneficiário e Profissional.
   A aparência é idêntica nos dois fluxos; variam o participante, o self-view,
   o botão de ajuda (só beneficiário) e o que acontece ao encerrar (onEnd). */
export function SessionRoom({ role, peer, self, minutesLeft = 32, onEnd, onEmergency, historyContent, proximaSessao, onAvisarAtraso, onCancelarProxima, avisoProfissional }: SessionRoomProps) {
  const [muted, setMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)
  const [panel, setPanel] = useState<'chat' | 'historico' | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)
  // Aviso da próxima sessão (profissional) / do profissional (beneficiário).
  const [decisao, setDecisao] = useState<AvisoProfissional | null>(null)
  const [avisoAberto, setAvisoAberto] = useState(true)
  const avisoKey = role === 'profissional' ? proximaSessao?.apelido : JSON.stringify(avisoProfissional)

  useEffect(() => {
    const t = setTimeout(() => setShowWarning(true), 3000)
    return () => clearTimeout(t)
  }, [])

  // Reabre o aviso quando ele muda (ex.: profissional informou atraso/cancelamento).
  useEffect(() => { if (avisoKey) setAvisoAberto(true) }, [avisoKey])

  const escolherAtraso = (min: number) => { setDecisao({ tipo: 'atraso', minutos: min }); onAvisarAtraso?.(min) }
  const escolherCancelar = () => { setDecisao({ tipo: 'cancelado' }); onCancelarProxima?.() }

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

      {/* Beneficiário — aviso de que o profissional está finalizando outra sessão */}
      {role === 'beneficiario' && avisoProfissional && avisoAberto && (
        <div className="absolute inset-x-4 top-[104px] z-20 lg:inset-x-auto lg:left-1/2 lg:w-[26rem] lg:-translate-x-1/2">
          {(() => {
            const av = avisoProfissional
            const cfg = av.tipo === 'cancelado'
              ? { cls: 'bg-danger-bg text-danger-ink', icon: 'ph:x-circle-bold', txt: 'A sessão foi cancelada pelo profissional. Você pode reagendar pela sua agenda.' }
              : av.tipo === 'atraso'
                ? { cls: 'bg-warning-bg text-warning-ink', icon: 'ph:timer-bold', txt: `O profissional avisou que vai atrasar cerca de ${av.minutos} min. Obrigado por aguardar.` }
                : { cls: 'bg-[rgba(20,18,42,0.92)] text-[#DCD4F0] border border-[rgba(255,255,255,0.12)]', icon: 'ph:hourglass-medium-bold', txt: 'O profissional está finalizando outra sessão. Ele já entra — obrigado por aguardar.' }
            return (
              <div className={`flex items-start gap-2.5 rounded-lg px-4 py-3 shadow-lg backdrop-blur-sm ${cfg.cls}`}>
                <Icon icon={cfg.icon} width={18} className={`mt-px shrink-0 ${av.tipo === 'aguardando' ? 'animate-pulse' : ''}`} aria-hidden />
                <p className="flex-1 text-[13px] font-medium leading-snug">{cfg.txt}</p>
                <button onClick={() => setAvisoAberto(false)} className="shrink-0 opacity-70 transition-opacity hover:opacity-100" aria-label="Dispensar aviso"><Icon icon="ph:x-bold" width={14} aria-hidden /></button>
              </div>
            )
          })()}
        </div>
      )}

      {/* Profissional — aviso de que o beneficiário da próxima sessão já entrou */}
      {role === 'profissional' && proximaSessao && avisoAberto && (
        <div className="absolute bottom-[150px] left-4 z-20 w-[min(20rem,calc(100vw-2rem))] lg:bottom-24">
          <div className="rounded-lg border border-warning/40 bg-[rgba(20,18,42,0.92)] p-3 shadow-lg backdrop-blur-sm">
            <div className="flex items-start gap-2.5">
              <span className="relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-warning/25 text-warning-ink">
                {!decisao && <span className="absolute inset-0 animate-ping rounded-full bg-warning/30" aria-hidden />}
                <Icon icon="ph:bell-ringing-bold" width={14} className="relative" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                {!decisao ? (
                  <>
                    <p className="text-[12.5px] font-semibold text-[#F2EFF8]">Próxima sessão aguardando</p>
                    <p className="mt-0.5 text-[12px] text-[#B4AEC9]"><span className="font-medium text-[#DCD4F0]">{proximaSessao.apelido}</span> já entrou na sala.</p>
                    <p className="mt-2 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-[#807A99]">Avisar atraso</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {[5, 10, 15].map((min) => (
                        <button key={min} onClick={() => escolherAtraso(min)} className="rounded-pill bg-[rgba(242,239,248,0.14)] px-2.5 py-1 text-[12px] font-semibold text-[#F2EFF8] transition-colors hover:bg-[rgba(242,239,248,0.26)]">{min} min</button>
                      ))}
                    </div>
                    <button onClick={escolherCancelar} className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#E98BA0] transition-colors hover:text-[#F0A6B6]"><Icon icon="ph:x-circle-bold" width={13} aria-hidden /> Cancelar consulta</button>
                  </>
                ) : (
                  <>
                    <p className="text-[12.5px] font-semibold text-[#F2EFF8]">{decisao.tipo === 'atraso' ? `Aviso enviado · ~${decisao.minutos} min` : 'Consulta cancelada'}</p>
                    <p className="mt-0.5 text-[12px] text-[#B4AEC9]">{decisao.tipo === 'atraso' ? `${proximaSessao.apelido} foi avisado(a) do atraso.` : `${proximaSessao.apelido} foi avisado(a) do cancelamento.`}</p>
                    {decisao.tipo === 'atraso' && <button onClick={() => setDecisao(null)} className="mt-1.5 text-[12px] font-medium text-[#B9B2E6] transition-colors hover:text-[#F2EFF8]">Alterar aviso</button>}
                  </>
                )}
              </div>
              <button onClick={() => setAvisoAberto(false)} className="shrink-0 text-[#807A99] transition-colors hover:text-[#F2EFF8]" aria-label="Dispensar aviso"><Icon icon="ph:x-bold" width={14} aria-hidden /></button>
            </div>
          </div>
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
          active={panel === 'chat'}
          onClick={() => setPanel((p) => (p === 'chat' ? null : 'chat'))}
        />
        {historyContent && (
          <ControlButton
            icon="ph:clock-counter-clockwise-bold"
            label="Ver histórico do beneficiário"
            active={panel === 'historico'}
            onClick={() => setPanel((p) => (p === 'historico' ? null : 'historico'))}
          />
        )}
        <button
          aria-label="Encerrar sessão"
          onClick={handleEnd}
          className="flex h-14 min-w-[72px] items-center justify-center rounded-pill bg-danger text-white shadow-lg transition-colors hover:bg-[#C24A5E]"
        >
          <Icon icon="ph:phone-disconnect-bold" width={24} aria-hidden />
        </button>
      </footer>

      {/* Chat */}
      {panel === 'chat' && (
        <div className="absolute inset-y-0 right-0 z-20 flex w-80 max-w-[85vw] flex-col border-l border-[rgba(255,255,255,0.1)] bg-[#1a1828] shadow-xl">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.1)] px-4 py-3">
            <h2 className="text-sm font-semibold text-[#F2EFF8]">Chat da sessão</h2>
            <button onClick={() => setPanel(null)} className="text-[#807A99] hover:text-[#F2EFF8]" aria-label="Fechar chat">
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

      {/* Histórico/registro do beneficiário (profissional) — painel lateral, como o chat */}
      {panel === 'historico' && historyContent && (
        <div className="absolute inset-y-0 right-0 z-20 flex w-[420px] max-w-[90vw] flex-col border-l border-[rgba(255,255,255,0.1)] bg-[#1a1828] shadow-xl">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.1)] px-4 py-3">
            <h2 className="text-sm font-semibold text-[#F2EFF8]">Beneficiário</h2>
            <button onClick={() => setPanel(null)} className="text-[#807A99] hover:text-[#F2EFF8]" aria-label="Fechar painel">
              <Icon icon="ph:x-bold" width={18} aria-hidden />
            </button>
          </div>
          <div className="min-h-0 flex-1">{historyContent}</div>
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
