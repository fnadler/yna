import { useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Sheet } from '../../components/Sheet'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { rhBeneficiarioService, rhDepartamentoService, rhConviteService } from '../../services/rh'
import type { RhBeneficiario, RhBeneficiarioStatus, RhDepartamento, RhImportResult } from '../../types'

/* RH-11 — Cadastro e gestão de beneficiários (Seção 5.4 e 5.7).
   Lista com busca, filtros por status/departamento, cadastro individual,
   importação por planilha, edição em massa de departamento, envio de convite
   e exclusão lógica. O RH nunca vê dado clínico — apenas dados de carga. */

const STATUS_META: Record<RhBeneficiarioStatus, { label: string; tone: 'success' | 'primary' | 'neutral' }> = {
  ativo: { label: 'Ativo', tone: 'success' },
  convidado: { label: 'Convidado', tone: 'primary' },
  nao_convidado: { label: 'Não convidado', tone: 'neutral' },
}

const FILTROS: { value: RhBeneficiarioStatus | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'ativo', label: 'Ativos' },
  { value: 'convidado', label: 'Convidados' },
  { value: 'nao_convidado', label: 'Não convidados' },
]

export function RH11Beneficiarios() {
  const query = useService(() => rhBeneficiarioService.list(), [])
  const deps = useService(() => rhDepartamentoService.list(), [])
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<RhBeneficiarioStatus | 'todos'>('todos')
  const [depFiltro, setDepFiltro] = useState('todos')
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [addOpen, setAddOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [moverOpen, setMoverOpen] = useState(false)
  const [excluir, setExcluir] = useState<RhBeneficiario | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  const departamentos = deps.status === 'success' ? deps.data : []
  const depNome = (id: string) => departamentos.find((d) => d.id === id)?.nome ?? '—'

  const filtrados = useMemo(() => {
    if (query.status !== 'success') return []
    const termo = busca.trim().toLowerCase()
    return query.data.filter((b) => {
      if (filtro !== 'todos' && b.status !== filtro) return false
      if (depFiltro !== 'todos' && b.departamentoId !== depFiltro) return false
      if (termo && !b.nomeCompleto.toLowerCase().includes(termo) && !b.emailCorporativo.toLowerCase().includes(termo)) return false
      return true
    })
  }, [query, busca, filtro, depFiltro])

  const toggle = (id: string) =>
    setSelecionados((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const naoConvidadosSelecionados = filtrados.filter((b) => selecionados.has(b.id) && b.status === 'nao_convidado').length

  const enviarConvites = async () => {
    await rhConviteService.disparar([...selecionados])
    setSelecionados(new Set())
    query.reload()
  }

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />
        <PageHeader
          title="Beneficiários"
          subtitle="O quadro elegível da sua empresa."
          className="mt-2 lg:mt-0"
          action={
            <div className="hidden gap-2 sm:flex">
              <Button variant="secondary" iconLeft="ph:upload-simple-bold" onClick={() => setImportOpen(true)}>Importar planilha</Button>
              <Button iconLeft="ph:plus-bold" onClick={() => setAddOpen(true)}>Adicionar</Button>
            </div>
          }
        />

        {/* Ações mobile */}
        <div className="mb-4 flex gap-2 sm:hidden">
          <Button variant="secondary" iconLeft="ph:upload-simple-bold" className="flex-1" onClick={() => setImportOpen(true)}>Planilha</Button>
          <Button iconLeft="ph:plus-bold" className="flex-1" onClick={() => setAddOpen(true)}>Adicionar</Button>
        </div>

        {/* Busca + filtro de departamento */}
        <div className="mb-3 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Icon icon="ph:magnifying-glass-bold" width={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou e-mail…"
              aria-label="Buscar beneficiário"
              className="w-full rounded-lg border border-border bg-surface py-3 pl-11 pr-4 text-[15px] text-ink placeholder:text-ink-muted transition-colors focus:border-primary focus:outline-none"
            />
          </div>
          <Select
            value={depFiltro}
            onChange={setDepFiltro}
            ariaLabel="Filtrar por departamento"
            className="sm:w-56"
            options={[{ value: 'todos', label: 'Todos os departamentos' }, ...departamentos.map((d) => ({ value: d.id, label: d.nome }))]}
          />
        </div>

        {/* Chips de status */}
        <div className="mb-4 flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className={`rounded-pill border px-3.5 py-1.5 font-heading text-[13px] font-medium transition-colors ${
                filtro === f.value
                  ? 'border-primary bg-primary-50 text-primary dark:text-primary-300'
                  : 'border-border bg-surface text-ink-secondary hover:bg-surface-hover'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Barra de seleção em massa */}
        {selecionados.size > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 dark:border-border-strong dark:bg-surface">
            <span className="text-[13px] font-semibold text-ink">{selecionados.size} selecionado(s)</span>
            <div className="ml-auto flex gap-2">
              <Button variant="secondary" size="sm" iconLeft="ph:swap-bold" onClick={() => setMoverOpen(true)}>Mover departamento</Button>
              {naoConvidadosSelecionados > 0 && (
                <Button size="sm" iconLeft="ph:paper-plane-tilt-bold" onClick={enviarConvites}>Enviar convite ({naoConvidadosSelecionados})</Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setSelecionados(new Set())}>Limpar</Button>
            </div>
          </div>
        )}

        {(query.status === 'loading' || deps.status === 'loading') && (
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[68px] w-full rounded-lg" />)}
          </div>
        )}

        {query.status === 'error' && <ErrorState message={query.message} onRetry={query.reload} />}

        {query.status === 'success' && deps.status === 'success' && (
          filtrados.length > 0 ? (
            <>
              <p className="mb-2 text-[13px] text-ink-muted">{filtrados.length} beneficiário(s)</p>
              <ul className="flex flex-col gap-2">
                {filtrados.map((b) => {
                  const meta = STATUS_META[b.status]
                  const sel = selecionados.has(b.id)
                  return (
                    <li key={b.id} className={`flex items-center gap-3 rounded-lg border bg-surface p-3 transition-colors ${sel ? 'border-primary' : 'border-border'}`}>
                      <button
                        onClick={() => toggle(b.id)}
                        role="checkbox"
                        aria-checked={sel}
                        aria-label={`Selecionar ${b.nomeCompleto}`}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-[1.5px] transition-colors ${sel ? 'border-primary bg-primary text-white' : 'border-border-strong bg-surface'}`}
                      >
                        {sel && <Icon icon="ph:check-bold" width={12} aria-hidden />}
                      </button>
                      <Avatar initials={b.initials} size={40} palette={b.palette} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-heading text-sm font-semibold text-ink">{b.nomeCompleto}</p>
                        <p className="truncate text-[12px] text-ink-secondary">{depNome(b.departamentoId)} · {b.emailCorporativo}</p>
                      </div>
                      <Badge tone={meta.tone} className="hidden shrink-0 sm:inline-flex">{meta.label}</Badge>
                      <button
                        onClick={() => setExcluir(b)}
                        aria-label={`Excluir ${b.nomeCompleto}`}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill text-ink-muted transition-colors hover:bg-danger-bg hover:text-danger"
                      >
                        <Icon icon="ph:trash-bold" width={16} aria-hidden />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </>
          ) : (
            <div className="rounded-lg border border-border bg-surface px-4 py-12 text-center">
              <Icon icon="ph:users-three-bold" width={32} className="mx-auto text-ink-muted" aria-hidden />
              <p className="mt-3 text-sm text-ink-secondary">Nenhum beneficiário encontrado com esses filtros.</p>
            </div>
          )
        )}
      </div>

      {/* Sheet: cadastro individual */}
      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Adicionar beneficiário" icon="ph:user-plus-bold" size="md">
        <AdicionarForm departamentos={departamentos} onDone={() => { setAddOpen(false); query.reload() }} />
      </Sheet>

      {/* Sheet: importação por planilha */}
      <Sheet open={importOpen} onClose={() => setImportOpen(false)} title="Importar por planilha" icon="ph:table-bold" size="md">
        <ImportarForm onDone={() => { setImportOpen(false); query.reload() }} />
      </Sheet>

      {/* Sheet: mover departamento em massa */}
      <Sheet open={moverOpen} onClose={() => setMoverOpen(false)} title="Mover de departamento" icon="ph:swap-bold" size="md">
        <MoverForm
          count={selecionados.size}
          departamentos={departamentos}
          onDone={async (depId) => {
            await rhBeneficiarioService.moverDepartamento([...selecionados], depId)
            setMoverOpen(false)
            setSelecionados(new Set())
            query.reload()
          }}
        />
      </Sheet>

      {/* Sheet: confirmação de exclusão (ação irreversível) */}
      <Sheet open={excluir !== null} onClose={() => setExcluir(null)} title="Excluir beneficiário" icon="ph:trash-bold" iconColor="text-danger" size="md">
        {excluir && (
          <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
            <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger-bg px-4 py-3 text-[13px] text-danger-ink">
              <Icon icon="ph:warning-bold" width={16} className="mt-0.5 shrink-0" aria-hidden />
              Esta ação não poderá ser desfeita. O acesso será encerrado e a licença liberada.
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
              <Avatar initials={excluir.initials} size={40} palette={excluir.palette} />
              <div className="min-w-0">
                <p className="truncate font-heading text-sm font-semibold text-ink">{excluir.nomeCompleto}</p>
                <p className="truncate text-[12px] text-ink-secondary">{depNome(excluir.departamentoId)} · {excluir.emailCorporativo}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setExcluir(null)}>Cancelar</Button>
              <Button
                variant="danger"
                className="flex-1"
                disabled={excluindo}
                iconLeft={excluindo ? undefined : 'ph:trash-bold'}
                onClick={async () => {
                  setExcluindo(true)
                  await rhBeneficiarioService.remove(excluir.id)
                  setExcluindo(false)
                  setExcluir(null)
                  setSelecionados((prev) => {
                    const next = new Set(prev)
                    next.delete(excluir.id)
                    return next
                  })
                  query.reload()
                }}
              >
                {excluindo ? 'Excluindo…' : 'Excluir'}
              </Button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  )
}

function AdicionarForm({ departamentos, onDone }: { departamentos: RhDepartamento[]; onDone: () => void }) {
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  const [dep, setDep] = useState(departamentos[0]?.id ?? '')
  const [saving, setSaving] = useState(false)

  const valido = nome.trim().length > 2 && /\S+@\S+\.\S+/.test(email) && dep

  const submit = async () => {
    setSaving(true)
    await rhBeneficiarioService.create({ nomeCompleto: nome, cpf, emailCorporativo: email, departamentoId: dep })
    setSaving(false)
    onDone()
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
      <p className="text-[13px] leading-relaxed text-ink-secondary">
        Cadastro da carga inicial. O beneficiário completa os dados pessoais sensíveis no primeiro
        acesso, com consentimento individual.
      </p>
      <Input label="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como consta no RH" />
      <Input label="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="Apenas números" />
      <Input label="E-mail corporativo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@empresa.com" />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-ink">Departamento</label>
        <Select value={dep} onChange={setDep} ariaLabel="Departamento" options={departamentos.map((d) => ({ value: d.id, label: d.nome }))} />
      </div>
      <Button fullWidth disabled={!valido || saving} iconRight={saving ? undefined : 'ph:check-bold'} onClick={submit}>
        {saving ? 'Salvando…' : 'Cadastrar beneficiário'}
      </Button>
    </div>
  )
}

function ImportarForm({ onDone }: { onDone: () => void }) {
  const [fase, setFase] = useState<'inicio' | 'processando' | 'resultado'>('inicio')
  const [resultado, setResultado] = useState<RhImportResult | null>(null)

  const processar = async () => {
    setFase('processando')
    const r = await rhBeneficiarioService.importar(154)
    setResultado(r)
    setFase('resultado')
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
      {fase === 'inicio' && (
        <>
          <p className="text-[13px] leading-relaxed text-ink-secondary">
            Baixe o modelo, preencha com os campos mínimos — nome completo, CPF, data de nascimento,
            departamento e e-mail corporativo — e envie. Validamos tudo antes de criar os cadastros.
          </p>
          <button className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-hover">
            <Icon icon="ph:download-simple-bold" width={20} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">Baixar modelo de planilha</p>
              <p className="text-[12px] text-ink-secondary">modelo-beneficiarios-yna.xlsx</p>
            </div>
          </button>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-[1.5px] border-dashed border-border-strong bg-surface-2 px-4 py-8 text-center transition-colors hover:border-primary">
            <Icon icon="ph:upload-simple-bold" width={28} className="text-ink-muted" aria-hidden />
            <span className="text-sm font-semibold text-ink">Selecionar planilha preenchida</span>
            <span className="text-[12px] text-ink-muted">CSV ou XLSX, até 5.000 linhas</span>
            <input type="file" accept=".csv,.xlsx" className="hidden" onChange={processar} />
          </label>
        </>
      )}

      {fase === 'processando' && (
        <div className="flex flex-col items-center gap-3 py-10 text-ink-secondary">
          <Icon icon="ph:spinner-gap-bold" width={28} className="animate-spin text-primary dark:text-primary-300" aria-hidden />
          <p className="text-sm">Validando a planilha…</p>
        </div>
      )}

      {fase === 'resultado' && resultado && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-success/30 bg-success-bg p-3 text-center">
              <p className="text-2xl font-bold text-success">{resultado.validos}</p>
              <p className="text-[11px] text-ink-secondary">Válidos</p>
            </div>
            <div className="rounded-lg border border-warning/30 bg-warning-bg p-3 text-center">
              <p className="text-2xl font-bold text-warning-ink">{resultado.duplicados}</p>
              <p className="text-[11px] text-ink-secondary">Duplicados</p>
            </div>
            <div className="rounded-lg border border-danger/30 bg-danger-bg p-3 text-center">
              <p className="text-2xl font-bold text-danger">{resultado.erros.length}</p>
              <p className="text-[11px] text-ink-secondary">Com erro</p>
            </div>
          </div>
          {resultado.erros.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[13px] font-semibold text-ink">Corrija antes de importar:</p>
              {resultado.erros.map((e) => (
                <div key={e.linha} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[12px]">
                  <span className="font-mono text-ink-muted">L{e.linha}</span>
                  <span className="min-w-0 flex-1 truncate text-ink">{e.nome}</span>
                  <span className="shrink-0 text-danger">{e.erro}</span>
                </div>
              ))}
            </div>
          )}
          <Button fullWidth iconRight="ph:check-bold" onClick={onDone}>
            Importar {resultado.validos} válidos
          </Button>
        </>
      )}
    </div>
  )
}

function MoverForm({ count, departamentos, onDone }: { count: number; departamentos: RhDepartamento[]; onDone: (depId: string) => void }) {
  const [dep, setDep] = useState(departamentos[0]?.id ?? '')
  return (
    <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
      <p className="text-[13px] leading-relaxed text-ink-secondary">
        Mover <span className="font-semibold text-ink">{count}</span> beneficiário(s) para outro departamento.
        Útil em reorganizações internas — não altera nenhum dado pessoal.
      </p>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-ink">Novo departamento</label>
        <Select value={dep} onChange={setDep} ariaLabel="Novo departamento" options={departamentos.map((d) => ({ value: d.id, label: d.nome }))} />
      </div>
      <Button fullWidth iconRight="ph:check-bold" onClick={() => onDone(dep)}>Confirmar mudança</Button>
    </div>
  )
}
