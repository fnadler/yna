import { useState } from 'react'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { Sheet } from '../../components/Sheet'
import { Select } from '../../components/Select'
import { Textarea } from '../../components/Textarea'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { RELATO_STATUS, RELATO_CATEGORIA, fmtData } from '../../lib/nr1'
import { NR1_TODAY } from '../../data/nr1Mock'
import { useService } from '../../hooks/useService'
import { nr1CanalService } from '../../services/nr1'
import type { Nr1Relato } from '../../types'

/* NR1-RH-08 — Gestão do canal de escuta (RF-H02). P1.

   O que transforma o canal de caixa-postal em processo defensável: cada caso
   tem status, prazo de SLA e trilha de tratamento registrada.

   O RH vê o relato, mas nunca quem relatou — nem quando o relator informou a
   área. O acompanhamento acontece pelo protocolo. */

const FILTROS = [
  { value: 'todos', label: 'Todos os casos' },
  { value: 'novo', label: 'Novos' },
  { value: 'em-apuracao', label: 'Em apuração' },
  { value: 'concluido', label: 'Concluídos' },
]

/** Dias restantes até o vencimento do SLA (negativo = vencido). */
const diasRestantes = (prazo: string) =>
  Math.round((new Date(prazo).getTime() - new Date(NR1_TODAY).getTime()) / 86_400_000)

export function NR1RhCanal() {
  const relatos = useService(() => nr1CanalService.list(), [])
  const [filtro, setFiltro] = useState('todos')
  const [detalhe, setDetalhe] = useState<Nr1Relato | null>(null)

  const lista = (relatos.status === 'success' ? relatos.data : [])
    .filter((r) => (filtro === 'todos' ? true : r.status === filtro))

  const abertos = relatos.status === 'success' ? relatos.data.filter((r) => r.status !== 'concluido') : []
  const vencidos = abertos.filter((r) => diasRestantes(r.prazoEm) < 0)

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />

        <PageHeader className="mt-2 lg:mt-0" title="Canal de escuta" subtitle="Casos relatados de forma confidencial, com prazo e trilha de tratamento." />

        {/* Resumo */}
        <div className="mb-5 grid grid-cols-3 gap-3">
          <Resumo valor={String(abertos.length)} label="Casos abertos" />
          <Resumo valor={String(vencidos.length)} label="Com SLA vencido" alerta={vencidos.length > 0} />
          <Resumo valor={String(relatos.status === 'success' ? relatos.data.length : 0)} label="Total no ciclo" />
        </div>

        <div className="mb-5 sm:max-w-[240px]">
          <Select value={filtro} onChange={setFiltro} ariaLabel="Filtrar casos" options={FILTROS} />
        </div>

        {(relatos.status === 'idle' || relatos.status === 'loading') && (
          <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}</div>
        )}
        {relatos.status === 'error' && <ErrorState message={relatos.message} onRetry={relatos.reload} />}

        {relatos.status === 'success' && (
          <>
            {lista.length === 0 ? (
              <div className="rounded-lg border border-border bg-surface px-5 py-14 text-center">
                <p className="text-[15px] font-semibold text-ink">Nenhum caso neste filtro</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {lista.map((r) => {
                  const st = RELATO_STATUS[r.status]
                  const dias = diasRestantes(r.prazoEm)
                  const vencido = r.status !== 'concluido' && dias < 0
                  return (
                    <li key={r.id}>
                      <button
                        onClick={() => setDetalhe(r)}
                        className="flex w-full flex-col gap-2 rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-hover"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-semibold text-ink-muted">{r.protocolo}</span>
                            <Badge tone={st.tone}>{st.label}</Badge>
                          </div>
                          <span className={`text-[11.5px] font-medium ${vencido ? 'text-danger-ink' : 'text-ink-muted'}`}>
                            {r.status === 'concluido'
                              ? `concluído`
                              : vencido
                                ? `SLA vencido há ${Math.abs(dias)} ${Math.abs(dias) === 1 ? 'dia' : 'dias'}`
                                : `${dias} ${dias === 1 ? 'dia' : 'dias'} para o prazo`}
                          </span>
                        </div>

                        <p className="text-[13.5px] font-semibold text-ink">{RELATO_CATEGORIA[r.categoria]}</p>
                        <p className="line-clamp-2 text-[12.5px] leading-relaxed text-ink-secondary">{r.descricao}</p>
                        <p className="text-[11.5px] text-ink-muted">
                          {r.departamento ?? 'Área não informada'} · aberto em {fmtData(r.abertoEm)}
                        </p>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}

        <div className="mt-6 flex gap-3 rounded-lg border border-border bg-surface-2 p-4">
          <Icon icon="ph:eye-slash-bold" width={20} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
          <p className="text-[12px] leading-relaxed text-ink-secondary">
            Os relatos chegam sem identificação. Quando o relator informa a área, ela aparece
            aqui, mas nenhuma informação permite chegar até a pessoa. O retorno é sempre pelo
            protocolo.
          </p>
        </div>
      </div>

      <Sheet open={detalhe !== null} onClose={() => setDetalhe(null)} title="Caso do canal de escuta" icon="ph:megaphone-simple-bold" size="md">
        {detalhe && (
          <RelatoDetalhe
            relato={detalhe}
            onSaved={() => { setDetalhe(null); relatos.reload() }}
          />
        )}
      </Sheet>
    </div>
  )
}

function RelatoDetalhe({ relato, onSaved }: { relato: Nr1Relato; onSaved: () => void }) {
  const [texto, setTexto] = useState('')
  const [salvando, setSalvando] = useState(false)
  const st = RELATO_STATUS[relato.status]

  const registrar = async (concluir: boolean) => {
    if (texto.trim().length < 10) return
    setSalvando(true)
    await nr1CanalService.andamento(relato.id, texto.trim(), concluir)
    onSaved()
  }

  return (
    <div className="flex flex-col gap-5 px-5 py-6 lg:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[12px] font-semibold text-ink">{relato.protocolo}</span>
        <Badge tone={st.tone}>{st.label}</Badge>
      </div>

      <div>
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">Categoria</p>
        <p className="mt-1 text-[13.5px] text-ink">{RELATO_CATEGORIA[relato.categoria]}</p>
      </div>

      <div>
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">Relato</p>
        <p className="mt-1 whitespace-pre-line text-[13.5px] leading-relaxed text-ink">{relato.descricao}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">Área</p>
          <p className="mt-1 text-[13px] text-ink">{relato.departamento ?? 'Não informada'}</p>
        </div>
        <div>
          <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">Prazo do SLA</p>
          <p className="mt-1 text-[13px] text-ink">{fmtData(relato.prazoEm)}</p>
        </div>
      </div>

      <div>
        <p className="mb-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">Trilha de tratamento</p>
        <ol className="relative flex flex-col gap-3 pl-7">
          <span className="absolute bottom-2 left-[11px] top-2 w-px bg-border" aria-hidden />
          {relato.andamentos.map((a) => (
            <li key={a.id} className="relative">
              <span className="absolute -left-7 flex h-6 w-6 items-center justify-center rounded-pill border border-border bg-surface text-primary dark:text-primary-300">
                <Icon icon="ph:circle-fill" width={7} aria-hidden />
              </span>
              <p className="text-[12.5px] leading-relaxed text-ink">{a.texto}</p>
              <p className="mt-0.5 font-mono text-[11px] text-ink-muted">{a.autor} · {fmtData(a.em)}</p>
            </li>
          ))}
        </ol>
      </div>

      {relato.status !== 'concluido' && (
        <div className="flex flex-col gap-3 border-t border-border pt-5">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-ink">Registrar andamento</span>
            <Textarea
              rows={3}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="O que foi apurado ou encaminhado. Evite registrar nomes de terceiros."
            />
          </label>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" disabled={texto.trim().length < 10 || salvando} onClick={() => registrar(false)}>
              Salvar andamento
            </Button>
            <Button iconLeft="ph:check-bold" disabled={texto.trim().length < 10 || salvando} onClick={() => registrar(true)}>
              {salvando ? 'Salvando…' : 'Concluir caso'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function Resumo({ valor, label, alerta }: { valor: string; label: string; alerta?: boolean }) {
  return (
    <div className={`flex flex-col gap-1 rounded-lg border bg-surface p-4 ${alerta ? 'border-danger/40' : 'border-border'}`}>
      <p className={`text-[24px] font-bold leading-none tracking-[-0.02em] ${alerta ? 'text-danger-ink' : 'text-ink'}`}>{valor}</p>
      <p className="text-[11.5px] leading-snug text-ink-secondary">{label}</p>
    </div>
  )
}
