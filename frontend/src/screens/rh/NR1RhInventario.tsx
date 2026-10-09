import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Nr1PaginaCiclo } from '../../components/Nr1PaginaCiclo'
import { FatoresBloco } from '../../components/Nr1BlocosCiclo'
import { Nr1RiscoDetalheModal } from '../../components/Nr1AnaliseRisco'
import { nr1ResultadoService } from '../../services/nr1'
import type { Nr1RiscoInventario } from '../../types'

/* NR1-RH-03 — Inventário de riscos: o mesmo bloco "Fatores de risco
   identificados" da aba Resultado do ciclo (matriz P × S e fatores por
   departamento, com plano, editar e ignorar), com escolha de ciclo.
   `?detalhe=<risco>` abre direto o detalhe de um risco. */
export function NR1RhInventario() {
  const [params] = useSearchParams()
  const [detalhe, setDetalhe] = useState<Nr1RiscoInventario | null>(null)
  const [versao, setVersao] = useState(0)

  useEffect(() => {
    const id = params.get('detalhe')
    if (!id) return
    void nr1ResultadoService.riscosTodos().then((l) => { const r = l.find((x) => x.id === id); if (r) setDetalhe(r) })
  }, [params])

  return (
    <>
      <Nr1PaginaCiclo
        titulo="Inventário de riscos"
        subtitulo="Os fatores de risco psicossocial identificados no último ciclo encerrado, por departamento."
        semBarra
      >
        {({ campanha, recorte }) => (
          <FatoresBloco
            key={`${campanha.id}-${versao}`}
            campanhaId={campanha.id}
            recorte={recorte}
            semCabecalho
            filtroMatriz
            onAbrir={(r) => setDetalhe(r)}
          />
        )}
      </Nr1PaginaCiclo>
      <Nr1RiscoDetalheModal risco={detalhe} onClose={() => setDetalhe(null)} onAlterado={() => setVersao((v) => v + 1)} />
    </>
  )
}
