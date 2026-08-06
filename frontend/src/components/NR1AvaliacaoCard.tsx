import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useService } from '../hooks/useService'
import { useApp } from '../contexts/AppContext'
import { nr1ColaboradorService } from '../services/nr1'

/* NR1-BEN-01 — Entrada da avaliação psicossocial na home do colaborador
   (RF-B01, RF-B03).

   Só aparece quando há campanha em campo e a pessoa ainda não concluiu. O
   convite é do tamanho do que é: uma conversa de 8 minutos, não uma obrigação
   corporativa. Nenhuma menção a "NR-1" — isso é vocabulário de RH. */

export function NR1AvaliacaoCard() {
  const { nr1 } = useApp()
  const instrumento = useService(() => nr1ColaboradorService.instrumentoDaCampanha(), [])

  if (instrumento.status !== 'success' || !instrumento.data) return null
  if (nr1?.campanhaId === instrumento.data.campanha.id && nr1.concluida) return null

  const respondidas = Object.keys(nr1?.respostas ?? {}).length
  const emAndamento = respondidas > 0 && !nr1?.concluida

  return (
    <Link
      to="/avaliacao"
      className="group flex items-start gap-4 rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-hover"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:text-primary-300">
        <Icon icon="ph:chat-teardrop-dots-bold" width={22} aria-hidden />
      </span>

      <span className="min-w-0 flex-1">
        <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          {emAndamento ? 'Você começou' : 'Um convite'}
        </span>
        <span className="mt-1 block font-heading text-[16px] font-semibold leading-snug text-ink">
          {emAndamento ? 'Continue de onde parou' : 'Como tem sido o seu trabalho?'}
        </span>
        <span className="mt-1 block text-[13px] leading-relaxed text-ink-secondary">
          {emAndamento
            ? `Você já respondeu ${respondidas} ${respondidas === 1 ? 'pergunta' : 'perguntas'}. Dá para terminar em poucos minutos.`
            : 'Cerca de 8 minutos, anônimo. O que você contar ajuda a cuidar do ambiente de todo mundo.'}
        </span>
      </span>

      <Icon
        icon="ph:arrow-right-bold"
        width={17}
        className="mt-1 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  )
}
