import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@iconify/react'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  icon?: string
  iconColor?: string
  children: React.ReactNode
  size?: 'md' | 'lg'
}

export function Sheet({ open, onClose, title, icon, iconColor, children, size = 'lg' }: SheetProps) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  // Mount → wait one tick → animate in. On close → animate out → unmount.
  useEffect(() => {
    if (open) {
      setMounted(true)
      const t = setTimeout(() => setVisible(true), 10)
      return () => clearTimeout(t)
    } else {
      setVisible(false)
      const t = setTimeout(() => setMounted(false), 300)
      return () => clearTimeout(t)
    }
  }, [open])

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!mounted) return null

  const maxW = size === 'md' ? 'max-w-xl' : 'max-w-2xl'

  const header = (rounded: boolean) => (
    <div className={`flex shrink-0 items-center justify-between border-b border-border px-6 py-4 ${rounded ? 'rounded-t-lg' : ''}`}>
      <div className="flex min-w-0 items-center gap-2">
        {icon && (
          <Icon icon={icon} width={18} className={iconColor ?? 'text-ink-secondary'} aria-hidden />
        )}
        <h2 className="truncate text-base font-semibold text-ink">{title}</h2>
      </div>
      <button
        onClick={onClose}
        aria-label="Fechar"
        className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-surface-hover"
      >
        <Icon icon="ph:x-bold" width={16} aria-hidden />
      </button>
    </div>
  )

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* ── Mobile: full-screen slide-up ── */}
      <div
        role="dialog"
        aria-modal
        aria-label={title}
        className={`fixed inset-0 z-50 flex flex-col bg-surface md:hidden transition-transform duration-300 ease-out ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {header(false)}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>

      {/* ── Desktop/tablet: centered modal ── */}
      <div
        className={`fixed inset-0 z-50 hidden md:flex items-center justify-center p-8 transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          role="dialog"
          aria-modal
          aria-label={title}
          className={`relative flex w-full ${maxW} max-h-[88vh] flex-col rounded-lg bg-surface shadow-2xl transition-transform duration-300 ${
            visible ? 'scale-100' : 'scale-95'
          }`}
        >
          {header(true)}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
