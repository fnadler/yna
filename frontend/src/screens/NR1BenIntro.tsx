import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { Skeleton } from '../components/Skeleton'
import { ErrorState } from '../components/ErrorState'
import { useService } from '../hooks/useService'
import { useApp } from '../contexts/AppContext'
import { nr1ColaboradorService } from '../services/nr1'

/* NR1-BEN-02 — Introdução e consentimento da avaliação (RF-A02, RNF-01/02).

   Tom Cuidador: o colaborador não precisa saber que isto é "NR-1", nem ver
   jargão de conformidade. O que ele precisa saber é que é anônimo, curto, e
   que serve para cuidar do ambiente de todo mundo.

   O aceite fica no AppContext e é pré-requisito para abrir o questionário. */

const GARANTIAS = [
  {
    icon: 'ph:eye-slash-bold',
    titulo: 'Ninguém vê a sua resposta',
    texto: 'Nem a sua liderança, nem o RH. O que sai daqui é o retrato do time todo, somado e sem nome.',
  },
  {
    icon: 'ph:clock-bold',
    titulo: 'Leva cerca de 8 minutos',
    texto: 'Você pode parar quando quiser e voltar depois. O que já respondeu fica guardado.',
  },
  {
    icon: 'ph:heart-bold',
    titulo: 'Não há resposta certa',
    texto: 'Responda pensando nas últimas semanas, do jeito que tem sido de verdade.',
  },
]

export function NR1BenIntro() {
  const navigate = useNavigate()
  const { nr1, nr1Iniciar, nr1Consentir } = useApp()
  const instrumento = useService(() => nr1ColaboradorService.instrumentoDaCampanha(), [])

  const campanhaId = instrumento.status === 'success' ? instrumento.data?.campanha.id : undefined

  useEffect(() => {
    if (campanhaId) nr1Iniciar(campanhaId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campanhaId])

  const comecar = () => {
    nr1Consentir()
    navigate('/avaliacao/1')
  }

  const respondidas = Object.keys(nr1?.respostas ?? {}).length
  const retomando = respondidas > 0

  return (
    <main className="flex flex-1 flex-col px-5 pb-10 pt-8 lg:pt-12">
      <div className="mx-auto w-full max-w-xl">
        {instrumento.status === 'loading' && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-14 w-14 rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        )}

        {instrumento.status === 'error' && <ErrorState message={instrumento.message} onRetry={instrumento.reload} />}

        {instrumento.status === 'success' && !instrumento.data && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-surface-2 text-ink-secondary">
              <Icon icon="ph:coffee-bold" width={26} aria-hidden />
            </span>
            <h1 className="text-[24px] font-extralight leading-tight tracking-[-0.02em] text-ink">
              Nada por aqui agora
            </h1>
            <p className="max-w-sm text-[14px] leading-relaxed text-ink-secondary">
              Não há nenhuma conversa aberta sobre o ambiente de trabalho no momento. Quando
              houver, a gente te avisa por aqui.
            </p>
            <Button variant="secondary" onClick={() => navigate('/despedida')}>Voltar para o início</Button>
          </div>
        )}

        {instrumento.status === 'success' && instrumento.data && (
          <div className="animate-yna-slide-up">
            <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
              <Icon icon="ph:shield-check-bold" width={26} aria-hidden />
            </span>

            <h1 className="mt-5 text-[28px] font-extralight leading-[1.15] tracking-[-0.02em] text-ink lg:text-[36px]">
              Este é um{' '}
              <span className="bg-yna-gradient-button bg-clip-text font-extrabold text-transparent">espaço seguro</span>
            </h1>

            <p className="mt-4 text-[15px] leading-relaxed text-ink-secondary">
              Queremos entender como tem sido o seu dia a dia de trabalho: o que pesa, o que
              ajuda, o que poderia ser diferente. O que você compartilhar aqui ajuda a cuidar do
              ambiente de todo mundo.
            </p>

            <ul className="mt-7 flex flex-col gap-3">
              {GARANTIAS.map((g) => (
                <li key={g.titulo} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
                    <Icon icon={g.icon} width={17} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="font-heading text-[14px] font-semibold text-ink">{g.titulo}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-ink-secondary">{g.texto}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Texto legal — placeholder no tom Cora, pendente de jurídico/LGPD */}
            <p className="mt-6 flex items-start gap-2 text-[12px] leading-relaxed text-ink-muted">
              <Icon icon="ph:lock-bold" width={13} className="mt-0.5 shrink-0" aria-hidden />
              Ao continuar, você concorda que as suas respostas sejam usadas de forma agregada e
              anônima para melhorar o ambiente de trabalho. Elas são tratadas como dado sensível
              de saúde e você pode pedir a exclusão a qualquer momento em Meu Perfil.
            </p>

            <div className="mt-7 flex flex-col gap-2">
              <Button size="lg" fullWidth iconRight="ph:arrow-right-bold" onClick={comecar}>
                {retomando ? 'Continuar de onde parei' : 'Começar'}
              </Button>
              <Button variant="ghost" fullWidth onClick={() => navigate('/despedida')}>
                Agora não
              </Button>
              {retomando && (
                <p className="text-center text-[12px] text-ink-secondary">
                  Você já respondeu {respondidas} {respondidas === 1 ? 'pergunta' : 'perguntas'}.
                </p>
              )}
            </div>

            {/* Acolhimento antes mesmo de começar */}
            <div className="mt-8 flex items-start gap-3 rounded-lg bg-surface-2 p-4">
              <Icon icon="ph:hand-heart-bold" width={19} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
              <p className="text-[12.5px] leading-relaxed text-ink-secondary">
                Se em algum momento você quiser falar com alguém, a gente está aqui.{' '}
                <button onClick={() => navigate('/canal-escuta')} className="font-semibold text-primary underline underline-offset-2 dark:text-primary-300">
                  Abrir um canal de escuta
                </button>
                .
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
