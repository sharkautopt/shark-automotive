-- Numbering sequences for the 6 new operation-tied document types.
-- Reference-only, execute manually in the Supabase SQL editor.
--
-- Mirrors the existing (not-in-repo, pre-existing) nextval_orcamento
-- convention: a bare sequence + a SECURITY DEFINER RPC that admin routes
-- call via supabaseAdmin.rpc("nextval_xxx"), formatting the returned
-- integer client-side (e.g. `PI-${year}/${String(seq).padStart(3, "0")}`).
-- Each route falls back to a timestamp-based number if the RPC errors, same
-- as the existing encomenda route — these sequences are a nice-to-have for
-- clean numbering, not a hard dependency.

CREATE SEQUENCE IF NOT EXISTS proposta_importacao_seq;
CREATE SEQUENCE IF NOT EXISTS orcamento_importacao_seq;
CREATE SEQUENCE IF NOT EXISTS contrato_seq;
CREATE SEQUENCE IF NOT EXISTS declaracao_entrega_seq;
CREATE SEQUENCE IF NOT EXISTS procuracao_seq;
CREATE SEQUENCE IF NOT EXISTS declaracao_circulacao_seq;

CREATE OR REPLACE FUNCTION nextval_proposta_importacao()
RETURNS BIGINT LANGUAGE sql SECURITY DEFINER AS $$
  SELECT nextval('proposta_importacao_seq');
$$;

CREATE OR REPLACE FUNCTION nextval_orcamento_importacao()
RETURNS BIGINT LANGUAGE sql SECURITY DEFINER AS $$
  SELECT nextval('orcamento_importacao_seq');
$$;

CREATE OR REPLACE FUNCTION nextval_contrato()
RETURNS BIGINT LANGUAGE sql SECURITY DEFINER AS $$
  SELECT nextval('contrato_seq');
$$;

CREATE OR REPLACE FUNCTION nextval_declaracao_entrega()
RETURNS BIGINT LANGUAGE sql SECURITY DEFINER AS $$
  SELECT nextval('declaracao_entrega_seq');
$$;

CREATE OR REPLACE FUNCTION nextval_procuracao()
RETURNS BIGINT LANGUAGE sql SECURITY DEFINER AS $$
  SELECT nextval('procuracao_seq');
$$;

CREATE OR REPLACE FUNCTION nextval_declaracao_circulacao()
RETURNS BIGINT LANGUAGE sql SECURITY DEFINER AS $$
  SELECT nextval('declaracao_circulacao_seq');
$$;
