import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'
import { LogoYna } from '../../components/YnaLogo'
import { mngAuthService } from '../../services/mng'

/* MNG-00 — Acesso ao Manager (login + esqueci minha senha) — RF-YN-01.1/01.2.
   Tela standalone (fora do MngAppLayout). */
export function Mng00Login() {
  const navigate = useNavigate()
  const [modo, setModo] = useState<'login' | 'recuperar'>('login')
  const [email, setEmail] = useState('adriana@yna.com.br')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [enviado, setEnviado] = useState(false)

  const entrar = async () => {
    setErro(null); setLoading(true)
    const r = await mngAuthService.login(email, senha || 'demo')
    setLoading(false)
    if (r.ok) navigate('/mng/home')
    else setErro(r.message ?? 'Não foi possível entrar.')
  }

  const recuperar = async () => {
    setLoading(true)
    await mngAuthService.recover(email)
    setLoading(false); setEnviado(true)
  }

  const inputCls = 'w-full rounded border-[1.5px] border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-primary'

  return (
    <div className="flex min-h-dvh items-center justify-center bg-yna-gradient-soft px-5 py-10 dark:[background-image:var(--yna-gradient-dark)]">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 flex flex-col items-center text-center">
          <LogoYna className="h-8 text-primary dark:text-lavender" />
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-primary-50 px-3 py-1 text-[12px] font-semibold text-primary dark:text-primary-300">
            <Icon icon="ph:shield-star-bold" width={14} aria-hidden /> Manager · Backoffice
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-lg">
          {modo === 'login' ? (
            <>
              <h1 className="font-heading text-lg font-semibold text-ink">Entrar no Manager</h1>
              <p className="mt-1 text-[13px] text-ink-secondary">Acesse com seu e-mail corporativo YNA.</p>

              <label htmlFor="mng-email" className="mt-5 block text-[13px] font-semibold text-ink">E-mail</label>
              <input id="mng-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`mt-1.5 ${inputCls}`} />

              <label htmlFor="mng-senha" className="mt-4 block text-[13px] font-semibold text-ink">Senha</label>
              <input id="mng-senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" className={`mt-1.5 ${inputCls}`} />

              {erro && <p className="mt-3 flex items-center gap-1.5 text-[12.5px] text-danger-ink"><Icon icon="ph:warning-circle-bold" width={14} aria-hidden /> {erro}</p>}

              <Button fullWidth className="mt-5" iconLeft="ph:sign-in-bold" disabled={loading} onClick={entrar}>
                {loading ? 'Entrando…' : 'Entrar'}
              </Button>

              <div className="mt-4 flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-2 text-[12px] text-ink-secondary">
                <Icon icon="ph:lock-key-bold" width={14} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
                Verificação em duas etapas (MFA) exigida no acesso.
              </div>

              <button onClick={() => { setModo('recuperar'); setErro(null) }} className="mt-4 block w-full text-center text-[13px] font-medium text-primary hover:underline dark:text-primary-300">
                Esqueci minha senha
              </button>
            </>
          ) : enviado ? (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-bg">
                <Icon icon="ph:paper-plane-tilt-bold" width={28} className="text-success" aria-hidden />
              </div>
              <h1 className="mt-3 font-heading text-lg font-semibold text-ink">Link enviado</h1>
              <p className="mt-1 text-[13px] text-ink-secondary">Se <span className="font-medium text-ink">{email}</span> tiver conta, enviamos um link seguro para redefinir a senha.</p>
              <Button fullWidth variant="secondary" className="mt-5" onClick={() => { setModo('login'); setEnviado(false) }}>Voltar ao login</Button>
            </div>
          ) : (
            <>
              <h1 className="font-heading text-lg font-semibold text-ink">Recuperar senha</h1>
              <p className="mt-1 text-[13px] text-ink-secondary">Enviaremos um link seguro de redefinição para o seu e-mail.</p>
              <label htmlFor="mng-rec" className="mt-5 block text-[13px] font-semibold text-ink">E-mail</label>
              <input id="mng-rec" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`mt-1.5 ${inputCls}`} />
              <Button fullWidth className="mt-5" iconLeft="ph:paper-plane-tilt-bold" disabled={loading} onClick={recuperar}>
                {loading ? 'Enviando…' : 'Enviar link'}
              </Button>
              <button onClick={() => setModo('login')} className="mt-4 block w-full text-center text-[13px] font-medium text-primary hover:underline dark:text-primary-300">
                Voltar ao login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
