import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@iconify/react'
import { Button } from './Button'
import { Skeleton } from './Skeleton'
import { LogoYna } from './YnaLogo'
import { useService } from '../hooks/useService'
import { useRh } from '../contexts/RhContext'
import { nr1ResultadoService, nr1FatorService } from '../services/nr1'
import {
  NIVEL_MATRIZ, NIVEL_RISCO, NR1_NIVEIS_MATRIZ, NR1_PROBABILIDADE_ROTULOS, NR1_SEVERIDADE_ROTULOS,
  NR1_PROBABILIDADE_ESCALA, NR1_SEVERIDADE_DESCRICOES, fmtData, pct,
} from '../lib/nr1'
import { NR1_DIMENSOES, NR1_PONTUACAO, NR1_TODAY, NR1_RECORTE_OUTROS, nr1NivelPorProduto, nr1RiscoNoRecorte } from '../data/nr1Mock'
import type { Nr1Campanha, Nr1Cid, Nr1DimensaoId, Nr1FatorRisco, Nr1LinhaMapa, Nr1RiscoInventario } from '../types'

/* Resumo para o PGR — o relatório de avaliação de riscos psicossociais do
   ciclo, no modelo da YNA (base COPSOQ II): dados cadastrais e da
   avaliação, objetivo e metodologia, resultados por domínio e por
   departamento, a matriz 5 × 5 com as escalas e categorias, o inventário
   de fatores por departamento (domínio, fator, severidade, probabilidade,
   nível e lesões/agravos — CID), plano de ação, reavaliação e conclusão.
   Os textos de metodologia são fixos; os números vêm do ciclo. Abre em
   tela cheia, com exportação do inventário (CSV, abre no Excel) e
   impressão (só o documento). */

/** Dimensões avaliadas em cada domínio (modelo YNA, base COPSOQ II). */
const DIMENSOES_POR_DOMINIO: Record<Nr1DimensaoId, string[]> = {
  demandas: ['Demandas quantitativas', 'Ritmo de trabalho', 'Demandas emocionais'],
  organizacao: ['Influência no trabalho', 'Possibilidade de desenvolvimento', 'Significado do trabalho', 'Comprometimento com o trabalho'],
  relacoes: ['Previsibilidade', 'Reconhecimento', 'Clareza do papel'],
  lideranca: ['Reconhecimento', 'Qualidade da liderança', 'Suporte social'],
  contexto: ['Satisfação no trabalho', 'Conflitos trabalho e família'],
  valores: ['Confiança na gestão', 'Justiça'],
  saude: ['Saúde geral', 'Sintomas de burnout', 'Sintomas de estresse'],
  seguranca: ['Saúde física e mental'],
}

/** Fatores de risco abordados em cada domínio, como no modelo do relatório
   (texto fixo da metodologia; os nomes do catálogo usados no inventário,
   seção 5.4, são outros). */
const FATORES_POR_DOMINIO: Record<Nr1DimensaoId, string[]> = {
  demandas: [
    'Sobrecarga de trabalho e tempo insuficiente para execução das atividades',
    'Exigências emocionais elevadas e exposição às emoções de terceiros',
  ],
  organizacao: [
    'Baixa autonomia na organização e nas decisões do trabalho',
    'Baixas oportunidades de desenvolvimento',
    'Baixo significado, vínculo e engajamento organizacional',
  ],
  relacoes: [
    'Falhas na comunicação e previsibilidade organizacional',
    'Percepção de tratamento injusto',
    'Falta de clareza de metas e papéis profissionais',
  ],
  lideranca: [
    'Falta de reconhecimento e valorização profissional',
    'Falhas no planejamento da liderança',
    'Baixo suporte e escuta da liderança',
  ],
  contexto: ['Insatisfação com o trabalho', 'Desequilíbrio entre trabalho e vida pessoal'],
  valores: ['Baixa confiança e transparência da liderança', 'Gestão injusta de conflitos', 'Distribuição desigual do trabalho'],
  saude: ['Percepção negativa do estado de saúde geral', 'Estresse e esgotamento físico e emocional'],
  seguranca: ['Ambiente psicologicamente e emocionalmente desfavorável', 'Insegurança física no trabalho'],
}

const OBJETIVOS = [
  'identificar fatores de risco psicossocial relacionados à organização e às condições de trabalho;',
  'compreender os principais fatores que demandam atenção;',
  'identificar fatores de proteção e recursos organizacionais;',
  'apoiar a classificação e priorização dos riscos;',
  'subsidiar a definição de medidas preventivas e corretivas;',
  'apoiar a elaboração e/ou atualização do Plano de Ação;',
  'fornecer informações que possam ser integradas ao Gerenciamento de Riscos Ocupacionais (GRO) e ao Programa de Gerenciamento de Riscos (PGR).',
]

const ANALISE = [
  'resultados gerais da organização;',
  'resultados por domínio;',
  'resultados por departamento, quando houver quantidade de respondentes suficiente para preservar a confidencialidade;',
  'identificação dos fatores com maior necessidade de atenção;',
  'identificação de fatores positivos;',
  'priorização para intervenção.',
]

const CRITERIOS_REAVALIACAO = [
  'natureza e magnitude dos riscos identificados;',
  'medidas implementadas;',
  'alterações na organização do trabalho;',
  'mudanças relevantes nas condições de trabalho;',
  'ocorrência de eventos ou evidências que indiquem necessidade de nova avaliação;',
  'critérios definidos no gerenciamento de riscos ocupacionais da organização.',
]

/** Faixa de pontuação (P × S) de cada nível da matriz (`nr1NivelPorProduto`). */
const FAIXA_MATRIZ: Record<(typeof NR1_NIVEIS_MATRIZ)[number], string> = {
  irrelevante: '1 a 3', baixo: '4 a 6', moderado: '8 a 10', alto: '12 a 16', critico: '20 a 25',
}

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

/** Dados do ciclo inteiro para as seções de resultado (5.1 e 5.2) — não
   seguem o recorte, que vale só para o inventário. */
function useResultadosCiclo(campanhaId: string) {
  const dominios = useService(() => nr1ResultadoService.mediaPorDimensao(campanhaId), [campanhaId])
  const mapa = useService(() => nr1ResultadoService.mapaCalorAgregado(campanhaId), [campanhaId])
  return {
    carregado: dominios.status === 'success' && mapa.status === 'success',
    dominios: dominios.status === 'success' ? dominios.data : [],
    linhas: mapa.status === 'success' ? mapa.data.linhas : [],
  }
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
          O relatório de avaliação reúne os dados do ciclo, a metodologia, os resultados por domínio e por departamento,
          a matriz de risco e, por departamento, os fatores de risco identificados — com severidade, probabilidade, nível
          e as possíveis lesões e agravos (CID).
        </p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-secondary">
          É o insumo para o SESMT ou a consultoria de SST incorporar ao PGR da empresa. Você pode imprimir o relatório ou exportar o inventário em planilha.
          {total > 0 && <> Este ciclo tem <strong className="font-semibold text-ink">{total} {total === 1 ? 'fator' : 'fatores'}</strong> no inventário.</>}
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
  const resultados = useResultadosCiclo(campanha.id)
  const ciclo = (campanha.nome.split('·').pop() ?? campanha.nome).trim()
  const respostas = campanha.participacao.reduce((s, p) => s + p.respostas, 0)
  const areas = campanha.participacao.filter((p) => p.respostas > 0).map((p) => p.departamento)
  const pronto = carregado && resultados.carregado

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
        `${NIVEL_MATRIZ[r.nivel].label} (${r.nivelNum})`,
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
          de ações; as tabelas saem inteiras, sem a rolagem da tela. */}
      <style>{`
        @media print {
          html, body { background: white !important; }
          body > *:not(.nr1-pgr-print) { display: none !important; }
          .nr1-pgr-print { position: static !important; background: white !important; }
          .nr1-pgr-print .nr1-pgr-acoes { display: none !important; }
          .nr1-pgr-print .nr1-pgr-rolagem { overflow: visible !important; }
          .nr1-pgr-print .nr1-pgr-folha { border: 0 !important; padding: 0 !important; }
          .nr1-pgr-print tr, .nr1-pgr-print .nr1-pgr-bloco { break-inside: avoid; }
          .nr1-pgr-print * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { size: A4 portrait; margin: 14mm; }
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
          <span className="hidden sm:inline">Exportar inventário</span>
        </Button>
        <Button size="sm" iconLeft="ph:printer-bold" disabled={!pronto} onClick={() => window.print()}>
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
        <div className="mx-auto max-w-5xl p-5 lg:p-8">
          <article className="nr1-pgr-folha flex flex-col gap-9 rounded-lg border border-border bg-surface p-6 text-ink lg:p-10">
            <header className="flex items-center gap-6 border-b border-border pb-6">
              <LogoYna className="h-10 w-[112px] shrink-0 text-primary dark:text-lavender" role="img" aria-label="YNA" />
              <div className="min-w-0 border-l border-border pl-6">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">YNA Care Hub</p>
                <h1 className="mt-1.5 max-w-2xl font-heading text-[21px] font-bold leading-snug text-ink">
                  Relatório de avaliação de riscos psicossociais relacionados ao trabalho
                </h1>
                <p className="mt-1.5 text-[12px] text-ink-muted">Protocolo {campanha.protocolo} · gerado em {fmtData(NR1_TODAY)}</p>
              </div>
            </header>

            <Secao n="1" titulo="Dados cadastrais">
              <dl className="grid grid-cols-1 gap-x-8 gap-y-2 text-[13px] sm:grid-cols-2">
                <Info rotulo="Empresa">{empresa.razaoSocial}</Info>
                <Info rotulo="CNPJ">{empresa.cnpj}</Info>
                <Info rotulo="Período da avaliação">{fmtData(campanha.inicio)} a {fmtData(campanha.encerradaEm ?? campanha.fim)}</Info>
                <Info rotulo="Ciclo">{ciclo}</Info>
                <Info rotulo="Instrumento">{campanha.modeloNome} · versão {campanha.versao}</Info>
                <Info rotulo="Recorte do inventário">{recorteNome}</Info>
              </dl>
            </Secao>

            <Secao n="2" titulo="Objetivo do relatório">
              <Paragrafo>
                Este relatório apresenta os resultados da avaliação dos fatores de riscos psicossociais relacionados ao trabalho
                realizada pela YNA Care Hub. A metodologia foi desenvolvida com base no COPSOQ II (Copenhagen Psychosocial
                Questionnaire).
              </Paragrafo>
              <Paragrafo>O objetivo é fornecer à organização informações estruturadas para:</Paragrafo>
              <Lista itens={OBJETIVOS} />
              <Nota>
                <strong className="font-semibold text-ink">Importante:</strong> este relatório constitui um instrumento de avaliação
                e apoio à gestão. Seus resultados devem ser analisados em conjunto com outras informações disponíveis sobre as
                condições de trabalho e, quando aplicável, integrados ao Inventário de Riscos Ocupacionais e ao Plano de Ação do PGR.
              </Nota>
            </Secao>

            <Secao n="3" titulo="Dados da avaliação">
              <Tabela cabecalhos={['Informação', 'Resultado']} larguras={['w-[45%]', '']}>
                <Linha celulas={['Número de trabalhadores elegíveis', String(campanha.elegiveis)]} />
                <Linha celulas={['Número de respondentes', String(respostas)]} />
                <Linha celulas={['Taxa de participação', `${pct(respostas, campanha.elegiveis)}%`]} />
                <Linha celulas={['Áreas avaliadas', `${areas.length}: ${areas.join(', ')}`]} />
                <Linha celulas={['Modalidade', 'Online']} />
              </Tabela>
            </Secao>

            <Secao n="4" titulo="Metodologia">
              <Paragrafo>
                A avaliação foi realizada por meio de metodologia estruturada pela YNA Care Hub, embasada no COPSOQ II. A
                metodologia busca avaliar fatores relacionados à organização, às condições e às relações de trabalho que podem
                atuar como fatores de risco ou de proteção psicossocial. Os resultados são apresentados de forma{' '}
                <strong className="font-semibold">agregada</strong>, preservando a confidencialidade das respostas individuais.
              </Paragrafo>
              <Paragrafo>A análise considera:</Paragrafo>
              <Lista itens={ANALISE} numerada />
              <Nota>
                A avaliação não tem finalidade de diagnóstico clínico individual e não permite concluir, isoladamente, que
                determinado trabalhador possui ou desenvolverá transtorno mental.
              </Nota>

              <Subtitulo n="4.1" titulo="Domínios, dimensões e fatores de risco abordados" />
              <Paragrafo>
                Os <strong className="font-semibold">domínios</strong> representam os principais eixos de análise, as{' '}
                <strong className="font-semibold">dimensões</strong> detalham os aspectos específicos das condições e da
                organização do trabalho, e os <strong className="font-semibold">fatores de risco psicossociais</strong> correspondem
                às situações que podem representar riscos à saúde e ao bem-estar dos trabalhadores. A seguir, os domínios, as
                dimensões e os fatores de risco contemplados na avaliação.
              </Paragrafo>
              <Tabela cabecalhos={['Domínio', 'Dimensões', 'Fatores de risco']} larguras={['w-[24%]', 'w-[34%]', '']}>
                {NR1_DIMENSOES.map((d) => (
                  <tr key={d.id}>
                    <td className={`${celula} font-medium`}>{d.nome}</td>
                    <td className={celula}>{DIMENSOES_POR_DOMINIO[d.id].map((x) => <div key={x}>{x}</div>)}</td>
                    <td className={celula}>{FATORES_POR_DOMINIO[d.id].map((x) => <div key={x} className="[&+&]:mt-1">{x}</div>)}</td>
                  </tr>
                ))}
              </Tabela>
            </Secao>

            <Secao n="5" titulo="Resultados">
              {!pronto && <Skeleton className="h-64 w-full rounded-lg" />}
              {pronto && (
                <>
                  <Subtitulo n="5.1" titulo="Visão geral" />
                  <Paragrafo>Nota média de cada domínio, de 1 a 5 (5 é a situação desejável), e a classificação do risco.</Paragrafo>
                  <Tabela cabecalhos={['Domínio', 'Resultado', 'Classificação']} larguras={['w-[55%]', 'w-[20%]', '']}>
                    {[...resultados.dominios].sort((a, b) => a.nome.localeCompare(b.nome)).map((d) => (
                      <tr key={d.dimensaoId}>
                        <td className={celula}>{d.nome}</td>
                        <td className={`${celula} font-mono font-semibold`}>{d.media.toFixed(1)}</td>
                        <td className={`${celula} font-semibold ${NIVEL_RISCO[d.nivel].cls}`}>{NIVEL_RISCO[d.nivel].label}</td>
                      </tr>
                    ))}
                  </Tabela>

                  <Subtitulo n="5.2" titulo="Mapa de domínio × departamento" />
                  <Paragrafo>
                    Os resultados por área, quando houver quantidade de respondentes suficiente. Caso contrário, são apresentados
                    de forma agregada, para manter o anonimato. A média das respostas é apresentada pelas classificações Baixo,
                    Médio e Alto.
                  </Paragrafo>
                  <MapaDepartamentos linhas={resultados.linhas} />

                  <Subtitulo n="5.3" titulo="Matriz 5 × 5" />
                  <Paragrafo>
                    A matriz apresenta a severidade × a probabilidade de cada risco identificado na organização. O nível do risco é
                    o produto das duas: a probabilidade vem da nota das perguntas do questionário vinculadas ao fator, e a
                    severidade é definida pela YNA para cada fator.
                  </Paragrafo>
                  <h4 className="mt-2 text-[13px] font-semibold">Probabilidade</h4>
                  <Tabela cabecalhos={['Nível', 'Classificação', 'Interpretação', 'Descrição da probabilidade']} larguras={['w-[8%]', 'w-[17%]', 'w-[22%]', '']}>
                    {NR1_PROBABILIDADE_ESCALA.map((p, i) => (
                      <Linha key={i} celulas={[String(i + 1), NR1_PROBABILIDADE_ROTULOS[i]!, p.interpretacao, p.descricao]} />
                    ))}
                  </Tabela>
                  <h4 className="mt-2 text-[13px] font-semibold">Severidade</h4>
                  <Tabela cabecalhos={['Nível', 'Classificação', 'Descrição da severidade']} larguras={['w-[8%]', 'w-[17%]', '']}>
                    {NR1_SEVERIDADE_DESCRICOES.map((d, i) => (
                      <Linha key={i} celulas={[String(i + 1), NR1_SEVERIDADE_ROTULOS[i]!, d]} />
                    ))}
                  </Tabela>
                  <h4 className="mt-2 text-[13px] font-semibold">Categorias de risco e ações</h4>
                  <Tabela cabecalhos={['Categoria', 'Classificação', 'Pontuação', 'Ações recomendadas']} larguras={['w-[11%]', 'w-[17%]', 'w-[13%]', '']}>
                    {NR1_NIVEIS_MATRIZ.map((n, i) => (
                      <tr key={n}>
                        <td className={celula}>{i + 1}</td>
                        <td className={`${celula} font-semibold ${NIVEL_MATRIZ[n].cls}`}>{NIVEL_MATRIZ[n].label}</td>
                        <td className={celula}>{FAIXA_MATRIZ[n]}</td>
                        <td className={celula}>{NIVEL_MATRIZ[n].recomendacao}</td>
                      </tr>
                    ))}
                  </Tabela>
                  <MatrizEstatica />

                  <Subtitulo n="5.4" titulo="Fatores de risco identificados" />
                  <Paragrafo>
                    O inventário dos fatores de risco que requerem plano de ação, por departamento, com a severidade, a
                    probabilidade, o nível do risco e as possíveis lesões e agravos à saúde (CID). Recorte: {recorteNome}.
                  </Paragrafo>
                  <Inventario grupos={grupos} lesoes={lesoes} vazio={lista.length === 0} recorte={recorte} />
                  <Nota>
                    Áreas com menos de {NR1_PONTUACAO.kAnonimato} respondentes não aparecem separadas, para preservar o anonimato, e
                    entram nos fatores da empresa.
                  </Nota>
                </>
              )}
            </Secao>

            <Secao n="6" titulo="Plano de ação">
              <Paragrafo>
                Na NR-01, o Plano de Ação está previsto no item 1.5.5.2 (Planos de ação), dentro do capítulo 1.5, que trata do
                Gerenciamento de Riscos Ocupacionais (GRO). Esse item estabelece a necessidade de elaborar um plano de ação com
                medidas de prevenção para eliminar, reduzir ou controlar os riscos ocupacionais identificados e avaliados. A
                elaboração do Plano de Ação e o seu gerenciamento são de total responsabilidade da empresa contratante.
              </Paragrafo>
              <Paragrafo>
                O sistema da YNA disponibiliza ferramenta para essa necessidade, quando contemplada em contrato, porém a
                responsabilidade de elaboração e gestão permanece com a empresa contratante.
              </Paragrafo>
            </Secao>

            <Secao n="7" titulo="Reavaliação">
              <Paragrafo>
                Recomenda-se que a organização estabeleça periodicidade para acompanhamento das medidas adotadas e reavaliação
                dos fatores identificados. A necessidade e o momento da reavaliação devem considerar:
              </Paragrafo>
              <Lista itens={CRITERIOS_REAVALIACAO} />
              <Nota>Sugerimos avaliações com intervalo de no máximo um ano para acompanhamento dos resultados das ações realizadas.</Nota>
            </Secao>

            <Secao n="8" titulo="Conclusão" inteira>
              <Paragrafo>
                A avaliação realizada pela YNA Care Hub identificou os principais fatores psicossociais relacionados às condições e
                à organização do trabalho. Recomenda-se que os resultados sejam analisados pela organização em conjunto com outras
                informações disponíveis sobre as condições de trabalho e utilizados como subsídio para definição, implementação e
                acompanhamento das medidas de prevenção.
              </Paragrafo>
              <Paragrafo>
                Os resultados agregados apresentados neste relatório não devem ser utilizados para identificação, avaliação ou
                julgamento individual de trabalhadores.
              </Paragrafo>
              <p className="mt-2 text-[13px] font-semibold">Documento confidencial · uso restrito à organização contratante.</p>
              <p className="text-[13px] text-ink-secondary">YNA Care Hub</p>
            </Secao>
          </article>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
   Peças do documento
   ------------------------------------------------------------------ */

function Secao({ n, titulo, inteira = false, children }: {
  n: string
  titulo: string
  /** Na impressão, não quebra a seção entre páginas (seções curtas). */
  inteira?: boolean
  children: React.ReactNode
}) {
  return (
    <section className={`flex flex-col gap-3 ${inteira ? 'nr1-pgr-bloco' : ''}`}>
      <h2 className="font-heading text-[16px] font-bold uppercase tracking-[0.02em] text-ink">{n}. {titulo}</h2>
      {children}
    </section>
  )
}

function Subtitulo({ n, titulo }: { n: string; titulo: string }) {
  return <h3 className="mt-3 font-heading text-[14.5px] font-semibold text-ink">{n} {titulo}</h3>
}

function Paragrafo({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] leading-relaxed text-ink">{children}</p>
}

function Nota({ children }: { children: React.ReactNode }) {
  return <p className="text-[11.5px] leading-relaxed text-ink-secondary">{children}</p>
}

function Lista({ itens, numerada = false }: { itens: string[]; numerada?: boolean }) {
  const Tag = numerada ? 'ol' : 'ul'
  return (
    <Tag className={`flex flex-col gap-1 pl-5 text-[13px] leading-relaxed ${numerada ? 'list-decimal' : 'list-disc'}`}>
      {itens.map((i) => <li key={i}>{i}</li>)}
    </Tag>
  )
}

function Tabela({ cabecalhos, larguras, children }: { cabecalhos: string[]; larguras: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto print:overflow-visible">
      <table className="w-full border-collapse">
        <colgroup>{larguras.map((l, i) => <col key={i} className={l} />)}</colgroup>
        <thead>
          <tr>{cabecalhos.map((c) => <th key={c} className={cabecalho}>{c}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function Linha({ celulas }: { celulas: string[] }) {
  return <tr>{celulas.map((c, i) => <td key={i} className={celula}>{c}</td>)}</tr>
}

/** 5.2 — mapa de domínio × departamento, estático (para leitura e
   impressão), com as áreas pequenas agregadas como na tela do ciclo. */
function MapaDepartamentos({ linhas }: { linhas: Nr1LinhaMapa[] }) {
  return (
    <div className="overflow-x-auto print:overflow-visible">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={cabecalho}>Área</th>
            {NR1_DIMENSOES.map((d) => (
              <th key={d.id} className={`${cabecalho} text-center normal-case tracking-normal`}>{d.curto}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => (
            <tr key={l.departamentoId}>
              <td className={celula}>
                <div className="font-medium">{l.departamento}</div>
                <div className="text-[11px] text-ink-muted">{l.respondentes} respondentes</div>
              </td>
              {l.protegido ? (
                <td colSpan={NR1_DIMENSOES.length} className={`${celula} text-center text-ink-muted`}>
                  Dados protegidos (menos de {NR1_PONTUACAO.kAnonimato} respostas)
                </td>
              ) : (
                l.celulas.map((c) => (
                  <td key={c.dimensaoId} className={`${celula} text-center ${c.nivel ? NIVEL_RISCO[c.nivel].cls : 'text-ink-muted'}`}>
                    <div className="font-mono font-semibold">{c.media !== null ? c.media.toFixed(1) : '—'}</div>
                    {c.nivel && <div className="text-[10.5px]">{NIVEL_RISCO[c.nivel].label}</div>}
                  </td>
                ))
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 flex flex-wrap gap-4 text-[11.5px] text-ink-secondary">
        {(['baixo', 'atencao', 'risco'] as const).map((n) => (
          <span key={n} className="inline-flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded-[3px] ${NIVEL_RISCO[n].dot}`} aria-hidden />
            {NIVEL_RISCO[n].label}
          </span>
        ))}
      </p>
    </div>
  )
}

/** 5.3 — a matriz 5 × 5 com o produto de cada célula e a legenda dos
   níveis, na mesma paleta da matriz das telas. */
function MatrizEstatica() {
  return (
    <div className="nr1-pgr-bloco flex flex-col gap-3">
      {/* O título fica dentro do bloco para não se separar da matriz na impressão. */}
      <h4 className="mt-2 text-[13px] font-semibold">Matriz de Risco</h4>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <table className="w-full flex-1 table-fixed border-collapse text-[12px]">
        <colgroup>
          <col className="w-7" />
          <col className="w-[110px]" />
          <col className="w-8" />
          {[1, 2, 3, 4, 5].map((sv) => <col key={sv} />)}
        </colgroup>
        <tbody>
          {[5, 4, 3, 2, 1].map((p) => (
            <tr key={p}>
              {p === 5 && (
                <th rowSpan={5} className="w-7 border border-border px-1 align-middle">
                  <span className="inline-block rotate-180 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted [writing-mode:vertical-rl]">
                    Probabilidade
                  </span>
                </th>
              )}
              <th className="border border-border px-2 py-1.5 text-right text-[11.5px] font-semibold">{NR1_PROBABILIDADE_ROTULOS[p - 1]}</th>
              <th className="border border-border px-2 py-1.5 font-mono text-[11.5px]">{p}</th>
              {[1, 2, 3, 4, 5].map((sv) => {
                const n = nr1NivelPorProduto(p * sv)
                return (
                  <td key={sv} className={`h-11 border border-border text-center font-mono font-semibold ${NIVEL_MATRIZ[n].cls}`}>
                    {p * sv}
                  </td>
                )
              })}
            </tr>
          ))}
          <tr>
            <td colSpan={3} />
            {[1, 2, 3, 4, 5].map((sv) => <td key={sv} className="border border-border py-1 text-center font-mono text-[11.5px]">{sv}</td>)}
          </tr>
          <tr>
            <td colSpan={3} />
            {NR1_SEVERIDADE_ROTULOS.map((r) => (
              <td key={r} className="border border-border px-1 py-1.5 text-center text-[11px] font-semibold leading-tight">{r}</td>
            ))}
          </tr>
          <tr>
            <td colSpan={3} />
            <td colSpan={5} className="border border-border py-1 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Severidade
            </td>
          </tr>
        </tbody>
      </table>
      <ul className="flex shrink-0 flex-col gap-1.5 text-[12px] sm:w-32">
        <li className="font-semibold">Nível de risco</li>
        {[...NR1_NIVEIS_MATRIZ].reverse().map((n) => (
          <li key={n} className={`rounded-md px-3 py-1.5 text-center font-semibold ${NIVEL_MATRIZ[n].cls}`}>{NIVEL_MATRIZ[n].label}</li>
        ))}
      </ul>
      </div>
    </div>
  )
}

/** 5.4 — o inventário por departamento (a mesma tabela do resumo anterior). */
function Inventario({ grupos, lesoes, vazio, recorte }: {
  grupos: GrupoPgr[]
  lesoes: (r: Nr1RiscoInventario) => Nr1Cid[]
  vazio: boolean
  recorte: string
}) {
  if (vazio) {
    return (
      <p className="rounded-lg bg-surface-2 px-5 py-10 text-center text-[13px] text-ink-secondary">
        {recorte === NR1_RECORTE_OUTROS
          ? 'As áreas reunidas em "Outros departamentos" não geram fatores por área — elas entram nos fatores apontados na empresa.'
          : 'Nenhum fator de risco requer plano de ação neste recorte.'}
      </p>
    )
  }
  return (
    <div className="overflow-x-auto print:overflow-visible">
      <table className="w-full min-w-[760px] border-collapse print:min-w-0">
        <colgroup>
          <col className="w-[15%]" />
          <col className="w-[22%]" />
          <col className="w-[11%]" />
          <col className="w-[11%]" />
          <col className="w-[11%]" />
          <col className="w-[30%]" />
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
                <td className={`${celula} font-semibold ${NIVEL_MATRIZ[r.nivel].cls}`}>
                  {NIVEL_MATRIZ[r.nivel].label} <span className="font-mono font-normal opacity-80">({r.nivelNum})</span>
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
  )
}

function Info({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="w-40 shrink-0 text-ink-muted">{rotulo}</dt>
      <dd className="min-w-0 text-ink">{children}</dd>
    </div>
  )
}
