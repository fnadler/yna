/* Seleção múltipla em chips (pílulas). Usado no cadastro e no perfil do profissional. */
export function Chips({
  options,
  selected,
  onToggle,
}: {
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            aria-pressed={active}
            className={`rounded-pill border-[1.5px] px-3.5 py-2 font-heading text-[13px] font-medium transition-colors ${
              active
                ? 'border-primary bg-primary-50 text-primary dark:text-primary-300'
                : 'border-border bg-surface text-ink-secondary hover:border-border-strong hover:text-ink'
            }`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}
