import { useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Chips } from '../../components/Chips'
import { Textarea } from '../../components/Textarea'
import { usePro } from '../../contexts/ProContext'
import { LINHAS_TEORICAS as LINHAS, AREAS_ATUACAO as AREAS } from '../../data/proMock'

/* PRO-04 — Onboarding: cadastro do perfil clínico para a plataforma.
   Mesmo modelo de tela da triagem do beneficiário (barra de progresso,
   título grande, opções/chips e barra inferior fixa no desktop), em 5 passos.
   Ao concluir, persiste no ProContext e segue para o setup financeiro. */

type Step = 1 | 2 | 3 | 4 | 5
const TOTAL = 5

function UploadMock({ label, hint, file, onPick }: { label: string; hint: string; file: string | null; onPick: (name: string) => void }) {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.files?.[0]?.name
    if (name) onPick(name)
  }
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border-[1.5px] border-dashed border-border bg-surface-2 px-4 py-4 transition-colors hover:border-border-strong">
      <Icon icon={file ? 'ph:check-circle-bold' : 'ph:upload-simple-bold'} width={22} className={file ? 'text-success' : 'text-primary dark:text-primary-300'} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-heading text-sm font-semibold text-ink">{file ?? label}</p>
        <p className="mt-0.5 text-[13px] text-ink-secondary">{file ? 'Pronto — será validado pela YNA' : hint}</p>
      </div>
      <input type="file" accept="video/mp4" className="sr-only" onChange={onChange} />
    </label>
  )
}

export function Pro04OnboardingPerfil() {
  const { updateProfile } = usePro()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    crp: '',
    crpUf: '',
    linhas: [] as string[],
    areas: [] as string[],
    comoTrabalha: '',
    video: null as string | null,
  })
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))
  const toggle = (k: 'linhas' | 'areas', v: string) =>
    setForm((f) => ({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] }))

  const isLast = step === TOTAL

  const finalizar = async () => {
    setSaving(true)
    updateProfile({
      crp: form.crpUf ? `${form.crpUf}/${form.crp}` : form.crp || undefined,
      linhasTeoricas: form.linhas,
      areasAtuacao: form.areas,
      comoTrabalha: form.comoTrabalha,
      videoUrl: form.video ? 'video-enviado.mp4' : undefined,
    })
    await new Promise((r) => setTimeout(r, 500))
    setSaving(false)
    navigate('/pro/financeiro/setup')
  }

  const handleNext = () => {
    if (isLast) finalizar()
    else setStep((s) => (s + 1) as Step)
  }
  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step)
    else navigate('/pro/conta-criada')
  }
  const handleSkip = () => {
    if (isLast) finalizar()
    else setStep((s) => (s + 1) as Step)
  }

  const canContinue =
    (step === 1 && form.crp.trim().length > 0) ||
    (step === 2 && form.linhas.length > 0) ||
    (step === 3 && form.areas.length > 0) ||
    step === 4 ||
    step === 5
  const skippable = step >= 4

  const titulo =
    step === 1 ? { intro: 'Perfil · 1 de 5', q: 'Seu registro no ', hl: 'conselho' }
      : step === 2 ? { intro: 'Perfil · 2 de 5', q: 'Sua ', hl: 'linha teórica' }
        : step === 3 ? { intro: 'Perfil · 3 de 5', q: 'Suas ', hl: 'áreas de atuação' }
          : step === 4 ? { intro: 'Perfil · 4 de 5', q: 'Como você ', hl: 'trabalha' }
            : { intro: 'Perfil · 5 de 5', q: 'Seu vídeo de ', hl: 'apresentação' }

  const ctaLabel = saving ? 'Concluindo…' : isLast ? 'Concluir perfil' : 'Continuar'

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
            aria-valuemax={TOTAL}
            aria-valuenow={step}
            aria-label={`Passo ${step} de ${TOTAL}`}
          >
            <div className="h-full rounded-pill bg-gradient-to-r from-primary to-pink transition-all duration-500" style={{ width: `${(step / TOTAL) * 100}%` }} />
          </div>
        </div>
        <span className="shrink-0 font-mono text-xs font-medium text-ink-secondary">{step} de {TOTAL}</span>
      </header>

      <main key={step} className="flex flex-1 flex-col px-5 pb-8 pt-6 lg:pt-10 lg:pb-28 animate-yna-slide-up">
        <p className="mb-2 text-sm font-medium text-primary dark:text-primary-300">{titulo.intro}</p>
        <h1 className="text-[24px] lg:text-[40px] font-extralight leading-[1.15] lg:leading-[1.05] tracking-[-0.02em] text-ink">
          {titulo.q}
          <span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">{titulo.hl}</span>
        </h1>

        {/* Passo 1 — registro */}
        {step === 1 && (
          <div className="mt-6 flex flex-col gap-5">
            <p className="text-sm leading-relaxed text-ink-secondary">Validamos o seu registro antes da ativação do perfil.</p>
            <div className="grid grid-cols-[1fr_88px] gap-3">
              <Input label="Registro no conselho (CRP)" value={form.crp} onChange={(e) => set('crp', e.target.value)} placeholder="06/123456" />
              <Input label="UF" value={form.crpUf} onChange={(e) => set('crpUf', e.target.value.toUpperCase())} placeholder="SP" maxLength={2} />
            </div>
          </div>
        )}

        {/* Passo 2 — linha teórica */}
        {step === 2 && (
          <div className="mt-6 flex flex-col gap-3">
            <p className="text-sm leading-relaxed text-ink-secondary">Pode escolher mais de uma.</p>
            <Chips options={LINHAS} selected={form.linhas} onToggle={(v) => toggle('linhas', v)} />
          </div>
        )}

        {/* Passo 3 — áreas */}
        {step === 3 && (
          <div className="mt-6 flex flex-col gap-3">
            <p className="text-sm leading-relaxed text-ink-secondary">As áreas em que você tem mais experiência.</p>
            <Chips options={AREAS} selected={form.areas} onToggle={(v) => toggle('areas', v)} />
          </div>
        )}

        {/* Passo 4 — como trabalha */}
        {step === 4 && (
          <div className="mt-6 flex flex-col gap-2">
            <Textarea
              placeholder="Conte como são as suas sessões e o que a pessoa pode esperar de você."
              aria-label="Como você trabalha"
              value={form.comoTrabalha}
              onChange={(e) => set('comoTrabalha', e.target.value)}
            />
            <p className="flex items-start gap-2 text-[13px] leading-snug text-ink-secondary">
              <Icon icon="ph:note-pencil-bold" width={14} className="mt-0.5 shrink-0" aria-hidden />
              Aparece no seu perfil para os beneficiários. Você pode ajustar depois.
            </p>
          </div>
        )}

        {/* Passo 5 — vídeo */}
        {step === 5 && (
          <div className="mt-6 flex flex-col gap-4">
            <div className="rounded-lg border border-border bg-surface-2 p-4">
              <p className="text-sm font-semibold text-ink">Orientações</p>
              <ul className="mt-2 flex flex-col gap-1.5 text-[13px] text-ink-secondary">
                <li className="flex gap-2"><Icon icon="ph:check-bold" width={14} className="mt-0.5 shrink-0 text-success" aria-hidden /> Formato MP4, na horizontal (16:9)</li>
                <li className="flex gap-2"><Icon icon="ph:check-bold" width={14} className="mt-0.5 shrink-0 text-success" aria-hidden /> Entre 1 e 2 minutos</li>
                <li className="flex gap-2"><Icon icon="ph:check-bold" width={14} className="mt-0.5 shrink-0 text-success" aria-hidden /> Conte como você trabalha e o que a pessoa pode esperar</li>
              </ul>
            </div>
            <UploadMock label="Enviar vídeo" hint="MP4, 1–2 min" file={form.video} onPick={(n) => set('video', n)} />
            {!form.video && (
              <p className="text-[13px] text-ink-muted">
                Pode deixar para depois — mas ele fica <span className="font-semibold text-ink-secondary">pendente em destaque</span> no seu painel até ser enviado.
              </p>
            )}
          </div>
        )}

        {/* Ações mobile */}
        <div className="mt-auto flex flex-col gap-2 pt-8 lg:hidden">
          <Button size="lg" fullWidth iconRight={isLast ? undefined : 'ph:arrow-right-bold'} disabled={!canContinue || saving} onClick={handleNext}>
            {ctaLabel}
          </Button>
          {skippable && (
            <Button variant="ghost" fullWidth onClick={handleSkip} disabled={saving}>
              {isLast ? 'Concluir sem vídeo' : 'Pular por agora'}
            </Button>
          )}
        </div>
      </main>

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
            <div className="h-full rounded-pill bg-gradient-to-r from-primary to-pink transition-all duration-500" style={{ width: `${(step / TOTAL) * 100}%` }} />
          </div>
          <span className="font-mono text-[11px] text-ink-secondary">{step} de {TOTAL}</span>
        </div>
        <div className="flex w-40 items-center justify-end gap-3">
          {skippable && (
            <button onClick={handleSkip} disabled={saving} className="font-heading text-sm font-medium text-ink-secondary transition-colors hover:text-ink disabled:opacity-40">
              Pular
            </button>
          )}
          <Button onClick={handleNext} disabled={!canContinue || saving} iconRight={isLast ? undefined : 'ph:arrow-right-bold'}>
            {ctaLabel}
          </Button>
        </div>
      </div>
    </>
  )
}
