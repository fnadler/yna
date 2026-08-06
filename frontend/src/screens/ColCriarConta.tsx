import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { useApp } from '../contexts/AppContext'

/* COL — criação de conta leve (RF-B01): sem senha complexa, só o essencial
   para "Minha evolução" existir. Só é alcançada depois que a avaliação já
   foi enviada de forma anônima (ver NR1BenConclusao) — vincula a conta ao
   token guardado em /convite/:token. */

export function ColCriarConta() {
  const navigate = useNavigate()
  const { criarConta } = useApp()
  const [nome, setNome] = useState('')
  const [apelido, setApelido] = useState('')
  const [salvando, setSalvando] = useState(false)

  const valido = nome.trim().length >= 2

  const handleCriar = async () => {
    if (!valido) return
    setSalvando(true)
    await new Promise((r) => setTimeout(r, 500))
    criarConta({ nome: nome.trim(), apelido: apelido.trim() || nome.trim().split(' ')[0] })
    navigate('/meu-espaco', { replace: true })
  }

  return (
    <main className="flex flex-1 flex-col px-5 pb-10 pt-10 lg:pt-14">
      <div className="mx-auto w-full max-w-md animate-yna-slide-up">
        <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
          <Icon icon="ph:sparkle-bold" width={26} aria-hidden />
        </span>

        <h1 className="mt-5 text-[26px] font-extralight leading-[1.15] tracking-[-0.02em] text-ink lg:text-[32px]">
          Uma conta{' '}
          <span className="bg-yna-gradient-button bg-clip-text font-extrabold text-transparent">bem leve</span>
        </h1>

        <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
          Só o essencial: sem senha complexa, sem formulário longo. Você acessa depois pelo mesmo
          link que já tinha, ou por um novo e-mail de acesso.
        </p>

        <div className="mt-7 flex flex-col gap-4">
          <Input
            label="Como podemos te chamar"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoFocus
          />
          <Input
            label="Apelido (opcional)"
            placeholder="Como prefere ser chamado no dia a dia"
            value={apelido}
            onChange={(e) => setApelido(e.target.value)}
          />
        </div>

        <div className="mt-7 flex flex-col gap-2">
          <Button size="lg" fullWidth disabled={!valido || salvando} iconRight="ph:arrow-right-bold" onClick={handleCriar}>
            Criar minha conta
          </Button>
          <Button variant="ghost" fullWidth onClick={() => navigate('/despedida')}>
            Agora não
          </Button>
        </div>

        <p className="mt-6 flex items-start gap-2 text-[12px] leading-relaxed text-ink-muted">
          <Icon icon="ph:shield-check-bold" width={13} className="mt-0.5 shrink-0" aria-hidden />
          Sua conta não tem nenhum vínculo visível com a resposta que você já enviou: a chave que
          liga as duas coisas é sua, nunca da sua empresa.
        </p>
      </div>
    </main>
  )
}
