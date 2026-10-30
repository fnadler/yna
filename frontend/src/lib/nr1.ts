import type {
  Nr1NivelRisco, Nr1NivelMatriz, Nr1AcaoStatus, Nr1VersaoStatus, Nr1RelatoStatus, Nr1RelatoCategoria,
  Nr1RiscoStatus, Nr1AcaoRecomendada, Nr1Efetividade,
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
  atencao: { label: 'Médio', acao: 'Ação preventiva', cls: 'bg-warning/25 text-warning-ink', dot: 'bg-warning' },
  risco: { label: 'Alto', acao: 'Ação corretiva prioritária', cls: 'bg-danger/20 text-danger-ink', dot: 'bg-danger' },
  critico: { label: 'Crítico', acao: 'Ação imediata', cls: 'bg-critico text-white', dot: 'bg-critico' },
}

/** Nível do fator de risco (P × S), na matriz e em tudo que mostra o nível
   de um fator: lista de fatores, detalhe do risco, análise do domínio,
   detalhe da ação e Resumo para o PGR. Régua própria de 5 níveis
   (`Nr1NivelMatriz`) e paleta própria (`matriz-*`: escala de calor, do
   azul-céu ao carmim), separadas de `NIVEL_RISCO`, que fica só para a nota
   do questionário (mapa de calor, radar, evolução). */
export interface NivelMatrizStyle extends NivelStyle {
  /** Ação recomendada por extenso (relatório de avaliação / PGR). */
  recomendacao: string
  /** Texto por cima do preenchimento sólido (`dot`), ex.: o número da célula. */
  ink: string
  /** Caixa translúcida por cima do preenchimento (o número no detalhe). */
  caixa: string
}

export const NIVEL_MATRIZ: Record<Nr1NivelMatriz, NivelMatrizStyle> = {
  irrelevante: { label: 'Irrelevante', acao: 'Manter medidas existentes', recomendacao: 'Acompanhar e manter medidas preventivas existentes.', cls: 'bg-matriz-irrelevante text-matriz-irrelevante-ink', dot: 'bg-matriz-irrelevante', ink: 'text-matriz-irrelevante-ink', caixa: 'bg-white/55' },
  baixo: { label: 'Baixo', acao: 'Monitorar', recomendacao: 'Monitorar e avaliar oportunidades de melhoria.', cls: 'bg-matriz-baixo text-matriz-baixo-ink', dot: 'bg-matriz-baixo', ink: 'text-matriz-baixo-ink', caixa: 'bg-white/55' },
  moderado: { label: 'Moderado', acao: 'Monitoramento periódico', recomendacao: 'Requer monitoramento periódico e, quando necessário, plano de ação.', cls: 'bg-matriz-moderado text-matriz-moderado-ink', dot: 'bg-matriz-moderado', ink: 'text-matriz-moderado-ink', caixa: 'bg-white/55' },
  alto: { label: 'Alto', acao: 'Plano de ação obrigatório', recomendacao: 'Plano de ação obrigatório, com definição de medidas preventivas, responsáveis e prazos.', cls: 'bg-matriz-alto text-matriz-alto-ink', dot: 'bg-matriz-alto', ink: 'text-matriz-alto-ink', caixa: 'bg-white/15' },
  critico: { label: 'Crítico', acao: 'Ação imediata', recomendacao: 'Plano de ação obrigatório, com priorização de medidas imediatas de prevenção e controle, quando cabíveis.', cls: 'bg-matriz-critico text-matriz-critico-ink', dot: 'bg-matriz-critico', ink: 'text-matriz-critico-ink', caixa: 'bg-white/15' },
}

/** Os níveis da matriz, do menos ao mais grave (legenda, filtros). */
export const NR1_NIVEIS_MATRIZ: Nr1NivelMatriz[] = ['irrelevante', 'baixo', 'moderado', 'alto', 'critico']

/** Ícone de cada nível do fator — segunda pista além da cor, para o nível
   nunca depender só dela. */
export const ICONE_NIVEL_MATRIZ: Record<Nr1NivelMatriz, string> = {
  irrelevante: 'ph:check-circle-bold',
  baixo: 'ph:eye-bold',
  moderado: 'ph:shield-warning-bold',
  alto: 'ph:warning-bold',
  critico: 'ph:siren-bold',
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

/* Limiar de variação (em pontos de média, escala 1–5) abaixo do qual duas
   leituras são tratadas como "estável" — ruído de amostragem, não uma
   direção real. Mesmo espírito do k-anonimato: nem todo número que muda é
   um sinal. */
export const LIMIAR_TENDENCIA = 0.2

/** Rótulos da escala de probabilidade e de severidade (1–5) — os mesmos na
   matriz do Inventário, no catálogo de fatores e no detalhe do risco. */
export const NR1_PROBABILIDADE_ROTULOS = ['Muito baixa', 'Baixa', 'Média', 'Provável', 'Muito provável']
export const NR1_SEVERIDADE_ROTULOS = ['Insignificante', 'Leve', 'Relevante', 'Grave', 'Muito grave']

/** Leitura de cada nível de probabilidade (1–5): a parcela de
   trabalhadores expostos e o que ela significa — a escala do relatório de
   avaliação (modelo YNA, base COPSOQ II). */
export const NR1_PROBABILIDADE_ESCALA = [
  { interpretacao: '0% a 15%', descricao: 'Exposição pouco frequente ou restrita a uma parcela muito pequena dos trabalhadores.' },
  { interpretacao: 'Acima de 15% até 35%', descricao: 'Exposição limitada, identificada em uma parcela minoritária dos trabalhadores.' },
  { interpretacao: 'Acima de 35% até 60%', descricao: 'Exposição significativa, identificada em uma parcela relevante dos trabalhadores.' },
  { interpretacao: 'Acima de 60% até 80%', descricao: 'Exposição elevada, atingindo a maioria dos trabalhadores avaliados.' },
  { interpretacao: 'Acima de 80% até 100%', descricao: 'Exposição generalizada, identificada na grande maioria dos trabalhadores.' },
]

/** O que cada nível de severidade (1–5) representa em agravo à saúde. */
export const NR1_SEVERIDADE_DESCRICOES = [
  'Efeitos transitórios, sem comprometimento relevante.',
  'Alterações leves, reversíveis, com impacto limitado.',
  'Agravos com tratamento ou incapacidade temporária possível.',
  'Comprometimento funcional importante ou prolongado.',
  'Incapacidade permanente, risco à vida ou morte, quando plausível.',
]

/** Severidade (1–5) sem cor própria: o nível do fator já tem a sua (a
   matriz), e um segundo semáforo ao lado dele competiria com ela. A
   intensidade vai no medidor de 5 traços de `Nr1SeveridadeTag`. */
export const NR1_SEVERIDADE_CLS: Record<number, string> = {
  1: 'bg-surface-2 text-ink-secondary',
  2: 'bg-surface-2 text-ink-secondary',
  3: 'bg-surface-2 text-ink-secondary',
  4: 'bg-surface-2 text-ink-secondary',
  5: 'bg-surface-2 text-ink-secondary',
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
