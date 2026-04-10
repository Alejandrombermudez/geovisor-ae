'use client'

import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import type { PolygonLayerData } from '@/types/geovisor'

interface Props {
  layers: PolygonLayerData[][]
}

/** Auto-fits the map to the bounds of all loaded polygon layers. Runs ONCE when the first non-empty layer arrives, then never again — so subsequent flyTo calls are not cancelled. */
export default function FitBounds({ layers }: Props) {
  const map = useMap()
  const didFit = useRef(false)

  useEffect(() => {
    if (didFit.current) return   // ya se ajustó — no interferir con flyToBounds posteriores

    const allFeatures = layers.flatMap((layer) =>
      layer.flatMap((item) => item.fc.features)
    )
    if (allFeatures.length === 0) return   // sin datos aún, esperar siguiente render

    // Collect all coordinates
    const coords: [number, number][] = []
    for (const f of allFeatures) {
      if (!f.geometry) continue
      if (f.geometry.type === 'Polygon') {
        for (const ring of f.geometry.coordinates) {
          for (const [lng, lat] of ring) coords.push([lat, lng])
        }
      } else if (f.geometry.type === 'MultiPolygon') {
        for (const poly of f.geometry.coordinates)
          for (const ring of poly)
            for (const [lng, lat] of ring) coords.push([lat, lng])
      } else if (f.geometry.type === 'Point') {
        const [lng, lat] = f.geometry.coordinates
        coords.push([lat, lng])
      }
    }
    if (coords.length === 0) return

    const lats = coords.map(([lat]) => lat)
    const lngs = coords.map(([, lng]) => lng)
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ]

    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
    didFit.current = true   // marcar permanentemente — nunca volver a ajustar
  }, [layers, map])

  return null
}
