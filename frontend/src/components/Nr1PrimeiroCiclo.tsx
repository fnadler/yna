import { useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Badge } from './Badge'
import { Button } from './Button'
import { Pedra } from './Pedra'
import { META_PARTICIPACAO_PCT, participacaoEmCampo, diasRestantes } from './Nr1CicloStatusCard'
import { useService } from '../hooks/useService'
import { nr1CampanhaService } from '../services/nr1'
import { fmtData } from '../lib/nr1'
import type { Nr1Campanha } from '../types'

/* Os dois estados de "antes do primeiro resultado" do módulo NR-1, usados
   pelas duas visões gerais do RH (a da área logada, `NR1RhCockpit`, e a da
   Conformidade NR-1, `NR1RhVisaoGeral`), para as duas telas nunca
   discordarem sobre em que ponto a empresa está:

   - `vazio`: nenhum ciclo ainda → convite para iniciar o primeiro;
   - `primeiro-ciclo`: só um ciclo, ainda em campo → a participação;
   - `resultado`: já existe ciclo encerrado → cada tela mostra o seu.

   Parâmetro só de demonstração, no mesmo espírito do `?cenario=` de
   Ciclos de avaliação: `?cenario=vazio` mostra a tela sem nenhum ciclo e
   `?cenario=primeiro-ciclo` mostra só o ciclo em campo, sem os encerrados.
   Sem o parâmetro, vale o estado real dos dados. */

export type Nr1Cenario = 'vazio' | 'primeiro-ciclo' | 'resultado'

export function useNr1Cenario() {
  const [params, setParams] = useSearchParams()
  const forcado = params.get('cenario')
  const campanhas = useService(() => nr1CampanhaService.list(), [])
  const [novoOpen, setNovoOpen] = useState(false)
  const qtdAoAbrir = useRef(0)

  const todas = campanhas.status === 'success' ? campanhas.data : []
  const visiveis = forcado === 'vazio' ? [] : forcado === 'primeiro-ciclo' ? todas.filter((c) => c.status === 'em-campo') : todas
  /* O mais recente primeiro: `criar` insere o ciclo novo no topo da lista. */
  const emCampo = visiveis.find((c) => c.status === 'em-campo')
  const cenario: Nr1Cenario | undefined = campanhas.status !== 'success'
    ? undefined
    : visiveis.some((c) => c.status === 'encerrada') ? 'resultado' : emCampo ? 'primeiro-ciclo' : 'vazio'

  const abrirNovoCiclo = () => {
    qtdAoAbrir.current = todas.length
    setNovoOpen(true)
  }
  /* Ciclo criado a partir do estado vazio da demonstração: passa para o
     cenário "primeiro ciclo", em vez de cair no estado real (que já tem
     ciclos encerrados) e parecer que o ciclo novo sumiu. */
  const fecharNovoCiclo = async () => {
    setNovoOpen(false)
    const lista = await nr1CampanhaService.list()
    if (forcado === 'vazio' && lista.length > qtdAoAbrir.current) setParams({ cenario: 'primeiro-ciclo' })
    campanhas.reload()
  }

  return {
    cenario,
    campanhas,
    emCampo,
    abrirNovoCiclo,
    novoCiclo: { open: novoOpen, onClose: fecharNovoCiclo },
  }
}

/* ------------------------------------------------------------------
   Estado 1 — nenhum ciclo ainda
   ------------------------------------------------------------------ */

const PASSOS_PRIMEIRO_CICLO = [
  { icon: 'ph:calendar-plus-bold', titulo: 'Defina o ciclo', texto: 'Escolha o questionário e o período de respostas. Leva poucos minutos.' },
  { icon: 'ph:share-network-bold', titulo: 'Convide o time', texto: 'Um link único e anônimo, para todo mundo responder no próprio ritmo.' },
  { icon: 'ph:chart-polar-bold', titulo: 'Veja o retrato', texto: 'Ao encerrar o ciclo, o resultado aparece aqui, área por área.' },
]

/* Em vez de um "nada por aqui", um convite: o RH chega nesta tela antes
   de qualquer resultado, então ela explica o que é o ciclo, como ele
   acontece e já oferece o primeiro passo. */
export function PrimeiroCicloConvite({ onIniciar }: { onIniciar: () => void }) {
  return (
    <section className="relative overflow-hidden rounded-lg border border-border bg-surface">
      <div className="relative px-6 py-8 lg:px-10 lg:py-12">
        <div className="flex items-end justify-between gap-10">
          <div className="max-w-[560px]">
            <Badge tone="primary" icon="ph:sparkle-bold">Primeiro passo da NR-1</Badge>
            <h2 className="mt-4 font-heading text-[26px] font-bold leading-[1.15] tracking-[-0.015em] text-ink lg:text-[30px]">
              Vamos iniciar o primeiro ciclo de avaliação?
            </h2>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-secondary">
              É com ele que a sua empresa enxerga, com evidência, como o trabalho tem afetado as pessoas.
              O time responde a um questionário anônimo e a YNA transforma as respostas num retrato dos
              riscos psicossociais de cada área: a base para cuidar de quem faz a empresa acontecer.
            </p>
          </div>

          {/* Pedras empilhadas: a imagem do equilíbrio da marca, na mesma
             composição da boas-vindas do RH (RH00BemVindo), em escala menor.
             Fica na linha do texto (não `absolute`) para nunca invadir os
             passos abaixo. A pilha flutua inteira; pedras soltas animadas
             desmontariam a pilha. */}
          <div aria-hidden className="pointer-events-none relative mr-4 hidden h-[232px] w-[136px] shrink-0 animate-yna-float lg:block" style={{ animationDuration: '9s' }}>
            <Pedra forma="pedra" preenchimento="cool" className="absolute bottom-0 left-[17px] w-[115px] drop-shadow-[0_8px_20px_rgba(71,73,168,0.12)]" />
            <Pedra forma="pedrinha" preenchimento="sunset" className="absolute bottom-[59px] left-[7px] w-[101px] drop-shadow-[0_8px_20px_rgba(71,73,168,0.18)]" />
            <Pedra forma="seixo" preenchimento="warm" className="absolute bottom-[150px] left-[19px] w-[86px]" />
            <Pedra forma="oblongo" preenchimento="yellow" className="absolute bottom-[177px] left-[41px] w-[48px] drop-shadow-[0_8px_20px_rgba(71,73,168,0.18)]" />
          </div>
        </div>

        <ol className="mt-8 grid gap-3 sm:grid-cols-3">
          {PASSOS_PRIMEIRO_CICLO.map((p, i) => (
            <li key={p.titulo} className="flex gap-3 rounded-lg border border-border bg-surface-2/60 p-4 backdrop-blur-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
                <Icon icon={p.icon} width={18} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-ink-muted">Passo {i + 1}</span>
                <span className="mt-0.5 block font-heading text-[14px] font-semibold text-ink">{p.titulo}</span>
                <span className="mt-1 block text-[12.5px] leading-relaxed text-ink-secondary">{p.texto}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button iconLeft="ph:calendar-plus-bold" onClick={onIniciar}>Iniciar primeiro ciclo</Button>
          <p className="flex items-start gap-2 text-[12.5px] leading-relaxed text-ink-secondary sm:max-w-sm">
            <Icon icon="ph:eye-slash-bold" width={16} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
            Sigilo de ponta a ponta: você vê resultados por área, nunca as respostas de cada pessoa.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------
   Estado 2 — primeiro ciclo em andamento (ainda sem resultado)
   ------------------------------------------------------------------ */

/* Enquanto o primeiro ciclo está em campo não há resultado para mostrar,
   então a tela acompanha o que dá para acompanhar: a participação. Os
   números vêm de `participacaoEmCampo`, os mesmos do card do ciclo em
   Ciclos de avaliação, para as duas telas nunca discordarem. */
export function PrimeiroCicloEmAndamento({ campanha }: { campanha: Nr1Campanha }) {
  const { elegiveis, respostas, pctAtual, faltamMeta, abaixoDaMeta } = participacaoEmCampo(campanha)
  const dias = diasRestantes(campanha.fim)

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border border-border bg-surface p-6 lg:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
          <AnelParticipacao pct={pctAtual} abaixoDaMeta={abaixoDaMeta} />

          <div className="min-w-0 flex-1">
            <Badge tone="primary" icon="ph:broadcast-bold">Ciclo em andamento</Badge>
            <h2 className="mt-3 font-heading text-[24px] font-bold leading-tight tracking-[-0.015em] text-ink">
              Seu primeiro ciclo está em campo
            </h2>
            <p className="mt-2 max-w-[560px] text-[14px] leading-relaxed text-ink-secondary">
              O resultado aparece aqui quando o ciclo for encerrado. Até lá, vale acompanhar a
              participação: quanto mais gente responde, mais fiel é o retrato do time.
            </p>

            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-surface-2 px-4 py-3">
                <dt className="text-[11.5px] text-ink-secondary">Responderam</dt>
                <dd className="mt-0.5 font-heading text-[18px] font-bold text-ink">{respostas} <span className="text-[13px] font-medium text-ink-secondary">de {elegiveis}</span></dd>
              </div>
              <div className="rounded-lg bg-surface-2 px-4 py-3">
                <dt className="text-[11.5px] text-ink-secondary">Para a meta de {META_PARTICIPACAO_PCT}%</dt>
                <dd className="mt-0.5 font-heading text-[18px] font-bold text-ink">
                  {abaixoDaMeta ? <>{faltamMeta} <span className="text-[13px] font-medium text-ink-secondary">{faltamMeta === 1 ? 'resposta' : 'respostas'}</span></> : 'Meta atingida'}
                </dd>
              </div>
              <div className="rounded-lg bg-surface-2 px-4 py-3">
                <dt className="text-[11.5px] text-ink-secondary">Prazo: até {fmtData(campanha.fim)}</dt>
                <dd className="mt-0.5 font-heading text-[18px] font-bold text-ink">
                  {dias > 0 ? <>{dias} <span className="text-[13px] font-medium text-ink-secondary">{dias === 1 ? 'dia restante' : 'dias restantes'}</span></> : dias === 0 ? 'Encerra hoje' : 'Prazo encerrado'}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to={`/rh/nr1/ciclos/${campanha.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-pill bg-primary px-5 py-3 font-heading text-[14px] font-semibold text-white transition-colors hover:bg-primary-600"
              >
                Ver detalhes do ciclo
                <Icon icon="ph:arrow-right-bold" width={16} aria-hidden />
              </Link>
              <p className="min-w-0 truncate text-[12px] text-ink-muted">{campanha.nome} · Protocolo {campanha.protocolo}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex gap-3 rounded-lg border border-border bg-surface-2 p-4">
        <Icon icon="ph:lightbulb-bold" width={20} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
        <p className="text-[12.5px] leading-relaxed text-ink-secondary">
          No detalhe do ciclo você vê a participação de cada área e pode lembrar as que estão abaixo da
          meta. Os lembretes vão para a área toda: ninguém é identificado por ter ou não respondido.
        </p>
      </div>
    </div>
  )
}

/* Indicador único (uma porcentagem contra uma meta), então um anel e não um
   gráfico de série: o número no centro carrega a leitura, a cor de status
   reforça (com o texto "Abaixo da meta"/"Meta atingida" logo abaixo, nunca
   só a cor) e um traço marca onde fica a meta. */
function AnelParticipacao({ pct, abaixoDaMeta }: { pct: number; abaixoDaMeta: boolean }) {
  const r = 70
  const circ = 2 * Math.PI * r
  const anguloMeta = (META_PARTICIPACAO_PCT / 100) * 2 * Math.PI - Math.PI / 2
  const metaIn = { x: 90 + (r - 14) * Math.cos(anguloMeta), y: 90 + (r - 14) * Math.sin(anguloMeta) }
  const metaOut = { x: 90 + (r + 14) * Math.cos(anguloMeta), y: 90 + (r + 14) * Math.sin(anguloMeta) }

  return (
    <figure className="mx-auto flex shrink-0 flex-col items-center lg:mx-0">
      <div className="relative h-[180px] w-[180px]">
        <svg viewBox="0 0 180 180" className="h-full w-full" role="img" aria-label={`Participação de ${pct}%, meta de ${META_PARTICIPACAO_PCT}%`}>
          <circle cx="90" cy="90" r={r} fill="none" strokeWidth="14" className="stroke-border" />
          <circle
            cx="90" cy="90" r={r} fill="none" strokeWidth="14" strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * circ} ${circ}`}
            transform="rotate(-90 90 90)"
            className={`transition-all duration-700 ${abaixoDaMeta ? 'stroke-warning' : 'stroke-success'}`}
          />
          <line x1={metaIn.x} y1={metaIn.y} x2={metaOut.x} y2={metaOut.y} strokeWidth="3" strokeLinecap="round" className="stroke-ink" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[40px] font-bold leading-none tracking-[-0.02em] text-ink">{pct}%</span>
          <span className="mt-1 text-[12px] text-ink-secondary">de participação</span>
        </div>
      </div>
      <figcaption className={`mt-3 inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-[11.5px] font-semibold ${abaixoDaMeta ? 'bg-warning-bg text-warning-ink' : 'bg-success-bg text-success-ink'}`}>
        <Icon icon={abaixoDaMeta ? 'ph:trend-down-bold' : 'ph:check-circle-bold'} width={12} aria-hidden />
        {abaixoDaMeta ? `Abaixo da meta de ${META_PARTICIPACAO_PCT}%` : 'Meta atingida'}
      </figcaption>
    </figure>
  )
}
