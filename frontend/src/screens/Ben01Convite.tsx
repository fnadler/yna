import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { YnaIcon } from '../components/YnaIcons'
import { inviteService } from '../services'

export function Ben01Convite() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'valid' | 'error'>('loading')
  const [errorType, setErrorType] = useState<'expired' | 'used' | 'invalid'>('invalid')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }
    inviteService.validate(token).then((result) => {
      if (result.valid) {
        setTimeout(() => {
          setStatus('valid')
          navigate('/bem-vindo', { replace: true })
        }, 500)
      } else {
        setErrorType(result.expired ? 'expired' : result.used ? 'used' : 'invalid')
        setStatus('error')
      }
    })
  }, [token, navigate])

  if (status === 'loading' || status === 'valid') {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-6 px-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50">
          <YnaIcon name="heart" size={28} className="text-primary animate-pulse" />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-ink">Verificando seu convite…</p>
          <p className="mt-1 text-sm text-ink-secondary">Um momento, por favor.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-warning-bg">
        <Icon icon="ph:envelope-simple-open-bold" width={28} className="text-warning" aria-hidden />
      </div>
      <div>
        <h1 className="text-xl font-semibold text-ink">
          {errorType === 'expired' && 'Este convite expirou'}
          {errorType === 'used' && 'Este convite já foi usado'}
          {errorType === 'invalid' && 'Convite não encontrado'}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          {errorType === 'expired' &&
            'O link que você recebeu não está mais válido. Entre em contato com o RH da sua empresa para receber um novo convite.'}
          {errorType === 'used' &&
            'Parece que você já criou sua conta por aqui. Tente acessar pelo link de login.'}
          {errorType === 'invalid' &&
            'Não encontramos esse convite. Verifique se o link está correto ou peça um novo ao RH.'}
        </p>
      </div>
      <Button variant="link" onClick={() => navigate('/convite/invalido')}>
        Ver opções de ajuda
      </Button>
    </div>
  )
}
