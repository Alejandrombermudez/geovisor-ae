'use client'

import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type L from 'leaflet'
import { useGeovisorData } from '@/hooks/useGeovisorData'
import LeftSidebar from '@/components/ui/LeftSidebar'
import RightPanel from '@/components/ui/RightPanel'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import LayerLoadingIndicator from '@/components/ui/LayerLoadingIndicator'
import type { ActiveCategory, VisibleLayers } from '@/types/geovisor'

const GeovisorMap = dynamic(
  () => import('@/components/map/GeovisorMap'),
  {
    ssr: false,
    loading: () => <LoadingOverlay message="Cargando mapa..." />,
  }
)

const ALL_VISIBLE: VisibleLayers = {
  siembraFincas: true,
  restauracion: true,
  siembraArboles: true,
  rasFincas: true,
  conservacion: true,
  rasArboles: true,
  camarasSiembra: true,
  camarasConservacion: true,
}

const LEFT_RATIO  = 0.07
const RIGHT_RATIO = 0.35

export default function GeovisorPage() {
  const { data, siembraFamilias, rasFamilias, loadingLayers, error } = useGeovisorData()
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>(null)
  const [selectedFamiliaId, setSelectedFamiliaId] = useState<string | null>(null)

  const [leftRatio,  setLeftRatio]  = useState(LEFT_RATIO)
  const [rightRatio, setRightRatio] = useState(RIGHT_RATIO)
  const [screenW,    setScreenW]    = useState(0)

  const leafletMapRef = useRef<L.Map | null>(null)
  const onMapInit = useCallback((map: L.Map) => { leafletMapRef.current = map }, [])

  useEffect(() => {
    setScreenW(window.innerWidth)
    function onResize() { setScreenW(window.innerWidth) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const isMobile = screenW > 0 && screenW < 640

  const leftWidth  = isMobile ? 0 : (screenW > 0 ? Math.round(screenW * leftRatio)  : 0)
  const rightWidth = isMobile ? screenW : (screenW > 0 ? Math.round(screenW * rightRatio) : 0)

  const visibleLayers = useMemo<VisibleLayers>(() => {
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
    return ALL_VISIBLE
  }, [activeCategory])

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
      />

      <LeftSidebar
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        width={leftWidth}
        onWidthChange={(px) => setLeftRatio(px / screenW)}
        isMobile={isMobile}
      />

      <RightPanel
        activeCategory={activeCategory}
        siembraFamilias={siembraFamilias}
        rasFamilias={rasFamilias}
        onClose={() => setActiveCategory(null)}
        width={rightWidth}
        onWidthChange={(px) => setRightRatio(px / screenW)}
        onSelectFamilia={setSelectedFamiliaId}
        isMobile={isMobile}
      />

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
        leftOffset={leftWidth}
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
    </div>
  )
}
