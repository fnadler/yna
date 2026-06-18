import type { ReactNode } from 'react'

interface Props {
  panel: ReactNode
  children: ReactNode
}

/**
 * Split layout for onboarding screens.
 * Mobile  : illustration on top (46vh), content scrolls below.
 * md+     : illustration fixed on the left (44%), content scrolls on the right.
 */
export function OnboardingSplit({ panel, children }: Props) {
  return (
    <div className="md:flex md:h-dvh md:overflow-hidden bg-yna-gradient-soft">
      {/* Illustration panel */}
      <div
        className="
          relative shrink-0 overflow-hidden md:overflow-visible bg-transparent
          h-[44vh] min-h-[220px] max-h-[340px] rounded-b-[28px]
          md:h-full md:min-h-0 md:max-h-none md:w-1/2 md:rounded-none
        "
      >
        {panel}
      </div>

      {/* Content pane */}
      <div className="flex flex-1 flex-col bg-transparent md:overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
