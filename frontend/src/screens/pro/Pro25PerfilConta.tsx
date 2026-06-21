import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { ProTopBar } from '../../components/ProTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Card } from '../../components/Card'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { ProfileRow } from '../../components/ProfileRow'
import { PAGE_MAX_W } from '../../lib/layout'
import { usePro } from '../../contexts/ProContext'
import { useTheme } from '../../contexts/ThemeContext'

export function Pro25PerfilConta() {
  const { profile } = usePro()
  const { dark, toggle: toggleTheme } = useTheme()
  const navigate = useNavigate()

  const conta = [
    { label: 'Nome', value: profile.name },
    { label: 'E-mail', value: profile.email },
    { label: 'Telefone', value: profile.phone ?? '—' },
    { label: 'CRP', value: `${profile.crp} / ${profile.crpUf}` },
  ]
  const pj = profile.pj
    ? [
        { label: 'CNPJ', value: profile.pj.cnpj },
        { label: 'Razão social', value: profile.pj.razaoSocial },
        { label: 'Banco', value: `${profile.pj.banco} · ${profile.pj.conta}` },
      ]
    : []

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-8`}>
        <ProTopBar />
        <PageHeader title="Conta" subtitle="Seus dados, sua PJ e as preferências do app." className="mt-2 lg:mt-0" />

        <ProfileRow className="mb-5">
          <Avatar initials={profile.initials} size={56} palette={profile.palette} />
          <div>
            <p className="font-semibold text-ink">{profile.name}</p>
            <p className="text-sm text-ink-secondary">CRP {profile.crp}</p>
            <Badge tone="success" icon="ph:seal-check-bold" className="mt-1">Perfil ativo</Badge>
          </div>
        </ProfileRow>

        {/* Editar perfil clínico */}
        <button
          onClick={() => navigate('/pro/perfil')}
          className="mb-4 flex w-full items-center gap-3 rounded-lg border border-border bg-surface px-4 py-4 text-left transition-colors hover:bg-surface-hover"
        >
          <Icon icon="ph:user-circle-bold" width={20} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
          <div className="flex-1">
            <p className="font-heading text-sm font-semibold text-ink">Editar perfil clínico</p>
            <p className="text-[13px] text-ink-secondary">Bio, abordagem, vídeo, agenda — o que os beneficiários veem</p>
          </div>
          <Icon icon="ph:caret-right-bold" width={14} className="shrink-0 text-ink-secondary" aria-hidden />
        </button>

        {/* Dados de conta */}
        <Card className="mb-4">
          <h2 className="text-[15px] font-semibold text-ink">Dados de conta</h2>
          <div className="flex flex-col divide-y divide-border">
            {conta.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 py-3">
                <span className="text-sm text-ink-secondary">{item.label}</span>
                <span className="text-right text-sm font-medium text-ink">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* PJ */}
        {pj.length > 0 && (
          <Card className="mb-4">
            <h2 className="text-[15px] font-semibold text-ink">Pessoa Jurídica</h2>
            <div className="flex flex-col divide-y divide-border">
              {pj.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 py-3">
                  <span className="text-sm text-ink-secondary">{item.label}</span>
                  <span className="text-right text-sm font-medium text-ink">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Preferências */}
        <Card className="mb-4">
          <h2 className="text-[15px] font-semibold text-ink">Preferências</h2>
          <button onClick={toggleTheme} aria-pressed={dark} className="flex items-center gap-3 py-3 text-left">
            <Icon icon={dark ? 'ph:moon-stars-bold' : 'ph:sun-bold'} width={20} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">Tema {dark ? 'escuro' : 'claro'}</p>
              <p className="text-[13px] text-ink-secondary">Toque para alternar</p>
            </div>
            <Icon icon={dark ? 'ph:toggle-right-fill' : 'ph:toggle-left-bold'} width={32} className={dark ? 'text-primary dark:text-primary-300' : 'text-ink-muted'} aria-hidden />
          </button>
          <button onClick={() => navigate('/pro/notificacoes')} className="flex items-center gap-3 border-t border-border py-3 text-left">
            <Icon icon="ph:bell-bold" width={20} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
            <span className="flex-1 text-sm font-medium text-ink">Notificações</span>
            <Icon icon="ph:caret-right-bold" width={14} className="shrink-0 text-ink-secondary" aria-hidden />
          </button>
          <button onClick={() => navigate('/pro/ausencias')} className="flex items-center gap-3 border-t border-border py-3 text-left">
            <Icon icon="ph:airplane-takeoff-bold" width={20} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">Ausências e férias</p>
              <p className="text-[13px] text-ink-secondary">Bloqueie períodos sem atendimento</p>
            </div>
            <Icon icon="ph:caret-right-bold" width={14} className="shrink-0 text-ink-secondary" aria-hidden />
          </button>
        </Card>

        {/* Logout */}
        <div className="mt-8 border-t border-border pt-6">
          <button
            onClick={() => navigate('/pro/convite/demo')}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-3 font-heading text-sm font-medium text-ink-secondary transition-colors hover:border-danger/40 hover:bg-danger-bg hover:text-danger"
          >
            <Icon icon="ph:sign-out-bold" width={18} aria-hidden />
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  )
}
