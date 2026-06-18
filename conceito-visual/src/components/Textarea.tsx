import type { TextareaHTMLAttributes } from 'react'

export function Textarea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`min-h-[140px] w-full resize-y rounded border-[1.5px] border-border bg-surface px-4 py-3 font-sans text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-ink-muted hover:border-border-strong focus:border-primary focus:shadow-[0_0_0_4px_rgba(71,73,168,0.12)] ${className}`}
      {...rest}
    />
  )
}
