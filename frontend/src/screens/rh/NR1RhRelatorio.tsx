import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Sheet } from '../../components/Sheet'
import { Modal } from '../../components/Modal'
import { Input } from '../../components/Input'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { NIVEL_RISCO, fmtData, pct } from '../../lib/nr1'
import { useService } from '../../hooks/useService'
import { useRh } from '../../contexts/RhContext'
import { nr1ResultadoService, nr1CampanhaService, nr1AcaoService } from '../../services/nr1'
import type { Nr1ResponsavelTecnico, Nr1RiscoInventario, Nr1TrilhaEtapaTipo } from '../../types'

/* NR1-RH-05 — Relatório de gestão e rastreabilidade (RF-F01/02/03/04).

   O critério de "defensável" não é a estética do relatório: é conseguir
   percorrer, sem lacunas, a cadeia risco → avaliação → inventário → ação →
   evidência. Por isso a trilha é navegável aqui na tela, não só no PDF.

   O campo de responsável técnico existe porque a YNA fornece o insumo
   qualificado — quem assina o PGR é o SESMT ou a consultoria do cliente. */

const ETAPA_ICON: Record<Nr1TrilhaEtapaTipo, string> = {
  avaliacao: 'ph:chart-bar-bold',
  inventario: 'ph:clipboard-text-bold',
  acao: 'ph:list-checks-bold',
  evidencia: 'ph:paperclip-bold',
}

export function NR1RhRelatorio() {
  const { empresa } = useRh()
  const campanha = useService(() => nr1CampanhaService.ativa(), [])
  const inventario = useService(() => nr1ResultadoService.inventario(), [])
  const acoes = useService(() => nr1AcaoService.list(), [])
  const responsavel = useService(() => nr1ResultadoService.responsavelTecnico(), [])

  const [trilhaDe, setTrilhaDe] = useState<Nr1RiscoInventario | null>(null)
  const [respOpen, setRespOpen] = useState(false)
  const [exportando, setExportando] = useState(false)
  const [exportado, setExportado] = useState<string | null>(null)

  const exportar = async () => {
    setExportando(true)
    const r = await nr1ResultadoService.exportarRelatorio()
    setExportando(false)
    setExportado(r.arquivo)
  }

  const riscos = inventario.status === 'success' ? inventario.data : []
  const listaAcoes = acoes.status === 'success' ? acoes.data : []
  const comEvidencia = listaAcoes.filter((a) => a.evidencias.length > 0).length
  const semAcao = riscos.filter((r) => !listaAcoes.some((a) => a.riscoId === r.id))

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />

        <Link to="/rh/nr1" className="mt-2 mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary transition-colors hover:text-ink lg:mt-0">
          <Icon icon="ph:arrow-left-bold" width={14} aria-hidden />
          Conformidade NR-1
        </Link>

        <PageHeader
          title="Relatório de gestão"
          subtitle="A visão executiva e a trilha que sustenta a conformidade."
          action={
            <Button variant="secondary" iconLeft="ph:file-pdf-bold" disabled={exportando} onClick={exportar}>
              {exportando ? 'Gerando…' : <span className="hidden sm:inline">Exportar PDF</span>}
            </Button>
          }
        />

        {/* Identificação do ciclo — data, versão e protocolo (RF-F02) */}
        <section className="mb-6 rounded-lg border border-border bg-surface p-5">
          <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">Identificação do ciclo</span>
          {(campanha.status === 'idle' || campanha.status === 'loading') && <Skeleton className="mt-3 h-20 w-full rounded-lg" />}
          {campanha.status === 'success' && campanha.data && (
            <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Linha termo="Empresa" valor={`${empresa.razaoSocial} · ${empresa.cnpj}`} />
              <Linha termo="Protocolo do ciclo" valor={campanha.data.protocolo} mono />
              <Linha termo="Instrumento aplicado" valor={`${campanha.data.modeloNome} · versão ${campanha.data.versao}`} />
              <Linha termo="Período de coleta" valor={`${fmtData(campanha.data.inicio)} a ${fmtData(campanha.data.fim)}`} />
              <Linha termo="Participação" valor={`${campanha.data.respostas} de ${campanha.data.elegiveis} (${pct(campanha.data.respostas, campanha.data.elegiveis)}%)`} />
              <Linha termo="Metodologia" valor="HSE Indicator Tool + COPSOQ, mapeados às 4 dimensões do Guia do MTE" />
            </dl>
          )}
          {campanha.status === 'success' && !campanha.data && (
            <p className="mt-3 text-[13px] text-ink-secondary">Nenhuma campanha em campo para relatar.</p>
          )}
        </section>

        {/* Visão executiva */}
        <section className="mb-6">
          <h2 className="mb-3 text-[15px] font-semibold text-ink">Visão executiva</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Tile icon="ph:warning-bold" valor={String(riscos.length)} label="Riscos inventariados" />
            <Tile icon="ph:list-checks-bold" valor={String(listaAcoes.length)} label="Ações no plano" />
            <Tile icon="ph:paperclip-bold" valor={String(comEvidencia)} label="Ações com evidência" />
            <Tile icon="ph:seal-warning-bold" valor={String(semAcao.length)} label="Riscos sem ação" tom={semAcao.length > 0 ? 'alerta' : undefined} />
          </div>
          {semAcao.length > 0 && (
            <p className="mt-2 text-[12px] leading-relaxed text-warning-ink">
              {semAcao.length} {semAcao.length === 1 ? 'risco priorizado ainda não tem' : 'riscos priorizados ainda não têm'} ação
              definida. É a lacuna mais comum apontada em fiscalização.
            </p>
          )}
        </section>

        {/* Rastreabilidade */}
        <section className="mb-6">
          <h2 className="mb-1 text-[15px] font-semibold text-ink">Rastreabilidade por risco</h2>
          <p className="mb-3 text-[12.5px] leading-relaxed text-ink-secondary">
            Cada risco priorizado pode ser percorrido até a avaliação que o originou, o
            inventário, a ação definida e a evidência de execução.
          </p>

          {(inventario.status === 'idle' || inventario.status === 'loading') && (
            <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}</div>
          )}
          {inventario.status === 'error' && <ErrorState message={inventario.message} onRetry={inventario.reload} />}

          {inventario.status === 'success' && (
            <ul className="flex flex-col gap-2">
              {riscos.map((r) => {
                const st = NIVEL_RISCO[r.nivel]
                const n = listaAcoes.filter((a) => a.riscoId === r.id).length
                return (
                  <li key={r.id}>
                    <button
                      onClick={() => setTrilhaDe(r)}
                      className="flex w-full items-start gap-3 rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-hover"
                    >
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-[12px] font-bold ${st.cls}`}>
                        {r.nivelNum}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] leading-snug text-ink">{r.fator}</span>
                        <span className="mt-1 block text-[11.5px] text-ink-muted">
                          {r.grupoExposto} · {n} {n === 1 ? 'ação' : 'ações'}
                          {n === 0 && ' · sem ação definida'}
                        </span>
                      </span>
                      <Icon icon="ph:caret-right-bold" width={15} className="mt-1 shrink-0 text-ink-muted" aria-hidden />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* Responsável técnico */}
        <section className="mb-6 rounded-lg border border-border bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">Responsável técnico</span>
              {responsavel.status === 'success' && (
                <>
                  <p className="mt-1.5 font-heading text-[15px] font-semibold text-ink">{responsavel.data.nome || 'Não informado'}</p>
                  <p className="mt-0.5 text-[12.5px] text-ink-secondary">{responsavel.data.registro}</p>
                  <p className="text-[12.5px] text-ink-secondary">{responsavel.data.empresa}</p>
                  {responsavel.data.assinadoEm && (
                    <p className="mt-1 font-mono text-[11px] text-ink-muted">registrado em {fmtData(responsavel.data.assinadoEm)}</p>
                  )}
                </>
              )}
              {(responsavel.status === 'idle' || responsavel.status === 'loading') && <Skeleton className="mt-2 h-16 w-56 rounded-lg" />}
            </div>
            <Button size="sm" variant="ghost" iconLeft="ph:pencil-simple-bold" onClick={() => setRespOpen(true)}>Editar</Button>
          </div>
          <p className="mt-4 flex items-start gap-2 border-t border-border pt-3 text-[12px] leading-relaxed text-ink-muted">
            <Icon icon="ph:info-bold" width={13} className="mt-0.5 shrink-0" aria-hidden />
            Quem assina o PGR é o SESMT ou a consultoria de SST da sua empresa, não a YNA. O que
            entregamos aqui é o material técnico para esse profissional sustentar o documento.
          </p>
        </section>
      </div>

      <Sheet open={trilhaDe !== null} onClose={() => setTrilhaDe(null)} title="Trilha de rastreabilidade" icon="ph:path-bold" size="md">
        {trilhaDe && <TrilhaView riscoId={trilhaDe.id} />}
      </Sheet>

      <Sheet open={respOpen} onClose={() => setRespOpen(false)} title="Responsável técnico" icon="ph:identification-card-bold" size="md">
        {responsavel.status === 'success' && (
          <ResponsavelForm
            inicial={responsavel.data}
            onClose={() => setRespOpen(false)}
            onSaved={() => { setRespOpen(false); responsavel.reload() }}
          />
        )}
      </Sheet>

      <Modal open={exportado !== null} title="Relatório gerado" onClose={() => setExportado(null)}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-3.5">
            <Icon icon="ph:file-arrow-down-bold" width={20} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
            <span className="min-w-0 truncate font-mono text-[12.5px] text-ink">{exportado}</span>
          </div>
          <p className="text-[12.5px] leading-relaxed text-ink-secondary">
            O relatório traz a visão executiva, a trilha completa por risco e o campo de
            assinatura do responsável técnico.
          </p>
          <Button fullWidth onClick={() => setExportado(null)}>Fechar</Button>
        </div>
      </Modal>
    </div>
  )
}

function TrilhaView({ riscoId }: { riscoId: string }) {
  const trilha = useService(() => nr1ResultadoService.trilha(riscoId), [riscoId])

  return (
    <div className="px-5 py-6 lg:px-6">
      {(trilha.status === 'idle' || trilha.status === 'loading') && <Skeleton className="h-64 w-full rounded-lg" />}
      {trilha.status === 'error' && <ErrorState message={trilha.message} onRetry={trilha.reload} />}
      {trilha.status === 'success' && trilha.data && (
        <>
          <div className="mb-5 rounded-lg bg-surface-2 p-3.5">
            <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">Risco</p>
            <p className="mt-1 text-[13.5px] leading-snug text-ink">{trilha.data.fator}</p>
            <p className="mt-1 text-[11.5px] text-ink-muted">{trilha.data.grupoExposto}</p>
          </div>

          <ol className="relative flex flex-col gap-4 pl-7">
            {/* Linha do tempo */}
            <span className="absolute bottom-2 left-[11px] top-2 w-px bg-border" aria-hidden />
            {trilha.data.etapas.map((e, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-7 flex h-6 w-6 items-center justify-center rounded-pill border border-border bg-surface text-primary dark:text-primary-300">
                  <Icon icon={ETAPA_ICON[e.tipo]} width={12} aria-hidden />
                </span>
                <p className="text-[13.5px] font-semibold leading-snug text-ink">{e.titulo}</p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-secondary">{e.detalhe}</p>
                <p className="mt-0.5 font-mono text-[11px] text-ink-muted">{fmtData(e.em)}</p>
              </li>
            ))}
          </ol>

          {trilha.data.etapas.every((e) => e.tipo !== 'evidencia') && (
            <p className="mt-5 rounded-lg bg-warning-bg px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-secondary">
              A cadeia está incompleta: falta a evidência de execução. Um auditor consegue chegar
              até a ação, mas não até a prova de que ela aconteceu.
            </p>
          )}
        </>
      )}
    </div>
  )
}

function ResponsavelForm({ inicial, onClose, onSaved }: {
  inicial: Nr1ResponsavelTecnico
  onClose: () => void
  onSaved: () => void
}) {
  const [nome, setNome] = useState(inicial.nome)
  const [registro, setRegistro] = useState(inicial.registro)
  const [empresa, setEmpresa] = useState(inicial.empresa)
  const [salvando, setSalvando] = useState(false)
  const valido = nome.trim().length >= 3 && registro.trim().length >= 3

  const salvar = async () => {
    if (!valido) return
    setSalvando(true)
    await nr1ResultadoService.salvarResponsavel({ nome: nome.trim(), registro: registro.trim(), empresa: empresa.trim() })
    onSaved()
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
      <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do profissional de SST" />
      <Input label="Registro profissional" value={registro} onChange={(e) => setRegistro(e.target.value)} placeholder="Ex.: Eng. Segurança do Trabalho · CREA-SP 000000" />
      <Input label="Empresa / consultoria" value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Nome da consultoria ou SESMT interno" />

      <div className="flex gap-3 rounded-lg border border-border bg-surface-2 p-3.5">
        <Icon icon="ph:info-bold" width={18} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
        <p className="text-[12px] leading-relaxed text-ink-secondary">
          Este é o profissional que assina o PGR da sua empresa. O nome aparece no relatório de
          gestão exportado.
        </p>
      </div>

      <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button iconLeft="ph:check-bold" disabled={!valido || salvando} onClick={salvar}>
          {salvando ? 'Salvando…' : 'Salvar responsável'}
        </Button>
      </div>
    </div>
  )
}

function Linha({ termo, valor, mono }: { termo: string; valor: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[11.5px] text-ink-muted">{termo}</dt>
      <dd className={`mt-0.5 text-[13px] leading-snug text-ink ${mono ? 'font-mono' : ''}`}>{valor}</dd>
    </div>
  )
}

function Tile({ icon, valor, label, tom }: { icon: string; valor: string; label: string; tom?: 'alerta' }) {
  return (
    <div className={`flex flex-col gap-1 rounded-lg border bg-surface p-4 ${tom === 'alerta' ? 'border-warning/40' : 'border-border'}`}>
      <Icon icon={icon} width={18} className={tom === 'alerta' ? 'text-warning-ink' : 'text-primary dark:text-primary-300'} aria-hidden />
      <p className="text-[26px] font-bold leading-none tracking-[-0.02em] text-ink">{valor}</p>
      <p className="text-[12px] text-ink-secondary">{label}</p>
    </div>
  )
}
