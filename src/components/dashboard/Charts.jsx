import { useMemo } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import { useTheme } from '../../contexts/ThemeContext'

const RADIAN = Math.PI / 180

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {(percent * 100).toFixed(0)}%
    </text>
  )
}

export function RequestsPieChart({ requests }) {
  const { theme } = useTheme()
  const data = useMemo(() => {
    const map = {}
    requests.forEach(r => {
      const s = r.status || 'unknown'
      map[s] = (map[s] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [requests])

  const COLORS = ['#c0c1ff', '#5ddcaa', '#ffb95b', '#ff8a8a', '#908fa0']

  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={CustomLabel}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{
          background: theme === 'dark' ? '#1f1f27' : '#fff',
          border: '1px solid #464554',
          borderRadius: 8,
          fontSize: 12,
        }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

const STATUS_LABELS_MAP = {
  pending: 'Pendiente',
  quoting: 'Cotizando',
  quote_sent: 'Cotizado',
  in_progress: 'En Progreso',
  completed: 'Completado',
  review: 'Revisión',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  delivered: 'Entregado',
}

export function RequestsBarChart({ requests }) {
  const { theme } = useTheme()
  const data = useMemo(() => {
    const map = {}
    requests.forEach(r => {
      const s = r.status || 'unknown'
      map[s] = (map[s] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({
      name: STATUS_LABELS_MAP[name] || name,
      value,
    }))
  }, [requests])

  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#34343d' : '#e0dff0'} />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: theme === 'dark' ? '#c7c4d7' : '#474659' }} />
        <YAxis tick={{ fontSize: 10, fill: theme === 'dark' ? '#c7c4d7' : '#474659' }} allowDecimals={false} />
        <Tooltip contentStyle={{
          background: theme === 'dark' ? '#1f1f27' : '#fff',
          border: '1px solid #464554',
          borderRadius: 8,
          fontSize: 12,
        }} />
        <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function RequestsTimelineChart({ requests }) {
  const { theme } = useTheme()
  const data = useMemo(() => {
    const map = {}
    requests.forEach(r => {
      const day = new Date(r.created_at).toLocaleDateString()
      map[day] = (map[day] || 0) + 1
    })
    return Object.entries(map).slice(-14).map(([date, count]) => ({ date, count }))
  }, [requests])

  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#34343d' : '#e0dff0'} />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: theme === 'dark' ? '#c7c4d7' : '#474659' }} />
        <YAxis tick={{ fontSize: 10, fill: theme === 'dark' ? '#c7c4d7' : '#474659' }} allowDecimals={false} />
        <Tooltip contentStyle={{
          background: theme === 'dark' ? '#1f1f27' : '#fff',
          border: '1px solid #464554',
          borderRadius: 8,
          fontSize: 12,
        }} />
        <Line type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2} dot={{ fill: 'var(--color-primary)', r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
