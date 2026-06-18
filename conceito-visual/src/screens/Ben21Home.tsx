import { Icon } from '@iconify/react'
import { Avatar } from '../components/Avatar'
import { BottomNav } from '../components/BottomNav'
import { Button } from '../components/Button'
import { Card, CardEyebrow } from '../components/Card'
import { PanicButton } from '../components/PanicButton'
import { RadarChart } from '../components/RadarChart'
import { nextSession, wheelOfLife } from '../data/mock'

/**
 * BEN-21 · Home do Beneficiário (jornada contínua) — RF-CO-12.1
 * Próxima sessão, atalhos, Nina, Roda da Vida condensada, botão de pânico visível.
 */
export function Ben21Home() {
  const quickActions = [
    { icon: 'ph:calendar-plus-bold', label: 'Agendar' },
    { icon: 'ph:chat-circle-text-bold', label: 'Mensagens', badge: 2 },
    { icon: 'ph:flower-tulip-bold', label: 'Check-in' },
  ]

  return (
    <div className="flex h-full flex-col">
      <main className="flex-1 overflow-y-auto px-5 pb-28 pt-12">
        <header className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[26px] font-medium tracking-[-0.02em] text-ink">Oi, Mari.</h1>
            <p className="mt-0.5 text-[15px] text-ink-secondary">Que bom ter você por aqui.</p>
          </div>
          <button
            aria-label="Notificações"
            className="flex h-11 w-11 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover"
          >
            <Icon icon="ph:bell-bold" width={20} aria-hidden />
          </button>
        </header>

        <Card className="shadow-sm">
          <CardEyebrow>Sua próxima sessão</CardEyebrow>
          <div className="flex items-center gap-3">
            <Avatar initials={nextSession.professionalInitials} size={48} palette="lavender" />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-ink">{nextSession.professional}</p>
              <p className="text-sm text-ink-secondary">
                {nextSession.weekday}, {nextSession.date} · {nextSession.time}
              </p>
            </div>
          </div>
          <div className="mt-1 flex gap-2">
            <Button iconLeft="ph:waveform-bold" className="flex-1">
              Entrar na sala
            </Button>
            <Button variant="secondary" className="flex-1">
              Reagendar
            </Button>
          </div>
        </Card>

        <nav aria-label="Atalhos rápidos" className="mt-4 grid grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="relative flex min-h-[78px] flex-col items-center justify-center gap-1.5 rounded-lg border border-border bg-surface text-ink-secondary transition-all hover:-translate-y-px hover:bg-surface-hover hover:text-ink hover:shadow-sm"
            >
              <Icon icon={action.icon} width={22} className="text-primary dark:text-primary-300" aria-hidden />
              <span className="text-[13px] font-semibold">{action.label}</span>
              {action.badge && (
                <span className="absolute right-3 top-2.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-danger px-1 text-[10px] font-semibold text-white">
                  {action.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <Card variant="gradient" className="mt-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-pill bg-[rgba(31,27,45,0.14)]">
              <Icon icon="ph:sparkle-bold" width={18} className="text-[#1F1B2D]" aria-hidden />
            </span>
            <div>
              <p className="text-[15px] font-semibold text-[#1F1B2D]">Nina</p>
              <p className="text-xs font-medium text-[rgba(31,27,45,0.65)]">Com você, 24 horas por dia</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[rgba(31,27,45,0.8)]">
            Se algo apertar entre uma sessão e outra, você não precisa esperar. Estou aqui pra
            conversar — sem julgamento e no seu tempo.
          </p>
          <button className="mt-1 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-pill bg-[#1F1B2D] px-5 text-sm font-semibold text-white transition-transform hover:-translate-y-px">
            <Icon icon="ph:chats-circle-bold" width={16} aria-hidden />
            Conversar com a Nina
          </button>
        </Card>

        <Card className="mt-4">
          <div className="flex items-center justify-between">
            <CardEyebrow>Seu bem-estar</CardEyebrow>
            <Button variant="link" size="sm">
              Ver evolução
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <RadarChart values={wheelOfLife.values} labels={wheelOfLife.labels} size={158} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">Sua Roda da Vida</p>
              <p className="mt-1 text-[13px] leading-snug text-ink-secondary">
                Trabalho pediu mais atenção esta semana — e tudo bem. É pra isso que o
                acompanhamento existe.
              </p>
              <p className="mt-2 text-xs text-ink-muted">Último check-in: hoje</p>
            </div>
          </div>
        </Card>
      </main>

      <PanicButton floating />

      <BottomNav
        activeLabel="Início"
        items={[
          { icon: 'ph:house-bold', label: 'Início' },
          { icon: 'ph:calendar-bold', label: 'Agenda' },
          { icon: 'ph:sparkle-bold', label: 'Nina' },
          { icon: 'ph:chat-circle-text-bold', label: 'Mensagens', badge: 2 },
          { icon: 'ph:user-circle-bold', label: 'Perfil' },
        ]}
      />
    </div>
  )
}
