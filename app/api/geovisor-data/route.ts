import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import {
  fetchSiembraFamilias,
  fetchRasFamilias,
  fetchSiembraCamaras,
  fetchRasCamaras,
  fetchRasArbolesSemilleros,
} from '@/lib/queries'

export async function GET() {
  const supabase = createServiceClient()

  const [siembraFamilias, rasFamilias, camarasSiembra, camarasConservacion, rasArbolesSemilleros] =
    await Promise.allSettled([
      fetchSiembraFamilias(supabase),
      fetchRasFamilias(supabase),
      fetchSiembraCamaras(supabase),
      fetchRasCamaras(supabase),
      fetchRasArbolesSemilleros(supabase),
    ])

  // Log individual failures
  const labels = ['siembra.familias', 'ras.familias', 'siembra.camaras_trampa', 'ras.camaras_trampa', 'ras.arboles_semilleros']
  const results = [siembraFamilias, rasFamilias, camarasSiembra, camarasConservacion, rasArbolesSemilleros]
  const errors: string[] = []

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[/api/geovisor-data] ${labels[i]} failed:`, r.reason)
      errors.push(labels[i])
    }
  })

  return NextResponse.json({
    siembraFamilias: siembraFamilias.status === 'fulfilled' ? siembraFamilias.value : [],
    rasFamilias: rasFamilias.status === 'fulfilled' ? rasFamilias.value : [],
    camarasSiembra: camarasSiembra.status === 'fulfilled' ? camarasSiembra.value : [],
    camarasConservacion: camarasConservacion.status === 'fulfilled' ? camarasConservacion.value : [],
    // ras.arboles_semilleros puede no existir aún (antes de la migración) → [] sin romper
    rasArbolesSemilleros: rasArbolesSemilleros.status === 'fulfilled' ? rasArbolesSemilleros.value : [],
    errors: errors.length > 0 ? errors : undefined,
  })
}
