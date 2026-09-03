# Handoff: Shark Automotive — Admin Panel, Customer Portal & Documents

## Overview
A redesign of the sharkauto.pt back office, plus two things the current system
does not have: a customer-facing portal for each import operation, and a set of
print-ready document templates.

Three design files:

| File | What it is |
| --- | --- |
| `Shark Admin.dc.html` | Full admin panel — 9 screens + login |
| `Shark Portal Cliente.dc.html` | What the customer sees for one operation |
| `Shark Documentos.dc.html` | 3 print templates (A4): orçamento, ficha de vidro, declaração de circulação |

## About the design files
These are **design references written in HTML** — prototypes showing intended
look and behaviour, not production code to copy. The task is to **recreate
these designs in the target codebase** (Next.js + Supabase, per the existing
site) using its established patterns and component library.

All data in the prototypes is **mock**, held in one `dados()` method (admin) or
`renderVals()` (portal, documents). Each array is a seam: swap the return value
for a Supabase query and the UI works unchanged. Nothing is wired to a network.

## Fidelity
**High-fidelity.** Final colours, typography, spacing and interaction states.
Recreate pixel-closely, but use the codebase's existing primitives where they
already exist.

## Design tokens

Colours
| Token | Hex | Use |
| --- | --- | --- |
| Petrol | `#0E2529` | Sidebar, primary buttons, customer portal background, document header band |
| Petrol deep | `#081619` | Page background behind portal, footers |
| Chalk | `#EDEAE2` | Text on petrol, light surfaces |
| Bone | `#E4E1D8` | Admin canvas background |
| Panel | `#F5F3EE` | Admin cards and tables |
| Panel alt | `#DDD9CF` | Inset tiles, photo placeholders |
| Amber | `#E9A93F` | Accent, active nav, current pipeline step, primary CTA on dark |
| Amber ink | `#B07316` | Amber used as text on light backgrounds (contrast) |
| Ink | `#141A1C` | Document body text |
| Slate | `#3E4E51` | Secondary text on light |
| Muted | `#6C6A62` | Tertiary text, mono labels |
| Steel | `#8FA3A6` | Tertiary text on petrol |

Status chip pairs (background / text)
| Tone | BG | Text | Used for |
| --- | --- | --- | --- |
| verde | `#DCEBE1` | `#2C5F44` | Disponível, Pago, Aceite, Convertido |
| ambar | `#F6E7CB` | `#8A5A11` | Pendente, Contactado, Rascunho, Aberto |
| azul | `#D9E4F0` | `#2B4C74` | Novo, Enviado |
| vermelho | `#F3DCDC` | `#8A2E2E` | Vendido, Perdido |
| neutro | `#DDD9CF` | `#3E4E51` | Interno, Agendado, Emitida |

Typography
- **Anton** — all headings, KPI numbers, prices. 400 weight only, uppercase.
- **IBM Plex Mono** — labels, table headers, metadata, IDs, money. 400/500/600.
  Labels are 9–11px, `letter-spacing: 0.14em`, uppercase.
- **IBM Plex Sans** — body and form text. 400/500/600.

Spacing / structure
- Admin sidebar: 246px fixed, sticky full height.
- Panels: `1px solid rgba(14,37,41,0.14)` on `#F5F3EE`. **No border-radius
  anywhere. No shadows.**
- Grid gutters as 1px dividers: a `rgba(14,37,41,0.14)` grid background with
  `gap:1px` and opaque children — reads as hairline rules, not gaps.
- Table rows: `1px solid rgba(14,37,41,0.09)` bottom border, 14–16px padding.
- Progress bars: 4–6px tall, `rgba(14,37,41,0.12)` track.

## Screens — admin

Sidebar nav, numbered 01–09, active item is amber with petrol text.

### 01 Dashboard
Five KPI tiles (stock, active operations, new leads, value in flight,
conversion). Then two panels side by side: **Operações a decorrer** (clickable
rows with an 8-step progress bar) and **Precisa de atenção** — a triage list
where each row has a coloured dot, a reason, and a jump-to action. Below, a
recent-leads table.

The *Precisa de atenção* panel is new and is the point of the screen: it
answers "what is stuck" rather than restating counts.

### 02 Viaturas
Table: photo thumb, name + spec, year, km, price, status chip, protocol
progress (n/150), and three per-row actions — Abrir, Ficha, Declaração.

Clicking Abrir opens an **inline editor below the table** (not a modal) in
three columns:
- *Identificação* — 9 editable fields (model, year, km, price, plate, VIN, cc, CO2, origin)
- *Visibilidade no site* — 4 checkbox flags (publicado, destaque, reservado, vendido) that control what the public site shows, plus the 6-stage protocol checklist
- *Fotografias* — 78px thumbnail grid + upload dropzone

Header of the editor is petrol with two generator buttons: **Gerar ficha de
vidro** and **Declaração de circulação**.

### 03 Operações
Card grid. Each card: ref, customer, type chip (Encomenda / Comprador),
vehicle, total value, step n/8 with progress bar, paid-so-far and document
count, then *Abrir operação* / *Portal*.

**Operation detail** is the richest screen. Left column: the 8-step pipeline,
each step with a marker (done = petrol tick, current = amber number, future =
grey), date, note, and an *Avançar* button on the current step only. Right
column, stacked:
1. **Pagamentos** — total received vs total with progress bar, then one row per
   payment (description, method, date, amount, status chip) and a *+ Criar link* action.
2. **Documentos e facturas** — file rows with a visibility chip
   (Visível to customer / Interno / Pendente) and an upload dropzone.
3. **Conversa com o cliente** — chat thread, admin messages right-aligned in
   petrol, customer left in bone, with a composer. Working in the prototype
   (local state only).

Header actions: *Ver portal do cliente* and *Criar conta de acesso*.

### 04 Documentos
Four template cards (DOC-01 orçamento, DOC-02 proposta de venda, DOC-03
declaração, DOC-04 ficha de vidro) over a table of issued documents with
reference, type, customer, value, status and *Ver PDF*.

### 05 Leads
Six funnel tiles, then a filter row (Todos / Novo / Contactado / Qualificado /
Em negociação / Convertido / Perdido) that actually filters, then the table.
Each row's action is **Criar operação** — the conversion path the current admin
is missing.

### 06 Mensagens
Card per message: name, origin chip, date, quoted body, contact details,
*Responder*.

### 07 Relatórios
Four metric tiles, two bar panels (stock distribution, leads by type), lead
pipeline strip.

### 08 Conteúdo do site
Card per page with status chip and block tags. Clicking opens the editor
(not designed — see Open questions).

### 09 Configurações
Three panels: company data, default costs (these feed the website calculator
**and** the orçamento template — single source of truth), and an
**Integrações** panel on petrol listing every INT code and its status.

## Screens — customer portal

One operation, customer's view. Petrol background, matching the public site.
- Hero: current step, headline naming their vehicle, plain-language status.
- Four summary tiles: step, estimated timeline, paid so far, document count.
- Left: the same 8 steps, but future steps are dimmed rather than actionable.
- Right: **A sua conta** (line-item cost breakdown + total), then payment rows
  where the due one has an amber *Pagar agora* button; **Os seus documentos**
  (download list — only rows marked Visível in admin); **Falar com a Shark**
  (chat, customer messages amber and right-aligned).

## Documents

`Shark Documentos.dc.html` uses a paged-document component, A4, three
explicitly paginated pages. Each page is designed to fill the A4 box.

1. **Orçamento** — rebuild of the existing ORC PDF. Petrol header band with
   prepared-for / date / valid-until, then vehicle name with the turnkey total
   set against it, 12-field spec grid in two columns, cost breakdown where the
   service-fee row carries its inclusions as sub-text, big total, prazo and
   garantia tiles, legal note and signature line.
2. **Ficha de vidro** — window sticker. Huge model name and price, six spec
   tiles, verified-equipment checklist, and a petrol footer block with a QR
   placeholder pointing to the dossier.
3. **Declaração de circulação** — same legal content and 16 vehicle fields as
   the existing generator, re-set in the brand system. Text is verbatim from
   your current document apart from spelling normalised to pre-AO Portuguese.

The existing generator uses editable `<input>` fields; these templates render
filled values instead, on the assumption they are generated from operation data
(INT-10). If you want the fill-in-by-hand behaviour, keep inputs.

## Integration points

Each is marked in the source as `INT-nn` and listed in admin → Configurações.

| Code | Area | What is needed |
| --- | --- | --- |
| INT-01 | Auth | `supabase.auth.signInWithPassword`; `profiles.role in ('admin','staff')` gate; RLS on every table |
| INT-02 | Vehicles | CRUD on `vehicles`; `published`/`featured` drive the public site |
| INT-03 | Operations | `operations` + `operation_steps`; realtime channel for step changes |
| INT-04 | Storage | Buckets `vehicle-photos` (public read) and `documents` (signed URLs only) |
| INT-05 | Payments | Stripe Payment Links; webhook writes `payments.status`; never trust the client |
| INT-06 | Chat | Realtime channel per operation on `operation_messages` |
| INT-07 | Leads | `leads` select/update; convert-to-operation action |
| INT-08 | Site content | `site_content` keyed by page + block; public site reads published rows |
| INT-09 | Settings | Single-row `settings`; feeds calculator and documents |
| INT-10 | Documents | Render template → PDF → `documents` bucket → email link; sequential refs |

Files: `schema.sql` (tables, RLS, triggers), `types.ts` (TypeScript types
matching the mock shapes exactly).

## Behaviour notes
- **No modals.** Detail views expand inline or replace the list. Deliberate —
  the current admin's dropdown-in-table pattern is hard to extend.
- Status changes are optimistic in the prototype; add error rollback.
- Chat composer clears on send and appends locally; replace with realtime insert.
- Lead filters are client-side over a small set; move to server-side filtering
  past a few hundred rows.
- The vehicle editor's *Guardar alterações* is not wired.
- Responsive: every grid uses `repeat(auto-fit, minmax(min(100%, Npx), 1fr))`,
  so all screens collapse to one column. The sidebar does **not** yet collapse
  on mobile — see Open questions.

## Open questions
1. **Site-content editor** — the page grid is designed, the per-page field
   editor is not. Needs the real block schema per page.
2. **Mobile admin** — sidebar needs a drawer pattern; not designed.
3. **Roles** — is there a staff role below admin, and what can it not see?
   Schema assumes admin / staff / customer.
4. **Document numbering** — who owns the sequence (`ORC-2026-nnn`)? Schema has
   a per-year counter; confirm it must not have gaps for accounting.
5. **ISV table** — the calculator uses the structure of the official Tabela A
   with age reduction. **Verify the coefficients against the tables in force
   before publishing**; they change with each Orçamento do Estado.
6. **Invoicing** — do the payment rows need to become certified invoices
   (software certificado / AT communication)? Out of scope here.

## Assets
- Logos loaded live from `https://www.sharkauto.pt/images/shark-fin-logo.png`
  and `shark-logo.png`. Replace with local assets.
- No photography. Vehicle photos are labelled placeholders; the QR on the
  ficha de vidro is a placeholder box.
- Fonts from Google Fonts: Anton, IBM Plex Mono, IBM Plex Sans.

## Also in this project
`Shark Automotive Homepage.dc.html` — a redesign of the public homepage whose
hero is a live cost estimator. It shares this colour and type system, and its
calculator reads the same default costs as INT-09.
