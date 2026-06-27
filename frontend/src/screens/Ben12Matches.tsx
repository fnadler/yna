import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { Sheet } from '../components/Sheet'
import { MatchCard } from '../components/MatchCard'
import { professionals } from '../data/mock'
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
            psicóloga da equipe YNA antes de chegar até aqui.
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
            <MatchCard
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
