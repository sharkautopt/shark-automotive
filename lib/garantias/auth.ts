import { createClient } from '@/lib/supabase/server'
import type { AdminUser } from './types'

/** Utilizador admin autenticado, ou null. Mesmo critério do resto do admin (user_metadata.is_admin). */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.is_admin !== true) return null
  return { id: user.id, email: user.email ?? null }
}

export async function requireAdminUser(): Promise<AdminUser> {
  const user = await getAdminUser()
  if (!user) throw new Error('Não autorizado')
  return user
}
