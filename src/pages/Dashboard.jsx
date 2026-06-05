import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import {
  ClipboardList, PlusCircle, Bot, CheckCircle2,
  TrendingUp, Clock, AlertCircle
} from 'lucide-react'
import { STATUS_LABELS, STATUS_COLORS } from '../utils/constants'

const stats = [
  { label: 'Solicitudes Activas', value: '3', icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'En Progreso', value: '2', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { label: 'Por Revisar', value: '1', icon: AlertCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Completadas', value: '5', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
]

const recentRequests = [
  { id: '1', title: 'Landing page SaaS reservas', client: 'Cliente A', status: 'in_progress', date: 'Hace 2 horas' },
  { id: '2', title: 'Campaña Google Ads', client: 'Cliente B', status: 'review', date: 'Hace 1 día' },
  { id: '3', title: 'Rediseño de marca', client: 'Cliente C', status: 'completed', date: 'Hace 3 días' },
]

export default function Dashboard() {
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

      <div className="grid grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${bg}`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Solicitudes Recientes</h2>
        </div>
        <div className="divide-y">
          {recentRequests.map(req => (
            <Link
              key={req.id}
              to={`/solicitud/${req.id}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-medium">{req.title}</p>
                <p className="text-sm text-gray-500">{req.client} — {req.date}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[req.status]}`}>
                {STATUS_LABELS[req.status]}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
