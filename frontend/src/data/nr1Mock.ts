import type {
  Nr1QuestionarioModelo, Nr1QuestionarioVersao, Nr1Dimensao, Nr1Item, Nr1DimensaoId,
  Nr1EscalaConfig, Nr1PontuacaoConfig, Nr1NivelRisco, Nr1Campanha, Nr1LinhaMapa,
  Nr1RiscoInventario, Nr1Acao, Nr1Relato, Nr1Ciclo, Nr1ResponsavelTecnico,
  Nr1MinhaAvaliacao, Nr1Severidade, Nr1RiscoStatus,
  Nr1FatorRisco, Nr1FonteGeradora, Nr1EscalaId, Nr1Cid,
  Nr1FatorAvaliado, Nr1FatorSituacao, Nr1FatorEvolucao, Nr1AcaoRecomendada, Nr1GrupoExposto,
} from '../types'
import { rhDepartamentos, rhEmpresa } from './rhMock'
import { nr1DistribuirPorItem, LIMIAR_TENDENCIA } from '../lib/nr1'

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

/** Registro global de fontes geradoras. */
export const nr1FontesGeradoras: Nr1FonteGeradora[] = construirRegistro('fontes', 'fonte')

const idsPorNome = (registro: { id: string; nome: string }[], nomes: string[]) =>
  nomes.map((nome) => registro.find((r) => r.nome === nome)!.id)

/* ------------------------------------------------------------------
   Lesões e agravos à saúde (CID-10) — tabela própria, ligada aos fatores
   de risco por id (um CID serve a vários fatores). PRIMEIRA VERSÃO para o
   protótipo, pendente de validação da curadoria clínica da YNA.
   ------------------------------------------------------------------ */

export const nr1Cids: Nr1Cid[] = [
  { id: 'cid-z73-0', codigo: 'Z73.0', nome: 'Esgotamento (síndrome de burnout)' },
  { id: 'cid-f41', codigo: 'F41', nome: 'Transtornos de ansiedade' },
  { id: 'cid-f32', codigo: 'F32', nome: 'Episódios depressivos' },
  { id: 'cid-f43-0', codigo: 'F43.0', nome: 'Reação aguda ao estresse' },
  { id: 'cid-f43-1', codigo: 'F43.1', nome: 'Transtorno de estresse pós-traumático' },
  { id: 'cid-f43-2', codigo: 'F43.2', nome: 'Transtornos de adaptação' },
  { id: 'cid-f48-0', codigo: 'F48.0', nome: 'Neurastenia (síndrome de fadiga)' },
  { id: 'cid-f51-0', codigo: 'F51.0', nome: 'Insônia não orgânica' },
  { id: 'cid-f10', codigo: 'F10', nome: 'Transtornos mentais pelo uso de álcool' },
  { id: 'cid-i10', codigo: 'I10', nome: 'Hipertensão essencial' },
]

/* ------------------------------------------------------------------
   Catálogo de fatores de risco (Manager YNA). Cada fator: domínio,
   explicação simples, severidade fixa, até 3 CIDs, perguntas COPSOQ que o
   indicam, fontes típicas e ações sugeridas. Severidades, CIDs e vínculos
   são PRIMEIRA VERSÃO para o protótipo, pendentes de validação de SST.
   As perguntas de saúde (COP-17 a COP-19B) medem desfecho, não fator, e
   ficam fora dos vínculos.
   ------------------------------------------------------------------ */

type FatorSeed = {
  nome: string; dimensaoId: Nr1DimensaoId; descricao: string; severidade: Nr1Severidade
  cids: string[]; itens: string[]; fontes: string[]; acoes: [oQue: string, porQue: string, como: string][]
}

const FATOR_SEEDS: FatorSeed[] = [
  {
    nome: 'Excesso de demandas no trabalho (Sobrecarga)', dimensaoId: 'demandas', severidade: 4,
    descricao: 'Mais trabalho do que dá para fazer no tempo disponível: ritmo acelerado o dia todo, prazos apertados e tarefas que invadem a vida pessoal.',
    cids: ['cid-z73-0', 'cid-f41', 'cid-i10'],
    itens: ['COP-01A', 'COP-01B', 'COP-02A', 'COP-02B', 'COP-14A', 'COP-14B'],
    fontes: ['Metas irrealistas', 'Equipe insuficiente', 'Jornadas prolongadas', 'Acúmulo de funções'],
    acoes: [
      ['Revisar o dimensionamento da equipe nos horários de pico', 'A carga concentrada excede a capacidade da equipe atual.', 'Levantar a carga por faixa horária e propor redistribuição ou reforço da equipe.'],
      ['Instituir pausas programadas durante a jornada', 'Reduzir o ritmo acelerado contínuo, principal sinal de sobrecarga.', 'Escala de pausas curtas em revezamento, com cobertura entre colegas.'],
      ['Revisar metas e prazos com a liderança da área', 'Metas fora da capacidade real mantêm a sobrecarga.', 'Reunião de revisão de metas com base no histórico de entregas da equipe.'],
    ],
  },
  {
    nome: 'Baixa demanda no trabalho (Subcarga)', dimensaoId: 'demandas', severidade: 2,
    descricao: 'Pouco desafio ou tarefas abaixo da capacidade das pessoas: sensação de ociosidade e de não aprender nada novo.',
    cids: ['cid-f32', 'cid-f43-2', 'cid-f48-0'],
    itens: ['COP-05A', 'COP-05B', 'COP-06B'],
    fontes: ['Subutilização de competências', 'Ociosidade', 'Funções pouco desafiadoras', 'Má distribuição de tarefas'],
    acoes: [
      ['Criar plano de desenvolvimento individual', 'Dar perspectiva de aprendizado e uso das competências.', 'Conversa de carreira com cada pessoa e definição de 1 a 2 metas de desenvolvimento.'],
      ['Redistribuir tarefas entre a equipe', 'Equilibrar quem está ocioso e quem está sobrecarregado.', 'Mapear as atividades da área e redistribuir conforme capacidade e interesse.'],
      ['Abrir projetos de melhoria para a equipe', 'Oferecer desafios novos a quem está subutilizado.', 'Selecionar melhorias da área e convidar voluntários para conduzi-las.'],
    ],
  },
  {
    nome: 'Baixo controle no trabalho / Falta de autonomia', dimensaoId: 'demandas', severidade: 3,
    descricao: 'As pessoas não conseguem influenciar como, quando ou quanto trabalham — as decisões vêm prontas.',
    cids: ['cid-f43-2', 'cid-f41', 'cid-z73-0'],
    itens: ['COP-04A', 'COP-04B'],
    fontes: ['Microgestão', 'Centralização de decisões', 'Excesso de burocracia', 'Baixa confiança na equipe'],
    acoes: [
      ['Definir alçadas de decisão da equipe', 'Dar autonomia real sobre o próprio trabalho.', 'Listar as decisões do dia a dia e combinar o que a equipe decide sem aprovação.'],
      ['Incluir a equipe no planejamento das entregas', 'Permitir que as pessoas influenciem a distribuição do trabalho.', 'Planejamento quinzenal participativo, com a equipe estimando e priorizando.'],
      ['Simplificar aprovações e controles da área', 'Reduzir a burocracia que tira o controle das pessoas.', 'Revisar os fluxos de aprovação e eliminar as etapas sem valor.'],
    ],
  },
  {
    nome: 'Baixa clareza de papel/função', dimensaoId: 'organizacao', severidade: 3,
    descricao: 'As pessoas não sabem exatamente o que se espera delas, recebem informações incompletas ou ordens que se contradizem.',
    cids: ['cid-f43-2', 'cid-f41', 'cid-f48-0'],
    itens: ['COP-10A', 'COP-10B', 'COP-08B'],
    fontes: ['Falta de definição de responsabilidades', 'Ordens contraditórias', 'Comunicação confusa', 'Atribuições mal definidas'],
    acoes: [
      ['Publicar o desenho de papéis e responsabilidades da área', 'Deixar claro o que cabe a cada pessoa.', 'Matriz de responsabilidades revisada com a equipe e publicada em local acessível.'],
      ['Definir metas individuais claras', 'Cada pessoa precisa saber o que se espera dela.', 'Metas por pessoa combinadas no 1:1 e revisadas a cada trimestre.'],
      ['Realizar alinhamento periódico de prioridades', 'Evitar ordens contraditórias e retrabalho.', 'Reunião curta semanal de prioridades com toda a equipe.'],
    ],
  },
  {
    nome: 'Maus relacionamentos no local de trabalho', dimensaoId: 'relacoes', severidade: 4,
    descricao: 'Conflitos frequentes, tratamento injusto ou desrespeitoso entre colegas, e conflitos que não são resolvidos.',
    cids: ['cid-f43-2', 'cid-f32', 'cid-f41'],
    itens: ['COP-09B', 'COP-16A', 'COP-21'],
    fontes: ['Comunicação agressiva', 'Rivalidade interna', 'Conflitos mal geridos', 'Liderança despreparada'],
    acoes: [
      ['Capacitar a liderança em mediação de conflitos', 'Conflitos mal geridos sustentam o mau clima.', 'Trilha de encontros com facilitação externa sobre mediação e comunicação não violenta.'],
      ['Divulgar o canal de escuta confidencial', 'Dar caminho seguro para relatar situações de desrespeito.', 'Comunicação do canal a toda a área, com reforço da garantia de sigilo.'],
      ['Combinar acordos de convivência com a equipe', 'Tornar explícito o comportamento esperado entre colegas.', 'Oficina com a equipe para definir e publicar os acordos.'],
    ],
  },
  {
    nome: 'Falta de suporte/apoio no trabalho', dimensaoId: 'lideranca', severidade: 3,
    descricao: 'A liderança não está disponível para ouvir, ajudar ou orientar quando as pessoas precisam.',
    cids: ['cid-z73-0', 'cid-f32', 'cid-f43-2'],
    itens: ['COP-12A', 'COP-12B', 'COP-11A'],
    fontes: ['Liderança ausente', 'Falta de escuta', 'Cobrança sem acompanhamento', 'Favoritismo'],
    acoes: [
      ['Formalizar rotina de 1:1 com a liderança', 'Garantir espaço regular de escuta e apoio.', 'Agenda recorrente quinzenal com pauta mínima e registro dos combinados.'],
      ['Capacitar líderes em escuta e feedback', 'Líderes precisam de preparo para apoiar a equipe.', 'Programa de desenvolvimento de liderança com foco em escuta ativa.'],
      ['Definir canal de suporte rápido para a equipe', 'Reduzir o tempo de espera por ajuda no dia a dia.', 'Canal de dúvidas com responsável e tempo de resposta combinados.'],
    ],
  },
  {
    nome: 'Trabalho em condições de difícil comunicação', dimensaoId: 'contexto', severidade: 3,
    descricao: 'A informação não chega a tempo ou não chega a todos: turnos desencontrados, distância física ou canais que falham.',
    cids: ['cid-f43-2', 'cid-f41', 'cid-f48-0'],
    itens: ['COP-08A', 'COP-08B', 'COP-15A'],
    fontes: ['Turnos desalinhados', 'Distância física', 'Falha nos meios de comunicação', 'Fluxo de informação inadequado'],
    acoes: [
      ['Estabelecer ritual semanal de comunicação da equipe', 'Garantir que a informação chegue a todos ao mesmo tempo.', 'Encontro semanal síncrono, com resumo escrito para quem não puder participar.'],
      ['Definir canais oficiais de comunicação', 'Evitar informação dispersa ou perdida.', 'Publicar qual canal se usa para cada tipo de assunto.'],
      ['Criar passagem de turno estruturada', 'Reduzir perda de informação entre turnos.', 'Checklist de passagem de turno com registro compartilhado.'],
    ],
  },
  {
    nome: 'Má gestão de mudanças organizacionais', dimensaoId: 'contexto', severidade: 3,
    descricao: 'Mudanças importantes chegam sem aviso, sem explicação ou sem planejamento, gerando insegurança.',
    cids: ['cid-f43-2', 'cid-f41', 'cid-f51-0'],
    itens: ['COP-08A', 'COP-11B', 'COP-15A'],
    fontes: ['Comunicação inadequada', 'Mudanças abruptas', 'Falta de planejamento', 'Insegurança quanto à estabilidade'],
    acoes: [
      ['Comunicar mudanças com antecedência e motivo', 'Reduzir a insegurança gerada por mudanças inesperadas.', 'Roteiro de comunicação de mudanças: o quê, por quê, quando e o que muda para cada um.'],
      ['Envolver as equipes no planejamento das mudanças', 'Mudanças construídas com a equipe geram menos resistência.', 'Grupo de representantes das áreas afetadas participa do planejamento.'],
      ['Acompanhar as equipes após cada mudança', 'Identificar cedo os impactos na saúde e no trabalho.', 'Rodada de conversas 30 dias após a mudança para ajustes.'],
    ],
  },
  {
    nome: 'Baixa justiça organizacional', dimensaoId: 'valores', severidade: 3,
    descricao: 'Percepção de que as decisões, a distribuição do trabalho e a solução de conflitos não são justas nem transparentes.',
    cids: ['cid-f32', 'cid-f43-2', 'cid-i10'],
    itens: ['COP-16A', 'COP-16B', 'COP-09B', 'COP-15B'],
    fontes: ['Critérios pouco transparentes', 'Favorecimento', 'Desigualdade de tratamento', 'Decisões pouco claras'],
    acoes: [
      ['Publicar os critérios de distribuição de trabalho', 'Tornar transparente como o trabalho é dividido.', 'Critérios definidos com a liderança e comunicados à equipe.'],
      ['Explicar as decisões que afetam a equipe', 'Decisões explicadas são percebidas como mais justas.', 'Toda decisão relevante comunicada com o motivo e os critérios usados.'],
      ['Revisar a política de promoções e reconhecimento', 'Reduzir a percepção de favorecimento.', 'Comitê revisa os critérios e os publica para toda a empresa.'],
    ],
  },
  {
    nome: 'Baixas recompensas e reconhecimento', dimensaoId: 'valores', severidade: 3,
    descricao: 'O esforço das pessoas não é reconhecido nem valorizado, e falta perspectiva de crescimento.',
    cids: ['cid-z73-0', 'cid-f32', 'cid-f48-0'],
    itens: ['COP-09A', 'COP-07A', 'COP-13'],
    fontes: ['Ausência de feedback', 'Foco exclusivo em metas', 'Reconhecimento desigual', 'Falta de plano de crescimento'],
    acoes: [
      ['Implantar rotina de feedback e reconhecimento', 'Dar retorno regular sobre o trabalho bem feito.', 'Feedback mensal estruturado e reconhecimento público das entregas.'],
      ['Estruturar plano de carreira da área', 'Dar perspectiva de crescimento às pessoas.', 'Trilha de carreira com critérios claros de evolução.'],
      ['Revisar os critérios de reconhecimento', 'Evitar que o reconhecimento seja desigual.', 'Critérios combinados e aplicados igualmente a toda a equipe.'],
    ],
  },
  {
    nome: 'Eventos violentos ou traumáticos', dimensaoId: 'saude', severidade: 5,
    descricao: 'Exposição a situações de violência, ameaça ou eventos traumáticos no trabalho, ou sensação de falta de segurança física.',
    cids: ['cid-f43-0', 'cid-f43-1', 'cid-f32'],
    itens: ['COP-20', 'COP-22'],
    fontes: ['Falta de protocolos de segurança', 'Exposição a risco', 'Ausência de treinamento', 'Falta de suporte pós-evento'],
    acoes: [
      ['Criar protocolo de resposta a eventos críticos', 'Saber como agir e proteger as pessoas quando algo acontece.', 'Protocolo com papéis, contatos e etapas, treinado com as equipes.'],
      ['Oferecer suporte psicológico após eventos', 'Reduzir o risco de adoecimento depois de um evento traumático.', 'Acolhimento psicológico disponível em até 48 horas após o evento.'],
      ['Treinar as equipes em segurança', 'Diminuir a exposição a situações de risco.', 'Treinamento periódico com simulações práticas.'],
    ],
  },
  {
    nome: 'Assédio de qualquer natureza no trabalho', dimensaoId: 'seguranca', severidade: 5,
    descricao: 'Situações de assédio moral ou sexual, humilhação ou desrespeito, e um ambiente que não é psicologicamente seguro.',
    cids: ['cid-f43-1', 'cid-f32', 'cid-f41'],
    itens: ['COP-21', 'COP-09B', 'COP-16A'],
    fontes: ['Cultura permissiva a desrespeito', 'Ausência de canal de denúncia', 'Liderança despreparada', 'Comunicação violenta'],
    acoes: [
      ['Implantar canal de denúncia com sigilo', 'Dar caminho seguro para relatar assédio.', 'Canal independente, com sigilo garantido e fluxo de apuração definido.'],
      ['Publicar política de prevenção ao assédio', 'Deixar claro o que não é tolerado e as consequências.', 'Política aprovada, divulgada a todos e incluída na integração de novos colaboradores.'],
      ['Treinar lideranças e equipes sobre assédio', 'Prevenir e saber reconhecer situações de assédio.', 'Treinamento obrigatório anual para lideranças e equipes.'],
    ],
  },
]

/** Registro global de fatores de risco — mutável: o Manager edita e
   acrescenta fatores aqui. Os ids seguem o nome (`fator-<slug>`). */
export const nr1FatoresRisco: Nr1FatorRisco[] = FATOR_SEEDS.map((f) => {
  const id = `fator-${slugificar(f.nome)}`
  return {
    id, nome: f.nome, dimensaoId: f.dimensaoId, descricao: f.descricao, severidade: f.severidade,
    cidIds: f.cids,
    fontesGeradorasIds: idsPorNome(nr1FontesGeradoras, f.fontes),
    acoesSugeridas: f.acoes.map(([oQue, porQue, como], i) => ({ id: `${id}-acao-${i + 1}`, oQue, porQue, como })),
  }
})

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
    { min: 1.0, max: 2.9, nivel: 'risco', label: 'Risco', acao: 'Ação corretiva prioritária' },
  ],
}

/** Traduz a média da dimensão (1–5) para o nível de risco. */
/** Nível da nota média (1–5) — só três: Baixo, Atenção e Risco. "Crítico"
   é exclusivo do nível do fator de risco (P × S, `nr1NivelPorProduto`). */
export function nr1NivelPorMedia(media: number): Nr1NivelRisco {
  if (media >= 4) return 'baixo'
  if (media >= 3) return 'atencao'
  return 'risco'
}

/* ------------------------------------------------------------------
   Itens do Modelo YNA — matriz COPSOQ II parametrizada pela YNA
   ("Matriz COPSOQ YNA — Validação V3"): 39 perguntas nos 8 domínios.
   Negativa (Risco) → `reverso`; Positiva → `positivo`. A escala de cada
   item segue a legenda de respostas da matriz.
   ------------------------------------------------------------------ */

type ItemSeed = [id: string, texto: string, referencia: string, escala: Nr1EscalaId, direcao: 'positivo' | 'reverso', nucleo: boolean, extra?: { condicional?: boolean; sensivel?: boolean }]

/* Vínculo pergunta → fatores de risco. Semeado a partir dos fatores do
   catálogo (`FATOR_SEEDS.itens`), mas guardado na pergunta: é ela que diz
   quais fatores indica, e o Manager edita isso no cadastro da pergunta. */
const fatoresDoItem = (itemId: string) =>
  FATOR_SEEDS.filter((f) => f.itens.includes(itemId)).map((f) => `fator-${slugificar(f.nome)}`)

const item = ([id, texto, referencia, escala, direcao, nucleo, extra]: ItemSeed): Nr1Item => ({
  id, texto, referencia, escala, direcao,
  tipoCampo: 'select',
  obrigatorioNucleo: nucleo,
  fatoresRiscoIds: fatoresDoItem(id),
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
    /* Espelho do catálogo: o fator é que aponta o domínio (`dimensaoId`). */
    fatoresRiscoIds: nr1FatoresRisco.filter((f) => f.dimensaoId === id).map((f) => f.id),
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
  { id: 'd-juridico', respostas: 3 },
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
  {
    id: 'camp-2024-1s',
    nome: 'Avaliação de riscos psicossociais · 1º semestre 2024',
    protocolo: 'NR1-BCP-2024-001',
    status: 'encerrada',
    modeloId: 'mod-yna',
    modeloNome: 'Modelo YNA de Riscos Psicossociais',
    versao: '1.0',
    inicio: '2024-05-06',
    fim: '2024-05-31',
    elegiveis: 150,
    respostas: 81,
    participacao: participacaoAreas().map((p) => ({ ...p, respostas: Math.round(p.respostas * 0.62) })),
    criadaEm: '2024-04-29',
    encerradaEm: '2024-06-07',
  },
  {
    id: 'camp-2024-2s',
    nome: 'Avaliação de riscos psicossociais · 2º semestre 2024',
    protocolo: 'NR1-BCP-2024-002',
    status: 'encerrada',
    modeloId: 'mod-yna',
    modeloNome: 'Modelo YNA de Riscos Psicossociais',
    versao: '1.0',
    inicio: '2024-11-04',
    fim: '2024-11-29',
    elegiveis: 156,
    respostas: 87,
    participacao: participacaoAreas().map((p) => ({ ...p, respostas: Math.round(p.respostas * 0.66) })),
    criadaEm: '2024-10-28',
    encerradaEm: '2024-12-06',
  },
  {
    id: 'camp-2025-1s',
    nome: 'Avaliação de riscos psicossociais · 1º semestre 2025',
    protocolo: 'NR1-BCP-2025-001',
    status: 'encerrada',
    modeloId: 'mod-yna',
    modeloNome: 'Modelo YNA de Riscos Psicossociais',
    versao: '1.0',
    inicio: '2025-05-05',
    fim: '2025-05-30',
    elegiveis: 162,
    respostas: 92,
    participacao: participacaoAreas().map((p) => ({ ...p, respostas: Math.round(p.respostas * 0.7) })),
    criadaEm: '2025-04-28',
    encerradaEm: '2025-06-06',
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
/* Três ciclos que contam uma história coerente para a reavaliação dos
   planos: no 1º semestre de 2025 Trading (demandas, interface) e Operações
   (organização) aparecem mal; os planos daquele ciclo melhoram parte disso
   no 2º semestre, enquanto Operações piora em organização; 2026 (em campo)
   segue melhorando. A Diretoria tem nota real — fica oculta por
   k-anonimato, mas entra na nota da empresa. */
/* Histórico de 2024 — a empresa vinha piorando em demandas e interface
   (Trading) até o 1º semestre de 2025, quando os primeiros planos entram. */
const MEDIAS_2024_1S: Record<string, number[]> = {
  'd-trading': [2.8, 3.9, 3.8, 3.3, 3.2, 3.9, 3.5, 4.0],
  'd-tech': [3.8, 4.0, 4.1, 3.9, 3.4, 4.0, 3.9, 4.3],
  'd-ops': [3.9, 3.4, 3.4, 3.8, 4.0, 3.9, 3.8, 4.2],
  'd-compliance': [4.0, 4.1, 4.2, 4.1, 4.0, 4.0, 4.0, 4.4],
  'd-rh': [4.1, 4.2, 4.4, 4.3, 4.2, 4.2, 4.1, 4.6],
  'd-diretoria': [3.8, 4.1, 4.2, 4.1, 3.9, 4.0, 3.7, 4.5],
  'd-juridico': [3.7, 4.0, 4.0, 3.8, 3.7, 3.9, 3.6, 4.3],
}

const MEDIAS_2024_2S: Record<string, number[]> = {
  'd-trading': [2.5, 3.8, 3.7, 3.1, 2.9, 3.8, 3.3, 3.9],
  'd-tech': [3.8, 4.0, 4.1, 3.9, 3.2, 4.0, 3.8, 4.3],
  'd-ops': [3.8, 3.1, 3.2, 3.8, 4.0, 3.9, 3.7, 4.1],
  'd-compliance': [4.0, 4.1, 4.2, 4.1, 4.0, 4.0, 3.9, 4.4],
  'd-rh': [4.1, 4.2, 4.4, 4.3, 4.2, 4.2, 4.1, 4.6],
  'd-diretoria': [3.7, 4.1, 4.2, 4.1, 3.8, 4.0, 3.6, 4.5],
  'd-juridico': [3.5, 3.9, 3.9, 3.7, 3.6, 3.8, 3.4, 4.2],
}

const MEDIAS_2025_1S: Record<string, number[]> = {
  'd-trading': [2.3, 3.4, 3.7, 3.0, 2.7, 3.3, 3.2, 3.7],
  'd-tech': [3.3, 4.0, 4.1, 3.4, 3.0, 4.0, 3.6, 3.8],
  'd-ops': [3.3, 2.9, 3.1, 3.3, 4.0, 3.3, 3.5, 3.7],
  'd-compliance': [4.0, 4.1, 4.2, 4.1, 4.0, 4.0, 3.9, 4.4],
  'd-rh': [4.1, 4.2, 4.4, 4.3, 4.2, 4.2, 4.1, 4.6],
  'd-diretoria': [3.7, 4.1, 4.2, 4.1, 3.8, 4.0, 3.6, 4.5],
  'd-juridico': [3.4, 3.8, 3.9, 3.6, 3.5, 3.7, 3.3, 4.2],
}

const MEDIAS_2025_2S: Record<string, number[]> = {
  'd-trading': [2.7, 3.4, 3.8, 3.1, 3.3, 3.3, 3.4, 3.7],
  'd-tech': [3.3, 4.1, 4.2, 3.4, 3.4, 4.1, 3.6, 3.8],
  'd-ops': [3.3, 2.6, 3.0, 3.3, 4.0, 3.3, 3.5, 3.7],
  'd-compliance': [4.0, 4.1, 4.2, 4.1, 4.0, 4.1, 4.0, 4.4],
  'd-rh': [4.2, 4.3, 4.4, 4.3, 4.2, 4.3, 4.2, 4.6],
  'd-diretoria': [3.8, 4.1, 4.2, 4.1, 3.9, 4.1, 3.7, 4.5],
  'd-juridico': [3.5, 3.9, 4.0, 3.7, 3.6, 3.8, 3.4, 4.3],
}

/* 1º semestre 2026 (o ciclo em campo) — mais variado, para a demonstração
   de encerrar o ciclo: Trading volta a piorar (demandas e saúde críticas),
   Operações fica crítica em organização, Tecnologia em risco na interface
   trabalho-indivíduo e Compliance/Pessoas seguem bem. */
const MEDIAS_2026_1S: Record<string, number[]> = {
  'd-trading': [1.7, 3.4, 2.6, 2.3, 2.1, 3.2, 1.8, 3.6],
  'd-tech': [3.4, 4.1, 3.9, 3.0, 2.4, 3.7, 3.1, 4.3],
  'd-ops': [2.8, 1.9, 2.7, 3.3, 3.6, 2.9, 2.5, 3.8],
  'd-compliance': [4.2, 4.0, 4.4, 4.1, 3.8, 4.3, 4.0, 4.6],
  'd-rh': [4.4, 4.6, 4.7, 4.5, 4.3, 4.6, 4.4, 4.8],
  'd-diretoria': [3.2, 4.0, 4.2, 3.9, 2.9, 4.1, 3.0, 4.5],
  'd-juridico': [3.0, 3.8, 3.6, 3.4, 3.1, 3.7, 3.2, 4.2],
}

const MEDIAS_POR_CAMPANHA: Record<string, Record<string, number[]>> = {
  'camp-2024-1s': MEDIAS_2024_1S,
  'camp-2024-2s': MEDIAS_2024_2S,
  'camp-2025-1s': MEDIAS_2025_1S,
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
   Motor de cálculo dos fatores de risco
   Probabilidade = nota média das perguntas vinculadas ao fator (a mesma
   régua de 1 a 5 do mapa de calor, opção A); nível = P × S, com a
   severidade fixa do fator. A partir de `NR1_GATILHO_PLANO` o fator
   "requer plano de ação"; de 4 a 8, "monitorar".
   ------------------------------------------------------------------ */

/** Nível (P × S) a partir do qual o fator requer plano de ação. */
export const NR1_GATILHO_PLANO = 9

/** Nota média (1–5, 5 = desejável) → probabilidade (1–5). Cortes
   alinhados às faixas do mapa de calor — pendentes de validação de SST. */
export function nr1ProbabilidadePorMedia(media: number): number {
  if (media >= 4.0) return 1
  if (media >= 3.5) return 2
  if (media >= 3.0) return 3
  if (media >= 2.5) return 4
  return 5
}

export function nr1SituacaoPorNivel(nivelNum: number): Nr1FatorSituacao {
  if (nivelNum >= NR1_GATILHO_PLANO) return 'requer-plano'
  if (nivelNum >= 4) return 'monitorar'
  return 'controlado'
}

const respostasDe = (campanhaId: string, departamentoId: string) =>
  nr1Campanhas.find((c) => c.id === campanhaId)?.participacao.find((p) => p.departamentoId === departamentoId)?.respostas ?? 0

/** Nota da empresa num domínio: média das áreas ponderada pelos
   respondentes, incluindo as que ficam ocultas por k-anonimato (elas não
   aparecem separadas, mas entram aqui). */
export function nr1MediaDimensaoEmpresa(campanhaId: string, dimIdx: number): number {
  const tabela = MEDIAS_POR_CAMPANHA[campanhaId] ?? MEDIAS_2026_1S
  let soma = 0
  let peso = 0
  for (const d of rhDepartamentos) {
    const media = tabela[d.id]?.[dimIdx] ?? 0
    const n = respostasDe(campanhaId, d.id)
    if (media > 0 && n > 0) { soma += media * n; peso += n }
  }
  return peso ? Number((soma / peso).toFixed(1)) : 0
}

/* ------------------------------------------------------------------
   Recortes do resultado: empresa, cada área com respondentes suficientes e
   "Outros departamentos" — as áreas abaixo do k-anonimato agregadas numa
   só linha (que também fica oculta se, somadas, não chegarem ao k).
   ------------------------------------------------------------------ */

export const NR1_RECORTE_OUTROS = 'outros'

export function nr1RecortesDoCiclo(campanhaId: string) {
  const deps = rhDepartamentos.map((d) => ({ id: d.id, nome: d.nome, respondentes: respostasDe(campanhaId, d.id) }))
  const pequenos = deps.filter((d) => d.respondentes < NR1_PONTUACAO.kAnonimato)
  const somaPequenos = pequenos.reduce((s, d) => s + d.respondentes, 0)
  return {
    visiveis: deps.filter((d) => d.respondentes >= NR1_PONTUACAO.kAnonimato),
    outros: pequenos.length > 0
      ? { nomes: pequenos.map((d) => d.nome), ids: pequenos.map((d) => d.id), respondentes: somaPequenos, protegido: somaPequenos < NR1_PONTUACAO.kAnonimato }
      : null,
  }
}

/** Nota de cada domínio (na ordem de `NR1_DIMENSOES`) num recorte:
   `null` = empresa (ponderada, com todas as áreas); `'outros'` = as áreas
   pequenas agregadas, ponderadas pelos respondentes; senão, a área. `null`
   no resultado quando o recorte não tem dado (k-anonimato). */
export function nr1MediasDoRecorte(campanhaId: string, recorte: string | null): (number | null)[] {
  const tabela = MEDIAS_POR_CAMPANHA[campanhaId] ?? MEDIAS_2026_1S
  if (recorte === null) return NR1_DIMENSOES.map((_, i) => nr1MediaDimensaoEmpresa(campanhaId, i) || null)
  const { visiveis, outros } = nr1RecortesDoCiclo(campanhaId)
  if (recorte === NR1_RECORTE_OUTROS) {
    if (!outros || outros.protegido) return NR1_DIMENSOES.map(() => null)
    return NR1_DIMENSOES.map((_, i) => {
      let soma = 0
      let peso = 0
      for (const id of outros.ids) {
        const n = respostasDe(campanhaId, id)
        const m = tabela[id]?.[i] ?? 0
        if (m > 0 && n > 0) { soma += m * n; peso += n }
      }
      return peso ? Number((soma / peso).toFixed(1)) : null
    })
  }
  if (!visiveis.some((d) => d.id === recorte)) return NR1_DIMENSOES.map(() => null)
  return NR1_DIMENSOES.map((_, i) => tabela[recorte]?.[i] || null)
}

/** Ciclo imediatamente anterior na cronologia (qualquer ciclo). */
export const nr1CicloAnteriorDe = (campanhaId: string) => nr1CampanhaAnterior(campanhaId)

/** Dimensões (com itens) da versão aplicada no ciclo. */
function dimensoesDaCampanha(campanhaId: string): Nr1Dimensao[] {
  const c = nr1Campanhas.find((x) => x.id === campanhaId)
  const m = c && nr1Modelos.find((x) => x.id === c.modeloId)
  return m?.versoes.find((v) => v.versao === c!.versao)?.dimensoes ?? []
}

/** Nota de cada pergunta num recorte — o mesmo espalhamento determinístico
   que a pontuação por pergunta das telas usa (`nr1DistribuirPorItem`, com
   a mesma semente), para os números nunca discordarem. `null` = empresa. */
export function nr1MediasPorItem(campanhaId: string, departamentoId: string | null): Map<string, { texto: string; media: number; fatores: string[] }> {
  const tabela = MEDIAS_POR_CAMPANHA[campanhaId] ?? MEDIAS_2026_1S
  const mapa = new Map<string, { texto: string; media: number; fatores: string[] }>()
  for (const dim of dimensoesDaCampanha(campanhaId)) {
    const idx = NR1_DIMENSOES.findIndex((d) => d.id === dim.id)
    const media = departamentoId ? (tabela[departamentoId]?.[idx] ?? 0) : nr1MediaDimensaoEmpresa(campanhaId, idx)
    if (!media) continue
    const distrib = nr1DistribuirPorItem(dim.itens.map((i) => i.id), media, `${campanhaId}-${dim.id}-${departamentoId ?? 'empresa'}`)
    for (const it of dim.itens) mapa.set(it.id, { texto: it.texto, media: distrib.find((x) => x.itemId === it.id)!.media, fatores: it.fatoresRiscoIds ?? [] })
  }
  return mapa
}

/** Avalia todos os fatores do catálogo num ciclo: um registro por fator ×
   departamento visível (k-anonimato) e um por fator na empresa inteira
   (`departamentoId: null`). Fator sem nenhuma pergunta aplicada no ciclo
   fica de fora. */
export function nr1AvaliarFatores(campanhaId: string): Nr1FatorAvaliado[] {
  const recortes: { id: string | null; respondentes: number }[] = [
    ...rhDepartamentos
      .map((d) => ({ id: d.id as string | null, respondentes: respostasDe(campanhaId, d.id) }))
      .filter((r) => r.respondentes >= NR1_PONTUACAO.kAnonimato),
    { id: null, respondentes: rhDepartamentos.reduce((s, d) => s + respostasDe(campanhaId, d.id), 0) },
  ]
  const out: Nr1FatorAvaliado[] = []
  for (const r of recortes) {
    const itens = nr1MediasPorItem(campanhaId, r.id)
    for (const f of nr1FatoresRisco) {
      /* Perguntas da versão aplicada no ciclo que indicam este fator. */
      const perguntas = [...itens.entries()]
        .filter(([, v]) => v.fatores.includes(f.id))
        .map(([id]) => ({ itemId: id, texto: itens.get(id)!.texto, media: itens.get(id)!.media, nivel: nr1NivelPorMedia(itens.get(id)!.media) }))
        .sort((a, b) => a.media - b.media)
      if (perguntas.length === 0) continue
      const media = Number((perguntas.reduce((s, p) => s + p.media, 0) / perguntas.length).toFixed(1))
      const probabilidade = nr1ProbabilidadePorMedia(media)
      const nivelNum = probabilidade * f.severidade
      out.push({
        fatorId: f.id, campanhaId, departamentoId: r.id, respondentes: r.respondentes,
        media, probabilidade, severidade: f.severidade, nivelNum,
        nivel: nr1NivelPorProduto(nivelNum), situacao: nr1SituacaoPorNivel(nivelNum), perguntas,
      })
    }
  }
  return out
}

/** Leitura de um fator (mesmo recorte) entre o ciclo anterior e o atual.
   Dentro do gatilho, o nível (P × S) muda em degraus — a nota média é que
   mostra a direção: variação acima de `LIMIAR_TENDENCIA` (o mesmo da
   tendência dos riscos) conta como melhora ou piora. */
export function nr1EvolucaoFator(anterior: Nr1FatorAvaliado | undefined, atual: Nr1FatorAvaliado): Nr1FatorEvolucao {
  if (!anterior || anterior.situacao !== 'requer-plano') return atual.situacao === 'requer-plano' ? 'novo' : 'sem-mudanca'
  if (atual.situacao !== 'requer-plano') return 'saiu-do-gatilho'
  const delta = atual.media - anterior.media
  if (atual.nivelNum < anterior.nivelNum || delta > LIMIAR_TENDENCIA) return 'melhorou'
  if (atual.nivelNum > anterior.nivelNum || delta < -LIMIAR_TENDENCIA) return 'piorou'
  return 'sem-mudanca'
}

/** Ciclo encerrado imediatamente anterior a outro (para a reavaliação). */
export function nr1CampanhaAnterior(campanhaId: string): string | undefined {
  const i = CAMPANHAS_CRONOLOGICAS.indexOf(campanhaId)
  return i > 0 ? CAMPANHAS_CRONOLOGICAS[i - 1] : undefined
}

/* ------------------------------------------------------------------
   Inventário de riscos para o PGR (RF-D01)
   ------------------------------------------------------------------ */

/* ------------------------------------------------------------------
   Riscos gerados (nova estrutura). Cada risco do inventário é um fator do
   catálogo num ciclo encerrado, com os departamentos em que as respostas o
   apontaram (o grupo exposto) — gerado pelo motor (`nr1AvaliarFatores`), o
   RH não cadastra P × S. O RH pode incluir um fator numa área que o
   questionário não apontou; essa decisão fica registrada à parte.
   ------------------------------------------------------------------ */

/** Ordem cronológica das campanhas — a mesma base do heatmap por campanha. */
const CAMPANHAS_CRONOLOGICAS = ['camp-2024-1s', 'camp-2024-2s', 'camp-2025-1s', 'camp-2025-2s', 'camp-2026-1s']

/** Inclusão, pelo RH, de um fator numa área de um ciclo. Mutável. */
export interface Nr1DecisaoFator {
  riscoId: string
  campanhaId: string
  fatorId: string
  departamentoId: string | null
  tipo: 'incluido'
  justificativa: string
  autor: string
  em: string
}

export const nr1DecisoesFator: Nr1DecisaoFator[] = []

/** Reavaliação de um plano do ciclo anterior, feita quando um ciclo novo
   encerra: a decisão do RH sobre o fator (a efetividade de cada ação fica
   na própria ação). */
export interface Nr1Reavaliacao {
  /** Ciclo em que a reavaliação foi feita (o novo). */
  campanhaId: string
  riscoAnteriorId: string
  decisao: 'encerrar' | 'manter' | 'revisar'
  autor: string
  em: string
}

export const nr1Reavaliacoes: Nr1Reavaliacao[] = []

/** Conclusão manual ("Concluir risco") — vence o status calculado. */
export const nr1StatusManual = new Map<string, Nr1RiscoStatus>()

/** Id estável do risco gerado: ciclo + fator. */
export const nr1RiscoIdGerado = (campanhaId: string, fatorId: string) => `rg-${campanhaId}-${fatorId}`

/** Ciclos encerrados, do mais antigo para o mais recente. */
export const nr1CampanhasEncerradas = () =>
  CAMPANHAS_CRONOLOGICAS.filter((id) => nr1Campanhas.find((c) => c.id === id)?.status === 'encerrada')

/** Ciclo que alimenta o inventário atual — o último encerrado. */
export const nr1CampanhaVigente = () => nr1CampanhasEncerradas().slice(-1)[0]

const STATUS_POR_EVOLUCAO: Record<Nr1FatorEvolucao, Nr1RiscoStatus> = {
  novo: 'identificado',
  melhorou: 'monitorando',
  'sem-mudanca': 'monitorando',
  piorou: 'regredido',
  'saiu-do-gatilho': 'controlado',
}

const RECOMENDACAO_POR_EVOLUCAO: Partial<Record<Nr1FatorEvolucao, Nr1AcaoRecomendada>> = {
  melhorou: 'manter-com-monitoramento',
  'sem-mudanca': 'revisar-plano',
  piorou: 'revisar-plano',
}

const nomeDoRecorte = (departamentoId: string | null) =>
  departamentoId ? (rhDepartamentos.find((d) => d.id === departamentoId)?.nome ?? departamentoId) : 'Toda a empresa'

const grupoDeAvaliacao = (av: Nr1FatorAvaliado, incluido: boolean): Nr1GrupoExposto => ({
  departamentoId: av.departamentoId,
  departamento: nomeDoRecorte(av.departamentoId),
  respondentes: av.respondentes,
  media: av.media,
  probabilidade: av.probabilidade,
  nivelNum: av.nivelNum,
  nivel: av.nivel,
  incluido: incluido || undefined,
})

/** Monta o risco de um fator num ciclo a partir das avaliações do fator.
   O grupo exposto são as áreas visíveis em que o fator requer plano (mais
   as incluídas pelo RH); se nenhuma área chega ao gatilho mas a empresa
   inteira sim, o grupo é a empresa. Sem grupo, não há risco. */
function riscoDoFator(campanhaId: string, f: Nr1FatorRisco, avs: Nr1FatorAvaliado[], anteriores: Nr1FatorAvaliado[]): Nr1RiscoInventario | undefined {
  const id = nr1RiscoIdGerado(campanhaId, f.id)
  const incluidas = nr1DecisoesFator.filter((d) => d.riscoId === id && d.tipo === 'incluido')
  const incluida = (dep: string | null) => incluidas.some((d) => d.departamentoId === dep)
  const apontada = (av: Nr1FatorAvaliado) => av.situacao === 'requer-plano'

  const areas = avs.filter((av) => av.departamentoId !== null && (apontada(av) || incluida(av.departamentoId)))
  const empresa = avs.find((av) => av.departamentoId === null)
  const selecionadas = areas.length > 0 ? areas : empresa && (apontada(empresa) || incluida(null)) ? [empresa] : []
  if (selecionadas.length === 0) return undefined

  const ordenadas = [...selecionadas].sort((x, y) => y.nivelNum - x.nivelNum || x.media - y.media)
  const grupos = ordenadas.map((av) => grupoDeAvaliacao(av, !apontada(av)))
  const av = ordenadas[0]!
  const origem: 'questionario' | 'manual' = ordenadas.some(apontada) ? 'questionario' : 'manual'

  const anterior = anteriores.find((x) => x.fatorId === f.id && x.departamentoId === av.departamentoId)
  const evolucao = nr1EvolucaoFator(anterior, av)
  const variacao = anterior ? Number((av.media - anterior.media).toFixed(1)) : undefined
  /* Status e sugestão só falam de plano quando houve plano no ciclo
     anterior — fator que segue apontado sem nunca ter tido ação é, para
     todos os efeitos, um risco identificado que ainda espera o primeiro. */
  const tinhaPlano = !!anterior && nr1Acoes.some((a) => a.riscoId === nr1RiscoIdGerado(anterior.campanhaId, f.id))
  const leitura: Nr1FatorEvolucao = origem === 'manual' ? 'novo' : !tinhaPlano && evolucao !== 'piorou' ? 'novo' : evolucao
  const departamentoIds = grupos.map((g) => g.departamentoId).filter((d): d is string => d !== null)
  return {
    id,
    dimensaoId: f.dimensaoId,
    dimensao: nr1DimensaoNome(f.dimensaoId),
    fator: f.nome,
    fatorRiscoId: f.id,
    fontesGeradorasIds: f.fontesGeradorasIds,
    danos: f.cidIds.map((c) => nr1Cids.find((x) => x.id === c)).filter(Boolean).map((c) => `${c!.nome} (${c!.codigo})`).join('; '),
    grupoExposto: grupos.map((g) => g.departamento).join(', '),
    departamentoIds,
    grupos,
    respondentes: grupos.reduce((soma, g) => soma + g.respondentes, 0),
    probabilidade: av.probabilidade,
    severidade: av.severidade,
    nivelNum: av.nivelNum,
    nivel: av.nivel,
    /* Ações vigentes do risco (versão já substituída por outra não conta). */
    controles: nr1Acoes.filter((a) => a.riscoId === id && !nr1Acoes.some((b) => b.versaoAnteriorId === a.id)).map((a) => a.oQue),
    campanhaId,
    status: nr1StatusManual.get(id) ?? STATUS_POR_EVOLUCAO[leitura],
    tendencia: variacao === undefined ? undefined : variacao > LIMIAR_TENDENCIA ? 'melhorando' : variacao < -LIMIAR_TENDENCIA ? 'piorando' : 'estavel',
    variacaoPontos: variacao,
    /* Piorou sem nunca ter tido plano: não há plano a revisar — escalar. */
    acaoRecomendada: leitura === 'piorou' && !tinhaPlano ? 'escalar' : RECOMENDACAO_POR_EVOLUCAO[leitura],
    avaliacao: av,
    origem,
    justificativaInclusao: incluidas[0]?.justificativa,
  }
}

/** Riscos de um ciclo: um por fator apontado (ou incluído pelo RH). */
export function nr1RiscosGerados(campanhaId: string): Nr1RiscoInventario[] {
  const atuais = nr1AvaliarFatores(campanhaId)
  const idAnterior = nr1CampanhaAnterior(campanhaId)
  const anteriores = idAnterior ? nr1AvaliarFatores(idAnterior) : []
  return nr1FatoresRisco
    .map((f) => riscoDoFator(campanhaId, f, atuais.filter((av) => av.fatorId === f.id), anteriores))
    .filter((r): r is Nr1RiscoInventario => !!r)
}

/** O risco visto de um recorte: com um departamento, probabilidade e nível
   passam a ser os daquela área (sem a área no grupo exposto, `undefined`);
   com 'empresa', o risco como está (o maior nível entre as áreas). */
export function nr1RiscoNoRecorte(r: Nr1RiscoInventario, recorte: string): Nr1RiscoInventario | undefined {
  if (recorte === 'empresa') return r
  const g = r.grupos.find((x) => x.departamentoId === recorte)
  if (!g) return undefined
  return { ...r, probabilidade: g.probabilidade, nivelNum: g.nivelNum, nivel: g.nivel, respondentes: g.respondentes, grupoExposto: g.departamento }
}

/** Inventário atual — os riscos do último ciclo encerrado. */
export const nr1Inventario = (): Nr1RiscoInventario[] => {
  const vigente = nr1CampanhaVigente()
  return vigente ? nr1RiscosGerados(vigente) : []
}

/** Riscos de todos os ciclos encerrados — para resolver o risco de origem
   de qualquer ação, inclusive as de ciclos anteriores. */
export const nr1RiscosTodos = (): Nr1RiscoInventario[] => nr1CampanhasEncerradas().flatMap(nr1RiscosGerados)


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

/* As ações de exemplo contam a história dos ciclos: no 1º semestre de 2025
   a sobrecarga de Trading e a da empresa ganharam plano; a da empresa saiu
   do gatilho, a de Trading melhorou só em parte e virou a v2. No 2º
   semestre de 2025, Trading e Operações têm planos em andamento — e ainda
   há fatores apontados sem plano (recompensas e eventos em Trading, assédio
   em Operações), que é o trabalho do RH no Inventário de riscos. */
const FATOR_SOBRECARGA = 'fator-excesso-de-demandas-no-trabalho-sobrecarga'
const RG_SOBRECARGA_25_1 = nr1RiscoIdGerado('camp-2025-1s', FATOR_SOBRECARGA)
const RG_SOBRECARGA_25_2 = nr1RiscoIdGerado('camp-2025-2s', FATOR_SOBRECARGA)
const RG_SUPORTE_25_2 = nr1RiscoIdGerado('camp-2025-2s', 'fator-falta-de-suporte-apoio-no-trabalho')
const RG_AUTONOMIA_25_2 = nr1RiscoIdGerado('camp-2025-2s', 'fator-baixo-controle-no-trabalho-falta-de-autonomia')
const RG_CLAREZA_25_2 = nr1RiscoIdGerado('camp-2025-2s', 'fator-baixa-clareza-de-papel-funcao')
const RG_SUPORTE_25_1 = nr1RiscoIdGerado('camp-2025-1s', 'fator-falta-de-suporte-apoio-no-trabalho')

export const nr1Acoes: Nr1Acao[] = [
  {
    id: 'a-01', riscoId: RG_SOBRECARGA_25_1,
    oQue: 'Instituir janela de pausa obrigatória escalonada durante o pregão',
    porQue: 'Reduzir a exposição ao ritmo acelerado sem pausa, principal fator de risco da mesa.',
    quem: 'Ricardo Alencar · Trading & Mercados',
    quando: '2025-09-30', onde: 'Trading & Mercados',
    como: 'Escala de revezamento em dois blocos de 20 minutos, com cobertura cruzada entre duplas.',
    quanto: 'Sem custo direto, só reorganização de escala',
    status: 'concluida',
    concluidaEm: '2025-09-26',
    comentarios: [
      { id: 'com-01', autor: 'Ricardo Alencar', texto: 'Escala publicada e já rodando desde a semana passada.', arquivos: ['escala-revezamento-pregao-ago25.pdf'], em: '2025-08-14' },
    ],
    versao: 1,
    /* O risco saiu de crítico para risco entre os dois ciclos — melhorou,
       mas não o bastante para sair da faixa grave. Daí a v2 abaixo. */
    efetividade: 'parcialmente-efetiva',
  },
  {
    id: 'a-01-v2', riscoId: RG_SOBRECARGA_25_2,
    oQue: 'Instituir pausa obrigatória escalonada + limitar concorrência de posições por trader',
    porQue: 'A escala de pausas ajudou (crítico → risco no último ciclo), mas o risco ainda está na faixa grave — o ritmo em si segue alto.',
    quem: 'Ricardo Alencar · Trading & Mercados',
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
    id: 'a-02', riscoId: RG_SOBRECARGA_25_2,
    oQue: 'Revisar o dimensionamento da equipe nos horários de pico',
    porQue: 'A carga concentrada excede a capacidade da equipe atual.',
    quem: 'Camila Risi · Pessoas & DHO',
    quando: '2026-08-15', onde: 'Trading & Mercados, Tecnologia',
    como: 'Estudo de carga por faixa horária e proposta de duas contratações.',
    quanto: 'R$ 28.000/mês (estimativa)',
    status: 'planejada',
    comentarios: [],
    versao: 1,
  },
  {
    id: 'a-03', riscoId: RG_SOBRECARGA_25_1,
    oQue: 'Publicar política de desconexão com regras por área',
    porQue: 'Formalizar o limite de disponibilidade fora do horário e reduzir a hiperconexão.',
    quem: 'Camila Risi · Pessoas & DHO',
    quando: '2025-08-29', onde: 'Toda a empresa',
    como: 'Política aprovada pelo jurídico, comunicada por e-mail e treinamento de liderança.',
    quanto: 'Sem custo direto',
    status: 'concluida',
    concluidaEm: '2025-08-27',
    comentarios: [
      { id: 'com-04', autor: 'Camila Risi', texto: 'Política publicada na intranet e apresentada às lideranças.', arquivos: ['politica-desconexao-v1.pdf'], em: '2025-08-27' },
    ],
    versao: 1,
  },
  {
    id: 'a-04', riscoId: RG_AUTONOMIA_25_2,
    oQue: 'Definir alçadas de decisão da equipe de Operações',
    porQue: 'Dar autonomia real sobre o próprio trabalho — o controle caiu de um ciclo para o outro.',
    quem: 'Paula Mendes · Pessoas & DHO',
    quando: '2026-09-30', onde: 'Operações, Tecnologia',
    como: 'Listar as decisões do dia a dia e combinar com a equipe o que ela decide sem aprovação.',
    quanto: 'Sem custo direto',
    status: 'planejada',
    comentarios: [],
    versao: 1,
  },
  {
    id: 'a-05', riscoId: RG_SUPORTE_25_2,
    oQue: 'Formalizar rotina de 1:1 quinzenal com a liderança',
    porQue: 'Garantir espaço regular de escuta e apoio da liderança.',
    quem: 'Marcos Tavares · Tecnologia',
    quando: '2026-06-15', onde: 'Trading & Mercados, Operações, Tecnologia',
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
    id: 'a-06', riscoId: RG_CLAREZA_25_2,
    oQue: 'Publicar o desenho de papéis e responsabilidades de Operações',
    porQue: 'As pessoas da área não sabem exatamente o que se espera delas.',
    quem: 'Marcos Tavares · Tecnologia',
    quando: '2026-06-20', onde: 'Operações',
    como: 'Matriz de responsabilidades revisada com a equipe e publicada em local acessível.',
    quanto: 'Sem custo direto',
    status: 'atrasada',
    versao: 1,
    comentarios: [],
  },
  {
    id: 'a-07', riscoId: RG_SUPORTE_25_1,
    oQue: 'Capacitar líderes da mesa em escuta e feedback',
    porQue: 'Líderes precisam de preparo para apoiar a equipe no dia a dia do pregão.',
    quem: 'Paula Mendes · Pessoas & DHO',
    quando: '2025-10-31', onde: 'Trading & Mercados, Operações',
    como: 'Dois encontros práticos com os coordenadores da mesa, com roteiro de 1:1.',
    quanto: 'R$ 9.800',
    status: 'concluida',
    concluidaEm: '2025-10-24',
    comentarios: [
      { id: 'com-05', autor: 'Paula Mendes', texto: 'Encontros realizados com os 6 coordenadores. Lista de presença anexa.', arquivos: ['presenca-escuta-feedback-out25.pdf'], em: '2025-10-24' },
    ],
    versao: 1,
  },
]

/* Log de atividade inicial das ações — criação, comentários/evidências e
   conclusão, montados a partir dos próprios dados semeados acima (datas de
   criação estimadas, só para o histórico ter começo). */
const CRIACAO_ACOES: Record<string, [em: string, autor: string]> = {
  'a-01': ['2025-06-16T09:12', 'Camila Risi'],
  'a-01-v2': ['2026-06-22T16:40', 'Camila Risi'],
  'a-02': ['2026-05-04T09:31', 'Camila Risi'],
  'a-03': ['2025-06-18T11:05', 'Camila Risi'],
  'a-04': ['2026-05-11T14:20', 'Camila Risi'],
  'a-05': ['2026-05-12T10:02', 'Camila Risi'],
  'a-06': ['2026-05-15T15:47', 'Camila Risi'],
  'a-07': ['2025-06-20T10:40', 'Camila Risi'],
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
      { id: 'an-02', em: '2026-06-20', texto: 'Apuração iniciada com apoio do comitê de ética. Sigilo da autoria preservado.', autor: 'Camila Risi · Pessoas & DHO' },
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
      { id: 'an-05', em: '2026-05-29', texto: 'Mediação conduzida com as lideranças envolvidas.', autor: 'Paula Mendes · Pessoas & DHO' },
      { id: 'an-06', em: '2026-06-04', texto: 'Acordo de convivência registrado. Caso encerrado com acompanhamento no próximo ciclo.', autor: 'Camila Risi · Pessoas & DHO' },
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

/** Histórico de ciclos — derivado das campanhas e da mesma nota da empresa
   do motor de cálculo (`nr1MediaDimensaoEmpresa`), do mais antigo ao mais
   recente. */
export const nr1Ciclos: Nr1Ciclo[] = CAMPANHAS_CRONOLOGICAS.map((id) => {
  const c = nr1Campanhas.find((x) => x.id === id)!
  return {
    campanhaId: c.id,
    nome: (c.nome.split('·').pop() ?? c.nome).trim(),
    encerradaEm: c.encerradaEm,
    modeloNome: c.modeloNome,
    versao: c.versao,
    participacaoPct: Math.round((c.participacao.reduce((s, p) => s + p.respostas, 0) / c.elegiveis) * 100),
    mediaPorDimensao: NR1_DIMENSOES.map((d, i) => ({ dimensaoId: d.id, media: nr1MediaDimensaoEmpresa(c.id, i) })),
  }
})

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

