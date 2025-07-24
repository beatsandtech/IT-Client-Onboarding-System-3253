import { createClient } from '@supabase/supabase-js'

// Project ID will be auto-injected during deployment
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cfvtiadghquhilypgvfk.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdnRpYWRnaHF1aGlseXBndmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMzEzNDIsImV4cCI6MjA2ODkwNzM0Mn0.IYR_N-CdbFnvakiUdjERMv5IzFkyoeIJQUAADzrMPMw'

if (SUPABASE_URL === 'https://your-project-id.supabase.co' || SUPABASE_ANON_KEY === 'your-anon-key') {
  console.warn('Missing Supabase credentials. Please connect your Supabase project in settings.')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})
