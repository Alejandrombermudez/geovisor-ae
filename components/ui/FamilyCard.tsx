'use client'

import { useState, useEffect, useRef, Children, useCallback } from 'react'
import type { SiembraFamilia, RasFamilia, FotoCategoria, FotosPredioByCategoria } from '@/types/geovisor'

interface Props {
  familia: SiembraFamilia | RasFamilia
  category: 'siembra' | 'ras'
  accentColor: string
  onSelect?: () => void
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_ORDER: FotoCategoria[] = ['predio', 'familia', 'copa_arboles', 'tronco', 'otras']

const CATEGORY_LABELS: Record<FotoCategoria, string> = {
  predio:       'Predio',
  familia:      'Familia',
  copa_arboles: 'Copa',
  tronco:       'Tronco',
  otras:        'Otras',
}

function Field({
  label,
  value,
  accentColor,
}: {
  label: string
  value: string | number | boolean | null | undefined
  accentColor?: string
}) {
  if (value === null || value === undefined || value === '') return null
  const isBoolean = typeof value === 'boolean'
  const display = isBoolean ? (value ? 'Sí' : 'No') : String(value)
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '6px 0' }}>
      <span style={{ color: 'rgba(255,255,255,0.62)', fontSize: 12 }}>{label}</span>
      <span
        style={{
          color: isBoolean && accentColor
            ? value ? accentColor : 'rgba(255,255,255,0.35)'
            : '#fff',
          fontSize: 13,
          fontWeight: 600,
          textAlign: 'right',
          maxWidth: '58%',
          wordBreak: 'break-word',
        }}
      >
        {display}
      </span>
    </div>
  )
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  const hasContent = Children.toArray(children).some((child) => child !== null)
  if (!hasContent) return null
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ color: `${color}CC`, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ borderTop: `1px solid ${color}25`, paddingTop: 6 }}>
        {children}
      </div>
    </div>
  )
}

// ── Lightbox ─────────────────────────────────────────────────────────────────

function PhotoLightbox({ url, onClose }: { url: string; onClose: () => void }) {
  const [scale, setScale] = useState(1)
  const [pos, setPos]     = useState({ x: 0, y: 0 })
  const dragging = useRef(false)
  const last     = useRef({ x: 0, y: 0 })

  // Reset position when scale goes back to 1
  useEffect(() => { if (scale === 1) setPos({ x: 0, y: 0 }) }, [scale])

  // Escape key
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') { onClose(); setScale(1); setPos({ x: 0, y: 0 }) } }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setScale((s) => Math.min(5, Math.max(1, s - e.deltaY * 0.003)))
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale <= 1) return
    dragging.current = true
    last.current = { x: e.clientX, y: e.clientY }
  }, [scale])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return
    setPos((p) => ({ x: p.x + e.clientX - last.current.x, y: p.y + e.clientY - last.current.y }))
    last.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onMouseUp = useCallback(() => { dragging.current = false }, [])

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) { onClose(); setScale(1); setPos({ x: 0, y: 0 }) }
  }, [onClose])

  return (
    <div
      onClick={handleBackdropClick}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: scale > 1 ? 'grab' : 'zoom-out',
      }}
    >
      <img
        src={url}
        alt="Foto del predio"
        draggable={false}
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          transform: `scale(${scale}) translate(${pos.x / scale}px, ${pos.y / scale}px)`,
          transformOrigin: 'center',
          transition: dragging.current ? 'none' : 'transform 0.1s ease',
          userSelect: 'none',
          pointerEvents: 'none',
          borderRadius: 4,
        }}
      />
      <button
        onClick={() => { onClose(); setScale(1); setPos({ x: 0, y: 0 }) }}
        style={{
          position: 'absolute',
          top: 16,
          right: 20,
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff',
          borderRadius: 8,
          width: 36,
          height: 36,
          cursor: 'pointer',
          fontSize: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ✕
      </button>
      {scale > 1 && (
        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
                      background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.6)',
                      fontSize: 12, padding: '4px 12px', borderRadius: 20, pointerEvents: 'none' }}>
          {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  )
}

// ── Galería de fotos ─────────────────────────────────────────────────────────

function PhotoArea({
  photos,
  loading,
  error,
  accentColor,
}: {
  photos: FotosPredioByCategoria | null
  loading: boolean
  error: boolean
  accentColor: string
}) {
  const [selectedUrl, setSelectedUrl]   = useState<string | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const allPhotos = CATEGORY_ORDER.flatMap((cat) => photos?.[cat] ?? [])

  // Reset selection when photos change
  useEffect(() => { setSelectedUrl(null) }, [photos])

  const mainUrl = selectedUrl ?? allPhotos[0]?.url ?? null

  // ── Estado sin fotos / cargando / error
  if (loading || error || allPhotos.length === 0) {
    return (
      <div
        style={{
          aspectRatio: '16/10',
          background: `linear-gradient(135deg, ${accentColor}12 0%, rgba(0,0,0,0.25) 100%)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: 'absolute', inset: 0,
            backgroundImage:
              'repeating-linear-gradient(0deg,transparent,transparent 14px,rgba(255,255,255,0.02) 14px,rgba(255,255,255,0.02) 15px),repeating-linear-gradient(90deg,transparent,transparent 14px,rgba(255,255,255,0.02) 14px,rgba(255,255,255,0.02) 15px)',
          }}
        />
        {loading ? (
          <div
            style={{
              width: 24, height: 24,
              border: '2px solid rgba(255,255,255,0.1)',
              borderTopColor: accentColor,
              borderRadius: '50%',
              animation: 'geo-spin 0.7s linear infinite',
            }}
          />
        ) : error ? (
          <>
            <span style={{ fontSize: 18, opacity: 0.3 }}>⚠️</span>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>Error al cargar fotos</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: 22, opacity: 0.18 }}>🏡</span>
            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11, letterSpacing: '0.06em' }}>
              imagen próximamente
            </span>
          </>
        )}
      </div>
    )
  }

  // ── Galería con fotos
  return (
    <>
      {lightboxOpen && mainUrl && (
        <PhotoLightbox url={mainUrl} onClose={() => setLightboxOpen(false)} />
      )}

      <div>
        {/* Imagen principal */}
        {mainUrl && (
          <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>
            <img
              src={mainUrl}
              alt="Foto del predio"
              loading="lazy"
              decoding="async"
              onClick={() => setLightboxOpen(true)}
              style={{
                width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                cursor: 'zoom-in', transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.02)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)' }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
            {/* Zoom hint */}
            <div style={{ position: 'absolute', bottom: 6, right: 8, background: 'rgba(0,0,0,0.5)',
                          color: 'rgba(255,255,255,0.5)', fontSize: 10, padding: '2px 7px',
                          borderRadius: 10, pointerEvents: 'none', letterSpacing: '0.04em' }}>
              🔍 click para ampliar
            </div>
          </div>
        )}

        {/* Tira de miniaturas agrupada por categoría */}
        {allPhotos.length > 1 && (
          <div
            className="geo-photo-scroll"
            style={{
              display: 'flex',
              gap: 4,
              padding: '6px 8px',
              overflowX: 'auto',
              background: 'rgba(0,0,0,0.2)',
              alignItems: 'flex-end',
            }}
          >
            {CATEGORY_ORDER.flatMap((cat) => {
              const catPhotos = photos?.[cat]
              if (!catPhotos || catPhotos.length === 0) return []
              return catPhotos.map((foto, idx) => (
                <div key={foto.id} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  {idx === 0 && (
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                      {CATEGORY_LABELS[cat]}
                    </span>
                  )}
                  <button
                    onClick={() => setSelectedUrl(foto.url)}
                    style={{
                      width: 48, height: 48,
                      padding: 0, border: 'none', cursor: 'pointer',
                      borderRadius: 4,
                      overflow: 'hidden',
                      outline: selectedUrl === foto.url || (!selectedUrl && foto.url === allPhotos[0]?.url)
                        ? `2px solid ${accentColor}`
                        : '2px solid transparent',
                      transition: 'outline 0.15s ease',
                    }}
                  >
                    <img
                      src={foto.url}
                      alt={CATEGORY_LABELS[cat]}
                      loading="lazy"
                      decoding="async"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none' }}
                    />
                  </button>
                </div>
              ))
            })}
          </div>
        )}
      </div>
    </>
  )
}

// ── FamilyCard ───────────────────────────────────────────────────────────────

export default function FamilyCard({ familia, category, accentColor, onSelect }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [photos, setPhotos] = useState<FotosPredioByCategoria | null>(null)
  const [photosLoading, setPhotosLoading] = useState(false)
  const [photosError, setPhotosError] = useState(false)
  const fetchedRef = useRef(false)

  const ras = category === 'ras' ? (familia as RasFamilia) : null

  // Lazy fetch de fotos al expandir por primera vez
  useEffect(() => {
    if (!expanded || fetchedRef.current) return
    fetchedRef.current = true
    setPhotosLoading(true)
    setPhotosError(false)
    fetch(`/api/familia-fotos?id=${familia.id}&schema=${category}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((grouped: FotosPredioByCategoria) => setPhotos(grouped))
      .catch(() => setPhotosError(true))
      .finally(() => setPhotosLoading(false))
  }, [expanded, familia.id, category])

  return (
    <>
      {/* Spinner keyframe inyectado una sola vez */}
      <style>{`@keyframes geo-spin { to { transform: rotate(360deg); } }`}</style>

      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 12,
          border: `1px solid ${expanded ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.08)'}`,
          overflow: 'hidden',
          marginBottom: 8,
          boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
          transition: 'border-color 0.2s ease',
        }}
      >
        {/* ── Fila colapsada ────────────────────────────────────────── */}
        <button
          onClick={() => {
            const next = !expanded
            setExpanded(next)
            if (next) onSelect?.()
          }}
          style={{
            width: '100%', background: 'transparent', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            gap: 10, padding: '12px 14px', textAlign: 'left',
          }}
        >
          {/* Monograma */}
          <div
            style={{
              width: 34, height: 34, borderRadius: 8,
              background: `${accentColor}25`,
              border: `1px solid ${accentColor}40`,
              color: accentColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}
          >
            {(familia.nombre_propietario || '?')[0].toUpperCase()}
          </div>

          {/* Nombre + finca */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '0.01em' }}>
              {familia.nombre_propietario || 'Sin nombre'}
            </div>
            {familia.nombre_finca && (
              <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {familia.nombre_finca}
              </div>
            )}
          </div>

          {/* Municipio chip */}
          {familia.municipio && (
            <span
              style={{
                background: `${accentColor}12`,
                border: `1px solid ${accentColor}25`,
                color: `${accentColor}DD`,
                fontSize: 10, padding: '2px 7px', borderRadius: 4,
                flexShrink: 0, whiteSpace: 'nowrap', maxWidth: 88,
                overflow: 'hidden', textOverflow: 'ellipsis',
              }}
            >
              {familia.municipio}
            </span>
          )}

          {/* Chevron */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
            style={{ flexShrink: 0, color: 'rgba(255,255,255,0.28)', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
            <path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* ── Contenido expandido ───────────────────────────────────── */}
        {expanded && (
          <div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 14px' }} />

            {/* Zona de foto */}
            <PhotoArea
              photos={photos}
              loading={photosLoading}
              error={photosError}
              accentColor={accentColor}
            />

            {/* Campos de datos */}
            <div style={{ padding: '14px 16px 16px' }}>
              {/* Barra de acento */}
              <div style={{ height: 3, width: 30, background: accentColor, borderRadius: 2, marginBottom: 10, boxShadow: `0 0 8px ${accentColor}` }} />

              <Section title="Ubicación" color={accentColor}>
                <Field label="Municipio" value={familia.municipio} />
                <Field label="Vereda" value={familia.vereda} />
              </Section>

              <Section title="Hogar" color={accentColor}>
                <Field label="Adultos" value={familia.adultos} />
                <Field label="Niños" value={familia.ninos} />
                <Field label="Empleos locales" value={familia.empleos_locales} />
              </Section>

              <Section title="Uso de tierra" color={accentColor}>
                <Field label="Ha potreros" value={familia.ha_potreros} />
                <Field label="Ha bosque" value={familia.ha_bosque} />
                <Field label="Ha otras" value={familia.ha_otras} />
                <Field label="Bajo conservación" value={familia.bajo_conservacion} accentColor={accentColor} />
              </Section>

              {category === 'siembra' && (
                <Section title="Restauración" color={accentColor}>
                  <Field label="Ha restauración" value={familia.ha_restauracion} />
                  <Field label="Plan restauración" value={familia.plan_restauracion} accentColor={accentColor} />
                  <Field label="Parcelas monitoreo" value={familia.parcelas_monitoreo} />
                  <Field label="Plántulas sembradas" value={familia.plantulas_sembradas} />
                  <Field label="Especies sembradas" value={familia.especies_sembradas} />
                </Section>
              )}

              {ras && (
                <Section title="Conservación" color={accentColor}>
                  <Field label="Acuerdo conservación" value={ras.acuerdo_conservacion} accentColor={accentColor} />
                  <Field label="Árboles semilleros" value={ras.arboles_semilleros} />
                  <Field label="Especies forestales" value={ras.especies_forestales} />
                </Section>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
