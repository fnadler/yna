import { useMemo, useState } from 'react'
import { Button } from './Button'
import { Input } from './Input'
import { Select } from './Select'
import { SearchSelect } from './SearchSelect'
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
   nome sobre a lista real de colaboradores da empresa (`rhColaboradorService`),
   não mais um texto livre. `Nr1Acao.quem` continua sendo string (não um id):
   isolar a conversão aqui evita duplicar a lógica entre "Nova ação" e "Editar
   ação", os dois casos de `AcaoForm`.

   Quando a ação sendo editada já tem um responsável que não é nenhum
   colaborador atual, esse texto aparece como a primeira opção da lista,
   pré-selecionado — a pessoa pode manter ou trocar por um colaborador real,
   nunca perde o que já estava lá. */
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
  }, [lista, quemAtual])

  return {
    quemId,
    setQuemId,
    opcoes,
    quemFinal: opcoes.find((o) => o.value === quemId)?.label ?? '',
    carregando: colaboradores.status === 'loading' || departamentos.status === 'loading',
  }
}

/** Formulário 5W2H — extraído de `NR1RhPlanoAcao.tsx` para ser reaproveitado
   onde mais alguém precisar editar uma ação existente (hoje, o detalhe de
   um plano de ação aberto a partir de "Seus planos de ação" na Visão geral,
   `NR1RhCockpit.tsx`). Os sete campos da norma, na ordem em que fazem
   sentido preencher — não em ordem alfabética de sigla. Serve tanto para
   criar (sem `inicial`) quanto para editar (com `inicial`). */
export function AcaoForm({ inicial, riscoId, riscos, onClose, onSaved }: {
  inicial?: Nr1Acao
  riscoId: string
  riscos: Nr1RiscoInventario[]
  onClose: () => void
  onSaved: (salvo: Nr1Acao) => void
}) {
  const [risco, setRisco] = useState(inicial?.riscoId ?? riscoId)
  const [oQue, setOQue] = useState(inicial?.oQue ?? '')
  const [porQue, setPorQue] = useState(inicial?.porQue ?? '')
  const responsavel = useResponsavelField(inicial?.quem)
  const [quando, setQuando] = useState(inicial?.quando ?? '')
  const [onde, setOnde] = useState(inicial?.onde ?? '')
  const [como, setComo] = useState(inicial?.como ?? '')
  const [quanto, setQuanto] = useState(inicial?.quanto ?? '')
  const [status, setStatus] = useState<Nr1AcaoStatus>(inicial?.status ?? 'planejada')
  const [salvando, setSalvando] = useState(false)

  const valido = oQue.trim().length >= 5 && responsavel.quemId !== '' && quando.length > 0

  const salvar = async () => {
    if (!valido) return
    setSalvando(true)
    const salvo = await nr1AcaoService.salvar({
      id: inicial?.id ?? '',
      riscoId: risco,
      oQue: oQue.trim(), porQue: porQue.trim(), quem: responsavel.quemFinal, quando,
      onde: onde.trim(), como: como.trim(), quanto: quanto.trim(),
      status,
      comentarios: inicial?.comentarios ?? [],
      concluidaEm: inicial?.concluidaEm,
      versao: inicial?.versao ?? 1,
      versaoAnteriorId: inicial?.versaoAnteriorId,
      motivoRevisao: inicial?.motivoRevisao,
      efetividade: inicial?.efetividade,
    })
    onSaved(salvo)
  }

  return (
    <>
      {/* Corpo rolável + rodapé de ações fixo — mesma estrutura do detalhe
         da ação (`sticky bottom-0` dentro do scroll que o Sheet já provê),
         pra não ficar um modal com diagramação diferente dos outros. */}
      <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">Risco que esta ação responde</p>
          <Select
            value={risco}
            onChange={setRisco}
            ariaLabel="Risco de origem"
            options={riscos.map((r) => ({ value: r.id, label: `${r.grupoExposto} · ${r.fator.slice(0, 60)}${r.fator.length > 60 ? '…' : ''}` }))}
          />
        </div>

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

        <Input label="Onde" value={onde} onChange={(e) => setOnde(e.target.value)} placeholder="Área ou unidade" />

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink">Como</span>
          <Textarea rows={2} value={como} onChange={(e) => setComo(e.target.value)} placeholder="De que forma a medida será executada" />
        </label>

        <Input label="Quanto (custo estimado)" value={quanto} onChange={(e) => setQuanto(e.target.value)} placeholder="Ex.: R$ 18.500 ou sem custo direto" />

        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">Status</p>
          <Select
            value={status}
            onChange={(v) => setStatus(v as Nr1AcaoStatus)}
            ariaLabel="Status da ação"
            options={(['planejada', 'em-andamento', 'atrasada'] as Nr1AcaoStatus[]).map((s) => ({ value: s, label: ACAO_STATUS[s].label }))}
          />
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">
            Concluir a ação exige evidência anexada, e isso é feito no detalhe.
          </p>
        </div>
      </div>

      <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-border bg-surface px-5 py-4 sm:flex-row sm:justify-end lg:px-6">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button iconLeft="ph:check-bold" disabled={!valido || salvando} onClick={salvar}>
          {salvando ? 'Salvando…' : inicial ? 'Salvar ação' : 'Criar ação'}
        </Button>
      </div>
    </>
  )
}
