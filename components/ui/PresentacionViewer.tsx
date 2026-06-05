'use client'

import { useCallback, useEffect, useState } from 'react'

interface Props {
  titulo: string
  /** Carpeta base de las imágenes (ej. "/gaval/plan-siembra"). */
  basePath: string
  /** Número de páginas. */
  paginas: number
  /** Color de acento (marca del aliado). */
  accent?: string
  onClose: () => void
}

const JF = `'Josefin Sans', var(--font-josefin), system-ui, sans-serif`

function pageUrl(basePath: string, n: number): string {
  return `${basePath}/page-${String(n).padStart(2, '0')}.webp`
}

export default function PresentacionViewer({
  titulo, basePath, paginas, accent = '#0E9384', onClose,
}: Props) {
  const [page, setPage] = useState(1) // arranca en la primera hoja

  const next = useCallback(() => setPage(p => Math.min(paginas, p + 1)), [paginas])
  const prev = useCallback(() => setPage(p => Math.max(1, p - 1)), [])

  // Teclado: avanzar / retroceder / cerrar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if ([' ', 'Enter', 'ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key)) { e.preventDefault(); next() }
      else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); prev() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, onClose])

  // Precargar la página siguiente y la anterior
  useEffect(() => {
    const urls = [page + 1, page - 1].filter(n => n >= 1 && n <= paginas).map(n => pageUrl(basePath, n))
    urls.forEach(u => { const img = new Image(); img.src = u })
  }, [page, paginas, basePath])

  const isFirst = page <= 1
  const isLast = page >= paginas

  const arrowBtn = (dir: 'prev' | 'next', disabled: boolean, onClick: () => void) => (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      disabled={disabled}
      aria-label={dir === 'prev' ? 'Anterior' : 'Siguiente'}
      style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        [dir === 'prev' ? 'left' : 'right']: 'clamp(12px, 2vw, 32px)',
        width: 'clamp(44px, 4vw, 60px)', height: 'clamp(44px, 4vw, 60px)',
        borderRadius: '50%',
        background: disabled ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.2)',
        color: disabled ? 'rgba(255,255,255,0.2)' : '#fff',
        fontSize: 26, cursor: disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)', transition: 'background 0.15s ease',
        zIndex: 3,
      } as React.CSSProperties}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.22)' }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
    >
      {dir === 'prev' ? '‹' : '›'}
    </button>
  )

  return (
    <div
      onClick={next}
      style={{
        position: 'fixed', inset: 0, zIndex: 4000,
        background: 'radial-gradient(ellipse at center, #14181a 0%, #0a0a0a 100%)',
        fontFamily: JF, color: '#fff',
        display: 'flex', flexDirection: 'column',
        cursor: isLast ? 'default' : 'pointer',
        userSelect: 'none',
      }}
    >
      {/* Header */}
      <header
        onClick={e => e.stopPropagation()}
        style={{
          flexShrink: 0, cursor: 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'clamp(14px, 1.6vw, 24px) clamp(20px, 2.4vw, 40px)',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.6), transparent)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 1.4vw, 20px)', minWidth: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-ae-blanco.png" alt="" style={{ height: 'clamp(34px, 3vw, 52px)', width: 'auto', objectFit: 'contain' }} />
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 'clamp(15px, 1.4vw, 22px)', fontWeight: 700, lineHeight: 1.15,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {titulo}
            </div>
            <div style={{ fontSize: 'clamp(11px, 0.9vw, 14px)', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em' }}>
              Página {page} de {paginas}
            </div>
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onClose() }}
          aria-label="Cerrar presentación"
          style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', fontSize: 22, flexShrink: 0,
            width: 'clamp(40px, 3.4vw, 52px)', height: 'clamp(40px, 3.4vw, 52px)',
            borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)', transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
        >
          ✕
        </button>
      </header>

      {/* Página actual */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(8px, 1.5vw, 28px) clamp(56px, 7vw, 110px)' }}>
        {arrowBtn('prev', isFirst, prev)}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={page}
          src={pageUrl(basePath, page)}
          alt={`${titulo} — página ${page}`}
          style={{
            maxWidth: '100%', maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: 10,
            boxShadow: '0 24px 70px rgba(0,0,0,0.6)',
            animation: 'presFade 0.35s ease',
          }}
        />
        {arrowBtn('next', isLast, next)}
      </div>

      {/* Puntos de página */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          flexShrink: 0, cursor: 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: 'clamp(12px, 1.4vh, 22px)',
        }}
      >
        {Array.from({ length: paginas }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            onClick={() => setPage(n)}
            aria-label={`Ir a la página ${n}`}
            style={{
              width: n === page ? 26 : 9, height: 9, borderRadius: 5, border: 'none', padding: 0,
              cursor: 'pointer',
              background: n === page ? accent : 'rgba(255,255,255,0.28)',
              transition: 'all 0.25s ease',
            }}
          />
        ))}
      </div>

      <style>{`@keyframes presFade { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }`}</style>
    </div>
  )
}
