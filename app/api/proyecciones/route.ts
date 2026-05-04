import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import type { Proyeccion } from '@/types/geovisor'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('proyecciones')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true })

  if (error) {
    console.error('[/api/proyecciones]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json((data ?? []) as Proyeccion[], {
    headers: { 'Cache-Control': 'no-store' },
  })
}
