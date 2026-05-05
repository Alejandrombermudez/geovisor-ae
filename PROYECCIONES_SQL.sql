-- ============================================================
-- SETUP: Tabla "proyecciones" — Plan de Conectividad Andino-Amazónica
-- Geovisor AE · Ejecutar en Supabase → SQL Editor
-- ============================================================

-- 1. Crear tabla
CREATE TABLE IF NOT EXISTS public.proyecciones (
  id                    UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre                TEXT          NOT NULL,
  subtitulo             TEXT,
  descripcion           TEXT,
  year_inicio           INT,
  year_fin              INT,
  ha_objetivo           NUMERIC(12,2),                    -- Total ha (conservación + restauración)
  ha_ejecutado          NUMERIC(12,2) DEFAULT 0,
  plantulas_objetivo    BIGINT,
  plantulas_ejecutadas  BIGINT        DEFAULT 0,
  familias_vinculadas   INT,
  municipios_clave      TEXT[],
  color                 TEXT          DEFAULT '#74A884',
  shapefile_url         TEXT,
  orden                 INT           DEFAULT 0,
  activo                BOOLEAN       DEFAULT true,
  created_at            TIMESTAMPTZ   DEFAULT now()
);

-- 2. RLS — solo lectura pública
ALTER TABLE public.proyecciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "proyecciones_select_all" ON public.proyecciones;
CREATE POLICY "proyecciones_select_all" ON public.proyecciones
  FOR SELECT TO anon, authenticated USING (activo = true);

-- 3. Limpiar datos previos de prueba (si ya existían)
DELETE FROM public.proyecciones;

-- 4. Insertar fases reales del Plan de Conectividad Andino-Amazónica del Caquetá
--    Fuente: Estrategia por cuencas · Cuencas Caquetá y Caguán (2026–2050)
--    Shapefiles ya subidos al bucket: proyecciones-shapefiles

INSERT INTO public.proyecciones
  (nombre, subtitulo, descripcion,
   year_inicio, year_fin,
   ha_objetivo, ha_ejecutado,
   plantulas_objetivo, plantulas_ejecutadas,
   familias_vinculadas, municipios_clave, color, shapefile_url, orden)
VALUES

-- ── Fase I · Piedemonte Andino-Amazónico ─────────────────────────
(
  'Fase I · 2026–2030',
  'Piedemonte Andino-Amazónico',
  'Establecimiento del corredor de conectividad en el piedemonte del Caquetá, '
  'articulado a las subcuencas del Río Pescado y Río Orteguaza. '
  'Incluye 8.000 ha de bosques bajo esquemas de conservación y '
  '5.000 ha en restauración ecológica activa con especies nativas. '
  'Primera fase de intervención directa con familias rurales en el marco '
  'de la Ley 2173 de 2021.',
  2026, 2030,
  13000.00, 0,
  75000, 0,
  35,
  ARRAY['Florencia', 'Morelia', 'Albania', 'Belén de los Andaquíes', 'San José del Fragua'],
  '#A89070',
  'https://lbxysovesmbgesxooghw.supabase.co/storage/v1/object/public/proyecciones-shapefiles/CordilleraOriental.zip',
  1
),

-- ── Fase II · Cuencas del Caguán ─────────────────────────────────
(
  'Fase II · 2030–2035',
  'Cuencas del Caguán',
  'Expansión del corredor hacia las cuencas del Río Caguán y Río Guayas. '
  '120.000 ha de bosques estratégicos bajo acuerdos de conservación y '
  '20.000 ha en restauración del paisaje degradado. '
  'Consolidación de la conectividad entre la Cordillera Oriental y la llanura amazónica, '
  'con vinculación de empresas bajo el esquema de compensación de la Ley 2173.',
  2030, 2035,
  140000.00, 0,
  300000, 0,
  120,
  ARRAY['El Doncello', 'El Paujil', 'Puerto Rico', 'La Montañita'],
  '#D97706',
  'https://lbxysovesmbgesxooghw.supabase.co/storage/v1/object/public/proyecciones-shapefiles/ProyeccionRestauracion.zip',
  2
),

-- ── Fase III · Corredor Chiribiquete ─────────────────────────────
(
  'Fase III · 2035–2050',
  'Corredor Chiribiquete',
  'Visión de largo plazo: conectividad total del corredor biológico entre '
  'La Serranía de Chiribiquete y la Cordillera Oriental. '
  '600.000 ha de bosques amazónicos bajo conservación permanente y '
  '150.000 ha en restauración activa del paisaje. '
  'Escala de impacto regional para la compensación de carbono, '
  'biodiversidad y servicios ecosistémicos en el corazón de la Amazonia colombiana.',
  2035, 2050,
  750000.00, 0,
  2250000, 0,
  300,
  ARRAY['Cartagena del Chairá', 'Solano', 'San Vicente del Caguán', 'Solita', 'Milán'],
  '#7C3A1E',
  'https://lbxysovesmbgesxooghw.supabase.co/storage/v1/object/public/proyecciones-shapefiles/Chiribiquete.zip',
  3
);

-- ============================================================
-- Si ya tenías la tabla y solo necesitas actualizar los datos:
-- ============================================================
-- DELETE FROM public.proyecciones;
-- Luego re-ejecuta el bloque INSERT de arriba.
-- ============================================================
