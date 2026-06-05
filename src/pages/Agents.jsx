import { useState } from 'react'
import AGENTS_HIERARCHY from '../utils/agents'
import { Bot, ChevronDown, ChevronRight } from 'lucide-react'

export default function Agents() {
  const [expandedDept, setExpandedDept] = useState('estrategia')

  const toggleDept = (id) => {
    setExpandedDept(prev => prev === id ? null : id)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Agentes</h1>
        <p className="text-gray-500 text-sm">Jerarquía de agentes de IA de tu agencia</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 p-4 bg-agency-50 rounded-lg border border-agency-200 mb-4">
          <Bot className="w-8 h-8 text-agency-600" />
          <div>
            <p className="font-semibold text-agency-800">{AGENTS_HIERARCHY.orchestrator.name}</p>
            <p className="text-sm text-agency-600">{AGENTS_HIERARCHY.orchestrator.role} — {AGENTS_HIERARCHY.orchestrator.description}</p>
          </div>
        </div>

        <div className="space-y-2">
          {AGENTS_HIERARCHY.departments.map(dept => (
            <div key={dept.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleDept(dept.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {expandedDept === dept.id
                    ? <ChevronDown className="w-4 h-4 text-gray-400" />
                    : <ChevronRight className="w-4 h-4 text-gray-400" />
                  }
                  <span className="font-medium">{dept.name}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    Nivel {dept.level}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{dept.agents.length} agentes</span>
              </button>

              {expandedDept === dept.id && (
                <div className="border-t divide-y">
                  {dept.agents.map(agent => (
                    <div key={agent.id} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50">
                      <Bot className="w-4 h-4 text-agency-500" />
                      <div>
                        <p className="text-sm font-medium">{agent.name}</p>
                        <p className="text-xs text-gray-500">{agent.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
