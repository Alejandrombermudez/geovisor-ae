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
import type { GeovisorLayerData, VisibleLayers } from '@/types/geovisor'

interface Props {
  layerData: GeovisorLayerData
  visibleLayers: VisibleLayers
  selectedFamiliaId: string | null
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

export default function GeovisorMap({ layerData, visibleLayers, selectedFamiliaId }: Props) {
  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        url={ESRI_SATELLITE_URL}
        attribution={ESRI_SATELLITE_ATTRIBUTION}
        maxZoom={19}
      />

      {/* ── Capas de polígonos ─────────────────────────────────────── */}
      {visibleLayers.siembraFincas &&
        layerData.siembraFincas.map((item, i) => (
          <PolygonLayer
            key={`sf-${i}`}
            data={item.fc}
            color={LAYER_COLORS.siembraFincas}
            familia={item.familia}
            haField="ha_restauracion"
          />
        ))}

      {visibleLayers.restauracion &&
        layerData.restauracion.map((item, i) => (
          <PolygonLayer
            key={`re-${i}`}
            data={item.fc}
            color={LAYER_COLORS.restauracion}
            familia={item.familia}
            haField="ha_restauracion"
          />
        ))}

      {visibleLayers.rasFincas &&
        layerData.rasFincas.map((item, i) => (
          <PolygonLayer
            key={`rf-${i}`}
            data={item.fc}
            color={LAYER_COLORS.rasFincas}
            familia={item.familia}
            haField="ha_bosque"
          />
        ))}

      {visibleLayers.conservacion &&
        layerData.conservacion.map((item, i) => (
          <PolygonLayer
            key={`co-${i}`}
            data={item.fc}
            color={LAYER_COLORS.conservacion}
            familia={item.familia}
            haField="ha_bosque"
          />
        ))}

      {/* ── Capas de puntos (árboles) ──────────────────────────────── */}
      {visibleLayers.siembraArboles && (
        <ArbolesLayer
          layers={layerData.siembraArboles}
          color={LAYER_COLORS.siembraArboles}
        />
      )}

      {visibleLayers.rasArboles && (
        <ArbolesLayer
          layers={layerData.rasArboles}
          color={LAYER_COLORS.rasArboles}
        />
      )}

      {/* ── Auto-zoom a todos los límites al cargar ────────────────── */}
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
          cameras={layerData.camarasSiembra}
          color={LAYER_COLORS.camarasSiembra}
        />
      )}

      {visibleLayers.camarasConservacion && (
        <CameraLayer
          cameras={layerData.camarasConservacion}
          color={LAYER_COLORS.camarasConservacion}
        />
      )}
    </MapContainer>
  )
}
