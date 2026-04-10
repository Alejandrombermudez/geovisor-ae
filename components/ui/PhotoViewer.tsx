'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { FotoPredio, FotoCategoria } from '@/types/geovisor'
import { resizeSupabaseUrl } from '@/lib/imageUtils'

function FallbackImg({
  src,
  fallback,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { src: string; fallback: string }) {
  const [imgSrc, setImgSrc] = useState(src)
  useEffect(() => { setImgSrc(src) }, [src])
  return (
    <img
      {...props}
      src={imgSrc}
      onError={() => { if (imgSrc !== fallback) setImgSrc(fallback) }}
    />
  )
}

interface Props {
  photos: FotoPredio[]
  initialIndex: number
  accentColor: string
  onClose: () => void
  isMobile?: boolean
}

const CATEGORY_LABELS: Record<FotoCategoria, string> = {
  predio:       'Predio',
  familia:      'Familia',
  copa_arboles: 'Copa',
  tronco:       'Tronco',
  otras:        'Otras',
}

const MIN_ZOOM = 1
const MAX_ZOOM = 3
const ZOOM_STEP = 0.5

export default function PhotoViewer({ photos, initialIndex, accentColor, onClose, isMobile }: Props) {
  const [index, setIndex] = useState(initialIndex)
  const [zoom,  setZoom]  = useState(1)
  const [imgLoaded, setImgLoaded] = useState(false)
  const swipeStartX = useRef(0)

  // Reset zoom when navigating
  useEffect(() => { setZoom(1); setImgLoaded(false) }, [index])

  const prev = useCallback(() => setIndex((i) => (i - 1 + photos.length) % photos.length), [photos.length])
  const next = useCallback(() => setIndex((i) => (i + 1) % photos.length), [photos.length])

  // Keyboard navigation
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose, prev, next])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX
  }, [])
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - swipeStartX.current
    if (delta > 50)  prev()
    if (delta < -50) next()
  }, [prev, next])

  const photo = photos[index]
  const srcFull = resizeSupabaseUrl(photo.url, 1200, 80)
  const categoryLabel = CATEGORY_LABELS[photo.categoria] ?? photo.categoria

  const btnBase: React.CSSProperties = {
    background: 'rgba(0,0,0,0.55)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    flexShrink: 0,
  }

  return (
    <div
      style={{
        position: isMobile ? 'fixed' : 'absolute',
        inset: 0,
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: isMobile ? 2000 : 10,
      }}
    >
      {/* ── Foto ──────────────────────────────────────────────────── */}
      <div
        style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Loading skeleton */}
        {!imgLoaded && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 28, height: 28,
              border: '2px solid rgba(255,255,255,0.08)',
              borderTopColor: accentColor,
              borderRadius: '50%',
              animation: 'geo-spin 0.7s linear infinite',
            }} />
          </div>
        )}

        <FallbackImg
          key={srcFull}
          src={srcFull}
          fallback={photo.url}
          alt={categoryLabel}
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease',
            opacity: imgLoaded ? 1 : 0,
          }}
        />

        {/* Flechas de navegación (laterales) */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              style={{
                ...btnBase,
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 44, height: 60,
                fontSize: 20,
              }}
            >
              ‹
            </button>
            <button
              onClick={next}
              style={{
                ...btnBase,
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 44, height: 60,
                fontSize: 20,
              }}
            >
              ›
            </button>
          </>
        )}

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          style={{
            ...btnBase,
            position: 'absolute',
            top: 10,
            right: 10,
            width: 44, height: 44,
            fontSize: 16,
          }}
        >
          ✕
        </button>
      </div>

      {/* ── Barra inferior — contador + zoom ─────────────────────── */}
      <div
        style={{
          flexShrink: 0,
          background: 'rgba(0,0,0,0.7)',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Contador + categoría */}
        <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
          {index + 1} / {photos.length}
          {' · '}
          <span style={{ color: `${accentColor}CC` }}>{categoryLabel}</span>
        </span>

        {/* Controles de zoom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(1)))}
            disabled={zoom <= MIN_ZOOM}
            style={{
              ...btnBase,
              width: 44, height: 44,
              fontSize: 18,
              opacity: zoom <= MIN_ZOOM ? 0.3 : 1,
            }}
          >
            −
          </button>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, minWidth: 36, textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(1)))}
            disabled={zoom >= MAX_ZOOM}
            style={{
              ...btnBase,
              width: 44, height: 44,
              fontSize: 18,
              opacity: zoom >= MAX_ZOOM ? 0.3 : 1,
            }}
          >
            +
          </button>
        </div>
      </div>
      <style>{`@keyframes geo-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
