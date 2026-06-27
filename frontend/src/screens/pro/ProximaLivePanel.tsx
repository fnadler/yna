import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Skeleton } from '../../components/Skeleton'
import { useService } from '../../hooks/useService'
import { proUniversidadeService } from '../../services/pro'
import { Painel, VerTodos, LiveSidebarBody, LiveCardActions } from './universidadeParts'
import { LiveModal } from './LiveModal'
import type { ProLive } from '../../types'

/* Próxima live YNA em destaque — painel para a sidebar da home do profissional.
   Mantém o mesmo modal de detalhe e ações da tela da Universidade. */
export function ProximaLivePanel() {
  const navigate = useNavigate()
  const lives = useService(() => proUniversidadeService.lives(), [])

  const [detalhe, setDetalhe] = useState<ProLive | null>(null)
  const [inscritos, setInscritos] = useState<Record<string, boolean>>({})

  const isInscrito = (l: ProLive) => inscritos[l.id] ?? l.inscrito
  const toggleInscrito = (l: ProLive) => setInscritos((s) => ({ ...s, [l.id]: !isInscrito(l) }))
  const entrarLive = (l: ProLive) => navigate(`/pro/live/${l.id}`)

  const proxima = lives.status === 'success'
    ? (lives.data.find((x) => x.aoVivoSeg != null) ?? lives.data.find((x) => x.status === 'agendada') ?? lives.data[0])
    : undefined

  return (
    <section>
      <Painel title="Próxima live YNA" action={<VerTodos label="Ver todas" onClick={() => navigate('/pro/universidade/lives')} />}>
        {lives.status === 'success'
          ? proxima
            ? (
              <div className="flex flex-col gap-3">
                <LiveSidebarBody live={proxima} />
                <LiveCardActions
                  live={proxima}
                  inscrito={isInscrito(proxima)}
                  onToggleInscrito={() => toggleInscrito(proxima)}
                  onDetalhe={() => setDetalhe(proxima)}
                  onEntrar={() => entrarLive(proxima)}
                />
              </div>
            )
            : <p className="text-[13px] text-ink-secondary">Nenhuma live agendada.</p>
          : <Skeleton className="h-20 w-full rounded-lg" />}
      </Painel>

      <LiveModal
        live={detalhe}
        inscrito={detalhe ? isInscrito(detalhe) : false}
        onToggleInscrito={() => detalhe && toggleInscrito(detalhe)}
        onEntrar={() => { if (detalhe) { const l = detalhe; setDetalhe(null); entrarLive(l) } }}
        onClose={() => setDetalhe(null)}
      />
    </section>
  )
}
