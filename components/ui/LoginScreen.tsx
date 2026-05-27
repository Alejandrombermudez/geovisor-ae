'use client'

import { useState, useEffect } from 'react'

const ACCOUNTS: Record<string, string> = {
  bancolombia: 'Bancolombia_AE_2026',
}
const DISPLAY_NAMES: Record<string, string> = {
  bancolombia: 'Bancolombia',
}
const LS_KEY     = 'geoae_user'
const LS_REMEMBER = 'geoae_remember'

const JF = `'Josefin Sans', var(--font-josefin), system-ui, sans-serif`

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

  // Inicializa con el valor real para evitar flash desktop→mobile
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )

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

  // ── Valores de estilo que dependen de isMobile ────────────────────────────
  const labelColor   = isMobile ? 'rgba(255,255,255,0.75)' : '#555'
  const inputBg      = isMobile ? 'rgba(255,255,255,0.15)' : '#fff'
  const inputColor   = isMobile ? '#fff'                   : '#222'
  const inputRadius  = isMobile ? 6 : 0
  const inputPadding = isMobile ? '10px 12px' : '10px 4px'
  const inputBdBlur  = isMobile ? 'blur(4px)'  : 'none'
  const inputBorder  = (hasErr: boolean) =>
    `1px solid ${hasErr ? '#e53e3e' : isMobile ? 'rgba(255,255,255,0.5)' : '#ccc'}`
  const focusColor   = '#74A884'
  const blurBorder   = (hasErr: boolean) =>
    hasErr ? '#e53e3e' : isMobile ? 'rgba(255,255,255,0.5)' : '#ccc'

  // ── SVG ojo ──────────────────────────────────────────────────────────────
  const EyeOpen = (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  )
  const EyeOff = (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
  const CloseX = (
    <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
      <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )

  // ── MOBILE ────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        background: `url('/login-bg.jpg') center/cover no-repeat`,
        display: 'flex', flexDirection: 'column',
        fontFamily: JF,
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.72) 100%)' }} />

        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 32px', overflowY: 'auto' }}>

          {/* Botón cerrar */}
          {onClose && (
            <button onClick={onClose} style={{
              position: 'absolute', top: 16, right: 0,
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
              width: 34, height: 34, cursor: 'pointer', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(6px)',
            }}>
              {CloseX}
            </button>
          )}

          {/* Título */}
          <div style={{ marginTop: 56, textAlign: 'center', fontFamily: JF, fontWeight: 400, fontSize: 28, lineHeight: 1.25, color: '#fff', letterSpacing: '0.01em', marginBottom: 28 }}>
            Geoportal<br />Amazonia Emprende
          </div>

          {/* Logo */}
          <img src="/logo-ae-blanco.png" alt="Amazonia Emprende"
            style={{ width: 96, height: 'auto', marginBottom: 32, objectFit: 'contain' }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />

          {/* Bienvenido */}
          <p style={{ fontFamily: JF, fontWeight: 400, fontSize: 15, color: '#fff', marginBottom: 24, alignSelf: 'flex-start' }}>
            Bienvenido
          </p>

          {/* ── FORM (inlineado — no sub-componente) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%' }}>

            {/* Usuario */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontFamily: JF, fontWeight: 700, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: labelColor }}>Usuario</label>
              <input
                type="text" value={username} autoComplete="username" autoCapitalize="none"
                placeholder="Ingresa tu usuario"
                onChange={e => { setUsername(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{ fontFamily: JF, fontWeight: 400, fontSize: 13, background: inputBg, border: 'none', borderBottom: inputBorder(!!error), borderRadius: inputRadius, padding: inputPadding, color: inputColor, outline: 'none', width: '100%', boxSizing: 'border-box', backdropFilter: inputBdBlur, transition: 'border-color 0.2s' }}
                onFocus={e => { (e.target as HTMLInputElement).style.borderBottomColor = focusColor }}
                onBlur={e => { (e.target as HTMLInputElement).style.borderBottomColor = blurBorder(!!error) }}
              />
            </div>

            {/* Contraseña */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontFamily: JF, fontWeight: 700, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: labelColor }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} value={password} autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  style={{ fontFamily: JF, fontWeight: 400, fontSize: 13, background: inputBg, border: 'none', borderBottom: inputBorder(!!error), borderRadius: inputRadius, padding: inputPadding, paddingRight: 36, color: inputColor, outline: 'none', width: '100%', boxSizing: 'border-box', backdropFilter: inputBdBlur, transition: 'border-color 0.2s' }}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderBottomColor = focusColor }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderBottomColor = blurBorder(!!error) }}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center' }}>
                  {showPass ? EyeOff : EyeOpen}
                </button>
              </div>
            </div>

            {/* Recuérdame */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: JF, fontWeight: 300, fontSize: 11, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', userSelect: 'none' }}>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                style={{ accentColor: '#74A884', width: 13, height: 13, cursor: 'pointer' }} />
              Recuérdame
            </label>

            {/* Error */}
            {error && <p style={{ fontFamily: JF, fontSize: 11, color: '#fca5a5', margin: 0, textAlign: 'center' }}>{error}</p>}

            {/* Botón */}
            <button onClick={handleLogin} disabled={loading}
              style={{ fontFamily: JF, fontWeight: 700, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', background: loading ? '#555' : 'rgba(255,255,255,0.92)', color: '#111', border: 'none', borderRadius: 30, padding: '13px 0', width: '100%', cursor: loading ? 'wait' : 'pointer', transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}>
              {loading ? (<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'ls-spin 0.8s linear infinite' }}><path d="M12 2a10 10 0 0 1 10 10"/></svg>Verificando...</>) : 'Ingresar'}
            </button>
          </div>
          {/* ── fin form ── */}

          <div style={{ flex: 1, minHeight: 32 }} />
        </div>

        <style>{`@keyframes ls-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', fontFamily: JF }}>

      {/* Panel izquierdo — foto (60%, sin maxWidth, todo más grande) */}
      <div style={{
        flex: '0 0 60%',
        background: `url('/login-bg.jpg') center/cover no-repeat`,
        position: 'relative',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: 'clamp(36px, 4.5vw, 80px) clamp(40px, 5vw, 88px)',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.38) 100%)' }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <img src="/logo-ae-blanco.png" alt="Amazonia Emprende"
            style={{ height: 'clamp(72px, 7.5vw, 130px)', width: 'auto', objectFit: 'contain' }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        </div>

        {/* Tagline */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontFamily: JF, fontWeight: 400,
            fontSize: 'clamp(40px, 4.6vw, 78px)',
            color: '#fff', margin: '0 0 16px',
            lineHeight: 1.08, letterSpacing: '0.005em',
          }}>
            Geoportal<br />Amazonia Emprende
          </h1>
          <p style={{
            fontFamily: JF, fontWeight: 300,
            fontSize: 'clamp(16px, 1.4vw, 22px)',
            color: 'rgba(255,255,255,0.78)',
            margin: 0, letterSpacing: '0.04em',
          }}>
            El futuro comienza aquí
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario (40%) */}
      <div style={{
        flex: '0 0 40%',
        minWidth: 420,
        background: '#fff',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: 'clamp(24px, 2.6vw, 56px) clamp(32px, 3.6vw, 72px)',
        overflow: 'hidden', position: 'relative',
      }}>

        {/* Botón cerrar */}
        {onClose && (
          <button onClick={onClose} style={{
            position: 'absolute', top: 24, right: 28,
            background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '50%',
            width: 44, height: 44, cursor: 'pointer', color: '#555',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.12)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.06)' }}>
            <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        )}

        <div style={{ width: '100%', maxWidth: 'clamp(340px, 26vw, 480px)' }}>
          <h2 style={{
            fontFamily: JF, fontWeight: 300,
            fontSize: 'clamp(26px, 2.2vw, 38px)',
            color: '#111', margin: '0 0 clamp(20px, 2vw, 32px)',
            letterSpacing: '0.005em', lineHeight: 1.2,
          }}>
            Te damos la bienvenida
          </h2>

          {/* ── FORM (inlineado — no sub-componente) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 1.4vw, 24px)', width: '100%' }}>

            {/* Usuario */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{
                fontFamily: JF, fontWeight: 700,
                fontSize: 'clamp(10px, 0.85vw, 13px)',
                letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555',
              }}>Usuario</label>
              <input
                type="text" value={username} autoComplete="username" autoCapitalize="none"
                placeholder="Ingresa tu usuario"
                onChange={e => { setUsername(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{
                  fontFamily: JF, fontWeight: 400,
                  fontSize: 'clamp(14px, 1.05vw, 17px)',
                  background: '#fff', border: 'none', borderBottom: inputBorder(!!error),
                  borderRadius: 0, padding: '11px 4px',
                  color: '#222', outline: 'none', width: '100%', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { (e.target as HTMLInputElement).style.borderBottomColor = focusColor }}
                onBlur={e => { (e.target as HTMLInputElement).style.borderBottomColor = blurBorder(!!error) }}
              />
            </div>

            {/* Contraseña */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{
                fontFamily: JF, fontWeight: 700,
                fontSize: 'clamp(10px, 0.85vw, 13px)',
                letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555',
              }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} value={password} autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  style={{
                    fontFamily: JF, fontWeight: 400,
                    fontSize: 'clamp(14px, 1.05vw, 17px)',
                    background: '#fff', border: 'none', borderBottom: inputBorder(!!error),
                    borderRadius: 0, padding: '11px 4px', paddingRight: 44,
                    color: '#222', outline: 'none', width: '100%', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderBottomColor = focusColor }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderBottomColor = blurBorder(!!error) }}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: '#999',
                    display: 'flex', alignItems: 'center',
                  }}>
                  {showPass ? EyeOff : EyeOpen}
                </button>
              </div>
            </div>

            {/* Recuérdame */}
            <label style={{
              display: 'flex', alignItems: 'center', gap: 10,
              fontFamily: JF, fontWeight: 300,
              fontSize: 'clamp(13px, 0.95vw, 16px)',
              color: '#777', cursor: 'pointer', userSelect: 'none',
            }}>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                style={{ accentColor: '#74A884', width: 16, height: 16, cursor: 'pointer' }} />
              Recuérdame
            </label>

            {/* Error */}
            {error && <p style={{
              fontFamily: JF, fontSize: 'clamp(13px, 0.95vw, 15px)',
              color: '#e53e3e', margin: 0, textAlign: 'center',
            }}>{error}</p>}

            {/* Botón */}
            <button onClick={handleLogin} disabled={loading}
              style={{
                fontFamily: JF, fontWeight: 700,
                fontSize: 'clamp(13px, 0.95vw, 15px)',
                letterSpacing: '0.14em', textTransform: 'uppercase',
                background: loading ? '#555' : '#111', color: '#fff',
                border: 'none', borderRadius: 6,
                padding: 'clamp(12px, 1vw, 16px) 0', width: '100%',
                cursor: loading ? 'wait' : 'pointer',
                transition: 'opacity 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                marginTop: 4,
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}>
              {loading ? (<><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'ls-spin 0.8s linear infinite' }}><path d="M12 2a10 10 0 0 1 10 10"/></svg>Verificando...</>) : 'Ingresar'}
            </button>
          </div>
          {/* ── fin form ── */}
        </div>
      </div>

      <style>{`@keyframes ls-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
