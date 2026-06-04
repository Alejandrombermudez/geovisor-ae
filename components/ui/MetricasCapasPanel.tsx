'use client'

import type { ProyectoCapas, AliadoCapa } from '@/lib/aliados'

interface Props {
  proyecto: ProyectoCapas
  displayName: string
  brandColor: string
  brandColorDark: string
  width: number
  onClose: () => void
  isMobile: boolean
}

export default function MetricasCapasPanel({
  proyecto, displayName, brandColor, brandColorDark, width, onClose, isMobile,
}: Props) {
  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed', bottom: 56, left: 0, right: 0,
        height: '72dvh', zIndex: 1002,
        background: 'rgba(8,8,10,0.97)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.09)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflowY: 'auto',
      }
    : {
        position: 'fixed', top: 0, right: 0, width,
        height: '100dvh', zIndex: 1002,
        background: 'rgba(8,8,10,0.94)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '-6px 0 32px rgba(0,0,0,0.55)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
      }

  const CapaSection = ({ capa }: { capa: AliadoCapa }) => (
    <div style={{ marginBottom: 22 }}>
      {/* Encabezado de la capa */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{
          width: 14, height: 14, borderRadius: 4, flexShrink: 0,
          background: capa.dashed ? 'transparent' : capa.color,
          border: `2px solid ${capa.color}`,
        }} />
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>
          {capa.nombre}
        </div>
        {capa.estado && (
          <span style={{
            marginLeft: 'auto', flexShrink: 0,
            fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
            color: capa.color,
            background: `${capa.color}1E`, border: `1px solid ${capa.color}55`,
            borderRadius: 6, padding: '4px 9px',
          }}>
            {capa.estado}
          </span>
        )}
      </div>

      {/* Estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9 }}>
        {capa.stats.map(s => (
          <div key={s.label} style={{
            background: `${capa.color}14`,
            border: `1px solid ${capa.color}3A`,
            borderRadius: 11, padding: '16px 10px', textAlign: 'center',
          }}>
            <div style={{ color: capa.color, fontSize: 28, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' }}>
              {s.value}
            </div>
            <div style={{
              color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 8,
              letterSpacing: '0.02em', lineHeight: 1.3,
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={panelStyle}>
      {/* ── Header ── */}
      <div style={{
        flexShrink: 0, padding: '16px 20px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8,
        background: `linear-gradient(135deg, ${brandColor}22 0%, transparent 70%)`,
      }}>
        <div>
          <div style={{
            color: brandColor, fontSize: 15, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5,
          }}>
            Métricas · {displayName}
          </div>
          <div style={{ color: '#fff', fontSize: 25, fontWeight: 800, lineHeight: 1.2 }}>
            {proyecto.nombre}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, marginTop: 4 }}>
            {proyecto.ubicacion}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.65)', borderRadius: 8, width: 34, height: 34,
            cursor: 'pointer', fontSize: 18, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
        >✕</button>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px 32px' }}>
        <div style={{
          color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.55, marginBottom: 18,
        }}>
          {proyecto.descripcion}
        </div>

        {proyecto.capas.map(capa => (
          <CapaSection key={capa.id} capa={capa} />
        ))}

        <div style={{
          marginTop: 4, padding: '12px 14px',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10, color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6,
        }}>
          Cifras estimadas del análisis territorial. Cada capa se puede ver en el mapa con sus
          predios; pasa el cursor sobre un polígono para ver propietario y área.
        </div>
      </div>
    </div>
  )
}
