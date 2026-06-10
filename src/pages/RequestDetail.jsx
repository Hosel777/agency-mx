import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { fetchRequest } from '../services/api'
import AgentWorkspace from '../components/workspace/AgentWorkspace'

export default function RequestDetail() {
  const { id } = useParams()
  const [req, setReq] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchRequest(id).then(({ data }) => {
      if (data) setReq(data)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!req) {
    return (
      <div className="text-center py-12 text-on-surface-variant">Solicitud no encontrada</div>
    )
  }

  return (
    <div className="space-y-3 h-full min-h-0 flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0">
        <Link to="/" className="text-sm text-on-surface-variant hover:text-primary flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <span className="text-caption text-on-surface-variant">
          {req.client_name || 'Sin cliente'} — {req.project_type} — {new Date(req.created_at).toLocaleDateString()}
        </span>
      </div>
      <AgentWorkspace request={req} />
    </div>
  )
}
