# YNA Care Hub · Frontend — Fluxos do Beneficiário e do Profissional

Aplicação navegável de **dois fluxos independentes** que compartilham o mesmo design system:
- **Beneficiário** — do convite à fidelização (raiz `/`).
- **Profissional (psicólogo)** — do convite à operação e crescimento (namespace `/pro`).

Stack oficial do MVP: **React + TypeScript + Vite + Tailwind CSS + React Router DOM**.

## Como rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b + vite build (produção)
```

A rota padrão `/` redireciona para `/convite/demo` e inicia a jornada completa.

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
| `ThemeContext` | Tema light/dark **compartilhado** pelos dois fluxos. Persiste em `localStorage`. |
| `AppContext` | Sessão do **beneficiário**: consentimento LGPD, perfil, triagem, matches. |
| `ProContext` | Sessão do **profissional**: perfil clínico + indicador "Perfil pronto para match" (derivado, fonte única de verdade). Isolado do `AppContext`. |

Sem Redux, Zustand, TanStack Query ou qualquer lib de estado além das nativas do React.

### Camada de serviços — `src/services/index.ts`

Funções assíncronas tipadas com latência simulada (300–2000ms), assinaturas espelhando a futura API REST.

```ts
// Padrão de consumo
const result = useService(() => matchService.getMatches(), [])
// result.status === 'loading' | 'success' | 'error'
```

**Para trocar pela API real:** substituir o corpo das funções em `src/services/index.ts` por chamadas `fetch`/`axios` para os endpoints reais. A assinatura não muda — os componentes continuam funcionando.

### Hook `useService`

Entrega `{ status, data?, message?, reload }` para qualquer chamada assíncrona. Todos os fetches têm estados loading (skeleton), success e error com microcopy Cora.

---

## Mapa rota → tela → RF

| Rota | Tela | RF principal |
|---|---|---|
| `/convite/:token` | BEN-01 | RF-CO-01.1 |
| `/convite/invalido` | BEN-02 | RF-CO-01.4 |
| `/bem-vindo` | BEN-00a | — (splash de boas-vindas) |
| `/apresentacao/1–3` | BEN-00b–d | — (apresentação da YNA, 3 slides) |
| `/sigilo` | BEN-03 ★ | RF-CO-02.1/02.2 |
| `/despedida` | BEN-05 | RF-CO-03.1 |
| `/cadastro` | BEN-06 | RF-CO-04.1/04.2 |
| `/cadastro/agenda` | BEN-07 | RF-CO-04.5 |
| `/cadastro/comunicacoes` | BEN-08 | RF-CO-04.3 |
| `/triagem/:passo` | BEN-09 ★ | RF-CO-05.1/05.2 |
| `/triagem/roda` | BEN-10 | RF-CO-05.5 |
| `/matches/carregando` | BEN-11 | — |
| `/matches` | BEN-12 ★ | RF-CO-06.1/06.2 |
| `/profissional/:id` | BEN-13 | RF-CO-06.3 |
| `/agendar/:id` | BEN-14 | RF-CO-08.1/08.2 |
| `/confirmacao` | BEN-15 | RF-CO-08.2 |
| `/pre-sessao/:id` | BEN-16 | RF-CO-09.2 |
| `/sessao/:id` | BEN-17 ★ | RF-CO-09.1/09.3/09.4 |
| `/sessao/:id/feedback` | BEN-18 | RF-CO-11.1 |
| `/sessao/:id/decisao` | BEN-19 | RF-CO-10.1 |
| `/sessao/:id/rematch` | BEN-20 | RF-CO-10.3 |
| `/home` | BEN-21 ★ | RF-CO-12.1 |
| `/nina` | BEN-22 | RF-CO-12.3 |
| `/emergencia` | BEN-23 | RF-CO-12.4 |
| `/reagendar/:sessaoId` | BEN-24 | RF-CO-12.2 |
| `/check-in/config` | BEN-25 | RF-CO-13.1 |
| `/check-in/nina` | BEN-26 | RF-CO-13.2 |
| `/check-in/form` | BEN-27 | RF-CO-13.3 |
| `/evolucao` | BEN-28 | RF-CO-13.4/13.6 |
| `/conquistas` | BEN-29 | RF-CO-13.5 |
| `/relatorio` | BEN-30 | RF-CO-15.1/15.3 |
| `/meus-dados` | BEN-31 | RF-CO-14.1 |
| `/migracao/*` | BEN-32–35 | RF-CO-16.x (stub) |

★ = tela-herói do conceito visual, replicada fielmente.

---

## Fluxo do Profissional (psicólogo) — namespace `/pro`

Jornada separada (convite e autenticação próprios; nenhum link cruza com o beneficiário), mas reusando o design system. Estado em `ProContext`; serviços em `src/services/pro.ts`; mocks em `src/data/proMock.ts`; telas em `src/screens/pro/`.

| Rota | Tela | Ref. RF |
|---|---|---|
| `/pro/convite/:token` | PRO-01 Convite | RF-PR-01.1 |
| `/pro/convite/invalido` | PRO-02 Link inválido | RF-PR-01.1 |
| `/pro/boas-vindas` | PRO-03 Boas-vindas Domus | RF-PR-01.2 |
| `/pro/cadastro/:passo` | PRO-04 Cadastro (wizard 5 etapas) | RF-PR-02.1 |
| `/pro/financeiro/setup` | PRO-05 Setup financeiro | RF-PR-03.1/03.2 |
| `/pro/integracao` | PRO-06 Trilha de integração | RF-PR-04.1/04.3 |
| `/pro/status` | PRO-07 Status do cadastro | RF-PR-02.5 |
| `/pro/ativado` | PRO-08 Perfil ativo (fast-track) | RF-PR-06 |
| `/pro/home` | PRO-12 ★ Dashboard | RF-PR-06.1 |
| `/pro/agenda` | PRO-13 Agenda (próximas/realizadas) | RF-PR-06.1 |
| `/pro/beneficiario/:id` | PRO-14 Detalhe do beneficiário | RF-PR-06.2 |
| `/pro/perfil` | PRO-09 Perfil clínico (+ "Perfil pronto para match") | RF-PR-05.1 |
| `/pro/sessao/:id` | PRO-15 ★ Sala de sessão (SessionRoom compartilhado) | RF-PR-06.4 |
| `/pro/plantao` | PRO-17 Disponibilidade de plantão | RF-PR-09.1 |
| `/pro/plantao/emergencia/:id` | PRO-18 Acionamento + sala de emergência | RF-PR-09.3 |
| `/pro/supervisao` | PRO-20 Supervisão Domus | RF-PR-10.x |
| `/pro/universidade` | PRO-21 Universidade — trilhas | RF-PR-13.1/13.2 |
| `/pro/universidade/lives` | PRO-22 Lives Domus | RF-PR-13.4 |
| `/pro/qualidade` | PRO-23 Painel de qualidade (sem ranking/comentários) | RF-PR-14.1 |
| `/pro/financeiro` | PRO-24 Gestão financeira/antecipação | RF-PR-11.x |
| `/pro/ausencias` | PRO-19 Férias e ausências | RF-PR-08.x |
| `/pro/conta` | PRO-25 Conta (dados, PJ, tema, sair) | — |
| `/pro/notificacoes` | PRO-26 Notificações (inclui troca de profissional) | RF-PR-12.4 |

★ = telas de maior peso visual.

**Telas de detalhe/ação em modal (Sheet), espelhando o fluxo do beneficiário** — não têm rota própria:

| Conteúdo | Componente | Aberto a partir de |
|---|---|---|
| PRO-10 Preview "como o beneficiário vê" | `Pro10PreviewContent` | PRO-09 (perfil) |
| PRO-11 Configuração de agenda/disponibilidade | `Pro11AgendaContent` | PRO-09 (perfil) |
| PRO-16 Prontuário pós-sessão | `ProntuarioForm` | PRO-15 e PRO-18 (pós-sessão) · pendências em PRO-12/PRO-13 |

### Chrome compartilhado

- **Mobile:** `ProTopBar` (wrapper de `MobileTopBar`) injeta o tema claro/escuro e o sino de notificações (com contador de não lidas via `ProContext.unreadNotifs`, navegando para `/pro/notificacoes`) em todas as telas logadas.
- **Desktop:** os mesmos controles de tema + sino ficam na `ProSidebar`.
- **Fundo:** todas as telas logadas usam o `bg-yna-gradient-soft` (dark: `--yna-gradient-dark`), igual ao beneficiário.

### Ponto de conexão entre os dois fluxos

A **sala de sessão** é o componente `src/components/SessionRoom.tsx`, parametrizado por `role` (`beneficiario | profissional`). `Ben17VideoRoom` e `Pro15Sessao`/`Pro18Emergencia` são wrappers finos: a sala é idêntica; muda só o participante exibido, o self-view, o botão de ajuda (só beneficiário) e o que ocorre ao encerrar (beneficiário → feedback em Sheet; profissional → prontuário em Sheet).

### Diferenças intencionais entre os perfis

- **Sem botão de pânico** no profissional (ele é quem *atende* a emergência, como plantonista).
- **Navegação própria** (Início · Agenda · Universidade · Financeiro · Perfil) via `ProSidebar` + `ProBottomNav` (reusa o `BottomNav`).
- **Tom de copy** Cora-Sábio/Criador/Herói (par a par), não o Cuidador/Amante do beneficiário.
- **Densidade de dados** um pouco maior em painéis operacionais (agenda, financeiro, qualidade), sempre arejada.
- **Ranking oculto:** o painel de qualidade mostra score por critério, **nunca** a posição no ranking nem comentários (RN-PR §7.15).

---

## O que está mockado e como trocar

| Mock | Onde | Como trocar |
|---|---|---|
| Validação de convite | `inviteService.validate` | Chamar `GET /invites/:token` |
| Pré-preenchimento de perfil | `profileService.prefill` | Chamar `GET /me/prefill` com JWT |
| Perguntas da triagem | `triagemQuestions` em `data/mock.ts` | `GET /triagem/questions` |
| Matches | `matchService.getMatches` | `GET /matches` após triagem |
| Slots de agenda | `availableSlots` em `data/mock.ts` | `GET /professionals/:id/slots` |
| Sala de vídeo | Placeholder visual | Integrar SDK Daily.co / Twilio Video no `Ben17VideoRoom` |
| Respostas da Nina | `ninaResponses` em `data/mock.ts` | Endpoint de LLM / chatbot |
| Fluxo do Profissional (perfil, sessões, beneficiários, prontuários, plantão, financeiro, trilhas, lives, supervisão, qualidade, notificações) | `data/proMock.ts` via `services/pro.ts` | Endpoints REST do profissional (mesma assinatura) |
| Validação de CRP | manual no MVP | Integração com base do CFP (backoffice) |
| Antecipação de recebíveis | `proFinanceService` (mock) | Integração com fintech |

---

## Responsividade

| Breakpoint | Layout |
|---|---|
| < 768px (mobile) | Bottom navigation, botão de pânico flutuante acima dela |
| 768px–1023px (tablet) | Fluxos de foco em coluna `max-w-xl`, grids de 2 colunas |
| ≥ 1024px (desktop) | Sidebar fixa à esquerda (64 largura), botão de pânico no rodapé da sidebar, conteúdo `max-w-5xl` |

---

## Pendências herdadas do conceito visual

- **Perguntas 2–5 da triagem**: propostas no tom Cora em `data/mock.ts` — precisam validação com Domus/Virgínia.
- **Termos de Uso e Política de Privacidade**: placeholder estruturado no modal de BEN-03 — texto jurídico pendente com jurídico YNA.
- **Fornecedor de vídeo**: `Ben17VideoRoom` é visual/mock. Estruturado para receber o provider (Daily/Twilio) via prop ou context.
- **Paleta índigo vs. teal**: o frontend segue o índigo do design system. Conflito com branding Persona/logo a ser resolvido com FDN Design.
- **Nina (IA)**: respostas roteirizadas em `data/mock.ts`. Integração com LLM real requer endpoint seguro server-side.
