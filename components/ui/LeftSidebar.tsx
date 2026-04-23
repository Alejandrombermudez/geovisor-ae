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

const METRICS = [
  { value: '12.480', label: 'Árboles nativos',       icon: '🌳' },
  { value: '68',     label: 'Polígonos monitoreados', icon: '📍' },
  { value: '87',     label: 'Familias vinculadas',    icon: '🌾' },
  { value: '1.320',  label: 't CO₂e compensadas',    icon: '📉' },
]

// Carpeta: public/about/  → sube ae-foto-1.jpg y ae-foto-2.jpg
const AE_IMAGES = ['/about/ae-foto-1.jpg', '/about/ae-foto-2.jpg']

// ── SVG social icons ──────────────────────────────────────────────────────────

function IgIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-label="Instagram">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

function FbIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-label="Facebook">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function LiIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-label="LinkedIn">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

const SOCIAL_LINKS: { label: string; url: string; Icon: typeof IgIcon }[] = [
  { label: 'Instagram', url: 'https://www.instagram.com/amazoniaemprende/', Icon: IgIcon },
  { label: 'Facebook',  url: 'https://www.facebook.com/amazoniaemprende/',  Icon: FbIcon },
  { label: 'LinkedIn',  url: 'https://co.linkedin.com/company/amazonia-emprende', Icon: LiIcon },
]

// ── Cálculo de presets relativos a la pantalla ────────────────────────────────

function calcPresets(sw: number): [number, number, number] {
  if (sw === 0) return [56, 96, 164]
  return [
    Math.max(52,  Math.round(sw * 0.05)),
    Math.max(82,  Math.round(sw * 0.09)),
    Math.max(148, Math.round(sw * 0.17)),
  ]
}

// ── Imagen con fallback silencioso ────────────────────────────────────────────

function AEImage({ src, style }: { src: string; style: React.CSSProperties }) {
  const [hidden, setHidden] = useState(false)
  if (hidden) return null
  return <img src={src} onError={() => setHidden(true)} style={style} alt="Amazonia Emprende" />
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function LeftSidebar({ activeCategory, onSelectCategory, onWidthChange, isMobile }: Props) {
  const [screenW,   setScreenW]   = useState(0)
  const [sidebarW,  setSidebarW]  = useState(96)
  const [view,      setView]      = useState<'main' | 'about'>('main')
  const [hovered,   setHovered]   = useState<string | null>(null)
  const [logoError, setLogoError] = useState(false)

  useEffect(() => {
    const w = window.innerWidth
    setScreenW(w)
    setSidebarW(calcPresets(w)[1])
    const onResize = () => setScreenW(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const presets   = useMemo(() => calcPresets(screenW), [screenW])
  const activeDot = presets.reduce(
    (best, s, i) => Math.abs(s - sidebarW) < Math.abs(presets[best] - sidebarW) ? i : best, 0,
  )
  const canShrink  = presets.some(p => p < sidebarW)
  const canGrow    = presets.some(p => p > sidebarW)
  const showLabels = sidebarW > 66
  const logoSize   = Math.min(68, Math.max(24, Math.round(sidebarW * 0.43)))
  const iconSize   = Math.min(26, Math.max(18, Math.round(sidebarW * 0.24)))

  useEffect(() => { onWidthChange(sidebarW) }, [sidebarW, onWidthChange])

  const shrink = useCallback(() => {
    const t = [...presets].reverse().find(p => p < sidebarW)
    if (t) setSidebarW(t)
  }, [presets, sidebarW])

  const grow = useCallback(() => {
    const t = presets.find(p => p > sidebarW)
    if (t) setSidebarW(t)
  }, [presets, sidebarW])

  const openAbout = useCallback(() => {
    setView('about')
    // Siempre expandir al estado máximo para presentar el contenido correctamente
    setSidebarW(presets[2])
  }, [presets])

  const startDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = sidebarW
    const move = (ev: MouseEvent) => {
      const min = 48, max = Math.round(window.innerWidth * 0.32)
      setSidebarW(Math.min(max, Math.max(min, startW + ev.clientX - startX)))
    }
    const up = () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', up)
      document.body.style.cursor = document.body.style.userSelect = ''
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
  }, [sidebarW])

  // ── Móvil ─────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 56, zIndex: 1001,
        background: 'rgba(8,8,10,0.94)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: '1px solid rgba(255,255,255,0.09)',
        display: 'flex', paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        {ITEMS.map(({ key, label, icon, color }) => {
          const isActive = activeCategory === key
          return (
            <button key={key} onClick={() => onSelectCategory(isActive ? null : key)} style={{
              flex: 1, height: '100%', minHeight: 56, background: isActive ? `${color}12` : 'transparent',
              border: 'none', borderTop: isActive ? `2px solid ${color}` : '2px solid transparent',
              color: isActive ? color : 'rgba(255,255,255,0.45)',
              cursor: 'pointer', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 3, padding: '6px 0',
              transition: 'all 0.2s ease', WebkitTapHighlightColor: 'transparent',
            }}>
              <span style={{ fontSize: isActive ? 24 : 22, lineHeight: 1, filter: isActive ? `drop-shadow(0 0 6px ${color})` : 'none', transition: 'all 0.18s ease' }}>{icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>{label}</span>
            </button>
          )
        })}
      </nav>
    )
  }

  // ── Estilos base del sidebar ───────────────────────────────────────────────
  const sidebarBase: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, height: '100dvh', width: sidebarW, zIndex: 1001,
    background: 'rgba(0,0,0,0.72)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    borderRight: '1px solid rgba(255,255,255,0.07)',
    boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    paddingTop: 16, fontFamily: 'system-ui, -apple-system, sans-serif',
    overflow: 'hidden', transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
  }

  // Control de tamaño (compartido en ambas vistas)
  const SizeControl = () => (
    <div style={{ flexShrink: 0, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 6px 18px' }}>
      {([
        [canShrink, shrink, 'shrink', '‹', 'Reducir'],
        null,
        [canGrow,  grow,  'grow',  '›', 'Ampliar'],
      ] as const).map((item, idx) => {
        if (item === null) {
          return (
            <div key="dots" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {presets.map((_, i) => (
                <button key={i} onClick={() => setSidebarW(presets[i])} title={['Mínimo', 'Medio', 'Expandido'][i]} style={{
                  width: i === activeDot ? 16 : 5, height: 5, borderRadius: 3, border: 'none', cursor: 'pointer', padding: 0,
                  background: i === activeDot ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.22s ease',
                }} />
              ))}
            </div>
          )
        }
        const [can, fn, key, glyph, title] = item as [boolean, () => void, string, string, string]
        return (
          <button key={key} onClick={fn} disabled={!can}
            onMouseEnter={() => setHovered(key)} onMouseLeave={() => setHovered(null)} title={title}
            style={{
              width: 28, height: 28, borderRadius: 7, flexShrink: 0,
              background: !can ? 'transparent' : hovered === key ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${!can ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.18)'}`,
              color: !can ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.78)',
              cursor: !can ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, lineHeight: 1, fontWeight: 500, transition: 'all 0.15s ease',
            }}
          >{glyph}</button>
        )
      })}
    </div>
  )

  const DragHandle = () => (
    <div onMouseDown={startDrag} style={{ position: 'absolute', top: 0, right: 0, width: 5, height: '100%', cursor: 'col-resize', background: 'transparent', zIndex: 2, transition: 'background 0.15s ease' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    />
  )

  // ── Vista "Amazonia Emprende" (about) ─────────────────────────────────────
  if (view === 'about') {
    const compact = !showLabels

    return (
      <div style={sidebarBase}>
        {/* Botón volver */}
        <button onClick={() => setView('main')} onMouseEnter={() => setHovered('back')} onMouseLeave={() => setHovered(null)}
          style={{
            width: '100%', background: hovered === 'back' ? 'rgba(255,255,255,0.07)' : 'transparent',
            border: 'none', borderLeft: '4px solid transparent',
            color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
            justifyContent: compact ? 'center' : 'flex-start',
            gap: 8, padding: compact ? '12px 4px' : '11px 14px',
            fontSize: 12, fontWeight: 600, flexShrink: 0, transition: 'all 0.15s ease',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
            <path d="M9 2.5L4.5 7 9 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {!compact && <span>Volver</span>}
        </button>

        <div style={{ width: '80%', height: 1, background: 'rgba(255,255,255,0.08)', margin: '2px 0 10px', flexShrink: 0 }} />

        {/* Contenido scrollable */}
        <div className="geo-about-scroll" style={{ flex: 1, overflowY: 'auto', width: '100%', minHeight: 0 }}>

          {/* Logo / marca */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: compact ? '0 6px 12px' : '0 14px 14px', gap: 8 }}>
            {!logoError ? (
              <img src="/logo-ae.png" alt="AE" onError={() => setLogoError(true)}
                style={{ width: Math.min(80, Math.max(32, Math.round(sidebarW * 0.44))), height: 'auto', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg,#74A884,#6898B8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' }}>AE</div>
            )}
            {!compact && (
              <>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 800, textAlign: 'center', letterSpacing: '0.01em', lineHeight: 1.2 }}>
                  Amazonia Emprende
                </div>
                <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 10, textAlign: 'center', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Escuela Bosque
                </div>
              </>
            )}
          </div>

          {/* Fotos AE (aparecen si el usuario sube los archivos) */}
          {!compact && (() => {
            const imgs = AE_IMAGES.map((src, i) => <AEImage key={i} src={src} style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 6, display: 'block' }} />)
            return (
              <div style={{ display: 'flex', gap: 5, padding: '0 12px 14px' }}>
                {imgs}
              </div>
            )
          })()}

          {/* Tagline */}
          <div style={{ padding: compact ? '0 6px 10px' : '0 14px 10px' }}>
            <div style={{ fontSize: compact ? 11 : 13, fontWeight: 700, color: '#74A884', lineHeight: 1.3, marginBottom: compact ? 0 : 6 }}>
              {compact ? '🌿' : '🌿 Inversión Ambiental Estratégica'}
            </div>
            {!compact && (
              <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 11, lineHeight: 1.6, margin: 0 }}>
                Facilita a empresas el cumplimiento de la <strong style={{ color: 'rgba(255,255,255,0.82)' }}>Ley 2173 de 2021</strong> (Ley del Árbol) con proyectos de restauración ecológica de alto impacto social y rigor técnico en el Piedemonte Amazónico.
              </p>
            )}
          </div>

          {/* Métricas de impacto */}
          <div style={{ padding: compact ? '0 4px 10px' : '0 10px 14px' }}>
            {!compact && (
              <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>
                📊 Impacto en cifras
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
              {METRICS.map(({ value, label, icon }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: 8, padding: compact ? '8px 4px' : '10px 8px', textAlign: 'center',
                }}>
                  {compact
                    ? <div style={{ fontSize: 16, lineHeight: 1 }}>{icon}</div>
                    : <>
                        <div style={{ color: '#74A884', fontSize: 15, fontWeight: 800, lineHeight: 1, marginBottom: 4 }}>{value}</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, lineHeight: 1.3, letterSpacing: '0.02em' }}>{label}</div>
                      </>
                  }
                </div>
              ))}
            </div>
          </div>

          {/* Visión 2030 */}
          {!compact && (
            <div style={{ margin: '0 12px 14px', padding: '10px 12px', background: 'rgba(116,168,132,0.1)', border: '1px solid rgba(116,168,132,0.2)', borderRadius: 8 }}>
              <div style={{ color: '#74A884', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>🎯 Visión 2030</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, lineHeight: 1.55 }}>
                25.000 ha restauradas · 75.000 ha conservadas
              </div>
            </div>
          )}

          {/* Propuesta de valor */}
          {!compact && (
            <div style={{ padding: '0 14px 14px' }}>
              <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
                🏢 Soluciones corporativas
              </div>
              {[
                { t: 'Ejecución integral', d: 'Diseño técnico, germinación, siembra y mantenimiento durante los años críticos.' },
                { t: 'Trazabilidad total', d: 'Acceso al geovisor para auditar su bosque corporativo e informes ESG.' },
                { t: 'Impacto certificado', d: 'Especies nativas del ecosistema, maximizando el retorno ambiental.' },
              ].map(({ t, d }) => (
                <div key={t} style={{ marginBottom: 10 }}>
                  <div style={{ color: 'rgba(255,255,255,0.82)', fontSize: 11, fontWeight: 600, marginBottom: 3 }}>{t}</div>
                  <div style={{ color: 'rgba(255,255,255,0.48)', fontSize: 10, lineHeight: 1.55 }}>{d}</div>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div style={{ padding: compact ? '0 6px 14px' : '0 12px 14px' }}>
            <a
              href="mailto:escuelabosque@amazoniaemprende.com?subject=Cotización%20proyecto%20de%20compensación%20ambiental"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: 'linear-gradient(135deg, #74A884 0%, #6898B8 100%)',
                color: '#fff', textDecoration: 'none',
                fontSize: compact ? 10 : 11, fontWeight: 700,
                padding: compact ? '9px 4px' : '10px 12px',
                borderRadius: 8, letterSpacing: '0.02em', lineHeight: 1.2,
                textAlign: 'center',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              {compact ? '→' : 'Cotice su proyecto →'}
            </a>
          </div>

          {/* Redes sociales */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', width: '100%', paddingBottom: 6 }}>
            {SOCIAL_LINKS.map(({ label, url, Icon }) => (
              <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                title={compact ? label : undefined}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: compact ? 'center' : 'flex-start',
                  gap: compact ? 0 : 12, padding: compact ? '11px 4px' : '11px 14px',
                  color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 12, fontWeight: 500,
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  transition: 'color 0.15s ease, background 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.background = 'transparent' }}
              >
                <Icon size={compact ? 20 : 17} />
                {!compact && label}
              </a>
            ))}
          </div>
        </div>

        <SizeControl />
        <DragHandle />
      </div>
    )
  }

  // ── Vista principal ───────────────────────────────────────────────────────
  return (
    <div style={sidebarBase}>
      {/* Logo */}
      <div style={{ marginBottom: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', overflow: 'hidden' }}>
        {!logoError ? (
          <img src="/logo-ae.png" alt="Amazonia Emprende" onError={() => setLogoError(true)}
            style={{ width: logoSize, height: 'auto', objectFit: 'contain', transition: 'width 0.25s ease', flexShrink: 0 }}
          />
        ) : (
          <div style={{
            width: logoSize, height: logoSize, borderRadius: sidebarW < 70 ? '50%' : 8,
            background: 'linear-gradient(135deg, #74A884 0%, #6898B8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: Math.round(logoSize * 0.38), fontWeight: 800, color: '#fff',
            letterSpacing: '0.04em', transition: 'all 0.25s ease', flexShrink: 0,
          }}>AE</div>
        )}
      </div>

      <div style={{ width: '60%', height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 6, flexShrink: 0 }} />

      {/* Categorías — scrollable si la pantalla es muy corta */}
      <div style={{ flex: 1, overflowY: 'auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minHeight: 0 }}>
        {ITEMS.map(({ key, label, icon, color }) => {
          const isActive  = activeCategory === key
          const isHovered = hovered === key
          return (
            <button key={key}
              onClick={() => onSelectCategory(isActive ? null : key)}
              onMouseEnter={() => setHovered(key)} onMouseLeave={() => setHovered(null)}
              title={showLabels ? undefined : label}
              style={{
                background: isActive ? `radial-gradient(ellipse at left, ${color}18 0%, transparent 70%)` : isHovered ? 'rgba(255,255,255,0.07)' : 'transparent',
                border: 'none', borderLeft: isActive ? `4px solid ${color}` : '4px solid transparent',
                boxShadow: isActive ? `inset 0 0 20px ${color}12, 0 0 14px ${color}30` : 'none',
                color: isActive ? color : isHovered ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.45)',
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 5, width: '100%', padding: '14px 4px', transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: isActive ? iconSize + 4 : iconSize, lineHeight: 1, filter: isActive ? `drop-shadow(0 0 8px ${color})` : 'none', transition: 'font-size 0.18s ease, filter 0.18s ease' }}>{icon}</span>
              {showLabels && (
                <span style={{ fontSize: sidebarW > 120 ? 10 : 9, fontWeight: 700, lineHeight: 1.2, letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Sección inferior fija */}
      <div style={{ flexShrink: 0, width: '100%' }}>
        {/* Botón "Amazonia Emprende" */}
        <button
          onClick={openAbout}
          onMouseEnter={() => setHovered('about')} onMouseLeave={() => setHovered(null)}
          title={showLabels ? undefined : 'Amazonia Emprende'}
          style={{
            width: '100%', background: hovered === 'about' ? 'rgba(116,168,132,0.1)' : 'transparent',
            border: 'none', borderLeft: '4px solid transparent',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            color: hovered === 'about' ? 'rgba(116,168,132,0.9)' : 'rgba(255,255,255,0.38)',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 3, padding: '11px 4px',
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{ fontSize: showLabels ? 16 : 18, lineHeight: 1 }}>🌿</span>
          {showLabels && (
            <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'inherit', textAlign: 'center', lineHeight: 1.3, whiteSpace: 'nowrap' }}>
              Amazonia<br />Emprende
            </span>
          )}
        </button>

        <SizeControl />
      </div>

      <DragHandle />
    </div>
  )
}
