import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'

const messages = [
  'Analisando o que você nos contou…',
  'Cruzando abordagens e especialidades…',
  'Verificando disponibilidade de agenda…',
  'Nossa equipe clínica revisando as sugestões…',
  'Finalizando os três perfis para você…',
]

export function Ben11Loader() {
  const [msgIndex, setMsgIndex] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => {
        if (i < messages.length - 1) return i + 1
        clearInterval(interval)
        return i
      })
    }, 600)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate('/matches', { replace: true })
    }, 3500)
    return () => clearTimeout(timeout)
  }, [navigate])

  return (
    <div className="relative flex h-dvh flex-col items-center justify-center overflow-hidden gap-8 px-6 text-center bg-yna-gradient">
      {/* Pulsing rings — alinhado com /bem-comecar e /pronto */}
      <div className="relative flex h-28 w-28 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <div
          className="absolute inset-4 animate-ping rounded-full bg-primary/25"
          style={{ animationDelay: '0.3s' }}
        />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
          <Icon icon="ph:sparkle-bold" width={28} className="text-primary" aria-hidden />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-medium tracking-[-0.02em] text-ink">
          Encontrando as pessoas certas
        </h1>
        <p
          key={msgIndex}
          className="text-sm leading-relaxed text-ink animate-yna-fade-in"
          aria-live="polite"
          aria-atomic="true"
        >
          {messages[msgIndex]}
        </p>
      </div>

      <p className="text-xs text-ink">
        O algoritmo encontra. Gente confirma.
      </p>
    </div>
  )
}
