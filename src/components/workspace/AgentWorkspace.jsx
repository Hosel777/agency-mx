import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../services/supabase'
import { fetchRequest, fetchDeliverables, fetchAgentMessages, startOrchestration, sendChatMessage, deployWebsite, generateQuote, sendQuote } from '../../services/api'
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/constants'
import OrchestrationTimeline from './OrchestrationTimeline'
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
    <div className="h-full flex flex-col bg-surface-container-high text-on-surface text-xs">
      <div className="px-3 py-2 text-on-surface-variant uppercase tracking-wider font-semibold border-b border-outline-variant/20">
        Entregables
      </div>
      <div className="flex-1 overflow-auto p-1 space-y-0.5">
        {Object.entries(grouped).map(([agent, files]) => (
          <div key={agent}>
            <button
              onClick={() => toggle(agent)}
              className="w-full flex items-center gap-1 px-2 py-1 hover:bg-surface-container-hover rounded text-on-surface-variant"
            >
              {expanded[agent] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <Bot className="w-3.5 h-3.5 text-primary" />
              <span className="truncate flex-1">{agent}</span>
              <span className="text-outline">{files.length}</span>
            </button>
            {expanded[agent] && files.map((f, i) => {
              const Icon = TYPE_ICONS[f.deliverable_type || f.type || 'text']
              const isActive = activeFile?.id === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => onSelect(f)}
                  className={`w-full flex items-center gap-1.5 pl-6 pr-2 py-1 rounded text-xs ${
                    isActive ? 'bg-primary/20 text-primary' : 'hover:bg-surface-container-hover text-on-surface-variant'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{f.name || `${agent.toLowerCase().replace(/\s+/g, '-')}${ext(f.deliverable_type || f.type)}`}</span>
                  {f.client_delivered && <span className="ml-auto text-tertiary">✓</span>}
                </button>
              )
            })}
          </div>
        ))}
        {deliverables.length === 0 && (
          <div className="p-4 text-center text-on-surface-variant/50">
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
      <div className="flex items-start justify-center h-full text-on-surface-variant bg-surface overflow-y-auto">
        <div className="text-center max-w-2xl w-full px-6 py-8">
              {request ? (
            <div className="text-left rounded-xl border border-outline-variant/20 p-6 space-y-6 bg-surface-container-low">
              <div>
                <h2 className="font-h2 text-h2 text-on-surface mb-1">{request.title}</h2>
                <div className="flex items-center gap-3 text-body-md text-on-surface-variant">
                  {request.project_type && <span className="badge-primary">{request.project_type}</span>}
                  {request.source && <span className="text-caption">{request.source === 'socialpulse' ? '🌐 SocialPulse' : '📋 Manual'}</span>}
                </div>
              </div>

              {request.description && (
                <div>
                  <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide mb-1">Descripción</h3>
                  <p className="text-body-md text-on-surface-variant whitespace-pre-wrap leading-relaxed">{request.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-4 text-body-md">
                {request.budget && <div><span className="text-on-surface-variant">Presupuesto:</span> <span className="font-medium text-on-surface">${request.budget} MXN</span></div>}
                {request.deadline && <div><span className="text-on-surface-variant">Fecha límite:</span> <span className="font-medium text-on-surface">{request.deadline}</span></div>}
                {request.client_name && <div><span className="text-on-surface-variant">Cliente:</span> <span className="font-medium text-on-surface">{request.client_name}</span></div>}
                {request.client_email && <div><span className="text-on-surface-variant">Email:</span> <span className="font-medium text-on-surface">{request.client_email}</span></div>}
              </div>

              {request.refs && (
                <div>
                  <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide mb-1">Referencias</h3>
                  <p className="text-body-md text-on-surface-variant whitespace-pre-wrap">{request.refs}</p>
                </div>
              )}

              {request.brand_data && renderBrandData(request.brand_data)}

              {Array.isArray(request.images) && request.images.length > 0 && (
                <div>
                  <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide mb-2">Imágenes</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {request.images.map((img, i) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden border border-outline-variant/20 bg-surface-container-high">
                        <img src={img.url || img} alt={img.label || `Imagen ${i + 1}`} className="w-full h-32 object-cover" />
                        {img.label && <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2"><p className="text-caption text-white truncate">{img.label}</p></div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 text-center text-caption text-on-surface-variant">
                {request.status === 'pending' ? 'Usa "Generar Presupuesto" para iniciar' :
                 request.status === 'quoting' ? 'Generando presupuesto...' :
                 request.status === 'quote_sent' ? 'Presupuesto listo — ejecutá los agentes' :
                 'Entregables disponibles abajo en el explorador'}
              </div>
            </div>
          ) : (
            <div>
              <Bot className="w-12 h-12 mx-auto mb-2 text-on-surface-variant/30" />
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
        <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide mb-2">Datos de Marca</h3>
        <div className="bg-surface-container-high rounded-lg border border-outline-variant/20 p-4 space-y-2">
          {rows.map(([label, value], i) => (
            <div key={i} className="flex gap-2 text-body-md">
              <span className="text-on-surface-variant font-medium min-w-[80px]">{label}:</span>
              <span className="text-on-surface">{value}</span>
            </div>
          ))}
        </div>
        {bd.logo && (
          <div className="mt-3">
            <p className="text-body-md text-on-surface-variant font-medium mb-1">Logo:</p>
            <img src={bd.logo} alt="Logo" className="max-h-20 rounded border border-outline-variant/20 bg-surface p-1" />
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
          <div className="border border-outline-variant/20 rounded-lg overflow-hidden bg-surface">
            <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-high border-b border-outline-variant/20 text-body-md text-on-surface-variant">
              <Globe className="w-4 h-4" /> Vista previa web
            </div>
            <iframe srcDoc={file.content} className="w-full h-[500px] border-0" title="Preview" sandbox="allow-scripts" />
          </div>
        )
      case 'image':
        return file.file_url
          ? <img src={file.file_url} alt={file.name} className="max-w-full max-h-[500px] rounded-lg mx-auto" />
          : <div className="text-center text-on-surface-variant py-12"><ImageIcon className="w-16 h-16 mx-auto mb-2" /><p>{file.content || 'Sin imagen'}</p></div>
      case 'code':
        return (
          <div className="border border-outline-variant/20 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-high text-on-surface text-body-md font-mono border-b border-outline-variant/20">
              <Code2 className="w-4 h-4" /> {file.language || ext}
            </div>
            <pre className="p-4 bg-surface overflow-auto max-h-[500px] text-body-md text-on-surface"><code>{file.content}</code></pre>
          </div>
        )
      default:
        return (
          <div className="whitespace-pre-wrap text-on-surface leading-relaxed bg-surface-container-low rounded-lg border border-outline-variant/20 p-6 text-body-md">
            {file.content || 'Sin contenido disponible'}
          </div>
        )
    }
  }

  return (
    <div className="h-full flex flex-col bg-surface">
      <div className="flex items-center justify-between px-4 py-2 border-b border-outline-variant/20 bg-surface-container-low text-body-md">
        <div className="flex items-center gap-2">
          <span className="text-outline font-mono">{ext}</span>
          <span className="font-medium text-on-surface">{file.name}</span>
          {file.client_delivered && <span className="text-tertiary text-caption">✅ Entregado</span>}
        </div>
        <div className="flex items-center gap-2">
          {file.deliverable_type === 'html' && file.agent_id === 'developer' && !file.deployed && onDeploy && (
            <button
              onClick={() => onDeploy(file)}
              disabled={deploying}
              className="text-caption btn-primary px-3 py-1 flex items-center gap-1"
            >
              {deploying ? <Loader2 className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
              {deploying ? 'Publicando...' : 'Publicar Web'}
            </button>
          )}
          {file.file_url && file.deployed && (
            <a
              href={file.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-caption btn-secondary px-3 py-1 flex items-center gap-1"
            >
              <Globe className="w-3 h-3" /> Ver Web
            </a>
          )}
          {!file.client_delivered && file.status === 'approved' && onDeliver && (
            <button onClick={() => onDeliver(file.id)} className="text-caption btn-primary px-3 py-1">
              Entregar al Cliente
            </button>
          )}
          <span className={`px-2 py-0.5 rounded text-caption font-medium ${
            file.status === 'completed' ? 'badge-success' :
            file.status === 'approved' ? 'badge-info' : 'badge-warning'
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
              className="w-full min-h-[200px] font-mono text-body-md p-4 input-field resize-y"
            />
            <div>
              <label className="font-label-sm text-label-sm text-on-surface-variant mb-1 block">Link de pago Stripe:</label>
              <input
                value={editStripeLink}
                onChange={e => setEditStripeLink(e.target.value)}
                className="w-full text-body-md input-field"
                placeholder="https://buy.stripe.com/..."
              />
            </div>
            <div className="flex justify-end">
              <button onClick={onSaveQuote} disabled={saving} className="btn-primary text-caption px-4 py-2">
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
  const [pollingTimeout, setPollingTimeout] = useState(false)
  const pollingStartRef = useRef(null)
  const processingStepRef = useRef(false)

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

  // Procesa el siguiente agente en la cadena (una llamada = un agente)
  const processNextStep = async () => {
    if (processingStepRef.current) return
    processingStepRef.current = true
    try {
      const result = await startOrchestration(reqData.id)
      if (result?.error) {
        addLog('Sistema', `Error: ${result.error}`, 'error')
        await loadData()
      } else if (result?.done) {
        addLog('Sistema', 'Orquestación completada')
        pollingStartRef.current = null
      }
    } catch (err) {
      addLog('Sistema', `Error en paso: ${err.message}`, 'error')
    } finally {
      processingStepRef.current = false
    }
  }

  useEffect(() => { if (request?.id) { setReqData(request); loadData() } }, [request?.id])

  // Polling: cada 3s procesa siguiente agente + actualiza datos
  useEffect(() => {
    if (!request?.id || reqData.status !== 'in_progress') {
      setPollingTimeout(false)
      pollingStartRef.current = null
      return
    }
    if (!pollingStartRef.current) pollingStartRef.current = Date.now()
    setPollingTimeout(false)

    const tick = async () => {
      await processNextStep()
      await loadData()
      if (pollingStartRef.current && Date.now() - pollingStartRef.current > 180000) {
        setPollingTimeout(true)
      }
    }

    tick()
    const interval = setInterval(tick, 4000)
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
        const total = result.total || '?'
        addLog('Agents Orchestrator', `Plan generado. Paso ${result.step || 1}/${total} completado`)
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

  const handleResetStatus = async () => {
    await supabase.from('client_requests').update({ status: 'quote_sent' }).eq('id', reqData.id)
    setReqData(prev => ({ ...prev, status: 'quote_sent' }))
    setPollingTimeout(false)
    pollingStartRef.current = null
    addLog('Sistema', 'Estado reiniciado a quote_sent. Puedes intentar ejecutar agentes de nuevo.', 'info')
    await loadData()
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
    <div className="flex-1 min-h-0 flex flex-col rounded-lg overflow-hidden border border-outline-variant/20 bg-surface">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-surface-container-low border-b border-outline-variant/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <span className="font-semibold text-on-surface">{reqData.title}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={STATUS_COLORS[reqData.status] + ' text-caption'}>{STATUS_LABELS[reqData.status]}</span>
              <span className="text-caption text-on-surface-variant">{reqData.project_type}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {reqData.status === 'pending' && (
            <button
              onClick={handleGenerateQuote}
              disabled={quoting}
              className="btn-primary text-caption px-4 py-2"
            >
              {quoting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              {quoting ? 'Generando presupuesto...' : 'Generar Presupuesto'}
            </button>
          )}
          {reqData.status === 'quoting' && (
            <span className="flex items-center gap-1.5 text-caption font-medium text-secondary bg-secondary/10 px-3 py-1.5 rounded-lg border border-secondary/30">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generando presupuesto...
            </span>
          )}
          {reqData.status === 'quote_sent' && !isQuoteExpired && !reqData.quote_sent_at && (
            <button
              onClick={handleSendQuote}
              className="btn-primary text-caption px-4 py-2"
            >
              <Send className="w-3.5 h-3.5" />
              Enviar Presupuesto
            </button>
          )}
          {reqData.status === 'quote_sent' && !isQuoteExpired && reqData.quote_sent_at && (
            <button
              onClick={handleOrchestrate}
              disabled={orchestrating}
              className="btn-primary text-caption px-4 py-2"
            >
              {orchestrating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              {orchestrating ? 'Orquestando...' : 'Ejecutar Agentes'}
            </button>
          )}
          {reqData.status === 'quote_sent' && isQuoteExpired && (
            <button
              onClick={handleGenerateQuote}
              disabled={quoting}
              className="btn-primary text-caption px-4 py-2"
            >
              {quoting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              {quoting ? 'Generando nuevo presupuesto...' : 'Presupuesto vencido — Renovar'}
            </button>
          )}
          {reqData.status === 'in_progress' && (
            <span className="flex items-center gap-1.5 text-caption font-medium text-warning bg-warning/10 px-3 py-1.5 rounded-lg border border-warning/30">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Agentes trabajando...
            </span>
          )}
          {pollingTimeout && reqData.status === 'in_progress' && (
            <div className="flex items-center gap-2">
              <span className="text-caption font-medium text-error bg-error/10 px-3 py-1.5 rounded-lg border border-error/30">
                Posible timeout — Vercel puede haber cortado la ejecución
              </span>
              <button onClick={handleResetStatus} className="text-caption px-3 py-1.5 bg-surface-variant hover:bg-surface-container-hover rounded-lg font-medium text-on-surface-variant">
                Reintentar
              </button>
            </div>
          )}
          {reqData.status === 'completed' && (
            <span className="badge-success">Completado</span>
          )}
        </div>
      </div>

      {/* Main 3-panel layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left: File Explorer */}
        <div className="w-64 border-r border-outline-variant/20 bg-surface-container-high flex-shrink-0 overflow-hidden">
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
          <div className="flex items-center border-b border-outline-variant/20 bg-surface-container-low text-caption px-2">
            <button
              onClick={() => setActivePanel('editor')}
              className={`px-4 py-2 border-b-2 font-medium ${activePanel === 'editor' ? 'border-primary text-primary bg-surface' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
            >
              <FileText className="w-3.5 h-3.5 inline mr-1.5" /> Editor
            </button>
            <button
              onClick={() => setActivePanel('terminal')}
              className={`px-4 py-2 border-b-2 font-medium ${activePanel === 'terminal' ? 'border-primary text-primary bg-surface' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
            >
              <TerminalIcon className="w-3.5 h-3.5 inline mr-1.5" /> Terminal
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">
            {activePanel === 'editor' ? (
              <EditorPanel file={activeFile} onDeliver={handleDeliver} onDeploy={handleDeployWebsite} deploying={deploying} request={reqData} onSaveQuote={handleSaveQuote} saving={saving} editContent={editContent} setEditContent={setEditContent} editStripeLink={editStripeLink} setEditStripeLink={setEditStripeLink} />
            ) : (
              <OrchestrationTimeline logs={logs} />
            )}
          </div>
        </div>

        {/* Right: Chat Panel */}
        <div className="w-80 border-l border-outline-variant/20 flex-shrink-0 flex flex-col bg-surface">
          <div className="px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low text-body-md font-semibold text-on-surface flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" /> Chat con Agentes
          </div>
          <div className="flex-1 overflow-auto p-3 space-y-3">
            {messages.filter(m => m.agent_name !== 'Usuario' || true).slice(-30).map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-primary text-on-primary rounded-2xl rounded-br-sm' : 'bg-surface-container-high rounded-2xl rounded-bl-sm'} px-3 py-2 text-body-md`}>
                  <p className="font-medium text-caption mb-0.5 opacity-70">{msg.agent_name || 'Agente'}</p>
                   <p className="whitespace-pre-wrap text-body-md leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center text-on-surface-variant text-caption py-8">
                Los agentes aparecerán aquí cuando trabajen
              </div>
            )}
          </div>
          <div className="border-t border-outline-variant/20 p-3 flex gap-2">
            <input
              value={chatMsg}
              onChange={e => setChatMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChatSend()}
              className="flex-1 text-body-md input-field"
              placeholder="Instruye a los agentes..."
            />
            <button onClick={handleChatSend} disabled={chatSending} className="p-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {chatSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
