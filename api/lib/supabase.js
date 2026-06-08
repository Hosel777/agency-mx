import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const usingServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseKey = usingServiceRole ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.VITE_SUPABASE_ANON_KEY
const keyPreview = supabaseKey ? supabaseKey.substring(0, 8) + '...' : 'MISSING'

console.log(`Supabase: ${usingServiceRole ? 'service_role' : 'anon'} key (${keyPreview})`)

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials in environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})
