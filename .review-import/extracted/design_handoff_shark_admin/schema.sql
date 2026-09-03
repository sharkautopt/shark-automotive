-- =====================================================================
-- Shark Automotive — Supabase schema (proposal to accompany the design)
-- Postgres 15 / Supabase. Review before running: this is a starting point,
-- not a migration validated against your existing database.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- enums
create type user_role        as enum ('admin', 'staff', 'customer');
create type vehicle_status   as enum ('available', 'reserved', 'sold', 'draft');
create type fuel_type        as enum ('gasolina', 'diesel', 'hibrido', 'eletrico');
create type gearbox_type     as enum ('manual', 'automatica');
create type operation_type   as enum ('encomenda', 'comprador');
create type operation_state  as enum ('active', 'delivered', 'cancelled');
create type payment_status   as enum ('scheduled', 'pending', 'paid', 'failed', 'refunded');
create type lead_status      as enum ('novo', 'contactado', 'qualificado', 'negociacao', 'convertido', 'perdido');
create type lead_source      as enum ('importacao', 'contacto', 'dossier', 'parceiros');
create type doc_type         as enum ('orcamento', 'proposta', 'declaracao', 'ficha', 'factura', 'outro');
create type doc_status       as enum ('rascunho', 'emitido', 'enviado', 'aceite', 'recusado');
create type doc_visibility   as enum ('interno', 'cliente');
create type content_status   as enum ('publicado', 'pendente');

-- ------------------------------------------------------------- profiles
-- Mirrors auth.users. INT-01.
create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  role        user_role not null default 'customer',
  full_name   text,
  phone       text,
  nif         text,
  address     text,
  created_at  timestamptz not null default now()
);

create or replace function is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('admin', 'staff')
  );
$$;

-- ------------------------------------------------------------- vehicles
-- INT-02. published/featured drive the public site.
create table vehicles (
  id              uuid primary key default gen_random_uuid(),
  make            text not null,
  model           text not null,
  variant         text,
  year            int  not null,
  mileage_km      int  not null,
  price_eur       numeric(10,2) not null,
  monthly_from_eur numeric(10,2),
  fuel            fuel_type,
  gearbox         gearbox_type,
  power_cv        int,
  displacement_cc int,
  co2_gkm         int,
  doors           int,
  seats           int,
  colour          text,
  interior        text,
  vin             text,
  plate           text,
  foreign_plate   text,
  first_reg_date  date,
  origin_country  text,
  origin_source   text,
  status          vehicle_status not null default 'draft',
  published       boolean not null default false,
  featured        boolean not null default false,
  protocol_passed int not null default 0,
  protocol_total  int not null default 150,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index on vehicles (status) where published;
create index on vehicles (featured) where published;

create table vehicle_photos (
  id          uuid primary key default gen_random_uuid(),
  vehicle_id  uuid not null references vehicles on delete cascade,
  storage_path text not null,      -- bucket: vehicle-photos (INT-04)
  label       text,                -- 'frente', 'motor', 'interior'…
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);
create index on vehicle_photos (vehicle_id, sort_order);

-- ------------------------------------------------ protocol (150 points)
create table protocol_stages (
  id     int primary key,
  name   text not null,
  points int  not null
);
insert into protocol_stages (id, name, points) values
  (1, 'Verificação documental', 12),
  (2, 'Inspecção técnica',      46),
  (3, 'Registo fotográfico',    38),
  (4, 'Transporte',             18),
  (5, 'Legalização',            22),
  (6, 'Garantia',               14);

create table vehicle_protocol (
  vehicle_id     uuid not null references vehicles on delete cascade,
  stage_id       int  not null references protocol_stages,
  points_passed  int  not null default 0,
  completed_at   timestamptz,
  primary key (vehicle_id, stage_id)
);

-- ----------------------------------------------------------------- leads
-- INT-07
create table leads (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text,
  phone         text,
  source        lead_source not null default 'contacto',
  status        lead_status not null default 'novo',
  interest      text,
  budget_eur    numeric(10,2),
  vehicle_id    uuid references vehicles on delete set null,
  message       text,
  operation_id  uuid,                  -- set on conversion
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on leads (status, created_at desc);

-- ------------------------------------------------------------ operations
-- INT-03
create table operations (
  id            uuid primary key default gen_random_uuid(),
  ref           text unique not null,          -- 'OP-2026-014'
  customer_id   uuid references profiles on delete set null,
  lead_id       uuid references leads on delete set null,
  type          operation_type not null,
  state         operation_state not null default 'active',
  vehicle_id    uuid references vehicles on delete set null,
  vehicle_label text,                          -- free text before a vehicle exists
  total_eur     numeric(10,2) not null default 0,
  current_step  int not null default 1,        -- 1..8
  eta_weeks_min int default 4,
  eta_weeks_max int default 6,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on operations (state, updated_at desc);
create index on operations (customer_id);

alter table leads
  add constraint leads_operation_fk
  foreign key (operation_id) references operations on delete set null;

create table operation_step_defs (
  step  int primary key,
  title text not null,
  note  text
);
insert into operation_step_defs (step, title, note) values
  (1, 'Pedido qualificado',  'Briefing e orçamento aprovados pelo cliente.'),
  (2, 'Briefing recebido',   'Marca, modelo, orçamento e extras confirmados.'),
  (3, 'Viatura localizada',  'Opções apresentadas com conta fechada.'),
  (4, 'Inspecção na origem', 'Relatório técnico e fotografias na rampa.'),
  (5, 'Contrato assinado',   'Sinal liquidado e viatura reservada.'),
  (6, 'Transporte',          'Porta-carros coberto, com rastreamento.'),
  (7, 'Legalização',         'ISV, matrícula nacional e registo.'),
  (8, 'Entregue',            'Entrega ao domicílio e garantia activa.');

create table operation_steps (
  operation_id uuid not null references operations on delete cascade,
  step         int  not null references operation_step_defs,
  completed_at timestamptz,
  note         text,
  primary key (operation_id, step)
);

-- Cost lines shown to the customer (portal "A sua conta").
create table operation_costs (
  id           uuid primary key default gen_random_uuid(),
  operation_id uuid not null references operations on delete cascade,
  label        text not null,
  detail       text,
  amount_eur   numeric(10,2) not null,
  sort_order   int not null default 0
);

-- -------------------------------------------------------------- payments
-- INT-05. Only the Stripe webhook may set status='paid'.
create table payments (
  id                uuid primary key default gen_random_uuid(),
  operation_id      uuid not null references operations on delete cascade,
  description       text not null,
  amount_eur        numeric(10,2) not null,
  status            payment_status not null default 'scheduled',
  method            text,
  due_date          date,
  paid_at           timestamptz,
  stripe_link_url   text,
  stripe_session_id text,
  sort_order        int not null default 0,
  created_at        timestamptz not null default now()
);
create index on payments (operation_id, sort_order);

-- ------------------------------------------------------------- documents
-- INT-04 / INT-10
create table documents (
  id           uuid primary key default gen_random_uuid(),
  ref          text unique,                    -- 'ORC-2026-005'
  type         doc_type not null,
  status       doc_status not null default 'rascunho',
  visibility   doc_visibility not null default 'interno',
  operation_id uuid references operations on delete cascade,
  vehicle_id   uuid references vehicles on delete set null,
  customer_id  uuid references profiles on delete set null,
  title        text,
  amount_eur   numeric(10,2),
  payload      jsonb,                           -- snapshot used to render
  storage_path text,                            -- bucket: documents
  valid_until  date,
  issued_at    timestamptz,
  created_at   timestamptz not null default now()
);
create index on documents (operation_id);
create index on documents (type, created_at desc);

-- Gapless per-year, per-prefix reference counter.
create table document_counters (
  prefix text not null,
  year   int  not null,
  last   int  not null default 0,
  primary key (prefix, year)
);

create or replace function next_document_ref(p_prefix text)
returns text language plpgsql security definer set search_path = public as $$
declare y int := extract(year from now()); n int;
begin
  insert into document_counters (prefix, year, last) values (p_prefix, y, 1)
  on conflict (prefix, year) do update set last = document_counters.last + 1
  returning last into n;
  return p_prefix || '-' || y || '-' || lpad(n::text, 3, '0');
end $$;

-- --------------------------------------------------------------- messages
-- INT-06
create table operation_messages (
  id           uuid primary key default gen_random_uuid(),
  operation_id uuid not null references operations on delete cascade,
  author_id    uuid references profiles on delete set null,
  from_staff   boolean not null default false,
  body         text not null,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);
create index on operation_messages (operation_id, created_at);

-- Website contact-form submissions (admin → Mensagens).
create table site_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text,
  phone      text,
  source     lead_source not null default 'contacto',
  body       text not null,
  lead_id    uuid references leads on delete set null,
  handled_at timestamptz,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------- site content
-- INT-08
create table site_content (
  id         uuid primary key default gen_random_uuid(),
  page       text not null,      -- 'home', 'protocolo', 'inventario'…
  block      text not null,      -- 'hero', 'calculadora'…
  status     content_status not null default 'pendente',
  content    jsonb not null default '{}',
  updated_by uuid references profiles on delete set null,
  updated_at timestamptz not null default now(),
  unique (page, block)
);

-- --------------------------------------------------------------- settings
-- INT-09. Single row; feeds the public calculator and the documents.
create table settings (
  id                     int primary key default 1 check (id = 1),
  company_name           text,
  legal_name             text,
  nipc                   text,
  address                text,
  phone                  text,
  email                  text,
  iban                   text,
  cost_transport_eur     numeric(10,2) default 950,
  cost_registration_eur  numeric(10,2) default 480,
  commission_fixed_eur   numeric(10,2) default 1250,
  service_fee_order_eur  numeric(10,2) default 4500,
  warranty_6m_eur        numeric(10,2) default 500,
  updated_at             timestamptz not null default now()
);
insert into settings (id) values (1) on conflict do nothing;

-- ------------------------------------------------------------ updated_at
create or replace function touch_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger t_vehicles   before update on vehicles   for each row execute function touch_updated_at();
create trigger t_operations before update on operations for each row execute function touch_updated_at();
create trigger t_leads      before update on leads      for each row execute function touch_updated_at();

-- ================================================================== RLS
alter table profiles           enable row level security;
alter table vehicles           enable row level security;
alter table vehicle_photos     enable row level security;
alter table vehicle_protocol   enable row level security;
alter table leads              enable row level security;
alter table operations         enable row level security;
alter table operation_steps    enable row level security;
alter table operation_costs    enable row level security;
alter table payments           enable row level security;
alter table documents          enable row level security;
alter table operation_messages enable row level security;
alter table site_messages      enable row level security;
alter table site_content       enable row level security;
alter table settings           enable row level security;

-- profiles: own row, or any row for staff
create policy profiles_self on profiles for select using (id = auth.uid() or is_staff());
create policy profiles_update_self on profiles for update using (id = auth.uid() or is_staff());

-- vehicles: public reads published rows; staff read/write everything
create policy vehicles_public_read on vehicles for select
  using (published or is_staff());
create policy vehicles_staff_write on vehicles for all
  using (is_staff()) with check (is_staff());

create policy vehicle_photos_read on vehicle_photos for select using (
  is_staff() or exists (
    select 1 from vehicles v where v.id = vehicle_id and v.published
  )
);
create policy vehicle_photos_write on vehicle_photos for all
  using (is_staff()) with check (is_staff());

create policy vehicle_protocol_read on vehicle_protocol for select using (true);
create policy vehicle_protocol_write on vehicle_protocol for all
  using (is_staff()) with check (is_staff());

-- leads: staff only
create policy leads_staff on leads for all using (is_staff()) with check (is_staff());

-- operations: staff, or the customer who owns it
create policy operations_read on operations for select
  using (is_staff() or customer_id = auth.uid());
create policy operations_write on operations for all
  using (is_staff()) with check (is_staff());

create policy operation_steps_read on operation_steps for select using (
  is_staff() or exists (
    select 1 from operations o where o.id = operation_id and o.customer_id = auth.uid()
  )
);
create policy operation_steps_write on operation_steps for all
  using (is_staff()) with check (is_staff());

create policy operation_costs_read on operation_costs for select using (
  is_staff() or exists (
    select 1 from operations o where o.id = operation_id and o.customer_id = auth.uid()
  )
);
create policy operation_costs_write on operation_costs for all
  using (is_staff()) with check (is_staff());

create policy payments_read on payments for select using (
  is_staff() or exists (
    select 1 from operations o where o.id = operation_id and o.customer_id = auth.uid()
  )
);
-- Customers never write payments; the Stripe webhook uses the service role.
create policy payments_write on payments for all
  using (is_staff()) with check (is_staff());

-- documents: staff see all; customers see only visibility='cliente' on their operation
create policy documents_read on documents for select using (
  is_staff() or (
    visibility = 'cliente' and exists (
      select 1 from operations o where o.id = operation_id and o.customer_id = auth.uid()
    )
  )
);
create policy documents_write on documents for all
  using (is_staff()) with check (is_staff());

-- chat: both sides read; both sides insert their own
create policy messages_read on operation_messages for select using (
  is_staff() or exists (
    select 1 from operations o where o.id = operation_id and o.customer_id = auth.uid()
  )
);
create policy messages_insert on operation_messages for insert with check (
  author_id = auth.uid() and (
    is_staff() or exists (
      select 1 from operations o where o.id = operation_id and o.customer_id = auth.uid()
    )
  )
);

-- site_messages: anonymous insert from the contact form, staff read
create policy site_messages_insert on site_messages for insert with check (true);
create policy site_messages_read   on site_messages for select using (is_staff());

-- site_content: public reads published, staff write
create policy site_content_read on site_content for select
  using (status = 'publicado' or is_staff());
create policy site_content_write on site_content for all
  using (is_staff()) with check (is_staff());

-- settings: readable (the public calculator needs the cost defaults), staff write
create policy settings_read  on settings for select using (true);
create policy settings_write on settings for update using (is_staff()) with check (is_staff());

-- =============================================================== storage
-- Create in the dashboard, then apply policies to storage.objects:
--   vehicle-photos : public read, staff write
--   documents      : NO public read; signed URLs only, staff write
