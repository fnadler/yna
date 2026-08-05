# PROMPT · Plataforma YNA NR-1 standalone, sem tele-atendimento (para Antigravity)

> **Versão 2.0 · recorte de produto.** Onde o `PROMPT_Frontend_NR1_v1.2.md` **acrescentou** o módulo
> de conformidade a uma plataforma de cuidado, este prompt **subtrai** a plataforma de cuidado e
> deixa de pé apenas o que a NR-1 exige, mais as features operacionais sem as quais a NR-1 não
> funciona (cadastro de colaboradores, departamentos, adesão).
>
> **Como usar:** abra o Antigravity com `Local Sites/yna/` como workspace, na branch
> `feat/nr1-standalone` (já criada a partir de `feat/nr1-conformidade`, que contém o módulo NR-1
> completo). O app vive em `frontend/`. Esta entrega **remove e reorganiza** código existente; não
> cria projeto novo e não reescreve o módulo NR-1, que já está pronto e validado.

---

Você é um(a) engenheiro(a) frontend sênior. Sua tarefa é transformar o YNA Care Hub em um produto
**exclusivamente de conformidade NR-1**: remover a camada de cuidado (tele-atendimento, rede de
profissionais, agendamento, sessões, check-ins, conteúdo) e deixar uma plataforma coerente, que se
sustenta sozinha, para uma empresa cliente cumprir a obrigação legal de gerir riscos psicossociais.

Tudo continua com **dados mockados** atrás da camada de serviços tipada. Backend fora de escopo.

## 0. O que esta entrega é, e o que ela não é

**É** um recorte: a plataforma passa a ter três jornadas enxutas (Colaborador, RH/Empresa,
Backoffice YNA) organizadas em volta de uma única promessa: *inventário de riscos psicossociais no
PGR, com rastreabilidade*.

**Não é** um app novo, nem uma reescrita do módulo NR-1. O módulo já existe, funciona e foi
verificado no navegador. Você vai tirar coisa de perto dele, não refazê-lo.

**Não é** um recorte que possa mentir sobre o que oferece. Este é o ponto mais delicado da entrega:
o produto pergunta a alguém sobre sofrimento no trabalho e **não tem terapeuta para oferecer
depois**. A §5.4 define como resolver isso com honestidade. Nenhuma tela pode sugerir atendimento
psicológico, agendamento ou profissional disponível.

**Régua de decisão para qualquer dúvida de escopo:** a feature é necessária para a empresa cliente
demonstrar conformidade com a NR-1 a um fiscal ou a um SESMT? Se não é, e também não sustenta a
coleta (quem responde, de qual área, com que adesão), ela sai.

## 1. O corte, em três listas

### 1.1. Sai por completo

**Jornada do Profissional: o namespace `/pro/*` inteiro.** 48 telas em `frontend/src/screens/pro/`,
`ProContext`, `services/pro.ts`, `data/proMock.ts`, `ProAppLayout`, `ProSidebar`, `ProTopBar`.
Não existe profissional na plataforma NR-1.

**Camada de cuidado do colaborador.** Remover de `frontend/src/screens/`:
matches e loader de matches, triagem (`Ben09Triagem`), Roda da Vida, perfil de profissional,
agendamento, confirmação, pré-sessão, sala de vídeo, feedback, decisão, rematch, troca de
profissional, novos matches, agenda, reagendamento (e suas confirmações), Nyna/mensagens,
emergência, check-in (config, Nyna, formulário, sucesso), conquistas, relatório pessoal,
apresentação comercial, transições de onboarding de cuidado, stub de migração B2C.

**Backoffice:** profissionais e detalhe, tipos de profissional, sessões, curadoria de matches,
Academia YNA, modelos de documentos, financeiro de notas fiscais, planos.

**RH:** indicadores de bem-estar (`RH13Indicadores`) e financeiro/parcelas.

**Componentes que ficam órfãos** (confirmados por busca de referência): `SessionRoom`, `LiveRoom`,
`EntrarSessaoButton`, `SessionStatusBadge`, `MatchCard`, `ProfessionalProfileView`,
`SpecialtyBadge`, `EmergencyModal`, `PanicButton`, `DisponibilidadeResumo`, `ProfileStrengthCard`,
`CamposTipo` (ver §2) e `OnboardingLayout` (só envolvia a apresentação do colaborador).
**Confirme a ausência de referência antes de apagar cada um**, e não confie nesta lista sem checar:
ela foi levantada no estado atual do repositório e pode desatualizar.

Dois componentes que **parecem** órfãos e não são:

- **`OnboardingSplit`** continua em uso pela apresentação comercial do RH, que fica (§5.2). Só a
  apresentação do colaborador sai: ele recebe um link para responder, não um pitch de produto.
- **`ViewAsSwitcher`** é o mecanismo de demonstração que troca de perfil. Fica, com as opções
  reduzidas de quatro para três: Colaborador, RH e Backoffice.

### 1.2. Fica, porque a NR-1 depende disso

Estas são as features que o prompt anterior tratava como "plataforma existente" e que agora passam a
ser **escopo de primeira classe** deste produto:

| Feature | Por que fica |
|---|---|
| Cadastro de colaboradores (individual + importação por planilha + edição em massa de área) | Sem base de colaboradores não há a quem enviar a avaliação, nem como recortar por área |
| Estrutura de departamentos / áreas | O inventário do PGR exige o **grupo de trabalhadores exposto** (RF-B03, RF-C02) |
| Convites e acompanhamento da adesão (funil, lembretes por área) | Adesão baixa invalida a representatividade da avaliação (RF-B01/B02/B04) |
| Equipe RH com papéis Master e Operador | Controle de acesso por papel é requisito de dado sensível (RNF-03) |
| Conta da empresa | Razão social e CNPJ entram no relatório; é o cabeçalho do documento que vai ao PGR |
| Avisos / notificações | Alerta de prazo do plano de ação (RF-E04) e de queda de adesão |
| Backoffice: empresas e usuários YNA | Operação multiempresa e governança de quem publica modelos |
| Backoffice: modelos, versões e núcleo NR-1 | O coração da governança do instrumento (já implementado) |
| Consentimento LGPD do colaborador | Base legal para tratar dado sensível de saúde (RNF-01) |
| Direitos do titular (acesso, exclusão) | Conformidade LGPD contínua (RNF-04) |

### 1.3. Muda de nome

**"Beneficiário" deixa de existir. A pessoa é um colaborador.** Não há benefício de saúde nesta
versão; há uma obrigação legal da empresa e alguém que responde a uma avaliação. Manter
"beneficiário" seria o resíduo mais visível de um produto que não existe mais aqui.

Renomeie de forma consistente, em tipos, mocks, serviços, rotas e copy:

- `RhBeneficiario` → `RhColaborador`; `RhBeneficiarioStatus` → `RhColaboradorStatus`
- `rhBeneficiarios` → `rhColaboradores`; `rhBeneficiarioService` → `rhColaboradorService`
- rota `/rh/beneficiarios` → `/rh/colaboradores`
- `MngCampoTipo` → `CampoTipo` (não há mais "tipo de profissional" para qualificar o nome)
- `licencasContratadas` → `colaboradoresContratados`, ou o termo que o comercial usar; "licença"
  pressupõe acesso a um app de cuidado

Na copy: "colaborador", "quem respondeu", "respondente". Em nenhum lugar "beneficiário",
"paciente", "sessão", "terapia", "profissional de saúde disponível".

## 2. Leia primeiro (não invente o que já existe)

- **`frontend/README.md`:** mapa canônico rota → tela → RF, e a seção do módulo NR-1 com as quatro
  regras que moram na camada de serviço. Atualize ao final, refletindo o app reduzido.
- **`frontend/src/types/index.ts`:** tipos `Nr1*` prontos. Os tipos `Pro*` saem; os `Rh*` e `Mng*`
  ficam com poda.
- **`frontend/src/data/nr1Mock.ts` · `frontend/src/services/nr1.ts` · `frontend/src/lib/nr1.ts`:**
  módulo NR-1 completo. **Não reescrever.** Atenção: `nr1Mock.ts` importa `rhDepartamentos` e
  `rhEmpresa` de `rhMock.ts`, e `NR1MngModelos` importa `mngEmpresas`. Essas dependências ficam.
- **`frontend/src/components/CamposTipo.tsx`:** atenção a uma pegadinha aqui. O prompt anterior
  mandava reusar este construtor de campos flexíveis, mas na prática o editor de itens do
  questionário (`NR1MngModeloEditor`) **não o importa**: ele reusa o *vocabulário* de tipos de campo
  e tem o próprio formulário. Os únicos consumidores reais de `CamposTipo` são telas do
  profissional e o detalhe do profissional no backoffice, todas removidas neste recorte.
  Consequência: **`CamposTipo.tsx` e o tipo `MngCampoCadastro` ficam órfãos e saem**; o que
  precisa sobreviver é só a união de tipos de campo (`MngCampoTipo` → `CampoTipo`), porque
  `Nr1Item.tipoCampo` depende dela.
- **`frontend/tailwind.config.ts` + `frontend/src/index.css`:** design system tokenizado. Paleta
  índigo `#4749A8`, acentos lavender/pink/yellow/cream, semânticos success/warning/danger/info,
  superfícies por CSS var (light/dark). Tipografia `font-heading` (Bricolage Grotesque),
  `font-sans` (Inter), `font-mono` (JetBrains Mono). Use sempre os tokens semânticos
  (`bg-surface`, `text-ink`, `border-border`), nunca cor crua.
- **`YNA - Documento de Requisitos - NR-1 (Conformidade).pdf`:** fonte dos RF. A §12 deste prompt
  lista quais RF ficam parcialmente atendidos no recorte, e por quê.

## 3. Diretriz de design

Mesma régua do app: telas com respiro, um CTA primário por tela, revelação progressiva em
`Sheet`/`Modal`, copy curta. **O recorte não é desculpa para telas vazias.** Ao remover os cartões
de cuidado, várias telas ficam com pouco conteúdo: recomponha o layout em vez de deixar buraco.
Os dois casos que exigem redesenho de verdade, não só remoção, são a home do RH (§5.3) e o espaço
do colaborador (§5.4).

Sem travessão espaçado (` — `) na copy de tela. É o padrão que a marca já evita; use ponto,
dois-pontos, vírgula ou reordene a frase. Vale também para nomes e rótulos.

## 4. Stack e arquitetura

- **React 18 + Tailwind + Vite + TypeScript strict**, `darkMode: 'class'`. **Nenhuma lib nova.**
  Estado com Context + hooks nativos; `react-router-dom` já presente; ícones `@iconify/react`
  (`ph:*`).
- **Contextos depois do corte:** `AppContext` (colaborador, incluindo a avaliação em andamento),
  `RhContext` (empresa, usuário, instrumento NR-1 aplicado), `MngContext` (gestor YNA),
  `ThemeContext`. **`ProContext` sai.**
- **Serviços:** `services/nr1.ts` intacto; `services/rh.ts` e `services/mng.ts` podados;
  `services/pro.ts` removido; `services/index.ts` reduzido ao que sobrar do colaborador.
- **Leitura de dados:** sempre `useService(...)` com os 3 estados (skeleton, vazio, erro) e
  microcopy da marca. Nenhuma tela nova sem os 3 estados.
- Não tocar em nada fora de `frontend/`. `tsc -b` limpo, `npm run build` sem erro, **zero import
  morto e zero rota órfã**.

## 5. As três jornadas depois do corte

### 5.1. Backoffice YNA (`/mng/*`): governa o instrumento

Fica: login, visão geral, empresas (conta corporativa e contrato mínimo), usuários YNA com papéis,
**modelos de avaliação NR-1 + versões + núcleo obrigatório** (pronto), notificações, e suporte como
P1.

A visão geral do Manager hoje é um cockpit de operação de cuidado (sessões, no-show, receita de
antecipação). **Refaça-a como cockpit de conformidade:** empresas ativas, campanhas em campo,
adesão média, versões publicadas do instrumento, empresas sem inventário gerado, casos de canal de
escuta abertos. Nenhum indicador de sessão ou de repasse a profissional.

### 5.2. RH / Empresa (`/rh/*`): opera o ciclo

Fica: onboarding da conta, **colaboradores**, **departamentos**, **convites e adesão**, equipe RH,
conta da empresa, avisos, e o **cockpit NR-1 completo** (`/rh/nr1/*`, pronto).

`RH13Indicadores` sai. O painel de conformidade (`/rh/nr1`) assume o papel de tela de indicadores.
Se algum KPI de adesão de `RH13Indicadores` ainda fizer sentido, mova-o para lá; não mantenha as
duas telas.

### 5.3. Home do RH, a tela que mais precisa de redesenho

Hoje ela mistura adesão ao benefício, funil de convites, atenção NR-1, atalhos, parcela em aberto,
licenças e plano. Depois do corte, refaça-a com uma pergunta só: **onde estamos no ciclo de
conformidade?**

Sugestão de blocos, na ordem:

1. **Estado do ciclo:** campanha em campo com adesão e prazo, ou o convite para abrir a próxima.
2. **Suas pendências:** riscos priorizados sem ação, ações com prazo vencido, casos de canal de
   escuta abertos, colaboradores ainda não convidados. Cada item com deep-link.
3. **Risco por dimensão:** as 4 dimensões do MTE, agregadas, com link para o mapa de calor.
4. **A cadeia:** inventário, plano de ação, relatório, com o estado de cada elo.

### 5.4. Colaborador: "Meu espaço" (a decisão mais delicada)

**Acesso:** por link/token, sem senha complexa (RF-B01). Uma conta leve, criada no primeiro acesso,
dá acesso a "Meu espaço".

**Telas:** avaliação ativa, minha evolução, canal de escuta, meus dados e direitos LGPD. É isso.
Sem agenda, sem sessões, sem Nyna, sem check-in, sem conquistas.

**A conclusão da avaliação oferece apoio, não terapia.** Ao terminar, o colaborador recebe:

- reconhecimento no tom Cuidador pelo que ele acabou de compartilhar;
- **conteúdo de apoio** próprio (material curto sobre sono, sobrecarga, limites, pedir ajuda);
- **o canal de escuta**, se o que pesa for uma situação concreta que precisa de apuração;
- **contatos externos e do próprio cliente**: CVV 188, e um espaço configurável para a empresa
  informar seus canais (plano de saúde, programa de apoio, ambulatório).

**Não** ofereça match, agendamento, "conversar com um profissional" ou lista de espera. O produto
não tem isso, e prometer seria pior do que não oferecer nada.

**A tensão que você precisa resolver com honestidade:** "Minha evolução" (NR1-BEN-06) exige que a
pessoa reencontre as próprias respostas, mas a avaliação é anônima para a empresa. As duas coisas só
convivem se a arquitetura for explícita:

- a resposta é **pseudonimizada**: vinculada a uma chave que pertence ao colaborador, nunca à
  empresa;
- o que chega ao RH é **exclusivamente agregado**, com k-anonimato ≥ 4, como já está implementado;
- a tela de evolução diz isso em palavras simples, para a pessoa não achar que o RH vê o gráfico
  dela;
- no mock, deixe a fronteira visível no código: nenhum serviço do RH pode ter acesso à função que
  devolve a evolução individual.

## 6. As travas de produto (não negociáveis)

As quatro primeiras já estão implementadas e testadas na camada de serviço. **Não afrouxe nenhuma
ao mexer no entorno.**

1. **Núcleo obrigatório não é removível.** Modelo derivado acrescenta itens, nunca remove os do
   núcleo. A trava vale inclusive para o operador do backoffice.
2. **Versão publicada é imutável.** Editar cria uma nova versão em rascunho; campanhas em curso
   mantêm o instrumento com que começaram.
3. **k-anonimato ≥ 4.** Nenhum recorte com menos de 4 respondentes chega ao RH. Recortes ocultos
   aparecem rotulados como protegidos, não desaparecem da tabela.
4. **Ação só conclui com evidência anexada.**
5. **Sem autosserviço de questionário.** O RH seleciona e aplica modelo + versão; não cria nem
   edita item. A UI não expõe edição de instrumento a RH nem a colaborador.
6. **Nenhuma promessa de atendimento.** Nenhuma tela sugere terapia, profissional disponível ou
   agendamento. Vale para copy, ícone, ilustração e nome de rota.
7. **Responsabilidade técnica é do cliente.** O relatório tem campo de responsável técnico
   (SST/consultoria). A YNA fornece o insumo e não assina o PGR.

## 7. Escopo de telas

**P0 = completa e navegável. P1 = versão simples funcional. Pronto = já implementado, só validar.**

### 7.1. Backoffice YNA

| ID | Tela | Prior. | Situação |
|---|---|---|---|
| MNG-01 | Login e recuperação de senha | P0 | Pronto |
| MNG-02 | Cockpit de conformidade (visão geral) | **P0** | **Refazer** (§5.1) |
| MNG-03 | Empresas: lista e detalhe (conta + contrato) | P0 | Podar (tirar funil de cuidado e utilização de licença) |
| MNG-04 | Usuários YNA e papéis | P0 | Pronto |
| MNG-05 | Notificações | P1 | Podar tipos ligados a sessão, nota e antecipação |
| MNG-06 | Suporte e tickets | P1 | Podar tipos ligados a prontuário |
| NR1-MNG-01..04 | Modelos, editor, versões, núcleo | P0 | Pronto |

### 7.2. RH / Empresa

| ID | Tela | Prior. | Situação |
|---|---|---|---|
| RH-01 | Boas-vindas, apresentação comercial, convite, cadastro da conta e onboarding | P0 | Reposicionar os slides: o argumento passa a ser a obrigação legal, não o benefício de bem-estar |
| RH-02 | Home: estado do ciclo de conformidade | **P0** | **Refazer** (§5.3) |
| RH-03 | Colaboradores: CRUD, importação por planilha, edição em massa de área | P0 | Renomear e podar (§1.3) |
| RH-04 | Departamentos / áreas | P0 | Pronto |
| RH-05 | Convites e funil de adesão | P0 | Pronto; reposicionar a copy para avaliação, não benefício |
| RH-06 | Equipe RH (Master/Operador) | P0 | Pronto |
| RH-07 | Conta da empresa + responsável técnico de SST | P0 | Podar plano e licenças |
| RH-08 | Avisos | P1 | Podar tipos de cuidado |
| NR1-RH-01..09 | Cockpit NR-1 completo | P0 | Pronto |

### 7.3. Colaborador

| ID | Tela | Prior. | Situação |
|---|---|---|---|
| COL-01 | Convite por token e link inválido | P0 | Podar a copy de benefício |
| COL-02 | Consentimento LGPD | P0 | Podar; foco em dado sensível e finalidade da avaliação |
| COL-03 | Meu espaço (home mínima) | **P0** | **Nova** (§5.4). Absorve o NR1-BEN-01: o card de entrada da avaliação sai da `Ben21Home`, que deixa de existir, e passa a ser o conteúdo principal daqui |
| COL-04 | Meus dados e direitos LGPD | P0 | Podar (tirar preferências de sessão e comunicação de cuidado) |
| NR1-BEN-02..03 | Introdução, anonimato e questionário dinâmico | P0 | Pronto |
| NR1-BEN-04 | Conclusão com apoio | **P0** | **Refazer** a ponte (§5.4) |
| NR1-BEN-05 | Canal de escuta | P0 | Pronto |
| NR1-BEN-06 | Minha evolução | P1 | Pronto; acrescentar a explicação de pseudonimização |
| COL-05 | Conteúdo de apoio | P1 | **Nova**: 4 a 6 peças curtas, estáticas, mockadas |

## 8. Rotas finais

O app inteiro depois do recorte. Qualquer rota fora desta lista deve ter sido removida.

**Colaborador:** `/convite/:token` · `/convite/invalido` · `/sigilo` · `/meu-espaco` ·
`/avaliacao` → `/avaliacao/intro` → `/avaliacao/:passo` → `/avaliacao/conclusao` · `/canal-escuta` ·
`/minha-evolucao` · `/apoio` · `/meus-dados`

**RH:** `/rh/bem-vindo` · `/rh/apresentacao/:passo` · `/rh/convite/:token` · `/rh/convite/invalido` ·
`/rh/cadastro` · `/rh/conta-criada` · `/rh/onboarding` · `/rh/home` · `/rh/colaboradores` ·
`/rh/convites` · `/rh/departamentos` · `/rh/equipe` · `/rh/conta` · `/rh/mais` · `/rh/nr1` ·
`/rh/nr1/campanha` · `/rh/nr1/mapa-calor` · `/rh/nr1/inventario` · `/rh/nr1/plano-acao` ·
`/rh/nr1/relatorio` · `/rh/nr1/ciclos` · `/rh/nr1/canal` · `/rh/nr1/kit`

A rota raiz `/` continua apontando para `/rh/bem-vindo`: o RH é o comprador, e é por ele que a
demonstração começa.

**Backoffice:** `/mng/login` · `/mng/home` · `/mng/empresas` · `/mng/empresas/:id` ·
`/mng/gestores` · `/mng/notificacoes` · `/mng/suporte` · `/mng/mais` · `/mng/nr1/modelos` ·
`/mng/nr1/modelos/:id` · `/mng/nr1/modelos/:id/versoes` · `/mng/nr1/nucleo`

Ajuste as sidebars e as bottom-navs (`RhAppLayout`, `MngAppLayout`, `AppLayout`) e as telas "Mais"
para refletir exatamente isso. A bottom-nav do colaborador cabe em 4 itens: Meu espaço, Avaliação,
Apoio, Perfil.

## 9. Voz da marca: Cora

- **Colaborador:** Cuidador 60% + Sábio 30%. Acolher e garantir sigilo antes; presença ao final.
  Zero jargão de conformidade: ele não precisa saber que isso é "NR-1". E agora, com mais razão
  ainda, **zero promessa de atendimento**.
- **RH e Backoffice:** Sábio + Herói coletivo. Direto, com evidência, sem prometer o que a lei não
  exige. Nunca tratar "laudo" como obrigatório; falar em "inventário para o PGR" e "relatório de
  gestão".
- **Evitar:** ROI dirigido ao colaborador, jargão corporativo, urgência artificial, travessão
  espaçado, e qualquer variação de "cuidamos de você" que o produto não possa cumprir.
- **Usar:** sigilo, evidência, acolhimento, conformidade, rastreabilidade.

## 10. Estados, acessibilidade e qualidade

- Todo fetch com 3 estados e microcopy da marca. **WCAG 2.1 AA** nos dois temas; foco visível;
  `aria-label` em controle só-ícone. Mobile-first 390px, sem scroll horizontal, alvo ≥ 44px.
- Heatmap e radar em SVG inline, com legenda textual. Cor nunca é o único portador de significado.
- Onde um recorte é ocultado por k-anonimato, dizer "dados protegidos (menos de 4 respostas)".

## 11. Definição de pronto

1. `npm run dev` sem erro; `tsc -b` limpo; `npm run build` sem erro. Nenhuma lib nova.
2. **Zero resíduo de cuidado.** Estas buscas em `frontend/src` não devem retornar nada em código
   vivo (só, no máximo, em comentário histórico):
   `grep -riE "sessao|sessão|terapia|terapeuta|psicólog|match|prontuário|plantão|check-in|nyna|nina|beneficiári|agendamento|profissional de saúde"`
3. **Zero rota órfã e zero import morto.** Nenhum arquivo em `screens/` sem rota em `App.tsx`;
   nenhum componente em `components/` sem uso. Verifique um a um antes de apagar.
4. As 7 travas da §6 continuam valendo. Especificamente: nenhum serviço acessível ao RH devolve
   resposta individual, e nenhuma tela do RH exibe recorte com menos de 4 respondentes.
5. Fluxo do colaborador ponta a ponta: token → consentimento → Meu espaço → avaliação (as 4
   dimensões, renderizadas do modelo/versão da campanha) → conclusão com apoio → canal de escuta.
6. Fluxo do RH ponta a ponta: cadastrar colaborador → definir área → convidar → acompanhar adesão →
   ler mapa de calor → gerar inventário → criar ação 5W2H → anexar evidência → exportar relatório
   com o responsável técnico preenchido.
7. Fluxo do backoffice: criar empresa → derivar modelo do cliente → publicar versão → ver a
   campanha do cliente aplicando aquela versão.
8. Testado a 390px, 768px e 1280px, light e dark, sem scroll horizontal.
9. **`frontend/README.md` reescrito**, não remendado: o mapa rota → tela → RF do app reduzido, o
   que está mockado e como trocar pela API, e a seção de pendências atualizada.

## 12. Decisões e pendências a registrar (não resolver no código)

**Requisitos que ficam parcialmente atendidos por conta do recorte.** Registre isso no README, com
franqueza, porque é o que um comprador vai perguntar:

- **RF-J01 (ponte opt-in ao cuidado): parcial.** Sem camada de cuidado, a conclusão oferece apoio e
  o canal de escuta, não acesso a profissional. A estrutura de opt-in fica pronta para religar
  quando o cuidado voltar ao produto.
- **RF-J03 (medir conversão conformidade → cuidado): fora.** Não há destino para converter.
- **RF-J02 (recomendações populacionais de cuidado): dentro.** Continua valendo: é o RH agindo
  sobre causas, não encaminhamento individual.
- **RF-C04 (cruzar com absenteísmo, afastamento, turnover): fora deste ciclo.** É Should e depende
  de o cliente fornecer os dados.
- **Integração eSocial S-2240, white-label e benchmarks setoriais: fora.** Já eram Could.

**Decisões de produto tomadas neste recorte, para você confirmar ou reverter:**

- **Financeiro, contratos e planos ficaram fora.** Não são exigência legal da NR-1. O contrato da
  empresa permanece apenas como dado cadastral no backoffice, sem parcelas nem cobrança. Se o
  produto for vendido antes de o financeiro existir, isso volta como escopo comercial.
- **"Beneficiário" virou "colaborador"** em todo o produto (§1.3).
- **O colaborador tem conta leve**, não acesso só por link, para que "Minha evolução" exista. Isso
  cria a tensão de pseudonimização tratada na §5.4.

**Pendências herdadas que continuam abertas:**

- **Validação clínica dos itens do Modelo YNA.** Os 34 itens são adaptações em português do HSE
  Indicator Tool e do COPSOQ, **sem tradução transcultural validada**. Não usar em produção antes
  da revisão clínica e da retrotradução.
- **Núcleo obrigatório definitivo.** Os 10 itens marcados hoje são a proposta do rascunho v0.3.
- **Itens sensíveis de assédio (RL10/RL11):** permanecer no questionário anônimo, migrar para o
  canal de escuta, ou ambos.
- **Fórmula probabilidade × severidade e pontos de corte:** transparentes de propósito, pendentes de
  revisão de SST.
- **Textos legais** (consentimento, sigilo do canal): placeholders no tom Cora, pendentes de
  jurídico e LGPD.
- **Conteúdo de apoio (COL-05):** as peças precisam de curadoria clínica antes do piloto. No mock,
  marcar como rascunho.
