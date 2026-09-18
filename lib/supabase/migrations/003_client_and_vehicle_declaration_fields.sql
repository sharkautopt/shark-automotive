-- Fields needed by the new operation-tied document suite (Contrato, Procuração,
-- Declaração de Circulação, Declaração de Entrega, Proposta/Orçamento de
-- Importação). Reference-only, per the convention of 001/002 — execute
-- manually in the Supabase SQL editor.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nif TEXT,
  ADD COLUMN IF NOT EXISTS morada TEXT,
  ADD COLUMN IF NOT EXISTS id_document_number TEXT,
  ADD COLUMN IF NOT EXISTS id_document_validity DATE,
  ADD COLUMN IF NOT EXISTS birth_date DATE;

COMMENT ON COLUMN public.profiles.nif IS 'Client tax number — required on Contrato, Procuração, Declaração de Circulação.';
COMMENT ON COLUMN public.profiles.morada IS 'Full client address — required on the same documents as nif.';
COMMENT ON COLUMN public.profiles.id_document_number IS 'Cartão de Cidadão / passport number — required on Procuração only.';
COMMENT ON COLUMN public.profiles.id_document_validity IS 'ID document expiry date — required on Procuração only.';
COMMENT ON COLUMN public.profiles.birth_date IS 'Required on Procuração only.';

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS foreign_plate TEXT,
  ADD COLUMN IF NOT EXISTS national_registration_date DATE,
  ADD COLUMN IF NOT EXISTS categoria TEXT,
  ADD COLUMN IF NOT EXISTS tara_kg INTEGER,
  ADD COLUMN IF NOT EXISTS peso_bruto_kg INTEGER;

COMMENT ON COLUMN public.vehicles.foreign_plate IS 'Matrícula de origem — distinct from `plate` (national). Required on Declaração de Circulação, Orçamento de Importação.';
COMMENT ON COLUMN public.vehicles.national_registration_date IS 'Data de atribuição da matrícula nacional. `registration_date` (existing column) is unused/ambiguous elsewhere — this is a separate, explicit field.';
COMMENT ON COLUMN public.vehicles.categoria IS 'Official vehicle category/type (e.g. "Ligeiro / Passageiros") — distinct from the informal `body_type` (SUV/sedan/etc).';
COMMENT ON COLUMN public.vehicles.tara_kg IS 'Unladen weight, kg — Declaração de Circulação only.';
COMMENT ON COLUMN public.vehicles.peso_bruto_kg IS 'Gross weight, kg — Declaração de Circulação only.';

-- operations already snapshots vehicle data as its own flat vehicle_* columns
-- (vehicle_make, vehicle_model, ... — no FK to public.vehicles), because an
-- encomenda vehicle is often sourced specifically for one client and never
-- listed in general inventory. The document suite needs the same
-- declaration-level detail on operations as on vehicles, for the same reason.
ALTER TABLE public.operations
  ADD COLUMN IF NOT EXISTS vehicle_foreign_plate TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_national_registration_date DATE,
  ADD COLUMN IF NOT EXISTS vehicle_categoria TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_tara_kg INTEGER,
  ADD COLUMN IF NOT EXISTS vehicle_peso_bruto_kg INTEGER,
  ADD COLUMN IF NOT EXISTS vehicle_vin TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_fuel_type TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_power INTEGER,
  ADD COLUMN IF NOT EXISTS vehicle_engine_size TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_doors INTEGER,
  ADD COLUMN IF NOT EXISTS vehicle_co2_emissions INTEGER;

ALTER TABLE public.generated_documents
  ADD COLUMN IF NOT EXISTS operation_id UUID REFERENCES public.operations(id),
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS accepted_by UUID;

COMMENT ON COLUMN public.generated_documents.operation_id IS 'Set for the 6 new operation-tied document types. NULL for the existing vehicle/lead-centric encomenda + window-sticker docs.';
COMMENT ON COLUMN public.generated_documents.accepted_at IS 'Set when the client clicks "Aceitar no portal" on an orcamento_importacao document. No e-signature — a recorded click + timestamp, per the document''s own disclaimer text.';
COMMENT ON COLUMN public.generated_documents.accepted_by IS 'profile_id of the client who accepted, for audit purposes.';
