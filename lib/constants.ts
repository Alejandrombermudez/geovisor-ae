export const ESRI_SATELLITE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

export const ESRI_SATELLITE_ATTRIBUTION = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'

export const MAP_CENTER: [number, number] = [-1.5, -72.0]
export const MAP_ZOOM = 7

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
