'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Phone, Mail, MessageCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { sendToMakeWebhookAsync } from '@/lib/webhook'
import type { Vehicle } from '@/lib/types'

const formSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(9, 'Telefone inválido'),
  message: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface VehicleInquiryFormProps {
  vehicle: Vehicle
}

export function VehicleInquiryForm({ vehicle }: VehicleInquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      
      const { error: dbError } = await supabase
        .from('leads')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message || `Interesse no veículo: ${vehicle.make} ${vehicle.model} ${vehicle.year}`,
          lead_type: 'vehicle_inquiry',
          vehicle_id: vehicle.id,
          source: 'website',
        })

      if (dbError) throw dbError

      // Send to Make webhook (non-blocking)
      sendToMakeWebhookAsync({
        name: data.name,
        email: data.email,
        phone: data.phone,
        preferred_vehicle_type: `${vehicle.make} ${vehicle.model}`,
        budget_range: vehicle.price.toString(),
        message: data.message || `Interesse no veículo: ${vehicle.make} ${vehicle.model} ${vehicle.year}`,
      })

      setIsSuccess(true)
      reset()
    } catch (err) {
      console.error('Error submitting form:', err)
      setError('Ocorreu um erro ao enviar o formulário. Por favor tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const whatsappNumber = '351910000000'
  const whatsappMessage = encodeURIComponent(
    `Olá! Tenho interesse no ${vehicle.make} ${vehicle.model} ${vehicle.year} (${vehicle.price.toLocaleString('pt-PT')}€). Podem dar-me mais informações?`
  )
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="font-display text-xl text-foreground mb-2">
          Mensagem Enviada!
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Entraremos em contacto consigo brevemente.
        </p>
        <Button
          variant="outline"
          onClick={() => setIsSuccess(false)}
          className="border-primary/30"
        >
          Enviar nova mensagem
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <a
          href={`tel:+351910000000`}
          className="flex items-center justify-center gap-2 p-3 bg-background border border-border/50 hover:border-primary/30 transition-colors"
        >
          <Phone className="w-4 h-4 text-[#2E6B9E]" />
          <span className="text-sm">Ligar</span>
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 p-3 bg-[#25D366] text-white hover:bg-[#20BA5C] transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">WhatsApp</span>
        </a>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 text-xs text-muted-foreground bg-card">
            ou preencha o formulário
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="O seu nome"
            className="bg-background border-border/50"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="seu@email.com"
            className="bg-background border-border/50"
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="+351 900 000 000"
            className="bg-background border-border/50"
          />
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="message">Mensagem (opcional)</Label>
          <Textarea
            id="message"
            {...register('message')}
            placeholder="Tem alguma questão específica?"
            rows={3}
            className="bg-background border-border/50 resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'A enviar...' : 'Pedir Informações'}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Ao submeter, aceita a nossa política de privacidade.
        </p>
      </form>
    </div>
  )
}
