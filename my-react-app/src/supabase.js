import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Log what we have (for debugging)
console.log('Supabase URL exists:', !!supabaseUrl)
console.log('Supabase Key exists:', !!supabaseAnonKey)

// Create a dummy client if env vars are missing (so UI doesn't break)
let supabase
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log('✅ Supabase connected')
  } else {
    console.warn('⚠️ Supabase env vars missing - using mock client')
    // Create a mock client that won't break your UI
    supabase = {
      auth: {
        signInWithPassword: async () => ({ data: { user: { id: 'mock-id' } }, error: null }),
        signUp: async () => ({ data: { user: { id: 'mock-id' }, session: null }, error: null })
      },
      from: () => ({
        select: () => Promise.resolve({ data: null, error: null }),
        insert: () => Promise.resolve({ error: null }),
        update: () => Promise.resolve({ error: null }),
        eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) })
      })
    }
  }
} catch (error) {
  console.error('Supabase init error:', error)
  supabase = { auth: { signInWithPassword: async () => ({ error }), signUp: async () => ({ error }) } }
}

export { supabase }