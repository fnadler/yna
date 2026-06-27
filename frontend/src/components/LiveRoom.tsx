import { useEffect, useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import { Avatar } from './Avatar'

type Palette = 'lavender' | 'pink' | 'yellow'

const fmt = (t: number) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`

export interface LiveRoomProps {
  titulo: string
  palestrante: string
  espectadores: number
  /** Segundos desde o início da transmissão. */
  startedSeconds: number
  self: { initials: string; palette: Palette }
  onLeave: () => void
}

/* Sala de transmissão de live — tema escuro, no padrão da sala de sessão, com
   recursos de live: participantes, chat, compartilhar tela e levantar a mão. */
export function LiveRoom({ titulo, palestrante, espectadores, startedSeconds, self, onLeave }: LiveRoomProps) {
  const [muted, setMuted] = useState(true)
  const [cameraOff, setCameraOff] = useState(true)
  const [hand, setHand] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [panel, setPanel] = useState<'participantes' | 'chat' | null>('chat')
  const [elapsed, setElapsed] = useState(startedSeconds)

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const participantes = [
    { id: 'host', nome: palestrante, host: true, mao: false, self: false },
    { id: 'self', nome: 'Você', host: false, mao: hand, self: true },
    { id: 'p1', nome: 'João Matos', host: false, mao: true, self: false },
    { id: 'p2', nome: 'Carla Nunes', host: false, mao: false, self: false },
    { id: 'p3', nome: 'Rafael Dias', host: false, mao: false, self: false },
    { id: 'p4', nome: 'Bianca Alves', host: false, mao: false, self: false },
  ]

  return (
    <div className="relative flex h-dvh flex-col bg-[#14122A] lg:flex-row">
      {/* Palco do palestrante */}
      <div
        className="absolute inset-0 lg:static lg:flex-1"
        role="img"
        aria-label={`Transmissão de ${palestrante}`}
        style={{ background: 'radial-gradient(circle at 50% 38%, #3A3C8E 0%, #28265A 45%, #14122A 100%)' }}
      >
        <div className="flex h-full flex-col items-center justify-center gap-3 pb-24 lg:pb-0">
          {sharing ? (
            <div className="flex flex-col items-center gap-2 text-[#B4AEC9]">
              <Icon icon="ph:monitor-bold" width={56} aria-hidden />
              <p className="text-sm">Você está compartilhando sua tela</p>
            </div>
          ) : (
            <>
              <Avatar initials={palestrante.slice(0, 2).toUpperCase()} size={104} palette="lavender" />
              <p className="text-base font-semibold text-[#F2EFF8]">{palestrante}</p>
              <p className="text-[13px] text-[#B4AEC9]">{titulo}</p>
            </>
          )}
        </div>
      </div>

      {/* Header: AO VIVO + espectadores + timer */}
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 px-4 pt-12 lg:pt-6">
        <span className="flex items-center gap-2 rounded-pill bg-[rgba(215,90,110,0.92)] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          Ao vivo
        </span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-pill bg-[rgba(20,18,42,0.72)] px-3 py-1.5 text-xs font-medium text-[#DCD4F0] backdrop-blur-sm">
            <Icon icon="ph:users-bold" width={14} aria-hidden /> {espectadores}
          </span>
          <span className="rounded-pill bg-[rgba(20,18,42,0.72)] px-3 py-1.5 font-mono text-xs font-medium text-[#B4AEC9] backdrop-blur-sm tabular-nums">
            {fmt(elapsed)}
          </span>
        </div>
      </header>

      {/* Self-view */}
      <div className="absolute bottom-[150px] right-4 z-10 flex h-[120px] w-[88px] items-center justify-center overflow-hidden rounded-lg border border-[rgba(220,212,240,0.25)] bg-[#221F44] shadow-lg lg:bottom-20" role="img" aria-label="Sua câmera">
        {cameraOff ? <Icon icon="ph:video-camera-slash-bold" width={22} className="text-[#807A99]" aria-hidden /> : <Avatar initials={self.initials} size={44} palette={self.palette} />}
        {hand && <span className="absolute right-1 top-1 rounded-pill bg-warning-bg px-1 py-0.5 text-[10px]">✋</span>}
        <span className="absolute bottom-1.5 left-1.5 rounded-pill bg-[rgba(20,18,42,0.7)] px-2 py-0.5 text-[10px] font-medium text-[#DCD4F0]">Você</span>
      </div>

      {/* Controles */}
      <footer className="absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-center justify-center gap-2.5 pb-9 pt-4">
        <Ctrl icon={muted ? 'ph:microphone-slash-bold' : 'ph:microphone-bold'} label={muted ? 'Ativar microfone' : 'Silenciar'} active={muted} onClick={() => setMuted((v) => !v)} />
        <Ctrl icon={cameraOff ? 'ph:video-camera-slash-bold' : 'ph:video-camera-bold'} label={cameraOff ? 'Ligar câmera' : 'Desligar câmera'} active={cameraOff} onClick={() => setCameraOff((v) => !v)} />
        <Ctrl icon="ph:hand-bold" label={hand ? 'Baixar a mão' : 'Levantar a mão'} highlight={hand} onClick={() => setHand((v) => !v)} />
        <Ctrl icon="ph:monitor-arrow-up-bold" label={sharing ? 'Parar de compartilhar' : 'Compartilhar tela'} highlight={sharing} onClick={() => setSharing((v) => !v)} />
        <Ctrl icon="ph:users-three-bold" label="Participantes" active={panel === 'participantes'} onClick={() => setPanel((p) => (p === 'participantes' ? null : 'participantes'))} />
        <Ctrl icon="ph:chat-circle-text-bold" label="Chat" active={panel === 'chat'} onClick={() => setPanel((p) => (p === 'chat' ? null : 'chat'))} />
        <button onClick={onLeave} aria-label="Sair da live" className="flex h-14 min-w-[64px] items-center justify-center rounded-pill bg-danger text-white shadow-lg transition-colors hover:bg-[#C24A5E]">
          <Icon icon="ph:sign-out-bold" width={22} aria-hidden />
        </button>
      </footer>

      {/* Painel: Participantes */}
      {panel === 'participantes' && (
        <SidePanel title={`Participantes · ${espectadores}`} onClose={() => setPanel(null)}>
          <ul className="flex flex-col">
            {participantes.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                <Avatar initials={p.nome.slice(0, 2).toUpperCase()} size={30} palette="lavender" />
                <span className="min-w-0 flex-1 truncate text-[13px] text-[#F2EFF8]">{p.nome}{p.self && ' (você)'}</span>
                {p.host && <span className="rounded-pill bg-[rgba(108,111,194,0.3)] px-2 py-0.5 text-[10px] font-semibold text-[#A9ABE6]">Apresentador</span>}
                {p.mao && <Icon icon="ph:hand-bold" width={15} className="text-warning-ink" aria-hidden />}
              </li>
            ))}
          </ul>
        </SidePanel>
      )}

      {/* Painel: Chat */}
      {panel === 'chat' && <ChatPanel onClose={() => setPanel(null)} />}
    </div>
  )
}

function Ctrl({ icon, label, active = false, highlight = false, onClick }: { icon: string; label: string; active?: boolean; highlight?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active || highlight}
      className={`flex h-12 w-12 items-center justify-center rounded-pill transition-colors ${
        highlight ? 'bg-[#6C6FC2] text-white' : active ? 'bg-[rgba(255,255,255,0.18)] text-white' : 'bg-[rgba(255,255,255,0.08)] text-[#DCD4F0] hover:bg-[rgba(255,255,255,0.16)]'
      }`}
    >
      <Icon icon={icon} width={20} aria-hidden />
    </button>
  )
}

function SidePanel({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="absolute inset-y-0 right-0 z-20 flex w-80 max-w-[85vw] flex-col border-l border-[rgba(255,255,255,0.1)] bg-[#1a1828] shadow-xl">
      <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.1)] px-4 py-3">
        <h2 className="text-sm font-semibold text-[#F2EFF8]">{title}</h2>
        <button onClick={onClose} aria-label="Fechar painel" className="text-[#807A99] hover:text-[#F2EFF8]"><Icon icon="ph:x-bold" width={18} aria-hidden /></button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto py-2">{children}</div>
    </div>
  )
}

function ChatPanel({ onClose }: { onClose: () => void }) {
  const [msgs, setMsgs] = useState([
    { id: 'm1', autor: 'João Matos', texto: 'Excelente explicação sobre o manejo!' },
    { id: 'm2', autor: 'Carla Nunes', texto: 'Tem material complementar dessa parte?' },
    { id: 'm3', autor: 'Apresentador', texto: 'Vou deixar nos conteúdos eletivos depois 👍', host: true },
  ])
  const [text, setText] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const enviar = () => {
    if (!text.trim()) return
    setMsgs((m) => [...m, { id: `m${m.length + 1}`, autor: 'Você', texto: text.trim() }])
    setText('')
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 0)
  }
  return (
    <div className="absolute inset-y-0 right-0 z-20 flex w-80 max-w-[85vw] flex-col border-l border-[rgba(255,255,255,0.1)] bg-[#1a1828] shadow-xl">
      <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.1)] px-4 py-3">
        <h2 className="text-sm font-semibold text-[#F2EFF8]">Chat da live</h2>
        <button onClick={onClose} aria-label="Fechar chat" className="text-[#807A99] hover:text-[#F2EFF8]"><Icon icon="ph:x-bold" width={18} aria-hidden /></button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <ul className="flex flex-col gap-3">
          {msgs.map((m) => (
            <li key={m.id}>
              <p className={`text-[11px] font-semibold ${m.host ? 'text-[#A9ABE6]' : 'text-[#807A99]'}`}>{m.autor}{m.host && ' · apresentador'}</p>
              <p className="text-[13px] text-[#DCD4F0]">{m.texto}</p>
            </li>
          ))}
          <div ref={endRef} />
        </ul>
      </div>
      <div className="flex items-center gap-2 border-t border-[rgba(255,255,255,0.1)] px-3 py-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') enviar() }}
          placeholder="Escreva uma mensagem…"
          className="min-w-0 flex-1 rounded-pill bg-[#221F44] px-4 py-2 text-sm text-[#F2EFF8] outline-none placeholder:text-[#807A99] focus:ring-1 focus:ring-primary"
        />
        <button onClick={enviar} aria-label="Enviar" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-[#6C6FC2] text-white"><Icon icon="ph:paper-plane-right-fill" width={16} aria-hidden /></button>
      </div>
    </div>
  )
}
