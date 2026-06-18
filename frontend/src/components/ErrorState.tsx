import { Icon } from '@iconify/react'
import { Button } from './Button'

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-danger-bg">
        <Icon icon="ph:warning-circle-bold" width={28} className="text-danger" aria-hidden />
      </div>
      <div>
        <p className="font-semibold text-ink">Algo não saiu como esperado</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
          {message ?? 'Não foi possível carregar. Verifique sua conexão e tente novamente.'}
        </p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
