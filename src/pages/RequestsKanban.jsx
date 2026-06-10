import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useApp } from '../contexts/AppContext'
import toast from 'react-hot-toast'
import {
  Clock, CheckCircle2, Loader2, AlertCircle,
  FileText, Globe, ArrowRight, PlusCircle, Sparkles,
} from 'lucide-react'

const COLUMNS = [
  { key: 'pending', label: 'Pendiente', icon: Clock, color: 'text-tertiary', bg: 'bg-tertiary/10', border: 'border-tertiary/30' },
  { key: 'quoting', label: 'Cotizando', icon: Loader2, color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/30' },
  { key: 'quote_sent', label: 'Cotizado', icon: FileText, color: 'text-primary-container', bg: 'bg-primary-container/10', border: 'border-primary-container/30' },
  { key: 'in_progress', label: 'En Progreso', icon: AlertCircle, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
  { key: 'completed', label: 'Completado', icon: CheckCircle2, color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/30' },
]

export default function RequestsKanban() {
  const { requests, loading, fetchRequests } = useApp()
  const [dragging, setDragging] = useState(null)
  const [dragOver, setDragOver] = useState(null)

  const grouped = useMemo(() => {
    const map = {}
    COLUMNS.forEach(c => { map[c.key] = [] })
    requests.forEach(r => {
      if (map[r.status]) map[r.status].push(r)
      else map['pending'].push(r)
    })
    return map
  }, [requests])

  const handleDragStart = useCallback((req) => {
    setDragging(req)
  }, [])

  const handleDrop = useCallback(async (targetStatus) => {
    if (!dragging || dragging.status === targetStatus) {
      setDragging(null)
      setDragOver(null)
      return
    }
    try {
      const { error } = await supabase
        .from('client_requests')
        .update({ status: targetStatus })
        .eq('id', dragging.id)
      if (error) throw error
      toast.success(`Movido a ${COLUMNS.find(c => c.key === targetStatus)?.label || targetStatus}`)
      fetchRequests()
    } catch (err) {
      toast.error('Error al mover solicitud')
    }
    setDragging(null)
    setDragOver(null)
  }, [dragging, fetchRequests])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-gutter animate-fade-in relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface">Kanban</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Arrastra solicitudes entre columnas para cambiar su estado</p>
        </div>
        <Link to="/nueva-solicitud" className="btn-primary text-caption">
          <PlusCircle className="w-4 h-4" /> Nueva
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {COLUMNS.map(col => {
          const items = grouped[col.key] || []
          const Icon = col.icon
          return (
          <div
            key={col.key}
            className={`glass-card rounded-2xl overflow-hidden flex flex-col transition-all ${dragOver === col.key ? 'ring-2 ring-primary/50 scale-[1.01]' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(col.key) }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => handleDrop(col.key)}
          >
            <div className={`flex items-center gap-2 px-4 py-3 border-b ${col.border} ${col.bg}`}>
              <Icon className={`w-4 h-4 ${col.color}`} />
              <span className={`font-semibold text-label-sm ${col.color}`}>{col.label}</span>
              <span className={`ml-auto text-caption ${col.color}`}>{items.length}</span>
            </div>
            <div className="flex-1 p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-280px)] overflow-auto">
              {items.length === 0 ? (
                <div className="p-4 text-center text-caption text-on-surface-variant">Sin solicitudes</div>
              ) : (
                items.map(req => (
                  <Link
                    key={req.id}
                    to={`/solicitud/${req.id}`}
                    draggable
                    onDragStart={() => handleDragStart(req)}
                    className={`block p-3 rounded-xl border transition-all group ${
                      dragging?.id === req.id
                        ? 'opacity-50 scale-95 bg-primary/10 border-primary/30'
                        : 'bg-surface-container-low hover:bg-surface-container-hover border-outline-variant/20 hover:-translate-y-0.5'
                    }`}
                  >
                    <p className="text-body-md font-medium text-on-surface truncate">{req.title}</p>
                    <div className="flex items-center gap-2 mt-2 text-caption text-on-surface-variant">
                      <span>{req.client_name || 'Sin cliente'}</span>
                      <span className="opacity-30">·</span>
                      <span>{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                    {req.budget && (
                      <p className="text-caption text-on-surface-variant mt-1">${req.budget} MXN</p>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-caption text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Ver detalle</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}
