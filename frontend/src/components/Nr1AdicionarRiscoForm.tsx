import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from './Button'
import { Select } from './Select'
import { Textarea } from './Textarea'
import { useService } from '../hooks/useService'
import { nr1ResultadoService } from '../services/nr1'
import { rhDepartamentoService } from '../services/rh'
import { NR1_DIMENSOES, nr1NivelPorProduto } from '../data/nr1Mock'
import { NIVEL_RISCO, STATUS_RISCO } from '../lib/nr1'
import type { Nr1DimensaoId, Nr1RiscoInventario, Nr1RiscoStatus, Nr1Severidade } from '../types'

/* Formulário "Adicionar risco" — os mesmos sete campos do GRO que já
   aparecem no detalhe do risco (fator, danos, grupo exposto, dimensão,
   probabilidade, severidade, controles). Usado em três pontos: o botão
   "Adicionar risco" do Inventário (`NR1RhInventario.tsx`, sem `prefill` — um
   risco identificado fora da pesquisa, por auditoria ou observação direta),
   o botão "Adicionar ao inventário" da aba "Riscos sugeridos"
   (`Nr1RiscosSugeridos.tsx`, com `prefill` vindo da leitura da sugestão), e
   "Editar" no detalhe de um risco existente (`NR1RhInventario.tsx`, com
   `inicial` — mesmos campos, virando um update em vez de um insert).

   Em todos os casos, o RH ainda escolhe e pode ajustar cada campo antes de
   salvar — mesmo quando `prefill` já sugere valores, nada é gravado sem
   confirmação explícita: o julgamento de probabilidade/severidade do GRO
   continua sendo do SST/RH, nunca calculado sozinho pelo produto a partir
   da leitura da sugestão. */
export function Nr1AdicionarRiscoForm({
  onClose,
  onSaved,
  prefill,
  inicial,
}: {
  onClose: () => void
  onSaved: (salvo?: Nr1RiscoInventario) => void
  prefill?: {
    dimensaoId?: Nr1DimensaoId
    departamentoIds?: string[]
    fator?: string
    danos?: string
    probabilidade?: number
    severidade?: Nr1Severidade
    controles?: string
    origemSugestaoId?: string
  }
  /** Presente no modo "Editar" — o risco existente sendo alterado. Quando
     presente, `prefill` é ignorado (os dois nunca coexistem). */
  inicial?: Nr1RiscoInventario
}) {
  const departamentos = useService(() => rhDepartamentoService.list(), [])

  const [dimensaoId, setDimensaoId] = useState<Nr1DimensaoId>(inicial?.dimensaoId ?? prefill?.dimensaoId ?? NR1_DIMENSOES[0]!.id)
  const [departamentoIds, setDepartamentoIds] = useState<string[]>(inicial?.departamentoIds ?? prefill?.departamentoIds ?? [])
  const [fator, setFator] = useState(inicial?.fator ?? prefill?.fator ?? '')
  const [danos, setDanos] = useState(inicial?.danos ?? prefill?.danos ?? '')
  const [probabilidade, setProbabilidade] = useState(String(inicial?.probabilidade ?? prefill?.probabilidade ?? 3))
  const [severidade, setSeveridade] = useState(String(inicial?.severidade ?? prefill?.severidade ?? 3))
  const [controles, setControles] = useState(inicial ? inicial.controles.join('\n') : (prefill?.controles ?? ''))
  const [status, setStatus] = useState<Nr1RiscoStatus>(inicial?.status ?? 'identificado')
  const [salvando, setSalvando] = useState(false)

  const dep = departamentos.status === 'success' ? departamentos.data : []

  const toggleDepartamento = (id: string) => {
    setDepartamentoIds((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]))
  }

  const nivelNum = Number(probabilidade) * Number(severidade)
  const nivel = NIVEL_RISCO[nr1NivelPorProduto(nivelNum)]

  const valido = fator.trim().length >= 10 && danos.trim().length >= 5 && departamentoIds.length > 0

  const salvar = async () => {
    if (!valido) return
    setSalvando(true)
    const patch = {
      dimensaoId,
      departamentoIds,
      fator: fator.trim(),
      danos: danos.trim(),
      probabilidade: Number(probabilidade),
      severidade: Number(severidade) as Nr1Severidade,
      controles: controles.split('\n').map((c) => c.trim()).filter(Boolean),
    }
    const salvo = inicial
      ? await nr1ResultadoService.editarRisco(inicial.id, { ...patch, status })
      : await nr1ResultadoService.adicionarRisco({ ...patch, origemSugestaoId: prefill?.origemSugestaoId })
    setSalvando(false)
    onSaved(salvo)
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
      <div>
        <p className="mb-1.5 text-[13px] font-semibold text-ink">Dimensão</p>
        <Select
          value={dimensaoId}
          onChange={(v) => setDimensaoId(v as Nr1DimensaoId)}
          ariaLabel="Dimensão do risco"
          options={NR1_DIMENSOES.map((d) => ({ value: d.id, label: d.nome }))}
        />
      </div>

      <div>
        <p className="mb-1.5 text-[13px] font-semibold text-ink">Grupo de trabalhadores exposto</p>
        <p className="mb-2 text-[11.5px] leading-relaxed text-ink-muted">
          Um risco pode atravessar mais de uma área — selecione todas as que se aplicam.
        </p>
        {departamentos.status === 'success' && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Departamentos expostos">
            {dep.map((d) => {
              const selecionado = departamentoIds.includes(d.id)
              return (
                <button
                  key={d.id}
                  type="button"
                  aria-pressed={selecionado}
                  onClick={() => toggleDepartamento(d.id)}
                  className={`inline-flex items-center gap-1.5 rounded-pill border-[1.5px] px-3.5 py-2 text-[13px] font-medium transition-colors ${
                    selecionado
                      ? 'border-primary bg-primary-50 text-primary dark:text-primary-300'
                      : 'border-border-strong bg-surface-2 text-ink-secondary hover:border-primary hover:text-primary dark:hover:text-primary-300'
                  }`}
                >
                  <Icon icon={selecionado ? 'ph:check-circle-bold' : 'ph:circle-dashed-bold'} width={14} aria-hidden />
                  {d.nome}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-ink">Descrição do fator / perigo</span>
        <Textarea rows={2} value={fator} onChange={(e) => setFator(e.target.value)} placeholder="Ex.: Ritmo de trabalho acelerado, sem pausas regulares" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-ink">Possíveis danos à saúde</span>
        <Textarea rows={2} value={danos} onChange={(e) => setDanos(e.target.value)} placeholder="Ex.: Fadiga crônica, esgotamento profissional" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">Probabilidade (1-5)</p>
          <Select
            value={probabilidade}
            onChange={setProbabilidade}
            ariaLabel="Probabilidade"
            options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))}
          />
        </div>
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">Severidade (1-5)</p>
          <Select
            value={severidade}
            onChange={setSeveridade}
            ariaLabel="Severidade"
            options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface-2 p-4">
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">Nível calculado</p>
        <div className="mt-2 flex items-center gap-3">
          <span className={`flex flex-col items-center gap-0.5 rounded-lg px-4 py-2 ${nivel.cls}`}>
            <span className="font-mono text-[18px] font-bold leading-none">{nivelNum}</span>
            <span className="text-[10.5px] font-semibold leading-none">{nivel.label}</span>
          </span>
          <p className="text-[12px] leading-relaxed text-ink-secondary">{nivel.acao}</p>
        </div>
      </div>

      {inicial && (
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">Status</p>
          <Select
            value={status}
            onChange={(v) => setStatus(v as Nr1RiscoStatus)}
            ariaLabel="Status do risco"
            options={(Object.keys(STATUS_RISCO) as Nr1RiscoStatus[]).map((s) => ({ value: s, label: STATUS_RISCO[s].label }))}
          />
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">
            Normalmente calculado a partir da evolução entre ciclos. Trocar aqui é um julgamento
            manual do RH/SST, e vale até a próxima edição.
          </p>
        </div>
      )}

      {prefill?.origemSugestaoId && (
        <div className="rounded-lg border border-warning/30 bg-warning-bg p-3.5">
          <p className="text-[11.5px] leading-relaxed text-warning-ink">
            Probabilidade e severidade vieram pré-preenchidas a partir da leitura sugerida — confirme
            ou ajuste os dois valores antes de salvar. Esse julgamento é seu, não do produto.
          </p>
        </div>
      )}

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-ink">Controles recomendados</span>
        <Textarea rows={3} value={controles} onChange={(e) => setControles(e.target.value)} placeholder={'Um controle por linha, ex.:\nRevisar escala da equipe\nInstituir pausa obrigatória'} />
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">Um item por linha.</p>
      </label>

      <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button iconLeft="ph:check-bold" disabled={!valido || salvando} onClick={salvar}>
          {salvando ? 'Salvando…' : inicial ? 'Salvar alterações' : 'Adicionar risco'}
        </Button>
      </div>
    </div>
  )
}
