# **DOCUMENTO DE REQUISITOS — MVP YNA CARE HUB**

**Versão:** 1.1  
**Data:** 20 de junho de 2026   
**Autor:** Fabiano Nadler (FDN) com apoio de IA   
**Status:** Atualizado após implementação do frontend do Beneficiário (Fluxo 2)

---

## **CONTROLE DE VERSÕES**

| Informações | Mudanças principais |
| ----- | ----- |
| 0.127/05/2026FDN | Rascunho inicial — fluxos Empresa/RH e Colaborador. |
| 1.007/06/2026FDN | Incorporadas respostas sobre o fluxo do psicólogo. Renomeado “Colaborador” → “Beneficiário”. Removidas etapas de retenção do escopo MVP. Adicionados fluxos do Profissional e dos Gestores YNA. Ajustes no Beneficiário (Nyna, check-in opcional, prontuário sob solicitação). |
| 1.120/06/2026FDN | Atualização do Fluxo 2 (Beneficiário) após implementação do frontend. Assistente IA renomeada "Nina" → "Nyna". Adicionados: apresentação/boas-vindas antes do gate LGPD; agendamento recorrente além de sessão única; reagendamento/cancelamento com escopo de recorrência e política de antecedência; troca de profissional e novos matches por intenção; sala de emergência com plantonista e Nyna de companhia; tela "Meu Perfil" (ex-"Meus dados") com "Fale Conosco" e ações de direitos LGPD. **Retirados do escopo do MVP:** Roda da Vida, Conquistas (gamificação leve), Carta de Progresso (relatório pessoal) e exportação de PDF do beneficiário — permanecem no roadmap pós-piloto. |

---

## **1\. INTRODUÇÃO E CONTEXTO DO PROJETO**

A YNA Care Hub é uma plataforma de saúde mental integrada que combina rigor clínico-acadêmico (via parceria Domus), tecnologia com propósito e cuidado humano real. O objetivo deste MVP é validar com um piloto controlado a jornada integral de cuidado em três frentes interdependentes (Empresa/RH, Beneficiário e Profissional), comprovando o valor da plataforma para justificar a evolução do produto e a comercialização em escala. A plataforma se posiciona como um **concierge** que conduz o beneficiário pela jornada — não como um marketplace de soluções.

Este documento detalha os requisitos dos quatro fluxos relevantes para o MVP (Empresa/RH, Beneficiário, Profissional e Gestores YNA) e servirá como base para a etapa de Planejamento técnico e para a geração do prompt de construção do MVP.

### **Referências utilizadas**

* YNA\_FluxosNavegacao\_MVP\_2026\_v3.pptx.pdf — fluxos visuais do MVP

* YNA\_Pitch\_Comercial\_2026.pdf — pitch comercial e modelo de negócio

* YNA Branding Persona.pdf — persona Cora e sistema de tom de voz

* 001-001 \- YNA \- MVP Plataforma de Saúde Mental \- Proposta Comercial.pdf — proposta comercial

* 001 \- YNA \- Kickoff \- Anexo Lista de Dúvidas — Lista de Dúvidas com respostas do cliente (reunião de 26/05/2026)

---

## **2\. PREMISSAS DO PILOTO**

### **2.1 Premissas estruturais (confirmadas)**

* **Empresa-piloto:** BCP Securities (banco global, presença pequena no Brasil). Público-alvo de aproximadamente **200 beneficiários** no piloto.

* **Perfil do beneficiário-piloto:** jovem, 100% São Paulo e Rio de Janeiro, perfil digital.

* **Profissionais:** 30 a 50 psicólogos selecionados pela Domus para o piloto.

* **Comunicação prévia ao lançamento:** média de 15 dias antes do go-live.

* **Janela de execução:** sem data inegociável, mas alvo é ter MVP funcional em **agosto/setembro de 2026** para validação no mercado.

* **Empresa já comprometida:** o fluxo B2B inicia diretamente no kick-off operacional, sem landing de captação ou funil de vendas no MVP.

* **Profissionais pré-selecionados:** já aprovados pela Domus entram diretamente em onboarding (sem candidatura, triagem ou entrevista no MVP).

* **Fluxo do Beneficiário é o mais completo:** é o objeto central do MVP.

### **2.2 Modelo de negócio**

**Operação geral:** opera de forma análoga a um plano de saúde, mas não é regulamentado — exige atenção à inadimplência e portabilidade.

**B2B:** 

* Contrato com duração mínima de **12 meses**, com aviso prévio de **60 dias** para cancelamento. 

* Empresa contrata um **plano base**, e o beneficiário pode optar por módulos/serviços adicionais (idealmente cobrados em folha — a definir). 

* Inadimplência: falta de pagamento resulta em corte de acesso após período estipulado em contrato.

*  Portabilidade prevista: B2B → B2C, B2B → outro B2B, B2C → B2B. Sempre com período adicional de suporte na transição.

**B2C:** 

* Planos com periodicidade **anual, semestral e trimestral**.   
* Pagamento via cartão de crédito.

**Antecipação de recebíveis ao profissional:** é um **produto financeiro com receita para a YNA** — quanto menor o prazo, maior a taxa. Categorias de psicólogos terão cadências diferentes, sendo **uma semana a menor**.

### **2.3 Premissas em aberto**

* **Pricing detalhado** (faixa mínima de licenças, descontos por volume, valor por colaborador, planos com diferentes features).

* **KPI principal do MVP** ainda não definido. Métricas candidatas: NPS, adesão à plataforma, comparecimento às sessões. Visão 360° (empresa \+ beneficiário \+ profissional).

* **Quadro de saúde mental da empresa** como indicador macro a desenhar — desde que valide os três públicos.

---

## **3\. GLOSSÁRIO E ATORES**

| Termo | Definição |
| ----- | ----- |
| **YNA Care Hub** | Plataforma SaaS de saúde mental integrada (objeto do MVP). |
| **Domus** | Parceira institucional de 35 anos, responsável pela seleção, formação e supervisão clínica dos psicólogos. |
| **B2B** | Modelo de venda para empresas (RH/DHO contrata para beneficiários). |
| **B2P2C** | Modelo onde o profissional (psicólogo) é credenciado pela YNA e atende o consumidor. |
| **B2C** | Modelo direto-ao-consumidor (beneficiário continua na plataforma após o fim do contrato corporativo ou contrata individualmente). |
| **Cora** | Persona de marca que filtra toda comunicação da YNA. |
| **Nyna** | Persona da Assistente Virtual (IA) da YNA. Veste a personalidade de Cora. |
| **NR-1** | Norma Regulamentadora vigente desde 2025 que exige diagnóstico e gestão de riscos psicossociais nas empresas. Valor central do produto. |
| **CSM** | Customer Success Manager — responsável por acompanhar a empresa cliente (no piloto: Fernanda). |
| **DHO** | Departamento de Desenvolvimento Humano e Organizacional. |
| **Universidade YNA** | Plataforma de cursos proprietária — trilhas em texto e vídeo \+ lives em canal fechado do YouTube. |
| **Plantonistas** | Profissionais YNA disponíveis para atendimento de emergência (gatilho: palavras-chave detectadas pela Nyna). |
| **Roda da Vida** | Ferramenta visual (radar) que o beneficiário usa para avaliar pilares da própria vida. |

### **Atores principais**

* **Empresa contratante** (sub-perfis: Master/Admin RH, Operador, Liderança).

* **Beneficiário:** usuário final do programa corporativo, possível futuro usuário B2C.

* **Profissional:** psicólogo credenciado pela YNA via Domus (no MVP). Roadmap futuro: outras especialidades (psiquiatra, nutricionista, etc.).

* **Gestores YNA (backoffice):** comitê e equipes operacionais que gerenciam a plataforma.

* **Domus (curadoria clínica):** Virgínia e Andrea são os pontos de contato clínico. Revisam triagem, matching, supervisionam profissionais.

### **Atores tangenciais**

* **Nyna (Assistente IA 24/7):** agente IA com personalidade da persona Cora. Cobre acolhimento, triagem, suporte emocional entre sessões e Q\&A operacionais simples. Inclui “botão de pânico” para encaminhamento imediato ao plantão.

---

## **4\. PRINCÍPIOS TRANSVERSAIS**

### **4.1 Branding e tom de voz**

Toda comunicação, microcopy, e-mail transacional, mensagem do sistema e copy de tela passa pelo filtro da persona **Cora** (5 arquétipos: Cuidador 60% / Sábio 30% / Amante 10% / Herói Coletivo / Criador). **A Nyna é a expressão conversacional dessa persona.**

As seis dimensões: (1) Especialista com sensibilidade; (2) Empática com equilíbrio; (3) Direta e clara; (4) Confiável sem rigidez; (5) Inspiradora com substância; (6) Construtora com visão e propósito.

**Vocabulário preferido:** cuidado, segurança, evidência, acolhimento, transformação, presença, vínculo, qualidade real, essência, confiança, resultado, jornada, ciência, diferença, construir, pertencer, nunca sozinho, propósito, humano, acesso.

**Vocabulário a evitar:** cura, inovação disruptiva, ecossistema, jornada holística, empoderar, de ponta, líder do mercado, “você merece\!”, ROI (em comunicação ao beneficiário), transforme sua vida, plataforma líder, benchmark, metodologia, stakeholders, sinergias.

**Calibragem por público:** 

* **B2B (RH/DHO):** Sábio \+ Herói coletivo.   
* **B2C (Beneficiário):** Cuidador \+ Amante.   
* **Momentos de crise:** Cuidador puro (sem jargão, sem CTA).   
* **Profissionais (B2P2C):** Sábio \+ Criador \+ Herói (par a par, colega de campo).

**Identidade visual:** **definida** (paleta, ícones). **Tipografia em revisão.** Banco de imagens a contratar (preferência por imagens reais — não IA — alinhado ao propósito de proximidade real).

### **4.2 LGPD e compliance**

* **Sigilo individual do beneficiário é inegociável.** RH/DHO nunca acessa dados identificáveis nem registros clínicos.

* **Carga inicial pelo RH limitada a:** nome completo, CPF, data de nascimento, unidade/departamento, e-mail corporativo. **Princípio privacy-by-design e LGPD:** dados pessoais sensíveis são completados pelo beneficiário no primeiro acesso, com consentimento individual.

* **Anonimização e anonimato:** agrupamentos por área/setor com **menos de 4 colaboradores** são bloqueados para evitar individualização.

* **Termos de Uso e Política de Privacidade:** YNA elaborará um termo único contendo informações pertinentes (DPO, canal de denúncia, etc.). **Pendente:** redação final.

* **Retenção/exclusão pós-saída:** dados gerais (anonimizados) ficam com a YNA; dados pessoais identificáveis são excluídos.

* **CFP (Conselho Federal de Psicologia):** sem requisitos específicos sobre atendimento online além de segurança da informação e sigilo profissional.

* **Prontuário eletrônico:** será produzido pela YNA (não usar solução de mercado). Aderente à LGPD e ao CFP.

### **4.3 Acessibilidade**

Mínimo **WCAG 2.1 AA**, com prioridades específicas da YNA: 

* **Navegação previsível** para usuários com TDAH, autismo, ansiedade ou em crise grave.   
* **Fundos de tela discretos** que permitam ao beneficiário usar a plataforma em ambientes compartilhados (salas com paredes de vidro, escritórios abertos) sem expor o conteúdo.   
* Contraste mínimo 4,5:1 (texto comum) e 7:1 (outros textos/imagens).   
* Texto alternativo obrigatório em imagens funcionais.

### **4.4 Disponibilidade do serviço**

MVP em **PT-BR** apenas. Internacionalização fora do escopo.

### **4.5 Stack tecnológica**

| Camada | Tecnologia | Função principal |
| :---: | :---: | :---: |
| Interface (UI) | React \+ Tailwind CSS | Componentes visuais estilizados e reativos |
| Build/Ferramental | Vite \+ TypeScript | Compilação rápida, tipagem estática, segurança no código |
| API/Servidor | Node.js \+ Fastify ou NestJS | Rotas, regras de negócio, processamento |
| Persistência | PostgreSQL \+ Prisma ORM | Armazenamento com comunicação tipada |

**Critérios:** facilidade de manutenção, desempenho, segurança e **capacidade de escalar.**

**Integrações em aberto:** 

* Solução de vídeo das sessões: **integrada à plataforma ou peer-to-peer** (para gerar logs de presença e duração). Fornecedor a definir (Daily, Twilio Video, etc.). 

* Gateway de pagamento (B2C): **a definir**. Preferência por construir internamente. \- Antecipação de recebíveis: **plugada com fintech** (a definir). 

* ERP/sistema de gestão clínica: a definir (aceita sugestões). 

* Integração com agenda pessoal do beneficiário: **iCal \+ Google Calendar** (oferecida como opção).

### **4.6 Arquitetura de dados e operação**

* **Multi-tenant** com isolamento lógico por padrão para escalabilidade do SaaS, com criptografia separada por tenant.

* **Dashboard RH:** dados de engajamento e avaliação do profissional em **tempo real**; relatórios e análises em cadência **mensal**.

* **Assinatura eletrônica de contrato (B2B):** **fora da plataforma no MVP**. A plataforma assume que o contrato já está firmado e inicia direto no envio de convites.

---

## **5\. FLUXO 1 — RH / EMPRESA B2B**

**Macro-jornada (escopo MVP):** Ativação → Cadastro de beneficiários → Gestão. **Atividades de retenção (relatório mensal, reunião CSM, decisão de renovação) ficam FORA do escopo MVP** — o trabalho de retenção será conduzido diretamente com o cliente sem feature dedicada na plataforma.

### **5.1 Visão geral do fluxo**

| Fase | Etapas |
| ----- | ----- |
| Ativação | Kick-off (fora da plataforma) → backoffice YNA cria conta da empresa |
| Configuração | Setup plataforma → Cadastro de beneficiários (carga via planilha) → Envio de convites (após distribuição do kit pelo parceiro) |
| Gestão | Dashboard RH → Gestão dos acessos dos beneficiários |

### **5.2 Etapa — Kick-off (Ativação)**

**Objetivo:** Alinhar com a empresa-piloto expectativas, papéis, cronograma, métricas e plano de implementação. Atividade fora da plataforma; o backoffice YNA registra a empresa e o usuário Master no sistema.

**Atores:** CSM YNA (Fernanda), Admin RH/DHO da empresa, lideranças-chave.

**User stories** 

*Como CSM, quero registrar a empresa-piloto na plataforma com dados básicos do contrato pré-acordado, para iniciar setup imediatamente após o kick-off.*

**Requisitos funcionais** 

RF-RH-01.1 — Cadastro de empresa-cliente pelo backoffice YNA: razão social, nome fantasia, CNPJ, contato principal RH, segmento, número de contas, plano contratado, data de início e fim do contrato. 

RF-RH-01.2 — Cadastro do **usuário Master (Admin RH)** vinculado à conta corporativa, com envio de e-mail de boas-vindas com link de primeiro acesso.

**Regras de negócio** 

RN-RH-01.1 — Conta corporativa criada por backoffice YNA, não por self-service no MVP. 

RN-RH-01.2 — Toda empresa precisa ter ao menos um usuário Master antes do envio dos convites.

### **5.3 Etapa — Setup da plataforma (Configuração)**

**Objetivo:** Configurar a conta corporativa para receber os beneficiários — estrutura organizacional (departamentos), perfis de acesso e operadores.

**Atores:** Admin RH/DHO (Master) com apoio eventual do CSM YNA.

**Definições confirmadas (kickoff)**

* **Estrutura de perfis na plataforma — três níveis:**

  * **Master (RH)** — acesso completo às funcionalidades de gestão da empresa. Pode criar outros usuários Master ou Operadores.

  * **Operador** — assistentes para tarefas básicas (criação, edição e exclusão de beneficiários).

  * **Beneficiário** — usuário final.

* **“Sistema de gestão” interno:** a própria plataforma terá um sistema que permite à empresa gerir seus colaboradores (inclusão, exclusão, status) sem integração com sistemas de terceiros (ERP/RH) no MVP.

**User stories** 

*Como Master, quero configurar a estrutura de departamentos da minha empresa, para que os relatórios e o mapa de calor da NR-1 mostrem recortes de risco por setor.* 

*Como Master, quero criar Operadores e atribuir-lhes permissões limitadas, para distribuir o trabalho operacional sem dar acesso completo.*

**Requisitos funcionais** 

RF-RH-03.1 — Configuração da **estrutura de departamentos** da empresa cliente (árvore de departamentos/unidades — base do mapa de calor NR-1). 

RF-RH-03.2 — Criação e gestão de usuários Operadores (CRUD). 

RF-RH-03.3 — Atribuição de permissões granular dentro dos papéis Master/Operador.

**Regras de negócio** 

RN-RH-03.1 — Apenas Master pode criar outros Masters ou Operadores. 

RN-RH-03.2 — **Arquitetura multi-tenant** com isolamento lógico de dados e criptografia separada por tenant.

### **5.4 Etapa — Cadastro de beneficiários (Configuração)**

**Objetivo:** Carregar a lista de beneficiários elegíveis na plataforma de forma eficiente, respeitando privacy-by-design.

**Atores:** Master ou Operador.

**Definições confirmadas (kickoff)**

* **Carga inicial via planilha** (modelo a ser fornecido pela YNA — Fabiano propõe layout, Fernando Palmeiro auxilia na definição).

* **Campos mínimos da carga:** nome completo, CPF, data de nascimento, unidade/departamento, e-mail corporativo.

* **Privacy-by-design:** a empresa faz a carga inicial, mas o beneficiário completa os dados pessoais sensíveis (apelido, gênero, preferências, dados de perfil clínico) no primeiro acesso, com consentimento individual.

**User stories** 

*Como Master/Operador, quero baixar um template de planilha padronizado, para preparar a carga inicial sem dúvidas de formato.* 

*Como Master/Operador, quero importar até centenas de beneficiários de uma vez, ver erros de validação e corrigir, antes de gerar convites.* 

*Como Master/Operador, quero também cadastrar um beneficiário individualmente (sem planilha), para incluir novos colaboradores ao longo do contrato.*

**Requisitos funcionais** 

RF-RH-04.1 — Template de planilha CSV/XLSX disponível para download com os campos mínimos. 

RF-RH-04.2 — Upload e processamento da planilha com validação (campos obrigatórios, formato de e-mail, duplicidades, CPF válido). 

RF-RH-04.3 — Cadastro individual de beneficiário (CRUD). 

RF-RH-04.4 — Visualização da lista atual de beneficiários, com filtros por departamento e status (não convidado / convidado / ativo / inativo). 

RF-RH-04.5 — Edição em massa de departamento/unidade (reorganizações internas). 

RF-RH-04.6 — Exclusão lógica do beneficiário (mantém histórico anonimizado para auditoria).

**Regras de negócio** 

RN-RH-04.1 — Cada beneficiário consome uma “licença”. Excesso bloqueia novos cadastros até regularização contratual. 

RN-RH-04.2 — A plataforma **nunca** expõe ao RH informação clínica ou de jornada individual do beneficiário.

**Requisitos não-funcionais** 

RNF-RH-04.1 — Importação de até 5.000 beneficiários processada em menos de 60 segundos. 

RNF-RH-04.2 — Dados em trânsito e em repouso criptografados (TLS 1.2+ e AES-256).

### **5.5 Etapa — Envio de convites (Configuração)**

**Objetivo:** Disparar para cada beneficiário um link único de primeiro acesso, **após a distribuição interna do kit de comunicação pela empresa**.

**Atores:** Master/Operador (dispara/agenda), Plataforma (automação).

**User stories** 

*Como Master/Operador, quero agendar o disparo dos convites em lote para coincidir com a campanha interna.* 

*Como Master/Operador, quero ver o funil agregado (não enviado / enviado / aberto / cadastro iniciado / cadastro concluído) sem dados pessoais clínicos.*

**Requisitos funcionais** 

RF-RH-05.1 — Geração de link único e personalizado por beneficiário (token assinado, com validade). 

RF-RH-05.2 — Disparo de e-mail transacional com o convite, template assinado pela voz Cora. 

RF-RH-05.3 — Sequência automatizada de reforço (push \+ e-mail). Cadência a refinar (sugestão: D+3, D+7, D+14). 

RF-RH-05.4 — Painel de funil de convites para o RH com dados **agregados/anonimizados**. 

RF-RH-05.5 — Após cadastro, status do beneficiário passa para “Ativo” — sem nenhum dado adicional para o RH.

**Regras de negócio** 

RN-RH-05.1 — Toda informação individual do beneficiário é anonimizada para o RH a partir do cadastro. 

RN-RH-05.2 — Link expira em 30 dias (sugerido) com possibilidade de reenvio. **A validar.**

### **5.6 Etapa — Dashboard RH (Gestão)**

**Objetivo:** Visão contínua da adesão e dos indicadores NR-1 agregados, preservando o sigilo individual.

**Definições confirmadas (kickoff)**

* Dashboard foca em **métricas macro**, evitando dados individuais para prevenir conflitos éticos e LGPD.

* **Indicadores previstos:**

  * **Adesão ao benefício** (% de adesão dos beneficiários) e engajamento

  * **Indicadores de bem-estar** e status de conformidade NR-1

  * **Mapa de calor (heatmap) por departamento** mostrando áreas com maior atenção emocional (estresse/burnout), sem expor identidades

  * **Relatório mensal “one page”** extraível pela plataforma

* **Anonimização e anonimato ≥ 4** (departamentos/setores com menos de 4 colaboradores são automaticamente agrupados).

* **Atualização:** dados de engajamento e avaliação de profissional em **tempo real**; relatórios e análises **mensais**.

* **Relatórios de ROI** são consolidados anualmente para o RH **mas não compõem o escopo do MVP**.

**Atores:** Master, Operador.

**User stories** 

*Como Master, quero ver, em uma tela, a taxa de adesão da minha empresa para acompanhar o sucesso da campanha.* 

*Como Master, quero ver indicadores agregados de bem-estar (índice médio do check-in, sem identificação individual), para entender o “termômetro” do meu time.* 

*Como Master, quero gerar o relatório mensal “one page” em PDF para apresentar à liderança.* 

*Como Master, quero receber alertas quando indicadores agregados sinalizam risco psicossocial elevado.*

**Requisitos funcionais** 

RF-RH-06.1 — Painel com KPIs principais: taxa de convites aceitos, % beneficiários ativos, % de check-ins respondidos (agregado), índice médio de bem-estar, nº de sessões realizadas agregado, NPS médio (agregado), satisfação com a plataforma e com o profissional (agregado). 

RF-RH-06.2 — Filtros por período (semana / mês / trimestre) e por departamento, com k-anonimato mínimo 4\. 

RF-RH-06.3 — **Mapa de calor por departamento** com indicadores de risco psicossocial (NR-1). 

RF-RH-06.4 — Geração e download do relatório mensal “one page” em PDF. 

RF-RH-06.5 — Alertas configuráveis para thresholds NR-1.

**Regras de negócio** 

RN-RH-06.1 — Sigilo individual inegociável. Toda visualização é agregada com k-anonimato ≥ 4\. 

RN-RH-06.2 — Conjunto exato de KPIs específicos da NR-1 e thresholds: **pendente detalhamento técnico clínico** com Domus e jurídico YNA.

**Requisitos não-funcionais** 

RNF-RH-06.1 — Tempo de carregamento do dashboard \< 3 segundos para até 5.000 beneficiários. 

RNF-RH-06.2 — Exportação assíncrona com notificação por e-mail quando o relatório estiver pronto.

### **5.7 Etapa — Gestão dos acessos dos beneficiários (Gestão)**

**Objetivo:** Permitir ao RH gerenciar inclusões, exclusões e status dos beneficiários ao longo do contrato, refletindo mudanças no quadro da empresa.

**User stories** 

*Como Master/Operador, quero excluir um beneficiário quando ele sai da empresa, para liberar a licença e desabilitar seu acesso de forma controlada.* 

*Como Master/Operador, quero adicionar novos beneficiários ao longo do contrato, conforme o quadro da empresa cresce.*

**Requisitos funcionais** 

RF-RH-07.1 — Exclusão de beneficiário com período adicional de suporte (portabilidade — definir prazo, sugestão: 30 dias para B2C ou transição). 

RF-RH-07.2 — Status do beneficiário: Convidado / Ativo / Inativo / Em portabilidade. 

RF-RH-07.3 — Notificação automática ao beneficiário sobre transição/portabilidade (opção B2C). 

RF-RH-07.4 — Bloqueio de inclusões quando o número de beneficiários ativos atinge o teto contratado.

**Regras de negócio** 

RN-RH-07.1 — Ao excluir beneficiário: dados gerais anonimizados permanecem na YNA; dados pessoais identificáveis são excluídos. 

RN-RH-07.2 — **Portabilidade prevista:** B2B → B2C, B2B → outro B2B, B2C → B2B. Sempre com período de transição.

---

## **6\. FLUXO 2 — BENEFICIÁRIO**

**Macro-jornada:** Entrada → Onboarding → Match → Cuidado → Fidelização → Migração B2C 

**Premissa-chave:** É o fluxo mais completo do MVP. Sigilo LGPD é a 1ª tela. Nyna (Assistente IA 24/7) está disponível desde o início.

### **6.1 Visão geral do fluxo**

| Fase | Etapas |
| ----- | ----- |
| Entrada | E-mail convite (link único) → decisão de confiança → possível abandono |
| Onboarding | Boas-vindas + apresentação da YNA → Sigilo LGPD → Confia? → Cadastro (completar dados pessoais) |
| Match | Triagem (perguntas fechadas \+ abertas) → 3 matches curados → Gostou? |
| Cuidado | Agendamento → 1ª sessão (vídeo integrado) → Continuar? → Jornada contínua com Nyna |
| Fidelização | Check-in opcional → Roda da Vida → Relatório pessoal → Migração B2C |

### **6.2 Etapa — E-mail convite (Entrada)**

**Objetivo:** Levar o beneficiário até a plataforma com um link personalizado, com a voz Cora-Cuidador-Amante.

**Requisitos funcionais** 

RF-CO-01.1 — Template de e-mail transacional personalizado com nome do beneficiário, nome da empresa contratante e link único assinado. 

RF-CO-01.2 — Copy passando pelo filtro Cora-B2C. 

RF-CO-01.3 — Rastreamento de abertura e cliques (sem identificação individual exposta ao RH). 

RF-CO-01.4 — Expiração configurável (default 30 dias) com possibilidade de renovação.

**Regras de negócio** 

RN-CO-01.1 — Não enviar dados sensíveis no e-mail. 

RN-CO-01.2 — Link válido apenas para o e-mail do beneficiário convidado.

### **6.3 Etapa — Sigilo LGPD (Onboarding)**

**Objetivo:** Estabelecer confiança antes de qualquer coleta de dado. Tela mais crítica do fluxo — gate de confiança.

**Princípio de design:** copy em **Cora-Cuidador puro**, sem jargão jurídico. Explicar: o que a YNA vê e o que **não** vê; o que o RH vê (nada identificável); como o dado é protegido; canal de denúncia (DPO).

**Requisitos funcionais** 

RF-CO-02.1 — Tela inicial obrigatória após clique no convite. 

RF-CO-02.2 — Resumo “em humano” \+ acesso aos documentos legais completos (Termos de Uso e Política de Privacidade) em modal/scroll. 

RF-CO-02.3 — Aceite explícito por checkbox \+ clique no botão “Quero começar” (ou equivalente Cora). 

RF-CO-02.4 — Opção clara de recusa → leva ao fluxo de abandono (não cadastro forçado). 

RF-CO-02.5 — Registro do aceite com timestamp, IP, versão dos documentos (compliance LGPD). 

RF-CO-02.6 — **Boas-vindas e apresentação** antes do gate LGPD: telas introdutórias curtas (1 boas-vindas + 3 slides puláveis) que apresentam o propósito da YNA na voz Cora, com CTAs “Conhecer a YNA” / “Iniciar meu cadastro” e a opção de pular para o sigilo. 

RF-CO-02.7 — Atalho **“Já sou cadastrado”** nas telas de entrada → fluxo de login, para o beneficiário que retorna.

**Regras de negócio** 

RN-CO-02.1 — Sem aceite, sem cadastro. 

RN-CO-02.2 — Nova versão de Termos/Política exige novo aceite por todos os usuários ativos. 

RN-CO-02.3 — Beneficiário pode revogar consentimento a qualquer momento (LGPD).

**Pendência:** Termos de Uso e Política de Privacidade precisam ser redigidos — responsabilidade YNA jurídico, com resumo “em humano” feito por FDN/YNA.

### **6.4 Etapa — Decisão “Confia?” (Onboarding)**

**Requisitos funcionais** 

RF-CO-03.1 — Não confia → tela de despedida calorosa (Cora-Cuidador), botão “voltar quando quiser”, link permanece válido. 

RF-CO-03.2 — Registro do evento de recusa (sem dado identificável) para análise de funil agregado.

**Regras de negócio** 

RN-CO-03.1 — Recusa não consome o convite. 

RN-CO-03.2 — Sem nudge agressivo.

### **6.5 Etapa — Cadastro (Onboarding)**

**Objetivo:** Completar o cadastro iniciado pelo RH com dados pessoais que **só o beneficiário pode/deve fornecer**, e configurar a conta.

**Definições confirmadas (privacy-by-design)** 

O RH carrega: nome completo, CPF, data de nascimento, departamento, e-mail corporativo. 

O beneficiário completa no primeiro acesso: senha, sexo/gênero, nome completo, telefone (opcional), foto de perfil (opcional), preferências de comunicação, integração com agenda pessoal.

**Definições confirmadas (implementação)** 

* O cadastro é apresentado em **wizard de 3 passos curtos**: (1) identificação (nome, como quer ser chamada/o, e-mail, telefone opcional, sexo/gênero); (2) senha; (3) foto (opcional). Cada passo pode ser concluído ou pulado conforme o campo.

* **Integração com agenda pessoal** oferece **Google Calendar** e **iCal/Apple Calendar** (sem Outlook no MVP), em etapa própria após o cadastro, com opção de pular.

* **Aceite de comunicações** em etapa dedicada: transacional (obrigatório) e marketing/conteúdo (opcional).

**Requisitos funcionais** 

RF-CO-04.1 — Tela de “Completar cadastro” com pré-preenchimento (não editável) de nome, CPF, e-mail, data de nascimento, departamento. 

RF-CO-04.2 — Campos do beneficiário: senha, sexo, apelido, telefone (opcional), foto (opcional). 

RF-CO-04.3 — Aceite separado de comunicações: transacional (obrigatório) e marketing/conteúdo (opcional). 

 RF-CO-04.4 — Validação de força de senha \+ recomendação de uso de gerenciador. 

RF-CO-04.5 — Configuração opcional de integração com **iCal / Google Calendar** para receber sessões na agenda pessoal.

**Regras de negócio** 

RN-CO-04.1 — Idade mínima 18 anos (calculada a partir da data de nascimento da carga RH). 

**Requisitos não-funcionais** 

RNF-CO-04.1 — Completar cadastro em menos de 90 segundos. 

RNF-CO-04.2 — Aderência ao OWASP Top 10\.

### **6.6 Etapa — Triagem (Match)**

**Objetivo:** Conhecer o beneficiário para fazer um bom matching com o profissional. Conversa, não formulário clínico.

**Definições confirmadas (kickoff)**

* **Cinco perguntas fixas** (sem árvore de decisão ramificada no MVP).

* **Tipologia mista:** combinação de perguntas **fechadas** (de seleção, com opções) **e abertas** (texto livre).

* **Temas das perguntas:**

  * **Momento de vida** atual

  * **Linha terapêutica** de preferência

  * **Necessidades específicas** do beneficiário

* **Definição final das perguntas** sob responsabilidade da **Virgínia (Domus)** — pendente reunião específica (pode ocorrer assíncrona devido a agenda).

**User stories** 

*Como beneficiário, quero responder cinco perguntas que pareçam uma conversa cuidadosa, não um questionário clínico, para me sentir acolhido.* 

*Como beneficiário, quero respostas abertas onde possa me expressar com minhas próprias palavras, e fechadas onde minha escolha facilita o sistema te entender, para um match mais preciso.*

**Requisitos funcionais** 

RF-CO-05.1 — Wizard de 5 perguntas fixas, mistas (fechadas \+ abertas), com copy Cora-Cuidador. 

RF-CO-05.2 — Tipologia de pergunta variada: múltipla escolha, escala visual, chips/tags, textarea para abertas. 

RF-CO-05.3 — Salvamento progressivo (resposta a resposta). 

RF-CO-05.4 — Possibilidade de pular pergunta (registra como “preferência não informada”). 

**Regras de negócio** 

RN-CO-05.1 — As respostas integram o prontuário inicial (LGPD-protegido) e são visíveis ao profissional escolhido. 

RN-CO-05.2 — Triagem **fixa** (sem ramificações). Decisão tomada para evitar complexidade no MVP.

**Pendência:** texto exato das 5 perguntas e tipo (fechada/aberta) — responsável Virgínia (Domus) com apoio FDN para tom de voz.

### **6.7 Etapa — 3 matches curados (Match)**

**Objetivo:** Apresentar três opções de profissionais selecionados por algoritmo \+ curadoria Domus.

**Definições confirmadas (kickoff)** 

* **Vídeos de apresentação dos profissionais** são previstos (não opcionais) — prática que aumenta a eficácia do match. 

* **Critérios de matching:** definidos junto à Virgínia (Domus), com base nas respostas da triagem e na especialidade do psicólogo. 

* **Ranking interno YNA:** **oculto para o beneficiário no MVP** (uso interno YNA / Domus apenas). 

* **A primeira sessão é o teste de “química”** entre beneficiário e terapeuta — caso não se sinta confortável, pode solicitar novo profissional.

**User stories** 

*Como beneficiário, quero ver três perfis profissionais com foto, vídeo curto de apresentação, especialidades, abordagem terapêutica e disponibilidade, para escolher com quem me sinto mais à vontade.* 

*Como beneficiário, quero uma breve explicação de por que esses três foram sugeridos, para confiar na recomendação.*

**Requisitos funcionais** 

RF-CO-06.1 — Apresentação dos 3 perfis com: foto, **vídeo curto de apresentação**, nome profissional, formação, especialidades, abordagem terapêutica, breve “como trabalha”, agenda disponível. 

RF-CO-06.2 — “Por que esses três” — explicação humanizada de cada match. 

RF-CO-06.3 — Modal/página dedicada com detalhes de cada profissional. 

RF-CO-06.4 — Botão “ver outras opções” → recalcula matches ou permite ajustar triagem.

**Regras de negócio** 

RN-CO-06.1 — Os 3 perfis são gerados pelo algoritmo \+ curadoria Domus. 

RN-CO-06.2 — Volume mínimo de profissionais no piloto: garantir diversidade de 3 matches por beneficiário (com 30-50 profissionais previstos, é viável). 

RN-CO-06.3 — Ranking YNA **não é exposto** ao beneficiário no MVP.

### **6.8 Etapa — Decisão “Gostou?” (Match)**

**Requisitos funcionais** 

RF-CO-07.1 — Escolha do profissional → segue para Agendamento. 

RF-CO-07.2 — “Quero ver outras opções” → retorna aos matches. 

RF-CO-07.3 — Microcopy Cora reforça que não há resposta errada.

**Regras de negócio** 

RN-CO-07.1 — Troca pode ser feita a qualquer momento — sempre volta aos 3 matches (recalculados).

### **6.9 Etapa — Agendamento (Cuidado)**

**Definições confirmadas**

* **Integração com agenda pessoal** (iCal \+ Google Calendar) é oferecida ao beneficiário. 

* **Modalidade:** apenas online no MVP. 

* **Lembretes:** push (preferencial) \+ e-mail \+ sincronização com agenda pessoal.

**Requisitos funcionais** 

RF-CO-08.1 — Calendário interativo com slots disponíveis do profissional escolhido. 

RF-CO-08.2 — Confirmação da sessão (data, horário, link da sala). 

RF-CO-08.3 — Lembrete em D-1 e D-0 (1h antes) — via push \+ e-mail \+ atualização na agenda integrada. 

RF-CO-08.4 — Função de **remarcar** (janela mínima sugerida: 24h antes). Quando a sessão é recorrente, o beneficiário escolhe o **escopo**: “apenas esta sessão” ou “este e todos os próximos”. Tela de confirmação dedicada. 

RF-CO-08.5 — Função de **cancelar** (com confirmação dupla, Cora acolhe sem julgar), exibindo o aviso da política de antecedência. Para sessões recorrentes, cancelar “apenas esta” ou “todas as próximas”. Tela de confirmação dedicada. 

RF-CO-08.6 — **Modo de agendamento: sessão única ou compromisso recorrente.** No recorrente, o beneficiário escolhe um dia fixo da semana e horário; a sessão se repete semanalmente e pode ser cancelada a qualquer momento. Resumo e rótulos de confirmação distintos por modo (“Confirmar agendamento” / “Confirmar compromisso recorrente”). 

RF-CO-08.7 — Tela de **Agenda** com abas “Próximas” e “Realizadas” e ações por sessão (entrar na sala / editar / confirmar), além de adicionar nova sessão.

**Regras de negócio** 

RN-CO-08.1 — Modalidade exclusiva no MVP: online (vídeo). 

RN-CO-08.2 — Política de remarcação/no-show: pendente (sugestão: cancelar até 24h antes sem ônus). 

RN-CO-08.3 — Na **1ª sessão** (logo após a triagem/matches) só é oferecida **sessão única**; o **agendamento recorrente** fica disponível somente quando o beneficiário já está na área logada.

### **6.10 Etapa — 1ª sessão (Cuidado)**

**Definições confirmadas (kickoff)**

* **Solução de vídeo integrada à plataforma** (ou peer-to-peer), para gerar **logs de presença e duração** das sessões — garantia do controle do serviço pago.

* **Fornecedor específico** (Daily, Twilio, etc.): pendente — decisão técnica da fase de construção.

**Requisitos funcionais** 

RF-CO-09.1 — Sala de vídeo acessível direto pelo link, sem instalação (WebRTC integrado). 

RF-CO-09.2 — Teste de equipamento (câmera/microfone) antes da entrada. 

RF-CO-09.3 — Indicação visual de criptografia e privacidade. 

RF-CO-09.4 — Funcionalidades da sala: mute, câmera on/off, chat dentro da sessão. 

RF-CO-09.5 — Tempo padrão: 50 minutos. Aviso 5 min antes do término. 

RF-CO-09.6 — Log de presença e duração da sessão (timestamps de entrada/saída). 

RF-CO-09.7 — Pós-sessão (beneficiário): feedback da sessão (ver 6.12 — substitui “NPS pós-sessão”).

**Regras de negócio** 

RN-CO-09.1 — **Gravação de sessão proibida** (LGPD \+ CFP). \- RN-CO-09.2 

Profissional preenche prontuário eletrônico simplificado **obrigatório** após a sessão (ver Fluxo 3).

**Requisitos não-funcionais** 

RNF-CO-09.1 — Latência \< 200ms para 95% das sessões. 

RNF-CO-09.2 — Qualidade adaptativa (degrada vídeo para preservar áudio em conexão lenta). 

RNF-CO-09.3 — Compatibilidade: Chrome, Safari, Firefox, Edge (últimas 2 versões). Mobile: iOS Safari \+ Android Chrome.

### **6.11 Etapa — Decisão “Continuar?” (Cuidado)**

**Requisitos funcionais** 

RF-CO-10.1 — Pergunta única e calorosa em D+1 ou D+2: “Quer continuar com \[nome do profissional\]?”. 

RF-CO-10.2 — Sim → segue Jornada Contínua \+ sugestão de próxima sessão. 

RF-CO-10.3 — Não → volta aos 3 matches recalculados. 

RF-CO-10.4 — Microcopy Cora reforça que trocar é absolutamente normal. 

RF-CO-10.5 — Ao optar por mudar, **tela de intenção** (“quero trocar de profissional” / “só quero explorar opções”) que leva a uma **tela dedicada de novos profissionais disponíveis** (mesmo padrão dos matches), preservando o histórico do beneficiário.

**Regras de negócio** 

RN-CO-10.1 — A “decisão de continuar” pode ocorrer junto ao feedback pós-sessão. 

RN-CO-10.2 — **Trocar de profissional não zera o histórico do beneficiário**, mas o novo profissional **só vê o que o beneficiário autorizar compartilhar** (ver 6.13).

### **6.12 Etapa — Feedback e avaliações (Cuidado / Fidelização)**

**Objetivo:** Captar percepção do beneficiário sobre a sessão, sobre o profissional e sobre a plataforma — sem ser invasivo nem obrigatório.

**Definições confirmadas (kickoff e ajuste)**

* O que antes era chamado de “NPS pós-sessão” é, na verdade, um **feedback livre sobre como foi a sessão** (não um cálculo de NPS).

* **Existem três avaliações** no MVP, todas opcionais e provocadas em cadência não-invasiva:

  * **Feedback pós-sessão** (curto, sobre como foi)

  * **Avaliação do profissional** (cadência maior — base do Ranking YNA interno)

  * **Avaliação da plataforma (YNA)** (cadência maior — base do NPS macro)

* Dados consolidados (não individualizados) servem ao RH e à gestão clínica da Domus, preservando sigilo individual.

**Requisitos funcionais** 

RF-CO-11.1 — Tela de feedback pós-sessão (1-3 perguntas curtas \+ textarea opcional). 

RF-CO-11.2 — Pesquisa periódica sobre o profissional (cadência sugerida: a cada 4-8 sessões). 

RF-CO-11.3 — Pesquisa periódica sobre a YNA (cadência sugerida: trimestral). 

RF-CO-11.4 — Todas as pesquisas são opcionais, com possibilidade de “agora não” sem nudge. 

RF-CO-11.5 — Avaliação do profissional alimenta o Ranking YNA interno (não exposto ao beneficiário no MVP).

**Regras de negócio** 

RN-CO-11.1 — Avaliações **nunca obrigatórias**. 

RN-CO-11.2 — Frequência respeitosa, sem repetição imediata se o beneficiário pular.

**Pendência:** cadência exata das avaliações \+ cálculo do Ranking YNA (a definir).

### **6.13 Etapa — Jornada contínua e Nyna (Cuidado)**

**Objetivo:** Sustentar engajamento contínuo, com próximas sessões agendadas e suporte 24/7 da Nyna (Assistente IA).

**Definições confirmadas (kickoff)**

* **Nyna (Assistente IA)** veste a personalidade de Cora.

* **Escopo da Nyna (todos os itens abaixo):** acolhimento, triagem em primeiro atendimento, suporte emocional entre sessões, Q\&A operacional básico.

* **Botão de pânico:** sempre disponível na interface da Nyna e em momentos críticos. Aciona encaminhamento imediato a profissional plantonista.

* **Palavras-chave de crise** disparam push no celular do **psicólogo responsável e/ou plantonista** (ver Fluxo 3).

* **Suporte:** Nyna cobre Q\&A básico. Casos complexos vão para **central de atendimento YNA** (no MVP, equipe própria YNA).

**User stories** 

*Como beneficiário, quero ter uma tela “home” simples com minha próxima sessão, atalho para agendar, histórico, mensagens e o acesso fácil à Nyna, para gerenciar minha jornada.* 

*Como beneficiário, quero conversar com a Nyna quando algo apertar entre as sessões, sentir-me acolhido e ter um caminho rápido para ajuda urgente se for o caso.* 

*Como beneficiário em momento de crise, quero acionar atendimento de emergência com 1 clique, para falar com um plantonista imediatamente.*

**Requisitos funcionais** 

RF-CO-12.1 — Tela “home” do beneficiário: próxima sessão, atalho para agendar, histórico de sessões, mensagens, **acesso permanente à Nyna**, **botão de pânico visível**. 

RF-CO-12.2 — Reagendamento de próxima sessão em 1-2 cliques. 

RF-CO-12.3 — Interface conversacional da Nyna (chat), 24/7. 

RF-CO-12.4 — Botão de pânico visível em todas as telas relevantes — aciona protocolo de emergência (ver RN abaixo). 

RF-CO-12.5 — Nyna escala automaticamente quando detecta palavras-chave de risco — push para psicólogo responsável e/ou plantonista. 

RF-CO-12.6 — Acesso ao chat assíncrono com o profissional: **a validar inclusão no MVP** (sugestão: incluído, com aviso de SLA do profissional). 

RF-CO-12.7 — **Sala de emergência:** após a confirmação e a escolha do plantonista, tela de conexão que mostra o progresso até o atendimento; enquanto conecta, a **Nyna acompanha o beneficiário** (mensagens de apoio + respostas rápidas), com **CVV 188 / SAMU 192 sempre visíveis**, até a entrada na sala com o plantonista.

**Regras de negócio** 

RN-CO-12.1 — Nyna **nunca substitui** o profissional nem age como diagnóstico clínico. 

RN-CO-12.2 — Protocolo de crise: 

1. Nyna identifica palavras-chave de risco. 

2. Oferece imediatamente: (a) acionar plantonista; (b) ligar para CVV 188 / SAMU 192\. 

3. Dispara push para o psicólogo responsável (se houver) e/ou plantonista de turno. 

4. Registra evento na trilha de auditoria. 

RN-CO-12.3 — Lista exata de palavras-chave e protocolo: pendente definição com Domus.

### **6.14 Etapa — Check-in de bem-estar (Fidelização)**

**Definições confirmadas (kickoff e ajuste recente)**

* **Check-in NÃO é obrigatório.**

* **O beneficiário escolhe** se quer responder e **com que cadência** (não responder / diariamente / semanalmente / outra).

* A **Nyna** se coloca à disposição dentro do espírito *You Are Never Alone* e, **caso o beneficiário consinta, pode fazer perguntas diárias variadas** para identificar bem-estar, alinhadas com NR-1.

* **Push notifications** como incentivo gentil — nunca punição.

**User stories** 

*Como beneficiário, quero decidir se respondo check-ins e com que frequência (diário, semanal, eventual), para que isso seja meu termômetro pessoal e não obrigação.* 

*Como beneficiário, quero que a Nyna puxe assunto com perguntas curtas e variadas, sem virar formulário, para acompanhar meu bem-estar de forma natural.* 

*Como beneficiário, quero ver minha Roda da Vida evoluindo no tempo, para visualizar meu equilíbrio.*

**Requisitos funcionais** 

RF-CO-13.1 — Configuração da preferência de cadência de check-in pelo beneficiário (não responder / diário / semanal / personalizado). 

RF-CO-13.2 — Modo **conversacional pela Nyna** com perguntas variadas alinhadas a aspectos NR-1 (humor, sono, energia, ansiedade, conexão social, etc.). 

RF-CO-13.3 — Modo **formulário curto** (3-5 perguntas) como alternativa rápida. 

RF-CO-13.4 — **[Fora do escopo do MVP — roadmap pós-piloto]** **Roda da Vida**: visualização em radar dos pilares da vida. 

RF-CO-13.5 — **[Fora do escopo do MVP — roadmap pós-piloto]** Gamificação leve: selos/medalhas por marcos (Conquistas). 

RF-CO-13.6 — **[Fora do escopo do MVP — roadmap pós-piloto]** Histórico visual do índice de bem-estar e da Roda da Vida, **Carta de Progresso** (relatório pessoal) e **exportação em PDF** pelo beneficiário.

**Ajuste de escopo (v1.1):** **Roda da Vida, Conquistas (gamificação), Carta de Progresso (relatório pessoal) e exportação de PDF do beneficiário saíram do escopo do MVP** e permanecem no roadmap pós-piloto. Permanece no MVP apenas o **check-in** (configuração de cadência + modos conversacional pela Nyna e formulário curto).

**Regras de negócio** 

RN-CO-13.1 — Check-in **opcional**. Não responder não gera penalidade. 

RN-CO-13.2 — Dados individuais **nunca** expostos ao RH (somente agregados, com k-anonimato). 

RN-CO-13.3 — Cadência configurável pelo beneficiário — sistema respeita a preferência.

### **6.15 Etapa — Meu Perfil, direitos LGPD e prontuário (sob solicitação)**

**Objetivo:** Dar ao beneficiário controle sobre os próprios dados (transparência e direitos LGPD) e um canal claro de contato com a YNA, sem expor a interface ao risco e à complexidade do acesso direto ao prontuário.

**Definições confirmadas (implementação)** 

* A tela passou a se chamar **“Meu Perfil”** (ex-“Meus dados”) e reúne os dados de conta e um bloco de **direitos do titular (LGPD)**.

* As ações de direitos LGPD — **acessar meus dados, corrigir dados incorretos, excluir minha conta, revogar consentimento** — abrem um **ticket interno** para o backoffice YNA, com feedback de confirmação ao beneficiário.

* **Não há mais botão dedicado de “Solicitar prontuário”** na tela. A solicitação de prontuário passa a ser feita pelo canal **“Fale Conosco”** (continua **sob solicitação**, não é download direto — ver Fluxo 4, RF-YN-07.3).

* **Fale Conosco** oferece os canais de contato: **WhatsApp, E-mail e Telefone** (nessa ordem).

**Requisitos funcionais** 

RF-CO-14.1 — Tela **“Meu Perfil”** com dados de conta (pré-preenchidos) e bloco de **direitos LGPD**: acessar meus dados, corrigir dados incorretos, excluir minha conta, revogar consentimento. 

RF-CO-14.2 — Cada ação de direito LGPD gera **ticket interno** para o backoffice YNA processar (ver Fluxo 4), com feedback de confirmação ao beneficiário (ex.: “nossa equipe de privacidade entrará em contato em até 72h”). 

RF-CO-14.3 — **“Fale Conosco”**: modal com canais de contato — WhatsApp, E-mail e Telefone. É por aqui que o beneficiário **solicita o prontuário** (não download direto). 

RF-CO-14.4 — Beneficiário recebe instruções/material da solicitação de prontuário em prazo definido (sugestão SLA: 7 dias úteis).

**Regras de negócio** 

RN-CO-14.1 — Acesso ao prontuário sempre **sob solicitação**, com autenticação reforçada (ex.: confirmar identidade via e-mail). 

RN-CO-14.2 — Material entregue em formato seguro (PDF protegido por senha ou via canal autenticado).

### **6.16 Etapa — Migração B2C / Portabilidade (Fidelização)**

**Objetivo:** Manter o vínculo terapêutico (mesmo profissional) quando o contrato corporativo encerra ou o beneficiário sai da empresa.

**Definições confirmadas** 

* **Portabilidade prevista:** B2B → B2C (mais comum), B2B → outro B2B, B2C → B2B. 

* Sempre com **período adicional de suporte** durante a transição. \- B2C: planos anual / semestral / trimestral. Pagamento por cartão de crédito.

**Requisitos funcionais** 

RF-CO-15.1 — Comunicação D-30 antes do fim do contrato corporativo (ou D-7 após desligamento da empresa) com opção de continuidade B2C. 

RF-CO-15.2 — Tela explicativa: modelo B2C, planos, preços, condições. 

RF-CO-15.3 — Migração com manutenção do histórico e do profissional (se disponível). 

RF-CO-15.4 — Cadastro de forma de pagamento e processamento via gateway (a definir). 

RF-CO-15.5 — Mecanismo de aviso ao profissional sobre a continuidade B2C do beneficiário.

**Regras de negócio** 

RN-CO-15.1 — Migração é **opt-in** pelo beneficiário. 

RN-CO-15.2 — Caso o profissional não esteja disponível para B2C, beneficiário entra em novo match.

---

## **7\. FLUXO 3 — PROFISSIONAL (PSICÓLOGO B2P2C)**

**Macro-jornada:** Onboarding → Ativação → Operação → Crescimento 

**Premissa-chave:** Profissionais já foram pré-selecionados pela Domus — entram direto no onboarding. No MVP, o ator “Profissional” refere-se exclusivamente a **psicólogos**; demais especialidades ficam para o roadmap.

### **7.1 Visão geral do fluxo**

| Fase | Etapas |
| :---: | ----- |
| Onboarding | Boas-vindas Domus → Cadastro (conselho, CPF, PJ, linha teórica) → Setup financeiro → Trilha de integração obrigatória |
| Ativação | Perfil clínico \+ vídeo de apresentação → Perfil ativo (fast-track 48h) |
| Operação | Atendimentos (agenda \+ sala \+ prontuário pós-sessão obrigatório) → Supervisão Domus → Gestão financeira (antecipação) |
| Crescimento | Trilhas avançadas (Universidade YNA) \+ Lives Domus → Avaliações → Ranking YNA (oculto no MVP) |

### **7.2 Etapa — Boas-vindas Domus (Onboarding)**

**Objetivo:** Receber o profissional já aprovado pela Domus com kit de integração e clareza sobre os próximos passos.

**Atores:** Gestor YNA (envia onboarding), Profissional (recebe).

**Requisitos funcionais** 

RF-PR-01.1 — Backoffice YNA cadastra profissional pré-selecionado (informações iniciais vindas da Domus) e dispara convite por e-mail. 

RF-PR-01.2 — E-mail de boas-vindas com tom Cora-Sábio-Criador (par a par), explicando próximos passos e expectativas.

### **7.3 Etapa — Cadastro do Profissional (Onboarding)**

**Objetivo:** Coletar todos os dados profissionais, jurídicos e financeiros necessários para o profissional operar na plataforma.

**Definições confirmadas (kickoff e ajuste recente)**

* **Campos obrigatórios do cadastro:**

  * Número de registro no conselho (CRP) \+ Estado

  * CPF

  * Linha teórica (abordagem terapêutica: cognitivo-comportamental, psicanalítica, humanista, sistêmica, etc.). Pode selecionar mais de uma opção.

  * Áreas de atuação (ex.: ansiedade, depressão, burnout, relacionamentos, luto, etc.). Pode selecionar mais de uma opção.

  * Formação acadêmica \+ certificados (com upload). Pode inserir quantas forem necessárias.

* **Obrigatório ter empresa PJ:** o profissional precisa ter CNPJ ativo para prestar serviços via plataforma. Dados da PJ obrigatórios: CNPJ, razão social, dados bancários da PJ, cartão CNPJ.

* **Vídeo de apresentação** (não opcional — exibido aos beneficiários nos matches). O usuário deverá fazer upload de um vídeo de apresentação. A tela deve passar instruções sobre o formato, orientação (16:9), o que ele deve dizer, cuidados para criar um vídeo com qualidade. No fluxo de Onboarding ele pode ser pulado, mas ficará pendente e em destaque na tela inicial até ele subir o vídeo.

**User stories** 

*Como profissional, quero preencher meu cadastro em um wizard estruturado (dados pessoais → PJ → clínicos → vídeo), para entender o que falta sem me perder.* 

*Como profissional, quero anexar certificados e ver quais já foram validados pela YNA, para manter meu perfil atualizado.*

**Requisitos funcionais** 

RF-PR-02.1 — Wizard de cadastro em 5 etapas: (1) dados pessoais; (2) dados da PJ; (3) dados clínicos (CRP, linha teórica, áreas de atuação); (4) formação e certificados (upload); (5) vídeo de apresentação (upload). 

RF-PR-02.2 — Validação do CRP (idealmente integração com base do CFP — pode ser manual no MVP via backoffice YNA). 

RF-PR-02.3 — Upload de certificados (PDF/imagem) com tamanho máximo e tipos aceitos. 

RF-PR-02.4 — Upload do vídeo de apresentação (formato MP4, duração sugerida: 1-2 minutos). 

RF-PR-02.5 — Status do cadastro: rascunho / em revisão YNA / aprovado / requer ajuste. 

RF-PR-02.6 — **Manter atualizações de formação e certificados ao longo do tempo** — área no perfil para adicionar novos certificados / cursos.

**Regras de negócio** 

RN-PR-02.1 — Sem PJ ativa, profissional não pode atender beneficiários. 

RN-PR-02.2 — Cadastro precisa ser **aprovado pelo backoffice YNA** antes de ativar o perfil para matches. 

RN-PR-02.3 — Atualizações de certificados e formações são revisadas pela YNA antes de aparecer no perfil público.

### **7.4 Etapa — Setup financeiro (Onboarding)**

**Objetivo:** Configurar a forma de recebimento e a participação na antecipação de recebíveis.

**Definições confirmadas (kickoff)** 

* Antecipação **plugada com fintech** (a definir). 

* Antecipação é **produto financeiro com receita para a YNA** — quanto menor o prazo, maior a taxa. 

* **Categorias de profissionais** terão cadências diferentes (a menor: semanal).

**Requisitos funcionais** 

RF-PR-03.1 — Cadastro de dados bancários da PJ (banco, agência, conta, PIX da PJ). 

RF-PR-03.2 — Apresentação clara das opções de cadência de recebimento (semanal, quinzenal, mensal, etc.) com taxa de antecipação aplicável a cada. 

RF-PR-03.3 — Profissional escolhe a cadência inicial (pode alterar a qualquer momento, com regras de transição). 

RF-PR-03.4 — Integração com fintech para automatizar antecipação (a definir).

**Regras de negócio** 

RN-PR-03.1 — Categoria do profissional define o conjunto de cadências disponíveis (algumas exclusivas a categorias maduras). 

RN-PR-03.2 — Taxa de antecipação informada em real time no momento da escolha de cadência.

### **7.5 Etapa — Trilha de integração obrigatória (Onboarding)**

**Objetivo:** Garantir que o profissional entenda a proposta da YNA, sabia usar a plataforma e tenha clareza do que se espera dele.

**Definições confirmadas (ajuste recente)**

* **Trilha obrigatória em vídeo:** o profissional não pode ativar o perfil para atendimentos antes de concluir.

* **Conteúdo da trilha:**

  * Proposta da YNA (missão, posicionamento, persona Cora, “concierge”)

  * Como usar a plataforma (agenda, prontuário, sala de vídeo, antecipação)

  * O que se espera do profissional (postura, padrão Domus, supervisão, conduta clínica online)

  * Política de plantão (ver 7.10)

  * Aspectos legais (LGPD, CFP, sigilo)

**User stories** 

*Como profissional, quero completar a trilha de integração no meu tempo, em módulos curtos com checkpoints de progresso, para absorver bem o conteúdo.* 

*Como gestor YNA, quero saber quais profissionais já completaram a trilha, para ativar perfis automaticamente.*

**Requisitos funcionais** 

RF-PR-04.1 — Módulos em vídeo (sugestão: 5-8 módulos de 5-10 min cada). 

RF-PR-04.2 — Quizzes curtos ao final de cada módulo (opcional / reforço). 

RF-PR-04.3 — Barra de progresso e badge de “Integração Concluída”. 

RF-PR-04.4 — Ativação automática do perfil ao concluir a trilha \+ cadastro aprovado pelo backoffice.

**Regras de negócio** 

RN-PR-04.1 — **Sem trilha concluída, sem perfil ativo.**

### **7.6 Etapa — Perfil clínico ativo (Ativação — fast-track 48h)**

**Objetivo:** Perfil pronto para receber matches em até 48h do início do onboarding.

**Requisitos funcionais** 

RF-PR-05.1 — Perfil público (visível aos beneficiários nos matches) com: foto, vídeo de apresentação, nome profissional, formação, CRP, especialidades, abordagem, breve “como trabalha”, disponibilidade. 

RF-PR-05.2 — Configuração de agenda (slots disponíveis, recorrência, bloqueios). 

RF-PR-05.3 — Visualização do perfil na “perspectiva do beneficiário” (preview).

### **7.7 Etapa — Atendimentos: agenda e sala (Operação)**

**Requisitos funcionais** 

RF-PR-06.1 — Painel “minhas sessões” com agenda do dia/semana/mês. 

RF-PR-06.2 — Detalhes de cada beneficiário visíveis ao profissional: nome, respostas da triagem, histórico de sessões anteriores com o próprio profissional, prontuário (próprio). 

RF-PR-06.3 — Acesso à sala de vídeo a partir da agenda (1 clique). 

RF-PR-06.4 — Funcionalidades da sala iguais à do beneficiário (mute, câmera, chat, log de presença).

**Regras de negócio** 

RN-PR-06.1 — Profissional vê apenas beneficiários que escolheram seu perfil ou que foram realocados a ele. 

RN-PR-06.2 — Nome real do beneficiário só é exibido em situações legais explícitas (ex.: emissão de recibo).

### **7.8 Etapa — Prontuário pós-sessão obrigatório (Operação)**

**Objetivo:** Registrar a sessão de forma simplificada — exigência clínica e contratual.

**Definições confirmadas (ajuste recente)**

* **Após cada sessão, o profissional é OBRIGADO a preencher um prontuário eletrônico simplificado** (textarea). 

* Sobre a sessão e sobre o paciente.

**Requisitos funcionais** 

RF-PR-07.1 — Após o término da sala de vídeo, tela de prontuário aberta automaticamente. 

RF-PR-07.2 — **Campo textarea obrigatório** com placeholder orientativo (sugestão: “Como foi a sessão. Aspectos relevantes do paciente. Encaminhamentos.”). 

RF-PR-07.3 — Salvamento automático periódico (rascunho). 

RF-PR-07.4 — Conclusão do prontuário marca a sessão como “finalizada” no sistema. 

RF-PR-07.5 — Histórico do prontuário do beneficiário visível ao profissional (em ordem cronológica).

**Regras de negócio** 

RN-PR-07.1 — Sessão **não é considerada finalizada** sem o prontuário preenchido. 

RN-PR-07.2 — Profissional tem prazo máximo para preencher (sugestão: 24h após o fim da sessão). Após isso, gera alerta interno. 

RN-PR-07.3 — Prontuário é privado entre profissional e plataforma (sob sigilo). **Beneficiário não acessa diretamente** — só sob solicitação à YNA (ver 6.15). 

RN-PR-07.4 — Em caso de troca de profissional, **o beneficiário decide se compartilha o prontuário com o novo profissional** (ver 7.13).

### **7.9 Etapa — Gestão de férias e ausências (Operação)**

**Objetivo:** Permitir ao profissional informar períodos de ausência e dar ao beneficiário a escolha de continuar ou esperar.

**Definições confirmadas (ajuste recente)**

* Profissional informa **período de ausência** na plataforma.

* **Beneficiário em tratamento** decide: continuar tratamento com outro profissional **ou** esperar o retorno.

**Requisitos funcionais** 

RF-PR-08.1 — Cadastro de período de ausência (data início, data fim, motivo opcional, comunicação ao beneficiário). 

RF-PR-08.2 — Bloqueio automático de agenda durante o período. 

RF-PR-08.3 — **Comunicação automática** aos beneficiários ativos do profissional, com a escolha: 

(a) Aguardar o retorno (sem nova sessão até a volta). 

(b) Continuar tratamento com outro profissional (volta aos 3 matches, com opção de compartilhar prontuário com o novo profissional). 

RF-PR-08.4 — Após retorno, profissional pode reativar relacionamento com beneficiários que escolheram esperar.

**Regras de negócio** 

RN-PR-08.1 — Profissional precisa informar ausência **com antecedência mínima** (sugestão: 7 dias). Para ausências emergenciais, fluxo especial via backoffice YNA.

### **7.10 Etapa — Plantão para emergências (Operação)**

**Objetivo:** Garantir que beneficiários em crise tenham acesso imediato a um profissional.

**Definições confirmadas (ajuste recente)**

* **YNA contará com profissionais plantonistas** para atendimentos de emergência.

* **Profissionais que oferecem o serviço informam disponibilidade** e devem **estar disponíveis para atender prontamente** qualquer emergência durante o plantão.

* O acionamento vem da **Nyna** (quando detecta palavras-chave de crise) ou do **botão de pânico** do beneficiário.

**User stories** \- *Como profissional, quero me oferecer para turnos de plantão e ser remunerado adicionalmente por isso, para contribuir e crescer na plataforma.* \- *Como profissional de plantão, quero ser notificado por push imediatamente quando há emergência atribuída a mim, para atender prontamente.*

**Requisitos funcionais** 

RF-PR-09.1 — Cadastro de disponibilidade para plantão (turnos, dias). 

RF-PR-09.2 — Sistema de **escala de plantão** gerenciado pelo backoffice YNA. 

RF-PR-09.3 — Push notification ao plantonista em caso de acionamento \+ abertura imediata de sala/chat de emergência. 

RF-PR-09.4 — SLA do plantonista para iniciar atendimento (a definir, sugestão: 5 min em horário comercial, 15 min madrugada). 

RF-PR-09.5 — Registro completo do atendimento de emergência (incluindo prontuário pós-atendimento).

**Regras de negócio** 

RN-PR-09.1 — Remuneração do plantão: diferenciada (a definir taxa). 

RN-PR-09.2 — Plantonista de turno precisa estar **prontamente disponível**.

### **7.11 Etapa — Supervisão Domus (Operação)**

**Definições confirmadas**

* Supervisão Domus **ocorre dentro do sistema** (não fora).   
* Lives na plataforma com rounds técnicos para discussão de casos

**Requisitos funcionais** 

RF-PR-10.1 — Calendário de sessões de supervisão Domus (definidas pelo backoffice YNA / Domus). 

RF-PR-10.2 — Inscrição/confirmação do profissional na sessão. 

RF-PR-10.3 — Sala de supervisão (vídeo em grupo \+ chat). 

RF-PR-10.4 — Histórico de supervisão (para o próprio profissional e Domus).

**Pendência:** formato da supervisão (frequência, duração, obrigatoriedade, conteúdo).

### **7.12 Etapa — Gestão financeira do profissional (Operação)**

**Requisitos funcionais** 

RF-PR-11.1 — Dashboard financeiro: sessões realizadas, valor a receber, antecipações disponíveis e taxas. 

RF-PR-11.2 — Solicitação de antecipação (de acordo com a categoria/cadência configurada). 

RF-PR-11.3 — Histórico de recebimentos e notas fiscais (PJ). 

RF-PR-11.4 — Integração com fintech de antecipação.

### **7.13 Etapa — Troca de profissional pelo beneficiário (Operação)**

**Definições confirmadas (ajuste recente)**

* Quando o beneficiário decide trocar de profissional ou agendar com outro, ele **escolhe se compartilha ou não o prontuário** com o novo profissional.

**Requisitos funcionais** 

RF-PR-12.1 — Tela para o beneficiário trocar de profissional (volta aos 3 matches). 

RF-PR-12.2 — **Decisão de compartilhamento do prontuário** com o novo profissional (sim / não) — opt-in explícito. 

RF-PR-12.3 — Se sim, novo profissional vê o histórico de prontuários autorizado; se não, começa com prontuário em branco. 

RF-PR-12.4 — Notificação ao profissional anterior sobre a troca (sem detalhes pessoais do beneficiário).

**Regras de negócio** 

RN-PR-12.1 — Compartilhamento é por opt-in explícito do beneficiário.

### **7.14 Etapa — Universidade YNA: trilhas e lives (Crescimento)**

**Definições confirmadas (ajuste recente)**

* **Plataforma de cursos é proprietária YNA** (“Universidade YNA”). Não usar a da Domus.

* **Trilhas de conteúdo:** vídeos \+ textos, dentro da plataforma.

* **Lives Domus:** rounds técnicos abertos a profissionais cadastrados, sobre casos enfrentados pelos profissionais. Realizados em **canal fechado no YouTube da YNA (a criar)**, com link na plataforma \+ replay disponível para acesso posterior.

* Workshops e estudos de caso também disponíveis na plataforma.

**User stories** 

*Como profissional, quero acessar trilhas avançadas no meu tempo, para me desenvolver continuamente.* 

*Como profissional, quero participar das lives da Domus para discutir casos complexos com pares e supervisores.*

**Requisitos funcionais** 

RF-PR-13.1 — Catálogo de trilhas (categorias, níveis, duração estimada). 

RF-PR-13.2 — Player de vídeo \+ leitor de textos integrado. 

RF-PR-13.3 — Progresso individual em cada trilha (módulo / quiz / certificado). 

RF-PR-13.4 — Agenda de lives Domus (próximas \+ replays). 

RF-PR-13.5 — Inscrição em lives (capacidade, lembretes). 

RF-PR-13.6 — Integração com **canal fechado do YouTube** para lives. 

RF-PR-13.7 — Estudos de caso e workshops disponíveis sob demanda.

**Pendência:** estrutura inicial de trilhas \+ criação do canal fechado no YouTube YNA.

### **7.15 Etapa — Avaliações e Ranking YNA (Crescimento)**

**Definições confirmadas (ajuste recente)**

* **Critérios do Ranking** ainda a definir, mas englobam:

  * Assiduidade nas consultas

  * Pontualidade

  * Horas de sessões realizadas

  * Disponibilidade para a YNA

  * Participação nas trilhas e nas lives

  * Notas dos beneficiários (avaliações pós-sessão)

* **No MVP, o Ranking é OCULTO para os beneficiários e para os profissionais**  (uso interno YNA/Domus). Notas dos pacientes consumidas internamente.

* **Profissionais mal ranqueados** serão notificados e podem sair da plataforma — mas **no MVP NÃO haverá exclusão automática**.

**Requisitos funcionais** 

RF-PR-14.1 — Painel do profissional mostra um score de qualidade nos critérios no ranking. Para cada critério, deve ter um tooltip com explicação de como o item é avaliado. Nesse painel, não deve aparecer o seu lugar no ranking de profissionais nem os comentários dos beneficiários.

RF-PR-14.2 — Backoffice YNA visualiza o ranking completo (ver Fluxo 4). 

RF-PR-14.3 — Cálculo automático do ranking com os critérios definidos.

**Pendência:** fórmula final do ranking (pesos de cada critério).

---

## **8\. FLUXO 4 — GESTORES YNA (BACKOFFICE / OPERAÇÃO)**

**Macro-jornada:** Configurar → Operar → Acompanhar → Atender **Premissa:** É o “motor interno” da plataforma. Os Gestores YNA são responsáveis por habilitar empresas e profissionais, gerenciar conteúdos, plantão, suporte e supervisão clínica (com Domus).

### **8.1 Perfis de gestores YNA**

Reflexo do comitê definido no kickoff \+ necessidades operacionais detectadas:

| Perfil | Atribuições principais | Pessoa-piloto |
| ----- | ----- | ----- |
| **Super-Admin YNA** | Gestão completa do backoffice. Cria outros gestores. Acessos plenos. | Liderança YNA |
| **Gestor Comercial / CSM** | Cadastro de empresas, gestão de contratos B2B, ponto focal RH. | Fernanda |
| **Gestor de Profissionais** | Aprovação de cadastros, escalas, comunicação com profissionais, ranking, plantão. | Adriana |
| **Gestor Clínico (Domus)** | Curadoria de matches, supervisão, definição de triagem/check-in, palavras-chave de crise. | Virgínia \+ Andrea |
| **Gestor de Conteúdo** | Curadoria da Universidade YNA, agenda de lives, materiais. | A definir |
| **Atendente / Suporte** | Atendimento à central de suporte (casos complexos vindos da Nyna), tickets de prontuário, dúvidas operacionais. | A definir |
| **Gestor de Branding / Comunicação** | Tom de voz, microcopy, validação de templates. | Maria Teresa |

### **8.2 Visão geral do fluxo**

| Fase | Etapas |
| ----- | ----- |
| Configurar | Cadastro de gestores YNA — Cadastro de empresas — Aprovação de profissionais — Configuração da Universidade YNA |
| Operar | Gestão de empresas — Gestão de profissionais — Curadoria de matches — Escala de plantão — Conteúdo |
| Acompanhar | Dashboard interno YNA — Ranking — Auditorias LGPD — Indicadores macro |
| Atender | Tickets de suporte — Solicitações de prontuário — Casos de crise |

### **8.3 Etapa — Cadastro e gestão de gestores YNA (Configurar)**

**Objetivo:** Estruturar o backoffice com perfis e permissões granulares.

**Requisitos funcionais** 

RF-YN-01.1 — Cadastro de gestor YNA com perfil pré-definido (ver tabela acima) e permissões granulares. 

RF-YN-01.2 — Apenas Super-Admin pode criar outros Super-Admins. 

RF-YN-01.3 — Log completo de auditoria de ações dos gestores (LGPD). 

RF-YN-01.4 — MFA obrigatório para gestores YNA.

### **8.4 Etapa — Cadastro de empresas clientes (Configurar)**

**Objetivo:** Habilitar uma empresa contratante na plataforma após o kick-off operacional.

**Atores:** Gestor Comercial / CSM.

**Requisitos funcionais** 

RF-YN-02.1 — Tela de criação de conta corporativa: razão social, nome fantasia, CNPJ, contato principal RH, segmento, plano contratado, número de contas (licenças), valor, data início, data fim, observações. 

RF-YN-02.2 — Cadastro do **usuário Master (RH)** da empresa: nome, e-mail corporativo, telefone. Sistema envia e-mail de boas-vindas com link de primeiro acesso. 

RF-YN-02.3 — Visualização da lista de empresas com filtros (ativa, em onboarding, em portabilidade, encerrada). 

RF-YN-02.4 — Edição da empresa (correções, mudança de contato RH, alteração de número de licenças com aditivo). 

RF-YN-02.5 — Encerramento da empresa: gatilha portabilidade (D-30 antes do fim, ver fluxo Beneficiário 6.17). 

RF-YN-02.6 — Anexo de contrato (PDF) ao registro da empresa.

**Regras de negócio** 

RN-YN-02.1 — Empresa só passa a “ativa” após o usuário Master fazer primeiro acesso e configurar departamentos. 

RN-YN-02.2 — Aumento de licenças exige registro de aditivo contratual.

### **8.5 Etapa — Aprovação e gestão de profissionais (Configurar / Operar)**

**Objetivo:** Receber profissionais pré-selecionados pela Domus, aprovar cadastros e gerenciar o ciclo de vida na plataforma.

**Atores:** Gestor de Profissionais, Gestor Clínico (Domus).

**Requisitos funcionais** 

RF-YN-03.1 — Pré-cadastro do profissional (vindo da Domus) pelo Gestor de Profissionais: nome, e-mail, CRP, indicação Domus. 

RF-YN-03.2 — Envio de e-mail de onboarding ao profissional para completar cadastro (ver Fluxo 3.3). 

RF-YN-03.3 — Painel “profissionais a aprovar”: ver o que o profissional cadastrou (CRP, PJ, certificados, vídeo). **Aprovar / Solicitar ajustes / Rejeitar.** 

RF-YN-03.4 — Validação manual de certificados e CRP (futuro: integração com base do CFP). 

RF-YN-03.5 — Aprovação de **atualizações de certificados/formação** ao longo do tempo (workflow contínuo). 

RF-YN-03.6 — Categorização do profissional (define cadência de antecipação): a definir critérios. 

RF-YN-03.7 — Inativação de profissional (saída da plataforma) com regras de transição dos beneficiários ativos.

 RF-YN-03.8 — Painel “férias e ausências dos profissionais” — visão consolidada.

**Regras de negócio** 

RN-YN-03.1 — Profissional só ativa após: cadastro completo \+ trilha de integração concluída \+ aprovação pelo Gestor.

### **8.6 Etapa — Curadoria de matches (Operar)**

**Objetivo:** A Domus revisa o output do algoritmo de matching para garantir qualidade (especialmente no piloto, validando o algoritmo).

**Atores:** Gestor Clínico (Virgínia / Andrea).

**Requisitos funcionais** 

RF-YN-04.1 — Painel de matches pendentes de revisão: respostas da triagem do beneficiário \+ os 3 perfis sugeridos pelo algoritmo. 

RF-YN-04.2 — **Aprovar** os 3 perfis ou **substituir** algum por outro do pool. 

RF-YN-04.3 — Registro do motivo da substituição (telemetria de aprendizado do algoritmo). 

RF-YN-04.4 — SLA da curadoria: matches deveriam ser entregues ao beneficiário em até X horas (sugestão: 24h — a validar).

**Regras de negócio** 

RN-YN-04.1 — No piloto, **toda match é revisada pela Domus**. Em produção, revisão pode ser amostral. 

RN-YN-04.2 — Critérios e pesos do matching definidos com a Virgínia (Domus).

### **8.7 Etapa — Gestão da Universidade YNA (Configurar / Operar)**

**Objetivo:** Curar trilhas, lives e estudos de caso disponibilizados aos profissionais.

**Atores:** Gestor de Conteúdo, Gestor Clínico (Domus).

**Requisitos funcionais** 

RF-YN-05.1 — CMS de trilhas: criar/editar/publicar/arquivar trilhas. Atributos: título, descrição, categoria, nível, duração estimada, capa. 

RF-YN-05.2 — Estrutura modular: trilha → módulos → aulas (vídeo, texto, quiz). 

RF-YN-05.3 — Upload de vídeos (próprios ou link YouTube), textos (markdown), PDFs. 

RF-YN-05.4 — Agenda de lives Domus: criar, agendar, vincular ao **canal fechado do YouTube YNA**, gerenciar inscrições e replays. 

RF-YN-05.5 — Catálogo de estudos de caso e workshops gravados. 

RF-YN-05.6 — Indicadores: engajamento por trilha, taxa de conclusão, profissionais por trilha.

**Pendência:** estrutura inicial de trilhas (matriz de conteúdos), criação do canal YouTube YNA.

### **8.8 Etapa — Escala de plantão e gestão de emergências (Operar)**

**Atores:** Gestor de Profissionais, Atendente de Suporte (em casos críticos).

**Requisitos funcionais** 

RF-YN-06.1 — Visualização da escala de plantão (turnos, profissionais designados, disponibilidade). 

RF-YN-06.2 — Edição da escala (alocar/realocar profissionais, fechar lacunas). 

RF-YN-06.3 — Painel “emergências em curso” — visualização em tempo real de qualquer acionamento de emergência (botão de pânico \+ palavras-chave da Nyna). 

RF-YN-06.4 — Histórico de emergências com SLA de atendimento, profissional acionado, registro do atendimento. 

RF-YN-06.5 — **Lista de palavras-chave** de crise (gerenciada pelo Gestor Clínico).

**Pendência:** lista exata das palavras-chave \+ protocolo de escalonamento (Domus).

### **8.9 Etapa — Suporte e tickets (Atender)**

**Objetivo:** Lidar com casos complexos vindos da Nyna, dúvidas operacionais, solicitações de prontuário, denúncias e demandas administrativas.

**Atores:** Atendente / Suporte, eventualmente Gestor Comercial ou Clínico.

**Requisitos funcionais** 

RF-YN-07.1 — Sistema de **tickets** com tipos: dúvida operacional, solicitação de prontuário (do beneficiário), denúncia LGPD, ajuste de cadastro, problema técnico, queixa sobre profissional, queixa sobre plataforma. 

RF-YN-07.2 — Encaminhamento automático de Nyna → ticket quando não consegue resolver. 

RF-YN-07.3 — Fluxo específico para **solicitações de prontuário do beneficiário**: validar identidade → preparar material (gerar PDF do prontuário a partir das anotações do profissional) → entregar via canal seguro → registrar consentimento e entrega. SLA sugerido: 7 dias úteis. 

RF-YN-07.4 — Atribuição de tickets a atendentes / áreas. 

RF-YN-07.5 — Status, histórico e auditoria de cada ticket. 

RF-YN-07.6 — Indicadores de suporte: tempo médio de resposta, satisfação do atendimento.

**Regras de negócio** 

RN-YN-07.1 — Solicitação de prontuário **sempre passa por validação adicional de identidade** antes da entrega.

### **8.10 Etapa — Dashboard interno YNA / Métricas (Acompanhar)**

**Objetivo:** Visão 360° do negócio para o comitê e equipes operacionais.

**Definições (kickoff):** visão “saúde do negócio” cobrindo perspectivas empresa \+ beneficiário \+ profissional.

**Requisitos funcionais** 

RF-YN-08.1 — Painel **macro YNA**: 

* **Empresas:** ativas, em onboarding, em portabilidade, encerradas. NPS médio das empresas. Adesão média. 

* **Beneficiários:** total ativos, novos no mês, em jornada (com profissional), em pausa, em portabilidade B2C. Distribuição por empresa. 

* **Profissionais:** ativos, em férias, plantonistas disponíveis, distribuição por especialidade, ranking interno. 

* **Operação:** sessões realizadas, no-shows, sessões em curso (real-time), tempo médio de match (triagem → 1ª sessão). 

* **Financeiro:** receita corrente (B2B \+ B2C), antecipações concedidas, taxa de antecipação faturada. 

* **Saúde clínica do produto:** NPS macro YNA, satisfação com profissionais (Ranking agregado), índice médio de bem-estar dos beneficiários (agregado), alertas NR-1 disparados. 

RF-YN-08.2 — Filtros: período, segmento, empresa, especialidade. 

RF-YN-08.3 — Drilldown em cada KPI (ex.: clicar em “empresas ativas” → lista das empresas). 

RF-YN-08.4 — Exportação em PDF/XLSX.

**Regras de negócio** 

RN-YN-08.1 — Mesmo no dashboard interno, **não há exposição de dados clínicos individuais identificáveis** a quem não tem necessidade clínica/legal (princípio do menor privilégio).

### **8.11 Etapa — Auditorias LGPD e Compliance (Acompanhar)**

**Atores:** Super-Admin, DPO (papel a designar).

**Requisitos funcionais** 

RF-YN-09.1 — Logs de auditoria de ações sensíveis (acesso a prontuário, exportação de dados, mudanças em permissões). 

RF-YN-09.2 — Painel de **direitos LGPD do titular**: solicitações de acesso, retificação, exclusão. 

RF-YN-09.3 — Workflow de exclusão de dados pessoais com manutenção de histórico anonimizado. 

RF-YN-09.4 — Painel de aceites de Termos/Política (versões aceitas, datas).

### **8.12 Etapa — Gestão financeira (Operar)**

**Atores:** Gestor Comercial, Super-Admin.

**Requisitos funcionais** 

RF-YN-10.1 — Painel financeiro consolidado: contratos B2B, mensalidades B2C, receita de antecipação. 

RF-YN-10.2 — Repasses a profissionais: por sessão / cadência / antecipações. 

RF-YN-10.3 — Integração com fintech para automatizar antecipações. 

RF-YN-10.4 — Emissão de relatórios financeiros (mensal, anual).

### **8.13 Resumo do Fluxo dos Gestores YNA**

| Funcionalidade | Perfil principal | Prioridade MVP |
| ----- | ----- | :---: |
| Cadastro de empresas \+ Master RH | Comercial / CSM | P0 |
| Cadastro/aprovação de profissionais | Gestor Profissionais | P0 |
| Curadoria de matches | Gestor Clínico | P0 |
| CMS da Universidade YNA | Gestor Conteúdo | P0 (mínimo) |
| Lives Domus \+ canal YouTube | Gestor Conteúdo \+ Domus | P1 |
| Escala de plantão | Gestor Profissionais | P0 |
| Sistema de tickets/suporte | Atendente | P0 |
| Solicitação de prontuário | Atendente | P0 |
| Dashboard interno macro | Comitê / Super-Admin | P0 |
| Auditorias LGPD | Super-Admin / DPO | P0 |
| Financeiro consolidado | Super-Admin / Comercial | P1 |

---

## **9\. MAPA TRANSVERSAL DE FUNCIONALIDADES DO MVP**

Esta seção cruza as funcionalidades técnicas com os atores que as consomem e a prioridade no MVP. Serve como base para o handoff técnico e para a geração do prompt de construção.

**Legenda de prioridade:** P0 \= bloqueante do piloto · P1 \= essencial · P2 \= desejável · ? \= a validar.

### **9.1 Funcionalidades por módulo lógico**

| Módulo | Funcionalidade | Atores | Prioridade |
| ----- | ----- | ----- | ----- |
| **Identity & Access** | Autenticação (login, recuperação de senha, MFA) | Todos | P0 |
|  | Aceite LGPD (registro com timestamp/IP/versão) | Beneficiário, Profissional, RH | P0 |
|  | Permissões granulares por perfil | Gestores YNA, RH | P0 |
| **Tenant Management** | Cadastro de empresa \+ Master RH | Gestor YNA | P0 |
|  | Estrutura de departamentos | RH | P0 |
|  | Operadores e papéis RH | RH | P0 |
|  | Gestão de contratos B2B (anexo, vigência) | Gestor YNA | P0 |
| **People & Profiles — Beneficiário** | Carga em massa via planilha | RH | P0 |
|  | Cadastro individual | RH | P0 |
|  | Completar perfil pelo beneficiário (privacy-by-design) | Beneficiário | P0 |
|  | Integração agenda pessoal (iCal/Google) | Beneficiário | P0 |
|  | Gestão de ciclo de vida (Convidado/Ativo/Inativo) | RH, Gestor YNA | P0 |
| **People & Profiles — Profissional** | Cadastro completo (CRP, CPF, PJ, linha teórica) | Profissional | P0 |
|  | Vídeo de apresentação | Profissional | P0 |
|  | Trilha de integração obrigatória | Profissional | P0 |
|  | Setup financeiro (PJ, antecipação, cadência) | Profissional | P0 |
|  | Atualizações de certificados/formação | Profissional | P0 |
|  | Cadastro de férias e ausências | Profissional | P0 |
|  | Disponibilidade para plantão | Profissional | P0 |
| **Matching** | Triagem (5 perguntas fechadas \+ abertas) | Beneficiário | P0 |
|  | Roda da Vida (integração à triagem) | Beneficiário | Fora do MVP |
|  | Algoritmo de matching | Sistema | P0 |
|  | Curadoria Domus dos 3 matches | Gestor Clínico | P0 |
|  | Apresentação dos 3 perfis ao beneficiário | Beneficiário | P0 |
|  | Re-match (troca de profissional) | Beneficiário | P0 |
|  | Compartilhamento opt-in de prontuário no re-match | Beneficiário | P0 |
| **Sessions** | Calendário/agenda integrado | Beneficiário, Profissional | P0 |
|  | Lembretes push \+ e-mail \+ agenda externa | Beneficiário | P0 |
|  | Sala de vídeo integrada (com logs de presença) | Beneficiário, Profissional | P0 |
|  | Prontuário pós-sessão obrigatório (textarea) | Profissional | P0 |
|  | Troca de profissional sem perder histórico | Beneficiário | P0 |
| **Engagement & Nyna** | Assistente IA Nyna (chat 24/7) | Beneficiário | P0 |
|  | Botão de pânico \+ escalonamento ao plantão | Beneficiário | P0 |
|  | Detecção de palavras-chave de crise | Sistema | P0 |
|  | Check-in opcional (conversacional ou formulário) | Beneficiário | P0 |
|  | Cadência configurável do check-in pelo beneficiário | Beneficiário | P0 |
|  | Roda da Vida (radar visual de pilares) | Beneficiário | Fora do MVP |
|  | Gamificação leve (selos / medalhas / Conquistas) | Beneficiário | Fora do MVP |
|  | Chat assíncrono Beneficiário ↔ Profissional | Ambos | P1/? |
| **Avaliações & Ranking** | Feedback pós-sessão | Beneficiário | P0 |
|  | Avaliação periódica do profissional | Beneficiário | P0 |
|  | Avaliação periódica da YNA (NPS macro) | Beneficiário | P0 |
|  | Cálculo do Ranking YNA (interno, oculto no MVP) | Sistema | P0 |
| **Analytics & Reporting** | Dashboard RH com KPIs \+ mapa de calor NR-1 | RH | P0 |
|  | K-anonimato ≥ 4 nos relatórios | Sistema | P0 |
|  | Relatório mensal one-page (PDF) | RH | P0 |
|  | Relatório pessoal do beneficiário (Carta de Progresso / PDF) | Beneficiário | Fora do MVP |
|  | Dashboard macro YNA (visão 360°) | Gestores YNA | P0 |
| **Notifications** | Push notifications | Todos | P0 |
|  | E-mail transacional | Todos | P0 |
|  | Sync com agenda pessoal (iCal/Google) | Beneficiário, Profissional | P0 |
|  | WhatsApp | — | Fora do MVP |
| **Billing & Payments** | Contratos SaaS B2B | Gestor YNA | P0 |
|  | Antecipação de recebíveis (fintech) | Profissional, Sistema | P0 |
|  | Pagamento B2C (cartão) | Beneficiário | P1 |
| **Audit & Compliance** | Logs de auditoria de ações sensíveis | Sistema | P0 |
|  | Workflow de direitos LGPD do titular | DPO, Atendente | P0 |
|  | Solicitação de prontuário do beneficiário (ticket) | Beneficiário → Gestor YNA | P0 |
|  | Aceites de Termos/Política (versionamento) | Sistema | P0 |
| **Backoffice YNA** | Cadastro/gestão de empresas | Gestor Comercial | P0 |
|  | Aprovação de profissionais | Gestor Profissionais | P0 |
|  | Curadoria de matches | Gestor Clínico | P0 |
|  | CMS da Universidade YNA (trilhas) | Gestor Conteúdo | P0 |
|  | Agenda de lives \+ canal YouTube fechado | Gestor Conteúdo \+ Domus | P1 |
|  | Escala de plantão | Gestor Profissionais | P0 |
|  | Painel de emergências em curso | Gestor Profissionais, Atendente | P0 |
|  | Sistema de tickets/suporte | Atendente | P0 |
| **Portabilidade** | B2B → B2C (migração) | Beneficiário | P1 |
|  | B2C → B2B | Beneficiário | P2 |
|  | B2B → outro B2B | Beneficiário | P2 |

### **9.2 Módulos lógicos sugeridos para a arquitetura**

1. **Identity & Access** — autenticação, papéis, MFA, consentimento LGPD.

2. **Tenant Management** — empresas, contratos, licenças, estrutura de departamentos.

3. **People & Profiles** — beneficiários, profissionais (perfil, agenda, PJ), gestores YNA.

4. **Matching** — triagem, algoritmo, curadoria Domus, re-match.

5. **Sessions** — agenda, sala de vídeo, prontuário pós-sessão obrigatório.

6. **Engagement** — Nyna (IA), botão de pânico, check-in opcional, chat assíncrono.

7. **Evaluations** — feedback pós-sessão, avaliação de profissional, NPS YNA, Ranking interno.

8. **Analytics & Reporting** — dashboard RH (k-anonimato), dashboard macro YNA, NR-1.

9. **Notifications** — orquestração multi-canal (push, e-mail, sync agenda).

10. **Billing & Payments** — contratos B2B, mensalidades B2C, antecipação (fintech).

11. **Audit & Compliance** — logs, retenção/exclusão LGPD, solicitações de prontuário, palavras-chave de crise.

12. **Backoffice YNA** — gestão de empresas, profissionais, conteúdo (Universidade YNA), plantão, tickets, escala.

---

## **10\. LISTA CONSOLIDADA DE PENDÊNCIAS E ITENS A VALIDAR**

Esta seção consolida o que **foi definido no kickoff (26/05)** e o que **ainda está em aberto** para a próxima rodada de validações.

### **10.1 Pendências que seguem em aberto**

* **Negócio**  
  * Pricing detalhado B2B (valor por colaborador, descontos por volume, faixa mínima de licenças, configurações de planos).  
  * KPI principal do MVP (qual métrica define que o MVP foi validado).  
  * Pricing B2C exato (preço por plano).  
  * Cláusula contratual de migração B2C dos beneficiários ao fim do contrato.  
  * Categorias de profissionais (critérios) e correspondência com cadências de antecipação.  
  * Taxa específica de antecipação por cadência.  
  * Política de incentivo/remuneração para plantonistas.

* **Funcionalidades — Beneficiário**  
  * Texto exato e tipo (fechada/aberta) das 5 perguntas de triagem (responsável Virgínia / Domus).  
  * Cadência específica das avaliações do profissional e da YNA.  
  * Inclusão do chat assíncrono Beneficiário↔Profissional no MVP.  
  * Política de no-show e janela de remarcação.

* **Funcionalidades — Profissional**  
  * Conteúdo dos módulos da trilha de integração obrigatória.  
  * Template orientativo do prontuário pós-sessão (placeholder do textarea).  
  * Antecedência mínima exata para férias (sugestão: 7 dias).  
  * SLA de atendimento do plantonista (sugestão: 5 min comercial / 15 min madrugada).  
  * Formato da supervisão Domus (síncrona em grupo? fórum? frequência? obrigatoriedade?).  
  * Fórmula final do Ranking (pesos de cada critério).  
  * Estrutura inicial das trilhas avançadas da Universidade YNA.  
  * Criação do canal fechado YouTube YNA.

* **Funcionalidades — Gestores YNA**  
  * Critérios de categorização de profissionais (define cadências de antecipação).  
  * SLA para curadoria de matches pela Domus.  
  * SLA para entrega de prontuário sob solicitação (sugestão: 7 dias úteis).  
  * Workflow detalhado para tickets de queixa sobre profissional.

* **Tecnologia**  
  * Fornecedor da solução de vídeo (Daily, Twilio, Whereby, etc.).  
  * Fintech parceira para antecipação.  
  * Gateway de pagamento B2C.  
  * Hospedagem e infraestrutura (cloud provider, escalabilidade).

* **Compliance e Segurança**  
  * Redação final dos Termos de Uso e Política de Privacidade.  
  * Designação do DPO.  
  * Lista exata das **palavras-chave de crise** monitoradas pela Nyna.  
  * Protocolo detalhado de crise (escalonamento, registro, follow-up).  
  * KPIs específicos da NR-1 e thresholds de alerta.

