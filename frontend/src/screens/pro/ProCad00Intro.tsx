import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../../components/Button'

/* PRO-CAD-00 — Introdução do cadastro do perfil. Explica o que será preciso
   informar (inclui ter uma empresa/CNPJ) e as etapas. Quem não tem empresa
   recebe ajuda para abrir uma. Mesmo layout de foco do onboarding. */
const PRECISA = [
  { icon: 'ph:buildings-bold', txt: 'CNPJ da sua empresa + contrato social (para emitir nota fiscal)' },
  { icon: 'ph:bank-bold', txt: 'Dados bancários (banco, agência, conta, chave PIX)' },
  { icon: 'ph:graduation-cap-bold', txt: 'Formação, cursos e certificados' },
  { icon: 'ph:calendar-bold', txt: 'Sua disponibilidade de dias e horários' },
]
const ETAPAS = ['Dados da empresa', 'Perfil profissional', 'Formação', 'Disponibilidade']

export function ProCad00Intro() {
  const navigate = useNavigate()
  const [ajuda, setAjuda] = useState(false)

  return (
    <>
      {/* Header mobile: voltar */}
      <header className="flex lg:hidden items-center gap-3 px-5 pb-2 pt-8">
        <button
          onClick={() => navigate('/pro/conta-criada')}
          aria-label="Voltar"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-colors hover:bg-surface-hover"
        >
          <Icon icon="ph:arrow-left-bold" width={18} aria-hidden />
        </button>
      </header>

      <main className="flex-1 px-5 pt-6 pb-8 lg:pt-10 lg:pb-28 animate-yna-slide-up">
        <div>
          <p className="mb-1 text-sm font-medium text-primary dark:text-primary-300">Cadastro do perfil</p>
          <h1 className="mt-1 text-[24px] lg:text-[40px] font-extralight leading-[1.15] lg:leading-[1.05] tracking-[-0.02em] text-ink">
            <span className="font-extrabold bg-yna-gradient-button bg-clip-text text-transparent">Vamos</span>{' '}montar o seu perfil
          </h1>
          <p className="mt-2 text-sm lg:text-[17px] leading-relaxed text-ink-secondary lg:max-w-[600px]">
            Para atender na YNA você precisa de uma <strong className="text-ink">empresa (PJ)</strong> para emitir nota fiscal. Tenha em mãos:
          </p>
        </div>

        <ul className="mt-5 flex flex-col gap-2.5">
          {PRECISA.map((p) => (
            <li key={p.txt} className="flex items-start gap-2.5 text-[13.5px] text-ink">
              <Icon icon={p.icon} width={18} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
              {p.txt}
            </li>
          ))}
        </ul>

        {/* Não tem empresa? */}
        <div className="mt-5 rounded-lg border border-border bg-surface p-4">
          <button onClick={() => setAjuda((v) => !v)} className="flex w-full items-center justify-between gap-2 text-left">
            <span className="flex items-center gap-2 text-[13.5px] font-semibold text-ink"><Icon icon="ph:question-bold" width={16} className="text-primary dark:text-primary-300" aria-hidden /> Ainda não tenho empresa</span>
            <Icon icon={ajuda ? 'ph:caret-up-bold' : 'ph:caret-down-bold'} width={14} className="text-ink-secondary" aria-hidden />
          </button>
          {ajuda && (
            <div className="mt-3 border-t border-border pt-3 text-[13px] leading-relaxed text-ink-secondary">
              <p>Abrir um CNPJ é rápido e, na maioria dos casos, sem custo (MEI ou Simples Nacional). A YNA tem um parceiro contábil que ajuda você a formalizar em poucos dias.</p>
              <Button variant="secondary" size="sm" className="mt-3" iconLeft="ph:handshake-bold" onClick={() => { /* parceiro contábil (simulado) */ }}>Falar com o parceiro contábil</Button>
            </div>
          )}
        </div>

        {/* Etapas */}
        <div className="mt-6">
          <p className="mb-2 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">Etapas do cadastro</p>
          <ol className="flex flex-col gap-1.5">
            {ETAPAS.map((e, i) => (
              <li key={e} className="flex items-center gap-2.5 text-[13.5px] text-ink">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 font-mono text-[11px] font-bold text-primary dark:text-primary-300">{i + 1}</span>
                {e}
              </li>
            ))}
          </ol>
        </div>
      </main>

      {/* Footer mobile */}
      <footer className="px-5 pb-8 lg:hidden">
        <Button size="lg" fullWidth iconRight="ph:arrow-right-bold" onClick={() => navigate('/pro/cadastro/etapas')}>Começar cadastro</Button>
      </footer>

      {/* Barra inferior desktop */}
      <div className="hidden lg:flex fixed bottom-0 left-0 right-0 z-20 h-[72px] items-center border-t border-border bg-surface/90 px-10 backdrop-blur-sm">
        <div className="flex-1">
          <button onClick={() => navigate('/pro/conta-criada')} className="flex items-center gap-2 font-heading text-sm font-medium text-ink-secondary transition-colors hover:text-ink">
            <Icon icon="ph:arrow-left-bold" width={16} aria-hidden />
            Voltar
          </button>
        </div>
        <Button iconRight="ph:arrow-right-bold" onClick={() => navigate('/pro/cadastro/etapas')}>Começar cadastro</Button>
      </div>
    </>
  )
}
