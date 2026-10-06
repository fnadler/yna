import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { Nr1CicloStatusCard } from '../../components/Nr1CicloStatusCard'
import { AcaoLinha } from '../../components/Nr1AcaoLinha'
import { Nr1AcaoDetalheModal } from '../../components/Nr1AcaoDetalhe'
import { Nr1PainelRiscoMapa } from '../../components/Nr1PainelRiscoMapa'
import { Toast } from '../../components/Toast'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { useRh } from '../../contexts/RhContext'
import { nr1CampanhaService, nr1ResultadoService, nr1AcaoService } from '../../services/nr1'
import type { Nr1Acao } from '../../types'

/* NR1-RH-06 — Visão geral da conformidade NR-1 (RF-I01).

   Era o hub que concentrava as outras 8 telas atrás de si (cards + atalhos
   secundários) — o que fazia o módulo parecer improvisado e espremia
   mapeamento, planejamento e controle atrás de um único ponto de entrada.
   Depois, virou um resumo estático de 10 segundos (risco por dimensão + mapa
   de calor, sem interação), com o card de estado do ciclo só na antiga Home
   (RH10Home.tsx), para não duplicar informação em dois lugares.

   Essa segunda versão durou até esta tela ser promovida a primeiro item da
   sidebar, sem agrupamento (ver RhAppLayout) — o item mais visível do menu.
   Por pedido explícito, ela ganhou o que fazia essa promoção valer a pena:
   saudação, o mesmo card de estado do ciclo da antiga Home/Ciclos de
   avaliação, um bloco dos planos de ação da própria pessoa, e o risco por
   dimensão/mapa de calor agora clicáveis (mesma interação da aba "Resultado"
   do detalhe de um ciclo — abre `Nr1PerguntasSheet` com a pontuação por
   pergunta).

   Essa promoção deixou esta tela e a Home dizendo a mesma coisa de duas
   formas diferentes (ambas tinham saudação + card de ciclo + risco por
   dimensão) — a duplicação que a versão anterior evitava de propósito. A
   Home (RH10Home.tsx, rota /rh/home) foi removida depois, e `/rh` passou a
   redirecionar direto pra esta tela (ver RhAppLayout/App.tsx) — o conteúdo
   que só existia lá ("Suas pendências" agregadas da empresa e os atalhos
   "A cadeia") não foi portado pra cá; se fizer falta, é um pedido à parte.

   "Risco por dimensão"/"Mapa de calor" viraram um único bloco com um
   seletor de ciclo por cima (visual de aba, mesmo padrão da Engajamento/
   Resultado/Riscos sugeridos do detalhe de um ciclo — `NR1RhCiclos.tsx`),
   em vez de duas seções soltas cada uma sempre mostrando o ciclo padrão do
   serviço. Por padrão, o ciclo mais recente por data de início (mesmo em
   campo); trocar de aba troca os dois juntos, porque ambos leem o mesmo
   `campanhaId` escolhido — daí estarem dentro do mesmo card, não é só
   estética: é o que deixa claro que o seletor vale para o bloco inteiro. */

export function NR1RhCockpit() {
  const { usuario, setInstrumentoNr1 } = useRh()
  const navigate = useNavigate()

  const campanha = useService(() => nr1CampanhaService.ativa(), [])
  const acoes = useService(() => nr1AcaoService.list(), [])
  const inventario = useService(() => nr1ResultadoService.inventario(), [])
  const [detalhe, setDetalhe] = useState<Nr1Acao | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const firstName = usuario.nome.split(' ')[0]

  /* Publica o instrumento aplicado no contexto: inventário e relatório citam
     modelo + versão a partir daqui (RF-F02). */
  const c = campanha.status === 'success' ? campanha.data : undefined
  useEffect(() => {
    if (c) setInstrumentoNr1({ campanhaId: c.id, protocolo: c.protocolo, modeloId: c.modeloId, modeloNome: c.modeloNome, versao: c.versao })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c?.id])

  /* Planos de ação sob a responsabilidade da pessoa logada. Não há um id de
     usuário estruturado em `Nr1Acao.quem` (é texto livre, "Nome · área", o
     mesmo que aparece no card da ação em Plano de ação) — o casamento é por
     nome. Segue o mesmo critério de "vigente" de lá: uma versão já superada
     por outra (`versaoAnteriorId` de outra ação) não conta como pendência
     separada, e ações concluídas não aparecem aqui — isto é sobre o que
     ainda falta fazer, não um histórico. */
  const minhasAcoes = (() => {
    if (acoes.status !== 'success') return []
    const superadas = new Set(acoes.data.map((a) => a.versaoAnteriorId).filter((id): id is string => Boolean(id)))
    return acoes.data
      .filter((a) => !superadas.has(a.id) && a.status !== 'concluida' && a.quem.includes(usuario.nome))
      .sort((a, b) => a.quando.localeCompare(b.quando))
  })()

  /* Resolve o risco de origem de cada ação — só pra alimentar `AcaoLinha`
     (nível/dimensão/risco na linha), o mesmo componente que a tela Plano de
     ação usa na visualização "Lista" (`Nr1AcaoLinha.tsx`, extraído de lá).
     Antes "Seus planos de ação" usava um `OptionCard` genérico, sem nível,
     prazo ou risco de origem visíveis — só título e um resumo em texto. */
  const riscoDaAcao = (riscoId: string) =>
    inventario.status === 'success' ? inventario.data.find((r) => r.id === riscoId) : undefined

  const riscos = inventario.status === 'success' ? inventario.data : []

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />

        <div className="pt-2 pb-6 lg:pt-9 lg:pb-6">
          <h1 className="text-[26px] lg:text-[32px] font-medium tracking-[-0.02em] text-ink">Oi, {firstName}.</h1>
          <p className="mt-0.5 text-[15px] text-ink-secondary">O estado do seu ciclo de conformidade NR-1, num relance.</p>
        </div>

        <div className="flex flex-col gap-6">

          {/* Ciclo em andamento — mesmo card da Home e de Ciclos de avaliação,
             para as três telas nunca discordarem sobre o mesmo ciclo. */}
          <section>
            {campanha.status === 'loading' && <Skeleton className="h-32 w-full rounded-lg" />}
            {campanha.status === 'error' && <ErrorState message={campanha.message} onRetry={campanha.reload} />}
            {campanha.status === 'success' && campanha.data && (
              <Nr1CicloStatusCard
                campanha={campanha.data}
                onClick={() => navigate(`/rh/nr1/ciclos/${campanha.data!.id}`)}
              />
            )}
          </section>

          {/* Seus planos de ação */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-ink">Seus planos de ação</h2>
              <button onClick={() => navigate('/rh/nr1/plano-acao')} className="font-heading text-sm font-medium text-primary transition-colors hover:text-primary-600 dark:text-primary-300">
                Ver todos
              </button>
            </div>
            {acoes.status === 'loading' && <Skeleton className="h-20 w-full rounded-lg" />}
            {acoes.status === 'error' && <ErrorState message={acoes.message} onRetry={acoes.reload} />}
            {acoes.status === 'success' && minhasAcoes.length === 0 && (
              <div className="rounded-lg border border-border bg-surface px-5 py-8 text-center">
                <p className="text-[13.5px] text-ink-secondary">Nenhuma ação sob sua responsabilidade em aberto agora.</p>
              </div>
            )}
            {acoes.status === 'success' && minhasAcoes.length > 0 && (
              <div className="flex flex-col gap-2">
                {minhasAcoes.map((a) => (
                  <AcaoLinha
                    key={a.id}
                    acao={a}
                    risco={riscoDaAcao(a.riscoId)}
                    onClick={() => setDetalhe(a)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Risco por domínio + mapa de calor — bloco compartilhado com o
             Inventário de riscos (ver `Nr1PainelRiscoMapa`). */}
          <Nr1PainelRiscoMapa titulo="Risco por domínio e mapa de calor" subtitulo="Dados do ciclo selecionado abaixo." />
        </div>

        <div className="mt-6 flex gap-3 rounded-lg border border-border bg-surface-2 p-4">
          <Icon icon="ph:info-bold" width={20} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
          <p className="text-[12px] leading-relaxed text-ink-secondary">
            A YNA fornece o insumo qualificado: o inventário e o relatório de gestão. A
            responsabilidade técnica pelo PGR permanece com o SESMT ou a consultoria de SST da
            sua empresa.
          </p>
        </div>
      </div>

      {/* Detalhe da ação em tela cheia — o mesmo do Plano de ação. */}
      <Nr1AcaoDetalheModal
        acao={detalhe}
        riscos={riscos}
        onClose={() => setDetalhe(null)}
        onAlterado={() => acoes.reload()}
      />

      <Toast message={feedback} onClose={() => setFeedback(null)} />

    </div>
  )
}
