import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { RadarChart } from '../components/RadarChart'
import { wheelOfLife } from '../data/mock'

const LABELS = wheelOfLife.labels

export function Ben10RodaDaVida() {
  const [values, setValues] = useState<number[]>(LABELS.map(() => 5))
  const navigate = useNavigate()

  const update = (i: number, v: number) =>
    setValues((prev) => prev.map((val, idx) => (idx === i ? v : val)))

  return (
    <div className="flex min-h-dvh flex-col px-5 pt-12 pb-8">
      <div className="mb-6">
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          Opcional · Roda da Vida
        </p>
        <h1 className="mt-1 text-[24px] font-light leading-[1.2] tracking-[-0.02em] text-ink">
          Como está cada área da <span className="font-semibold text-primary dark:text-primary-300">sua vida?</span>
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          Deslize os valores de 1 a 10. Serve como ponto de partida: você verá a evolução ao longo do tempo.
        </p>
      </div>

      <div className="flex justify-center py-4">
        <RadarChart values={values} labels={LABELS} size={220} />
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {LABELS.map((label, i) => (
          <div key={label} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">{label}</span>
              <span className="font-mono text-sm font-semibold text-primary dark:text-primary-300">
                {values[i]}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={values[i]}
              onChange={(e) => update(i, parseInt(e.target.value, 10))}
              aria-label={`${label}: ${values[i]} de 10`}
              className="h-2 w-full cursor-pointer appearance-none rounded-pill bg-surface-2 accent-primary"
            />
          </div>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-2 pt-8">
        <Button size="lg" fullWidth iconRight="ph:arrow-right-bold" onClick={() => navigate('/matches/carregando')}>
          Salvar e ver meus matches
        </Button>
        <Button variant="ghost" fullWidth onClick={() => navigate('/matches/carregando')}>
          Pular por agora
        </Button>
      </div>
    </div>
  )
}
