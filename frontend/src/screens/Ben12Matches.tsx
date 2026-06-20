import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Avatar } from '../components/Avatar'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Sheet } from '../components/Sheet'
import { professionals } from '../data/mock'
import type { Professional } from '../types'
import { Ben13Profissional } from './Ben13Profissional'
import { Ben14Agendamento } from './Ben14Agendamento'
import { Ben15Confirmacao } from './Ben15Confirmacao'

type SheetState =
  | { type: 'profile' | 'schedule'; proId: string }
  | { type: 'confirmation' }
  | null

export function Ben12Matches() {
  const [showWhy, setShowWhy] = useState(false)
  const [sheet, setSheet] = useState<SheetState>(null)
  const navigate = useNavigate()

  const selectedPro = sheet && 'proId' in sheet ? professionals.find((p) => p.id === sheet.proId) : null

  return (
    <>
      <main className="px-5 pb-10 pt-10 lg:px-8 lg:pt-10 lg:pb-16 animate-yna-slide-up">

        <div className="lg:max-w-[620px]">
          <p className="mb-1 text-sm font-medium text-primary dark:text-primary-300">
            Suas indicações
          </p>
          <h1 className="mt-1 text-[26px] lg:text-[40px] font-extralight leading-[1.15] lg:leading-[1.05] tracking-[-0.02em] text-ink">
            Três pessoas escolhidas{' '}
            <span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">pra você.</span>
          </h1>
          <p className="mt-2 text-[15px] lg:text-[17px] leading-relaxed text-ink-secondary">
            O algoritmo encontra. Gente confirma. Cada um desses perfis passou pela revisão de uma
            psicóloga da equipe Domus antes de chegar até aqui.
          </p>
        </div>

        <button
          onClick={() => setShowWhy((v) => !v)}
          className="mt-5 flex w-full items-center gap-2 rounded-lg border border-border bg-surface-2 px-4 py-3 font-heading text-left text-sm font-semibold text-ink transition-colors hover:bg-surface-hover lg:max-w-[620px]"
          aria-expanded={showWhy}
        >
          <Icon icon="ph:compass-bold" width={18} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
          <span className="flex-1">Por que esses três</span>
          <Icon icon={showWhy ? 'ph:caret-up-bold' : 'ph:caret-down-bold'} width={14} className="text-ink-secondary" aria-hidden />
        </button>

        {showWhy && (
          <div className="mt-2 rounded-lg bg-surface-2 px-4 py-3 text-sm leading-relaxed text-ink-secondary lg:max-w-[620px]">
            Você contou que vem sentindo ansiedade ligada ao trabalho e prefere uma escuta
            prática. Os três trabalham exatamente com isso, e têm horários que cabem na sua
            semana. Se nenhum fizer sentido, sem problema: é só pedir outras opções.
          </div>
        )}

        <div className="mt-6 flex flex-col gap-5 md:grid md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {professionals.map((pro) => (
            <ProfessionalCard
              key={pro.id}
              pro={pro}
              onViewProfile={() => setSheet({ type: 'profile', proId: pro.id })}
              onSchedule={() => setSheet({ type: 'schedule', proId: pro.id })}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-1.5">
          <Button variant="link" onClick={() => navigate('/matches/carregando')}>
            Quero ver outras opções
          </Button>
          <p className="text-center text-xs leading-snug text-ink-secondary">
            A primeira sessão é onde a confiança se testa. Trocar depois é normal, e simples.
          </p>
        </div>
      </main>

      <Sheet
        open={sheet !== null}
        onClose={() => setSheet(null)}
        title={
          sheet?.type === 'profile'
            ? (selectedPro?.name ?? 'Perfil')
            : sheet?.type === 'confirmation'
            ? 'Sessão agendada'
            : 'Agendar sessão'
        }
        icon={
          sheet?.type === 'profile' ? 'ph:user-bold'
            : sheet?.type === 'confirmation' ? 'ph:calendar-check-bold'
            : 'ph:calendar-plus-bold'
        }
        iconColor={
          sheet?.type === 'confirmation' ? 'text-success' : undefined
        }
        size={sheet?.type === 'profile' ? 'lg' : 'md'}
      >
        {sheet?.type === 'profile' && (
          <Ben13Profissional
            proId={sheet.proId}
            onClose={() => setSheet(null)}
            onSchedule={() => {
              const id = sheet?.proId
              if (id) setSheet({ type: 'schedule', proId: id })
            }}
          />
        )}
        {sheet?.type === 'schedule' && (
          <Ben14Agendamento
            proId={sheet.proId}
            allowRecurring={false}
            onConfirm={() => setSheet({ type: 'confirmation' })}
          />
        )}
        {sheet?.type === 'confirmation' && (
          <Ben15Confirmacao />
        )}
      </Sheet>
    </>
  )
}

function ProfessionalCard({
  pro,
  onViewProfile,
  onSchedule,
}: {
  pro: Professional
  onViewProfile: () => void
  onSchedule: () => void
}) {
  return (
    <Card padding="none" className="shadow-sm">
      <div
        className="relative flex aspect-video w-full items-center justify-center bg-yna-gradient-soft dark:bg-none dark:bg-surface-2"
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
          <Badge tone="solid" icon="ph:seal-check-bold">Curadoria Domus</Badge>
        </span>
      </div>

      <div className="flex flex-col gap-3 p-5 pt-4">
        <div>
          <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">{pro.name}</h3>
          <p className="mt-0.5 text-[13px] text-ink-secondary">{pro.crp}</p>
        </div>

        <div className="flex w-fit items-center gap-1.5 rounded-sm bg-primary-50 px-2.5 py-1.5 text-[12px] font-medium text-primary dark:text-primary-300">
          <Icon icon="ph:brain-bold" width={13} className="shrink-0" aria-hidden />
          {pro.approachLong}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {pro.specialties.map((s) => (
            <Badge key={s} tone="neutral">{s}</Badge>
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
          <Button variant="secondary" size="sm" className="flex-1" onClick={onViewProfile}>
            Ver perfil
          </Button>
          <Button size="sm" className="flex-1" onClick={onSchedule}>
            Agendar
          </Button>
        </div>
      </div>
    </Card>
  )
}
