import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Bot, FileText, CheckCircle2, XCircle,
  MessageSquare, Eye, Loader2
} from 'lucide-react'
import { STATUS_LABELS, STATUS_COLORS } from '../utils/constants'
import { supabase } from '../services/supabase'
import { fetchRequest, fetchDeliverables, fetchAgentMessages, updateRequestStatus } from '../services/api'
import AgentChat from '../components/agents/AgentChat'
import DeliverablePreview from '../components/common/DeliverablePreview'

export default function RequestDetail() {
  const { id } = useParams()
  const [req, setReq] = useState(null)
  const [deliverables, setDeliverables] = useState([])
  const [messages, setMessages] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState(null)
  const [delivering, setDelivering] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      fetchRequest(id),
      fetchDeliverables(id),
      fetchAgentMessages(id),
    ]).then(([reqRes, delRes, msgRes]) => {
      if (reqRes.data) setReq(reqRes.data)
      if (delRes.data) setDeliverables(delRes.data)
      if (msgRes.data) setMessages(msgRes.data)
      setLoading(false)
    })
  }, [id])

  const handleDeliver = async (deliverableId) => {
    setDelivering(true)
    const { error } = await supabase
      .from('deliverables')
      .update({ client_delivered: true, client_delivered_at: new Date().toISOString() })
      .eq('id', deliverableId)
    if (!error) {
      setDeliverables(prev => prev.map(d =>
        d.id === deliverableId ? { ...d, client_delivered: true, client_delivered_at: new Date().toISOString() } : d
      ))
      setPreview(null)
    }
    setDelivering(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-agency-600 animate-spin" />
      </div>
    )
  }

  if (!req) {
    return (
      <div className="text-center py-12 text-gray-400">
        Solicitud no encontrada
      </div>
    )
  }

  const progress = deliverables.length > 0
    ? Math.round((deliverables.filter(d => d.status === 'completed' || d.status === 'approved').length / deliverables.length) * 100)
    : 0

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
              {req.client_name || 'Cliente'} — {req.project_type} — Creado {new Date(req.created_at).toLocaleDateString()}
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
              <p className="font-semibold">{req.budget ? `$${Number(req.budget).toLocaleString()}` : 'No definido'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Fecha límite</p>
              <p className="font-semibold">{req.deadline ? new Date(req.deadline).toLocaleDateString() : 'No definida'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Progreso</p>
              <p className="font-semibold">{progress}%</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Entregables</h3>
            {deliverables.length === 0 ? (
              <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
                <Bot className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Los agentes aún no han generado entregables</p>
              </div>
            ) : (
              <div className="space-y-2">
                {deliverables.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      {d.status === 'completed' || d.status === 'approved' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : d.status === 'in_progress' ? (
                        <Bot className="w-5 h-5 text-blue-500 animate-pulse" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-300" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{d.name}</p>
                        <p className="text-xs text-gray-500">{d.agent_name} {d.client_delivered && '— ✅ Entregado al cliente'}</p>
                      </div>
                    </div>
                    {(d.status === 'completed' || d.status === 'approved') && (
                      <button
                        onClick={() => setPreview(d)}
                        className="text-agency-600 hover:text-agency-800 text-sm flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" /> Vista Previa
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'agents' && <AgentChat requestId={id} messages={messages} />}
      {activeTab === 'chat' && <AgentChat requestId={id} messages={messages} />}

      {preview && (
        <DeliverablePreview
          deliverable={preview}
          onClose={() => setPreview(null)}
          onDeliver={handleDeliver}
        />
      )}
    </div>
  )
}
