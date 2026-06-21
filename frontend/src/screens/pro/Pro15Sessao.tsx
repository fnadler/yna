import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { SessionRoom } from '../../components/SessionRoom'
import { Sheet } from '../../components/Sheet'
import { useService } from '../../hooks/useService'
import { usePro } from '../../contexts/ProContext'
import { proSessionService } from '../../services/pro'
import { ProntuarioForm } from './Pro16Prontuario'

export function Pro15Sessao() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = usePro()
  const session = useService(() => proSessionService.get(id ?? ''), [id])
  const [prontuario, setProntuario] = useState(false)

  if (session.status === 'loading' || session.status === 'idle') {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-3 bg-[#14122A] text-[#DCD4F0]">
        <Icon icon="ph:spinner-gap-bold" width={28} className="animate-spin" aria-hidden />
        <p className="text-sm">Entrando na sala…</p>
      </div>
    )
  }

  if (session.status === 'error' || !session.data) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-[#14122A] px-6 text-center text-[#DCD4F0]">
        <Icon icon="ph:warning-circle-bold" width={32} className="text-danger" aria-hidden />
        <p className="text-sm">Não foi possível abrir a sala desta sessão.</p>
        <button onClick={() => navigate('/pro/agenda')} className="rounded-pill bg-[rgba(242,239,248,0.14)] px-4 py-2 text-sm font-medium">
          Voltar para a agenda
        </button>
      </div>
    )
  }

  const s = session.data
  return (
    <>
      <SessionRoom
        role="profissional"
        peer={{ name: s.beneficiarioApelido, initials: s.beneficiarioInitials, palette: s.beneficiarioPalette }}
        self={{ initials: profile.initials, palette: profile.palette }}
        onEnd={() => setProntuario(true)}
      />

      {/* Registro de prontuário em modal, logo após a sessão */}
      <Sheet
        open={prontuario}
        onClose={() => navigate('/pro/agenda')}
        title={`Registro da sessão — ${s.beneficiarioApelido}`}
        icon="ph:note-pencil-bold"
        size="md"
      >
        <ProntuarioForm
          sessionId={s.id}
          onDone={() => navigate('/pro/agenda')}
          onCancel={() => navigate('/pro/agenda')}
        />
      </Sheet>
    </>
  )
}
