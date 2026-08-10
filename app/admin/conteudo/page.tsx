import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const pages = [
  {
    id: 'home',
    name: 'Página Inicial',
    description: 'Hero, estatísticas, protocolo, destaques e CTA',
    sections: ['hero', 'stats', 'protocol', 'inside process', 'featured', 'cta'],
    status: 'ready'
  },
  {
    id: 'protocolo',
    name: 'Protocolo 150',
    description: 'Protocolo SHARK values and timeline',
    sections: ['hero', 'values', 'timeline'],
    status: 'pending'
  },
  {
    id: 'inventario',
    name: 'Inventário',
    description: 'Vehicle listings and filters',
    sections: ['hero', 'filters'],
    status: 'pending'
  },
  {
    id: 'importacao',
    name: 'Importação',
    description: 'Import process and calculator',
    sections: ['hero', 'benefits', 'timeline', 'calculator'],
    status: 'pending'
  },
  {
    id: 'parceiros',
    name: 'Parceiros',
    description: 'Partnership models and form',
    sections: ['hero', 'models', 'benefits'],
    status: 'pending'
  },
  {
    id: 'quem-somos',
    name: 'Quem Somos',
    description: 'Company mission and team',
    sections: ['hero', 'mission', 'team'],
    status: 'pending'
  },
  {
    id: 'contacto',
    name: 'Contacto',
    description: 'Contact information and form',
    sections: ['hero', 'contact'],
    status: 'pending'
  }
]

export const metadata = {
  title: 'Conteúdo do Site | Admin',
  description: 'Manage website content'
}

export default function ConteudoPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Conteúdo do Site</h1>
        <p className="text-muted-foreground">Edite o conteúdo de cada página do website</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pages.map((page) => (
          <Link
            key={page.id}
            href={`/admin/conteudo/${page.id}`}
            className="group relative"
          >
            <div className="border border-border/50 p-6 hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {page.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">{page.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>

              {/* Sections preview */}
              <div className="flex flex-wrap gap-2 mt-4">
                {page.sections.map((section) => (
                  <span
                    key={section}
                    className="px-2 py-1 text-xs bg-secondary text-secondary-foreground"
                  >
                    {section}
                  </span>
                ))}
              </div>

              {/* Status badge */}
              {page.status === 'pending' && (
                <div className="absolute top-4 right-4">
                  <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-700 font-mono">
                    Pendente
                  </span>
                </div>
              )}
              {page.status === 'ready' && (
                <div className="absolute top-4 right-4">
                  <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-700 font-mono">
                    Ativo
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Next steps */}
      <div className="border border-border/50 bg-card/30 p-6 mt-8">
        <h3 className="font-semibold mb-2">Como funciona</h3>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Clique numa página para abrir o editor de conteúdo</li>
          <li>Edite os campos e veja a contagem de caracteres</li>
          <li>Clique em &quot;Guardar Alterações&quot; para publicar no site</li>
          <li>Use &quot;Ver no Site&quot; para confirmar a alteração em tempo real</li>
        </ol>
      </div>
    </div>
  )
}
