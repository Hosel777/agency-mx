import { useState } from 'react'
import { Bot, User, Send, Loader2 } from 'lucide-react'

const mockMessages = [
  { id: 'm1', agent: 'Agents Orchestrator', role: 'assistant', content: 'Analizando la solicitud... Detecto que necesitamos: Research de mercado, Brief de marca, Diseño UI, Copy, Frontend y SEO. Activando Trend Researcher.', time: 'Hace 2h' },
  { id: 'm2', agent: 'Trend Researcher', role: 'assistant', content: 'Investigación completada. Analicé 15 competidores directos. Los principales insights: (1) El 80% usa hero con video, (2) Predominan colores azules, (3) El precio promedio es $29/mes.', time: 'Hace 1h' },
  { id: 'm3', agent: 'Brand Guardian', role: 'assistant', content: 'Brief de marca completado. Propongo: paleta basada en naranja + azul profundo, tono profesional pero cercano, tipografía Inter para web.', time: 'Hace 30m' },
  { id: 'm4', agent: 'UI Designer', role: 'assistant', content: 'Diseño en progreso. Voy a maquetar la sección hero con la propuesta de Brand Guardian.', time: 'Hace 5m' },
]

const allAgents = [
  'Agents Orchestrator', 'Trend Researcher', 'Product Manager', 'Strategy',
  'Brand Guardian', 'UI Designer', 'UX Researcher', 'Content Creator',
  'Social Media Strategist', 'SEO Specialist', 'Frontend Developer',
  'Backend Architect', 'PPC Campaign Strategist', 'Reality Checker',
]

export default function AgentChat({ requestId }) {
  const [messages] = useState(mockMessages)
  const [input, setInput] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('all')

  const filteredMessages = selectedAgent === 'all'
    ? messages
    : messages.filter(m => m.agent === selectedAgent)

  const handleSend = () => {
    if (!input.trim()) return
    setInput('')
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-16rem)]">
      <div className="w-64 flex-shrink-0">
        <div className="card p-3 space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Filtrar por agente</p>
          <button
            onClick={() => setSelectedAgent('all')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedAgent === 'all' ? 'bg-agency-50 text-agency-700' : 'hover:bg-gray-100'
            }`}
          >
            Todos los agentes
          </button>
          <div className="border-t my-2" />
          {allAgents.map(agent => (
            <button
              key={agent}
              onClick={() => setSelectedAgent(agent)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                selectedAgent === agent ? 'bg-agency-50 text-agency-700' : 'hover:bg-gray-100'
              }`}
            >
              <Bot className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{agent}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col card">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredMessages.map(msg => (
            <div key={msg.id} className="flex gap-3">
              <div className={`p-2 rounded-lg flex-shrink-0 ${
                msg.role === 'assistant' ? 'bg-agency-100' : 'bg-gray-100'
              }`}>
                {msg.role === 'assistant'
                  ? <Bot className="w-5 h-5 text-agency-600" />
                  : <User className="w-5 h-5 text-gray-600" />
                }
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{msg.agent}</span>
                  <span className="text-xs text-gray-400">{msg.time}</span>
                </div>
                <p className="text-sm text-gray-700">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Instruye a los agentes, pide cambios..."
              className="input-field flex-1"
            />
            <button onClick={handleSend} className="btn-primary">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
