import { Icon } from '@iconify/react'
import { useNavigate } from 'react-router-dom'

export function PanicButton({ floating = false }: { floating?: boolean }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate('/emergencia')}
      className={`inline-flex min-h-[48px] items-center justify-center gap-2 whitespace-nowrap rounded-pill border-[1.5px] border-danger/45 bg-surface px-5 font-heading text-sm font-semibold text-danger-ink shadow-sm transition-colors hover:bg-danger-bg ${
        floating
          ? 'absolute bottom-[88px] left-1/2 z-10 -translate-x-1/2 lg:static lg:w-full lg:translate-x-0 lg:bottom-auto lg:mt-auto'
          : ''
      }`}
    >
      <Icon icon="ph:lifebuoy-bold" width={18} aria-hidden />
      Preciso de ajuda agora
    </button>
  )
}
