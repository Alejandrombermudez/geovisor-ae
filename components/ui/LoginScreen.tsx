'use client'

import { useState, useEffect } from 'react'

const ACCOUNTS: Record<string, string> = {
  bancolombia: 'Bancolombia_AE_2026',
}
const DISPLAY_NAMES: Record<string, string> = {
  bancolombia: 'Bancolombia',
}
const LS_KEY      = 'geoae_user'
const LS_REMEMBER = 'geoae_remember'

const JF      = `'Josefin Sans', var(--font-josefin), system-ui, sans-serif`
const PRIMARY = '#0d7377'

const BG_IMAGES = [
  '/portada/DJI_0055.jpg',
  '/portada/DSC06314.jpg',
  '/portada/DSC01817.jpg',
  '/portada/DSC02224.jpg',
]

interface Props {
  onLogin: (user: string) => void
  onClose?: () => void
}

export default function LoginScreen({ onLogin, onClose }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [bgIndex,  setBgIndex]  = useState(0)

  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )

  // Slideshow automático — cambia imagen cada 8 s con crossfade de 2 s
  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex(prev => (prev + 1) % BG_IMAGES.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Pre-fill si el usuario eligió "Recuérdame"
  useEffect(() => {
    try {
      const rem = localStorage.getItem(LS_REMEMBER)
      if (rem) { setUsername(rem); setRemember(true) }
    } catch { /* noop */ }
  }, [])

  const handleLogin = () => {
    const key = username.trim().toLowerCase()
    if (!key || !password) { setError('Completa todos los campos.'); return }
    setLoading(true)
    setError('')
    setTimeout(() => {
      if (ACCOUNTS[key] && ACCOUNTS[key] === password) {
        const display = DISPLAY_NAMES[key]
        try {
          localStorage.setItem(LS_KEY, display)
          if (remember) localStorage.setItem(LS_REMEMBER, username.trim())
          else          localStorage.removeItem(LS_REMEMBER)
        } catch { /* noop */ }
        onLogin(display)
      } else {
        setError('Usuario o contraseña incorrectos.')
        setLoading(false)
      }
    }, 500)
  }

  // ── SVG icons ─────────────────────────────────────────────────────────────
  const EyeOpen = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  )
  const EyeOff = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
  const CloseX = (
    <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
      <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )

  // ── Helpers de estilo para inputs ─────────────────────────────────────────
  const inputBorderColor = (hasErr: boolean) =>
    hasErr ? '#f87171' : 'rgba(255,255,255,0.20)'

  const inputStyle = (hasErr: boolean): React.CSSProperties => ({
    fontFamily: JF, fontWeight: 400,
    fontSize: 'clamp(13px, 0.95vw, 15px)',
    background: 'rgba(255,255,255,0.10)',
    border: `1px solid ${inputBorderColor(hasErr)}`,
    borderRadius: 'clamp(10px, 0.85vw, 14px)',
    padding: 'clamp(12px, 0.95vw, 17px) clamp(14px, 1.1vw, 18px)',
    color: '#fff',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  })

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 3000,
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      fontFamily: JF,
      overflow: 'hidden',
    }}>

      {/* ── Fondo fotográfico con crossfade ── */}
      {BG_IMAGES.map((src, i) => (
        <div
          key={src}
          style={{
            position: 'absolute', inset: 0,
            opacity: i === bgIndex ? 1 : 0,
            transition: 'opacity 2s ease-in-out',
            zIndex: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src} alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
          />
        </div>
      ))}

      {/* ── Overlay oscuro direccional ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: isMobile
          ? 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.70) 100%)'
          : 'linear-gradient(to right, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.28) 100%)',
        zIndex: 1,
      }} />

      {/* ── ZONA IZQUIERDA: Branding (solo desktop) ── */}
      {!isMobile && (
        <div style={{
          flex: '0 0 60%',
          minWidth: 0,
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'clamp(40px, 4.5vw, 96px) clamp(48px, 5.2vw, 110px)',
          overflow: 'hidden',
        }}>
          {/* Logo (esquina superior, grande) */}
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-ae-blanco.png"
              alt="Amazonia Emprende"
              style={{
                height: 'clamp(110px, 11vw, 220px)',
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
              }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
          </div>

          {/* Título + tagline (esquina inferior izquierda) */}
          <div style={{ maxWidth: '95%' }}>
            <h1 style={{
              fontFamily: JF,
              fontWeight: 400,
              fontSize: 'clamp(48px, 5.8vw, 116px)',
              color: '#fff',
              margin: '0 0 clamp(14px, 1.3vw, 28px)',
              lineHeight: 1.04,
              letterSpacing: '0.005em',
            }}>
              Geoportal<br />Amazonia Emprende
            </h1>
            <p style={{
              fontFamily: JF,
              fontWeight: 300,
              fontSize: 'clamp(16px, 1.35vw, 26px)',
              color: 'rgba(255,255,255,0.82)',
              margin: 0,
              letterSpacing: '0.04em',
            }}>
              El futuro comienza aquí
            </p>
          </div>
        </div>
      )}

      {/* ── ZONA DERECHA: Card glassmorphism ── */}
      <div style={{
        flex: isMobile ? '1' : '0 0 40%',
        minWidth: 0,
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: isMobile ? '48px' : 'clamp(32px, 3vw, 72px)',
        paddingBottom: isMobile ? '40px' : 'clamp(32px, 3vw, 72px)',
        paddingLeft: isMobile ? '24px' : 'clamp(14px, 2vw, 44px)',
        paddingRight: isMobile ? '24px' : 'clamp(44px, 5vw, 100px)',
        minHeight: '100vh',
        overflowY: 'auto',
      }}>

        {/* Botón cerrar */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 'clamp(18px, 1.8vw, 32px)',
              right: 'clamp(18px, 1.8vw, 32px)',
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '50%',
              width: 'clamp(36px, 2.6vw, 48px)',
              height: 'clamp(36px, 2.6vw, 48px)',
              cursor: 'pointer', color: 'rgba(255,255,255,0.78)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.22)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)' }}
          >
            {CloseX}
          </button>
        )}

        {/* Branding compacto mobile */}
        {isMobile && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 12, marginBottom: 28,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-ae-blanco.png"
              alt="Amazonia Emprende"
              style={{ height: 88, width: 'auto', objectFit: 'contain', opacity: 0.95 }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
            <p style={{
              color: '#fff', fontSize: 22, fontWeight: 400,
              textAlign: 'center', lineHeight: 1.25, letterSpacing: '0.01em',
              margin: 0,
            }}>
              Geoportal<br />Amazonia Emprende
            </p>
            <p style={{
              color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 300,
              margin: 0, letterSpacing: '0.04em',
            }}>
              El futuro comienza aquí
            </p>
          </div>
        )}

        {/* ── Card glassmorphism ── */}
        <div style={{
          width: '100%',
          maxWidth: isMobile ? 420 : 'clamp(340px, 24vw, 460px)',
          background: 'rgba(255,255,255,0.10)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.22)',
          borderRadius: 'clamp(20px, 1.8vw, 30px)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.55)',
          padding: isMobile ? '32px 24px' : 'clamp(32px, 2.8vw, 52px)',
        }}>

          {/* Título */}
          <h2 style={{
            color: '#fff',
            fontSize: 'clamp(20px, 1.7vw, 30px)',
            fontWeight: 700,
            margin: '0 0 clamp(6px, 0.5vw, 10px)',
            letterSpacing: '-0.005em',
            lineHeight: 1.2,
          }}>
            Te damos la bienvenida
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: 'clamp(11px, 0.85vw, 14px)',
            margin: '0 0 clamp(22px, 2vw, 36px)',
          }}>
            Ingresa tus credenciales para continuar
          </p>

          {/* ── Formulario ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 1.4vw, 24px)' }}>

            {/* Usuario */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 0.55vw, 10px)' }}>
              <label style={{
                color: 'rgba(255,255,255,0.72)',
                fontSize: 'clamp(9px, 0.68vw, 11px)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.10em',
              }}>
                Usuario
              </label>
              <input
                type="text" value={username}
                autoComplete="username" autoCapitalize="none"
                placeholder="Ingresa tu usuario"
                onChange={e => { setUsername(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="ls-input"
                style={inputStyle(!!error)}
                onFocus={e => { if (!error) (e.target as HTMLInputElement).style.borderColor = PRIMARY }}
                onBlur={e => { if (!error) (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.20)' }}
              />
            </div>

            {/* Contraseña */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 0.55vw, 10px)' }}>
              <label style={{
                color: 'rgba(255,255,255,0.72)',
                fontSize: 'clamp(9px, 0.68vw, 11px)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.10em',
              }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} value={password}
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  className="ls-input"
                  style={{ ...inputStyle(!!error), paddingRight: 48 }}
                  onFocus={e => { if (!error) (e.target as HTMLInputElement).style.borderColor = PRIMARY }}
                  onBlur={e => { if (!error) (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.20)' }}
                />
                <button
                  type="button" tabIndex={-1}
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: 'clamp(10px, 0.8vw, 14px)', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                    color: 'rgba(255,255,255,0.48)',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPass ? EyeOff : EyeOpen}
                </button>
              </div>
            </div>

            {/* Recuérdame */}
            <label style={{
              display: 'flex', alignItems: 'center',
              gap: 'clamp(8px, 0.6vw, 12px)',
              fontFamily: JF, fontWeight: 300,
              fontSize: 'clamp(12px, 0.88vw, 14px)',
              color: 'rgba(255,255,255,0.62)',
              cursor: 'pointer', userSelect: 'none',
            }}>
              <input
                type="checkbox" checked={remember}
                onChange={e => setRemember(e.target.checked)}
                style={{
                  accentColor: PRIMARY,
                  width: 'clamp(15px, 1.1vw, 18px)',
                  height: 'clamp(15px, 1.1vw, 18px)',
                  cursor: 'pointer',
                }}
              />
              Recuérdame
            </label>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.30)',
                borderRadius: 'clamp(8px, 0.7vw, 12px)',
                padding: 'clamp(8px, 0.7vw, 12px) clamp(12px, 1vw, 16px)',
                color: '#fca5a5',
                fontSize: 'clamp(12px, 0.95vw, 15px)',
                textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            {/* Botón Ingresar */}
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                fontFamily: JF, fontWeight: 700,
                fontSize: 'clamp(12px, 0.95vw, 15px)',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                background: loading
                  ? 'rgba(255,255,255,0.18)'
                  : `linear-gradient(135deg, ${PRIMARY} 0%, #14b8a6 100%)`,
                color: '#fff',
                border: 'none',
                borderRadius: 'clamp(12px, 1vw, 16px)',
                padding: 'clamp(14px, 1.1vw, 20px) 0',
                width: '100%',
                cursor: loading ? 'wait' : 'pointer',
                transition: 'opacity 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 'clamp(8px, 0.6vw, 12px)',
                boxShadow: loading ? 'none' : '0 6px 20px rgba(13,115,119,0.4)',
                marginTop: 'clamp(4px, 0.4vw, 8px)',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'ls-spin 0.8s linear infinite' }}>
                    <path d="M12 2a10 10 0 0 1 10 10"/>
                  </svg>
                  Verificando...
                </>
              ) : 'Ingresar'}
            </button>
          </div>
          {/* ── fin formulario ── */}

        </div>
      </div>

      <style>{`
        @keyframes ls-spin { to { transform: rotate(360deg); } }
        .ls-input::placeholder { color: rgba(255,255,255,0.35); }
        .ls-input::-webkit-input-placeholder { color: rgba(255,255,255,0.35); }
      `}</style>
    </div>
  )
}
