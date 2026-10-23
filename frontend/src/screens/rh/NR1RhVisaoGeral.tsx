import { useState } from 'react'
import { PrimeiroCicloConvite, PrimeiroCicloEmAndamento, useNr1Cenario } from '../../components/Nr1PrimeiroCiclo'
import { NovoCicloSheet } from './NR1RhCiclos'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { CabecalhoBloco, FiltroDepartamento, ResultadoCicloSecao, useOpcoesRecorte } from '../../components/Nr1Blocos'
import { Nr1EvolucaoChart } from '../../components/Nr1EvolucaoChart'
import { cicloLabelCurto } from '../../components/Nr1PainelRiscoMapa'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { AtalhosNr1 } from '../../components/Nr1Atalhos'
import { nr1ResultadoService } from '../../services/nr1'
import { NR1_DIMENSOES } from '../../data/nr1Mock'

/* NR1-RH — Visão geral da Conformidade NR-1. Três cenários, lidos dos dados
   por `useNr1Cenario` (ver `Nr1PrimeiroCiclo.tsx`): sem ciclo, primeiro
   ciclo em campo e, com ciclo encerrado, o retrato do último ciclo
   encerrado, a evolução ao longo dos ciclos (com filtro de departamento no
   topo) e os atalhos para as demais telas do módulo. */

/** Uma cor por domínio, na ordem de `NR1_DIMENSOES`. */
const CORES_DOMINIO = ['#4749A8', '#E8A640', '#D75A6E', '#4EA88B', '#7E3FA6', '#2F8FC9', '#C2649A', '#8A7A3B']

export function NR1RhVisaoGeral() {
  const { cenario, campanhas, emCampo, abrirNovoCiclo, novoCiclo } = useNr1Cenario()
  const encerrados = useService(() => nr1ResultadoService.ciclosEncerrados(), [])
  const carregando = !cenario || encerrados.status !== 'success'

  const vigenteId = encerrados.status === 'success' && cenario === 'resultado' ? encerrados.data.vigente : undefined
  const campanha = campanhas.status === 'success' ? campanhas.data.find((c) => c.id === vigenteId) : undefined

  /* O resultado do ciclo tem o seu próprio filtro de departamento
     (`ResultadoCicloSecao`); este é o da evolução. */
  const [recorteEvolucao, setRecorteEvolucao] = useState('empresa')
  const opcoesRecorte = useOpcoesRecorte(vigenteId)

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />
        <PageHeader
          className="mt-2 lg:mt-0"
          title="Visão geral"
          subtitle={campanha ? `Resultado do último ciclo encerrado (${cicloLabelCurto(campanha)}) e a evolução ao longo dos ciclos.` : 'O resultado dos ciclos de avaliação da empresa.'}
        />

        {carregando && <Skeleton className="h-96 w-full rounded-lg" />}
        {!carregando && cenario === 'vazio' && <PrimeiroCicloConvite onIniciar={abrirNovoCiclo} />}
        {!carregando && cenario === 'primeiro-ciclo' && emCampo && <PrimeiroCicloEmAndamento campanha={emCampo} />}

        {campanha && (
          <>
            <div className="flex flex-col gap-14">
              <section>
                <AtalhosNr1 campanhaId={campanha.id} />
              </section>
              <section id="visao-geral">
                <ResultadoCicloSecao campanha={campanha} />
              </section>
              <section id="evolucao">
                <EvolucaoBloco recorte={recorteEvolucao} onRecorte={setRecorteEvolucao} opcoes={opcoesRecorte} />
              </section>
            </div>
          </>
        )}
      </div>

      <NovoCicloSheet {...novoCiclo} />
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
