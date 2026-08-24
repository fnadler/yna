import type { Nr1RiscoSugerido } from '../types'

/* Riscos psicossociais SUGERIDOS — conteúdo-semente da aba "Riscos sugeridos".

   ⚠️ Isto é uma ferramenta de SUGESTÃO E TRIAGEM, não de diagnóstico. Todo
   texto aqui é deliberadamente redigido em "possível"/"sugere"/"indicativo" —
   nunca em afirmação. Ver os disclaimers renderizados em
   `components/Nr1RiscosSugeridos.tsx` e `components/Nr1RiscoAnaliseSheet.tsx`.

   Adaptado de LISTA_RISCOS_COMPLETA_CID11.md (base: COPSOQ II-Br, 11
   subescalas) para as 4 dimensões do Modelo YNA (Guia do MTE — ver
   `NR1_DIMENSOES` em `nr1Mock.ts`). Onde o documento de origem cita uma
   subescala do COPSOQ sem equivalente direto aqui (ex.: "Saúde Geral",
   "Valores no Local de Trabalho"), o risco foi remapeado para a dimensão e
   os itens do Modelo YNA mais próximos da mesma intenção clínica — não é
   uma tradução pergunta-a-pergunta, e o próprio SST deve validar se o
   remapeamento faz sentido para o contexto do cliente (mesma trilha de
   validação da Parte 4 do documento de origem).

   `nivelGatilho`: nível mínimo da dimensão (escala de `nr1NivelPorMedia`, 5 =
   desejável) a partir do qual a sugestão é oferecida como "pode se aplicar".
   Isolamento social e burnout usam um gatilho mais estrito ('risco') que os
   demais ('atencao'), refletindo a urgência maior que o documento de origem
   atribui a esses dois padrões (possível assédio moral; risco crítico de
   saúde mental). */

export const NR1_RISCOS_SUGERIDOS: Nr1RiscoSugerido[] = [
  {
    id: 'sugg-01',
    categoria: 'pressao-sobrecarga',
    nome: 'Pressão por meta / sobrecarga de trabalho',
    nomeCurto: 'Pressão / sobrecarga',
    descricao: 'Demanda quantitativa acima do sustentável: ritmo acelerado, prazos incompatíveis com a jornada e dificuldade real de fazer pausas.',
    dimensaoId: 'organizacao',
    itensRelacionados: ['OT01', 'OT02', 'OT03', 'OT04'],
    nivelGatilho: 'atencao',
    acoesRecomendadas: [
      'Revisar metas e prazos com a liderança da área — uma redução de 15–25% é um ponto de partida comum',
      'Reforçar a equipe ou redistribuir tarefas nos horários de pico',
      'Instituir pausas regulares e protegidas durante a jornada',
      'Oferecer capacitação em gestão de tempo e priorização',
    ],
    monitoramento: 'Mensal enquanto em atenção ou risco; semanal se atingir crítico.',
    cids: [
      { codigo: 'QE81', descricao: 'Problemas ocupacionais', probabilidade: 'alta' },
      { codigo: 'F43.8', descricao: 'Reação ao estresse intenso', probabilidade: 'media' },
      { codigo: 'F41.1', descricao: 'Transtorno de ansiedade generalizada', probabilidade: 'media' },
    ],
    disclaimerCid: 'Estes códigos indicam possível associação com base no padrão de respostas. Diagnóstico é responsabilidade exclusiva de profissional clínico licenciado.',
  },
  {
    id: 'sugg-02',
    categoria: 'falta-autonomia',
    nome: 'Falta de autonomia / microgerenciamento',
    nomeCurto: 'Falta de autonomia',
    descricao: 'Baixo controle sobre o próprio ritmo e forma de trabalho; pouca margem de decisão mesmo em tarefas rotineiras; ambiente de desconfiança na supervisão.',
    dimensaoId: 'organizacao',
    itensRelacionados: ['OT06', 'OT07', 'OT08', 'OT09'],
    nivelGatilho: 'atencao',
    acoesRecomendadas: [
      'Delegar responsabilidades de forma progressiva, com suporte',
      'Rever o estilo de supervisão junto à liderança direta (coaching de liderança)',
      'Criar programas de desenvolvimento que ampliem a margem de decisão',
    ],
    monitoramento: 'Trimestral — padrão menos volátil que sobrecarga aguda.',
    cids: [
      { codigo: 'QE81', descricao: 'Problemas ocupacionais', probabilidade: 'alta' },
      { codigo: 'F34.8', descricao: 'Depressão persistente leve', probabilidade: 'media' },
      { codigo: 'F43.2', descricao: 'Transtorno de adaptação', probabilidade: 'media' },
    ],
    disclaimerCid: 'Associação possível, não conclusiva. Validação profissional é obrigatória antes de qualquer ação organizacional.',
  },
  {
    id: 'sugg-03',
    categoria: 'isolamento-social',
    nome: 'Isolamento social / falta de suporte',
    nomeCurto: 'Isolamento social',
    descricao: 'Ausência de apoio de chefias ou colegas, atrito recorrente entre pares e sinais de possível hostilidade ou assédio moral — padrão que pede investigação, não só monitoramento.',
    dimensaoId: 'relacoes',
    itensRelacionados: ['RL01', 'RL05', 'RL10', 'RL11'],
    nivelGatilho: 'risco',
    acoesRecomendadas: [
      'Investigar possível conflito ou assédio junto ao canal de escuta e à área jurídica',
      'Programa de integração e aproximação entre a equipe',
      'Capacitar a liderança em mediação de conflito e comunicação não violenta',
      'Crítico: abrir apuração formal se houver qualquer relato concreto de assédio',
    ],
    monitoramento: 'Mensal; semanal se houver relatos concretos no canal de escuta.',
    cids: [
      { codigo: 'QE82', descricao: 'Problemas relacionados a grupo/comunidade', probabilidade: 'alta' },
      { codigo: 'F41.1', descricao: 'Transtorno de ansiedade social', probabilidade: 'media' },
      { codigo: 'F43.2', descricao: 'Transtorno de adaptação com depressão', probabilidade: 'media' },
    ],
    disclaimerCid: 'Possível associação. O padrão pode indicar ambiente hostil — investigação imediata é recomendada, mas a conclusão cabe à empresa e a profissionais habilitados.',
  },
  {
    id: 'sugg-04',
    categoria: 'conflito-trabalho-vida',
    nome: 'Conflito trabalho-vida / desequilíbrio',
    nomeCurto: 'Conflito trabalho-vida',
    descricao: 'O trabalho invade a vida pessoal: expectativa de disponibilidade fora do horário, dificuldade de desconexão no descanso.',
    dimensaoId: 'contexto',
    itensRelacionados: ['CE01', 'CE02', 'CE03'],
    nivelGatilho: 'atencao',
    acoesRecomendadas: [
      'Publicar política de desconexão, com regras claras por área',
      'Adotar flexibilidade de horário ou home office quando possível',
      'Definir escala formal de sobreaviso, com compensação',
      'Respeitar o direito à desconexão fora da jornada',
    ],
    monitoramento: 'Mensal — correlaciona fortemente com esgotamento (ver Burnout).',
    cids: [
      { codigo: 'QE81', descricao: 'Problemas ocupacionais', probabilidade: 'alta' },
      { codigo: 'G47.0', descricao: 'Insônia não orgânica', probabilidade: 'media' },
      { codigo: 'F32/F33', descricao: 'Episódio depressivo', probabilidade: 'baixa' },
    ],
    disclaimerCid: 'Insônia pode ter múltiplas causas. Um profissional clínico deve avaliar antes de qualquer conclusão.',
  },
  {
    id: 'sugg-05',
    categoria: 'desalinhamento-valores',
    nome: 'Desalinhamento de valores / cultura tóxica',
    nomeCurto: 'Desalinhamento de valores',
    descricao: 'Tensão e atrito nas relações de trabalho que apontam para um problema de cultura, não só de convivência pontual — falta de transparência ou comportamentos corporativos questionáveis.',
    dimensaoId: 'relacoes',
    itensRelacionados: ['RL08', 'RL09'],
    nivelGatilho: 'atencao',
    acoesRecomendadas: [
      'Revisar ou reforçar o código de conduta com a liderança',
      'Garantir um canal de denúncia efetivo e seguro (o Canal de escuta já cumpre esse papel)',
      'Investigar relatos junto ao compliance',
      'Corrigir comportamentos tóxicos identificados, com apoio da liderança sênior',
    ],
    monitoramento: 'Mensal — risco reputacional e legal; imediato se houver relato de assédio.',
    cids: [
      { codigo: 'QE81', descricao: 'Problemas ocupacionais', probabilidade: 'alta' },
      { codigo: 'F43.2', descricao: 'Transtorno de adaptação com ansiedade', probabilidade: 'media' },
      { codigo: 'Z70.0', descricao: 'Aconselhamento relacionado a problemas pessoais', probabilidade: 'baixa' },
    ],
    disclaimerCid: 'Conflito de valores é um aspecto psicossocial, não um diagnóstico psiquiátrico direto — mas pode correlacionar com transtornos de adaptação.',
  },
  {
    id: 'sugg-06',
    categoria: 'burnout',
    nome: 'Burnout / esgotamento profissional',
    nomeCurto: 'Burnout',
    descricao: 'Sobrecarga persistente sem alívio: o mesmo padrão de demanda excessiva de "Pressão/sobrecarga", mas já com sinais de esgotamento acumulado — risco de maior urgência clínica, não só operacional.',
    dimensaoId: 'organizacao',
    itensRelacionados: ['OT01', 'OT02', 'OT03', 'OT04'],
    nivelGatilho: 'risco',
    acoesRecomendadas: [
      'Acompanhamento psicológico semanal ou quinzenal para quem está mais exposto',
      'Avaliar possível afastamento temporário, com acompanhamento médico',
      'Reduzir a carga de trabalho de forma imediata, não só planejada',
      'Obrigatório: encaminhar para profissional clínico diante de qualquer sinal de esgotamento grave',
    ],
    monitoramento: 'Semanal ou quinzenal — risco crítico enquanto o padrão persistir.',
    cids: [
      { codigo: 'QE81', descricao: 'Problemas ocupacionais', probabilidade: 'alta' },
      { codigo: 'F43.0', descricao: 'Reação ao estresse grave e transtorno de ajustamento', probabilidade: 'alta' },
      { codigo: 'F32/F33', descricao: 'Episódio/transtorno depressivo recorrente', probabilidade: 'media' },
      { codigo: 'F41', descricao: 'Transtorno de ansiedade generalizada', probabilidade: 'media' },
      { codigo: 'G47.0', descricao: 'Insônia não orgânica', probabilidade: 'media' },
    ],
    disclaimerCid: 'Burnout não é, em si, um diagnóstico CID-11 — mas correlaciona com F43.0. Diagnóstico de depressão ou ansiedade exige avaliação clínica.',
  },
  {
    id: 'sugg-07',
    categoria: 'desengajamento',
    nome: 'Desengajamento / falta de significado',
    nomeCurto: 'Desengajamento',
    descricao: 'Falta de clareza sobre como o trabalho se conecta a algo maior; ausência de identificação com os objetivos da área — um padrão de apatia, diferente da sobrecarga.',
    dimensaoId: 'organizacao',
    itensRelacionados: ['OT10', 'OT11', 'OT12'],
    nivelGatilho: 'atencao',
    acoesRecomendadas: [
      'Revisar a alocação em projetos ou times junto à liderança',
      'Construir um plano de desenvolvimento/carreira individualizado',
      'Oferecer mentoria ou coaching',
      'Acompanhar o indicador no próximo ciclo — pode sinalizar risco de saída',
    ],
    monitoramento: 'Trimestral, inicialmente; mensal se houver indícios de intenção de saída.',
    cids: [
      { codigo: 'QE81', descricao: 'Problemas ocupacionais', probabilidade: 'alta' },
      { codigo: 'F34.8', descricao: 'Depressão persistente leve', probabilidade: 'media' },
      { codigo: 'Z56.9', descricao: 'Problema ocupacional não especificado', probabilidade: 'baixa' },
    ],
    disclaimerCid: 'Desengajamento é um aspecto psicossocial ocupacional. Pode evoluir para quadros depressivos se não for tratado — validação profissional é obrigatória para qualquer conclusão.',
  },
]
