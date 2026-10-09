import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { GarantiaTemplateActions } from '@/components/admin/garantia-template-actions'
import { listTemplates } from '@/lib/garantias/service'

export const dynamic = 'force-dynamic'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  if (user.user_metadata?.is_admin !== true) redirect('/admin/login?error=unauthorized')
}

export default async function TemplatesPage() {
  await checkAdmin()
  const templates = await listTemplates().catch(() => null)

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1 p-8 ml-64">
        <div className="space-y-6 max-w-5xl">
          <div>
            <Link href="/admin/garantias" className="inline-flex items-center gap-2 text-muted-foreground/60 hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4" /> Voltar às garantias
            </Link>
            <div className="flex items-center justify-between">
              <h1 className="font-display text-4xl text-foreground">TEMPLATES DE GARANTIA</h1>
              <Link href="/admin/garantias/templates/novo" className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-lg hover:bg-primary/90">
                <Plus className="w-5 h-5" /> Novo template
              </Link>
            </div>
            <p className="text-muted-foreground/60 mt-1">O prazo (mín. 18 meses), as cláusulas e as listas por defeito vêm daqui.</p>
          </div>

          {templates === null ? (
            <p className="text-red-400 border border-red-400/30 bg-red-400/10 rounded-lg px-4 py-3 text-sm">Falta correr a migração 005_garantias.sql no Supabase.</p>
          ) : (
            <div className="bg-secondary/30 border border-primary/10 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-primary/10 text-muted-foreground/60 font-mono text-xs uppercase">
                    <th className="p-4">Nome</th><th className="p-4">Prazo</th><th className="p-4">Estado</th><th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((t) => (
                    <tr key={t.id} className="border-b border-primary/5">
                      <td className="p-4">
                        <Link href={`/admin/garantias/templates/${t.id}`} className="text-foreground hover:text-primary">{t.nome}</Link>
                        {t.descricao && <p className="text-muted-foreground/50 text-sm">{t.descricao}</p>}
                      </td>
                      <td className="p-4 text-muted-foreground/80">{t.prazo_meses} meses</td>
                      <td className="p-4 text-sm">
                        {t.is_default && <span className="text-primary mr-2">Padrão</span>}
                        <span className={t.ativo ? 'text-green-400' : 'text-muted-foreground/50'}>{t.ativo ? 'Ativo' : 'Desativado'}</span>
                      </td>
                      <td className="p-4"><GarantiaTemplateActions template={t} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
