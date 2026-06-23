'use client'

interface Props {
  /** Color de acento (marca del aliado). */
  accent?: string
  /** "Sí, ver la guía" → inicia el recorrido. */
  onYes: () => void
  /** "Ahora no" → cierra (puede volver a aparecer la próxima vez). */
  onLater: () => void
  /** "No volver a mostrar" → no se vuelve a mostrar automáticamente. */
  onNever: () => void
}

/** Aviso de bienvenida que ofrece el recorrido guiado del visor. */
export default function HelpPrompt({ accent = '#14b8a6', onYes, onLater, onNever }: Props) {
  return (
    <div
      onClick={onLater}
      style={{
        position: 'fixed', inset: 0, zIndex: 6000,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(420px, 100%)',
          background: 'rgba(13,15,19,0.98)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 18,
          boxShadow: '0 28px 70px rgba(0,0,0,0.7)',
          overflow: 'hidden',
        }}
      >
        {/* Encabezado con ícono */}
        <div style={{
          padding: '26px 26px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', marginBottom: 16,
            background: `linear-gradient(135deg, ${accent} 0%, ${accent}AA 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 8px 24px ${accent}55`,
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div style={{ color: '#fff', fontSize: 21, fontWeight: 800, lineHeight: 1.25, marginBottom: 8 }}>
            ¿Te mostramos cómo funciona?
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14.5, lineHeight: 1.6, marginBottom: 22 }}>
            Un recorrido rápido te muestra para qué sirve cada opción del visor.
            Toma menos de un minuto y puedes saltarlo cuando quieras.
          </div>
        </div>

        {/* Botones */}
        <div style={{ padding: '0 26px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={onYes}
            style={{
              width: '100%', padding: '13px', borderRadius: 11, border: 'none', cursor: 'pointer',
              background: `linear-gradient(135deg, ${accent} 0%, ${accent}CC 100%)`,
              color: '#fff', fontSize: 15, fontWeight: 800, letterSpacing: '0.02em',
              boxShadow: `0 6px 18px ${accent}40`, transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Sí, ver la guía
          </button>
          <button
            onClick={onLater}
            style={{
              width: '100%', padding: '12px', borderRadius: 11, cursor: 'pointer',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)',
              color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 700, transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          >
            Ahora no
          </button>
        </div>

        {/* No volver a mostrar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={onNever}
            style={{
              width: '100%', padding: '13px', background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 600, transition: 'color 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          >
            No volver a mostrar
          </button>
        </div>
      </div>
    </div>
  )
}
