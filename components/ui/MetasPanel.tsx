'use client'

import { useEffect, useState } from 'react'

interface AñoStats {
  ley2173: number | null
  conexion: number | null
  obras: number | null
  total: number
  acumulado: number
}

interface MetasStats {
  amazonia_emprende: {
    label: string; color: string; proyectos: string[]
    por_anio: Record<string, AñoStats>
  }
  bancolombia: {
    label: string; color: string; proyectos: string[]
    por_anio: Record<string, AñoStats>
  }
  meta_total_ae: number
  meta_total_fb: number
  anio_inicio: number
  anio_fin: number
}

interface Props {
  selectedYear: number
  width: number
  onClose: () => void
  isMobile: boolean
}

const YEARS = [2026, 2027, 2028, 2029, 2030, 2031, 2032]
const AE_COLOR = '#74A884'
const FB_COLOR = '#6898B8'
const ACCENT   = '#FAB758'

function fmt(n: number | null | undefined): string {
  if (n == null) return '—'
  return n.toLocaleString('es-CO')
}

// ── Gráfico de barras SVG ─────────────────────────────────────────────────────

function BarChart({
  data, aeTotal, fbTotal,
}: {
  data: { year: number; ae: number; fb: number }[]
  aeTotal: number
  fbTotal: number
}) {
  const maxVal = Math.max(...data.map(d => d.ae), ...data.map(d => d.fb), 1)
  const H = 120
  const barW = 18
  const gap  = 4
  const groupW = barW * 2 + gap + 8
  const W = data.length * groupW + 16
  const pad = { top: 12, bottom: 28, left: 8, right: 8 }
  const chartH = H - pad.top - pad.bottom

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
        {data.map((d, i) => {
          const x0 = pad.left + i * groupW
          const aeH  = d.ae > 0 ? Math.max(3, (d.ae / maxVal) * chartH) : 0
          const fbH  = d.fb > 0 ? Math.max(3, (d.fb / maxVal) * chartH) : 0
          const aeY  = pad.top + chartH - aeH
          const fbY  = pad.top + chartH - fbH
          const labelY = pad.top + chartH + 14
          return (
            <g key={d.year}>
              {/* AE bar */}
              <rect x={x0} y={aeY} width={barW} height={aeH}
                fill={AE_COLOR} fillOpacity={0.85} rx={2} />
              {/* FB bar */}
              <rect x={x0 + barW + gap} y={fbY} width={barW} height={fbH}
                fill={FB_COLOR} fillOpacity={0.85} rx={2} />
              {/* Year label */}
              <text x={x0 + barW + gap / 2} y={labelY}
                textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.45)"
                fontFamily="system-ui">
                {String(d.year).slice(2)}
              </text>
            </g>
          )
        })}
        {/* Baseline */}
        <line x1={pad.left - 2} x2={W - pad.right}
          y1={pad.top + chartH} y2={pad.top + chartH}
          stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
      </svg>
      {/* Leyenda */}
      <div style={{ display: 'flex', gap: 16, marginTop: 4, paddingLeft: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: AE_COLOR }} />
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>AE · {fmt(aeTotal)} ha total</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: FB_COLOR }} />
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>FB · {fmt(fbTotal)} ha total</span>
        </div>
      </div>
    </div>
  )
}

// ── Barra de progreso ────────────────────────────────────────────────────────

function ProgBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Avance acumulado</span>
        <span style={{ color, fontSize: 12, fontWeight: 700 }}>{pct}%</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.10)', borderRadius: 4, height: 7, overflow: 'hidden' }}>
        <div style={{
          width: pct === 0 ? '3px' : `${pct}%`, height: '100%',
          background: `linear-gradient(90deg,${color}70,${color})`,
          borderRadius: 4, transition: 'width 0.7s ease',
        }} />
      </div>
    </div>
  )
}

// ── Sección por entidad ──────────────────────────────────────────────────────

function EntitySection({
  label, color, emoji, data, metaTotal, proyectos, year, yearInicio,
}: {
  label: string; color: string; emoji: string
  data: AñoStats | undefined
  metaTotal: number; proyectos: string[]
  year: number; yearInicio: number
}) {
  const noData = year < yearInicio || !data
  return (
    <div style={{ marginBottom: 4 }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${color}22`, border: `1px solid ${color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          flexShrink: 0,
        }}>{emoji}</div>
        <div>
          <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{label}</div>
          <div style={{ color: `${color}CC`, fontSize: 12 }}>
            {noData ? 'Sin actividad este año' : `Meta ${year}: ${fmt(data!.total)} ha`}
          </div>
        </div>
      </div>

      {noData ? (
        <div style={{
          padding: '14px 16px', background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10,
          color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center',
        }}>
          Sin actividad en {year}
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            {[
              { label: `Meta ${year}`, value: data!.total },
              { label: 'Acumulado', value: data!.acumulado, highlight: true },
            ].map(({ label: kl, value, highlight }) => (
              <div key={kl} style={{
                background: highlight ? `${color}18` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${highlight ? color + '38' : 'rgba(255,255,255,0.09)'}`,
                borderRadius: 10, padding: '12px 14px', textAlign: 'center',
              }}>
                <div style={{ color, fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{fmt(value)}</div>
                <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
                  ha · {kl}
                </div>
              </div>
            ))}
          </div>

          {/* Progreso total */}
          <div style={{
            padding: '11px 14px', marginBottom: 12,
            background: `${color}0A`, border: `1px solid ${color}20`, borderRadius: 10,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>📈 Hacia la meta total</span>
              <span style={{ color, fontSize: 12, fontWeight: 700 }}>{fmt(data!.acumulado)} / {fmt(metaTotal)} ha</span>
            </div>
            <ProgBar value={data!.acumulado} max={metaTotal} color={color} />
          </div>

          {/* Desglose proyectos */}
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
            Desglose por proyecto
          </div>
          {[
            [proyectos[0], data!.ley2173],
            [proyectos[1], data!.conexion],
            [proyectos[2], data!.obras],
          ].map(([pLabel, val]) => (
            <div key={String(pLabel)} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, maxWidth: '68%', lineHeight: 1.35 }}>
                {pLabel}
              </span>
              <span style={{
                color: (val != null && Number(val) > 0) ? color : 'rgba(255,255,255,0.25)',
                fontSize: 13, fontWeight: 700,
              }}>
                {val != null ? `${fmt(Number(val))} ha` : '—'}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function MetasPanel({ selectedYear, width, onClose, isMobile }: Props) {
  const [stats, setStats] = useState<MetasStats | null>(null)

  useEffect(() => {
    fetch('/metas/stats.json').then(r => r.json()).then(setStats).catch(() => null)
  }, [])

  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed', bottom: 56, left: 0, right: 0,
        height: '65dvh', zIndex: 1002,
        background: 'rgba(8,8,10,0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.09)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflowY: 'auto',
      }
    : {
        position: 'fixed', top: 0, right: 0, width,
        height: '100dvh', zIndex: 1002,
        background: 'rgba(8,8,10,0.94)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '-6px 0 32px rgba(0,0,0,0.55)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
      }

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={{
        flexShrink: 0, padding: '16px 20px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8,
      }}>
        <div>
          <div style={{ color: ACCENT, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
            📊 Métricas · {selectedYear}
          </div>
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>
            Metas de restauración
          </div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 3 }}>
            Fase 1 · Plan Andino-Amazónico del Caquetá
          </div>
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.65)', borderRadius: 8, width: 34, height: 34,
          cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'background 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
        >✕</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px 28px' }}>

        {!stats && (
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, textAlign: 'center', paddingTop: 48 }}>
            Cargando estadísticas…
          </div>
        )}

        {stats && (() => {
          const yk = String(selectedYear)
          const ae = stats.amazonia_emprende
          const fb = stats.bancolombia

          // Datos para el gráfico — series acumuladas por año
          const chartData = YEARS.map(y => {
            const aeD = ae.por_anio[String(y)]
            const fbD = fb.por_anio[String(y)]
            return {
              year: y,
              ae: aeD?.total ?? 0,
              fb: fbD?.total ?? 0,
            }
          })

          return (
            <>
              {/* ── Gráfico comparativo ── */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                  Meta anual por entidad (ha)
                </div>
                <BarChart
                  data={chartData}
                  aeTotal={stats.meta_total_ae}
                  fbTotal={stats.meta_total_fb}
                />
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '4px 0 20px' }} />

              {/* ── Amazonia Emprende ── */}
              <EntitySection
                label="Amazonia Emprende"
                color={AE_COLOR}
                emoji="🌿"
                data={ae.por_anio[yk]}
                metaTotal={stats.meta_total_ae}
                proyectos={ae.proyectos}
                year={selectedYear}
                yearInicio={stats.anio_inicio}
              />

              <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '20px 0' }} />

              {/* ── Bancolombia ── */}
              <EntitySection
                label="Fundación Bancolombia"
                color={FB_COLOR}
                emoji="🏦"
                data={fb.por_anio[yk]}
                metaTotal={stats.meta_total_fb}
                proyectos={fb.proyectos}
                year={selectedYear}
                yearInicio={stats.anio_inicio + 1}
              />

              {/* Nota */}
              <div style={{
                marginTop: 20, padding: '12px 14px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
              }}>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>ℹ️ Nota</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 1.65 }}>
                  Valores proyectados a {selectedYear}. El acumulado suma todos los años desde {stats.anio_inicio}.
                  Bancolombia inicia actividades en {stats.anio_inicio + 1}.
                </div>
              </div>
            </>
          )
        })()}
      </div>
    </div>
  )
}
