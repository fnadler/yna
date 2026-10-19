import { useCallback, useEffect, useRef, useState, type FormEvent, type MouseEvent, type ReactNode, type RefObject } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { Input } from '../components/Input'
import { LogoYna } from '../components/YnaLogo'
import { Pedra } from '../components/Pedra'
import { Skeleton } from '../components/Skeleton'
import { ErrorState } from '../components/ErrorState'
import { VideoImersivo, capaVideo } from '../components/VideoImersivo'
import { ArtigoModal } from '../components/ArtigoModal'
import { useService } from '../hooks/useService'
import { nr1ColaboradorService } from '../services/nr1'
import { conteudoService, type ConteudoLandingAba } from '../services/conteudo'
import { interesseService, type InteressePerfil, type InteresseServico } from '../services/interesse'
import type { ArtigoApoio, PublicoConteudo, VideoApoio } from '../data/conteudoApoioMock'

/* "Conhecer a YNA" — landing pós-avaliação NR-1 (`/conhecer-yna`). Destino
   do convite da tela de sucesso da avaliação (NR1BenConclusao) e do botão
   "Conhecer a YNA" de ColConviteConta. Referência visual e de copy
   aprovada: `landing-nr1/index.html` — layout, textos e ordem das seções
   saem de lá.

   Pública: sem conta, sem login e sem ler o `AppContext.nr1`. A página não
   sabe quem é a pessoa, e é isso que ela promete ("nada do que você fizer
   aqui é ligado ao que você respondeu na avaliação"). Por isso o formulário
   de interesse manda só os próprios campos + o nome da empresa (ver a regra
   em `services/interesse.ts`).

   White-label: só o nome da empresa varia. Ordem: `?empresa=` (links de
   e-mail/QR code) → `nr1ColaboradorService.empresaDaCampanha()` → "sua
   empresa". A copy nunca usa artigo antes do nome ("oferecido por X", "X
   trouxe a YNA"), para funcionar com qualquer gênero.

   Recorte do produto: teleatendimento e acompanhamento só são ANUNCIADOS
   ("Em breve") e coletam interesse — não há agendamento, perfil de
   profissional nem nenhuma outra rota a partir daqui. */

const EMPRESA_PADRAO = 'sua empresa'

/** Valor do `?empresa=`: espaços colapsados, sem bordas, no máximo 60
   caracteres. Sempre renderizado como texto (React), nunca como HTML. */
function sanitizarEmpresa(valor: string | null): string | null {
  if (!valor) return null
  const limpo = valor.replace(/\s+/g, ' ').trim().slice(0, 60).trim()
  return limpo || null
}

const inicialMaiuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const reduzMovimento = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function irPara(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: reduzMovimento() ? 'auto' : 'smooth', block: 'start' })
}

/** Links âncora: mantêm o `href` (semântica, abrir em nova aba), mas rolam
   suave e respeitam `prefers-reduced-motion`. */
const ancora = (id: string) => (e: MouseEvent) => {
  e.preventDefault()
  irPara(id)
}

/** Revelação das seções ao rolar: adiciona `.is-in` aos `.yna-reveal` de
   dentro de `ref`. Os elementos revelados têm `className` estático, para o
   React não apagar a classe num re-render. */
function useRevelar(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const els = Array.from(root.querySelectorAll<HTMLElement>('.yna-reveal'))
    if (reduzMovimento() || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [ref])
}

/* Classes repetidas entre seções */
const WRAP = 'mx-auto w-full max-w-[1180px] px-5 md:px-8'
const SECAO = 'scroll-mt-[76px] py-[88px] min-[900px]:py-[120px]'
const EYEBROW = 'font-mono text-[11px] font-medium uppercase tracking-[0.14em]'
const H_SECAO = 'mt-3.5 font-heading text-[clamp(30px,4.4vw,48px)] font-extralight leading-[1.08] tracking-[-0.03em]'
const DESTAQUE = 'font-extrabold text-primary dark:text-primary-300'
const DESTAQUE_B = 'font-bold text-primary dark:text-primary-300'
const LEAD = 'text-[17px] leading-[1.65] text-ink-secondary'
const FUNDO_SOFT = 'bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]'

const SECOES = [
  { id: 'sobre', label: 'A YNA', rodape: 'Quem é a YNA' },
  { id: 'servicos', label: 'Em breve', rodape: 'Serviços em breve' },
  { id: 'conteudos', label: 'Conteúdos', rodape: 'Conteúdos de apoio' },
  { id: 'interesse', label: 'Tenho interesse', rodape: 'Lista de interesse' },
]

export function ColConhecerYna() {
  const [params] = useSearchParams()
  const empresaUrl = sanitizarEmpresa(params.get('empresa'))
  const empresaCampanha = useService(
    () => (empresaUrl ? Promise.resolve(null) : nr1ColaboradorService.empresaDaCampanha()),
    [empresaUrl],
  )
  /* `null` = ainda não se sabe o nome (o formulário não manda "sua empresa"
     como se fosse um nome). */
  const empresaConhecida = empresaUrl ?? (empresaCampanha.status === 'success' ? empresaCampanha.data : null)
  const empresa = empresaConhecida ?? EMPRESA_PADRAO

  useEffect(() => {
    const anterior = document.title
    document.title = `YNA · Cuidado oferecido por ${empresa}`
    return () => {
      document.title = anterior
    }
  }, [empresa])

  const rootRef = useRef<HTMLDivElement>(null)
  useRevelar(rootRef)

  return (
    <div ref={rootRef} className="yna-landing min-h-dvh overflow-x-clip bg-page text-ink">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-surface focus:px-4 focus:py-2 focus:shadow"
      >
        Pular para o conteúdo
      </a>

      <Topo empresa={empresa} />

      <main id="conteudo">
        <Hero empresa={empresa} />
        <AjudaImediata />
        <QuemEaYna />
        <EmBreve />
        <Conteudos />
        <Interesse empresa={empresaConhecida} />
      </main>

      <Rodape empresa={empresa} />
    </div>
  )
}

/* ---------- Topo ---------- */

function Topo({ empresa }: { empresa: string }) {
  const [rolou, setRolou] = useState(false)

  useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-[14px] backdrop-saturate-[1.4] transition-colors duration-300 ${
        rolou
          ? 'border-border bg-[color:color-mix(in_srgb,var(--page-bg)_92%,transparent)]'
          : 'border-transparent bg-[color:color-mix(in_srgb,var(--page-bg)_78%,transparent)]'
      }`}
    >
      <div className={`${WRAP} flex h-[68px] items-center justify-between gap-3`}>
        <a href="#topo" onClick={ancora('topo')} className="flex min-w-0 items-center gap-2.5 min-[421px]:gap-3.5" aria-label="YNA, início">
          <LogoYna className="h-6 w-[68px] shrink-0 text-primary dark:text-lavender" aria-hidden />
          <span className="hidden h-[26px] w-px shrink-0 bg-border-strong min-[421px]:block" aria-hidden />
          <span className="flex min-w-0 flex-col leading-[1.15]">
            <small className="whitespace-nowrap font-mono text-[8.5px] uppercase tracking-[0.1em] text-ink-muted min-[421px]:text-[9.5px] min-[421px]:tracking-[0.14em]">
              Cuidado oferecido por
            </small>
            <strong className="max-w-[34vw] truncate font-heading text-[14.5px] font-semibold text-ink">
              {inicialMaiuscula(empresa)}
            </strong>
          </span>
        </a>

        <nav className="hidden gap-1 min-[1140px]:flex" aria-label="Seções">
          {SECOES.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={ancora(s.id)}
              className="whitespace-nowrap rounded-pill px-3.5 py-2 font-heading text-[14.5px] font-medium text-ink-secondary transition-colors hover:bg-primary-50 hover:text-primary dark:hover:text-primary-300"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <a
          href="#ajuda"
          onClick={ancora('ajuda')}
          className="inline-flex min-h-[40px] shrink-0 items-center gap-2 whitespace-nowrap rounded-pill border-[1.5px] border-danger/25 bg-danger-bg px-4 font-heading text-sm font-semibold text-danger-ink transition-transform duration-300 ease-organic hover:-translate-y-0.5"
        >
          <Icon icon="ph:lifebuoy-bold" width={16} aria-hidden />
          <span className="hidden min-[560px]:inline">Precisa de ajuda agora?</span>
          <span className="min-[560px]:hidden">Ajuda agora</span>
        </a>
      </div>
    </header>
  )
}

/* ---------- Hero ---------- */

function Hero({ empresa }: { empresa: string }) {
  return (
    <section id="topo" className={`relative scroll-mt-[76px] overflow-hidden pb-[72px] pt-10 min-[900px]:pb-[112px] min-[900px]:pt-[72px] ${FUNDO_SOFT}`}>
      <span aria-hidden className="pointer-events-none absolute -left-[180px] -top-[160px] h-[520px] w-[520px] rounded-full bg-lavender opacity-55 blur-[70px] dark:opacity-10" />
      <span aria-hidden className="pointer-events-none absolute -bottom-[160px] -right-[120px] h-[420px] w-[420px] rounded-full bg-yellow-soft opacity-55 blur-[70px] dark:opacity-10" />

      <div className={`${WRAP} relative grid items-center gap-10 min-[900px]:grid-cols-[1.05fr_.95fr] min-[900px]:gap-14`}>
        <div>
          {/* No mobile a foto abre a tela (vem antes do título) e o eyebrow
              sai: o título fica logo abaixo da imagem, sem uma linha de
              contexto disputando atenção. */}
          <p className={`${EYEBROW} hidden animate-yna-slide-up text-ink-secondary min-[900px]:block`}>
            Avaliação de saúde no trabalho · {empresa}
          </p>
          <h1 className="animate-yna-slide-up min-[900px]:mt-[18px] font-heading text-[clamp(46px,7.6vw,92px)] font-extralight leading-[1.04] tracking-[-0.03em] text-ink animate-yna-delay-100">
            {/* Destaque em "nunca", não em "está só": a promessa da marca é
                justamente a negação. A quebra fica igual à do protótipo. */}
            Você <b className={DESTAQUE}>nunca</b>
            <span className="block">está só.</span>
          </h1>
          <p className={`${LEAD} mt-[22px] max-w-[540px] animate-yna-slide-up animate-yna-delay-250`}>
            Obrigado por responder. <strong className="font-semibold text-ink">{inicialMaiuscula(empresa)}</strong> trouxe
            a YNA para cuidar da saúde emocional de quem faz o trabalho acontecer. Aqui você conhece a YNA, encontra
            conteúdos para o dia a dia e sabe onde buscar ajuda, se precisar agora.
          </p>
          <div className="mt-8 flex animate-yna-slide-up flex-wrap gap-3 animate-yna-delay-400">
            <Button variant="gradient" size="lg" iconRight="ph:arrow-down-bold" onClick={() => irPara('conteudos')}>
              Explorar conteúdos
            </Button>
            <Button variant="secondary" size="lg" onClick={() => irPara('servicos')}>
              Conhecer a YNA
            </Button>
          </div>
          <div className="mt-7 flex max-w-[520px] animate-yna-slide-up items-start gap-3 rounded border border-white/90 bg-white/75 px-4 py-3.5 shadow-sm backdrop-blur-[10px] animate-yna-delay-550 dark:border-border dark:bg-surface">
            <Icon icon="ph:shield-check-bold" width={20} className="mt-px shrink-0 text-primary dark:text-primary-300" aria-hidden />
            <p className="text-[13.5px] leading-[1.55] text-ink-secondary">
              <strong className="font-semibold text-ink">Suas respostas continuam anônimas.</strong> Esta página não sabe
              quem você é, e nada do que você fizer aqui é ligado ao que você respondeu na avaliação.
            </p>
          </div>
        </div>

        <div className="relative order-first mx-auto aspect-[1/1.02] w-full max-w-[320px] animate-yna-image min-[900px]:order-none min-[900px]:max-w-[560px]" aria-hidden>
          <Pedra forma="pedra" preenchimento="cool" className="absolute -left-[6%] bottom-[-2%] w-[46%] animate-yna-float" style={{ animationDuration: '9s' }} />
          <div
            className="mask-pedrinha absolute inset-[6%_4%_10%_8%] bg-cover"
            style={{ backgroundImage: 'url(/images/landing/hero.jpg)', backgroundPosition: '50% 30%' }}
          />
          <Pedra forma="seixo" preenchimento="sunset" className="absolute -right-[2%] top-[2%] w-[30%] animate-yna-float" style={{ animationDuration: '7s', animationDirection: 'reverse' }} />
          <Pedra forma="oblongo" preenchimento="yellow" className="absolute bottom-[12%] right-[6%] w-[14%] animate-yna-float" style={{ animationDuration: '6s', animationDelay: '-2s' }} />
          <Pedra forma="pedrinha" preenchimento="white" className="absolute left-[4%] top-[4%] w-[18%] animate-yna-float opacity-80" style={{ animationDelay: '-4s' }} />
          <div className="absolute bottom-[20%] left-[2%] flex items-center gap-2.5 rounded-pill bg-surface py-2.5 pl-2.5 pr-4 font-heading text-[13.5px] font-medium text-ink shadow-lg">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-50 text-primary dark:text-primary-300">
              <Icon icon="ph:heart-bold" width={17} />
            </span>
            Presença sem intrusão
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Ajuda imediata ----------
   Prioridade máxima de visibilidade: sobreposta ao fim do hero, sem
   revelação por scroll (aparece pronta) e nunca atrás de um clique. */

function AjudaImediata() {
  return (
    <section id="ajuda" aria-labelledby="ajuda-t" className="relative z-[2] -mt-12 scroll-mt-[76px]">
      <div className={WRAP}>
        <div className="relative grid overflow-hidden rounded-2xl bg-yna-gradient-dark text-white shadow-xl min-[900px]:grid-cols-[1fr_1.5fr]">
          <div
            role="img"
            aria-label="Mãos em concha segurando uma luz quente"
            className="relative min-h-[220px] bg-cover bg-center"
            style={{ backgroundImage: 'url(/images/landing/c-ajuda.jpg)' }}
          >
            <span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-b from-transparent from-40% to-yna-night min-[900px]:bg-gradient-to-r min-[900px]:from-45%"
            />
          </div>
          <div className="relative px-[22px] pb-[30px] pt-7 max-[899px]:-mt-[60px] md:p-11 md:pl-5">
            <p className={`${EYEBROW} text-white/70`}>Ajuda imediata · 24 horas</p>
            <h2 id="ajuda-t" className="mt-2.5 font-heading text-[clamp(28px,3.6vw,40px)] font-extralight leading-[1.1] tracking-[-0.03em] text-white">
              Se está difícil agora, <b className="font-extrabold text-pink">fale com alguém agora.</b>
            </h2>
            <p className="mt-3 max-w-[560px] text-[15px] text-white/70">
              Você não precisa esperar nada da YNA nem da empresa para pedir ajuda. Estes serviços são gratuitos e
              atendem em todo o Brasil.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <LinhaAjuda
                tel="188"
                nome="CVV"
                cor="text-yellow"
                texto="Apoio emocional e prevenção do suicídio. Ligação gratuita, sigilosa, 24 horas por dia, todos os dias."
              />
              <LinhaAjuda
                tel="192"
                nome="SAMU"
                cor="text-pink"
                texto="Emergência médica. Quando há risco à vida ou à integridade de alguém, inclusive em crise emocional grave."
              />
            </div>

            <div className="mt-[18px] flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-white/60">
              <span className="inline-flex items-center gap-1.5">
                <Icon icon="ph:chat-circle-dots-bold" width={15} aria-hidden /> Prefere escrever? Chat do CVV em{' '}
                <a href="https://cvv.org.br" target="_blank" rel="noopener" className="text-white underline underline-offset-[3px]">
                  cvv.org.br
                </a>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon icon="ph:first-aid-kit-bold" width={15} aria-hidden /> Perigo imediato: vá ao pronto-socorro ou UPA mais próxima
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function LinhaAjuda({ tel, nome, cor, texto }: { tel: string; nome: string; cor: string; texto: string }) {
  return (
    <a
      href={`tel:${tel}`}
      className="flex flex-col gap-2.5 rounded-lg border border-white/[.12] bg-white/[.06] p-5 transition-[background-color,transform] duration-300 ease-organic hover:-translate-y-0.5 hover:bg-white/10"
    >
      <span className="flex items-baseline gap-3">
        <strong className={`font-heading text-[44px] font-bold leading-none tracking-[-0.03em] ${cor}`}>{tel}</strong>
        <span className="font-heading text-[15px] font-semibold">{nome}</span>
      </span>
      <span className="text-[13.5px] leading-[1.55] text-white/70">{texto}</span>
      <span className={`mt-auto inline-flex items-center gap-2 font-heading text-sm font-semibold ${cor}`}>
        <Icon icon="ph:phone-call-bold" width={16} aria-hidden /> Ligar para o {tel}
      </span>
    </a>
  )
}

/* ---------- Quem é a YNA ---------- */

function QuemEaYna() {
  return (
    <section id="sobre" aria-labelledby="sobre-t" className={SECAO}>
      <div className={`${WRAP} grid items-center gap-12 min-[900px]:grid-cols-[.9fr_1.1fr] min-[900px]:gap-[72px]`}>
        <div className="yna-reveal relative mx-auto aspect-square w-full max-w-[480px]" aria-hidden>
          <div
            className="mask-oblongo absolute inset-[0_0_8%_0] bg-cover"
            style={{ backgroundImage: 'url(/images/landing/sobre.jpg)', backgroundPosition: '40% 30%' }}
          />
          <div className="absolute -right-[4%] bottom-0 max-w-[62%] rounded-xl bg-surface px-6 py-[22px] shadow-lg">
            <p className="font-heading text-[clamp(17px,2vw,21px)] font-light leading-[1.3] tracking-[-0.01em] text-primary dark:text-primary-300">
              “Às vezes, o primeiro cuidado é conversar.”
            </p>
            <small className="mt-2.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">you are never alone</small>
          </div>
        </div>

        <div>
          <div className="yna-reveal max-w-[720px]">
            <p className={`${EYEBROW} text-ink-secondary`}>Quem é a YNA</p>
            <h2 id="sobre-t" className={H_SECAO}>
              Saúde integrativa digital, <b className={DESTAQUE}>com presença.</b>
            </h2>
            <p className={`${LEAD} mt-4`}>
              A YNA cuida da saúde emocional de pessoas que trabalham. A gente junta escuta profissional, conteúdo de
              qualidade e acompanhamento contínuo num só lugar, para que pedir ajuda seja simples, e não mais uma
              tarefa na sua lista.
            </p>
          </div>

          <div className="mt-9 grid gap-3.5 sm:grid-cols-2">
            <Pilar icon="ph:ear-bold" titulo="Escuta sem julgamento" className="delay-100">
              Você fala do seu jeito, no seu tempo. Ninguém vai te dizer o que você deveria estar sentindo.
            </Pilar>
            <Pilar icon="ph:path-bold" titulo="Cuidado contínuo" className="delay-200">
              Não é uma conversa solta. É um caminho acompanhado, com quem já conhece a sua história.
            </Pilar>
            <div className="yna-reveal col-span-full flex items-start gap-4 rounded-lg bg-primary-50 p-[22px] shadow-sm delay-300">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-surface text-primary dark:text-primary-300">
                <Icon icon="ph:lock-key-bold" width={22} aria-hidden />
              </span>
              <div>
                <h3 className="text-lg font-semibold tracking-[-0.01em] text-ink">Cuidado, não vigilância</h3>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-secondary">
                  O que você conversa com a YNA fica entre você e o profissional. A empresa só vê números coletivos,
                  nunca o nome, as respostas ou as escolhas de alguém.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Pilar({ icon, titulo, className, children }: { icon: string; titulo: string; className: string; children: ReactNode }) {
  return (
    <div className={`yna-reveal rounded-lg border border-border bg-surface p-[22px] shadow-sm ${className}`}>
      <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-primary-50 text-primary dark:text-primary-300">
        <Icon icon={icon} width={22} aria-hidden />
      </span>
      <h3 className="mt-3.5 text-lg font-semibold tracking-[-0.01em] text-ink">{titulo}</h3>
      <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-secondary">{children}</p>
    </div>
  )
}

function Checks({ itens, className = '' }: { itens: string[]; className?: string }) {
  return (
    <ul className={`grid gap-2.5 ${className}`}>
      {itens.map((t) => (
        <li key={t} className="flex gap-2.5 text-[14.5px] leading-normal text-ink-secondary">
          <Icon icon="ph:check-circle-fill" width={18} className="mt-0.5 shrink-0 text-success" aria-hidden />
          {t}
        </li>
      ))}
    </ul>
  )
}

/* ---------- Em breve ----------
   Fundo em gradiente da marca nos dois temas (como o fluxo da avaliação),
   então o texto direto sobre ele usa as cores fixas `ink-gradient`; os
   cards são `surface` e acompanham o tema. */

function EmBreve() {
  return (
    <section id="servicos" aria-labelledby="servicos-t" className={`relative overflow-hidden bg-yna-gradient-servicos ${SECAO}`}>
      <div className={WRAP}>
        <div className="yna-reveal max-w-[720px]">
          <p className={`${EYEBROW} text-ink-gradient`}>Chegando em breve</p>
          <h2 id="servicos-t" className={`${H_SECAO} text-ink-gradient`}>
            Apoio profissional, <b className="font-extrabold text-primary">quando você precisar.</b>
          </h2>
          <p className="mt-4 text-[17px] leading-[1.65] text-ink-gradient-body">
            A YNA está preparando dois serviços para quem trabalha com você. Se quiser ser avisado quando estiverem
            disponíveis, deixe seu contato no fim da página.
          </p>
        </div>

        <div className="mt-12 grid gap-5 min-[900px]:grid-cols-[1.25fr_1fr]">
          <Servico
            imagem="/images/landing/teleatendimento.jpg"
            posicao="50% 35%"
            titulo={<>Teleatendimento em <b className={DESTAQUE_B}>saúde mental</b></>}
            texto="Sessões por vídeo com psicólogos, de onde você estiver, em horários que cabem na sua rotina."
            itens={[
              'Psicólogos credenciados pela YNA, com registro no CRP verificado',
              'Uma triagem inicial para encontrar o profissional que combina com você',
              'Sigilo profissional: o conteúdo das sessões não chega à empresa',
            ]}
            className="delay-100"
          />
          <Servico
            imagem="/images/landing/acompanhamento.jpg"
            posicao="50% 30%"
            titulo={<>Acompanhamento <b className={DESTAQUE_B}>entre as sessões</b></>}
            texto="O cuidado não para quando a chamada termina. A YNA segue com você no dia a dia."
            itens={[
              'Conteúdos escolhidos para o momento que você está vivendo',
              'Lembretes leves e registro de como você está',
              'Apoio extra se algo ficar mais difícil',
            ]}
            className="delay-200"
          />
        </div>

        <ol className="mt-5 grid gap-3 md:grid-cols-3">
          <Passo n={1} titulo="Você demonstra interesse" texto="Leva menos de um minuto, sem compromisso." className="delay-100" />
          <Passo n={2} titulo="A YNA avisa quando abrir" texto="Você recebe o convite direto, no seu contato." className="delay-200" />
          <Passo n={3} titulo="Você decide se começa" texto="Sem pressa. A escolha é sempre sua." className="delay-300" />
        </ol>
      </div>
    </section>
  )
}

function Servico({
  imagem,
  posicao,
  titulo,
  texto,
  itens,
  className,
}: {
  imagem: string
  posicao: string
  titulo: ReactNode
  texto: string
  itens: string[]
  className: string
}) {
  return (
    <article className={`yna-reveal flex flex-col overflow-hidden rounded-2xl bg-surface shadow-lg ${className}`}>
      <div className="relative aspect-[16/10] bg-cover" style={{ backgroundImage: `url(${imagem})`, backgroundPosition: posicao }}>
        <Badge tone="warning" icon="ph:sparkle-bold" className="absolute left-[18px] top-[18px] !bg-yellow-soft !font-mono !text-[10.5px] uppercase tracking-[0.12em] !text-ink-gradient shadow">
          Em breve
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-[26px] pb-[30px] pt-[26px] md:px-[34px] md:pb-9 md:pt-[30px]">
        <h3 className="font-heading text-[clamp(24px,2.6vw,30px)] font-light leading-[1.15] tracking-[-0.02em] text-ink">{titulo}</h3>
        <p className="text-[15px] text-ink-secondary">{texto}</p>
        <Checks itens={itens} className="mt-1.5" />
      </div>
    </article>
  )
}

function Passo({ n, titulo, texto, className }: { n: number; titulo: string; texto: string; className: string }) {
  return (
    <li className={`yna-reveal flex items-start gap-3.5 rounded-lg border border-white/85 bg-white/70 p-5 backdrop-blur-[10px] ${className}`}>
      <b className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-primary font-heading text-sm text-white">{n}</b>
      <div>
        <h4 className="text-[15.5px] font-semibold text-ink-gradient">{titulo}</h4>
        <p className="mt-0.5 text-[13.5px] leading-normal text-ink-gradient-secondary">{texto}</p>
      </div>
    </li>
  )
}

/* ---------- Conteúdos ---------- */

const ABAS: { id: PublicoConteudo; label: string; icon: string }[] = [
  { id: 'colaborador', label: 'Para você', icon: 'ph:user-bold' },
  { id: 'lideranca', label: 'Para quem lidera', icon: 'ph:users-three-bold' },
]

const AVISO_VIDEO = 'Prévia. O vídeo completo chega em breve à biblioteca YNA.'
const AVISO_ARTIGO = 'Prévia. O artigo completo chega em breve à biblioteca YNA.'

function Conteudos() {
  const conteudo = useService(() => conteudoService.landing(), [])
  const [aba, setAba] = useState<PublicoConteudo>('colaborador')
  const [video, setVideo] = useState<VideoApoio | null>(null)
  const [artigo, setArtigo] = useState<ArtigoApoio | null>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const barraRef = useRef<HTMLDivElement>(null)
  const painelRef = useRef<HTMLDivElement>(null)

  /* Abaixo de 1000px as abas ficam fixas sob o topo enquanto se rola os
     conteúdos. Trocar de aba lá embaixo leva de volta ao começo do painel,
     para a pessoa não cair no meio da lista do outro público. */
  const trocarAba = (id: PublicoConteudo) => {
    setAba(id)
    const barra = barraRef.current
    const painel = painelRef.current
    if (!barra || !painel || getComputedStyle(barra).position !== 'sticky') return
    const limite = barra.getBoundingClientRect().bottom
    const topoPainel = painel.getBoundingClientRect().top
    if (topoPainel < limite) {
      window.scrollTo({ top: window.scrollY + topoPainel - limite, behavior: reduzMovimento() ? 'auto' : 'smooth' })
    }
  }

  const fecharVideo = useCallback(() => setVideo(null), [])
  const fecharArtigo = useCallback(() => setArtigo(null), [])

  /* Setas ←/→ (e Home/End) trocam de aba e levam o foco junto — padrão
     WAI-ARIA de abas com ativação automática. */
  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    let n: number | null = null
    if (e.key === 'ArrowRight') n = (i + 1) % ABAS.length
    else if (e.key === 'ArrowLeft') n = (i - 1 + ABAS.length) % ABAS.length
    else if (e.key === 'Home') n = 0
    else if (e.key === 'End') n = ABAS.length - 1
    if (n === null) return
    e.preventDefault()
    trocarAba(ABAS[n]!.id)
    tabRefs.current[n]?.focus({ preventScroll: true })
  }

  const dados: ConteudoLandingAba | undefined = conteudo.status === 'success' ? conteudo.data[aba] : undefined

  return (
    <section id="conteudos" aria-labelledby="conteudos-t" className={SECAO}>
      <div className={WRAP}>
        <div className="yna-reveal max-w-[720px]">
          <p className={`${EYEBROW} text-ink-secondary`}>Biblioteca de apoio</p>
          <h2 id="conteudos-t" className={H_SECAO}>
            Para começar <b className={DESTAQUE}>hoje mesmo.</b>
          </h2>
          <p className={`${LEAD} mt-4`}>Vídeos e textos curtos sobre saúde mental no trabalho. Sem cadastro, sem jargão.</p>
        </div>

        <div
          ref={barraRef}
          className="yna-reveal sticky top-[68px] z-30 -mx-5 mt-8 bg-[color:color-mix(in_srgb,var(--page-bg)_88%,transparent)] px-5 py-2.5 backdrop-blur-[14px] md:-mx-8 md:px-8 min-[1000px]:static min-[1000px]:mx-0 min-[1000px]:bg-transparent min-[1000px]:p-0 min-[1000px]:backdrop-blur-none"
        >
          <div role="tablist" aria-label="Público dos conteúdos" className="inline-flex max-w-full gap-1 rounded-pill border border-border bg-surface-2 p-[5px]">
            {ABAS.map((a, i) => {
              const ativa = a.id === aba
              return (
                <button
                  key={a.id}
                  ref={(el) => {
                    tabRefs.current[i] = el
                  }}
                  type="button"
                  role="tab"
                  id={`aba-${a.id}`}
                  aria-selected={ativa}
                  aria-controls="painel-conteudos"
                  tabIndex={ativa ? 0 : -1}
                  onClick={() => trocarAba(a.id)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-pill px-4 py-2.5 font-heading text-[14.5px] font-semibold transition-colors min-[400px]:px-5 ${
                    ativa ? 'bg-surface text-primary shadow-sm dark:bg-surface-hover dark:text-primary-300' : 'text-ink-secondary hover:text-ink'
                  }`}
                >
                  <Icon icon={a.icon} width={16} aria-hidden /> {a.label}
                </button>
              )
            })}
          </div>
        </div>

        <div ref={painelRef} id="painel-conteudos" role="tabpanel" aria-labelledby={`aba-${aba}`} tabIndex={0} className="rounded-lg">
          {conteudo.status === 'error' ? (
            <ErrorState message={conteudo.message} onRetry={conteudo.reload} />
          ) : !dados ? (
            <ConteudosCarregando />
          ) : (
            <>
              <p className="mt-[18px] max-w-[640px] text-[15px] text-ink-secondary">{dados.intro}</p>
              <div className="mt-7 grid gap-7 min-[1000px]:grid-cols-[1.9fr_1fr] min-[1000px]:gap-8">
                <div className="grid gap-[18px] sm:grid-cols-2">
                  {dados.videos.map((v, i) => (
                    <CartaoVideo key={v.id} video={v} destaque={i === 0} onAbrir={() => setVideo(v)} />
                  ))}
                </div>
                <aside className="self-start rounded-xl border border-border bg-surface px-[22px] pb-2.5 pt-[22px] shadow-sm">
                  <h3 className="flex items-center gap-2 text-[17px] font-semibold text-ink">
                    <Icon icon="ph:book-open-text-bold" width={18} className="text-primary dark:text-primary-300" aria-hidden /> Para ler com calma
                  </h3>
                  <div className="mt-3">
                    {dados.artigos.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setArtigo(a)}
                        className="group flex w-full items-start gap-3.5 border-t border-border py-4 text-left"
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] text-white" style={{ background: a.capa }}>
                          <Icon icon={a.icone ?? 'ph:article-bold'} width={19} aria-hidden />
                        </span>
                        <span>
                          <span className="block font-heading text-[15.5px] font-semibold leading-[1.35] tracking-[-0.005em] text-ink transition-colors group-hover:text-primary dark:group-hover:text-primary-300">
                            {a.titulo}
                          </span>
                          <small className="mt-1 block text-[12.5px] text-ink-muted">
                            {a.categoria} · {a.tempoLeituraMin} min de leitura
                          </small>
                        </span>
                      </button>
                    ))}
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </div>

      <VideoImersivo
        video={video}
        videos={dados?.videos ?? []}
        onClose={fecharVideo}
        onSelecionar={setVideo}
        trilha="Conteúdos"
        aviso={AVISO_VIDEO}
      />
      <ArtigoModal artigo={artigo} onClose={fecharArtigo} aviso={AVISO_ARTIGO} />
    </section>
  )
}

function CartaoVideo({ video, destaque, onAbrir }: { video: VideoApoio; destaque: boolean; onAbrir: () => void }) {
  return (
    <button
      type="button"
      onClick={onAbrir}
      aria-label={`Assistir: ${video.titulo} (${video.duracaoMin} min)`}
      className={`group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface p-0 text-left shadow-sm transition-[transform,box-shadow] duration-300 ease-organic hover:-translate-y-1 hover:shadow-lg ${
        destaque ? 'col-span-full sm:flex-row' : ''
      }`}
    >
      <div
        className={`relative aspect-[16/10] w-full overflow-hidden ${destaque ? 'sm:aspect-auto sm:min-h-[280px] sm:flex-[1.2]' : ''}`}
        style={{ background: capaVideo(video) }}
      >
        <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-transparent from-50% to-yna-night/45" />
        <span className="absolute left-1/2 top-1/2 z-[1] grid h-[58px] w-[58px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-primary shadow-lg transition-transform duration-300 ease-organic group-hover:scale-110">
          <Icon icon="ph:play-fill" width={24} aria-hidden />
        </span>
        <span className="absolute bottom-3 right-3 z-[1] rounded-pill bg-yna-night/60 px-2.5 py-1 font-mono text-[11px] text-white backdrop-blur-[6px]">
          {video.duracaoMin} min
        </span>
      </div>
      <div className={`flex flex-col gap-2 px-5 pb-[22px] pt-[18px] ${destaque ? 'sm:flex-1 sm:justify-center sm:p-7' : ''}`}>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-primary dark:text-primary-300">{video.categoria}</span>
        <span
          className={`block font-heading text-ink ${
            destaque
              ? 'text-[clamp(22px,2.4vw,28px)] font-normal leading-[1.3] tracking-[-0.02em]'
              : 'text-lg font-semibold leading-[1.3] tracking-[-0.01em]'
          }`}
        >
          {video.titulo}
        </span>
        {destaque && <span className="text-sm leading-[1.55] text-ink-secondary">{video.resumo}</span>}
      </div>
    </button>
  )
}

function ConteudosCarregando() {
  return (
    <div className="mt-[18px]" aria-busy="true">
      <Skeleton className="h-5 w-full max-w-[560px]" />
      <div className="mt-7 grid gap-7 min-[1000px]:grid-cols-[1.9fr_1fr] min-[1000px]:gap-8">
        <div className="grid gap-[18px] sm:grid-cols-2">
          <Skeleton className="col-span-full h-[280px] !rounded-xl" />
          <Skeleton className="h-[240px] !rounded-xl" />
          <Skeleton className="h-[240px] !rounded-xl" />
        </div>
        <Skeleton className="h-[360px] !rounded-xl" />
      </div>
    </div>
  )
}

/* ---------- Lista de interesse ---------- */

const PERFIS: { id: InteressePerfil; label: string }[] = [
  { id: 'colaborador', label: 'Colaborador(a)' },
  { id: 'lideranca', label: 'Liderança' },
  { id: 'rh', label: 'RH / Gestão de pessoas' },
]

const SERVICOS: { id: InteresseServico; label: string; icon: string }[] = [
  { id: 'teleatendimento', label: 'Teleatendimento', icon: 'ph:video-camera-bold' },
  { id: 'acompanhamento', label: 'Acompanhamento', icon: 'ph:path-bold' },
  { id: 'conteudos', label: 'Novos conteúdos', icon: 'ph:play-circle-bold' },
]

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Máscara de celular: (00) 00000-0000, ou (00) 0000-0000 com 10 dígitos. */
function mascararWhatsapp(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 11)
  if (!d) return ''
  const corte = d.length > 10 ? 7 : 6
  let o = `(${d.slice(0, 2)}`
  if (d.length >= 3) o += `) ${d.slice(2, corte)}`
  if (d.length >= 7) o += `-${d.slice(corte)}`
  return o
}

type CampoObrigatorio = 'nome' | 'email' | 'consentimento'
const ORDEM_CAMPOS: CampoObrigatorio[] = ['nome', 'email', 'consentimento']
const ID_CAMPO: Record<CampoObrigatorio, string> = {
  nome: 'interesse-nome',
  email: 'interesse-email',
  consentimento: 'interesse-consentimento',
}

const pilula =
  'inline-flex cursor-pointer items-center gap-2 rounded-pill border-[1.5px] border-border bg-surface px-4 py-2.5 font-heading text-sm font-medium text-ink-secondary transition-colors peer-checked:border-primary peer-checked:bg-primary-50 peer-checked:text-primary peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary/55 dark:peer-checked:text-primary-300'

function Interesse({ empresa }: { empresa: string | null }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [perfil, setPerfil] = useState<InteressePerfil>('colaborador')
  const [interesses, setInteresses] = useState<InteresseServico[]>(['teleatendimento'])
  const [consentimento, setConsentimento] = useState(false)
  const [erros, setErros] = useState<Partial<Record<CampoObrigatorio, string>>>({})
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState<string | null>(null)
  const [enviadoPara, setEnviadoPara] = useState<string | null>(null)
  const sucessoRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (enviadoPara === null) return
    sucessoRef.current?.focus()
    sucessoRef.current?.scrollIntoView({ behavior: reduzMovimento() ? 'auto' : 'smooth', block: 'center' })
  }, [enviadoPara])

  const limparErro = (campo: CampoObrigatorio) => setErros((e) => (e[campo] ? { ...e, [campo]: undefined } : e))

  const alternarInteresse = (id: InteresseServico) =>
    setInteresses((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]))

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    const novos: Partial<Record<CampoObrigatorio, string>> = {}
    if (!nome.trim()) novos.nome = 'Diga como prefere ser chamado.'
    if (!EMAIL_VALIDO.test(email.trim())) novos.email = 'Informe um e-mail válido.'
    if (!consentimento) novos.consentimento = 'Precisamos da sua autorização para entrar em contato.'
    setErros(novos)
    const primeiro = ORDEM_CAMPOS.find((c) => novos[c])
    if (primeiro) {
      document.getElementById(ID_CAMPO[primeiro])?.focus()
      return
    }

    setEnviando(true)
    setErroEnvio(null)
    try {
      /* Só os campos do formulário + o nome da empresa. Nada da avaliação
         (ver a regra de privacidade em `services/interesse.ts`). */
      await interesseService.registrar({
        nome: nome.trim(),
        email: email.trim(),
        whatsapp: whatsapp || undefined,
        perfil,
        interesses,
        consentimento: true,
        empresa: empresa ?? undefined,
      })
      setEnviadoPara(nome.trim().split(/\s+/)[0] ?? '')
    } catch {
      setErroEnvio('Não foi possível enviar agora. Tente de novo em instantes.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section id="interesse" aria-labelledby="interesse-t" className={`relative overflow-hidden ${FUNDO_SOFT} ${SECAO}`}>
      <span aria-hidden className="pointer-events-none absolute -right-[160px] -top-[120px] h-[460px] w-[460px] rounded-full bg-pink opacity-25 blur-[70px] dark:opacity-10" />

      <div className={`${WRAP} relative grid items-start gap-10 min-[960px]:grid-cols-[.9fr_1.1fr] min-[960px]:gap-16`}>
        <div className="yna-reveal">
          <p className={`${EYEBROW} text-ink-secondary`}>Lista de interesse</p>
          <h2 id="interesse-t" className={H_SECAO}>
            Quer ser avisado <b className={DESTAQUE}>quando abrir?</b>
          </h2>
          <p className={`${LEAD} mt-4`}>
            Deixe seu contato e a YNA te avisa assim que o teleatendimento em saúde mental estiver disponível para você
            e a sua equipe.
          </p>
          <Checks className="mt-6" itens={['Sem custo e sem compromisso', 'Você pode pedir para sair da lista quando quiser']} />
          <div className="mt-7 flex items-start gap-3 rounded border border-border bg-surface px-[18px] py-4">
            <Icon icon="ph:eye-slash-bold" width={20} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
            <p className="text-[13.5px] leading-[1.55] text-ink-secondary">
              <strong className="text-ink">Este formulário é separado da avaliação.</strong> O que você preencher aqui
              não é ligado às suas respostas, e a sua empresa não recebe seus dados de contato. Eles ficam só com a YNA.
            </p>
          </div>
        </div>

        <div className="yna-reveal relative rounded-2xl bg-surface px-[22px] py-7 shadow-xl delay-100 md:p-10">
          {enviadoPara !== null ? (
            <div role="status" className="px-1 py-6 text-center">
              <div className="mx-auto grid h-[76px] w-[76px] animate-yna-pop place-items-center rounded-full bg-success-bg text-success">
                <Icon icon="ph:check-bold" width={34} aria-hidden />
              </div>
              <h3 ref={sucessoRef} tabIndex={-1} className="mt-5 text-2xl font-light tracking-[-0.02em] text-ink outline-none">
                Pronto, <b className={DESTAQUE_B}>{enviadoPara ? `obrigado, ${enviadoPara}` : 'obrigado'}</b>.
              </h3>
              <p className="mx-auto mt-2.5 max-w-[420px] text-[15px] text-ink-secondary">
                Você está na lista. Assim que o teleatendimento abrir, a YNA te avisa. Enquanto isso, os conteúdos acima
                continuam aqui para você.
              </p>
              <div className="mt-[22px]">
                <Button variant="secondary" size="sm" onClick={() => irPara('conteudos')}>
                  Voltar aos conteúdos
                </Button>
              </div>
            </div>
          ) : (
            <form noValidate onSubmit={enviar}>
              <h3 className="text-2xl font-light tracking-[-0.02em] text-ink">
                Tenho <b className={DESTAQUE_B}>interesse</b>
              </h3>
              <p className="mt-1.5 text-sm text-ink-secondary">Campos com * são obrigatórios.</p>

              <div className="mt-[26px] grid gap-[18px]">
                <Input
                  id={ID_CAMPO.nome}
                  label="Como podemos te chamar? *"
                  autoComplete="given-name"
                  placeholder="Seu nome ou apelido"
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value)
                    limparErro('nome')
                  }}
                  error={erros.nome}
                  className="min-h-[50px] text-[15.5px]"
                />
                <div className="grid gap-[18px] sm:grid-cols-2">
                  <Input
                    id={ID_CAMPO.email}
                    type="email"
                    inputMode="email"
                    label="E-mail *"
                    autoComplete="email"
                    placeholder="voce@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      limparErro('email')
                    }}
                    error={erros.email}
                    className="min-h-[50px] text-[15.5px]"
                  />
                  <Input
                    id="interesse-whatsapp"
                    type="tel"
                    inputMode="tel"
                    label="WhatsApp (opcional)"
                    autoComplete="tel"
                    placeholder="(00) 00000-0000"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(mascararWhatsapp(e.target.value))}
                    className="min-h-[50px] text-[15.5px]"
                  />
                </div>

                <fieldset className="m-0 min-w-0 border-0 p-0">
                  <legend className="mb-2 p-0 text-sm font-semibold text-ink">Na empresa, você é</legend>
                  <div className="flex flex-wrap gap-2">
                    {PERFIS.map((p) => (
                      <label key={p.id} className="relative">
                        <input
                          type="radio"
                          name="perfil"
                          value={p.id}
                          checked={perfil === p.id}
                          onChange={() => setPerfil(p.id)}
                          className="peer absolute inset-0 m-0 cursor-pointer opacity-0"
                        />
                        <span className={pilula}>{p.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="m-0 min-w-0 border-0 p-0">
                  <legend className="mb-2 p-0 text-sm font-semibold text-ink">Tenho interesse em</legend>
                  <div className="flex flex-wrap gap-2">
                    {SERVICOS.map((s) => (
                      <label key={s.id} className="relative">
                        <input
                          type="checkbox"
                          name="interesse"
                          value={s.id}
                          checked={interesses.includes(s.id)}
                          onChange={() => alternarInteresse(s.id)}
                          className="peer absolute inset-0 m-0 cursor-pointer opacity-0"
                        />
                        <span className={pilula}>
                          <Icon icon={s.icon} width={16} aria-hidden />
                          {s.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label className="flex cursor-pointer items-start gap-3 text-[13.5px] leading-[1.55] text-ink-secondary">
                    <input
                      id={ID_CAMPO.consentimento}
                      type="checkbox"
                      checked={consentimento}
                      onChange={(e) => {
                        setConsentimento(e.target.checked)
                        limparErro('consentimento')
                      }}
                      aria-invalid={erros.consentimento ? 'true' : undefined}
                      aria-describedby={erros.consentimento ? `${ID_CAMPO.consentimento}-error` : undefined}
                      className="mt-px h-5 w-5 shrink-0 cursor-pointer accent-primary"
                    />
                    <span>
                      Autorizo a YNA a usar meus dados de contato só para me avisar sobre os serviços que escolhi,
                      conforme a LGPD. Posso pedir a exclusão a qualquer momento.
                    </span>
                  </label>
                  {erros.consentimento && (
                    <p id={`${ID_CAMPO.consentimento}-error`} role="alert" className="mt-1.5 text-xs text-danger">
                      {erros.consentimento}
                    </p>
                  )}
                </div>
              </div>

              {erroEnvio && (
                <p role="alert" className="mt-5 rounded bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-ink">
                  {erroEnvio}
                </p>
              )}

              <div className="mt-[26px]">
                <Button type="submit" variant="gradient" size="lg" fullWidth iconRight={enviando ? undefined : 'ph:arrow-right-bold'} disabled={enviando}>
                  {enviando ? (
                    <>
                      <Icon icon="ph:spinner-gap-bold" width={18} className="animate-spin" aria-hidden /> Enviando…
                    </>
                  ) : (
                    'Quero ser avisado'
                  )}
                </Button>
              </div>
              <p className="mt-3.5 text-center text-[12.5px] text-ink-muted">Seus dados não são ligados às respostas da avaliação.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------- Rodapé ---------- */

function Rodape({ empresa }: { empresa: string }) {
  return (
    <footer className="bg-yna-gradient-dark pb-9 pt-16 text-white/70">
      <div className={WRAP}>
        <div className="grid gap-9 min-[900px]:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <LogoYna className="h-[34px] w-24 text-white" role="img" aria-label="YNA" />
            <p className="mt-5 font-heading text-[26px] font-extralight leading-[1.05] tracking-[-0.02em] text-white">
              you are <b className="bg-yna-gradient bg-clip-text font-bold text-transparent">never alone</b>
            </p>
            <p className="mt-4 max-w-[340px] text-sm leading-relaxed">
              Cuidado em saúde emocional oferecido por {empresa} em parceria com a YNA.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Nesta página</h4>
            <ul className="grid gap-2 text-sm">
              {SECOES.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} onClick={ancora(s.id)} className="text-white/80 hover:text-white hover:underline hover:underline-offset-[3px]">
                    {s.rodape}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Ajuda imediata, 24h</h4>
            <ul className="grid gap-2 text-sm">
              <li>
                <a href="tel:188" className="text-white/80 hover:text-white hover:underline hover:underline-offset-[3px]">CVV · 188</a>
              </li>
              <li>
                <a href="https://cvv.org.br" target="_blank" rel="noopener" className="text-white/80 hover:text-white hover:underline hover:underline-offset-[3px]">
                  Chat do CVV · cvv.org.br
                </a>
              </li>
              <li>
                <a href="tel:192" className="text-white/80 hover:text-white hover:underline hover:underline-offset-[3px]">SAMU · 192</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap justify-between gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-[12.5px] text-white/50">
          <span>© {new Date().getFullYear()} YNA Care Hub</span>
          <span>Esta página não substitui atendimento médico ou psicológico.</span>
        </div>
      </div>
    </footer>
  )
}
