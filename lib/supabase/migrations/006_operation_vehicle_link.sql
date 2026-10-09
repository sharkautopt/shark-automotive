-- Liga uma operação à viatura de stock escolhida ao criá-la (nova operação >
-- "Escolher do stock"). Reference-only, execute manually in the Supabase SQL
-- editor.
--
-- A operação continua a guardar uma cópia plana dos dados da viatura
-- (vehicle_* — uma viatura de encomenda nunca está no stock), mas quando vem
-- do stock esta coluna diz de que viatura veio: serve para evitar vender o
-- mesmo carro duas vezes e para a garantia ir buscar o preço de venda.
--
-- O tipo da coluna copia o de vehicles.id (a tabela base não tem DDL no repo,
-- por isso não se assume uuid).
DO $$
DECLARE
  t TEXT;
BEGIN
  SELECT format_type(a.atttypid, a.atttypmod) INTO t
  FROM pg_attribute a
  WHERE a.attrelid = 'public.vehicles'::regclass AND a.attname = 'id' AND NOT a.attisdropped;

  IF t IS NULL THEN
    RAISE EXCEPTION 'public.vehicles.id não encontrado';
  END IF;

  EXECUTE format(
    'ALTER TABLE public.operations ADD COLUMN IF NOT EXISTS vehicle_id %s REFERENCES public.vehicles(id) ON DELETE SET NULL',
    t
  );
END $$;

CREATE INDEX IF NOT EXISTS operations_vehicle_id_idx ON public.operations (vehicle_id) WHERE vehicle_id IS NOT NULL;

COMMENT ON COLUMN public.operations.vehicle_id IS 'Viatura de stock de onde veio esta operação (NULL em encomendas e em dados preenchidos à mão).';
