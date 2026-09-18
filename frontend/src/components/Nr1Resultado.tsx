import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { NIVEL_RISCO, NIVEL_PROTEGIDO } from '../lib/nr1'
import { NR1_DIMENSOES, NR1_PONTUACAO, nr1NivelPorMedia } from '../data/nr1Mock'
import type { Nr1LinhaMapa, Nr1DimensaoId } from '../types'

/* Peças de resultado do módulo de Conformidade NR-1, compartilhadas entre a
   Visão geral (`/rh/nr1`, sempre o ciclo em campo) e a aba "Resultado" de
   um ciclo específico (`/rh/nr1/ciclos/:id`) — mesmo visual em qualquer um
   dos dois lugares onde o risco (macro e por área) aparece. */

type DimensaoMedia = { dimensaoId: Nr1DimensaoId; nome: string; media: number; nivel: ReturnType<typeof nr1NivelPorMedia> }

/** Máximo de cards por linha na grade desktop de "Risco por dimensão".
   Acima disso, `balancedRows` já divide em mais de uma linha. */
const MAX_CARDS_POR_LINHA = 4

/** Quantos itens cabem em cada linha para distribuir `n` itens da forma mais
   equilibrada possível, respeitando no máximo `maxPorLinha` por linha —
   nunca uma linha cheia seguida de uma quase vazia. Ex.: 7 itens (máx. 4)
   vira [4, 3], não [4, 4, ...-1] nem [4, 4] com um item sobrando; 10 itens
   vira [4, 3, 3], não [4, 4, 2]. */
function balancedRows(n: number, maxPorLinha: number): number[] {
  if (n <= 0) return []
  const linhas = Math.ceil(n / maxPorLinha)
  const base = Math.floor(n / linhas)
  const resto = n % linhas
  return Array.from({ length: linhas }, (_, i) => base + (i < resto ? 1 : 0))
}

/** Risco por dimensão (macro) — grade de linhas compactas, uma por
   dimensão do modelo aplicado (4, 8, ou quantas o modelo tiver). Clicável
   quando `onClickDimensao` é passado: abre a lista de perguntas daquela
   dimensão, na visão da empresa inteira (quem chama decide o escopo).

   Cada card tem 2 zonas bem separadas: identidade em cima (ícone + nome,
   sempre com `min-h` de 2 linhas reservado — mesmo o nome de 1 linha só
   ganha o espaço em branco, pra todo card da grade nascer com a mesma
   altura, não só os da mesma fileira) e a nota em destaque embaixo (número
   grande + nível, um de cada lado). O nome nunca trunca — se algum for tão
   comprido que passe de 2 linhas, o card cresce, nunca corta. `rounded-md`
   (não `rounded-lg`, usado nos cards maiores da tela): no tamanho compacto
   deste card o raio de 20px do `rounded-lg` chama mais atenção que devia —
   mesmo raio das células do mapa de calor logo abaixo, que têm o mesmo
   papel (número + nível) numa caixa pequena.

   Abaixo do breakpoint `lg`, a grade é a de sempre (2 ou 3 colunas fixas,
   última linha pode ficar incompleta — tela estreita não tem espaço de
   sobra pra bancar um cálculo de equilíbrio). A partir do `lg`, a grade
   troca para linhas calculadas por `balancedRows`: em vez de encher cada
   linha até o limite e empurrar a sobra pra uma última linha capenga (o
   que um `grid-template-columns` fixo faria), as linhas saem sempre com o
   mesmo número de itens ou, quando `dimensoes.length` não divide exato,
   com no máximo 1 de diferença entre elas — e cada linha ocupa a largura
   toda do card (`1fr` por coluna daquela linha), nunca só o espaço dos
   itens que sobraram. */
export function RiscoPorDimensaoGrid({ dimensoes, onClickDimensao }: { dimensoes: DimensaoMedia[]; onClickDimensao?: (dimensaoId: Nr1DimensaoId) => void }) {
  const linhas = balancedRows(dimensoes.length, MAX_CARDS_POR_LINHA)
  const chunks: DimensaoMedia[][] = []
  let cursor = 0
  for (const n of linhas) {
    chunks.push(dimensoes.slice(cursor, cursor + n))
    cursor += n
  }

  const renderCard = (d: DimensaoMedia) => {
    /* O ícone vem de `NR1_DIMENSOES` (metadado visual do modelo real) — mas
       o nome vem sempre de `d.nome`, o mesmo já publicado pelo serviço (ou
       pela simulação, ver `lib/nr1Simulacao.ts`), nunca de um lookup nessa
       constante. Uma dimensão simulada (`sim-dim-9` etc.) não existe em
       `NR1_DIMENSOES`, e olhar `meta?.nome` pra ela renderizaria em branco. */
    const meta = NR1_DIMENSOES.find((x) => x.id === d.dimensaoId)
    const st = NIVEL_RISCO[d.nivel]
    const conteudo = (
      <>
        <div className="flex items-start gap-1.5">
          <Icon icon={meta?.icon ?? 'ph:list-bold'} width={15} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
          {/* `min-h` reserva sempre 2 linhas de nome, mesmo pras dimensões
             com nome curto — sem isso, um card de nome curto (1 linha) e
             outro de nome comprido (2 linhas) na mesma grade ficavam com
             alturas diferentes, e só o grid (que iguala pela linha inteira)
             disfarçava a diferença dentro de uma mesma fileira, não entre
             fileiras. Sem `line-clamp`: se um nome raríssimo precisar de
             3 linhas, ele cresce — nunca corta (RF pedido explicitamente). */}
          <p className="min-h-[2.4em] text-[12.5px] font-medium leading-snug text-ink">{d.nome}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[22px] font-bold leading-none tracking-[-0.01em] text-ink">{d.media.toFixed(1)}</span>
          <span className={`shrink-0 rounded-pill px-2 py-0.5 text-[10.5px] font-semibold leading-none ${st.cls}`}>
            {st.label}
          </span>
        </div>
      </>
    )
    return onClickDimensao ? (
      <button
        key={d.dimensaoId}
        onClick={() => onClickDimensao(d.dimensaoId)}
        className="flex flex-col gap-2.5 rounded-md border border-border bg-surface px-3.5 py-3 text-left transition-colors hover:border-border-strong hover:bg-surface-hover"
      >
        {conteudo}
      </button>
    ) : (
      <div key={d.dimensaoId} className="flex flex-col gap-2.5 rounded-md border border-border bg-surface px-3.5 py-3">
        {conteudo}
      </div>
    )
  }

  return (
    <>
      {/* Linha horizontal quer largura, não uma coluna estreita — abaixo do
         `lg` fica em lista de 1 coluna (não mais 2-3), pra não truncar o
         nome ainda mais num espaço que já é apertado no celular. */}
      <div className="flex flex-col gap-2 lg:hidden">
        {dimensoes.map(renderCard)}
      </div>

      <div className="hidden flex-col gap-3 lg:flex">
        {chunks.map((chunk, i) => (
          <div key={i} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${chunk.length}, minmax(0, 1fr))` }}>
            {chunk.map(renderCard)}
          </div>
        ))}
      </div>
    </>
  )
}

/** Mapa de calor por dimensão × área, com legenda e nota de anonimato.
   Célula clicável quando `onClickCelula` é passado: abre a lista de
   perguntas daquela dimensão, na visão da área da linha (nunca de uma
   linha protegida — essas nem chegam a renderizar célula por dimensão).

   Layout pensado para uma quantidade variável de dimensões (colunas) e
   áreas (linhas) — nem toda empresa mede as mesmas 8 dimensões, e a lista
   de áreas cresce e encolhe por empresa:
   · `table-fixed` com a coluna de área em largura fixa e as colunas de
     dimensão dividindo o espaço restante em partes iguais — em vez de
     colunas de largura fixa somada (o comportamento antigo, pensado para
     exatamente 4), a tabela se estica para preencher a largura disponível
     em telas grandes e só entra em scroll horizontal abaixo do mínimo por
     coluna (`MIN_PX_POR_DIMENSAO`), calculado a partir de quantas dimensões
     o modelo aplicado realmente tem;
   · sem limite de altura por padrão — todas as áreas são listadas, por
     mais que sejam. O cabeçalho (`sticky top-0`) trava contra o scroll da
     PÁGINA (o `<main>` de `RhAppLayout`, a única ancestral com
     `overflow-y` antes daqui), não um scroll interno do card: rolando a
     página, o cabeçalho fica preso no topo enquanto a tabela ainda está
     em vista, e solta sozinho assim que a última área passa. `sticky` vai
     em cada `<th>`, não no `<thead>` inteiro — sticky num `<thead>` (row
     group) tem suporte inconsistente entre navegadores e chegou a
     descolar o cabeçalho da célula "Área" durante o scroll; por célula é
     o jeito que funciona em todo navegador;
   · com o nome completo da dimensão no cabeçalho (em vez do `curto`) e um
     modelo com muitas dimensões, o mínimo por coluna passa a exceder a
     largura do card e a tabela precisa de scroll horizontal — comportamento
     aceito, não um bug (ver conversa que definiu isso). MAS: `overflow-x`
     em QUALQUER ancestral (mesmo sem conteúdo overflowing) já é o
     suficiente pra virar a referência de `sticky` dos filhos — colocá-lo
     incondicionalmente aqui quebraria o "trava contra o scroll da página"
     de cima, porque o `sticky top-0` do cabeçalho passaria a travar contra
     ESTA caixa (que nunca rola verticalmente sozinha) em vez do `<main>`,
     o que visualmente é o mesmo que não estar sticky. Por isso `overflow-x`
     só entra quando medido (`ResizeObserver`) que a tabela realmente não
     cabe na largura do card — nesse caso (só quando há dimensões demais
     pra largura), volta o comportamento anterior: caixa com altura máxima
     e os dois eixos de scroll dentro dela (`sticky` volta a travar contra
     essa caixa, não mais contra a página — é o único jeito de ter as duas
     coisas, sticky-na-página E scroll horizontal, ao mesmo tempo, sem
     duplicar o cabeçalho com JS). No caso comum (dimensões cabem na
     largura — inclusive as 8 reais de hoje), a caixa leva `overflow-clip`
     em vez de simplesmente nada: sem NENHUM `overflow`, o canto arredondado
     do card (`rounded-lg`) não recorta mais a célula "Área" (que tem fundo
     sólido, por ser sticky) — ela vaza quadrada por cima do canto
     arredondado. `clip` recorta pelo `border-radius` que nem `hidden`/
     `auto` fariam, mas — ao contrário deles — não conta como "ancestral
     com scroll" pra fins de `sticky`, então não quebra o item acima
     (testado: `sticky` continua travando contra o `<main>` mesmo com
     `overflow-clip` no meio do caminho). A coluna de área (`sticky
     left-0`) continua travada horizontalmente nos dois modos, pra nunca
     perder de vista de qual área é a nota.

   `dimensoes` é sempre recebido por prop (nunca lido de `NR1_DIMENSOES`
   direto): o cabeçalho tem que listar exatamente as dimensões que geraram
   as células de `linhas`, sejam as do modelo real ou as de uma simulação
   (ver `lib/nr1Simulacao.ts`) — usar a constante global aqui já causou
   cabeçalho e células saírem com contagens diferentes quando as duas
   divergem. */
const MIN_PX_LABEL = 168
const MIN_PX_POR_DIMENSAO = 92

/** Borda inferior + sombra do cabeçalho travado — direto em cada `<th>`,
   não no `<tr>` (que não a levava até a posição "grudada" do `sticky`:
   border-collapse pinta a borda na posição de fluxo normal da linha, não
   em onde a célula está de fato desenhada enquanto stuck — daí a linha
   sumir bem na hora que mais faz falta, com a página rolando por baixo).
   A sombra só pra baixo (offset negativo pro lado, sem espalhar pros
   lados) é o que faz o cabeçalho parecer elevado sobre o conteúdo que
   passa por baixo dele durante o scroll. */
const HEADER_STUCK_SHADOW = 'shadow-[0_6px_8px_-6px_rgba(0,0,0,0.14)] dark:shadow-[0_6px_8px_-6px_rgba(0,0,0,0.45)]'

export function MapaCalorTable({ dimensoes, linhas, onClickCelula }: {
  dimensoes: { id: Nr1DimensaoId; nome: string }[]
  linhas: Nr1LinhaMapa[]
  onClickCelula?: (dimensaoId: Nr1DimensaoId, departamentoId: string, departamento: string) => void
}) {
  const K = NR1_PONTUACAO.kAnonimato
  const protegidas = linhas.filter((l) => l.protegido)
  const minLargura = MIN_PX_LABEL + dimensoes.length * MIN_PX_POR_DIMENSAO

  /* Só liga `overflow-x` (e, junto, a caixa com altura máxima — ver o
     porquê dos dois andarem juntos na nota acima) quando a tabela
     realmente não cabe na largura do card. Medido com `ResizeObserver`
     em vez de estimado pelo nº de dimensões porque a largura disponível
     varia (sidebar, zoom, janela) — o mesmo modelo de 8 dimensões cabe
     numa tela cheia e pode não caber numa janela estreita. */
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [precisaScrollHorizontal, setPrecisaScrollHorizontal] = useState(false)
  useLayoutEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const medir = () => setPrecisaScrollHorizontal(el.clientWidth < minLargura)
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [minLargura])

  return (
    <>
      <div
        ref={wrapperRef}
        className={`rounded-lg border border-border bg-surface ${precisaScrollHorizontal ? 'max-h-[65vh] overflow-auto' : 'overflow-clip'}`}
      >
        <table className="w-full table-fixed border-collapse" style={{ minWidth: `${minLargura}px` }}>
          <caption className="sr-only">
            Nível de risco psicossocial por dimensão e área, em média de 1 a 5, onde 5 é a
            situação desejável.
          </caption>
          <thead>
            <tr>
              <th scope="col" style={{ width: MIN_PX_LABEL }} className={`sticky top-0 left-0 z-30 border-r border-b border-border bg-surface px-4 py-3 text-left text-[12px] font-semibold text-ink-secondary ${HEADER_STUCK_SHADOW}`}>Área</th>
              {dimensoes.map((d) => (
                <th key={d.id} scope="col" className={`sticky top-0 z-20 border-b border-border bg-surface px-1.5 py-3 text-center text-[11px] font-semibold leading-snug text-ink-secondary ${HEADER_STUCK_SHADOW}`}>
                  {d.nome}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.departamentoId} className="border-b border-border last:border-0">
                <th scope="row" className="sticky left-0 z-10 border-r border-border bg-surface px-4 py-2.5 text-left">
                  <p className="truncate text-[13px] font-medium text-ink">{l.departamento}</p>
                  <p className="text-[11px] font-normal text-ink-muted">{l.respondentes} respondentes</p>
                </th>

                {l.protegido ? (
                  <td colSpan={dimensoes.length} className="px-2 py-2.5 text-center">
                    <span className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-[11px] font-medium ${NIVEL_PROTEGIDO.cls}`}>
                      <Icon icon="ph:lock-simple-bold" width={12} aria-hidden />
                      Dados protegidos (menos de {K} respostas)
                    </span>
                  </td>
                ) : (
                  l.celulas.map((c) => {
                    const st = c.nivel ? NIVEL_RISCO[c.nivel] : NIVEL_PROTEGIDO
                    const conteudo = (
                      <>
                        <span className="font-mono text-[14px] font-bold leading-none">{c.media?.toFixed(1) ?? '—'}</span>
                        <span className="text-[10px] font-semibold leading-none">{st.label}</span>
                      </>
                    )
                    return (
                      <td key={c.dimensaoId} className="p-1.5 text-center">
                        {onClickCelula ? (
                          <button
                            onClick={() => onClickCelula(c.dimensaoId, l.departamentoId, l.departamento)}
                            className={`flex min-h-[44px] w-full flex-col items-center justify-center gap-0.5 rounded-md px-1 py-1 transition-transform hover:scale-[1.03] ${st.cls}`}
                          >
                            {conteudo}
                          </button>
                        ) : (
                          <span className={`flex min-h-[44px] w-full flex-col items-center justify-center gap-0.5 rounded-md px-1 py-1 ${st.cls}`}>
                            {conteudo}
                          </span>
                        )}
                      </td>
                    )
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        {(['baixo', 'atencao', 'risco', 'critico'] as const).map((n) => (
          <span key={n} className="flex items-center gap-1.5 text-[12px] text-ink-secondary">
            <span className={`h-3 w-3 rounded-[4px] ${NIVEL_RISCO[n].dot}`} aria-hidden />
            {NIVEL_RISCO[n].label} · {NIVEL_RISCO[n].acao}
          </span>
        ))}
      </div>

      <div className="mt-5 flex gap-3 rounded-lg border border-border bg-surface p-4">
        <Icon icon="ph:lock-simple-bold" width={20} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
        <div>
          <p className="text-[13px] font-semibold text-ink">Anonimato estatístico</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-ink-secondary">
            Nenhum recorte com menos de {K} respondentes é exibido. Em um time de três pessoas,
            um número já identificaria alguém.
            {protegidas.length > 0 && (
              <> Neste ciclo, {protegidas.length === 1 ? 'a área' : 'as áreas'}{' '}
                <strong className="font-semibold text-ink">{protegidas.map((p) => p.departamento).join(', ')}</strong>{' '}
                {protegidas.length === 1 ? 'está protegida' : 'estão protegidas'}.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 rounded-lg border border-border bg-surface-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12.5px] leading-relaxed text-ink-secondary">
          Os fatores de maior risco já estão consolidados no inventário para o PGR.
        </p>
        <Link
          to="/rh/nr1/inventario"
          className="inline-flex shrink-0 items-center gap-1.5 font-heading text-[13px] font-semibold text-primary hover:underline dark:text-primary-300"
        >
          Ver inventário
          <Icon icon="ph:arrow-right-bold" width={13} aria-hidden />
        </Link>
      </div>
    </>
  )
}
