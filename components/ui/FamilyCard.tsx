'use client'

import { useState, useEffect, useRef, Children } from 'react'
import type { SiembraFamilia, RasFamilia, FotoCategoria, FotosPredioByCategoria, FotoPredio } from '@/types/geovisor'
import { resizeSupabaseUrl } from '@/lib/imageUtils'

/** Intenta la URL resizada; si falla (transformaciones no habilitadas) cae a la original */
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
      onError={() => {
        if (imgSrc !== fallback) setImgSrc(fallback)
      }}
    />
  )
}

interface Props {
  familia: SiembraFamilia | RasFamilia
  category: 'siembra' | 'ras'
  accentColor: string
  onSelect?: () => void
  onOpenPhotos?: (photos: FotoPredio[], index: number) => void
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

// ── Galería de miniaturas (simplificada) ─────────────────────────────────────

function ThumbnailStrip({
  photos,
  loading,
  error,
  accentColor,
  onOpenPhotos,
}: {
  photos: FotosPredioByCategoria | null
  loading: boolean
  error: boolean
  accentColor: string
  onOpenPhotos?: (photos: FotoPredio[], index: number) => void
}) {
  const allPhotos = CATEGORY_ORDER.flatMap((cat) => photos?.[cat] ?? [])

  // ── Placeholder / estados
  if (loading || error || allPhotos.length === 0) {
    return (
      <div
        style={{
          height: 72,
          background: `linear-gradient(135deg, ${accentColor}0A 0%, rgba(0,0,0,0.18) 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {loading ? (
          <div
            style={{
              width: 20, height: 20,
              border: '2px solid rgba(255,255,255,0.08)',
              borderTopColor: accentColor,
              borderRadius: '50%',
              animation: 'geo-spin 0.7s linear infinite',
            }}
          />
        ) : error ? (
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>⚠️ Error al cargar fotos</span>
        ) : (
          <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: 11, letterSpacing: '0.06em' }}>🏡 sin fotos</span>
        )}
      </div>
    )
  }

  // ── Tira de miniaturas
  return (
    <div
      className="geo-photo-scroll"
      style={{
        display: 'flex',
        gap: 4,
        padding: '6px 8px 8px',
        overflowX: 'auto',
        background: 'rgba(0,0,0,0.18)',
        alignItems: 'flex-end',
      }}
    >
      {CATEGORY_ORDER.flatMap((cat) => {
        const catPhotos = photos?.[cat]
        if (!catPhotos || catPhotos.length === 0) return []
        return catPhotos.map((foto, catIdx) => {
          const globalIdx = allPhotos.findIndex((p) => p.id === foto.id)
          return (
            <div key={foto.id} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              {catIdx === 0 && (
                <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 9, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                  {CATEGORY_LABELS[cat]}
                </span>
              )}
              <button
                onClick={() => onOpenPhotos?.(allPhotos, globalIdx)}
                title={`Ver foto — ${CATEGORY_LABELS[cat]}`}
                style={{
                  width: 52, height: 52,
                  padding: 0, border: 'none', cursor: onOpenPhotos ? 'pointer' : 'default',
                  borderRadius: 5,
                  overflow: 'hidden',
                  outline: `1.5px solid ${accentColor}30`,
                  transition: 'outline-color 0.15s ease, transform 0.15s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.outlineColor = accentColor
                  e.currentTarget.style.transform = 'scale(1.06)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.outlineColor = `${accentColor}30`
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <FallbackImg
                  src={resizeSupabaseUrl(foto.url, 160)}
                  fallback={foto.url}
                  alt={CATEGORY_LABELS[cat]}
                  loading="lazy"
                  decoding="async"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </button>
            </div>
          )
        })
      })}
    </div>
  )
}

// ── FamilyCard ───────────────────────────────────────────────────────────────

export default function FamilyCard({ familia, category, accentColor, onSelect, onOpenPhotos }: Props) {
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
        {/* ── Cabecera (siempre visible) ────────────────────────────── */}
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

            {/* Tira de miniaturas */}
            <ThumbnailStrip
              photos={photos}
              loading={photosLoading}
              error={photosError}
              accentColor={accentColor}
              onOpenPhotos={onOpenPhotos}
            />

            {/* Campos de datos */}
            <div style={{ padding: '14px 16px 16px' }}>
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
