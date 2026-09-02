import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { useApp } from '../contexts/AppContext'
import type { PerfilInteresseCuidado } from '../contexts/AppContext'

/* Criação de conta leve (RF-B01), em 3 passos — mesmo modelo do antigo
   cadastro do colaborador (wizard com barra de progresso, footer mobile e
   barra inferior fixa no desktop; ver RH04CadastroConta, que segue o mesmo
   padrão no lado do RH). Só é alcançada depois que a avaliação já foi
   enviada de forma anônima (ver NR1BenConclusao/ColConviteConta).

   Passo 3 substitui a antiga etapa de foto: são as duas perguntas opcionais
   de interesse em cuidado futuro, retiradas da tela de conclusão para não
   misturar "fechar o ciclo da avaliação" com "perfil comercial". */

type Step = 1 | 2 | 3
const GENEROS = ['Feminino', 'Masculino', 'Não-binário', 'Prefiro não informar']

export function ColCriarConta() {
  const navigate = useNavigate()
  const { user, criarConta } = useApp()
  const [step, setStep] = useState<Step>(1)
  const [salvando, setSalvando] = useState(false)

  const [form, setForm] = useState({
    nome: user.name,
    apelido: user.nickname,
    email: user.email,
    telefone: '',
    genero: '',
    senha: '',
    confirmarSenha: '',
  })
  const [interesse, setInteresse] = useState<PerfilInteresseCuidado>({})
  const update = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step)
    else navigate('/avaliacao/conta')
  }

  const handleNext = async () => {
    if (step < 3) {
      setStep((s) => (s + 1) as Step)
      return
    }
    setSalvando(true)
    await new Promise((r) => setTimeout(r, 600))
    criarConta({
      nome: form.nome.trim(),
      apelido: form.apelido.trim() || form.nome.trim().split(' ')[0],
      email: form.email.trim(),
      ...interesse,
    })
    setSalvando(false)
    navigate('/conta-criada')
  }

  const step1Ok = form.nome.trim().length >= 3 && /\S+@\S+\.\S+/.test(form.email)
  const step2Ok = form.senha.length >= 8 && form.senha === form.confirmarSenha
  const nextDisabled = salvando || (step === 1 && !step1Ok) || (step === 2 && !step2Ok)
  const ctaLabel = salvando ? 'Salvando…' : step < 3 ? 'Continuar' : 'Criar minha conta'

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
          <div className="h-2 w-full overflow-hidden rounded-pill bg-surface-2" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step} aria-label={`Passo ${step} de 3`}>
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
                Alguns dados já vieram do convite. Verifique e ajuste o que precisar.
              </p>
            </div>
            <Input label="Nome completo" value={form.nome} onChange={(e) => update('nome', e.target.value)} />
            <Input label="Como quer ser chamada/o" value={form.apelido} onChange={(e) => update('apelido', e.target.value)} hint="Só você vê. Usamos em mensagens para você." />
            <Input label="E-mail" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
            <Input label="Telefone (opcional)" type="tel" value={form.telefone} onChange={(e) => update('telefone', e.target.value)} hint="Usado só para avisos importantes, se você quiser." />
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-ink">Sexo / Gênero</span>
              <p className="text-[13px] text-ink-secondary">Opcional. Ajuda a garantir que a avaliação represente bem todos os perfis.</p>
              <div className="grid grid-cols-2 gap-2">
                {GENEROS.map((g) => (
                  <button
                    key={g}
                    onClick={() => update('genero', g)}
                    className={`min-h-[44px] rounded-lg border-[1.5px] px-3 font-heading text-sm font-medium transition-all ${
                      form.genero === g ? 'border-primary bg-primary-50 text-ink' : 'border-border bg-surface text-ink-secondary hover:border-border-strong'
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
              <p className="mb-1 text-sm font-medium text-primary dark:text-primary-300">Passo 2 · Acesso</p>
              <h1 className="mt-1 text-[24px] lg:text-[40px] font-extralight leading-[1.15] lg:leading-[1.05] tracking-[-0.02em] text-ink">
                <span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">Crie</span>{' '}sua senha
              </h1>
              <p className="mt-2 text-sm lg:text-[17px] leading-relaxed text-ink-secondary lg:max-w-[600px]">
                Mínimo de 8 caracteres. Recomendamos usar um gerenciador de senhas.
              </p>
            </div>
            <Input label="Senha" type="password" value={form.senha} onChange={(e) => update('senha', e.target.value)} hint="Mínimo 8 caracteres" />
            <Input
              label="Confirmar senha"
              type="password"
              value={form.confirmarSenha}
              onChange={(e) => update('confirmarSenha', e.target.value)}
              error={form.confirmarSenha && form.senha !== form.confirmarSenha ? 'As senhas não coincidem' : undefined}
            />
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-1 text-sm font-medium text-primary dark:text-primary-300">Passo 3 · Só mais duas</p>
              <h1 className="mt-1 text-[24px] lg:text-[40px] font-extralight leading-[1.15] lg:leading-[1.05] tracking-[-0.02em] text-ink">
                Perguntas{' '}<span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">opcionais</span>
              </h1>
              <p className="mt-2 text-sm lg:text-[17px] leading-relaxed text-ink-secondary lg:max-w-[600px]">
                Não fazem parte da avaliação: não entram no inventário nem no relatório da sua
                empresa. Servem só para a YNA entender, de forma agregada, se vale a pena trazer
                esse serviço para cá.
              </p>
            </div>

            <div>
              <p className="text-[14px] font-medium text-ink">
                Você teria interesse em um serviço de teleatendimento com profissionais da área de
                saúde mental, selecionados pela YNA?
              </p>
              <div className="mt-2 flex gap-2">
                {(['sim', 'talvez', 'nao'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setInteresse((i) => ({ ...i, interesseCuidado: v }))}
                    className={`flex-1 rounded-lg border-[1.5px] px-3 py-2.5 font-heading text-[13px] font-medium capitalize transition-colors ${
                      interesse.interesseCuidado === v ? 'border-primary bg-primary-50 text-ink' : 'border-border bg-surface text-ink-secondary hover:bg-surface-hover'
                    }`}
                  >
                    {v === 'nao' ? 'Não' : v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[14px] font-medium text-ink">
                Você já faz ou já fez algum tipo de tratamento de saúde mental?
              </p>
              <div className="mt-2 flex gap-2">
                {([
                  { v: 'sim' as const, label: 'Sim' },
                  { v: 'nao' as const, label: 'Não' },
                  { v: 'prefiro-nao-informar' as const, label: 'Prefiro não informar' },
                ]).map(({ v, label }) => (
                  <button
                    key={v}
                    onClick={() => setInteresse((i) => ({ ...i, emTratamento: v }))}
                    className={`flex-1 rounded-lg border-[1.5px] px-3 py-2.5 font-heading text-[12.5px] font-medium transition-colors ${
                      interesse.emTratamento === v ? 'border-primary bg-primary-50 text-ink' : 'border-border bg-surface text-ink-secondary hover:bg-surface-hover'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
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
