export interface AvatarProps {
  /** Iniciais exibidas no avatar (placeholder sem imagem externa). */
  initials: string
  size?: number
  /** Par de cores do design system para variar entre profissionais. */
  palette?: 'lavender' | 'pink' | 'yellow'
  className?: string
}

const palettes = {
  lavender: { bg: '#DCD4F0', fg: '#3A3C8E' },
  pink: { bg: '#FBE2EC', fg: '#9C3D5C' },
  yellow: { bg: '#FDEEC8', fg: '#8A5C14' },
}

/** Avatar SVG inline — sem referência a arquivos de imagem externos. */
export function Avatar({ initials, size = 48, palette = 'lavender', className = '' }: AvatarProps) {
  const { bg, fg } = palettes[palette]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label={`Avatar de ${initials}`}
      className={`shrink-0 rounded-pill ${className}`}
    >
      <circle cx="24" cy="24" r="24" fill={bg} />
      <circle cx="24" cy="18.5" r="7.5" fill={fg} opacity="0.28" />
      <path d="M8 44c2.5-9 9-13 16-13s13.5 4 16 13" fill={fg} opacity="0.28" />
      <text
        x="24"
        y="29"
        textAnchor="middle"
        fontFamily="Inter Variable, Inter, sans-serif"
        fontSize="15"
        fontWeight="700"
        fill={fg}
      >
        {initials}
      </text>
    </svg>
  )
}
