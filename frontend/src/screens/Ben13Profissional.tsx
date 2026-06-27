import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { ProfessionalProfileView } from '../components/ProfessionalProfileView'
import { professionals } from '../data/mock'

interface Ben13Props {
  proId?: string
  onClose?: () => void
  onSchedule?: () => void
}

export function Ben13Profissional({ proId, onClose, onSchedule }: Ben13Props = {}) {
  const { id: paramId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const pro = professionals.find((p) => p.id === (proId ?? paramId)) ?? professionals[0]!
  const isSheet = !!onClose

  return (
    <>
      {/* Page header — only in standalone (FlowLayout) mode */}
      {!isSheet && (
        <header className="hidden lg:flex items-center gap-3 px-5 lg:px-8 pb-3 pt-8 lg:pt-10">
          <button
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover"
          >
            <Icon icon="ph:arrow-left-bold" width={18} aria-hidden />
          </button>
          <h1 className="text-base font-semibold text-ink">Perfil do profissional</h1>
        </header>
      )}

      <ProfessionalProfileView
        pro={pro}
        variant={isSheet ? 'sheet' : 'standalone'}
        onClose={onClose}
        onBack={() => navigate('/matches')}
        onSchedule={isSheet ? onSchedule : () => navigate(`/agendar/${pro.id}`)}
      />
    </>
  )
}
