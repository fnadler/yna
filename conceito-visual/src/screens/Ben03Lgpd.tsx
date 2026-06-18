import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Modal } from '../components/Modal'

/**
 * BEN-03 · Tela de Sigilo LGPD (gate de confiança) — RF-CO-02.1, RF-CO-02.2
 * Cora-Cuidador puro. Transparência radical antes de qualquer coleta de dado.
 * Aceite por checkbox + "Quero começar" (RF-CO-02.3) · recusa sem nudge (RN-CO-03.2).
 */
export function Ben03Lgpd() {
  const [accepted, setAccepted] = useState(false)
  const [modal, setModal] = useState<'termos' | 'privacidade' | null>(null)

  const ynaSees = [
    { icon: 'ph:notebook-bold', text: 'Suas respostas de triagem e check-ins — protegidas por sigilo profissional' },
    { icon: 'ph:clock-bold', text: 'Que suas sessões aconteceram e quanto duraram. Nunca o conteúdo: sessões não são gravadas' },
    { icon: 'ph:user-circle-bold', text: 'Seus dados de cadastro, para a sua conta funcionar' },
  ]

  const hrNeverSees = [
    'Se você usa ou não a terapia',
    'Suas respostas, conversas ou prontuário',
    'Seu nome ligado a qualquer informação de saúde',
    'Qualquer dado individual — só números de grupo, nunca de pessoas',
  ]

  return (
    <div className="flex h-full flex-col">
      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-12">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
          <Icon icon="ph:lock-bold" width={24} aria-hidden />
        </div>
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          Antes de qualquer pergunta
        </p>
        <h1 className="mt-1 text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-ink">
          O que é seu fica com você.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
          Você precisa saber exatamente quem vê o quê — antes de contar qualquer coisa.
          Sem letras miúdas. É assim que a confiança começa.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <Card>
            <div className="flex items-center gap-2">
              <Icon icon="ph:eye-bold" width={18} className="text-primary dark:text-primary-300" aria-hidden />
              <h2 className="text-[15px] font-semibold text-ink">O que a YNA vê</h2>
            </div>
            <ul className="flex flex-col gap-3">
              {ynaSees.map((item) => (
                <li key={item.text} className="flex items-start gap-3 text-sm leading-snug text-ink-secondary">
                  <Icon icon={item.icon} width={16} className="mt-0.5 shrink-0 text-primary-400" aria-hidden />
                  {item.text}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="border-[1.5px] border-primary/35 bg-primary-50/60 dark:bg-primary-50">
            <div className="flex items-center gap-2">
              <Icon icon="ph:eye-slash-bold" width={18} className="text-primary dark:text-primary-300" aria-hidden />
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

          <Card variant="sunken">
            <div className="flex items-center gap-2">
              <Icon icon="ph:info-bold" width={18} className="text-ink-secondary" aria-hidden />
              <h2 className="text-[15px] font-semibold text-ink">Como isso funciona na prática</h2>
            </div>
            <p className="text-sm leading-relaxed text-ink-secondary">
              Sua empresa recebe apenas um retrato do coletivo: médias e percentuais de grupos
              com <strong className="font-semibold text-ink">no mínimo 4 pessoas</strong>. Se um setor tem menos
              que isso, ele é somado a outro antes de qualquer número sair daqui. Esse método tem
              nome — k-anonimato — e é o que torna impossível chegar até você.
            </p>
          </Card>

          <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface">
            <button className="flex min-h-[52px] items-center justify-between gap-3 px-4 text-left text-sm font-medium text-ink transition-colors hover:bg-surface-hover">
              <span className="flex items-center gap-3">
                <Icon icon="ph:envelope-bold" width={18} className="text-primary dark:text-primary-300" aria-hidden />
                Falar com nossa encarregada de dados (DPO)
              </span>
              <Icon icon="ph:caret-right-bold" width={14} className="text-ink-muted" aria-hidden />
            </button>
            <button className="flex min-h-[52px] items-center justify-between gap-3 px-4 text-left text-sm font-medium text-ink transition-colors hover:bg-surface-hover">
              <span className="flex items-center gap-3">
                <Icon icon="ph:warning-circle-bold" width={18} className="text-primary dark:text-primary-300" aria-hidden />
                Canal de denúncia — direto, sem intermediários
              </span>
              <Icon icon="ph:caret-right-bold" width={14} className="text-ink-muted" aria-hidden />
            </button>
          </div>

          <p className="text-[13px] leading-relaxed text-ink-secondary">
            Os documentos completos estão aqui, na íntegra:{' '}
            <button
              onClick={() => setModal('termos')}
              className="font-semibold text-primary underline underline-offset-2 dark:text-primary-300"
            >
              Termos de Uso
            </button>{' '}
            e{' '}
            <button
              onClick={() => setModal('privacidade')}
              className="font-semibold text-primary underline underline-offset-2 dark:text-primary-300"
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
              className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-xs border-[1.5px] border-border-strong bg-surface transition-colors checked:border-primary checked:bg-primary checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22><path d=%22M3.5 8.5l3 3 6-6.5%22 stroke=%22white%22 stroke-width=%222%22 fill=%22none%22 stroke-linecap=%22round%22/></svg>')]"
            />
            <span className="text-sm leading-snug text-ink">
              Li e entendi como meus dados são protegidos. Aceito os Termos de Uso e a Política de
              Privacidade.
            </span>
          </label>

          <Button size="lg" fullWidth disabled={!accepted} iconRight="ph:arrow-right-bold">
            Quero começar
          </Button>
          <Button variant="ghost" fullWidth>
            Prefiro não continuar agora
          </Button>
          <p className="-mt-2 text-center text-[13px] leading-snug text-ink-muted">
            Tudo bem. Seu convite continua válido — volte quando fizer sentido pra você.
          </p>
        </div>
      </main>

      <Modal
        open={modal !== null}
        title={modal === 'termos' ? 'Termos de Uso' : 'Política de Privacidade'}
        onClose={() => setModal(null)}
      >
        <p className="mb-3 rounded-sm bg-surface-2 p-3 text-[13px] text-ink-muted">
          Documento jurídico completo em redação — responsabilidade do jurídico YNA, com resumo
          “em humano” por FDN/YNA. Esta área exibirá o texto integral com âncoras por seção.
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
          empresa — em nenhuma hipótese.
        </p>
      </Modal>
    </div>
  )
}
