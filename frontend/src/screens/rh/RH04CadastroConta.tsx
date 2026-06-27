import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { useRh } from '../../contexts/RhContext'

/* RH-04 — Cadastro da conta (criação da conta do usuário administrador).
   Mesmo modelo de tela do cadastro do beneficiário (wizard de 3 passos com
   barra de progresso, footer mobile e barra inferior fixa no desktop). */

type Step = 1 | 2 | 3

const fmtData = (d: string) => d.split('-').reverse().join('/')

export function RH04CadastroConta() {
  const { empresa, usuario } = useRh()
  const [step, setStep] = useState<Step>(1)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: usuario.nome,
    email: usuario.email,
    phone: '',
    cargo: '',
    password: '',
    confirmPassword: '',
    aceite: false,
  })
  const update = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }))

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step)
    else navigate('/rh/apresentacao/3')
  }

  const handleNext = async () => {
    if (step < 3) {
      setStep((s) => (s + 1) as Step)
    } else {
      setSaving(true)
      await new Promise((r) => setTimeout(r, 600))
      setSaving(false)
      navigate('/rh/conta-criada')
    }
  }

  const nextDisabled =
    saving ||
    (step === 1 && (form.name.trim().length < 3 || !/\S+@\S+\.\S+/.test(form.email))) ||
    (step === 2 && (form.password.length < 8 || form.password !== form.confirmPassword)) ||
    (step === 3 && !form.aceite)

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
                Você é a pessoa que vai administrar o painel da {empresa.nomeFantasia}.
              </p>
            </div>
            <Input label="Nome completo" value={form.name} onChange={(e) => update('name', e.target.value)} />
            <Input label="E-mail corporativo" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
            <Input label="Telefone (opcional)" type="tel" value={form.phone} hint="Usado só para avisos importantes do programa." onChange={(e) => update('phone', e.target.value)} />
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-ink">Sua área</span>
              <div className="grid grid-cols-2 gap-2">
                {['RH', 'DHO', 'Gestão de Pessoas', 'Outra'].map((c) => (
                  <button
                    key={c}
                    onClick={() => update('cargo', c)}
                    className={`min-h-[44px] rounded-lg border-[1.5px] px-3 font-heading text-sm font-medium transition-all ${
                      form.cargo === c ? 'border-primary bg-primary-50 text-ink' : 'border-border bg-surface text-ink-secondary hover:border-border-strong'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
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
              <p className="mb-1 text-sm font-medium text-primary dark:text-primary-300">Passo 3 · Sua empresa</p>
              <h1 className="mt-1 text-[24px] lg:text-[40px] font-extralight leading-[1.15] lg:leading-[1.05] tracking-[-0.02em] text-ink">
                Confirme e{' '}<span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">comece</span>
              </h1>
              <p className="mt-2 text-sm lg:text-[17px] leading-relaxed text-ink-secondary lg:max-w-[600px]">
                Estes dados foram definidos no contrato. Se algo estiver diferente, fale com a sua CSM.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-4 py-1">
              {[
                { label: 'Razão social', value: empresa.razaoSocial },
                { label: 'CNPJ', value: empresa.cnpj },
                { label: 'Plano', value: empresa.plano },
                { label: 'Licenças', value: `${empresa.licencasContratadas} beneficiários` },
                { label: 'Vigência', value: `${fmtData(empresa.contratoInicio)} a ${fmtData(empresa.contratoFim)}` },
              ].map((l) => (
                <div key={l.label} className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
                  <span className="text-[13px] text-ink-secondary">{l.label}</span>
                  <span className="text-right text-[13px] font-medium text-ink">{l.value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => update('aceite', !form.aceite)}
              className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-hover"
            >
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-[1.5px] transition-colors ${form.aceite ? 'border-primary bg-primary text-white' : 'border-border-strong bg-surface'}`}>
                {form.aceite && <Icon icon="ph:check-bold" width={12} aria-hidden />}
              </span>
              <span className="text-[13px] leading-relaxed text-ink-secondary">
                Li e aceito os <span className="font-semibold text-ink">Termos de Uso</span> e a <span className="font-semibold text-ink">Política de Privacidade</span> da YNA, em nome da empresa.
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
