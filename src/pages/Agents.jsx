import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import AGENTS_HIERARCHY from '../utils/agents'
import { Bot, ChevronDown, ChevronRight, Loader2 } from 'lucide-react'

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
          // Fallback: convertir agents.js a flat list
          const flat = AGENTS_HIERARCHY.departments.flatMap(dept =>
            dept.agents.map(a => ({
              id: a.id,
              name: a.name,
              role: a.role,
              department: dept.name,
              level: dept.level,
              description: null,
              is_active: true,
            }))
          )
          flat.unshift({
            id: AGENTS_HIERARCHY.orchestrator.id,
            name: AGENTS_HIERARCHY.orchestrator.name,
            role: AGENTS_HIERARCHY.orchestrator.role,
            department: 'Gerencia',
            level: AGENTS_HIERARCHY.orchestrator.level,
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

  const toggleDept = (name) => {
    setExpandedDept(prev => prev === name ? null : name)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Agentes</h1>
        <p className="text-gray-500 text-sm">
          {loading
            ? 'Cargando agentes...'
            : `${agents.length} agentes de IA de tu agencia virtual`
          }
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-agency-600 animate-spin" />
        </div>
      ) : (
        <div className="card p-6">
          <div className="flex items-center gap-3 p-4 bg-agency-50 rounded-lg border border-agency-200 mb-4">
            <Bot className="w-8 h-8 text-agency-600" />
            <div>
              <p className="font-semibold text-agency-800">
                {agents.find(a => a.id === 'orchestrator')?.name || 'Agents Orchestrator'}
              </p>
              <p className="text-sm text-agency-600">
                {agents.find(a => a.id === 'orchestrator')?.role || 'Gerente General'}
                {agents.find(a => a.id === 'orchestrator')?.description
                  ? ` — ${agents.find(a => a.id === 'orchestrator')?.description}`
                  : ''}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {sortedDepts.filter(d => d !== 'Gerencia').map(deptName => (
              <div key={deptName} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleDept(deptName)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {expandedDept === deptName
                      ? <ChevronDown className="w-4 h-4 text-gray-400" />
                      : <ChevronRight className="w-4 h-4 text-gray-400" />
                    }
                    <span className="font-medium">{deptName}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      Nivel {grouped[deptName][0]?.level || '-'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{grouped[deptName].length} agentes</span>
                </button>

                {expandedDept === deptName && (
                  <div className="border-t divide-y">
                    {grouped[deptName].map(agent => (
                      <div key={agent.id} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50">
                        <Bot className="w-4 h-4 text-agency-500" />
                        <div>
                          <p className="text-sm font-medium">{agent.name}</p>
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
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
