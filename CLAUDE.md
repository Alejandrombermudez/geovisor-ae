# GeoAE — Geoportal

Next.js + Leaflet/react-leaflet + `shpjs` (parseo de shapefile en cliente) + Supabase (`lbxysovesmbgesxooghw`,
service role server-side vía `/api/geovisor-data`). Visualiza fincas, zonas de restauración/conservación,
árboles semilleros y cámaras trampa sobre un mapa.

**Contexto detallado:** [`CONTEXTO_GEOVISOR.md`](CONTEXTO_GEOVISOR.md) — **desactualizado en la parte de `siembra.familias`**, ver aviso abajo. El resto (RAS, flujo de shapefiles, buckets) sigue vigente.
**Arquitectura de datos completa del ecosistema:** `../Intranet-AE/docs/ARQUITECTURA_DATOS.md`.

## Identidad de Siembra viene de `core`, no de `siembra.familias`

`Intranet-AE/docs/sql/migration_campo_core.sql` (2026-07-07) eliminó de `siembra.familias` las columnas
`nombre_propietario`, `nombre_finca`, `municipio`, `vereda`, `departamento`, `latitud`, `longitud` — esos
datos ahora viven en `core.aliados`/`core.predios`. [`lib/queries.ts`](lib/queries.ts) lo resuelve así
(fix 2026-07-16, ver [`PENDIENTES.md`](PENDIENTES.md) para el historial del bug que esto reemplazó):

- `fetchSiembraFamilias`/`fetchSiembraCamaras` piden solo las columnas que **sí** siguen en `siembra.*`.
- Un helper `fetchCorePrediosIdentidad(supabase, predioIds)` hace un segundo query a
  `core.predios` (embed a `core.aliados`) y arma un `Map<predio_id, identidad>` que se mergea en JS.
- **Por qué dos queries y no un embed:** PostgREST no resuelve relaciones cross-schema aquí (confirmado
  contra la BD real: pedir `predios:predio_id(...)` desde `siembra.familias` da `PGRST200`, "no relationship
  found"). Un embed dentro del mismo schema (`core.predios → core.aliados`) sí funciona.
- El shape que consumen los componentes (`SiembraFamilia`, `CamaraTrampa` en `types/geovisor.ts`) no cambió — solo cómo se arma internamente.

Si agregas un campo nuevo de identidad (ej. `codigo_catastral`), amplíalo en `fetchCorePrediosIdentidad`,
no lo busques en `siembra.familias`.

**Pendiente real de arquitectura (no de este fix):** la geometría sigue viniendo de `.zip` shapefile en
vez de `geo.zonas` (PostGIS) — migrar a eso es un cambio más grande, ver §5 de `ARQUITECTURA_ECOSISTEMA.md`.

## Modelo de datos que sí sigue vigente

- **RAS/Conservación** (`ras.familias`, `ras.camaras_trampa`) — no tocado por el rediseño, columnas de identidad siguen en la tabla.
- **Árboles semilleros** — lee `ras.v_arboles_con_especie` (JOIN a `catalogo.especies`), no la tabla base.
- Polígonos: hoy vía `.zip` en Storage (`siembra-shapefiles`, `ras-shapefiles`) parseados con `shpjs` en cliente. La dirección de arquitectura (§5 de `ARQUITECTURA_ECOSISTEMA.md`) es migrar a `geo.zonas` (PostGIS) → `.pmtiles`, pero eso todavía no está implementado aquí.

## Reglas

- Siempre `supabase.schema('<schema>').from(...)` — nunca asumir `public`.
- No ejecutar DDL. No hay migraciones propias de GeoAE — todas viven en `Intranet-AE/docs/sql/`.
- `.env` / `.env.local` tienen la service role key (server-side, en `/api/geovisor-data`) — nunca hardcodear ni exponerla al cliente.
