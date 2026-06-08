import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../services/supabase'
import { fetchRequest, fetchDeliverables, fetchAgentMessages, startOrchestration, sendChatMessage, deployWebsite, generateQuote, sendQuote } from '../../services/api'
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/constants'
import {
  Bot, FileText, Globe, Image as ImageIcon, Code2, Download,
  ChevronRight, ChevronDown, Play, Square, Loader2,
  MessageSquare, Terminal as TerminalIcon, X, Send, Sparkles, RefreshCw
} from 'lucide-react'

const TYPE_ICONS = { text: FileText, html: Globe, image: ImageIcon, code: Code2, file: Download }
const TYPE_LABELS = { text: 'Documento', html: 'Web', image: 'Imagen', code: 'Código', file: 'Archivo' }

// ─── File Tree ───────────────────────────────────────────────
function FileTree({ deliverables, activeFile, onSelect, agentMessages }) {
  const [expanded, setExpanded] = useState({})

  const grouped = {}
  deliverables.forEach(d => {
    const agent = d.agent_name || 'Otros'
    if (!grouped[agent]) grouped[agent] = []
    grouped[agent].push(d)
  })

  const agentStatus = {}
  agentMessages.forEach(m => {
    if (m.agent_name && m.agent_name !== 'Usuario' && m.agent_name !== 'Sistema') {
      agentStatus[m.agent_name] = 'done'
    }
  })

  const toggle = (name) => setExpanded(p => ({ ...p, [name]: !p[name] }))

  const ext = (type) => ({
    text: '.txt', html: '.html', image: '.png', code: '.js', file: '.zip'
  })[type] || '.txt'

  return (
    <div className="h-full flex flex-col bg-gray-900 text-gray-300 text-xs">
      <div className="px-3 py-2 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-800">
        Entregables
      </div>
      <div className="flex-1 overflow-auto p-1 space-y-0.5">
        {Object.entries(grouped).map(([agent, files]) => (
          <div key={agent}>
            <button
              onClick={() => toggle(agent)}
              className="w-full flex items-center gap-1 px-2 py-1 hover:bg-gray-800 rounded text-gray-400"
            >
              {expanded[agent] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <Bot className="w-3.5 h-3.5 text-agency-400" />
              <span className="truncate flex-1">{agent}</span>
              <span className="text-gray-600">{files.length}</span>
            </button>
            {expanded[agent] && files.map((f, i) => {
              const Icon = TYPE_ICONS[f.deliverable_type || f.type || 'text']
              const isActive = activeFile?.id === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => onSelect(f)}
                  className={`w-full flex items-center gap-1.5 pl-6 pr-2 py-1 rounded text-xs ${
                    isActive ? 'bg-agency-700/40 text-white' : 'hover:bg-gray-800 text-gray-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{f.name || `${agent.toLowerCase().replace(/\s+/g, '-')}${ext(f.deliverable_type || f.type)}`}</span>
                  {f.client_delivered && <span className="ml-auto text-green-500">✓</span>}
                </button>
              )
            })}
          </div>
        ))}
        {deliverables.length === 0 && (
          <div className="p-4 text-center text-gray-600">
            Esperando entregables...
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Editor Panel ────────────────────────────────────────────
function EditorPanel({ file, onDeliver, onDeploy, deploying, request, onSaveQuote, saving, editContent, setEditContent, editStripeLink, setEditStripeLink }) {
  if (!file) {
    return (
      <div className="flex items-start justify-center h-full text-gray-500 bg-gray-50 overflow-y-auto">
        <div className="text-center max-w-2xl w-full px-6 py-8">
              {request ? (
            <div className="text-left bg-white rounded-xl border shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{request.title}</h2>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  {request.project_type && <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">{request.project_type}</span>}
                  {request.source && <span className="text-xs">{request.source === 'socialpulse' ? '🌐 SocialPulse' : '📋 Manual'}</span>}
                </div>
              </div>

              {request.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide">Descripción</h3>
                  <p className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">{request.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-4 text-sm">
                {request.budget && <div><span className="text-gray-500">Presupuesto:</span> <span className="font-medium text-gray-800">${request.budget} MXN</span></div>}
                {request.deadline && <div><span className="text-gray-500">Fecha límite:</span> <span className="font-medium text-gray-800">{request.deadline}</span></div>}
                {request.client_name && <div><span className="text-gray-500">Cliente:</span> <span className="font-medium text-gray-800">{request.client_name}</span></div>}
                {request.client_email && <div><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-800">{request.client_email}</span></div>}
              </div>

              {request.refs && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide">Referencias</h3>
                  <p className="text-gray-600 whitespace-pre-wrap text-sm">{request.refs}</p>
                </div>
              )}

              {request.brand_data && renderBrandData(request.brand_data)}

              {Array.isArray(request.images) && request.images.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Imágenes</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {request.images.map((img, i) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden border bg-gray-50">
                        <img src={img.url || img} alt={img.label || `Imagen ${i + 1}`} className="w-full h-32 object-cover" />
                        {img.label && <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2"><p className="text-xs text-white truncate">{img.label}</p></div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 text-center text-xs text-gray-400">
                {request.status === 'pending' ? 'Usa "Generar Presupuesto" para iniciar' :
                 request.status === 'quoting' ? 'Generando presupuesto...' :
                 request.status === 'quote_sent' ? 'Presupuesto listo — ejecutá los agentes' :
                 'Entregables disponibles abajo en el explorador'}
              </div>
            </div>
          ) : (
            <div>
              <Bot className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Selecciona un entregable del explorador</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  function renderBrandData(bd) {
    const rows = []
    if (bd.business_name) rows.push(['Negocio', bd.business_name])
    if (bd.industry) rows.push(['Industria', bd.industry])
    if (bd.audience) rows.push(['Audiencia', bd.audience])
    if (bd.tone) rows.push(['Tono', bd.tone])
    if (bd.style) rows.push(['Estilo', bd.style])
    if (bd.colors) {
      const colors = Array.isArray(bd.colors) ? bd.colors : typeof bd.colors === 'string' ? bd.colors.split(/[,;]/).map(s => s.trim()).filter(Boolean) : []
      rows.push(['Colores', colors.map(c => <span key={c} className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block border" style={{backgroundColor: c}} />{c}</span>)])
    }
    if (bd.description) rows.push(['Descripción', bd.description])
    if (rows.length === 0) return null
    return (
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Datos de Marca</h3>
        <div className="bg-gray-50 rounded-lg border p-4 space-y-2">
          {rows.map(([label, value], i) => (
            <div key={i} className="flex gap-2 text-sm">
              <span className="text-gray-500 font-medium min-w-[80px]">{label}:</span>
              <span className="text-gray-800">{value}</span>
            </div>
          ))}
        </div>
        {bd.logo && (
          <div className="mt-3">
            <p className="text-sm text-gray-500 font-medium mb-1">Logo:</p>
            <img src={bd.logo} alt="Logo" className="max-h-20 rounded border bg-white p-1" />
          </div>
        )}
      </div>
    )
  }

  const type = file.deliverable_type || file.type || 'text'
  const ext = { text: 'txt', html: 'html', image: 'png', code: 'js', file: 'zip' }[type] || 'txt'

  const renderPreview = () => {
    switch (type) {
      case 'html':
        return (
          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-b text-sm text-gray-500">
              <Globe className="w-4 h-4" /> Vista previa web
            </div>
            <iframe srcDoc={file.content} className="w-full h-[500px] border-0" title="Preview" sandbox="allow-scripts" />
          </div>
        )
      case 'image':
        return file.file_url
          ? <img src={file.file_url} alt={file.name} className="max-w-full max-h-[500px] rounded-lg shadow-md mx-auto" />
          : <div className="text-center text-gray-400 py-12"><ImageIcon className="w-16 h-16 mx-auto mb-2" /><p>{file.content || 'Sin imagen'}</p></div>
      case 'code':
        return (
          <div className="border rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-mono">
              <Code2 className="w-4 h-4" /> {file.language || ext}
            </div>
            <pre className="p-4 bg-gray-50 overflow-auto max-h-[500px] text-sm"><code>{file.content}</code></pre>
          </div>
        )
      default:
        return (
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed bg-white rounded-lg border p-6">
              {file.content || 'Sin contenido disponible'}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">{ext}</span>
          <span className="font-medium">{file.name}</span>
          {file.client_delivered && <span className="text-green-600 text-xs">✅ Entregado</span>}
        </div>
        <div className="flex items-center gap-2">
          {file.deliverable_type === 'html' && file.agent_id === 'developer' && !file.deployed && onDeploy && (
            <button
              onClick={() => onDeploy(file)}
              disabled={deploying}
              className="text-xs bg-gradient-to-r from-agency-500 to-purple-600 text-white px-3 py-1 rounded hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
            >
              {deploying ? <Loader2 className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
              {deploying ? 'Publicando...' : 'Publicar Web 🌐'}
            </button>
          )}
          {file.file_url && file.deployed && (
            <a
              href={file.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1"
            >
              <Globe className="w-3 h-3" /> Ver Web
            </a>
          )}
          {!file.client_delivered && file.status === 'approved' && onDeliver && (
            <button onClick={() => onDeliver(file.id)} className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
              Entregar al Cliente
            </button>
          )}
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            file.status === 'completed' ? 'bg-green-100 text-green-700' :
            file.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {file.status === 'completed' ? 'Completado' : file.status === 'approved' ? 'Aprobado' : 'Por revisar'}
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {file.agent_id === 'sales' ? (
          <div className="space-y-4">
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              className="w-full min-h-[200px] font-mono text-sm p-4 border rounded resize-y"
            />
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Link de pago Stripe:</label>
              <input
                value={editStripeLink}
                onChange={e => setEditStripeLink(e.target.value)}
                className="w-full text-sm border rounded px-3 py-2"
                placeholder="https://buy.stripe.com/..."
              />
            </div>
            <div className="flex justify-end">
              <button onClick={onSaveQuote} disabled={saving} className="btn-primary text-xs px-4 py-2">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin inline mr-1" />}
                {saving ? 'Guardando...' : 'Guardar Presupuesto'}
              </button>
            </div>
          </div>
        ) : (
          renderPreview()
        )}
      </div>
    </div>
  )
}

// ─── Live Terminal ───────────────────────────────────────────
function LiveTerminal({ logs }) {
  const bottomRef = useRef(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [logs])

  return (
    <div className="h-full bg-gray-950 text-green-400 font-mono text-xs p-3 overflow-auto">
      {logs.map((log, i) => (
        <div key={i} className="flex gap-2">
          <span className="text-gray-600 shrink-0">{log.time}</span>
          <span className={`shrink-0 ${log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-yellow-400' : 'text-cyan-400'}`}>
            [{log.agent}]
          </span>
          <span className="text-gray-300">{log.text}</span>
        </div>
      ))}
      {logs.length === 0 && (
        <div className="text-gray-600">Esperando actividad de los agentes...</div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}

// ─── Main Workspace ──────────────────────────────────────────
export default function AgentWorkspace({ request }) {
  const [deliverables, setDeliverables] = useState([])
  const [messages, setMessages] = useState([])
  const [activeFile, setActiveFile] = useState(null)
  const [activePanel, setActivePanel] = useState('editor') // editor | terminal
  const [logs, setLogs] = useState([])
  const [orchestrating, setOrchestrating] = useState(false)
  const [quoting, setQuoting] = useState(false)
  const [delivering, setDelivering] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [chatMsg, setChatMsg] = useState('')
  const [chatSending, setChatSending] = useState(false)
  const [reqData, setReqData] = useState(request)
  const [editContent, setEditContent] = useState('')
  const [editStripeLink, setEditStripeLink] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (activeFile?.agent_id === 'sales') {
      setEditContent(activeFile.content || '')
      setEditStripeLink(reqData.stripe_payment_link || '')
    }
  }, [activeFile?.id])

  const loadData = async () => {
    const safeFetch = (fn) => fn().catch(() => ({ data: null }))
    const [delRes, msgRes, reqRes] = await Promise.all([
      safeFetch(() => fetchDeliverables(reqData.id)),
      safeFetch(() => fetchAgentMessages(reqData.id)),
      safeFetch(() => fetchRequest(reqData.id)),
    ])
    if (delRes.data) setDeliverables(delRes.data)
    if (msgRes.data) setMessages(msgRes.data)
    if (reqRes.data) setReqData(reqRes.data)
    if (reqRes.data?.orchestration_logs) {
      const storedLogs = reqRes.data.orchestration_logs.map(l => ({
        time: new Date(l.time).toLocaleTimeString(),
        agent: l.agent,
        text: l.text,
        level: l.level || 'info'
      }))
      setLogs(storedLogs)
    }
  }

  useEffect(() => { if (request?.id) { setReqData(request); loadData() } }, [request?.id])

  // Live polling cada 3s si está en progreso
  useEffect(() => {
    if (!request?.id || reqData.status !== 'in_progress') return
    const interval = setInterval(loadData, 3000)
    return () => clearInterval(interval)
  }, [request?.id, reqData.status])

  const addLog = (agent, text, level = 'info') => {
    const time = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, { time, agent, text, level }])
  }

  const handleGenerateQuote = async () => {
    setQuoting(true)
    addLog('Sistema', 'Generando presupuesto...')
    addLog('Agents Orchestrator', 'Analizando solicitud para plan de ejecución...')

    try {
      const result = await generateQuote(reqData.id)
      if (result.success) {
        addLog('Sales', 'Presupuesto generado exitosamente')
        setReqData(prev => ({ ...prev, status: 'quote_sent' }))
        await loadData()
      } else {
        addLog('Sistema', `Error: ${result.error}`, 'error')
      }
    } catch (err) {
      addLog('Sistema', `Error de conexión: ${err.message}`, 'error')
    }

    setQuoting(false)
  }

  const handleSendQuote = async () => {
    addLog('Sistema', 'Enviando presupuesto...')
    try {
      const result = await sendQuote(reqData.id)
      if (result.success) {
        addLog('Sistema', result.message)
        setReqData(prev => ({ ...prev, status: 'quote_sent', quote_sent_at: new Date().toISOString() }))
        await loadData()
      } else {
        addLog('Sistema', `Error al enviar: ${result.error}`, 'error')
      }
    } catch (err) {
      addLog('Sistema', `Error de conexión: ${err.message}`, 'error')
    }
  }

  const handleOrchestrate = async () => {
    setOrchestrating(true)
    addLog('Sistema', 'Iniciando orquestación...')
    addLog('Agents Orchestrator', 'Analizando solicitud...')

    try {
      const result = await startOrchestration(reqData.id)
      if (result.success) {
        addLog('Agents Orchestrator', `Plan ejecutado: ${result.agentsActivated} agentes activados, ${result.deliverablesGenerated} entregables generados`)
        setReqData(prev => ({ ...prev, status: 'in_progress' }))
        await loadData()
      } else {
        addLog('Sistema', `Error: ${result.error}`, 'error')
      }
    } catch (err) {
      addLog('Sistema', `Error de conexión: ${err.message}`, 'error')
    }

    setOrchestrating(false)
  }

  const handleDeliver = async (deliverableId) => {
    setDelivering(true)
    const { error } = await supabase
      .from('deliverables')
      .update({ client_delivered: true, client_delivered_at: new Date().toISOString() })
      .eq('id', deliverableId)
    if (!error) {
      setDeliverables(prev => prev.map(d =>
        d.id === deliverableId ? { ...d, client_delivered: true, client_delivered_at: new Date().toISOString() } : d
      ))
      addLog('Sistema', `Entregable marcado como entregado al cliente`, 'warn')
    }
    setDelivering(false)
  }

  const handleDeployWebsite = async (file) => {
    if (!file?.content || deploying) return
    setDeploying(true)
    addLog('Sistema', `Publicando sitio web...`, 'info')

    try {
      const result = await deployWebsite(file.id, reqData.id, file.content, file.name)
      if (result.success) {
        addLog('Sistema', `¡Sitio web publicado! 🌐 ${result.url}`, 'info')
        setDeliverables(prev => prev.map(d =>
          d.id === file.id ? { ...d, deployed: true, deployed_at: new Date().toISOString(), file_url: result.url } : d
        ))
        await loadData()
      } else {
        addLog('Sistema', `Error al publicar: ${result.error}`, 'error')
      }
    } catch (err) {
      addLog('Sistema', `Error de conexión: ${err.message}`, 'error')
    }

    setDeploying(false)
  }

  const handleChatSend = async () => {
    if (!chatMsg.trim() || chatSending) return
    const text = chatMsg
    setChatMsg('')
    setChatSending(true)
    addLog('Usuario', text)

    const userMsg = { id: `temp-${Date.now()}`, agent_name: 'Usuario', role: 'user', content: text, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])

    try {
      const result = await sendChatMessage(reqData.id, text)
      if (result.success) {
        const agentMsg = { id: `temp-${Date.now() + 1}`, agent_name: result.agent, role: 'assistant', content: result.response, created_at: new Date().toISOString() }
        setMessages(prev => [...prev, agentMsg])
        addLog(result.agent, 'Respuesta enviada')
      }
    } catch (err) {
      addLog('Sistema', `Error en chat: ${err.message}`, 'error')
    }
    setChatSending(false)
  }

  const handleSaveQuote = async () => {
    if (!activeFile || saving) return
    setSaving(true)
    try {
      const { error: delErr } = await supabase
        .from('deliverables')
        .update({ content: editContent })
        .eq('id', activeFile.id)
      if (delErr) throw delErr

      const { error: reqErr } = await supabase
        .from('client_requests')
        .update({ stripe_payment_link: editStripeLink })
        .eq('id', reqData.id)
      if (reqErr) throw reqErr

      addLog('Sistema', 'Presupuesto guardado correctamente')
      await loadData()
    } catch (err) {
      addLog('Sistema', `Error al guardar: ${err.message}`, 'error')
    }
    setSaving(false)
  }

  const QUOTE_EXPIRY_DAYS = 30
  const isQuoteExpired = reqData.status === 'quote_sent' && reqData.quote_sent_at
    ? Date.now() - new Date(reqData.quote_sent_at).getTime() > QUOTE_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    : false

  return (
    <div className="flex-1 min-h-0 flex flex-col rounded-lg overflow-hidden border">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-agency-400 to-agency-600 flex items-center justify-center shadow-sm">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <span className="font-semibold text-gray-900">{reqData.title}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={STATUS_COLORS[reqData.status]}>{STATUS_LABELS[reqData.status]}</span>
              <span className="text-xs text-gray-400">{reqData.project_type}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {reqData.status === 'pending' && (
            <button
              onClick={handleGenerateQuote}
              disabled={quoting}
              className="btn-primary text-xs px-4 py-2"
            >
              {quoting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              {quoting ? 'Generando presupuesto...' : 'Generar Presupuesto'}
            </button>
          )}
          {reqData.status === 'quoting' && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generando presupuesto...
            </span>
          )}
          {reqData.status === 'quote_sent' && !isQuoteExpired && !reqData.quote_sent_at && (
            <button
              onClick={handleSendQuote}
              className="btn-primary text-xs px-4 py-2"
            >
              <Send className="w-3.5 h-3.5" />
              Enviar Presupuesto
            </button>
          )}
          {reqData.status === 'quote_sent' && !isQuoteExpired && reqData.quote_sent_at && (
            <button
              onClick={handleOrchestrate}
              disabled={orchestrating}
              className="btn-primary text-xs px-4 py-2"
            >
              {orchestrating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              {orchestrating ? 'Orquestando...' : 'Ejecutar Agentes'}
            </button>
          )}
          {reqData.status === 'quote_sent' && isQuoteExpired && (
            <button
              onClick={handleGenerateQuote}
              disabled={quoting}
              className="btn-primary text-xs px-4 py-2"
            >
              {quoting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              {quoting ? 'Generando nuevo presupuesto...' : 'Presupuesto vencido — Renovar'}
            </button>
          )}
          {reqData.status === 'in_progress' && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Agentes trabajando...
            </span>
          )}
          {reqData.status === 'completed' && (
            <span className="badge-green">Completado</span>
          )}
        </div>
      </div>

      {/* Main 3-panel layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left: File Explorer */}
        <div className="w-64 border-r border-gray-800 bg-gray-900 flex-shrink-0 overflow-hidden">
          <FileTree
            deliverables={deliverables}
            activeFile={activeFile}
            onSelect={setActiveFile}
            agentMessages={messages}
          />
        </div>

        {/* Center: Editor + Terminal */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Panel tabs */}
          <div className="flex items-center border-b bg-gray-50 text-xs px-2">
            <button
              onClick={() => setActivePanel('editor')}
              className={`px-4 py-2 border-b-2 font-medium ${activePanel === 'editor' ? 'border-agency-600 text-agency-700 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <FileText className="w-3.5 h-3.5 inline mr-1.5" /> Editor
            </button>
            <button
              onClick={() => setActivePanel('terminal')}
              className={`px-4 py-2 border-b-2 font-medium ${activePanel === 'terminal' ? 'border-agency-600 text-agency-700 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <TerminalIcon className="w-3.5 h-3.5 inline mr-1.5" /> Terminal
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">
            {activePanel === 'editor' ? (
              <EditorPanel file={activeFile} onDeliver={handleDeliver} onDeploy={handleDeployWebsite} deploying={deploying} request={reqData} onSaveQuote={handleSaveQuote} saving={saving} editContent={editContent} setEditContent={setEditContent} editStripeLink={editStripeLink} setEditStripeLink={setEditStripeLink} />
            ) : (
              <LiveTerminal logs={logs} />
            )}
          </div>
        </div>

        {/* Right: Chat Panel */}
        <div className="w-80 border-l flex-shrink-0 flex flex-col bg-white">
          <div className="px-4 py-3 border-b bg-gray-50 text-sm font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-agency-500" /> Chat con Agentes
          </div>
          <div className="flex-1 overflow-auto p-3 space-y-3">
            {messages.filter(m => m.agent_name !== 'Usuario' || true).slice(-30).map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-agency-600 text-white rounded-2xl rounded-br-sm' : 'bg-gray-100 rounded-2xl rounded-bl-sm'} px-3 py-2 text-xs`}>
                  <p className="font-medium text-[10px] mb-0.5 opacity-70">{msg.agent_name || 'Agente'}</p>
                  <p className="whitespace-pre-wrap">{msg.content?.substring(0, 300)}{msg.content?.length > 300 ? '...' : ''}</p>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-xs py-8">
                Los agentes aparecerán aquí cuando trabajen
              </div>
            )}
          </div>
          <div className="border-t p-3 flex gap-2">
            <input
              value={chatMsg}
              onChange={e => setChatMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChatSend()}
              className="flex-1 text-xs border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-agency-500"
              placeholder="Instruye a los agentes..."
            />
            <button onClick={handleChatSend} disabled={chatSending} className="p-2 bg-agency-600 text-white rounded-lg hover:bg-agency-700 disabled:opacity-50">
              {chatSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
