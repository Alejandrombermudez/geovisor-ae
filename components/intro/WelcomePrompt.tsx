'use client'

import { useEffect, useState } from 'react'
import { INTRO_FONT } from '@/lib/intro-slides'

interface Props {
  userName: string
  onYes: () => void
  onNo: () => void
}

export default function WelcomePrompt({ userName, onYes, onNo }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      role="dialog"
      aria-labelledby="welcome-prompt-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 4000,
        background: '#ffffff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(24px, 4vw, 56px)',
        fontFamily: INTRO_FONT,
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.78)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid rgba(116,168,132,0.25)',
          boxShadow:
            '0 30px 80px rgba(72, 96, 77, 0.18), 0 4px 16px rgba(116,168,132,0.18)',
          borderRadius: 24,
          padding: 'clamp(28px, 4vw, 56px) clamp(28px, 5vw, 64px)',
          maxWidth: 560,
          width: '100%',
          textAlign: 'center',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(18px)',
          transition: 'opacity 0.4s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* Logo pequeño verde */}
        <img
          src="/logo-ae-blanco.png"
          alt="Amazonia Emprende"
          style={{
            width: 76, height: 'auto', objectFit: 'contain',
            margin: '0 auto 18px',
            display: 'block',
            filter: 'invert(28%) sepia(34%) saturate(395%) hue-rotate(83deg) brightness(91%) contrast(86%)',
          }}
        />

        <div
          style={{
            color: '#74A884', fontWeight: 700,
            fontSize: 11, letterSpacing: '0.18em',
            textTransform: 'uppercase', marginBottom: 10,
          }}
        >
          Hola {userName}
        </div>

        <h2
          id="welcome-prompt-title"
          style={{
            margin: 0,
            color: '#2A3A2E',
            fontFamily: INTRO_FONT,
            fontSize: 'clamp(22px, 3.4vw, 32px)',
            fontWeight: 300,
            lineHeight: 1.25,
            letterSpacing: '0.01em',
            marginBottom: 14,
          }}
        >
          Amazonia Emprende te da la bienvenida
        </h2>

        <p
          style={{
            margin: 0,
            color: '#4F5C53',
            fontSize: 'clamp(14px, 1.6vw, 16px)',
            fontWeight: 400,
            lineHeight: 1.55,
            marginBottom: 32,
          }}
        >
          ¿Quieres conocer más sobre nuestro proyecto?
        </p>

        <div
          style={{
            display: 'flex', gap: 14, justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={onYes}
            style={{
              background: 'linear-gradient(135deg, #74A884 0%, #6898B8 100%)',
              color: '#fff',
              fontFamily: INTRO_FONT,
              fontSize: 14, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              border: 'none', borderRadius: 999,
              padding: '13px 38px', cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(116,168,132,0.4)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(116,168,132,0.5)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(116,168,132,0.4)'
            }}
          >
            Sí, mostrar
          </button>

          <button
            onClick={onNo}
            style={{
              background: 'transparent',
              color: '#48604D',
              fontFamily: INTRO_FONT,
              fontSize: 14, fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              border: '1.5px solid rgba(72,96,77,0.3)', borderRadius: 999,
              padding: '13px 38px', cursor: 'pointer',
              transition: 'background 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(72,96,77,0.05)'
              e.currentTarget.style.borderColor = 'rgba(72,96,77,0.5)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(72,96,77,0.3)'
            }}
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  )
}
