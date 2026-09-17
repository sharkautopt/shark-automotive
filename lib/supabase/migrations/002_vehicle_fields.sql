-- Vehicle fields: Origem (closed list), Segmento (new), Matrícula (new).
-- Reference-only, per the convention of 001_create_cms_tables.sql — execute
-- manually in the Supabase SQL editor.
--
-- Garantia is intentionally NOT part of this migration — it's a fixed
-- constant ("18 meses por mútuo acordo"), not a per-vehicle DB field.
--
-- text + CHECK, not a Postgres enum, per the design handoff: adding a
-- country to an enum needs a migration, adding one to this list is a
-- one-line CHECK update.

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS segmento TEXT,
  ADD COLUMN IF NOT EXISTS plate TEXT;

-- If any existing row has a country_origin value outside this list, this
-- ALTER will fail — check first with:
--   SELECT DISTINCT country_origin FROM public.vehicles;
ALTER TABLE public.vehicles
  ADD CONSTRAINT vehicles_country_origin_check
  CHECK (country_origin IN (
    'Nacional', 'Alemanha', 'Holanda', 'Bélgica', 'França', 'Itália',
    'Espanha', 'Áustria', 'Suíça', 'Luxemburgo', 'Dinamarca', 'Suécia',
    'Japão', 'EUA'
  ));

ALTER TABLE public.vehicles
  ADD CONSTRAINT vehicles_segmento_check
  CHECK (segmento IS NULL OR segmento IN (
    'Citadino compacto', 'Citadino', 'Utilitário', 'Berlina compacta',
    'Berlina', 'Berlina executiva', 'Carrinha', 'Coupé',
    'Cabrio / Descapotável', 'Roadster', 'SUV compacto', 'SUV',
    'SUV grande', 'Crossover', 'Monovolume', 'Comercial ligeiro', 'Pick-up'
  ));

COMMENT ON COLUMN public.vehicles.segmento IS 'Vehicle segment/body category, closed list — see vehicles_segmento_check.';
COMMENT ON COLUMN public.vehicles.plate IS 'Matrícula — freeform, left empty until known. Not the same as vin.';

-- warranty_months is deliberately left untouched by this migration: it is
-- no longer read anywhere in the app (garantia is a fixed constant, stock
-- vehicles only), but existing data isn't destroyed.
