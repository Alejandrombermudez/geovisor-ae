'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  loadSlides,
  LS_INTRO_SEEN,
  type AnySlide,
  type SlidesPayload,
} from '@/lib/intro-slides'
import LogoTypewriter from './LogoTypewriter'
import WelcomePrompt from './WelcomePrompt'
import SlideHub from './SlideHub'
import SlideFlow from './SlideFlow'

export type IntroPhase = 'logo' | 'welcome' | 'hub' | 'flow'

interface Props {
  /** Fase con la que arranca (usa 'hub' al abrir manualmente desde el sidebar) */
  initialPhase: IntroPhase
  /** Nombre del usuario logueado (para el saludo del WelcomePrompt). Vacío si no aplica. */
  userName: string
  /** Mostrar saludo cuando el typewriter termina (Bancolombia recurrente).
   *  Si es false y intro no se ha visto → va directo al hub. */
  showWelcomeOnReturn: boolean
  /** Cerrar la intro y volver al mapa */
  onClose: () => void
  /** Callback para abrir la vista Metas desde la tercera card del hub */
  onOpenMetas?: () => void
}

export default function IntroOverlay({
  initialPhase,
  userName,
  showWelcomeOnReturn,
  onClose,
  onOpenMetas,
}: Props) {
  const [phase, setPhase] = useState<IntroPhase>(initialPhase)
  const [flowSlides, setFlowSlides] = useState<AnySlide[]>([])
  const [data, setData] = useState<SlidesPayload | null>(null)
  const [loadErr, setLoadErr] = useState<string | null>(null)

  // Carga el JSON de slides al montar
  useEffect(() => {
    let alive = true
    loadSlides()
      .then(d => { if (alive) setData(d) })
      .catch(e => { if (alive) setLoadErr(String(e?.message ?? e)) })
    return () => { alive = false }
  }, [])

  /** Llamado cuando termina la animación logo+typewriter */
  const handleLogoFinish = useCallback(() => {
    let seen = false
    try { seen = !!localStorage.getItem(LS_INTRO_SEEN) } catch { /* noop */ }

    if (!seen) {
      // Primera vez → directo al hub y marca como visto
      try { localStorage.setItem(LS_INTRO_SEEN, '1') } catch { /* noop */ }
      setPhase('hub')
    } else if (showWelcomeOnReturn) {
      setPhase('welcome')
    } else {
      // Si no se debe mostrar welcome, cerrar
      onClose()
    }
  }, [showWelcomeOnReturn, onClose])

  const handleCardClick = useCallback(
    (cardId: string, targets: number[]) => {
      // La tercera card (¿Cómo lo hacemos?) redirige a la vista Metas
      if (cardId === 'como') {
        onClose()
        onOpenMetas?.()
        return
      }
      if (!data || targets.length === 0) return
      const list: AnySlide[] = targets
        .map(n => data.slides[String(n) as '1' | '2' | '3' | '4' | '5'])
        .filter(Boolean) as AnySlide[]
      if (list.length === 0) return
      setFlowSlides(list)
      setPhase('flow')
    },
    [data, onClose, onOpenMetas],
  )

  const handleFlowFinish = useCallback(() => {
    setFlowSlides([])
    setPhase('hub')
  }, [])

  // ── Render ───────────────────────────────────────────────────────────────────

  if (loadErr) {
    return (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 4000,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fecaca', padding: 24, fontFamily: 'system-ui',
        }}
      >
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ marginBottom: 12, fontSize: 18, fontWeight: 700 }}>
            No se pudo cargar la presentación
          </div>
          <div style={{ fontSize: 13, marginBottom: 24, color: 'rgba(255,255,255,0.6)' }}>
            {loadErr}
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#74A884', color: '#fff', border: 'none',
              padding: '10px 24px', borderRadius: 999, cursor: 'pointer',
              fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'logo') {
    return <LogoTypewriter onFinish={handleLogoFinish} onSkip={onClose} />
  }

  if (phase === 'welcome') {
    return (
      <WelcomePrompt
        userName={userName}
        onYes={() => setPhase('hub')}
        onNo={onClose}
      />
    )
  }

  // hub y flow requieren data cargada
  if (!data) {
    return (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 4000,
          background: '#0a0a0a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontFamily: 'system-ui', fontSize: 14,
          letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.6,
        }}
      >
        Cargando…
      </div>
    )
  }

  if (phase === 'hub') {
    return (
      <SlideHub
        slide={data.slides['1']}
        onCardClick={handleCardClick}
        onClose={onClose}
      />
    )
  }
  // phase === 'flow'
  return (
    <SlideFlow
      slides={flowSlides}
      onFinish={handleFlowFinish}
      onClose={onClose}
    />
  )
}
