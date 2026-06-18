import { useState, useEffect, useCallback } from 'react'

type ServiceState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }

export function useService<T>(
  fn: () => Promise<T>,
  deps: unknown[] = [],
): ServiceState<T> & { reload: () => void } {
  const [state, setState] = useState<ServiceState<T>>({ status: 'idle' })

  const run = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      const data = await fn()
      setState({ status: 'success', data })
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Algo deu errado. Tente novamente.',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    void run()
  }, [run])

  return { ...state, reload: run }
}
