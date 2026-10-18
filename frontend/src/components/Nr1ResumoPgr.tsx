import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@iconify/react'
import { Button } from './Button'
import { Skeleton } from './Skeleton'
import { useService } from '../hooks/useService'
import { useRh } from '../contexts/RhContext'
import { nr1ResultadoService, nr1FatorService } from '../services/nr1'
import { NIVEL_RISCO, NR1_PROBABILIDADE_ROTULOS, NR1_SEVERIDADE_ROTULOS, fmtData } from '../lib/nr1'
import { NR1_TODAY, NR1_RECORTE_OUTROS, nr1RiscoNoRecorte } from '../data/nr1Mock'
import type { Nr1Campanha, Nr1Cid, Nr1FatorRisco, Nr1RiscoInventario } from '../types'

/* Resumo para o PGR — o inventário de riscos psicossociais do ciclo num
   formato de planilha, organizado por departamento, pronto para anexar ao
   PGR: domínio, fator, severidade, probabilidade, nível e as lesões/agravos
   (CID). Abre em tela cheia, com exportação (CSV, abre no Excel) e
   impressão (só o documento). */

interface GrupoPgr {
  id: string
  nome: string
  respondentes?: number
  riscos: Nr1RiscoInventario[]
}

function useDadosPgr(campanhaId: string, recorte: string) {
  const riscos = useService(() => nr1ResultadoService.inventario(campanhaId), [campanhaId])
  const recortes = useService(() => nr1ResultadoService.recortes(campanhaId), [campanhaId])
  const catalogo = useService(() => nr1FatorService.catalogo(), [])
  const cids = useService(() => nr1FatorService.cids(), [])
  const carregado = [riscos, recortes, catalogo, cids].every((x) => x.status === 'success')

  const lista = (riscos.status === 'success' ? riscos.data : []).filter((r) => nr1RiscoNoRecorte(r, recorte))
  const visiveis = recortes.status === 'success' ? recortes.data.visiveis : []
  /* O PGR lista o inventário por grupo exposto: um fator aparece em cada
     departamento em que foi apontado, com a probabilidade e o nível daquela
     área. Fator apontado só na empresa inteira fica no grupo geral. */
  const grupos: GrupoPgr[] = [
    ...visiveis.map((d) => ({ id: d.id, nome: d.nome, respondentes: d.respondentes as number | undefined })),
    { id: 'empresa', nome: 'Toda a empresa (geral)', respondentes: undefined as number | undefined },
  ]
    .filter((g) => recorte === 'empresa' || g.id === recorte)
    .map((g) => ({
      ...g,
      riscos: (g.id === 'empresa'
        ? lista.filter((r) => r.departamentoIds.length === 0)
        : lista.map((r) => nr1RiscoNoRecorte(r, g.id)).filter((r): r is Nr1RiscoInventario => !!r)
      ).sort((a, b) => b.nivelNum - a.nivelNum),
    }))
    .filter((g) => g.riscos.length > 0)

  const lesoes = (r: Nr1RiscoInventario): Nr1Cid[] => {
    const f = catalogo.status === 'success' ? catalogo.data.find((x: Nr1FatorRisco) => x.id === r.fatorRiscoId) : undefined
    return (f?.cidIds ?? []).map((id) => (cids.status === 'success' ? cids.data.find((c) => c.id === id) : undefined)).filter((c): c is Nr1Cid => !!c)
  }
  return { carregado, lista, grupos, lesoes }
}

/** Bloco do detalhe do ciclo: texto explicativo e o botão para abrir. */
export function Nr1ResumoPgrChamada({ total, onAbrir }: { total: number; onAbrir: () => void }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 sm:flex-row sm:items-center lg:p-6">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
        <Icon icon="ph:file-text-bold" width={24} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] leading-relaxed text-ink">
          O resumo reúne, por departamento, os fatores de risco psicossocial identificados neste ciclo — com domínio,
          severidade, probabilidade, nível do risco e as possíveis lesões e agravos (CID) — no formato do inventário de
          riscos do GRO.
        </p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-secondary">
          É o insumo para o SESMT ou a consultoria de SST incorporar ao PGR da empresa. Você pode exportar em planilha ou imprimir.
          {total > 0 && <> Este ciclo tem <strong className="font-semibold text-ink">{total} {total === 1 ? 'fator' : 'fatores'}</strong> no resumo.</>}
        </p>
      </div>
      <Button iconLeft="ph:eye-bold" className="shrink-0" onClick={onAbrir}>Visualizar resumo</Button>
    </div>
  )
}

export function Nr1ResumoPgrModal({ aberto, campanha, recorte, recorteNome, onClose }: {
  aberto: boolean
  campanha: Nr1Campanha
  recorte: string
  recorteNome: string
  onClose: () => void
}) {
  if (!aberto) return null
  return createPortal(
    <ResumoPgr campanha={campanha} recorte={recorte} recorteNome={recorteNome} onClose={onClose} />,
    document.body,
  )
}

const celula = 'border border-border px-3 py-2 align-top text-[12.5px] leading-snug'
const cabecalho = 'border border-border bg-surface-2 px-3 py-2 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-secondary'

function ResumoPgr({ campanha, recorte, recorteNome, onClose }: {
  campanha: Nr1Campanha
  recorte: string
  recorteNome: string
  onClose: () => void
}) {
  const { empresa } = useRh()
  const { carregado, lista, grupos, lesoes } = useDadosPgr(campanha.id, recorte)
  const ciclo = (campanha.nome.split('·').pop() ?? campanha.nome).trim()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])

  /* CSV com ";" e BOM — abre direto no Excel em português, acentos certos. */
  const exportar = () => {
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
    const linhas = [
      ['Departamento', 'Domínio', 'Fator de risco identificado', 'Severidade', 'Probabilidade', 'Nível do risco', 'Possíveis lesões e agravos (CID)'],
      ...grupos.flatMap((g) => g.riscos.map((r) => [
        g.nome,
        r.dimensao,
        r.fator,
        `${r.severidade} - ${NR1_SEVERIDADE_ROTULOS[r.severidade - 1]}`,
        `${r.probabilidade} - ${NR1_PROBABILIDADE_ROTULOS[r.probabilidade - 1]}`,
        `${NIVEL_RISCO[r.nivel].label} (${r.nivelNum})`,
        lesoes(r).map((c) => `${c.codigo} ${c.nome}`).join('; '),
      ])),
    ]
    const csv = '﻿' + linhas.map((l) => l.map(esc).join(';')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `resumo-pgr-${campanha.protocolo}${recorte !== 'empresa' ? `-${recorte}` : ''}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="nr1-pgr-print fixed inset-0 z-50 flex flex-col bg-surface-2" role="dialog" aria-modal aria-label="Resumo para o PGR">
      {/* Na impressão, só o documento: some a aplicação por trás e a barra
          de ações; a tabela sai inteira, sem a rolagem da tela. */}
      <style>{`
        @media print {
          body > *:not(.nr1-pgr-print) { display: none !important; }
          .nr1-pgr-print { position: static !important; background: white !important; }
          .nr1-pgr-print .nr1-pgr-acoes { display: none !important; }
          .nr1-pgr-print .nr1-pgr-rolagem { overflow: visible !important; }
          .nr1-pgr-print * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { size: A4 landscape; margin: 12mm; }
        }
      `}</style>

      <header className="nr1-pgr-acoes flex shrink-0 items-center gap-3 border-b border-border bg-surface px-5 py-3 lg:px-8">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
          <Icon icon="ph:file-text-bold" width={20} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">Ciclo {ciclo}</p>
          <h2 className="truncate font-heading text-[17px] font-semibold text-ink">Resumo para o PGR</h2>
        </div>
        <Button size="sm" variant="secondary" iconLeft="ph:file-xls-bold" disabled={!carregado || lista.length === 0} onClick={exportar}>
          <span className="hidden sm:inline">Exportar planilha</span>
        </Button>
        <Button size="sm" iconLeft="ph:printer-bold" disabled={!carregado} onClick={() => window.print()}>
          <span className="hidden sm:inline">Imprimir</span>
        </Button>
        <button
          onClick={onClose}
          aria-label="Fechar resumo"
          className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-surface-hover"
        >
          <Icon icon="ph:x-bold" width={18} aria-hidden />
        </button>
      </header>

      <div className="nr1-pgr-rolagem flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-5 lg:p-8">
          <div className="rounded-lg border border-border bg-surface p-6 lg:p-8">
            {/* Identificação do documento */}
            <div className="mb-6 border-b border-border pb-5">
              <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Inventário de riscos psicossociais · NR-1</p>
              <h1 className="mt-1 font-heading text-[22px] font-bold text-ink">Resumo para o PGR</h1>
              <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 text-[12.5px] sm:grid-cols-2">
                <Info rotulo="Empresa">{empresa.razaoSocial} · CNPJ {empresa.cnpj}</Info>
                <Info rotulo="Ciclo de avaliação">{ciclo} · {fmtData(campanha.inicio)} a {fmtData(campanha.fim)}</Info>
                <Info rotulo="Instrumento">{campanha.modeloNome} · versão {campanha.versao}</Info>
                <Info rotulo="Protocolo">{campanha.protocolo}</Info>
                <Info rotulo="Recorte">{recorteNome}</Info>
                <Info rotulo="Gerado em">{fmtData(NR1_TODAY)}</Info>
              </dl>
            </div>

            {!carregado && <Skeleton className="h-64 w-full rounded-lg" />}
            {carregado && lista.length === 0 && (
              <p className="rounded-lg bg-surface-2 px-5 py-10 text-center text-[13px] text-ink-secondary">
                {recorte === NR1_RECORTE_OUTROS
                  ? 'As áreas reunidas em "Outros departamentos" não geram fatores por área — elas entram nos fatores apontados na empresa.'
                  : 'Nenhum fator de risco requer plano de ação neste recorte.'}
              </p>
            )}
            {carregado && lista.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] border-collapse">
                  <colgroup>
                    <col className="w-[15%]" />
                    <col className="w-[22%]" />
                    <col className="w-[11%]" />
                    <col className="w-[11%]" />
                    <col className="w-[10%]" />
                    <col className="w-[31%]" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className={cabecalho}>Domínio</th>
                      <th className={cabecalho}>Fator de risco identificado</th>
                      <th className={cabecalho}>Severidade</th>
                      <th className={cabecalho}>Probabilidade</th>
                      <th className={cabecalho}>Nível do risco</th>
                      <th className={cabecalho}>Possíveis lesões e agravos (CID)</th>
                    </tr>
                  </thead>
                  {grupos.map((g) => (
                    <tbody key={g.id}>
                      <tr>
                        <th colSpan={6} scope="colgroup" className="border border-border bg-primary-50 px-3 py-2 text-left text-[13px] font-semibold text-ink">
                          {g.nome}
                          <span className="ml-2 font-normal text-ink-secondary">
                            {g.riscos.length} {g.riscos.length === 1 ? 'fator' : 'fatores'}{g.respondentes !== undefined ? ` · ${g.respondentes} respondentes` : ''}
                          </span>
                        </th>
                      </tr>
                      {g.riscos.map((r) => (
                        <tr key={r.id}>
                          <td className={`${celula} text-ink-secondary`}>{r.dimensao}</td>
                          <td className={`${celula} font-medium text-ink`}>{r.fator}</td>
                          <td className={`${celula} text-ink`}>{r.severidade} · {NR1_SEVERIDADE_ROTULOS[r.severidade - 1]}</td>
                          <td className={`${celula} text-ink`}>{r.probabilidade} · {NR1_PROBABILIDADE_ROTULOS[r.probabilidade - 1]}</td>
                          <td className={`${celula} font-semibold ${NIVEL_RISCO[r.nivel].cls}`}>
                            {NIVEL_RISCO[r.nivel].label} <span className="font-mono font-normal opacity-80">({r.nivelNum})</span>
                          </td>
                          <td className={`${celula} text-ink-secondary`}>
                            {lesoes(r).map((c) => (
                              <div key={c.id} className="flex gap-1.5">
                                <span className="w-11 shrink-0 font-mono font-semibold text-ink">{c.codigo}</span>
                                <span>{c.nome}</span>
                              </div>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  ))}
                </table>
              </div>
            )}

            <p className="mt-5 text-[11.5px] leading-relaxed text-ink-muted">
              Nível do risco = probabilidade (pela nota das perguntas do questionário vinculadas ao fator) × severidade (definida
              pela YNA para cada fator). Áreas com menos de 4 respondentes não aparecem separadas, para preservar o anonimato,
              e entram nos fatores da empresa. A YNA fornece o insumo; a responsabilidade técnica pelo PGR é do SESMT ou da
              consultoria de SST da empresa.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Info({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="w-32 shrink-0 text-ink-muted">{rotulo}</dt>
      <dd className="min-w-0 text-ink">{children}</dd>
    </div>
  )
}
