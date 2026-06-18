import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { YnaIcon } from '../components/YnaIcons'
import { Card } from '../components/Card'
import { Modal } from '../components/Modal'
import { useApp } from '../contexts/AppContext'

type Step = 1 | 2 | 3

export function Ben03Lgpd() {
  const [step, setStep] = useState<Step>(1)
  const [accepted, setAccepted] = useState(false)
  const [modal, setModal] = useState<'termos' | 'privacidade' | null>(null)
  const { setConsented } = useApp()
  const navigate = useNavigate()

  const ynaSees = [
    { icon: 'ph:notebook-bold', text: 'Suas respostas de triagem e check-ins, protegidas por sigilo profissional' },
    { icon: 'ph:clock-bold', text: 'Que suas sessões aconteceram e quanto duraram. Nunca o conteúdo: sessões não são gravadas' },
    { icon: 'ph:user-circle-bold', text: 'Seus dados de cadastro, para a sua conta funcionar' },
  ]

  const hrNeverSees = [
    'Se você usa ou não a terapia',
    'Suas respostas, conversas ou prontuário',
    'Seu nome ligado a qualquer informação de saúde',
    'Nenhum dado individual: só números de grupo, nunca de pessoas',
  ]

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => (s - 1) as Step)
    } else {
      navigate(-1)
    }
  }

  const handleAccept = () => {
    setConsented(true)
    navigate('/bem-comecar')
  }

  return (
    <>
      {/* Header: back button + progress bar — hidden on desktop (layout provides top bar) */}
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
            <div
              className="h-full rounded-pill bg-gradient-to-r from-primary to-pink transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>
        <span className="shrink-0 font-mono text-xs font-medium text-ink-secondary">{step} de 3</span>
      </header>

      {/* Step content */}
      <main key={step} className="px-5 pb-8 pt-6 lg:pt-10 lg:pb-28 animate-yna-slide-up">

        {/* ── Passo 1: O que a YNA vê ─────────────────────────────────── */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-1 text-sm font-medium text-primary dark:text-primary-300">
                Antes de qualquer pergunta
              </p>
              <h1 className="mt-1 text-[26px] lg:text-[40px] font-extralight leading-[1.15] lg:leading-[1.05] tracking-[-0.02em] text-ink">
                O que é seu{' '}
                <span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">
                  fica com você.
                </span>
              </h1>
              <p className="mt-3 text-[15px] lg:text-[17px] leading-relaxed text-ink-secondary lg:max-w-[600px]">
                Você precisa saber exatamente quem vê o quê, antes de contar qualquer coisa.
                Sem letras miúdas. É assim que a confiança começa.
              </p>
            </div>

            <Card>
              <div className="flex items-center gap-2">
                <YnaIcon name="eye" size={18} className="text-primary dark:text-primary-300" />
                <h2 className="text-[15px] font-semibold text-ink">O que a YNA vê</h2>
              </div>
              <ul className="flex flex-col gap-3">
                {ynaSees.map((item) => (
                  <li key={item.text} className="flex items-start gap-3 text-sm leading-snug text-ink-secondary">
                    <Icon icon={item.icon} width={16} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
                    {item.text}
                  </li>
                ))}
              </ul>
            </Card>

            <div className="lg:hidden">
              <Button size="lg" fullWidth iconRight="ph:arrow-right-bold" onClick={() => setStep(2)}>
                Próximo
              </Button>
            </div>
          </div>
        )}

        {/* ── Passo 2: O que sua empresa nunca vê ────────────────────── */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-1 text-sm font-medium text-primary dark:text-primary-300">
                Sua privacidade
              </p>
              <h1 className="text-[26px] lg:text-[40px] font-extralight leading-[1.15] lg:leading-[1.05] tracking-[-0.02em] text-ink">
                Sua empresa{' '}
                <span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">
                  nunca vê
                </span>{' '}
                o que você compartilha.
              </h1>
              <p className="mt-3 text-[15px] lg:text-[17px] leading-relaxed text-ink-secondary lg:max-w-[600px]">
                Não importa o que você conte: diagnóstico, história, sentimento. Isso é seu. E fica com você.
              </p>
            </div>

            <Card className="border-[1.5px] border-primary/35 bg-primary-50/60 dark:bg-primary-50">
              <div className="flex items-center gap-2">
                <Icon icon="ph:shield-check-bold" width={18} className="text-primary dark:text-primary-300" aria-hidden />
                <h2 className="text-[15px] font-semibold text-ink">
                  O que o RH da sua empresa <span className="underline decoration-2 underline-offset-2">nunca</span> vê
                </h2>
              </div>
              <ul className="flex flex-col gap-3">
                {hrNeverSees.map((text) => (
                  <li key={text} className="flex items-start gap-3 text-sm leading-snug text-ink-secondary">
                    <Icon icon="ph:x-circle-bold" width={16} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
                    {text}
                  </li>
                ))}
              </ul>
            </Card>

            <div className="lg:hidden">
              <Button size="lg" fullWidth iconRight="ph:arrow-right-bold" onClick={() => setStep(3)}>
                Próximo
              </Button>
            </div>
          </div>
        )}

        {/* ── Passo 3: Como garantimos + decisão ──────────────────────── */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-1 text-sm font-medium text-primary dark:text-primary-300">
                Nossas garantias
              </p>
              <h1 className="text-[26px] lg:text-[40px] font-extralight leading-[1.15] lg:leading-[1.05] tracking-[-0.02em] text-ink">
                Como{' '}
                <span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">
                  garantimos
                </span>{' '}
                tudo isso.
              </h1>
              <p className="mt-3 text-[15px] lg:text-[17px] leading-relaxed text-ink-secondary lg:max-w-[600px]">
                O sigilo não depende de confiança cega. Ele está embutido na arquitetura de como os dados saem daqui.
              </p>
            </div>

            <Card variant="sunken">
              <p className="text-sm leading-relaxed text-ink-secondary">
                Sua empresa recebe apenas um retrato do coletivo: médias e percentuais de grupos
                com <strong className="font-semibold text-ink">no mínimo 4 pessoas</strong>. Se um setor tem menos
                que isso, ele é somado a outro antes de qualquer número sair daqui. Esse método tem
                nome: k-anonimato. E é o que torna impossível chegar até você.
              </p>
            </Card>

            <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface">
              <button className="flex min-h-[52px] items-center justify-between gap-3 px-4 font-heading text-left text-sm font-medium text-ink transition-colors hover:bg-surface-hover">
                <span className="flex items-center gap-3">
                  <YnaIcon name="envelope" size={18} className="text-primary dark:text-primary-300" />
                  Falar com nossa encarregada de dados (DPO)
                </span>
                <Icon icon="ph:caret-right-bold" width={14} className="text-ink-secondary" aria-hidden />
              </button>
              <button className="flex min-h-[52px] items-center justify-between gap-3 px-4 font-heading text-left text-sm font-medium text-ink transition-colors hover:bg-surface-hover">
                <span className="flex items-center gap-3">
                  <Icon icon="ph:warning-circle-bold" width={18} className="text-primary dark:text-primary-300" aria-hidden />
                  Canal de denúncia direto, sem intermediários
                </span>
                <Icon icon="ph:caret-right-bold" width={14} className="text-ink-secondary" aria-hidden />
              </button>
            </div>

            <p className="text-[13px] leading-relaxed text-ink-secondary">
              Os documentos completos estão aqui, na íntegra:{' '}
              <button
                onClick={() => setModal('termos')}
                className="font-heading font-semibold text-primary underline underline-offset-2 dark:text-primary-300"
              >
                Termos de Uso
              </button>{' '}
              e{' '}
              <button
                onClick={() => setModal('privacidade')}
                className="font-heading font-semibold text-primary underline underline-offset-2 dark:text-primary-300"
              >
                Política de Privacidade
              </button>
              .
            </p>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border-[1.5px] border-border bg-surface p-4 transition-colors has-[:checked]:border-primary">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-xs border-[1.5px] border-border-strong bg-surface transition-colors checked:border-primary checked:bg-primary"
              />
              <span className="text-sm leading-snug text-ink">
                Li e entendi como meus dados são protegidos. Aceito os Termos de Uso e a Política de Privacidade.
              </span>
            </label>

            <div className="lg:hidden flex flex-col gap-3">
              <Button size="lg" fullWidth disabled={!accepted} iconRight="ph:arrow-right-bold" onClick={handleAccept}>
                Quero começar
              </Button>
              <Button variant="ghost" fullWidth onClick={() => navigate('/despedida')}>
                Prefiro não continuar agora
              </Button>
              <p className="text-center text-[13px] leading-snug text-ink-secondary">
                Tudo bem. Seu convite continua válido. Volte quando fizer sentido pra você.
              </p>
            </div>
          </div>
        )}

      </main>

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

        <div className="flex w-40 justify-end">
          <Button
            onClick={step === 1 ? () => setStep(2) : step === 2 ? () => setStep(3) : handleAccept}
            disabled={step === 3 && !accepted}
            iconRight="ph:arrow-right-bold"
          >
            {step === 3 ? 'Quero começar' : 'Próximo'}
          </Button>
        </div>
      </div>

      <Modal
        open={modal !== null}
        title={modal === 'termos' ? 'Termos de Uso' : 'Política de Privacidade'}
        onClose={() => setModal(null)}
        size="lg"
      >
        <p className="mb-3 rounded-sm bg-surface-2 p-3 text-[13px] text-ink-secondary">
          Documento jurídico completo em redação, de responsabilidade do jurídico YNA, com resumo
          "em humano" por FDN/YNA. Esta área exibirá o texto integral com âncoras por seção.
        </p>
        <h3 className="mb-1 font-semibold text-ink">1. Quem somos e o que fazemos</h3>
        <p className="mb-3">
          A YNA conecta você a cuidado em saúde mental com sigilo garantido por lei e por
          contrato. Este documento descreve seus direitos e os nossos deveres.
        </p>
        <h3 className="mb-1 font-semibold text-ink">2. Seus dados e seus direitos (LGPD)</h3>
        <p className="mb-3">
          Você pode acessar, corrigir e excluir seus dados, além de revogar o consentimento a
          qualquer momento, sem precisar justificar.
        </p>
        <h3 className="mb-1 font-semibold text-ink">3. O que nunca fazemos</h3>
        <p>
          Não vendemos dados. Não gravamos sessões. Não entregamos informação individual à sua
          empresa, em nenhuma hipótese.
        </p>
      </Modal>
    </>
  )
}
