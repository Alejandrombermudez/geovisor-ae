'use client'

import { useEffect, useState } from 'react'
import { fetchAndParseShapefile } from '@/lib/shapefileUtils'
import type {
  GeovisorLayerData,
  PolygonLayerData,
  SiembraFamilia,
  RasFamilia,
  CamaraTrampa,
} from '@/types/geovisor'

const EMPTY_DATA: GeovisorLayerData = {
  siembraFincas: [],
  restauracion: [],
  siembraArboles: [],
  rasFincas: [],
  conservacion: [],
  rasArboles: [],
  camarasSiembra: [],
  camarasConservacion: [],
}

export interface GeovisorDataState {
  data: GeovisorLayerData
  siembraFamilias: SiembraFamilia[]
  rasFamilias: RasFamilia[]
  loading: boolean
  loadingLayers: Set<keyof GeovisorLayerData>
  error: string | null
}

interface ApiResponse {
  siembraFamilias: SiembraFamilia[]
  rasFamilias: RasFamilia[]
  camarasSiembra: CamaraTrampa[]
  camarasConservacion: CamaraTrampa[]
  errors?: string[]
}

export function useGeovisorData(): GeovisorDataState {
  const [data, setData] = useState<GeovisorLayerData>(EMPTY_DATA)
  const [siembraFamilias, setSiembraFamilias] = useState<SiembraFamilia[]>([])
  const [rasFamilias, setRasFamilias] = useState<RasFamilia[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingLayers, setLoadingLayers] = useState<Set<keyof GeovisorLayerData>>(
    new Set([
      'siembraFincas', 'restauracion', 'siembraArboles',
      'rasFincas', 'conservacion', 'rasArboles',
      'camarasSiembra', 'camarasConservacion',
    ])
  )
  const [error, setError] = useState<string | null>(null)

  function doneLayer(key: keyof GeovisorLayerData) {
    setLoadingLayers((prev) => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch('/api/geovisor-data')
        if (!res.ok) throw new Error(`Error del servidor: ${res.status}`)

        const json: ApiResponse = await res.json()
        if (cancelled) return

        const {
          siembraFamilias: sf = [],
          rasFamilias: rf = [],
          camarasSiembra = [],
          camarasConservacion = [],
          errors: apiErrors,
        } = json

        // Expose raw familia arrays for the sidebar
        setSiembraFamilias(sf)
        setRasFamilias(rf)

        if (apiErrors && apiErrors.length > 0) {
          console.warn('[useGeovisorData] Queries parcialmente fallidas:', apiErrors)
          setError(`No se pudieron cargar: ${apiErrors.join(', ')}. Verifica la configuración de Supabase.`)
        }

        // Camera data is ready immediately
        setData((prev) => ({ ...prev, camarasSiembra, camarasConservacion }))
        doneLayer('camarasSiembra')
        doneLayer('camarasConservacion')

        // Parse shapefiles for each layer concurrently (polygons + points)
        const layerConfigs = [
          { key: 'siembraFincas'  as const, items: sf, urlField: 'shapefile_finca_url'         as const },
          { key: 'restauracion'   as const, items: sf, urlField: 'shapefile_restauracion_url'   as const },
          { key: 'siembraArboles' as const, items: sf, urlField: 'shapefile_arboles_url'        as const },
          { key: 'rasFincas'      as const, items: rf, urlField: 'shapefile_finca_url'          as const },
          { key: 'conservacion'   as const, items: rf, urlField: 'shapefile_conservacion_url'   as const },
          { key: 'rasArboles'     as const, items: rf, urlField: 'shapefile_arboles_url'        as const },
        ]

        await Promise.all(
          layerConfigs.map(async ({ key, items, urlField }) => {
            const results = (
              await Promise.all(
                (items as (SiembraFamilia & RasFamilia)[]).map((f) =>
                  fetchAndParseShapefile(f[urlField]).then(
                    (fc) => (fc ? ({ fc, familia: f } as PolygonLayerData) : null)
                  )
                )
              )
            ).filter((r): r is PolygonLayerData => r !== null)

            if (!cancelled) {
              setData((prev) => ({ ...prev, [key]: results }))
              doneLayer(key)
            }
          })
        )
      } catch (err) {
        if (!cancelled) {
          console.error('[useGeovisorData]', err)
          setError('Error al conectar con el servidor. Recarga la página.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { data, siembraFamilias, rasFamilias, loading, loadingLayers, error }
}
