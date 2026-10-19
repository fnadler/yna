import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { useApp } from '../contexts/AppContext'
import { nr1ColaboradorService } from '../services/nr1'

/* NR1-BEN-04 — Conclusão da avaliação (RF-J04): tela de sucesso que encerra
   o ciclo da avaliação, no mesmo padrão das demais transições de onboarding
   (ver ColTransicaoAvaliacao/RH05ContaCriada — ping de celebração + card).

   A avaliação já foi enviada de forma anônima, antes de existir qualquer
   conta — isso é o que sustenta a diferença entre cuidado e vigilância: o
   RH não recebe nome, não recebe resposta, e não tem como pedir
   acompanhamento de ninguém.

   A tela faz três coisas, nesta ordem: confirma o envio, reforça a
   confidencialidade e convida a conhecer a YNA (conteúdos sobre saúde
   mental, ajuda imediata e quem é a YNA) em `/conhecer-yna`. Antes o
   convite era uma tela própria no meio do caminho (ColConviteConta, via
   "Continuar"); agora o próximo passo sai direto daqui, e "Agora não" leva
   à despedida. Nada da avaliação (campanha, protocolo) segue para a
   landing: ela é pública e não sabe quem respondeu. */

export function NR1BenConclusao() {
  const navigate = useNavigate()
  const { nr1, nr1Concluir } = useApp()
  const [enviando, setEnviando] = useState(true)
  const [protocolo, setProtocolo] = useState<string | null>(null)
  const [phase, setPhase] = useState<'celebrating' | 'leaving' | 'content'>('celebrating')

  useEffect(() => {
    let vivo = true
    const enviar = async () => {
      if (!nr1) { setEnviando(false); return }
      const r = await nr1ColaboradorService.enviar(nr1.campanhaId, nr1.respostas)
      if (!vivo) return
      setProtocolo(r.protocolo)
      nr1Concluir()
      setEnviando(false)
    }
    void enviar()
    return () => { vivo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* A animação de celebração (ping + ícone) roda por conta própria, sem
     esperar o envio terminar — troca de "celebrating" pra "leaving" num
     tempo fixo. Já o card de conteúdo (`content`) só aparece quando as
     DUAS coisas já aconteceram: a animação já passou do ponto de
     "leaving" E as respostas já foram enviadas (`enviando` false) — o que
     demorar mais entre as duas manda. Antes havia uma tela própria
     ("Guardando as suas respostas com cuidado…", fundo diferente do
     resto) só pro tempo de envio — removida: agora o envio corre por
     baixo da mesma animação de gradiente + ping, sem uma tela visualmente
     diferente no meio do caminho. */
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('leaving'), 1700)
    return () => clearTimeout(t1)
  }, [])

  useEffect(() => {
    if (phase !== 'leaving' || enviando) return
    const t2 = setTimeout(() => setPhase('content'), 500)
    return () => clearTimeout(t2)
  }, [phase, enviando])

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-x-hidden px-5 py-10 text-center bg-yna-gradient">
      {(phase === 'celebrating' || phase === 'leaving') && (
        <div className={`relative flex h-28 w-28 items-center justify-center transition-opacity duration-500 ${phase === 'leaving' ? 'opacity-0' : 'opacity-100'}`}>
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <div className="absolute inset-4 animate-ping rounded-full bg-primary/25" style={{ animationDelay: '0.3s' }} />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <Icon icon="ph:check-bold" width={32} className="text-primary" aria-hidden />
          </div>
        </div>
      )}

      {phase === 'content' && (
        <div className="flex w-full max-w-sm md:max-w-md flex-col items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 animate-yna-logo">
            <Icon icon="ph:check-bold" width={28} className="text-primary" aria-hidden />
          </div>

          <div className="w-full rounded-2xl bg-surface border border-border shadow p-7 md:p-10 flex flex-col items-center gap-6 animate-yna-slide-up">
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink">Avaliação concluída</p>
              <h1 className="text-[34px] font-heading font-extralight leading-[1.08] tracking-[-0.03em] text-ink">
                Obrigado por<br />
                <span className="font-extrabold text-primary">confiar.</span>
              </h1>
              <p className="text-[15px] leading-relaxed text-ink-secondary">
                Falar sobre como o trabalho tem te afetado não é pouca coisa. O que você contou já
                foi enviado, junto com o de todo mundo, sem nome, sem conta e sem vínculo com você.
              </p>
              {protocolo && (
                <p className="font-mono text-[11.5px] text-ink-muted">
                  Registro do ciclo: {protocolo} · a sua resposta não está vinculada a você
                </p>
              )}
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-surface-2 p-4 text-left">
              <Icon icon="ph:shield-check-bold" width={19} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
              <p className="text-[12.5px] leading-relaxed text-ink-secondary">
                Nada do que você respondeu é informado à sua empresa. Ninguém no RH sabe se você
                respondeu, o que respondeu, ou o que escolher fazer daqui pra frente.
              </p>
            </div>

            <div className="flex w-full flex-col gap-4 border-t border-border pt-6 text-left animate-yna-slide-up animate-yna-delay-250">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
                  <Icon icon="ph:heart-bold" width={20} aria-hidden />
                </span>
                <div>
                  <h2 className="text-[17px] font-semibold leading-snug text-ink">E agora, cuide de você também</h2>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-ink-secondary">
                    A YNA separou vídeos e artigos curtos sobre saúde mental no trabalho, o contato do CVV e do
                    SAMU para quando precisar, e um pouco sobre quem ela é. Sem criar conta.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="gradient" size="lg" fullWidth iconRight="ph:arrow-right-bold" onClick={() => navigate('/conhecer-yna')}>
                  Conhecer a YNA
                </Button>
                <Button variant="ghost" fullWidth onClick={() => navigate('/despedida')}>
                  Agora não
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
