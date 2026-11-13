import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'

/* PRO-CAD-02 — Confirmação do cadastro (mesmo modelo do "Conta criada").
   Transição comemorativa → card central com o andamento do processo. O botão
   simula o avanço das etapas (aprovação da YNA → ativação da conta). */
type EtapaStatus = 'concluido' | 'atual' | 'aguardando' | 'nao-iniciado'

export function ProCad02Processo() {
  const [phase, setPhase] = useState<'celebrating' | 'leaving' | 'content'>('celebrating')
  const [aprovado, setAprovado] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('leaving'), 1700)
    const t2 = setTimeout(() => setPhase('content'), 2200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const etapas: { titulo: string; desc: string; status: EtapaStatus }[] = [
    { titulo: 'Cadastro', desc: 'Seus dados foram enviados.', status: 'concluido' },
    { titulo: 'Análise da YNA', desc: aprovado ? 'Cadastro aprovado pela equipe.' : 'Nossa equipe está revisando seu cadastro.', status: aprovado ? 'concluido' : 'aguardando' },
    { titulo: 'Ativação da conta', desc: 'Revise o perfil, confirme a disponibilidade e grave seu vídeo.', status: aprovado ? 'atual' : 'nao-iniciado' },
    { titulo: 'Habilitado', desc: 'Seu perfil entra para os matches dos beneficiários.', status: 'nao-iniciado' },
  ]

  const ICON: Record<EtapaStatus, { icon: string; cls: string }> = {
    concluido: { icon: 'ph:check-bold', cls: 'bg-success text-white' },
    atual: { icon: 'ph:dot-outline-fill', cls: 'bg-primary text-white' },
    aguardando: { icon: 'ph:hourglass-medium-bold', cls: 'bg-warning-bg text-warning-ink' },
    'nao-iniciado': { icon: 'ph:circle-bold', cls: 'bg-surface-2 text-ink-muted' },
  }
  const LABEL: Record<EtapaStatus, string> = { concluido: 'Concluído', atual: 'Em andamento', aguardando: 'Aguardando', 'nao-iniciado': 'Não iniciado' }

  return (
    <div className="relative flex h-dvh flex-col items-center justify-center overflow-hidden px-7 text-center bg-yna-gradient">
      {(phase === 'celebrating' || phase === 'leaving') && (
        <div className={`relative flex h-28 w-28 items-center justify-center transition-opacity duration-500 ${phase === 'leaving' ? 'opacity-0' : 'opacity-100'}`}>
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <div className="absolute inset-4 animate-ping rounded-full bg-primary/25" style={{ animationDelay: '0.3s' }} />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <Icon icon="ph:paper-plane-tilt-bold" width={30} className="text-primary" aria-hidden />
          </div>
        </div>
      )}

      {phase === 'content' && (
        <div className="flex w-full max-w-xs md:max-w-md flex-col items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 animate-yna-logo">
            <Icon icon="ph:paper-plane-tilt-bold" width={28} className="text-primary" aria-hidden />
          </div>

          <div className="w-full rounded-2xl bg-surface border border-border shadow p-7 md:p-9 flex flex-col items-center gap-6 animate-yna-slide-up">
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink">{aprovado ? 'Cadastro aprovado' : 'Cadastro enviado'}</p>
              <h1 className="text-[34px] font-heading font-extralight leading-[1.08] tracking-[-0.03em] text-ink">
                {aprovado ? (
                  <>Tudo certo por<br /><span className="font-extrabold text-primary">aqui.</span></>
                ) : (
                  <>Recebemos o seu<br /><span className="font-extrabold text-primary">cadastro.</span></>
                )}
              </h1>
              <p className="text-[15px] leading-relaxed text-ink-secondary">
                {aprovado
                  ? 'Seu cadastro foi aprovado. Ative a sua conta para revisar o perfil, confirmar a disponibilidade e gravar seu vídeo de apresentação.'
                  : 'Nossa equipe vai revisar as suas informações. Assim que o cadastro for aprovado, você poderá ativar a sua conta e começar a atender.'}
              </p>
            </div>

            {/* Andamento do processo */}
            <ol className="w-full text-left">
              {etapas.map((e, i) => {
                const ic = ICON[e.status]
                return (
                  <li key={e.titulo} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ic.cls}`}><Icon icon={ic.icon} width={16} aria-hidden /></span>
                      {i < etapas.length - 1 && <span className={`w-px flex-1 ${e.status === 'concluido' ? 'bg-success/40' : 'bg-border'}`} />}
                    </div>
                    <div className="pb-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-heading text-[14px] font-semibold text-ink">{e.titulo}</p>
                        <span className={`rounded-pill px-2 py-0.5 text-[10.5px] font-medium ${e.status === 'concluido' ? 'bg-success-bg text-success-ink' : e.status === 'aguardando' ? 'bg-warning-bg text-warning-ink' : e.status === 'atual' ? 'bg-primary-50 text-primary dark:text-primary-300' : 'bg-surface-2 text-ink-muted'}`}>{LABEL[e.status]}</span>
                      </div>
                      <p className="mt-0.5 text-[12.5px] text-ink-secondary">{e.desc}</p>
                    </div>
                  </li>
                )
              })}
            </ol>

            <div className="w-full animate-yna-slide-up animate-yna-delay-250">
              {!aprovado ? (
                <Button variant="secondary" size="lg" fullWidth iconLeft="ph:fast-forward-bold" onClick={() => setAprovado(true)}>Simular aprovação da YNA</Button>
              ) : (
                <Button variant="gradient" size="lg" fullWidth iconRight="ph:arrow-right-bold" onClick={() => navigate('/pro/ativacao')}>Ativar minha conta</Button>
              )}
              <p className="mt-2 text-center text-[11px] text-ink-muted">Botão de simulação — apenas para percorrer o fluxo.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
