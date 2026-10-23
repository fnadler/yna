import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PrazoBadge } from '../../components/PrazoBadge'
import { PrimeiroCicloConvite, PrimeiroCicloEmAndamento, useNr1Cenario } from '../../components/Nr1PrimeiroCiclo'
import { Nr1AcaoDetalheModal } from '../../components/Nr1AcaoDetalhe'
import { ResultadoCicloSecao } from '../../components/Nr1Blocos'
import { AtalhosNr1 } from '../../components/Nr1Atalhos'
import { Toast } from '../../components/Toast'
import { NovoCicloSheet } from './NR1RhCiclos'
import { PAGE_MAX_W } from '../../lib/layout'
import { nr1DiasEntre, nr1UrgenciaPrazo } from '../../lib/nr1'
import { NR1_TODAY } from '../../data/nr1Mock'
import { useService } from '../../hooks/useService'
import { useRh } from '../../contexts/RhContext'
import { nr1ResultadoService, nr1AcaoService } from '../../services/nr1'
import { rhColaboradorService, rhDepartamentoService, rhEquipeService } from '../../services/rh'
import type { Nr1Acao, Nr1RiscoInventario } from '../../types'

/* NR1-RH-06 — Visão geral da conformidade NR-1 (RF-I01).

   O primeiro item do menu. Os mesmos três cenários da Visão geral da
   Conformidade NR-1, lidos por `useNr1Cenario` (ver `Nr1PrimeiroCiclo.tsx`):

   - sem ciclo: o convite para iniciar o primeiro e o acesso rápido à
     configuração da empresa (colaboradores, departamentos, equipe RH);
   - primeiro ciclo em campo: a participação, o mesmo acesso rápido e um
     aviso de que os planos de ação começam no resultado;
   - com ciclo encerrado: no topo, as pendências da empresa no fluxo
     (fatores sem plano, ações atrasadas ou vencendo, cada uma com o atalho
     para onde se resolve); depois uma lista única de planos de ação (os da
     própria pessoa primeiro, em destaque, e em seguida os mais próximos do
     vencimento) e o resultado do último ciclo encerrado (radar + notas por
     domínio, com filtro de departamento) e os atalhos para as telas do
     módulo, os mesmos da Visão geral da Conformidade NR-1. */

/** Máximo de planos na lista da Visão geral — o resto fica em Planos de ação. */
const LIMITE_PLANOS = 5

export function NR1RhCockpit() {
  const { usuario, setInstrumentoNr1 } = useRh()
  const navigate = useNavigate()
  const { cenario, campanhas, emCampo, abrirNovoCiclo, novoCiclo } = useNr1Cenario()
  /* O ciclo do resultado: o último encerrado (o que alimenta o inventário). */
  const encerrados = useService(() => nr1ResultadoService.ciclosEncerrados(), [])
  const vigenteId = encerrados.status === 'success' ? encerrados.data.vigente : undefined
  const vigente = campanhas.status === 'success' ? campanhas.data.find((c) => c.id === vigenteId) : undefined

  const acoes = useService(() => nr1AcaoService.list(), [])
  /* Riscos de todos os ciclos — a ação pode responder a um risco de um ciclo anterior. */
  const inventario = useService(() => nr1ResultadoService.riscosTodos(), [])
  const [detalhe, setDetalhe] = useState<Nr1Acao | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const firstName = usuario.nome.split(' ')[0]

  /* Publica o instrumento aplicado no contexto: inventário e relatório citam
     modelo + versão a partir daqui (RF-F02). */
  useEffect(() => {
    const c = emCampo
    if (c) setInstrumentoNr1({ campanhaId: c.id, protocolo: c.protocolo, modeloId: c.modeloId, modeloNome: c.modeloNome, versao: c.versao })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emCampo?.id])

  /* Ações em aberto, da mais urgente para a menos. Segue o mesmo critério
     de "vigente" do Plano de ação: uma versão já superada por outra
     (`versaoAnteriorId` de outra ação) não conta como pendência separada, e
     ações concluídas não aparecem aqui — isto é sobre o que ainda falta
     fazer, não um histórico. */
  const abertas = (() => {
    if (acoes.status !== 'success') return []
    const superadas = new Set(acoes.data.map((a) => a.versaoAnteriorId).filter((id): id is string => Boolean(id)))
    return acoes.data
      .filter((a) => !superadas.has(a.id) && a.status !== 'concluida')
      .sort((a, b) => a.quando.localeCompare(b.quando))
  })()

  /* Não há um id de usuário estruturado em `Nr1Acao.quem` (é texto livre,
     "Nome · área", o mesmo que aparece no card da ação em Plano de ação) —
     o casamento com a pessoa logada é por nome. */
  const ehMinha = (a: Nr1Acao) => a.quem.includes(usuario.nome)
  /* Lista única: primeiro as da pessoa logada, depois as demais pelo prazo
     (as duas partes já vêm ordenadas por vencimento), até `LIMITE_PLANOS`. */
  const minhasAcoes = abertas.filter(ehMinha)
  const planos = [...minhasAcoes, ...abertas.filter((a) => !ehMinha(a))].slice(0, LIMITE_PLANOS)

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

  const subtitulo = cenario === 'vazio'
    ? 'Vamos dar o primeiro passo da conformidade NR-1 da sua empresa.'
    : cenario === 'primeiro-ciclo'
      ? 'O primeiro ciclo de avaliação está em campo. Acompanhe a participação por aqui.'
      : 'O estado do seu ciclo de conformidade NR-1, num relance.'

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />

        <div className="pt-2 pb-6 lg:pt-9 lg:pb-6">
          <h1 className="text-[26px] lg:text-[32px] font-medium tracking-[-0.02em] text-ink">Oi, {firstName}.</h1>
          <p className="mt-0.5 text-[15px] text-ink-secondary">{subtitulo}</p>
        </div>

        {!cenario && <Skeleton className="h-96 w-full rounded-lg" />}

        {cenario === 'vazio' && (
          <div className="flex flex-col gap-6">
            <PrimeiroCicloConvite onIniciar={abrirNovoCiclo} />
            <AtalhosEmpresa />
          </div>
        )}

        {cenario === 'primeiro-ciclo' && emCampo && (
          <div className="flex flex-col gap-6">
            <PrimeiroCicloEmAndamento campanha={emCampo} />
            <AtalhosEmpresa />
            <PlanosEmBreve />
          </div>
        )}

        {cenario === 'resultado' && (
          <>
            <div className="flex flex-col gap-6">

              {/* Pendências da empresa — no topo: é o que precisa de ação agora. */}
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

              {/* Planos de ação — lista única, os da pessoa logada no topo. */}
              <section>
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-[15px] font-semibold text-ink">Planos de ação</h2>
                    <p className="mt-0.5 text-[12.5px] text-ink-secondary">Primeiro os que estão com você, depois os mais perto do prazo.</p>
                  </div>
                  <button onClick={() => navigate('/rh/nr1/plano-acao')} className="shrink-0 font-heading text-sm font-medium text-primary transition-colors hover:text-primary-600 dark:text-primary-300">
                    Ver todos
                  </button>
                </div>
                {acoes.status === 'loading' && <Skeleton className="h-64 w-full rounded-lg" />}
                {acoes.status === 'error' && <ErrorState message={acoes.message} onRetry={acoes.reload} />}
                {acoes.status === 'success' && (
                  <ListaPlanos
                    planos={planos}
                    totalAbertas={abertas.length}
                    ehMinha={ehMinha}
                    riscoDaAcao={riscoDaAcao}
                    onAbrir={setDetalhe}
                    onVerTodos={() => navigate('/rh/nr1/plano-acao')}
                  />
                )}
              </section>

              {/* Resultado do último ciclo encerrado — o mesmo bloco da Visão
                 geral da Conformidade NR-1 (radar + notas por domínio, com
                 filtro de departamento). */}
              {vigente && (
                <section className="mt-6">
                  <ResultadoCicloSecao campanha={vigente} />
                </section>
              )}

              {/* Atalhos para as telas da Conformidade NR-1 — os mesmos cards
                 da Visão geral do módulo. */}
              {vigente && (
                <section>
                  <AtalhosNr1 campanhaId={vigente.id} />
                </section>
              )}
            </div>

            <div className="mt-6 flex gap-3 rounded-lg border border-border bg-surface-2 p-4">
              <Icon icon="ph:info-bold" width={20} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
              <p className="text-[12px] leading-relaxed text-ink-secondary">
                A YNA fornece o insumo qualificado: o inventário e o relatório de gestão. A
                responsabilidade técnica pelo PGR permanece com o SESMT ou a consultoria de SST da
                sua empresa.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Detalhe da ação em tela cheia — o mesmo do Plano de ação. */}
      <Nr1AcaoDetalheModal
        acao={detalhe}
        riscos={riscos}
        onClose={() => setDetalhe(null)}
        onAlterado={() => { acoes.reload(); pendencias.reload() }}
      />

      <NovoCicloSheet {...novoCiclo} />
      <Toast message={feedback} onClose={() => setFeedback(null)} />

    </div>
  )
}

/* ------------------------------------------------------------------
   Planos de ação
   ------------------------------------------------------------------ */

/* Lista única de planos em aberto. Os da pessoa logada vêm no topo, com
   fundo e filete na cor da marca e o selo "Com você"; os demais mostram
   quem responde. Cada linha abre o mesmo detalhe do Plano de ação. */
function ListaPlanos({ planos, totalAbertas, ehMinha, riscoDaAcao, onAbrir, onVerTodos }: {
  planos: Nr1Acao[]
  totalAbertas: number
  ehMinha: (a: Nr1Acao) => boolean
  riscoDaAcao: (riscoId: string) => Nr1RiscoInventario | undefined
  onAbrir: (a: Nr1Acao) => void
  onVerTodos: () => void
}) {
  if (planos.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-5 py-4">
        <Icon icon="ph:check-circle-bold" width={20} className="shrink-0 text-success" aria-hidden />
        <p className="text-[13.5px] text-ink-secondary">Nenhum plano de ação em aberto na empresa.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <ul className="flex flex-col divide-y divide-border">
        {planos.map((a) => (
          <li key={a.id}>
            <PlanoLinha acao={a} risco={riscoDaAcao(a.riscoId)} minha={ehMinha(a)} onClick={() => onAbrir(a)} />
          </li>
        ))}
      </ul>
      {totalAbertas > planos.length && (
        <button
          type="button"
          onClick={onVerTodos}
          className="flex w-full items-center justify-center gap-1.5 border-t border-border px-5 py-3 font-heading text-[13px] font-medium text-primary transition-colors hover:bg-surface-hover dark:text-primary-300"
        >
          Ver as {totalAbertas} ações em aberto
          <Icon icon="ph:arrow-right-bold" width={12} aria-hidden />
        </button>
      )}
    </div>
  )
}

function PlanoLinha({ acao, risco, minha, onClick }: {
  acao: Nr1Acao
  risco?: Nr1RiscoInventario
  minha: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors ${
        minha ? 'bg-primary-50/60 hover:bg-primary-50' : 'hover:bg-surface-hover'
      }`}
    >
      {minha && <span className="absolute inset-y-0 left-0 w-1 bg-primary" aria-hidden />}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 font-heading text-[13.5px] font-semibold leading-snug text-ink">{acao.oQue}</p>
        {risco && (
          <p className="mt-0.5 truncate text-[11.5px] text-ink-secondary">
            <span className="font-medium text-ink">{risco.fator}</span> · {risco.grupoExposto}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2 sm:hidden">
          <PrazoBadge acao={acao} />
          <Responsavel acao={acao} minha={minha} />
        </div>
      </div>
      <div className="hidden w-[220px] shrink-0 sm:block">
        <Responsavel acao={acao} minha={minha} />
      </div>
      <div className="hidden w-[150px] shrink-0 sm:block">
        <PrazoBadge acao={acao} />
      </div>
      <Icon icon="ph:caret-right-bold" width={14} className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
    </button>
  )
}

function Responsavel({ acao, minha }: { acao: Nr1Acao; minha: boolean }) {
  if (minha) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-2.5 py-1 text-[11px] font-semibold text-white">
        <Icon icon="ph:user-bold" width={11} aria-hidden />
        Com você
      </span>
    )
  }
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1 text-[11.5px] text-ink-secondary">
      <Icon icon="ph:user-bold" width={11} className="shrink-0" aria-hidden />
      <span className="truncate">{acao.quem}</span>
    </span>
  )
}

/* ------------------------------------------------------------------
   Acesso rápido à configuração da empresa
   ------------------------------------------------------------------ */

/* Antes do primeiro resultado, o trabalho do RH é deixar a empresa pronta:
   o time cadastrado e convidado, os departamentos certos (a base dos
   recortes do resultado) e a equipe que vai cuidar da conformidade. Mesmo
   formato dos atalhos do NR-1 (`Nr1Atalhos.tsx`), com um número que diz o
   que há em cada lugar. */
function AtalhosEmpresa() {
  const colaboradores = useService(() => rhColaboradorService.list(), [])
  const departamentos = useService(() => rhDepartamentoService.list(), [])
  const equipe = useService(() => rhEquipeService.list(), [])

  const nColab = colaboradores.status === 'success' ? colaboradores.data.length : null
  const semConvite = colaboradores.status === 'success' ? colaboradores.data.filter((c) => c.status === 'nao_convidado').length : 0
  const nDeps = departamentos.status === 'success' ? departamentos.data.length : null
  const nEquipe = equipe.status === 'success' ? equipe.data.length : null
  const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`

  const cards = [
    {
      to: '/rh/colaboradores',
      icon: 'ph:users-three-bold',
      titulo: 'Colaboradores',
      texto: 'Adicione, importe e edite o time, e envie convites para quem ainda não recebeu.',
      info: nColab === null ? null : nColab === 0 ? 'Nenhum colaborador ainda' : semConvite > 0 ? plural(semConvite, 'colaborador sem convite', 'colaboradores sem convite') : plural(nColab, 'colaborador', 'colaboradores'),
      alerta: nColab === 0 || semConvite > 0,
    },
    {
      to: '/rh/departamentos',
      icon: 'ph:tree-structure-bold',
      titulo: 'Departamentos',
      texto: 'Crie, edite e organize as áreas da empresa. É por elas que o resultado é recortado.',
      info: nDeps === null ? null : nDeps === 0 ? 'Nenhum departamento ainda' : plural(nDeps, 'departamento', 'departamentos'),
      alerta: nDeps === 0,
    },
    {
      to: '/rh/equipe',
      icon: 'ph:user-gear-bold',
      titulo: 'Equipe RH',
      texto: 'Convide outras pessoas da empresa para acessar a área administrativa.',
      info: nEquipe === null ? null : plural(nEquipe, 'pessoa com acesso', 'pessoas com acesso'),
      alerta: false,
    },
  ]

  return (
    <section>
      <div className="mb-3">
        <h2 className="text-[15px] font-semibold text-ink">Acesso rápido</h2>
        <p className="mt-0.5 text-[12.5px] text-ink-secondary">Deixe a empresa pronta: o time, as áreas e quem cuida da conformidade com você.</p>
      </div>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
              {c.info === null ? (
                <Skeleton className="mt-3 h-6 w-32 rounded-pill" />
              ) : (
                <span className={`mt-3 inline-flex w-fit items-center gap-1.5 rounded-pill px-2.5 py-1 text-[11.5px] font-semibold ${c.alerta ? 'bg-warning/25 text-warning-ink' : 'bg-surface-2 text-ink-secondary'}`}>
                  {c.alerta && <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden />}
                  {c.info}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* Primeiro ciclo ainda em campo: não há fator de risco apontado, então não
   há plano de ação. Em vez de esconder a seção, ela avisa o que vem depois
   e onde vai aparecer. */
function PlanosEmBreve() {
  return (
    <section>
      <h2 className="mb-3 text-[15px] font-semibold text-ink">Planos de ação</h2>
      <div className="flex flex-col gap-4 rounded-lg border border-dashed border-border-strong bg-surface/70 p-5 sm:flex-row sm:items-center">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
          <Icon icon="ph:list-checks-bold" width={22} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="font-heading text-[14px] font-semibold text-ink">Os planos de ação começam no resultado</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-secondary">
            Quando o ciclo for encerrado, os fatores de risco apontados entram no inventário e cada um
            ganha um plano: o que fazer, quem responde e até quando. Os que estiverem com você e os
            mais perto do prazo aparecem aqui.
          </p>
        </div>
      </div>
    </section>
  )
}
