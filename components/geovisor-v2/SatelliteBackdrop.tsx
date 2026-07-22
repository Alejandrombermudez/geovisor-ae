'use client'

import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { ESRI_SATELLITE_URL, ESRI_SATELLITE_ATTRIBUTION } from '@/lib/constants'

const BOUNDARIES_PLACES_OVERLAY =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'

/** Fondo satelital real (Esri) encuadrado en Caquetá y su piedemonte, como telón del mockup.
 *  No lee Supabase ni dibuja capas propias — el arte (zonas/íconos/leyenda) va encima en page.tsx.
 *  className="z-0" es OBLIGATORIO: crea el stacking context que encierra los z-index internos
 *  de Leaflet (panes en 400+); sin él, los tiles taparían los paneles del dashboard. */
export default function SatelliteBackdrop() {
  return (
    <MapContainer
      center={[0.4, -73.9]}
      zoom={7.5}
      zoomSnap={0.5}
      minZoom={5}
      zoomControl={false}
      attributionControl={false}
      className="z-0"
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url={ESRI_SATELLITE_URL} attribution={ESRI_SATELLITE_ATTRIBUTION} maxZoom={19} />
      <TileLayer url={BOUNDARIES_PLACES_OVERLAY} maxZoom={19} maxNativeZoom={16} />
    </MapContainer>
  )
}
