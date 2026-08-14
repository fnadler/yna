import { useSearchParams } from 'react-router-dom'
import { useService } from './useService'
import { useApp } from '../contexts/AppContext'
import { nr1ColaboradorService } from '../services/nr1'

/* Fonte única da verdade para "há uma avaliação ativa e não respondida?" —
   usada tanto pelo convite na home (NR1AvaliacaoCard) quanto pela página
   Avaliação (rota /avaliacao), para as duas nunca discordarem sobre o
   mesmo estado.

   `?campanha=ativa|nenhuma` na URL força uma das duas variações para
   demonstração, sem depender do ciclo real da campanha mockada. */

export type CampanhaDemo = 'ativa' | 'nenhuma' | null

export function useCampanhaDemo(): CampanhaDemo {
  const [params] = useSearchParams()
  const v = params.get('campanha')
  return v === 'ativa' || v === 'nenhuma' ? v : null
}

interface AvaliacaoAtivaResult {
  status: 'loading' | 'error' | 'success'
  message?: string
  reload?: () => void
  /** Há uma avaliação em campo que esta pessoa ainda não concluiu. */
  ativa: boolean
  respondidas: number
}

export function useAvaliacaoAtiva(): AvaliacaoAtivaResult {
  const { nr1 } = useApp()
  const demo = useCampanhaDemo()
  const instrumento = useService(() => nr1ColaboradorService.instrumentoDaCampanha(), [])
  const respondidas = Object.keys(nr1?.respostas ?? {}).length

  if (demo === 'ativa') return { status: 'success', ativa: true, respondidas }
  if (demo === 'nenhuma') return { status: 'success', ativa: false, respondidas: 0 }

  if (instrumento.status !== 'success') {
    return {
      status: instrumento.status === 'error' ? 'error' : 'loading',
      message: instrumento.status === 'error' ? instrumento.message : undefined,
      reload: instrumento.reload,
      ativa: false,
      respondidas,
    }
  }

  if (!instrumento.data) return { status: 'success', ativa: false, respondidas: 0 }

  const jaConcluida = nr1?.campanhaId === instrumento.data.campanha.id && nr1.concluida
  return { status: 'success', ativa: !jaConcluida, respondidas }
}
