import { useEffect, useState, type ChangeEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { ProTopBar } from '../../components/ProTopBar'
import { PageHeader } from '../../components/PageHeader'
import { ProfileStrengthCard } from '../../components/ProfileStrengthCard'
import { DisponibilidadeResumo } from '../../components/DisponibilidadeResumo'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Textarea } from '../../components/Textarea'
import { Chips } from '../../components/Chips'
import { Input } from '../../components/Input'
import { Sheet } from '../../components/Sheet'
import { PAGE_MAX_W } from '../../lib/layout'
import { usePro } from '../../contexts/ProContext'
import { LINHAS_TEORICAS, AREAS_ATUACAO } from '../../data/proMock'
import { Pro10PreviewContent } from './Pro10Preview'

function Section({ id, title, hint, children }: { id: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 rounded-lg border border-border bg-surface p-5">
      <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
      {hint && <p className="mt-0.5 text-[13px] text-ink-secondary">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

export function Pro09Perfil() {
  const { profile, updateProfile, strength, disponibilidade } = usePro()
  const location = useLocation()
  const navigate = useNavigate()
  const [novaFormacao, setNovaFormacao] = useState('')
  const [sheet, setSheet] = useState<'preview' | null>(null)

  // Deep-link dos atalhos do "Perfil pronto para match" (#foto, #video, ...)
  useEffect(() => {
    if (!location.hash) return
    const el = document.getElementById(location.hash.slice(1))
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash])

  const onFoto = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.files?.[0]?.name
    if (name) updateProfile({ fotoUrl: name })
  }
  const onVideo = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.files?.[0]?.name
    if (name) updateProfile({ videoUrl: name })
  }
  const toggle = (key: 'linhasTeoricas' | 'areasAtuacao', v: string) =>
    updateProfile({ [key]: profile[key].includes(v) ? profile[key].filter((x) => x !== v) : [...profile[key], v] })
  const addFormacao = () => {
    if (!novaFormacao.trim()) return
    updateProfile({ formation: [...profile.formation, novaFormacao.trim()] })
    setNovaFormacao('')
  }

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <ProTopBar />
        <PageHeader
          title="Seu perfil"
          subtitle="É o que os beneficiários veem ao escolher. Quanto mais completo, mais matches."
          className="mt-2 lg:mt-0"
          action={
            <div className="hidden lg:block">
              <Button variant="secondary" iconLeft="ph:eye-bold" onClick={() => setSheet('preview')}>
                Ver como beneficiário
              </Button>
            </div>
          }
        />

        <div className="flex flex-col gap-4">
          <ProfileStrengthCard strength={strength} />

          <Button variant="secondary" fullWidth iconLeft="ph:eye-bold" className="lg:hidden" onClick={() => setSheet('preview')}>
            Ver como beneficiário
          </Button>

          <Section id="foto" title="Foto de perfil" hint="Uma foto real aproxima quem procura cuidado.">
            <div className="flex items-center gap-4">
              <Avatar initials={profile.initials} size={64} palette={profile.palette} />
              <div className="flex flex-col gap-1.5">
                {profile.fotoUrl && <span className="font-mono text-xs text-success">{profile.fotoUrl}</span>}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-pill border-[1.5px] border-primary-200 bg-surface px-4 py-2 font-heading text-[13px] font-semibold text-primary transition-colors hover:bg-primary-50 dark:text-primary-300">
                  <Icon icon="ph:camera-bold" width={16} aria-hidden />
                  {profile.fotoUrl ? 'Trocar foto' : 'Adicionar foto'}
                  <input type="file" accept="image/*" className="sr-only" onChange={onFoto} />
                </label>
              </div>
            </div>
          </Section>

          <Section id="video" title="Vídeo de apresentação" hint="Formato MP4, na horizontal (16:9), de 1 a 2 minutos.">
            {profile.videoUrl ? (
              <div className="flex items-center gap-2 text-sm text-success">
                <Icon icon="ph:check-circle-bold" width={18} aria-hidden />
                <span className="font-mono text-xs">{profile.videoUrl}</span>
              </div>
            ) : (
              <div className="mb-3 flex items-start gap-2 rounded-sm border border-warning/30 bg-warning-bg px-3 py-2 text-[13px] text-warning-ink">
                <Icon icon="ph:warning-bold" width={16} className="mt-0.5 shrink-0" aria-hidden />
                Sem vídeo, seu perfil aparece para menos beneficiários.
              </div>
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-pill border-[1.5px] border-primary-200 bg-surface px-4 py-2 font-heading text-[13px] font-semibold text-primary transition-colors hover:bg-primary-50 dark:text-primary-300">
              <Icon icon="ph:upload-simple-bold" width={16} aria-hidden />
              {profile.videoUrl ? 'Trocar vídeo' : 'Enviar vídeo'}
              <input type="file" accept="video/mp4" className="sr-only" onChange={onVideo} />
            </label>
          </Section>

          <Section id="bio" title="Bio" hint="Uma apresentação curta e humana.">
            <Textarea
              value={profile.bio}
              onChange={(e) => updateProfile({ bio: e.target.value })}
              placeholder="Conte um pouco sobre você e a sua prática."
            />
          </Section>

          <Section id="como-trabalha" title='"Como trabalha"' hint="O que a pessoa pode esperar das sessões com você.">
            <Textarea
              value={profile.comoTrabalha}
              onChange={(e) => updateProfile({ comoTrabalha: e.target.value })}
              placeholder="Descreva o seu jeito de conduzir o cuidado."
              className="min-h-[100px]"
            />
          </Section>

          <Section id="abordagem" title="Linha teórica">
            <Chips options={LINHAS_TEORICAS} selected={profile.linhasTeoricas} onToggle={(v) => toggle('linhasTeoricas', v)} />
          </Section>

          <Section id="areas" title="Áreas de atuação">
            <Chips options={AREAS_ATUACAO} selected={profile.areasAtuacao} onToggle={(v) => toggle('areasAtuacao', v)} />
          </Section>

          <Section id="formacao" title="Formação e certificados" hint="A YNA valida cada item antes de exibir no perfil.">
            <ul className="mb-3 flex flex-col gap-2">
              {profile.formation.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-ink">
                  <Icon icon="ph:graduation-cap-bold" width={16} className="shrink-0 text-primary dark:text-primary-300" aria-hidden />
                  {f}
                </li>
              ))}
              {profile.certificados.map((c) => (
                <li key={c.id} className="flex items-center gap-2 text-sm text-ink-secondary">
                  <Icon icon="ph:certificate-bold" width={16} className="shrink-0 text-ink-muted" aria-hidden />
                  {c.titulo} · {c.instituicao}
                  {c.validado && <Badge tone="success" className="ml-1">validado</Badge>}
                </li>
              ))}
            </ul>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input label="Adicionar formação" value={novaFormacao} onChange={(e) => setNovaFormacao(e.target.value)} placeholder="Ex.: Especialização em ACT" />
              </div>
              <Button variant="soft" onClick={addFormacao}>Adicionar</Button>
            </div>
          </Section>

          <Section id="agenda" title="Agenda e disponibilidade" hint="Seus horários de atendimento, plantão e bloqueios. Você gerencia tudo isso na Agenda.">
            <DisponibilidadeResumo disponibilidade={disponibilidade} />
            <Button
              variant="secondary"
              iconRight="ph:arrow-right-bold"
              className="mt-4"
              onClick={() => navigate('/pro/agenda', { state: { openDisponibilidade: true } })}
            >
              Gerenciar na agenda
            </Button>
          </Section>
        </div>
      </div>

      <Sheet
        open={sheet !== null}
        onClose={() => setSheet(null)}
        title="Como você aparece"
        icon="ph:eye-bold"
        size="lg"
      >
        {sheet === 'preview' && <Pro10PreviewContent />}
      </Sheet>
    </div>
  )
}
