import { createClient } from '@supabase/supabase-js'

// Public configuration only (see .env.example). The anon key is designed to be
// shipped to browsers; NEVER put a service-role key in a VITE_ variable.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  url && anonKey && /^https?:\/\//.test(url) && !url.includes('your-project-ref')
)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    })
  : null
