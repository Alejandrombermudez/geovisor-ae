'use client'

import { useState, useEffect, useRef } from 'react'
import type { SiembraFamilia, FotosPredioByCategoria, FotoPredio } from '@/types/geovisor'
import { resizeSupabaseUrl } from '@/lib/imageUtils'

// ── FallbackImg ───────────────────────────────────────────────────────────────
function FallbackImg({ src, fallback, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { src: string; fallback: string }) {
  const [imgSrc, setImgSrc] = useState(src)
  useEffect(() => { setImgSrc(src) }, [src])
  return <img {...props} src={imgSrc} onError={() => { if (imgSrc !== fallback) setImgSrc(fallback) }} />
}

const FOTO_ORDER = ['predio', 'copa_arboles', 'tronco', 'familia', 'otras'] as const

// ── Tira de fotos (2 visibles + nav) ─────────────────────────────────────────
function PhotoStrip({
  photos, loading, error, accentColor, onOpenPhotos,
}: {
  photos: FotosPredioByCategoria | null
  loading: boolean
  error: boolean
  accentColor: string
  onOpenPhotos?: (photos: FotoPredio[], index: number) => void
}) {
  const [startIdx, setStartIdx] = useState(0)
  const allPhotos = FOTO_ORDER.flatMap(cat => photos?.[cat] ?? [])

  if (loading) return (
    <div style={{ height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${accentColor}06` }}>
      <div style={{ width: 16, height: 16, border: `2px solid ${accentColor}25`, borderTopColor: accentColor, borderRadius: '50%', animation: 'geo-spin 0.7s linear infinite' }} />
    </div>
  )
  if (error || allPhotos.length === 0) return null

  const total   = allPhotos.length
  const visible = allPhotos.slice(startIdx, startIdx + 2)
  const canPrev = startIdx > 0
  const canNext = startIdx + 2 < total

  const NavBtn = ({ enabled, onClick, icon }: { enabled: boolean; onClick: () => void; icon: string }) => (
    <button onClick={onClick} disabled={!enabled} style={{
      width: 28, height: 28, borderRadius: 7, flexShrink: 0,
      background: enabled ? 'rgba(255,255,255,0.08)' : 'transparent',
      border: `1px solid ${enabled ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}`,
      color: enabled ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.12)',
      cursor: enabled ? 'pointer' : 'default',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 16, lineHeight: 1, fontWeight: 500, transition: 'all 0.15s ease',
    }}>{icon}</button>
  )

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 14px 12px', background: 'rgba(0,0,0,0.22)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <NavBtn enabled={canPrev} onClick={() => setStartIdx(i => Math.max(0, i - 1))} icon="‹" />
      <div style={{ display: 'flex', gap: 7, flex: 1 }}>
        {visible.map(foto => {
          const idx = allPhotos.findIndex(p => p.id === foto.id)
          return (
            <button key={foto.id} onClick={() => onOpenPhotos?.(allPhotos, idx)} style={{
              flex: 1, aspectRatio: '4/3', minWidth: 0, padding: 0, border: 'none',
              borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
              outline: `1.5px solid ${accentColor}30`, transition: 'outline-color 0.15s, transform 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.outlineColor = accentColor; e.currentTarget.style.transform = 'scale(1.02)' }}
              onMouseLeave={e => { e.currentTarget.style.outlineColor = `${accentColor}30`; e.currentTarget.style.transform = 'scale(1)' }}
            >
              <FallbackImg src={resizeSupabaseUrl(foto.url, 120, 40)} fallback={foto.url} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </button>
          )
        })}
        {visible.length < 2 && <div style={{ flex: 1, borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.06)' }} />}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0 }}>
        <NavBtn enabled={canNext} onClick={() => setStartIdx(i => Math.min(total - 1, i + 1))} icon="›" />
        {total > 1 && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', whiteSpace: 'nowrap' }}>{startIdx + 1}–{Math.min(startIdx + 2, total)}/{total}</span>}
      </div>
    </div>
  )
}

// ── Barra de diversidad ───────────────────────────────────────────────────────
function DiversityBar({ count, color }: { count: number; color: string }) {
  const level = count >= 20 ? 5 : count >= 12 ? 4 : count >= 7 ? 3 : count >= 3 ? 2 : 1
  const label = ['', 'Inicial', 'Básica', 'Moderada', 'Alta', 'Muy alta'][level]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ width: 12, height: 6, borderRadius: 2, background: i <= level ? `${color}95` : 'rgba(255,255,255,0.1)', transition: 'background 0.2s' }} />
        ))}
      </div>
      <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>{label}</span>
    </div>
  )
}

// ── KPI chip ─────────────────────────────────────────────────────────────────
function KpiChip({ icon, value, unit, highlight, color }: { icon: string; value: string; unit?: string; highlight?: boolean; color: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      background: highlight ? `${color}18` : 'rgba(255,255,255,0.06)',
      border: `1px solid ${highlight ? `${color}35` : 'rgba(255,255,255,0.1)'}`,
      borderRadius: 20, padding: '4px 10px',
      fontSize: 11, fontWeight: 700,
      color: highlight ? color : 'rgba(255,255,255,0.72)',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 12 }}>{icon}</span>
      {value}{unit && <span style={{ fontWeight: 400, fontSize: 10, color: 'inherit', opacity: 0.75 }}>{unit}</span>}
    </div>
  )
}

// ── Row de campo ──────────────────────────────────────────────────────────────
function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: 13, fontWeight: 400 }}>{String(value)}</span>
    </div>
  )
}

// ── SiembraCard ───────────────────────────────────────────────────────────────

interface Props {
  familia: SiembraFamilia
  accentColor: string
  isSelected?: boolean
  onSelect?: () => void
  onOpenPhotos?: (photos: FotoPredio[], index: number) => void
}

export default function SiembraCard({ familia, accentColor, isSelected = false, onSelect, onOpenPhotos }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [photos, setPhotos] = useState<FotosPredioByCategoria | null>(null)
  const [photosLoading, setPhotosLoading] = useState(false)
  const [photosError, setPhotosError] = useState(false)
  const fetchedRef = useRef(false)

  const title = familia.nombre_finca || familia.nombre_propietario || 'Predio sin nombre'
  const location = [familia.municipio, familia.vereda].filter(Boolean).join(' · ')

  const plantulas = familia.plantulas_sembradas
  const ha        = familia.ha_restauracion
  const especies  = familia.especies_sembradas
  const parcelas  = familia.parcelas_monitoreo
  const hasPlan   = !!familia.plan_restauracion

  const hasMon = (parcelas ?? 0) > 0
  const monStatus = hasMon ? 'Activo' : hasPlan ? 'En desarrollo' : 'Planificación'
  const monColor  = hasMon ? accentColor : hasPlan ? '#F59E0B' : 'rgba(255,255,255,0.35)'

  useEffect(() => {
    if (!expanded || fetchedRef.current) return
    fetchedRef.current = true
    setPhotosLoading(true)
    fetch(`/api/familia-fotos?id=${familia.id}&schema=siembra`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: FotosPredioByCategoria) => setPhotos(d))
      .catch(() => setPhotosError(true))
      .finally(() => setPhotosLoading(false))
  }, [expanded, familia.id])

  const fmt = (n: number | null | undefined, decimals = 0) =>
    n == null ? null : n.toLocaleString('es-CO', { maximumFractionDigits: decimals })

  return (
    <>
      <style>{`@keyframes geo-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        background: isSelected ? `${accentColor}0D` : 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        border: `1px solid ${isSelected ? `${accentColor}45` : expanded ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)'}`,
        borderLeft: isSelected ? `3px solid ${accentColor}` : undefined,
        overflow: 'hidden', marginBottom: 8,
        boxShadow: isSelected ? `0 4px 20px rgba(0,0,0,0.4), 0 0 0 0 transparent` : '0 2px 12px rgba(0,0,0,0.28)',
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}>
        {/* ── Cabecera ───────────────────────────────────────────────────── */}
        <button onClick={() => { const n = !expanded; setExpanded(n); if (n) onSelect?.() }} style={{
          width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
          padding: '13px 14px 11px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 9,
        }}>
          {/* Fila 1: nombre + chip municipio + chevron */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: accentColor, boxShadow: `0 0 7px ${accentColor}`, flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '0.01em' }}>{title}</div>
              {location && <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 10, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{location}</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {/* Monitor badge */}
              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: `${monColor}18`, border: `1px solid ${monColor}35`, color: monColor, letterSpacing: '0.03em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                {monStatus}
              </span>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ color: 'rgba(255,255,255,0.25)', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', flexShrink: 0 }}>
                <path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Fila 2: KPI chips */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {plantulas != null && plantulas > 0 && (
              <KpiChip icon="🌱" value={fmt(plantulas)!} highlight color={accentColor} />
            )}
            {ha != null && ha > 0 && (
              <KpiChip icon="🗺️" value={fmt(ha, 1)!} unit=" ha" color={accentColor} />
            )}
            {especies != null && especies > 0 && (
              <KpiChip icon="🌿" value={String(especies)} unit=" sp." color={accentColor} />
            )}
            {parcelas != null && parcelas > 0 && (
              <KpiChip icon="📍" value={String(parcelas)} unit=" parcs." color={accentColor} />
            )}
          </div>
        </button>

        {/* ── Contenido expandido ────────────────────────────────────────── */}
        {expanded && (
          <div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 14px' }} />

            {/* Fotos de campo */}
            <PhotoStrip photos={photos} loading={photosLoading} error={photosError} accentColor={accentColor} onOpenPhotos={onOpenPhotos} />

            <div style={{ padding: '14px 16px 16px' }}>
              <div style={{ height: 3, width: 28, background: accentColor, borderRadius: 2, marginBottom: 12, boxShadow: `0 0 8px ${accentColor}80` }} />

              {/* Indicadores de inversión */}
              <div style={{ color: `${accentColor}CC`, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 6 }}>
                Indicadores del predio
              </div>
              <div style={{ borderTop: `1px solid ${accentColor}22`, paddingTop: 4, marginBottom: 14 }}>
                <Row label="Plántulas sembradas" value={fmt(plantulas)} />
                <Row label="Ha en restauración" value={ha != null ? `${fmt(ha, 1)} ha` : null} />
                <Row label="Especies nativas" value={fmt(especies)} />
                <Row label="Parcelas de monitoreo" value={fmt(parcelas)} />
              </div>

              {/* Biodiversidad */}
              {(especies != null && especies > 0) && (
                <>
                  <div style={{ color: `${accentColor}CC`, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 6 }}>
                    Biodiversidad
                  </div>
                  <div style={{ borderTop: `1px solid ${accentColor}22`, paddingTop: 10, marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Índice de diversidad</span>
                      <DiversityBar count={especies} color={accentColor} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Estado de monitoreo</span>
                      <span style={{ color: monColor, fontSize: 12, fontWeight: 600 }}>{monStatus}</span>
                    </div>
                    {hasPlan && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Plan de restauración</span>
                        <span style={{ color: accentColor, fontSize: 12, fontWeight: 600 }}>✓ Activo</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Garantía de monitoreo */}
              <div style={{ background: `${accentColor}0A`, border: `1px solid ${accentColor}20`, borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ color: accentColor, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
                  Garantía de seguimiento
                </div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, lineHeight: 1.6 }}>
                  Este predio cuenta con registro geoespacial verificable en el geovisor.
                  {hasMon ? ` Monitoreo activo en ${parcelas} parcela${parcelas !== 1 ? 's' : ''} de campo.` : ''}
                  {hasPlan ? ' Plan de restauración técnica disponible.' : ''}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
