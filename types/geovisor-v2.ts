// Tipos compartidos entre /api/v2/dashboard (server) y /geovisor-v2 (client).
// Los indicadores sin fuente todavía (árboles sembrados, carbono) son null:
// la UI los muestra como "—" hasta que existan los módulos Plan/Ejecución/MRV.

export interface KpisV2 {
  haRestauracionSig: number
  prediosProceso: number
  haBosqueConservacion: number
  familiasConAcuerdo: number
  arbolesSemilleros: number
  especiesRas: number
  municipios: number
  departamentos: number
  familiasVinculadas: number
  personas: number
  /** Sin fuente aún (módulos Plan/Ejecución) */
  arbolesSembrados: number | null
  /** Sin fuente aún (módulo MRV/carbono) */
  carbonoTco2e: number | null
}

export interface PredioProcesoV2 {
  tipo: 'proceso'
  id: string
  nombre: string
  aliado: string
  municipio: string
  departamento: string | null
  vereda: string | null
  nucleo: string | null
  etapa: string | null
  semaforo: string | null
  areaRegistralHa: number | null
  areaFincaSigHa: number | null
  areaRestauracionSigHa: number | null
  zonasSiembra: number
  centroide: { lat: number; lng: number } | null
}

export interface PredioConservacionV2 {
  tipo: 'conservacion'
  /** "nucleo|predio" — llave natural de ras.v_indicadores_predio */
  id: string
  nombre: string
  nucleo: string | null
  municipio: string | null
  vereda: string | null
  haBosque: number | null
  arboles: number
  especies: number
  shannonH: number | null
  simpson1d: number | null
  areaBasalM2: number | null
  dapMedioCm: number | null
  densidadArbHa: number | null
  arbAmenazados: number | null
  centroide: { lat: number; lng: number } | null
}

export interface DashboardV2Response {
  kpis: KpisV2
  prediosProceso: PredioProcesoV2[]
  prediosConservacion: PredioConservacionV2[]
  generadoEn: string
  errors?: string[]
}
