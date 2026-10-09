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
import { nr1DiasEntre, nr1UrgenciaPrazo } from '../../lib/nr1'
import { NR1_TODAY } from '../../data/nr1Mock'
import { useService } from '../../hooks/useService'
import { useRh } from '../../contexts/RhContext'
import { nr1CampanhaService, nr1ResultadoService, nr1AcaoService } from '../../services/nr1'
import type { Nr1Acao } from '../../types'

/* NR1-RH-06 — Visão geral da conformidade NR-1 (RF-I01).

   O primeiro item do menu: o estado do ciclo em campo, as pendências da
   empresa no fluxo (fatores sem plano, ações atrasadas
   ou vencendo — cada uma com o atalho para onde se resolve), os planos de
   ação da própria pessoa e o risco por domínio/mapa de calor dos ciclos
   encerrados, que abre a análise do domínio com os fatores apontados. */

export function NR1RhCockpit() {
  const { usuario, setInstrumentoNr1 } = useRh()
  const navigate = useNavigate()

  const campanha = useService(() => nr1CampanhaService.ativa(), [])
  const acoes = useService(() => nr1AcaoService.list(), [])
  /* Riscos de todos os ciclos — a ação pode responder a um risco de um ciclo anterior. */
  const inventario = useService(() => nr1ResultadoService.riscosTodos(), [])
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

  /* Pendências da empresa no fluxo NR-1 — o que o RH precisa fazer agora,
     cada uma com o atalho para a tela onde se resolve. Todas leem o último
     ciclo encerrado (o que alimenta o inventário). */
  const pendencias = useService(async () => {
    const { vigente } = await nr1ResultadoService.ciclosEncerrados()
    const [atuais, todas] = await Promise.all([
      vigente ? nr1ResultadoService.inventario(vigente) : Promise.resolve([]),
      nr1AcaoService.list(),
    ])
    const superadas = new Set(todas.map((a) => a.versaoAnteriorId).filter(Boolean))
    const vigentes = todas.filter((a) => !superadas.has(a.id) && a.status !== 'concluida')
    return {
      semPlano: atuais.filter((r) => !todas.some((a) => a.riscoId === r.id)).length,
      atrasadas: vigentes.filter((a) => a.status === 'atrasada' || nr1UrgenciaPrazo(nr1DiasEntre(NR1_TODAY, a.quando)) === 'vencida').length,
      vencendo: vigentes.filter((a) => a.status !== 'atrasada' && nr1UrgenciaPrazo(nr1DiasEntre(NR1_TODAY, a.quando)) === 'vencendo').length,
    }
  }, [])

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

          {/* Suas pendências */}
          <section>
            <h2 className="mb-3 text-[15px] font-semibold text-ink">Pendências da empresa</h2>
            {(pendencias.status === 'idle' || pendencias.status === 'loading') && <Skeleton className="h-20 w-full rounded-lg" />}
            {pendencias.status === 'error' && <ErrorState message={pendencias.message} onRetry={pendencias.reload} />}
            {pendencias.status === 'success' && (() => {
              const p = pendencias.data
              const itens = [
                { n: p.semPlano, icon: 'ph:warning-diamond-bold', cls: 'bg-warning/25 text-warning-ink', texto: p.semPlano === 1 ? 'fator de risco apontado ainda sem plano de ação' : 'fatores de risco apontados ainda sem plano de ação', to: '/rh/nr1/inventario', acao: 'Criar planos' },
                { n: p.atrasadas, icon: 'ph:alarm-bold', cls: 'bg-danger/15 text-danger-ink', texto: p.atrasadas === 1 ? 'ação atrasada ou com prazo vencido' : 'ações atrasadas ou com prazo vencido', to: '/rh/nr1/plano-acao', acao: 'Ver ações' },
                { n: p.vencendo, icon: 'ph:hourglass-medium-bold', cls: 'bg-surface-2 text-ink-secondary', texto: p.vencendo === 1 ? 'ação vence nos próximos 7 dias' : 'ações vencem nos próximos 7 dias', to: '/rh/nr1/plano-acao', acao: 'Ver ações' },
              ].filter((i) => i.n > 0)
              if (itens.length === 0) {
                return (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-5 py-4">
                    <Icon icon="ph:check-circle-bold" width={20} className="shrink-0 text-success" aria-hidden />
                    <p className="text-[13.5px] text-ink-secondary">Tudo em dia: nenhum fator sem plano, nenhuma reavaliação pendente e nenhuma ação atrasada.</p>
                  </div>
                )
              }
              return (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {itens.map((i) => (
                    <li key={i.texto}>
                      <button
                        type="button"
                        onClick={() => navigate(i.to)}
                        className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface p-3.5 text-left transition-colors hover:border-border-strong hover:bg-surface-hover"
                      >
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${i.cls}`}>
                          <Icon icon={i.icon} width={18} aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-mono text-[18px] font-bold leading-none text-ink">{i.n}</span>
                          <span className="mt-1 block text-[12.5px] leading-snug text-ink-secondary">{i.texto}</span>
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-primary dark:text-primary-300">
                          {i.acao}
                          <Icon icon="ph:arrow-right-bold" width={11} aria-hidden />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )
            })()}
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

          {/* Risco por domínio + mapa de calor dos ciclos encerrados — clicar
             abre a análise do domínio com os fatores de risco apontados. */}
          <Nr1PainelRiscoMapa
            titulo="Risco por domínio e mapa de calor"
            subtitulo="Resultado dos ciclos encerrados. O ciclo em campo aparece aqui quando for encerrado."
            somenteEncerrados
            onRiscosAlterados={() => { acoes.reload(); pendencias.reload() }}
          />
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
        onAlterado={() => { acoes.reload(); pendencias.reload() }}
      />

      <Toast message={feedback} onClose={() => setFeedback(null)} />

    </div>
  )
}
