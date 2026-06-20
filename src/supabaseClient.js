import { createClient } from '@supabase/supabase-js'

// Vite exposes only env vars prefixed with VITE_ (see .env).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('YOUR-PROJECT')) {
  console.warn(
    'Supabase env vars are missing or still placeholders. ' +
    'Fill in .env with your Project URL and anon key.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
