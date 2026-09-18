'use client'

import { useState } from 'react'
import type { Profile } from '@/lib/types'
import { updateProfile, sendPasswordReset, clientSignOut } from '@/app/area-cliente/actions'

export function SettingsSection({ profile }: { profile: Profile }) {
  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [email, setEmail] = useState(profile.email ?? '')
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [notify, setNotify] = useState(profile.notification_email)
  const [nif, setNif] = useState(profile.nif ?? '')
  const [morada, setMorada] = useState(profile.morada ?? '')
  const [idDocumentNumber, setIdDocumentNumber] = useState(profile.id_document_number ?? '')
  const [idDocumentValidity, setIdDocumentValidity] = useState(profile.id_document_validity ?? '')
  const [birthDate, setBirthDate] = useState(profile.birth_date ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const res = await updateProfile({
      full_name: fullName,
      email,
      phone,
      notification_email: notify,
      nif,
      morada,
      id_document_number: idDocumentNumber,
      id_document_validity: idDocumentValidity,
      birth_date: birthDate,
    })
    setSaving(false)
    setMessage(res.error ? res.error : 'Alterações guardadas.')
  }

  async function resetPassword() {
    const res = await sendPasswordReset()
    setMessage(res.error ? res.error : 'Email de alteração de password enviado.')
  }

  return (
    <section className="max-w-2xl border border-border bg-card">
      <header className="border-b border-border px-6 py-4">
        <h2 className="font-display text-xl tracking-wide text-foreground">Definições</h2>
      </header>

      <form onSubmit={save} className="space-y-5 p-6">
        <Field label="Nome Completo" value={fullName} onChange={setFullName} />
        <Field label="Email" type="email" value={email} onChange={setEmail} />
        <Field label="Telefone" value={phone} onChange={setPhone} />

        <div className="border-t border-border pt-5">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Dados para documentos legais
          </p>
          <div className="space-y-5">
            <Field label="NIF" value={nif} onChange={setNif} />
            <Field label="Morada Completa" value={morada} onChange={setMorada} />
            <Field label="N.º Documento de Identificação" value={idDocumentNumber} onChange={setIdDocumentNumber} />
            <Field label="Validade do Documento" type="date" value={idDocumentValidity} onChange={setIdDocumentValidity} />
            <Field label="Data de Nascimento" type="date" value={birthDate} onChange={setBirthDate} />
          </div>
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={notify}
            onChange={(e) => setNotify(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          <span className="text-sm text-foreground">Receber notificações por email</span>
        </label>

        {message && <p className="font-mono text-[11px] uppercase tracking-wider text-secondary-foreground">{message}</p>}

        <div className="flex flex-wrap gap-3 border-t border-border pt-5">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'A guardar...' : 'Guardar Alterações'}
          </button>
          <button
            type="button"
            onClick={resetPassword}
            className="border border-primary px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Alterar Password
          </button>
          <button
            type="button"
            onClick={() => clientSignOut()}
            className="ml-auto border border-border px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:border-foreground hover:text-foreground"
          >
            Terminar Sessão
          </button>
        </div>
      </form>
    </section>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
      />
    </div>
  )
}
