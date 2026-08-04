import type {
  Nr1QuestionarioModelo, Nr1QuestionarioVersao, Nr1Dimensao, Nr1Item, Nr1DimensaoId,
  Nr1EscalaConfig, Nr1PontuacaoConfig, Nr1NivelRisco, Nr1Campanha, Nr1LinhaMapa,
  Nr1RiscoInventario, Nr1Acao, Nr1Relato, Nr1Ciclo, Nr1ResponsavelTecnico,
  Nr1MinhaAvaliacao, Nr1KitMaterial, Nr1Severidade,
} from '../types'
import { rhDepartamentos, rhEmpresa } from './rhMock'

/* Dados mockados do Módulo de Conformidade NR-1.

   O conteúdo-semente do Modelo YNA (dimensões, itens, escalas, cortes e o
   núcleo obrigatório) vem de "YNA — Questionário de Riscos Psicossociais v0.3",
   ainda um RASCUNHO pendente de validação clínica e adaptação transcultural.
   Ver as pendências listadas no README. */

export const NR1_TODAY = '2026-06-25'

/* ------------------------------------------------------------------
   Dimensões, escalas e pontuação
   ------------------------------------------------------------------ */

/** `curto` é usado onde não cabe o nome inteiro — eixos do radar, chips. */
export const NR1_DIMENSOES: { id: Nr1DimensaoId; nome: string; curto: string; descricao: string; icon: string }[] = [
  { id: 'organizacao', nome: 'Organização do trabalho', curto: 'Organização', descricao: 'Carga, ritmo, autonomia, clareza de papel e mudanças.', icon: 'ph:stack-bold' },
  { id: 'relacoes', nome: 'Relações e liderança', curto: 'Relações', descricao: 'Apoio da liderança e dos pares, respeito e conflito.', icon: 'ph:users-three-bold' },
  { id: 'ambiente', nome: 'Ambiente e recursos', curto: 'Ambiente', descricao: 'Recursos, ferramentas, condições físicas e informação.', icon: 'ph:buildings-bold' },
  { id: 'contexto', nome: 'Contexto externo', curto: 'Contexto', descricao: 'Interface trabalho-vida, hiperconexão e contato com público.', icon: 'ph:globe-hemisphere-west-bold' },
]

export const nr1DimensaoNome = (id: Nr1DimensaoId) =>
  NR1_DIMENSOES.find((d) => d.id === id)?.nome ?? id

/** Escalas de 5 pontos (§3 do questionário). A escala A é de frequência e a B
   de concordância — unificá-las é uma das decisões pendentes da clínica. */
export const NR1_ESCALAS: Nr1EscalaConfig = {
  A: {
    nome: 'Frequência',
    opcoes: [
      { valor: 1, rotulo: 'Nunca' },
      { valor: 2, rotulo: 'Raramente' },
      { valor: 3, rotulo: 'Às vezes' },
      { valor: 4, rotulo: 'Frequentemente' },
      { valor: 5, rotulo: 'Sempre' },
    ],
  },
  B: {
    nome: 'Concordância',
    opcoes: [
      { valor: 1, rotulo: 'Discordo totalmente' },
      { valor: 2, rotulo: 'Discordo' },
      { valor: 3, rotulo: 'Neutro' },
      { valor: 4, rotulo: 'Concordo' },
      { valor: 5, rotulo: 'Concordo totalmente' },
    ],
  },
}

/** Cortes propostos no questionário v0.3 (§7) — pendentes de validação de SST.
   k = 4 respondentes: nenhum recorte menor é exibido ao RH. */
export const NR1_PONTUACAO: Nr1PontuacaoConfig = {
  kAnonimato: 4,
  faixas: [
    { min: 4.0, max: 5.0, nivel: 'baixo', label: 'Baixo', acao: 'Monitorar' },
    { min: 3.0, max: 3.9, nivel: 'atencao', label: 'Atenção', acao: 'Ação preventiva' },
    { min: 2.0, max: 2.9, nivel: 'risco', label: 'Risco', acao: 'Ação corretiva prioritária' },
    { min: 1.0, max: 1.9, nivel: 'critico', label: 'Crítico', acao: 'Ação imediata' },
  ],
}

/** Traduz a média da dimensão (1–5) para o nível de risco. */
export function nr1NivelPorMedia(media: number): Nr1NivelRisco {
  if (media >= 4) return 'baixo'
  if (media >= 3) return 'atencao'
  if (media >= 2) return 'risco'
  return 'critico'
}

/* ------------------------------------------------------------------
   Itens do Modelo YNA — versão base (§4 do questionário)
   34 itens · 10 marcados como núcleo obrigatório.
   ------------------------------------------------------------------ */

type ItemSeed = [id: string, texto: string, referencia: string, escala: 'A' | 'B', direcao: 'positivo' | 'reverso', nucleo: boolean, extra?: { condicional?: boolean; sensivel?: boolean }]

const item = ([id, texto, referencia, escala, direcao, nucleo, extra]: ItemSeed): Nr1Item => ({
  id, texto, referencia, escala, direcao,
  tipoCampo: 'select',
  obrigatorioNucleo: nucleo,
  ...extra,
})

const ORGANIZACAO: ItemSeed[] = [
  ['OT01', 'Preciso trabalhar em um ritmo muito acelerado.', 'HSE · Demandas', 'A', 'reverso', true],
  ['OT02', 'Tenho prazos que são impossíveis de cumprir.', 'HSE · Demandas', 'A', 'reverso', false],
  ['OT03', 'Preciso deixar tarefas de lado porque tenho trabalho demais.', 'HSE · Demandas', 'A', 'reverso', false],
  ['OT04', 'Sinto-me pressionado(a) a trabalhar muitas horas.', 'HSE · Demandas', 'A', 'reverso', false],
  ['OT05', 'Consigo fazer pausas suficientes durante o expediente.', 'HSE · Demandas', 'A', 'positivo', false],
  ['OT06', 'Tenho autonomia para decidir como realizar o meu trabalho.', 'HSE · Controle', 'A', 'positivo', true],
  ['OT07', 'Tenho influência sobre o meu próprio ritmo de trabalho.', 'HSE · Controle', 'A', 'positivo', false],
  ['OT08', 'Posso decidir quando fazer uma pausa.', 'HSE · Controle', 'A', 'positivo', false],
  ['OT09', 'Meu horário de trabalho pode ser flexível quando eu preciso.', 'HSE · Controle', 'B', 'positivo', false],
  ['OT10', 'Tenho clareza do que é esperado de mim no trabalho.', 'HSE · Papel', 'A', 'positivo', true],
  ['OT11', 'Sei quais são as minhas funções e responsabilidades.', 'HSE · Papel', 'A', 'positivo', false],
  ['OT12', 'Entendo como o meu trabalho se conecta ao objetivo da organização.', 'HSE · Papel', 'A', 'positivo', false],
  ['OT13', 'Quando há mudanças no trabalho, fica claro como elas vão funcionar na prática.', 'HSE · Mudança', 'B', 'positivo', false],
  ['OT14', 'Tenho oportunidade de esclarecer dúvidas com a liderança sobre mudanças no trabalho.', 'HSE · Mudança', 'B', 'positivo', false],
]

const RELACOES: ItemSeed[] = [
  ['RL01', 'Posso contar com a minha liderança para me ajudar em um problema de trabalho.', 'HSE · Apoio da liderança', 'A', 'positivo', true],
  ['RL02', 'Recebo retorno construtivo sobre o trabalho que faço.', 'HSE · Apoio da liderança', 'A', 'positivo', false],
  ['RL03', 'Minha liderança me incentiva no trabalho.', 'HSE · Apoio da liderança', 'B', 'positivo', false],
  ['RL04', 'Sinto-me apoiado(a) quando o trabalho é emocionalmente exigente.', 'HSE · Apoio da liderança', 'B', 'positivo', false],
  ['RL05', 'Quando o trabalho fica difícil, meus colegas me ajudam.', 'HSE · Apoio dos pares', 'A', 'positivo', true],
  ['RL06', 'Recebo dos colegas o apoio de que preciso.', 'HSE · Apoio dos pares', 'B', 'positivo', false],
  ['RL07', 'Recebo dos colegas o respeito que mereço.', 'HSE · Relações', 'B', 'positivo', false],
  ['RL08', 'Há atritos ou raiva entre colegas.', 'HSE · Relações', 'A', 'reverso', true],
  ['RL09', 'As relações no trabalho são tensas.', 'HSE · Relações', 'B', 'reverso', false],
  ['RL10', 'Sou alvo de palavras ou comportamentos hostis no trabalho (assédio moral).', 'HSE · Relações', 'A', 'reverso', false, { sensivel: true }],
  ['RL11', 'Sou alvo de intimidação ou bullying no trabalho.', 'HSE · Relações', 'A', 'reverso', false, { sensivel: true }],
]

const AMBIENTE: ItemSeed[] = [
  ['AR01', 'Tenho os recursos e as ferramentas necessários para fazer bem o meu trabalho.', 'COPSOQ · Recursos', 'B', 'positivo', true],
  ['AR02', 'As condições físicas do ambiente (espaço, ruído, conforto) permitem que eu trabalhe adequadamente.', 'MTE · Ambiente', 'B', 'positivo', true],
  ['AR03', 'Os sistemas e tecnologias que uso funcionam de forma confiável.', 'MTE · Recursos', 'B', 'positivo', false],
  ['AR04', 'Tenho as informações de que preciso para realizar bem o meu trabalho.', 'COPSOQ · Previsibilidade', 'B', 'positivo', false],
]

const CONTEXTO: ItemSeed[] = [
  ['CE01', 'As exigências do trabalho interferem na minha vida pessoal e familiar.', 'COPSOQ · Trabalho-família', 'A', 'reverso', true],
  ['CE02', 'Sinto que preciso ficar disponível para o trabalho fora do meu horário.', 'MTE · Hiperconexão', 'A', 'reverso', true],
  ['CE03', 'Consigo me desconectar do trabalho no meu tempo de descanso.', 'MTE · Hiperconexão', 'A', 'positivo', false],
  ['CE04', 'No trabalho remoto ou híbrido, sinto-me isolado(a) da equipe.', 'MTE · Isolamento', 'A', 'reverso', false, { condicional: true }],
  ['CE05', 'No contato com público ou clientes, lido com situações de agressividade ou tensão.', 'MTE · Contexto', 'A', 'reverso', false, { condicional: true }],
]

function dimensao(id: Nr1DimensaoId, seeds: ItemSeed[]): Nr1Dimensao {
  const meta = NR1_DIMENSOES.find((d) => d.id === id)!
  return { id, nome: meta.nome, descricao: meta.descricao, itens: seeds.map(item) }
}

/** Dimensões do Modelo YNA base — recriadas a cada chamada para que uma versão
   rascunho editada não mute a versão publicada (imutabilidade — RF-A04). */
export const nr1DimensoesBase = (): Nr1Dimensao[] => [
  dimensao('organizacao', ORGANIZACAO),
  dimensao('relacoes', RELACOES),
  dimensao('ambiente', AMBIENTE),
  dimensao('contexto', CONTEXTO),
]

const ABERTAS_BASE = [
  'Há algo no seu trabalho que tem pesado na sua saúde emocional e que você gostaria de registrar?',
  'O que mais ajudaria a melhorar o seu bem-estar no trabalho?',
]

/* ------------------------------------------------------------------
   Modelos e versões
   ------------------------------------------------------------------ */

const versaoYna = (versao: string, status: Nr1QuestionarioVersao['status'], criadaEm: string, publicadaEm: string | undefined, notas: string): Nr1QuestionarioVersao => ({
  versao, status, criadaEm, publicadaEm, notas,
  dimensoes: nr1DimensoesBase(),
  escala: NR1_ESCALAS,
  pontuacao: NR1_PONTUACAO,
  abertas: [...ABERTAS_BASE],
})

/** Versão 1.0 — recorte inicial só com o núcleo (usada no piloto). */
function versaoNucleoApenas(): Nr1QuestionarioVersao {
  const v = versaoYna('1.0', 'arquivada', '2026-02-10', '2026-02-17', 'Primeira publicação — apenas o núcleo obrigatório (11 itens), usada no piloto.')
  v.dimensoes = v.dimensoes.map((d) => ({ ...d, itens: d.itens.filter((i) => i.obrigatorioNucleo) }))
  return v
}

/** Itens específicos do modelo derivado da BCP Securities (acrescentados —
   o núcleo permanece intacto). */
const ITENS_BCP: Record<string, Nr1Item[]> = {
  organizacao: [
    { id: 'BCP-OT01', texto: 'Consigo conciliar as demandas da mesa com os prazos regulatórios.', referencia: 'BCP Securities · específico', escala: 'A', direcao: 'positivo', tipoCampo: 'select', obrigatorioNucleo: false, origemCliente: true },
  ],
  contexto: [
    { id: 'BCP-CE01', texto: 'A volatilidade do mercado afeta o meu descanso fora do expediente.', referencia: 'BCP Securities · específico', escala: 'A', direcao: 'reverso', tipoCampo: 'select', obrigatorioNucleo: false, origemCliente: true },
  ],
}

function versaoCliente(): Nr1QuestionarioVersao {
  const v = versaoYna('1.0', 'publicada', '2026-05-20', '2026-05-28', 'Derivada da versão 2.0 do Modelo YNA, com 2 itens específicos da operação de mesa.')
  v.dimensoes = v.dimensoes.map((d) => ({ ...d, itens: [...d.itens, ...(ITENS_BCP[d.id] ?? [])] }))
  return v
}

export const nr1Modelos: Nr1QuestionarioModelo[] = [
  {
    id: 'mod-yna',
    nome: 'Modelo YNA — Riscos Psicossociais',
    escopo: 'yna',
    descricao: 'Instrumento base da plataforma, mantido e revisado pela YNA. Cobre as 4 dimensões do Guia do MTE a partir do HSE Indicator Tool e do COPSOQ.',
    versoes: [
      versaoYna('2.1', 'rascunho', '2026-06-18', undefined, 'Em elaboração: revisão de redação dos itens de Mudança (OT13/OT14) após retorno da curadoria clínica.'),
      versaoYna('2.0', 'publicada', '2026-04-02', '2026-04-15', 'Instrumento completo (34 itens). Inclui itens de Ambiente e recursos e os condicionais de contexto externo (CE04/CE05).'),
      versaoNucleoApenas(),
    ],
  },
  {
    id: 'mod-bcp',
    nome: 'BCP Securities — Riscos Psicossociais',
    escopo: 'cliente',
    clienteId: 'e-bcp',
    clienteNome: rhEmpresa.nomeFantasia,
    descricao: 'Modelo derivado do Modelo YNA 2.0, com itens específicos da operação de mesa. O núcleo obrigatório permanece intacto.',
    derivadoDe: { modeloId: 'mod-yna', versao: '2.0' },
    versoes: [versaoCliente()],
  },
]

/* ------------------------------------------------------------------
   Campanha em campo + histórico de ciclos
   ------------------------------------------------------------------ */

/** Participação por departamento. A Diretoria (3 pessoas) fica sempre abaixo
   do k — serve para exercitar a proteção de anonimato nas telas. */
const PARTICIPACAO: { id: string; respostas: number }[] = [
  { id: 'd-trading', respostas: 41 },
  { id: 'd-tech', respostas: 39 },
  { id: 'd-ops', respostas: 28 },
  { id: 'd-compliance', respostas: 15 },
  { id: 'd-rh', respostas: 7 },
  { id: 'd-diretoria', respostas: 2 },
]

const participacaoAreas = () =>
  rhDepartamentos.map((d) => ({
    departamentoId: d.id,
    departamento: d.nome,
    elegiveis: d.beneficiarios,
    respostas: PARTICIPACAO.find((p) => p.id === d.id)?.respostas ?? 0,
  }))

const totalRespostas = PARTICIPACAO.reduce((s, p) => s + p.respostas, 0)
const totalElegiveis = rhDepartamentos.reduce((s, d) => s + d.beneficiarios, 0)

export const nr1Campanhas: Nr1Campanha[] = [
  {
    id: 'camp-2026-1s',
    nome: 'Avaliação de riscos psicossociais · 1º semestre 2026',
    protocolo: 'NR1-BCP-2026-001',
    status: 'em-campo',
    modeloId: 'mod-bcp',
    modeloNome: 'BCP Securities — Riscos Psicossociais',
    versao: '1.0',
    inicio: '2026-06-08',
    fim: '2026-06-30',
    elegiveis: totalElegiveis,
    respostas: totalRespostas,
    participacao: participacaoAreas(),
    criadaEm: '2026-06-02',
  },
  {
    id: 'camp-2025-2s',
    nome: 'Avaliação de riscos psicossociais · 2º semestre 2025',
    protocolo: 'NR1-BCP-2025-002',
    status: 'encerrada',
    modeloId: 'mod-yna',
    modeloNome: 'Modelo YNA — Riscos Psicossociais',
    versao: '1.0',
    inicio: '2025-11-03',
    fim: '2025-11-28',
    elegiveis: 168,
    respostas: 104,
    participacao: participacaoAreas().map((p) => ({ ...p, respostas: Math.round(p.respostas * 0.78) })),
    criadaEm: '2025-10-27',
    encerradaEm: '2025-12-05',
  },
]

/* ------------------------------------------------------------------
   Mapa de calor — média por dimensão × área
   ------------------------------------------------------------------ */

/** Médias por departamento na ordem de NR1_DIMENSOES. */
const MEDIAS: Record<string, number[]> = {
  'd-trading': [2.1, 2.6, 3.8, 2.4],
  'd-tech': [3.1, 3.6, 3.4, 2.9],
  'd-ops': [2.7, 3.2, 2.8, 3.3],
  'd-compliance': [3.4, 3.9, 4.1, 3.6],
  'd-rh': [3.8, 4.2, 4.0, 3.9],
  'd-diretoria': [0, 0, 0, 0],
}

export const nr1MapaCalor = (): Nr1LinhaMapa[] =>
  rhDepartamentos.map((d) => {
    const respondentes = PARTICIPACAO.find((p) => p.id === d.id)?.respostas ?? 0
    const protegido = respondentes < NR1_PONTUACAO.kAnonimato
    return {
      departamentoId: d.id,
      departamento: d.nome,
      respondentes,
      protegido,
      celulas: NR1_DIMENSOES.map((dim, i) => {
        const media = MEDIAS[d.id]?.[i] ?? 0
        return protegido
          ? { dimensaoId: dim.id, media: null, nivel: null }
          : { dimensaoId: dim.id, media, nivel: nr1NivelPorMedia(media) }
      }),
    }
  })

/* ------------------------------------------------------------------
   Inventário de riscos para o PGR (RF-D01)
   ------------------------------------------------------------------ */

type RiscoSeed = {
  id: string; dimensaoId: Nr1DimensaoId; departamentoId: string
  fator: string; danos: string; probabilidade: number; severidade: Nr1Severidade
  controles: string[]
}

const RISCOS: RiscoSeed[] = [
  {
    id: 'r-01', dimensaoId: 'organizacao', departamentoId: 'd-trading',
    fator: 'Ritmo de trabalho acelerado e prazos incompatíveis com a jornada, com baixa possibilidade de pausa durante o pregão.',
    danos: 'Fadiga crônica, esgotamento profissional (burnout), transtornos de ansiedade, erros operacionais por sobrecarga cognitiva.',
    probabilidade: 4, severidade: 4,
    controles: [
      'Revisar o dimensionamento da equipe de mesa nos horários de pico.',
      'Instituir janela de pausa obrigatória escalonada durante o pregão.',
      'Revisar metas e prazos com a liderança da área.',
    ],
  },
  {
    id: 'r-02', dimensaoId: 'contexto', departamentoId: 'd-trading',
    fator: 'Hiperconectividade: expectativa de disponibilidade fora do horário de trabalho em função da volatilidade de mercado.',
    danos: 'Privação de sono, dificuldade de recuperação, conflito trabalho-família, adoecimento mental.',
    probabilidade: 4, severidade: 3,
    controles: [
      'Publicar política de desconexão com regras claras por área.',
      'Definir escala formal de sobreaviso, com compensação.',
      'Silenciar canais corporativos fora da janela acordada.',
    ],
  },
  {
    id: 'r-03', dimensaoId: 'relacoes', departamentoId: 'd-trading',
    fator: 'Tensão nas relações interpessoais e episódios de atrito recorrentes entre pares na operação.',
    danos: 'Sofrimento psíquico, isolamento, absenteísmo, agravamento de quadros de ansiedade.',
    probabilidade: 3, severidade: 4,
    controles: [
      'Capacitar a liderança em mediação de conflito e comunicação não violenta.',
      'Divulgar o canal de escuta confidencial a toda a área.',
      'Acompanhar o indicador de relações no próximo ciclo.',
    ],
  },
  {
    id: 'r-04', dimensaoId: 'contexto', departamentoId: 'd-tech',
    fator: 'Isolamento percebido no trabalho remoto e híbrido, com baixa conexão com a equipe.',
    danos: 'Solidão, queda de engajamento, sintomas depressivos.',
    probabilidade: 3, severidade: 3,
    controles: [
      'Estabelecer ritual semanal presencial ou síncrono por squad.',
      'Formalizar rotina de 1:1 quinzenal com a liderança.',
    ],
  },
  {
    id: 'r-05', dimensaoId: 'ambiente', departamentoId: 'd-ops',
    fator: 'Instabilidade dos sistemas e insuficiência de recursos para a execução do trabalho.',
    danos: 'Frustração, estresse ocupacional, retrabalho e prolongamento de jornada.',
    probabilidade: 3, severidade: 2,
    controles: [
      'Priorizar no roadmap de TI as falhas apontadas pela operação.',
      'Criar canal rápido de reporte de indisponibilidade.',
    ],
  },
  {
    id: 'r-06', dimensaoId: 'organizacao', departamentoId: 'd-ops',
    fator: 'Falta de clareza de papéis e responsabilidades após a reestruturação da área.',
    danos: 'Insegurança, conflito de demandas, sobrecarga percebida.',
    probabilidade: 3, severidade: 2,
    controles: [
      'Republicar o desenho de papéis e responsabilidades da área.',
      'Realizar sessão de alinhamento com todas as células.',
    ],
  },
]

export const nr1Inventario = (): Nr1RiscoInventario[] =>
  RISCOS.map((r) => {
    const dep = rhDepartamentos.find((d) => d.id === r.departamentoId)
    const nivelNum = r.probabilidade * r.severidade
    return {
      ...r,
      dimensao: nr1DimensaoNome(r.dimensaoId),
      grupoExposto: dep?.nome ?? r.departamentoId,
      respondentes: PARTICIPACAO.find((p) => p.id === r.departamentoId)?.respostas ?? 0,
      nivelNum,
      nivel: nr1NivelPorProduto(nivelNum),
      campanhaId: 'camp-2026-1s',
    }
  })

/** Classificação do risco pelo produto probabilidade × severidade (1–25),
   coerente com a lógica do GRO. Cálculo simples e transparente — pendente de
   revisão de SST. */
export function nr1NivelPorProduto(n: number): Nr1NivelRisco {
  if (n >= 15) return 'critico'
  if (n >= 9) return 'risco'
  if (n >= 4) return 'atencao'
  return 'baixo'
}

/* ------------------------------------------------------------------
   Plano de ação 5W2H (RF-E01/E02)
   ------------------------------------------------------------------ */

export const nr1Acoes: Nr1Acao[] = [
  {
    id: 'a-01', riscoId: 'r-01',
    oQue: 'Instituir janela de pausa obrigatória escalonada durante o pregão',
    porQue: 'Reduzir a exposição ao ritmo acelerado sem pausa, principal fator de risco da mesa.',
    quem: 'Ricardo Alencar · Head de Trading',
    quando: '2026-07-31', onde: 'Trading & Mercados',
    como: 'Escala de revezamento em dois blocos de 20 minutos, com cobertura cruzada entre duplas.',
    quanto: 'Sem custo direto — reorganização de escala',
    status: 'em-andamento',
    evidencias: [{ id: 'ev-01', nome: 'escala-revezamento-pregao-jul26.pdf', em: '2026-06-19' }],
  },
  {
    id: 'a-02', riscoId: 'r-01',
    oQue: 'Revisar o dimensionamento da equipe nos horários de pico',
    porQue: 'A carga concentrada excede a capacidade da equipe atual.',
    quem: 'Camila Risi · DHO',
    quando: '2026-08-15', onde: 'Trading & Mercados',
    como: 'Estudo de carga por faixa horária e proposta de duas contratações.',
    quanto: 'R$ 28.000/mês (estimativa)',
    status: 'planejada',
    evidencias: [],
  },
  {
    id: 'a-03', riscoId: 'r-02',
    oQue: 'Publicar política de desconexão com regras por área',
    porQue: 'Formalizar o limite de disponibilidade fora do horário e reduzir a hiperconexão.',
    quem: 'Camila Risi · DHO',
    quando: '2026-06-20', onde: 'Toda a empresa',
    como: 'Política aprovada pelo jurídico, comunicada por e-mail e treinamento de liderança.',
    quanto: 'Sem custo direto',
    status: 'atrasada',
    evidencias: [],
  },
  {
    id: 'a-04', riscoId: 'r-03',
    oQue: 'Capacitar a liderança em mediação de conflito',
    porQue: 'Atritos recorrentes entre pares exigem preparo da liderança direta.',
    quem: 'Paula Mendes · Desenvolvimento',
    quando: '2026-09-30', onde: 'Trading & Mercados',
    como: 'Trilha de 3 encontros com facilitação externa.',
    quanto: 'R$ 18.500',
    status: 'planejada',
    evidencias: [],
  },
  {
    id: 'a-05', riscoId: 'r-04',
    oQue: 'Formalizar rotina de 1:1 quinzenal com a liderança',
    porQue: 'Reduzir o isolamento percebido no trabalho remoto.',
    quem: 'Marcos Tavares · Head de Tecnologia',
    quando: '2026-06-15', onde: 'Tecnologia',
    como: 'Agenda recorrente com pauta mínima e registro de acordos.',
    quanto: 'Sem custo direto',
    status: 'concluida',
    concluidaEm: '2026-06-12',
    evidencias: [
      { id: 'ev-02', nome: 'modelo-pauta-1a1.pdf', em: '2026-06-10' },
      { id: 'ev-03', nome: 'print-agendas-recorrentes.png', em: '2026-06-12' },
    ],
  },
  {
    id: 'a-06', riscoId: 'r-05',
    oQue: 'Priorizar no roadmap de TI as falhas apontadas pela operação',
    porQue: 'A instabilidade dos sistemas prolonga a jornada e gera retrabalho.',
    quem: 'Marcos Tavares · Head de Tecnologia',
    quando: '2026-07-15', onde: 'Operações',
    como: 'Bloco fixo de capacidade por sprint para estabilidade.',
    quanto: 'Realocação de 15% da capacidade do time',
    status: 'em-andamento',
    evidencias: [],
  },
]

/* ------------------------------------------------------------------
   Canal de escuta confidencial (RF-H01/H02)
   ------------------------------------------------------------------ */

export const nr1Relatos: Nr1Relato[] = [
  {
    id: 'rel-01', protocolo: 'ESC-2026-0031', categoria: 'assedio-moral',
    descricao: 'Exposição repetida em reuniões de equipe, com comentários sobre desempenho feitos na frente de todos. Acontece há cerca de três meses.',
    departamento: 'Trading & Mercados',
    abertoEm: '2026-06-18', prazoEm: '2026-07-02', status: 'em-apuracao',
    andamentos: [
      { id: 'an-01', em: '2026-06-18', texto: 'Relato recebido pelo canal confidencial. Protocolo gerado e triagem inicial realizada.', autor: 'Canal de escuta' },
      { id: 'an-02', em: '2026-06-20', texto: 'Apuração iniciada com apoio do comitê de ética. Sigilo da autoria preservado.', autor: 'Camila Risi · DHO' },
    ],
  },
  {
    id: 'rel-02', protocolo: 'ESC-2026-0030', categoria: 'sobrecarga',
    descricao: 'Volume de demandas incompatível com o prazo, com jornada estendida quase todos os dias no fechamento do mês.',
    departamento: 'Operações',
    abertoEm: '2026-06-11', prazoEm: '2026-06-25', status: 'em-apuracao',
    andamentos: [
      { id: 'an-03', em: '2026-06-11', texto: 'Relato recebido. Encaminhado para análise junto ao plano de ação da área.', autor: 'Canal de escuta' },
    ],
  },
  {
    id: 'rel-03', protocolo: 'ESC-2026-0028', categoria: 'conflito',
    descricao: 'Divergências frequentes entre duas células da área, com reflexo no clima e na divisão de tarefas.',
    departamento: 'Tecnologia',
    abertoEm: '2026-05-22', prazoEm: '2026-06-05', status: 'concluido',
    andamentos: [
      { id: 'an-04', em: '2026-05-22', texto: 'Relato recebido pelo canal confidencial.', autor: 'Canal de escuta' },
      { id: 'an-05', em: '2026-05-29', texto: 'Mediação conduzida com as lideranças envolvidas.', autor: 'Paula Mendes · Desenvolvimento' },
      { id: 'an-06', em: '2026-06-04', texto: 'Acordo de convivência registrado. Caso encerrado com acompanhamento no próximo ciclo.', autor: 'Camila Risi · DHO' },
    ],
  },
  {
    id: 'rel-04', protocolo: 'ESC-2026-0033', categoria: 'outro',
    descricao: 'Sugestão sobre a organização das escalas de plantão e o impacto no descanso da equipe.',
    abertoEm: '2026-06-24', prazoEm: '2026-07-08', status: 'novo',
    andamentos: [
      { id: 'an-07', em: '2026-06-24', texto: 'Relato recebido pelo canal confidencial. Aguardando triagem.', autor: 'Canal de escuta' },
    ],
  },
]

/* ------------------------------------------------------------------
   Ciclos, responsável técnico e jornada do beneficiário
   ------------------------------------------------------------------ */

export const nr1Ciclos: Nr1Ciclo[] = [
  {
    campanhaId: 'camp-2025-2s',
    nome: '2º semestre 2025',
    encerradaEm: '2025-12-05',
    modeloNome: 'Modelo YNA — Riscos Psicossociais',
    versao: '1.0',
    participacaoPct: 62,
    mediaPorDimensao: [
      { dimensaoId: 'organizacao', media: 2.4 },
      { dimensaoId: 'relacoes', media: 3.0 },
      { dimensaoId: 'ambiente', media: 3.3 },
      { dimensaoId: 'contexto', media: 2.6 },
    ],
  },
  {
    campanhaId: 'camp-2026-1s',
    nome: '1º semestre 2026',
    encerradaEm: '—',
    modeloNome: 'BCP Securities — Riscos Psicossociais',
    versao: '1.0',
    participacaoPct: Math.round((totalRespostas / totalElegiveis) * 100),
    mediaPorDimensao: [
      { dimensaoId: 'organizacao', media: 2.9 },
      { dimensaoId: 'relacoes', media: 3.4 },
      { dimensaoId: 'ambiente', media: 3.5 },
      { dimensaoId: 'contexto', media: 3.0 },
    ],
  },
]

export const nr1ResponsavelTecnico: Nr1ResponsavelTecnico = {
  nome: 'Dra. Helena Barros',
  registro: 'Eng. Segurança do Trabalho · CREA-SP 5069841230',
  empresa: 'Sanare Consultoria em SST',
  assinadoEm: undefined,
}

/** Avaliações do próprio beneficiário — só o dado dele (RF-G01). */
export const nr1MinhasAvaliacoes: Nr1MinhaAvaliacao[] = [
  {
    campanhaId: 'camp-2025-2s',
    nome: '2º semestre 2025',
    respondidoEm: '2025-11-12',
    modeloNome: 'Modelo YNA — Riscos Psicossociais',
    versao: '1.0',
    scores: [
      { dimensaoId: 'organizacao', nome: 'Organização do trabalho', media: 2.3 },
      { dimensaoId: 'relacoes', nome: 'Relações e liderança', media: 3.1 },
      { dimensaoId: 'ambiente', nome: 'Ambiente e recursos', media: 3.4 },
      { dimensaoId: 'contexto', nome: 'Contexto externo', media: 2.5 },
    ],
  },
]

export const nr1Kit: Nr1KitMaterial[] = [
  {
    id: 'kit-01', tipo: 'email', titulo: 'E-mail de abertura da campanha',
    descricao: 'Primeiro contato com o time. Explica o porquê, o sigilo e o tempo de resposta.',
    conteudo:
      'Assunto: Um espaço seguro para você falar sobre o seu trabalho\n\n' +
      'Oi, tudo bem?\n\n' +
      'Nas próximas semanas você vai receber um convite para responder algumas perguntas sobre o seu dia a dia de trabalho. ' +
      'São cerca de 8 minutos, e as respostas são anônimas — ninguém aqui vê o que você respondeu individualmente.\n\n' +
      'O que a gente enxerga é o retrato do time: onde o trabalho está pesando e o que precisa mudar. ' +
      'É a partir daí que conseguimos agir.\n\n' +
      'Contamos com você. E se em algum momento quiser conversar com alguém, o cuidado da YNA está disponível para você.',
  },
  {
    id: 'kit-02', tipo: 'email', titulo: 'E-mail de lembrete',
    descricao: 'Reforço a meio caminho da janela, sem pressão e sem constranger quem não respondeu.',
    conteudo:
      'Assunto: Ainda dá tempo de contar como tem sido\n\n' +
      'A pesquisa sobre o ambiente de trabalho fica aberta até {{data_fim}}.\n\n' +
      'Se você já respondeu, obrigado — de verdade. Se ainda não, são 8 minutos e continua tudo anônimo.\n\n' +
      'Quanto mais gente participa, mais fiel é o retrato — e mais acertadas são as mudanças que vêm depois.',
  },
  {
    id: 'kit-03', tipo: 'cartaz', titulo: 'Cartaz para áreas comuns',
    descricao: 'Peça para copa, elevador e mural. Texto curto com QR Code da campanha.',
    conteudo:
      'COMO ANDA O SEU TRABALHO?\n\n' +
      '8 minutos. Anônimo. Sem resposta certa ou errada.\n\n' +
      'O que você contar aqui ajuda a cuidar do ambiente de todo mundo.\n\n' +
      '[QR Code da campanha]\n\n' +
      'Disponível até {{data_fim}}',
  },
  {
    id: 'kit-04', tipo: 'roteiro', titulo: 'Roteiro para a liderança',
    descricao: 'O que a liderança deve (e não deve) dizer ao apresentar a campanha ao time.',
    conteudo:
      'ABERTURA (2 minutos, na reunião semanal)\n\n' +
      '· Diga o porquê: entender onde o trabalho está pesando para poder agir.\n' +
      '· Garanta o sigilo: as respostas são anônimas e nenhuma liderança vê resposta individual.\n' +
      '· Dê o tempo: são cerca de 8 minutos, dentro do expediente.\n\n' +
      'O QUE NÃO FAZER\n\n' +
      '· Não cobre participação nominalmente nem acompanhe quem respondeu.\n' +
      '· Não prometa mudanças específicas antes do resultado.\n' +
      '· Não peça para alguém "responder pensando no lado bom".\n\n' +
      'DEPOIS DO RESULTADO\n\n' +
      '· Compartilhe o retrato da área e o plano de ação. Silêncio depois da pesquisa corrói a confiança.',
  },
  {
    id: 'kit-05', tipo: 'post', titulo: 'Post para o canal interno',
    descricao: 'Mensagem curta para Slack, Teams ou mural digital.',
    conteudo:
      'A pesquisa sobre riscos psicossociais está no ar 🌱\n\n' +
      '8 minutos, anônima, e o resultado vira plano de ação.\n' +
      'Responda quando fizer sentido para você — o link fica aberto até {{data_fim}}.',
  },
]
