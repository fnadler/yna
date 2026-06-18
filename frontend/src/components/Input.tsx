import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
  suffix?: ReactNode
}

export function Input({ label, hint, error, suffix, className = '', id, ...rest }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={inputId}
          className={`min-h-[44px] w-full rounded border-[1.5px] border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted hover:border-border-strong focus:border-primary focus:shadow-[0_0_0_4px_rgba(71,73,168,0.12)] disabled:opacity-50 ${
            error ? 'border-danger focus:border-danger focus:shadow-[0_0_0_4px_rgba(215,90,110,0.12)]' : ''
          } ${suffix ? 'pr-12' : ''} ${className}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...rest}
        />
        {suffix && (
          <div className="absolute right-3 flex items-center text-ink-muted">{suffix}</div>
        )}
      </div>
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
