import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

// Server-side client with service role key
export const supabaseAdmin = createClient<Database>(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)