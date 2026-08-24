import type {
  Nr1NivelRisco, Nr1AcaoStatus, Nr1VersaoStatus, Nr1RelatoStatus, Nr1RelatoCategoria,
  Nr1RiscoStatus, Nr1AcaoRecomendada, Nr1Efetividade, Nr1Tendencia, Nr1RiscoCiclo,
} from '../types'

/* Vocabulário visual do módulo NR-1, num só lugar para que mapa de calor,
   inventário, plano de ação e relatório falem a mesma língua.

   A escala de cor usa os tokens semânticos do design system (success →
   warning → danger) e nunca é o único portador de significado: toda célula
   e todo badge trazem o rótulo textual junto, por acessibilidade (WCAG 2.1
   AA — §9 do prompt). */

export interface NivelStyle {
  label: string
  /** Prioridade de ação NR-1 correspondente. */
  acao: string
  /** Preenchimento do heatmap / badge. */
  cls: string
  /** Amostra sólida para a legenda. */
  dot: string
}

export const NIVEL_RISCO: Record<Nr1NivelRisco, NivelStyle> = {
  baixo: { label: 'Baixo', acao: 'Monitorar', cls: 'bg-success/20 text-success-ink', dot: 'bg-success' },
  atencao: { label: 'Atenção', acao: 'Ação preventiva', cls: 'bg-warning/25 text-warning-ink', dot: 'bg-warning' },
  risco: { label: 'Risco', acao: 'Ação corretiva prioritária', cls: 'bg-danger/20 text-danger-ink', dot: 'bg-danger' },
  critico: { label: 'Crítico', acao: 'Ação imediata', cls: 'bg-danger text-white', dot: 'bg-danger' },
}

/** Recorte ocultado por k-anonimato — nunca uma cor de risco. */
export const NIVEL_PROTEGIDO: NivelStyle = {
  label: 'Protegido',
  acao: 'Dados protegidos',
  cls: 'bg-surface-2 text-ink-muted',
  dot: 'bg-border-strong',
}

export const ACAO_STATUS: Record<Nr1AcaoStatus, { label: string; tone: 'neutral' | 'primary' | 'success' | 'danger' }> = {
  planejada: { label: 'Planejada', tone: 'neutral' },
  'em-andamento': { label: 'Em andamento', tone: 'primary' },
  concluida: { label: 'Concluída', tone: 'success' },
  atrasada: { label: 'Atrasada', tone: 'danger' },
}

export const VERSAO_STATUS: Record<Nr1VersaoStatus, { label: string; tone: 'neutral' | 'primary' | 'success' }> = {
  rascunho: { label: 'Rascunho', tone: 'neutral' },
  publicada: { label: 'Publicada', tone: 'success' },
  arquivada: { label: 'Arquivada', tone: 'neutral' },
}

export const RELATO_STATUS: Record<Nr1RelatoStatus, { label: string; tone: 'primary' | 'warning' | 'success' }> = {
  novo: { label: 'Novo', tone: 'primary' },
  'em-apuracao': { label: 'Em apuração', tone: 'warning' },
  concluido: { label: 'Concluído', tone: 'success' },
}

export const RELATO_CATEGORIA: Record<Nr1RelatoCategoria, string> = {
  'assedio-moral': 'Assédio moral',
  'assedio-sexual': 'Assédio sexual',
  conflito: 'Conflito interpessoal',
  sobrecarga: 'Sobrecarga de trabalho',
  outro: 'Outro',
}

export const STATUS_RISCO: Record<Nr1RiscoStatus, { label: string; tone: 'neutral' | 'primary' | 'success' | 'danger' | 'warning'; icon: string }> = {
  identificado: { label: 'Identificado', tone: 'neutral', icon: 'ph:magnifying-glass-bold' },
  controlado: { label: 'Controlado', tone: 'success', icon: 'ph:check-circle-bold' },
  regredido: { label: 'Regredido', tone: 'danger', icon: 'ph:trend-up-bold' },
  eliminado: { label: 'Eliminado', tone: 'neutral', icon: 'ph:check-circle-bold' },
  monitorando: { label: 'Monitorando', tone: 'warning', icon: 'ph:eye-bold' },
}

export const ACAO_RECOMENDADA: Record<Nr1AcaoRecomendada, { label: string; tone: 'neutral' | 'primary' | 'success' | 'danger' | 'warning' }> = {
  manter: { label: 'Manter', tone: 'success' },
  'manter-com-monitoramento': { label: 'Manter, com monitoramento', tone: 'success' },
  investigar: { label: 'Investigar', tone: 'warning' },
  'revisar-plano': { label: 'Revisar plano de ação', tone: 'warning' },
  escalar: { label: 'Escalar', tone: 'danger' },
  encerrar: { label: 'Encerrar acompanhamento', tone: 'neutral' },
}

export const EFETIVIDADE: Record<Nr1Efetividade, { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }> = {
  'muito-efetiva': { label: 'Muito efetiva', tone: 'success' },
  'parcialmente-efetiva': { label: 'Parcialmente efetiva', tone: 'warning' },
  inefetiva: { label: 'Inefetiva', tone: 'danger' },
  'nao-avaliada': { label: 'Ainda não avaliada', tone: 'neutral' },
}

/** Ordem de gravidade dos níveis, para comparar "pelo menos tão grave quanto"
   sem repetir a lista em cada lugar que precisa disso (riscos sugeridos). */
const NIVEL_RANK: Record<Nr1NivelRisco, number> = { baixo: 0, atencao: 1, risco: 2, critico: 3 }

/** Nível atual é pelo menos tão grave quanto o gatilho? Usado pelos riscos
   sugeridos para decidir se uma leitura "pode se aplicar" — nunca decide
   sozinho que o risco existe, só que o padrão está no radar. */
export function nr1NivelAtingeGatilho(nivel: Nr1NivelRisco, gatilho: Nr1NivelRisco): boolean {
  return NIVEL_RANK[nivel] >= NIVEL_RANK[gatilho]
}

/* Limiar de variação (em pontos de média, escala 1–5) abaixo do qual duas
   leituras são tratadas como "estável" — ruído de amostragem, não uma
   direção real. Mesmo espírito do k-anonimato: nem todo número que muda é
   um sinal. */
const LIMIAR_TENDENCIA = 0.2

/** Níveis que contam como "grave" para fins de decisão — risco e crítico
   (não confundir com o mesmo tipo Nr1NivelRisco usado no mapa de calor). */
const NIVEIS_GRAVES: Nr1NivelRisco[] = ['risco', 'critico']

/** Compara o ciclo mais recente de um risco com o anterior e devolve
   tendência + sugestão de próxima ação — a lógica de decisão do módulo de
   evolução de riscos, isolada da UI para poder ser testada e reaproveitada
   (Visão geral, Inventário, Plano de ação).

   Importante: isto é uma SUGESTÃO calculada a partir de nível + tendência,
   nunca uma conclusão. "Este risco está sob controle" é leitura do SST; a
   plataforma só aponta "o nível é X, a direção é Y, considere Z". */
export function nr1AnalisarEvolucao(
  atual: { media: number; nivel: Nr1NivelRisco },
  anterior?: { media: number; nivel: Nr1NivelRisco },
): { tendencia?: Nr1Tendencia; variacaoPontos?: number; variacaoPercentual?: number; acaoRecomendada: Nr1AcaoRecomendada; status: Nr1RiscoStatus } {
  if (!anterior) {
    return { acaoRecomendada: 'manter-com-monitoramento', status: 'identificado' }
  }

  const variacaoPontos = Number((atual.media - anterior.media).toFixed(2))
  const variacaoPercentual = anterior.media !== 0 ? Number(((variacaoPontos / anterior.media) * 100).toFixed(1)) : 0

  /* No mapa de calor, média MAIOR é MELHOR (5 = situação desejável) — o
     oposto do produto probabilidade × severidade do GRO. Subir = melhorar. */
  let tendencia: Nr1Tendencia = 'estavel'
  if (variacaoPontos > LIMIAR_TENDENCIA) tendencia = 'melhorando'
  else if (variacaoPontos < -LIMIAR_TENDENCIA) tendencia = 'piorando'

  const atualGrave = NIVEIS_GRAVES.includes(atual.nivel)
  const anteriorGrave = NIVEIS_GRAVES.includes(anterior.nivel)

  let acaoRecomendada: Nr1AcaoRecomendada
  let status: Nr1RiscoStatus

  if (atualGrave) {
    if (!anteriorGrave) {
      // Piorou de atenção/baixo para risco/crítico — regressão franca.
      acaoRecomendada = 'escalar'
      status = 'regredido'
    } else if (tendencia === 'piorando') {
      acaoRecomendada = 'escalar'
      status = 'regredido'
    } else if (tendencia === 'estavel') {
      // Continua grave apesar do plano em curso — não é progresso.
      acaoRecomendada = 'revisar-plano'
      status = 'regredido'
    } else {
      // Melhorou, mas ainda não saiu da faixa grave.
      acaoRecomendada = 'revisar-plano'
      status = 'monitorando'
    }
  } else if (atual.nivel === 'atencao') {
    if (anteriorGrave && tendencia !== 'piorando') {
      acaoRecomendada = 'manter-com-monitoramento'
      status = 'controlado'
    } else if (tendencia === 'piorando') {
      acaoRecomendada = 'investigar'
      status = 'monitorando'
    } else {
      acaoRecomendada = 'manter'
      status = 'controlado'
    }
  } else {
    // baixo
    if (tendencia === 'piorando') {
      acaoRecomendada = 'investigar'
      status = 'monitorando'
    } else if (anteriorGrave) {
      // Só chega a "eliminado" quando a melhora veio de uma faixa grave.
      acaoRecomendada = 'encerrar'
      status = 'eliminado'
    } else {
      acaoRecomendada = 'manter-com-monitoramento'
      status = 'controlado'
    }
  }

  return { tendencia, variacaoPontos, variacaoPercentual, acaoRecomendada, status }
}

/** Monta a lista de `Nr1RiscoCiclo` de um risco a partir das suas médias em
   cada campanha (na ordem em que ocorreram), aplicando `nr1AnalisarEvolucao`
   entre cada par consecutivo. */
export function nr1MontarHistoricoRisco(
  riscoId: string,
  pontosPorCampanha: { campanhaId: string; media: number; nivel: Nr1NivelRisco }[],
): Nr1RiscoCiclo[] {
  return pontosPorCampanha.map((ponto, i) => {
    const anterior = pontosPorCampanha[i - 1]
    const analise = nr1AnalisarEvolucao(ponto, anterior)
    return { riscoId, campanhaId: ponto.campanhaId, media: ponto.media, nivel: ponto.nivel, ...analise }
  })
}

/** Hash determinístico [0, 1) — mesma string sempre gera o mesmo número.
   Não é `Math.random()`: a distribuição por pergunta precisa ser estável
   entre renders (e entre a visão da empresa e a de cada área), não mudar a
   cada clique. */
function hash01(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  /* Finalizador (fmix32 do MurmurHash3). Sem ele, strings quase idênticas
     que só diferem no fim — exatamente o nosso caso, mesmo prefixo de
     escopo, id do item variando só no último trecho — saem muito
     próximas umas das outras: o FNV-1a puro não espalha o suficiente
     numa única passada final de XOR+multiplicação. Isso gerava pontuações
     coladas (quase todo item com o mesmo valor) em vez de uma distribuição
     em torno da média. */
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}

/** Distribui uma pontuação por item de uma dimensão de forma determinística,
   com a média dos itens batendo com a média já publicada da dimensão (o
   card "Risco por dimensão" ou a célula do mapa de calor que a pessoa
   clicou) — não é um número novo, é a MESMA média, só olhada pergunta a
   pergunta.

   Por quê não "frequência × severidade": essa é a lógica do GRO
   (probabilidade × severidade), usada no Inventário de riscos para o PGR —
   uma classificação qualitativa que o RH atribui a um fator de risco já
   identificado. O questionário de avaliação psicossocial usa outra escala
   (`Nr1EscalaId`): frequência OU concordância, uma resposta por item,
   invertida quando `direcao === 'reverso'` e depois só somada/mediada — não
   há um eixo de "severidade" por pergunta neste instrumento. Aplicar
   frequência × severidade aqui misturaria dois métodos que o resto do
   módulo mantém deliberadamente separados (ver `nr1NivelPorMedia` vs.
   `nr1NivelPorProduto`). */
export function nr1DistribuirPorItem(itemIds: string[], media: number, seed: string): { itemId: string; media: number }[] {
  if (itemIds.length === 0) return []
  const SPREAD = 1.1
  const brutos = itemIds.map((id) => (hash01(`${seed}-${id}`) - 0.5) * SPREAD)
  const ajuste = brutos.reduce((s, v) => s + v, 0) / brutos.length
  return itemIds.map((id, i) => ({
    itemId: id,
    media: Math.min(5, Math.max(1, Number((media + (brutos[i]! - ajuste)).toFixed(1)))),
  }))
}

/** ISO (YYYY-MM-DD) → DD/MM/AAAA. Devolve o original se não for uma data. */
export function fmtData(iso: string): string {
  const [y, m, d] = iso.split('-')
  return y && m && d ? `${d}/${m}/${y}` : iso
}

/** Percentual inteiro protegido contra divisão por zero. */
export const pct = (parte: number, total: number): number =>
  total > 0 ? Math.round((parte / total) * 100) : 0

/** Dias entre duas datas ISO — positivo no futuro, negativo no passado, 0 no
   mesmo dia. Nunca usa `Date.now()`: quem chama passa a data de "hoje" do
   protótipo (`NR1_TODAY`, em `data/nr1Mock.ts`), para o contador nunca
   discordar do resto do app. Extraído do que já existia em
   `Nr1CicloStatusCard.tsx` — o Plano de ação precisa da mesma conta para o
   controle de vencimento das ações, não só para o prazo do ciclo. */
export function nr1DiasEntre(hojeIso: string, alvoIso: string): number {
  const hoje = new Date(`${hojeIso}T00:00:00`)
  const alvo = new Date(`${alvoIso}T00:00:00`)
  return Math.round((alvo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

/** A partir de quantos dias antes do prazo uma ação entra no alerta de
   "vencendo" — janela de atenção antes de virar atraso de fato. */
const LIMIAR_VENCENDO_DIAS = 7

export type Nr1UrgenciaPrazo = 'vencida' | 'vencendo' | 'no-prazo'

/** Urgência do prazo pela DATA (`quando` vs. hoje), independente do status
   manual (5W2H) da ação — um plano pode estar "em andamento" e mesmo assim
   já ter passado do prazo, ou estar "planejado" com o prazo já próximo. É
   essa leitura objetiva, não o status escolhido à mão, que alimenta o
   alerta visual de vencimento no Plano de ação. Ações concluídas não têm
   urgência de prazo — já não há o que vencer. */
export function nr1UrgenciaPrazo(diasRestantes: number): Nr1UrgenciaPrazo {
  if (diasRestantes < 0) return 'vencida'
  if (diasRestantes <= LIMIAR_VENCENDO_DIAS) return 'vencendo'
  return 'no-prazo'
}

export const URGENCIA_PRAZO: Record<Nr1UrgenciaPrazo, { label: string; cls: string; icon: string }> = {
  vencida: { label: 'Vencida', cls: 'bg-danger text-white', icon: 'ph:warning-bold' },
  vencendo: { label: 'Vencendo', cls: 'bg-warning/25 text-warning-ink', icon: 'ph:clock-countdown-bold' },
  'no-prazo': { label: 'No prazo', cls: 'bg-surface-2 text-ink-secondary', icon: 'ph:calendar-bold' },
}
