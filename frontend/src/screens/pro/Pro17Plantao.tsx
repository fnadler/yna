import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { ProTopBar } from '../../components/ProTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { PAGE_MAX_W } from '../../lib/layout'
import { proPlantaoShifts } from '../../data/proMock'

export function Pro17Plantao() {
  const navigate = useNavigate()
  const [disponivel, setDisponivel] = useState(true)
  const [shifts, setShifts] = useState(proPlantaoShifts.map((s) => ({ ...s })))

  const toggleShift = (id: string) =>
    setShifts((arr) => arr.map((s) => (s.id === id ? { ...s, ativo: !s.ativo } : s)))

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <ProTopBar />
        <PageHeader
          title="Plantão"
          subtitle="Ofereça turnos para atender emergências. É um cuidado a mais — e conta na sua trajetória."
          className="mt-2 lg:mt-0"
        />

        {/* Toggle geral */}
        <div className={`flex items-center gap-4 rounded-lg border p-5 transition-colors ${disponivel ? 'border-primary/30 bg-primary-50' : 'border-border bg-surface'}`}>
          <Icon icon="ph:lifebuoy-bold" width={28} className={disponivel ? 'text-primary dark:text-primary-300' : 'text-ink-muted'} aria-hidden />
          <div className="flex-1">
            <p className="font-heading text-sm font-semibold text-ink">Disponível para plantão</p>
            <p className="text-[13px] text-ink-secondary">Você pode ser acionado nos turnos ativos abaixo.</p>
          </div>
          <button
            onClick={() => setDisponivel((v) => !v)}
            aria-pressed={disponivel}
            aria-label="Alternar disponibilidade para plantão"
          >
            <Icon icon={disponivel ? 'ph:toggle-right-fill' : 'ph:toggle-left-bold'} width={36} className={disponivel ? 'text-primary dark:text-primary-300' : 'text-ink-muted'} aria-hidden />
          </button>
        </div>

        {/* Aviso de responsabilidade */}
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-surface-2 px-4 py-3 text-[13px] text-ink-secondary">
          <Icon icon="ph:info-bold" width={16} className="mt-0.5 shrink-0 text-ink-muted" aria-hidden />
          Durante um turno de plantão, é preciso estar prontamente disponível ao ser acionado. A remuneração do plantão é diferenciada.
        </div>

        {/* Turnos */}
        <h2 className="mt-8 text-[15px] font-semibold text-ink">Meus turnos</h2>
        <div className={`mt-3 flex flex-col gap-2 transition-opacity ${disponivel ? '' : 'opacity-50'}`}>
          {shifts.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-4">
              <Icon icon="ph:clock-bold" width={20} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
              <div className="flex-1">
                <p className="font-heading text-sm font-semibold text-ink">{s.dia}</p>
                <p className="font-mono text-[13px] text-ink-secondary">{s.inicio}–{s.fim}</p>
              </div>
              <button onClick={() => toggleShift(s.id)} disabled={!disponivel} aria-pressed={s.ativo} aria-label={`Turno de ${s.dia}`}>
                <Icon icon={s.ativo ? 'ph:toggle-right-fill' : 'ph:toggle-left-bold'} width={32} className={s.ativo ? 'text-primary dark:text-primary-300' : 'text-ink-muted'} aria-hidden />
              </button>
            </div>
          ))}
          <button
            disabled={!disponivel}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-surface px-4 py-3 font-heading text-sm font-medium text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink disabled:opacity-50"
          >
            <Icon icon="ph:plus-bold" width={15} aria-hidden />
            Adicionar turno
          </button>
        </div>

        {/* Pré-visualização do acionamento (demo) */}
        <div className="mt-8 rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <Badge tone="warning" icon="ph:bell-ringing-bold">Demonstração</Badge>
          </div>
          <p className="mt-3 text-sm text-ink-secondary">Veja como chega um acionamento de emergência e como entrar na sala com o beneficiário.</p>
          <Button variant="secondary" className="mt-3" iconLeft="ph:lifebuoy-bold" onClick={() => navigate('/pro/plantao/emergencia/pro-emg-1')}>
            Simular acionamento
          </Button>
        </div>
      </div>
    </div>
  )
}
