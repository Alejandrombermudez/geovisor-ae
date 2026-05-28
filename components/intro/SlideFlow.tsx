'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  INTRO_FONT,
  type AnySlide,
  type Slide2,
  type Slide3,
  type SlideGrid,
} from '@/lib/intro-slides'

interface Props {
  /** Lista ordenada de slides a mostrar (e.g. [slide2, slide3]) */
  slides: AnySlide[]
  /** Cuando termina la última, vuelve al hub */
  onFinish: () => void
  /** Cerrar el overlay entero */
  onClose: () => void
}

/** Cuántos bloques de contenido tiene cada kind */
function blockCount(slide: AnySlide): number {
  switch (slide.kind) {
    case 'title_stats_with_side_image':
      return 2 + slide.stats.length + 1 // título + intro + N stats + footnote
    case 'media_left_text_right':
      return 2 + slide.text_blocks.length // título + media + N textos
    case 'title_plus_2x2_grid':
      return 1 + slide.grid.length // título + 4 quadrantes
    default:
      return 1
  }
}

const ADVANCE_KEYS = new Set([
  ' ',
  'Enter',
  'ArrowDown',
  'ArrowRight',
  'PageDown',
])
const BACK_KEYS = new Set(['ArrowUp', 'ArrowLeft', 'PageUp'])

/** Animación de scroll custom — más suave que la nativa `behavior: 'smooth'`.
 *  Duration ~900ms con easing easeInOutCubic. Cancela cualquier animación
 *  anterior antes de iniciar la nueva. */
function smoothScrollBy(el: HTMLElement, deltaY: number, duration = 900): Promise<void> {
  return new Promise(resolve => {
    const start = el.scrollTop
    const target = Math.max(0, Math.min(el.scrollHeight - el.clientHeight, start + deltaY))
    const dist = target - start
    if (Math.abs(dist) < 1) { resolve(); return }
    const t0 = performance.now()
    function step(now: number) {
      const t = Math.min(1, (now - t0) / duration)
      // easeInOutCubic
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      el.scrollTop = start + dist * eased
      if (t < 1) requestAnimationFrame(step)
      else resolve()
    }
    requestAnimationFrame(step)
  })
}

export default function SlideFlow({ slides, onFinish, onClose }: Props) {
  const [idx, setIdx] = useState(0)
  const [reveal, setReveal] = useState(1) // empieza mostrando 1 bloque
  const wheelLock = useRef(0)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mainRef = useRef<HTMLDivElement | null>(null)

  const current = slides[idx]
  const total = useMemo(() => blockCount(current), [current])
  const isLastBlock = reveal >= total
  const isLastSlide = idx === slides.length - 1
  const [canScrollMore, setCanScrollMore] = useState(false)

  // Detectar si hay contenido oculto debajo (para mostrar el hint adecuado).
  useEffect(() => {
    const m = mainRef.current
    if (!m) return
    const update = () => {
      setCanScrollMore(m.scrollHeight - m.scrollTop - m.clientHeight > 8)
    }
    update()
    m.addEventListener('scroll', update)
    // Re-medir cuando cambia reveal/idx (el contenido cambia de altura)
    const t = requestAnimationFrame(update)
    return () => { m.removeEventListener('scroll', update); cancelAnimationFrame(t) }
  }, [reveal, idx])

  // Scroll-to-top al cambiar de slide
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [idx])

  /** ¿Hay contenido oculto debajo (overflow no visible aún)? */
  function hasMoreBelow(): boolean {
    const m = mainRef.current
    if (!m) return false
    return m.scrollHeight - m.scrollTop - m.clientHeight > 8
  }

  /** ¿Estamos al tope (sin scroll hacia arriba pendiente)? */
  function isAtTop(): boolean {
    const m = mainRef.current
    if (!m) return true
    return m.scrollTop <= 8
  }

  const advance = useCallback(() => {
    // 1. Si quedan bloques por revelar → revelar + acompañar con un pequeño
    //    scroll suave para que el bloque nuevo entre al viewport ("2 en 1").
    if (reveal < total) {
      setReveal(r => r + 1)
      // Tras el render, comprobar si el bloque nuevo se quedó fuera y bajar.
      requestAnimationFrame(() => {
        const m = mainRef.current
        if (!m) return
        const remaining = m.scrollHeight - m.scrollTop - m.clientHeight
        if (remaining > 8) {
          // Bajar lo justo para verlo (máx 40% del viewport, mín lo necesario)
          smoothScrollBy(m, Math.min(remaining, m.clientHeight * 0.4))
        }
      })
      return
    }
    // 2. Si todo revelado pero hay contenido por debajo → bajar la vista
    if (hasMoreBelow()) {
      const m = mainRef.current
      if (m) smoothScrollBy(m, m.clientHeight * 0.75)
      return
    }
    // 3. Avanzar al siguiente slide
    if (!isLastSlide) {
      setIdx(i => i + 1)
      setReveal(1)
    } else {
      onFinish()
    }
  }, [reveal, total, isLastSlide, onFinish])

  const back = useCallback(() => {
    // 1. Si hay scroll, subir primero
    if (!isAtTop()) {
      const m = mainRef.current
      if (m) smoothScrollBy(m, -m.clientHeight * 0.75)
      return
    }
    // 2. Quitar el último bloque revelado
    if (reveal > 1) {
      setReveal(r => r - 1)
      return
    }
    // 3. Volver al slide anterior (con todo revelado y scroll abajo)
    if (idx > 0) {
      const prev = slides[idx - 1]
      setIdx(i => i - 1)
      setReveal(blockCount(prev))
      requestAnimationFrame(() => {
        const m = mainRef.current
        if (m) m.scrollTo({ top: m.scrollHeight })
      })
    }
  }, [reveal, idx, slides])

  // Teclado
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (ADVANCE_KEYS.has(e.key)) { e.preventDefault(); advance() }
      else if (BACK_KEYS.has(e.key)) { e.preventDefault(); back() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance, back, onClose])

  // Wheel: lock para evitar disparos múltiples; passive:false para preventDefault
  useEffect(() => {
    function onWheel(e: WheelEvent) {
      e.preventDefault()
      const now = Date.now()
      if (now - wheelLock.current < 600) return
      wheelLock.current = now
      if (e.deltaY > 0) advance()
      else if (e.deltaY < 0) back()
    }
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [advance, back])

  return (
    <div
      ref={containerRef}
      onClick={advance}
      style={{
        position: 'fixed', inset: 0, zIndex: 4000,
        background: '#0a0a0a',
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.82) 100%), url("${current.background}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        fontFamily: INTRO_FONT,
        color: '#fff',
        overflow: 'hidden',   // sin scrollbar; el wheel/keys avanzan reveal
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header con progreso + cerrar */}
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 5,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'clamp(18px, 1.8vw, 28px) clamp(24px, 2.4vw, 40px)',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.65), transparent)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(14px, 1.4vw, 22px)' }}>
          <img
            src="/logo-ae-blanco.png"
            alt="AE"
            style={{
              width: 'clamp(50px, 4.2vw, 72px)',
              height: 'auto', objectFit: 'contain',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            {slides.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === idx ? 'clamp(36px, 3vw, 52px)' : 'clamp(14px, 1.2vw, 20px)',
                  height: 'clamp(4px, 0.5vh, 6px)',
                  borderRadius: 3,
                  background: i <= idx ? '#74A884' : 'rgba(255,255,255,0.25)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
          <div
            style={{
              fontSize: 'clamp(13px, 1.05vw, 17px)',
              fontWeight: 700, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)',
            }}
          >
            {idx + 1} / {slides.length}
          </div>
        </div>

        <button
          onClick={e => { e.stopPropagation(); onClose() }}
          aria-label="Volver al inicio"
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', fontSize: 22,
            width: 'clamp(40px, 3.4vw, 52px)',
            height: 'clamp(40px, 3.4vw, 52px)',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
        >
          ✕
        </button>
      </header>

      {/* Body — scroll interno SIN barra; el scroll lo gobierna advance/back */}
      <main
        ref={mainRef}
        className="geo-slide-main"
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
          padding: 'clamp(12px, 1.6vw, 32px) clamp(24px, 4vw, 80px) clamp(100px, 9vh, 140px)',
          maxWidth: 1600, margin: '0 auto', width: '100%',
          boxSizing: 'border-box',
          overflow: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {current.kind === 'title_stats_with_side_image' && (
          <RenderStatsSlide slide={current} reveal={reveal} />
        )}
        {current.kind === 'media_left_text_right' && (
          <RenderMediaSlide slide={current} reveal={reveal} />
        )}
        {current.kind === 'title_plus_2x2_grid' && (
          <RenderGridSlide slide={current} reveal={reveal} />
        )}
      </main>

      {/* Hint / Next */}
      <div
        style={{
          position: 'fixed', bottom: 24, left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 5, pointerEvents: 'none',
        }}
      >
        {(!isLastBlock || canScrollMore) ? (
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 999,
              color: 'rgba(255,255,255,0.85)',
              fontSize: 14, fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              animation: 'introHintBob 1.8s ease-in-out infinite',
            }}
          >
            {isLastBlock && canScrollMore ? 'Continuar' : 'Scroll · Clic · Espacio'}
            <span style={{ fontSize: 14 }}>↓</span>
          </div>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); advance() }}
            style={{
              pointerEvents: 'auto',
              background: 'linear-gradient(135deg, #74A884 0%, #6898B8 100%)',
              color: '#fff',
              fontFamily: INTRO_FONT,
              fontSize: 16, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              border: 'none', borderRadius: 999,
              padding: '16px 44px', cursor: 'pointer',
              boxShadow: '0 12px 32px rgba(116,168,132,0.5)',
              display: 'inline-flex', alignItems: 'center', gap: 10,
              transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {isLastSlide ? 'Volver al inicio' : 'Siguiente'}
            <span style={{ fontSize: 18 }}>→</span>
          </button>
        )}
      </div>

      <style>{`
        @keyframes introHintBob {
          0%, 100% { transform: translateY(0); opacity: 0.7; }
          50%      { transform: translateY(4px); opacity: 1; }
        }
        @keyframes introFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .geo-slide-main::-webkit-scrollbar { width: 0; height: 0; display: none; }
      `}</style>
    </div>
  )
}

// ───────────────────────────────────────────────────────────────────────────────
// Renderers por kind
// ───────────────────────────────────────────────────────────────────────────────

function Reveal({
  shown, delay = 0, fill = false, children,
}: { shown: boolean; delay?: number; fill?: boolean; children: React.ReactNode }) {
  return (
    <div
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(18px)',
        transition: `all 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        pointerEvents: shown ? 'auto' : 'none',
        width: fill ? '100%' : undefined,
        height: fill ? '100%' : undefined,
        minHeight: fill ? 0 : undefined,
      }}
    >
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        margin: 0,
        fontFamily: INTRO_FONT,
        fontSize: 'clamp(28px, 3.2vw, 52px)',
        fontWeight: 300,
        lineHeight: 1.1,
        letterSpacing: '0.005em',
        color: '#fff',
        textShadow: '0 4px 24px rgba(0,0,0,0.45)',
        maxWidth: '26ch',
      }}
    >
      {children}
    </h2>
  )
}

function Source({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 'clamp(16px, 1.8vw, 28px)',
        fontSize: 'clamp(11px, 0.85vw, 13px)',
        color: 'rgba(255,255,255,0.42)',
        letterSpacing: '0.02em', lineHeight: 1.5,
        fontStyle: 'italic',
      }}
    >
      {children}
    </div>
  )
}

function RenderStatsSlide({ slide, reveal }: { slide: Slide2; reveal: number }) {
  // bloques: 1=title, 2=intro, 3..n+2 = stats, n+3 = footnote
  const statCount = slide.stats.length
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
      gap: 'clamp(24px, 3vw, 56px)',
      alignItems: 'start',
    }}>
      <div>
        <Reveal shown={reveal >= 1}>
          <SectionTitle>{slide.title}</SectionTitle>
        </Reveal>

        <Reveal shown={reveal >= 2} delay={100}>
          <p
            style={{
              margin: 'clamp(18px, 1.8vw, 28px) 0 0',
              fontSize: 'clamp(18px, 1.8vw, 26px)',
              fontWeight: 300, lineHeight: 1.55,
              color: 'rgba(255,255,255,0.86)',
              maxWidth: '60ch',
            }}
          >
            {slide.intro}
          </p>
        </Reveal>

        <div
          style={{
            marginTop: 'clamp(20px, 2.4vh, 36px)',
            display: 'grid',
            gridTemplateColumns: `repeat(${statCount}, minmax(0, 1fr))`,
            gap: 'clamp(10px, 1vw, 18px)',
          }}
        >
          {slide.stats.map((s, i) => (
            <Reveal key={i} shown={reveal >= 3 + i} delay={i * 60}>
              <div
                style={{
                  padding: 'clamp(16px, 1.4vw, 24px) clamp(14px, 1.2vw, 22px)',
                  background: 'rgba(116,168,132,0.12)',
                  border: '1px solid rgba(116,168,132,0.35)',
                  borderRadius: 14,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: INTRO_FONT,
                    fontWeight: 700,
                    fontSize: 'clamp(34px, 3.6vw, 58px)',
                    color: '#74A884',
                    letterSpacing: '0.005em', lineHeight: 1,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 'clamp(13px, 1.1vw, 17px)',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    color: 'rgba(255,255,255,0.78)',
                    lineHeight: 1.35,
                  }}
                >
                  {s.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal shown={reveal >= 3 + statCount} delay={120}>
          <p
            style={{
              margin: 'clamp(18px, 2vw, 28px) 0 0',
              fontSize: 'clamp(16px, 1.3vw, 20px)',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.82)',
              maxWidth: '70ch',
              padding: 'clamp(14px, 1.2vw, 20px) clamp(16px, 1.4vw, 22px)',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 12,
              backdropFilter: 'blur(14px) saturate(140%)',
              WebkitBackdropFilter: 'blur(14px) saturate(140%)',
            }}
          >
            {slide.footnote}
          </p>
          <Source>Fuente: {slide.source}</Source>
        </Reveal>
      </div>

      {/* Imagen lateral: contain (no crop), sin aspect-ratio forzado */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxHeight: 'clamp(360px, 65vh, 720px)',
          borderRadius: 16,
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.04)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 'clamp(10px, 1vw, 16px)',
        }}
      >
        <img
          src={slide.side_image}
          alt=""
          style={{
            width: '100%', height: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>
    </div>
  )
}

function RenderMediaSlide({ slide, reveal }: { slide: Slide3; reveal: number }) {
  return (
    <div>
      <Reveal shown={reveal >= 1}>
        <SectionTitle>{slide.title}</SectionTitle>
      </Reveal>

      <div
        style={{
          marginTop: 'clamp(20px, 2.4vh, 36px)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 0.95fr) minmax(0, 1fr)',
          gap: 'clamp(20px, 2.4vw, 48px)',
          alignItems: 'start',
        }}
      >
        <Reveal shown={reveal >= 2}>
          <div
            style={{
              borderRadius: 16,
              overflow: 'hidden',
              maxHeight: 'clamp(360px, 65vh, 700px)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
              background: '#000',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
            onContextMenu={e => e.preventDefault()}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster={slide.media.poster}
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
              style={{
                width: '100%', height: '100%', display: 'block',
                maxHeight: 'clamp(360px, 65vh, 700px)',
                objectFit: 'contain', background: '#000',
                pointerEvents: 'none', // no interacción del usuario
              }}
            >
              <source src={slide.media.file} type="video/mp4" />
            </video>
          </div>
        </Reveal>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 1.4vw, 22px)' }}>
          {slide.text_blocks.map((t, i) => (
            <Reveal key={i} shown={reveal >= 3 + i} delay={i * 100}>
              <div
                style={{
                  padding: 'clamp(18px, 1.8vw, 30px) clamp(20px, 2vw, 32px)',
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  borderRadius: 16,
                  backdropFilter: 'blur(18px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(18px) saturate(160%)',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 'clamp(18px, 1.8vw, 26px)',
                    fontWeight: 300, lineHeight: 1.55,
                    color: 'rgba(255,255,255,0.94)',
                  }}
                >
                  {t}
                </p>
              </div>
            </Reveal>
          ))}

          <Reveal shown={reveal >= 3 + slide.text_blocks.length - 1} delay={120}>
            <Source>
              Fuente: {slide.source}{' '}
              {slide.source_url && (
                <a
                  href={slide.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{ color: '#74A884', textDecoration: 'underline' }}
                >
                  Ver estudio
                </a>
              )}
            </Source>
          </Reveal>
        </div>
      </div>
    </div>
  )
}

function RenderGridSlide({ slide, reveal }: { slide: SlideGrid; reveal: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Reveal shown={reveal >= 1}>
        <SectionTitle>{slide.title}</SectionTitle>
      </Reveal>

      <div
        style={{
          flex: 1, minHeight: 0,
          marginTop: 'clamp(16px, 2vh, 32px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
          gap: 'clamp(12px, 1.4vw, 22px)',
        }}
      >
        {slide.grid.map((item, i) => (
          <Reveal key={i} shown={reveal >= 2 + i} delay={i * 80} fill>
            <div
              style={{
                width: '100%', height: '100%',
                borderRadius: 14,
                overflow: 'hidden',
                position: 'relative',
                background: '#1a1a1a',
                boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
              }}
            >
              <img
                src={item.image}
                alt={item.label}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <div
                style={{
                  position: 'absolute', inset: 0,
                  background:
                    'linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.88) 100%)',
                }}
              />
              <div
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: 'clamp(14px, 1.2vw, 22px) clamp(16px, 1.4vw, 24px) clamp(12px, 1vw, 18px)',
                  fontFamily: INTRO_FONT,
                  fontSize: 'clamp(15px, 1.3vw, 21px)',
                  fontWeight: 700,
                  lineHeight: 1.25,
                  color: '#fff',
                }}
              >
                {item.label}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
