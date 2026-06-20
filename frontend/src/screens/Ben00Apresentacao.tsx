import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { OnboardingSplit } from '../components/OnboardingSplit'
import { LogoYna } from '../components/YnaLogo'

const slides = [
  {
    image: '/images/slide1.png',
    eyebrow: 'Por que a YNA existe',
    title: 'Um lugar para se encontrar',
    highlight: 'se encontrar',
    body: 'A YNA conecta você a profissionais de saúde mental de forma segura, acolhedora e completamente adaptada à sua jornada.',
  },
  {
    image: '/images/slide2.png',
    eyebrow: 'O que oferecemos',
    title: 'Cuidado feito para você',
    highlight: 'para você',
    body: 'Triagem personalizada, match com o profissional certo, sessões online e acompanhamento contínuo. Tudo em um só lugar.',
  },
  {
    image: '/images/slide3.png',
    eyebrow: 'Como funciona',
    title: 'Sua jornada começa agora',
    highlight: 'começa agora',
    body: 'Em poucos minutos, você conhece seu perfil, encontra o profissional ideal e agenda sua primeira sessão.',
  },
]

interface PebbleConfig {
  shape: string
  bg: 'gradient' | 'lavender' | 'pink' | 'white'
  className: string
}

interface SlideVisualConfig {
  mainMask: string
  pebbles: PebbleConfig[]
}

const slideVisuals: Record<number, SlideVisualConfig> = {
  1: {
    mainMask: '/images/forma-1.svg',
    pebbles: [
      {
        shape: '/images/forma-3.svg',
        bg: 'white',
        className: 'absolute bottom-[-6%] left-[-6%] w-[32%] h-[16%] z-20',
      },
      {
        shape: '/images/forma-4.svg',
        bg: 'gradient',
        className: 'absolute top-[12%] right-[-10%] w-[20%] h-[22%] z-20',
      },
      {
        shape: '/images/forma-2.svg',
        bg: 'white',
        className: 'absolute top-[34%] right-[-12%] w-[24%] h-[8%] z-20',
      },
      {
        shape: '/images/forma-3.svg',
        bg: 'pink',
        className: 'absolute top-[42%] right-[-16%] w-[32%] h-[17%] z-20',
      },
    ],
  },
  2: {
    mainMask: '/images/forma-4.svg',
    pebbles: [
      {
        shape: '/images/forma-4.svg',
        bg: 'pink',
        className: 'absolute top-[12%] left-[-4%] w-[18%] h-[20%] z-20',
      },
      {
        shape: '/images/forma-2.svg',
        bg: 'white',
        className: 'absolute top-[32%] left-[-6%] w-[22%] h-[7.5%] z-20',
      },
      {
        shape: '/images/forma-1.svg',
        bg: 'gradient',
        className: 'absolute top-[39.5%] left-[-10%] w-[32%] h-[30%] z-20',
      },
      {
        shape: '/images/forma-3.svg',
        bg: 'lavender',
        className: 'absolute bottom-[-6%] right-[-6%] w-[32%] h-[16%] z-20',
      },
    ],
  },
  3: {
    mainMask: '/images/forma-1.svg',
    pebbles: [
      {
        shape: '/images/forma-2.svg',
        bg: 'lavender',
        className: 'absolute top-[15%] right-[-10%] w-[22%] h-[7.5%] z-20',
      },
      {
        shape: '/images/forma-4.svg',
        bg: 'gradient',
        className: 'absolute top-[22.5%] right-[-7%] w-[15%] h-[17%] z-20',
      },
      {
        shape: '/images/forma-3.svg',
        bg: 'white',
        className: 'absolute top-[39.5%] right-[-12%] w-[28%] h-[15%] z-20',
      },
      {
        shape: '/images/forma-1.svg',
        bg: 'gradient',
        className: 'absolute bottom-[-6%] left-[-8%] w-[28%] h-[26%] z-20',
      },
    ],
  },
}

function renderTitle(title: string, highlight: string) {
  const idx = title.indexOf(highlight)
  if (idx === -1) return title
  return (
    <>
      {title.slice(0, idx)}
      <span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">
        {highlight}
      </span>
      {title.slice(idx + highlight.length)}
    </>
  )
}

export function Ben00Apresentacao() {
  const { passo } = useParams<{ passo: string }>()
  const navigate = useNavigate()
  const step = Math.max(1, Math.min(3, parseInt(passo ?? '1', 10)))
  const slide = slides[step - 1]
  const isLast = step === 3

  const handleNext = () => {
    if (isLast) {
      navigate('/sigilo')
    } else {
      navigate(`/apresentacao/${step + 1}`)
    }
  }

  const visual = slideVisuals[step]

  // Image panel with serene photography, masked inside pebble shapes demonstrating balance
  const imagePanel = (
    <div key={step} className="flex h-full w-full items-center justify-center p-2 md:p-4 overflow-hidden md:overflow-visible relative bg-transparent">
      {/* Background ambient light effects */}
      <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] rounded-full bg-white/20 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[250px] h-[250px] rounded-full bg-pink/10 blur-[80px] pointer-events-none" />

      {/* Main Composition Container */}
      <div className="relative w-[36vh] h-[36vh] md:w-[76vh] md:h-[76vh] md:max-w-[86%] md:max-h-[86%] aspect-square md:-translate-x-[13%]">
        {/* Dynamic Pebbles */}
        {visual.pebbles.map((peb, idx) => {
          let bgClass = ''
          if (peb.bg === 'gradient') bgClass = 'bg-yna-gradient'
          else if (peb.bg === 'lavender') bgClass = 'bg-lavender'
          else if (peb.bg === 'pink') bgClass = 'bg-pink-soft'
          else if (peb.bg === 'white') bgClass = 'bg-white'

          return (
            <div
              key={idx}
              className={`${peb.className} ${bgClass} hover:scale-105 hover:-translate-y-1 transition-all duration-700 ease-organic cursor-pointer pointer-events-auto filter`}
              style={{
                maskImage: `url(${peb.shape})`,
                WebkitMaskImage: `url(${peb.shape})`,
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                filter: peb.bg === 'gradient' ? 'drop-shadow(0 8px 24px rgba(71,73,168,0.18))' : 'drop-shadow(0 4px 12px rgba(0,0,0,0.04))'
              }}
            />
          )
        })}

        {/* Main Masked Image */}
        <div
          className="w-full h-full overflow-hidden filter drop-shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:scale-[1.02] transition-transform duration-700 ease-organic z-10 relative"
          style={{
            maskImage: `url(${visual.mainMask})`,
            WebkitMaskImage: `url(${visual.mainMask})`,
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
          }}
        >
          <img
            src={slide.image}
            className="w-full h-full object-cover object-center animate-yna-image"
            alt={slide.title}
          />
        </div>
      </div>
    </div>
  )

  return (
    <OnboardingSplit panel={imagePanel}>
      <div
        key={step}
        className="px-6 pb-10 pt-10 flex flex-col justify-between h-full min-h-[40vh] md:min-h-0 md:px-16 md:py-16"
      >
        {/* Brand logo at the top of the content block, without the tagline (hidden on mobile) */}
        <div className="hidden md:block mb-6 md:mb-0 animate-yna-logo">
          <LogoYna className="h-8 text-primary dark:text-lavender" />
        </div>

        <div className="md:my-auto">
          <p className="text-sm font-medium text-primary dark:text-primary-300 animate-yna-slide-up animate-yna-delay-100">
            {slide.eyebrow}
          </p>
          <h1 className="mt-2 text-[32px] md:text-[42px] font-heading font-light leading-[1.08] tracking-[-0.03em] text-ink animate-yna-slide-up animate-yna-delay-250">
            {renderTitle(slide.title, slide.highlight)}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-secondary animate-yna-slide-up animate-yna-delay-400">
            {slide.body}
          </p>

          {/* Feature badges removed to clean up visual density */}
        </div>

        <div className="mt-10 md:mt-0 flex flex-col gap-4 animate-yna-slide-up animate-yna-delay-550">
          {/* Progress dots - left-aligned for visual breathing room */}
          <div className="flex items-center justify-start gap-2 mb-4" aria-label={`Passo ${step} de ${slides.length}`}>
            {slides.map((_, i) => (
              <div
                key={i}
                aria-current={i === step - 1 ? 'step' : undefined}
                className={`h-2 rounded-pill transition-all duration-300 ${
                  i === step - 1 ? 'w-6 bg-primary' : 'w-2 bg-border-strong'
                }`}
              />
            ))}
          </div>

          <Button
            size="lg"
            fullWidth
            iconRight={isLast ? undefined : 'ph:arrow-right-bold'}
            onClick={handleNext}
          >
            {isLast ? 'Iniciar meu cadastro' : 'Próximo'}
          </Button>

          {!isLast && (
            <Button variant="ghost" fullWidth onClick={() => navigate('/sigilo')}>
              Pular apresentação
            </Button>
          )}
        </div>
      </div>
    </OnboardingSplit>
  )
}

