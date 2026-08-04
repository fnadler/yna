#!/usr/bin/env python3
# Gera a base de teste de importacao de beneficiarios (154 linhas) coerente
# com o resultado simulado da tela (154 total, 151 validos, 1 duplicado, 3 erros
# nas linhas 14/27/39). Header = linha 1; assim a linha do arquivo == linha exibida.
import csv, random, unicodedata, os

random.seed(42)  # deterministico

DEPTS = [
    "Trading & Mercados", "Tecnologia", "Operações",
    "Compliance & Risco", "Pessoas & DHO", "Diretoria",
]
PRIMEIROS = ["Ana","Bruno","Camila","Diego","Eduarda","Felipe","Gabriela","Henrique",
    "Isabela","Rafael","Larissa","Marcos","Natália","Otávio","Patrícia","Rodrigo",
    "Sofia","Thiago","Vanessa","Wagner","Beatriz","Caio","Daniela","Enzo","Fernanda",
    "Gustavo","Helena","Igor","Juliana","Leandro","Mariana","Nicolas","Olívia","Paulo",
    "Renata","Samuel","Tatiana","Vinícius","Yara","André"]
SOBRENOMES = ["Silva","Souza","Oliveira","Pereira","Costa","Rodrigues","Almeida","Nascimento",
    "Lima","Araújo","Fernandes","Carvalho","Gomes","Martins","Rocha","Ribeiro","Barbosa",
    "Teixeira","Moraes","Cardoso","Correia","Dias","Castro","Campos","Freitas","Pinheiro",
    "Azevedo","Cavalcanti","Monteiro","Nunes","Moreira","Ramos","Mendes","Vieira"]

def strip_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFKD', s) if not unicodedata.combining(c))

def email_de(nome):
    p = nome.lower().split()
    first = strip_accents(p[0])
    last = strip_accents(p[-1]).replace("'", "")
    return f"{first}.{last}@bcpsecurities.com"

def cpf_valido():
    n = [random.randint(0, 9) for _ in range(9)]
    for _ in range(2):
        s = sum((len(n) + 1 - i) * v for i, v in enumerate(n))
        d = (s * 10) % 11
        n.append(0 if d == 10 else d)
    c = ''.join(map(str, n))
    return f"{c[0:3]}.{c[3:6]}.{c[6:9]}-{c[9:11]}"

def nasc():
    # idade 22..58 => nascidos 1968..2004 (>= 18 anos)
    y = random.randint(1968, 2004)
    m = random.randint(1, 12)
    d = random.randint(1, 28)
    return f"{d:02d}/{m:02d}/{y}"

# monta 154 linhas (data rows). Indices 1..154; header ocupa a linha 1 do arquivo,
# entao data row i fica na linha (i+1). Queremos que as linhas EXIBIDAS 8/14/27/39
# batam com a linha do arquivo -> data row (linha_arquivo - 1).
rows = []
usados = set()
def nome_unico():
    while True:
        nm = f"{random.choice(PRIMEIROS)} {random.choice(SOBRENOMES)}"
        if nm not in usados:
            usados.add(nm); return nm

for i in range(154):
    nm = nome_unico()
    rows.append([nm, cpf_valido(), nasc(), random.choice(DEPTS), email_de(nm)])

def set_linha_arquivo(linha_arquivo, row):
    rows[linha_arquivo - 2] = row  # -1 header, -1 zero-index

# Linha 8: Carlos Brito original (valido) — alvo da duplicidade
carlos_email = "carlos.brito@bcpsecurities.com"
usados.add("Carlos Brito")
set_linha_arquivo(8, ["Carlos Brito", cpf_valido(), nasc(), "Tecnologia", carlos_email])
# Linha 14: João Alves — e-mail corporativo invalido
set_linha_arquivo(14, ["João Alves", cpf_valido(), nasc(), "Operações", "joao.alves@"])
# Linha 27: Marina Pires — CPF invalido
set_linha_arquivo(27, ["Marina Pires", "123.456.789-00", nasc(), "Trading & Mercados", "marina.pires@bcpsecurities.com"])
# Linha 39: Carlos Brito — e-mail duplicado (mesmo da linha 8)
set_linha_arquivo(39, ["Carlos Brito", cpf_valido(), nasc(), "Compliance & Risco", carlos_email])

OUT = os.path.dirname(os.path.abspath(__file__))
def write_csv(path, header, data):
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f, delimiter=";")
        w.writerow(header)
        w.writerows(data)

HEADER = ["Nome completo", "CPF", "Data de nascimento", "Departamento", "E-mail corporativo"]
write_csv(os.path.join(OUT, "base-teste-importacao-beneficiarios.csv"), HEADER, rows)

# Modelo em branco (com 2 exemplos preenchidos, como um template real)
modelo = [
    ["Maria Aparecida Souza", "529.982.247-25", "14/03/1990", "Operações", "maria.souza@bcpsecurities.com"],
    ["José Carlos Lima", "168.995.350-09", "02/11/1985", "Tecnologia", "jose.lima@bcpsecurities.com"],
]
write_csv(os.path.join(OUT, "modelo-beneficiarios-yna.csv"), HEADER, modelo)

# Sumario de conferencia
print("Gerado. Conferencia dos erros plantados:")
for ln in (8, 14, 27, 39):
    print(f"  linha {ln:>3}: {rows[ln-2]}")
print(f"total data rows: {len(rows)}")
