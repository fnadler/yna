import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { LogoYna } from '../components/YnaLogo'
import { Button } from '../components/Button'
import { LoginSheet } from '../components/LoginSheet'

export function Ben00BemVindo() {
  const navigate = useNavigate()
  const [loginOpen, setLoginOpen] = useState(false)

  return (
    <>
    <div className="relative w-full">
      {/* MOBILE LAYOUT (md:hidden) */}
      <div className="relative w-full bg-yna-gradient-soft md:hidden flex flex-col">
        {/* Logo */}
        <div className="absolute left-7 top-8 z-30 animate-yna-logo">
          <LogoYna className="h-9 text-primary" />
        </div>

        {/* Painel de imagem + formas — maior que os slides de apresentação */}
        <div className="relative h-[58vh] min-h-[300px] shrink-0 flex items-center justify-center overflow-visible">
          {/* Ambient light */}
          <div className="absolute top-[15%] left-[30%] w-[260px] h-[260px] rounded-full bg-white/30 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-[5%] right-[10%] w-[180px] h-[180px] rounded-full bg-pink/20 blur-[60px] pointer-events-none" />

          {/* Composição principal */}
          <div className="relative w-[52vh] max-w-[88%] aspect-square mt-8">
            {/* Pebble: forma-4 (gradient) — canto superior direito */}
            <div
              className="absolute top-[6%] right-[-10%] w-[22%] h-[24%] z-20"
              style={{ filter: 'drop-shadow(0 8px 24px rgba(71,73,168,0.25))' }}
            >
              <div
                className="w-full h-full bg-yna-gradient"
                style={{ maskImage: 'url(/images/forma-4.svg)', WebkitMaskImage: 'url(/images/forma-4.svg)', maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat' }}
              />
            </div>
            {/* Pebble: forma-2 (white) — direita, abaixo do gradient */}
            <div
              className="absolute top-[30%] right-[-12%] w-[30%] h-[9%] z-20"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.06))' }}
            >
              <div
                className="w-full h-full bg-white"
                style={{ maskImage: 'url(/images/forma-2.svg)', WebkitMaskImage: 'url(/images/forma-2.svg)', maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat' }}
              />
            </div>
            {/* Pebble: forma-3 (white) — base da pilha, inferior esquerdo */}
            <div
              className="absolute bottom-[4%] left-[-4%] w-[38%] h-[18%] z-20"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.05))' }}
            >
              <div
                className="w-full h-full bg-white"
                style={{ maskImage: 'url(/images/forma-3.svg)', WebkitMaskImage: 'url(/images/forma-3.svg)', maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat' }}
              />
            </div>
            {/* Pebble: forma-1 (gradient) — empilhada acima da forma-3 */}
            <div
              className="absolute bottom-[22%] left-[-10%] w-[32%] h-[30%] z-20"
              style={{ filter: 'drop-shadow(0 8px 24px rgba(71,73,168,0.22))' }}
            >
              <div
                className="w-full h-full bg-yna-gradient"
                style={{ maskImage: 'url(/images/forma-1.svg)', WebkitMaskImage: 'url(/images/forma-1.svg)', maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat' }}
              />
            </div>

            {/* Imagem principal mascarada com forma-1 — drop-shadow no wrapper
                externo para a sombra seguir a forma mascarada (mask + drop-shadow
                no mesmo elemento gera sombra retangular no iOS Safari). */}
            <div className="w-full h-full filter drop-shadow-[0_16px_48px_rgba(0,0,0,0.10)] z-10 relative">
              <div
                className="w-full h-full overflow-hidden"
                style={{ maskImage: 'url(/images/forma-1.svg)', WebkitMaskImage: 'url(/images/forma-1.svg)', maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat' }}
              >
                <img
                  src="/images/welcome.png"
                  className="w-full h-full object-cover object-center animate-yna-image"
                  alt="Pessoa sorrindo em momento de calma e reconexão na natureza"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo — abaixo da composição */}
        <div className="px-7 pb-10 pt-4 z-20 animate-yna-fade-in">
          <p className="mb-2 text-sm font-medium text-primary dark:text-primary-300 animate-yna-slide-up animate-yna-delay-100">
            Bem-vindo à YNA
          </p>
          <h1 className="mb-4 text-[32px] font-heading font-light leading-[1.08] tracking-[-0.03em] text-ink animate-yna-slide-up animate-yna-delay-250">
            Você nunca<br />está <span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">sozinho.</span>
          </h1>
          <p className="mb-6 max-w-sm text-[15px] leading-relaxed text-ink-secondary animate-yna-slide-up animate-yna-delay-400">
            Um lugar para cuidar da sua saúde mental, com profissionais de confiança e no seu ritmo.
          </p>
          <button
            onClick={() => navigate('/apresentacao/1')}
            className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-xl bg-primary font-heading text-[15px] font-semibold text-white shadow-md transition-all duration-300 hover:bg-primary-600 active:scale-[0.98] animate-yna-slide-up animate-yna-delay-550"
          >
            Conhecer a YNA
            <Icon icon="ph:arrow-right-bold" width={18} aria-hidden />
          </button>
          <button
            onClick={() => setLoginOpen(true)}
            className="mt-3 flex min-h-[44px] w-full items-center justify-center text-sm font-medium text-ink-secondary hover:text-ink animate-yna-slide-up animate-yna-delay-550"
          >
            Já sou cadastrado
          </button>
        </div>
      </div>

      {/* DESKTOP LAYOUT (hidden md:flex) */}
      <div className="hidden md:flex h-dvh w-full bg-yna-gradient-soft overflow-hidden relative">
        {/* Background ambient blobs for premium depth */}
        <div className="absolute top-[20%] left-[40%] w-[500px] h-[500px] rounded-full bg-white/40 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] rounded-full bg-pink/25 blur-[100px] pointer-events-none" />

        {/* Left Column: Content panel */}
        <div className="flex flex-col justify-between h-full w-[42%] pl-24 pr-8 py-20 z-20 relative">
          {/* Brand logo */}
          <div className="animate-yna-logo">
            <LogoYna className="h-10 text-primary" />
          </div>

          {/* Content Block */}
          <div className="my-auto max-w-md">
            <p className="mb-2 font-heading text-xl md:text-2xl font-semibold tracking-[-0.015em] text-primary animate-yna-slide-up animate-yna-delay-100">
              Bem-vindo à YNA
            </p>
            <h1 className="mb-5 text-[56px] font-heading font-light leading-[1.05] tracking-[-0.03em] text-ink animate-yna-slide-up animate-yna-delay-250">
              Você nunca<br />está <span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">sozinho.</span>
            </h1>
            <p className="mb-10 max-w-sm text-[16px] leading-relaxed text-ink-secondary animate-yna-slide-up animate-yna-delay-400">
              Um lugar para cuidar da sua saúde mental, com profissionais de confiança e no seu ritmo.
            </p>

            <div className="flex items-center gap-6 animate-yna-slide-up animate-yna-delay-550">
              <Button
                variant="primary"
                size="lg"
                className="!bg-primary !text-white shadow-lg shadow-primary/10 hover:!bg-primary-600 active:scale-[0.98] transition-all duration-300 w-fit px-8"
                iconRight="ph:arrow-right-bold"
                onClick={() => navigate('/apresentacao/1')}
              >
                Conhecer a YNA
              </Button>
              <button
                onClick={() => setLoginOpen(true)}
                className="text-sm font-medium text-ink-secondary hover:text-ink"
              >
                Já sou cadastrado
              </button>
            </div>
          </div>

          {/* Spacer to balance top logo with flex justify-between */}
          <div className="h-10" />
        </div>

        {/* Right Column: Interactive composition pane (Full height) */}
        <div className="absolute inset-y-0 right-0 w-[58%] h-full z-10 select-none">
          {/* Main Portrait Masked Image */}
          <div 
            className="w-full h-full relative overflow-hidden animate-yna-image"
            style={{ clipPath: 'url(#welcome-full-height-mask)' }}
          >
            <img
              src="/images/welcome.png"
              className="h-full w-full object-cover object-center scale-[1.28] relative left-[95px]"
              alt="Pessoa sorrindo em momento de calma e reconexão na natureza"
            />
            {/* Soft blend overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-primary/10 via-pink/15 to-transparent mix-blend-multiply" />
          </div>

          {/* Staggered and connected vertical stack of balancing stones */}
          <div className="absolute top-[18%] left-[calc(4%_-_20px)] lg:left-[calc(6%_-_20px)] w-[320px] h-[500px] lg:h-[520px] z-20 pointer-events-none">
            {/* Top Pebble (forma-4 - Brand Gradient) */}
            <svg
              viewBox="0 0 49 55"
              className="absolute bottom-[368px] left-[85px] lg:left-[95px] w-[100px] h-[112px] filter drop-shadow-[0_12px_36px_rgba(71,73,168,0.22)] hover:scale-105 hover:-translate-y-1 transition-all duration-700 ease-organic cursor-pointer pointer-events-auto"
            >
              <path
                d="M0 23.2817C1 20.1417 3.25 17.5717 5.59 15.2617C9.48 11.4117 13.8 8.01173 18.45 5.14173C22.33 2.74173 26.53 0.681729 31.06 0.131729C35.58 -0.418271 40.49 0.731729 43.67 4.00173C46.52 6.92173 47.65 11.1017 48.21 15.1417C49.21 22.3917 48.73 29.7617 48.8 37.0817C48.83 40.4817 48.92 44.1017 47.12 46.9817C45.15 50.1217 41.4 51.6017 37.85 52.6617C35.27 53.4417 32.62 54.1117 29.93 54.0717C21.73 53.9317 15.18 47.3717 10.16 40.8817C8.1 38.2151 6.13 35.4851 4.25 32.6917C1.95 29.2817 0.11 27.3917 0 23.2817Z"
                fill="url(#pebble-grad)"
              />
            </svg>

            {/* Upper Middle Pebble (forma-2 - White) */}
            <img
              src="/images/forma-2.svg"
              className="absolute bottom-[313px] left-[40px] lg:left-[50px] w-[180px] h-[60px] object-contain opacity-95 filter drop-shadow-[0_12px_36px_rgba(71,73,168,0.08)] hover:scale-105 hover:-translate-y-1 transition-all duration-700 ease-organic cursor-pointer pointer-events-auto"
              alt="Pedra de equilíbrio"
            />

            {/* Lower Middle Pebble (forma-1 - Brand Gradient) */}
            <svg
              viewBox="0 0 109 101"
              className="absolute bottom-[123px] left-[15px] lg:left-[20px] w-[210px] h-[195px] filter drop-shadow-[0_12px_36px_rgba(71,73,168,0.22)] hover:scale-105 hover:-translate-y-1 transition-all duration-700 ease-organic cursor-pointer pointer-events-auto"
            >
              <defs>
                <linearGradient id="pebble-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#DCD4F0" />
                  <stop offset="25%" stopColor="#B8B9E5" />
                  <stop offset="65%" stopColor="#F2A8C5" />
                  <stop offset="100%" stopColor="#FBC85E" />
                </linearGradient>
              </defs>
              <path
                d="M30.5034 17.5701C21.9734 23.1901 13.4434 29.2001 7.39343 37.4201C1.34343 45.6501 -1.92657 56.5501 1.21343 66.2601C4.64343 76.8901 14.7334 83.8701 24.7934 88.7101C34.9834 93.6001 45.8234 97.1401 56.9334 99.2101C68.4534 101.34 81.2734 101.63 90.8634 94.9001C99.2134 89.0401 103.513 78.9601 105.993 69.0701C108.783 57.9201 109.783 46.1401 107.293 34.9101C104.813 23.6901 98.6134 13.0501 89.1134 6.57012C78.1634 -0.909876 63.2134 -2.10988 51.2034 3.52012C50.1134 4.04012 32.5034 15.9701 30.5034 17.5701Z"
                fill="url(#pebble-grad)"
              />
            </svg>

            {/* Base Pebble (forma-3 - White) */}
            <img
              src="/images/forma-3.svg"
              className="absolute bottom-0 left-[35px] lg:left-[45px] w-[240px] h-[128px] object-contain opacity-95 filter drop-shadow-[0_12px_36px_rgba(71,73,168,0.08)] hover:scale-105 hover:-translate-y-1 transition-all duration-700 ease-organic cursor-pointer pointer-events-auto"
              alt="Pedra de equilíbrio"
            />
          </div>

          {/* SVG ClipPath Definition for Full Height Mask */}
          <svg width="0" height="0" className="absolute">
            <defs>
              <clipPath id="welcome-full-height-mask" clipPathUnits="objectBoundingBox">
                <path d="M 0.48 0 C 0.28 0.05, 0.15 0.25, 0.22 0.5 C 0.28 0.7, 0.12 0.85, 0.22 1 L 1 1 L 1 0 Z" />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
    </div>

    <LoginSheet open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  )
}
