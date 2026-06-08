import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { fetchDashboardStats, createDemoRequest } from '../services/api'
import {
  ClipboardList, PlusCircle, Bot, CheckCircle2,
  Clock, AlertCircle, Loader2, ArrowRight, TrendingUp,
  FileText, Sparkles, Zap, Activity, BarChart3,
  Globe, MessageSquare, Play, ExternalLink
} from 'lucide-react'
import { STATUS_LABELS, STATUS_COLORS } from '../utils/constants'
import AGENTS_HIERARCHY from '../utils/agents'

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

function MetricCard({ label, value, sublabel, icon: Icon, color, bg, trend }) {
  return (
    <div className="card p-5 flex items-center gap-4 group hover:translate-y-[-2px] transition-all duration-300">
      <div className={`p-3.5 rounded-2xl ${bg} shadow-sm`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
      {trend && (
        <div className="ml-auto text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          {trend}
        </div>
      )}
    </div>
  )
}

function DemoButton() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleDemo = async () => {
    setLoading(true)
    try {
      const result = await createDemoRequest()
      if (result.success) {
        navigate(`/solicitud/${result.requestId}`)
      }
    } catch (err) {
      console.error('Demo error:', err)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleDemo}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm
                 text-white bg-gradient-to-r from-emerald-600 to-emerald-500
                 hover:from-emerald-700 hover:to-emerald-600
                 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30
                 active:scale-[0.97] transition-all duration-200
                 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
      {loading ? 'Creando demo...' : 'Demo Rápida ⚡'}
    </button>
  )
}

function StatBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-700 w-8 text-right">{count}</span>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { requests, loading } = useApp()
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats().then(r => {
      if (r.success) setStats(r.stats)
      setStatsLoading(false)
    }).catch(() => setStatsLoading(false))
  }, [])

  const reqStats = useMemo(() => {
    const total = requests.length
    const inProgress = requests.filter(r => r.status === 'in_progress').length
    const pending = requests.filter(r => r.status === 'pending' || r.status === 'review').length
    const completed = requests.filter(r => r.status === 'completed').length
    const quoting = requests.filter(r => r.status === 'quoting' || r.status === 'quote_sent').length
    return { total, inProgress, pending, completed, quoting }
  }, [requests])

  const computing = loading || statsLoading

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-muted mt-0.5">Bienvenido a Agency MX — Tu agencia virtual de marketing con IA</p>
        </div>
        <div className="flex items-center gap-3">
          <DemoButton />
          <Link to="/nueva-solicitud" className="btn-primary">
            <PlusCircle className="w-4 h-4" />
            Nueva Solicitud
          </Link>
        </div>
      </div>

      {computing ? (
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center gap-3 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Cargando métricas...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Row 1: Core metrics */}
          <div className="grid grid-cols-4 gap-4">
            <MetricCard label="Solicitudes" value={reqStats.total} icon={ClipboardList} color="text-agency-600" bg="bg-agency-50" />
            <MetricCard label="En Progreso" value={reqStats.inProgress} icon={Clock} color="text-amber-600" bg="bg-amber-50" />
            <MetricCard label="Por Revisar" value={reqStats.pending + reqStats.quoting} icon={AlertCircle} color="text-purple-600" bg="bg-purple-50" />
            <MetricCard label="Completadas" value={reqStats.completed} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
          </div>

          {/* Row 2: Enterprise metrics */}
          <div className="grid grid-cols-3 gap-4">
            <MetricCard
              label="Agentes Activados"
              value={stats?.uniqueAgentsUsed ?? '—'}
              sublabel={`de ${stats?.totalAgentsAvailable ?? 112} disponibles`}
              icon={Bot}
              color="text-cyan-600"
              bg="bg-cyan-50"
            />
            <MetricCard
              label="Entregables Generados"
              value={stats?.totalDeliverables ?? '—'}
              sublabel={`${stats?.totalAgentMessages ?? 0} mensajes de agentes`}
              icon={FileText}
              color="text-violet-600"
              bg="bg-violet-50"
            />
            <MetricCard
              label="Tiempo Promedio"
              value={stats?.avgCompletionTimeMinutes ? `${stats.avgCompletionTimeMinutes}m` : '—'}
              sublabel={stats?.completedRequests > 0 ? `en ${stats.completedRequests} proyectos` : 'sin datos aún'}
              icon={Activity}
              color="text-rose-600"
              bg="bg-rose-50"
            />
          </div>

          {/* Row 3: Source breakdown + efficiency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Origen de Solicitudes</h3>
              </div>
              <div className="space-y-3">
                <StatBar label="SocialPulse" count={stats?.socialPulseCount ?? 0} total={reqStats.total || 1} color="bg-blue-500" />
                <StatBar label="Manual / Demo" count={stats?.manualCount ?? 0} total={reqStats.total || 1} color="bg-agency-500" />
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Eficiencia</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Agentes disponibles</span>
                  <span className="font-semibold text-gray-800">{stats?.totalAgentsAvailable ?? 112}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Agentes únicos usados</span>
                  <span className="font-semibold text-gray-800">{stats?.uniqueAgentsUsed ?? 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Tasa de finalización</span>
                  <span className="font-semibold text-gray-800">
                    {reqStats.total > 0 ? Math.round((reqStats.completed / reqStats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Integración SocialPulse</span>
                  <span className={`font-semibold ${stats?.socialPulseCount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    {stats?.socialPulseCount > 0 ? 'Activa' : 'Sin datos'}
                  </span>
                </div>
              </div>
            </div>
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
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    onClick={async () => {
                      const result = await createDemoRequest()
                      if (result.success) navigate(`/solicitud/${result.requestId}`)
                    }}
                    className="btn-primary"
                  >
                    <Zap className="w-4 h-4" />
                    Demo Rápida ⚡
                  </button>
                  <Link to="/nueva-solicitud" className="btn-secondary">
                    <PlusCircle className="w-4 h-4" />
                    Crear solicitud
                  </Link>
                </div>
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
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                        req.source === 'socialpulse' ? 'from-blue-50 to-blue-100' : 'from-agency-50 to-agency-100'
                      } flex items-center justify-center flex-shrink-0`}>
                        {req.source === 'socialpulse' ? (
                          <Globe className="w-5 h-5 text-blue-600" />
                        ) : (
                          <FileText className="w-5 h-5 text-agency-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{req.title}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <span>{req.client_name || 'Sin cliente'}</span>
                          <span className="text-gray-300">—</span>
                          <span>{timeAgo(req.created_at)}</span>
                          {req.source === 'socialpulse' && (
                            <span className="text-xs text-blue-500 font-medium">🌐 SocialPulse</span>
                          )}
                          {req.source === 'demo' && (
                            <span className="text-xs text-emerald-500 font-medium">⚡ Demo</span>
                          )}
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
        </>
      )}
    </div>
  )
}
