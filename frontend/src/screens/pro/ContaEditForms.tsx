import { useState } from 'react'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { usePro } from '../../contexts/ProContext'
import type { ProPJ } from '../../types'

/* Conteúdos de modal para editar os dados de conta e da PJ na tela de
   Configurações da Conta (PRO-25). Persistem via ProContext.updateProfile. */

export function ContaForm({ onClose }: { onClose: () => void }) {
  const { profile, updateProfile } = usePro()
  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [crp, setCrp] = useState(profile.crp)
  const [crpUf, setCrpUf] = useState(profile.crpUf)

  const salvar = () => {
    updateProfile({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, crp: crp.trim(), crpUf: crpUf.trim() })
    onClose()
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
      <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 90000-0000" />
      <div className="grid grid-cols-[1fr_88px] gap-3">
        <Input label="CRP" value={crp} onChange={(e) => setCrp(e.target.value)} />
        <Input label="UF" value={crpUf} onChange={(e) => setCrpUf(e.target.value.toUpperCase())} maxLength={2} />
      </div>
      <FormActions onClose={onClose} onSave={salvar} disabled={!name.trim() || !email.trim()} />
    </div>
  )
}

export function PJForm({ onClose }: { onClose: () => void }) {
  const { profile, updateProfile } = usePro()
  const pj = profile.pj
  const [razaoSocial, setRazaoSocial] = useState(pj?.razaoSocial ?? '')
  const [cnpj, setCnpj] = useState(pj?.cnpj ?? '')
  const [banco, setBanco] = useState(pj?.banco ?? '')
  const [agencia, setAgencia] = useState(pj?.agencia ?? '')
  const [conta, setConta] = useState(pj?.conta ?? '')
  const [operacao, setOperacao] = useState(pj?.operacao ?? '')
  const [pixChave, setPixChave] = useState(pj?.pixChave ?? '')

  const salvar = () => {
    const next: ProPJ = {
      cnpj: cnpj.trim(),
      razaoSocial: razaoSocial.trim(),
      banco: banco.trim(),
      agencia: agencia.trim(),
      conta: conta.trim(),
      operacao: operacao.trim() || undefined,
      pixChave: pixChave.trim() || undefined,
      documentos: pj?.documentos ?? [],
    }
    updateProfile({ pj: next })
    onClose()
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-6 lg:px-6">
      <Input label="Razão social" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} />
      <Input label="CNPJ" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />

      <p className="mt-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">Dados bancários</p>
      <Input label="Banco" value={banco} onChange={(e) => setBanco(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Agência" value={agencia} onChange={(e) => setAgencia(e.target.value)} />
        <Input label="Conta corrente" value={conta} onChange={(e) => setConta(e.target.value)} />
      </div>
      <Input label="Operação" hint="Quando aplicável (ex.: Caixa)" value={operacao} onChange={(e) => setOperacao(e.target.value)} />
      <Input label="Chave Pix" value={pixChave} onChange={(e) => setPixChave(e.target.value)} />

      <FormActions onClose={onClose} onSave={salvar} disabled={!razaoSocial.trim() || !cnpj.trim()} />
    </div>
  )
}

function FormActions({ onClose, onSave, disabled }: { onClose: () => void; onSave: () => void; disabled?: boolean }) {
  return (
    <div className="mt-2 flex gap-3">
      <Button variant="secondary" fullWidth onClick={onClose}>Cancelar</Button>
      <Button fullWidth disabled={disabled} iconLeft="ph:check-bold" onClick={onSave}>Salvar</Button>
    </div>
  )
}
