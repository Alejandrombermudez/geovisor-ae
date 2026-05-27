'use client'

import { useEffect, useState } from 'react'
import { INTRO_FONT, type Slide1 } from '@/lib/intro-slides'

interface Props {
  slide: Slide1
  onCardClick: (targetSlides: number[]) => void
  onClose: () => void
}

export default function SlideHub({ slide, onCardClick, onClose }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 4000,
        background: '#0a0a0a',
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.78) 100%), url("${slide.background}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        fontFamily: INTRO_FONT,
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease',
        overflow: 'hidden',
      }}
    >
      {/* Botón cerrar (esquina superior-derecha) */}
      <button
        onClick={onClose}
        aria-label="Cerrar"
        style={{
          position: 'absolute', top: 22, right: 26, zIndex: 2,
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff', fontSize: 20, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
      >
        ✕
      </button>

      {/* Logo + título superior */}
      <header
        style={{
          padding: 'clamp(28px, 5vh, 56px) clamp(24px, 6vw, 80px) 0',
          display: 'flex', alignItems: 'center', gap: 16,
        }}
      >
        <img
          src="/logo-ae-blanco.png"
          alt="AE"
          style={{ width: 52, height: 'auto', objectFit: 'contain' }}
        />
        <div>
          <div
            style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: '#74A884',
            }}
          >
            Amazonia Emprende
          </div>
          <div
            style={{
              fontSize: 13, fontWeight: 300, letterSpacing: '0.04em',
              color: 'rgba(255,255,255,0.55)', marginTop: 2,
            }}
          >
            Geoportal · Bienvenida
          </div>
        </div>
      </header>

      {/* Hero título grande */}
      <section
        style={{
          flex: 1,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(24px, 6vw, 80px)',
          maxWidth: 1400,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: INTRO_FONT,
            fontWeight: 300,
            fontSize: 'clamp(40px, 6vw, 84px)',
            lineHeight: 1.05,
            letterSpacing: '0.005em',
            color: '#fff',
            textShadow: '0 4px 24px rgba(0,0,0,0.4)',
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.2s',
          }}
        >
          {slide.title}
        </h1>
        <p
          style={{
            margin: '20px 0 0',
            fontSize: 'clamp(16px, 1.8vw, 22px)',
            fontWeight: 300,
            lineHeight: 1.5,
            color: 'rgba(255,255,255,0.78)',
            maxWidth: 720,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.35s',
          }}
        >
          {slide.subtitle}
        </p>

        {/* Cards */}
        <div
          style={{
            marginTop: 'clamp(28px, 4vh, 56px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'clamp(14px, 1.8vw, 22px)',
          }}
        >
          {slide.cards.map((card, i) => {
            const disabled = !card.enabled
            return (
              <button
                key={card.id}
                onClick={() => !disabled && onCardClick(card.target_slides)}
                disabled={disabled}
                style={{
                  textAlign: 'left',
                  background: disabled
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  border: disabled
                    ? '1px solid rgba(255,255,255,0.08)'
                    : '1px solid rgba(116,168,132,0.35)',
                  borderRadius: 18,
                  padding: 'clamp(20px, 2.4vw, 30px)',
                  color: disabled ? 'rgba(255,255,255,0.4)' : '#fff',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  display: 'flex', flexDirection: 'column',
                  gap: 12, minHeight: 200, position: 'relative',
                  fontFamily: INTRO_FONT,
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(28px)',
                  transition: `all 0.6s cubic-bezier(0.22,1,0.36,1) ${0.5 + i * 0.12}s, background 0.18s ease, border-color 0.18s ease`,
                }}
                onMouseEnter={e => {
                  if (disabled) return
                  e.currentTarget.style.background = 'rgba(116,168,132,0.18)'
                  e.currentTarget.style.borderColor = 'rgba(116,168,132,0.65)'
                }}
                onMouseLeave={e => {
                  if (disabled) return
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.borderColor = 'rgba(116,168,132,0.35)'
                }}
              >
                <div
                  style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: disabled
                      ? 'rgba(255,255,255,0.08)'
                      : 'linear-gradient(135deg, #74A884, #6898B8)',
                    color: '#fff',
                    fontSize: 16, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {i + 1}
                </div>

                <h3
                  style={{
                    margin: 0,
                    fontFamily: INTRO_FONT,
                    fontSize: 'clamp(17px, 1.5vw, 21px)',
                    fontWeight: 700,
                    letterSpacing: '0.005em',
                    lineHeight: 1.25,
                    color: disabled ? 'rgba(255,255,255,0.55)' : '#fff',
                  }}
                >
                  {card.title}
                </h3>

                <p
                  style={{
                    margin: 0,
                    fontSize: 13, lineHeight: 1.55,
                    color: disabled ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.72)',
                    flex: 1,
                  }}
                >
                  {card.body}
                </p>

                <div
                  style={{
                    marginTop: 4,
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: disabled ? 'rgba(255,255,255,0.32)' : '#74A884',
                  }}
                >
                  {card.coming_soon ? (
                    'Próximamente'
                  ) : (
                    <>
                      Explorar
                      <span
                        aria-hidden
                        style={{ fontSize: 16, transform: 'translateY(-1px)' }}
                      >
                        →
                      </span>
                    </>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
