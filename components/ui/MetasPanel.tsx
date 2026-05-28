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

type ViewMode = 'ambas' | 'ae' | 'fb'

const YEARS = [2026, 2027, 2028, 2029, 2030, 2031, 2032]
const AE_COLOR = '#74A884'
const FB_COLOR = '#6898B8'
const ACCENT   = '#FAB758'

function fmt(n: number | null | undefined): string {
  if (n == null) return '—'
  return n.toLocaleString('es-CO')
}

// ── Gráfico — escala porcentual normalizada para cada entidad ─────────────────
// Ambas entidades se muestran en 0-100 % de su propia meta total,
// eliminando la distorsión de escala AE (41 210 ha) vs FB (3 732 ha).

function DualProgressChart({
  aeByYear, fbByYear, aeTotal, fbTotal, mode, selectedYear,
}: {
  aeByYear: Record<string, AñoStats>
  fbByYear: Record<string, AñoStats>
  aeTotal: number
  fbTotal: number
  mode: ViewMode
  selectedYear: number
}) {
  const H      = 140
  const barW   = mode === 'ambas' ? 14 : 20
  const gap    = mode === 'ambas' ? 4  : 0
  const groupW = mode === 'ambas' ? barW * 2 + gap + 10 : barW + 14
  const W      = YEARS.length * groupW + 42
  const pad    = { top: 16, bottom: 32, left: 30, right: 8 }
  const chartH = H - pad.top - pad.bottom

  const yticks = [0, 25, 50, 75, 100]

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>

        {/* Y-axis grid */}
        {yticks.map(pct => {
          const y = pad.top + chartH - (pct / 100) * chartH
          return (
            <g key={pct}>
              <line
                x1={pad.left - 4} x2={W - pad.right} y1={y} y2={y}
                stroke={pct === 100 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)'}
                strokeWidth={1}
                strokeDasharray={pct === 100 ? undefined : '3 3'}
              />
              <text x={pad.left - 6} y={y + 3.5}
                textAnchor="end" fontSize={8}
                fill="rgba(255,255,255,0.28)" fontFamily="system-ui">
                {pct}%
              </text>
            </g>
          )
        })}

        {YEARS.map((year, i) => {
          const yk     = String(year)
          const aeD    = aeByYear[yk]
          const fbD    = fbByYear[yk]
          const aePct  = aeD ? Math.min(100, (aeD.acumulado / aeTotal) * 100) : 0
          const fbPct  = fbD ? Math.min(100, (fbD.acumulado / fbTotal) * 100) : 0
          const aeBarH = aePct > 0 ? Math.max(2, (aePct / 100) * chartH) : 0
          const fbBarH = fbPct > 0 ? Math.max(2, (fbPct / 100) * chartH) : 0
          const isCurrent = year === selectedYear

          // X positions — single mode centers the bar in the group slot
          const x0   = pad.left + i * groupW
          const xAE  = mode === 'ambas' ? x0 : x0 + (groupW - barW) / 2
          const xFB  = mode === 'ambas' ? x0 + barW + gap : x0 + (groupW - barW) / 2
          const lblX = mode === 'ambas' ? x0 + barW + gap / 2 : x0 + groupW / 2
          const lblY = pad.top + chartH + 16

          return (
            <g key={year}>
              {/* AE bar */}
              {(mode === 'ae' || mode === 'ambas') && aeBarH > 0 && (
                <rect
                  x={xAE} y={pad.top + chartH - aeBarH}
                  width={barW} height={aeBarH}
                  fill={AE_COLOR} fillOpacity={isCurrent ? 1 : 0.65} rx={2}
                />
              )}
              {/* FB bar */}
              {(mode === 'fb' || mode === 'ambas') && fbBarH > 0 && (
                <rect
                  x={xFB} y={pad.top + chartH - fbBarH}
                  width={barW} height={fbBarH}
                  fill={FB_COLOR} fillOpacity={isCurrent ? 1 : 0.65} rx={2}
                />
              )}

              {/* Percentage label above bar (solo en vistas individuales) */}
              {mode === 'ae' && aeBarH > 0 && (
                <text
                  x={xAE + barW / 2} y={pad.top + chartH - aeBarH - 3}
                  textAnchor="middle" fontSize={7}
                  fill={isCurrent ? AE_COLOR : `${AE_COLOR}88`}
                  fontFamily="system-ui" fontWeight={isCurrent ? '700' : '400'}>
                  {Math.round(aePct)}%
                </text>
              )}
              {mode === 'fb' && fbBarH > 0 && (
                <text
                  x={xFB + barW / 2} y={pad.top + chartH - fbBarH - 3}
                  textAnchor="middle" fontSize={7}
                  fill={isCurrent ? FB_COLOR : `${FB_COLOR}88`}
                  fontFamily="system-ui" fontWeight={isCurrent ? '700' : '400'}>
                  {Math.round(fbPct)}%
                </text>
              )}

              {/* Current-year highlight ring */}
              {isCurrent && (
                <rect
                  x={x0 - 2} y={pad.top - 4}
                  width={groupW - 6} height={chartH + 6}
                  fill="none"
                  stroke={ACCENT} strokeWidth={1} strokeOpacity={0.35}
                  rx={3} strokeDasharray="3 2"
                />
              )}

              {/* Year label */}
              <text x={lblX} y={lblY}
                textAnchor="middle" fontSize={9}
                fill={isCurrent ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.35)'}
                fontFamily="system-ui"
                fontWeight={isCurrent ? '700' : '400'}>
                {String(year).slice(2)}
              </text>
            </g>
          )
        })}

        {/* Baseline */}
        <line
          x1={pad.left - 4} x2={W - pad.right}
          y1={pad.top + chartH} y2={pad.top + chartH}
          stroke="rgba(255,255,255,0.15)" strokeWidth={1}
        />
      </svg>

      {/* Leyenda */}
      <div style={{ display: 'flex', gap: 16, marginTop: 6, paddingLeft: pad.left }}>
        {(mode === 'ae' || mode === 'ambas') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: AE_COLOR }} />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
              AE · {fmt(aeTotal)} ha total
            </span>
          </div>
        )}
        {(mode === 'fb' || mode === 'ambas') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: FB_COLOR }} />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
              FB · {fmt(fbTotal)} ha total
            </span>
          </div>
        )}
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 11,
          background: `${color}22`, border: `1.5px solid ${color}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          flexShrink: 0, boxShadow: `0 0 0 4px ${color}0C`,
        }}>{emoji}</div>
        <div>
          <div style={{ color: '#fff', fontSize: 17, fontWeight: 800 }}>{label}</div>
          <div style={{ color: `${color}CC`, fontSize: 14, marginTop: 2 }}>
            {noData ? 'Sin actividad este año' : `Meta ${year}: ${fmt(data!.total)} ha`}
          </div>
        </div>
      </div>

      {noData ? (
        <div style={{
          padding: '16px', background: 'rgba(255,255,255,0.03)',
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
              { label: `Meta ${year}`, value: data!.total, highlight: false },
              { label: 'Acumulado',    value: data!.acumulado, highlight: true },
            ].map(({ label: kl, value, highlight }) => (
              <div key={kl} style={{
                background: highlight ? `${color}1A` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${highlight ? color + '40' : 'rgba(255,255,255,0.09)'}`,
                borderRadius: 10, padding: '16px 10px', textAlign: 'center',
              }}>
                <div style={{ color, fontSize: 28, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' }}>
                  {fmt(value)}
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.42)', fontSize: 11,
                  textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 6,
                }}>
                  ha · {kl}
                </div>
              </div>
            ))}
          </div>

          {/* Progreso hacia la meta total */}
          <div style={{
            padding: '12px 14px', marginBottom: 12,
            background: `${color}0C`, border: `1px solid ${color}22`, borderRadius: 10,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Hacia la meta total</span>
              <span style={{ color, fontSize: 13, fontWeight: 700 }}>
                {fmt(data!.acumulado)} / {fmt(metaTotal)} ha
              </span>
            </div>
            <ProgBar value={data!.acumulado} max={metaTotal} color={color} />
          </div>

          {/* Desglose por proyecto */}
          <div style={{
            color: 'rgba(255,255,255,0.35)', fontSize: 10,
            textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8,
          }}>
            Desglose por proyecto
          </div>
          {[
            [proyectos[0], data!.ley2173],
            [proyectos[1], data!.conexion],
            [proyectos[2], data!.obras],
          ].map(([pLabel, val]) => (
            <div key={String(pLabel)} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <span style={{
                color: 'rgba(255,255,255,0.6)', fontSize: 13,
                maxWidth: '68%', lineHeight: 1.35,
              }}>
                {pLabel}
              </span>
              <span style={{
                color: (val != null && Number(val) > 0) ? color : 'rgba(255,255,255,0.25)',
                fontSize: 14, fontWeight: 700,
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
  const [stats,    setStats]    = useState<MetasStats | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('ambas')

  useEffect(() => {
    fetch('/metas/stats.json').then(r => r.json()).then(setStats).catch(() => null)
  }, [])

  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed', bottom: 56, left: 0, right: 0,
        height: '68dvh', zIndex: 1002,
        background: 'rgba(8,8,10,0.97)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.09)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflowY: 'auto',
      }
    : {
        position: 'fixed', top: 0, right: 0, width,
        height: '100dvh', zIndex: 1002,
        background: 'rgba(8,8,10,0.94)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '-6px 0 32px rgba(0,0,0,0.55)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
      }

  const TOGGLE_OPTIONS: { key: ViewMode; label: string; color: string }[] = [
    { key: 'ae',    label: 'Amazonia E.',  color: AE_COLOR },
    { key: 'fb',    label: 'Bancolombia',  color: FB_COLOR },
    { key: 'ambas', label: 'Total',        color: ACCENT   },
  ]

  return (
    <div style={panelStyle}>

      {/* ── Header ── */}
      <div style={{
        flexShrink: 0, padding: '16px 20px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8,
      }}>
        <div>
          <div style={{
            color: ACCENT, fontSize: 11, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4,
          }}>
            📊 Métricas · {selectedYear}
          </div>
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>
            Metas de restauración
          </div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 3 }}>
            Fase 1 · Plan Andino-Amazónico del Caquetá
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.65)', borderRadius: 8, width: 34, height: 34,
            cursor: 'pointer', fontSize: 18, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
        >✕</button>
      </div>

      {/* ── Toggle AE / Bancolombia / Ambas ── */}
      <div style={{
        flexShrink: 0,
        padding: '10px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', gap: 6,
      }}>
        {TOGGLE_OPTIONS.map(opt => {
          const isActive = viewMode === opt.key
          return (
            <button
              key={opt.key}
              onClick={() => setViewMode(opt.key)}
              style={{
                flex: 1,
                padding: '9px 6px',
                background: isActive ? `${opt.color}1E` : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${isActive ? opt.color + '60' : 'rgba(255,255,255,0.09)'}`,
                borderRadius: 9,
                color: isActive ? opt.color : 'rgba(255,255,255,0.45)',
                fontSize: 12, fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
                letterSpacing: '0.01em',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px 32px' }}>

        {!stats && (
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, textAlign: 'center', paddingTop: 48 }}>
            Cargando estadísticas…
          </div>
        )}

        {stats && (() => {
          const yk = String(selectedYear)
          const ae = stats.amazonia_emprende
          const fb = stats.bancolombia

          return (
            <>
              {/* ── Gráfico de avance acumulado (%) ── */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  color: 'rgba(255,255,255,0.4)', fontSize: 11,
                  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12,
                }}>
                  Avance acumulado hacia meta total
                </div>
                <DualProgressChart
                  aeByYear={ae.por_anio}
                  fbByYear={fb.por_anio}
                  aeTotal={stats.meta_total_ae}
                  fbTotal={stats.meta_total_fb}
                  mode={viewMode}
                  selectedYear={selectedYear}
                />
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '4px 0 22px' }} />

              {/* ── Sección Amazonia Emprende ── */}
              {(viewMode === 'ae' || viewMode === 'ambas') && (
                <>
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
                  {viewMode === 'ambas' && (
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '22px 0' }} />
                  )}
                </>
              )}

              {/* ── Sección Fundación Bancolombia ── */}
              {(viewMode === 'fb' || viewMode === 'ambas') && (
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
              )}

              {/* ── Nota ── */}
              <div style={{
                marginTop: 22, padding: '12px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
              }}>
                <div style={{
                  color: 'rgba(255,255,255,0.4)', fontSize: 11,
                  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5,
                }}>ℹ️ Nota</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 1.65 }}>
                  Valores proyectados a {selectedYear}. El acumulado suma todos los años desde {stats.anio_inicio}.
                  Bancolombia inicia actividades en {stats.anio_inicio + 1}.
                  El gráfico muestra el porcentaje alcanzado de cada meta total.
                </div>
              </div>
            </>
          )
        })()}
      </div>
    </div>
  )
}
