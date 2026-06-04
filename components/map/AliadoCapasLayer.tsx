'use client'

import { useEffect, useState } from 'react'
import { GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { FeatureCollection, Feature } from 'geojson'
import type { Layer } from 'leaflet'
import { fetchAndParseShapefile } from '@/lib/shapefileUtils'
import type { ProyectoCapas } from '@/lib/aliados'

interface Props {
  proyecto: ProyectoCapas
  /** Vuela al conjunto de capas al cargar. */
  flyTo?: boolean
}

function fmtHa(v: unknown): string {
  const n = typeof v === 'number' ? v : Number(v)
  if (!isFinite(n)) return '—'
  return n.toLocaleString('es-CO', { maximumFractionDigits: 1 })
}

export default function AliadoCapasLayer({ proyecto, flyTo = true }: Props) {
  const map = useMap()
  const [fcs, setFcs] = useState<Record<string, FeatureCollection>>({})

  // Carga todos los shapefiles de las capas (una sola vez)
  useEffect(() => {
    let alive = true
    Promise.all(
      proyecto.capas.map(async c => [c.id, await fetchAndParseShapefile(c.zipUrl)] as const),
    ).then(pairs => {
      if (!alive) return
      const loaded: Record<string, FeatureCollection> = {}
      for (const [id, fc] of pairs) if (fc) loaded[id] = fc
      setFcs(loaded)
    })
    return () => { alive = false }
  }, [proyecto])

  // Vuela al conjunto combinado una vez que cargan las capas
  useEffect(() => {
    if (!flyTo) return
    const ids = proyecto.capas.map(c => c.id).filter(id => fcs[id])
    if (ids.length === 0) return
    const bounds = L.latLngBounds([])
    for (const id of ids) bounds.extend(L.geoJSON(fcs[id]).getBounds())
    if (bounds.isValid()) {
      map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 14, duration: 1.3 })
    }
  }, [fcs, flyTo, proyecto, map])

  return (
    <>
      {proyecto.capas.map(capa => {
        const fc = fcs[capa.id]
        if (!fc) return null
        const baseFill = capa.dashed ? 0.12 : 0.3
        return (
          <GeoJSON
            key={capa.id}
            data={fc}
            style={{
              color: capa.color,
              weight: capa.dashed ? 1.6 : 2,
              opacity: 1,
              fillColor: capa.color,
              fillOpacity: baseFill,
              dashArray: capa.dashed ? '5 5' : undefined,
            }}
            onEachFeature={(feature: Feature, layer: Layer) => {
              const p = feature.properties || {}
              const nombre = capa.nombreField ? String(p[capa.nombreField] ?? '').trim() : ''
              const area = capa.areaField ? fmtHa(p[capa.areaField]) : null
              layer.bindTooltip(
                `<div style="font-family:system-ui;font-size:12px;line-height:1.55">
                  <strong style="color:${capa.color}">${capa.nombre}</strong><br/>
                  ${nombre ? `<span style="color:#e5e7eb">${nombre}</span><br/>` : ''}
                  ${area ? `<span style="color:#9ca3af">${area} ha</span>` : ''}
                </div>`,
                { sticky: true, direction: 'top' },
              )
              const path = layer as L.Path
              layer.on('mouseover', () => path.setStyle({ fillOpacity: baseFill + 0.18 }))
              layer.on('mouseout',  () => path.setStyle({ fillOpacity: baseFill }))
            }}
          />
        )
      })}
    </>
  )
}
