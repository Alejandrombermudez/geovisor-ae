'use client'

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'

/** Un paso del recorrido: a qué control apunta y qué explica. */
export interface TourStep {
  /** Selector CSS del elemento a resaltar (ej. '[data-tour="metas"]'). */
  selector: string
  titulo: string
  texto: string
}

interface Props {
  steps: TourStep[]
  /** Color de acento (marca del aliado). */
  accent?: string
  onClose: () => void
}

const PAD = 6        // margen del foco alrededor del elemento
const GAP = 16       // separación del tooltip respecto al elemento
const M   = 12       // margen mínimo contra los bordes de la pantalla
const DIM = 'rgba(0,0,0,0.82)'

/**
 * Recorrido guiado tipo "spotlight": oscurece la pantalla, ilumina un control a la vez
 * y lo explica. Avanza paso a paso (1/5, 2/5…) y el foco se desliza al siguiente control.
 */
export default function HelpTour({ steps: rawSteps, accent = '#14b8a6', onClose }: Props) {
  // Solo los pasos cuyo elemento existe ahora mismo en el DOM (robusto a la UI activa).
  const [steps] = useState(() =>
    typeof document === 'undefined'
      ? rawSteps
      : rawSteps.filter(s => document.querySelector(s.selector)),
  )
  const [index, setIndex] = useState(0)
  const [rect,  setRect]  = useState<DOMRect | null>(null)
  const [tip,   setTip]   = useState<{ left: number; top: number; ready: boolean }>({ left: 0, top: 0, ready: false })
  const tipRef = useRef<HTMLDivElement>(null)

  const total = steps.length
  const step  = steps[index]

  const measure = useCallback(() => {
    if (!step) return
    const el = document.querySelector(step.selector) as HTMLElement | null
    setRect(el ? el.getBoundingClientRect() : null)
  }, [step])

  // Medir el elemento del paso actual (y ocultar el tooltip hasta reposicionarlo).
  useLayoutEffect(() => {
    setTip(t => ({ ...t, ready: false }))
    measure()
  }, [index, measure])

  // Re-medir ante resize / scroll / animaciones del sidebar.
  useEffect(() => {
    const on = () => measure()
    window.addEventListener('resize', on)
    window.addEventListener('scroll', on, true)
    const id = window.setInterval(on, 400)
    return () => {
      window.removeEventListener('resize', on)
      window.removeEventListener('scroll', on, true)
      clearInterval(id)
    }
  }, [measure])

  // Posicionar el tooltip cerca del elemento (derecha → izquierda → centrado).
  useLayoutEffect(() => {
    if (!rect || !tipRef.current) return
    const vw = window.innerWidth, vh = window.innerHeight
    const tw = tipRef.current.offsetWidth, th = tipRef.current.offsetHeight
    let left: number
    if (rect.right + GAP + tw <= vw - M)      left = rect.right + GAP
    else if (rect.left - GAP - tw >= M)       left = rect.left - GAP - tw
    else                                      left = Math.min(Math.max(rect.left + rect.width / 2 - tw / 2, M), vw - tw - M)
    let top = rect.top + rect.height / 2 - th / 2
    top = Math.min(Math.max(top, M), vh - th - M)
    setTip({ left, top, ready: true })
  }, [rect])

  const goNext = useCallback(() => {
    if (index + 1 >= total) onClose()
    else setIndex(index + 1)
  }, [index, total, onClose])
  const goPrev = useCallback(() => setIndex(i => Math.max(0, i - 1)), [])

  // Teclado: avanzar / retroceder / cerrar.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (['ArrowRight', 'Enter', ' '].includes(e.key)) { e.preventDefault(); goNext() }
      else if (e.key === 'ArrowLeft')                   { e.preventDefault(); goPrev() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goPrev, onClose])

  // Sin elementos que mostrar → cerrar.
  useEffect(() => { if (total === 0) onClose() }, [total, onClose])
  if (total === 0 || !step) return null

  const isLast = index + 1 >= total

  const textBtn: React.CSSProperties = {
    background: 'transparent', border: 'none', cursor: 'pointer',
    color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 600, padding: '6px 4px',
  }
  const secBtn: React.CSSProperties = {
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)',
    color: '#fff', borderRadius: 9, padding: '9px 14px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
  }
  const primBtn: React.CSSProperties = {
    background: `linear-gradient(135deg, ${accent} 0%, ${accent}CC 100%)`,
    border: 'none', color: '#fff', borderRadius: 9, padding: '9px 16px',
    fontSize: 13.5, fontWeight: 800, cursor: 'pointer', letterSpacing: '0.02em',
  }

  return (
    <div
      onClick={goNext}
      style={{ position: 'fixed', inset: 0, zIndex: 6000, cursor: 'pointer' }}
      role="dialog"
      aria-modal="true"
    >
      {/* Foco (o velo completo si el elemento no se encuentra) */}
      {rect ? (
        <div
          style={{
            position: 'fixed',
            top: rect.top - PAD, left: rect.left - PAD,
            width: rect.width + PAD * 2, height: rect.height + PAD * 2,
            borderRadius: 12,
            border: `2px solid ${accent}`,
            pointerEvents: 'none',
            transition: 'top 0.45s cubic-bezier(0.4,0,0.2,1), left 0.45s cubic-bezier(0.4,0,0.2,1), width 0.45s cubic-bezier(0.4,0,0.2,1), height 0.45s cubic-bezier(0.4,0,0.2,1)',
            animation: 'tourPulse 2.2s ease-in-out infinite',
          }}
        />
      ) : (
        <div style={{ position: 'fixed', inset: 0, background: DIM, pointerEvents: 'none' }} />
      )}

      {/* Tarjeta de explicación */}
      <div
        ref={tipRef}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed', left: tip.left, top: tip.top,
          width: 'min(330px, calc(100vw - 24px))',
          opacity: tip.ready ? 1 : 0,
          transform: tip.ready ? 'none' : 'translateY(6px)',
          transition: 'opacity 0.25s ease, transform 0.25s ease, left 0.45s cubic-bezier(0.4,0,0.2,1), top 0.45s cubic-bezier(0.4,0,0.2,1)',
          background: 'rgba(15,17,21,0.97)', color: '#fff',
          border: `1px solid ${accent}66`, borderRadius: 14,
          boxShadow: '0 18px 50px rgba(0,0,0,0.6)',
          padding: '15px 18px 14px', zIndex: 6001, cursor: 'default',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        {/* Progreso + cerrar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: accent, fontSize: 12, fontWeight: 800, letterSpacing: '0.08em' }}>
            {index + 1} / {total}
          </span>
          <button
            onClick={onClose}
            aria-label="Cerrar guía"
            style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)',
              color: 'rgba(255,255,255,0.6)', borderRadius: 7, width: 26, height: 26,
              cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 6, lineHeight: 1.25 }}>{step.titulo}</div>
        <div style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.7)', marginBottom: 14 }}>{step.texto}</div>

        {/* Barra de pasos */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
          {steps.map((_, i) => (
            <span key={i} style={{
              height: 5, borderRadius: 3, flex: i === index ? 2.2 : 1,
              background: i === index ? accent : i < index ? `${accent}88` : 'rgba(255,255,255,0.18)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        {/* Controles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onClose} style={textBtn}>Saltar guía</button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {index > 0 && <button onClick={goPrev} style={secBtn}>Anterior</button>}
            <button onClick={goNext} style={primBtn}>{isLast ? 'Entendido' : 'Siguiente'}</button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tourPulse {
          0%, 100% { box-shadow: 0 0 0 9999px ${DIM}, 0 0 0 0 ${accent}00; }
          50%      { box-shadow: 0 0 0 9999px ${DIM}, 0 0 24px 5px ${accent}66; }
        }
      `}</style>
    </div>
  )
}
