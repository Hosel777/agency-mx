import { useState } from 'react'
import { X, FileText, Code2, Image as ImageIcon, Globe, Download, FileCheck, ExternalLink } from 'lucide-react'

const TYPE_ICONS = {
  text: FileText,
  html: Globe,
  image: ImageIcon,
  code: Code2,
  file: Download,
}

const TYPE_LABELS = {
  text: 'Texto / Documento',
  html: 'Página Web',
  image: 'Imagen / Diseño',
  code: 'Código',
  file: 'Archivo',
}

export default function DeliverablePreview({ deliverable, onClose, onDeliver }) {
  const [tab, setTab] = useState('preview')
  const type = deliverable.deliverable_type || deliverable.type || 'text'
  const Icon = TYPE_ICONS[type] || FileText

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col mx-4 border border-outline-variant/20">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-h3 text-h3 text-on-surface">{deliverable.name}</h2>
              <p className="text-body-md text-on-surface-variant">
                {TYPE_LABELS[type]} — por {deliverable.agent_name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-surface-container-hover rounded-lg transition-colors">
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 border-b border-outline-variant/20 bg-surface-container-low">
          <button
            onClick={() => setTab('preview')}
            className={`px-4 py-3 text-body-md font-medium border-b-2 transition-colors ${
              tab === 'preview'
                ? 'border-primary text-primary bg-surface'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Vista Previa
          </button>
          {deliverable.content && (
            <button
              onClick={() => setTab('raw')}
              className={`px-4 py-3 text-body-md font-medium border-b-2 transition-colors ${
                tab === 'raw'
                  ? 'border-primary text-primary bg-surface'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Código Fuente
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 min-h-[300px] bg-surface">
          {tab === 'preview' ? (
            <PreviewContent deliverable={deliverable} />
          ) : (
            <RawContent deliverable={deliverable} />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/20 bg-surface-container-low">
          <div className="flex items-center gap-2 text-body-md text-on-surface-variant">
            {deliverable.client_delivered ? (
              <span className="flex items-center gap-1 text-tertiary">
                <FileCheck className="w-4 h-4" /> Entregado al cliente
              </span>
            ) : (
              <span className={`px-2 py-1 rounded text-caption font-medium ${
                deliverable.status === 'completed' ? 'badge-success' :
                deliverable.status === 'approved' ? 'badge-info' :
                'badge-warning'
              }`}>
                {deliverable.status === 'completed' ? 'Completado' :
                 deliverable.status === 'approved' ? 'Aprobado' : 'Por revisar'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {deliverable.file_url && (
              <a
                href={deliverable.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center gap-2 text-body-md"
              >
                <Download className="w-4 h-4" /> Descargar
              </a>
            )}
            {!deliverable.client_delivered && deliverable.status === 'approved' && onDeliver && (
              <button
                onClick={() => onDeliver(deliverable.id)}
                className="btn-primary flex items-center gap-2 text-body-md"
              >
                <ExternalLink className="w-4 h-4" /> Entregar al Cliente
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewContent({ deliverable }) {
  const type = deliverable.deliverable_type || deliverable.type || 'text'

  switch (type) {
    case 'html':
      return (
        <div className="border border-outline-variant/20 rounded-lg overflow-hidden bg-surface">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-high border-b border-outline-variant/20 text-body-md text-on-surface-variant">
            <Globe className="w-4 h-4" /> Vista previa de página web
          </div>
          <iframe
            srcDoc={deliverable.content}
            className="w-full h-[500px] border-0"
            title="Preview"
            sandbox="allow-scripts"
          />
        </div>
      )

    case 'image':
      return (
        <div className="flex items-center justify-center bg-surface-container-high rounded-xl p-4 min-h-[300px]">
          {deliverable.file_url ? (
            <img
              src={deliverable.file_url}
              alt={deliverable.name}
              className="max-w-full max-h-[500px] rounded-xl"
            />
          ) : (
            <div className="text-center text-on-surface-variant">
              <ImageIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p>Vista previa de imagen</p>
              <p className="text-body-md">URL: {deliverable.content}</p>
            </div>
          )}
        </div>
      )

    case 'code':
      return (
        <div className="border border-outline-variant/20 rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-high text-on-surface text-body-md font-mono border-b border-outline-variant/20">
            <Code2 className="w-4 h-4" /> {deliverable.language || 'Código'}
          </div>
          <pre className="p-4 bg-surface overflow-auto max-h-[400px] text-body-md text-on-surface">
            <code>{deliverable.content}</code>
          </pre>
        </div>
      )

    case 'text':
    default:
      return (
        <div>
          {deliverable.content ? (
            <div className="whitespace-pre-wrap text-on-surface leading-relaxed text-body-md">
              {deliverable.content}
            </div>
          ) : (
            <div className="text-center text-on-surface-variant py-12">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Sin contenido disponible</p>
            </div>
          )}
        </div>
      )
  }
}

function RawContent({ deliverable }) {
  return (
    <pre className="p-4 bg-surface-container-high text-on-surface rounded-xl overflow-auto max-h-[400px] text-body-md font-mono border border-outline-variant/20">
      <code>{typeof deliverable.content === 'string' ? deliverable.content : JSON.stringify(deliverable.content, null, 2)}</code>
    </pre>
  )
}
