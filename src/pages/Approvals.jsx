import { useState } from 'react'
import { CheckCircle2, XCircle, Eye, Download } from 'lucide-react'
import { STATUS_LABELS, STATUS_COLORS } from '../utils/constants'

const mockApprovals = [
  {
    id: 'a1',
    request: 'Landing page SaaS reservas',
    deliverable: 'Research de mercado',
    agent: 'Trend Researcher',
    status: 'review',
    summary: 'Se investigaron 15 competidores directos, 30 indirectos. Se identificaron 5 patrones clave de UX.',
    date: 'Hace 2 horas',
  },
  {
    id: 'a2',
    request: 'Landing page SaaS reservas',
    deliverable: 'Brief de marca',
    agent: 'Brand Guardian',
    status: 'review',
    summary: 'Se definió paleta de colores, tipografía, tono de voz y guía de estilo.',
    date: 'Hace 1 hora',
  },
]

export default function Approvals() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Aprobaciones</h1>
        <p className="text-gray-500 text-sm">Revisa y aprueba los entregables de los agentes</p>
      </div>

      <div className="space-y-4">
        {mockApprovals.map(item => (
          <div key={item.id} className="card p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{item.deliverable}</h3>
                <p className="text-sm text-gray-500">{item.request} — por {item.agent} — {item.date}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[item.status]}`}>
                {STATUS_LABELS[item.status]}
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{item.summary}</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button className="btn-primary flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4" /> Aprobar
              </button>
              <button className="btn-secondary flex items-center gap-2 text-sm">
                <XCircle className="w-4 h-4" /> Solicitar Cambios
              </button>
              <button className="btn-secondary flex items-center gap-2 text-sm ml-auto">
                <Eye className="w-4 h-4" /> Ver Detalle
              </button>
            </div>
          </div>
        ))}

        {mockApprovals.length === 0 && (
          <div className="card p-12 text-center text-gray-400">
            No hay entregables pendientes de aprobación
          </div>
        )}
      </div>
    </div>
  )
}
