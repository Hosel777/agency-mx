import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ClipboardList, PlusCircle, Bot,
  CheckCircle2, Settings, ChevronRight
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/nueva-solicitud', icon: PlusCircle, label: 'Nueva Solicitud' },
  { to: '/agentes', icon: Bot, label: 'Agentes' },
  { to: '/aprobaciones', icon: CheckCircle2, label: 'Aprobaciones' },
  { to: '/configuracion', icon: Settings, label: 'Configuración' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r flex flex-col">
      <div className="p-5 border-b">
        <h1 className="text-xl font-bold text-agency-700 flex items-center gap-2">
          <Bot className="w-6 h-6" />
          Agency MX
        </h1>
        <p className="text-xs text-gray-500 mt-1">Agencia de Marketing con IA</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-agency-50 text-agency-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
            <ChevronRight className="w-4 h-4 ml-auto opacity-40" />
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t text-xs text-gray-400">
        v1.0.0 — Agency MX
      </div>
    </aside>
  )
}
