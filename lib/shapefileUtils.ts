import type { FeatureCollection } from 'geojson'
import { COLOMBIA_BBOX } from './constants'

/**
 * Fetches a ZIP shapefile from a public URL and parses it to GeoJSON.
 * Returns null if the URL is missing, the fetch fails, or parsing fails.
 * Errors are isolated — one broken shapefile does not block the rest.
 *
 * shpjs uses browser globals (self, FileReader) so it must be imported
 * dynamically — never at module level — to avoid SSR errors.
 */
export async function fetchAndParseShapefile(
  url: string | null | undefined
): Promise<FeatureCollection | null> {
  if (!url) return null

  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.warn(`[shapefile] HTTP ${response.status} for: ${url}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    // Dynamic import keeps shpjs out of the SSR bundle
    const shp = (await import('shpjs')).default
    const geojson = await shp(arrayBuffer)

    const result: FeatureCollection = Array.isArray(geojson) ? geojson[0] : geojson
    if (!result || !result.features) return null

    warnIfOutOfBounds(result, url)
    return result
  } catch (err) {
    console.warn(`[shapefile] Failed to parse: ${url}`, err)
    return null
  }
}

/** Warn in the console if features land outside Colombia's approximate bounding box. */
function warnIfOutOfBounds(fc: FeatureCollection, url: string) {
  for (const feature of fc.features) {
    if (feature.geometry?.type === 'Point') {
      const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates
      if (
        lat < COLOMBIA_BBOX.minLat || lat > COLOMBIA_BBOX.maxLat ||
        lng < COLOMBIA_BBOX.minLng || lng > COLOMBIA_BBOX.maxLng
      ) {
        console.warn(
          `[shapefile] Coordenadas fuera de Colombia. Posible CRS incorrecto (¿MAGNA-SIRGAS?). URL: ${url}`
        )
        return
      }
    } else if (feature.geometry?.type === 'Polygon' || feature.geometry?.type === 'MultiPolygon') {
      const coords = feature.geometry.type === 'Polygon'
        ? (feature.geometry as GeoJSON.Polygon).coordinates[0]
        : (feature.geometry as GeoJSON.MultiPolygon).coordinates[0][0]
      if (coords && coords[0]) {
        const [lng, lat] = coords[0]
        if (
          lat < COLOMBIA_BBOX.minLat || lat > COLOMBIA_BBOX.maxLat ||
          lng < COLOMBIA_BBOX.minLng || lng > COLOMBIA_BBOX.maxLng
        ) {
          console.warn(
            `[shapefile] Coordenadas fuera de Colombia. Posible CRS incorrecto (¿MAGNA-SIRGAS?). URL: ${url}`
          )
          return
        }
      }
    }
  }
}
