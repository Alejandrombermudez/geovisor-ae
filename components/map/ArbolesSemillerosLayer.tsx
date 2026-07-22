'use client'

import { CircleMarker, Popup } from 'react-leaflet'
import type { RasArbolSemillero } from '@/types/geovisor'

interface Props {
  arboles: RasArbolSemillero[]
  color: string
}

/**
 * Capa de árboles semilleros desde ras.arboles_semilleros (datos reales por árbol).
 * Cada punto muestra código, especie, familia, DAP/altura y foto.
 */
export default function ArbolesSemillerosLayer({ arboles, color }: Props) {
  return (
    <>
      {arboles.map((a) => (
        <CircleMarker
          key={a.id}
          center={[Number(a.latitud), Number(a.longitud)]}
          radius={5}
          pathOptions={{ color: '#fff', weight: 1.5, fillColor: color, fillOpacity: 0.92 }}
        >
          <Popup maxWidth={260}>
            <div style={{ fontFamily: 'system-ui', fontSize: 13, lineHeight: 1.5 }}>
              <b>#{a.codigo} · {a.nombre_comun || '—'}</b><br />
              <i style={{ color: '#6b7280' }}>{a.nombre_cientifico || 'Sin determinar'}</i><br />
              {a.familia_botanica && <>Familia: {a.familia_botanica}<br /></>}
              {a.predio && <span style={{ color: '#6b7280' }}>{a.predio}<br /></span>}
              {(a.dap_cm != null || a.altura_total_m != null) && (
                <>
                  {a.dap_cm != null ? `DAP ${a.dap_cm} cm` : ''}
                  {a.dap_cm != null && a.altura_total_m != null ? ' · ' : ''}
                  {a.altura_total_m != null ? `Alt ${a.altura_total_m} m` : ''}
                  <br />
                </>
              )}
              {a.foto_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.foto_url}
                  alt={`Árbol ${a.codigo}`}
                  style={{ width: '100%', maxWidth: 200, borderRadius: 6, marginTop: 6 }}
                />
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  )
}
