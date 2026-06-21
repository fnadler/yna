import { Icon } from '@iconify/react'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { usePro } from '../../contexts/ProContext'

/* PRO-10 — pré-visualização "na perspectiva do beneficiário".
   Espelha o card de match do beneficiário (BEN-12/13) em modo leitura.
   Renderizado dentro de um Sheet a partir do PRO-09 (consistência com
   os fluxos de detalhe/ação do beneficiário). */
export function Pro10PreviewContent() {
  const { profile } = usePro()

  return (
    <div className="px-5 py-6 lg:px-6">
      {/* Card de match (read-only) */}
      <article className="mx-auto max-w-md overflow-hidden rounded-lg border border-border bg-surface">
        {/* Thumb do vídeo */}
        <div className="relative flex h-44 items-center justify-center bg-yna-gradient">
          <Icon icon={profile.videoUrl ? 'ph:play-circle-fill' : 'ph:video-camera-slash-bold'} width={48} className="text-white/90" aria-hidden />
          <span className="absolute left-3 top-3">
            <Badge tone="solid" icon="ph:seal-check-bold">Curadoria YNA</Badge>
          </span>
          {!profile.videoUrl && (
            <span className="absolute bottom-3 left-3 right-3 rounded-sm bg-black/30 px-2 py-1 text-center text-[11px] font-medium text-white backdrop-blur-sm">
              Sem vídeo de apresentação ainda
            </span>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3">
            <Avatar initials={profile.initials} size={48} palette={profile.palette} />
            <div className="min-w-0">
              <p className="font-heading font-semibold text-ink">{profile.name}</p>
              <p className="text-xs text-ink-muted">CRP {profile.crp}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {profile.linhasTeoricas.map((l) => (
              <Badge key={l} tone="primary">{l}</Badge>
            ))}
          </div>

          {profile.comoTrabalha && (
            <p className="mt-4 border-l-2 border-primary-200 pl-3 text-sm italic leading-relaxed text-ink-secondary">
              “{profile.comoTrabalha}”
            </p>
          )}

          {profile.areasAtuacao.length > 0 && (
            <div className="mt-4">
              <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">Atua com</p>
              <p className="mt-1 text-sm text-ink">{profile.areasAtuacao.join(' · ')}</p>
            </div>
          )}

          <div className="mt-4 flex items-center gap-1.5 text-sm text-ink-secondary">
            <Icon icon="ph:clock-bold" width={15} aria-hidden />
            Próximo horário: seg, 22/06 às 09:00
          </div>

          <div className="mt-5 flex gap-2">
            <Button fullWidth disabled>Agendar</Button>
            <Button variant="secondary" fullWidth disabled>Ver perfil</Button>
          </div>
        </div>
      </article>

      <p className="mt-4 text-center text-[13px] text-ink-secondary">
        Esta é uma prévia. Os botões ficam ativos para o beneficiário.
      </p>
    </div>
  )
}
