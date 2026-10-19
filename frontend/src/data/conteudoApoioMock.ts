/* Biblioteca de conteúdo de apoio do colaborador (home do Meu Espaço).
   Substitui, neste recorte, a antiga "Academia YNA" do profissional — mesma
   estrutura visual (destaque + grid filtrável + artigos), conteúdo
   totalmente diferente: materiais curtos sobre saúde mental no trabalho,
   não formação clínica. Rascunho: pendente de curadoria clínica antes de
   qualquer piloto real (ver README).

   Também guarda os conteúdos da landing pós-avaliação (`/conhecer-yna`,
   `VIDEOS_LANDING`/`ARTIGOS_LANDING` no fim do arquivo), separados por
   público (`publico`) e com foto de capa (`imagem`). Ficam em arrays
   próprios para não mudar o que `/apoio` e `/meu-espaco` mostram. Mesmo
   status: rascunho editorial, pendente de curadoria clínica. */

export type CategoriaConteudo =
  | 'Sobrecarga' | 'Sono' | 'Limites' | 'Ansiedade' | 'Relações' | 'Autoconhecimento'
  /* Só na landing pós-avaliação — fora de `CATEGORIAS`, então não viram
     filtro em `/apoio`. */
  | 'Pedir ajuda' | 'Terapia' | 'Acolhimento' | 'NR-1' | 'Segurança psicológica' | 'Rotina'

/** Para quem o conteúdo foi escrito — separa as abas "Para você" / "Para
   quem lidera" da landing. Ausente = biblioteca geral (`/apoio`). */
export type PublicoConteudo = 'colaborador' | 'lideranca'

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
  publico?: PublicoConteudo
  /** Foto de capa. Ausente = vale o gradiente de `capa`. */
  imagem?: string
  /** `background-position` da foto de capa (enquadramento). */
  imagemPosicao?: string
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
  publico?: PublicoConteudo
  /** Foto de capa. Ausente = vale o gradiente de `capa`. */
  imagem?: string
  /** Ícone Phosphor do item na lista da landing. */
  icone?: string
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

/* ============================================================
   Landing pós-avaliação (`/conhecer-yna`) — mesma copy do protótipo
   aprovado (`landing-nr1/index.html`): títulos, categorias, durações e
   resumos idênticos. O `corpo` dos artigos é curto de propósito (só para
   o `ArtigoModal` não abrir vazio) e, como o resto, pendente de curadoria
   clínica.
   ============================================================ */

const IMG = '/images/landing'

export const LANDING_INTROS: Record<PublicoConteudo, string> = {
  colaborador: 'Para entender o que você está sentindo e cuidar disso no dia a dia, no trabalho e fora dele.',
  lideranca: 'Para quem cuida de pessoas: como perceber, acolher e agir quando alguém da equipe não está bem.',
}

export const VIDEOS_LANDING: VideoApoio[] = [
  { id: 'lv1', publico: 'colaborador', destaque: true, titulo: 'Como perceber os sinais de sobrecarga antes do esgotamento', categoria: 'Sobrecarga', duracaoMin: 8,
    capa: CAPAS[0], imagem: `${IMG}/c-pausa.jpg`, imagemPosicao: '50% 35%',
    resumo: 'Sobrecarga raramente chega de uma vez: ela se acumula. Este vídeo mostra três sinais comuns que aparecem antes do esgotamento e o que fazer quando você reconhece algum deles em você.' },
  { id: 'lv2', publico: 'colaborador', titulo: 'Respiração para momentos de tensão', categoria: 'Ansiedade', duracaoMin: 5,
    capa: CAPAS[1], imagem: `${IMG}/c-respiracao.jpg`, imagemPosicao: '50% 60%',
    resumo: 'Um exercício guiado de três minutos para usar antes de uma reunião difícil, depois de uma conversa pesada ou sempre que a cabeça acelerar.' },
  { id: 'lv3', publico: 'colaborador', titulo: 'Quando conversar com alguém faz diferença', categoria: 'Pedir ajuda', duracaoMin: 7,
    capa: CAPAS[2], imagem: `${IMG}/c-sono.jpg`, imagemPosicao: '50% 30%',
    resumo: 'Pedir ajuda cedo custa menos do que parece. Sinais de que vale a pena conversar com um profissional agora, e como é essa primeira conversa.' },
  { id: 'lv4', publico: 'lideranca', destaque: true, titulo: 'Como conversar com alguém da equipe que não está bem', categoria: 'Acolhimento', duracaoMin: 11,
    capa: CAPAS[1], imagem: `${IMG}/l-equipe.jpg`, imagemPosicao: '50% 35%',
    resumo: 'Um roteiro simples para abrir a conversa, escutar sem tentar resolver tudo na hora e saber para onde encaminhar. Inclui o que evitar dizer.' },
  { id: 'lv5', publico: 'lideranca', titulo: 'NR-1 na prática: o que muda para quem lidera', categoria: 'NR-1', duracaoMin: 9,
    capa: CAPAS[3], imagem: `${IMG}/l-lideranca.jpg`, imagemPosicao: '50% 30%',
    resumo: 'Riscos psicossociais agora fazem parte do gerenciamento de riscos da empresa. O que isso significa no dia a dia da liderança e como transformar o resultado coletivo da avaliação em ações concretas.' },
  { id: 'lv6', publico: 'lideranca', titulo: 'Segurança psicológica no dia a dia da equipe', categoria: 'Segurança psicológica', duracaoMin: 10,
    capa: CAPAS[0], imagem: `${IMG}/c-conversa.jpg`, imagemPosicao: '50% 35%',
    resumo: 'Equipes que se sentem seguras para errar e discordar adoecem menos e entregam mais. Atitudes pequenas e repetidas que constroem esse ambiente.' },
]

export const ARTIGOS_LANDING: ArtigoApoio[] = [
  {
    id: 'la1', publico: 'colaborador', icone: 'ph:pause-circle-bold', titulo: '5 sinais de que você precisa de uma pausa', categoria: 'Sobrecarga',
    autor: 'Equipe YNA', publicadoEm: '12 fev 2026', tempoLeituraMin: 4, capa: CAPAS[0],
    resumo: 'Cansaço que o fim de semana não resolve é o primeiro sinal, mas não o único. Irritação, esquecimento e vontade de adiar tudo também contam. Saiba reconhecer cada um e o que fazer a respeito.',
    corpo: [
      { tipo: 'paragrafo', texto: 'Sobrecarga nem sempre parece sobrecarga. Ela se acumula devagar, e por isso é fácil só perceber quando já dói.' },
      { tipo: 'lista', itens: [
        'Cansaço que o fim de semana não resolve mais',
        'Irritação com coisas pequenas',
        'Esquecimentos que não são do seu feitio',
        'Vontade de adiar tarefas simples',
        'Sono que não descansa',
      ] },
      { tipo: 'paragrafo', texto: 'Se você reconhece três ou mais desses sinais nas últimas semanas, vale conversar com alguém. Não é preciso esperar o ponto de ruptura para pedir uma pausa.' },
    ],
  },
  {
    id: 'la2', publico: 'colaborador', icone: 'ph:moon-stars-bold', titulo: 'Sono ruim muda tudo: por onde começar', categoria: 'Sono',
    autor: 'Equipe YNA', publicadoEm: '3 mar 2026', tempoLeituraMin: 5, capa: CAPAS[1],
    resumo: 'Sono afeta humor, memória e paciência. Antes de tentar resolver só com força de vontade, entenda o que está por trás e quais ajustes simples costumam funcionar.',
    corpo: [
      { tipo: 'paragrafo', texto: 'Manter o mesmo horário para dormir e acordar, inclusive no fim de semana, é o ajuste com mais impacto. O corpo aprende a esperar o sono num horário fixo.' },
      { tipo: 'lista', itens: [
        'Evite telas na última meia hora antes de deitar',
        'Se acordar no meio da noite, não olhe as horas',
        'Cafeína depois do meio da tarde cobra a conta à noite',
      ] },
    ],
  },
  {
    id: 'la3', publico: 'colaborador', icone: 'ph:hand-palm-bold', titulo: 'Como colocar limites sem parecer difícil', categoria: 'Limites',
    autor: 'Equipe YNA', publicadoEm: '20 mar 2026', tempoLeituraMin: 6, capa: CAPAS[2],
    resumo: 'Limites não são muros, são combinados. Frases e situações práticas para dizer "agora não consigo" sem culpa e sem conflito.',
    corpo: [
      { tipo: 'paragrafo', texto: 'Dizer não a uma tarefa não é dizer não à pessoa que pediu. Você pode reconhecer a importância do pedido e, ainda assim, dizer que ele não cabe agora.' },
      { tipo: 'citacao', texto: 'Um limite dito com antecedência custa muito menos do que um limite estourado depois.' },
      { tipo: 'paragrafo', texto: 'Frases como "não vou conseguir entregar isso com qualidade até [data]" abrem negociação sem esconder o limite.' },
    ],
  },
  {
    id: 'la4', publico: 'colaborador', icone: 'ph:chats-circle-bold', titulo: 'O que esperar da primeira sessão com um psicólogo', categoria: 'Terapia',
    autor: 'Equipe YNA', publicadoEm: '2 abr 2026', tempoLeituraMin: 5, capa: CAPAS[3],
    resumo: 'Muita gente adia a terapia por não saber como ela começa. O que acontece na primeira conversa, o que você pode perguntar e como saber se combinou com o profissional.',
    corpo: [
      { tipo: 'paragrafo', texto: 'A primeira sessão é, antes de tudo, uma conversa para se conhecer. Você não precisa chegar com nada pronto nem saber exatamente o que quer tratar.' },
      { tipo: 'lista', itens: [
        'Pergunte como o profissional trabalha e com que frequência',
        'Fale sobre o que te trouxe, no seu ritmo',
        'Observe se você se sentiu à vontade para falar',
      ] },
    ],
  },
  {
    id: 'la5', publico: 'lideranca', icone: 'ph:stack-bold', titulo: 'Sinais de sobrecarga na equipe que passam despercebidos', categoria: 'Sobrecarga',
    autor: 'Equipe YNA', publicadoEm: '18 abr 2026', tempoLeituraMin: 5, capa: CAPAS[0],
    resumo: 'Prazos sempre "quase" cumpridos, câmeras desligadas, silêncio nas reuniões. Como ler esses sinais coletivos sem expor ninguém individualmente.',
    corpo: [
      { tipo: 'paragrafo', texto: 'Sobrecarga na equipe raramente aparece como reclamação. Ela aparece no ritmo: entregas no limite, menos perguntas, menos discordância.' },
      { tipo: 'paragrafo', texto: 'Trate o que você observa como sinal do grupo, não de uma pessoa. A conversa começa pela carga e pelos combinados, nunca por quem "parece mal".' },
    ],
  },
  {
    id: 'la6', publico: 'lideranca', icone: 'ph:chat-centered-text-bold', titulo: 'O que dizer, e o que evitar, quando alguém se abre com você', categoria: 'Acolhimento',
    autor: 'Equipe YNA', publicadoEm: '5 mai 2026', tempoLeituraMin: 4, capa: CAPAS[1],
    resumo: 'Frases que acolhem e frases que fecham a conversa. Um guia rápido para os primeiros minutos, que costumam ser os mais importantes.',
    corpo: [
      { tipo: 'lista', itens: [
        'Acolhe: "Obrigado por me contar." / "Quer me falar mais sobre isso?"',
        'Fecha: "Todo mundo passa por isso." / "Você precisa ser mais forte."',
      ] },
      { tipo: 'paragrafo', texto: 'Você não precisa resolver tudo na hora. Escutar, agradecer a confiança e combinar um próximo passo já é muito.' },
    ],
  },
  {
    id: 'la7', publico: 'lideranca', icone: 'ph:calendar-check-bold', titulo: 'Reuniões que não esgotam: 6 ajustes simples', categoria: 'Rotina',
    autor: 'Equipe YNA', publicadoEm: '19 mai 2026', tempoLeituraMin: 4, capa: CAPAS[2],
    resumo: 'Pauta clara, horário de fim respeitado, intervalos entre reuniões. Mudanças pequenas que devolvem tempo e energia para a equipe.',
    corpo: [
      { tipo: 'lista', itens: [
        'Pauta enviada antes, com o objetivo da reunião',
        'Horário de fim respeitado',
        'Cinco minutos de intervalo entre uma reunião e outra',
        'Quem não precisa decidir pode receber o resumo',
        'Câmera opcional',
        'Um dia da semana com menos reuniões',
      ] },
      { tipo: 'paragrafo', texto: 'Comece por um ajuste só e combine com a equipe por quanto tempo vão testar.' },
    ],
  },
  {
    id: 'la8', publico: 'lideranca', icone: 'ph:clipboard-text-bold', titulo: 'Do resultado da avaliação ao plano de ação', categoria: 'NR-1',
    autor: 'Equipe YNA', publicadoEm: '2 jun 2026', tempoLeituraMin: 6, capa: CAPAS[3],
    resumo: 'O resultado da avaliação é sempre coletivo, nunca individual. Como ler os indicadores da sua área, priorizar o que mais pesa e envolver a equipe nas soluções.',
    corpo: [
      { tipo: 'paragrafo', texto: 'O resultado mostra como o grupo percebe o trabalho, nunca o que uma pessoa respondeu. Comece pelos fatores que mais pesam na sua área.' },
      { tipo: 'paragrafo', texto: 'Leve o resultado para a equipe e pergunte o que ajudaria. Ações construídas junto com quem vive o problema costumam durar mais.' },
    ],
  },
]
