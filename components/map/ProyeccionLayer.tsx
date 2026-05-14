'use client'

import { useEffect, useState } from 'react'
import { GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { FeatureCollection } from 'geojson'
import type { Layer } from 'leaflet'
import { fetchAndParseShapefile } from '@/lib/shapefileUtils'
import type { Proyeccion } from '@/types/geovisor'

interface Props {
  proyeccion: Proyeccion
  /** Si true, es la fase actualmente seleccionada: estilo prominente + flyTo */
  isActive: boolean
}

export default function ProyeccionLayer({ proyeccion, isActive }: Props) {
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null)
  const map = useMap()

  // Carga perezosa del shapefile (una sola vez por URL)
  useEffect(() => {
    if (!proyeccion.shapefile_url) return
    fetchAndParseShapefile(proyeccion.shapefile_url)
      .then(fc => { if (fc) setGeojson(fc) })
  }, [proyeccion.shapefile_url])

  // Zoom animado cuando la fase se activa (o cuando el GeoJSON termina de cargar)
  useEffect(() => {
    if (!geojson || !isActive) return
    const bounds = L.geoJSON(geojson).getBounds()
    if (bounds.isValid()) {
      map.flyToBounds(bounds, { padding: [80, 80], maxZoom: 12, duration: 1.4 })
    }
  }, [geojson, isActive, map])

  if (!geojson) return null

  const fillOpacity = isActive ? 0.42 : 0.07
  const weight      = isActive ? 3.5  : 1.8
  const opacity     = isActive ? 1    : 0.45

  return (
    <>
      {/* Halo de resplandor para la fase activa */}
      {isActive && (
        <GeoJSON
          key={`proy-${proyeccion.id}-glow`}
          data={geojson}
          style={{
            color:       proyeccion.color,
            weight:      14,
            opacity:     0.14,
            fillOpacity: 0,
          }}
        />
      )}

      <GeoJSON
        key={`proy-${proyeccion.id}-${isActive}`}
        data={geojson}
        style={{
          color:       proyeccion.color,
          weight,
          opacity,
          fillColor:   proyeccion.color,
          fillOpacity,
          dashArray:   isActive ? undefined : '10 7',
        }}
        onEachFeature={(_: GeoJSON.Feature, layer: Layer) => {
          layer.bindTooltip(
            `<div style="font-family:sans-serif;font-size:12px;line-height:1.5">
              <strong>${proyeccion.nombre}</strong><br/>
              <span style="color:#9ca3af">${proyeccion.subtitulo ?? ''}</span>
            </div>`,
            { sticky: true, direction: 'top', offset: [0, -4] },
          )
          const path = layer as L.Path
          layer.on('mouseover', () => path.setStyle({ fillOpacity: fillOpacity + 0.1 }))
          layer.on('mouseout',  () => path.setStyle({ fillOpacity }))
        }}
      />
    </>
  )
}
