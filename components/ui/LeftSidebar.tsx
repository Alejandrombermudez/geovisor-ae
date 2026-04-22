'use client'

import { useState, useCallback, useEffect } from 'react'
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

const SIZES     = [56,  96, 164] as const   // collapsed | medium | expanded (px)
const LOGO_W    = [28,  44,  64] as const   // logo width per state (px)
const ICON_SIZE = [20,  22,  26] as const   // category icon font-size per state (px)

export default function LeftSidebar({ activeCategory, onSelectCategory, onWidthChange, isMobile }: Props) {
  const [hovered,     setHovered]     = useState<string | null>(null)
  const [sizeIndex,   setSizeIndex]   = useState<number>(1)    // default: medium
  const [contactOpen, setContactOpen] = useState(false)
  const [logoError,   setLogoError]   = useState(false)

  const isCollapsed = sizeIndex === 0
  const currentW    = SIZES[sizeIndex]

  // Inform parent of width changes so map + other panels can respond
  useEffect(() => { onWidthChange(SIZES[sizeIndex]) }, [sizeIndex, onWidthChange])

  const shrink = useCallback(() => setSizeIndex(i => Math.max(0, i - 1)), [])
  const grow   = useCallback(() => setSizeIndex(i => Math.min(2, i + 1)), [])

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
        width: currentW,
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
        marginBottom: 12, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '100%', overflow: 'hidden',
      }}>
        {!logoError ? (
          <img
            src="/logo-ae.png"
            alt="Amazonia Emprende"
            onError={() => setLogoError(true)}
            style={{
              width: LOGO_W[sizeIndex],
              height: 'auto',
              objectFit: 'contain',
              transition: 'width 0.25s ease',
              flexShrink: 0,
            }}
          />
        ) : (
          <div style={{
            width: LOGO_W[sizeIndex],
            height: LOGO_W[sizeIndex],
            borderRadius: isCollapsed ? '50%' : 8,
            background: 'linear-gradient(135deg, #74A884 0%, #6898B8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: Math.round(LOGO_W[sizeIndex] * 0.38), fontWeight: 800,
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
                : isHovered ? 'rgba(255,255,255,0.07)' : 'transparent',
              border: 'none',
              borderLeft: isActive ? `4px solid ${color}` : '4px solid transparent',
              boxShadow: isActive ? `inset 0 0 20px ${color}12, 0 0 14px ${color}30` : 'none',
              color: isActive ? color : isHovered ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.45)',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 5,
              width: '100%',
              padding: '13px 4px',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{
              fontSize: isActive ? ICON_SIZE[sizeIndex] + 4 : ICON_SIZE[sizeIndex],
              lineHeight: 1,
              filter: isActive ? `drop-shadow(0 0 8px ${color})` : 'none',
              transition: 'font-size 0.18s ease, filter 0.18s ease',
            }}>
              {icon}
            </span>
            {sizeIndex > 0 && (
              <span style={{
                fontSize: sizeIndex === 2 ? 10 : 9,
                fontWeight: 700, lineHeight: 1.2,
                letterSpacing: '0.04em', textTransform: 'uppercase',
                textAlign: 'center', whiteSpace: 'nowrap',
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
      <div style={{ width: '100%' }}>
        <button
          onClick={() => setContactOpen(v => !v)}
          onMouseEnter={() => setHovered('contact')}
          onMouseLeave={() => setHovered(null)}
          title="Contacto"
          style={{
            width: '100%',
            background: contactOpen
              ? 'rgba(255,255,255,0.08)'
              : hovered === 'contact' ? 'rgba(255,255,255,0.06)' : 'transparent',
            border: 'none', borderLeft: '4px solid transparent',
            color: contactOpen ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)',
            cursor: 'pointer',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 4, padding: '12px 4px',
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>✉️</span>
          {sizeIndex > 0 && (
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.35)' }}>
              Contacto
            </span>
          )}
        </button>

        {/* Panel de redes sociales — position:fixed para saltarse overflow:hidden del padre */}
        {contactOpen && (
          <div style={{
            position: 'fixed',
            bottom: 82,
            left: currentW + 8,
            background: 'rgba(12,12,16,0.97)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: '16px 18px',
            width: 210,
            zIndex: 1300,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              Amazonia Emprende
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 14 }}>
              Conecta con nosotros
            </div>
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

      {/* ── Control de tamaño — flechas + indicador de puntos ────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 5, padding: '10px 6px 4px',
        width: '100%', flexShrink: 0,
      }}>
        {/* Flecha izquierda (reducir) */}
        <button
          onClick={shrink}
          disabled={sizeIndex === 0}
          onMouseEnter={() => setHovered('shrink')}
          onMouseLeave={() => setHovered(null)}
          title="Reducir panel"
          style={{
            background: sizeIndex === 0 ? 'transparent' : hovered === 'shrink' ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)',
            border: `1px solid ${sizeIndex === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.16)'}`,
            color: sizeIndex === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.75)',
            width: 28, height: 28,
            borderRadius: 7,
            cursor: sizeIndex === 0 ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, lineHeight: 1, fontWeight: 500,
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
        >
          ‹
        </button>

        {/* Puntos indicadores — clic directo al estado */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {SIZES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSizeIndex(i)}
              title={['Mínimo', 'Medio', 'Expandido'][i]}
              style={{
                width: i === sizeIndex ? 16 : 5,
                height: 5,
                borderRadius: 3,
                background: i === sizeIndex ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.2)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'all 0.22s ease',
              }}
            />
          ))}
        </div>

        {/* Flecha derecha (ampliar) */}
        <button
          onClick={grow}
          disabled={sizeIndex === 2}
          onMouseEnter={() => setHovered('grow')}
          onMouseLeave={() => setHovered(null)}
          title="Ampliar panel"
          style={{
            background: sizeIndex === 2 ? 'transparent' : hovered === 'grow' ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)',
            border: `1px solid ${sizeIndex === 2 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.16)'}`,
            color: sizeIndex === 2 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.75)',
            width: 28, height: 28,
            borderRadius: 7,
            cursor: sizeIndex === 2 ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, lineHeight: 1, fontWeight: 500,
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
        >
          ›
        </button>
      </div>
    </div>
  )
}
