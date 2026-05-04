-- ============================================================
-- SETUP: Tabla "proyecciones" para el Geovisor AE
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- 1. Crear tabla en el schema public
CREATE TABLE IF NOT EXISTS public.proyecciones (
  id                    UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre                TEXT          NOT NULL,           -- "Fase I · 2020–2022"
  subtitulo             TEXT,                             -- "Establecimiento"
  descripcion           TEXT,                             -- Texto descriptivo largo
  year_inicio           INT,
  year_fin              INT,
  ha_objetivo           NUMERIC(10,2),                    -- Total de hectáreas meta
  ha_ejecutado          NUMERIC(10,2) DEFAULT 0,          -- Hectáreas logradas
  plantulas_objetivo    BIGINT,                           -- Meta de plántulas
  plantulas_ejecutadas  BIGINT        DEFAULT 0,          -- Plántulas sembradas
  familias_vinculadas   INT,                              -- Número de familias
  municipios_clave      TEXT[],                           -- Ej: ARRAY['Florencia','Albania']
  color                 TEXT          DEFAULT '#74A884',  -- Color hex del polígono en el mapa
  shapefile_url         TEXT,                             -- URL pública del .zip en Storage
  orden                 INT           DEFAULT 0,          -- Orden de visualización (ascendente)
  activo                BOOLEAN       DEFAULT true,
  created_at            TIMESTAMPTZ   DEFAULT now()
);

-- 2. Row Level Security — solo lectura pública
ALTER TABLE public.proyecciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "proyecciones_select_all" ON public.proyecciones;
CREATE POLICY "proyecciones_select_all" ON public.proyecciones
  FOR SELECT TO anon, authenticated USING (activo = true);

-- 3. Datos de prueba (3 fases = 3 shapefiles de LFCLAUDE)
--    Después de subir los shapefiles al bucket "proyecciones-shapefiles",
--    actualiza la columna shapefile_url de cada fila con la URL pública del .zip.

INSERT INTO public.proyecciones
  (nombre, subtitulo, descripcion, year_inicio, year_fin,
   ha_objetivo, ha_ejecutado,
   plantulas_objetivo, plantulas_ejecutadas,
   familias_vinculadas, municipios_clave, color, orden)
VALUES
(
  'Fase I · 2020–2022',
  'Establecimiento',
  'Primera intervención territorial en el Piedemonte Amazónico. '
  'Establecimiento de parcelas piloto de restauración ecológica con especies '
  'nativas de alta prioridad, vinculación de familias rurales y diseño del '
  'protocolo de monitoreo de campo.',
  2020, 2022,
  1200.00, 980.00,
  18000, 15420,
  24,
  ARRAY['Florencia', 'Belén de los Andaquíes'],
  '#F59E0B',
  1
),
(
  'Fase II · 2023–2025',
  'Consolidación y escala',
  'Expansión del programa a nuevas veredas y municipios del Caquetá. '
  'Consolidación de las parcelas de monitoreo activas, implementación del '
  'sistema de trazabilidad geoespacial y vinculación de empresas en el '
  'marco de la Ley 2173 de 2021.',
  2023, 2025,
  2500.00, 1840.00,
  42000, 31200,
  47,
  ARRAY['Florencia', 'Albania', 'Morelia', 'Valparaíso'],
  '#74A884',
  2
),
(
  'Fase III · 2026–2030',
  'Visión regional',
  'Proyección de largo plazo hacia la restauración de 8.000 ha en el '
  'corredor biológico amazónico. Meta de 120.000 plántulas de especies '
  'nativas y 90 familias en programa activo de conservación y restauración '
  'ecológica sostenida.',
  2026, 2030,
  8000.00, 0.00,
  120000, 0,
  90,
  ARRAY['Florencia', 'Albania', 'Morelia', 'Valparaíso', 'El Doncello', 'Puerto Rico'],
  '#6898B8',
  3
);

-- ============================================================
-- INSTRUCCIONES PARA LOS SHAPEFILES (carpeta LFCLAUDE)
-- ============================================================
-- 1. En Supabase → Storage → New bucket: "proyecciones-shapefiles" (público)
-- 2. Sube los 3 archivos .zip de la carpeta LFCLAUDE al bucket
-- 3. Copia la URL pública de cada .zip (botón "Get URL")
-- 4. Actualiza la columna shapefile_url:

-- UPDATE public.proyecciones SET shapefile_url = 'https://xxx.supabase.co/storage/v1/object/public/proyecciones-shapefiles/fase1.zip'
--   WHERE orden = 1;
-- UPDATE public.proyecciones SET shapefile_url = 'https://...'
--   WHERE orden = 2;
-- UPDATE public.proyecciones SET shapefile_url = 'https://...'
--   WHERE orden = 3;
-- ============================================================
