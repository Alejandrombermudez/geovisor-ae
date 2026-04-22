'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MAP_CENTER, MAP_ZOOM, ESRI_SATELLITE_URL, ESRI_SATELLITE_ATTRIBUTION, LAYER_COLORS } from '@/lib/constants'
import PolygonLayer from './PolygonLayer'
import ArbolesLayer from './ArbolesLayer'
import CameraLayer from './CameraLayer'
import FitBounds from './FitBounds'
import type { GeovisorLayerData, VisibleLayers, SiembraFamilia, RasFamilia, ActiveCategory, PolygonLayerData, CamaraTrampa } from '@/types/geovisor'

interface Props {
  layerData: GeovisorLayerData
  visibleLayers: VisibleLayers
  selectedFamiliaId: string | null
  onMapInit: (map: L.Map) => void
  onFamiliaClick?: (familia: SiembraFamilia | RasFamilia, category: ActiveCategory) => void
}

/** Registra la instancia del mapa para usarla desde fuera del MapContainer */
function MapInitializer({ onMapInit }: { onMapInit: (map: L.Map) => void }) {
  const map = useMap()
  useEffect(() => { onMapInit(map) }, [map, onMapInit])
  return null
}

function FlyToFamilia({ familiaId, layerData }: { familiaId: string | null; layerData: GeovisorLayerData }) {
  const map = useMap()

  useEffect(() => {
    if (!familiaId) return
    const allFincas = [...layerData.siembraFincas, ...layerData.rasFincas]
    const match = allFincas.find((item) => item.familia.id === familiaId)
    if (!match) return
    const bounds = L.geoJSON(match.fc).getBounds()
    if (bounds.isValid()) {
      map.flyToBounds(bounds, { padding: [60, 60], maxZoom: 16, duration: 1.2 })
    }
  }, [familiaId, layerData, map])

  return null
}

export default function GeovisorMap({ layerData, visibleLayers, selectedFamiliaId, onMapInit, onFamiliaClick }: Props) {
  // When a family is selected, only show its layers; otherwise show everything
  const polyFilter = (item: PolygonLayerData) =>
    !selectedFamiliaId || item.familia.id === selectedFamiliaId

  const camFilter = (cam: CamaraTrampa) =>
    !selectedFamiliaId || cam.familia_id === selectedFamiliaId

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      zoomControl={false}
      maxZoom={19}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        url={ESRI_SATELLITE_URL}
        attribution={ESRI_SATELLITE_ATTRIBUTION}
        maxZoom={19}
      />

      {/* ── Registro del map ref ──────────────────────────────────── */}
      <MapInitializer onMapInit={onMapInit} />

      {/* ── Capas de polígonos ─────────────────────────────────────── */}
      {visibleLayers.siembraFincas &&
        layerData.siembraFincas.filter(polyFilter).map((item) => (
          <PolygonLayer
            key={`sf-${item.familia.id}`}
            data={item.fc}
            color={LAYER_COLORS.siembraFincas}
            familia={item.familia}
            haField="ha_restauracion"
            onFamiliaClick={(f) => onFamiliaClick?.(f, 'siembra')}
          />
        ))}

      {visibleLayers.restauracion &&
        layerData.restauracion.filter(polyFilter).map((item) => (
          <PolygonLayer
            key={`re-${item.familia.id}`}
            data={item.fc}
            color={LAYER_COLORS.restauracion}
            familia={item.familia}
            haField="ha_restauracion"
          />
        ))}

      {visibleLayers.rasFincas &&
        layerData.rasFincas.filter(polyFilter).map((item) => (
          <PolygonLayer
            key={`rf-${item.familia.id}`}
            data={item.fc}
            color={LAYER_COLORS.rasFincas}
            familia={item.familia}
            haField="ha_bosque"
            onFamiliaClick={(f) => onFamiliaClick?.(f, 'ras')}
          />
        ))}

      {visibleLayers.conservacion &&
        layerData.conservacion.filter(polyFilter).map((item) => (
          <PolygonLayer
            key={`co-${item.familia.id}`}
            data={item.fc}
            color={LAYER_COLORS.conservacion}
            familia={item.familia}
            haField="ha_bosque"
          />
        ))}

      {/* ── Capas de puntos (árboles) ──────────────────────────────── */}
      {visibleLayers.siembraArboles && (
        <ArbolesLayer
          layers={layerData.siembraArboles.filter(polyFilter)}
          color={LAYER_COLORS.siembraArboles}
        />
      )}

      {visibleLayers.rasArboles && (
        <ArbolesLayer
          layers={layerData.rasArboles.filter(polyFilter)}
          color={LAYER_COLORS.rasArboles}
        />
      )}

      {/* ── Auto-zoom inicial a todos los datos ───────────────────── */}
      <FitBounds layers={[
        layerData.siembraFincas,
        layerData.restauracion,
        layerData.siembraArboles,
        layerData.rasFincas,
        layerData.conservacion,
        layerData.rasArboles,
      ]} />

      {/* ── Zoom animado a predio seleccionado ────────────────────── */}
      <FlyToFamilia familiaId={selectedFamiliaId} layerData={layerData} />

      {/* ── Cámaras trampa ────────────────────────────────────────── */}
      {visibleLayers.camarasSiembra && (
        <CameraLayer
          cameras={layerData.camarasSiembra.filter(camFilter)}
          color={LAYER_COLORS.camarasSiembra}
        />
      )}

      {visibleLayers.camarasConservacion && (
        <CameraLayer
          cameras={layerData.camarasConservacion.filter(camFilter)}
          color={LAYER_COLORS.camarasConservacion}
        />
      )}
    </MapContainer>
  )
}
