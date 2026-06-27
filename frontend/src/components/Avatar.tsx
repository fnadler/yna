export interface AvatarProps {
  initials: string
  size?: number
  palette?: 'lavender' | 'pink' | 'yellow'
  className?: string
}

const palettes = {
  lavender: { bg: '#DCD4F0', fg: '#3A3C8E' },
  pink: { bg: '#FBE2EC', fg: '#9C3D5C' },
  yellow: { bg: '#FDEEC8', fg: '#8A5C14' },
}

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
      <text
        x="24"
        y="24"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Inter Variable, Inter, sans-serif"
        fontSize="16"
        fontWeight="700"
        fill={fg}
      >
        {initials}
      </text>
    </svg>
  )
}
