import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Sheet } from './Sheet'
import { Input } from './Input'
import { Button } from './Button'

type Step = 'login' | 'forgot' | 'forgot-sent'

interface LoginSheetProps {
  open: boolean
  onClose: () => void
}

const titles: Record<Step, string> = {
  login: 'Entrar na YNA',
  forgot: 'Recuperar acesso',
  'forgot-sent': 'Link enviado',
}

const icons: Record<Step, string> = {
  login: 'ph:sign-in-bold',
  forgot: 'ph:key-bold',
  'forgot-sent': 'ph:envelope-bold',
}

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function LoginSheet({ open, onClose }: LoginSheetProps) {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('login')
  const [cpf, setCpf] = useState('')
  const [password, setPassword] = useState('')
  const [forgotCpf, setForgotCpf] = useState('')
  const [loading, setLoading] = useState(false)

  // Reset state after close animation
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep('login')
        setCpf('')
        setPassword('')
        setForgotCpf('')
        setLoading(false)
      }, 350)
      return () => clearTimeout(t)
    }
  }, [open])

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    navigate('/home')
  }

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    setStep('forgot-sent')
  }

  return (
    <Sheet open={open} onClose={onClose} title={titles[step]} icon={icons[step]} size="md">
      <div key={step} className="px-5 py-6 lg:px-6 animate-yna-slide-up">

        {/* ── Login ── */}
        {step === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <p className="text-sm leading-relaxed text-ink-secondary">
              Use o CPF e a senha que você criou no cadastro.
            </p>

            <Input
              label="CPF"
              type="text"
              inputMode="numeric"
              autoComplete="username"
              value={cpf}
              placeholder="000.000.000-00"
              onChange={(e) => setCpf(formatCpf(e.target.value))}
            />

            <Input
              label="Senha"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                size="lg"
                fullWidth
                disabled={loading || cpf.length < 14 || password.length < 1}
              >
                {loading ? 'Entrando…' : 'Entrar'}
              </Button>

              <button
                type="button"
                onClick={() => setStep('forgot')}
                className="py-1 text-center text-sm font-medium text-primary underline-offset-2 hover:underline dark:text-primary-300"
              >
                Esqueci minha senha
              </button>
            </div>
          </form>
        )}

        {/* ── Recuperar acesso ── */}
        {step === 'forgot' && (
          <form onSubmit={handleForgot} className="flex flex-col gap-5">
            <p className="text-sm leading-relaxed text-ink-secondary">
              Informe seu CPF e enviaremos um link de acesso para o e-mail cadastrado.
            </p>

            <Input
              label="CPF"
              type="text"
              inputMode="numeric"
              autoComplete="username"
              value={forgotCpf}
              placeholder="000.000.000-00"
              onChange={(e) => setForgotCpf(formatCpf(e.target.value))}
            />

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                size="lg"
                fullWidth
                disabled={loading || forgotCpf.length < 14}
              >
                {loading ? 'Enviando…' : 'Enviar link de acesso'}
              </Button>

              <button
                type="button"
                onClick={() => setStep('login')}
                className="flex items-center justify-center gap-1.5 py-1 text-center text-sm font-medium text-ink-secondary hover:text-ink"
              >
                <Icon icon="ph:arrow-left-bold" width={14} aria-hidden />
                Voltar ao login
              </button>
            </div>
          </form>
        )}

        {/* ── Link enviado ── */}
        {step === 'forgot-sent' && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-bg animate-yna-logo">
              <Icon icon="ph:envelope-simple-bold" width={28} className="text-success" aria-hidden />
            </div>

            <div className="animate-yna-slide-up animate-yna-delay-100">
              <p className="text-[15px] leading-relaxed text-ink-secondary">
                Enviamos um link de acesso para o e-mail cadastrado no CPF{' '}
                <strong className="font-semibold text-ink">{forgotCpf}</strong>.
                Verifique sua caixa de entrada — o link expira em 30 minutos.
              </p>
            </div>

            <div className="w-full animate-yna-slide-up animate-yna-delay-250">
              <Button size="lg" fullWidth onClick={onClose}>
                Entendido
              </Button>
              <button
                type="button"
                onClick={() => setStep('login')}
                className="mt-3 w-full py-1 text-center text-sm font-medium text-ink-secondary hover:text-ink"
              >
                Voltar ao login
              </button>
            </div>
          </div>
        )}

      </div>
    </Sheet>
  )
}
