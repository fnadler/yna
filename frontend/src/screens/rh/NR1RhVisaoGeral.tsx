import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Select } from '../../components/Select'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { CabecalhoBloco, VisaoGeralBloco, useOpcoesRecorte } from '../../components/Nr1Blocos'
import { Nr1EvolucaoChart } from '../../components/Nr1EvolucaoChart'
import { Nr1AnaliseRiscoModal, type Nr1AnaliseEscopo } from '../../components/Nr1AnaliseRisco'
import { cicloLabelCurto } from '../../components/Nr1PainelRiscoMapa'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { nr1CampanhaService, nr1ResultadoService, nr1AcaoService } from '../../services/nr1'
import { nr1DiasEntre } from '../../lib/nr1'
import { NR1_DIMENSOES, NR1_RECORTE_OUTROS, NR1_TODAY } from '../../data/nr1Mock'
import type { Nr1DimensaoId } from '../../types'

/* NR1-RH — Visão geral da Conformidade NR-1: o retrato do último ciclo
   encerrado, a evolução ao longo dos ciclos (com filtro de departamento no
   topo) e os atalhos para as demais telas do módulo. */

/** Uma cor por domínio, na ordem de `NR1_DIMENSOES`. */
const CORES_DOMINIO = ['#4749A8', '#E8A640', '#D75A6E', '#4EA88B', '#7E3FA6', '#2F8FC9', '#C2649A', '#8A7A3B']

export function NR1RhVisaoGeral() {
  const encerrados = useService(() => nr1ResultadoService.ciclosEncerrados(), [])
  const campanhas = useService(() => nr1CampanhaService.list(), [])
  const vigenteId = encerrados.status === 'success' ? encerrados.data.vigente : undefined
  const campanha = campanhas.status === 'success' ? campanhas.data.find((c) => c.id === vigenteId) : undefined
  /* Cada bloco tem o seu filtro de departamento. */
  const [recorteResultado, setRecorteResultado] = useState('empresa')
  const [recorteEvolucao, setRecorteEvolucao] = useState('empresa')
  const opcoesRecorte = useOpcoesRecorte(vigenteId)
  const mapa = useService(() => (vigenteId ? nr1ResultadoService.mapaCalor(vigenteId) : Promise.resolve([])), [vigenteId])
  const [analise, setAnalise] = useState<Nr1AnaliseEscopo | null>(null)

  const abrirAnalise = (dimensaoId: Nr1DimensaoId, departamentoId?: string) => {
    if (!campanha || mapa.status !== 'success' || departamentoId === NR1_RECORTE_OUTROS) return
    setAnalise({ campanhaId: campanha.id, cicloLabel: cicloLabelCurto(campanha), dimensaoId, departamentoId, linhas: mapa.data })
  }

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />
        <PageHeader
          className="mt-2 lg:mt-0"
          title="Visão geral"
          subtitle={campanha ? `Resultado do último ciclo encerrado (${cicloLabelCurto(campanha)}) e a evolução ao longo dos ciclos.` : 'O resultado dos ciclos de avaliação da empresa.'}
        />

        {(encerrados.status !== 'success' || campanhas.status !== 'success') && <Skeleton className="h-96 w-full rounded-lg" />}
        {encerrados.status === 'success' && !vigenteId && (
          <p className="rounded-lg border border-border bg-surface px-5 py-14 text-center text-[13px] text-ink-secondary">
            Nenhum ciclo encerrado ainda. A visão geral aparece quando o primeiro ciclo de avaliação for encerrado.
          </p>
        )}

        {campanha && (
          <>
            <div className="flex flex-col gap-14">
              <section>
                <AtalhosNr1 campanhaId={campanha.id} />
              </section>
              <section id="visao-geral">
                <CabecalhoBloco
                  simples
                  titulo={`Resultado do ciclo ${cicloLabelCurto(campanha)}`}
                  icon="ph:chart-polar-bold"
                  subtitulo="Nota de cada domínio, de 1 a 5 (5 é a situação desejável), comparada ao ciclo anterior."
                  acao={<FiltroDepartamento value={recorteResultado} onChange={setRecorteResultado} opcoes={opcoesRecorte} rotulo="Filtrar o resultado do ciclo por departamento" />}
                />
                <VisaoGeralBloco semCabecalho campanha={campanha} recorte={recorteResultado} onAbrirDominio={abrirAnalise} />
              </section>
              <section id="evolucao">
                <EvolucaoBloco recorte={recorteEvolucao} onRecorte={setRecorteEvolucao} opcoes={opcoesRecorte} />
              </section>
            </div>
          </>
        )}
      </div>

      <Nr1AnaliseRiscoModal escopo={analise} onClose={() => setAnalise(null)} />
    </div>
  )
}

function FiltroDepartamento({ value, onChange, opcoes, rotulo }: {
  value: string
  onChange: (v: string) => void
  opcoes: { value: string; label: string }[]
  rotulo: string
}) {
  return (
    <div className="flex w-full items-center gap-2 sm:w-60">
      <Icon icon="ph:funnel-simple-bold" width={15} className="shrink-0 text-ink-muted" aria-hidden />
      <Select size="sm" className="flex-1" value={value} onChange={onChange} ariaLabel={rotulo} options={opcoes} />
    </div>
  )
}

function EvolucaoBloco({ recorte, onRecorte, opcoes }: {
  recorte: string
  onRecorte: (v: string) => void
  opcoes: { value: string; label: string }[]
}) {
  const evolucao = useService(() => nr1ResultadoService.evolucao(recorte === 'empresa' ? null : recorte), [recorte])
  const dados = evolucao.status === 'success' ? evolucao.data : []
  const series = NR1_DIMENSOES.map((d, i) => ({
    id: d.id,
    nome: d.nome,
    cor: CORES_DOMINIO[i % CORES_DOMINIO.length]!,
    valores: dados.map((c) => c.medias[i] ?? null),
  }))

  return (
    <>
      <CabecalhoBloco
        simples
        titulo="Evolução por ciclos"
        icon="ph:chart-line-bold"
        subtitulo={`Nota de cada domínio nos ${dados.length || ''} ciclos encerrados, de 1 a 5 (5 é a situação desejável). Passe o mouse num ciclo para ver as notas.`}
        acao={<FiltroDepartamento value={recorte} onChange={onRecorte} opcoes={opcoes} rotulo="Filtrar a evolução por departamento" />}
      />
      {(evolucao.status === 'idle' || evolucao.status === 'loading') && <Skeleton className="h-80 w-full rounded-lg" />}
      {evolucao.status === 'error' && <ErrorState message={evolucao.message} onRetry={evolucao.reload} />}
      {evolucao.status === 'success' && (
        <div className="rounded-lg border border-border bg-surface p-4 lg:p-5">
          <Nr1EvolucaoChart ciclos={dados.map((c) => c.ciclo)} series={series} />
        </div>
      )}
    </>
  )
}

/* Atalhos para as demais telas do módulo, cada um com um número que diz o
   que há para fazer lá. */
function AtalhosNr1({ campanhaId }: { campanhaId: string }) {
  const encerrados = useService(() => nr1ResultadoService.ciclosEncerrados(), [])
  const riscos = useService(() => nr1ResultadoService.inventario(campanhaId), [campanhaId])
  const acoes = useService(() => nr1AcaoService.list(), [])
  const campanhas = useService(() => nr1CampanhaService.list(), [])

  const lista = riscos.status === 'success' ? riscos.data : []
  const todas = acoes.status === 'success' ? acoes.data : []
  const vigentes = todas.filter((a) => !todas.some((b) => b.versaoAnteriorId === a.id) && lista.some((r) => r.id === a.riscoId))
  const semPlano = lista.filter((r) => !todas.some((a) => a.riscoId === r.id)).length
  const vencidas = vigentes.filter((a) => a.status !== 'concluida' && nr1DiasEntre(NR1_TODAY, a.quando) < 0).length
  const emCampo = campanhas.status === 'success' ? campanhas.data.find((c) => c.status === 'em-campo') : undefined
  const nCiclos = encerrados.status === 'success' ? encerrados.data.ids.length : 0

  const cards = [
    { to: '/rh/nr1/ciclos', icon: 'ph:calendar-check-bold', titulo: 'Ciclos de avaliação', texto: 'Aplique o questionário e acompanhe a participação de cada área.', info: emCampo ? 'Um ciclo em andamento' : `${nCiclos} ${nCiclos === 1 ? 'ciclo encerrado' : 'ciclos encerrados'}`, alerta: false },
    { to: '/rh/nr1/inventario', icon: 'ph:clipboard-text-bold', titulo: 'Inventário de riscos', texto: 'Os fatores de risco identificados por departamento.', info: semPlano > 0 ? `${semPlano} ${semPlano === 1 ? 'fator sem plano' : 'fatores sem plano'}` : `${lista.length} ${lista.length === 1 ? 'fator' : 'fatores'}, todos com plano`, alerta: semPlano > 0 },
    { to: '/rh/nr1/plano-acao', icon: 'ph:list-checks-bold', titulo: 'Planos de ação', texto: 'O que será feito, por quem e até quando.', info: vencidas > 0 ? `${vencidas} ${vencidas === 1 ? 'ação vencida' : 'ações vencidas'}` : `${vigentes.length} ${vigentes.length === 1 ? 'ação' : 'ações'} em dia`, alerta: vencidas > 0 },
    { to: '/rh/nr1/resumo-pgr', icon: 'ph:file-text-bold', titulo: 'Resumo para o PGR', texto: 'O inventário pronto para exportar ou imprimir.', info: `${lista.length} ${lista.length === 1 ? 'fator' : 'fatores'} no resumo`, alerta: false },
  ]

  return (
    <>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <li key={c.to}>
            <Link to={c.to} className="group flex h-full flex-col rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary/40 hover:bg-surface-hover">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
                <Icon icon={c.icon} width={20} aria-hidden />
              </span>
              <span className="mt-3 flex items-center justify-between gap-2">
                <span className="font-heading text-[15px] font-semibold text-ink">{c.titulo}</span>
                <Icon icon="ph:arrow-right-bold" width={14} className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
              </span>
              <span className="mt-1 flex-1 text-[12.5px] leading-relaxed text-ink-secondary">{c.texto}</span>
              <span className={`mt-3 inline-flex w-fit items-center gap-1.5 rounded-pill px-2.5 py-1 text-[11.5px] font-semibold ${c.alerta ? 'bg-warning/25 text-warning-ink' : 'bg-surface-2 text-ink-secondary'}`}>
                {c.alerta && <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden />}
                {c.info}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

