'use client'

import { GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import type { PolygonLayerData, SiembraFamilia, RasFamilia } from '@/types/geovisor'

interface Props {
  layers: PolygonLayerData[]
  color: string
}

export default function ArbolesLayer({ layers, color }: Props) {
  if (layers.length === 0) return null

  return (
    <>
      {layers.map((item, i) => {
        const f = item.familia as SiembraFamilia & RasFamilia
        return (
          <GeoJSON
            key={`arboles-${f.id ?? i}`}
            data={item.fc}
            pointToLayer={(_, latlng) =>
              L.circleMarker(latlng, {
                radius: 5,
                fillColor: color,
                color: '#fff',
                weight: 1.5,
                fillOpacity: 0.92,
              })
            }
            onEachFeature={(_, layer) => {
              layer.bindPopup(
                `<div style="font-family:system-ui;font-size:13px;line-height:1.5">
                  <b>${f.nombre_propietario || '—'}</b><br/>
                  ${f.nombre_finca ? `<span style="color:#6b7280">${f.nombre_finca}</span><br/>` : ''}
                  🌳 Árbol registrado
                </div>`
              )
            }}
          />
        )
      })}
    </>
  )
}
