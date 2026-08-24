import type {
  Nr1QuestionarioModelo, Nr1QuestionarioVersao, Nr1Campanha, Nr1LinhaMapa,
  Nr1RiscoInventario, Nr1Acao, Nr1Relato, Nr1Ciclo, Nr1ResponsavelTecnico,
  Nr1MinhaAvaliacao, Nr1KitMaterial, Nr1Trilha, Nr1RelatoCategoria, Nr1Comentario,
  Nr1DimensaoId, Nr1RiscoCiclo, Nr1Severidade, Nr1NivelRisco, Nr1RiscoSugeridoLeitura,
} from '../types'
import {
  nr1Modelos, nr1Campanhas, nr1MapaCalor, nr1Inventario, nr1Acoes, nr1Relatos,
  nr1Ciclos, nr1ResponsavelTecnico, nr1MinhasAvaliacoes, nr1Kit, nr1DimensaoNome,
  nr1DimensoesBase, NR1_ESCALAS, NR1_PONTUACAO, NR1_TODAY, nr1NivelPorMedia,
  nr1RiscosCiclos, RISCOS,
} from '../data/nr1Mock'
import { NR1_RISCOS_SUGERIDOS } from '../data/nr1RiscosSugeridosMock'
import { nr1DistribuirPorItem, nr1NivelAtingeGatilho } from '../lib/nr1'

/* Camada de serviços do Módulo de Conformidade NR-1 — mockada, com latência
   simulada. As assinaturas espelham a futura API REST; trocar o corpo por
   fetch/axios mantendo os tipos.

   Duas regras de negócio moram aqui e não na UI, para que a futura API possa
   assumi-las sem reescrever tela:
   · publicar/editar versão respeita a imutabilidade da versão publicada;
   · o k-anonimato já vem aplicado nos agregados entregues ao RH. */

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

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
    const linhas = nr1MapaCalor(campanhaId).filter((l) => !l.protegido)
    return linhas[0]?.celulas.map((_, i) => {
      const vals = linhas.map((l) => l.celulas[i]?.media ?? 0)
      const media = Number((vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1))
      const dimensaoId = linhas[0]!.celulas[i]!.dimensaoId
      return { dimensaoId, nome: nr1DimensaoNome(dimensaoId), media, nivel: nr1NivelPorMedia(media) }
    }) ?? []
  },

  inventario: async (): Promise<Nr1RiscoInventario[]> => {
    await delay(rand(350, 700))
    return nr1Inventario().sort((a, b) => b.nivelNum - a.nivelNum)
  },

  /** Adiciona um risco ao inventário manualmente — por exemplo, identificado
     por auditoria ou observação direta do SESMT, não pela pesquisa. Nasce
     sem histórico de ciclos: `nr1Inventario()` computa status/tendência a
     partir de `nr1RiscosCiclos`, que não tem pontos para um risco recém-
     criado, então ele aparece como "Identificado", sem sugestão ainda. */
  adicionarRisco: async (p: {
    dimensaoId: Nr1DimensaoId
    departamentoIds: string[]
    fator: string
    danos: string
    probabilidade: number
    severidade: Nr1Severidade
    controles: string[]
    /** Presente quando o cadastro vem da aba "Riscos sugeridos" — grava a
       rastreabilidade de que este fator nasceu de uma leitura assistida do
       questionário, não de auditoria/observação direta do SESMT. */
    origemSugestaoId?: string
  }): Promise<Nr1RiscoInventario> => {
    await delay(rand(400, 700))
    const id = `r-${RISCOS.length + 1}`
    RISCOS.push({ id, ...p })
    return nr1Inventario().find((r) => r.id === id)!
  },

  /** Histórico de um risco, ciclo a ciclo (nível, tendência, sugestão) — a
     evolução de verdade, não só o último ponto que o card do inventário
     mostra. Do mais antigo para o mais recente. */
  riscoCiclos: async (riscoId: string): Promise<Nr1RiscoCiclo[]> => {
    await delay(rand(250, 500))
    return nr1RiscosCiclos.filter((c) => c.riscoId === riscoId)
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
      const vals = linhas
        .filter((l) => !l.protegido)
        .map((l) => l.celulas.find((c) => c.dimensaoId === dimensaoId)?.media ?? 0)
      media = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 3
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

  /** Leitura das 7 sugestões de risco psicossocial para um ciclo — ⚠️ é uma
     TRIAGEM ASSISTIDA, nunca um diagnóstico automático (ver disclaimers em
     `components/Nr1RiscosSugeridos.tsx`). `mediaEmpresa`/`nivelEmpresa` vêm
     da mesma média que já aparece no "Risco por dimensão" do ciclo; os
     departamentos envolvidos filtram as mesmas células do mapa de calor
     (k-anonimato já aplicado) que atingem o gatilho da sugestão — nunca um
     número à parte. Uma sugestão "dispara" tanto pela média da empresa
     quanto por qualquer área isolada, porque um risco pode ser localizado
     mesmo quando a média geral não preocupa. */
  riscosSugeridos: async (campanhaId: string): Promise<Nr1RiscoSugeridoLeitura[]> => {
    await delay(rand(350, 700))
    const linhas = nr1MapaCalor(campanhaId).filter((l) => !l.protegido)
    const inventario = nr1Inventario()

    return NR1_RISCOS_SUGERIDOS.map((sugestao) => {
      const vals = linhas.map((l) => l.celulas.find((c) => c.dimensaoId === sugestao.dimensaoId)?.media ?? 0)
      const mediaEmpresa = vals.length ? Number((vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1)) : 0
      const nivelEmpresa = nr1NivelPorMedia(mediaEmpresa)

      const departamentosEnvolvidos = linhas
        .map((l) => {
          const cel = l.celulas.find((c) => c.dimensaoId === sugestao.dimensaoId)
          return cel?.media != null ? { departamentoId: l.departamentoId, departamento: l.departamento, media: cel.media, nivel: cel.nivel! } : null
        })
        .filter((d): d is NonNullable<typeof d> => d !== null)
        .filter((d) => nr1NivelAtingeGatilho(d.nivel, sugestao.nivelGatilho))

      const disparado = nr1NivelAtingeGatilho(nivelEmpresa, sugestao.nivelGatilho) || departamentosEnvolvidos.length > 0
      const jaAdicionado = inventario.find((r) => r.origemSugestaoId === sugestao.id)

      return {
        sugestao, mediaEmpresa, nivelEmpresa, disparado, departamentosEnvolvidos,
        jaNoInventario: !!jaAdicionado, riscoInventarioId: jaAdicionado?.id,
      }
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
    const risco = nr1Inventario().find((r) => r.id === riscoId)
    if (!risco) return undefined
    const campanha = nr1Campanhas.find((c) => c.id === risco.campanhaId)
    const acoes = nr1Acoes.filter((a) => a.riscoId === riscoId)
    return {
      riscoId,
      fator: risco.fator,
      grupoExposto: risco.grupoExposto,
      etapas: [
        {
          tipo: 'avaliacao',
          titulo: `Avaliação · protocolo ${campanha?.protocolo ?? '—'}`,
          detalhe: `${campanha?.modeloNome ?? 'Instrumento'} · versão ${campanha?.versao ?? '—'} · ${risco.respondentes} respondentes em ${risco.grupoExposto}.`,
          em: campanha?.fim ?? NR1_TODAY,
        },
        {
          tipo: 'inventario',
          titulo: 'Inventário de riscos psicossociais (PGR)',
          detalhe: `Probabilidade ${risco.probabilidade} × severidade ${risco.severidade} = ${risco.nivelNum}. Classificado como ${risco.nivel}.`,
          em: campanha?.fim ?? NR1_TODAY,
        },
        ...acoes.map((a) => ({
          tipo: 'acao' as const,
          titulo: a.oQue,
          detalhe: `${a.quem} · prazo ${a.quando} · ${a.status}`,
          em: a.quando,
        })),
        ...acoes.flatMap((a) => a.comentarios.flatMap((c) => (c.arquivos ?? []).map((nome) => ({
          tipo: 'evidencia' as const,
          titulo: `Evidência: ${nome}`,
          detalhe: `Anexada à ação "${a.oQue}" por ${c.autor}.`,
          em: c.em,
        })))),
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

export const nr1AcaoService = {
  list: async (): Promise<Nr1Acao[]> => {
    await delay(rand(300, 600))
    return nr1Acoes
  },

  /** Upsert da ação 5W2H. */
  salvar: async (a: Nr1Acao): Promise<Nr1Acao> => {
    await delay(rand(350, 700))
    const saved: Nr1Acao = { ...a, id: a.id || `a-${nr1Acoes.length + 1}` }
    const i = nr1Acoes.findIndex((x) => x.id === saved.id)
    if (i >= 0) nr1Acoes[i] = saved
    else nr1Acoes.push(saved)
    return saved
  },

  /** Registra um comentário no diário de execução da ação — com ou sem
     arquivo(s) anexado(s). Um comentário com arquivo conta como evidência
     de execução (RF-E02); um comentário sem arquivo é só acompanhamento. */
  comentar: async (acaoId: string, p: { autor: string; texto?: string; arquivos?: string[] }): Promise<{ ok: boolean; comentario?: Nr1Comentario }> => {
    await delay(rand(300, 600))
    const a = nr1Acoes.find((x) => x.id === acaoId)
    if (!a) return { ok: false }
    const comentario: Nr1Comentario = { id: `com-${acaoId}-${a.comentarios.length + 1}`, em: NR1_TODAY, ...p }
    a.comentarios.push(comentario)
    return { ok: true, comentario }
  },

  concluir: async (acaoId: string): Promise<{ ok: boolean; message?: string }> => {
    await delay(rand(300, 600))
    const a = nr1Acoes.find((x) => x.id === acaoId)
    if (!a) return { ok: false }
    if (!a.comentarios.some((c) => c.arquivos && c.arquivos.length > 0)) {
      return { ok: false, message: 'Anexe ao menos um arquivo de evidência (num comentário) antes de concluir a ação.' }
    }
    a.status = 'concluida'
    a.concluidaEm = NR1_TODAY
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

  /** Cria uma nova versão do plano a partir da anterior. A versão anterior
     nunca é editada nem apagada — vira histórico, com sua efetividade
     preservada; a nova nasce com `versao` incrementada, `versaoAnteriorId`
     e o motivo da revisão (RF-E01, rastreabilidade de mudança de plano). */
  revisar: async (
    acaoAnteriorId: string,
    patch: Pick<Nr1Acao, 'oQue' | 'porQue' | 'quem' | 'quando' | 'onde' | 'como' | 'quanto'>,
    motivoRevisao: string,
  ): Promise<{ ok: boolean; acao?: Nr1Acao; message?: string }> => {
    await delay(rand(350, 700))
    const anterior = nr1Acoes.find((x) => x.id === acaoAnteriorId)
    if (!anterior) return { ok: false, message: 'Versão anterior não encontrada.' }
    const nova: Nr1Acao = {
      ...patch,
      id: `a-${nr1Acoes.length + 1}`,
      riscoId: anterior.riscoId,
      status: 'planejada',
      comentarios: [],
      versao: anterior.versao + 1,
      versaoAnteriorId: anterior.id,
      motivoRevisao,
    }
    nr1Acoes.push(nova)
    return { ok: true, acao: nova }
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

  /** Salvamento progressivo — o colaborador pode parar e voltar. */
  salvarParcial: async (_campanhaId: string, _respostas: Record<string, number | string>): Promise<{ ok: boolean }> => {
    await delay(rand(200, 450))
    return { ok: true }
  },

  /** Conclui a avaliação. A resposta é anônima: nada aqui liga o conteúdo ao
     indivíduo — só a versão aplicada é registrada (RF-A02 / RF-F02). */
  enviar: async (campanhaId: string, _respostas: Record<string, number | string>): Promise<{ ok: boolean; protocolo: string }> => {
    await delay(rand(700, 1300))
    const c = nr1Campanhas.find((x) => x.id === campanhaId)
    if (c) c.respostas += 1
    return { ok: true, protocolo: c?.protocolo ?? 'NR1-2026-000' }
  },

  /** Histórico do próprio respondente — nunca visível ao RH (RF-G01). */
  minhasAvaliacoes: async (): Promise<Nr1MinhaAvaliacao[]> => {
    await delay(rand(300, 600))
    return nr1MinhasAvaliacoes
  },
}

export const nr1KitService = {
  list: async (): Promise<Nr1KitMaterial[]> => {
    await delay(rand(250, 500))
    return nr1Kit
  },
}
