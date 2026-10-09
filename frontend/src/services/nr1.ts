import type {
  Nr1QuestionarioModelo, Nr1QuestionarioVersao, Nr1Campanha, Nr1LinhaMapa,
  Nr1RiscoInventario, Nr1Acao, Nr1Relato, Nr1Ciclo, Nr1ResponsavelTecnico,
  Nr1MinhaAvaliacao, Nr1Trilha, Nr1RelatoCategoria, Nr1Comentario,
  Nr1DimensaoId, Nr1NivelRisco,
  Nr1RiscoStatus, Nr1FatorRisco, Nr1FonteGeradora, Nr1Dimensao, Nr1AtividadeTipo,
  Nr1Cid, Nr1FatorAvaliado, Nr1FatorEvolucao, Nr1ItemReavaliacao, Nr1Efetividade, Nr1DecisaoReavaliacao,
} from '../types'
import {
  nr1Modelos, nr1Campanhas, nr1MapaCalor, nr1Acoes, nr1Relatos,
  nr1Ciclos, nr1ResponsavelTecnico, nr1MinhasAvaliacoes, nr1DimensaoNome,
  nr1DimensoesBase, NR1_ESCALAS, NR1_PONTUACAO, NR1_TODAY, nr1NivelPorMedia,
  totalElegiveis, participacaoVazia, nr1RiscosGerados, nr1RiscosTodos,
  nr1DecisoesFator, nr1StatusManual, nr1RiscoIdGerado, nr1CampanhaVigente, nr1CampanhasEncerradas, type Nr1DecisaoFator,
  nr1FatoresRisco, nr1FontesGeradoras, nr1Cids, NR1_DIMENSOES, nr1MediaDimensaoEmpresa,
  nr1AvaliarFatores, nr1EvolucaoFator, nr1CampanhaAnterior, nr1Reavaliacoes,
  nr1RecortesDoCiclo, nr1MediasDoRecorte, NR1_RECORTE_OUTROS,
} from '../data/nr1Mock'
import { rhEmpresa, rhUsuarioAtual } from '../data/rhMock'
import { nr1DistribuirPorItem, ACAO_STATUS, EFETIVIDADE, fmtData } from '../lib/nr1'

/* Camada de serviços do Módulo de Conformidade NR-1 — mockada, com latência
   simulada. As assinaturas espelham a futura API REST; trocar o corpo por
   fetch/axios mantendo os tipos.

   Duas regras de negócio moram aqui e não na UI, para que a futura API possa
   assumi-las sem reescrever tela:
   · publicar/editar versão respeita a imutabilidade da versão publicada;
   · o k-anonimato já vem aplicado nos agregados entregues ao RH. */

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

/** Progresso salvo do questionário do colaborador (RF-CO-NR1-02): guardado
   no `localStorage`, não no `AppContext` — precisa sobreviver ao reinício
   da sessão em memória (fechar a aba, trocar de aparelho) pra permitir
   detectar "avaliação em andamento" ao entrar de novo, mesmo sem conta
   nem backend real neste protótipo. */
interface Nr1ParcialSalvo {
  respostas: Record<string, number | string>
  atualizadoEm: string
}
const chaveParcial = (campanhaId: string) => `yna:nr1:parcial:${campanhaId}`

/** Próximo número de versão a partir do maior existente (1.0 → 1.1 → 2.0…). */
function proximaVersao(versoes: Nr1QuestionarioVersao[]): string {
  const nums = versoes.map((v) => v.versao.split('.').map(Number))
  const maiorMajor = Math.max(...nums.map(([maj]) => maj ?? 0), 0)
  const maiorMinor = Math.max(...nums.filter(([maj]) => maj === maiorMajor).map(([, min]) => min ?? 0), 0)
  return `${maiorMajor}.${maiorMinor + 1}`
}

const clonarVersao = (v: Nr1QuestionarioVersao): Nr1QuestionarioVersao =>
  JSON.parse(JSON.stringify(v)) as Nr1QuestionarioVersao

export const nr1ModeloService = {
  /** Modelos de avaliação psicossocial — base YNA + derivados por cliente. */
  list: async (): Promise<Nr1QuestionarioModelo[]> => {
    await delay(rand(300, 600))
    return nr1Modelos
  },

  get: async (id: string): Promise<Nr1QuestionarioModelo | undefined> => {
    await delay(rand(250, 500))
    return nr1Modelos.find((m) => m.id === id)
  },

  /** Última versão publicada — padrão sugerido ao RH na campanha. */
  versaoPublicada: (m: Nr1QuestionarioModelo): Nr1QuestionarioVersao | undefined =>
    m.versoes.find((v) => v.status === 'publicada'),

  /** Salva a versão RASCUNHO. Versão publicada é imutável: se o alvo já estiver
     publicado, cria uma nova versão rascunho a partir dele (RF-A04). */
  salvarVersao: async (modeloId: string, versao: string, patch: Partial<Nr1QuestionarioVersao>): Promise<Nr1QuestionarioVersao | undefined> => {
    await delay(rand(350, 700))
    const m = nr1Modelos.find((x) => x.id === modeloId)
    if (!m) return undefined
    const alvo = m.versoes.find((v) => v.versao === versao)
    if (!alvo) return undefined

    if (alvo.status !== 'rascunho') {
      const nova: Nr1QuestionarioVersao = {
        ...clonarVersao(alvo), ...patch,
        versao: proximaVersao(m.versoes),
        status: 'rascunho',
        criadaEm: NR1_TODAY,
        publicadaEm: undefined,
        notas: patch.notas ?? `Rascunho derivado da versão ${alvo.versao}.`,
      }
      m.versoes.unshift(nova)
      return nova
    }

    Object.assign(alvo, patch)
    return alvo
  },

  /** Publica um rascunho. A publicada anterior passa a arquivada — só uma
     versão publicada por modelo. */
  publicar: async (modeloId: string, versao: string): Promise<{ ok: boolean; message?: string }> => {
    await delay(rand(400, 800))
    const m = nr1Modelos.find((x) => x.id === modeloId)
    const alvo = m?.versoes.find((v) => v.versao === versao)
    if (!m || !alvo) return { ok: false, message: 'Versão não encontrada.' }
    if (alvo.status !== 'rascunho') return { ok: false, message: 'Só é possível publicar uma versão em rascunho.' }
    m.versoes.forEach((v) => { if (v.status === 'publicada') v.status = 'arquivada' })
    alvo.status = 'publicada'
    alvo.publicadaEm = NR1_TODAY
    return { ok: true }
  },

  /** Arquiva uma versão publicada (fica indisponível para novas campanhas;
     campanhas em curso mantêm a versão com que começaram). */
  arquivar: async (modeloId: string, versao: string): Promise<{ ok: boolean }> => {
    await delay(rand(300, 600))
    const v = nr1Modelos.find((x) => x.id === modeloId)?.versoes.find((x) => x.versao === versao)
    if (v) v.status = 'arquivada'
    return { ok: true }
  },

  /** Cria um novo rascunho vazio a partir do conteúdo-semente do Modelo YNA. */
  novaVersao: async (modeloId: string): Promise<Nr1QuestionarioVersao | undefined> => {
    await delay(rand(300, 600))
    const m = nr1Modelos.find((x) => x.id === modeloId)
    if (!m) return undefined
    const base = m.versoes.find((v) => v.status === 'publicada') ?? m.versoes[0]
    const nova: Nr1QuestionarioVersao = base
      ? { ...clonarVersao(base), versao: proximaVersao(m.versoes), status: 'rascunho', criadaEm: NR1_TODAY, publicadaEm: undefined, notas: `Rascunho derivado da versão ${base.versao}.` }
      : { versao: '1.0', status: 'rascunho', criadaEm: NR1_TODAY, dimensoes: nr1DimensoesBase(), escala: NR1_ESCALAS, pontuacao: NR1_PONTUACAO, abertas: [], notas: 'Primeiro rascunho.' }
    m.versoes.unshift(nova)
    return nova
  },

  /** Deriva um modelo de cliente a partir de uma versão YNA publicada.
     O derivado nasce com o núcleo intacto — o cliente só acrescenta itens
     (governança do §6 do prompt / §1 do questionário). */
  derivarParaCliente: async (p: { origemModeloId: string; origemVersao: string; clienteId: string; clienteNome: string; nome: string; descricao: string }): Promise<Nr1QuestionarioModelo | undefined> => {
    await delay(rand(500, 900))
    const origem = nr1Modelos.find((m) => m.id === p.origemModeloId)
    const versao = origem?.versoes.find((v) => v.versao === p.origemVersao)
    if (!origem || !versao) return undefined
    const modelo: Nr1QuestionarioModelo = {
      id: `mod-${p.clienteId}-${nr1Modelos.length + 1}`,
      nome: p.nome,
      escopo: 'cliente',
      clienteId: p.clienteId,
      clienteNome: p.clienteNome,
      descricao: p.descricao,
      derivadoDe: { modeloId: origem.id, versao: versao.versao },
      versoes: [{
        ...clonarVersao(versao),
        versao: '1.0',
        status: 'rascunho',
        criadaEm: NR1_TODAY,
        publicadaEm: undefined,
        notas: `Derivado da versão ${versao.versao} do ${origem.nome}.`,
      }],
    }
    nr1Modelos.push(modelo)
    return modelo
  },

  /** Diferença entre duas versões — itens acrescentados e removidos. */
  comparar: async (modeloId: string, versaoA: string, versaoB: string): Promise<{ adicionados: string[]; removidos: string[] } | undefined> => {
    await delay(rand(250, 500))
    const m = nr1Modelos.find((x) => x.id === modeloId)
    const a = m?.versoes.find((v) => v.versao === versaoA)
    const b = m?.versoes.find((v) => v.versao === versaoB)
    if (!a || !b) return undefined
    const ids = (v: Nr1QuestionarioVersao) => new Set(v.dimensoes.flatMap((d) => d.itens.map((i) => i.id)))
    const sa = ids(a)
    const sb = ids(b)
    return {
      adicionados: [...sb].filter((i) => !sa.has(i)),
      removidos: [...sa].filter((i) => !sb.has(i)),
    }
  },

  /** Campanhas que aplicaram uma versão — impacto antes de arquivar. */
  usoDaVersao: async (modeloId: string, versao: string): Promise<Nr1Campanha[]> => {
    await delay(rand(200, 450))
    return nr1Campanhas.filter((c) => c.modeloId === modeloId && c.versao === versao)
  },
}

/** Sugestões de ação descartadas por risco. */
const SUGESTOES_DESCARTADAS = new Map<string, Set<string>>()

function removerDecisoes(riscoId: string) {
  for (let i = nr1DecisoesFator.length - 1; i >= 0; i--) if (nr1DecisoesFator[i]!.riscoId === riscoId) nr1DecisoesFator.splice(i, 1)
}

const slug = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'item'

const gerarIdUnico = (base: string, existentes: string[]) => {
  let id = base
  let n = 2
  while (existentes.includes(id)) { id = `${base}-${n}`; n += 1 }
  return id
}

/** Catálogo de fatores de risco, tabela de CIDs e o motor de cálculo dos
   fatores por ciclo (fase 1 da nova estrutura). */
export const nr1FatorService = {
  catalogo: async (): Promise<Nr1FatorRisco[]> => {
    await delay(rand(150, 350))
    return nr1FatoresRisco
  },

  cids: async (): Promise<Nr1Cid[]> => {
    await delay(rand(150, 350))
    return nr1Cids
  },

  /** Perguntas que podem ser vinculadas a um fator — as do Modelo YNA
     publicado (a matriz COPSOQ), com o domínio de cada uma. */
  perguntas: async (): Promise<{ id: string; texto: string; dimensaoId: Nr1DimensaoId }[]> => {
    await delay(rand(150, 350))
    const yna = nr1Modelos.find((m) => m.escopo === 'yna')
    const v = yna?.versoes.find((x) => x.status === 'publicada') ?? yna?.versoes[0]
    return (v?.dimensoes ?? []).flatMap((d) => d.itens.map((i) => ({ id: i.id, texto: i.texto, dimensaoId: d.id })))
  },

  /** Ações sugeridas que o RH descartou para um risco (síncrono: estado de
     tela, vale na sessão). */
  sugestoesDescartadas: (riscoId: string): string[] => [...(SUGESTOES_DESCARTADAS.get(riscoId) ?? [])],

  descartarSugestao: (riscoId: string, sugestaoId: string, descartar: boolean) => {
    const atual = new Set(SUGESTOES_DESCARTADAS.get(riscoId) ?? [])
    if (descartar) atual.add(sugestaoId)
    else atual.delete(sugestaoId)
    SUGESTOES_DESCARTADAS.set(riscoId, atual)
  },

  /** Planos do ciclo anterior a reavaliar no ciclo `campanhaId`: cada risco
     do ciclo anterior que teve ação, com o mesmo fator/recorte antes e
     depois, a leitura e as sugestões (efetividade e próximo passo). */
  reavaliacao: async (campanhaId: string): Promise<Nr1ItemReavaliacao[]> => {
    await delay(rand(300, 600))
    const idAnterior = nr1CampanhaAnterior(campanhaId)
    if (!idAnterior) return []
    const atuais = nr1AvaliarFatores(campanhaId)
    const riscosAtuais = nr1RiscosGerados(campanhaId)
    const superadas = new Set(nr1Acoes.map((a) => a.versaoAnteriorId).filter(Boolean))
    return nr1RiscosGerados(idAnterior).flatMap((r) => {
      const acoes = nr1Acoes.filter((a) => a.riscoId === r.id && !superadas.has(a.id))
      const versoesAnteriores = nr1Acoes.filter((a) => a.riscoId === r.id && superadas.has(a.id))
      if (acoes.length === 0 && versoesAnteriores.length === 0) return []
      const dep = r.departamentoIds[0] ?? null
      const anterior = r.avaliacao!
      const atual = atuais.find((a) => a.fatorId === r.fatorRiscoId && a.departamentoId === dep)
      const lida = atual ? nr1EvolucaoFator(anterior.situacao === 'requer-plano' ? anterior : { ...anterior, situacao: 'requer-plano' }, atual) : 'sem-mudanca'
      const evolucao: Nr1FatorEvolucao = lida === 'novo' ? 'sem-mudanca' : lida
      const riscoAtual = riscosAtuais.find((x) => x.fatorRiscoId === r.fatorRiscoId && (x.departamentoIds[0] ?? null) === dep)
      const abertas = acoes.filter((a) => a.status !== 'concluida')
      const efetividadeSugerida: Nr1Efetividade = evolucao === 'saiu-do-gatilho' ? 'muito-efetiva' : evolucao === 'melhorou' ? 'parcialmente-efetiva' : 'inefetiva'
      const decisaoSugerida: Nr1DecisaoReavaliacao = evolucao === 'saiu-do-gatilho' ? 'encerrar' : evolucao === 'melhorou' && abertas.length > 0 ? 'manter' : 'revisar'
      const feita = nr1Reavaliacoes.find((x) => x.campanhaId === campanhaId && x.riscoAnteriorId === r.id)
      return [{
        riscoAnterior: r,
        /* Uma ação já revisada (v1 → v2) entra pela versão anterior: é ela
           que o ciclo anterior executou. */
        acoes: [...acoes, ...versoesAnteriores.filter((v) => !acoes.some((a) => a.versaoAnteriorId === v.id && a.riscoId === r.id))],
        anterior, atual, evolucao, riscoAtualId: riscoAtual?.id,
        efetividadeSugerida, decisaoSugerida,
        reavaliacao: feita && { decisao: feita.decisao, autor: feita.autor, em: feita.em },
      }]
    })
  },

  /** Registra a reavaliação de um plano do ciclo anterior: a efetividade de
     cada ação (na própria ação, com registro na atividade) e a decisão. Em
     "manter", as ações ainda abertas passam a responder ao risco do ciclo
     atual. */
  registrarReavaliacao: async (p: {
    campanhaId: string
    riscoAnteriorId: string
    riscoAtualId?: string
    efetividades: Record<string, Nr1Efetividade>
    decisao: Nr1DecisaoReavaliacao
  }): Promise<{ ok: boolean }> => {
    await delay(rand(400, 700))
    const ciclo = nr1Campanhas.find((c) => c.id === p.campanhaId)
    const nomeCiclo = ciclo ? (ciclo.nome.split('·').pop() ?? ciclo.nome).trim() : p.campanhaId
    for (const [acaoId, ef] of Object.entries(p.efetividades)) {
      const a = nr1Acoes.find((x) => x.id === acaoId)
      if (!a) continue
      a.efetividade = ef
      registrarAtividade(a, 'editada', `Avaliou a efetividade no ciclo ${nomeCiclo}: ${EFETIVIDADE[ef].label.toLowerCase()}`)
    }
    if (p.decisao === 'manter' && p.riscoAtualId) {
      for (const a of nr1Acoes) {
        if (a.riscoId === p.riscoAnteriorId && a.status !== 'concluida') {
          a.riscoId = p.riscoAtualId
          registrarAtividade(a, 'editada', `Manteve a ação no plano do ciclo ${nomeCiclo}`)
        }
      }
    }
    for (let i = nr1Reavaliacoes.length - 1; i >= 0; i--) {
      if (nr1Reavaliacoes[i]!.campanhaId === p.campanhaId && nr1Reavaliacoes[i]!.riscoAnteriorId === p.riscoAnteriorId) nr1Reavaliacoes.splice(i, 1)
    }
    nr1Reavaliacoes.push({ campanhaId: p.campanhaId, riscoAnteriorId: p.riscoAnteriorId, decisao: p.decisao, autor: rhUsuarioAtual.nome, em: NR1_TODAY })
    return { ok: true }
  },

  /** Cria ou atualiza um fator do catálogo. Fator novo ganha id pelo nome. */
  salvar: async (f: Nr1FatorRisco): Promise<Nr1FatorRisco> => {
    await delay(rand(300, 600))
    const id = f.id || gerarIdUnico(`fator-${slug(f.nome)}`, nr1FatoresRisco.map((x) => x.id))
    const salvo: Nr1FatorRisco = { ...f, id, acoesSugeridas: f.acoesSugeridas.map((a, i) => ({ ...a, id: a.id || `${id}-acao-${Date.now()}-${i}` })) }
    const i = nr1FatoresRisco.findIndex((x) => x.id === id)
    if (i >= 0) nr1FatoresRisco[i] = salvo
    else nr1FatoresRisco.push(salvo)
    return salvo
  },

  /** Exclui um fator do catálogo (e o vínculo dele nos domínios dos modelos). */
  excluir: async (id: string): Promise<{ ok: boolean }> => {
    await delay(rand(250, 500))
    for (const m of nr1Modelos) for (const v of m.versoes) for (const d of v.dimensoes) d.fatoresRiscoIds = d.fatoresRiscoIds.filter((x) => x !== id)
    const i = nr1FatoresRisco.findIndex((x) => x.id === id)
    if (i >= 0) nr1FatoresRisco.splice(i, 1)
    return { ok: i >= 0 }
  },

  salvarCid: async (c: Nr1Cid): Promise<Nr1Cid> => {
    await delay(rand(250, 500))
    const id = c.id || gerarIdUnico(`cid-${slug(c.codigo)}`, nr1Cids.map((x) => x.id))
    const salvo = { ...c, id, codigo: c.codigo.trim().toUpperCase(), nome: c.nome.trim() }
    const i = nr1Cids.findIndex((x) => x.id === id)
    if (i >= 0) nr1Cids[i] = salvo
    else nr1Cids.push(salvo)
    return salvo
  },

  /** Exclui o CID da tabela e o desvincula de todo fator que o usava. */
  excluirCid: async (id: string): Promise<{ ok: boolean }> => {
    await delay(rand(250, 500))
    for (const f of nr1FatoresRisco) f.cidIds = f.cidIds.filter((x) => x !== id)
    const i = nr1Cids.findIndex((x) => x.id === id)
    if (i >= 0) nr1Cids.splice(i, 1)
    return { ok: i >= 0 }
  },

  fontes: async (): Promise<Nr1FonteGeradora[]> => {
    await delay(rand(150, 350))
    return nr1FontesGeradoras
  },

  salvarFonte: async (f: Nr1FonteGeradora): Promise<Nr1FonteGeradora> => {
    await delay(rand(250, 500))
    const id = f.id || gerarIdUnico(`fonte-${slug(f.nome)}`, nr1FontesGeradoras.map((x) => x.id))
    const salvo = { id, nome: f.nome.trim() }
    const i = nr1FontesGeradoras.findIndex((x) => x.id === id)
    if (i >= 0) nr1FontesGeradoras[i] = salvo
    else nr1FontesGeradoras.push(salvo)
    return salvo
  },

  /** Exclui a fonte e a desvincula dos fatores e dos domínios. */
  excluirFonte: async (id: string): Promise<{ ok: boolean }> => {
    await delay(rand(250, 500))
    for (const f of nr1FatoresRisco) f.fontesGeradorasIds = f.fontesGeradorasIds.filter((x) => x !== id)
    for (const m of nr1Modelos) for (const v of m.versoes) for (const d of v.dimensoes) d.fontesGeradorasIds = d.fontesGeradorasIds.filter((x) => x !== id)
    const i = nr1FontesGeradoras.findIndex((x) => x.id === id)
    if (i >= 0) nr1FontesGeradoras.splice(i, 1)
    return { ok: i >= 0 }
  },

  /** Fatores avaliados num ciclo — por departamento e na empresa inteira. */
  avaliar: async (campanhaId: string): Promise<Nr1FatorAvaliado[]> => {
    await delay(rand(300, 600))
    return nr1AvaliarFatores(campanhaId)
  },

  /** Cada fator do ciclo com a leitura em relação ao ciclo anterior (mesmo
     fator, mesmo recorte) — base da reavaliação dos planos. */
  evolucao: async (campanhaId: string): Promise<{ atual: Nr1FatorAvaliado; anterior?: Nr1FatorAvaliado; evolucao: Nr1FatorEvolucao }[]> => {
    await delay(rand(300, 600))
    const idAnterior = nr1CampanhaAnterior(campanhaId)
    const anteriores = idAnterior ? nr1AvaliarFatores(idAnterior) : []
    return nr1AvaliarFatores(campanhaId).map((atual) => {
      const anterior = anteriores.find((a) => a.fatorId === atual.fatorId && a.departamentoId === atual.departamentoId)
      return { atual, anterior, evolucao: nr1EvolucaoFator(anterior, atual) }
    })
  },
}

export const nr1CampanhaService = {
  list: async (): Promise<Nr1Campanha[]> => {
    await delay(rand(300, 600))
    return nr1Campanhas
  },

  /** Campanha em campo — a que o colaborador responde e o RH acompanha. */
  ativa: async (): Promise<Nr1Campanha | undefined> => {
    await delay(rand(250, 500))
    return nr1Campanhas.find((c) => c.status === 'em-campo')
  },

  get: async (id: string): Promise<Nr1Campanha | undefined> => {
    await delay(rand(250, 500))
    return nr1Campanhas.find((c) => c.id === id)
  },

  /** Troca o modelo/versão aplicados. Só antes de a campanha ir a campo — uma
     campanha em curso mantém a versão com que começou (RF-A04/F02). */
  definirInstrumento: async (campanhaId: string, modeloId: string, versao: string): Promise<{ ok: boolean; message?: string }> => {
    await delay(rand(300, 650))
    const c = nr1Campanhas.find((x) => x.id === campanhaId)
    if (!c) return { ok: false, message: 'Campanha não encontrada.' }
    if (c.status !== 'rascunho') {
      return { ok: false, message: 'A campanha já está em campo — a versão aplicada não pode mudar no meio do ciclo.' }
    }
    const m = nr1Modelos.find((x) => x.id === modeloId)
    if (!m) return { ok: false, message: 'Modelo não encontrado.' }
    c.modeloId = modeloId
    c.modeloNome = m.nome
    c.versao = versao
    return { ok: true }
  },

  /** Dispara lembrete para as áreas com participação abaixo da meta (RF-B04). */
  lembrar: async (departamentoIds: string[]): Promise<{ enviados: number }> => {
    await delay(rand(500, 900))
    return { enviados: departamentoIds.length }
  },

  /** Envia o link único do ciclo por e-mail para todos os colaboradores com
     e-mail cadastrado, de uma vez (não é um disparo por pessoa). */
  enviarConvitesLink: async (campanhaId: string, quantidade: number): Promise<{ enviados: number }> => {
    await delay(rand(400, 800))
    return { enviados: campanhaId ? quantidade : 0 }
  },

  /** Inicia um novo ciclo — direto em campo (não passa por rascunho: o
     fluxo simplificado de criação já entrega tudo que um ciclo em campo
     precisa, então não há motivo pra um estado intermediário). Só é
     possível quando não há outro ciclo em campo (checado na tela, não
     aqui — o serviço mockado confia em quem chama). */
  criar: async (p: { nome: string; modeloId: string; versao: string; inicio: string; fim: string }): Promise<Nr1Campanha> => {
    await delay(rand(500, 900))
    const modelo = nr1Modelos.find((m) => m.id === p.modeloId)
    const numeros = nr1Campanhas
      .map((c) => parseInt(c.protocolo.split('-').pop() ?? '', 10))
      .filter((n) => !Number.isNaN(n))
    const sequencial = (numeros.length > 0 ? Math.max(...numeros) : 0) + 1
    const prefixoEmpresa = rhEmpresa.nomeFantasia.split(' ')[0]!.toUpperCase()
    const ano = p.inicio.slice(0, 4)
    const nova: Nr1Campanha = {
      id: `camp-${Date.now()}`,
      nome: p.nome,
      protocolo: `NR1-${prefixoEmpresa}-${ano}-${String(sequencial).padStart(3, '0')}`,
      status: 'em-campo',
      modeloId: p.modeloId,
      modeloNome: modelo?.nome ?? '',
      versao: p.versao,
      inicio: p.inicio,
      fim: p.fim,
      elegiveis: totalElegiveis,
      respostas: 0,
      participacao: participacaoVazia(),
      criadaEm: NR1_TODAY,
    }
    nr1Campanhas.unshift(nova)
    return nova
  },

  /** Encerra a coleta e consolida o ciclo. */
  encerrar: async (campanhaId: string): Promise<{ ok: boolean }> => {
    await delay(rand(500, 900))
    const c = nr1Campanhas.find((x) => x.id === campanhaId)
    if (c) { c.status = 'encerrada'; c.encerradaEm = NR1_TODAY }
    return { ok: true }
  },
}

export const nr1ResultadoService = {
  /** Mapa de calor por dimensão × área de uma campanha (por padrão, a que
     está em campo). Os recortes abaixo do k já chegam com `protegido: true`
     e células nulas — a UI não tem como vazar. */
  mapaCalor: async (campanhaId?: string): Promise<Nr1LinhaMapa[]> => {
    await delay(rand(350, 700))
    return nr1MapaCalor(campanhaId)
  },

  /** Média por dimensão no total da empresa, para uma campanha (só áreas
     acima do k entram). */
  mediaPorDimensao: async (campanhaId?: string): Promise<{ dimensaoId: Nr1DimensaoId; nome: string; media: number; nivel: ReturnType<typeof nr1NivelPorMedia> }[]> => {
    await delay(rand(300, 600))
    /* Nota da empresa: ponderada pelos respondentes, incluindo as áreas
       ocultas por k-anonimato (elas não aparecem separadas no mapa). */
    const id = campanhaId ?? (nr1Campanhas.find((c) => c.status === 'em-campo') ?? nr1Campanhas[0])!.id
    return NR1_DIMENSOES.map((d, i) => {
      const media = nr1MediaDimensaoEmpresa(id, i)
      return { dimensaoId: d.id, nome: nr1DimensaoNome(d.id), media, nivel: nr1NivelPorMedia(media) }
    })
  },

  /** Inventário de riscos — por padrão, o do último ciclo encerrado. Os
     riscos são gerados pelo motor a partir do resultado (ver
     `nr1RiscosGerados`), não cadastrados à mão. */
  /** Visão geral de um ciclo num recorte (empresa, área ou "outros"): a nota
     de cada domínio e a do ciclo anterior no mesmo recorte, quando houver. */
  visaoGeral: async (campanhaId: string, recorte: string | null): Promise<{
    cicloAnteriorId?: string
    dominios: { dimensaoId: Nr1DimensaoId; nome: string; media: number | null; nivel: Nr1NivelRisco | null; anterior: number | null }[]
  }> => {
    await delay(rand(250, 500))
    const idAnterior = nr1CampanhaAnterior(campanhaId)
    const atuais = nr1MediasDoRecorte(campanhaId, recorte)
    const anteriores = idAnterior ? nr1MediasDoRecorte(idAnterior, recorte) : NR1_DIMENSOES.map(() => null)
    return {
      cicloAnteriorId: idAnterior,
      dominios: NR1_DIMENSOES.map((d, i) => {
        const media = atuais[i] ?? null
        return { dimensaoId: d.id, nome: d.nome, media, nivel: media === null ? null : nr1NivelPorMedia(media), anterior: anteriores[i] ?? null }
      }),
    }
  },

  /** Evolução das notas por domínio ao longo dos ciclos encerrados, num
     recorte (empresa, área ou "outros"). `null` = recorte sem dado no ciclo. */
  evolucao: async (recorte: string | null): Promise<{ campanhaId: string; ciclo: string; medias: (number | null)[] }[]> => {
    await delay(rand(300, 600))
    return nr1CampanhasEncerradas().map((id) => {
      const c = nr1Campanhas.find((x) => x.id === id)!
      return { campanhaId: id, ciclo: (c.nome.split('·').pop() ?? c.nome).trim(), medias: nr1MediasDoRecorte(id, recorte) }
    })
  },

  /** Recortes do ciclo: áreas visíveis e o agrupamento "Outros departamentos". */
  recortes: async (campanhaId: string) => {
    await delay(rand(150, 300))
    return nr1RecortesDoCiclo(campanhaId)
  },

  /** Mapa de calor com as áreas pequenas agregadas numa linha "Outros
     departamentos" (oculta se, somadas, ainda ficarem abaixo do k). */
  mapaCalorAgregado: async (campanhaId: string): Promise<{ linhas: Nr1LinhaMapa[]; agregados: string[] }> => {
    await delay(rand(350, 700))
    const { visiveis, outros } = nr1RecortesDoCiclo(campanhaId)
    const base = nr1MapaCalor(campanhaId).filter((l) => visiveis.some((v) => v.id === l.departamentoId))
    if (!outros) return { linhas: base, agregados: [] }
    const medias = nr1MediasDoRecorte(campanhaId, NR1_RECORTE_OUTROS)
    const linhaOutros: Nr1LinhaMapa = {
      departamentoId: NR1_RECORTE_OUTROS,
      departamento: 'Outros departamentos',
      respondentes: outros.respondentes,
      protegido: outros.protegido,
      celulas: NR1_DIMENSOES.map((d, i) => {
        const m = medias[i] ?? null
        return m === null ? { dimensaoId: d.id, media: null, nivel: null } : { dimensaoId: d.id, media: m, nivel: nr1NivelPorMedia(m) }
      }),
    }
    return { linhas: [...base, linhaOutros], agregados: outros.nomes }
  },

  inventario: async (campanhaId?: string): Promise<Nr1RiscoInventario[]> => {
    await delay(rand(350, 700))
    const id = campanhaId ?? nr1CampanhaVigente()
    return (id ? nr1RiscosGerados(id) : []).sort((a, b) => b.nivelNum - a.nivelNum)
  },

  /** Riscos de todos os ciclos encerrados — resolve o risco de origem de
     qualquer ação, inclusive as de ciclos anteriores. */
  riscosTodos: async (): Promise<Nr1RiscoInventario[]> => {
    await delay(rand(300, 600))
    return nr1RiscosTodos()
  },

  /** Ciclos encerrados (do mais antigo ao mais recente) e o vigente. */
  ciclosEncerrados: async (): Promise<{ ids: string[]; vigente?: string }> => {
    await delay(rand(150, 300))
    return { ids: nr1CampanhasEncerradas(), vigente: nr1CampanhaVigente() }
  },

  /** Decisões do RH (dispensas e inclusões) de um ciclo. */
  decisoes: async (campanhaId: string): Promise<Nr1DecisaoFator[]> => {
    await delay(rand(150, 300))
    return nr1DecisoesFator.filter((d) => d.campanhaId === campanhaId)
  },

  /** Dispensa um fator apontado num recorte — sai da lista de "requer plano"
     e do inventário, com a justificativa registrada (fica para a
     fiscalização). Bloqueado se já houver ação no plano. */
  dispensarFator: async (p: { campanhaId: string; fatorId: string; departamentoId: string | null; justificativa: string }): Promise<{ ok: boolean; message?: string }> => {
    await delay(rand(300, 600))
    const riscoId = nr1RiscoIdGerado(p.campanhaId, p.fatorId, p.departamentoId)
    if (nr1Acoes.some((a) => a.riscoId === riscoId)) {
      return { ok: false, message: 'Este fator já tem ações no plano. Exclua as ações antes de dispensá-lo.' }
    }
    removerDecisoes(riscoId)
    nr1DecisoesFator.push({ ...p, riscoId, tipo: 'dispensado', justificativa: p.justificativa.trim(), autor: rhUsuarioAtual.nome, em: NR1_TODAY })
    return { ok: true }
  },

  /** Inclui um fator que o questionário não apontou (ex.: auditoria,
     observação do SESMT) — entra no inventário com a justificativa. */
  incluirFator: async (p: { campanhaId: string; fatorId: string; departamentoId: string | null; justificativa: string }): Promise<Nr1RiscoInventario | undefined> => {
    await delay(rand(300, 600))
    const riscoId = nr1RiscoIdGerado(p.campanhaId, p.fatorId, p.departamentoId)
    removerDecisoes(riscoId)
    nr1DecisoesFator.push({ ...p, riscoId, tipo: 'incluido', justificativa: p.justificativa.trim(), autor: rhUsuarioAtual.nome, em: NR1_TODAY })
    return nr1RiscosGerados(p.campanhaId).find((r) => r.id === riscoId)
  },

  /** Desfaz uma dispensa ou inclusão — o fator volta a seguir o resultado. */
  reconsiderarFator: async (riscoId: string): Promise<{ ok: boolean; message?: string }> => {
    await delay(rand(250, 500))
    if (nr1DecisoesFator.some((d) => d.riscoId === riscoId && d.tipo === 'incluido') && nr1Acoes.some((a) => a.riscoId === riscoId)) {
      return { ok: false, message: 'Este fator já tem ações no plano. Exclua as ações antes de removê-lo.' }
    }
    removerDecisoes(riscoId)
    return { ok: true }
  },

  /** Compatibilidade com a análise de risco antiga (fases seguintes a
     substituem): registrar um risco vira incluir o fator em cada área. */
  adicionarRisco: async (p: { dimensaoId: Nr1DimensaoId; departamentoIds: string[]; fatorRiscoId?: string; campanhaId?: string } & Record<string, unknown>): Promise<Nr1RiscoInventario | undefined> => {
    await delay(rand(400, 700))
    const campanhaId = p.campanhaId ?? nr1CampanhaVigente()
    if (!campanhaId || !p.fatorRiscoId) return undefined
    const deps = p.departamentoIds.length ? p.departamentoIds : [null]
    for (const dep of deps) {
      const riscoId = nr1RiscoIdGerado(campanhaId, p.fatorRiscoId, dep)
      removerDecisoes(riscoId)
      nr1DecisoesFator.push({ riscoId, campanhaId, fatorId: p.fatorRiscoId, departamentoId: dep, tipo: 'incluido', justificativa: 'Identificado na análise do resultado.', autor: rhUsuarioAtual.nome, em: NR1_TODAY })
    }
    return nr1RiscosGerados(campanhaId).find((r) => r.id === nr1RiscoIdGerado(campanhaId, p.fatorRiscoId!, deps[0]!))
  },

  /** Probabilidade, severidade e dados do fator vêm do motor e do catálogo —
     não são editáveis. Só o status manual ainda é aceito aqui. */
  editarRisco: async (id: string, p: { status?: Nr1RiscoStatus } & Record<string, unknown>): Promise<Nr1RiscoInventario | undefined> => {
    await delay(rand(300, 600))
    if (p.status) nr1StatusManual.set(id, p.status)
    return nr1RiscosTodos().find((x) => x.id === id)
  },

  /** Tira um risco do inventário (registra como dispensado) — bloqueado se
     houver ações vinculadas. */
  excluirRisco: async (id: string): Promise<{ ok: boolean; message?: string }> => {
    await delay(rand(300, 600))
    const vinculadas = nr1Acoes.filter((a) => a.riscoId === id)
    if (vinculadas.length > 0) {
      return {
        ok: false,
        message: `Este risco tem ${vinculadas.length} ${vinculadas.length === 1 ? 'ação vinculada' : 'ações vinculadas'} no plano de ação. Não é possível excluir um risco com ações registradas.`,
      }
    }
    const r = nr1RiscosTodos().find((x) => x.id === id)
    if (!r?.fatorRiscoId) return { ok: false }
    removerDecisoes(id)
    nr1DecisoesFator.push({ riscoId: id, campanhaId: r.campanhaId, fatorId: r.fatorRiscoId, departamentoId: r.departamentoIds[0] ?? null, tipo: 'dispensado', justificativa: 'Removido do inventário.', autor: rhUsuarioAtual.nome, em: NR1_TODAY })
    return { ok: true }
  },

  /** "Concluir risco" — julgamento do RH/SST de que o risco foi resolvido,
     independente do que o próximo ciclo mostrar. */
  concluirRisco: async (id: string): Promise<{ ok: boolean }> => {
    await delay(rand(300, 600))
    nr1StatusManual.set(id, 'eliminado')
    return { ok: true }
  },


  /** O domínio como está definido na versão do modelo aplicada no ciclo —
     descrição, fatores de risco e fontes geradoras vinculados (RF-A05). */
  dimensaoDaCampanha: async (campanhaId: string, dimensaoId: Nr1DimensaoId): Promise<Nr1Dimensao | undefined> => {
    await delay(rand(200, 450))
    const campanha = nr1Campanhas.find((c) => c.id === campanhaId)
    const modelo = campanha && nr1Modelos.find((m) => m.id === campanha.modeloId)
    const versao = modelo?.versoes.find((v) => v.versao === campanha!.versao)
    return versao?.dimensoes.find((d) => d.id === dimensaoId)
  },

  /** Pontuação de cada pergunta de uma dimensão — de toda a empresa (sem
     `departamentoId`) ou de uma área específica. Não existe resposta
     individual por pergunta mockada: os valores são distribuídos de forma
     determinística (`nr1DistribuirPorItem`) para que a média das perguntas
     bata com a média já publicada — a mesma célula do mapa de calor ou o
     mesmo card de "Risco por dimensão" que a pessoa clicou, nunca um
     número à parte. */
  itensPorDimensao: async (
    campanhaId: string,
    dimensaoId: Nr1DimensaoId,
    departamentoId?: string,
  ): Promise<{ itemId: string; texto: string; referencia: string; media: number; nivel: Nr1NivelRisco }[]> => {
    await delay(rand(300, 600))
    const campanha = nr1Campanhas.find((c) => c.id === campanhaId)
    if (!campanha) return []
    const modelo = nr1Modelos.find((m) => m.id === campanha.modeloId)
    const versao = modelo?.versoes.find((v) => v.versao === campanha.versao)
    const dimensao = versao?.dimensoes.find((d) => d.id === dimensaoId)
    if (!dimensao || dimensao.itens.length === 0) return []

    const linhas = nr1MapaCalor(campanhaId)
    let media: number
    if (departamentoId) {
      const linha = linhas.find((l) => l.departamentoId === departamentoId)
      media = linha?.celulas.find((c) => c.dimensaoId === dimensaoId)?.media ?? 3
    } else {
      /* Empresa: ponderada pelos respondentes, inclusive as áreas ocultas
         por k-anonimato — a mesma nota do motor de fatores. */
      media = nr1MediaDimensaoEmpresa(campanhaId, NR1_DIMENSOES.findIndex((d) => d.id === dimensaoId)) || 3
    }

    const distrib = nr1DistribuirPorItem(
      dimensao.itens.map((it) => it.id),
      media,
      `${campanhaId}-${dimensaoId}-${departamentoId ?? 'empresa'}`,
    )
    return dimensao.itens.map((it) => {
      const d = distrib.find((x) => x.itemId === it.id)!
      return { itemId: it.id, texto: it.texto, referencia: it.referencia, media: d.media, nivel: nr1NivelPorMedia(d.media) }
    })
  },

  /** Exportação do inventário para incorporação ao PGR (RF-D02). Mock: só
     confirma o "arquivo gerado" — a geração real é do backend. */
  exportarInventario: async (formato: 'pdf' | 'planilha'): Promise<{ ok: boolean; arquivo: string }> => {
    await delay(rand(900, 1600))
    const ext = formato === 'pdf' ? 'pdf' : 'xlsx'
    return { ok: true, arquivo: `inventario-riscos-psicossociais-${NR1_TODAY}.${ext}` }
  },

  exportarRelatorio: async (): Promise<{ ok: boolean; arquivo: string }> => {
    await delay(rand(900, 1600))
    return { ok: true, arquivo: `relatorio-gestao-riscos-psicossociais-${NR1_TODAY}.pdf` }
  },

  /** Trilha risco → avaliação → inventário → ação → evidência (RF-F01). */
  trilha: async (riscoId: string): Promise<Nr1Trilha | undefined> => {
    await delay(rand(300, 600))
    const risco = nr1RiscosTodos().find((r) => r.id === riscoId)
    if (!risco) return undefined
    const campanha = nr1Campanhas.find((c) => c.id === risco.campanhaId)
    const acoes = nr1Acoes.filter((a) => a.riscoId === riscoId)

    /* Ordem da trilha: quatro blocos fixos pela posição na cadeia causal,
       nunca por data (um sort só por `em` misturava datas com significados
       diferentes — prazo de ação vs. data de comentário — e a ordem parecia
       arbitrária). De cima para baixo, do mais recente na cadeia pro mais
       antigo: evidências (o elo mais recente, o que fecha o ciclo) → planos
       de ação → risco identificado → ciclo de avaliação (a origem). Ou,
       lendo de baixo pra cima, a ordem em que a cadeia realmente acontece:
       ciclo → risco → ações → evidências.

       Dentro de cada bloco, o mais recente primeiro: evidências por data do
       comentário (`em`), ações por prazo (`quando`) — os únicos dois campos
       de data que cada tipo realmente tem. */
    const evidencias = acoes
      .flatMap((a) => a.comentarios.flatMap((c) => (c.arquivos ?? []).map((nome) => ({
        tipo: 'evidencia' as const,
        titulo: `Evidência: ${nome}`,
        detalhe: `Anexada à ação "${a.oQue}" por ${c.autor}.`,
        em: c.em,
      }))))
      .sort((a, b) => b.em.localeCompare(a.em))

    const acoesOrdenadas = [...acoes]
      .sort((a, b) => b.quando.localeCompare(a.quando))
      .map((a) => ({
        tipo: 'acao' as const,
        titulo: a.oQue,
        detalhe: `${a.quem} · prazo ${a.quando} · ${a.status}`,
        em: a.quando,
        status: a.status,
      }))

    return {
      riscoId,
      fator: risco.fator,
      grupoExposto: risco.grupoExposto,
      etapas: [
        ...evidencias,
        ...acoesOrdenadas,
        {
          tipo: 'inventario' as const,
          titulo: 'Inventário de riscos psicossociais (PGR)',
          detalhe: `Probabilidade ${risco.probabilidade} × severidade ${risco.severidade} = ${risco.nivelNum}. Classificado como ${risco.nivel}.`,
          em: campanha?.fim ?? NR1_TODAY,
          nivel: risco.nivel,
        },
        {
          tipo: 'avaliacao' as const,
          titulo: `Avaliação · protocolo ${campanha?.protocolo ?? '—'}`,
          detalhe: `${campanha?.modeloNome ?? 'Instrumento'} · versão ${campanha?.versao ?? '—'} · ${risco.respondentes} respondentes em ${risco.grupoExposto}.`,
          em: campanha?.fim ?? NR1_TODAY,
          campanhaId: campanha?.id,
        },
      ],
    }
  },

  responsavelTecnico: async (): Promise<Nr1ResponsavelTecnico> => {
    await delay(rand(200, 400))
    return nr1ResponsavelTecnico
  },

  /** Registra o responsável técnico do cliente que assina o PGR (RF-F04). */
  salvarResponsavel: async (r: Nr1ResponsavelTecnico): Promise<{ ok: boolean }> => {
    await delay(rand(300, 600))
    Object.assign(nr1ResponsavelTecnico, r, { assinadoEm: NR1_TODAY })
    return { ok: true }
  },

  ciclos: async (): Promise<Nr1Ciclo[]> => {
    await delay(rand(300, 600))
    return nr1Ciclos
  },
}

/* Log de atividade da ação. A data é a "hoje" do protótipo (`NR1_TODAY`)
   com a hora real do relógio — o suficiente para a sequência fazer sentido
   numa demonstração. O autor é o usuário logado. */
const agora = () => {
  const d = new Date()
  return `${NR1_TODAY}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function registrarAtividade(a: Nr1Acao, tipo: Nr1AtividadeTipo, descricao: string) {
  a.atividades = [...(a.atividades ?? []), {
    id: `atv-${a.id}-${(a.atividades?.length ?? 0) + 1}-${Date.now()}`,
    em: agora(),
    autor: rhUsuarioAtual.nome,
    tipo,
    descricao,
  }]
}

/** Campos do 5W2H comparados numa edição, com o rótulo do formulário. */
const CAMPOS_ACAO: { campo: keyof Nr1Acao; rotulo: string; fmt?: (v: string) => string }[] = [
  { campo: 'oQue', rotulo: 'O quê' },
  { campo: 'porQue', rotulo: 'Por quê' },
  { campo: 'quem', rotulo: 'Quem (responsável)' },
  { campo: 'quando', rotulo: 'Quando (prazo)', fmt: fmtData },
  { campo: 'onde', rotulo: 'Onde' },
  { campo: 'como', rotulo: 'Como' },
  { campo: 'quanto', rotulo: 'Quanto' },
  { campo: 'riscoId', rotulo: 'Risco vinculado' },
]

/** A ação tem algum registro de execução — um comentário com texto ou um
   arquivo de evidência. */
export const nr1AcaoTemRegistro = (a: Nr1Acao) =>
  a.comentarios.some((c) => !!c.texto?.trim() || (c.arquivos?.length ?? 0) > 0)

export const nr1AcaoService = {
  list: async (): Promise<Nr1Acao[]> => {
    await delay(rand(300, 600))
    return nr1Acoes
  },

  /** Upsert da ação 5W2H. */
  salvar: async (a: Nr1Acao): Promise<Nr1Acao> => {
    await delay(rand(350, 700))
    const anterior = nr1Acoes.find((x) => x.id === a.id)
    const saved: Nr1Acao = { ...a, id: a.id || `a-${nr1Acoes.length + 1}`, atividades: anterior?.atividades ?? a.atividades }
    if (!anterior) {
      registrarAtividade(saved, 'criada', 'Criou a ação')
    } else {
      const alterados = CAMPOS_ACAO.filter((c) => String(anterior[c.campo] ?? '') !== String(saved[c.campo] ?? ''))
      if (alterados.length > 0) {
        const detalhe = alterados.map((c) => {
          if (c.campo === 'quem' || c.campo === 'quando' || c.campo === 'onde') {
            const f = c.fmt ?? ((v: string) => v)
            return `${c.rotulo}: ${f(String(anterior[c.campo] || '—'))} → ${f(String(saved[c.campo] || '—'))}`
          }
          return c.rotulo
        })
        registrarAtividade(saved, 'editada', `Editou ${detalhe.join('; ')}`)
      }
      if (anterior.status !== saved.status) {
        registrarAtividade(saved, 'status', `Mudou o status de ${ACAO_STATUS[anterior.status].label} para ${ACAO_STATUS[saved.status].label}`)
      }
    }
    const i = nr1Acoes.findIndex((x) => x.id === saved.id)
    if (i >= 0) nr1Acoes[i] = saved
    else nr1Acoes.push(saved)
    return saved
  },

  /** Exclui uma ação e as versões anteriores dela (a cadeia de
     `versaoAnteriorId`) — sem isso, a versão anterior voltaria a contar
     como a vigente. */
  excluir: async (acaoId: string): Promise<{ ok: boolean }> => {
    await delay(rand(250, 500))
    const ids = new Set<string>()
    let atual = nr1Acoes.find((a) => a.id === acaoId)
    while (atual && !ids.has(atual.id)) {
      ids.add(atual.id)
      atual = atual.versaoAnteriorId ? nr1Acoes.find((a) => a.id === atual!.versaoAnteriorId) : undefined
    }
    for (let i = nr1Acoes.length - 1; i >= 0; i--) if (ids.has(nr1Acoes[i]!.id)) nr1Acoes.splice(i, 1)
    return { ok: ids.size > 0 }
  },

  /** Registra um comentário no diário de execução da ação — com ou sem
     arquivo(s) anexado(s). Um comentário com arquivo conta como evidência
     de execução (RF-E02); um comentário sem arquivo é só acompanhamento. */
  comentar: async (acaoId: string, p: { autor: string; texto?: string; arquivos?: string[] }): Promise<{ ok: boolean; comentario?: Nr1Comentario }> => {
    await delay(rand(300, 600))
    const a = nr1Acoes.find((x) => x.id === acaoId)
    if (!a) return { ok: false }
    const comentario: Nr1Comentario = { id: `com-${acaoId}-${a.comentarios.length + 1}-${Date.now()}`, em: NR1_TODAY, ...p }
    a.comentarios.push(comentario)
    if (p.arquivos?.length) {
      registrarAtividade(a, 'evidencia', `Anexou ${p.arquivos.length === 1 ? 'a evidência' : `${p.arquivos.length} evidências`}: ${p.arquivos.join(', ')}`)
    } else {
      registrarAtividade(a, 'comentario', 'Comentou o andamento')
    }
    return { ok: true, comentario }
  },

  /** Exclui um comentário do diário (e os arquivos dele) — fica registrado
     no log de atividade, com um trecho do que foi removido. */
  excluirComentario: async (acaoId: string, comentarioId: string): Promise<{ ok: boolean }> => {
    await delay(rand(250, 500))
    const a = nr1Acoes.find((x) => x.id === acaoId)
    const i = a ? a.comentarios.findIndex((c) => c.id === comentarioId) : -1
    if (!a || i < 0) return { ok: false }
    const [c] = a.comentarios.splice(i, 1)
    const trecho = c!.texto ? `“${c!.texto.length > 60 ? `${c!.texto.slice(0, 60)}…` : c!.texto}”` : ''
    const anexos = c!.arquivos?.length ? `${c!.arquivos.length === 1 ? '1 anexo' : `${c!.arquivos.length} anexos`}` : ''
    registrarAtividade(a, 'comentario-excluido', `Excluiu um comentário de ${c!.autor}${trecho || anexos ? `: ${[trecho, anexos].filter(Boolean).join(' · ')}` : ''}`)
    return { ok: true }
  },

  /** Conclui a ação. Sem nenhum comentário nem evidência, só conclui com
     `semRegistro: true` — a pessoa confirmou que quer concluir assim mesmo
     (a UI pergunta antes); sem a confirmação, devolve `semRegistro` para a
     UI perguntar. */
  concluir: async (acaoId: string, opts?: { semRegistro?: boolean }): Promise<{ ok: boolean; semRegistro?: boolean; message?: string }> => {
    await delay(rand(300, 600))
    const a = nr1Acoes.find((x) => x.id === acaoId)
    if (!a) return { ok: false }
    if (!nr1AcaoTemRegistro(a) && !opts?.semRegistro) return { ok: false, semRegistro: true }
    a.status = 'concluida'
    a.concluidaEm = NR1_TODAY
    registrarAtividade(a, 'concluida', opts?.semRegistro ? 'Concluiu a ação sem comentário nem evidência' : 'Concluiu a ação')
    return { ok: true }
  },

  /** A linhagem de versões de UMA ação — segue a cadeia real de
     `versaoAnteriorId` a partir do id dado, da mais recente para a mais
     antiga. Não é "toda ação deste risco": um risco pode ter várias ações
     distintas, cada uma com sua própria linha de versões, e elas não se
     misturam aqui. */
  versoes: async (acaoId: string): Promise<Nr1Acao[]> => {
    await delay(rand(250, 500))
    const porId = new Map(nr1Acoes.map((a) => [a.id, a]))
    const linhagem: Nr1Acao[] = []
    let atual = porId.get(acaoId)
    while (atual) {
      linhagem.push(atual)
      atual = atual.versaoAnteriorId ? porId.get(atual.versaoAnteriorId) : undefined
    }
    return linhagem
  },

  /** Marca a efetividade de uma versão — sempre um julgamento do RH/SST no
     ciclo seguinte, nunca inferido automaticamente da variação do risco. */
  avaliarEfetividade: async (acaoId: string, efetividade: Nr1Acao['efetividade']): Promise<{ ok: boolean }> => {
    await delay(rand(250, 500))
    const a = nr1Acoes.find((x) => x.id === acaoId)
    if (!a) return { ok: false }
    a.efetividade = efetividade
    return { ok: true }
  },

}

export const nr1CanalService = {
  /** Abre um relato anônimo e devolve o protocolo de acompanhamento. */
  registrar: async (p: { categoria: Nr1RelatoCategoria; descricao: string; departamento?: string }): Promise<{ protocolo: string }> => {
    await delay(rand(600, 1100))
    const protocolo = `ESC-2026-${String(34 + nr1Relatos.length).padStart(4, '0')}`
    nr1Relatos.unshift({
      id: `rel-${nr1Relatos.length + 1}`,
      protocolo,
      categoria: p.categoria,
      descricao: p.descricao,
      departamento: p.departamento,
      abertoEm: NR1_TODAY,
      prazoEm: '2026-07-09',
      status: 'novo',
      andamentos: [{ id: `an-${nr1Relatos.length + 1}`, em: NR1_TODAY, texto: 'Relato recebido pelo canal confidencial. Aguardando triagem.', autor: 'Canal de escuta' }],
    })
    return { protocolo }
  },

  /** Casos para a gestão do RH — sem qualquer identificação do relator. */
  list: async (): Promise<Nr1Relato[]> => {
    await delay(rand(300, 650))
    return nr1Relatos
  },

  /** Registra andamento no tratamento do caso (trilha + SLA — RF-H02). */
  andamento: async (relatoId: string, texto: string, concluir: boolean): Promise<{ ok: boolean }> => {
    await delay(rand(350, 700))
    const r = nr1Relatos.find((x) => x.id === relatoId)
    if (!r) return { ok: false }
    r.andamentos.push({ id: `an-${relatoId}-${r.andamentos.length + 1}`, em: NR1_TODAY, texto, autor: 'Camila Risi · DHO' })
    r.status = concluir ? 'concluido' : 'em-apuracao'
    return { ok: true }
  },
}

export const nr1ColaboradorService = {
  /** "Login" do colaborador em `/bem-vindo` — CPF + data de nascimento, sem
     senha. Sempre bem-sucedido no mock: não existe checagem contra uma
     matrícula real de colaboradores nem persistência de identidade a
     partir daqui (a avaliação segue anônima, ver `Ben03Lgpd`) — os dois
     campos servem só para dar à pessoa a sensação de ter "entrado" antes de
     assumir um compromisso (responder o questionário), não para autenticar
     de verdade num backend que este protótipo não tem. */
  entrar: async (_p: { cpf: string; nascimento: string }): Promise<{ ok: boolean }> => {
    await delay(rand(400, 700))
    return { ok: true }
  },

  /** Instrumento que o colaborador vai responder: a versão registrada na
     campanha ativa — nunca um formulário fixo no código (RF-CO-NR1-01). */
  instrumentoDaCampanha: async (): Promise<{ campanha: Nr1Campanha; versao: Nr1QuestionarioVersao } | undefined> => {
    await delay(rand(350, 700))
    const campanha = nr1Campanhas.find((c) => c.status === 'em-campo')
    if (!campanha) return undefined
    const modelo = nr1Modelos.find((m) => m.id === campanha.modeloId)
    const versao = modelo?.versoes.find((v) => v.versao === campanha.versao)
    if (!versao) return undefined
    return { campanha, versao }
  },

  /** Salvamento progressivo — o colaborador pode parar e voltar, inclusive
     numa outra sessão/aparelho (ver `avaliacaoParcial`). */
  salvarParcial: async (campanhaId: string, respostas: Record<string, number | string>): Promise<{ ok: boolean }> => {
    await delay(rand(200, 450))
    try {
      const parcial: Nr1ParcialSalvo = { respostas, atualizadoEm: new Date().toISOString() }
      localStorage.setItem(chaveParcial(campanhaId), JSON.stringify(parcial))
    } catch {
      /* localStorage indisponível (modo privado etc.) — sem retomada entre
         sessões, mas não impede a avaliação em curso. */
    }
    return { ok: true }
  },

  /** Avaliação parcialmente respondida, salva numa sessão anterior — usada
     ao (re)começar a avaliação para oferecer "continuar de onde parei" em
     vez de reiniciar do zero. `undefined` quando não há nada salvo. */
  avaliacaoParcial: async (campanhaId: string): Promise<Nr1ParcialSalvo | undefined> => {
    await delay(rand(200, 400))
    try {
      const raw = localStorage.getItem(chaveParcial(campanhaId))
      if (!raw) return undefined
      const parcial = JSON.parse(raw) as Nr1ParcialSalvo
      return Object.keys(parcial.respostas).length > 0 ? parcial : undefined
    } catch {
      return undefined
    }
  },

  /** Descarta o progresso salvo — chamado ao escolher "começar do zero" ou
     depois que a avaliação é enviada com sucesso. */
  limparParcial: async (campanhaId: string): Promise<{ ok: boolean }> => {
    try {
      localStorage.removeItem(chaveParcial(campanhaId))
    } catch {
      /* nada a fazer */
    }
    return { ok: true }
  },

  /** Conclui a avaliação. A resposta é anônima: nada aqui liga o conteúdo ao
     indivíduo — só a versão aplicada é registrada (RF-A02 / RF-F02). */
  enviar: async (campanhaId: string, _respostas: Record<string, number | string>): Promise<{ ok: boolean; protocolo: string }> => {
    await delay(rand(700, 1300))
    const c = nr1Campanhas.find((x) => x.id === campanhaId)
    if (c) c.respostas += 1
    try {
      localStorage.removeItem(chaveParcial(campanhaId))
    } catch {
      /* nada a fazer */
    }
    return { ok: true, protocolo: c?.protocolo ?? 'NR1-2026-000' }
  },

  /** Histórico do próprio respondente — nunca visível ao RH (RF-G01). */
  minhasAvaliacoes: async (): Promise<Nr1MinhaAvaliacao[]> => {
    await delay(rand(300, 600))
    return nr1MinhasAvaliacoes
  },
}
