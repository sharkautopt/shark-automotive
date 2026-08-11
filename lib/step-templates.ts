import type { OperationRole } from '@/lib/types'

// Exact step label templates per role. First step seeds as 'active', rest 'pending'.
export const STEP_TEMPLATES: Record<OperationRole, string[]> = {
  comprador: [
    'Viatura Seleccionada',
    'Contrato Assinado',
    'Pagamento Confirmado',
    'Documentação em Processo',
    'Matrícula Emitida',
    'Entrega Agendada',
    'Entregue',
  ],
  encomenda: [
    'Briefing Recebido',
    'Pesquisa em Curso',
    'Opções Apresentadas',
    'Viatura Aprovada',
    'Pagamento Sinal',
    'Inspeção técnica e documentação',
    'Em Transporte',
    'Legalização',
    'Entregue',
  ],
  parceiro: [
    'Contrato Assinado',
    'Capital Confirmado',
    'Viatura em Sourcing',
    'Viatura Adquirida',
    'Em Preparação',
    'À Venda',
    'Vendido',
    'Resultado Apurado',
    'Liquidação Efectuada',
  ],
}

// Standard document slots seeded/available per operation.
export const DOCUMENT_SLOTS: { doc_type: string; doc_label: string }[] = [
  { doc_type: 'contrato', doc_label: 'Contrato de Compra e Venda' },
  { doc_type: 'dav', doc_label: 'DAV' },
  { doc_type: 'inspecao_b', doc_label: 'Relatório Inspeção B' },
  { doc_type: 'dossier_150', doc_label: 'Dossier Técnico 150' },
  { doc_type: 'carpass', doc_label: 'Car-Pass' },
  { doc_type: 'factura_compra', doc_label: 'Factura de Compra' },
  { doc_type: 'dua', doc_label: 'DUA' },
  { doc_type: 'comprovativo_pagamento', doc_label: 'Comprovativo Pagamento' },
]
