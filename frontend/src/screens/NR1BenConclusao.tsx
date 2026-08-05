import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { OptionCard } from '../components/OptionCard'
import { useApp } from '../contexts/AppContext'
import { nr1BeneficiarioService } from '../services/nr1'

/* NR1-BEN-04 — Conclusão, acolhimento e ponte opt-in (RF-J01, RF-J04).

   A regra que sustenta a diferença entre cuidado e vigilância: o acesso à
   camada de cuidado é SEMPRE ativado pelo próprio colaborador. Nada aqui
   dispara encaminhamento — o RH não recebe nome, não recebe resposta, e não
   tem como pedir acompanhamento de ninguém.

   E ninguém sai daqui no vácuo: responder sobre sofrimento e não receber nada
   de volta corrói a confiança. */

export function NR1BenConclusao() {
  const navigate = useNavigate()
  const { nr1, nr1Concluir, nr1Limpar } = useApp()
  const [enviando, setEnviando] = useState(true)
  const [protocolo, setProtocolo] = useState<string | null>(null)

  useEffect(() => {
    let vivo = true
    const enviar = async () => {
      if (!nr1) { setEnviando(false); return }
      const r = await nr1BeneficiarioService.enviar(nr1.campanhaId, nr1.respostas)
      if (!vivo) return
      setProtocolo(r.protocolo)
      nr1Concluir()
      setEnviando(false)
    }
    void enviar()
    return () => { vivo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sair = () => { nr1Limpar(); navigate('/home') }

  if (enviando) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-5 px-5 py-16 text-center">
        <span className="flex h-14 w-14 animate-pulse items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
          <Icon icon="ph:heart-bold" width={26} aria-hidden />
        </span>
        <p className="text-[15px] text-ink-secondary">Guardando as suas respostas com cuidado…</p>
      </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col px-5 pb-12 pt-10 lg:pt-14">
      <div className="mx-auto w-full max-w-xl animate-yna-slide-up">
        <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-success-bg text-success-ink">
          <Icon icon="ph:check-circle-bold" width={26} aria-hidden />
        </span>

        <h1 className="mt-5 text-[28px] font-extralight leading-[1.15] tracking-[-0.02em] text-ink lg:text-[36px]">
          Obrigado por{' '}
          <span className="bg-yna-gradient-button bg-clip-text font-extrabold text-transparent">confiar</span>
        </h1>

        <p className="mt-4 text-[15px] leading-relaxed text-ink-secondary">
          Falar sobre como o trabalho tem te afetado não é pouca coisa. O que você contou entra
          junto com o de todo mundo, sem nome, e ajuda a mostrar o que precisa mudar por
          aqui.
        </p>

        {protocolo && (
          <p className="mt-3 font-mono text-[11.5px] text-ink-muted">
            Registro do ciclo: {protocolo} · a sua resposta não está vinculada a você
          </p>
        )}

        {/* A ponte — sempre por escolha do colaborador */}
        <section className="mt-8">
          <h2 className="font-heading text-[16px] font-semibold text-ink">E você, como está?</h2>
          <p className="mt-1 text-[13.5px] leading-relaxed text-ink-secondary">
            Se alguma dessas perguntas mexeu com você, isto aqui é só seu, e só acontece se
            você quiser.
          </p>

          <div className="mt-4 flex flex-col gap-2">
            <OptionCard
              icon="ph:chats-circle-bold"
              label="Conversar com um profissional"
              desc="Agende uma sessão com alguém da rede YNA, no seu tempo"
              to="/matches"
            />
            <OptionCard
              icon="ph:flower-tulip-bold"
              label="Falar com a Nyna agora"
              desc="Um primeiro passo leve, quando você não sabe por onde começar"
              to="/nina"
            />
            <OptionCard
              icon="ph:megaphone-simple-bold"
              label="Registrar algo no canal de escuta"
              desc="Para situações que precisam de apuração, sempre anônimo"
              to="/canal-escuta"
            />
          </div>
        </section>

        <div className="mt-8 flex items-start gap-3 rounded-lg bg-surface-2 p-4">
          <Icon icon="ph:shield-check-bold" width={19} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
          <p className="text-[12.5px] leading-relaxed text-ink-secondary">
            Nada do que você escolher aqui é informado à sua empresa. Ninguém no RH sabe se você
            respondeu, o que respondeu, ou se procurou ajuda depois.
          </p>
        </div>

        <div className="mt-7 flex flex-col gap-2">
          <Button size="lg" fullWidth variant="secondary" onClick={sair}>
            Voltar para o início
          </Button>
          <Button variant="ghost" fullWidth onClick={() => { nr1Limpar(); navigate('/minha-evolucao') }}>
            Ver a minha evolução
          </Button>
        </div>
      </div>
    </main>
  )
}
