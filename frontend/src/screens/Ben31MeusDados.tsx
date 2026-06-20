import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useTheme } from '../contexts/ThemeContext'
import { PAGE_MAX_W } from '../lib/layout'
import { MobileTopBar } from '../components/MobileTopBar'
import { Card } from '../components/Card'
import { Modal } from '../components/Modal'
import { Avatar } from '../components/Avatar'
import { Badge } from '../components/Badge'
import { PageHeader } from '../components/PageHeader'
import { ProfileRow } from '../components/ProfileRow'
import { useApp } from '../contexts/AppContext'
import { TopBarIconButton } from '../components/TopBarIconButton'

export function Ben31MeusDados() {
  const { user } = useApp()
  const navigate = useNavigate()
  const { dark, toggle: toggleTheme } = useTheme()
  const [ticketOpen, setTicketOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)

  // Auto-dismiss the floating success toast
  useEffect(() => {
    if (!ticketOpen) return
    const t = setTimeout(() => setTicketOpen(false), 5000)
    return () => clearTimeout(t)
  }, [ticketOpen])

  const contactOptions = [
    {
      icon: 'ph:whatsapp-logo-bold',
      label: 'WhatsApp',
      value: '(11) 99999-0000',
      href: 'https://wa.me/5511999990000',
    },
    {
      icon: 'ph:envelope-bold',
      label: 'E-mail',
      value: 'contato@yna.com.br',
      href: 'mailto:contato@yna.com.br',
    },
    {
      icon: 'ph:phone-bold',
      label: 'Telefone',
      value: '(11) 4000-1000',
      href: 'tel:+551140001000',
    },
  ]

  const sections = [
    {
      title: 'Dados de conta',
      items: [
        { label: 'Nome', value: user.name },
        { label: 'Apelido', value: user.nickname },
        { label: 'E-mail', value: user.email },
        { label: 'Empresa', value: user.company },
        { label: 'Departamento', value: user.department },
      ],
    },
  ]

  const rights: { icon: string; title: string; desc: string; onClick: () => void }[] = [
    { icon: 'ph:chat-circle-dots-bold', title: 'Fale Conosco', desc: 'WhatsApp, e-mail ou telefone', onClick: () => setContactOpen(true) },
    { icon: 'ph:eye-bold', title: 'Acessar meus dados', desc: 'Ver tudo que a YNA tem sobre você', onClick: () => setTicketOpen(true) },
    { icon: 'ph:pencil-bold', title: 'Corrigir dados incorretos', desc: 'Solicitar atualização de informações', onClick: () => setTicketOpen(true) },
    { icon: 'ph:trash-bold', title: 'Excluir minha conta', desc: 'Apagar todos os dados permanentemente', onClick: () => setTicketOpen(true) },
    { icon: 'ph:x-circle-bold', title: 'Revogar consentimento', desc: 'Parar o tratamento dos meus dados', onClick: () => setTicketOpen(true) },
  ]

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
    <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-8`}>
      <MobileTopBar />
      <PageHeader
        title="Meu Perfil"
        subtitle="Você tem controle total. Veja o que temos e peça o que precisar, sem burocracia."
        className="mt-2 lg:mt-0"
        action={
          <div className="hidden lg:flex items-center gap-2">
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
        }
      />

      {/* Desktop: 2-column; Mobile: stacked */}
      <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-8 lg:items-start">

        {/* Left: profile card + account data */}
        <div>
          <ProfileRow className="mb-5">
            <Avatar
              initials={user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              size={56}
              palette="lavender"
            />
            <div>
              <p className="font-semibold text-ink">{user.name}</p>
              <p className="text-sm text-ink-secondary">{user.email}</p>
              <Badge tone="success" icon="ph:shield-check-bold" className="mt-1">Dados protegidos</Badge>
            </div>
          </ProfileRow>

          {sections.map((section) => (
            <Card key={section.title} className="mb-4">
              <h2 className="text-[15px] font-semibold text-ink">{section.title}</h2>
              <div className="flex flex-col divide-y divide-border">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3">
                    <span className="text-sm text-ink-secondary">{item.label}</span>
                    <span className="text-sm font-medium text-ink">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Right: LGPD rights */}
        <div>
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Icon icon="ph:scales-bold" width={18} className="text-primary dark:text-primary-300" aria-hidden />
              <h2 className="text-[15px] font-semibold text-ink">Seus direitos (LGPD)</h2>
            </div>
            <div className="flex flex-col gap-2">
              {rights.map((right) => (
                <button
                  key={right.title}
                  onClick={right.onClick}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-4 font-heading text-left transition-colors hover:bg-surface-hover"
                >
                  <Icon
                    icon={right.icon}
                    width={18}
                    className="shrink-0 text-primary dark:text-primary-300"
                    aria-hidden
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink">{right.title}</p>
                    <p className="text-xs text-ink-secondary">{right.desc}</p>
                  </div>
                  <Icon icon="ph:caret-right-bold" width={14} className="shrink-0 text-ink-secondary" aria-hidden />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Logout — visible on mobile; desktop already has it in the sidebar */}
      <div className="mt-8 border-t border-border pt-6 lg:hidden">
        <button
          onClick={() => navigate('/bem-vindo')}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-3 font-heading text-sm font-medium text-ink-secondary transition-colors hover:border-danger/40 hover:bg-danger-bg hover:text-danger"
        >
          <Icon icon="ph:sign-out-bold" width={18} aria-hidden />
          Sair da conta
        </button>
      </div>
    </div>

    {/* Floating success toast — visible regardless of scroll/resolution */}
    {ticketOpen && (
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 lg:bottom-8">
        <div
          role="status"
          className="pointer-events-auto flex max-w-md items-start gap-3 rounded-lg border border-success bg-success-bg px-4 py-3 shadow-lg animate-yna-slide-up"
        >
          <Icon icon="ph:check-circle-bold" width={20} className="mt-0.5 shrink-0 text-success" aria-hidden />
          <p className="flex-1 text-sm font-medium text-ink">
            Ticket aberto. Nossa equipe de privacidade entrará em contato em até 72h.
          </p>
          <button
            onClick={() => setTicketOpen(false)}
            aria-label="Fechar"
            className="-mr-1 shrink-0 text-ink-secondary transition-colors hover:text-ink"
          >
            <Icon icon="ph:x-bold" width={16} aria-hidden />
          </button>
        </div>
      </div>
    )}

    {/* Fale Conosco — contact options */}
    <Modal open={contactOpen} title="Fale Conosco" onClose={() => setContactOpen(false)}>
      <div className="flex flex-col gap-2">
        {contactOptions.map((opt) => (
          <a
            key={opt.label}
            href={opt.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-4 transition-colors hover:bg-surface-hover"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary dark:text-primary-300">
              <Icon icon={opt.icon} width={20} aria-hidden />
            </span>
            <div className="flex-1">
              <p className="font-heading text-sm font-semibold text-ink">{opt.label}</p>
              <p className="text-xs text-ink-secondary">{opt.value}</p>
            </div>
            <Icon icon="ph:caret-right-bold" width={14} className="shrink-0 text-ink-secondary" aria-hidden />
          </a>
        ))}
      </div>
    </Modal>
    </div>
  )
}
