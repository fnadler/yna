import { NR1_DIMENSOES, NR1_PONTUACAO, nr1NivelPorMedia } from '../data/nr1Mock'
import { rhDepartamentos } from '../data/rhMock'
import type { Nr1LinhaMapa } from '../types'

/* Simulador de densidade do mapa de calor — não é dado real, é uma
   ferramenta pra cliente e time validarem visualmente como a tela se
   comporta com outras quantidades de dimensão/área, sem esperar o modelo ou
   a base de departamentos mudarem de verdade. Ativado por `?dims=` e
   `?deps=` na URL da Visão geral do RH (ver NR1RhCockpit) — ausentes, a
   tela é exatamente a de sempre (8 dimensões reais × 6 áreas reais). */

export const NR1_SIM_MAX_DIMENSOES = 15
export const NR1_SIM_MAX_DEPARTAMENTOS = 15

const N_DIMENSOES_PADRAO = NR1_DIMENSOES.length
const N_DEPARTAMENTOS_PADRAO = rhDepartamentos.length

export type Nr1DimensaoMeta = (typeof NR1_DIMENSOES)[number]
export type Nr1DepartamentoSimulado = { id: string; nome: string; colaboradores: number }

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

/** Lê `dims`/`deps` de `URLSearchParams` — valor ausente, inválido ou ≤ 0
   cai no padrão real (8 × 6); valor válido é limitado a `NR1_SIM_MAX_*`. */
export function lerSimulacaoDaUrl(params: URLSearchParams): { nDimensoes: number; nDepartamentos: number } {
  const dimsRaw = Number(params.get('dims'))
  const depsRaw = Number(params.get('deps'))
  const nDimensoes = Number.isFinite(dimsRaw) && dimsRaw > 0 ? clamp(Math.round(dimsRaw), 1, NR1_SIM_MAX_DIMENSOES) : N_DIMENSOES_PADRAO
  const nDepartamentos = Number.isFinite(depsRaw) && depsRaw > 0 ? clamp(Math.round(depsRaw), 1, NR1_SIM_MAX_DEPARTAMENTOS) : N_DEPARTAMENTOS_PADRAO
  return { nDimensoes, nDepartamentos }
}

export const nr1SimulacaoEhPadrao = (nDimensoes: number, nDepartamentos: number) =>
  nDimensoes === N_DIMENSOES_PADRAO && nDepartamentos === N_DEPARTAMENTOS_PADRAO

/** Determinístico (mesmo par dimensão/área sempre cai na mesma nota) — não
   precisa ser aleatório de verdade, só estável entre re-renders, pra não
   repintar a grade sozinha. */
function notaDeterministica(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  const fracao = x - Math.floor(x)
  return Number((1.8 + fracao * 2.8).toFixed(1)) // 1.8–4.6, cobre atenção/risco/baixo
}

/** Recorta as `n` primeiras dimensões reais (n ≤ 8) ou estende com
   dimensões claramente marcadas como simuladas (n > 8) — nunca inventa
   conteúdo que passe por uma dimensão real do modelo. */
export function nr1DimensoesParaSimulacao(n: number): Nr1DimensaoMeta[] {
  if (n <= N_DIMENSOES_PADRAO) return NR1_DIMENSOES.slice(0, n)
  const extras: Nr1DimensaoMeta[] = Array.from({ length: n - N_DIMENSOES_PADRAO }, (_, i) => {
    const num = N_DIMENSOES_PADRAO + i + 1
    return {
      id: `sim-dim-${num}`,
      nome: `Dimensão simulada ${num}`,
      curto: `Simulada ${num}`,
      descricao: 'Dimensão fictícia, só para simular a densidade da tela.',
      icon: 'ph:squares-four-bold',
    }
  })
  return [...NR1_DIMENSOES, ...extras]
}

/** Mesma lógica para áreas: recorta as `n` primeiras reais (mantendo a
   Diretoria, que sempre exercita a proteção por k-anonimato) ou estende com
   áreas simuladas de time "normal" (nunca abaixo do k). */
export function nr1DepartamentosParaSimulacao(n: number): Nr1DepartamentoSimulado[] {
  if (n <= N_DEPARTAMENTOS_PADRAO) return rhDepartamentos.slice(0, n)
  const extras: Nr1DepartamentoSimulado[] = Array.from({ length: n - N_DEPARTAMENTOS_PADRAO }, (_, i) => {
    const num = N_DEPARTAMENTOS_PADRAO + i + 1
    return { id: `sim-dep-${num}`, nome: `Departamento simulado ${num}`, colaboradores: 20 }
  })
  return [...rhDepartamentos, ...extras]
}

/** Mapa de calor fictício do tamanho pedido — respeita o mesmo corte de
   anonimato (`NR1_PONTUACAO.kAnonimato`) que o mapa real, pra continuar
   demonstrando essa regra mesmo em simulação (ex.: a Diretoria, com 3
   colaboradores, some/protege igual ao mapa de verdade). */
export function nr1MapaCalorSimulado(dimensoes: Nr1DimensaoMeta[], departamentos: Nr1DepartamentoSimulado[]): Nr1LinhaMapa[] {
  return departamentos.map((d, di) => {
    const protegido = d.colaboradores < NR1_PONTUACAO.kAnonimato
    return {
      departamentoId: d.id,
      departamento: d.nome,
      respondentes: d.colaboradores,
      protegido,
      celulas: dimensoes.map((dim, ci) => {
        if (protegido) return { dimensaoId: dim.id, media: null, nivel: null }
        const media = notaDeterministica(di * 97 + ci * 13 + 1)
        return { dimensaoId: dim.id, media, nivel: nr1NivelPorMedia(media) }
      }),
    }
  })
}

/** Média por dimensão (macro) a partir do mesmo mapa simulado — mesmo
   cálculo do serviço real (`nr1ResultadoService.mediaPorDimensao`): média
   das áreas não protegidas, célula a célula. */
export function nr1MediaPorDimensaoSimulada(dimensoes: Nr1DimensaoMeta[], linhas: Nr1LinhaMapa[]) {
  const naoProtegidas = linhas.filter((l) => !l.protegido)
  return dimensoes.map((dim, i) => {
    const vals = naoProtegidas.map((l) => l.celulas[i]!.media!)
    const media = Number((vals.reduce((s, v) => s + v, 0) / (vals.length || 1)).toFixed(1))
    return { dimensaoId: dim.id, nome: dim.nome, media, nivel: nr1NivelPorMedia(media) }
  })
}
