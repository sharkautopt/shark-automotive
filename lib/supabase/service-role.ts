// SERVER ONLY — never import in client components
// Uses the Supabase service-role key to bypass RLS for admin operations.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (_client) return _client
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }
  _client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  return _client
}

// Lazy proxy: the key is only validated the first time the client is actually
// used at runtime (never at module-evaluation / build time).
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getClient()
    const value = Reflect.get(client as object, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
