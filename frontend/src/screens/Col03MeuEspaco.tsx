import { useOutletContext } from 'react-router-dom'
import { OptionCard } from '../components/OptionCard'
import { MobileTopBar } from '../components/MobileTopBar'
import type { AppLayoutContext } from '../components/AppLayout'
import { NR1AvaliacaoCard } from '../components/NR1AvaliacaoCard'
import { useApp } from '../contexts/AppContext'
import { PAGE_MAX_W } from '../lib/layout'

/* COL-03 — Meu espaço (absorve o NR1-BEN-01). Home de quem já tem conta: a
   primeira avaliação já foi respondida antes de existir conta (ver
   NR1BenConclusao/ColCriarConta), então este cartão só reaparece quando
   houver uma nova campanha/ciclo de reavaliação em campo. */

const atalhos = [
  { icon: 'ph:chart-line-bold', label: 'Minha evolução', desc: 'Como suas respostas mudam ao longo do tempo', to: '/minha-evolucao' },
  { icon: 'ph:megaphone-simple-bold', label: 'Canal de escuta', desc: 'Relato anônimo para situações que precisam de apuração', to: '/canal-escuta' },
  { icon: 'ph:hand-heart-bold', label: 'Apoio', desc: 'Conteúdo curto sobre sono, sobrecarga e limites', to: '/apoio' },
  { icon: 'ph:user-circle-bold', label: 'Meus dados', desc: 'Seus dados e seus direitos LGPD', to: '/meus-dados' },
]

export function Col03MeuEspaco() {
  const { user } = useApp()
  const { openNotifications, unread } = useOutletContext<AppLayoutContext>()

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8`}>
        <MobileTopBar unread={unread} onBellClick={openNotifications} />

        <div className="pt-2 pb-6 lg:pt-9 lg:pb-6">
          <h1 className="text-[26px] lg:text-[32px] font-medium tracking-[-0.02em] text-ink">
            Oi, {user.nickname}.
          </h1>
          <p className="mt-0.5 text-[15px] text-ink-secondary">Que bom ter você por aqui.</p>
        </div>

        <main className="pb-32 lg:pb-10 flex flex-col gap-4 lg:max-w-xl">
          <NR1AvaliacaoCard />

          <nav aria-label="Atalhos" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {atalhos.map((a) => (
              <OptionCard
                key={a.label}
                icon={a.icon}
                label={a.label}
                desc={a.desc}
                to={a.to}
                layout="shortcut"
              />
            ))}
          </nav>
        </main>
      </div>
    </div>
  )
}
