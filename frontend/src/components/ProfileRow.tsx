import type { ReactNode } from 'react'

export interface ProfileRowProps {
  children: ReactNode
  className?: string
}

export function ProfileRow({ children, className = '' }: ProfileRowProps) {
  return (
    <div
      className={`flex items-center gap-4 rounded-lg border border-border bg-surface p-5 ${className}`}
    >
      {children}
    </div>
  )
}
