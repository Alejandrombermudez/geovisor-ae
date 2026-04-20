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
  onFamiliaClick?: (familia: SiembraFamilia | RasFamilia) => void
}

export default function PolygonLayer({ data, color, familia, haField, onFamiliaClick }: Props) {
  const ha = (familia as any)[haField]

  function onEachFeature(_: GeoJSON.Feature, layer: Layer) {
    // Tooltip al hover (ligero, no bloquea el clic)
    layer.bindTooltip(
      `<div style="font-family:sans-serif;font-size:12px;line-height:1.5;">
        <strong>${familia.nombre_finca || familia.nombre_propietario}</strong><br/>
        <span style="color:#6b7280">${familia.municipio ?? ''}</span>
      </div>`,
      { sticky: true, direction: 'top', offset: [0, -4] }
    )
    // Clic → notificar al padre
    layer.on('click', () => onFamiliaClick?.(familia))
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
