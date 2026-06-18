# YNA Care Hub · Conceito Visual v0.1 — Fluxo do Beneficiário

Protótipo de alta fidelidade das 5 telas-herói do fluxo do beneficiário, na stack
oficial do MVP (seção 4.5 do Documento de Requisitos): **React + TypeScript + Vite +
Tailwind CSS**. Dados estáticos — a camada de API (Node/Fastify, PostgreSQL/Prisma)
está fora do escopo deste conceito visual.

## Como rodar

```bash
npm install
npm run dev      # abre em http://localhost:5173
npm run build    # checagem de tipos (tsc -b) + build de produção
```

## O que está aqui

Uma página-galeria exibe as telas em molduras de celular (~390px), cada uma rotulada
com ID + nome, com **toggle global de light/dark mode** no topo.

| Tela | Nome | RFs |
|---|---|---|
| BEN-03 | Sigilo LGPD (gate de confiança) | RF-CO-02.1, RF-CO-02.2 |
| BEN-21 | Home do Beneficiário | RF-CO-12.1 |
| BEN-09 | Triagem — 2 das 5 perguntas (fechada + aberta) | RF-CO-05.1, RF-CO-05.2 |
| BEN-12 | 3 Matches curados | RF-CO-06.1, RF-CO-06.2 |
| BEN-17 | Sala de vídeo durante a sessão | RF-CO-09.1, RF-CO-09.3, RF-CO-09.4 |

### Estrutura

```
src/
  components/   Button, Card, Badge, Textarea, Modal, PhoneFrame,
                BottomNav, Avatar, RadarChart, PanicButton, ThemeToggle
  screens/      Ben03Lgpd, Ben09Triagem, Ben12Matches, Ben17VideoRoom, Ben21Home
  data/         mock.ts (profissionais, sessão, triagem, Roda da Vida)
  index.css     tokens de tema (CSS vars) portados do design system
tailwind.config.ts  tokens estáticos (cores, raios, sombras, gradientes)
```

- **Tokens**: portados 1:1 de `yna-care-hub-design-system.html` (`:root` → light,
  `body[data-theme="dark"]` → `.dark`). Dark mode via `darkMode: 'class'`.
- **Tipografia**: Inter (variável, via `@fontsource-variable/inter`).
- **Ícones**: Phosphor (`ph:*`) via `@iconify/react` — mesmo set do design system.
  Os ícones são carregados da API da Iconify em runtime (requer rede).
- **Imagens**: avatares e thumbnails de vídeo são SVG inline / blocos de cor — nenhum
  arquivo de imagem externo.
- **Acessibilidade**: contraste AA nos dois temas, foco visível, alvos de toque ≥ 44px,
  HTML semântico (radiogroup na triagem, progressbar, dialog no modal, aria-labels nos
  controles da sala de vídeo).

---

## Notas e decisões

### ⚠️ Conflito de cor: índigo × teal (em aberto)

O design system oficial (`yna-care-hub-design-system.html`) define a paleta **índigo**
(primária `#4749A8`, lavanda, rosa, amarelo). Porém, o **logo da YNA e a Branding
Persona usam teal/verde/amarelo**. Este protótipo segue o **índigo do design system**,
conforme decisão de escopo da v0.1. O conflito está sinalizado em comentário no topo
do `index.html`, em um aviso visível na própria galeria, e aqui — precisa ser
resolvido entre FDN Design e YNA antes do build do MVP.

### Suposições feitas

- **Texto das 5 perguntas da triagem**: o documento de requisitos marca como pendência
  (responsável: Virgínia/Domus). As perguntas e opções aqui são propostas de copy no
  tom Cora, para validação.
- **Resumo LGPD "em humano"**: os Termos/Política completos ainda não foram redigidos
  (pendência do jurídico YNA); o modal exibe uma estrutura ilustrativa.
- **k-anonimato**: explicado na tela com o valor mínimo 4, conforme RN-RH-06.1.
- **Profissionais, horários e Roda da Vida**: dados fictícios em `src/data/mock.ts`.
- **Sessão de 50 min** (RF-CO-09.5): o "32 min restantes" da sala é ilustrativo; o
  aviso de 5 min antes do término não foi prototipado nesta v0.1.
- **Botão de pânico**: tratado como pílula flutuante serena acima da bottom nav
  (presente sem ser alarmista) — proposta de padrão a validar com a Domus.
- **Nina**: o card da home usa o gradiente "sunset wellness" do design system como
  assinatura visual da assistente; o texto do card permanece escuro sobre o gradiente
  nos dois temas (como no `card--gradient` do DS).
- **Extensão mínima de token**: `--warning-ink` / `--danger-ink` (texto sobre fundos
  suaves) para garantir contraste AA — mesmo padrão que o DS já aplica em
  `.badge--warning` (`#B07820`).

### Fora do escopo desta v0.1

- As **outras 6 telas-âncora do beneficiário** do Conceito Visual:
  - BEN-22 — Chat com Nina (Assistente IA 24/7)
  - BEN-23 — Acionamento do Botão de Pânico
  - BEN-25 — Configuração da cadência de check-in
  - BEN-26 — Check-in conversacional via Nina
  - BEN-28 — Roda da Vida (evolução no tempo)
  - BEN-30 — Relatório pessoal (timeline de evolução)
- Telas-âncora dos fluxos RH (RH-12, 13, 15), Profissional (PRO-05, 13, 16, 20, 24)
  e Gestores YNA (GES-10, 16, 21).
- Integração real de vídeo (Daily/Twilio — decisão técnica pendente), API, autenticação,
  navegação entre telas e estados de erro/vazio/carregamento.
