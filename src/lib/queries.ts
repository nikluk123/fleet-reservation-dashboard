// src/lib/queries.ts
import { supabase } from './supabaseClient'

export async function getVehicles() {
  const { data, error } = await supabase
    .from('vehicles')
    .select('id, plate, model, type, location, status')
    .order('plate')

  if (error) {
    console.error('Greška pri učitavanju vozila:', error)
    return []
  }
  return data ?? []
}

export async function getReservations() {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('start_date')

  if (error) {
    console.error('Greška pri učitavanju rezervacija:', error)
    return []
  }
  return data ?? []
}

export async function getProjects() {
  const { data, error } = await supabase.from('projects').select('id, name')
  if (error) console.error(error)
  return data ?? []
}