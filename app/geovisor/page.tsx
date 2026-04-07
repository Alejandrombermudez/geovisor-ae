'use client'

import { useMemo, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useGeovisorData } from '@/hooks/useGeovisorData'
import LeftSidebar from '@/components/ui/LeftSidebar'
import RightPanel from '@/components/ui/RightPanel'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
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

// Ratios de pantalla — se mantienen al redimensionar
const LEFT_RATIO  = 0.07
const RIGHT_RATIO = 0.35

export default function GeovisorPage() {
  const { data, siembraFamilias, rasFamilias, loading: dataLoading, loadingLayers, error } = useGeovisorData()
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>(null)
  const [selectedFamiliaId, setSelectedFamiliaId] = useState<string | null>(null)

  const [leftRatio,  setLeftRatio]  = useState(LEFT_RATIO)
  const [rightRatio, setRightRatio] = useState(RIGHT_RATIO)
  const [screenW,    setScreenW]    = useState(0)

  useEffect(() => {
    setScreenW(window.innerWidth)
    function onResize() { setScreenW(window.innerWidth) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const leftWidth  = screenW > 0 ? Math.round(screenW * leftRatio)  : 0
  const rightWidth = screenW > 0 ? Math.round(screenW * rightRatio) : 0

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

  return (
    <div style={{ height: '100dvh', width: '100vw', position: 'relative', overflow: 'hidden' }}>
      <GeovisorMap layerData={data} visibleLayers={visibleLayers} selectedFamiliaId={selectedFamiliaId} />

      <LeftSidebar
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        width={leftWidth}
        onWidthChange={(px) => setLeftRatio(px / screenW)}
      />

      <RightPanel
        activeCategory={activeCategory}
        siembraFamilias={siembraFamilias}
        rasFamilias={rasFamilias}
        onClose={() => setActiveCategory(null)}
        width={rightWidth}
        onWidthChange={(px) => setRightRatio(px / screenW)}
        onSelectFamilia={setSelectedFamiliaId}
      />

      {dataLoading && loadingLayers.size === 8 && (
        <LoadingOverlay message="Cargando datos del geovisor..." />
      )}

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
