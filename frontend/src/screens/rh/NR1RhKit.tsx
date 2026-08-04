import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Sheet } from '../../components/Sheet'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { fmtData } from '../../lib/nr1'
import { useService } from '../../hooks/useService'
import { nr1KitService, nr1CampanhaService } from '../../services/nr1'
import type { Nr1KitMaterial, Nr1MaterialTipo } from '../../types'

/* NR1-RH-09 — Kit de comunicação da campanha (RF-K01). P1.

   Adesão é o calcanhar do setor, e a comunicação é metade do resultado. O kit
   entrega copy pronta no tom da marca — inclusive o roteiro do que a liderança
   NÃO deve fazer, que é onde a confiança costuma quebrar.

   Os marcadores {{data_fim}} são substituídos pela data real da campanha. */

const TIPO_META: Record<Nr1MaterialTipo, { icon: string; label: string }> = {
  email: { icon: 'ph:envelope-simple-bold', label: 'E-mail' },
  cartaz: { icon: 'ph:image-square-bold', label: 'Cartaz' },
  post: { icon: 'ph:chat-circle-text-bold', label: 'Post interno' },
  roteiro: { icon: 'ph:microphone-stage-bold', label: 'Roteiro' },
}

export function NR1RhKit() {
  const materiais = useService(() => nr1KitService.list(), [])
  const campanha = useService(() => nr1CampanhaService.ativa(), [])
  const [aberto, setAberto] = useState<Nr1KitMaterial | null>(null)
  const [copiado, setCopiado] = useState(false)

  const dataFim = campanha.status === 'success' && campanha.data ? fmtData(campanha.data.fim) : 'a data de encerramento'
  const preencher = (texto: string) => texto.replace(/\{\{data_fim\}\}/g, dataFim)

  const copiar = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(preencher(texto))
      setCopiado(true)
      window.setTimeout(() => setCopiado(false), 2000)
    } catch {
      /* Sem permissão de área de transferência: o texto continua selecionável. */
      setCopiado(false)
    }
  }

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />

        <Link to="/rh/nr1" className="mt-2 mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary transition-colors hover:text-ink lg:mt-0">
          <Icon icon="ph:arrow-left-bold" width={14} aria-hidden />
          Conformidade NR-1
        </Link>

        <PageHeader title="Kit de comunicação" subtitle="Materiais prontos para convidar o time a participar." />

        {(materiais.status === 'idle' || materiais.status === 'loading') && (
          <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}</div>
        )}
        {materiais.status === 'error' && <ErrorState message={materiais.message} onRetry={materiais.reload} />}

        {materiais.status === 'success' && (
          <div className="flex flex-col gap-2">
            {materiais.data.map((m) => {
              const meta = TIPO_META[m.tipo]
              return (
                <button
                  key={m.id}
                  onClick={() => setAberto(m)}
                  className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-hover"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
                    <Icon icon={meta.icon} width={20} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-heading text-sm font-semibold text-ink">{m.titulo}</span>
                      <span className="rounded-pill bg-surface-2 px-2 py-0.5 text-[10.5px] font-medium text-ink-secondary">{meta.label}</span>
                    </span>
                    <span className="mt-0.5 block text-[12.5px] leading-relaxed text-ink-secondary">{m.descricao}</span>
                  </span>
                  <Icon icon="ph:caret-right-bold" width={15} className="mt-1 shrink-0 text-ink-muted" aria-hidden />
                </button>
              )
            })}
          </div>
        )}

        <div className="mt-6 flex gap-3 rounded-lg border border-border bg-surface-2 p-4">
          <Icon icon="ph:hand-heart-bold" width={20} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
          <p className="text-[12px] leading-relaxed text-ink-secondary">
            Depois do resultado, volte a comunicar. Silêncio depois de uma pesquisa sobre
            sofrimento corrói mais a confiança do que não ter perguntado.
          </p>
        </div>
      </div>

      <Sheet open={aberto !== null} onClose={() => setAberto(null)} title={aberto?.titulo ?? ''} icon={aberto ? TIPO_META[aberto.tipo].icon : undefined} size="md">
        {aberto && (
          <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
            <p className="text-[13px] leading-relaxed text-ink-secondary">{aberto.descricao}</p>

            <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-surface-2 p-4 font-sans text-[13px] leading-relaxed text-ink">
              {preencher(aberto.conteudo)}
            </pre>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => setAberto(null)}>Fechar</Button>
              <Button iconLeft={copiado ? 'ph:check-bold' : 'ph:copy-bold'} onClick={() => copiar(aberto.conteudo)}>
                {copiado ? 'Copiado' : 'Copiar texto'}
              </Button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  )
}
