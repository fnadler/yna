# YNA · Plataforma de Conformidade NR-1 — Frontend

Recorte de produto: a plataforma deixou de ser um app de cuidado (tele-atendimento, rede de
profissionais, agendamento, sessões, check-ins) e passa a ser **exclusivamente de conformidade
com a NR-1** (gestão de riscos psicossociais). Três jornadas enxutas, organizadas em volta de uma
única promessa: *inventário de riscos psicossociais no PGR, com rastreabilidade*.

- **Colaborador** — responde à avaliação anônima e acompanha sua evolução (raiz `/`, entra por
  `/convite/:token`).
- **RH / Empresa** — cadastra colaboradores, aplica campanhas e opera o cockpit NR-1 (`/rh/*`).
- **Backoffice YNA** — governa o instrumento (modelos, versões, núcleo) e a operação multiempresa
  (`/mng/*`).

Stack oficial: **React + TypeScript + Vite + Tailwind CSS + React Router DOM**. Tudo com dados
mockados atrás de uma camada de serviços tipada; backend fora de escopo.

## Como rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b + vite build (produção)
```

A rota raiz `/` redireciona para `/rh/bem-vindo`: o RH é o comprador, e é por ele que a
demonstração começa.

---

## Design System — Tipografia

### Fontes

| Papel | Família | Token Tailwind | Aplicação |
|---|---|---|---|
| **Display / Marca** | Bricolage Grotesque Variable | `font-heading` | Todos os títulos semânticos (`h1`–`h6`) |
| **Interface / Corpo** | Inter Variable | `font-sans` (padrão `body`) | Parágrafos, labels, inputs, navegação |
| **Mono** | JetBrains Mono | `font-mono` | Eyebrows, contadores, timestamps |

- Ambas as fontes são servidas como **variable fonts** (eixo `wght`) via `@fontsource-variable/*`, sem requests externos.
- A aplicação de `font-heading` é automática via `@layer base`: todo elemento `h1`–`h6` herda a Bricolage Grotesque sem necessidade de classe explícita.
- Para aplicar a fonte de display em elementos não-semânticos (ex.: hero marketing), use a classe utilitária `font-heading`.

### Hierarquia de tamanhos (títulos)

| Uso | Tag | Classe | Fonte |
|---|---|---|---|
| Título de página hero | `h1` | `text-[26px] font-medium tracking-[-0.02em]` | Bricolage Grotesque |
| Título de tela padrão | `h1` | `text-[24px] font-medium tracking-[-0.02em]` | Bricolage Grotesque |
| Título de seção | `h2` | `text-[15px] font-semibold` | Bricolage Grotesque |
| Título de card | `h3` | `text-[15px] font-semibold` | Bricolage Grotesque |
| Eyebrow (label de seção) | `p` + `font-mono` | `text-[10.5px] font-medium uppercase tracking-[0.14em]` | JetBrains Mono |
| Corpo principal | `p` | `text-[15px] leading-relaxed` | Inter |
| Corpo secundário | `p` | `text-sm leading-relaxed` | Inter |

---

## Arquitetura

### Estado global — React Context + hooks nativos

| Contexto | Responsabilidade |
|---|---|
| `ThemeContext` | Tema light/dark **compartilhado** pelas três jornadas. Persiste em `localStorage`. |
| `AppContext` | Sessão do **colaborador**: token da sessão anônima (`sessaoToken`), se a conta já foi criada (`contaCriada`), e a avaliação NR-1 em andamento (`nr1` — consentimento, respostas, interesse opcional em cuidado futuro). |
| `RhContext` | Sessão do **RH/Empresa**: empresa, usuário logado (Master/Operador), instrumento NR-1 aplicado na campanha corrente. Isolado do `AppContext`. |
| `MngContext` | Sessão do **backoffice YNA**: gestor logado, notificações. Isolado dos demais perfis. |

Não há mais `ProContext` — a jornada do profissional saiu por completo neste recorte (§ abaixo).
Sem Redux, Zustand, TanStack Query ou qualquer lib de estado além das nativas do React.

### Camada de serviços

| Arquivo | Escopo |
|---|---|
| `src/services/index.ts` | `inviteService` — validação do token de convite do colaborador |
| `src/services/rh.ts` | Empresa, equipe, departamentos, colaboradores, convites, notificações |
| `src/services/mng.ts` | Login, empresas clientes, suporte, gestores YNA, cockpit de conformidade |
| `src/services/nr1.ts` | Módulo NR-1 completo (modelos, campanhas, resultados, ações, canal de escuta) |

Funções assíncronas tipadas com latência simulada (200–1400ms), assinaturas espelhando a futura
API REST.

```ts
// Padrão de consumo
const result = useService(() => rhColaboradorService.list(), [])
// result.status === 'loading' | 'success' | 'error'
```

**Para trocar pela API real:** substituir o corpo das funções pelos `fetch`/`axios` reais. A
assinatura não muda — os componentes continuam funcionando.

### Hook `useService`

Entrega `{ status, data?, message?, reload }` para qualquer chamada assíncrona. Todos os fetches
têm estados loading (skeleton), success e error com microcopy da marca.

---

## Mapa rota → tela → RF — Colaborador

O acesso é sempre por link/token (RF-B01), sem senha complexa. **A avaliação é respondida antes de
existir qualquer conta**: isso reforça que a resposta é anônima. A conta leve só é oferecida depois,
para quem quiser acompanhar a própria evolução.

| Rota | Tela | RF principal |
|---|---|---|
| `/convite/:token` | COL-01 Convite | RF-B01 |
| `/convite/invalido` | COL-01 Link inválido | RF-B01 |
| `/sigilo` | COL-02 Consentimento LGPD | RNF-01 |
| `/comecar` | Transição "tudo certo" — fecha o consentimento, abre a avaliação | — |
| `/avaliacao` | COL-06 Portão: segue para `/avaliacao/intro` se há campanha ativa e não respondida, senão mostra estado vazio | RF-A02 |
| `/avaliacao/intro` | NR1-BEN-02 Introdução e anonimato | RF-A02, RNF-01/02 |
| `/avaliacao/:passo` | NR1-BEN-03 ★ Questionário (render dinâmico) | RF-A01 |
| `/avaliacao/conclusao` | NR1-BEN-04 Conclusão — tela de sucesso, encerra o ciclo da avaliação | RF-J04 |
| `/avaliacao/conta` | Ponte para a conta: "E você, como está?" + convite para criar conta | RF-J01 |
| `/criar-conta` | Criação de conta em 3 passos (dados, senha, perguntas opcionais de interesse) | RF-B01 |
| `/conta-criada` | Transição "conta criada" — tela de sucesso, encerra o cadastro | — |
| `/despedida` | Saída sem conta (LGPD recusado ou conta não criada agora) | — |
| `/meu-espaco` | COL-03 ★ Home de quem já tem conta | NR1-BEN-01 |
| `/canal-escuta` | NR1-BEN-05 Canal de escuta confidencial | RF-H01 |
| `/minha-evolucao` | NR1-BEN-06 Minha evolução (P1) | RF-G01 |
| `/apoio` | COL-05 ★ Vídeos e artigos, estrutura da antiga Academia YNA sem Lives (rascunho, P1) | — |
| `/meus-dados` | COL-04 Meus dados e direitos LGPD | RNF-04 |

★ = tela-herói do conceito visual.

Bottom-nav do colaborador: Meu espaço · Avaliação · Apoio · Perfil (4 itens).

---

## Mapa rota → tela → RF — RH / Empresa (`/rh/*`)

| Rota | Tela | RF principal |
|---|---|---|
| `/rh/bem-vindo` | RH-00 Boas-vindas | — |
| `/rh/apresentacao/:passo` | RH-01 Apresentação comercial (obrigação legal, não benefício) | — |
| `/rh/convite/:token` · `/rh/convite/invalido` | Convite do usuário Master | RF-RH-01.2 |
| `/rh/cadastro` | RH-04 Cadastro da conta | — |
| `/rh/conta-criada` | RH-05 Transição — vai direto para `/rh/home`, sem onboarding de colaboradores | — |
| `/rh/home` | RH-02 ★ Home: estado do ciclo de conformidade | — |
| `/rh/colaboradores` | RH-03 Cadastro e gestão de colaboradores | RF-RH-04.x |
| `/rh/departamentos` | Estrutura de departamentos (base do mapa de calor) | RF-RH-03.1 |
| `/rh/convites` | Funil de adesão e disparo de convites | RF-RH-05.x |
| `/rh/equipe` | Equipe RH (Master/Operador) | RN-RH-03.1 |
| `/rh/conta` | Conta da empresa + avisos | — |
| `/rh/mais` | Menu "Mais" (mobile) | — |

★ = redesenhada neste recorte: a home deixou de ser sobre adesão a um benefício e passou a
responder uma pergunta só — onde estamos no ciclo de conformidade? (estado da campanha, suas
pendências, risco por dimensão, a cadeia inventário → plano de ação → relatório).

### Conformidade NR-1 no RH — 5 telas de primeira classe (`/rh/nr1/*`)

Antes deste recorte, havia **1 único item de sidebar** ("Conformidade NR-1") que abria um hub
(`NR1RhCockpit`) cheio de cards linkando para as outras 8 telas — o que fazia o módulo parecer
espremido/improvisado. A primeira reorganização (recorte original) trocou isso por 6 itens de
primeira classe com peso equivalente. **Esta revisão vai um passo além**: em vez de cada tela ser
uma ilha com links soltos cruzando para as outras, a navegação segue o caminho lógico do RH —
visão geral primeiro, depois campanhas (cada uma com seu próprio engajamento e resultado), depois
o que sustenta o PGR:

| Rota | Tela | RF |
|---|---|---|
| `/rh/nr1` | Visão geral — campanha em campo, risco por dimensão **e mapa de calor por área**, tudo numa tela | RF-I01, RF-C01/02/03/05 |
| `/rh/nr1/campanha` | Lista de todas as campanhas (a em campo em destaque, histórico abaixo) | RF-B01/B04 |
| `/rh/nr1/campanha/:campanhaId` | Detalhe de uma campanha, em abas: **Engajamento** (participação total e por área — o que a tela antiga sempre mostrava) e **Resultado** (risco por dimensão + mapa de calor *daquela* campanha, não sempre o retrato mais recente) | RF-B01/B04/C01-05, RF-RH-NR1-10 |
| `/rh/nr1/inventario` | Inventário para o PGR + exportação | RF-D01/02/03 |
| `/rh/nr1/plano-acao` | Plano de ação 5W2H + evidências | RF-E01/02 |
| `/rh/nr1/relatorio` | Relatório de gestão + rastreabilidade (Ciclos por link) | RF-F01/02/03/04 |

**"Mapa de calor" deixou de ser uma tela própria.** Antes era um item de sidebar à parte
(`/rh/nr1/mapa-calor`) que a Visão geral e o Home linkavam com um "Ver por área"/"Ver mapa de
calor" — exatamente o tipo de navegação cruzada entre módulos que ficava confusa. Agora o mapa de
calor mora só nos dois lugares que fazem sentido: sempre visível na Visão geral (campanha em
campo) e na aba Resultado de cada campanha (a heatmap real daquela campanha). A peça de UI é
compartilhada (`components/Nr1Resultado.tsx`, `MapaCalorTable`/`RiscoPorDimensaoGrid`), não
duplicada entre as duas telas.

Para o mapa de calor e o risco por dimensão serem de fato **por campanha** (não sempre o retrato
mais recente disfarçado de resultado histórico), `nr1ResultadoService.mapaCalor`/`mediaPorDimensao`
passaram a aceitar um `campanhaId` opcional, e `data/nr1Mock.ts` ganhou uma segunda tabela de
médias por departamento para a campanha encerrada de 2025 (`MEDIAS_2025_2S`), escalada a partir das
médias por dimensão já usadas em `nr1Ciclos` — para as duas fontes nunca discordarem sobre o
mesmo ciclo.

`/rh/nr1/canal` (Gestão do canal de escuta, RF-H02) **saiu da sidebar e do menu "Mais"** por pedido
explícito — não é mais um item fixo de navegação. A tela continua existindo e acessível: a Home do
RH (`RH10Home.tsx`) linka para ela contextualmente pela pendência "Casos abertos no canal de
escuta", que já existia antes e não foi tocada.

`/rh/nr1/ciclos` (comparação entre campanhas, P1) e `/rh/nr1/kit` (materiais de comunicação, P1)
continuam existindo como rotas — cada uma reachável por um link a partir da tela com que mais se
relaciona (Relatório → Ciclos; Campanha → Kit) — só não ficam mais soltas no menu principal.

Efeito colateral corrigido nesta revisão: o `NavLink` da sidebar do RH (`RhSidebar.tsx`) só tratava
`/rh/home` como correspondência exata — todo item do módulo NR-1 usava correspondência por prefixo,
então visitar qualquer subtela (`/rh/nr1/inventario`, e agora `/rh/nr1/campanha/:id`) marcava
"Visão geral" como ativo *também*, dois itens acesos ao mesmo tempo. Ajustado para `/rh/nr1`
também ser correspondência exata.

---

## Mapa rota → tela → RF — Backoffice YNA (`/mng/*`)

| Rota | Tela | RF principal |
|---|---|---|
| `/mng/login` | Login e recuperação de senha | RF-YN-01.x |
| `/mng/home` | MNG-02 ★ Cockpit de conformidade | — |
| `/mng/empresas` · `/mng/empresas/:id` | Empresas clientes: conta + contrato (dado cadastral) | RF-YN-02.x |
| `/mng/suporte` | Suporte e tickets (técnico, dúvida, cadastro, LGPD, queixa) | RF-YN §8.9 |
| `/mng/gestores` | Usuários YNA e papéis | RF-YN §8.1 |
| `/mng/notificacoes` | Notificações do backoffice | — |
| `/mng/mais` | Menu "Mais" (mobile) | — |
| `/mng/nr1/modelos` · `/mng/nr1/modelos/:id` · `/mng/nr1/modelos/:id/versoes` | Modelos de avaliação NR-1: lista, editor, versões | RF-YN-NR1-01/02/05 |
| `/mng/nr1/nucleo` | Núcleo obrigatório | RF-YN-NR1-03/04 |

★ = redesenhada neste recorte: o cockpit deixou de ser sobre sessões/profissionais/repasse
financeiro e passou a mostrar empresas ativas, campanhas em campo, adesão média, versões
publicadas do instrumento, empresas sem inventário gerado, casos abertos no canal de escuta, e um
indicador agregado (nunca por pessoa) de potencial de adesão futura a um serviço de cuidado que
ainda não existe no produto (ver "Ajustes desta revisão" abaixo).

**O que saiu por completo deste recorte** (não são mais telas nem rotas): toda a jornada do
Profissional (`/pro/*`, 49 telas), a camada de cuidado do colaborador (matches, triagem, roda da
vida, agendamento, sessões, check-ins, conquistas, Nyna), e no backoffice: profissionais, tipos de
profissional, sessões, curadoria de matches, Academia YNA, modelos de documentos, financeiro de
notas fiscais e planos comerciais. No RH: indicadores de bem-estar e financeiro/parcelas.
"Beneficiário" deixou de existir como conceito — a pessoa é um **colaborador**.

---

## Módulo de Conformidade NR-1 (riscos psicossociais)

Atravessa as três jornadas. Tipos em `src/types/index.ts` (prefixo `Nr1`), mocks em
`src/data/nr1Mock.ts`, serviços em `src/services/nr1.ts`, vocabulário visual compartilhado em
`src/lib/nr1.ts`. **Este módulo já estava pronto e validado antes do recorte — não foi
reescrito**, só teve a navegação ao redor dele reorganizada (ver acima) e um punhado de nomes
ajustados para a terminologia "colaborador" (ex.: `nr1BeneficiarioService` →
`nr1ColaboradorService`, sem mudança de comportamento).

**O instrumento não é um formulário fixo no código.** É um *modelo* versionado: a YNA mantém o
Modelo YNA base e deriva modelos por cliente; o RH apenas seleciona qual modelo + versão a
campanha aplica; o colaborador responde ao que a campanha registrou. Trocar o questionário no
backoffice muda a tela do colaborador sem tocar em código.

### Regras que a UI e o serviço aplicam juntos

Estas quatro moram na camada de serviço, não só na tela — a API real herda o mesmo contrato:

- **Núcleo obrigatório não é removível.** Modelos derivados acrescentam itens, nunca removem os
  do núcleo. A trava vale inclusive para o operador do backoffice: é proteção contra erro humano,
  não contra o cliente.
- **Versão publicada é imutável.** Editar uma versão publicada cria uma nova versão em rascunho
  (`nr1ModeloService.salvarVersao`); a publicada permanece intacta e as campanhas que a aplicaram
  não mudam de instrumento no meio do ciclo.
- **k-anonimato ≥ 4.** Recortes com menos de 4 respondentes chegam ao RH já protegidos
  (`protegido: true`, células nulas) — a tela não tem como vazar. Os recortes ocultos aparecem
  rotulados como protegidos, em vez de sumirem da tabela.
- **Ação só conclui com evidência.** `nr1AcaoService.concluir` recusa ação sem anexo: "evidência
  de execução registrada" é o que a fiscalização verifica.

### Estado

- `AppContext.nr1` — avaliação em andamento do colaborador (consentimento e respostas), porque ela
  atravessa intro → dimensões → conclusão e pode ser retomada.
- `RhContext.instrumentoNr1` — modelo + versão + protocolo aplicados na campanha corrente, citados
  pelo inventário e pelo relatório.
- Os modelos e o núcleo **não** foram duplicados no `MngContext`: vivem em `nr1ModeloService` e
  cada tela do backoffice os lê via `useService`, para não criar duas fontes de verdade sobre o
  mesmo dado editável.

---

## Ajustes desta revisão (mudam decisões do recorte original)

Duas mudanças de escopo pedidas depois da primeira versão deste recorte, registradas aqui com
franqueza porque mudam uma trava de produto:

1. **A avaliação passou a ser respondida antes da criação de conta**, não depois. Fluxo:
   convite → LGPD → transição "tudo certo" (`/comecar`) → avaliação (ainda anônimo) → conclusão
   (tela de sucesso, `/avaliacao/conclusao`) → ponte para a conta (`/avaliacao/conta`) → criação de
   conta em 3 passos (`/criar-conta`) → transição "conta criada" (`/conta-criada`) → `/meu-espaco`.
   Quem recusa em qualquer ponto sai por `/despedida`, sem penalidade. Cada transição de ciclo
   (LGPD → avaliação, avaliação → conta, conta → plataforma) tem a sua própria tela de sucesso, no
   mesmo padrão visual das demais transições de onboarding — nenhuma tela mistura "fechar um ciclo"
   com "decidir o próximo passo".
2. **A ponte para a conta (`/avaliacao/conta`) voltou a mencionar cuidado futuro** — "teleatendimento
   com profissionais selecionados chega em breve". Isso **reabre, só neste ponto específico**, a
   trava "nenhuma promessa de atendimento" do recorte original: em nenhum outro lugar do produto
   essa promessa se repete (ver grep de resíduo na Definição de Pronto). As duas perguntas
   opcionais de interesse no serviço e de tratamento em curso saíram da conclusão da avaliação e
   viraram o **Passo 3 da criação da conta** (`/criar-conta`, substituindo a antiga etapa de foto do
   cadastro) — fazem mais sentido como parte do perfil de quem já decidiu criar conta do que
   misturadas ao encerramento anônimo da avaliação.

Isso muda o status da pendência **RF-J01 (ponte opt-in ao cuidado)**: deixa de ser "parcial: sem
camada de cuidado" e passa a **"parcial: promessa de teleatendimento futuro comunicada + captura
opcional de interesse/perfil de tratamento na criação da conta, ainda sem camada de cuidado
implementada"**. RF-J03 (medir conversão conformidade → cuidado) continua fora — não há destino
para converter.

3. **A home do colaborador (`/meu-espaco`) virou uma biblioteca de conteúdo**, em vez de um grid de
   4 atalhos. Estrutura: convite para a avaliação (só aparece quando há campanha ativa e a pessoa
   ainda não respondeu; usa a variante `gradient` do `Card`, mais destacada visualmente), vídeos em
   destaque, grid de vídeos filtrável por categoria e por palavra-chave, e uma coluna de artigos —
   mesma estrutura da antiga "Academia YNA" do profissional, conteúdo totalmente novo (ver
   `data/conteudoApoioMock.ts`). "Minha evolução" e "Canal de escuta" saíram da home (não eram mais
   destaque); o bloco "Sua avaliação" que as recebia em `/meus-dados` foi removido em seguida — as
   duas rotas (`/minha-evolucao`, `/canal-escuta`) continuam existindo e funcionando, mas **sem
   nenhum ponto de entrada na navegação** no momento (só acessíveis por URL direta).

4. **O item "Avaliação" da navegação passou a ter estado real, em vez de sempre reabrir o
   consentimento.** As avaliações NR-1 são periódicas: uma campanha fica em campo por um tempo, a
   pessoa responde (ou não), e depois não há nada até o próximo ciclo. Antes, clicar em "Avaliação"
   sempre caía em `/avaliacao/intro`, mesmo sem campanha ativa ou já tendo respondido. Agora
   `/avaliacao` (COL-06) é um portão: se há campanha ativa e não respondida, segue direto para ela;
   senão, mostra um estado vazio explicando que as avaliações são periódicas. O convite na home
   (`NR1AvaliacaoCard`) e esse portão compartilham a mesma verificação — o hook
   `useAvaliacaoAtiva` (`src/hooks/useAvaliacaoAtiva.ts`) — para nunca discordarem sobre o mesmo
   estado. O convite também ganhou mais peso visual: um CTA em pill branco ("Responder agora" /
   "Continuar"), não só uma seta.

   Para revisar as quatro combinações (home/Avaliação × com/sem campanha ativa) sem depender do
   estado real, use `?campanha=ativa` (força ativa) ou `?campanha=nenhuma` (força vazia) na URL de
   `/meu-espaco` ou de `/avaliacao` — o parâmetro é lido pelo mesmo hook nos dois lugares.

5. **Vídeo e artigo da biblioteca de apoio abrem com a mesma interação da antiga Academia YNA do
   profissional**, não mais num `Modal` genérico:
   - **Vídeo** (`components/VideoImersivo.tsx`) abre em tela cheia (portal, como
     `Pro29CursoDetalhe/CursoPlayerModal` na `main`): barra superior com trilha ("Apoio › título") e
     fechar, vídeo em destaque com barra de controles mock, e uma lista "Mais vídeos" (sidebar fixa
     no desktop, lista abaixo do conteúdo no mobile) para continuar navegando sem sair do modo
     imersivo — inclusive um atalho "Próximo vídeo". Diferente da referência, **não há currículo,
     progresso nem "concluir aula"**: são vídeos avulsos, não um curso com aulas, e não existe
     histórico real por trás disso para simular (mesma régua de "sem progresso falso" do resto da
     biblioteca).
   - **Artigo** (`components/ArtigoModal.tsx`) abre num `Sheet` (como `Pro30Artigo` na `main`), com
     conteúdo bem mais rico que antes: imagem de destaque, badge de categoria, meta de
     autor/data/tempo de leitura, e corpo em blocos tipados (`ArtigoBloco` em
     `data/conteudoApoioMock.ts`) — parágrafo, subtítulo, lista, citação, imagem e vídeo embutido no
     meio do texto, não só texto corrido.

6. **`/apoio` (COL-05) foi reconstruída com a mesma estrutura da antiga Academia YNA do
   profissional** (`Pro21Universidade.tsx` na `main`), não mais a lista simples de 4 peças de texto
   que tinha antes: abas "Todos" / "Vídeos" / "Artigos", carrossel paginado "Em destaque"
   (`components/Carrossel.tsx`, mesmo mecanismo de `CursoCarrossel`), carrossel "Continue
   assistindo" (vídeos com `assistidoPct` entre 1 e 99, ver `data/conteudoApoioMock.ts`, cartão com
   barra de progresso via `VideoProgressCard`), painel "Explorar vídeos" com busca + filtro por
   categoria + paginação, e sidebar "Últimos artigos" na aba "Todos" (com "Ver todos" levando à aba
   "Artigos"). Uma diferença deliberada em relação à referência: **sem a linha de StatCards de
   progresso** ("Cursos finalizados", "Tempo de estudo", "Certificados") — não há um "curso" para
   se formar nem certificado para emitir; "Continue assistindo" foi mantida porque o progresso de
   visualização em si (quanto de um vídeo avulso já foi visto) não é uma credencial simulada, ao
   contrário das métricas de conclusão de curso. Também **sem aba/conteúdo de Lives** — não existe
   esse conceito neste recorte.

   O aviso de rascunho/curadoria clínica e o box do CVV, que existiam na versão anterior da tela,
   foram removidos por pedido explícito — o CVV (188) segue mencionado em `NR1BenCanalEscuta.tsx`
   e em `Ben05Despedida.tsx`.

7. **`/rh/conta-criada` (RH-05) não leva mais ao onboarding de colaboradores.** Antes, o botão
   único da tela ("Cadastrar colaboradores") ia para `/rh/onboarding` (RH-06, wizard de 3 passos:
   método de cadastro → importação/inclusão → envio de convites). Isso saiu do fluxo por decisão
   explícita: a empresa precisa configurar a pesquisa antes de cadastrar o time, então cadastrar
   colaboradores deixou de fazer sentido como o passo imediatamente seguinte à criação da conta. O
   botão agora é "Acessar painel da empresa" e vai direto para `/rh/home`. A tela `RH06Onboarding.tsx`
   e a rota `/rh/onboarding` foram **removidas** (não apenas desconectadas) — eram o único
   consumidor daquele wizard, e cadastrar/importar colaboradores continua disponível a qualquer
   momento em `/rh/colaboradores` (RH11Colaboradores.tsx já implementa a mesma criação individual e
   importação em lote, independentemente).

8. **A seção de Conformidade NR-1 do RH foi reestruturada** — ver a seção própria acima
   ("Conformidade NR-1 no RH"). Resumo: "Mapa de calor" deixou de ser uma tela/item de sidebar à
   parte (fundida em Visão geral + aba Resultado de cada campanha); "Campanha de avaliação" virou
   "Campanhas", uma lista de todas as campanhas com detalhe em abas (Engajamento/Resultado) por
   `campanhaId`; e o mapa de calor/risco por dimensão passaram a ser genuinamente por campanha, não
   sempre o retrato mais recente. Motivo: a versão anterior tinha itens de sidebar cruzando uns para
   os outros via links soltos dentro de cada tela — navegação por link, não por hierarquia — o que
   o pedido descreveu como "muito confusa".

---

## O que está mockado e como trocar

| Mock | Onde | Como trocar |
|---|---|---|
| Validação de convite do colaborador | `inviteService.validate` | `GET /invites/:token` |
| Colaboradores, departamentos, equipe RH, convites | `data/rhMock.ts` via `services/rh.ts` | Endpoints REST do RH (mesma assinatura) |
| Empresas clientes, suporte, gestores YNA, cockpit | `data/mngMock.ts` via `services/mng.ts` | Endpoints REST do backoffice |
| Modelos e versões do questionário NR-1 | `nr1Modelos` em `data/nr1Mock.ts` via `nr1ModeloService` | `GET/POST /nr1/modelos`, `/nr1/modelos/:id/versoes` |
| Campanha NR-1 e participação por área | `nr1Campanhas` via `nr1CampanhaService` | `GET /nr1/campanhas`, `POST /nr1/campanhas/:id/lembretes` |
| Mapa de calor e médias por dimensão, por campanha | `nr1ResultadoService.mapaCalor(campanhaId?)` / `mediaPorDimensao(campanhaId?)` | `GET /nr1/campanhas/:id/mapa-calor` — **o k-anonimato deve ser aplicado no servidor**, não na tela |
| Inventário para o PGR | `nr1ResultadoService.inventario` | `GET /nr1/inventario` |
| Exportações (inventário PDF/planilha, relatório PDF) | retornam só o nome do arquivo | `POST /nr1/exportacoes` com geração server-side |
| Plano de ação 5W2H e evidências | `nr1AcaoService` | `GET/POST /nr1/acoes`, upload real de anexo |
| Canal de escuta (relatos e andamentos) | `nr1CanalService` | `POST /nr1/relatos` — **sem vincular identidade do relator** |
| Respostas da avaliação do colaborador | `nr1ColaboradorService.enviar` só incrementa o contador | `POST /nr1/campanhas/:id/respostas`, anônimo, registrando modelo+versão |
| Sessão anônima do colaborador (token de convite → conta) | `AppContext.sessaoToken` (memória) | Persistir server-side e vincular à conta criada, sem nunca expor o vínculo a serviços do RH |
| Interesse em cuidado futuro (agregado comercial) | Capturado no Passo 3 de `/criar-conta`, guardado em `AppContext.perfilInteresse`; `MngCockpit.interesseCuidado` ainda é mock estático, não lê essa captura | Persistir a resposta do Passo 3 no cadastro da conta, depois agregar server-side para alimentar o cockpit, nunca por pessoa |
| Vídeos e artigos de apoio da home (`/meu-espaco`) | `data/conteudoApoioMock.ts` (estático, sem player real; artigo em blocos tipados `ArtigoBloco`) | CMS/endpoint de conteúdo, com upload de vídeo real |

---

## Responsividade

| Breakpoint | Layout |
|---|---|
| < 768px (mobile) | Bottom navigation (4 itens no colaborador, 5 no RH/backoffice + "Mais") |
| 768px–1023px (tablet) | Fluxos de foco em coluna `max-w-xl`, grids de 2 colunas |
| ≥ 1024px (desktop) | Sidebar fixa à esquerda, conteúdo `max-w-5xl` |

Sem botão de pânico/emergência em nenhuma jornada — não há mais camada de cuidado para acionar.

---

## Pendências herdadas (não resolvidas no código)

- **Validação clínica dos itens do Modelo YNA**: os 34 itens em `data/nr1Mock.ts` vêm do rascunho
  v0.3 do questionário — são adaptações em português do HSE Indicator Tool e do COPSOQ, **ainda
  sem tradução transcultural validada**. Não usar em produção antes da revisão clínica e da
  retrotradução.
- **Núcleo obrigatório a confirmar**: os 10 itens marcados como núcleo são a *proposta* do
  rascunho. A definição final depende da curadoria clínica.
- **Itens sensíveis (RL10/RL11, assédio)**: decidir com a clínica se permanecem no questionário
  anônimo, migram para o canal de escuta, ou ambos.
- **Fórmula probabilidade × severidade e pontos de corte**: transparentes de propósito, pendentes
  de revisão de SST.
- **Textos legais** (consentimento na intro da avaliação, sigilo do canal de escuta): placeholders
  no tom da marca, pendentes de jurídico/LGPD.
- **Conteúdo de apoio (`/apoio` e a biblioteca de vídeos/artigos de `/meu-espaco`)**: rascunho,
  pendente de curadoria clínica antes de qualquer piloto real.
- **Governança interna da YNA**: quem cria e aprova modelos derivados de cliente — decisão de
  produto, não de código.
- **Integração eSocial S-2240, white-label e benchmarks setoriais**: fora de escopo (eram Could).
- **RF-C04 (cruzar com absenteísmo, afastamento, turnover)**: fora deste ciclo — depende de o
  cliente fornecer os dados.
