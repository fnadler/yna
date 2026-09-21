import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { Skeleton } from '../components/Skeleton'
import { TopoSaida } from '../components/TopoSaida'
import { useApp } from '../contexts/AppContext'
import { nr1ColaboradorService } from '../services/nr1'

/* Detecção de avaliação em andamento (RF-CO-NR1-02): alcançada a partir de
   `ColTransicaoAvaliacao`, quando a pessoa clica em "Começar avaliação" e já
   existe progresso salvo de uma sessão anterior (outra aba, outro
   aparelho) para a campanha ativa — ver `avaliacaoParcial` em
   `nr1ColaboradorService`, persistido em `localStorage` porque o
   `AppContext` é só em memória e não sobrevive a uma nova sessão.

   Não decide sozinha: sempre pergunta. "Continuar de onde parei" mescla as
   respostas salvas no `AppContext` desta sessão e manda direto pra próxima
   pergunta não respondida; "Começar do zero" descarta o progresso salvo e
   reabre a avaliação em branco. */
export function ColRetomarAvaliacao() {
  const navigate = useNavigate()
  const { nr1, nr1Retomar, nr1Reiniciar } = useApp()
  const [estado, setEstado] = useState<'carregando' | 'pronto'>('carregando')
  const [respostasSalvas, setRespostasSalvas] = useState<Record<string, number | string>>({})
  const [total, setTotal] = useState(0)

  useEffect(() => {
    let vivo = true
    const campanhaId = nr1?.campanhaId

    const carregar = async () => {
      if (!campanhaId) return navigate('/avaliacao/1', { replace: true })

      const [parcial, instrumento] = await Promise.all([
        nr1ColaboradorService.avaliacaoParcial(campanhaId),
        nr1ColaboradorService.instrumentoDaCampanha(),
      ])
      if (!vivo) return

      if (!parcial || !instrumento) return navigate('/avaliacao/1', { replace: true })

      const totalPerguntas = instrumento.versao.dimensoes.flatMap((d) => d.itens).length + instrumento.versao.abertas.length
      setRespostasSalvas(parcial.respostas)
      setTotal(totalPerguntas)
      setEstado('pronto')
    }

    void carregar()
    return () => { vivo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const respondidas = Object.keys(respostasSalvas).length

  const continuar = () => {
    nr1Retomar(respostasSalvas)
    navigate(`/avaliacao/${Math.min(total, respondidas + 1)}`)
  }

  const comecarDoZero = () => {
    if (nr1) void nr1ColaboradorService.limparParcial(nr1.campanhaId)
    nr1Reiniciar()
    navigate('/avaliacao/1')
  }

  return (
    <div className="flex min-h-dvh flex-col items-center overflow-x-hidden bg-yna-gradient px-5 py-6 lg:py-10">
      <TopoSaida exitTo="/despedida" className="mb-4 max-w-xl lg:mb-6" />

      <div className="w-full max-w-xl animate-yna-slide-up rounded-2xl border border-border bg-surface p-6 shadow md:p-9">
        {estado === 'carregando' ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-14 w-14 rounded-lg" />
            <Skeleton className="h-6 w-4/5 rounded-lg" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        ) : (
          <>
            <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
              <Icon icon="ph:clock-bold" width={26} aria-hidden />
            </span>

            <h1 className="mt-5 text-[19px] font-heading font-semibold leading-snug text-ink md:text-[21px]">
              Você já começou essa avaliação.
            </h1>

            <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
              Encontramos {respondidas} de {total} perguntas já respondidas numa sessão anterior.
              Quer continuar de onde parou ou começar do zero?
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <Button size="lg" fullWidth iconRight="ph:arrow-right-bold" onClick={continuar}>
                Continuar de onde parei
              </Button>
              <Button variant="secondary" size="lg" fullWidth onClick={comecarDoZero}>
                Começar do zero
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
