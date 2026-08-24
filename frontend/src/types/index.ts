export interface UserProfile {
  id: string
  name: string
  nickname: string
  email: string
  company: string
  department: string
}

/* ============================================================
   FLUXO 1 — RH / EMPRESA B2B (tipos isolados)
   Jornada do RH/DHO (Master/Operador). Não se conecta aos
   dados individuais do colaborador: tudo é agregado e
   anonimizado (k-anonimato ≥ 4). Ver Seção 5 do documento.
   ============================================================ */

/** Status do colaborador no quadro da empresa (visão RH). */
export type RhColaboradorStatus =
  | 'nao_convidado'
  | 'convidado'
  | 'ativo'

/** Papel do usuário corporativo na plataforma. */
export type RhPapel = 'master' | 'operador'

/** Dados da conta corporativa (criada pelo backoffice YNA no kick-off).
   `plano`/`colaboradoresContratados`/`contratoInicio`/`contratoFim` são só
   dado cadastral (§12): sem parcelas nem cobrança neste recorte. */
export interface RhEmpresa {
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  segmento: string
  contatoRh: string
  plano: string
  colaboradoresContratados: number
  contratoInicio: string
  contratoFim: string
  initials: string
}

/** Usuário corporativo (Master ou Operador). */
export interface RhUsuario {
  id: string
  nome: string
  email: string
  papel: RhPapel
  initials: string
  palette: 'lavender' | 'pink' | 'yellow'
  status: 'ativo' | 'convidado'
  ultimoAcesso?: string
}

/** Nó da árvore de departamentos (base do mapa de calor NR-1). */
export interface RhDepartamento {
  id: string
  nome: string
  colaboradores: number
}

/** Colaborador na visão do RH — sem nenhum dado clínico/de jornada. */
export interface RhColaborador {
  id: string
  nomeCompleto: string
  cpfMascarado: string
  emailCorporativo: string
  departamentoId: string
  status: RhColaboradorStatus
  convidadoEm?: string
  initials: string
  palette: 'lavender' | 'pink' | 'yellow'
}

/** Funil de convites (agregado, sem identificação individual). */
export interface RhFunilConvites {
  enviado: number
  aberto: number
  cadastroIniciado: number
  cadastroConcluido: number
}

/** Linha com erro de validação na importação por planilha. */
export interface RhImportErro {
  linha: number
  nome: string
  email: string
  erro: string
}

/** Resultado do processamento de uma carga via planilha. */
export interface RhImportResult {
  total: number
  validos: number
  duplicados: number
  erros: RhImportErro[]
}

export interface RhNotificacao {
  id: string
  tipo: 'adesao' | 'nr1' | 'plataforma' | 'licenca'
  icon: string
  titulo: string
  descricao: string
  quando: string
  lida: boolean
}

/* ============================================================
   FLUXO 4 — MANAGER / BACKOFFICE YNA (tipos isolados)
   "Motor interno" da plataforma: governa empresas clientes, o instrumento
   NR-1 (modelos, versões, núcleo) e o suporte. Ver Seção 8 do documento.
   ============================================================ */

/** Perfil de gestor YNA (§8.1). */
export type MngPerfilGestor = 'super-admin' | 'comercial' | 'suporte' | 'branding'

export interface MngGestor {
  id: string
  nome: string
  email: string
  perfil: MngPerfilGestor
  /** Acesso total (independe do perfil funcional). */
  superAdmin?: boolean
  initials: string
  palette: 'lavender' | 'pink' | 'yellow'
  status: 'ativo' | 'convidado' | 'inativo'
  mfa: boolean
  ultimoAcesso?: string
}

/* Empresas + controle de contratos (§8.4). Financeiro/parcelas/plano
   comercial ficaram fora deste recorte (§12): o contrato é só dado
   cadastral (vigência, status), sem cobrança. */
export type MngContratoStatus = 'vigente' | 'encerrado' | 'cancelado'
export interface MngContrato {
  id: string
  /** Plano contratado (ex.: "Conformidade NR-1 · Corporativo"). */
  plano: string
  colaboradoresContratados: number
  inicio: string
  fim: string
  status: MngContratoStatus
  /** % de execução por meses decorridos sobre a vigência. */
  execucaoPct: number
}
export type MngEmpresaStatus = 'ativa' | 'bloqueada' | 'inativa'

/** Contato do usuário Master (RH) da empresa. */
export interface MngContatoMaster { nome: string; email: string; telefone: string }

/** Funil de convites agregado da empresa (base do dashboard RH). */
export interface MngFunilConvites {
  enviado: number
  aberto: number
  cadastroIniciado: number
  cadastroConcluido: number
}

export interface MngEmpresa {
  id: string
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  segmento: string
  contatoRh: string
  status: MngEmpresaStatus
  colaboradoresContratados: number
  colaboradoresAtivos: number
  initials: string
  contratos: MngContrato[]
  /** Usuário(s) Master (RH) da empresa. */
  masters: MngContatoMaster[]
  /** CSM responsável na YNA (id de um gestor com perfil 'comercial'). */
  csmId: string
  funil: MngFunilConvites
}

/** União de tipos de campo de formulário flexível — usada pelo item do
   instrumento NR-1 (`Nr1Item.tipoCampo`). Sem "de profissional" no nome:
   não há mais tipo de profissional neste produto. */
export type CampoTipo = 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'date'

/* Tickets de suporte (§8.9) */
export type MngTicketTipo = 'duvida' | 'lgpd' | 'cadastro' | 'tecnico' | 'queixa'
export type MngTicketStatus = 'aberto' | 'em-andamento' | 'resolvido'

/** Resposta do backoffice a um ticket. */
export interface MngTicketResposta {
  id: string
  autor: string
  em: string          // ISO datetime
  texto: string
  anexos?: string[]
}

export interface MngTicket {
  id: string
  protocolo: string
  tipo: MngTicketTipo
  assunto: string
  descricao: string
  solicitante: string
  empresa: string
  origem: string
  status: MngTicketStatus
  sla: string
  abertoEm: string     // ISO datetime
  prazoEm: string      // ISO datetime — vencimento do SLA
  respostas?: MngTicketResposta[]
}

/** Cockpit de conformidade do backoffice YNA (MNG-02, §5.1). Depois do
   recorte, não há mais dimensão de sessão/profissional/repasse: só o que
   sustenta a operação multiempresa da conformidade NR-1, mais o indicador
   comercial de potencial de adesão futura a cuidado (opt-in, §5.4/RF-J01). */
export interface MngCockpit {
  empresasAtivas: number
  empresasBloqueadas: number
  campanhasEmCampo: number
  adesaoMediaPct: number
  versoesPublicadas: number
  empresasSemInventario: number
  casosCanalEscutaAbertos: number
  /** Agregado, nunca por pessoa: quantas respostas de interesse em cuidado
     futuro (opt-in pós-avaliação) foram "sim"/"talvez", sobre o total de
     respostas coletadas. */
  interesseCuidado: { sim: number; talvez: number; nao: number; total: number }
}

export type MngNotificacaoTipo = 'ticket' | 'nr1'
export interface MngNotificacao {
  id: string
  tipo: MngNotificacaoTipo
  icon: string
  titulo: string
  descricao: string
  quando: string
  lida: boolean
  /** Rota de destino ao clicar (tela de detalhe + filtro correspondente). */
  to: string
}

/* ============================================================
   MÓDULO DE CONFORMIDADE NR-1 — riscos psicossociais
   Atravessa três jornadas: o Manager mantém os MODELOS de avaliação
   (versionados, com núcleo obrigatório), o RH aplica a campanha e opera o
   cockpit, o colaborador responde de forma anônima.

   Duas travas estruturais que o front respeita em todas as telas:
   · k-anonimato — nenhum recorte com menos de `kAnonimato` respondentes é
     exibido ao RH (RF-C05 / RNF-02);
   · versão publicada é imutável — editar publica uma nova versão rascunho,
     e a versão aplicada fica registrada na campanha (RF-A04 / RF-F02).
   ============================================================ */

/** As quatro dimensões de fatores psicossociais do Guia do MTE. */
export type Nr1DimensaoId = 'organizacao' | 'relacoes' | 'ambiente' | 'contexto'

/** Escala de resposta: A = frequência · B = concordância (§7 do questionário). */
export type Nr1EscalaId = 'A' | 'B'

/** Direção do item: positivo (concordar = menor risco) ou reverso (invertido
   antes de somar). */
export type Nr1Direcao = 'positivo' | 'reverso'

/** Item do questionário. `tipoCampo` reusa a união de tipos de campo do
   formulário flexível (`CampoTipo`). */
export interface Nr1Item {
  id: string
  texto: string
  tipoCampo: CampoTipo
  escala: Nr1EscalaId
  direcao: Nr1Direcao
  /** Item do núcleo obrigatório — não removível em modelos derivados. */
  obrigatorioNucleo: boolean
  /** Instrumento-fonte (ex.: "HSE · Demandas"). */
  referencia: string
  /** Só aparece a quem se aplica (trabalho remoto, atendimento ao público). */
  condicional?: boolean
  /** Item sensível (assédio) — sinalizado para a curadoria clínica. */
  sensivel?: boolean
  /** Acrescentado por um modelo de cliente (não faz parte do Modelo YNA). */
  origemCliente?: boolean
  /** Opções — quando `tipoCampo` for select/multiselect. */
  opcoes?: string[]
}

export interface Nr1Dimensao {
  id: Nr1DimensaoId
  nome: string
  descricao: string
  itens: Nr1Item[]
}

export interface Nr1EscalaOpcao { valor: number; rotulo: string }
export interface Nr1EscalaDef { nome: string; opcoes: Nr1EscalaOpcao[] }
/** As duas escalas disponíveis para os itens da versão. */
export type Nr1EscalaConfig = Record<Nr1EscalaId, Nr1EscalaDef>

export type Nr1NivelRisco = 'baixo' | 'atencao' | 'risco' | 'critico'

/** Faixa de corte da média da dimensão → nível de risco (§7 do questionário). */
export interface Nr1FaixaRisco {
  min: number
  max: number
  nivel: Nr1NivelRisco
  label: string
  /** Prioridade de ação NR-1 (ex.: "Ação corretiva prioritária"). */
  acao: string
}

export interface Nr1PontuacaoConfig {
  faixas: Nr1FaixaRisco[]
  /** Mínimo de respondentes para exibir um recorte (k-anonimato ≥ 4). */
  kAnonimato: number
}

/** Ciclo de vida da versão: rascunho → publicada → arquivada.
   Publicada é imutável — editar gera uma nova versão rascunho. */
export type Nr1VersaoStatus = 'rascunho' | 'publicada' | 'arquivada'

export interface Nr1QuestionarioVersao {
  versao: string
  status: Nr1VersaoStatus
  dimensoes: Nr1Dimensao[]
  escala: Nr1EscalaConfig
  pontuacao: Nr1PontuacaoConfig
  criadaEm: string
  publicadaEm?: string
  /** Perguntas abertas opcionais e anônimas (§5 do questionário). */
  abertas: string[]
  /** O que mudou nesta versão — exibido no histórico e no diff. */
  notas?: string
}

/** Escopo do modelo: base mantida pela YNA ou derivado de um cliente. */
export type Nr1Escopo = 'yna' | 'cliente'

export interface Nr1QuestionarioModelo {
  id: string
  nome: string
  escopo: Nr1Escopo
  descricao: string
  /** Empresa dona do modelo (apenas escopo 'cliente'). */
  clienteId?: string
  clienteNome?: string
  /** Versão YNA que originou o derivado (apenas escopo 'cliente'). */
  derivadoDe?: { modeloId: string; versao: string }
  versoes: Nr1QuestionarioVersao[]
}

/* --- Campanha e coleta (RF-B01/B03/B04) --- */

export type Nr1CampanhaStatus = 'rascunho' | 'em-campo' | 'encerrada'

/** Participação por área — base do recorte por grupo exposto (RF-B03). */
export interface Nr1ParticipacaoArea {
  departamentoId: string
  departamento: string
  elegiveis: number
  respostas: number
}

export interface Nr1Campanha {
  id: string
  nome: string
  /** Protocolo único do ciclo de avaliação (RF-F02). */
  protocolo: string
  status: Nr1CampanhaStatus
  /** Modelo + versão aplicados — registro imutável da metodologia (RF-A04). */
  modeloId: string
  modeloNome: string
  versao: string
  inicio: string
  fim: string
  elegiveis: number
  respostas: number
  participacao: Nr1ParticipacaoArea[]
  criadaEm: string
  encerradaEm?: string
}

/* --- Avaliação e mapa de calor (RF-C01/C02/C05) --- */

/** Célula do mapa: `media`/`nivel` nulos = recorte protegido por k-anonimato. */
export interface Nr1CelulaRisco {
  dimensaoId: Nr1DimensaoId
  media: number | null
  nivel: Nr1NivelRisco | null
}

export interface Nr1LinhaMapa {
  departamentoId: string
  departamento: string
  respondentes: number
  /** true quando respondentes < k → células ocultas. */
  protegido: boolean
  celulas: Nr1CelulaRisco[]
}

/* --- Inventário para o PGR (RF-D01) --- */

/** Severidade no padrão GRO: 1 (leve) a 5 (morte). */
export type Nr1Severidade = 1 | 2 | 3 | 4 | 5

/** Situação do risco ao longo dos ciclos — não é o nível numérico (isso é
   `nivel`/`nivelNum`, ponto no tempo), é a leitura de evolução: apareceu,
   está sob controle, piorou apesar do plano, foi eliminado, ou está só
   sendo observado sem ação formal ainda. Calculada por
   `nr1AnalisarEvolucao`, nunca digitada à mão. */
export type Nr1RiscoStatus = 'identificado' | 'controlado' | 'regredido' | 'eliminado' | 'monitorando'

/** Direção do risco entre dois ciclos consecutivos, pela média da
   dimensão/área — que é o mesmo dado do mapa de calor (5 = desejável), não
   uma nova escala. */
export type Nr1Tendencia = 'melhorando' | 'estavel' | 'piorando'

/** Sugestão calculada a partir de nível + tendência (ver `nr1AnalisarEvolucao`).
   É só isso: uma sugestão. Quem decide se o risco "é" isso ou aquilo, e se
   a ação sugerida faz sentido para o caso, é o SST — a plataforma nunca
   aprova nem fecha um risco sozinha. */
export type Nr1AcaoRecomendada = 'manter' | 'manter-com-monitoramento' | 'investigar' | 'revisar-plano' | 'escalar' | 'encerrar'

export interface Nr1RiscoInventario {
  id: string
  dimensaoId: Nr1DimensaoId
  dimensao: string
  /** Descrição do fator/perigo psicossocial. */
  fator: string
  /** Possíveis danos à saúde. */
  danos: string
  /** Grupo de trabalhadores exposto (departamento/GHE) — nomes de
     `departamentoIds` já resolvidos e juntos, para exibição direta. */
  grupoExposto: string
  /** Um risco pode atravessar mais de uma área (ex.: hiperconectividade que
     afeta tanto Trading quanto Tecnologia) — por isso é uma lista, não um
     único departamento. */
  departamentoIds: string[]
  /** Soma dos respondentes de todos os departamentos em `departamentoIds`. */
  respondentes: number
  probabilidade: number
  severidade: Nr1Severidade
  /** probabilidade × severidade. */
  nivelNum: number
  nivel: Nr1NivelRisco
  controles: string[]
  /** Campanha que originou o risco — elo da rastreabilidade (RF-F01). */
  campanhaId: string
  /** Situação calculada a partir do histórico em `Nr1RiscoCiclo` (a partir
     do 2º ciclo em que este risco aparece — antes disso, sempre 'identificado'). */
  status: Nr1RiscoStatus
  /** Delta e sugestão do ciclo mais recente vs o anterior — atalho para não
     recalcular no card da lista; o histórico completo vem de
     `nr1ResultadoService.riscoCiclos`. Ausentes quando há só 1 ciclo de dado. */
  tendencia?: Nr1Tendencia
  variacaoPontos?: number
  acaoRecomendada?: Nr1AcaoRecomendada
  /** Presente quando o risco nasceu da aba "Riscos sugeridos" — rastreia que
     veio de uma leitura assistida do questionário, não de auditoria/
     observação direta do SESMT (mesma disciplina de rastreabilidade do
     RF-F01). */
  origemSugestaoId?: string
}

/** Um ponto no histórico de um risco: sua média/nível na área+dimensão de
   origem, numa campanha específica — o mesmo valor que aparece na célula
   correspondente do mapa de calor daquela campanha, nunca um número à parte. */
export interface Nr1RiscoCiclo {
  riscoId: string
  campanhaId: string
  media: number
  nivel: Nr1NivelRisco
  /** Ausentes no primeiro ciclo em que o risco aparece (não há "antes"). */
  tendencia?: Nr1Tendencia
  variacaoPontos?: number
  variacaoPercentual?: number
  acaoRecomendada?: Nr1AcaoRecomendada
  status: Nr1RiscoStatus
}

/* --- Riscos sugeridos (triagem assistida, NUNCA diagnóstica — RF-D01 ampliado) ---

   ⚠️ Isto é um mecanismo de SUGESTÃO, não de diagnóstico automático. Cada
   `Nr1RiscoSugerido` é um padrão de literatura (COPSOQ II-Br + possível
   associação CID-11), oferecido como ponto de partida para o SST/RH
   investigar — nunca uma conclusão que o produto "decide" sozinho.
   Validação profissional é obrigatória antes de qualquer ação; a
   responsabilidade pela decisão é da empresa contratante. */

/** As 7 leituras de padrão psicossocial oferecidas — não são as únicas
   possíveis, são as que o produto atualmente sabe sugerir. */
export type Nr1RiscoSugeridoCategoria =
  | 'pressao-sobrecarga' | 'falta-autonomia' | 'isolamento-social'
  | 'conflito-trabalho-vida' | 'desalinhamento-valores' | 'burnout' | 'desengajamento'

/** Força da associação entre o padrão de respostas e o código CID — não é a
   probabilidade do GRO (`Nr1Severidade`), é o quanto a literatura associa
   aquele padrão ao código. Nunca é uma probabilidade de diagnóstico real. */
export type Nr1CidProbabilidade = 'alta' | 'media' | 'baixa'

export interface Nr1CidSugerido {
  codigo: string
  descricao: string
  probabilidade: Nr1CidProbabilidade
}

/** Conteúdo fixo de uma sugestão — o que muda ciclo a ciclo é só a leitura
   (`Nr1RiscoSugeridoLeitura`), calculada a partir do mapa de calor real. */
export interface Nr1RiscoSugerido {
  id: string
  categoria: Nr1RiscoSugeridoCategoria
  nome: string
  nomeCurto: string
  descricao: string
  dimensaoId: Nr1DimensaoId
  /** Itens do Modelo YNA mais próximos do padrão descrito — referência para
     quem for investigar, não uma subescala calculada à parte. */
  itensRelacionados: string[]
  /** Nível mínimo da dimensão (mesma escala de `nr1NivelPorMedia`) a partir
     do qual a sugestão passa a ser oferecida como "pode se aplicar". */
  nivelGatilho: Nr1NivelRisco
  acoesRecomendadas: string[]
  monitoramento: string
  cids: Nr1CidSugerido[]
  disclaimerCid: string
}

/** Leitura de uma sugestão num ciclo específico — `mediaEmpresa`/`nivelEmpresa`
   vêm da MESMA média que já aparece no "Risco por dimensão" daquele ciclo, e
   `departamentosEnvolvidos` filtra as mesmas células do mapa de calor (já
   sem os recortes protegidos por k-anonimato) que atingem o gatilho. Nunca
   um número novo. */
export interface Nr1RiscoSugeridoLeitura {
  sugestao: Nr1RiscoSugerido
  mediaEmpresa: number
  nivelEmpresa: Nr1NivelRisco
  disparado: boolean
  departamentosEnvolvidos: { departamentoId: string; departamento: string; media: number; nivel: Nr1NivelRisco }[]
  jaNoInventario: boolean
  riscoInventarioId?: string
}

/* --- Plano de ação 5W2H (RF-E01/E02) --- */

export type Nr1AcaoStatus = 'planejada' | 'em-andamento' | 'concluida' | 'atrasada'

/** Efetividade percebida de uma versão do plano, avaliada no ciclo seguinte
   — sempre um julgamento do SST/RH, nunca inferida automaticamente da
   variação do risco. */
export type Nr1Efetividade = 'muito-efetiva' | 'parcialmente-efetiva' | 'inefetiva' | 'nao-avaliada'

/** Um item do diário de execução de uma ação — um comentário de
   acompanhamento que pode (ou não) trazer um ou mais arquivos anexados.
   Ter ao menos um comentário com arquivo é o que conta como "evidência de
   execução" para concluir a ação e para a trilha de rastreabilidade
   (RF-E02) — um comentário sem arquivo é só acompanhamento, não evidência
   por si só. */
export interface Nr1Comentario {
  id: string
  autor: string
  texto?: string
  arquivos?: string[]
  em: string
}

export interface Nr1Acao {
  id: string
  /** Risco do inventário a que a ação responde. */
  riscoId: string
  oQue: string
  porQue: string
  quem: string
  quando: string
  onde: string
  como: string
  quanto: string
  status: Nr1AcaoStatus
  comentarios: Nr1Comentario[]
  concluidaEm?: string
  /** Versionamento do plano: 1 na primeira vez; revisar cria uma nova ação
     com `versao` incrementada e `versaoAnteriorId` apontando para a que
     ela substitui — a anterior nunca é editada nem apagada, é histórico. */
  versao: number
  versaoAnteriorId?: string
  /** Por que esta versão existe — obrigatório a partir da v2. */
  motivoRevisao?: string
  /** Preenchida no ciclo seguinte, olhando a evolução do risco. Ausente
     enquanto não há ciclo novo para avaliar contra. */
  efetividade?: Nr1Efetividade
}

/* --- Canal de escuta (RF-H01/H02) --- */

export type Nr1RelatoCategoria =
  | 'assedio-moral' | 'assedio-sexual' | 'conflito' | 'sobrecarga' | 'outro'
export type Nr1RelatoStatus = 'novo' | 'em-apuracao' | 'concluido'

export interface Nr1RelatoAndamento {
  id: string
  em: string
  texto: string
  autor: string
}

export interface Nr1Relato {
  id: string
  protocolo: string
  categoria: Nr1RelatoCategoria
  descricao: string
  /** Área informada voluntariamente pelo relator (opcional). */
  departamento?: string
  abertoEm: string
  /** Vencimento do SLA de tratamento. */
  prazoEm: string
  status: Nr1RelatoStatus
  andamentos: Nr1RelatoAndamento[]
}

/* --- Ciclos e reavaliação (RF-G01) --- */

export interface Nr1Ciclo {
  campanhaId: string
  nome: string
  /** Ausente enquanto a campanha ainda está em campo. */
  encerradaEm?: string
  modeloNome: string
  versao: string
  participacaoPct: number
  mediaPorDimensao: { dimensaoId: Nr1DimensaoId; media: number }[]
}

/* --- Relatório de gestão e rastreabilidade (RF-F01/F03/F04) --- */

/** Responsável técnico do cliente (SST/consultoria). A YNA fornece o insumo;
   a assinatura do PGR permanece com o profissional do cliente (RF-F04). */
export interface Nr1ResponsavelTecnico {
  nome: string
  registro: string
  empresa: string
  assinadoEm?: string
}

export type Nr1TrilhaEtapaTipo = 'avaliacao' | 'inventario' | 'acao' | 'evidencia'

/** Elo da cadeia risco → avaliação → inventário → ação → evidência. */
export interface Nr1TrilhaEtapa {
  tipo: Nr1TrilhaEtapaTipo
  titulo: string
  detalhe: string
  em: string
}

/** Trilha completa de um risco priorizado (RF-F01). */
export interface Nr1Trilha {
  riscoId: string
  fator: string
  grupoExposto: string
  etapas: Nr1TrilhaEtapa[]
}

/* --- Jornada do colaborador --- */

/** Uma resposta do colaborador à avaliação, com a versão aplicada (RF-F02). */
export interface Nr1MinhaAvaliacao {
  campanhaId: string
  nome: string
  respondidoEm: string
  modeloNome: string
  versao: string
  scores: { dimensaoId: Nr1DimensaoId; nome: string; media: number }[]
}

/* --- Kit de comunicação da campanha (RF-K01) --- */

export type Nr1MaterialTipo = 'email' | 'cartaz' | 'post' | 'roteiro'

export interface Nr1KitMaterial {
  id: string
  tipo: Nr1MaterialTipo
  titulo: string
  descricao: string
  /** Copy pronta, no tom da marca — o RH copia e adapta. */
  conteudo: string
}
