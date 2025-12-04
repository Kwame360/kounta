import { createClient } from '@supabase/supabase-js'

let supabaseClient = null

function getSupabaseClient() {
  // Return cached client if already created
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Debug logging - only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Supabase] Initializing client...')
    console.log('[Supabase] NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'Missing')
    console.log('[Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
  }

  // Check if environment variables are missing
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Supabase] Missing environment variables. App will use localStorage fallback.')
      console.warn('[Supabase] To enable Supabase, create .env.local with:')
      console.warn('[Supabase]   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
      console.warn('[Supabase]   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
    }
    return null
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
  } catch (error) {
    console.error('[Supabase] Invalid URL format:', supabaseUrl)
    return null
  }

  // Create and cache the client
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Supabase] Client initialized successfully')
    }
    return supabaseClient
  } catch (error) {
    console.error('[Supabase] Error creating client:', error)
    return null
  }
}

// Create a mock client that returns errors for graceful fallback
function createMockClient() {
  // Create a chainable query builder that always returns an error when awaited
  function createMockQueryBuilder() {
    const errorResult = Promise.resolve({ 
      data: null, 
      error: { message: 'Supabase not configured. Check your .env.local file.' } 
    })
    
    const builder = {
      select: function() { return builder },
      insert: function() { return builder },
      update: function() { return builder },
      delete: function() { return builder },
      eq: function() { return builder },
      neq: function() { return builder },
      single: function() { return builder },
      order: function() { return builder },
      limit: function() { return builder },
      // Make it awaitable
      then: errorResult.then.bind(errorResult),
      catch: errorResult.catch.bind(errorResult),
      finally: errorResult.finally.bind(errorResult),
      [Symbol.toStringTag]: 'Promise'
    }
    return builder
  }
  
  return {
    from: () => createMockQueryBuilder()
  }
}

// Initialize the client
const client = getSupabaseClient()

// Export the real client if available, otherwise the mock
export const supabase = client || createMockClient()