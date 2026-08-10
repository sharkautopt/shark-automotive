import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Lazily instantiate the service-role client so that importing this module
// (e.g. during Next.js "collect page data" at build time) never throws when
// env vars are not yet injected. The client is only created on first use.
let _supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Supabase env vars missing (URL / SERVICE_ROLE_KEY)')
  }

  _supabase = createClient(url, key, { auth: { persistSession: false } })
  return _supabase
}

export interface ContentItem {
  page: string
  section: string
  content_key: string
  value: string | null
  content_type: 'text' | 'textarea' | 'image' | 'number'
  locked: boolean
}

/**
 * Get page content from CMS, with fallback to provided defaults
 * @param page - Page name (e.g., 'home', 'protocolo')
 * @param section - Section within page (e.g., 'hero', 'stats')
 * @param key - Content key (e.g., 'headline', 'tagline')
 * @param defaultValue - Fallback value if not found in CMS
 */
export async function getPageContent(
  page: string,
  section: string,
  key: string,
  defaultValue: string
): Promise<string> {
  try {
    const { data, error } = await getSupabase()
      .from('site_content')
      .select('value')
      .eq('page', page)
      .eq('section', section)
      .eq('content_key', key)
      .single()

    if (error) {
      console.log(`[CMS] Fallback for ${page}/${section}/${key}:`, defaultValue)
      return defaultValue
    }

    const value = data?.value || defaultValue
    return value
  } catch (err) {
    console.error(`[CMS] Error fetching ${page}/${section}/${key}:`, err)
    return defaultValue
  }
}

/**
 * Get multiple content items for a page section at once (more efficient)
 * @param page - Page name
 * @param section - Section name
 * @param defaults - Object mapping content_key to defaultValue
 */
export async function getPageSection(
  page: string,
  section: string,
  defaults: Record<string, string>
): Promise<Record<string, string>> {
  try {
    const { data, error } = await getSupabase()
      .from('site_content')
      .select('content_key, value')
      .eq('page', page)
      .eq('section', section)

    if (error) {
      console.log(`[CMS] Fallback for ${page}/${section}`)
      return defaults
    }

    const result: Record<string, string> = {}
    for (const key of Object.keys(defaults)) {
      const item = data?.find(d => d.content_key === key)
      result[key] = item?.value || defaults[key]
    }

    return result
  } catch (err) {
    console.error(`[CMS] Error fetching ${page}/${section}:`, err)
    return defaults
  }
}

/**
 * Update content and create audit log entry
 * @internal - Used only by admin API routes
 */
export async function updatePageContent(
  page: string,
  section: string,
  key: string,
  newValue: string,
  userId: string,
  reason?: string
): Promise<boolean> {
  try {
    // Get current value for audit
    const { data: current } = await getSupabase()
      .from('site_content')
      .select('id, value, locked')
      .eq('page', page)
      .eq('section', section)
      .eq('content_key', key)
      .single()

    if (!current) {
      console.error(`[CMS] Content not found: ${page}/${section}/${key}`)
      return false
    }

    if (current.locked) {
      console.error(`[CMS] Refusing to edit locked field: ${page}/${section}/${key}`)
      return false
    }

    // Update content
    const { error: updateError } = await getSupabase()
      .from('site_content')
      .update({
        value: newValue,
        updated_at: new Date().toISOString(),
        updated_by: userId
      })
      .eq('id', current.id)

    if (updateError) {
      console.error(`[CMS] Update failed:`, updateError)
      return false
    }

    // Create audit log
    await getSupabase().from('content_audit_log').insert({
      content_id: current.id,
      page,
      section,
      content_key: key,
      old_value: current.value,
      new_value: newValue,
      changed_by: userId,
      reason: reason || 'Manual edit'
    })

    return true
  } catch (err) {
    console.error(`[CMS] Update error:`, err)
    return false
  }
}

/**
 * Get all content for a page (for admin preview/export)
 */
export async function getPageAllContent(page: string): Promise<ContentItem[]> {
  try {
    const { data, error } = await getSupabase()
      .from('site_content')
      .select('*')
      .eq('page', page)
      .order('section, content_key')

    if (error) throw error
    return data || []
  } catch (err) {
    console.error(`[CMS] Error fetching page content:`, err)
    return []
  }
}
