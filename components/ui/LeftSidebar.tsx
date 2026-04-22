'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import type { ActiveCategory } from '@/types/geovisor'

interface Props {
  activeCategory: ActiveCategory
  onSelectCategory: (cat: ActiveCategory) => void
  onWidthChange: (w: number) => void
  isMobile: boolean
}

const ITEMS: { key: 'siembra' | 'ras'; label: string; icon: string; color: string }[] = [
  { key: 'siembra', label: 'Restauración', icon: '🌱', color: '#74A884' },
  { key: 'ras',     label: 'Conservación', icon: '🌿', color: '#6898B8' },
]

const SOCIAL_LINKS = [
  { icon: '📷', label: 'Instagram', url: 'https://www.instagram.com/amazoniaemprende/' },
  { icon: '👥', label: 'Facebook',  url: 'https://www.facebook.com/amazoniaemprende/'  },
  { icon: '💼', label: 'LinkedIn',  url: 'https://co.linkedin.com/company/amazonia-emprende' },
]

/** Calcula los 3 presets a partir del ancho de pantalla (5%, 9%, 17%) */
function calcPresets(sw: number): [number, number, number] {
  if (sw === 0) return [56, 96, 164]
  return [
    Math.max(52, Math.round(sw * 0.05)),
    Math.max(82, Math.round(sw * 0.09)),
    Math.max(148, Math.round(sw * 0.17)),
  ]
}

export default function LeftSidebar({ activeCategory, onSelectCategory, onWidthChange, isMobile }: Props) {
  const [screenW,   setScreenW]   = useState(0)
  const [sidebarW,  setSidebarW]  = useState(96)
  const [view,      setView]      = useState<'main' | 'contact'>('main')
  const [hovered,   setHovered]   = useState<string | null>(null)
  const [logoError, setLogoError] = useState(false)

  // Initialize with screen-relative medium preset
  useEffect(() => {
    const w = window.innerWidth
    setScreenW(w)
    setSidebarW(calcPresets(w)[1])
    const onResize = () => setScreenW(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const presets = useMemo(() => calcPresets(screenW), [screenW])

  // Nearest preset index for the dot indicator
  const activeDot = presets.reduce(
    (best, size, i) => Math.abs(size - sidebarW) < Math.abs(presets[best] - sidebarW) ? i : best,
    0,
  )

  const canShrink = presets.some(p => p < sidebarW)
  const canGrow   = presets.some(p => p > sidebarW)

  const showLabels = sidebarW > 66
  const logoSize   = Math.min(68, Math.max(24, Math.round(sidebarW * 0.43)))
  const iconSize   = Math.min(26, Math.max(18, Math.round(sidebarW * 0.24)))

  // Inform parent whenever width changes
  useEffect(() => { onWidthChange(sidebarW) }, [sidebarW, onWidthChange])

  const shrink = useCallback(() => {
    const target = [...presets].reverse().find(p => p < sidebarW)
    if (target !== undefined) setSidebarW(target)
  }, [presets, sidebarW])

  const grow = useCallback(() => {
    const target = presets.find(p => p > sidebarW)
    if (target !== undefined) setSidebarW(target)
  }, [presets, sidebarW])

  // Free-drag resize via the right-edge handle
  const startDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = sidebarW
    const move = (ev: MouseEvent) => {
      const minW = 48
      const maxW = Math.round(window.innerWidth * 0.30)
      setSidebarW(Math.min(maxW, Math.max(minW, startW + ev.clientX - startX)))
    }
    const up = () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', up)
      document.body.style.cursor    = ''
      document.body.style.userSelect = ''
    }
    document.body.style.cursor    = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
  }, [sidebarW])

  // ── Móvil: barra de navegación inferior ──────────────────────────────────
  if (isMobile) {
    return (
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 56, zIndex: 1001,
        background: 'rgba(8,8,10,0.94)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: '1px solid rgba(255,255,255,0.09)',
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        {ITEMS.map(({ key, label, icon, color }) => {
          const isActive = activeCategory === key
          return (
            <button key={key}
              onClick={() => onSelectCategory(isActive ? null : key)}
              style={{
                flex: 1, height: '100%', minHeight: 56,
                background: isActive ? `${color}12` : 'transparent',
                border: 'none',
                borderTop: isActive ? `2px solid ${color}` : '2px solid transparent',
                color: isActive ? color : 'rgba(255,255,255,0.45)',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 3,
                padding: '6px 0',
                transition: 'all 0.2s ease',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span style={{
                fontSize: isActive ? 24 : 22, lineHeight: 1,
                filter: isActive ? `drop-shadow(0 0 6px ${color})` : 'none',
                transition: 'font-size 0.18s ease, filter 0.18s ease',
              }}>{icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>
                {label}
              </span>
            </button>
          )
        })}
      </nav>
    )
  }

  // ── Estilos compartidos del sidebar ───────────────────────────────────────
  const sidebarStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, height: '100dvh',
    width: sidebarW,
    zIndex: 1001,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    borderRight: '1px solid rgba(255,255,255,0.07)',
    boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    paddingTop: 16,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    overflow: 'hidden',
    transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
  }

  // Control de tamaño (compartido entre vistas)
  const sizeControl = (
    <div style={{
      flexShrink: 0, width: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 5, padding: '8px 6px 18px',
    }}>
      <button
        onClick={shrink} disabled={!canShrink}
        onMouseEnter={() => setHovered('shrink')} onMouseLeave={() => setHovered(null)}
        title="Reducir panel"
        style={{
          width: 28, height: 28, borderRadius: 7, flexShrink: 0,
          background: !canShrink ? 'transparent' : hovered === 'shrink' ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)',
          border: `1px solid ${!canShrink ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.18)'}`,
          color: !canShrink ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.78)',
          cursor: !canShrink ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17, lineHeight: 1, fontWeight: 500,
          transition: 'all 0.15s ease',
        }}
      >‹</button>

      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {presets.map((_, i) => (
          <button key={i} onClick={() => setSidebarW(presets[i])} title={['Mínimo', 'Medio', 'Expandido'][i]} style={{
            width: i === activeDot ? 16 : 5, height: 5, borderRadius: 3,
            background: i === activeDot ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.2)',
            border: 'none', cursor: 'pointer', padding: 0,
            transition: 'all 0.22s ease',
          }} />
        ))}
      </div>

      <button
        onClick={grow} disabled={!canGrow}
        onMouseEnter={() => setHovered('grow')} onMouseLeave={() => setHovered(null)}
        title="Ampliar panel"
        style={{
          width: 28, height: 28, borderRadius: 7, flexShrink: 0,
          background: !canGrow ? 'transparent' : hovered === 'grow' ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)',
          border: `1px solid ${!canGrow ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.18)'}`,
          color: !canGrow ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.78)',
          cursor: !canGrow ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17, lineHeight: 1, fontWeight: 500,
          transition: 'all 0.15s ease',
        }}
      >›</button>
    </div>
  )

  // Handle de arrastre (borde derecho)
  const dragHandle = (
    <div
      onMouseDown={startDrag}
      style={{
        position: 'absolute', top: 0, right: 0, width: 5, height: '100%',
        cursor: 'col-resize', background: 'transparent', zIndex: 2,
        transition: 'background 0.15s ease',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    />
  )

  // ── Vista contacto (reemplaza el contenido del sidebar) ───────────────────
  if (view === 'contact') {
    return (
      <div style={sidebarStyle}>
        {/* Botón volver */}
        <button
          onClick={() => setView('main')}
          onMouseEnter={() => setHovered('back')}
          onMouseLeave={() => setHovered(null)}
          style={{
            width: '100%', background: hovered === 'back' ? 'rgba(255,255,255,0.07)' : 'transparent',
            border: 'none', borderLeft: '4px solid transparent',
            color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
            justifyContent: showLabels ? 'flex-start' : 'center',
            gap: 8, padding: '12px 14px',
            fontSize: 12, fontWeight: 600, flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
            <path d="M9 2.5L4.5 7 9 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {showLabels && <span>Volver</span>}
        </button>

        <div style={{ width: '80%', height: 1, background: 'rgba(255,255,255,0.08)', margin: '4px 0 10px', flexShrink: 0 }} />

        {/* Título de la marca */}
        {showLabels && (
          <div style={{ width: '100%', flexShrink: 0, padding: '0 14px 14px' }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 3 }}>
              Amazonia Emprende
            </div>
            <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11 }}>
              Conecta con nosotros
            </div>
          </div>
        )}

        {/* Links — área scrollable si el sidebar es muy corto */}
        <div style={{ flex: 1, width: '100%', overflowY: 'auto', minHeight: 0 }}>
          {SOCIAL_LINKS.map(({ icon, label, url }) => (
            <a
              key={label} href={url} target="_blank" rel="noopener noreferrer"
              title={showLabels ? undefined : label}
              style={{
                display: 'flex', alignItems: 'center',
                justifyContent: showLabels ? 'flex-start' : 'center',
                gap: showLabels ? 12 : 0,
                padding: showLabels ? '14px 16px' : '15px 4px',
                color: 'rgba(255,255,255,0.72)',
                textDecoration: 'none', fontSize: 12, fontWeight: 500,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                transition: 'color 0.15s ease, background 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.72)'; e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: showLabels ? 18 : 22, lineHeight: 1 }}>{icon}</span>
              {showLabels && label}
            </a>
          ))}
        </div>

        {sizeControl}
        {dragHandle}
      </div>
    )
  }

  // ── Vista principal ───────────────────────────────────────────────────────
  return (
    <div style={sidebarStyle}>
      {/* Logo */}
      <div style={{
        marginBottom: 12, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '100%', overflow: 'hidden',
      }}>
        {!logoError ? (
          <img
            src="/logo-ae.png" alt="Amazonia Emprende"
            onError={() => setLogoError(true)}
            style={{ width: logoSize, height: 'auto', objectFit: 'contain', transition: 'width 0.25s ease', flexShrink: 0 }}
          />
        ) : (
          <div style={{
            width: logoSize, height: logoSize,
            borderRadius: sidebarW < 70 ? '50%' : 8,
            background: 'linear-gradient(135deg, #74A884 0%, #6898B8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: Math.round(logoSize * 0.38), fontWeight: 800,
            color: '#fff', letterSpacing: '0.04em',
            transition: 'all 0.25s ease', flexShrink: 0,
          }}>AE</div>
        )}
      </div>

      <div style={{ width: '60%', height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 6, flexShrink: 0 }} />

      {/* Categorías — flex:1 + scroll para que los controles del fondo siempre sean visibles */}
      <div style={{
        flex: 1, overflowY: 'auto', width: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 2, minHeight: 0,
      }}>
        {ITEMS.map(({ key, label, icon, color }) => {
          const isActive  = activeCategory === key
          const isHovered = hovered === key
          return (
            <button
              key={key}
              onClick={() => onSelectCategory(isActive ? null : key)}
              onMouseEnter={() => setHovered(key)}
              onMouseLeave={() => setHovered(null)}
              title={showLabels ? undefined : label}
              style={{
                background: isActive
                  ? `radial-gradient(ellipse at left, ${color}18 0%, transparent 70%)`
                  : isHovered ? 'rgba(255,255,255,0.07)' : 'transparent',
                border: 'none',
                borderLeft: isActive ? `4px solid ${color}` : '4px solid transparent',
                boxShadow: isActive ? `inset 0 0 20px ${color}12, 0 0 14px ${color}30` : 'none',
                color: isActive ? color : isHovered ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.45)',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 5, width: '100%', padding: '14px 4px',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{
                fontSize: isActive ? iconSize + 4 : iconSize,
                lineHeight: 1,
                filter: isActive ? `drop-shadow(0 0 8px ${color})` : 'none',
                transition: 'font-size 0.18s ease, filter 0.18s ease',
              }}>{icon}</span>
              {showLabels && (
                <span style={{
                  fontSize: sidebarW > 120 ? 10 : 9,
                  fontWeight: 700, lineHeight: 1.2,
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                  textAlign: 'center', whiteSpace: 'nowrap',
                }}>{label}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Sección inferior fija — siempre visible independiente de la altura de pantalla */}
      <div style={{ flexShrink: 0, width: '100%' }}>
        {/* Botón de contacto (lleva a la vista de contacto) */}
        <button
          onClick={() => setView('contact')}
          onMouseEnter={() => setHovered('contact')}
          onMouseLeave={() => setHovered(null)}
          title={showLabels ? undefined : 'Contacto'}
          style={{
            width: '100%',
            background: hovered === 'contact' ? 'rgba(255,255,255,0.06)' : 'transparent',
            border: 'none', borderLeft: '4px solid transparent',
            color: 'rgba(255,255,255,0.38)',
            cursor: 'pointer',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 4, padding: '12px 4px',
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>✉️</span>
          {showLabels && (
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.35)' }}>
              Contacto
            </span>
          )}
        </button>

        {sizeControl}
      </div>

      {dragHandle}
    </div>
  )
}
