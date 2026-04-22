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
      onError={() => { if (imgSrc !== fallback) setImgSrc(fallback) }}
    />
  )
}

interface Props {
  familia: SiembraFamilia | RasFamilia
  category: 'siembra' | 'ras'
  accentColor: string
  onSelect?: () => void
  onOpenPhotos?: (photos: FotoPredio[], index: number) => void
  isSelected?: boolean
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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0' }}>
      <span style={{
        color: 'rgba(255,255,255,0.45)',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        flexShrink: 0,
        marginRight: 8,
      }}>
        {label}
      </span>
      <span style={{
        color: isBoolean && accentColor
          ? (value ? accentColor : 'rgba(255,255,255,0.35)')
          : 'rgba(255,255,255,0.88)',
        fontSize: 13,
        fontWeight: 400,
        textAlign: 'right',
        maxWidth: '60%',
        wordBreak: 'break-word',
      }}>
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
      <div style={{
        color: `${color}CC`,
        fontSize: 11, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.09em',
        marginBottom: 6,
      }}>
        {title}
      </div>
      <div style={{ borderTop: `1px solid ${color}25`, paddingTop: 6 }}>
        {children}
      </div>
    </div>
  )
}

// ── Galería de miniaturas (2 visibles + navegación) ──────────────────────────

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
  const [startIdx, setStartIdx] = useState(0)

  const allPhotos = CATEGORY_ORDER.flatMap((cat) => photos?.[cat] ?? [])

  // Mientras carga: mostrar spinner compacto
  if (loading) {
    return (
      <div style={{
        height: 62,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, ${accentColor}08 0%, rgba(0,0,0,0.12) 100%)`,
      }}>
        <div style={{
          width: 16, height: 16,
          border: '2px solid rgba(255,255,255,0.08)',
          borderTopColor: accentColor,
          borderRadius: '50%',
          animation: 'geo-spin 0.7s linear infinite',
        }} />
      </div>
    )
  }

  // Sin fotos o con error: no renderizar nada
  if (error || allPhotos.length === 0) return null

  const total     = allPhotos.length
  const canPrev   = startIdx > 0
  const canNext   = startIdx + 2 < total
  const visible   = allPhotos.slice(startIdx, startIdx + 2)

  const navBtn = (enabled: boolean, onClick: () => void, icon: string, title: string) => (
    <button
      onClick={onClick} disabled={!enabled} title={title}
      style={{
        width: 26, height: 26, borderRadius: 6, flexShrink: 0,
        background: enabled ? 'rgba(255,255,255,0.08)' : 'transparent',
        border: `1px solid ${enabled ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}`,
        color: enabled ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.12)',
        cursor: enabled ? 'pointer' : 'default',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15, lineHeight: 1, fontWeight: 500,
        transition: 'all 0.15s ease',
      }}
    >{icon}</button>
  )

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '8px 12px 10px',
      background: 'rgba(0,0,0,0.2)',
      borderTop: '1px solid rgba(255,255,255,0.05)',
    }}>
      {navBtn(canPrev, () => setStartIdx(i => Math.max(0, i - 1)), '‹', 'Foto anterior')}

      {/* 2 miniaturas — calidad reducida para performance */}
      <div style={{ display: 'flex', gap: 6, flex: 1 }}>
        {visible.map((foto) => {
          const globalIdx = allPhotos.findIndex((p) => p.id === foto.id)
          return (
            <button
              key={foto.id}
              onClick={() => onOpenPhotos?.(allPhotos, globalIdx)}
              style={{
                flex: 1, aspectRatio: '1', minWidth: 0,
                padding: 0, border: 'none',
                borderRadius: 6, overflow: 'hidden',
                cursor: 'pointer',
                outline: `1.5px solid ${accentColor}35`,
                transition: 'outline-color 0.15s ease, transform 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.outlineColor = accentColor; e.currentTarget.style.transform = 'scale(1.03)' }}
              onMouseLeave={e => { e.currentTarget.style.outlineColor = `${accentColor}35`; e.currentTarget.style.transform = 'scale(1)' }}
            >
              <FallbackImg
                src={resizeSupabaseUrl(foto.url, 80, 30)}
                fallback={foto.url}
                alt=""
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </button>
          )
        })}
        {/* Celda vacía si solo hay 1 foto visible */}
        {visible.length < 2 && (
          <div style={{ flex: 1, borderRadius: 6, background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)' }} />
        )}
      </div>

      {/* Flecha siguiente + contador */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {navBtn(canNext, () => setStartIdx(i => Math.min(total - 1, i + 1)), '›', 'Foto siguiente')}
        {total > 1 && (
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
            {startIdx + 1}–{Math.min(startIdx + 2, total)}/{total}
          </span>
        )}
      </div>
    </div>
  )
}

// ── FamilyCard ───────────────────────────────────────────────────────────────

export default function FamilyCard({
  familia, category, accentColor, onSelect, onOpenPhotos, isSelected = false,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const [photos, setPhotos]     = useState<FotosPredioByCategoria | null>(null)
  const [photosLoading, setPhotosLoading] = useState(false)
  const [photosError,   setPhotosError]   = useState(false)
  const fetchedRef = useRef(false)

  const ras = category === 'ras' ? (familia as RasFamilia) : null

  // Título uniforme: nombre_finca → nombre_propietario
  const title    = familia.nombre_finca || familia.nombre_propietario || 'Sin nombre'
  const subtitle = familia.nombre_finca ? familia.nombre_propietario : null

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
          background: isSelected ? `${accentColor}0D` : 'rgba(255,255,255,0.03)',
          borderRadius: 12,
          border: `1px solid ${
            isSelected
              ? `${accentColor}45`
              : expanded
                ? 'rgba(255,255,255,0.13)'
                : 'rgba(255,255,255,0.08)'
          }`,
          borderLeft: isSelected ? `3px solid ${accentColor}` : undefined,
          overflow: 'hidden',
          marginBottom: 8,
          boxShadow: isSelected
            ? `0 2px 16px rgba(0,0,0,0.35), 0 0 0 0 transparent`
            : '0 2px 12px rgba(0,0,0,0.3)',
          transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        }}
      >
        {/* ── Cabecera ────────────────────────────────────────────────── */}
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
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: isSelected ? `${accentColor}30` : `${accentColor}20`,
            border: `1px solid ${accentColor}${isSelected ? '55' : '35'}`,
            color: accentColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, flexShrink: 0,
            transition: 'background 0.2s ease',
          }}>
            {(title[0] || '?').toUpperCase()}
          </div>

          {/* Título y subtítulo */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              color: '#fff', fontSize: 13, fontWeight: 600,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              letterSpacing: '0.01em',
            }}>
              {title}
            </div>
            {subtitle && (
              <div style={{
                color: 'rgba(255,255,255,0.4)', fontSize: 11,
                marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {subtitle}
              </div>
            )}
          </div>

          {/* Municipio chip */}
          {familia.municipio && (
            <span style={{
              background: `${accentColor}12`,
              border: `1px solid ${accentColor}25`,
              color: `${accentColor}DD`,
              fontSize: 10, padding: '2px 7px', borderRadius: 4,
              flexShrink: 0, whiteSpace: 'nowrap', maxWidth: 88,
              overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {familia.municipio}
            </span>
          )}

          {/* Chevron */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
            style={{
              flexShrink: 0,
              color: 'rgba(255,255,255,0.28)',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}>
            <path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* ── Contenido expandido ──────────────────────────────────────── */}
        {expanded && (
          <div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 14px' }} />

            {/* Miniaturas (ocultas si no hay fotos) */}
            <ThumbnailStrip
              photos={photos}
              loading={photosLoading}
              error={photosError}
              accentColor={accentColor}
              onOpenPhotos={onOpenPhotos}
            />

            {/* Campos de datos */}
            <div style={{ padding: '14px 16px 16px' }}>
              <div style={{
                height: 3, width: 28, background: accentColor, borderRadius: 2,
                marginBottom: 10, boxShadow: `0 0 8px ${accentColor}80`,
              }} />

              <Section title="Ubicación" color={accentColor}>
                <Field label="Municipio"    value={familia.municipio} />
                <Field label="Vereda"       value={familia.vereda} />
              </Section>

              <Section title="Hogar" color={accentColor}>
                <Field label="Adultos"         value={familia.adultos} />
                <Field label="Niños"           value={familia.ninos} />
                <Field label="Empleos locales" value={familia.empleos_locales} />
              </Section>

              <Section title="Uso de tierra" color={accentColor}>
                <Field label="Ha potreros"        value={familia.ha_potreros} />
                <Field label="Ha bosque"          value={familia.ha_bosque} />
                <Field label="Ha otras"           value={familia.ha_otras} />
                <Field label="Bajo conservación"  value={familia.bajo_conservacion} accentColor={accentColor} />
              </Section>

              {category === 'siembra' && (
                <Section title="Restauración" color={accentColor}>
                  <Field label="Ha restauración"    value={familia.ha_restauracion} />
                  <Field label="Plan restauración"  value={familia.plan_restauracion} accentColor={accentColor} />
                  <Field label="Parcelas monitoreo" value={familia.parcelas_monitoreo} />
                  <Field label="Plántulas sembradas" value={familia.plantulas_sembradas} />
                  <Field label="Especies sembradas"  value={familia.especies_sembradas} />
                </Section>
              )}

              {ras && (
                <Section title="Conservación" color={accentColor}>
                  <Field label="Acuerdo conservación" value={ras.acuerdo_conservacion} accentColor={accentColor} />
                  <Field label="Árboles semilleros"   value={ras.arboles_semilleros} />
                  <Field label="Especies forestales"  value={ras.especies_forestales} />
                </Section>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
