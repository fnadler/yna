import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@iconify/react'

/** Feedback transitório de confirmação (ex.: "Dimensão salva."). Portalado
   pro fim do `<body>`, como o `Sheet` — por isso aparece por cima de
   qualquer painel aberto (Sheet/Modal) em vez de ficar preso atrás dele
   (mesmo problema de camada que o alerta de exclusão de tag já teve). Fecha
   sozinho depois de alguns segundos; não bloqueia interação (sem overlay,
   sem precisar de um clique pra dispensar). */
export function Toast({ message, onClose, duration = 2600 }: {
  message: string | null
  onClose: () => void
  duration?: number
}) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [message, duration, onClose])

  if (!message) return null

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2.5 rounded-lg border border-border bg-surface px-4 py-3 shadow-lg animate-yna-slide-up">
        <Icon icon="ph:check-circle-bold" width={18} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
        <span className="text-[13px] font-medium text-ink">{message}</span>
      </div>
    </div>,
    document.body,
  )
}
