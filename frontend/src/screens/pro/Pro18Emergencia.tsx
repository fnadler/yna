import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import { SessionRoom } from '../../components/SessionRoom'
import { Sheet } from '../../components/Sheet'
import { useService } from '../../hooks/useService'
import { usePro } from '../../contexts/ProContext'
import { proPlantaoService } from '../../services/pro'
import { ProntuarioForm } from './Pro16Prontuario'

type Phase = 'incoming' | 'connecting' | 'room'

export function Pro18Emergencia() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = usePro()
  const acion = useService(() => proPlantaoService.getAcionamento(id ?? ''), [id])
  const [phase, setPhase] = useState<Phase>('incoming')
  const [prontuario, setProntuario] = useState(false)

  useEffect(() => {
    if (phase !== 'connecting') return
    const t = setTimeout(() => setPhase('room'), 1600)
    return () => clearTimeout(t)
  }, [phase])

  // Sala de emergência — reusa o SessionRoom em contexto de crise
  if (phase === 'room' && acion.status === 'success') {
    return (
      <>
        <SessionRoom
          role="profissional"
          peer={{ name: acion.data.apelido, initials: acion.data.initials, palette: acion.data.palette, status: 'Atendimento de emergência · plantão' }}
          self={{ initials: profile.initials, palette: profile.palette }}
          minutesLeft={50}
          onEnd={() => setProntuario(true)}
        />

        <Sheet
          open={prontuario}
          onClose={() => navigate('/pro/plantao')}
          title={`Registro da sessão — ${acion.data.apelido}`}
          icon="ph:note-pencil-bold"
          size="md"
        >
          <ProntuarioForm
            sessionId={id ?? ''}
            onDone={() => navigate('/pro/plantao')}
            onCancel={() => navigate('/pro/plantao')}
          />
        </Sheet>
      </>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#14122A] px-6 text-center">
      {acion.status !== 'success' ? (
        <div className="flex flex-col items-center gap-3 text-[#DCD4F0]">
          <Icon icon="ph:spinner-gap-bold" width={28} className="animate-spin" aria-hidden />
          <p className="text-sm">Carregando acionamento…</p>
        </div>
      ) : phase === 'connecting' ? (
        <div className="flex flex-col items-center gap-4 text-[#DCD4F0]">
          <span className="relative flex h-20 w-20 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" aria-hidden />
            <Avatar initials={acion.data.initials} size={64} palette={acion.data.palette} />
          </span>
          <p className="text-[15px] font-medium">Conectando com {acion.data.apelido}…</p>
        </div>
      ) : (
        <div className="flex w-full max-w-sm flex-col items-center gap-5 animate-yna-slide-up">
          {/* Alerta pulsante */}
          <span className="relative flex h-16 w-16 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger/40" aria-hidden />
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-danger text-white">
              <Icon icon="ph:lifebuoy-bold" width={30} aria-hidden />
            </span>
          </span>

          <div>
            <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-warning-ink">Acionamento de emergência</p>
            <h1 className="mt-2 font-heading text-[24px] font-medium text-[#F2EFF8]">Alguém precisa de apoio agora</h1>
          </div>

          <div className="w-full rounded-lg border border-[rgba(220,212,240,0.18)] bg-[rgba(255,255,255,0.04)] p-4 text-left">
            <div className="flex items-center gap-3">
              <Avatar initials={acion.data.initials} size={44} palette={acion.data.palette} />
              <div>
                <p className="font-heading font-semibold text-[#F2EFF8]">{acion.data.apelido}</p>
                <p className="text-[13px] text-[#B4AEC9]">Acionado {acion.data.horario}</p>
              </div>
            </div>
            <p className="mt-3 flex items-start gap-2 text-[13px] text-[#DCD4F0]">
              <Icon icon="ph:warning-bold" width={15} className="mt-0.5 shrink-0 text-warning" aria-hidden />
              {acion.data.motivo}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3">
            <Button size="lg" fullWidth iconLeft="ph:phone-call-bold" onClick={() => setPhase('connecting')}>
              Aceitar atendimento
            </Button>
            <button
              onClick={() => navigate('/pro/plantao')}
              className="min-h-[44px] font-heading text-sm font-medium text-[#B4AEC9] transition-colors hover:text-[#F2EFF8]"
            >
              Não posso agora
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
