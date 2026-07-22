'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { Inter } from 'next/font/google'
import GeovisorSwitcher from '@/components/ui/GeovisorSwitcher'
import type { DashboardV2Response, PredioProcesoV2, PredioConservacionV2 } from '@/types/geovisor-v2'
import {
  TreePine, Sprout, TreeDeciduous, MapPin, Users, Cloud,
  ChevronUp, ChevronDown, Search, Plus, Minus, Home, LocateFixed, Bookmark,
  SlidersHorizontal, HelpCircle, CircleUserRound, Ruler, Trees, Percent,
  Copy, ArrowRight, Building2, Droplets, Layers, Map as MapIcon, Route,
} from 'lucide-react'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

const SatelliteBackdrop = dynamic(() => import('@/components/geovisor-v2/SatelliteBackdrop'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#0d1a12]" />,
})

// ─────────────────────────────────────────────────────────────────────────
// Geovisor v2 — layout de la referencia del usuario, ahora con DATOS REALES:
// los KPIs y la ficha de predio vienen de /api/v2/dashboard (Supabase en
// vivo). Lo que aún no tiene fuente (árboles sembrados, carbono) se muestra
// como "—" con su explicación. El arte del mapa sigue siendo estático —
// conectar geo.zonas como capas reales es la siguiente fase.
// ─────────────────────────────────────────────────────────────────────────

const GREEN = '#2f9e5b'

/** Tratamiento común de tarjeta flotante: borde suave + sombra difusa en dos niveles */
const CARD = 'rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(20,35,25,0.05),0_10px_28px_-18px_rgba(20,35,25,0.22)]'

const nf = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 })

function fmt(n: number | null | undefined, suffix = '', decimals = 1): string {
  if (n == null) return '—'
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: decimals }).format(n) + suffix
}

function fmtCoord(c: { lat: number; lng: number } | null | undefined): string {
  if (!c) return '—'
  const ns = c.lat >= 0 ? 'N' : 'S'
  const ew = c.lng >= 0 ? 'E' : 'W'
  return `${Math.abs(c.lat).toFixed(4)}° ${ns}, ${Math.abs(c.lng).toFixed(4)}° ${ew}`
}

const ETAPA_CHIP: Record<string, { label: string; fg: string; bg: string }> = {
  juridica:    { label: 'Jurídica',    fg: '#7c5e10', bg: '#faf3dc' },
  sig_i:       { label: 'SIG I',       fg: '#92610e', bg: '#fdf1d8' },
  campo:       { label: 'Campo',       fg: '#0f766e', bg: '#defaf5' },
  sig_ii:      { label: 'SIG II',      fg: '#0f766e', bg: '#defaf5' },
  plan:        { label: 'Plan',        fg: '#1d4ed8', bg: '#e3edfd' },
  juridica_ii: { label: 'Jurídica II', fg: '#7c5e10', bg: '#faf3dc' },
  ejecucion:   { label: 'Ejecución',   fg: '#15803d', bg: '#e3f6e8' },
  archivado:   { label: 'Archivado',   fg: '#475569', bg: '#eef1f4' },
}

function KpiCard({
  icon, value, label, delta, iconBg, iconColor, muted = false,
}: { icon: React.ReactNode; value: string; label: string; delta?: string; iconBg: string; iconColor: string; muted?: boolean }) {
  return (
    <div className={`${CARD} flex min-w-0 flex-1 items-center gap-3 px-4 py-3 transition-shadow duration-200 hover:shadow-[0_2px_4px_rgba(20,35,25,0.06),0_14px_32px_-16px_rgba(20,35,25,0.28)] ${muted ? 'opacity-80' : ''}`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: muted ? '#eef1f4' : iconBg, color: muted ? '#94a3b8' : iconColor }}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className={`truncate text-[17px] font-bold leading-tight tabular-nums ${muted ? 'text-slate-400' : 'text-slate-800'}`}>{value}</div>
        <div className="truncate text-[11.5px] leading-tight text-slate-500">{label}</div>
        {delta && <div className={`mt-0.5 truncate text-[11px] font-medium leading-tight ${muted ? 'text-slate-400' : 'text-emerald-600'}`}>{delta}</div>}
      </div>
    </div>
  )
}

function FilterSelect({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-slate-500">{label}</span>
      <span className="flex cursor-pointer items-center justify-between rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[12.5px] text-slate-700 transition-colors hover:border-slate-300">
        {value}
        <ChevronDown className="text-slate-400" size={13} />
      </span>
    </label>
  )
}

function LayerRow({ icon, color, label, checked }: { icon: React.ReactNode; color: string; label: string; checked: boolean }) {
  return (
    <div className="-mx-2 flex items-center gap-2.5 rounded-md px-2 py-[7px] transition-colors hover:bg-slate-50">
      <input type="checkbox" defaultChecked={checked} className="h-3.5 w-3.5 rounded accent-emerald-600" />
      <span className="flex h-5 w-5 shrink-0 items-center justify-center" style={{ color }}>{icon}</span>
      <span className="flex-1 text-[12.5px] leading-tight text-slate-700">{label}</span>
      <SlidersHorizontal size={13} className="shrink-0 text-slate-300" />
    </div>
  )
}

function IndicatorRow({ icon, color, label, value }: { icon: React.ReactNode; color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 py-[6px]">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center" style={{ color }}>{icon}</span>
      <span className="flex-1 text-[12.5px] text-slate-600">{label}</span>
      <span className="text-[13px] font-bold text-slate-800 tabular-nums">{value}</span>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-[3px]">
      <span className="shrink-0 text-[12px] text-slate-500">{label}:</span>
      <span className="truncate text-right text-[12.5px] font-medium text-slate-800">{value}</span>
    </div>
  )
}

/** Marcador circular con ícono sobre el mapa. Posiciones en % del panel del mapa. */
function MapMarker({ top, left, color, rounded = 'rounded-full', icon }: {
  top: string; left: string; color: string; rounded?: string; icon: React.ReactNode
}) {
  return (
    <div
      className={`absolute z-10 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center border-2 border-white/90 shadow-md ${rounded}`}
      style={{ top, left, background: color }}
    >
      {icon}
    </div>
  )
}

/** Botón cuadrado de control de mapa (zoom / inicio / GPS) */
function MapControlButton({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <button title={title} className="flex h-9 w-9 items-center justify-center text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800">
      {children}
    </button>
  )
}

export default function GeovisorV2Page() {
  const [dash, setDash] = useState<DashboardV2Response | null>(null)
  const [dashError, setDashError] = useState(false)
  /** "p:<uuid>" (proceso) | "c:<nucleo|predio>" (conservación) */
  const [selId, setSelId] = useState<string>('')

  useEffect(() => {
    fetch('/api/v2/dashboard')
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json() })
      .then((d: DashboardV2Response) => {
        setDash(d)
        // Ficha inicial: el predio del proceso con más zonas de siembra (hoy: La Guajira)
        const top = [...d.prediosProceso].sort((a, b) => b.zonasSiembra - a.zonasSiembra)[0]
        if (top) setSelId(`p:${top.id}`)
        else if (d.prediosConservacion[0]) setSelId(`c:${d.prediosConservacion[0].id}`)
      })
      .catch(() => setDashError(true))
  }, [])

  const k = dash?.kpis
  /** Valor de KPI durante la carga: "…"; si el fetch falló: "—" */
  const loading = !dash && !dashError

  const seleccionado: PredioProcesoV2 | PredioConservacionV2 | null = useMemo(() => {
    if (!dash || !selId) return null
    if (selId.startsWith('p:')) return dash.prediosProceso.find((p) => p.id === selId.slice(2)) ?? null
    return dash.prediosConservacion.find((p) => p.id === selId.slice(2)) ?? null
  }, [dash, selId])

  const chip = useMemo(() => {
    if (!seleccionado) return null
    if (seleccionado.tipo === 'conservacion') return { label: 'Conservación', fg: '#15803d', bg: '#e3f6e8' }
    return ETAPA_CHIP[seleccionado.etapa ?? ''] ?? { label: seleccionado.etapa ?? '—', fg: '#475569', bg: '#eef1f4' }
  }, [seleccionado])

  return (
    <div className={`${inter.className} fixed inset-0 flex flex-col overflow-hidden bg-[#f1f3ee] text-slate-900`}>
      <GeovisorSwitcher />

      {/* ── Header claro ───────────────────────────────────────────────── */}
      {/* pr-56 deja libre la esquina donde flota el GeovisorSwitcher */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white pl-5 pr-56">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-ae.png" alt="Amazonía Emprende" className="h-10 w-auto" />
          <div className="h-9 w-px bg-slate-200" />
          <div className="leading-tight">
            <div className="text-[15px] font-bold tracking-wide text-slate-800">GEOPORTAL</div>
            <div className="text-[11px] text-slate-500">Restauración y Conectividad</div>
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-[12.5px] text-slate-500 lg:flex">
          <span className="border-b-2 border-emerald-800 pb-0.5 font-semibold text-slate-800">Inicio</span>
          <span className="cursor-default transition-colors hover:text-slate-800">Proyectos</span>
          <span className="cursor-default transition-colors hover:text-slate-800">Restauración</span>
          <span className="cursor-default transition-colors hover:text-slate-800">Conectividad</span>
          <span className="cursor-default transition-colors hover:text-slate-800">Árboles Semilleros</span>
          <span className="cursor-default transition-colors hover:text-slate-800">Monitoreo</span>
          <span className="cursor-default transition-colors hover:text-slate-800">Indicadores</span>
          <span className="cursor-default transition-colors hover:text-slate-800">Descargas</span>
        </nav>

        <div className="flex items-center gap-5 text-[12.5px] text-slate-500">
          <span className="flex cursor-default items-center gap-1.5 transition-colors hover:text-slate-700"><HelpCircle size={16} strokeWidth={1.75} /> Ayuda</span>
          <span className="flex cursor-default items-center gap-1.5 transition-colors hover:text-slate-700"><CircleUserRound size={16} strokeWidth={1.75} /> Iniciar sesión</span>
        </div>
      </header>

      {/* ── Cuerpo: columna de filtros + columna de contenido ──────────── */}
      <div className="flex min-h-0 flex-1 gap-3 p-3">

        {/* Columna izquierda: tarjeta FILTROS/CAPAS + tarjeta Guardar vista */}
        <div className="gv2-rise flex w-60 shrink-0 flex-col gap-3">
          <aside className={`${CARD} flex min-h-0 flex-1 flex-col overflow-hidden`}>
            <div className="gv2-scroll min-h-0 flex-1 overflow-y-auto p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-[0.08em] text-slate-500">FILTROS</span>
                <ChevronUp size={14} className="text-slate-400" />
              </div>
              <div className="flex flex-col gap-2.5">
                <FilterSelect label="Departamento" value="Todos" />
                <FilterSelect label="Municipio" value="Todos" />
                <FilterSelect label="Núcleo forestal" value="Todos" />
                <FilterSelect label="Proyecto" value="Todos" />
                <div className="grid grid-cols-2 gap-2.5">
                  <FilterSelect label="Año" value="2024" />
                  <FilterSelect label="Estado" value="Todos" />
                </div>
              </div>

              <div className="my-3.5 border-t border-slate-100" />

              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-[0.08em] text-slate-500">CAPAS</span>
                <ChevronUp size={14} className="text-slate-400" />
              </div>
              <div className="flex flex-col">
                <LayerRow icon={<TreePine size={13} />} color="#2f9e5b" label="Restauración" checked />
                <LayerRow icon={<TreeDeciduous size={13} />} color="#154d2b" label="Conservación" checked />
                <LayerRow icon={<Route size={13} />} color="#e0812c" label="Corredores ecológicos" checked />
                <LayerRow icon={<TreeDeciduous size={13} />} color="#3a9d5d" label="Árboles semilleros" checked />
                <LayerRow icon={<Building2 size={13} />} color="#dd8a2c" label="Parcelas permanentes" checked />
                <LayerRow icon={<Sprout size={13} />} color="#8a5cc4" label="Viveros comunitarios" checked />
                <LayerRow icon={<Droplets size={13} />} color="#2f7fc4" label="Fuentes hídricas" checked />
                <LayerRow icon={<Layers size={13} />} color="#94a3b8" label="Coberturas de la tierra" checked={false} />
                <LayerRow icon={<MapIcon size={13} />} color="#94a3b8" label="Límites político-administrativos" checked={false} />
              </div>
            </div>
          </aside>

          <button className={`${CARD} flex shrink-0 items-center justify-center gap-2 py-2.5 text-[12px] font-medium text-slate-600 transition-colors hover:bg-slate-50`}>
            <Bookmark size={13} /> Guardar vista
          </button>
        </div>

        {/* Columna de contenido: KPIs + (mapa | panel derecho) */}
        <main className="flex min-w-0 flex-1 flex-col gap-3">

          {/* Fila de indicadores — datos reales de /api/v2/dashboard */}
          <div className="gv2-rise flex shrink-0 gap-3" style={{ animationDelay: '60ms' }}>
            <KpiCard
              icon={<TreePine size={17} />} iconBg="#e7f6ec" iconColor="#2f9e5b"
              value={loading ? '…' : fmt(k?.haRestauracionSig, ' ha')}
              label="Hectáreas en restauración"
              delta={k ? `${k.prediosProceso} predios en proceso` : undefined}
            />
            <KpiCard
              icon={<Sprout size={17} />} iconBg="#eef8e2" iconColor="#6a9e2f"
              value={loading ? '…' : fmt(k?.arbolesSembrados)}
              label="Árboles sembrados"
              delta={k ? 'Requiere módulo Ejecución' : undefined}
              muted={!!k && k.arbolesSembrados == null}
            />
            <KpiCard
              icon={<TreeDeciduous size={17} />} iconBg="#f4efe1" iconColor="#8a6a35"
              value={loading ? '…' : fmt(k?.arbolesSemilleros)}
              label="Árboles semilleros"
              delta={k ? `${k.especiesRas} especies identificadas` : undefined}
            />
            <KpiCard
              icon={<MapPin size={17} />} iconBg="#e6f0fb" iconColor="#2f7fc4"
              value={loading ? '…' : fmt(k?.municipios)}
              label="Municipios"
              delta={k ? `${k.departamentos} departamento${k.departamentos === 1 ? '' : 's'}` : undefined}
            />
            <KpiCard
              icon={<Users size={17} />} iconBg="#fdeee0" iconColor="#dd8a2c"
              value={loading ? '…' : fmt(k?.familiasVinculadas)}
              label="Familias vinculadas"
              delta={k ? `${nf.format(k.haBosqueConservacion)} ha de bosque · ${k.personas} personas` : undefined}
            />
            <KpiCard
              icon={<Cloud size={17} />} iconBg="#fbe9f1" iconColor="#c94f86"
              value={loading ? '…' : (k?.carbonoTco2e == null ? '—' : `${nf.format(k.carbonoTco2e)} tCO₂e`)}
              label="Carbono estimado"
              delta={k ? 'Requiere módulo MRV' : undefined}
              muted={!!k && k.carbonoTco2e == null}
            />
          </div>

          <div className="flex min-h-0 flex-1 gap-3">

            {/* ── Panel del mapa (arte estático — capas reales: siguiente fase) ── */}
            <div className="gv2-rise isolate relative min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(20,35,25,0.05),0_10px_28px_-18px_rgba(20,35,25,0.22)]" style={{ animationDelay: '120ms' }}>
              <div className="absolute inset-0 z-0">
                <SatelliteBackdrop />
              </div>

              {/* Arte estático: zonas, corredores y etiquetas */}
              <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" viewBox="0 0 1280 650" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <filter id="lblShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#000" floodOpacity="0.55" />
                  </filter>
                </defs>

                {/* Corredores ecológicos */}
                <path d="M420,250 C500,225 560,290 630,305 C710,325 760,285 830,320" fill="none" stroke="#e0812c" strokeWidth="2.5" strokeDasharray="7 6" opacity="0.85" strokeLinecap="round" />
                <path d="M470,420 C520,390 570,405 640,395 C705,388 740,415 800,398" fill="none" stroke="#e0812c" strokeWidth="2.5" strokeDasharray="7 6" opacity="0.85" strokeLinecap="round" />

                {/* Restauración activa */}
                <polygon points="480,240 540,225 575,265 555,305 500,300 475,270" fill="#7ed957" fillOpacity="0.55" stroke="#5fc23a" strokeWidth="1.6" strokeLinejoin="round" />
                <polygon points="600,290 660,275 695,315 670,355 615,345" fill="#7ed957" fillOpacity="0.55" stroke="#5fc23a" strokeWidth="1.6" strokeLinejoin="round" />
                <polygon points="700,205 750,195 775,230 750,260 710,250" fill="#7ed957" fillOpacity="0.5" stroke="#5fc23a" strokeWidth="1.6" strokeLinejoin="round" />

                {/* Restauración finalizada */}
                <polygon points="430,340 480,325 505,360 480,395 440,388" fill="#c7dd6e" fillOpacity="0.55" stroke="#a9c24d" strokeWidth="1.4" strokeLinejoin="round" />
                <polygon points="760,330 805,320 825,355 795,385" fill="#c7dd6e" fillOpacity="0.5" stroke="#a9c24d" strokeWidth="1.4" strokeLinejoin="round" />

                {/* Conservación */}
                <polygon points="560,150 630,140 655,180 620,215 570,205" fill="#1f6b3d" fillOpacity="0.55" stroke="#154d2b" strokeWidth="1.6" strokeLinejoin="round" />
                <polygon points="680,420 740,405 775,440 745,480 690,470" fill="#1f6b3d" fillOpacity="0.55" stroke="#154d2b" strokeWidth="1.6" strokeLinejoin="round" />
                <polygon points="850,260 910,250 935,285 905,315 860,305" fill="#1f6b3d" fillOpacity="0.5" stroke="#154d2b" strokeWidth="1.6" strokeLinejoin="round" />

                {/* Suelo intervenido / parcela (ocre, como en la referencia) */}
                <polygon points="620,240 660,232 678,262 655,285 625,278" fill="#d98a3c" fillOpacity="0.5" stroke="#b8712c" strokeWidth="1.4" strokeLinejoin="round" />
                <polygon points="545,335 580,328 595,352 572,372 548,364" fill="#c96a9d" fillOpacity="0.38" stroke="#a9527f" strokeWidth="1.2" strokeLinejoin="round" />

                {/* Etiquetas de departamentos */}
                <text x="300" y="100" fill="#fff" fontSize="15" fontWeight="700" letterSpacing="1.5" filter="url(#lblShadow)">HUILA</text>
                <text x="1000" y="150" fill="#fff" fontSize="15" fontWeight="700" letterSpacing="1.5" filter="url(#lblShadow)">GUAVIARE</text>
                <text x="400" y="290" fill="#fff" fontSize="20" fontWeight="800" letterSpacing="1.5" filter="url(#lblShadow)">CAQUETÁ</text>
                <text x="290" y="470" fill="#fff" fontSize="15" fontWeight="700" letterSpacing="1.5" filter="url(#lblShadow)">PUTUMAYO</text>
                <text x="860" y="530" fill="#fff" fontSize="20" fontWeight="800" letterSpacing="1.5" filter="url(#lblShadow)">AMAZONAS</text>
                <text x="560" y="620" fill="#fff" fontSize="14" fontWeight="700" letterSpacing="2" filter="url(#lblShadow)">PERÚ</text>
              </svg>

              {/* Marcadores (posiciones en % — sobreviven al resize) */}
              <div className="pointer-events-none absolute inset-0 z-10">
                <MapMarker top="36%" left="41%" color="#2f9e5b" icon={<TreeDeciduous size={13} color="#fff" />} />
                <MapMarker top="46%" left="49%" color="#2f9e5b" icon={<TreeDeciduous size={13} color="#fff" />} />
                <MapMarker top="31%" left="56%" color="#2f9e5b" icon={<TreeDeciduous size={13} color="#fff" />} />
                <MapMarker top="56%" left="38%" color="#2f9e5b" icon={<TreeDeciduous size={13} color="#fff" />} />
                <MapMarker top="60%" left="57%" color="#2f9e5b" icon={<TreeDeciduous size={13} color="#fff" />} />
                <MapMarker top="42%" left="66%" color="#2f9e5b" icon={<TreeDeciduous size={13} color="#fff" />} />

                <MapMarker top="40%" left="52%" color="#dd8a2c" rounded="rounded-md" icon={<Building2 size={12} color="#fff" />} />
                <MapMarker top="58%" left="47%" color="#dd8a2c" rounded="rounded-md" icon={<Building2 size={12} color="#fff" />} />

                <MapMarker top="28%" left="46%" color="#8a5cc4" icon={<Sprout size={13} color="#fff" />} />
                <MapMarker top="52%" left="61%" color="#8a5cc4" icon={<Sprout size={13} color="#fff" />} />
                <MapMarker top="63%" left="34%" color="#8a5cc4" icon={<Sprout size={13} color="#fff" />} />
              </div>

              {/* Búsqueda */}
              <div className="absolute left-3 top-3 z-20 flex w-64 items-center gap-2 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-md backdrop-blur transition-shadow focus-within:shadow-lg focus-within:ring-2 focus-within:ring-emerald-600/25">
                <Search size={15} className="text-slate-400" />
                <input placeholder="Buscar lugar o predio" className="w-full bg-transparent text-[12.5px] text-slate-700 outline-none placeholder:text-slate-400" />
              </div>

              {/* Zoom / inicio / GPS — agrupados como en la referencia */}
              <div className="absolute left-3 top-[58px] z-20 flex flex-col gap-2">
                <div className="flex flex-col divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white/95 shadow-md">
                  <MapControlButton title="Acercar"><Plus size={15} /></MapControlButton>
                  <MapControlButton title="Alejar"><Minus size={15} /></MapControlButton>
                </div>
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white/95 shadow-md">
                  <MapControlButton title="Vista inicial"><Home size={14} /></MapControlButton>
                </div>
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white/95 shadow-md">
                  <MapControlButton title="Mi ubicación"><LocateFixed size={14} /></MapControlButton>
                </div>
              </div>

              {/* Leyenda */}
              <div className="absolute bottom-3 left-3 z-20 rounded-xl border border-slate-200 bg-white/97 px-4 py-3 shadow-lg backdrop-blur">
                <div className="flex flex-col gap-[7px] text-[11.5px] text-slate-600">
                  <div className="flex items-center gap-2"><span className="h-2.5 w-4 rounded-sm" style={{ background: '#7ed957' }} /> Restauración activa</div>
                  <div className="flex items-center gap-2"><span className="h-2.5 w-4 rounded-sm" style={{ background: '#c7dd6e' }} /> Restauración finalizada</div>
                  <div className="flex items-center gap-2"><span className="h-2.5 w-4 rounded-sm" style={{ background: '#1f6b3d' }} /> Conservación</div>
                  <div className="flex items-center gap-2"><span className="h-0 w-4 border-t-2 border-dashed" style={{ borderColor: '#e0812c' }} /> Corredores ecológicos</div>
                  <div className="flex items-center gap-2"><span className="flex h-4 w-4 items-center justify-center rounded-full" style={{ background: '#2f9e5b' }}><TreeDeciduous size={9} color="#fff" /></span> Árboles semilleros</div>
                  <div className="flex items-center gap-2"><span className="flex h-4 w-4 items-center justify-center rounded-md" style={{ background: '#dd8a2c' }}><Building2 size={9} color="#fff" /></span> Parcelas permanentes</div>
                  <div className="flex items-center gap-2"><span className="flex h-4 w-4 items-center justify-center rounded-full" style={{ background: '#8a5cc4' }}><Sprout size={9} color="#fff" /></span> Viveros comunitarios</div>
                </div>
              </div>

              {/* Escala + atribución */}
              <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 rounded-md bg-white/90 px-2.5 py-1 text-[10px] text-slate-500 shadow">
                <span>0</span><span className="mx-1 h-px w-6 bg-slate-400" /><span>25</span>
                <span className="mx-1 h-px w-6 bg-slate-400" /><span>50</span>
                <span className="mx-1 h-px w-10 bg-slate-400" /><span>100 km</span>
                <span className="ml-2 text-[9px] text-slate-400">© Esri</span>
              </div>
            </div>

            {/* ── Columna derecha: ficha del predio + coordenadas ─────────── */}
            <div className="gv2-rise flex w-[300px] shrink-0 flex-col gap-3" style={{ animationDelay: '180ms' }}>
              <aside className={`${CARD} flex min-h-0 flex-1 flex-col overflow-hidden`}>
                <div className="relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/portada/DJI_0055.jpg" alt="Vista aérea del predio" className="h-28 w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/25 to-transparent" />
                </div>

                <div className="gv2-scroll min-h-0 flex-1 overflow-y-auto px-4 py-3">
                  <div className="mb-3 flex items-center justify-center gap-10 border-b border-slate-100 text-[12.5px]">
                    <span className="cursor-default border-b-2 pb-2 font-semibold" style={{ borderColor: GREEN, color: GREEN }}>Información</span>
                    <span className="cursor-default pb-2 text-slate-400 transition-colors hover:text-slate-600">Gráficas</span>
                  </div>

                  {/* Selector de predio — datos reales */}
                  <select
                    value={selId}
                    onChange={(e) => setSelId(e.target.value)}
                    className="mb-3 w-full cursor-pointer rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[12.5px] text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-emerald-600"
                  >
                    {!dash && <option value="">{dashError ? 'Sin conexión con la base de datos' : 'Cargando predios…'}</option>}
                    {dash && (
                      <>
                        <optgroup label="Proceso de restauración">
                          {dash.prediosProceso.map((p) => (
                            <option key={p.id} value={`p:${p.id}`}>{p.nombre} · {p.municipio}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Red de árboles semilleros">
                          {dash.prediosConservacion.map((p) => (
                            <option key={p.id} value={`c:${p.id}`}>{p.nombre}</option>
                          ))}
                        </optgroup>
                      </>
                    )}
                  </select>

                  {seleccionado && chip && (
                    <>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <h2 className="truncate text-[15.5px] font-bold text-slate-800">{seleccionado.nombre}</h2>
                        <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: chip.bg, color: chip.fg }}>{chip.label}</span>
                      </div>

                      {seleccionado.tipo === 'proceso' ? (
                        <>
                          <div className="flex flex-col">
                            <InfoRow label="Propietario" value={seleccionado.aliado} />
                            <InfoRow label="Municipio" value={seleccionado.municipio} />
                            <InfoRow label="Departamento" value={seleccionado.departamento ?? '—'} />
                            <InfoRow label="Vereda" value={seleccionado.vereda ?? '—'} />
                            <InfoRow label="Núcleo" value={seleccionado.nucleo ?? '—'} />
                            <InfoRow label="Semáforo jurídico" value={seleccionado.semaforo ? seleccionado.semaforo[0].toUpperCase() + seleccionado.semaforo.slice(1) : '—'} />
                          </div>

                          <div className="mb-1 mt-4 border-t border-slate-100 pt-3 text-[12px] font-bold text-slate-700">Indicadores del predio</div>
                          <div className="flex flex-col">
                            <IndicatorRow icon={<Ruler size={14} />} color="#2f7fc4" label="Área registral" value={fmt(seleccionado.areaRegistralHa, ' ha')} />
                            <IndicatorRow icon={<MapIcon size={14} />} color="#2f7fc4" label="Área finca (SIG)" value={fmt(seleccionado.areaFincaSigHa, ' ha')} />
                            <IndicatorRow icon={<TreePine size={14} />} color="#2f9e5b" label="Área en restauración (SIG)" value={fmt(seleccionado.areaRestauracionSigHa, ' ha')} />
                            <IndicatorRow icon={<Layers size={14} />} color="#2f9e5b" label="Zonas de siembra" value={String(seleccionado.zonasSiembra)} />
                            <IndicatorRow icon={<Sprout size={14} />} color="#94a3b8" label="Árboles sembrados" value="—" />
                            <IndicatorRow icon={<Cloud size={14} />} color="#94a3b8" label="Carbono estimado" value="—" />
                          </div>
                          <p className="mt-2 text-[10.5px] leading-snug text-slate-400">
                            Árboles sembrados y carbono aparecerán cuando existan los módulos Plan de siembra y Ejecución/MRV.
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex flex-col">
                            <InfoRow label="Núcleo" value={seleccionado.nucleo ?? '—'} />
                            <InfoRow label="Municipio" value={seleccionado.municipio ?? '—'} />
                            <InfoRow label="Vereda" value={seleccionado.vereda ?? '—'} />
                            <InfoRow label="Bosque" value={fmt(seleccionado.haBosque, ' ha')} />
                          </div>

                          <div className="mb-1 mt-4 border-t border-slate-100 pt-3 text-[12px] font-bold text-slate-700">Indicadores del predio</div>
                          <div className="flex flex-col">
                            <IndicatorRow icon={<TreeDeciduous size={14} />} color="#8a6a35" label="Árboles semilleros" value={String(seleccionado.arboles)} />
                            <IndicatorRow icon={<Trees size={14} />} color="#2f9e5b" label="Especies forestales" value={String(seleccionado.especies)} />
                            <IndicatorRow icon={<Percent size={14} />} color="#6a9e2f" label="Diversidad (Shannon H′)" value={fmt(seleccionado.shannonH, '', 3)} />
                            <IndicatorRow icon={<Ruler size={14} />} color="#2f7fc4" label="Área basal" value={fmt(seleccionado.areaBasalM2, ' m²')} />
                            <IndicatorRow icon={<Ruler size={14} />} color="#2f7fc4" label="DAP medio" value={fmt(seleccionado.dapMedioCm, ' cm')} />
                            <IndicatorRow icon={<TreePine size={14} />} color="#2f9e5b" label="Densidad" value={fmt(seleccionado.densidadArbHa, ' árb/ha')} />
                            <IndicatorRow icon={<Cloud size={14} />} color="#c94f86" label="Árboles amenazados (IUCN)" value={fmt(seleccionado.arbAmenazados)} />
                          </div>
                        </>
                      )}

                      <div className="mt-3 flex cursor-pointer items-center gap-1.5 text-[12px] font-semibold transition-colors hover:underline" style={{ color: GREEN }}>
                        Ver predio en detalle <ArrowRight size={13} />
                      </div>
                    </>
                  )}
                </div>
              </aside>

              <div className={`${CARD} flex shrink-0 items-center justify-between px-4 py-2.5`}>
                <div>
                  <div className="text-[11px] font-semibold text-slate-700">Coordenadas</div>
                  <div className="text-[12px] text-slate-500 tabular-nums">{fmtCoord(seleccionado?.centroide)}</div>
                </div>
                <button title="Copiar coordenadas" className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600">
                  <Copy size={13} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="flex h-12 shrink-0 items-center justify-between border-t border-slate-200 bg-white px-5 text-[11.5px] text-slate-500">
        <div className="flex items-center gap-3">
          <span>Amazonía Emprende © 2024</span>
          <span className="text-slate-300">|</span>
          <span className="cursor-default transition-colors hover:text-slate-700">Política de privacidad</span>
          <span className="text-slate-300">|</span>
          <span className="cursor-default transition-colors hover:text-slate-700">Términos de uso</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-ae.png" alt="" className="hidden h-7 w-auto opacity-70 md:block" />
        <div className="flex items-center gap-5">
          <span className="text-slate-400">Con el apoyo de:</span>
          <span className="text-[13px] font-extrabold italic tracking-tight" style={{ color: '#0b4ea2' }}>Tetra Pak<sup className="text-[8px]">®</sup></span>
          <span className="text-[13px] font-bold" style={{ color: '#1f5bd8' }}>FAO</span>
          <span className="text-[14px] font-extrabold lowercase" style={{ color: '#3fa33f' }}>gef</span>
        </div>
      </footer>
    </div>
  )
}
