import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'
import { CamposTipoEditor, perfilValido } from '../../components/CamposTipo'
import { usePro } from '../../contexts/ProContext'
import { PRO_NIVEIS_FORMACAO, PRO_IDIOMAS, PRO_NIVEIS_IDIOMA, PRO_DIAS_SEMANA } from '../../data/proMock'
import { tipoProfissionalAtivo } from '../../data/tiposProfissional'
import type { ProCadastro, ProFormacao, ProCursoCert, ProIdioma } from '../../types'

const uid = () => Math.random().toString(36).slice(2, 9)
const inputCls = 'w-full rounded border-[1.5px] border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary'
const TOTAL = 4

/* Cabeçalho de conteúdo por passo — mesmo estilo do onboarding (PRO-03). */
const HEAD: { tag: string; title: React.ReactNode; desc: string }[] = [
  { tag: 'Passo 1 · Pessoa Jurídica', title: (<><span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">Dados</span>{' '}da empresa</>), desc: 'A YNA opera por nota fiscal. Informe os dados da sua PJ e a conta para recebimentos.' },
  { tag: 'Passo 2 · Perfil profissional', title: (<>Como você{' '}<span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">atende</span></>), desc: 'Isso ajuda os beneficiários a entenderem a sua abordagem e a escolherem você.' },
  { tag: 'Passo 3 · Formação', title: (<>Sua{' '}<span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">trajetória</span></>), desc: 'Formação acadêmica, cursos, certificados e idiomas.' },
  { tag: 'Passo 4 · Disponibilidade', title: (<><span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">Quando</span>{' '}você poderia atender</>), desc: 'Defina os dias e os horários que você tem disponibilidade para atender e se você pode fazer plantão.' },
]

/* PRO-CAD-01 — Cadastro do perfil do profissional em 4 passos. Persiste no
   ProContext. Os dados pessoais/acesso vêm da criação de conta (PRO-03). */
export function ProCad01Wizard() {
  const navigate = useNavigate()
  const { cadastro, updateCadastro } = usePro()
  const [step, setStep] = useState(0)
  const [f, setF] = useState<ProCadastro>(cadastro)
  const set = (patch: Partial<ProCadastro>) => setF((prev) => ({ ...prev, ...patch }))
  const setPerfil = (id: string, v: string | string[]) => setF((prev) => ({ ...prev, perfil: { ...prev.perfil, [id]: v } }))

  const stepOk = [
    Boolean(f.cnpj.trim() && f.razaoSocial.trim() && f.banco.trim() && f.agencia.trim() && f.conta.trim() && f.pixChave.trim()),
    perfilValido(tipoProfissionalAtivo.campos, f.perfil),
    Boolean(f.formacoes.length),
    Boolean(f.disponibilidade.dias.length),
  ][step]

  const handleBack = () => (step === 0 ? navigate('/pro/cadastro/intro') : setStep((s) => s - 1))
  const handleNext = () => {
    if (!stepOk) return
    if (step < TOTAL - 1) setStep((s) => s + 1)
    else { updateCadastro(f); navigate('/pro/cadastro/processo') }
  }
  const isLast = step === TOTAL - 1
  const ctaLabel = isLast ? 'Finalizar cadastro' : 'Continuar'

  return (
    <>
      {/* Header mobile: voltar + progresso */}
      <header className="flex lg:hidden items-center gap-3 px-5 pb-2 pt-8">
        <button onClick={handleBack} aria-label="Voltar" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover">
          <Icon icon="ph:arrow-left-bold" width={18} aria-hidden />
        </button>
        <div className="flex-1">
          <div className="h-2 w-full overflow-hidden rounded-pill bg-surface-2" role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL} aria-valuenow={step + 1} aria-label={`Passo ${step + 1} de ${TOTAL}`}>
            <div className="h-full rounded-pill bg-gradient-to-r from-primary to-pink transition-all duration-500" style={{ width: `${((step + 1) / TOTAL) * 100}%` }} />
          </div>
        </div>
        <span className="shrink-0 font-mono text-xs font-medium text-ink-secondary">{step + 1} de {TOTAL}</span>
      </header>

      <main key={step} className="flex-1 px-5 pt-6 pb-8 lg:pt-10 lg:pb-28 animate-yna-slide-up">
        <div className="mb-6">
          <p className="mb-1 text-sm font-medium text-primary dark:text-primary-300">{HEAD[step].tag}</p>
          <h1 className="mt-1 text-[24px] lg:text-[40px] font-extralight leading-[1.15] lg:leading-[1.05] tracking-[-0.02em] text-ink">{HEAD[step].title}</h1>
          <p className="mt-2 text-sm lg:text-[17px] leading-relaxed text-ink-secondary lg:max-w-[600px]">{HEAD[step].desc}</p>
        </div>

        {/* Passo 1 — Dados da empresa */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="CNPJ"><input className={inputCls} value={f.cnpj} onChange={(e) => set({ cnpj: e.target.value })} inputMode="numeric" placeholder="00.000.000/0000-00" /></Campo>
              <Campo label="Razão social"><input className={inputCls} value={f.razaoSocial} onChange={(e) => set({ razaoSocial: e.target.value })} /></Campo>
            </div>
            <Campo label="Contrato social (PDF)">
              {f.contratoSocial ? (
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-[13px]">
                  <span className="flex items-center gap-2"><Icon icon="ph:file-pdf-bold" width={16} className="text-primary dark:text-primary-300" aria-hidden /> {f.contratoSocial}</span>
                  <button onClick={() => set({ contratoSocial: undefined })} className="text-ink-muted hover:text-ink"><Icon icon="ph:x-bold" width={14} aria-hidden /></button>
                </div>
              ) : (
                <button onClick={() => set({ contratoSocial: 'contrato-social.pdf' })} className="flex w-full items-center justify-center gap-2 rounded border-[1.5px] border-dashed border-border bg-surface px-4 py-3 text-[13px] font-medium text-ink-secondary transition-colors hover:border-primary hover:text-ink"><Icon icon="ph:upload-simple-bold" width={16} aria-hidden /> Anexar contrato social</button>
              )}
            </Campo>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Banco"><input className={inputCls} value={f.banco} onChange={(e) => set({ banco: e.target.value })} /></Campo>
              <Campo label="Agência"><input className={inputCls} value={f.agencia} onChange={(e) => set({ agencia: e.target.value })} /></Campo>
              <Campo label="Conta"><input className={inputCls} value={f.conta} onChange={(e) => set({ conta: e.target.value })} /></Campo>
              <Campo label="Chave PIX"><input className={inputCls} value={f.pixChave} onChange={(e) => set({ pixChave: e.target.value })} /></Campo>
            </div>
          </div>
        )}

        {/* Passo 2 — Perfil profissional (campos definidos pelo tipo) */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <CamposTipoEditor campos={tipoProfissionalAtivo.campos} perfil={f.perfil} onChange={setPerfil} />
            <Campo label="Instagram (opcional)"><input className={inputCls} value={f.instagram} onChange={(e) => set({ instagram: e.target.value })} placeholder="@seuperfil" /></Campo>
          </div>
        )}

        {/* Passo 3 — Formação */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <ListaGrupo
              titulo="Formação acadêmica"
              itens={f.formacoes}
              onAdd={() => set({ formacoes: [...f.formacoes, { id: uid(), nivel: 'Graduação', curso: '', instituicao: '', inicio: '', fim: '', emAndamento: false }] })}
              onRemove={(id) => set({ formacoes: f.formacoes.filter((x) => x.id !== id) })}
              render={(item) => {
                const up = (patch: Partial<ProFormacao>) => set({ formacoes: f.formacoes.map((x) => (x.id === item.id ? { ...x, ...patch } : x)) })
                return (
                  <>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <select className={inputCls} value={item.nivel} onChange={(e) => up({ nivel: e.target.value })}>{PRO_NIVEIS_FORMACAO.map((n) => <option key={n}>{n}</option>)}</select>
                      <input className={inputCls} value={item.curso} onChange={(e) => up({ curso: e.target.value })} placeholder="Curso" />
                      <input className={`${inputCls} sm:col-span-2`} value={item.instituicao} onChange={(e) => up({ instituicao: e.target.value })} placeholder="Instituição" />
                    </div>
                    <Periodo inicio={item.inicio} fim={item.fim} emAndamento={item.emAndamento} onChange={up} />
                  </>
                )
              }}
            />
            <ListaGrupo
              titulo="Cursos e certificados"
              itens={f.cursos}
              onAdd={() => set({ cursos: [...f.cursos, { id: uid(), nome: '', instituicao: '', inicio: '', fim: '', emAndamento: false }] })}
              onRemove={(id) => set({ cursos: f.cursos.filter((x) => x.id !== id) })}
              render={(item) => {
                const up = (patch: Partial<ProCursoCert>) => set({ cursos: f.cursos.map((x) => (x.id === item.id ? { ...x, ...patch } : x)) })
                return (
                  <>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input className={inputCls} value={item.nome} onChange={(e) => up({ nome: e.target.value })} placeholder="Nome do curso" />
                      <input className={inputCls} value={item.instituicao} onChange={(e) => up({ instituicao: e.target.value })} placeholder="Instituição" />
                    </div>
                    <Periodo inicio={item.inicio} fim={item.fim} emAndamento={item.emAndamento} onChange={up} />
                  </>
                )
              }}
            />
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[13px] font-semibold text-ink">Idiomas</h3>
                <button onClick={() => set({ idiomas: [...f.idiomas, { id: uid(), idioma: 'Português', nivel: 'Fluente' }] })} className="inline-flex items-center gap-1 text-[12.5px] font-medium text-primary hover:underline dark:text-primary-300"><Icon icon="ph:plus-bold" width={13} aria-hidden /> Adicionar</button>
              </div>
              <div className="flex flex-col gap-2">
                {f.idiomas.map((it) => {
                  const up = (patch: Partial<ProIdioma>) => set({ idiomas: f.idiomas.map((x) => (x.id === it.id ? { ...x, ...patch } : x)) })
                  return (
                    <div key={it.id} className="flex items-center gap-2">
                      <select className={inputCls} value={it.idioma} onChange={(e) => up({ idioma: e.target.value })}>{PRO_IDIOMAS.map((i) => <option key={i}>{i}</option>)}</select>
                      <select className={inputCls} value={it.nivel} onChange={(e) => up({ nivel: e.target.value })}>{PRO_NIVEIS_IDIOMA.map((n) => <option key={n}>{n}</option>)}</select>
                      <button onClick={() => set({ idiomas: f.idiomas.filter((x) => x.id !== it.id) })} className="shrink-0 text-ink-muted hover:text-danger-ink" aria-label="Remover"><Icon icon="ph:trash-bold" width={15} aria-hidden /></button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Passo 4 — Disponibilidade */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-1.5 text-[13px] font-semibold text-ink">Dias disponíveis</p>
              <div className="flex flex-wrap gap-2">
                {PRO_DIAS_SEMANA.map((d) => {
                  const on = f.disponibilidade.dias.includes(d)
                  return (
                    <button key={d} onClick={() => set({ disponibilidade: { ...f.disponibilidade, dias: on ? f.disponibilidade.dias.filter((x) => x !== d) : [...f.disponibilidade.dias, d] } })}
                      className={`rounded-pill border-[1.5px] px-3.5 py-1.5 font-heading text-[13px] font-medium transition-colors ${on ? 'border-primary bg-primary-50 text-primary dark:text-primary-300' : 'border-border bg-surface text-ink-secondary hover:border-border-strong hover:text-ink'}`}>{d}</button>
                  )
                })}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Início dos atendimentos"><input type="time" className={inputCls} value={f.disponibilidade.horaInicio} onChange={(e) => set({ disponibilidade: { ...f.disponibilidade, horaInicio: e.target.value } })} /></Campo>
              <Campo label="Fim dos atendimentos"><input type="time" className={inputCls} value={f.disponibilidade.horaFim} onChange={(e) => set({ disponibilidade: { ...f.disponibilidade, horaFim: e.target.value } })} /></Campo>
            </div>
            <div>
              <p className="mb-1.5 text-[13px] font-semibold text-ink">Disponibilidade para plantão (emergências)</p>
              <div className="flex gap-1 rounded-lg bg-surface-2 p-1 sm:max-w-xs">
                {([[true, 'Sim'], [false, 'Não']] as const).map(([v, l]) => (
                  <button key={l} onClick={() => set({ disponibilidade: { ...f.disponibilidade, plantao: v } })}
                    className={`flex-1 rounded-lg px-3 py-2 font-heading text-sm font-semibold transition-all ${f.disponibilidade.plantao === v ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'}`}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer mobile */}
      <footer className="px-5 pb-8 lg:hidden">
        <Button size="lg" fullWidth iconRight={isLast ? undefined : 'ph:arrow-right-bold'} iconLeft={isLast ? 'ph:check-bold' : undefined} onClick={handleNext} disabled={!stepOk}>
          {ctaLabel}
        </Button>
      </footer>

      {/* Barra inferior desktop */}
      <div className="hidden lg:flex fixed bottom-0 left-0 right-0 z-20 h-[72px] items-center border-t border-border bg-surface/90 px-10 backdrop-blur-sm">
        <div className="w-40">
          <button onClick={handleBack} className="flex items-center gap-2 font-heading text-sm font-medium text-ink-secondary transition-colors hover:text-ink">
            <Icon icon="ph:arrow-left-bold" width={16} aria-hidden />
            Voltar
          </button>
        </div>
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <div className="h-1.5 w-52 overflow-hidden rounded-pill bg-surface-2">
            <div className="h-full rounded-pill bg-gradient-to-r from-primary to-pink transition-all duration-500" style={{ width: `${((step + 1) / TOTAL) * 100}%` }} />
          </div>
          <span className="font-mono text-[11px] text-ink-secondary">{step + 1} de {TOTAL}</span>
        </div>
        <div className="flex w-40 items-center justify-end gap-3">
          <Button onClick={handleNext} disabled={!stepOk} iconRight={isLast ? undefined : 'ph:arrow-right-bold'} iconLeft={isLast ? 'ph:check-bold' : undefined}>
            {ctaLabel}
          </Button>
        </div>
      </div>
    </>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[13px] font-semibold text-ink">{label}</span>{children}</label>
}


function Periodo({ inicio, fim, emAndamento, onChange }: { inicio: string; fim: string; emAndamento: boolean; onChange: (p: { inicio?: string; fim?: string; emAndamento?: boolean }) => void }) {
  return (
    <div className="mt-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block"><span className="mb-1 block text-[11.5px] text-ink-muted">Início (mês/ano)</span><input type="month" className={inputCls} value={inicio} onChange={(e) => onChange({ inicio: e.target.value })} /></label>
        <label className="block"><span className="mb-1 block text-[11.5px] text-ink-muted">Fim (mês/ano)</span><input type="month" className={inputCls} value={emAndamento ? '' : fim} disabled={emAndamento} onChange={(e) => onChange({ fim: e.target.value })} /></label>
      </div>
      <label className="mt-2 inline-flex items-center gap-2 text-[12.5px] text-ink">
        <input type="checkbox" checked={emAndamento} onChange={(e) => onChange({ emAndamento: e.target.checked, fim: e.target.checked ? '' : fim })} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
        Em andamento
      </label>
    </div>
  )
}

function ListaGrupo<T extends { id: string }>({ titulo, itens, onAdd, onRemove, render }: {
  titulo: string; itens: T[]; onAdd: () => void; onRemove: (id: string) => void; render: (item: T) => React.ReactNode
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-ink">{titulo}</h3>
        <button onClick={onAdd} className="inline-flex items-center gap-1 text-[12.5px] font-medium text-primary hover:underline dark:text-primary-300"><Icon icon="ph:plus-bold" width={13} aria-hidden /> Adicionar</button>
      </div>
      {itens.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-4 text-center text-[12.5px] text-ink-muted">Nenhum item adicionado.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {itens.map((item) => (
            <div key={item.id} className="rounded-lg border border-border bg-surface-2/40 p-3">
              <div className="mb-2 flex justify-end">
                <button onClick={() => onRemove(item.id)} className="text-ink-muted hover:text-danger-ink" aria-label="Remover"><Icon icon="ph:trash-bold" width={15} aria-hidden /></button>
              </div>
              {render(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
