import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import type { KpisV2, PredioProcesoV2, PredioConservacionV2 } from '@/types/geovisor-v2'

// ─────────────────────────────────────────────────────────────────────────
// Indicadores REALES para el geovisor v2. Todo se calcula en vivo desde
// Supabase (solo lectura). Lo que no tiene fuente todavía (árboles
// sembrados, carbono) se devuelve null y la UI lo muestra como "—":
// el dato aparece cuando existan los módulos Plan/Ejecución/MRV.
//
// Fuentes por indicador:
//  · ha en restauración (SIG)  → geo.zonas tipo='restauracion', estado≠descartada
//  · bosque en conservación    → Σ ras.familias.ha_bosque
//  · árboles semilleros        → count ras.arboles_semilleros + especies distintas
//  · municipios/departamentos  → unión core.predios ∪ ras.familias (normalizada)
//  · familias vinculadas       → count ras.familias (+ siembra.familias cuando haya)
//  · fichas de predio          → core.predios+expedientes+juridica+geo.zonas (proceso)
//                                ras.v_indicadores_predio+ras.familias (conservación)
// ─────────────────────────────────────────────────────────────────────────

/** Clave de deduplicación tolerante a mayúsculas/tildes (MORELIA ≡ Morelia, Caqueta ≡ Caquetá) */
function normKey(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()
}

type ZonaRow = {
  predio_id: string
  tipo: string
  estado: string
  area_ha: number | null
  geom: { type: string; coordinates: number[][][][] } | null
}

/** Centro del bounding box del primer polígono (suficiente para centrar la ficha) */
function bboxCenter(geom: ZonaRow['geom']): { lat: number; lng: number } | null {
  const ring = geom?.coordinates?.[0]?.[0]
  if (!ring || ring.length === 0) return null
  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity
  for (const [lng, lat] of ring) {
    if (lng < minLng) minLng = lng
    if (lng > maxLng) maxLng = lng
    if (lat < minLat) minLat = lat
    if (lat > maxLat) maxLat = lat
  }
  return { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 }
}

export async function GET() {
  const sb = createServiceClient()

  const [zonasQ, prediosQ, expsQ, anasQ, rasFamiliasQ, arbolesQ, indicadoresQ, siembraFamiliasQ] = await Promise.all([
    sb.schema('geo').from('zonas').select('predio_id, tipo, estado, area_ha, geom'),
    sb.schema('core').from('predios').select('id, nombre_predio, municipio, departamento, vereda, zona_ae, area_registral, aliados:aliado_id(nombre_completo)'),
    sb.schema('core').from('expedientes').select('predio_id, etapa'),
    sb.schema('juridica').from('analisis_juridico').select('predio_id, semaforo'),
    sb.schema('ras').from('familias').select('id, nombre_finca, municipio, departamento, vereda, nucleo, ha_bosque, adultos, ninos, acuerdo_conservacion'),
    sb.schema('ras').from('arboles_semilleros').select('especie_id, nucleo, predio, latitud, longitud'),
    sb.schema('ras').from('v_indicadores_predio').select('*'),
    sb.schema('siembra').from('familias').select('id', { count: 'exact', head: true }),
  ])

  const errors = [zonasQ, prediosQ, expsQ, anasQ, rasFamiliasQ, arbolesQ, indicadoresQ, siembraFamiliasQ]
    .map((q, i) => (q.error ? `${['geo.zonas', 'core.predios', 'core.expedientes', 'juridica.analisis', 'ras.familias', 'ras.arboles', 'ras.v_indicadores', 'siembra.familias'][i]}: ${q.error.message}` : null))
    .filter(Boolean) as string[]

  const zonas = (zonasQ.data ?? []) as unknown as ZonaRow[]
  const predios = prediosQ.data ?? []
  const exps = expsQ.data ?? []
  const anas = anasQ.data ?? []
  const rasFamilias = rasFamiliasQ.data ?? []
  const arboles = arbolesQ.data ?? []
  const indicadores = indicadoresQ.data ?? []
  const siembraFamiliasCount = siembraFamiliasQ.count ?? 0

  // ── KPIs globales ──────────────────────────────────────────────────────
  const zonasRest = zonas.filter((z) => z.tipo === 'restauracion' && z.estado !== 'descartada')
  const haRestauracionSig = Math.round(zonasRest.reduce((s, z) => s + (z.area_ha ?? 0), 0) * 10) / 10
  const haBosqueConservacion = Math.round(rasFamilias.reduce((s, f) => s + (f.ha_bosque ?? 0), 0) * 10) / 10

  const municipioSet = new Map<string, string>()
  const departamentoSet = new Map<string, string>()
  for (const p of predios) {
    if (p.municipio) municipioSet.set(normKey(p.municipio), p.municipio)
    if (p.departamento) departamentoSet.set(normKey(p.departamento), p.departamento)
  }
  for (const f of rasFamilias) {
    if (f.municipio) municipioSet.set(normKey(f.municipio), f.municipio)
    if (f.departamento) departamentoSet.set(normKey(f.departamento), f.departamento)
  }

  const kpis: KpisV2 = {
    haRestauracionSig,
    prediosProceso: predios.length,
    haBosqueConservacion,
    familiasConAcuerdo: rasFamilias.filter((f) => f.acuerdo_conservacion).length,
    arbolesSemilleros: arboles.length,
    especiesRas: new Set(arboles.map((a) => a.especie_id).filter(Boolean)).size,
    municipios: municipioSet.size,
    departamentos: departamentoSet.size,
    familiasVinculadas: rasFamilias.length + siembraFamiliasCount,
    personas: rasFamilias.reduce((s, f) => s + (f.adultos ?? 0) + (f.ninos ?? 0), 0),
    arbolesSembrados: null,
    carbonoTco2e: null,
  }

  // ── Fichas: predios del proceso (core + geo + jurídica) ────────────────
  const expByPredio = new Map(exps.map((e) => [e.predio_id, e]))
  const anaByPredio = new Map(anas.map((a) => [a.predio_id, a]))

  const prediosProceso: PredioProcesoV2[] = predios.map((p) => {
    const zp = zonas.filter((z) => z.predio_id === p.id)
    const zRest = zp.filter((z) => z.tipo === 'restauracion' && z.estado !== 'descartada')
    const zFinca = zp.filter((z) => z.tipo === 'finca')
    const firstGeom = (zFinca[0] ?? zRest[0])?.geom ?? null
    // El tipo del embed aliados:aliado_id(...) llega como objeto, no array
    const aliado = (p as unknown as { aliados: { nombre_completo: string } | null }).aliados
    return {
      tipo: 'proceso',
      id: p.id,
      nombre: p.nombre_predio ?? 'Predio sin nombre',
      aliado: aliado?.nombre_completo ?? '—',
      municipio: p.municipio,
      departamento: p.departamento,
      vereda: p.vereda,
      nucleo: p.zona_ae,
      etapa: expByPredio.get(p.id)?.etapa ?? null,
      semaforo: anaByPredio.get(p.id)?.semaforo ?? null,
      areaRegistralHa: p.area_registral,
      areaFincaSigHa: zFinca.length ? Math.round(zFinca.reduce((s, z) => s + (z.area_ha ?? 0), 0) * 10) / 10 : null,
      areaRestauracionSigHa: zRest.length ? Math.round(zRest.reduce((s, z) => s + (z.area_ha ?? 0), 0) * 10) / 10 : null,
      zonasSiembra: zRest.length,
      centroide: bboxCenter(firstGeom),
    }
  })

  // ── Fichas: predios de conservación (v_indicadores + ras.familias) ─────
  const famById = new Map(rasFamilias.map((f) => [f.id, f]))
  // Centroide por predio = promedio de las coordenadas de sus árboles
  const coordAgg = new Map<string, { lat: number; lng: number; n: number }>()
  for (const a of arboles) {
    if (a.latitud == null || a.longitud == null) continue
    const key = `${a.nucleo}|${a.predio}`
    const acc = coordAgg.get(key) ?? { lat: 0, lng: 0, n: 0 }
    acc.lat += a.latitud; acc.lng += a.longitud; acc.n += 1
    coordAgg.set(key, acc)
  }

  type IndicadorRow = {
    nucleo: string | null; predio: string | null; familia_id: string | null
    arboles_semilleros: number; especies_forestales: number
    shannon_h: number | null; simpson_1d: number | null; area_basal_m2: number | null
    dap_medio_cm: number | null; densidad_arb_ha: number | null; arb_amenazados: number | null
  }
  const prediosConservacion: PredioConservacionV2[] = (indicadores as unknown as IndicadorRow[]).map((row): PredioConservacionV2 => {
    const fam = row.familia_id ? famById.get(row.familia_id) : undefined
    const key = `${row.nucleo}|${row.predio}`
    const acc = coordAgg.get(key)
    return {
      tipo: 'conservacion',
      id: key,
      nombre: fam?.nombre_finca || row.predio || '—',
      nucleo: row.nucleo,
      municipio: fam?.municipio ?? null,
      vereda: fam?.vereda ?? null,
      haBosque: fam?.ha_bosque ?? null,
      arboles: row.arboles_semilleros,
      especies: row.especies_forestales,
      shannonH: row.shannon_h,
      simpson1d: row.simpson_1d,
      areaBasalM2: row.area_basal_m2,
      dapMedioCm: row.dap_medio_cm,
      densidadArbHa: row.densidad_arb_ha,
      arbAmenazados: row.arb_amenazados,
      centroide: acc && acc.n > 0 ? { lat: acc.lat / acc.n, lng: acc.lng / acc.n } : null,
    }
  }).sort((a, b) => b.arboles - a.arboles)

  return NextResponse.json({
    kpis,
    prediosProceso,
    prediosConservacion,
    generadoEn: new Date().toISOString(),
    errors: errors.length ? errors : undefined,
  })
}
