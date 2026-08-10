'use client'

import { useState } from 'react'
import type { Profile } from '@/lib/types'
import { updateProfile, sendPasswordReset, clientSignOut } from '@/app/area-cliente/actions'

export function SettingsSection({ profile }: { profile: Profile }) {
  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [email, setEmail] = useState(profile.email ?? '')
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [notify, setNotify] = useState(profile.notification_email)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const res = await updateProfile({ full_name: fullName, email, phone, notification_email: notify })
    setSaving(false)
    setMessage(res.error ? res.error : 'Alterações guardadas.')
  }

  async function resetPassword() {
    const res = await sendPasswordReset()
    setMessage(res.error ? res.error : 'Email de alteração de password enviado.')
  }

  return (
    <section className="max-w-2xl border border-[#C8C4BC] bg-white">
      <header className="border-b border-[#C8C4BC] px-6 py-4">
        <h2 className="font-bebas text-xl tracking-wide text-[#0D1B2A]">Definições</h2>
      </header>

      <form onSubmit={save} className="space-y-5 p-6">
        <Field label="Nome Completo" value={fullName} onChange={setFullName} />
        <Field label="Email" type="email" value={email} onChange={setEmail} />
        <Field label="Telefone" value={phone} onChange={setPhone} />

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={notify}
            onChange={(e) => setNotify(e.target.checked)}
            className="h-4 w-4 accent-[#0D1B2A]"
          />
          <span className="text-sm text-[#0D1B2A]">Receber notificações por email</span>
        </label>

        {message && <p className="font-mono text-[11px] uppercase tracking-wider text-[#0D1B2A]/70">{message}</p>}

        <div className="flex flex-wrap gap-3 border-t border-[#C8C4BC] pt-5">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#0D1B2A] px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-[#E8E4DC] hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'A guardar...' : 'Guardar Alterações'}
          </button>
          <button
            type="button"
            onClick={resetPassword}
            className="border border-[#0D1B2A] px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-[#0D1B2A] hover:bg-[#0D1B2A] hover:text-[#E8E4DC]"
          >
            Alterar Password
          </button>
          <button
            type="button"
            onClick={() => clientSignOut()}
            className="ml-auto border border-[#C8C4BC] px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-[#0D1B2A]/70 hover:border-[#0D1B2A] hover:text-[#0D1B2A]"
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
      <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-[#0D1B2A]/50">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-[#C8C4BC] bg-white px-3 py-2 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A]"
      />
    </div>
  )
}
