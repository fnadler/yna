export interface Professional {
  id: string
  name: string
  crp: string
  approach: string
  approachLong: string
  specialties: string[]
  nextSlot: string
  videoLength: string
  whyThisMatch: string
  initials: string
  palette: 'lavender' | 'pink' | 'yellow'
  bio: string
  formation: string[]
  yearsExp: number
  sessionDuration: number
}

export type Specialty = 'saude-mental' | 'nutricao' | 'fisioterapia'

export interface Session {
  id: string
  professionalId: string
  professional: string
  professionalInitials: string
  professionalPalette: 'lavender' | 'pink' | 'yellow'
  weekday: string
  date: string
  time: string
  status: 'scheduled' | 'completed' | 'cancelled'
  roomLink: string
  specialty?: Specialty
  startTime?: string
  endTime?: string
  durationMin?: number
  monthGroup?: string
}

export interface TriagemQuestion {
  number: number
  total: number
  kind: 'closed' | 'open'
  intro?: string
  question: string
  highlight?: string
  options?: string[]
  selectedIndex?: number
  placeholder?: string
  helper?: string
}

export interface WheelOfLife {
  labels: string[]
  values: number[]
  previousValues?: number[]
  updatedAt: string
}

export interface CheckInConfig {
  cadence: 'daily' | 'weekly' | 'custom' | 'off'
  mode: 'nina' | 'form'
  customDays?: number[]
  customTime?: string
}

export interface UserProfile {
  id: string
  name: string
  nickname: string
  email: string
  company: string
  department: string
  hasConsented: boolean
  hasCompletedProfile: boolean
  hasCompletedTriagem: boolean
  hasMatches: boolean
  currentProfessionalId: string | null
}

export interface NinaMessage {
  id: string
  role: 'nina' | 'user'
  content: string
  timestamp: string
  isRisk?: boolean
}

export interface Achievement {
  id: string
  title: string
  description: string
  earnedAt: string
  icon: string
}
