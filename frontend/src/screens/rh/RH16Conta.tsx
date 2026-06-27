import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Skeleton } from '../../components/Skeleton'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { useRh } from '../../contexts/RhContext'
import { rhNotificacaoService } from '../../services/rh'

/* RH-16 — Conta da empresa: dados do contrato (somente leitura — definidos no
   kick-off pelo backoffice YNA), notificações e canal com a CSM. */

function Linha({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <span className="text-[13px] text-ink-secondary">{label}</span>
      <span className="text-right text-[13px] font-medium text-ink">{value}</span>
    </div>
  )
}

export function RH16Conta() {
  const { empresa, usuario } = useRh()
  const navigate = useNavigate()
  const notifs = useService(() => rhNotificacaoService.list(), [])

  const fmtData = (d: string) => d.split('-').reverse().join('/')

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />
        <PageHeader title="Conta da empresa" subtitle="Dados do contrato e avisos da plataforma." className="mt-2 lg:mt-0" />

        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:items-start">
          <div className="flex flex-col gap-6">
            {/* Dados da empresa */}
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-ink">Dados cadastrais</h2>
              <div className="rounded-lg border border-border bg-surface px-4 py-1">
                <Linha label="Razão social" value={empresa.razaoSocial} />
                <Linha label="Nome fantasia" value={empresa.nomeFantasia} />
                <Linha label="CNPJ" value={empresa.cnpj} />
                <Linha label="Segmento" value={empresa.segmento} />
                <Linha label="Contato RH" value={empresa.contatoRh} />
              </div>
              <p className="mt-2 text-[12px] text-ink-muted">
                Estes dados foram definidos no kick-off. Para alterações, fale com a sua CSM.
              </p>
            </section>

            {/* Contrato */}
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-ink">Contrato</h2>
              <div className="rounded-lg border border-border bg-surface px-4 py-1">
                <Linha label="Plano" value={empresa.plano} />
                <Linha label="Licenças" value={`${empresa.licencasContratadas} beneficiários`} />
                <Linha label="Início" value={fmtData(empresa.contratoInicio)} />
                <Linha label="Término" value={fmtData(empresa.contratoFim)} />
              </div>
            </section>

            {/* Notificações */}
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-ink">Avisos</h2>
              {notifs.status === 'loading' && <Skeleton className="h-32 w-full rounded-lg" />}
              {notifs.status === 'success' && (
                <ul className="flex flex-col gap-2">
                  {notifs.data.map((n) => (
                    <li key={n.id} className={`flex items-start gap-3 rounded-lg border p-4 ${n.lida ? 'border-border bg-surface' : 'border-primary-200 bg-primary-50 dark:border-border-strong dark:bg-surface'}`}>
                      <Icon icon={n.icon} width={20} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink">{n.titulo}</p>
                        <p className="mt-0.5 text-[13px] text-ink-secondary">{n.descricao}</p>
                      </div>
                      <span className="shrink-0 text-[11px] text-ink-muted">{n.quando}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Lateral: usuário + suporte */}
          <div className="mt-6 flex flex-col gap-5 lg:mt-0">
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-ink">Seu acesso</h2>
              <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 text-[13px]">
                <div className="flex justify-between"><span className="text-ink-secondary">Nome</span><span className="text-ink">{usuario.nome}</span></div>
                <div className="flex justify-between"><span className="text-ink-secondary">E-mail</span><span className="truncate text-ink">{usuario.email}</span></div>
                <div className="flex justify-between"><span className="text-ink-secondary">Papel</span><span className="capitalize text-ink">{usuario.papel}</span></div>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-ink">Suporte</h2>
              <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4">
                <p className="text-[13px] text-ink-secondary">Sua CSM acompanha o piloto de perto.</p>
                <Button variant="secondary" size="sm" iconLeft="ph:chat-circle-bold" onClick={() => { window.location.href = 'mailto:fernanda@yna.com.br' }}>Falar com a Fernanda</Button>
              </div>
            </section>

            <Button variant="ghost" fullWidth iconLeft="ph:sign-out-bold" onClick={() => navigate('/rh/convite/demo')}>Sair da conta</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
