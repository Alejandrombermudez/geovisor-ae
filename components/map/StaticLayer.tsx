'use client'

import { useEffect, useState } from 'react'
import { GeoJSON } from 'react-leaflet'
import type { FeatureCollection } from 'geojson'
import type { Layer } from 'leaflet'
import { fetchAndParseShapefile } from '@/lib/shapefileUtils'
import type { StaticLayerConfig } from '@/lib/constants'

interface Props {
  config: StaticLayerConfig
}

export default function StaticLayer({ config }: Props) {
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    fetchAndParseShapefile(config.shapefile_url)
      .then(fc => { if (fc) setGeojson(fc) })
  }, [config.shapefile_url])

  if (!geojson) return null

  return (
    <GeoJSON
      key={`static-${config.id}`}
      data={geojson}
      style={{
        color:       config.color,
        weight:      2,
        opacity:     0.65,
        fillColor:   config.color,
        fillOpacity: 0.06,
        dashArray:   '5 6',
      }}
      onEachFeature={(_: GeoJSON.Feature, layer: Layer) => {
        layer.bindTooltip(
          `<div style="font-family:sans-serif;font-size:12px;line-height:1.4">
            <strong style="color:${config.color}">${config.nombre}</strong>
          </div>`,
          { sticky: true, direction: 'top', offset: [0, -4] },
        )
      }}
    />
  )
}
