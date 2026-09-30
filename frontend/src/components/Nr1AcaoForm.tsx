import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from './Button'
import { Input } from './Input'
import { Select } from './Select'
import { SearchSelect } from './SearchSelect'
import { MultiSelect } from './MultiSelect'
import { Textarea } from './Textarea'
import { ACAO_STATUS } from '../lib/nr1'
import { useService } from '../hooks/useService'
import { nr1AcaoService } from '../services/nr1'
import { rhColaboradorService, rhDepartamentoService } from '../services/rh'
import type { Nr1Acao, Nr1RiscoInventario, Nr1AcaoStatus } from '../types'

/** Valor sentinela para "o responsável atual não corresponde a nenhum
   colaborador da lista" (ação antiga, texto livre de antes deste campo virar
   busca, ou alguém que já saiu do quadro). Nunca é enviado ao serviço — só
   controla o `SearchSelect` internamente. */
const RESPONSAVEL_LEGADO = '__legado__'

/** Estado do campo "Quem (responsável)" — um `SearchSelect` com busca por
   nome sobre a lista real de colaboradores da empresa (`rhColaboradorService`).
   `Nr1Acao.quem` continua sendo string (não um id).

   Quando a ação sendo editada já tem um responsável que não é nenhum
   colaborador atual, esse texto aparece como a primeira opção da lista,
   pré-selecionado — a pessoa pode manter ou trocar, nunca perde o que já
   estava lá. */
function useResponsavelField(quemAtual?: string) {
  const departamentos = useService(() => rhDepartamentoService.list(), [])
  const colaboradores = useService(() => rhColaboradorService.list(), [])
  const [quemId, setQuemId] = useState(quemAtual ? RESPONSAVEL_LEGADO : '')

  const lista = colaboradores.status === 'success' ? colaboradores.data : []
  const depNome = (id: string) => (departamentos.status === 'success' ? departamentos.data.find((d) => d.id === id)?.nome : undefined) ?? id

  const opcoes = useMemo(() => {
    const base = lista.map((c) => ({ value: c.id, label: `${c.nomeCompleto} · ${depNome(c.departamentoId)}` }))
    return quemAtual ? [{ value: RESPONSAVEL_LEGADO, label: quemAtual }, ...base] : base
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista, quemAtual, departamentos.status])

  return {
    quemId,
    setQuemId,
    opcoes,
    quemFinal: opcoes.find((o) => o.value === quemId)?.label ?? '',
    carregando: colaboradores.status === 'loading' || departamentos.status === 'loading',
    departamentos: departamentos.status === 'success' ? departamentos.data : [],
  }
}

/** Rótulo de um risco em seletores e listas: domínio · fator — o mesmo par
   que a análise de risco usa para registrar. */
export const nr1RotuloRisco = (r: Nr1RiscoInventario) => `${r.dimensao} · ${r.fator}`

/** Formulário 5W2H — o único da plataforma: usado na análise de risco
   (`Nr1AnaliseRisco`, `layout="inline"`, risco fixo), no Plano de ação e em
   "Seus planos de ação" da Visão geral (`layout="sheet"`, com o seletor de
   risco quando `riscos` é passado). Os sete campos da norma, na ordem em
   que fazem sentido preencher. "Onde" é a lista de áreas da empresa,
   gravada como texto (`Nr1Acao.onde`, nomes separados por vírgula). */
export function AcaoForm({
  inicial, riscoId, riscos, ondePadrao, porQuePadrao, layout = 'sheet', onSujo, onClose, onSaved,
}: {
  inicial?: Nr1Acao
  riscoId: string
  /** Presente → mostra o seletor "Risco que esta ação responde". */
  riscos?: Nr1RiscoInventario[]
  /** Áreas já marcadas em "Onde" numa ação nova. Sem isso, as do risco. */
  ondePadrao?: string[]
  porQuePadrao?: string
  layout?: 'sheet' | 'inline'
  onSujo?: (sujo: boolean) => void
  onClose: () => void
  onSaved: (salvo: Nr1Acao, nova: boolean) => void
}) {
  const [risco, setRisco] = useState(inicial?.riscoId ?? riscoId)
  const [oQue, setOQue] = useState(inicial?.oQue ?? '')
  const [porQue, setPorQue] = useState(inicial?.porQue ?? porQuePadrao ?? '')
  const responsavel = useResponsavelField(inicial?.quem)
  const [quando, setQuando] = useState(inicial?.quando ?? '')
  const [onde, setOnde] = useState<string[]>(
    inicial ? inicial.onde.split(',').map((x) => x.trim()).filter(Boolean) : (ondePadrao ?? []),
  )
  const [ondeTocado, setOndeTocado] = useState(false)
  const [como, setComo] = useState(inicial?.como ?? '')
  const [quanto, setQuanto] = useState(inicial?.quanto ?? '')
  const [status, setStatus] = useState<Nr1AcaoStatus>(inicial?.status ?? 'planejada')
  const [salvando, setSalvando] = useState(false)

  /* Ação nova sem `ondePadrao`: "Onde" acompanha as áreas do risco escolhido
     (assim que a lista de departamentos carrega), até a pessoa mexer. */
  const riscoSel = riscos?.find((r) => r.id === risco)
  useEffect(() => {
    if (inicial || ondePadrao || ondeTocado || !riscoSel || responsavel.departamentos.length === 0) return
    setOnde(riscoSel.departamentoIds.map((id) => responsavel.departamentos.find((d) => d.id === id)?.nome).filter((n): n is string => !!n))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [risco, responsavel.departamentos.length])

  const nomesAreas = responsavel.departamentos.map((d) => d.nome)
  /* Numa ação antiga, o que não bater com nenhuma área atual continua como
     opção, em vez de sumir. */
  const opcoesOnde = [...nomesAreas, ...onde.filter((x) => !nomesAreas.includes(x))]
    .map((nome) => ({ value: nome, label: nome }))

  const valido = oQue.trim().length >= 5 && responsavel.quemId !== '' && quando.length > 0

  const retrato = JSON.stringify([risco, oQue, porQue, responsavel.quemId, quando, como, quanto, status])
  const retratoInicial = useRef(retrato)
  const sujo = retrato !== retratoInicial.current || ondeTocado
  useEffect(() => { onSujo?.(sujo) }, [sujo, onSujo])

  const salvar = async () => {
    if (!valido) return
    setSalvando(true)
    const salvo = await nr1AcaoService.salvar({
      id: inicial?.id ?? '',
      riscoId: risco,
      oQue: oQue.trim(), porQue: porQue.trim(), quem: responsavel.quemFinal, quando,
      onde: onde.join(', '), como: como.trim(), quanto: quanto.trim(),
      status,
      comentarios: inicial?.comentarios ?? [],
      concluidaEm: inicial?.concluidaEm,
      versao: inicial?.versao ?? 1,
      versaoAnteriorId: inicial?.versaoAnteriorId,
      motivoRevisao: inicial?.motivoRevisao,
      efetividade: inicial?.efetividade,
    })
    setSalvando(false)
    onSaved(salvo, !inicial)
  }

  const inline = layout === 'inline'

  const campos = (
    <>
      {riscos && (
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">Risco que esta ação responde</p>
          <SearchSelect
            value={risco}
            onChange={setRisco}
            size="md"
            options={[...riscos].sort((a, b) => nr1RotuloRisco(a).localeCompare(nr1RotuloRisco(b))).map((r) => ({ value: r.id, label: nr1RotuloRisco(r) }))}
            searchPlaceholder="Buscar por domínio ou fator…"
          />
        </div>
      )}

      <Input label="O quê (a medida de controle)" value={oQue} onChange={(e) => setOQue(e.target.value)} placeholder="Ex.: Instituir janela de pausa obrigatória" />

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-ink">Por quê</span>
        <Textarea rows={2} value={porQue} onChange={(e) => setPorQue(e.target.value)} placeholder="O que esta medida reduz" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">Quem (responsável)</p>
          <SearchSelect
            value={responsavel.quemId}
            onChange={responsavel.setQuemId}
            options={responsavel.opcoes}
            placeholder={responsavel.carregando ? 'Carregando…' : 'Selecionar colaborador'}
            searchPlaceholder="Buscar por nome…"
          />
        </div>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink">Quando (prazo)</span>
          <input
            type="date"
            value={quando}
            onChange={(e) => setQuando(e.target.value)}
            className="w-full rounded border-[1.5px] border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
          />
        </label>
      </div>

      <div>
        <p className="mb-1.5 text-[13px] font-semibold text-ink">Onde</p>
        <MultiSelect
          values={onde}
          onChange={(v) => { setOndeTocado(true); setOnde(v) }}
          options={opcoesOnde}
          placeholder="Selecionar áreas"
          ariaLabel="Onde (áreas)"
        />
      </div>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-ink">Como</span>
        <Textarea rows={2} value={como} onChange={(e) => setComo(e.target.value)} placeholder="De que forma a medida será executada" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Quanto (custo estimado)" value={quanto} onChange={(e) => setQuanto(e.target.value)} placeholder="Ex.: R$ 18.500 ou sem custo direto" />
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">Status</p>
          <Select
            value={status}
            onChange={(v) => setStatus(v as Nr1AcaoStatus)}
            ariaLabel="Status da ação"
            options={(['planejada', 'em-andamento', 'atrasada'] as Nr1AcaoStatus[]).map((s) => ({ value: s, label: ACAO_STATUS[s].label }))}
          />
        </div>
      </div>
      {!inline && (
        <p className="-mt-2 text-[11.5px] leading-relaxed text-ink-muted">
          Concluir a ação exige evidência anexada, e isso é feito no detalhe.
        </p>
      )}
    </>
  )

  const rotulo = salvando ? 'Salvando…' : inicial ? 'Salvar ação' : 'Criar ação'

  if (inline) {
    return (
      <div className="flex flex-col gap-3.5 rounded-lg border border-primary/30 bg-surface-2 p-4">
        <div>
          <p className="font-heading text-[14px] font-semibold text-ink">{inicial ? 'Editar ação' : 'Nova ação de mitigação'}</p>
          <p className="mt-0.5 text-[11.5px] text-ink-muted">Modelo 5W2H — o quê, por quê, quem, quando, onde, como e quanto.</p>
        </div>
        {campos}
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button size="sm" iconLeft="ph:check-bold" disabled={!valido || salvando} onClick={salvar}>{rotulo}</Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Corpo rolável + rodapé de ações fixo — mesma estrutura do detalhe
         da ação (`sticky bottom-0` dentro do scroll que o Sheet já provê). */}
      <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">{campos}</div>
      <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-border bg-surface px-5 py-4 sm:flex-row sm:justify-end lg:px-6">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button iconLeft="ph:check-bold" disabled={!valido || salvando} onClick={salvar}>{rotulo}</Button>
      </div>
    </>
  )
}
