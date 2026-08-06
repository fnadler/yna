import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { useApp, type Nr1AvaliacaoEmAndamento } from '../contexts/AppContext'
import { nr1ColaboradorService } from '../services/nr1'

/* NR1-BEN-04 — Conclusão, acolhimento e ponte para a conta (RF-J01, RF-J04).

   A avaliação em si já foi enviada de forma anônima, antes de existir
   qualquer conta — isso é o que sustenta a diferença entre cuidado e
   vigilância: o RH não recebe nome, não recebe resposta, e não tem como
   pedir acompanhamento de ninguém.

   As duas perguntas de interesse (abaixo) são deliberadamente FORA do
   instrumento NR-1: nunca entram no inventário nem no relatório do RH, só
   alimentam um agregado comercial que o backoffice YNA usa para estimar
   adesão futura a um serviço de cuidado que ainda não existe no produto —
   por isso a tela pode, só aqui, avisar que teleatendimento "chega em
   breve". Em nenhum outro lugar do produto essa promessa se repete. */

type Interesse = Nr1AvaliacaoEmAndamento['interesseCuidado']
type Tratamento = Nr1AvaliacaoEmAndamento['emTratamento']

export function NR1BenConclusao() {
  const navigate = useNavigate()
  const { nr1, nr1Concluir, nr1RegistrarInteresse, nr1Limpar } = useApp()
  const [enviando, setEnviando] = useState(true)
  const [protocolo, setProtocolo] = useState<string | null>(null)
  const [interesse, setInteresse] = useState<Interesse>()
  const [tratamento, setTratamento] = useState<Tratamento>()
  const [interesseEnviado, setInteresseEnviado] = useState(false)

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

  const sair = () => { nr1Limpar(); navigate('/despedida') }

  const confirmarInteresse = () => {
    nr1RegistrarInteresse(interesse, tratamento)
    setInteresseEnviado(true)
  }

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
          Falar sobre como o trabalho tem te afetado não é pouca coisa. O que você contou já foi
          enviado, junto com o de todo mundo, sem nome, sem conta e sem vínculo com você.
        </p>

        {protocolo && (
          <p className="mt-3 font-mono text-[11.5px] text-ink-muted">
            Registro do ciclo: {protocolo} · a sua resposta não está vinculada a você
          </p>
        )}

        <div className="mt-8 flex items-start gap-3 rounded-lg bg-surface-2 p-4">
          <Icon icon="ph:shield-check-bold" width={19} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
          <p className="text-[12.5px] leading-relaxed text-ink-secondary">
            Nada do que você respondeu é informado à sua empresa. Ninguém no RH sabe se você
            respondeu, o que respondeu, ou o que escolher fazer daqui pra frente.
          </p>
        </div>

        {/* Conteúdo de apoio e canal de escuta — sempre disponíveis, sem conta */}
        <section className="mt-8">
          <h2 className="font-heading text-[16px] font-semibold text-ink">E você, como está?</h2>
          <p className="mt-1 text-[13.5px] leading-relaxed text-ink-secondary">
            Se alguma dessas perguntas mexeu com você, isto aqui é só seu.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={() => navigate('/apoio')}
              className="flex items-start gap-4 rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-hover"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
                <Icon icon="ph:hand-heart-bold" width={19} aria-hidden />
              </span>
              <span>
                <span className="block font-heading text-[14.5px] font-semibold text-ink">Conteúdo de apoio</span>
                <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-secondary">
                  Materiais curtos sobre sono, sobrecarga, limites e pedir ajuda.
                </span>
              </span>
            </button>
            <button
              onClick={() => navigate('/canal-escuta')}
              className="flex items-start gap-4 rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-hover"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
                <Icon icon="ph:megaphone-simple-bold" width={19} aria-hidden />
              </span>
              <span>
                <span className="block font-heading text-[14.5px] font-semibold text-ink">Canal de escuta</span>
                <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-secondary">
                  Para situações concretas que precisam de apuração, sempre anônimo.
                </span>
              </span>
            </button>
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-ink-muted">
            Precisa de alguém agora? O CVV (Centro de Valorização da Vida) atende 24h: ligue{' '}
            <strong>188</strong> ou acesse cvv.org.br. Sua empresa também pode ter outros canais de
            apoio disponíveis, {' '}
            <button onClick={() => navigate('/apoio')} className="underline underline-offset-2">
              veja em Apoio
            </button>
            .
          </p>
        </section>

        {/* Ponte para a conta — só depois da avaliação, e sempre opcional */}
        <section className="mt-8 rounded-lg border border-primary/30 bg-primary-50/60 p-5 dark:bg-primary-50">
          <h2 className="font-heading text-[16px] font-semibold text-ink">Quer acompanhar sua evolução?</h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-secondary">
            Criando uma conta leve, sem senha complexa, você pode voltar aqui para ver como suas
            respostas mudam ao longo do tempo. E em breve, para quem tiver conta, a YNA também vai
            oferecer teleatendimento com profissionais selecionados.
          </p>

          {!interesseEnviado ? (
            <div className="mt-4 flex flex-col gap-4">
              <div>
                <p className="text-[13px] font-medium text-ink">
                  Teria interesse em um serviço de cuidado de saúde mental com profissionais
                  selecionados, de forma anônima para a sua empresa? <span className="font-normal text-ink-secondary">(opcional)</span>
                </p>
                <div className="mt-2 flex gap-2">
                  {(['sim', 'talvez', 'nao'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setInteresse(v)}
                      className={`flex-1 rounded-lg border-[1.5px] px-3 py-2 font-heading text-[13px] font-medium capitalize transition-colors ${
                        interesse === v ? 'border-primary bg-primary-50 text-ink' : 'border-border bg-surface text-ink-secondary hover:bg-surface-hover'
                      }`}
                    >
                      {v === 'nao' ? 'Não' : v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[13px] font-medium text-ink">
                  Você já faz algum tipo de tratamento de saúde mental? <span className="font-normal text-ink-secondary">(opcional)</span>
                </p>
                <div className="mt-2 flex gap-2">
                  {([
                    { v: 'sim' as const, label: 'Sim' },
                    { v: 'nao' as const, label: 'Não' },
                    { v: 'prefiro-nao-informar' as const, label: 'Prefiro não informar' },
                  ]).map(({ v, label }) => (
                    <button
                      key={v}
                      onClick={() => setTratamento(v)}
                      className={`flex-1 rounded-lg border-[1.5px] px-3 py-2 font-heading text-[12.5px] font-medium transition-colors ${
                        tratamento === v ? 'border-primary bg-primary-50 text-ink' : 'border-border bg-surface text-ink-secondary hover:bg-surface-hover'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11.5px] leading-relaxed text-ink-muted">
                Essas duas respostas não fazem parte da avaliação NR-1: não entram no inventário
                nem no relatório da sua empresa. Servem só para a YNA entender, de forma agregada,
                se vale a pena trazer esse serviço para cá.
              </p>

              <div className="flex flex-col gap-2">
                <Button size="lg" fullWidth iconRight="ph:arrow-right-bold" onClick={confirmarInteresse}>
                  Criar minha conta
                </Button>
                <Button variant="ghost" fullWidth onClick={sair}>
                  Agora não
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <Button size="lg" fullWidth iconRight="ph:arrow-right-bold" onClick={() => navigate('/criar-conta')}>
                Continuar para criar conta
              </Button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
