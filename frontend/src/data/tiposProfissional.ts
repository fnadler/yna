import type { MngTipoProfissional } from '../types'

/* Tipos de profissional (§8.5) — módulo neutro, compartilhado pelo Manager
   (CMS), pelo cadastro do profissional e pela triagem do beneficiário, sem
   dependência circular entre os mocks. A lista é mutável (upsert no serviço). */
export const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']

export const mngTiposProfissional: MngTipoProfissional[] = [
  {
    id: 'psicologo', nome: 'Psicólogo', conselho: 'CRP', ativo: true, profissionais: 8,
    campos: [
      { id: 'c1', label: 'Número do CRP', tipo: 'text', obrigatorio: true, ajuda: 'Ex.: 06/123456' },
      { id: 'c2', label: 'UF do CRP', tipo: 'select', obrigatorio: true, opcoes: UFS },
      { id: 'c3', label: 'Linhas teóricas', tipo: 'multiselect', obrigatorio: true, opcoes: ['TCC', 'ACT', 'Psicanálise', 'Gestalt', 'Sistêmica', 'Integrativa', 'Humanista', 'Comportamental', 'Junguiana'] },
      { id: 'c4', label: 'Áreas de atuação', tipo: 'multiselect', obrigatorio: true, opcoes: ['Ansiedade', 'Depressão', 'Estresse', 'Luto', 'Relacionamentos', 'Transição de carreira', 'Autoestima', 'Burnout', 'TDAH'] },
      { id: 'c5', label: 'Apresentação pessoal', tipo: 'textarea', obrigatorio: true, ajuda: 'Fale um pouco sobre você para os beneficiários.' },
      { id: 'c6', label: 'Como você trabalha', tipo: 'textarea', obrigatorio: true, ajuda: 'Como são as suas sessões, sua abordagem…' },
    ],
    triagem: [
      { id: 't1', pergunta: 'O que te traz à terapia neste momento?', tipo: 'aberta', obrigatoria: true },
      { id: 't2', pergunta: 'Quais temas você gostaria de trabalhar?', tipo: 'multipla', obrigatoria: true, opcoes: ['Ansiedade', 'Depressão', 'Relacionamentos', 'Trabalho', 'Luto', 'Autoconhecimento'] },
      { id: 't3', pergunta: 'Você tem preferência de gênero do profissional?', tipo: 'unica', obrigatoria: false, opcoes: ['Indiferente', 'Feminino', 'Masculino'] },
      { id: 't4', pergunta: 'Como está seu nível de estresse hoje?', tipo: 'escala', obrigatoria: false },
    ],
  },
  {
    id: 'nutricionista', nome: 'Nutricionista', conselho: 'CRN', ativo: false, profissionais: 0,
    campos: [
      { id: 'c1', label: 'Número do CRN', tipo: 'text', obrigatorio: true },
      { id: 'c2', label: 'UF do CRN', tipo: 'select', obrigatorio: true, opcoes: UFS },
    ],
    triagem: [],
  },
  {
    id: 'fisioterapeuta', nome: 'Fisioterapeuta', conselho: 'CREFITO', ativo: false, profissionais: 0,
    campos: [
      { id: 'c1', label: 'Número do CREFITO', tipo: 'text', obrigatorio: true },
      { id: 'c2', label: 'UF', tipo: 'select', obrigatorio: true, opcoes: UFS },
    ],
    triagem: [],
  },
]

/** Tipo que dirige o cadastro do profissional e a triagem no protótipo. */
export const tipoProfissionalAtivo = mngTiposProfissional.find((t) => t.id === 'psicologo')!
