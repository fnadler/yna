import { useState } from 'react'
import { MatchCard } from '../../components/MatchCard'
import { ProfessionalProfileView } from '../../components/ProfessionalProfileView'
import { usePro } from '../../contexts/ProContext'
import type { ProProfile, Professional } from '../../types'

/* Mapeia o perfil do profissional (ProProfile) para o formato que os
   componentes do beneficiário (MatchCard / ProfessionalProfileView) esperam,
   para reusar exatamente o mesmo layout. */
function toProfessional(p: ProProfile): Professional {
  return {
    id: p.id,
    name: p.name,
    crp: `CRP ${p.crp}`,
    approach: p.linhasTeoricas[0] ?? 'Abordagem clínica',
    approachLong: p.linhasTeoricas.join(' · ') || 'Abordagem clínica',
    specialties: p.areasAtuacao,
    nextSlot: 'Seg, 22/06 · 09h00',
    videoLength: p.videoUrl ? '1:30' : '—',
    whyThisMatch: p.comoTrabalha || p.bio,
    initials: p.initials,
    palette: p.palette,
    bio: p.bio,
    formation: p.formation,
    yearsExp: p.yearsExp,
    sessionDuration: p.sessionDuration,
  }
}

/* PRO-10 — pré-visualização "na perspectiva do beneficiário", com alternância
   entre a listagem de matches e o perfil completo. Botões inativos. */
export function Pro10PreviewContent() {
  const { profile } = usePro()
  const [view, setView] = useState<'lista' | 'completo'>('lista')
  const pro = toProfessional(profile)

  return (
    <div className="py-6">
      {/* Alternância de visualização */}
      <div className="px-5 lg:px-6">
        <div className="flex gap-1 rounded-lg bg-surface-2 p-1">
          {([['lista', 'Na listagem'], ['completo', 'Perfil completo']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`flex-1 rounded-lg py-2.5 font-heading text-sm font-semibold transition-all ${
                view === key ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[12.5px] text-ink-secondary">
          {view === 'lista'
            ? 'É assim que você aparece na lista de indicações do beneficiário.'
            : 'É assim que o beneficiário vê o seu perfil completo.'}
        </p>
      </div>

      {/* Conteúdo */}
      <div className="mt-5">
        {view === 'lista' ? (
          <div className="px-5 lg:px-6">
            <div className="mx-auto max-w-md">
              <MatchCard pro={pro} disabled />
            </div>
          </div>
        ) : (
          <ProfessionalProfileView pro={pro} variant="preview" />
        )}
      </div>

      <p className="mt-4 px-5 text-center text-[13px] text-ink-secondary lg:px-6">
        Esta é uma prévia. Os botões ficam ativos para o beneficiário.
      </p>
    </div>
  )
}
