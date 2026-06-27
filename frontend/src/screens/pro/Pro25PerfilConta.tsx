import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { ProTopBar } from '../../components/ProTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Card } from '../../components/Card'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { ProfileRow } from '../../components/ProfileRow'
import { Select } from '../../components/Select'
import { Sheet } from '../../components/Sheet'
import { PAGE_MAX_W } from '../../lib/layout'
import { TIMEZONE_OPTIONS } from '../../lib/timezones'
import { usePro } from '../../contexts/ProContext'
import { useTheme } from '../../contexts/ThemeContext'
import { ContaForm, PJForm } from './ContaEditForms'

export function Pro25PerfilConta() {
  const { profile, updateProfile } = usePro()
  const { dark, toggle: toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [editConta, setEditConta] = useState(false)
  const [editPJ, setEditPJ] = useState(false)

  const conta = [
    { label: 'Nome', value: profile.name },
    { label: 'E-mail', value: profile.email },
    { label: 'Telefone', value: profile.phone ?? '—' },
    { label: 'CRP', value: `${profile.crp} / ${profile.crpUf}` },
  ]

  const pj = profile.pj
  const banco = pj
    ? [
        { label: 'Banco', value: pj.banco },
        { label: 'Agência', value: pj.agencia },
        { label: 'Conta corrente', value: pj.conta },
        ...(pj.operacao ? [{ label: 'Operação', value: pj.operacao }] : []),
        { label: 'Chave Pix', value: pj.pixChave ?? '—' },
      ]
    : []

  /* Documentos da PJ — anexar/substituir simula upload capturando o nome do arquivo. */
  const attachDoc = (id: string, nome: string) => {
    if (!pj) return
    updateProfile({ pj: { ...pj, documentos: pj.documentos.map((d) => (d.id === id ? { ...d, nome, status: 'enviado' } : d)) } })
  }
  const addDoc = () => {
    if (!pj) return
    updateProfile({ pj: { ...pj, documentos: [...pj.documentos, { id: `doc-${Date.now()}`, tipo: 'Outro documento', status: 'pendente' }] } })
  }

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

        {/* Editar perfil clínico (outra tela) */}
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

        {/* Dados de conta (edita em modal) */}
        <Card className="mb-4">
          <CardHeader title="Dados de conta" onEdit={() => setEditConta(true)} />
          <div className="flex flex-col divide-y divide-border">
            {conta.map((item) => <DataRow key={item.label} label={item.label} value={item.value} />)}
          </div>
        </Card>

        {/* PJ (edita em modal) */}
        {pj && (
          <Card className="mb-4">
            <CardHeader title="Pessoa Jurídica" onEdit={() => setEditPJ(true)} />
            <div className="flex flex-col divide-y divide-border">
              <DataRow label="CNPJ" value={pj.cnpj} />
              <DataRow label="Razão social" value={pj.razaoSocial} />
            </div>

            <p className="mt-4 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">Dados bancários</p>
            <div className="flex flex-col divide-y divide-border">
              {banco.map((item) => <DataRow key={item.label} label={item.label} value={item.value} />)}
            </div>

            <p className="mt-4 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">Documentos</p>
            <div className="flex flex-col divide-y divide-border">
              {pj.documentos.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{d.tipo}</p>
                    <p className={`truncate text-[12.5px] ${d.nome ? 'text-ink-secondary' : 'text-ink-muted'}`}>
                      {d.nome ?? 'Não enviado'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge tone={d.status === 'enviado' ? 'success' : 'warning'}>
                      {d.status === 'enviado' ? 'Enviado' : 'Pendente'}
                    </Badge>
                    <label className="cursor-pointer rounded-pill border border-border bg-surface px-3 py-1.5 font-heading text-xs font-semibold text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink">
                      {d.nome ? 'Substituir' : 'Enviar'}
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) attachDoc(d.id, f.name); e.target.value = '' }}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addDoc} className="mt-3 flex items-center gap-1.5 font-heading text-xs font-semibold text-primary dark:text-primary-300">
              <Icon icon="ph:plus-bold" width={13} aria-hidden /> Adicionar documento
            </button>
          </Card>
        )}

        {/* Preferências (edita na própria tela) */}
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
          <div className="border-t border-border py-3">
            <div className="flex items-center gap-3">
              <Icon icon="ph:globe-bold" width={20} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">Fuso horário</p>
                <p className="text-[13px] text-ink-secondary">Usado para exibir os horários das suas sessões</p>
              </div>
            </div>
            <Select
              id="fuso-horario"
              ariaLabel="Fuso horário"
              value={profile.fusoHorario}
              options={TIMEZONE_OPTIONS}
              onChange={(value) => updateProfile({ fusoHorario: value })}
              className="mt-2.5"
            />
          </div>
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

      <Sheet open={editConta} onClose={() => setEditConta(false)} title="Editar dados de conta" icon="ph:identification-card-bold" size="md">
        {editConta && <ContaForm onClose={() => setEditConta(false)} />}
      </Sheet>
      <Sheet open={editPJ} onClose={() => setEditPJ(false)} title="Editar dados da PJ" icon="ph:buildings-bold" size="md">
        {editPJ && <PJForm onClose={() => setEditPJ(false)} />}
      </Sheet>
    </div>
  )
}

function CardHeader({ title, onEdit }: { title: string; onEdit: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
      <button onClick={onEdit} className="flex items-center gap-1 font-heading text-xs font-semibold text-primary dark:text-primary-300 hover:underline">
        <Icon icon="ph:pencil-simple-bold" width={13} aria-hidden /> Editar
      </button>
    </div>
  )
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm text-ink-secondary">{label}</span>
      <span className="text-right text-sm font-medium text-ink">{value}</span>
    </div>
  )
}
