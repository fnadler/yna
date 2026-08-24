import { Icon } from '@iconify/react'
import { Sheet } from './Sheet'
import { Button } from './Button'
import { Badge } from './Badge'
import { NIVEL_RISCO } from '../lib/nr1'
import { nr1DimensaoNome } from '../data/nr1Mock'
import type { Nr1CidProbabilidade, Nr1RiscoSugeridoLeitura } from '../types'

/* Modal de análise de uma sugestão de risco — o detalhe completo, incluindo
   o possível enquadramento CID-11 e os dois disclaimers mais explícitos da
   aba (CID + responsabilidade). Aberto a partir do botão "Analisar" de
   `Nr1RiscosSugeridos.tsx`. */
export function Nr1RiscoAnaliseSheet({ leitura, onClose, onAdicionarAoInventario }: {
  leitura: Nr1RiscoSugeridoLeitura | null
  onClose: () => void
  onAdicionarAoInventario: (leitura: Nr1RiscoSugeridoLeitura) => void
}) {
  return (
    <Sheet open={leitura !== null} onClose={onClose} title="Análise da sugestão" icon="ph:magnifying-glass-bold" size="md">
      {leitura && <Conteudo leitura={leitura} onAdicionarAoInventario={onAdicionarAoInventario} />}
    </Sheet>
  )
}

function Conteudo({ leitura, onAdicionarAoInventario }: {
  leitura: Nr1RiscoSugeridoLeitura
  onAdicionarAoInventario: (leitura: Nr1RiscoSugeridoLeitura) => void
}) {
  const { sugestao, mediaEmpresa, nivelEmpresa, disparado, departamentosEnvolvidos, jaNoInventario } = leitura
  const st = NIVEL_RISCO[nivelEmpresa]

  return (
    <div className="flex flex-col gap-5 px-5 py-6 lg:px-6">
      <div>
        <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          {nr1DimensaoNome(sugestao.dimensaoId)}
        </span>
        <h3 className="mt-1 font-heading text-[17px] font-semibold text-ink">{sugestao.nome}</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">{sugestao.descricao}</p>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-4">
        <span className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-4 py-2 ${st.cls}`}>
          <span className="font-mono text-[18px] font-bold leading-none">{mediaEmpresa.toFixed(1)}</span>
          <span className="text-[10.5px] font-semibold leading-none">{st.label}</span>
        </span>
        <p className="text-[12.5px] leading-relaxed text-ink-secondary">
          {disparado
            ? 'A média da dimensão neste ciclo está no nível que faz esta sugestão "poder se aplicar" — não que ela se confirme.'
            : 'A média da dimensão neste ciclo está abaixo do gatilho desta sugestão. Mostrada aqui para referência, não como algo identificado.'}
        </p>
      </div>

      {departamentosEnvolvidos.length > 0 && (
        <div>
          <p className="mb-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
            Áreas onde o padrão é mais forte
          </p>
          <ul className="flex flex-col gap-1.5">
            {departamentosEnvolvidos.map((d) => {
              const dst = NIVEL_RISCO[d.nivel]
              return (
                <li key={d.departamentoId} className="flex items-center justify-between gap-3 rounded-lg bg-surface-2 px-3.5 py-2.5">
                  <span className="text-[13px] font-medium text-ink">{d.departamento}</span>
                  <span className={`rounded-pill px-2 py-0.5 font-mono text-[11px] font-semibold ${dst.cls}`}>
                    {d.media.toFixed(1)} · {dst.label}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div>
        <p className="mb-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          Itens do questionário relacionados
        </p>
        <p className="rounded-lg bg-surface-2 px-3.5 py-3 font-mono text-[12px] text-ink-secondary">
          {sugestao.itensRelacionados.join(', ')}
        </p>
      </div>

      {/* CID-11 — disclaimer 2 do documento de origem */}
      <section className="rounded-lg border border-primary/25 bg-primary-50 p-4 dark:border-primary-300/25">
        <h4 className="flex items-center gap-2 font-heading text-[13.5px] font-semibold text-primary dark:text-primary-300">
          <Icon icon="ph:warning-bold" width={16} aria-hidden />
          Possível enquadramento CID-11
        </h4>
        <ul className="mt-3 flex flex-col gap-2">
          {sugestao.cids.map((c) => (
            <li key={c.codigo} className="flex items-start justify-between gap-3 text-[12.5px]">
              <span className="text-ink-secondary">
                <span className="font-mono font-bold text-ink">{c.codigo}</span> — {c.descricao}
              </span>
              <ProbabilidadeTag probabilidade={c.probabilidade} />
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t border-primary/20 pt-3 text-[11.5px] italic leading-relaxed text-ink-secondary dark:border-primary-300/20">
          {sugestao.disclaimerCid}
        </p>
      </section>

      <div>
        <p className="mb-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          Ações recomendadas
        </p>
        <ul className="flex flex-col gap-1.5">
          {sugestao.acoesRecomendadas.map((a, i) => (
            <li key={i} className="flex items-start gap-2 rounded-lg bg-surface-2 px-3.5 py-2.5 text-[13px] leading-snug text-ink-secondary">
              <Icon icon="ph:check-bold" width={13} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
              {a}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          Frequência de monitoramento
        </p>
        <p className="text-[13px] leading-relaxed text-ink-secondary">{sugestao.monitoramento}</p>
      </div>

      {/* Responsabilidade — disclaimer 3/4 do documento de origem */}
      <div className="flex gap-3 rounded-lg border border-danger/25 bg-danger-bg p-4">
        <Icon icon="ph:shield-warning-bold" width={18} className="mt-0.5 shrink-0 text-danger-ink" aria-hidden />
        <p className="text-[12px] leading-relaxed text-danger-ink">
          <strong>Responsabilidade:</strong> validar esta leitura com um profissional de SST é obrigatório
          antes de qualquer ação organizacional. Diagnóstico e recomendação clínica são responsabilidade
          exclusiva de profissionais habilitados (psicólogo/médico) contratados pela empresa — a YNA
          fornece a ferramenta de triagem, não o diagnóstico.
        </p>
      </div>

      <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {jaNoInventario ? (
          <Badge tone="success" icon="ph:check-circle-bold" className="self-center sm:self-auto">Já está no inventário</Badge>
        ) : (
          <Button iconLeft="ph:plus-bold" onClick={() => onAdicionarAoInventario(leitura)}>Adicionar ao inventário</Button>
        )}
      </div>
    </div>
  )
}

const PROBABILIDADE_LABEL: Record<Nr1CidProbabilidade, string> = { alta: 'Alta', media: 'Média', baixa: 'Baixa' }

function ProbabilidadeTag({ probabilidade }: { probabilidade: Nr1CidProbabilidade }) {
  return (
    <span className="shrink-0 rounded-pill bg-surface px-2 py-0.5 text-[10.5px] font-medium text-ink-muted">
      Associação {PROBABILIDADE_LABEL[probabilidade].toLowerCase()}
    </span>
  )
}
