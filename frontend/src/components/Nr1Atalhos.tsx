import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useService } from '../hooks/useService'
import { nr1CampanhaService, nr1ResultadoService, nr1AcaoService } from '../services/nr1'
import { nr1DiasEntre } from '../lib/nr1'
import { NR1_TODAY } from '../data/nr1Mock'

/* Usado pelas duas Visões gerais do RH: na da Conformidade NR-1
   (`NR1RhVisaoGeral`), no topo; na da área logada (`NR1RhCockpit`), logo
   abaixo do resultado do ciclo. */

/* Atalhos para as demais telas do módulo, cada um com um número que diz o
   que há para fazer lá. */
export function AtalhosNr1({ campanhaId }: { campanhaId: string }) {
  const encerrados = useService(() => nr1ResultadoService.ciclosEncerrados(), [])
  const riscos = useService(() => nr1ResultadoService.inventario(campanhaId), [campanhaId])
  const acoes = useService(() => nr1AcaoService.list(), [])
  const campanhas = useService(() => nr1CampanhaService.list(), [])

  const lista = riscos.status === 'success' ? riscos.data : []
  const todas = acoes.status === 'success' ? acoes.data : []
  const vigentes = todas.filter((a) => !todas.some((b) => b.versaoAnteriorId === a.id) && lista.some((r) => r.id === a.riscoId))
  const semPlano = lista.filter((r) => !todas.some((a) => a.riscoId === r.id)).length
  const vencidas = vigentes.filter((a) => a.status !== 'concluida' && nr1DiasEntre(NR1_TODAY, a.quando) < 0).length
  const emCampo = campanhas.status === 'success' ? campanhas.data.find((c) => c.status === 'em-campo') : undefined
  const nCiclos = encerrados.status === 'success' ? encerrados.data.ids.length : 0

  const cards = [
    { to: '/rh/nr1/ciclos', icon: 'ph:calendar-check-bold', titulo: 'Ciclos de avaliação', texto: 'Aplique o questionário e acompanhe a participação de cada área.', info: emCampo ? 'Um ciclo em andamento' : `${nCiclos} ${nCiclos === 1 ? 'ciclo encerrado' : 'ciclos encerrados'}`, alerta: false },
    { to: '/rh/nr1/inventario', icon: 'ph:clipboard-text-bold', titulo: 'Inventário de riscos', texto: 'Os fatores de risco identificados por departamento.', info: semPlano > 0 ? `${semPlano} ${semPlano === 1 ? 'fator sem plano' : 'fatores sem plano'}` : `${lista.length} ${lista.length === 1 ? 'fator' : 'fatores'}, todos com plano`, alerta: semPlano > 0 },
    { to: '/rh/nr1/plano-acao', icon: 'ph:list-checks-bold', titulo: 'Planos de ação', texto: 'O que será feito, por quem e até quando.', info: vencidas > 0 ? `${vencidas} ${vencidas === 1 ? 'ação vencida' : 'ações vencidas'}` : `${vigentes.length} ${vigentes.length === 1 ? 'ação' : 'ações'} em dia`, alerta: vencidas > 0 },
    { to: '/rh/nr1/resumo-pgr', icon: 'ph:file-text-bold', titulo: 'Resumo para o PGR', texto: 'O inventário pronto para exportar ou imprimir.', info: `${lista.length} ${lista.length === 1 ? 'fator' : 'fatores'} no resumo`, alerta: false },
  ]

  return (
    <>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
              <span className={`mt-3 inline-flex w-fit items-center gap-1.5 rounded-pill px-2.5 py-1 text-[11.5px] font-semibold ${c.alerta ? 'bg-warning/25 text-warning-ink' : 'bg-surface-2 text-ink-secondary'}`}>
                {c.alerta && <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden />}
                {c.info}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

