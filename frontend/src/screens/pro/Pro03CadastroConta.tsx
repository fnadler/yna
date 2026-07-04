import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { usePro } from '../../contexts/ProContext'

/* PRO-03 — Criação da conta do profissional (tela única).
   Identidade + acesso num só passo. Os dados da PJ, o perfil clínico e a
   formação são coletados depois, no cadastro do perfil (PRO-CAD-01). */
export function Pro03CadastroConta() {
  const { profile } = usePro()
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nome: profile.name.replace(/^(Dra?\.|Dr\.)\s*/i, ''),
    cpf: '',
    email: '',
    telefone: '',
    password: '',
    confirmPassword: '',
    aceite: false,
  })
  const update = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }))

  const handleBack = () => navigate('/pro/apresentacao/3')

  const invalid =
    saving ||
    form.nome.trim().length < 3 ||
    !/\S+@\S+\.\S+/.test(form.email) ||
    form.password.length < 8 ||
    form.password !== form.confirmPassword ||
    !form.aceite

  const handleSubmit = async () => {
    if (invalid) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    navigate('/pro/conta-criada')
  }

  const ctaLabel = saving ? 'Criando conta…' : 'Criar conta'

  return (
    <>
      {/* Header mobile: voltar */}
      <header className="flex lg:hidden items-center gap-3 px-5 pb-2 pt-8">
        <button
          onClick={handleBack}
          aria-label="Voltar"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover"
        >
          <Icon icon="ph:arrow-left-bold" width={18} aria-hidden />
        </button>
      </header>

      <main className="flex-1 px-5 pt-6 pb-8 lg:pt-10 lg:pb-28 animate-yna-slide-up">
        <div className="flex flex-col gap-5">
          <div>
            <p className="mb-1 text-sm font-medium text-primary dark:text-primary-300">Sua conta</p>
            <h1 className="mt-1 text-[24px] lg:text-[40px] font-extralight leading-[1.15] lg:leading-[1.05] tracking-[-0.02em] text-ink">
              <span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">Crie</span>{' '}sua conta
            </h1>
            <p className="mt-2 text-sm lg:text-[17px] leading-relaxed text-ink-secondary lg:max-w-[600px]">
              Já preenchemos o que recebemos da indicação. Confirme seus dados e defina uma senha de acesso.
            </p>
          </div>

          <Input label="Nome completo" value={form.nome} onChange={(e) => update('nome', e.target.value)} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="CPF" value={form.cpf} onChange={(e) => update('cpf', e.target.value)} placeholder="000.000.000-00" inputMode="numeric" />
            <Input label="Telefone (opcional)" type="tel" value={form.telefone} onChange={(e) => update('telefone', e.target.value)} placeholder="(11) 90000-0000" />
          </div>
          <Input label="E-mail" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} hint="Para acessar a plataforma e receber avisos." />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Senha" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} hint="Mínimo 8 caracteres" />
            <Input
              label="Confirmar senha"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              error={form.confirmPassword && form.password !== form.confirmPassword ? 'As senhas não coincidem' : undefined}
            />
          </div>

          <button
            onClick={() => update('aceite', !form.aceite)}
            className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-hover"
          >
            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-[1.5px] transition-colors ${form.aceite ? 'border-primary bg-primary text-white' : 'border-border-strong bg-surface'}`}>
              {form.aceite && <Icon icon="ph:check-bold" width={12} aria-hidden />}
            </span>
            <span className="text-[13px] leading-relaxed text-ink-secondary">
              Li e aceito os <span className="font-semibold text-ink">Termos do Profissional</span> e a <span className="font-semibold text-ink">Política de Privacidade</span> da YNA.
            </span>
          </button>
        </div>
      </main>

      {/* Footer mobile */}
      <footer className="px-5 pb-8 lg:hidden">
        <Button size="lg" fullWidth onClick={handleSubmit} disabled={invalid}>
          {ctaLabel}
        </Button>
      </footer>

      {/* Barra inferior desktop */}
      <div className="hidden lg:flex fixed bottom-0 left-0 right-0 z-20 h-[72px] items-center border-t border-border bg-surface/90 px-10 backdrop-blur-sm">
        <div className="flex-1">
          <button onClick={handleBack} className="flex items-center gap-2 font-heading text-sm font-medium text-ink-secondary transition-colors hover:text-ink">
            <Icon icon="ph:arrow-left-bold" width={16} aria-hidden />
            Voltar
          </button>
        </div>
        <Button onClick={handleSubmit} disabled={invalid}>
          {ctaLabel}
        </Button>
      </div>
    </>
  )
}
