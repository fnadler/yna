import { Icon } from '@iconify/react'
import { Card } from '../components/Card'
import { PAGE_MAX_W } from '../lib/layout'
import { PageHeader } from '../components/PageHeader'
import { achievements } from '../data/mock'

export function Ben29Conquistas() {
  return (
    <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-12 lg:pt-10 pb-8 lg:pb-12`}>
      <PageHeader
        title="Suas conquistas"
        subtitle="Marcos do seu caminho. Cada um deles foi uma escolha que você fez por você."
      />

      <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
        {achievements.map((ach) => (
          <Card key={ach.id}>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50">
                <Icon icon={ach.icon} width={24} className="text-primary dark:text-primary-300" aria-hidden />
              </div>
              <div>
                <p className="font-semibold text-ink">{ach.title}</p>
                <p className="text-sm text-ink-secondary">{ach.description}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  {new Date(ach.earnedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </Card>
        ))}

        {/* Locked achievements */}
        {[
          { title: '4 semanas de check-in', desc: 'Continue assim. Você está chegando lá.' },
          { title: 'Duas sessões completas', desc: 'A consistência é onde a mudança acontece.' },
        ].map((locked) => (
          <Card key={locked.title} className="opacity-50">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-2">
                <Icon icon="ph:lock-bold" width={24} className="text-ink-muted" aria-hidden />
              </div>
              <div>
                <p className="font-semibold text-ink">{locked.title}</p>
                <p className="text-sm text-ink-muted">{locked.desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-center text-xs leading-snug text-ink-muted">
        As conquistas são pra você. Não são pontos, não são moedas, não vencem. São memória.
      </p>
    </div>
  )
}
