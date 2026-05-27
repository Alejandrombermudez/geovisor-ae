'use client'

import { useState, useEffect, useRef } from 'react'

const ACCOUNTS: Record<string, string> = {
  bancolombia: 'Bancolombia_AE_2026',
}

const DISPLAY_NAMES: Record<string, string> = {
  bancolombia: 'Bancolombia',
}

const AVATAR_COLORS: Record<string, string> = {
  bancolombia: '#FFB800',
}

const LS_KEY = 'geoae_user'

interface Props {
  /** Renderiza como ítem integrado en el sidebar (sin position:fixed en el botón) */
  embedded?: boolean
  showLabels?: boolean
  sidebarW?: number
}

export default function AuthButton({ embedded = false, showLabels = true, sidebarW = 140 }: Props) {
  const [user,      setUser]      = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showMenu,  setShowMenu]  = useState(false)
  const [username,  setUsername]  = useState('')
  const [password,  setPassword]  = useState('')
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [showPass,  setShowPass]  = useState(false)
  const [hovered,   setHovered]   = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY)
      if (stored) setUser(stored)
    } catch { /* noop */ }
  }, [])

  useEffect(() => {
    if (!showMenu) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

  const login = () => {
    setLoading(true)
    setError('')
    setTimeout(() => {
      const key = username.trim().toLowerCase()
      if (ACCOUNTS[key] && ACCOUNTS[key] === password) {
        const display = DISPLAY_NAMES[key]
        setUser(display)
        try { localStorage.setItem(LS_KEY, display) } catch { /* noop */ }
        setShowModal(false)
        setUsername('')
        setPassword('')
      } else {
        setError('Usuario o contraseña incorrectos.')
      }
      setLoading(false)
    }, 400)
  }

  const logout = () => {
    setUser(null)
    setShowMenu(false)
    try { localStorage.removeItem(LS_KEY) } catch { /* noop */ }
  }

  const openModal = () => {
    setError('')
    setUsername('')
    setPassword('')
    setShowPass(false)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setError('')
  }

  // ── Helpers de avatar ────────────────────────────────────────────
  const userKey   = Object.keys(DISPLAY_NAMES).find(k => DISPLAY_NAMES[k] === user) ?? ''
  const avatarColor = AVATAR_COLORS[userKey] ?? '#74A884'
  const compact   = !showLabels

  // ── Modal (siempre position:fixed) ───────────────────────────────
  const modal = showModal && (
    <div
      onClick={closeModal}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 360, maxWidth: '92vw',
          background: 'rgba(10,10,14,0.97)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '22px 24px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ color: '#fff', fontSize: 17, fontWeight: 800, letterSpacing: '0.01em', marginBottom: 4 }}>
              Iniciar sesión
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
              GeoVisor · Amazonia Emprende
            </div>
          </div>
          <button
            onClick={closeModal}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, width: 30, height: 30, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.5)', flexShrink: 0, transition: 'background 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <div style={{ padding: '20px 24px 24px' }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              onKeyDown={e => { if (e.key === 'Enter') login() }}
              autoFocus
              autoComplete="username"
              placeholder="Ingrese su usuario"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: 9, padding: '11px 13px',
                color: '#fff', fontSize: 14,
                outline: 'none', fontFamily: 'system-ui, -apple-system, sans-serif',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(116,168,132,0.6)' }}
              onBlur={e => { (e.target as HTMLInputElement).style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)' }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                onKeyDown={e => { if (e.key === 'Enter') login() }}
                autoComplete="current-password"
                placeholder="Ingrese su contraseña"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: 9, padding: '11px 42px 11px 13px',
                  color: '#fff', fontSize: 14,
                  outline: 'none', fontFamily: 'system-ui, -apple-system, sans-serif',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(116,168,132,0.6)' }}
                onBlur={e => { (e.target as HTMLInputElement).style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.35)', padding: 4, display: 'flex', alignItems: 'center',
                }}
              >
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 8, padding: '9px 12px', marginBottom: 16,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(239,68,68,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span style={{ color: 'rgba(239,68,68,0.9)', fontSize: 12, fontWeight: 500 }}>{error}</span>
            </div>
          )}

          <button
            onClick={login}
            disabled={loading || !username || !password}
            style={{
              width: '100%', padding: '12px',
              background: loading || !username || !password
                ? 'rgba(116,168,132,0.3)'
                : 'linear-gradient(135deg, #74A884 0%, #6898B8 100%)',
              border: 'none', borderRadius: 10,
              color: '#fff', fontSize: 14, fontWeight: 700,
              cursor: loading || !username || !password ? 'not-allowed' : 'pointer',
              letterSpacing: '0.02em', transition: 'opacity 0.15s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            onMouseEnter={e => { if (!loading && username && password) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
          >
            {loading ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                Verificando...
              </>
            ) : 'Ingresar'}
          </button>
        </div>
      </div>
    </div>
  )

  // ── Modo embebido (sidebar) ───────────────────────────────────────
  if (embedded) {
    const iconSize = Math.min(20, Math.max(16, Math.round(sidebarW * 0.16)))
    const avatarSize = Math.min(26, Math.max(18, Math.round(sidebarW * 0.2)))

    return (
      <>
        {modal}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        {user ? (
          // ── Logged-in: avatar + nombre + menú ─────────────────────
          <div ref={menuRef} style={{ position: 'relative', width: '100%' }}>
            {/* Menú desplegable (aparece ENCIMA del botón) */}
            {showMenu && (
              <div style={{
                position: 'absolute', bottom: 'calc(100% + 4px)', left: 8, right: 8,
                background: 'rgba(10,10,14,0.98)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, overflow: 'hidden',
                boxShadow: '0 -8px 32px rgba(0,0,0,0.7)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                zIndex: 10,
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}>
                {!compact && (
                  <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
                      Sesión activa
                    </div>
                    <div style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{user}</div>
                  </div>
                )}
                <button
                  onClick={logout}
                  style={{
                    width: '100%', background: 'transparent',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                    justifyContent: compact ? 'center' : 'flex-start',
                    padding: compact ? '11px 4px' : '10px 12px',
                    color: 'rgba(255,100,100,0.85)',
                    fontSize: 11, fontWeight: 600, transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,80,80,0.08)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  {!compact && 'Cerrar sesión'}
                </button>
              </div>
            )}

            <button
              onClick={() => setShowMenu(v => !v)}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              title={compact ? user : undefined}
              style={{
                width: '100%', background: showMenu
                  ? `${avatarColor}14`
                  : hovered ? `${avatarColor}0D` : 'transparent',
                border: 'none',
                borderLeft: `4px solid ${showMenu || hovered ? avatarColor : 'transparent'}`,
                borderTop: '1px solid rgba(255,255,255,0.06)',
                color: showMenu || hovered ? avatarColor : `${avatarColor}BB`,
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 4, padding: '11px 4px',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Avatar circular */}
              <div style={{
                width: avatarSize, height: avatarSize, borderRadius: '50%',
                background: `linear-gradient(135deg, ${avatarColor} 0%, ${avatarColor}99 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: Math.round(avatarSize * 0.42), fontWeight: 800, color: '#000',
                flexShrink: 0, boxShadow: showMenu || hovered ? `0 0 10px ${avatarColor}55` : 'none',
                transition: 'box-shadow 0.2s ease',
              }}>
                {user.charAt(0).toUpperCase()}
              </div>
              {!compact && (
                <span style={{
                  fontSize: sidebarW > 160 ? 11 : 10,
                  fontWeight: 700, lineHeight: 1.2,
                  letterSpacing: '0.03em',
                  textAlign: 'center',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  maxWidth: sidebarW - 20,
                }}>
                  {user}
                </span>
              )}
            </button>
          </div>
        ) : (
          // ── Not logged-in: botón de acceso ────────────────────────
          <button
            onClick={openModal}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            title={compact ? 'Iniciar sesión' : undefined}
            style={{
              width: '100%', background: hovered ? 'rgba(255,255,255,0.07)' : 'transparent',
              border: 'none',
              borderLeft: `4px solid ${hovered ? 'rgba(255,255,255,0.35)' : 'transparent'}`,
              borderTop: '1px solid rgba(255,255,255,0.06)',
              color: hovered ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.35)',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 4, padding: '11px 4px',
              transition: 'all 0.2s ease',
            }}
          >
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {!compact && (
              <span style={{
                fontSize: sidebarW > 160 ? 11 : 10,
                fontWeight: 700, lineHeight: 1.3,
                letterSpacing: '0.04em', textTransform: 'uppercase',
                textAlign: 'center',
              }}>
                Iniciar<br />sesión
              </span>
            )}
          </button>
        )}
      </>
    )
  }

  // ── Modo flotante (standalone, para compatibilidad) ──────────────
  const btnBase: React.CSSProperties = {
    position: 'fixed', top: 16, right: 16, zIndex: 1100,
    display: 'flex', alignItems: 'center', gap: 8,
    padding: user ? '7px 13px 7px 10px' : '7px 14px',
    background: 'rgba(12,12,14,0.82)',
    border: '1px solid rgba(255,255,255,0.13)',
    borderRadius: 40, color: '#fff', fontSize: 12, fontWeight: 600,
    fontFamily: 'system-ui, -apple-system, sans-serif', cursor: 'pointer',
    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.45)', transition: 'background 0.15s ease',
    letterSpacing: '0.02em', userSelect: 'none',
  }

  return (
    <>
      {modal}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {user ? (
        <div ref={menuRef} style={{ position: 'fixed', top: 16, right: 16, zIndex: 1100 }}>
          <button style={btnBase} onClick={() => setShowMenu(v => !v)}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(30,30,35,0.92)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(12,12,14,0.82)' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#000', flexShrink: 0 }}>
              {user.charAt(0)}
            </div>
            <span>{user}</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: 2, opacity: 0.6, transform: showMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {showMenu && (
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: 'rgba(12,12,14,0.96)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', minWidth: 160, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Sesión activa</div>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{user}</div>
              </div>
              <button onClick={logout} style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', color: 'rgba(255,100,100,0.85)', fontSize: 12, fontWeight: 600, transition: 'background 0.15s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,80,80,0.08)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      ) : (
        <button style={btnBase} onClick={openModal}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(30,30,35,0.92)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(12,12,14,0.82)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          Iniciar sesión
        </button>
      )}
    </>
  )
}
