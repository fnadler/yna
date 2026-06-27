import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { usePro } from '../../contexts/ProContext'

/* PRO-03 — Cadastro da conta (criação da conta do profissional).
   Mesmo modelo de tela do cadastro do beneficiário (wizard de 3 passos com
   barra de progresso, footer mobile e barra inferior fixa no desktop).
   Identidade + acesso + PJ. O perfil clínico vem no Onboarding (PRO-04). */

type Step = 1 | 2 | 3

export function Pro03CadastroConta() {
  const { profile } = usePro()
  const [step, setStep] = useState<Step>(1)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nome: profile.name.replace(/^(Dra?\.|Dr\.)\s*/i, ''),
    cpf: '',
    email: '',
    telefone: '',
    password: '',
    confirmPassword: '',
    cnpj: '',
    razaoSocial: '',
    aceite: false,
  })
  const update = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }))

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step)
    else navigate('/pro/apresentacao/3')
  }

  const handleNext = async () => {
    if (step < 3) {
      setStep((s) => (s + 1) as Step)
    } else {
      setSaving(true)
      await new Promise((r) => setTimeout(r, 600))
      setSaving(false)
      navigate('/pro/conta-criada')
    }
  }

  const nextDisabled =
    saving ||
    (step === 1 && (form.nome.trim().length < 3 || !/\S+@\S+\.\S+/.test(form.email))) ||
    (step === 2 && (form.password.length < 8 || form.password !== form.confirmPassword)) ||
    (step === 3 && (form.cnpj.trim().length < 5 || !form.aceite))

  const ctaLabel = saving ? 'Salvando…' : step < 3 ? 'Continuar' : 'Criar conta'

  return (
    <>
      {/* Header mobile: voltar + progresso */}
      <header className="flex lg:hidden items-center gap-3 px-5 pb-2 pt-8">
        <button
          onClick={handleBack}
          aria-label="Voltar"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover"
        >
          <Icon icon="ph:arrow-left-bold" width={18} aria-hidden />
        </button>
        <div className="flex-1">
          <div
            className="h-2 w-full overflow-hidden rounded-pill bg-surface-2"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={3}
            aria-valuenow={step}
            aria-label={`Passo ${step} de 3`}
          >
            <div className="h-full rounded-pill bg-gradient-to-r from-primary to-pink transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
        </div>
        <span className="shrink-0 font-mono text-xs font-medium text-ink-secondary">{step} de 3</span>
      </header>

      <main key={step} className="flex-1 px-5 pt-6 pb-8 lg:pt-10 lg:pb-28 animate-yna-slide-up">
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-1 text-sm font-medium text-primary dark:text-primary-300">Passo 1 · Quem é você</p>
              <h1 className="mt-1 text-[24px] lg:text-[40px] font-extralight leading-[1.15] lg:leading-[1.05] tracking-[-0.02em] text-ink">
                <span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">Confirme</span>{' '}seus dados
              </h1>
              <p className="mt-2 text-sm lg:text-[17px] leading-relaxed text-ink-secondary lg:max-w-[600px]">
                Já preenchemos o que recebemos da indicação. Verifique e ajuste o que precisar.
              </p>
            </div>
            <Input label="Nome completo" value={form.nome} onChange={(e) => update('nome', e.target.value)} />
            <Input label="CPF" value={form.cpf} onChange={(e) => update('cpf', e.target.value)} placeholder="000.000.000-00" inputMode="numeric" />
            <Input label="E-mail" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} hint="Para acessar a plataforma e receber avisos." />
            <Input label="Telefone (opcional)" type="tel" value={form.telefone} onChange={(e) => update('telefone', e.target.value)} placeholder="(11) 90000-0000" />
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-1 text-sm font-medium text-primary dark:text-primary-300">Passo 2 · Acesso</p>
              <h1 className="mt-1 text-[24px] lg:text-[40px] font-extralight leading-[1.15] lg:leading-[1.05] tracking-[-0.02em] text-ink">
                <span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">Crie</span>{' '}sua senha
              </h1>
              <p className="mt-2 text-sm lg:text-[17px] leading-relaxed text-ink-secondary lg:max-w-[600px]">
                Mínimo de 8 caracteres. Recomendamos usar um gerenciador de senhas.
              </p>
            </div>
            <Input label="Senha" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} hint="Mínimo 8 caracteres" />
            <Input
              label="Confirmar senha"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              error={form.confirmPassword && form.password !== form.confirmPassword ? 'As senhas não coincidem' : undefined}
            />
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-1 text-sm font-medium text-primary dark:text-primary-300">Passo 3 · Pessoa Jurídica</p>
              <h1 className="mt-1 text-[24px] lg:text-[40px] font-extralight leading-[1.15] lg:leading-[1.05] tracking-[-0.02em] text-ink">
                Sua <span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">PJ</span>
              </h1>
              <p className="mt-2 text-sm lg:text-[17px] leading-relaxed text-ink-secondary lg:max-w-[600px]">
                A YNA opera por nota fiscal — uma PJ ativa é necessária para atender pela plataforma.
              </p>
            </div>
            <Input label="CNPJ" value={form.cnpj} onChange={(e) => update('cnpj', e.target.value)} placeholder="00.000.000/0000-00" inputMode="numeric" />
            <Input label="Razão social" value={form.razaoSocial} onChange={(e) => update('razaoSocial', e.target.value)} />
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
        )}
      </main>

      {/* Footer mobile */}
      <footer className="px-5 pb-8 lg:hidden">
        <Button size="lg" fullWidth iconRight={step < 3 ? 'ph:arrow-right-bold' : undefined} onClick={handleNext} disabled={nextDisabled}>
          {ctaLabel}
        </Button>
      </footer>

      {/* Barra inferior desktop */}
      <div className="hidden lg:flex fixed bottom-0 left-0 right-0 z-20 h-[72px] items-center border-t border-border bg-surface/90 px-10 backdrop-blur-sm">
        <div className="w-40">
          <button onClick={handleBack} className="flex items-center gap-2 font-heading text-sm font-medium text-ink-secondary transition-colors hover:text-ink">
            <Icon icon="ph:arrow-left-bold" width={16} aria-hidden />
            Voltar
          </button>
        </div>
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <div className="h-1.5 w-52 overflow-hidden rounded-pill bg-surface-2">
            <div className="h-full rounded-pill bg-gradient-to-r from-primary to-pink transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
          <span className="font-mono text-[11px] text-ink-secondary">{step} de 3</span>
        </div>
        <div className="flex w-40 items-center justify-end gap-3">
          <Button onClick={handleNext} disabled={nextDisabled} iconRight={step < 3 ? 'ph:arrow-right-bold' : undefined}>
            {ctaLabel}
          </Button>
        </div>
      </div>
    </>
  )
}
