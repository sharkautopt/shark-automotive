# Integração da versão corrigida — Shark Automotive

Instruções para quem integra este handoff no Next.js + Supabase existente.
Ler em conjunto com `README.md` (especificação de ecrãs e tokens), `schema.sql`
(tabelas, RLS, triggers) e `types.ts` (tipos que espelham as formas dos mocks).

## 0. Ficheiros e prioridade

Quatro handoffs:

| Ficheiro | O que é |
| --- | --- |
| `Shark Admin.dc.html` | Painel de admin — 9 ecrãs + login |
| `Shark Portal Cliente.dc.html` | Vista do cliente para uma operação |
| `Shark Documentos.dc.html` | 3 templates A4 |
| `Shark Automotive Site.dc.html` | Site público — **seis páginas**, não uma homepage |

Ordem de integração por impacto: **admin → portal do cliente → documentos →
site público.** O site alinha-se ao novo sistema visual; as páginas Encomenda
e Parceiros são conteúdo novo, o resto é re-skin.

⚠ **Tokens: usar apenas o sistema Navy / Ciano / Inter** da secção *Colour and
type system* do README. Petrol, Bone, Panel, Amber, Anton e IBM Plex aparecem
na parte inicial do README como referência histórica e estão **substituídos** —
não os aplicar.

## 0.1 Regra de base

O ZIP é **handoff visual e funcional, não HTML de produção.** Nenhum ficheiro
`.dc.html` deve ser copiado, servido ou embebido. São referências de desenho:
lê-se o layout, os estados e o comportamento, e recria-se com os componentes,
convenções e primitivas do codebase actual.

## 1. Comparar antes de escrever

Para cada área — admin, site público, portal do cliente, documentos — fazer o
diff contra o que já existe:

- o que já está implementado e só precisa de re-skin,
- o que existe mas com estrutura diferente (decidir: adaptar ou substituir),
- o que é novo (ex.: portal do cliente, painel *Precisa de atenção*, simulador
  de importação, página Parceiros).

Reutilizar componentes, hooks, server actions e queries que já existam. Não
duplicar lógica de dados só para servir um ecrã novo.

## 2. Ligar a Supabase — zero dados mock

Nenhum ecrã pode ficar com arrays estáticos. Cada `dados()` / `renderVals()`
do protótipo é uma costura: substituir o valor de retorno por uma query.

| Código | Área | Ligação |
| --- | --- | --- |
| INT-01 | Auth | `supabase.auth`; gate por `profiles.role in ('admin','staff')`; RLS em todas as tabelas |
| INT-02 | Viaturas | CRUD em `vehicles`; `published`/`featured` alimentam o site público |
| INT-03 | Operações | `operations` + `operation_steps`; canal realtime para mudanças de passo |
| INT-04 | Storage | buckets `vehicle-photos` (leitura pública) e `documents` (só URLs assinados) |
| INT-05 | Pagamentos | Stripe Payment Links; **só o webhook** escreve `payments.status='paid'` |
| INT-06 | Conversa | canal realtime por operação em `operation_messages` |
| INT-07 | Leads | `leads`; formulários públicos inserem com `source` = `contacto` / `importacao` / `parceiros`; campo de capital da página Parceiros → `leads.capital_interest` |
| INT-08 | Conteúdo | `site_content` por página + bloco; o site lê só linhas publicadas |
| INT-09 | Configurações | linha única `settings`; alimenta a calculadora **e** os documentos |
| INT-10 | Documentos | template → PDF → bucket `documents` → referência sequencial sem falhas |
| INT-11 | Simulador | `import_requests`; extracção URL/texto corre **no servidor** — o cliente nunca chama um provider de IA directamente |

Checklist por ecrã: estado de loading, estado vazio, estado de erro com
recuperação, e rollback quando a actualização optimista falha.

## 3. Tokens, responsividade, acessibilidade

Aplicar o sistema do handoff (secção *Colour and type system* do README):
Navy `#0A111C` como base, Ciano `#2F80ED` em 1–2 elementos por secção, Inter
em todos os pesos, sem `border-radius` e sem sombras. Passar os valores para os
tokens do projecto (Tailwind config / CSS vars) em vez de os repetir inline.

- Responsividade: todas as grelhas do protótipo usam
  `repeat(auto-fit, minmax(min(100%, Npx), 1fr))` e colapsam para uma coluna.
  A sidebar do admin **não** colapsa — precisa de um padrão de drawer em mobile
  (não desenhado).
- Acessibilidade: contraste AA sobre navy (o cinza `#6B7280` só para texto
  pequeno não essencial), foco visível em todos os controlos, navegação por
  teclado nos acordeões e no menu, `label` associado a cada campo, e as
  imagens de viatura com `alt` real.
- O router do site público no protótipo é `state.pg`. Em produção são rotas
  reais: `/`, `/viaturas`, `/encomenda`, `/parceiros`, `/quem-somos`,
  `/contacto` — cada bloco `<sc-if>` corresponde a uma página.

## 4. Documentos

Corrigir o ciclo completo: **gerar → visualizar → descarregar.**

- Os três templates A4 (orçamento, ficha de vidro, declaração de circulação)
  são preenchidos a partir de dados da operação/viatura, não à mão.
- Geração server-side; o PDF vai para o bucket `documents`.
- Visualização e download **sempre** por URL assinado com validade curta.
  Nada de caminhos públicos para documentos.
- Referências (`ORC-2026-nnn`) vêm do contador em `document_counters` — sem
  falhas na sequência, por ano e por prefixo.
- A visibilidade (`interno` / `cliente`) controla o que aparece no portal.

## 5. Validação antes de fechar

- `lint` e `typecheck` limpos; `build` de produção sem avisos novos.
- Percorrer no browser: login admin → criar viatura → publicar → ver no site
  público → lead → converter em operação → avançar passos → gerar orçamento →
  emitir link de pagamento → ver o portal como cliente → descarregar documento.
- Testar em mobile e com teclado apenas.
- Confirmar RLS a partir de uma sessão de cliente: não deve ver operações,
  documentos internos nem mensagens de outros.

## 6. Restrições

- Não substituir a aplicação por HTML estático/offline.
- Não sobrescrever o repositório indiscriminadamente — alterar apenas as áreas
  cobertas pelo handoff.
- Nunca expor documentos privados com URLs públicos permanentes.
- Tratar campos ausentes nos dados reais (o protótipo assume tudo preenchido) e
  preservar compatibilidade com o schema existente; `schema.sql` é proposta,
  não substituição do que já está em produção.
- Manter a barreira de manutenção configurável e as rotas de admin e
  autenticação sempre acessíveis.

## 7. Pendentes de decisão do cliente

1. Página **Quem Somos** — copy em falta; o bloco está desenhado vazio.
2. Editor de conteúdo do site — grelha desenhada, editor por página não.
3. Coeficientes de ISV — verificar contra a Tabela A em vigor antes de publicar.
4. Facturação certificada (comunicação à AT) — fora do âmbito deste handoff.
