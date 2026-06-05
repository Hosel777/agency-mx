import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { CheckCircle2, XCircle, Eye, Loader2, ExternalLink } from 'lucide-react'
import { STATUS_LABELS, STATUS_COLORS } from '../utils/constants'
import DeliverablePreview from '../components/common/DeliverablePreview'
import toast from 'react-hot-toast'

export default function Approvals() {
  const [deliverables, setDeliverables] = useState([])
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState(null)
  const [approving, setApproving] = useState(false)

  const fetchItems = async () => {
    const { data } = await supabase
      .from('deliverables')
      .select('*, client_requests!inner(title, client_name)')
      .in('status', ['completed', 'review', 'approved'])
      .order('created_at', { ascending: false })
    if (data) setDeliverables(data)
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [])

  const handleApprove = async (id) => {
    setApproving(true)
    const { error } = await supabase
      .from('deliverables')
      .update({ status: 'approved' })
      .eq('id', id)
    if (error) return toast.error('Error al aprobar')
    toast.success('Entregable aprobado')
    fetchItems()
    setApproving(false)
  }

  const handleReject = async (id) => {
    setApproving(true)
    const { error } = await supabase
      .from('deliverables')
      .update({ status: 'in_progress' })
      .eq('id', id)
    if (error) return toast.error('Error al solicitar cambios')
    toast.success('Cambios solicitados al agente')
    fetchItems()
    setApproving(false)
  }

  const handleDeliver = async (id) => {
    const { error } = await supabase
      .from('deliverables')
      .update({ client_delivered: true, client_delivered_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return toast.error('Error al entregar')
    toast.success('✅ Entregado al cliente')
    setPreview(null)
    fetchItems()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-agency-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Aprobaciones</h1>
        <p className="text-gray-500 text-sm">Revisa, aprueba y entrega los entregables de los agentes</p>
      </div>

      <div className="space-y-4">
        {deliverables.map(item => (
          <div key={item.id} className="card p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500">
                  {item.client_requests?.title || 'Sin proyecto'} — por {item.agent_name}
                  {item.client_delivered && ' — ✅ Entregado al cliente'}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[item.status]}`}>
                {STATUS_LABELS[item.status]}
              </span>
            </div>

            {item.description && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{item.description}</p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2 flex-wrap">
              {!item.client_delivered ? (
                <>
                  <button
                    onClick={() => handleApprove(item.id)}
                    disabled={approving}
                    className="btn-primary flex items-center gap-2 text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Aprobar
                  </button>
                  <button
                    onClick={() => handleReject(item.id)}
                    disabled={approving}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <XCircle className="w-4 h-4" /> Solicitar Cambios
                  </button>
                </>
              ) : (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Entregado al cliente
                </span>
              )}
              <button
                onClick={() => setPreview(item)}
                className="btn-secondary flex items-center gap-2 text-sm ml-auto"
              >
                <Eye className="w-4 h-4" /> Vista Previa
              </button>
              {item.status === 'approved' && !item.client_delivered && (
                <button
                  onClick={() => handleDeliver(item.id)}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <ExternalLink className="w-4 h-4" /> Entregar al Cliente
                </button>
              )}
            </div>
          </div>
        ))}

        {deliverables.length === 0 && (
          <div className="card p-12 text-center text-gray-400">
            No hay entregables pendientes de revisión
          </div>
        )}
      </div>

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
