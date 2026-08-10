import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false }
  }
)

interface SeedItem {
  page: string
  section: string
  content_key: string
  value: string | null
  content_type: 'text' | 'textarea' | 'image' | 'number'
  locked: boolean
}

// HOME PAGE SEED DATA
const HOME_CONTENT: SeedItem[] = [
  // HERO
  { page: 'home', section: 'hero', content_key: 'headline_line1', value: 'IMPORTADO. VERIFICADO.', content_type: 'text', locked: false },
  { page: 'home', section: 'hero', content_key: 'headline_line2', value: 'ENTREGUE.', content_type: 'text', locked: false },
  { page: 'home', section: 'hero', content_key: 'tagline', value: 'Zero Conversas. Total Transparência.', content_type: 'text', locked: false },
  { page: 'home', section: 'hero', content_key: 'cta_inventory', value: 'Ver Inventário', content_type: 'text', locked: false },
  { page: 'home', section: 'hero', content_key: 'cta_import', value: 'Importação Sob Encomenda', content_type: 'text', locked: false },
  { page: 'home', section: 'hero', content_key: 'background_image', value: '/images/bts/mini-cooper-s-golden-hour.jpg', content_type: 'image', locked: false },

  // STATS
  { page: 'home', section: 'stats', content_key: 'stat_1_value', value: '3', content_type: 'text', locked: false },
  { page: 'home', section: 'stats', content_key: 'stat_1_label', value: 'Viaturas em Stock', content_type: 'text', locked: false },
  { page: 'home', section: 'stats', content_key: 'stat_1_description', value: 'Verificadas 150 Pontos', content_type: 'text', locked: false },
  { page: 'home', section: 'stats', content_key: 'stat_2_value', value: '100%', content_type: 'text', locked: false },
  { page: 'home', section: 'stats', content_key: 'stat_2_label', value: 'Documentação Confirmada', content_type: 'text', locked: false },
  { page: 'home', section: 'stats', content_key: 'stat_2_description', value: 'Historial validado', content_type: 'text', locked: false },
  { page: 'home', section: 'stats', content_key: 'stat_3_value', value: 'ZERO', content_type: 'text', locked: false },
  { page: 'home', section: 'stats', content_key: 'stat_3_label', value: 'Surpresas', content_type: 'text', locked: false },
  { page: 'home', section: 'stats', content_key: 'stat_3_description', value: 'Total transparência', content_type: 'text', locked: false },
  { page: 'home', section: 'stats', content_key: 'stat_4_value', value: '15%', content_type: 'text', locked: false },
  { page: 'home', section: 'stats', content_key: 'stat_4_label', value: 'Poupança Média', content_type: 'text', locked: false },
  { page: 'home', section: 'stats', content_key: 'stat_4_description', value: 'Face a concessionários', content_type: 'text', locked: false },
]

async function createTables() {
  console.log('📦 Creating database tables...')

  try {
    // Test if tables exist by querying them
    const { error: testError } = await supabase
      .from('site_content')
      .select('id')
      .limit(1)

    if (testError && testError.message.includes('does not exist')) {
      console.log('  Creating site_content table...')
      // Tables don't exist - would need to run migration manually via Supabase UI
      console.warn('  ⚠️  Tables do not exist yet. Please run this SQL in your Supabase dashboard:')
      const migration = fs.readFileSync(
        path.join(process.cwd(), 'lib/supabase/migrations/001_create_cms_tables.sql'),
        'utf-8'
      )
      console.log('\n' + migration + '\n')
      throw new Error('Please execute the SQL migration in Supabase dashboard, then run this script again.')
    }

    console.log('✓ Tables ready')
  } catch (err) {
    throw err
  }
}

async function seedContent() {
  console.log('\n📝 Seeding HOME page content...')

  const results = []

  for (const item of HOME_CONTENT) {
    const { data, error } = await supabase
      .from('site_content')
      .upsert(
        {
          page: item.page,
          section: item.section,
          content_key: item.content_key,
          value: item.value,
          content_type: item.content_type,
          locked: item.locked,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'page,section,content_key' }
      )
      .select()

    results.push({
      key: `${item.section}.${item.content_key}`,
      expected: item.value,
      seeded: data?.[0]?.value,
      match: data?.[0]?.value === item.value,
      error: error?.message
    })

    if (error) {
      console.error(`  ❌ ${item.section}.${item.content_key}:`, error.message)
    }
  }

  return results
}

function generateVerificationReport(results: any[]) {
  console.log('\n' + '='.repeat(80))
  console.log('🔍 SEEDING VERIFICATION REPORT')
  console.log('='.repeat(80))

  let successCount = 0
  let errorCount = 0

  console.log('\n### HOME PAGE (' + results.length + ' items)')
  console.log('-'.repeat(80))

  let currentSection = ''
  for (const result of results) {
    const [section] = result.key.split('.')

    if (section !== currentSection) {
      currentSection = section
      console.log(`\n#### ${section.toUpperCase()}`)
    }

    if (result.match && !result.error) {
      console.log(`  [✓] ${result.key}: "${result.expected}"`)
      successCount++
    } else {
      console.log(`  [✗] ${result.key}`)
      console.log(`      Expected: "${result.expected}"`)
      console.log(`      Got:      "${result.seeded}"`)
      if (result.error) {
        console.log(`      Error:    ${result.error}`)
      }
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log(`Summary: ${successCount} ✓ | ${errorCount} ✗`)
  console.log('='.repeat(80) + '\n')

  if (errorCount > 0) {
    console.error(`⚠️  ${errorCount} items failed to seed. Review above.`)
    process.exit(1)
  } else {
    console.log('✨ All HOME page content seeded successfully!')
  }
}

async function main() {
  console.log('🚀 CMS Setup Started\n')

  try {
    // Step 1: Create tables
    await createTables()

    // Step 2: Seed content and collect results
    const results = await seedContent()

    // Step 3: Generate verification report
    generateVerificationReport(results)

    console.log('✅ CMS setup complete! Ready for Phase 1: HOME refactoring.\n')
  } catch (err) {
    console.error('❌ Setup failed:', err)
    process.exit(1)
  }
}

main()
