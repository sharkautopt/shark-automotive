-- Módulo de Gestão de Garantias.
-- Reference-only, execute manually in the Supabase SQL editor (same convention
-- as 001–004). Requires the default Supabase roles (anon, authenticated,
-- service_role).
--
-- Desenho:
--   garantia_templates  texto legal / cláusulas / listas por defeito + PRAZO (mín. 18 meses).
--                       O prazo vem sempre do template — nunca é editável por caso.
--   garantias           uma linha por garantia (estado atual). Os campos legais só
--                       mudam via funções emitir_versao_garantia (trigger bloqueia o resto).
--   garantia_versoes    snapshots IMUTÁVEIS de cada versão emitida (+ hash SHA-256).
--   garantia_eventos    histórico de auditoria IMUTÁVEL.
--   garantia_contadores contador por ano para GAR/AAAA/NNN.
-- RLS ligado e sem policies: só o servidor (service role) acede. De propósito
-- não usa policies com user_metadata (o Advisor da Supabase marca isso como crítico).

-- ---------------------------------------------------------------- templates
CREATE TABLE IF NOT EXISTS public.garantia_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  prazo_meses INTEGER NOT NULL CHECK (prazo_meses >= 18),
  introducao TEXT NOT NULL,
  clausulas JSONB NOT NULL DEFAULT '[]'::jsonb,
  componentes_cobertos TEXT[] NOT NULL DEFAULT '{}',
  exclusoes TEXT[] NOT NULL DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS garantia_templates_one_default
  ON public.garantia_templates (is_default) WHERE is_default;

-- ---------------------------------------------------------------- garantias
CREATE TABLE IF NOT EXISTS public.garantias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id UUID NOT NULL REFERENCES public.operations(id),
  template_id UUID REFERENCES public.garantia_templates(id),
  numero TEXT UNIQUE,                       -- GAR/2026/001, atribuído ao emitir (sem buracos)
  codigo_verificacao TEXT UNIQUE,           -- código aleatório do QR / página pública
  estado TEXT NOT NULL DEFAULT 'rascunho'
    CHECK (estado IN ('rascunho', 'emitida', 'assinada', 'anulada')),  -- "expirada" é calculada
  versao_atual INTEGER NOT NULL DEFAULT 0,

  cliente_nome TEXT NOT NULL DEFAULT '',
  cliente_nif TEXT,
  cliente_morada TEXT,
  cliente_contacto TEXT,

  viatura_marca TEXT,
  viatura_modelo TEXT,
  viatura_matricula TEXT,
  viatura_vin TEXT,
  viatura_km INTEGER,

  data_venda DATE,
  valor_venda NUMERIC(12, 2),

  prazo_meses INTEGER NOT NULL CHECK (prazo_meses >= 18),
  data_inicio DATE,
  data_fim DATE,                            -- calculada pelo trigger: data_inicio + prazo_meses

  componentes_cobertos TEXT[] NOT NULL DEFAULT '{}',
  exclusoes TEXT[] NOT NULL DEFAULT '{}',

  emitida_em TIMESTAMPTZ,
  assinada_em TIMESTAMPTZ,
  assinada_ficheiro TEXT,
  assinada_versao INTEGER,
  anulada_em TIMESTAMPTZ,
  anulada_motivo TEXT,

  criado_por UUID,
  criado_por_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Uma garantia ativa por operação (as anuladas não contam).
CREATE UNIQUE INDEX IF NOT EXISTS garantias_uma_ativa_por_operacao
  ON public.garantias (operation_id) WHERE estado <> 'anulada';
CREATE INDEX IF NOT EXISTS garantias_data_fim_idx ON public.garantias (data_fim);

CREATE TABLE IF NOT EXISTS public.garantia_versoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garantia_id UUID NOT NULL REFERENCES public.garantias(id),
  versao INTEGER NOT NULL,
  dados JSONB NOT NULL,                     -- snapshot completo (inclui o texto já renderizado)
  hash_sha256 TEXT NOT NULL,
  motivo TEXT,
  criado_por UUID,
  criado_por_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (garantia_id, versao)
);

CREATE TABLE IF NOT EXISTS public.garantia_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garantia_id UUID NOT NULL REFERENCES public.garantias(id),
  versao INTEGER,
  tipo TEXT NOT NULL CHECK (tipo IN
    ('criada', 'editada', 'emitida', 'nova_versao', 'enviada', 'envio_falhado', 'assinada', 'anulada')),
  user_id UUID,
  user_email TEXT,
  detalhes JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS garantia_eventos_garantia_idx ON public.garantia_eventos (garantia_id, created_at);

CREATE TABLE IF NOT EXISTS public.garantia_contadores (
  ano INTEGER PRIMARY KEY,
  ultimo INTEGER NOT NULL
);

ALTER TABLE public.garantia_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garantias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garantia_versoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garantia_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garantia_contadores ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------- guardas
-- Versões e eventos nunca mudam nem se apagam.
CREATE OR REPLACE FUNCTION public.garantia_imutavel() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Registo imutável (%): não pode ser alterado nem apagado.', TG_TABLE_NAME;
END $$;

DROP TRIGGER IF EXISTS garantia_versoes_imutavel ON public.garantia_versoes;
CREATE TRIGGER garantia_versoes_imutavel BEFORE UPDATE OR DELETE ON public.garantia_versoes
  FOR EACH ROW EXECUTE FUNCTION public.garantia_imutavel();

DROP TRIGGER IF EXISTS garantia_eventos_imutavel ON public.garantia_eventos;
CREATE TRIGGER garantia_eventos_imutavel BEFORE UPDATE OR DELETE ON public.garantia_eventos
  FOR EACH ROW EXECUTE FUNCTION public.garantia_imutavel();

-- Garantias: sem DELETE; mudanças de estado/número/campos legais só pelas
-- funções abaixo (que ligam app.garantia_rpc); data_fim é sempre calculada.
CREATE OR REPLACE FUNCTION public.garantias_guard() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  via_rpc BOOLEAN := coalesce(current_setting('app.garantia_rpc', true), '') = 'on';
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Garantias não se apagam (documento legal) — anula-a.';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.estado <> 'rascunho' OR NEW.versao_atual <> 0 OR NEW.numero IS NOT NULL THEN
      RAISE EXCEPTION 'Uma garantia só pode ser criada como rascunho.';
    END IF;
  ELSE
    IF OLD.estado = 'anulada' THEN
      RAISE EXCEPTION 'Garantia anulada não pode ser alterada.';
    END IF;
    IF NEW.estado IS DISTINCT FROM OLD.estado AND NOT via_rpc THEN
      RAISE EXCEPTION 'O estado só muda pelas funções de emissão/assinatura/anulação.';
    END IF;
    IF NEW.versao_atual IS DISTINCT FROM OLD.versao_atual AND NOT via_rpc THEN
      RAISE EXCEPTION 'A versão só muda pela função de emissão.';
    END IF;
    IF (NEW.numero IS DISTINCT FROM OLD.numero OR NEW.codigo_verificacao IS DISTINCT FROM OLD.codigo_verificacao)
       AND (OLD.numero IS NOT NULL OR NOT via_rpc) THEN
      RAISE EXCEPTION 'Número e código de verificação são imutáveis.';
    END IF;
    IF OLD.estado <> 'rascunho' AND NOT via_rpc AND (
      (NEW.operation_id, NEW.template_id, NEW.cliente_nome, NEW.cliente_nif, NEW.cliente_morada, NEW.cliente_contacto,
       NEW.viatura_marca, NEW.viatura_modelo, NEW.viatura_matricula, NEW.viatura_vin, NEW.viatura_km,
       NEW.data_venda, NEW.valor_venda, NEW.prazo_meses, NEW.data_inicio,
       NEW.componentes_cobertos, NEW.exclusoes)
      IS DISTINCT FROM
      (OLD.operation_id, OLD.template_id, OLD.cliente_nome, OLD.cliente_nif, OLD.cliente_morada, OLD.cliente_contacto,
       OLD.viatura_marca, OLD.viatura_modelo, OLD.viatura_matricula, OLD.viatura_vin, OLD.viatura_km,
       OLD.data_venda, OLD.valor_venda, OLD.prazo_meses, OLD.data_inicio,
       OLD.componentes_cobertos, OLD.exclusoes)
    ) THEN
      RAISE EXCEPTION 'Campos legais bloqueados: emite uma nova versão em vez de editar.';
    END IF;
    NEW.updated_at := now();
  END IF;

  IF NEW.data_inicio IS NULL THEN
    NEW.data_fim := NULL;
  ELSE
    NEW.data_fim := (NEW.data_inicio + make_interval(months => NEW.prazo_meses))::date;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS garantias_guard_trg ON public.garantias;
CREATE TRIGGER garantias_guard_trg BEFORE INSERT OR UPDATE OR DELETE ON public.garantias
  FOR EACH ROW EXECUTE FUNCTION public.garantias_guard();

-- ---------------------------------------------------------------- funções
-- 1) Atribui o número (sem buracos: contador por ano, atómico) e o código do QR.
--    Idempotente: se já tem número, devolve-o.
CREATE OR REPLACE FUNCTION public.atribuir_numero_garantia(p_id UUID, p_codigo TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  g public.garantias%ROWTYPE;
  v_ano INTEGER;
  v_seq INTEGER;
  v_num TEXT;
BEGIN
  PERFORM set_config('app.garantia_rpc', 'on', true);
  SELECT * INTO g FROM public.garantias WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Garantia não encontrada.'; END IF;
  IF g.estado <> 'rascunho' THEN RAISE EXCEPTION 'Só rascunhos recebem número.'; END IF;
  IF g.numero IS NOT NULL THEN RETURN g.numero; END IF;

  v_ano := extract(year FROM (now() AT TIME ZONE 'Europe/Lisbon'))::INTEGER;
  INSERT INTO public.garantia_contadores (ano, ultimo) VALUES (v_ano, 1)
    ON CONFLICT (ano) DO UPDATE SET ultimo = public.garantia_contadores.ultimo + 1
    RETURNING ultimo INTO v_seq;
  v_num := format('GAR/%s/%s', v_ano, lpad(v_seq::TEXT, 3, '0'));

  UPDATE public.garantias SET numero = v_num, codigo_verificacao = p_codigo WHERE id = p_id;
  RETURN v_num;
END $$;

-- 2) Emite a versão 1 (rascunho -> emitida) ou uma nova versão (exige motivo).
--    Guarda o snapshot imutável + hash, atualiza a linha e regista o evento,
--    tudo na mesma transação. data_fim é recalculada aqui (fonte única).
CREATE OR REPLACE FUNCTION public.emitir_versao_garantia(
  p_id UUID, p_dados JSONB, p_motivo TEXT, p_user_id UUID, p_user_email TEXT
) RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  g public.garantias%ROWTYPE;
  v INTEGER;
  v_tipo TEXT;
  v_ini DATE;
  v_prazo INTEGER;
  v_fim DATE;
  v_dados JSONB;
  v_hash TEXT;
BEGIN
  PERFORM set_config('app.garantia_rpc', 'on', true);
  SELECT * INTO g FROM public.garantias WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Garantia não encontrada.'; END IF;
  IF g.estado = 'anulada' THEN RAISE EXCEPTION 'Garantia anulada.'; END IF;
  IF g.numero IS NULL THEN RAISE EXCEPTION 'Atribui o número antes de emitir.'; END IF;

  IF g.estado = 'rascunho' THEN
    v := 1; v_tipo := 'emitida';
  ELSE
    IF coalesce(btrim(p_motivo), '') = '' THEN RAISE EXCEPTION 'Indica o motivo da nova versão.'; END IF;
    v := g.versao_atual + 1; v_tipo := 'nova_versao';
  END IF;

  v_ini := nullif(p_dados->'garantia'->>'data_inicio', '')::DATE;
  v_prazo := (p_dados->'garantia'->>'prazo_meses')::INTEGER;
  IF v_ini IS NULL OR v_prazo IS NULL THEN RAISE EXCEPTION 'Data de início e prazo são obrigatórios.'; END IF;
  IF v_prazo < 18 THEN RAISE EXCEPTION 'O prazo mínimo é de 18 meses.'; END IF;
  v_fim := (v_ini + make_interval(months => v_prazo))::DATE;

  v_dados := jsonb_set(p_dados, '{garantia,data_fim}', to_jsonb(v_fim::TEXT))
    || jsonb_build_object(
         'numero', g.numero,
         'versao', v,
         'codigo_verificacao', g.codigo_verificacao,
         'emitida_em', to_char(now() AT TIME ZONE 'Europe/Lisbon', 'YYYY-MM-DD"T"HH24:MI:SS'));
  v_hash := encode(sha256(convert_to(v_dados::TEXT, 'UTF8')), 'hex');

  INSERT INTO public.garantia_versoes (garantia_id, versao, dados, hash_sha256, motivo, criado_por, criado_por_email)
  VALUES (p_id, v, v_dados, v_hash, nullif(btrim(p_motivo), ''), p_user_id, p_user_email);

  UPDATE public.garantias SET
    template_id = nullif(v_dados->'template'->>'id', '')::UUID,
    cliente_nome = coalesce(v_dados->'cliente'->>'nome', ''),
    cliente_nif = nullif(v_dados->'cliente'->>'nif', ''),
    cliente_morada = nullif(v_dados->'cliente'->>'morada', ''),
    cliente_contacto = nullif(v_dados->'cliente'->>'contacto', ''),
    viatura_marca = nullif(v_dados->'viatura'->>'marca', ''),
    viatura_modelo = nullif(v_dados->'viatura'->>'modelo', ''),
    viatura_matricula = nullif(v_dados->'viatura'->>'matricula', ''),
    viatura_vin = nullif(v_dados->'viatura'->>'vin', ''),
    viatura_km = nullif(v_dados->'viatura'->>'km', '')::INTEGER,
    data_venda = nullif(v_dados->'venda'->>'data', '')::DATE,
    valor_venda = nullif(v_dados->'venda'->>'valor', '')::NUMERIC,
    prazo_meses = v_prazo,
    data_inicio = v_ini,
    componentes_cobertos = ARRAY(SELECT jsonb_array_elements_text(v_dados->'garantia'->'componentes')),
    exclusoes = ARRAY(SELECT jsonb_array_elements_text(v_dados->'garantia'->'exclusoes')),
    estado = 'emitida',
    versao_atual = v,
    emitida_em = coalesce(emitida_em, now()),
    assinada_em = NULL, assinada_ficheiro = NULL, assinada_versao = NULL
  WHERE id = p_id;

  INSERT INTO public.garantia_eventos (garantia_id, versao, tipo, user_id, user_email, detalhes)
  VALUES (p_id, v, v_tipo, p_user_id, p_user_email, jsonb_build_object(
    'motivo', nullif(btrim(p_motivo), ''),
    'hash', v_hash,
    'estado_anterior', g.estado,
    'assinatura_anulada', g.estado = 'assinada'));

  RETURN v;
END $$;

-- 3) Marca como assinada pelo cliente (scan da via assinada já carregado).
CREATE OR REPLACE FUNCTION public.marcar_garantia_assinada(
  p_id UUID, p_ficheiro TEXT, p_user_id UUID, p_user_email TEXT
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE g public.garantias%ROWTYPE;
BEGIN
  PERFORM set_config('app.garantia_rpc', 'on', true);
  SELECT * INTO g FROM public.garantias WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Garantia não encontrada.'; END IF;
  IF g.estado NOT IN ('emitida', 'assinada') THEN RAISE EXCEPTION 'Só garantias emitidas podem ser marcadas como assinadas.'; END IF;

  UPDATE public.garantias SET
    estado = 'assinada', assinada_em = now(), assinada_ficheiro = p_ficheiro, assinada_versao = g.versao_atual
  WHERE id = p_id;

  INSERT INTO public.garantia_eventos (garantia_id, versao, tipo, user_id, user_email, detalhes)
  VALUES (p_id, g.versao_atual, 'assinada', p_user_id, p_user_email, jsonb_build_object('ficheiro', p_ficheiro));
END $$;

-- 4) Anula (estado terminal, com motivo obrigatório).
CREATE OR REPLACE FUNCTION public.anular_garantia(
  p_id UUID, p_motivo TEXT, p_user_id UUID, p_user_email TEXT
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE g public.garantias%ROWTYPE;
BEGIN
  PERFORM set_config('app.garantia_rpc', 'on', true);
  SELECT * INTO g FROM public.garantias WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Garantia não encontrada.'; END IF;
  IF g.estado = 'anulada' THEN RAISE EXCEPTION 'Garantia já anulada.'; END IF;
  IF coalesce(btrim(p_motivo), '') = '' THEN RAISE EXCEPTION 'Indica o motivo da anulação.'; END IF;

  UPDATE public.garantias SET estado = 'anulada', anulada_em = now(), anulada_motivo = btrim(p_motivo) WHERE id = p_id;

  INSERT INTO public.garantia_eventos (garantia_id, versao, tipo, user_id, user_email, detalhes)
  VALUES (p_id, g.versao_atual, 'anulada', p_user_id, p_user_email,
          jsonb_build_object('motivo', btrim(p_motivo), 'estado_anterior', g.estado));
END $$;

-- Só o servidor (service role) executa estas funções — nunca anon/authenticated.
REVOKE ALL ON FUNCTION public.atribuir_numero_garantia(UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.emitir_versao_garantia(UUID, JSONB, TEXT, UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.marcar_garantia_assinada(UUID, TEXT, UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.anular_garantia(UUID, TEXT, UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.atribuir_numero_garantia(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.emitir_versao_garantia(UUID, JSONB, TEXT, UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.marcar_garantia_assinada(UUID, TEXT, UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.anular_garantia(UUID, TEXT, UUID, TEXT) TO service_role;

-- ---------------------------------------------------------------- template por defeito
-- Texto de partida — a rever pelo jurídico. Editável no admin (Garantias > Templates).
INSERT INTO public.garantia_templates (nome, descricao, prazo_meses, introducao, clausulas, componentes_cobertos, exclusoes, is_default)
SELECT
  'Garantia Standard',
  'Garantia comercial standard de viaturas em stock.',
  18,
  $t$A {{empresa.nome}}, NIPC {{empresa.nif}}, com sede na {{empresa.morada}}, adiante designada por Vendedor, concede a {{cliente.nome}}, NIF {{cliente.nif}}, residente em {{cliente.morada}}, adiante designado por Comprador, a presente garantia relativa ao veículo {{viatura.marca}} {{viatura.modelo}}, matrícula {{viatura.matricula}}, número de quadro (VIN) {{viatura.vin}}, com {{viatura.km}} quilómetros à data da venda, vendido em {{venda.data}} pelo valor de {{venda.valor}}, nos termos e condições seguintes.$t$,
  $j$[
    {"titulo": "Prazo", "texto": "A garantia é concedida pelo prazo de {{garantia.prazo_texto}}, com início em {{garantia.data_inicio}} e termo em {{garantia.data_fim}}."},
    {"titulo": "Âmbito", "texto": "A garantia abrange os seguintes componentes: {{garantia.componentes}}."},
    {"titulo": "Exclusões", "texto": "Ficam excluídos da garantia: {{garantia.exclusoes}}, bem como danos resultantes de utilização indevida, acidente, falta de manutenção ou intervenção por terceiros não autorizados pelo Vendedor."},
    {"titulo": "Acionamento", "texto": "Para acionar a garantia, o Comprador deve contactar o Vendedor ({{empresa.email}} · {{empresa.telefone}}) antes de qualquer reparação, descrevendo a avaria e indicando o número desta garantia ({{garantia.numero}}). As reparações realizadas sem autorização prévia do Vendedor não são abrangidas."},
    {"titulo": "Direitos legais", "texto": "A presente garantia é concedida sem prejuízo dos direitos que a lei reconhece ao Comprador, designadamente os decorrentes do Decreto-Lei n.º 84/2021, de 18 de outubro, quando aplicável."},
    {"titulo": "Autenticidade", "texto": "A autenticidade e a validade desta garantia podem ser verificadas em {{garantia.url_validacao}}."}
  ]$j$::jsonb,
  ARRAY['motor', 'caixa de velocidades', 'direção', 'travagem', 'suspensão', 'sistema elétrico', 'arrefecimento', 'ar condicionado'],
  ARRAY['desgaste natural', 'embraiagem', 'pastilhas/discos de travão', 'correia de distribuição', 'pneus', 'baterias', 'escovas'],
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.garantia_templates);
