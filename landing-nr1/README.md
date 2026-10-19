# Landing pós-avaliação NR-1 (protótipo estático)

Página de destino para quem conclui o questionário NR-1. Corresponde ao botão "Conhecer a YNA"
de `frontend/src/screens/ColConviteConta.tsx`, que hoje está sem destino.

## Como abrir
Abra `index.html` no navegador. Para testar o white-label:
`index.html?empresa=Grupo%20Horizonte%20Logística`
Sem parâmetro, aparece "Sua empresa" (constante `EMPRESA_PADRAO` no script).

## O que é fixo e o que muda
- Variável: só o nome da empresa (elementos com `data-empresa`). Os textos foram escritos sem
  artigo antes do nome ("oferecido por X", "X trouxe a YNA"), para funcionar com qualquer gênero.
- Fixo: todo o resto.

## Pendências antes de ir para produção
1. **Formulário sem backend**: o submit valida, faz `console.log` e mostra o sucesso. Falta definir o endpoint.
2. **Promessa de privacidade**: a página afirma que a empresa NÃO recebe os dados de contato do formulário
   e que só vê números coletivos. Se o modelo comercial prevê repassar leads ao RH, esse texto precisa mudar.
3. **Conteúdos**: títulos e resumos são rascunho editorial (mesma linha de `conteudoApoioMock.ts`),
   pendentes de curadoria clínica. Os cards abrem uma prévia com aviso "chega em breve".
4. **Dependências externas**: Google Fonts e iconify-icon (CDN, com ícones Phosphor via API Iconify).
   Na integração ao React, trocar por `@iconify/react` e pelas fontes já usadas no app.
5. Imagens: são cópias redimensionadas de `frontend/public/images` (pasta `images/`).
