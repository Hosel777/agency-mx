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
  const [tab, setTab] = useState('all')

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

  const filtered = tab === 'all' ? deliverables : deliverables.filter(d => d.status === tab)

  const typeIcons = { text: FileText, html: ExternalLink, image: Eye, code: FileText, file: FileText }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface">Review Deliverables</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
            Review and approve AI-generated creative assets. Maintain brand consistency before final deployment.
          </p>
        </div>
        <div className="flex items-center p-1 bg-surface-container-low rounded-xl border border-outline-variant/30">
          {['all', 'completed', 'approved', 'rejected'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-6 py-2 rounded-lg font-label-md text-label-md transition-all ${tab === t ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}
            >{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {filtered.map((item, i) => {
          const TypeIcon = typeIcons[item.deliverable_type] || FileText
          return (
            <div key={item.id} className="glass-card bg-surface-container-low rounded-xl hover:border-primary/30 transition-all duration-300 hover:shadow-md hover:-translate-y-1 p-6 group" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center text-primary">
                    <TypeIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-h3 text-h3 text-on-surface">{item.agent_name}</h3>
                    <p className="text-caption text-on-surface-variant">{item.client_requests?.title || 'Sin proyecto'}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-label-sm font-label-sm ${STATUS_COLORS[item.status]}`}>
                  {STATUS_LABELS[item.status]}
                </span>
              </div>

              <p className="text-body-md text-on-surface-variant mb-6 leading-relaxed line-clamp-3">
                {item.description || item.content?.substring(0, 200) || 'Sin descripción'}
              </p>

              <div className="flex items-center gap-2 pt-4 border-t border-outline-variant/20">
                {!item.client_delivered ? (
                  <>
                    <button onClick={() => handleApprove(item.id)} disabled={approving} className="flex-1 py-2.5 rounded-lg font-label-md text-label-md bg-secondary-container text-on-secondary-container hover:brightness-110 active:scale-95 transition-all">
                      <CheckCircle2 className="w-4 h-4 inline mr-1.5" /> Approve
                    </button>
                    <button onClick={() => handleReject(item.id)} disabled={approving} className="flex-1 py-2.5 rounded-lg font-label-md text-label-md border border-error/50 text-error hover:bg-error/10 active:scale-95 transition-all">
                      <XCircle className="w-4 h-4 inline mr-1.5" /> Reject
                    </button>
                  </>
                ) : (
                  <span className="flex-1 py-2.5 rounded-lg text-center text-label-md text-secondary font-medium bg-secondary/10">
                    <CheckCircle2 className="w-4 h-4 inline mr-1.5" /> Entregado al cliente
                  </span>
                )}
                <button onClick={() => setPreview(item)} className="p-2.5 rounded-lg border border-outline-variant/50 text-on-surface-variant hover:bg-surface-container-high transition-all">
                  <Eye className="w-5 h-5" />
                </button>
                {item.status === 'approved' && !item.client_delivered && (
                  <button onClick={() => handleDeliver(item.id)} className="p-2.5 rounded-lg bg-secondary-container text-on-secondary-container hover:brightness-110 active:scale-95 transition-all">
                    <ExternalLink className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="col-span-2 glass-card rounded-2xl p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-variant flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-on-surface-variant" />
            </div>
            <p className="font-medium text-on-surface-variant">No hay entregables pendientes</p>
            <p className="text-caption text-on-surface-variant mt-1">Los entregables aparecerán aquí cuando los agentes terminen</p>
          </div>
        )}
      </div>

      {preview && (
        <DeliverablePreview deliverable={preview} onClose={() => setPreview(null)} onDeliver={handleDeliver} />
      )}
    </div>
  )
}
