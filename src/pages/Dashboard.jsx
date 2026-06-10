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

function StatCard({ label, value, icon: Icon, color, bg, gradient }) {
  return (
    <div className="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300 group cursor-default">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-secondary text-label-sm font-label-sm flex items-center gap-1 opacity-80">
          <TrendingUp className="w-3 h-3" /> online
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">{label}</p>
        <p className="text-[32px] font-bold text-on-surface">{value}</p>
      </div>
    </div>
  )
}

function MetricCard({ label, value, sublabel, icon: Icon, color, bg, trend }) {
  return (
    <div className="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300 group cursor-default">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && <span className={`text-label-sm font-label-sm flex items-center gap-1 ${trend.color}`}>{trend.label}</span>}
      </div>
      <div className="space-y-1">
        <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">{label}</p>
        <p className="text-[32px] font-bold text-on-surface">{value ?? '—'}</p>
        {sublabel && <p className="text-caption text-on-surface-variant mt-1">{sublabel}</p>}
      </div>
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
      className="bg-surface-container-high border border-dashed border-outline-variant text-on-surface-variant px-6 py-2.5 rounded-xl font-label-md text-label-md hover:border-primary hover:text-primary transition-all active:scale-95"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : <Zap className="w-4 h-4 inline mr-2" />}
      {loading ? 'Creando demo...' : 'Demo Rápida ⚡'}
    </button>
  )
}

function StatBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-caption text-on-surface-variant w-28 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-surface-variant overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-label-sm font-label-sm text-on-surface w-8 text-right">{count}</span>
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
    <div className="space-y-gutter animate-fade-in relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface">Enterprise Overview</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">AI-driven marketing performance for the current billing cycle.</p>
        </div>
        <div className="flex items-center gap-3">
          <DemoButton />
          <Link to="/nueva-solicitud" className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-label-md text-label-md shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-95 flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Nueva Solicitud
          </Link>
        </div>
      </div>

      {computing ? (
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center gap-3 text-on-surface-variant">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-body-md">Cargando métricas...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Row 1: Core metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            <StatCard label="Solicitudes" value={reqStats.total} icon={ClipboardList} color="text-primary" bg="bg-primary/10" />
            <StatCard label="En Progreso" value={reqStats.inProgress} icon={Clock} color="text-tertiary" bg="bg-tertiary/10" />
            <StatCard label="Por Revisar" value={reqStats.pending + reqStats.quoting} icon={AlertCircle} color="text-secondary" bg="bg-secondary/10" />
            <StatCard label="Completadas" value={reqStats.completed} icon={CheckCircle2} color="text-secondary-container" bg="bg-secondary-container/10" />
          </div>

          {/* Row 2: Enterprise metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <MetricCard
              label="Agentes Activados"
              value={stats?.uniqueAgentsUsed ?? '—'}
              sublabel={`de ${stats?.totalAgentsAvailable ?? 112} disponibles`}
              icon={Bot}
              color="text-primary-container"
              bg="bg-primary-container/10"
            />
            <MetricCard
              label="Entregables Generados"
              value={stats?.totalDeliverables ?? '—'}
              sublabel={`${stats?.totalAgentMessages ?? 0} mensajes de agentes`}
              icon={FileText}
              color="text-secondary"
              bg="bg-secondary/10"
            />
            <MetricCard
              label="Tiempo Promedio"
              value={stats?.avgCompletionTimeMinutes ? `${stats.avgCompletionTimeMinutes}m` : '—'}
              sublabel={stats?.completedRequests > 0 ? `en ${stats.completedRequests} proyectos` : 'sin datos aún'}
              icon={Activity}
              color="text-tertiary"
              bg="bg-tertiary/10"
            />
          </div>

          {/* Row 3: Source breakdown + efficiency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="font-h3 text-h3 text-on-surface">Origen de Solicitudes</h3>
              </div>
              <div className="space-y-3">
                <StatBar label="SocialPulse" count={stats?.socialPulseCount ?? 0} total={reqStats.total || 1} color="bg-primary" />
                <StatBar label="Manual / Demo" count={stats?.manualCount ?? 0} total={reqStats.total || 1} color="bg-secondary" />
              </div>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-h3 text-h3 text-on-surface">Eficiencia</h3>
              </div>
              <div className="space-y-3">
                {[
                  ['Agentes disponibles', stats?.totalAgentsAvailable ?? 112],
                  ['Agentes únicos usados', stats?.uniqueAgentsUsed ?? 0],
                  ['Tasa de finalización', reqStats.total > 0 ? `${Math.round((reqStats.completed / reqStats.total) * 100)}%` : '0%'],
                  ['Integración SocialPulse', stats?.socialPulseCount > 0 ? 'Activa' : 'Sin datos'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-body-md text-on-surface-variant">{label}</span>
                    <span className={`font-semibold text-body-md ${typeof value === 'string' && value === 'Sin datos' ? 'text-outline' : 'text-on-surface'}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Requests */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between">
              <h3 className="font-h3 text-h3 text-on-surface">Solicitudes Recientes</h3>
              {requests.length > 0 && (
                <span className="text-caption text-on-surface-variant">{requests.length} total</span>
              )}
            </div>

            {requests.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface-variant flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-on-surface-variant" />
                </div>
                <p className="font-medium text-on-surface-variant">No hay solicitudes aún</p>
                <p className="text-caption text-on-surface-variant mt-1">Crea tu primer proyecto para empezar</p>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    onClick={async () => {
                      const result = await createDemoRequest()
                      if (result.success) navigate(`/solicitud/${result.requestId}`)
                    }}
                    className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-md text-label-md shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
                  >
                    <Zap className="w-4 h-4 inline mr-2" />
                    Demo Rápida ⚡
                  </button>
                  <Link to="/nueva-solicitud" className="bg-surface-container-high border border-dashed border-outline-variant text-on-surface-variant px-5 py-2.5 rounded-xl font-label-md text-label-md inline-flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Crear solicitud
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/10">
                {requests.slice(0, 10).map((req, i) => (
                  <Link
                    key={req.id}
                    to={`/solicitud/${req.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-surface-bright/50 transition-colors group"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        req.source === 'socialpulse' ? 'bg-primary/10 text-primary' : 'bg-surface-variant text-on-surface-variant'
                      }`}>
                        {req.source === 'socialpulse' ? <Globe className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-body-md font-medium text-on-surface truncate">{req.title}</p>
                        <p className="text-caption text-on-surface-variant flex items-center gap-2">
                          <span>{req.client_name || 'Sin cliente'}</span>
                          <span className="opacity-30">—</span>
                          <span>{timeAgo(req.created_at)}</span>
                          {req.source === 'socialpulse' && <span className="text-primary text-label-sm">🌐 SocialPulse</span>}
                          {req.source === 'demo' && <span className="text-secondary text-label-sm">⚡ Demo</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-label-sm font-label-sm ${STATUS_COLORS[req.status]}`}>
                        {STATUS_LABELS[req.status]}
                      </span>
                      <ArrowRight className="w-4 h-4 text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
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
