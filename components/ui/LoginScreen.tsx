'use client'

import { useState, useEffect } from 'react'

const ACCOUNTS: Record<string, string> = {
  bancolombia: 'Bancolombia_AE_2026',
}
const DISPLAY_NAMES: Record<string, string> = {
  bancolombia: 'Bancolombia',
}
const LS_KEY = 'geoae_user'
const LS_REMEMBER = 'geoae_remember'

const JF = `'Josefin Sans', var(--font-josefin), system-ui, sans-serif`

interface Props {
  onLogin: (user: string) => void
}

export default function LoginScreen({ onLogin }: Props) {
  const [username,  setUsername]  = useState('')
  const [password,  setPassword]  = useState('')
  const [remember,  setRemember]  = useState(false)
  const [showPass,  setShowPass]  = useState(false)
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [isMobile,  setIsMobile]  = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Pre-fill si el usuario eligió recordar
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
          if (remember) {
            localStorage.setItem(LS_REMEMBER, username.trim())
          } else {
            localStorage.removeItem(LS_REMEMBER)
          }
        } catch { /* noop */ }
        onLogin(display)
      } else {
        setError('Usuario o contraseña incorrectos.')
        setLoading(false)
      }
    }, 500)
  }

  // ── Estilos compartidos ───────────────────────────────────────────────────

  const inputWrap: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: JF,
    fontWeight: 700,
    fontSize: 9,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: isMobile ? 'rgba(255,255,255,0.75)' : '#555',
  }

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    fontFamily: JF,
    fontWeight: 400,
    fontSize: 13,
    background: isMobile ? 'rgba(255,255,255,0.15)' : '#fff',
    border: 'none',
    borderBottom: `1px solid ${hasError ? '#e53e3e' : isMobile ? 'rgba(255,255,255,0.5)' : '#ccc'}`,
    borderRadius: isMobile ? 6 : 0,
    padding: isMobile ? '10px 12px' : '10px 4px',
    color: isMobile ? '#fff' : '#222',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    backdropFilter: isMobile ? 'blur(4px)' : 'none',
    transition: 'border-color 0.2s',
  })

  // ── Formulario (compartido desktop/mobile) ────────────────────────────────

  const Form = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 18 : 22, width: '100%' }}>

      {/* Usuario */}
      <div style={inputWrap}>
        <label style={labelStyle}>Usuario</label>
        <input
          type="text"
          value={username}
          autoComplete="username"
          autoCapitalize="none"
          placeholder="Ingresa tu usuario"
          onChange={e => { setUsername(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={inputStyle(!!error)}
          onFocus={e => { (e.target as HTMLInputElement).style.borderBottomColor = '#74A884' }}
          onBlur={e => { (e.target as HTMLInputElement).style.borderBottomColor = error ? '#e53e3e' : isMobile ? 'rgba(255,255,255,0.5)' : '#ccc' }}
        />
      </div>

      {/* Contraseña */}
      <div style={inputWrap}>
        <label style={labelStyle}>Contraseña</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPass ? 'text' : 'password'}
            value={password}
            autoComplete="current-password"
            placeholder="Ingresa tu contraseña"
            onChange={e => { setPassword(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ ...inputStyle(!!error), paddingRight: 36 }}
            onFocus={e => { (e.target as HTMLInputElement).style.borderBottomColor = '#74A884' }}
            onBlur={e => { (e.target as HTMLInputElement).style.borderBottomColor = error ? '#e53e3e' : isMobile ? 'rgba(255,255,255,0.5)' : '#ccc' }}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPass(v => !v)}
            style={{
              position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              color: isMobile ? 'rgba(255,255,255,0.6)' : '#999',
              display: 'flex', alignItems: 'center',
            }}
          >
            {showPass ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Recuérdame */}
      <label style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: JF, fontWeight: 300, fontSize: 11,
        color: isMobile ? 'rgba(255,255,255,0.7)' : '#777',
        cursor: 'pointer', userSelect: 'none',
      }}>
        <input
          type="checkbox"
          checked={remember}
          onChange={e => setRemember(e.target.checked)}
          style={{ accentColor: '#74A884', width: 13, height: 13, cursor: 'pointer' }}
        />
        Recuérdame
      </label>

      {/* Error */}
      {error && (
        <p style={{
          fontFamily: JF, fontSize: 11, color: isMobile ? '#fca5a5' : '#e53e3e',
          margin: 0, textAlign: 'center',
        }}>
          {error}
        </p>
      )}

      {/* Botón ingresar */}
      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          fontFamily: JF,
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          background: loading ? '#555' : isMobile ? 'rgba(255,255,255,0.92)' : '#111',
          color: isMobile ? '#111' : '#fff',
          border: 'none',
          borderRadius: isMobile ? 30 : 4,
          padding: '13px 0',
          width: '100%',
          cursor: loading ? 'wait' : 'pointer',
          transition: 'background 0.2s, opacity 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
        onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
      >
        {loading ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'ls-spin 0.8s linear infinite' }}>
              <path d="M12 2a10 10 0 0 1 10 10"/>
            </svg>
            Verificando...
          </>
        ) : 'Ingresar'}
      </button>
    </div>
  )

  // ── MOBILE: imagen de fondo + form centrado ───────────────────────────────
  if (isMobile) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        background: `url('/login-bg.jpg') center/cover no-repeat`,
        display: 'flex', flexDirection: 'column',
        fontFamily: JF,
      }}>
        {/* Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.72) 100%)' }} />

        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 32px', overflowY: 'auto' }}>

          {/* Título */}
          <div style={{
            marginTop: 56, textAlign: 'center',
            fontFamily: JF, fontWeight: 400,
            fontSize: 28, lineHeight: 1.25,
            color: '#fff', letterSpacing: '0.01em',
            marginBottom: 28,
          }}>
            Geoportal<br />Amazonia Emprende
          </div>

          {/* Logo */}
          <img
            src="/logo-ae-blanco.png"
            alt="Amazonia Emprende"
            style={{ width: 96, height: 'auto', marginBottom: 32, objectFit: 'contain' }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />

          {/* Bienvenido */}
          <p style={{
            fontFamily: JF, fontWeight: 400, fontSize: 15,
            color: '#fff', marginBottom: 24, alignSelf: 'flex-start',
          }}>
            Bienvenido
          </p>

          <Form />

          {/* Spacer */}
          <div style={{ flex: 1, minHeight: 32 }} />
        </div>

        <style>{`@keyframes ls-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ── DESKTOP: panel izquierdo (foto) + panel derecho (form) ───────────────
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 3000,
      display: 'flex',
      fontFamily: JF,
    }}>
      {/* Panel izquierdo — foto */}
      <div style={{
        flex: '0 0 50%', maxWidth: 600,
        background: `url('/login-bg.jpg') center/cover no-repeat`,
        position: 'relative',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '36px 40px',
      }}>
        {/* Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.38) 100%)' }} />

        {/* Logo arriba izquierda */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <img
            src="/logo-ae-blanco.png"
            alt="Amazonia Emprende"
            style={{ height: 56, width: 'auto', objectFit: 'contain' }}
            onError={e => {
              const el = e.currentTarget as HTMLImageElement
              el.style.display = 'none'
              const fallback = document.createElement('div')
              fallback.textContent = 'AMAZONIA EMPRENDE'
              fallback.style.cssText = `color:#fff;font-size:13px;font-weight:700;font-family:${JF};letter-spacing:0.1em`
              el.parentElement?.appendChild(fallback)
            }}
          />
        </div>

        {/* Título abajo izquierda */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontFamily: JF, fontWeight: 400, fontSize: 34,
            color: '#fff', margin: '0 0 12px',
            lineHeight: 1.2, letterSpacing: '0.01em',
          }}>
            Geoportal<br />Amazonia Emprende
          </h1>
          <p style={{
            fontFamily: JF, fontWeight: 300, fontSize: 14,
            color: 'rgba(255,255,255,0.72)', margin: 0, letterSpacing: '0.03em',
          }}>
            El futuro comienza aquí
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div style={{
        flex: 1,
        background: '#fff',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '48px 64px',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>

          {/* Título del form */}
          <h2 style={{
            fontFamily: JF, fontWeight: 400, fontSize: 26,
            color: '#111', margin: '0 0 36px',
            letterSpacing: '0.01em',
          }}>
            Te damos la bienvenida
          </h2>

          <Form />
        </div>
      </div>

      <style>{`@keyframes ls-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
