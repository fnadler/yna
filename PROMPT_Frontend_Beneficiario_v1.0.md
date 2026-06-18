# PROMPT — Frontend do Fluxo do Beneficiário · YNA Care Hub (para Antigravity)

> **Como usar:** abra o Antigravity com este diretório como workspace
> (`YNA - MVP da plataforma YNA Care Hub/`), para que todas as referências de
> arquivo abaixo resolvam. O app será criado na subpasta `frontend/`.

---

Você é um(a) engenheiro(a) frontend sênior especializado(a) em produtos digitais de saúde. Sua tarefa é construir o **frontend real do fluxo do beneficiário** da plataforma YNA Care Hub, evoluindo o conceito visual já aprovado — de protótipo-galeria para aplicação navegável, **mobile first e responsiva** (ótima também em tablet e desktop).

## 1. Leia primeiro (não invente o que já existe)

- **`conceito-visual/`** — protótipo de alta fidelidade aprovado (React + TS + Vite + Tailwind). É a sua **fundação obrigatória**:
  - `tailwind.config.ts` e `src/index.css` — tokens do design system já portados (índigo #4749A8, light/dark via CSS vars). Reaproveite como estão.
  - `src/components/` — Button, Card, Badge, Textarea, Modal, BottomNav, Avatar, RadarChart, PanicButton, ThemeToggle. Reaproveite e evolua (PhoneFrame é só da galeria — descarte).
  - `src/screens/` — as 5 telas-herói (BEN-03, 09, 12, 17, 21) com layout mobile e microcopy aprovados. Replique-as **fielmente** no app real; não reescreva a copy.
  - `README.md` — decisões e pendências já registradas. Respeite-as.
- **`yna-care-hub-design-system.html`** — fonte única de verdade dos tokens e componentes. **A paleta índigo definida nele é a definitiva** — siga-a sem ressalvas.
- **`YNA - Documento de Requisitos - v1_0.docx.pdf`** — seção 6 (fluxo do colaborador/beneficiário) tem os RFs/RNs de cada etapa; seção 4 tem requisitos não-funcionais e a stack oficial.
- **`YNA Branding Persona.pdf`** — persona Cora e sistema de tom de voz. Toda copy nova passa por aqui.
- A tabela de telas está embutida na seção 5 deste prompt — não é preciso parsear o XLSX.

## 2. Diretriz de design — clean, com respiro (inegociável)

Esta é uma plataforma de bem-estar em saúde mental. **As telas não podem gerar sobrecarga cognitiva.** Quem chega aqui pode estar ansioso, esgotado ou em crise — a interface precisa acalmar, não disputar atenção.

Na prática:

- **Espaçamento generoso.** Prefira os tokens maiores de espaçamento; deixe o conteúdo respirar. Margens e padding amplos não são desperdício — são parte do cuidado. Na dúvida entre denso e arejado, escolha arejado.
- **Uma decisão principal por tela.** Cada tela tem um objetivo claro e **um único CTA primário**; ações secundárias são visualmente quietas (ghost/link). Se uma tela pede duas decisões, provavelmente são duas telas.
- **Poucos elementos por viewport.** Hierarquia tipográfica clara, blocos curtos, nada de paredes de texto ou grids densos de cards. Revele progressivamente: detalhe vem sob demanda (modal, página de detalhe), não tudo de uma vez.
- **Copy curta e escaneável.** Títulos que orientam, parágrafos de 2–3 linhas no máximo, listas em vez de prosa quando ajudar.
- **Ritmo calmo.** Transições suaves (tokens de motion do DS), sem animações chamativas, sem badges/contadores gritando, sem urgência artificial.
- **Teste mental por tela:** "alguém exausto, no celular, às 23h, entende em 5 segundos o que esta tela quer dele?" Se não, simplifique.

Isso vale para **todas** as telas — inclusive as densas por natureza (cadastro, agendamento): quebre em passos, não em formulários longos.

## 3. Produto a construir

Aplicação real (não galeria): **rotas navegáveis da jornada completa do beneficiário**, do convite à fidelização, com dados mockados atrás de uma camada de serviços tipada, pronta para ser trocada pela API real (Node + Fastify/NestJS, fora do escopo).

### Stack — estritamente a do documento de requisitos (seção 4.5)

- **React + Tailwind CSS** (UI) · **Vite + TypeScript** (build/ferramental), TypeScript em modo strict, `darkMode: 'class'`.
- **Sem bibliotecas de estado ou data-fetching adicionais** (nada de Redux, Zustand, TanStack Query etc.): estado global mínimo (tema, consentimento LGPD, sessão do usuário) com **React Context + hooks nativos**; dados via camada `src/services/` de funções assíncronas tipadas com latência simulada (300–800ms), assinaturas espelhando a futura API REST, consumidas por um hook próprio simples (ex.: `useService`) que entrega os estados carregando/erro/dado.
- **Única adição permitida de runtime:** `react-router-dom` para navegação (o React não tem roteador nativo) — além dos assets que o conceito visual já usa: `@iconify/react` (ícones Phosphor `ph:*`) e `@fontsource-variable/inter` (Inter).
- Criar em **`frontend/`** na raiz do workspace. `npm install` / `npm run dev` funcionando; `tsc -b` e `npm run build` sem erros. Não tocar em arquivos fora de `frontend/`.

### Responsividade (inegociável)

Mobile first a 390px, **sem scroll horizontal em nenhum breakpoint**, alvos de toque ≥ 44px sempre. Hover enriquece, nunca substitui. Em telas maiores, o espaço extra vira **mais respiro, não mais conteúdo**.

- **Mobile (< 768px)** — exatamente como o conceito visual: bottom navigation, botão de pânico flutuante acima dela, modais como bottom-sheet.
- **Tablet (≥ 768px)** — fluxos de foco (sigilo, cadastro, triagem, feedback) em coluna central `max-w-xl` com respiro generoso; home e listas em grid de 2 colunas, no máximo.
- **Desktop (≥ 1024px)** — bottom nav vira **sidebar fixa à esquerda** (mesmos itens; botão de pânico ancorado no rodapé da sidebar, sempre visível); conteúdo em `max-w-5xl`; matches em grid de 3 cards lado a lado; sala de vídeo em layout teatro (vídeo central amplo, self-view no canto, chat em painel lateral colapsável); modais viram dialog centrado.
- Tema light/dark global: toggle acessível no app (perfil/sidebar), respeitando `prefers-color-scheme` na primeira visita e persistindo em `localStorage`.

## 4. Regras de produto que o front deve respeitar (dos RFs)

- **Gate LGPD:** sem aceite não há cadastro (RN-CO-02.1). Recusa acolhida sem nudge; o convite continua válido (RF-CO-03.1, RN-CO-03.2).
- **Triagem:** 5 perguntas fixas, sem ramificação (RN-CO-05.2); salvamento progressivo resposta a resposta (RF-CO-05.3); pular registra "preferência não informada" (RF-CO-05.4).
- **Matches:** 3 perfis + "Por que esses três" (RF-CO-06.2); "ver outras opções" recalcula (RF-CO-06.4); ranking interno nunca exposto (RN-CO-06.3).
- **Sessão:** 50 minutos com aviso 5 min antes do fim (RF-CO-09.5); **sem gravação** — e a UI diz isso (RN-CO-09.1); indicador de privacidade/criptografia visível (RF-CO-09.3); mute, câmera, chat (RF-CO-09.4). A sala é mock visual — fornecedor WebRTC (Daily/Twilio) a definir; estruture o componente para receber o provider depois.
- **Botão de pânico em todas as telas relevantes** (RF-CO-12.4). Protocolo BEN-23: confirmação curta → opções (plantonista / CVV 188 / SAMU 192) → sala de emergência (RN-CO-12.2). Em crise: zero jargão, zero CTA comercial.
- **Nina:** nunca diagnostica nem substitui o profissional (RN-CO-12.1) — disclaimer permanente e discreto no chat.
- **Check-in:** opcional, sem penalidade (RN-CO-13.1); cadência escolhida pelo beneficiário (RN-CO-13.3); modos conversacional (Nina) e formulário curto.
- **Reagendamento em 1–2 cliques** (RF-CO-12.2), sem julgamento na copy.

## 5. Telas — escopo (Fluxo 2 · Beneficiário)

**P0 = completa e navegável. P1 = versão simples funcional. Stub = rota com placeholder digno (copy Cora, não "em construção" seco).** As 5 telas-herói (★) replicam o conceito visual aprovado.

| ID | Tela | Prior. | Ref. RF | Nota de implementação |
|---|---|---|---|---|
| BEN-01 | Entrada via link de convite | P0 | RF-CO-01.1 | Rota `/convite/:token`; valida e redireciona ao sigilo |
| BEN-02 | Link expirado / inválido / já usado | P0 | RF-CO-01.4 | 3 estados distintos, caminho de recuperação |
| BEN-03 ★ | Sigilo LGPD (gate de confiança) | P0 | RF-CO-02.1/02.2 | Replicar conceito; aceite registrado no estado global |
| BEN-04 | Modal Termos e Política completos | P0 | RF-CO-02.2 | Já existe no conceito; âncoras por seção |
| BEN-05 | Despedida (recusa do consentimento) | P0 | RF-CO-03.1 | Sem nudge; "volte quando quiser" |
| BEN-06 | Cadastro (completar perfil) | P0 | RF-CO-04.1/04.2 | Pré-preenchido (mock da carga RH) + senha, apelido, sexo/gênero, telefone opcional, foto. Em passos curtos |
| BEN-07 | Integração com agenda pessoal | P0 | RF-CO-04.5 | UI de conexão iCal/Google (mock) |
| BEN-08 | Aceite de comunicações | P0 | RF-CO-04.3 | Opt-in separado: transacional × marketing |
| BEN-09 ★ | Triagem — 5 perguntas | P0 | RF-CO-05.1/05.2 | Replicar conceito; completar as 5 perguntas (propor as 3 restantes no tom Cora, marcar como "a validar com Domus") |
| BEN-10 | Roda da Vida (complemento) | P1 | RF-CO-05.5 | Radar interativo simples (reusar RadarChart) |
| BEN-11 | Loader humanizado dos matches | P1 | — | Microcopy Cora rotativa durante o "processamento" |
| BEN-12 ★ | 3 Matches curados | P0 | RF-CO-06.1/06.2 | Replicar conceito; grid 3 col. no desktop |
| BEN-13 | Detalhe do perfil do profissional | P0 | RF-CO-06.3 | Página/modal: formação, abordagem, agenda |
| BEN-14 | Agendamento da 1ª sessão | P0 | RF-CO-08.1/08.2 | Calendário com slots mockados |
| BEN-15 | Confirmação de sessão agendada | P0 | RF-CO-08.2 | Data/hora/link + adicionar à agenda |
| BEN-16 | Teste de equipamento (pré-sessão) | P0 | RF-CO-09.2 | Checagem visual câmera/mic/conexão (mock) |
| BEN-17 ★ | Sala de vídeo (sessão) | P0 | RF-CO-09.1/09.3/09.4 | Replicar conceito; layout teatro no desktop; aviso de 5 min finais |
| BEN-18 | Feedback pós-sessão | P0 | RF-CO-11.1 | Pergunta única e calorosa (não é NPS) |
| BEN-19 | Decisão "Quer continuar com [nome]?" | P0 | RF-CO-10.1 | Trocar é normal — copy RF-CO-10.4 |
| BEN-20 | Re-match + compartilhar prontuário | P0 | RF-CO-10.3 | Opt-in explícito de compartilhamento |
| BEN-21 ★ | Home do Beneficiário | P0 | RF-CO-12.1 | Replicar conceito; grid 2 col. tablet+, sidebar desktop |
| BEN-22 | Chat com Nina (IA 24/7) | P0 | RF-CO-12.3 | Conversa mockada com respostas roteirizadas; disclaimer RN-CO-12.1; detecção de risco encaminha ao BEN-23 |
| BEN-23 | Acionamento do Botão de Pânico | P0 | RF-CO-12.4, RN-CO-12.2 | Confirmação → plantonista / CVV 188 / SAMU 192 → sala de emergência. Cuidador puro |
| BEN-24 | Reagendamento de sessão | P0 | RF-CO-12.2, RF-CO-08.4 | 1–2 cliques, sem julgamento |
| BEN-25 | Configuração de cadência de check-in | P0 | RF-CO-13.1 | Opcional/diário/semanal/personalizado · modo Nina ou formulário |
| BEN-26 | Check-in conversacional via Nina | P0 | RF-CO-13.2 | Diálogo curto, pilares NR-1 |
| BEN-27 | Check-in modo formulário curto | P0 | RF-CO-13.3 | 3–5 perguntas rápidas |
| BEN-28 | Roda da Vida — evolução no tempo | P1 | RF-CO-13.4/13.6 | Radar comparativo (hoje × 1 mês atrás) |
| BEN-29 | Conquistas (gamificação leve) | P1 | RF-CO-13.5 | Selos de marcos; celebração sóbria, sem infantilizar |
| BEN-30 | Relatório pessoal (timeline) | P1 | RF-CO-15.1/15.3 | Carta de progresso; botão exportar PDF (mock) |
| BEN-31 | Meus dados + solicitar prontuário | P0 | RF-CO-14.1 | Abre ticket de solicitação (não download direto) |
| BEN-32–35 | Migração B2C (aviso, planos, pagamento, confirmação) | P1 | RF-CO-16.x | **Stub** de rota apenas |

### Rotas sugeridas

`/convite/:token` → `/sigilo` → `/cadastro` (3 passos) → `/triagem/:passo` → `/matches` (com loader) → `/profissional/:id` → `/agendar/:id` → `/confirmacao` → `/pre-sessao/:id` → `/sessao/:id` → `/sessao/:id/feedback` · `/home` · `/nina` · `/emergencia` · `/check-in/*` · `/evolucao` · `/meus-dados`

## 6. Voz da marca — Cora (filtro de toda copy nova)

- **Arquétipos:** Cuidador (presença, acolhimento) 60% · Sábio (rigor, evidência) 30% · Amante (vínculo) 10%.
- **Usa:** cuidado, segurança, evidência, acolhimento, presença, vínculo, confiança, "você não está sozinho", acesso, humano, real.
- **Evita:** "transforme sua vida", "plataforma líder", "você merece!", ROI, ecossistema, empoderar, disruptiva, jargão corporativo, frases de efeito sem base.
- Empática com equilíbrio: valida sem catastrofizar. Direta e clara. Em momentos sensíveis (LGPD, crise, recusa): nenhum jargão, nenhum CTA agressivo, presença total.
- A microcopy das 5 telas-herói do conceito visual já foi validada — **reuse literalmente**. Copy nova (BEN-22, BEN-23, estados de erro etc.) segue o mesmo filtro: *"isso soa como uma especialista que se importa, ou como uma marca tentando parecer que se importa?"*
- Nada de Lorem ipsum em lugar nenhum — incluindo estados vazios e erros.

## 7. Estados, acessibilidade e qualidade

- **Todo fetch tem 3 estados:** carregando (skeletons com os raios/sombras dos tokens), vazio e erro — todos com microcopy Cora.
- **WCAG AA** nos dois temas; foco visível; HTML semântico (nav, main, dialog, radiogroup, progressbar); `aria-label` em todo controle só-ícone.
- **Cores:** seguir o que está definido no design system (paleta índigo) — é a referência encerrada para o frontend.
- Avatares e thumbnails por SVG inline/blocos de cor — sem arquivos de imagem externos inexistentes.

## 8. Definição de pronto

1. `npm run dev` sem erros; `tsc -b` limpo; `npm run build` ok.
2. Jornada navegável de ponta a ponta sem dead-ends: convite → sigilo → cadastro → triagem → matches → agendamento → pré-sessão → sala → feedback → decisão → home → (Nina, check-in, pânico, evolução, meus dados).
3. Testado visualmente a 390px, 768px e 1280px, light e dark — sem scroll horizontal, botão de pânico sempre alcançável.
4. Releitura final de cada tela contra a seção 2 (leveza): um CTA primário por tela, respiro generoso, nada disputando atenção.
5. `README.md` com: arquitetura (Context + services, sem libs extras), mapa rota → tela → RF, o que está mockado (e como trocar pela API real), pendências herdadas (perguntas da triagem com Domus, Termos com jurídico, fornecedor de vídeo).
