'use client'

import { useEffect, useState } from 'react'
import { INTRO_FONT } from '@/lib/intro-slides'

interface Props {
  /** Disparada cuando termina toda la animación (logo + typewriter + pausa) */
  onFinish: () => void
  /** Disparada al hacer clic en "Saltar" */
  onSkip: () => void
}

const TEXT = 'AMAZONIA EMPRENDE'
const CHAR_DELAY = 90        // ms entre cada letra
const HOLD_AFTER = 900       // ms que se mantiene la pantalla tras terminar
const LOGO_FADE  = 700       // ms de fade-in del logo

export default function LogoTypewriter({ onFinish, onSkip }: Props) {
  const [logoIn, setLogoIn] = useState(false)
  const [typed,  setTyped]  = useState('')

  // 1. Fade-in del logo
  useEffect(() => {
    const t = setTimeout(() => setLogoIn(true), 60)
    return () => clearTimeout(t)
  }, [])

  // 2. Typewriter del texto tras logoFade
  useEffect(() => {
    if (!logoIn) return
    const start = setTimeout(() => {
      let i = 0
      const id = setInterval(() => {
        i += 1
        setTyped(TEXT.slice(0, i))
        if (i >= TEXT.length) {
          clearInterval(id)
          setTimeout(onFinish, HOLD_AFTER)
        }
      }, CHAR_DELAY)
    }, LOGO_FADE)
    return () => clearTimeout(start)
  }, [logoIn, onFinish])

  return (
    <div
      role="dialog"
      aria-label="Bienvenida a Amazonia Emprende"
      style={{
        position: 'fixed', inset: 0, zIndex: 4000,
        background: '#ffffff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column',
        fontFamily: INTRO_FONT,
        overflow: 'hidden',
      }}
    >
      {/* Skip top-right */}
      <button
        onClick={onSkip}
        style={{
          position: 'absolute', top: 24, right: 28,
          background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)',
          color: '#48604D', fontFamily: INTRO_FONT,
          fontSize: 13, fontWeight: 600, letterSpacing: '0.06em',
          padding: '8px 16px', borderRadius: 999, cursor: 'pointer',
          textTransform: 'uppercase',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.08)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
      >
        Saltar ›
      </button>

      {/* Logo + texto */}
      <div
        style={{
          display: 'flex', alignItems: 'center',
          gap: 'clamp(20px, 4vw, 56px)',
          padding: '0 24px',
          maxWidth: '90vw',
        }}
      >
        <img
          src="/logo-ae-blanco.png"
          alt="Amazonia Emprende"
          style={{
            width: 'clamp(110px, 18vw, 220px)',
            height: 'auto',
            objectFit: 'contain',
            opacity: logoIn ? 1 : 0,
            transform: logoIn ? 'scale(1)' : 'scale(0.88)',
            filter: 'invert(28%) sepia(34%) saturate(395%) hue-rotate(83deg) brightness(91%) contrast(86%)',
            transition: `opacity ${LOGO_FADE}ms ease, transform ${LOGO_FADE}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        />

        <h1
          style={{
            margin: 0,
            color: '#48604D',
            fontFamily: INTRO_FONT,
            fontWeight: 300,
            fontSize: 'clamp(28px, 5.2vw, 64px)',
            letterSpacing: '0.06em',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span>{typed}</span>
          <span
            aria-hidden
            style={{
              display: 'inline-block',
              width: '0.06em',
              height: '0.85em',
              marginLeft: '0.12em',
              background: '#74A884',
              animation: 'introCaretBlink 0.8s steps(2, start) infinite',
            }}
          />
        </h1>
      </div>

      {/* Línea decorativa abajo */}
      <div
        style={{
          position: 'absolute', bottom: 36, left: '50%',
          transform: 'translateX(-50%)',
          width: 'clamp(140px, 22vw, 280px)',
          height: 2,
          background: 'linear-gradient(90deg, transparent, #74A884, transparent)',
          opacity: logoIn ? 0.8 : 0,
          transition: `opacity ${LOGO_FADE + 400}ms ease`,
        }}
      />

      <style>{`
        @keyframes introCaretBlink {
          0%, 49%   { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
