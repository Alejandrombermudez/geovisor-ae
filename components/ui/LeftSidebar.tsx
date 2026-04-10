'use client'

import { useState, useCallback } from 'react'
import type { ActiveCategory } from '@/types/geovisor'

interface Props {
  activeCategory: ActiveCategory
  onSelectCategory: (cat: ActiveCategory) => void
  width: number
  onWidthChange: (w: number) => void
  isMobile: boolean
}

const ITEMS: { key: 'siembra' | 'ras'; label: string; icon: string; color: string }[] = [
  { key: 'siembra', label: 'Restauración', icon: '🌱', color: '#74A884' },
  { key: 'ras', label: 'Conservación', icon: '🌿', color: '#6898B8' },
]

const MIN_W_RATIO = 0.04
const MAX_W_RATIO = 0.18

export default function LeftSidebar({ activeCategory, onSelectCategory, width, onWidthChange, isMobile }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)

  const startDrag = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const startX = e.clientX
      const startW = width
      const move = (ev: MouseEvent) => {
        const minW = Math.round(window.innerWidth * MIN_W_RATIO)
        const maxW = Math.round(window.innerWidth * MAX_W_RATIO)
        const next = Math.min(maxW, Math.max(minW, startW + ev.clientX - startX))
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

  // ── Móvil: barra de navegación inferior ──────────────────────────
  if (isMobile) {
    return (
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 56,
          zIndex: 1001,
          background: 'rgba(8,8,10,0.94)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderTop: '1px solid rgba(255,255,255,0.09)',
          display: 'flex',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {ITEMS.map(({ key, label, icon, color }) => {
          const isActive = activeCategory === key
          return (
            <button
              key={key}
              onClick={() => onSelectCategory(isActive ? null : key)}
              style={{
                flex: 1,
                height: '100%',
                minHeight: 56,
                background: isActive ? `${color}10` : 'transparent',
                border: 'none',
                borderTop: isActive ? `2px solid ${color}` : '2px solid transparent',
                color: isActive ? color : 'rgba(255,255,255,0.38)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                padding: '6px 0',
                transition: 'all 0.18s ease',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span style={{ fontSize: 22, lineHeight: 1, filter: isActive ? `drop-shadow(0 0 5px ${color})` : 'none' }}>
                {icon}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>
                {label}
              </span>
            </button>
          )
        })}
      </nav>
    )
  }

  // ── Escritorio: sidebar lateral izquierdo ─────────────────────────
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100dvh',
        width,
        zIndex: 1001,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 20,
        gap: 6,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Logo */}
      <div
        style={{
          color: '#fff',
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 18,
          background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.55) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        GEO
      </div>

      <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 10 }} />

      {ITEMS.map(({ key, label, icon, color }) => {
        const isActive = activeCategory === key
        const isHovered = hovered === key
        return (
          <button
            key={key}
            onClick={() => onSelectCategory(isActive ? null : key)}
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: isActive
                ? `radial-gradient(ellipse at left, ${color}14 0%, transparent 70%)`
                : isHovered
                  ? 'rgba(255,255,255,0.06)'
                  : 'transparent',
              border: 'none',
              borderLeft: isActive ? `3px solid ${color}` : '3px solid transparent',
              boxShadow: isActive ? `inset 0 0 16px ${color}10, 0 0 10px ${color}25` : 'none',
              color: isActive ? color : 'rgba(255,255,255,0.38)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              width: '100%',
              padding: '13px 4px',
              transition: 'all 0.18s ease',
            }}
          >
            <span style={{ fontSize: 22, filter: isActive ? `drop-shadow(0 0 6px ${color})` : 'none', transition: 'filter 0.18s ease' }}>
              {icon}
            </span>
            <span style={{ fontSize: 9, fontWeight: 700, textAlign: 'center', lineHeight: 1.2, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {label}
            </span>
          </button>
        )
      })}

      {/* Drag handle */}
      <div
        onMouseDown={startDrag}
        style={{ position: 'absolute', top: 0, right: 0, width: 4, height: '100%', cursor: 'col-resize', background: 'transparent', zIndex: 2, transition: 'background 0.15s ease' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      />
    </div>
  )
}
