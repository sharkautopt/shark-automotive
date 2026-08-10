export interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  mileage: number
  fuel_type: string
  transmission: string
  power: number
  price: number
  country_origin: string
  vin: string | null
  inspection_status: 'pending' | 'in_progress' | 'approved' | 'rejected'
  carpass_status: boolean
  protocol_score: number
  photos: string[]
  featured: boolean
  status: 'available' | 'reserved' | 'sold'
  description: string | null
  dossier_url: string | null
  financing_available: boolean
  exterior_color: string | null
  interior_color: string | null
  body_type: string | null
  doors: number
  seats: number
  engine_size: string | null
  co2_emissions: number | null
  registration_date: string | null
  first_owner: boolean
  service_history: boolean
  warranty_months: number
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  lead_type: 'contact' | 'import_request' | 'financing' | 'investment_partner' | 'vehicle_inquiry'
  source: string
  status: 'new' | 'contacted' | 'qualified' | 'negotiating' | 'converted' | 'lost'
  vehicle_id: string | null
  message: string | null
  budget_min: number | null
  budget_max: number | null
  preferred_makes: string[] | null
  preferred_models: string[] | null
  investment_amount: number | null
  financing_amount: number | null
  notes: string | null
  assigned_to: string | null
  priority: 'low' | 'normal' | 'high' | 'urgent'
  created_at: string
  updated_at: string
  contacted_at: string | null
  converted_at: string | null
}

export interface Testimonial {
  id: string
  client_name: string
  client_location: string | null
  vehicle_purchased: string | null
  rating: number
  testimonial: string
  photo_url: string | null
  featured: boolean
  approved: boolean
  created_at: string
}

export interface SiteSettings {
  id: string
  key: string
  value: Record<string, unknown>
  updated_at: string
}

export interface Statistics {
  vehicles_imported: number
  satisfied_clients: number
  years_experience: number
  average_savings: number
}

export interface ContactInfo {
  phone: string
  email: string
  whatsapp: string
  address: string
}

// ===== Client Area / Operations =====

export type OperationRole = 'comprador' | 'encomenda' | 'parceiro'

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  notification_email: boolean
  created_at: string
}

export interface Operation {
  id: string
  profile_id: string
  role: OperationRole
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_year: number | null
  vehicle_km: number | null
  vehicle_colour: string | null
  vehicle_plate: string | null
  vehicle_photo_url: string | null
  protocolo_score: number | null
  investment_amount: number | null
  investment_date: string | null
  estimated_close_date: string | null
  result_amount: number | null
  result_date: string | null
  result_notes: string | null
  status: string
  created_at: string
}

export type StepStatus = 'completed' | 'active' | 'blocked' | 'pending'

// Client-facing shape — NEVER includes internal_note.
export interface OperationStepClient {
  id: string
  step_order: number
  step_label: string
  step_status: StepStatus
  completed_at: string | null
  client_note: string | null
}

// Admin shape — includes internal_note.
export interface OperationStep extends OperationStepClient {
  operation_id: string
  internal_note: string | null
  notify_client: boolean
  created_at: string
}

export type DocumentStatus = 'disponivel' | 'pendente' | 'nao_aplicavel'

export interface OperationDocument {
  id: string
  operation_id: string
  doc_type: string | null
  doc_label: string | null
  storage_path: string | null
  uploaded_by: 'admin' | 'client'
  uploaded_at: string
  status: DocumentStatus
}

export type InvoiceStatus = 'paga' | 'pendente' | 'em_processamento'

export interface Invoice {
  id: string
  operation_id: string
  invoice_number: string | null
  description: string | null
  amount: number | null
  invoice_date: string | null
  status: InvoiceStatus
  storage_path: string | null
}

export interface Message {
  id: string
  operation_id: string
  sender: 'admin' | 'client'
  sender_name: string | null
  body: string
  created_at: string
}

export interface ActivityLogEntry {
  id: string
  operation_id: string
  action: string | null
  performed_by: string | null
  detail: string | null
  performed_at: string
}
