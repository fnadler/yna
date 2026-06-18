import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Avatar } from '../components/Avatar'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { MobileTopBar } from '../components/MobileTopBar'
import { Sheet } from '../components/Sheet'
import { professionals } from '../data/mock'
import { useTheme } from '../contexts/ThemeContext'
import { PAGE_MAX_W } from '../lib/layout'
import { Ben13Profissional } from './Ben13Profissional'
import { Ben14Agendamento } from './Ben14Agendamento'
import { Ben15Confirmacao } from './Ben15Confirmacao'
import { TopBarIconButton } from '../components/TopBarIconButton'
import type { Professional } from '../types'

type Intent = 'switch' | 'complement' | 'explore'

type SheetState =
  | { type: 'profile' | 'schedule'; proId: string }
  | { type: 'confirmation' }
  | null

const LOADING_PHASES = [
  'Verificando disponibilidade…',
  'Comparando com suas preferências…',
  'Quase lá…',
]

const SUBTEXT: Record<Intent, string> = {
  switch:
    'Profissionais com perfil compatível ao seu cuidado atual. Sua terapeuta continua disponível enquanto você avalia.',
  complement:
    'Profissionais em outras especialidades para complementar o seu cuidado. Suas sessões atuais não são afetadas.',
  explore:
    'Opções disponíveis baseadas nas suas preferências de triagem. Não há compromisso em explorar.',
}

export function BenNovosMatches() {
  const navigate = useNavigate()
  const location = useLocation()
  const { dark, toggle: toggleTheme } = useTheme()

  const intent = ((location.state as { intent?: Intent } | null)?.intent) ?? 'explore'

  const [loading, setLoading] = useState(true)
  const [progressStarted, setProgressStarted] = useState(false)
  const [phase, setPhase] = useState(0)
  const [sheet, setSheet] = useState<SheetState>(null)
  const [requested, setRequested] = useState(false)

  useEffect(() => {
    const t0 = setTimeout(() => setProgressStarted(true), 10)
    const t1 = setTimeout(() => setPhase(1), 600)
    const t2 = setTimeout(() => setPhase(2), 1200)
    const t3 = setTimeout(() => setLoading(false), 1800)
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const selectedPro = sheet && 'proId' in sheet
    ? professionals.find((p) => p.id === sheet.proId)
    : null

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 animate-yna-logo">
            <Icon icon="ph:magnifying-glass-bold" width={26} className="text-primary" aria-hidden />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-ink">Buscando profissionais</p>
            <p className="mt-1 h-5 text-sm text-ink-secondary transition-all duration-300">
              {LOADING_PHASES[phase]}
            </p>
          </div>
        </div>
        <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-primary transition-all duration-[1700ms] ease-out"
            style={{ width: progressStarted ? '100%' : '0%' }}
          />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
        <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 pb-12 lg:pt-9`}>
          <MobileTopBar />

          {/* Page header */}
          <div className="mb-8 mt-2 flex items-start justify-between gap-4 lg:mt-0">
            <div className="max-w-xl">
              <button
                onClick={() => navigate(-1)}
                className="mb-3 hidden items-center gap-1.5 text-sm text-ink-secondary transition-colors hover:text-ink lg:flex"
              >
                <Icon icon="ph:arrow-left-bold" width={14} aria-hidden />
                Voltar
              </button>
              <h1 className="text-[26px] font-medium tracking-[-0.02em] text-ink lg:text-[32px]">
                Profissionais disponíveis
              </h1>
              <p className="mt-1 text-[15px] leading-relaxed text-ink-secondary">
                {SUBTEXT[intent]}
              </p>
            </div>
            <div className="hidden shrink-0 items-center gap-2 lg:flex">
              <TopBarIconButton
                icon={dark ? 'ph:sun-bold' : 'ph:moon-stars-bold'}
                label={dark ? 'Modo claro' : 'Modo escuro'}
                onClick={toggleTheme}
                pressed={dark}
              />
              <TopBarIconButton
                icon="ph:bell-bold"
                label="Notificações"
              />
            </div>
          </div>

          {/* Professional cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {professionals.map((pro, i) => (
              <div
                key={pro.id}
                className="animate-yna-slide-up"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <ProfessionalCard
                  pro={pro}
                  onViewProfile={() => setSheet({ type: 'profile', proId: pro.id })}
                  onSchedule={() => setSheet({ type: 'schedule', proId: pro.id })}
                />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-10 flex flex-col items-center gap-3 border-t border-border pt-8 animate-yna-slide-up" style={{ animationDelay: '270ms' }}>
            {requested ? (
              <div className="flex items-center gap-2.5 rounded-lg border border-success bg-success-bg px-5 py-3 text-sm font-medium text-ink">
                <Icon icon="ph:check-circle-bold" width={18} className="shrink-0 text-success" aria-hidden />
                Solicitação enviada. Nossa equipe vai buscar novas opções para você em breve.
              </div>
            ) : (
              <>
                <p className="text-sm text-ink-secondary">Nenhum desses perfis fez sentido?</p>
                <Button variant="secondary" onClick={() => setRequested(true)}>
                  Solicitar outras opções
                </Button>
              </>
            )}
            <button
              onClick={() => navigate('/home')}
              className="mt-1 text-sm text-ink-secondary transition-colors hover:text-ink"
            >
              Voltar para o início
            </button>
          </div>
        </div>
      </div>

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
        iconColor={sheet?.type === 'confirmation' ? 'text-success' : undefined}
        size={sheet?.type === 'profile' ? 'lg' : 'md'}
      >
        {sheet?.type === 'profile' && (
          <Ben13Profissional
            proId={sheet.proId}
            onClose={() => setSheet(null)}
            onSchedule={() => {
              const id = sheet?.type === 'profile' ? sheet.proId : undefined
              if (id) setSheet({ type: 'schedule', proId: id })
            }}
          />
        )}
        {sheet?.type === 'schedule' && (
          <Ben14Agendamento
            proId={sheet.proId}
            onConfirm={() => setSheet({ type: 'confirmation' })}
          />
        )}
        {sheet?.type === 'confirmation' && (
          <Ben15Confirmacao onDone={() => { setSheet(null); navigate('/home') }} />
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
    <Card padding="none" className="flex h-full flex-col shadow-sm">
      {/* Identity */}
      <div className="flex items-start gap-4 p-5 pb-4">
        <Avatar initials={pro.initials} size={52} palette={pro.palette} />
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="text-[15px] font-semibold leading-tight tracking-tight text-ink">
            {pro.name}
          </h3>
          <p className="mt-0.5 text-xs text-ink-muted">{pro.crp}</p>
          <p className="mt-2 flex items-center gap-1 text-xs font-medium text-primary dark:text-primary-300">
            <Icon icon="ph:brain-bold" width={12} aria-hidden />
            {pro.approach}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-5 pb-5">
        {/* Why this match */}
        <p className="rounded-md border-l-[3px] border-primary/30 bg-surface-2 px-3 py-2.5 text-[13px] leading-snug text-ink-secondary">
          {pro.whyThisMatch}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {pro.specialties.slice(0, 3).map((s) => (
            <Badge key={s} tone="neutral">{s}</Badge>
          ))}
        </div>

        {/* Next slot */}
        <p className="mt-auto flex items-center gap-2 text-sm font-medium text-ink">
          <Icon icon="ph:calendar-check-bold" width={15} className="shrink-0 text-success" aria-hidden />
          {pro.nextSlot}
        </p>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
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
