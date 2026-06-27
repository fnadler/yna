import { useState } from 'react'
import { Icon } from '@iconify/react'
import { RhTopBar } from '../../components/RhTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { rhConviteService, rhBeneficiarioService } from '../../services/rh'
import { useRh } from '../../contexts/RhContext'

/* RH-12 — Envio de convites (Seção 5.5). Funil agregado (sem identificação),
   disparo/agendamento em lote e a cadência de reforço automatizado. */

const ETAPAS = [
  { key: 'enviado', label: 'Enviados', icon: 'ph:paper-plane-tilt-bold' },
  { key: 'aberto', label: 'Abertos', icon: 'ph:envelope-open-bold' },
  { key: 'cadastroIniciado', label: 'Cadastro iniciado', icon: 'ph:user-plus-bold' },
  { key: 'cadastroConcluido', label: 'Cadastro concluído', icon: 'ph:user-check-bold' },
] as const

export function RH12Convites() {
  const { empresa } = useRh()
  const funil = useService(() => rhConviteService.funil(), [])
  const beneficiarios = useService(() => rhBeneficiarioService.list(), [])
  const [enviando, setEnviando] = useState(false)
  const [enviadoMsg, setEnviadoMsg] = useState('')

  const naoConvidados = beneficiarios.status === 'success'
    ? beneficiarios.data.filter((b) => b.status === 'nao_convidado')
    : []

  const dispararTodos = async () => {
    setEnviando(true)
    const r = await rhConviteService.disparar(naoConvidados.map((b) => b.id))
    setEnviando(false)
    setEnviadoMsg(`${r.enviados} convite(s) enviados. O reforço automático segue em D+3, D+7 e D+14.`)
    beneficiarios.reload()
  }

  const base = funil.status === 'success' ? funil.data.enviado : 1

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <RhTopBar />
        <PageHeader
          title="Convites"
          subtitle="Acompanhe a adesão à campanha — sempre por dados agregados."
          className="mt-2 lg:mt-0"
        />

        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:items-start">
          {/* Funil */}
          <section>
            <h2 className="mb-3 text-[15px] font-semibold text-ink">Funil de convites</h2>
            {funil.status === 'loading' && <Skeleton className="h-64 w-full rounded-lg" />}
            {funil.status === 'error' && <ErrorState message={funil.message} onRetry={funil.reload} />}
            {funil.status === 'success' && (
              <div className="flex flex-col rounded-lg border border-border bg-surface p-5">
                {/* Conversão total enviados → concluídos */}
                <div className="mb-4 flex items-baseline justify-between">
                  <span className="text-[13px] text-ink-secondary">Conversão total</span>
                  <span className="font-mono text-[15px] font-bold text-ink">
                    {Math.round((funil.data.cadastroConcluido / base) * 100)}%
                  </span>
                </div>

                {/* Funil — barras centralizadas que afunilam por etapa */}
                <div className="flex flex-col items-center">
                  {ETAPAS.map((e, i) => {
                    const valor = funil.data[e.key]
                    const pctTotal = Math.round((valor / base) * 100)
                    const prevValor = i === 0 ? valor : funil.data[ETAPAS[i - 1].key]
                    const conv = i === 0 ? 100 : Math.round((valor / prevValor) * 100)
                    const width = Math.max(42, pctTotal) // piso para o rótulo caber
                    return (
                      <div key={e.key} className="w-full">
                        {/* Conversão entre a etapa anterior e esta */}
                        {i > 0 && (
                          <div className="flex items-center justify-center py-1.5">
                            <span className="inline-flex items-center gap-1 rounded-pill bg-surface-2 px-2.5 py-0.5 font-mono text-[11px] font-medium text-ink-secondary">
                              <Icon icon="ph:arrow-down-bold" width={11} aria-hidden />
                              {conv}% avançaram
                            </span>
                          </div>
                        )}
                        <div
                          className="mx-auto flex h-[56px] items-center justify-between gap-3 rounded-lg bg-yna-gradient-button px-4 text-white shadow-sm transition-all duration-500"
                          style={{ width: `${width}%` }}
                        >
                          <span className="flex min-w-0 items-center gap-2 text-[13px] font-semibold">
                            <Icon icon={e.icon} width={16} className="shrink-0" aria-hidden />
                            <span className="truncate">{e.label}</span>
                          </span>
                          <span className="shrink-0 whitespace-nowrap text-right">
                            <span className="font-mono text-[18px] font-bold leading-none">{valor}</span>
                            <span className="ml-1.5 text-[11px] opacity-80">{pctTotal}%</span>
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <p className="mt-4 flex items-center gap-1.5 text-[12px] text-ink-muted">
                  <Icon icon="ph:lock-simple-bold" width={13} aria-hidden />
                  Você vê apenas o total agregado — nunca quem abriu ou concluiu.
                </p>
              </div>
            )}
          </section>

          {/* Disparo */}
          <div className="mt-6 flex flex-col gap-5 lg:mt-0">
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-ink">Enviar convites</h2>
              <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5">
                {beneficiarios.status === 'loading' && <Skeleton className="h-20 w-full rounded-lg" />}
                {beneficiarios.status === 'success' && (
                  <>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-ink">{naoConvidados.length}</p>
                      <p className="text-[13px] text-ink-secondary">aguardando convite</p>
                    </div>
                    {enviadoMsg ? (
                      <div className="flex items-start gap-2 rounded-lg bg-success-bg p-3 text-[13px] text-success-ink">
                        <Icon icon="ph:check-circle-bold" width={16} className="mt-0.5 shrink-0" aria-hidden />
                        <span>{enviadoMsg}</span>
                      </div>
                    ) : (
                      <Button fullWidth disabled={naoConvidados.length === 0 || enviando} iconRight={enviando ? undefined : 'ph:paper-plane-tilt-bold'} onClick={dispararTodos}>
                        {enviando ? 'Enviando…' : 'Disparar em lote'}
                      </Button>
                    )}
                    <p className="text-[12px] leading-relaxed text-ink-muted">
                      Agende para coincidir com a sua campanha interna. Os links são únicos e
                      assinados, válidos por 30 dias.
                    </p>
                  </>
                )}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-ink">Reforço automático</h2>
              <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
                {[
                  { d: 'D+3', t: 'Primeiro lembrete por push e e-mail' },
                  { d: 'D+7', t: 'Segundo lembrete, voz acolhedora' },
                  { d: 'D+14', t: 'Último reforço antes de expirar' },
                ].map((r) => (
                  <div key={r.d} className="flex items-center gap-3">
                    <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded-pill bg-primary-50 font-mono text-[12px] font-semibold text-primary dark:text-primary-300">{r.d}</span>
                    <p className="text-[13px] text-ink-secondary">{r.t}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex gap-3 rounded-lg border border-border bg-surface-2 p-4">
              <Icon icon="ph:megaphone-bold" width={20} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
              <p className="text-[12px] leading-relaxed text-ink-secondary">
                Dispare os convites <span className="font-semibold text-ink">após</span> a distribuição do kit de
                comunicação interna da {empresa.nomeFantasia}, para que o time já espere a mensagem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
