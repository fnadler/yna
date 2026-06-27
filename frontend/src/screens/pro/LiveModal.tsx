import { Icon } from '@iconify/react'
import { Sheet } from '../../components/Sheet'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { EntrarSessaoButton } from '../../components/EntrarSessaoButton'
import { CategoriaLiveBadge } from './universidadeParts'
import type { ProLive } from '../../types'

/* Detalhe da live em modal — info + ações (inscrever / entrar). */
export function LiveModal({ live, inscrito, onToggleInscrito, onEntrar, onClose }: {
  live: ProLive | null
  inscrito: boolean
  onToggleInscrito: () => void
  onEntrar: () => void
  onClose: () => void
}) {
  const aoVivo = live?.aoVivoSeg != null
  return (
    <Sheet open={live !== null} onClose={onClose} title="Live YNA" icon="ph:broadcast-bold" size="md">
      {live && (
        <div className="px-5 py-6 lg:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <CategoriaLiveBadge categoria={live.categoria} />
            {aoVivo
              ? <Badge tone="danger" icon="ph:broadcast-bold">Ao vivo agora</Badge>
              : live.status === 'replay'
                ? <Badge tone="neutral">Replay</Badge>
                : <Badge tone="primary">Agendada</Badge>}
            {typeof live.espectadores === 'number' && aoVivo && (
              <span className="flex items-center gap-1 text-[12.5px] text-ink-secondary"><Icon icon="ph:users-bold" width={14} aria-hidden /> {live.espectadores} assistindo</span>
            )}
          </div>

          <h2 className="mt-3 font-heading text-xl font-semibold text-ink">{live.titulo}</h2>
          {live.palestrante && <p className="mt-1 text-sm text-ink-secondary">Com {live.palestrante}</p>}
          <p className="mt-2 flex items-center gap-1.5 text-[13px] text-ink-muted">
            <Icon icon="ph:calendar-bold" width={14} aria-hidden /> {live.data} · {live.horario}
          </p>
          {live.descricao && <p className="mt-4 text-[15px] leading-relaxed text-ink">{live.descricao}</p>}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {aoVivo ? (
              <EntrarSessaoButton fullWidth live openedSeconds={live.aoVivoSeg} label="Entrar na live" onClick={onEntrar} />
            ) : live.status === 'replay' ? (
              <Button fullWidth iconLeft="ph:play-bold" onClick={onEntrar}>Assistir replay</Button>
            ) : (
              <>
                <Button variant={inscrito ? 'soft' : 'primary'} fullWidth iconLeft={inscrito ? 'ph:check-bold' : 'ph:bell-bold'} onClick={onToggleInscrito}>
                  {inscrito ? 'Inscrito' : 'Inscrever'}
                </Button>
                <Button variant="secondary" fullWidth iconLeft="ph:video-camera-bold" onClick={onEntrar}>Entrar na sala</Button>
              </>
            )}
          </div>
        </div>
      )}
    </Sheet>
  )
}
