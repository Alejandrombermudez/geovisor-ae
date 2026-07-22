'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeftRight } from 'lucide-react'

const ROUTES: Record<string, { href: string; label: string }> = {
  '/geovisor': { href: '/geovisor-v2', label: 'Ver propuesta nueva' },
  '/geovisor-v2': { href: '/geovisor', label: 'Ver geovisor actual' },
}

/** Botón flotante para saltar entre el geovisor en producción y la propuesta en construcción.
 *  Puramente de navegación — no comparte estado con ninguna de las dos vistas. */
export default function GeovisorSwitcher() {
  const pathname = usePathname()
  const target = ROUTES[pathname]
  if (!target) return null

  return (
    <Link
      href={target.href}
      style={{
        position: 'fixed',
        top: 14,
        right: 14,
        zIndex: 5000,
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '8px 14px',
        borderRadius: 20,
        background: 'rgba(15,23,20,0.88)',
        border: '1px solid rgba(255,255,255,0.18)',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 12.5,
        fontWeight: 600,
        letterSpacing: '0.01em',
        textDecoration: 'none',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
        transition: 'background 0.15s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(23,184,166,0.92)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15,23,20,0.88)' }}
    >
      <ArrowLeftRight size={14} strokeWidth={2.25} />
      {target.label}
    </Link>
  )
}
