/**
 * SVG illustrations for onboarding panels.
 * All use preserveAspectRatio="xMidYMid slice" to fill the panel without distortion.
 * Palette: indigo #4749A8, accent teal #6FC4A8, accent rose #E066A0.
 */

// ─── Sigilo / LGPD ──────────────────────────────────────────────────────────
export function IllustrationSigilo() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 600"
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="sig-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#18195A" />
          <stop offset="100%" stopColor="#4749A8" />
        </linearGradient>
        <radialGradient id="sig-glow" cx="50%" cy="55%" r="45%">
          <stop offset="0%" stopColor="#8B8ED6" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#4749A8" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="600" fill="url(#sig-bg)" />
      <ellipse cx="200" cy="330" rx="175" ry="175" fill="url(#sig-glow)" />

      {/* Decorative rings */}
      <circle cx="200" cy="320" r="150" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <circle cx="200" cy="320" r="110" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />

      {/* Shield */}
      <path
        d="M200 165 L295 213 L295 318 Q295 402 200 442 Q105 402 105 318 L105 213 Z"
        fill="rgba(255,255,255,0.09)"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="1.5"
      />

      {/* Lock body */}
      <rect x="172" y="290" width="56" height="46" rx="9" fill="rgba(255,255,255,0.88)" />
      {/* Lock shackle */}
      <path
        d="M184 290 L184 273 Q184 256 200 256 Q216 256 216 273 L216 290"
        fill="none"
        stroke="rgba(255,255,255,0.88)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Keyhole */}
      <circle cx="200" cy="308" r="6" fill="#3B3D8E" />
      <rect x="197" y="314" width="6" height="12" rx="2" fill="#3B3D8E" />

      {/* Accent blobs */}
      <circle cx="358" cy="185" r="58" fill="rgba(139,142,214,0.1)" />
      <circle cx="42" cy="152" r="40" fill="rgba(139,142,214,0.08)" />

      {/* Scattered dots */}
      <circle cx="55" cy="82" r="4" fill="rgba(255,255,255,0.24)" />
      <circle cx="82" cy="55" r="2.5" fill="rgba(255,255,255,0.16)" />
      <circle cx="36" cy="122" r="3" fill="rgba(255,255,255,0.14)" />
      <circle cx="342" cy="92" r="4" fill="rgba(255,255,255,0.2)" />
      <circle cx="370" cy="65" r="2.5" fill="rgba(255,255,255,0.16)" />
      <circle cx="356" cy="142" r="3" fill="rgba(255,255,255,0.12)" />
      <circle cx="64" cy="488" r="5" fill="rgba(255,255,255,0.1)" />
      <circle cx="98" cy="532" r="3" fill="rgba(255,255,255,0.07)" />
      <circle cx="338" cy="498" r="5" fill="rgba(255,255,255,0.1)" />
      <circle cx="368" cy="542" r="3" fill="rgba(255,255,255,0.07)" />

      {/* Bottom wave */}
      <path
        d="M0 545 Q100 512 200 538 Q300 560 400 528 L400 600 L0 600 Z"
        fill="rgba(255,255,255,0.04)"
      />
    </svg>
  )
}

// ─── Cadastro / Boas-vindas ──────────────────────────────────────────────────
export function IllustrationCadastro() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 600"
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="cad-bg" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#2A1F6A" />
          <stop offset="100%" stopColor="#6B5CE7" />
        </linearGradient>
        <radialGradient id="cad-glow" cx="50%" cy="48%" r="40%">
          <stop offset="0%" stopColor="#A89FE8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#6B5CE7" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="600" fill="url(#cad-bg)" />
      <ellipse cx="200" cy="290" rx="160" ry="160" fill="url(#cad-glow)" />

      {/* Abstract person: head */}
      <circle cx="200" cy="210" r="52" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />
      <circle cx="200" cy="210" r="36" fill="rgba(255,255,255,0.18)" />

      {/* Shoulders / body */}
      <path
        d="M118 310 Q118 260 200 260 Q282 260 282 310 Q282 360 200 365 Q118 360 118 310 Z"
        fill="rgba(255,255,255,0.1)"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1.5"
      />

      {/* Sparkles */}
      <path d="M78 165 L81 158 L84 165 L91 168 L84 171 L81 178 L78 171 L71 168 Z" fill="rgba(255,255,255,0.5)" />
      <path d="M316 200 L318 195 L320 200 L325 202 L320 204 L318 209 L316 204 L311 202 Z" fill="rgba(255,255,255,0.4)" />
      <path d="M95 390 L97 385 L99 390 L104 392 L99 394 L97 399 L95 394 L90 392 Z" fill="rgba(255,255,255,0.3)" />
      <path d="M298 135 L300 128 L302 135 L309 138 L302 141 L300 148 L298 141 L291 138 Z" fill="rgba(255,255,255,0.35)" />
      <circle cx="58" cy="280" r="4" fill="rgba(255,255,255,0.25)" />
      <circle cx="340" cy="310" r="3.5" fill="rgba(255,255,255,0.2)" />
      <circle cx="155" cy="135" r="3" fill="rgba(255,255,255,0.3)" />
      <circle cx="258" cy="420" r="3.5" fill="rgba(255,255,255,0.2)" />

      {/* Accent teal dot ring */}
      <circle cx="200" cy="210" r="68" fill="none" stroke="rgba(111,196,168,0.25)" strokeWidth="1" strokeDasharray="4 8" />

      {/* Bottom wave */}
      <path
        d="M0 545 Q100 515 200 540 Q300 565 400 535 L400 600 L0 600 Z"
        fill="rgba(255,255,255,0.04)"
      />

      {/* Scattered dots */}
      <circle cx="48" cy="75" r="3.5" fill="rgba(255,255,255,0.22)" />
      <circle cx="350" cy="90" r="3" fill="rgba(255,255,255,0.18)" />
      <circle cx="370" cy="460" r="4" fill="rgba(255,255,255,0.12)" />
      <circle cx="30" cy="440" r="3" fill="rgba(255,255,255,0.12)" />
    </svg>
  )
}

// ─── Triagem / Reflexão ──────────────────────────────────────────────────────
export function IllustrationTriagem() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 600"
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="tri-bg" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#12305A" />
          <stop offset="100%" stopColor="#2C5282" />
        </linearGradient>
        <radialGradient id="tri-glow" cx="50%" cy="48%" r="42%">
          <stop offset="0%" stopColor="#6FC4A8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#2C5282" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="600" fill="url(#tri-bg)" />
      <ellipse cx="200" cy="290" rx="165" ry="165" fill="url(#tri-glow)" />

      {/* Concentric rings (ripples of reflection) */}
      <circle cx="200" cy="285" r="148" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      <circle cx="200" cy="285" r="115" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <circle cx="200" cy="285" r="82" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />

      {/* Speech bubble */}
      <path
        d="M125 190 Q125 140 200 140 Q275 140 275 190 L275 270 Q275 320 200 320 L162 320 L148 352 L158 320 Q125 320 125 270 Z"
        fill="rgba(255,255,255,0.1)"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Heart inside bubble */}
      <path
        d="M200 258 C200 258 172 240 172 222 C172 210 182 204 200 216 C218 204 228 210 228 222 C228 240 200 258 200 258 Z"
        fill="rgba(224,102,160,0.7)"
      />

      {/* Three dots (typing indicator inside bubble) */}
      <circle cx="183" cy="285" r="4" fill="rgba(255,255,255,0.45)" />
      <circle cx="200" cy="285" r="4" fill="rgba(255,255,255,0.45)" />
      <circle cx="217" cy="285" r="4" fill="rgba(255,255,255,0.45)" />

      {/* Scattered dots */}
      <circle cx="58" cy="80" r="3.5" fill="rgba(255,255,255,0.22)" />
      <circle cx="88" cy="52" r="2.5" fill="rgba(255,255,255,0.15)" />
      <circle cx="342" cy="88" r="3.5" fill="rgba(255,255,255,0.2)" />
      <circle cx="368" cy="58" r="2.5" fill="rgba(255,255,255,0.14)" />
      <circle cx="55" cy="478" r="4.5" fill="rgba(255,255,255,0.1)" />
      <circle cx="345" cy="490" r="4" fill="rgba(255,255,255,0.1)" />

      {/* Teal accent */}
      <circle cx="330" cy="170" r="42" fill="rgba(111,196,168,0.12)" />
      <circle cx="70" cy="420" r="32" fill="rgba(111,196,168,0.08)" />

      {/* Bottom wave */}
      <path
        d="M0 548 Q100 518 200 542 Q300 564 400 532 L400 600 L0 600 Z"
        fill="rgba(255,255,255,0.04)"
      />
    </svg>
  )
}

// ─── Profissional / Perfil ───────────────────────────────────────────────────
export function IllustrationPerfil() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 600"
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="per-bg" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#1C1D5E" />
          <stop offset="100%" stopColor="#4749A8" />
        </linearGradient>
        <radialGradient id="per-glow" cx="50%" cy="45%" r="38%">
          <stop offset="0%" stopColor="#8B8ED6" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#4749A8" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="600" fill="url(#per-bg)" />
      <ellipse cx="200" cy="270" rx="160" ry="160" fill="url(#per-glow)" />

      {/* Decorative frame rings */}
      <circle cx="200" cy="265" r="145" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <circle cx="200" cy="265" r="115" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />

      {/* Avatar circle */}
      <circle cx="200" cy="248" r="82" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />
      {/* Avatar head */}
      <circle cx="200" cy="230" r="34" fill="rgba(255,255,255,0.55)" />
      {/* Avatar shoulders */}
      <ellipse cx="200" cy="288" rx="52" ry="28" fill="rgba(255,255,255,0.45)" />

      {/* Verified badge */}
      <circle cx="258" cy="308" r="22" fill="#4749A8" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" />
      {/* Checkmark in badge */}
      <path
        d="M248 309 L255 317 L268 300"
        fill="none"
        stroke="rgba(255,255,255,0.95)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dashed orbit */}
      <circle cx="200" cy="248" r="105" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5 10" />

      {/* Scattered dots */}
      <circle cx="50" cy="78" r="4" fill="rgba(255,255,255,0.22)" />
      <circle cx="80" cy="52" r="2.5" fill="rgba(255,255,255,0.16)" />
      <circle cx="345" cy="95" r="4" fill="rgba(255,255,255,0.2)" />
      <circle cx="370" cy="65" r="2.5" fill="rgba(255,255,255,0.14)" />
      <circle cx="60" cy="485" r="4.5" fill="rgba(255,255,255,0.1)" />
      <circle cx="340" cy="500" r="4" fill="rgba(255,255,255,0.1)" />

      {/* Accent corner blobs */}
      <circle cx="355" cy="175" r="55" fill="rgba(111,196,168,0.1)" />
      <circle cx="45" cy="165" r="38" fill="rgba(139,142,214,0.1)" />

      {/* Bottom wave */}
      <path
        d="M0 546 Q100 518 200 540 Q300 562 400 530 L400 600 L0 600 Z"
        fill="rgba(255,255,255,0.04)"
      />
    </svg>
  )
}

// ─── Agendamento / Calendário ────────────────────────────────────────────────
export function IllustrationAgendamento() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 600"
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="age-bg" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#1A1B5C" />
          <stop offset="100%" stopColor="#4749A8" />
        </linearGradient>
        <radialGradient id="age-glow" cx="50%" cy="50%" r="42%">
          <stop offset="0%" stopColor="#7B7ED6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#4749A8" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="600" fill="url(#age-bg)" />
      <ellipse cx="200" cy="300" rx="165" ry="165" fill="url(#age-glow)" />

      {/* Calendar card */}
      <rect x="110" y="180" width="180" height="190" rx="16" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      {/* Calendar header */}
      <rect x="110" y="180" width="180" height="46" rx="16" fill="rgba(255,255,255,0.15)" />
      {/* Calendar top corners: flat bottom */}
      <rect x="110" y="205" width="180" height="21" fill="rgba(255,255,255,0.15)" />

      {/* Month label */}
      <rect x="148" y="194" width="70" height="10" rx="5" fill="rgba(255,255,255,0.55)" />
      {/* Nav arrows */}
      <path d="M125 199 L132 194 L132 204 Z" fill="rgba(255,255,255,0.4)" />
      <path d="M275 199 L268 194 L268 204 Z" fill="rgba(255,255,255,0.4)" />

      {/* Grid lines */}
      {[0, 1, 2, 3, 4].map((row) => (
        <line key={`row-${row}`} x1="118" y1={240 + row * 26} x2="282" y2={240 + row * 26} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      ))}
      {[0, 1, 2, 3, 4, 5, 6].map((col) => (
        <line key={`col-${col}`} x1={118 + col * 27} y1="240" x2={118 + col * 27} y2={240 + 4 * 26} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      ))}

      {/* Day dots */}
      {[0, 1, 2, 3, 4, 5, 6].map((c) =>
        [0, 1, 2, 3].map((r) => (
          <circle
            key={`d-${c}-${r}`}
            cx={131 + c * 27}
            cy={253 + r * 26}
            r="7"
            fill={c === 3 && r === 1 ? 'rgba(111,196,168,0.8)' : 'rgba(255,255,255,0.12)'}
          />
        ))
      )}

      {/* Clock arc */}
      <circle cx="200" cy="440" r="46" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
      <path d="M200 440 L200 410" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M200 440 L220 452" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="200" cy="440" r="4" fill="rgba(255,255,255,0.7)" />

      {/* Scattered dots */}
      <circle cx="52" cy="80" r="3.5" fill="rgba(255,255,255,0.22)" />
      <circle cx="82" cy="54" r="2.5" fill="rgba(255,255,255,0.15)" />
      <circle cx="342" cy="90" r="3.5" fill="rgba(255,255,255,0.2)" />
      <circle cx="368" cy="62" r="2.5" fill="rgba(255,255,255,0.14)" />
      <circle cx="58" cy="490" r="4.5" fill="rgba(255,255,255,0.1)" />
      <circle cx="342" cy="502" r="4" fill="rgba(255,255,255,0.1)" />

      {/* Bottom wave */}
      <path d="M0 548 Q100 518 200 542 Q300 565 400 533 L400 600 L0 600 Z" fill="rgba(255,255,255,0.04)" />
    </svg>
  )
}

// ─── Confirmação / Celebração ────────────────────────────────────────────────
export function IllustrationConfirmacao() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 600"
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="con-bg" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#0F4A38" />
          <stop offset="100%" stopColor="#1E7A5A" />
        </linearGradient>
        <radialGradient id="con-glow" cx="50%" cy="50%" r="40%">
          <stop offset="0%" stopColor="#6FC4A8" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#1E7A5A" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="600" fill="url(#con-bg)" />
      <ellipse cx="200" cy="300" rx="165" ry="165" fill="url(#con-glow)" />

      {/* Checkmark circle */}
      <circle cx="200" cy="278" r="88" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      {/* Checkmark */}
      <path
        d="M158 278 L185 308 L244 245"
        fill="none"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Confetti */}
      <rect x="88" y="165" width="10" height="10" rx="2" fill="rgba(255,255,255,0.4)" transform="rotate(25 93 170)" />
      <rect x="296" y="158" width="8" height="8" rx="2" fill="rgba(224,102,160,0.5)" transform="rotate(-18 300 162)" />
      <rect x="130" y="395" width="9" height="9" rx="2" fill="rgba(255,255,255,0.3)" transform="rotate(40 135 400)" />
      <rect x="256" y="388" width="10" height="10" rx="2" fill="rgba(111,196,168,0.5)" transform="rotate(-30 261 393)" />
      <rect x="68" y="345" width="7" height="7" rx="1.5" fill="rgba(255,255,255,0.25)" transform="rotate(60 72 349)" />
      <rect x="318" y="340" width="7" height="7" rx="1.5" fill="rgba(224,102,160,0.4)" transform="rotate(-45 322 344)" />

      {/* Sparkles */}
      <path d="M78 220 L81 212 L84 220 L92 223 L84 226 L81 234 L78 226 L70 223 Z" fill="rgba(255,255,255,0.5)" />
      <path d="M318 195 L320 189 L322 195 L328 197 L322 199 L320 205 L318 199 L312 197 Z" fill="rgba(255,255,255,0.4)" />
      <path d="M96 410 L98 404 L100 410 L106 412 L100 414 L98 420 L96 414 L90 412 Z" fill="rgba(255,255,255,0.35)" />
      <path d="M302 415 L304 409 L306 415 L312 417 L306 419 L304 425 L302 419 L296 417 Z" fill="rgba(255,255,255,0.35)" />

      {/* Scattered dots */}
      <circle cx="50" cy="78" r="3.5" fill="rgba(255,255,255,0.22)" />
      <circle cx="350" cy="88" r="3.5" fill="rgba(255,255,255,0.2)" />
      <circle cx="58" cy="490" r="4.5" fill="rgba(255,255,255,0.1)" />
      <circle cx="342" cy="498" r="4" fill="rgba(255,255,255,0.1)" />

      <path d="M0 548 Q100 518 200 542 Q300 564 400 530 L400 600 L0 600 Z" fill="rgba(255,255,255,0.04)" />
    </svg>
  )
}

// ─── Pré-sessão / Tecnologia ─────────────────────────────────────────────────
export function IllustrationPreSessao() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 600"
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="pre-bg" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#0E0D2A" />
          <stop offset="100%" stopColor="#2D2F7A" />
        </linearGradient>
        <radialGradient id="pre-glow" cx="50%" cy="50%" r="42%">
          <stop offset="0%" stopColor="#6B68D6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#2D2F7A" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="600" fill="url(#pre-bg)" />
      <ellipse cx="200" cy="300" rx="165" ry="165" fill="url(#pre-glow)" />

      {/* Monitor/screen */}
      <rect x="118" y="210" width="164" height="108" rx="12" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
      {/* Screen inner (content area) */}
      <rect x="128" y="220" width="144" height="88" rx="7" fill="rgba(111,196,168,0.18)" />
      {/* Play button on screen */}
      <circle cx="200" cy="264" r="24" fill="rgba(255,255,255,0.18)" />
      <path d="M195 256 L212 264 L195 272 Z" fill="rgba(255,255,255,0.75)" />
      {/* Stand */}
      <rect x="188" y="318" width="24" height="18" rx="4" fill="rgba(255,255,255,0.12)" />
      <rect x="172" y="336" width="56" height="7" rx="3.5" fill="rgba(255,255,255,0.15)" />

      {/* Signal arcs */}
      <path d="M200 390 Q200 370 200 370" stroke="rgba(111,196,168,0.5)" strokeWidth="0" />
      <path d="M172 408 Q186 378 200 372 Q214 378 228 408" fill="none" stroke="rgba(111,196,168,0.35)" strokeWidth="2" strokeLinecap="round" />
      <path d="M152 428 Q174 382 200 372 Q226 382 248 428" fill="none" stroke="rgba(111,196,168,0.25)" strokeWidth="2" strokeLinecap="round" />
      <path d="M132 448 Q162 386 200 372 Q238 386 268 448" fill="none" stroke="rgba(111,196,168,0.15)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="200" cy="372" r="4.5" fill="rgba(111,196,168,0.6)" />

      {/* Two person bubbles on sides */}
      <circle cx="95" cy="268" r="28" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <circle cx="95" cy="260" r="10" fill="rgba(255,255,255,0.3)" />
      <ellipse cx="95" cy="281" rx="16" ry="8" fill="rgba(255,255,255,0.22)" />

      <circle cx="305" cy="268" r="28" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <circle cx="305" cy="260" r="10" fill="rgba(255,255,255,0.3)" />
      <ellipse cx="305" cy="281" rx="16" ry="8" fill="rgba(255,255,255,0.22)" />

      {/* Scattered dots */}
      <circle cx="52" cy="80" r="3.5" fill="rgba(255,255,255,0.22)" />
      <circle cx="82" cy="55" r="2.5" fill="rgba(255,255,255,0.15)" />
      <circle cx="344" cy="88" r="3.5" fill="rgba(255,255,255,0.2)" />
      <circle cx="370" cy="60" r="2.5" fill="rgba(255,255,255,0.14)" />
      <circle cx="58" cy="490" r="4.5" fill="rgba(255,255,255,0.1)" />
      <circle cx="342" cy="500" r="4" fill="rgba(255,255,255,0.1)" />

      <path d="M0 546 Q100 516 200 540 Q300 562 400 530 L400 600 L0 600 Z" fill="rgba(255,255,255,0.04)" />
    </svg>
  )
}

// ─── Feedback / Reflexão pós-sessão ─────────────────────────────────────────
export function IllustrationFeedback() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 600"
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="fb-bg" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#3A1255" />
          <stop offset="100%" stopColor="#7B3FA0" />
        </linearGradient>
        <radialGradient id="fb-glow" cx="50%" cy="48%" r="42%">
          <stop offset="0%" stopColor="#E066A0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#7B3FA0" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="600" fill="url(#fb-bg)" />
      <ellipse cx="200" cy="285" rx="165" ry="165" fill="url(#fb-glow)" />

      {/* Ripple rings */}
      <circle cx="200" cy="285" r="148" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      <circle cx="200" cy="285" r="115" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <circle cx="200" cy="285" r="82" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />

      {/* Heart */}
      <path
        d="M200 320 C200 320 122 274 122 218 C122 188 144 172 200 204 C256 172 278 188 278 218 C278 274 200 320 200 320 Z"
        fill="rgba(224,102,160,0.75)"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1.5"
      />
      {/* Heart inner highlight */}
      <path
        d="M165 208 C165 196 174 190 188 198"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Five-star row */}
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={`star-${i}`}
          d={`M${126 + i * 37} 385 L${130 + i * 37} 374 L${134 + i * 37} 385 L${146 + i * 37} 385 L${137 + i * 37} 391 L${141 + i * 37} 403 L${130 + i * 37} 396 L${119 + i * 37} 403 L${123 + i * 37} 391 L${114 + i * 37} 385 Z`}
          fill={i < 4 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)'}
        />
      ))}

      {/* Scattered dots */}
      <circle cx="52" cy="80" r="3.5" fill="rgba(255,255,255,0.25)" />
      <circle cx="82" cy="55" r="2.5" fill="rgba(255,255,255,0.18)" />
      <circle cx="342" cy="88" r="3.5" fill="rgba(255,255,255,0.22)" />
      <circle cx="368" cy="60" r="2.5" fill="rgba(255,255,255,0.16)" />
      <circle cx="58" cy="490" r="4.5" fill="rgba(255,255,255,0.1)" />
      <circle cx="342" cy="500" r="4" fill="rgba(255,255,255,0.1)" />

      {/* Small sparkles */}
      <path d="M78 185 L81 178 L84 185 L91 188 L84 191 L81 198 L78 191 L71 188 Z" fill="rgba(255,255,255,0.45)" />
      <path d="M312 168 L314 163 L316 168 L321 170 L316 172 L314 177 L312 172 L307 170 Z" fill="rgba(255,255,255,0.35)" />

      <path d="M0 546 Q100 515 200 540 Q300 562 400 530 L400 600 L0 600 Z" fill="rgba(255,255,255,0.04)" />
    </svg>
  )
}

// ─── Decisão pós-sessão ──────────────────────────────────────────────────────
export function IllustrationDecisao() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 600"
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="dec-bg" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#1A1B5C" />
          <stop offset="100%" stopColor="#4749A8" />
        </linearGradient>
        <radialGradient id="dec-glow" cx="50%" cy="50%" r="44%">
          <stop offset="0%" stopColor="#8B8ED6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#4749A8" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="600" fill="url(#dec-bg)" />
      <ellipse cx="200" cy="300" rx="165" ry="165" fill="url(#dec-glow)" />

      {/* Fork in the road motif */}
      {/* Main stem */}
      <line x1="200" y1="390" x2="200" y2="300" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" />
      {/* Left path */}
      <path d="M200 300 Q160 265 130 220" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="3" strokeLinecap="round" />
      {/* Right path */}
      <path d="M200 300 Q240 265 270 220" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="3" strokeLinecap="round" />

      {/* Left circle (continue) */}
      <circle cx="122" cy="202" r="38" fill="rgba(111,196,168,0.2)" stroke="rgba(111,196,168,0.5)" strokeWidth="1.5" />
      <path d="M108 202 L118 214 L138 188" fill="none" stroke="rgba(111,196,168,0.85)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Right circle (explore) */}
      <circle cx="278" cy="202" r="38" fill="rgba(139,142,214,0.2)" stroke="rgba(139,142,214,0.45)" strokeWidth="1.5" />
      {/* Refresh/switch icon */}
      <path d="M266 195 Q270 185 280 185 Q290 185 293 192" fill="none" stroke="rgba(139,142,214,0.85)" strokeWidth="3" strokeLinecap="round" />
      <path d="M279 185 L271 193 L287 197 Z" fill="rgba(139,142,214,0.85)" />
      <path d="M266 209 Q262 219 272 219 Q282 219 285 212" fill="none" stroke="rgba(139,142,214,0.85)" strokeWidth="3" strokeLinecap="round" />

      {/* Person at the fork */}
      <circle cx="200" cy="410" r="20" fill="rgba(255,255,255,0.55)" />
      <ellipse cx="200" cy="438" rx="18" ry="10" fill="rgba(255,255,255,0.4)" />

      {/* Scattered dots */}
      <circle cx="52" cy="78" r="3.5" fill="rgba(255,255,255,0.22)" />
      <circle cx="82" cy="52" r="2.5" fill="rgba(255,255,255,0.16)" />
      <circle cx="342" cy="88" r="3.5" fill="rgba(255,255,255,0.2)" />
      <circle cx="368" cy="60" r="2.5" fill="rgba(255,255,255,0.14)" />
      <circle cx="58" cy="490" r="4.5" fill="rgba(255,255,255,0.1)" />
      <circle cx="342" cy="500" r="4" fill="rgba(255,255,255,0.1)" />

      <path d="M0 546 Q100 518 200 540 Q300 562 400 530 L400 600 L0 600 Z" fill="rgba(255,255,255,0.04)" />
    </svg>
  )
}

// ─── Boas-vindas / Splash ────────────────────────────────────────────────────
export function IllustrationBemVindo() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 600"
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="bv-bg" cx="50%" cy="55%" r="75%">
          <stop offset="0%" stopColor="#3D3F9A" />
          <stop offset="100%" stopColor="#0A0B20" />
        </radialGradient>
        <linearGradient id="bv-warm1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DCD4F0" />
          <stop offset="45%" stopColor="#F2A8C5" />
          <stop offset="100%" stopColor="#FBC85E" />
        </linearGradient>
        <linearGradient id="bv-warm2" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#B8B9E5" />
          <stop offset="55%" stopColor="#F2A8C5" />
          <stop offset="100%" stopColor="#FDE8C8" />
        </linearGradient>
        <radialGradient id="bv-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(108,111,194,0.55)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <filter id="bv-blur">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      <rect width="400" height="600" fill="url(#bv-bg)" />

      {/* Atmospheric glow */}
      <ellipse cx="200" cy="340" rx="200" ry="185" fill="url(#bv-glow)" filter="url(#bv-blur)" opacity="0.9" />

      {/* YNA brand pebble stack — bottom to top */}
      {/* Bottom blob: wide, flat, warm gradient */}
      <ellipse cx="200" cy="520" rx="128" ry="52" fill="url(#bv-warm1)" opacity="0.82" transform="rotate(-5 200 520)" />
      {/* Second blob: medium, warm gradient */}
      <ellipse cx="208" cy="428" rx="104" ry="75" fill="url(#bv-warm2)" opacity="0.76" transform="rotate(7 208 428)" />
      {/* Large central white blob */}
      <ellipse cx="198" cy="330" rx="92" ry="84" fill="white" opacity="0.87" />
      {/* Small top white blob */}
      <ellipse cx="194" cy="246" rx="48" ry="55" fill="white" opacity="0.78" transform="rotate(-6 194 246)" />

      {/* Ambient dots */}
      <circle cx="72" cy="148" r="2.5" fill="white" opacity="0.28" />
      <circle cx="336" cy="178" r="2" fill="white" opacity="0.22" />
      <circle cx="48" cy="412" r="2" fill="white" opacity="0.18" />
      <circle cx="358" cy="468" r="2.5" fill="white" opacity="0.15" />
      <circle cx="295" cy="115" r="1.5" fill="white" opacity="0.22" />
      <circle cx="112" cy="492" r="2" fill="white" opacity="0.16" />
    </svg>
  )
}

// ─── Propósito / Slide 1 ─────────────────────────────────────────────────────
export function IllustrationProposito() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 600"
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="prop-bg" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#1A1B5C" />
          <stop offset="100%" stopColor="#4749A8" />
        </linearGradient>
        <linearGradient id="prop-warm" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DCD4F0" />
          <stop offset="50%" stopColor="#F2A8C5" />
          <stop offset="100%" stopColor="#FDE8C8" />
        </linearGradient>
        <radialGradient id="prop-glow" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="rgba(184,185,229,0.42)" />
          <stop offset="100%" stopColor="rgba(71,73,168,0)" />
        </radialGradient>
        <filter id="prop-blur">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      <rect width="400" height="600" fill="url(#prop-bg)" />
      <ellipse cx="200" cy="310" rx="200" ry="180" fill="url(#prop-glow)" filter="url(#prop-blur)" opacity="0.8" />

      {/* Embrace arcs — suggest shelter */}
      <path d="M 88 440 Q 68 340 108 240 Q 130 180 175 162" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeLinecap="round" />
      <path d="M 312 440 Q 332 340 292 240 Q 270 180 225 162" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeLinecap="round" />

      {/* Dashed orbit ring */}
      <ellipse cx="200" cy="310" rx="138" ry="154" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" strokeDasharray="4 8" />

      {/* Central warm blob */}
      <ellipse cx="200" cy="312" rx="95" ry="110" fill="url(#prop-warm)" opacity="0.78" transform="rotate(2 200 312)" />
      {/* Inner glow */}
      <ellipse cx="200" cy="302" rx="55" ry="65" fill="white" opacity="0.20" />

      {/* Small accent blob above */}
      <ellipse cx="200" cy="178" rx="34" ry="30" fill="url(#prop-warm)" opacity="0.52" transform="rotate(-8 200 178)" />

      <circle cx="72" cy="148" r="2.5" fill="white" opacity="0.28" />
      <circle cx="336" cy="168" r="2" fill="white" opacity="0.22" />
      <circle cx="62" cy="442" r="2.5" fill="white" opacity="0.18" />
      <circle cx="345" cy="455" r="2" fill="white" opacity="0.18" />
    </svg>
  )
}

// ─── Oferta / Slide 2 ────────────────────────────────────────────────────────
export function IllustrationOferta() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 600"
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="of-bg" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#12305A" />
          <stop offset="100%" stopColor="#1E5A7A" />
        </linearGradient>
        <linearGradient id="of-blob1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B8B9E5" />
          <stop offset="100%" stopColor="#DCD4F0" />
        </linearGradient>
        <linearGradient id="of-blob2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4EAAA0" />
          <stop offset="100%" stopColor="#6FC4A8" />
        </linearGradient>
        <radialGradient id="of-glow" cx="50%" cy="52%" r="45%">
          <stop offset="0%" stopColor="rgba(111,196,168,0.35)" />
          <stop offset="100%" stopColor="rgba(18,48,90,0)" />
        </radialGradient>
        <filter id="of-blur">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      <rect width="400" height="600" fill="url(#of-bg)" />
      <ellipse cx="200" cy="310" rx="190" ry="170" fill="url(#of-glow)" filter="url(#of-blur)" />

      {/* Dashed orbit ring */}
      <ellipse cx="200" cy="310" rx="148" ry="160" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" strokeDasharray="3 10" />

      {/* Two connecting blobs — lavender (person) and teal (care) */}
      <ellipse cx="155" cy="308" rx="88" ry="108" fill="url(#of-blob1)" opacity="0.80" transform="rotate(-8 155 308)" />
      <ellipse cx="248" cy="320" rx="88" ry="108" fill="url(#of-blob2)" opacity="0.75" transform="rotate(8 248 320)" />
      {/* Glow at intersection */}
      <ellipse cx="200" cy="312" rx="48" ry="58" fill="white" opacity="0.14" />

      {/* Small stacked blobs above (harmony) */}
      <ellipse cx="200" cy="178" rx="28" ry="22" fill="url(#of-blob1)" opacity="0.50" transform="rotate(5 200 178)" />
      <ellipse cx="200" cy="156" rx="18" ry="15" fill="url(#of-blob2)" opacity="0.45" transform="rotate(-4 200 156)" />

      <circle cx="68" cy="140" r="2.5" fill="white" opacity="0.28" />
      <circle cx="340" cy="155" r="2" fill="white" opacity="0.22" />
      <circle cx="55" cy="455" r="2.5" fill="white" opacity="0.18" />
      <circle cx="352" cy="470" r="2" fill="white" opacity="0.18" />
    </svg>
  )
}

// ─── Jornada / Slide 3 ───────────────────────────────────────────────────────
export function IllustrationJornada() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 600"
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="jor-bg" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#0D0E2A" />
          <stop offset="55%" stopColor="#2A2C7A" />
          <stop offset="100%" stopColor="#6B3F80" />
        </linearGradient>
        <linearGradient id="jor-path" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="60%" stopColor="rgba(242,168,197,0.45)" />
          <stop offset="100%" stopColor="rgba(251,200,94,0.65)" />
        </linearGradient>
        <radialGradient id="jor-sunrise" cx="50%" cy="30%" r="45%">
          <stop offset="0%" stopColor="rgba(251,200,94,0.48)" />
          <stop offset="40%" stopColor="rgba(242,168,197,0.22)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <filter id="jor-blur">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>

      <rect width="400" height="600" fill="url(#jor-bg)" />

      {/* Warm sunrise glow at top */}
      <ellipse cx="200" cy="172" rx="200" ry="162" fill="url(#jor-sunrise)" filter="url(#jor-blur)" />

      {/* Winding path — ascends toward the light */}
      <path
        d="M 160 525 Q 190 450 210 382 Q 230 312 195 248 Q 172 198 200 148"
        fill="none"
        stroke="url(#jor-path)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Milestone blobs along the path */}
      <ellipse cx="162" cy="494" rx="22" ry="17" fill="rgba(139,142,214,0.45)" transform="rotate(-15 162 494)" />
      <ellipse cx="208" cy="358" rx="30" ry="25" fill="rgba(220,212,240,0.45)" transform="rotate(10 208 358)" />
      <ellipse cx="194" cy="228" rx="38" ry="32" fill="rgba(242,168,197,0.42)" transform="rotate(-5 194 228)" />

      {/* Destination: warm golden glow */}
      <circle cx="200" cy="152" r="8" fill="rgba(251,200,94,0.72)" />
      <circle cx="200" cy="152" r="22" fill="rgba(251,200,94,0.18)" />
      <circle cx="200" cy="152" r="42" fill="rgba(251,200,94,0.08)" />

      <circle cx="72" cy="88" r="2.5" fill="white" opacity="0.28" />
      <circle cx="335" cy="110" r="2" fill="white" opacity="0.22" />
      <circle cx="55" cy="390" r="2" fill="white" opacity="0.18" />
      <circle cx="352" cy="412" r="2.5" fill="white" opacity="0.15" />
      <circle cx="115" cy="195" r="1.5" fill="rgba(251,200,94,0.5)" />
      <circle cx="288" cy="208" r="1.5" fill="rgba(251,200,94,0.4)" />
    </svg>
  )
}
