'use client'

import { useEffect, useState } from 'react'

interface AñoStats {
  ley2173: number | null
  conexion: number | null
  obras: number | null
  total: number
  acumulado: number
}

interface EntidadStats {
  label: string
  color: string
  proyectos: string[]
  por_anio: Record<string, AñoStats>
}

interface MetasStats {
  amazonia_emprende: EntidadStats
  bancolombia: EntidadStats
  meta_total_ae: number
  meta_total_fb: number
  anio_inicio: number
  anio_fin: number
  nombre_fase: string
}

interface Props {
  selectedYear: number
  width: number
  onClose: () => void
  isMobile: boolean
}

function fmt(n: number | null | undefined): string {
  if (n == null) return '—'
  return n.toLocaleString('es-CO')
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 9, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Avance acumulado</span>
        <span style={{ color, fontSize: 10, fontWeight: 700 }}>{pct}%</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.10)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
        <div style={{
          width: pct === 0 ? '3px' : `${pct}%`, height: '100%',
          background: `linear-gradient(90deg, ${color}80, ${color})`,
          borderRadius: 4, transition: 'width 0.7s ease',
        }} />
      </div>
    </div>
  )
}

export default function MetasPanel({ selectedYear, width, onClose, isMobile }: Props) {
  const [stats, setStats] = useState<MetasStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/metas/stats.json')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const isOpen = true
  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed', bottom: 56, left: 0, right: 0,
        height: '55dvh', zIndex: 1002,
        background: 'rgba(8,8,10,0.96)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderTop: '1px solid rgba(255,255,255,0.09)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        overflowY: 'auto',
      }
    : {
        position: 'fixed', top: 0, right: 0, width,
        height: '100dvh', zIndex: 1002,
        background: 'rgba(8,8,10,0.92)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
      }

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={{
        flexShrink: 0, padding: '14px 16px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8,
      }}>
        <div>
          <div style={{ color: '#74A884', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
            📊 Métricas · {selectedYear}
          </div>
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, lineHeight: 1.25 }}>
            Metas de restauración
          </div>
          <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 10, marginTop: 2 }}>
            Fase 1 · Plan Andino-Amazónico
          </div>
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)',
          color: 'rgba(255,255,255,0.6)', borderRadius: 8, width: 30, height: 30,
          cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>✕</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px 20px' }}>
        {loading && (
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, textAlign: 'center', paddingTop: 32 }}>
            Cargando estadísticas…
          </div>
        )}

        {stats && (() => {
          const yearKey = String(selectedYear)
          const ae = stats.amazonia_emprende
          const fb = stats.bancolombia
          const aeData = ae.por_anio[yearKey]
          const fbData = fb.por_anio[yearKey]

          return (
            <>
              {/* Amazonia Emprende */}
              <Section
                label="Amazonia Emprende"
                color={ae.color}
                emojiLabel="🌿"
                data={aeData}
                metaTotal={stats.meta_total_ae}
                proyectos={ae.proyectos}
                year={selectedYear}
                yearInicio={stats.anio_inicio}
              />

              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '14px 0' }} />

              {/* Bancolombia */}
              <Section
                label="Fundación Bancolombia"
                color={fb.color}
                emojiLabel="🏦"
                data={fbData}
                metaTotal={stats.meta_total_fb}
                proyectos={fb.proyectos}
                year={selectedYear}
                yearInicio={stats.anio_inicio + 1}
              />

              {/* Nota aclarativa */}
              <div style={{
                marginTop: 16, padding: '9px 11px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 8,
              }}>
                <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>ℹ️ Nota</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, lineHeight: 1.6 }}>
                  Los valores mostrados son metas proyectadas a {selectedYear}. El acumulado
                  incluye todos los años anteriores desde {stats.anio_inicio}.
                </div>
              </div>
            </>
          )
        })()}
      </div>
    </div>
  )
}

function Section({
  label, color, emojiLabel, data, metaTotal, proyectos, year, yearInicio,
}: {
  label: string
  color: string
  emojiLabel: string
  data: AñoStats | undefined
  metaTotal: number
  proyectos: string[]
  year: number
  yearInicio: number
}) {
  const noData = year < yearInicio || !data
  return (
    <div>
      {/* Encabezado entidad */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: `${color}22`, border: `1px solid ${color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14,
        }}>{emojiLabel}</div>
        <div>
          <div style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{label}</div>
          <div style={{ color: `${color}BB`, fontSize: 9, fontWeight: 600, letterSpacing: '0.04em' }}>
            {noData ? 'Sin actividad este año' : `Meta ${year}: ${fmt(data.total)} ha`}
          </div>
        </div>
      </div>

      {noData ? (
        <div style={{
          padding: '10px 12px', background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8,
          color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center',
        }}>
          Sin actividad en {year}
        </div>
      ) : (
        <>
          {/* KPIs principales */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
            <KpiBox label={`Meta ${year}`} value={fmt(data.total)} unit="ha" color={color} />
            <KpiBox label="Acumulado" value={fmt(data.acumulado)} unit="ha" color={color} highlight />
          </div>

          {/* Progreso acumulado hacia meta total */}
          <div style={{
            padding: '9px 11px', marginBottom: 10,
            background: `${color}0A`, border: `1px solid ${color}20`, borderRadius: 8,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>📈 Hacia la meta total</span>
              <span style={{ color, fontSize: 11, fontWeight: 700 }}>{fmt(data.acumulado)} / {fmt(metaTotal)} ha</span>
            </div>
            <MiniBar value={data.acumulado} max={metaTotal} color={color} />
          </div>

          {/* Desglose por proyecto */}
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
            Desglose por proyecto
          </div>
          {[
            { label: proyectos[0], value: data.ley2173 },
            { label: proyectos[1], value: data.conexion },
            { label: proyectos[2], value: data.obras },
          ].map(({ label: pLabel, value }) => (
            <div key={pLabel} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, lineHeight: 1.3, maxWidth: '70%' }}>{pLabel}</span>
              <span style={{
                color: value != null && value > 0 ? color : 'rgba(255,255,255,0.25)',
                fontSize: 11, fontWeight: 700,
              }}>
                {value != null ? `${fmt(value)} ha` : '—'}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

function KpiBox({ label, value, unit, color, highlight }: {
  label: string; value: string; unit: string; color: string; highlight?: boolean
}) {
  return (
    <div style={{
      background: highlight ? `${color}18` : 'rgba(255,255,255,0.05)',
      border: `1px solid ${highlight ? color + '35' : 'rgba(255,255,255,0.09)'}`,
      borderRadius: 8, padding: '8px 10px', textAlign: 'center',
    }}>
      <div style={{ color: color, fontSize: 15, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 3 }}>{unit} · {label}</div>
    </div>
  )
}
