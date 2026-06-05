import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import {
  ClipboardList, PlusCircle, Bot, CheckCircle2,
  TrendingUp, Clock, AlertCircle, Loader2
} from 'lucide-react'
import { STATUS_LABELS, STATUS_COLORS } from '../utils/constants'

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${bg}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { requests, loading } = useApp()

  const stats = useMemo(() => {
    const total = requests.length
    const inProgress = requests.filter(r => r.status === 'in_progress').length
    const pending = requests.filter(r => r.status === 'pending' || r.status === 'review').length
    const completed = requests.filter(r => r.status === 'completed').length
    return [
      { label: 'Solicitudes Activas', value: total, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'En Progreso', value: inProgress, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
      { label: 'Por Revisar', value: pending, icon: AlertCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Completadas', value: completed, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    ]
  }, [requests])

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `Hace ${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `Hace ${hours}h`
    const days = Math.floor(hours / 24)
    return `Hace ${days}d`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Bienvenido a Agency MX — Tu agencia virtual</p>
        </div>
        <Link to="/nueva-solicitud" className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          Nueva Solicitud
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 text-agency-600 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            {stats.map(s => <StatCard key={s.label} {...s} />)}
          </div>

          <div className="card">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Solicitudes Recientes</h2>
            </div>
            {requests.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Bot className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">No hay solicitudes aún</p>
                <Link to="/nueva-solicitud" className="text-agency-600 hover:underline text-sm mt-2 inline-block">
                  Crear la primera solicitud
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {requests.slice(0, 10).map(req => (
                  <Link
                    key={req.id}
                    to={`/solicitud/${req.id}`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{req.title}</p>
                      <p className="text-sm text-gray-500">
                        {req.client_name || 'Sin cliente'} — {timeAgo(req.created_at)}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[req.status]}`}>
                      {STATUS_LABELS[req.status]}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
