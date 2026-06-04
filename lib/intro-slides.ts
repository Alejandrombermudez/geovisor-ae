// Tipos y loader de la presentación intro (5 slides extraídos del PPTX).
// El JSON vive en /public/intro/slides.json y se carga con fetch.

export type SlideKind =
  | 'hero_cards'
  | 'title_stats_with_side_image'
  | 'media_left_text_right'
  | 'title_plus_2x2_grid'
  | 'title_plus_risk_list'

export interface HeroCardData {
  id: string
  title: string
  body: string
  target_slides: number[]
  enabled: boolean
  coming_soon?: boolean
}

export interface Slide1 {
  id: 'intro'
  kind: 'hero_cards'
  title: string
  subtitle: string
  background: string
  logo: string
  cards: HeroCardData[]
}

export interface Slide2 {
  id: 'punto_no_retorno'
  kind: 'title_stats_with_side_image'
  title: string
  intro: string
  background: string
  side_image: string
  stats: { value: string; label: string }[]
  footnote: string
  source: string
}

export interface Slide3 {
  id: 'servicios_ecosistemicos'
  kind: 'media_left_text_right'
  title: string
  background: string
  media: { type: 'video'; poster: string; file: string }
  text_blocks: string[]
  source: string
  source_url: string
}

export interface SlideGrid {
  id: string
  kind: 'title_plus_2x2_grid'
  title: string
  background: string
  grid: { label: string; image: string; position: string }[]
}

export interface RiskItem {
  icon: string
  heading: string
  body: string
}

export interface SlideRisks {
  id: string
  kind: 'title_plus_risk_list'
  title: string
  background: string
  risks: RiskItem[]
  source: string
}

export type AnySlide = Slide1 | Slide2 | Slide3 | SlideGrid | SlideRisks

export interface SlidesPayload {
  source: string
  dimensions: { width: number; height: number; aspect_ratio: string }
  slides: {
    '1': Slide1
    '2': Slide2
    '3': Slide3
    '4': SlideRisks
    '5': SlideGrid
  }
}

let _cache: SlidesPayload | null = null

export async function loadSlides(): Promise<SlidesPayload> {
  if (_cache) return _cache
  const res = await fetch('/intro/slides.json', { cache: 'force-cache' })
  if (!res.ok) throw new Error(`No se pudo cargar /intro/slides.json (${res.status})`)
  const data = (await res.json()) as SlidesPayload
  _cache = data
  return data
}

export const INTRO_FONT =
  "'Josefin Sans', var(--font-josefin), system-ui, -apple-system, sans-serif"

export const LS_INTRO_SEEN = 'geoae_intro_seen'
