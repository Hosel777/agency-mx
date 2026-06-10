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
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface">Agentes</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">{agents.length} agentes de IA listos para trabajar</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-surface-container-low border border-outline-variant/30 px-4 py-2 rounded-xl">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-on-surface-variant">{sortedDepts.filter(d => d !== 'Gerencia').length} departamentos</span>
        </div>
      </div>

      {/* Orchestrator */}
      <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-primary-container/20 to-primary/5 border border-primary/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-h3 text-h3 text-on-surface">{agents.find(a => a.id === 'orchestrator')?.name || 'Agents Orchestrator'}</p>
            <p className="text-body-md text-on-surface-variant">
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
            <div key={deptName} className="glass-card rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpandedDept(prev => prev === deptName ? null : deptName)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-container transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{DEPT_ICONS[deptName] || '📋'}</span>
                  <span className="font-h3 text-h3 text-on-surface">{deptName}</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-variant text-on-surface-variant text-label-sm font-label-sm">Lvl {deptAgents[0]?.level || '-'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-caption text-on-surface-variant">{deptAgents.length} agentes</span>
                  {isOpen ? <ChevronDown className="w-4 h-4 text-outline" /> : <ChevronRight className="w-4 h-4 text-outline" />}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-outline-variant/10">
                  {deptAgents.map(agent => (
                    <div key={agent.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-surface-container/50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-surface-variant flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-body-md font-medium text-on-surface">{agent.name}</p>
                        <p className="text-caption text-on-surface-variant">{agent.role}</p>
                        {agent.description && (
                          <p className="text-caption text-on-surface-variant/60 mt-0.5">{agent.description}</p>
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
