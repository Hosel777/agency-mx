import { useState, useMemo, useRef, useEffect } from 'react'
import { Bot, User, Send, Loader2 } from 'lucide-react'
import { sendChatMessage } from '../../services/api'

export default function AgentChat({ requestId, messages = [], onNewMessage }) {
  const [input, setInput] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('all')
  const [sending, setSending] = useState(false)
  const [localMessages, setLocalMessages] = useState(messages)
  const bottomRef = useRef(null)

  useEffect(() => {
    setLocalMessages(messages)
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMessages])

  const allAgents = useMemo(() => {
    const set = new Set(localMessages.map(m => m.agent_name))
    return ['Agents Orchestrator', ...set]
  }, [localMessages])

  const filteredMessages = selectedAgent === 'all'
    ? localMessages
    : localMessages.filter(m => m.agent_name === selectedAgent)

  const handleSend = async () => {
    if (!input.trim() || sending) return
    const text = input
    setInput('')
    setSending(true)

    const userMsg = {
      id: `temp-${Date.now()}`,
      agent_name: 'Usuario',
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    }
    setLocalMessages(prev => [...prev, userMsg])

    try {
      const result = await sendChatMessage(requestId, text, selectedAgent === 'all' ? null : selectedAgent)
      if (result.success) {
        const agentMsg = {
          id: `temp-${Date.now() + 1}`,
          agent_name: result.agent,
          role: 'assistant',
          content: result.response,
          created_at: new Date().toISOString()
        }
        setLocalMessages(prev => [...prev, agentMsg])
        if (onNewMessage) onNewMessage()
      } else {
        setLocalMessages(prev => [
          ...prev,
          {
            id: `temp-${Date.now() + 1}`,
            agent_name: 'Sistema',
            role: 'assistant',
            content: `Error: ${result.error || 'No se pudo obtener respuesta'}`,
            created_at: new Date().toISOString()
          }
        ])
      }
    } catch (err) {
      setLocalMessages(prev => [
        ...prev,
        {
          id: `temp-${Date.now() + 1}`,
          agent_name: 'Sistema',
          role: 'assistant',
          content: `Error de conexión: ${err.message}`,
          created_at: new Date().toISOString()
        }
      ])
    }

    setSending(false)
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-16rem)]">
      <div className="w-64 flex-shrink-0">
        <div className="glass-card rounded-2xl p-3 space-y-1">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider px-2 mb-2">Filtrar por agente</p>
          <button
            onClick={() => setSelectedAgent('all')}
            className={`w-full text-left px-3 py-2 rounded-xl text-body-md transition-colors ${
              selectedAgent === 'all' ? 'bg-primary/15 text-primary' : 'hover:bg-surface-container-hover text-on-surface-variant'
            }`}
          >
            Todos los agentes
          </button>
          <div className="border-t border-outline-variant/20 my-2" />
          {Array.from(allAgents).filter(Boolean).map(agent => (
            <button
              key={agent}
              onClick={() => setSelectedAgent(agent)}
              className={`w-full text-left px-3 py-2 rounded-xl text-body-md transition-colors flex items-center gap-2 ${
                selectedAgent === agent ? 'bg-primary/15 text-primary' : 'hover:bg-surface-container-hover text-on-surface-variant'
              }`}
            >
              <Bot className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{agent}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col glass-card rounded-2xl">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredMessages.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant text-body-md">
              No hay mensajes aún. Los agentes aparecerán aquí cuando comiencen a trabajar.
            </div>
          )}
          {filteredMessages.map(msg => (
            <div key={msg.id} className="flex gap-3">
              <div className={`p-2 rounded-xl flex-shrink-0 ${
                msg.role === 'assistant' ? 'bg-primary/10' : 'bg-surface-container-high'
              }`}>
                {msg.role === 'assistant'
                  ? <Bot className="w-5 h-5 text-primary" />
                  : <User className="w-5 h-5 text-on-surface-variant" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-body-md font-medium text-on-surface">{msg.agent_name || 'Agente'}</span>
                  <span className="text-caption text-on-surface-variant">
                    {msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : ''}
                  </span>
                </div>
                <p className="text-body-md text-on-surface-variant whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex items-center gap-2 text-body-md text-on-surface-variant pl-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Pensando...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-outline-variant/20 p-4">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Instruye a los agentes, pide cambios..."
              className="input-field flex-1"
              disabled={sending}
            />
            <button onClick={handleSend} disabled={sending} className="btn-primary">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
