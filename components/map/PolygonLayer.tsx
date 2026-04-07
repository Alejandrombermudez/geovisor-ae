'use client'

import { GeoJSON } from 'react-leaflet'
import type { FeatureCollection } from 'geojson'
import type { SiembraFamilia, RasFamilia } from '@/types/geovisor'
import type { Layer } from 'leaflet'

interface Props {
  data: FeatureCollection
  color: string
  familia: SiembraFamilia | RasFamilia
  haField: 'ha_restauracion' | 'ha_bosque'
}

export default function PolygonLayer({ data, color, familia, haField }: Props) {
  const ha = (familia as any)[haField]

  function onEachFeature(_: GeoJSON.Feature, layer: Layer) {
    layer.bindPopup(`
      <div style="font-family: sans-serif; min-width: 180px;">
        <strong style="font-size: 14px;">${familia.nombre_propietario}</strong>
        <hr style="margin: 6px 0; border-color: #e5e7eb;" />
        <div style="font-size: 13px; line-height: 1.6;">
          <b>Finca:</b> ${familia.nombre_finca}<br/>
          <b>Municipio:</b> ${familia.municipio}<br/>
          <b>Vereda:</b> ${familia.vereda}<br/>
          ${ha != null ? `<b>Hectáreas:</b> ${ha} ha<br/>` : ''}
        </div>
      </div>
    `)
  }

  return (
    <GeoJSON
      // key forces re-render when data changes
      key={JSON.stringify(data).slice(0, 50)}
      data={data}
      style={{
        color,
        weight: 2,
        fillColor: color,
        fillOpacity: 0.25,
        opacity: 0.9,
      }}
      onEachFeature={onEachFeature}
    />
  )
}
