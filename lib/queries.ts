import type { SupabaseClient } from '@supabase/supabase-js'
import type { SiembraFamilia, RasFamilia, CamaraTrampa, VeredaProyeccion, RasArbolSemillero } from '@/types/geovisor'

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

type PredioIdentidad = {
  nombre_propietario: string
  nombre_finca: string
  municipio: string
  vereda: string
}

/** JOIN a core.predios/core.aliados por predio_id. Desde migration_campo_core.sql
 *  (2026-07-07) siembra.familias ya no guarda nombre_propietario/nombre_finca/
 *  municipio/vereda — esos datos viven en core y se leen aparte porque PostgREST
 *  no resuelve embeds cross-schema (verificado: PGRST200 al intentarlo). Mismo
 *  dato que expone core.v_predios_campo para la PWA, pero sin su filtro de etapa
 *  (el geovisor muestra predios en cualquier etapa del proceso). */
async function fetchCorePrediosIdentidad(
  supabase: SupabaseClient,
  predioIds: (string | null | undefined)[]
): Promise<Map<string, PredioIdentidad>> {
  const ids = [...new Set(predioIds.filter((id): id is string => Boolean(id)))]
  const map = new Map<string, PredioIdentidad>()
  if (ids.length === 0) return map

  const { data, error } = await supabase
    .schema('core')
    .from('predios')
    .select('id, nombre_predio, municipio, vereda, aliados:aliado_id(nombre_completo)')
    .in('id', ids)
  if (error) throw error

  for (const row of (data ?? []) as any[]) {
    map.set(row.id, {
      nombre_propietario: row.aliados?.nombre_completo ?? '',
      nombre_finca: row.nombre_predio ?? '',
      municipio: row.municipio ?? '',
      vereda: row.vereda ?? '',
    })
  }
  return map
}

export async function fetchSiembraFamilias(supabase: SupabaseClient): Promise<SiembraFamilia[]> {
  const { data, error } = await supabase
    .schema('siembra')
    .from('familias')
    .select(`
      id, predio_id,
      adultos, ninos, ha_potreros, ha_bosque, ha_otras, ha_restauracion,
      bajo_conservacion, empleos_locales, plan_restauracion, parcelas_monitoreo,
      plantulas_sembradas, especies_sembradas,
      shapefile_finca_url, shapefile_restauracion_url, shapefile_arboles_url, documento_acuerdo_url,
      created_at, updated_at
    `)
  if (error) throw error

  const rows = (data ?? []) as any[]
  const identidad = await fetchCorePrediosIdentidad(supabase, rows.map((r) => r.predio_id))

  return rows.map((r) => {
    const info = identidad.get(r.predio_id)
    return {
      ...r,
      nombre_propietario: info?.nombre_propietario ?? '',
      nombre_finca: info?.nombre_finca ?? '',
      municipio: info?.municipio ?? '',
      vereda: info?.vereda ?? '',
    }
  }) as SiembraFamilia[]
}

export async function fetchRasFamilias(supabase: SupabaseClient): Promise<RasFamilia[]> {
  const { data, error } = await supabase
    .schema('ras')
    .from('familias')
    .select('*')
  if (error) throw error
  return (data ?? []) as RasFamilia[]
}

/** Árboles semilleros georreferenciados. Lee de v_arboles_con_especie (JOIN a
 *  catalogo.especies) — ras.arboles_semilleros no guarda taxonomía por árbol,
 *  solo especie_id. Solo trae los que tienen coordenada. */
export async function fetchRasArbolesSemilleros(supabase: SupabaseClient): Promise<RasArbolSemillero[]> {
  const { data, error } = await supabase
    .schema('ras')
    .from('v_arboles_con_especie')
    .select('id, codigo, familia_id, predio, nombre_comun, nombre_cientifico, familia_botanica, dap_cm, altura_total_m, foto_url, latitud, longitud')
    .not('latitud', 'is', null)
    .not('longitud', 'is', null)
  if (error) throw error
  return (data ?? []) as RasArbolSemillero[]
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
      familias(predio_id)
    `)
  if (error) throw error

  const rows = (data ?? []) as any[]
  const identidad = await fetchCorePrediosIdentidad(supabase, rows.map((row) => row.familias?.predio_id))

  return rows.map((row) => {
    const info = identidad.get(row.familias?.predio_id)
    return {
      id: row.id,
      familia_id: row.familia_id,
      nombre: row.nombre,
      latitud: row.latitud,
      longitud: row.longitud,
      fotos_camara: row.fotos_camara ?? [],
      nombre_propietario: info?.nombre_propietario ?? '',
      nombre_finca: info?.nombre_finca ?? '',
    }
  }) as CamaraTrampa[]
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
