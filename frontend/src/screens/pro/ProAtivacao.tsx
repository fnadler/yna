import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'
import { Sheet } from '../../components/Sheet'
import { LogoYna } from '../../components/YnaLogo'
import { Pro11AgendaContent } from './Pro11Agenda'
import { CamposTipoEditor, CamposTipoView } from '../../components/CamposTipo'
import { usePro } from '../../contexts/ProContext'
import { proOnboardingVideos } from '../../data/proMock'
import { tipoProfissionalAtivo } from '../../data/tiposProfissional'
import type { ProOnboardingVideo } from '../../data/proMock'
import type { ProCadastro } from '../../types'

const inputCls = 'w-full rounded border-[1.5px] border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary'
const STEPS = ['Revisar perfil', 'Disponibilidade', 'Vídeo', 'Onboarding']
const coverClass: Record<ProOnboardingVideo['cover'], string> = {
  lavender: 'from-lavender to-primary-200', pink: 'from-pink to-yellow', blue: 'from-primary-200 to-primary',
  yellow: 'from-yellow to-pink', teal: 'from-primary-100 to-primary-300',
}
type Grupo = 'pessoais' | 'empresa' | 'clinico'

/* PRO-ATIVACAO — ativação da conta após aprovação: revisar perfil, confirmar
   disponibilidade, gravar vídeo e assistir aos vídeos de onboarding. */
export function ProAtivacao() {
  const { cadastro, updateCadastro } = usePro()
  const [step, setStep] = useState(0)
  const [vistos, setVistos] = useState<string[]>([])
  const [concluido, setConcluido] = useState(false)
  const marcarVisto = (id: string) => setVistos((v) => (v.includes(id) ? v : [...v, id]))
  const todosVistos = vistos.length === proOnboardingVideos.length

  if (concluido) return <AtivacaoSucesso />

  return (
    <div className="flex min-h-dvh justify-center bg-yna-gradient-soft px-5 py-8 dark:[background-image:var(--yna-gradient-dark)]">
      <div className="w-full max-w-2xl">
        <LogoYna className="mx-auto h-7 text-primary dark:text-lavender" />
        <div className="mt-2 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-primary-50 px-3 py-1 text-[12px] font-semibold text-primary dark:text-primary-300"><Icon icon="ph:rocket-launch-bold" width={14} aria-hidden /> Ativação da conta</span>
        </div>

        {/* Stepper */}
        <ol className="mt-4 flex items-center gap-1.5">
          {STEPS.map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-1.5">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${i === step ? 'bg-primary text-white' : i < step ? 'bg-primary-50 text-primary dark:text-primary-300' : 'bg-surface-2 text-ink-muted'}`}>{i < step ? <Icon icon="ph:check-bold" width={12} aria-hidden /> : i + 1}</span>
              <span className={`hidden text-[12px] font-medium sm:block ${i === step ? 'text-ink' : 'text-ink-muted'}`}>{label}</span>
              {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
            </li>
          ))}
        </ol>

        <div className="mt-4 rounded-xl border border-border bg-surface p-5 shadow-lg lg:p-6">
          {step === 0 && <RevisarPerfil cadastro={cadastro} updateCadastro={updateCadastro} />}
          {step === 1 && <ConfirmarDisponibilidade />}
          {step === 2 && <GravarVideo />}
          {step === 3 && <Onboarding vistos={vistos} onConcluirVideo={marcarVisto} />}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" className="w-full sm:w-auto" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Anterior</Button>
            {step < 3
              ? <Button className="w-full sm:w-auto" iconRight="ph:arrow-right-bold" onClick={() => setStep((s) => s + 1)}>{step === 0 ? 'Confirmar e continuar' : 'Continuar'}</Button>
              : <Button className="w-full sm:w-auto" iconLeft="ph:check-circle-bold" disabled={!todosVistos} onClick={() => setConcluido(true)}>Concluir e acessar a plataforma</Button>}
          </div>
        </div>
      </div>
    </div>
  )
}

/* Tela de sucesso ao ativar a conta (mesmo modelo do "Conta criada"). */
function AtivacaoSucesso() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<'celebrating' | 'leaving' | 'content'>('celebrating')
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('leaving'), 1700)
    const t2 = setTimeout(() => setPhase('content'), 2200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="relative flex h-dvh flex-col items-center justify-center overflow-hidden px-7 text-center bg-yna-gradient">
      {(phase === 'celebrating' || phase === 'leaving') && (
        <div className={`relative flex h-28 w-28 items-center justify-center transition-opacity duration-500 ${phase === 'leaving' ? 'opacity-0' : 'opacity-100'}`}>
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <div className="absolute inset-4 animate-ping rounded-full bg-primary/25" style={{ animationDelay: '0.3s' }} />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <Icon icon="ph:rocket-launch-bold" width={30} className="text-primary" aria-hidden />
          </div>
        </div>
      )}

      {phase === 'content' && (
        <div className="flex w-full max-w-xs md:max-w-md flex-col items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 animate-yna-logo">
            <Icon icon="ph:rocket-launch-bold" width={28} className="text-primary" aria-hidden />
          </div>

          <div className="w-full rounded-2xl bg-surface border border-border shadow p-7 md:p-10 flex flex-col items-center gap-6 animate-yna-slide-up">
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink">Conta ativada</p>
              <h1 className="text-[34px] font-heading font-extralight leading-[1.08] tracking-[-0.03em] text-ink">
                Tudo pronto para<br />
                <span className="font-extrabold text-primary">atender.</span>
              </h1>
              <p className="text-[15px] leading-relaxed text-ink-secondary">
                Sua conta está ativa e o seu perfil já pode entrar nos matches dos beneficiários.
                Bem-vindo(a) à YNA.
              </p>
            </div>

            <div className="w-full animate-yna-slide-up animate-yna-delay-250">
              <Button variant="gradient" size="lg" fullWidth iconRight="ph:arrow-right-bold" onClick={() => navigate('/pro/home')}>
                Acessar a plataforma
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Step 1 — Revisar perfil (com edição por grupo em modal) ── */
function RevisarPerfil({ cadastro, updateCadastro }: { cadastro: ProCadastro; updateCadastro: (p: Partial<ProCadastro>) => void }) {
  const c = cadastro
  const [grupo, setGrupo] = useState<Grupo | null>(null)
  const [draft, setDraft] = useState<ProCadastro>(cadastro)
  const abrir = (g: Grupo) => { setDraft(cadastro); setGrupo(g) }
  const salvar = () => { updateCadastro(draft); setGrupo(null) }
  const d = (patch: Partial<ProCadastro>) => setDraft((p) => ({ ...p, ...patch }))
  const setPerfil = (id: string, v: string | string[]) => setDraft((p) => ({ ...p, perfil: { ...p.perfil, [id]: v } }))
  const periodo = (ini: string, fim: string, and: boolean) => `${ini.split('-').reverse().join('/')} — ${and ? 'em andamento' : (fim ? fim.split('-').reverse().join('/') : '—')}`

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] text-ink-secondary">Revise os dados do seu cadastro. Você pode editar cada bloco antes de ativar.</p>

      <Bloco titulo="Dados pessoais" onEdit={() => abrir('pessoais')}>
        <Linhas pares={[['Nome', c.nomeCompleto], ['CPF', c.cpf], ['E-mail', c.email], ['Telefone', c.telefone], ['Instagram', c.instagram || '—']]} />
      </Bloco>

      <Bloco titulo="Dados da empresa" onEdit={() => abrir('empresa')}>
        <Linhas pares={[['CNPJ', c.cnpj], ['Razão social', c.razaoSocial], ['Banco', c.banco], ['Agência', c.agencia], ['Conta', c.conta], ['Chave PIX', c.pixChave]]} />
      </Bloco>

      <Bloco titulo="Perfil profissional" onEdit={() => abrir('clinico')}>
        <CamposTipoView campos={tipoProfissionalAtivo.campos} perfil={c.perfil} />
      </Bloco>

      <Bloco titulo="Formação">
        <p className="mb-1 text-[11px] uppercase tracking-wide text-ink-muted">Formação</p>
        {c.formacoes.map((fo) => <p key={fo.id} className="text-[12.5px] text-ink">{fo.nivel} · {fo.curso} — {fo.instituicao} <span className="text-ink-muted">({periodo(fo.inicio, fo.fim, fo.emAndamento)})</span></p>)}
        <p className="mb-1 mt-2 text-[11px] uppercase tracking-wide text-ink-muted">Idiomas</p>
        <div className="flex flex-wrap gap-1.5">{c.idiomas.map((i) => <span key={i.id} className="rounded-pill bg-surface-2 px-2.5 py-0.5 text-[11.5px] text-ink-secondary">{i.idioma} · {i.nivel}</span>)}</div>
      </Bloco>

      {/* Modal de edição por grupo */}
      <Sheet open={grupo !== null} onClose={() => setGrupo(null)} title="Editar" icon="ph:pencil-simple-bold" size="md">
        {grupo && (
          <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
            {grupo === 'pessoais' && (
              <>
                <Campo label="Nome completo"><input className={inputCls} value={draft.nomeCompleto} onChange={(e) => d({ nomeCompleto: e.target.value })} /></Campo>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Campo label="CPF"><input className={inputCls} value={draft.cpf} onChange={(e) => d({ cpf: e.target.value })} /></Campo>
                  <Campo label="Telefone"><input className={inputCls} value={draft.telefone} onChange={(e) => d({ telefone: e.target.value })} /></Campo>
                  <Campo label="E-mail"><input className={inputCls} value={draft.email} onChange={(e) => d({ email: e.target.value })} /></Campo>
                  <Campo label="Instagram"><input className={inputCls} value={draft.instagram} onChange={(e) => d({ instagram: e.target.value })} /></Campo>
                </div>
              </>
            )}
            {grupo === 'empresa' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="CNPJ"><input className={inputCls} value={draft.cnpj} onChange={(e) => d({ cnpj: e.target.value })} /></Campo>
                <Campo label="Razão social"><input className={inputCls} value={draft.razaoSocial} onChange={(e) => d({ razaoSocial: e.target.value })} /></Campo>
                <Campo label="Banco"><input className={inputCls} value={draft.banco} onChange={(e) => d({ banco: e.target.value })} /></Campo>
                <Campo label="Agência"><input className={inputCls} value={draft.agencia} onChange={(e) => d({ agencia: e.target.value })} /></Campo>
                <Campo label="Conta"><input className={inputCls} value={draft.conta} onChange={(e) => d({ conta: e.target.value })} /></Campo>
                <Campo label="Chave PIX"><input className={inputCls} value={draft.pixChave} onChange={(e) => d({ pixChave: e.target.value })} /></Campo>
              </div>
            )}
            {grupo === 'clinico' && (
              <CamposTipoEditor campos={tipoProfissionalAtivo.campos} perfil={draft.perfil} onChange={setPerfil} />
            )}
            <div className="mt-1 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setGrupo(null)}>Cancelar</Button>
              <Button iconLeft="ph:check-bold" onClick={salvar}>Salvar</Button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  )
}

/* ── Step 2 — Confirmar disponibilidade (reusa a config da agenda) ── */
function ConfirmarDisponibilidade() {
  return (
    <div>
      <h2 className="font-heading text-lg font-semibold text-ink">Confirme sua disponibilidade</h2>
      <p className="mt-1 text-[13px] text-ink-secondary">Revise os horários de atendimento e o plantão. Você poderá ajustar quando quiser na Agenda.</p>
      <div className="-mx-5 mt-3 lg:-mx-6">
        <Pro11AgendaContent onClose={() => { /* navegação pelo rodapé do wizard */ }} hideBloqueios hideSave />
      </div>
    </div>
  )
}

/* ── Step 3 — Gravar vídeo de apresentação ── */
function GravarVideo() {
  const [enviado, setEnviado] = useState(false)
  const orientacoes = [
    { icon: 'ph:frame-corners-bold', t: 'Enquadramento', d: 'Rosto centralizado, do peito para cima, com espaço acima da cabeça.' },
    { icon: 'ph:sun-bold', t: 'Iluminação', d: 'Luz natural de frente; evite janelas atrás de você.' },
    { icon: 'ph:device-mobile-bold', t: 'Orientação', d: 'Grave na horizontal (deitado), em boa resolução.' },
    { icon: 'ph:armchair-bold', t: 'Cenário', d: 'Fundo neutro e organizado, sem ruído.' },
    { icon: 'ph:timer-bold', t: 'Duração', d: 'Entre 60 e 90 segundos.' },
  ]
  const roteiro = ['Seu nome e formação', 'Suas áreas de atuação e abordagem', 'Como são as suas sessões', 'Uma mensagem de acolhimento para quem procura ajuda']
  return (
    <div>
      <h2 className="font-heading text-lg font-semibold text-ink">Grave seu vídeo de apresentação</h2>
      <p className="mt-1 text-[13px] text-ink-secondary">É o primeiro contato do beneficiário com você. Siga as orientações abaixo.</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {orientacoes.map((o) => (
          <div key={o.t} className="flex items-start gap-2.5 rounded-lg border border-border bg-surface-2/40 p-3">
            <Icon icon={o.icon} width={18} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
            <div><p className="text-[13px] font-semibold text-ink">{o.t}</p><p className="text-[12px] text-ink-secondary">{o.d}</p></div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-border bg-surface p-4">
        <p className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-ink"><Icon icon="ph:list-checks-bold" width={16} className="text-primary dark:text-primary-300" aria-hidden /> O que dizer no vídeo</p>
        <ul className="flex flex-col gap-1.5">{roteiro.map((r, i) => <li key={i} className="flex items-center gap-2 text-[13px] text-ink"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50 font-mono text-[10px] font-bold text-primary dark:text-primary-300">{i + 1}</span>{r}</li>)}</ul>
      </div>

      {enviado ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-[13px] text-success"><Icon icon="ph:check-circle-bold" width={16} aria-hidden /> Vídeo enviado — nossa equipe fará a curadoria.</div>
      ) : (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" iconLeft="ph:video-camera-bold" className="flex-1" onClick={() => setEnviado(true)}>Gravar agora</Button>
          <Button variant="secondary" iconLeft="ph:upload-simple-bold" className="flex-1" onClick={() => setEnviado(true)}>Enviar arquivo</Button>
        </div>
      )}
    </div>
  )
}

/* ── Step 4 — Vídeos de onboarding (modelo de curso, com conclusão sequencial) ──
   Cada vídeo só libera o próximo depois de concluído; a ativação só pode ser
   concluída após todos serem assistidos. */
function Onboarding({ vistos, onConcluirVideo }: { vistos: string[]; onConcluirVideo: (id: string) => void }) {
  const total = proOnboardingVideos.length
  const [ativoId, setAtivoId] = useState(proOnboardingVideos[0].id)
  const ativoIdx = proOnboardingVideos.findIndex((v) => v.id === ativoId)
  const ativo = proOnboardingVideos[ativoIdx]
  const isVisto = (id: string) => vistos.includes(id)
  const desbloqueado = (i: number) => i === 0 || isVisto(proOnboardingVideos[i - 1].id)
  const proximo = proOnboardingVideos[ativoIdx + 1]
  const todos = vistos.length === total

  const concluirAtivo = () => {
    onConcluirVideo(ativo.id)
    if (proximo) setAtivoId(proximo.id)
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold text-ink">Vídeos de onboarding</h2>
          <p className="mt-1 text-[13px] text-ink-secondary">Assista a todos os vídeos para conhecer a plataforma antes de começar a atender.</p>
        </div>
        <span className="shrink-0 rounded-pill bg-surface-2 px-2.5 py-1 font-mono text-[11.5px] font-medium text-ink-secondary">{vistos.length}/{total}</span>
      </div>

      {/* Vídeo em destaque */}
      <div className="mt-4">
        <div className={`relative flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br ${coverClass[ativo.cover]}`}>
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/25 text-white"><Icon icon="ph:play-fill" width={26} aria-hidden /></span>
          {isVisto(ativo.id) && (
            <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-pill bg-black/35 px-2 py-0.5 text-[11px] font-medium text-white"><Icon icon="ph:check-bold" width={12} aria-hidden /> Assistido</span>
          )}
        </div>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-heading text-[15px] font-semibold text-ink">{ativo.titulo}</p>
            <p className="text-[12.5px] text-ink-secondary">{ativo.descricao} · {ativo.duracao}</p>
          </div>
          {!isVisto(ativo.id) ? (
            <Button size="sm" variant="secondary" className="w-full shrink-0 sm:w-auto" iconLeft="ph:check-bold" onClick={concluirAtivo}>Marcar como assistido</Button>
          ) : proximo && !isVisto(proximo.id) ? (
            <Button size="sm" variant="secondary" className="w-full shrink-0 sm:w-auto" iconRight="ph:arrow-right-bold" onClick={() => setAtivoId(proximo.id)}>Próximo vídeo</Button>
          ) : null}
        </div>
      </div>

      {/* Playlist */}
      <div className="mt-4">
        <p className="mb-2 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">Playlist do onboarding</p>
        <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border">
          {proOnboardingVideos.map((v, i) => {
            const visto = isVisto(v.id)
            const livre = desbloqueado(i)
            const ativoAqui = ativoId === v.id
            return (
              <li key={v.id}>
                <button
                  disabled={!livre}
                  onClick={() => livre && setAtivoId(v.id)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${ativoAqui ? 'bg-primary-50' : livre ? 'hover:bg-surface-hover' : 'cursor-not-allowed opacity-60'}`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white ${visto ? 'bg-success' : `bg-gradient-to-br ${coverClass[v.cover]}`}`}>
                    <Icon icon={visto ? 'ph:check-bold' : livre ? (ativoAqui ? 'ph:play-fill' : 'ph:play-bold') : 'ph:lock-simple-bold'} width={14} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-medium text-ink">{i + 1}. {v.titulo}</span><span className="block text-[11.5px] text-ink-muted">{visto ? 'Concluído' : livre ? v.duracao : 'Bloqueado'}</span></span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className={`mt-4 flex items-center gap-2 rounded-lg border px-4 py-3 text-[13px] ${todos ? 'border-success/30 bg-success-bg text-success' : 'border-border bg-surface-2/40 text-ink-secondary'}`}>
        <Icon icon={todos ? 'ph:check-circle-bold' : 'ph:info-bold'} width={16} className="shrink-0" aria-hidden />
        {todos ? 'Você concluiu todos os vídeos. Já pode ativar a sua conta.' : 'Assista a todos os vídeos para liberar a conclusão da ativação.'}
      </div>
    </div>
  )
}

/* ── Helpers ── */
function Bloco({ titulo, onEdit, children }: { titulo: string; onEdit?: () => void; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-heading text-[14px] font-semibold text-ink">{titulo}</h3>
        {onEdit && <button onClick={onEdit} className="inline-flex items-center gap-1 text-[12.5px] font-medium text-primary hover:underline dark:text-primary-300"><Icon icon="ph:pencil-simple-bold" width={13} aria-hidden /> Editar</button>}
      </div>
      {children}
    </section>
  )
}
function Linhas({ pares }: { pares: [string, string][] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
      {pares.map(([l, v]) => <div key={l}><dt className="text-[11px] uppercase tracking-wide text-ink-muted">{l}</dt><dd className="break-words text-[13px] text-ink">{v}</dd></div>)}
    </dl>
  )
}
function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[13px] font-semibold text-ink">{label}</span>{children}</label>
}
