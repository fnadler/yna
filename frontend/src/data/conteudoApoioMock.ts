/* Biblioteca de conteúdo de apoio do colaborador (home do Meu Espaço).
   Substitui, neste recorte, a antiga "Academia YNA" do profissional — mesma
   estrutura visual (destaque + grid filtrável + artigos), conteúdo
   totalmente diferente: materiais curtos sobre saúde mental no trabalho,
   não formação clínica. Rascunho: pendente de curadoria clínica antes de
   qualquer piloto real (ver README). */

export type CategoriaConteudo = 'Sobrecarga' | 'Sono' | 'Limites' | 'Ansiedade' | 'Relações' | 'Autoconhecimento'

export const CATEGORIAS: { id: CategoriaConteudo; icon: string }[] = [
  { id: 'Sobrecarga', icon: 'ph:stack-bold' },
  { id: 'Sono', icon: 'ph:moon-stars-bold' },
  { id: 'Limites', icon: 'ph:hand-palm-bold' },
  { id: 'Ansiedade', icon: 'ph:wind-bold' },
  { id: 'Relações', icon: 'ph:users-three-bold' },
  { id: 'Autoconhecimento', icon: 'ph:compass-bold' },
]

export interface VideoApoio {
  id: string
  titulo: string
  categoria: CategoriaConteudo
  duracaoMin: number
  resumo: string
  capa: string
  destaque?: boolean
  /** Quanto do vídeo a pessoa já assistiu (0-100). Ausente = nunca começou. */
  assistidoPct?: number
}

/* Gradientes de capa — mesma ideia da Academia YNA (sem imagem real, cada
   peça tem uma dupla de cores do design system). Reaproveitados também
   pelos artigos (imagem de destaque + blocos de imagem no corpo). */
const CAPAS = [
  'linear-gradient(135deg, #F2A8C5, #FBC85E)',
  'linear-gradient(135deg, #B8B9E5, #4749A8)',
  'linear-gradient(135deg, #DCD4F0, #F2A8C5)',
  'linear-gradient(135deg, #9395D6, #FBC85E)',
]

export const VIDEOS: VideoApoio[] = [
  { id: 'v1', titulo: 'Como identificar sinais de sobrecarga', categoria: 'Sobrecarga', duracaoMin: 8, destaque: true, capa: CAPAS[0],
    resumo: 'Sobrecarga raramente aparece de uma vez: ela se acumula. Este vídeo mostra três sinais comuns antes de virar esgotamento.' },
  { id: 'v2', titulo: 'Respiração para momentos de tensão', categoria: 'Ansiedade', duracaoMin: 5, destaque: true, capa: CAPAS[1],
    resumo: 'Um exercício de respiração de 3 minutos para usar antes de uma reunião difícil ou num momento de pressão.' },
  { id: 'v3', titulo: 'Definindo limites no trabalho remoto', categoria: 'Limites', duracaoMin: 12, capa: CAPAS[2], assistidoPct: 40,
    resumo: 'Sem parede entre casa e trabalho, os limites precisam ser combinados em voz alta. Como fazer isso sem parecer rígido.' },
  { id: 'v4', titulo: 'Sono: por que ele afeta tudo', categoria: 'Sono', duracaoMin: 9, capa: CAPAS[3],
    resumo: 'Sono ruim muda humor, memória e paciência. Entenda a relação antes de tentar resolver só com força de vontade.' },
  { id: 'v5', titulo: 'Conversas difíceis com a liderança', categoria: 'Relações', duracaoMin: 14, capa: CAPAS[0],
    resumo: 'Um roteiro simples para levar um problema para quem lidera com você, sem esperar que ele "adivinhe".' },
  { id: 'v6', titulo: 'Pausas que realmente descansam', categoria: 'Sobrecarga', duracaoMin: 6, capa: CAPAS[1], assistidoPct: 75,
    resumo: 'Nem toda pausa descansa. A diferença entre parar de verdade e só trocar de tela.' },
  { id: 'v7', titulo: 'Autoconhecimento: primeiros passos', categoria: 'Autoconhecimento', duracaoMin: 10, capa: CAPAS[2], assistidoPct: 15,
    resumo: 'Três perguntas simples para começar a notar padrões no que te cansa e no que te dá energia.' },
  { id: 'v8', titulo: 'Quando pedir ajuda faz diferença', categoria: 'Ansiedade', duracaoMin: 7, capa: CAPAS[3],
    resumo: 'Pedir ajuda cedo custa menos do que parece. Sinais de que vale a pena conversar com alguém agora.' },
]

/* Blocos de conteúdo do artigo — mesmo vocabulário da antiga Academia YNA
   (Pro30Artigo/ArtigoBloco), para abrir em Sheet com imagem de destaque,
   texto mais longo, listas, citações e vídeos embutidos no meio do texto. */
export type ArtigoBloco =
  | { tipo: 'subtitulo'; texto: string }
  | { tipo: 'paragrafo'; texto: string }
  | { tipo: 'lista'; itens: string[] }
  | { tipo: 'citacao'; texto: string; fonte?: string }
  | { tipo: 'imagem'; cor: string; legenda?: string }
  | { tipo: 'video'; titulo?: string; duracao?: string }

export interface ArtigoApoio {
  id: string
  titulo: string
  categoria: CategoriaConteudo
  autor: string
  publicadoEm: string
  tempoLeituraMin: number
  resumo: string
  capa: string
  corpo: ArtigoBloco[]
}

export const ARTIGOS: ArtigoApoio[] = [
  {
    id: 'a1', titulo: '5 sinais de que você precisa de uma pausa', categoria: 'Sobrecarga',
    autor: 'Equipe YNA', publicadoEm: '12 fev 2026', tempoLeituraMin: 4, capa: CAPAS[0],
    resumo: 'Cansaço que o fim de semana não resolve é o primeiro sinal — não o único.',
    corpo: [
      { tipo: 'paragrafo', texto: 'Sobrecarga nem sempre parece sobrecarga: às vezes parece irritação, esquecimento ou vontade de adiar tudo. Ela se acumula devagar, e por isso é fácil só perceber quando já dói.' },
      { tipo: 'subtitulo', texto: 'Os sinais que valem atenção' },
      { tipo: 'lista', itens: [
        'Cansaço que o fim de semana não resolve mais',
        'Irritação com coisas pequenas, que antes não incomodavam',
        'Dificuldade de lembrar detalhes que você normalmente não esqueceria',
        'Vontade de adiar tarefas simples, sem motivo aparente',
        'Sono que não descansa, mesmo dormindo o suficiente',
      ] },
      { tipo: 'citacao', texto: 'Perceber o sinal cedo custa muito menos do que lidar com o esgotamento depois.', fonte: 'Equipe YNA' },
      { tipo: 'paragrafo', texto: 'Se você reconhece três ou mais desses sinais nas últimas semanas, vale conversar com alguém — seu gestor, o RH, ou o canal de escuta da empresa. Não é preciso esperar o ponto de ruptura para pedir uma pausa.' },
    ],
  },
  {
    id: 'a2', titulo: 'O que ajuda de verdade a dormir melhor', categoria: 'Sono',
    autor: 'Equipe YNA', publicadoEm: '3 mar 2026', tempoLeituraMin: 6, capa: CAPAS[3],
    resumo: 'Pequenos ajustes de rotina pesam mais do que parece.',
    corpo: [
      { tipo: 'paragrafo', texto: 'Manter o mesmo horário para dormir e acordar, mesmo no fim de semana, é o ajuste com mais impacto — e também o mais difícil de manter. O corpo aprende a esperar o sono num horário fixo, e dorme melhor quando esse horário se repete.' },
      { tipo: 'imagem', cor: CAPAS[3], legenda: 'Uma rotina simples: mesma hora de deitar, mesma hora de acordar, todos os dias.' },
      { tipo: 'subtitulo', texto: 'Quando a cabeça não desliga' },
      { tipo: 'paragrafo', texto: 'Anotar o que está passando pela cabeça antes de tentar dormir de novo ajuda mais do que insistir de olhos fechados. Não precisa ser um diário elaborado: três linhas já tiram o pensamento do modo "alerta".' },
      { tipo: 'lista', itens: [
        'Evite telas na última meia hora antes de deitar',
        'Se acordar no meio da noite, não olhe as horas',
        'Cafeína depois do meio da tarde cobra a conta à noite',
      ] },
      { tipo: 'paragrafo', texto: 'Nenhum desses ajustes resolve sozinho uma noite ruim. Mas repetidos por algumas semanas, mudam a média — e é a média que importa.' },
    ],
  },
  {
    id: 'a3', titulo: 'Como dizer não sem se sentir culpado', categoria: 'Limites',
    autor: 'Equipe YNA', publicadoEm: '20 mar 2026', tempoLeituraMin: 5, capa: CAPAS[2],
    resumo: 'Um limite dito com antecedência custa muito menos do que um limite estourado depois.',
    corpo: [
      { tipo: 'paragrafo', texto: 'Você pode reconhecer a importância do pedido e ainda assim dizer que não cabe agora — as duas coisas não se cancelam. Dizer não a uma tarefa não é dizer não à pessoa que pediu.' },
      { tipo: 'subtitulo', texto: 'Um jeito direto de recusar' },
      { tipo: 'paragrafo', texto: 'Frases como "não vou conseguir entregar isso com qualidade até [data]" abrem negociação sem esconder o limite. Elas dizem o que é possível, não só o que não é.' },
      { tipo: 'citacao', texto: 'Um limite dito com antecedência custa muito menos do que um limite estourado depois.' },
      { tipo: 'video', titulo: 'Um roteiro de 2 minutos para essa conversa', duracao: '2 min' },
      { tipo: 'paragrafo', texto: 'Vale treinar a frase antes da conversa, mesmo que pareça bobo. Dizer em voz alta uma vez muda como ela sai na hora que importa.' },
    ],
  },
  {
    id: 'a4', titulo: 'Ansiedade no trabalho: o que é normal e o que merece atenção', categoria: 'Ansiedade',
    autor: 'Equipe YNA', publicadoEm: '2 abr 2026', tempoLeituraMin: 7, capa: CAPAS[1],
    resumo: 'Nervosismo antes de uma entrega é diferente de viver em alerta constante.',
    corpo: [
      { tipo: 'paragrafo', texto: 'Um pouco de tensão antes de um prazo é esperado — é o corpo se preparando para um esforço. O que pede atenção é quando essa tensão não baixa depois que a entrega acabou.' },
      { tipo: 'subtitulo', texto: 'A diferença entre alerta pontual e alerta constante' },
      { tipo: 'lista', itens: [
        'Alerta pontual: sobe antes de um evento específico e desce depois dele',
        'Alerta constante: não tem gatilho claro, ou não baixa mesmo quando o motivo passou',
        'Alerta constante costuma vir acompanhado de tensão física — ombros, mandíbula, estômago',
      ] },
      { tipo: 'paragrafo', texto: 'Se isso descreve as suas últimas semanas, o canal de escuta e o conteúdo de apoio são um bom primeiro passo — sempre anônimos. Não é preciso ter certeza do diagnóstico para pedir uma conversa.' },
    ],
  },
  {
    id: 'a5', titulo: 'Construindo relações de confiança no time', categoria: 'Relações',
    autor: 'Equipe YNA', publicadoEm: '18 abr 2026', tempoLeituraMin: 5, capa: CAPAS[0],
    resumo: 'Confiança se constrói em conversas pequenas, repetidas — não em um evento único.',
    corpo: [
      { tipo: 'paragrafo', texto: 'Perguntar "como você está com a carga esta semana?" antes de distribuir mais trabalho já é um gesto de confiança. Não resolve tudo, mas muda o tom da conversa seguinte.' },
      { tipo: 'imagem', cor: CAPAS[0], legenda: 'Confiança se acumula em conversas pequenas — não em um evento único.' },
      { tipo: 'paragrafo', texto: 'Reconhecer um erro em voz alta, quando é seu, costuma abrir mais espaço do que qualquer discurso sobre "cultura de confiança". As pessoas notam o que você faz sob pressão, mais do que o que você diz nos momentos calmos.' },
      { tipo: 'citacao', texto: 'Confiança não é o evento único que resolve tudo — é a soma de conversas pequenas e repetidas.' },
    ],
  },
  {
    id: 'a6', titulo: 'Autoconhecimento: por onde começar', categoria: 'Autoconhecimento',
    autor: 'Equipe YNA', publicadoEm: '5 mai 2026', tempoLeituraMin: 6, capa: CAPAS[2],
    resumo: 'Não precisa de retiro nem de terapia para começar — precisa de repetição.',
    corpo: [
      { tipo: 'paragrafo', texto: 'Anotar, ao fim do dia, uma coisa que cansou e uma que energizou já revela padrões em poucas semanas. O objetivo não é ter respostas prontas, é notar o que muda quando você presta atenção.' },
      { tipo: 'subtitulo', texto: 'Três perguntas para começar' },
      { tipo: 'lista', itens: [
        'O que hoje te tirou energia — e isso é raro ou é todo dia?',
        'O que hoje te deu energia — dá para ter mais disso amanhã?',
        'Se pudesse mudar uma coisa pequena na semana, qual seria?',
      ] },
      { tipo: 'paragrafo', texto: 'Não precisa responder as três todo dia. Escolher uma, de vez em quando, já é o suficiente para começar a notar o próprio padrão.' },
    ],
  },
]
