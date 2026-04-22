'use client'

import { LAYER_COLORS } from '@/lib/constants'
import type { VisibleLayers } from '@/types/geovisor'

interface Props {
  visibleLayers: VisibleLayers
  leftOffset: number   // sidebar width in px — legend slides with it
}

type Shape = 'square' | 'circle' | 'camera'

interface LegendItem {
  layerKey: keyof VisibleLayers
  label: string
  color: string
  shape: Shape
}

const ITEMS: LegendItem[] = [
  { layerKey: 'siembraFincas',       label: 'Predio siembra',          color: LAYER_COLORS.siembraFincas,       shape: 'square'  },
  { layerKey: 'restauracion',        label: 'Área restauración',       color: LAYER_COLORS.restauracion,        shape: 'square'  },
  { layerKey: 'siembraArboles',      label: 'Árboles / Plántulas',     color: LAYER_COLORS.siembraArboles,      shape: 'circle'  },
  { layerKey: 'rasFincas',           label: 'Predio conservación',     color: LAYER_COLORS.rasFincas,           shape: 'square'  },
  { layerKey: 'conservacion',        label: 'Área conservación',       color: LAYER_COLORS.conservacion,        shape: 'square'  },
  { layerKey: 'rasArboles',          label: 'Árboles',                 color: LAYER_COLORS.rasArboles,          shape: 'circle'  },
  { layerKey: 'camarasSiembra',      label: 'Cámaras — Siembra',       color: LAYER_COLORS.camarasSiembra,      shape: 'camera'  },
  { layerKey: 'camarasConservacion', label: 'Cámaras — Conservación',  color: LAYER_COLORS.camarasConservacion, shape: 'camera'  },
]

function ShapeIcon({ shape, color }: { shape: Shape; color: string }) {
  if (shape === 'circle') {
    return (
      <div style={{
        width: 10, height: 10,
        borderRadius: '50%',
        background: color,
        border: '1.5px solid rgba(255,255,255,0.65)',
        flexShrink: 0,
      }} />
    )
  }
  if (shape === 'camera') {
    return (
      <span style={{ fontSize: 11, lineHeight: 1, flexShrink: 0 }}>📷</span>
    )
  }
  // 'square' — polygon fill preview
  return (
    <div style={{
      width: 13, height: 10,
      background: `${color}44`,
      border: `1.5px solid ${color}`,
      borderRadius: 2,
      flexShrink: 0,
    }} />
  )
}

export default function MapLegend({ visibleLayers, leftOffset }: Props) {
  const visibleItems = ITEMS.filter(item => visibleLayers[item.layerKey])
  if (visibleItems.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 14,
        left: leftOffset + 14,
        zIndex: 850,
        background: 'rgba(0,0,0,0.56)',
        backdropFilter: 'blur(18px) saturate(160%)',
        WebkitBackdropFilter: 'blur(18px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: '9px 13px 10px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        minWidth: 155,
        transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)',
        pointerEvents: 'none',   // no intercepta clics del mapa
      }}
    >
      <div style={{
        color: 'rgba(255,255,255,0.38)',
        fontSize: 9, fontWeight: 700,
        letterSpacing: '0.07em', textTransform: 'uppercase',
        marginBottom: 7,
      }}>
        Leyenda
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {visibleItems.map(({ layerKey, label, color, shape }) => (
          <div key={layerKey} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShapeIcon shape={shape} color={color} />
            <span style={{ color: 'rgba(255,255,255,0.72)', fontSize: 11, lineHeight: 1.2 }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
