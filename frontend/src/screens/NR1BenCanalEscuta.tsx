import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/Button'
import { Textarea } from '../components/Textarea'
import { Select } from '../components/Select'
import { MobileTopBar } from '../components/MobileTopBar'
import { PAGE_MAX_W } from '../lib/layout'
import { RELATO_CATEGORIA } from '../lib/nr1'
import { nr1CanalService } from '../services/nr1'
import { rhDepartamentos } from '../data/rhMock'
import type { Nr1RelatoCategoria } from '../types'

/* NR1-BEN-05 — Canal de escuta confidencial (RF-H01).

   Relato anônimo com protocolo de acompanhamento. Assédio moral e injustiça
   organizacional estão entre os fatores de risco do MTE — o canal é parte da
   gestão do risco, não um anexo.

   Informar a área é opcional: ajuda a apuração, mas em time pequeno pode
   reduzir o anonimato — e isso é dito na tela, não escondido. */

const CATEGORIAS: Nr1RelatoCategoria[] = ['assedio-moral', 'assedio-sexual', 'conflito', 'sobrecarga', 'outro']

export function NR1BenCanalEscuta() {
  const navigate = useNavigate()
  const [categoria, setCategoria] = useState<Nr1RelatoCategoria>('assedio-moral')
  const [descricao, setDescricao] = useState('')
  const [departamento, setDepartamento] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [protocolo, setProtocolo] = useState<string | null>(null)

  const valido = descricao.trim().length >= 20

  const enviar = async () => {
    if (!valido) return
    setEnviando(true)
    const r = await nr1CanalService.registrar({
      categoria,
      descricao: descricao.trim(),
      departamento: departamento || undefined,
    })
    setProtocolo(r.protocolo)
    setEnviando(false)
  }

  if (protocolo) {
    return (
      <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
        <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
          <MobileTopBar />
          <div className="mx-auto w-full max-w-xl pt-6 animate-yna-slide-up">
            <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-success-bg text-success-ink">
              <Icon icon="ph:check-circle-bold" width={26} aria-hidden />
            </span>
            <h1 className="mt-5 text-[26px] font-extralight leading-tight tracking-[-0.02em] text-ink">
              Recebemos o seu relato
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
              Guarde este número. É por ele que você acompanha o caso, e é a única forma de
              ligar você a este relato: nem o seu nome nem o seu e-mail foram registrados.
            </p>

            <div className="mt-5 rounded-lg border border-border bg-surface p-5 text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">Protocolo</p>
              <p className="mt-1.5 font-mono text-[24px] font-bold tracking-tight text-ink">{protocolo}</p>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-lg bg-surface-2 p-4">
              <Icon icon="ph:hand-heart-bold" width={19} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
              <p className="text-[12.5px] leading-relaxed text-ink-secondary">
                O canal cuida da apuração. Mas você também merece cuidado agora. Se quiser
                conversar com alguém, a rede da YNA está disponível para você.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <Button size="lg" fullWidth iconRight="ph:arrow-right-bold" onClick={() => navigate('/matches')}>
                Quero conversar com um profissional
              </Button>
              <Button variant="ghost" fullWidth onClick={() => navigate('/home')}>Voltar para o início</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-yna-gradient-soft dark:[background-image:var(--yna-gradient-dark)]">
      <div className={`mx-auto ${PAGE_MAX_W} px-5 lg:px-8 pt-0 lg:pt-9 pb-10`}>
        <MobileTopBar />

        <div className="mx-auto w-full max-w-xl pt-6">
          <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
            <Icon icon="ph:megaphone-simple-bold" width={26} aria-hidden />
          </span>

          <h1 className="mt-5 text-[28px] font-extralight leading-[1.15] tracking-[-0.02em] text-ink lg:text-[34px]">
            Canal de escuta
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
            Um espaço confidencial para registrar situações que precisam ser olhadas de perto:
            assédio, conflitos, sobrecarga. Você recebe um protocolo e não precisa se
            identificar.
          </p>

          <div className="mt-7 flex flex-col gap-5">
            <div>
              <label htmlFor="categoria" className="mb-1.5 block text-[13px] font-semibold text-ink">
                Sobre o que é
              </label>
              <Select
                id="categoria"
                value={categoria}
                onChange={(v) => setCategoria(v as Nr1RelatoCategoria)}
                options={CATEGORIAS.map((c) => ({ value: c, label: RELATO_CATEGORIA[c] }))}
              />
            </div>

            <div>
              <label htmlFor="relato" className="mb-1.5 block text-[13px] font-semibold text-ink">
                O que aconteceu
              </label>
              <Textarea
                id="relato"
                rows={7}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Conte no seu ritmo. Se puder, diga desde quando isso acontece e com que frequência."
              />
              <p className="mt-1.5 text-[11.5px] text-ink-muted">
                {descricao.trim().length < 20
                  ? 'Escreva um pouco mais para conseguirmos apurar (mínimo de 20 caracteres).'
                  : 'Evite escrever o seu próprio nome. Assim o relato continua anônimo.'}
              </p>
            </div>

            <div>
              <label htmlFor="area" className="mb-1.5 block text-[13px] font-semibold text-ink">
                Área <span className="font-normal text-ink-muted">(opcional)</span>
              </label>
              <Select
                id="area"
                value={departamento}
                onChange={setDepartamento}
                options={[{ value: '', label: 'Prefiro não informar' }, ...rhDepartamentos.map((d) => ({ value: d.nome, label: d.nome }))]}
              />
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">
                Informar a área ajuda a apuração, mas em times pequenos pode reduzir o seu
                anonimato. A escolha é sua.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-lg bg-surface-2 p-4">
            <Icon icon="ph:lock-bold" width={19} className="mt-0.5 shrink-0 text-primary dark:text-primary-300" aria-hidden />
            <p className="text-[12.5px] leading-relaxed text-ink-secondary">
              O relato vai para a equipe responsável pela apuração, com sigilo. Nenhuma
              liderança recebe o texto com identificação, e o retorno acontece pelo protocolo.
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-2">
            <Button size="lg" fullWidth iconRight="ph:paper-plane-tilt-bold" disabled={!valido || enviando} onClick={enviar}>
              {enviando ? 'Enviando…' : 'Enviar relato'}
            </Button>
            <Button variant="ghost" fullWidth onClick={() => navigate(-1)}>Cancelar</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
