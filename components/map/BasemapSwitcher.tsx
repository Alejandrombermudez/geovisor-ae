'use client'

import { useEffect, useRef, useState } from 'react'
import { BASEMAPS } from '@/lib/constants'

interface Props {
  /** id del basemap activo */
  value: string
  onChange: (id: string) => void
  isMobile: boolean
  /** Offset desde la derecha (px) — se alinea con los botones de zoom */
  right: number
  /** Offset desde abajo (px) */
  bottom: number
  /** Lado del botón cuadrado colapsado (px) */
  size: number
}

const PANEL_BG = 'rgba(20,20,20,0.86)'
const PANEL_BG_HOVER = 'rgba(60,60,60,0.92)'
const BORDER = '1px solid rgba(255,255,255,0.15)'

/** Ícono de "capas" (Feather layers) */
function LayersIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}

export default function BasemapSwitcher({ value, onChange, isMobile, right, bottom, size }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const active = BASEMAPS.find((b) => b.id === value) ?? BASEMAPS[0]

  // Cerrar al hacer click fuera del control
  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  return (
    <div
      ref={rootRef}
      data-tour="basemap"
      style={{
        position: 'fixed',
        right,
        bottom,
        zIndex: 900,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 6,
        transition: 'right 0.3s cubic-bezier(0.4,0,0.2,1)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* ── Lista de opciones (se despliega hacia arriba) ─────────────── */}
      {open && (
        <div
          style={{
            background: PANEL_BG,
            border: BORDER,
            borderRadius: 10,
            padding: 4,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            minWidth: 180,
          }}
        >
          {BASEMAPS.map((b) => {
            const selected = b.id === value
            return (
              <button
                key={b.id}
                data-basemap={b.id}
                onClick={() => { onChange(b.id); setOpen(false) }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  textAlign: 'left',
                  padding: '9px 10px',
                  background: selected ? 'rgba(116,168,132,0.22)' : 'transparent',
                  border: 'none',
                  borderRadius: 7,
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: selected ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent' }}
              >
                <span
                  style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: selected ? '#74A884' : 'transparent',
                    border: selected ? 'none' : '1.5px solid rgba(255,255,255,0.4)',
                  }}
                />
                {b.label}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Botón colapsado ──────────────────────────────────────────── */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="Cambiar mapa base"
        aria-label="Cambiar mapa base"
        aria-expanded={open}
        style={{
          height: size,
          minWidth: size,
          padding: isMobile ? 0 : '0 12px 0 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          background: open ? PANEL_BG_HOVER : PANEL_BG,
          border: BORDER,
          color: '#fff',
          borderRadius: 8,
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          transition: 'background 0.15s ease',
          userSelect: 'none',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = PANEL_BG_HOVER }}
        onMouseLeave={(e) => { e.currentTarget.style.background = open ? PANEL_BG_HOVER : PANEL_BG }}
      >
        <LayersIcon size={isMobile ? 20 : 17} />
        {!isMobile && (
          <span style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap' }}>
            {active.short}
          </span>
        )}
      </button>
    </div>
  )
}
