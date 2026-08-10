'use client'

import { useState } from 'react'
import type {
  Operation,
  OperationStep,
  OperationDocument,
  Invoice,
  Message,
  ActivityLogEntry,
  Profile,
} from '@/lib/types'
import { OperationStepsEditor } from './operation-steps-editor'
import { OperationDocumentsManager } from './operation-documents-manager'
import { OperationInvoicesManager } from './operation-invoices-manager'
import { OperationMessages } from './operation-messages'
import { OperationResults } from './operation-results'
import { OperationActivity } from './operation-activity'

type Props = {
  operation: Operation
  profile: Profile
  steps: OperationStep[]
  documents: OperationDocument[]
  invoices: Invoice[]
  messages: Message[]
  activity: ActivityLogEntry[]
}

export function OperationDetail({ operation, profile, steps, documents, invoices, messages, activity }: Props) {
  const tabs = [
    { id: 'steps', label: 'Status Tracker' },
    { id: 'docs', label: 'Documentos' },
    { id: 'invoices', label: 'Facturas' },
    { id: 'messages', label: 'Mensagens' },
    ...(operation.role === 'parceiro' ? [{ id: 'results', label: 'Resultados' }] : []),
    { id: 'activity', label: 'Actividade' },
  ]
  const [tab, setTab] = useState('steps')

  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-shark-gold/10 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 font-mono text-xs uppercase transition-colors ${
              tab === t.id
                ? 'text-shark-gold border-b-2 border-shark-gold'
                : 'text-shark-silver/50 hover:text-shark-silver'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'steps' && <OperationStepsEditor operationId={operation.id} steps={steps} />}
      {tab === 'docs' && <OperationDocumentsManager operationId={operation.id} documents={documents} />}
      {tab === 'invoices' && <OperationInvoicesManager operationId={operation.id} invoices={invoices} />}
      {tab === 'messages' && <OperationMessages operationId={operation.id} initialMessages={messages} />}
      {tab === 'results' && operation.role === 'parceiro' && <OperationResults operation={operation} />}
      {tab === 'activity' && <OperationActivity activity={activity} />}
    </div>
  )
}
