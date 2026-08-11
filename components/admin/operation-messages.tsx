'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { sendAdminMessage } from '@/app/admin/operacoes/actions'
import type { Message } from '@/lib/types'

export function OperationMessages({ operationId, initialMessages }: { operationId: string; initialMessages: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`admin-messages-${operationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `operation_id=eq.${operationId}` },
        (payload) => {
          setMessages((prev) => {
            const next = payload.new as Message
            if (prev.some((m) => m.id === next.id)) return prev
            return [...prev, next]
          })
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [operationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!body.trim() || sending) return
    setSending(true)
    const text = body.trim()
    setBody('')
    await sendAdminMessage(operationId, text)
    setSending(false)
  }

  return (
    <div className="bg-secondary/30 border border-primary/10 rounded-xl flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 ? (
          <p className="text-muted-foreground/50 text-center py-8">Sem mensagens ainda.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-3 rounded-lg ${m.sender === 'admin' ? 'bg-primary/15 text-foreground' : 'bg-background text-foreground'}`}>
                <p className="text-xs text-muted-foreground/50 mb-1 font-mono">{m.sender_name || (m.sender === 'admin' ? 'Equipa Shark' : 'Cliente')}</p>
                <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                <p className="text-[10px] text-muted-foreground/40 mt-1">{new Date(m.created_at).toLocaleString('pt-PT')}</p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-primary/10 p-4 flex gap-3">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Escreve uma resposta..."
          className="flex-1 bg-background border border-primary/20 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50"
        />
        <button onClick={handleSend} disabled={sending} className="bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )
}
