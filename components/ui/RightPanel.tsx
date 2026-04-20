'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type { ActiveCategory, SiembraFamilia, RasFamilia, FotoPredio } from '@/types/geovisor'
import FamilyCard from './FamilyCard'
import PhotoViewer from './PhotoViewer'

interface Props {
  activeCategory: ActiveCategory
  siembraFamilias: SiembraFamilia[]
  rasFamilias: RasFamilia[]
  onClose: () => void
  width: number
  onWidthChange: (w: number) => void
  onSelectFamilia: (id: string) => void
  isMobile: boolean
  selectedFamiliaId: string | null
}

const CATEGORY_CONFIG = {
  siembra: { title: 'Familias en restauración', color: '#74A884' },
  ras: { title: 'Familias en conservación', color: '#6898B8' },
}

const MIN_RIGHT_RATIO = 0.20
const MAX_RIGHT_RATIO = 0.80

export default function RightPanel({
  activeCategory,
  siembraFamilias,
  rasFamilias,
  onClose,
  width,
  onWidthChange,
  onSelectFamilia,
  isMobile,
  selectedFamiliaId,
}: Props) {
  const isOpen = activeCategory !== null
  const config = activeCategory ? CATEGORY_CONFIG[activeCategory] : null
  const familias = activeCategory === 'siembra' ? siembraFamilias : rasFamilias

  const [viewerState, setViewerState] = useState<{ photos: FotoPredio[]; index: number } | null>(null)
  useEffect(() => { setViewerState(null) }, [activeCategory])

  // ── Filtro por municipio ──────────────────────────────────────────────────
  const [municipioFilter, setMunicipioFilter] = useState<string | null>(null)
  useEffect(() => { setMunicipioFilter(null) }, [activeCategory])

  const municipios = useMemo(
    () =>
      [...new Set((familias as (SiembraFamilia | RasFamilia)[]).map((f) => f.municipio).filter((m): m is string => !!m))]
        .sort((a, b) => a.localeCompare(b, 'es')),
    [familias],
  )

  const displayFamilias = useMemo(
    () =>
      ([...(familias as (SiembraFamilia | RasFamilia)[])]
        .filter((f) => !municipioFilter || f.municipio === municipioFilter)
        .sort((a, b) => (a.nombre_propietario || '').localeCompare(b.nombre_propietario || '', 'es'))),
    [familias, municipioFilter],
  )

  // ── Scroll automático al card seleccionado ────────────────────────────────
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  useEffect(() => {
    if (!selectedFamiliaId) return
    const el = cardRefs.current.get(selectedFamiliaId)
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 120)
    }
  }, [selectedFamiliaId])

  // Drag-to-resize + swipe-to-close (móvil)
  const [panelHeight, setPanelHeight] = useState<number | null>(null)
  const dragStartY = useRef(0)
  const dragStartH = useRef(0)
  const isDragging = useRef(false)

  // Reset height when panel opens a new category
  useEffect(() => {
    if (isMobile && isOpen) {
      setPanelHeight(Math.round(window.innerHeight * 0.55))
    }
  }, [activeCategory, isMobile, isOpen])

  const handlePillTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY
    dragStartH.current = panelHeight ?? Math.round(window.innerHeight * 0.55)
    isDragging.current = true
  }, [panelHeight])

  const handlePillTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return
    const dy = dragStartY.current - e.touches[0].clientY
    const minH = 120
    const maxH = window.innerHeight - 72
    setPanelHeight(Math.min(maxH, Math.max(minH, dragStartH.current + dy)))
  }, [])

  const handlePillTouchEnd = useCallback(() => {
    isDragging.current = false
    if ((panelHeight ?? 999) < 140) onClose()
  }, [panelHeight, onClose])

  // Drag resize (solo escritorio)
  const startDrag = useCallback(
    (e: React.MouseEvent) => {
      if (viewerState || isMobile) return
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
    [width, onWidthChange, viewerState, isMobile],
  )

  // ── Estilos del contenedor según modo ────────────────────────────
  const mobileH = panelHeight ? `${panelHeight}px` : '55dvh'

  const containerStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed',
        bottom: 'calc(56px + env(safe-area-inset-bottom, 0px))',
        left: 0,
        right: 0,
        top: 'auto',
        width: '100%',
        height: mobileH,
        maxHeight: 'calc(100dvh - 72px)',
        zIndex: 1000,
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(28px) saturate(160%)',
        WebkitBackdropFilter: 'blur(28px) saturate(160%)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderLeft: 'none',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
        transform: isOpen ? 'translateY(0)' : 'translateY(110%)',
        transition: isDragging.current
          ? 'none'
          : 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
      }
    : {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 'auto',
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
        overflow: 'hidden',
      }

  const closeBtnStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.3)',
    width: isMobile ? 44 : 28,
    height: isMobile ? 44 : 28,
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.15s ease',
    WebkitTapHighlightColor: 'transparent',
  }

  return (
    <div style={containerStyle}>
      {/* Drag resize handle (solo escritorio) */}
      {!isMobile && !viewerState && (
        <div
          onMouseDown={startDrag}
          style={{ position: 'absolute', top: 0, left: 0, width: 5, height: '100%', cursor: 'col-resize', zIndex: 10, background: 'transparent', transition: 'background 0.15s ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = config ? `${config.color}25` : 'rgba(255,255,255,0.07)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        />
      )}

      {/* ── Modo visor de fotos ─────────────────────────────────── */}
      {viewerState && config && (
        <PhotoViewer
          photos={viewerState.photos}
          initialIndex={viewerState.index}
          accentColor={config.color}
          onClose={() => setViewerState(null)}
          isMobile={isMobile}
        />
      )}

      {/* ── Modo lista de familias ──────────────────────────────── */}
      {!viewerState && config && (
        <>
          {/* Pill handle (solo móvil) — arrastra para ajustar altura */}
          {isMobile && (
            <div
              onTouchStart={handlePillTouchStart}
              onTouchMove={handlePillTouchMove}
              onTouchEnd={handlePillTouchEnd}
              style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 6px', flexShrink: 0, cursor: 'grab', touchAction: 'none' }}
            >
              <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.28)', borderRadius: 2 }} />
            </div>
          )}

          {/* Accent line at top (solo escritorio) */}
          {!isMobile && (
            <div style={{ height: 2, background: `linear-gradient(90deg, ${config.color} 0%, ${config.color}40 60%, transparent 100%)`, flexShrink: 0 }} />
          )}

          {/* Header */}
          <div
            style={{
              padding: isMobile ? '10px 20px 12px' : '18px 20px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              flexShrink: 0,
              background: `linear-gradient(180deg, ${config.color}08 0%, transparent 100%)`,
            }}
          >
            {/* Accent line móvil (dentro del header, debajo del pill) */}
            {isMobile && (
              <div style={{ height: 2, background: `linear-gradient(90deg, ${config.color} 0%, ${config.color}40 60%, transparent 100%)`, marginBottom: 10, borderRadius: 1 }} />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: '0 0 5px', letterSpacing: '0.005em' }}>
                  {config.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 14, height: 1, background: `${config.color}80` }} />
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, letterSpacing: '0.03em' }}>
                    {familias.length}{' '}{familias.length !== 1 ? 'familias registradas' : 'familia registrada'}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                style={closeBtnStyle}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Filtros de municipio */}
          {municipios.length > 1 && (
            <div style={{
              display: 'flex', gap: 6, flexWrap: 'wrap',
              padding: isMobile ? '6px 12px 4px' : '6px 14px 4px',
              flexShrink: 0,
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              {['Todos', ...municipios].map((m) => {
                const active = m === 'Todos' ? !municipioFilter : municipioFilter === m
                return (
                  <button
                    key={m}
                    onClick={() => setMunicipioFilter(m === 'Todos' ? null : m)}
                    style={{
                      padding: '3px 10px', borderRadius: 20,
                      fontSize: 10, fontWeight: 600,
                      border: `1px solid ${active ? config!.color : 'rgba(255,255,255,0.12)'}`,
                      background: active ? `${config!.color}22` : 'transparent',
                      color: active ? config!.color : 'rgba(255,255,255,0.45)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    {m}
                  </button>
                )
              })}
            </div>
          )}

          {/* Scrollable list */}
          <div className="geo-panel-scroll" style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 12 : 14 }}>
            {displayFamilias.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, textAlign: 'center', marginTop: 48, lineHeight: 1.6 }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>🌿</div>
                {municipioFilter ? `Sin familias en ${municipioFilter}` : 'No hay familias registradas'}
              </div>
            ) : (
              displayFamilias.map((f) => (
                <div
                  key={f.id}
                  ref={(el) => {
                    if (el) cardRefs.current.set(f.id, el)
                    else cardRefs.current.delete(f.id)
                  }}
                >
                  <FamilyCard
                    familia={f}
                    category={activeCategory!}
                    accentColor={config!.color}
                    isSelected={f.id === selectedFamiliaId}
                    onSelect={() => onSelectFamilia(f.id)}
                    onOpenPhotos={(photos, idx) => setViewerState({ photos, index: idx })}
                  />
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
