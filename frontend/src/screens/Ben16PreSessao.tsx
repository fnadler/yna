import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'

type CheckStatus = 'idle' | 'checking' | 'ok' | 'fail'

interface Check {
  id: 'camera' | 'mic' | 'connection'
  label: string
  icon: string
}

const checks: Check[] = [
  { id: 'camera', label: 'Câmera', icon: 'ph:video-camera-bold' },
  { id: 'mic', label: 'Microfone', icon: 'ph:microphone-bold' },
  { id: 'connection', label: 'Conexão', icon: 'ph:wifi-high-bold' },
]

interface Ben16Props {
  sessionId?: string
  onEnter?: () => void
}

export function Ben16PreSessao({ sessionId, onEnter }: Ben16Props = {}) {
  const { id: paramId } = useParams<{ id: string }>()
  const resolvedId = sessionId ?? paramId ?? 'sess-1'
  const navigate = useNavigate()
  const [statuses, setStatuses] = useState<Record<string, CheckStatus>>({
    camera: 'idle',
    mic: 'idle',
    connection: 'idle',
  })
  const [running, setRunning] = useState(false)

  const runChecks = async () => {
    setRunning(true)
    for (const check of checks) {
      setStatuses((s) => ({ ...s, [check.id]: 'checking' }))
      await new Promise((r) => setTimeout(r, 700))
      setStatuses((s) => ({ ...s, [check.id]: 'ok' }))
    }
    setRunning(false)
  }

  const allOk = checks.every((c) => statuses[c.id] === 'ok')

  const statusIcon: Record<CheckStatus, { icon: string; color: string }> = {
    idle: { icon: 'ph:circle-bold', color: 'text-ink-muted' },
    checking: { icon: 'ph:spinner-gap-bold', color: 'text-primary animate-spin' },
    ok: { icon: 'ph:check-circle-bold', color: 'text-success' },
    fail: { icon: 'ph:x-circle-bold', color: 'text-danger' },
  }

  const handleEnter = onEnter ?? (() => navigate(`/sessao/${resolvedId}`))

  return (
    <div className="flex flex-col px-5 pb-8 pt-5 lg:pt-10">
      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
          <Icon icon="ph:monitor-play-bold" width={24} aria-hidden />
        </div>
        <h1 className="text-[24px] font-medium leading-[1.2] tracking-[-0.02em] text-ink">
          Teste de equipamento
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          Dois minutos para garantir que câmera, microfone e conexão estão prontos, para você chegar sem surpresas.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3">
        {checks.map((check) => {
          const st = statuses[check.id] as CheckStatus
          const { icon, color } = statusIcon[st]
          return (
            <div
              key={check.id}
              className={`flex min-h-[64px] items-center gap-4 rounded-lg border-[1.5px] px-4 transition-all ${
                st === 'ok' ? 'border-success bg-success-bg' :
                st === 'fail' ? 'border-danger bg-danger-bg' :
                st === 'checking' ? 'border-primary bg-primary-50' :
                'border-border bg-surface'
              }`}
            >
              <Icon icon={check.icon} width={22}
                className={st === 'ok' ? 'text-success' : st === 'checking' ? 'text-primary' : 'text-ink-muted'}
                aria-hidden />
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">{check.label}</p>
                <p className="text-xs text-ink-muted">
                  {st === 'idle' && 'Aguardando teste'}
                  {st === 'checking' && 'Verificando…'}
                  {st === 'ok' && 'Tudo certo!'}
                  {st === 'fail' && 'Problema detectado'}
                </p>
              </div>
              <Icon icon={icon} width={20} className={color} aria-hidden />
            </div>
          )
        })}
      </div>

      <div className="mt-auto flex flex-col gap-2">
        {!allOk && (
          <Button
            variant="secondary"
            fullWidth
            iconLeft="ph:arrows-clockwise-bold"
            disabled={running}
            onClick={runChecks}
          >
            {running ? 'Testando…' : 'Testar equipamento'}
          </Button>
        )}
        <Button
          size="lg"
          fullWidth
          iconRight="ph:arrow-right-bold"
          onClick={handleEnter}
        >
          Entrar na sessão
        </Button>
        <p className="text-center text-xs leading-snug text-ink-muted">
          Você pode entrar mesmo sem testar. O teste é opcional.
        </p>
      </div>
    </div>
  )
}
