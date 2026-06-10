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
    <aside className="w-64 bg-surface-container border-r border-outline-variant flex flex-col flex-shrink-0 shadow-sidebar">
      <div className="px-4 py-6">
        <h1 className="font-h2 text-h2 font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary leading-tight">Agency MX</h1>
        <p className="text-label-sm font-label-sm text-on-surface-variant opacity-60 uppercase tracking-widest mt-1">Enterprise AI Marketing</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-md transition-all duration-150 ${
                isActive
                  ? 'text-primary font-bold border-r-2 border-primary bg-surface-container-high'
                  : 'text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-surface-container-high'
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span>{label}</span>
            {to === '/aprobaciones' && (
              <span className="ml-auto w-2 h-2 rounded-full bg-secondary animate-pulse-slow" />
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-4 py-4 border-t border-outline-variant/20">
        <button className="w-full bg-primary-container text-on-primary-container py-2.5 rounded-xl font-label-md text-label-md font-bold mb-3 flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all">
          <Sparkles className="w-4 h-4" />
          New Campaign
        </button>
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-lg bg-surface-variant flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-caption font-caption text-on-surface-variant">v2.0 — IA Agency</p>
            <p className="text-[10px] text-outline">{AGENTS_HIERARCHY.totalAgentes} agentes activos</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
