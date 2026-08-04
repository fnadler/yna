# Base mockada — Teste do fluxo de importação (Fluxo C)

Arquivos de apoio para o teste de usabilidade da **importação de beneficiários** (tela RH-11 → "Importar planilha").

| Arquivo | Uso no teste |
| --- | --- |
| `modelo-beneficiarios-yna.csv` | O "modelo" que o RH baixaria pelo botão **Baixar modelo de planilha**. Cabeçalho + 2 linhas de exemplo. |
| `base-teste-importacao-beneficiarios.csv` | A planilha que o participante **faz upload** na tarefa C1. 154 linhas, com 3 erros plantados. |

## Colunas (campos mínimos da carga — RF-RH-04.1)
`Nome completo · CPF · Data de nascimento · Departamento · E-mail corporativo`
Separador `;` · codificação UTF-8 (com BOM) · departamentos iguais aos de BCP Securities.

## Coerência com o resultado exibido na tela
> A importação no MVP é **simulada**: o upload de qualquer arquivo retorna sempre o mesmo resultado
> (`services/rh.ts → importar`). Esta base foi montada para **bater exatamente** com esse resultado,
> de modo que o participante veja no arquivo os mesmos erros que a tela aponta.

Ao importar, a tela mostra: **154 total · 151 válidos · 1 duplicado · 3 com erro**.

| Linha (no arquivo) | Nome | Erro exibido | O que há na base |
| --- | --- | --- | --- |
| 14 | João Alves | E-mail corporativo inválido | `joao.alves@` (incompleto) |
| 27 | Marina Pires | CPF inválido | `123.456.789-00` (dígito verificador inválido) |
| 39 | Carlos Brito | E-mail duplicado (linha 8) | mesmo e-mail da linha 8 (`carlos.brito@…`) |

> O cabeçalho é a linha 1 do arquivo; por isso a "linha 14" da tela corresponde à linha 14 do arquivo
> aberto no Excel/Sheets. Todas as demais 151 linhas têm CPF com dígito verificador válido e e-mail único.

## Como usar na sessão
1. Antes: tenha os dois arquivos à mão (ou hospedados para download durante o teste remoto).
2. Tarefa C1: peça ao participante para importar a lista → ele seleciona `base-teste-importacao-beneficiarios.csv`.
3. Tarefa C2: ao ver os 3 erros, observe se ele entende **o que corrigir** e **onde** (a linha citada existe de fato no arquivo).
4. Se quiser testar a variação "planilha limpa", gere uma cópia sem as linhas 14/27/39 corrigidas.

## Regenerar / ajustar a base
Gerada por `gen_base.py` (nesta pasta; semente fixa `42`, saída determinística). Para mudar volume,
nomes ou os erros plantados, editar o script e rodar `python3 gen_base.py`.
