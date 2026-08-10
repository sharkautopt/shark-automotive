import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/service-role'

export default async function AreaClienteLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Bootstrap a profile row if one does not exist yet.
  const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle()
  if (!profile) {
    await supabaseAdmin.from('profiles').insert({
      id: user.id,
      email: user.email,
      full_name: (user.user_metadata?.full_name as string) || null,
    })
  }

  return <div style={{ backgroundColor: '#F4F8FC', minHeight: '100vh' }}>{children}</div>
}
