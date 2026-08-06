import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { MngTopBar } from '../../components/MngTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { Sheet } from '../../components/Sheet'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { VERSAO_STATUS, fmtData } from '../../lib/nr1'
import { useService } from '../../hooks/useService'
import { nr1ModeloService } from '../../services/nr1'
import { mngEmpresas } from '../../data/mngMock'
import type { Nr1QuestionarioModelo } from '../../types'

/* NR1-MNG-01 — Modelos de avaliação psicossocial (RF-YN-NR1-01).
   Lista o Modelo YNA base e os modelos derivados por cliente.

   Toda a configuração do questionário vive aqui, no backoffice: nem o RH nem
   o colaborador editam instrumento (decisão de produto — sem autosserviço). */

const contarItens = (m: Nr1QuestionarioModelo, versao: string) =>
  m.versoes.find((v) => v.versao === versao)?.dimensoes.reduce((s, d) => s + d.itens.length, 0) ?? 0

export function NR1MngModelos() {
  const modelos = useService(() => nr1ModeloService.list(), [])
  const [derivarDe, setDerivarDe] = useState<Nr1QuestionarioModelo | null>(null)

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MngTopBar />
        <PageHeader
          title="Modelos de avaliação"
          subtitle="Os instrumentos de risco psicossocial aplicados nas campanhas."
          className="mt-2 lg:mt-0"
          action={
            <Button variant="secondary" iconLeft="ph:git-branch-bold" onClick={() => setDerivarDe(modelos.status === 'success' ? modelos.data.find((m) => m.escopo === 'yna') ?? null : null)}>
              <span className="hidden sm:inline">Derivar para cliente</span>
            </Button>
          }
        />

        {/* Governança do núcleo — atalho e explicação curta */}
        <Link
          to="/mng/nr1/nucleo"
          className="mb-6 flex items-start gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-surface-hover"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
            <Icon icon="ph:shield-check-bold" width={20} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-heading text-sm font-semibold text-ink">Núcleo obrigatório</span>
            <span className="mt-0.5 block text-[12.5px] leading-relaxed text-ink-secondary">
              As dimensões e itens mínimos que garantem a defensabilidade. Modelos de cliente
              podem acrescentar itens, nunca remover o núcleo.
            </span>
          </span>
          <Icon icon="ph:caret-right-bold" width={16} className="mt-1 shrink-0 text-ink-muted" aria-hidden />
        </Link>

        {modelos.status === 'loading' && (
          <div className="flex flex-col gap-2">{[0, 1].map((i) => <Skeleton key={i} className="h-[124px] w-full rounded-lg" />)}</div>
        )}
        {modelos.status === 'error' && <ErrorState message={modelos.message} onRetry={modelos.reload} />}

        {modelos.status === 'success' && (
          <div className="flex flex-col gap-3">
            {modelos.data.map((m) => {
              const publicada = m.versoes.find((v) => v.status === 'publicada')
              const rascunho = m.versoes.find((v) => v.status === 'rascunho')
              return (
                <div key={m.id} className="rounded-lg border border-border bg-surface p-4 lg:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${m.escopo === 'yna' ? 'bg-primary-50 text-primary dark:text-primary-300' : 'bg-surface-2 text-ink-secondary'}`}>
                        <Icon icon={m.escopo === 'yna' ? 'ph:seal-check-bold' : 'ph:buildings-bold'} width={20} aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="font-heading text-[15px] font-semibold text-ink">{m.nome}</p>
                        <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-secondary">{m.descricao}</p>
                      </div>
                    </div>
                    <Badge tone={m.escopo === 'yna' ? 'primary' : 'neutral'}>
                      {m.escopo === 'yna' ? 'Base YNA' : m.clienteNome}
                    </Badge>
                  </div>

                  {m.derivadoDe && (
                    <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-ink-muted">
                      <Icon icon="ph:git-fork-bold" width={12} aria-hidden />
                      Derivado do Modelo YNA · versão {m.derivadoDe.versao}
                    </p>
                  )}

                  {/* Estado das versões */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {publicada && (
                      <span className="inline-flex items-center gap-1.5 rounded-pill bg-success-bg px-2.5 py-1 text-[11.5px] font-medium text-success-ink">
                        <Icon icon="ph:check-circle-bold" width={12} aria-hidden />
                        v{publicada.versao} publicada · {contarItens(m, publicada.versao)} itens
                      </span>
                    )}
                    {rascunho && (
                      <span className="inline-flex items-center gap-1.5 rounded-pill bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-ink-secondary">
                        <Icon icon="ph:pencil-simple-bold" width={12} aria-hidden />
                        v{rascunho.versao} em rascunho
                      </span>
                    )}
                    <span className="text-[11.5px] text-ink-muted">
                      {m.versoes.length} {m.versoes.length === 1 ? 'versão' : 'versões'}
                      {publicada?.publicadaEm && ` · última publicação em ${fmtData(publicada.publicadaEm)}`}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                    <Link to={`/mng/nr1/modelos/${m.id}`}>
                      <Button size="sm" variant="secondary" iconLeft="ph:list-checks-bold">Editar itens</Button>
                    </Link>
                    <Link to={`/mng/nr1/modelos/${m.id}/versoes`}>
                      <Button size="sm" variant="ghost" iconLeft="ph:clock-counter-clockwise-bold">Versões</Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-6 flex gap-3 rounded-lg border border-border bg-surface-2 p-4">
          <Icon icon="ph:info-bold" width={20} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
          <p className="text-[12px] leading-relaxed text-ink-secondary">
            Uma versão publicada é imutável: editá-la cria uma nova versão em rascunho, e a
            publicada permanece intacta. Campanhas em curso mantêm a versão com que começaram, e
            é dessa continuidade que a rastreabilidade depende em fiscalização.
          </p>
        </div>
      </div>

      <Sheet open={derivarDe !== null} onClose={() => setDerivarDe(null)} title="Derivar modelo para cliente" icon="ph:git-branch-bold" size="md">
        {derivarDe && <DerivarForm origem={derivarDe} onClose={() => setDerivarDe(null)} onSaved={() => { setDerivarDe(null); modelos.reload() }} />}
      </Sheet>
    </div>
  )
}

/* Cria o modelo específico de um cliente a partir de uma versão YNA. O núcleo
   vem junto e fica travado — o derivado só pode acrescentar itens. */
function DerivarForm({ origem, onClose, onSaved }: { origem: Nr1QuestionarioModelo; onClose: () => void; onSaved: () => void }) {
  const publicaveis = origem.versoes.filter((v) => v.status === 'publicada' || v.status === 'arquivada')
  const [versao, setVersao] = useState(publicaveis[0]?.versao ?? origem.versoes[0]?.versao ?? '')
  const [clienteId, setClienteId] = useState(mngEmpresas[0]?.id ?? '')
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [salvando, setSalvando] = useState(false)

  const cliente = mngEmpresas.find((e) => e.id === clienteId)
  const valido = Boolean(versao && clienteId && nome.trim().length >= 3)

  const salvar = async () => {
    if (!valido || !cliente) return
    setSalvando(true)
    await nr1ModeloService.derivarParaCliente({
      origemModeloId: origem.id,
      origemVersao: versao,
      clienteId: cliente.id,
      clienteNome: cliente.nomeFantasia,
      nome: nome.trim(),
      descricao: descricao.trim() || `Modelo derivado do ${origem.nome}, versão ${versao}.`,
    })
    onSaved()
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
      <div>
        <p className="mb-1.5 text-[13px] font-semibold text-ink">Versão de origem</p>
        <Select
          value={versao}
          onChange={setVersao}
          ariaLabel="Versão de origem"
          options={publicaveis.map((v) => ({ value: v.versao, label: `v${v.versao} · ${VERSAO_STATUS[v.status].label}` }))}
        />
      </div>

      <div>
        <p className="mb-1.5 text-[13px] font-semibold text-ink">Empresa cliente</p>
        <Select
          value={clienteId}
          onChange={setClienteId}
          ariaLabel="Empresa cliente"
          options={mngEmpresas.map((e) => ({ value: e.id, label: e.nomeFantasia }))}
        />
      </div>

      <Input label="Nome do modelo" value={nome} onChange={(e) => setNome(e.target.value)} placeholder={`Ex.: Modelo ${cliente?.nomeFantasia ?? 'Cliente'} de Riscos Psicossociais`} />
      <Input label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="O que este modelo acrescenta ao instrumento base" />

      <div className="flex gap-3 rounded-lg border border-border bg-surface-2 p-3.5">
        <Icon icon="ph:shield-check-bold" width={18} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
        <p className="text-[12px] leading-relaxed text-ink-secondary">
          O núcleo obrigatório vem junto e não pode ser removido no modelo do cliente. A
          customização acontece só aqui no backoffice. O cliente não edita o questionário.
        </p>
      </div>

      <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button iconLeft="ph:check-bold" disabled={!valido || salvando} onClick={salvar}>
          {salvando ? 'Criando…' : 'Criar modelo do cliente'}
        </Button>
      </div>
    </div>
  )
}
