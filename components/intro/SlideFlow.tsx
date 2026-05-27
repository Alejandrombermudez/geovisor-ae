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

export default function SlideFlow({ slides, onFinish, onClose }: Props) {
  const [idx, setIdx] = useState(0)
  const [reveal, setReveal] = useState(1) // empieza mostrando 1 bloque
  const wheelLock = useRef(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const current = slides[idx]
  const total = useMemo(() => blockCount(current), [current])
  const isLastBlock = reveal >= total
  const isLastSlide = idx === slides.length - 1

  // Reset al cambiar de slide
  useEffect(() => {
    setReveal(1)
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [idx])

  const advance = useCallback(() => {
    if (reveal < total) {
      setReveal(r => r + 1)
    } else if (!isLastSlide) {
      setIdx(i => i + 1)
    } else {
      onFinish()
    }
  }, [reveal, total, isLastSlide, onFinish])

  const back = useCallback(() => {
    if (reveal > 1) {
      setReveal(r => r - 1)
    } else if (idx > 0) {
      setIdx(i => i - 1)
      // reveal queda en 1 (effect lo resetea), pero sería mejor llevarlo al final del slide previo:
      const prev = slides[idx - 1]
      setReveal(blockCount(prev))
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

  // Scroll (wheel) con lock para no avanzar 5 bloques de un golpe
  useEffect(() => {
    function onWheel(e: WheelEvent) {
      const now = Date.now()
      if (now - wheelLock.current < 450) return
      wheelLock.current = now
      if (e.deltaY > 0) advance()
      else if (e.deltaY < 0) back()
    }
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: true })
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
        overflow: 'auto',
        cursor: 'pointer',
      }}
    >
      {/* Header con progreso + cerrar */}
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 5,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 28px',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.55), transparent)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src="/logo-ae-blanco.png"
            alt="AE"
            style={{ width: 32, height: 'auto', objectFit: 'contain' }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            {slides.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === idx ? 28 : 12, height: 4,
                  borderRadius: 2,
                  background: i <= idx ? '#74A884' : 'rgba(255,255,255,0.25)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
          <div
            style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
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
            color: '#fff', fontSize: 18,
            width: 40, height: 40, borderRadius: '50%',
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

      {/* Body */}
      <main
        style={{
          minHeight: 'calc(100dvh - 76px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: 'clamp(20px, 4vw, 72px)',
          maxWidth: 1500, margin: '0 auto', width: '100%',
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
        {!isLastBlock ? (
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px',
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 999,
              color: 'rgba(255,255,255,0.78)',
              fontSize: 12, fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              animation: 'introHintBob 1.8s ease-in-out infinite',
            }}
          >
            Scroll · Clic · Espacio
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
              fontSize: 14, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              border: 'none', borderRadius: 999,
              padding: '14px 36px', cursor: 'pointer',
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
      `}</style>
    </div>
  )
}

// ───────────────────────────────────────────────────────────────────────────────
// Renderers por kind
// ───────────────────────────────────────────────────────────────────────────────

function Reveal({
  shown, delay = 0, children,
}: { shown: boolean; delay?: number; children: React.ReactNode }) {
  return (
    <div
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(18px)',
        transition: `all 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        pointerEvents: shown ? 'auto' : 'none',
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
        fontSize: 'clamp(28px, 4.4vw, 56px)',
        fontWeight: 300,
        lineHeight: 1.1,
        letterSpacing: '0.005em',
        color: '#fff',
        textShadow: '0 4px 24px rgba(0,0,0,0.4)',
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
        marginTop: 24,
        fontSize: 11, color: 'rgba(255,255,255,0.4)',
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
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 'clamp(24px, 4vw, 64px)', alignItems: 'center' }}>
      <div>
        <Reveal shown={reveal >= 1}>
          <SectionTitle>{slide.title}</SectionTitle>
        </Reveal>

        <Reveal shown={reveal >= 2} delay={100}>
          <p
            style={{
              margin: '20px 0 0',
              fontSize: 'clamp(15px, 1.6vw, 19px)',
              fontWeight: 300, lineHeight: 1.55,
              color: 'rgba(255,255,255,0.82)',
              maxWidth: 680,
            }}
          >
            {slide.intro}
          </p>
        </Reveal>

        <div
          style={{
            marginTop: 'clamp(20px, 3vh, 36px)',
            display: 'grid',
            gridTemplateColumns: `repeat(${statCount}, minmax(0, 1fr))`,
            gap: 14,
          }}
        >
          {slide.stats.map((s, i) => (
            <Reveal key={i} shown={reveal >= 3 + i} delay={i * 60}>
              <div
                style={{
                  padding: '20px 18px',
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
                    fontSize: 'clamp(28px, 3.4vw, 44px)',
                    color: '#74A884',
                    letterSpacing: '0.005em', lineHeight: 1,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 11, fontWeight: 600,
                    letterSpacing: '0.04em',
                    color: 'rgba(255,255,255,0.7)',
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
              margin: '24px 0 0',
              fontSize: 13, lineHeight: 1.6,
              color: 'rgba(255,255,255,0.7)',
              maxWidth: 720,
              padding: '14px 18px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
            }}
          >
            {slide.footnote}
          </p>
          <Source>Fuente: {slide.source}</Source>
        </Reveal>
      </div>

      <div
        style={{
          position: 'relative',
          aspectRatio: '3/4',
          maxHeight: '70dvh',
          width: '100%',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
        }}
      >
        <img
          src={slide.side_image}
          alt=""
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: 'scale(1.02)',
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
          marginTop: 'clamp(20px, 3vh, 36px)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 0.85fr) minmax(0, 1fr)',
          gap: 'clamp(20px, 3vw, 48px)',
          alignItems: 'start',
        }}
      >
        <Reveal shown={reveal >= 2}>
          <div
            style={{
              borderRadius: 16,
              overflow: 'hidden',
              aspectRatio: '4/5',
              maxHeight: '70dvh',
              boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
              background: '#000',
            }}
            onClick={e => e.stopPropagation()}
          >
            <video
              controls
              poster={slide.media.poster}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            >
              <source src={slide.media.file} type="video/mp4" />
            </video>
          </div>
        </Reveal>

        <div>
          {slide.text_blocks.map((t, i) => (
            <Reveal key={i} shown={reveal >= 3 + i} delay={i * 100}>
              <p
                style={{
                  margin: i === 0 ? 0 : '20px 0 0',
                  fontSize: 'clamp(15px, 1.55vw, 18px)',
                  fontWeight: 300, lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.85)',
                }}
              >
                {t}
              </p>
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
    <div>
      <Reveal shown={reveal >= 1}>
        <SectionTitle>{slide.title}</SectionTitle>
      </Reveal>

      <div
        style={{
          marginTop: 'clamp(24px, 4vh, 48px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 'clamp(14px, 1.8vw, 24px)',
        }}
      >
        {slide.grid.map((item, i) => (
          <Reveal key={i} shown={reveal >= 2 + i} delay={i * 80}>
            <div
              style={{
                borderRadius: 14,
                overflow: 'hidden',
                position: 'relative',
                aspectRatio: '4/3',
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
                    'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%)',
                }}
              />
              <div
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '18px 18px 16px',
                  fontFamily: INTRO_FONT,
                  fontSize: 'clamp(14px, 1.4vw, 17px)',
                  fontWeight: 700,
                  lineHeight: 1.3,
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
