import { useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { MngTopBar } from '../../components/MngTopBar'
import { PageHeader } from '../../components/PageHeader'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Sheet } from '../../components/Sheet'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { PAGE_MAX_W } from '../../lib/layout'
import { useService } from '../../hooks/useService'
import { mngConteudoService } from '../../services/mng'
import { mngTiposProfissional, ACADEMIA_TEMAS, ACADEMIA_TRILHAS } from '../../data/mngMock'
import type { MngConteudo, MngConteudoTipo, MngConteudoStatus, MngCurso, MngLive, MngArtigo, MngCursoAula, MngArtigoBloco, MngNivel, CoverKey } from '../../types'

const fmtData = (iso: string) => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}` }
const uid = () => Math.random().toString(36).slice(2, 8)

const TABS: { key: MngConteudoTipo; label: string; icon: string; singular: string }[] = [
  { key: 'curso', label: 'Cursos', icon: 'ph:play-circle-bold', singular: 'curso' },
  { key: 'live', label: 'Lives', icon: 'ph:broadcast-bold', singular: 'live' },
  { key: 'artigo', label: 'Artigos', icon: 'ph:article-bold', singular: 'artigo' },
]
const STATUS_TONE: Record<MngConteudoStatus, 'success' | 'warning' | 'neutral'> = { publicado: 'success', rascunho: 'warning', arquivado: 'neutral' }
const STATUS_LABEL: Record<MngConteudoStatus, string> = { publicado: 'Publicado', rascunho: 'Rascunho', arquivado: 'Arquivado' }
const NIVEL_LABEL: Record<MngNivel, string> = { iniciante: 'Iniciante', intermediario: 'Intermediário', avancado: 'Avançado' }
const COVERS: CoverKey[] = ['lavender', 'pink', 'yellow', 'teal', 'blue']
const coverClass: Record<CoverKey, string> = {
  lavender: 'from-lavender to-primary-200', pink: 'from-pink to-yellow', yellow: 'from-yellow to-pink', teal: 'from-primary-100 to-primary-300', blue: 'from-primary-200 to-primary',
}
const tipoNome = (id: string) => mngTiposProfissional.find((t) => t.id === id)?.nome ?? id
const inputCls = 'w-full rounded border-[1.5px] border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary'

/* MNG-15 — Academia YNA · CMS (§8.7). Listagens separadas por tipo (cursos,
   lives, artigos) com cadastro/edição específico e métricas de performance. */
export function Mng15Universidade() {
  const conteudos = useService(() => mngConteudoService.list(), [])
  const [tab, setTab] = useState<MngConteudoTipo>('curso')
  const [form, setForm] = useState<{ tipo: MngConteudoTipo; item?: MngConteudo } | null>(null)

  const dados = conteudos.status === 'success' ? conteudos.data : []
  const lista = useMemo(() => dados.filter((c) => c.tipo === tab), [dados, tab])
  const tabAtual = TABS.find((t) => t.key === tab)!

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MngTopBar />
        <PageHeader
          title="Academia YNA" subtitle="CMS de cursos, lives e artigos." className="mt-2 lg:mt-0"
          action={<Button variant="secondary" iconLeft="ph:plus-bold" onClick={() => setForm({ tipo: tab })}><span className="hidden sm:inline">Novo {tabAtual.singular}</span></Button>}
        />

        {/* Tabs por tipo de conteúdo */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {TABS.map((t) => {
            const ativo = tab === t.key
            const n = dados.filter((c) => c.tipo === t.key).length
            return (
              <button key={t.key} onClick={() => setTab(t.key)} aria-pressed={ativo}
                className={`flex items-center gap-2 rounded-pill border-[1.5px] px-4 py-2 font-heading text-sm font-medium transition-colors ${ativo ? 'border-primary bg-primary-50 text-primary dark:text-primary-300' : 'border-border bg-surface text-ink-secondary hover:border-border-strong hover:text-ink'}`}>
                <Icon icon={t.icon} width={16} aria-hidden /> {t.label}
                <span className={`rounded-pill px-1.5 text-[11px] font-semibold ${ativo ? 'bg-primary/15' : 'bg-surface-2 text-ink-muted'}`}>{n}</span>
              </button>
            )
          })}
        </div>

        {conteudos.status === 'loading' && <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}</div>}
        {conteudos.status === 'error' && <ErrorState message={conteudos.message} onRetry={conteudos.reload} />}
        {conteudos.status === 'success' && (
          <div className="flex flex-col gap-2">
            {lista.map((c) => (
              <button key={c.id} onClick={() => setForm({ tipo: c.tipo, item: c })} className="rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:border-border-strong">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white ${coverClass[capa(c)]}`}><Icon icon={TABS.find((t) => t.key === c.tipo)!.icon} width={20} aria-hidden /></div>
                    <div className="min-w-0">
                      <p className="truncate font-heading text-sm font-semibold text-ink">{c.titulo}</p>
                      <p className="truncate text-[12px] text-ink-secondary">{resumo(c)}</p>
                    </div>
                  </div>
                  <Badge tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
                  <span className="inline-flex items-center gap-1 rounded-pill bg-surface-2 px-2.5 py-1 text-ink-secondary"><Icon icon="ph:users-three-bold" width={12} aria-hidden /> {c.publicoTipos.length === 0 ? 'Todos os tipos' : c.publicoTipos.map(tipoNome).join(', ')}</span>
                  {c.status === 'publicado' && <span className="text-ink-muted"><Icon icon="ph:eye-bold" width={12} className="mr-1 inline" aria-hidden />{c.metrics.visualizacoes.toLocaleString('pt-BR')} views</span>}
                  {c.status === 'publicado' && <span className="text-ink-muted"><Icon icon="ph:chart-line-up-bold" width={12} className="mr-1 inline" aria-hidden />{c.metrics.engajamento}% engajamento</span>}
                  <span className="text-ink-muted">atualizado {fmtData(c.atualizadoEm)}</span>
                </div>
              </button>
            ))}
            {lista.length === 0 && <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-sm text-ink-secondary">Nenhum {tabAtual.singular} cadastrado.</div>}
          </div>
        )}
      </div>

      <Sheet open={form !== null} onClose={() => setForm(null)} title={`${form?.item ? 'Editar' : 'Novo'} ${form ? TABS.find((t) => t.key === form.tipo)!.singular : ''}`} icon={form ? TABS.find((t) => t.key === form.tipo)!.icon : undefined} size="lg">
        {form && <ConteudoForm tipo={form.tipo} inicial={form.item} onClose={() => setForm(null)} onSaved={() => { setForm(null); conteudos.reload() }} />}
      </Sheet>
    </div>
  )
}

const capa = (c: MngConteudo): CoverKey => (c.tipo === 'curso' ? c.cover : c.tipo === 'artigo' ? (c.imagem ?? 'lavender') : 'lavender')
function resumo(c: MngConteudo): string {
  if (c.tipo === 'curso') return `${c.autor} · ${NIVEL_LABEL[c.nivel]} · ${c.aulas.length} aulas · ${c.aulas.reduce((t, a) => t + a.duracaoMin, 0)} min`
  if (c.tipo === 'live') return `${c.palestrante} · ${fmtData(c.data)} ${c.horario} · ${c.categoria === 'supervisao' ? 'Supervisão' : 'Conteúdo'}`
  return `${c.autor} · ${c.tema} · ${c.tempoLeituraMin} min de leitura`
}

/* ── Formulário de cadastro/edição por tipo ── */
const ZERO_METRICS = { visualizacoes: 0, alcance: 0, conclusaoPct: 0, engajamento: 0 }

function ConteudoForm({ tipo, inicial, onClose, onSaved }: { tipo: MngConteudoTipo; inicial?: MngConteudo; onClose: () => void; onSaved: () => void }) {
  const curso = inicial?.tipo === 'curso' ? inicial : undefined
  const live = inicial?.tipo === 'live' ? inicial : undefined
  const artigo = inicial?.tipo === 'artigo' ? inicial : undefined
  const singular = TABS.find((t) => t.key === tipo)!.singular
  const [salvando, setSalvando] = useState(false)

  // Compartilhados
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '')
  const [status, setStatus] = useState<MngConteudoStatus>(inicial?.status ?? 'rascunho')
  const [publico, setPublico] = useState<string[]>(inicial?.publicoTipos ?? [])
  // Curso
  const [autor, setAutor] = useState(curso?.autor ?? artigo?.autor ?? '')
  const [descricao, setDescricao] = useState(curso?.descricao ?? live?.descricao ?? '')
  const [tema, setTema] = useState(curso?.tema ?? artigo?.tema ?? ACADEMIA_TEMAS[0])
  const [trilha, setTrilha] = useState(curso?.trilha ?? ACADEMIA_TRILHAS[0])
  const [nivel, setNivel] = useState<MngNivel>(curso?.nivel ?? 'iniciante')
  const [cover, setCover] = useState<CoverKey>(curso?.cover ?? 'lavender')
  const [capaImagem, setCapaImagem] = useState<string | undefined>(curso?.capaImagem)
  const [aulas, setAulas] = useState<MngCursoAula[]>(curso?.aulas ?? [])
  const [materiais, setMateriais] = useState<string[]>(curso?.materiais ?? [])
  // Live
  const [categoria, setCategoria] = useState<'conteudo' | 'supervisao'>(live?.categoria ?? 'conteudo')
  const [palestrante, setPalestrante] = useState(live?.palestrante ?? '')
  const [data, setData] = useState(live?.data ?? '')
  const [horario, setHorario] = useState(live?.horario ?? '')
  const [duracaoMin, setDuracaoMin] = useState<number>(live?.duracaoMin ?? 60)
  const [transmissao, setTransmissao] = useState<'agendada' | 'replay'>(live?.transmissao ?? 'agendada')
  // Artigo
  const [subheadline, setSubheadline] = useState(artigo?.subheadline ?? '')
  const [tempoLeituraMin, setTempoLeituraMin] = useState<number>(artigo?.tempoLeituraMin ?? 5)
  const [imagem, setImagem] = useState<CoverKey>(artigo?.imagem ?? 'lavender')
  const [capaArt, setCapaArt] = useState<string | undefined>(artigo?.capaImagem)
  const [corpo, setCorpo] = useState<MngArtigoBloco[]>(artigo?.corpo ?? [])

  const valido = titulo.trim().length >= 3 && (
    tipo === 'curso' ? Boolean(autor.trim() && descricao.trim() && aulas.length > 0)
      : tipo === 'live' ? Boolean(palestrante.trim() && data && horario)
        : Boolean(autor.trim() && subheadline.trim() && corpo.length > 0)
  )

  const salvar = async () => {
    if (!valido) return
    setSalvando(true)
    const base = { id: inicial?.id ?? '', titulo: titulo.trim(), status, publicoTipos: publico, atualizadoEm: inicial?.atualizadoEm ?? '', metrics: inicial?.metrics ?? ZERO_METRICS }
    let c: MngConteudo
    if (tipo === 'curso') c = { ...base, tipo, autor: autor.trim(), descricao: descricao.trim(), tema, trilha, nivel, cover, capaImagem, aulas, materiais } as MngCurso
    else if (tipo === 'live') c = { ...base, tipo, categoria, palestrante: palestrante.trim(), descricao: descricao.trim(), data, horario, duracaoMin, transmissao, metrics: { ...base.metrics, espectadoresPico: (inicial?.tipo === 'live' ? inicial.metrics.espectadoresPico : 0) ?? 0 } } as MngLive
    else c = { ...base, tipo, subheadline: subheadline.trim(), autor: autor.trim(), tema, tempoLeituraMin, imagem, capaImagem: capaArt, corpo } as MngArtigo
    await mngConteudoService.salvar(c)
    onSaved()
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
      {/* Performance (só na edição) */}
      {inicial && <Performance conteudo={inicial} />}

      <Campo label={`Título do ${singular}`}><input className={inputCls} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={`Título do ${singular}`} /></Campo>

      {/* ── Curso ── */}
      {tipo === 'curso' && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Autor"><input className={inputCls} value={autor} onChange={(e) => setAutor(e.target.value)} /></Campo>
            <Campo label="Nível"><Sel value={nivel} onChange={(v) => setNivel(v as MngNivel)} opcoes={(['iniciante', 'intermediario', 'avancado'] as MngNivel[]).map((n) => ({ v: n, l: NIVEL_LABEL[n] }))} /></Campo>
            <Campo label="Tema"><Sel value={tema} onChange={setTema} opcoes={ACADEMIA_TEMAS.map((t) => ({ v: t, l: t }))} /></Campo>
            <Campo label="Trilha"><Sel value={trilha} onChange={setTrilha} opcoes={ACADEMIA_TRILHAS.map((t) => ({ v: t, l: t }))} /></Campo>
          </div>
          <Campo label="Descrição"><textarea className={inputCls} rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} /></Campo>
          <Capa imagem={capaImagem} cor={cover} onImagem={setCapaImagem} onCor={setCover} label="Capa do curso" nomeArquivo="capa-curso.jpg" />
          <AulasEditor aulas={aulas} onChange={setAulas} />
          <Arquivos label="Materiais complementares do curso" hint="conteúdos eletivos" itens={materiais} onChange={setMateriais} nomeBase="material-curso" />
        </>
      )}

      {/* ── Live ── */}
      {tipo === 'live' && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Palestrante"><input className={inputCls} value={palestrante} onChange={(e) => setPalestrante(e.target.value)} /></Campo>
            <Campo label="Categoria"><Sel value={categoria} onChange={(v) => setCategoria(v as 'conteudo' | 'supervisao')} opcoes={[{ v: 'conteudo', l: 'Conteúdo' }, { v: 'supervisao', l: 'Supervisão' }]} /></Campo>
            <Campo label="Data"><input type="date" className={inputCls} value={data} onChange={(e) => setData(e.target.value)} /></Campo>
            <Campo label="Horário"><input type="time" className={inputCls} value={horario} onChange={(e) => setHorario(e.target.value)} /></Campo>
            <Campo label="Duração (min)"><input type="number" className={inputCls} value={duracaoMin} onChange={(e) => setDuracaoMin(Number(e.target.value))} /></Campo>
            <Campo label="Transmissão"><Sel value={transmissao} onChange={(v) => setTransmissao(v as 'agendada' | 'replay')} opcoes={[{ v: 'agendada', l: 'Agendada' }, { v: 'replay', l: 'Replay' }]} /></Campo>
          </div>
          <Campo label="Descrição"><textarea className={inputCls} rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} /></Campo>
        </>
      )}

      {/* ── Artigo ── */}
      {tipo === 'artigo' && (
        <>
          <Campo label="Subtítulo"><input className={inputCls} value={subheadline} onChange={(e) => setSubheadline(e.target.value)} /></Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Autor"><input className={inputCls} value={autor} onChange={(e) => setAutor(e.target.value)} /></Campo>
            <Campo label="Tema"><Sel value={tema} onChange={setTema} opcoes={ACADEMIA_TEMAS.map((t) => ({ v: t, l: t }))} /></Campo>
            <Campo label="Tempo de leitura (min)"><input type="number" className={inputCls} value={tempoLeituraMin} onChange={(e) => setTempoLeituraMin(Number(e.target.value))} /></Campo>
          </div>
          <Capa imagem={capaArt} cor={imagem} onImagem={setCapaArt} onCor={setImagem} label="Capa do artigo" nomeArquivo="capa-artigo.jpg" />
          <CorpoEditor blocos={corpo} onChange={setCorpo} />
        </>
      )}

      {/* Público-alvo + status (compartilhados) */}
      <PublicoAlvo sel={publico} onChange={setPublico} />
      <Campo label="Status"><Sel value={status} onChange={(v) => setStatus(v as MngConteudoStatus)} opcoes={(['rascunho', 'publicado', 'arquivado'] as MngConteudoStatus[]).map((s) => ({ v: s, l: STATUS_LABEL[s] }))} /></Campo>

      <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button iconLeft="ph:check-bold" disabled={!valido || salvando} onClick={salvar}>{salvando ? 'Salvando…' : inicial ? 'Salvar alterações' : 'Publicar conteúdo'}</Button>
      </div>
    </div>
  )
}

/* ── Painel de performance ── */
function Performance({ conteudo }: { conteudo: MngConteudo }) {
  const m = conteudo.metrics
  const alcanceLabel = conteudo.tipo === 'curso' ? 'Matrículas' : conteudo.tipo === 'live' ? 'Inscritos' : 'Leitores'
  const conclusaoLabel = conteudo.tipo === 'curso' ? 'Conclusão' : conteudo.tipo === 'live' ? 'Comparecimento' : 'Leitura completa'
  const quarto = conteudo.tipo === 'live'
    ? { label: 'Pico simultâneo', valor: String(conteudo.metrics.espectadoresPico ?? 0) }
    : { label: 'Avaliação', valor: m.avaliacao ? `${m.avaliacao.toFixed(1)}★` : '—' }
  const tiles = [
    { label: 'Visualizações', valor: m.visualizacoes.toLocaleString('pt-BR') },
    { label: alcanceLabel, valor: m.alcance.toLocaleString('pt-BR') },
    { label: conclusaoLabel, valor: `${m.conclusaoPct}%` },
    quarto,
  ]
  return (
    <div className="rounded-lg border border-border bg-surface-2/40 p-4">
      <p className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-ink-muted"><Icon icon="ph:chart-bar-bold" width={14} className="text-primary dark:text-primary-300" aria-hidden /> Performance do conteúdo</p>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-lg border border-border bg-surface p-3 text-center">
            <p className="font-heading text-xl font-bold text-ink">{t.valor}</p>
            <p className="mt-0.5 text-[11px] text-ink-secondary">{t.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-2.5">
        <div className="mb-1 flex items-center justify-between text-[11.5px] text-ink-secondary"><span>Engajamento geral</span><span className="font-semibold text-ink">{m.engajamento}%</span></div>
        <div className="h-2 overflow-hidden rounded-pill bg-surface-2"><div className="h-full rounded-pill bg-gradient-to-r from-primary to-pink" style={{ width: `${m.engajamento}%` }} /></div>
      </div>
    </div>
  )
}

/* ── Editor de aulas (curso): vídeo, título, duração, autor, descrição,
   materiais complementares — reordenáveis. ── */
function AulasEditor({ aulas, onChange }: { aulas: MngCursoAula[]; onChange: (a: MngCursoAula[]) => void }) {
  const total = aulas.reduce((t, a) => t + (a.duracaoMin || 0), 0)
  const up = (id: string, patch: Partial<MngCursoAula>) => onChange(aulas.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  const remover = (id: string) => onChange(aulas.filter((x) => x.id !== id))
  const mover = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= aulas.length) return
    const arr = [...aulas]
    const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp
    onChange(arr)
  }
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[13px] font-semibold text-ink">Aulas <span className="font-normal text-ink-muted">· {aulas.length} · {total} min</span></span>
        <button onClick={() => onChange([...aulas, { id: uid(), titulo: '', duracaoMin: 10 }])} className="inline-flex items-center gap-1 text-[12.5px] font-medium text-primary hover:underline dark:text-primary-300"><Icon icon="ph:plus-bold" width={13} aria-hidden /> Adicionar aula</button>
      </div>
      {aulas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-4 text-center text-[12.5px] text-ink-muted">Adicione ao menos uma aula.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {aulas.map((a, i) => (
            <div key={a.id} className="rounded-lg border border-border bg-surface-2/40 p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 font-mono text-[11px] font-bold text-ink-secondary">{i + 1}</span>
                <input className={inputCls} value={a.titulo} onChange={(e) => up(a.id, { titulo: e.target.value })} placeholder="Título da aula" />
                <div className="flex shrink-0 items-center">
                  <button onClick={() => mover(i, -1)} disabled={i === 0} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-hover disabled:opacity-30" aria-label="Mover para cima"><Icon icon="ph:arrow-up-bold" width={15} aria-hidden /></button>
                  <button onClick={() => mover(i, 1)} disabled={i === aulas.length - 1} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-hover disabled:opacity-30" aria-label="Mover para baixo"><Icon icon="ph:arrow-down-bold" width={15} aria-hidden /></button>
                  <button onClick={() => remover(a.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:text-danger-ink" aria-label="Remover aula"><Icon icon="ph:trash-bold" width={15} aria-hidden /></button>
                </div>
              </div>
              {/* Vídeo */}
              <Upload label="Vídeo da aula" arquivo={a.video} onSet={() => up(a.id, { video: 'aula-video.mp4' })} onRemove={() => up(a.id, { video: undefined })} icon="ph:video-camera-bold" cta="Anexar vídeo" />
              <div className="mt-2 grid gap-2 sm:grid-cols-[7rem_1fr]">
                <label className="block"><span className="mb-1 block text-[11.5px] text-ink-muted">Duração (min)</span><input type="number" className={inputCls} value={a.duracaoMin} onChange={(e) => up(a.id, { duracaoMin: Number(e.target.value) })} /></label>
                <label className="block"><span className="mb-1 block text-[11.5px] text-ink-muted">Autor</span><input className={inputCls} value={a.autor ?? ''} onChange={(e) => up(a.id, { autor: e.target.value })} placeholder="Autor da aula" /></label>
              </div>
              <label className="mt-2 block"><span className="mb-1 block text-[11.5px] text-ink-muted">Descrição</span><textarea className={inputCls} rows={2} value={a.descricao ?? ''} onChange={(e) => up(a.id, { descricao: e.target.value })} placeholder="Sobre o que é a aula…" /></label>
              <div className="mt-2">
                <Arquivos label="Materiais complementares" itens={a.materiais ?? []} onChange={(m) => up(a.id, { materiais: m })} nomeBase={`material-aula-${i + 1}`} compact />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Capa: imagem (upload) ou, na ausência, uma cor. Reutilizada por curso,
   artigo e blocos de imagem. ── */
function Capa({ imagem, cor, onImagem, onCor, label = 'Capa', nomeArquivo = 'imagem.jpg', compact = false }: { imagem?: string; cor: CoverKey; onImagem: (v: string | undefined) => void; onCor: (c: CoverKey) => void; label?: string; nomeArquivo?: string; compact?: boolean }) {
  return (
    <div>
      <p className={`mb-1.5 ${compact ? 'text-[11.5px] text-ink-muted' : 'text-[13px] font-semibold text-ink'}`}>{label}</p>
      {imagem ? (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-2.5">
          <div className={`flex h-12 w-20 shrink-0 items-center justify-center rounded bg-gradient-to-br text-white ${coverClass[cor]}`}><Icon icon="ph:image-bold" width={20} aria-hidden /></div>
          <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{imagem}</span>
          <button onClick={() => onImagem(undefined)} className="shrink-0 rounded-lg px-2 py-1 text-[12.5px] font-medium text-ink-secondary transition-colors hover:text-danger-ink">Remover</button>
        </div>
      ) : (
        <>
          <button onClick={() => onImagem(nomeArquivo)} className="flex w-full items-center justify-center gap-2 rounded border-[1.5px] border-dashed border-border bg-surface px-4 py-3 text-[13px] font-medium text-ink-secondary transition-colors hover:border-primary hover:text-ink"><Icon icon="ph:upload-simple-bold" width={16} aria-hidden /> Enviar imagem</button>
          <p className="mb-1.5 mt-2.5 text-[12px] text-ink-secondary">Sem imagem? Escolha uma cor:</p>
          <div className="flex gap-2">
            {COVERS.map((c) => (
              <button key={c} onClick={() => onCor(c)} aria-label={c} aria-pressed={cor === c}
                className={`h-8 w-12 rounded-lg bg-gradient-to-br ${coverClass[c]} ring-2 transition-all ${cor === c ? 'ring-primary' : 'ring-transparent hover:ring-border-strong'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ── Editor de corpo do artigo (blocos: texto, mídia, listas) ── */
const BLOCO_META: Record<MngArtigoBloco['tipo'], { label: string; icon: string }> = {
  paragrafo: { label: 'Parágrafo', icon: 'ph:text-align-left-bold' },
  subtitulo: { label: 'Subtítulo', icon: 'ph:text-h-bold' },
  imagem: { label: 'Imagem', icon: 'ph:image-bold' },
  video: { label: 'Vídeo', icon: 'ph:video-camera-bold' },
  citacao: { label: 'Citação', icon: 'ph:quotes-bold' },
  lista: { label: 'Lista', icon: 'ph:list-bullets-bold' },
}
const novoBloco = (tipo: MngArtigoBloco['tipo']): MngArtigoBloco => {
  const id = uid()
  switch (tipo) {
    case 'subtitulo': return { id, tipo, texto: '' }
    case 'citacao': return { id, tipo, texto: '', fonte: '' }
    case 'lista': return { id, tipo, itens: [''] }
    case 'imagem': return { id, tipo, cor: 'lavender', legenda: '' }
    case 'video': return { id, tipo, titulo: '', duracao: '' }
    default: return { id, tipo: 'paragrafo', texto: '' }
  }
}

function CorpoEditor({ blocos, onChange }: { blocos: MngArtigoBloco[]; onChange: (b: MngArtigoBloco[]) => void }) {
  const patch = (id: string, p: Partial<MngArtigoBloco>) => onChange(blocos.map((b) => (b.id === id ? { ...b, ...p } as MngArtigoBloco : b)))
  const remover = (id: string) => onChange(blocos.filter((b) => b.id !== id))
  const mover = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= blocos.length) return
    const arr = [...blocos]; const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp; onChange(arr)
  }
  return (
    <div>
      <p className="mb-1.5 text-[13px] font-semibold text-ink">Conteúdo do artigo <span className="font-normal text-ink-muted">· {blocos.length} bloco(s)</span></p>
      {blocos.length > 0 && (
        <div className="mb-3 flex flex-col gap-3">
          {blocos.map((b, i) => (
            <div key={b.id} className="rounded-lg border border-border bg-surface-2/40 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-secondary"><Icon icon={BLOCO_META[b.tipo].icon} width={14} className="text-primary dark:text-primary-300" aria-hidden /> {BLOCO_META[b.tipo].label}</span>
                <div className="flex shrink-0 items-center">
                  <button onClick={() => mover(i, -1)} disabled={i === 0} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-hover disabled:opacity-30" aria-label="Mover para cima"><Icon icon="ph:arrow-up-bold" width={15} aria-hidden /></button>
                  <button onClick={() => mover(i, 1)} disabled={i === blocos.length - 1} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-hover disabled:opacity-30" aria-label="Mover para baixo"><Icon icon="ph:arrow-down-bold" width={15} aria-hidden /></button>
                  <button onClick={() => remover(b.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:text-danger-ink" aria-label="Remover bloco"><Icon icon="ph:trash-bold" width={15} aria-hidden /></button>
                </div>
              </div>
              <BlocoEditor bloco={b} patch={patch} />
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(BLOCO_META) as MngArtigoBloco['tipo'][]).map((t) => (
          <button key={t} onClick={() => onChange([...blocos, novoBloco(t)])} className="inline-flex items-center gap-1 rounded-pill border-[1.5px] border-border bg-surface px-2.5 py-1 text-[12px] font-medium text-ink-secondary transition-colors hover:border-primary hover:text-ink dark:hover:text-primary-300">
            <Icon icon={BLOCO_META[t].icon} width={13} aria-hidden /> {BLOCO_META[t].label}
          </button>
        ))}
      </div>
    </div>
  )
}

function BlocoEditor({ bloco, patch }: { bloco: MngArtigoBloco; patch: (id: string, p: Partial<MngArtigoBloco>) => void }) {
  if (bloco.tipo === 'paragrafo') return <textarea className={inputCls} rows={3} value={bloco.texto} onChange={(e) => patch(bloco.id, { texto: e.target.value })} placeholder="Texto do parágrafo…" />
  if (bloco.tipo === 'subtitulo') return <input className={inputCls} value={bloco.texto} onChange={(e) => patch(bloco.id, { texto: e.target.value })} placeholder="Subtítulo" />
  if (bloco.tipo === 'citacao') return (
    <div className="flex flex-col gap-2">
      <textarea className={inputCls} rows={2} value={bloco.texto} onChange={(e) => patch(bloco.id, { texto: e.target.value })} placeholder="Texto da citação…" />
      <input className={inputCls} value={bloco.fonte ?? ''} onChange={(e) => patch(bloco.id, { fonte: e.target.value })} placeholder="Fonte (opcional)" />
    </div>
  )
  if (bloco.tipo === 'lista') {
    const itens = bloco.itens
    const setItens = (v: string[]) => patch(bloco.id, { itens: v })
    return (
      <div className="flex flex-col gap-2">
        {itens.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-ink-muted">•</span>
            <input className={inputCls} value={it} onChange={(e) => setItens(itens.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`Item ${i + 1}`} />
            <button onClick={() => setItens(itens.filter((_, j) => j !== i))} className="shrink-0 text-ink-muted hover:text-danger-ink" aria-label="Remover item"><Icon icon="ph:x-bold" width={14} aria-hidden /></button>
          </div>
        ))}
        <button onClick={() => setItens([...itens, ''])} className="inline-flex items-center gap-1 self-start text-[12.5px] font-medium text-primary hover:underline dark:text-primary-300"><Icon icon="ph:plus-bold" width={13} aria-hidden /> Adicionar item</button>
      </div>
    )
  }
  if (bloco.tipo === 'imagem') return (
    <div className="flex flex-col gap-2">
      <Capa imagem={bloco.arquivo} cor={bloco.cor} onImagem={(v) => patch(bloco.id, { arquivo: v })} onCor={(c) => patch(bloco.id, { cor: c })} label="Imagem" nomeArquivo="imagem-artigo.jpg" compact />
      <input className={inputCls} value={bloco.legenda ?? ''} onChange={(e) => patch(bloco.id, { legenda: e.target.value })} placeholder="Legenda (opcional)" />
    </div>
  )
  // vídeo
  return (
    <div className="flex flex-col gap-2">
      <input className={inputCls} value={bloco.titulo ?? ''} onChange={(e) => patch(bloco.id, { titulo: e.target.value })} placeholder="Título do vídeo (opcional)" />
      <Upload label="Vídeo" arquivo={bloco.arquivo} onSet={() => patch(bloco.id, { arquivo: 'video-artigo.mp4' })} onRemove={() => patch(bloco.id, { arquivo: undefined })} icon="ph:video-camera-bold" cta="Anexar vídeo" />
      <input className={inputCls} value={bloco.duracao ?? ''} onChange={(e) => patch(bloco.id, { duracao: e.target.value })} placeholder="Duração (ex.: 6 min)" />
    </div>
  )
}

/* ── Lista de arquivos (materiais) ── */
function Arquivos({ label, hint, itens, onChange, nomeBase, compact = false }: { label: string; hint?: string; itens: string[]; onChange: (v: string[]) => void; nomeBase: string; compact?: boolean }) {
  return (
    <div>
      <p className={`mb-1.5 ${compact ? 'text-[11.5px] text-ink-muted' : 'text-[13px] font-semibold text-ink'}`}>{label}{hint && <span className="font-normal text-ink-muted"> · {hint}</span>}</p>
      {itens.length > 0 && (
        <div className="mb-2 flex flex-col gap-1.5">
          {itens.map((a, i) => (
            <div key={a + i} className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-[13px]">
              <span className="flex min-w-0 items-center gap-2 truncate"><Icon icon="ph:paperclip-bold" width={15} className="shrink-0 text-primary dark:text-primary-300" aria-hidden /> {a}</span>
              <button onClick={() => onChange(itens.filter((_, j) => j !== i))} className="shrink-0 text-ink-muted hover:text-danger-ink" aria-label="Remover arquivo"><Icon icon="ph:x-bold" width={14} aria-hidden /></button>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => onChange([...itens, `${nomeBase}-${itens.length + 1}.pdf`])} className="flex w-full items-center justify-center gap-2 rounded border-[1.5px] border-dashed border-border bg-surface px-4 py-2.5 text-[12.5px] font-medium text-ink-secondary transition-colors hover:border-primary hover:text-ink"><Icon icon="ph:plus-bold" width={14} aria-hidden /> Adicionar arquivo</button>
    </div>
  )
}

/* Upload simples (mock) de um único arquivo. */
function Upload({ label, arquivo, onSet, onRemove, icon, cta }: { label: string; arquivo?: string; onSet: () => void; onRemove: () => void; icon: string; cta: string }) {
  return (
    <div>
      <span className="mb-1 block text-[11.5px] text-ink-muted">{label}</span>
      {arquivo ? (
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-[13px]">
          <span className="flex min-w-0 items-center gap-2 truncate"><Icon icon={icon} width={15} className="shrink-0 text-primary dark:text-primary-300" aria-hidden /> {arquivo}</span>
          <button onClick={onRemove} className="shrink-0 text-ink-muted hover:text-danger-ink" aria-label="Remover"><Icon icon="ph:x-bold" width={14} aria-hidden /></button>
        </div>
      ) : (
        <button onClick={onSet} className="flex w-full items-center justify-center gap-2 rounded border-[1.5px] border-dashed border-border bg-surface px-4 py-2.5 text-[12.5px] font-medium text-ink-secondary transition-colors hover:border-primary hover:text-ink"><Icon icon={icon} width={15} aria-hidden /> {cta}</button>
      )}
    </div>
  )
}

/* ── Público-alvo (tipos de profissional; vazio = todos) ── */
function PublicoAlvo({ sel, onChange }: { sel: string[]; onChange: (v: string[]) => void }) {
  const toggle = (id: string) => onChange(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id])
  return (
    <div>
      <p className="mb-1.5 text-[13px] font-semibold text-ink">Público-alvo <span className="font-normal text-ink-muted">· vazio = todos os tipos</span></p>
      <div className="flex flex-wrap gap-1.5">
        {mngTiposProfissional.map((t) => {
          const on = sel.includes(t.id)
          return <button key={t.id} onClick={() => toggle(t.id)} className={`rounded-pill border-[1.5px] px-3 py-1 text-[12.5px] font-medium transition-colors ${on ? 'border-primary bg-primary-50 text-primary dark:text-primary-300' : 'border-border text-ink-secondary hover:border-border-strong hover:text-ink'}`}>{t.nome}</button>
        })}
      </div>
    </div>
  )
}

/* ── Helpers ── */
function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[13px] font-semibold text-ink">{label}</span>{children}</label>
}
function Sel({ value, onChange, opcoes }: { value: string; onChange: (v: string) => void; opcoes: { v: string; l: string }[] }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} appearance-none pr-9`}>
        {opcoes.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
      <Icon icon="ph:caret-down-bold" width={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden />
    </div>
  )
}
