import type { ReactNode } from 'react'
import { Icon } from '@iconify/react'

export interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/** Modal contido na moldura do celular (position absolute dentro do PhoneFrame). */
export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null
  return (
    <div className="absolute inset-0 z-20 flex items-end bg-[rgba(14,13,24,0.55)]" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[85%] w-full flex-col rounded-t-xl bg-surface shadow-xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-11 w-11 items-center justify-center rounded-pill text-ink-secondary transition-colors hover:bg-surface-hover"
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
