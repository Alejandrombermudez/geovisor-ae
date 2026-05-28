'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MAP_CENTER, MAP_ZOOM, ESRI_SATELLITE_URL, ESRI_SATELLITE_ATTRIBUTION, LAYER_COLORS } from '@/lib/constants'
import PolygonLayer from './PolygonLayer'
import ArbolesLayer from './ArbolesLayer'
import CameraLayer from './CameraLayer'
import FitBounds from './FitBounds'
import ProyeccionLayer from './ProyeccionLayer'
import StaticLayer from './StaticLayer'
import { STATIC_LAYERS } from '@/lib/constants'
import type { GeovisorLayerData, VisibleLayers, SiembraFamilia, RasFamilia, ActiveCategory, PolygonLayerData, CamaraTrampa, Proyeccion } from '@/types/geovisor'

interface Props {
  layerData: GeovisorLayerData
  visibleLayers: VisibleLayers
  selectedFamiliaId: string | null
  onMapInit: (map: L.Map) => void
  onFamiliaClick?: (familia: SiembraFamilia | RasFamilia, category: ActiveCategory) => void
  proyecciones?: Proyeccion[]
  activeProyeccionId?: string | null
  /** Año seleccionado en la vista Metas. null = capa oculta */
  metasYear?: number | null
}

// ── Capa de veredas Metas (GeoJSON filtrado por año acumulado) ───────────────

interface VeredaFeature {
  type: 'Feature'
  geometry: { type: string; coordinates: unknown[] }
  properties: {
    nombre_ver: string
    nomb_mpio: string
    area_ha: number | null
    meta_ae: number
    meta_fb: number
    anio: number | null
  }
}

function MetasVeredasLayer({ year }: { year: number }) {
  const map = useMap()
  const [layerGroup] = useState(() => L.layerGroup())

  useEffect(() => {
    layerGroup.addTo(map)
    return () => { layerGroup.remove() }
  }, [map, layerGroup])

  useEffect(() => {
    fetch('/metas/veredas.geojson')
      .then(r => r.json())
      .then((geojson: { features: VeredaFeature[] }) => {
        layerGroup.clearLayers()
        const filtered = geojson.features.filter(
          f => f.properties.anio != null && f.properties.anio <= year,
        )
        const geo = L.geoJSON(
          { type: 'FeatureCollection', features: filtered } as GeoJSON.FeatureCollection,
          {
            style: (feature) => {
              const anio = (feature as VeredaFeature).properties.anio ?? year
              const isCurrentYear = anio === year
              return {
                color:       '#FAB758',
                fillColor:   '#FAB758',
                weight:      isCurrentYear ? 2.5 : 1.5,
                opacity:     isCurrentYear ? 0.9 : 0.55,
                fillOpacity: isCurrentYear ? 0.22 : 0.10,
              }
            },
            onEachFeature: (feature, lyr) => {
              const p = (feature as VeredaFeature).properties
              lyr.bindTooltip(
                `<div style="font-family:system-ui;font-size:12px;line-height:1.5">
                  <strong>${p.nombre_ver}</strong><br/>
                  ${p.nomb_mpio}<br/>
                  Área: ${p.area_ha != null ? p.area_ha.toLocaleString('es-CO', { maximumFractionDigits: 0 }) : '—'} ha<br/>
                  <span style="color:#FAB758">AE: ${p.meta_ae} ha · FB: ${p.meta_fb} ha</span><br/>
                  Año: ${p.anio}
                </div>`,
                { sticky: true, className: 'leaflet-tooltip-metas' },
              )
            },
          },
        )
        geo.addTo(layerGroup)
        // Hacer zoom a las veredas del año actual
        const current = geojson.features.filter(f => f.properties.anio === year)
        if (current.length > 0) {
          const curGeo = L.geoJSON({ type: 'FeatureCollection', features: current } as GeoJSON.FeatureCollection)
          const bounds = curGeo.getBounds()
          if (bounds.isValid()) {
            map.flyToBounds(bounds, { padding: [80, 80], maxZoom: 12, duration: 1.0 })
          }
        }
      })
      .catch(e => console.warn('[MetasVeredasLayer]', e))
  }, [year, layerGroup, map])

  return null
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

export default function GeovisorMap({ layerData, visibleLayers, selectedFamiliaId, onMapInit, onFamiliaClick, proyecciones = [], activeProyeccionId = null, metasYear = null }: Props) {
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

      {/* ── Capa de veredas Metas (Fase 1, filtrada por año) ────────── */}
      {metasYear != null && <MetasVeredasLayer year={metasYear} />}

      {/* ── Capas estáticas de referencia (Cordillera + Chiribiquete) ─ */}
      {activeProyeccionId && STATIC_LAYERS.map(cfg => (
        <StaticLayer key={cfg.id} config={cfg} />
      ))}

      {/* ── Proyecciones / fases geográficas — solo en modo Conectividad ── */}
      {activeProyeccionId && proyecciones.map((proy) => (
        <ProyeccionLayer
          key={proy.id}
          proyeccion={proy}
          isActive={proy.id === activeProyeccionId}
        />
      ))}

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
