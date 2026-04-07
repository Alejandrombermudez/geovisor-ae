import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import {
  fetchSiembraFamilias,
  fetchRasFamilias,
  fetchSiembraCamaras,
  fetchRasCamaras,
} from '@/lib/queries'

export async function GET() {
  const supabase = createServiceClient()

  const [siembraFamilias, rasFamilias, camarasSiembra, camarasConservacion] =
    await Promise.allSettled([
      fetchSiembraFamilias(supabase),
      fetchRasFamilias(supabase),
      fetchSiembraCamaras(supabase),
      fetchRasCamaras(supabase),
    ])

  // Log individual failures
  const labels = ['siembra.familias', 'ras.familias', 'siembra.camaras_trampa', 'ras.camaras_trampa']
  const results = [siembraFamilias, rasFamilias, camarasSiembra, camarasConservacion]
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
    errors: errors.length > 0 ? errors : undefined,
  })
}
