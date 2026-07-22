# Pendientes — Geovisor AE

## 🔴 PENDIENTE (2026-07-22) — Filtrar familias sin cesión de derechos de imagen

**Regla legal:** una familia de conservación **solo debe mostrar su información y fotos en el
geovisor si tiene la cesión de derechos de imagen firmada.** Si no la tiene, no se publica su
material (fotos, propietario, etc.) — mismo criterio que ya se aplica en la intranet.

**Fuente del dato:** `ras.documentos_familia` (tabla nueva, en producción desde 2026-07-22).
Una familia tiene cesión si existe una fila con `familia_id = f.id AND tipo = 'cesion_imagen'`.
Hoy **8 de 17** familias la tienen. Verificado contra la BD real (2026-07-22): **8 familias tienen
fotos cargadas pero NO cesión firmada** (riesgo directo — no publicar su material):
Los Nietos (Adain Cubillos), Cosechas de mi finca (Rafael Chilito), El Porvenir (Juan Molina),
Parcela No. 10 (Mauricio Portela), Campo novio (Nadima Rojas), Guajira (Nancy Rojas),
La Esperanza (Quintiliano Areiza), Inti Wasi (Salomón Calvache).
(El README de `docs/temporales` decía 5, pero no estaba verificado contra la BD — el real es 8.)

**Qué hacer (cuando se retome):** en `lib/queries.ts` (`fetchRasFamilias` / la capa RAS del
geovisor), cruzar contra `ras.documentos_familia` y **excluir del render público** (o al menos
ocultar fotos e identidad) las familias sin `cesion_imagen`. El bucket de la cesión
(`ras-documentos-privados`) es privado y NO debe exponerse en el geovisor — solo se usa como
bandera booleana "tiene / no tiene".

**Explícitamente diferido por el usuario** (2026-07-22): la carga de fotos/cesiones y el filtro
en la intranet ya se hicieron; esta parte del geovisor queda para después.

---


## ✅ Corregido (2026-07-16) — capa Siembra desconectada del rediseño `core`

`migration_campo_core.sql` (2026-07-07) había eliminado de `siembra.familias` las columnas
`nombre_propietario`, `nombre_finca`, `municipio`, `vereda`, `departamento`, `latitud`, `longitud`
(ahora viven en `core.aliados`/`core.predios`), y `lib/queries.ts` no se había actualizado —
`fetchSiembraCamaras` fallaba en runtime (confirmado contra la BD real: `42703 column
familias_1.nombre_propietario does not exist`).

**Fix:** `fetchSiembraFamilias`/`fetchSiembraCamaras` ahora piden solo columnas reales de `siembra.*` y
resuelven identidad con un segundo query a `core.predios` (embed a `core.aliados`) por `predio_id`,
mergeado en JS — PostgREST no resuelve embeds cross-schema (confirmado: `PGRST200` al intentarlo
directo). Ver helper `fetchCorePrediosIdentidad` en `lib/queries.ts`. El shape que consumen los
componentes (`SiembraFamilia`, `CamaraTrampa`) no cambió, solo cómo se arma.

Verificado: `tsc --noEmit` limpio, `/api/geovisor-data` responde sin `errors` y la página `/geovisor`
carga sin errores de consola/servidor. La geometría (`.zip` shapefile en vez de `geo.zonas`) sigue sin
migrar — eso queda fuera de este fix, es un cambio de arquitectura más grande (PostGIS→PMTiles, §5 de
`ARQUITECTURA_ECOSISTEMA.md`).

---

## Requieren activos del usuario

- [x] **Logo de Amazonia Emprende** — archivo `public/logo-ae.png` en su lugar
- [x] **Links de redes sociales** — Instagram, Facebook, LinkedIn actualizados

---

## Completado ✓

- [x] Jerarquía visual e interactividad de los iconos del sidebar
- [x] Modo colapsado del sidebar (solo iconos, botón chevron)
- [x] Panel de contacto con redes sociales en el sidebar
- [x] Formato uniforme de títulos en las cards (nombre_finca — nombre_propietario)
- [x] Estado visual de selección de finca (borde acento + fondo tintado)
- [x] Jerarquía tipográfica (labels 10px, valores 13px sin bold excesivo)
- [x] Ocultar bloque de fotos cuando no hay imágenes
- [x] Ordenamiento alfabético de familias
- [x] Filtro por municipio con chips
- [x] Optimización de imágenes (Supabase Image Transformations + lazy loading)
- [x] Interacción mapa → panel (clic en polígono abre panel con la familia)
- [x] Zoom máximo del mapa limitado (no más tiles rotos)
- [x] Bottom sheet móvil con altura ajustable por arrastre
- [x] Indicador de carga compacto (reemplaza overlay bloqueante)
