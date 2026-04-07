import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import type { FotoCategoria, FotosPredioByCategoria } from '@/types/geovisor'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id     = searchParams.get('id')
  const schema = searchParams.get('schema')

  if (!id || !schema || (schema !== 'siembra' && schema !== 'ras')) {
    return NextResponse.json(
      { error: 'Parámetros inválidos. Se requiere id y schema (siembra|ras).' },
      { status: 400 }
    )
  }

  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .schema(schema)
      .from('fotos_predio')
      .select('id, familia_id, categoria, url')
      .eq('familia_id', id)

    if (error) {
      console.error('[familia-fotos] Supabase error:', error.message, error.code)
      return NextResponse.json({ error: 'Error al obtener fotos.' }, { status: 500 })
    }

    // Agrupar por categoría
    const grouped = (data ?? []).reduce<FotosPredioByCategoria>((acc, foto) => {
      const cat = foto.categoria as FotoCategoria
      if (!acc[cat]) acc[cat] = []
      acc[cat]!.push(foto)
      return acc
    }, {})

    return NextResponse.json(grouped)
  } catch (err) {
    console.error('[familia-fotos] Error inesperado:', err)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
