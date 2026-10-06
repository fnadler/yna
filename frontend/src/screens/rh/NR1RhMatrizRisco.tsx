import { useCallback, useState } from 'react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Nr1PainelRiscoMapa } from '../../components/Nr1PainelRiscoMapa'
import { Nr1AnaliseRiscoModal, type Nr1AnaliseEscopo } from '../../components/Nr1AnaliseRisco'
import { Nr1PerguntasCriticas, type Nr1PerguntaClicada } from '../../components/Nr1PerguntasCriticas'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { nr1CampanhaService, nr1ResultadoService } from '../../services/nr1'

/* NR1-RH — Matriz de risco: o mapa de calor dos ciclos finalizados (mesmo
   bloco que antes ficava no Inventário, com a análise de risco ao clicar) e,
   abaixo, as perguntas do questionário da mais crítica para a menos
   crítica, filtráveis por domínio e departamento. As perguntas seguem o
   ciclo escolhido no mapa (`Nr1PerguntasCriticas`, compartilhado com a aba
   "Resultado" do detalhe do ciclo). */
export function NR1RhMatrizRisco() {
  const [campanhaId, setCampanhaId] = useState<string | undefined>()
  const onCicloChange = useCallback((id: string | undefined) => setCampanhaId(id), [])
  const [analise, setAnalise] = useState<Nr1AnaliseEscopo | null>(null)

  const campanhas = useService(() => nr1CampanhaService.list(), [])
  const mapa = useService(() => (campanhaId ? nr1ResultadoService.mapaCalor(campanhaId) : Promise.resolve([])), [campanhaId])
  const linhas = mapa.status === 'success' ? mapa.data : []

  const ciclo = campanhas.status === 'success' ? campanhas.data.find((c) => c.id === campanhaId) : undefined
  const cicloLabel = ciclo ? (ciclo.nome.split('·').pop() ?? ciclo.nome).trim() : ''

  const abrirAnalise = ({ dimensaoId, itemId, departamentoId }: Nr1PerguntaClicada) => {
    if (!campanhaId || linhas.length === 0) return
    setAnalise({ campanhaId, cicloLabel, dimensaoId, departamentoId, itemId, linhas })
  }

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />

        <PageHeader
          className="mt-2 lg:mt-0"
          title="Matriz de risco"
          subtitle="O resultado dos ciclos finalizados por domínio e área, e as perguntas que mais pesam nele."
        />

        <div className="flex flex-col gap-6">
          <Nr1PainelRiscoMapa
            titulo="Risco por domínio e mapa de calor"
            subtitulo="Clique num domínio ou numa área para analisar o resultado e registrar riscos e planos de ação."
            somenteEncerrados
            analise
            onCicloChange={onCicloChange}
          />

          <Nr1PerguntasCriticas
            campanhaId={campanhaId}
            cicloLabel={cicloLabel}
            linhas={linhas}
            onClickPergunta={abrirAnalise}
            dicaClique={(dep) => `Clique numa pergunta para analisar o domínio${dep ? ` em ${dep}` : ''} e registrar riscos.`}
          />
        </div>
      </div>

      <Nr1AnaliseRiscoModal escopo={analise} onClose={() => setAnalise(null)} />
    </div>
  )
}
