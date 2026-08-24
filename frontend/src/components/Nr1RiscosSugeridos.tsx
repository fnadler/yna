import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from './Button'
import { Badge } from './Badge'
import { Sheet } from './Sheet'
import { Skeleton } from './Skeleton'
import { ErrorState } from './ErrorState'
import { Nr1AdicionarRiscoForm } from './Nr1AdicionarRiscoForm'
import { Nr1RiscoAnaliseSheet } from './Nr1RiscoAnaliseSheet'
import { NIVEL_RISCO } from '../lib/nr1'
import { nr1DimensaoNome } from '../data/nr1Mock'
import { useService } from '../hooks/useService'
import { nr1ResultadoService } from '../services/nr1'
import type { Nr1RiscoSugeridoLeitura } from '../types'

/* Aba "Riscos sugeridos" (dentro do detalhe de um ciclo) — ⚠️ TRIAGEM
   ASSISTIDA, não diagnóstico. As 7 leituras vêm de `NR1_RISCOS_SUGERIDOS`
   (padrões de literatura, COPSOQ II-Br + possível associação CID-11) mas o
   "disparado"/"não identificado" e os departamentos envolvidos são
   calculados a partir do MESMO dado do "Risco por dimensão"/mapa de calor
   deste ciclo (`nr1ResultadoService.riscosSugeridos`) — nunca um número à
   parte.

   Três camadas de disclaimer, como pedido: aqui no topo da aba (geral +
   por card), e o detalhado dentro de `Nr1RiscoAnaliseSheet`. Em nenhum
   lugar o texto afirma um risco ou um diagnóstico — sempre "possível",
   "sugere", "pode se aplicar". A decisão de investigar, validar com SST e
   agir é sempre da empresa (RH). */
export function Nr1RiscosSugeridosTab({ campanhaId }: { campanhaId: string }) {
  const leituras = useService(() => nr1ResultadoService.riscosSugeridos(campanhaId), [campanhaId])
  const [analisando, setAnalisando] = useState<Nr1RiscoSugeridoLeitura | null>(null)
  const [adicionando, setAdicionando] = useState<Nr1RiscoSugeridoLeitura | null>(null)

  return (
    <div className="flex flex-col gap-5">
      <DisclaimerGeral />

      <div>
        <h2 className="text-[15px] font-semibold text-ink">7 possíveis riscos psicossociais</h2>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-secondary">
          Leituras de padrão calculadas a partir das respostas deste ciclo. Nenhum risco é
          adicionado ao inventário automaticamente — você escolhe quais investigar e quais levar
          adiante.
        </p>
      </div>

      {(leituras.status === 'idle' || leituras.status === 'loading') && (
        <div className="flex flex-col gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-44 w-full rounded-lg" />)}</div>
      )}
      {leituras.status === 'error' && <ErrorState message={leituras.message} onRetry={leituras.reload} />}
      {leituras.status === 'success' && (
        <div className="flex flex-col gap-3">
          {leituras.data.map((leitura) => (
            <RiscoSugeridoCard
              key={leitura.sugestao.id}
              leitura={leitura}
              onAnalisar={() => setAnalisando(leitura)}
              onAdicionar={() => setAdicionando(leitura)}
            />
          ))}
        </div>
      )}

      <Nr1RiscoAnaliseSheet
        leitura={analisando}
        onClose={() => setAnalisando(null)}
        onAdicionarAoInventario={(l) => { setAnalisando(null); setAdicionando(l) }}
      />

      <Sheet
        open={adicionando !== null}
        onClose={() => setAdicionando(null)}
        title="Adicionar ao inventário"
        icon="ph:plus-bold"
        size="md"
      >
        {adicionando && (
          <Nr1AdicionarRiscoForm
            onClose={() => setAdicionando(null)}
            onSaved={() => { setAdicionando(null); leituras.reload() }}
            prefill={{
              dimensaoId: adicionando.sugestao.dimensaoId,
              departamentoIds: adicionando.departamentosEnvolvidos.map((d) => d.departamentoId),
              fator: `${adicionando.sugestao.nome} — ${adicionando.sugestao.descricao}`,
              danos: `Possíveis danos associados (a validar com SST): ${adicionando.sugestao.cids.map((c) => `${c.codigo} (${c.descricao})`).join('; ')}.`,
              probabilidade: adicionando.departamentosEnvolvidos.length > 0 ? 4 : 3,
              severidade: NIVEL_PARA_SEVERIDADE[adicionando.nivelEmpresa],
              controles: adicionando.sugestao.acoesRecomendadas.join('\n'),
              origemSugestaoId: adicionando.sugestao.id,
            }}
          />
        )}
      </Sheet>
    </div>
  )
}

const NIVEL_PARA_SEVERIDADE = { baixo: 2, atencao: 3, risco: 4, critico: 5 } as const

function DisclaimerGeral() {
  return (
    <div className="rounded-lg border border-warning/30 bg-warning-bg p-4">
      <div className="flex gap-3">
        <Icon icon="ph:warning-bold" width={20} className="mt-0.5 shrink-0 text-warning-ink" aria-hidden />
        <div>
          <p className="font-heading text-[13.5px] font-semibold text-warning-ink">Sobre os riscos sugeridos</p>
          <ul className="mt-2 flex flex-col gap-1.5 text-[12px] leading-relaxed text-warning-ink">
            <li>Estas são <strong>sugestões</strong> baseadas em padrões de literatura — não diagnósticos automáticos.</li>
            <li>Possíveis enquadramentos CID-11 são <strong>apenas indicativos</strong>, nunca diagnósticos médicos.</li>
            <li><strong>Validação com um profissional de SST é obrigatória</strong> antes de qualquer ação organizacional.</li>
            <li>A <strong>responsabilidade</strong> por validar e agir é da empresa contratante (RH), em conjunto com profissionais habilitados.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function RiscoSugeridoCard({ leitura, onAnalisar, onAdicionar }: {
  leitura: Nr1RiscoSugeridoLeitura
  onAnalisar: () => void
  onAdicionar: () => void
}) {
  const { sugestao, mediaEmpresa, nivelEmpresa, disparado, departamentosEnvolvidos, jaNoInventario } = leitura
  const st = NIVEL_RISCO[nivelEmpresa]

  return (
    <article className="rounded-lg border border-border bg-surface p-4 lg:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
            {nr1DimensaoNome(sugestao.dimensaoId)}
          </span>
          <h3 className="mt-1 font-heading text-[15px] font-semibold text-ink">{sugestao.nomeCurto}</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-secondary">{sugestao.descricao}</p>
        </div>
        {disparado ? (
          <span className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-3.5 py-2 ${st.cls}`}>
            <span className="font-mono text-[16px] font-bold leading-none">{mediaEmpresa.toFixed(1)}</span>
            <span className="text-[10px] font-semibold leading-none">{st.label}</span>
          </span>
        ) : (
          <Badge tone="neutral" icon="ph:eye-bold">Não identificado neste ciclo</Badge>
        )}
      </div>

      {departamentosEnvolvidos.length > 0 && (
        <p className="mt-3 flex flex-wrap items-center gap-1.5 text-[11.5px] text-ink-secondary">
          <Icon icon="ph:map-pin-bold" width={12} className="text-ink-muted" aria-hidden />
          Pode se aplicar mais a: <span className="font-medium text-ink">{departamentosEnvolvidos.map((d) => d.departamento).join(', ')}</span>
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
        <span className="text-[11px] text-ink-muted">Possível CID-11:</span>
        {sugestao.cids.slice(0, 2).map((c) => (
          <span key={c.codigo} className="rounded-pill bg-primary-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary dark:text-primary-300">
            {c.codigo}
          </span>
        ))}
        {sugestao.cids.length > 2 && <span className="text-[11px] text-ink-muted">+{sugestao.cids.length - 2} mais</span>}
        <span className="ml-1 flex items-center gap-1 text-[11px] italic text-ink-muted">
          <Icon icon="ph:seal-warning-bold" width={11} aria-hidden />
          requer validação profissional
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
        <Button size="sm" variant="ghost" iconLeft="ph:magnifying-glass-bold" onClick={onAnalisar}>Analisar</Button>
        {jaNoInventario ? (
          <Badge tone="success" icon="ph:check-circle-bold">Já no inventário</Badge>
        ) : (
          <Button size="sm" variant="secondary" iconLeft="ph:plus-bold" onClick={onAdicionar}>Adicionar ao inventário</Button>
        )}
      </div>
    </article>
  )
}
