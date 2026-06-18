import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { PAGE_MAX_W } from '../lib/layout'
import { Card, CardEyebrow } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { RadarChart } from '../components/RadarChart'
import { Badge } from '../components/Badge'
import { wheelOfLife } from '../data/mock'

export function Ben28Evolucao() {
  const navigate = useNavigate()

  return (
    <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-12 lg:pt-10 pb-8`}>
      <PageHeader
        title="Sua evolução"
        subtitle="Um retrato do caminho que você vem percorrendo. Sem julgamento, só contexto."
      />

      {/* Desktop: side-by-side; Mobile: stacked */}
      <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-8 lg:items-start">

        {/* Left: Roda da Vida */}
        <Card className="mb-4 lg:mb-0">
          <div className="flex items-center justify-between">
            <CardEyebrow>Roda da Vida</CardEyebrow>
            <div className="flex items-center gap-3 text-xs text-ink-secondary">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-pill bg-primary-400" />
                Hoje
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-pill border border-primary-300 bg-transparent" style={{ outline: '1px dashed' }} />
                1 mês atrás
              </span>
            </div>
          </div>

          {/* Desktop: chart + metrics side by side inside card */}
          <div className="lg:flex lg:items-start lg:gap-6">
            <div className="flex justify-center py-2 lg:shrink-0">
              <RadarChart
                values={wheelOfLife.values}
                labels={wheelOfLife.labels}
                previousValues={wheelOfLife.previousValues}
                size={240}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 lg:flex-1 lg:self-center">
              {wheelOfLife.labels.map((label, i) => {
                const curr = wheelOfLife.values[i] ?? 0
                const prev = (wheelOfLife.previousValues ?? [])[i] ?? 0
                const diff = curr - prev
                return (
                  <div key={label} className="rounded-sm bg-surface-2 px-3 py-2 text-center">
                    <p className="text-xs text-ink-secondary">{label}</p>
                    <p className="text-sm font-semibold text-ink">{curr}/10</p>
                    {diff !== 0 && (
                      <p className={`text-[11px] font-medium ${diff > 0 ? 'text-success' : 'text-danger'}`}>
                        {diff > 0 ? '+' : ''}{diff}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Right: Timeline + actions */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardEyebrow>Linha do tempo</CardEyebrow>
            <div className="flex flex-col gap-3">
              {[
                { date: '11 jun', event: '1ª sessão com Dra. Ana Beltrão', icon: 'ph:heart-bold', tone: 'success' as const },
                { date: '5 jun', event: 'Triagem completa', icon: 'ph:clipboard-text-bold', tone: 'primary' as const },
                { date: '4 jun', event: 'Conta criada', icon: 'ph:user-plus-bold', tone: 'neutral' as const },
              ].map((item) => (
                <div key={item.date} className="flex items-center gap-3">
                  <Badge tone={item.tone} icon={item.icon}>{item.date}</Badge>
                  <p className="text-sm text-ink-secondary">{item.event}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex flex-col gap-2">
            <Button variant="secondary" fullWidth onClick={() => navigate('/conquistas')}>
              Ver conquistas
            </Button>
            <Button variant="secondary" fullWidth onClick={() => navigate('/relatorio')}>
              Relatório completo
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
