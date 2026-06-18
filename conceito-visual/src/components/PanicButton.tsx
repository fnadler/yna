import { Icon } from '@iconify/react'

/**
 * Botão de pânico (RF-CO-12.4) — sempre alcançável, tom sereno.
 * Presença constante sem alarme visual: cor de apoio, não sirene.
 */
export function PanicButton({ floating = false }: { floating?: boolean }) {
  return (
    <button
      className={`inline-flex min-h-[48px] items-center justify-center gap-2 whitespace-nowrap rounded-pill border-[1.5px] border-danger/45 bg-surface px-5 text-sm font-semibold text-danger-ink shadow-sm transition-colors hover:bg-danger-bg ${
        floating ? 'absolute bottom-[88px] left-1/2 z-10 -translate-x-1/2' : ''
      }`}
    >
      <Icon icon="ph:lifebuoy-bold" width={18} aria-hidden />
      Preciso de ajuda agora
    </button>
  )
}
