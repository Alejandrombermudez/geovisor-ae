export const ESRI_SATELLITE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

export const ESRI_SATELLITE_ATTRIBUTION = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'

// ── Basemaps seleccionables ──────────────────────────────────────────────────
// Overlays de referencia de Esri (transparentes, sin API key) que se pintan sobre
// el satélite para mostrar nombres de municipios/ciudades, ríos y vías.
const ESRI_HYDRO_OVERLAY =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Hydro_Reference_Overlay/MapServer/tile/{z}/{y}/{x}'
const ESRI_TRANSPORT_OVERLAY =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}'
const ESRI_BOUNDARIES_PLACES_OVERLAY =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'

export interface BasemapOverlay {
  url: string
  /** Zoom nativo máximo del overlay; por encima, Leaflet escala los tiles en vez de ocultarlos */
  maxNativeZoom?: number
}

export interface BasemapDef {
  id: string
  /** Nombre completo (lista del selector) */
  label: string
  /** Etiqueta corta para el botón colapsado */
  short: string
  url: string
  attribution: string
  maxZoom: number
  /** Capas de referencia transparentes pintadas sobre la base (en orden de pintado) */
  overlays?: BasemapOverlay[]
}

export const BASEMAPS: BasemapDef[] = [
  {
    id: 'satelite',
    label: 'Satélite',
    short: 'Satélite',
    url: ESRI_SATELLITE_URL,
    attribution: ESRI_SATELLITE_ATTRIBUTION,
    maxZoom: 19,
  },
  {
    id: 'satelite-ref',
    label: 'Satélite + referencias',
    short: 'Satélite + ref.',
    url: ESRI_SATELLITE_URL,
    attribution: ESRI_SATELLITE_ATTRIBUTION,
    maxZoom: 19,
    overlays: [
      { url: ESRI_HYDRO_OVERLAY, maxNativeZoom: 16 },      // ríos y cuerpos de agua
      { url: ESRI_TRANSPORT_OVERLAY, maxNativeZoom: 19 },  // vías
      { url: ESRI_BOUNDARIES_PLACES_OVERLAY, maxNativeZoom: 16 }, // límites + municipios/ciudades (encima)
    ],
  },
  {
    id: 'mapa',
    label: 'Mapa (calles)',
    short: 'Mapa',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  },
]

export const DEFAULT_BASEMAP_ID = 'satelite-ref'

// Vista por defecto: Colombia completa
export const MAP_CENTER: [number, number] = [4.0, -73.0]
export const MAP_ZOOM = 6

/** Bounding box aproximado de Colombia para detectar CRS incorrecto */
export const COLOMBIA_BBOX = {
  minLat: -5,
  maxLat: 13,
  minLng: -80,
  maxLng: -66,
}

export const LAYER_COLORS = {
  siembraFincas: '#F59E0B',       // amber-400
  restauracion: '#EF4444',         // red-500
  siembraArboles: '#A3E635',       // lime-400 — puntos árboles restauración
  rasFincas: '#60A5FA',            // blue-400
  conservacion: '#22C55E',         // green-500
  rasArboles: '#34D399',           // emerald-400 — puntos árboles conservación
  camarasSiembra: '#FB923C',       // orange-400
  camarasConservacion: '#818CF8',  // indigo-400
} as const

export interface StaticLayerConfig {
  id: string
  nombre: string
  color: string
  shapefile_url: string
}

export const STATIC_LAYERS: StaticLayerConfig[] = [
  {
    id: 'cordillera',
    nombre: 'Cordillera Oriental',
    color: '#8B5CF6',
    shapefile_url: '/LFCLAUDE/CordilleraOriental.zip',
  },
  {
    id: 'chiribiquete',
    nombre: 'P.N. Chiribiquete',
    color: '#F97316',
    shapefile_url: '/LFCLAUDE/Chiribiquete.zip',
  },
]

export const LAYER_LABELS: Record<keyof typeof LAYER_COLORS, string> = {
  siembraFincas: 'Fincas — Siembra',
  restauracion: 'Áreas en restauración',
  siembraArboles: 'Árboles — Siembra',
  rasFincas: 'Fincas — Conservación',
  conservacion: 'Áreas en conservación',
  rasArboles: 'Árboles — Conservación',
  camarasSiembra: 'Cámaras trampa — Siembra',
  camarasConservacion: 'Cámaras trampa — Conservación',
}
