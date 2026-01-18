import { createClient } from '@supabase/supabase-js'

// Koristi direktne vrednosti za sada (lakše za debug)
const supabaseUrl = 'https://jronhbijvupupceilzgw.supabase.co'
const supabaseAnonKey = 'qXiPHoD-pxu3Iq6DS1Z_cA_qLlF3jf4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Dodaj console.log za debugging
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase initialized')