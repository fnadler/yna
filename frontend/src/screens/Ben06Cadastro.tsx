import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { useApp } from '../contexts/AppContext'

type Step = 1 | 2 | 3

export function Ben06Cadastro() {
  const [step, setStep] = useState<Step>(1)
  const [saving, setSaving] = useState(false)
  const { user, setProfileComplete } = useApp()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: user.name,
    nickname: user.nickname,
    email: user.email,
    password: '',
    confirmPassword: '',
    gender: '',
    phone: '',
  })

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step)
    else navigate(-1)
  }

  const handleNext = async () => {
    if (step < 3) {
      setStep((s) => (s + 1) as Step)
    } else {
      setSaving(true)
      await new Promise((r) => setTimeout(r, 600))
      setProfileComplete(true)
      setSaving(false)
      navigate('/cadastro/agenda')
    }
  }

  const nextDisabled =
    saving || (step === 2 && form.password !== form.confirmPassword && form.confirmPassword.length > 0)

  return (
    <>
      {/* Header: back + progress — hidden on desktop (layout provides top bar) */}
      <header className="flex lg:hidden items-center gap-3 px-5 pb-2 pt-8">
        {step > 1 && (
          <button
            onClick={handleBack}
            aria-label="Voltar"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover"
          >
            <Icon icon="ph:arrow-left-bold" width={18} aria-hidden />
          </button>
        )}
        <div className="flex-1">
          <div
            className="h-2 w-full overflow-hidden rounded-pill bg-surface-2"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={3}
            aria-valuenow={step}
            aria-label={`Passo ${step} de 3`}
          >
            <div
              className="h-full rounded-pill bg-gradient-to-r from-primary to-pink transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>
        <span className="shrink-0 font-mono text-xs font-medium text-ink-secondary">{step} de 3</span>
      </header>

      <main key={step} className="flex-1 px-5 pt-6 pb-8 lg:pt-10 lg:pb-28 animate-yna-slide-up">
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-1 text-sm font-medium text-primary dark:text-primary-300">
                Passo 1 · Quem é você
              </p>
              <h1 className="mt-1 text-[24px] lg:text-[40px] font-extralight leading-[1.15] lg:leading-[1.05] tracking-[-0.02em] text-ink">
                <span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">Confirme</span>{' '}seus dados
              </h1>
              <p className="mt-2 text-sm lg:text-[17px] leading-relaxed text-ink-secondary lg:max-w-[600px]">
                Já preenchemos o que recebemos do RH. Verifique e ajuste o que precisar.
              </p>
            </div>
            <Input
              label="Nome completo"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
            />
            <Input
              label="Como quer ser chamada/o"
              value={form.nickname}
              hint="Só você vê. Usamos em mensagens para você."
              onChange={(e) => update('nickname', e.target.value)}
            />
            <Input
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
            <Input
              label="Telefone (opcional)"
              type="tel"
              value={form.phone}
              hint="Usado só para lembretes de sessão, se você quiser."
              onChange={(e) => update('phone', e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-ink">Sexo / Gênero</span>
              <p className="text-xs text-ink-secondary">Ajuda a encontrar profissionais com experiência no seu contexto.</p>
              <div className="grid grid-cols-2 gap-2">
                {['Feminino', 'Masculino', 'Não-binário', 'Prefiro não informar'].map((g) => (
                  <button
                    key={g}
                    onClick={() => update('gender', g)}
                    className={`min-h-[44px] rounded-lg border-[1.5px] px-3 font-heading text-sm font-medium transition-all ${
                      form.gender === g
                        ? 'border-primary bg-primary-50 text-ink'
                        : 'border-border bg-surface text-ink-secondary hover:border-border-strong'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-1 text-sm font-medium text-primary dark:text-primary-300">
                Passo 2 · Acesso
              </p>
              <h1 className="mt-1 text-[24px] lg:text-[40px] font-extralight leading-[1.15] lg:leading-[1.05] tracking-[-0.02em] text-ink">
                <span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">Crie</span>{' '}sua senha
              </h1>
              <p className="mt-2 text-sm lg:text-[17px] leading-relaxed text-ink-secondary lg:max-w-[600px]">
                Mínimo de 8 caracteres. Nunca compartilhamos sua senha.
              </p>
            </div>
            <Input
              label="Senha"
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              hint="Mínimo 8 caracteres"
            />
            <Input
              label="Confirmar senha"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              error={
                form.confirmPassword && form.password !== form.confirmPassword
                  ? 'As senhas não coincidem'
                  : undefined
              }
            />
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center gap-6 pt-4 text-center">
            <div>
              <p className="mb-1 text-sm font-medium text-primary dark:text-primary-300">
                Passo 3 · Foto (opcional)
              </p>
              <h1 className="mt-1 text-[24px] lg:text-[40px] font-extralight leading-[1.15] lg:leading-[1.05] tracking-[-0.02em] text-ink">
                Uma foto,{' '}
                <span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">se quiser</span>
              </h1>
              <p className="mt-2 text-sm lg:text-[17px] leading-relaxed text-ink-secondary lg:max-w-[600px]">
                Totalmente opcional. Só você e seu profissional veem. Pode pular se preferir.
              </p>
            </div>
            <button className="flex h-24 w-24 items-center justify-center rounded-pill border-2 border-dashed border-border bg-surface-2 text-ink-secondary transition-colors hover:border-primary hover:text-primary">
              <Icon icon="ph:camera-plus-bold" width={28} aria-hidden />
            </button>
            <p className="text-xs text-ink-secondary">JPG ou PNG · até 5 MB</p>
          </div>
        )}
      </main>

      {/* Mobile footer — hidden on desktop */}
      <footer className="px-5 pb-8 lg:hidden">
        <Button
          size="lg"
          fullWidth
          iconRight={step < 3 ? 'ph:arrow-right-bold' : undefined}
          onClick={handleNext}
          disabled={nextDisabled}
        >
          {saving ? 'Salvando…' : step < 3 ? 'Continuar' : 'Finalizar cadastro'}
        </Button>
        {step === 3 && (
          <Button variant="ghost" fullWidth className="mt-2" onClick={handleNext}>
            Pular por agora
          </Button>
        )}
      </footer>

      {/* Desktop bottom nav bar */}
      <div className="hidden lg:flex fixed bottom-0 left-0 right-0 z-20 h-[72px] items-center border-t border-border bg-surface/90 px-10 backdrop-blur-sm">
        <div className="w-40">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 font-heading text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
          >
            <Icon icon="ph:arrow-left-bold" width={16} aria-hidden />
            Voltar
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center gap-1.5">
          <div className="h-1.5 w-52 overflow-hidden rounded-pill bg-surface-2">
            <div
              className="h-full rounded-pill bg-gradient-to-r from-primary to-pink transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-ink-secondary">{step} de 3</span>
        </div>

        <div className="flex w-40 items-center justify-end gap-3">
          {step === 3 && (
            <button
              onClick={handleNext}
              className="font-heading text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
            >
              Pular
            </button>
          )}
          <Button onClick={handleNext} disabled={nextDisabled} iconRight={step < 3 ? 'ph:arrow-right-bold' : undefined}>
            {saving ? 'Salvando…' : step < 3 ? 'Continuar' : 'Finalizar cadastro'}
          </Button>
        </div>
      </div>
    </>
  )
}
