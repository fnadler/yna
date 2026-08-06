import { useState } from 'react'
import { Icon } from '@iconify/react'
import { MobileTopBar } from '../components/MobileTopBar'
import { PageHeader } from '../components/PageHeader'
import { Modal } from '../components/Modal'
import { PAGE_MAX_W } from '../lib/layout'

/* COL-05 — Conteúdo de apoio (P1). Peças curtas, estáticas, mockadas.
   RASCUNHO: pendente de curadoria clínica antes de qualquer piloto real
   (ver README, pendências herdadas). Nenhuma peça sugere terapia,
   diagnóstico ou substitui atendimento profissional. */

interface Peca {
  id: string
  icon: string
  titulo: string
  resumo: string
  corpo: string[]
}

const PECAS: Peca[] = [
  {
    id: 'sono',
    icon: 'ph:moon-stars-bold',
    titulo: 'Quando o sono não rende',
    resumo: 'Três ajustes pequenos que ajudam a dormir melhor em semanas puxadas.',
    corpo: [
      'Sono ruim raramente se resolve com força de vontade — geralmente é rotina.',
      'Tente manter o mesmo horário para deitar e acordar, mesmo nos fins de semana.',
      'Se a cabeça não desliga, anote o que está passando por ela antes de tentar dormir de novo.',
    ],
  },
  {
    id: 'sobrecarga',
    icon: 'ph:stack-bold',
    titulo: 'Quando a lista nunca acaba',
    resumo: 'Como notar sobrecarga antes que ela vire esgotamento.',
    corpo: [
      'Sobrecarga não é sempre volume de trabalho: às vezes é falta de clareza sobre prioridade.',
      'Perguntar "o que pode esperar?" em voz alta, para alguém, já ajuda a organizar a cabeça.',
      'Perceber cansaço que o fim de semana não resolve é sinal de prestar atenção, não de fraqueza.',
    ],
  },
  {
    id: 'limites',
    icon: 'ph:hand-palm-bold',
    titulo: 'Dizer que não dá',
    resumo: 'Um jeito direto de recusar sem se sentir culpado.',
    corpo: [
      'Você pode reconhecer o pedido e ainda assim dizer que não cabe agora.',
      'Frases como "não vou conseguir entregar isso com qualidade até [data]" abrem negociação sem esconder o limite.',
      'Limite dito com antecedência custa muito menos do que limite estourado depois.',
    ],
  },
  {
    id: 'pedir-ajuda',
    icon: 'ph:hands-praying-bold',
    titulo: 'Pedir ajuda não é o último recurso',
    resumo: 'Por que adiar o pedido de ajuda quase sempre piora o problema.',
    corpo: [
      'Muita gente só pede ajuda quando já não aguenta mais — e nesse ponto já custou mais caro.',
      'Pedir ajuda cedo é sinal de que você entende o próprio limite, não de que falhou.',
      'Se não sabe por onde começar, o canal de escuta e os contatos abaixo são um bom primeiro passo.',
    ],
  },
]

export function Col05Apoio() {
  const [aberta, setAberta] = useState<Peca | null>(null)

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MobileTopBar />
        <PageHeader
          title="Apoio"
          subtitle="Materiais curtos para os momentos entre uma resposta e outra."
          className="mt-2 lg:mt-0"
        />

        <div className="mb-2 flex items-center gap-2 rounded-lg bg-surface-2 px-4 py-3">
          <Icon icon="ph:info-bold" width={16} className="shrink-0 text-ink-secondary" aria-hidden />
          <p className="text-[12px] leading-relaxed text-ink-secondary">
            Rascunho: estes textos ainda não passaram por curadoria clínica.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PECAS.map((p) => (
            <button
              key={p.id}
              onClick={() => setAberta(p)}
              className="flex items-start gap-4 rounded-lg border border-border bg-surface p-5 text-left transition-colors hover:bg-surface-hover"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
                <Icon icon={p.icon} width={21} aria-hidden />
              </span>
              <span>
                <span className="block font-heading text-[15px] font-semibold text-ink">{p.titulo}</span>
                <span className="mt-1 block text-[13px] leading-relaxed text-ink-secondary">{p.resumo}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-border bg-surface p-5">
          <h2 className="font-heading text-[15px] font-semibold text-ink">Precisa de alguém agora?</h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-secondary">
            O CVV (Centro de Valorização da Vida) atende 24h, todos os dias: ligue{' '}
            <strong>188</strong> ou acesse cvv.org.br.
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
            Sua empresa também pode disponibilizar outros canais de apoio aqui (plano de saúde,
            programa de apoio ao colaborador, ambulatório) — quando configurados, aparecem nesta
            seção.
          </p>
        </div>
      </div>

      <Modal open={aberta !== null} title={aberta?.titulo ?? ''} onClose={() => setAberta(null)}>
        {aberta && (
          <div className="flex flex-col gap-3">
            {aberta.corpo.map((par, i) => (
              <p key={i} className="text-sm leading-relaxed text-ink-secondary">{par}</p>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
