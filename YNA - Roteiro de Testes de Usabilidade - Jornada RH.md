# ROTEIRO DE TESTES DE USABILIDADE — JORNADA RH / EMPRESA

**Produto:** YNA Care Hub — Painel RH (B2B)
**Versão do roteiro:** 0.2 (escopo A–E validado)
**Data:** 06 de julho de 2026
**Base:** Documento de Requisitos v1.2 (Fluxo 1 — RH/Empresa) + frontend implementado (telas RH-00 a RH-18)
**Responsável:** Fabiano Nadler (FDN)

> **Escopo desta rodada:** os **5 fluxos críticos A–E** (do primeiro acesso à leitura dos indicadores/NR-1). Os fluxos F (gestão de acessos), G (Financeiro) e H (navegação/mobile) ficam para uma rodada posterior — ver Seção 10.
>
> **Status:** Antes de aplicar, confirmar: (1) nº e perfil dos participantes, (2) se o protótipo tem dados mockados suficientes para cada tarefa (a base de importação já está pronta — ver `testes-usabilidade/`). O formato está definido: **teste moderado remoto** (ver Seção 3).

---

## 1. OBJETIVOS DO TESTE

### 1.1 Objetivo geral
Validar se profissionais de RH/DHO conseguem, de forma autônoma e com confiança, realizar as tarefas críticas da jornada de gestão do benefício YNA — e se compreendem a promessa central de **sigilo individual e conformidade com a LGPD/NR-1**, que é o principal fator de adesão do cliente B2B.

### 1.2 Objetivos específicos
1. Verificar se o RH consegue **preparar a plataforma** (departamentos, equipe) sem apoio do CSM.
2. Avaliar a facilidade de **cadastrar beneficiários** (planilha + individual) e interpretar erros de validação.
3. Avaliar o entendimento e a execução do **envio de convites em lote** e a leitura do **funil agregado**.
4. Medir a compreensão do **Dashboard de Indicadores**, do **mapa de calor NR-1** e do conceito de **k-anonimato (≥4)**.
5. Validar a percepção de **confiança/segurança/LGPD** — o RH acredita que não vê dados individuais? Isso é claro?
6. Identificar pontos de fricção, erros, dúvidas de vocabulário (tom de voz Cora) e barreiras de acessibilidade.

### 1.3 Perguntas de pesquisa
- O RH entende **o que vê e o que não vê**? A promessa de sigilo é crível?
- O RH sabe **em que ordem** preparar a plataforma antes de convidar o time?
- O mapa de calor e os KPIs geram **ação** (o RH sabe o que fazer com um alerta NR-1)?
- O vocabulário e a navegação são previsíveis? Onde as pessoas travam?

---

## 2. PERFIL DOS PARTICIPANTES

### 2.1 Público-alvo (persona do painel RH)
Profissionais que administram benefícios / saúde e segurança / DHO em empresas de médio-grande porte.

### 2.2 Critérios de recrutamento
| Critério | Alvo |
| --- | --- |
| Cargo | Analista / Coordenador / Gerente de RH, DHO, People, Benefícios ou SESMT |
| Experiência | Gere benefícios de saúde/bem-estar ou riscos psicossociais (NR-1) |
| Familiaridade digital | Usa planilhas e sistemas de gestão de pessoas no dia a dia |
| Contexto NR-1 | Preferencialmente já lida (ou vai lidar) com a NR-1 / riscos psicossociais |
| Exclusão | Não pode ter participado do design do produto nem ser da YNA |

### 2.3 Amostra sugerida
- **5 a 8 participantes** para teste moderado qualitativo (padrão para detectar ~85% dos problemas de usabilidade).
- Se possível, incluir **1–2 participantes da empresa-piloto (BCP Securities)** e o restante de perfil equivalente.
- Mix de papéis: pelo menos **2 no papel "Master/Admin"** e **1 no papel "Operador"** (tarefas de cadastro).

---

## 3. MÉTODO E LOGÍSTICA

| Item | Definição sugerida |
| --- | --- |
| Tipo | Teste de usabilidade **moderado**, baseado em tarefas, com *think-aloud* (pensar em voz alta) |
| Formato | **Remoto** — videochamada com **compartilhamento de tela do participante** (o participante conduz o protótipo na própria máquina) |
| Ferramentas | Plataforma de vídeo com gravação (Zoom / Google Meet / Teams); protótipo acessível por link |
| Duração | 45–60 min por sessão |
| Ambiente | Protótipo/MVP com dados mockados, aberto pelo participante no **navegador desktop** |
| Gravação | Tela + áudio, **com consentimento assinado** (autorização confirmada em vídeo no início) |
| Papéis da equipe | 1 moderador + 1 anotador (observador com câmera/microfone desligados) |
| Dados de teste | Login RH pré-configurado (empresa fictícia, ex.: BCP Securities) enviado ao participante antes da sessão; massa de beneficiários e indicadores mockados |

### 3.1 Regras do moderador
- **Não guiar.** Se o participante travar, esperar ~30s antes de intervir. Perguntar "o que você faria agora?" / "o que você esperava que acontecesse?".
- Nunca usar o nome do botão que o participante procura.
- Registrar **onde** e **por quê** a pessoa hesita, não só se concluiu.

### 3.2 Cuidados específicos do formato remoto
- **Testar tecnologia antes:** enviar o link do protótipo e do login com antecedência e reservar 3–5 min iniciais para checar áudio, vídeo e compartilhamento de tela.
- **Compartilhamento pelo participante:** peça que ele compartilhe a **tela inteira** (não só a aba), para capturar navegação, notificações e hesitações.
- **Reforce o *think-aloud*:** no remoto o silêncio é mais comum — lembre gentilmente "pode ir narrando o que está pensando".
- **Plano B de conexão:** se cair, ter um canal alternativo (telefone/WhatsApp) combinado; se a tela travar, o moderador pode compartilhar a própria como contingência.
- **Consentimento:** confirmar verbalmente a autorização de gravação **com a gravação já ligada**, antes de iniciar as tarefas.

---

## 4. MÉTRICAS

### 4.1 Quantitativas (por tarefa)
- **Taxa de sucesso** (concluiu sem ajuda / com ajuda / não concluiu).
- **Tempo até a conclusão.**
- **Nº de erros / caminhos errados.**
- **SEQ (Single Ease Question):** "Quão fácil ou difícil foi realizar esta tarefa?" (1 muito difícil – 7 muito fácil), aplicada logo após cada tarefa.

### 4.2 Ao final da sessão
- **SUS (System Usability Scale)** — 10 itens, escala 0–100.
- **Pergunta de confiança/LGPD** (chave para o B2B): "Nesta plataforma, o quanto você confia que não consegue ver dados individuais/clínicos de um colaborador?" (0–10) + por quê.

### 4.3 Critérios de sucesso (rascunho — validar)
- Taxa de sucesso sem ajuda ≥ **80%** nas tarefas críticas (cadastro, convites, indicadores).
- SUS médio ≥ **70**.
- Confiança LGPD média ≥ **8/10** e **nenhum** participante achando que "vê dado individual".

---

## 5. ROTEIRO DO MODERADOR

### 5.1 Abertura (5 min)
> "Obrigado por participar. Estamos testando a **plataforma**, não você — não existe resposta certa ou errada. Vou pedir que você realize algumas tarefas e **pense em voz alta**: o que está olhando, o que espera que aconteça, onde tem dúvida. Se travar, tudo bem — isso é justamente o que queremos aprender. Posso gravar a tela e o áudio?"

### 5.2 Aquecimento / contexto (5 min)
- Qual seu cargo e o que você faz no dia a dia?
- Você já lida com benefícios de saúde mental ou com a NR-1? Como é hoje?
- O que te preocupa ao adotar uma plataforma de saúde mental para os colaboradores?
  *(Ancora a percepção de privacidade antes de ver o produto.)*

### 5.3 Bloco de tarefas (30–35 min) — ver Seção 6
### 5.4 Entrevista de fechamento (5–10 min) — ver Seção 7

---

## 6. CENÁRIOS E TAREFAS

> As tarefas seguem a ordem natural da jornada (Ativação → Configuração → Gestão). Cada tarefa tem: **cenário** (contexto realista), **gatilho** (o que pedir), **caminho esperado** e **o que observar**. Priorização em ⭐ (crítica) / ▸ (secundária).

---

### FLUXO A — Primeiro acesso e ativação da conta ⭐
**Telas:** RH-01 Convite · RH-04 Cadastro de conta · RH-05 Conta criada · RH-06 Onboarding
**Requisito:** RF-RH-01.2 (usuário Master com link de primeiro acesso)

**Cenário:** "Você é a pessoa de RH responsável pelo benefício. A YNA acabou de criar a conta da sua empresa e você recebeu um e-mail de boas-vindas."

**Tarefas:**
- A1. A partir da tela de convite, **crie o seu acesso** de administrador.
- A2. Ao concluir, diga com suas palavras: **o que você entendeu que precisa fazer** para o benefício começar a funcionar?

**Observar:** Clareza do que é a plataforma; a pessoa entende que é o "Master"? O onboarding orienta os próximos passos ou some rápido demais?

---

### FLUXO B — Preparar a estrutura (departamentos + equipe) ⭐
**Telas:** RH-14 Departamentos · RH-15 Equipe RH
**Requisitos:** RF-RH-03.1 (departamentos), RF-RH-03.2/03.3 (operadores e permissões), RN-RH-03.1 (só Master cria usuários)

**Cenário:** "Antes de subir a lista de colaboradores, você quer organizar a empresa por áreas e trazer uma pessoa do seu time para ajudar."

**Tarefas:**
- B1. **Crie um novo departamento** chamado *"Operações"*.
- B2. **Convide um colega** como **Operador** para ajudar no cadastro.
- B3. Explique: qual a diferença entre **Master** e **Operador**? O que o Operador **não** pode fazer?
- B4. *(Sonda)* Ao ver o aviso de que "departamentos com menos de 4 pessoas são agrupados", o que você entende disso?

**Observar:** A pessoa liga "departamento" ao "mapa de calor"? Entende o vínculo entre estrutura e relatórios? A explicação dos papéis é clara sem clicar?

---

### FLUXO C — Cadastrar beneficiários ⭐
**Telas:** RH-11 Beneficiários (Adicionar + Importar planilha)
**Requisitos:** RF-RH-04.1 (template), RF-RH-04.2 (upload + validação), RF-RH-04.3 (cadastro individual), privacy-by-design

**Cenário:** "Você tem uma planilha com centenas de colaboradores para incluir, e depois um colaborador novo que entrou hoje."

> **Base de teste pronta:** use `testes-usabilidade/base-teste-importacao-beneficiarios.csv` (154 linhas, 3 erros plantados nas linhas 14/27/39) — coerente com o resultado que a tela exibe (**154 total · 151 válidos · 1 duplicado · 3 com erro**). Detalhes em `testes-usabilidade/README-base-importacao.md`.

**Tarefas:**
- C1. **Importe a lista** de colaboradores pela planilha. *(Observar se baixa o modelo, entende os campos mínimos, lê o resultado da validação — válidos/duplicados/erros.)*
- C2. Ao ver os **erros de validação**, o que você faria?
- C3. Agora **cadastre um beneficiário individual**: *Maria Souza, do departamento Operações*.
- C4. *(Sonda de privacidade)* Ao cadastrar, você informa nome, CPF, e-mail e departamento. **Por que a plataforma não pede dados como gênero ou histórico?** O que você entende disso?

**Observar:** Fricção no upload; compreensão do resultado da validação; entendimento do princípio "a empresa carrega o mínimo, o colaborador completa o resto".

---

### FLUXO D — Enviar convites e ler o funil ⭐
**Telas:** RH-12 Convites · RH-11 (envio em massa por seleção)
**Requisitos:** RF-RH-05.1/05.2 (link único), RF-RH-05.3 (reforço D+3/D+7/D+14), RF-RH-05.4 (funil agregado), RN-RH-05.1 (anonimato)

**Cenário:** "O RH já distribuiu o comunicado interno. Agora é hora de disparar os convites para o pessoal acessar."

**Tarefas:**
- D1. **Dispare os convites** para quem ainda não foi convidado.
- D2. Alguns dias depois, você quer saber **como está a adesão**. Onde você olha? O que os números te dizem?
- D3. *(Sonda de privacidade)* Você consegue ver **quem** abriu ou concluiu o cadastro? Isso é um problema ou um alívio para você?
- D4. O que acontece com quem não respondeu? *(Verificar entendimento do reforço automático.)*

**Observar:** A pessoa entende que o funil é **agregado**; interpreta as taxas de conversão; percebe a orientação de "disparar após o kit de comunicação".

---

### FLUXO E — Ler indicadores e o mapa de calor NR-1 ⭐⭐ (o mais crítico)
**Telas:** RH-10 Home (card de adesão + alertas) · RH-13 Indicadores (KPIs, heatmap, alertas)
**Requisitos:** RF-RH-06.1 (KPIs), RF-RH-06.3 (mapa de calor), RN-RH-06.1 (k-anonimato ≥4)

**Cenário:** "A liderança pediu um panorama do bem-estar do time e da conformidade com a NR-1."

**Tarefas:**
- E1. Na tela inicial, **qual é a taxa de adesão** da empresa? O que ela significa?
- E2. Vá aos **Indicadores**. Encontre o departamento que **merece mais atenção** e explique por quê.
- E3. Interprete o **mapa de calor**: o que significam as cores? O que é uma célula "Alto"?
- E4. Você encontra um departamento marcado como **"Agrupado por anonimato (<4 pessoas)"**. O que isso quer dizer? Isso te incomoda ou te tranquiliza?
- E5. Há um **alerta de risco psicossocial**. Como você reagiria a ele? O que faria a seguir?
- E6. *(Sonda)* Com base nessa tela, você conseguiria **identificar uma pessoa específica** em sofrimento? Você **deveria** conseguir?

**Observar:** Compreensão do heatmap; se a pessoa tenta (e falha, corretamente) individualizar; se os alertas geram ação; leitura da legenda; entendimento do k-anonimato como recurso de proteção, não como limitação irritante.

---

> **Fluxos F (gestão de acessos), G (Financeiro) e H (navegação/mobile)** ficam fora desta rodada (ver Seção 10). Se sobrar tempo na sessão, valem como tarefas-bônus de observação livre.

---

## 7. ENTREVISTA DE FECHAMENTO

1. Em uma palavra, como foi usar a plataforma?
2. O que foi **mais fácil**? O que foi **mais confuso ou frustrante**?
3. Teve algum momento em que você **não confiou** no que a tela dizia?
4. **Sobre privacidade:** com suas palavras, o que a YNA vê e o que **você (RH)** vê de cada colaborador? *(Compara com o entendimento correto.)*
5. Você se sentiria seguro para **defender essa ferramenta** internamente (liderança, jurídico, colaboradores)? Por quê?
6. Teve alguma palavra ou termo que você não entendeu? *(Captura ruído do tom de voz / jargão.)*
7. Faltou alguma informação ou função que você esperava encontrar?
8. Aplicar **SUS** (10 itens) + pergunta de **confiança LGPD** (0–10).

---

## 8. GRADE DE OBSERVAÇÃO (para o anotador)

| Tarefa | Sucesso (S/ Ajuda / Não) | Tempo | Nº erros | SEQ (1–7) | Pontos de fricção / citações |
| --- | --- | --- | --- | --- | --- |
| A1 Criar acesso | | | | | |
| B1 Criar departamento | | | | | |
| B2 Convidar operador | | | | | |
| C1 Importar planilha | | | | | |
| C3 Cadastro individual | | | | | |
| D1 Disparar convites | | | | | |
| D2 Ler funil/adesão | | | | | |
| E2 Achar depto crítico | | | | | |
| E3 Interpretar heatmap | | | | | |
| E4 Entender k-anonimato | | | | | |
| E5 Reagir ao alerta NR-1 | | | | | |

**Legenda de severidade dos problemas encontrados:**
`0` cosmético · `1` menor (irrita, não bloqueia) · `2` maior (atrasa/frustra) · `3` crítico (impede a tarefa ou quebra a confiança)

---

## 9. MAPA TAREFA → REQUISITO → TELA (rastreabilidade)

| Fluxo | Requisitos (Doc v1.2 §5) | Telas |
| --- | --- | --- |
| A. Primeiro acesso | RF-RH-01.2, RN-RH-01.2 | RH-01, RH-04, RH-05, RH-06 |
| B. Estrutura + equipe | RF-RH-03.1/03.2/03.3, RN-RH-03.1 | RH-14, RH-15 |
| C. Cadastro beneficiários | RF-RH-04.1/04.2/04.3, RNF-RH-04.1 | RH-11 |
| D. Convites + funil | RF-RH-05.1→05.5, RN-RH-05.1 | RH-12, RH-11 |
| E. Indicadores + NR-1 | RF-RH-06.1/06.3/06.5, RN-RH-06.1 | RH-10, RH-13 |

---

## 10. FORA DO ESCOPO DESTA RODADA
**Adiado para uma rodada posterior** (parte do produto, mas não nesta bateria A–E):
- **Fluxo F — Gestão de acessos** (excluir/mover beneficiários, licenças) · RH-11.
- **Fluxo G — Financeiro** (parcelas, NF/boleto, informar pagamento) · RH-10, RH-18.
- **Fluxo H — Navegação e mobile** (menu "Mais", conta) · RH-16, RH-17.

**Fora do escopo do produto/MVP:**
- Relatório mensal "one page" em PDF (RF-RH-06.4) — verificar se está implementado antes de incluir.
- Fluxos de retenção (relatório mensal, reunião CSM, renovação) — **fora do MVP** por definição.
- Assinatura eletrônica de contrato — fora da plataforma no MVP.
- Jornadas do Beneficiário e do Profissional — testes próprios.

---

## 11. PRÓXIMOS PASSOS ANTES DE APLICAR
1. **Você validar** este roteiro (tom das tarefas, cenários) — escopo A–E já confirmado.
2. Confirmar a massa de dados dos fluxos A, B, D e E (heatmap com depto <4, alertas NR-1, funil). ✅ A base do Fluxo C (importação) já está pronta em `testes-usabilidade/`.
3. Recrutar 5–8 participantes conforme Seção 2.
4. Rodar **1 piloto interno** para calibrar tempo e clareza das instruções.
5. Preparar termo de consentimento de gravação.
6. Consolidar achados em matriz **severidade × frequência** e priorizar correções.
