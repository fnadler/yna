import type { ReactNode } from 'react'

export interface PhoneFrameProps {
  screenId: string
  screenName: string
  caption?: string
  children: ReactNode
}

/** Moldura de celular (~390px de largura útil) com rótulo ID + nome da tela. */
export function PhoneFrame({ screenId, screenName, caption, children }: PhoneFrameProps) {
  return (
    <figure className="flex w-[418px] shrink-0 flex-col items-center gap-4">
      <figcaption className="flex w-full flex-col gap-0.5 px-2">
        <span className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-primary dark:text-primary-300">
            {screenId}
          </span>
          <span className="text-sm font-semibold text-ink">{screenName}</span>
        </span>
        {caption && <span className="text-xs leading-snug text-ink-muted">{caption}</span>}
      </figcaption>
      <div className="rounded-[48px] border border-border-strong/60 bg-ink p-[10px] shadow-xl dark:bg-black">
        <div className="relative h-[820px] w-[390px] overflow-hidden rounded-[40px] bg-page">
          {children}
        </div>
      </div>
    </figure>
  )
}
