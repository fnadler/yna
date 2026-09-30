import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from './Button'
import { Badge } from './Badge'
import { Avatar } from './Avatar'
import { PrazoBadge } from './PrazoBadge'
import { Textarea } from './Textarea'
import { NIVEL_RISCO, ACAO_STATUS, EFETIVIDADE, fmtData, nr1DiasEntre, nr1UrgenciaPrazo } from '../lib/nr1'
import { NR1_TODAY, NR1_DIMENSOES } from '../data/nr1Mock'
import { useService } from '../hooks/useService'
import { nr1AcaoService, nr1FonteGeradoraService, nr1ResultadoService } from '../services/nr1'
import type { Nr1Acao, Nr1RiscoInventario } from '../types'

/** Iniciais para o avatar do responsável (`acao.quem`, formato "Nome
   Sobrenome · Departamento") — usa só a parte do nome, antes do "·". */
function iniciaisResponsavel(quem: string) {
  return quem
    .split(' · ')[0]
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/** Detalhe completo de uma ação — extraído de `NR1RhPlanoAcao.tsx` para ser
   reaproveitado onde mais alguém precisar abrir o mesmo modal (hoje, "Seus
   planos de ação" na Visão geral, `NR1RhCockpit.tsx`, que antes só
   navegava para a lista completa em vez de abrir o detalhe ali mesmo).
   Editar e Concluir não vivem aqui dentro: são `headerActions` do `Sheet`
   que envolve este componente, definidos por quem o usa (cada tela decide
   pra onde "Editar" e o que "Concluir" fazem, ex.: reload de que lista). */
export function AcaoDetalhe({ acao, risco, onComentar }: {
  acao: Nr1Acao
  risco?: Nr1RiscoInventario
  onComentar: (p: { texto?: string; arquivos?: string[] }) => Promise<void>
}) {
  const temEvidencia = acao.comentarios.some((c) => c.arquivos && c.arquivos.length > 0)
  const areas = acao.onde.split(',').map((x) => x.trim()).filter(Boolean)

  return (
    <>
      {/* Corpo — rola dentro do container do próprio Sheet (não cria um
         segundo scroll independente: `min-h-full` mais `sticky` no composer
         abaixo já bastam para o rodapé ficar fixo). */}
      <div className="px-5 py-6 lg:px-6">
        <div className="flex flex-col gap-5">
          {acao.status === 'concluida' && acao.concluidaEm && (
            <p className="flex items-center gap-2 rounded-lg bg-success-bg px-3.5 py-3 text-[12.5px] text-success-ink">
              <Icon icon="ph:check-circle-bold" width={15} aria-hidden />
              Concluída em {fmtData(acao.concluidaEm)}
            </p>
          )}

          {/* Mesma ordem, rótulos e disposição do formulário 5W2H
             (`Nr1AcaoForm`): risco no topo, depois os sete campos — Quem ao
             lado de Quando, Quanto ao lado de Status. */}
          {risco && (
            <Campo rotulo="Risco que esta ação responde">
              <RiscoOrigem risco={risco} />
            </Campo>
          )}

          <Campo rotulo="O quê (a medida de controle)"><Valor texto={acao.oQue} destaque /></Campo>
          <Campo rotulo="Por quê"><Valor texto={acao.porQue} /></Campo>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Quem (responsável)">
              <div className="flex min-h-[44px] items-center gap-2 rounded-lg bg-surface-2 px-3.5 py-2">
                <Avatar initials={iniciaisResponsavel(acao.quem)} size={22} />
                <span className="min-w-0 text-[13.5px] leading-snug text-ink">{acao.quem}</span>
              </div>
            </Campo>
            <Campo rotulo="Quando (prazo)">
              <div className="flex min-h-[44px] flex-wrap items-center gap-2 rounded-lg bg-surface-2 px-3.5 py-2">
                <span className="text-[13.5px] text-ink">{fmtData(acao.quando)}</span>
                {/* Selo só quando diz algo além da data (vencida/vencendo). */}
                {acao.status !== 'concluida' && nr1UrgenciaPrazo(nr1DiasEntre(NR1_TODAY, acao.quando)) !== 'no-prazo' && <PrazoBadge acao={acao} />}
              </div>
            </Campo>
          </div>

          <Campo rotulo="Onde">
            <div className="flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-lg bg-surface-2 px-3.5 py-2">
              {areas.length === 0 && <span className="text-[13.5px] text-ink-muted">—</span>}
              {areas.map((a) => (
                <span key={a} className="rounded-pill bg-primary-50 px-2.5 py-0.5 text-[12.5px] font-medium text-primary dark:text-primary-300">{a}</span>
              ))}
            </div>
          </Campo>

          <Campo rotulo="Como"><Valor texto={acao.como} /></Campo>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Quanto (custo estimado)"><Valor texto={acao.quanto} /></Campo>
            <Campo rotulo="Status">
              <div className="flex min-h-[44px] items-center rounded-lg bg-surface-2 px-3.5 py-2">
                <Badge tone={ACAO_STATUS[acao.status].tone}>{ACAO_STATUS[acao.status].label}</Badge>
              </div>
            </Campo>
          </div>

          {acao.versao > 1 && (
            <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-2 p-3.5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
                <Icon icon="ph:arrow-clockwise-bold" width={14} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold text-ink">Versão {acao.versao}</p>
                {acao.motivoRevisao && <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-secondary">{acao.motivoRevisao}</p>}
              </div>
            </div>
          )}

          <VersoesAnteriores acaoId={acao.id} />

          <div>
            <p className="mb-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
              Diário de execução {acao.comentarios.length > 0 && `(${acao.comentarios.length})`}
            </p>
            {!temEvidencia && acao.status !== 'concluida' && (
              <p className="mb-2 rounded-lg bg-warning-bg px-3.5 py-2.5 text-[12px] leading-relaxed text-ink-secondary">
                Nenhum arquivo de evidência anexado ainda. Um comentário com arquivo é o que a
                fiscalização verifica — sem isso, a ação não pode ser concluída.
              </p>
            )}
            {acao.comentarios.length === 0 ? (
              <p className="rounded-lg bg-surface-2 px-3.5 py-3 text-[12.5px] text-ink-secondary">
                Nenhum comentário ainda. Use o campo abaixo para registrar o andamento e anexar
                arquivos de evidência.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-border rounded-lg bg-surface-2">
                {acao.comentarios.map((c) => (
                  <li key={c.id} className="p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12.5px] font-semibold text-ink">{c.autor}</span>
                      <span className="shrink-0 font-mono text-[11px] text-ink-muted">{fmtData(c.em)}</span>
                    </div>
                    {c.texto && <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">{c.texto}</p>}
                    {c.arquivos && c.arquivos.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {c.arquivos.map((nome, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 rounded-pill bg-surface px-2.5 py-1 text-[11.5px] text-ink">
                            <Icon icon="ph:file-bold" width={12} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
                            <span className="max-w-[220px] truncate">{nome}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Composer — `sticky bottom-0` dentro do mesmo container rolável do
         Sheet (não um segundo scroll independente): fica colado ao fundo
         da área visível enquanto há conteúdo acima para rolar. Substitui o
         antigo botão único "Anexar evidência": cada envio é um comentário,
         que pode trazer arquivo(s) ou não. */}
      <div className="sticky bottom-0">
        <ComentarioComposer onEnviar={onComentar} />
      </div>
    </>
  )
}

/** Um campo do 5W2H em modo leitura — mesmo rótulo do formulário. */
function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[13px] font-semibold text-ink">{rotulo}</p>
      {children}
    </div>
  )
}

function Valor({ texto, destaque = false }: { texto: string; destaque?: boolean }) {
  return (
    <p className={`min-h-[44px] rounded-lg bg-surface-2 px-3.5 py-2.5 text-[13.5px] leading-relaxed ${texto ? 'text-ink' : 'text-ink-muted'} ${destaque ? 'font-medium' : ''}`}>
      {texto || '—'}
    </p>
  )
}

/** O risco de origem no mesmo formato do registro feito na análise de
   risco do Inventário (mapa de calor): domínio → fator de risco com o nível
   (P × S) → fontes geradoras → áreas afetadas, cada uma com a nota do
   domínio no ciclo em que o risco foi registrado. */
function RiscoOrigem({ risco }: { risco: Nr1RiscoInventario }) {
  const fontes = useService(() => nr1FonteGeradoraService.list(), [])
  const mapa = useService(() => nr1ResultadoService.mapaCalor(risco.campanhaId), [risco.campanhaId])
  const meta = NR1_DIMENSOES.find((d) => d.id === risco.dimensaoId)
  const st = NIVEL_RISCO[risco.nivel]
  const nomes = risco.grupoExposto.split(',').map((x) => x.trim())
  const fontesIds = risco.fontesGeradorasIds ?? []

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center gap-2.5 border-b border-border bg-surface-2 px-3.5 py-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
          <Icon icon={meta?.icon ?? 'ph:list-bold'} width={15} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted">Domínio</p>
          <p className="truncate text-[13px] font-semibold text-ink">{risco.dimensao}</p>
        </div>
        <Link
          to="/rh/nr1/inventario"
          className="inline-flex shrink-0 items-center gap-1 text-[11.5px] font-medium text-primary hover:underline dark:text-primary-300"
        >
          Ver no inventário
          <Icon icon="ph:arrow-right-bold" width={10} aria-hidden />
        </Link>
      </div>

      <div className="flex flex-col gap-3.5 p-3.5">
        <div className="flex items-start gap-3">
          <span className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 ${st.cls}`}>
            <span className="font-mono text-[16px] font-bold leading-none">{risco.nivelNum}</span>
            <span className="text-[10px] font-semibold leading-none">{st.label}</span>
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted">Fator de risco</p>
            <p className="text-[13.5px] font-semibold leading-snug text-ink">{risco.fator}</p>
            <p className="mt-0.5 text-[11.5px] text-ink-secondary">
              Probabilidade {risco.probabilidade} × severidade {risco.severidade} · {st.acao}
            </p>
          </div>
        </div>

        {fontesIds.length > 0 && (
          <div>
            <p className="mb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted">Fontes geradoras</p>
            <div className="flex flex-wrap gap-1.5">
              {fontesIds.map((id) => (
                <span key={id} className="rounded-pill bg-surface-2 px-2.5 py-1 text-[12px] text-ink-secondary">
                  {fontes.status === 'success' ? (fontes.data.find((f) => f.id === id)?.nome ?? id) : '…'}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted">Áreas afetadas · nota do domínio</p>
          <div className="flex flex-wrap gap-1.5">
            {risco.departamentoIds.map((id, i) => {
              const linha = mapa.status === 'success' ? mapa.data.find((l) => l.departamentoId === id) : undefined
              const celula = linha && !linha.protegido ? linha.celulas.find((c) => c.dimensaoId === risco.dimensaoId) : undefined
              return (
                <span key={id} className="inline-flex items-center gap-1.5 rounded-pill bg-primary-50 py-1 pl-2.5 pr-1 text-[12px] font-medium text-primary dark:text-primary-300">
                  {linha?.departamento ?? nomes[i] ?? id}
                  {celula?.media != null && celula.nivel && (
                    <span className={`rounded-pill px-1.5 font-mono text-[10.5px] font-semibold ${NIVEL_RISCO[celula.nivel].cls}`}>{celula.media.toFixed(1)}</span>
                  )}
                </span>
              )
            })}
          </div>
        </div>

        {risco.danos && (
          <p className="text-[12px] leading-relaxed text-ink-secondary">
            <span className="font-medium text-ink">Possíveis danos:</span> {risco.danos}
          </p>
        )}
      </div>
    </div>
  )
}

/** Campo de comentário fixo no rodapé do detalhe da ação — texto livre e
   anexos de arquivo juntos na mesma mensagem, sempre visível (não é preciso
   abrir nada para comentar ou anexar evidência, ao contrário do antigo
   fluxo de um botão só). Fica de fora da área rolável do modal (`AcaoDetalhe`
   acima), então nunca sai da vista ao rolar o resto do conteúdo. */
function ComentarioComposer({ onEnviar }: { onEnviar: (p: { texto?: string; arquivos?: string[] }) => Promise<void> }) {
  const [texto, setTexto] = useState('')
  const [arquivos, setArquivos] = useState<string[]>([])
  const [enviando, setEnviando] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const podeEnviar = (texto.trim().length > 0 || arquivos.length > 0) && !enviando

  const enviar = async () => {
    if (!podeEnviar) return
    setEnviando(true)
    await onEnviar({ texto: texto.trim() || undefined, arquivos: arquivos.length > 0 ? arquivos : undefined })
    setTexto('')
    setArquivos([])
    setEnviando(false)
  }

  return (
    <div className="shrink-0 border-t border-border bg-surface px-5 py-4 lg:px-6">
      {arquivos.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {arquivos.map((nome, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 rounded-pill bg-surface-2 px-2.5 py-1 text-[11.5px] text-ink-secondary">
              <Icon icon="ph:paperclip-bold" width={11} className="shrink-0" aria-hidden />
              <span className="max-w-[140px] truncate">{nome}</span>
              <button
                type="button"
                onClick={() => setArquivos((a) => a.filter((_, x) => x !== i))}
                aria-label={`Remover ${nome}`}
                className="text-ink-muted transition-colors hover:text-ink"
              >
                <Icon icon="ph:x-bold" width={10} aria-hidden />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <Textarea
          rows={1}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Comente o andamento…"
          className="flex-1"
          style={{ minHeight: 44 }}
        />
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const nomes = Array.from(e.target.files ?? []).map((f) => f.name)
            if (nomes.length > 0) setArquivos((a) => [...a, ...nomes])
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label="Anexar arquivo"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-border text-ink-secondary transition-colors hover:border-border-strong hover:bg-surface-hover"
        >
          <Icon icon="ph:paperclip-bold" width={17} aria-hidden />
        </button>
        <Button iconLeft="ph:paper-plane-tilt-bold" disabled={!podeEnviar} onClick={enviar}>
          {enviando ? 'Enviando…' : 'Enviar'}
        </Button>
      </div>
    </div>
  )
}

/* Versões anteriores de um plano — a v1 nunca é editada nem some, só deixa
   de ser "a" versão vigente. Aqui aparecem com o que foi tentado e, quando
   já avaliado, a efetividade percebida. */
function VersoesAnteriores({ acaoId }: { acaoId: string }) {
  const versoes = useService(() => nr1AcaoService.versoes(acaoId), [acaoId])

  if (versoes.status !== 'success') return null
  const anteriores = versoes.data.slice(1) // o primeiro item é a própria ação atual
  if (anteriores.length === 0) return null

  return (
    <div>
      <p className="mb-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
        Versões anteriores
      </p>
      <ul className="flex flex-col gap-1.5">
        {anteriores.map((v) => (
          <li key={v.id} className="rounded-lg bg-surface-2 px-3.5 py-2.5">
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 flex-1 text-[12.5px] font-medium leading-snug text-ink">v{v.versao} · {v.oQue}</p>
              {v.efetividade && (
                <Badge tone={EFETIVIDADE[v.efetividade].tone} className="shrink-0">{EFETIVIDADE[v.efetividade].label}</Badge>
              )}
            </div>
            {v.motivoRevisao && <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">Revisada porque: {v.motivoRevisao}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
