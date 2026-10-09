export type GarantiaEstado = 'rascunho' | 'emitida' | 'assinada' | 'anulada'
/** "expirada" nunca se guarda: calcula-se pela data de fim (ver dates.ts). */
export type GarantiaEstadoEfetivo = GarantiaEstado | 'expirada'

export interface ClausulaTemplate {
  titulo: string
  texto: string
}

export interface GarantiaTemplate {
  id: string
  nome: string
  descricao: string | null
  prazo_meses: number
  introducao: string
  clausulas: ClausulaTemplate[]
  componentes_cobertos: string[]
  exclusoes: string[]
  is_default: boolean
  ativo: boolean
  created_at: string
  updated_at: string
  updated_by: string | null
}

export interface Garantia {
  id: string
  operation_id: string
  template_id: string | null
  numero: string | null
  codigo_verificacao: string | null
  estado: GarantiaEstado
  versao_atual: number
  cliente_nome: string
  cliente_nif: string | null
  cliente_morada: string | null
  cliente_contacto: string | null
  viatura_marca: string | null
  viatura_modelo: string | null
  viatura_matricula: string | null
  viatura_vin: string | null
  viatura_km: number | null
  data_venda: string | null
  valor_venda: number | null
  prazo_meses: number
  data_inicio: string | null
  data_fim: string | null
  componentes_cobertos: string[]
  exclusoes: string[]
  emitida_em: string | null
  assinada_em: string | null
  assinada_ficheiro: string | null
  assinada_versao: number | null
  anulada_em: string | null
  anulada_motivo: string | null
  criado_por: string | null
  criado_por_email: string | null
  created_at: string
  updated_at: string
}

/** Campos que o admin pode editar num rascunho (ou numa nova versão). O prazo NÃO está aqui: vem do template. */
export interface GarantiaInput {
  template_id: string | null
  cliente_nome: string
  cliente_nif: string
  cliente_morada: string
  cliente_contacto: string
  viatura_marca: string
  viatura_modelo: string
  viatura_matricula: string
  viatura_vin: string
  viatura_km: number | null
  data_venda: string
  valor_venda: number | null
  data_inicio: string
  componentes_cobertos: string[]
  exclusoes: string[]
}

/** Conteúdo congelado de uma versão emitida — é daqui (e só daqui) que o PDF e a página pública leem. */
export interface GarantiaSnapshot {
  numero: string
  versao: number
  codigo_verificacao: string
  emitida_em: string
  cliente: { nome: string; nif: string; morada: string; contacto: string }
  viatura: { marca: string; modelo: string; matricula: string; vin: string; km: number }
  venda: { data: string; valor: number }
  garantia: {
    prazo_meses: number
    data_inicio: string
    data_fim: string
    componentes: string[]
    exclusoes: string[]
  }
  empresa: { nome: string; nif: string; morada: string; email: string; telefone: string }
  template: { id: string; nome: string }
  conteudo: { introducao: string; clausulas: ClausulaTemplate[] }
}

export interface GarantiaVersao {
  id: string
  garantia_id: string
  versao: number
  dados: GarantiaSnapshot
  hash_sha256: string
  motivo: string | null
  criado_por: string | null
  criado_por_email: string | null
  created_at: string
}

export type GarantiaEventoTipo =
  | 'criada'
  | 'editada'
  | 'emitida'
  | 'nova_versao'
  | 'enviada'
  | 'envio_falhado'
  | 'assinada'
  | 'anulada'

export interface GarantiaEvento {
  id: string
  garantia_id: string
  versao: number | null
  tipo: GarantiaEventoTipo
  user_id: string | null
  user_email: string | null
  detalhes: Record<string, unknown>
  created_at: string
}

export interface AdminUser {
  id: string
  email: string | null
}
