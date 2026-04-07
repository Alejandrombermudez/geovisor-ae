import type { FeatureCollection } from 'geojson'

export interface SiembraFamilia {
  id: string
  nombre_propietario: string
  municipio: string
  vereda: string
  nombre_finca: string
  adultos: number | null
  ninos: number | null
  ha_potreros: number | null
  ha_bosque: number | null
  ha_otras: number | null
  ha_restauracion: number | null
  bajo_conservacion: boolean
  empleos_locales: number | null
  plan_restauracion: string | null
  parcelas_monitoreo: number | null
  plantulas_sembradas: number | null
  especies_sembradas: number | null
  shapefile_finca_url: string | null
  shapefile_restauracion_url: string | null
  shapefile_arboles_url: string | null
  documento_acuerdo_url: string | null  // recibido de BD, nunca mostrado en UI
  created_at: string | null
  updated_at: string | null
}

export interface RasFamilia {
  id: string
  nombre_propietario: string
  municipio: string
  vereda: string
  nombre_finca: string
  adultos: number | null
  ninos: number | null
  ha_potreros: number | null
  ha_bosque: number | null
  ha_otras: number | null
  ha_restauracion: number | null
  bajo_conservacion: boolean
  empleos_locales: number | null
  plan_restauracion: string | null
  parcelas_monitoreo: number | null
  plantulas_sembradas: number | null
  especies_sembradas: number | null
  shapefile_finca_url: string | null
  shapefile_restauracion_url: string | null
  shapefile_conservacion_url: string | null
  shapefile_arboles_url: string | null
  documento_acuerdo_url: string | null  // recibido de BD, nunca mostrado en UI
  acuerdo_conservacion: boolean
  arboles_semilleros: number | null
  especies_forestales: number | null
  otros_indices: unknown
  created_at: string | null
  updated_at: string | null
}

export type ActiveCategory = 'siembra' | 'ras' | null

export interface FotoCamara {
  id: string
  camara_id: string
  url: string
}

export interface CamaraTrampa {
  id: string
  familia_id: string
  nombre: string
  latitud: number
  longitud: number
  fotos_camara?: FotoCamara[]
  nombre_propietario?: string
  nombre_finca?: string
}

export interface PolygonLayerData {
  fc: FeatureCollection
  familia: SiembraFamilia | RasFamilia
}

export interface VisibleLayers {
  siembraFincas: boolean
  restauracion: boolean
  siembraArboles: boolean
  rasFincas: boolean
  conservacion: boolean
  rasArboles: boolean
  camarasSiembra: boolean
  camarasConservacion: boolean
}

export interface GeovisorLayerData {
  siembraFincas: PolygonLayerData[]
  restauracion: PolygonLayerData[]
  siembraArboles: PolygonLayerData[]
  rasFincas: PolygonLayerData[]
  conservacion: PolygonLayerData[]
  rasArboles: PolygonLayerData[]
  camarasSiembra: CamaraTrampa[]
  camarasConservacion: CamaraTrampa[]
}

// ── Fotos del predio ─────────────────────────────────────────────────────────

export type FotoCategoria = 'predio' | 'familia' | 'copa_arboles' | 'tronco' | 'otras'

export interface FotoPredio {
  id: string
  familia_id: string
  categoria: FotoCategoria
  url: string
}

export type FotosPredioByCategoria = Partial<Record<FotoCategoria, FotoPredio[]>>
