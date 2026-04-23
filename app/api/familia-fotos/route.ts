import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import type { FotoCategoria, FotosPredioByCategoria, FotoPredio } from '@/types/geovisor'

// Siempre datos frescos desde el bucket — sin cache
export const dynamic = 'force-dynamic'

/** Bucket de Storage por schema */
const BUCKETS: Record<'siembra' | 'ras', string> = {
  siembra: 'siembra-fotos-predio',
  ras:     'ras-fotos-predio',
}

const CATEGORIAS: FotoCategoria[] = ['predio', 'familia', 'copa_arboles', 'tronco', 'otras']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const familiaId = searchParams.get('id')
  const schema    = searchParams.get('schema') as 'siembra' | 'ras' | null

  if (!familiaId || !schema || !(schema in BUCKETS)) {
    return NextResponse.json(
      { error: 'Parámetros inválidos. Se requiere id y schema (siembra|ras).' },
      { status: 400 },
    )
  }

  const bucket     = BUCKETS[schema]
  const supabase   = createServiceClient()
  const publicBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}`

  // Listar cada carpeta de categoría en paralelo
  const results = await Promise.all(
    CATEGORIAS.map(async (cat): Promise<[FotoCategoria, FotoPredio[]]> => {
      const folder = `${familiaId}/${cat}`
      const { data, error } = await supabase.storage.from(bucket).list(folder, {
        sortBy: { column: 'name', order: 'asc' },
      })

      if (error || !data) return [cat, []]

      // Filtrar carpetas y placeholders — archivos reales tienen metadata
      const fotos: FotoPredio[] = data
        .filter((f) => f.metadata !== null && !f.name.startsWith('.'))
        .map((f) => ({
          id:         `${folder}/${f.name}`,
          familia_id: familiaId,
          categoria:  cat,
          url:        `${publicBase}/${folder}/${encodeURIComponent(f.name)}`,
        }))

      return [cat, fotos]
    }),
  )

  // Construir objeto agrupado (omitir categorías vacías)
  const grouped: FotosPredioByCategoria = {}
  for (const [cat, fotos] of results) {
    if (fotos.length > 0) grouped[cat] = fotos
  }

  return NextResponse.json(grouped, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
