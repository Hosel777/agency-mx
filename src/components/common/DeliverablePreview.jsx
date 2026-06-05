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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-agency-50 rounded-lg">
              <Icon className="w-5 h-5 text-agency-600" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">{deliverable.name}</h2>
              <p className="text-sm text-gray-500">
                {TYPE_LABELS[type]} — por {deliverable.agent_name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 border-b bg-gray-50">
          <button
            onClick={() => setTab('preview')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === 'preview'
                ? 'border-agency-600 text-agency-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Vista Previa
          </button>
          {deliverable.content && (
            <button
              onClick={() => setTab('raw')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === 'raw'
                  ? 'border-agency-600 text-agency-700 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Código Fuente
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 min-h-[300px]">
          {tab === 'preview' ? (
            <PreviewContent deliverable={deliverable} />
          ) : (
            <RawContent deliverable={deliverable} />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {deliverable.client_delivered ? (
              <span className="flex items-center gap-1 text-green-600">
                <FileCheck className="w-4 h-4" /> Entregado al cliente
              </span>
            ) : (
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                deliverable.status === 'completed' ? 'bg-green-100 text-green-700' :
                deliverable.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
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
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" /> Descargar
              </a>
            )}
            {!deliverable.client_delivered && deliverable.status === 'approved' && onDeliver && (
              <button
                onClick={() => onDeliver(deliverable.id)}
                className="btn-primary flex items-center gap-2 text-sm"
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
        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-b text-sm text-gray-500">
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
        <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4 min-h-[300px]">
          {deliverable.file_url ? (
            <img
              src={deliverable.file_url}
              alt={deliverable.name}
              className="max-w-full max-h-[500px] rounded-lg shadow-md"
            />
          ) : (
            <div className="text-center text-gray-400">
              <ImageIcon className="w-16 h-16 mx-auto mb-2" />
              <p>Vista previa de imagen</p>
              <p className="text-sm">URL: {deliverable.content}</p>
            </div>
          )}
        </div>
      )

    case 'code':
      return (
        <div className="border rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-mono">
            <Code2 className="w-4 h-4" /> {deliverable.language || 'Código'}
          </div>
          <pre className="p-4 bg-gray-50 overflow-auto max-h-[400px] text-sm">
            <code>{deliverable.content}</code>
          </pre>
        </div>
      )

    case 'text':
    default:
      return (
        <div className="prose prose-sm max-w-none">
          {deliverable.content ? (
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {deliverable.content}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <FileText className="w-12 h-12 mx-auto mb-2" />
              <p>Sin contenido disponible</p>
            </div>
          )}
        </div>
      )
  }
}

function RawContent({ deliverable }) {
  return (
    <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-auto max-h-[400px] text-sm font-mono">
      <code>{typeof deliverable.content === 'string' ? deliverable.content : JSON.stringify(deliverable.content, null, 2)}</code>
    </pre>
  )
}
