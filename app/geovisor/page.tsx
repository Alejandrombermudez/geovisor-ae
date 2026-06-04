'use client'

import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type L from 'leaflet'
import type { SiembraFamilia, RasFamilia, ActiveCategory, VisibleLayers, Proyeccion } from '@/types/geovisor'
import { getAliadoByDisplayName } from '@/lib/aliados'
import { useGeovisorData } from '@/hooks/useGeovisorData'
import LeftSidebar from '@/components/ui/LeftSidebar'
import RightPanel from '@/components/ui/RightPanel'
import MetasPanel from '@/components/ui/MetasPanel'
import MetricasAliadoPanel from '@/components/ui/MetricasAliadoPanel'
import MetricasCapasPanel from '@/components/ui/MetricasCapasPanel'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import LayerLoadingIndicator from '@/components/ui/LayerLoadingIndicator'
import MapLegend from '@/components/map/MapLegend'
import LoginScreen from '@/components/ui/LoginScreen'
import IntroOverlay, { type IntroPhase } from '@/components/intro/IntroOverlay'

const GeovisorMap = dynamic(
  () => import('@/components/map/GeovisorMap'),
  {
    ssr: false,
    loading: () => <LoadingOverlay message="Cargando mapa..." />,
  }
)

const RIGHT_RATIO = 0.35

const LS_KEY = 'geoae_user'

export default function GeovisorPage() {
  // ── Auth ────────────────────────────────────────────────────────────────
  const [authUser,     setAuthUser]     = useState<string | null>(null)
  const [authChecked,  setAuthChecked]  = useState(false)

  useEffect(() => {
    try { setAuthUser(localStorage.getItem(LS_KEY)) } catch { /* noop */ }
    setAuthChecked(true)
  }, [])

  const [showLogin,    setShowLogin]    = useState(false)

  // ── Intro overlay ──────────────────────────────────────────────────────
  // Fase activa de la intro. 'idle' = oculta.
  const [introPhase, setIntroPhase] = useState<IntroPhase | 'idle'>('idle')
  // Si la intro arranca tras un login, se setea aquí para mostrar el WelcomePrompt
  // cuando ya se vio antes (showWelcomeOnReturn=true). Apertura manual desde el
  // sidebar nunca pasa por welcome — va directo al hub.
  const [introViaLogin, setIntroViaLogin] = useState(false)

  // ── Aliado (proyecto personalizado, ej. Tetra Pak) ──────────────────────
  /** Capa del aliado activa en el mapa (predio + polígonos) */
  const [aliadoViewActive,  setAliadoViewActive]  = useState(false)
  /** Panel derecho de Métricas del aliado abierto */
  const [aliadoMetricsOpen, setAliadoMetricsOpen] = useState(false)
  /** Pestaña inicial del panel del aliado: métricas o monitoreo */
  const [aliadoMetricsView, setAliadoMetricsView] = useState<'metricas' | 'monitoreo'>('metricas')
  /** true → LeftSidebar abre la vista del aliado (post-login) */
  const [openAliadoView,    setOpenAliadoView]    = useState(false)

  // Tras cerrar el intro post-login, abrir la vista del aliado (si tiene proyecto)
  const pendingAliadoOpenRef = useRef(false)

  const handleLogin = useCallback((user: string) => {
    setAuthUser(user)
    setShowLogin(false)
    // Si el aliado tiene proyecto personalizado, abrir su vista al cerrar el intro
    pendingAliadoOpenRef.current = !!getAliadoByDisplayName(user)?.proyecto
    // Disparar intro animada
    setIntroViaLogin(true)
    setIntroPhase('logo')
  }, [])
  const handleLogout = useCallback(() => {
    try { localStorage.removeItem(LS_KEY) } catch { /* noop */ }
    setAuthUser(null)
    setAliadoViewActive(false)
    setAliadoMetricsOpen(false)
  }, [])

  const handleCloseIntro = useCallback(() => {
    setIntroPhase('idle')
    setIntroViaLogin(false)
    // Post-login de un aliado: mostrar sus polígonos después del intro
    if (pendingAliadoOpenRef.current) {
      pendingAliadoOpenRef.current = false
      setOpenAliadoView(true)
      setTimeout(() => setOpenAliadoView(false), 300)
    }
  }, [])

  const handleOpenIntroFromSidebar = useCallback(() => {
    // Apertura manual → directo al hub (saltar typewriter y welcome)
    setIntroViaLogin(false)
    setIntroPhase('hub')
  }, [])

  const { data, siembraFamilias, rasFamilias, loadingLayers, error } = useGeovisorData()
  const [activeCategory,     setActiveCategory]     = useState<ActiveCategory>(null)
  const [selectedFamiliaId,  setSelectedFamiliaId]  = useState<string | null>(null)
  const [proyecciones,       setProyecciones]       = useState<Proyeccion[]>([])
  const [activeProyeccionId, setActiveProyeccionId] = useState<string | null>(null)

  // ── Metas ──────────────────────────────────────────────────────────────
  const [metasYear,         setMetasYear]         = useState(2026)
  const [metasMetricsOpen,  setMetasMetricsOpen]  = useState(false)
  /** Controla si la capa de veredas está visible en el mapa */
  const [metasLayerActive,  setMetasLayerActive]  = useState(false)
  /** true → LeftSidebar abre la vista Metas (activado desde intro hub card 3) */
  const [openMetasView,     setOpenMetasView]     = useState(false)

  // Aliado en sesión (deriva del nombre visible). Tetra Pak tiene proyecto.
  const aliado = useMemo(() => getAliadoByDisplayName(authUser), [authUser])
  /** Con un aliado especializado en sesión, se oculta todo lo de Bancolombia */
  const hideBancolombia = aliado?.proyecto != null

  /** Activa/desactiva la vista del aliado: muestra su capa, oculta el resto */
  const handleAliadoViewToggle = useCallback((open: boolean) => {
    if (open) {
      setActiveCategory(null)
      setSelectedFamiliaId(null)
      setActiveProyeccionId(null)
      setMetasLayerActive(false)
      setAliadoViewActive(true)
    } else {
      setAliadoViewActive(false)
      setAliadoMetricsOpen(false)
    }
  }, [])

  const handleOpenAliadoMetrics  = useCallback((view: 'metricas' | 'monitoreo' = 'metricas') => {
    setAliadoMetricsView(view)
    setAliadoMetricsOpen(true)
  }, [])
  const handleCloseAliadoMetrics = useCallback(() => setAliadoMetricsOpen(false), [])

  /** Activa/desactiva la vista Metas: habilita Fase I, oculta capas de familias */
  const handleMetasViewToggle = useCallback((open: boolean) => {
    if (open) {
      const fase1 = proyecciones[0]
      if (fase1) setActiveProyeccionId(fase1.id)
      setActiveCategory(null)
      setSelectedFamiliaId(null)
      setMetasLayerActive(true)
    } else {
      setActiveProyeccionId(null)
      setMetasLayerActive(false)
    }
  }, [proyecciones])

  const handleOpenMetasFromHub = useCallback(() => {
    // Aliado con proyecto (ej. Tetra Pak): su card del intro lleva SIEMPRE a su
    // módulo, nunca a las Metas generales. Evita la carrera del primer login.
    if (aliado?.proyecto) {
      handleAliadoViewToggle(true)
      setOpenAliadoView(true)
      setTimeout(() => setOpenAliadoView(false), 300)
      return
    }
    setOpenMetasView(true)
    setTimeout(() => setOpenMetasView(false), 300)
    // También activar la vista Metas como si viniera del sidebar
    const fase1 = proyecciones[0]
    if (fase1) setActiveProyeccionId(fase1.id)
    setActiveCategory(null)
    setSelectedFamiliaId(null)
    setMetasLayerActive(true)
  }, [proyecciones, aliado, handleAliadoViewToggle])

  const handleCloseMetasMetrics = useCallback(() => {
    setMetasMetricsOpen(false)
  }, [])

  useEffect(() => {
    fetch('/api/proyecciones')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((d: Proyeccion[]) => setProyecciones(d))
      .catch(err => console.warn('[proyecciones] Error al cargar:', err))
  }, [])

  // LeftSidebar manages its own size internally and notifies us via onWidthChange.
  // Initial value 96 matches SIZES[1] (medium) in LeftSidebar.
  const [leftWidth,  setLeftWidth]  = useState(96)
  const [rightRatio, setRightRatio] = useState(RIGHT_RATIO)
  const [screenW,    setScreenW]    = useState(0)

  const leafletMapRef = useRef<L.Map | null>(null)
  const onMapInit = useCallback((map: L.Map) => { leafletMapRef.current = map }, [])

  const handleFamiliaClick = useCallback((familia: SiembraFamilia | RasFamilia, category: ActiveCategory) => {
    setActiveCategory(category)
    setSelectedFamiliaId(familia.id)
  }, [])

  const handleClose = useCallback(() => {
    setActiveCategory(null)
    setSelectedFamiliaId(null)
  }, [])

  const handleSelectProyeccion = useCallback((id: string | null) => {
    setActiveProyeccionId(id)
    if (id !== null) {
      setActiveCategory(null)
      setSelectedFamiliaId(null)
    }
  }, [])

  useEffect(() => {
    setScreenW(window.innerWidth)
    function onResize() { setScreenW(window.innerWidth) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const isMobile = screenW > 0 && screenW < 640

  const effectiveLeftWidth = isMobile ? 0 : leftWidth
  const rightWidth = isMobile ? screenW : (screenW > 0 ? Math.round(screenW * rightRatio) : 0)

  const ALL_HIDDEN: VisibleLayers = useMemo(() => ({
    siembraFincas: false, restauracion: false, siembraArboles: false,
    rasFincas: false,     conservacion: false, rasArboles: false,
    camarasSiembra: false, camarasConservacion: false,
  }), [])

  const visibleLayers = useMemo<VisibleLayers>(() => {
    // Vista del aliado activa → solo se muestra su capa (predio + polígonos)
    if (aliadoViewActive) return ALL_HIDDEN
    // Cuando la vista de Conectividad está activa, ocultamos todas las capas de familias
    if (activeProyeccionId !== null) return ALL_HIDDEN
    if (activeCategory === 'siembra') {
      return {
        siembraFincas: true,  restauracion: true,  siembraArboles: true,
        rasFincas: false,     conservacion: false,  rasArboles: false,
        camarasSiembra: true, camarasConservacion: false,
      }
    }
    if (activeCategory === 'ras') {
      return {
        siembraFincas: false, restauracion: false, siembraArboles: false,
        rasFincas: true,      conservacion: true,  rasArboles: true,
        camarasSiembra: false, camarasConservacion: true,
      }
    }
    // Default sin selección: mapa limpio (vista Colombia)
    return ALL_HIDDEN
  }, [activeCategory, activeProyeccionId, aliadoViewActive, ALL_HIDDEN])

  // Posición de los botones de zoom
  const zoomBtnRight  = isMobile ? 16 : (activeCategory !== null ? rightWidth + 16 : 16)
  const zoomBtnBottom = isMobile ? 56 + 16 : 80
  const zoomBtnSize   = isMobile ? 44 : 32

  const zoomBtnStyle: React.CSSProperties = {
    width: zoomBtnSize,
    height: zoomBtnSize,
    background: 'rgba(20,20,20,0.82)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    fontSize: 18,
    fontWeight: 400,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    lineHeight: 1,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    transition: 'background 0.15s ease',
    userSelect: 'none',
  }

  return (
    <div style={{ height: '100dvh', width: '100vw', position: 'relative', overflow: 'hidden' }}>
      <GeovisorMap
        layerData={data}
        visibleLayers={visibleLayers}
        selectedFamiliaId={selectedFamiliaId}
        onMapInit={onMapInit}
        onFamiliaClick={handleFamiliaClick}
        proyecciones={proyecciones}
        activeProyeccionId={activeProyeccionId}
        metasYear={metasLayerActive ? metasYear : null}
        metasMode={metasLayerActive}
        metasHideFB={hideBancolombia}
        aliadoProyecto={aliadoViewActive ? (aliado?.proyecto ?? null) : null}
        aliadoBrandColor={aliado?.brandColor}
      />

      <LeftSidebar
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onWidthChange={setLeftWidth}
        isMobile={isMobile}
        proyecciones={proyecciones}
        activeProyeccionId={activeProyeccionId}
        onSelectProyeccion={handleSelectProyeccion}
        authUser={authUser}
        onLogout={handleLogout}
        onRequestLogin={() => setShowLogin(true)}
        onOpenIntro={handleOpenIntroFromSidebar}
        metasYear={metasYear}
        onMetasYearChange={(y) => { setMetasYear(y); setMetasLayerActive(true) }}
        onOpenMetasMetrics={() => setMetasMetricsOpen(true)}
        openMetasView={openMetasView}
        onMetasViewToggle={handleMetasViewToggle}
        aliado={aliado}
        onOpenAliadoMetrics={handleOpenAliadoMetrics}
        onAliadoViewToggle={handleAliadoViewToggle}
        openAliadoView={openAliadoView}
      />

      <RightPanel
        activeCategory={activeCategory}
        siembraFamilias={siembraFamilias}
        rasFamilias={rasFamilias}
        onClose={handleClose}
        width={rightWidth}
        onWidthChange={(px) => setRightRatio(px / screenW)}
        onSelectFamilia={setSelectedFamiliaId}
        isMobile={isMobile}
        selectedFamiliaId={selectedFamiliaId}
      />

      {/* ── Leyenda del mapa (solo escritorio) ────────────────────── */}
      {!isMobile && (
        <MapLegend
          visibleLayers={visibleLayers}
          leftOffset={effectiveLeftWidth}
          proyecciones={proyecciones}
          activeProyeccionId={activeProyeccionId}
        />
      )}

      {/* ── Botones de zoom del mapa ───────────────────────────────── */}
      <div
        style={{
          position: 'fixed',
          bottom: zoomBtnBottom,
          right: zoomBtnRight,
          zIndex: 900,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          transition: 'right 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <button
          style={zoomBtnStyle}
          onClick={() => leafletMapRef.current?.zoomIn()}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(60,60,60,0.92)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20,20,20,0.82)' }}
          title="Acercar mapa"
        >
          +
        </button>
        <button
          style={zoomBtnStyle}
          onClick={() => leafletMapRef.current?.zoomOut()}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(60,60,60,0.92)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20,20,20,0.82)' }}
          title="Alejar mapa"
        >
          −
        </button>
      </div>

      <LayerLoadingIndicator
        loadingCount={loadingLayers.size}
        totalCount={8}
        isMobile={isMobile}
        leftOffset={effectiveLeftWidth}
      />

      {error && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1100,
            background: 'rgba(127,29,29,0.9)',
            border: '1px solid #b91c1c',
            color: '#fecaca',
            fontSize: 14,
            borderRadius: 12,
            padding: '12px 20px',
            maxWidth: '90vw',
          }}
        >
          {error}
        </div>
      )}

      {/* Panel derecho de Métricas (Metas) */}
      {metasMetricsOpen && (
        <MetasPanel
          selectedYear={metasYear}
          width={rightWidth}
          onClose={handleCloseMetasMetrics}
          isMobile={isMobile}
          hideBancolombia={hideBancolombia}
        />
      )}

      {/* Panel derecho de Métricas del aliado — según el tipo de proyecto */}
      {aliadoMetricsOpen && aliado?.proyecto?.tipo === 'escuela_bosque' && (
        <MetricasAliadoPanel
          key={aliadoMetricsView}
          proyecto={aliado.proyecto}
          displayName={aliado.displayName}
          brandColor={aliado.brandColor}
          brandColorDark={aliado.brandColorDark}
          width={rightWidth}
          onClose={handleCloseAliadoMetrics}
          isMobile={isMobile}
          initialView={aliadoMetricsView}
        />
      )}
      {aliadoMetricsOpen && aliado?.proyecto?.tipo === 'capas' && (
        <MetricasCapasPanel
          proyecto={aliado.proyecto}
          displayName={aliado.displayName}
          brandColor={aliado.brandColor}
          brandColorDark={aliado.brandColorDark}
          width={rightWidth}
          onClose={handleCloseAliadoMetrics}
          isMobile={isMobile}
        />
      )}

      {/* Login como overlay — solo aparece si el usuario hace clic en "Iniciar sesión" */}
      {showLogin && !authUser && (
        <LoginScreen onLogin={handleLogin} onClose={() => setShowLogin(false)} />
      )}

      {/* Intro overlay — animación, slides hub, sub-flows */}
      {introPhase !== 'idle' && (
        <IntroOverlay
          initialPhase={introPhase}
          userName={authUser ?? ''}
          showWelcomeOnReturn={introViaLogin}
          onClose={handleCloseIntro}
          onOpenMetas={handleOpenMetasFromHub}
        />
      )}
    </div>
  )
}
