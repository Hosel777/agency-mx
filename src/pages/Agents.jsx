import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import AGENTS_HIERARCHY from '../utils/agents'
import { Bot, ChevronDown, ChevronRight, Loader2, Users, Sparkles } from 'lucide-react'

const DEPT_ORDER = [
  'Estrategia & Research',
  'Producto & Diseño',
  'Marketing & Contenido',
  'Paid Media',
  'Ingeniería',
  'Testing & QA',
  'Ventas & CRM',
  'Finanzas & Legal',
  'Soporte & Operaciones',
]

const DEPT_ICONS = {
  'Estrategia & Research': '🎯',
  'Producto & Diseño': '🎨',
  'Marketing & Contenido': '📱',
  'Paid Media': '📊',
  'Ingeniería': '⚙️',
  'Testing & QA': '✅',
  'Ventas & CRM': '🤝',
  'Finanzas & Legal': '💰',
  'Soporte & Operaciones': '🛟',
}

export default function Agents() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedDept, setExpandedDept] = useState('Estrategia & Research')

  useEffect(() => {
    supabase
      .from('agents')
      .select('*')
      .order('level', { ascending: true })
      .then(({ data, error }) => {
        if (data && data.length > 0) {
          setAgents(data)
        } else {
          const flat = AGENTS_HIERARCHY.departments.flatMap(dept =>
            dept.agents.map(a => ({
              id: a.id, name: a.name, role: a.role,
              department: dept.name, level: dept.level,
              description: null, is_active: true,
            }))
          )
          flat.unshift({
            id: AGENTS_HIERARCHY.orchestrator.id,
            name: AGENTS_HIERARCHY.orchestrator.name,
            role: AGENTS_HIERARCHY.orchestrator.role,
            department: 'Gerencia', level: 1,
            description: AGENTS_HIERARCHY.orchestrator.description,
            is_active: true,
          })
          setAgents(flat)
        }
        setLoading(false)
      })
  }, [])

  const grouped = {}
  agents.forEach(a => {
    const dept = a.department || 'Otros'
    if (!grouped[dept]) grouped[dept] = []
    grouped[dept].push(a)
  })

  const sortedDepts = Object.keys(grouped).sort(
    (a, b) => DEPT_ORDER.indexOf(a) - DEPT_ORDER.indexOf(b)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 text-agency-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Agentes</h1>
          <p className="text-muted mt-0.5">{agents.length} agentes de IA listos para trabajar</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-xl border shadow-sm">
          <Users className="w-4 h-4" />
          {sortedDepts.filter(d => d !== 'Gerencia').length} departamentos
        </div>
      </div>

      {/* Orchestrator */}
      <div className="card p-5 bg-gradient-to-r from-agency-600 to-agency-500 border-agency-400 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-lg">{agents.find(a => a.id === 'orchestrator')?.name || 'Agents Orchestrator'}</p>
            <p className="text-sm text-white/80">
              {agents.find(a => a.id === 'orchestrator')?.role || 'Gerente General'}
              {agents.find(a => a.id === 'orchestrator')?.description ? ` — ${agents.find(a => a.id === 'orchestrator')?.description}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Departments */}
      <div className="space-y-2">
        {sortedDepts.filter(d => d !== 'Gerencia').map(deptName => {
          const isOpen = expandedDept === deptName
          const deptAgents = grouped[deptName]
          return (
            <div key={deptName} className="card overflow-hidden">
              <button
                onClick={() => setExpandedDept(prev => prev === deptName ? null : deptName)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{DEPT_ICONS[deptName] || '📋'}</span>
                  <span className="font-semibold text-gray-900">{deptName}</span>
                  <span className="badge-gray">{deptAgents[0]?.level || '-'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 font-medium">{deptAgents.length} agentes</span>
                  {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-gray-50 divide-y divide-gray-50">
                  {deptAgents.map(agent => (
                    <div key={agent.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-agency-50 to-agency-100 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-agency-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                        <p className="text-xs text-gray-500">{agent.role}</p>
                        {agent.description && (
                          <p className="text-xs text-gray-400 mt-0.5">{agent.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
