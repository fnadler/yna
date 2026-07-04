# YNA Care Hub — Roteiro de Teste de Usabilidade

## Perfil Beneficiário · Fluxos críticos · Teste moderado remoto

> **Base:** Documento de Requisitos MVP YNA Care Hub — Fluxo 2 (Beneficiário), seções 6.2 a 6.10.
> **Objeto de teste:** protótipo navegável (dados simulados).
> **Formato:** sessão individual, moderada, remota (videochamada com compartilhamento de tela), com técnica de *pensar em voz alta*.
> **Duração-alvo:** 30–40 min por participante.

---

## 1. Objetivos do teste

Validar se o beneficiário consegue, sem apoio, percorrer a jornada de entrada e primeiro cuidado, e capturar percepções sobre acolhimento e confiança (tom "Cora-Cuidador").

**Perguntas de pesquisa:**

1. O beneficiário entende o que é a YNA e o que ganha antes de entregar seus dados? (boas-vindas + LGPD)
2. O aceite de sigilo/LGPD é percebido como claro e tranquilizador — ou como fricção/burocracia?
3. A triagem é vista como acolhedora e com propósito, ou como um formulário longo?
4. O beneficiário confia nos 3 profissionais sugeridos e sente-se apto a escolher um?
5. O agendamento (sessão única **e** recorrente) é concluído sem hesitação? A diferença entre os modos é clara?
6. O beneficiário sabe entrar na sala e entende o que fazer quando o profissional ainda não chegou (aviso de espera)?

**Métricas coletadas por tarefa:** taxa de sucesso · sucesso com dificuldade · erros/becos sem saída · tempo aproximado · SEQ (facilidade percebida, 1–7) · citações verbais relevantes.

---

## 2. Participantes

- **N recomendado:** 5–7 participantes (suficiente para achar a maioria dos problemas de usabilidade).
- **Perfil-alvo:** adultos colaboradores de empresa, elegíveis a um benefício de saúde mental; mix de gênero; faixas etárias variadas; **sem experiência prévia com a YNA**.
- **Recrutar variedade em:** familiaridade com terapia (já fez / nunca fez) e conforto com apps (alto / médio).
- **Critério de exclusão:** trabalhar com UX/design de produto ou ter participado do desenho da YNA.

---

## 3. Logística e materiais

- **Ferramentas:** plataforma de videochamada com gravação de tela e áudio; link do protótipo aberto no ponto de entrada (e-mail convite / tela de boas-vindas).
- **Papéis:** 1 moderador (conduz) + 1 anotador (observa, cronometra, preenche a grade). Nunca deixe o moderador anotar sozinho.
- **Antes de começar:** confirmar consentimento de gravação; garantir que o participante compartilhe a tela; ter os dados simulados de cadastro à mão (CPF/e-mail fictícios já pré-preenchidos).
- **Regra de ouro do moderador:** não guiar. Se o participante travar, primeiro pergunte *"o que você faria agora?"* antes de qualquer dica. Só desbloqueie após ~60–90s de tentativa genuína, e registre como falha assistida.

---

## 4. Abertura (script do moderador) — ~4 min

> "Oi, [nome]! Muito obrigado por participar. A conversa deve levar uns 35 minutos. Antes de tudo: **quem está sendo avaliado aqui é o produto, não você** — não existe resposta certa ou errada, e se algo ficar confuso, ótimo, é exatamente o que precisamos descobrir.
>
> Vou te pedir para **pensar em voz alta**: fale o que está olhando, o que espera que aconteça, o que te confunde. Se ficar em silêncio, vou te lembrar de narrar.
>
> Isto é um protótipo, então algumas coisas podem não funcionar 100% — sem problema. Eu vou te dar algumas tarefas, mas **não vou te ajudar a menos que você fique bem travado**, porque preciso ver como funcionaria no mundo real.
>
> Posso gravar a tela e o áudio, só para revisar depois? A gravação é confidencial e usada só pela equipe."

**Aquecimento (2 perguntas, ~2 min):**
- "Você já usou algum app de saúde, bem-estar ou terapia? Como foi?"
- "Se uma empresa te oferecesse apoio psicológico, o que te faria confiar (ou desconfiar) desse benefício?"

---

## 5. Tarefas

> Formato de cada tarefa: **Cenário** (contexto que o moderador lê) → **Tarefa** (o que pedir) → **Sucesso =** (critério) → **Observar** (o que o anotador registra) → **Sondagem** (perguntas após a tarefa). Rastreabilidade entre parênteses (RF do documento).

### Tarefa 1 — Entrada, sigilo e cadastro (§6.2–6.5)

**Cenário:** "Você recebeu um e-mail da sua empresa dizendo que tem acesso a um programa de apoio psicológico chamado YNA. Você acabou de abrir esse e-mail."

**Tarefa:** "Comece por aqui e vá até o ponto em que você considera que já tem uma conta criada e pronta para usar. Lembre de narrar o que pensa no caminho."

**Sucesso =** participante passa pelas boas-vindas, aceita o sigilo/LGPD e conclui o cadastro (senha + campos próprios), chegando ao pós-cadastro.

**Observar:**
- Nas **telas de boas-vindas** (1 + 3 slides): pula ou assiste? Entendeu a proposta da YNA? (RF-CO-02.6)
- No **gate LGPD**: lê o resumo? Abre os documentos completos? O aceite (checkbox + botão) foi percebido como claro ou como barreira? Alguém hesita em "entregar dados"? (RF-CO-02.1–02.3)
- Percebe que **nome/CPF/e-mail já vêm preenchidos e não editáveis**? Estranha ou tranquiliza? (RF-CO-04.1)
- **Criação de senha:** entende o indicador de força? Cria apelido sem fricção? (RF-CO-04.2–04.4)
- Nota o aceite **separado** de comunicações (transacional x marketing)? (RF-CO-04.3)

**Sondagem:**
- "Nesta etapa, o que te deu (ou tirou) confiança na YNA?"
- "O aceite de privacidade — como você se sentiu ali? Ficou claro o que você estava aceitando?"
- "Teve algum momento em que pensou em desistir?"

---

### Tarefa 2 — Triagem, matches e escolha do profissional (§6.6–6.8)

**Cenário:** "Agora a YNA quer te entender melhor para sugerir profissionais. Continue a partir de onde parou."

**Tarefa:** "Responda o que a plataforma pedir e siga até **escolher um profissional para começar**. Escolha como se fosse pra valer."

**Sucesso =** completa a triagem e seleciona 1 dos 3 profissionais, avançando para o agendamento.

**Observar:**
- **Triagem:** percebe as perguntas como acolhedoras ou como formulário longo? Usa "pular pergunta"? Nota que o progresso é salvo? Reage aos diferentes tipos (aberta / escolha / escala)? (RF-CO-05.1–05.4)
- **3 matches:** olha os **vídeos** de apresentação? Lê o "**por que esses três**"? Abre o **detalhe** de algum perfil? (RF-CO-06.1–06.3)
- Sente que 3 opções é pouco/suficiente/muito? Procura "**ver outras opções**"? (RF-CO-06.4 / RF-CO-07.2)
- Com base em quê decide — vídeo, formação, abordagem, agenda, "feeling"?
- Hesita em escolher? A microcopy de "não há escolha errada" reduz a pressão? (RF-CO-07.3)

**Sondagem:**
- "As perguntas da triagem fizeram sentido pra você? Como se sentiu respondendo?"
- "O que mais pesou na sua escolha do profissional?"
- "Você confiaria nessa recomendação? Faltou alguma informação pra decidir?"

---

### Tarefa 3 — Agendamento: sessão única e compromisso recorrente (§6.9)

**Cenário parte A:** "Você escolheu o profissional. Agora quer marcar sua primeira conversa."

**Tarefa A:** "Marque uma sessão no horário que for melhor pra você e confirme."

**Sucesso A =** seleciona slot, confirma e vê a sessão na agenda ("Próximas").

**Cenário parte B:** "Pensando bem, você prefere ter um horário fixo toda semana, no mesmo dia."

**Tarefa B:** "Configure isso do jeito que você faria."

**Sucesso B =** identifica e conclui o **modo recorrente**, entendendo que se repete semanalmente.

**Observar:**
- O **calendário/slots** é legível? Entende disponibilidade do profissional? (RF-CO-08.1)
- Na confirmação, nota **data, horário e link da sala**? (RF-CO-08.2)
- Percebe a distinção **sessão única × compromisso recorrente**? Os rótulos ("Confirmar agendamento" x "Confirmar compromisso recorrente") comunicam a diferença? (RF-CO-08.6)
- Encontra a **Agenda** e entende as abas "Próximas" / "Realizadas"? (RF-CO-08.7)
- (Se surgir naturalmente) menciona lembrete / integração com calendário pessoal? (RF-CO-08.3)

**Sondagem:**
- "Qual a diferença entre as duas formas de marcar que você acabou de usar?"
- "Se precisasse remarcar ou cancelar depois, saberia onde ir?" *(não peça para executar — núcleo essencial; só sonde a descoberta)*
- "Ficou claro quando e como é sua próxima sessão?"

---

### Tarefa 4 — Entrar na 1ª sessão e o aviso de espera (§6.10)

**Cenário:** "Chegou o dia e a hora da sua primeira sessão. Você quer entrar na sala. **Nesta simulação, o profissional ainda está terminando outro atendimento.**"

**Tarefa:** "Entre na sala da sua sessão e me diga, enquanto isso, o que está acontecendo e o que você faria."

**Sucesso =** acessa a sala pela agenda/link, passa pela verificação de equipamento e **compreende o aviso de espera** sem achar que houve erro.

**Observar:**
- Encontra o caminho para **entrar na sala** (pela agenda ou lembrete)? (RF-CO-09.1)
- Faz/entende o **teste de câmera e microfone**? (RF-CO-09.2)
- Nota a indicação de **criptografia/privacidade**? Isso importa pra ele? (RF-CO-09.3)
- **Aviso de espera:** entende que o profissional está finalizando outra sessão — ou interpreta como falha/abandono? Reação emocional (tranquilo / ansioso / irritado)? (RF-CO-09.7)
- (Se a simulação avançar) reage à atualização do aviso — "vai atrasar ~10 min" ou cancelamento com orientação de reagendar? A orientação é suficiente?
- Reconhece controles da sala (mute, câmera, chat)? (RF-CO-09.4)

**Sondagem:**
- "O que você entendeu que estava acontecendo enquanto esperava?"
- "Como você se sentiu com essa espera? A mensagem te deixou mais tranquilo ou mais ansioso?"
- "Se o profissional avisasse que ia atrasar 10 minutos, o que você faria? E se cancelasse?"

---

---

### Tarefa 5 — Botão de pânico e sala de emergência (§6.13)

> **⚠️ Nota de sensibilidade (ler antes de conduzir):** esta é uma tarefa emocionalmente delicada. Enquadre-a explicitamente como **hipotética e de simulação**, nunca pergunte sobre crises reais do participante, e deixe claro que ele pode parar a qualquer momento. Se o participante demonstrar desconforto genuíno, interrompa a tarefa, acolha e siga para o encerramento. O objetivo é avaliar **descoberta, clareza e sensação de segurança do recurso** — não provocar vivência de crise.

**Cenário:** "Vou te pedir para imaginar uma situação — é só simulação. Imagine que, num momento difícil, você precisasse de ajuda **imediata** dentro do app, para falar com alguém agora."

**Tarefa:** "Olhando para a tela, o que você faria para conseguir ajuda o mais rápido possível? Vá em frente e me narrando o que pensa."

**Sucesso =** localiza o **botão de pânico**, aciona o protocolo e chega à **sala de emergência** (tela de conexão com o plantonista), reconhecendo os recursos de apoio disponíveis.

**Observar:**
- **Descoberta:** encontra o botão de pânico sozinho? Em quanto tempo? Ele é percebido como "o caminho para ajuda urgente" — ou confundido com outra coisa? (RF-CO-12.1 / 12.4)
- O botão parece **visível e disponível em qualquer tela**, ou o participante teve que voltar à home? (RF-CO-12.4)
- Ao acionar: entende o que vai acontecer? Há confirmação clara antes de disparar (evita acionamento acidental, mas sem fricção que atrapalhe em crise real)? (RN-CO-12.2)
- **Opções oferecidas:** percebe as duas rotas — acionar **plantonista** e ligar para **CVV 188 / SAMU 192**? Sabe diferenciá-las? (RN-CO-12.2, item 2)
- **Sala de emergência:** entende que está sendo **conectado a um plantonista** e vê o progresso da conexão? A espera gera segurança ou ansiedade? (RF-CO-12.7)
- **Nyna de companhia:** nota que a Nyna o acompanha enquanto conecta (mensagens de apoio + respostas rápidas)? Isso acolhe ou parece "robô em hora errada"? (RF-CO-12.7)
- **CVV 188 / SAMU 192 sempre visíveis:** o participante repara que os canais externos ficam à mão o tempo todo? (RF-CO-12.7)

**Sondagem:**
- "Nesse momento, quão rápido e óbvio foi encontrar ajuda? Faltou algo?"
- "Ao acionar, você entendeu o que ia acontecer em seguida?"
- "Enquanto o app te conectava, você se sentiu acompanhado(a) e seguro(a)? A presença da Nyna ali ajudou ou atrapalhou?"
- "Você notou os telefones do CVV e do SAMU? Usaria eles, o plantonista, ou os dois?"
- "Se estivesse mesmo em um momento difícil, essa tela passaria confiança de que a ajuda está a caminho?"

---

## 6. Pós-tarefas e encerramento — ~5 min

**Reação geral:**
- "Numa palavra, como foi essa experiência?"
- "O que foi mais fácil? E o mais frustrante ou confuso?"
- "Em algum momento você sentiu que a YNA cuidava de você — ou que era só mais um app? Onde?"

**Confiança e adoção:**
- "Depois de ter feito isso, você usaria de verdade? O que faltou para você confiar totalmente?"
- "Teve algum momento em que você desistiria se estivesse sozinho em casa?"

**Fechamento:** agradecer, explicar próximos passos, encerrar gravação.

**SUS opcional:** se quiser medir usabilidade percebida de forma comparável entre rodadas, aplicar o questionário SUS (10 itens) ao final.

---

## 7. Grade de observação (anotador)

Preencher uma linha por tarefa, por participante.

| Tarefa | Sucesso (S / com dificuldade / falha) | Tempo aprox. | Erros / becos sem saída | SEQ (1–7) | Citação-chave |
|---|---|---|---|---|---|
| 1 · Entrada + cadastro | | | | | |
| 2 · Triagem + match | | | | | |
| 3 · Agendamento (única + recorrente) | | | | | |
| 4 · 1ª sessão + aviso de espera | | | | | |
| 5 · Botão de pânico + sala de emergência | | | | | |

**Escala SEQ (perguntar após cada tarefa):** "No geral, quão fácil ou difícil foi realizar essa tarefa?" — 1 = muito difícil, 7 = muito fácil.

**Códigos de severidade para achados (na análise):** 0 = não é problema · 1 = cosmético · 2 = menor · 3 = maior (atrapalha a tarefa) · 4 = catastrófico (impede a conclusão).

---

## 8. Fora do escopo desta rodada

Deixados de fora por serem "núcleo essencial" — candidatos a uma segunda rodada abrangente:
reagendar/cancelar com escopo de recorrência (§6.9), assistente **Nyna** e chat 24/7 (§6.13), check-in de bem-estar (§6.14), "Meu Perfil" e direitos LGPD / prontuário (§6.15), feedback pós-sessão e pesquisas (§6.12).
