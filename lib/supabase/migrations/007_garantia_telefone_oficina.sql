-- Atualiza o texto do template "Garantia Standard": número de assistência
-- (936 616 026, via {{garantia.telefone}}) e reparações em oficina autorizada e
-- parceira. Só altera se o template ainda tem o texto original da cláusula
-- "Acionamento" — se alguém o editou no admin, não toca em nada.
-- Correr DEPOIS do deploy que traz a variável {{garantia.telefone}}.
UPDATE public.garantia_templates
SET clausulas = $j$[
    {"titulo": "Prazo", "texto": "A garantia é concedida pelo prazo de {{garantia.prazo_texto}}, com início em {{garantia.data_inicio}} e termo em {{garantia.data_fim}}."},
    {"titulo": "Âmbito", "texto": "A garantia abrange os seguintes componentes: {{garantia.componentes}}."},
    {"titulo": "Exclusões", "texto": "Ficam excluídos da garantia: {{garantia.exclusoes}}, bem como danos resultantes de utilização indevida, acidente, falta de manutenção ou intervenção por terceiros não autorizados pelo Vendedor."},
    {"titulo": "Acionamento", "texto": "Para acionar a garantia, o Comprador deve contactar o Vendedor através do número {{garantia.telefone}} (ou {{empresa.email}}) antes de qualquer reparação, descrevendo a avaria e indicando o número desta garantia ({{garantia.numero}}). As reparações realizadas sem autorização prévia do Vendedor não são abrangidas."},
    {"titulo": "Local das reparações", "texto": "As reparações abrangidas pela presente garantia são efetuadas em oficina autorizada e parceira da Shark Automotive, indicada pelo Vendedor. As reparações efetuadas noutra oficina não são abrangidas pela garantia."},
    {"titulo": "Direitos legais", "texto": "A presente garantia é concedida sem prejuízo dos direitos que a lei reconhece ao Comprador, designadamente os decorrentes do Decreto-Lei n.º 84/2021, de 18 de outubro, quando aplicável."},
    {"titulo": "Autenticidade", "texto": "A autenticidade e a validade desta garantia podem ser verificadas em {{garantia.url_validacao}}."}
  ]$j$::jsonb,
  updated_at = now(),
  updated_by = 'migração 007'
WHERE nome = 'Garantia Standard'
  AND clausulas->3->>'titulo' = 'Acionamento'
  AND clausulas->3->>'texto' LIKE 'Para acionar a garantia, o Comprador deve contactar o Vendedor ({{empresa.email}}%';
