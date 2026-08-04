import type { Nr1NivelRisco, Nr1AcaoStatus, Nr1VersaoStatus, Nr1RelatoStatus, Nr1RelatoCategoria } from '../types'

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

/** ISO (YYYY-MM-DD) → DD/MM/AAAA. Devolve o original se não for uma data. */
export function fmtData(iso: string): string {
  const [y, m, d] = iso.split('-')
  return y && m && d ? `${d}/${m}/${y}` : iso
}

/** Percentual inteiro protegido contra divisão por zero. */
export const pct = (parte: number, total: number): number =>
  total > 0 ? Math.round((parte / total) * 100) : 0
