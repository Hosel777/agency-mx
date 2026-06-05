import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Bot, FileText, CheckCircle2, XCircle,
  MessageSquare, Download, Send
} from 'lucide-react'
import { STATUS_LABELS, STATUS_COLORS } from '../utils/constants'
import AgentChat from '../components/agents/AgentChat'

const mockRequest = {
  id: '1',
  title: 'Landing page SaaS reservas',
  client: 'Cliente A',
  type: 'Landing Page',
  status: 'in_progress',
  description: 'Necesitamos una landing page moderna para un SaaS de reservas de restaurantes. Debe incluir hero, features, testimoniales, pricing y CTA.',
  budget: 5000,
  deadline: '2026-07-01',
  created_at: '2026-06-01',
}

const mockDeliverables = [
  { id: 'd1', agent: 'Trend Researcher', name: 'Research de mercado', status: 'completed' },
  { id: 'd2', agent: 'Brand Guardian', name: 'Brief de marca', status: 'completed' },
  { id: 'd3', agent: 'UI Designer', name: 'Diseño Figma', status: 'in_progress' },
  { id: 'd4', agent: 'Content Creator', name: 'Copy para landing', status: 'pending' },
  { id: 'd5', agent: 'Frontend Developer', name: 'Maquetación código', status: 'pending' },
]

export default function RequestDetail() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('overview')
  const req = mockRequest

  return (
    <div className="space-y-6">
      <div>
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2">
          <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{req.title}</h1>
            <p className="text-gray-500 text-sm">
              {req.client} — {req.type} — Creado {req.created_at}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[req.status]}`}>
            {STATUS_LABELS[req.status]}
          </span>
        </div>
      </div>

      <div className="flex gap-1 border-b">
        {[
          { id: 'overview', label: 'Resumen', icon: FileText },
          { id: 'agents', label: 'Agentes', icon: Bot },
          { id: 'chat', label: 'Conversación', icon: MessageSquare },
        ].map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tabId
                ? 'border-agency-600 text-agency-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="card p-6 space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Descripción</h3>
            <p className="text-gray-600">{req.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Presupuesto</p>
              <p className="font-semibold">${req.budget?.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Fecha límite</p>
              <p className="font-semibold">{req.deadline}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Progreso</p>
              <p className="font-semibold">40%</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Entregables</h3>
            <div className="space-y-2">
              {mockDeliverables.map(d => (
                <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {d.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : d.status === 'in_progress' ? (
                      <Bot className="w-5 h-5 text-blue-500 animate-pulse" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-300" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{d.name}</p>
                      <p className="text-xs text-gray-500">{d.agent}</p>
                    </div>
                  </div>
                  {d.status === 'completed' && (
                    <button className="text-agency-600 hover:text-agency-800 text-sm flex items-center gap-1">
                      <Download className="w-4 h-4" /> Ver
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'agents' && <AgentChat requestId={id} />}
      {activeTab === 'chat' && <AgentChat requestId={id} />}
    </div>
  )
}
