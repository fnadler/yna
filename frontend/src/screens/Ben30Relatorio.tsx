import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { PAGE_MAX_W } from '../lib/layout'
import { YnaIcon } from '../components/YnaIcons'
import { Card, CardEyebrow } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { StatTile } from '../components/StatTile'

const stats = [
  { value: '1', label: 'Sessão realizada', icon: 'ph:video-camera-bold' },
  { value: '3', label: 'Check-ins feitos', icon: 'ph:flower-tulip-bold', iconNode: <YnaIcon name="flower" size={20} className="text-primary dark:text-primary-300" /> },
  { value: '7', label: 'Dias ativos', icon: 'ph:calendar-check-bold' },
]

export function Ben30Relatorio() {
  return (
    <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-12 lg:pt-10 pb-8 lg:pb-12`}>
      <PageHeader
        title="Carta de progresso"
        subtitle="Uma visão do que você viveu aqui, para você guardar. Não para ninguém avaliar."
      />

      <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-8 lg:items-start">
        {/* Left: carta + nota */}
        <div>
          <Card variant="gradient" className="mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-ink-gradient/[0.14]">
                <YnaIcon name="heart" size={20} className="text-ink-gradient" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-gradient">Mariana, aqui está seu mês</p>
                <p className="text-xs text-ink-gradient-secondary">Período: 4 jun – 11 jun de 2026</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-ink-gradient-body">
              Você chegou aqui em um momento de cansaço. Completou a triagem, conheceu três
              profissionais e foi à sua primeira sessão. Isso é mais do que parece: é um passo
              concreto de cuidado com você mesma.
            </p>
          </Card>

          {/* Stats: 3-col no mobile, hidden on desktop (aparece à direita) */}
          <div className="mb-4 grid grid-cols-3 gap-3 lg:hidden">
            {stats.map((stat) => (
              <StatTile key={stat.label} icon={stat.icon} iconNode={stat.iconNode} value={stat.value} label={stat.label} layout="vertical" />
            ))}
          </div>

          <Card>
            <CardEyebrow>Seu registro pessoal</CardEyebrow>
            <p className="text-sm leading-relaxed text-ink-secondary">
              Esta carta é sua. Você pode exportar como PDF para guardar, ou simplesmente deixar aqui.
              Não é compartilhada, não vai para a empresa, não é avaliada por ninguém.
            </p>
            <p className="mt-1 text-xs text-ink-secondary flex items-center gap-1.5">
              <Icon icon="ph:lock-bold" width={13} aria-hidden />
              Só você acessa isso.
            </p>
          </Card>

          <div className="mt-4 lg:hidden">
            <Button variant="secondary" fullWidth iconLeft="ph:file-pdf-bold">
              Exportar como PDF
            </Button>
          </div>
        </div>

        {/* Right: stats + export (desktop only) */}
        <div className="hidden lg:flex lg:flex-col lg:gap-3">
          {stats.map((stat) => (
            <StatTile key={stat.label} icon={stat.icon} iconNode={stat.iconNode} value={stat.value} label={stat.label} layout="horizontal" />
          ))}
          <Button variant="secondary" fullWidth iconLeft="ph:file-pdf-bold" className="mt-1">
            Exportar como PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
