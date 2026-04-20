'use client'

import { useState, useCallback, useRef } from 'react'
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
  { key: 'ras',     label: 'Conservación', icon: '🌿', color: '#6898B8' },
]

const COLLAPSED_W = 56
const MIN_W_RATIO  = 0.04
const MAX_W_RATIO  = 0.18

export default function LeftSidebar({ activeCategory, onSelectCategory, width, onWidthChange, isMobile }: Props) {
  const [hovered,       setHovered]       = useState<string | null>(null)
  const [isCollapsed,   setIsCollapsed]   = useState(false)
  const [contactOpen,   setContactOpen]   = useState(false)
  const [logoError,     setLogoError]     = useState(false)
  const prevExpandedW = useRef(width)

  // Sync prevExpandedW when NOT collapsed
  if (!isCollapsed && width !== COLLAPSED_W) prevExpandedW.current = width

  const toggleCollapse = useCallback(() => {
    if (isCollapsed) {
      onWidthChange(prevExpandedW.current)
      setIsCollapsed(false)
    } else {
      prevExpandedW.current = width
      onWidthChange(COLLAPSED_W)
      setIsCollapsed(true)
    }
  }, [isCollapsed, width, onWidthChange])

  const startDrag = useCallback(
    (e: React.MouseEvent) => {
      if (isCollapsed) return
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
    [isCollapsed, width, onWidthChange],
  )

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
              }}>
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

  // ── Escritorio: sidebar lateral izquierdo ─────────────────────────────────
  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, height: '100dvh',
        width,
        zIndex: 1001,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: 16, paddingBottom: 12,
        gap: 4,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* ── Logo ──────────────────────────────────────────────────────── */}
      <div style={{
        marginBottom: 14, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '100%', overflow: 'hidden',
      }}>
        {!logoError ? (
          <img
            src="/logo-ae.png"
            alt="Amazonia Emprende"
            onError={() => setLogoError(true)}
            style={{
              width: isCollapsed ? 30 : 42,
              height: 'auto',
              objectFit: 'contain',
              transition: 'width 0.25s ease',
              flexShrink: 0,
            }}
          />
        ) : (
          // Fallback mientras no hay logo
          <div style={{
            width: isCollapsed ? 30 : 36,
            height: isCollapsed ? 30 : 36,
            borderRadius: isCollapsed ? '50%' : 8,
            background: 'linear-gradient(135deg, #74A884 0%, #6898B8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isCollapsed ? 11 : 13, fontWeight: 800,
            color: '#fff',
            letterSpacing: '0.04em',
            transition: 'all 0.25s ease',
            flexShrink: 0,
          }}>
            AE
          </div>
        )}
      </div>

      <div style={{ width: '60%', height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 6, flexShrink: 0 }} />

      {/* ── Botones de categoría ───────────────────────────────────────── */}
      {ITEMS.map(({ key, label, icon, color }) => {
        const isActive  = activeCategory === key
        const isHovered = hovered === key
        return (
          <button
            key={key}
            onClick={() => onSelectCategory(isActive ? null : key)}
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
            title={isCollapsed ? label : undefined}
            style={{
              background: isActive
                ? `radial-gradient(ellipse at left, ${color}18 0%, transparent 70%)`
                : isHovered
                  ? `rgba(255,255,255,0.07)`
                  : 'transparent',
              border: 'none',
              borderLeft: isActive ? `4px solid ${color}` : '4px solid transparent',
              boxShadow: isActive ? `inset 0 0 20px ${color}12, 0 0 14px ${color}30` : 'none',
              color: isActive ? color : isHovered ? `rgba(255,255,255,0.65)` : 'rgba(255,255,255,0.45)',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 5,
              width: '100%',
              padding: isCollapsed ? '14px 4px' : '13px 4px',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{
              fontSize: isActive ? 28 : 24,
              lineHeight: 1,
              filter: isActive ? `drop-shadow(0 0 8px ${color})` : 'none',
              transition: 'font-size 0.18s ease, filter 0.18s ease',
            }}>
              {icon}
            </span>
            {!isCollapsed && (
              <span style={{
                fontSize: 9, fontWeight: 700, lineHeight: 1.2,
                letterSpacing: '0.04em', textTransform: 'uppercase',
                textAlign: 'center', whiteSpace: 'nowrap',
                opacity: isCollapsed ? 0 : 1,
                transition: 'opacity 0.2s ease',
              }}>
                {label}
              </span>
            )}
          </button>
        )
      })}

      {/* ── Espaciador ────────────────────────────────────────────────── */}
      <div style={{ flex: 1 }} />

      {/* ── Botón de contacto ─────────────────────────────────────────── */}
      <div style={{ position: 'relative', width: '100%' }}>
        <button
          onClick={() => setContactOpen((v) => !v)}
          onMouseEnter={() => setHovered('contact')}
          onMouseLeave={() => setHovered(null)}
          title="Contacto"
          style={{
            width: '100%', background: contactOpen ? 'rgba(255,255,255,0.08)' : hovered === 'contact' ? 'rgba(255,255,255,0.06)' : 'transparent',
            border: 'none', borderLeft: '4px solid transparent',
            color: contactOpen ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)',
            cursor: 'pointer',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 4, padding: '12px 4px',
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{ fontSize: isCollapsed ? 20 : 18, lineHeight: 1 }}>✉️</span>
          {!isCollapsed && (
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.35)' }}>
              Contacto
            </span>
          )}
        </button>

        {/* Panel de redes sociales */}
        {contactOpen && (
          <div style={{
            position: 'absolute',
            bottom: 0, left: '100%',
            marginLeft: 8,
            background: 'rgba(12,12,16,0.97)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: '16px 18px',
            width: 210,
            zIndex: 1200,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              Amazonia Emprende
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 14 }}>
              Conecta con nosotros
            </div>
            {/* Links placeholder — el usuario proveerá los URLs */}
            {[
              { icon: '📷', label: 'Instagram', url: 'https://www.instagram.com/amazoniaemprende/' },
              { icon: '👥', label: 'Facebook',  url: 'https://www.facebook.com/amazoniaemprende/'  },
              { icon: '💼', label: 'LinkedIn',  url: 'https://co.linkedin.com/company/amazonia-emprende' },
            ].map(({ icon, label, url }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.7)',
                  textDecoration: 'none',
                  fontSize: 12,
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >
                <span style={{ fontSize: 16 }}>{icon}</span>
                {label}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* ── Botón colapsar / expandir ─────────────────────────────────── */}
      <button
        onClick={toggleCollapse}
        onMouseEnter={() => setHovered('collapse')}
        onMouseLeave={() => setHovered(null)}
        title={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        style={{
          width: '100%', background: hovered === 'collapse' ? 'rgba(255,255,255,0.06)' : 'transparent',
          border: 'none', borderLeft: '4px solid transparent',
          color: 'rgba(255,255,255,0.25)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '10px 4px',
          transition: 'all 0.2s ease',
          flexShrink: 0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{ transition: 'transform 0.25s ease', transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="M9 2.5L4.5 7 9 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* ── Drag handle (solo expandido) ─────────────────────────────── */}
      {!isCollapsed && (
        <div
          onMouseDown={startDrag}
          style={{
            position: 'absolute', top: 0, right: 0, width: 4, height: '100%',
            cursor: 'col-resize', background: 'transparent', zIndex: 2,
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        />
      )}
    </div>
  )
}
