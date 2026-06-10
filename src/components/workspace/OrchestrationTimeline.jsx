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
        <div className="absolute left-[15px] top-8 bottom-0 w-px bg-gradient-to-b from-outline-variant/30 to-transparent" />
      )}

      {/* Icon bubble */}
      <div className="relative z-10 flex-shrink-0">
        <div className={`w-8 h-8 rounded-full ${config.bg}/20 border-2 ${config.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className={`w-4 h-4 ${config.text}`} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-caption font-semibold ${config.text}`}>
            {log.agent}
          </span>
          <span className="text-[10px] text-outline font-mono">
            {log.time}
          </span>
        </div>
        <p className="text-body-md text-on-surface-variant leading-relaxed">
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
        className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl transition-colors ${
          hasError ? 'bg-error/10 hover:bg-error/20' : 'bg-surface-container-low hover:bg-surface-container-hover'
        }`}
      >
        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-outline" /> : <ChevronRight className="w-3.5 h-3.5 text-outline" />}
        <span className="text-body-md">{emoji}</span>
        <span className="text-body-md font-medium text-on-surface">{agentName}</span>
        <span className="text-caption text-on-surface-variant ml-auto">{entries.length} eventos</span>
        {hasError && <AlertTriangle className="w-3.5 h-3.5 text-error" />}
        {entries.some(e => e.level === 'success') && <CheckCircle2 className="w-3.5 h-3.5 text-tertiary" />}
      </button>
      {expanded && (
        <div className="ml-4 pl-6 border-l border-outline-variant/20 mt-1">
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
      <div className="h-full flex flex-col items-center justify-center bg-surface text-on-surface-variant">
        <Clock className="w-10 h-10 mb-3 text-on-surface-variant/30" />
        <p className="text-body-md font-medium">Esperando actividad de los agentes...</p>
        <p className="text-caption text-on-surface-variant/60 mt-1">Los logs aparecerán en tiempo real cuando se ejecute una orquestación</p>
      </div>
    )
  }

  return (
    <div className="h-full bg-surface text-on-surface overflow-auto p-4">
      {/* View mode toggle */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant/20">
        <Bot className="w-4 h-4 text-primary" />
        <span className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider">Timeline de Orquestación</span>
        <span className="text-[10px] text-outline ml-auto">{logs.length} eventos</span>
        <button
          onClick={() => setViewMode(viewMode === 'grouped' ? 'flat' : 'grouped')}
          className="text-[10px] px-2 py-1 rounded bg-surface-variant hover:bg-surface-container-hover text-on-surface-variant transition-colors"
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
            <div key={i} className="flex gap-3 py-1.5 px-2 rounded hover:bg-surface-container-hover group">
              <span className="text-[10px] text-outline font-mono w-16 shrink-0 pt-0.5">
                {log.time}
              </span>
              <span className={`text-[10px] font-semibold w-28 shrink-0 truncate pt-0.5 ${
                log.level === 'error' ? 'text-error' :
                log.level === 'warn' ? 'text-warning' :
                log.level === 'success' ? 'text-tertiary' :
                'text-primary'
              }`}>
                [{log.agent}]
              </span>
              <span className="text-body-md text-on-surface-variant leading-relaxed">
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
