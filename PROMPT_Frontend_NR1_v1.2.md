# PROMPT — Módulo de Conformidade NR-1 (Riscos Psicossociais) · YNA Care Hub (para Antigravity)

> **Versão 1.2** — o questionário psicossocial é **configurável por modelos e versões, customizável por cliente**,
> com um **núcleo obrigatório** mantido pela YNA. **[v1.2] Toda a configuração e customização ocorre exclusivamente
> no backoffice da YNA — sem autosserviço do cliente** (decisão de produto: controle e prevenção de erro).
> Mudanças destacadas com **[v1.1]** / **[v1.2]**.
>
> **Como usar:** abra o Antigravity com o repositório da plataforma como workspace
> (`Local Sites/yna/`), para que as referências de arquivo resolvam. O app vive em `frontend/`.
> Este prompt **estende** o app existente — não cria um projeto novo.

---

Você é um(a) engenheiro(a) frontend sênior especializado(a) em produtos digitais de saúde. Sua tarefa é implementar o **Módulo de Conformidade NR-1 (gestão de riscos psicossociais)** dentro da plataforma YNA Care Hub que já existe, evoluindo as jornadas de **RH/Empresa**, **Beneficiário** e **Gestores YNA/Manager** — mantendo fielmente o design system, os padrões de código e a experiência atuais. Tudo com **dados mockados** (o app segue protótipo funcional; backend fora de escopo).

## 0. Escopo desta entrega (leia antes de tudo)

Implementar **apenas os requisitos classificados como Essencial (Must) e Importante (Should)** do documento `YNA - Documento de Requisitos - NR-1 (Conformidade).pdf`. Os itens “Desejável (Could)” e “Fora do MVP (Won’t)” **não** entram agora.

Princípio orientador do módulo: **suficiente e defensável, não o mais completo.** A NR-1 **não exige “laudo” específico** — a obrigação é o **inventário de riscos psicossociais no PGR com rastreabilidade** (risco → avaliação → ação → evidência). O módulo entrega isso de forma enxuta e honesta; a profundidade competitiva mora na camada de cuidado, que já existe.

Como é protótipo: nada de backend real. Toda persistência/consulta é **mock atrás da camada de serviços tipada** (padrão atual do app), pronta para virar API depois.

## 1. [v1.1] O questionário é configurável — não é um formulário fixo

Não existe hoje, no mercado, um formulário psicossocial 100% consolidado como padrão único: a prática está em evolução e há adaptações por cenário. Por isso o questionário da YNA é um **modelo configurável e versionado**, não um formulário fixo no código.

Conceito a implementar:

- **Modelo (template) de avaliação psicossocial** — um questionário nomeado, com metadados, lista de itens, escala e regras de pontuação. A plataforma tem sempre um **“Modelo YNA” base**, mantido e revisado pela YNA.
- **Versões do modelo** — cada modelo tem versões. **Uma versão publicada é imutável** (para rastreabilidade); o ciclo é **rascunho → publicada → arquivada**. Assim a YNA evolui o instrumento sem quebrar avaliações passadas.
- **Customização por cliente** — a partir de uma versão YNA, cria-se um **modelo derivado específico do cliente** (empresa), com itens próprios — **respeitando o núcleo obrigatório** (abaixo). **[v1.2] Essa customização é feita exclusivamente no backoffice da YNA; o cliente não edita o questionário (sem autosserviço), para manter controle e prevenir erros.**
- **[Governança — inegociável] Núcleo obrigatório** — a YNA define um conjunto de **dimensões e itens mínimos** que garantem a defensabilidade NR-1. **Nenhum modelo derivado pode remover o núcleo** (pode apenas acrescentar itens). Sem essa trava, um cliente poderia customizar até sair da conformidade — o que expõe cliente e YNA.
- **Aplicação e rastreabilidade** — ao criar a campanha, o RH escolhe **qual modelo + versão** aplicar (padrão: última versão YNA publicada). **A versão aplicada é registrada na campanha e em cada resposta**, e aparece no inventário/relatório (reforça RF-F02).

**[v1.1] Reuso obrigatório da infraestrutura existente.** A plataforma **já tem** um construtor de formulário dinâmico e um CRUD de modelos no backoffice: os **“Tipos de profissional” com campos flexíveis** (text, textarea, select, multiselect, número, data) que **dirigem cadastro e triagem**, e os **“Modelos de documentos”**. **Reutilize esses padrões** (mesmos tipos de campo, mesma lógica de CRUD e de renderização dinâmica) para o modelo de questionário — não construa um motor de formulário novo.

## 2. Leia primeiro (não invente o que já existe)

A base é o app atual em `frontend/`. Respeite o que está lá:

- **`frontend/tailwind.config.ts` + `frontend/src/index.css`** — design system tokenizado. Paleta índigo `#4749A8` (+ 600/400/300/200/100/50), acentos lavender `#DCD4F0`, pink `#F2A8C5`, yellow `#FBC85E`, cream `#F4F1F4`; semânticos success/warning/danger/info; superfícies e textos por CSS var (light/dark). Tipografia: `font-heading` (Bricolage Grotesque) automática em h1–h6, `font-sans` (Inter) no corpo, `font-mono` (JetBrains Mono) em eyebrows/contadores. Use os tokens semânticos (`bg-surface`, `text-ink`, `border-border`), nunca cores cruas.
- **`frontend/src/components/`** (~55 componentes) — reutilize e evolua: `Button`, `Card`, `Modal`/`Sheet`, `PageHeader`, `StatTile`, `Badge`, `Skeleton`, `ErrorState`, `Input`/`Select`/`Textarea`/`Chips`/`OptionCard`, `RadarChart`, `FiltrosBar`, `FlowLayout`/`FocusLayout`, `CamposTipo` (campos flexíveis já usados na triagem/cadastro), e os chrome por perfil (`RhAppLayout`, `MngAppLayout`, `AppLayout`/`BottomNav`).
- **`frontend/src/App.tsx`** — roteamento declarativo e centralizado. Novas rotas entram no layout route certo (`RhAppLayout` sob `RhRoot`; `MngAppLayout` sob `MngRoot`; layouts de foco para o beneficiário).
- **`frontend/src/data/`, `frontend/src/services/`, `frontend/src/hooks/useService.ts`, `frontend/src/types/index.ts`** — padrão de dados mockados; leitura via `useService(...)` com 3 estados. Veja como “Tipos de profissional” e “Modelos de documentos” estão modelados em `mngMock.ts`/`services/mng.ts` e **siga o mesmo formato** para os modelos de questionário.
- **`frontend/README.md`** — mapa canônico rota → tela → RF. Atualize ao final.
- **`YNA - Documento de Requisitos - NR-1 (Conformidade).pdf`** — fonte primária dos requisitos do módulo (RF-A..K, RNF, prioridades). *(O `YNA - Documento de Requisitos - v1_3.docx`, já no repositório, dá o contexto das jornadas da plataforma.)*
- **`YNA_Questionario_Riscos_Psicossociais_v0.3.pdf`** — o **conteúdo-semente do Modelo YNA (versão base)**: itens por dimensão, escala, direção, pontuação e o **núcleo obrigatório**. Use como dado inicial do mock.

## 3. Diretriz de design — clean, com respiro (inegociável)

Mesma régua do app: telas que não geram sobrecarga cognitiva, inclusive nas densas deste módulo (editor de modelo, inventário, plano de ação). Espaçamento generoso; um CTA primário por tela; revele progressivamente (abas, `Sheet`/`Modal`); copy curta. Para o RH e o Manager, tom Sábio + Herói coletivo; para o beneficiário, tom Cuidador (§8).

## 4. Stack e arquitetura — estritamente a do app atual

- **React 18 + Tailwind + Vite + TypeScript (strict)**, `darkMode: 'class'`. **Nenhuma lib nova**. Estado com **Context + hooks nativos**; navegação com o `react-router-dom` já presente; ícones `@iconify/react` (`ph:*`).
- **Dados mockados:** criar `frontend/src/data/nr1Mock.ts` e `frontend/src/services/nr1.ts` (funções assíncronas tipadas com `delay`), tipos em `frontend/src/types/index.ts`. Consumir via `useService`. Sempre os 3 estados (skeleton/vazio/erro) com microcopy da marca.
- **[v1.1] Modelo de dados do questionário (tipos):** ao menos —
  - `QuestionarioModelo` { id, nome, escopo: 'yna' | 'cliente', clienteId?, descrição, versões: `QuestionarioVersao[]` }
  - `QuestionarioVersao` { versão, status: 'rascunho' | 'publicada' | 'arquivada', dimensões: `Dimensao[]`, escala: `EscalaConfig`, pontuacao: `PontuacaoConfig`, criadaEm }
  - `Dimensao` { id, nome, itens: `Item[]` }
  - `Item` { id, texto, tipoCampo (reusar os tipos existentes), escala: 'A'|'B', direcao: 'positivo'|'reverso', obrigatorioNucleo: boolean }
  - Amarrar a campanha (`RhContext`) a `{ modeloId, versao }`; cada resposta mockada carrega a versão aplicada.
- **Estado:** modelos de questionário e núcleo pertencem ao **`MngContext`** (backoffice); a seleção de modelo/versão na campanha, ao `RhContext`; a avaliação em andamento, ao `AppContext`.
- **Rotas novas:** registrar em `App.tsx`. Namespaces: `/mng/nr1/*` (modelos e versões), `/rh/nr1/*` (cockpit), e no beneficiário `/avaliacao/*` e `/canal-escuta`.
- **Padrão de tela:** named exports `NR1Mng*` / `NR1Rh*` / `NR1Ben*` nas pastas `screens/mng/`, `screens/rh/`, `screens/`. Usar `PageHeader`, `Card`, `StatTile`, largura `PAGE_MAX_W` (`src/lib/layout.ts`), fundo `bg-yna-gradient-soft`.
- Não tocar em nada fora de `frontend/`. `tsc -b` limpo e `npm run build` sem erros.

## 5. Como o módulo NR-1 encaixa nas jornadas

1. **Gestores YNA / Manager — os modelos.** [v1.1] A YNA cria e versiona os **Modelos de Avaliação Psicossocial** (base YNA + derivados por cliente), define o **núcleo obrigatório** e publica versões. Reusa o construtor de campos flexíveis.
2. **Beneficiário — a avaliação.** O colaborador responde o questionário **renderizado dinamicamente a partir do modelo/versão atribuído** à campanha, curto e **anônimo**. Ao final, é convidado (opt-in) à jornada de cuidado existente.
3. **RH/Empresa — o cockpit.** O RH **escolhe o modelo + versão** ao criar a campanha, acompanha participação, lê o mapa de calor por dimensão × área, gera o **inventário para o PGR**, monta o **plano de ação 5W2H** e emite o **relatório de gestão** rastreável (com a versão do instrumento). Nunca vê resposta individual (k-anonimato ≥ 4).
4. **A ponte.** Dados agregados alimentam o RH; o convite ao cuidado é **sempre iniciado pelo colaborador** (opt-in), nunca encaminhamento individual pelo RH.

## 6. Regras de produto NR-1 que o front deve respeitar

- **[v1.1] Núcleo obrigatório.** Modelos derivados de cliente podem **acrescentar** itens, **nunca remover** os itens/dimensões marcados como núcleo. A UI do editor bloqueia a remoção do núcleo e sinaliza claramente o que é núcleo × item do cliente. A trava vale **inclusive para o operador do backoffice YNA** — é proteção contra erro humano, não só contra o cliente.
- **[v1.2] Sem autosserviço do cliente.** Toda configuração e customização de modelos/versões acontece no **backoffice da YNA** (jornada Gestores YNA). O RH **apenas seleciona e aplica** um modelo/versão na campanha — não cria nem edita itens. A UI **não deve expor** edição de questionário para RH nem beneficiário.
- **[v1.1] Versão publicada é imutável.** Editar uma versão publicada cria uma **nova versão rascunho**; a publicada permanece intacta (rastreabilidade). Campanhas em curso mantêm a versão com que começaram.
- **[v1.1] Registro da versão aplicada.** Campanha, respostas, inventário e relatório citam **modelo + versão** (reforça RF-F02).
- **Anonimato inegociável.** RH só vê agregados; nenhum recorte com menos de **4 respondentes** é exibido. A tela do beneficiário reforça o anonimato antes de começar.
- **Ponte só por opt-in.** Ao concluir, o colaborador **escolhe** acessar o cuidado. Zero encaminhamento individual pelo RH.
- **Acolhimento imediato.** A conclusão sempre oferece próxima ação de cuidado/acolhimento, no tom Cuidador.
- **Defensável = rastreável.** A cadeia risco → avaliação → inventário → ação → evidência é navegável na UI; o entregável legal é o **inventário no PGR**, não um “laudo”.
- **Responsabilidade técnica é do cliente.** O relatório tem campo de responsável técnico (SST/consultoria). A YNA fornece o insumo, não assina o PGR.
- **As 4 dimensões** (Guia do MTE): organização do trabalho; relações e liderança; ambiente e recursos; contexto externo. O modelo, o mapa de calor e a pontuação se organizam por elas.

## 7. Telas — escopo

**P0 = completa e navegável (Essencial/Must). P1 = versão simples funcional (Importante/Should).** Reutilize componentes existentes.

### 7.1. [v1.1] Gestores YNA / Manager — Modelos de Avaliação Psicossocial

| ID | Tela | Prior. | RF | Nota de implementação |
|---|---|---|---|---|
| NR1-MNG-01 | Lista de modelos de questionário | P0 | RF-YN-NR1-01 | Rota `/mng/nr1/modelos`. Lista Modelo YNA + derivados por cliente, com status e versão. Padrão de “Modelos de documentos” |
| NR1-MNG-02 | Editor do modelo (dimensões e itens) | P0 | RF-YN-NR1-01/05 | Reusar o construtor de **campos flexíveis** (`CamposTipo`): item = texto + tipo + escala + direção + flag núcleo. Configurar escala e pontuação |
| NR1-MNG-03 | Versões: publicar, arquivar, comparar | P0 | RF-YN-NR1-02 | Ciclo rascunho→publicada→arquivada; publicada imutável; diff entre versões; ver quais clientes/campanhas usam cada versão |
| NR1-MNG-04 | Núcleo obrigatório + derivar por cliente | P0 | RF-YN-NR1-03/04 | Marcar itens/dimensões do núcleo (não removíveis); criar modelo do cliente a partir de uma versão YNA, só acrescentando itens |

### 7.2. Jornada Beneficiário — Avaliação psicossocial + ponte

| ID | Tela | Prior. | RF | Nota de implementação |
|---|---|---|---|---|
| NR1-BEN-01 | Entrada da avaliação (card na Home + rota) | P0 | RF-B01, RF-B03 | Card na `Ben21Home` quando há campanha ativa; rota `/avaliacao` |
| NR1-BEN-02 | Introdução + anonimato/consentimento | P0 | RF-A02, RNF-01/02 | Tela de foco, copy Cora; aceite no `AppContext` |
| NR1-BEN-03 | **[v1.1] Questionário — renderização dinâmica do modelo/versão** | P0 | RF-A01, RF-CO-NR1-01 | **Renderiza os itens do modelo/versão atribuído à campanha** (não hardcoded). Wizard por dimensão espelhando `Ben09Triagem`; salvamento progressivo; ~10 min |
| NR1-BEN-04 | Conclusão + acolhimento + ponte opt-in | P0 | RF-J01, RF-J04 | Encerramento Cuidador; CTA opt-in → fluxo de match/cuidado existente; nunca automático |
| NR1-BEN-05 | Canal de escuta confidencial (relato) | P0 | RF-H01 | Relato anônimo; abre protocolo mock |
| NR1-BEN-06 | Minha evolução (avaliações no tempo) | P1 | RF-G01 | `RadarChart` comparativo; só o próprio dado |

### 7.3. Jornada RH/Empresa — Cockpit de conformidade NR-1

| ID | Tela | Prior. | RF | Nota de implementação |
|---|---|---|---|---|
| NR1-RH-01 | Campanha de avaliação | P0 | RF-B01/B04, **RF-RH-NR1-10** | Rota `/rh/nr1/campanha`. **[v1.1] Selecionar modelo + versão** (padrão: última versão YNA publicada); registrar a versão. Acompanhar participação em tempo real |
| NR1-RH-02 | Mapa de calor de riscos psicossociais | P0 | RF-C01/02/03/05 | Estender `RH14Departamentos`: heatmap por dimensão × área; ocultar recortes <4 |
| NR1-RH-03 | Inventário para o PGR + exportar | P0 | RF-D01/02/03 | Tabela em cards/abas; exportar PDF/planilha mock; **citar modelo+versão** |
| NR1-RH-04 | Plano de ação 5W2H | P0 | RF-E01/02 | Medida, responsável, prazo, status, evidência; alertas |
| NR1-RH-05 | Relatório de Gestão + rastreabilidade | P0 | RF-F01/02/03/04 | Trilha risco→avaliação→ação→evidência; **versão do instrumento**; campo responsável técnico; exportar PDF mock |
| NR1-RH-06 | Painel de conformidade NR-1 | P0 | RF-I01 | Estender `RH13Indicadores`; status, risco por área, participação, evolução |
| NR1-RH-07 | Ciclos / reavaliação | P1 | RF-G01/02/03 | Histórico de campanhas; comparação entre ciclos |
| NR1-RH-08 | Gestão do canal de escuta (casos/SLA) | P1 | RF-H02 | Lista com status/SLA; detalhe em `Sheet` |
| NR1-RH-09 | Kit de comunicação da campanha | P1 | RF-K01 | Materiais/copy mock |

### Rotas a registrar em `App.tsx`

Manager: `/mng/nr1/modelos` · `/mng/nr1/modelos/:id` (editor) · `/mng/nr1/modelos/:id/versoes` · `/mng/nr1/nucleo`
Beneficiário: `/avaliacao` → `/avaliacao/intro` → `/avaliacao/:passo` → `/avaliacao/conclusao` · `/canal-escuta` · `/minha-evolucao`
RH: `/rh/nr1` · `/rh/nr1/campanha` · `/rh/nr1/mapa-calor` · `/rh/nr1/inventario` · `/rh/nr1/plano-acao` · `/rh/nr1/relatorio` · `/rh/nr1/ciclos` · `/rh/nr1/canal`

## 8. Voz da marca — Cora (filtro de toda copy nova)

- **Beneficiário (respondente):** Cuidador 60% + Sábio 30%. Antes: acolher e garantir sigilo. Ao final: presença, nunca frieza. Zero jargão de conformidade para o colaborador — ele não precisa saber que isso é “NR-1”.
- **RH e Manager:** Sábio + Herói coletivo. Direto, com evidência, sem prometer o que a lei não exige. **Nunca usar “laudo” como se fosse obrigatório**; falar em “inventário para o PGR” e “relatório de gestão”.
- **Evitar** ROI dirigido ao beneficiário, “transforme sua vida”, jargão corporativo, urgência artificial. **Usar** cuidado, sigilo, evidência, acolhimento, presença, conformidade. Nada de Lorem ipsum.

## 9. Estados, acessibilidade e qualidade

- Todo fetch com 3 estados e microcopy da marca. **WCAG 2.1 AA** nos dois temas; foco visível; `aria-label` em controles só-ícone. Mobile-first 390px, sem scroll horizontal, alvos ≥ 44px.
- Heatmap e radar por SVG inline; escala de cor acessível com legenda textual. Onde um recorte é ocultado por k-anon, mostrar “dados protegidos (menos de 4 respostas)”.

## 10. Definição de pronto

1. `npm run dev` sem erros; `tsc -b` limpo; `npm run build` ok. Nenhuma lib nova.
2. **[v1.1] Manager:** criar/editar um modelo, marcar núcleo, publicar uma versão, criar um modelo de cliente derivado (só acrescentando itens) — tudo com dados mockados.
3. **Beneficiário:** `/avaliacao` renderiza dinamicamente o modelo/versão da campanha, de ponta a ponta (intro → dimensões → conclusão com ponte opt-in) + `/canal-escuta`.
4. **RH:** `/rh/nr1/*` navegável; a campanha registra modelo+versão; inventário e relatório citam a versão; rastreabilidade demonstrável na UI.
5. k-anonimato ≥ 4 em todas as visões de RH; nenhuma resposta individual acessível ao RH; ponte só por opt-in.
6. Testado a 390px, 768px e 1280px, light e dark, sem scroll horizontal; leveza revisada tela a tela.
7. `frontend/README.md` atualizado: novas rotas → tela → RF; o que está mockado (modelos, versões, campanha, participação, inventário, exportações, canal) e como trocar pela API real; pendências herdadas (validação clínica dos itens do Modelo YNA; núcleo obrigatório a confirmar com a clínica; textos legais).

## 11. Pendências a sinalizar (não resolver no código)

- **[v1.1] Núcleo obrigatório:** quais dimensões/itens são não-removíveis — a definir com a curadoria clínica (o doc do questionário traz uma proposta).
- **[v1.2] Autosserviço: decidido — não haverá.** A configuração/customização do questionário é exclusiva do backoffice YNA (controle e prevenção de erro do cliente). Não implementar edição de questionário nas jornadas RH/Beneficiário. Pendência residual (produto, não código): a governança interna YNA — quem cria e aprova modelos derivados — e um eventual SLA de customização se isso virar diferencial comercial.
- **Itens do questionário (Modelo YNA):** conjunto base por dimensão, marcado “a validar clinicamente”.
- **Fórmula de probabilidade × severidade e cortes:** cálculo simples e transparente no mock; revisão de SST.
- **Textos legais** (consentimento, sigilo): placeholder no tom Cora, para jurídico/LGPD.
- **Exportações** (PGR, relatório): arquivo mock nesta fase.
