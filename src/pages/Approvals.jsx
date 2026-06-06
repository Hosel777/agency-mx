import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { CheckCircle2, XCircle, Eye, Loader2, ExternalLink, FileCheck, Bot, FileText } from 'lucide-react'
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
    const { error } = await supabase.from('deliverables').update({ status: 'approved' }).eq('id', id)
    if (error) return toast.error('Error al aprobar')
    toast.success('Entregable aprobado')
    fetchItems()
    setApproving(false)
  }

  const handleReject = async (id) => {
    setApproving(true)
    const { error } = await supabase.from('deliverables').update({ status: 'in_progress' }).eq('id', id)
    if (error) return toast.error('Error al solicitar cambios')
    toast.success('Cambios solicitados al agente')
    fetchItems()
    setApproving(false)
  }

  const handleDeliver = async (id) => {
    const { error } = await supabase.from('deliverables').update({ client_delivered: true, client_delivered_at: new Date().toISOString() }).eq('id', id)
    if (error) return toast.error('Error al entregar')
    toast.success('✅ Entregado al cliente')
    setPreview(null)
    fetchItems()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 text-agency-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Aprobaciones</h1>
          <p className="text-muted mt-0.5">Revisa, aprueba y entrega los entregables de los agentes</p>
        </div>
        {deliverables.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-xl border shadow-sm">
            <FileCheck className="w-4 h-4" />
            {deliverables.length} pendientes
          </div>
        )}
      </div>

      <div className="space-y-3">
        {deliverables.map((item, i) => (
          <div key={item.id} className="card p-6 space-y-4 hover:translate-y-[-1px] transition-all duration-200" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-agency-50 to-agency-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="w-5 h-5 text-agency-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {item.client_requests?.title || 'Sin proyecto'} — por <span className="font-medium text-gray-700">{item.agent_name}</span>
                    {item.client_delivered && <span className="ml-2 text-emerald-600 font-medium">✅ Entregado al cliente</span>}
                  </p>
                </div>
              </div>
              <span className={STATUS_COLORS[item.status]}>{STATUS_LABELS[item.status]}</span>
            </div>

            {item.description && (
              <div className="ml-14 p-4 bg-surface-secondary rounded-xl border border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1 flex-wrap ml-14">
              {!item.client_delivered ? (
                <>
                  <button onClick={() => handleApprove(item.id)} disabled={approving} className="btn-primary text-xs px-4 py-2">
                    <CheckCircle2 className="w-4 h-4" /> Aprobar
                  </button>
                  <button onClick={() => handleReject(item.id)} disabled={approving} className="btn-secondary text-xs px-4 py-2">
                    <XCircle className="w-4 h-4" /> Solicitar Cambios
                  </button>
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" /> Entregado al cliente
                </span>
              )}
              <button onClick={() => setPreview(item)} className="btn-ghost text-xs">
                <Eye className="w-4 h-4" /> Vista Previa
              </button>
              {item.status === 'approved' && !item.client_delivered && (
                <button onClick={() => handleDeliver(item.id)} className="btn-primary text-xs px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-emerald-500/25 hover:from-emerald-700 hover:to-emerald-600">
                  <ExternalLink className="w-4 h-4" /> Entregar al Cliente
                </button>
              )}
            </div>
          </div>
        ))}

        {deliverables.length === 0 && (
          <div className="card p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No hay entregables pendientes</p>
            <p className="text-sm text-gray-400 mt-1">Los entregables aparecerán aquí cuando los agentes terminen</p>
          </div>
        )}
      </div>

      {preview && (
        <DeliverablePreview deliverable={preview} onClose={() => setPreview(null)} onDeliver={handleDeliver} />
      )}
    </div>
  )
}
