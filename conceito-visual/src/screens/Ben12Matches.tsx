import { Icon } from '@iconify/react'
import { Avatar } from '../components/Avatar'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { professionals } from '../data/mock'
import type { Professional } from '../data/mock'

/**
 * BEN-12 · 3 Matches curados — RF-CO-06.1, RF-CO-06.2
 * Algoritmo + curadoria humana Domus, com vídeo de apresentação.
 * "Por que esses três" explica o critério com transparência.
 */
export function Ben12Matches() {
  return (
    <div className="flex h-full flex-col">
      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-12">
        <Badge tone="primary" icon="ph:seal-check-bold">
          Revisados pela equipe clínica Domus
        </Badge>
        <h1 className="mt-3 text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-ink">
          Três pessoas escolhidas pra você
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-secondary">
          O algoritmo encontra. Gente confirma. Cada um desses perfis passou pela revisão de uma
          psicóloga da equipe Domus antes de chegar até aqui.
        </p>

        <Card variant="sunken" className="mt-5">
          <div className="flex items-center gap-2">
            <Icon icon="ph:compass-bold" width={18} className="text-primary dark:text-primary-300" aria-hidden />
            <h2 className="text-[15px] font-semibold text-ink">Por que esses três</h2>
          </div>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Você contou que vem sentindo ansiedade ligada ao trabalho e prefere uma escuta
            prática. Os três trabalham exatamente com isso — e têm horários que cabem na sua
            semana. Se nenhum fizer sentido, sem problema: é só pedir outras opções.
          </p>
        </Card>

        <div className="mt-5 flex flex-col gap-5">
          {professionals.map((pro) => (
            <ProfessionalCard key={pro.id} pro={pro} />
          ))}
        </div>

        <div className="mt-6 flex flex-col items-center gap-1">
          <Button variant="link">Quero ver outras opções</Button>
          <p className="text-center text-xs leading-snug text-ink-muted">
            A primeira sessão é onde a confiança se testa. Trocar depois é normal — e simples.
          </p>
        </div>
      </main>
    </div>
  )
}

function ProfessionalCard({ pro }: { pro: Professional }) {
  return (
    <Card padding="none" className="shadow-sm">
      {/* Thumbnail do vídeo de apresentação — placeholder SVG, sem arquivo externo */}
      <div
        className="relative flex h-[150px] items-center justify-center bg-yna-gradient-soft dark:bg-none dark:bg-surface-2"
        role="img"
        aria-label={`Vídeo de apresentação de ${pro.name}, duração ${pro.videoLength}`}
      >
        <Avatar initials={pro.initials} size={64} palette={pro.palette} />
        <button
          aria-label={`Assistir apresentação de ${pro.name}`}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-[rgba(31,27,45,0.72)] text-white shadow-lg transition-transform hover:scale-105">
            <Icon icon="ph:play-fill" width={22} aria-hidden />
          </span>
        </button>
        <span className="absolute bottom-3 right-3 rounded-pill bg-[rgba(31,27,45,0.72)] px-2.5 py-1 font-mono text-[11px] font-medium text-white">
          {pro.videoLength}
        </span>
        <span className="absolute left-3 top-3">
          <Badge tone="solid" icon="ph:seal-check-bold">
            Curadoria Domus
          </Badge>
        </span>
      </div>

      <div className="flex flex-col gap-3 p-5 pt-4">
        <div>
          <h3 className="text-lg font-semibold tracking-[-0.01em] text-ink">{pro.name}</h3>
          <p className="text-[13px] text-ink-muted">
            {pro.crp} · {pro.approach}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {pro.specialties.map((s) => (
            <Badge key={s} tone="neutral">
              {s}
            </Badge>
          ))}
        </div>

        <p className="rounded-sm border-l-2 border-primary-300 bg-surface-2 px-3 py-2.5 text-[13px] leading-snug text-ink-secondary">
          {pro.whyThisMatch}
        </p>

        <p className="flex items-center gap-2 text-sm font-medium text-ink">
          <Icon icon="ph:calendar-bold" width={16} className="text-success" aria-hidden />
          Próximo horário: {pro.nextSlot}
        </p>

        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="flex-1">
            Ver perfil completo
          </Button>
          <Button size="sm" className="flex-1">
            Agendar 1ª sessão
          </Button>
        </div>
      </div>
    </Card>
  )
}
