'use client'

import type { CamaraTrampa } from '@/types/geovisor'

interface Props {
  camera: CamaraTrampa
}

export default function CameraPopup({ camera }: Props) {
  const fotos = camera.fotos_camara ?? []

  return (
    <div style={{ fontFamily: 'sans-serif', minWidth: '200px' }}>
      <strong style={{ fontSize: '14px' }}>📷 {camera.nombre}</strong>
      <hr style={{ margin: '6px 0', borderColor: '#e5e7eb' }} />
      <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
        {camera.nombre_propietario && (
          <div><b>Propietario:</b> {camera.nombre_propietario}</div>
        )}
        {camera.nombre_finca && (
          <div><b>Finca:</b> {camera.nombre_finca}</div>
        )}
      </div>

      {fotos.length > 0 && (
        <>
          <hr style={{ margin: '8px 0', borderColor: '#e5e7eb' }} />
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
            {fotos.length} foto{fotos.length !== 1 ? 's' : ''}
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {fotos.slice(0, 6).map((foto) => (
              <a key={foto.id} href={foto.url} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={foto.url}
                  alt="Foto cámara trampa"
                  width={80}
                  height={80}
                  loading="lazy"
                  style={{
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    cursor: 'pointer',                    
                  }}
                />
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
