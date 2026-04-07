'use client'

import { useCallback } from 'react'
import type { ActiveCategory, SiembraFamilia, RasFamilia } from '@/types/geovisor'
import FamilyCard from './FamilyCard'

interface Props {
  activeCategory: ActiveCategory
  siembraFamilias: SiembraFamilia[]
  rasFamilias: RasFamilia[]
  onClose: () => void
  width: number
  onWidthChange: (w: number) => void
  onSelectFamilia: (id: string) => void
}

const CATEGORY_CONFIG = {
  siembra: { title: 'Familias en restauración', color: '#74A884' },
  ras: { title: 'Familias en conservación', color: '#6898B8' },
}

// Límites en % del viewport (se evalúan al arrastrar)
const MIN_RIGHT_RATIO = 0.20   // 20 vw
const MAX_RIGHT_RATIO = 0.80   // 80 vw

export default function RightPanel({
  activeCategory,
  siembraFamilias,
  rasFamilias,
  onClose,
  width,
  onWidthChange,
  onSelectFamilia,
}: Props) {
  const isOpen = activeCategory !== null
  const config = activeCategory ? CATEGORY_CONFIG[activeCategory] : null
  const familias = activeCategory === 'siembra' ? siembraFamilias : rasFamilias

  const startDrag = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const startX = e.clientX
      const startW = width
      const move = (ev: MouseEvent) => {
        const minW = Math.round(window.innerWidth * MIN_RIGHT_RATIO)
        const maxW = Math.round(window.innerWidth * MAX_RIGHT_RATIO)
        const delta = startX - ev.clientX
        const next = Math.min(maxW, Math.max(minW, startW + delta))
        onWidthChange(next)
      }
      const up = () => {
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    },
    [width, onWidthChange],
  )

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100dvh',
        width,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(28px) saturate(160%)',
        WebkitBackdropFilter: 'blur(28px) saturate(160%)',
        borderLeft: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.6)',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Drag handle — borde izquierdo */}
      <div
        onMouseDown={startDrag}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 5,
          height: '100%',
          cursor: 'col-resize',
          zIndex: 10,
          background: 'transparent',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = config ? `${config.color}25` : 'rgba(255,255,255,0.07)')
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      />

      {config && (
        <>
          {/* Accent line at top */}
          <div
            style={{
              height: 2,
              background: `linear-gradient(90deg, ${config.color} 0%, ${config.color}40 60%, transparent 100%)`,
              flexShrink: 0,
            }}
          />

          {/* Header */}
          <div
            style={{
              padding: '18px 20px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              flexShrink: 0,
              background: `linear-gradient(180deg, ${config.color}08 0%, transparent 100%)`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <h2
                  style={{
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 700,
                    margin: '0 0 5px',
                    letterSpacing: '0.005em',
                  }}
                >
                  {config.title}
                </h2>
                {/* Count */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 14, height: 1, background: `${config.color}80` }} />
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, letterSpacing: '0.03em' }}>
                    {familias.length}{' '}
                    {familias.length !== 1 ? 'familias registradas' : 'familia registrada'}
                  </span>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.3)',
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Scrollable list */}
          <div className="geo-panel-scroll" style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
            {familias.length === 0 ? (
              <div
                style={{
                  color: 'rgba(255,255,255,0.2)',
                  fontSize: 13,
                  textAlign: 'center',
                  marginTop: 48,
                  lineHeight: 1.6,
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>🌿</div>
                No hay familias registradas
              </div>
            ) : (
              familias.map((f) => (
                <FamilyCard
                  key={f.id}
                  familia={f}
                  category={activeCategory!}
                  accentColor={config.color}
                  onSelect={() => onSelectFamilia(f.id)}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
