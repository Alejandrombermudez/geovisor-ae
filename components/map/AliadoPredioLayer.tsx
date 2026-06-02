'use client'

import { useEffect, useState } from 'react'
import { GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { FeatureCollection, Feature } from 'geojson'
import type { Layer } from 'leaflet'
import { fetchAndParseShapefile } from '@/lib/shapefileUtils'
import type { AliadoProyecto } from '@/lib/aliados'

interface Props {
  proyecto: AliadoProyecto
  brandColor: string
  /** Si true, vuela a los polígonos al cargar. */
  flyTo?: boolean
}

const PREDIO_COLOR = '#E5E7EB' // gris claro — contexto del resto del predio AE

/** Hectáreas legibles a partir de la propiedad `area` del shapefile. */
function fmtHa(area: unknown): string {
  const n = typeof area === 'number' ? area : Number(area)
  if (!isFinite(n)) return '—'
  return n.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function AliadoPredioLayer({ proyecto, brandColor, flyTo = true }: Props) {
  const [predio,  setPredio]  = useState<FeatureCollection | null>(null)
  const [ley2173, setLey2173] = useState<FeatureCollection | null>(null)
  const map = useMap()

  // Carga perezosa de ambos shapefiles (una sola vez por URL)
  useEffect(() => {
    let alive = true
    fetchAndParseShapefile(proyecto.predioZipUrl).then(fc => { if (alive && fc) setPredio(fc) })
    fetchAndParseShapefile(proyecto.ley2173ZipUrl).then(fc => { if (alive && fc) setLey2173(fc) })
    return () => { alive = false }
  }, [proyecto.predioZipUrl, proyecto.ley2173ZipUrl])

  // Vuela al conjunto de polígonos cuando terminan de cargar
  useEffect(() => {
    if (!flyTo || !ley2173) return
    const bounds = L.geoJSON(ley2173).getBounds()
    if (bounds.isValid()) {
      map.flyToBounds(bounds, { padding: [60, 60], maxZoom: 17, duration: 1.4 })
    }
  }, [ley2173, flyTo, map])

  const isAliado = (f: Feature | undefined) =>
    String(f?.properties?.Intervenci ?? '').trim() === proyecto.intervenciValue

  return (
    <>
      {/* Contorno del predio completo (forma del sitio) */}
      {predio && (
        <GeoJSON
          key="aliado-predio"
          data={predio}
          style={{
            color: '#FFFFFF',
            weight: 2,
            opacity: 0.85,
            fillColor: '#FFFFFF',
            fillOpacity: 0.04,
            dashArray: '6 6',
          }}
          interactive={false}
        />
      )}

      {/* Polígonos Ley 2173: resto del predio (contexto) */}
      {ley2173 && (
        <GeoJSON
          key="aliado-ley2173-resto"
          data={ley2173}
          filter={(f) => !isAliado(f)}
          style={{
            color: PREDIO_COLOR,
            weight: 1.2,
            opacity: 0.7,
            fillColor: PREDIO_COLOR,
            fillOpacity: 0.07,
            dashArray: '4 4',
          }}
          onEachFeature={(feature: Feature, layer: Layer) => {
            layer.bindTooltip(
              `<div style="font-family:system-ui;font-size:12px;line-height:1.5">
                <strong>Predio Escuela Bosque</strong><br/>
                <span style="color:#9ca3af">${fmtHa(feature.properties?.area)} ha · resto del predio AE</span>
              </div>`,
              { sticky: true, direction: 'top' },
            )
          }}
        />
      )}

      {/* Polígonos asignados al aliado (resaltados) */}
      {ley2173 && (
        <GeoJSON
          key="aliado-ley2173-aliado"
          data={ley2173}
          filter={(f) => isAliado(f)}
          style={{
            color: brandColor,
            weight: 3,
            opacity: 1,
            fillColor: brandColor,
            fillOpacity: 0.45,
          }}
          onEachFeature={(feature: Feature, layer: Layer) => {
            layer.bindTooltip(
              `<div style="font-family:system-ui;font-size:12px;line-height:1.55">
                <strong style="color:${brandColor}">● ${proyecto.intervenciValue}</strong><br/>
                <span style="color:#e5e7eb">${fmtHa(feature.properties?.area)} ha · restauración activa</span>
              </div>`,
              { sticky: true, direction: 'top' },
            )
            const path = layer as L.Path
            layer.on('mouseover', () => path.setStyle({ fillOpacity: 0.6 }))
            layer.on('mouseout',  () => path.setStyle({ fillOpacity: 0.45 }))
          }}
        />
      )}
    </>
  )
}
