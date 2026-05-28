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
  /** En modo Metas solo renderizar la proyección activa (no Fase II ni III) */
  metasMode?: boolean
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

// GeoJSON cacheado globalmente para no re-fetchear en cada cambio de año
let _veredasCache: VeredaFeature[] | null = null

// Paleta de colores por año — visualmente distintos, legibles sobre satélite
const YEAR_COLORS: Record<number, { stroke: string; fill: string }> = {
  2026: { stroke: '#F59E0B', fill: '#FCD34D' },  // Amber
  2027: { stroke: '#10B981', fill: '#6EE7B7' },  // Emerald
  2028: { stroke: '#60A5FA', fill: '#93C5FD' },  // Blue
  2029: { stroke: '#C084FC', fill: '#DDD6FE' },  // Purple
  2030: { stroke: '#F472B6', fill: '#FBCFE8' },  // Pink
  2031: { stroke: '#FB923C', fill: '#FDBA74' },  // Orange
  2032: { stroke: '#34D399', fill: '#6EE7B7' },  // Teal
}

function renderVeredasLayer(
  features: VeredaFeature[],
  year: number,
  layerRef: { current: L.GeoJSON | null },
  layerGroup: L.LayerGroup,
  map: L.Map,
) {
  // Limpia capa anterior
  if (layerRef.current) {
    layerGroup.removeLayer(layerRef.current)
    layerRef.current = null
  }

  const filtered = features.filter(
    f => f.properties.anio != null && f.properties.anio <= year,
  )

  const geo = L.geoJSON(
    { type: 'FeatureCollection', features: filtered } as GeoJSON.FeatureCollection,
    {
      style: (feature) => {
        const anio = (feature as VeredaFeature).properties.anio ?? year
        const isCurrentYear = anio === year
        const palette = YEAR_COLORS[anio] ?? { stroke: '#FAB758', fill: '#FAB758' }
        return {
          color:       palette.stroke,
          fillColor:   palette.fill,
          weight:      isCurrentYear ? 2.5 : 1.5,
          opacity:     isCurrentYear ? 0.92 : 0.6,
          fillOpacity: isCurrentYear ? 0.32 : 0.12,
        }
      },
      onEachFeature: (feature, lyr) => {
        const p      = (feature as VeredaFeature).properties
        const area   = p.area_ha != null ? p.area_ha.toLocaleString('es-CO', { maximumFractionDigits: 0 }) : '—'
        const pal    = YEAR_COLORS[p.anio ?? 0] ?? { stroke: '#FAB758' }
        lyr.bindTooltip(
          `<div style="font-family:system-ui;font-size:12px;line-height:1.6">
            <strong style="font-size:13px">${p.nombre_ver}</strong><br/>
            ${p.nomb_mpio} · ${area} ha<br/>
            <span style="color:#74A884;font-weight:700">AE ${p.meta_ae.toLocaleString('es-CO')} ha</span>
            &nbsp;·&nbsp;
            <span style="color:#6898B8;font-weight:700">FB ${p.meta_fb.toLocaleString('es-CO')} ha</span><br/>
            <span style="color:${pal.stroke};font-weight:600;font-size:10px">● Intervención ${p.anio}</span>
          </div>`,
          { sticky: true },
        )
      },
    },
  )

  geo.addTo(layerGroup)
  layerRef.current = geo

  // Fly-to veredas del año actual (las nuevas)
  const current = filtered.filter(f => f.properties.anio === year)
  if (current.length > 0) {
    const bounds = L.geoJSON({ type: 'FeatureCollection', features: current } as GeoJSON.FeatureCollection).getBounds()
    if (bounds.isValid()) {
      map.flyToBounds(bounds, { padding: [80, 80], maxZoom: 12, duration: 1.0 })
    }
  }
}

function MetasVeredasLayer({ year }: { year: number }) {
  const map    = useMap()
  const lgRef  = useState(() => L.layerGroup())[0]   // estable durante toda la vida del componente
  const geoRef = { current: null as L.GeoJSON | null }

  // Montar / desmontar el layer group UNA SOLA VEZ
  useEffect(() => {
    lgRef.addTo(map)
    return () => { lgRef.clearLayers(); lgRef.remove() }
  }, [map, lgRef])

  // Actualizar la capa cuando cambia el año — nunca refetchea si ya tenemos el GeoJSON
  useEffect(() => {
    let alive = true
    if (_veredasCache) {
      renderVeredasLayer(_veredasCache, year, geoRef, lgRef, map)
      return
    }
    fetch('/metas/veredas.geojson')
      .then(r => r.json())
      .then((geojson: { features: VeredaFeature[] }) => {
        if (!alive) return
        _veredasCache = geojson.features
        renderVeredasLayer(_veredasCache, year, geoRef, lgRef, map)
      })
      .catch(e => console.warn('[MetasVeredasLayer]', e))
    return () => { alive = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year])

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

export default function GeovisorMap({ layerData, visibleLayers, selectedFamiliaId, onMapInit, onFamiliaClick, proyecciones = [], activeProyeccionId = null, metasYear = null, metasMode = false }: Props) {
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

      {/* ── Proyecciones / fases geográficas ─────────────────────────── */}
      {activeProyeccionId && proyecciones
        // En modo Metas solo mostrar la proyección activa (Fase I); en Conectividad mostrar todas
        .filter(p => !metasMode || p.id === activeProyeccionId)
        .map((proy) => (
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
