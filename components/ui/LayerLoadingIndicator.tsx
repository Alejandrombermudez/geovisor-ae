'use client'

import { useState, useEffect } from 'react'

interface Props {
  loadingCount: number   // number of layers still loading
  totalCount: number     // total layers
  isMobile: boolean
  leftOffset: number     // px — to avoid overlapping sidebar
}

export default function LayerLoadingIndicator({ loadingCount, totalCount, isMobile, leftOffset }: Props) {
  const done = totalCount - loadingCount
  const pct  = Math.round((done / totalCount) * 100)
  const isComplete = loadingCount === 0

  // Keep visible briefly after completion, then unmount
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    if (isComplete) {
      const t = setTimeout(() => setVisible(false), 800)
      return () => clearTimeout(t)
    } else {
      setVisible(true)
    }
  }, [isComplete])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: isMobile ? 72 + 12 : 20,
        left: isMobile ? 16 : leftOffset + 16,
        zIndex: 950,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'rgba(10,10,10,0.82)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: '7px 14px 7px 10px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        transition: 'opacity 0.6s ease',
        opacity: isComplete ? 0 : 1,
        pointerEvents: 'none',
      }}
    >
      {/* Spinner / checkmark */}
      {isComplete ? (
        <span style={{ fontSize: 14, color: '#4ade80', lineHeight: 1 }}>✓</span>
      ) : (
        <span
          style={{
            display: 'block',
            width: 14,
            height: 14,
            border: '2px solid rgba(255,255,255,0.15)',
            borderTopColor: '#4ade80',
            borderRadius: '50%',
            animation: 'geo-spin 0.75s linear infinite',
            flexShrink: 0,
          }}
        />
      )}

      {/* Progress bar track */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, lineHeight: 1, whiteSpace: 'nowrap' }}>
          {isComplete ? 'Capas cargadas' : `Cargando capas… ${done}/${totalCount}`}
        </span>
        <div style={{ width: 80, height: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 1, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: '#4ade80',
              borderRadius: 1,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>
    </div>
  )
}
