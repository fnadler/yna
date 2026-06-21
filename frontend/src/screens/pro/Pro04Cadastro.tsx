import { useState, type ChangeEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Chips } from '../../components/Chips'
import { LINHAS_TEORICAS as LINHAS, AREAS_ATUACAO as AREAS } from '../../data/proMock'

const TOTAL = 5

function UploadMock({ label, hint, file, onPick, accept }: { label: string; hint: string; file: string | null; onPick: (name: string) => void; accept: string }) {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.files?.[0]?.name
    if (name) onPick(name)
  }
  return (
    <div>
      <label className="flex cursor-pointer items-center gap-3 rounded-lg border-[1.5px] border-dashed border-border bg-surface-2 px-4 py-4 transition-colors hover:border-border-strong">
        <Icon icon={file ? 'ph:check-circle-bold' : 'ph:upload-simple-bold'} width={22} className={file ? 'text-success' : 'text-primary dark:text-primary-300'} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-semibold text-ink">{file ?? label}</p>
          <p className="mt-0.5 text-[13px] text-ink-secondary">{file ? 'Pronto — será validado pela YNA' : hint}</p>
        </div>
        <input type="file" accept={accept} className="sr-only" onChange={onChange} />
      </label>
    </div>
  )
}

export function Pro04Cadastro() {
  const { passo } = useParams<{ passo: string }>()
  const navigate = useNavigate()
  const step = Math.max(1, Math.min(TOTAL, parseInt(passo ?? '1', 10) || 1))

  const [form, setForm] = useState({
    nome: 'Marina Toledo', cpf: '', email: 'marina.toledo@exemplo.com', telefone: '',
    cnpj: '', razaoSocial: '', cartaoCnpj: null as string | null,
    crp: '', crpUf: '', linhas: [] as string[], areas: [] as string[],
    formacao: '', certificado: null as string | null,
    video: null as string | null,
  })
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))
  const toggle = (k: 'linhas' | 'areas', v: string) =>
    setForm((f) => ({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] }))

  const goTo = (n: number) => navigate(`/pro/cadastro/${n}`)
  const handleBack = () => (step > 1 ? goTo(step - 1) : navigate('/pro/boas-vindas'))
  const handleNext = () => (step < TOTAL ? goTo(step + 1) : navigate('/pro/financeiro/setup'))

  return (
    <>
      <header className="flex items-center gap-3 px-5 lg:px-0 pb-2 pt-8 lg:pt-10">
        <button
          onClick={handleBack}
          aria-label="Voltar"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover"
        >
          <Icon icon="ph:arrow-left-bold" width={18} aria-hidden />
        </button>
        <div
          className="h-2 flex-1 overflow-hidden rounded-pill bg-surface-2"
          role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL} aria-valuenow={step}
          aria-label={`Passo ${step} de ${TOTAL}`}
        >
          <div className="h-full rounded-pill bg-gradient-to-r from-primary to-pink transition-all duration-500" style={{ width: `${(step / TOTAL) * 100}%` }} />
        </div>
        <span className="shrink-0 font-mono text-xs font-medium text-ink-secondary">{step} de {TOTAL}</span>
      </header>

      <main key={step} className="px-5 lg:px-0 pt-4 pb-10 animate-yna-slide-up">
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-primary dark:text-primary-300">Etapa 1 · Sobre você</p>
              <h1 className="mt-1 font-heading text-[24px] font-medium tracking-[-0.02em] text-ink">Seus dados</h1>
            </div>
            <Input label="Nome completo" value={form.nome} onChange={(e) => set('nome', e.target.value)} />
            <Input label="CPF" value={form.cpf} onChange={(e) => set('cpf', e.target.value)} placeholder="000.000.000-00" inputMode="numeric" />
            <Input label="E-mail" value={form.email} onChange={(e) => set('email', e.target.value)} hint="Recebido da indicação Domus" />
            <Input label="Telefone (opcional)" value={form.telefone} onChange={(e) => set('telefone', e.target.value)} placeholder="(11) 90000-0000" inputMode="tel" />
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-primary dark:text-primary-300">Etapa 2 · Pessoa Jurídica</p>
              <h1 className="mt-1 font-heading text-[24px] font-medium tracking-[-0.02em] text-ink">Sua PJ</h1>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">A YNA opera por nota fiscal — uma PJ ativa é necessária para atender pela plataforma.</p>
            </div>
            <Input label="CNPJ" value={form.cnpj} onChange={(e) => set('cnpj', e.target.value)} placeholder="00.000.000/0000-00" inputMode="numeric" />
            <Input label="Razão social" value={form.razaoSocial} onChange={(e) => set('razaoSocial', e.target.value)} />
            <UploadMock label="Cartão CNPJ" hint="PDF ou imagem" accept=".pdf,image/*" file={form.cartaoCnpj} onPick={(n) => set('cartaoCnpj', n)} />
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-primary dark:text-primary-300">Etapa 3 · Clínico</p>
              <h1 className="mt-1 font-heading text-[24px] font-medium tracking-[-0.02em] text-ink">Sua atuação</h1>
            </div>
            <div className="grid grid-cols-[1fr_88px] gap-3">
              <Input label="Registro no conselho (CRP)" value={form.crp} onChange={(e) => set('crp', e.target.value)} placeholder="06/123456" />
              <Input label="UF" value={form.crpUf} onChange={(e) => set('crpUf', e.target.value.toUpperCase())} placeholder="SP" maxLength={2} />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-ink">Linha teórica <span className="font-normal text-ink-muted">· pode escolher mais de uma</span></p>
              <Chips options={LINHAS} selected={form.linhas} onToggle={(v) => toggle('linhas', v)} />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-ink">Áreas de atuação <span className="font-normal text-ink-muted">· pode escolher mais de uma</span></p>
              <Chips options={AREAS} selected={form.areas} onToggle={(v) => toggle('areas', v)} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-primary dark:text-primary-300">Etapa 4 · Formação</p>
              <h1 className="mt-1 font-heading text-[24px] font-medium tracking-[-0.02em] text-ink">Formação e certificados</h1>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">Você poderá adicionar mais ao longo do tempo — a YNA valida cada um antes de exibir no perfil.</p>
            </div>
            <Input label="Formação acadêmica" value={form.formacao} onChange={(e) => set('formacao', e.target.value)} placeholder="Ex.: Graduação em Psicologia — PUC-SP" />
            <UploadMock label="Adicionar certificado" hint="PDF ou imagem, até 5MB" accept=".pdf,image/*" file={form.certificado} onPick={(n) => set('certificado', n)} />
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-primary dark:text-primary-300">Etapa 5 · Apresentação</p>
              <h1 className="mt-1 font-heading text-[24px] font-medium tracking-[-0.02em] text-ink">Seu vídeo de apresentação</h1>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">É o que mais aproxima você de quem procura cuidado — beneficiários assistem antes de escolher.</p>
            </div>
            <div className="rounded-lg border border-border bg-surface-2 p-4">
              <p className="text-sm font-semibold text-ink">Orientações</p>
              <ul className="mt-2 flex flex-col gap-1.5 text-[13px] text-ink-secondary">
                <li className="flex gap-2"><Icon icon="ph:check-bold" width={14} className="mt-0.5 shrink-0 text-success" aria-hidden /> Formato MP4, na horizontal (16:9)</li>
                <li className="flex gap-2"><Icon icon="ph:check-bold" width={14} className="mt-0.5 shrink-0 text-success" aria-hidden /> Entre 1 e 2 minutos</li>
                <li className="flex gap-2"><Icon icon="ph:check-bold" width={14} className="mt-0.5 shrink-0 text-success" aria-hidden /> Conte como você trabalha e o que a pessoa pode esperar</li>
              </ul>
            </div>
            <UploadMock label="Enviar vídeo" hint="MP4, 1–2 min" accept="video/mp4" file={form.video} onPick={(n) => set('video', n)} />
            {!form.video && (
              <p className="text-[13px] text-ink-muted">
                Pode deixar para depois — mas ele fica <span className="font-semibold text-ink-secondary">pendente em destaque</span> no seu painel até ser enviado.
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Button size="lg" fullWidth iconRight="ph:arrow-right-bold" onClick={handleNext}>
            {step < TOTAL ? 'Continuar' : 'Avançar para o financeiro'}
          </Button>
          {step === TOTAL && !form.video && (
            <Button variant="ghost" fullWidth onClick={handleNext}>Pular vídeo por agora</Button>
          )}
        </div>
      </main>
    </>
  )
}
