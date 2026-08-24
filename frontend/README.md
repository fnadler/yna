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
| `/bem-vindo` | COL-00 Boas-vindas — apresentação da YNA, antes do LGPD | — |
| `/apresentacao/:passo` | COL-00 Apresentação (3 slides) | — |
| `/sigilo` | COL-02 Consentimento LGPD | RNF-01 |
| `/comecar` | Transição "tudo certo" — fecha o consentimento, abre a avaliação | — |
| `/avaliacao` | COL-06 Portão: segue para `/avaliacao/1` se há campanha ativa e não respondida, senão mostra estado vazio | RF-A02 |
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
visão geral primeiro, depois os ciclos de avaliação (cada um com seu próprio engajamento e
resultado), depois o que sustenta o PGR:

| Rota | Tela | RF |
|---|---|---|
| `/rh/nr1` | Visão geral — ciclo em campo, risco por dimensão **e mapa de calor por área**, tudo numa tela | RF-I01, RF-C01/02/03/05 |
| `/rh/nr1/ciclos` | Lista de todos os ciclos de avaliação (o em campo em destaque, histórico abaixo) — cada card usa o mesmo componente de estado da Home | RF-B01/B04 |
| `/rh/nr1/ciclos/:campanhaId` | Detalhe de um ciclo, em abas: **Engajamento** (participação total e por área — o que a tela antiga sempre mostrava) e **Resultado** (risco por dimensão + mapa de calor *daquele* ciclo, não sempre o retrato mais recente) | RF-B01/B04/C01-05, RF-RH-NR1-10 |
| `/rh/nr1/inventario` | Inventário de Riscos: exportação para o PGR, cadastro manual de risco, status/tendência/sugestão por risco | RF-D01/02/03 |
| `/rh/nr1/plano-acao` | Plano de ação 5W2H + evidências, agora com versionamento de plano | RF-E01/02 |
| `/rh/nr1/relatorio` | Relatório de gestão + rastreabilidade | RF-F01/02/03/04 |

**"Campanhas" foi renomeada para "Ciclos de avaliação" e absorveu a antiga tela "Ciclos e
reavaliação"** (comparação de dimensões entre campanhas, que antes vivia sozinha em
`/rh/nr1/ciclos`, RF-G01/02/03). As duas eram, na prática, a mesma pergunta — "como estamos indo,
campanha a campanha?" — em dois lugares diferentes do menu; exatamente o tipo de navegação cruzada
e confusa que motivou esta reestruturação. Agora é uma única tela (`NR1RhCiclos.tsx`): a lista
(`/rh/nr1/ciclos`) traz a lista de ciclos; o detalhe (`/rh/nr1/ciclos/:campanhaId`) traz as abas
Engajamento/Resultado. A "evolução por dimensão" que a antiga tela de comparação mostrava mudou de
lugar duas vezes em revisões seguintes: primeiro saiu da lista de Ciclos e foi para o Inventário de
riscos (item 11), depois saiu do Inventário também e não voltou a existir em nenhuma tela do RH
(item 12) — ver "Ajustes desta revisão". A comparação individual entre ciclos continua coberta do
lado do colaborador, em `/minha-evolucao` (RF-G01), só não há mais o equivalente agregado por
dimensão do lado do RH. Só a identidade voltada ao RH mudou (rótulo do menu, rotas, títulos) — o
tipo de dado por trás continua `Nr1Campanha`; renomear isso em todo o módulo (inventário, relatório,
trilha, serviços) seria uma reforma cosmética de grande alcance para um pedido que era sobre
navegação, não sobre o nome do
dado.

**"Mapa de calor" deixou de ser uma tela própria.** Antes era um item de sidebar à parte
(`/rh/nr1/mapa-calor`) que a Visão geral e o Home linkavam com um "Ver por área"/"Ver mapa de
calor" — exatamente o tipo de navegação cruzada entre módulos que ficava confusa. Agora o mapa de
calor mora só nos dois lugares que fazem sentido: sempre visível na Visão geral (ciclo em campo) e
na aba Resultado de cada ciclo (a heatmap real daquele ciclo). A peça de UI é compartilhada
(`components/Nr1Resultado.tsx`, `MapaCalorTable`/`RiscoPorDimensaoGrid`), não duplicada entre as
duas telas.

Para o mapa de calor e o risco por dimensão serem de fato **por ciclo** (não sempre o retrato mais
recente disfarçado de resultado histórico), `nr1ResultadoService.mapaCalor`/`mediaPorDimensao`
passaram a aceitar um `campanhaId` opcional, e `data/nr1Mock.ts` ganhou uma segunda tabela de
médias por departamento para a campanha encerrada de 2025 (`MEDIAS_2025_2S`), escalada a partir das
médias por dimensão já usadas em `nr1Ciclos` — para as duas fontes nunca discordarem sobre o
mesmo ciclo.

`/rh/nr1/canal` (Gestão do canal de escuta, RF-H02) **saiu da sidebar e do menu "Mais"** por pedido
explícito — não é mais um item fixo de navegação. A tela continua existindo e acessível: a Home do
RH (`RH10Home.tsx`) linka para ela contextualmente pela pendência "Casos abertos no canal de
escuta", que já existia antes e não foi tocada.

`/rh/nr1/kit` (materiais de comunicação, P1) continua existindo como rota — reachável por um link
a partir do detalhe de um ciclo — só não fica mais solta no menu principal.

Efeito colateral corrigido nesta revisão: o `NavLink` da sidebar do RH (`RhSidebar.tsx`) só tratava
`/rh/home` como correspondência exata — todo item do módulo NR-1 usava correspondência por prefixo,
então visitar qualquer subtela (`/rh/nr1/inventario`, e agora `/rh/nr1/ciclos/:id`) marcava
"Visão geral" como ativo *também*, dois itens acesos ao mesmo tempo. Ajustado para `/rh/nr1`
também ser correspondência exata.

### Evolução de riscos e versionamento de planos de ação

Pedido para dar à plataforma uma camada funcional de "como o risco evolui entre ciclos, e o que
fazer a respeito" — estendendo o módulo NR-1 existente (não um sistema paralelo): os tipos, mocks e
telas de risco/plano de ação já existiam (`Nr1RiscoInventario`, `Nr1Acao`, `NR1RhInventario.tsx`,
`NR1RhPlanoAcao.tsx`); esta revisão os aprofunda em vez de duplicá-los.

- **`Nr1RiscoCiclo`** (novo tipo, `types/index.ts`) é um ponto no histórico de um risco — sua
  média/nível numa campanha específica. O valor **é o mesmo da célula correspondente no mapa de
  calor** daquela campanha (`data/nr1Mock.ts`, `nr1RiscosCiclos`, derivado de `MEDIAS_POR_CAMPANHA`
  + `RISCOS`) — nunca um número novo por trás.
- **`nr1AnalisarEvolucao`** (`lib/nr1.ts`) é a lógica de decisão, pura e testável: compara duas
  leituras consecutivas (nível + média) e devolve tendência (melhorando/estável/piorando), delta e
  uma **sugestão** de próxima ação (manter, manter com monitoramento, investigar, revisar plano,
  escalar, encerrar) — nunca uma conclusão. "Este risco está sob controle" é leitura do SST; a
  plataforma só aponta "o nível é X, a direção é Y, considere Z".
- **`Nr1RiscoInventario`** ganhou `status` (identificado/controlado/regredido/eliminado/
  monitorando) + `tendencia`/`variacaoPontos`/`acaoRecomendada` do ciclo mais recente, calculados
  em `nr1Inventario()`. O card em `/rh/nr1/inventario` mostra os badges; o detalhe (Sheet) mostra o
  histórico completo ciclo a ciclo via `nr1ResultadoService.riscoCiclos(riscoId)`.
- **`Nr1Acao` ganhou versionamento**: `versao`, `versaoAnteriorId?`, `motivoRevisao?`,
  `efetividade?`. Revisar um plano (`nr1AcaoService.revisar`) nunca edita a versão anterior — cria
  uma nova ação com `versao` incrementada, apontando para a que substitui. Em
  `/rh/nr1/plano-acao`, só a versão vigente de cada linhagem aparece na lista principal (uma ação
  que virou `versaoAnteriorId` de outra some da lista, mas não do produto); quando o risco de
  origem sugere "revisar plano" ou "escalar", um aviso contextual oferece o botão "Revisar plano".
  O detalhe de uma versão mostra as anteriores da mesma linhagem
  (`nr1AcaoService.versoes(acaoId)`, que segue a cadeia real de `versaoAnteriorId` — não confundir
  com "toda ação deste risco": um risco pode ter várias ações distintas, cada uma com sua própria
  linha de versões, e elas não se misturam).

**Fora do escopo desta revisão, deliberadamente**: um runner de testes automatizados
(vitest/jest). O projeto inteiro, até aqui, verifica por `tsc -b` + `npm run build` + grep de
resíduo + Playwright manual — nenhum arquivo de teste existe hoje. Introduzir um framework de
testes só para esta lógica de decisão seria infraestrutura nova, não extensão do módulo; a lógica
foi verificada manualmente (incluindo os três cenários de referência: risco melhora e sai da faixa
grave, risco estagna na faixa grave, risco piora) e documentada com comentários explicando cada
ramo da decisão, mas não há suíte de testes rodável por `npm test`.

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
   parte (fundida em Visão geral + aba Resultado de cada ciclo); "Campanha de avaliação" virou uma
   lista de todas as campanhas com detalhe em abas (Engajamento/Resultado) por `campanhaId`; e o
   mapa de calor/risco por dimensão passaram a ser genuinamente por campanha, não sempre o retrato
   mais recente. Motivo: a versão anterior tinha itens de sidebar cruzando uns para os outros via
   links soltos dentro de cada tela — navegação por link, não por hierarquia — o que o pedido
   descreveu como "muito confusa".

9. **Essa seção foi renomeada de novo, e ganhou uma camada de evolução de risco** — pedido separado,
   depois do item 8: "Campanhas" virou **"Ciclos de avaliação"**, absorvendo a antiga tela "Ciclos e
   reavaliação" (comparação de dimensões entre campanhas, que vivia sozinha em `/rh/nr1/ciclos` — as
   duas eram a mesma pergunta em dois lugares do menu). Além da navegação, o Inventário de riscos e
   o Plano de ação ganharam uma camada funcional de evolução entre ciclos e versionamento de plano
   (status/tendência/sugestão por risco; múltiplas versões de um plano, cada uma com efetividade e
   motivo de revisão) — ver a seção própria acima ("Evolução de riscos e versionamento de planos de
   ação") para o detalhe completo, incluindo o que ficou deliberadamente fora (testes automatizados).

10. **O card de estado do ciclo (participação, prazo) saiu da Visão geral do módulo NR-1
    (`NR1RhCockpit.tsx`) — duplicava o mesmo card da Home da área logada (`RH10Home.tsx`).**
    `NR1RhCockpit.tsx` continua buscando a campanha ativa em silêncio (sem renderizar nada em caso
    de erro), só para publicar o instrumento aplicado no `RhContext` (RF-F02).

    O card em si ganhou três coisas, e virou um componente compartilhado
    (`components/Nr1CicloStatusCard.tsx`) usado em **dois** lugares — a Home (sempre o ciclo em
    campo) e a aba Engajamento do detalhe de um ciclo em `/rh/nr1/ciclos/:campanhaId` (o ciclo que
    estiver aberto, em campo ou encerrado) — para as duas telas nunca discordarem sobre o mesmo
    ciclo:
    - Rótulo "Campanha em campo" → **"Ciclo em andamento"**.
    - **Meta de participação (75%)** marcada como uma linha vertical sobre a barra de progresso,
      com rótulo "Meta 75%" logo abaixo — e, quando a participação está abaixo da meta, um aviso
      "Faltam N respostas para atingir a meta de 75%" (N = respostas necessárias − respostas
      atuais) e a barra em tom de alerta (`bg-warning` em vez de `bg-success`).
    - **Prazo e contagem regressiva**: "Prazo: até DD/MM" + "N dias restantes", calculado entre
      `NR1_TODAY` (a data mock de "hoje" deste protótipo — nunca `Date.now()`) e o fim da campanha.

    **Ciclo encerrado tem uma segunda variante do card** (mesmo componente, `campanha.status`
    decide qual): mostra % de engajamento e "Encerrado em DD/MM", mas sem a linha de meta, sem
    "faltam N respostas" e sem contagem de dias — meta e prazo só fazem sentido enquanto o ciclo
    ainda está correndo. Por pedido explícito, este protótipo só cobre o cenário de ciclo encerrado
    **com a meta atingida** (barra sempre em `bg-success`); não há aqui uma variação visual para
    "encerrado abaixo da meta".

    A participação exibida no card do ciclo em campo (63%) é um **valor fixo, só para demonstrar o
    cenário abaixo da meta** — o real (`campanha.respostas`) é 132/177 ≈ 75%, em cima da meta, o
    que não mostra o alerta. Só a contagem de respostas é simulada; o total de elegíveis continua o
    headcount real. Como o card agora também aparece no detalhe do próprio ciclo, a
    "Participação por área" logo abaixo dele nessa tela **continua mostrando os números reais**
    (soma 132, não 112) — só o card no topo está no cenário simulado. Um efeito colateral aceito,
    não um bug: o pedido era para levar o mesmo card ao detalhe, e as duas fontes (card vs. lista
    por área) já eram independentes uma da outra antes disso.

    Dois bugs pré-existentes, achados ao verificar esta mudança visualmente e corrigidos juntos:
    o aviso "o ciclo já está em campo" (ao lado do botão "Trocar" instrumento) aparecia também para
    ciclos encerrados, com texto factualmente errado; e o botão "Lembrar N áreas" (reenviar
    lembrete de resposta) aparecia mesmo para ciclos já encerrados, o que não faz sentido
    operacional. Os dois agora checam `campanha.status === 'em-campo'` antes de aparecer.

11. **Três ajustes na tela Ciclos de avaliação, pedidos numa revisão seguinte:**
    - **"Evolução por dimensão" saiu da lista de Ciclos e foi para o Inventário de riscos**
      (`NR1RhInventario.tsx`) — mais perto de onde o RH já olha risco por dimensão/área e por
      risco individual, em vez de misturada com a lista de ciclos em si. A função
      `EvolucaoPorDimensao` (e seu helper `delta0Positivo`) migraram de arquivo, sem mudança de
      lógica — mesma comparação entre os dois ciclos mais recentes, mesmo aviso de troca de
      instrumento.
    - **Os cards da lista de Ciclos agora usam o mesmo componente do detalhe**
      (`Nr1CicloStatusCard`, ver item 10) em vez de um card próprio (`CampanhaCard`, removido). O
      ciclo ativo se destaca só pela **espessura da borda** (`border-2 border-primary`) — o fundo
      continua o mesmo `bg-surface` sólido dos ciclos já encerrados, sem tingimento de cor. Antes,
      "destaque" também mudava o fundo (`bg-primary-50/40`); isso foi removido por pedido
      explícito.
    - **O marcador de meta (75%) agora aparece também no card de ciclo encerrado** — na lista e no
      próprio detalhe do ciclo (aba Engajamento) — não só no card do ciclo em campo. Continua sem
      "faltam N respostas" nem contagem de dias (não fazem sentido para um ciclo já passado); só a
      linha de referência visual + rótulo "Meta 75%" foram acrescentados, coerente com a decisão
      já registrada no item 10 de tratar todo ciclo encerrado como tendo atingido a meta.

12. **Quatro ajustes na tela Inventário (renomeada de "Inventário para o PGR" para "Inventário de
    Riscos"), numa revisão seguinte:**
    - **"Evolução por dimensão" saiu do Inventário e não voltou a existir em nenhuma tela do RH** —
      a mesma seção que tinha acabado de chegar aqui no item 11 foi removida de novo, desta vez sem
      um novo destino indicado. As funções `EvolucaoPorDimensao`/`delta0Positivo` foram apagadas
      (não só desconectadas); o `useService` de `nr1ResultadoService.ciclos()` que as alimentava
      saiu do arquivo junto. A comparação individual entre ciclos permanece do lado do colaborador,
      em `/minha-evolucao`.
    - **Botão "Adicionar risco"**, que abre um Sheet (`AdicionarRiscoForm`) para cadastrar um risco
      manualmente — o caso de um risco identificado por auditoria ou observação direta do SESMT,
      não pela pesquisa. Pede os mesmos sete campos do GRO que já apareciam no detalhe do risco
      (dimensão, grupo exposto, fator, danos, probabilidade, severidade, controles), com uma
      prévia do nível calculado (probabilidade × severidade) enquanto a pessoa preenche. Um risco
      recém-criado nasce sem histórico de ciclos, então aparece como **"Identificado"**, sem
      tendência nem sugestão — isso já é o comportamento natural de `nr1Inventario()`/
      `nr1AnalisarEvolucao` para qualquer risco com menos de 2 pontos de histórico, não precisou de
      um caso especial. Camada de dados: `RISCOS` (antes privado a `data/nr1Mock.ts`) e o tipo
      `RiscoSeed` foram exportados, e `nr1ResultadoService.adicionarRisco` empurra o novo risco
      nesse array — `nr1Inventario()` já o inclui na próxima chamada, sem cache para invalidar.
    - **Ícone do botão "Ver plano de ação" trocado** — usava `ph:plus-bold`, o mesmo ícone de
      "Definir ação" (quando o risco ainda não tem nenhuma ação vinculada), o que também colidia
      visualmente com o novo botão "Adicionar risco" no topo da página. Agora usa `ph:list-checks-
      bold` quando já existem ações vinculadas (mesmo ícone já usado no chip "N ações vinculadas"
      um pouco acima, no mesmo card); "Definir ação" continua com `ph:plus-bold`, que ali é
      genuinamente um "adicionar".

13. **Cards de "Risco por dimensão" e células do mapa de calor, na aba Resultado do detalhe de um
    ciclo, agora abrem a lista de perguntas por trás daquele número.** Clicar num card (visão da
    empresa inteira) ou numa célula do mapa de calor (visão só daquela área) abre um Sheet
    (`Nr1PerguntasSheet`) com cada pergunta da dimensão e sua pontuação, ordenadas da pior para a
    melhor. `RiscoPorDimensaoGrid`/`MapaCalorTable` (`components/Nr1Resultado.tsx`) ganharam
    `onClickDimensao`/`onClickCelula` opcionais — só a aba Resultado de `NR1RhCiclos.tsx` os passa;
    a Visão geral (`NR1RhCockpit.tsx`), que usa os mesmos dois componentes, continua estática, sem
    mudança de comportamento lá (célula/card sem `onClick` renderiza como antes, não como botão).

    **Decisão de cálculo, pedida explicitamente para avaliação:** a pontuação de cada pergunta usa
    a mesma escala já usada para a dimensão (`nr1NivelPorMedia`, 1-5 onde 5 é desejável) —
    **não** probabilidade × severidade. O motivo: essa segunda é a lógica do GRO
    (`nr1NivelPorProduto`), usada só no Inventário de riscos para o RH classificar um FATOR de
    risco já identificado (`Nr1RiscoInventario.probabilidade`/`severidade`, um julgamento
    qualitativo, não uma resposta de questionário). O instrumento de avaliação psicossocial usa
    outra escala (`Nr1EscalaId`): cada item é respondido em frequência OU concordância, invertido
    quando `direcao === 'reverso'`, e a dimensão é a média desses itens — não existe eixo de
    severidade por pergunta neste questionário. Aplicar probabilidade × severidade aqui misturaria
    dois métodos que o resto do módulo mantém deliberadamente separados; o Sheet explica isso na
    própria tela, não só no código.

    Como não existe resposta individual por pergunta mockada (só a média agregada por
    dimensão/área), os valores por pergunta são **distribuídos de forma determinística**
    (`nr1DistribuirPorItem`, `lib/nr1.ts`, novo `nr1ResultadoService.itensPorDimensao`) de modo que
    a média das perguntas bata exatamente com a média já publicada — nunca um número à parte. A
    função usa um hash estável (mesma pergunta + mesmo escopo sempre gera o mesmo valor, sem
    `Math.random()`) para não mudar a cada clique.

    **Bug encontrado e corrigido durante a verificação**: a primeira versão do hash (FNV-1a puro)
    não espalhava bem quando as strings de entrada compartilhavam um prefixo longo e diferiam só
    no final — exatamente o caso aqui (mesmo `campanhaId-dimensaoId-departamentoId`, variando só o
    id do item) — e quase todas as perguntas saíam com a mesma pontuação. Corrigido acrescentando
    o finalizador de avalanche do MurmurHash3 (`fmix32`) depois do FNV-1a.

14. **Nova aba "Riscos sugeridos" no detalhe de um ciclo (`NR1RhCiclos.tsx`)** — triagem assistida,
    **nunca diagnóstica**: 7 leituras de padrão psicossocial (`data/nr1RiscosSugeridosMock.ts`,
    tipos `Nr1RiscoSugerido`/`Nr1RiscoSugeridoLeitura`), cada uma com possível enquadramento
    CID-11, calculadas a partir do MESMO dado do "Risco por dimensão"/mapa de calor daquele ciclo
    (`nr1ResultadoService.riscosSugeridos`) — nunca um número à parte. Cada card mostra a média e o
    nível reais da dimensão associada, os departamentos (não protegidos por k-anonimato) que
    atingem o gatilho da sugestão, os possíveis códigos CID-11 e dois botões: "Analisar" (abre
    `Nr1RiscoAnaliseSheet` com a leitura completa, ações recomendadas, monitoramento e os
    disclaimers de CID/responsabilidade) e "Adicionar ao inventário" (abre o mesmo formulário do
    Inventário, pré-preenchido a partir da sugestão, mas sempre editável antes de salvar — o
    julgamento de probabilidade/severidade do GRO continua sendo do SST/RH).

    Adaptado de `LISTA_RISCOS_COMPLETA_CID11.md` (raiz do projeto, base COPSOQ II-Br de 11
    subescalas) para as 4 dimensões do Modelo YNA — o documento de origem cita subescalas sem
    equivalente direto aqui (ex.: "Saúde Geral", "Valores no Local"), então cada risco foi
    remapeado para a dimensão e os itens do Modelo YNA mais próximos da mesma intenção clínica,
    não traduzido pergunta a pergunta. Isso é uma simplificação explícita: o SST do cliente
    precisa validar se o remapeamento faz sentido para o contexto dele, mesma trilha de validação
    que o próprio documento de origem já pede.

    Quatro disclaimers aparecem em camadas (topo da aba, cada card, e o modal de análise): caráter
    de sugestão (não diagnóstico automático), CID-11 como associação possível (não diagnóstico
    médico), validação com SST obrigatória, e responsabilidade pela ação sendo da empresa
    contratante — nenhum texto do produto afirma um risco ou usa linguagem conclusiva.

    O formulário "Adicionar risco" foi extraído do Inventário (`NR1RhInventario.tsx`) para
    `components/Nr1AdicionarRiscoForm.tsx`, com um `prefill` opcional — o Inventário continua
    usando-o sem `prefill` (comportamento idêntico a antes), e a aba de sugestões o usa com os
    campos pré-preenchidos e um novo `origemSugestaoId`, que marca no inventário que aquele fator
    nasceu de uma leitura assistida (não de auditoria/observação direta do SESMT), evitando também
    que a mesma sugestão seja adicionada duas vezes ("Já no inventário" substitui o botão quando
    já existe um risco com aquela origem).

15. **O fluxo do colaborador ganhou de volta a apresentação da YNA, agora ANTES do LGPD/sigilo.**
    Depois do recorte NR-1 standalone, `/convite/:token` (`Ben01Convite.tsx`) redirecionava direto
    para `/sigilo` — quem abria o convite caía no consentimento sem nenhum contexto do que a YNA é
    ou por que está pedindo para responder algo. Duas telas novas, entre a validação do convite e
    o sigilo: `Ben00BemVindo.tsx` (`/bem-vindo`, boas-vindas com CTA "Conhecer a YNA" ou "Já
    conheço, continuar") e `Ben00Apresentacao.tsx` (`/apresentacao/:passo`, 3 slides). Fluxo final:
    `/convite/:token` → `/bem-vindo` → `/apresentacao/1-3` → `/sigilo` → `/avaliacao/1` → …
    (a tela `/avaliacao/intro` deste fluxo foi removida no item 16, adiante, por redundância com
    apresentação e sigilo)

    Estas duas telas já existiram antes do recorte (`Ben00BemVindo`/`Ben00Apresentacao`
    originais, removidos em `689e454`) mas com copy de tele-atendimento ("Você nunca está
    sozinho", "match com o profissional certo", "agenda sua primeira sessão") — incompatível com o
    produto pós-recorte, que não promete atendimento clínico. Por isso não foram restauradas: são
    telas novas, com o mesmo layout/composição visual (mesmas imagens `welcome.png`/
    `slide1-3.png`, já presentes em `public/images/` e sem uso desde o recorte), mas com copy
    reescrita em torno do que o produto realmente é hoje — uma avaliação psicossocial anônima que
    a empresa pediu para o colaborador responder. Mesma estrutura do par equivalente do RH
    (`RH00BemVindo.tsx`/`RH00Apresentacao.tsx`, que também replicam este layout) — os três arquivos
    citam essa relação nos próprios comentários.

    Diferença deliberada em relação ao par do RH: não há "Já tenho conta"/login. Nesta etapa do
    fluxo o colaborador ainda não tem conta nenhuma (ela só é criada depois da avaliação
    respondida, em `/criar-conta`) — o link secundário de `Ben00BemVindo` ("Já conheço, continuar")
    e o botão "Pular apresentação" dos slides pulam direto para `/sigilo`, sem tentar autenticar
    nada.

16. **Removida a tela `/avaliacao/intro` (`NR1BenIntro.tsx`) por redundância narrativa.** Com o
    item 15, o fluxo do colaborador tinha três paradas seguidas repetindo os mesmos argumentos de
    anonimato antes de a pessoa ver a primeira pergunta: os slides de apresentação (privacidade),
    o LGPD/sigilo (o mesmo, em detalhe legal) e, por fim, essa tela de introdução da avaliação,
    que dizia de novo "ninguém vê a sua resposta". Como a apresentação já pode ser pulada, e o
    LGPD/sigilo continua como está (pedido explícito), a peça redundante era esta última.

    `ColTransicaoAvaliacao.tsx` ("Começar avaliação") e `ColAvaliacoes.tsx` (o portão do item de
    navegação "Avaliação", usado nas reavaliações de quem já tem conta) agora levam direto para
    `/avaliacao/1`, sem escala. A tela de introdução tinha dois pedaços de conteúdo que não eram
    redundantes — a duração aproximada ("leva cerca de 8 minutos") e a reasseguração de que não há
    resposta certa — e esses migraram para dentro do próprio primeiro passo do questionário
    (`NR1BenQuestionario.tsx`), como uma nota abaixo da pergunta introdutória da primeira dimensão,
    visível só no passo 1. O restante do conteúdo da tela (as garantias de anonimato, o texto legal
    de consentimento, o link para o canal de escuta) não foi migrado: já está coberto pelo LGPD, que
    continua intocado antes desta etapa.

    Um detalhe funcional, não só de copy, que essa remoção expunha: `NR1BenIntro` era o único lugar
    que atualizava `nr1.campanhaId` (`AppContext`) para quem inicia uma REAVALIAÇÃO (segundo ciclo
    em diante, via `ColAvaliacoes`, que não passa pelo LGPD de novo). Sem essa tela, o envio final em
    `NR1BenConclusao.tsx` (que lê `nr1.campanhaId`) submeteria a resposta nova sob o id da campanha
    antiga. Corrigido movendo essa sincronização para dentro do próprio `NR1BenQuestionario`: um
    `useEffect` chama `nr1Iniciar(campanhaId)` assim que o instrumento da campanha ativa resolve,
    então o questionário fica correto independente de por onde a pessoa chegou até ele (LGPD, ou
    direto pela reavaliação). No primeiro ciclo isso é redundante com o que o LGPD já fez (o mesmo
    id, só confirmado de novo) — inofensivo, e mais simples do que ter dois caminhos diferentes.

    Também ajustado: o botão "Voltar" do passo 1 do questionário navegava para `/avaliacao/intro`
    (rota que não existe mais); agora usa `navigate(-1)`, voltando pelo histórico do navegador, no
    mesmo padrão que o passo 1 do LGPD já usava.

17. **Perguntas de cada dimensão passam a ser reveladas progressivamente, com rolagem automática
    (`NR1BenQuestionario.tsx`).** Antes, todas as perguntas de uma dimensão apareciam de uma vez,
    numa lista rolável; responder uma fazia o card crescer (o rótulo da opção escolhida só entrava
    depois de respondida, empurrando o resto para baixo) e a pessoa precisava rolar manualmente até
    achar a próxima pergunta sem resposta, arriscando pular alguma sem querer.

    Agora a dimensão revela uma pergunta por vez: a primeira ainda sem resposta é a única visível
    além das já respondidas; ao responder, a próxima aparece com uma pequena animação e a tela rola
    sozinha até ela (`scrollIntoView`, guardado por uma referência por pergunta). Perguntas já
    respondidas continuam visíveis e editáveis acima, então voltar e mudar uma resposta anterior não
    precisa de nenhuma navegação especial. Quando a última pergunta da dimensão é respondida, a
    rolagem automática leva até o botão "Continuar"/"Finalizar" em vez de até uma próxima pergunta
    (não há mais nenhuma). O cálculo de quantas perguntas revelar é puramente derivado de
    `respostas` (sem estado próprio de "página"), então reabrir uma dimensão já respondida mostra
    tudo de uma vez, sem reiniciar a revelação do zero.

    Dois ajustes vieram do próprio pedido, além do problema original:
    - **Card de altura fixa.** O espaço do rótulo da opção escolhida (ex. "Às vezes") agora é
      sempre reservado, vazio ou não — o card não muda de altura ao ser respondido, então a
      revelação da pergunta seguinte é o único motivo da tela se mover, nunca um reflow por conta
      da própria pergunta que acabou de ser respondida.
    - **Perguntas condicionais usam o botão "Não se aplica a mim" como gatilho.** Como esse botão
      já grava um valor (`NAO_SE_APLICA`) do mesmo jeito que escolher um número na escala, ele já
      entra na mesma verificação de "foi respondida" sem precisar de regra especial — mas por ele
      ser agora o único jeito de destravar a pergunta seguinte quando a atual não se aplica, ficou
      pequeno e discreto demais para essa função. Ganhou mais peso visual: maior, com fundo
      (`bg-surface-2` quando não marcado, em vez de transparente) e um ícone sempre visível
      (círculo pontilhado quando não marcado, círculo com check quando marcado), não só quando já
      selecionado.

    Um detalhe visual pedido para não perder o senso de "tem mais pergunta vindo": depois da última
    pergunta visível, quando ainda há alguma escondida, aparece uma pequena borda arredondada com
    uma máscara de gradiente (opacidade decrescente) simulando a ponta de um próximo card por trás
    — sem mostrar nenhum conteúdo dele, só o suficiente para indicar que a dimensão continua.

18. **Sidebar do RH reestruturada: "Visão geral" da Conformidade NR-1 (`/rh/nr1`) passou a ser o
    primeiro item do menu, sem agrupamento (`RhAppLayout.tsx`).** Antes, ela era só o primeiro item
    dentro do agrupamento "Conformidade NR-1", com o mesmo peso visual dos outros quatro
    (Ciclos/Inventário/Plano/Relatório). Agora fica solta, à frente até do próprio agrupamento a que
    pertence — a `RhSidebar.tsx` já tratava itens sem `section` como não gerando cabeçalho de grupo
    (usado hoje só por este item), então não precisou de nenhuma mudança de código lá, só reordenar
    o array `rhSidebarItems`.

    A ordem final: **Visão geral** (NR-1, sem grupo) → agrupamento **Conformidade NR-1** (Ciclos de
    avaliação, Inventário de riscos, Plano de ação, Relatório e rastreabilidade, sem mais o item
    Visão geral que subiu) → agrupamento **Empresa** (Visão geral da empresa em `/rh/home`,
    Colaboradores, Convites, Departamentos, Equipe RH — sem nenhuma mudança nesse grupo, só
    reposicionado para depois do NR-1).

    Não toquei no menu "Mais" do mobile (`RH17Mais.tsx`): ele já agrupa de um jeito diferente
    (`Conformidade NR-1` / `Gestão` / `Conta`, sem um agrupamento chamado "Empresa"), então o pedido
    de reestruturar o agrupamento "Empresa" não se aplicava a ele.

    *(Ajuste seguinte no item 19: o item "Visão geral" do agrupamento "Empresa", citado acima,
    foi removido — o rótulo duplicado não sobreviveu a uma segunda rodada de revisão.)*

19. **Dois ajustes finos na sidebar do RH, pedidos numa revisão seguinte:**
    - **Removido o item "Visão geral" do agrupamento "Empresa"** (`/rh/home`). A tela continua
      existindo — ainda é o destino do item "Visão" na bottom-nav mobile e de deep-links como
      `RH05ContaCriada` — só não tem mais entrada na sidebar desktop. Isso também tornou o segundo
      trecho do `end` em `RhSidebar.tsx` (`item.to === '/rh/home' || ...`) morto, já que nenhum
      item da sidebar aponta mais para `/rh/home`; removido junto.
    - **"Plano de ação" renomeado para "Planos de ação"** no item da sidebar. Só o rótulo do menu:
      o título da própria tela (`NR1RhPlanoAcao.tsx`), o card de atalho na Home (`RH10Home.tsx`) e o
      item equivalente no menu "Mais" do mobile (`RH17Mais.tsx`) continuam dizendo "Plano de ação"
      — o pedido foi especificamente sobre o item do menu, não sobre renomear a tela em todo lugar
      onde ela é citada.

20. **"Visão geral" (`/rh/nr1`, `NR1RhCockpit.tsx`) deixou de ser um resumo estático e ganhou o
    peso que a promoção a primeiro item do menu (item 18) pedia.** Quatro blocos novos, na ordem
    pedida:
    - **Saudação** ("Oi, {nome}."), mesmo padrão da Home (`RH10Home.tsx`).
    - **Ciclo em andamento**: quando há campanha ativa, o mesmo `Nr1CicloStatusCard` já usado na
      Home e em Ciclos de avaliação — as três telas nunca discordam sobre o mesmo ciclo porque é
      literalmente o mesmo componente lendo o mesmo dado.
    - **Seus planos de ação**: ações vigentes (não superadas por uma versão mais nova, não
      concluídas) onde a pessoa logada é responsável. Como `Nr1Acao.quem` é texto livre
      ("Nome · área", não um id estruturado), o casamento é por nome
      (`a.quem.includes(usuario.nome)`) — funciona para o usuário mock atual (Camila Risi, com 2
      ações), mas é a mesma limitação que já existia no campo em si, não uma nova.
    - **Risco por dimensão + mapa de calor, agora clicáveis**: os mesmos `RiscoPorDimensaoGrid`/
      `MapaCalorTable` de antes ganharam `onClickDimensao`/`onClickCelula`, abrindo
      `Nr1PerguntasSheet` — a mesma interação que a aba "Resultado" do detalhe de um ciclo já
      tinha (item 13). Só fica clicável quando há uma campanha ativa para servir de escopo
      (`campanhaId`); sem campanha ativa, o grid/mapa seguem estáticos, sem erro nem escopo
      ambíguo.

    **Nota de arquitetura, não resolvida aqui:** isso deixa "Visão geral" (NR-1) parecida com a
    Home (`RH10Home.tsx`) — ambas têm saudação + card de ciclo + risco por dimensão agora. É
    exatamente a duplicação de informação que uma revisão anterior (item 10) evitou de propósito,
    só que agora em sentido contrário: a Visão geral virou o item de maior destaque do menu (item
    18) e passou a merecer o mesmo tratamento. Não fundi as duas telas nem alterei a Home — não foi
    pedido nesta rodada — mas registro aqui para quem for revisar a IA do RH: a essa altura, faz
    sentido perguntar se as duas telas ainda precisam existir separadas.

21. **Um risco do inventário pode agora estar vinculado a mais de um departamento.** Antes,
    `Nr1RiscoInventario`/`RiscoSeed` tinham um único `departamentoId: string` — um risco que
    atravessa duas áreas (ex.: a mesma tensão de relações afetando tanto o Trading quanto as
    Operações) só podia ser cadastrado sob uma delas, o que subestimava quem estava exposto e
    fragmentava o mesmo fator em dois registros separados quando alguém tentava cobrir as duas
    áreas.

    Mudou para `departamentoIds: string[]` em toda a cadeia:
    - **`data/nr1Mock.ts`**: os 6 riscos-semente viraram arrays de um item cada, exceto `r-03`
      (tensão nas relações), que agora ilustra o caso real — `['d-trading', 'd-ops']`. O histórico
      por ciclo (`nr1RiscosCiclos`) usa a média das células dos departamentos do risco naquela
      dimensão (mesmo espírito de `mediaPorDimensao`: média do que já existe, nunca um número à
      parte); `nr1Inventario()` soma os respondentes de todos os departamentos e junta os nomes em
      `grupoExposto` (ex.: "Trading & Mercados, Operações") para exibição, sem quebrar nenhuma tela
      que já lê esse campo como texto simples.
    - **`services/nr1.ts`**: `adicionarRisco` recebe `departamentoIds: string[]`.
    - **`components/Nr1AdicionarRiscoForm.tsx`**: o campo "Grupo de trabalhadores exposto" trocou
      de `Select` (uma opção só) para uma seleção múltipla em chips — mesmo padrão visual do botão
      "Não se aplica a mim" do questionário (item 17): chip preenchido com ícone de check quando
      marcado, contorno neutro com ícone de círculo pontilhado quando não. Salvar exige pelo menos
      um departamento selecionado (antes, o form sempre pré-selecionava o primeiro da lista mesmo
      sem escolha explícita — um comportamento que escondia esquecimentos; agora fica bloqueado até
      a escolha ser deliberada).
    - **`components/Nr1RiscosSugeridos.tsx`**: ao abrir "Adicionar ao inventário" a partir de uma
      sugestão, o prefill passou a marcar TODOS os departamentos que dispararam aquele padrão
      (`departamentosEnvolvidos`), não só o primeiro — a pessoa ainda pode desmarcar antes de
      salvar, mas o ponto de partida já reflete o que os dados mostraram.

22. **"Risco por dimensão" e "Mapa de calor por área", na Visão geral, ganharam um seletor de ciclo
    e viraram um único bloco (`NR1RhCockpit.tsx`).** Antes, as duas seções sempre mostravam o
    retrato padrão do serviço (a campanha ativa, ou a mais recente na falta de uma), sem nenhum
    controle visível de qual ciclo era aquele — e eram duas seções soltas, sem nada amarrando
    visualmente que fossem sobre o mesmo recorte de dados.

    Agora as duas vivem dentro do mesmo card (`Risco por dimensão e mapa de calor`), com um
    seletor de ciclo no topo do card — visual de aba, mesmo padrão do Engajamento/Resultado/Riscos
    sugeridos do detalhe de um ciclo (`NR1RhCiclos.tsx`), só que aqui as abas são os próprios
    ciclos, com um rótulo curto derivado do nome da campanha (a parte depois do "·": "1º semestre
    2026" em vez do nome completo) e uma marca "· em campo" para o ciclo ainda em coleta. Trocar de
    aba troca risco por dimensão e mapa de calor juntos, porque os dois leem o mesmo `campanhaId`
    escolhido — estarem dentro do mesmo card não é só estética, é o que deixa claro que o seletor
    vale para o bloco inteiro, não só para o que estiver mais perto dele na tela.

    Por padrão, o ciclo mais recente por data de início — mesmo o que ainda está em campo, "mais
    recente" não significa "encerrado". Essa escolha é independente da campanha ativa que já
    alimentava o card "Ciclo em andamento" e o `RhContext` (`nr1CampanhaService.ativa()`); são duas
    fontes de dado propositalmente separadas, então trocar o ciclo do seletor não afeta o card de
    estado do ciclo nem "Seus planos de ação" (que continuam sobre o que está aberto agora, não
    sobre o que valia num ciclo passado).

23. **O campo "Quem (responsável)" do formulário de ação (Nova ação/Editar ação/Revisar plano, em
    `NR1RhPlanoAcao.tsx`) deixou de ser texto livre e passou a ser um droplist com busca por nome,
    sobre a lista real de colaboradores da empresa.** Usei o `SearchSelect` (`components/
    SearchSelect.tsx`) — o combobox com busca já usado em `Mng17Suporte.tsx`, mesmo padrão visual
    do design system (trigger + painel com campo de busca no topo), em vez de desenhar um campo
    novo. Cada opção mostra "Nome completo · Departamento" (via `rhColaboradorService`/
    `rhDepartamentoService`).

    `Nr1Acao.quem` continua sendo texto livre no dado salvo (não virou um id de colaborador) — só
    o *jeito de preencher* mudou, não o formato do que é gravado. Essa conversão (id escolhido no
    droplist → string final) ficou isolada num hook interno (`useResponsavelField`), compartilhado
    entre `AcaoForm` e `RevisarPlanoForm` para não duplicar a lógica.

    Detalhe que precisou de atenção: as ações já cadastradas têm `quem` como texto livre anterior a
    este campo existir (ex.: "Ricardo Alencar · Head de Trading") — nomes que não correspondem a
    nenhum colaborador do mock atual (que é gerado com uma lista de nomes genéricos, sem relação
    com os nomes ilustrativos usados nas ações-semente). Abrir "Editar ação" numa dessas simplesmente
    não teria nenhuma opção pré-selecionada, dando a impressão de que o responsável tinha sido
    perdido. Resolvido injetando o texto atual como a primeira opção da lista (rotulada com o
    próprio texto), pré-selecionada — a pessoa mantém o que já estava ou troca por um colaborador
    real; nada é sobrescrito silenciosamente.

24. **Plano de ação (`NR1RhPlanoAcao.tsx`) reformulado: modelo de card único trocado por duas
    visualizações (Lista/Kanban), controle de vencimento e filtros por risco/dimensão/responsável/
    prazo.** O motivo do pedido: um card grande por ação, todos na mesma coluna, ficava difícil de
    acompanhar execução com muitas ações abertas ao mesmo tempo — era preciso rolar bastante para
    ter uma visão geral, e não havia nenhum jeito de recortar por quem, por qual risco, ou por
    quão perto do vencimento cada uma estava.

    - **Lista** (padrão): uma linha compacta por ação — tag de dimensão, o quê, risco/departamento,
      responsável, badge de prazo e status, tudo numa ou duas linhas. Clicar em qualquer parte da
      linha abre o detalhe; os botões de Editar/Anexar evidência/Concluir que antes ficavam
      espalhados em cada card agora vivem só lá (ver abaixo), porque eram exatamente esse excesso
      de interações por item que tornava a lista pesada de escanear.
    - **Kanban**: as mesmas ações, agrupadas em colunas por status (Planejada, Em andamento,
      Atrasada, Concluída), com um card compacto por ação. **Sem arrastar-e-soltar** — mudar o
      status continua sendo feito em "Editar ação" ou "Concluir ação", os mesmos caminhos de
      sempre; o kanban aqui é uma visualização alternativa da mesma lista filtrada, não um novo
      mecanismo de edição. Essa foi uma decisão de escopo deliberada: implementar
      arrastar-e-soltar de verdade exigiria uma biblioteca de DnD que o projeto não tem hoje, e o
      pedido enfatizava clareza visual, não a mecânica de arrastar — se isso vier a fazer falta,
      dá para tratar como um pedido separado.
    - **Controle de vencimento**: `nr1DiasEntre`/`nr1UrgenciaPrazo`/`URGENCIA_PRAZO` (novos em
      `lib/nr1.ts`) classificam o prazo de cada ação (`quando` vs. `NR1_TODAY`) em vencida/
      vencendo (7 dias ou menos, limiar ajustável)/no prazo — **independente do status manual
      5W2H**. São dois sinais propositalmente separados: uma ação "em andamento" pode já estar com
      o prazo vencido, e uma "planejada" pode ainda estar longe do prazo — por isso o badge de
      vencimento (`PrazoBadge`, compartilhado entre lista/kanban/detalhe) aparece ao lado do badge
      de status, nunca fundido nele. `nr1DiasEntre` foi extraído de uma função que já existia
      dentro de `Nr1CicloStatusCard.tsx` (o prazo do ciclo já usava a mesma conta) — `Nr1CicloStatusCard`
      agora chama a versão compartilhada em vez de duplicar a lógica.
    - **Filtros**: Risco, Dimensão (via `risco.dimensaoId`), Responsável (lista de `quem`
      distintos entre as ações vigentes, não todos os colaboradores da empresa — só quem já é
      responsável por alguma ação), Status (já existia) e Vencimento (vencida/vencendo/no prazo,
      mesma classificação do badge), todos combináveis e aplicados às duas visualizações. O filtro
      de risco por URL (`?risco=`, usado pelo deep-link "Ver plano de ação" do Inventário) virou o
      valor inicial desse mesmo filtro em vez de um mecanismo à parte — um "Limpar filtros" único
      agora reseta os cinco de uma vez.
    - Ordenação por urgência: em ambas as visualizações, ações não concluídas vêm primeiro
      (ordenadas por prazo, as mais vencidas/próximas no topo); concluídas ficam sempre ao final
      (ou na última coluna do kanban), para não competir por atenção com o que ainda está aberto.

25. **A visualização "Lista" do Plano de ação ganhou colunas de verdade no desktop, pedido numa
    revisão seguinte ao item 24.** Antes, nível do risco era só a cor da bolinha; agora é a nota
    (probabilidade × severidade) num chip colorido, igual ao que já aparece no Inventário — a cor
    sozinha não diz o quanto, só a direção. Quatro colunas alinhadas por um grid compartilhado
    entre cabeçalho e linhas (`LISTA_GRID_COLS`, em `NR1RhPlanoAcao.tsx`): **Nível** (nota + rótulo,
    chip colorido), **Prazo** (o mesmo `PrazoBadge` de antes, agora isolado em coluna própria),
    **Ação** (título em destaque; abaixo, menores, a dimensão + risco de origem — clicável — e o
    responsável) e **Status**. Abaixo de `lg`, a mesma linha volta a uma pilha compacta sem colunas
    rígidas (não cabem numa tela estreita) — o pedido era especificamente sobre o desktop.

    A dimensão + risco de origem agora leva para o detalhe DAQUELE risco no Inventário
    (`/rh/nr1/inventario?detalhe=<id>`), não só para a lista. Isso exigiu um deep-link novo em
    `NR1RhInventario.tsx`: um `useEffect` lê `?detalhe=` e abre o `Sheet` de detalhe do risco
    correspondente assim que o inventário carrega — mesmo padrão que o `?risco=` do próprio Plano
    de ação já usava para abrir filtrado a partir do Inventário, só que na direção contrária.

    Detalhe de implementação que importa: a linha inteira continua clicável para abrir o detalhe
    da AÇÃO (mesmo comportamento de antes), mas agora contém um link aninhado (dimensão/risco) que
    abre o detalhe do RISCO — dois destinos diferentes disputando a área da linha. Resolvido
    trocando o `<button>` externo por um `<div role="button" tabIndex={0}>` (acessível por teclado
    também) com `stopPropagation()` no link interno, para o clique nunca dispersar para os dois
    lugares ao mesmo tempo. Um `<a>` dentro de um `<button>` real não seria HTML válido — daí a
    troca, não só estética.

26. **Removido o link "← Conformidade NR-1" do topo de seis telas do módulo** (Ciclos de avaliação,
    Inventário de riscos, Plano de ação, Relatório e rastreabilidade, Canal de escuta, Kit de
    comunicação). Esse "voltar" apontava para `/rh/nr1` como se fosse um hub — resquício de antes
    da reestruturação da sidebar (itens 18/19), quando "Conformidade NR-1" ainda existia como
    conceito de tela-mãe. Hoje `/rh/nr1` é "Visão geral", o primeiro item do menu sem agrupamento,
    e a navegação entre as telas do módulo já é feita pela própria sidebar — o link tinha ficado
    apontando para um destino que já não representa mais "voltar para o hub", só repetia texto
    solto no topo de cada tela.

    Cada `PageHeader` ganhou `className="mt-2 lg:mt-0"` no lugar do link removido, para preservar o
    mesmo espaçamento no topo da página — sem isso, o título ficaria colado no `RhTopBar` (o link
    antigo era o que garantia essa margem). Em `NR1RhPlanoAcao.tsx`, que tinha um segundo caso
    (voltar para "Inventário" quando a tela é aberta via `?risco=` a partir de lá), só a metade
    "Conformidade NR-1" do condicional foi removida — o link para "Inventário" continua existindo
    quando faz sentido (chegou por aquele deep-link), simplesmente não renderiza mais no caso
    contrário, em vez de cair no destino genérico de antes.

27. **Cinco ajustes em Planos de ação, numa revisão seguinte ao item 25 (colunas na lista):**
    - **Título da página**: "Plano de ação" → "Planos de ação", no plural — inclusive nas outras
      duas menções que tinham sido deixadas de fora de propósito no item 19 (o atalho "A cadeia"
      da Home e o item do menu "Mais" do mobile), agora consistentes com o item do menu.
    - **Risco melhor caracterizado na lista**: a coluna "Ação" mostrava `dimensão · departamento`
      como identificador do risco (ex. "Contexto externo · Trading & Mercados") — não dá para saber
      QUAL risco é esse só por isso, principalmente quando duas ações da mesma área/dimensão
      respondem a riscos diferentes. Trocado pelo mesmo texto que já aparece em "Risco de origem"
      no detalhe (`risco.fator`), truncado com `truncate` (CSS, não um `.slice()` manual) — mesmo
      ajuste replicado no kanban (item abaixo).
    - **Coluna de prazo sem repetir o rótulo**: `PrazoBadge` (compartilhado entre lista, kanban e
      detalhe) dizia "Prazo 20/06/2026" mesmo quando não havia urgência — redundante com o
      cabeçalho "PRAZO" da própria coluna, na lista. Removido o prefixo "Prazo" desse caso (fica só
      a data); os casos "Vencida há N dias"/"Vence em N dias"/"Vence hoje"/"Concluída em" já eram
      frases completas e não mudaram.
    - **Modal da ação: comentários no lugar do botão único "Anexar evidência"**. Antes, evidência
      era só um nome de arquivo sintético gerado ao clicar num botão — sem contexto, sem quem
      anexou. Agora existe um "diário de execução": `Nr1Acao.evidencias: Nr1Evidencia[]` (só
      `{id, nome, em}`) foi substituído por `Nr1Acao.comentarios: Nr1Comentario[]`
      (`{id, autor, texto?, arquivos?, em}`) — cada item é um comentário de acompanhamento que pode
      trazer um ou mais arquivos. "Evidência anexada" (a condição para concluir a ação) passou a
      significar "algum comentário do diário tem arquivo", em vez de uma lista separada.

      O composer (`ComentarioComposer`) fica **fixo no rodapé do modal**, sempre visível — texto +
      botão de anexo (`<input type="file" multiple>` real, disparado por um clipe) + "Enviar" juntos
      na mesma mensagem. Reposicionei o modal em função disso: o conteúdo (risco de origem, campos
      5W2H, diário) ficou numa área rolável própria (`flex-1 overflow-y-auto`) *dentro* da área que o
      `Sheet` já rola, então o composer nunca sai de vista rolando o resto; e os botões "Editar"/
      "Concluir" saíram do rodapé (onde brigariam com o composer) para uma barra de ações junto do
      status/prazo, no topo do conteúdo.

      **Bug real encontrado e corrigido durante a verificação** (pré-existente, não introduzido por
      este trabalho, mas exposto por ele): o mock de `nr1AcaoService` devolve e muta a MESMA
      referência do array `nr1Acoes`, não uma cópia. A primeira versão da atualização otimista
      (`setDetalhe({ ...a, comentarios: [...a.comentarios, novoComentario] })`) reconstruía o array
      a partir de `a.comentarios` — mas essa referência já tinha sido mutada pelo próprio serviço
      *antes* dessa linha rodar, então o comentário entrava duplicado (mesmo id, dois `<li>`).
      Corrigido trocando para `setDetalhe({ ...a })`: como o array já vem atualizado por referência,
      um shallow spread já é suficiente para o React perceber a mudança e re-renderizar direto.
      Verificado isolando a contagem de itens do diário antes/depois de um envio (1 → 2 com o bug,
      1 → 1 depois do conserto) — o antigo `anexarEvidencia` tinha exatamente essa mesma fragilidade
      estrutural, só nunca foi percebida (não havia atualização otimista construindo um novo array
      ali antes).
    - **Kanban: risco de origem no card + mover entre colunas para trocar status.** Cada
      `AcaoCardKanban` ganhou o nível do risco (nota + cor, igual à lista) e o mesmo link para
      `risco.fator`. E, pedido explícito revertendo a decisão de escopo do item 24 ("sem
      arrastar-e-soltar, se fizer falta é um pedido separado"): os cards agora são arrastáveis
      (`draggable`, API nativa do HTML5 — o projeto não tem nenhuma biblioteca de drag-and-drop, e
      o pedido era sobre mover cards, não sobre uma lib específica) entre as quatro colunas.
      Soltar em "Concluída" passa pela mesma regra do botão "Concluir ação" (exige evidência —
      mostra o mesmo erro e não move o card se não tiver); soltar em qualquer outra coluna só troca
      o status (e limpa `concluidaEm`, para uma ação "des-concluída" por arraste não ficar com data
      de conclusão órfã). A coluna sob o cursor ganha um destaque sutil (`ring`) durante o arraste,
      e o placeholder de coluna vazia troca para "Solte aqui" nesse momento.

28. **Correção do rodapé fixo do modal de ação + diário de execução com um fundo só.** O item 27
    afirmava que o composer de comentário ficava fixo no rodapé via `flex h-full flex-col` (na
    `AcaoDetalhe`) com um `flex-1 overflow-y-auto` interno para o conteúdo — na prática isso não
    funcionava: o `Sheet` já limita o diálogo a `max-h-[88vh]` (altura máxima, não fixa), então
    `h-full` no wrapper interno não tinha uma altura definida para preencher, e o navegador
    simplesmente deixava o conteúdo crescer sem acionar o scroll interno — quem realmente rolava
    era o `overflow-y-auto` do próprio `Sheet`, arrastando o composer junto. Confirmado de forma
    empírica (Playwright medindo a posição Y do textarea do composer antes/depois de forçar o
    scroll do container interno: caía ~430px, deveria ficar constante).

    Troquei a estrutura por `position: sticky; bottom: 0` no wrapper do composer, como último
    filho do mesmo fluxo que o `Sheet` já rola (sem tentar criar um segundo container de scroll
    independente). `sticky` não depende de altura resolvida em cascata — só precisa estar dentro de
    um ancestral com scroll, o que já é o caso. Reverificado com o mesmo teste: a posição Y do
    composer agora não muda ao rolar (593px antes e depois).

    Também troquei o "Diário de execução" de uma lista de cards (`<li className="rounded-lg
    bg-surface-2 p-3.5">` por comentário) para um único bloco com fundo compartilhado (`<ul
    className="... rounded-lg bg-surface-2">` com `divide-y divide-border` entre as mensagens, cada
    `<li>` sem fundo próprio) — pedido explícito para reduzir a altura total do bloco quando há
    vários comentários, já que cada card se somava com uma borda e um espaçamento próprios.

29. **Três ajustes no modal de detalhe da ação.**
    - **Título do modal = título da ação.** O `Sheet` mostrava o rótulo fixo "Detalhe da ação";
      agora usa `detalhe?.oQue` (o mesmo texto do campo "O quê", já exibido como título nos cards da
      lista e do kanban) — com o rótulo fixo como fallback só para o instante de fechamento (quando
      `detalhe` já virou `null` mas o `Sheet` ainda está animando a saída).
    - **Responsável em destaque.** A barra do topo (status + prazo) ganhou um terceiro item, no
      mesmo estilo de pílula, com o nome do responsável (`acao.quem`) e um ícone de pessoa — antes
      ele só aparecia mais abaixo, junto dos outros campos do 5W2H.
    - **Link do risco sai dos cards, entra no modal.** Nos cards de "Publicar política..." (lista e
      kanban), o texto do risco de origem era um link para `/rh/nr1/inventario?detalhe=`; virou
      texto simples, sem navegação — clicar no card já abre o detalhe da ação, e um link para o
      risco dentro da lista/kanban competia com esse clique (área pequena, dois destinos diferentes
      no mesmo card). O link continua existindo, mas só dentro do modal: um "Ver risco no
      inventário →" adicionado ao final do box "Risco de origem" no detalhe da ação.

30. **Detalhe da ação redesenhado como um card de tarefa (Asana/Trello), não mais um formulário
    5W2H genérico.** Reorganização pedida depois do item 29 continuar parecendo "mal diagramado" —
    a ideia central: separar as **propriedades da tarefa** (sempre visíveis, no topo) da sua
    **descrição** (o resto do 5W2H, rolável, abaixo).

    - **`Sheet` ganhou um slot `headerActions`** (novo prop opcional, só usado aqui — os outros ~18
      usos do componente continuam sem cabeçalho de ações, sem mudança de comportamento). Editar e
      Concluir saíram do corpo do modal e foram para o cabeçalho, ao lado do título e do botão de
      fechar — três botões circulares (`h-8 w-8 rounded-full`, mesmo tamanho do "×" que já existia):
      lápis (ghost) para editar, check (preenchido, cor primária) para concluir. Ambos **só com
      ícone** (com `aria-label`/`title` para acessibilidade) — texto ao lado do ícone ("Concluir")
      truncava demais o título em 390px (medido: só "Publicar política ..." sobrava de espaço);
      ícone puro resolveu e ficou mais parecido com a barra de ações de um painel de tarefa
      (Asana/Trello/Linear).
    - **Barra de propriedades**, logo abaixo do cabeçalho: status, prazo e responsável, um ao lado
      do outro — o responsável ganhou um `Avatar` (mesmo componente de iniciais + cor usado nos
      sidebars do app, ex. "CR" para Camila Risi) dentro do próprio badge, no lugar do ícone
      genérico de pessoa.
    - **5W2H sem redundância com as propriedades.** "O quê" (= título, já no cabeçalho), "Quem" (=
      responsável, já na barra de propriedades) e "Quando" (= prazo, já na barra) saíram da lista de
      campos — o que resta (Por quê, Onde, Como, Quanto) ganhou um rótulo de seção, "Detalhes",
      lido como a descrição/corpo da tarefa, não mais um formulário de 7 campos com metade repetida
      em outro lugar da tela.

31. **Formulário de editar/criar ação (`AcaoForm`) alinhado à estrutura do item 30, e "Editar"
    volta pro detalhe em vez de fechar tudo.**
    - **Mesma diagramação do detalhe.** Cancelar/Salvar estavam soltos no fim do conteúdo rolável
      (competiam por espaço com o último campo do formulário, sem hierarquia clara). Virou o mesmo
      padrão do composer de comentário e do rodapé de ações do detalhe: `sticky bottom-0` com
      borda e fundo próprios, sempre visível — o formulário passou a ter a mesma "forma" dos outros
      modais do módulo, em vez de parecer uma tela solta de outra geração da UI.
    - **Cancelar ou salvar a edição volta pro detalhe da ação**, não fecha tudo de volta pra lista.
      Antes, clicar em "Editar" fazia `setDetalhe(null)` (fechava o detalhe) e abria o formulário
      por cima; ao cancelar/salvar, o formulário só fechava — quem editava caía de volta na lista/
      kanban, perdendo o contexto de onde estava. Agora dois handlers no componente pai
      (`fecharForm`/`salvarForm`) checam se o formulário foi aberto a partir de uma ação existente
      (`form.acao`, só verdadeiro quando veio do botão "Editar" do detalhe — "Nova ação", aberta
      pelo cabeçalho da página, não tem detalhe pra voltar e continua só fechando) e, se sim,
      reabrem o Sheet de detalhe: com os mesmos dados de antes no caso do cancelamento, ou com o
      registro atualizado no caso do salvamento — `nr1AcaoService.salvar` já devolvia a ação salva,
      só não estava sendo aproveitada (`onSaved` virou `onSaved(salvo: Nr1Acao)`, em vez de
      `onSaved()` sem retorno).

32. **Modal de dimensão da Visão Geral (`Nr1PerguntasSheet`) ganhou três visualizações —
    Resultados, Riscos e Ações — em vez de só a lista de perguntas.** Aberto ao clicar num card de
    "Risco por dimensão" ou numa célula do mapa de calor, o modal segue a mesma cadeia
    resultado → risco → ação que o Inventário e o Plano de ação já percorrem no sentido inverso,
    só que entrando por resultado (uma pontuação de questionário) e permitindo navegar até os
    riscos e ações vinculados sem sair da Visão Geral.
    - **Resultados**: o comportamento original do modal (lista de perguntas da dimensão, com
      pontuação), sem mudança.
    - **Riscos**: os riscos do inventário com `dimensaoId` igual ao da dimensão clicada — e, se o
      recorte veio de uma célula do mapa de calor (uma área específica, não a empresa toda), só os
      riscos cujo `departamentoIds` inclui aquela área. Sem filtro de campanha: o inventário é um
      documento vivo, não preso a um ciclo (mesmo critério que Inventário e Plano de ação já usam
      para esse filtro). Cada linha é um link para `/rh/nr1/inventario?detalhe=`.
    - **Ações**: as ações vinculadas aos riscos já filtrados na aba Riscos (um `Set` de
      `riscoId`), excluindo versões supersedidas (mesmo critério de "só a versão vigente" do Plano
      de ação). Cada linha é um link para `/rh/nr1/plano-acao?risco=` (não existe deep-link para o
      detalhe de uma ação específica — esse é o mais próximo que já existe no app).
    - **Título do modal** passou a ser o nome da dimensão (ex. "Organização do trabalho"), não mais
      o rótulo fixo "Perguntas da dimensão" — o modal agora mostra mais que perguntas.
    - `PrazoBadge` (antes só definido dentro de `NR1RhPlanoAcao.tsx`) foi extraído para
      `components/PrazoBadge.tsx`, reaproveitado aqui pela aba Ações — mesma leitura de vencimento
      (vencida/vence hoje/vence em N dias) em qualquer lugar do app que mostre uma ação.
    - Este modal é compartilhado com a tela **Ciclos de avaliação** (`NR1RhCiclos.tsx`, aba
      "Resultado" de um ciclo específico) — as três visualizações aparecem lá também, mesmo quando
      o ciclo em questão já está encerrado (Riscos/Ações sempre refletem o estado atual do
      inventário/plano, não um retrato histórico daquele ciclo — não existe snapshot histórico de
      inventário no mock).

33. **Detalhe da empresa no Manager (`Mng11EmpresaDetalhe.tsx`) ganhou abas: Visão geral,
    Departamentos, Contatos e Usuários.** Antes era uma tela só, sem seções — o card "Contatos"
    (Master do RH + CSM) foi o único ponto de contato de fora da empresa que existia. Reorganizado
    em 4 abas (mesmo padrão de abas por `role="tablist"` do resto do app, mas em scroll horizontal
    — `overflow-x-auto` + `shrink-0 whitespace-nowrap` em vez de `flex-1` — porque com 4 itens
    "Visão geral" quebrava linha em 390px; esse é o padrão que o próprio cockpit NR-1 já usa
    quando tem mais de 2-3 abas, ver `NR1RhCockpit.tsx`):
    - **Visão geral**: o conteúdo que já existia (dados cadastrais, contrato, funil de convites,
      colaboradores), com uma mudança: o card "Contatos" virou **"Relacionamento"** e perdeu o
      bloco de Master(s) — mostra só o CSM responsável da YNA. O Master do RH da empresa não
      desapareceu do produto, só saiu desse card específico: agora é só mais um registro na aba
      Contatos (nome, cargo, departamento, telefone, e-mail — mais completo do que o antigo
      Master, que só tinha nome/e-mail/telefone).
    - **Departamentos**: cadastro simples (só o nome), mesmo espírito de `RH14Departamentos.tsx`
      do lado do RH, mas escopado por empresa (`MngDepartamentoEmpresa.empresaId`) e com edição —
      aquela tela só tinha criar/excluir, o `rename` do serviço existia sem UI. Aqui adicionar,
      editar e excluir todos funcionam.
    - **Contatos**: pessoas de referência na empresa cliente (nome, cargo, departamento, telefone,
      e-mail) — não são necessariamente usuárias da plataforma, só um ponto de contato. **Nenhum
      campo é lista suspensa, por pedido explícito** — inclusive "departamento", que é texto livre,
      sem vínculo com a lista da aba Departamentos (evita o problema de excluir um departamento
      "órfão" de contatos que ainda o referenciam — o app não teria como avisar disso, então a
      opção mais simples foi não criar o vínculo).
    - **Usuários**: quem acessa a área de RH da empresa na plataforma (nome, departamento, cargo,
      e-mail, perfil). Departamento continua texto livre, mesmo critério da aba Contatos; "Perfil"
      é a única lista suspensa das três abas novas — só 2 valores fixos (Master/Operador) e é uma
      permissão da própria plataforma, não um dado institucional da empresa, então o motivo que
      levou a evitar droplist em Contatos não se aplica aqui.
    - Três serviços novos em `services/mng.ts` (`mngDepartamentoEmpresaService`,
      `mngContatoEmpresaService`, `mngUsuarioRhService`), com `list(empresaId)` +
      create/update/remove em Contatos e Usuários (ver correção no item 34 — Departamentos
      acabou só leitura), seguindo o mesmo padrão de latência mockada (`delay(rand(min,max))`) dos
      serviços já existentes. Sem confirmação antes de excluir — mesmo critério de
      `RH14Departamentos.tsx`/`RH15Equipe.tsx`, que também excluem direto no clique do ícone de
      lixeira.
    - Populado para 'e-1' (BCP Securities) com os mesmos nomes de departamento de
      `rhDepartamentos` (`data/rhMock.ts`) — a mesma empresa, visão de fora (Manager) e de dentro
      (RH) batendo.

34. **Correção do item 33: Departamentos passou a ser só listagem, e Contatos/Usuários passaram a
    referenciar essa lista num droplist, em vez de texto livre.**
    - **Departamentos**: quem cadastra, edita e exclui é o RH da empresa (`RH14Departamentos.tsx`,
      de dentro da própria empresa) — o Manager só acompanha. `create`/`rename`/`remove` saíram de
      `mngDepartamentoEmpresaService` (ficou só `list`), e a aba perdeu o botão "Novo departamento"
      e os ícones de editar/excluir por linha — agora é uma lista simples, com uma frase explicando
      quem gerencia.
    - **Contatos e Usuários**: o campo "Departamento", antes um `Input` de texto livre, virou um
      `Select` com as opções vindas de `mngDepartamentoEmpresaService.list(empresaId)` — os mesmos
      departamentos que aparecem na aba Departamentos. Um hook pequeno,
      `useDepartamentosOpcoes(empresaId)`, busca essa lista e monta as opções do `Select`
      (`value`/`label` = o nome do departamento); usado em `ContatoForm` (o formulário de
      Usuários que também usava esse hook saiu no item 35, que removeu o cadastro de usuários).
    - O campo continua guardando o **nome** do departamento como string simples (não um id/vínculo
      com `MngDepartamentoEmpresa`) — só a UI de entrada mudou de texto livre pra droplist restrito
      às opções existentes; o modelo de dados de `MngContatoEmpresa`/`MngUsuarioRh` não mudou.
    - "Perfil" (Usuários) segue como estava: droplist de 2 valores fixos, sem relação com esta
      mudança.

35. **Usuários também virou só listagem (mesmo critério de Departamentos, item 34), e as três abas
    novas (Departamentos/Contatos/Usuários) ganharam dados de exemplo para todas as 7 empresas do
    mock, não só BCP Securities e Atlas.**
    - `mngUsuarioRhService` perdeu `create`/`update`/`remove` (ficou só `list`, igual
      `mngDepartamentoEmpresaService`) — quem cadastra/edita/exclui usuários com acesso à área de
      RH é o próprio RH da empresa, não o Manager. A aba perdeu o botão "Novo usuário" e os ícones
      de editar/excluir; ganhou a mesma frase da aba Departamentos explicando quem gerencia.
      `UsuarioRhForm` foi removido (não tem mais chamador).
    - **Dados de exemplo em `data/mngMock.ts`** para as 5 empresas que só tinham a aba vazia antes
      (Nova Vita, Orla, Vértice Tech, Meridiano Log, Solaris): departamentos plausíveis pro
      segmento de cada uma (ex.: "Assistencial"/"Administrativo" na Nova Vita, que é de Saúde;
      "Loja & Vendas"/"Logística"/"Marketing" na Orla, que é Varejo), e o Master de cada empresa
      (já existente em `MngEmpresa.masters`) replicado como um registro em Contatos e outro em
      Usuários (perfil Master) — mesmo critério que 'e-1'/'e-3' já seguiam. Um par adicional de
      usuário Operador em três das cinco, só pra mostrar as duas variações de perfil no protótipo.

---

## O que está mockado e como trocar

| Mock | Onde | Como trocar |
|---|---|---|
| Validação de convite do colaborador | `inviteService.validate` | `GET /invites/:token` |
| Colaboradores, departamentos, equipe RH, convites | `data/rhMock.ts` via `services/rh.ts` | Endpoints REST do RH (mesma assinatura) |
| Empresas clientes, suporte, gestores YNA, cockpit | `data/mngMock.ts` via `services/mng.ts` | Endpoints REST do backoffice |
| Departamentos e usuários RH de uma empresa, só leitura; contatos, CRUD completo (aba a aba no detalhe da empresa no Manager) | `mngDepartamentoEmpresaService`/`mngUsuarioRhService` (só `list`) / `mngContatoEmpresaService` (CRUD completo), arrays em `data/mngMock.ts` filtrados por `empresaId` | `GET /mng/empresas/:id/{departamentos,usuarios}`; `GET/POST/PATCH/DELETE /mng/empresas/:id/contatos` |
| Modelos e versões do questionário NR-1 | `nr1Modelos` em `data/nr1Mock.ts` via `nr1ModeloService` | `GET/POST /nr1/modelos`, `/nr1/modelos/:id/versoes` |
| Campanha NR-1 e participação por área | `nr1Campanhas` via `nr1CampanhaService` | `GET /nr1/campanhas`, `POST /nr1/campanhas/:id/lembretes` |
| Mapa de calor e médias por dimensão, por campanha | `nr1ResultadoService.mapaCalor(campanhaId?)` / `mediaPorDimensao(campanhaId?)` | `GET /nr1/campanhas/:id/mapa-calor` — **o k-anonimato deve ser aplicado no servidor**, não na tela |
| Pontuação por pergunta de uma dimensão (empresa ou área) | `nr1ResultadoService.itensPorDimensao(campanhaId, dimensaoId, departamentoId?)` — distribuída de forma determinística a partir da média já publicada, não é resposta individual real | `GET /nr1/campanhas/:id/dimensoes/:dimensaoId/itens?departamentoId=` — precisa de resposta agregada por item, real, vinda do backend |
| Inventário de Riscos (status/tendência/sugestão inclusos; cadastro manual) | `nr1ResultadoService.inventario`/`adicionarRisco`, array `RISCOS` em `data/nr1Mock.ts` | `GET/POST /nr1/inventario` |
| Riscos sugeridos (triagem assistida + possível CID-11) | `nr1ResultadoService.riscosSugeridos(campanhaId)`, conteúdo-semente em `data/nr1RiscosSugeridosMock.ts` | `GET /nr1/campanhas/:id/riscos-sugeridos` — cálculo do gatilho pode continuar client-side ou ir para o servidor, mas o conteúdo (CID, ações, disclaimers) deveria virar tabela editável pela YNA, não hardcoded |
| Histórico de um risco entre ciclos | `nr1ResultadoService.riscoCiclos(riscoId)`, dado em `nr1RiscosCiclos` (derivado do mapa de calor por campanha) | `GET /nr1/riscos/:id/ciclos` |
| Exportações (inventário PDF/planilha, relatório PDF) | retornam só o nome do arquivo | `POST /nr1/exportacoes` com geração server-side |
| Plano de ação 5W2H, diário de comentários e versionamento | `nr1AcaoService` (`comentar`, `versoes`, `revisar`, `avaliarEfetividade`) | `GET/POST /nr1/acoes`, `POST /nr1/acoes/:id/comentarios` com upload real de anexo; nova versão como registro imutável, nunca edição da anterior |
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
