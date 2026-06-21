import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'

type Cadencia = 'semanal' | 'quinzenal' | 'mensal'

const CADENCIAS: { key: Cadencia; label: string; prazo: string; taxa: number }[] = [
  { key: 'semanal', label: 'Semanal', prazo: 'Receba toda semana', taxa: 2.4 },
  { key: 'quinzenal', label: 'Quinzenal', prazo: 'A cada 15 dias', taxa: 1.6 },
  { key: 'mensal', label: 'Mensal', prazo: 'Uma vez por mês', taxa: 0.9 },
]

export function Pro05FinanceiroSetup() {
  const navigate = useNavigate()
  const [bank, setBank] = useState({ banco: '', agencia: '', conta: '', pix: '' })
  const [cadencia, setCadencia] = useState<Cadencia>('semanal')
  const set = (k: string, v: string) => setBank((b) => ({ ...b, [k]: v }))
  const selected = CADENCIAS.find((c) => c.key === cadencia)!

  return (
    <section className="px-5 lg:px-0 pt-8 lg:pt-12 pb-10 animate-yna-slide-up">
      <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-primary dark:text-primary-300">Financeiro</p>
      <h1 className="mt-1 font-heading text-[24px] font-medium tracking-[-0.02em] text-ink">Como você quer receber</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">Os repasses caem na conta da sua PJ. Você pode mudar a cadência depois.</p>

      <div className="mt-6 flex flex-col gap-4">
        <Input label="Banco" value={bank.banco} onChange={(e) => set('banco', e.target.value)} placeholder="Ex.: Banco do Brasil" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Agência" value={bank.agencia} onChange={(e) => set('agencia', e.target.value)} placeholder="0000" inputMode="numeric" />
          <Input label="Conta" value={bank.conta} onChange={(e) => set('conta', e.target.value)} placeholder="00000-0" inputMode="numeric" />
        </div>
        <Input label="Chave PIX (opcional)" value={bank.pix} onChange={(e) => set('pix', e.target.value)} placeholder="CNPJ, e-mail ou telefone" />
      </div>

      <h2 className="mt-8 text-[15px] font-semibold text-ink">Cadência de recebimento</h2>
      <p className="mt-1 text-[13px] text-ink-secondary">Antecipar é opcional. Quanto menor o prazo, maior a taxa.</p>
      <div className="mt-3 flex flex-col gap-2">
        {CADENCIAS.map((c) => {
          const active = c.key === cadencia
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setCadencia(c.key)}
              aria-pressed={active}
              className={`flex items-center gap-3 rounded-lg border-[1.5px] px-4 py-4 text-left transition-colors ${
                active ? 'border-primary bg-primary-50' : 'border-border bg-surface hover:border-border-strong'
              }`}
            >
              <Icon
                icon={active ? 'ph:radio-button-bold' : 'ph:circle-bold'}
                width={20}
                className={active ? 'text-primary dark:text-primary-300' : 'text-ink-muted'}
                aria-hidden
              />
              <div className="flex-1">
                <p className="font-heading text-sm font-semibold text-ink">{c.label}</p>
                <p className="text-[13px] text-ink-secondary">{c.prazo}</p>
              </div>
              <span className="font-mono text-sm font-semibold text-ink">taxa {c.taxa.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}%</span>
            </button>
          )
        })}
      </div>

      {/* Taxa em tempo real */}
      <div className="mt-4 flex items-start gap-3 rounded-lg border border-primary/30 bg-primary-50 p-4" aria-live="polite">
        <Icon icon="ph:info-bold" width={18} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
        <p className="text-sm text-ink">
          Na cadência <span className="font-semibold">{selected.label.toLowerCase()}</span>, a taxa de antecipação é de{' '}
          <span className="font-semibold">{selected.taxa.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}%</span> por repasse.
        </p>
      </div>

      <div className="mt-8">
        <Button size="lg" fullWidth iconRight="ph:arrow-right-bold" onClick={() => navigate('/pro/integracao')}>
          Continuar
        </Button>
      </div>
    </section>
  )
}
