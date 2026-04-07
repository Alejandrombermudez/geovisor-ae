import type { SupabaseClient } from '@supabase/supabase-js'
import type { SiembraFamilia, RasFamilia, CamaraTrampa } from '@/types/geovisor'

export async function fetchSiembraFamilias(supabase: SupabaseClient): Promise<SiembraFamilia[]> {
  const { data, error } = await supabase
    .schema('siembra')
    .from('familias')
    .select('*')
  if (error) throw error
  return (data ?? []) as SiembraFamilia[]
}

export async function fetchRasFamilias(supabase: SupabaseClient): Promise<RasFamilia[]> {
  const { data, error } = await supabase
    .schema('ras')
    .from('familias')
    .select('*')
  if (error) throw error
  return (data ?? []) as RasFamilia[]
}

export async function fetchSiembraCamaras(supabase: SupabaseClient): Promise<CamaraTrampa[]> {
  const { data, error } = await supabase
    .schema('siembra')
    .from('camaras_trampa')
    .select(`
      id,
      familia_id,
      nombre,
      latitud,
      longitud,
      fotos_camara(id, url),
      familias(nombre_propietario, nombre_finca)
    `)
  if (error) throw error

  return ((data ?? []) as any[]).map((row) => ({
    id: row.id,
    familia_id: row.familia_id,
    nombre: row.nombre,
    latitud: row.latitud,
    longitud: row.longitud,
    fotos_camara: row.fotos_camara ?? [],
    nombre_propietario: row.familias?.nombre_propietario ?? '',
    nombre_finca: row.familias?.nombre_finca ?? '',
  })) as CamaraTrampa[]
}

export async function fetchRasCamaras(supabase: SupabaseClient): Promise<CamaraTrampa[]> {
  const { data, error } = await supabase
    .schema('ras')
    .from('camaras_trampa')
    .select(`
      id,
      familia_id,
      nombre,
      latitud,
      longitud,
      fotos_camara(id, url),
      familias(nombre_propietario, nombre_finca)
    `)
  if (error) throw error

  return ((data ?? []) as any[]).map((row) => ({
    id: row.id,
    familia_id: row.familia_id,
    nombre: row.nombre,
    latitud: row.latitud,
    longitud: row.longitud,
    fotos_camara: row.fotos_camara ?? [],
    nombre_propietario: row.familias?.nombre_propietario ?? '',
    nombre_finca: row.familias?.nombre_finca ?? '',
  })) as CamaraTrampa[]
}
