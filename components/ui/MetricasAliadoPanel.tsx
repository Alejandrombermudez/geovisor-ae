'use client'

import type { AliadoProyecto } from '@/lib/aliados'

interface Props {
  proyecto: AliadoProyecto
  displayName: string
  brandColor: string
  brandColorDark: string
  width: number
  onClose: () => void
  isMobile: boolean
}

const AE_COLOR = '#74A884' // Amazonia Emprende (predio completo)

function fmt(n: number, decimals = 0): string {
  return n.toLocaleString('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export default function MetricasAliadoPanel({
  proyecto, displayName, brandColor, brandColorDark, width, onClose, isMobile,
}: Props) {
  const { ficha, predioTotal, aliado } = proyecto

  // Participación del aliado sobre el predio (según árboles estimados)
  const sharePct = predioTotal.arboles > 0
    ? (aliado.arboles / predioTotal.arboles) * 100
    : 0

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

  // ── Fila de la ficha de restauración ──────────────────────────────────────
  const FichaRow = ({ label, value }: { label: string; value: string }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      gap: 14, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <span style={{
        color: 'rgba(255,255,255,0.42)', fontSize: 13,
        textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0,
      }}>{label}</span>
      <span style={{
        color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: 600,
        textAlign: 'right', lineHeight: 1.4,
      }}>{value}</span>
    </div>
  )

  // ── Tarjeta de datos (predio AE / aliado) ─────────────────────────────────
  const DatosCard = ({
    title, color, ha, arbHa, arboles, highlight,
  }: {
    title: string; color: string; ha: number; arbHa: number; arboles: number; highlight: boolean
  }) => (
    <div style={{
      flex: 1, minWidth: 0,
      background: highlight ? `${color}1A` : 'rgba(255,255,255,0.04)',
      border: `1px solid ${highlight ? color + '55' : 'rgba(255,255,255,0.09)'}`,
      borderRadius: 12, padding: '16px 14px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12,
      }}>
        <span style={{ width: 11, height: 11, borderRadius: 3, background: color, flexShrink: 0 }} />
        <span style={{ color: '#fff', fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>{title}</span>
      </div>
      <div style={{ color, fontSize: 34, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' }}>
        {fmt(arboles, arboles % 1 === 0 ? 0 : 1)}
      </div>
      <div style={{
        color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 5,
        textTransform: 'uppercase', letterSpacing: '0.04em',
      }}>
        árboles estimados
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, fontWeight: 700 }}>{fmt(ha, 1)}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>hectáreas</div>
        </div>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, fontWeight: 700 }}>{fmt(arbHa)}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>árb/ha</div>
        </div>
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

        {/* ── Comparación predio AE vs aliado ── */}
        <div style={{
          color: 'rgba(255,255,255,0.4)', fontSize: 14,
          textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12,
        }}>
          Árboles estimados · comparación
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <DatosCard
            title="Total predio AE"
            color={AE_COLOR}
            ha={predioTotal.ha} arbHa={predioTotal.arbPorHa} arboles={predioTotal.arboles}
            highlight={false}
          />
          <DatosCard
            title={displayName}
            color={brandColor}
            ha={aliado.ha} arbHa={aliado.arbPorHa} arboles={aliado.arboles}
            highlight
          />
        </div>

        {/* ── Participación (barra apilada) ── */}
        <div style={{
          padding: '16px', marginBottom: 20,
          background: `${brandColor}0C`, border: `1px solid ${brandColor}25`, borderRadius: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15 }}>
              Participación de {displayName} en el predio
            </span>
            <span style={{ color: brandColor, fontSize: 22, fontWeight: 800 }}>
              {fmt(sharePct, 1)}%
            </span>
          </div>
          <div style={{
            display: 'flex', height: 16, borderRadius: 6, overflow: 'hidden',
            background: 'rgba(255,255,255,0.06)',
          }}>
            <div style={{
              width: `${sharePct}%`,
              background: `linear-gradient(90deg, ${brandColor}, ${brandColorDark})`,
            }} />
            <div style={{ flex: 1, background: `${AE_COLOR}40` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ color: brandColor, fontSize: 13, fontWeight: 700 }}>
              {fmt(aliado.arboles, 1)} árboles · {fmt(aliado.ha, 1)} ha
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
              de {fmt(predioTotal.arboles)} árboles · {fmt(predioTotal.ha, 1)} ha
            </span>
          </div>
        </div>

        {/* ── Ficha de restauración ── */}
        <div style={{
          color: 'rgba(255,255,255,0.4)', fontSize: 14,
          textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4,
        }}>
          Estrategia de restauración
        </div>
        <div style={{ marginBottom: 22 }}>
          <FichaRow label="Cobertura" value={ficha.cobertura} />
          <FichaRow label="Condición" value={ficha.condicion} />
          <FichaRow label="Tipo de restauración" value={ficha.tipoRestauracion} />
          <FichaRow label="Estrategia" value={ficha.estrategia} />
          <FichaRow label="Gremio de especies" value={ficha.gremioEspecies} />
          <FichaRow label="Densidad" value={`${fmt(ficha.arbPorHa)} árb/ha`} />
        </div>

        {/* ── Nota ── */}
        <div style={{
          padding: '12px 14px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
        }}>
          <div style={{
            color: 'rgba(255,255,255,0.4)', fontSize: 14,
            textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6,
          }}>Nota</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.65 }}>
            El predio Escuela Bosque agrupa los polígonos elegibles bajo la Ley 2173.
            {' '}{displayName} financia la restauración de los polígonos resaltados en el mapa
            ({fmt(aliado.ha, 1)} ha), con una densidad de {fmt(ficha.arbPorHa)} árboles por hectárea.
          </div>
        </div>
      </div>
    </div>
  )
}
