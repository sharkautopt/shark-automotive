import { FileText, ExternalLink } from "lucide-react"

interface DocRow {
  id: string
  doc_type: string
  title: string
  public_url: string | null
  client_name: string | null
  document_number: string | null
  created_at: string
}

const typeLabel: Record<string, string> = {
  encomenda_proposta: "Proposta",
  encomenda_orcamento: "Orçamento",
  window_sticker: "Ficha de Vitrine",
}

export function RecentDocuments({ documents }: { documents: DocRow[] }) {
  if (documents.length === 0) {
    return (
      <p className="text-shark-silver/50 text-sm border border-shark-gold/10 rounded-lg px-5 py-8 text-center">
        Ainda não foram gerados documentos.
      </p>
    )
  }

  return (
    <div className="border border-shark-gold/10 rounded-xl overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-shark-gold/10 text-shark-silver/60 font-mono text-xs uppercase">
            <th className="p-4">Documento</th>
            <th className="p-4">Tipo</th>
            <th className="p-4">Cliente</th>
            <th className="p-4">Data</th>
            <th className="p-4 text-right">Abrir</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id} className="border-b border-shark-gold/5 hover:bg-shark-navy/40 transition-colors">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-shark-gold/70 shrink-0" />
                  <span className="text-shark-silver">{doc.document_number || doc.title}</span>
                </div>
              </td>
              <td className="p-4 text-shark-silver/80">{typeLabel[doc.doc_type] || doc.doc_type}</td>
              <td className="p-4 text-shark-silver/80">{doc.client_name || "—"}</td>
              <td className="p-4 text-shark-silver/50 text-sm">
                {new Date(doc.created_at).toLocaleDateString("pt-PT")}
              </td>
              <td className="p-4 text-right">
                {doc.public_url ? (
                  <a
                    href={doc.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-shark-gold hover:text-shark-gold-light"
                  >
                    PDF <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-shark-silver/30">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
