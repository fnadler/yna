import { useEffect, type ReactNode } from 'react'
import { Icon } from '@iconify/react'

export interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  size?: 'default' | 'lg'
}

export function Modal({ open, title, onClose, children, size = 'default' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-[rgba(31,27,45,0.5)] backdrop-blur-sm md:items-center md:justify-center"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[90dvh] w-full flex-col rounded-t-lg bg-surface shadow-xl md:rounded-lg ${
          size === 'lg'
            ? 'md:max-w-2xl'
            : 'md:max-w-lg'
        }`}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-6 py-5">
          <h2 className="text-xl font-semibold text-ink">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-surface-hover"
          >
            <Icon icon="ph:x-bold" width={18} aria-hidden />
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-4 text-sm leading-relaxed text-ink-secondary">
          {children}
        </div>
      </div>
    </div>
  )
}
