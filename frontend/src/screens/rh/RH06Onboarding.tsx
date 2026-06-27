import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { useService } from '../../hooks/useService'
import { rhBeneficiarioService, rhDepartamentoService } from '../../services/rh'
import type { RhImportResult } from '../../types'

/* RH-06 — Onboarding: cadastro dos beneficiários em lote ou individualmente.
   Mesmo modelo de tela da triagem do beneficiário (barra de progresso,
   título grande, opções e barra inferior fixa no desktop), com 3 passos. */

type Step = 1 | 2 | 3
type Metodo = 'lote' | 'individual'
const TOTAL = 3

export function RH06Onboarding() {
  const navigate = useNavigate()
  const deps = useService(() => rhDepartamentoService.list(), [])
  const departamentos = deps.status === 'success' ? deps.data : []

  const [step, setStep] = useState<Step>(1)
  const [metodo, setMetodo] = useState<Metodo | null>(null)
  const [enviar, setEnviar] = useState<'agora' | 'depois' | null>(null)
  const [saving, setSaving] = useState(false)

  // Passo 2 — lote
  const [importFase, setImportFase] = useState<'inicio' | 'processando' | 'resultado'>('inicio')
  const [resultado, setResultado] = useState<RhImportResult | null>(null)

  // Passo 2 — individual
  const [form, setForm] = useState({ nome: '', cpf: '', email: '', dep: '' })
  const [adicionados, setAdicionados] = useState(0)
  const [addSaving, setAddSaving] = useState(false)

  const isLast = step === TOTAL

  const processarPlanilha = async () => {
    setImportFase('processando')
    const r = await rhBeneficiarioService.importar(154)
    setResultado(r)
    setImportFase('resultado')
  }

  const adicionarIndividual = async () => {
    const dep = form.dep || departamentos[0]?.id || ''
    if (form.nome.trim().length < 3 || !/\S+@\S+\.\S+/.test(form.email) || !dep) return
    setAddSaving(true)
    await rhBeneficiarioService.create({ nomeCompleto: form.nome, cpf: form.cpf, emailCorporativo: form.email, departamentoId: dep })
    setAddSaving(false)
    setAdicionados((n) => n + 1)
    setForm({ nome: '', cpf: '', email: '', dep })
  }

  const finalizar = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    setSaving(false)
    navigate('/rh/home')
  }

  const handleNext = () => {
    if (isLast) finalizar()
    else setStep((s) => (s + 1) as Step)
  }
  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step)
    else navigate('/rh/conta-criada')
  }

  const canContinue =
    (step === 1 && metodo !== null) ||
    (step === 2 && (metodo === 'lote' ? importFase === 'resultado' : adicionados > 0)) ||
    (step === 3 && enviar !== null)

  const ctaLabel = saving ? 'Concluindo…' : isLast ? 'Ir para o painel' : 'Continuar'

  const titulo =
    step === 1
      ? { intro: 'Onboarding · 1 de 3', q: 'Como você quer ', hl: 'começar?' }
      : step === 2
        ? metodo === 'lote'
          ? { intro: 'Onboarding · 2 de 3', q: 'Importe a sua ', hl: 'planilha' }
          : { intro: 'Onboarding · 2 de 3', q: 'Adicione ', hl: 'pessoa por pessoa' }
        : { intro: 'Onboarding · 3 de 3', q: 'Quando enviar os ', hl: 'convites?' }

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

        {/* Passo 1 — método */}
        {step === 1 && (
          <div className="mt-6 flex flex-col gap-3" role="radiogroup" aria-label="Método de cadastro">
            {[
              { id: 'lote' as Metodo, icon: 'ph:table-bold', label: 'Importar uma planilha', desc: 'Cadastre o time todo de uma vez com o modelo da YNA.' },
              { id: 'individual' as Metodo, icon: 'ph:user-plus-bold', label: 'Adicionar individualmente', desc: 'Inclua pessoa por pessoa, ideal para poucos cadastros.' },
            ].map((o) => {
              const sel = metodo === o.id
              return (
                <button
                  key={o.id}
                  role="radio"
                  aria-checked={sel}
                  onClick={() => setMetodo(o.id)}
                  className={`flex min-h-[72px] items-center gap-4 rounded-lg border-[1.5px] px-4 py-4 text-left transition-all ${
                    sel ? 'border-primary bg-primary-50 shadow-sm' : 'border-border bg-surface hover:border-border-strong hover:bg-surface-hover'
                  }`}
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${sel ? 'bg-primary text-white' : 'bg-primary-50 text-primary dark:text-primary-300'}`}>
                    <Icon icon={o.icon} width={22} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading text-[15px] font-semibold text-ink">{o.label}</span>
                    <span className="block text-[13px] text-ink-secondary">{o.desc}</span>
                  </span>
                  <span aria-hidden className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-pill border-[1.5px] transition-colors ${sel ? 'border-primary bg-primary text-white' : 'border-border-strong'}`}>
                    {sel && <Icon icon="ph:check-bold" width={13} />}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Passo 2 — execução */}
        {step === 2 && metodo === 'lote' && (
          <div className="mt-6 flex flex-col gap-4">
            {importFase === 'inicio' && (
              <>
                <p className="text-sm leading-relaxed text-ink-secondary">
                  Baixe o modelo, preencha com nome completo, CPF, data de nascimento, departamento e e-mail
                  corporativo, e envie. Validamos tudo antes de cadastrar.
                </p>
                <button className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-hover">
                  <Icon icon="ph:download-simple-bold" width={20} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">Baixar modelo de planilha</p>
                    <p className="text-[12px] text-ink-secondary">modelo-beneficiarios-yna.xlsx</p>
                  </div>
                </button>
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-[1.5px] border-dashed border-border-strong bg-surface-2 px-4 py-8 text-center transition-colors hover:border-primary">
                  <Icon icon="ph:upload-simple-bold" width={28} className="text-ink-muted" aria-hidden />
                  <span className="text-sm font-semibold text-ink">Selecionar planilha preenchida</span>
                  <span className="text-[12px] text-ink-muted">CSV ou XLSX, até 5.000 linhas</span>
                  <input type="file" accept=".csv,.xlsx" className="hidden" onChange={processarPlanilha} />
                </label>
              </>
            )}
            {importFase === 'processando' && (
              <div className="flex flex-col items-center gap-3 py-10 text-ink-secondary">
                <Icon icon="ph:spinner-gap-bold" width={28} className="animate-spin text-primary dark:text-primary-300" aria-hidden />
                <p className="text-sm">Validando a planilha…</p>
              </div>
            )}
            {importFase === 'resultado' && resultado && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-success/30 bg-success-bg p-3 text-center">
                    <p className="text-2xl font-bold text-success">{resultado.validos}</p>
                    <p className="text-[11px] text-ink-secondary">Válidos</p>
                  </div>
                  <div className="rounded-lg border border-warning/30 bg-warning-bg p-3 text-center">
                    <p className="text-2xl font-bold text-warning-ink">{resultado.duplicados}</p>
                    <p className="text-[11px] text-ink-secondary">Duplicados</p>
                  </div>
                  <div className="rounded-lg border border-danger/30 bg-danger-bg p-3 text-center">
                    <p className="text-2xl font-bold text-danger">{resultado.erros.length}</p>
                    <p className="text-[11px] text-ink-secondary">Com erro</p>
                  </div>
                </div>
                {resultado.erros.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[13px] font-semibold text-ink">Você pode corrigir depois, no painel:</p>
                    {resultado.erros.map((e) => (
                      <div key={e.linha} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[12px]">
                        <span className="font-mono text-ink-muted">L{e.linha}</span>
                        <span className="min-w-0 flex-1 truncate text-ink">{e.nome}</span>
                        <span className="shrink-0 text-danger">{e.erro}</span>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => { setImportFase('inicio'); setResultado(null) }} className="self-start font-heading text-sm font-medium text-primary transition-colors hover:text-primary-600 dark:text-primary-300">
                  Enviar outra planilha
                </button>
              </>
            )}
          </div>
        )}

        {step === 2 && metodo === 'individual' && (
          <div className="mt-6 flex flex-col gap-4">
            <Input label="Nome completo" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} placeholder="Como consta no RH" />
            <Input label="CPF" value={form.cpf} onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))} placeholder="Apenas números" />
            <Input label="E-mail corporativo" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="nome@empresa.com" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink">Departamento</label>
              <Select
                value={form.dep || departamentos[0]?.id || ''}
                onChange={(v) => setForm((f) => ({ ...f, dep: v }))}
                ariaLabel="Departamento"
                options={departamentos.map((d) => ({ value: d.id, label: d.nome }))}
              />
            </div>
            <Button variant="secondary" iconLeft="ph:plus-bold" onClick={adicionarIndividual} disabled={addSaving}>
              {addSaving ? 'Adicionando…' : 'Adicionar à lista'}
            </Button>
            {adicionados > 0 && (
              <p className="flex items-center gap-2 rounded-lg bg-success-bg px-4 py-3 text-[13px] text-success-ink">
                <Icon icon="ph:check-circle-bold" width={16} aria-hidden />
                {adicionados} beneficiário(s) adicionado(s).
              </p>
            )}
          </div>
        )}

        {/* Passo 3 — convites */}
        {step === 3 && (
          <div className="mt-6 flex flex-col gap-3" role="radiogroup" aria-label="Envio de convites">
            {[
              { id: 'agora' as const, icon: 'ph:paper-plane-tilt-bold', label: 'Enviar agora', desc: 'Os convites saem assim que você concluir o onboarding.' },
              { id: 'depois' as const, icon: 'ph:clock-bold', label: 'Enviar depois', desc: 'Dispare em lote no painel, alinhado à sua campanha interna.' },
            ].map((o) => {
              const sel = enviar === o.id
              return (
                <button
                  key={o.id}
                  role="radio"
                  aria-checked={sel}
                  onClick={() => setEnviar(o.id)}
                  className={`flex min-h-[72px] items-center gap-4 rounded-lg border-[1.5px] px-4 py-4 text-left transition-all ${
                    sel ? 'border-primary bg-primary-50 shadow-sm' : 'border-border bg-surface hover:border-border-strong hover:bg-surface-hover'
                  }`}
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${sel ? 'bg-primary text-white' : 'bg-primary-50 text-primary dark:text-primary-300'}`}>
                    <Icon icon={o.icon} width={22} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading text-[15px] font-semibold text-ink">{o.label}</span>
                    <span className="block text-[13px] text-ink-secondary">{o.desc}</span>
                  </span>
                  <span aria-hidden className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-pill border-[1.5px] transition-colors ${sel ? 'border-primary bg-primary text-white' : 'border-border-strong'}`}>
                    {sel && <Icon icon="ph:check-bold" width={13} />}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Ações mobile */}
        <div className="mt-auto flex flex-col gap-2 pt-8 lg:hidden">
          <Button size="lg" fullWidth iconRight={isLast ? undefined : 'ph:arrow-right-bold'} disabled={!canContinue || saving} onClick={handleNext}>
            {ctaLabel}
          </Button>
          {step === 2 && (
            <Button variant="ghost" fullWidth onClick={() => setStep(3)} disabled={saving}>
              Fazer isso depois
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
          {step === 2 && (
            <button onClick={() => setStep(3)} disabled={saving} className="font-heading text-sm font-medium text-ink-secondary transition-colors hover:text-ink disabled:opacity-40">
              Depois
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
