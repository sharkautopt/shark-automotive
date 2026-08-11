import type { Operation, OperationStepClient } from '@/lib/types'

function euro(n: number | null): string {
  if (n == null) return '—'
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

function date(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function OperationCard({
  operation,
  steps,
}: {
  operation: Operation
  steps: OperationStepClient[]
}) {
  const currentStep = steps.find((s) => s.step_status === 'active')?.step_label ?? '—'

  return (
    <div className="space-y-4">
      <div className="border border-[#9FADBB] bg-white p-6">
        <h3 className="font-bebas text-2xl tracking-wide text-[#0E1B2F]">A Tua Operação</h3>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 md:grid-cols-4">
          <Field label="Valor Investido" value={euro(operation.investment_amount)} />
          <Field label="Data de Entrada" value={date(operation.investment_date)} />
          <Field label="Passo Actual" value={currentStep} />
          <Field label="Fecho Estimado" value={date(operation.estimated_close_date)} />
        </dl>
      </div>

      <div className="border border-[#9FADBB] bg-white p-6">
        <h4 className="font-mono text-[11px] uppercase tracking-widest text-[#0E1B2F]/50">Resultados</h4>
        {operation.result_amount == null && !operation.result_notes ? (
          <p className="mt-3 text-sm leading-relaxed text-[#0E1B2F]/70">
            Resultado ainda não apurado. Será actualizado pela equipa Shark.
          </p>
        ) : (
          <dl className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Resultado Apurado" value={euro(operation.result_amount)} />
            <Field label="Data de Liquidação" value={date(operation.result_date)} />
            <div className="md:col-span-3">
              <dt className="font-mono text-[10px] uppercase tracking-widest text-[#0E1B2F]/50">Observações</dt>
              <dd className="mt-1 text-sm leading-relaxed text-[#0E1B2F]">{operation.result_notes || '—'}</dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-widest text-[#0E1B2F]/50">{label}</dt>
      <dd className="mt-1 text-sm text-[#0E1B2F]">{value || '—'}</dd>
    </div>
  )
}
