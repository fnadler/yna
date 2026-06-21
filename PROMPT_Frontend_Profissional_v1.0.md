# PROMPT — Frontend do Fluxo do Profissional · YNA Care Hub

> **Como usar:** abra o workspace na raiz (`YNA - MVP da plataforma YNA Care Hub/`), com o app já existente em `frontend/`. Este prompt **estende** o mesmo projeto `frontend/` — não cria um novo. O fluxo do Profissional reaproveita o design system e alguns componentes do Beneficiário, mas é uma **jornada separada e independente**.

---

Você é um(a) engenheiro(a) frontend sênior especializado(a) em produtos digitais de saúde. Sua tarefa é construir o **frontend real do fluxo do Profissional (psicólogo)** da plataforma YNA Care Hub, evoluindo a fundação de UX/design system já implementada para o Beneficiário — **mobile first e responsiva** (ótima também em tablet e desktop).

## 0. Princípio de isolamento entre os dois perfis (leia primeiro)

Beneficiário e Profissional são **atores distintos**, com **convites distintos**, **autenticação distinta** e **jornadas que não se cruzam navegacionalmente**. No entanto, **compartilham o design system** (para consistência visual) e **alguns componentes funcionais** (notadamente a sala de sessão online).

Regras de arquitetura:

- **Mesmo projeto `frontend/`.** Não criar um segundo app. Maximize reuso do design system.
- **Namespace de rotas próprio:** tudo do profissional vive sob **`/pro/*`** (ex.: `/pro/convite/:token`, `/pro/home`, `/pro/agenda`). A rota raiz `/` e todas as rotas do beneficiário permanecem **intocadas**.
- **Convite separado:** o profissional entra por `/pro/convite/:token` — nunca pelo convite do beneficiário. Nenhum link de uma jornada leva à outra.
- **Estado próprio:** criar **`ProContext`** (`src/contexts/ProContext.tsx`) para sessão/perfil/onboarding do profissional. **Não reusar `AppContext`** (é do beneficiário). `ThemeContext` é compartilhado.
- **Telas próprias:** `src/screens/pro/ProXX*.tsx`. **Serviços próprios:** `src/services/pro.ts` (ou `proService` no `index.ts`). **Mocks próprios:** `src/data/proMock.ts`.
- **Layouts próprios** (que reusam os componentes-base): `ProAppLayout`, e reuso de `FocusLayout`/`OnboardingLayout`/`OnboardingSplit` para telas de foco e onboarding.
- **Ponto de conexão explícito:** a **sala de sessão online** é compartilhada. Refatore o atual `Ben17VideoRoom` extraindo um componente **`SessionRoom`** parametrizável por papel (`role: 'beneficiario' | 'profissional'`), reaproveitado pelos dois fluxos (ver Tarefa 4). O pós-sessão diverge: beneficiário → feedback; profissional → **prontuário obrigatório**.

## 1. Leia primeiro (não invente o que já existe)

Reaproveite **obrigatoriamente** a fundação implementada para o Beneficiário em `frontend/`:

- **`frontend/README.md`** — design system (tipografia, arquitetura Context + services, hook `useService`, responsividade, o que está mockado). É a referência viva.
- **`frontend/tailwind.config.ts`** + **`src/index.css`** — tokens definitivos (índigo `primary #4749A8`, light/dark via CSS vars, gradientes `yna-gradient*`, raios, sombras, `transitionTimingFunction.organic`). **Use como estão.**
- **`src/components/`** — reuse e evolua: `Button`, `Card`, `Badge`, `SpecialtyBadge`, `Modal`, `Sheet`, `Input`, `Textarea`, `OptionCard`, `PageHeader`, `MobileTopBar`, `TopBarIconButton`, `Avatar`, `ProfileRow`, `StatTile`, `RadarChart`, `Skeleton`, `ErrorState`, `Sidebar`, `BottomNav`, `OnboardingSplit`, `FocusLayout`, `OnboardingLayout`, `YnaIcons`, `YnaLogo`, `illustrations`.
  - **Não reusar:** `PanicButton`, `EmergencyModal`, `LoginSheet` do beneficiário como estão — o profissional **não tem botão de pânico**. (O profissional pode ser o **plantonista** que recebe o acionamento — ver Tarefa 5.)
- **`src/screens/Ben17VideoRoom.tsx`** — base da sala de vídeo, a ser extraída para `SessionRoom` compartilhado.
- **`src/hooks/useService.ts`**, **`src/services/index.ts`**, **`src/data/mock.ts`**, **`src/types/index.ts`** — padrões de serviço, mock e tipagem a espelhar.
- **`YNA - Documento de Requisitos - v1_0.docx.md`** — **Seção 7 (Fluxo 3 — Profissional)** é a fonte dos RFs/RNs de cada etapa. A Seção 8 (Gestores YNA) define o que é gerido pelo backoffice e **consumido** pelo profissional (aprovação de cadastro, escala de plantão, calendário de supervisão, ranking interno). A Seção 4 traz não-funcionais e a stack oficial.
- **`YNA Branding Persona`** — persona Cora. Para o profissional, a calibragem de tom é **Sábio + Criador + Herói coletivo** (ver Seção 6).

## 2. Diretriz de design — clean, com respiro, mas para um profissional

Mesma filosofia de leveza do Beneficiário (espaçamento generoso, hierarquia clara, um CTA primário por tela, ritmo calmo, transições suaves), **com duas calibragens** para o público profissional:

- **Densidade de trabalho permitida com parcimônia.** O profissional opera a plataforma (agenda, prontuário, financeiro). Painéis podem ter mais dados que as telas do beneficiário — mas **quebre em blocos arejados, tabelas escaneáveis e divulgação progressiva**, nunca paredes de informação. Na dúvida, arejado.
- **Tom de colega, não de paciente.** Nada de acolhimento terapêutico aqui: a copy fala **par a par** com um especialista (ver Seção 6).
- **Sem dramatização.** Sem botão de pânico, sem linguagem de crise nas telas do profissional (exceto no acionamento de plantão, onde o profissional é quem **atende** a emergência).

Teste mental por tela: *"um psicólogo ocupado, entre sessões, entende em 5 segundos o que esta tela quer dele e o que precisa fazer?"*

## 3. Produto a construir

Aplicação real: **rotas navegáveis da jornada completa do profissional**, do convite à operação e crescimento, com dados mockados atrás da camada de serviços tipada (`src/services/pro.ts`), pronta para a API real (Node + Fastify/NestJS, fora do escopo).

### Stack — estritamente a já adotada

React + Tailwind CSS · Vite + TypeScript (strict) · `darkMode: 'class'`. **Sem libs de estado/data-fetching** além de React Context + hooks nativos. `react-router-dom` para navegação. Ícones Phosphor (`@iconify/react`, `ph:*`). Fontes via `@fontsource-variable/*` (Bricolage Grotesque + Inter; JetBrains Mono para mono). **Não adicionar dependências novas.** `tsc -b` e `npm run build` sem erros. Não tocar em rotas/telas do beneficiário (exceto a extração não-destrutiva do `SessionRoom`).

### Responsividade (inegociável)

Mobile first a 390px, sem scroll horizontal, alvos de toque ≥ 44px. Mesmo sistema do beneficiário:

- **Mobile (< 768px):** bottom navigation própria do profissional (itens diferentes; **sem** botão de pânico). Modais como bottom-sheet (`Sheet`).
- **Tablet (≥ 768px):** fluxos de foco (onboarding, prontuário) em coluna central `max-w-xl`; listas/painéis em grid de 2 colunas.
- **Desktop (≥ 1024px):** bottom nav vira **sidebar fixa à esquerda** com os itens do profissional; conteúdo `max-w-5xl` (painéis de dados podem usar `max-w-6xl`); sala de sessão em layout teatro (mesmo do beneficiário).
- Tema light/dark global compartilhado (toggle no perfil/sidebar), persistido em `localStorage` via `ThemeContext`.

## 4. Regras de produto que o front deve respeitar (dos RFs — Seção 7)

- **Cadastro só ativa com aprovação + PJ + trilha concluída** (RN-PR-02.1, RN-PR-02.2, RN-PR-04.1). Status do cadastro: rascunho / em revisão YNA / aprovado / requer ajuste (RF-PR-02.5).
- **PJ obrigatória** para atender: CNPJ, razão social, dados bancários da PJ, cartão CNPJ (RF-PR-02.1 etapa 2; RN-PR-02.1).
- **Vídeo de apresentação é obrigatório** (exibido aos beneficiários nos matches). Pode ser pulado no onboarding, mas fica **pendente e em destaque na home** até ser enviado (RF-PR-02.4, §7.3).
- **"Perfil pronto para match" (completude × match):** incentivar o profissional a completar o perfil, com a lógica explícita *perfil mais completo → maior chance de aparecer nos matches*. Indicador de **0–100% visível na home**; abaixo de 100%, lista objetiva do que falta, cada item com **atalho direto** para completar (resolve para as seções de edição do perfil — PRO-09). Aos 100%, estado de confirmação **sóbrio** (sem gamificação infantilizada). Pesos maiores para os itens da vitrine do match: foto, **vídeo de apresentação**, bio/"como trabalha", abordagem/linha teórica, áreas de atuação, formação/certificados, agenda configurada. A pendência do vídeo (RF-PR-02.4) consolida-se aqui. Copy Sábio e **honesta** — "aparecem para mais beneficiários / aumentam suas chances", **sem prometer match garantido**.
- **Antecipação de recebíveis** é produto financeiro: cadências (semanal/quinzenal/mensal…) com **taxa exibida em tempo real**; categoria do profissional define as cadências disponíveis (RF-PR-03.2/03.3, RN-PR-03.1/03.2).
- **Prontuário pós-sessão obrigatório:** a tela abre automaticamente ao fim da sala; **a sessão não é finalizada sem o prontuário** (textarea obrigatório, salvamento de rascunho, prazo sugerido 24h). Privado entre profissional e plataforma (RF-PR-07.x, RN-PR-07.1/07.2/07.3).
- **Sigilo:** profissional vê apenas beneficiários que o escolheram (ou realocados); **nome real só em situações legais explícitas** (RN-PR-06.1/06.2). Respeita-se o apelido por padrão.
- **Férias/ausências:** profissional informa período (antecedência mín. sugerida 7 dias); beneficiários ativos escolhem aguardar ou trocar de profissional (RF-PR-08.x, RN-PR-08.1).
- **Plantão:** quem se oferece informa disponibilidade e deve estar **prontamente disponível**; acionamento (via palavras-chave da Nyna ou botão de pânico do beneficiário) chega por push e abre sala/chat de emergência (RF-PR-09.x, RN-PR-09.2).
- **Troca de profissional:** o novo profissional **só vê o prontuário se o beneficiário autorizar**; profissional anterior é notificado da troca sem dados pessoais (RF-PR-12.2/12.4, RN-PR-10.2 do Beneficiário).
- **Ranking YNA é OCULTO no MVP.** O painel do profissional mostra **score por critério com tooltips**, mas **nunca** a posição no ranking nem os comentários dos beneficiários (RF-PR-14.1, RN-PR-14 / RN-PR-15 §7.15).
- **Sem gravação de sessão** (LGPD + CFP) — a UI da sala diz isso, igual ao beneficiário (RN-CO-09.1).

## 5. Telas — escopo (Fluxo 3 · Profissional)

**P0 = completa e navegável. P1 = versão simples funcional. Stub = rota com placeholder digno (copy Cora-Sábio, não "em construção" seco).**

| ID | Tela | Prior. | Ref. RF | Nota de implementação |
|---|---|---|---|---|
| PRO-01 | Entrada via convite (`/pro/convite/:token`) | P0 | RF-PR-01.1 | Valida token; boas-vindas Domus; "Já tenho conta" → login |
| PRO-02 | Link expirado / inválido | P0 | RF-PR-01.1 | Caminho de recuperação (falar com a YNA) |
| PRO-03 ★ | Boas-vindas Domus | P0 | RF-PR-01.2 | Tom Cora-Sábio-Criador, par a par; visão dos próximos passos |
| PRO-04 | Cadastro — wizard 5 etapas | P0 | RF-PR-02.1 | (1) dados pessoais; (2) PJ; (3) clínicos (CRP+UF, linha teórica multi, áreas de atuação multi); (4) formação + certificados (upload mock); (5) vídeo de apresentação (upload mock, instruções de formato/16:9) |
| PRO-05 | Setup financeiro | P0 | RF-PR-03.1/03.2 | Dados bancários PJ + escolha de cadência com **taxa de antecipação em tempo real** |
| PRO-06 | Trilha de integração obrigatória | P0 | RF-PR-04.1/04.3 | Módulos em vídeo (mock), progresso, badge "Integração Concluída" |
| PRO-07 | Status do cadastro | P0 | RF-PR-02.5 | rascunho / em revisão / aprovado / requer ajuste; checklist do que falta |
| PRO-08 | Perfil ativo / fast-track | P1 | RF-PR-06 | Confirmação de ativação (48h); CTA para o painel |
| PRO-09 | Perfil clínico (público) | P0 | RF-PR-05.1 | Edição: bio, abordagem, especialidades, formação, vídeo; preview. **Destino dos atalhos do "Perfil pronto para match"** |
| PRO-10 | Preview "na perspectiva do beneficiário" | P0 | RF-PR-05.3 | Reusa o card de match do beneficiário (BEN-12/13) em modo leitura |
| PRO-11 | Configuração de agenda | P0 | RF-PR-05.2 | Slots, recorrência semanal, bloqueios |
| PRO-12 ★ | Home / Dashboard do profissional | P0 | RF-PR-06.1 | Próximas sessões, pendências (prontuários em aberto), atalhos, resumo financeiro + card **"Perfil pronto para match"** (anel/barra de completude, %, itens faltantes com CTA) |
| PRO-13 | Minhas sessões (agenda) | P0 | RF-PR-06.1 | Visões dia/semana; entrar na sala em 1 clique; abas próximas/realizadas |
| PRO-14 | Detalhe do beneficiário | P0 | RF-PR-06.2 | Apelido, respostas da triagem, histórico de sessões, prontuários anteriores |
| PRO-15 ★ | Sala de sessão (compartilhada) | P0 | RF-PR-06.4, RF-CO-09.x | Reuso de `SessionRoom` (role=profissional); mute/câmera/chat, sem gravação, aviso 5 min |
| PRO-16 | Prontuário pós-sessão (obrigatório) | P0 | RF-PR-07.x | Abre automático ao fim da sala; textarea obrigatório; rascunho; conclui a sessão |
| PRO-17 | Disponibilidade de plantão | P1 | RF-PR-09.1 | Turnos/dias que o profissional se oferece |
| PRO-18 | Acionamento de plantão + sala de emergência | P0 | RF-PR-09.3 | Push (mock) → aceitar → entra na sala de emergência (reusa `SessionRoom`, contexto de crise) |
| PRO-19 | Férias e ausências | P1 | RF-PR-08.1/08.3 | Cadastro de período + comunicação aos beneficiários (mock) |
| PRO-20 | Supervisão Domus | P1 | RF-PR-10.x | Calendário de supervisão, inscrição, sala (vídeo em grupo) |
| PRO-21 | Universidade YNA — trilhas | P1 | RF-PR-13.1/13.2 | Catálogo + player (mock) + progresso |
| PRO-22 | Universidade YNA — lives Domus | P1 | RF-PR-13.4 | Agenda de lives + replays (link YouTube fechado, mock) |
| PRO-23 | Painel de qualidade (Ranking oculto) | P1 | RF-PR-14.1 | Score por critério **com tooltips**; **sem** posição no ranking nem comentários |
| PRO-24 | Gestão financeira / antecipação | P1 | RF-PR-11.x | Dashboard: a receber, antecipações, taxas, histórico + NF (mock) |
| PRO-25 | Meu perfil / conta | P0 | — | Dados da conta, PJ, tema light/dark, sair; mesmo padrão visual do BEN-31 ("Meu Perfil") |
| PRO-26 | Notificação de troca de profissional | P1 | RF-PR-12.4 | Aviso ao profissional anterior, sem dados pessoais |

★ = telas de maior peso visual; capriche na fidelidade ao design system.

**Componente compartilhado `ProfileStrengthCard` ("Perfil pronto para match"):** componente único usado na home (PRO-12) e referenciado no perfil (PRO-09). A completude é calculada **uma única vez** no `ProContext`/`proService` como `{ percent, items: [{ key, label, peso, done, href }] }` (**fonte única de verdade**) e consumida pelas telas. Cada item faltante tem `href` que leva à seção de edição correspondente em PRO-09.

### Rotas sugeridas (todas sob `/pro`)

`/pro/convite/:token` → `/pro/boas-vindas` → `/pro/cadastro/:passo` (5 etapas) → `/pro/financeiro/setup` → `/pro/integracao` → `/pro/status` · `/pro/home` · `/pro/agenda` · `/pro/beneficiario/:id` · `/pro/sessao/:id` · `/pro/sessao/:id/prontuario` · `/pro/plantao` · `/pro/plantao/emergencia/:id` · `/pro/ausencias` · `/pro/supervisao` · `/pro/universidade` · `/pro/universidade/lives` · `/pro/qualidade` · `/pro/financeiro` · `/pro/perfil`

### Navegação (sidebar desktop / bottom-nav mobile) do profissional

Itens: **Início** (`/pro/home`) · **Agenda** (`/pro/agenda`) · **Universidade** (`/pro/universidade`) · **Financeiro** (`/pro/financeiro`) · **Perfil** (`/pro/perfil`). Sem botão de pânico. Mesmo padrão visual do `Sidebar`/`BottomNav` do beneficiário (mesmos tokens, mesma altura/raio), apenas itens diferentes.

## 6. Voz da marca — Cora calibrada para o Profissional

- **Arquétipos:** Sábio (rigor, evidência) + Criador (construção, ferramenta de trabalho) + Herói coletivo (propósito compartilhado). **Par a par, colega de campo** — não o tom Cuidador/Amante do beneficiário.
- **Usa:** prática clínica, evidência, autonomia, propósito, comunidade, supervisão, qualidade real, construir juntos, ofício, rigor, confiança.
- **Evita:** o mesmo blacklist corporativo do beneficiário (transforme, líder de mercado, ROI ao beneficiário, disruptivo, empoderar, jargão) **e** qualquer tom paternalista/terapêutico com o profissional.
- Em telas operacionais (prontuário, financeiro, agenda): **direto e claro**, sem floreio. Em onboarding e Universidade: **inspirador com substância**.
- Nada de Lorem ipsum — incluindo vazios e erros, com microcopy Cora-Sábio.

## 7. Estados, acessibilidade e qualidade

- **Todo fetch tem 3 estados:** carregando (`Skeleton`), vazio e erro (`ErrorState`) — microcopy Cora-Sábio. Use `useService`.
- **WCAG AA** nos dois temas; foco visível; HTML semântico (`nav`, `main`, `dialog`, `radiogroup`, `progressbar`); `aria-label` em todo controle só-ícone.
- **Cores e tipografia:** exclusivamente os tokens do design system (índigo + fontes Bricolage/Inter/JetBrains). Não introduzir paleta nova.
- Avatares/thumbnails por SVG inline/blocos de cor; uploads (certificados, vídeo) são **mock** (mostrar nome do arquivo + estado), sem backend.

## 8. Consistência visual entre os dois perfis (orientações)

O objetivo é que, lado a lado, Beneficiário e Profissional pareçam **o mesmo produto**, com **personalidades de conteúdo diferentes**. Garanta:

1. **Mesmos primitivos:** todo botão, card, badge, input, sheet, modal, page-header, avatar, stat-tile, skeleton e estados de erro vêm de `src/components/` — **não recriar**. Se faltar uma variante, **estenda o componente existente** (nova prop), não duplique.
2. **Mesmo sistema de layout:** mobile bottom-nav + desktop sidebar à esquerda (mesma largura/raio/sombra); telas de foco em `max-w-xl`; onboarding com `OnboardingSplit` (ilustração + conteúdo). Mesmos breakpoints.
3. **Mesmos tokens de movimento:** transição de rota com `animate-yna-enter`; entradas com `animate-yna-slide-up`/`fade-in` e os mesmos delays. `ease-organic` para hovers.
4. **Mesma tipografia hierárquica** do `README` (título de tela `h1 text-[24px]`, seção `h2 text-[15px] font-semibold`, eyebrow em mono, corpo Inter).
5. **Acento índigo idêntico**, gradientes `yna-gradient*` reutilizados nas telas-herói (boas-vindas, dashboard) com o mesmo peso visual.
6. **Diferenças intencionais e controladas:** (a) **sem** botão de pânico no profissional; (b) navegação com itens próprios; (c) tom de copy Sábio/Criador; (d) densidade de dados um pouco maior em painéis operacionais — sempre arejada. Documente essas diferenças no `README`.
7. **Componente compartilhado de sessão (`SessionRoom`)** com aparência idêntica nos dois fluxos; só muda o pós-sessão (feedback × prontuário) e rótulos de papel.

## 9. Plano de execução — tarefas sequenciais

Execute **em ordem**. Cada tarefa termina com: `tsc -b` limpo, `npm run build` ok, rotas navegáveis sem dead-ends, e revisão de leveza/consistência (Seções 2 e 8). Só avance quando a anterior estiver "pronta".

> **Tarefa 0 — Fundação & scaffolding do app Profissional**
> - Criar `ProContext` (perfil, status do cadastro, onboarding, sessão simulada), `ProAppLayout` + `ProSidebar`/`ProBottomNav` (itens da Seção 5), namespace `/pro/*` no `App.tsx` sem tocar nas rotas do beneficiário.
> - Esqueleto de `src/services/pro.ts`, `src/data/proMock.ts` e extensão de `src/types/index.ts` (`ProProfile`, `ProSession`, `ProntuarioEntry`, `PlantaoShift`, `FinanceSummary`, `Trilha`, `QualityScore`, etc.).
> - Telas placeholder dignas (copy Cora-Sábio) para todas as rotas, já navegáveis. Tema e layouts funcionando.
> - **Entregável:** shell navegável do profissional, isolado do beneficiário.

> **Tarefa 1 — Entrada & Onboarding** (PRO-01 → PRO-08)
> - Convite/validação, boas-vindas Domus, wizard de cadastro em 5 etapas (passos curtos), setup financeiro com taxa em tempo real, trilha de integração, status do cadastro, ativação fast-track.
> - Regras: PJ obrigatória, vídeo obrigatório-mas-adiável (pendência em destaque), status do cadastro.

> **Tarefa 2 — Perfil clínico & Agenda** (PRO-09 → PRO-11)
> - Edição do perfil público, **preview na perspectiva do beneficiário** (reusar card de match), configuração de agenda (slots, recorrência, bloqueios).

> **Tarefa 3 — Operação: Dashboard, Agenda e Beneficiário** (PRO-12 → PRO-14)
> - Home/dashboard com pendências e próximas sessões; lista/visões de sessões; detalhe do beneficiário com triagem + histórico de prontuários (respeitando sigilo/apelido).
> - **"Perfil pronto para match":** construir o `ProfileStrengthCard` na home (%, barra/anel, itens faltantes com atalho). Atalhos resolvem para as seções de edição da **Tarefa 2** (PRO-09); estado inicial alimentado pelo onboarding (**Tarefa 1**). Estado 100% com confirmação sóbria.

> **Tarefa 4 — Sessão online (compartilhada) & Prontuário obrigatório** (PRO-15 → PRO-16)
> - **Refatorar `Ben17VideoRoom` → `components/SessionRoom`** parametrizado por `role`, sem quebrar o fluxo do beneficiário (o `Ben17VideoRoom` passa a ser um wrapper fino que usa `SessionRoom` com `role='beneficiario'`).
> - Tela do profissional usa `SessionRoom` com `role='profissional'`; ao encerrar, **abre o prontuário obrigatório** que finaliza a sessão.

> **Tarefa 5 — Plantão & Emergências** (PRO-17 → PRO-18)
> - Disponibilidade de plantão; acionamento (push mock) → aceitar → **sala de emergência** reusando `SessionRoom` em contexto de crise (conecta com o fluxo BEN-23 do beneficiário, do lado do plantonista).

> **Tarefa 6 — Crescimento** (PRO-20 → PRO-23)
> - Supervisão Domus (calendário + sala em grupo), Universidade YNA (trilhas + lives), **Painel de qualidade** (score por critério com tooltips, **sem ranking/comentários**).

> **Tarefa 7 — Financeiro, Ausências, Perfil & QA final** (PRO-19, PRO-24 → PRO-26)
> - Gestão financeira/antecipação, férias/ausências, "Meu perfil" (padrão BEN-31), notificação de troca de profissional.
> - **QA final:** varredura 390/768/1280 em light/dark, sem scroll horizontal; checagem de consistência (Seção 8); atualizar `README` com o mapa `rota → tela → RF` do profissional, o que está mockado, e as diferenças intencionais entre os perfis.

## 10. Definição de pronto (global)

1. `npm run dev` sem erros; `tsc -b` limpo; `npm run build` ok. Fluxo do beneficiário **intacto**.
2. Jornada do profissional navegável de ponta a ponta sem dead-ends: convite → boas-vindas → cadastro → financeiro → integração → status → home → (agenda, sessão+prontuário, beneficiário, plantão, supervisão, universidade, qualidade, financeiro, perfil).
3. Sala de sessão **compartilhada** funcionando para os dois papéis a partir de `SessionRoom`.
4. Testado a 390px, 768px e 1280px, light e dark — sem scroll horizontal.
5. Consistência visual com o beneficiário (Seção 8) revisada tela a tela; diferenças intencionais documentadas.
6. `README` atualizado: arquitetura do profissional (ProContext + pro services), mapa rota→tela→RF, mocks e como trocar pela API, pendências herdadas (validação CRP com CFP, fórmula do ranking, fornecedor de vídeo, conteúdo das trilhas, integração fintech).

## 11. Pendências herdadas (não bloqueiam o MVP de UI)

- **Validação de CRP**: manual via backoffice no MVP (mock no front).
- **Fórmula do Ranking YNA**: pesos pendentes — o painel mostra critérios, não posição.
- **Fornecedor de vídeo** (Daily/Twilio): `SessionRoom` é mock, estruturado para receber o provider.
- **Integração com fintech** (antecipação) e **gateway**: mock.
- **Conteúdo das trilhas / canal YouTube fechado**: mock.
- **Texto exato dos critérios de qualidade e tooltips**: validar com Domus.
