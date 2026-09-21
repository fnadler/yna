import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { YnaIcon } from '../components/YnaIcons'
import { Card } from '../components/Card'
import { Modal } from '../components/Modal'
import { TopoSaida } from '../components/TopoSaida'
import { useApp } from '../contexts/AppContext'
import { nr1ColaboradorService } from '../services/nr1'

type Step = 1 | 2 | 3

/* Fluxo LGPD — mesma composição do questionário (`NR1BenQuestionario.tsx`):
   fundo em gradiente cobrindo a tela, um único card branco centralizado,
   com progresso, título e navegação (Anterior/Próximo) todos dentro do
   card. Antes esta tela usava `FocusLayout` (barra de topo só no desktop +
   barra de navegação fixa embaixo, fora do card) — trocado por pedido
   explícito de padronização: as duas telas devem se parecer com o
   questionário, não com um layout à parte. `TopoSaida` é a única coisa que
   sobra fora do card — uma linha fina (logo + Sair), pra dar a mesma saída
   que o `FocusLayout` oferecia sem herdar a barra inteira. */
export function Ben03Lgpd() {
  const [step, setStep] = useState<Step>(1)
  const [accepted, setAccepted] = useState(false)
  const [modal, setModal] = useState<'termos' | 'privacidade' | null>(null)
  const [enviando, setEnviando] = useState(false)
  const { nr1Iniciar, nr1Consentir } = useApp()
  const navigate = useNavigate()

  const ynaSees = [
    { icon: 'ph:notebook-bold', text: 'Suas respostas à avaliação, tratadas de forma anônima, sem vínculo com seu nome' },
    { icon: 'ph:user-circle-bold', text: 'Os dados da conta que você criar depois, se quiser acompanhar sua evolução' },
  ]

  const hrNeverSees = [
    'Suas respostas individuais',
    'Seu nome ligado a qualquer informação de saúde',
    'Se você criou conta ou acompanhou sua evolução',
    'Nenhum dado individual: só números de grupo, nunca de pessoas',
  ]

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => (s - 1) as Step)
    } else {
      navigate(-1)
    }
  }

  const handleAccept = async () => {
    setEnviando(true)
    const instrumento = await nr1ColaboradorService.instrumentoDaCampanha()
    if (!instrumento) {
      navigate('/despedida')
      return
    }
    nr1Iniciar(instrumento.campanha.id)
    nr1Consentir()
    navigate('/comecar')
  }

  const avancar = step === 1 ? () => setStep(2) : step === 2 ? () => setStep(3) : handleAccept

  return (
    <div className="flex min-h-dvh flex-col items-center overflow-x-hidden bg-yna-gradient px-5 py-6 lg:py-10">
      <TopoSaida exitTo="/despedida" className="mb-4 max-w-xl lg:mb-6" />

      <div key={step} className="w-full max-w-xl animate-yna-slide-up rounded-2xl border border-border bg-surface p-6 shadow md:p-9">
        {/* Sem barra de progresso aqui: é só um onboarding de 3 passos, não
           faz sentido tratar como um progresso "a completar" (diferente do
           questionário, que tem muito mais passos). */}

        {/* ── Passo 1: O que a YNA vê ─────────────────────────────────── */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-1 text-sm font-medium text-primary dark:text-primary-300">
                Antes de qualquer pergunta
              </p>
              <h1 className="text-[19px] font-heading font-semibold leading-snug text-ink md:text-[21px]">
                O que é seu fica com você.
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
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
          </div>
        )}

        {/* ── Passo 2: O que sua empresa nunca vê ────────────────────── */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-1 text-sm font-medium text-primary dark:text-primary-300">
                Sua privacidade
              </p>
              <h1 className="text-[19px] font-heading font-semibold leading-snug text-ink md:text-[21px]">
                Sua empresa nunca vê o que você compartilha.
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
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
          </div>
        )}

        {/* ── Passo 3: Como garantimos + decisão ──────────────────────── */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-1 text-sm font-medium text-primary dark:text-primary-300">
                Nossas garantias
              </p>
              <h1 className="text-[19px] font-heading font-semibold leading-snug text-ink md:text-[21px]">
                Como garantimos tudo isso.
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
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
          </div>
        )}

        {/* Navegação — Anterior/Próximo dentro do card, mesmo lugar e
           mesmo formato (secundário + primário, lado a lado) do
           questionário. */}
        <div className="mt-8 flex gap-3">
          <Button variant="secondary" className="flex-1" iconLeft="ph:arrow-left-bold" onClick={handleBack}>
            Anterior
          </Button>
          <Button
            className="flex-1"
            disabled={step === 3 && (!accepted || enviando)}
            iconRight="ph:arrow-right-bold"
            onClick={avancar}
          >
            {step === 3 ? 'Começar' : 'Próximo'}
          </Button>
        </div>

        {step === 3 && (
          <div className="mt-4 flex flex-col gap-2">
            <Button variant="ghost" fullWidth onClick={() => navigate('/despedida')}>
              Prefiro não continuar agora
            </Button>
            <p className="text-center text-[13px] leading-snug text-ink-secondary">
              Tudo bem. Seu convite continua válido. Volte quando fizer sentido pra você.
            </p>
          </div>
        )}
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
          A YNA aplica, em nome da sua empresa, a avaliação de riscos psicossociais exigida pela
          NR-1, com sigilo garantido por lei e por contrato. Este documento descreve seus direitos
          e os nossos deveres.
        </p>
        <h3 className="mb-1 font-semibold text-ink">2. Seus dados e seus direitos (LGPD)</h3>
        <p className="mb-3">
          Você pode acessar, corrigir e excluir seus dados, além de revogar o consentimento a
          qualquer momento, sem precisar justificar.
        </p>
        <h3 className="mb-1 font-semibold text-ink">3. O que nunca fazemos</h3>
        <p>
          Não vendemos dados. Não entregamos informação individual à sua empresa, em nenhuma
          hipótese: só agregados protegidos por k-anonimato.
        </p>
      </Modal>
    </div>
  )
}
