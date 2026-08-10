'use client'

import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Message } from '@/lib/types'
import { sendClientMessage } from '@/app/area-cliente/actions'

export function MessagesSection({
  operationId,
  initialMessages,
}: {
  operationId: string
  initialMessages: Message[]
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`messages-${operationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `operation_id=eq.${operationId}` },
        (payload) => {
          setMessages((prev) => {
            const next = payload.new as Message
            if (prev.some((m) => m.id === next.id)) return prev
            return [...prev, next]
          })
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [operationId])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = body.trim()
    if (!trimmed || sending) return
    setSending(true)
    setBody('')
    const res = await sendClientMessage(operationId, trimmed)
    setSending(false)
    if (res.error) setBody(trimmed)
  }

  return (
    <section className="flex h-[520px] flex-col border border-[#C8C4BC] bg-white">
      <header className="border-b border-[#C8C4BC] px-6 py-4">
        <h2 className="font-bebas text-xl tracking-wide text-[#0D1B2A]">Mensagens</h2>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          <p className="text-sm text-[#0D1B2A]/70">Sem mensagens. Inicia uma conversa com a equipa Shark.</p>
        ) : (
          messages.map((m) => {
            const isClient = m.sender === 'client'
            return (
              <div key={m.id} className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] border px-4 py-2 ${
                    isClient
                      ? 'border-[#0D1B2A] bg-[#0D1B2A] text-[#E8E4DC]'
                      : 'border-[#C8C4BC] bg-[#F4F8FC] text-[#0D1B2A]'
                  }`}
                >
                  <p className="font-mono text-[9px] uppercase tracking-widest opacity-70">
                    {m.sender_name || (isClient ? 'Tu' : 'Equipa Shark')}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{m.body}</p>
                  <p className="mt-1 text-right font-mono text-[9px] opacity-60">
                    {new Date(m.created_at).toLocaleString('pt-PT', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="flex gap-2 border-t border-[#C8C4BC] p-4">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escreve uma mensagem..."
          className="flex-1 border border-[#C8C4BC] bg-white px-3 py-2 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A]"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="flex items-center gap-2 bg-[#0D1B2A] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[#E8E4DC] hover:opacity-90 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          Enviar
        </button>
      </form>
    </section>
  )
}
