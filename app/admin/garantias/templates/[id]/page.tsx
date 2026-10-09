import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { GarantiaTemplateForm } from '@/components/admin/garantia-template-form'
import { getTemplate } from '@/lib/garantias/service'

export const dynamic = 'force-dynamic'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  if (user.user_metadata?.is_admin !== true) redirect('/admin/login?error=unauthorized')
}

export default async function EditarTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  await checkAdmin()
  const { id } = await params
  const template = await getTemplate(id)
  if (!template) notFound()
  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1 p-8 ml-64">
        <div className="space-y-6 max-w-4xl">
          <Link href="/admin/garantias/templates" className="inline-flex items-center gap-2 text-muted-foreground/60 hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Voltar aos templates
          </Link>
          <h1 className="font-display text-4xl text-foreground">{template.nome.toUpperCase()}</h1>
          <GarantiaTemplateForm template={template} />
        </div>
      </main>
    </div>
  )
}
