import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { LiveRoom } from '../../components/LiveRoom'
import { useService } from '../../hooks/useService'
import { usePro } from '../../contexts/ProContext'
import { proUniversidadeService } from '../../services/pro'

/* PRO-31 — Sala de transmissão de uma live da Universidade YNA. */
export function Pro31LiveRoom() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = usePro()
  const lives = useService(() => proUniversidadeService.lives(), [])

  if (lives.status === 'loading' || lives.status === 'idle') {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-3 bg-[#14122A] text-[#DCD4F0]">
        <Icon icon="ph:spinner-gap-bold" width={28} className="animate-spin" aria-hidden />
        <p className="text-sm">Entrando na live…</p>
      </div>
    )
  }

  const live = lives.status === 'success' ? lives.data.find((l) => l.id === id) : undefined

  if (!live) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-[#14122A] px-6 text-center text-[#DCD4F0]">
        <Icon icon="ph:warning-circle-bold" width={32} className="text-danger" aria-hidden />
        <p className="text-sm">Não foi possível abrir esta live.</p>
        <button onClick={() => navigate('/pro/universidade')} className="rounded-pill bg-[rgba(242,239,248,0.14)] px-4 py-2 text-sm font-medium">Voltar à Universidade</button>
      </div>
    )
  }

  return (
    <LiveRoom
      titulo={live.titulo}
      palestrante={live.palestrante ?? 'Apresentador YNA'}
      espectadores={live.espectadores ?? 0}
      startedSeconds={live.aoVivoSeg ?? 0}
      self={{ initials: profile.initials, palette: profile.palette }}
      onLeave={() => navigate('/pro/universidade')}
    />
  )
}
