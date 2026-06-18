import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'
import { mockSession } from '../data/mock'

interface Ben20Props {
  onConfirm?: () => void
  onBack?: () => void
}

export function Ben20Rematch({ onConfirm, onBack }: Ben20Props = {}) {
  const { id } = useParams<{ id: string }>()
  const [shareRecord, setShareRecord] = useState<boolean | null>(null)
  const navigate = useNavigate()

  return (
    <div className="flex min-h-dvh flex-col px-5 pt-5 lg:pt-12 pb-8">
      <div className="mb-8">
        <h1 className="text-[24px] font-medium leading-[1.2] tracking-[-0.02em] text-ink">
          Conhecer outros profissionais
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          Antes de encontrar as novas opções, uma pergunta rápida.
        </p>
      </div>

      <div className="mb-6 rounded-lg border border-border bg-surface p-4">
        <div className="mb-3 flex items-center gap-3">
          <Avatar
            initials={mockSession.professionalInitials}
            size={48}
            palette={mockSession.professionalPalette}
          />
          <div>
            <p className="text-sm font-semibold text-ink">{mockSession.professional}</p>
            <p className="text-xs text-ink-muted">1 sessão realizada</p>
          </div>
        </div>
        <p className="text-sm font-semibold text-ink">
          Compartilhar seu histórico com o próximo profissional?
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">
          Isso inclui suas respostas da triagem e anotações de sessão (se houver). Ajuda o novo profissional a entender seu contexto sem você precisar repetir tudo.
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border-[1.5px] border-border bg-surface p-3 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary-50">
            <input
              type="radio"
              name="share"
              checked={shareRecord === true}
              onChange={() => setShareRecord(true)}
              className="h-4 w-4 accent-primary"
            />
            <span className="text-sm font-medium text-ink">Sim, compartilhar</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border-[1.5px] border-border bg-surface p-3 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary-50">
            <input
              type="radio"
              name="share"
              checked={shareRecord === false}
              onChange={() => setShareRecord(false)}
              className="h-4 w-4 accent-primary"
            />
            <span className="text-sm font-medium text-ink">Não, começar do zero</span>
          </label>
        </div>
      </div>

      <p className="mb-6 flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
        <Icon icon="ph:lock-bold" width={14} className="mt-0.5 shrink-0" aria-hidden />
        Você pode mudar essa decisão a qualquer momento nas configurações de dados.
      </p>

      <div className="mt-auto flex flex-col gap-2">
        <Button
          size="lg"
          fullWidth
          disabled={shareRecord === null}
          iconRight="ph:arrow-right-bold"
          onClick={onConfirm ?? (() => navigate('/matches/carregando'))}
        >
          Ver novos matches
        </Button>
        <Button variant="ghost" fullWidth onClick={onBack ?? (() => navigate(`/sessao/${id}/decisao`))}>
          Voltar
        </Button>
      </div>
    </div>
  )
}
