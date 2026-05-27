import type { SupabaseClient } from '@supabase/supabase-js'
import type { SiembraFamilia, RasFamilia, CamaraTrampa, VeredaProyeccion } from '@/types/geovisor'

/**
 * Fetch veredas Bancolombia filtradas por año de intervención.
 * Requiere que exista bancolombia.veredas_proyeccion en Supabase.
 * - year: año exacto
 * - yearLte: todos los años ≤ ese valor (modo acumulativo para slider)
 * TODO: llamar desde el hook/componente del slider cuando se active.
 */
export async function fetchVeredasBancolombia(
  supabase: SupabaseClient,
  options: { year?: number; yearLte?: number } = {}
): Promise<VeredaProyeccion[]> {
  let query = supabase
    .schema('bancolombia')
    .from('veredas_proyeccion')
    .select('id, codigo_ver, nombre_ver, nomb_mpio, nom_dep, area_ha, anio_intervencion, geojson_feature')
    .order('anio_intervencion', { ascending: true })

  if (options.year !== undefined) {
    query = query.eq('anio_intervencion', options.year)
  } else if (options.yearLte !== undefined) {
    query = query.lte('anio_intervencion', options.yearLte)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as VeredaProyeccion[]
}

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
