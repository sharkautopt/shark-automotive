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
  preferredMakes: z.string().min(1, 'Indique pelo menos uma marca'),
  preferredModels: z.string().optional(),
  budgetMin: z.string().optional(),
  budgetMax: z.string().min(1, 'Indique o orçamento máximo'),
  specifications: z.string().optional(),
  message: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export function ImportRequestForm() {
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
          lead_type: 'import_request',
          preferred_makes: data.preferredMakes.split(',').map(s => s.trim()),
          preferred_models: data.preferredModels ? data.preferredModels.split(',').map(s => s.trim()) : null,
          budget_min: data.budgetMin ? parseFloat(data.budgetMin) : null,
          budget_max: parseFloat(data.budgetMax),
          message: `Especificações: ${data.specifications || 'N/D'}\n\nMensagem: ${data.message || 'N/D'}`,
          source: 'website_import_page',
        })

      if (dbError) throw dbError

      // Send to Make webhook (non-blocking)
      sendToMakeWebhookAsync({
        name: data.name,
        email: data.email,
        phone: data.phone,
        preferred_vehicle_type: data.preferredMakes,
        budget_range: `${data.budgetMin || '0'} - ${data.budgetMax}€`,
        import_on_demand_interest: "Sim",
        message: `Modelos: ${data.preferredModels || 'N/D'} | Especificações: ${data.specifications || 'N/D'} | ${data.message || ''}`,
      })

      setIsSuccess(true)
      reset()
    } catch (err) {
      console.error('Error submitting form:', err)
      setError('Ocorreu um erro ao enviar o pedido. Por favor tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <section className="py-24 lg:py-32">
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
              Pedido Recebido!
            </h2>
            <p className="text-muted-foreground mb-8">
              O seu pedido de importação foi recebido com sucesso. 
              A nossa equipa irá analisar os requisitos e contactá-lo dentro de 24 horas úteis.
            </p>
            <Button
              variant="outline"
              onClick={() => setIsSuccess(false)}
              className="border-primary/30"
            >
              Submeter Novo Pedido
            </Button>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 lg:py-32" id="formulario">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Pedido de Importação"
          title="SOLICITAR PESQUISA"
          description="Preencha o formulário com as especificações do veículo pretendido. Entraremos em contacto em 24 horas."
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

            <div>
              <Label>Telefone *</Label>
              <Input
                {...register('phone')}
                placeholder="+351 900 000 000"
                className="bg-background border-border/50"
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <Label>Marca(s) Pretendida(s) *</Label>
              <Input
                {...register('preferredMakes')}
                placeholder="Ex: BMW, Mercedes, Audi"
                className="bg-background border-border/50"
              />
              {errors.preferredMakes && <p className="text-xs text-red-500 mt-1">{errors.preferredMakes.message}</p>}
            </div>

            <div>
              <Label>Modelo(s) (opcional)</Label>
              <Input
                {...register('preferredModels')}
                placeholder="Ex: M3, Classe E, RS6"
                className="bg-background border-border/50"
              />
            </div>

            <div>
              <Label>Orçamento Máximo *</Label>
              <Input
                type="number"
                {...register('budgetMax')}
                placeholder="Ex: 75000"
                className="bg-background border-border/50"
              />
              {errors.budgetMax && <p className="text-xs text-red-500 mt-1">{errors.budgetMax.message}</p>}
            </div>

            <div className="md:col-span-2">
              <Label>Especificações Desejadas</Label>
              <Textarea
                {...register('specifications')}
                placeholder="Ex: Cor branca ou prata, interior couro preto, menos de 30.000km, ano 2022 ou mais recente, pacote M Sport..."
                rows={3}
                className="bg-background border-border/50 resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Mensagem Adicional</Label>
              <Textarea
                {...register('message')}
                placeholder="Outras informações relevantes..."
                rows={3}
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
                Enviar Pedido de Importação
              </>
            )}
          </Button>
        </motion.form>
      </div>
    </section>
  )
}
