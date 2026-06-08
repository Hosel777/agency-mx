import { useState, useRef, useEffect } from 'react'
import {
  Bot, CheckCircle2, AlertTriangle, XCircle, Loader2,
  ChevronDown, ChevronRight, Clock
} from 'lucide-react'

const LEVEL_CONFIG = {
  info: { color: 'border-cyan-500', bg: 'bg-cyan-500', text: 'text-cyan-400', icon: Bot },
  warn: { color: 'border-yellow-500', bg: 'bg-yellow-500', text: 'text-yellow-400', icon: AlertTriangle },
  error: { color: 'border-red-500', bg: 'bg-red-500', text: 'text-red-400', icon: XCircle },
  success: { color: 'border-green-500', bg: 'bg-green-500', text: 'text-green-400', icon: CheckCircle2 },
}

function TimelineNode({ log, isLast }) {
  const config = LEVEL_CONFIG[log.level] || LEVEL_CONFIG.info
  const Icon = config.icon

  return (
    <div className="relative flex gap-4 pb-6 group">
      {/* Vertical line */}
      {!isLast && (
        <div className="absolute left-[15px] top-8 bottom-0 w-px bg-gradient-to-b from-gray-700 to-transparent" />
      )}

      {/* Icon bubble */}
      <div className="relative z-10 flex-shrink-0">
        <div className={`w-8 h-8 rounded-full ${config.bg} bg-opacity-20 border-2 ${config.color} flex items-center justify-center shadow-lg shadow-${config.color}/20 group-hover:scale-110 transition-transform`}>
          <Icon className={`w-4 h-4 ${config.text}`} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-semibold ${config.text}`}>
            {log.agent}
          </span>
          <span className="text-[10px] text-gray-600 font-mono">
            {log.time}
          </span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          {log.text}
        </p>
      </div>
    </div>
  )
}

function AgentGroupTimeline({ agentName, entries, isLast }) {
  const [expanded, setExpanded] = useState(true)

  const iconMap = {
    Sistema: '⚙️',
    'Agents Orchestrator': '🧠',
    Sales: '💰',
    'Trend Researcher': '📊',
    Strategy: '🎯',
    'Brand Guardian': '🛡️',
    'UI Designer': '🎨',
    Developer: '💻',
    'Content Creator': '✍️',
    'SEO Specialist': '🔍',
    'Reality Checker': '✅',
    'Social Media Strategist': '📱',
    'Visual Storyteller': '🖼️',
    'UX Researcher': '🔬',
    'PPC Campaign Strategist': '📈',
    'MVP Developer': '⚡',
    'Outbound Strategist': '📞',
    'Deal Strategist': '🤝',
    'Sales Engineer': '🔧',
    'LinkedIn Content Creator': '💼',
    'Twitter Engager': '🐦',
    'Email Marketing Strategist': '📧',
    'Security Architect': '🔐',
    'Penetration Tester': '🕵️',
    'AppSec Engineer': '🛡️',
    'Compliance Auditor': '📋',
    'Incident Responder': '🚨',
  }

  const emoji = iconMap[agentName] || '🤖'
  const hasError = entries.some(e => e.level === 'error')

  return (
    <div className="mb-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-colors ${
          hasError ? 'bg-red-900/20 hover:bg-red-900/30' : 'bg-gray-800/50 hover:bg-gray-800'
        }`}
      >
        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
        <span className="text-sm">{emoji}</span>
        <span className="text-sm font-medium text-gray-200">{agentName}</span>
        <span className="text-xs text-gray-500 ml-auto">{entries.length} eventos</span>
        {hasError && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
        {entries.some(e => e.level === 'success') && <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
      </button>
      {expanded && (
        <div className="ml-4 pl-6 border-l border-gray-800 mt-1">
          {entries.map((log, i) => (
            <TimelineNode key={i} log={log} isLast={i === entries.length - 1 && isLast} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function OrchestrationTimeline({ logs, compact }) {
  const bottomRef = useRef(null)
  const [viewMode, setViewMode] = useState(compact ? 'flat' : 'grouped')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  // Group logs by agent
  const grouped = logs.reduce((acc, log) => {
    const key = log.agent || 'Sistema'
    if (!acc[key]) acc[key] = []
    acc[key].push(log)
    return acc
  }, {})

  const agentOrder = ['Sistema', 'Agents Orchestrator', ...Object.keys(grouped).filter(k => k !== 'Sistema' && k !== 'Agents Orchestrator')]

  if (logs.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-950 text-gray-600">
        <Clock className="w-10 h-10 mb-3 text-gray-700" />
        <p className="text-sm font-medium">Esperando actividad de los agentes...</p>
        <p className="text-xs text-gray-700 mt-1">Los logs aparecerán en tiempo real cuando se ejecute una orquestación</p>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-950 text-gray-300 overflow-auto p-4">
      {/* View mode toggle */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-800">
        <Bot className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Timeline de Orquestación</span>
        <span className="text-[10px] text-gray-600 ml-auto">{logs.length} eventos</span>
        <button
          onClick={() => setViewMode(viewMode === 'grouped' ? 'flat' : 'grouped')}
          className="text-[10px] px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors"
        >
          {viewMode === 'grouped' ? 'Vista plana' : 'Por agente'}
        </button>
      </div>

      {viewMode === 'grouped' ? (
        <div>
          {agentOrder.map((agent, i) => {
            if (!grouped[agent]) return null
            const isLast = i === agentOrder.filter(a => grouped[a]).length - 1
            return (
              <AgentGroupTimeline
                key={agent}
                agentName={agent}
                entries={grouped[agent]}
                isLast={isLast}
              />
            )
          })}
        </div>
      ) : (
        <div className="space-y-0">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3 py-1.5 px-2 rounded hover:bg-gray-900/50 group">
              <span className="text-[10px] text-gray-600 font-mono w-16 shrink-0 pt-0.5">
                {log.time}
              </span>
              <span className={`text-[10px] font-semibold w-28 shrink-0 truncate pt-0.5 ${
                log.level === 'error' ? 'text-red-400' :
                log.level === 'warn' ? 'text-yellow-400' :
                log.level === 'success' ? 'text-green-400' :
                'text-cyan-400'
              }`}>
                [{log.agent}]
              </span>
              <span className="text-xs text-gray-400 leading-relaxed">
                {log.text}
              </span>
            </div>
          ))}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
