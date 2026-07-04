/* Canal simples para simular, no protótipo, a comunicação entre a sala do
   profissional e a do beneficiário quando a próxima sessão já entrou enquanto
   o profissional finaliza a anterior. Usa localStorage → o evento chega às
   OUTRAS abas/janelas abertas (basta abrir as duas jornadas em abas diferentes).
   Em uma única aba, cada tela também simula o comportamento por conta própria. */

export type AvisoProfissional =
  | { tipo: 'aguardando' }
  | { tipo: 'atraso'; minutos: number }
  | { tipo: 'cancelado' }

export type ProximaSessaoEvento =
  | { origem: 'beneficiario'; acao: 'entrou'; apelido: string }
  | { origem: 'profissional'; aviso: AvisoProfissional }

const KEY = 'yna-proxima-sessao-evt'

export function emitirEvento(e: ProximaSessaoEvento): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ e, n: Math.random() }))
  } catch {
    /* ambiente sem localStorage — ignora (a simulação local continua funcionando) */
  }
}

export function inscreverEvento(cb: (e: ProximaSessaoEvento) => void): () => void {
  const handler = (ev: StorageEvent) => {
    if (ev.key !== KEY || !ev.newValue) return
    try { cb((JSON.parse(ev.newValue) as { e: ProximaSessaoEvento }).e) } catch { /* ignora payload inválido */ }
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}
