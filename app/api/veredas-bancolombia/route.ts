import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import type { VeredaProyeccion } from '@/types/geovisor'

export const dynamic = 'force-dynamic'

/**
 * GET /api/veredas-bancolombia
 * GET /api/veredas-bancolombia?year=2028          → solo ese año
 * GET /api/veredas-bancolombia?year_lte=2030      → todos hasta 2030 (acumulativo)
 *
 * Devuelve los registros de bancolombia.veredas_proyeccion.
 * La tabla debe existir en Supabase (ver migration_veredas_proyeccion.sql).
 *
 * TODO: activar esta ruta desde el slider de año en la interfaz.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const year     = searchParams.get('year')
  const yearLte  = searchParams.get('year_lte')

  const supabase = createServiceClient()

  let query = supabase
    .schema('bancolombia')
    .from('veredas_proyeccion')
    .select('id, codigo_ver, nombre_ver, nomb_mpio, nom_dep, area_ha, anio_intervencion, geojson_feature')
    .order('anio_intervencion', { ascending: true })

  if (year) {
    query = query.eq('anio_intervencion', Number(year))
  } else if (yearLte) {
    query = query.lte('anio_intervencion', Number(yearLte))
  }

  const { data, error } = await query

  if (error) {
    console.error('[/api/veredas-bancolombia]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json((data ?? []) as VeredaProyeccion[], {
    headers: { 'Cache-Control': 'no-store' },
  })
}
