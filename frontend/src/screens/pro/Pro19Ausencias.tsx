import { useState } from 'react'
import { Icon } from '@iconify/react'
import { ProTopBar } from '../../components/ProTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Input } from '../../components/Input'
import { Textarea } from '../../components/Textarea'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { PAGE_MAX_W } from '../../lib/layout'

type Ausencia = { id: string; periodo: string; motivo: string }

export function Pro19Ausencias() {
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [motivo, setMotivo] = useState('')
  const [ausencias, setAusencias] = useState<Ausencia[]>([
    { id: 'a-0', periodo: '15/07 a 20/07', motivo: 'Congresso de Psicologia' },
  ])
  const [enviado, setEnviado] = useState(false)

  const podeEnviar = Boolean(inicio && fim)
  const registrar = () => {
    if (!podeEnviar) return
    setAusencias((arr) => [...arr, { id: `a-${Date.now()}`, periodo: `${inicio} a ${fim}`, motivo: motivo || 'Ausência' }])
    setInicio(''); setFim(''); setMotivo('')
    setEnviado(true)
    setTimeout(() => setEnviado(false), 3000)
  }

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <ProTopBar />
        <PageHeader title="Férias e ausências" subtitle="Informe períodos fora com antecedência. Avisamos seus beneficiários por você." className="mt-2 lg:mt-0" />

        {/* Novo período */}
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-[15px] font-semibold text-ink">Novo período</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Input label="Início" type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
            <Input label="Fim" type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
          </div>
          <div className="mt-3">
            <label className="mb-1.5 block text-sm font-semibold text-ink">Motivo (opcional)</label>
            <Textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex.: férias, congresso, motivos pessoais." className="min-h-[80px]" />
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-sm bg-surface-2 px-3 py-2 text-[13px] text-ink-secondary">
            <Icon icon="ph:info-bold" width={15} className="mt-0.5 shrink-0 text-ink-muted" aria-hidden />
            Sua agenda fica bloqueada no período. Os beneficiários ativos escolhem aguardar seu retorno ou seguir com outro profissional.
          </div>

          <Button className="mt-4" disabled={!podeEnviar} iconLeft={enviado ? 'ph:check-bold' : undefined} onClick={registrar}>
            {enviado ? 'Período registrado' : 'Registrar ausência'}
          </Button>
          <p className="mt-2 text-[12.5px] text-ink-muted">Antecedência mínima sugerida: 7 dias. Emergências, fale com a YNA.</p>
        </div>

        {/* Períodos cadastrados */}
        <h2 className="mb-3 mt-8 text-[15px] font-semibold text-ink">Períodos cadastrados</h2>
        <div className="flex flex-col gap-2">
          {ausencias.map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
              <Icon icon="ph:airplane-takeoff-bold" width={20} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
              <div className="flex-1">
                <p className="font-heading text-sm font-semibold text-ink">{a.periodo}</p>
                <p className="text-[13px] text-ink-secondary">{a.motivo}</p>
              </div>
              <Badge tone="neutral">Agendada</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
