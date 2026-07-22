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

export type ActiveCategory = 'siembra' | 'ras' | 'metas' | null

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

/** Árbol semillero individual (tabla ras.arboles_semilleros), para puntos en el mapa. */
export interface RasArbolSemillero {
  id: string
  codigo: string
  familia_id: string | null
  predio: string | null
  nombre_comun: string | null
  nombre_cientifico: string | null
  familia_botanica: string | null
  dap_cm: number | null
  altura_total_m: number | null
  foto_url: string | null
  latitud: number | null
  longitud: number | null
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
  /** Árboles semilleros desde ras.arboles_semilleros (puntos con ficha real) */
  rasArbolesSemilleros: RasArbolSemillero[]
  camarasSiembra: CamaraTrampa[]
  camarasConservacion: CamaraTrampa[]
}

// ── Proyecciones / fases ─────────────────────────────────────────────────────

export interface Proyeccion {
  id: string
  nombre: string
  subtitulo: string | null
  descripcion: string | null
  year_inicio: number | null
  year_fin: number | null
  ha_objetivo: number | null
  ha_ejecutado: number | null
  plantulas_objetivo: number | null
  plantulas_ejecutadas: number | null
  familias_vinculadas: number | null
  municipios_clave: string[] | null
  color: string
  shapefile_url: string | null
  ha_conservacion: number | null
  ha_restauracion: number | null
  orden: number
}

// ── Bancolombia · veredas con proyección temporal ────────────────────────────

export interface VeredaProyeccion {
  id: number
  codigo_ver: string
  nombre_ver: string
  nomb_mpio: string
  nom_dep: string
  area_ha: number | null
  /** Año en que se interviene la vereda (2026–2035) */
  anio_intervencion: number
  /** GeoJSON Feature completo (geometry + properties) */
  geojson_feature: GeoJSON.Feature
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
