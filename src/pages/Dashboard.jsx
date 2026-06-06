import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import {
  ClipboardList, PlusCircle, Bot, CheckCircle2,
  Clock, AlertCircle, Loader2, ArrowRight, TrendingUp,
  FileText
} from 'lucide-react'
import { STATUS_LABELS, STATUS_COLORS } from '../utils/constants'

function StatCard({ label, value, icon: Icon, color, bg, gradient }) {
  return (
    <div className="card p-5 flex items-center gap-4 group hover:translate-y-[-2px] transition-all duration-300">
      <div className={`p-3.5 rounded-2xl ${bg} ${gradient || ''} shadow-sm`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  )
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `Hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `Hace ${days}d`
}

export default function Dashboard() {
  const { requests, loading } = useApp()

  const stats = useMemo(() => {
    const total = requests.length
    const inProgress = requests.filter(r => r.status === 'in_progress').length
    const pending = requests.filter(r => r.status === 'pending' || r.status === 'review').length
    const completed = requests.filter(r => r.status === 'completed').length
    return [
      { label: 'Solicitudes', value: total, icon: ClipboardList, color: 'text-agency-600', bg: 'bg-agency-50', gradient: 'from-agency-50 to-agency-100/50' },
      { label: 'En Progreso', value: inProgress, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-50 to-amber-100/50' },
      { label: 'Por Revisar', value: pending, icon: AlertCircle, color: 'text-purple-600', bg: 'bg-purple-50', gradient: 'from-purple-50 to-purple-100/50' },
      { label: 'Completadas', value: completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-50 to-emerald-100/50' },
    ]
  }, [requests])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-muted mt-0.5">Bienvenido a Agency MX — Tu agencia virtual</p>
        </div>
        <Link to="/nueva-solicitud" className="btn-primary">
          <PlusCircle className="w-4 h-4" />
          Nueva Solicitud
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center gap-3 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Cargando...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {stats.map(s => <StatCard key={s.label} {...s} />)}
          </div>

          {/* Recent Requests */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="section-title">Solicitudes Recientes</h2>
              {requests.length > 0 && (
                <span className="text-xs text-gray-400 font-medium">{requests.length} total</span>
              )}
            </div>

            {requests.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No hay solicitudes aún</p>
                <p className="text-sm text-gray-400 mt-1">Crea tu primer proyecto para empezar</p>
                <Link to="/nueva-solicitud" className="btn-primary mt-4 inline-flex">
                  <PlusCircle className="w-4 h-4" />
                  Crear primera solicitud
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {requests.slice(0, 10).map((req, i) => (
                  <Link
                    key={req.id}
                    to={`/solicitud/${req.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/80 transition-colors group"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-agency-50 to-agency-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-agency-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{req.title}</p>
                        <p className="text-sm text-gray-500">
                          {req.client_name || 'Sin cliente'} — {timeAgo(req.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[req.status]}`}>
                        {STATUS_LABELS[req.status]}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-agency-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Bottom section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-agency-50 to-agency-100">
                  <TrendingUp className="w-5 h-5 text-agency-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Actividad Reciente</h3>
              </div>
              <p className="text-sm text-gray-500">
                {requests.length > 0
                  ? `${requests.filter(r => r.status === 'completed').length} proyectos completados de ${requests.length} totales`
                  : 'Esperando tu primer proyecto'}
              </p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100">
                  <Bot className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Agentes Disponibles</h3>
              </div>
              <p className="text-sm text-gray-500">41 agentes de IA listos para trabajar en tu próximo proyecto</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
