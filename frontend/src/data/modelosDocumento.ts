import type { MngModeloDocumento } from '../types'

/* Modelos de documentos — módulo neutro, compartilhado pelo Manager (CMS) e pela
   área do profissional, sem dependência circular entre os mocks. A lista é
   mutável (CRUD no serviço do Manager). publicoTipos vazio = todos os tipos. */
export const modelosDocumento: MngModeloDocumento[] = [
  { id: 'md-1', nome: 'Atestado psicológico', descricao: 'Atesta o comparecimento e a necessidade de afastamento, com CID opcional.', icon: 'ph:file-text-bold', arquivo: 'modelo-atestado-psicologico.docx', formato: 'docx', publicoTipos: ['psicologo'], atualizadoEm: '2026-06-20' },
  { id: 'md-2', nome: 'Encaminhamento médico', descricao: 'Encaminha o paciente para avaliação com outro profissional de saúde.', icon: 'ph:first-aid-bold', arquivo: 'modelo-encaminhamento.docx', formato: 'docx', publicoTipos: [], atualizadoEm: '2026-06-18' },
  { id: 'md-3', nome: 'Declaração de comparecimento', descricao: 'Declara a presença do paciente na sessão, com data e horário.', icon: 'ph:seal-check-bold', arquivo: 'modelo-declaracao-comparecimento.pdf', formato: 'pdf', publicoTipos: [], atualizadoEm: '2026-06-15' },
  { id: 'md-4', nome: 'Relatório psicológico', descricao: 'Relatório descritivo do processo, conforme a Resolução CFP 006/2019.', icon: 'ph:clipboard-text-bold', arquivo: 'modelo-relatorio-psicologico.docx', formato: 'docx', publicoTipos: ['psicologo'], atualizadoEm: '2026-06-10' },
  { id: 'md-5', nome: 'Recibo de sessão', descricao: 'Recibo de pagamento de honorários por sessão de atendimento.', icon: 'ph:receipt-bold', arquivo: 'modelo-recibo-sessao.pdf', formato: 'pdf', publicoTipos: [], atualizadoEm: '2026-05-30' },
  { id: 'md-6', nome: 'Laudo psicológico', descricao: 'Documento com avaliação e conclusão sobre demanda específica.', icon: 'ph:file-magnifying-glass-bold', arquivo: 'modelo-laudo-psicologico.docx', formato: 'docx', publicoTipos: ['psicologo'], atualizadoEm: '2026-05-22' },
]
