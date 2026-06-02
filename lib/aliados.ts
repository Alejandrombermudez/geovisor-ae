// ─────────────────────────────────────────────────────────────────────────────
// Registro central de aliados (inversionistas)
//
// Cada aliado tiene credenciales de acceso (login client-side, hardcoded —
// visible en el bundle JS, igual que el usuario Bancolombia) y, opcionalmente,
// un "proyecto" con sus polígonos de intervención y métricas personalizadas.
//
// La autenticación sigue siendo client-side. Si en algún momento se manejan
// datos sensibles, migrar a un backend de auth real (Supabase Auth / NextAuth).
// ─────────────────────────────────────────────────────────────────────────────

/** Una fila de la estrategia de restauración (tabla del brief técnico). */
export interface RestauracionFicha {
  cobertura: string
  condicion: string
  tipoRestauracion: string
  estrategia: string
  gremioEspecies: string
  arbPorHa: number
}

/** Bloque de datos cuantitativos (predio completo o porción del aliado). */
export interface DatosArboles {
  ha: number
  arbPorHa: number
  arboles: number
}

/** Proyecto de intervención de un aliado: polígonos + métricas. */
/** Seguimiento del proceso de restauración (valores null → se muestran como "--"). */
export interface Monitoreo {
  /** Número de especies sembradas. */
  especiesSembradas: number | null
  /** Tasa de supervivencia (porcentaje). */
  tasaSupervivencia: number | null
  /** Fecha del último monitoreo (texto legible, ej. "2026-08"). */
  fechaMonitoreo: string | null
  /** Número de parcelas de monitoreo. */
  parcelasMonitoreo: number | null
}

export interface AliadoProyecto {
  /** Nombre del predio / proyecto (ej. "Escuela Bosque"). */
  nombre: string
  /** Ubicación legible (ej. "Piedemonte Andino-Amazónico · Caquetá"). */
  ubicacion: string
  /** Descripción corta para la vista del aliado. */
  descripcion: string
  /** ZIP del shapefile con la forma del predio completo. */
  predioZipUrl: string
  /** ZIP del shapefile con los polígonos Ley 2173 (posibles a intervenir). */
  ley2173ZipUrl: string
  /** Valor de la columna `Intervenci` que marca los polígonos del aliado. */
  intervenciValue: string
  /** Ficha de la estrategia de restauración. */
  ficha: RestauracionFicha
  /** Datos del predio completo (todos los polígonos Ley 2173). */
  predioTotal: DatosArboles
  /** Datos de la porción asignada al aliado. */
  aliado: DatosArboles
  /** Seguimiento/monitoreo del proceso (pendiente → "--"). */
  monitoreo?: Monitoreo
  /** Ortofoto de dron (raster RGB) como capa base del sitio, bajo los polígonos. */
  ortho?: {
    /** URL de la imagen (WebP con alfa, reproyectada a lat/lng). */
    url: string
    /** Límites geográficos [[sur, oeste], [norte, este]]. */
    bounds: [[number, number], [number, number]]
  }
}

export interface Aliado {
  /** Clave de login (en minúsculas, como la teclea el usuario). */
  key: string
  /** Contraseña (client-side, visible en el bundle). */
  password: string
  /** Nombre visible / display. */
  displayName: string
  /** Color de marca principal. */
  brandColor: string
  /** Variante oscura del color de marca (degradados). */
  brandColorDark: string
  /** Color del avatar en el AuthButton. */
  avatarColor: string
  /** Logo del aliado (opcional, con fallback silencioso si no existe). */
  logoUrl?: string
  /** Proyecto de intervención (si el aliado tiene una vista personalizada). */
  proyecto?: AliadoProyecto
}

// ── Aliados ───────────────────────────────────────────────────────────────────

const BANCOLOMBIA: Aliado = {
  key: 'bancolombia',
  password: 'Bancol',
  displayName: 'Bancolombia',
  brandColor: '#6898B8',
  brandColorDark: '#3F6B8A',
  avatarColor: '#FFB800',
}

const TETRA_PAK: Aliado = {
  key: 'tetra pak',
  password: 'TP_AE_2026',
  displayName: 'Tetra Pak',
  brandColor: '#0A5BA8',
  brandColorDark: '#063E73',
  avatarColor: '#0A5BA8',
  logoUrl: '/tetrapak/logo-tetrapak.png',
  proyecto: {
    nombre: 'Escuela Bosque',
    ubicacion: 'Piedemonte Andino-Amazónico · Caquetá',
    descripcion: 'Proyección área de intervención de Tetra Pak bajo la Ley 2173.',
    predioZipUrl: '/tetrapak/EscuelaBosque_predio.zip',
    ley2173ZipUrl: '/tetrapak/EscuelaBosque_Ley2173VF.zip',
    intervenciValue: 'Tetra Pak',
    ficha: {
      cobertura: 'Rastrojo bajo (<4 m)',
      condicion: 'No tiene espacios grandes sin vegetación',
      tipoRestauracion: 'Activa',
      estrategia: 'Cercado · Nucleación de especies',
      gremioEspecies: 'Intermedias / Esciófitas',
      arbPorHa: 330,
    },
    // Valores del brief técnico (pantallazo). El predio completo agrupa los 9
    // polígonos Ley 2173 (≈4,6 ha); Tetra Pak financia los marcados "Tetra Pak"
    // en la columna Intervenci (≈0,9 ha).
    predioTotal: { ha: 4.6, arbPorHa: 330, arboles: 1519 },
    aliado: { ha: 0.9, arbPorHa: 330, arboles: 284.2 },
    // Pendiente de los primeros monitoreos en campo → se muestran como "--".
    monitoreo: {
      especiesSembradas: null,
      tasaSupervivencia: null,
      fechaMonitoreo: null,
      parcelasMonitoreo: null,
    },
    ortho: {
      url: '/tetrapak/ortho-escuelabosque.webp',
      bounds: [[1.6246232, -75.5740280], [1.6332985, -75.5680800]],
    },
  },
}

export const ALIADOS: Aliado[] = [BANCOLOMBIA, TETRA_PAK]

// ── Mapas derivados (consumidos por LoginScreen / AuthButton) ──────────────────

export const ACCOUNTS: Record<string, string> = Object.fromEntries(
  ALIADOS.map(a => [a.key, a.password]),
)

export const DISPLAY_NAMES: Record<string, string> = Object.fromEntries(
  ALIADOS.map(a => [a.key, a.displayName]),
)

export const AVATAR_COLORS: Record<string, string> = Object.fromEntries(
  ALIADOS.map(a => [a.key, a.avatarColor]),
)

// ── Lookups ────────────────────────────────────────────────────────────────────

export function getAliadoByKey(key: string | null | undefined): Aliado | null {
  if (!key) return null
  return ALIADOS.find(a => a.key === key.trim().toLowerCase()) ?? null
}

export function getAliadoByDisplayName(name: string | null | undefined): Aliado | null {
  if (!name) return null
  return ALIADOS.find(a => a.displayName === name) ?? null
}
