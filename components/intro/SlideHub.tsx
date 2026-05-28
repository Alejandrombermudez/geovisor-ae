'use client'

import { useEffect, useState } from 'react'
import { INTRO_FONT, type Slide1 } from '@/lib/intro-slides'

interface Props {
  slide: Slide1
  onCardClick: (cardId: string, targetSlides: number[]) => void
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
          display: 'flex', alignItems: 'center', gap: 18,
        }}
      >
        <img
          src="/logo-ae-blanco.png"
          alt="AE"
          style={{ width: 'clamp(52px, 4.5vw, 76px)', height: 'auto', objectFit: 'contain' }}
        />
        <div>
          <div
            style={{
              fontSize: 'clamp(12px, 0.9vw, 14px)', fontWeight: 700, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: '#74A884',
            }}
          >
            Amazonia Emprende
          </div>
          <div
            style={{
              fontSize: 'clamp(13px, 1vw, 16px)', fontWeight: 300, letterSpacing: '0.04em',
              color: 'rgba(255,255,255,0.55)', marginTop: 3,
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
          paddingTop: 'clamp(12px, 2vh, 32px)',
          paddingBottom: 'clamp(52px, 9vh, 110px)',
          paddingLeft: 'clamp(24px, 6vw, 80px)',
          paddingRight: 'clamp(24px, 6vw, 80px)',
          maxWidth: 1400,
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: INTRO_FONT,
            fontWeight: 300,
            fontSize: 'clamp(50px, 7vw, 104px)',
            lineHeight: 1.04,
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
            margin: 'clamp(16px, 2vh, 28px) 0 0',
            fontSize: 'clamp(18px, 2.1vw, 28px)',
            fontWeight: 300,
            lineHeight: 1.5,
            color: 'rgba(255,255,255,0.78)',
            maxWidth: 820,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.35s',
          }}
        >
          {slide.subtitle}
        </p>

        {/* Cards */}
        <div
          style={{
            marginTop: 'clamp(22px, 3vh, 44px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(14px, 1.8vw, 24px)',
          }}
        >
          {slide.cards.map((card, i) => {
            // La tercera card (como) siempre habilitada — redirige a Metas
            const isMetasCard = card.id === 'como'
            const disabled = isMetasCard ? false : !card.enabled
            const METAS_ACCENT = '#FAB758'
            return (
              <button
                key={card.id}
                onClick={() => !disabled && onCardClick(card.id, card.target_slides)}
                disabled={disabled}
                style={{
                  textAlign: 'left',
                  background: disabled
                    ? 'rgba(255,255,255,0.04)'
                    : isMetasCard
                      ? 'rgba(250,183,88,0.08)'
                      : 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  border: disabled
                    ? '1px solid rgba(255,255,255,0.08)'
                    : isMetasCard
                      ? `1px solid ${METAS_ACCENT}50`
                      : '1px solid rgba(116,168,132,0.35)',
                  borderRadius: 18,
                  padding: 'clamp(20px, 2.4vw, 30px)',
                  color: disabled ? 'rgba(255,255,255,0.4)' : '#fff',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  display: 'flex', flexDirection: 'column',
                  gap: 'clamp(12px, 1.2vw, 18px)', minHeight: 'clamp(200px, 22vh, 260px)', position: 'relative',
                  fontFamily: INTRO_FONT,
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(28px)',
                  transition: `all 0.6s cubic-bezier(0.22,1,0.36,1) ${0.5 + i * 0.12}s, background 0.18s ease, border-color 0.18s ease`,
                }}
                onMouseEnter={e => {
                  if (disabled) return
                  e.currentTarget.style.background = isMetasCard ? 'rgba(250,183,88,0.18)' : 'rgba(116,168,132,0.18)'
                  e.currentTarget.style.borderColor = isMetasCard ? `${METAS_ACCENT}90` : 'rgba(116,168,132,0.65)'
                }}
                onMouseLeave={e => {
                  if (disabled) return
                  e.currentTarget.style.background = isMetasCard ? 'rgba(250,183,88,0.08)' : 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.borderColor = isMetasCard ? `${METAS_ACCENT}50` : 'rgba(116,168,132,0.35)'
                }}
              >
                <div
                  style={{
                    width: 'clamp(38px, 3.2vw, 52px)', height: 'clamp(38px, 3.2vw, 52px)', borderRadius: '50%',
                    background: disabled
                      ? 'rgba(255,255,255,0.08)'
                      : isMetasCard
                        ? `linear-gradient(135deg, ${METAS_ACCENT}, #F97316)`
                        : 'linear-gradient(135deg, #74A884, #6898B8)',
                    color: isMetasCard ? '#000' : '#fff',
                    fontSize: 'clamp(16px, 1.3vw, 20px)', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {i + 1}
                </div>

                <h3
                  style={{
                    margin: 0,
                    fontFamily: INTRO_FONT,
                    fontSize: 'clamp(18px, 1.8vw, 25px)',
                    fontWeight: 700,
                    letterSpacing: '0.005em',
                    lineHeight: 1.22,
                    color: disabled ? 'rgba(255,255,255,0.55)' : '#fff',
                  }}
                >
                  {card.title}
                </h3>

                <p
                  style={{
                    margin: 0,
                    fontSize: 'clamp(14px, 1.1vw, 17px)', lineHeight: 1.55,
                    color: disabled ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.72)',
                    flex: 1,
                  }}
                >
                  {card.body}
                </p>

                <div
                  style={{
                    marginTop: 6,
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 'clamp(12px, 0.9vw, 14px)', fontWeight: 700, letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: disabled
                      ? 'rgba(255,255,255,0.32)'
                      : isMetasCard
                        ? METAS_ACCENT
                        : '#74A884',
                  }}
                >
                  {isMetasCard ? (
                    <>
                      Ver Metas
                      <span aria-hidden style={{ fontSize: 16, transform: 'translateY(-1px)' }}>🎯</span>
                    </>
                  ) : card.coming_soon ? (
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
