import { supabaseAdmin } from "@/lib/supabase/service-role"
import type { Operation, Profile } from "@/lib/types"

export interface OperationDocData {
  operation: Operation
  profile: Profile
}

/**
 * Single place every operation-tied document route loads its data from —
 * the actual "auto-fill" mechanism. Operation already snapshots the full
 * vehicle spec as its own vehicle_* columns (no join needed: an encomenda
 * vehicle is often sourced for one client and never listed in inventory).
 */
export async function loadOperationDocData(operationId: string): Promise<OperationDocData> {
  const { data: operation, error: opErr } = await supabaseAdmin
    .from("operations")
    .select("*")
    .eq("id", operationId)
    .single<Operation>()

  if (opErr || !operation) {
    throw new Error(`Operação não encontrada: ${opErr?.message ?? operationId}`)
  }

  const { data: profile, error: profileErr } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", operation.profile_id)
    .single<Profile>()

  if (profileErr || !profile) {
    throw new Error(`Cliente não encontrado: ${profileErr?.message ?? operation.profile_id}`)
  }

  return { operation, profile }
}

/** Formats a document number as PREFIX-YYYY/NNN, e.g. "PI-2026/001". */
export function formatDocNumber(prefix: string, year: number, seq: number): string {
  return `${prefix}-${year}/${String(seq).padStart(3, "0")}`
}

/** pt-PT long date, e.g. "18 de setembro de 2026" — matches the mockup exactly. */
export function formatLongDatePt(date: Date = new Date()): string {
  return date.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })
}
