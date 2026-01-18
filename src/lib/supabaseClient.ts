import { createClient } from '@supabase/supabase-js'

// ✅ PRAVI ANON KEY!
const supabaseUrl = 'https://jronhbijvupupceilzgw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyb25oYmlqdnVwdXBjZWlsemd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzE0OTcsImV4cCI6MjA4MzgwNzQ5N30.SlYG1DTHGreMGH2bjFQiLZSj_WpDQAQBf4YvBBbPXwY'

console.log('🚀 SUPABASE INICIJALIZOVAN')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Poboljšana test funkcija sa boljim error handling-om
export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Počinjem test konekcije...')
    
    // Test 1: Provera da li možemo da se povežemo
    console.log('Test 1: Ping bazu...')
    const { data: testData, error: testError } = await supabase
      .from('vehicles')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.error('❌ Greška pri pingovanju:', testError)
      return { 
        success: false, 
        error: testError.message || JSON.stringify(testError),
        code: testError.code
      }
    }
    
    console.log('✅ Ping uspešan')
    
    // Test 2: Dohvati sva vozila
    console.log('Test 2: Učitavam vozila...')
    const { data: vehicles, error: vehiclesError, count } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact' })
    
    if (vehiclesError) {
      console.error('❌ Greška pri vozilima:', vehiclesError)
      return { 
        success: false, 
        error: vehiclesError.message || String(vehiclesError),
        code: vehiclesError.code
      }
    }
    
    console.log(`✅ Učitano ${count || vehicles?.length || 0} vozila`)
    
    // Test 3: Dohvati rezervacije
    console.log('Test 3: Učitavam rezervacije...')
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('id')
      .limit(5)
    
    if (reservationsError) {
      console.warn('⚠️ Greška pri rezervacijama (možda tabela prazna):', reservationsError)
    } else {
      console.log(`✅ Učitano ${reservations?.length || 0} rezervacija`)
    }
    
    return { 
      success: true, 
      vehiclesCount: count || vehicles?.length || 0,
      reservationsCount: reservations?.length || 0,
      message: 'Baza radi uspešno!'
    }
    
  } catch (error: any) {
    console.error('❌ Neočekivana greška:', error)
    return { 
      success: false, 
      error: error?.message || String(error),
      stack: error?.stack
    }
  }
}

// Automatski test
if (typeof window !== 'undefined') {
  setTimeout(() => {
    console.log('🔧 Pokrećem automatski test...')
    testSupabaseConnection().then(result => {
      if (result.success) {
        console.log('🎉 SUPABASE RADI!', result)
      } else {
        console.error('💥 SUPABASE GREŠKA:', result)
      }
    })
  }, 2000)
}