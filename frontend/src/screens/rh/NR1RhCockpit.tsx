import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { OptionCard } from '../../components/OptionCard'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { Nr1CicloStatusCard } from '../../components/Nr1CicloStatusCard'
import { RiscoPorDimensaoGrid, MapaCalorTable } from '../../components/Nr1Resultado'
import { Nr1PerguntasSheet, type Nr1PerguntasEscopo } from '../../components/Nr1PerguntasSheet'
import { PAGE_MAX_W } from '../../lib/layout'
import { ACAO_STATUS, fmtData } from '../../lib/nr1'
import { useService } from '../../hooks/useService'
import { useRh } from '../../contexts/RhContext'
import { nr1CampanhaService, nr1ResultadoService, nr1AcaoService } from '../../services/nr1'
import type { Nr1Campanha } from '../../types'

/** Rótulo curto de um ciclo para o seletor — o pedaço depois do "·" no nome
   ("Avaliação de riscos psicossociais · 1º semestre 2026" → "1º semestre
   2026"). Cabe no controle sem repetir "Avaliação de riscos psicossociais"
   em cada opção. */
const cicloLabelCurto = (c: Nr1Campanha) => {
  const partes = c.nome.split('·')
  return (partes.length > 1 ? partes[partes.length - 1] : c.nome)!.trim()
}

/* NR1-RH-06 — Visão geral da conformidade NR-1 (RF-I01).

   Era o hub que concentrava as outras 8 telas atrás de si (cards + atalhos
   secundários) — o que fazia o módulo parecer improvisado e espremia
   mapeamento, planejamento e controle atrás de um único ponto de entrada.
   Depois, virou um resumo estático de 10 segundos (risco por dimensão + mapa
   de calor, sem interação), com o card de estado do ciclo só na Home
   (RH10Home.tsx), para não duplicar informação em dois lugares.

   Essa segunda versão durou até esta tela ser promovida a primeiro item da
   sidebar, sem agrupamento (ver RhAppLayout) — o item mais visível do menu.
   Por pedido explícito, ela ganhou o que fazia essa promoção valer a pena:
   saudação, o mesmo card de estado do ciclo da Home/Ciclos de avaliação, um
   bloco dos planos de ação da própria pessoa, e o risco por dimensão/mapa de
   calor agora clicáveis (mesma interação da aba "Resultado" do detalhe de um
   ciclo — abre `Nr1PerguntasSheet` com a pontuação por pergunta).

   Nota de rastro: isso deixa esta tela parecida com `RH10Home.tsx` (ambas
   têm saudação + card de ciclo + risco por dimensão) — exatamente a
   duplicação que a versão anterior evitava de propósito. Não fundi as duas
   nem toquei na Home porque não foi isso que foi pedido aqui; só registro
   para quem for revisar a IA do RH depois.

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
  const [perguntas, setPerguntas] = useState<Nr1PerguntasEscopo | null>(null)

  /* Ciclo de referência do bloco "Risco por dimensão"/"Mapa de calor" —
     independente da campanha ativa buscada acima (essa alimenta só o card
     "Ciclo em andamento" e o RhContext). Por padrão, o ciclo mais recente
     por data de início, mesmo que ainda esteja em campo — "mais recente" não
     é sinônimo de "encerrado". Trocar de ciclo aqui não afeta mais nada na
     tela (planos de ação continuam mostrando o que está aberto agora, não o
     que valia num ciclo passado). */
  const campanhas = useService(() => nr1CampanhaService.list(), [])
  const [cicloEscolhidoId, setCicloEscolhidoId] = useState<string | null>(null)
  const campanhasPorData = campanhas.status === 'success'
    ? [...campanhas.data].sort((a, b) => b.inicio.localeCompare(a.inicio))
    : []
  const campanhaId = cicloEscolhidoId ?? campanhasPorData[0]?.id

  const dimensoes = useService(() => nr1ResultadoService.mediaPorDimensao(campanhaId), [campanhaId])
  const mapa = useService(() => nr1ResultadoService.mapaCalor(campanhaId), [campanhaId])

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
                  <OptionCard
                    key={a.id}
                    to={`/rh/nr1/plano-acao?risco=${a.riscoId}`}
                    variant={a.status === 'atrasada' ? 'danger' : 'default'}
                    icon={a.status === 'atrasada' ? 'ph:clock-countdown-bold' : 'ph:list-checks-bold'}
                    label={a.oQue}
                    desc={`Prazo ${fmtData(a.quando)} · ${ACAO_STATUS[a.status].label}`}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Risco por dimensão + mapa de calor — um único bloco, para deixar
             claro que o seletor de ciclo abaixo governa os dois juntos (antes
             eram duas seções soltas, sem nada amarrando visualmente qual
             ciclo cada uma refletia). Clicável, mesma interação da aba
             "Resultado" do detalhe de um ciclo. */}
          <section className="rounded-lg border border-border bg-surface p-4 lg:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-semibold text-ink">Risco por dimensão e mapa de calor</h2>
                <p className="mt-0.5 text-[12px] text-ink-secondary">Dados do ciclo selecionado abaixo.</p>
              </div>
            </div>

            {campanhas.status === 'loading' && <Skeleton className="mb-5 h-11 w-full max-w-md rounded-lg" />}
            {campanhas.status === 'error' && <ErrorState message={campanhas.message} onRetry={campanhas.reload} />}
            {campanhas.status === 'success' && campanhasPorData.length > 0 && (
              <div className="mb-5 flex gap-1 overflow-x-auto rounded-lg bg-surface-2 p-1" role="tablist" aria-label="Ciclo de referência">
                {campanhasPorData.map((cmp) => (
                  <button
                    key={cmp.id}
                    role="tab"
                    aria-selected={cmp.id === campanhaId}
                    onClick={() => setCicloEscolhidoId(cmp.id)}
                    className={`shrink-0 whitespace-nowrap rounded-lg px-3.5 py-2.5 font-heading text-sm font-semibold transition-all ${
                      cmp.id === campanhaId ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
                    }`}
                  >
                    {cicloLabelCurto(cmp)}
                    {cmp.status === 'em-campo' && <span className="ml-1.5 text-[11px] font-normal text-primary dark:text-primary-300">· em campo</span>}
                  </button>
                ))}
              </div>
            )}

            <h3 className="mb-3 text-[13px] font-semibold text-ink-secondary">Risco por dimensão</h3>
            {(dimensoes.status === 'idle' || dimensoes.status === 'loading') && (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}</div>
            )}
            {dimensoes.status === 'error' && <ErrorState message={dimensoes.message} onRetry={dimensoes.reload} />}
            {dimensoes.status === 'success' && (
              <RiscoPorDimensaoGrid
                dimensoes={dimensoes.data}
                onClickDimensao={campanhaId ? (dimensaoId) => {
                  const d = dimensoes.data.find((x) => x.dimensaoId === dimensaoId)!
                  setPerguntas({ campanhaId, dimensaoId, media: d.media })
                } : undefined}
              />
            )}
            <p className="mt-2 text-[11px] text-ink-muted">
              Média de 1 a 5, onde 5 é a situação desejável. Áreas com menos de 4 respondentes não
              entram no cálculo.{campanhaId && ' Clique num card para ver a pontuação por pergunta.'}
            </p>

            <div className="my-6 border-t border-border" />

            <h3 className="mb-3 text-[13px] font-semibold text-ink-secondary">Mapa de calor por área</h3>
            {(mapa.status === 'idle' || mapa.status === 'loading') && <Skeleton className="h-80 w-full rounded-lg" />}
            {mapa.status === 'error' && <ErrorState message={mapa.message} onRetry={mapa.reload} />}
            {mapa.status === 'success' && (
              <MapaCalorTable
                linhas={mapa.data}
                onClickCelula={campanhaId ? (dimensaoId, departamentoId, departamento) => {
                  const linha = mapa.data.find((l) => l.departamentoId === departamentoId)!
                  const media = linha.celulas.find((c) => c.dimensaoId === dimensaoId)!.media ?? 0
                  setPerguntas({ campanhaId, dimensaoId, departamentoId, departamento, media })
                } : undefined}
              />
            )}
            {campanhaId && <p className="mt-2 text-[11px] text-ink-muted">Clique numa célula para ver a pontuação por pergunta daquela área.</p>}
          </section>
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

      <Nr1PerguntasSheet escopo={perguntas} onClose={() => setPerguntas(null)} />
    </div>
  )
}
