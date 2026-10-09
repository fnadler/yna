import { useState } from 'react'
import { Nr1PaginaCiclo } from '../../components/Nr1PaginaCiclo'
import { PlanosBloco } from '../../components/Nr1BlocosCiclo'
import { Nr1AcaoDetalheModal } from '../../components/Nr1AcaoDetalhe'
import { useService } from '../../hooks/useService'
import { nr1ResultadoService } from '../../services/nr1'
import type { Nr1Acao } from '../../types'

/* NR1-RH-04 — Planos de ação: o mesmo bloco da aba Resultado do ciclo
   (ações por departamento, com prazo, responsável, status e editar), com
   o último ciclo encerrado, em lista ou Kanban. */
export function NR1RhPlanoAcao() {
  const [acaoAberta, setAcaoAberta] = useState<{ acao: Nr1Acao; editar: boolean } | null>(null)
  const [versao, setVersao] = useState(0)
  const todosRiscos = useService(() => nr1ResultadoService.riscosTodos(), [versao])
  const recarregar = () => setVersao((v) => v + 1)

  return (
    <>
      <Nr1PaginaCiclo
        titulo="Planos de ação"
        subtitulo="O que será feito, por quem e até quando, para cada fator de risco do último ciclo encerrado."
        semBarra
      >
        {({ campanha, recorte }) => (
          <PlanosBloco
            key={`${campanha.id}-${versao}`}
            campanha={campanha}
            recorte={recorte}
            semCabecalho
            filtroDepartamento
            onAbrir={(acao, editar = false) => setAcaoAberta({ acao, editar })}
          />
        )}
      </Nr1PaginaCiclo>
      <Nr1AcaoDetalheModal
        acao={acaoAberta?.acao ?? null}
        editar={acaoAberta?.editar}
        riscos={todosRiscos.status === 'success' ? todosRiscos.data : []}
        onClose={() => setAcaoAberta(null)}
        onAlterado={recarregar}
      />
    </>
  )
}
