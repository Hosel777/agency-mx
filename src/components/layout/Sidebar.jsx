import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, PlusCircle, Bot,
  CheckCircle2, Settings, Sparkles
} from 'lucide-react'
import AGENTS_HIERARCHY from '../../utils/agents'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/nueva-solicitud', icon: PlusCircle, label: 'Nueva Solicitud' },
  { to: '/agentes', icon: Bot, label: 'Agentes' },
  { to: '/aprobaciones', icon: CheckCircle2, label: 'Aprobaciones' },
  { to: '/configuracion', icon: Settings, label: 'Configuración' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex flex-col flex-shrink-0 shadow-sidebar">
      {/* Logo */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-agency-400 to-agency-600 flex items-center justify-center shadow-lg shadow-agency-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Agency MX</h1>
            <p className="text-[11px] text-gray-500 font-medium tracking-wide">Marketing con IA</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span>{label}</span>
            {to === '/aprobaciones' && (
              <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-pulse-slow" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-agency-400/20 to-agency-600/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-agency-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-400 truncate">v2.0 — IA Agency</p>
            <p className="text-[10px] text-gray-600">{AGENTS_HIERARCHY.totalAgentes} agentes activos</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
