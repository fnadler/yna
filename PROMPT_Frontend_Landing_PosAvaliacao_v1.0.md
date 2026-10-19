# PROMPT — Landing pós-avaliação NR-1 ("Conhecer a YNA") · v1.0

> Cole este prompt no Claude Code com o repositório `yna/` aberto. Ele transforma o protótipo
> estático `landing-nr1/index.html` numa tela React do `frontend/`, integrada ao fluxo do colaborador.

---

## 1. Contexto

Você vai trabalhar no `frontend/` do YNA Care Hub (React 18 + TypeScript + Vite + Tailwind 3 +
React Router 6, dados mockados atrás de `src/services/`). Antes de escrever código, leia:

1. `frontend/README.md`: em especial **Arquitetura**, **Camada de serviços**, **Mapa rota → tela → RF —
   Colaborador** e a seção de changelog **Ajustes desta revisão** (último item hoje: 57).
2. `landing-nr1/index.html` e `landing-nr1/README.md`: **referência visual e de copy aprovada**.
   Layout, hierarquia, textos, ordem das seções e comportamento devem sair daqui. Não reescreva a copy.
3. `frontend/src/screens/ColConviteConta.tsx`: o botão "Conhecer a YNA" hoje não tem destino. É
   ele que passa a abrir esta tela.
4. `frontend/src/screens/NR1BenConclusao.tsx` e `Ben05Despedida.tsx`: tom de voz e garantias de
   anonimato que esta tela não pode contradizer.
5. Componentes a reaproveitar: `Button`, `YnaLogo` (`LogoYna`), `Badge`, `Sheet`, `VideoImersivo`,
   `ArtigoModal`, `Input`, e o hook `useService`. Tokens em `tailwind.config.ts` e `src/index.css`.

**Atenção ao recorte do produto:** o README diz que a plataforma deixou de ter teleatendimento,
agendamento e sessões. Esta tela **só anuncia** esses serviços como "Em breve" e coleta interesse.
Não crie fluxo de agendamento, perfil de profissional, nem nenhuma rota além da descrita abaixo.

## 2. O que construir

### 2.1 Rota e tela
- Nova tela `src/screens/ColConhecerYna.tsx`, rota **`/conhecer-yna`**.
- Rota **standalone**, fora do `AppLayout` (sem sidebar/bottom-nav), declarada em `App.tsx`
  junto das demais rotas do fluxo pós-avaliação, com um comentário no padrão do arquivo explicando
  o porquê.
- Acessível **sem conta e sem login**. Não use guarda de rota nem exija o estado `nr1` do `AppContext`.
- Em `ColConviteConta.tsx`, o botão "Conhecer a YNA" passa a fazer `navigate('/conhecer-yna')`.
  Atualize o comentário do arquivo, que hoje diz que a página "ainda não existe".

### 2.2 White-label (só o nome da empresa varia)
- O nome da empresa vem, nesta ordem: (1) query param `?empresa=` (links por e-mail/QR code);
  (2) um método novo de serviço, `nr1ColaboradorService.empresaDaCampanha()`, que no mock
  devolve o `nomeFantasia` da empresa-piloto (`rhMock.ts`); (3) o fallback `"sua empresa"`.
- Sanitize o valor do query param (trim, colapsar espaços, no máximo 60 caracteres). Renderize sempre
  como texto, nunca como HTML.
- **Regra de copy:** nunca use artigo antes do nome ("oferecido por X", "X trouxe a YNA"). Assim
  funciona com qualquer gênero ("o Grupo…", "a Construtora…"). Onde a frase precisaria de artigo,
  use "a sua empresa" genérico, como o HTML de referência já faz.
- O título da aba fica `YNA · Cuidado oferecido por {empresa}`.

### 2.3 Seções (na ordem do HTML de referência)
1. **Topo:** `LogoYna` + divisor + "Cuidado oferecido por {empresa}". Navegação âncora a partir de
   1140px. Botão "Precisa de ajuda agora?" (rótulo curto "Ajuda agora" no mobile) que rola até a seção 3.
   Sticky, com fundo translúcido e borda ao rolar.
2. **Hero:** "Você nunca **está só.**", lead com o nome da empresa, 2 CTAs (Explorar conteúdos /
   Conhecer a YNA) e o selo de anonimato com `ph:shield-check-bold`. Ao lado, a foto mascarada na
   forma "pedrinha" com as pedras da marca flutuando e a tag "Presença sem intrusão".
3. **Ajuda imediata (prioridade máxima de visibilidade):** card escuro (`bg-yna-gradient-dark`)
   sobreposto ao fim do hero, com a foto das mãos, **CVV 188** e **SAMU 192** como links `tel:`, chat
   do CVV (`https://cvv.org.br`, abre em nova aba com `rel="noopener"`) e a orientação de ir ao
   pronto-socorro ou à UPA. Não mova esta seção para baixo nem a esconda atrás de um clique.
4. **Quem é a YNA:** foto mascarada (forma "disco oblongo") + citação; 3 pilares, sendo
   "Cuidado, não vigilância" o card largo.
5. **Em breve:** fundo em gradiente da marca, 2 cards (Teleatendimento em saúde mental /
   Acompanhamento entre as sessões) com `Badge` "Em breve" e checklist, mais 3 passos (interesse →
   aviso → você decide).
6. **Conteúdos:** abas acessíveis **Para você / Para quem lidera** (role="tablist", setas ←/→,
   `aria-selected`, `tabIndex` móvel). Cada aba tem 1 vídeo em destaque, 2 vídeos menores e 4 artigos.
   Vídeo abre o `VideoImersivo` e artigo abre o `ArtigoModal`, os mesmos de `/apoio`. Se esses
   componentes não suportarem um item sem mídia real, mostre no modal o aviso "Prévia · o conteúdo
   completo chega em breve à biblioteca YNA", como no HTML.
7. **Lista de interesse:** texto + checklist + o aviso "Este formulário é separado da avaliação…",
   e o formulário (seção 2.5).
8. **Rodapé:** logo branco, "you are **never alone**", "Cuidado em saúde emocional oferecido por
   {empresa} em parceria com a YNA", links âncora, links de emergência e o aviso "Esta página não
   substitui atendimento médico ou psicológico."

### 2.4 Conteúdo (dados)
- Estenda `src/data/conteudoApoioMock.ts` sem quebrar `/apoio`: adicione aos tipos os campos opcionais
  `publico?: 'colaborador' | 'lideranca'` e `imagem?: string` (URL da foto de capa; quando ausente,
  continua valendo o gradiente `capa`).
- Cadastre os 6 vídeos e os 8 artigos do HTML de referência (títulos, categorias, durações e resumos
  idênticos), com `publico` preenchido. Os artigos precisam de um `corpo` curto (2 ou 3 blocos) para o
  `ArtigoModal` não ficar vazio.
- Mantenha o comentário do arquivo dizendo que o conteúdo está **pendente de curadoria clínica**.
- Exponha os dados por um método de serviço (por exemplo `conteudoService.landing()`) consumido com
  `useService`. Não importe o mock direto na tela.

### 2.5 Formulário de interesse
- Campos: nome (obrigatório), e-mail (obrigatório, validado), WhatsApp (opcional, máscara
  `(00) 00000-0000`), perfil (radio em pílulas: Colaborador(a) / Liderança / RH), interesses
  (checkbox em pílulas: Teleatendimento [marcado por padrão] / Acompanhamento / Novos conteúdos) e
  consentimento LGPD (obrigatório, com o texto exato do HTML).
- Erros inline embaixo de cada campo, foco no primeiro inválido, `aria-invalid`.
- Envio por um serviço novo, `interesseService.registrar(payload)`, com tipo próprio, `delay` como
  os demais mocks e retorno `{ ok: true }`. Botão em estado de carregamento durante o envio. No sucesso,
  o card troca para o estado "Pronto, obrigado, {primeiro nome}." com "Voltar aos conteúdos".
- **Regra de privacidade (não negociável):** o payload leva apenas os campos do formulário e o nome
  da empresa. **Nunca** inclua `campanhaId`, protocolo, respostas, nada do `AppContext.nr1` nem
  qualquer identificador que permita ligar o contato às respostas da avaliação. Não grave os dados em
  `localStorage` e não faça `console.log` deles. Escreva essa regra num comentário no serviço.

### 2.6 Visual e marca
- Use os tokens e as classes do projeto (`bg-yna-gradient-*`, `text-primary`, `font-heading`,
  `rounded-2xl`, `shadow-*`, `animate-yna-*`). Não introduza cores hex soltas se já existir token. As
  exceções aceitáveis são os gradientes das pedras e da seção "Em breve", que devem virar entradas em
  `backgroundImage` no `tailwind.config.ts`, se ainda não existirem.
- **Máscaras orgânicas:** crie em `src/index.css` as utilidades `.mask-pedrinha`, `.mask-pedra` e
  `.mask-oblongo` usando os paths de `public/images/forma-*.svg` como data URI (`mask` +
  `-webkit-mask`, `100% 100%`), exatamente como em `landing-nr1/index.html`. Crie também um
  componente `Pedra` (`src/components/Pedra.tsx`) para as pedras decorativas SVG (forma × preenchimento).
- **Imagens:** copie `landing-nr1/images/*.jpg` para `frontend/public/images/landing/` (já estão
  otimizadas, de 50 a 160 KB). Não use os originais de 700 KB. As fotos decorativas levam
  `aria-hidden` e as que têm significado levam `alt`/`aria-label`.
- **Dark mode:** a tela deve funcionar nos dois temas (`ThemeContext`), usando os tokens
  `surface`/`ink`/`border`, como as outras telas. O card de ajuda já é escuro nos dois.
- **Movimento:** entrada do hero com `animate-yna-slide-up`/`animate-yna-image`, revelação por
  `IntersectionObserver` nas seções e flutuação lenta das pedras. Tudo desligado com
  `prefers-reduced-motion`.
- **Responsivo:** mobile primeiro, sem rolagem horizontal em 360px. Grids passam para 2 colunas a partir
  de ~900px.

## 3. O que NÃO fazer
- Não alterar outras telas além de `ColConviteConta.tsx` e `App.tsx`.
- Não criar conta, login, agendamento ou qualquer integração real de backend.
- Não mudar a copy aprovada. Se algum texto não couber em algum breakpoint, ajuste o layout, não o texto.
- Não adicionar dependências npm novas.

## 4. Documentação
- `frontend/README.md`: adicione `/conhecer-yna` ao **Mapa rota → tela → RF — Colaborador**, crie o
  item **58** em "Ajustes desta revisão" (no mesmo formato dos anteriores) e registre em
  **O que está mockado e como trocar** os serviços `interesseService.registrar` e `empresaDaCampanha`.
- Em **Pendências herdadas**, registre: (a) curadoria clínica dos conteúdos; (b) confirmação, com o
  negócio, de que a empresa contratante **não** recebe os contatos da lista de interesse, porque a copy
  promete isso.

## 5. Critérios de aceite (verifique antes de encerrar)
- [ ] `npm run build` passa sem erros de TypeScript.
- [ ] `/conhecer-yna?empresa=Grupo%20Horizonte` mostra o nome em todos os pontos, e sem o parâmetro
      mostra o nome da empresa do mock.
- [ ] O botão "Conhecer a YNA" de `/avaliacao/conta` leva à tela.
- [ ] A seção de ajuda imediata aparece na primeira rolagem do mobile, e os links `tel:188` e
      `tel:192` funcionam.
- [ ] As abas funcionam por teclado. Vídeos e artigos abrem e fecham (inclusive com Esc).
- [ ] O formulário bloqueia o envio sem nome, e-mail válido ou consentimento, e o payload enviado
      não contém nenhum dado da avaliação.
- [ ] Sem rolagem horizontal em 360px, 390px, 768px e 1440px, nos temas claro e escuro.
- [ ] `/apoio` continua funcionando igual (tipos estendidos sem quebrar nada).

Ao terminar, liste os arquivos criados ou alterados e qualquer desvio em relação ao HTML de referência,
com o motivo.
