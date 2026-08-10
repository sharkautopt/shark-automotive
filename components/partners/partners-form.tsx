'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { CheckCircle2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { SectionHeading } from '@/components/ui/section-heading'
import { createClient } from '@/lib/supabase/client'
import { sendToMakeWebhookAsync } from '@/lib/webhook'

const formSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(9, 'Telefone inválido'),
  message: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export function PartnersForm() {
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
          lead_type: 'business_partner',
          message: data.message || '',
          source: 'website_partners_page',
          priority: 'high',
        })

      if (dbError) throw dbError

      // Send to Make webhook (non-blocking)
      sendToMakeWebhookAsync({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: `Parceiro de Negócio | ${data.message || ''}`,
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

  if (isSuccess) {
    return (
      <section className="py-24 lg:py-32 bg-card/30 border-y border-border/50">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card/50 border border-border/50 p-12"
          >
            <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="font-display text-3xl text-foreground mb-4">
              Pedido Registado!
            </h2>
            <p className="text-muted-foreground mb-8">
              Obrigado pelo seu interesse. Entraremos em contacto consigo nas próximas 24 horas 
              para falar sobre as operações da Shark Automotive.
            </p>
            <Button
              variant="outline"
              onClick={() => setIsSuccess(false)}
              className="border-primary/30"
            >
              Enviar Novo Pedido
            </Button>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 lg:py-32 bg-card/30 border-y border-border/50" id="formulario">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Contacto"
          title="TEM INTERESSE?"
          description="O modelo de parceria da Shark é contratualizado individualmente por operação. Se tem interesse em participar, fale connosco directamente."
          className="mb-12"
        />

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit(onSubmit)}
          className="bg-card/50 border border-border/50 p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Nome Completo *</Label>
              <Input
                {...register('name')}
                placeholder="O seu nome"
                className="bg-background border-border/50"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                {...register('email')}
                placeholder="seu@email.com"
                className="bg-background border-border/50"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div className="md:col-span-2">
              <Label>Telefone *</Label>
              <Input
                {...register('phone')}
                placeholder="+351 900 000 000"
                className="bg-background border-border/50"
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
            </div>

            <div className="md:col-span-2">
              <Label>Mensagem (opcional)</Label>
              <Textarea
                {...register('message')}
                placeholder="Conte-nos um pouco sobre o seu interesse."
                rows={4}
                className="bg-background border-border/50 resize-none"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

          <Button
            type="submit"
            className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'A enviar...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Quero saber mais
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            A sua informação é confidencial e será tratada de acordo com a nossa política de privacidade.
          </p>
        </motion.form>

        <p className="text-xs text-muted-foreground/70 leading-relaxed mt-12 max-w-2xl mx-auto text-center">
          A participação em operações da Shark Automotive é formalizada por contrato de Associação 
          em Participação, nos termos do Código Comercial Português. Não constitui instrumento 
          financeiro regulado. Cada operação é independente e os resultados dependem do mercado.
        </p>
      </div>
    </section>
  )
}
