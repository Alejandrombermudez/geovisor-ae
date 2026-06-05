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

/** Campos comunes a cualquier proyecto de aliado. */
interface ProyectoBase {
  /** Nombre del proyecto (ej. "Escuela Bosque"). */
  nombre: string
  /** Ubicación legible (ej. "Piedemonte Andino-Amazónico · Caquetá"). */
  ubicacion: string
  /** Descripción corta para la vista del aliado. */
  descripcion: string
}

/** Proyecto tipo "Escuela Bosque" (Tetra Pak): predio + polígonos Ley 2173 + árboles. */
export interface ProyectoEscuelaBosque extends ProyectoBase {
  tipo: 'escuela_bosque'
  /** ZIP del shapefile con la forma del predio completo. */
  predioZipUrl: string
  /** ZIP del shapefile con los polígonos Ley 2173 (posibles a intervenir). */
  ley2173ZipUrl: string
  /** Valor de la columna `Intervenci` que marca los polígonos del aliado. */
  intervenciValue: string
  /** Etiqueta a mostrar en el tooltip de los polígonos (si difiere del valor de filtro). */
  intervenciLabel?: string
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

/** Una métrica simple (etiqueta + valor) que se muestra para una capa. */
export interface CapaStat {
  label: string
  value: string
}

/** Una capa de polígonos del aliado (ej. "Predios analizados"). */
export interface AliadoCapa {
  id: string
  /** Nombre de la capa (ej. "Predios analizados"). */
  nombre: string
  /** Etiqueta corta de estado (ej. "Analizados", "Potenciales"). */
  estado?: string
  /** ZIP del shapefile de la capa. */
  zipUrl: string
  /** Color de marca de la capa (relleno + borde). */
  color: string
  /** ¿Dibujar con borde punteado (capas "potenciales")? */
  dashed?: boolean
  /** Propiedad del shapefile usada como título del tooltip (ej. "Propietari", "NAME"). */
  nombreField?: string
  /** Propiedad del shapefile con el área en hectáreas (ej. "AREA_PRED_", "Ár Fin ha"). */
  areaField?: string
  /** Métricas a mostrar en el panel para esta capa. */
  stats: CapaStat[]
}

/** Proyecto tipo "capas" (ej. G.AVAL): varias capas de predios/fincas con métricas. */
export interface ProyectoCapas extends ProyectoBase {
  tipo: 'capas'
  capas: AliadoCapa[]
  /** Demo opcional reutilizando un proyecto Escuela Bosque (ortofoto + estadísticas), rebrandeado. */
  demo?: ProyectoEscuelaBosque
}

export type AliadoProyecto = ProyectoEscuelaBosque | ProyectoCapas

export interface Aliado {
  /** Clave de login principal (en minúsculas, como la teclea el usuario). */
  key: string
  /** Variantes adicionales aceptadas en el login (en minúsculas). */
  loginAliases?: string[]
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
  /** Presentación (PDF rasterizado a imágenes) que el aliado puede mostrar en el geovisor. */
  presentacion?: {
    titulo: string
    /** Carpeta base de las páginas: `${basePath}/page-NN.webp`. */
    basePath: string
    paginas: number
  }
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
  proyecto: {
    tipo: 'escuela_bosque',
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

const GRUPO_AVAL: Aliado = {
  key: 'g. aval',
  loginAliases: ['g.aval', 'gaval', 'grupo aval'],
  password: 'GAVAL_AE_2026',
  displayName: 'Grupo AVAL',
  brandColor: '#0E9384',
  brandColorDark: '#0A6E63',
  avatarColor: '#0E9384',
  logoUrl: '/gaval/logo-aval.png',
  presentacion: {
    titulo: 'Plan de Siembra Grupo AVAL',
    basePath: '/gaval/plan-siembra',
    paginas: 6,
  },
  proyecto: {
    tipo: 'capas',
    nombre: 'Predios Caquetá',
    ubicacion: 'Florencia y alrededores · Caquetá',
    descripcion: 'Análisis de predios y fincas potenciales para el Grupo Aval en el Caquetá.',
    capas: [
      {
        id: 'predios',
        nombre: 'Predios vinculados',
        estado: 'Vinculados',
        zipUrl: '/gaval/predios.zip',
        color: '#2DBE8C',
        nombreField: 'Propietari',
        areaField: 'AREA_PRED_',
        stats: [
          { label: 'Predios vinculados',      value: '43' },
          { label: 'Hectáreas estimadas',     value: '350 ha' },
          { label: 'Árboles/ha',              value: '350' },
          { label: 'Propietarios vinculados', value: '35' },
        ],
      },
      {
        id: 'fincas',
        nombre: 'Fincas potenciales',
        estado: 'Potenciales',
        zipUrl: '/gaval/fincas-lacteos.zip',
        color: '#E0A34E',
        dashed: true,
        nombreField: 'NAME',
        areaField: 'Ár Fin ha',
        stats: [
          { label: 'Predios potenciales',     value: '66' },
          { label: 'Hectáreas estimadas',     value: '180 ha' },
          { label: 'Propietarios vinculados', value: '0' },
        ],
      },
    ],
    // Demo: reutiliza la ortofoto y las estadísticas de Escuela Bosque (las mismas
    // de Tetra Pak) pero rebrandeadas "G. AVAL (Demo)" para este inicio de sesión.
    demo: {
      tipo: 'escuela_bosque',
      nombre: 'Predio demostrativo',
      ubicacion: 'Piedemonte Andino-Amazónico · Caquetá',
      descripcion: 'Demostración: proyección de área de intervención bajo la Ley 2173.',
      predioZipUrl: '/tetrapak/EscuelaBosque_predio.zip',
      ley2173ZipUrl: '/tetrapak/EscuelaBosque_Ley2173VF.zip',
      intervenciValue: 'Tetra Pak',       // valor de filtro en el shapefile (no se muestra)
      intervenciLabel: 'G. AVAL (Demo)',  // lo que ve el usuario en el tooltip
      ficha: {
        cobertura: 'Rastrojo bajo (<4 m)',
        condicion: 'No tiene espacios grandes sin vegetación',
        tipoRestauracion: 'Activa',
        estrategia: 'Cercado · Nucleación de especies',
        gremioEspecies: 'Intermedias / Esciófitas',
        arbPorHa: 330,
      },
      predioTotal: { ha: 4.6, arbPorHa: 330, arboles: 1519 },
      aliado: { ha: 0.9, arbPorHa: 330, arboles: 284.2 },
      // Números de prueba (demostración) — no son datos reales de campo.
      monitoreo: {
        especiesSembradas: 22,
        tasaSupervivencia: 88.7,
        fechaMonitoreo: 'Mayo 2026',
        parcelasMonitoreo: 5,
      },
      ortho: {
        url: '/tetrapak/ortho-escuelabosque.webp',
        bounds: [[1.6246232, -75.5740280], [1.6332985, -75.5680800]],
      },
    },
  },
}

export const ALIADOS: Aliado[] = [BANCOLOMBIA, TETRA_PAK, GRUPO_AVAL]

// ── Mapas derivados (consumidos por LoginScreen / AuthButton) ──────────────────

/** Todas las claves de login de un aliado (principal + alias). */
function loginKeys(a: Aliado): string[] {
  return [a.key, ...(a.loginAliases ?? [])]
}

export const ACCOUNTS: Record<string, string> = Object.fromEntries(
  ALIADOS.flatMap(a => loginKeys(a).map(k => [k, a.password] as const)),
)

export const DISPLAY_NAMES: Record<string, string> = Object.fromEntries(
  ALIADOS.flatMap(a => loginKeys(a).map(k => [k, a.displayName] as const)),
)

export const AVATAR_COLORS: Record<string, string> = Object.fromEntries(
  ALIADOS.flatMap(a => loginKeys(a).map(k => [k, a.avatarColor] as const)),
)

// ── Lookups ────────────────────────────────────────────────────────────────────

export function getAliadoByKey(key: string | null | undefined): Aliado | null {
  if (!key) return null
  const k = key.trim().toLowerCase()
  return ALIADOS.find(a => a.key === k || (a.loginAliases ?? []).includes(k)) ?? null
}

export function getAliadoByDisplayName(name: string | null | undefined): Aliado | null {
  if (!name) return null
  return ALIADOS.find(a => a.displayName === name) ?? null
}
