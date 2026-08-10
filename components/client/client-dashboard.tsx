'use client'

import { useState } from 'react'
import { ClientSidebar, ALL_SECTIONS, type SectionId } from './client-sidebar'
import { ClientHeader } from './client-header'
import { StatusTracker } from './status-tracker'
import { VehicleCard } from './vehicle-card'
import { OperationCard } from './operation-card'
import { DocumentsSection } from './documents-section'
import { InvoicesSection } from './invoices-section'
import { MessagesSection } from './messages-section'
import { SettingsSection } from './settings-section'
import type {
  Operation,
  OperationStepClient,
  OperationDocument,
  Invoice,
  Message,
  Profile,
} from '@/lib/types'

export function ClientDashboard({
  profile,
  operation,
  steps,
  documents,
  invoices,
  messages,
}: {
  profile: Profile
  operation: Operation
  steps: OperationStepClient[]
  documents: OperationDocument[]
  invoices: Invoice[]
  messages: Message[]
}) {
  const isParceiro = operation.role === 'parceiro'
  const sections = ALL_SECTIONS.filter((s) => (s.id === 'resultados' ? isParceiro : true))
  const [active, setActive] = useState<SectionId>('estado')

  return (
    <div className="md:pl-60">
      <ClientSidebar sections={sections} active={active} onSelect={setActive} />

      <main className="mx-auto max-w-4xl px-4 py-8 pb-24 md:px-8 md:pb-8">
        <ClientHeader
          name={profile.full_name || 'Cliente'}
          role={operation.role}
          title="Área de Cliente"
        />

        {active === 'estado' && (
          <div className="space-y-6">
            <StatusTracker steps={steps} />
            {isParceiro ? (
              <OperationCard operation={operation} steps={steps} />
            ) : (
              <VehicleCard operation={operation} />
            )}
          </div>
        )}

        {active === 'documentos' && (
          <DocumentsSection operationId={operation.id} documents={documents} />
        )}

        {active === 'facturas' && <InvoicesSection operationId={operation.id} invoices={invoices} />}

        {active === 'mensagens' && (
          <MessagesSection operationId={operation.id} initialMessages={messages} />
        )}

        {active === 'resultados' && isParceiro && (
          <OperationCard operation={operation} steps={steps} />
        )}

        {active === 'definicoes' && <SettingsSection profile={profile} />}
      </main>
    </div>
  )
}
