import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("Error: Las variables de entorno de Supabase no están definidas.");
}

export const supabase = createClient(supabaseUrl, supabaseKey)

