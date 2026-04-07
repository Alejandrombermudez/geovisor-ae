'use client'

import { CircleMarker, Popup } from 'react-leaflet'
import type { CamaraTrampa } from '@/types/geovisor'
import CameraPopup from './CameraPopup'

interface Props {
  cameras: CamaraTrampa[]
  color: string
}

export default function CameraLayer({ cameras, color }: Props) {
  return (
    <>
      {cameras.map((cam) => (
        <CircleMarker
          key={cam.id}
          center={[Number(cam.latitud), Number(cam.longitud)]}
          radius={8}
          pathOptions={{
            color: '#fff',
            weight: 1.5,
            fillColor: color,
            fillOpacity: 0.9,
          }}
        >
          <Popup maxWidth={300}>
            <CameraPopup camera={cam} />
          </Popup>
        </CircleMarker>
      ))}
    </>
  )
}
