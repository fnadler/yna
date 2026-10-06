import type {
  Nr1QuestionarioModelo, Nr1QuestionarioVersao, Nr1Dimensao, Nr1Item, Nr1DimensaoId,
  Nr1EscalaConfig, Nr1PontuacaoConfig, Nr1NivelRisco, Nr1Campanha, Nr1LinhaMapa,
  Nr1RiscoInventario, Nr1Acao, Nr1Relato, Nr1Ciclo, Nr1ResponsavelTecnico,
  Nr1MinhaAvaliacao, Nr1Severidade, Nr1RiscoCiclo, Nr1RiscoStatus,
  Nr1FatorRisco, Nr1FonteGeradora, Nr1EscalaId,
} from '../types'
import { rhDepartamentos, rhEmpresa } from './rhMock'
import { nr1MontarHistoricoRisco } from '../lib/nr1'

/* Dados mockados do Módulo de Conformidade NR-1.

   O conteúdo-semente do Modelo YNA (dimensões, itens, escalas, cortes e o
   núcleo obrigatório) vem de "YNA — Questionário de Riscos Psicossociais v0.3",
   ainda um RASCUNHO pendente de validação clínica e adaptação transcultural.
   Ver as pendências listadas no README. */

export const NR1_TODAY = '2026-06-25'

/* ------------------------------------------------------------------
   Dimensões, escalas e pontuação
   ------------------------------------------------------------------ */

/** `curto` é usado onde não cabe o nome inteiro — cabeçalho do mapa de
   calor, eixos do radar, chips.

   Recorte de 8 dimensões (revisão pós-validação de 2026-09), mais granular
   que as 4 do Guia do MTE usadas até então — separa demandas de organização
   do trabalho, isola liderança e segurança psicossocial de relações em
   geral, e acrescenta valores e saúde/bem-estar como dimensões próprias.
   `ambiente` (a antiga "Ambiente e recursos") foi absorvida por
   `organizacao`, que ainda cobre recursos e condições de trabalho. Os ids
   `organizacao` e `contexto` foram mantidos (só o nome mudou) para não
   invalidar os riscos do inventário e os itens do modelo derivado de
   cliente que já apontavam pra eles — ver ITENS_BCP e RISCOS abaixo. */
export const NR1_DIMENSOES: { id: Nr1DimensaoId; nome: string; curto: string; descricao: string; icon: string }[] = [
  { id: 'demandas', nome: 'Demandas no trabalho', curto: 'Demandas', descricao: 'Avalia a carga, o ritmo, a complexidade e as exigências físicas, cognitivas e emocionais do trabalho.', icon: 'ph:gauge-bold' },
  { id: 'organizacao', nome: 'Organização e conteúdo do trabalho', curto: 'Organização', descricao: 'Avalia a clareza, autonomia, participação, organização das atividades e oportunidades de desenvolvimento no trabalho.', icon: 'ph:stack-bold' },
  { id: 'relacoes', nome: 'Relações interpessoais', curto: 'Relações', descricao: 'Avalia a qualidade das relações, colaboração, respeito, confiança e possíveis conflitos no ambiente de trabalho.', icon: 'ph:users-three-bold' },
  { id: 'lideranca', nome: 'Liderança', curto: 'Liderança', descricao: 'Avalia o suporte, a comunicação, a orientação e a forma como as lideranças conduzem e apoiam suas equipes.', icon: 'ph:megaphone-bold' },
  { id: 'contexto', nome: 'Interface trabalho-indivíduo', curto: 'Interface', descricao: 'Avalia o equilíbrio entre trabalho e vida pessoal, recuperação e os impactos das demandas de trabalho na vida do indivíduo.', icon: 'ph:scales-bold' },
  { id: 'valores', nome: 'Valores do local de trabalho', curto: 'Valores', descricao: 'Avalia percepções sobre justiça, confiança, respeito, reconhecimento, ética e coerência nas práticas organizacionais.', icon: 'ph:compass-bold' },
  { id: 'saude', nome: 'Saúde e bem-estar', curto: 'Saúde', descricao: 'Avalia aspectos relacionados ao estresse, desgaste, satisfação e percepção de saúde e bem-estar no contexto do trabalho.', icon: 'ph:heartbeat-bold' },
  { id: 'seguranca', nome: 'Segurança psicossocial', curto: 'Segurança', descricao: 'Avalia a percepção de segurança, estabilidade, previsibilidade e proteção diante das condições e mudanças no trabalho.', icon: 'ph:shield-warning-bold' },
]

export const nr1DimensaoNome = (id: Nr1DimensaoId) =>
  NR1_DIMENSOES.find((d) => d.id === id)?.nome ?? id

/* ------------------------------------------------------------------
   Fatores de risco e fontes geradoras do risco (RF-A05)
   Cadastros à parte, vinculados às dimensões — nunca um ao outro
   diretamente. Conteúdo-semente da planilha "Domínios e Fontes
   Geradoras do Risco" (YNA, 2026): cada fator/fonte é reutilizável entre
   dimensões, por isso o registro global é deduplicado por nome (ex.:
   "Liderança despreparada" aparece na planilha em duas linhas — Relações
   interpessoais e Segurança psicossocial — e vira um único cadastro
   referenciado pelas duas).
   ------------------------------------------------------------------ */

const slugificar = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const FATORES_E_FONTES_POR_DIMENSAO: Record<Nr1DimensaoId, { fatores: string[]; fontes: string[] }> = {
  demandas: {
    fatores: ['Baixa demanda no trabalho (Subcarga)', 'Excesso de demandas no trabalho (Sobrecarga)', 'Baixo controle no trabalho / Falta de autonomia'],
    fontes: [
      'Subutilização de competências', 'Ociosidade', 'Má distribuição de tarefas', 'Funções pouco desafiadoras',
      'Metas irrealistas', 'Equipe insuficiente', 'Jornadas prolongadas', 'Acúmulo de funções',
      'Microgestão', 'Excesso de burocracia', 'Centralização de decisões', 'Baixa confiança na equipe',
    ],
  },
  organizacao: {
    fatores: ['Baixa clareza de papel/função'],
    fontes: ['Falta de definição de responsabilidades', 'Ordens contraditórias', 'Comunicação confusa', 'Atribuições mal definidas'],
  },
  relacoes: {
    fatores: ['Maus relacionamentos no local de trabalho'],
    fontes: ['Comunicação agressiva', 'Rivalidade interna', 'Conflitos mal geridos', 'Liderança despreparada'],
  },
  lideranca: {
    fatores: ['Falta de suporte/apoio no trabalho'],
    fontes: ['Liderança ausente', 'Falta de escuta', 'Cobrança sem acompanhamento', 'Favoritismo'],
  },
  contexto: {
    fatores: ['Trabalho em condições de difícil comunicação', 'Má gestão de mudanças organizacionais'],
    fontes: [
      'Turnos desalinhados', 'Distância física', 'Falha nos meios de comunicação', 'Fluxo de informação inadequado',
      'Comunicação inadequada', 'Mudanças abruptas', 'Falta de planejamento', 'Insegurança quanto à estabilidade',
    ],
  },
  valores: {
    fatores: ['Baixa justiça organizacional', 'Baixas recompensas e reconhecimento'],
    fontes: [
      'Critérios pouco transparentes', 'Favorecimento', 'Desigualdade de tratamento', 'Decisões pouco claras',
      'Ausência de feedback', 'Foco exclusivo em metas', 'Reconhecimento desigual', 'Falta de plano de crescimento',
    ],
  },
  saude: {
    fatores: ['Eventos violentos ou traumáticos'],
    fontes: ['Falta de protocolos de segurança', 'Exposição a risco', 'Ausência de treinamento', 'Falta de suporte pós-evento'],
  },
  seguranca: {
    fatores: ['Assédio de qualquer natureza no trabalho'],
    fontes: ['Cultura permissiva a desrespeito', 'Ausência de canal de denúncia', 'Liderança despreparada', 'Comunicação violenta'],
  },
}

function construirRegistro<T extends { id: string; nome: string }>(campo: 'fatores' | 'fontes', prefixo: string): T[] {
  const porNome = new Map<string, T>()
  for (const dim of Object.values(FATORES_E_FONTES_POR_DIMENSAO)) {
    for (const nome of dim[campo]) {
      if (!porNome.has(nome)) porNome.set(nome, { id: `${prefixo}-${slugificar(nome)}`, nome } as T)
    }
  }
  return [...porNome.values()]
}

/** Registro global de fatores de risco — mutável: `criar()` em
   `nr1FatorRiscoService` acrescenta aqui os fatores cadastrados na hora,
   direto do formulário de dimensão. */
export const nr1FatoresRisco: Nr1FatorRisco[] = construirRegistro('fatores', 'fator')
/** Idem, para fontes geradoras. */
export const nr1FontesGeradoras: Nr1FonteGeradora[] = construirRegistro('fontes', 'fonte')

const idsPorNome = (registro: { id: string; nome: string }[], nomes: string[]) =>
  nomes.map((nome) => registro.find((r) => r.nome === nome)!.id)

/** Opções de resposta da matriz COPSOQ parametrizada pela YNA (legenda
   1–5 da "Matriz COPSOQ YNA — Validação V3"). Sempre da pior para a melhor
   leitura no sentido da frase; itens de risco (`direcao: 'reverso'`) são
   invertidos antes da média. As escalas de 4 opções (D, E) usam 1-2-4-5,
   para manter a mesma régua de 1 a 5 das demais. */
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
    nome: 'Intensidade',
    opcoes: [
      { valor: 1, rotulo: 'Muito pouco' },
      { valor: 2, rotulo: 'Pouco' },
      { valor: 3, rotulo: 'De certa forma' },
      { valor: 4, rotulo: 'Em boa parte' },
      { valor: 5, rotulo: 'Em grande parte' },
    ],
  },
  C: {
    nome: 'Avaliação de saúde',
    opcoes: [
      { valor: 1, rotulo: 'Ruim' },
      { valor: 2, rotulo: 'Razoável' },
      { valor: 3, rotulo: 'Boa' },
      { valor: 4, rotulo: 'Muito boa' },
      { valor: 5, rotulo: 'Excelente' },
    ],
  },
  D: {
    nome: 'Satisfação',
    opcoes: [
      { valor: 1, rotulo: 'Muito insatisfeito' },
      { valor: 2, rotulo: 'Insatisfeito' },
      { valor: 4, rotulo: 'Satisfeito' },
      { valor: 5, rotulo: 'Muito satisfeito' },
    ],
  },
  E: {
    nome: 'Concordância',
    opcoes: [
      { valor: 1, rotulo: 'Não, realmente não' },
      { valor: 2, rotulo: 'Sim, mas muito pouco' },
      { valor: 4, rotulo: 'Sim, até certo ponto' },
      { valor: 5, rotulo: 'Sim, com certeza' },
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
   Itens do Modelo YNA — matriz COPSOQ II parametrizada pela YNA
   ("Matriz COPSOQ YNA — Validação V3"): 39 perguntas nos 8 domínios.
   Negativa (Risco) → `reverso`; Positiva → `positivo`. A escala de cada
   item segue a legenda de respostas da matriz.
   ------------------------------------------------------------------ */

type ItemSeed = [id: string, texto: string, referencia: string, escala: Nr1EscalaId, direcao: 'positivo' | 'reverso', nucleo: boolean, extra?: { condicional?: boolean; sensivel?: boolean }]

const item = ([id, texto, referencia, escala, direcao, nucleo, extra]: ItemSeed): Nr1Item => ({
  id, texto, referencia, escala, direcao,
  tipoCampo: 'select',
  obrigatorioNucleo: nucleo,
  ...extra,
})

const DEMANDAS: ItemSeed[] = [
  ['COP-01A', 'Você atrasa a entrega do seu trabalho?', 'COPSOQ II · Exigências quantitativas', 'A', 'reverso', true],
  ['COP-01B', 'O tempo para realizar as suas tarefas no trabalho é suficiente?', 'COPSOQ II · Exigências quantitativas', 'A', 'positivo', false],
  ['COP-02A', 'É necessário manter um ritmo acelerado no trabalho?', 'COPSOQ II · Ritmo de trabalho', 'A', 'reverso', true],
  ['COP-02B', 'Você trabalha em ritmo acelerado ao longo de toda jornada?', 'COPSOQ II · Ritmo de trabalho', 'A', 'reverso', false],
  ['COP-03A', 'Seu trabalho coloca você em situações emocionalmente desgastantes?', 'COPSOQ II · Exigências emocionais', 'A', 'reverso', false],
  ['COP-03B', 'Você tem que lidar com os problemas pessoais de outras pessoas como parte do seu trabalho?', 'COPSOQ II · Exigências emocionais', 'A', 'reverso', false],
]

const ORGANIZACAO: ItemSeed[] = [
  ['COP-04A', 'Você tem um alto grau de influência nas decisões sobre o seu trabalho?', 'COPSOQ II · Influência no trabalho', 'A', 'positivo', true],
  ['COP-04B', 'Você pode interferir na quantidade de trabalho atribuída a você?', 'COPSOQ II · Influência no trabalho', 'A', 'positivo', false],
  ['COP-05A', 'Você tem a possibilidade de aprender coisas novas através do seu trabalho?', 'COPSOQ II · Possibilidades de desenvolvimento', 'B', 'positivo', false],
  ['COP-05B', 'O seu trabalho exige que você tome iniciativas?', 'COPSOQ II · Possibilidades de desenvolvimento', 'B', 'positivo', false],
  ['COP-06A', 'O seu trabalho é significativo?', 'COPSOQ II · Significado do trabalho', 'B', 'positivo', true],
  ['COP-06B', 'Você sente que o trabalho que você faz é importante?', 'COPSOQ II · Significado do trabalho', 'B', 'positivo', false],
  ['COP-07A', 'Você sente que o seu local de trabalho é muito importante para você?', 'COPSOQ II · Compromisso com o local de trabalho', 'B', 'positivo', false],
  ['COP-07B', 'Você recomendaria a um amigo que se candidatasse a uma vaga no seu local de trabalho?', 'COPSOQ II · Compromisso com o local de trabalho', 'E', 'positivo', false],
]

const RELACOES: ItemSeed[] = [
  ['COP-08A', 'No seu local de trabalho, você é informado antecipadamente sobre decisões importantes, mudanças ou planos para o futuro?', 'COPSOQ II · Previsibilidade', 'B', 'positivo', false],
  ['COP-08B', 'Você recebe toda a informação necessária para fazer bem o seu trabalho?', 'COPSOQ II · Previsibilidade', 'B', 'positivo', true],
  ['COP-09B', 'Você é tratado de forma justa no seu local de trabalho?', 'COPSOQ II · Reconhecimento', 'B', 'positivo', false],
  ['COP-10A', 'O seu trabalho tem objetivos/metas claros(as)?', 'COPSOQ II · Clareza do papel', 'B', 'positivo', false],
  ['COP-10B', 'Você sabe exatamente o que se espera de você no trabalho?', 'COPSOQ II · Clareza do papel', 'B', 'positivo', true],
]

const LIDERANCA: ItemSeed[] = [
  ['COP-09A', 'O seu trabalho é reconhecido e valorizado pelos seus superiores?', 'COPSOQ II · Reconhecimento', 'B', 'positivo', true],
  ['COP-11A', 'Você diria que o seu superior imediato dá alta prioridade para a satisfação com o trabalho?', 'COPSOQ II · Qualidade da liderança', 'B', 'positivo', false],
  ['COP-11B', 'Você diria que o seu superior imediato é bom no planejamento do trabalho?', 'COPSOQ II · Qualidade da liderança', 'B', 'positivo', false],
  ['COP-12A', 'Com que frequência o seu superior imediato está disposto a ouvir os seus problemas no trabalho?', 'COPSOQ II · Suporte social do superior', 'A', 'positivo', false],
  ['COP-12B', 'Com que frequência você recebe ajuda e suporte do seu superior imediato?', 'COPSOQ II · Suporte social do superior', 'A', 'positivo', true],
]

const CONTEXTO: ItemSeed[] = [
  ['COP-13', 'Qual o seu nível de satisfação com o seu trabalho como um todo, considerando todos os aspectos?', 'COPSOQ II · Satisfação no trabalho', 'D', 'positivo', false],
  ['COP-14A', 'Você sente que o seu trabalho consome tanto sua energia que ele tem um efeito negativo na sua vida particular?', 'COPSOQ II · Conflito trabalho-família', 'E', 'reverso', true],
  ['COP-14B', 'Você sente que o seu trabalho ocupa tanto tempo que ele tem um efeito negativo na sua vida particular?', 'COPSOQ II · Conflito trabalho-família', 'E', 'reverso', false],
]

const VALORES: ItemSeed[] = [
  ['COP-15A', 'Você pode confiar nas informações que vêm dos seus superiores?', 'COPSOQ II · Confiança na gestão', 'B', 'positivo', false],
  ['COP-15B', 'Os seus superiores confiam que os funcionários farão bem seu trabalho?', 'COPSOQ II · Confiança na gestão', 'B', 'positivo', false],
  ['COP-16A', 'Os conflitos são resolvidos de forma justa?', 'COPSOQ II · Justiça', 'B', 'positivo', true],
  ['COP-16B', 'O trabalho é distribuído de forma justa?', 'COPSOQ II · Justiça', 'B', 'positivo', false],
]

const SAUDE: ItemSeed[] = [
  ['COP-17', 'Em geral, você diria que a sua saúde é:', 'COPSOQ II · Saúde geral', 'C', 'positivo', false],
  ['COP-18A', 'Com que frequência você tem se sentido fisicamente esgotado?', 'COPSOQ II · Sintomas de burnout', 'A', 'reverso', false],
  ['COP-18B', 'Com que frequência você tem se sentido emocionalmente esgotado?', 'COPSOQ II · Sintomas de burnout', 'A', 'reverso', true],
  ['COP-19A', 'Com que frequência você tem se sentido estressado?', 'COPSOQ II · Sintomas de estresse', 'A', 'reverso', false],
  ['COP-19B', 'Com que frequência você tem se sentido irritado?', 'COPSOQ II · Sintomas de estresse', 'A', 'reverso', false],
]

/* Itens de segurança psicossocial são afirmações (não perguntas) — sem
   escala específica na legenda da matriz; usam a de intensidade. */
const SEGURANCA: ItemSeed[] = [
  ['COP-20', 'O ambiente de trabalho é seguro e raramente sou exposto(a) a eventos violentos ou traumáticos.', 'YNA · Segurança psicossocial', 'B', 'positivo', false, { sensivel: true }],
  ['COP-21', 'Este é um lugar psicológica e emocionalmente saudável para trabalhar.', 'YNA · Segurança psicossocial', 'B', 'positivo', true],
  ['COP-22', 'Este é um lugar fisicamente seguro para trabalhar.', 'YNA · Segurança psicossocial', 'B', 'positivo', false],
]

function dimensao(id: Nr1DimensaoId, seeds: ItemSeed[]): Nr1Dimensao {
  const meta = NR1_DIMENSOES.find((d) => d.id === id)!
  const seedRiscos = FATORES_E_FONTES_POR_DIMENSAO[id]
  return {
    id, nome: meta.nome, descricao: meta.descricao, itens: seeds.map(item),
    fatoresRiscoIds: seedRiscos ? idsPorNome(nr1FatoresRisco, seedRiscos.fatores) : [],
    fontesGeradorasIds: seedRiscos ? idsPorNome(nr1FontesGeradoras, seedRiscos.fontes) : [],
  }
}

/** Dimensões do Modelo YNA base — recriadas a cada chamada para que uma versão
   rascunho editada não mute a versão publicada (imutabilidade — RF-A04). */
export const nr1DimensoesBase = (): Nr1Dimensao[] => [
  dimensao('demandas', DEMANDAS),
  dimensao('organizacao', ORGANIZACAO),
  dimensao('relacoes', RELACOES),
  dimensao('lideranca', LIDERANCA),
  dimensao('contexto', CONTEXTO),
  dimensao('valores', VALORES),
  dimensao('saude', SAUDE),
  dimensao('seguranca', SEGURANCA),
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

/** Itens específicos do modelo derivado da BCP Securities (acrescentados —
   o núcleo permanece intacto). */
const ITENS_BCP: Record<string, Nr1Item[]> = {
  demandas: [
    { id: 'BCP-01', texto: 'Consigo conciliar as demandas da mesa com os prazos regulatórios.', referencia: 'BCP Securities · específico', escala: 'A', direcao: 'positivo', tipoCampo: 'select', obrigatorioNucleo: false, origemCliente: true },
  ],
  contexto: [
    { id: 'BCP-02', texto: 'A volatilidade do mercado afeta o meu descanso fora do expediente.', referencia: 'BCP Securities · específico', escala: 'A', direcao: 'reverso', tipoCampo: 'select', obrigatorioNucleo: false, origemCliente: true },
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
    nome: 'Modelo YNA de Riscos Psicossociais',
    escopo: 'yna',
    descricao: 'Instrumento base da plataforma, mantido e revisado pela YNA. Cobre os 4 domínios do Guia do MTE a partir do HSE Indicator Tool e do COPSOQ.',
    versoes: [
      versaoYna('2.1', 'rascunho', '2026-06-18', undefined, 'Em elaboração: revisão de redação dos itens de Segurança psicossocial (COP-20 a COP-22) após retorno da curadoria clínica.'),
      versaoYna('2.0', 'publicada', '2026-04-02', '2026-04-15', 'Matriz COPSOQ II parametrizada pela YNA (Validação V3): 39 perguntas nos 8 domínios.'),
      versaoYna('1.0', 'arquivada', '2025-10-06', '2025-10-20', 'Primeira publicação da matriz COPSOQ II parametrizada pela YNA, usada no ciclo do 2º semestre de 2025.'),
    ],
  },
  {
    id: 'mod-bcp',
    nome: 'Modelo BCP Securities de Riscos Psicossociais',
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
    elegiveis: d.colaboradores,
    respostas: PARTICIPACAO.find((p) => p.id === d.id)?.respostas ?? 0,
  }))

/** Participação zerada — o formato inicial de um ciclo recém-criado, antes
   de qualquer resposta chegar. */
export const participacaoVazia = () =>
  rhDepartamentos.map((d) => ({
    departamentoId: d.id,
    departamento: d.nome,
    elegiveis: d.colaboradores,
    respostas: 0,
  }))

const totalRespostas = PARTICIPACAO.reduce((s, p) => s + p.respostas, 0)
export const totalElegiveis = rhDepartamentos.reduce((s, d) => s + d.colaboradores, 0)

export const nr1Campanhas: Nr1Campanha[] = [
  {
    id: 'camp-2026-1s',
    nome: 'Avaliação de riscos psicossociais · 1º semestre 2026',
    protocolo: 'NR1-BCP-2026-001',
    status: 'em-campo',
    modeloId: 'mod-bcp',
    modeloNome: 'Modelo BCP Securities de Riscos Psicossociais',
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
    modeloNome: 'Modelo YNA de Riscos Psicossociais',
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

/** Médias por departamento na ordem de NR1_DIMENSOES, uma tabela por campanha
   — para que o resultado de cada campanha na tela de Campanhas seja o dela
   mesma, não sempre o retrato mais recente. A tabela de 2025 é derivada da
   de 2026 escalada pela razão das médias por dimensão já usadas em
   `nr1Ciclos`, para as duas fontes nunca discordarem. */
/** Uma coluna por dimensão, na ordem de `NR1_DIMENSOES`: demandas,
   organização, relações, liderança, interface (contexto), valores, saúde,
   segurança (psicossocial). */
const MEDIAS_2026_1S: Record<string, number[]> = {
  'd-trading': [1.9, 2.5, 2.6, 2.5, 2.4, 2.9, 2.1, 2.7],
  'd-tech': [2.7, 3.1, 3.4, 3.3, 2.5, 3.2, 2.9, 3.8],
  'd-ops': [2.6, 2.6, 2.7, 2.8, 3.3, 3.0, 2.8, 3.4],
  'd-compliance': [3.3, 3.7, 3.9, 3.8, 3.6, 3.8, 3.5, 4.2],
  'd-rh': [3.7, 4.0, 4.2, 4.1, 3.9, 4.1, 3.9, 4.5],
  'd-diretoria': [0, 0, 0, 0, 0, 0, 0, 0],
}

const MEDIAS_2025_2S: Record<string, number[]> = {
  'd-trading': [1.6, 2.1, 2.2, 2.1, 2.1, 2.5, 1.8, 2.3],
  'd-tech': [2.3, 2.6, 2.9, 2.8, 2.1, 2.7, 2.4, 3.3],
  'd-ops': [2.1, 2.3, 2.2, 2.4, 2.9, 2.5, 2.3, 2.9],
  'd-compliance': [2.7, 3.1, 3.3, 3.2, 3.1, 3.2, 2.9, 3.6],
  'd-rh': [3.1, 3.4, 3.6, 3.5, 3.3, 3.5, 3.3, 3.9],
  'd-diretoria': [0, 0, 0, 0, 0, 0, 0, 0],
}

const MEDIAS_POR_CAMPANHA: Record<string, Record<string, number[]>> = {
  'camp-2026-1s': MEDIAS_2026_1S,
  'camp-2025-2s': MEDIAS_2025_2S,
}

/** Mapa de calor de uma campanha específica — por padrão, a campanha em
   campo (ou a mais recente, se nenhuma estiver em campo). */
export const nr1MapaCalor = (campanhaId?: string): Nr1LinhaMapa[] => {
  const porId = campanhaId ? nr1Campanhas.find((c) => c.id === campanhaId) : undefined
  const campanha = porId ?? nr1Campanhas.find((c) => c.status === 'em-campo') ?? nr1Campanhas[0]
  const tabela = (campanha && MEDIAS_POR_CAMPANHA[campanha.id]) ?? MEDIAS_2026_1S
  const participacao = campanha?.participacao ?? participacaoAreas()

  return rhDepartamentos.map((d) => {
    const respondentes = participacao.find((p) => p.departamentoId === d.id)?.respostas ?? 0
    const protegido = respondentes < NR1_PONTUACAO.kAnonimato
    return {
      departamentoId: d.id,
      departamento: d.nome,
      respondentes,
      protegido,
      celulas: NR1_DIMENSOES.map((dim, i) => {
        const media = tabela[d.id]?.[i] ?? 0
        return protegido
          ? { dimensaoId: dim.id, media: null, nivel: null }
          : { dimensaoId: dim.id, media, nivel: nr1NivelPorMedia(media) }
      }),
    }
  })
}

/* ------------------------------------------------------------------
   Inventário de riscos para o PGR (RF-D01)
   ------------------------------------------------------------------ */

export type RiscoSeed = {
  id: string; dimensaoId: Nr1DimensaoId; departamentoIds: string[]
  fator: string; danos: string; probabilidade: number; severidade: Nr1Severidade
  controles: string[]
  fatorRiscoId?: string
  fontesGeradorasIds?: string[]
  /** Ciclo analisado quando o risco foi registrado — ausente nos riscos-semente. */
  campanhaId?: string
  /** Presente quando o risco nasceu da aba "Riscos sugeridos" (ver
     `nr1RiscosSugeridosMock.ts`) — repassado a `Nr1RiscoInventario` via o
     spread `...r` abaixo, sem lógica adicional aqui. */
  origemSugestaoId?: string
  /** Override manual do status (RH/SST, à mão) — a ÚNICA exceção à regra de
     que `Nr1RiscoStatus` nunca é digitado manualmente (ver o tipo em
     `types/index.ts`). Definido pelo campo "Status" em "Editar risco" ou
     pelo botão "Concluir risco" (que grava `'eliminado'`); enquanto
     presente, vence o que a evolução entre ciclos calcularia em
     `nr1Inventario()` — porque o RH decidiu essa leitura, não porque o
     produto inferiu sozinho. */
  statusManual?: Nr1RiscoStatus
}

/** Mutável de propósito: `nr1ResultadoService.adicionarRisco` empurra riscos
   novos aqui, e `nr1Inventario()` já os inclui na próxima chamada (não há
   cache — cada chamada remapeia `RISCOS` do zero). */
export const RISCOS: RiscoSeed[] = [
  {
    id: 'r-01', dimensaoId: 'demandas', departamentoIds: ['d-trading'],
    fatorRiscoId: 'fator-excesso-de-demandas-no-trabalho-sobrecarga', fontesGeradorasIds: ['fonte-metas-irrealistas', 'fonte-jornadas-prolongadas', 'fonte-equipe-insuficiente'],
    fator: 'Excesso de demandas no trabalho (Sobrecarga)',
    danos: 'Fadiga crônica, esgotamento profissional (burnout), transtornos de ansiedade, erros operacionais por sobrecarga cognitiva.',
    probabilidade: 4, severidade: 4,
    controles: [
      'Revisar o dimensionamento da equipe de mesa nos horários de pico.',
      'Instituir janela de pausa obrigatória escalonada durante o pregão.',
      'Revisar metas e prazos com a liderança da área.',
    ],
  },
  {
    id: 'r-02', dimensaoId: 'contexto', departamentoIds: ['d-trading'],
    fatorRiscoId: 'fator-trabalho-em-condicoes-de-dificil-comunicacao', fontesGeradorasIds: ['fonte-turnos-desalinhados', 'fonte-fluxo-de-informacao-inadequado'],
    fator: 'Trabalho em condições de difícil comunicação',
    danos: 'Privação de sono, dificuldade de recuperação, conflito trabalho-família, adoecimento mental.',
    probabilidade: 4, severidade: 3,
    controles: [
      'Publicar política de desconexão com regras claras por área.',
      'Definir escala formal de sobreaviso, com compensação.',
      'Silenciar canais corporativos fora da janela acordada.',
    ],
  },
  {
    id: 'r-03', dimensaoId: 'relacoes', departamentoIds: ['d-trading', 'd-ops'],
    fatorRiscoId: 'fator-maus-relacionamentos-no-local-de-trabalho', fontesGeradorasIds: ['fonte-conflitos-mal-geridos', 'fonte-rivalidade-interna'],
    fator: 'Maus relacionamentos no local de trabalho',
    danos: 'Sofrimento psíquico, isolamento, absenteísmo, agravamento de quadros de ansiedade.',
    probabilidade: 3, severidade: 4,
    controles: [
      'Capacitar a liderança em mediação de conflito e comunicação não violenta.',
      'Divulgar o canal de escuta confidencial a toda a área.',
      'Acompanhar o indicador de relações no próximo ciclo.',
    ],
  },
  {
    id: 'r-04', dimensaoId: 'contexto', departamentoIds: ['d-tech'],
    fatorRiscoId: 'fator-trabalho-em-condicoes-de-dificil-comunicacao', fontesGeradorasIds: ['fonte-distancia-fisica', 'fonte-falha-nos-meios-de-comunicacao'],
    fator: 'Trabalho em condições de difícil comunicação',
    danos: 'Solidão, queda de engajamento, sintomas depressivos.',
    probabilidade: 3, severidade: 3,
    controles: [
      'Estabelecer ritual semanal presencial ou síncrono por squad.',
      'Formalizar rotina de 1:1 quinzenal com a liderança.',
    ],
  },
  {
    id: 'r-05', dimensaoId: 'demandas', departamentoIds: ['d-ops'],
    fatorRiscoId: 'fator-excesso-de-demandas-no-trabalho-sobrecarga', fontesGeradorasIds: ['fonte-equipe-insuficiente', 'fonte-acumulo-de-funcoes'],
    fator: 'Excesso de demandas no trabalho (Sobrecarga)',
    danos: 'Frustração, estresse ocupacional, retrabalho e prolongamento de jornada.',
    probabilidade: 3, severidade: 2,
    controles: [
      'Priorizar no roadmap de TI as falhas apontadas pela operação.',
      'Criar canal rápido de reporte de indisponibilidade.',
    ],
  },
  {
    id: 'r-06', dimensaoId: 'organizacao', departamentoIds: ['d-ops'],
    fatorRiscoId: 'fator-baixa-clareza-de-papel-funcao', fontesGeradorasIds: ['fonte-falta-de-definicao-de-responsabilidades', 'fonte-atribuicoes-mal-definidas'],
    fator: 'Baixa clareza de papel/função',
    danos: 'Insegurança, conflito de demandas, sobrecarga percebida.',
    probabilidade: 3, severidade: 2,
    controles: [
      'Republicar o desenho de papéis e responsabilidades da área.',
      'Realizar sessão de alinhamento com todas as células.',
    ],
  },
]

/** Ordem cronológica das campanhas — a mesma base do heatmap por campanha
   (`MEDIAS_POR_CAMPANHA`), para o histórico de um risco nunca contar uma
   história diferente da do mapa de calor daquela campanha. */
const CAMPANHAS_CRONOLOGICAS = ['camp-2025-2s', 'camp-2026-1s']

/** Histórico de cada risco do inventário, ciclo a ciclo — a média/nível vêm
   da MESMA célula do mapa de calor (departamento × dimensão) da campanha em
   questão, e a tendência/sugestão vêm de `nr1AnalisarEvolucao`. Nada aqui é
   um número novo: é o dado que já existe, só lido na perspectiva do risco.

   Quando o risco atravessa mais de um departamento (`departamentoIds` com
   mais de um item), o ponto de cada ciclo é a média simples das células
   daqueles departamentos naquela dimensão — mesmo espírito de
   `mediaPorDimensao` (média das áreas, não um número à parte), só que
   restrita aos departamentos do próprio risco em vez de todos. */
export const nr1RiscosCiclos: Nr1RiscoCiclo[] = RISCOS.flatMap((r) => {
  const dimIdx = NR1_DIMENSOES.findIndex((d) => d.id === r.dimensaoId)
  const pontos = CAMPANHAS_CRONOLOGICAS.map((campanhaId) => {
    const tabela = MEDIAS_POR_CAMPANHA[campanhaId] ?? MEDIAS_2026_1S
    const vals = r.departamentoIds.map((depId) => tabela[depId]?.[dimIdx] ?? 0)
    const media = vals.reduce((s, v) => s + v, 0) / vals.length
    return { campanhaId, media, nivel: nr1NivelPorMedia(media) }
  })
  return nr1MontarHistoricoRisco(r.id, pontos)
})

export const nr1Inventario = (): Nr1RiscoInventario[] =>
  RISCOS.map((r) => {
    const deps = r.departamentoIds.map((id) => rhDepartamentos.find((d) => d.id === id))
    const nivelNum = r.probabilidade * r.severidade
    const historico = nr1RiscosCiclos.filter((c) => c.riscoId === r.id)
    const ultimo = historico[historico.length - 1]
    return {
      ...r,
      /* Risco classificado num fator do catálogo mostra o nome do catálogo —
         renomear o fator no Manager reflete aqui também. */
      fator: (r.fatorRiscoId && nr1FatoresRisco.find((f) => f.id === r.fatorRiscoId)?.nome) || r.fator,
      dimensao: nr1DimensaoNome(r.dimensaoId),
      grupoExposto: deps.map((d, i) => d?.nome ?? r.departamentoIds[i]).join(', '),
      respondentes: r.departamentoIds.reduce((soma, id) => soma + (PARTICIPACAO.find((p) => p.id === id)?.respostas ?? 0), 0),
      nivelNum,
      nivel: nr1NivelPorProduto(nivelNum),
      campanhaId: r.campanhaId ?? 'camp-2026-1s',
      status: r.statusManual ?? (ultimo?.status ?? 'identificado'),
      tendencia: ultimo?.tendencia,
      variacaoPontos: ultimo?.variacaoPontos,
      acaoRecomendada: ultimo?.acaoRecomendada,
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
    quanto: 'Sem custo direto, só reorganização de escala',
    status: 'em-andamento',
    comentarios: [
      { id: 'com-01', autor: 'Ricardo Alencar', texto: 'Escala publicada e já rodando desde a semana passada.', arquivos: ['escala-revezamento-pregao-jul26.pdf'], em: '2026-06-19' },
    ],
    versao: 1,
    /* O risco saiu de crítico para risco entre os dois ciclos — melhorou,
       mas não o bastante para sair da faixa grave. Daí a v2 abaixo. */
    efetividade: 'parcialmente-efetiva',
  },
  {
    id: 'a-01-v2', riscoId: 'r-01',
    oQue: 'Instituir pausa obrigatória escalonada + limitar concorrência de posições por trader',
    porQue: 'A escala de pausas ajudou (crítico → risco no último ciclo), mas o risco ainda está na faixa grave — o ritmo em si segue alto.',
    quem: 'Ricardo Alencar · Head de Trading',
    quando: '2026-12-15', onde: 'Trading & Mercados',
    como: 'Mantém a escala de revezamento da v1 e acrescenta um teto de posições simultâneas por trader nos horários de pico.',
    quanto: 'Sem custo direto, só reorganização de escala e limites operacionais',
    status: 'planejada',
    comentarios: [],
    versao: 2,
    versaoAnteriorId: 'a-01',
    motivoRevisao: 'Risco seguiu na faixa grave no ciclo mais recente (recomendação: revisar plano) — a v1 reduziu a intensidade, mas não o suficiente sozinha.',
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
    comentarios: [],
    versao: 1,
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
    comentarios: [],
    versao: 1,
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
    comentarios: [],
    versao: 1,
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
    comentarios: [
      { id: 'com-02', autor: 'Marcos Tavares', texto: 'Modelo de pauta enviado para o time, todo mundo já está usando.', arquivos: ['modelo-pauta-1a1.pdf'], em: '2026-06-10' },
      { id: 'com-03', autor: 'Marcos Tavares', texto: 'Prints confirmando as agendas recorrentes criadas para o time inteiro.', arquivos: ['print-agendas-recorrentes.png'], em: '2026-06-12' },
    ],
    versao: 1,
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
    versao: 1,
    comentarios: [],
  },
]

/* Log de atividade inicial das ações — criação, comentários/evidências e
   conclusão, montados a partir dos próprios dados semeados acima (datas de
   criação estimadas, só para o histórico ter começo). */
const CRIACAO_ACOES: Record<string, [em: string, autor: string]> = {
  'a-01': ['2026-05-04T09:12', 'Camila Risi'],
  'a-01-v2': ['2026-06-22T16:40', 'Camila Risi'],
  'a-02': ['2026-05-04T09:31', 'Camila Risi'],
  'a-03': ['2026-05-06T11:05', 'Camila Risi'],
  'a-04': ['2026-05-11T14:20', 'Camila Risi'],
  'a-05': ['2026-05-12T10:02', 'Camila Risi'],
  'a-06': ['2026-05-15T15:47', 'Camila Risi'],
}
for (const a of nr1Acoes) {
  const [em, autor] = CRIACAO_ACOES[a.id] ?? [`${NR1_TODAY}T09:00`, 'Camila Risi']
  const log: NonNullable<Nr1Acao['atividades']> = [{
    id: `atv-${a.id}-0`, em, autor, tipo: 'criada',
    descricao: a.versaoAnteriorId ? `Criou a versão ${a.versao} da ação (revisão do plano)` : 'Criou a ação',
  }]
  if (a.status === 'em-andamento' || a.status === 'concluida') {
    log.push({ id: `atv-${a.id}-st`, em: em.replace(/T.*/, 'T17:30'), autor: a.quem.split(' · ')[0]!, tipo: 'status', descricao: 'Mudou o status de Planejada para Em andamento' })
  }
  a.comentarios.forEach((c, i) => {
    log.push({
      id: `atv-${a.id}-c${i}`, em: `${c.em}T${String(10 + i).padStart(2, '0')}:15`, autor: c.autor,
      tipo: c.arquivos?.length ? 'evidencia' : 'comentario',
      descricao: c.arquivos?.length ? `Anexou a evidência: ${c.arquivos.join(', ')}` : 'Comentou o andamento',
    })
  })
  if (a.status === 'concluida' && a.concluidaEm) {
    log.push({ id: `atv-${a.id}-fim`, em: `${a.concluidaEm}T18:05`, autor: a.quem.split(' · ')[0]!, tipo: 'concluida', descricao: 'Concluiu a ação' })
  }
  a.atividades = log.sort((x, y) => x.em.localeCompare(y.em))
}

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
   Ciclos, responsável técnico e jornada do colaborador
   ------------------------------------------------------------------ */

export const nr1Ciclos: Nr1Ciclo[] = [
  {
    campanhaId: 'camp-2025-2s',
    nome: '2º semestre 2025',
    encerradaEm: '2025-12-05',
    modeloNome: 'Modelo YNA de Riscos Psicossociais',
    versao: '1.0',
    participacaoPct: 62,
    mediaPorDimensao: [
      { dimensaoId: 'demandas', media: 2.4 },
      { dimensaoId: 'organizacao', media: 2.7 },
      { dimensaoId: 'relacoes', media: 2.8 },
      { dimensaoId: 'lideranca', media: 2.7 },
      { dimensaoId: 'contexto', media: 2.7 },
      { dimensaoId: 'valores', media: 2.9 },
      { dimensaoId: 'saude', media: 2.5 },
      { dimensaoId: 'seguranca', media: 3.2 },
    ],
  },
  {
    campanhaId: 'camp-2026-1s',
    nome: '1º semestre 2026',
    /* Sem `encerradaEm`: esta campanha ainda está em campo. */
    modeloNome: 'Modelo BCP Securities de Riscos Psicossociais',
    versao: '1.0',
    participacaoPct: Math.round((totalRespostas / totalElegiveis) * 100),
    mediaPorDimensao: [
      { dimensaoId: 'demandas', media: 2.8 },
      { dimensaoId: 'organizacao', media: 3.2 },
      { dimensaoId: 'relacoes', media: 3.4 },
      { dimensaoId: 'lideranca', media: 3.3 },
      { dimensaoId: 'contexto', media: 3.1 },
      { dimensaoId: 'valores', media: 3.4 },
      { dimensaoId: 'saude', media: 3.0 },
      { dimensaoId: 'seguranca', media: 3.7 },
    ],
  },
]

export const nr1ResponsavelTecnico: Nr1ResponsavelTecnico = {
  nome: 'Dra. Helena Barros',
  registro: 'Eng. Segurança do Trabalho · CREA-SP 5069841230',
  empresa: 'Sanare Consultoria em SST',
  assinadoEm: undefined,
}

/** Avaliações do próprio colaborador — só o dado dele (RF-G01). */
export const nr1MinhasAvaliacoes: Nr1MinhaAvaliacao[] = [
  {
    campanhaId: 'camp-2025-2s',
    nome: '2º semestre 2025',
    respondidoEm: '2025-11-12',
    modeloNome: 'Modelo YNA de Riscos Psicossociais',
    versao: '1.0',
    scores: [
      { dimensaoId: 'demandas', nome: 'Demandas no trabalho', media: 2.2 },
      { dimensaoId: 'organizacao', nome: 'Organização e conteúdo do trabalho', media: 2.6 },
      { dimensaoId: 'relacoes', nome: 'Relações interpessoais', media: 3.0 },
      { dimensaoId: 'lideranca', nome: 'Liderança', media: 2.9 },
      { dimensaoId: 'contexto', nome: 'Interface trabalho-indivíduo', media: 2.6 },
      { dimensaoId: 'valores', nome: 'Valores do local de trabalho', media: 2.8 },
      { dimensaoId: 'saude', nome: 'Saúde e bem-estar', media: 2.4 },
      { dimensaoId: 'seguranca', nome: 'Segurança psicossocial', media: 3.4 },
    ],
  },
]

