import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'

const MODULOS = [
  { id: 'm1', titulo: 'A proposta da YNA', desc: 'Missão, posicionamento e a persona Cora.', min: 6 },
  { id: 'm2', titulo: 'Usando a plataforma', desc: 'Agenda, sala de vídeo, prontuário e financeiro.', min: 8 },
  { id: 'm3', titulo: 'O que esperamos de você', desc: 'Postura, padrão Domus e conduta clínica online.', min: 7 },
  { id: 'm4', titulo: 'Plantão e emergências', desc: 'Como funciona o acionamento e o seu papel.', min: 5 },
  { id: 'm5', titulo: 'LGPD, CFP e sigilo', desc: 'Aspectos legais e proteção de dados.', min: 6 },
]

export function Pro06Integracao() {
  const navigate = useNavigate()
  const [done, setDone] = useState<string[]>([])
  const allDone = done.length === MODULOS.length

  const toggle = (id: string) =>
    setDone((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]))

  return (
    <section className="px-5 lg:px-0 pt-8 lg:pt-12 pb-10 animate-yna-slide-up">
      <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-primary dark:text-primary-300">Integração</p>
      <div className="mt-1 flex items-center gap-3">
        <h1 className="font-heading text-[24px] font-medium tracking-[-0.02em] text-ink">Trilha de integração</h1>
        {allDone && <Badge tone="success" icon="ph:seal-check-bold">Concluída</Badge>}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
        Conteúdos curtos para você começar com tudo combinado. Concluir a trilha ativa o seu perfil para análise.
      </p>

      <div className="mt-3 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-pill bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={MODULOS.length} aria-valuenow={done.length}>
          <div className="h-full rounded-pill bg-gradient-to-r from-primary to-pink transition-all duration-500" style={{ width: `${(done.length / MODULOS.length) * 100}%` }} />
        </div>
        <span className="font-mono text-xs text-ink-secondary">{done.length}/{MODULOS.length}</span>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {MODULOS.map((m) => {
          const isDone = done.includes(m.id)
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => toggle(m.id)}
              className={`flex items-center gap-3 rounded-lg border px-4 py-4 text-left transition-colors ${
                isDone ? 'border-success/30 bg-success-bg' : 'border-border bg-surface hover:bg-surface-hover'
              }`}
            >
              <Icon
                icon={isDone ? 'ph:check-circle-bold' : 'ph:play-circle-bold'}
                width={24}
                className={isDone ? 'shrink-0 text-success' : 'shrink-0 text-primary dark:text-primary-300'}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className={`font-heading text-sm font-semibold ${isDone ? 'text-success' : 'text-ink'}`}>{m.titulo}</p>
                <p className="mt-0.5 text-[13px] text-ink-secondary">{m.desc}</p>
              </div>
              <span className="shrink-0 font-mono text-xs text-ink-muted">{m.min} min</span>
            </button>
          )
        })}
      </div>

      <div className="mt-8">
        <Button size="lg" fullWidth disabled={!allDone} iconRight="ph:arrow-right-bold" onClick={() => navigate('/pro/status')}>
          {allDone ? 'Enviar para análise' : 'Conclua os módulos para continuar'}
        </Button>
      </div>
    </section>
  )
}
